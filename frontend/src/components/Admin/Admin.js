// frontend/src/components/Admin/Admin.js
import React, { useState, useEffect } from 'react';
import Login from './Login';
import OrderList from './OrderList';
import ProductManager from './ProductManager';
import PriceManager from './PriceManager';
import CategoryManager from './CategoryManager';
import NotificationPanel from './NotificationPanel';
import Footer from '../Common/Footer';
import { orderService } from '../../services/api';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalOrders: 0, activeProducts: 0, pendingOrders: 0, monthlyRevenue: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'dashboard') fetchStats();
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

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => { localStorage.removeItem('token'); setIsAuthenticated(false); };

  if (!isAuthenticated) return <Login onLogin={handleLogin} />;

  const tabs = [
    { id: 'dashboard', icon: 'fa-chart-line', label: 'Dashboard' },
    { id: 'orders', icon: 'fa-shopping-bag', label: 'Pedidos' },
    { id: 'categories', icon: 'fa-folder', label: 'Categorías' },
    { id: 'products', icon: 'fa-box', label: 'Productos' },
    { id: 'precios', icon: 'fa-tag', label: 'Precios' }
  ];

  const statCards = [
    { icon: 'fa-shopping-cart', label: 'Pedidos Totales', value: stats.totalOrders, color: 'primary' },
    { icon: 'fa-box', label: 'Productos Activos', value: stats.activeProducts, color: 'success' },
    { icon: 'fa-clock', label: 'Pedidos Pendientes', value: stats.pendingOrders, color: 'warning' },
    { icon: 'fa-dollar-sign', label: 'Ingresos del Mes', value: `$${stats.monthlyRevenue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`, color: 'info' }
  ];

  const quickActions = [
    { icon: 'fa-eye', label: 'Ver Pedidos', tab: 'orders', color: 'primary' },
    { icon: 'fa-folder', label: 'Gestionar Categorías', tab: 'categories', color: 'info' },
    { icon: 'fa-plus', label: 'Agregar Producto', tab: 'products', color: 'success' },
    { icon: 'fa-tag', label: 'Gestionar Precios', tab: 'precios', color: 'warning' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header fijo */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, background: 'white', borderBottom: '1px solid #dee2e6', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div className="container-fluid">
          <div style={{ padding: '1rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '44px', height: '44px', background: '#0d6efd', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.25rem' }}>
                <i className="fas fa-cog"></i>
              </div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#343a40' }}>Panel de Administración</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '2px solid #0d6efd', borderRadius: '8px', color: '#0d6efd', textDecoration: 'none', fontWeight: 500 }}>
                <i className="fas fa-external-link-alt"></i>Ver Sitio
              </a>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#dc3545', border: 'none', borderRadius: '8px', color: 'white', fontWeight: 500, cursor: 'pointer' }}>
                <i className="fas fa-sign-out-alt"></i>Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main style={{ paddingTop: '90px', paddingBottom: '60px', minHeight: '100vh' }}>
        <div className="container-fluid py-4">
          {/* Tabs de navegación */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', background: 'white', padding: '0.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.75rem 1.25rem', border: 'none', borderRadius: '8px',
                  background: activeTab === tab.id ? '#0d6efd' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#6c757d',
                  fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <i className={`fas ${tab.icon}`}></i>{tab.label}
              </button>
            ))}
          </div>

          {/* Dashboard Content */}
          {activeTab === 'dashboard' && (
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', color: '#343a40' }}>
                <i className="fas fa-chart-line" style={{ marginRight: '10px', color: '#0d6efd' }}></i>Resumen del Negocio
              </h2>
              
              {/* Stats Cards */}
              <div className="row g-4 mb-4">
                {statCards.map((stat, i) => (
                  <div key={i} className="col-md-6 col-lg-3">
                    <div style={{ background: 'white', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem',
                          background: stat.color === 'primary' ? '#e3f2fd' : stat.color === 'success' ? '#e8f5e9' : stat.color === 'warning' ? '#fff3e0' : '#e0f7fa',
                          color: stat.color === 'primary' ? '#0d6efd' : stat.color === 'success' ? '#2e7d32' : stat.color === 'warning' ? '#e65100' : '#0097a7'
                        }}>
                          <i className={`fas ${stat.icon}`}></i>
                        </div>
                        <div style={{ marginLeft: '1rem' }}>
                          <p style={{ margin: 0, fontSize: '0.8125rem', color: '#6c757d' }}>{stat.label}</p>
                          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#343a40' }}>
                            {loadingStats ? <span className="spinner-border spinner-border-sm"></span> : stat.value}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Acciones rápidas */}
              <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <div style={{ padding: '1.25rem 1.5rem', borderBottom: '2px solid #e5e7eb', background: '#f8f9fa' }}>
                  <h5 style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <i className="fas fa-bolt" style={{ marginRight: '10px', color: '#0d6efd' }}></i>Acciones Rápidas
                  </h5>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div className="row g-3">
                    {quickActions.map((action, i) => (
                      <div key={i} className="col-md-3">
                        <button
                          onClick={() => setActiveTab(action.tab)}
                          style={{
                            width: '100%', padding: '1.5rem', border: `2px solid ${action.color === 'primary' ? '#0d6efd' : action.color === 'success' ? '#28a745' : action.color === 'warning' ? '#ffc107' : '#17a2b8'}`,
                            borderRadius: '12px', background: 'white', cursor: 'pointer', transition: 'all 0.2s'
                          }}
                        >
                          <i className={`fas ${action.icon}`} style={{ fontSize: '2rem', display: 'block', marginBottom: '0.75rem', color: action.color === 'primary' ? '#0d6efd' : action.color === 'success' ? '#28a745' : action.color === 'warning' ? '#ffc107' : '#17a2b8' }}></i>
                          <span style={{ fontWeight: 500, color: '#343a40' }}>{action.label}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#e3f2fd', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <i className="fas fa-info-circle" style={{ color: '#0d6efd' }}></i>
                    <span style={{ color: '#1565c0' }}><strong>Tip:</strong> Crea primero las categorías antes de agregar productos. Los productos deben estar asociados a una categoría.</span>
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button onClick={fetchStats} disabled={loadingStats} style={{ padding: '0.5rem 1rem', border: '2px solid #e5e7eb', borderRadius: '8px', background: 'white', color: '#6c757d', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fas fa-sync-alt"></i>Actualizar Estadísticas
                </button>
              </div>
            </div>
          )}

          {/* Contenido de las pestañas */}
          {activeTab === 'orders' && <OrderList />}
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'products' && <ProductManager />}
          {activeTab === 'notifications' && <NotificationPanel />}
          {activeTab === 'precios' && <PriceManager />}
        </div>
      </main>

      <Footer isAdmin={true} />
    </div>
  );
};

export default Admin;