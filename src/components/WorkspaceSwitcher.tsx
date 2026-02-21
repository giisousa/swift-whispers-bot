import { useState } from "react";
import { ChevronDown, Plus, Users, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Workspace } from "@/hooks/useWorkspaces";
import type { Profile } from "@/hooks/useAuth";

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  current: Workspace | null;
  profile: Profile | null;
  onSwitch: (ws: Workspace) => void;
  onCreate: () => void;
  onSignOut: () => void;
}

const WorkspaceSwitcher = ({
  workspaces,
  current,
  profile,
  onSwitch,
  onCreate,
  onSignOut,
}: WorkspaceSwitcherProps) => {
  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary sidebar-transition">
          <Users className="h-4 w-4 text-primary" />
          <span className="max-w-[140px] truncate">{current?.name ?? "Workspace"}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-card border-border">
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => onSwitch(ws)}
              className={ws.id === current?.id ? "bg-secondary" : ""}
            >
              {ws.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-semibold text-primary">
          {profile?.display_name?.charAt(0)?.toUpperCase() ?? "?"}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-card border-border">
          <div className="px-3 py-2">
            <p className="text-sm font-medium text-foreground">{profile?.display_name}</p>
            <p className="text-xs text-muted-foreground">{profile?.email}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSignOut} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default WorkspaceSwitcher;
