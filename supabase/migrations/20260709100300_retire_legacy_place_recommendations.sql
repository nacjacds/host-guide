-- Retires the two overlapping legacy systems now superseded by
-- property_recommendations (see 20260709100100_property_recommendations.sql):
--
-- 1. guide_blocks of type restaurants/nightlife/attractions — free-text
--    place lists, either hand-typed or fabricated by Claude with no real
--    data behind them. Both existing rows (2 total) were backed up to
--    supabase/backups/2026-07-09-retire-legacy-place-recommendations/ —
--    they were placeholder/incomplete test data, not real host content.
--
-- 2. recommendations rows of category restaurant/bar/activity — redundant
--    with the new attractions/restaurants/nightlife categories. The single
--    existing row was backed up alongside the guide_blocks above. The
--    recommendations table itself stays, trimmed to supermarket/pharmacy/
--    transport (practical-needs categories the new system doesn't cover).

delete from guide_blocks where type in ('restaurants', 'nightlife', 'attractions');

alter table guide_blocks drop constraint guide_blocks_type_check;
alter table guide_blocks add constraint guide_blocks_type_check check (
  type in ('wifi', 'checkin', 'checkout', 'rules', 'parking', 'appliances', 'custom', 'emergencias', 'pool', 'drinks')
);

delete from recommendations where category in ('restaurant', 'bar', 'activity');

alter table recommendations drop constraint recommendations_category_check;
alter table recommendations add constraint recommendations_category_check check (
  category in ('supermarket', 'pharmacy', 'transport')
);
