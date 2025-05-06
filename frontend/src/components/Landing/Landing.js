import React, { useState, useEffect } from 'react';
import { productService } from '../../services/api';
import ProductCard from './ProductCard';
import OrderForm from './OrderForm';

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
    <div className="landing">
      <header className="hero">
        <h1>Fotocopias Online</h1>
        <p>Solicita tus materiales escolares de forma fácil y rápida</p>
      </header>

      <section className="filters">
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
      </section>

      {loading && <div className="loading">Cargando productos...</div>}
      {error && <div className="error">{error}</div>}

      <section className="products-grid">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </section>

      <OrderForm />
    </div>
  );
};

export default Landing;
