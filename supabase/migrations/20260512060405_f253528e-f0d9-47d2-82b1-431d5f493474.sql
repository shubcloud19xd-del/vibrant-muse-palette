
-- 1. Fix privilege escalation: only admins can add members
DROP POLICY IF EXISTS "admin add members" ON public.organization_members;
CREATE POLICY "admin add members"
ON public.organization_members
FOR INSERT
TO authenticated
WITH CHECK (public.is_org_admin(organization_id, auth.uid()));

-- 2. Fix mutable search_path on touch_updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
begin new.updated_at = now(); return new; end;
$function$;

-- 3. Revoke EXECUTE on internal SECURITY DEFINER helpers from clients.
-- These are only called from RLS policies / triggers, never directly via PostgREST.
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.is_org_admin(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.user_can_access_task(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.user_can_access_project(uuid, uuid) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.add_owner_as_admin() FROM anon, authenticated, public;
