"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEDGERSApi = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class LEDGERSApi {
    constructor() {
        this.name = 'ledgersApi';
        this.displayName = 'LEDGERS API';
        this.documentationUrl = '';
        this.properties = [
            {
                displayName: 'X-API-Key',
                name: 'xApiKey',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                required: true,
                description: 'Contact LEDGERS support to get your x-api-key',
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
    }
    async authenticate(credentials, requestOptions) {
        if (!this.httpRequest) {
            throw new n8n_workflow_1.ApplicationError('HTTP request helper not available', { level: 'warning' });
        }
        const loginRequest = {
            method: 'POST',
            url: 'https://in-api-dev.ledgers.cloud/v3/login',
            body: {
                email: credentials.email,
                password: credentials.password,
            },
            json: true,
        };
        const response = (await this.httpRequest(loginRequest));
        if (response.status !== 'success' || !response.api_token) {
            throw new n8n_workflow_1.ApplicationError('Authentication failed. Check your credentials.', {
                level: 'warning',
            });
        }
        requestOptions.headers = {
            ...requestOptions.headers,
            'Content-Type': 'application/json',
            'x-api-key': credentials.xApiKey,
            'api-token': response.api_token,
        };
        return requestOptions;
    }
}
exports.LEDGERSApi = LEDGERSApi;
