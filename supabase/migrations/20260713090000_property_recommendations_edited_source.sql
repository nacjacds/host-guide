-- A host can now edit an AI-curated recommendation's name/description
-- in place instead of only delete-and-recreate. Edited rows move to
-- 'ai_curated_edited' so regeneration (which only ever replaces plain
-- 'ai_curated' rows) leaves them untouched, same as manual entries.
alter table property_recommendations
  drop constraint if exists property_recommendations_source_check;

alter table property_recommendations
  add constraint property_recommendations_source_check
  check (source in ('ai_curated', 'manual', 'ai_curated_edited'));
