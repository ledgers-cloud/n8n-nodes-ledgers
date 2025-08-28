import {
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	INodeExecutionData,
	NodeConnectionType,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	IRequestOptions,
	ApplicationError,
	IWebhookResponseData,
	IDataObject,
	INodeProperties,
} from 'n8n-workflow';

// Import trigger operations directly since the file might not exist yet
const triggerOperations: INodeProperties[] = [
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		default: '',
		description: 'The webhook ID (auto-generated when webhook is registered)',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: false,
		},
		default: {},
		options: [
			{
				displayName: 'Additional Options',
				name: 'additionalOptionsValues',
				values: [
					{
						displayName: 'Include Full Data',
						name: 'includeFullData',
						type: 'boolean',
						default: true,
						description: 'Whether to include complete data in webhook payload',
					},
					{
						displayName: 'Webhook Secret',
						name: 'webhookSecret',
						type: 'string',
						typeOptions: {
							password: true,
						},
						default: '',
						description: 'Secret key for webhook signature validation',
					},
				],
			},
		],
	},
];

export class LedgersTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LEDGERS Trigger',
		name: 'ledgersTrigger',
		group: ['trigger'],
		version: 1,
		description: 'Listen to events from LEDGERS API',
		subtitle: '={{ $parameter["event"] }}',
		defaults: {
			name: 'LEDGERS Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionType.Main],
		icon: 'file:ledgers.svg',
		credentials: [
			{
				name: 'ledgersApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'ledgers-webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Catalog Created', value: 'catalog.created' },
					{ name: 'Catalog Updated', value: 'catalog.updated' },
					{ name: 'Contact Created', value: 'contact.created' },
					{ name: 'Contact Deleted', value: 'contact.deleted' },
					{ name: 'Contact Updated', value: 'contact.updated' },
					{ name: 'Employee Created', value: 'employee.created' },
					{ name: 'Employee Updated', value: 'employee.updated' },
					{ name: 'GST Return Filed', value: 'gst.return_filed' },
					{ name: 'Invoice Created', value: 'invoice.created' },
					{ name: 'Invoice Paid', value: 'invoice.paid' },
					{ name: 'Invoice Updated', value: 'invoice.updated' },
					{ name: 'Purchase Invoice Created', value: 'purchase_invoice.created' },
					{ name: 'Purchase Invoice Updated', value: 'purchase_invoice.updated' },
					{ name: 'Quote Converted', value: 'quote.converted' },
					{ name: 'Quote Created', value: 'quote.created' },
					{ name: 'Quote Updated', value: 'quote.updated' },
					{ name: 'Receipt Created', value: 'receipt.created' },
					{ name: 'Receipt Updated', value: 'receipt.updated' },
					{ name: 'Voucher Created', value: 'voucher.created' },
					{ name: 'Voucher Updated', value: 'voucher.updated' },
				],
				default: 'contact.created',
			},
			...triggerOperations,
		],
	};

	methods = {
		loadOptions: {
			async getContactFilters(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				try {
					const credentials = await this.getCredentials('ledgersApi');
					const { xApiKey, email, password, apiUrl } = credentials;

					// Authenticate to get api_token
					const loginOptions: IRequestOptions = {
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
					const isIndia = String(apiUrl).includes('in-api.ledgers.cloud');
					const baseUrl = isIndia ? `${apiUrl}/v3` : apiUrl;

					const options: IRequestOptions = {
						method: 'GET',
						url: `${baseUrl}/contact?param=${btoa(JSON.stringify({ pagination: { perpage: 100, page: 1 } }))}`,
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

					return response.data.map((contact: any) => ({
						name: contact.name || `Contact ${contact.gid}`,
						value: contact.gid,
					}));
				} catch (error) {
					return [];
				}
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const event = this.getNodeParameter('event') as string;
		const body = this.getBodyData() as IDataObject;

		// Validate webhook signature if provided
		const signature = this.getHeaderData()['x-ledgers-signature'];
		if (signature) {
			// TODO: Implement signature validation
			// const isValid = validateSignature(body, signature, secret);
			// if (!isValid) {
			// 	throw new ApplicationError('Invalid webhook signature', { level: 'warning' });
			// }
		}

		// Process webhook data based on event type
		let processedData: INodeExecutionData;

		switch (event) {
			case 'contact.created':
			case 'contact.updated':
			case 'contact.deleted':
				processedData = {
					json: {
						event,
						contact: body.contact,
						timestamp: body.timestamp,
						...body,
					},
				};
				break;

			case 'invoice.created':
			case 'invoice.updated':
			case 'invoice.paid':
				processedData = {
					json: {
						event,
						invoice: body.invoice,
						timestamp: body.timestamp,
						...body,
					},
				};
				break;

			case 'quote.created':
			case 'quote.updated':
			case 'quote.converted':
				processedData = {
					json: {
						event,
						quote: body.quote,
						timestamp: body.timestamp,
						...body,
					},
				};
				break;

			case 'receipt.created':
			case 'receipt.updated':
				processedData = {
					json: {
						event,
						receipt: body.receipt,
						timestamp: body.timestamp,
						...body,
					},
				};
				break;

			case 'catalog.created':
			case 'catalog.updated':
				processedData = {
					json: {
						event,
						catalog: body.catalog,
						timestamp: body.timestamp,
						...body,
					},
				};
				break;

			case 'purchase_invoice.created':
			case 'purchase_invoice.updated':
				processedData = {
					json: {
						event,
						purchase_invoice: body.purchase_invoice,
						timestamp: body.timestamp,
						...body,
					},
				};
				break;

			case 'voucher.created':
			case 'voucher.updated':
				processedData = {
					json: {
						event,
						voucher: body.voucher,
						timestamp: body.timestamp,
						...body,
					},
				};
				break;

			case 'employee.created':
			case 'employee.updated':
				processedData = {
					json: {
						event,
						employee: body.employee,
						timestamp: body.timestamp,
						...body,
					},
				};
				break;

			case 'bank.transaction':
				processedData = {
					json: {
						event,
						transaction: body.transaction,
						timestamp: body.timestamp,
						...body,
					},
				};
				break;

			case 'gst.return_filed':
				processedData = {
					json: {
						event,
						gst_return: body.gst_return,
						timestamp: body.timestamp,
						...body,
					},
				};
				break;

			default:
				processedData = {
					json: {
						event,
						data: body,
						timestamp: new Date().toISOString(),
					},
				};
		}

		return {
			workflowData: [[processedData]],
		};
	}
}
