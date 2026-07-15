-- Hospital Vargas - Esquema de base de datos
-- Ejecutar en el SQL Editor de Supabase: https://supabase.com/dashboard

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- FUNCIÓN 1: Prioridades
CREATE TABLE IF NOT EXISTS inventario_prioridades (
  id SERIAL PRIMARY KEY,
  orden INTEGER NOT NULL,
  texto TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE inventario_prioridades DROP CONSTRAINT IF EXISTS inventario_prioridades_orden_key;

INSERT INTO inventario_prioridades (orden, texto) VALUES
  (1, 'Alimentos No Perecederos'),
  (2, 'Hidratación'),
  (3, 'Soluciones Fisiológicas'),
  (4, 'Medicinas Críticas'),
  (5, 'Material de Trauma'),
  (6, 'Higiene y Aseo'),
  (7, 'Insumos Médicos'),
  (8, 'Equipos Quirúrgicos'),
  (9, 'Material Descartable'),
  (10, 'Ferretería Médica')
ON CONFLICT (orden) DO NOTHING;

-- FUNCIÓN 2: Solicitudes
CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1042;

CREATE OR REPLACE FUNCTION generar_ticket_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
BEGIN
  next_num := nextval('ticket_seq');
  RETURN 'TK-' || next_num;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS solicitudes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT NOT NULL UNIQUE DEFAULT generar_ticket_number(),
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'armado', 'entregado')),
  fecha_hora TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  nombre_solicitante TEXT NOT NULL,
  cedula_solicitante TEXT NOT NULL,
  correo_solicitante TEXT NOT NULL,
  nombre_contacto TEXT NOT NULL,
  cedula_contacto TEXT NOT NULL,
  telefono_contacto TEXT NOT NULL,
  correo_contacto TEXT NOT NULL,
  telefono_contacto_alt TEXT,
  tipo_solicitante TEXT NOT NULL,
  nombre_institucion TEXT,
  beneficiarios INTEGER,
  tipo_envio TEXT NOT NULL,
  direccion TEXT,
  insumos_solicitados JSONB NOT NULL DEFAULT '[]',
  insumos_armados JSONB,
  insumos_entregados JSONB,
  archivado BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_estado ON solicitudes(estado);
CREATE INDEX IF NOT EXISTS idx_solicitudes_ticket ON solicitudes(ticket_number);
CREATE INDEX IF NOT EXISTS idx_solicitudes_archivado ON solicitudes(archivado);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS solicitudes_updated_at ON solicitudes;
CREATE TRIGGER solicitudes_updated_at
  BEFORE UPDATE ON solicitudes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS prioridades_updated_at ON inventario_prioridades;
CREATE TRIGGER prioridades_updated_at
  BEFORE UPDATE ON inventario_prioridades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE inventario_prioridades;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE solicitudes;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RLS
ALTER TABLE inventario_prioridades ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Prioridades lectura pública" ON inventario_prioridades;
CREATE POLICY "Prioridades lectura pública"
  ON inventario_prioridades FOR SELECT USING (true);

DROP POLICY IF EXISTS "Prioridades escritura admin" ON inventario_prioridades;
CREATE POLICY "Prioridades escritura admin"
  ON inventario_prioridades FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Solicitudes inserción pública" ON solicitudes;
CREATE POLICY "Solicitudes inserción pública"
  ON solicitudes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Solicitudes lectura admin" ON solicitudes;
CREATE POLICY "Solicitudes lectura admin"
  ON solicitudes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Solicitudes actualización admin" ON solicitudes;
CREATE POLICY "Solicitudes actualización admin"
  ON solicitudes FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Solicitudes borrado admin" ON solicitudes;
CREATE POLICY "Solicitudes borrado admin"
  ON solicitudes FOR DELETE USING (true);
