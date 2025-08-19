import type { INodeProperties } from 'n8n-workflow';

export const bankingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		noDataExpression: true,
		name: 'operation',
		type: 'options',
		options: [
			{ name: 'Get Bank Statement', value: 'getBankStatement', action: 'Get bank statement' },
		],
		default: 'getBankStatement',
		displayOptions: {
			show: { resource: ['banking'] },
		},
	},
		{
		displayName: 'Bank Account Name or ID',
		name: 'selectedAccount',
		type: 'options',
		default: '',
		required: true,
		typeOptions: {
			loadOptionsMethod: 'getBankAccounts',
		},
		displayOptions: {
			show: {
				resource: ['banking'],
				operation: ['getBankStatement']
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'From Date',
		name: 'fromDate',
		type: 'dateTime',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['banking'],
				operation: ['getBankStatement']
			},
		},
		description: 'Start date for account statement (DD-MM-YYYY format)',
	},
	{
		displayName: 'To Date',
		name: 'toDate',
		type: 'dateTime',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['banking'],
				operation: ['getBankStatement']
			},
		},
		description: 'End date for account statement (DD-MM-YYYY format)',
	},
];
