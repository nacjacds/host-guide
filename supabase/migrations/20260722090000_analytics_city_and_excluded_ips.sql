-- Adds city alongside the existing country column (both derived from the
-- visitor's IP at request time via lib/geoip.ts — the IP itself is never
-- persisted anywhere, see lib/analytics.ts).
alter table analytics_events
  add column city text;

-- Host-managed list of IPs to exclude entirely from analytics — a visit
-- from any IP in this table is never inserted into analytics_events at
-- all (not counted as a visit, no country/city derived). Superadmin-only,
-- managed from /admin/analytics-ips — same defensive RLS pattern as
-- support_tickets/bot_conversations: no anon/authenticated policy at all,
-- only the service-role client (used by the admin API routes, which gate
-- on isSuperAdmin() server-side) can read or write this table.
create table analytics_excluded_ips (
  id uuid primary key default gen_random_uuid(),
  ip_address text not null unique,
  label text,
  created_at timestamptz not null default now()
);

alter table analytics_excluded_ips enable row level security;
