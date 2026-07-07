create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  event_type text not null check (event_type in ('guide_opened', 'section_viewed', 'whatsapp_clicked')),
  section text,
  country text,
  created_at timestamptz not null default now()
);

create index analytics_events_property_id_idx on analytics_events(property_id);
create index analytics_events_created_at_idx on analytics_events(created_at);

alter table analytics_events enable row level security;

-- Events are written server-side via the service-role client only (see
-- lib/analytics.ts) — no anon/authenticated insert policy is needed, but we
-- still gate select so only the host can ever read their own stats.
create policy "analytics_events_select_own"
  on analytics_events for select
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = analytics_events.property_id
      and properties.host_id = auth.uid()
    )
  );
