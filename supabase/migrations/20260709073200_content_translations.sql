create table content_translations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  block_type text not null,        -- ej: 'wifi', 'checkin', 'rules', 'custom', 'welcome_message'
  block_id text,                    -- id del bloque/elemento concreto si aplica (null si es a nivel propiedad)
  source_locale text not null,      -- idioma original en que escribió el anfitrión, ej 'es'
  target_locale text not null,      -- idioma traducido, ej 'en'
  source_hash text not null,        -- hash del contenido original, para saber si está desactualizado
  translated_content jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(property_id, block_type, block_id, target_locale)
);

create index idx_content_translations_lookup
  on content_translations(property_id, target_locale);

-- Same access pattern as translations_cache: a global system cache, only
-- ever read/written server-side via the service-role client (background
-- save-time generation, and the rare synchronous fallback route), never
-- directly from the browser.
alter table content_translations enable row level security;

create trigger set_content_translations_updated_at
  before update on content_translations
  for each row execute function public.set_updated_at();
