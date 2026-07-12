-- Host-facing "delete property" becomes a soft delete (see
-- DELETE /api/properties/[id]) so a property can be restored by a super
-- admin instead of being unrecoverable. deleted_by_host_plan captures the
-- host's plan (profiles.plan) at the moment of deletion — subscriptions
-- are account-level (profiles.stripe_customer_id), not per-property, so
-- this is the closest meaningful "was there an active subscription to
-- review" signal, kept on the row itself rather than only in logs.
alter table properties
  add column deleted_at timestamptz,
  add column deleted_by_host_plan text;

create index properties_deleted_at_idx on properties(deleted_at) where deleted_at is not null;

-- Defense in depth: even if a future public-facing query forgets an
-- explicit deleted_at filter, RLS itself must never serve a soft-deleted
-- property's data to a guest. Soft-delete intentionally never touches
-- is_published (so a super-admin restore is a pure "clear deleted_at",
-- with no side effect on the property's prior publish state) — instead
-- every "_select_public"-style policy that cascades off
-- properties.is_published is extended to also require deleted_at is null.
drop policy if exists "properties_select_published" on properties;
create policy "properties_select_published"
  on properties for select
  to anon, authenticated
  using (is_published = true and deleted_at is null);

drop policy if exists "guide_blocks_select_public" on guide_blocks;
create policy "guide_blocks_select_public"
  on guide_blocks for select
  to anon, authenticated
  using (
    is_visible = true
    and exists (
      select 1 from properties
      where properties.id = guide_blocks.property_id
      and properties.is_published = true
      and properties.deleted_at is null
    )
  );

drop policy if exists "recommendations_select_public" on recommendations;
create policy "recommendations_select_public"
  on recommendations for select
  to anon, authenticated
  using (
    is_visible = true
    and exists (
      select 1 from properties
      where properties.id = recommendations.property_id
      and properties.is_published = true
      and properties.deleted_at is null
    )
  );

drop policy if exists "property_recommendations_select_public" on property_recommendations;
create policy "property_recommendations_select_public"
  on property_recommendations for select
  to anon, authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = property_recommendations.property_id
      and properties.is_published = true
      and properties.deleted_at is null
    )
  );

drop policy if exists "property_recommendation_meta_select_public" on property_recommendation_meta;
create policy "property_recommendation_meta_select_public"
  on property_recommendation_meta for select
  to anon, authenticated
  using (
    exists (
      select 1 from properties
      where properties.id = property_recommendation_meta.property_id
      and properties.is_published = true
      and properties.deleted_at is null
    )
  );
