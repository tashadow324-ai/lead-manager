# Lead Manager

A small full-stack lead tracking application built for the Meru Technosoft Pvt. Ltd. Full Stack Developer screening assignment.

## Features

- Create, view, edit, and delete leads
- Lead fields: name, email, phone, company, source, and status
- Search by lead name and filter by status
- Dashboard totals for New, Contacted, Qualified, and Lost leads
- Client-side and server-side validation
- SQLite persistence and REST API
- Responsive interface, loading states, and API error feedback
- Automated API tests

## Tech stack

- Frontend: React, Vite, plain CSS
- Backend: Node.js, Express
- Database: SQLite using better-sqlite3
- Tests: Node.js built-in test runner and Supertest

SQLite was selected because this is a small take-home application: it is easy to run locally and stores data persistently without requiring a separate database server.

## Requirements

- Node.js 20 or newer
- npm

## Run locally

1. Clone this repository.
2. From the project root, install dependencies:

   ```bash
   npm install
   npm install --prefix server
   npm install --prefix client
   ```

3. Optional: copy `.env.example` to `server/.env` and adjust the values. The server also works with defaults.
4. Start both applications from the root:

   ```bash
   npm run dev
   ```

5. Open <http://localhost:5173>.

The API runs at <http://localhost:5000/api>. The SQLite database is created automatically in `server/data/leads.db`.

## API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/leads?search=&status=` | List/search/filter leads |
| GET | `/api/leads/:id` | Get one lead |
| POST | `/api/leads` | Create a lead |
| PUT | `/api/leads/:id` | Update a lead |
| DELETE | `/api/leads/:id` | Delete a lead |

Valid statuses: `New`, `Contacted`, `Qualified`, `Lost`.

## Run tests

```bash
npm test
```

## Assumptions

- A lead must have a name, valid email, and status.
- Phone, company, and source are captured as requested; phone and company are optional because the assignment does not explicitly mark them required.
- Lead source is selected from Website, Referral, Social Media, LinkedIn, Cold Call, and Other.
- This version does not include authentication because it is an optional bonus and the core workflow is the priority.

## What I would improve with more time

- Add authentication and per-user lead ownership.
- Add pagination, sorting, and more advanced filtering.
- Add deployment, CI checks, and broader UI/API test coverage.

## Short submission note

I am particularly proud of keeping the application focused while implementing the complete lead lifecycle, including validation on both sides of the API. The main design consideration was keeping the REST API, persistent storage, and user interface simple and easy to maintain.

## Security and configuration

No secrets are required for local development. Keep real environment files and database files out of version control; `.env.example` documents the available settings.
