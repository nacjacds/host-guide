create table translations_cache (
  id uuid primary key default gen_random_uuid(),
  source_text_hash text not null,
  source_lang text not null default 'es',
  target_lang text not null,
  translated_text text not null,
  created_at timestamptz not null default now()
);

create unique index translations_cache_hash_lang_idx
  on translations_cache (source_text_hash, target_lang);

alter table translations_cache enable row level security;

-- No public policies: this is a global system cache, only ever accessed
-- server-side through the service-role client from the translate-content
-- API route, never directly from the browser.
