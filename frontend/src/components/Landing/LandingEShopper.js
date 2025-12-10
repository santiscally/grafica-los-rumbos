// frontend/src/components/Landing/LandingEShopper.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../../services/api';
import CartWidget from './CartWidget';
import Footer from '../Common/Footer';
import '../../styles/eshopper.css';

const LandingEShopper = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryData, setSelectedCategoryData] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showCategorySidebar, setShowCategorySidebar] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('home');

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (viewMode === 'products' && (selectedCategory || selectedSubcategory)) {
      fetchCategoryProducts();
    }
  }, [selectedCategory, selectedSubcategory, sortBy, priceFilter, page, viewMode]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [categoriesData, featuredData, newData] = await Promise.all([
        categoryService.getCategories(),
        productService.getFeaturedProducts(),
        productService.getNewProducts()
      ]);
      
      setCategories(categoriesData);
      setFeaturedProducts(featuredData);
      setNewProducts(newData);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setLoading(false);
    }
  };

  const fetchCategoryProducts = async () => {
    try {
      setLoading(true);
      const params = { sort: sortBy, page, limit: 9 };
      
      if (priceFilter !== 'all') {
        const [min, max] = priceFilter.split('-');
        if (min) params.minPrice = min;
        if (max) params.maxPrice = max;
      }
      
      const categoryId = selectedSubcategory || selectedCategory;
      const data = await categoryService.getCategoryProducts(categoryId, params);
      setProducts(data.products);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      try {
        setLoading(true);
        const data = await productService.getProducts({ search: searchQuery });
        setProducts(data.products);
        setViewMode('products');
        setSelectedCategory(null);
        setSelectedCategoryData(null);
        setSelectedSubcategory(null);
        setLoading(false);
      } catch (error) {
        console.error('Error buscando productos:', error);
        setLoading(false);
      }
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category._id);
    setSelectedCategoryData(category);
    setSelectedSubcategory(null);
    setPage(1);
    setViewMode(category.subcategories?.length > 0 ? 'category' : 'products');
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory._id);
    setPage(1);
    setViewMode('products');
  };

  const handleViewAllProducts = () => {
    setSelectedSubcategory(null);
    setPage(1);
    setViewMode('products');
  };

  const handleBackToHome = () => {
    setSelectedCategory(null);
    setSelectedCategoryData(null);
    setSelectedSubcategory(null);
    setViewMode('home');
    setProducts([]);
  };

  const handleBackToCategory = () => {
    setSelectedSubcategory(null);
    setViewMode('category');
    setProducts([]);
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.productId === product._id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        productId: product._id,
        name: product.name,
        price: product.discountedPrice || product.price,
        quantity: 1,
        image: product.imageUrl
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);
  };

  const Breadcrumb = () => {
    if (viewMode === 'home') return null;
    return (
      <nav style={{ padding: '1rem 0', marginBottom: '1rem' }}>
        <ol style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, padding: '0.75rem 1rem', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', listStyle: 'none', flexWrap: 'wrap' }}>
          <li>
            <button onClick={handleBackToHome} style={{ background: 'none', border: 'none', color: '#0d6efd', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9375rem' }}>
              <i className="fas fa-home"></i><span>Inicio</span>
            </button>
          </li>
          {selectedCategoryData && (
            <>
              <li style={{ color: '#6c757d' }}><i className="fas fa-chevron-right" style={{ fontSize: '0.75rem' }}></i></li>
              <li>
                {viewMode === 'category' ? (
                  <span style={{ fontWeight: '500', color: '#343a40' }}>{selectedCategoryData.name}</span>
                ) : (
                  <button onClick={selectedCategoryData.subcategories?.length > 0 ? handleBackToCategory : handleBackToHome} style={{ background: 'none', border: 'none', color: '#0d6efd', cursor: 'pointer', padding: 0, fontSize: '0.9375rem' }}>{selectedCategoryData.name}</button>
                )}
              </li>
            </>
          )}
          {selectedSubcategory && selectedCategoryData?.subcategories && (
            <>
              <li style={{ color: '#6c757d' }}><i className="fas fa-chevron-right" style={{ fontSize: '0.75rem' }}></i></li>
              <li><span style={{ fontWeight: '500', color: '#343a40' }}>{selectedCategoryData.subcategories.find(s => s._id === selectedSubcategory)?.name || 'Productos'}</span></li>
            </>
          )}
          {viewMode === 'products' && !selectedSubcategory && selectedCategoryData && (
            <>
              <li style={{ color: '#6c757d' }}><i className="fas fa-chevron-right" style={{ fontSize: '0.75rem' }}></i></li>
              <li><span style={{ fontWeight: '500', color: '#343a40' }}>Todos los productos</span></li>
            </>
          )}
        </ol>
      </nav>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header fijo */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ background: '#f8f9fa', borderBottom: '1px solid #dee2e6', padding: '0.5rem 0' }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 d-none d-lg-block">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Link to="/precios" style={{ color: '#343a40', textDecoration: 'none', fontSize: '0.875rem' }}><i className="fas fa-list-ul" style={{ marginRight: '6px' }}></i>Lista de Precios</Link>
                  <span style={{ color: '#6c757d' }}>|</span>
                  <Link to="/pedido-personalizado" style={{ color: '#343a40', textDecoration: 'none', fontSize: '0.875rem' }}><i className="fas fa-file-alt" style={{ marginRight: '6px' }}></i>Pedido Personalizado</Link>
                </div>
              </div>
              <div className="col-lg-6 text-center text-lg-end">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem', fontSize: '0.875rem' }}>
                  <a href="tel:+541145678901" style={{ color: '#343a40', textDecoration: 'none' }}><i className="fas fa-phone" style={{ marginRight: '6px' }}></i>+54 11 4567-8901</a>
                  <a href="mailto:info@graficalosrumbos.com" style={{ color: '#343a40', textDecoration: 'none' }} className="d-none d-md-inline"><i className="fas fa-envelope" style={{ marginRight: '6px' }}></i>info@graficalosrumbos.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '0.75rem 0', borderBottom: '1px solid #dee2e6' }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-3 col-6">
                <Link to="/" onClick={handleBackToHome} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: '44px', height: '44px', background: '#0d6efd', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem' }}><i className="fas fa-print"></i></div>
                  <span style={{ marginLeft: '0.75rem', fontSize: '1.125rem', fontWeight: 700, color: '#343a40' }}>Gráfica Los Rumbos</span>
                </Link>
              </div>
              <div className="col-lg-6 d-none d-lg-block">
                <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: '500px', margin: '0 auto' }}>
                  <input type="text" placeholder="Buscar productos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '0.75rem 3.5rem 0.75rem 1.25rem', border: '2px solid #e5e7eb', borderRadius: '25px', fontSize: '0.9375rem', outline: 'none' }} />
                  <button type="submit" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '38px', height: '38px', border: 'none', background: '#0d6efd', color: 'white', borderRadius: '50%', cursor: 'pointer' }}><i className="fas fa-search"></i></button>
                </form>
              </div>
              <div className="col-lg-3 col-6 text-end"><CartWidget /></div>
            </div>
          </div>
        </div>

        <nav style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', padding: '0.5rem 0' }}>
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-3 d-none d-lg-block position-relative">
                <button onClick={() => setShowCategorySidebar(!showCategorySidebar)} style={{ width: '100%', padding: '0.75rem 1rem', background: '#0d6efd', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span><i className="fas fa-bars" style={{ marginRight: '10px' }}></i>Categorías</span>
                  <i className={`fas fa-chevron-${showCategorySidebar ? 'up' : 'down'}`}></i>
                </button>
                {showCategorySidebar && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', borderRadius: '0 0 8px 8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, maxHeight: '400px', overflowY: 'auto', marginTop: '0.5rem' }}>
                    {categories.map(category => (
                      <div key={category._id} onClick={() => { handleCategorySelect(category); setShowCategorySidebar(false); }} style={{ padding: '0.875rem 1rem', borderBottom: '1px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <i className={category.icon || 'fas fa-folder'} style={{ marginRight: '12px', color: '#0d6efd' }}></i>
                        <span>{category.name}</span>
                        {category.subcategories?.length > 0 && <i className="fas fa-chevron-right" style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#6c757d' }}></i>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-lg-9">
                <div className="d-none d-lg-flex" style={{ gap: '0.5rem' }}>
                  <Link to="/" onClick={handleBackToHome} style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '6px' }}><i className="fas fa-home" style={{ marginRight: '8px' }}></i>Inicio</Link>
                  <Link to="/precios" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '6px' }}><i className="fas fa-tags" style={{ marginRight: '8px' }}></i>Precios</Link>
                  <Link to="/pedido-personalizado" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '6px' }}><i className="fas fa-file-alt" style={{ marginRight: '8px' }}></i>Pedido Personalizado</Link>
                </div>
                <div className="d-lg-none">
                  <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Link to="/" onClick={handleBackToHome} style={{ color: 'white', textDecoration: 'none', textAlign: 'center', padding: '0.5rem' }}><i className="fas fa-home" style={{ display: 'block', marginBottom: '0.25rem' }}></i><small>Inicio</small></Link>
                    <button onClick={() => setShowCategorySidebar(!showCategorySidebar)} style={{ background: 'none', border: 'none', color: 'white', textAlign: 'center', padding: '0.5rem', cursor: 'pointer' }}><i className="fas fa-th-large" style={{ display: 'block', marginBottom: '0.25rem' }}></i><small>Categorías</small></button>
                    <Link to="/pedido-personalizado" style={{ color: 'white', textDecoration: 'none', textAlign: 'center', padding: '0.5rem' }}><i className="fas fa-file-alt" style={{ display: 'block', marginBottom: '0.25rem' }}></i><small>Pedido</small></Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Contenido principal */}
      <main style={{ paddingTop: '180px', paddingBottom: '60px', minHeight: '100vh' }}>
        <div className="container py-4">
          <Breadcrumb />

          {viewMode === 'home' && (
            <>
              <div className="hero-banner mb-4">
                <div className="hero-content">
                  <h1>Servicios de Impresión y Fotocopiado</h1>
                  <p className="lead">Calidad profesional para todas tus necesidades de impresión</p>
                  <Link to="/pedido-personalizado" className="btn-hero"><i className="fas fa-paper-plane" style={{ marginRight: '10px' }}></i>Realizar Pedido</Link>
                </div>
              </div>

              <section className="mb-5">
                <h2 className="section-title-simple">Nuestras Categorías</h2>
                <div className="row g-4">
                  {categories.map(category => (
                    <div key={category._id} className="col-lg-4 col-md-6">
                      <div className="category-card-home" onClick={() => handleCategorySelect(category)}>
                        <div className="category-icon-home"><i className={`${category.icon || 'fas fa-folder'} fa-2x`}></i></div>
                        <div className="category-info-home">
                          <h5>{category.name}</h5>
                          <p className="text-muted mb-1">{category.description}</p>
                          <small className="text-primary">{category.productCount || 0} productos{category.subcategories?.length > 0 && ` • ${category.subcategories.length} subcategorías`}</small>
                        </div>
                        <i className="fas fa-chevron-right text-muted" style={{ marginLeft: 'auto' }}></i>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {featuredProducts.length > 0 && (
                <section className="mb-5">
                  <h2 className="section-title-simple">Productos Destacados</h2>
                  <div className="row g-4">
                    {featuredProducts.slice(0, 4).map(product => (
                      <div key={product._id} className="col-lg-3 col-md-6">
                        <div className="product-card">
                          {product.discount > 0 && <span className="product-badge">-{product.discount}%</span>}
                          <div className="product-image"><img src={product.imageUrl || '/placeholder.jpg'} alt={product.name} /></div>
                          <div className="product-info">
                            <h6 className="product-title">{product.name}</h6>
                            <div className="product-price">
                              {product.discount > 0 ? (<><span className="price-current">${formatPrice(product.discountedPrice)}</span><span className="price-old">${formatPrice(product.price)}</span></>) : (<span className="price-current">${formatPrice(product.price)}</span>)}
                            </div>
                            <button className="btn-add-cart" onClick={() => addToCart(product)}><i className="fas fa-shopping-cart" style={{ marginRight: '8px' }}></i>Agregar</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {viewMode === 'category' && selectedCategoryData && (
            <section>
              <h2 className="section-title-simple mb-4">{selectedCategoryData.name}</h2>
              {selectedCategoryData.description && <p className="text-muted mb-4">{selectedCategoryData.description}</p>}
              <div className="row g-4 mb-4">
                <div className="col-lg-4 col-md-6">
                  <div className="subcategory-card" onClick={handleViewAllProducts} style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)' }}>
                    <div className="subcategory-icon"><i className="fas fa-th-large fa-3x"></i></div>
                    <h5>Ver todos los productos</h5>
                    <p className="text-muted mb-0">{selectedCategoryData.productCount || 0} productos en total</p>
                  </div>
                </div>
                {selectedCategoryData.subcategories?.map(subcategory => (
                  <div key={subcategory._id} className="col-lg-4 col-md-6">
                    <div className="subcategory-card" onClick={() => handleSubcategorySelect(subcategory)}>
                      <div className="subcategory-icon"><i className={`${subcategory.icon || 'fas fa-folder-open'} fa-3x`}></i></div>
                      <h5>{subcategory.name}</h5>
                      {subcategory.description && <p className="text-muted mb-0">{subcategory.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {viewMode === 'products' && (
            <div className="row">
              <div className="col-lg-3 col-md-12 mb-4">
                <div className="filter-sidebar">
                  <h4 className="filter-title">Filtros</h4>
                  <div className="filter-group">
                    <h5 className="filter-subtitle">Precio</h5>
                    <div className="filter-options">
                      {[{ value: 'all', label: 'Todos' }, { value: '0-100', label: '$0 - $100' }, { value: '100-500', label: '$100 - $500' }, { value: '500-', label: '$500+' }].map(option => (
                        <label key={option.value} className="filter-option"><input type="radio" name="price" checked={priceFilter === option.value} onChange={() => setPriceFilter(option.value)} /><span>{option.label}</span></label>
                      ))}
                    </div>
                  </div>
                  {selectedCategoryData?.subcategories?.length > 0 && (
                    <div className="filter-group">
                      <h5 className="filter-subtitle">Subcategorías</h5>
                      <div className="filter-options">
                        <label className="filter-option"><input type="radio" name="subcategory" checked={!selectedSubcategory} onChange={() => { setSelectedSubcategory(null); setPage(1); }} /><span>Todas</span></label>
                        {selectedCategoryData.subcategories.map(subcat => (<label key={subcat._id} className="filter-option"><input type="radio" name="subcategory" checked={selectedSubcategory === subcat._id} onChange={() => { setSelectedSubcategory(subcat._id); setPage(1); }} /><span>{subcat.name}</span></label>))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-lg-9 col-md-12">
                <div className="products-header d-flex align-items-center justify-content-between mb-4">
                  <span className="text-muted">{products.length} producto{products.length !== 1 ? 's' : ''}</span>
                  <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}><option value="name">Nombre</option><option value="price">Precio ↑</option><option value="-price">Precio ↓</option><option value="-createdAt">Reciente</option></select>
                </div>
                {loading ? (<div className="text-center py-5"><div className="spinner-border text-primary"></div></div>) : products.length === 0 ? (<div className="text-center py-5"><i className="fas fa-box-open fa-4x text-muted mb-3"></i><p className="text-muted">No hay productos</p></div>) : (
                  <>
                    <div className="row g-4">
                      {products.map(product => (
                        <div key={product._id} className="col-lg-4 col-md-6">
                          <div className="product-card">
                            {product.discount > 0 && <span className="product-badge">-{product.discount}%</span>}
                            <div className="product-image"><img src={product.imageUrl || '/placeholder.jpg'} alt={product.name} /></div>
                            <div className="product-info">
                              <h6 className="product-title">{product.name}</h6>
                              <div className="product-price">{product.discount > 0 ? (<><span className="price-current">${formatPrice(product.discountedPrice)}</span><span className="price-old">${formatPrice(product.price)}</span></>) : (<span className="price-current">${formatPrice(product.price)}</span>)}</div>
                              <button className="btn-add-cart" onClick={() => addToCart(product)}><i className="fas fa-shopping-cart" style={{ marginRight: '8px' }}></i>Agregar</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {totalPages > 1 && (<div className="pagination-wrapper"><button className="pagination-btn" disabled={page === 1} onClick={() => setPage(page - 1)}><i className="fas fa-chevron-left"></i></button>{[...Array(totalPages)].map((_, i) => (<button key={i} className={`pagination-btn ${page === i + 1 ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>))}<button className="pagination-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}><i className="fas fa-chevron-right"></i></button></div>)}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LandingEShopper;