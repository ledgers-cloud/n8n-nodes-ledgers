import type { IExecuteFunctions, IRequestOptions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';

// 🔹 Map Dial Codes to ISO Country Codes
const dialCodeToCountryCode: Record<string, string> = {
	'+91': 'in',
	'+1': 'us',
	'+44': 'gb',
	'+65': 'sg',
	'+971': 'ae',
};

export async function execute(this: IExecuteFunctions) {
	const items = this.getInputData();
	const returnData: INodeExecutionData[] = [];

	const credentials = await this.getCredentials('ledgersApi');
	if (!credentials || !credentials.xApiKey || !credentials.email || !credentials.password) {
		throw new ApplicationError('Missing required credentials: xApiKey, email, or password', {
			level: 'warning',
		});
	}

	const { xApiKey, email, password, apiUrl } = credentials;
	const isIndia = String(apiUrl).includes('in-api.ledgers.cloud');
	const baseUrl = isIndia ? `${apiUrl}/v3` : apiUrl;

	// Validate operation-country match
	const indiaOps = ['contact', 'createContact', 'updateContact', 'addAddress', 'updateAddress', 'getContact', 'getAllContacts', 'catalog', 'createCatalog', 'updateCatalog', 'getCatalog', 'getAllCatalogs', 'sales', 'createInvoice', 'createQuote', 'viewInvoice', 'viewQuote', 'listInvoices', 'listQuotes', 'createReceipt', 'viewReceipt', 'listReceipts', 'purchase', 'createPurchaseInvoice', 'listPurchaseInvoices', 'viewPurchaseInvoice', 'createPurchaseOrder', 'listPurchaseOrders', 'viewPurchaseOrder', 'createVoucher', 'listVouchers', 'viewVoucher'];

	for (let i = 0; i < items.length; i++) {
		const operation = this.getNodeParameter('operation', i);
		const resource = this.getNodeParameter('resource', i);
		if (!indiaOps.includes(operation) && resource !== 'catalog' && resource !== 'sales' && resource !== 'contact' && resource !== 'purchase') {
			throw new ApplicationError('This operation/resource is only available for India API URL. Please update your credentials.');
		}
		// Catalog, Sales, and Purchase always allowed
	}

	// Step 1: Authenticate and get api_token once for all items
	let apiToken: string;
	try {
		const loginOptions: IRequestOptions = {
			method: 'POST',
			url: `${apiUrl}/login`,
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': xApiKey,
			},
			body: {
				email,
				password,
			},
			json: true,
		};

		const loginResponse = await this.helpers.request(loginOptions);

		if (loginResponse.status !== 200 || !loginResponse.api_token) {
			const errorMsg = loginResponse.errorMessage || 'Authentication failed. Check your credentials.';
			throw new ApplicationError(`Failed to login. ${errorMsg}`, {
				level: 'warning',
			});
		}

		apiToken = loginResponse.api_token;
	} catch (error) {
		throw new ApplicationError(`Login request failed: ${(error as Error).message}`, {
			level: 'warning',
		});
	}

	// Step 2: Proceed with operations for each item
	for (let i = 0; i < items.length; i++) {
		const continueOnFail = this.continueOnFail?.();
		try {
					const operation = this.getNodeParameter('operation', i);
					const options: IRequestOptions = {
							method: 'GET', // Default method
							url: '',
							headers: {
								'Content-Type': 'application/json',
								'x-api-key': xApiKey,
								'api-token': apiToken,
							},
							json: true,
							body: {}, // Default empty body
							qs: {}, // Default empty query string
					};

					if (operation === 'createContact') {
						const contactName = this.getNodeParameter('contactName', i);
						const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, any>;
						const mobileRaw = additionalFields.mobile;
						const selectedDialCode = additionalFields.mobile_country_code || '+91';
						const isoCode = dialCodeToCountryCode[selectedDialCode] || 'in';

						if (mobileRaw) {
							additionalFields.mobile = `${mobileRaw}|${isoCode}`;
						}

						additionalFields.mobile_country_code = selectedDialCode;

						// Auto-fill PAN from GSTIN if GSTIN is provided and PAN is not already set
						if (additionalFields.gstin && !additionalFields.pan) {
							const gstin = additionalFields.gstin.toString().trim();
							// GSTIN format: 2-digit state code + 10-digit PAN + 1-digit entity + 1-digit checksum + 1-alphabet
							// PAN is characters 3-12 (index 2-11) of GSTIN
							if (gstin.length === 15) {
								const extractedPAN = gstin.substring(2, 12);
								// Validate PAN format (5 letters + 4 digits + 1 letter)
								const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
								if (panPattern.test(extractedPAN)) {
									additionalFields.pan = extractedPAN;
								}
							}
						}

						// Extract billing address from fixedCollection
						let billingAddress: any = {};
						if (additionalFields.billing_address) {
							const b = additionalFields.billing_address;
							billingAddress = {
								billing_address1: b.billing_address1 ?? '',
								billing_address2: b.billing_address2 ?? '',
								location: b.billing_city ?? '',
								state: b.billing_state ?? '',
								country: b.billing_country ?? '',
								email: b.billing_email ?? '',
								gstin: b.billing_gstin ?? '',
								mobile: b.billing_mobile ?? '',
								pincode: b.billing_pincode ?? '',
							};
						}

						// Extract shipping address from fixedCollection
						let shippingAddress: any = {};
						if (additionalFields.shipping_address) {
							const s = additionalFields.shipping_address;
							shippingAddress = {
								shipping_address1: s.shipping_address1 ?? '',
								shipping_address2: s.shipping_address2 ?? '',
								location: s.shipping_city ?? '',
								state: s.shipping_state ?? '',
								country: s.shipping_country ?? '',
								email: s.shipping_email ?? '',
								gstin: s.shipping_gstin ?? '',
								mobile: s.shipping_mobile ?? '',
								pincode: s.shipping_pincode ?? '',
							};
						}

						// Remove address fields from additionalFields to avoid duplication
						delete additionalFields.billing_address;
						delete additionalFields.shipping_address;

						options.method = 'POST';
						options.url = `${baseUrl}/contact`;
						options.body = {
							contact_name: contactName,
							...additionalFields,
							...(Object.keys(billingAddress).length ? { billing_address: [billingAddress] } : {}),
							...(Object.keys(shippingAddress).length ? { shipping_address: [shippingAddress] } : {}),
						};
					} else if (operation === 'updateContact') {
						const contactId = this.getNodeParameter('contactId', i);
						const updateFields = this.getNodeParameter('contactAdditionalFields', i) as Record<
							string,
							string
						>;

						const body: Record<string, any> = { contact_id: contactId };

						for (const [key, value] of Object.entries(updateFields)) {
							if (value !== undefined && value !== null) {
								if (key === 'mobile' && value !== '') {
									const selectedDialCode = updateFields.mobile_country_code || '+91';
									const isoCode = dialCodeToCountryCode[selectedDialCode] || 'in';
									body[key] = `${value}|${isoCode}`;
									body.mobile_country_code = selectedDialCode;
								} else {
									body[key] = value;
								}
							}
						}

						options.method = 'PUT';
						options.url = `${baseUrl}/contact`;
						options.body = body;
					} else if (operation === 'addAddress') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const addressFields = this.getNodeParameter('addressFields', i) as IDataObject;
						const addressType = this.getNodeParameter('addressType', i, 'billing') as string;

						const getContactOptions: IRequestOptions = {
							method: 'GET',
							url: `${baseUrl}/contact/${contactId}`,
							headers: options.headers,
							json: true,
						};
						const contactResponse = await this.helpers.request(getContactOptions);
						if (!contactResponse.data) {
							throw new ApplicationError(`Contact with ID ${contactId} not found.`, { itemIndex: i });
						}
						const contactData = contactResponse.data;

						const body: IDataObject = {};
						if (addressType === 'billing' || addressType === 'both') {
							let newAddressObject: IDataObject = {
								billing_address1: addressFields.address1 ?? '',
								billing_address2: addressFields.address2 ?? '',
								location: addressFields.location ?? '',
								state: addressFields.state ?? '',
								country: addressFields.country ?? '',
								pincode: addressFields.pincode ?? '',
								email: addressFields.email ?? '',
								gstin: addressFields.gstin ?? '',
								mobile: addressFields.mobile ?? '',
							};
							const existingBilling = contactData.billing_address || [];
							body.billing_address = [...existingBilling, newAddressObject];
						}
						if (addressType === 'shipping' || addressType === 'both') {
							let newAddressObject: IDataObject = {
								shipping_address1: addressFields.address1 ?? '',
								shipping_address2: addressFields.address2 ?? '',
								location: addressFields.location ?? '',
								state: addressFields.state ?? '',
								country: addressFields.country ?? '',
								pincode: addressFields.pincode ?? '',
								email: addressFields.email ?? '',
								gstin: addressFields.gstin ?? '',
								mobile: addressFields.mobile ?? '',
							};
							const existingShipping = contactData.shipping_address || [];
							body.shipping_address = [...existingShipping, newAddressObject];
						}

						body.contact_id = contactId;

						options.method = 'PUT';
						options.url = `${baseUrl}/contact`;
						options.body = body;
					} else if (operation === 'updateAddress') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const addressType = this.getNodeParameter('addressType', i, 'billing') as string;
						const addressSelector = this.getNodeParameter('addressSelector', i, 0) as number;
						const updateFields = this.getNodeParameter('addressUpdateFields', i, {}) as Record<string, any>;

						const getContactOptions: IRequestOptions = {
							method: 'GET',
							url: `${baseUrl}/contact/${contactId}`,
							headers: options.headers,
							json: true,
						};
						const contactResponse = await this.helpers.request(getContactOptions);

						if (!contactResponse.data) {
							throw new ApplicationError(`Contact with ID ${contactId} not found.`, { itemIndex: i });
						}
						const contactData = contactResponse.data;
						const addressKey = addressType === 'billing' ? 'billing_address' : 'shipping_address';
						const addresses = contactData[addressKey] as any[];

						if (!addresses || addressSelector >= addresses.length) {
							throw new ApplicationError(
								`Invalid address index: ${addressSelector}. Contact only has ${
									addresses?.length ?? 0
								} ${addressType} addresses.`,
								{ itemIndex: i },
							);
						}

						const selectedAddress = addresses[addressSelector];

						// Start with the existing address data and only update fields that were provided
						const updatedAddress: IDataObject = {
							...selectedAddress, // Keep all existing data including the id
						};

						// Only update fields that were actually provided by the user
						if (updateFields.address1 !== undefined) {
							// Map address1 to the correct field based on address type
							if (addressType === 'billing') {
								updatedAddress.billing_address1 = updateFields.address1;
							} else {
								updatedAddress.shipping_address1 = updateFields.address1;
							}
						}
						if (updateFields.address2 !== undefined) {
							// Map address2 to the correct field based on address type
							if (addressType === 'billing') {
								updatedAddress.billing_address2 = updateFields.address2;
							} else {
								updatedAddress.shipping_address2 = updateFields.address2;
							}
						}
						if (updateFields.location !== undefined) {
							updatedAddress.location = updateFields.location;
							updatedAddress.city = updateFields.location;
						}
						if (updateFields.state !== undefined) {
							updatedAddress.state = updateFields.state;
						}
						if (updateFields.country !== undefined) {
							updatedAddress.country = updateFields.country;
						}
						if (updateFields.pincode !== undefined) {
							updatedAddress.pincode = updateFields.pincode;
						}
						if (updateFields.email !== undefined) {
							updatedAddress.email = updateFields.email;
						}
						if (updateFields.gstin !== undefined) {
							updatedAddress.gstin = updateFields.gstin;
						}
						if (updateFields.mobile !== undefined) {
							updatedAddress.mobile = updateFields.mobile;
						}

						// Create updated addresses array with the selected address updated
						const updatedAddresses = addresses.map((addr, index) =>
							index === addressSelector ? updatedAddress : addr,
						);

						const body: IDataObject = {
							contact_id: contactId,
							[addressKey]: updatedAddresses,
						};

						options.method = 'PUT';
						options.url = `${baseUrl}/contact`;
						options.body = body;
					} else if (operation === 'getContact') {
						const contactId = this.getNodeParameter('contactId', i);
						options.method = 'GET';
						options.url = `${baseUrl}/contact/${contactId}`;
					} else if (operation === 'getAllContacts') {
						const perPageRaw = this.getNodeParameter('perPage', i);
						const perPage = typeof perPageRaw === 'object' ? '' : String(perPageRaw);
						const searchType = String(this.getNodeParameter('searchType', i));
						let search_term = '';
						if (searchType === 'name') {
							const searchTermRaw = this.getNodeParameter('searchTerm', i) ?? '';
							search_term = typeof searchTermRaw === 'object' ? '' : String(searchTermRaw);
						}
						options.method = 'GET';
						options.url = `${baseUrl}/contact?perpage=${perPage}&search_term=${search_term ?? ''}&sort=desc&field=id`;
					} else if (operation === 'createCatalog') {
						const catalogName = this.getNodeParameter('catalogName', i);
						const price = this.getNodeParameter('price', i);
						const catalogType = this.getNodeParameter('catalog_type', i);
						const itemType = this.getNodeParameter('item_type', i);
						const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, any>;
						const gst_type = additionalFields.gst_type ?? 'inclusive of gst';
						const gst_rate = additionalFields.gst_rate ?? '5%';
						const non_taxable = additionalFields.non_taxable != 0 ? additionalFields.non_taxable : '';
						const sku = additionalFields.sku ?? '';
						const unit = additionalFields.unit ?? 'UNT-UNITS';
						const description = additionalFields.description ?? '';
						// 🔎 Validate price
						if (price === undefined || price === null || price === '' || price === 0 || price === '0') {
							throw new ApplicationError('Price must be a number greater than zero.');
						}
						// Handle cess_type and cess_value with validation
						let cess_type_api, cess_api;
						if (additionalFields.cess_type) {
							// If cess type is selected, cess value must be entered
							if (additionalFields.cess_value === undefined || additionalFields.cess_value === null || additionalFields.cess_value === '') {
								throw new ApplicationError('Cess value is required when cess type is selected.');
							}

							const cessValue = Number(additionalFields.cess_value);

							if (additionalFields.cess_type === 'flat') {
								// For flat cess, accept any positive number
								if (cessValue < 0) {
									throw new ApplicationError('Cess value must be a positive number for flat cess type.');
								}
								cess_type_api = 'flat_value';
								cess_api = cessValue;
							} else if (additionalFields.cess_type === 'percentage') {
								// For percentage cess, value must be between 1-100
								if (cessValue < 1 || cessValue > 100) {
									throw new ApplicationError('Cess value must be between 1 and 100 for percentage cess type.');
								}
								cess_type_api = 'percentage';
								cess_api = cessValue;
							}
							// Remove from additionalFields to avoid duplication
							delete additionalFields.cess_type;
							delete additionalFields.cess_value;
						}
						// Prepare variants array
						const variants = [{
							variant_name: catalogName,
							price,
							gst_type,
							non_taxable,
							currency: 'INR',
							sku_id: sku,
							variant_description: description,
						}];
						options.method = 'POST';
						options.url = `${baseUrl}/catalog`;
						options.body = {
							item_name: catalogName,
							catalog_type: catalogType,
							gst_rate: gst_rate,
							item_type: itemType,
							units: unit,
							description: description,
							variants: variants,
							...(additionalFields.coa_account ? (() => {
								let expense_id = '', expense_type = '';
								try {
									const parsed = JSON.parse(additionalFields.coa_account);
									expense_id = parsed.id;
									expense_type = parsed.name;
								} catch {}
								return { expense_id, expense_type };
							})() : {}),
							...(cess_type_api && cess_api !== undefined ? { cess_type: cess_type_api, cess: cess_api } : {}),
						};
					} else if (operation === 'updateCatalog') {
						const catalogId = this.getNodeParameter('catalogId', i);
						const updateFields = this.getNodeParameter('catalogUpdateFields', i) as Record<string, any>;
						// Always include catalog_id
						const body: Record<string, any> = { catalog_id: catalogId };
						// Handle cess_type and cess_value with validation
						let cess_type_api, cess_api;
						if (updateFields.cess_type) {
							// If cess type is selected, cess value must be entered
							if (updateFields.cess_value === undefined || updateFields.cess_value === null || updateFields.cess_value === '') {
								throw new ApplicationError('Cess value is required when cess type is selected.');
							}

							const cessValue = Number(updateFields.cess_value);

							if (updateFields.cess_type === 'flat') {
								// For flat cess, accept any positive number
								if (cessValue < 0) {
									throw new ApplicationError('Cess value must be a positive number for flat cess type.');
								}
								cess_type_api = 'flat_value';
								cess_api = cessValue;
							} else if (updateFields.cess_type === 'percentage') {
								// For percentage cess, value must be between 1-100
								if (cessValue < 1 || cessValue > 100) {
									throw new ApplicationError('Cess value must be between 1 and 100 for percentage cess type.');
								}
								cess_type_api = 'percentage';
								cess_api = cessValue;
							}
							delete updateFields.cess_type;
							delete updateFields.cess_value;
						}

						// Add only provided fields to the body
						for (const [key, value] of Object.entries(updateFields)) {
							if (value !== undefined && value !== null && value !== '') {
								if (key === 'unit') {
									body.units = value;
								} else if (key === 'hsn_sac') {
									body.hsn_sac = value;
								} else if (key === 'coa_account') {
									let expense_id = '', expense_type = '';
									try {
										const parsed = JSON.parse(value);
										expense_id = parsed.id;
										expense_type = parsed.name;
									} catch {}
									body.expense_id = expense_id;
									body.expense_type = expense_type;
								} else if (key === 'status') {
									body.status = value;
								} else {
									body[key] = value;
								}
							}
						}
						if (cess_type_api && cess_api !== undefined) {
							body.cess_type = cess_type_api;
							body.cess = cess_api;
						}
						options.method = 'PUT';
						options.url = `${baseUrl}/catalog`;
						options.body = body;
					} else if (operation === 'updateVariant'){
						const catalogId = this.getNodeParameter('catalogId', i);
						const variantId = this.getNodeParameter('variantId', i);
						const updateFields = this.getNodeParameter('catalogUpdateVariantFields', i) as Record<string, any>;

						// Create a variant object with only the updated fields
						const variantUpdate: Record<string, any> = {
							variant_id: variantId,
						};

						// Only include fields that are provided
						if (updateFields.variant_name !== undefined) variantUpdate.variant_name = updateFields.variant_name;
						if (updateFields.variant_price !== undefined) variantUpdate.price = updateFields.variant_price;
						if (updateFields.variant_gst_type !== undefined) variantUpdate.gst_type = updateFields.variant_gst_type;
						if (updateFields.variant_non_taxable !== undefined) variantUpdate.non_taxable = updateFields.variant_non_taxable;
						if (updateFields.variant_sku !== undefined) variantUpdate.sku_id = updateFields.variant_sku;
						if (updateFields.variant_description !== undefined) variantUpdate.variant_description = updateFields.variant_description;
						if (updateFields.variant_status !== undefined) variantUpdate.status = updateFields.variant_status;

						options.method = 'PUT';
						options.url = `${baseUrl}/catalog`;
						options.body = {
							catalog_id: catalogId,
							variants: [variantUpdate],
						};
					} else if (operation === 'getCatalog') {
						const catalogId = this.getNodeParameter('catalogId', i);
						options.method = 'GET';
						options.url = `${baseUrl}/catalog/${catalogId}`;
					} else if (operation === 'getAllCatalogs') {
						const perPageRaw = this.getNodeParameter('perPage', i);
						const perPage = typeof perPageRaw === 'object' ? '' : String(perPageRaw);
						const searchType = String(this.getNodeParameter('searchType', i));
						let search_term = '';
						if (searchType === 'search_term') {
							const searchTermRaw = this.getNodeParameter('searchTerm', i) ?? '';
							search_term = typeof searchTermRaw === 'object' ? '' : String(searchTermRaw);
						}
						options.method = 'GET';
						options.url = `${baseUrl}/catalog?perpage=${perPage}&search_term=${search_term}&field=id&sort=desc`;
					} else if (operation === 'addVariant') {
						const catalogId = this.getNodeParameter('catalogId', i);
						const variant_name = this.getNodeParameter('variant_name', i);
						const variant_price = this.getNodeParameter('variant_price', i);
						const additionalFields = this.getNodeParameter('variantAdditionalFields', i) as Record<string, any>;
						// 1. Fetch catalog details to get current variants
						const getOptions: IRequestOptions = {
							method: 'GET',
							url: `${baseUrl}/catalog/${catalogId}`,
							headers: {
								'Content-Type': 'application/json',
								'x-api-key': xApiKey,
								'api-token': apiToken,
							},
							json: true,
						};
						const catalogResponse = await this.helpers.request(getOptions);
						const variants = (catalogResponse.data && catalogResponse.data[0] && Array.isArray(catalogResponse.data[0].product_variants)) ? catalogResponse.data[0].product_variants : [];

						// 2. Find max id
						let maxId = 0;
						for (const v of variants) {
							const idNum = Number(v.id);
							if (!isNaN(idNum) && idNum > maxId) maxId = idNum;
						}
						const newId = String(maxId + 1);

						// 3. Build new variant
						const newVariant: Record<string, any> = {
							variant_id: newId,
							variant_name: variant_name,
							price: variant_price,
							gst_type: additionalFields.variant_gst_type ?? 'inclusive of gst',
							non_taxable: additionalFields.variant_non_taxable != 0 ? additionalFields.variant_non_taxable : '',
							sku_id: additionalFields.variant_sku ?? '',
							variant_description: additionalFields.variant_description ?? '',
							currency: 'INR',
						};


						// 5. Update catalog with new variants array
						options.method = 'PUT';
						options.url = `${baseUrl}/catalog`;
						options.body = {
							catalog_id: catalogId,
							variants: [newVariant],
						};
					} else if (operation === 'createInvoice') {
						const contact = this.getNodeParameter('contact', i) as IDataObject;
						const items = this.getNodeParameter('items.item', i) as IDataObject[];
						const seller_branch_id = this.getNodeParameter('seller_branch_id', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						// Validate required contact fields
						if (!contact.name || contact.name === '') {
							throw new ApplicationError('Contact Name is required for creating invoice', { level: 'warning' });
						}
						if (!contact.id || contact.id === '') {
							throw new ApplicationError('Contact ID is required for creating invoice', { level: 'warning' });
						}

						// Validate required item fields
						if (!items || items.length === 0) {
							throw new ApplicationError('At least one item is required for creating invoice', { level: 'warning' });
						}

						for (let j = 0; j < items.length; j++) {
							const item = items[j];
							if (!item.name || item.name === '') {
								throw new ApplicationError(`Item Name is required for item`, { level: 'warning' });
							}
							if (!item.pid || item.pid === '' || item.pid === 0) {
								throw new ApplicationError(`Item ID is required for item`, { level: 'warning' });
							}
							if (!item.item_code || item.item_code === '') {
								throw new ApplicationError(`SAC/HSN Code is required for item`, { level: 'warning' });
							}
							if (!item.variant_id || item.variant_id === '' || item.variant_id === 0) {
								throw new ApplicationError(`Variant ID is required for item`, { level: 'warning' });
							}
							if(!item.rate || item.rate === '' || item.rate === 0) {
								throw new ApplicationError(`Rate is required for item`, { level: 'warning' });
							}
							if(typeof item.rate === 'number' && item.rate < 0) {
								throw new ApplicationError(`Rate cannot be negative for item`, { level: 'warning' });
							}
							if(!item.quantity || item.quantity === '' || item.quantity === 0) {
								throw new ApplicationError(`Quantity is required for item`, { level: 'warning' });
							}
							if(!item.item_type || item.item_type === '') {
								throw new ApplicationError(`Item Type is required for item`, { level: 'warning' });
							}
							if(!item.item_code || item.item_code === '') {
								throw new ApplicationError(`Item Code is required for item`, { level: 'warning' });
							}
							if(!item.taxable_per_item || item.taxable_per_item === '' || item.taxable_per_item === 0) {
								throw new ApplicationError(`Taxable Per Item is required for item`, { level: 'warning' });
							}
							if(!item.gst_rate || item.gst_rate === '') {
								throw new ApplicationError(`GST Rate is required for item`, { level: 'warning' });
							}
							if(item.rate && item.non_taxable_per_item) {
								if(item.rate < item.non_taxable_per_item) {
									throw new ApplicationError(`Non-Taxable value cannot be greater than Rate for item`, { level: 'warning' });
								}
							}
						}

						// Format invoice date to YYYY-MM-DD format (date only, no time)
						if (additionalFields.invoice_date) {
							const invoiceDate = new Date(additionalFields.invoice_date as string);
							additionalFields.invoice_date = invoiceDate.toISOString().split('T')[0];
						}

						if(additionalFields.validity_date) {
							const validityDate = new Date(additionalFields.validity_date as string);
							additionalFields.validity_date = validityDate.toISOString().split('T')[0];
						}

						const body: IDataObject = {
							contact,
							items,
							seller_branch_id,
							...additionalFields,
						};

						options.method = 'POST';
						options.url = `${baseUrl}/invoice`;
						options.body = body;
					} else if (operation === 'viewInvoice') {
						const invoiceId = this.getNodeParameter('invoiceId', i) as string;
						options.method = 'GET';
						options.url = `${baseUrl}/invoice/${invoiceId}`;
					} else if (operation === 'listInvoices') {
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const pageSize = this.getNodeParameter('page_size', i) as number;

						// Validate date range - both from and to dates must be provided if either is selected
						if ((filters.date_from && !filters.date_to) || (!filters.date_from && filters.date_to)) {
							throw new ApplicationError('Both Date From and Date To must be provided for date range filtering', { level: 'warning' });
						}

						if (filters.date_from) {
							const dateFrom = new Date(filters.date_from as string);
							filters.date_from = dateFrom.toISOString().split('T')[0];
						}

						if(filters.date_to) {
							const dateTo = new Date(filters.date_to as string);
							filters.date_to = dateTo.toISOString().split('T')[0];
						}

						options.method = 'GET';
						options.url = `${baseUrl}/invoice?page_size=${pageSize ?? 5}&filter.date_from=${filters.date_from ?? ''}&filter.date_to=${filters.date_to ?? ''}&filter.payment_status=${filters.payment_status ?? ''}&filter.contact_id=${filters.contact_id ?? ''}`;
					} else if (operation === 'createQuote') {
						const contact = this.getNodeParameter('contact', i) as IDataObject;
						const items = this.getNodeParameter('items.item', i) as IDataObject[];
						const seller_branch_id = this.getNodeParameter('seller_branch_id', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;

						// Validate required contact fields
						if (!contact.name || contact.name === '') {
							throw new ApplicationError('Contact Name is required for creating quote', { level: 'warning' });
						}
						if (!contact.id || contact.id === '') {
							throw new ApplicationError('Contact ID is required for creating quote', { level: 'warning' });
						}

						// Validate required item fields
						if (!items || items.length === 0) {
							throw new ApplicationError('At least one item is required for creating quote', { level: 'warning' });
						}

						for (let j = 0; j < items.length; j++) {
							const item = items[j];
							if (!item.name || item.name === '') {
								throw new ApplicationError(`Item Name is required for item`, { level: 'warning' });
							}
							if (!item.pid || item.pid === '' || item.pid === 0) {
								throw new ApplicationError(`Item ID is required for item`, { level: 'warning' });
							}
							if (!item.item_code || item.item_code === '') {
								throw new ApplicationError(`SAC/HSN Code is required for item`, { level: 'warning' });
							}
							if (!item.variant_id || item.variant_id === '' || item.variant_id === 0) {
								throw new ApplicationError(`Variant ID is required for item`, { level: 'warning' });
							}
							if(!item.rate || item.rate === '' || item.rate === 0) {
								throw new ApplicationError(`Rate is required for item`, { level: 'warning' });
							}
							if(typeof item.rate === 'number' && item.rate < 0) {
								throw new ApplicationError(`Rate cannot be negative for item`, { level: 'warning' });
							}
							if(!item.quantity || item.quantity === '' || item.quantity === 0) {
								throw new ApplicationError(`Quantity is required for item`, { level: 'warning' });
							}
							if(!item.item_type || item.item_type === '') {
								throw new ApplicationError(`Item Type is required for item`, { level: 'warning' });
							}
							if(!item.item_code || item.item_code === '') {
								throw new ApplicationError(`Item Code is required for item`, { level: 'warning' });
							}
							if(!item.taxable_per_item || item.taxable_per_item === '' || item.taxable_per_item === 0) {
								throw new ApplicationError(`Taxable Per Item is required for item`, { level: 'warning' });
							}
							if(!item.gst_rate || item.gst_rate === '') {
								throw new ApplicationError(`GST Rate is required for item`, { level: 'warning' });
							}
							if(item.rate && item.non_taxable_per_item) {
								if(item.rate < item.non_taxable_per_item) {
									throw new ApplicationError(`Non-Taxable value cannot be greater than Rate for item`, { level: 'warning' });
								}
							}
						}

						// Format dates to YYYY-MM-DD format (date only, no time)
						if (additionalFields.estimate_date) {
							const estimateDate = new Date(additionalFields.estimate_date as string);
							additionalFields.estimate_date = estimateDate.toISOString().split('T')[0];
						}
						if (additionalFields.validity_date) {
							const validityDate = new Date(additionalFields.validity_date as string);
							additionalFields.validity_date = validityDate.toISOString().split('T')[0];
						}

						const body: IDataObject = {
							contact,
							items,
							seller_branch_id,
							...additionalFields,
						};

						options.method = 'POST';
						options.url = `${baseUrl}/estimate`;
						options.body = body;
					} else if (operation === 'viewQuote') {
						const quoteId = this.getNodeParameter('quoteId', i) as string;
						options.method = 'GET';
						options.url = `${baseUrl}/estimate/${quoteId}`;
					} else if (operation === 'listQuotes') {
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const pageSize = this.getNodeParameter('page_size', i) as number;

						// Validate date range - both from and to dates must be provided if either is selected
						if ((filters.date_from && !filters.date_to) || (!filters.date_from && filters.date_to)) {
							throw new ApplicationError('Both Date From and Date To must be provided for date range filtering', { level: 'warning' });
						}

						if (filters.date_from) {
							const dateFrom = new Date(filters.date_from as string);
							filters.date_from = dateFrom.toISOString().split('T')[0];
						}

						if(filters.date_to) {
							const dateTo = new Date(filters.date_to as string);
							filters.date_to = dateTo.toISOString().split('T')[0];
						}

						options.method = 'GET';
						options.url = `${baseUrl}/estimate?&page_size=${pageSize ?? 5}&filter.date_from=${filters.date_from ?? ''}&filter.date_to=${filters.date_to ?? ''}&filter.payment_status=${filters.payment_status ?? ''}&filter.contact_id=${filters.contact_id ?? ''}`;
					} else if (operation === 'createReceipt') {
						const contact = this.getNodeParameter('contact', i) as IDataObject;
						const amount = this.getNodeParameter('amount', i) as string;
						const paymentMethod = this.getNodeParameter('payment_method', i) as string;
						const sellerBranchId = this.getNodeParameter('seller_id', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
						const coaIdRaw = additionalFields.coa_id;
						let coaId;
						if (typeof coaIdRaw === 'string' && coaIdRaw.startsWith('{')) {
							try {
								const parsed = JSON.parse(coaIdRaw);
								coaId = parsed.id;
							} catch {
								coaId = coaIdRaw;
							}
						} else if (typeof coaIdRaw === 'object' && coaIdRaw !== null) {
							coaId = (coaIdRaw as any).id;
						} else {
							coaId = coaIdRaw;
						}

						// Validate required fields
						if (!contact.name || contact.name === '') {
							throw new ApplicationError('Contact Name is required for creating receipt', { level: 'warning' });
						}
						if (!contact.id || contact.id === '') {
							throw new ApplicationError('Contact ID is required for creating receipt', { level: 'warning' });
						}
						if (!amount || amount === '' || parseFloat(amount) <= 0) {
							throw new ApplicationError('Amount is required and must be greater than 0 for creating receipt', { level: 'warning' });
						}
						if (!paymentMethod || paymentMethod === '') {
							throw new ApplicationError('Payment Method is required for creating receipt', { level: 'warning' });
						}

						if (!coaId || coaId === '') {
							throw new ApplicationError('Expense Type (COA ID) is required for creating receipt', { level: 'warning' });
						}

						// Format receipt date to YYYY-MM-DD format (date only, no time)
						if (additionalFields.receipt_date) {
							const receiptDate = new Date(additionalFields.receipt_date as string);
							additionalFields.receipt_date = receiptDate.toISOString().split('T')[0];
						}

						// Build the receipt body based on the JSON structure
						const body: IDataObject = {
							contact,
							amount: parseFloat(amount),
							payment_method: paymentMethod,
							coa_id: parseInt(coaId),
						};

						if(additionalFields.transaction_number) {
							body.transaction_number = additionalFields.transaction_number;
						}

						// Fetch branch data if seller_branch_id is provided
						if (sellerBranchId && sellerBranchId.trim() !== '') {
							try {
								// Fetch branch data directly
								const branchOptions: IRequestOptions = {
									method: 'GET',
									url: `${baseUrl}/business/branch/${sellerBranchId}`,
									headers: {
										'Content-Type': 'application/json',
										'x-api-key': xApiKey,
										'api-token': apiToken,
									},
									json: true,
								};

								const branchResponse = await this.helpers.request(branchOptions);
								if (branchResponse.status === 200 && branchResponse.data && Array.isArray(branchResponse.data) && branchResponse.data.length > 0) {
									const branchData = branchResponse.data[0];
									// Add seller_info with branch data
									body.seller_info = {
										business_name: branchData.branch_name || '',
										gstin: branchData.gstin || '',
										branch_id: branchData.branch_id || '',
										address: {
											address_line_1: branchData.address?.line1 || '',
											address_line_2: branchData.address?.line2 || '',
											city: branchData.address?.city || '',
											state: branchData.address?.state || '',
											country: branchData.address?.country || '',
											pincode: branchData.address?.pincode || ''
										}
									};
								}
							} catch (error) {
							}
						}

						// Add optional fields if provided
						if (additionalFields.billing_address) {
							body.billing_address = additionalFields.billing_address;
						}
						if (additionalFields.shipping_address) {
							body.shipping_address = additionalFields.shipping_address;
						}
						if (additionalFields.currency) {
							body.currency = additionalFields.currency;
						}
						if (additionalFields.receipt_number) {
							body.receipt_number = additionalFields.receipt_number;
						}
						if (additionalFields.receipt_date) {
							body.receipt_date = additionalFields.receipt_date;
						}
						if (additionalFields.notes) {
							body.notes = additionalFields.notes;
						}
						if (additionalFields.transaction_number) {
							body.transaction_number = additionalFields.transaction_number;
						}
						if (additionalFields.collected_by) {
							body.collected_by = additionalFields.collected_by;
						}
						if (additionalFields.reconcile) {
							body.reconcile = [additionalFields.reconcile];
						}
						if (additionalFields.notification !== undefined) {
							body.notification = additionalFields.notification === 'Yes' ? 1 : 0;
						}
						if (additionalFields.currency_info) {
							body.currency_info = additionalFields.currency_info;
						}

						options.method = 'POST';
						options.url = `${baseUrl}/receipt`;
						options.body = body;
					} else if (operation === 'listReceipts') {
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						const pageSize = this.getNodeParameter('page_size', i) as number;

						if ((filters.date_from && !filters.date_to) || (!filters.date_from && filters.date_to)) {
							throw new ApplicationError('Both Date From and Date To must be provided for date range filtering', { level: 'warning' });
						}

						if (filters.date_from) {
							const dateFrom = new Date(filters.date_from as string);
							filters.date_from = dateFrom.toISOString().split('T')[0];
						}

						if(filters.date_to) {
							const dateTo = new Date(filters.date_to as string);
							filters.date_to = dateTo.toISOString().split('T')[0];
						}

						options.method = 'GET';
						options.url = `${baseUrl}/receipt?page_size=${pageSize ?? 5}&filter.date_from=${filters.date_from ?? ''}&filter.date_to=${filters.date_to ?? ''}&filter.recon_status=${filters.recon_status ?? ''}&filter.contact_id=${filters.contact_id ?? ''}&filter.search=${filters.search ?? ''}`;
					} else if (operation === 'viewReceipt') {
						const receiptId = this.getNodeParameter('receiptId', i) as string;
						options.method = 'GET';
						options.url = `${baseUrl}/receipt/${receiptId}`;
					} else if(operation === 'createPurchaseInvoice') {
						const purchaseNumber = this.getNodeParameter('purchase_number', i) as string;
						const purchaseOrderId = this.getNodeParameter('purchase_order_id', i) as string;
						const dueDateRaw = this.getNodeParameter('due_date', i) as string;
						const purchaseDateRaw = this.getNodeParameter('pur_inv_date', i) as string;
						const purchaseDate = new Date(purchaseDateRaw as string);
						const purchaseDateString = purchaseDate.toISOString().split('T')[0];
						const dueDate = new Date(dueDateRaw as string);
						const dueDateString = dueDate.toISOString().split('T')[0];
						const taxType = this.getNodeParameter('tax_id1_type', i) as string;
						const contactId = this.getNodeParameter('contact_id', i) as string;
						const businessBranchId = this.getNodeParameter('business_branch_id', i) as string;
						const sellerTaxId = this.getNodeParameter('seller_tax_id', i) as string;
						const notes = this.getNodeParameter('notes', i) as string;
						const billingAddress = this.getNodeParameter('billing_address', i) as IDataObject;
						const items = this.getNodeParameter('items.item', i, []) as IDataObject[];
						const sameAddress = this.getNodeParameter('same_address', i) as boolean;
						// const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
						const body: IDataObject = {
							purchase_number: purchaseNumber,
							purchase_order_id: purchaseOrderId,
							due_date: dueDateString,
							pur_inv_date: purchaseDateString,
							tax_id1_type: taxType,
							contact_id: contactId,
							business_branch_id: businessBranchId,
							notes: notes,
							seller_tax_id: sellerTaxId,
							status: 1,
							type: 1,
							data_source: 2,
						}
						// Fetch branch data if seller_branch_id is provided
						if (businessBranchId && businessBranchId.trim() !== '') {
							try {
								// Fetch branch data directly
								const branchOptions: IRequestOptions = {
									method: 'GET',
									url: `${baseUrl}/business/branch/${businessBranchId}`,
									headers: {
										'Content-Type': 'application/json',
										'x-api-key': xApiKey,
										'api-token': apiToken,
									},
									json: true,
								};

								const branchResponse = await this.helpers.request(branchOptions);
								if (branchResponse.status === 200 && branchResponse.data && Array.isArray(branchResponse.data) && branchResponse.data.length > 0) {
									const branchData = branchResponse.data[0];
									// Add seller_info with branch data
									body.business_info = {
										name: branchData.branch_name || '',
										tax_no: branchData.gstin || '',
										id: branchData.branch_id || '',
										mobile: branchData.phone || '',
										email: branchData.email || '',
										addr1: branchData.address?.line1 || '',
										addr2: branchData.address?.line2 || '',
										city: branchData.address?.city || '',
										state: branchData.address?.state || '',
										country: branchData.address?.country || '',
										pincode: branchData.address?.pincode || '',
										pos: branchData.address?.state
									};
								}
							} catch (error) {
							}
						}
						body.billing_details = {
							"bill_addr1": billingAddress.bill_addr1,
							"bill_addr2": billingAddress.bill_addr2,
							"bill_city": billingAddress.bill_city,
							"bill_company": billingAddress.bill_company_name,
							"bill_country": billingAddress.bill_country,
							"bill_pincode": billingAddress.bill_pincode,
							"bill_state": billingAddress.bill_state,
						}
						if(sameAddress) {
							(body.billing_details as any).bill_ship_address_same = 1;
							body.shipping_details = {
								"ship_addr1": billingAddress.bill_addr1,
								"ship_addr2": billingAddress.bill_addr2,
								"ship_city": billingAddress.bill_city,
								"ship_company": billingAddress.bill_company_name,
								"ship_country": billingAddress.bill_country,
								"ship_pincode": billingAddress.bill_pincode,
								"ship_state": billingAddress.bill_state,
							}
						} else {
							const shippingAddress = this.getNodeParameter('shipping_address', i) as IDataObject;
							body.shipping_details = {
								"ship_addr1": shippingAddress.ship_addr1,
								"ship_addr2": shippingAddress.ship_addr2,
								"ship_city": shippingAddress.ship_city,
								"ship_company": shippingAddress.ship_company_name,
								"ship_country": shippingAddress.ship_country,
								"ship_pincode": shippingAddress.ship_pincode,
								"ship_state": shippingAddress.ship_state,
							}
						}
						body.items = [];
						for(let j = 0; j < items.length; j++) {
							const item = items[j];
							const parsed = JSON.parse(item.coa_id as string);
							var expense_id = parsed.id;
							var expense_type = parsed.name;
							(body.items as any[]).push({
								"item_description": item.item_description ?? '',
								"item_code": item.item_code ?? '',
								"item_type": item.item_type ?? '',
								"pid": item.pid,
								"item_name": item.item_name ?? '',
								"quantity": item.quantity ?? '',
								"price_type": item.price_type ?? '',
								"rate": item.rate ?? '',
								"cess_type": item.cess_type ?? '',
								"cess_per": item.cess_per ?? '',
								"taxable_amt": item.taxable_amount ?? '',
								"gst_rate": item.gst_rate ?? '',
								"non_taxable_amt": item.non_taxable_amount ?? '',
								"discount": item.item_discount ?? '',
								"vid":item.vid,
								"expense_id": expense_id,
								"expense_type": expense_type,
							})
						}
						options.method = 'POST';
						options.url = `${baseUrl}/purchase-invoice`;
						options.body = body;
						console.log(body);
					} else if (operation === 'createVoucher') {
						const branchId = this.getNodeParameter('branch_id', i) as string;
						const voucherType = this.getNodeParameter('voucher_type', i) as string;
						const paymentDateRaw = this.getNodeParameter('payment_date', i) as string;
						const currency = this.getNodeParameter('currency', i) as string;
						const paymentMode = this.getNodeParameter('payment_mode', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
						const paymentDate = new Date(paymentDateRaw as string);
						const paymentDateString = paymentDate.toISOString().split('T')[0];
						var payment_mode = JSON.parse(paymentMode as string);
						const body: IDataObject = {
							branch_id: branchId,
							voucher_type: voucherType,
							payment_date: paymentDateString,
							currency: currency,
							payment_mode: payment_mode.name,
						};
						if(voucherType === '1') {
							const expenseType = this.getNodeParameter('expense_type', i) as string;
							if(expenseType === 'single') {
								const expenseHeadRaw = this.getNodeParameter('expense_head', i) as string;
								const amount = this.getNodeParameter('amount', i) as string;
								const taxRate = this.getNodeParameter('tax_rate', i) as string;
								let expenseHead;
								if (typeof expenseHeadRaw === 'string' && expenseHeadRaw.startsWith('{')) {
									try {
										const parsed = JSON.parse(expenseHeadRaw);
										expenseHead = parsed.id;
									} catch {
										expenseHead = expenseHeadRaw;
									}
								} else if (typeof expenseHeadRaw === 'object' && expenseHeadRaw !== null) {
									expenseHead = (expenseHeadRaw as any).id;
								} else {
									expenseHead = expenseHeadRaw;
								}
								body.expense_head = parseInt(expenseHead);
								body.amount = amount;
								body.tax_rate = taxRate;
							} else if(expenseType === 'multiple') {
								const multipleAccounts = this.getNodeParameter('multiple_accounts.expense_head', i, []) as IDataObject[];
								body.multiple_expense = [];
								for(let j = 0; j < multipleAccounts.length; j++) {
									const account = multipleAccounts[j];
									let expenseHead;
									if (typeof account.expense_head === 'string' && account.expense_head.startsWith('{')) {
										try {
											const parsed = JSON.parse(account.expense_head);
											expenseHead = parsed.id;
										} catch {
											expenseHead = account.expense_head;
										}
									} else if (typeof account.expense_head === 'object' && account.expense_head !== null) {
										expenseHead = (account.expense_head as any).id;
									} else {
										expenseHead = account.expense_head;
									}
									(body.multiple_expense as any[]).push({
										expense_id: expenseHead,
										amount: account.amount,
										tax_rate: account.tax,
									});
								}
							}
							if(additionalFields.contact_id) {
								body.contact_id = additionalFields.contact_id;
							}
							if(additionalFields.payment_status) {
								body.payment_status = additionalFields.payment_status;
							}
							if(additionalFields.reverse_charge) {
								body.reverse_charge = additionalFields.reverse_charge;
							}
							if(additionalFields.tax_credit_type) {
								body.tax_credit_type = additionalFields.tax_credit_type;
							}
						} else if(voucherType === '2') {
							const amount = this.getNodeParameter('amount', i) as string;
							const contactId = this.getNodeParameter('contact_id', i) as string;
							body.amount = amount;
							body.contact_id = contactId;
							const additionalFields_type2 = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
							if(additionalFields_type2.reconcile_details) {
								const reconcileDetails = this.getNodeParameter('additionalFields.reconcile_details.reconcile', i, []) as IDataObject[];
								body.reconcile_details = [];
								for(let j = 0; j < reconcileDetails.length; j++){
									const reconcile = reconcileDetails[j];
									(body.reconcile_details as any[]).push({
										purchase_invoice_id: reconcile.purchase_invoice_id,
										amount: reconcile.amount,
									});
								}
							}
						} else if(voucherType === '3') {
							const employeeID = this.getNodeParameter('employee_id', i) as string;
							const accountName = this.getNodeParameter('account_name', i) as string;
							const salary_month = this.getNodeParameter('salary_month', i) as string;
							const amount = this.getNodeParameter('amount', i) as string;
							const salary_details = this.getNodeParameter('salary_details', i, {}) as IDataObject;
							let expenseHead;
							if (typeof accountName === 'string' && accountName.startsWith('{')) {
								try {
									const parsed = JSON.parse(accountName);
									expenseHead = parsed.id;
								} catch {
									expenseHead = accountName;
								}
							} else if (typeof accountName === 'object' && accountName !== null) {
								expenseHead = (accountName as any).id;
							} else {
								expenseHead = accountName;
							}
							body.contact_id = employeeID;
							body.expense_head = parseInt(expenseHead);
							body.amount = amount;
							body.salary_month = salary_month;

							// Only include salary details fields that have data
							const salaryDetailsPayload: any = {};
							if (salary_details.employer_esi && salary_details.employer_esi !== '') {
								salaryDetailsPayload.er_esi = salary_details.employer_esi;
							}
							if (salary_details.employer_pf && salary_details.employer_pf !== '') {
								salaryDetailsPayload.er_pf = salary_details.employer_pf;
							}
							if (salary_details.esi && salary_details.esi !== '') {
								salaryDetailsPayload.esi = salary_details.esi;
							}
							if (salary_details.tds && salary_details.tds !== '') {
								salaryDetailsPayload.tds = salary_details.tds;
							}
							if (salary_details.pt && salary_details.pt !== '') {
								salaryDetailsPayload.p_tax = salary_details.pt;
							}
							if (salary_details.pf && salary_details.pf !== '') {
								salaryDetailsPayload.pf = salary_details.pf;
							}
							if (salary_details.welfare && salary_details.welfare !== '') {
								salaryDetailsPayload.welfare = salary_details.welfare;
							}

							// Only add salary_details to body if there are any fields with data
							if (Object.keys(salaryDetailsPayload).length > 0) {
								body.salary_details = salaryDetailsPayload;
							}
						}
						options.method = 'POST';
						options.url = `${baseUrl}/vouchers`;
						options.body = body;
						console.log(body);
					} else if(operation === 'listPurchaseInvoices') {
						const pageSize = this.getNodeParameter('page_size', i) as number;
						const filters = this.getNodeParameter('filters', i) as IDataObject;

						if(filters.from_date) {
							const dateFrom = new Date(filters.from_date as string);
							filters.from_date = dateFrom.toISOString().split('T')[0];
						}

						if(filters.to_date) {
							const dateTo = new Date(filters.to_date as string);
							filters.to_date = dateTo.toISOString().split('T')[0];
						}
						options.method = 'GET';
						options.url = `${baseUrl}/purchase-invoice?size=${pageSize ?? 5}&start_from=0&date_from=${filters.from_date ?? ''}&date_to=${filters.to_date ?? ''}&order_by=${filters.order_by ?? ''}&order_column=${filters.order_column ?? ''}&payment_status=${filters.payment_status ?? ''}&search=${filters.search ?? ''}`;
						console.log(options.url);
					} else if(operation === 'listVouchers') {
						const voucherType = this.getNodeParameter('voucher_type', i) as string;
						const pageSize = this.getNodeParameter('page_size', i) as number;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						if(filters.from_date) {
							const dateFrom = new Date(filters.from_date as string);
							filters.from_date = dateFrom.toISOString().split('T')[0];
						}

						if(filters.to_date) {
							const dateTo = new Date(filters.to_date as string);
							filters.to_date = dateTo.toISOString().split('T')[0];
						}
						options.method = 'GET';
						options.url = `${baseUrl}/vouchers?&voucher_type=${voucherType ?? ''}&size=${pageSize ?? 5}&start_from=0&from_date=${filters.date_from ?? ''}&to_date=${filters.date_to ?? ''}&order_by=${filters.order_by ?? ''}&order_column=${filters.order_column ?? ''}`;
						console.log(options.url);
					} else if(operation === 'viewPurchaseInvoice') {
						const purchaseInvoiceId = this.getNodeParameter('id', i) as string;
						options.method = 'GET';
						options.url = `${baseUrl}/purchase-invoice/${purchaseInvoiceId}`;
						console.log(options.url);
					} else if(operation === 'viewVoucher') {
						const voucherId = this.getNodeParameter('id', i) as string;
						options.method = 'GET';
						options.url = `${baseUrl}/vouchers/${voucherId}`;
						console.log(options.url);
					}
					const result = await this.helpers.request(options);
					returnData.push({ json: result });
		} catch (error) {
			if (continueOnFail) {
				returnData.push({ json: { error: (error as Error).message } });
				continue;
			}
			throw error;
		}
	}

	return [returnData];
}
