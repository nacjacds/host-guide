drop policy if exists "block_images_delete_debug" on storage.objects;

-- Storage's authenticated DELETE path appears to also require a SELECT
-- policy on storage.objects to find the row in the first place (the
-- bucket's public=true flag only affects the anonymous /object/public/
-- read path, not authenticated table-level access) — without this,
-- DELETE returned "Access denied" even under a fully permissive USING
-- clause on the delete policy itself.
create policy "block_images_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'block-images'
    and (storage.foldername(name))[1] in (
      select properties.id::text from properties where properties.host_id = auth.uid()
    )
  );

create policy "block_images_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'block-images'
    and (storage.foldername(name))[1] in (
      select properties.id::text from properties where properties.host_id = auth.uid()
    )
  );
