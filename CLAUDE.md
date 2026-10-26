@AGENTS.md

# Xparience Admin

Internal admin console for Xparience. Related repos in the same folder: `Xparience-Mobile` (the Expo app) and `Xparience-Web` (the marketing site). The backend is the same NestJS + Supabase API the mobile app uses.

## Commands

npm (not pnpm; the project was moved off it), Node ≥ 20.9.

```bash
npm run dev         # http://localhost:3000 (Turbopack)
npm run lint
npm run typecheck   # next typegen + tsc. Run it after adding routes so PageProps/RouteContext types exist
npm run format      # Prettier + Tailwind class sorting (components/ui is skipped)
npm run api:types   # types/api-dtos.ts from the staging spec (API_URL/docs-json, or `-- spec.json`)
```

**Never run `npm run build` (or any build) unless Fahd asks for it.** Tell him when a build is due and give him the command. Dependency installs are fine, but say before running one.

## Stack

- **Next.js 16.3, App Router, React 19.2, React Compiler.** Don't add `useMemo`, `useCallback` or `memo` by hand. In Next 16 the old `middleware.ts` is called `proxy.ts`. Read `node_modules/next/dist/docs/` before writing framework code.
- **Tailwind v4, configured in CSS** (`app/globals.css`). There is no tailwind.config.
- **shadcn/ui, `radix-nova` style.** `components/ui/` belongs to the CLI: add components with `npx shadcn@latest add <name>` and don't hand-format them. They import `cn` from shadcn's `cn` package. Exception: `hooks/use-mobile.ts` was rewritten with `useSyncExternalStore` to pass React 19's lint, so don't let `shadcn add` overwrite it.
- **TanStack Query v5** for server state. **TanStack Table v8**, pinned on purpose: v9 is a rewrite and shadcn's data-table recipe targets v8.
- **Zustand** (client state), **React Hook Form + Zod v4** (forms, using shadcn's `Field` components), **nuqs** (filters and pagination kept in the URL), **sonner** (toasts), **recharts** via shadcn `chart`, **date-fns**.
- **Icons.** Use the Figma's exported SVGs first (Fahd drops them in `~/Downloads`). They live in `components/icons/app-icons.tsx` (sidebar and dashboard glyphs, named after the glyph) and `components/auth/auth-icons.tsx`. For anything missing, Fahd wants **Phosphor** (`@phosphor-icons/react`, the `*Icon` names) or iOS-style icons, not lucide. Phosphor's default entry uses React context, so server components import from `@phosphor-icons/react/ssr`. lucide-react stays only because shadcn's `components/ui` uses it.
- With the React Compiler, read RHF values with `useWatch`, not `form.watch()`.

## How a request flows

```
component → hooks/api/use-<domain>.ts (React Query)
          → actions/<domain>-actions.ts
          → libs/api/client.ts          fetch("/api/backend/<path>")
          → app/api/backend/[...path]   adds Bearer from the httpOnly cookie, refreshes once on 401
          → API_URL/<path>
```

- The browser never calls the backend directly. Staging sends **no CORS headers**, and the tokens stay in httpOnly cookies (`libs/auth/session.ts`) that client JS can't read. That's why actions take a path but no access token (unlike Forj's actions).
- `API_URL` is server-only (`libs/env.ts`). Don't give it a `NEXT_PUBLIC_` prefix.
- What the proxy returns: **401** = the session is gone (refresh token rejected, cookies cleared). The client then signs out and does a full reload to `/login?expired=1&next=…` (`libs/api/client.ts`). **503** = the refresh failed for a temporary reason; the session is kept. **403** = a cross-site POST/PATCH/DELETE, or the backend refused the call.
- `proxy.ts` only checks whether a session cookie exists. It doesn't check that the session is valid; the backend proxy does that.
- Request bodies and query params are generated into `types/api-dtos.ts` by `scripts/generate-api-types.mjs` (`npm run api:types`). Where the spec types a field wrong, fix it in the script's `OVERRIDES`, not in the output. The spec has no responses, so actions return `unknown` read through `libs/api/normalize.ts` (`unwrap` drops a `{ success, message, data }` envelope; `toPage` finds the list and its paging numbers) until each response is typed from a live sample.
- Every admin endpoint has an action and a hook. `useInvalidatingMutation(fn, keys)` (`hooks/api/mutation.ts`) invalidates its keys on success. Most screens still render sample constants (see Placeholders) until they're wired.

## Auth

- `/api/auth/login` validates the input with Zod and calls the backend's `/auth/login` (it returns the raw Supabase session, snake_case). It then proves admin access by calling `GET /admin/dashboard/overview` with the new token, because the backend has no `/me` route that returns a role. A 401 or 403 there means "not an admin", so no cookies are set. ⚠️ PROVISIONAL: this assumes Moderators can read the overview.
- `/api/auth/logout` revokes the session on the backend if it can, and always clears the cookies.
- `store/use-auth-store.ts` holds only the display user (id, email, name), persisted with `skipHydration`. `AppProviders` rehydrates it after mount.
- Supabase refresh tokens rotate. `/auth/refresh` returns camelCase with `expiresAt` in Unix seconds.
- Auth screens (all in `proxy.ts` `PUBLIC_ROUTES`): `/login` and `/setup` use `AuthSplitLayout` (brand panel + form); `/invite`, `/forgot-password`, `/forgot-password/check-email`, `/reset-password` and `/reset-password/success` live in the `(auth)/(card)` group, which supplies the logo and footer around each page's `AuthCard`. `/login` and password recovery are wired to the backend. `/setup` and `/invite` 404 while `adminInvites` is off: there's no invite or setup route (`POST /admin/users/create-admin` creates an admin with a password at once).
- Recovery is code-based: `/forgot-password` asks the backend to email a code, `/forgot-password/check-email` checks it, and `/reset-password` sets the new password with it. Each step posts to a public route handler (`app/api/auth/password-reset/{request,verify-otp,reset}`) through `forwardPublicAuth` (`libs/auth/public-auth.ts`: cross-site check, Zod, then the backend's status passed through). The email and code live in memory only (`store/use-password-reset-store.ts`), so after a reload the screens ask for a new code.
- Only `/login` sends a signed-in admin to `/dashboard` (`GUEST_ONLY_ROUTES`). Setup, invitation and recovery screens must open even in a browser that holds a stale session.
- Auth `<form>`s set `method="post"`. If someone submits before hydration, the browser posts the fields instead of putting the password in the URL with a GET. After hydration RHF's `handleSubmit` prevents the native submit.
- `safeNext` (login page) checks what `new URL` makes of `?next=`, not the raw string: `\`, tabs and dot segments can turn a "/…" path protocol-relative.

## Conventions

These copy Forj (`../HNG/Forj`), the structure reference for the Xparience repos:

- kebab-case filenames. Route groups `(auth)` and `(dashboard)`, each with its own `layout.tsx`.
- `actions/<domain>-actions.ts` → `hooks/api/use-<domain>.ts`, exported through the `hooks/api/index.ts` barrel → `libs/api/client.ts`.
- `libs/`, not `lib/` (shadcn's `components.json` aliases point there). `store/use-*-store.ts`, `providers/`, `constants/`, `types/`.
- Cache keys: add a domain to `queryKeys` in `libs/react-query/query-client.ts` and invalidate with `queryKeys.<domain>.all`.
- Routes: every admin route is already listed in `libs/api/endpoints.ts`. Use those constants and don't write path strings inline.
- Mutations never retry. A mutation error shows a toast automatically; pass `meta: { silent: true }` when the screen shows the error itself.

## Backend contract

- Spec: https://staging.xparience.com/docs-json (Swagger UI at `/docs`). The admin's routes are in it beside the member routes. It documents request DTOs and query params but **no response bodies**. Type each response from a live sample and mark guesses `⚠️ PROVISIONAL`.
- Every DTO uses `forbidNonWhitelisted`. An extra property in a request body is a 400 that names the property; it is not silently ignored.
- Enum spelling is mixed: roles are `"User" | "Admin" | "Moderator"`, while statuses are UPPER_SNAKE. Shared enums are in `types/api.ts`. Those three are the only roles: the Figma's Super Admin and Support (in the sample admins) don't exist on the backend.
- Errors are NestJS's default `{ message: string | string[], error, statusCode }`. `ApiError` joins array messages.
- Profile images come back as absolute Supabase signed URLs. Add that host to `images.remotePatterns` in `next.config.ts` before using `next/image` for them.
- `../Xparience-Mobile/BACKEND_UI_GAPS.md` has long notes on known backend bugs (community, events, verification). Read it before probing an endpoint by hand.

## Feature flags

The backend team wants every feature it can't serve yet hidden until it can. The 2026-10-22 "Admin Endpoint Audit" (a Claude Doc) lists each one, why, and the backend request that unblocks it.

- `constants/features.ts` holds one flag per missing capability, all `false`. When an endpoint ships: flip its flag, wire the feature, and mark the request Shipped in the audit.
- A whole section: its route's `layout.tsx` calls `requireFeature("flag")` (`libs/feature-gate.ts`), which 404s the route while the flag is off. Nav items, tabs, menu items, KPIs, columns and filter options carry `feature` and go through `enabled()`. Anything else is `FEATURES.flag && …`.
- Hidden routes: Well-being, Subscriptions, Payments, AI Center, Notifications, a group's Members tab, `/setup`, `/invite`, and Settings › Notifications, Language & Region, Permissions, Audit Logs, Community and Well-being. Exports, date ranges, announcements, presence and insight cards are hidden everywhere.
- What's left closes up: grids pick their columns from how many cards remain, table columns keep their proportions (`share`), and page descriptions name only what's shown. A URL param for a hidden filter (`?plan=`, `?priority=`, a hidden search's `?q=`) is ignored. Sample rows that only make sense with a hidden capability (reported, live, AI-raised) stay off the lists.
- The sections below describe the full design, hidden parts included.

## Theme

The admin Figma is the reference, not the mobile app. The light tokens were sampled pixel by pixel from the dashboard frames, a Material 3 style palette seeded from brand teal: `--foreground` `#181C1E`, `--muted-foreground` `#3F484D`, `--subtle-foreground` `#64738B`, `--border`/`--input` `#BFC8CE`, `--muted` `#F2F4F7` (container fills), `--surface` `#F7F9FC` (page canvas), `--accent` `#E4EDF0`, `--primary` `#005069`. The fixed status and badge colors (`success-strong`, `success-soft`, `premium`, `attention*`, `online`, `elite`, `outline`) and `--chart-1…5` come from the same frames. The auth screens were matched to their own frames, which are lighter. The `.auth-theme` class on the `(auth)` layout's `<main>` restores those values for `--border`, `--input`, `--muted-foreground` and `--accent` in light mode. Brand teal `#006989` is `brand`, the mobile app's `Colors.primary100–950` scale is `brand-100…950`, and `brand-sky` `#87CEEB` / `brand-mint` `#98FF98` are the logo tones. The sidebar is dark (`--sidebar` `#001F29`) in both themes. Its section labels are `sidebar-label` `#6E8B97`, lifted from the Figma's `#516F7B` so 11px text reaches 4.5:1. **Inter** is the UI font (the mobile app's Sora isn't used here). The wordmark is an SVG (`components/layout/logo.tsx`, paths from Xparience-Web's `x-logo.svg`), so no logo font is loaded. Dark mode is class-based via next-themes and defaults to light.

## Dashboard shell

- `constants/navigation.ts` `NAV_SECTIONS` drives the sidebar, in the Figma's order and grouping. Every item has a route; the sections without a design yet render `PagePlaceholder`. Routes follow the labels (`/matches`, `/conversations`, `/reports` for Reports & Safety), not the backend domain names.
- The sidebar is 277px (`--sidebar-width` on `SidebarProvider` in `app/(dashboard)/layout.tsx`) and always starts open on desktop; the Figma has no collapse control. Below `md` it's shadcn's sheet, opened from the header.
- The header holds search (UI only), notifications (UI only), the theme toggle, today's date and the account menu.
- The account menu (`components/layout/user-menu.tsx`) is a popover: the admin's card, then My Profile, Account Settings, Security, Notification Preferences and Sign Out. Its role comes from `SAMPLE_ADMIN_PROFILE` (⚠️ PROVISIONAL: the backend returns no role for the signed-in admin).
- Signing out (`components/account/`):
  - `SignOutDialog` (an `alertdialog`) really signs out, through `useLogout`. Opened from the menu, it sends focus back to the avatar, and the menu's `onCloseAutoFocus` stops the menu from taking focus back first. Don't confirm it during QA: it clears the session cookie.
  - `SignOutSessionsDialog` lists the sessions when it's given `sessions` (Profile), and is a plain confirmation without them (Settings › Security). Its confirm button, Sign Out Other Sessions, and each row's Sign out toast.
- Dashboard modals use the shell in `components/dashboard/action-dialog.tsx`, not shadcn's `DialogContent`. It provides the Figma's darker scrim (`ACTION_DIALOG_SCRIM`, also for sheet overlays), a fixed header and footer, and a body that scrolls. The dialogs' teal is `action` `#006481` (a shade lighter than `--primary`), with `action-icon` `#297D9D` for the icon tile, `muted-strong` `#E6E8EB` for panel headers and `info-soft` `#CAE7F7`.
- Three dialogs open from the overview: Review Verification and Platform Announcement from the quick-actions FAB, and Export Detailed Report from the header's Export button. All three are UI only and toast "isn't available yet" on submit. Their form content mounts only while open, so every opening starts fresh. A FAB item that opens a dialog must keep the menu from handing focus back to the FAB (`onCloseAutoFocus`).
- `/users`:
  - The KPI row reuses the dashboard's `StatCard`, which has `destructive` and `caution` tones plus an optional `badge` and `note`.
  - The search, location, status, plan and page filters are nuqs URL state (`components/users/users-directory.tsx`). Anything that reads nuqs must sit inside `<Suspense>`, or the prerender fails. The page passes `UsersDirectoryFallback` as the fallback.
  - The eye button opens `UserPreviewSheet`. A sheet or dialog opened from a row (not from a trigger) has to send focus back to that row's button itself, via `onCloseAutoFocus`.
- Page headers are `PageHeader` (`components/layout/page-header.tsx`: title, description, and the actions as children) with `DateRangeSelect` and `ExportReportButton` from `page-header-actions.tsx`. With no `onClick`, `ExportReportButton` toasts that export isn't available. The dashboard passes `DashboardExportButton`, which owns the Export Detailed Report dialog.
- `/verification`:
  - The KPI row is the shared `CompactKpiCard` (`components/dashboard/compact-kpi-card.tsx`), not `StatCard`. It has a 36px tile, a `tone` (pages have added tones as they needed them), and a `favorable` flag that colors a change separately from its direction: `success-strong` when favorable, `destructive` when not. `verification-kpi-row.tsx` maps each figure to its glyph and tone. Both KPI cards draw `components/dashboard/sparkline.tsx`.
  - The queue keeps status, page and the open case in the URL (`?status`, `?page`, `?case`), inside `<Suspense>`. Row actions open `VerificationReviewSheet` and get focus back on close. Its Reject and Request New Documents dialogs take their footer buttons as `trigger`.
  - Colors from the verification Figma: `review` `#48626F`, `caution` `#84500E` / `caution-soft` `#F6F0E9`, `destructive-soft` `#FFF8F7`, `action-soft` `#E9F2F5`. Its lighter card borders and row rules are `border-border/30`, which comes out as the Figma's `#EBEFF0`.
  - Tokens in `@theme inline` don't exist as CSS variables at runtime: Tailwind inlines them into utilities. So Recharts fills spell those colors out (`#ea580b`, `#48626f`), and only `:root` tokens such as `--success`, `--destructive` and `--chart-*` work as `var()`.
- `/matches`:
  - The KPI row is `CompactKpiCard` (`components/dashboard/compact-kpi-card.tsx`, with its data typed as `CompactKpi` in `types/kpi.ts`). It uses the same six tones as Verification.
  - `MatchInsightSheet` is built on `ActionSheetContent` (`components/dashboard/action-sheet.tsx`), like the other right-hand panels.
    - Its Flag, Remove and Exclude dialogs open on top of it via `trigger`. While one is open it sets `nestedOpen`, so the page isn't dimmed twice.
    - A row's ⋮ menu opens the same dialogs directly. `MatchReview` owns that state and sends focus back to the row when they close.
  - Recent Matches keeps `?status` and `?page` in the URL, inside `<Suspense>`. Table footers use `PagePagination` (`components/dashboard/page-pagination.tsx`).
  - Match Activity draws Accepted as a line over the bars. The Figma lists Accepted in the legend but only draws the bars.
- `/ai-center`:
  - The eight KPIs are `CompactKpiCard` without sparklines. `CompactKpi.badge` (`warm` / `cool`) is the corner pill ("High", "Uptime") that some cards show in place of the change.
  - AI Performance Trends draws accuracy as bars on a panel (their axis starts at 85%, since accuracy only moves a few points) and requests as a line. AI Feature Usage colors its ring by the legend's shares, where the Figma draws only the track.
  - An `sr-only` data table needs a wrapping `<div className="sr-only">`. The 1px width doesn't apply to a table, so a bare one widens the page on phones.
- `/virtual-dates`:
  - The KPIs are `CompactKpiCard`, including the `amber` and `indigo` tones and the `emerald` / `indigo` badges.
  - The schedule keeps `?status` and `?page` in the URL inside `<Suspense>`, and uses `PagePagination variant="compact"`.
  - `PairAvatars` / `ParticipantAvatar` live in `components/dashboard/pair-avatars.tsx`, shared with Matches.
  - The Session Status ring is colored by its legend's shares; the Figma draws it in a single slate.
- `/conversations`:
  - The KPIs are `CompactKpiCard`, two of them with a `status` line ("Stable" / "Critical") in place of a change. `labelClassName="max-w-24"` breaks every label onto two lines, as this Figma does.
  - Conversation Management keeps `?state`, `?safety`, `?page` and the open sheet (`?conversation=`) in the URL, inside `<Suspense>`, and uses `PagePagination variant="compact"`.
  - `ConversationSheet` (400px, on `ActionSheetContent`) opens Evidence, Flag, Warn and Suspend via `trigger`. The table's Investigate, flag and ⋮ actions open the same dialogs directly.
  - Message content renders only when `conversation.evidence` exists (reported, flagged or under moderation), as the privacy banner says.
  - The 7D activity series stops at "now" (Sat 21:00), and the axis spans the ticks, so Sun stays on it. Conversation Health's ring follows the legend's counts; the Figma's ring is illustrative.
- `/well-being`:
  - Overview, Resources, Assessment and Dating Coach are routes (`/well-being`, `/resources`, `/assessment`, `/dating-coach`), linked by `WellbeingTabs`, not a Tabs component.
  - Resources keeps `?category`, `?status` and `?page` in the URL, inside `<Suspense>`, and uses `PagePagination variant="boxed"`.
  - `/well-being/resources/new`: the header's Save Draft and Publish are `type="submit"` buttons with `form={RESOURCE_FORM_ID}` and `name="intent"`; the form reads the intent from `nativeEvent.submitter`. Publishing requires a description, content and category, while a draft needs only a title. The cover image is checked against 800×400 and previewed from an object URL.
  - `/well-being/assessment/questions` (`QuestionBuilder`) reorders by drag and drop, or from the keyboard with ↑/↓ on a question's handle, which announces the new position. `QuestionDialog` adds a question, with `useFieldArray` skip rules, at the end of the sequence as a Draft. The assessment pages' "Category" filter filters question types. The help card's View Guide opens `AssessmentGuideSheet`.
  - `/well-being/dating-coach`: Quick Actions open `AddCoachDialog`, `AvailabilitySheet` and `ExportSessionsDialog` via `trigger`, so focus returns to the row on close. `AvailabilitySheet` opens for the coach in `SAMPLE_COACH_AVAILABILITY`; its day switch is `CheckSwitch size="sm"`, not shadcn's `Switch`. Its hours are native `type="time"` inputs, and Save checks each day for backwards or overlapping ranges. Copy to all copies the first available day's hours to the other available days. Its table cards and Service Configuration use `border-border/30`, as in the Figma; only the KPI cards keep the full border.
- `/community`:
  - Groups, Events and Moderation are routes (`/community`, `/community/events`, `/community/moderation`) under the `(sections)` route group. Its layout renders `CommunitySectionHeader`, which picks each tab's title, description and actions by pathname, then `SectionTabs`. Events and Moderation draw the tabs over a hairline and Groups' frame doesn't; every tab row uses the hairline.
  - Events: `EventTable` opens `EventSheet` (480px, on `ActionSheetContent`). The sheet's Edit Event opens `EventFormDialog` via `trigger` with `nestedOpen`. The Groups tab's Create Event and the Events tab's Create Event open the same dialog. Its date and time are native inputs with the picker indicator hidden, opened with `showPicker()`.
  - Each group's dashboard is a set of routes: `/community/groups/[groupId]` (Overview), plus `/members`, `/discussions` and `/reports`. They're prerendered for the sample groups (`sample-group.ts`), and any other id 404s. Overview and Members use `GroupHeader` (Edit Group reopens `GroupFormDialog` filled in); Discussions and Reports use `GroupEyebrowHeader`.
  - The KPI rows are `CommunityKpiRow`: `CompactKpiCard` with `comparison="inline"` ("↗ 12% vs last month" on one line) and `tileClassName="size-10"`. Its `tiles` prop orders the four Figma tiles (target, chat, calendar, thumbs). A group's pages lead with chat. The cards also use `badge.tone: "neutral"` (the grey "Past 24h") and `valueTone: "critical"` (a red value).
  - URL state, inside `<Suspense>`:
    - The groups table: `?q`, `?status`, `?category`, `?size`, `?page`. It's `table-fixed` so descriptions truncate. All Filters holds all three filters, and is the only way to reach them below `md`.
    - Members: `?q`, `?status`, `?joined`, `?activity`, `?page`.
    - Discussions: `?q`, `?view`, `?page`.
    - Reports: `?q`, `?page`.
    - Events: `?q`, `?status`, `?date`, `?attendance`, `?group`, `?type`, `?page` and the open sheet (`?event=`).
    - Moderation: `?priority`, `?page`.
  - Pagination: Groups uses `PagePagination variant="arrows"`, Members `soft`, Discussions `text`, Events `mini`, Reports and Moderation `solid`.
  - Create Community Group: `GroupFormDialog`, then `GroupCreatedDialog` (a success panel with the tip below it). The form hands focus over without the trigger taking it back in between. The icon is validated (PNG/JPG, 2MB max) and previewed from an object URL when it's picked.
  - The Figma leaves the Members, Reports and Events tables' first column and their Actions cells empty. The tables drop the empty column. `RowMenu` (⋮, UI only) fills Actions, except on Events, where an eye opens the sheet. The sheet's status pill matches the table's (the Figma colors Upcoming blue there and amber in the table). Member Growth spreads its seven weekly bars across the card; the Figma packs them into the left half.
- `/notifications` (the header's bell links here; it isn't in the sidebar):
  - `NotificationCenter` lays the feed and a sticky detail panel side by side from `xl`. Below `xl`, the same `NotificationDetail` opens in a sheet. Its `wide` flag comes from `matchMedia` via `useSyncExternalStore`.
  - The tab, `?q`, `?category`, `?priority`, `?status`, `?range` and the open notification (`?notification=`) are URL state, inside `<Suspense>`. On a wide screen with nothing chosen, the first notification shows; the panel's X closes it to an empty state.
  - Mark as Read / Mark All as Read change read state in the page only, and the Unread count follows. Each card's action and the panel's primary button link to the page that handles it.
- `/subscriptions`:
  - The KPI row is `SubscriptionKpiRow`: six `CompactKpiCard`s with sparklines, using the verification row's glyphs and tones, as this Figma does.
  - Manage Plan opens `PlanSheet` (`?plan=`). A row's name in Recent Subscriptions opens `SubscriptionSheet` (`?subscription=`). Both sit inside `<Suspense>` and send focus back to their opener.
  - `PlanSheet`'s prices and features are an RHF form with `useFieldArray`. Features already on the plan toggle; ones added with + Add get name and description inputs. Free's prices are disabled.
  - The Recent Subscriptions filter and column toggles are local state.
  - The Monthly / Quarterly / Yearly and 30 / 90 Days / 1 Year switches are `SegmentedControl` (`components/subscriptions/segmented-control.tsx`).
  - Each plan's color (`PLAN_COLORS` in `subscription-badges.tsx`) is shared by its badge, the Distribution ring and the revenue bars. They're `stroke-*` / `fill-*` classes with dark variants, because Elite's near-black disappears on dark cards.
  - Money goes through `libs/money.ts` (`formatMoney`, `formatWholeMoney`, `formatPrice`, `formatCompactMoney`, `currencySymbol`) in `BILLING_CURRENCY` (`constants/billing.ts`), shared with Payments. Compact amounts ("£162.8k", "£842.5k", "£100k") keep one decimal unless it's zero, as the Figmas write them, and they're spelled out by hand there, because Node's and Chrome's `Intl` compact notation disagree on "K" vs "k", and that broke hydration. A value that rounds up to 1000 moves to the next unit ("£1m", not "£1000k"). KPI money goes through it too, so it follows the currency. `subscription-format.ts` keeps the plan names and cycle labels.
  - `/subscriptions/subscribers` is the directory: `?plan`, `?status`, `?joined`, `?billing`, `?view` (list / grid), `?page` and `?subscription=`, inside `<Suspense>`. It has row selection and uses `PagePagination variant="squares"`.
- `/payments`:
  - The KPI row is `PaymentKpiRow`: six `CompactKpiCard`s with sparklines and the verification row's glyphs and tones, like Subscriptions. Refunds' rise is red and Successful Payments shows a percentage. The Figma draws the first in green and repeats verification's "-15s" in the second. "Successful Payments" wraps onto two lines by itself at 1440 and stretches the row; `CompactKpiCard` pins its sparkline to the card's foot (`mt-auto`), so the row's sparklines stay level.
  - Revenue Overview is our chart, because the Figma draws a placeholder. Gross is a line over an area, net a dashed line, with a legend and a local 7D / 1M / 3M / YTD switch. Net is `#5f93a8`, a shade deeper than the Figma's `#86afc0`, so the line meets 3:1 on white.
  - Financial Insights shows all three insights, where the Figma clips the third, so the row is 512px tall at 1440.
  - Recent Transactions keeps `?q` (written after a 300ms pause), `?status`, `?product`, `?method`, `?page` and the open sheet (`?transaction=`) in the URL, inside `<Suspense>`, and uses `PagePagination variant="squares"`. The name is a stretched button over the row. The ⋮ menu's items follow the payment's status.
  - `TransactionSheet` (448px, on `ActionSheetContent`) sends focus back to the name or ⋮ that opened it. Opened from a link, it falls back to the row's name (`data-transaction`). `CustomerAvatar` is exported from it for the table.
  - `PaymentStatusBadge` (`payment-badges.tsx`) is both frames' 11px pill. Successful takes the sheet frame's green and Pending a deeper amber, so every label reaches 4.5:1. Timeline steps are `done` (green check), `step` (the Figma's grey dot), `failed` (red cross) and `waiting` (amber ring).
  - The table and the sheet call a yearly cycle "Annual" (`CYCLE_NAMES` in `payment-badges.tsx`), as the Payments frames do. Subscriptions says "Yearly".
  - Browsers won't break a line between a hyphen and a digit, so IDs like `#TRX-8942-A1` need a `<wbr>` to wrap after their prefix.
- `/reports` (Reports & Safety):
  - The eight KPIs are `CompactKpiCard`. Where the Figma pairs a tinted tile with a slate or teal sparkline (Permanently Banned, AI Safety Alerts, Avg Resolution Time), `tileClassName` recolors the tile. On Open Reports and Suspended Accounts the Figma's corner figure and the one under the value disagree; both show the lower one.
  - Safety Trends has one y-scale from zero (axis hidden): submitted is an area, resolved a line. The series colors are custom properties on the `ChartContainer` (`--trend-submitted`, `--trend-resolved`), with dark-mode steps. Nov and Dec are null, so both lines stop at Oct.
  - Report Distribution is an SVG ring sized by the legend's shares. Its colors went through the dataviz validator: the Figma's slate sat too close to its brown, so Other is `#7c93a8` (dark `#6f8fb0`), and the ring keeps the Figma's order (red, slate, brown, teal) so red never touches brown. Hovering a segment or legend row shows its share in the middle.
  - Live Reports Queue keeps `?q`, `?priority`, `?status`, `?page` and the open report (`?report=`) in the URL, inside `<Suspense>`, with `PagePagination variant="mini"`. The filter button is a Priority and Status menu.
  - `ReportSheet` (512px, on `ActionSheetContent`): Issue Warning and Suspend Account reuse the Conversations `WarnUserDialog` and `SuspendAccountDialog`, aimed at the reported user through `target` (`ModerationSubject` in `components/conversations/participants.ts`: a conversation's flagged participant, or a person named outright). Permanently Ban is `BanAccountDialog` (the Figma has no frame for it), which needs an acknowledgement ticked first. All three open over the sheet via `trigger`, with `nestedOpen`. Focus goes back to the row's ID button or ⋮; opened from a shared link, it falls back to the ID button. The evidence image stays blurred until Show sensitive image (the Figma draws a `visibility_off` placeholder there).
  - A table's scrolling wrapper needs `relative`: the `sr-only` spans in its cells are absolutely positioned, and without it they escape the scroll clip and widen the page on phones.
- `/analytics`:
  - The KPI row is six `CompactKpiCard`s with sparklines (`AnalyticsKpiRow`), using the `orange` and `violet` tones, six across from 1400px. The glyphs are ours, because the Figma's are placeholders (an ✕ on Matches Created, a warning shield on Virtual Dates). Falling figures are red, with sparklines that turn down; the Figma colors every change green.
  - Every chart color comes from one teal ramp: put `RAMP_VARS` on the chart's root, then paint with `ramp(n)` (`components/analytics/analytics-format.ts`; validated, with its own dark steps). Plans (`TIER_RAMP`) and funnel stages (`FUNNEL_RAMP`) are ordered, so their steps are too. User Growth's Active Users line is a quiet grey (`CONTEXT_LINE_VARS`). Every card except the KPIs and the filled Stickiness card uses `HAIRLINE_CARD`.
  - Chart tooltips are `LiveTooltipContent`, a polite live region, so stepping through a chart with the keyboard is announced. Each chart also has an `sr-only` table.
  - Departures from the Figma:
    - The Match Funnel draws its bars to scale from one baseline, 24px tall.
    - Compatibility uses equal 5-point bands with value labels; the Figma mixes 10-, 5- and 1-point bands.
    - User Growth labels its latest month (22.1K) and names its span under the title.
    - Both Algorithm Performance meters share one teal.
    - Avg Match Score is 86.4%, Compatibility's average; the Figma has 88.5% there.
    - The map's markers are decorative; the list beside it carries the shares.
  - `DateRangeSelect` doesn't scope the charts yet. Subscription Revenue's Weekly / Monthly switch is local state, so the page needs no `<Suspense>`.
- `/profile` (My Profile in the account menu; it isn't in the sidebar):
  - A read-only overview, so each form lives in one place, Settings. Edit Profile and the photo's camera button open `/settings/profile`. The Preferences rows open Notifications, Appearance and Language & Region. Go to Security Settings and View all activity (`/settings/audit-logs`) link there too.
  - Personal Information draws filled boxes with no input affordances: no caret, no hover, no select chevron.
  - The footer's Sign Out of All Other Sessions opens `SignOutSessionsDialog` with the session table; Sign Out opens `SignOutDialog`.
  - The two columns start at `xl`. Inside them, the card pairs are container queries, so they follow the room they get.
  - The Figma shows Eleanor Vance under a header that says Alex Rivera. The page shows the signed-in admin (the sample profile) throughout.
- `/settings` (opened from the account menu; Close goes to `/dashboard`):
  - It's its own route group, `app/(settings)`, because the Figma has no sidebar there. That layout reuses `AppSidebar` and `SiteHeader` with `SidebarProvider defaultOpen={false}`, so the off-canvas sidebar stays hidden on desktop and the header's menu button still opens it on phones.
  - `/settings` redirects to `/settings/profile`. The twelve sections are routes listed in `constants/settings-navigation.ts`. `SettingsNav` is the grouped menu on `lg` and one scrolling pill row below that, which scrolls the open section into view.
  - Sections build on `SettingsSectionHeader`, `SettingsCard` (`border-border/40`) and `SaveButton` / `SecondaryButton` from `components/settings/`. General opens straight on its first card, with no section heading, as the Figma does.
  - The toggle with the blue check thumb is `CheckSwitch` (`components/dashboard/check-switch.tsx`, also on the Dating Coach availability days). The plain toggles (Notifications, Maintenance Mode) are shadcn's `Switch`. `ToastButton` lives in `components/dashboard/toast-button.tsx`.
  - Relative times ("2 hours ago", "Today, 09:41 AM") come from `components/settings/settings-format.ts`, formatted in UTC against `SAMPLE_NOW` so the server's render and the browser's agree. Use the real clock once the data comes from the API.
  - Audit Logs keeps `?q`, `?actor`, `?module`, `?action`, `?date`, `?page` and `?rows` in the URL, inside `<Suspense>`.
  - Permissions opens on Admin, not the Figma's Super Admin: its grid has restricted cells, which only make sense below Super Admin. Restricted cells are disabled, and Discard resets the role being edited.
  - Maintenance Mode's switch stays off and toasts: turning it on would sign every member out.
  - Appearance's theme cards set the next-themes theme for real; nothing is selected until mount, so the server's render and the browser's agree. Density and Sidebar Style toast.
  - Language & Region has Selects for the language and date format, the 24-hour switch, and a searchable timezone combobox with a live "Current time in …" clock, filled in after hydration. Save toasts and Cancel resets.
  - The language and timezone lists live in `constants/regional.ts`, shared by Language & Region, General and Profile. Languages are named in themselves and carry their `lang`. Zones that change their clocks show no fixed offset.
  - Security's Sign Out All Other Sessions opens `SignOutSessionsDialog` without the table.

## Placeholders

These are waiting on designs. Replace them; don't build on them. The data wiring underneath stays.

- `components/auth/forgot-password-form.tsx` and `components/auth/verify-code-form.tsx`: the Figma has no frame for the email or code steps yet (both are wired)
- the sample email and invitation in `app/(auth)/setup/page.tsx` and `app/(auth)/(card)/invite/page.tsx` (UI only, and hidden behind `adminInvites`; the real values would come from setup and invitation links)
- `constants/dashboard-sample.ts`: the dashboard overview renders the Figma's sample figures until `/admin/dashboard/*` is typed (shapes in `types/dashboard.ts`) and wired. That includes the sample verification request and the announcement audience sizes.
- `constants/users-sample.ts`: the Users page's sample figures and one page of sample users, filtered in the browser. GET `/admin/users` filters only by `search` and account `status`, so the Location and Plan filters, and Verified/Pending under Status, need backend support before they can be wired.
- `constants/matches-sample.ts`: the Matches page's sample figures, plus two high-confidence and six recent matches (shapes in `types/matches.ts`). The backend's match statuses are PENDING, ACCEPTED, REJECTED, EXPIRED and UNMATCHED, so the Figma's "Reported" has no equivalent yet. Remove Match corresponds to POST `/admin/matching/{id}/invalidate`. Flag and Exclude have no endpoints yet.
- `constants/ai-center-sample.ts`: every AI Center figure (shapes in `types/ai-center.ts`). The backend has no AI metrics endpoints; only the matching weights relate. The Filter and Sort buttons on AI Services Status are UI only.
- `constants/analytics-sample.ts`: every Analytics figure (shapes in `types/analytics.ts`), with relative times against `SAMPLE_ANALYTICS_NOW`. GET `/admin/dashboard/*` is the nearest backend source, and it isn't typed or wired yet. Money follows the Figma's pounds through `BILLING_CURRENCY`. The Stickiness meter counts 50% DAU/MAU as full (`STICKINESS_SCALE_MAX`, ⚠️ PROVISIONAL). Export Report opens the dashboard's Export Detailed Report dialog; it and View Detailed List are UI only.
- `constants/virtual-dates-sample.ts`: every Virtual Dates figure and ten sample sessions (shapes in `types/virtual-dates.ts`).
  - GET `/admin/virtual-dates` filters by `status` (PENDING … COMPLETED, MISSED) and `kind` (MOVIE, MEAL, GAME, SHOP, the four themes). The Figma's "Live" has no status yet.
  - Cancel session corresponds to POST `/admin/virtual-dates/{id}/cancel`.
  - The row menu's other items and the reported-session review are UI only.
- `constants/conversations-sample.ts`: every Conversations figure and three sample conversations with their evidence transcripts (shapes in `types/conversations.ts`). The filters run on the sample rows in the browser. Warn, Flag and Log Review have no endpoints yet; Suspend corresponds to POST `/admin/users/{id}/suspend`, which needs a reason. The warning reasons and templates, the timed-suspension copy and the team list are ⚠️ PROVISIONAL.
- `constants/community-sample.ts`: every Community figure, the three sample groups, members, discussions and reports, three events and three moderation cases (shapes in `types/community.ts`). Every group's dashboard shows Book Lovers' figures. The filters and search run on the sample rows in the browser.
  - The table's categories are the Figma's (Lifestyle, Creative, Outdoors). The create and edit dialogs offer the backend's ten (`GROUP_CATEGORIES` in `constants/community.ts`, from `AdminCreateGroupDto`).
  - POST and PATCH `/admin/community/groups` take only name, description and category, so the icon and privacy have nowhere to go yet. The success screen is shown even though nothing is saved, and a toast says so.
  - Archive corresponds to DELETE `/admin/community/groups/{id}`, which needs a `reason`. View All Activity, View Full Analytics, the next steps and every row menu are UI only.
  - Events have only member-side routes: `GET /community/events` (by `type` and `timeframe`), `POST /community/groups/{groupId}/events`, and `PATCH`/`DELETE /community/events/{id}`. Cancel Event corresponds to PATCH with `isCancelled`. `CreateEventDto` requires a `type` (VIRTUAL/PHYSICAL), which the Figma's form doesn't ask for, plus a meeting URL or venue to match. It has no image, community or initial-status fields. Event photos are picsum stand-ins (`sampleCover`).
  - The Moderation tab's description is ours, because the Figma repeats the Events copy there. Export and the queue's row menus are UI only. Group thumbnails are `public/images/sample/community-{books,camera}.jpg`, cropped from the Figma.
- `constants/notifications-sample.ts`: the Notifications counts and six sample notifications (shapes in `types/notifications.ts`). The backend's `GET /notifications` and `PATCH /notifications/read` are members' notifications; there's no admin feed. The Figma titles the fourth card "Payment failed" over a new-subscription summary, so it's titled "New Elite subscription" here. "Show earlier notifications" is UI only.
- `constants/payments-sample.ts`: every Payments figure, the three insights, and seven sample transactions with their timelines (shapes in `types/payments.ts`). The backend has no payment, transaction or revenue routes.
  - The KPI values are the Figma's. The revenue ranges are cut from one day-by-day series ending on the sample "now", Tue Oct 20, 2026, so a day reads the same in 7D and 1M, the weeks and months add up, and today is 5.4% up on yesterday, as the KPI says. 3M is 13 rolling weeks. October in YTD is marked "to date".
  - The transactions are dated Oct 18–20, 2026 (the Figma's say Oct 2023). Their amounts follow the Subscriptions plan prices, less a flat 3% fee when captured. Top Performer is worked out from the plans (39%; the Figma says 62%).
  - The filters and search run on the sample rows in the browser, and filtered results are paged. With no filter set, every page shows the first five sample rows under the full 2,492 count. Export, Download Receipt and the ⋮ menu's receipt, retry and refund items toast. View User links to `/users?q=<name>`.
- `constants/subscriptions-sample.ts`: the four plans, KPIs, growth, revenue, plan movement, churn and eight sample subscriptions (shapes in `types/subscriptions.ts`). The backend has no subscription, plan or payment routes.
  - Money is in pounds (`BILLING_CURRENCY` in `constants/billing.ts`, also used by Payments and Analytics), as these Figmas price it. Well-being and Settings show dollars, and so does the Figma's Subscribers frame, so confirm the currency with Fahd. Switching is that one constant.
  - The figures follow the plans: MRR, MRR Contrib, Monthly Revenue and the revenue total come from price × members. The Figma's "4,216" MRR, "£142.5k" total and the plan sheet's 12,450 members don't add up.
  - Every save, refund, cancellation, auto-renew change, export and row action is UI only.
- `constants/well-being-sample.ts`: every Well-being figure, six sample resources, five assessment questions, and the Dating Coach figures, three coaches, three sessions, the service settings and one coach's weekly hours (shapes in `types/well-being.ts`). The backend has no well-being or coaching routes. Revenue shows in dollars, where the Figma has £82.4k beside a dollar rate. The sample copy is adapted to dating (the Figma's copy mentions workplace stress and an EAP). The filters, More Filters, the row menus, Save Changes, Preview Assessment, every Dating Coach save and export, Manage Roster, View All History and the guide's Download PDF are UI only.
- `constants/reports-sample.ts`: every Reports & Safety figure, three sample reports with their evidence and AI scores, the moderators and the insights (shapes in `types/reports.ts`). The backend's report routes (`/admin/chat/reports`, `/admin/community/reports`) aren't typed or wired. Dismiss, Assign to me, Permanently Ban, Export Report and View All toast, and the warn and suspend dialogs save nothing. Evidence images are picsum stand-ins (`sampleCover`). The title follows the sidebar ("Reports & Safety"; the Figma says "Report & Safety"). The Figma's last page, 121, doesn't fit 432 reports at 10 a page, so the footer computes 44. Sample times sit around `SAMPLE_REPORTS_NOW`.
- `constants/profile-sample.ts`: Profile's three recent activities (shape in `types/profile.ts`). The rest of the page reads `constants/settings-sample.ts` (the admin, their security and sessions). No backend route returns the signed-in admin's profile or activity.
- `constants/settings-sample.ts`: every Settings figure (shapes in `types/settings.ts`). Only Team & Roles has related endpoints (GET `/admin/users/admins`, PATCH `/admin/users/{id}/role`), and they aren't wired yet. Nothing else in Settings has a route. Saves, exports, invites, sign-outs and row actions toast. The Figma's enterprise wording is adapted to dating, the currency defaults to USD to match the rest of the admin, and the sample dates sit around `SAMPLE_NOW`.
- `constants/verification-sample.ts`: the verification page's sample figures and three sample cases (shapes in `types/verification.ts`), until the verification endpoints are typed and wired. The status filter runs on the sample rows in the browser, and every page shows the same rows.
- Stand-ins on `/verification` that the frames don't define: the review sheet's Request Documents / Reject / Approve footer (the frames show the dialogs but no buttons for them), the rejection reasons, and the Global Reach map (the Figma's own placeholder art).
- `public/images/sample/verification-{photo,document,passport,selfie}.jpg`: cropped from the Figma screenshots, with the label chips painted out of the passport and selfie. Swap in proper exports or the real signed URLs.
- Sample people photos are randomuser.me portraits (`portrait("women/26")` from `constants/sample-portraits.ts`; `SAMPLE_ADMIN_AVATAR_URL` in `constants/dashboard-sample.ts` feeds the header avatar). When the Figma's image isn't in Downloads, use one of these rather than waiting for an export. Avatars render them through `AvatarImage`, a plain `<img>` that falls back to initials. `next/image` can load them too (`randomuser.me/api/portraits/**` is in `images.remotePatterns`). Don't reuse a portrait already on the same screen. For non-people images (resource thumbnails, covers) use `sampleCover(seed)` from the same file, a picsum.photos URL rendered with a plain `<img>`.
- the `PagePlaceholder` section pages under `app/(dashboard)/`
