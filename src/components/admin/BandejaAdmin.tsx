import { useState, useEffect, useCallback } from 'react';
import { Search, Package, Truck, Loader2, AlertCircle, Archive } from 'lucide-react';
import { requireSupabase } from '../../lib/supabase';
import type { Solicitud, InsumoItem } from '../../types/database';
import EstadoBadge, { getRowBorderClass } from './EstadoBadge';
import ArmarPedidoModal from './ArmarPedidoModal';
import ProcesarEntregaModal from './ProcesarEntregaModal';

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleString('es-VE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function formatInsumos(insumos: InsumoItem[]) {
  if (!insumos?.length) return 'Sin insumos especificados';
  return insumos.map((i) => `${i.descripcion} (${i.cantidad_solicitada})`).join(', ');
}

export default function BandejaAdmin() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [showArchivados, setShowArchivados] = useState(false);
  const [armarModal, setArmarModal] = useState<Solicitud | null>(null);
  const [entregaModal, setEntregaModal] = useState<Solicitud | null>(null);

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

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setActiveSearch(searchQuery.trim());
  };

  const filtered = solicitudes.filter((s) => {
    if (!showArchivados && s.archivado) return false;
    if (showArchivados && !s.archivado) return false;
    if (!activeSearch) return true;
    const q = activeSearch.toLowerCase().replace('#', '');
    return s.ticket_number.toLowerCase().includes(q) || s.nombre_solicitante.toLowerCase().includes(q) ||
      s.cedula_solicitante.toLowerCase().includes(q) || s.nombre_contacto.toLowerCase().includes(q) ||
      s.cedula_contacto.toLowerCase().includes(q) || s.telefono_contacto.includes(q);
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

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary uppercase tracking-tight">Bandeja de Solicitudes y Entregas</h2>
        <p className="text-on-surface-variant text-sm mt-1">Pendiente → Armado → Entregado</p>
      </div>

      <form onSubmit={handleSearch} className="mb-6 bg-primary-container rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-3 ambient-shadow-card">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-on-primary/60" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por ticket (#TK-1042), nombre, cédula o teléfono..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-on-primary placeholder:text-on-primary/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-sm" />
        </div>
        <button type="submit" className="px-8 py-3.5 bg-white text-primary-container rounded-xl font-bold uppercase tracking-widest text-sm shadow-md">Buscar</button>
        {activeSearch && (
          <button type="button" onClick={() => { setSearchQuery(''); setActiveSearch(''); }}
            className="px-6 py-3.5 bg-white/10 text-on-primary rounded-xl font-bold uppercase text-xs">Limpiar</button>
        )}
      </form>

      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => setShowArchivados(false)} className={`text-sm font-bold uppercase px-4 py-2 rounded-full ${!showArchivados ? 'bg-primary-container text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>Activas</button>
        <button onClick={() => setShowArchivados(true)} className={`flex items-center gap-2 text-sm font-bold uppercase px-4 py-2 rounded-full ${showArchivados ? 'bg-green-600 text-white' : 'bg-surface-container text-on-surface-variant'}`}>
          <Archive className="w-4 h-4" /> Archivadas
        </button>
      </div>

      {error && <div className="mb-4 bg-error/10 border border-error/30 rounded-lg p-3 text-error text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</div>}

      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border p-12 text-center text-on-surface-variant">
          {activeSearch ? `No se encontraron solicitudes para "${activeSearch}"` : showArchivados ? 'No hay solicitudes archivadas' : 'No hay solicitudes pendientes o en proceso'}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((s) => (
            <div key={s.id} className={`bg-surface-container-lowest rounded-xl border p-4 sm:p-6 ambient-shadow-card ${getRowBorderClass(s.estado)}`}>
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
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
                <div className="flex flex-col gap-2 shrink-0">
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
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ArmarPedidoModal solicitud={armarModal} isOpen={!!armarModal} onClose={() => setArmarModal(null)} onConfirm={handleArmar} />
      <ProcesarEntregaModal solicitud={entregaModal} isOpen={!!entregaModal} onClose={() => setEntregaModal(null)} onConfirm={handleEntrega} />
    </div>
  );
}
