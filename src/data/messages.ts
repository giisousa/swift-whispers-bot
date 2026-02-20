export type FlagType = "urgent" | "high" | "medium" | "low";

export interface TeamMessage {
  id: string;
  author: string;
  avatar: string;
  content: string;
  flag: FlagType;
  timestamp: Date;
  read: boolean;
}

export const flagLabels: Record<FlagType, string> = {
  urgent: "Urgente",
  high: "Alta",
  medium: "Média",
  low: "Baixa",
};

export const initialMessages: TeamMessage[] = [
  {
    id: "1",
    author: "Ana Silva",
    avatar: "AS",
    content: "Cliente VIP aguardando retorno sobre reembolso #4521. Prioridade máxima!",
    flag: "urgent",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: "2",
    author: "Carlos Lima",
    avatar: "CL",
    content: "Atualização: sistema de pagamentos normalizado. Podem liberar os tickets pendentes.",
    flag: "high",
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    read: false,
  },
  {
    id: "3",
    author: "Marina Costa",
    avatar: "MC",
    content: "Nova macro de encerramento adicionada ao repositório. Revisem quando possível.",
    flag: "low",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    read: true,
  },
  {
    id: "4",
    author: "Pedro Santos",
    avatar: "PS",
    content: "Pico de tickets detectado no setor de entregas. Quem puder ajudar, favor assumir tickets.",
    flag: "medium",
    timestamp: new Date(Date.now() - 1000 * 60 * 60),
    read: true,
  },
];
