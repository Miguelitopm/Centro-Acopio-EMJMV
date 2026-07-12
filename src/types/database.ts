export type EstadoSolicitud = 'pendiente' | 'armado' | 'entregado';

export interface InsumoItem {
  id: string;
  categoria: string;
  descripcion: string;
  cantidad_solicitada: string;
  cantidad_armada?: string;
  cantidad_entregada?: string;
}

export interface Prioridad {
  id: number;
  orden: number;
  texto: string;
  updated_at: string;
}

export interface Solicitud {
  id: string;
  ticket_number: string;
  estado: EstadoSolicitud;
  fecha_hora: string;
  nombre_solicitante: string;
  cedula_solicitante: string;
  correo_solicitante: string;
  nombre_contacto: string;
  cedula_contacto: string;
  telefono_contacto: string;
  correo_contacto: string;
  telefono_contacto_alt: string | null;
  tipo_solicitante: string;
  nombre_institucion: string | null;
  beneficiarios: number | null;
  tipo_envio: string;
  direccion: string | null;
  insumos_solicitados: InsumoItem[];
  insumos_armados: InsumoItem[] | null;
  insumos_entregados: InsumoItem[] | null;
  archivado: boolean;
  created_at: string;
  updated_at: string;
}
