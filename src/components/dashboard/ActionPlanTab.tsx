import { useState, useRef } from "react";
import { Plus, Upload, Archive, Play, X, FileSpreadsheet, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActionPlans, type ActionPlan } from "@/hooks/useActionPlans";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Props {
  userId?: string;
  workspaceId?: string;
}

const statusLabels: Record<ActionPlan["status"], string> = {
  active: "Ativo",
  archived: "Arquivado",
  plan2: "Plano 2",
  cancelled: "Cancelado",
};

const statusColors: Record<ActionPlan["status"], string> = {
  active: "bg-success/20 text-success",
  archived: "bg-muted text-muted-foreground",
  plan2: "bg-primary/20 text-primary",
  cancelled: "bg-destructive/20 text-destructive",
};

export default function ActionPlanTab({ userId, workspaceId }: Props) {
  const { plans, items, createPlan, updatePlanStatus, addItem, updateItem, bulkImportItems, fetchItems } = useActionPlans(workspaceId);
  const isAdmin = useIsAdmin(userId, workspaceId);
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [newPlanName, setNewPlanName] = useState("");
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [filterAgent, setFilterAgent] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const activePlan = plans.find((p) => p.id === selectedPlan) || plans.find((p) => p.status === "active");
  const planItems = items.filter((i) => i.plan_id === (activePlan?.id || ""));
  const filteredItems = planItems.filter((i) => !filterAgent || i.agent_name.toLowerCase().includes(filterAgent.toLowerCase()));

  const totalTickets = planItems.reduce((a, i) => a + i.ticket_count, 0);
  const totalCompleted = planItems.reduce((a, i) => a + i.tickets_completed, 0);
  const overallProgress = totalTickets > 0 ? Math.round((totalCompleted / totalTickets) * 100) : 0;

  const handleCreatePlan = async () => {
    if (!newPlanName.trim() || !userId) return;
    const plan = await createPlan(newPlanName.trim(), userId);
    if (plan) setSelectedPlan(plan.id);
    setNewPlanName("");
    setShowNewPlan(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePlan) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split("\n").filter((l) => l.trim());
      const rows = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        return {
          agent_name: cols[0] || "Sem nome",
          ticket_count: parseInt(cols[1]) || 0,
          goal: cols[2] || undefined,
        };
      }).filter((r) => r.agent_name);

      await bulkImportItems(activePlan.id, rows);
      toast({ title: `${rows.length} itens importados` });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      {/* Plan selector + create */}
      <div className="flex items-center gap-2 flex-wrap">
        {plans.map((p) => (
          <button
            key={p.id}
            onClick={() => { setSelectedPlan(p.id); fetchItems(p.id); }}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium sidebar-transition",
              (activePlan?.id === p.id) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            )}
          >
            {p.name}
            <span className={cn("ml-1.5 inline-flex rounded-full px-1.5 py-0.5 text-[9px]", statusColors[p.status])}>
              {statusLabels[p.status]}
            </span>
          </button>
        ))}
        {isAdmin && !showNewPlan && (
          <button onClick={() => setShowNewPlan(true)} className="rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary sidebar-transition">
            <Plus className="h-3 w-3 inline mr-1" />Novo Plano
          </button>
        )}
      </div>

      {showNewPlan && (
        <div className="flex gap-2">
          <input
            placeholder="Nome do plano..."
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreatePlan()}
            className="flex-1 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <button onClick={handleCreatePlan} className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground">Criar</button>
          <button onClick={() => setShowNewPlan(false)} className="px-2 py-1.5 text-xs text-muted-foreground">Cancelar</button>
        </div>
      )}

      {activePlan && (
        <>
          {/* Overall progress */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Progresso Geral</span>
              </div>
              <span className="text-sm font-bold text-foreground">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            <p className="mt-1.5 text-[10px] text-muted-foreground">{totalCompleted} de {totalTickets} tickets concluídos</p>
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div className="flex items-center gap-2 flex-wrap">
              <input type="file" accept=".csv" ref={fileRef} onChange={handleFileUpload} className="hidden" />
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary hover:text-primary sidebar-transition">
                <Upload className="h-3.5 w-3.5" /> Importar CSV
              </button>
              {activePlan.status === "active" && (
                <>
                  <button onClick={() => updatePlanStatus(activePlan.id, "archived")} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                    <Archive className="h-3.5 w-3.5" /> Arquivar
                  </button>
                  <button onClick={() => updatePlanStatus(activePlan.id, "plan2")} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-primary">
                    <Play className="h-3.5 w-3.5" /> Prosseguir (Plano 2)
                  </button>
                  <button onClick={() => updatePlanStatus(activePlan.id, "cancelled")} className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-destructive">
                    <X className="h-3.5 w-3.5" /> Cancelar
                  </button>
                </>
              )}
            </div>
          )}

          {/* Filter */}
          <input
            placeholder="Filtrar por agente..."
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="w-full max-w-xs rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />

          {/* Items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-2 text-left text-muted-foreground font-medium">Agente</th>
                  <th className="py-2 px-2 text-center text-muted-foreground font-medium">Tickets</th>
                  <th className="py-2 px-2 text-center text-muted-foreground font-medium">Concluídos</th>
                  <th className="py-2 px-2 text-center text-muted-foreground font-medium">Progresso</th>
                  <th className="py-2 px-2 text-left text-muted-foreground font-medium">Meta</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const pct = item.ticket_count > 0 ? Math.round((item.tickets_completed / item.ticket_count) * 100) : 0;
                  return (
                    <tr key={item.id} className="border-b border-border/50 hover:bg-secondary/50">
                      <td className="py-2 px-2 font-medium text-foreground">{item.agent_name}</td>
                      <td className="py-2 px-2 text-center text-foreground">{item.ticket_count}</td>
                      <td className="py-2 px-2 text-center">
                        {isAdmin ? (
                          <input
                            type="number"
                            value={item.tickets_completed}
                            onChange={(e) => updateItem(item.id, { tickets_completed: parseInt(e.target.value) || 0 })}
                            className="w-14 rounded border border-border bg-secondary px-1.5 py-0.5 text-center text-foreground focus:border-primary focus:outline-none"
                          />
                        ) : (
                          <span className="text-foreground">{item.tickets_completed}</span>
                        )}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-1.5 flex-1" />
                          <span className={cn("text-[10px] font-medium", pct >= 100 ? "text-success" : "text-muted-foreground")}>{pct}%</span>
                        </div>
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">{item.goal || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground">
              <FileSpreadsheet className="mx-auto h-8 w-8 text-muted-foreground/30 mb-2" />
              Nenhum item no plano. {isAdmin && "Importe uma planilha CSV (agente, tickets, meta)."}
            </div>
          )}
        </>
      )}

      {!activePlan && plans.length === 0 && (
        <p className="py-8 text-center text-xs text-muted-foreground">Nenhum plano de ação criado</p>
      )}
    </div>
  );
}
