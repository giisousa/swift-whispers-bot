import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DbMacro } from "@/hooks/useMacros";

interface MacroFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  macro?: DbMacro | null;
  onSave: (data: {
    title: string;
    category: string;
    content: string;
    shortcut?: string;
    is_shared: boolean;
  }) => void;
}

const MacroFormDialog = ({ open, onOpenChange, macro, onSave }: MacroFormDialogProps) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Geral");
  const [content, setContent] = useState("");
  const [shortcut, setShortcut] = useState("");
  const [isShared, setIsShared] = useState(false);

  useEffect(() => {
    if (macro) {
      setTitle(macro.title);
      setCategory(macro.category);
      setContent(macro.content);
      setShortcut(macro.shortcut ?? "");
      setIsShared(macro.is_shared);
    } else {
      setTitle("");
      setCategory("Geral");
      setContent("");
      setShortcut("");
      setIsShared(false);
    }
  }, [macro, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({
      title: title.trim(),
      category: category.trim(),
      content: content.trim(),
      shortcut: shortcut.trim() || undefined,
      is_shared: isShared,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {macro ? "Editar Macro" : "Nova Macro"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            required
          />
          <input
            placeholder="Categoria"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <textarea
            placeholder="Conteúdo da macro..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            required
          />
          <input
            placeholder="Atalho (ex: Ctrl+1)"
            value={shortcut}
            onChange={(e) => setShortcut(e.target.value)}
            className="w-full rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
              className="rounded border-border"
            />
            Compartilhar com o workspace
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md px-4 py-2 text-sm text-muted-foreground hover:text-foreground sidebar-transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 sidebar-transition"
            >
              {macro ? "Salvar" : "Criar"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MacroFormDialog;
