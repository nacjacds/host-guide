create table bot_conversations (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties(id) on delete cascade,
  guest_phone text not null,
  messages jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index bot_conversations_property_guest_idx
  on bot_conversations(property_id, guest_phone);
create index bot_conversations_guest_phone_idx on bot_conversations(guest_phone);

alter table bot_conversations enable row level security;
