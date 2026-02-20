import { Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Macro } from "@/data/macros";

interface MacroCardProps {
  macro: Macro;
}

const MacroCard = ({ macro }: MacroCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(macro.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group rounded-md border border-border bg-card p-3 hover:border-primary/40 hover:glow-accent sidebar-transition cursor-pointer" onClick={handleCopy}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {macro.category}
            </span>
            {macro.shortcut && (
              <span className="font-mono text-[10px] text-muted-foreground">
                {macro.shortcut}
              </span>
            )}
          </div>
          <h4 className="mt-1.5 text-sm font-medium text-foreground">{macro.title}</h4>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{macro.content}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); handleCopy(); }}
          className="mt-1 shrink-0 rounded p-1 text-muted-foreground opacity-0 hover:bg-secondary hover:text-foreground group-hover:opacity-100 sidebar-transition"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  );
};

export default MacroCard;
