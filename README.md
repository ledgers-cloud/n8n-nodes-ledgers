# 🧾 n8n-nodes-ledgers

Custom [n8n](https://n8n.io) integration for [LEDGERS](https://ledgers.cloud) – a business automation and accounting API.

This node allows you to authenticate with your LEDGERS account using `x-api-key`, email, and password, and perform operations such as creating and managing contacts using the LEDGERS API.

---

## 🚀 Features

- ✅ Credential authentication using API Key + Email + Password
- 🧾 Login logic to retrieve `api_token` dynamically
- 🔄 Automatically appends `x-api-key` and `api-token` in all requests
- 👤 Contact operations (Create, Get, Update, Get All)

---

## 📦 Installation

### Using CLI in your n8n instance:

```bash
npm install @ledgers/n8n-nodes-ledgers