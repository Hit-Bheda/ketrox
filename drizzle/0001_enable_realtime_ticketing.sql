-- Enable Supabase Realtime for ticketing tables
-- This ensures INSERT/UPDATE/DELETE events are published to clients

-- Add tables to the supabase_realtime publication (idempotent if already added)
do $$
begin
  -- ticket
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'ticket'
  ) then
    execute 'alter publication supabase_realtime add table public.ticket';
  end if;

  -- ticket_message
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'ticket_message'
  ) then
    execute 'alter publication supabase_realtime add table public.ticket_message';
  end if;
end $$;


