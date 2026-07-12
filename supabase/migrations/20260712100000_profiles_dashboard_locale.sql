alter table profiles
  add column dashboard_locale text not null default 'es' check (dashboard_locale in ('es', 'en'));

-- Persist the language a visitor already chose on the landing/register page
-- (passed as options.data.locale in the signUp() call) as their initial
-- dashboard_locale, instead of always defaulting to Spanish.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, dashboard_locale)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'locale', 'es')
  );
  return new;
end;
$$;
