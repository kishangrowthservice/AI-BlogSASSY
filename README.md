# AI Blog SaaS (GrowthService)

A stateless, multi-tenant AI blog generation gateway and publishing automation platform. Built with Next.js 15 App Router, TypeScript, Supabase, Groq (Llama 3.3 / GPT-OSS), and Google Gemini (Flash 2.5 Lite).

---

## Features

- **Multi-Tenant Isolation**: Cryptographically verified site ownership and strictly isolated tenant profiles with Row-Level Security (RLS).
- **Dual-Provider Resilient Pipeline**: Groq primary generation with automatic, transparent fallback to Gemini on rate limits or API outages.
- **Circuit Breaker**: Database-backed atomic circuit breaker state with canary half-open recovery.
- **Atomic Quota Reservation**: Zero-race reserve-and-release pattern preventing tenant bursts from exceeding monthly generation quotas.
- **Noisy-Neighbor Rate Limiting**: Token-bucket sliding window rate limiter per tenant.
- **Async Queue & Processing**: Reliable asynchronous generation queue with retry backoff and deterministic state management.
- **Self-Serve Onboarding**: Complete signup, email verification, and self-serve site registration with on-demand API key minting.
- **Admin Control Panel**: Cookie-guarded observability dashboard for tenant management, quota controls, and telemetry tracking.

---

## Local Development Setup

### 1. Prerequisites
- Node.js 20+
- npm or pnpm
- Supabase project (or local Supabase instance)

### 2. Installation
```bash
git clone https://github.com/kishangrowthservice/AI-BlogSASSY.git
cd AI-BlogSASSY
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local` and configure the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Providers
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIza...

# Admin & Internal Security
ADMIN_SESSION_TOKEN=your-random-secure-admin-token
CRON_SECRET=your-random-cron-secret-token

# Optional Public API URL (defaults to window.location.origin in client)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Running the Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Testing & CI

Run the automated test suite (TypeScript typechecking + cross-tenant authorization boundary tests):
```bash
npm test
```

Run authorization boundary tests individually:
```bash
npm run test:auth
```

Continuous Integration is automated via GitHub Actions in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

---

## Database Migrations Map

All migrations are located in [`supabase/migrations/`](supabase/migrations/):

| Migration | Purpose |
|---|---|
| `001_site_profiles.sql` | Core `site_profiles` table, indexes, and initial constraints. |
| `002_generation_logs.sql` | Telemetry logs storing latency, token counts, model names, and status. |
| `003_rate_limits_and_circuit_breaker.sql` | State tables for token-bucket rate limiting and circuit breakers. |
| `004_generation_queue_and_byo_key.sql` | Asynchronous generation job queue and BYO API key storage. |
| `005_enable_rls.sql` | Enables PostgreSQL Row Level Security across all tables. |
| `006_production_rpcs_and_monthly_reset.sql` | Stored procedures for monthly quota resets and atomic checks. |
| `007_high_concurrency_10k.sql` | Concurrency optimizations and connection indexing for high-scale throughput. |
| `008_allow_nullable_api_key_hash.sql` | Supports self-serve onboarding before on-demand API key generation. |
| `009_add_user_id_to_site_profiles.sql` | Binds Supabase `auth.users(id)` to `site_profiles(user_id)`. |
| `010_rls_policies.sql` | Initial RLS policies scoping user read access to their own profiles. |
| `011_atomic_circuit_breaker_rpcs.sql` | Atomic PostgreSQL RPCs (`record_circuit_failure`, `record_circuit_success`). |
| `012_atomic_quota_reservation.sql` | Atomic `reserve_tenant_quota` and `release_tenant_quota` procedures. |
| `013_add_title_to_generation_logs.sql` | Adds user-facing article `title` column to `generation_logs`. |
| `014_comprehensive_rls_policies.sql` | Complete RLS enforcing user ownership for `site_profiles` and `generation_logs`. |

---

## Architecture & Security Boundary

```
[ Visitor / Client ]
        │
        ├── (Unauthenticated) ──> /login, /signup, /terms, /privacy, /preview
        │
        └── (Authenticated)   ──> /dashboard
                                       │
                         verifySiteOwnership(siteId, user.id)
                                       │
                      ┌────────────────┴────────────────┐
                      ▼                                 ▼
                 [ Validated ]                    [ Unauthorized ]
                      │                                 │
             TenantDashboardClient             Redirect to Own Site
```

- **Authentication**: Supabase Auth sessions via SSR cookies.
- **Authorization**: `verifySiteOwnership()` strictly checks `site_profiles.user_id = user.id` before executing any dashboard load, API key minting, or brand update.
- **Sanitization**: `toSafeSiteProfile()` strips `api_key_hash`, `byo_groq_api_key`, and `byo_gemini_api_key` before any data crosses server-to-client boundaries.
