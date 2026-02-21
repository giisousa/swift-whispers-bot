import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Workspace {
  id: string;
  name: string;
  created_by: string;
  zendesk_subdomain: string | null;
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export function useWorkspaces(userId: string | undefined) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("workspaces")
      .select("*")
      .order("created_at", { ascending: true });

    if (data && data.length > 0) {
      setWorkspaces(data as Workspace[]);
      const stored = localStorage.getItem("current_workspace_id");
      const found = data.find((w) => w.id === stored);
      setCurrentWorkspace((found ?? data[0]) as Workspace);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (!currentWorkspace) return;
    localStorage.setItem("current_workspace_id", currentWorkspace.id);

    supabase
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", currentWorkspace.id)
      .then(({ data }) => setMembers((data ?? []) as WorkspaceMember[]));
  }, [currentWorkspace]);

  const createWorkspace = useCallback(
    async (name: string) => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("workspaces")
        .insert({ name, created_by: userId })
        .select()
        .single();
      if (data) {
        await fetchWorkspaces();
        setCurrentWorkspace(data as Workspace);
      }
      return { data, error };
    },
    [userId, fetchWorkspaces]
  );

  const switchWorkspace = useCallback((ws: Workspace) => {
    setCurrentWorkspace(ws);
  }, []);

  return {
    workspaces,
    currentWorkspace,
    members,
    loading,
    createWorkspace,
    switchWorkspace,
    refetch: fetchWorkspaces,
  };
}
