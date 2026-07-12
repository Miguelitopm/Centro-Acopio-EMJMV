import { isSupabaseConfigured } from '../lib/supabase';
import { AlertCircle, Database } from 'lucide-react';

export default function SupabaseGuard({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 text-center max-w-lg mx-auto mt-12">
        <Database className="w-12 h-12 text-primary mx-auto mb-4 opacity-60" />
        <h2 className="text-lg font-bold text-primary mb-2">Supabase no configurado</h2>
        <p className="text-on-surface-variant text-sm mb-4">
          Crea <code className="bg-surface-container px-2 py-0.5 rounded">.env.local</code> con tus credenciales.
        </p>
        <p className="text-on-surface-variant text-sm flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Ejecuta <code className="bg-surface-container px-2 py-0.5 rounded">supabase/schema.sql</code>
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
