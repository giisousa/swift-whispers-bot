import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin(userId: string | undefined, workspaceId: string | undefined) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!userId || !workspaceId) return;
    supabase.rpc("is_workspace_admin", { _user_id: userId, _workspace_id: workspaceId })
      .then(({ data }) => setIsAdmin(!!data));
  }, [userId, workspaceId]);

  return isAdmin;
}
