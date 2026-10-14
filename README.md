# Xparience Admin

Internal admin console for Xparience: users, verification, matching, chat moderation, community and virtual dates. It runs on the same backend as the mobile app.

## Setup

Requirements: Node ≥ 20.9 and npm.

```bash
npm install
cp .env.example .env.local   # API_URL defaults to staging
npm run dev                  # http://localhost:3000
```

To sign in you need an account with the **Admin** or **Moderator** role. An existing admin can create one with `POST /admin/users/create-admin`, or can promote a user with `PATCH /admin/users/{id}/role`.

## Scripts

| Script              | What it does                               |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Dev server (Turbopack)                     |
| `npm run build`     | Production build                           |
| `npm run start`     | Serve the production build                 |
| `npm run lint`      | ESLint (Next core-web-vitals + TypeScript) |
| `npm run typecheck` | Generate route types, then `tsc --noEmit`  |
| `npm run format`    | Prettier with Tailwind class sorting       |

## Stack

Next.js 16 (App Router, React Compiler) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui · TanStack Query · TanStack Table · Zustand · React Hook Form + Zod · nuqs · sonner · recharts · date-fns · lucide-react

## Layout

```
app/
  (auth)/login/             sign-in page
  (dashboard)/              signed-in area with the sidebar shell
  api/auth/{login,logout}/  set and clear the httpOnly session cookies
  api/backend/[...path]/    same-origin proxy to the backend; adds the bearer token
actions/                    API calls, one file per domain
hooks/api/                  React Query hooks over actions/
libs/api/                   fetch client + ENDPOINTS map
libs/auth/                  cookie session, token refresh
libs/react-query/           QueryClient + cache keys
providers/                  theme, query, nuqs, tooltip, toaster
store/                      Zustand stores
components/ui/              shadcn components (CLI-managed)
proxy.ts                    redirects to /login when there's no session cookie
```

The browser never calls the backend directly. Requests go to `/api/backend/*`, and the server adds the token from an httpOnly cookie. This keeps tokens out of client JavaScript, and it means the backend doesn't need CORS enabled for the admin.

Add a shadcn component with:

```bash
npx shadcn@latest add <component>
```
