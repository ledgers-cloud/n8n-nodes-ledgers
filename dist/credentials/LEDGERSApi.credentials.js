"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEDGERSApi = void 0;
class LEDGERSApi {
    constructor() {
        this.name = 'ledgersApi';
        this.displayName = 'LEDGERS API';
        this.documentationUrl = ''; // You can add your docs URL here
        this.icon = 'file:LEDGERS.svg';
        this.properties = [
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
        // This block will test the credentials when clicking "Test Credentials"
        this.authenticate = {
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
        };
        // Optional but recommended: custom connection test logic
        this.test = {
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
}
exports.LEDGERSApi = LEDGERSApi;
