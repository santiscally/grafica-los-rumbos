// frontend/src/components/PedidoPersonalizado/PedidoPersonalizado.js - REEMPLAZAR TODO

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/api';

const PedidoPersonalizado = () => {
  const [archivos, setArchivos] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    tipoServicio: '',
    cantidad: '',
    color: false,
    dobleCaras: false,
    papel: '',
    observaciones: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

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
      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();
      
      // Agregar archivos
      archivos.forEach((archivo, index) => {
        formDataToSend.append('files', archivo);
      });
      
      // Agregar datos del pedido
      const orderData = {
        customerEmail: formData.email,
        customerPhone: formData.telefono,
        customerName: formData.nombre,
        customOrder: true,
        serviceType: formData.tipoServicio,
        specifications: {
          cantidad: formData.cantidad,
          color: formData.color,
          dobleCaras: formData.dobleCaras,
          papel: formData.papel,
          observaciones: formData.observaciones
        },
        products: [{
          productId: 'custom',
          name: `Pedido Personalizado - ${formData.tipoServicio}`,
          quantity: parseInt(formData.cantidad) || 1
        }]
      };
      
      // Agregar orderData como JSON string
      formDataToSend.append('orderData', JSON.stringify(orderData));
      
      // Enviar pedido con archivos
      await orderService.createCustomOrder(formDataToSend);
      
      setMessage({ 
        type: 'success', 
        text: 'Pedido enviado correctamente. Te contactaremos pronto.' 
      });
      
      // Limpiar formulario
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        tipoServicio: '',
        cantidad: '',
        color: false,
        dobleCaras: false,
        papel: '',
        observaciones: ''
      });
      setArchivos([]);
      
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-100vh bg-light">
      {/* Header */}
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

            {message && (
              <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                <i className={`fas fa-${message.type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2`}></i>
                {message.text}
                <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Información del Cliente */}
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

              {/* Subida de Archivos */}
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

              {/* Especificaciones del Pedido */}
              <div className="card mb-4">
                <div className="card-header bg-white">
                  <h4 className="mb-0">Especificaciones del Pedido</h4>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="tipoServicio" className="form-label">Tipo de Servicio *</label>
                      <select
                        className="form-select"
                        id="tipoServicio"
                        name="tipoServicio"
                        value={formData.tipoServicio}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Selecciona un servicio</option>
                        <option value="impresion">Impresión</option>
                        <option value="fotocopia">Fotocopia</option>
                        <option value="encuadernacion">Encuadernación</option>
                        <option value="plastificado">Plastificado</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="cantidad" className="form-label">Cantidad de Copias *</label>
                      <input
                        type="number"
                        className="form-control"
                        id="cantidad"
                        name="cantidad"
                        min="1"
                        value={formData.cantidad}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="papel" className="form-label">Tipo de Papel</label>
                      <select
                        className="form-select"
                        id="papel"
                        name="papel"
                        value={formData.papel}
                        onChange={handleInputChange}
                      >
                        <option value="">Selecciona tipo de papel</option>
                        <option value="a4-80g">A4 - 80g</option>
                        <option value="a4-90g">A4 - 90g</option>
                        <option value="a3-80g">A3 - 80g</option>
                        <option value="a3-90g">A3 - 90g</option>
                        <option value="cartulina">Cartulina</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="color"
                        name="color"
                        checked={formData.color}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="color">
                        Impresión a color
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="dobleCaras"
                        name="dobleCaras"
                        checked={formData.dobleCaras}
                        onChange={handleInputChange}
                      />
                      <label className="form-check-label" htmlFor="dobleCaras">
                        Impresión a doble cara
                      </label>
                    </div>
                  </div>

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

              {/* Botones de Acción */}
              <div className="d-flex gap-3 justify-content-end">
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
    </div>
  );
};

export default PedidoPersonalizado;