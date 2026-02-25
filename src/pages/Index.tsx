import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Zap, Users, Clock, CheckCircle, TrendingUp, CalendarDays, BookOpen, Target } from "lucide-react";
import HoverSidebar from "@/components/HoverSidebar";
import WorkspaceSwitcher from "@/components/WorkspaceSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { cn } from "@/lib/utils";
import { useState } from "react";

const stats = [
  { label: "Tickets Abertos", value: "24", icon: MessageSquare, change: "+3" },
  { label: "Macros Utilizadas", value: "142", icon: Zap, change: "+18" },
  { label: "Agentes Online", value: "8", icon: Users, change: "" },
  { label: "Tempo Médio", value: "4m 32s", icon: Clock, change: "-12%" },
  { label: "Resolvidos Hoje", value: "67", icon: CheckCircle, change: "+5" },
  { label: "Satisfação", value: "94%", icon: TrendingUp, change: "+2%" },
];

const Index = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { workspaces, currentWorkspace, loading, createWorkspace, switchWorkspace } = useWorkspaces(user?.id);
  const [showNewWs, setShowNewWs] = useState(false);

  useEffect(() => {
    if (!loading && workspaces.length === 0) {
      navigate("/onboarding", { replace: true });
    }
  }, [loading, workspaces.length, navigate]);

  const handleCreateWorkspace = () => {
    const name = prompt("Nome do novo workspace:");
    if (name?.trim()) createWorkspace(name.trim());
  };

  if (loading || workspaces.length === 0) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <HoverSidebar userId={user?.id} workspaceId={currentWorkspace?.id} />

      <div className="pl-14 sidebar-transition">
        <header className="border-b border-border px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Painel de Atendimento</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Passe o mouse na lateral esquerda para acessar macros e mensagens
              </p>
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group rounded-lg border border-border bg-card p-5 hover:border-primary/30 hover:glow-accent sidebar-transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-2.5 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary sidebar-transition">
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
                {stat.change && (
                  <p className={cn("mt-2 text-xs font-medium", stat.change.startsWith("+") || stat.change.startsWith("-") ? "text-success" : "text-muted-foreground")}>
                    {stat.change} hoje
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Quick access to dashboard */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { label: "Escalas", desc: "Calendário semanal de agentes", icon: CalendarDays, tab: "schedule" },
              { label: "Base de Conhecimento", desc: "Orientações internas e macros", icon: BookOpen, tab: "knowledge" },
              { label: "Plano de Ação", desc: "Tickets e progresso em tempo real", icon: Target, tab: "action-plan" },
            ].map((item) => (
              <button
                key={item.tab}
                onClick={() => navigate(`/dashboard?tab=${item.tab}`)}
                className="group rounded-lg border border-border bg-card p-5 text-left hover:border-primary/30 hover:glow-accent sidebar-transition"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-secondary p-2.5 text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary sidebar-transition">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-8 rounded-lg border border-dashed border-border p-6">
            <div className="flex items-center gap-3 text-muted-foreground">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-foreground">Dica rápida</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Passe o mouse na barra lateral para acessar as <strong className="text-foreground">macros</strong> de atendimento e enviar <strong className="text-foreground">mensagens com flags</strong> ao time em tempo real.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
