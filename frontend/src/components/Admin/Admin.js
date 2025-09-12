// frontend/src/components/Admin/Admin.js - ARCHIVO COMPLETO
import React, { useState, useEffect } from 'react';
import Login from './Login';
import OrderList from './OrderList';
import ProductManager from './ProductManager';
import PriceManager from './PriceManager';
import NotificationPanel from './NotificationPanel';
import { orderService } from '../../services/api';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeProducts: 0,
    pendingOrders: 0,
    monthlyRevenue: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'dashboard') {
      fetchStats();
    }
  }, [isAuthenticated, activeTab]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const statsData = await orderService.getOrderStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-100vh bg-light">
      {/* Header Mejorado */}
      <header className="border-bottom bg-white shadow-sm">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center py-3">
            <div className="d-flex align-items-center gap-2">
              <i className="fas fa-cog text-primary" style={{ fontSize: '2rem' }}></i>
              <h1 className="h3 mb-0 fw-bold">Panel de Administración</h1>
            </div>
            <div className="d-flex align-items-center gap-3">
              <a href="/" className="btn btn-outline-primary">
                Ver Sitio Web
              </a>
              <button onClick={handleLogout} className="btn btn-danger">
                <i className="fas fa-sign-out-alt me-2"></i>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-fluid py-4">
        {/* Tabs de navegación mejorados */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
            >
              <i className="fas fa-chart-line me-2"></i>
              Dashboard
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <i className="fas fa-shopping-bag me-2"></i>
              Pedidos
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <i className="fas fa-box me-2"></i>
              Productos
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === 'precios' ? 'active' : ''}`}
              onClick={() => setActiveTab('precios')}
            >
              <i className="fas fa-tag me-2"></i>
              Precios
            </button>
          </li>
        </ul>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="h4 mb-4">Resumen del Negocio</h2>
            
            {/* Stats Cards */}
            <div className="row g-4 mb-5">
              <div className="col-md-6 col-lg-3">
                <div className="card stats-card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="stats-icon bg-primary bg-opacity-10 text-primary">
                        <i className="fas fa-shopping-cart"></i>
                      </div>
                      <div className="ms-3">
                        <p className="text-muted mb-0 small">Pedidos Totales</p>
                        <h3 className="mb-0">
                          {loadingStats ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            stats.totalOrders
                          )}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-3">
                <div className="card stats-card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="stats-icon bg-success bg-opacity-10 text-success">
                        <i className="fas fa-box"></i>
                      </div>
                      <div className="ms-3">
                        <p className="text-muted mb-0 small">Productos Activos</p>
                        <h3 className="mb-0">
                          {loadingStats ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            stats.activeProducts
                          )}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-3">
                <div className="card stats-card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="stats-icon bg-warning bg-opacity-10 text-warning">
                        <i className="fas fa-clock"></i>
                      </div>
                      <div className="ms-3">
                        <p className="text-muted mb-0 small">Pedidos Pendientes</p>
                        <h3 className="mb-0">
                          {loadingStats ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            stats.pendingOrders
                          )}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-3">
                <div className="card stats-card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      <div className="stats-icon bg-info bg-opacity-10 text-info">
                        <i className="fas fa-dollar-sign"></i>
                      </div>
                      <div className="ms-3">
                        <p className="text-muted mb-0 small">Ingresos del Mes</p>
                        <h3 className="mb-0">
                          {loadingStats ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            `$${stats.monthlyRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                          )}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="card">
              <div className="card-header bg-white">
                <h5 className="mb-0">Acciones Rápidas</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <button 
                      className="btn btn-outline-primary w-100 py-3"
                      onClick={() => setActiveTab('orders')}
                    >
                      <i className="fas fa-eye mb-2 d-block" style={{ fontSize: '2rem' }}></i>
                      Ver Pedidos Pendientes
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button 
                      className="btn btn-outline-success w-100 py-3"
                      onClick={() => setActiveTab('products')}
                    >
                      <i className="fas fa-plus mb-2 d-block" style={{ fontSize: '2rem' }}></i>
                      Agregar Nuevo Producto
                    </button>
                  </div>
                  <div className="col-md-4">
                    <button 
                      className="btn btn-outline-warning w-100 py-3"
                      onClick={() => setActiveTab('precios')}
                    >
                      <i className="fas fa-tag mb-2 d-block" style={{ fontSize: '2rem' }}></i>
                      Gestionar Precios
                    </button>
                  </div>
                </div>
                <div className="alert alert-info mt-3">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Tip:</strong> En la lista de pedidos, usa el botón <i className="fas fa-receipt"></i> para generar un recibo imprimible de cada pedido.
                </div>
              </div>
            </div>

            {/* Botón para refrescar estadísticas */}
            <div className="text-center mt-4">
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={fetchStats}
                disabled={loadingStats}
              >
                <i className="fas fa-sync-alt me-2"></i>
                Actualizar Estadísticas
              </button>
            </div>
          </div>
        )}

        {/* Contenido de las pestañas */}
        {activeTab === 'orders' && <OrderList />}
        {activeTab === 'products' && <ProductManager />}
        {activeTab === 'notifications' && <NotificationPanel />}
        {activeTab === 'precios' && <PriceManager />}
      </div>

      {/* Footer con powered by */}
      <footer className="mt-auto border-top bg-white py-3">
        <div className="container-fluid">
          <div className="d-flex justify-content-between align-items-center">
            <p className="text-muted mb-0 small">&copy; 2025 Rumbos Gráfica & Copias - Panel de Administración</p>
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
      </footer>
    </div>
  );
};

export default Admin;