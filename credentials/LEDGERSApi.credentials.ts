import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
	Icon
} from 'n8n-workflow';

export class LEDGERSApi implements ICredentialType {
	name = 'ledgersApi';
	displayName = 'LEDGERS API';
	documentationUrl = ''; // Optional
	icon: Icon = 'file:LEDGERS.svg';

	properties: INodeProperties[] = [
		{
			displayName: 'X-API-Key',
			name: 'xApiKey',
			type: 'string',
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
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
		},
	];

	authenticate = {
		type: 'generic',
		properties: {
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
			response: {
				property: 'api_token',
			},
		},
	} as IAuthenticateGeneric;


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
