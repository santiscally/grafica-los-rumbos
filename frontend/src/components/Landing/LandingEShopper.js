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
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
      setProducts(data.products || data);
      setTotalPages(data.totalPages || 1);
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
        setProducts(data);
        setViewMode('products');
        setSelectedCategory(null);
        setSelectedCategoryData(null);
        setSelectedSubcategory(null);
        setShowMobileSearch(false);
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
    setShowCategorySidebar(false);
    setShowMobileMenu(false);
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
    setSearchQuery('');
    setShowMobileMenu(false);
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

  const getProductImage = (product) => {
    if (product.hasImage) {
      return `${process.env.REACT_APP_API_URL || ''}/api/files/product/${product._id}`;
    }
    return product.imageUrl || '/placeholder.jpg';
  };

  const Breadcrumb = () => {
    if (viewMode === 'home') return null;
    return (
      <nav className="breadcrumb-nav">
        <ol className="breadcrumb-list">
          <li>
            <button onClick={handleBackToHome} className="breadcrumb-link">
              <i className="fas fa-home"></i>
              <span>Inicio</span>
            </button>
          </li>
          {selectedCategoryData && (
            <>
              <li className="breadcrumb-separator">
                <i className="fas fa-chevron-right"></i>
              </li>
              <li>
                {viewMode === 'category' ? (
                  <span className="breadcrumb-current">{selectedCategoryData.name}</span>
                ) : (
                  <button 
                    onClick={selectedCategoryData.subcategories?.length > 0 ? handleBackToCategory : handleBackToHome} 
                    className="breadcrumb-link"
                  >
                    {selectedCategoryData.name}
                  </button>
                )}
              </li>
            </>
          )}
          {selectedSubcategory && selectedCategoryData?.subcategories && (
            <>
              <li className="breadcrumb-separator">
                <i className="fas fa-chevron-right"></i>
              </li>
              <li>
                <span className="breadcrumb-current">
                  {selectedCategoryData.subcategories.find(s => s._id === selectedSubcategory)?.name || 'Productos'}
                </span>
              </li>
            </>
          )}
          {viewMode === 'products' && !selectedSubcategory && selectedCategoryData && (
            <>
              <li className="breadcrumb-separator">
                <i className="fas fa-chevron-right"></i>
              </li>
              <li>
                <span className="breadcrumb-current">Todos los productos</span>
              </li>
            </>
          )}
          {viewMode === 'products' && !selectedCategoryData && searchQuery && (
            <>
              <li className="breadcrumb-separator">
                <i className="fas fa-chevron-right"></i>
              </li>
              <li>
                <span className="breadcrumb-current">Busqueda: "{searchQuery}"</span>
              </li>
            </>
          )}
        </ol>
      </nav>
    );
  };

  // ProductCard con codigo visible abajo
  const ProductCard = ({ product }) => (
    <div className="product-card">
      {product.discount > 0 && (
        <span className="product-badge-discount">-{product.discount}%</span>
      )}
      <div className="product-image">
        <img 
          src={getProductImage(product)} 
          alt={product.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder.jpg';
          }}
        />
      </div>
      <div className="product-info">
        <span className="product-category-tag">{product.subject || product.category?.name || 'General'}</span>
        <h6 className="product-title">{product.name}</h6>
        <div className="product-price">
          {product.discount > 0 ? (
            <>
              <span className="price-current">${formatPrice(product.discountedPrice)}</span>
              <span className="price-old">${formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="price-current">${formatPrice(product.price)}</span>
          )}
        </div>
        <button className="btn-add-cart" onClick={() => addToCart(product)}>
          <i className="fas fa-cart-plus"></i>
          Agregar
        </button>
        {product.code && (
          <div className="product-code-bottom">
            <span className="code-label">Codigo:</span>
            <span className="code-value">{product.code}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="eshopper-page">
      {/* Header Principal */}
      <header className="eshopper-header">
        {/* Top Bar - Solo Desktop */}
        <div className="header-topbar">
          <div className="container">
            <div className="topbar-content">
              <div className="topbar-links">
                <Link to="/precios">
                  <i className="fas fa-list-ul"></i>
                  Lista de Precios
                </Link>
                <span className="separator">|</span>
                <Link to="/pedido-personalizado">
                  <i className="fas fa-file-alt"></i>
                  Pedido Personalizado
                </Link>
              </div>
              <div className="topbar-contact">
                <a href="tel:+541145678901">
                  <i className="fas fa-phone"></i>
                  +54 11 4567-8901
                </a>
                <a href="mailto:info@graficalosrumbos.com" className="hide-mobile">
                  <i className="fas fa-envelope"></i>
                  info@graficalosrumbos.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="header-main">
          <div className="container">
            <div className="header-main-content">
              {/* Logo - IZQUIERDA */}
              <Link to="/" onClick={handleBackToHome} className="header-logo">
                <div className="logo-icon">
                  <i className="fas fa-print"></i>
                </div>
                <span className="logo-text">Grafica Los Rumbos</span>
              </Link>

              {/* Buscador Desktop */}
              <form onSubmit={handleSearch} className="header-search-desktop">
                <input 
                  type="text" 
                  placeholder="Buscar productos por nombre o codigo..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit">
                  <i className="fas fa-search"></i>
                </button>
              </form>

              {/* Iconos Mobile - DERECHA */}
              <div className="header-actions-mobile">
                <button 
                  className="header-mobile-btn search-btn"
                  onClick={() => setShowMobileSearch(!showMobileSearch)}
                  aria-label="Buscar"
                >
                  <i className="fas fa-search"></i>
                </button>
                <button 
                  className="header-mobile-btn menu-btn"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  aria-label="Menu"
                >
                  <i className={`fas fa-${showMobileMenu ? 'times' : 'bars'}`}></i>
                </button>
              </div>

              {/* Carrito Desktop */}
              <div className="header-cart">
                <CartWidget />
              </div>
            </div>

            {/* Buscador Mobile expandido */}
            {showMobileSearch && (
              <div className="header-search-mobile">
                <form onSubmit={handleSearch}>
                  <input 
                    type="text" 
                    placeholder="Buscar productos..." 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  <button type="submit">
                    <i className="fas fa-search"></i>
                  </button>
                </form>
              </div>
            )}

            {/* Menu Mobile expandido */}
            {showMobileMenu && (
              <div className="header-mobile-nav">
                <Link to="/" onClick={handleBackToHome} className="mobile-nav-item">
                  <i className="fas fa-home"></i>
                  <span>Inicio</span>
                </Link>
                <button 
                  className="mobile-nav-item"
                  onClick={() => {
                    setShowCategorySidebar(!showCategorySidebar);
                    setShowMobileMenu(false);
                  }}
                >
                  <i className="fas fa-th-large"></i>
                  <span>Categorias</span>
                </button>
                <Link to="/precios" className="mobile-nav-item" onClick={() => setShowMobileMenu(false)}>
                  <i className="fas fa-tags"></i>
                  <span>Precios</span>
                </Link>
                <Link to="/pedido-personalizado" className="mobile-nav-item" onClick={() => setShowMobileMenu(false)}>
                  <i className="fas fa-file-alt"></i>
                  <span>Pedido</span>
                </Link>
                <div className="mobile-nav-item cart-nav-item">
                  <CartWidget />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navegacion Desktop */}
        <nav className="header-nav">
          <div className="container">
            <div className="nav-content">
              <div className="nav-categories-desktop">
                <button 
                  onClick={() => setShowCategorySidebar(!showCategorySidebar)}
                  className="btn-categories"
                >
                  <i className="fas fa-bars"></i>
                  <span>Categorias</span>
                  <i className={`fas fa-chevron-${showCategorySidebar ? 'up' : 'down'}`}></i>
                </button>
                
                {showCategorySidebar && (
                  <div className="categories-dropdown">
                    {categories.map(category => (
                      <div 
                        key={category._id} 
                        className="category-item"
                        onClick={() => handleCategorySelect(category)}
                      >
                        <i className={category.icon || 'fas fa-folder'}></i>
                        <span>{category.name}</span>
                        {category.subcategories?.length > 0 && (
                          <i className="fas fa-chevron-right arrow"></i>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="nav-links-desktop">
                <Link to="/" onClick={handleBackToHome}>
                  <i className="fas fa-home"></i>
                  Inicio
                </Link>
                <Link to="/precios">
                  <i className="fas fa-tags"></i>
                  Precios
                </Link>
                <Link to="/pedido-personalizado">
                  <i className="fas fa-file-alt"></i>
                  Pedido Personalizado
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Contenido Principal */}
      <main className="eshopper-main">
        <div className="container">
          <Breadcrumb />

          {/* Vista Home */}
          {viewMode === 'home' && (
            <>
              {/* Hero Banner */}
              <div className="hero-banner">
                <div className="hero-content">
                  <h1>Servicios de Impresion y Fotocopiado</h1>
                  <p>Calidad profesional para todas tus necesidades de impresion</p>
                  <Link to="/pedido-personalizado" className="btn-hero">
                    <i className="fas fa-paper-plane"></i>
                    Realizar Pedido
                  </Link>
                </div>
              </div>

              {/* Categorias */}
              <section className="section-categories">
                <h2 className="section-title">Nuestras Categorias</h2>
                <div className="categories-grid">
                  {categories.map(category => (
                    <div 
                      key={category._id} 
                      className="category-card-home"
                      onClick={() => handleCategorySelect(category)}
                    >
                      <div className="category-icon-home">
                        <i className={`${category.icon || 'fas fa-folder'} fa-2x`}></i>
                      </div>
                      <div className="category-info-home">
                        <h5>{category.name}</h5>
                        <p>{category.description}</p>
                        <small>
                          {category.productCount || 0} productos
                          {category.subcategories?.length > 0 && ` - ${category.subcategories.length} subcategorias`}
                        </small>
                      </div>
                      <i className="fas fa-chevron-right"></i>
                    </div>
                  ))}
                </div>
              </section>

              {/* Productos Destacados */}
              {featuredProducts.length > 0 && (
                <section className="section-products">
                  <h2 className="section-title">Productos Destacados</h2>
                  <div className="products-grid-home">
                    {featuredProducts.slice(0, 4).map(product => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {/* Vista Categoria con Subcategorias */}
          {viewMode === 'category' && selectedCategoryData && (
            <section className="section-subcategories">
              <h2 className="section-title">{selectedCategoryData.name}</h2>
              {selectedCategoryData.description && (
                <p className="section-description">{selectedCategoryData.description}</p>
              )}
              
              <div className="subcategories-grid">
                <div className="subcategory-card all-products" onClick={handleViewAllProducts}>
                  <div className="subcategory-icon">
                    <i className="fas fa-th-large fa-3x"></i>
                  </div>
                  <h5>Ver todos los productos</h5>
                  <p>{selectedCategoryData.productCount || 0} productos en total</p>
                </div>
                
                {selectedCategoryData.subcategories?.map(subcategory => (
                  <div 
                    key={subcategory._id} 
                    className="subcategory-card"
                    onClick={() => handleSubcategorySelect(subcategory)}
                  >
                    <div className="subcategory-icon">
                      <i className={`${subcategory.icon || 'fas fa-folder-open'} fa-3x`}></i>
                    </div>
                    <h5>{subcategory.name}</h5>
                    {subcategory.description && <p>{subcategory.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Vista Productos */}
          {viewMode === 'products' && (
            <div className="products-layout">
              {/* Sidebar de Filtros - Desktop */}
              <aside className="filters-sidebar-desktop">
                <h4>Filtros</h4>
                
                <div className="filter-group">
                  <h5>Precio</h5>
                  <div className="filter-options">
                    {[
                      { value: 'all', label: 'Todos' },
                      { value: '0-100', label: '$0 - $100' },
                      { value: '100-500', label: '$100 - $500' },
                      { value: '500-1000', label: '$500 - $1000' },
                      { value: '1000-', label: '$1000+' }
                    ].map(option => (
                      <label key={option.value} className="filter-option">
                        <input 
                          type="radio" 
                          name="price" 
                          checked={priceFilter === option.value} 
                          onChange={() => setPriceFilter(option.value)} 
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {selectedCategoryData?.subcategories?.length > 0 && (
                  <div className="filter-group">
                    <h5>Subcategorias</h5>
                    <div className="filter-options">
                      <label className="filter-option">
                        <input 
                          type="radio" 
                          name="subcategory" 
                          checked={!selectedSubcategory} 
                          onChange={() => { setSelectedSubcategory(null); setPage(1); }} 
                        />
                        <span>Todas</span>
                      </label>
                      {selectedCategoryData.subcategories.map(subcat => (
                        <label key={subcat._id} className="filter-option">
                          <input 
                            type="radio" 
                            name="subcategory" 
                            checked={selectedSubcategory === subcat._id} 
                            onChange={() => { setSelectedSubcategory(subcat._id); setPage(1); }} 
                          />
                          <span>{subcat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </aside>

              {/* Contenido de Productos */}
              <div className="products-content">
                <div className="products-header">
                  <span className="products-count">
                    {products.length} producto{products.length !== 1 ? 's' : ''}
                  </span>
                  
                  <button 
                    className="btn-filters-mobile"
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                  >
                    <i className="fas fa-sliders-h"></i>
                    Filtros
                  </button>
                  
                  <select 
                    className="sort-select" 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="name">Nombre</option>
                    <option value="price">Precio menor</option>
                    <option value="-price">Precio mayor</option>
                    <option value="-createdAt">Reciente</option>
                  </select>
                </div>

                {showMobileFilters && (
                  <div className="filters-mobile-dropdown">
                    <div className="filter-group">
                      <h5>Precio</h5>
                      <select 
                        value={priceFilter} 
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="filter-select-mobile"
                      >
                        <option value="all">Todos los precios</option>
                        <option value="0-100">$0 - $100</option>
                        <option value="100-500">$100 - $500</option>
                        <option value="500-1000">$500 - $1000</option>
                        <option value="1000-">$1000+</option>
                      </select>
                    </div>
                    
                    {selectedCategoryData?.subcategories?.length > 0 && (
                      <div className="filter-group">
                        <h5>Subcategoria</h5>
                        <select 
                          value={selectedSubcategory || ''}
                          onChange={(e) => { 
                            setSelectedSubcategory(e.target.value || null); 
                            setPage(1); 
                          }}
                          className="filter-select-mobile"
                        >
                          <option value="">Todas</option>
                          {selectedCategoryData.subcategories.map(subcat => (
                            <option key={subcat._id} value={subcat._id}>
                              {subcat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    <button 
                      className="btn-close-filters"
                      onClick={() => setShowMobileFilters(false)}
                    >
                      Aplicar filtros
                    </button>
                  </div>
                )}

                {loading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Cargando productos...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-box-open fa-4x"></i>
                    <h3>No hay productos</h3>
                    <p>No se encontraron productos con los filtros seleccionados</p>
                    <button onClick={handleBackToHome}>Volver al inicio</button>
                  </div>
                ) : (
                  <>
                    <div className="products-grid">
                      {products.map(product => (
                        <ProductCard key={product._id} product={product} />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="pagination">
                        <button 
                          className="pagination-btn"
                          disabled={page === 1} 
                          onClick={() => setPage(page - 1)}
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                        
                        {[...Array(totalPages)].map((_, i) => (
                          <button 
                            key={i}
                            className={`pagination-btn ${page === i + 1 ? 'active' : ''}`}
                            onClick={() => setPage(i + 1)}
                          >
                            {i + 1}
                          </button>
                        ))}
                        
                        <button 
                          className="pagination-btn"
                          disabled={page === totalPages} 
                          onClick={() => setPage(page + 1)}
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal de Categorias Mobile */}
      {showCategorySidebar && (
        <>
          <div 
            className="mobile-categories-backdrop"
            onClick={() => setShowCategorySidebar(false)}
          />
          <div className="mobile-categories-panel">
            <div className="panel-header">
              <h4>Categorias</h4>
              <button onClick={() => setShowCategorySidebar(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="panel-body">
              {categories.map(category => (
                <div 
                  key={category._id} 
                  className="mobile-category-item"
                  onClick={() => handleCategorySelect(category)}
                >
                  <i className={category.icon || 'fas fa-folder'}></i>
                  <span>{category.name}</span>
                  <i className="fas fa-chevron-right"></i>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
};

export default LandingEShopper;