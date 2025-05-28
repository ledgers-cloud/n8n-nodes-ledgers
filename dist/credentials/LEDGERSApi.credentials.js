"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEDGERSApi = void 0;
class LEDGERSApi {
    constructor() {
        this.name = 'ledgersApi';
        this.displayName = 'LEDGERS API';
        this.documentationUrl = 'https://github.com/ledgers-cloud/n8n-nodes-ledgers/blob/master/README.md';
        this.icon = 'file:LEDGERS.svg';
        this.properties = [
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
        this.authenticate = {
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
//# sourceMappingURL=LEDGERSApi.credentials.js.map