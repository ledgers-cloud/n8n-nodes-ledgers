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

	const { xApiKey, email, password } = credentials;
	const baseUrl = 'https://in-api.ledgers.cloud/v3';

	// Step 1: Authenticate and get api_token once for all items
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
				const additionalFields = this.getNodeParameter('additionalFields', i) as Record<string, string>;
				const mobileRaw = additionalFields.mobile;
				const selectedDialCode = additionalFields.mobile_country_code || '+91';
				const isoCode = dialCodeToCountryCode[selectedDialCode] || 'in';

				if (mobileRaw) {
					additionalFields.mobile = `${mobileRaw}|${isoCode}`;
				}

				additionalFields.mobile_country_code = selectedDialCode;
				let address = {
					billing_address1: additionalFields.billing_address1 ?? '',
					billing_address2: additionalFields.billing_address2 ?? '',
					location: additionalFields.location ?? '',
					state: additionalFields.state ?? '',
					country: additionalFields.country ?? '',
					pincode: additionalFields.pincode ?? '',
					email: additionalFields.email ?? '',
					gstin: additionalFields.gstin ?? '',
					mobile: additionalFields.mobile ?? '',
				}
				delete additionalFields.billing_address1;
				delete additionalFields.billing_address2;
				delete additionalFields.location;
				delete additionalFields.state;
				delete additionalFields.country;
				delete additionalFields.pincode;
				delete additionalFields.email;
				delete additionalFields.gstin;
				delete additionalFields.mobile;
				options.method = 'POST';
				options.url = `${baseUrl}/contact`;
				options.body = { contact_name: contactName, ...additionalFields, billing_address: [address] };
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
					url: `https://in-api.ledgers.cloud/v3/contact/${contactId}`,
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
				const addressToUpdateId = selectedAddress.id;

				// Start with the existing address data and only update fields that were provided
				const updatedAddress: IDataObject = {
					...selectedAddress, // Keep all existing data
					id: addressToUpdateId,
				};

				// Only update fields that were actually provided by the user
				if (updateFields.address1 !== undefined && updateFields.address1 !== '') {
					updatedAddress.address1 = updateFields.address1;
				}
				if (updateFields.address2 !== undefined && updateFields.address2 !== '') {
					updatedAddress.address2 = updateFields.address2;
				}
				if (updateFields.location !== undefined && updateFields.location !== '') {
					updatedAddress.location = updateFields.location;
					updatedAddress.city = updateFields.location;
				}
				if (updateFields.state !== undefined && updateFields.state !== '') {
					updatedAddress.state = updateFields.state;
				}
				if (updateFields.country !== undefined && updateFields.country !== '') {
					updatedAddress.country = updateFields.country;
				}
				if (updateFields.pincode !== undefined && updateFields.pincode !== '') {
					updatedAddress.pincode = updateFields.pincode;
				}
				if (updateFields.email !== undefined && updateFields.email !== '') {
					updatedAddress.email = updateFields.email;
				}
				if (updateFields.gstin !== undefined && updateFields.gstin !== '') {
					updatedAddress.gstin = updateFields.gstin;
				}
				if (updateFields.mobile !== undefined && updateFields.mobile !== '') {
					updatedAddress.mobile = updateFields.mobile;
				}

				const updatedAddresses = addresses.map((addr, index) =>
					index === addressSelector ? updatedAddress : addr,
				);

				delete updatedAddress.id;

				const body: IDataObject = {
					contact_id: contactId,
					[addressKey]: updatedAddresses,
				};

				console.log(body);

				options.method = 'PUT';
				options.url = `${baseUrl}/contact`;
				options.body = body;
			} else if (operation === 'getContact') {
				const contactId = this.getNodeParameter('contactId', i);
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
				options.url = `${baseUrl}/contact?perpage=${perPage}&search_term=${search_term}`;
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
				console.log(options.body);
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
				console.log(options.body);
			} else if (operation === 'getCatalog') {
				const catalogId = this.getNodeParameter('catalogId', i);
				console.log(catalogId);
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
