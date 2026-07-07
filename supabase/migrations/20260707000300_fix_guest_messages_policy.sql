drop policy if exists "guest_messages_insert_public" on guest_messages;

-- Same empirical finding as block-images/cover-images: a correlated EXISTS
-- subquery against another RLS-protected table is rejected here even for
-- rows that satisfy it, while the equivalent IN-subquery form works.
create policy "guest_messages_insert_public"
  on guest_messages for insert
  to anon, authenticated
  with check (
    property_id in (
      select id from properties where properties.is_published = true
    )
  );
