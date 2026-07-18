-- i18n Fase 1: widen the dashboard's locale from binary es/en to the same
-- 5-locale set as the guest guide (es/en/fr/it/pt). handle_new_user() (see
-- 20260712100000_profiles_dashboard_locale.sql) already just inserts
-- whatever locale string it's given via coalesce — only the CHECK
-- constraint itself needs to change.
alter table profiles
  drop constraint profiles_dashboard_locale_check;

alter table profiles
  add constraint profiles_dashboard_locale_check
  check (dashboard_locale in ('es', 'en', 'fr', 'it', 'pt'));
