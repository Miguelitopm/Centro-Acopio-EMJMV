import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import fondoUrl from '../assets/fondo.jpg';
import logoUrl from '../assets/logo_vargas.png';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div className="bg-pattern min-h-screen text-on-background font-sans flex flex-col relative overflow-x-hidden">
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.3]" 
        style={{ 
          backgroundImage: `url(${fondoUrl})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
          backgroundAttachment: 'fixed'
        }} 
      />
      
      {/* TopAppBar */}
      <header className="bg-surface-container-lowest/90 backdrop-blur-md w-full z-50 border-b soft-border">
        <div className="relative flex flex-col items-center justify-center w-full pt-4 sm:pt-6 pb-2 px-4 text-center max-w-7xl mx-auto">
          <img 
            src={logoUrl} 
            alt="Logo Escuela de Medicina José María Vargas" 
            className="absolute top-2 left-2 sm:top-4 sm:left-4 md:top-6 md:left-8 w-12 sm:w-16 md:w-20 lg:w-24 object-contain drop-shadow-md z-10"
          />
          <h1 className="relative z-20 text-[1.4rem] leading-tight sm:text-3xl lg:text-5xl font-bold text-primary uppercase tracking-tight mb-1 sm:mb-2 px-14 sm:px-16 md:px-32">
            Escuela de Medicina José María Vargas
          </h1>
          <p className="text-[10px] sm:text-sm font-semibold text-outline uppercase tracking-[0.15em] mb-0.5 sm:mb-1 mt-1 sm:mt-0">
            Venezuela en Emergencia:
          </p>
          <p className="text-primary font-bold text-xs sm:text-xl md:text-2xl tracking-tight uppercase">
            Nuestra Misión es Actuar
          </p>
          
          <nav className="mt-3 sm:mt-5 flex flex-row flex-nowrap justify-center gap-x-2 sm:gap-6 md:gap-8 w-full sm:w-auto text-center px-0">
            <Link 
              to="/" 
              className={`whitespace-nowrap font-medium transition-colors px-1 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-sm tracking-tight sm:tracking-wide ${location.pathname === '/' ? 'text-primary border-b-2 border-primary font-bold' : 'text-outline hover:text-primary'}`}
            >
              Inicio - Ayuda 2026
            </Link>
            <Link 
              to="/request" 
              className={`whitespace-nowrap font-medium transition-colors px-1 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-sm tracking-tight sm:tracking-wide ${location.pathname === '/request' ? 'text-primary border-b-2 border-primary font-bold' : 'text-outline hover:text-primary'}`}
            >
              ¿Necesitas Ayuda?
            </Link>
            <Link 
              to="/donate" 
              className={`whitespace-nowrap font-medium transition-colors px-1 py-1 sm:px-4 sm:py-2 text-[10px] sm:text-sm tracking-tight sm:tracking-wide ${location.pathname === '/donate' ? 'text-primary border-b-2 border-primary font-bold' : 'text-outline hover:text-primary'}`}
            >
              ¿Quieres donar?
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.3 }}
          className="flex-grow flex flex-col items-center justify-start px-4 py-8 sm:py-10 relative z-20 w-full max-w-7xl mx-auto overflow-x-hidden"
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between py-6 sm:py-8 px-4 mt-8 sm:mt-12 bg-transparent z-10 relative">
        <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 justify-center mb-6 md:mb-0">
          <a href="#" className="text-on-surface-variant text-sm font-semibold hover:text-secondary uppercase tracking-wider transition-colors text-center">Aliados Institucionales</a>
          <a href="#" className="text-on-surface-variant text-sm font-semibold hover:text-secondary uppercase tracking-wider transition-colors text-center">Privacidad</a>
          <a href="#" className="text-on-surface-variant text-sm font-semibold hover:text-secondary uppercase tracking-wider transition-colors text-center">Contacto</a>
        </div>
        <p className="text-on-surface-variant/80 text-sm font-semibold text-center md:text-right w-full md:w-auto">
          Escuela de Medicina José María Vargas © 2026 - Misión Venezuela
        </p>
      </footer>
    </div>
  );
}
