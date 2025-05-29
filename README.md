# n8n-nodes-ledgers

This is an n8n community node for integrating with [LEDGERS](https://ledgers.cloud/) – a comprehensive business platform offering features like accounting, invoicing, contacts, and catalogs.

Use this node to automate LEDGERS workflows directly from within [n8n](https://n8n.io), the fair-code licensed workflow automation platform.

---

## 🔧 Installation

To install this community node, follow the instructions in the [n8n community node installation guide](https://docs.n8n.io/integrations/community-nodes/installation/).

```bash
npm install @ledgers/n8n-nodes-ledgers
````

After installing, restart n8n and the node will be available in the editor.

---

## 📌 Supported Operations

This node currently supports the following operations on **Contacts**:

* ✅ Create Contact
* ✅ Update Contact
* ✅ Get Contact by ID
* ✅ Get All Contacts

More modules (like Invoices, Payments, etc.) will be added in future releases.

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
| 0.0.2   | Documentation URL Updated Version                                  |
| 0.0.3   | LEDGERS URL Updated Version                                        |

---

Maintained by the [LEDGERS.cloud](https://ledgers.cloud/) team.