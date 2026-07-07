create table bookings (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  host_id uuid not null references auth.users(id) on delete cascade,
  guest_name text not null,
  guest_email text,
  guest_phone text,
  checkin_date date not null,
  checkout_date date not null,
  status text not null default 'pending' check (status in ('pending', 'active', 'completed')),
  auto_email_enabled boolean not null default true,
  welcome_email_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index bookings_host_id_idx on bookings(host_id);
create index bookings_property_id_idx on bookings(property_id);

alter table bookings enable row level security;

-- Bookings are only ever created/read/updated by their own host, while
-- authenticated in the dashboard — no anon access needed, so a direct
-- host_id = auth.uid() policy is safe (no RETURNING-on-anon-insert RLS
-- pitfall here, unlike guest_messages).
create policy "bookings_select_own"
  on bookings for select
  to authenticated
  using (host_id = auth.uid());

create policy "bookings_insert_own"
  on bookings for insert
  to authenticated
  with check (host_id = auth.uid());

create policy "bookings_update_own"
  on bookings for update
  to authenticated
  using (host_id = auth.uid());

create policy "bookings_delete_own"
  on bookings for delete
  to authenticated
  using (host_id = auth.uid());
