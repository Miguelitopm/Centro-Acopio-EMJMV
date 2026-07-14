import React from 'react';
import { ChevronUp, ChevronDown, Pencil, Save, X } from 'lucide-react';
import { motion } from 'motion/react';
import type { Prioridad } from '../../types/database';

interface PrioridadRowProps {
  item: Prioridad;
  index: number;
  total: number;
  isEditing: boolean;
  editText: string;
  onEditTextChange: (text: string) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  key?: React.Key;
}

export default function PrioridadRow({
  item, index, total, isEditing, editText, onEditTextChange,
  onStartEdit, onCancelEdit, onSaveEdit, onMoveUp, onMoveDown,
}: PrioridadRowProps) {
  return (
    <motion.tr
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="border-b border-outline-variant/30 hover:bg-surface-container-low/50 transition-colors"
    >
      <td className="px-4 py-3 text-center font-bold text-primary w-12">{index + 1}</td>
      <td className="px-4 py-3">
        {isEditing ? (
          <input type="text" value={editText} onChange={(e) => onEditTextChange(e.target.value)}
            className="w-full border border-outline-variant/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
        ) : (
          <span className="font-medium text-on-surface">{item.texto}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          {isEditing ? (
            <>
              <button onClick={onSaveEdit} className="p-2 rounded-lg bg-primary-container text-on-primary hover:opacity-90" title="Guardar texto"><Save className="w-4 h-4" /></button>
              <button onClick={onCancelEdit} className="p-2 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high" title="Cancelar"><X className="w-4 h-4" /></button>
            </>
          ) : (
            <button onClick={onStartEdit} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/10 text-secondary hover:bg-secondary/20 text-xs font-bold uppercase tracking-wider">
              <Pencil className="w-3.5 h-3.5" /> Editar Textos
            </button>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-1">
          <button onClick={onMoveUp} disabled={index === 0} className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed" title="Subir"><ChevronUp className="w-4 h-4" /></button>
          <button onClick={onMoveDown} disabled={index === total - 1} className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed" title="Bajar"><ChevronDown className="w-4 h-4" /></button>
        </div>
      </td>
    </motion.tr>
  );
}
