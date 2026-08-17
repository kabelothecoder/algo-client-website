# Forex Dev Client Portal

A public marketing site plus a private client portal for a freelance forex
software business. Clients submit projects, refine the spec with an AI
assistant, upload proof of payment and watch the build move through stages.
You get an admin side to quote, review payments by hand, post updates and
release files.

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind v4 ·
Supabase (auth + Postgres + storage) · Framer Motion.

---

## Setup

### 1. Create a Supabase project

<https://supabase.com/dashboard> → **New project**. Note the project URL and
anon key from **Project Settings → API**.

### 2. Run the migration

Open the Supabase **SQL Editor**, paste the whole of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and run
it. This creates every table, RLS policy, trigger, RPC and storage bucket.

If you use the Supabase CLI instead:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

```bash
supabase db push
```

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

The anon key is meant to be public — RLS is what protects the data, which is
why every table has policies and no service-role key is used anywhere in this
app.

### 4. Optional: enable the AI intake assistant

Get a free key at <https://console.groq.com/keys> and set `LLM_API_KEY`. Any
OpenAI-compatible endpoint works — change `LLM_BASE_URL` and `LLM_MODEL` to
switch providers. Without a key the rest of the app works fine; the chat just
reports that it isn't configured.

### 5. Run it

```bash
npm run dev
```

### 6. Make yourself the admin

1. Sign up at `/signup` with your own email.
2. Visit **`/admin-setup`** and click *Make me the admin*.

`bootstrap_admin()` only succeeds while no admin exists, so the route locks
itself immediately afterwards. Any further admins must be added by inserting
into `user_roles` from the Supabase dashboard.

---

## How the pieces fit

| Route | Who | What |
|---|---|---|
| `/` | Public | Services, process, published results, active special |
| `/signup`, `/login` | Public | Supabase email/password auth |
| `/dashboard` | Client | Their projects |
| `/dashboard/projects/[id]` | Client | Agreement, AI intake, messages, payment upload, files, history |
| `/admin` | Admin | Stats and the full project table |
| `/admin/projects/[id]` | Admin | Quote, status updates, payment review, deliverables, replies |
| `/admin/specials` | Admin | Promo banner manager |
| `/admin/testimonials` | Admin | Client results manager |
| `/admin-setup` | First user | One-time admin claim |

### Security model

Three independent layers, because any one of them can be bypassed by a
refactor:

1. **`src/proxy.ts`** (Next 16 renamed `middleware` → `proxy`) refreshes the
   session and does a first-pass redirect. This is *convenience*, not
   enforcement — the Next.js docs warn that a matcher change can silently stop
   covering a route or a server action.
2. **`src/lib/auth.ts`** — every protected page and every server action calls
   `requireUser()` or `requireAdmin()`.
3. **Postgres RLS** — the real boundary. Even with a leaked anon key and a
   hand-rolled request, a client can only read their own rows.

Details worth knowing:

- **Roles live in `user_roles`, not on `profiles`.** A client can update their
  own profile row, so an `is_admin` column there would be self-grantable.
- **`has_role()` is `SECURITY DEFINER`** so policies can query `user_roles`
  without recursing into its own policy.
- **Clients cannot self-confirm payments.** The insert policy pins
  `status = 'pending'`; only an admin can update it.
- **Clients cannot move the commercial goalposts.** A trigger
  (`guard_project_update`) rejects any non-admin change to status, price,
  scope, due date or owner.
- **The message thread is append-only.** No update or delete policy exists on
  `project_messages`, so neither side can rewrite history after a dispute.
- **Deliverables are released explicitly.** Files are invisible to the client
  until an admin flips `released`.
- **`/api/ai-intake` requires a session** so nobody can burn your LLM budget.

---

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. <https://vercel.com/new> → import the repo.
3. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `LLM_API_KEY` / `LLM_BASE_URL` / `LLM_MODEL` under **Environment Variables**.
4. Deploy.
5. In Supabase → **Authentication → URL Configuration**, set the Site URL to
   your Vercel domain and add `https://your-domain/auth/callback` to the
   redirect allowlist. Email confirmation links break without this.

---

## Before you go live

- [ ] Replace `SITE.whatsapp` and `SITE.email` in `src/lib/constants.ts`
- [ ] Fix the `R 1,00` placeholder prices in your Meta Business Suite catalog so
      they match what the site says
- [ ] Decide whether email confirmation is on (Supabase → Authentication →
      Providers → Email). It is on by default.
- [ ] Write a real refund and dispute policy and link it from the footer
- [ ] Consider rate-limiting `/api/ai-intake` per user if you open signup widely
- [ ] Get written permission before publishing any client result screenshot

### A note on the risk disclaimer

The landing page carries a risk notice stating that you sell software, not
financial advice, signals or managed accounts. Keep that true. In South Africa,
selling *software* sits differently under FSCA rules than selling *advice,
signals or mentorship* — if you add the mentorship tier from your business
plan, get advice on whether it needs an FSP licence before you launch it.
