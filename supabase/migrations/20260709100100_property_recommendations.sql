-- AI-curated local recommendations backed by real Google Places data:
-- attractions, restaurants, nightlife, and (when detected nearby) beaches
-- and nature. Replaces the old free-text, AI-fabricated place lists that
-- used to live inside guide_blocks.content for these categories.
create table property_recommendations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  category text not null check (
    category in ('attractions', 'restaurants', 'nightlife', 'beaches', 'nature')
  ),
  place_id text,
  name text not null,
  address text,
  lat numeric,
  lng numeric,
  distance_meters integer,
  distance_walking_minutes integer,
  maps_url text,
  rating numeric,
  photo_url text,
  source text not null default 'ai_curated' check (source in ('ai_curated', 'manual')),
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index property_recommendations_property_id_idx on property_recommendations(property_id);
create index property_recommendations_category_idx on property_recommendations(property_id, category);

alter table property_recommendations enable row level security;

create policy "property_recommendations_select_own"
  on property_recommendations for select
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = property_recommendations.property_id
      and properties.host_id = auth.uid()
    )
  );

create policy "property_recommendations_select_public"
  on property_recommendations for select
  to anon, authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = property_recommendations.property_id
      and properties.is_published = true
    )
  );

create policy "property_recommendations_insert_own"
  on property_recommendations for insert
  to authenticated
  with check (
    exists (
      select 1 from properties
      where properties.id = property_recommendations.property_id
      and properties.host_id = auth.uid()
    )
  );

create policy "property_recommendations_update_own"
  on property_recommendations for update
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = property_recommendations.property_id
      and properties.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from properties
      where properties.id = property_recommendations.property_id
      and properties.host_id = auth.uid()
    )
  );

create policy "property_recommendations_delete_own"
  on property_recommendations for delete
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = property_recommendations.property_id
      and properties.host_id = auth.uid()
    )
  );

-- Tracks when a property's recommendations were last (re)generated, and
-- which optional categories (beaches, nature) were actually detected nearby
-- — so the UI never renders an empty "Playas" tile for an inland property.
create table property_recommendation_meta (
  property_id uuid primary key references properties(id) on delete cascade,
  last_generated_at timestamptz,
  categories_detected text[] not null default '{}'
);

alter table property_recommendation_meta enable row level security;

create policy "property_recommendation_meta_select_own"
  on property_recommendation_meta for select
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = property_recommendation_meta.property_id
      and properties.host_id = auth.uid()
    )
  );

create policy "property_recommendation_meta_select_public"
  on property_recommendation_meta for select
  to anon, authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = property_recommendation_meta.property_id
      and properties.is_published = true
    )
  );

-- Inserts/updates only ever happen via the service-role client (generation
-- runs server-side in a route/cron job, not on behalf of a specific
-- authenticated request) — no insert/update policy needed for `authenticated`.
