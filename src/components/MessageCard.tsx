import type { TeamMessage } from "@/data/messages";
import FlagBadge from "./FlagBadge";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MessageCardProps {
  message: TeamMessage;
}

const MessageCard = ({ message }: MessageCardProps) => (
  <div
    className={cn(
      "rounded-md border border-border p-3 sidebar-transition animate-fade-in",
      !message.read && "border-l-2 border-l-primary bg-secondary/50"
    )}
  >
    <div className="flex items-start gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
        {message.avatar}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{message.author}</span>
          <FlagBadge flag={message.flag} pulse={!message.read} />
          <span className="ml-auto text-[10px] text-muted-foreground">
            {formatDistanceToNow(message.timestamp, { addSuffix: true, locale: ptBR })}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{message.content}</p>
      </div>
    </div>
  </div>
);

export default MessageCard;
