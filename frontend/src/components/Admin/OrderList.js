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

  // Función para obtener la clase de estado
  const getStatusClass = (status) => {
    switch (status) {
      case 'creado':
        return 'bg-info text-dark';
      case 'en proceso':
        return 'bg-warning text-dark';
      case 'listo':
        return 'bg-success text-white';
      case 'anulado':
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  return (
    <div>
      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">Filtros</h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label htmlFor="status" className="form-label">Estado:</label>
              <select
                id="status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">Todos</option>
                <option value="creado">Creado</option>
                <option value="en proceso">En Proceso</option>
                <option value="listo">Listo</option>
                <option value="anulado">Anulado</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <label htmlFor="year" className="form-label">Año escolar:</label>
              <select
                id="year"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">Todos</option>
                <option value="1er año">1er año</option>
                <option value="2do año">2do año</option>
              </select>
            </div>
            
            <div className="col-md-3">
              <label htmlFor="startDate" className="form-label">Fecha desde:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
            
            <div className="col-md-3">
              <label htmlFor="endDate" className="form-label">Fecha hasta:</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="form-control"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de pedidos */}
      {loading ? (
        <div className="d-flex justify-content-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover">
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
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No hay pedidos que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id}>
                    <td><small className="text-muted font-monospace">{order._id.substring(0, 8)}...</small></td>
                    <td>
                      <div>{order.customerEmail}</div>
                      <small className="text-muted">{order.customerPhone}</small>
                    </td>
                    <td>
                      {order.products.map((item, index) => (
                        <div key={index} className="small">
                          {item.productId.name} 
                          <span className="badge bg-secondary ms-1">x{item.quantity}</span>
                        </div>
                      ))}
                    </td>
                    <td className="fw-bold">${order.totalPrice.toLocaleString('es-AR')}</td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={order.status === 'anulado'}
                        className={`form-select form-select-sm ${getStatusClass(order.status)}`}
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
                          className="btn btn-sm btn-outline-danger"
                        >
                          <i className="fas fa-times-circle me-1"></i> Anular
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderList;