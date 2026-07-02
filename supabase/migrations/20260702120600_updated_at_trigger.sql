create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_properties_updated_at
  before update on properties
  for each row execute function public.set_updated_at();

create trigger set_bot_conversations_updated_at
  before update on bot_conversations
  for each row execute function public.set_updated_at();
