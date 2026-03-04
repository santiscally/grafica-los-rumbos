import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { categoryService } from '../../services/api';
import CartWidget from './CartWidget';
import Footer from '../Common/Footer';
import '../../styles/eshopper.css';

const LandingColegio = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [priceFilter, setPriceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cartToast, setCartToast] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const cartToastTimer = React.useRef(null);

  useEffect(() => {
    fetchCategory();
  }, [slug]);

  useEffect(() => {
    if (category) {
      fetchProducts();
    }
  }, [category, selectedSubcategory, sortBy, priceFilter, page, search, yearFilter, subjectFilter]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategoryBySlug(slug);
      setCategory(data);
    } catch (error) {
      setNotFound(true);
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { sort: sortBy, page, limit: 9 };

      if (search) params.search = search;
      if (yearFilter) params.year = yearFilter;
      if (subjectFilter) params.subject = subjectFilter;

      if (priceFilter !== 'all') {
        const [min, max] = priceFilter.split('-');
        if (min) params.minPrice = min;
        if (max) params.maxPrice = max;
      }

      const categoryId = selectedSubcategory || category._id;
      const data = await categoryService.getCategoryProducts(categoryId, params);
      const prods = data.products || data;
      setProducts(prods);
      setTotalPages(data.totalPages || 1);

      // Extraer materias únicas de los productos (solo en primera carga)
      if (!yearFilter && !subjectFilter && !search && page === 1) {
        const subjects = [...new Set(prods.map(p => p.subject).filter(Boolean))].sort();
        setAvailableSubjects(prev => subjects.length > prev.length ? subjects : prev);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error cargando productos:', error);
      setLoading(false);
    }
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

    if (cartToastTimer.current) clearTimeout(cartToastTimer.current);
    setCartToast({ name: product.name, image: getProductImage(product) });
    cartToastTimer.current = setTimeout(() => setCartToast(null), 3000);
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

  const ProductCard = ({ product }) => (
    <div className="product-card">
      {product.discount > 0 && (
        <span className="product-badge-discount">-{product.discount}%</span>
      )}
      <div className="product-image">
        <img
          src={getProductImage(product)}
          alt={product.name}
          onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.jpg'; }}
        />
      </div>
      <div className="product-info">
        <span className="product-category-tag">{product.subject || product.subcategory?.name || product.category?.name || ''}</span>
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

  if (notFound) {
    return (
      <div className="eshopper-page">
        <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
          <i className="fas fa-lock fa-4x" style={{ color: '#ccc', marginBottom: '20px' }}></i>
          <h2>Página no encontrada</h2>
          <p>El enlace que usaste no es válido o ya no existe.</p>
          <Link to="/" className="btn-hero" style={{ display: 'inline-flex', marginTop: '20px' }}>Ir al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="eshopper-page">
      {/* Header */}
      <header className="eshopper-header">
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
            </div>
          </div>
        </div>

        <div className="header-main">
          <div className="container">
            <div className="header-main-content">
              <Link to="/" className="header-logo">
                <img src="/logo.jpeg" alt="Rumbos Gráfica & Copias" className="logo-image" />
              </Link>
              <div className="header-cart">
                <CartWidget />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="eshopper-main">
        <div className="container">
          {loading && !category ? (
            <div className="loading-state" style={{ padding: '80px 0' }}>
              <div className="spinner"></div>
              <p>Cargando...</p>
            </div>
          ) : category && (
            <>
              {/* Banner del colegio */}
              <div className="hero-banner" style={{ marginBottom: '30px' }}>
                <div className="hero-content">
                  <h1>{category.name}</h1>
                  {category.description && <p>{category.description}</p>}
                </div>
              </div>

              <div className="products-layout">
                {/* Sidebar de filtros */}
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
                            onChange={() => { setPriceFilter(option.value); setPage(1); }}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="filter-group">
                    <h5>Año</h5>
                    <div className="filter-options">
                      {[
                        { value: '', label: 'Todos' },
                        { value: '7mo grado', label: '7mo grado' },
                        { value: '1er año', label: '1er año' },
                        { value: '2do año', label: '2do año' },
                        { value: '3er año', label: '3er año' },
                        { value: '4to año', label: '4to año' },
                        { value: '5to año', label: '5to año' }
                      ].map(option => (
                        <label key={option.value} className="filter-option">
                          <input
                            type="radio"
                            name="year"
                            checked={yearFilter === option.value}
                            onChange={() => { setYearFilter(option.value); setPage(1); }}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {availableSubjects.length > 0 && (
                    <div className="filter-group">
                      <h5>Materia</h5>
                      <div className="filter-options">
                        <label className="filter-option">
                          <input
                            type="radio"
                            name="subject"
                            checked={subjectFilter === ''}
                            onChange={() => { setSubjectFilter(''); setPage(1); }}
                          />
                          <span>Todas</span>
                        </label>
                        {availableSubjects.map(subj => (
                          <label key={subj} className="filter-option">
                            <input
                              type="radio"
                              name="subject"
                              checked={subjectFilter === subj}
                              onChange={() => { setSubjectFilter(subj); setPage(1); }}
                            />
                            <span>{subj}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {category.subcategories?.length > 0 && (
                    <div className="filter-group">
                      <h5>Sección</h5>
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
                        {category.subcategories.map(subcat => (
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

                {/* Productos */}
                <div className="products-content">
                  <form
                    className="search-bar-form"
                    onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }}
                  >
                    <div className="search-bar-wrapper">
                      <input
                        type="text"
                        className="search-bar-input"
                        placeholder="Buscar productos..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                      />
                      {search && (
                        <button
                          type="button"
                          className="search-bar-clear"
                          onClick={() => { setSearch(''); setSearchInput(''); setPage(1); }}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      )}
                      <button type="submit" className="search-bar-btn">
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </form>

                  <div className="products-header">
                    <span className="products-count">
                      {products.length} producto{products.length !== 1 ? 's' : ''}
                      {search && <span className="search-active-tag"> para "{search}"</span>}
                    </span>
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
                          <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>
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
                          <button className="pagination-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                            <i className="fas fa-chevron-right"></i>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />

      {cartToast && (
        <div className="cart-toast">
          <img src={cartToast.image} alt="" className="cart-toast-img" onError={(e) => { e.target.style.display = 'none'; }} />
          <div className="cart-toast-body">
            <span className="cart-toast-title">
              <i className="fas fa-check-circle"></i> Agregado al carrito
            </span>
            <span className="cart-toast-name">{cartToast.name}</span>
          </div>
          <button className="cart-toast-close" onClick={() => setCartToast(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default LandingColegio;
