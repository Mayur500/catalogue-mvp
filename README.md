# Catalogue MVP

A TypeScript product catalogue proof of concept built with a React client and a Node.js backend. It exposes a product catalogue sourced from the Fake Store API with a local fallback, supports category browsing and search, and provides a product enquiry flow that sends an email notification to the sales inbox.

## Stack choice

- Client: React + TypeScript (Vite)
- Backend: Node.js + TypeScript (Express)

Why this choice:

- React gives a quick, accessible web experience and is a strong foundation for evolving the UI into a richer storefront.
- Node.js keeps the app fast to iterate on and makes it easy to add new API integrations without exposing secrets to the browser.
- This separation keeps the product data source behind the backend so the frontend never calls the Fake Store API directly, as required.

## Features

- Home page with five top-rated featured products
- Category browsing with top-rated and additional products
- Search filtering across product title, description and category
- Product detail page with enquiry form
- Backend email abstraction for sales notifications
- Local fallback catalog to keep the app working even if the upstream API is unavailable
- Local enquiry messages saved as `.eml` files in `backend/.outbox` for review without an email account

## Local setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the app in development mode:

   ```bash
   npm run dev
   ```

4. Open the app in the browser:

   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000/api

## Production build

```bash
npm run build
```

## Run tests

```bash
npm test
```

## Environment variables

The backend reads these values from the root `.env` file (copy `.env.example` first):

- `PORT` — backend port
- `FRONTEND_URL` — origin allowed by CORS for the frontend
- `FAKE_STORE_API_BASE_URL` — upstream product source
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` — optional SMTP configuration for real email delivery

`SALES_INBOX` sets the destination address. When `SMTP_HOST` and `SALES_INBOX` are set, enquiries are sent by SMTP (with credentials if your provider requires them). With the example values left blank, messages are rendered into `backend/.outbox` as `.eml` files and the customer sees a thank-you message. The example file contains no active credentials or paid-service dependency.

## Notes

- The Fake Store API is called only from the backend.
- The backend includes a fallback catalog so the project remains usable during local demos and in offline scenarios.
- The solution is compatible with AWS deployment patterns because it uses a standard Node.js API and a static frontend build.
