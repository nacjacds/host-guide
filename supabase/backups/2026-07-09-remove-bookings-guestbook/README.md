# Backup: Reservas + Deja tu huella removal

Full data dump of `bookings` and `guest_messages` taken immediately before both
tables were dropped (see migration `20260709100000_drop_bookings_guest_messages.sql`),
as part of removing the Reservations and guest-book review features from WelcoKit.

- `bookings.json` — 0 rows at time of backup.
- `guest_messages.json` — 1 row at time of backup.

To restore either table: re-run its original `create table` migration
(`20260707001000_bookings.sql` + `20260707001100_bookings_guest_language.sql`,
or `20260707000100_guest_messages.sql` + the later RLS-fix migrations), then
insert the rows from the corresponding JSON file here.
