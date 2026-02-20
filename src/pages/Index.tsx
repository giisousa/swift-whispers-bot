import HoverSidebar from "@/components/HoverSidebar";
import { MessageSquare, Zap, Users, TrendingUp, Clock, CheckCircle } from "lucide-react";

const stats = [
  { label: "Tickets Abertos", value: "24", icon: MessageSquare, change: "+3" },
  { label: "Macros Utilizadas", value: "142", icon: Zap, change: "+18" },
  { label: "Agentes Online", value: "8", icon: Users, change: "" },
  { label: "Tempo Médio", value: "4m 32s", icon: Clock, change: "-12%" },
  { label: "Resolvidos Hoje", value: "67", icon: CheckCircle, change: "+5" },
  { label: "Satisfação", value: "94%", icon: TrendingUp, change: "+2%" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HoverSidebar />

      <div className="pl-14 sidebar-transition">
        {/* Header */}
        <header className="border-b border-border px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Painel de Atendimento
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Passe o mouse na lateral esquerda para acessar macros e mensagens
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
                VC
              </div>
            </div>
          </div>
        </header>

        {/* Stats */}
        <main className="p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group rounded-lg border border-border bg-card p-5 hover:border-primary/30 hover:glow-accent sidebar-transition"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {stat.label}
                    </p>
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

          {/* Instructions */}
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

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default Index;
