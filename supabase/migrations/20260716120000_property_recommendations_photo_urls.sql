-- Google Places' Text Search / Place Details responses already include a
-- `photos` array (see lib/google-places.ts) — only the first entry was ever
-- used (property_recommendations.photo_url). This adds a column to keep up
-- to a handful of them, for the guest-facing photo lightbox
-- (components/guide/PhotoLightbox.tsx), at no extra Google API cost since
-- the array was already being fetched and discarded past index 0.
--
-- photo_url is kept as-is (still the thumbnail shown on the card) —
-- photo_urls is the fuller list the lightbox navigates, with photo_url
-- always equal to photo_urls[0] when non-empty.
alter table property_recommendations
  add column photo_urls text[] not null default '{}';

-- Backfill existing rows so recommendations generated before this change
-- still have their one known photo available to the lightbox, instead of
-- showing zero photos until the next regeneration.
update property_recommendations
  set photo_urls = array[photo_url]
  where photo_url is not null and photo_urls = '{}';
