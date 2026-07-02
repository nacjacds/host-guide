create table guide_blocks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  type text not null check (
    type in ('wifi', 'checkin', 'checkout', 'rules', 'parking', 'appliances', 'custom')
  ),
  title text,
  icon text,
  content jsonb not null default '{}',
  order_index integer not null default 0,
  is_visible boolean not null default true,
  created_at timestamptz not null default now()
);

create index guide_blocks_property_id_idx on guide_blocks(property_id);

alter table guide_blocks enable row level security;
