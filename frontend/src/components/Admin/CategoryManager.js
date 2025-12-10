// frontend/src/components/Admin/CategoryManager.js
import React, { useState, useEffect } from 'react';
import { categoryService } from '../../services/api';

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [availableIcons, setAvailableIcons] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'fas fa-folder',
    parentCategory: '',
    order: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
    fetchAvailableIcons();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar categorías');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableIcons = async () => {
    try {
      const icons = await categoryService.getAvailableIcons();
      setAvailableIcons(icons);
    } catch (err) {
      console.error('Error cargando iconos:', err);
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
      const categoryData = {
        ...formData,
        parentCategory: formData.parentCategory || null,
        order: parseInt(formData.order) || 0
      };
      
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory._id, categoryData);
        setSuccess('Categoría actualizada exitosamente');
      } else {
        await categoryService.createCategory(categoryData);
        setSuccess('Categoría creada exitosamente');
      }
      
      fetchCategories();
      setTimeout(() => {
        setShowForm(false);
        resetForm();
      }, 1000);
      
    } catch (error) {
      setError(`Error al ${editingCategory ? 'actualizar' : 'crear'} la categoría: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      parentCategory: category.parentCategory || '',
      order: category.order
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return;
    }
    
    try {
      await categoryService.deleteCategory(categoryId);
      fetchCategories();
      setSuccess('Categoría eliminada exitosamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Error al eliminar la categoría');
      setTimeout(() => setError(null), 5000);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: 'fas fa-folder',
      parentCategory: '',
      order: 0
    });
    setEditingCategory(null);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="category-manager">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Gestión de Categorías</h3>
        <button 
          className="btn btn-primary"
          onClick={() => { setShowForm(true); resetForm(); }}
        >
          <i className="fas fa-plus me-2"></i>
          Agregar Categoría
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
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
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">Nombre:</label>
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
                    
                    <div className="col-md-6 mb-3">
                      <label htmlFor="parentCategory" className="form-label">Categoría Padre (opcional):</label>
                      <select
                        className="form-select"
                        id="parentCategory"
                        name="parentCategory"
                        value={formData.parentCategory}
                        onChange={handleInputChange}
                      >
                        <option value="">-- Ninguna (Categoría Principal) --</option>
                        {categories
                          .filter(cat => cat.level === 1 && (!editingCategory || cat._id !== editingCategory._id))
                          .map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                  
                  <div className="mb-3">
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
                  
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label htmlFor="icon" className="form-label">Icono:</label>
                      <select
                        className="form-select"
                        id="icon"
                        name="icon"
                        value={formData.icon}
                        onChange={handleInputChange}
                        required
                      >
                        <optgroup label="Educación">
                          {availableIcons.filter(i => i.category === 'education').map(icon => (
                            <option key={icon.value} value={icon.value}>
                              {icon.label}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Oficina">
                          {availableIcons.filter(i => i.category === 'office').map(icon => (
                            <option key={icon.value} value={icon.value}>
                              {icon.label}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="Arte">
                          {availableIcons.filter(i => i.category === 'art').map(icon => (
                            <option key={icon.value} value={icon.value}>
                              {icon.label}
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="General">
                          {availableIcons.filter(i => i.category === 'general').map(icon => (
                            <option key={icon.value} value={icon.value}>
                              {icon.label}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                    
                    <div className="col-md-4 mb-3">
                      <label htmlFor="order" className="form-label">Orden:</label>
                      <input
                        type="number"
                        className="form-control"
                        id="order"
                        name="order"
                        value={formData.order}
                        onChange={handleInputChange}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">Vista Previa del Icono:</label>
                    <div className="d-flex align-items-center gap-3">
                      <div className="text-center p-3 border rounded">
                        <i className={`${formData.icon} fa-3x text-primary`}></i>
                        <div className="mt-2 small">{formData.name || 'Nombre'}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingCategory ? 'Guardar Cambios' : 'Agregar Categoría'}
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
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Icono</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Nivel</th>
                    <th>Productos</th>
                    <th>Orden</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No hay categorías disponibles
                      </td>
                    </tr>
                  ) : (
                    categories.map(category => (
                      <React.Fragment key={category._id}>
                        <tr className={category.level === 1 ? 'table-primary' : ''}>
                          <td className="align-middle text-center">
                            <i className={`${category.icon} fa-2x`}></i>
                          </td>
                          <td className="align-middle">
                            <strong>{category.name}</strong>
                            {category.subcategories && category.subcategories.length > 0 && (
                              <button
                                className="btn btn-sm btn-link ms-2"
                                onClick={() => toggleCategory(category._id)}
                              >
                                <i className={`fas fa-chevron-${expandedCategories.includes(category._id) ? 'up' : 'down'}`}></i>
                              </button>
                            )}
                          </td>
                          <td className="align-middle">{category.description}</td>
                          <td className="align-middle">
                            <span className={`badge ${category.level === 1 ? 'bg-primary' : 'bg-secondary'}`}>
                              {category.level === 1 ? 'Categoría' : 'Subcategoría'}
                            </span>
                          </td>
                          <td className="align-middle text-center">
                            <span className="badge bg-info">{category.productCount || 0}</span>
                          </td>
                          <td className="align-middle text-center">{category.order}</td>
                          <td className="align-middle">
                            <div className="btn-group" role="group">
                              <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleEdit(category)}
                                title="Editar"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(category._id)}
                                title="Eliminar"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {expandedCategories.includes(category._id) && category.subcategories && 
                          category.subcategories.map(subcat => (
                            <tr key={subcat._id} className="table-secondary">
                              <td className="align-middle text-center ps-5">
                                <i className={`${subcat.icon} fa-lg`}></i>
                              </td>
                              <td className="align-middle ps-5">
                                └─ {subcat.name}
                              </td>
                              <td className="align-middle">{subcat.description}</td>
                              <td className="align-middle">
                                <span className="badge bg-secondary">Subcategoría</span>
                              </td>
                              <td className="align-middle text-center">
                                <span className="badge bg-info">{subcat.productCount || 0}</span>
                              </td>
                              <td className="align-middle text-center">{subcat.order}</td>
                              <td className="align-middle">
                                <div className="btn-group" role="group">
                                  <button 
                                    className="btn btn-sm btn-outline-primary"
                                    onClick={() => handleEdit(subcat)}
                                    title="Editar"
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(subcat._id)}
                                    title="Eliminar"
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        }
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;