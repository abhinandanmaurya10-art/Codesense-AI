# CodeSense AI Backend

Express API for authentication, code reviews, and dashboard data. The API uses
MongoDB through Mongoose and Google Gemini for code analysis.

## Requirements and setup

- Node.js 18 or newer
- MongoDB (local or Atlas)
- A Gemini API key to submit code reviews

```sh
npm install
cp .env.example .env
npm run dev
```

The API listens on port `5001` by default. `npm start` starts the production
server. Configure MongoDB and JWT secrets in `backend/.env`; provider
credentials are required only for OAuth.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Required MongoDB connection string |
| `JWT_ACCESS_SECRET` | Required access-token signing secret |
| `JWT_REFRESH_SECRET` | Required, separate refresh-token signing secret |
| `JWT_ACCESS_EXPIRES` | Access-token lifetime; defaults to `15m` |
| `JWT_REFRESH_EXPIRES` | Refresh-token lifetime; defaults to `7d` |
| `PORT` | HTTP port; defaults to `5001` |
| `GEMINI_API_KEY` | Google AI Studio key used for code reviews |
| `GEMINI_MODEL` | Gemini model; defaults to `models/gemini-2.5-flash` |
| `FRONTEND_URL` | Allowed frontend origin(s), comma-separated |
| `BACKEND_URL` | Base URL used to construct default OAuth callbacks |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Optional GitHub OAuth credentials |
| `GITHUB_CALLBACK_URL` | Optional explicit GitHub callback URL |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Optional Google OAuth credentials |
| `GOOGLE_CALLBACK_URL` | Optional explicit Google callback URL |

See [.env.example](./.env.example) for a local template. Keep real credentials
out of source control.

## API

All API routes are under `/api`. Protected routes require a bearer access
token; refresh tokens are also set in an HTTP-only cookie.

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Public | API and database health |
| `GET` | `/api/languages` | Public | Supported review languages |
| `POST` | `/api/auth/register` | Public | Create an account |
| `POST` | `/api/auth/login` | Public | Sign in with email and password |
| `POST` | `/api/auth/refresh` | Refresh token | Rotate the token pair |
| `POST` | `/api/auth/logout` | Public | Invalidate the refresh token |
| `GET` | `/api/auth/me` | Access token | Get the current user |
| `GET` | `/api/auth/github` | Public | Start GitHub OAuth |
| `GET` | `/api/auth/google` | Public | Start Google OAuth |
| `POST` | `/api/reviews` | Access token | Submit code for review |
| `GET` | `/api/reviews` | Access token | List paginated reviews |
| `GET` | `/api/reviews/:id` | Access token | Get a review |
| `DELETE` | `/api/reviews/:id` | Access token | Delete a review |
| `GET` | `/api/dashboard/stats` | Access token | Get dashboard statistics |

Review history accepts `page`, `limit`, `language`, `status`, `source`, and
`isMarked` query parameters. Supported languages are JavaScript, TypeScript,
Python, Go, Rust, Java, C++, C#, Ruby, PHP, C, and SQL.

Successful responses use `{ "success": true, "data": ... }`; errors use
`{ "success": false, "message": ... }` and may include validation details.

## Security and operations

- Passwords are hashed; access tokens are short-lived and refresh tokens are
  stored per user and rotated.
- Request bodies and query parameters are validated with Zod.
- Authentication, review, and general API rate limits are enabled.
- CORS is restricted to `FRONTEND_URL` in production.
- Helmet and MongoDB input sanitization middleware are enabled.

The `npm run seed` script deletes all existing users and reviews before seeding
demo records. Run it only against a disposable database, never production.
The backend has no dedicated automated test or build script; use `node --check`
on source files for a basic syntax check.

For the split Vercel deployment, see [../VERCEL_DEPLOY.md](../VERCEL_DEPLOY.md).
