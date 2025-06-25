// backend/src/services/filesystem.service.js
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');

// Directorios base para almacenamiento
const PEDIDOS_DIR = '/app/pedidos';
const PRODUCTOS_DIR = '/app/productos';

// Asegurar que los directorios existen
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Inicializar directorios
const initializeDirectories = async () => {
  await ensureDirectoryExists(PEDIDOS_DIR);
  await ensureDirectoryExists(PRODUCTOS_DIR);
  console.log('Directorios de almacenamiento inicializados');
};

// Configuración de multer para pedidos
const pedidoStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    // El ID del pedido se pasará después de crear el pedido
    const tempDir = path.join(PEDIDOS_DIR, 'temp');
    await ensureDirectoryExists(tempDir);
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Configuración de multer para productos
const productoStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const tempDir = path.join(PRODUCTOS_DIR, 'temp');
    await ensureDirectoryExists(tempDir);
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Middleware de upload
const uploadPedido = multer({ 
  storage: pedidoStorage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

const uploadProducto = multer({ 
  storage: productoStorage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Mover archivos temporales a su ubicación final
const moveFilesToPedido = async (tempFiles, pedidoId) => {
  const pedidoDir = path.join(PEDIDOS_DIR, pedidoId);
  await ensureDirectoryExists(pedidoDir);
  
  const movedFiles = [];
  
  for (const file of tempFiles) {
    const tempPath = file.path;
    const finalPath = path.join(pedidoDir, file.filename);
    
    await fs.rename(tempPath, finalPath);
    
    movedFiles.push({
      filename: file.originalname,
      storedFilename: file.filename,
      path: finalPath,
      size: file.size
    });
  }
  
  return movedFiles;
};

// Mover imagen de producto a su ubicación final
const moveImageToProducto = async (tempFile, productoId) => {
  const productoDir = path.join(PRODUCTOS_DIR, productoId);
  await ensureDirectoryExists(productoDir);
  
  const tempPath = tempFile.path;
  const extension = path.extname(tempFile.originalname);
  const filename = `imagen${extension}`;
  const finalPath = path.join(productoDir, filename);
  
  await fs.rename(tempPath, finalPath);
  
  return {
    filename: filename,
    path: finalPath
  };
};

// Obtener archivo de pedido
const getPedidoFile = async (pedidoId, filename) => {
  const filePath = path.join(PEDIDOS_DIR, pedidoId, filename);
  
  try {
    await fs.access(filePath);
    return filePath;
  } catch {
    throw new Error('Archivo no encontrado');
  }
};

// Obtener imagen de producto
const getProductoImage = async (productoId) => {
  const productoDir = path.join(PRODUCTOS_DIR, productoId);
  
  try {
    const files = await fs.readdir(productoDir);
    const imageFile = files.find(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
    
    if (!imageFile) {
      throw new Error('Imagen no encontrada');
    }
    
    return path.join(productoDir, imageFile);
  } catch {
    throw new Error('Imagen no encontrada');
  }
};

// Eliminar archivos de un pedido
const deletePedidoFiles = async (pedidoId) => {
  const pedidoDir = path.join(PEDIDOS_DIR, pedidoId);
  
  try {
    await fs.rm(pedidoDir, { recursive: true, force: true });
  } catch (error) {
    console.error(`Error eliminando archivos del pedido ${pedidoId}:`, error);
  }
};

// Eliminar imagen de producto
const deleteProductoImage = async (productoId) => {
  const productoDir = path.join(PRODUCTOS_DIR, productoId);
  
  try {
    await fs.rm(productoDir, { recursive: true, force: true });
  } catch (error) {
    console.error(`Error eliminando imagen del producto ${productoId}:`, error);
  }
};

// Limpiar archivos temporales
const cleanTempFiles = async () => {
  try {
    const tempDirs = [
      path.join(PEDIDOS_DIR, 'temp'),
      path.join(PRODUCTOS_DIR, 'temp')
    ];
    
    for (const dir of tempDirs) {
      try {
        const files = await fs.readdir(dir);
        const now = Date.now();
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          
          // Eliminar archivos temporales de más de 1 hora
          if (now - stats.mtimeMs > 3600000) {
            await fs.unlink(filePath);
          }
        }
      } catch {
        // El directorio temp podría no existir aún
      }
    }
  } catch (error) {
    console.error('Error limpiando archivos temporales:', error);
  }
};

// Limpiar archivos temporales cada hora
setInterval(cleanTempFiles, 3600000);

module.exports = {
  initializeDirectories,
  uploadPedido,
  uploadProducto,
  moveFilesToPedido,
  moveImageToProducto,
  getPedidoFile,
  getProductoImage,
  deletePedidoFiles,
  deleteProductoImage
};