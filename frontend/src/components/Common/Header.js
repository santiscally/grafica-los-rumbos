// frontend/src/components/Common/Header.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CartWidget from './CartWidget';

const Header = ({ onSearch }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setShowMobileMenu(false);
    setShowMobileSearch(false);
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchQuery);
    }
    setShowMobileSearch(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className="site-header">
        <div className="container">
          {/* Desktop Header */}
          <div className="header-desktop">
            <Link to="/" className="header-logo">
              <i className="fas fa-print"></i>
              <span>Rumbos Gráfica & Copias</span>
            </Link>
            
            {/* Barra de búsqueda desktop */}
            <form className="header-search-desktop" onSubmit={handleSearchSubmit}>
              <div className="search-input-wrapper">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    className="search-clear"
                    onClick={() => {
                      setSearchQuery('');
                      if (onSearch) onSearch('');
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <button type="submit" className="search-btn">Buscar</button>
            </form>

            <nav className="header-nav-desktop">
              <Link 
                to="/precios" 
                className={`nav-link ${isActive('/precios') ? 'active' : ''}`}
              >
                <i className="fas fa-list-alt"></i>
                Lista de Precios
              </Link>
              <Link 
                to="/pedido-personalizado" 
                className={`nav-link btn-upload ${isActive('/pedido-personalizado') ? 'active' : ''}`}
              >
                <i className="fas fa-upload"></i>
                Pedido Personalizado
              </Link>
              <CartWidget />
            </nav>
          </div>

          {/* Mobile Header */}
          <div className="header-mobile">
            <div className="header-mobile-row">
              {/* Hamburger Menu */}
              <button 
                className="header-mobile-btn"
                onClick={() => {
                  setShowMobileMenu(!showMobileMenu);
                  setShowMobileSearch(false);
                }}
                aria-label="Menú"
              >
                <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
              </button>

              {/* Logo */}
              <Link to="/" className="header-logo-mobile">
                <i className="fas fa-print"></i>
                <span>Rumbos</span>
              </Link>

              {/* Mobile Actions */}
              <div className="header-mobile-actions">
                <button 
                  className="header-mobile-btn"
                  onClick={() => {
                    setShowMobileSearch(!showMobileSearch);
                    setShowMobileMenu(false);
                  }}
                  aria-label="Buscar"
                >
                  <i className="fas fa-search"></i>
                </button>
                <CartWidget />
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {showMobileMenu && (
              <div className="header-mobile-dropdown">
                <Link 
                  to="/precios" 
                  className="mobile-menu-link"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <i className="fas fa-list-alt"></i>
                  Lista de Precios
                </Link>
                <Link 
                  to="/pedido-personalizado" 
                  className="mobile-menu-link highlight"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <i className="fas fa-upload"></i>
                  Pedido Personalizado
                </Link>
              </div>
            )}

            {/* Mobile Search Dropdown */}
            {showMobileSearch && (
              <div className="header-mobile-dropdown">
                <form onSubmit={handleSearchSubmit} className="mobile-search-form">
                  <div className="search-input-wrapper">
                    <i className="fas fa-search"></i>
                    <input
                      type="text"
                      placeholder="Buscar por nombre o código..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <button type="submit" className="search-btn-mobile">
                    <i className="fas fa-search"></i>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </header>

      <style jsx>{`
        .site-header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: white;
          border-bottom: 1px solid #e5e7eb;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .site-header .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Desktop Header */
        .header-desktop {
          display: none;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          padding: 1rem 0;
        }

        @media (min-width: 992px) {
          .header-desktop {
            display: flex;
          }
          .header-mobile {
            display: none;
          }
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
          flex-shrink: 0;
        }

        .header-logo i {
          font-size: 1.75rem;
          color: #0d6efd;
        }

        .header-logo span {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
        }

        /* Barra de búsqueda desktop */
        .header-search-desktop {
          flex: 1;
          max-width: 500px;
          display: flex;
          gap: 0.5rem;
        }

        .search-input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input-wrapper i {
          position: absolute;
          left: 1rem;
          color: #9ca3af;
          pointer-events: none;
        }

        .search-input-wrapper input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.9375rem;
          transition: all 0.2s;
        }

        .search-input-wrapper input:focus {
          outline: none;
          border-color: #0d6efd;
          box-shadow: 0 0 0 3px rgba(13,110,253,0.1);
        }

        .search-clear {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-clear:hover {
          color: #6b7280;
        }

        .search-btn {
          padding: 0.75rem 1.5rem;
          background: #0d6efd;
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .search-btn:hover {
          background: #0b5ed7;
          transform: translateY(-1px);
        }

        /* Nav Desktop */
        .header-nav-desktop {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-nav-desktop .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          color: #4b5563;
          text-decoration: none;
          font-weight: 500;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .header-nav-desktop .nav-link:hover {
          color: #0d6efd;
          background: #f3f4f6;
        }

        .header-nav-desktop .nav-link.active {
          color: #0d6efd;
          background: #eff6ff;
        }

        .header-nav-desktop .btn-upload {
          background: #0d6efd;
          color: white;
        }

        .header-nav-desktop .btn-upload:hover {
          background: #0b5ed7;
          color: white;
        }

        /* Mobile Header */
        .header-mobile {
          display: block;
        }

        @media (min-width: 992px) {
          .header-mobile {
            display: none;
          }
        }

        .header-mobile-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0;
        }

        .header-mobile-btn {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: #374151;
          font-size: 1.25rem;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .header-mobile-btn:hover {
          background: #f3f4f6;
        }

        .header-logo-mobile {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .header-logo-mobile i {
          font-size: 1.5rem;
          color: #0d6efd;
        }

        .header-logo-mobile span {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
        }

        .header-mobile-actions {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        /* Mobile Dropdown */
        .header-mobile-dropdown {
          border-top: 1px solid #e5e7eb;
          padding: 1rem 0;
          animation: slideDown 0.2s ease;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .mobile-menu-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          color: #374151;
          text-decoration: none;
          font-weight: 500;
          border-radius: 10px;
          transition: all 0.2s;
        }

        .mobile-menu-link:hover {
          background: #f3f4f6;
          color: #0d6efd;
        }

        .mobile-menu-link.highlight {
          background: #0d6efd;
          color: white;
          margin-top: 0.5rem;
        }

        .mobile-menu-link.highlight:hover {
          background: #0b5ed7;
        }

        /* Mobile Search */
        .mobile-search-form {
          display: flex;
          gap: 0.5rem;
        }

        .mobile-search-form .search-input-wrapper {
          flex: 1;
        }

        .search-btn-mobile {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0d6efd;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .search-btn-mobile:hover {
          background: #0b5ed7;
        }
      `}</style>
    </>
  );
};

export default Header;