drop policy if exists "guest_messages_insert_public" on guest_messages;

create policy "guest_messages_insert_debug"
  on guest_messages for insert
  to anon, authenticated
  with check (true);
