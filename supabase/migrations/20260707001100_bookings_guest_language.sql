alter table bookings
  add column guest_language text not null default 'es' check (guest_language in ('es', 'en'));
