# n8n-nodes-ledgers

This is an n8n community node for integrating with [LEDGERS](https://www.ledgers.cloud) – a comprehensive business platform offering features like accounting, invoicing, contacts, and catalogs.

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

* **Create Contact**
* **Update Contact**
* **Get Contact by ID**
* **Get All Contacts**

More modules (like Invoices, Payments, etc.) will be added in future releases.

---

## 🔐 Credentials

To authenticate with the LEDGERS API, you must provide the following:

* **X-API-Key** – Your API key [get from LEDGERS](https://ledgers.cloud/c/developers)
* **Email** – Your registered email address
* **Password** – Your LEDGERS login password

> ⚠️ The node performs a login to retrieve an `api_token`, which is required for subsequent API requests.

If login fails, the node will return the API's error message.

---

## ✅ Compatibility

| Feature             | Status        |
| ------------------- | ------------- |
| n8n v1.89.0+        | ✅ Supported   |
| Credential Test     | ✅ Implemented |
| Auto Token Handling | ✅ Implemented |

---

## 🚀 Usage

1. Install the node.
2. Create new credentials of type **LEDGERS API**.
3. Enter your X-API-Key, email, and password.
4. Use the LEDGERS node to perform supported operations.

Example: You can create a new contact by selecting the `Create Contact` operation and filling in the required fields.

---

## 📚 Resources

* [n8n Community Node Docs](https://docs.n8n.io/integrations/community-nodes/)
* [LEDGERS Website](https://www.ledgers.cloud)

---

## 🕒 Version History

| Version | Description                                                      |
| ------- | ---------------------------------------------------------------- |
| 2.1.1   | Updated Version with the changes mentioned by N8N Team           |

---

Maintained by the [LEDGERS.cloud](https://www.ledgers.cloud) team.
