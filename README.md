# n8n-nodes-ledgers-cloud

This is an n8n community node for integrating with [LEDGERS](https://ledgers.cloud/) – a comprehensive business platform offering features like accounting, invoicing, contacts, catalogs, quotes, and receipt management.

Use this node to automate LEDGERS workflows directly from within [n8n](https://n8n.io), the fair-code licensed workflow automation platform.

## 🎯 What is LEDGERS Node?

The LEDGERS node is a powerful automation tool that connects your n8n workflows with the LEDGERS cloud platform. It enables businesses to:

- **Automate Business Operations**: Streamline contact management, inventory tracking, and financial operations
- **Integrate Systems**: Connect LEDGERS with other business tools in your workflow
- **Reduce Manual Work**: Automate repetitive tasks like invoice generation, receipt creation, and data synchronization
- **Scale Operations**: Handle bulk operations and complex business logic through automated workflows
- **Maintain Data Consistency**: Ensure accurate data flow between LEDGERS and other systems

## 🏢 Business Use Cases

### **Small to Medium Businesses**
- **Complete Business Automation**: Manage entire customer lifecycle from contact creation to payment collection
- **E-commerce Integration**: Automatically sync orders, create invoices, and track payments
- **Service-based Businesses**: Generate quotes, convert to invoices, and manage service delivery
- **Retail Operations**: Manage inventory, create sales documents, and track customer interactions

### **Enterprise Operations**
- **Multi-system Integration**: Connect LEDGERS with CRM, ERP, and other business systems
- **Bulk Data Processing**: Handle large volumes of transactions and data synchronization
- **Automated Workflows**: Create complex business rules and automated decision-making processes
- **Reporting and Analytics**: Extract data for business intelligence and reporting systems

### **Industry-Specific Applications**
- **Professional Services**: Time-based billing, project management, and client communication
- **Manufacturing**: Purchase order management, inventory tracking, and supplier relations
- **Consulting**: Project-based invoicing, expense tracking, and client management
- **Subscription Services**: Recurring billing, customer lifecycle management, and payment processing

---

## 🔧 Installation

To install this community node, follow the instructions in the [n8n community node installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

```bash
npm install @ledgers/n8n-nodes-ledgers-cloud
```

After installing, restart n8n and the node will be available in the editor.

---

## 📋 Supported Operations

The LEDGERS node supports the following operations:

### **Contacts**
- **Create Contact** - Create a new contact with billing/shipping addresses
- **Update Contact** - Update existing contact information
- **Add Address** - Add billing or shipping addresses to existing contacts
- **Update Address** - Update specific addresses for contacts
- **Get Contact** - Retrieve a specific contact by ID
- **Get All Contacts** - List all contacts with pagination and search

### **Catalogs**
- **Create Catalog** - Create new catalog items with variants
- **Update Catalog** - Update catalog item details
- **Update Variant** - Update specific variant details
- **Add Variant** - Add new variants to existing catalogs
- **Get Catalog** - Retrieve a specific catalog by ID
- **Get All Catalogs** - List all catalogs with pagination and search

### **Sales**
- **Create Invoice** - Generate new invoices with contact and item details
- **View Invoice** - Retrieve specific invoice details
- **List Invoices** - List all invoices with filtering and pagination
- **Create Quote** - Generate new quotes/estimates with contact and item details
- **View Quote** - Retrieve specific quote details
- **List Quotes** - List all quotes with filtering and pagination
- **Create Receipt** - Generate payment receipts with flexible payment method support
- **View Receipt** - Retrieve specific receipt details
- **List Receipts** - List all receipts with filtering and pagination

---

## 🔧 Operation Details

### **Contact Operations**
- **Required Fields**: Contact name, mobile, email
- **Address Support**: Billing and shipping addresses with GSTIN
- **Country Codes**: Support for multiple country dial codes
- **Validation**: Mobile number format validation

### **Catalog Operations**
- **Item Types**: Goods and Services support
- **GST Integration**: Built-in GST rates (0%, 5%, 12%, 18%, 28%)
- **Variants**: Multiple variants per catalog item
- **HSN/SAC Codes**: Automatic code suggestions via AI
- **Cess Support**: Flat and percentage-based cess

### **Sales Operations**
- **Invoice Creation**: Full invoice generation with contact and item details
- **Quote Generation**: Estimate creation with validity periods
- **Receipt Management**: Payment receipt creation with flexible payment methods
- **Item Management**: Multiple items with rates, quantities, and tax calculations
- **Date Filtering**: Date range filtering for listing operations
- **Payment Status**: Track payment status (Paid, Not Paid, Part Paid, Deleted)
- **Payment Methods**: Flexible payment method selection with custom input fallback
- **Reconciliation**: Support for invoice reconciliation in receipts
- **Validation**: Rate validation (non-negative), date range completeness

## 💼 Uses of Sales Operations

The Sales module in LEDGERS node is designed for comprehensive revenue management and customer transaction handling:

### **Invoice Management**
- **Automated Billing**: Create invoices automatically based on triggers (orders, time periods, etc.)
- **Multi-item Invoicing**: Handle complex invoices with multiple products/services
- **Tax Calculations**: Automatic GST calculations with different tax rates
- **Customer Integration**: Link invoices directly to contact records
- **Status Tracking**: Monitor payment status and follow up on overdue invoices

### **Quote/Estimate Management**
- **Sales Pipeline**: Generate quotes for potential customers automatically
- **Quote Tracking**: Monitor quote status and conversion rates
- **Validity Management**: Set and track quote expiration dates
- **Quote-to-Invoice**: Convert accepted quotes to invoices seamlessly

### **Receipt Management**
- **Payment Recording**: Automatically record payments against invoices
- **Multiple Payment Methods**: Support various payment types (cash, bank transfer, cards, etc.)
- **Reconciliation**: Match receipts with outstanding invoices
- **Payment Tracking**: Maintain complete payment history
- **Flexible Input**: Handle custom payment methods when API data is unavailable

### **Business Workflow Examples**
- **E-commerce Integration**: Auto-generate invoices from online orders
- **Subscription Billing**: Create recurring invoices for subscription services
- **Payment Processing**: Record payments and update invoice status automatically
- **Financial Reporting**: Extract sales data for accounting and reporting systems
- **Customer Communication**: Trigger email notifications for invoices and receipts

---

## 🔐 Credentials

To authenticate with the LEDGERS API, you must provide the following:

* **X-API-Key** – [Get your API Key from LEDGERS](https://ledgers.cloud/in/n8n/)
* **Email** – Your registered LEDGERS account email
* **Password** – Your LEDGERS account password
* **API URL** – Your LEDGERS API endpoint (e.g., https://in-api.ledgers.cloud for India)

> ⚠️ The node performs a login to retrieve an `api_token`, which is used in all subsequent API requests. If login fails, the node will return the appropriate error message from the API.

---

## 🚀 Upcoming Release

### **Purchase Operations**
- **Create Purchase Order**: Generate purchase orders for suppliers
- **View Purchase Order**: Retrieve specific purchase order details
- **List Purchase Orders**: List all purchase orders with filtering
- **Purchase Invoice Management**: Handle supplier invoices and payments
- **Supplier Management**: Enhanced supplier contact operations
- **Inventory Integration**: Link purchases with catalog items

### **UAE LEDGERS Support**
- **Complete UAE Operations**: Full support for UAE region including all current operations
- **Multi-region Workflows**: Handle both India and UAE operations in single workflows
- **Currency Support**: Enhanced multi-currency handling for UAE operations
- **Localization**: UAE-specific business rules and compliance features

---

## ✅ Compatibility

| Feature             | Status        |
| ------------------- | ------------- |
| n8n v1.89.0+        | ✅ Supported   |
| Credential Test     | ✅ Implemented |
| Auto Token Handling | ✅ Implemented |
| Continue On Fail    | ✅ Supported   |
| Date Range Validation| ✅ Implemented |
| Negative Rate Validation| ✅ Implemented |
| Receipt Operations  | ✅ Implemented |
| Payment Method Fallback| ✅ Implemented |
| Invoice Reconciliation| ✅ Implemented |

---

## 🚀 Usage Examples

### Create a Contact
1. Select **Contact** as resource
2. Choose **Create Contact** operation
3. Provide contact name and optional details
4. Add billing/shipping addresses if needed

### Create an Invoice
1. Select **Sales** as resource
2. Choose **Create Invoice** operation
3. Provide contact details
4. Add items with required fields (name, ID, rate, quantity, etc.)
5. Set seller branch ID and optional fields

### Create a Receipt
1. Select **Sales** as resource
2. Choose **Create Receipt** operation
3. Provide contact details and amount
4. Select payment method (with automatic fallback to custom input if API fails)
5. Set seller ID and expense type (COA ID)
6. Add optional fields like transaction number, reconciliation details

### List Invoices with Filters
1. Select **Sales** as resource
2. Choose **List Invoices** operation
3. Set page number and page size
4. Add filters (date range, payment status, contact ID)

### List Receipts with Filters
1. Select **Sales** as resource
2. Choose **List Receipts** operation
3. Set page number and page size
4. Add filters (date range, reconcile status, contact ID)

### Create a Catalog Item
1. Select **Catalog** as resource
2. Choose **Create Catalog** operation
3. Provide catalog name, price, type, and item type
4. Add optional fields like GST rate, units, SKU

---

## ⚠️ Validation Rules

### Date Range Filtering
- When using date range filters in List Invoices, List Quotes, or List Receipts, **both Date From and Date To must be provided**
- If only one date is provided, the operation will fail with a validation error

### Rate Validation
- Item rates cannot be negative
- Non-taxable amount cannot be greater than the rate

### Required Fields
- Contact operations require valid contact details
- Invoice/Quote items require name, ID, variant ID, rate, quantity, item type, HSN/SAC code, taxable amount, GST rate, and price type
- Receipt operations require contact details, amount, payment method, and expense type (COA ID)
- Catalog operations require name, price, type, and item type

### Payment Method Handling
- Payment methods are loaded from the LEDGERS API when available
- If the API fails or returns no data, users can type custom payment method values
- This ensures receipts can always be created even when the payment methods API is unavailable

### Receipt Operations Features
- **Flexible Payment Methods**: Automatic fallback to custom input when API is unavailable
- **Seller Information**: Automatic branch data fetching and inclusion in receipts
- **Invoice Reconciliation**: Support for reconciling receipts against existing invoices
- **Transaction Tracking**: Optional transaction number field for payment reference
- **Multiple Address Types**: Support for both billing and shipping addresses
- **Notification Support**: Option to send receipt notifications

---

## 🔄 Error Handling & Continue On Fail

This node supports **"Continue On Fail"**, meaning:

* If one item fails (e.g., due to an invalid ID or missing required field), it logs the error and continues processing the rest of the items.
* If disabled, the node stops execution upon the first error.
* Validation errors are clearly communicated with specific error messages.

You can enable this in the node's settings under the **"Continue On Fail"** option.

---

## 📚 Resources

* [n8n Community Node Docs](https://docs.n8n.io/integrations/community-nodes/)
* [LEDGERS Website](https://ledgers.cloud/in/n8n/)
* [LEDGERS API Documentation](https://ledgers.readme.io/reference/authentication)

---

## 🕒 Version History

| Version | Changes                                                                          |
| ------- | ---------------------------------------------------------------------------------|
| 0.0.1   | Stable Release of LEDGERS Custom Node under N8N                                  |
| 0.0.2   | Logo Rename for Linux OS                                                         |
| 0.0.3   | Catalog Operations Release with updates in Contact Operations                    |
| 0.0.4   | No code changes. Only updated package-lock.json to match npm registry state      |
| 0.0.5   | No code changes. Logo File Updated with Better Resolution                        |
| 0.0.6   | No code changes. Final Logo File Updated with Better Resolution                  |
| 0.0.7   | Sales Operations like Invoice, Quotes and Receipt Release with enhanced features |

---

Maintained by the [LEDGERS.cloud](https://ledgers.cloud/) team.
