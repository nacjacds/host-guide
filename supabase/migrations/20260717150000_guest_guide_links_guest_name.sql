-- Optional host-facing label for a guest link (e.g. "María García") shown
-- next to the stay dates in the "Enlaces para huéspedes" list — purely for
-- the host to tell links apart, never surfaced on the guest-facing route.
alter table guest_guide_links add column guest_name text;
