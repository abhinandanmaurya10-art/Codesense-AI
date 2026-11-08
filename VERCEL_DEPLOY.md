# Deploy CodeSense AI on Vercel

Deploy this repository as two Vercel projects: one for `backend` and one for
`frontend`. This keeps the existing Express API and TanStack Start frontend
intact.

## 1. Prepare MongoDB Atlas

Create a MongoDB Atlas database, then add Vercel's network access. For an
initial deployment, Atlas's `0.0.0.0/0` access rule works; restrict it later if
you have a fixed egress solution. Copy the `mongodb+srv://...` connection
string for the `MONGODB_URI` variable.

## 2. Deploy the backend

In Vercel, import `https://github.com/abhinandanmaurya10-art/Codesense-AI` and
create a project with **Root Directory** set to `backend`.

Leave the build command empty. Vercel automatically deploys
`backend/api/[...slug].js`, which serves all API paths such as
`/api/auth/login` and `/api/reviews`.

Add these environment variables for **Production**, **Preview**, and
**Development** as appropriate:

```text
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_ACCESS_SECRET=<a long random value>
JWT_REFRESH_SECRET=<a different long random value>
GEMINI_API_KEY=<your Google AI Studio key>
GEMINI_MODEL=models/gemini-2.5-flash
FRONTEND_URL=<your frontend Vercel URL>
BACKEND_URL=https://codesense-ai-5prf.vercel.app
GITHUB_CLIENT_ID=<optional>
GITHUB_CLIENT_SECRET=<optional>
GITHUB_CALLBACK_URL=https://codesense-ai-5prf.vercel.app/api/auth/github/callback
GOOGLE_CLIENT_ID=<optional>
GOOGLE_CLIENT_SECRET=<optional>
GOOGLE_CALLBACK_URL=https://codesense-ai-5prf.vercel.app/api/auth/google/callback
```

The backend domain shown in your Vercel screenshot is
`https://codesense-ai-5prf.vercel.app`. Open
`https://codesense-ai-5prf.vercel.app/api/health` and wait for HTTP 200 with
`"database":"connected"` before testing the frontend. The endpoint currently
returns HTTP 503 with `"database":"unavailable"`, so check that `MONGODB_URI`
is correct in the backend Vercel project's Production environment and that
MongoDB Atlas allows the backend to connect. Redeploy the backend after
changing its environment variables.

## 3. Deploy the frontend

Import the same GitHub repository again as a second Vercel project, this time
with **Root Directory** set to `frontend`. Vercel detects the existing Vercel
Nitro build configuration.

Add this production variable before deploying:

```text
VITE_API_BASE_URL=https://codesense-ai-5prf.vercel.app/api
```

After Vercel assigns the frontend a domain, set `FRONTEND_URL` in the backend
project to that exact origin (for example, `https://your-frontend.vercel.app`,
without a trailing slash), then redeploy the backend. Set the frontend variable
for Production and Preview environments as needed, then deploy the frontend.

## 4. Configure OAuth (only if you use Google/GitHub login)

In your GitHub OAuth App and Google Cloud OAuth client, register exactly these
redirect URIs:

```text
https://codesense-ai-5prf.vercel.app/api/auth/github/callback
https://codesense-ai-5prf.vercel.app/api/auth/google/callback
```

For Google, also add `https://<frontend-domain>` to **Authorized JavaScript
origins**. Update the matching Vercel variables and redeploy the backend.
Do not use a `localhost` callback for a deployed login: the OAuth provider will
send the browser to the caller's own computer instead of the live app.

## 5. Verify

Check registration/login, code review creation, dashboard history, and each
OAuth provider you enabled. Do not copy any values from local `.env` files into
Git; enter secrets only in Vercel's Environment Variables screen.

The backend root URL returning service information does not verify database
availability; use `/api/health` for that check.
