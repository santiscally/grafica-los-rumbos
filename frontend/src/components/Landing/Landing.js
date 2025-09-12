import React, { useState, useEffect } from 'react';
import { productService } from '../../services/api';
import ProductCard from './ProductCard';
import OrderForm from './OrderForm';
import '../../styles/landing.css';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [mobileSearchCode, setMobileSearchCode] = useState('');
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    year: '',
    subject: '',
    code: ''  // Agregar esta línea
  });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vistaGrid, setVistaGrid] = useState(true);
  const [activeTab, setActiveTab] = useState('todos');
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.year) params.year = filters.year;
      if (filters.subject) params.subject = filters.subject;
      if (filters.code) params.code = filters.code;  
      const data = await productService.getProducts(params);
      setProducts(data);
      
      const uniqueSubjects = [...new Set(data.map(p => p.subject))];
      setSubjects(uniqueSubjects);
      
      setError(null);
    } catch (err) {
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
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

  const handleAddToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.productId === product._id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleViewImage = (product) => {
    const imageUrl = product.hasImage 
      ? `${process.env.REACT_APP_API_URL || ''}/api/files/product/${product._id}` 
      : '/placeholder.jpg';
    setSelectedImage({ url: imageUrl, name: product.name });
    setShowImageModal(true);
  };

  const filteredProducts = activeTab === 'todos' 
    ? products 
    : products.filter(p => p.subject === activeTab);

  return (
    <div className="min-h-100vh bg-light">
      {/* Header Mejorado */}
    <header className="border-bottom bg-white shadow-sm sticky-top">
      <div className="container">
        {/* Desktop Header */}
        <div className="d-none d-lg-flex justify-content-between align-items-center py-3">
          <div className="d-flex align-items-center gap-2">
            <i className="fas fa-print text-primary" style={{ fontSize: '2rem' }}></i>
            <h1 className="h3 mb-0 fw-bold text-dark">Rumbos Gráfica & Copias</h1>
          </div>
          <nav className="d-flex align-items-center gap-3">
            <Link to="/precios" className="btn btn-ghost text-dark">
              Lista de Precios
            </Link>
            <Link to="/pedido-personalizado" className="btn btn-outline-primary d-flex align-items-center gap-2">
              <i className="fas fa-upload"></i>
              <span>Pedido Personalizado</span>
            </Link>
          </nav>
        </div>

        {/* Mobile Header */}
        <div className="d-lg-none">
          <div className="d-flex justify-content-between align-items-center py-3">
            {/* Hamburger Menu */}
            <button 
              className="btn btn-ghost p-2"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <i className="fas fa-bars fs-4"></i>
            </button>

            {/* Logo */}
            <div className="d-flex align-items-center gap-2">
              <i className="fas fa-print text-primary" style={{ fontSize: '1.5rem' }}></i>
              <h1 className="h5 mb-0 fw-bold text-dark">Rumbos Gráfica & Copias</h1>
            </div>

            {/* Search Icon */}
            <button 
              className="btn btn-ghost p-2"
              onClick={() => setShowMobileSearch(!showMobileSearch)}
            >
              <i className="fas fa-search fs-5"></i>
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="border-top py-3">
              <Link 
                to="/precios" 
                className="btn btn-ghost text-dark w-100 text-start mb-2"
                onClick={() => setShowMobileMenu(false)}
              >
                <i className="fas fa-list-alt me-2"></i>
                Lista de Precios
              </Link>
              <Link 
                to="/pedido-personalizado" 
                className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={() => setShowMobileMenu(false)}
              >
                <i className="fas fa-upload"></i>
                Pedido Personalizado
              </Link>
            </div>
          )}

          {/* Mobile Search Dropdown */}
          {showMobileSearch && (
            <div className="border-top py-3">
              <form onSubmit={(e) => {
                e.preventDefault();
                setFilters(prev => ({ ...prev, code: mobileSearchCode }));
                setShowMobileSearch(false);
              }}>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por código..."
                    value={mobileSearchCode}
                    onChange={(e) => setMobileSearchCode(e.target.value)}
                    autoFocus
                  />
                  <button className="btn btn-primary" type="submit">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </header>

      {/* Hero Section Mejorado */}
      <section className="hero-gradient text-white py-5">
        <div className="container text-center">
          <h2 className="display-4 fw-bold mb-4">Servicios de Impresión y Fotocopiado</h2>
          <p className="lead mb-5">Calidad profesional, precios competitivos, servicio rápido</p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/pedido-personalizado" className="btn btn-light btn-lg d-flex align-items-center gap-2">
              <i className="fas fa-upload"></i>
              Subir Archivos
            </Link>
            <a href="#catalogo" className="btn btn-outline-light btn-lg d-flex align-items-center gap-2">
              <i className="fas fa-shopping-cart"></i>
              Ver Catálogo
            </a>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container my-5">
        <div className="row">
          {/* Productos Section */}
          <div className="col-lg-9" id="catalogo">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="h2 fw-bold">Nuestros Servicios</h3>
              <div className="btn-group" role="group">
                <button 
                  type="button" 
                  className={`btn btn-sm ${vistaGrid ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setVistaGrid(true)}
                >
                  <i className="fas fa-th"></i>
                </button>
                <button 
                  type="button" 
                  className={`btn btn-sm ${!vistaGrid ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setVistaGrid(false)}
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>

            {/* Tabs de Categorías */}
            <ul className="nav nav-tabs mb-4">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'todos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('todos')}
                >
                  Todos
                </button>
              </li>
              {subjects.map(subject => (
                <li key={subject} className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === subject ? 'active' : ''}`}
                    onClick={() => setActiveTab(subject)}
                  >
                    {subject}
                  </button>
                </li>
              ))}
            </ul>

            {/* Filtros adicionales */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="year" className="form-label">Año escolar:</label>
                    <select 
                      id="year" 
                      name="year" 
                      value={filters.year} 
                      onChange={handleFilterChange}
                      className="form-select"
                    >
                      <option value="">Todos los años</option>
                      <option value="7mo grado">7mo grado</option>
                      <option value="1er año">1er año</option>
                      <option value="2do año">2do año</option>
                      <option value="3er año">3er año</option>
                      <option value="4to año">4to año</option>                        
                      <option value="5to año">5to año</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="code" className="form-label">Código de producto:</label>
                    <input 
                      type="text"
                      id="code" 
                      name="code" 
                      value={filters.code} 
                      onChange={handleFilterChange}
                      className="form-control"
                      placeholder="Buscar por código..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3">Cargando productos...</p>
              </div>
            )}
            
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {/* Vista Grid */}
            {!loading && !error && vistaGrid && (
              <div className="row g-4">
                {filteredProducts.map(product => (
                  <div key={product._id} className="col-md-6 col-lg-4">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}

            {/* Vista Lista */}
            {!loading && !error && !vistaGrid && (
              <div className="list-view-compact">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Código</th>
                        <th>Producto</th>
                        <th className="d-none d-md-table-cell">Materia</th>
                        <th className="d-none d-md-table-cell">Año</th>
                        <th className="text-end">Precio</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(product => (
                        <tr key={product._id}>
                          <td className="align-middle">
                            {product.code ? (
                              <span className="badge bg-light text-dark">{product.code}</span>
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td className="align-middle">
                            <div>
                              <div className="fw-semibold">{product.name}</div>
                              <small className="text-muted d-md-none">
                                {product.year} • {product.subject}
                              </small>
                            </div>
                          </td>
                          <td className="align-middle d-none d-md-table-cell">
                            <span className="badge bg-info text-dark">{product.subject}</span>
                          </td>
                          <td className="align-middle d-none d-md-table-cell">
                            <span className="badge bg-secondary">{product.year}</span>
                          </td>
                          <td className="align-middle text-end">
                            <div className="fw-bold text-primary">
                              ${formatPrice(product.price)}
                            </div>
                          </td>
                          <td className="align-middle text-center">
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                type="button"
                                className="btn btn-outline-primary"
                                onClick={() => handleViewImage(product)}
                                title="Ver foto"
                              >
                                <i className="fas fa-image"></i>
                              </button>
                              <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => handleAddToCart(product)}
                                title="Agregar al carrito"
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Order Sidebar */}
          <div className="col-lg-3">
            <div className="sticky-sidebar">
              <OrderForm />
            </div>
          </div>
        </div>
      </div>

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

      {/* Footer Mejorado */}
      <footer className="bg-dark text-white py-5 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-4 mb-4">
              <h4 className="h5 fw-semibold mb-3">Rumbos Gráfica & Copias</h4>
              <p className="text-secondary">Tu centro de confianza para servicios de impresión y fotocopiado.</p>
            </div>
            <div className="col-md-4 mb-4">
              <h4 className="h5 fw-semibold mb-3">Contacto</h4>
              <p className="text-secondary mb-1">
                <i className="fas fa-phone me-2"></i>+54 11 4567-8901
              </p>
              <p className="text-secondary">
                <i className="fas fa-envelope me-2"></i>info@graficalosrumbos.com
              </p>
            </div>
            <div className="col-md-4 mb-4">
              <h4 className="h5 fw-semibold mb-3">Horarios</h4>
              <p className="text-secondary mb-1">Lunes a Viernes: 9:00 - 19:00</p>
              <p className="text-secondary">Sábados: 9:00 - 14:00</p>
            </div>
          </div>
          <hr className="border-secondary" />
          <div className="container-fluid">
            <div className="d-flex justify-content-between align-items-center">
              <p className="text-secondary mb-1 small">&copy; 2025 Rumbos Gráfica & Copias - Panel de Administración</p>
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
                  background: 'rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0d6efd';
                  e.currentTarget.style.background = 'rgba(13, 110, 253, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#6c757d';
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.03)';
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
        </div>
      </footer>
    </div>
  );
};

export default Landing;