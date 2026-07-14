import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Ticket, Download, CheckCircle2 } from 'lucide-react';

import logoUrl from '../assets/logo_vargas.png';

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
      // Dynamically import html2canvas-pro to avoid slowing down initial load
      const html2canvasModule = await import('html2canvas-pro');
      const html2canvas = html2canvasModule.default || html2canvasModule;

      if (typeof html2canvas !== 'function') {
        throw new Error('html2canvas could not be loaded as a function');
      }

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
    } catch (error: any) {
      console.error('Error downloading ticket:', error);
      alert('Hubo un error al generar la imagen: ' + (error?.message || String(error)));
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
            className="relative w-full max-w-md bg-gray-100 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] z-10"
          >
            {/* Contenedor oculto para la descarga (Formato Carta original) */}
            <div style={{ position: 'absolute', left: '-9999px', top: '0', width: '800px', pointerEvents: 'none' }}>
              <div ref={ticketRef} className="bg-white p-8 border border-gray-100 rounded-lg w-full font-sans text-gray-800">
                {/* Letter Header */}
                <div className="flex justify-between items-start pb-6 border-b border-dashed border-gray-300">
                  <div className="flex items-center gap-4">
                    <img src={logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
                    <div>
                      <h2 className="text-base font-black text-gray-900 uppercase tracking-tight">
                        Centro de Acopio y Distribución
                      </h2>
                      <p className="text-xs text-gray-500 font-semibold uppercase">
                        Escuela de Medicina Vargas
                      </p>
                      <p className="text-xs text-primary font-bold uppercase tracking-wider mt-1">
                        Solicitud de Ayuda / Insumos
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {status === 'success' ? (
                      <span className="bg-primary/10 border border-primary/20 text-primary font-sans font-bold px-3 py-1 rounded-lg text-sm whitespace-nowrap inline-flex items-center gap-1.5">
                        <span>TICKET</span>
                        <span>#{data.ticketNumber}</span>
                      </span>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 font-bold px-3 py-1 rounded-lg text-xs uppercase tracking-wider whitespace-nowrap">
                        Vista Previa
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 font-mono tracking-widest uppercase mt-0.5">
                      {data.dateTime}
                    </p>
                  </div>
                </div>

                {status === 'success' && (
                  <div className="my-4 bg-green-50 border border-green-200 text-green-800 text-xs font-medium p-3 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span>En cuanto esté lista la solicitud nos comunicaremos con la persona de contacto.</span>
                  </div>
                )}

                {/* Letter Body: Two column layout for details */}
                <div className={status === 'preview' ? "grid grid-cols-1 gap-6 my-6 text-sm" : "grid grid-cols-1 md:grid-cols-2 gap-6 my-6 text-sm"}>
                  {/* Column 1: Solicitante */}
                  <div className="space-y-2 md:border-r md:border-gray-200 md:pr-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pb-1 border-b border-dashed border-gray-200 mb-2">
                      Datos del Solicitante
                    </h3>
                    <div className="flex justify-between py-1 border-b border-gray-100/50">
                      <span className="text-gray-500">Solicitante:</span>
                      <span className="font-semibold text-gray-900 text-right">{data.nombreSolicitante}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100/50">
                      <span className="text-gray-500">Cédula:</span>
                      <span className="font-medium text-gray-900 text-right">{data.cedulaSolicitante}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100/50">
                      <span className="text-gray-500">Correo:</span>
                      <span className="font-medium text-gray-900 text-right break-all max-w-[200px]">{data.correoSolicitante}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100/50">
                      <span className="text-gray-500">Tipo:</span>
                      <span className="font-medium text-gray-900 text-right uppercase">
                        {data.tipoSolicitante === 'particular' ? 'Particular' : 'Institución / Grupo'}
                      </span>
                    </div>
                    {data.tipoSolicitante === 'institucion' && data.nombreInstitucion && (
                      <div className="flex justify-between py-1 border-b border-gray-100/50">
                        <span className="text-gray-500">Institución:</span>
                        <span className="font-medium text-gray-900 text-right">{data.nombreInstitucion}</span>
                      </div>
                    )}
                    {data.tipoSolicitante === 'institucion' && data.beneficiarios && (
                      <div className="flex justify-between py-1 border-b border-gray-100/50">
                        <span className="text-gray-500">Beneficiarios:</span>
                        <span className="font-medium text-gray-900 text-right">{data.beneficiarios} personas</span>
                      </div>
                    )}
                  </div>

                  {/* Column 2: Contacto y Envio */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pb-1 border-b border-dashed border-gray-200 mb-2">
                      Datos de Contacto y Envío
                    </h3>
                    <div className="flex justify-between py-1 border-b border-gray-100/50">
                      <span className="text-gray-500">Contacto:</span>
                      <span className="font-semibold text-gray-900 text-right">{data.nombreContacto}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100/50">
                      <span className="text-gray-500">Cédula Contacto:</span>
                      <span className="font-medium text-gray-900 text-right">{data.cedulaContacto}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100/50">
                      <span className="text-gray-500">Teléfono:</span>
                      <span className="font-medium text-gray-900 text-right">{data.telefonoContacto}</span>
                    </div>
                    {data.telefonoContactoAlt && (
                      <div className="flex justify-between py-1 border-b border-gray-100/50">
                        <span className="text-gray-500">Teléfono Alt:</span>
                        <span className="font-medium text-gray-900 text-right">{data.telefonoContactoAlt}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-b border-gray-100/50">
                      <span className="text-gray-500">Correo Contacto:</span>
                      <span className="font-medium text-gray-900 text-right break-all max-w-[200px]">{data.correoContacto}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100/50">
                      <span className="text-gray-500">Método de Envío:</span>
                      <span className="font-bold text-gray-900 uppercase bg-gray-200/80 px-3 py-1 rounded text-xs whitespace-nowrap">
                        {data.tipoEnvio === 'retiro' ? 'Retiro en Centro' : 'Delivery'}
                      </span>
                    </div>
                    {data.tipoEnvio === 'delivery' && data.direccion && (
                      <div className="flex flex-col py-1">
                        <span className="text-gray-500">Dirección:</span>
                        <span className="font-medium text-gray-900 leading-tight mt-1">{data.direccion}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Letter Items List */}
                <div className="mt-8">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pb-2 border-b-2 border-dashed border-gray-300 mb-4">
                    Insumos Solicitados
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-gray-300 text-xs font-bold text-gray-500 uppercase">
                          <th className="py-2 pr-4">Categoría</th>
                          <th className="py-2 pr-4">Descripción</th>
                          <th className="py-2 pl-2 text-center">Cantidad Solicitada</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(data.needItems).flatMap(([category, items]) => 
                          items.filter(item => item.description.trim() !== '').map((item, idx) => (
                            <tr key={item.id || idx} className="hover:bg-gray-50/30">
                              <td className="py-3 pr-4 font-medium text-gray-700">{category}</td>
                              <td className="py-3 pr-4 text-gray-900">{item.description}</td>
                              <td className="py-3 pl-2 text-center font-mono text-gray-900">{item.quantity || '-'}</td>
                            </tr>
                          ))
                        )}
                        {Object.values(data.needItems).flat().filter(item => item.description.trim() !== '').length === 0 && (
                          <tr>
                            <td colSpan={3} className="py-4 text-sm text-gray-500 italic text-center">
                              No se especificaron insumos.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Formal Footer notice */}
                <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
                  <p>Esta solicitud está sujeta a la disponibilidad de insumos en el Centro de Acopio.</p>
                  <p className="mt-1">Escuela de Medicina Vargas — Universidad Central de Venezuela</p>
                </div>
              </div>
            </div>

            {/* Vista en pantalla estilo Ticket de Recibo Térmico */}
            <div className="overflow-y-auto no-scrollbar flex-1 p-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 w-full overflow-hidden text-gray-800 font-sans">
                {/* Sprocket holes top */}
                <div className="flex justify-center items-center gap-2 px-2 py-2 select-none pointer-events-none overflow-hidden bg-white">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 bg-gray-100 rounded-full shrink-0" />
                  ))}
                </div>

                {/* Ticket Content */}
                <div className="px-6 pb-6 pt-4 flex flex-col items-center">
                  {/* Status Circle & Title */}
                  {status === 'success' ? (
                    <>
                      <div className="w-16 h-16 bg-green-100/80 border border-green-200/50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                      </div>
                      <h2 className="text-xl font-black text-gray-950 uppercase tracking-tight text-center">
                        Solicitud Enviada
                      </h2>
                      <div className="bg-[#f1f5f9] text-[#1e293b] text-sm font-bold px-4 py-1.5 rounded-full tracking-wider uppercase my-2 inline-flex items-center gap-1.5">
                        <span>TICKET</span>
                        <span>#{data.ticketNumber}</span>
                      </div>
                      <div className="bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] text-xs font-semibold p-4 rounded-2xl text-center leading-relaxed my-3 max-w-xs">
                        En cuanto esté lista la solicitud nos comunicaremos con la persona de contacto.
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-yellow-100/80 border border-yellow-200/50 rounded-full flex items-center justify-center mb-4">
                        <Ticket className="w-8 h-8 text-yellow-600" />
                      </div>
                      <h2 className="text-xl font-black text-gray-950 uppercase tracking-tight text-center">
                        Vista Previa de Solicitud
                      </h2>
                      <div className="bg-yellow-50 border border-yellow-150 text-yellow-800 text-xs font-semibold p-4 rounded-2xl text-center leading-relaxed my-3 max-w-xs">
                        Revisa detalladamente la información de tu solicitud antes de confirmarla.
                      </div>
                    </>
                  )}

                  {/* Timestamp */}
                  <p className="text-xs text-gray-400 font-mono tracking-widest text-center mt-1 mb-4">
                    {data.dateTime}
                  </p>

                  <div className="w-full text-left space-y-4">
                    {/* Section 1: Datos del Solicitante */}
                    <div>
                      <div className="border-t border-dashed border-gray-300 my-2" />
                      <h3 className="text-xs font-bold text-[#94a3b8] tracking-widest uppercase mb-2">
                        Datos del Solicitante
                      </h3>
                      <div className="border-t border-dashed border-gray-300 my-2" />
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between py-0.5">
                          <span className="text-gray-500">Solicitante:</span>
                          <span className="font-bold text-gray-900 text-right">{data.nombreSolicitante}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-gray-500">Cédula:</span>
                          <span className="font-medium text-gray-950 text-right">{data.cedulaSolicitante}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-gray-500">Correo:</span>
                          <span className="font-medium text-gray-950 text-right break-all max-w-[200px]">{data.correoSolicitante}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-gray-500">Tipo:</span>
                          <span className="font-bold text-gray-900 text-right uppercase">
                            {data.tipoSolicitante === 'particular' ? 'PARTICULAR' : 'INSTITUCIÓN / GRUPO'}
                          </span>
                        </div>
                        {data.tipoSolicitante === 'institucion' && data.nombreInstitucion && (
                          <div className="flex justify-between py-0.5">
                            <span className="text-gray-500">Institución:</span>
                            <span className="font-medium text-gray-950 text-right">{data.nombreInstitucion}</span>
                          </div>
                        )}
                        {data.tipoSolicitante === 'institucion' && data.beneficiarios && (
                          <div className="flex justify-between py-0.5">
                            <span className="text-gray-500">Beneficiarios:</span>
                            <span className="font-medium text-gray-950 text-right">{data.beneficiarios} personas</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 2: Datos de Contacto y Envío */}
                    <div>
                      <h3 className="text-xs font-bold text-[#94a3b8] tracking-widest uppercase mb-2">
                        Datos de Contacto y Envío
                      </h3>
                      <div className="border-t border-dashed border-gray-300 my-2" />
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between py-0.5">
                          <span className="text-gray-500">Contacto:</span>
                          <span className="font-bold text-gray-900 text-right">{data.nombreContacto}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-gray-500">Cédula Contacto:</span>
                          <span className="font-medium text-gray-950 text-right">{data.cedulaContacto}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-gray-500">Teléfono:</span>
                          <span className="font-bold text-gray-900 text-right">{data.telefonoContacto}</span>
                        </div>
                        {data.telefonoContactoAlt && (
                          <div className="flex justify-between py-0.5">
                            <span className="text-gray-500">Teléfono Alt:</span>
                            <span className="font-medium text-gray-950 text-right">{data.telefonoContactoAlt}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-0.5">
                          <span className="text-gray-500">Correo Contacto:</span>
                          <span className="font-medium text-gray-950 text-right break-all max-w-[200px]">{data.correoContacto}</span>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span className="text-gray-500">Método de Envío:</span>
                          <span className="font-bold text-gray-900 text-right uppercase">
                            {data.tipoEnvio === 'retiro' ? 'RETIRO EN CENTRO' : 'DELIVERY'}
                          </span>
                        </div>
                        {data.tipoEnvio === 'delivery' && data.direccion && (
                          <div className="flex flex-col py-1">
                            <span className="text-gray-500 mb-0.5">Dirección:</span>
                            <span className="font-medium text-gray-950 leading-tight break-words">{data.direccion}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Section 3: Insumos Solicitados */}
                    <div>
                      <h3 className="text-xs font-bold text-[#94a3b8] tracking-widest uppercase mb-2">
                        Insumos Solicitados
                      </h3>
                      <div className="border-t border-dashed border-gray-300 my-2" />
                      <div className="space-y-3">
                        {Object.entries(data.needItems).map(([category, items]) => {
                          const filteredItems = items.filter(item => item.description.trim() !== '');
                          if (filteredItems.length === 0) return null;
                          return (
                            <div key={category} className="space-y-1">
                              <div className="text-xs font-extrabold text-gray-900 uppercase">
                                {category.toUpperCase().replace(/\s+/g, '')}
                              </div>
                              {filteredItems.map((item, idx) => (
                                <div key={item.id || idx} className="flex justify-between py-0.5 text-sm text-gray-800">
                                  <span className="text-gray-600">{item.description}</span>
                                  <span className="font-bold text-gray-900 text-right shrink-0 ml-4">{item.quantity || '-'}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                        {Object.values(data.needItems).flat().filter(item => item.description.trim() !== '').length === 0 && (
                          <p className="text-sm text-gray-400 italic text-center py-2">
                            No se especificaron insumos.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sprocket holes bottom */}
                <div className="flex justify-center items-center gap-2 px-2 py-2 select-none pointer-events-none overflow-hidden bg-white">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 bg-gray-100 rounded-full shrink-0" />
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
