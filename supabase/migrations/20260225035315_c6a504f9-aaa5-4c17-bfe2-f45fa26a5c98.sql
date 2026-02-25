
-- =====================
-- 1. Agent Schedules (Calendário semanal com turnos)
-- =====================
CREATE TYPE public.shift_type AS ENUM ('morning', 'afternoon', 'evening');
CREATE TYPE public.channel_type AS ENUM ('online', 'offline', 'external');
CREATE TYPE public.schedule_status AS ENUM ('draft', 'confirmed');

CREATE TABLE public.agent_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  agent_user_id UUID NOT NULL,
  date DATE NOT NULL,
  shift shift_type NOT NULL,
  channel channel_type NOT NULL,
  status schedule_status NOT NULL DEFAULT 'draft',
  assigned_by UUID,
  suggested_by UUID,
  is_online BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, agent_user_id, date, shift)
);

ALTER TABLE public.agent_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view schedules" ON public.agent_schedules
  FOR SELECT USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Admins can insert schedules" ON public.agent_schedules
  FOR INSERT WITH CHECK (is_workspace_admin(auth.uid(), workspace_id) OR (auth.uid() = suggested_by AND status = 'draft'));

CREATE POLICY "Admins can update schedules" ON public.agent_schedules
  FOR UPDATE USING (is_workspace_admin(auth.uid(), workspace_id) OR (auth.uid() = agent_user_id AND status = 'draft'));

CREATE POLICY "Admins can delete schedules" ON public.agent_schedules
  FOR DELETE USING (is_workspace_admin(auth.uid(), workspace_id));

CREATE TRIGGER update_agent_schedules_updated_at
  BEFORE UPDATE ON public.agent_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_schedules;

-- =====================
-- 2. Knowledge Base (Base de Conhecimento)
-- =====================
CREATE TABLE public.knowledge_articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view articles" ON public.knowledge_articles
  FOR SELECT USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Admins can insert articles" ON public.knowledge_articles
  FOR INSERT WITH CHECK (is_workspace_admin(auth.uid(), workspace_id));

CREATE POLICY "Admins can update articles" ON public.knowledge_articles
  FOR UPDATE USING (is_workspace_admin(auth.uid(), workspace_id));

CREATE POLICY "Admins can delete articles" ON public.knowledge_articles
  FOR DELETE USING (is_workspace_admin(auth.uid(), workspace_id));

CREATE TRIGGER update_knowledge_articles_updated_at
  BEFORE UPDATE ON public.knowledge_articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- 3. Macro Suggestions (Sugestões de macros na base de conhecimento)
-- =====================
CREATE TYPE public.suggestion_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.macro_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.knowledge_articles(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Geral',
  suggested_by UUID NOT NULL,
  status suggestion_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.macro_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view suggestions" ON public.macro_suggestions
  FOR SELECT USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Members can suggest macros" ON public.macro_suggestions
  FOR INSERT WITH CHECK (is_workspace_member(auth.uid(), workspace_id) AND auth.uid() = suggested_by);

CREATE POLICY "Admins can update suggestions" ON public.macro_suggestions
  FOR UPDATE USING (is_workspace_admin(auth.uid(), workspace_id));

CREATE POLICY "Admins can delete suggestions" ON public.macro_suggestions
  FOR DELETE USING (is_workspace_admin(auth.uid(), workspace_id));

-- =====================
-- 4. Action Plans (Plano de Ação)
-- =====================
CREATE TYPE public.plan_status AS ENUM ('active', 'archived', 'plan2', 'cancelled');

CREATE TABLE public.action_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status plan_status NOT NULL DEFAULT 'active',
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view plans" ON public.action_plans
  FOR SELECT USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Admins can insert plans" ON public.action_plans
  FOR INSERT WITH CHECK (is_workspace_admin(auth.uid(), workspace_id));

CREATE POLICY "Admins can update plans" ON public.action_plans
  FOR UPDATE USING (is_workspace_admin(auth.uid(), workspace_id));

CREATE POLICY "Admins can delete plans" ON public.action_plans
  FOR DELETE USING (is_workspace_admin(auth.uid(), workspace_id));

CREATE TRIGGER update_action_plans_updated_at
  BEFORE UPDATE ON public.action_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================
-- 5. Action Plan Items (Items do plano por agente)
-- =====================
CREATE TABLE public.action_plan_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.action_plans(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  agent_user_id UUID NOT NULL,
  agent_name TEXT NOT NULL DEFAULT '',
  ticket_count INTEGER NOT NULL DEFAULT 0,
  tickets_completed INTEGER NOT NULL DEFAULT 0,
  goal TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.action_plan_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view plan items" ON public.action_plan_items
  FOR SELECT USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Admins can insert plan items" ON public.action_plan_items
  FOR INSERT WITH CHECK (is_workspace_admin(auth.uid(), workspace_id));

CREATE POLICY "Admins can update plan items" ON public.action_plan_items
  FOR UPDATE USING (is_workspace_admin(auth.uid(), workspace_id));

CREATE POLICY "Admins can delete plan items" ON public.action_plan_items
  FOR DELETE USING (is_workspace_admin(auth.uid(), workspace_id));

CREATE TRIGGER update_action_plan_items_updated_at
  BEFORE UPDATE ON public.action_plan_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.action_plan_items;
