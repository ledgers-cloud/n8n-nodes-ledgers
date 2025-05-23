import {
<<<<<<< HEAD
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
=======
	ICredentialType,
	INodeProperties,
	IAuthenticateGeneric,
	ICredentialTestRequest,
>>>>>>> 35655d62d59b0715ac5900b675ada9877a5e1d95
	Icon
} from 'n8n-workflow';

export class LEDGERSApi implements ICredentialType {
	name = 'ledgersApi';
	displayName = 'LEDGERS API';
<<<<<<< HEAD
	documentationUrl = ''; // Optional
=======
	documentationUrl = ''; // You can add your docs URL here
>>>>>>> 35655d62d59b0715ac5900b675ada9877a5e1d95
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

<<<<<<< HEAD
=======
	// This block will test the credentials when clicking "Test Credentials"
>>>>>>> 35655d62d59b0715ac5900b675ada9877a5e1d95
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

<<<<<<< HEAD

=======
	// Optional but recommended: custom connection test logic
>>>>>>> 35655d62d59b0715ac5900b675ada9877a5e1d95
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
<<<<<<< HEAD
}
=======
}
>>>>>>> 35655d62d59b0715ac5900b675ada9877a5e1d95
