drop policy if exists "block_images_delete_own" on storage.objects;

create policy "block_images_delete_debug"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'block-images');
