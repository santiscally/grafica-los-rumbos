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
    // Asegurar que el token se envíe en descargas
    if (config.responseType === 'blob') {
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
    
    const response = await api.post('/files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  createProduct: async (productData, imageFile) => {
    // Primero subir la imagen
    if (imageFile) {
      const imageData = await productService.uploadImage(imageFile);
      
      // Luego crear el producto con el ID de la imagen
      const productWithImage = {
        ...productData,
        image: imageData.fileId
      };
      
      const response = await api.post('/products', productWithImage);
      return response.data;
    } else {
      return Promise.reject(new Error('Se requiere una imagen para el producto'));
    }
  },
  updateProduct: async (id, productData, imageFile = null) => {
    let updatedProduct = { ...productData };
    
    // Si hay una nueva imagen, subirla
    if (imageFile) {
      const imageData = await productService.uploadImage(imageFile);
      updatedProduct.image = imageData.fileId;
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
  }
};

export const fileService = {
  getFileBase64: async (fileId) => {
    const response = await api.get(`/files/base64/${fileId}`);
    return response.data;
  },
  downloadFile: async (fileId) => {
    const response = await api.get(`/files/download/${fileId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default api;