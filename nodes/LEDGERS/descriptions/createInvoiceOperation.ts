import { INodeProperties } from 'n8n-workflow';

export const createInvoiceOperation: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['invoice'],
      },
    },
    options: [
      {
        name: 'Create Invoice',
        value: 'createInvoice',
        action: 'Create a new invoice',
      },
    ],
    default: 'createInvoice',
  },
  {
    displayName: 'Contact',
    name: 'contact',
    type: 'collection',
    placeholder: 'Add Contact Field',
    default: {},
    required: true,
    options: [
      { displayName: 'Business Country', name: 'business_country', type: 'string', default: '' },
      { displayName: 'Business Name', name: 'business_name', type: 'string', default: '' },
      { displayName: 'Country Code', name: 'country_code', type: 'string', default: '' },
      { displayName: 'Email', name: 'email', type: 'string', default: '', placeholder: 'name@email.com' },
      { displayName: 'ID', name: 'id', type: 'number', default: 0 },
      { displayName: 'Mobile', name: 'mobile', type: 'string', default: '' },
      { displayName: 'Name', name: 'name', type: 'string', default: '' },
      { displayName: 'Place of Supply', name: 'place_of_supply', type: 'string', default: '' },
    ],
    displayOptions: {
      show: {
        resource: ['invoice'],
        operation: ['createInvoice'],
      },
    },
  },
  {
    displayName: 'Items',
    name: 'items',
    type: 'fixedCollection',
    placeholder: 'Add Item',
    default: {},
    required: true,
    typeOptions: {
      multipleValues: true,
    },
    options: [
      {
        displayName: 'Item',
        name: 'item',
        values: [
          { displayName: 'Description', name: 'description', type: 'string', default: '' },
          { displayName: 'Discount', name: 'discount', type: 'number', default: 0 },
          { displayName: 'GST Rate', name: 'gst_rate', type: 'string', default: '' },
          { displayName: 'Item Code', name: 'item_code', type: 'string', default: '' },
          { displayName: 'Item Type', name: 'item_type', type: 'number', default: 0 },
          { displayName: 'Name', name: 'name', type: 'string', default: '' },
          { displayName: 'Non Taxable Per Item', name: 'non_taxable_per_item', type: 'number', default: 0 },
          { displayName: 'PID', name: 'pid', type: 'number', default: 0 },
          { displayName: 'Price Type', name: 'price_type', type: 'string', default: '' },
          { displayName: 'Quantity', name: 'quantity', type: 'number', default: 1 },
          { displayName: 'Rate', name: 'rate', type: 'number', default: 0 },
          { displayName: 'Taxable Per Item', name: 'taxable_per_item', type: 'number', default: 0 },
          { displayName: 'Units', name: 'units', type: 'string', default: '' },
          { displayName: 'Variant ID', name: 'variant_id', type: 'number', default: 0 },
        ],
      },
    ],
    displayOptions: {
      show: {
        resource: ['invoice'],
        operation: ['createInvoice'],
      },
    },
  },
  {
    displayName: 'Seller Branch ID',
    name: 'seller_branch_id',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['invoice'],
        operation: ['createInvoice'],
      },
    },
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    options: [
      {
        displayName: 'Bank ID', name: 'bank_id', type: 'string', default: '' },
      {
        displayName: 'Billing Address',
        name: 'billing_address',
        type: 'fixedCollection',
        typeOptions: { multipleValues: false },
        default: {},
        options: [
          {
            displayName: 'Billing',
            name: 'billing',
            values: [
              { displayName: 'Bill Addr1', name: 'bill_addr1', type: 'string', default: '' },
              { displayName: 'Bill Addr2', name: 'bill_addr2', type: 'string', default: '' },
              { displayName: 'Bill City', name: 'bill_city', type: 'string', default: '' },
              { displayName: 'Bill State', name: 'bill_state', type: 'string', default: '' },
              { displayName: 'Bill Country', name: 'bill_country', type: 'string', default: '' },
              { displayName: 'Bill Pincode', name: 'bill_pincode', type: 'string', default: '' },
            ],
          },
        ],
      },
      {
        displayName: 'Billings Currency', name: 'billings_currency', type: 'string', default: '' },
      {
        displayName: 'Currency Info',
        name: 'currency_info',
        type: 'collection',
        default: {},
        options: [
          { displayName: 'Name', name: 'name', type: 'string', default: '' },
          { displayName: 'Exchange Time', name: 'exchange_time', type: 'string', default: '' },
          { displayName: 'Exchange Rate', name: 'exchange_rate', type: 'string', default: '' },
        ],
      },
      {
        displayName: 'Invoice Date', name: 'invoice_date', type: 'string', default: '' },
      {
        displayName: 'Invoice Number', name: 'invoice_number', type: 'string', default: '' },
      {
        displayName: 'Notification', name: 'notification', type: 'string', default: '' },
      {
        displayName: 'Payment Link', name: 'payment_link', type: 'string', default: '' },
      {
        displayName: 'Shipping Address',
        name: 'shipping_address',
        type: 'fixedCollection',
        typeOptions: { multipleValues: false },
        default: {},
        options: [
          {
            displayName: 'Shipping',
            name: 'shipping',
            values: [
              { displayName: 'Ship Addr1', name: 'ship_addr1', type: 'string', default: '' },
              { displayName: 'Ship Addr2', name: 'ship_addr2', type: 'string', default: '' },
              { displayName: 'Ship City', name: 'ship_city', type: 'string', default: '' },
              { displayName: 'Ship State', name: 'ship_state', type: 'string', default: '' },
              { displayName: 'Ship Country', name: 'ship_country', type: 'string', default: '' },
              { displayName: 'Ship Pincode', name: 'ship_pincode', type: 'string', default: '' },
            ],
          },
        ],
      },
      {
        displayName: 'Terms Conditions', name: 'terms_conditions', type: 'string', default: '' },
      {
        displayName: 'Validity Date', name: 'validity_date', type: 'string', default: '' },
    ],
    displayOptions: {
      show: {
        resource: ['invoice'],
        operation: ['createInvoice'],
      },
    },
  },
];
