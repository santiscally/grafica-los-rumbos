import React, { useState, useEffect } from 'react';
import { productService } from '../../services/api';
import ProductCard from './ProductCard';
import OrderForm from './OrderForm';
import '../../styles/landing.css';
import logoImage from '../../assets/logo.png'; // Aquí deberás agregar tu logo

const Landing = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    year: '',
    subject: ''
  });
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      
      // Extraer materias únicas
      const uniqueSubjects = [...new Set(data.map(p => p.subject))];
      setSubjects(uniqueSubjects);
      
      setError(null);
    } catch (err) {
      setError('Error al cargar productos');
      console.error(err);
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

  return (
    <div className="landing-container">
      {/* Header de ancho completo */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo-container">
            
            <h1>Gráfica Los Rumbos</h1>
          </div>
          <div className="contact-info">
            <div className="contact-item">
              <i className="fas fa-phone-alt"></i>
              <span>+54 11 4567-8901</span>
            </div>
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <span>info@graficalosrumbos.com</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h2>Fotocopias y Material de Estudio</h2>
          <p>Solicita tus materiales escolares de forma fácil y rápida. ¡Entrega garantizada!</p>
          <button className="cta-button">Ver Catálogo</button>
        </div>
      </div>

      {/* Contenido principal con layout ajustado */}
      <main className="main-content">
        <div className="products-container">
          <div className="filters-section">
            <h3>Filtrar Productos</h3>
            <div className="filter-controls">
              <div className="filter-group">
                <label htmlFor="year">Año escolar:</label>
                <select 
                  id="year" 
                  name="year" 
                  value={filters.year} 
                  onChange={handleFilterChange}
                >
                  <option value="">Todos los años</option>
                  <option value="1er año">1er año</option>
                  <option value="2do año">2do año</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="subject">Materia:</label>
                <select 
                  id="subject" 
                  name="subject" 
                  value={filters.subject} 
                  onChange={handleFilterChange}
                >
                  <option value="">Todas las materias</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading && <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando productos...</p>
          </div>}
          
          {error && <div className="error-message">{error}</div>}

          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>

        {/* Sección de pedido a la derecha */}
        <div className="order-sidebar">
          <OrderForm />
        </div>
      </main>

      {/* Footer de ancho completo */}
      <footer className="main-footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>Gráfica Los Rumbos</h3>
            <p>Tu solución para fotocopias y material de estudio.</p>
          </div>
          <div className="footer-section">
            <h3>Contacto</h3>
            <p><i className="fas fa-map-marker-alt"></i> Av. Ejemplo 1234, Buenos Aires</p>
            <p><i className="fas fa-phone-alt"></i> +54 11 4567-8901</p>
            <p><i className="fas fa-envelope"></i> info@graficalosrumbos.com</p>
          </div>
          <div className="footer-section">
            <h3>Horarios</h3>
            <p>Lunes a Viernes: 8:00 a 20:00</p>
            <p>Sábados: 9:00 a 13:00</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Gráfica Los Rumbos - Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;