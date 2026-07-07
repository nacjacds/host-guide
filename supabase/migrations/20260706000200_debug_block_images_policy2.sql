drop policy if exists "block_images_insert_debug" on storage.objects;

create policy "block_images_insert_debug2"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'block-images'
    and (storage.foldername(name))[1] in (
      select properties.id::text from properties where properties.host_id = auth.uid()
    )
  );
