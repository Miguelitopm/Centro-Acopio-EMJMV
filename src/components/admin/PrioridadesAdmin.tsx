import React, { useState, useEffect, useCallback } from 'react';
import { Save, Loader2, AlertCircle, ChevronUp, ChevronDown, Pencil, X } from 'lucide-react';
import { motion, LayoutGroup } from 'motion/react';
import { requireSupabase } from '../../lib/supabase';
import type { Prioridad } from '../../types/database';
import PrioridadRow from './PrioridadRow';

export default function PrioridadesAdmin() {
  const [items, setItems] = useState<Prioridad[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchPrioridades = useCallback(async () => {
    try {
      const { data, error: fetchError } = await requireSupabase()
        .from('inventario_prioridades').select('*').order('orden', { ascending: true });
      if (fetchError) throw fetchError;
      setItems(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar prioridades');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrioridades(); }, [fetchPrioridades]);

  const handleSaveEdit = () => {
    if (editingId === null) return;
    setItems((prev) => prev.map((p) => (p.id === editingId ? { ...p, texto: editText } : p)));
    setEditingId(null);
    setEditText('');
    setDirty(true);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= items.length) return;
    const updated = [...items];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setItems(updated.map((item, i) => ({ ...item, orden: i + 1 })));
    setDirty(true);
  };

  const handleGuardar = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const client = requireSupabase();
      // Upsert en lote: 1 única petición HTTP en lugar de N peticiones secuenciales
      const updates = items.map((item, i) => ({
        id: item.id,
        orden: i + 1,
        texto: item.texto,
        updated_at: new Date().toISOString(),
      }));
      const { error: updateError } = await client
        .from('inventario_prioridades')
        .upsert(updates);
      if (updateError) throw updateError;
      setDirty(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (items.length === 0) {
    return (
      <div className="bg-error/10 border border-error/30 rounded-xl p-6 text-center">
        <AlertCircle className="w-8 h-8 text-error mx-auto mb-3" />
        <p className="text-on-surface font-medium">No hay prioridades. Ejecuta <code className="bg-surface-container px-2 py-0.5 rounded text-sm">supabase/schema.sql</code> en Supabase.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-primary uppercase tracking-tight">Lo más necesitado hoy</h2>
        <p className="text-on-surface-variant text-sm mt-1">Al guardar, la web pública se actualiza al instante vía Realtime.</p>
      </div>
      {error && <div className="mb-4 bg-error/10 border border-error/30 rounded-lg p-3 text-error text-sm flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      {success && <div className="mb-4 bg-green-100 border border-green-300 rounded-lg p-3 text-green-800 text-sm">Cambios guardados. La web pública se actualizará automáticamente.</div>}
      {/* Vista Móvil y Tablet (Tarjetas) */}
      <LayoutGroup id="mobile-priorities">
        <div className="md:hidden space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 sm:p-5 ambient-shadow-card flex flex-col gap-3"
            >
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                <span className="font-bold text-primary text-sm">Prioridad #{index + 1}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Subir"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === items.length - 1}
                    className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Bajar"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                {editingId === item.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                ) : (
                  <p className="font-medium text-on-surface text-sm sm:text-base">{item.texto}</p>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant/10">
                {editingId === item.id ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-on-primary hover:opacity-90 text-xs font-bold uppercase tracking-wider flex-1 sm:flex-initial"
                      title="Guardar"
                    >
                      <Save className="w-3.5 h-3.5" /> Guardar
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditText(''); }}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high text-xs font-bold uppercase tracking-wider flex-1 sm:flex-initial"
                      title="Cancelar"
                    >
                      <X className="w-3.5 h-3.5" /> Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setEditingId(item.id); setEditText(item.texto); }}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 text-xs font-bold uppercase tracking-wider w-full"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Editar Texto
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </LayoutGroup>

      {/* Vista Desktop (Tabla) */}
      <div className="hidden md:block bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden ambient-shadow-card">
        <table className="w-full text-left">
          <thead className="bg-surface-container text-on-surface-variant text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-center w-12">#</th>
              <th className="px-4 py-3">Ítem</th>
              <th className="px-4 py-3 text-center w-40">Acciones</th>
              <th className="px-4 py-3 text-center w-28">Orden</th>
            </tr>
          </thead>
          <LayoutGroup id="desktop-priorities">
            <tbody>
              {items.map((item, index) => (
                <PrioridadRow key={item.id} item={item} index={index} total={items.length}
                  isEditing={editingId === item.id} editText={editText} onEditTextChange={setEditText}
                  onStartEdit={() => { setEditingId(item.id); setEditText(item.texto); }}
                  onCancelEdit={() => { setEditingId(null); setEditText(''); }}
                  onSaveEdit={handleSaveEdit} onMoveUp={() => handleMove(index, 'up')} onMoveDown={() => handleMove(index, 'down')} />
              ))}
            </tbody>
          </LayoutGroup>
        </table>
      </div>
      <div className="mt-6 flex justify-end">
        <button onClick={handleGuardar} disabled={!dirty || saving}
          className="flex items-center gap-2 px-8 py-3 bg-primary-container text-on-primary rounded-full font-bold uppercase tracking-widest text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-md">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Guardar
        </button>
      </div>
    </div>
  );
}
