-- Caches Google Places responses per address+category to avoid paying for
-- repeat API calls when several hosts' properties share a location.
create table places_cache (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  category text not null,
  results jsonb not null,
  created_at timestamptz not null default now()
);

create unique index places_cache_address_category_idx
  on places_cache(address, category);

alter table places_cache enable row level security;
