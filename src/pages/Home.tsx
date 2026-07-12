import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Prioridad } from '../types/database';

const FALLBACK_ITEMS = [
  'Alimentos No Perecederos', 'Hidratación', 'Soluciones Fisiológicas', 'Medicinas Críticas',
  'Material de Trauma', 'Higiene y Aseo', 'Insumos Médicos', 'Equipos Quirúrgicos',
  'Material Descartable', 'Ferretería Médica',
];

export default function Home() {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [items, setItems] = useState<string[]>(FALLBACK_ITEMS);

  const fetchPrioridades = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from('inventario_prioridades').select('texto, orden').order('orden', { ascending: true });
    if (!error && data?.length) setItems(data.map((p: Pick<Prioridad, 'texto'>) => p.texto));
  }, []);

  useEffect(() => {
    const now = new Date();
    setCurrentDateTime(now.toLocaleDateString('es-VE') + ' - ' + now.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchPrioridades();
    const channel = supabase!.channel('prioridades-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventario_prioridades' }, () => fetchPrioridades())
      .subscribe();
    return () => { supabase!.removeChannel(channel); };
  }, [fetchPrioridades]);

  return (
    <>
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-primary-container text-xl sm:text-2xl md:text-3xl font-bold uppercase mb-2 tracking-tight">Centro de Acopio y Distribución</h2>
        <h3 className="text-secondary text-xs sm:text-sm font-semibold uppercase tracking-[0.15em]">Escuela de Medicina José María Vargas</h3>
      </div>
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-5xl p-4 sm:p-6 md:p-10 lg:p-12 flex flex-col items-center ambient-shadow-card soft-border">
        <div className="flex flex-col sm:flex-row w-full gap-4 mb-8 sm:mb-12 justify-center max-w-2xl">
          <Link to="/request" className="flex-1 text-white font-bold text-sm sm:text-base py-4 sm:py-5 rounded-full flex items-center justify-center uppercase tracking-wide hover:opacity-90 transition-opacity shadow-md" style={{ backgroundColor: '#960000' }}>¿Necesitas Ayuda?</Link>
          <Link to="/donate" className="flex-1 text-white font-bold text-sm sm:text-base py-4 sm:py-5 rounded-full flex items-center justify-center uppercase tracking-wide hover:opacity-90 transition-opacity shadow-md" style={{ backgroundColor: '#3B8C00' }}>¿Quieres Donar?</Link>
        </div>
        <div className="bg-primary-container w-full rounded-2xl p-5 sm:p-6 md:p-10 text-on-primary shadow-inner">
          <div className="text-center mb-6 sm:mb-8 border-b border-white/10 pb-4 sm:pb-6">
            <h4 className="text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-tight font-medium">Pide lo que necesitas, y dona lo que puedas</h4>
            <p className="text-primary-fixed-dim mt-3 uppercase tracking-wider text-xs font-semibold flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-error inline-block animate-pulse"></span>
              Hoy lo más necesitado: <span className="font-bold">{currentDateTime}</span>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <span className="text-primary-fixed-dim font-bold text-xl leading-none w-6 text-center opacity-70">{index + 1}</span>
                <span className="font-semibold text-sm uppercase tracking-wide">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 sm:mt-12 text-center w-full">
          <h2 className="text-secondary text-xl sm:text-2xl md:text-3xl font-serif italic uppercase tracking-wider opacity-90">
            ¡En todo amar y servir!<br />
            <span className="text-primary-container font-sans font-bold mt-2 block text-[12px]">Jesús te ama</span>
          </h2>
        </div>
      </div>
    </>
  );
}
