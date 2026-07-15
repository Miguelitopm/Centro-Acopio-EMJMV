import React, { useState, useEffect, useCallback } from 'react';
import { Search, Package, Truck, Loader2, AlertCircle, Archive, Clock, Trash2 } from 'lucide-react';
import { requireSupabase } from '../../lib/supabase';
import type { Solicitud, InsumoItem } from '../../types/database';
import EstadoBadge, { getRowBorderClass } from './EstadoBadge';
import ArmarPedidoModal from './ArmarPedidoModal';
import ProcesarEntregaModal from './ProcesarEntregaModal';
import DetallePedidoModal from './DetallePedidoModal';

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function formatInsumos(insumos: InsumoItem[]) {
  if (!insumos?.length) return 'Sin insumos especificados';
  return insumos.map((i) => `${i.descripcion} (${i.cantidad_solicitada})`).join(', ');
}

const TAB_CONFIG = {
  pendiente: {
    active: 'border-red-500 text-red-600 bg-red-50/50',
    inactive: 'border-transparent text-on-surface-variant hover:text-red-600 hover:bg-red-50/20',
    icon: Clock,
  },
  armado: {
    active: 'border-yellow-600 text-yellow-700 bg-yellow-50/50',
    inactive: 'border-transparent text-on-surface-variant hover:text-yellow-600 hover:bg-yellow-50/20',
    icon: Package,
  },
  entregado: {
    active: 'border-green-600 text-green-600 bg-green-50/50',
    inactive: 'border-transparent text-on-surface-variant hover:text-green-600 hover:bg-green-50/20',
    icon: Truck,
  },
};

export default function BandejaAdmin() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pendiente' | 'armado' | 'entregado'>('pendiente');
  const [armarModal, setArmarModal] = useState<Solicitud | null>(null);
  const [entregaModal, setEntregaModal] = useState<Solicitud | null>(null);
  const [detalleModal, setDetalleModal] = useState<Solicitud | null>(null);

  const fetchSolicitudes = useCallback(async () => {
    try {
      const { data, error: fetchError } = await requireSupabase().from('solicitudes').select('*').order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setSolicitudes((data as Solicitud[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSolicitudes();
    const channel = requireSupabase().channel('bandeja-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes' }, () => fetchSolicitudes())
      .subscribe();
    return () => { requireSupabase().removeChannel(channel); };
  }, [fetchSolicitudes]);

  // Auto-switch tab based on live search results
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase().replace('#', '');
    if (!q) return;
    const match = solicitudes.find((s) =>
      s.ticket_number.toLowerCase().includes(q) ||
      s.nombre_solicitante.toLowerCase().includes(q) ||
      s.cedula_solicitante.toLowerCase().includes(q) ||
      s.nombre_contacto.toLowerCase().includes(q) ||
      s.cedula_contacto.toLowerCase().includes(q) ||
      s.telefono_contacto.includes(q)
    );
    if (match && match.estado !== activeTab) setActiveTab(match.estado);
  }, [searchQuery, solicitudes]);

  const filtered = solicitudes.filter((s) => {
    if (s.estado !== activeTab) return false;
    const q = searchQuery.trim().toLowerCase().replace('#', '');
    if (!q) return true;
    return (
      s.ticket_number.toLowerCase().includes(q) ||
      s.nombre_solicitante.toLowerCase().includes(q) ||
      s.cedula_solicitante.toLowerCase().includes(q) ||
      s.nombre_contacto.toLowerCase().includes(q) ||
      s.cedula_contacto.toLowerCase().includes(q) ||
      s.telefono_contacto.includes(q)
    );
  });

  const handleArmar = async (insumosArmados: InsumoItem[]) => {
    if (!armarModal) return;
    const { error: updateError } = await requireSupabase().from('solicitudes')
      .update({ estado: 'armado', insumos_armados: insumosArmados }).eq('id', armarModal.id);
    if (updateError) throw updateError;
    setArmarModal(null);
  };

  const handleEntrega = async (insumosEntregados: InsumoItem[]) => {
    if (!entregaModal) return;
    const { error: updateError } = await requireSupabase().from('solicitudes')
      .update({ estado: 'entregado', insumos_entregados: insumosEntregados, archivado: true }).eq('id', entregaModal.id);
    if (updateError) throw updateError;
    setEntregaModal(null);
  };

  const handleDelete = async (id: string, ticketNumber: string) => {
    const confirmDelete = window.confirm(`¿Estás seguro de que deseas borrar la solicitud ${ticketNumber}? Esta acción no se puede deshacer y se eliminará permanentemente de la base de datos.`);
    if (!confirmDelete) return;

    try {
      setError(null);
      const { error: deleteError } = await requireSupabase()
        .from('solicitudes')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Update state immediately
      setSolicitudes((prev) => prev.filter((s) => s.id !== id));
    } catch (err: any) {
      console.error('Error deleting solicitud:', err);
      setError(err instanceof Error ? err.message : 'Error al borrar la solicitud');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary uppercase tracking-tight">Bandeja de Solicitudes y Entregas</h2>
        <p className="text-on-surface-variant text-sm mt-1">Pendiente → Armado → Entregado</p>
      </div>

      <div className="flex items-center mb-6 bg-primary-container rounded-2xl p-4 sm:p-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-primary/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ticket (#TK-1042), nombre, cédula o teléfono..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-on-primary placeholder:text-on-primary/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
          />
        </div>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="ml-4 px-6 py-3.5 bg-white/10 text-on-primary rounded-xl font-bold uppercase text-xs"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 border-b border-outline-variant/30 gap-1 sm:gap-2 mb-6 bg-surface-container-low/30 p-1 rounded-xl">
        {(['pendiente', 'armado', 'entregado'] as const).map((tab) => {
          const config = TAB_CONFIG[tab];
          const Icon = config.icon;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2 py-3 rounded-lg font-bold uppercase tracking-wider text-[10px] sm:text-xs md:text-sm border-b-2 transition-all ${
                isActive ? config.active : config.inactive
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>
                {tab === 'pendiente' && 'Pendientes'}
                {tab === 'armado' && 'Armados'}
                {tab === 'entregado' && 'Entregados'}
              </span>
            </button>
          );
        })}
      </div>

      {error && <div className="mb-4 bg-error/10 border border-error/30 rounded-lg p-3 text-error text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border p-12 text-center text-on-surface-variant">
          {searchQuery ? `No se encontraron solicitudes para "${searchQuery}"` : `No hay solicitudes en estado ${activeTab}`}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => (
            <div
              id={`solicitud-${s.id}`}
              key={s.id}
              onClick={() => setDetalleModal(s)}
              className={`bg-surface-container-lowest hover:bg-surface-container/30 cursor-pointer transition-colors duration-200 rounded-xl border p-4 sm:p-6 ambient-shadow-card ${getRowBorderClass(s.estado)}`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="font-mono font-bold text-lg text-primary">#{s.ticket_number}</span>
                    <EstadoBadge estado={s.estado} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <div><span className="text-on-surface-variant">Solicitante: </span><span className="font-semibold">{s.nombre_solicitante}</span> <span className="text-on-surface-variant">({s.tipo_solicitante})</span></div>
                    <div><span className="text-on-surface-variant">Cédula: </span><span className="font-medium">{s.cedula_solicitante}</span></div>
                    <div><span className="text-on-surface-variant">Contacto: </span><span className="font-semibold">{s.nombre_contacto}</span></div>
                    <div><span className="text-on-surface-variant">Teléfono: </span><span className="font-medium">{s.telefono_contacto}</span></div>
                    <div><span className="text-on-surface-variant">Fecha/Hora: </span><span className="font-medium">{formatFecha(s.fecha_hora)}</span></div>
                    <div className="sm:col-span-2"><span className="text-on-surface-variant">Insumos: </span><span className="font-medium">{formatInsumos(s.insumos_solicitados)}</span></div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {s.estado === 'pendiente' && (
                    <button onClick={() => setArmarModal(s)} className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-md">
                      <Package className="w-4 h-4" /> Armar Pedido
                    </button>
                  )}
                  {s.estado === 'armado' && (
                    <button onClick={() => setEntregaModal(s)} className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-md">
                      <Truck className="w-4 h-4" /> Procesar Entrega
                    </button>
                  )}
                  {s.estado === 'armado' && (
                    <button onClick={() => setArmarModal(s)} className="flex items-center justify-center gap-2 px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-sm transition-colors">
                      <Package className="w-4 h-4" /> Editar Solicitud
                    </button>
                  )}
                  {(s.estado === 'pendiente' || s.estado === 'armado') && (
                    <button
                      onClick={() => handleDelete(s.id, s.ticket_number)}
                      className="flex items-center justify-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Borrar Solicitud
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ArmarPedidoModal solicitud={armarModal} isOpen={!!armarModal} onClose={() => setArmarModal(null)} onConfirm={handleArmar} />
      <ProcesarEntregaModal solicitud={entregaModal} isOpen={!!entregaModal} onClose={() => setEntregaModal(null)} onConfirm={handleEntrega} />
      <DetallePedidoModal solicitud={detalleModal} isOpen={!!detalleModal} onClose={() => setDetalleModal(null)} />
    </div>
  );
}
