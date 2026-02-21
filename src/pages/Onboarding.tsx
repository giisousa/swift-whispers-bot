import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWorkspaces } from "@/hooks/useWorkspaces";
import { Plus, Users } from "lucide-react";

const Onboarding = () => {
  const { user } = useAuth();
  const { createWorkspace } = useWorkspaces(user?.id);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    await createWorkspace(name.trim());
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 px-4">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary/20">
            <Users className="h-7 w-7 text-primary" />
          </div>
          <h1 className="mt-4 text-xl font-bold text-foreground">Crie seu Workspace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Organize seu time em um workspace para compartilhar macros e mensagens
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Nome do workspace (ex: Suporte Tier 1)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={handleCreate}
            disabled={!name.trim() || creating}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sidebar-transition"
          >
            <Plus className="h-4 w-4" />
            {creating ? "Criando..." : "Criar Workspace"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
