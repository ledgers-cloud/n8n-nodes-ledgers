import type { INodeProperties } from 'n8n-workflow';

export const catalogOperations: INodeProperties[] = [

	{
		displayName: 'Operation',
		noDataExpression: true,
		name: 'operation',
		type: 'options',
		options: [
			{ name: 'Add Variant (Existing Catalog)', value: 'addVariant', action: 'Add a new variant' },
			{ name: 'Create Catalog', value: 'createCatalog', action: 'Create a catalog' },
			{ name: 'Get All Catalogs', value: 'getAllCatalogs', action: 'Get all catalogs' },
			{ name: 'Get Catalog', value: 'getCatalog', action: 'Get a catalog' },
			{ name: 'Update Catalog', value: 'updateCatalog', action: 'Update a catalog' },
			{ name: 'Update Variant (Existing Catalog)', value: 'updateVariant', action: 'Update a variant' },
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
				operation: ['getCatalog', 'updateCatalog','updateVariant', 'addVariant'],
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
				operation: ['createCatalog'],
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
			{ displayName: 'Non-Taxable', name: 'non_taxable', type: 'number', default: 0, placeholder: 'Enter Non-Taxable' },
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
			{
				displayName: 'Expense Name or ID',
				name: 'coa_account',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCoaAccounts',
				},
				default: '',
				placeholder: 'Select Expense Type',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Cess Type',
				name: 'cess_type',
				type: 'options',
				options: [
					{ name: 'Percentage', value: 'percentage' },
					{ name: 'Flat Value', value: 'flat' },
				],
				default: 'percentage',
			},
			{
				displayName: 'Cess Value',
				name: 'cess_value',
				type: 'number',
				default: 0,
				placeholder: 'Enter Cess Value',
			},
		],
	},

	{
		displayName: 'Update Fields',
		name: 'catalogUpdateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['catalog'],
				operation: ['updateCatalog'],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-param-collection-type-unsorted-items
		options: [
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
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: [
					{ name: 'Active', value: '1' },
					{ name: 'Inactive', value: '0' },
				],
				default: '1',
			},
			{
				displayName: 'HSN/SAC Code',
				name: 'hsn_sac',
				type: 'string',
				default: '',
				placeholder: 'Enter HSN/SAC Code',
			},
			{
				displayName: 'Expense Name or ID',
				name: 'coa_account',
				type: 'options',
				typeOptions: {
					loadOptionsMethod: 'getCoaAccounts',
				},
				default: '',
				placeholder: 'Select Expense Type',
				description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
			},
			{
				displayName: 'Cess Type',
				name: 'cess_type',
				type: 'options',
				options: [
					{ name: 'Percentage', value: 'percentage' },
					{ name: 'Flat Value', value: 'flat' },
				],
				default: 'percentage',
			},
			{
				displayName: 'Cess Value',
				name: 'cess_value',
				type: 'number',
				default: '',
				placeholder: 'Enter Cess Value',
				description: 'For percentage: Enter value between 1-100. For flat: Enter absolute value.',
			},
		],
	},

	// eslint-disable-next-line n8n-nodes-base/node-param-display-name-wrong-for-dynamic-options
	{
		displayName: 'Variant Name or ID',
		name: 'variantId',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getCatalogVariants',
		},
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['updateVariant'],
			},
			hide: {
				catalogId: [''], // Hide if catalogId is empty
			},
		},
		description: 'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
	},
	{
		displayName: 'Update Variant Fields',
		name: 'catalogUpdateVariantFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['catalog'],
				operation: ['updateVariant'],
			},
		},
		options: [
			{
				displayName: 'Non-Taxable',
				name: 'variant_non_taxable',
				type: 'number',
				default: 0,
				placeholder: 'Enter Non-Taxable',
			},
			{
				displayName: 'Price',
				name: 'variant_price',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Price Type',
				name: 'variant_gst_type',
				type: 'options',
				options: [
					{ name: 'Inclusive of GST', value: 'inclusive of gst' },
					{ name: 'Exclusive of GST', value: 'exclusive of gst' },
				],
				default: 'inclusive of gst',
			},
			{
				displayName: 'SKU ID',
				name: 'variant_sku',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Status',
				name: 'variant_status',
				type: 'options',
				options: [
					{ name: 'Active', value: '1' },
					{ name: 'Inactive', value: '0' },
				],
				default: '1',
			},
			{
				displayName: 'Variant Description',
				name: 'variant_description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Variant Name',
				name: 'variant_name',
				type: 'string',
				default: '',
			},
		],
	},

	{
		displayName: 'Search Type',
		name: 'searchType',
		type: 'options',
		options: [
			{ name: 'Search by Name', value: 'search_term' },
			{ name: 'Search by Limit', value: 'limit' },
		],
		default: 'limit',
		displayOptions: {
			show: {
				resource: ['catalog'],
				operation: ['getAllCatalogs'],
			},
		},
	},

	{
		displayName: 'Search Term',
		name: 'searchTerm',
		type: 'string',
		default: '',
		placeholder: 'Enter name to search',
		displayOptions: {
			show: {
				resource: ['catalog'],
				operation: ['getAllCatalogs'],
				searchType: ['search_term'],
			},
		},
	},

	{
		displayName: 'Limit (Per Page)',
		name: 'perPage',
		type: 'number',
		default: 5,
		displayOptions: {
			show: {
				resource: ['catalog'],
				operation: ['getAllCatalogs'],
				searchType: ['search_term', 'limit'],
			},
		},
	},

	{
		displayName: 'Variant Name',
		name: 'variant_name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['addVariant'],
			},
		},
	},

	{
		displayName: 'Price',
		name: 'variant_price',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				operation: ['addVariant'],
			},
		},
	},

	{
		displayName: 'Additional Fields',
		name: 'variantAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				operation: ['addVariant'],
			},
		},
		options: [
			{
				displayName: 'GST Type',
				name: 'variant_gst_type',
				type: 'options',
				options: [
					{ name: 'Inclusive of GST', value: 'inclusive of gst' },
					{ name: 'Exclusive of GST', value: 'exclusive of gst' },
				],
				default: 'inclusive of gst',
			},
			{
				displayName: 'Non-Taxable',
				name: 'variant_non_taxable',
				type: 'number',
				default: 0,
				placeholder: 'Enter Non-Taxable',
			},
			{
				displayName: 'SKU ID',
				name: 'variant_sku',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Variant Description',
				name: 'variant_description',
				type: 'string',
				default: '',
			},
		],
	},
];
