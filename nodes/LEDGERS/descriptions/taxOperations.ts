import type { INodeProperties } from 'n8n-workflow';

export const taxOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		noDataExpression: true,
		name: 'operation',
		type: 'options',
		options: [
			{ name: 'GST Return Status', value: 'getGSTReturnStatus', action: 'Get GST return status' },
			{ name: 'GST Search', value: 'getGSTSearch', action: 'Search GST information' },
		],
		default: 'getGSTReturnStatus',
		displayOptions: {
			show: { resource: ['tax'] },
		},
	},
	{
		displayName: 'GSTIN',
		name: 'gstin',
		type: 'string',
		default: '',
		required: true,
		displayOptions: {
			show: {
				resource: ['tax'],
				operation: ['getGSTReturnStatus', 'getGSTSearch']
			},
		},
		description: 'Enter the GSTIN',
	},
];
