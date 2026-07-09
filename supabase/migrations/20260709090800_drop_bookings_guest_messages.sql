-- Removes the Reservations and "Deja tu huella" (guest book reviews)
-- features entirely. Both tables' data was backed up to
-- supabase/backups/2026-07-09-remove-bookings-guestbook/ before this ran.
-- No other table has a foreign key into either of these, so a plain drop
-- (which also drops their RLS policies and indexes automatically) is safe.

drop table if exists bookings cascade;
drop table if exists guest_messages cascade;
