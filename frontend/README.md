# CodeSense AI Frontend

React and TypeScript application built with TanStack Start/Router, Vite, and
Tailwind CSS. The production Vercel build uses Nitro's Vercel preset; the
Docker build uses Nitro's Node server preset.

## Requirements and setup

- Node.js 22 or newer
- Bun 1.3.14 or newer
- The backend API, or the live backend URL

```sh
bun install --frozen-lockfile
cp .env.example .env
bun run dev
```

Set `VITE_API_BASE_URL` in `.env`, for example
`http://localhost:5001/api` for local development. Build and check the app with:

```sh
bun run lint
bun run build
bun run preview
```

The Vercel build output is `.vercel/output`. The file-based routes and generated
route tree are under `src/routes/` and `src/routeTree.gen.ts`; do not edit the
generated route tree by hand.

## Application structure

```text
src/
  components/       Shared UI, dashboard, and review components
  lib/              API, auth, error handling, and review helpers
  routes/           TanStack Start file-based pages and OAuth callbacks
  router.tsx        Router creation
  server.ts         Server entry and error response handling
  start.ts          TanStack Start middleware
  styles.css        Global styles and Tailwind imports
```

The main pages are `/`, `/login`, `/dashboard`, `/review`, `/history`,
`/reviews/:id`, and `/settings`. OAuth callbacks finish at
`/auth/github/success` and `/auth/google/success`.

## API and authentication

All frontend API calls use `src/lib/api.ts`. Configure
`VITE_API_BASE_URL` to the backend API base URL ending in `/api`. For the Docker
Compose setup, the browser uses the same-origin `/api` path through Nginx.

OAuth authorization is handled by the backend; its callback redirects to the
matching frontend success route. See the root [OAuth guide](../OAUTH_SETUP.md)
for provider configuration and [deployment guide](../VERCEL_DEPLOY.md) for
Vercel setup.
