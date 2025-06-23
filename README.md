# n8n-nodes-ledgers-cloud

This is an n8n community node for integrating with [LEDGERS](https://ledgers.cloud/) – a comprehensive business platform offering features like accounting, invoicing, contacts, and catalogs.

Use this node to automate LEDGERS workflows directly from within [n8n](https://n8n.io), the fair-code licensed workflow automation platform.

---

## 🔧 Installation

To install this community node, follow the instructions in the [n8n community node installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

```bash
npm install @ledgers/n8n-nodes-ledgers-cloud
````

After installing, restart n8n and the node will be available in the editor.

---

## 📌 Supported Operations

This node currently supports the following operations:

### **Contacts**

* **Create Contact**: Add a new contact with details such as name, email, mobile, GSTIN, business name, and address.
* **Update Contact**: Update an existing contact's details by Contact ID. You can update fields like email, mobile, GSTIN, business name, address, and status.
* **Get Contact by ID**: Retrieve a single contact's details using their Contact ID.
* **Get All Contacts**: Fetch a list of all contacts. Supports advanced search:
  * **Search by Name**: Find contacts by partial or full name match.
  * **Limit Results**: Control the number of contacts returned per page.

### **Catalogs**

* **Create Catalog**: Add a new catalog item (product or service) with details like name, price, type (sales/purchase), item type (goods/services), GST, units, SKU, and more.
* **Get All Catalogs**: Retrieve a list of all catalog items. Supports:
  * **Search by Name**: Find catalog items by name.
  * **Limit Results**: Control the number of catalog items returned per page.
* **Get Catalog by ID**: Fetch details of a specific catalog item using its Catalog ID.
* **Update Catalog**: Update details of an existing catalog item, such as GST rate, units, description, status, and more.
* **Add Variant (Existing Catalog)**: Add a new variant to an existing catalog item.
* **Update Variant (Existing Catalog)**: Update details of a specific variant within a catalog item.

---

## 🗂️ Operation Details

### Contacts

- **Create Contact**: Requires a contact name. You can optionally provide email, mobile (with country code), GSTIN, business name, billing address, city, state, and country.
- **Update Contact**: Requires the Contact ID. You can update any of the fields available during creation, plus status (active/inactive).
- **Get Contact by ID**: Requires the Contact ID. Returns all details for the specified contact.
- **Get All Contacts**: You can search by name (partial match) or limit the number of results per page. Useful for filtering large contact lists.

### Catalogs

- **Create Catalog**: Requires catalog name, price, catalog type (sales/purchase), and item type (goods/services). Additional fields include GST type, GST rate, units, SKU, description, status, HSN/SAC code, and cess details.
- **Get All Catalogs**: Search by catalog name or limit the number of results per page. Useful for quickly finding catalog items.
- **Get Catalog by ID**: Requires the Catalog ID. Returns all details for the specified catalog item.
- **Update Catalog**: Requires the Catalog ID. You can update GST rate, units, description, status, and other catalog fields.
- **Add Variant (Existing Catalog)**: Add a new variant to an existing catalog item. Requires Catalog ID, variant name, price, and optional fields like GST type, SKU, and description.
- **Update Variant (Existing Catalog)**: Update details of a specific variant within a catalog item. Requires Catalog ID and Variant ID.

---

## 🚧 Roadmap

We plan to add support for **Sales Invoices** and **Purchase Invoices** modules in future releases. Stay tuned for more features!

---

## 🔐 Credentials

To authenticate with the LEDGERS API, you must provide the following:

* **X-API-Key** – [Get your API Key from LEDGERS](https://ledgers.cloud/c/developers)
* **Email** – Your registered LEDGERS account email
* **Password** – Your LEDGERS account password

> ⚠️ The node performs a login to retrieve an `api_token`, which is used in all subsequent API requests. If login fails, the node will return the appropriate error message from the API.

---

## ✅ Compatibility

| Feature             | Status        |
| ------------------- | ------------- |
| n8n v1.89.0+        | ✅ Supported   |
| Credential Test     | ✅ Implemented |
| Auto Token Handling | ✅ Implemented |
| Continue On Fail    | ✅ Supported   |

---

## 🚀 Usage

1. Install the node via npm.
2. Add credentials of type **LEDGERS API** in the n8n credentials UI.
3. Enter your `X-API-Key`, `email`, and `password`.
4. Use the **LEDGERS** node to perform contact-related operations.

Example: To create a new contact, choose **Create Contact** as the operation and provide the required fields.

---

## ⚠️ Error Handling & Continue On Fail

This node supports **"Continue On Fail"**, meaning:

* If one item fails (e.g., due to an invalid contact ID or missing required field), it logs the error and continues processing the rest of the items.
* If disabled, the node stops execution upon the first error.

You can enable this in the node's settings under the **"Continue On Fail"** option.

---

## 📚 Resources

* [n8n Community Node Docs](https://docs.n8n.io/integrations/community-nodes/)
* [LEDGERS Website](https://ledgers.cloud/)

---

## 🕒 Version History

| Version | Changes                                                            |
| ------- | ------------------------------------------------------------------ |
| 0.0.1   | Stable Release of LEDGERS Custom Node under N8N                    |
| 0.0.2   | Logo Rename for Linux OS                                           |
| 0.0.3   | Catalog Operations Release with updates in Contact Operations      |

---

Maintained by the [LEDGERS.cloud](https://ledgers.cloud/) team.