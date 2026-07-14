-- upsert_content_translation's UPDATE branch never kept source_locale in
-- sync — only the INSERT branch wrote it, so re-translating an existing
-- row (e.g. after a host edits a block) silently left source_locale
-- pointing at whatever it was the first time that row was created. Harmless
-- while every property's source was always "es", but now that
-- properties.language can make a property's source "en" (see
-- lib/translations/constants.ts's resolvePropertySourceLocale), a stale
-- source_locale on an updated row would misrepresent which language the
-- cached translated_content was actually translated FROM.
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
      set source_locale = p_source_locale,
          source_hash = p_source_hash,
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
