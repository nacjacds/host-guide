-- Root cause of the earlier failed attempts: PostgREST's insert().select()
-- performs an INSERT ... RETURNING under RLS, which requires a SELECT
-- policy on the returned row too — anon has none here (messages are only
-- readable by the host), so the whole request was rejected even though the
-- INSERT's own WITH CHECK passed. Rather than opening up SELECT to anon,
-- align guest_messages with bot_conversations/analytics_events: no
-- anon/authenticated policies at all, writes happen exclusively via the
-- service-role client from /api/guide/guest-messages, which re-validates
-- is_published in application code first.
drop policy if exists "guest_messages_insert_public" on guest_messages;
drop policy if exists "guest_messages_insert_debug" on guest_messages;
revoke insert on guest_messages from anon, authenticated;
