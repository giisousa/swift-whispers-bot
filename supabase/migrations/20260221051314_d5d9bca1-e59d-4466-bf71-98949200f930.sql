
-- Fix team_messages RLS to use workspace membership
DROP POLICY IF EXISTS "Anyone can insert messages" ON public.team_messages;
DROP POLICY IF EXISTS "Anyone can read messages" ON public.team_messages;
DROP POLICY IF EXISTS "Anyone can update messages" ON public.team_messages;

CREATE POLICY "Workspace members can read messages" ON public.team_messages
  FOR SELECT USING (
    workspace_id IS NULL OR public.is_workspace_member(auth.uid(), workspace_id)
  );
CREATE POLICY "Authenticated users can insert messages" ON public.team_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own messages" ON public.team_messages
  FOR UPDATE USING (auth.uid() = user_id);
