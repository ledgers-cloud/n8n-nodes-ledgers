"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
const n8n_workflow_1 = require("n8n-workflow");
const dialCodeToCountryCode = {
    '+91': 'in',
    '+1': 'us',
    '+44': 'gb',
    '+65': 'sg',
    '+971': 'ae',
};
async function execute() {
    var _a;
    const items = this.getInputData();
    const returnData = [];
    const credentials = await this.getCredentials('ledgersApi');
    if (!credentials || !credentials.xApiKey || !credentials.email || !credentials.password) {
        throw new n8n_workflow_1.ApplicationError('Missing required credentials: xApiKey, email, or password', {
            level: 'warning',
        });
    }
    const { xApiKey, email, password } = credentials;
    const baseUrl = 'https://in-api.ledgers.cloud/v3';
    let apiToken;
    try {
        const loginOptions = {
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
            throw new n8n_workflow_1.ApplicationError(`Failed to login. ${errorMsg}`, {
                level: 'warning',
            });
        }
        apiToken = loginResponse.api_token;
    }
    catch (error) {
        throw new n8n_workflow_1.ApplicationError(`Login request failed: ${error.message}`, {
            level: 'warning',
        });
    }
    for (let i = 0; i < items.length; i++) {
        const continueOnFail = (_a = this.continueOnFail) === null || _a === void 0 ? void 0 : _a.call(this);
        try {
            const operation = this.getNodeParameter('operation', i);
            const options = {
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
            }
            else if (operation === 'updateContact') {
                const contactId = this.getNodeParameter('contactId', i);
                const updateFields = this.getNodeParameter('additionalFields', i);
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
            }
            else if (operation === 'getContact') {
                const contactId = this.getNodeParameter('contactId', i);
                options.url = `${baseUrl}/contact/${contactId}`;
            }
            else if (operation === 'getAllContacts') {
                const perPage = this.getNodeParameter('perPage', i);
                options.url = `${baseUrl}/contact?perpage=${perPage}`;
            }
            const result = await this.helpers.request(options);
            returnData.push({ json: result });
        }
        catch (error) {
            if (continueOnFail) {
                returnData.push({ json: { error: error.message } });
                continue;
            }
            throw error;
        }
    }
    return [returnData];
}
//# sourceMappingURL=GenericFunctions.js.map