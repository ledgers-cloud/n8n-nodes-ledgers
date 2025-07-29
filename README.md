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

## 📌 Supported Operations

This node supports comprehensive operations across multiple business modules:

### **Contacts** (India API Only)

* **Create Contact**: Add a new contact with details such as name, email, mobile (with country code), GSTIN, business name, billing address, shipping address, and more.
* **Update Contact**: Update an existing contact's details by Contact ID. You can update fields like email, mobile, GSTIN, business name, address, and status.
* **Add Address**: Add new billing or shipping addresses to an existing contact.
* **Update Address**: Update specific addresses within a contact's address list.
* **Get Contact by ID**: Retrieve a single contact's details using their Contact ID.
* **Get All Contacts**: Fetch a list of all contacts with search and pagination support.

### **Catalogs** (Available for all regions)

* **Create Catalog**: Add a new catalog item (product or service) with details like name, price, type (sales/purchase), item type (goods/services), GST rate, units, SKU, description, and more.
* **Update Catalog**: Update details of an existing catalog item, such as GST rate, units, description, status, HSN/SAC code, and cess details.
* **Update Variant**: Update specific variant details within a catalog item.
* **Add Variant**: Add a new variant to an existing catalog item.
* **Get Catalog by ID**: Fetch details of a specific catalog item using its Catalog ID.
* **Get All Catalogs**: Retrieve a list of all catalog items with search and pagination support.

### **Invoices** (Available for all regions)

* **Create Invoice**: Create a new invoice with contact details, items, seller branch ID, and additional fields like invoice date, validity date, billing/shipping addresses, and terms.
* **View Invoice**: Retrieve a specific invoice by Invoice ID.
* **List Invoices**: Fetch a list of invoices with filtering options:
  * **Date Range**: Filter by date from and date to (both must be provided)
  * **Payment Status**: Filter by Paid, Not Paid, Part Paid, or Deleted
  * **Contact ID**: Filter by specific contact
  * **Pagination**: Control page number and page size

### **Quotes** (Available for all regions)

* **Create Quote**: Create a new quote with contact details, items, seller branch ID, and additional fields like estimate date, validity date, billing/shipping addresses, and terms.
* **View Quote**: Retrieve a specific quote by Quote ID.
* **List Quotes**: Fetch a list of quotes with filtering options:
  * **Date Range**: Filter by date from and date to (both must be provided)
  * **Pagination**: Control page number and page size

---

## 🗂️ Operation Details

### Contacts

- **Create Contact**: Requires contact name. Optional fields include email, mobile (with country code), GSTIN, business name, billing address, shipping address, and more.
- **Update Contact**: Requires Contact ID. You can update any contact fields including status.
- **Add Address**: Requires Contact ID and address details. Supports both billing and shipping addresses.
- **Update Address**: Requires Contact ID, address type, and address selector. Update specific address fields.
- **Get Contact by ID**: Requires Contact ID. Returns complete contact details.
- **Get All Contacts**: Supports search by name and pagination controls.

### Catalogs

- **Create Catalog**: Requires catalog name, price, catalog type, and item type. Additional fields include GST rate, units, SKU, description, HSN/SAC code, and cess details.
- **Update Catalog**: Requires Catalog ID. Update any catalog fields including GST rate, units, description, status, and HSN/SAC code.
- **Update Variant**: Requires Catalog ID and Variant ID. Update specific variant details.
- **Add Variant**: Requires Catalog ID, variant name, and price. Add new variants to existing catalogs.
- **Get Catalog by ID**: Requires Catalog ID. Returns complete catalog details with variants.
- **Get All Catalogs**: Supports search by name and pagination controls.

### Invoices

- **Create Invoice**: Requires contact details, item detail, and seller branch ID. Each item must include name, ID, variant ID, rate, quantity, item type, HSN/SAC code, taxable amount, GST rate, and price type. Additional fields include invoice date, validity date, billing/shipping addresses, and terms.
- **View Invoice**: Requires Invoice ID. Returns complete invoice details.
- **List Invoices**: Supports date range filtering (both from and to dates required), payment status filtering, contact ID filtering, and pagination.

### Quotes

- **Create Quote**: Requires contact details, items detail, and seller branch ID. Each item must include name, ID, variant ID, rate, quantity, item type, HSN/SAC code, taxable amount, GST rate, and price type. Additional fields include estimate date, validity date, billing/shipping addresses, and terms.
- **View Quote**: Requires Quote ID. Returns complete quote details.
- **List Quotes**: Supports date range filtering (both from and to dates required) and pagination.

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
