import {
	INodeType,
	INodeTypeDescription,
	IExecuteFunctions,
	INodeExecutionData,
	NodeConnectionType,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IHttpRequestOptions,
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
		subtitle: '={{ $parameter["resource"] + ": " + $parameter["operation"] }}',
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
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Banking Operation (India)', value: 'banking' },
					{ name: 'Catalog Operation', value: 'catalog' },
					{ name: 'Contact Operation', value: 'contact' },
					{ name: 'HRMS Operation (India)', value: 'hrms' },
					{ name: 'Purchase Operation (India)', value: 'purchase' },
					{ name: 'Sales Operation', value: 'sales' },
					{ name: 'Tax Operation (India)', value: 'tax' },
				],
				default: 'contact',
			},
			// Sales, Purchase, and Catalog operations
			...descriptions.salesOperations,
			...descriptions.purchaseOperations,
			...descriptions.catalogOperations,
			// Contact Operations
			...descriptions.contactOperations,
			// HRMS Operations
			...descriptions.hrmsOperations,
			// Banking Operations
			...descriptions.bankingOperations,
			// Tax Operations
			...descriptions.taxOperations,
		],
	};

	methods = {
		loadOptions: {
			async getCatalogVariants(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const continueOnFail = this.getNode().continueOnFail;
				try {
					const credentials = await this.getCredentials('ledgersApi');
					const { xApiKey, email, password, apiUrl } = credentials;

					// Authenticate to get api_token
					const loginOptions: IHttpRequestOptions = {
						method: 'POST',
						url: `${apiUrl}/login`,
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

					const options: IHttpRequestOptions = {
						method: 'GET',
						url: `${apiUrl}`+(String(credentials.apiUrl).includes('in-api.ledgers.cloud') ? '/v3/catalog/' : '/catalog/') + catalogId,
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
					const { xApiKey, email, password, apiUrl } = credentials;

					// Authenticate to get api_token
					const loginOptions: IHttpRequestOptions = {
						method: 'POST',
						url: `${apiUrl}/login`,
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

					const options: IHttpRequestOptions = {
						method: 'GET',
						url: `${apiUrl}`+(String(credentials.apiUrl).includes('in-api.ledgers.cloud') ? '/v3/coa' : '/coa'),
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
					const { xApiKey, email, password, apiUrl } = credentials;

					const loginOptions: IHttpRequestOptions = {
						method: 'POST',
						url: `${apiUrl}/login`,
						headers: { 'Content-Type': 'application/json', 'x-api-key': xApiKey },
						body: { email, password },
						json: true,
					};

					const loginResponse = await this.helpers.request(loginOptions);
					if (loginResponse.status !== 200 || !loginResponse.api_token) {
						throw new ApplicationError('Authentication failed. Check your credentials.', { level: 'warning' });
					}
					const apiToken = loginResponse.api_token;

					const getContactOptions: IHttpRequestOptions = {
						method: 'GET',
						url: `${apiUrl}`+(String(credentials.apiUrl).includes('in-api.ledgers.cloud') ? '/v3/contact/' : '/contact/') + contactId,
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
			async getPaymentMethodsPurchase(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				// const continueOnFail = this.getNode().continueOnFail;
				try {
					const credentials = await this.getCredentials('ledgersApi');
					const { xApiKey, email, password, apiUrl } = credentials;

					// Authenticate to get api_token
					const loginOptions: IHttpRequestOptions = {
						method: 'POST',
						url: `${apiUrl}/login`,
						headers: {
							'Content-Type': 'application/json',
							'x-api-key': xApiKey,
						},
						body: { email, password },
						json: true,
					};

					const loginResponse = await this.helpers.request(loginOptions);
					if (loginResponse.status !== 200 || !loginResponse.api_token) {
						// Return empty array to allow custom input when authentication fails
						return [];
					}

					const apiToken = loginResponse.api_token;

					const options: IHttpRequestOptions = {
						method: 'GET',
						url: `${apiUrl}`+(String(credentials.apiUrl).includes('in-api.ledgers.cloud') ? '/v3/settings/paymentsmode' : '/settings/paymentsmode'),
						headers: {
							'Content-Type': 'application/json',
							'x-api-key': xApiKey,
							'api-token': apiToken,
						},
						json: true,
					};

					const response = await this.helpers.request(options);

					if (!response.data || !Array.isArray(response.data)) {
						// Return empty array to allow custom input when no data
						return [];
					}

					const returnData: INodePropertyOptions[] = [];

					// Find the payment_methods object in the data array
					const paymentMethodsData = response.data.find((item: any) => item.type === 'payment_methods');

					if (paymentMethodsData && paymentMethodsData.settings && Array.isArray(paymentMethodsData.settings)) {
						for (const setting of paymentMethodsData.settings) {
							if (setting.id && setting.value) {
								returnData.push({
									name: setting.value ?? 'Cash', // Display the payment method name
									value: JSON.stringify({ id: String(setting.id ?? 1), name: `${setting.value ?? 'Cash'}` })   // Use the ID as the value
								});
							}
						}
					}
					else{
						returnData.push({
							name: 'Cash',
							value: JSON.stringify({ id: String(1), name: 'Cash' }),
						});
					}

					// If no payment methods found, return empty array to allow custom input
					if (returnData.length === 0) {
						return [];
					}

					return returnData;
				} catch (error) {
					return [];
				}
			},
			async getBranches(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const continueOnFail = this.getNode().continueOnFail;
				try {
					const credentials = await this.getCredentials('ledgersApi');
					const { xApiKey, email, password, apiUrl } = credentials;

					const loginOptions: IHttpRequestOptions = {
						method: 'POST',
						url: `${apiUrl}/login`,
						headers: { 'Content-Type': 'application/json', 'x-api-key': xApiKey },
						body: { email, password },
						json: true,
					};

					const loginResponse = await this.helpers.request(loginOptions);
					if (loginResponse.status !== 200 || !loginResponse.api_token) {
						throw new ApplicationError('Authentication failed. Check your credentials.', { level: 'warning' });
					}

					const apiToken = loginResponse.api_token;
					const isIndia = String(apiUrl).includes('in-api.ledgers.cloud');
					const baseUrl = isIndia ? `${apiUrl}/v3` : apiUrl;

					const payload = { pagination: { perpage: 1000, page: 1 }, status: 1, sort: { field: "created_on", sort: "DESC" }, key: "branch" };
					const options: IHttpRequestOptions = {
						method: 'GET',
						url: `${baseUrl}/hr/employee?param=${btoa(JSON.stringify(payload))}`,
						headers: { 'Content-Type': 'application/json', 'x-api-key': xApiKey, 'api-token': apiToken },
						json: true,
					};

									const response = await this.helpers.request(options);
				if (!response.data) return [];

				// Handle object format: {"1":"Main Branch","2":"Secondary Branch","3":"Third Branch"}
				const returnData: INodePropertyOptions[] = [];
				if (typeof response.data === 'object' && !Array.isArray(response.data)) {
					for (const [branchId, branchName] of Object.entries(response.data)) {
						returnData.push({
							name: branchName as string,
							value: branchId,
						});
					}
				}
					return returnData;
				} catch (error) {
					if (continueOnFail) return [];
					throw error;
				}
			},
			async getEmployee(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const continueOnFail = this.getNode().continueOnFail;
				try {
					const credentials = await this.getCredentials('ledgersApi');
					const { xApiKey, email, password, apiUrl } = credentials;

					const loginOptions: IHttpRequestOptions = {
						method: 'POST',
						url: `${apiUrl}/login`,
						headers: { 'Content-Type': 'application/json', 'x-api-key': xApiKey },
						body: { email, password },
						json: true,
					};

					const loginResponse = await this.helpers.request(loginOptions);
					if (loginResponse.status !== 200 || !loginResponse.api_token) {
						throw new ApplicationError('Authentication failed. Check your credentials.', { level: 'warning' });
					}

					const apiToken = loginResponse.api_token;
					const isIndia = String(apiUrl).includes('in-api.ledgers.cloud');
					const baseUrl = isIndia ? `${apiUrl}/v3` : apiUrl;

					const payload = { pagination: { perpage: 1000, page: 1 }, status: 1, sort: { field: "created_on", sort: "DESC" }, key: "reporting_to" };
					const options: IHttpRequestOptions = {
						method: 'GET',
						url: `${baseUrl}/hr/employee?param=${btoa(JSON.stringify(payload))}`,
						headers: { 'Content-Type': 'application/json', 'x-api-key': xApiKey, 'api-token': apiToken },
						json: true,
					};

					const response = await this.helpers.request(options);
					if (!response.data || !Array.isArray(response.data)) return [];

					// Handle array format with employee objects
					const returnData: INodePropertyOptions[] = response.data.map((employee: any) => ({
						name: employee.name || `Employee ${employee.employee_id || employee.gid}`,
						value: employee.gid || employee.employee_id,
					}));
					return returnData;
				} catch (error) {
					if (continueOnFail) return [];
					throw error;
				}
			},

			async getBankAccounts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const continueOnFail = this.getNode().continueOnFail;
				try {
					const credentials = await this.getCredentials('ledgersApi');
					const { xApiKey, email, password, apiUrl } = credentials;
					const baseUrl = String(apiUrl).includes('in-api.ledgers.cloud') ? `${apiUrl}/v3` : apiUrl;
					const bank = this.getNodeParameter('bank', 0) as string;
					// Authenticate to get api_token
					const loginOptions: IHttpRequestOptions = {
						method: 'POST',
						url: `${apiUrl}/login`,
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

					// Fetch bank accounts
					const bankOptions: IHttpRequestOptions = {
						method: 'POST',
						url: `${baseUrl}/banking/${bank}`,
						headers: {
							'Content-Type': 'application/json',
							'x-api-key': xApiKey,
							'api-token': apiToken,
						},
						body: JSON.stringify({ operation: 'get-urn-list' }),
						json: true,
					};

					const bankResponse = await this.helpers.request(bankOptions);

					if (Array.isArray(bankResponse)) {
						const activeAccounts = bankResponse.filter((account: any) => account.status === 1);

						if (activeAccounts.length === 0) {
							return [
								{
									name: 'No Active Bank Accounts Found',
									value: '',
								},
							];
						}

						const accountOptions: INodePropertyOptions[] = [];

						for (const account of activeAccounts) {
							if (account.linked_account && Array.isArray(account.linked_account) && account.linked_account.length > 0) {
								for (const linkedAccount of account.linked_account) {
									accountOptions.push({
										name: linkedAccount.acct_name || `Account ${linkedAccount.acct_number}`,
										value: `${account.urn}|${linkedAccount.acct_number}`,
									});
								}
							}
						}

						if (accountOptions.length === 0) {
							return [
								{
									name: 'No Linked Accounts Found',
									value: '',
								},
							];
						}

						return accountOptions;
					}

					return [
						{
							name: 'Unable To Fetch Bank Accounts',
							value: '',
						},
					];
				} catch (error) {
					if (continueOnFail) return [];
					throw error;
				}
			},
		},
	};

	// Helper method to fetch branch data for createReceipt
	async fetchBranchData(this: IExecuteFunctions, branchId: string): Promise<any> {
		try {
			const credentials = await this.getCredentials('ledgersApi');
			const { xApiKey, email, password, apiUrl } = credentials;
			const loginOptions: IHttpRequestOptions = {
				method: 'POST',
				url: `${apiUrl}/login`,
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': xApiKey,
				},
				body: { email, password },
				json: true,
			};

			const loginResponse = await this.helpers.request(loginOptions);
			if (loginResponse.status !== 200 || !loginResponse.api_token) {
				return null;
			}

			const apiToken = loginResponse.api_token;
			const options: IHttpRequestOptions = {
				method: 'GET',
				url: `${apiUrl}`+(String(credentials.apiUrl).includes('in-api.ledgers.cloud') ? '/v3/business/branch/' : '/business/branch/') + branchId,
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': xApiKey,
					'api-token': apiToken,
				},
				json: true,
			};

			const response = await this.helpers.request(options);
			if (response.status === 200 && response.data && Array.isArray(response.data) && response.data.length > 0) {
				return response.data[0]; // Return the first branch data
			}
			return null;
		} catch (error) {
			return null;
		}
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		return await execute.call(this);
	}
}
