import React, { useState, useEffect } from 'react';
import { productService } from '../../services/api';
import ProductCard from './ProductCard';
import OrderForm from './OrderForm';
import '../../styles/landing.css';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    year: '',
    subject: ''
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

  const handleViewImage = (imageUrl) => {
    setSelectedImage(imageUrl);
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
          <div className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center gap-2">
              <i className="fas fa-print text-primary" style={{ fontSize: '2rem' }}></i>
              <h1 className="h3 mb-0 fw-bold text-dark">Gráfica Los Rumbos</h1>
            </div>
            <nav className="d-flex align-items-center gap-3">
              <Link to="/precios" className="btn btn-ghost text-dark">
                Lista de Precios
              </Link>
              <Link to="/pedido-personalizado" className="btn btn-outline-primary d-flex align-items-center gap-2">
                <i className="fas fa-upload"></i>
                <span className="d-none d-md-inline">Pedido Personalizado</span>
              </Link>
            </nav>
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
                      <option value="1er año">1er año</option>
                      <option value="2do año">2do año</option>
                    </select>
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
              <div className="list-view">
                {filteredProducts.map(product => (
                  <div key={product._id} className="card mb-3">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-md-2 text-center">
                          <button 
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleViewImage(product.imageUrl)}
                          >
                            <i className="fas fa-image me-1"></i>
                            Ver Foto
                          </button>
                        </div>
                        <div className="col-md-7">
                          <h4 className="h5 fw-semibold">{product.name}</h4>
                          <p className="text-muted mb-2">{product.description}</p>
                          <div className="d-flex gap-2">
                            <span className="badge bg-secondary">{product.year}</span>
                            <span className="badge bg-info text-dark">{product.subject}</span>
                          </div>
                        </div>
                        <div className="col-md-3 text-end">
                          <div className="h3 text-primary fw-bold mb-3">
                            ${formatPrice(product.price)}
                          </div>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleAddToCart(product)}
                          >
                            Solicitar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
      {showImageModal && (
        <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}} onClick={() => setShowImageModal(false)}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Vista de Imagen</h5>
                <button type="button" className="btn-close" onClick={() => setShowImageModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <img src={selectedImage || '/placeholder.jpg'} alt="Producto" className="img-fluid" />
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
              <h4 className="h5 fw-semibold mb-3">Gráfica Los Rumbos</h4>
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
              <p className="text-secondary mb-1">Lunes a Viernes: 8:00 - 20:00</p>
              <p className="text-secondary">Sábados: 9:00 - 13:00</p>
            </div>
          </div>
          <hr className="border-secondary" />
          <div className="text-center pt-3">
            <p className="text-secondary mb-0">&copy; 2025 Gráfica Los Rumbos - Todos los derechos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;