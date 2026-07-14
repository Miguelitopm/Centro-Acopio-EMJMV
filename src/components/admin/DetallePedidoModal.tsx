import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, Download, FileText } from 'lucide-react';
import logoUrl from '../../assets/logo_vargas.png';
import type { Solicitud } from '../../types/database';
import EstadoBadge from './EstadoBadge';

interface DetallePedidoModalProps {
  solicitud: Solicitud | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatFecha(fecha: string) {
  return new Date(fecha).toLocaleString('es-VE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default function DetallePedidoModal({ solicitud, isOpen, onClose }: DetallePedidoModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
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
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleDownload = async () => {
    if (!invoiceRef.current || !solicitud) return;

    try {
      setIsDownloading(true);
      const html2canvasModule = await import('html2canvas-pro');
      const html2canvas = html2canvasModule.default || html2canvasModule;

      if (typeof html2canvas !== 'function') {
        throw new Error('html2canvas could not be loaded as a function');
      }

      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `factura-pedido-${solicitud.ticket_number}.png`;
      link.click();
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      alert('Hubo un error al generar la imagen: ' + (error?.message || String(error)));
    } finally {
      setIsDownloading(false);
    }
  };

  if (!solicitud || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 print:p-0 print:static" style={{ isolation: 'isolate' }}>
          {/* Overlay (hidden during print) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[-1] print:hidden"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] z-10 print:max-h-full print:shadow-none print:w-full print:max-w-none print:rounded-none print:static"
          >
            {/* Header (hidden during print) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 print:hidden shrink-0">
              <div className="flex items-center gap-2 text-primary font-bold">
                <FileText className="w-5 h-5" />
                <span className="text-base uppercase tracking-wider font-extrabold">Vista Factura / Detalle</span>
              </div>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Area */}
            <div className="overflow-y-auto flex-1 no-scrollbar p-6 print:overflow-visible print:p-0">
              <div ref={invoiceRef} className="bg-white p-6 sm:p-8 border border-gray-100 rounded-xl print:border-none print:p-0">
                {/* Decorative top row for invoice ticket look */}
                <div className="h-3 bg-gray-100 w-full flex space-x-1.5 overflow-hidden px-1 pt-1 rounded-t-lg print:hidden">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full bg-white -mt-1.5" />
                  ))}
                </div>

                <div className="p-6 bg-gray-50/50 border-x border-b border-gray-100 rounded-b-lg print:border-none print:bg-white print:p-0">
                  {/* Title & Badge */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-dashed border-gray-300">
                    <div className="flex items-center gap-4">
                      <img src={logoUrl} alt="Logo" className="w-14 h-14 object-contain" />
                      <div>
                        <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">
                          Centro de Acopio y Distribución
                        </h2>
                        <p className="text-xs text-gray-500 font-semibold tracking-wide uppercase mt-0.5">
                          Escuela de Medicina Vargas
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono mt-1.5">
                          FECHA: {formatFecha(solicitud.fecha_hora)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className="font-sans font-bold text-base text-primary bg-primary/10 px-3 py-1 rounded-lg border border-primary/20 mr-2 whitespace-nowrap">
                        #{solicitud.ticket_number}
                      </span>
                      <EstadoBadge estado={solicitud.estado} />
                    </div>
                  </div>

                  {/* Two Column details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 text-sm">
                    {/* Column 1: Solicitante */}
                    <div className="space-y-2 border-b md:border-b-0 md:border-r border-gray-200 pb-6 md:pb-0 pr-0 md:pr-4 last:border-r-0 print:border-r print:pr-4 print:pb-0">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pb-1 border-b border-dashed border-gray-200 mb-2">
                        Datos del Solicitante
                      </h3>
                      <div className="flex justify-between py-1 border-b border-gray-100/50"><span className="text-gray-500">Nombre:</span><span className="font-semibold text-gray-900 text-right">{solicitud.nombre_solicitante}</span></div>
                      <div className="flex justify-between py-1 border-b border-gray-100/50"><span className="text-gray-500">Cédula:</span><span className="font-medium text-gray-900 text-right">{solicitud.cedula_solicitante}</span></div>
                      <div className="flex justify-between py-1 border-b border-gray-100/50"><span className="text-gray-500">Correo:</span><span className="font-medium text-gray-900 text-right break-all max-w-[200px]">{solicitud.correo_solicitante}</span></div>
                      <div className="flex justify-between py-1 border-b border-gray-100/50"><span className="text-gray-500">Tipo:</span><span className="font-medium text-gray-900 text-right uppercase">{solicitud.tipo_solicitante === 'persona' ? 'Persona Natural' : 'Institución'}</span></div>
                      {solicitud.nombre_institucion && (
                        <div className="flex justify-between py-1 border-b border-gray-100/50"><span className="text-gray-500">Institución:</span><span className="font-medium text-gray-900 text-right">{solicitud.nombre_institucion}</span></div>
                      )}
                      {solicitud.beneficiarios && (
                        <div className="flex justify-between py-1 border-b border-gray-100/50"><span className="text-gray-500">Beneficiarios:</span><span className="font-medium text-gray-900 text-right">{solicitud.beneficiarios} personas</span></div>
                      )}
                    </div>

                    {/* Column 2: Contacto y Envio */}
                    <div className="space-y-2">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pb-1 border-b border-dashed border-gray-200 mb-2">
                        Datos de Contacto y Envío
                      </h3>
                      <div className="flex justify-between py-1 border-b border-gray-100/50"><span className="text-gray-500">Contacto:</span><span className="font-semibold text-gray-900 text-right">{solicitud.nombre_contacto}</span></div>
                      <div className="flex justify-between py-1 border-b border-gray-100/50"><span className="text-gray-500">Cédula Contacto:</span><span className="font-medium text-gray-900 text-right">{solicitud.cedula_contacto}</span></div>
                      <div className="flex justify-between py-1 border-b border-gray-100/50"><span className="text-gray-500">Teléfono:</span><span className="font-medium text-gray-900 text-right">{solicitud.telefono_contacto}</span></div>
                      {solicitud.telefono_contacto_alt && (
                        <div className="flex justify-between py-1 border-b border-gray-100/50"><span className="text-gray-500">Teléfono Alt:</span><span className="font-medium text-gray-900 text-right">{solicitud.telefono_contacto_alt}</span></div>
                      )}
                      <div className="flex justify-between py-1 border-b border-gray-100/50"><span className="text-gray-500">Correo Contacto:</span><span className="font-medium text-gray-900 text-right break-all max-w-[200px]">{solicitud.correo_contacto}</span></div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-100/50">
                        <span className="text-gray-500">Método de Envío:</span>
                        <span className="font-bold text-gray-900 uppercase bg-gray-200/80 px-2.5 py-0.5 rounded text-xs whitespace-nowrap">
                          {solicitud.tipo_envio === 'retiro' ? 'Retiro en Centro' : 'Delivery'}
                        </span>
                      </div>
                      {solicitud.tipo_envio === 'delivery' && solicitud.direccion && (
                        <div className="flex flex-col py-1"><span className="text-gray-500">Dirección:</span><span className="font-medium text-gray-900 leading-tight mt-1">{solicitud.direccion}</span></div>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="mt-8">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pb-2 border-b-2 border-dashed border-gray-300 mb-4">
                      Detalle de Insumos Entregados / Solicitados
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-gray-300 text-xs font-bold text-gray-500 uppercase">
                            <th className="py-2 pr-4">Categoría</th>
                            <th className="py-2 pr-4">Descripción</th>
                            <th className="py-2 px-2 text-center">Cant. Solicitada</th>
                            <th className="py-2 pl-2 text-center bg-green-50/50 print:bg-transparent">Cant. Entregada</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {solicitud.insumos_solicitados.map((item, idx) => {
                            const entregado = solicitud.insumos_entregados?.find(e => e.id === item.id) || solicitud.insumos_entregados?.[idx];

                            return (
                              <tr key={item.id || idx} className="hover:bg-gray-50/30">
                                <td className="py-3 pr-4 font-medium text-gray-700">{item.categoria}</td>
                                <td className="py-3 pr-4 text-gray-900">{item.descripcion}</td>
                                <td className="py-3 px-2 text-center font-mono text-gray-900">{item.cantidad_solicitada}</td>
                                <td className="py-3 pl-2 text-center font-mono text-green-800 bg-green-50/30 print:bg-transparent font-bold">
                                  {entregado?.cantidad_entregada || item.cantidad_entregada || '-'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bottom decorative border */}
                  <div className="h-3 bg-gray-100 w-full flex space-x-1.5 overflow-hidden px-1 pb-1 rounded-b-lg mt-8 rotate-180 print:hidden">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div key={i} className="w-3 h-3 rounded-full bg-white -mt-1.5" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="bg-gray-100 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end rounded-b-2xl border-t border-gray-200 print:hidden shrink-0">
              {solicitud?.estado === 'entregado' && (
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 text-on-primary rounded-xl font-bold uppercase text-xs tracking-wider shadow-sm transition-colors disabled:opacity-75"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Generando PNG...' : 'Descargar Factura'}</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-bold uppercase text-xs tracking-wider transition-colors"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
          
          {/* Custom style block for print mode */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * {
                visibility: hidden;
              }
              .print\\:static, .print\\:static * {
                visibility: visible;
              }
              .print\\:static {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
              .print\\:hidden {
                display: none !important;
              }
              .print\\:bg-transparent {
                background-color: transparent !important;
              }
            }
          `}} />
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
