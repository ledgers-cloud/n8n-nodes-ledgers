import {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	INodeExecutionData,
	NodeConnectionType,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IRequestOptions,
	ApplicationError,
} from 'n8n-workflow';

import * as descriptions from './descriptions';
import { execute } from './GenericFunctions';

export class Ledgers implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LEDGERS',
		name: 'ledgers',
		group: ['transform'],
		version: 1,
		description: 'Interact with LEDGERS API',
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		defaults: {
			name: 'LEDGERS',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		icon: 'file:ledgers.svg',
		usableAsTool: true,
		credentials: [
			{
				name: 'ledgersApi',
				required: true,
			},
		],
		properties: [
			// Remove Country parameter
			// Resource dropdown: show all resources, add (India) or (UAE) to displayName for clarity
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Contact', value: 'contact' },
					{ name: 'Catalog', value: 'catalog' },
					{ name: 'Invoice', value: 'invoice' },
				],
				default: 'contact',
			},
			// Only India Contact Operations
			...descriptions.contactOperations,
			// Catalog and Invoice (always visible)
			...descriptions.catalogOperations,
			...descriptions.createInvoiceOperations,
		],
	};

	methods = {
		loadOptions: {
			async getHsnSacCodes(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const continueOnFail = this.getNode().continueOnFail;
				try{
					// TODO: Implement actual HSN/SAC codes loading from API
					// Your loadOptions code here
					const credentials = await this.getCredentials('ledgersApi');
					const { xApiKey, email, password } = credentials;

					// Authenticate to get api_token
					const loginOptions: IRequestOptions = {
						method: 'POST',
						url: 'https://in-api.ledgers.cloud/login',
						headers: {
							'Content-Type': 'application/json',
							'x-api-key': xApiKey,
						},
						body: { email, password },
						json: true,
					};

					const loginResponse = await this.helpers.request(loginOptions);

					if (loginResponse.status !== 200 || !loginResponse.api_token) {
						const errorMsg = loginResponse.errorMessage || 'Authentication failed. Check your credentials.';
						throw new ApplicationError(`Failed to login. ${errorMsg}`, {
							level: 'warning',
						});
					}

					const apiToken = loginResponse.api_token;

					// Fetch catalogName field value
					const catalogName = this.getNodeParameter('catalogName', undefined, { extractValue: false }) as string;
					const itemType = this.getNodeParameter('item_type', undefined, { extractValue: false }) as string;

					const options: IRequestOptions = {
						method: 'POST',
						url: 'https://devml-model.epiccrm.app/gst/get_hsn',
						headers: {
							'Content-Type': 'application/json',
							'x-api-key': 'VpAK5vReJz2Yvfl5oDFbt2nYj4llj0HI70w4nmcz',
							'api-token': apiToken,
						},
						body: {
							query: catalogName,
							provider: 'bedrock',
							version: 4,
							limit: 15,
						},
						json: true,
					};

					const responseData = await this.helpers.request(options);
					if (!responseData.result || !Array.isArray(responseData.result)) {
						throw new ApplicationError('HSN/SAC API did not return expected data structure', {
							level: 'warning',
						});
					}

					const returnData = [];
					for (const item of responseData.result) {
						if(itemType === 'goods'){
							if(item.code_type === 'HSC_CODE'){
								returnData.push({
									name: item.hsn_value + ' - ' + item.description,
									value: item.hsn_value,
								});
							}
						}
						else if(itemType === 'services'){
							if(item.code_type === 'SAC_CODE'){
								returnData.push({
									name: item.sac_value + ' - ' + item.description,
									value: item.sac_value,
								});
							}
						}
					}
					returnData.unshift({
						name: 'Manual Entry',
  					value: 'manualEntry',
					});

					return returnData;
				} catch (error) {
					if (continueOnFail) {
						return [];
					}
					throw error;
				}
			},
			async getCatalogVariants(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const continueOnFail = this.getNode().continueOnFail;
				try {
					const credentials = await this.getCredentials('ledgersApi');
					const { xApiKey, email, password } = credentials;

					// Authenticate to get api_token
					const loginOptions: IRequestOptions = {
						method: 'POST',
						url: 'https://in-api.ledgers.cloud/login',
						headers: {
							'Content-Type': 'application/json',
							'x-api-key': xApiKey,
						},
						body: { email, password },
						json: true,
					};

					const loginResponse = await this.helpers.request(loginOptions);

					if (loginResponse.status !== 200 || !loginResponse.api_token) {
						throw new ApplicationError('Authentication failed. Check your credentials.', {
							level: 'warning',
						});
					}

					const apiToken = loginResponse.api_token;
					const catalogId = this.getNodeParameter('catalogId', undefined, { extractValue: false }) as string;
					if (!catalogId) {
						return [];
					}

					const options: IRequestOptions = {
						method: 'GET',
						url: `https://in-api.ledgers.cloud/v3/catalog/${catalogId}`,
						headers: {
							'Content-Type': 'application/json',
							'x-api-key': xApiKey,
							'api-token': apiToken,
						},
						json: true,
					};

					const response = await this.helpers.request(options);

					// The API response structure is: { status: 'success', data: [ { ... , product_variants: [...] } ] }
					if (!response.data || !Array.isArray(response.data) || !response.data[0].product_variants || !Array.isArray(response.data[0].product_variants)) {
						return [];
					}

					return response.data[0].product_variants.map((variant: any) => ({
						name: variant.name,
						value: variant.id,
					}));
				} catch (error) {
					if (continueOnFail) {
						return [];
					}
					throw error;
				}
			},
			async getCoaAccounts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const continueOnFail = this.getNode().continueOnFail;
				try {
					const credentials = await this.getCredentials('ledgersApi');
					const { xApiKey, email, password } = credentials;

					// Authenticate to get api_token
					const loginOptions: IRequestOptions = {
						method: 'POST',
						url: 'https://in-api.ledgers.cloud/login',
						headers: {
							'Content-Type': 'application/json',
							'x-api-key': xApiKey,
						},
						body: { email, password },
						json: true,
					};

					const loginResponse = await this.helpers.request(loginOptions);

					if (loginResponse.status !== 200 || !loginResponse.api_token) {
						throw new ApplicationError('Authentication failed. Check your credentials.', {
							level: 'warning',
						});
					}

					const apiToken = loginResponse.api_token;

					const options: IRequestOptions = {
						method: 'GET',
						url: 'https://in-api.ledgers.cloud/v3/coa',
						headers: {
							'Content-Type': 'application/json',
							'x-api-key': xApiKey,
							'api-token': apiToken,
						},
						json: true,
					};

					const response = await this.helpers.request(options);

					if (!response.data || !Array.isArray(response.data)) {
						return [];
					}

					const returnData = [];
					for (const item of response.data) {
						if (item && item.id !== undefined && item.type && item.category) {
							const category = String(item.category).toUpperCase();
							const type = String(item.type).toUpperCase();
							returnData.push({
								name: `${category} — ${type}`,
								value: JSON.stringify({ id: String(item.id), name: `${type}` })
							});
						}
					}
					return returnData;
				} catch (error) {
					if (continueOnFail) {
						return [];
					}
					throw error;
				}
			},
			async getAddressOptions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const continueOnFail = this.getNode().continueOnFail;
				try {
					const contactId = this.getNodeParameter('contactId', undefined, { extractValue: false }) as string;
					if (!contactId) {
						return []; // No contact ID, so no addresses to show
					}

					const credentials = await this.getCredentials('ledgersApi');
					const { xApiKey, email, password } = credentials;

					const loginOptions: IRequestOptions = {
						method: 'POST',
						url: 'https://in-api.ledgers.cloud/login',
						headers: { 'Content-Type': 'application/json', 'x-api-key': xApiKey },
						body: { email, password },
						json: true,
					};

					const loginResponse = await this.helpers.request(loginOptions);
					if (loginResponse.status !== 200 || !loginResponse.api_token) {
						throw new ApplicationError('Authentication failed. Check your credentials.', { level: 'warning' });
					}
					const apiToken = loginResponse.api_token;

					const getContactOptions: IRequestOptions = {
						method: 'GET',
						url: `https://in-api.ledgers.cloud/v3/contact/${contactId}`,
						headers: { 'Content-Type': 'application/json', 'x-api-key': xApiKey, 'api-token': apiToken },
						json: true,
					};

					const contactData = await this.helpers.request(getContactOptions);
					if (!contactData.data) {
						return []; // Contact not found or has no data
					}

					const addressType = this.getNodeParameter('addressType', 'billing') as string;
					const addressKey = addressType === 'billing' ? 'billing_address' : 'shipping_address';
					const addresses = contactData.data[addressKey];

					if (!addresses || !Array.isArray(addresses)) {
						return []; // No addresses of the selected type
					}

					return addresses.map((addr: any, index: number) => {
						// Build a complete address string with all available fields
						const addressParts = [];

						if (addressKey == 'billing_address' ? addr.billing_address1 : addr.shipping_address1) addressParts.push(addressKey == 'billing_address' ? addr.billing_address1 : addr.shipping_address1);
						if (addressKey == 'billing_address' ? addr.billing_address2 : addr.shipping_address2) addressParts.push(addressKey == 'billing_address' ? addr.billing_address2 : addr.shipping_address2);
						if (addr.city || addr.location) addressParts.push(addr.city || addr.location);
						if (addr.state) addressParts.push(addr.state);
						if (addr.country) addressParts.push(addr.country);
						if (addr.pincode) addressParts.push(addr.pincode);

						// If we have contact info, add it too
						if (addr.email) addressParts.push(`Email: ${addr.email}`);
						if (addr.mobile) addressParts.push(`Mobile: ${addr.mobile}`);
						if (addr.gstin) addressParts.push(`GSTIN: ${addr.gstin}`);

						const displayName = addressParts.length > 0
							? `Address ${index + 1}: ${addressParts.join(', ')}`
							: `Address ${index + 1}: No address details`;

						return {
							name: displayName,
							value: index, // Use index as the value
						};
					});
				} catch (error) {
					if (continueOnFail) {
						return [];
					}
					throw error;
				}
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return await execute.call(this);
	}
}
