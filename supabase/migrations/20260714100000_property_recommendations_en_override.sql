-- Lets a host write their own English description for a recommendation
-- instead of relying on the automatic Claude translation. Presence of a
-- value here (not a separate boolean) is what marks it as a manual
-- override: the guest-facing read path always prefers this column over the
-- cached content_translations blob, and the translation trigger excludes
-- any row that has one from what it sends to Claude.
alter table property_recommendations add column description_en_override text;
