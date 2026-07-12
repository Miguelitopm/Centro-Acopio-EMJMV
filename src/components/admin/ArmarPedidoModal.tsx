import { useState, useEffect } from 'react';
import { X, Package, Loader2 } from 'lucide-react';
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
              <p className="text-sm text-gray-600 mb-4">Ajusta las cantidades según lo disponible en almacén.</p>
              <div className="space-y-4">
                {insumos.map((insumo) => (
                  <div key={insumo.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">{insumo.categoria}</span>
                        <p className="font-semibold text-gray-900">{insumo.descripcion}</p>
                      </div>
                      <span className="text-xs text-gray-500">Solicitado: <strong>{insumo.cantidad_solicitada}</strong></span>
                    </div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cantidad Disponible para Armar</label>
                    <input type="text" value={insumo.cantidad_armada ?? ''} onChange={(e) => setInsumos((prev) => prev.map((i) => i.id === insumo.id ? { ...i, cantidad_armada: e.target.value } : i))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                  </div>
                ))}
              </div>
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
