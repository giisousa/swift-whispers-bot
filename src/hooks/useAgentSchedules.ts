import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AgentSchedule {
  id: string;
  workspace_id: string;
  agent_user_id: string;
  date: string;
  shift: "morning" | "afternoon" | "evening";
  channel: "online" | "offline" | "external";
  status: "draft" | "confirmed";
  assigned_by: string | null;
  suggested_by: string | null;
  is_online: boolean;
  created_at: string;
  updated_at: string;
}

export function useAgentSchedules(workspaceId: string | undefined) {
  const [schedules, setSchedules] = useState<AgentSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("agent_schedules")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("date", { ascending: true });
    setSchedules((data ?? []) as AgentSchedule[]);
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  // Realtime subscription
  useEffect(() => {
    if (!workspaceId) return;
    const channel = supabase
      .channel(`schedules-${workspaceId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "agent_schedules",
        filter: `workspace_id=eq.${workspaceId}`,
      }, () => {
        fetchSchedules();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [workspaceId, fetchSchedules]);

  const upsertSchedule = useCallback(
    async (schedule: Omit<AgentSchedule, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("agent_schedules").upsert(
        schedule as any,
        { onConflict: "workspace_id,agent_user_id,date,shift" }
      );
      if (!error) await fetchSchedules();
      return error;
    },
    [fetchSchedules]
  );

  const confirmSchedule = useCallback(
    async (id: string, assignedBy: string) => {
      await supabase.from("agent_schedules").update({ status: "confirmed", assigned_by: assignedBy } as any).eq("id", id);
      await fetchSchedules();
    },
    [fetchSchedules]
  );

  const deleteSchedule = useCallback(
    async (id: string) => {
      await supabase.from("agent_schedules").delete().eq("id", id);
      await fetchSchedules();
    },
    [fetchSchedules]
  );

  return { schedules, loading, upsertSchedule, confirmSchedule, deleteSchedule, refetch: fetchSchedules };
}
