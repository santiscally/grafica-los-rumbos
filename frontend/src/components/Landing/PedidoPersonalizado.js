// frontend/src/components/Landing/PedidoPersonalizado.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService, priceService } from '../../services/api';
import Footer from '../Common/Footer';

const PedidoPersonalizado = () => {
  const [archivos, setArchivos] = useState([]);
  const [precios, setPrecios] = useState([]);
  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', precioSeleccionado: '', cantidadPaginas: '', cantidadCopias: '', observaciones: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [precioEstimado, setPrecioEstimado] = useState(0);

  useEffect(() => { fetchPrecios(); }, []);
  useEffect(() => { calcularPrecioEstimado(); }, [formData.precioSeleccionado, formData.cantidadPaginas, formData.cantidadCopias]);

  const fetchPrecios = async () => {
    try {
      const data = await priceService.getPrices();
      setPrecios(data);
    } catch (error) { console.error('Error al cargar precios:', error); }
  };

  const calcularPrecioEstimado = () => {
    if (formData.precioSeleccionado && formData.cantidadPaginas && formData.cantidadCopias) {
      const precio = precios.find(p => p._id === formData.precioSeleccionado);
      if (precio) setPrecioEstimado(precio.precio * parseInt(formData.cantidadPaginas) * parseInt(formData.cantidadCopias));
    } else { setPrecioEstimado(0); }
  };

  const handleFileUpload = (event) => setArchivos(prev => [...prev, ...Array.from(event.target.files || [])]);
  const eliminarArchivo = (index) => setArchivos(prev => prev.filter((_, i) => i !== index));
  const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const formatPrice = (price) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (archivos.length === 0) { setMessage({ type: 'error', text: 'Por favor sube al menos un archivo' }); return; }
    setLoading(true);
    setMessage(null);
    try {
      const formDataToSend = new FormData();
      archivos.forEach((archivo) => formDataToSend.append('files', archivo));
      const precioSeleccionado = precios.find(p => p._id === formData.precioSeleccionado);
      const orderData = {
        customerEmail: formData.email,
        customerPhone: formData.telefono.replace(/[^\d+]/g, ''),
        customerName: formData.nombre,
        customOrder: true,
        serviceType: precioSeleccionado?.servicio || 'Servicio personalizado',
        specifications: { cantidad: parseInt(formData.cantidadCopias) || 1, cantidadPaginas: parseInt(formData.cantidadPaginas) || 1, servicio: precioSeleccionado?.servicio, precioUnitario: precioSeleccionado?.precio, observaciones: formData.observaciones },
        products: [{ productId: 'custom', name: `Pedido Personalizado - ${precioSeleccionado?.servicio || 'Servicio'}`, quantity: parseInt(formData.cantidadCopias) || 1 }],
        totalPrice: precioEstimado
      };
      formDataToSend.append('orderData', JSON.stringify(orderData));
      await orderService.createCustomOrder(formDataToSend);
      setMessage({ type: 'success', text: 'Pedido enviado correctamente. Recibirás un email de confirmación.' });
      setFormData({ nombre: '', email: '', telefono: '', precioSeleccionado: '', cantidadPaginas: '', cantidadCopias: '', observaciones: '' });
      setArchivos([]);
      setPrecioEstimado(0);
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al enviar el pedido. Por favor intenta nuevamente.' });
    } finally { setLoading(false); }
  };

  const inputStyle = { padding: '0.75rem 1rem', borderRadius: '8px', border: '2px solid #e5e7eb', width: '100%' };
  const cardStyle = { background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '1.5rem', overflow: 'hidden' };
  const cardHeaderStyle = { padding: '1.25rem 1.5rem', borderBottom: '2px solid #e5e7eb', background: '#f8f9fa' };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header fijo */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'white', borderBottom: '1px solid #dee2e6', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="container">
          <div style={{ padding: '1rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6c757d', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '8px', background: '#f8f9fa' }}>
              <i className="fas fa-arrow-left"></i><span>Volver</span>
            </Link>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', background: '#0d6efd', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem' }}>
                <i className="fas fa-file-alt"></i>
              </div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#343a40' }}>Pedido Personalizado</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main style={{ paddingTop: '100px', paddingBottom: '60px', minHeight: '100vh' }}>
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#343a40' }}>Crear Pedido Personalizado</h2>
                <p style={{ color: '#6c757d', fontSize: '1.125rem' }}>Sube tus archivos y especifica los detalles de tu pedido</p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Información de Contacto */}
                <div style={cardStyle}>
                  <div style={cardHeaderStyle}>
                    <h4 style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <i className="fas fa-user" style={{ marginRight: '10px', color: '#0d6efd' }}></i>Información de Contacto
                    </h4>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Nombre Completo <span style={{ color: '#dc3545' }}>*</span></label>
                        <input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required style={inputStyle} />
                      </div>
                      <div className="col-md-6">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Email <span style={{ color: '#dc3545' }}>*</span></label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={inputStyle} />
                      </div>
                      <div className="col-12">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Teléfono <span style={{ color: '#dc3545' }}>*</span></label>
                        <input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Ej: 11 2345-6789" required style={inputStyle} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Archivos */}
                <div style={cardStyle}>
                  <div style={cardHeaderStyle}>
                    <h4 style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <i className="fas fa-cloud-upload-alt" style={{ marginRight: '10px', color: '#0d6efd' }}></i>Archivos a Imprimir
                    </h4>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ border: '2px dashed #0d6efd', borderRadius: '12px', padding: '2rem', textAlign: 'center', background: '#f8f9fa' }}>
                      <i className="fas fa-cloud-upload-alt" style={{ fontSize: '3rem', color: '#0d6efd', marginBottom: '1rem', display: 'block' }}></i>
                      <p style={{ color: '#6c757d', marginBottom: '1rem' }}>Arrastra tus archivos aquí o</p>
                      <input type="file" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={handleFileUpload} style={{ display: 'none' }} id="file-upload" />
                      <label htmlFor="file-upload" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: '#0d6efd', color: 'white', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>
                        <i className="fas fa-plus"></i>Seleccionar Archivos
                      </label>
                      <p style={{ fontSize: '0.8125rem', color: '#6c757d', marginTop: '1rem', marginBottom: 0 }}>PDF, DOC, DOCX, JPG, PNG (máx. 10MB por archivo)</p>
                    </div>

                    {archivos.length > 0 && (
                      <div style={{ marginTop: '1.5rem' }}>
                        <h5 style={{ marginBottom: '1rem', fontWeight: 600 }}><i className="fas fa-file-alt" style={{ marginRight: '8px', color: '#0d6efd' }}></i>Archivos seleccionados ({archivos.length})</h5>
                        {archivos.map((archivo, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#f8f9fa', borderRadius: '8px', marginBottom: '0.5rem', border: '1px solid #e5e7eb' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <i className="fas fa-file-alt" style={{ color: '#0d6efd' }}></i>
                              <span style={{ fontWeight: 500 }}>{archivo.name}</span>
                              <span style={{ fontSize: '0.8125rem', color: '#6c757d' }}>({(archivo.size / 1024 / 1024).toFixed(2)} MB)</span>
                            </div>
                            <button type="button" onClick={() => eliminarArchivo(index)} style={{ width: '32px', height: '32px', border: 'none', background: '#fee', color: '#dc3545', borderRadius: '6px', cursor: 'pointer' }}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Especificaciones */}
                <div style={cardStyle}>
                  <div style={cardHeaderStyle}>
                    <h4 style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <i className="fas fa-cog" style={{ marginRight: '10px', color: '#0d6efd' }}></i>Especificaciones del Pedido
                    </h4>
                  </div>
                  <div style={{ padding: '1.5rem' }}>
                    <div className="row g-3">
                      <div className="col-12">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Tipo de Servicio <span style={{ color: '#dc3545' }}>*</span></label>
                        <select name="precioSeleccionado" value={formData.precioSeleccionado} onChange={handleInputChange} required style={inputStyle}>
                          <option value="">Selecciona un servicio</option>
                          {precios.map(precio => (<option key={precio._id} value={precio._id}>{precio.servicio} - ${formatPrice(precio.precio)}</option>))}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Cantidad de Páginas <span style={{ color: '#dc3545' }}>*</span></label>
                        <input type="number" name="cantidadPaginas" min="1" value={formData.cantidadPaginas} onChange={handleInputChange} required style={inputStyle} />
                      </div>
                      <div className="col-md-6">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Cantidad de Copias <span style={{ color: '#dc3545' }}>*</span></label>
                        <input type="number" name="cantidadCopias" min="1" value={formData.cantidadCopias} onChange={handleInputChange} required style={inputStyle} />
                      </div>
                    </div>

                    {precioEstimado > 0 && (
                      <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#e3f2fd', borderRadius: '10px', border: '2px solid #bbdefb' }}>
                        <h5 style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center' }}><i className="fas fa-calculator" style={{ marginRight: '10px', color: '#0d6efd' }}></i>Precio Estimado</h5>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <small style={{ color: '#6c757d', display: 'block' }}>Servicio: {precios.find(p => p._id === formData.precioSeleccionado)?.servicio}</small>
                          <small style={{ color: '#6c757d', display: 'block' }}>${formatPrice(precios.find(p => p._id === formData.precioSeleccionado)?.precio || 0)} × {formData.cantidadPaginas} páginas × {formData.cantidadCopias} copias</small>
                        </div>
                        <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#0d6efd' }}>${formatPrice(precioEstimado)}</p>
                        <small style={{ color: '#6c757d' }}>* Este es un precio estimado. El precio final puede variar según el contenido del archivo.</small>
                      </div>
                    )}

                    <div style={{ marginTop: '1.5rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Observaciones Adicionales</label>
                      <textarea name="observaciones" rows="4" placeholder="Especifica cualquier detalle adicional sobre tu pedido..." value={formData.observaciones} onChange={handleInputChange} style={{ ...inputStyle, resize: 'vertical' }}></textarea>
                    </div>
                  </div>
                </div>

                {/* Mensaje y botones */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {message && (
                    <div style={{ padding: '1rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem', background: message.type === 'error' ? '#fee' : '#e8f5e9', color: message.type === 'error' ? '#dc3545' : '#2e7d32' }}>
                      <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                      <span style={{ flex: 1 }}>{message.text}</span>
                      <button type="button" onClick={() => setMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem', opacity: 0.7 }}><i className="fas fa-times"></i></button>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <Link to="/" style={{ padding: '0.875rem 1.5rem', border: '2px solid #e5e7eb', borderRadius: '10px', color: '#6c757d', textDecoration: 'none', fontWeight: 500 }}>Cancelar</Link>
                    <button type="submit" disabled={loading} style={{ padding: '0.875rem 2rem', background: loading ? '#6c757d' : '#0d6efd', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {loading ? (<><span className="spinner-border spinner-border-sm"></span>Enviando...</>) : (<><i className="fas fa-paper-plane"></i>Enviar Pedido</>)}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PedidoPersonalizado;