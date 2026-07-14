/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import SupabaseGuard from './components/SupabaseGuard';

// Carga diferida (Lazy Loading) — cada página se descarga sólo cuando se visita
const Home = lazy(() => import('./pages/Home'));
const RequestHelp = lazy(() => import('./pages/RequestHelp'));
const Donate = lazy(() => import('./pages/Donate'));
const PrioridadesAdmin = lazy(() => import('./components/admin/PrioridadesAdmin'));
const BandejaAdmin = lazy(() => import('./components/admin/BandejaAdmin'));

// Indicador de carga mostrado mientras se descarga el chunk correspondiente
function LoadingFallback() {
  return (
    <div className="flex justify-center items-center py-20 w-full min-h-[40vh]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/request" element={<Layout><RequestHelp /></Layout>} />
          <Route path="/donate" element={<Layout><Donate /></Layout>} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/prioridades" replace />} />
            <Route path="prioridades" element={<SupabaseGuard><PrioridadesAdmin /></SupabaseGuard>} />
            <Route path="bandeja" element={<SupabaseGuard><BandejaAdmin /></SupabaseGuard>} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
