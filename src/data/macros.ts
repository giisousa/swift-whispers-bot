export interface Macro {
  id: string;
  title: string;
  category: string;
  content: string;
  shortcut?: string;
}

export const macros: Macro[] = [
  {
    id: "1",
    title: "Saudação Inicial",
    category: "Abertura",
    content: "Olá! Obrigado por entrar em contato. Meu nome é [AGENTE], como posso ajudá-lo hoje?",
    shortcut: "Ctrl+1",
  },
  {
    id: "2",
    title: "Solicitar Dados",
    category: "Abertura",
    content: "Para que eu possa verificar sua conta, poderia me informar seu e-mail cadastrado e o número do pedido?",
    shortcut: "Ctrl+2",
  },
  {
    id: "3",
    title: "Aguardando Retorno",
    category: "Follow-up",
    content: "Estou aguardando seu retorno para dar continuidade ao atendimento. Caso precise de algo, estou à disposição!",
  },
  {
    id: "4",
    title: "Escalonamento",
    category: "Escalonamento",
    content: "Vou transferir seu caso para nossa equipe especializada. Eles entrarão em contato em até 24h úteis.",
  },
  {
    id: "5",
    title: "Reembolso Aprovado",
    category: "Financeiro",
    content: "Seu reembolso foi aprovado e será processado em até 5 dias úteis. O valor será creditado na mesma forma de pagamento utilizada.",
    shortcut: "Ctrl+5",
  },
  {
    id: "6",
    title: "Encerramento Positivo",
    category: "Encerramento",
    content: "Fico feliz em ter ajudado! Se precisar de mais alguma coisa, não hesite em nos procurar. Tenha um ótimo dia! 😊",
    shortcut: "Ctrl+6",
  },
  {
    id: "7",
    title: "Problema Técnico",
    category: "Suporte",
    content: "Identificamos o problema reportado e nossa equipe técnica já está trabalhando na solução. Atualizaremos você assim que houver novidades.",
  },
  {
    id: "8",
    title: "SLA Informado",
    category: "Follow-up",
    content: "Informamos que o prazo de resolução para este tipo de solicitação é de até 48h úteis. Acompanharemos o caso de perto.",
  },
];

export const categories = [...new Set(macros.map((m) => m.category))];
