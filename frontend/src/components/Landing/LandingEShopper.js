// frontend/src/components/Landing/LandingEShopper.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../../services/api';
import CartWidget from './CartWidget';
import '../../styles/eshopper.css';

const LandingEShopper = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showCategorySidebar, setShowCategorySidebar] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchCategoryProducts();
    }
  }, [selectedCategory, sortBy, priceFilter, page]);

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
      const params = { 
        sort: sortBy,
        page,
        limit: 9
      };
      
      if (priceFilter !== 'all') {
        const [min, max] = priceFilter.split('-');
        if (min) params.minPrice = min;
        if (max) params.maxPrice = max;
      }
      
      const data = await categoryService.getCategoryProducts(selectedCategory, params);
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
        setSelectedCategory(null);
        setLoading(false);
      } catch (error) {
        console.error('Error buscando productos:', error);
        setLoading(false);
      }
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setPage(1);
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
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  return (
    <div className="eshopper-container">
      {/* Topbar */}
      <div className="container-fluid bg-light">
        <div className="row py-2 px-xl-5">
          <div className="col-lg-6 d-none d-lg-block">
            <div className="d-inline-flex align-items-center">
              <Link className="text-dark" to="/precios">Lista de Precios</Link>
              <span className="text-muted px-2">|</span>
              <Link className="text-dark" to="/pedido-personalizado">Pedido Personalizado</Link>
            </div>
          </div>
          <div className="col-lg-6 text-center text-lg-right">
            <div className="d-inline-flex align-items-center">
              <a className="text-dark px-2" href="tel:+541145678901">
                <i className="fas fa-phone"></i> +54 11 4567-8901
              </a>
              <a className="text-dark px-2" href="mailto:info@graficalosrumbos.com">
                <i className="fas fa-envelope"></i> info@graficalosrumbos.com
              </a>
            </div>
          </div>
        </div>
        
        <div className="row align-items-center py-3 px-xl-5">
          <div className="col-lg-3 d-none d-lg-block">
            <a href="/" className="text-decoration-none">
              <h1 className="m-0 display-5 font-weight-semi-bold">
                <span className="text-primary font-weight-bold border px-3 mr-1">
                  <i className="fas fa-print"></i>
                </span>Gráfica Los Rumbos
              </h1>
            </a>
          </div>
          <div className="col-lg-6 col-6 text-left">
            <form onSubmit={handleSearch}>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="input-group-append">
                  <button type="submit" className="input-group-text bg-transparent text-primary">
                    <i className="fa fa-search"></i>
                  </button>
                </div>
              </div>
            </form>
          </div>
          <div className="col-lg-3 col-6 text-right">
            <CartWidget />
          </div>
        </div>
      </div>

      {/* Navbar con Categorías */}
      <div className="container-fluid mb-5">
        <div className="row border-top px-xl-5">
          <div className="col-lg-3 d-none d-lg-block">
            <a 
              className="btn shadow-none d-flex align-items-center justify-content-between bg-primary text-white w-100"
              data-toggle="collapse" 
              href="#navbar-vertical"
              onClick={() => setShowCategorySidebar(!showCategorySidebar)}
              style={{ height: '65px', marginTop: '-1px', padding: '0 30px' }}
            >
              <h6 className="m-0">Categorías</h6>
              <i className="fa fa-angle-down text-dark"></i>
            </a>
            <nav 
              className={`collapse ${showCategorySidebar ? 'show' : ''} navbar navbar-vertical navbar-light align-items-start p-0 border border-top-0 border-bottom-0`}
              id="navbar-vertical" 
              style={{ width: 'calc(100% - 30px)', zIndex: 1, position: 'absolute', backgroundColor: 'white' }}
            >
              <div className="navbar-nav w-100 overflow-auto" style={{ maxHeight: '410px' }}>
                {categories.map(category => (
                  <div key={category._id}>
                    {category.subcategories && category.subcategories.length > 0 ? (
                      <div className="nav-item dropdown">
                        <a 
                          href="#" 
                          className="nav-link" 
                          data-toggle="dropdown"
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategorySelect(category._id);
                          }}
                        >
                          <i className={`${category.icon} mr-2`}></i>
                          {category.name}
                          <i className="fa fa-angle-down float-right mt-1"></i>
                        </a>
                        <div className="dropdown-menu position-absolute bg-secondary border-0 rounded-0 w-100 m-0">
                          {category.subcategories.map(subcat => (
                            <a 
                              key={subcat._id}
                              href="#"
                              className="dropdown-item"
                              onClick={(e) => {
                                e.preventDefault();
                                handleCategorySelect(subcat._id);
                              }}
                            >
                              <i className={`${subcat.icon} mr-2`}></i>
                              {subcat.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <a 
                        href="#"
                        className="nav-item nav-link"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCategorySelect(category._id);
                        }}
                      >
                        <i className={`${category.icon} mr-2`}></i>
                        {category.name}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </nav>
          </div>
          
          <div className="col-lg-9">
            {/* Carousel o contenido principal */}
            {!selectedCategory && (
              <div id="header-carousel" className="carousel slide" data-ride="carousel">
                <div className="carousel-inner">
                  <div className="carousel-item active" style={{ height: '410px', background: 'linear-gradient(135deg, #0a4384 0%, #0d6efd 100%)' }}>
                    <div className="carousel-caption d-flex flex-column align-items-center justify-content-center">
                      <div className="p-3" style={{ maxWidth: '700px' }}>
                        <h4 className="text-light text-uppercase font-weight-medium mb-3">
                          Servicios de Impresión y Fotocopiado
                        </h4>
                        <h3 className="display-4 text-white font-weight-semi-bold mb-4">
                          Calidad Profesional
                        </h3>
                        <Link to="/pedido-personalizado" className="btn btn-light py-2 px-3">
                          Realizar Pedido
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categorías destacadas */}
      {!selectedCategory && (
        <div className="container-fluid pt-5">
          <div className="text-center mb-4">
            <h2 className="section-title px-5"><span className="px-2">Nuestras Categorías</span></h2>
          </div>
          <div className="row px-xl-5 pb-3">
            {categories.slice(0, 6).map(category => (
              <div key={category._id} className="col-lg-4 col-md-6 pb-1">
                <div 
                  className="cat-item d-flex flex-column border mb-4 cursor-pointer"
                  style={{ padding: '30px', cursor: 'pointer' }}
                  onClick={() => handleCategorySelect(category._id)}
                >
                  <p className="text-right">{category.productCount} Productos</p>
                  <div className="cat-img position-relative overflow-hidden mb-3 text-center">
                    <i className={`${category.icon} fa-5x text-primary`}></i>
                  </div>
                  <h5 className="font-weight-semi-bold m-0">{category.name}</h5>
                  <p className="mt-2 text-muted">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Productos de categoría seleccionada */}
      {selectedCategory && (
        <div className="container-fluid pt-5">
          <div className="row px-xl-5">
            {/* Filtros laterales */}
            <div className="col-lg-3 col-md-12">
              <div className="border-bottom mb-4 pb-4">
                <h5 className="font-weight-semi-bold mb-4">Filtrar por precio</h5>
                <form>
                  <div className="custom-control custom-checkbox d-flex align-items-center justify-content-between mb-3">
                    <input 
                      type="radio" 
                      className="custom-control-input" 
                      name="price"
                      id="price-all"
                      checked={priceFilter === 'all'}
                      onChange={() => setPriceFilter('all')}
                    />
                    <label className="custom-control-label" htmlFor="price-all">Todos los precios</label>
                  </div>
                  <div className="custom-control custom-checkbox d-flex align-items-center justify-content-between mb-3">
                    <input 
                      type="radio" 
                      className="custom-control-input" 
                      name="price"
                      id="price-1"
                      checked={priceFilter === '0-100'}
                      onChange={() => setPriceFilter('0-100')}
                    />
                    <label className="custom-control-label" htmlFor="price-1">$0 - $100</label>
                  </div>
                  <div className="custom-control custom-checkbox d-flex align-items-center justify-content-between mb-3">
                    <input 
                      type="radio" 
                      className="custom-control-input" 
                      name="price"
                      id="price-2"
                      checked={priceFilter === '100-500'}
                      onChange={() => setPriceFilter('100-500')}
                    />
                    <label className="custom-control-label" htmlFor="price-2">$100 - $500</label>
                  </div>
                  <div className="custom-control custom-checkbox d-flex align-items-center justify-content-between mb-3">
                    <input 
                      type="radio" 
                      className="custom-control-input" 
                      name="price"
                      id="price-3"
                      checked={priceFilter === '500-'}
                      onChange={() => setPriceFilter('500-')}
                    />
                    <label className="custom-control-label" htmlFor="price-3">$500+</label>
                  </div>
                </form>
              </div>
            </div>

            {/* Lista de productos */}
            <div className="col-lg-9 col-md-12">
              <div className="row pb-3">
                <div className="col-12 pb-1">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <button 
                        className="btn btn-sm btn-light"
                        onClick={() => setSelectedCategory(null)}
                      >
                        <i className="fas fa-arrow-left mr-2"></i>
                        Volver
                      </button>
                    </div>
                    <div className="dropdown ml-4">
                      <button 
                        className="btn border dropdown-toggle" 
                        type="button" 
                        id="triggerId" 
                        data-toggle="dropdown"
                      >
                        Ordenar por
                      </button>
                      <div className="dropdown-menu dropdown-menu-right">
                        <a 
                          className="dropdown-item" 
                          href="#"
                          onClick={(e) => { e.preventDefault(); setSortBy('name'); }}
                        >
                          Nombre
                        </a>
                        <a 
                          className="dropdown-item" 
                          href="#"
                          onClick={(e) => { e.preventDefault(); setSortBy('price'); }}
                        >
                          Precio
                        </a>
                        <a 
                          className="dropdown-item" 
                          href="#"
                          onClick={(e) => { e.preventDefault(); setSortBy('-createdAt'); }}
                        >
                          Más reciente
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="col-12 text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Cargando...</span>
                    </div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="col-12 text-center py-5">
                    <p>No hay productos en esta categoría</p>
                  </div>
                ) : (
                  products.map(product => (
                    <div key={product._id} className="col-lg-4 col-md-6 col-sm-12 pb-1">
                      <div className="card product-item border-0 mb-4">
                        <div className="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                          {product.discount > 0 && (
                            <span className="position-absolute badge badge-danger" style={{ top: '10px', right: '10px' }}>
                              -{product.discount}%
                            </span>
                          )}
                          <img 
                            className="img-fluid w-100" 
                            src={product.imageUrl || '/placeholder.jpg'}
                            alt={product.name}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        </div>
                        <div className="card-body border-left border-right text-center p-0 pt-4 pb-3">
                          <h6 className="text-truncate mb-3">{product.name}</h6>
                          <div className="d-flex justify-content-center">
                            {product.discount > 0 ? (
                              <>
                                <h6>${formatPrice(product.discountedPrice)}</h6>
                                <h6 className="text-muted ml-2">
                                  <del>${formatPrice(product.price)}</del>
                                </h6>
                              </>
                            ) : (
                              <h6>${formatPrice(product.price)}</h6>
                            )}
                          </div>
                        </div>
                        <div className="card-footer d-flex justify-content-between bg-light border">
                          <button 
                            className="btn btn-sm text-dark p-0"
                            onClick={() => addToCart(product)}
                          >
                            <i className="fas fa-shopping-cart text-primary mr-1"></i>
                            Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="col-12 pb-1">
                    <nav aria-label="Page navigation">
                      <ul className="pagination justify-content-center mb-3">
                        <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                          <a 
                            className="page-link" 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (page > 1) setPage(page - 1);
                            }}
                          >
                            <span>&laquo;</span>
                          </a>
                        </li>
                        {[...Array(totalPages)].map((_, i) => (
                          <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                            <a 
                              className="page-link" 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(i + 1);
                              }}
                            >
                              {i + 1}
                            </a>
                          </li>
                        ))}
                        <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                          <a 
                            className="page-link" 
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              if (page < totalPages) setPage(page + 1);
                            }}
                          >
                            <span>&raquo;</span>
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Productos destacados */}
      {!selectedCategory && featuredProducts.length > 0 && (
        <div className="container-fluid pt-5">
          <div className="text-center mb-4">
            <h2 className="section-title px-5"><span className="px-2">Productos Destacados</span></h2>
          </div>
          <div className="row px-xl-5 pb-3">
            {featuredProducts.map(product => (
              <div key={product._id} className="col-lg-3 col-md-6 col-sm-12 pb-1">
                <div className="card product-item border-0 mb-4">
                  <div className="card-header product-img position-relative overflow-hidden bg-transparent border p-0">
                    {product.discount > 0 && (
                      <span className="position-absolute badge badge-danger" style={{ top: '10px', right: '10px' }}>
                        -{product.discount}%
                      </span>
                    )}
                    <img 
                      className="img-fluid w-100" 
                      src={product.imageUrl || '/placeholder.jpg'}
                      alt={product.name}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="card-body border-left border-right text-center p-0 pt-4 pb-3">
                    <h6 className="text-truncate mb-3">{product.name}</h6>
                    <div className="d-flex justify-content-center">
                      {product.discount > 0 ? (
                        <>
                          <h6>${formatPrice(product.discountedPrice)}</h6>
                          <h6 className="text-muted ml-2">
                            <del>${formatPrice(product.price)}</del>
                          </h6>
                        </>
                      ) : (
                        <h6>${formatPrice(product.price)}</h6>
                      )}
                    </div>
                  </div>
                  <div className="card-footer d-flex justify-content-between bg-light border">
                    <button 
                      className="btn btn-sm text-dark p-0"
                      onClick={() => addToCart(product)}
                    >
                      <i className="fas fa-shopping-cart text-primary mr-1"></i>
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="container-fluid bg-dark text-light mt-5 pt-5">
        <div className="row px-xl-5 pt-5">
          <div className="col-lg-4 col-md-12 mb-5 pr-3 pr-xl-5">
            <a href="/" className="text-decoration-none">
              <h1 className="mb-4 display-5 font-weight-semi-bold">
                <span className="text-primary font-weight-bold border border-white px-3 mr-1">
                  <i className="fas fa-print"></i>
                </span>
                <span className="text-white">Gráfica Los Rumbos</span>
              </h1>
            </a>
            <p>Tu centro de confianza para servicios de impresión y fotocopiado.</p>
            <p className="mb-2"><i className="fa fa-map-marker-alt text-primary mr-3"></i>Buenos Aires, Argentina</p>
            <p className="mb-2"><i className="fa fa-envelope text-primary mr-3"></i>info@graficalosrumbos.com</p>
            <p className="mb-0"><i className="fa fa-phone-alt text-primary mr-3"></i>+54 11 4567-8901</p>
          </div>
          <div className="col-lg-8 col-md-12">
            <div className="row">
              <div className="col-md-4 mb-5">
                <h5 className="font-weight-bold text-white mb-4">Enlaces Rápidos</h5>
                <div className="d-flex flex-column justify-content-start">
                  <Link className="text-light mb-2" to="/"><i className="fa fa-angle-right mr-2"></i>Inicio</Link>
                  <Link className="text-light mb-2" to="/precios"><i className="fa fa-angle-right mr-2"></i>Lista de Precios</Link>
                  <Link className="text-light mb-2" to="/pedido-personalizado"><i className="fa fa-angle-right mr-2"></i>Pedido Personalizado</Link>
                </div>
              </div>
              <div className="col-md-4 mb-5">
                <h5 className="font-weight-bold text-white mb-4">Categorías</h5>
                <div className="d-flex flex-column justify-content-start">
                  {categories.slice(0, 5).map(category => (
                    <a 
                      key={category._id}
                      className="text-light mb-2" 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleCategorySelect(category._id);
                        window.scrollTo(0, 0);
                      }}
                    >
                      <i className="fa fa-angle-right mr-2"></i>{category.name}
                    </a>
                  ))}
                </div>
              </div>
              <div className="col-md-4 mb-5">
                <h5 className="font-weight-bold text-white mb-4">Horarios</h5>
                <p className="text-light mb-2">Lunes a Viernes: 9:00 - 19:00</p>
                <p className="text-light">Sábados: 9:00 - 14:00</p>
              </div>
            </div>
          </div>
        </div>
        <div className="row border-top border-secondary mx-xl-5 py-4">
          <div className="col-md-6 px-xl-0">
            <p className="mb-md-0 text-center text-md-left text-light">
              &copy; 2025 <span className="text-primary font-weight-semi-bold">Gráfica Los Rumbos</span>. 
              Todos los derechos reservados.
            </p>
          </div>
          <div className="col-md-6 px-xl-0 text-center text-md-right">
            <a 
              href="https://simpleapps.com.ar" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-decoration-none text-light"
            >
              Powered by <span className="text-primary">Simple Apps</span>
            </a>
          </div>
        </div>
      </div>

      {/* Back to Top */}
      <a href="#" className="btn btn-primary back-to-top" onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}>
        <i className="fa fa-angle-double-up"></i>
      </a>
    </div>
  );
};

export default LandingEShopper;