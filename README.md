# The Service Board

A multi-tenant scheduling and communication app for AA groups, districts, and
H&I committees. Each group gets its own private workspace. Members sign up
for service commitments (meeting chair, co-chair, H&I panels), track trusted
servant terms, post announcements and events, and keep a group conscience
archive.

Not affiliated with or endorsed by Alcoholics Anonymous World Services, Inc.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack build) + **React 19** + TypeScript
- **Tailwind CSS** (v3 — intentionally not upgraded to v4, which is a separate
  rewrite with its own config format; ask if you'd like that done too)
- **Postgres** via [Drizzle ORM](https://orm.drizzle.team/) — works with Neon,
  Supabase, Railway, or any standard Postgres connection string
- Custom email/password auth (bcrypt + signed JWT cookie) — no third-party
  auth dependency required
- Deploys to **Vercel**

## 1. Get a Postgres database

Vercel no longer offers its own managed Postgres; the easiest path is
[Neon](https://neon.tech) (free tier available) through the Vercel Marketplace:

1. In your Vercel project, go to **Storage → Browse Marketplace → Neon** (or
   any Postgres provider you prefer) and create a database.
2. Copy the connection string it gives you — that's your `DATABASE_URL`.

You can also point this at any other Postgres host (Supabase, Railway,
RDS, your own server) — nothing here is Neon-specific.

## 2. Local setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

- `DATABASE_URL` — your Postgres connection string
- `SESSION_SECRET` — a long random string (`openssl rand -hex 32`)
- `CRON_SECRET` — another random string, used to protect the cron endpoint
- `APP_URL` — `http://localhost:3000` for local dev

Create the database tables:

```bash
npm run db:migrate
```

(Optional) seed a demo group you can sign into right away:

```bash
npm run db:seed
```

Then run the app:

```bash
npm run dev
```

Visit `http://localhost:3000`, click **Start a group**, and you're in as
that group's first admin.

## 3. Deploy to Vercel

1. Push this code to a GitHub repo.
2. In Vercel, **Add New Project** → import that repo.
3. Add the environment variables from your `.env` (`DATABASE_URL`,
   `SESSION_SECRET`, `CRON_SECRET`, and set `APP_URL` to your Vercel URL).
4. Deploy.
5. Run the migration against your production database once, either by
   pointing your local `.env` at the production `DATABASE_URL` temporarily
   and running `npm run db:migrate`, or via Vercel's CLI:
   ```bash
   vercel env pull .env.production.local
   DATABASE_URL=<prod-url> npm run db:migrate
   ```

That's it — your group can sign up at `https://yourapp.vercel.app/signup`.

### Keeping schedules rolling forward automatically

`vercel.json` includes a weekly cron job that hits
`/api/cron/generate-occurrences` to extend every group's schedule 8 weeks out,
so admins don't have to remember to do it manually. Vercel Cron is enabled
automatically on deploy; no extra setup needed beyond setting `CRON_SECRET`.
Admins can also trigger this manually anytime from **Admin → Meetings/H&I →
"Roll schedule forward."**

## How multi-tenancy works

- Every group ("org") has its own `orgs` row, an invite code, and its own
  members, meetings, posts, etc. — all scoped by `org_id`.
- A person can belong to more than one group (e.g. home group + H&I
  committee) under a single login; `/switch-org` lets them pick which one
  they're currently viewing.
- Every Server Action re-derives the current org from the signed-in session
  (never from a client-supplied ID alone), so one group's data can't leak
  into another's.

## Roles

- **Admin** — full control: org settings, invite code, roles, everything a
  coordinator can do.
- **Coordinator** — manages meetings/H&I, schedules, announcements, events,
  and group conscience, but not org settings or member roles.
- **Member** — views schedules, claims/releases open commitments, requests
  covers, RSVPs to events, and edits their own profile/privacy settings.

## Privacy & anonymity defaults

- Members are shown by display name (e.g. "Maria S.") by default. Full name
  and phone are hidden from other members unless the member opts in, under
  **Profile**.
- Group conscience votes record yes/no/abstain totals only, not who voted
  which way, unless an admin turns on **named voting** in Org Settings.
- Sobriety dates are private by default; sharing is opt-in per member.

## Extending this

A few things intentionally left simple, with notes on how to grow them:

- **Email reminders**: not wired up, to avoid requiring an email provider
  out of the box. To add them, create an account with
  [Resend](https://resend.com) (or similar), add an API call inside
  `generateOccurrencesForOrg` or a new scheduled route, and send a reminder a
  few days before each member's upcoming `assignment`.
- **Custom domains per group**: Vercel supports this well (see "Vercel for
  Platforms" in their docs) if you want `tuesdaynightgroup.yourapp.com`
  style URLs later. The current app already isolates data by org, so this is
  an infrastructure change, not a data model change.
- **District-wide announcements**: announcements currently belong to one
  org. If you run a district umbrella, the simplest extension is a
  `district_id` on `orgs` and an optional broadcast flag on `posts`.

## Project structure

```
src/
  db/            Drizzle schema, connection, migration runner, seed script
  lib/           auth, tenant/session helpers, date utils, read-only queries
  actions/       Server Actions (mutations), grouped by feature
  components/    UI primitives, nav, and feature-specific components
  app/           Next.js App Router pages
```
