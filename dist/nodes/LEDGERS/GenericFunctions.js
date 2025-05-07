"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
const n8n_workflow_1 = require("n8n-workflow");
async function execute() {
    const items = this.getInputData();
    const returnData = [];
    const credentials = await this.getCredentials('ledgersApi');
    if (!credentials || !credentials.apiToken || !credentials.xApiKey) {
        throw new n8n_workflow_1.ApplicationError('Missing required credentials: apiToken or xApiKey', {
            level: 'warning',
        });
    }
    const apiToken = credentials.apiToken;
    const xApiKey = credentials.xApiKey;
    const baseUrl = 'https://in-api-dev.ledgers.cloud/v3';
    for (let i = 0; i < items.length; i++) {
        const operation = this.getNodeParameter('operation', i);
        const options = {
            method: 'GET',
            url: '',
            headers: {
                'api-token': apiToken,
                'x-api-key': xApiKey,
                'Content-Type': 'application/json',
            },
            json: true,
        };
        if (operation === 'createContact') {
            const contactName = this.getNodeParameter('contactName', i);
            const additionalFields = this.getNodeParameter('additionalFields', i);
            options.method = 'POST';
            options.url = `${baseUrl}/contact`;
            options.body = { contact_name: contactName, ...additionalFields };
        }
        else if (operation === 'updateContact') {
            const contactId = this.getNodeParameter('contactId', i);
            const updateFields = this.getNodeParameter('additionalFields', i);
            options.method = 'PUT';
            options.url = `${baseUrl}/contact`;
            options.body = { contact_id: contactId, ...updateFields };
        }
        else if (operation === 'getContact') {
            const contactId = this.getNodeParameter('contactId', i);
            options.url = `${baseUrl}/contact/${contactId}`;
        }
        else if (operation === 'getAllContacts') {
            const perPage = this.getNodeParameter('perPage', i);
            options.url = `${baseUrl}/contact?perpage=${perPage}`;
        }
        try {
            const response = await this.helpers.request(options);
            returnData.push({ json: response });
        }
        catch (error) {
            returnData.push({ json: { error: error.message } });
        }
    }
    return [returnData];
}
