import React, { useState, useEffect } from 'react';
import Login from './Login';
import OrderList from './OrderList';
import ProductManager from './ProductManager';
import NotificationPanel from './NotificationPanel';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

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
    <div className="container-fluid">
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand" href="#!">
            <i className="fas fa-print me-2"></i>
            Gráfica Los Rumbos
          </a>
          
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarAdmin">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarAdmin">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}>
                  <i className="fas fa-shopping-bag me-1"></i> Pedidos
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                  onClick={() => setActiveTab('products')}>
                  <i className="fas fa-box me-1"></i> Productos
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notifications')}>
                  <i className="fas fa-bell me-1"></i> Notificaciones
                </button>
              </li>
            </ul>
            <button onClick={handleLogout} className="btn btn-outline-light">
              <i className="fas fa-sign-out-alt me-1"></i> Cerrar Sesión
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid mt-4">
        <h2 className="mb-4">
          {activeTab === 'orders' && 'Gestión de Pedidos'}
          {activeTab === 'products' && 'Gestión de Productos'}
          {activeTab === 'notifications' && 'Notificaciones'}
        </h2>
        
        <div className="card">
          <div className="card-body">
            {activeTab === 'orders' && <OrderList />}
            {activeTab === 'products' && <ProductManager />}
            {activeTab === 'notifications' && <NotificationPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;