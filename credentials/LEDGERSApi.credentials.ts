import type {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
	IAuthenticateGeneric,
	Icon,
} from 'n8n-workflow';

export class LEDGERSApi implements ICredentialType {
	name = 'ledgersApi';
	displayName = 'LEDGERS API';
	documentationUrl = 'https://github.com/ledgers-cloud/n8n-nodes-ledgers/blob/master/README.md';
	icon: Icon = 'file:ledgers.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'API URL',
			name: 'apiUrl',
			type: 'options',
			options: [
				{
					name: 'https://in-api.ledgers.cloud (India)',
					value: 'https://in-api.ledgers.cloud',
				},
				{
					name: 'https://ae-api.ledgers.cloud (UAE)',
					value: 'https://ae-api.ledgers.cloud',
				},
			],
			default: 'https://in-api.ledgers.cloud',
			required: true,
		},
		{
			displayName: 'X-API-Key',
			name: 'xApiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
		{
			displayName: 'Email',
			name: 'email',
			type: 'string',
			default: '',
			required: true,
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': '={{$credentials.xApiKey}}',
			},
			auth: {
				username: '={{$credentials.email}}',
				password: '={{$credentials.password}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			method: 'POST',
			url: '={{$credentials.apiUrl}}/login',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': '={{$credentials.xApiKey}}',
			},
			body: {
				email: '={{$credentials.email}}',
				password: '={{$credentials.password}}',
			},
			json: true,
		},
	};
}
