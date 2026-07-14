import { useState, useEffect } from 'react';
import { X, Package, Loader2, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Solicitud, InsumoItem } from '../../types/database';
import { initArmadoFromSolicitados } from '../../lib/insumos';

interface Props {
  solicitud: Solicitud | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (insumosArmados: InsumoItem[]) => Promise<void>;
}

export default function ArmarPedidoModal({ solicitud, isOpen, onClose, onConfirm }: Props) {
  const [insumos, setInsumos] = useState<InsumoItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && solicitud) setInsumos(initArmadoFromSolicitados(solicitud.insumos_solicitados));
    else setInsumos([]);
  }, [isOpen, solicitud]);

  const handleConfirm = async () => {
    setSaving(true);
    try { await onConfirm(insumos); onClose(); setInsumos([]); } finally { setSaving(false); }
  };

  const handleAddInsumo = () => {
    const newInsumo: InsumoItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      categoria: '',
      descripcion: '',
      cantidad_solicitada: '',
      cantidad_armada: '',
    };
    setInsumos((prev) => [...prev, newInsumo]);
  };

  const handleRemoveInsumo = (id: string) => {
    setInsumos((prev) => prev.filter((i) => i.id !== id));
  };

  const handleFieldChange = (id: string, field: keyof InsumoItem, value: string) => {
    setInsumos((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i));
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
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center"><Package className="w-5 h-5 text-yellow-700" /></div>
                <div><h2 className="text-lg font-bold text-gray-900">Armar Pedido</h2><p className="text-sm text-gray-500 font-mono">#{solicitud.ticket_number}</p></div>
              </div>
              <button onClick={() => { setInsumos([]); onClose(); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <p className="text-sm text-gray-600 mb-4">Ajusta las cantidades, agrega o elimina insumos según lo disponible en almacén.</p>
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {insumos.map((insumo) => (
                    <motion.div
                      key={insumo.id}
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="border border-gray-200 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                          <div className="flex-1 w-full">
                            <div className="flex items-center gap-2 mb-1">
                              <input
                                type="text"
                                value={insumo.categoria}
                                onChange={(e) => handleFieldChange(insumo.id, 'categoria', e.target.value)}
                                placeholder="Categoría"
                                className="text-[10px] font-bold text-gray-400 uppercase bg-transparent border-b border-dashed border-gray-200 focus:border-yellow-400 focus:outline-none px-1 py-0.5 flex-1 min-w-0"
                              />
                            </div>
                            <input
                              type="text"
                              value={insumo.descripcion}
                              onChange={(e) => handleFieldChange(insumo.id, 'descripcion', e.target.value)}
                              placeholder="Descripción del insumo"
                              className="font-semibold text-gray-900 bg-transparent border-b border-dashed border-gray-200 focus:border-yellow-400 focus:outline-none w-full px-1 py-0.5 text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {insumo.cantidad_solicitada && (
                              <span className="text-xs text-gray-500">Solicitado: <strong>{insumo.cantidad_solicitada}</strong></span>
                            )}
                            <button
                              onClick={() => handleRemoveInsumo(insumo.id)}
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition-colors"
                              title="Eliminar insumo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cantidad Disponible para Armar</label>
                        <input type="text" value={insumo.cantidad_armada ?? ''} onChange={(e) => handleFieldChange(insumo.id, 'cantidad_armada', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add Insumo Button */}
              <button
                type="button"
                onClick={handleAddInsumo}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-yellow-400 hover:text-yellow-700 hover:bg-yellow-50 transition-all text-sm font-bold uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                Agregar Insumo
              </button>
            </div>
            <div className="p-6 border-t border-gray-200">
              <button onClick={handleConfirm} disabled={saving} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3.5 px-6 rounded-xl uppercase text-sm tracking-widest disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Confirmar y Marcar como Armado
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
