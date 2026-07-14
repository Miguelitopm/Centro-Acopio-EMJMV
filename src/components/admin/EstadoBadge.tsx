import type { EstadoSolicitud } from '../../types/database';

const ESTADO_CONFIG: Record<EstadoSolicitud, { label: string; bg: string; text: string; border: string }> = {
  pendiente: { label: 'Pendiente', bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  armado: { label: 'Armado', bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  entregado: { label: 'Entregado', bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
};

export default function EstadoBadge({ estado }: { estado: EstadoSolicitud }) {
  const c = ESTADO_CONFIG[estado];
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${c.bg} ${c.text} ${c.border}`}>{c.label}</span>;
}

export function getRowBorderClass(estado: EstadoSolicitud): string {
  if (estado === 'pendiente') return 'border-l-4 border-l-red-500 bg-red-50/10 hover:bg-red-50/20 border-red-100/50';
  if (estado === 'armado') return 'border-l-4 border-l-yellow-500 bg-yellow-50/15 hover:bg-yellow-50/30 border-yellow-100/50';
  if (estado === 'entregado') return 'border-l-4 border-l-green-500 bg-green-50/10 hover:bg-green-50/20 border-green-100/50';
  return '';
}
