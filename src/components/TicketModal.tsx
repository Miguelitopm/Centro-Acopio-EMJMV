import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Ticket, Download, CheckCircle2 } from 'lucide-react';

interface NeedItem {
  id: string;
  description: string;
  quantity: string;
}

interface TicketData {
  dateTime: string;
  nombreSolicitante: string;
  cedulaSolicitante: string;
  correoSolicitante: string;
  nombreContacto: string;
  cedulaContacto: string;
  telefonoContacto: string;
  correoContacto: string;
  telefonoContactoAlt: string;
  tipoSolicitante: string;
  nombreInstitucion?: string;
  needItems: Record<string, NeedItem[]>;
  beneficiarios: string;
  tipoEnvio: string;
  direccion?: string;
  ticketNumber?: string;
}

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  data: TicketData | null;
  status: 'preview' | 'success';
  isSubmitting?: boolean;
  submitError?: string | null;
}

export default function TicketModal({ isOpen, onClose, onConfirm, data, status, isSubmitting, submitError }: TicketModalProps) {
  const ticketRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    
    try {
      setIsDownloading(true);
      // Dynamically import html2canvas to avoid slowing down initial load
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2, // Better resolution
        backgroundColor: '#ffffff',
        useCORS: true,
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `solicitud-${data?.ticketNumber || 'donacion'}.png`;
      link.click();
    } catch (error) {
      console.error('Error downloading ticket:', error);
      alert('Hubo un error al generar la imagen. Por favor, intenta de nuevo.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (!data || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" style={{ isolation: 'isolate' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={status === 'preview' ? onClose : undefined}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[-1]"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-md bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] z-10"
          >
            <div className="overflow-y-auto no-scrollbar flex-1">
              <div ref={ticketRef} className="bg-white">
                {/* Ticket Header Pattern */}
                <div className="h-4 bg-[#f4f4f5] w-full flex space-x-2 overflow-hidden px-2 pt-2">
                   {Array.from({ length: 20 }).map((_, i) => (
                     <div key={i} className="w-4 h-4 rounded-full bg-black/60 -mt-2" />
                   ))}
                </div>

                <div className="p-6 sm:p-8 bg-[#fafafa]">
                  {/* Header */}
                  <div className="text-center mb-8 border-b-2 border-dashed border-gray-300 pb-6 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={status}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="flex justify-center mb-3">
                          <motion.div 
                            initial={status === 'success' ? { scale: 0.5, rotate: -45 } : false}
                            animate={status === 'success' ? { scale: 1, rotate: 0 } : false}
                            transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
                            className={`w-14 h-14 rounded-full flex items-center justify-center ${status === 'success' ? 'bg-green-100 text-green-600 shadow-inner' : 'bg-primary/10 text-primary'}`}
                          >
                            {status === 'success' ? <CheckCircle2 className="w-7 h-7" /> : <Ticket className="w-7 h-7" />}
                          </motion.div>
                        </div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase mb-1">
                          {status === 'success' ? 'Solicitud Enviada' : 'Confirmar Solicitud'}
                        </h2>
                        
                        {status === 'success' ? (
                          <div className="flex flex-col items-center">
                            <p className="text-sm font-bold text-gray-900 tracking-wider mt-2 mb-3 bg-gray-100 px-3 py-1 rounded-md">
                              TICKET #{data.ticketNumber}
                            </p>
                            <p className="text-xs text-green-800 font-medium mt-1 max-w-[240px] mx-auto leading-tight bg-green-50 p-2.5 rounded-lg border border-green-200 shadow-sm">
                              En cuanto esté lista la solicitud nos comunicaremos con la persona de contacto.
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 font-medium mt-2 max-w-[200px] mx-auto leading-tight">
                            Revisa los datos de tu solicitud antes de enviarla
                          </p>
                        )}
                        
                        <p className="text-[10px] text-gray-400 font-mono mt-4 uppercase tracking-widest">
                          {data.dateTime}
                        </p>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Body: Applicant Info */}
                  <div className="mb-6 space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b-2 border-dashed border-gray-300 pb-2">
                      Datos del Solicitante
                    </h3>
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-gray-500">Solicitante:</span>
                      <span className="font-semibold text-gray-900 text-right">{data.nombreSolicitante}</span>
                    </div>
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-gray-500">Cédula:</span>
                      <span className="font-medium text-gray-900 text-right">{data.cedulaSolicitante}</span>
                    </div>
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-gray-500">Correo:</span>
                      <span className="font-medium text-gray-900 text-right break-all">{data.correoSolicitante}</span>
                    </div>
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="font-medium text-gray-900 text-right uppercase">
                        {data.tipoSolicitante === 'persona' ? 'Persona Natural' : 'Institución / Grupo'}
                      </span>
                    </div>
                    {data.tipoSolicitante === 'institucion' && data.nombreInstitucion && (
                      <div className="flex justify-between items-start text-sm">
                        <span className="text-gray-500">Institución:</span>
                        <span className="font-medium text-gray-900 text-right">{data.nombreInstitucion}</span>
                      </div>
                    )}
                    {data.tipoSolicitante === 'institucion' && data.beneficiarios && (
                      <div className="flex justify-between items-start text-sm">
                        <span className="text-gray-500">Beneficiarios:</span>
                        <span className="font-medium text-gray-900 text-right">{data.beneficiarios} personas</span>
                      </div>
                    )}
                  </div>

                  {/* Body: Contact Info */}
                  <div className="mb-6 space-y-3">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b-2 border-dashed border-gray-300 pb-2">
                      Datos de Contacto y Envío
                    </h3>
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-gray-500">Contacto:</span>
                      <span className="font-medium text-gray-900 text-right">{data.nombreContacto}</span>
                    </div>
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-gray-500">Cédula Contacto:</span>
                      <span className="font-medium text-gray-900 text-right">{data.cedulaContacto}</span>
                    </div>
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-gray-500">Teléfono:</span>
                      <span className="font-medium text-gray-900 text-right">{data.telefonoContacto}</span>
                    </div>
                    {data.telefonoContactoAlt && (
                      <div className="flex justify-between items-start text-sm">
                        <span className="text-gray-500">Teléfono Alt:</span>
                        <span className="font-medium text-gray-900 text-right">{data.telefonoContactoAlt}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-gray-500">Correo Contacto:</span>
                      <span className="font-medium text-gray-900 text-right break-all">{data.correoContacto}</span>
                    </div>
                    <div className="flex justify-between items-start text-sm">
                      <span className="text-gray-500">Método de Envío:</span>
                      <span className="font-medium text-gray-900 text-right uppercase">
                        {data.tipoEnvio === 'retiro' ? 'Retiro en Centro' : 'Delivery'}
                      </span>
                    </div>
                    {data.tipoEnvio === 'delivery' && data.direccion && (
                      <div className="flex justify-between items-start text-sm">
                        <span className="text-gray-500 mr-4">Dirección:</span>
                        <span className="font-medium text-gray-900 text-right leading-tight">{data.direccion}</span>
                      </div>
                    )}
                  </div>

                  {/* Body: Needs Details */}
                  <div className="mb-2">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b-2 border-dashed border-gray-300 pb-2">
                      Insumos Solicitados
                    </h3>
                    
                    {Object.entries(data.needItems).map(([category, items]) => {
                      const validItems = items.filter(item => item.description.trim() !== '');
                      if (validItems.length === 0) return null;
                      
                      return (
                        <div key={category} className="mb-4 last:mb-0">
                          <h4 className="text-[11px] font-bold text-gray-700 uppercase mb-2">{category}</h4>
                          <ul className="space-y-2">
                            {validItems.map(item => (
                              <li key={item.id} className="flex justify-between items-start text-sm">
                                <span className="text-gray-600 flex-1 pr-4 leading-tight">{item.description}</span>
                                <span className="font-mono font-medium text-gray-900">{item.quantity || '-'}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                    
                    {Object.values(data.needItems).flat().filter(item => item.description.trim() !== '').length === 0 && (
                      <p className="text-sm text-gray-500 italic text-center py-2">No se especificaron insumos.</p>
                    )}
                  </div>
                </div>
                
                {/* Bottom edge pattern inside the downloadable ref area to keep the ticket look */}
                <div className="h-4 bg-[#f4f4f5] w-full flex space-x-2 overflow-hidden px-2 pb-2 rotate-180">
                   {Array.from({ length: 20 }).map((_, i) => (
                     <div key={i} className="w-4 h-4 rounded-full bg-black/60 -mt-2" />
                   ))}
                </div>
              </div>
            </div>

            {/* Footer / Actions - NOT included in the screenshot */}
            <div className="bg-[#f0f0f0] p-6 text-center space-y-3 rounded-b-xl border-t border-gray-200">
              {submitError && (
                <p className="text-red-600 text-xs font-medium bg-red-50 border border-red-200 rounded-lg p-2">{submitError}</p>
              )}
              {status === 'preview' ? (
                <>
                  <button onClick={onConfirm} disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-md uppercase text-sm tracking-widest disabled:opacity-60">
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Enviando...' : 'Confirmar y Enviar'}</span>
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm uppercase text-xs tracking-widest"
                  >
                    <X className="w-4 h-4" />
                    <span>Volver y Editar</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3.5 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-md uppercase text-sm tracking-widest disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isDownloading ? 'Generando Imagen...' : 'Descargar Solicitud'}</span>
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-sm uppercase text-xs tracking-widest"
                  >
                    <X className="w-4 h-4" />
                    <span>Cerrar</span>
                  </button>
                </>
              )}
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
