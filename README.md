# n8n-nodes-ledgers-cloud

This is an n8n community node for integrating with [LEDGERS](https://ledgers.cloud/) – a comprehensive business platform offering features like accounting, invoicing, contacts, catalogs, and quotes.

Use this node to automate LEDGERS workflows directly from within [n8n](https://n8n.io), the fair-code licensed workflow automation platform.

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

### **Contacts** (India API)
- **Create Contact** - Create a new contact with billing/shipping addresses
- **Update Contact** - Update existing contact information
- **Add Address** - Add billing or shipping addresses to existing contacts
- **Update Address** - Update specific addresses for contacts
- **Get Contact** - Retrieve a specific contact by ID
- **Get All Contacts** - List all contacts with pagination and search

### **Catalogs** (All Regions)
- **Create Catalog** - Create new catalog items with variants
- **Update Catalog** - Update catalog item details
- **Update Variant** - Update specific variant details
- **Add Variant** - Add new variants to existing catalogs
- **Get Catalog** - Retrieve a specific catalog by ID
- **Get All Catalogs** - List all catalogs with pagination and search

### **Sales** (All Regions)
- **Create Invoice** - Generate new invoices with contact and item details
- **View Invoice** - Retrieve specific invoice details
- **List Invoices** - List all invoices with filtering and pagination
- **Create Quote** - Generate new quotes/estimates with contact and item details
- **View Quote** - Retrieve specific quote details
- **List Quotes** - List all quotes with filtering and pagination

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
- **Item Management**: Multiple items with rates, quantities, and tax calculations
- **Date Filtering**: Date range filtering for listing operations
- **Payment Status**: Track payment status (Paid, Not Paid, Part Paid, Deleted)
- **Validation**: Rate validation (non-negative), date range completeness

---

## 🔐 Credentials

To authenticate with the LEDGERS API, you must provide the following:

* **X-API-Key** – [Get your API Key from LEDGERS](https://ledgers.cloud/in/n8n/)
* **Email** – Your registered LEDGERS account email
* **Password** – Your LEDGERS account password
* **API URL** – Your LEDGERS API endpoint (e.g., https://in-api.ledgers.cloud for India)

> ⚠️ The node performs a login to retrieve an `api_token`, which is used in all subsequent API requests. If login fails, the node will return the appropriate error message from the API.

---

## 🚀 Coming Soon

**LEDGERS UAE** will be available for all operations (Contacts, Catalogs, Invoices, and Quotes) in an upcoming release.

---

## 🚧 Roadmap

### **Upcoming Features**
- **UAE LEDGERS Support**: Full support for UAE region including all operations (Contacts, Catalogs, Invoices, Quotes)
- **Enhanced Filtering**: Additional filtering options for invoice and quote listings
- **Bulk Operations**: Support for bulk create/update operations
- **Advanced Search**: Enhanced search capabilities across all modules

### **Future Enhancements**
- **Real-time Notifications**: Webhook support for real-time updates
- **Advanced Reporting**: Integration with LEDGERS reporting features
- **Multi-currency Support**: Enhanced currency handling for international operations

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

---

## 🚀 Usage Examples

### Create a Contact
1. Select **Contact** as resource
2. Choose **Create Contact** operation
3. Provide contact name and optional details
4. Add billing/shipping addresses if needed

### Create an Invoice
1. Select **Invoice** as resource
2. Choose **Create Invoice** operation
3. Provide contact details
4. Add items with required fields (name, ID, rate, quantity, etc.)
5. Set seller branch ID and optional fields

### List Invoices with Filters
1. Select **Invoice** as resource
2. Choose **List Invoices** operation
3. Set page number and page size
4. Add filters (date range, payment status, contact ID)

### Create a Catalog Item
1. Select **Catalog** as resource
2. Choose **Create Catalog** operation
3. Provide catalog name, price, type, and item type
4. Add optional fields like GST rate, units, SKU

---

## ⚠️ Validation Rules

### Date Range Filtering
- When using date range filters in List Invoices or List Quotes, **both Date From and Date To must be provided**
- If only one date is provided, the operation will fail with a validation error

### Rate Validation
- Item rates cannot be negative
- Non-taxable amount cannot be greater than the rate

### Required Fields
- Contact operations require valid contact details
- Invoice/Quote items require name, ID, variant ID, rate, quantity, item type, HSN/SAC code, taxable amount, GST rate, and price type
- Catalog operations require name, price, type, and item type

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

| Version | Changes                                                                     |
| ------- | --------------------------------------------------------------------------- |
| 0.0.1   | Stable Release of LEDGERS Custom Node under N8N                             |
| 0.0.2   | Logo Rename for Linux OS                                                    |
| 0.0.3   | Catalog Operations Release with updates in Contact Operations               |
| 0.0.4   | No code changes. Only updated package-lock.json to match npm registry state |
| 0.0.5   | No code changes. Logo File Updated with Better Resolution                   |
| 0.0.6   | No code changes. Final Logo File Updated with Better Resolution             |
| 0.0.7   | Sales Operations like Invoice, Quotes, Receipt and Credit Note              |

---

Maintained by the [LEDGERS.cloud](https://ledgers.cloud/) team.
