// frontend/src/components/Landing/PedidoPersonalizado.js - REEMPLAZAR TODO
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService, priceService } from '../../services/api';

const PedidoPersonalizado = () => {
  const [archivos, setArchivos] = useState([]);
  const [precios, setPrecios] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    precioSeleccionado: '',
    cantidadPaginas: '',
    cantidadCopias: '',
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [precioEstimado, setPrecioEstimado] = useState(0);

  useEffect(() => {
    fetchPrecios();
  }, []);

  useEffect(() => {
    calcularPrecioEstimado();
  }, [formData.precioSeleccionado, formData.cantidadPaginas, formData.cantidadCopias]);

  const fetchPrecios = async () => {
    try {
      const data = await priceService.getPrices();
      setPrecios(data);
    } catch (error) {
      console.error('Error al cargar precios:', error);
    }
  };

  const calcularPrecioEstimado = () => {
    if (formData.precioSeleccionado && formData.cantidadPaginas && formData.cantidadCopias) {
      const precio = precios.find(p => p._id === formData.precioSeleccionado);
      if (precio) {
        const total = precio.precio * parseInt(formData.cantidadPaginas) * parseInt(formData.cantidadCopias);
        setPrecioEstimado(total);
      }
    } else {
      setPrecioEstimado(0);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files || []);
    setArchivos(prev => [...prev, ...files]);
  };

  const eliminarArchivo = (index) => {
    setArchivos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (archivos.length === 0) {
      setMessage({ type: 'error', text: 'Por favor sube al menos un archivo' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formDataToSend = new FormData();
      
      archivos.forEach((archivo) => {
        formDataToSend.append('files', archivo);
      });
      
      const precioSeleccionado = precios.find(p => p._id === formData.precioSeleccionado);
      
      const phoneFormatted = formData.telefono.replace(/[^\d+]/g, '');

      const orderData = {
        customerEmail: formData.email,
        customerPhone: phoneFormatted,
        customerName: formData.nombre,
        customOrder: true,
        serviceType: precioSeleccionado?.servicio || 'Servicio personalizado', // Ahora es simplemente el nombre del servicio
        specifications: {
          cantidad: parseInt(formData.cantidadCopias) || 1, // Asegurar que sea número
          cantidadPaginas: parseInt(formData.cantidadPaginas) || 1, // Asegurar que sea número
          servicio: precioSeleccionado?.servicio,
          precioUnitario: precioSeleccionado?.precio,
          observaciones: formData.observaciones
        },
        products: [{
          productId: 'custom',
          name: `Pedido Personalizado - ${precioSeleccionado?.servicio || 'Servicio'}`,
          quantity: parseInt(formData.cantidadCopias) || 1
        }],
        totalPrice: precioEstimado
      };
      
      formDataToSend.append('orderData', JSON.stringify(orderData));
      
      await orderService.createCustomOrder(formDataToSend);
      
      setMessage({ 
        type: 'success', 
        text: 'Pedido enviado correctamente. Recibirás un email de confirmación.' 
      });
      
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        precioSeleccionado: '',
        cantidadPaginas: '',
        cantidadCopias: '',
        observaciones: ''
      });
      setArchivos([]);
      setPrecioEstimado(0);
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'Error al enviar el pedido. Por favor intenta nuevamente.' 
      });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="min-h-100vh bg-light">
      <header className="border-bottom bg-white shadow-sm">
        <div className="container">
          <div className="py-3">
            <div className="d-flex align-items-center gap-3">
              <Link to="/" className="btn btn-ghost btn-sm d-flex align-items-center gap-2">
                <i className="fas fa-arrow-left"></i>
                Volver
              </Link>
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-file-alt text-primary" style={{ fontSize: '2rem' }}></i>
                <h1 className="h3 mb-0 fw-bold">Pedido Personalizado</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="mb-5">
              <h2 className="display-6 fw-bold mb-2">Crear Pedido Personalizado</h2>
              <p className="text-muted lead">Sube tus archivos y especifica los detalles de tu pedido</p>
            </div>



            <form onSubmit={handleSubmit}>
              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h4 className="mb-0">Información de Contacto</h4>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="nombre" className="form-label">Nombre Completo *</label>
                      <input
                        type="text"
                        className="form-control"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="email" className="form-label">Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label htmlFor="telefono" className="form-label">Teléfono *</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h4 className="mb-0">Archivos del Pedido</h4>
                </div>
                <div className="card-body">
                  <div className="upload-area border-2 border-dashed rounded-3 p-5 text-center bg-light">
                    <i className="fas fa-cloud-upload-alt text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                    <p className="h5 mb-2">Arrastra archivos aquí o haz clic para seleccionar</p>
                    <p className="text-muted mb-4">Formatos soportados: PDF, DOC, DOCX, JPG, PNG</p>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      className="d-none"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <span className="btn btn-outline-primary">
                        <i className="fas fa-plus me-2"></i>
                        Seleccionar Archivos
                      </span>
                    </label>
                  </div>

                  {archivos.length > 0 && (
                    <div className="mt-4">
                      <h5 className="mb-3">Archivos seleccionados:</h5>
                      {archivos.map((archivo, index) => (
                        <div key={index} className="d-flex align-items-center justify-content-between p-3 bg-light rounded mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <i className="fas fa-file-alt text-primary"></i>
                            <span>{archivo.name}</span>
                            <span className="text-muted small">
                              ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost text-danger"
                            onClick={() => eliminarArchivo(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h4 className="mb-0">Especificaciones del Pedido</h4>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label htmlFor="precioSeleccionado" className="form-label">Tipo de Servicio *</label>
                      <select
                        className="form-select"
                        id="precioSeleccionado"
                        name="precioSeleccionado"
                        value={formData.precioSeleccionado}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Selecciona un servicio</option>
                        {precios.map(precio => (
                          <option key={precio._id} value={precio._id}>
                            {precio.servicio} - ${formatPrice(precio.precio)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="cantidadPaginas" className="form-label">Cantidad de Páginas *</label>
                      <input
                        type="number"
                        className="form-control"
                        id="cantidadPaginas"
                        name="cantidadPaginas"
                        min="1"
                        value={formData.cantidadPaginas}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="cantidadCopias" className="form-label">Cantidad de Copias *</label>
                      <input
                        type="number"
                        className="form-control"
                        id="cantidadCopias"
                        name="cantidadCopias"
                        min="1"
                        value={formData.cantidadCopias}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {precioEstimado > 0 && (
                    <div className="alert alert-info mt-4">
                      <h5 className="alert-heading">
                        <i className="fas fa-calculator me-2"></i>
                        Precio Estimado
                      </h5>
                      <div className="mb-2">
                        <small className="text-muted d-block">
                          Servicio: {precios.find(p => p._id === formData.precioSeleccionado)?.servicio}
                        </small>
                        <small className="text-muted d-block">
                          ${formatPrice(precios.find(p => p._id === formData.precioSeleccionado)?.precio || 0)} x {formData.cantidadPaginas} páginas x {formData.cantidadCopias} copias
                        </small>
                      </div>
                      <p className="mb-0 h4">${formatPrice(precioEstimado)}</p>
                      <small className="text-muted">
                        * Este es un precio estimado. El precio final puede variar según el contenido del archivo.
                      </small>
                    </div>
                  )}

                  <div className="mt-4">
                    <label htmlFor="observaciones" className="form-label">Observaciones Adicionales</label>
                    <textarea
                      className="form-control"
                      id="observaciones"
                      name="observaciones"
                      rows="4"
                      placeholder="Especifica cualquier detalle adicional sobre tu pedido..."
                      value={formData.observaciones}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-3 justify-content-end align-items-center">
                {message && (
                  <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-0 me-auto`} role="alert">
                    <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
                    {message.text}
                    <button type="button" className="btn-close ms-3" onClick={() => setMessage(null)}></button>
                  </div>
                )}
                <Link to="/" className="btn btn-outline-secondary">
                  Cancelar
                </Link>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg px-4"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Enviar Pedido
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer minimalista con powered by */}
      <footer className="mt-auto border-top bg-white py-3">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center">
            <p className="text-muted mb-0 small">&copy; 2025 Rumbos Gráfica & Copias</p>
            <a 
              href="https://simpleapps.com.ar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-decoration-none d-flex align-items-center gap-1"
              style={{
                fontSize: '0.8rem',
                color: '#6c757d',
                padding: '4px 10px',
                borderRadius: '15px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#0d6efd';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#6c757d';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ opacity: 0.7 }}>powered by</span>
              <span style={{ 
                fontFamily: 'monospace', 
                fontWeight: '700',
                fontSize: '0.9rem'
              }}>
                &lt;s/a&gt;
              </span>
              <span style={{ fontWeight: '500' }}>Simple Apps</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PedidoPersonalizado;