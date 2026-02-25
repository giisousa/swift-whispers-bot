import { useState } from "react";
import { Plus, BookOpen, Check, X, Lightbulb, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Badge } from "@/components/ui/badge";

interface Props {
  userId?: string;
  workspaceId?: string;
}

export default function KnowledgeTab({ userId, workspaceId }: Props) {
  const { articles, suggestions, createArticle, updateArticle, deleteArticle, suggestMacro, reviewSuggestion } = useKnowledgeBase(workspaceId);
  const isAdmin = useIsAdmin(userId, workspaceId);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [suggestForm, setSuggestForm] = useState<string | null>(null);
  const [sugTitle, setSugTitle] = useState("");
  const [sugContent, setSugContent] = useState("");
  const [sugCategory, setSugCategory] = useState("Geral");

  const handleSaveArticle = async () => {
    if (!title.trim() || !content.trim() || !userId) return;
    if (editId) {
      await updateArticle(editId, { title, content });
    } else {
      await createArticle({ title, content, created_by: userId });
    }
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setTitle("");
    setContent("");
  };

  const handleSuggestMacro = async (articleId: string) => {
    if (!sugTitle.trim() || !sugContent.trim() || !userId) return;
    await suggestMacro({ article_id: articleId, title: sugTitle, content: sugContent, category: sugCategory, suggested_by: userId });
    setSuggestForm(null);
    setSugTitle("");
    setSugContent("");
    setSugCategory("Geral");
  };

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending");

  return (
    <div className="space-y-4">
      {/* Admin: pending suggestions alert */}
      {isAdmin && pendingSuggestions.length > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
          <p className="text-sm font-medium text-warning flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            {pendingSuggestions.length} sugestão(ões) de macro aguardando aprovação
          </p>
        </div>
      )}

      {/* Add article button */}
      {isAdmin && (
        <button onClick={() => { setShowForm(true); setEditId(null); setTitle(""); setContent(""); }} className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-muted-foreground hover:border-primary hover:text-primary sidebar-transition w-full justify-center">
          <Plus className="h-4 w-4" /> Nova Orientação
        </button>
      )}

      {/* Article form */}
      {showForm && (
        <div className="rounded-lg border border-border bg-card p-4 space-y-3">
          <input
            placeholder="Título da orientação..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <textarea
            placeholder="Conteúdo..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
          />
          <div className="flex gap-2 justify-end">
            <button onClick={resetForm} className="px-3 py-1.5 text-xs rounded-md text-muted-foreground hover:bg-secondary">Cancelar</button>
            <button onClick={handleSaveArticle} className="px-3 py-1.5 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90">{editId ? "Salvar" : "Criar"}</button>
          </div>
        </div>
      )}

      {/* Articles */}
      {articles.map((article) => {
        const articleSuggestions = suggestions.filter((s) => s.article_id === article.id);
        return (
          <div key={article.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{article.title}</h3>
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <button onClick={() => { setShowForm(true); setEditId(article.id); setTitle(article.title); setContent(article.content); }} className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => deleteArticle(article.id)} className="rounded p-1 text-muted-foreground hover:bg-destructive/20 hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground whitespace-pre-wrap">{article.content}</p>

            {/* Macro suggestions for this article */}
            {articleSuggestions.length > 0 && (
              <div className="border-t border-border pt-3 space-y-2">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Sugestões de Macro</p>
                {articleSuggestions.map((sug) => (
                  <div key={sug.id} className={cn("rounded-md border p-2.5 text-xs", sug.status === "pending" ? "border-warning/30 bg-warning/5" : sug.status === "approved" ? "border-success/30 bg-success/5" : "border-destructive/30 bg-destructive/5")}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{sug.title}</span>
                      <div className="flex items-center gap-1">
                        <Badge variant={sug.status === "pending" ? "outline" : sug.status === "approved" ? "default" : "destructive"} className="text-[10px]">
                          {sug.status === "pending" ? "Pendente" : sug.status === "approved" ? "Aprovada" : "Rejeitada"}
                        </Badge>
                        {isAdmin && sug.status === "pending" && userId && (
                          <>
                            <button onClick={() => reviewSuggestion(sug.id, "approved", userId)} className="rounded p-1 text-success hover:bg-success/20"><Check className="h-3.5 w-3.5" /></button>
                            <button onClick={() => reviewSuggestion(sug.id, "rejected", userId)} className="rounded p-1 text-destructive hover:bg-destructive/20"><X className="h-3.5 w-3.5" /></button>
                          </>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-muted-foreground">{sug.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Suggest macro form */}
            {suggestForm === article.id ? (
              <div className="border-t border-border pt-3 space-y-2">
                <input
                  placeholder="Título da macro sugerida..."
                  value={sugTitle}
                  onChange={(e) => setSugTitle(e.target.value)}
                  className="w-full rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
                <textarea
                  placeholder="Conteúdo da macro..."
                  value={sugContent}
                  onChange={(e) => setSugContent(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-border bg-secondary px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setSuggestForm(null)} className="px-2 py-1 text-[10px] rounded text-muted-foreground hover:bg-secondary">Cancelar</button>
                  <button onClick={() => handleSuggestMacro(article.id)} className="px-2 py-1 text-[10px] rounded bg-primary text-primary-foreground hover:bg-primary/90">Sugerir</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setSuggestForm(article.id)} className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary sidebar-transition">
                <Lightbulb className="h-3 w-3" /> Sugerir macro para esta orientação
              </button>
            )}
          </div>
        );
      })}

      {articles.length === 0 && (
        <p className="py-8 text-center text-xs text-muted-foreground">Nenhuma orientação cadastrada</p>
      )}
    </div>
  );
}
