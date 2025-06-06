import React, { useState, useEffect } from 'react';
import { productService } from '../../services/api';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    year: '',
    subject: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar productos');
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

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price)
      };
      debugger;
      if (editingProduct) {
        await productService.updateProduct(
          editingProduct._id, 
          productData, 
          selectedFile
        );
        setSuccess('Producto actualizado exitosamente');
      } else {
        if (!selectedFile) {
          setError('Se requiere una imagen para el producto');
          return;
        }
        await productService.createProduct(productData, selectedFile);
        setSuccess('Producto creado exitosamente');
      }
      
      fetchProducts();
      
      // Cerrar el formulario después de 1 segundo para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        setShowForm(false);
        resetForm();
      }, 1000);
      
    } catch (error) {
      setError(`Error al ${editingProduct ? 'actualizar' : 'crear'} el producto: ${error.message}`);
      console.error('Error saving product:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      year: product.year,
      subject: product.subject
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }
    
    try {
      await productService.deleteProduct(productId);
      fetchProducts();
      setSuccess('Producto eliminado exitosamente');
      
      // Ocultar el mensaje después de 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (error) {
      setError('Error al eliminar el producto');
      console.error('Error deleting product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      image: '',
      year: '',
      subject: ''
    });
    setSelectedFile(null);
    setEditingProduct(null);
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

  return (
    <div className="product-manager">
      {/* Cabecera y botón de agregar */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Catálogo de Productos</h3>
        <button 
          className="btn btn-primary"
          onClick={() => { setShowForm(true); resetForm(); }}
        >
          <i className="fas fa-plus me-2"></i>
          Agregar Producto
        </button>
      </div>
      
      {/* Mensajes de éxito o error */}
      {error && (
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

      {/* Modal de formulario */}
      {showForm && (
        <div className="modal d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingProduct ? 'Editar Producto' : 'Agregar Nuevo Producto'}
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
                  <div className="row g-3">
                    {/* Nombre del producto */}
                    <div className="col-md-8">
                      <label htmlFor="name" className="form-label">Nombre del producto:</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    {/* Precio */}
                    <div className="col-md-4">
                      <label htmlFor="price" className="form-label">Precio:</label>
                      <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                          type="number"
                          className="form-control"
                          id="price"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                    
                    {/* Descripción */}
                    <div className="col-12">
                      <label htmlFor="description" className="form-label">Descripción:</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      ></textarea>
                    </div>
                    
                    {/* Año escolar */}
                    <div className="col-md-6">
                      <label htmlFor="year" className="form-label">Año escolar:</label>
                      <select
                        className="form-select"
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccionar año</option>
                        <option value="1er año">1er año</option>
                        <option value="2do año">2do año</option>
                      </select>
                    </div>
                    
                    {/* Materia */}
                    <div className="col-md-6">
                      <label htmlFor="subject" className="form-label">Materia:</label>
                      <input
                        type="text"
                        className="form-control"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    {/* Imagen */}
                    <div className="col-12">
                      <label htmlFor="image" className="form-label">Imagen:</label>
                      <input
                        type="file"
                        className="form-control"
                        id="image"
                        name="image"
                        onChange={handleFileChange}
                        accept="image/*"
                        required={!editingProduct}
                      />
                      {editingProduct && (
                        <div className="form-text">
                          {selectedFile ? `Archivo nuevo: ${selectedFile.name}` : 'Deja vacío para mantener la imagen actual'}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="modal-footer mt-4">
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingProduct ? 'Guardar Cambios' : 'Agregar Producto'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de productos */}
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
                <th>Imagen</th>
                <th>Producto</th>
                <th>Descripción</th>
                <th>Precio</th>
                <th>Categorización</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No hay productos disponibles
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product._id}>
                    <td className="align-middle">
                      <div className="product-thumbnail">
                        {product.imageUrl ? (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="img-thumbnail"
                            style={{width: '60px', height: '60px', objectFit: 'cover'}}
                          />
                        ) : (
                          <div className="text-center text-muted">
                            <i className="fas fa-image fa-2x"></i>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="align-middle">
                      <strong>{product.name}</strong>
                    </td>
                    <td className="align-middle small">
                      {product.description.length > 100 
                        ? `${product.description.substring(0, 100)}...` 
                        : product.description}
                    </td>
                    <td className="align-middle">
                      <span className="fw-bold">${formatPrice(product.price)}</span>
                    </td>
                    <td className="align-middle">
                      <span className="badge bg-primary me-2">{product.year}</span>
                      <span className="badge bg-info text-dark">{product.subject}</span>
                    </td>
                    <td className="align-middle">
                      <div className="btn-group" role="group">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => handleEdit(product)}
                          title="Editar"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(product._id)}
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

export default ProductManager;