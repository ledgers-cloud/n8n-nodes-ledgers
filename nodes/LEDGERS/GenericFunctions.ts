import type { IExecuteFunctions, IRequestOptions } from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';

export async function execute(this: IExecuteFunctions) {
	const items = this.getInputData();
	const returnData = [];

	const credentials = await this.getCredentials('ledgersApi');
	if (!credentials || !credentials.xApiKey || !credentials.email || !credentials.password) {
		throw new ApplicationError('Missing required credentials: xApiKey, email, or password', {
			level: 'warning',
		});
	}

	const xApiKey = credentials.xApiKey;
	const email = credentials.email;
	const password = credentials.password;
	const baseUrl = 'https://in-api.ledgers.cloud/v3';

	// 1. Login to get api_token
	const loginOptions: IRequestOptions = {
		method: 'POST',
		url: `https://in-api.ledgers.cloud/login`,
		body: {
			email,
			password,
		},
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': xApiKey,
		},
		json: true,
	};

	let apiToken: string;
	try {
		const loginResponse = await this.helpers.request(loginOptions);
		if (loginResponse.status !== 'success' || !loginResponse.api_token) {
			throw new ApplicationError('Authentication failed. Check your credentials.', {
				level: 'warning',
			});
		}
		apiToken = loginResponse.api_token;
	} catch (error) {
		throw new ApplicationError('Failed to login and retrieve api_token. ' + (error as Error).message, {
			level: 'warning',
		});
	}

	for (let i = 0; i < items.length; i++) {
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
			const additionalFields = this.getNodeParameter('additionalFields', i);
			options.method = 'POST';
			options.url = `${baseUrl}/contact`;
			options.body = { contact_name: contactName, ...additionalFields };
		} else if (operation === 'updateContact') {
			const contactId = this.getNodeParameter('contactId', i);
			const updateFields = this.getNodeParameter('additionalFields', i);
			options.method = 'PUT';
			options.url = `${baseUrl}/contact`;
			options.body = { contact_id: contactId, ...updateFields };
		} else if (operation === 'getContact') {
			const contactId = this.getNodeParameter('contactId', i);
			options.url = `${baseUrl}/contact/${contactId}`;
		} else if (operation === 'getAllContacts') {
			const perPage = this.getNodeParameter('perPage', i);
			options.url = `${baseUrl}/contact?perpage=${perPage}`;
		}

		try {
			const response = await this.helpers.request(options);
			returnData.push({ json: response });
		} catch (error) {
			returnData.push({ json: { error: (error as Error).message } });

		}
	}

	return [returnData];
}
