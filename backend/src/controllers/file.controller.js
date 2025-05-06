// controllers/file.controller.js
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const gridFSService = require('../services/gridfs.service');

const fileController = {
  // Subir archivo
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No se subió ningún archivo' });
      }
      
      // Devolver información del archivo subido
      res.status(201).json({
        fileId: req.file.id,
        filename: req.file.filename,
        originalname: req.file.metadata.originalname,
        contentType: req.file.contentType,
        url: `/api/files/${req.file.id}`
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ message: 'Error al subir archivo', error: error.message });
    }
  },

  // Obtener archivo por ID
  async getFile(req, res) {
    try {
      const fileId = req.params.id;
      
      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        return res.status(400).json({ message: 'ID de archivo inválido' });
      }
      
      const gridFSBucket = gridFSService.getGridFSBucket();
      
      if (!gridFSBucket) {
        return res.status(500).json({ message: 'GridFS no está inicializado' });
      }
      
      // Buscar el archivo usando directamente el driver de MongoDB (más fiable)
      const db = mongoose.connection.db;
      const filesCollection = db.collection('uploads.files');
      const file = await filesCollection.findOne({ _id: new mongoose.Types.ObjectId(fileId) });
      
      if (!file) {
        return res.status(404).json({ message: 'Archivo no encontrado' });
      }
      
      // Configurar headers adecuados
      res.set('Content-Type', file.contentType);
      
      // Usar directamente GridFSBucket para mayor fiabilidad
      const downloadStream = gridFSBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId));
      
      // Manejar errores explícitamente
      downloadStream.on('error', (error) => {
        console.error('Error al leer el archivo:', error);
        if (!res.headersSent) {
          return res.status(500).json({ message: 'Error al leer archivo', error: error.message });
        }
      });
      
      // Enviar el archivo al cliente
      downloadStream.pipe(res);
    } catch (error) {
      console.error('Error al recuperar archivo:', error);
      res.status(500).json({ message: 'Error al obtener archivo', error: error.message });
    }
  },
  async getFileBase64(req, res) {
    try {
      const fileId = req.params.id;
      
      if (!mongoose.Types.ObjectId.isValid(fileId)) {
        return res.status(400).json({ message: 'ID de archivo inválido' });
      }
      
      const db = mongoose.connection.db;
      const filesCollection = db.collection('uploads.files');
      const chunksCollection = db.collection('uploads.chunks');
      
      const file = await filesCollection.findOne({ _id: new mongoose.Types.ObjectId(fileId) });
      
      if (!file) {
        return res.status(404).json({ message: 'Archivo no encontrado' });
      }
      
      // Obtener todos los chunks del archivo
      const chunks = await chunksCollection.find({ files_id: file._id })
        .sort({ n: 1 }).toArray();
      
      // Combinar chunks en un buffer
      const fileData = Buffer.concat(chunks.map(chunk => chunk.data.buffer));
      
      // Convertir a base64
      const base64Data = fileData.toString('base64');
      
      // Devolver con el tipo de contenido apropiado
      res.json({
        data: `data:${file.contentType};base64,${base64Data}`,
        contentType: file.contentType
      });
    } catch (error) {
      console.error('Error al recuperar archivo:', error);
      res.status(500).json({ message: 'Error al obtener archivo', error: error.message });
    }
  },
  // Eliminar archivo por ID
  async deleteFile(req, res) {
    try {
      const fileId = req.params.id;
      
      if (!ObjectId.isValid(fileId)) {
        return res.status(400).json({ message: 'ID de archivo inválido' });
      }
      
      const gridFSBucket = gridFSService.getGridFSBucket();
      
      if (!gridFSBucket) {
        return res.status(500).json({ message: 'GridFS no está inicializado' });
      }
      
      // Eliminar archivo
      await gridFSBucket.delete(new ObjectId(fileId));
      
      res.json({ message: 'Archivo eliminado exitosamente' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).json({ message: 'Error al eliminar archivo', error: error.message });
    }
  }
};

module.exports = fileController;