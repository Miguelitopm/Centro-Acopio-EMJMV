import { useState, useEffect } from 'react';
import { X, Truck, Loader2, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Solicitud, InsumoItem } from '../../types/database';
import { initEntregaFromArmados } from '../../lib/insumos';

interface Props {
  solicitud: Solicitud | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (insumosEntregados: InsumoItem[]) => Promise<void>;
}

export default function ProcesarEntregaModal({ solicitud, isOpen, onClose, onConfirm }: Props) {
  const [insumos, setInsumos] = useState<InsumoItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && solicitud) {
      const base = solicitud.insumos_armados ?? solicitud.insumos_solicitados;
      setInsumos(initEntregaFromArmados(base));
    } else setInsumos([]);
  }, [isOpen, solicitud]);

  const handleConfirm = async () => {
    setSaving(true);
    try { await onConfirm(insumos); onClose(); setInsumos([]); } finally { setSaving(false); }
  };

  if (!solicitud) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setInsumos([]); onClose(); }} />
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><Truck className="w-5 h-5 text-green-700" /></div>
                <div><h2 className="text-lg font-bold text-gray-900">Procesar Entrega</h2><p className="text-sm text-gray-500 font-mono">#{solicitud.ticket_number}</p></div>
              </div>
              <button onClick={() => { setInsumos([]); onClose(); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-sm text-gray-600 mb-4">Registra las cantidades reales entregadas.</p>
              <div className="space-y-4">
                {insumos.map((insumo) => (
                  <div key={insumo.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                      <div className="flex-1 w-full">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{insumo.categoria}</span>
                        {insumo.categoria === 'EXTRA / EMERGENCIA' ? (
                          <input type="text" value={insumo.descripcion} onChange={(e) => setInsumos((prev) => prev.map((i) => i.id === insumo.id ? { ...i, descripcion: e.target.value } : i))}
                            placeholder="Descripción del insumo extra" className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                        ) : (
                          <p className="font-semibold text-gray-900">{insumo.descripcion}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-500">Armado: <strong>{insumo.cantidad_armada ?? insumo.cantidad_solicitada}</strong></span>
                        {insumo.categoria === 'EXTRA / EMERGENCIA' && (
                          <button onClick={() => setInsumos((prev) => prev.filter((i) => i.id !== insumo.id))} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        )}
                      </div>
                    </div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cantidad Real Entregada</label>
                    <input type="text" value={insumo.cantidad_entregada ?? ''} onChange={(e) => setInsumos((prev) => prev.map((i) => i.id === insumo.id ? { ...i, cantidad_entregada: e.target.value } : i))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                ))}
              </div>
              <button onClick={() => setInsumos((prev) => [...prev, { id: crypto.randomUUID(), categoria: 'EXTRA / EMERGENCIA', descripcion: '', cantidad_solicitada: '-', cantidad_armada: '-', cantidad_entregada: '' }])}
                className="mt-4 flex items-center gap-2 text-sm font-bold text-green-700 uppercase tracking-wider">
                <Plus className="w-4 h-4" /> Añadir insumo extra de emergencia
              </button>
            </div>
            <div className="p-6 border-t border-gray-200">
              <button onClick={handleConfirm} disabled={saving} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-6 rounded-xl uppercase text-sm tracking-widest disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Confirmar y Cerrar Pedido
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
