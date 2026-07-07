drop policy if exists "block_images_insert_own" on storage.objects;

create policy "block_images_insert_debug"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'block-images');
