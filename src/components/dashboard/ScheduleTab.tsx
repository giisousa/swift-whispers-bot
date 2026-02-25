import { useState, useMemo } from "react";
import { format, startOfWeek, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Check, Clock, AlertTriangle, Wifi, WifiOff, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgentSchedules, type AgentSchedule } from "@/hooks/useAgentSchedules";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import type { Profile } from "@/hooks/useAuth";
import type { WorkspaceMember } from "@/hooks/useWorkspaces";
import { useToast } from "@/hooks/use-toast";

interface Props {
  userId?: string;
  workspaceId?: string;
  members: WorkspaceMember[];
  profiles: Profile[];
}

const shiftLabels = { morning: "Manhã", afternoon: "Tarde", evening: "Noite" } as const;
const channelIcons = {
  online: <Wifi className="h-3.5 w-3.5 text-success" />,
  offline: <WifiOff className="h-3.5 w-3.5 text-destructive" />,
  external: <Phone className="h-3.5 w-3.5 text-warning" />,
};
const channelLabels = { online: "Online", offline: "Offline", external: "Externa" };

export default function ScheduleTab({ userId, workspaceId, members, profiles }: Props) {
  const { schedules, upsertSchedule, confirmSchedule, deleteSchedule } = useAgentSchedules(workspaceId);
  const isAdmin = useIsAdmin(userId, workspaceId);
  const { toast } = useToast();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), weekOffset * 7), [weekOffset]);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);

  const getProfileName = (uid: string) => profiles.find((p) => p.user_id === uid)?.display_name || "Agente";

  const getSchedule = (agentId: string, date: Date, shift: AgentSchedule["shift"]) =>
    schedules.find((s) => s.agent_user_id === agentId && s.date === format(date, "yyyy-MM-dd") && s.shift === shift);

  const handleAssign = async (agentId: string, date: Date, shift: AgentSchedule["shift"], channel: AgentSchedule["channel"]) => {
    if (!workspaceId || !userId) return;
    await upsertSchedule({
      workspace_id: workspaceId,
      agent_user_id: agentId,
      date: format(date, "yyyy-MM-dd"),
      shift,
      channel,
      status: isAdmin ? "confirmed" : "draft",
      assigned_by: isAdmin ? userId : null,
      suggested_by: isAdmin ? null : userId,
      is_online: channel === "online",
    });
  };

  const handleConfirm = async (id: string) => {
    if (!userId) return;
    await confirmSchedule(id, userId);
    toast({ title: "Escala confirmada" });
  };

  // Alert: agent not online when scheduled as online
  const offlineAlerts = schedules.filter(
    (s) => s.channel === "online" && !s.is_online && s.status === "confirmed" && s.date === format(new Date(), "yyyy-MM-dd")
  );

  const agentIds = [...new Set(members.map((m) => m.user_id))];

  return (
    <div className="space-y-4">
      {/* Alerts */}
      {isAdmin && offlineAlerts.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertTriangle className="h-4 w-4" />
            Agentes offline no turno agendado como online:
          </div>
          <ul className="mt-1 ml-6 list-disc text-xs text-destructive/80">
            {offlineAlerts.map((a) => (
              <li key={a.id}>{getProfileName(a.agent_user_id)} — {shiftLabels[a.shift]}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button onClick={() => setWeekOffset((o) => o - 1)} className="rounded-md p-1.5 hover:bg-secondary text-muted-foreground">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium text-foreground">
          {format(weekDays[0], "dd MMM", { locale: ptBR })} — {format(weekDays[6], "dd MMM yyyy", { locale: ptBR })}
        </span>
        <button onClick={() => setWeekOffset((o) => o + 1)} className="rounded-md p-1.5 hover:bg-secondary text-muted-foreground">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-2 text-left text-muted-foreground font-medium">Agente</th>
              {weekDays.map((d) => (
                <th key={d.toISOString()} className="py-2 px-1 text-center text-muted-foreground font-medium min-w-[90px]">
                  <div>{format(d, "EEE", { locale: ptBR })}</div>
                  <div className="text-[10px]">{format(d, "dd/MM")}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agentIds.map((agentId) => (
              (["morning", "afternoon", "evening"] as const).map((shift, si) => (
                <tr key={`${agentId}-${shift}`} className={cn("border-b border-border/50", si === 0 && "border-t border-border")}>
                  {si === 0 && (
                    <td rowSpan={3} className="py-2 px-2 font-medium text-foreground align-middle">
                      {getProfileName(agentId)}
                    </td>
                  )}
                  {weekDays.map((day) => {
                    const sched = getSchedule(agentId, day, shift);
                    return (
                      <td key={day.toISOString()} className="py-1 px-1 text-center">
                        {sched ? (
                          <div className={cn(
                            "flex items-center justify-center gap-1 rounded px-1.5 py-1",
                            sched.status === "confirmed" ? "bg-primary/15 border border-primary/30" : "bg-secondary border border-border"
                          )}>
                            {channelIcons[sched.channel]}
                            <span className="text-[10px]">{shiftLabels[shift]}</span>
                            {sched.status === "confirmed" && <Check className="h-3 w-3 text-success" />}
                            {sched.status === "draft" && isAdmin && (
                              <button onClick={() => handleConfirm(sched.id)} className="ml-0.5 text-primary hover:text-primary/80" title="Confirmar">
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                            {sched.status === "draft" && <Clock className="h-3 w-3 text-warning" />}
                          </div>
                        ) : (
                          isAdmin ? (
                            <div className="flex justify-center gap-0.5">
                              {(["online", "offline", "external"] as const).map((ch) => (
                                <button
                                  key={ch}
                                  onClick={() => handleAssign(agentId, day, shift, ch)}
                                  className="rounded p-1 hover:bg-secondary text-muted-foreground/40 hover:text-foreground"
                                  title={`${channelLabels[ch]} — ${shiftLabels[shift]}`}
                                >
                                  {channelIcons[ch]}
                                </button>
                              ))}
                            </div>
                          ) : agentId === userId ? (
                            <div className="flex justify-center gap-0.5">
                              {(["online", "offline", "external"] as const).map((ch) => (
                                <button
                                  key={ch}
                                  onClick={() => handleAssign(agentId, day, shift, ch)}
                                  className="rounded p-1 hover:bg-secondary text-muted-foreground/40 hover:text-foreground"
                                  title={`Sugerir ${channelLabels[ch]}`}
                                >
                                  {channelIcons[ch]}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/30">—</span>
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">{channelIcons.online} Online</span>
        <span className="flex items-center gap-1">{channelIcons.offline} Offline</span>
        <span className="flex items-center gap-1">{channelIcons.external} Tarefa Ext.</span>
        <span className="flex items-center gap-1"><Check className="h-3 w-3 text-success" /> Confirmado</span>
        <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-warning" /> Sugerido</span>
      </div>
    </div>
  );
}
