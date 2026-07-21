-- Lets the host classify what kind of destination a property is in, so AI
-- recommendation search/curation (lib/google-places.ts, lib/claude.ts) can
-- prioritize what actually matters for that kind of place instead of a
-- one-size-fits-all query — e.g. landmarks in a historic city center
-- currently lose to restaurants with thousands of reviews when everything
-- competes on the same rating/review-count signal.
--
-- Defaults to 'urban' so every existing property (Sol Muralla, Carihuela
-- Cristal, Avellana included) keeps today's exact search behavior
-- unchanged until the host (or an admin, manually) reclassifies it.
alter table properties
  add column destination_type text not null default 'urban';

alter table properties
  add constraint properties_destination_type_check
  check (destination_type in ('beach', 'historic_city', 'nature', 'rural', 'urban'));
