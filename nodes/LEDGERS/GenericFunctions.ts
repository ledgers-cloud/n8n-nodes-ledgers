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
	const indiaOps = ['contact', 'createContact', 'updateContact', 'addAddress', 'updateAddress', 'getContact', 'getAllContacts', 'catalog', 'createCatalog', 'updateCatalog', 'getCatalog', 'getAllCatalogs', 'invoice', 'createInvoice'];

	for (let i = 0; i < items.length; i++) {
		const operation = this.getNodeParameter('operation', i);
		const resource = this.getNodeParameter('resource', i);
		if (!indiaOps.includes(operation) && resource !== 'catalog' && resource !== 'invoice' && resource !== 'contact') {
			throw new ApplicationError('This operation/resource is only available for India API URL. Please update your credentials.');
		}
		// Catalog and Invoice always allowed
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
		let viewType: string | undefined;
		let invoiceId: string | undefined;
		if (operation === 'viewInvoice') {
			viewType = this.getNodeParameter('viewType', i) as string;
			invoiceId = this.getNodeParameter('invoiceId', i) as string;
		}
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

				// Extract billing address from fixedCollection
				let billingAddress: any = {};
				if (additionalFields.billing_address) {
					const b = additionalFields.billing_address;
					billingAddress = {
						billing_address1: b.billing_address1 ?? '',
						billing_address2: b.billing_address2 ?? '',
						billing_city: b.billing_city ?? '',
						billing_state: b.billing_state ?? '',
						billing_country: b.billing_country ?? '',
						address_email: b.address_email ?? '',
						address_gstin: b.address_gstin ?? '',
						address_mobile: b.address_mobile ?? '',
						billing_pincode: b.billing_pincode ?? '',
					};
				}

				// Extract shipping address from fixedCollection
				let shippingAddress: any = {};
				if (additionalFields.shipping_address) {
					const s = additionalFields.shipping_address;
					shippingAddress = {
						shipping_address1: s.shipping_address1 ?? '',
						shipping_address2: s.shipping_address2 ?? '',
						shipping_city: s.shipping_city ?? '',
						shipping_state: s.shipping_state ?? '',
						shipping_country: s.shipping_country ?? '',
						address_email: s.address_email ?? '',
						address_gstin: s.address_gstin ?? '',
						address_mobile: s.address_mobile ?? '',
						shipping_pincode: s.shipping_pincode ?? '',
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
					if (value !== undefined && value !== null && value !== '') {
						if (key === 'mobile') {
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
				console.log(options.body);
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
				// Handle cess_type and cess_value
				let cess_type_api, cess_api;
				if (additionalFields.cess_type && additionalFields.cess_value !== undefined) {
					if (additionalFields.cess_type === 'flat') {
						cess_type_api = 'flat_value';
						cess_api = additionalFields.cess_value;
					} else if (additionalFields.cess_type === 'percentage') {
						cess_type_api = 'percentage';
						cess_api = additionalFields.cess_value;
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
				// Handle cess_type and cess_value
				let cess_type_api, cess_api;
				if (updateFields.cess_type && updateFields.cess_value !== undefined) {
					if (updateFields.cess_type === 'flat') {
						cess_type_api = 'flat_value';
						cess_api = updateFields.cess_value;
					} else if (updateFields.cess_type === 'percentage') {
						cess_type_api = 'percentage';
						cess_api = updateFields.cess_value;
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
				options.url = `${baseUrl}/catalog?perpage=${perPage}&search_term=${search_term}`;
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

				const body: IDataObject = {
					contact,
					items,
					seller_branch_id,
					...additionalFields,
				};

				options.method = 'POST';
				options.url = `${baseUrl}/invoice`;
				options.body = body;
				console.log(options.body);
			} else if (operation === 'viewInvoice') {
				options.method = 'GET';
				options.url = `${baseUrl}/invoice/${invoiceId}`;
			} else if (operation === 'listInvoices') {
				const filters = this.getNodeParameter('filters', i) as IDataObject;
				const pageNumber = this.getNodeParameter('page_number', i) as number;
				const pageSize = this.getNodeParameter('page_size', i) as number;
				options.method = 'GET';
				options.url = `${baseUrl}/invoice?page_number=${pageNumber ?? 1}&page_size=${pageSize ?? 5}&filter.date_from=${filters.date_from ?? ''}&filter.date_to=${filters.date_to ?? ''}&filter.payment_status=${filters.payment_status ?? ''}&filter.contact_id=${filters.contact_id ?? ''}`;
				console.log(options.url);
			}
			const result = await this.helpers.request(options);

			// Handle automatic download for viewInvoice when viewAndDownload is selected
			if (operation === 'viewInvoice' && viewType === 'viewAndDownload') {
				console.log('Full result:', JSON.stringify(result, null, 2));

				// Check for PDF URL in different possible locations
				let pdfUrl: string | undefined;
				if (result.data && result.data.pdf_url) {
					pdfUrl = result.data.pdf_url;
				} else if (result.pdf_url) {
					pdfUrl = result.pdf_url;
				} else if (result.data && result.data[0] && result.data[0].pdf_url) {
					pdfUrl = result.data[0].pdf_url;
				} else if (result.data && Array.isArray(result.data)) {
					// Check if data is an array and look for pdf_url in first item
					for (const item of result.data) {
						if (item && item.pdf_url) {
							pdfUrl = item.pdf_url;
							break;
						}
					}
				}

				console.log('PDF URL found:', pdfUrl);

				if (pdfUrl) {
					try {
						// Download the PDF file
						console.log('Attempting to download PDF from:', pdfUrl);

						// Try with authentication headers first
						let pdfResponse;
						try {
							pdfResponse = await this.helpers.request({
								method: 'GET',
								url: pdfUrl,
								headers: {
									'Content-Type': 'application/pdf',
									'x-api-key': xApiKey,
									'api-token': apiToken,
								},
							}) as any;
						} catch (authError) {
							console.log('Download with auth failed, trying without auth headers');
							// Try without authentication headers
							pdfResponse = await this.helpers.request({
								method: 'GET',
								url: pdfUrl,
								headers: {
									'Content-Type': 'application/pdf',
								},
							}) as any;
						}

						console.log('PDF download response type:', typeof pdfResponse);
						console.log('PDF download response length:', pdfResponse ? pdfResponse.length : 'undefined');

						// Create a binary data item for the PDF
						const binaryData = {
							data: pdfResponse,
							fileName: `invoice_${invoiceId}.pdf`,
							mimeType: 'application/pdf',
						};

						returnData.push({
							json: result,
							binary: {
								['invoice.pdf']: binaryData,
							},
						});
					} catch (downloadError) {
						// If download fails, still return the invoice data but log the error
						console.error('Failed to download PDF:', downloadError);
						returnData.push({
							json: {
								...result,
								downloadError: 'Failed to download PDF file',
								downloadErrorDetails: (downloadError as Error).message,
							},
						});
					}
				} else {
					// No PDF URL found
					console.log('No PDF URL found in response');
					returnData.push({
						json: {
							...result,
							downloadError: 'No PDF URL found in the response',
						},
					});
				}
			} else {
				returnData.push({ json: result });
			}
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
