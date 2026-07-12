import React from 'react';
import { Link } from 'react-router-dom';
import images1Url from '../assets/images.png';

export default function Donate() {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center -z-10 overflow-hidden">
        <div 
          className="w-full h-[600px] bg-no-repeat bg-center bg-contain" 
          style={{ backgroundImage: `url(${images1Url})` }}
        />
      </div>

      <div className="w-full max-w-4xl bg-surface-container-lowest/80 backdrop-blur-sm rounded-2xl p-6 md:p-10 flex flex-col gap-10 relative mt-4 shadow-sm border border-outline-variant/30">
        
        <div className="flex flex-col items-center mb-8 gap-2">
          <div className="flex items-center gap-3 text-primary font-serif font-bold text-2xl md:text-3xl tracking-widest uppercase text-center">
            <span className="material-symbols-outlined text-secondary text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>volunteer_activism</span>
            ¿Quieres Donar?
          </div>
          <p className="text-on-surface-variant text-lg md:text-xl font-serif italic max-w-2xl text-center">
            "Tu aporte, por pequeño que sea, transforma vidas."
          </p>
        </div>

        <div className="flex flex-col">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-low border border-outline-variant/50 hover:border-primary/30 transition-colors duration-300 rounded-xl p-6 text-on-surface flex flex-col gap-3">
              <h4 className="text-[#4a3728] font-bold text-sm tracking-widest uppercase mb-1 border-b border-outline-variant/30 pb-2">Cuenta Nacional</h4>
              <div className="text-base space-y-2 text-on-surface-variant">
                <p className="font-bold text-primary font-serif text-lg">BANCO DE VENEZUELA</p>
                <p>Beneficiario: Hospital Vargas de Caracas</p>
                <p>RIF: G-20000000-0</p>
                <p>Cuenta: <span className="font-mono text-primary font-medium">0102-0000-00-0000000000</span></p>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/50 hover:border-primary/30 transition-colors duration-300 rounded-xl p-6 text-on-surface flex flex-col gap-3">
              <h4 className="text-[#4a3728] font-bold text-sm tracking-widest uppercase mb-1 border-b border-outline-variant/30 pb-2">Cuenta Internacional</h4>
              <div className="text-base space-y-2 text-on-surface-variant">
                <p className="font-bold text-primary font-serif text-lg">BANCO TD BANK N.A.</p>
                <p>Beneficiario: Unidos por el Vargas Foundation Inc.</p>
                <p>Dirección: 123 Health Ave, Miami, FL 33130</p>
                <p>ACC #: <span className="font-mono text-primary font-medium">1234567890</span></p>
                <p>ABA / ROUTING: <span className="font-mono text-primary font-medium">012345678</span></p>
                <p>SWIFT / BIC: <span className="font-mono text-primary font-medium">TDBKUS33</span></p>
                <p className="font-medium text-primary">Concepto: Emergencia 2026</p>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/50 hover:border-primary/30 transition-colors duration-300 rounded-xl p-6 text-on-surface flex flex-col gap-3">
              <h4 className="text-[#4a3728] font-bold text-sm tracking-widest uppercase mb-1 border-b border-outline-variant/30 pb-2">Cuenta Internacional <span className="text-xs text-on-surface-variant/70 tracking-normal">(Desde España)</span></h4>
              <div className="text-base space-y-2 text-on-surface-variant">
                <p>IBAN: <span className="font-mono text-primary font-medium">ES00 0000 0000 0000 0000 0000</span></p>
                <p>Beneficiario: Fundación Salud sin Fronteras</p>
                <p className="font-medium text-primary">Concepto: Hospital Vargas Emergencia</p>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant/50 hover:border-primary/30 transition-colors duration-300 rounded-xl p-6 text-on-surface flex flex-col gap-3">
              <h4 className="text-[#4a3728] font-bold text-sm tracking-widest uppercase mb-1 border-b border-outline-variant/30 pb-2">Zelle</h4>
              <div className="text-base space-y-2 text-on-surface-variant flex flex-col h-full justify-center">
                <p className="text-center text-lg"><strong className="text-primary font-serif block mb-1">ZELLE:</strong> <span className="text-secondary break-all">donaciones@unidosporvargas.org</span></p>
                <p className="text-center font-medium text-primary mt-2">Concepto: Emergencia 2026</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-outline-variant/30 my-2"></div>

        <div className="flex flex-col text-center items-center">
          <h3 className="text-primary text-2xl font-serif mb-4 uppercase tracking-widest font-bold">¿Quieres Donar Insumos?</h3>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed mb-6">
            En el Centro de Acopio del Hospital Vargas de Caracas, recibimos todos los insumos médicos y quirúrgicos que quieras donar.
          </p>
          <div className="bg-surface-container-low border border-outline-variant/50 rounded-xl p-6 text-left max-w-2xl w-full flex flex-col gap-3">
            <p className="text-on-surface-variant">
              <strong className="text-primary">Ubicación:</strong> Caracas, Parroquia San José (San José Cotiza).
            </p>
            <p className="text-on-surface-variant">
              <strong className="text-primary">Dirección:</strong> Esquina de San Lorenzo a Pirineos, Edificio de Ciencias Básicas II.
            </p>
            <p className="text-on-surface-variant">
              <strong className="text-primary">Puntos de referencia:</strong> Detrás del Hospital Vargas de Caracas y frente al Banco Municipal de Sangre.
            </p>
            <div className="mt-4 flex justify-start">
              <a 
                href="https://maps.app.goo.gl/5dwDnMRrnrwRY35SA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-on-primary bg-primary hover:bg-primary-container px-6 py-3 rounded-full transition-colors uppercase text-sm font-bold tracking-wider shadow-md hover:shadow-lg"
              >
                <span className="material-symbols-outlined text-xl">location_on</span>
                Ver en Google Maps
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 pt-8 border-t border-outline-variant/20 flex flex-col items-center gap-8 w-full">
          <div className="relative">
            <p className="text-on-surface-variant text-base sm:text-lg font-serif italic max-w-2xl px-4 sm:px-8 leading-relaxed">
              Agradecemos profundamente a quienes se han puesto a disposición para ayudar. En medio de la adversidad, la salud nos une.
            </p>
          </div>
          <h4 className="text-secondary text-xl sm:text-2xl font-serif font-bold uppercase tracking-[0.15em]">
            ¡Salvando Vidas Hoy!
          </h4>
          
          <Link to="/" className="inline-flex items-center text-secondary hover:text-primary text-sm font-bold uppercase tracking-widest transition-colors mt-4">
            <span className="material-symbols-outlined mr-2 text-sm">arrow_back</span>
            Volver al Inicio
          </Link>
        </div>

      </div>
    </>
  );
}
