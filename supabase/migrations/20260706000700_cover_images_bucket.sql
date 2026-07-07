insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cover-images', 'cover-images', true, 3145728, array['image/jpeg'])
on conflict (id) do nothing;

-- Storage path convention is {property_id}/cover.jpg, so the first path
-- segment tells us which property (and therefore which host) an object
-- belongs to. Mirrors the block-images policies, including separate
-- update/select policies since upsert uploads and deletes both require them.
create policy "cover_images_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'cover-images'
    and (storage.foldername(name))[1] in (
      select properties.id::text from properties where properties.host_id = auth.uid()
    )
  );

create policy "cover_images_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'cover-images'
    and (storage.foldername(name))[1] in (
      select properties.id::text from properties where properties.host_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'cover-images'
    and (storage.foldername(name))[1] in (
      select properties.id::text from properties where properties.host_id = auth.uid()
    )
  );

create policy "cover_images_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'cover-images'
    and (storage.foldername(name))[1] in (
      select properties.id::text from properties where properties.host_id = auth.uid()
    )
  );

create policy "cover_images_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'cover-images'
    and (storage.foldername(name))[1] in (
      select properties.id::text from properties where properties.host_id = auth.uid()
    )
  );
