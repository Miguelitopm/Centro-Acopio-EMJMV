import { Link, useLocation, Outlet } from 'react-router-dom';
import { ListOrdered, Inbox, Home } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const tabs = [
    { path: '/admin/prioridades', label: 'Función 1: Prioridades', icon: ListOrdered, short: 'Prioridades' },
    { path: '/admin/bandeja', label: 'Función 2: Bandeja', icon: Inbox, short: 'Bandeja' },
  ];

  return (
    <div className="min-h-screen bg-background text-on-background font-sans">
      <header className="bg-surface-container-lowest border-b border-outline-variant/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-primary uppercase tracking-tight">Panel Administrativo</h1>
            <p className="text-xs text-on-surface-variant">Hospital Vargas — Centro de Acopio</p>
          </div>
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-secondary hover:text-primary uppercase tracking-wider">
            <Home className="w-4 h-4" /> Ver Web Pública
          </Link>
        </div>
        <nav className="max-w-7xl mx-auto px-4 flex gap-1 border-t border-outline-variant/20">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            return (
              <Link key={tab.path} to={tab.path}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors ${isActive ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-primary'}`}>
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.short}</span>
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8"><Outlet /></main>
    </div>
  );
}
