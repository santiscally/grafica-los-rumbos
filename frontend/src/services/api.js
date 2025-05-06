import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  }
};

// Servicios de productos
export const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/files', formData, {
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
      
      const response = await api.post('/api/products', productWithImage);
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
    
    const response = await api.put(`/api/products/${id}`, updatedProduct);
    return response.data;
  },
  deleteProduct: async (id) => {
    const response = await api.delete(`/api/products/${id}`);
    return response.data;
  }
};

// Servicios de órdenes
export const orderService = {
  createOrder: async (order) => {
    const response = await api.post('/api/orders', order);
    return response.data;
  },
  getOrders: async (params = {}) => {
    const response = await api.get('/api/orders', { params });
    return response.data;
  },
  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/api/orders/${id}/status`, { status });
    return response.data;
  },
  cancelOrder: async (id) => {
    const response = await api.delete(`/api/orders/${id}`);
    return response.data;
  },
  sendNotification: async (id, type) => {
    const response = await api.post(`/api/orders/${id}/notify`, { type });
    return response.data;
  }
};

export const fileService = {
  getFileBase64: async (fileId) => {
    const response = await api.get(`/api/files/base64/${fileId}`);
    return response.data;
  }
};

export default api;
