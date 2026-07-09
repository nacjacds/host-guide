-- Tracks every manual/scheduled regeneration of a property's local
-- recommendations, so the monthly manual-regeneration quota (see
-- lib/plans.ts monthlyRecommendationRegenerations) can be enforced per
-- host account — shared across all of that host's properties, not
-- per-property. 'scheduled' rows (from the cron job) are logged for
-- traceability only and never count against the quota.
--
-- This project has no separate "plans" or "accounts" tables — plan limits
-- live in lib/plans.ts as a hardcoded map, and a "host" (profiles.id) is
-- the account-equivalent unit everywhere else in the schema, so host_id is
-- used here too instead of a plans-table FK.
create table recommendation_regeneration_usage (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references profiles(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  trigger_type text not null default 'manual' check (trigger_type in ('manual', 'scheduled')),
  triggered_at timestamptz not null default now()
);

create index recommendation_regeneration_usage_host_id_idx
  on recommendation_regeneration_usage(host_id, trigger_type, triggered_at);

alter table recommendation_regeneration_usage enable row level security;

create policy "recommendation_regeneration_usage_select_own"
  on recommendation_regeneration_usage for select
  to authenticated
  using (host_id = auth.uid());

create policy "recommendation_regeneration_usage_insert_own"
  on recommendation_regeneration_usage for insert
  to authenticated
  with check (host_id = auth.uid());
