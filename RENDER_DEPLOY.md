# Deploy the CodeSense API to Render

This repository is a two-service application. Deploy only the `backend`
directory to Render; deploy the `frontend` directory separately to Vercel.

## Render web service

Create a new **Web Service** from the GitHub repository and use:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/health` |
| Node version | 18 or later (20 LTS recommended) |

`npm start` runs `node server.js`, which connects to MongoDB before accepting
traffic and listens on Render's `PORT` value. Do not set `PORT` in Render.

## Render environment variables

Set these values in Render's Environment screen. Use generated secrets and
enter the real values only in the dashboard, never in Git.

```text
NODE_ENV=production
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/codesense-ai?retryWrites=true&w=majority
JWT_ACCESS_SECRET=<long-random-secret>
JWT_REFRESH_SECRET=<a-different-long-random-secret>
GEMINI_API_KEY=<Google-AI-Studio-key>
GEMINI_MODEL=models/gemini-2.5-flash
BACKEND_URL=https://<render-service>.onrender.com
FRONTEND_URL=https://<vercel-project>.vercel.app
```

Set the following only when that OAuth provider is enabled:

```text
GITHUB_CLIENT_ID=<client-id>
GITHUB_CLIENT_SECRET=<client-secret>
GITHUB_CALLBACK_URL=https://<render-service>.onrender.com/api/auth/github/callback
GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>
GOOGLE_CALLBACK_URL=https://<render-service>.onrender.com/api/auth/google/callback
```

After deployment, verify `https://<render-service>.onrender.com/health` and
`https://<render-service>.onrender.com/api/health`. Both must return HTTP 200
with `data.database: "connected"` before deploying the frontend.

## MongoDB Atlas

1. Create a database user with access only to the application database.
2. Add a network-access rule that permits Render to reach the cluster. Atlas
   shared clusters commonly require `0.0.0.0/0` for services without fixed
   egress; use the least broad rule your Atlas/Render plan supports.
3. Copy the Atlas driver connection string, URL-encode the username/password,
   and set it as Render's `MONGODB_URI`.
4. Never put the URI in a frontend `VITE_*` variable.

## Vercel frontend (after the API is healthy)

Import the same repository as a second Vercel project with **Root Directory**
set to `frontend`. Use the **Vite** framework preset and `npm run build` as
the build command. Do not override the output directory: this TanStack Start
application's Nitro Vercel preset generates Vercel's required
`.vercel/output` directory (it is not a plain `dist` deployment). Set:

```text
VITE_API_BASE_URL=https://<render-service>.onrender.com/api
```

After Vercel assigns the final URL, set `FRONTEND_URL` in Render to that exact
origin (no trailing path), redeploy Render, then redeploy Vercel. If you use
OAuth, also update each provider's redirect URI to the Render callback URL.
