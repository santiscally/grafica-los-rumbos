// frontend/src/services/api.js - REEMPLAZAR TODO
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL
});

// Interceptor para agregar token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  }
};

// Servicios de productos
export const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/files/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  createProduct: async (productData, imageFile) => {
    try {
      // Primero crear el producto
      const response = await api.post('/products', productData);
      const product = response.data;
      
      // Si hay imagen, subirla con el ID del producto
      if (imageFile && product._id) {
        const formData = new FormData();
        formData.append('file', imageFile);
        formData.append('productId', product._id);
        
        await api.post('/files/product', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Actualizar el producto para indicar que tiene imagen
        await api.put(`/products/${product._id}`, { hasImage: true });
      }
      
      return product;
    } catch (error) {
      // Si algo falla y se creó el producto, intentar eliminarlo
      if (error.response && productData._id) {
        try {
          await api.delete(`/products/${productData._id}`);
        } catch (deleteError) {
          console.error('Error al limpiar producto fallido:', deleteError);
        }
      }
      throw error;
    }
  },
  
  updateProduct: async (id, productData, imageFile = null) => {
    let updatedProduct = { ...productData };
    
    // Si hay una nueva imagen, subirla
    if (imageFile) {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('productId', id);
      
      await api.post('/files/product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      updatedProduct.hasImage = true;
    }
    
    const response = await api.put(`/products/${id}`, updatedProduct);
    return response.data;
  },
  
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};

// Servicios de órdenes
export const orderService = {
  createOrder: async (order) => {
    const response = await api.post('/orders', order);
    return response.data;
  },
  
  createCustomOrder: async (formData) => {
    const response = await api.post('/orders/custom', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  getOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },
  
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  },
  
  updateOrderPrice: async (id, totalPrice) => {
    const response = await api.put(`/orders/${id}/price`, { totalPrice });
    return response.data;
  },
  
  cancelOrder: async (id) => {
    const response = await api.delete(`/orders/${id}`);
    return response.data;
  },
  
  sendNotification: async (id, type) => {
    const response = await api.post(`/orders/${id}/notify`, { type });
    return response.data;
  },
  
  getOrderStats: async () => {
    const response = await api.get('/orders/stats');
    return response.data;
  },
  
  downloadOrderInfo: async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/download`, {
        responseType: 'blob'
      });
      
      // Crear un link temporal para descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pedido-${orderId}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando información del pedido:', error);
    }
  },
  
  downloadOrderFile: async (orderId, filename, originalName) => {
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
      throw error;
    }
  }
};

export const priceService = {
  getPrices: async () => {
    const response = await api.get('/prices');
    return response.data;
  },
  createPrice: async (priceData) => {
    const response = await api.post('/prices', priceData);
    return response.data;
  },
  updatePrice: async (id, priceData) => {
    const response = await api.put(`/prices/${id}`, priceData);
    return response.data;
  },
  deletePrice: async (id) => {
    const response = await api.delete(`/prices/${id}`);
    return response.data;
  }
};

export default api;