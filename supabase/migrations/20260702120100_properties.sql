create table properties (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  address text,
  slug text unique not null,
  cover_image_url text,
  accent_color text not null default '#1B4F72',
  host_tone text not null default 'friendly' check (host_tone in ('friendly', 'formal')),
  language text not null default 'es',
  whatsapp_number text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index properties_host_id_idx on properties(host_id);
create index properties_slug_idx on properties(slug);

alter table properties enable row level security;
