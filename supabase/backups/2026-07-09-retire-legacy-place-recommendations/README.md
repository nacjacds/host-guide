# Backup: retiring legacy place-list blocks & recommendation categories

Taken 2026-07-09, before migration `20260709100300_retire_legacy_place_recommendations.sql`.

WelcoKit is switching "Qué visitar" / "Dónde comer" / "Ocio nocturno" from
free-text, AI-fabricated `guide_blocks` place lists to a real-data engine
backed by Google Places (`property_recommendations`). At the same time the
standalone `recommendations` table (previously covering
restaurant/bar/supermarket/pharmacy/transport/activity) is trimmed to just
supermarket/pharmacy/transport, since restaurant/bar/activity are now
redundant with the new attractions/restaurants/nightlife categories.

## What's in here

- `guide_blocks.json` — the 2 `guide_blocks` rows of type `restaurants`,
  `nightlife`, or `attractions` that existed at backup time (both on Sol
  Muralla: an empty `nightlife` block with 2 blank place entries, and an
  `attractions` block with a single "Real Alcázar de Sevilla" entry with no
  address/maps_url filled in — placeholder test data, not real host content).
- `recommendations.json` — the 1 `recommendations` row with category
  `restaurant`, `bar`, or `activity` (a manually-added "Bar Canarias" entry
  on Carihuela Cristal).

## Restore

If needed, re-create the pre-trim check constraints (see the migration this
backup precedes for the old constraint definitions) and re-insert the rows
from the JSON files above via the Supabase service-role client.
