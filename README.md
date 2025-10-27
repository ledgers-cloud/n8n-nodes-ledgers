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

### **Triggers**
- **LEDGERS Webhook Trigger** - Listen to real-time events from LEDGERS API via webhooks

### **Regular Operations**

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
- **Create Invoice** - Generate new invoices with comprehensive validation and contact/item details
- **View Invoice** - Retrieve specific invoice details
- **List Invoices** - List all invoices with filtering and pagination
- **Create Quote** - Generate new quotes/estimates with validation and contact/item details
- **View Quote** - Retrieve specific quote details
- **List Quotes** - List all quotes with filtering and pagination
- **Create Receipt** - Generate payment receipts with flexible payment method support
- **View Receipt** - Retrieve specific receipt details
- **List Receipts** - List all receipts with filtering and pagination

### **Purchase**
- **Create Purchase Invoice** - Generate supplier invoices with comprehensive validation and detailed item management
- **View Purchase Invoice** - Retrieve specific purchase invoice details
- **List Purchase Invoices** - List all purchase invoices with filtering and pagination
- **Create Voucher** - Generate expense, payment, and salary vouchers
- **View Voucher** - Retrieve specific voucher details
- **List Vouchers** - List all vouchers with filtering and pagination

### **HRMS (Human Resource Management)**
- **Get All Employees** - List all employees with pagination, search, and filtering options
- **Add Employee** - Create new employee records with comprehensive details
- **Update Employee** - Update existing employee information including status changes
- **Get Employee** - Retrieve specific employee details by GID

### **Banking**
- **Get Bank Statement** - Retrieve account statements for selected bank accounts with date range filtering
  - **Supported Banks**: ICICI Bank and Axis Bank
  - **Requirements**: Connected banking must be set up in LEDGERS
  - **Features**: Dynamic account selection, date range filtering, secure data handling

---

## 🔧 Operation Details

### **Contact Operations**
- **Required Fields**: Contact name, mobile, email
- **Address Support**: Billing and shipping addresses with GSTIN (India) / TRN Number (UAE)
- **Country Codes**: Support for multiple country dial codes
- **Validation**: Mobile number format validation
- **Multi-region Support**: India and UAE operations with region-specific field mapping

### **Catalog Operations**
- **Item Types**: Goods and Services support
- **GST Integration**: Built-in GST rates (0%, 5%, 12%, 18%, 28%)
- **Variants**: Multiple variants per catalog item
- **HSN/SAC Codes**: Automatic code suggestions via AI
- **Cess Support**: Flat and percentage-based cess
- **Multi-region Support**: India and UAE operations with region-specific business rules

### **Sales Operations**
- **Invoice Creation**: Full invoice generation with comprehensive validation and contact/item details
- **Quote Generation**: Estimate creation with validity periods and date picker support
- **Receipt Management**: Payment receipt creation with flexible payment methods
- **Item Management**: Multiple items with strict numeric validation (rates, quantities, tax calculations)
- **Date Filtering**: Date range filtering for listing operations with validation
- **Payment Status**: Track payment status (Paid, Not Paid, Part Paid, Deleted)
- **Payment Methods**: Flexible payment method selection with custom input fallback
- **Reconciliation**: Support for invoice reconciliation in receipts
- **GST Rate Dropdown**: Standardized GST rate selection with predefined options
- **Advanced Validation**: Integer validation for PID (>0), Variant ID (>0), rates (≥0), and taxable amounts (≥0)
- **Business Logic Validation**: Taxable amount cannot exceed rate, non-taxable amount cannot exceed rate

### **Purchase Operations**
- **Purchase Invoice Management**: Create supplier invoices with comprehensive validation and item details
- **Voucher System**: Three types of vouchers with specialized functionality:
  - **Expense Vouchers**: Single or multiple expense head management with tax calculations
  - **Payment Vouchers**: Supplier payment tracking with invoice reconciliation
  - **Salary Vouchers**: Employee salary processing with detailed breakdowns
- **Advanced Item Management**: Purchase items with strict numeric validation and specialized supply options
- **Address Management**: Separate billing and shipping address handling
- **Tax Integration**: Multiple tax types and specialized supply configurations
- **Currency Support**: Multi-currency handling for international purchases
- **Date Filtering**: Comprehensive date range filtering for all list operations
- **Payment Status Tracking**: Monitor payment status across all purchase documents
- **Reconciliation Features**: Match payments with purchase invoices automatically
- **Enhanced Validation**: Integer validation for PID (>0), VID (>0), rates (≥0), and taxable amounts (≥0)
- **Business Logic Validation**: Same validation rules as Sales operations for consistency

### **HRMS Operations**
- **Employee Management**: Complete employee lifecycle management from hiring to exit
- **Comprehensive Data Handling**: Personal, professional, and financial information management
- **Address Management**: Present and permanent address handling with detailed fields
- **Bank Details**: Employee banking information for salary processing
- **Statutory Compliance**: PAN, Aadhar, UAN, ESI number management
- **Search and Filter**: Advanced employee search with multiple criteria
- **Status Management**: Active/inactive employee status with exit date tracking
- **Validation**: Required field validation for employee creation and updates

### **Banking Operations**
- **Account Selection**: Dynamic dropdown populated with active bank accounts and linked accounts
- **Statement Retrieval**: Fetch account statements for specific date ranges
- **Security Features**: Masked account numbers and secure data handling
- **Date Range Filtering**: Flexible date selection for statement periods
- **Error Handling**: Clear error messages for missing accounts or configuration issues
- **Multi-Account Support**: Handle multiple linked accounts per URN
- **Validation**: Required field validation for account selection and date ranges
- **Supported Banks**: ICICI Bank and Axis Bank integration
- **Setup Requirements**: Connected banking must be configured in LEDGERS platform
- **Connected Banking**: Only works when banking integration is set up in LEDGERS



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

## 💼 Uses of Purchase Operations

The Purchase module in LEDGERS node is designed for comprehensive procurement management and supplier transaction handling:

### **Purchase Invoice Management**
- **Supplier Billing**: Create and manage supplier invoices with detailed item tracking
- **Multi-item Purchasing**: Handle complex purchases with multiple products/services
- **Tax Management**: Automatic tax calculations with various tax types and rates
- **Supplier Integration**: Link purchase invoices directly to supplier contact records
- **Export/Import Handling**: Specialized support for international trade documentation

### **Voucher Management System**
- **Expense Vouchers**: Record business expenses with single or multiple expense heads
- **Payment Vouchers**: Track supplier payments with automatic invoice reconciliation
- **Salary Vouchers**: Process employee salaries with detailed breakdown (PF, ESI, TDS, etc.)
- **Multi-currency Support**: Handle vouchers in different currencies for international operations

### **Advanced Purchase Features**
- **Specialized Supply Types**: Handle different supply categories with appropriate tax treatment
- **Address Management**: Separate billing and shipping addresses for complex procurement
- **Reconciliation System**: Automatically match payments with outstanding purchase invoices
- **Date Range Filtering**: Advanced filtering for better procurement tracking and reporting

### **Business Workflow Examples**
- **Procurement Automation**: Auto-create purchase invoices from supplier orders
- **Expense Management**: Systematically record and categorize business expenses
- **Payroll Processing**: Automate salary payments with detailed tax and deduction calculations
- **Supplier Payment Tracking**: Monitor payment status and reconcile supplier accounts
- **Financial Compliance**: Maintain proper documentation for tax and audit requirements

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

### **LEDGERS Triggers**
- **Real-time Webhooks**: Listen to events from LEDGERS platform
- **Event-driven Workflows**: Automate based on contact, invoice, and catalog changes
- **Multi-region Support**: Triggers for both India and UAE operations

### **UAE Sales and Purchase Operations**
- **Complete UAE Sales**: Full invoice, quote, and receipt management for UAE
- **UAE Purchase Operations**: Purchase invoices, vouchers, and procurement management
- **Multi-region Workflows**: Handle both India and UAE operations in single workflows
- **Currency Support**: Enhanced multi-currency handling for UAE operations
- **Localization**: UAE-specific business rules and compliance features

### **Enhanced Purchase Operations**
- **Create Purchase Order**: Generate purchase orders for suppliers
- **View Purchase Order**: Retrieve specific purchase order details  
- **List Purchase Orders**: List all purchase orders with filtering
- **Inventory Integration**: Link purchases with catalog items

---

## ✅ Compatibility

| Feature             | Status        |
| ------------------- | ------------- |
| n8n v1.89.0+        | ✅ Supported   |
| Credential Test     | ✅ Implemented |
| Auto Token Handling | ✅ Implemented |
| Continue On Fail    | ✅ Supported   |
| Date Range Validation| ✅ Implemented |
| Advanced Numeric Validation| ✅ Implemented |
| Receipt Operations  | ✅ Implemented |
| Payment Method Fallback| ✅ Implemented |
| Invoice Reconciliation| ✅ Implemented |
| Purchase Operations | ✅ Implemented |
| Voucher Management  | ✅ Implemented |
| Multi-Currency Support| ✅ Implemented |
| Specialized Supply Types| ✅ Implemented |
| Export Documentation| ✅ Implemented |
| HRMS Operations     | ✅ Implemented |
| Banking Operations  | ✅ Implemented |
| ICICI & Axis Bank   | ✅ Implemented |
| UAE Contact Operations| ✅ Implemented |
| UAE Catalog Operations| ✅ Implemented |

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

### Create a Purchase Invoice
1. Select **Purchase** as resource
2. Choose **Create Purchase Invoice** operation
3. Provide purchase number, dates, and supplier contact details
4. Add items with required fields (name, rate, quantity, tax details)
5. Set billing and shipping addresses
6. Configure additional fields for specialized supplies or export details

### Create an Expense Voucher
1. Select **Purchase** as resource
2. Choose **Create Voucher** operation
3. Select **Expense Voucher** as voucher type
4. Choose between single expense or multiple expenses
5. Provide expense details, amounts, and tax information
6. Set branch ID and payment details

### Create a Salary Voucher
1. Select **Purchase** as resource
2. Choose **Create Voucher** operation
3. Select **Salary Voucher** as voucher type
4. Provide employee details and salary month (MM-YYYY format)
5. Add salary amount and detailed breakdown (PF, ESI, TDS, etc.)
6. Configure additional salary details as needed

### List Purchase Invoices with Filters
1. Select **Purchase** as resource
2. Choose **List Purchase Invoices** operation
3. Set page size and filters (date range, payment status)
4. Configure ordering options (order by, order column)

### Get Bank Statement
1. Select **Banking** as resource
2. Choose **Get Bank Statement** operation
3. Select bank (ICICI or Axis Bank)
4. Choose account from dropdown (requires connected banking setup)
5. Set date range for statement period
6. **Note**: Connected banking must be configured in LEDGERS platform

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

### Advanced Numeric Validation (Sales & Purchase Operations)
- **PID (Item ID)**: Must be an integer greater than 0 (not zero or negative)
- **Variant ID**: Must be an integer greater than 0 (not zero or negative)
- **Rate**: Must be an integer >= 0 and not empty
- **Taxable Per Item/Amount**: Must be an integer >= 0 and not empty
- **Non-Taxable Per Item/Amount**: Must be an integer >= 0 and not empty
- **Business Logic**: Taxable amount cannot exceed the rate
- **Business Logic**: Non-taxable amount cannot exceed the rate
- **Contact Validation**: Contact Name and Contact ID are required for Invoice, Quote, and Purchase Invoice operations

### Required Fields
- **Sales Operations**: Invoice/Quote items require name, ID, variant ID, rate, quantity, item type, HSN/SAC code, taxable amount, GST rate
- **Purchase Operations**: Purchase invoice items require item_name, item_code, pid, vid, rate, quantity, item_type, taxable_amount, non_taxable_amount, gst_rate
- **Receipt Operations**: Contact details, amount, payment method, and expense type (COA ID)
- **Catalog Operations**: Name, price, type, and item type
- **Voucher Operations**: Voucher type, branch ID, payment date, and type-specific fields
- **HRMS Operations**: Name, branch, date of join, personal mobile, office email, date of birth, gender are required for adding employees

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

### Purchase Operations Features
- **Voucher Type Validation**: Different validation rules apply based on voucher type (Expense, Payment, Salary)
- **Multiple Expense Handling**: Expense vouchers support both single and multiple expense head entries
- **Salary Month Format**: Salary vouchers require MM-YYYY format for salary month field
- **Reconciliation Support**: Payment vouchers can reconcile against existing purchase invoices
- **Specialized Supply Types**: Purchase invoices support different supply categories with appropriate tax handling
- **Export Documentation**: Support for export bill numbers, dates, and port codes for international trade
- **Currency Validation**: Multi-currency support with proper currency code validation
- **Address Synchronization**: Option to use billing address for shipping when addresses are the same

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
| 0.0.8   | Purchase Operations Release with Purchase Invoices, Vouchers, and advanced features |
| 0.0.9   | HRMS operations and Enhanced Validations for Sales and Purchase Operations |
| 0.0.10  | Banking Operation to Retrieve connected banking account statements in LEDGERS and Opening Balance in Create and Update Contact |
| 0.0.11  | Enhanced Contact Operations with multiple billing/shipping addresses, tax field mapping, currency support, and multi-region API support (India & UAE) |
| 0.0.12  | In Catalog Operations Units List Updated as per Document |
| 0.0.13  | Tax Rate Updates, Contact Inputs Name Update and Payment Mode Bug Fix |
| 0.0.14  | Tax Rates Updated for India |
| 0.0.15  | Removed HSN/SAC code function, made HSN/SAC manual input required, fixed hardcoded API credentials, updated deprecated IRequestOptions to IHttpRequestOptions, and added pairedItem for data provenance |
| 0.0.16  | Removed HSN/SAC code required in Update Catalog |
| 0.0.17  | HSN/SAC Bug Fix in Front end of Catalog Operations and Back end |

---

Maintained by the [LEDGERS.cloud](https://ledgers.cloud/) team.
