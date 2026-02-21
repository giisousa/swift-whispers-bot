import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DbMacro {
  id: string;
  title: string;
  category: string;
  content: string;
  shortcut: string | null;
  user_id: string;
  workspace_id: string | null;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export function useMacros(userId: string | undefined, workspaceId: string | undefined) {
  const [macros, setMacros] = useState<DbMacro[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMacros = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("macros")
      .select("*")
      .order("created_at", { ascending: false });

    setMacros((data ?? []) as DbMacro[]);
    setLoading(false);
  }, [userId, workspaceId]);

  useEffect(() => {
    fetchMacros();
  }, [fetchMacros]);

  const createMacro = useCallback(
    async (macro: { title: string; category: string; content: string; shortcut?: string; is_shared: boolean }) => {
      if (!userId) return;
      await supabase.from("macros").insert({
        ...macro,
        user_id: userId,
        workspace_id: macro.is_shared ? workspaceId ?? null : null,
      });
      await fetchMacros();
    },
    [userId, workspaceId, fetchMacros]
  );

  const updateMacro = useCallback(
    async (id: string, updates: Partial<Pick<DbMacro, "title" | "category" | "content" | "shortcut" | "is_shared">>) => {
      await supabase.from("macros").update(updates).eq("id", id);
      await fetchMacros();
    },
    [fetchMacros]
  );

  const deleteMacro = useCallback(
    async (id: string) => {
      await supabase.from("macros").delete().eq("id", id);
      await fetchMacros();
    },
    [fetchMacros]
  );

  const categories = [...new Set(macros.map((m) => m.category))];

  return { macros, categories, loading, createMacro, updateMacro, deleteMacro, refetch: fetchMacros };
}
