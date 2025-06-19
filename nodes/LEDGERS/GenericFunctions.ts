import type { IExecuteFunctions, IRequestOptions } from 'n8n-workflow';
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
	const returnData = [];

	const credentials = await this.getCredentials('ledgersApi');
	if (!credentials || !credentials.xApiKey || !credentials.email || !credentials.password) {
		throw new ApplicationError('Missing required credentials: xApiKey, email, or password', {
			level: 'warning',
		});
	}

	const { xApiKey, email, password } = credentials;
	const baseUrl = 'https://in-api.ledgers.cloud/v3';

	// Step 1: Authenticate and get api_token
	let apiToken: string;
	try {
		const loginOptions: IRequestOptions = {
			method: 'POST',
			url: 'https://in-api.ledgers.cloud/login',
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

	// Step 2: Proceed with operation
	for (let i = 0; i < items.length; i++) {
		const continueOnFail = this.continueOnFail?.();
		try{
			const operation = this.getNodeParameter('operation', i);
			const options: IRequestOptions = {
				method: 'GET',
				url: '',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': xApiKey,
					'api-token': apiToken,
				},
				json: true,
			};

			if (operation === 'createContact') {
				const contactName = this.getNodeParameter('contactName', i);
				const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, string>;
				const mobileRaw = additionalFields.mobile;
				const selectedDialCode = additionalFields.mobile_country_code || '+91';
				const isoCode = dialCodeToCountryCode[selectedDialCode] || 'in';

				if (mobileRaw) {
					additionalFields.mobile = `${mobileRaw}|${isoCode}`;
				}
				additionalFields.mobile_country_code = selectedDialCode;
				options.method = 'POST';
				options.url = `${baseUrl}/contact`;
				options.body = { contact_name: contactName, ...additionalFields };
			}
			else if (operation === 'updateContact') {
				const contactId = this.getNodeParameter('contactId', i);
				const updateFields = this.getNodeParameter('contactAdditionalFields', i) as Record<string, string>;

				// Initialize body with contact_id
				const body: Record<string, any> = { contact_id: contactId };

				// Only add fields that have values
				for (const [key, value] of Object.entries(updateFields)) {
					if (value !== undefined && value !== null && value !== '') {
						if (key === 'mobile') {
							const selectedDialCode = updateFields.mobile_country_code || '+91';
							const isoCode = dialCodeToCountryCode[selectedDialCode] || 'in';
							body[key] = `${value}|${isoCode}`;
							body.mobile_country_code = selectedDialCode;
						} else if(key == 'billing_address1' || key == 'billing_address2' || key == 'city' || key == 'state' || key == 'country' || key == 'pincode') {
							body.billing_address = [{
								billing_address1: updateFields.billing_address1 ?? '',
								billing_address2: updateFields.billing_address2 ?? '',
								city: updateFields.city ?? '',
								state: updateFields.state ?? '',
								country: updateFields.country ?? '',
								pincode: updateFields.pincode ?? '',
							}];
						} else {
							body[key] = value;
						}
					}
				}

				options.method = 'PUT';
				options.url = `${baseUrl}/contact`;
				options.body = body;
				console.log(options.body);
			}
			else if (operation === 'addAddress') {
				const contactId = this.getNodeParameter('contactId', i);
				const addressType = this.getNodeParameter('addressType', i) as string;
				const addressFields = this.getNodeParameter('addressFields', i) as Record<string, string>;

				// Initialize body with contact_id
				const body: Record<string, any> = { contact_id: contactId };

				// Create address object
				const addressObject = {
					billing_address1: addressFields.address1 || '',
					billing_address2: addressFields.address2 || '',
					location: addressFields.location || '',
					state: addressFields.state || '',
					country: addressFields.country || '',
					pincode: addressFields.pincode || '',
				};

				// Add address based on type
				if (addressType === 'billing') {
					body.billing_address = [addressObject];
				} else if (addressType === 'shipping') {
					body.shipping_address = [addressObject];
				} else if (addressType === 'both') {
					body.billing_address = [addressObject];
					body.shipping_address = [addressObject];
				}

				options.method = 'PUT';
				options.url = `${baseUrl}/contact`;
				options.body = body;
				console.log(options.body);
			}
			else if (operation === 'updateAddress') {
				const contactId = this.getNodeParameter('contactId', i);
				const addressType = this.getNodeParameter('addressType', i) as string;
				const addressFields = this.getNodeParameter('addressFields', i) as Record<string, string>;

				// Initialize body with contact_id
				const body: Record<string, any> = { contact_id: contactId };

				// Create address object with only provided fields
				const addressObject: Record<string, any> = {};
				if (addressFields.address1 !== undefined && addressFields.address1 !== '') addressObject.address1 = addressFields.address1;
				if (addressFields.address2 !== undefined && addressFields.address2 !== '') addressObject.address2 = addressFields.address2;
				if (addressFields.city !== undefined && addressFields.city !== '') addressObject.city = addressFields.city;
				if (addressFields.state !== undefined && addressFields.state !== '') addressObject.state = addressFields.state;
				if (addressFields.country !== undefined && addressFields.country !== '') addressObject.country = addressFields.country;
				if (addressFields.pincode !== undefined && addressFields.pincode !== '') addressObject.pincode = addressFields.pincode;

				// Add address based on type
				if (addressType === 'billing') {
					body.billing_address = [addressObject];
				} else if (addressType === 'shipping') {
					body.shipping_address = [addressObject];
				} else if (addressType === 'both') {
					body.billing_address = [addressObject];
					body.shipping_address = [addressObject];
				}

				options.method = 'PUT';
				options.url = `${baseUrl}/contact`;
				options.body = body;
				console.log(options.body);
			}
			else if (operation === 'getContact') {
				const contactId = this.getNodeParameter('contactId', i);
				options.url = `${baseUrl}/contact/${contactId}`;
			}
			else if (operation === 'getAllContacts') {
				const perPageRaw = this.getNodeParameter('perPage', i);
				const perPage = typeof perPageRaw === 'object' ? '' : String(perPageRaw);
				const searchType = String(this.getNodeParameter('searchType', i));
				let search_term = '';
				if (searchType === 'name') {
					const searchTermRaw = this.getNodeParameter('searchTerm', i) ?? '';
					search_term = typeof searchTermRaw === 'object' ? '' : String(searchTermRaw);
				}
				options.url = `${baseUrl}/contact?perpage=${perPage}&search_term=${search_term}`;
			}
			else if (operation === 'createCatalog') {
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
				console.log(options.body);
			}
			else if (operation === 'updateCatalog') {
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
			}
			else if (operation === 'updateVariant'){
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
				console.log(options.body);
			}
			else if (operation === 'getCatalog') {
				const catalogId = this.getNodeParameter('catalogId', i);
				console.log(catalogId);
				options.method = 'GET';
				options.url = `${baseUrl}/catalog/${catalogId}`;
			}
			else if (operation === 'getAllCatalogs') {
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
			}
			else if (operation === 'addVariant') {
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
				console.log(options.body);
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
