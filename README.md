# AI Blog SaaS Platform

A multi-tenant AI blog generation platform that enables websites and digital agencies to produce high-quality, SEO-optimized articles with brand DNA awareness, internal link injection, dual-LLM resilience, and automated publishing pipelines. The platform features self-serve onboarding, an authenticated client dashboard, transparent failover between primary (Groq) and fallback (Gemini) providers, and atomic quota controls.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components, Server Actions)
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth SSR, Row Level Security)
- **AI Providers**: Groq SDK (`openai/gpt-oss-120b`, `llama-3.3-70b-versatile`), Google GenAI (`gemini-3.1-pro-preview` with `thinking_level: high`)
- **Styling & UI**: Tailwind CSS, Radix UI primitives, Lucide React, Framer Motion
- **Language & Runtime**: TypeScript 5, Node.js 22+ (LTS)

## Required Environment Variables

Configure these in `.env.local` based on `.env.example`. Do not invent extra variables.

| Variable | Description | Requirement Status |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (`https://your-project.supabase.co`) | Required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous / public client key | Required |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase backend service-role secret key (bypasses RLS for secure server actions) | Required |
| `GROQ_API_KEY` | API key for primary LLM generation via Groq | Required |
| `GEMINI_API_KEY` | API key for fallback LLM generation via Google Gemini | Required |
| `DEFAULT_LLM_PROVIDER` | Primary generation provider (`groq`) | Optional (defaults to `groq`) |
| `ADMIN_PASSWORD` | Password for `/admin/login` access | **REQUIRED** — No fallback in code; application rejects admin authentication if missing |
| `SESSION_SECRET` | Secret string used for encrypting session cookies | Required |
| `ADMIN_SESSION_TOKEN` | Secret token verified against `admin_session` cookie for admin server actions | **REQUIRED** — No fallback in code; admin actions fail closed if missing |
| `CRON_SECRET` | Bearer token required for triggering `/api/cron/*` endpoints | **REQUIRED** — No fallback in code; cron routes return 401 if missing |

## Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Apply Database Schema and Migrations
Connect to your Supabase project (via the [Supabase Dashboard SQL Editor](https://supabase.com/dashboard) or the Supabase CLI):

- **Option A (Consolidated Schema)**: Execute the entire schema in one pass by running `supabase/full_schema.sql` in the SQL Editor.
- **Option B (Sequential Migrations)**: Execute the migration files located in `supabase/migrations/` in numerical order from `001` through `016`.

### 3. Run the Development Server
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## Migration History

- `001_site_profiles.sql`: Creates initial `site_profiles` table, performance indexes, and automatic `updated_at` trigger.
- `002_generation_logs.sql`: Creates `generation_logs` table for telemetry tracking, token usage, and request latency monitoring.
- `003_rate_limits_and_circuit_breaker.sql`: Creates `rate_limit_buckets` table for noisy-neighbor rate limiting and `circuit_breaker_state` table for provider health tracking.
- `004_generation_queue_and_byo_key.sql`: Creates `generation_queue` table for async generation jobs and adds `byo_groq_api_key` and `byo_gemini_api_key` columns to `site_profiles`.
- `005_enable_rls.sql`: Enables PostgreSQL Row Level Security (RLS) across all core database tables.
- `006_production_rpcs_and_monthly_reset.sql`: Adds stored procedures for atomic token-bucket checks and `reset_monthly_quotas()` for automated monthly billing resets.
- `007_high_concurrency_10k.sql`: Converts `rate_limit_buckets` to an UNLOGGED table for high write throughput and adds advisory-locked `claim_pending_queue_jobs()` for atomic worker queues.
- `008_allow_nullable_api_key_hash.sql`: Alters `api_key_hash` on `site_profiles` to be nullable and adds `key_prefix` column to support self-serve onboarding before on-demand key minting.
- `009_add_user_id_to_site_profiles.sql`: Adds `user_id UUID REFERENCES auth.users(id)` column to `site_profiles` to bind tenant sites to Supabase Auth accounts.
- `010_rls_policies.sql`: Adds initial RLS SELECT policy restricting authenticated users to reading only site profiles matching their own `auth.uid()`.
- `011_atomic_circuit_breaker_rpcs.sql`: Adds atomic `record_circuit_failure` and `record_circuit_success` PL/pgSQL functions to prevent concurrent race conditions during provider outages.
- `012_atomic_quota_reservation.sql`: Adds atomic `reserve_tenant_quota` and `release_tenant_quota` PL/pgSQL functions to close quota overshooting race conditions under concurrent bursts.
- `013_add_title_to_generation_logs.sql`: Adds `title` text column to `generation_logs` for human-readable article history in tenant dashboards.
- `014_comprehensive_rls_policies.sql`: Extends RLS with strict `UPDATE` and `INSERT` policies on `site_profiles` and tenant-scoped `SELECT` policy on `generation_logs`.
- `015_billing_and_multi_site.sql`: Adds Stripe customer/subscription tracking, plan tiers (`starter`, `pro`, `agency`), and outbound CMS webhook URLs to `site_profiles`.
- `016_add_content_to_generation_logs.sql`: Adds `content TEXT`, `meta_description TEXT`, and `suggested_tags TEXT[]` to `generation_logs` to enable full article inspection, instant copying, and outbound CMS webhook deliveries.

## Known Limitations

The following items are outstanding for full production commercial readiness:
- **Test Framework**: No formal automated test runner (such as Jest, Vitest, or Playwright) is configured in `package.json`; testing relies on standalone verification scripts (`npm test` runs `verify:auth` and `verify:saas`).
- **Live Stripe Keys**: Billing infrastructure (`/api/billing/checkout`, `/api/billing/portal`, `/api/webhooks/stripe`) is fully implemented with test simulation fallback; connecting live credit card billing requires adding live Stripe API keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) in production.
- **Legal Agreements**: `/terms` and `/privacy` are clearly-labeled draft placeholder documents pending formal review by qualified legal and privacy counsel before commercial transactions occur.
