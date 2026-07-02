create table recommendations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  category text not null check (
    category in ('restaurant', 'bar', 'supermarket', 'pharmacy', 'transport', 'activity')
  ),
  name text not null,
  description text,
  address text,
  google_place_id text,
  rating numeric(2,1),
  distance_meters integer,
  maps_url text,
  is_ai_generated boolean not null default true,
  is_visible boolean not null default true,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create index recommendations_property_id_idx on recommendations(property_id);

alter table recommendations enable row level security;
