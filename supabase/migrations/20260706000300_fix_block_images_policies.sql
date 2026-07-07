drop policy if exists "block_images_insert_debug2" on storage.objects;
drop policy if exists "block_images_delete_own" on storage.objects;

-- Storage path convention is {property_id}/{block_id}/{filename}, so the
-- first path segment tells us which property (and therefore which host)
-- an object belongs to. Verified empirically that this IN-subquery form
-- works under storage.objects RLS where an equivalent correlated EXISTS
-- form was rejecting valid owners.
create policy "block_images_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
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
