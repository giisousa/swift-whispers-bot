import { useState, useRef } from "react";
import {
  Search,
  MessageSquare,
  FileText,
  Send,
  ChevronRight,
  Flag,
  Zap,
} from "lucide-react";
import { macros, categories } from "@/data/macros";
import { initialMessages, type FlagType, flagLabels, type TeamMessage } from "@/data/messages";
import MacroCard from "./MacroCard";
import MessageCard from "./MessageCard";
import FlagBadge from "./FlagBadge";
import { cn } from "@/lib/utils";

type Tab = "macros" | "messages";

const HoverSidebar = () => {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<Tab>("macros");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [messages, setMessages] = useState<TeamMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [newFlag, setNewFlag] = useState<FlagType>("medium");
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setExpanded(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setExpanded(false), 300);
  };

  const filteredMacros = macros.filter((m) => {
    const matchesSearch =
      !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !selectedCategory || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: TeamMessage = {
      id: String(Date.now()),
      author: "Você",
      avatar: "VC",
      content: newMessage.trim(),
      flag: newFlag,
      timestamp: new Date(),
      read: true,
    };
    setMessages((prev) => [msg, ...prev]);
    setNewMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-card sidebar-transition",
        expanded ? "w-80" : "w-14"
      )}
    >
      {/* Collapsed icons */}
      <div className="flex flex-col items-center gap-1 pt-4 pb-2">
        <button
          onClick={() => { setTab("macros"); setExpanded(true); }}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg sidebar-transition",
            tab === "macros" && expanded
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
          title="Macros"
        >
          <FileText className="h-5 w-5" />
        </button>
        <button
          onClick={() => { setTab("messages"); setExpanded(true); }}
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-lg sidebar-transition",
            tab === "messages" && expanded
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
          title="Mensagens"
        >
          <MessageSquare className="h-5 w-5" />
          {messages.some((m) => !m.read) && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-flag-urgent animate-pulse-flag" />
          )}
        </button>
      </div>

      {/* Expand indicator */}
      {!expanded && (
        <div className="flex flex-1 items-center justify-center">
          <ChevronRight className="h-4 w-4 text-muted-foreground/40 animate-pulse" />
        </div>
      )}

      {/* Expanded content */}
      {expanded && (
        <div className="flex flex-1 flex-col overflow-hidden animate-slide-in">
          {/* Header */}
          <div className="border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              {tab === "macros" ? (
                <Zap className="h-4 w-4 text-primary" />
              ) : (
                <Flag className="h-4 w-4 text-primary" />
              )}
              <h2 className="text-sm font-semibold text-foreground">
                {tab === "macros" ? "Macros Zendesk" : "Mensagens do Time"}
              </h2>
            </div>
          </div>

          {/* Tab: Macros */}
          {tab === "macros" && (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Search */}
              <div className="px-3 pt-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar macro..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-md border border-border bg-secondary py-1.5 pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="scrollbar-thin flex gap-1.5 overflow-x-auto px-3 py-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium sidebar-transition",
                    !selectedCategory
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  Todos
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium sidebar-transition",
                      cat === selectedCategory
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Macro list */}
              <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto px-3 pb-3">
                {filteredMacros.map((macro) => (
                  <MacroCard key={macro.id} macro={macro} />
                ))}
                {filteredMacros.length === 0 && (
                  <p className="py-8 text-center text-xs text-muted-foreground">
                    Nenhuma macro encontrada
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tab: Messages */}
          {tab === "messages" && (
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Message list */}
              <div className="scrollbar-thin flex-1 space-y-2 overflow-y-auto p-3">
                {messages.map((msg) => (
                  <MessageCard key={msg.id} message={msg} />
                ))}
              </div>

              {/* Compose */}
              <div className="border-t border-border p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] text-muted-foreground">Flag:</span>
                  {(Object.keys(flagLabels) as FlagType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setNewFlag(f)}
                      className={cn("sidebar-transition", f === newFlag ? "scale-110" : "opacity-50 hover:opacity-80")}
                    >
                      <FlagBadge flag={f} />
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Mensagem para o time..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 rounded-md border border-border bg-secondary py-1.5 px-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 sidebar-transition"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HoverSidebar;
