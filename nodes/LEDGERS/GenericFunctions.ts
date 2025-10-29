import type { IExecuteFunctions, IHttpRequestOptions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';

// 🔹 Map Dial Codes to ISO Country Codes
const dialCodeToCountryCode: Record<string, string> = {
	'+91': 'in',
	'+1': 'us',
	'+44': 'gb',
	'+65': 'sg',
	'+971': 'ae',
};

/**
 * Generate fiscal year options and get current fiscal year in a single function
 * @param startYear - The starting year for fiscal years (default: 2018)
 * @returns Object containing options array and current fiscal year default
 */
export function getFiscalYearData(startYear: number = 2018): { options: Array<{ name: string; value: string }>; default: string } {
	const options: Array<{ name: string; value: string }> = [];

	// Calculate current fiscal year
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11

	// If current month is January-March, current FY started last year
	// If current month is April-December, current FY started this year
	const currentFiscalYear = currentMonth < 4 ? currentYear - 1 : currentYear;

	// Generate years from startYear up to current fiscal year
	for (let year = startYear; year <= currentFiscalYear; year++) {
		const nextYear = year + 1;
		const fiscalYearStart = `${year}-04-01`;

		options.push({
			name: `FY-${year}-${nextYear}`,
			value: fiscalYearStart,
		});
	}

	const currentFiscalYearStart = `${currentFiscalYear}-04-01`;

	return {
		options,
		default: currentFiscalYearStart
	};
}

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
	const indiaOnlyOps = ['hrms', 'banking', 'getBankStatement', 'getAllEmployees', 'addEmployee', 'updateEmployee', 'getEmployee', 'createPurchaseInvoice', 'listPurchaseInvoices', 'viewPurchaseInvoice', 'createPurchaseOrder', 'listPurchaseOrders', 'viewPurchaseOrder', 'createVoucher', 'listVouchers', 'viewVoucher', 'getGSTReturnStatus', 'getGSTSearch'];

	for (let i = 0; i < items.length; i++) {
		const operation = this.getNodeParameter('operation', i);

		// If using UAE API, restrict India-only operations
		if (!isIndia && indiaOnlyOps.includes(operation)) {
			throw new ApplicationError('This operation/resource is only available for India API URL. Please update your credentials.');
		}
	}

	// Step 1: Authenticate and get api_token once for all items
	let apiToken: string;
	try {
		const loginOptions: IHttpRequestOptions = {
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
					const options: IHttpRequestOptions = {
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



						// Helper function to transform address data based on region
						const transformAddress = (address: any, type: 'billing' | 'shipping') => {
							const prefix = type === 'billing' ? 'billing_' : 'shipping_';

							if (isIndia) {
								return {
									[`${prefix}address1`]: address[`${prefix}address1`] ?? '',
									[`${prefix}address2`]: address[`${prefix}address2`] ?? '',
									location: address[`${prefix}city`] ?? '',
									state: address[`${prefix}state`] ?? '',
									country: address[`${prefix}country`] ?? '',
									email: address[`${prefix}email`] ?? '',
									gstin: address[`${prefix}tax`] ?? '',
									mobile: address[`${prefix}mobile`] ?? '',
									pincode: address[`${prefix}postalcode`] ?? '',
								};
							} else {
								return {
									[`${prefix}address1`]: address[`${prefix}address1`] ?? '',
									[`${prefix}address2`]: address[`${prefix}address2`] ?? '',
									po_box: address[`${prefix}postalcode`] ?? '',
									emirates: address[`${prefix}state`] ?? '',
									location: address[`${prefix}city`] ?? '',
									country: address[`${prefix}country`] ?? '',
								};
							}
						};

						// Extract billing addresses
						let billingAddresses: any[] = [];
						if (additionalFields.billing_address) {
							const billingData = additionalFields.billing_address;
							const addresses = Array.isArray(billingData.address) ? billingData.address : [billingData.address || billingData];
							billingAddresses = addresses.map((address: any) => transformAddress(address, 'billing'));
						}

						// Extract shipping addresses
						let shippingAddresses: any[] = [];
						if (additionalFields.shipping_address) {
							const shippingData = additionalFields.shipping_address;
							const addresses = Array.isArray(shippingData.address) ? shippingData.address : [shippingData.address || shippingData];
							shippingAddresses = addresses.map((address: any) => transformAddress(address, 'shipping'));
						}

						// Process opening balance fields
						let openingReceivable = 0;
						let openingReceivableAsOnDate = '';
						let openingPayable = 0;
						let openingPayableAsOnDate = '';

						// Process Opening Customer Receivable
						if (additionalFields.opening_customer_receivable_group) {
							const customerReceivableData = additionalFields.opening_customer_receivable_group.customer_receivable;
							if (customerReceivableData && customerReceivableData.amount !== undefined && customerReceivableData.amount !== null) {
								const amountStr = customerReceivableData.amount.toString().trim();
								if (amountStr === '' || isNaN(Number(amountStr))) {
									throw new ApplicationError('Opening Customer Receivable amount must be a valid numeric value', { level: 'warning' });
								}
								openingReceivable = parseInt(amountStr) || 0;
								openingReceivableAsOnDate = customerReceivableData.fiscal_year || '';
							}
						}

						// Process Opening Supplier Payable
						if (additionalFields.opening_supplier_payable_group) {
							const supplierPayableData = additionalFields.opening_supplier_payable_group.supplier_payable;
							if (supplierPayableData && supplierPayableData.amount !== undefined && supplierPayableData.amount !== null) {
								const amountStr = supplierPayableData.amount.toString().trim();
								if (amountStr === '' || isNaN(Number(amountStr))) {
									throw new ApplicationError('Opening Supplier Payable amount must be a valid numeric value', { level: 'warning' });
								}
								openingPayable = parseInt(amountStr) || 0;
								openingPayableAsOnDate = supplierPayableData.fiscal_year || '';
							}
						}

						// Remove address fields and opening balance groups from additionalFields to avoid duplication
						delete additionalFields.billing_address;
						delete additionalFields.shipping_address;
						delete additionalFields.opening_customer_receivable_group;
						delete additionalFields.opening_supplier_payable_group;

						options.method = 'POST';
						options.url = `${baseUrl}/contact`;
						// Build the API body based on the region
						const baseBody = {
							contact_name: contactName,
							...(billingAddresses.length > 0 ? { billing_address: billingAddresses } : {}),
							...(shippingAddresses.length > 0 ? { shipping_address: shippingAddresses } : {}),
							currency: additionalFields.currency ?? 'INR',
						};

						if (isIndia) {
							// India API structure - map tax to gstin
							const indiaFields = { ...additionalFields };
							if (indiaFields.tax) {
								indiaFields.gstin = indiaFields.tax;
								delete indiaFields.tax;
							}

							options.body = {
								...baseBody,
								...indiaFields,
								opening_receivable: openingReceivable.toString(),
								opening_receivable_as_ondate: openingReceivableAsOnDate,
								opening_payable: openingPayable.toString(),
								opening_payable_as_ondate: openingPayableAsOnDate,
							};
						} else {
							// UAE API structure - map tax to trn_number
							const uaeFields = { ...additionalFields };
							if (uaeFields.tax) {
								uaeFields.trn_number = uaeFields.tax;
								delete uaeFields.tax;
							}

							options.body = {
								...baseBody,
								...uaeFields,
								opening_receivable: openingReceivable,
								opening_payable: openingPayable.toString(),
							};
						}
					} else if (operation === 'updateContact') {
						const contactId = this.getNodeParameter('contactId', i);
						const updateFields = this.getNodeParameter('contactAdditionalFields', i) as Record<
							string,
							any
						>;

						const body: Record<string, any> = {
							contact_id: contactId,
						};

						// Process opening balance fields for update
						let openingReceivable = 0;
						let openingReceivableAsOnDate = '';
						let openingPayable = 0;
						let openingPayableAsOnDate = '';

						// Process Opening Customer Receivable
						if (updateFields.opening_customer_receivable_group) {
							const customerReceivableData = updateFields.opening_customer_receivable_group.customer_receivable;
							if (customerReceivableData && customerReceivableData.amount !== undefined && customerReceivableData.amount !== null) {
								const amountStr = customerReceivableData.amount.toString().trim();
								if (amountStr === '' || isNaN(Number(amountStr))) {
									throw new ApplicationError('Opening Customer Receivable amount must be a valid numeric value', { level: 'warning' });
								}
								openingReceivable = parseInt(amountStr) || 0;
								openingReceivableAsOnDate = customerReceivableData.fiscal_year || '';
							}
						}

						// Process Opening Supplier Payable
						if (updateFields.opening_supplier_payable_group) {
							const supplierPayableData = updateFields.opening_supplier_payable_group.supplier_payable;
							if (supplierPayableData && supplierPayableData.amount !== undefined && supplierPayableData.amount !== null) {
								const amountStr = supplierPayableData.amount.toString().trim();
								if (amountStr === '' || isNaN(Number(amountStr))) {
									throw new ApplicationError('Opening Supplier Payable amount must be a valid numeric value', { level: 'warning' });
								}
								openingPayable = parseInt(amountStr) || 0;
								openingPayableAsOnDate = supplierPayableData.fiscal_year || '';
							}
						}

						// Remove opening balance groups from updateFields to avoid duplication
						delete updateFields.opening_customer_receivable_group;
						delete updateFields.opening_supplier_payable_group;

						// Helper function to process field mapping
						const processField = (key: string, value: any) => {
							if (key === 'mobile' && value !== '') {
								const selectedDialCode = updateFields.mobile_country_code || '+91';
								const isoCode = dialCodeToCountryCode[selectedDialCode] || 'in';
								body[key] = `${value}|${isoCode}`;
								body.mobile_country_code = selectedDialCode;
							} else if (key === 'tax' && isIndia) {
								body.gstin = value;
							} else if (key === 'tax' && !isIndia) {
								body.trn_number = value;
							} else if (key === 'currency') {
								// Currency is already set in base body, update if provided
								if (value) {
									body.currency = value;
								}
							} else {
								body[key] = value;
							}
						};

						Object.entries(updateFields).forEach(([key, value]) => {
							if (value !== undefined && value !== null) {
								processField(key, value);
							}
						});

						// Add opening balance fields to body based on region
						if (isIndia) {
							// India API structure
							if (openingReceivable !== 0 || openingReceivableAsOnDate !== '') {
								body.opening_receivable = openingReceivable.toString();
								body.opening_receivable_as_ondate = openingReceivableAsOnDate;
							}
							if (openingPayable !== 0 || openingPayableAsOnDate !== '') {
								body.opening_payable = openingPayable.toString();
								body.opening_payable_as_ondate = openingPayableAsOnDate;
							}
						} else {
							// UAE API structure
							if (openingReceivable !== 0) {
								body.opening_receivable = openingReceivable;
							}
							if (openingPayable !== 0) {
								body.opening_payable = openingPayable.toString();
							}
						}

						options.method = 'PUT';
						options.url = `${baseUrl}/contact`;
						options.body = body;
					} else if (operation === 'addAddress') {
						const contactId = this.getNodeParameter('contactId', i) as string;
						const addressFields = this.getNodeParameter('addressFields', i) as IDataObject;
						const addressType = this.getNodeParameter('addressType', i, 'billing') as string;

						const getContactOptions: IHttpRequestOptions = {
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

						// Helper function to create address object based on region
						const createAddressObject = (type: 'billing' | 'shipping') => {
							if (isIndia) {
								return {
									[`${type}_address1`]: addressFields.address1 ?? '',
									[`${type}_address2`]: addressFields.address2 ?? '',
									location: addressFields.location ?? '',
									state: addressFields.state ?? '',
									country: addressFields.country ?? '',
									pincode: addressFields.postalcode ?? '',
									email: addressFields.email ?? '',
									gstin: addressFields.tax ?? '',
									mobile: addressFields.mobile ?? '',
								};
							} else {
								return {
									[`${type}_address1`]: addressFields.address1 ?? '',
									[`${type}_address2`]: addressFields.address2 ?? '',
									po_box: addressFields.postalcode ?? '',
									[type === 'billing' ? 'emirates' : 'emirate']: addressFields.state ?? '',
									location: addressFields.location ?? '',
									country: addressFields.country ?? '',
									trn_number: addressFields.tax ?? '',
								};
							}
						};

						const body: IDataObject = {};

						if (addressType === 'billing' || addressType === 'both') {
							const existingBilling = contactData.billing_address || [];
							body.billing_address = [...existingBilling, createAddressObject('billing')];
						}

						if (addressType === 'shipping' || addressType === 'both') {
							const existingShipping = contactData.shipping_address || [];
							body.shipping_address = [...existingShipping, createAddressObject('shipping')];
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

						const getContactOptions: IHttpRequestOptions = {
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

						// Helper function to update address field based on region
						const updateAddressField = (field: string, value: any) => {
							const addressPrefix = addressType === 'billing' ? 'billing_' : 'shipping_';

							switch (field) {
								case 'address1':
									updatedAddress[`${addressPrefix}address1`] = value;
									break;
								case 'address2':
									updatedAddress[`${addressPrefix}address2`] = value;
									break;
								case 'location':
									updatedAddress.location = value;
									updatedAddress.city = value;
									break;
								case 'state':
									if (isIndia) {
										updatedAddress.state = value;
									} else {
										updatedAddress[addressType === 'billing' ? 'emirates' : 'emirate'] = value;
									}
									break;
								case 'country':
									updatedAddress.country = value;
									break;
								case 'postalcode':
									updatedAddress[isIndia ? 'pincode' : 'po_box'] = value;
									break;
								case 'email':
									if (isIndia) updatedAddress.email = value;
									break;
								case 'tax':
									updatedAddress[isIndia ? 'gstin' : 'trn_number'] = value;
									break;
								case 'mobile':
									if (isIndia) updatedAddress.mobile = value;
									break;
							}
						};

						// Update only fields that were provided
						Object.entries(updateFields).forEach(([field, value]) => {
							if (value !== undefined) {
								updateAddressField(field, value);
							}
						});

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
						const hsnSac = this.getNodeParameter('hsn_sac', i);
						const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, any>;
						const tax_type = additionalFields.tax_type ?? 'inclusive of tax';
						const tax_rate = additionalFields.tax_rate ?? '5%';
						const non_taxable = additionalFields.non_taxable != 0 ? additionalFields.non_taxable : '';
						const sku = additionalFields.sku ?? '';
						const unit = additionalFields.unit ?? 'UNT-UNITS';
						const description = additionalFields.description ?? '';
						const currency = additionalFields.currency ?? 'INR';
						// 🔎 Validate price
						if (price === undefined || price === null || price === '' || price === 0 || price === '0') {
							throw new ApplicationError('Price must be a number greater than zero.');
						}

						// 🔎 Validate HSN/SAC Code based on country
						if (isIndia && (!hsnSac || hsnSac === '')) {
							throw new ApplicationError('HSN/SAC Code is required for India Region only.');
						}
						// Handle cess_type and cess_value with validation (India only)
						let cess_type_api, cess_api;

						// Check if cess is selected for UAE (not allowed)
						if (!isIndia && additionalFields.cess_type) {
							throw new ApplicationError('Cess is not available for UAE operations. Cess is only available for India.');
						}

						if (isIndia && additionalFields.cess_type) {
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
						// Prepare variants array based on country
						let variants;
						if (isIndia) {
							// India structure
							variants = [{
								variant_name: catalogName,
								price,
								gst_type: tax_type === 'inclusive of tax' ? 'inclusive of gst' : 'exclusive of gst',
								non_taxable,
								currency: currency ?? 'INR',
								sku_id: sku,
								variant_description: description,
							}];
						} else {
							// UAE structure
							variants = [{
								variant_name: catalogName,
								price,
								vat_type: tax_type === 'inclusive of tax' ? 'Inclusive of VAT' : 'Exclusive of VAT',
								currency: currency ?? 'AED',
								variant_description: description,
								sku_id: sku,
							}];
						}
						options.method = 'POST';
						options.url = `${baseUrl}/catalog`;
						// Build API body based on country
						if (isIndia) {
							// India API structure
							let tax_rate_value = '';
							if(tax_rate == 'Non-Tax Supply') {
								tax_rate_value = 'Non-GST Supply';
							}
							else {
								tax_rate_value = tax_rate;
							}
							options.body = {
								item_name: catalogName,
								catalog_type: catalogType,
								gst_rate: tax_rate_value,
								item_type: itemType,
								hsn_sac: hsnSac,
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
								...(isIndia && cess_type_api && cess_api !== undefined ? { cess_type: cess_type_api, cess: cess_api } : {}),
							};
						} else {
							// UAE API structure - validate VAT rate
							let vat_rate_value;
							if (tax_rate === 'Exempted Supply') {
								vat_rate_value = -1;
							} else if (tax_rate === '5%' || tax_rate === '0%') {
								vat_rate_value = tax_rate.replace('%', '');
							} else {
								throw new ApplicationError('UAE Tax Rate must be 5%, 0%, or Exempted Supply only.');
							}

							options.body = {
								item_name: catalogName,
								catalog_type: catalogType,
								item_type: itemType,
								vat_rate: vat_rate_value,
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
							};
						}
						if(additionalFields.currency) {
							options.body.currency = additionalFields.currency;
						}
					} else if (operation === 'updateCatalog') {
						const catalogId = this.getNodeParameter('catalogId', i);
						const updateFields = this.getNodeParameter('catalogUpdateFields', i) as Record<string, any>;
						// Always include catalog_id
						const body: Record<string, any> = { catalog_id: catalogId };

						// Handle cess_type and cess_value with validation (India only)
						let cess_type_api, cess_api;

						// Check if cess is selected for UAE (not allowed)
						if (!isIndia && updateFields.cess_type) {
							throw new ApplicationError('Cess is not available for UAE operations. Cess is only available for India.');
						}

						if (isIndia && updateFields.cess_type) {
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
								if (key === 'tax_rate') {
									let tax_rate_value = '';
									if(value == 'Non-Tax Supply') {
										tax_rate_value = 'Non-GST Supply';
									}
									else {
										tax_rate_value = value;
									}
									// Handle tax rate based on country
									if (isIndia) {
										body.gst_rate = tax_rate_value;
									} else {
										// UAE VAT rate validation
										if (value === 'Exempted Supply') {
											body.vat_rate = -1;
										} else if (value === '5%' || value === '0%') {
											body.vat_rate = value.replace('%', '');
										} else {
											throw new ApplicationError('UAE Tax Rate must be 5%, 0%, or Exempted Supply only.');
										}
									}
								} else if (key === 'tax_type') {
									// Handle tax type based on country
									if (isIndia) {
										body.gst_type = value === 'inclusive of tax' ? 'inclusive of gst' : 'exclusive of gst';
									} else {
										body.vat_type = value === 'inclusive of tax' ? 'Inclusive of VAT' : 'Exclusive of VAT';
									}
								} else if (key === 'units') {
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

						if (isIndia && cess_type_api && cess_api !== undefined) {
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
						if (updateFields.variant_tax_type !== undefined) {
							// Handle tax type based on country
							if (isIndia) {
								variantUpdate.gst_type = updateFields.variant_tax_type === 'inclusive of tax' ? 'inclusive of gst' : 'exclusive of gst';
							} else {
								variantUpdate.vat_type = updateFields.variant_tax_type === 'inclusive of tax' ? 'Inclusive of VAT' : 'Exclusive of VAT';
							}
						}
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
						const getOptions: IHttpRequestOptions = {
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
							non_taxable: additionalFields.variant_non_taxable != 0 ? additionalFields.variant_non_taxable : '',
							sku_id: additionalFields.variant_sku ?? '',
							variant_description: additionalFields.variant_description ?? '',
						};

						// Handle tax type based on country
						const tax_type = additionalFields.variant_tax_type ?? 'inclusive of tax';
						if (isIndia) {
							newVariant.gst_type = tax_type === 'inclusive of tax' ? 'inclusive of gst' : 'exclusive of gst';
							newVariant.currency = additionalFields.currency ?? 'INR';
						} else {
							newVariant.vat_type = tax_type === 'inclusive of tax' ? 'Inclusive of VAT' : 'Exclusive of VAT';
							newVariant.currency = additionalFields.currency ?? 'AED';
							// Include SKU for UAE variants
							if (additionalFields.variant_sku) {
								newVariant.sku_id = additionalFields.variant_sku;
							}
						}


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

						// Validate contact object exists
						if (!contact) {
							throw new ApplicationError('Contact information is required for creating invoice', { level: 'warning' });
						}

						// Validate required contact fields based on country
						if (!contact.name || contact.name === '') {
							throw new ApplicationError('Contact Name is required for creating invoice', { level: 'warning' });
						}
						if (!contact.id || contact.id === '') {
							throw new ApplicationError('Contact ID is required for creating invoice', { level: 'warning' });
						}

						// UAE specific contact validations
						if (!isIndia) {
							if (!contact.business_name || contact.business_name === '') {
								throw new ApplicationError('Business Name is required for UAE operations', { level: 'warning' });
							}
							if (!contact.place_of_supply || contact.place_of_supply === '') {
								throw new ApplicationError('Place of Supply is required for UAE operations', { level: 'warning' });
							}
						}

						// India specific validations
						if (isIndia) {
							if (!seller_branch_id || seller_branch_id === '') {
								throw new ApplicationError('Seller Branch ID is required for India operations', { level: 'warning' });
							}
						}

						// Transform contact data based on region (same pattern as contact operations)
						let transformedContact = { ...contact };
						if (isIndia) {
							// India structure - keep existing fields
							if (contact.tax_number) {
								transformedContact.gstin = contact.tax_number ?? '';
							}
						} else {
							// UAE structure - map tax_number to tax_id and contact_id to id
							if (contact.tax_number) {
								transformedContact.tax_id = contact.tax_number ?? '';
							}
							// Always remove tax_number for UAE structure and ensure tax_id is present
							delete transformedContact.tax_number;
							if (!transformedContact.tax_id) {
								transformedContact.tax_id = contact.tax_number ?? '';
							}
							// Map contact_id to id for UAE structure
							if (contact.contact_id) {
								transformedContact.id = contact.contact_id;
								delete transformedContact.contact_id;
							}

							// Remove unwanted keys for UAE contact
							delete transformedContact.tax_number;
							delete transformedContact.contact_id;

							// Keep only the necessary fields for UAE contact
							const uaeContactFields = ['id', 'name', 'business_name', 'tax_id', 'email', 'mobile', 'business_country', 'country_code', 'place_of_supply'];
							const cleanedContact: any = {};

							uaeContactFields.forEach(field => {
								if (transformedContact[field] !== undefined) {
									cleanedContact[field] = transformedContact[field];
								}
							});

							transformedContact = cleanedContact;
						}

						// Transform items based on region
						const transformedItems = items.map((item: any) => {
							const transformedItem = { ...item };

							if (isIndia) {
								// India structure - keep existing fields
								if (item.item_code) {
									transformedItem.item_code = item.item_code;
								}
								if (item.pid) {
									transformedItem.pid = item.pid;
								}
								if (item.gst_rate) {
									transformedItem.gst_rate = item.gst_rate;
								}
								return transformedItem;
							} else {
								// UAE structure - map fields and remove unwanted keys
								if (item.item_code) {
									transformedItem.hsn_sac = item.item_code;
									delete transformedItem.item_code;
								}
								if (item.pid) {
									transformedItem.id = item.pid;
									delete transformedItem.pid;
								}
								if (item.gst_rate) {
									transformedItem.vat_rate = item.gst_rate;
									delete transformedItem.gst_rate;
								}

								// Map price_type to tax_type with UAE values
								if (item.price_type !== undefined) {
									// UAE: inclusive = 1, exclusive = 2
									transformedItem.tax_type = item.price_type === 0 ? 1 : 2;
									// Keep price_type for validation
								}

								// Remove unwanted keys for UAE
								delete transformedItem.item_code;
								delete transformedItem.pid;
								delete transformedItem.gst_rate;

								// Keep only the necessary fields for UAE
								const uaeFields = ['id', 'name', 'description', 'quantity', 'rate', 'price', 'discount', 'vat_amount', 'tax_type', 'vat_rate', 'taxable_per_item', 'non_taxable_per_item', 'total_amount', 'nontaxable_amount', 'non_tax', 'taxable', 'hsn_sac', 'item_type', 'price_type', 'variant_id'];
								const cleanedItem: any = {};

								uaeFields.forEach(field => {
									if (transformedItem[field] !== undefined) {
										cleanedItem[field] = transformedItem[field];
									}
								});

								return cleanedItem;
							}
						});

						// Validate transformed items
						for (let j = 0; j < transformedItems.length; j++) {
							const item = transformedItems[j];

							if (!item) {
								throw new ApplicationError(`Item ${j + 1} is undefined`, { level: 'warning' });
							}
							if (!item.name || item.name === '') {
								throw new ApplicationError(`Item Name is required for item ${j + 1}`, { level: 'warning' });
							}

							const codeField = isIndia ? 'item_code' : 'hsn_sac';
							if (!item[codeField] || item[codeField] === '') {
								throw new ApplicationError(`${isIndia ? 'HSN/SAC' : 'Item'} Code is required for item ${j + 1}`, { level: 'warning' });
							}

							// Validate numeric fields - must be integers >= 0 and not empty
							const idField = isIndia ? 'pid' : 'id';
							if (item[idField] === '' || item[idField] === null || item[idField] === undefined) {
								throw new ApplicationError(`Item ID (${isIndia ? 'PID' : 'ID'}) is required for item ${j + 1}`, { level: 'warning' });
							}
							const idValue = Number(item[idField]);
							if (!Number.isInteger(idValue) || idValue <= 0) {
								throw new ApplicationError(`Item ID (${isIndia ? 'PID' : 'ID'}) must be an integer > 0 for item ${j + 1}`, { level: 'warning' });
							}

							// Variant ID validation - required for both regions
							if (item.variant_id === '' || item.variant_id === null || item.variant_id === undefined) {
								throw new ApplicationError(`Variant ID is required for item ${j + 1}`, { level: 'warning' });
							}
							const variantIdValue = Number(item.variant_id);
							if (!Number.isInteger(variantIdValue) || variantIdValue <= 0) {
								throw new ApplicationError(`Variant ID must be an integer > 0 for item ${j + 1}`, { level: 'warning' });
							}

							if (item.rate === '' || item.rate === null || item.rate === undefined) {
								throw new ApplicationError(`Rate is required for item ${j + 1}`, { level: 'warning' });
							}
							const rateValue = Number(item.rate);
							if (!Number.isInteger(rateValue) || rateValue < 0) {
								throw new ApplicationError(`Rate must be an integer >= 0 for item ${j + 1}`, { level: 'warning' });
							}

							if (item.non_taxable_per_item === '' || item.non_taxable_per_item === null || item.non_taxable_per_item === undefined) {
								throw new ApplicationError(`Non Taxable Per Item is required for item ${j + 1}`, { level: 'warning' });
							}
							const nonTaxableValue = Number(item.non_taxable_per_item);
							if (!Number.isInteger(nonTaxableValue) || nonTaxableValue < 0) {
								throw new ApplicationError(`Non Taxable Per Item must be an integer >= 0 for item ${j + 1}`, { level: 'warning' });
							}

							if (item.taxable_per_item === '' || item.taxable_per_item === null || item.taxable_per_item === undefined) {
								throw new ApplicationError(`Taxable Per Item is required for item ${j + 1}`, { level: 'warning' });
							}
							const taxableValue = Number(item.taxable_per_item);
							if (!Number.isInteger(taxableValue) || taxableValue < 0) {
								throw new ApplicationError(`Taxable Per Item must be an integer >= 0 for item ${j + 1}`, { level: 'warning' });
							}

							// Validate that taxable_per_item is equal to or less than rate
							if (taxableValue > rateValue) {
								throw new ApplicationError(`Taxable Per Item cannot be greater than Rate for item ${j + 1}`, { level: 'warning' });
							}

							if(item.quantity === undefined || item.quantity === null || item.quantity === '') {
								throw new ApplicationError(`Quantity is required for item ${j + 1}`, { level: 'warning' });
							}
							if(!item.item_type || item.item_type === '') {
								throw new ApplicationError(`Item Type is required for item ${j + 1}`, { level: 'warning' });
							}

							if(item.price_type === undefined || item.price_type === null || item.price_type === '') {
								throw new ApplicationError(`Price Type is required for item ${j + 1}`, { level: 'warning' });
							}

							const rateField = isIndia ? 'gst_rate' : 'vat_rate';
							if(!item[rateField] || item[rateField] === '') {
								throw new ApplicationError(`${isIndia ? 'GST' : 'VAT'} Rate is required for item ${j + 1}`, { level: 'warning' });
							}

							// UAE specific VAT rate validation
							if (!isIndia && item.gst_rate) {
								const vatRate = item.gst_rate;
								if (vatRate !== '0' && vatRate !== '5' && vatRate !== 'Exempted Supply') {
									throw new ApplicationError(`VAT Rate must be 0, 5, or Exempted Supply only for item ${j + 1}`, { level: 'warning' });
								}
							}

							// UAE specific additional validations
							if (!isIndia) {
								// Ensure all UAE required fields are present
								if (item.quantity === undefined || item.quantity === null || item.quantity === '') {
									throw new ApplicationError(`Quantity is required for UAE operations - item ${j + 1}`, { level: 'warning' });
								}
								if (item.rate === undefined || item.rate === null || item.rate === '') {
									throw new ApplicationError(`Rate is required for UAE operations - item ${j + 1}`, { level: 'warning' });
								}
								if (item.taxable_per_item === undefined || item.taxable_per_item === null || item.taxable_per_item === '') {
									throw new ApplicationError(`Taxable Per Item is required for UAE operations - item ${j + 1}`, { level: 'warning' });
								}
								if (item.non_taxable_per_item === undefined || item.non_taxable_per_item === null || item.non_taxable_per_item === '') {
									throw new ApplicationError(`Non Taxable Per Item is required for UAE operations - item ${j + 1}`, { level: 'warning' });
								}
								if (item.vat_rate === undefined || item.vat_rate === null || item.vat_rate === '') {
									throw new ApplicationError(`VAT Rate is required for UAE operations - item ${j + 1}`, { level: 'warning' });
								}
							}

							if(rateValue && nonTaxableValue) {
								if(rateValue < nonTaxableValue) {
									throw new ApplicationError(`Non-Taxable value cannot be greater than Rate for item ${j + 1}`, { level: 'warning' });
								}
							}
						}

						// Transform additional fields based on region (same pattern as contact operations)
						const transformedAdditionalFields = { ...additionalFields };

						// Transform billing and shipping addresses
						if (additionalFields.billing_address) {
							const billingAddr = additionalFields.billing_address as IDataObject;
							if (isIndia) {
								// India structure - keep existing fields
								transformedAdditionalFields.billing_address = billingAddr;
							} else {
								// UAE structure - transform to UAE format
								transformedAdditionalFields.billing_address = {
									floor_no_flat_name: billingAddr.bill_addr1 || '',
									building_name: billingAddr.bill_addr2 || '',
									street_name: billingAddr.bill_city || '',
									emirate: billingAddr.bill_state || '',
									po_box: billingAddr.bill_pincode || '',
									tax_id: billingAddr.bill_tax_number || '',
									country: billingAddr.bill_country || '',
								};
							}
						}

						if (additionalFields.shipping_address) {
							const shippingAddr = additionalFields.shipping_address as IDataObject;
							if (isIndia) {
								// India structure - keep existing fields
								transformedAdditionalFields.shipping_address = shippingAddr;
							} else {
								// UAE structure - transform to UAE format
								transformedAdditionalFields.shipping_address = {
									floor_no_flat_name: shippingAddr.ship_addr1 || '',
									building_name: shippingAddr.ship_addr2 || '',
									street_name: shippingAddr.ship_city || '',
									emirate: shippingAddr.ship_state || '',
									po_box: Number(shippingAddr.ship_pincode) || 0,
									tax_id: shippingAddr.ship_tax_number || '',
									country: shippingAddr.ship_country || '',
								};
							}
						}

						// Transform currency field
						if (additionalFields.billings_currency) {
							transformedAdditionalFields.billing_currency = additionalFields.billings_currency;
							delete transformedAdditionalFields.billings_currency;
						}

						// Format invoice date to YYYY-MM-DD format (date only, no time)
						if (transformedAdditionalFields.invoice_date) {
							const invoiceDate = new Date(transformedAdditionalFields.invoice_date as string);
							transformedAdditionalFields.invoice_date = invoiceDate.toISOString().split('T')[0];
						}

						if(transformedAdditionalFields.validity_date) {
							const validityDate = new Date(transformedAdditionalFields.validity_date as string);
							transformedAdditionalFields.validity_date = validityDate.toISOString().split('T')[0];
						}

						const body: IDataObject = {
							contact: transformedContact,
							items: transformedItems,
							seller_branch_id,
							...transformedAdditionalFields,
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
						// Contact ID filter only works for India region
						const contactIdFilter = isIndia ? `&filter.contact_id=${filters.contact_id ?? ''}` : '';
						options.url = `${baseUrl}/invoice?page_size=${pageSize ?? 5}&filter.date_from=${filters.date_from ?? ''}&filter.date_to=${filters.date_to ?? ''}&filter.payment_status=${filters.payment_status ?? ''}${contactIdFilter}`;
					} else if (operation === 'createQuote') {
						const contact = this.getNodeParameter('contact', i) as IDataObject;
						const items = this.getNodeParameter('items.item', i) as IDataObject[];
						const seller_branch_id = this.getNodeParameter('seller_branch_id', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
						// Transform contact based on region
						const transformedContact = { ...contact };
						if (isIndia) {
							// India structure - keep existing fields
							if (contact.tax_number) {
								transformedContact.gstin = contact.tax_number ?? '';
							}
						} else {
							// UAE structure - map tax_number to tax_id and contact_id to id
							if (contact.tax_number) {
								transformedContact.tax_id = contact.tax_number ?? '';
							}
							// Always remove tax_number for UAE structure and ensure tax_id is present
							delete transformedContact.tax_number;
							if (!transformedContact.tax_id) {
								transformedContact.tax_id = contact.tax_number ?? '';
							}
							// Map contact_id to id for UAE structure
							if (contact.contact_id) {
								transformedContact.id = contact.contact_id;
								delete transformedContact.contact_id;
							}
						}

						// Transform items based on region
						const transformedItems = items.map(item => {
							const transformedItem = { ...item };
							if (!isIndia) {
								// UAE structure - map item_code to hsn_sac
								if (item.item_code) {
									transformedItem.hsn_sac = item.item_code;
									delete transformedItem.item_code;
								}
								// Map gst_rate to vat_rate
								if (item.gst_rate) {
									transformedItem.vat_rate = item.gst_rate;
									delete transformedItem.gst_rate;
								}

								// Map price_type to tax_type with UAE values
								if (item.price_type !== undefined) {
									// UAE: inclusive = 1, exclusive = 2
									transformedItem.tax_type = item.price_type === 0 ? 1 : 2;
									// Keep price_type for validation
								}

								// Map taxable_per_item to taxable_per_item
								if (item.taxable_per_item) {
									transformedItem.taxable_per_item = item.taxable_per_item;
								}
								// Map non_taxable_per_item to non_taxable_per_item
								if (item.non_taxable_per_item) {
									transformedItem.non_taxable_per_item = item.non_taxable_per_item;
								}
							}
							return transformedItem;
						});

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
								throw new ApplicationError(`Item Name is required for item ${j + 1}`, { level: 'warning' });
							}
							if (!item.item_code || item.item_code === '') {
								throw new ApplicationError(`HSN/SAC Code is required for item ${j + 1}`, { level: 'warning' });
							}

							// Validate numeric fields - must be integers >= 0 and not empty
							if (item.pid === '' || item.pid === null || item.pid === undefined) {
								throw new ApplicationError(`Item ID (PID) is required for item ${j + 1}`, { level: 'warning' });
							}
							const pidValue = Number(item.pid);
							if (!Number.isInteger(pidValue) || pidValue <= 0) {
								throw new ApplicationError(`Item ID (PID) must be an integer > 0 for item ${j + 1}`, { level: 'warning' });
							}

							// Variant ID validation - required for both regions
							if (item.variant_id === '' || item.variant_id === null || item.variant_id === undefined) {
								throw new ApplicationError(`Variant ID is required for item ${j + 1}`, { level: 'warning' });
							}
							const variantIdValue = Number(item.variant_id);
							if (!Number.isInteger(variantIdValue) || variantIdValue <= 0) {
								throw new ApplicationError(`Variant ID must be an integer > 0 for item ${j + 1}`, { level: 'warning' });
							}

							if (item.rate === '' || item.rate === null || item.rate === undefined) {
								throw new ApplicationError(`Rate is required for item ${j + 1}`, { level: 'warning' });
							}
							const rateValue = Number(item.rate);
							if (!Number.isInteger(rateValue) || rateValue < 0) {
								throw new ApplicationError(`Rate must be an integer >= 0 for item ${j + 1}`, { level: 'warning' });
							}

							if (item.non_taxable_per_item === '' || item.non_taxable_per_item === null || item.non_taxable_per_item === undefined) {
								throw new ApplicationError(`Non Taxable Per Item is required for item ${j + 1}`, { level: 'warning' });
							}
							const nonTaxableValue = Number(item.non_taxable_per_item);
							if (!Number.isInteger(nonTaxableValue) || nonTaxableValue < 0) {
								throw new ApplicationError(`Non Taxable Per Item must be an integer >= 0 for item ${j + 1}`, { level: 'warning' });
							}

							if (item.taxable_per_item === '' || item.taxable_per_item === null || item.taxable_per_item === undefined) {
								throw new ApplicationError(`Taxable Per Item is required for item ${j + 1}`, { level: 'warning' });
							}
							const taxableValue = Number(item.taxable_per_item);
							if (!Number.isInteger(taxableValue) || taxableValue < 0) {
								throw new ApplicationError(`Taxable Per Item must be an integer >= 0 for item ${j + 1}`, { level: 'warning' });
							}

							// Validate that taxable_per_item is equal to or less than rate
							if (taxableValue > rateValue) {
								throw new ApplicationError(`Taxable Per Item cannot be greater than Rate for item ${j + 1}`, { level: 'warning' });
							}

							if(item.quantity === undefined || item.quantity === null || item.quantity === '') {
								throw new ApplicationError(`Quantity is required for item ${j + 1}`, { level: 'warning' });
							}
							if(!item.item_type || item.item_type === '') {
								throw new ApplicationError(`Item Type is required for item ${j + 1}`, { level: 'warning' });
							}

							if(item.price_type === undefined || item.price_type === null || item.price_type === '') {
								throw new ApplicationError(`Price Type is required for item ${j + 1}`, { level: 'warning' });
							}
							if(!item.gst_rate || item.gst_rate === '') {
								throw new ApplicationError(`${isIndia ? 'GST' : 'VAT'} Rate is required for item ${j + 1}`, { level: 'warning' });
							}
							if(rateValue && nonTaxableValue) {
								if(rateValue < nonTaxableValue) {
									throw new ApplicationError(`Non-Taxable value cannot be greater than Rate for item ${j + 1}`, { level: 'warning' });
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
							contact: transformedContact,
							items: transformedItems,
							seller_branch_id,
							...additionalFields,
						};

						options.method = 'POST';
						options.url = `${baseUrl}/estimate`;
						options.body = body;
						console.log('body', body);
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

						// Validate contact object exists
						if (!contact) {
							throw new ApplicationError('Contact information is required for creating receipt', { level: 'warning' });
						}

						// Validate required contact fields based on country
						if (!contact.name || contact.name === '') {
							throw new ApplicationError('Contact Name is required for creating receipt', { level: 'warning' });
						}
						if (!contact.id || contact.id === '') {
							throw new ApplicationError('Contact ID is required for creating receipt', { level: 'warning' });
						}

						// UAE specific contact validations
						if (!isIndia) {
							if (!contact.business_name || contact.business_name === '') {
								throw new ApplicationError('Business Name is required for UAE operations', { level: 'warning' });
							}
						}

						// India specific validations
						if (isIndia) {
							if (!sellerBranchId || sellerBranchId === '') {
								throw new ApplicationError('Seller Branch ID is required for India operations', { level: 'warning' });
							}
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

						// Payment method validation - transaction number required for non-cash payments
						const isCashPayment = paymentMethod.toLowerCase().includes('cash');
						if (!isCashPayment) {
							if (!additionalFields.transaction_number || additionalFields.transaction_number === '') {
								throw new ApplicationError('Transaction Number is required for non-cash payment methods', { level: 'warning' });
							}
						}

						// Transform contact data based on region (same pattern as invoice/quote operations)
						let transformedContact = { ...contact };
						if (isIndia) {
							// India structure - keep existing fields
							if (contact.tax_number) {
								transformedContact.gstin = contact.tax_number ?? '';
							}
							// Handle address tax number for India
							if (contact.address && typeof contact.address === 'object' && contact.address !== null && 'tax_number' in contact.address) {
								const addressObj = contact.address as IDataObject;
								transformedContact.address = {
									...addressObj,
									gstin: addressObj.tax_number
								};
								delete (transformedContact.address as IDataObject).tax_number;
							}
						} else {
							// UAE structure - map tax_number to tax_id and contact_id to id
							if (contact.tax_number) {
								transformedContact.tax_id = contact.tax_number ?? '';
							}
							// Always remove tax_number for UAE structure and ensure tax_id is present
							delete transformedContact.tax_number;
							if (!transformedContact.tax_id) {
								transformedContact.tax_id = contact.tax_number ?? '';
							}
							// Map contact_id to id for UAE structure
							if (contact.contact_id) {
								transformedContact.id = contact.contact_id;
								delete transformedContact.contact_id;
							}

							// Handle address tax number for UAE
							if (contact.address && typeof contact.address === 'object' && contact.address !== null && 'tax_number' in contact.address) {
								const addressObj = contact.address as IDataObject;
								transformedContact.address = {
									...addressObj,
									trn_number: addressObj.tax_number
								};
								delete (transformedContact.address as IDataObject).tax_number;
							}

							// Remove unwanted keys for UAE contact
							delete transformedContact.tax_number;
							delete transformedContact.contact_id;

							// Keep only the necessary fields for UAE contact
							const uaeContactFields = ['id', 'name', 'business_name', 'tax_id', 'email', 'mobile', 'business_country', 'country_code', 'place_of_supply', 'address'];
							const cleanedContact: any = {};

							uaeContactFields.forEach(field => {
								if (transformedContact[field] !== undefined) {
									cleanedContact[field] = transformedContact[field];
								}
							});

							transformedContact = cleanedContact;
						}

						// Format receipt date to YYYY-MM-DD format (date only, no time)
						if (additionalFields.receipt_date) {
							const receiptDate = new Date(additionalFields.receipt_date as string);
							additionalFields.receipt_date = receiptDate.toISOString().split('T')[0];
						}

						// Build the receipt body based on the JSON structure
						const body: IDataObject = {
							contact: transformedContact,
							amount: parseFloat(amount),
							payment_method: paymentMethod,
							coa_id: parseInt(coaId),
						};

						if(additionalFields.transaction_number) {
							body.transaction_number = additionalFields.transaction_number;
						}

						// Fetch branch data if seller_branch_id is provided (India only)
						if (isIndia && sellerBranchId && sellerBranchId.trim() !== '') {
							try {
								// Fetch branch data directly
								const branchOptions: IHttpRequestOptions = {
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
								// Continue without seller_info if branch fetch fails
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

						// Add region-specific fields
						if (additionalFields.auto_mode !== undefined) {
							body.auto_mode = additionalFields.auto_mode;
						}
						if (additionalFields.bank_branch) {
							body.bank_branch = additionalFields.bank_branch;
						}
						if (additionalFields.branch_id) {
							body.branch_id = additionalFields.branch_id;
						}

						options.method = 'POST';
						options.url = `${baseUrl}/receipt`;
						options.body = body;
						console.log('body', body);
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
						// Contact ID filter only works for India region
						const contactIdFilter = isIndia ? `&filter.contact_id=${filters.contact_id ?? ''}` : '';
						options.url = `${baseUrl}/receipt?page_size=${pageSize ?? 5}&filter.date_from=${filters.date_from ?? ''}&filter.date_to=${filters.date_to ?? ''}&filter.recon_status=${filters.recon_status ?? ''}${contactIdFilter}&filter.search=${filters.search ?? ''}`;
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
						const currency = this.getNodeParameter('currency', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
						const specialized_supply = this.getNodeParameter('specialized_supply', i) as string;

						// Validate required contact fields
						if (!contactId || contactId === '') {
							throw new ApplicationError('Contact ID is required for creating purchase invoice', { level: 'warning' });
						}

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
							currency: currency,
						}
						if(taxType === '1' || taxType === '2') {
							const pos = this.getNodeParameter('pos', i) as string;
							const supplierState = this.getNodeParameter('supplier_state', i) as string;
							body.business_info = {
								pos: pos,
							}
							body.seller_info = {
								supplier_state: supplierState,
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
						// Validate required item fields
						if (!items || items.length === 0) {
							throw new ApplicationError('At least one item is required for creating purchase invoice', { level: 'warning' });
						}

						for (let j = 0; j < items.length; j++) {
							const item = items[j];
							if (!item.item_name || item.item_name === '') {
								throw new ApplicationError(`Item Name is required for item ${j + 1}`, { level: 'warning' });
							}
							if (!item.item_code || item.item_code === '') {
								throw new ApplicationError(`SAC/HSN Code is required for item ${j + 1}`, { level: 'warning' });
							}

							// Validate numeric fields - must be integers and not empty
							if (item.pid === '' || item.pid === null || item.pid === undefined) {
								throw new ApplicationError(`Item ID (PID) is required for item ${j + 1}`, { level: 'warning' });
							}
							const pidValue = Number(item.pid);
							if (!Number.isInteger(pidValue) || pidValue <= 0) {
								throw new ApplicationError(`Item ID (PID) must be an integer > 0 for item ${j + 1}`, { level: 'warning' });
							}

							if (item.vid === '' || item.vid === null || item.vid === undefined) {
								throw new ApplicationError(`Variant ID is required for item ${j + 1}`, { level: 'warning' });
							}
							const variantIdValue = Number(item.vid);
							if (!Number.isInteger(variantIdValue) || variantIdValue <= 0) {
								throw new ApplicationError(`Variant ID must be an integer > 0 for item ${j + 1}`, { level: 'warning' });
							}

							if (item.rate === '' || item.rate === null || item.rate === undefined) {
								throw new ApplicationError(`Rate is required for item ${j + 1}`, { level: 'warning' });
							}
							const rateValue = Number(item.rate);
							if (!Number.isInteger(rateValue) || rateValue < 0) {
								throw new ApplicationError(`Rate must be an integer >= 0 for item ${j + 1}`, { level: 'warning' });
							}

							if (item.non_taxable_amount === '' || item.non_taxable_amount === null || item.non_taxable_amount === undefined) {
								throw new ApplicationError(`Non Taxable Amount is required for item ${j + 1}`, { level: 'warning' });
							}
							const nonTaxableValue = Number(item.non_taxable_amount);
							if (!Number.isInteger(nonTaxableValue) || nonTaxableValue < 0) {
								throw new ApplicationError(`Non Taxable Amount must be an integer >= 0 for item ${j + 1}`, { level: 'warning' });
							}

							if (item.taxable_amount === '' || item.taxable_amount === null || item.taxable_amount === undefined) {
								throw new ApplicationError(`Taxable Amount is required for item ${j + 1}`, { level: 'warning' });
							}
							const taxableValue = Number(item.taxable_amount);
							if (!Number.isInteger(taxableValue) || taxableValue < 0) {
								throw new ApplicationError(`Taxable Amount must be an integer >= 0 for item ${j + 1}`, { level: 'warning' });
							}

							// Validate that taxable_amount is equal to or less than rate
							if (taxableValue > rateValue) {
								throw new ApplicationError(`Taxable Amount cannot be greater than Rate for item ${j + 1}`, { level: 'warning' });
							}

							if(item.quantity === undefined || item.quantity === null || item.quantity === '') {
								throw new ApplicationError(`Quantity is required for item ${j + 1}`, { level: 'warning' });
							}
							if(!item.item_type || item.item_type === '') {
								throw new ApplicationError(`Item Type is required for item ${j + 1}`, { level: 'warning' });
							}

							if(item.price_type === undefined || item.price_type === null || item.price_type === '') {
								throw new ApplicationError(`Price Type is required for item ${j + 1}`, { level: 'warning' });
							}
							if(!item.gst_rate || item.gst_rate === '') {
								throw new ApplicationError(`${isIndia ? 'GST' : 'VAT'} Rate is required for item ${j + 1}`, { level: 'warning' });
							}
							if(rateValue && nonTaxableValue) {
								if(rateValue < nonTaxableValue) {
									throw new ApplicationError(`Non-Taxable Amount cannot be greater than Rate for item ${j + 1}`, { level: 'warning' });
								}
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
								"rate": parseFloat(item.rate as string) ?? '',
								"cess_type": item.cess_type ?? '',
								"cess_per": item.cess_per ?? '',
								"taxable_amt": item.taxable_amount ?? '',
								"gst_rate": parseInt(item.gst_rate as string) ?? 5,
								"non_taxable_amt": parseInt(item.non_taxable_amount as string) ?? 0,
								"discount": item.item_discount ?? '',
								"vid":item.vid,
								"expense_id": expense_id,
								"expense_type": expense_type,
							})
						}
						if(additionalFields.bill_number) {
							body.bill_number = additionalFields.bill_number;
						}
						if(additionalFields.currency_info) {
							const currencyInfo = additionalFields.currency_info as IDataObject;
							body.currency_info = {
								currency_rate: parseFloat(currencyInfo.currency_rate as string) ?? 0,
								currency_default_rate: parseFloat(currencyInfo.currency_default_rate as string) ?? 0,
								converted_amount: parseFloat(currencyInfo.converted_amount as string) ?? 0,
								from: currencyInfo.from as string,
								to: currencyInfo.to as string,
							}
						}
						if(additionalFields.reverse_charge) {
							body.reverse_charge = additionalFields.reverse_charge;
						}
						if(additionalFields.tax_credit_type) {
							body.tax_credit_type = additionalFields.tax_credit_type;
						}
						if(additionalFields.terms_conditions) {
							body.terms_conditions = additionalFields.terms_conditions;
						}
						if(specialized_supply) {
							if(specialized_supply === '1') {
								const export_bill_no = this.getNodeParameter('export_bill_no', i) as string;
								const export_bill_date = this.getNodeParameter('export_bill_date', i) as string;
								const export_port_code = this.getNodeParameter('export_port_code', i) as string;

								// Validate mandatory export details
								if (!export_bill_no || export_bill_no.trim() === '') {
									throw new ApplicationError('Export Bill Number is required when Specialized Supply is Import', { level: 'warning' });
								}
								if (!export_bill_date || export_bill_date.trim() === '') {
									throw new ApplicationError('Export Bill Date is required when Specialized Supply is Import', { level: 'warning' });
								}
								if (!export_port_code || export_port_code.trim() === '') {
									throw new ApplicationError('Export Port Code is required when Specialized Supply is Import', { level: 'warning' });
								}

								body.spl_supply = 1;
								body.export_details = {
									export_bill_no: export_bill_no,
									export_bill_date: export_bill_date,
									export_port_code: export_port_code,
								}
							}
							else{
								body.spl_supply = parseInt(specialized_supply as string);
							}
						}
						options.method = 'POST';
						options.url = `${baseUrl}/purchase-invoice`;
						options.body = body;
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
								body.amount = parseFloat(amount as string);
								body.tax_rate = parseInt(taxRate as string) ?? 5;
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
										amount: parseFloat(account.amount as string),
										tax: parseInt(account.tax as string) ?? 5,
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
							body.amount = parseFloat(amount as string);
							body.contact_id = contactId;
							const additionalFields_type2 = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
							if(additionalFields_type2.reconcile_details) {
								const reconcileDetails = this.getNodeParameter('additionalFields.reconcile_details.reconcile', i, []) as IDataObject[];
								body.reconcile_details = [];
								for(let j = 0; j < reconcileDetails.length; j++){
									const reconcile = reconcileDetails[j];
									(body.reconcile_details as any[]).push({
										purchase_id: parseInt(reconcile.purchase_invoice_id as string),
										amount: parseFloat(reconcile.amount as string),
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
							body.amount = parseFloat(amount as string);
							body.salary_month = salary_month;

							// Only include salary details fields that have data
							const salaryDetailsPayload: any = {};
							if (salary_details.employer_esi && salary_details.employer_esi !== '') {
								salaryDetailsPayload.er_esi = parseFloat(salary_details.employer_esi as string);
							}
							if (salary_details.employer_pf && salary_details.employer_pf !== '') {
								salaryDetailsPayload.er_pf = parseFloat(salary_details.employer_pf as string);
							}
							if (salary_details.esi && salary_details.esi !== '') {
								salaryDetailsPayload.esi = parseFloat(salary_details.esi as string);
							}
							if (salary_details.tds && salary_details.tds !== '') {
								salaryDetailsPayload.tds = parseFloat(salary_details.tds as string);
							}
							if (salary_details.pt && salary_details.pt !== '') {
								salaryDetailsPayload.p_tax = parseFloat(salary_details.pt as string);
							}
							if (salary_details.pf && salary_details.pf !== '') {
								salaryDetailsPayload.pf = parseFloat(salary_details.pf as string);
							}
							if (salary_details.welfare && salary_details.welfare !== '') {
								salaryDetailsPayload.welfare = parseFloat(salary_details.welfare as string);
							}

							// Only add salary_details to body if there are any fields with data
							if (Object.keys(salaryDetailsPayload).length > 0) {
								body.salary_details = salaryDetailsPayload;
							}
						}
						options.method = 'POST';
						options.url = `${baseUrl}/vouchers`;
						options.body = body;
					} else if(operation === 'listPurchaseInvoices') {
						const pageSize = this.getNodeParameter('page_size', i) as number;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						// Validate date range - both from and to dates must be provided if either is selected
						if ((filters.from_date && !filters.to_date) || (!filters.from_date && filters.to_date)) {
							throw new ApplicationError('Both Date From and Date To must be provided for date range filtering', { level: 'warning' });
						}
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
					} else if(operation === 'listVouchers') {
						const voucherType = this.getNodeParameter('voucher_type', i) as string;
						const pageSize = this.getNodeParameter('page_size', i) as number;
						const filters = this.getNodeParameter('filters', i) as IDataObject;
						// Validate date range - both from and to dates must be provided if either is selected
						if ((filters.from_date && !filters.to_date) || (!filters.from_date && filters.to_date)) {
							throw new ApplicationError('Both Date From and Date To must be provided for date range filtering', { level: 'warning' });
						}

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
					} else if(operation === 'viewPurchaseInvoice') {
						const purchaseInvoiceId = this.getNodeParameter('id', i) as string;
						options.method = 'GET';
						options.url = `${baseUrl}/purchase-invoice/${purchaseInvoiceId}`;
					} else if(operation === 'viewVoucher') {
						const voucherId = this.getNodeParameter('id', i) as string;
						options.method = 'GET';
						options.url = `${baseUrl}/vouchers/${voucherId}`;

					// ========== HRMS OPERATIONS ==========
					} else if (operation === 'getAllEmployees') {
						const filters = this.getNodeParameter('filters', i, {}) as IDataObject;
						const pageSize = this.getNodeParameter('perpage', i, 10) as number;

						const payload = {
							pagination: {
								perpage: pageSize,
								page: 1,
							},
							sort: {
								field: filters.sortField ?? '',
								sort: filters.sort ?? 'DESC'
							}
						} as any;

						if (filters.query && filters.query !== '') {
							payload.pagination.query = filters.query;
						}
						if (filters.status !== undefined && filters.status !== '') {
							payload.status = filters.status;
						}
						if (filters.attendance_status !== undefined && filters.attendance_status !== '') {
							payload.attendance_status = filters.attendance_status;
						}

						options.method = 'GET';
						options.url = `${baseUrl}/hr/employee?param=${btoa(JSON.stringify(payload))}`;
					} else if (operation === 'addEmployee') {
						const title = this.getNodeParameter('title', i) as string;
						const name = this.getNodeParameter('name', i) as string;
						const branch = this.getNodeParameter('branch', i) as string;
						const dateOfJoin = this.getNodeParameter('dateOfJoin', i) as string;
						const personalMobile = this.getNodeParameter('personalMobile', i) as string;
						const officeEmail = this.getNodeParameter('officeEmail', i) as string;
						const employeeStatus = this.getNodeParameter('employeeStatus', i) as string;
						const dateOfBirth = this.getNodeParameter('dateOfBirth', i) as string;
						const gender = this.getNodeParameter('gender', i) as string;
						const employeeId = this.getNodeParameter('employeeId', i) as string;
						const additionalFields = this.getNodeParameter('additionalFields', i, {}) as IDataObject;
						// Validate required fields
						if (!name || name.trim() === '') {
							throw new ApplicationError('Name is required', { level: 'warning' });
						}
						if (!branch) {
							throw new ApplicationError('Branch is required', { level: 'warning' });
						}
						if (!dateOfJoin || dateOfJoin.trim() === '') {
							throw new ApplicationError('Date of Join is required', { level: 'warning' });
						}
						if (!personalMobile || personalMobile.trim() === '') {
							throw new ApplicationError('Personal Mobile is required', { level: 'warning' });
						}
						if (!officeEmail || officeEmail.trim() === '') {
							throw new ApplicationError('Office Email is required', { level: 'warning' });
						}
						if (!employeeId || employeeId.trim() === '') {
							throw new ApplicationError('Employee ID is required', { level: 'warning' });
						}

						// Build the body with correct API field names
						const body: IDataObject = {
							employee_status: employeeStatus,
							gender: gender,
							name: name,
							branch: parseInt(branch),
							doj: new Date(dateOfJoin).toISOString().split('T')[0],
							personal_mobile: parseInt(personalMobile),
							office_email: officeEmail,
							dob: new Date(dateOfBirth).toISOString().split('T')[0],
							employee_id: employeeId,
						};

						// Add title if provided
						if (title) {
							body.title = title;
						}

						// Handle additional fields with correct API field names
						if (additionalFields.designation) {
							body.designation = additionalFields.designation;
						}
						if (additionalFields.department) {
							body.department = additionalFields.department;
						}
						if (additionalFields.personalEmail) {
							body.personal_email = additionalFields.personalEmail;
						}
						if (additionalFields.pan) {
							body.pan = additionalFields.pan;
						}
						if (additionalFields.officeMobile) {
							body.office_mobile = parseInt(additionalFields.officeMobile as string);
						}
						if (additionalFields.reportingTo) {
							body.reporting_to = additionalFields.reportingTo;
						}
						if (additionalFields.fatherName) {
							body.father_name = additionalFields.fatherName;
						}
						if (additionalFields.employmentType) {
							body.employment_type = additionalFields.employmentType;
						}
						if (additionalFields.bloodGroup) {
							body.blood_group = additionalFields.bloodGroup;
						}
						if (additionalFields.maritalStatus) {
							body.marital_status = additionalFields.maritalStatus;
						}
						if (additionalFields.emergencyContact) {
							body.emergency_contact = parseInt(additionalFields.emergencyContact as string);
						}
						if (additionalFields.aadhar) {
							body.aadhar = parseInt(additionalFields.aadhar as string);
						}
						if (additionalFields.religion) {
							body.religion = additionalFields.religion;
						}
						if (additionalFields.employeeAccountName) {
							body.employee_account_name = additionalFields.employeeAccountName;
						}
						if (additionalFields.employeeAccountNumber) {
							body.employee_account_number = parseInt(additionalFields.employeeAccountNumber as string);
						}
						if (additionalFields.employeeBankBranch) {
							body.employee_bank_branch = additionalFields.employeeBankBranch;
						}
						if (additionalFields.employeeBankName) {
							body.employee_bank_name = additionalFields.employeeBankName;
						}
						if (additionalFields.employeeIfscCode) {
							body.employee_ifsc_code = additionalFields.employeeIfscCode;
						}
						if (additionalFields.employeeAccountType) {
							body.employee_account_type = additionalFields.employeeAccountType;
						}
						if (additionalFields.uanNumber) {
							body.uan_number = parseInt(additionalFields.uanNumber as string);
						}
						if (additionalFields.esiNumber) {
							body.esi_number = parseInt(additionalFields.esiNumber as string);
						}
						if (additionalFields.bid) {
							body.bid = additionalFields.bid;
						}
						if (additionalFields.shift) {
							// Validate shift timing format: HH:MM:SS-HH:MM:SS
							const shiftPattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
							if (!shiftPattern.test(additionalFields.shift as string)) {
								throw new ApplicationError('Shift timing must be in format HH:MM:SS-HH:MM:SS (e.g., 09:00:00-18:00:00)', { level: 'warning' });
							}
							body.shift = additionalFields.shift;
						}

						// Handle address fields - convert from fixedCollection to arrays
						if (additionalFields.presentAddress && (additionalFields.presentAddress as any).address && Array.isArray((additionalFields.presentAddress as any).address)) {
							body.present_address = (additionalFields.presentAddress as any).address.map((addr: any) => ({
								city: addr.city,
								state: addr.state,
								country: addr.country,
								pincode: addr.pincode,
								address_line1: addr.addressLine1,
								address_line2: addr.addressLine2,
							}));
						}
						if (additionalFields.permanentAddress && (additionalFields.permanentAddress as any).address && Array.isArray((additionalFields.permanentAddress as any).address)) {
							body.permanent_address = (additionalFields.permanentAddress as any).address.map((addr: any) => ({
								city: addr.city,
								state: addr.state,
								country: addr.country,
								pincode: addr.pincode,
								address_line1: addr.addressLine1,
								address_line2: addr.addressLine2,
							}));
						}

						options.method = 'POST';
						options.url = `${baseUrl}/hr/employee`;
						options.body = body;
					} else if (operation === 'updateEmployee') {
						const gid = this.getNodeParameter('gid', i) as string;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

						if (!gid || gid.trim() === '') {
							throw new ApplicationError('GID is required', { level: 'warning' });
						}

						// Check if status is being changed from active to inactive (requires exit fields)
						if (updateFields.employeeStatus && updateFields.employeeStatus !== 1) {
							if (!updateFields.dateOfExit || updateFields.dateOfExit === '') {
								throw new ApplicationError('Date of Exit is required when changing employee status from active', { level: 'warning' });
							}
							if (!updateFields.exitDescription || updateFields.exitDescription === '') {
								throw new ApplicationError('Exit Description is required when changing employee status from active', { level: 'warning' });
							}
						}

						const body: IDataObject = {
							gid: gid,
						};

						// Check if at least one field is provided for update (other than gid)
						if (!updateFields || Object.keys(updateFields).length === 0) {
							throw new ApplicationError('At least one field must be provided for update', { level: 'warning' });
						}

						// Handle update fields with proper API field mapping
						for (const [key, value] of Object.entries(updateFields)) {
							if (value !== undefined && value !== null) {
								// Date fields
								if (key === 'dateOfJoin') {
									const dateOfJoin = new Date(value as string);
									body.doj = dateOfJoin.toISOString().split('T')[0];
								} else if (key === 'dateOfBirth') {
									const dateOfBirth = new Date(value as string);
									body.dob = dateOfBirth.toISOString().split('T')[0];
								} else if (key === 'dateOfExit') {
									const dateOfExit = new Date(value as string);
									body.date_of_exit = dateOfExit.toISOString().split('T')[0];
								}
								// Mobile number fields (convert to integer)
								else if (key === 'personalMobile') {
									body.personal_mobile = parseInt(value as string);
								} else if (key === 'officeMobile') {
									body.office_mobile = parseInt(value as string);
								} else if (key === 'emergencyContact') {
									body.emergency_contact = parseInt(value as string);
								}
								// Other field mappings
								else if (key === 'officeEmail') {
									body.office_email = value;
								} else if (key === 'personalEmail') {
									body.personal_email = value;
								} else if (key === 'employeeStatus') {
									body.employee_status = value;
								} else if (key === 'employeeId') {
									body.employee_id = value;
								} else if (key === 'fatherName') {
									body.father_name = value;
								} else if (key === 'employmentType') {
									body.employment_type = value;
								} else if (key === 'bloodGroup') {
									body.blood_group = value;
								} else if (key === 'maritalStatus') {
									body.marital_status = value;
								} else if (key === 'reportingTo') {
									body.reporting_to = value;
								} else if (key === 'employeeAccountName') {
									body.employee_account_name = value;
								} else if (key === 'employeeAccountNumber') {
									body.employee_account_number = parseInt(value as string);
								} else if (key === 'employeeBankBranch') {
									body.employee_bank_branch = value;
								} else if (key === 'employeeBankName') {
									body.employee_bank_name = value;
								} else if (key === 'employeeIfscCode') {
									body.employee_ifsc_code = value;
								} else if (key === 'employeeAccountType') {
									body.employee_account_type = value;
								} else if (key === 'uanNumber') {
									body.uan_number = parseInt(value as string);
								} else if (key === 'esiNumber') {
									body.esi_number = parseInt(value as string);
								} else if (key === 'aadhar') {
									body.aadhar = parseInt(value as string);
								}
								// Address fields - convert from fixedCollection to arrays
								else if (key === 'presentAddress' && value && (value as any).address && Array.isArray((value as any).address)) {
									body.present_address = (value as any).address.map((addr: any) => ({
										city: addr.city,
										state: addr.state,
										country: addr.country,
										pincode: addr.pincode,
										address_line1: addr.addressLine1,
										address_line2: addr.addressLine2,
									}));
								} else if (key === 'permanentAddress' && value && (value as any).address && Array.isArray((value as any).address)) {
									body.permanent_address = (value as any).address.map((addr: any) => ({
										city: addr.city,
										state: addr.state,
										country: addr.country,
										pincode: addr.pincode,
										address_line1: addr.addressLine1,
										address_line2: addr.addressLine2,
									}));
								}
								// Branch field (convert to integer)
								else if (key === 'branch') {
									body.branch = parseInt(value as string);
								}
								// Exit description field
								else if (key === 'exitDescription') {
									body.exit_description = value;
								}
								// Shift timing validation
								else if (key === 'shift') {
									// Validate shift timing format: HH:MM:SS-HH:MM:SS
									const shiftPattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]-([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
									if (!shiftPattern.test(value as string)) {
										throw new ApplicationError('Shift timing must be in format HH:MM:SS-HH:MM:SS (e.g., 09:00:00-18:00:00)', { level: 'warning' });
									}
									body[key] = value;
								}
								// Default case for other fields
								else {
									body[key] = value;
								}
							}
						}

						options.method = 'PUT';
						options.url = `${baseUrl}/hr/employee`;
						options.body = body;
					} else if (operation === 'getEmployee') {
						const gid = this.getNodeParameter('gid', i) as string;

						if (!gid || gid.trim() === '') {
							throw new ApplicationError('GID is required', { level: 'warning' });
						}

						options.method = 'GET';
						options.url = `${baseUrl}/hr/employee/${gid}`;
					} else if (operation === 'getBankDetails') {
						// Get parameters from client
						const selectedAccount = this.getNodeParameter('selectedAccount', i) as string;
						const fromDateRaw = this.getNodeParameter('fromDate', i) as string;
						const toDateRaw = this.getNodeParameter('toDate', i) as string;
						const bank = this.getNodeParameter('bank', i) as string;
						// Check if account is selected
						if (!selectedAccount || selectedAccount === '') {
							throw new ApplicationError('Please select a bank account', { level: 'warning' });
						}

						// Parse selected account (format: "URN|AccountNumber")
						const [urn, accountNumber] = selectedAccount.split('|');
						if (!urn || !accountNumber) {
							throw new ApplicationError('Invalid account selection. Please select a valid bank account', { level: 'warning' });
						}

						// Format dates to DD-MM-YYYY format
						const formatDate = (dateStr: string): string => {
							const date = new Date(dateStr);
							const day = String(date.getDate()).padStart(2, '0');
							const month = String(date.getMonth() + 1).padStart(2, '0');
							const year = date.getFullYear();
							return `${day}-${month}-${year}`;
						};

						const fromDate = formatDate(fromDateRaw);
						const toDate = formatDate(toDateRaw);

						// Set up the request options like other operations
						options.method = 'POST';
						options.url = `${baseUrl}/banking/${bank}`;
						options.body = {
							operation: 'account-statement-sync',
							urn: urn,
							account: accountNumber,
							fromDate: fromDate,
							toDate: toDate
						};
					} else if (operation === 'getGSTReturnStatus') {
						const gstin = this.getNodeParameter('gstin', i) as string;
						options.method = 'POST';
						options.url = `${baseUrl}/gst/return-status`;
						options.body = {
							gstin,
							force:1,
						}
					} else if (operation === 'getGSTSearch') {
						const gstin = this.getNodeParameter('gstin', i) as string;
						options.method = 'POST';
						options.url = `${baseUrl}/gst/search`;
						options.body = {
							gstin,
						}
					}
					const result = await this.helpers.request(options);
					returnData.push({ json: result, pairedItem: { item: i } });
		} catch (error) {
			if (continueOnFail) {
				returnData.push({ json: { error: (error as Error).message }, pairedItem: { item: i } });
				continue;
			}
			throw error;
		}
	}

	return [returnData];
}
