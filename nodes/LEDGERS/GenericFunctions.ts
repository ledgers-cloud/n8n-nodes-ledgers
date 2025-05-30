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
			} else if (operation === 'updateContact') {
				const contactId = this.getNodeParameter('contactId', i);
				const updateFields = this.getNodeParameter('additionalFields', i) as Record<string, string>;
				const mobileRaw = updateFields.mobile;
				const selectedDialCode = updateFields.mobile_country_code || '+91';
				const isoCode = dialCodeToCountryCode[selectedDialCode] || 'in';

				if (mobileRaw) {
					updateFields.mobile = `${mobileRaw}|${isoCode}`;
				}
				updateFields.mobile_country_code = selectedDialCode;
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