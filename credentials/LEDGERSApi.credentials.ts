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
			url: 'https://in-api.ledgers.cloud/login',
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
