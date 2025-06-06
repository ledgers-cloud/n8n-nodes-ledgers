import type { INodeProperties } from 'n8n-workflow';

export const contactOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		noDataExpression: true,
		name: 'operation',
		type: 'options',
		options: [
			{ name: 'Create Contact', value: 'createContact', action: 'Create a contact' },
			{ name: 'Update Contact', value: 'updateContact', action: 'Update a contact' },
			{ name: 'Get Contact', value: 'getContact', action: 'Get a contact' },
			{ name: 'Get All Contacts', value: 'getAllContacts', action: 'Get all contacts' },
		],
		default: 'createContact',
		displayOptions: {
			show: { resource: ['contact'] },
		},
		description: 'Choose the operation',
	},

	{
		displayName: 'Contact ID',
		name: 'contactId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { operation: ['getContact', 'updateContact'] },
		},
	},

	{
		displayName: 'Contact Name',
		name: 'contactName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: { operation: ['createContact'] },
		},
	},

	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				operation: ['createContact', 'updateContact'],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-collection-type-unsorted-items
		options: [
			{ displayName: 'Email', name: 'email', type: 'string', default: '', placeholder: '' },
			{
				displayName: 'Mobile Country Code',
				name: 'mobile_country_code',
				type: 'options',
				// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
				options: [
					{ name: '🇮🇳 India (+91)', value: '+91' },
					{ name: '🇺🇸 USA (+1)', value: '+1' },
					{ name: '🇬🇧 UK (+44)', value: '+44' },
					{ name: '🇸🇬 Singapore (+65)', value: '+65' },
					{ name: '🇦🇪 UAE (+971)', value: '+971' },
				],
				default: '+91',
				description: 'Select the country code for the mobile number',
			},
			{ displayName: 'Mobile', name: 'mobile', type: 'string', default: '', placeholder: '' },
			{ displayName: 'GSTIN', name: 'gstin', type: 'string', default: '', placeholder: '' },
			{
				displayName: 'Business Name',
				name: 'business_name',
				type: 'string',
				default: '',
				placeholder: '',
			},
			{
				displayName: 'Billing Address 1',
				name: 'billing_address1',
				type: 'string',
				default: '',
				placeholder: '',
			},
			{
				displayName: 'Billing Address 2',
				name: 'billing_address2',
				type: 'string',
				default: '',
				placeholder: '',
			},
			{ displayName: 'City', name: 'location', type: 'string', default: '', placeholder: '' },
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				options: [
					{ name: 'TAMIL NADU', value: 'TAMIL NADU' },
					{ name: 'KARNATAKA', value: 'KARNATAKA' },
					{ name: 'KERALA', value: 'KERALA' },
					{ name: 'INTERNATIONAL', value: 'INTERNATIONAL' },
				],
				default: 'TAMIL NADU',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'options',
				options: [
					{ name: 'INDIA', value: 'INDIA' },
					{ name: 'UNITED STATES OF AMERICA', value: 'UNITED STATES OF AMERICA' },
					{ name: 'UNITED KINGDOM', value: 'UNITED KINGDOM' },
				],
				default: 'INDIA',
			},
		],
	},

	{
		displayName: 'Limit (Per Page)',
		name: 'perPage',
		type: 'number',
		default: 5,
		displayOptions: {
			show: { operation: ['getAllContacts'] },
		},
	},
];
