create table support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('bug', 'feature_request', 'question')),
  subject text not null,
  description text not null,
  screenshot_url text,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now()
);

create index support_tickets_user_id_idx on support_tickets(user_id);
create index support_tickets_status_idx on support_tickets(status);

alter table support_tickets enable row level security;

create policy "support_tickets_insert_own"
  on support_tickets for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "support_tickets_select_own"
  on support_tickets for select
  to authenticated
  using (user_id = auth.uid());

-- The admin panel (/admin/tickets) reads and updates every ticket via the
-- service-role client, guarded by lib/admin.ts's isSuperAdmin check in the
-- API routes rather than by RLS — same pattern as analytics_events.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'support-screenshots', 'support-screenshots', true, 2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "support_screenshots_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'support-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "support_screenshots_select_own"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'support-screenshots'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
