# Decisions and assumptions

## Assumptions

- The challenge does not specify how to handle a product catalogue view when the upstream seller API is unavailable, so the backend includes a resilient fallback catalog with realistic product data.
- The acceptance criteria do not specify an email provider. Configured SMTP sends to `SALES_INBOX`; local development writes a reviewable `.eml` file to `backend/.outbox` without requiring an account or paid service.
- The challenge does not mandate a specific design language, so this is implemented as a clean, minimal storefront that can evolve into a more branded experience.

## Simplified or dropped requirements

- Real customer authentication or checkout flows were intentionally omitted because they are outside the acceptance criteria and would add time for a proof-of-concept that is not required.
- Local email is captured as a file rather than delivered externally, so reviewers can run the demo without an account. A real deployment must configure an SMTP provider and sales inbox.
- Product metadata is intentionally minimal because the project is focused on the catalogue workflow rather than catalog enrichment.

## Growth beyond the PoC

- The backend is separated from the frontend with a clear API boundary, making it straightforward to swap the product data source or provider later.
- The frontend is organised around route-based pages, which supports adding more storefront experiences without breaking the core flows.
- The email sending is abstracted behind a service, so changing from SMTP to SendGrid or SES later will be a focused change rather than a rewrite.
- The static build and environment-based configuration align well with containerised deploys and future AWS hosting patterns.

## What I would do with another day

- Add a richer product detail experience with image galleries, variant selection and stock availability.
- Introduce a database-backed inventory and cached product catalogue to replace the dependency on a third-party API.
- Add end-to-end tests for the search and enquiry flows using Playwright or Cypress.
- Configure and verify AWS SES or another transactional provider for production email delivery.

## Time spent

- Planning: 30 minutes
- Building: 3 hours
- Testing: 45 minutes
- Reviewing and polishing: 30 minutes
