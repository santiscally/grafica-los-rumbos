import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/api';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    year: '',
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.year) params.year = filters.year;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      
      const data = await orderService.getOrders(params);
      setOrders(data.orders);
      setError(null);
    } catch (err) {
      setError('Error al cargar pedidos');
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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de que quieres anular este pedido?')) {
      return;
    }
    
    try {
      await orderService.cancelOrder(orderId);
      fetchOrders();
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="order-list">
      <h2>Gestión de Pedidos</h2>
      
      <div className="filters-section">
        <div className="filter-group">
          <label>Estado:</label>
          <select name="status" value={filters.status} onChange={handleFilterChange}>
            <option value="">Todos</option>
            <option value="creado">Creado</option>
            <option value="en proceso">En Proceso</option>
            <option value="listo">Listo</option>
            <option value="anulado">Anulado</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Año escolar:</label>
          <select name="year" value={filters.year} onChange={handleFilterChange}>
            <option value="">Todos</option>
            <option value="1er año">1er año</option>
            <option value="2do año">2do año</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label>Fecha desde:</label>
          <input 
            type="date" 
            name="startDate"
            value={filters.startDate}
            onChange={handleFilterChange}
          />
        </div>
        
        <div className="filter-group">
          <label>Fecha hasta:</label>
          <input 
            type="date"
            name="endDate"
            value={filters.endDate}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      {loading && <div className="loading">Cargando pedidos...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Productos</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>
                  <div>{order.customerEmail}</div>
                  <div>{order.customerPhone}</div>
                </td>
                <td>
                  {order.products.map((item, index) => (
                    <div key={index}>
                      {item.productId.name} x{item.quantity}
                    </div>
                  ))}
                </td>
                <td>${order.totalPrice}</td>
                <td>
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    disabled={order.status === 'anulado'}
                  >
                    <option value="creado">Creado</option>
                    <option value="en proceso">En Proceso</option>
                    <option value="listo">Listo</option>
                    <option value="anulado">Anulado</option>
                  </select>
                </td>
                <td>{formatDate(order.createdAt)}</td>
                <td>
                  {order.status !== 'anulado' && (
                    <button 
                      onClick={() => handleCancelOrder(order._id)}
                      className="cancel-btn"
                    >
                      Anular
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderList;