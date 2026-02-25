import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, BookOpen, Target, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/hooks/useAuth";
import ScheduleTab from "@/components/dashboard/ScheduleTab";
import KnowledgeTab from "@/components/dashboard/KnowledgeTab";
import ActionPlanTab from "@/components/dashboard/ActionPlanTab";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { workspaces, currentWorkspace, members, loading, createWorkspace, switchWorkspace } = useWorkspaces(user?.id);
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    if (!currentWorkspace) return;
    // Fetch profiles for all workspace members
    const memberIds = members.map((m) => m.user_id);
    if (memberIds.length === 0) return;
    supabase
      .from("profiles")
      .select("*")
      .in("user_id", memberIds)
      .then(({ data }) => setProfiles((data ?? []) as Profile[]));
  }, [currentWorkspace, members]);

  const handleCreateWorkspace = () => {
    const name = prompt("Nome do novo workspace:");
    if (name?.trim()) createWorkspace(name.trim());
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground sidebar-transition">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Gestão do Time</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">Escalas, conhecimento e planos de ação</p>
            </div>
          </div>
          <WorkspaceSwitcher
            workspaces={workspaces}
            current={currentWorkspace}
            profile={profile}
            onSwitch={switchWorkspace}
            onCreate={handleCreateWorkspace}
            onSignOut={signOut}
          />
        </div>
      </header>

      <main className="p-8">
        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="bg-secondary">
            <TabsTrigger value="schedule" className="gap-1.5">
              <CalendarDays className="h-4 w-4" /> Escalas
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-1.5">
              <BookOpen className="h-4 w-4" /> Base de Conhecimento
            </TabsTrigger>
            <TabsTrigger value="action-plan" className="gap-1.5">
              <Target className="h-4 w-4" /> Plano de Ação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <ScheduleTab userId={user?.id} workspaceId={currentWorkspace?.id} members={members} profiles={profiles} />
          </TabsContent>
          <TabsContent value="knowledge">
            <KnowledgeTab userId={user?.id} workspaceId={currentWorkspace?.id} />
          </TabsContent>
          <TabsContent value="action-plan">
            <ActionPlanTab userId={user?.id} workspaceId={currentWorkspace?.id} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
