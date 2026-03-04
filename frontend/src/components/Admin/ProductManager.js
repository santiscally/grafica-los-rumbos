// frontend/src/components/Admin/ProductManager.js - ACTUALIZADO CON CATEGORÍAS
import React, { useState, useEffect } from 'react';
import { productService, categoryService } from '../../services/api';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    year: '',
    subject: '',
    code: '',
    featured: false,
    discount: 0,
    stock: 100
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    // Actualizar subcategorías cuando cambie la categoría seleccionada
    if (formData.category) {
      const selectedCategory = categories.find(cat => cat._id === formData.category);
      setSubcategories(selectedCategory?.subcategories || []);
    } else {
      setSubcategories([]);
    }
  }, [formData.category, categories]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts({ includeHidden: 'true', limit: 500 });
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await categoryService.getCategories({ includeHidden: 'true' });
      setCategories(data);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      if (!formData.category) {
        setError('Debe seleccionar una categoría');
        return;
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        stock: parseInt(formData.stock) || 100,
        subcategory: formData.subcategory || null
      };
      
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
      category: product.category?._id || product.category || '',
      subcategory: product.subcategory?._id || product.subcategory || '',
      year: product.year || '',
      subject: product.subject || '',
      code: product.code || '',
      featured: product.featured || false,
      discount: product.discount || 0,
      stock: product.stock || 100
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
      category: '',
      subcategory: '',
      year: '',
      subject: '',
      code: '',
      featured: false,
      discount: 0,
      stock: 100
    });
    setSelectedFile(null);
    setEditingProduct(null);
    setError(null);
    setSuccess(null);
    setSubcategories([]);
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

  const handleViewImage = (product) => {
    const imageUrl = product.hasImage 
      ? `${process.env.REACT_APP_API_URL || ''}/api/files/product/${product._id}`
      : '/placeholder.jpg';
    setSelectedImage({ url: imageUrl, name: product.name });
    setShowImageModal(true);
  };

  return (
    <div className="product-manager">
      {/* Cabecera con botones */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Catálogo de Productos</h3>
        <div className="d-flex gap-2">
          {/* Botones de vista */}
          <div className="btn-group" role="group">
            <button 
              type="button" 
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('table')}
            >
              <i className="fas fa-table"></i>
            </button>
            <button 
              type="button" 
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('list')}
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => { setShowForm(true); resetForm(); }}
          >
            <i className="fas fa-plus me-2"></i>
            Agregar Producto
          </button>
        </div>
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
                    <div className="col-md-8">
                      <label htmlFor="name" className="form-label">Nombre del producto: <span className="text-danger">*</span></label>
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
                    
                    <div className="col-md-4">
                      <label htmlFor="code" className="form-label">Código:</label>
                      <input
                        type="text"
                        className="form-control"
                        id="code"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        placeholder="Ej: PROD-001"
                      />
                    </div>
                    
                    <div className="col-12">
                      <label htmlFor="description" className="form-label">Descripción: <span className="text-danger">*</span></label>
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
                    
                    <div className="col-md-6">
                      <label htmlFor="category" className="form-label">Categoría: <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="subcategory" className="form-label">Subcategoría:</label>
                      <select
                        className="form-select"
                        id="subcategory"
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleInputChange}
                        disabled={!formData.category || subcategories.length === 0}
                      >
                        <option value="">Sin subcategoría</option>
                        {subcategories.map(subcat => (
                          <option key={subcat._id} value={subcat._id}>{subcat.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="col-md-4">
                      <label htmlFor="price" className="form-label">Precio: <span className="text-danger">*</span></label>
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
                    
                    <div className="col-md-4">
                      <label htmlFor="discount" className="form-label">Descuento (%):</label>
                      <input
                        type="number"
                        className="form-control"
                        id="discount"
                        name="discount"
                        value={formData.discount}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                      />
                    </div>
                    
                    <div className="col-md-4">
                      <label htmlFor="stock" className="form-label">Stock:</label>
                      <input
                        type="number"
                        className="form-control"
                        id="stock"
                        name="stock"
                        value={formData.stock}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="year" className="form-label">Año escolar (opcional):</label>
                      <select
                        className="form-select"
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                      >
                        <option value="">Sin especificar</option>
                        <option value="7mo grado">7mo grado</option>
                        <option value="1er año">1er año</option>
                        <option value="2do año">2do año</option>
                        <option value="3er año">3er año</option>
                        <option value="4to año">4to año</option>                        
                        <option value="5to año">5to año</option>
                      </select>
                    </div>
                    
                    <div className="col-md-6">
                      <label htmlFor="subject" className="form-label">Materia (opcional):</label>
                      <input
                        type="text"
                        className="form-control"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Ej: Matemática"
                      />
                    </div>
                    
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="featured"
                          name="featured"
                          checked={formData.featured}
                          onChange={handleInputChange}
                        />
                        <label className="form-check-label" htmlFor="featured">
                          Producto destacado
                        </label>
                      </div>
                    </div>
                    
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

      {/* Vista de tabla */}
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No hay productos disponibles
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr key={product._id}>
                    <td className="align-middle">
                      <div className="product-thumbnail">
                        {product.hasImage ? (
                          <img 
                            src={`${process.env.REACT_APP_API_URL || ''}/api/files/product/${product._id}`} 
                            alt={product.name}
                            className="img-thumbnail"
                            style={{width: '60px', height: '60px', objectFit: 'cover', cursor: 'pointer'}}
                            onClick={() => handleViewImage(product)}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/placeholder.jpg';
                            }}
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
                      {product.code && <div className="small text-muted">Código: {product.code}</div>}
                    </td>
                    <td className="align-middle">
                      {product.category?.name || 'Sin categoría'}
                      {product.subcategory && (
                        <div className="small text-muted">{product.subcategory.name}</div>
                      )}
                    </td>
                    <td className="align-middle">
                      <span className="fw-bold">${formatPrice(product.price)}</span>
                      {product.discount > 0 && (
                        <div className="small text-danger">-{product.discount}%</div>
                      )}
                    </td>
                    <td className="align-middle">
                      <span className={`badge ${product.stock > 10 ? 'bg-success' : 'bg-warning'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="align-middle">
                      {product.featured && (
                        <span className="badge bg-primary">Destacado</span>
                      )}
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
      ) : (
        /* Vista de lista */
        <div className="list-view">
          {products.map(product => (
            <div key={product._id} className="card mb-3">
              <div className="card-body">
                <div className="row align-items-center">
                  <div className="col-md-2 text-center">
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleViewImage(product)}
                    >
                      <i className="fas fa-image me-1"></i>
                      Ver Foto
                    </button>
                  </div>
                  <div className="col-md-6">
                    <h4 className="h5 fw-semibold">{product.name}</h4>
                    <p className="text-muted mb-2">{product.description}</p>
                    <div className="d-flex gap-2">
                      <span className="badge bg-secondary">{product.category?.name || 'Sin categoría'}</span>
                      {product.subcategory && <span className="badge bg-info text-dark">{product.subcategory.name}</span>}
                      {product.code && <span className="badge bg-light text-dark">Código: {product.code}</span>}
                      {product.featured && <span className="badge bg-primary">Destacado</span>}
                    </div>
                  </div>
                  <div className="col-md-2 text-center">
                    <div className="h4 text-primary fw-bold">
                      ${formatPrice(product.price)}
                    </div>
                    {product.discount > 0 && (
                      <span className="badge bg-danger">-{product.discount}%</span>
                    )}
                  </div>
                  <div className="col-md-2 text-end">
                    <div className="btn-group-vertical" role="group">
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => handleEdit(product)}
                      >
                        <i className="fas fa-edit me-1"></i>
                        Editar
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(product._id)}
                      >
                        <i className="fas fa-trash me-1"></i>
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para imagen */}
      {showImageModal && selectedImage && (
        <div 
          className="modal d-block" 
          style={{backgroundColor: 'rgba(0,0,0,0.8)'}} 
          onClick={() => setShowImageModal(false)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedImage.name || 'Vista de Imagen'}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowImageModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center p-0">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.name || 'Producto'} 
                  className="img-fluid w-100"
                  style={{ maxHeight: '80vh', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/placeholder.jpg';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;