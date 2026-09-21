# CodeSense AI - Backend API

Node.js Express backend for AI-powered code review platform.

## Features

- **JWT Authentication** - Secure token-based auth with access/refresh tokens
- **OAuth Integration** - GitHub and Google OAuth support
- **Code Review API** - Gemini AI-powered code analysis
- **Rate Limiting** - Built-in API rate limiting
- **MongoDB** - Document database for users and reviews
- **Security** - Helmet.js, CORS, input validation

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: MongoDB 7+
- **Authentication**: Passport.js, JWT
- **AI**: Google Gemini API
- **Validation**: Zod
- **Security**: Helmet, CORS, MongoDB Sanitization

## Installation

```bash
# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## Environment Variables

See `.env.example` for all available options.

**Required Variables:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_ACCESS_SECRET` - Secret key for access tokens
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens
- `GEMINI_API_KEY` - Google Gemini API key

**OAuth Variables:**
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`

| Name | Description |
| --- | --- |
| `PORT` | API port (default 5001) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret for short-lived access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `JWT_ACCESS_EXPIRES` | e.g. `15m` |
| `JWT_REFRESH_EXPIRES` | e.g. `7d` |
| `GEMINI_API_KEY` | Google Gemini API key |
| `GEMINI_MODEL` | `gemini-1.5-pro` or `gemini-1.5-flash` |
| `FRONTEND_URL` | Allowed CORS origin(s), comma separated |
| `BACKEND_URL` | Base backend URL used to build default provider callbacks |
| `BASE_URL` | Alias for `BACKEND_URL` if needed |
| `GITHUB_CLIENT_ID` | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App client secret |
| `GITHUB_CALLBACK_URL` | GitHub OAuth callback URL (e.g. `https://your-backend-domain.com/api/auth/github/callback`) |

Seeded accounts: `demo@codesense.ai` / `admin@codesense.ai`, password `Password123!`.

## Response envelope

Success: `{ "success": true, "data": {...}, "message": "..." }`
Failure: `{ "success": false, "message": "...", "errors": [...] }`

## Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | – | Health check |
| GET | `/api/languages` | – | Supported languages |
| POST | `/api/auth/register` | – | Create account, returns tokens |
| POST | `/api/auth/login` | – | Login, returns tokens |
| POST | `/api/auth/refresh` | cookie/body | Rotate refresh token |
| POST | `/api/auth/logout` | – | Invalidate refresh token |
| GET | `/api/auth/me` | Bearer | Current user |
| POST | `/api/reviews` | Bearer | Submit code, runs Gemini review |
| GET | `/api/reviews` | Bearer | Paginated history (`page`, `limit`, `language`, `status`) |
| GET | `/api/reviews/:id` | Bearer | Full review with code |
| DELETE | `/api/reviews/:id` | Bearer | Delete review |
| GET | `/api/dashboard/stats` | Bearer | Totals, average score, language breakdown, trend |

Supported languages: `javascript`, `typescript`, `python`, `go`, `rust`, `java`, `cpp`, `csharp`.

## GitHub OAuth setup

To enable GitHub login, create a GitHub OAuth app at https://github.com/settings/developers and configure:

- **Application name:** CodeSense AI
- **Homepage URL:** your frontend URL (for example `https://your-frontend-domain.com`)
- **Authorization callback URL:** your backend callback URL, for example `https://your-backend-domain.com/api/auth/github/callback`

Then add these values to `backend/.env` or Vercel environment variables:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=https://your-project.vercel.app/api/auth/github/callback
BACKEND_URL=https://your-project.vercel.app
FRONTEND_URL=https://your-project.vercel.app
```

If your frontend runs on a LAN address, also include it in `FRONTEND_URL`:

```env
FRONTEND_URL=http://localhost:3000,http://192.168.1.10:8082
```

Once configured, restart the backend and open the login page again.

## curl examples

```bash
BASE=http://localhost:5001/api

# Register
curl -X POST $BASE/auth/register -H 'Content-Type: application/json' \
  -d '{"name":"Dev","email":"dev@example.com","password":"Password123!"}'

# Login (grab the accessToken)
TOKEN=$(curl -s -X POST $BASE/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"demo@codesense.ai","password":"Password123!"}' | jq -r .data.accessToken)

# Current user
curl $BASE/auth/me -H "Authorization: Bearer $TOKEN"

# Submit a review
curl -X POST $BASE/reviews -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"language":"javascript","title":"User lookup","code":"function f(db,id){return db.exec(\"SELECT * FROM users WHERE id = \"+id)}"}'

# History + single review + delete
curl "$BASE/reviews?page=1&limit=10" -H "Authorization: Bearer $TOKEN"
curl $BASE/reviews/<id> -H "Authorization: Bearer $TOKEN"
curl -X DELETE $BASE/reviews/<id> -H "Authorization: Bearer $TOKEN"

# Dashboard stats
curl $BASE/dashboard/stats -H "Authorization: Bearer $TOKEN"
```

A ready-to-import Postman collection lives at `postman_collection.json`.

## Gemini integration

`src/services/geminiService.js`:

- System prompt forces a single JSON object (bugs, security, performance, readability, best practices).
- `responseMimeType: application/json` + a response schema so the model is constrained server-side.
- Code is sent line-numbered so reported `line` values are accurate.
- Non-JSON output falls back to brace extraction, then a normaliser clamps the score to 1–10 and drops malformed issues.
- 45 s timeout, 2 retries with exponential backoff + jitter on 429/5xx/timeouts.
- The API key is never logged or returned to clients.

## Security

- bcrypt cost factor 12, `passwordHash` excluded from queries by default.
- Access tokens (short-lived) + rotating refresh tokens stored per user, also set as an httpOnly cookie.
- Rate limits: 5/15 min on auth, 10/min on reviews, 120/min global.
- `helmet`, strict CORS to `FRONTEND_URL`, `express-mongo-sanitize` against NoSQL injection.
- Every input validated with Zod before it reaches the database or Gemini.

## Deployment

Stateless — deploy to Vercel serverless or any stateless Node host. Set the env vars, point `MONGODB_URI` at Atlas, and set `FRONTEND_URL` to your deployed frontend origin.

For Vercel, deploy the repo root and let backend API routes execute under `/api/*`.
