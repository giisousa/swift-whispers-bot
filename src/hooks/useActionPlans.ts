import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ActionPlan {
  id: string;
  workspace_id: string;
  name: string;
  status: "active" | "archived" | "plan2" | "cancelled";
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ActionPlanItem {
  id: string;
  plan_id: string;
  workspace_id: string;
  agent_user_id: string;
  agent_name: string;
  ticket_count: number;
  tickets_completed: number;
  goal: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useActionPlans(workspaceId: string | undefined) {
  const [plans, setPlans] = useState<ActionPlan[]>([]);
  const [items, setItems] = useState<ActionPlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("action_plans")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    setPlans((data ?? []) as ActionPlan[]);
    setLoading(false);
  }, [workspaceId]);

  const fetchItems = useCallback(async (planId?: string) => {
    if (!workspaceId) return;
    let query = supabase.from("action_plan_items").select("*").eq("workspace_id", workspaceId);
    if (planId) query = query.eq("plan_id", planId);
    const { data } = await query.order("agent_name", { ascending: true });
    setItems((data ?? []) as ActionPlanItem[]);
  }, [workspaceId]);

  useEffect(() => {
    fetchPlans();
    fetchItems();
  }, [fetchPlans, fetchItems]);

  // Realtime for items
  useEffect(() => {
    if (!workspaceId) return;
    const channel = supabase
      .channel(`plan-items-${workspaceId}`)
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "action_plan_items",
        filter: `workspace_id=eq.${workspaceId}`,
      }, () => { fetchItems(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [workspaceId, fetchItems]);

  const createPlan = useCallback(
    async (name: string, createdBy: string) => {
      if (!workspaceId) return;
      const { data } = await supabase.from("action_plans").insert({
        name, workspace_id: workspaceId, created_by: createdBy,
      } as any).select().single();
      await fetchPlans();
      return data as ActionPlan | null;
    },
    [workspaceId, fetchPlans]
  );

  const updatePlanStatus = useCallback(
    async (id: string, status: ActionPlan["status"]) => {
      await supabase.from("action_plans").update({ status } as any).eq("id", id);
      await fetchPlans();
    },
    [fetchPlans]
  );

  const addItem = useCallback(
    async (item: Omit<ActionPlanItem, "id" | "created_at" | "updated_at">) => {
      await supabase.from("action_plan_items").insert(item as any);
      await fetchItems();
    },
    [fetchItems]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<Pick<ActionPlanItem, "ticket_count" | "tickets_completed" | "goal" | "notes">>) => {
      await supabase.from("action_plan_items").update(updates).eq("id", id);
      await fetchItems();
    },
    [fetchItems]
  );

  const bulkImportItems = useCallback(
    async (planId: string, rows: { agent_name: string; agent_user_id?: string; ticket_count: number; goal?: string }[]) => {
      if (!workspaceId) return;
      const inserts = rows.map((r) => ({
        plan_id: planId,
        workspace_id: workspaceId,
        agent_user_id: r.agent_user_id || "00000000-0000-0000-0000-000000000000",
        agent_name: r.agent_name,
        ticket_count: r.ticket_count,
        tickets_completed: 0,
        goal: r.goal || null,
      }));
      await supabase.from("action_plan_items").insert(inserts as any);
      await fetchItems();
    },
    [workspaceId, fetchItems]
  );

  return {
    plans, items, loading,
    createPlan, updatePlanStatus, addItem, updateItem, bulkImportItems,
    fetchItems, refetch: () => { fetchPlans(); fetchItems(); },
  };
}
