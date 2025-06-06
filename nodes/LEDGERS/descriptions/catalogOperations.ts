import type { INodeProperties } from 'n8n-workflow';

export const catalogOperations: INodeProperties[] = [

	{
		displayName: 'Operation',
		noDataExpression: true,
		name: 'operation',
		type: 'options',
		options: [
			{ name: 'Create Catalog', value: 'createCatalog', action: 'Create a catalog' },
			// { name: 'Update Catalog', value: 'updateCatalog', action: 'Update a catalog' },
			{ name: 'Get Catalog', value: 'getCatalog', action: 'Get a catalog' },
			{ name: 'Get All Catalogs', value: 'getAllCatalogs', action: 'Get all catalogs' },
		],
		default: 'createCatalog',
		displayOptions: {
			show: { resource: ['catalog'] },
		},
		description: 'Choose the operation',
	},

	{
		displayName: 'Catalog ID',
		name: 'catalogId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['getCatalog', 'updateCatalog'],
			},
		},
	},

	{
		displayName: 'Catalog Name',
		name: 'catalogName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['catalog'],
				operation: ['createCatalog'],
			},
		},
	},

	{
		displayName: 'Price',
		name: 'price',
		type: 'string',
		required: true,
		default: '',
		placeholder: '',
		displayOptions: {
			show: {
				resource: ['catalog'],
				operation: ['createCatalog'],
			},
		},
	},
	{
		displayName: 'Catalog Type',
		name: 'catalog_type',
		type: 'options',
		options: [
			{ name: 'Sales', value: 'sales' },
			{ name: 'Purchase', value: 'purchase' },
		],
		default: 'sales',
		displayOptions: {
			show: {
				operation: ['createCatalog'],
			},
		},
	},

	{
		displayName: 'Item Type',
		name: 'item_type',
		type: 'options',
		options: [
			{ name: 'Goods', value: 'goods' },
			{ name: 'Services', value: 'services' },
		],
		default: 'goods',
		displayOptions: {
			show: {
				resource: ['catalog'],
				operation: ['createCatalog'],
			},
		}
	},

	// {
	// 	displayName: 'HSN/SAC Code Name or ID',
	// 	name: 'hsn_sac_mode',
	// 	type: 'options',
	// 	typeOptions: {
	// 		loadOptionsMethod: 'getHsnSacCodes',  // Matches the loadOptions method in Ledgers.node.ts
	// 		allowManualEntry: true,  // 👈 this allows users to enter a custom value
	// 	},
	// 	required: true,
	// 	displayOptions: {
	// 		show: {
	// 			resource: ['catalog'],
	// 			operation: ['createCatalog', 'updateCatalog'],
	// 			loadOptionsDependsOn: ['catalogName'],  // 👈 This line ensures the API call waits until Catalog Name is filled
	// 		},
	// 	},
	// 	description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	// 	default: '',
	// 	placeholder: 'Select HSN/SAC Code',
	// },

	// {
	// 	displayName: 'HSN/SAC Code (Manual)',
	// 	name: 'hsn_sac_manual',
	// 	type: 'string',
	// 	default: '',
	// 	placeholder: 'Enter HSN/SAC Code',
	// 	displayOptions: {
	// 		show: {
	// 			resource: ['catalog'],
	// 			operation: ['createCatalog', 'updateCatalog'],
	// 			hsn_sac_mode: ['manualEntry'],
	// 		},
	// 	},
	// },

	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['catalog'],
				operation: ['createCatalog', 'updateCatalog'],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-collection-type-unsorted-items
		options: [

			{
				displayName: 'Price Type',
				name: 'gst_type',
				type: 'options',
				// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
				options: [
					{ name: 'Inclusive of GST', value: 'inclusive of gst' },
					{ name: 'Exclusive of GST', value: 'exclusive of gst' },
				],
				default: 'inclusive of gst',
			},
			{
				displayName: 'GST Rate',
				name: 'gst_rate',
				type: 'options',
				options: [
					{ name: '0.1%', value: '0.1%' },
					{ name: '0.25%', value: '0.25%' },
					{ name: '0%', value: '0%' },
					{ name: '1.5%', value: '1.5%' },
					{ name: '1%', value: '1%' },
					{ name: '12%', value: '12%' },
					{ name: '18%', value: '18%' },
					{ name: '28%', value: '28%' },
					{ name: '3%', value: '3%' },
					{ name: '5%', value: '5%' },
					{ name: '7.5%', value: '7.5%' },
					{ name: 'Exempted Supply', value: 'Exempted Supply' },
					{ name: 'Nil-Rated', value: 'Nil-Rated' },
					{ name: 'Non-GST Supply', value: 'Non-GST Supply' },
					{ name: 'Zero-Rated', value: 'Zero-Rated' },
				],
				default: '5%',
			},
			{ displayName: 'Non-Taxable', name: 'non_taxable', type: 'boolean', default: false, placeholder: '' },
			{
				displayName: 'Units',
				name: 'units',
				type: 'options',
				options: [
					{ name: 'BAG-BAGS', value: 'BAG-BAGS' },
					{ name: 'BAL-BALE', value: 'BAL-BALE' },
					{ name: 'BDL-BUNDLES', value: 'BDL-BUNDLES' },
					{ name: 'BKL-BUCKLES', value: 'BKL-BUCKLES' },
					{ name: 'BOU-BILLIONS OF UNITS', value: 'BOU-BILLIONS OF UNITS' },
					{ name: 'BOX-BOX', value: 'BOX-BOX' },
					{ name: 'BTL-BOTTLES', value: 'BTL-BOTTLES' },
					{ name: 'BUN-BUNCHES', value: 'BUN-BUNCHES' },
					{ name: 'CAN-CANS', value: 'CAN-CANS' },
					{ name: 'CBM-CUBIC METERS', value: 'CBM-CUBIC METERS' },
					{ name: 'CCM-CUBIC CENTIMETERS', value: 'CCM-CUBIC CENTIMETERS' },
					{ name: 'CMC-CENTIMETERS', value: 'CMC-CENTIMETERS' },
					{ name: 'CTN-CARTONS', value: 'CTN-CARTONS' },
					{ name: 'DOZ-DOZENS', value: 'DOZ-DOZENS' },
					{ name: 'DRM-DRUMS', value: 'DRM-DRUMS' },
					{ name: 'GGK-GREAT GROSS', value: 'GGK-GREAT GROSS' },
					{ name: 'GMS-GRAMMES', value: 'GMS-GRAMMES' },
					{ name: 'GRS-GROSS', value: 'GRS-GROSS' },
					{ name: 'GYD-GROSS YARDS', value: 'GYD-GROSS YARDS' },
					{ name: 'KGS-KILOGRAMS', value: 'KGS-KILOGRAMS' },
					{ name: 'KLR-KILOLITRE', value: 'KLR-KILOLITRE' },
					{ name: 'KME-KILOMETRE', value: 'KME-KILOMETRE' },
					{ name: 'LTR-LITRES', value: 'LTR-LITRES' },
					{ name: 'MLS-MILLI LITRES', value: 'MLS-MILLI LITRES' },
					{ name: 'MLT-MILILITRE', value: 'MLT-MILILITRE' },
					{ name: 'MTR-METERS', value: 'MTR-METERS' },
					{ name: 'MTS-METRIC TON', value: 'MTS-METRIC TON' },
					{ name: 'NOS-NUMBERS', value: 'NOS-NUMBERS' },
					{ name: 'OTH-OTHERS', value: 'OTH-OTHERS' },
					{ name: 'PAC-PACKS', value: 'PAC-PACKS' },
					{ name: 'PCS-PIECES', value: 'PCS-PIECES' },
					{ name: 'PRS-PAIRS', value: 'PRS-PAIRS' },
					{ name: 'QTL-QUINTAL', value: 'QTL-QUINTAL' },
					{ name: 'ROL-ROLLS', value: 'ROL-ROLLS' },
					{ name: 'SET-SETS', value: 'SET-SETS' },
					{ name: 'SQF-SQUARE FEET', value: 'SQF-SQUARE FEET' },
					{ name: 'SQM-SQUARE METERS', value: 'SQM-SQUARE METERS' },
					{ name: 'SQY-SQUARE YARDS', value: 'SQY-SQUARE YARDS' },
					{ name: 'TBS-TABLETS', value: 'TBS-TABLETS' },
					{ name: 'TGM-TEN GROSS', value: 'TGM-TEN GROSS' },
					{ name: 'THD-THOUSANDS', value: 'THD-THOUSANDS' },
					{ name: 'TON-TONNES', value: 'TON-TONNES' },
					{ name: 'TUB-TUBES', value: 'TUB-TUBES' },
					{ name: 'UGS-US GALLONS', value: 'UGS-US GALLONS' },
					{ name: 'UNT-UNITS', value: 'UNT-UNITS' },
					{ name: 'YDS-YARDS', value: 'YDS-YARDS' }
				],
				default: 'UNT-UNITS',
				placeholder: '',
			},
			{
				displayName: 'Product Description',
				name: 'description',
				type: 'string',
				default: '',
				placeholder: '',
			},
			{
				displayName: 'HSN/SAC Code',
				name: 'hsn_sac',
				type: 'string',
				default: '',
				placeholder: 'Enter HSN/SAC Code',
			},
		],
	},

	{
		displayName: 'Limit (Per Page)',
		name: 'perPage',
		type: 'number',
		default: 5,
		displayOptions: {
			show: {
				operation: ['getAllCatalogs'],
				resource: ['catalog'],
			},
		},
	},
];