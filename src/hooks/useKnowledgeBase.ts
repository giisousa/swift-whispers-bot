import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface KnowledgeArticle {
  id: string;
  workspace_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MacroSuggestion {
  id: string;
  article_id: string;
  workspace_id: string;
  title: string;
  content: string;
  category: string;
  suggested_by: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export function useKnowledgeBase(workspaceId: string | undefined) {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [suggestions, setSuggestions] = useState<MacroSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("knowledge_articles")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    setArticles((data ?? []) as KnowledgeArticle[]);
    setLoading(false);
  }, [workspaceId]);

  const fetchSuggestions = useCallback(async () => {
    if (!workspaceId) return;
    const { data } = await supabase
      .from("macro_suggestions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    setSuggestions((data ?? []) as MacroSuggestion[]);
  }, [workspaceId]);

  useEffect(() => {
    fetchArticles();
    fetchSuggestions();
  }, [fetchArticles, fetchSuggestions]);

  const createArticle = useCallback(
    async (article: { title: string; content: string; created_by: string }) => {
      if (!workspaceId) return;
      await supabase.from("knowledge_articles").insert({ ...article, workspace_id: workspaceId } as any);
      await fetchArticles();
    },
    [workspaceId, fetchArticles]
  );

  const updateArticle = useCallback(
    async (id: string, updates: { title?: string; content?: string }) => {
      await supabase.from("knowledge_articles").update(updates).eq("id", id);
      await fetchArticles();
    },
    [fetchArticles]
  );

  const deleteArticle = useCallback(
    async (id: string) => {
      await supabase.from("knowledge_articles").delete().eq("id", id);
      await fetchArticles();
    },
    [fetchArticles]
  );

  const suggestMacro = useCallback(
    async (suggestion: { article_id: string; title: string; content: string; category: string; suggested_by: string }) => {
      if (!workspaceId) return;
      await supabase.from("macro_suggestions").insert({ ...suggestion, workspace_id: workspaceId } as any);
      await fetchSuggestions();
    },
    [workspaceId, fetchSuggestions]
  );

  const reviewSuggestion = useCallback(
    async (id: string, status: "approved" | "rejected", reviewedBy: string) => {
      await supabase.from("macro_suggestions").update({
        status,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString(),
      } as any).eq("id", id);

      if (status === "approved") {
        const suggestion = suggestions.find((s) => s.id === id);
        if (suggestion && workspaceId) {
          await supabase.from("macros").insert({
            title: suggestion.title,
            content: suggestion.content,
            category: suggestion.category,
            user_id: reviewedBy,
            workspace_id: workspaceId,
            is_shared: true,
          });
        }
      }
      await fetchSuggestions();
    },
    [suggestions, workspaceId, fetchSuggestions]
  );

  return {
    articles, suggestions, loading,
    createArticle, updateArticle, deleteArticle,
    suggestMacro, reviewSuggestion,
    refetch: () => { fetchArticles(); fetchSuggestions(); },
  };
}
