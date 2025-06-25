// frontend/src/components/Admin/PriceManager.js
import React, { useState, useEffect } from 'react';
import { priceService } from '../../services/api';

const PriceManager = () => {
  const [prices, setPrices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPrice, setEditingPrice] = useState(null);
  const [formData, setFormData] = useState({
    servicio: '',
    precio: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const data = await priceService.getPrices();
      setPrices(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar precios');
      console.error(err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const priceData = {
        servicio: formData.servicio,
        precio: parseFloat(formData.precio)
      };
      
      if (editingPrice) {
        await priceService.updatePrice(editingPrice._id, priceData);
        setSuccess('Precio actualizado exitosamente');
      } else {
        await priceService.createPrice(priceData);
        setSuccess('Precio creado exitosamente');
      }
      
      fetchPrices();
      setTimeout(() => {
        setShowForm(false);
        resetForm();
      }, 1000);
      
    } catch (error) {
      setError(`Error al ${editingPrice ? 'actualizar' : 'crear'} el precio: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (price) => {
    setEditingPrice(price);
    setFormData({
      servicio: price.servicio,
      precio: price.precio
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (priceId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este precio?')) {
      return;
    }
    
    try {
      await priceService.deletePrice(priceId);
      fetchPrices();
      setSuccess('Precio eliminado exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Error al eliminar el precio');
    }
  };

  const resetForm = () => {
    setFormData({
      servicio: '',
      precio: ''
    });
    setEditingPrice(null);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="price-manager">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Lista de Precios</h3>
        <button 
          className="btn btn-primary"
          onClick={() => { setShowForm(true); resetForm(); }}
        >
          <i className="fas fa-plus me-2"></i>
          Agregar Precio
        </button>
      </div>
      
      {error && !showForm && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      
      {success && !showForm && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          <i className="fas fa-check-circle me-2"></i>
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
        </div>
      )}

      {showForm && (
        <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPrice ? 'Editar Precio' : 'Agregar Nuevo Precio'}
                </h5>
                <button type="button" className="btn-close" onClick={handleCancel}></button>
              </div>
              
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="alert alert-success" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="servicio" className="form-label">Servicio:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="servicio"
                      name="servicio"
                      value={formData.servicio}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: Fotocopia A4 Blanco y Negro"
                    />
                  </div>
                  
                  <div className="mb-3">
                    <label htmlFor="precio" className="form-label">Precio:</label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input
                        type="number"
                        className="form-control"
                        id="precio"
                        name="precio"
                        value={formData.precio}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingPrice ? 'Guardar Cambios' : 'Agregar Precio'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Precio</th>
                <th>Fecha de Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {prices.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-4">
                    No hay precios disponibles
                  </td>
                </tr>
              ) : (
                prices.map(price => (
                  <tr key={price._id}>
                    <td className="align-middle">
                      {price.servicio}
                    </td>
                    <td className="align-middle">
                      <span>${formatPrice(price.precio)}</span>
                    </td>
                    <td className="align-middle text-muted">
                      {formatDate(price.createdAt)}
                    </td>
                    <td className="align-middle">
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(price)}
                          title="Editar"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(price._id)}
                          title="Eliminar"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PriceManager;