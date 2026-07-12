import type { InsumoItem } from '../types/database';

interface NeedItem {
  id: string;
  description: string;
  quantity: string;
}

export function flattenNeedItems(needItems: Record<string, NeedItem[]>): InsumoItem[] {
  const result: InsumoItem[] = [];
  for (const [categoria, items] of Object.entries(needItems)) {
    for (const item of items) {
      if (item.description.trim()) {
        result.push({
          id: item.id,
          categoria,
          descripcion: item.description,
          cantidad_solicitada: item.quantity || '-',
        });
      }
    }
  }
  return result;
}

export function initArmadoFromSolicitados(insumos: InsumoItem[]): InsumoItem[] {
  return insumos.map((i) => ({ ...i, cantidad_armada: i.cantidad_solicitada }));
}

export function initEntregaFromArmados(insumos: InsumoItem[]): InsumoItem[] {
  return insumos.map((i) => ({
    ...i,
    cantidad_entregada: i.cantidad_armada ?? i.cantidad_solicitada,
  }));
}
