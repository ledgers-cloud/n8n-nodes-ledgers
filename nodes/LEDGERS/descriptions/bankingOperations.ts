import type { INodeProperties } from 'n8n-workflow';

export const bankingOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		noDataExpression: true,
		name: 'operation',
		type: 'options',
		options: [
			{ name: 'Get Bank Details', value: 'getBankDetails', action: 'Get bank details' },
		],
		default: 'getBankDetails',
		displayOptions: {
			show: { resource: ['banking'] },
		},
	},
];
