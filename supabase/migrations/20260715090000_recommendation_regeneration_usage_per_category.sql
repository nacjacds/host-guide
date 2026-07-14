-- Switches the manual-regeneration quota from a host-wide monthly pool to
-- a per-property, per-category monthly limit (see lib/recommendations/quota.ts).
-- Old rows (no category) are historical usage under the retired model and
-- are simply ignored by the new per-category queries — no backfill needed.
alter table recommendation_regeneration_usage
  add column category text check (
    category in ('attractions', 'restaurants', 'nightlife', 'beaches', 'nature')
  );

-- Supports both queries the new model runs: "does this property have any
-- existing recommendations for category X" (property_recommendations,
-- unaffected by this migration) and "was category X manually regenerated
-- for this property already this month" (this table, filtered by
-- property_id + category + trigger_type + triggered_at).
create index recommendation_regeneration_usage_property_category_idx
  on recommendation_regeneration_usage(property_id, category, trigger_type, triggered_at);
