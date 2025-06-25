// backend/controllers/price.controller.js
const Price = require('../models/price.model');

const priceController = {
  // Obtener todos los precios ordenados por fecha de creación
  async getPrices(req, res) {
    try {
      const prices = await Price.find({ activo: true }).sort({ createdAt: -1 }); // Ordenar por fecha descendente
      res.json(prices);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener precios', error: error.message });
    }
  },

  // Obtener precio por ID
  async getPriceById(req, res) {
    try {
      const price = await Price.findById(req.params.id);
      if (!price) {
        return res.status(404).json({ message: 'Precio no encontrado' });
      }
      res.json(price);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener precio', error: error.message });
    }
  },

  // Crear nuevo precio
  async createPrice(req, res) {
    try {
      const { servicio, precio } = req.body;
      
      // Verificar si ya existe un precio con ese servicio
      const existingPrice = await Price.findOne({ servicio });
      if (existingPrice) {
        return res.status(400).json({ message: 'Ya existe un precio para este servicio' });
      }
      
      const newPrice = new Price({
        servicio,
        precio
      });
      await newPrice.save();
      res.status(201).json(newPrice);
    } catch (error) {
      res.status(400).json({ message: 'Error al crear precio', error: error.message });
    }
  },

  // Actualizar precio
  async updatePrice(req, res) {
    try {
      const { servicio, precio } = req.body;
      
      const price = await Price.findByIdAndUpdate(
        req.params.id,
        { servicio, precio },
        { new: true, runValidators: true }
      );
      
      if (!price) {
        return res.status(404).json({ message: 'Precio no encontrado' });
      }
      
      res.json(price);
    } catch (error) {
      res.status(400).json({ message: 'Error al actualizar precio', error: error.message });
    }
  },

  // Eliminar precio (soft delete)
  async deletePrice(req, res) {
    try {
      const price = await Price.findByIdAndUpdate(
        req.params.id,
        { activo: false },
        { new: true }
      );
      
      if (!price) {
        return res.status(404).json({ message: 'Precio no encontrado' });
      }
      
      res.json({ message: 'Precio desactivado exitosamente' });
    } catch (error) {
      res.status(500).json({ message: 'Error al eliminar precio', error: error.message });
    }
  }
};

module.exports = priceController;