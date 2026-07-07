create table guest_messages (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  name text,
  country text,
  message text not null,
  rating integer not null check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

create index guest_messages_property_id_idx on guest_messages(property_id);

alter table guest_messages enable row level security;

-- Anyone (including anonymous guests) can leave a message on a published
-- property's guest book.
create policy "guest_messages_insert_public"
  on guest_messages for insert
  to anon, authenticated
  with check (
    exists (
      select 1 from properties
      where properties.id = guest_messages.property_id
      and properties.is_published = true
    )
  );

-- Only the host can read messages left on their own properties.
create policy "guest_messages_select_own"
  on guest_messages for select
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = guest_messages.property_id
      and properties.host_id = auth.uid()
    )
  );
