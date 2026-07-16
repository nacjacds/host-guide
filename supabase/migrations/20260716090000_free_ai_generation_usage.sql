-- Tracks, per email + recommendation category, whether that email has
-- already consumed its one free first-time AI generation for that
-- category on the Free plan (see lib/recommendations/quota.ts).
--
-- Deliberately NOT keyed by host_id/property_id and has no FK to
-- profiles/auth.users: deleting an account cascades away profiles,
-- properties, and property_recommendations (ON DELETE CASCADE — see
-- app/api/account/route.ts), which would otherwise erase the only
-- evidence that a "first generation" already happened, letting a host
-- delete their account and re-register with the same email for another
-- free generation. Keying on the raw email string instead makes this
-- record survive that cascade entirely.
create table free_ai_generation_usage (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  category text not null,
  used_at timestamptz not null default now(),
  unique (email, category)
);

-- No RLS policies — this table is never read or written by an
-- authenticated user's own client, only server-side via
-- createServiceRoleClient() (same defensive pattern as
-- content_translations/bot_conversations).
alter table free_ai_generation_usage enable row level security;
