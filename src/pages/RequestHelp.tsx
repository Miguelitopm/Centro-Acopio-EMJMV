import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ArrowLeft } from 'lucide-react';
import TicketModal from '../components/TicketModal';
import { requireSupabase, isSupabaseConfigured } from '../lib/supabase';
import { flattenNeedItems } from '../lib/insumos';

export default function RequestHelp() {
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [tipoSolicitante, setTipoSolicitante] = useState('');
  const [tipoEnvio, setTipoEnvio] = useState('');
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);
  const [cedulaSolicitante, setCedulaSolicitante] = useState('');
  const [cedulaContacto, setCedulaContacto] = useState('');
  const [telefonoContacto, setTelefonoContacto] = useState('+58 ');
  const [telefonoContactoAlt, setTelefonoContactoAlt] = useState('+58 ');

  interface NeedItem {
    id: string;
    description: string;
    quantity: string;
  }
  const [needItems, setNeedItems] = useState<Record<string, NeedItem[]>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<'preview' | 'success'>('preview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ticketData, setTicketData] = useState<any>(null);

  useEffect(() => {
    const now = new Date();
    // Setting format exactly as in image: YYYY-MM-DD HH:mm
    const formatted = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0') + ' ' + String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
    setCurrentDateTime(formatted);
  }, []);

  const needsList = [
    "MEDICINAS",
    "MEDICINAS PEDIATRICAS",
    "INSUMOS MEDICOS",
    "INSUMOS PARA QUEMADURAS",
    "PRODUCTOS DE HIGIENE",
    "CARPAS",
    "COLCHONES Y COLCHONETAS",
    "EQUIPOS DE RESCATE",
    "AGUA E HIDRATACION",
    "ALIMENTOS NO PERECEDEROS",
    "ROPA ADULTOS",
    "ROPA BEBES Y NIÑOS",
    "EQUIPOS DE CONSTRUCCION",
    "SILLAS DE RUEDAS / MULETAS",
    "OTROS"
  ];

  const handleNeedChange = (need: string) => {
    setSelectedNeeds(prev => {
      const isSelected = prev.includes(need);
      if (isSelected) {
        return prev.filter(n => n !== need);
      } else {
        if (!needItems[need]) {
          setNeedItems(prevItems => ({
            ...prevItems,
            [need]: [{ id: Math.random().toString(), description: '', quantity: '' }]
          }));
        }
        return [...prev, need];
      }
    });
  };

  const handleAddRow = (category: string) => {
    setNeedItems(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), { id: Math.random().toString(), description: '', quantity: '' }]
    }));
  };

  const handleRemoveRow = (category: string, id: string) => {
    setNeedItems(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== id)
    }));
  };

  const handleItemChange = (category: string, id: string, field: keyof NeedItem, value: string) => {
    setNeedItems(prev => ({
      ...prev,
      [category]: prev[category].map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    let val = e.target.value.toUpperCase();

    if (val.length > 0 && !['V', 'E'].includes(val[0])) {
      return;
    }

    val = val.replace(/-/g, '');

    if (val.length > 1) {
      val = val.substring(0, 1) + '-' + val.substring(1);
    }

    if (val.length > 2) {
      const digits = val.substring(2);
      if (!/^\d*$/.test(digits)) {
        return;
      }
    }

    if (val.length <= 11) {
      setter(val);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    let raw = e.target.value;

    // If user erased past the "+" prefix, restore it
    if (!raw.startsWith('+')) {
      raw = '+' + raw.replace(/[^\d]/g, '');
    }

    // Strip everything except digits and the leading "+"
    const plusPrefix = raw.startsWith('+') ? '+' : '';
    const digitsOnly = raw.replace(/[^\d]/g, '');

    // Split into country code (first digits before space) and local number
    // Allow up to 4 digits for country code, then 10 digits for local
    // Format: +CC NNN NNN-NNNN
    let countryCode = '';
    let localDigits = '';

    if (digitsOnly.length <= 4) {
      // Still typing country code
      countryCode = digitsOnly;
    } else {
      // Find where country code ends: we assume country code is whatever
      // was before the first space in the original, or default 2 digits (58)
      // We'll parse from the original to determine country code length
      const withoutPlus = raw.replace(/^\+/, '');
      const spaceIdx = withoutPlus.indexOf(' ');
      
      if (spaceIdx > 0) {
        const ccPart = withoutPlus.substring(0, spaceIdx).replace(/[^\d]/g, '');
        countryCode = ccPart;
        localDigits = digitsOnly.substring(countryCode.length);
      } else {
        // Default: assume 2-digit country code (like 58)
        countryCode = digitsOnly.substring(0, 2);
        localDigits = digitsOnly.substring(2);
      }
    }

    // Limit local digits to exactly 10 (NNN NNN NNNN)
    localDigits = localDigits.substring(0, 10);

    // Build formatted string
    let formatted = plusPrefix + countryCode;
    if (localDigits.length > 0) {
      formatted += ' ' + localDigits.substring(0, 3);
    }
    if (localDigits.length > 3) {
      formatted += ' ' + localDigits.substring(3, 6);
    }
    if (localDigits.length > 6) {
      formatted += '-' + localDigits.substring(6, 10);
    }

    setter(formatted);
  };

  const isPhoneValid = (phone: string): boolean => {
    // Valid format: +CC NNN NNN-NNNN (10 local digits)
    const stripped = phone.replace(/[^\d]/g, '');
    // Country code (2-4 digits) + 10 local digits = 12-14 total digits
    // We check local digits specifically
    const plusPrefix = phone.startsWith('+') ? '+' : '';
    const withoutPlus = phone.replace(/^\+/, '');
    const spaceIdx = withoutPlus.indexOf(' ');
    if (spaceIdx <= 0) return false;
    const localPart = withoutPlus.substring(spaceIdx).replace(/[^\d]/g, '');
    return localPart.length === 10;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nombreSolicitante = (document.getElementById('nombre_solicitante') as HTMLInputElement).value;
    const correoSolicitante = (document.getElementById('correo_solicitante') as HTMLInputElement).value;
    const nombreContacto = (document.getElementById('nombre_contacto') as HTMLInputElement).value;
    const correoContacto = (document.getElementById('correo_contacto') as HTMLInputElement).value;
    const nombreInstitucion = tipoSolicitante === 'institucion' ? (document.getElementById('nombre_institucion') as HTMLInputElement)?.value : undefined;
    const beneficiarios = (document.getElementById('beneficiarios') as HTMLInputElement)?.value || '';
    const direccion = tipoEnvio === 'delivery' ? (document.getElementById('direccion') as HTMLTextAreaElement)?.value : undefined;

    setTicketData({
      dateTime: currentDateTime,
      nombreSolicitante,
      cedulaSolicitante,
      correoSolicitante,
      nombreContacto,
      cedulaContacto,
      telefonoContacto,
      correoContacto,
      telefonoContactoAlt: telefonoContactoAlt === '+58 ' ? '' : telefonoContactoAlt,
      tipoSolicitante,
      nombreInstitucion,
      needItems,
      beneficiarios,
      tipoEnvio,
      direccion
    });

    setTicketStatus('preview');
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (!ticketData) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const insumos = flattenNeedItems(ticketData.needItems);
      let ticketNumber: string;
      if (isSupabaseConfigured) {
        const { data, error } = await requireSupabase().from('solicitudes').insert({
          nombre_solicitante: ticketData.nombreSolicitante,
          cedula_solicitante: ticketData.cedulaSolicitante,
          correo_solicitante: ticketData.correoSolicitante,
          nombre_contacto: ticketData.nombreContacto,
          cedula_contacto: ticketData.cedulaContacto,
          telefono_contacto: ticketData.telefonoContacto,
          correo_contacto: ticketData.correoContacto,
          telefono_contacto_alt: ticketData.telefonoContactoAlt || null,
          tipo_solicitante: ticketData.tipoSolicitante,
          nombre_institucion: ticketData.nombreInstitucion || null,
          beneficiarios: ticketData.beneficiarios ? parseInt(ticketData.beneficiarios, 10) : null,
          tipo_envio: ticketData.tipoEnvio,
          direccion: ticketData.direccion || null,
          insumos_solicitados: insumos,
          estado: 'pendiente',
        }).select('ticket_number').single();
        if (error) throw error;
        ticketNumber = data.ticket_number;
      } else {
        ticketNumber = 'TK-' + Math.floor(1000 + Math.random() * 9000);
      }
      setTicketData((prev: typeof ticketData) => ({ ...prev, ticketNumber }));
      setTicketStatus('success');
    } catch (err: any) {
      console.error('Submission error:', err);
      const errorMsg = err?.message || err?.error_description || (typeof err === 'string' ? err : 'Error desconocido al enviar la solicitud');
      setSubmitError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);

    // Only reset form if we are closing from the success state
    if (ticketStatus === 'success') {
      setNeedItems({});
      setCedulaSolicitante('');
      setCedulaContacto('');
      setTelefonoContacto('+58 ');
      setTelefonoContactoAlt('+58 ');
      setSelectedNeeds([]);
      setTipoSolicitante('');
      setTipoEnvio('');
      (document.getElementById('nombre_solicitante') as HTMLInputElement).value = '';
      (document.getElementById('correo_solicitante') as HTMLInputElement).value = '';
      (document.getElementById('nombre_contacto') as HTMLInputElement).value = '';
      (document.getElementById('correo_contacto') as HTMLInputElement).value = '';
      const form = document.querySelector('form');
      if (form) form.reset();
    }
  };

  return (
    <div className="w-full max-w-3xl bg-surface-container-lowest rounded-3xl p-6 md:p-12 shadow-sm border border-outline-variant/30 mt-4">

      {/* Alert Banner */}
      <div className="bg-surface-container text-on-surface-variant text-base p-5 rounded-2xl mb-10 border-l-2 border-primary font-medium">
        Por favor, rellena el formulario para solicitar tu ayuda <strong className="text-primary font-bold">lo más rápido posible</strong>. Asegúrate de que tus datos de contacto sean correctos.
      </div>

      <form className="space-y-10" onSubmit={handleSubmit}>

        {/* Date/Time & Solicitante Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10 mb-2 border-b-2 border-outline-variant/60">
          <div>
            <label htmlFor="fecha" className="block text-secondary text-xs font-bold tracking-widest uppercase mb-2">* FECHA / HORA</label>
            <input
              type="text"
              id="fecha"
              readOnly
              value={currentDateTime}
              className="w-full bg-surface-container/50 border border-outline-variant/40 rounded-full px-5 py-3 text-on-surface text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>
          <div>
            <label htmlFor="nombre_solicitante" className="block text-secondary text-xs font-bold tracking-widest uppercase mb-2">* NOMBRE COMPLETO SOLICITANTE</label>
            <input
              type="text"
              id="nombre_solicitante"
              required
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-full px-5 py-3 text-on-surface text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>
          <div>
            <label htmlFor="cedula_solicitante" className="block text-secondary text-xs font-bold tracking-widest uppercase mb-2">* CÉDULA SOLICITANTE</label>
            <input
              type="text"
              id="cedula_solicitante"
              required
              value={cedulaSolicitante}
              onChange={(e) => handleCedulaChange(e, setCedulaSolicitante)}
              placeholder="Ej: V123456"
              minLength={8}
              maxLength={11}
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-full px-5 py-3 text-on-surface text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>
          <div>
            <label htmlFor="correo_solicitante" className="block text-secondary text-xs font-bold tracking-widest uppercase mb-2">* CORREO ELECTRÓNICO SOLICITANTE</label>
            <input
              type="email"
              id="correo_solicitante"
              required
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-full px-5 py-3 text-on-surface text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10 mb-2 border-b-2 border-outline-variant/60">
          <div className="md:col-span-2">
            <label htmlFor="nombre_contacto" className="block text-secondary text-xs font-bold tracking-widest uppercase mb-2">* NOMBRE COMPLETO CONTACTO (PERSONA QUE RETIRA LA AYUDA)</label>
            <input
              type="text"
              id="nombre_contacto"
              required
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-full px-5 py-3 text-on-surface text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>
          <div>
            <label htmlFor="cedula" className="block text-secondary text-xs font-bold tracking-widest uppercase mb-2">* CÉDULA CONTACTO</label>
            <input
              type="text"
              id="cedula"
              required
              value={cedulaContacto}
              onChange={(e) => handleCedulaChange(e, setCedulaContacto)}
              placeholder="Ej: V123456"
              minLength={8}
              maxLength={11}
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-full px-5 py-3 text-on-surface text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>
          <div>
            <label htmlFor="telefono" className="block text-secondary text-xs font-bold tracking-widest uppercase mb-2">* TELÉFONO CONTACTO</label>
            <input
              type="tel"
              id="telefono"
              placeholder="+58 000 000-0000"
              required
              value={telefonoContacto}
              onChange={(e) => handlePhoneChange(e, setTelefonoContacto)}
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-full px-5 py-3 text-on-surface text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>
          <div>
            <label htmlFor="correo_contacto" className="block text-secondary text-xs font-bold tracking-widest uppercase mb-2">* CORREO ELECTRÓNICO CONTACTO</label>
            <input
              type="email"
              id="correo_contacto"
              required
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-full px-5 py-3 text-on-surface text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>
          <div>
            <label htmlFor="telefono_alt" className="block text-secondary text-xs font-bold tracking-widest uppercase mb-2">TELÉFONO CONTACTO ALTERNATIVO (OPCIONAL)</label>
            <input
              type="tel"
              id="telefono_alt"
              placeholder="+58 000 000-0000"
              value={telefonoContactoAlt}
              onChange={(e) => handlePhoneChange(e, setTelefonoContactoAlt)}
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-full px-5 py-3 text-on-surface text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>
        </div>

        {/* Applicant Type */}
        <div className="pb-8 border-b border-outline-variant/20 space-y-6">
          <div>
            <label htmlFor="tipo_solicitante" className="block text-secondary text-xs font-bold tracking-widest uppercase mb-2">* TIPO DE SOLICITANTE</label>
            <select
              id="tipo_solicitante"
              required
              value={tipoSolicitante}
              onChange={(e) => setTipoSolicitante(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-full px-5 py-3 text-on-surface text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none font-medium"
            >
              <option value="">Seleccione una opción...</option>
              <option value="particular">Particular</option>
              <option value="institucion">Institución</option>
            </select>
          </div>
          {tipoSolicitante === 'institucion' && (
            <div>
              <label htmlFor="nombre_institucion" className="block text-secondary text-xs font-bold tracking-widest uppercase mb-2">* NOMBRE DE LA INSTITUCIÓN</label>
              <input
                type="text"
                id="nombre_institucion"
                required
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-full px-5 py-3 text-on-surface text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
              />
            </div>
          )}
        </div>

        {/* Needs Checklist */}
        <div className="bg-primary-container p-6 md:p-8 rounded-3xl border border-primary-container/80 shadow-none">
          <label className="block text-on-primary text-xs font-bold tracking-widest uppercase mb-6">CATEGORÍAS DE INSUMOS QUE PUEDES NECESITAR</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
            {needsList.map((need, idx) => (
              <label key={idx} className="flex items-center space-x-3 text-on-primary text-base cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedNeeds.includes(need)}
                  onChange={() => handleNeedChange(need)}
                  className="w-4 h-4 rounded-sm border-on-primary/40 bg-transparent text-primary-container focus:ring-2 focus:ring-white transition-colors cursor-pointer"
                />
                <span className="group-hover:text-white transition-colors font-medium text-sm uppercase tracking-wider">{need}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Specific Needs Tables (Dynamic) */}
        {selectedNeeds.length > 0 && (
          <div className="space-y-6">
            {selectedNeeds.map((need, idx) => (
              <div key={idx} className="bg-red-50/50 border border-red-100 p-4 sm:p-6 rounded-lg">
                <label className="block text-[#a02020] text-xs sm:text-sm font-bold tracking-widest uppercase mb-4">* {need}</label>

                <div className="overflow-hidden border border-outline-variant/30 rounded-md bg-surface-container-lowest">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead className="bg-[#f0f4f8] border-b border-outline-variant/30 text-[9px] sm:text-xs text-[#4a6b8c] font-bold uppercase tracking-tight sm:tracking-wider">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 border-r border-outline-variant/30 w-[50%] sm:w-1/2 leading-tight">INSUMO / DESCRIPCIÓN</th>
                        <th className="px-2 sm:px-4 py-2 sm:py-3 border-r border-outline-variant/30 w-[35%] sm:w-1/3 leading-tight">CANTIDAD</th>
                        <th className="px-1 sm:px-4 py-2 sm:py-3 text-center w-[15%] sm:w-24 leading-tight">ACCIÓN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {needItems[need]?.map((item) => (
                        <tr key={item.id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="border-r border-outline-variant/30 p-0">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(need, item.id, 'description', e.target.value)}
                              placeholder="Ej: Detalles"
                              className="w-full h-full px-2 sm:px-4 py-2 sm:py-3 bg-transparent border-0 focus:ring-2 focus:ring-primary focus:outline-none text-on-surface text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm"
                            />
                          </td>
                          <td className="border-r border-outline-variant/30 p-0">
                            <input
                              type="text"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(need, item.id, 'quantity', e.target.value)}
                              placeholder="Ej: 2 cajas"
                              className="w-full h-full px-2 sm:px-4 py-2 sm:py-3 bg-transparent border-0 focus:ring-2 focus:ring-primary focus:outline-none text-on-surface text-xs sm:text-sm placeholder:text-xs sm:placeholder:text-sm"
                            />
                          </td>
                          <td className="p-1 sm:p-2 text-center align-middle">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(need, item.id)}
                              className="bg-[#e74c3c] hover:bg-[#c0392b] text-white p-1 sm:p-2 rounded transition-colors inline-flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#e74c3c]"
                              title="Eliminar fila"
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleAddRow(need)}
                    className="bg-[#004b87] hover:bg-[#003366] text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider px-3 py-2 sm:px-4 rounded transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#004b87]"
                  >
                    + AGREGAR FILA
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Beneficiaries & Delivery */}
        <div className="grid grid-cols-1 gap-8 pb-8 border-b border-outline-variant/20">
          <div>
            <label htmlFor="beneficiarios" className="block text-secondary text-xs font-bold tracking-widest uppercase mb-2">CUANTAS PERSONAS SE BENEFICIARÁN CON ESTA AYUDA? (APROX.)</label>
            <input
              type="number"
              id="beneficiarios"
              min="1"
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-full px-5 py-3 text-on-surface text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-medium"
            />
          </div>
          <div>
            <label htmlFor="tipo_envio" className="block text-secondary text-xs font-bold tracking-widest uppercase mb-2">* TIPO DE ENVÍO</label>
            <select
              id="tipo_envio"
              required
              value={tipoEnvio}
              onChange={(e) => setTipoEnvio(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-full px-5 py-3 text-on-surface text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all appearance-none font-medium"
            >
              <option value="">Seleccione el tipo de envío...</option>
              <option value="retiro">Retiro en Centro</option>
              <option value="delivery" disabled style={{ color: '#999' }}>Envío a Domicilio (Próximamente)</option>
            </select>
          </div>
          {tipoEnvio === 'delivery' && (
            <div>
              <label htmlFor="direccion" className="block text-secondary text-xs font-bold tracking-widest uppercase mb-2">* DIRECCIÓN DE ENTREGA</label>
              <textarea
                id="direccion"
                rows={2}
                required
                className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-3xl px-5 py-3 text-on-surface text-base focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-y font-medium"
              ></textarea>
            </div>
          )}
        </div>

        {/* Terms Checkbox */}
        <div className="bg-surface-container/50 p-6 rounded-3xl flex items-start space-x-4 mt-10">
          <input
            type="checkbox"
            id="terminos"
            required
            className="w-4 h-4 rounded-sm border-outline/30 mt-1 text-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          <label htmlFor="terminos" className="text-on-surface-variant text-sm font-medium leading-relaxed">
            Al seleccionar, aceptas que se utilice y se comparta tus datos con nuestros colaboradores de confianza para mejorar tu experiencia y cumplir el objetivo de ayuda humanitaria.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-10">
          <button type="reset" className="w-full sm:w-auto px-12 py-3.5 bg-surface-container hover:bg-surface-container-high text-on-surface-variant rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-200">
            Limpiar
          </button>
          <button type="submit" className="w-full sm:w-auto px-12 py-3.5 bg-primary-container hover:bg-primary-container/90 text-on-primary rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-200 shadow-none">
            Enviar Solicitud
          </button>
        </div>
      </form>

      {/* Bottom Link */}
      <div className="mt-12 text-center border-t border-outline-variant/20 pt-8">
        <Link to="/" className="inline-flex items-center text-secondary hover:text-primary text-sm font-bold uppercase tracking-widest transition-colors">
          <ArrowLeft className="mr-2 w-4 h-4" />
          Volver al Inicio
        </Link>
      </div>

      <TicketModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        data={ticketData}
        status={ticketStatus}
        isSubmitting={isSubmitting}
        submitError={submitError}
      />
    </div>
  );
}
