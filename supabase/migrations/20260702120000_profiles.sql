create extension if not exists pgcrypto;

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text,
  phone text,
  plan text not null default 'free' check (plan in ('free', 'basic', 'pro')),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

alter table profiles enable row level security;

-- Creates a profile row automatically whenever a new auth user signs up,
-- since the app has no separate "create profile" step.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
