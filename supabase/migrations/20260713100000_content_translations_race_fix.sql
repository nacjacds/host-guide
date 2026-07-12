-- Two concurrent calls to translateContent() for the same
-- (property_id, block_type, target_locale) with block_id IS NULL could
-- both see "no cached row yet" and both insert — a plain UNIQUE
-- constraint treats every NULL as distinct from every other NULL, so it
-- never caught this. Observed in production: nightlife/restaurants on
-- Sol Muralla each got two rows ~200ms apart, same source_hash but
-- different Claude-generated wording (Claude isn't deterministic).

-- Deduplicate existing rows first (required before adding the unique
-- index below, which would otherwise fail on the existing duplicates) —
-- keep the most recently updated row per (property_id, block_type,
-- target_locale) among the null-block_id rows.
delete from content_translations t
using (
  select id,
    row_number() over (
      partition by property_id, block_type, target_locale
      order by updated_at desc, created_at desc
    ) as rn
  from content_translations
  where block_id is null
) ranked
where t.id = ranked.id and ranked.rn > 1;

-- Closes the gap: a partial unique index specifically for the
-- null-block_id case (property-level translations — welcome_message and
-- recommendation categories), since the existing
-- unique(property_id, block_type, block_id, target_locale) constraint
-- never applied to it.
create unique index content_translations_null_block_id_uniq
  on content_translations (property_id, block_type, target_locale)
  where block_id is null;

-- Atomic upsert, safe under concurrent calls for the same key. The
-- previous approach (select in application code, then insert-or-update)
-- has a check-then-act race: two concurrent calls can both see "no
-- existing row" before either has written. This retries on
-- unique_violation instead, so a losing concurrent insert falls back to
-- reading (or updating) the winning row rather than ever producing a
-- second one.
create or replace function public.upsert_content_translation(
  p_property_id uuid,
  p_block_type text,
  p_block_id text,
  p_source_locale text,
  p_target_locale text,
  p_source_hash text,
  p_translated_content jsonb
)
returns jsonb
language plpgsql
security definer set search_path = public
as $$
declare
  v_existing_hash text;
  v_existing_content jsonb;
begin
  loop
    if p_block_id is null then
      select source_hash, translated_content into v_existing_hash, v_existing_content
      from content_translations
      where property_id = p_property_id and block_type = p_block_type
        and block_id is null and target_locale = p_target_locale;
    else
      select source_hash, translated_content into v_existing_hash, v_existing_content
      from content_translations
      where property_id = p_property_id and block_type = p_block_type
        and block_id = p_block_id and target_locale = p_target_locale;
    end if;

    if found then
      if v_existing_hash = p_source_hash then
        return v_existing_content;
      end if;
      update content_translations
      set source_hash = p_source_hash,
          translated_content = p_translated_content,
          updated_at = now()
      where property_id = p_property_id and block_type = p_block_type
        and target_locale = p_target_locale
        and ((p_block_id is null and block_id is null) or block_id = p_block_id);
      return p_translated_content;
    end if;

    begin
      insert into content_translations
        (property_id, block_type, block_id, source_locale, target_locale, source_hash, translated_content)
      values
        (p_property_id, p_block_type, p_block_id, p_source_locale, p_target_locale, p_source_hash, p_translated_content);
      return p_translated_content;
    exception when unique_violation then
      -- A concurrent call won the race between our select and insert —
      -- loop back and read (or update) their row instead of erroring.
      continue;
    end;
  end loop;
end;
$$;
