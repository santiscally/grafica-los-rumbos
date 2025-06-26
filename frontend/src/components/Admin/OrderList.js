// frontend/src/components/Admin/OrderList.js - ARCHIVO COMPLETO CORREGIDO
import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/api';
import api from '../../services/api';
import html2pdf from 'html2pdf.js';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    year: '',
    startDate: '',
    endDate: '',
    customOrder: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPrice, setEditingPrice] = useState(null);
  const [newPrice, setNewPrice] = useState('');

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
      if (filters.customOrder) params.customOrder = filters.customOrder;
      
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

  const handlePriceUpdate = async (orderId) => {
    try {
      await orderService.updateOrderPrice(orderId, parseFloat(newPrice));
      setEditingPrice(null);
      setNewPrice('');
      fetchOrders();
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  // Nueva función para descargar archivos con autenticación
  const handleDownloadFile = async (orderId, filename, originalName) => {
    try {
      const response = await api.get(`/orders/${orderId}/files/${filename}/download`, {
        responseType: 'blob'
      });
      
      // Crear un link temporal para descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalName || filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando archivo:', error);
      alert('Error al descargar el archivo');
    }
  };
  
  const handleViewFiles = async (order) => {
    if (order.files && order.files.length > 0) {
      const modalDiv = document.createElement('div');
      modalDiv.innerHTML = `
        <div class="modal d-block" style="background-color: rgba(0,0,0,0.5);">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Archivos del Pedido</h5>
                <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
              </div>
              <div class="modal-body">
                <div id="files-list-container">
                  ${order.files.map((file, index) => `
                    <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                      <span>${index + 1}. ${file.filename}</span>
                      <button 
                        class="btn btn-sm btn-primary download-file-btn"
                        data-order-id="${order._id}"
                        data-filename="${file.storedFilename}"
                        data-original-name="${file.filename}"
                      >
                        <i class="fas fa-download"></i> Descargar
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modalDiv);
      
      // Agregar event listeners a los botones de descarga
      const downloadButtons = modalDiv.querySelectorAll('.download-file-btn');
      downloadButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const orderId = e.currentTarget.getAttribute('data-order-id');
          const filename = e.currentTarget.getAttribute('data-filename');
          const originalName = e.currentTarget.getAttribute('data-original-name');
          handleDownloadFile(orderId, filename, originalName);
        });
      });
    }
  };
  const handleSendNotification = async (order, type) => {
    try {
      const result = await orderService.sendNotification(order._id, type);
      
      if (type === 'whatsapp' && result.whatsappUrl) {
        // Abrir WhatsApp en una nueva pestaña con la URL correcta
        console.log('Abriendo WhatsApp con URL:', result.whatsappUrl);
        window.open(result.whatsappUrl, '_blank');
      } else if (type === 'email') {
        // Mostrar mensaje de éxito para email
        alert('Notificación enviada por email correctamente');
      }
    } catch (error) {
      console.error('Error enviando notificación:', error);
      alert('Error al enviar notificación: ' + (error.message || 'Error desconocido'));
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
  const handleDownloadPDF = async (order) => {
    try {
      // Obtener el HTML del backend
      const htmlContent = await orderService.downloadOrderInfo(order._id);
      
      // Crear una nueva ventana
      const printWindow = window.open('', '_blank', 'width=350,height=600');
      
      // Escribir el HTML en la nueva ventana
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Esperar a que cargue y luego imprimir
      printWindow.onload = function() {
        // Dar un pequeño delay para asegurar que los estilos se apliquen
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF');
    }
  };
  return (
    <div>
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
              <label htmlFor="customOrder" className="form-label">Tipo de Pedido:</label>
              <select
                id="customOrder"
                name="customOrder"
                value={filters.customOrder}
                onChange={handleFilterChange}
                className="form-select"
              >
                <option value="">Todos</option>
                <option value="false">Catálogo</option>
                <option value="true">Personalizado</option>
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
          </div>
        </div>
      </div>

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
                <th>Tipo</th>
                <th>Productos/Servicio</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No hay pedidos que coincidan con los filtros
                  </td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order._id}>
                    <td>
                      <small className="text-muted font-monospace">#{order.orderCode}</small>
                      <br/>
                      <small className="text-muted">{order._id.substring(0, 8)}...</small>
                    </td>
                    <td>
                      <div>
                        {order.customerName && <div className="fw-semibold">{order.customerName}</div>}
                        <div>{order.customerEmail}</div>
                        <small className="text-muted">{order.customerPhone}</small>
                      </div>
                    </td>
                    <td>
                      {order.customOrder ? (
                        <span className="badge bg-primary">Personalizado</span>
                      ) : (
                        <span className="badge bg-secondary">Catálogo</span>
                      )}
                    </td>
                    <td>
                      {order.customOrder ? (
                        <div>
                          <div className="fw-semibold">{order.serviceType || 'Servicio personalizado'}</div>
                          {order.specifications && (
                            <small className="text-muted">
                              Cantidad: {order.specifications.cantidad || 'N/A'}
                              {order.specifications.cantidadPaginas && `, ${order.specifications.cantidadPaginas} págs`}
                            </small>
                          )}
                        </div>
                      ) : (
                        order.products.map((item, index) => (
                          <div key={index} className="small">
                            {item.productId?.code && (
                              <span className="badge bg-light text-dark me-1">{item.productId.code}</span>
                            )}
                            {item.productId?.name || item.name || 'Producto'} 
                            <span className="badge bg-secondary ms-1">x{item.quantity}</span>
                          </div>
                        ))
                      )}
                    </td>
                    <td>
                      {order.customOrder && order.totalPrice === 0 ? (
                        editingPrice === order._id ? (
                          <div className="d-flex gap-1">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              style={{width: '80px'}}
                            />
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handlePriceUpdate(order._id)}
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => {
                                setEditingPrice(null);
                                setNewPrice('');
                              }}
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ) : (
                          <div>
                            <span className="text-danger">Sin precio</span>
                            <button
                              className="btn btn-sm btn-link p-0 ms-2"
                              onClick={() => {
                                setEditingPrice(order._id);
                                setNewPrice('');
                              }}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </div>
                        )
                      ) : (
                        <span className="fw-bold">${order.totalPrice.toLocaleString('es-AR')}</span>
                      )}
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
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
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-success"
                          title="Imprimir pedido"
                          onClick={() => handleDownloadPDF(order)}
                        >
                          <i className="fas fa-print"></i>
                        </button>doc
                        {order.customOrder && order.files && order.files.length > 0 && (
                          <button
                            className="btn btn-sm btn-outline-info"
                            title="Ver archivos"
                            onClick={() => handleViewFiles(order)}
                          >
                            <i className="fas fa-file"></i>
                            <span className="ms-1">{order.files.length}</span>
                          </button>
                        )}
                        {order.status === 'listo' && (
                          <>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              title="Enviar email de pedido listo"
                              onClick={() => handleSendNotification(order, 'email')}
                            >
                              <i className="fas fa-envelope"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-success"
                              title="Enviar WhatsApp de pedido listo"
                              onClick={() => handleSendNotification(order, 'whatsapp')}
                            >
                              <i className="fab fa-whatsapp"></i>
                            </button>
                          </>
                        )}
                        {order.status !== 'anulado' && (
                          <button
                            onClick={() => handleCancelOrder(order._id)}
                            className="btn btn-sm btn-outline-danger"
                          >
                            <i className="fas fa-times-circle"></i>
                          </button>
                        )}
                      </div>
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