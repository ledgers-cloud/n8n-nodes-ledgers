import type { INodeProperties } from 'n8n-workflow';

export const commonOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		noDataExpression: true,
		name: 'operation',
		type: 'options',
		options: [
			{ name: 'Add Payment Method', value: 'addPaymentMethod', action: 'Add a payment method' },
			{ name: 'Create Branch', value: 'createBranch', action: 'Create a branch' },
			{ name: 'Get Branch Details', value: 'getBranchDetails', action: 'Get branch details' },
			{ name: 'List Branches', value: 'listBranches', action: 'List branches' },
			{ name: 'List Payment Methods', value: 'listPaymentMethods', action: 'List payment methods' },
			{ name: 'Update Branch', value: 'updateBranch', action: 'Update a branch' },
		],
		default: 'createBranch',
	},

	// Payment Method Fields
	{
		displayName: 'Payment Method Name',
		name: 'paymentMethodName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['common'],
				operation: ['addPaymentMethod', 'updatePaymentMethod'],
			},
		},
	},

	// Branch Fields
	{
		displayName: 'Branch ID',
		name: 'branchId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['common'], operation: ['getBranchDetails'] } },
	},
	{
		displayName: 'Branch Details Name or ID',
		name: 'branchDetailsLoader',
		type: 'options',
		default: '',
		displayOptions: { show: { resource: ['common'], operation: ['updateBranch'] } },
		typeOptions: {
			loadOptionsMethod: 'getBranchDetails',
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Branch Name',
		name: 'branchName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['common'], operation: ['createBranch'] } },
		description: 'The name of the branch',
	},
	{
		displayName: 'Tax Number',
		name: 'taxNumber',
		type: 'string',
		default: '',
		displayOptions: { show: { resource: ['common'], operation: ['createBranch'] } },
		description: 'Mandatory for India operations only',
	},
	{
		displayName: 'Phone',
		name: 'phone',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['common'], operation: ['createBranch'] } },
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['common'], operation: ['createBranch'] } },
		placeholder: 'name@email.com',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		options: [
			{ name: 'Active', value: 'Active' },
			{ name: 'Inactive', value: 'Inactive' },
		],
		default: 'Active',
		displayOptions: { show: { resource: ['common'], operation: ['createBranch'] } },
	},

	{
		displayName: 'Address Fields',
		name: 'addressFields',
		type: 'collection',
		placeholder: 'Add Address Field',
		default: {},
		displayOptions: { show: { resource: ['common'], operation: ['createBranch'] } },
		options: [
			{
				displayName: 'Address Line 1',
				name: 'address1',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Address Line 2',
				name: 'address2',
				type: 'string',
				default: '',
				description: 'Mandatory for India',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
			},
		],
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Additional Field',
		default: {},
		displayOptions: { show: { resource: ['common'], operation: ['createBranch'] } },
		options: [
			{
				displayName: 'Primary Branch',
				name: 'primaryBranch',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'yes' },
					{ name: 'No', value: 'no' },
				],
				default: 'no',
			},
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateBranchFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['common'], operation: ['updateBranch'] } },
		options: [
			{
				displayName: 'Address Fields',
				name: 'addressFields',
				type: 'collection',
				placeholder: 'Add Address Field',
				default: {},
				options: [
					{
						displayName: 'Address Line 1',
						name: 'address1',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Address Line 2',
						name: 'address2',
						type: 'string',
						default: '',
					},
					{
						displayName: 'City',
						name: 'city',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Country',
						name: 'country',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Postal Code',
						name: 'postalCode',
						type: 'string',
						default: '',
					},
					{
						displayName: 'State',
						name: 'state',
						type: 'string',
						default: '',
					},
				],
			},
			{
				displayName: 'Branch Name',
				name: 'branchName',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Primary Branch',
				name: 'primaryBranch',
				type: 'options',
				options: [
					{ name: 'Yes', value: 'yes' },
					{ name: 'No', value: 'no' },
				],
				default: 'no',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Active', value: 'Active' },
					{ name: 'Inactive', value: 'Inactive' },
				],
				default: 'Active',
			},
			{
				displayName: 'Tax Number',
				name: 'taxNumber',
				type: 'string',
				default: '',
			},
		],
	},
];
