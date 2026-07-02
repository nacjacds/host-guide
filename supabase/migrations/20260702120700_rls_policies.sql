-- profiles: a user can only see and manage their own profile
create policy "profiles_select_own"
  on profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- properties: hosts manage their own properties; anyone can read published ones
create policy "properties_select_own"
  on properties for select
  to authenticated
  using (host_id = auth.uid());

create policy "properties_select_published"
  on properties for select
  to anon, authenticated
  using (is_published = true);

create policy "properties_insert_own"
  on properties for insert
  to authenticated
  with check (host_id = auth.uid());

create policy "properties_update_own"
  on properties for update
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

create policy "properties_delete_own"
  on properties for delete
  to authenticated
  using (host_id = auth.uid());

-- guide_blocks: hosts manage blocks on their own properties; anyone can read
-- visible blocks belonging to a published property
create policy "guide_blocks_select_own"
  on guide_blocks for select
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = guide_blocks.property_id
      and properties.host_id = auth.uid()
    )
  );

create policy "guide_blocks_select_public"
  on guide_blocks for select
  to anon, authenticated
  using (
    is_visible = true
    and exists (
      select 1 from properties
      where properties.id = guide_blocks.property_id
      and properties.is_published = true
    )
  );

create policy "guide_blocks_insert_own"
  on guide_blocks for insert
  to authenticated
  with check (
    exists (
      select 1 from properties
      where properties.id = guide_blocks.property_id
      and properties.host_id = auth.uid()
    )
  );

create policy "guide_blocks_update_own"
  on guide_blocks for update
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = guide_blocks.property_id
      and properties.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from properties
      where properties.id = guide_blocks.property_id
      and properties.host_id = auth.uid()
    )
  );

create policy "guide_blocks_delete_own"
  on guide_blocks for delete
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = guide_blocks.property_id
      and properties.host_id = auth.uid()
    )
  );

-- recommendations: same ownership/visibility rules as guide_blocks
create policy "recommendations_select_own"
  on recommendations for select
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = recommendations.property_id
      and properties.host_id = auth.uid()
    )
  );

create policy "recommendations_select_public"
  on recommendations for select
  to anon, authenticated
  using (
    is_visible = true
    and exists (
      select 1 from properties
      where properties.id = recommendations.property_id
      and properties.is_published = true
    )
  );

create policy "recommendations_insert_own"
  on recommendations for insert
  to authenticated
  with check (
    exists (
      select 1 from properties
      where properties.id = recommendations.property_id
      and properties.host_id = auth.uid()
    )
  );

create policy "recommendations_update_own"
  on recommendations for update
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = recommendations.property_id
      and properties.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from properties
      where properties.id = recommendations.property_id
      and properties.host_id = auth.uid()
    )
  );

create policy "recommendations_delete_own"
  on recommendations for delete
  to authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = recommendations.property_id
      and properties.host_id = auth.uid()
    )
  );

-- bot_conversations and places_cache have no policies: they hold guest PII
-- and third-party API caches respectively, and are only ever read/written
-- via the service-role client from server-side routes (webhook, AI routes).
