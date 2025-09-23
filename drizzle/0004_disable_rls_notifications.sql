-- Disable RLS on notification so Realtime can deliver events without Supabase Auth session
-- WARNING: This exposes the notification table to all database roles that can access it.
-- If you prefer to keep RLS, replace this with a permissive SELECT policy for anon/authenticated.
ALTER TABLE public.notification DISABLE ROW LEVEL SECURITY;
