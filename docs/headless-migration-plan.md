## Headless Migration Master Plan

### 1. Executive Summary
This document captures the full context of the Cheap Alarms project to date and lays out a detailed, production-ready migration plan to a headless architecture. WordPress will operate purely as a secure backend/API layer (REST and optional GraphQL), while Next.js will drive all customer- and admin-facing experiences, including a superadmin dashboard and portal functionality. The plan also covers operational considerations, timelines, and risk mitigation so the project can move forward without losing the rich history and lessons learned so far.

### 2. Historical Context & Key Decisions
- **Initial Pain Points**
  - Admin dashboard showed only five estimates and lacked pagination controls.
  - Client requested removal of all noisy `console.log` output from the React app (except in `lookup/`).
  - Needed client portal to show quotes, photos, documents, installation status, and support secure account provisioning once an estimate is accepted.
- **Incremental Fixes & Enhancements**
  - Implemented client-side pagination in `AdminDashboardPage.jsx`, added URL sync, removed duplicate entries, and cleaned up console statements across the app.
  - Added portal status panels, invite resend controls, and quote portal entry point (`QuotePortalPage.jsx`, `useQuotePortal.js`).
  - Introduced `QuotePortalPage.jsx` and associated hook to centralize portal logic.
- **Backend Evolution**
  - Original WordPress plugin (`cheapalarms-plugin`) reworked into a modular, PSR-4 autoloaded architecture with clear service boundaries:
    - `Config`, `Logger`, `Authenticator`, `GhlClient`, `EstimateService`, `UploadService`, `PortalService`.
    - REST controllers for estimates, uploads, portal actions; admin menu integration; view templates.
  - Replaced PHP 8 union types to support PHP 7.4+ hosts; wrapped GHL calls with service layer to gracefully handle API quirks (e.g., fallback to list/filter after 404).
  - Created `config/secrets.php` to centralize sensitive values; plugin bootstrap defends against direct access (`ABSPATH` check) and uses version constants.
- **GoHighLevel (GHL) Integration Challenges**
  - Direct GHL GETs for specific IDs sometimes returned 404; mitigated via list/filter fallback in `EstimateService::getEstimateById`.
  - Handling 500 errors required enabling `WP_DEBUG_LOG` and ensuring constants were defined once, not twice in `wp-config.php`.
  - Confirmed REST route setup by checking `/wp-json/ca/v1/diag`; discovered missing plugin activation on main site caused 404s.
- **Current Status**
  - React app cleaned of console noise and builds successfully.
  - WordPress plugin refactored but still running in monolithic mode (WP renders admin dashboard and portal directly). Desire now is full headless split with Next.js handling all UI.

### 3. High-Level Target Architecture
- **Backend (WordPress)**
  - Acts as API + content store only.
  - Provides REST endpoints (existing `/ca/v1/*`) and optionally GraphQL (via WPGraphQL) for structured content.
  - Maintains business logic: estimate lifecycle, portal state, photo uploads, account provisioning, GHL interactions.
  - Uses custom tables for structured data (tickets, portal metadata, calculators) when CPTs are insufficient.
  - Exposes secure authentication/authorization endpoints using JWT or OAuth (e.g., `wp-authenticate` extension, custom tokens, or leveraging WP REST API Application Passwords).
- **Frontend (Next.js)**
  - Owns all user interfaces: marketing pages, calculators, product detail pages, client portal, superadmin dashboard.
  - Implements role-based access control (RBAC) to differentiate superadmin, admin, moderator, support, customer roles, etc.
  - Fetches data from WordPress via REST/GraphQL using server-side rendering (SSR) or static generation (SSG) as appropriate for SEO-friendly routes.
  - Integrates with third-party services (e.g., analytics) on the frontend, consuming WordPress-provided API keys via secure environment variables.
- **Authentication & Routing**
  - Login flow handled by Next.js using secure tokens issued by WordPress (JWT) or an identity provider.
  - Next.js API routes serve as BFF (Backend-For-Frontend) proxies when sensitive server-side operations are required.

### 4. Detailed Migration Plan
#### Phase 0 — Preparation (0.5–1 day)
- **Repo Setup**
  - Create new repository (e.g., `cheapalarms-headless`) to avoid altering the current project.
  - Copy existing React app (read-only reference) into a `reference/` directory or zip; keep top-level `cheapalarms-plugin/` for reuse.
  - Establish documentation folder (`docs/`) with this plan and tracking docs (decisions, issues, testing).
- **Environment Baseline**
  - Document current `.env` values, GHL credentials, WP config locations.
  - Ensure staging WordPress site available for headless API testing.

#### Phase 1 — CMS Hardening (2–3 days)
- **Plugin Enhancements**
  - Modularize services further if needed, ensuring each domain (estimates, uploads, portal, tickets) has a dedicated service and controller.
  - Implement custom database tables (via dbDelta) for new features (support tickets, calculators) with migration scripts.
  - Add WPGraphQL support if chosen: Register custom post types, fields, and resolvers.
- **Authentication Layer**
  - Implement JWT/OAuth issuance endpoint (e.g., `/ca/v1/auth/token`) requiring WordPress credentials or AAD integration.
  - Harden CORS rules to allow Next.js domains (production, staging, localhost). For localhost, use wildcard subdomain or explicit `http://localhost:3000`.
- **Role Management**
  - Define custom roles/capabilities: `superadmin`, `admin`, `moderator`, `support`, `customer`.
  - Map plugin endpoints to capability checks via `Authenticator`.
  - Document role-permission matrix.

#### Phase 2 — Next.js Foundation (2–3 days)
- **Bootstrap Next.js App**
  - Create new Next.js 14 project with App Router, TypeScript, Tailwind/Design system to match existing UI.
  - Configure `.env.local` with API URLs and tokens.
  - Implement global layout, SEO helpers, analytics integration.
- **Shared Design System**
  - Migrate reusable UI components from existing React app (buttons, forms, tables) into a shared `ui/` library.
  - Set up storybook or component docs for visual QA.
- **Authentication Integration**
  - Implement login flow: credential form posts to WP token endpoint; store JWT in HTTP-only cookies; use middleware for route protection.
  - Create role-based route guards (e.g., `superadmin` dashboard only).

#### Phase 3 — Feature Migration (4–6 days)
- **Superadmin Dashboard**
  - Rebuild admin dashboard in Next.js; consume WordPress endpoints for estimates, portal status, uploads.
  - Implement pagination, filtering, resend invite, portal/account status panels (parity with current React).
  - Add product/package management (CRUD) using CPT endpoints or GraphQL mutations.
- **Client Portal**
  - Implement portal pages (quote summary, photo uploads, document viewer, installation timeline).
  - Integrate upload flow with WordPress `/upload` endpoints; handle signed URLs or direct S3 if needed.
  - Add support ticket module if required, backed by new custom table endpoints.
- **Public Pages & Calculators**
  - Port marketing pages, calculators, product pages; leverage SSG for SEO-critical pages.
  - Ensure calculators fetch dynamic pricing/config from WP via API.

#### Phase 4 — QA, Hardening, and Deployment (2–3 days)
- **Testing**
  - Automated: unit tests for services/hooks, integration tests for API endpoints, end-to-end tests with Playwright/Cypress.
  - Manual: cross-browser verification, staging environment sign-off, portal flows, error handling.
- **Performance & Security**
  - Add caching (WP transient caching, Next.js ISR) for list endpoints.
  - Implement rate limiting and monitoring (WP filters, Next.js middleware).
  - Enable logging/observability (WP debug channels, Next.js server logging, third-party APM).
- **Deployment Pipeline**
  - Configure CI/CD: linting, tests, build, deploy to staging/production (Vercel for Next.js, WP plugin deployment via GitHub Actions or WP-CLI).
  - Document rollback strategy and release checklist.

### 5. Time & Difficulty Estimates
- Ballpark timeline (including bug-fix buffer): **10–14 working days**.
- Breakdown:
  - Preparation + CMS hardening: ~3–4 days.
  - Next.js foundation: ~2–3 days.
  - Feature migration: ~4–6 days.
  - QA & deployment: ~2 days.
- Difficulty: Medium-high. Major risks include authentication complexity, data consistency between WP and Next.js, and ensuring all portal features remain functional during migration.

### 6. Data Flow & Integrations
- **Existing GHL Flow**
  - Frontend → WordPress `/ca/v1/estimate/create` → `EstimateService` → `GhlClient` → GHL REST API. WordPress handles secrets, error normalization, and logging.
  - If frontend called GHL directly, secrets would leak, CORS issues arise, and rate limiting/auth would be harder to manage.
- **Future Support Ticket Example**
  - WordPress stores tickets in custom table `wp_ca_tickets`; exposes endpoints `/ca/v1/tickets` (list/create/update).
  - Next.js fetches tickets via server component or API route, renders UI, and submits updates via fetch with JWT.

### 7. API Surface (Initial Draft)
- `POST /ca/v1/auth/token` – Obtain JWT/OAuth token.
- `GET /ca/v1/diag` – Health check.
- `GET /ca/v1/estimate` – Fetch single estimate.
- `GET /ca/v1/estimate/list` – Paginated estimates with filters.
- `POST /ca/v1/estimate/create` – Create estimate.
- `POST /ca/v1/estimate/update` – Update estimate.
- `POST /ca/v1/estimate/photos` – Upload photos (multipart).
- `POST /ca/v1/estimate/apply-photos` – Attach uploaded photos.
- `POST /ca/v1/portal/accept` – Accept estimate, trigger account creation.
- `POST /ca/v1/portal/create-account` – Manual account provisioning.
- `POST /ca/v1/portal/resend-invite` – Reissue portal invite.
- `GET /ca/v1/portal/status` – Portal + account status.
- `POST /ca/v1/tickets` / `GET /ca/v1/tickets` / `PATCH /ca/v1/tickets/{id}` – Ticket management (future).
- Additional endpoints for calculators, package catalogs, etc.

### 8. Operational Checklist
- **Access & Credentials**
  - Maintain secure storage of GHL access token (`pit-195...`), location ID (`aLTX...`), upload secrets; rotate regularly.
  - Avoid hardcoding secrets in repo; rely on environment variables and `secrets.php`.
- **Logging & Monitoring**
  - Keep `WP_DEBUG_LOG` available in staging but disabled in production; use structured logging via `Logger` service.
  - Add Next.js logging hooks for API call failures to identify sync issues quickly.
- **Documentation**
  - Maintain `docs/` with architecture decisions (ADR format), API specs (OpenAPI/GraphQL schema), environment setup steps, and playbooks for common operations (add new role, rotate secret).

### 9. Next Steps for Collaboration
- Create the new repo/workspace and add this plan.
- Copy reference assets (current React app build, WordPress plugin) into `reference/`.
- Schedule working sessions to tackle Phase 0 and Phase 1 together.
- Begin implementing Phase 1 tasks (plugin hardening, auth, roles) while drafting Next.js project scaffold.

With this document in place, we have a single source of truth for prior work, current architecture, and forward strategy. All subsequent tickets/tasks should reference the relevant section to ensure alignment as we move into the headless implementation.

