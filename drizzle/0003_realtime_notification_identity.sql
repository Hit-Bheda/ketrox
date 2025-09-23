-- Ensure updates/deletes include full row data for Realtime payloads
-- This helps clients reliably update UI for UPDATE/DELETE events
ALTER TABLE public.notification REPLICA IDENTITY FULL;
