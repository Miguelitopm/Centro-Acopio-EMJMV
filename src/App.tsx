/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import SupabaseGuard from './components/SupabaseGuard';
import Home from './pages/Home';
import RequestHelp from './pages/RequestHelp';
import Donate from './pages/Donate';
import PrioridadesAdmin from './components/admin/PrioridadesAdmin';
import BandejaAdmin from './components/admin/BandejaAdmin';

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
