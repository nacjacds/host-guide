-- Replaces the single English-only description_en_override column with a
-- per-locale JSONB map ({en, fr, it, pt}) — part of i18n Fase 0 (expanding
-- the guide from binary es/en to es/en/fr/it/pt). The old column silently
-- leaked its English text to every non-source locale (see
-- useTranslatedRecommendations.ts before this migration), since nothing
-- checked WHICH locale a guest was viewing before applying it.
alter table property_recommendations
  add column description_overrides jsonb not null default '{}'::jsonb;

update property_recommendations
set description_overrides = jsonb_build_object('en', description_en_override)
where description_en_override is not null and description_en_override != '';

alter table property_recommendations
  drop column description_en_override;
