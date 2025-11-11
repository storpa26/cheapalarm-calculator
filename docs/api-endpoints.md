## Cheap Alarms API Reference

Base URL: `https://cheapalarms.com.au/wp-json/ca/v1`

### Authentication
- Most endpoints are public for now (estimate lookup, portal status).  
- Customer dashboards require a logged-in WordPress session plus `X-WP-Nonce`.  
- Portal status accepts invite tokens for unauthenticated previews.

### Health & Auth
| Method | Path            | Description |
|--------|-----------------|-------------|
| GET    | `/diag`         | Checks plugin wiring and confirms GHL connectivity for a given `locationId`. Returns location info and upload link. |
| POST   | `/auth/token` *(planned)* | Issue JWT for headless login once implemented. |

### Estimates
| Method | Path                  | Description |
|--------|-----------------------|-------------|
| GET    | `/estimate`           | Fetch a single estimate by `estimateId` (or latest by `email`). Returns normalised quote data ready for frontend display. |
| GET    | `/estimate/list`      | Paginated list of estimates for a `locationId`. Accepts `limit` and `raw=1` for full GHL payload. |
| POST   | `/estimate/create`    | Create an estimate via the WordPress bridge. Sanitises payload, calls GHL `/invoices/estimate`, then injects photo upload banner/terms. |
| POST   | `/estimate/update`    | Update an existing estimate (`estimateId`, optional `termsNotes`) while preserving portal banner. |
| POST   | `/estimate/photos`    | Store photo upload metadata (per estimate) in WordPress options. Use after uploads to S3/WordPress. |
| POST   | `/estimate/apply-photos` | Merge stored photo metadata back into the GHL estimate (rebuilds items + banners). |
| GET    | `/estimate/photos`    | Retrieve stored photo metadata for an estimate (used by upload dashboards). |

### Portal & Accounts
| Method | Path                  | Description |
|--------|-----------------------|-------------|
| GET    | `/portal/status`      | Returns quote, account, photo, install status for a specific `estimateId`. Requires invite token or logged-in linked customer. Auto-provisions account if quote accepted. |
| GET    | `/portal/dashboard`   | Customer-centric feed (all linked estimates) for the logged-in WordPress user. Used by portal UI. |
| POST   | `/portal/accept`      | Mark estimate accepted and store timestamp (used for manual overrides/testing). |
| POST   | `/portal/create-account` | Provision customer account manually from an estimate payload (auto-invites, logs reset URL). |
| POST   | `/portal/resend-invite` | Resend portal invite email. Requires admin capability. |
| GET    | `/portal/test-account` | Lightweight check of account block (invite URL/reset URL) for support/testing. Accepts invite token for auth. |

### Uploads
| Method | Path                  | Description |
|--------|-----------------------|-------------|
| POST   | `/estimate/annotate`  | Append photo banner/terms to existing estimate. Called automatically after bridge create. |
| POST   | `/upload` *(future)*  | File upload gateway (currently handled by UI + UploadService). |

### Notes
- **Nonce injection**: `portal-app.php` drops `window.wpApiSettings.nonce`; frontend must pass it via `X-WP-Nonce` for authenticated calls.
- **Auto-linking**: When `/portal/status` sees an accepted quote with an active account, it now ensures the estimate ID is stored on the customer so dashboards stay in sync.
- **SMTP required**: `portal/create-account` and `resend-invite` call `wp_mail`; configure outgoing mail (WP Mail SMTP, etc.) for production.

