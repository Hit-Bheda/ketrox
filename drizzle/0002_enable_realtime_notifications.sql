-- Enable Supabase Realtime for notification table
-- This ensures INSERT/UPDATE/DELETE events are published to clients

-- Add table to the supabase_realtime publication (idempotent if already added)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notification'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.notification';
  END IF;
END $$;
