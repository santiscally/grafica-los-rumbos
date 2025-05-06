// services/gridfs.service.js - Corregido
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const { GridFsStorage } = require('multer-gridfs-storage');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

// Variables para almacenar las instancias de GridFS
let gfs;
let gridFSBucket;

// Configuración del storage para GridFS
const storage = new GridFsStorage({
  url: process.env.MONGODB_URI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        
        const filename = buf.toString('hex') + path.extname(file.originalname);
        
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
          metadata: {
            originalname: file.originalname,
            mimetype: file.mimetype
          }
        };
        
        resolve(fileInfo);
      });
    });
  }
});

// Middleware multer para subir archivos
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Límite: 5MB
});

// Función para inicializar GridFS
const initGridFS = () => {
  try {
    // Importante: Grid requiere que le proporcionemos el objeto mongoose.mongo
    // primero y luego una conexión activa
    Grid.mongo = mongoose.mongo;
    gfs = Grid(mongoose.connection.db);
    gfs.collection('uploads');
    
    // Configurar GridFSBucket para operaciones avanzadas
    gridFSBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'uploads'
    });
    
    console.log('GridFS inicializado correctamente');
    return { gfs, gridFSBucket };
  } catch (error) {
    console.error('Error al inicializar GridFS:', error);
    throw error;
  }
};

module.exports = {
  initGridFS,
  upload,
  getGfs: () => gfs,
  getGridFSBucket: () => gridFSBucket
};