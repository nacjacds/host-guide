-- Personalized, date-scoped guest links (e.g. "here's your link for your
-- stay Jul 20-25") — a separate mechanism from the generic slug-based
-- guide link (properties.slug, used by "Ver guía" and the printable QR),
-- which never expires and is untouched by this table. See
-- app/guide/link/[token] for the guest-facing route (resolved via
-- lib/guestLinks.ts) and components/editor/GuestLinksDialog.tsx for how a
-- host generates one.
--
-- id is the token itself (used directly in the URL) rather than a
-- separate column — same reasoning as every other "id doubles as the
-- public identifier" table in this schema (properties.slug aside).
create table guest_guide_links (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  checkin_date date not null,
  checkout_date date not null,
  created_at timestamptz not null default now()
);

create index guest_guide_links_property_id_idx on guest_guide_links(property_id);

alter table guest_guide_links enable row level security;

-- Host CRUD, scoped to their own properties via a join — properties itself
-- has no "list of collaborators" concept, so this mirrors the ownership
-- check already used by storage policies (first path segment == host_id)
-- rather than a simpler host_id column here, since this table is reached
-- through the property, not independently.
create policy "guest_guide_links_select_own"
  on guest_guide_links for select
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = guest_guide_links.property_id
      and properties.host_id = auth.uid()
    )
  );

create policy "guest_guide_links_insert_own"
  on guest_guide_links for insert
  to authenticated
  with check (
    exists (
      select 1 from properties
      where properties.id = guest_guide_links.property_id
      and properties.host_id = auth.uid()
    )
  );

create policy "guest_guide_links_delete_own"
  on guest_guide_links for delete
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = guest_guide_links.property_id
      and properties.host_id = auth.uid()
    )
  );

-- Deliberately no public/anon select policy — the guest-facing route
-- (app/guide/link/[token]) always reads this via
-- createServiceRoleClient(), same defensive pattern as
-- content_translations/bot_conversations.
