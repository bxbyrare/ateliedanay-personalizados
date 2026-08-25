export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR');
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  aguardando_pagamento: 'Aguardando pagamento',
  pagamento_aprovado: 'Pagamento aprovado',
  em_producao: 'Em produção',
  enviado: 'Enviado',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
};

export const ORDER_STATUS_STYLES: Record<string, string> = {
  aguardando_pagamento: 'bg-amber-100 text-amber-800',
  pagamento_aprovado: 'bg-sky-100 text-sky-800',
  em_producao: 'bg-amber-100 text-amber-800',
  enviado: 'bg-indigo-100 text-indigo-800',
  entregue: 'bg-emerald-100 text-emerald-800',
  cancelado: 'bg-rose-100 text-rose-800',
};
