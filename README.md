# CodeSense AI

**AI-powered code reviews in your browser.** CodeSense AI analyzes code with Google Gemini and helps developers identify bugs, security concerns, performance issues, and opportunities to improve readability.

[![Live application](https://img.shields.io/badge/Live%20app-Open%20CodeSense%20AI-2563eb)](https://codesense-ai-4jnb.vercel.app)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

## Live application

**Frontend:** [codesense-ai-4jnb.vercel.app](https://codesense-ai-4jnb.vercel.app)

**Backend API:** [codesense-ai-5prf.vercel.app](https://codesense-ai-5prf.vercel.app)

**API health:** [Check backend health](https://codesense-ai-5prf.vercel.app/api/health)

Create an account with email and password, or sign in with GitHub or Google. OAuth login requires the callback URLs listed in the [deployment guide](VERCEL_DEPLOY.md) to be registered with each provider.

## Features

- **AI code reviews** with findings, severity, line references, and an overall score.
- **Flexible code input:** paste code, upload a file, or review marked code.
- **Review history and dashboard:** browse previous reviews, view activity metrics, and track quality scores.
- **Authentication:** email/password accounts plus GitHub and Google OAuth.
- **Multiple languages:** JavaScript, TypeScript, Python, Go, Rust, Java, C++, C#, Ruby, PHP, C, and SQL.
- **Secure API practices:** validated input, rate limits, protected routes, and hashed passwords.

## Technology

| Area | Stack |
| --- | --- |
| Frontend | React 19, TypeScript, TanStack Start/Router, Vite, Tailwind CSS |
| Backend | Node.js, Express, Passport, JWT, Zod |
| Database | MongoDB with Mongoose |
| Code analysis | Google Gemini API |
| Deployment | Vercel |

## Run locally

### Requirements

- Node.js 18 or newer and npm
- MongoDB locally or a MongoDB Atlas cluster
- A Google Gemini API key to run AI code reviews
- OAuth app credentials if you want to test GitHub or Google login

### 1. Clone the repository

```bash
git clone https://github.com/abhinandanmaurya10-art/Codesense-AI.git
cd Codesense-AI
```

### 2. Configure and start the backend

```bash
cd backend
npm install
```

Copy `backend/.env.example` to `backend/.env`, then set at least:

```env
MONGODB_URI=mongodb://localhost:27017/codesense-ai
JWT_ACCESS_SECRET=replace-with-a-long-random-secret
JWT_REFRESH_SECRET=use-a-different-long-random-secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:5001
GEMINI_API_KEY=your-gemini-api-key
```

To enable local OAuth, also set the provider client IDs and secrets in `backend/.env`. The example file includes the localhost callback URLs; register those exact URLs in your OAuth provider settings for local development.

Run the API:

```bash
npm run dev
```

The backend runs at `http://localhost:5001`.

### 3. Configure and start the frontend

In another terminal:

```bash
cd frontend
npm install
```

Copy `frontend/.env.example` to `frontend/.env` and set:

```env
VITE_API_BASE_URL=http://localhost:5001/api
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`).

## Deployment

The production app is deployed as two Vercel projects: `backend` and `frontend`. Follow [VERCEL_DEPLOY.md](VERCEL_DEPLOY.md) for the project setup, environment variables, database connection, OAuth configuration, and verification steps.

Production OAuth callback URLs:

```text
GitHub: https://codesense-ai-5prf.vercel.app/api/auth/github/callback
Google: https://codesense-ai-5prf.vercel.app/api/auth/google/callback
```

Never commit `.env` files, API keys, OAuth client secrets, database credentials, or JWT secrets. Configure production secrets in the hosting provider's environment-variable settings.

## API overview

The backend API is served under `/api`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Backend and database health |
| `POST` | `/api/auth/register` | Create an account |
| `POST` | `/api/auth/login` | Sign in with email and password |
| `POST` | `/api/auth/refresh` | Refresh the access token |
| `POST` | `/api/auth/logout` | Sign out |
| `GET` | `/api/auth/github` | Start GitHub sign-in |
| `GET` | `/api/auth/google` | Start Google sign-in |
| `GET` | `/api/auth/me` | Get the authenticated user |
| `POST` | `/api/reviews` | Submit code for review |
| `GET` | `/api/reviews` | List the user's reviews |
| `GET` | `/api/reviews/:id` | Get a review |
| `DELETE` | `/api/reviews/:id` | Delete a review |
| `GET` | `/api/dashboard/stats` | Get dashboard metrics and score history |

See [backend/README.md](backend/README.md) for additional API and configuration details.

## Project structure

```text
backend/
  api/                 Vercel serverless API entry points
  src/
    config/            Environment and Passport configuration
    controllers/       HTTP request handlers
    middleware/        Authentication, validation, and rate limits
    models/            MongoDB models
    routes/            API route definitions
    services/          Authentication and review logic
frontend/
  src/
    components/        Shared UI and dashboard components
    lib/               API and authentication helpers
    routes/            Application pages
VERCEL_DEPLOY.md       Production deployment guide
```

## Useful commands

```bash
# Backend, from backend/
npm run dev
npm start

# Frontend, from frontend/
npm run dev
npm run lint
npm run build
```

## Documentation

- [Vercel deployment guide](VERCEL_DEPLOY.md)
- [General deployment notes](DEPLOYMENT.md)
- [Quick deployment guide](DEPLOY_QUICK_START.md)
- [OAuth setup](OAUTH_SETUP.md)
- [Backend API documentation](backend/README.md)
- [Frontend documentation](frontend/README.md)

## Contributing

Issues and pull requests are welcome. For substantial changes, please open an issue first to discuss the proposed approach.

## Try CodeSense AI

Test and use the live application: **[Open CodeSense AI](https://codesense-ai-4jnb.vercel.app)**.

