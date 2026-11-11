# AI usage notes

## Tools and models

- GitHub Copilot integrated in VS Code
- Model used for coding support: MAI-Code-1.1-Flash

## Agent instruction files

- AGENTS.md is included in the repository and acts as a lightweight coding guide for future AI-assisted work.

## Plan or specification used

- The project followed the challenge acceptance criteria and the architecture choices in the README.
- The build plan focused on the critical path: backend API, data source abstraction, frontend catalog pages, and enquiry flow.

## Key prompts and moments that shaped the solution

1. “Create a TypeScript React + Node product catalogue with categories, search, and enquiry flow using the Fake Store API as the data source.”
2. “Keep the frontend ignorant of the data provider and add a local fallback if the upstream API is unavailable.”
3. “Design the app as a reusable foundations project with clear backend/frontend boundaries and AWS-friendly deployment.”
4. “Add tests for the critical path: featured products, search, and product enquiry acceptance.”

## Where AI got something wrong and how it was caught

- The initial design attempted to call the upstream API directly from the frontend; this was caught and corrected by enforcing the backend-only requirement.
- The initial email flow was too dependent on real SMTP credentials. It was adjusted to support optional SMTP configuration and a local simulated fallback so the demo remains self-contained and reviewer-friendly.
- A few UI assumptions around search routing and route encoding were corrected during review to ensure the category and search pages behave consistently.

## Actual time spent

- Planning: 30 minutes
- Building: 3 hours
- Testing: 45 minutes
- Reviewing: 30 minutes
