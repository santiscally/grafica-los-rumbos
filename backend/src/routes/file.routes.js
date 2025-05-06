// routes/file.routes.js
const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');
const gridFSService = require('../services/gridfs.service');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas para archivos
router.post('/', authMiddleware, gridFSService.upload.single('file'), fileController.uploadFile);
router.get('/:id', fileController.getFile);
router.delete('/:id', authMiddleware, fileController.deleteFile);
router.get('/base64/:id', fileController.getFileBase64);
// Añadir al file.routes.js
router.get('/debug/:id', async (req, res) => {
    try {
      const fileId = req.params.id;
      const gfs = gridFSService.getGfs();
      
      if (!gfs) {
        return res.status(500).json({ message: 'GridFS no está inicializado' });
      }
      
      const file = await new Promise((resolve, reject) => {
        gfs.files.findOne({ _id: new mongoose.Types.ObjectId(fileId) }, (err, file) => {
          if (err) reject(err);
          else resolve(file);
        });
      });
      
      res.json({ file, exists: !!file });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;