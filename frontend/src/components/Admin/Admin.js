// frontend/src/components/Admin/Admin.js - REEMPLAZAR TODO

import React, { useState, useEffect } from 'react';
import Login from './Login';
import OrderList from './OrderList';
import ProductManager from './ProductManager';
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
              className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <i className="fas fa-bell me-2"></i>
              Notificaciones
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
                      className="btn btn-outline-info w-100 py-3"
                      onClick={() => setActiveTab('notifications')}
                    >
                      <i className="fas fa-paper-plane mb-2 d-block" style={{ fontSize: '2rem' }}></i>
                      Enviar Notificaciones
                    </button>
                  </div>
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
      </div>
    </div>
  );
};

export default Admin;