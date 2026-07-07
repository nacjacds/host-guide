alter table guide_blocks add column images jsonb not null default '[]';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('block-images', 'block-images', true, 2097152, array['image/webp'])
on conflict (id) do nothing;

-- Storage path convention is {property_id}/{block_id}/{filename}, so the
-- first path segment tells us which property (and therefore which host)
-- an object belongs to.
create policy "block_images_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'block-images'
    and exists (
      select 1 from properties
      where properties.id::text = (storage.foldername(name))[1]
      and properties.host_id = auth.uid()
    )
  );

create policy "block_images_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'block-images'
    and exists (
      select 1 from properties
      where properties.id::text = (storage.foldername(name))[1]
      and properties.host_id = auth.uid()
    )
  );
