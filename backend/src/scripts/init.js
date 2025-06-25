// backend/src/scripts/init.js
// Script para inicializar la base de datos con valores por defecto
const mongoose = require('mongoose');
const Counter = require('../models/counter.model');
const Price = require('../models/price.model');

async function initializeDatabase() {
  try {
    // Inicializar contador de órdenes
    await Counter.findOneAndUpdate(
      { _id: 'orderCode' },
      { $setOnInsert: { seq: 1278 } }, // Empezar desde 1278 como en la imagen
      { upsert: true, new: true }
    );
    console.log('✓ Contador de órdenes inicializado');

    // Inicializar precios por defecto
    const defaultPrices = [
      { servicio: 'Fotocopia A4 Blanco y Negro', precio: 50 },
      { servicio: 'Fotocopia A4 Color', precio: 150 },
      { servicio: 'Impresión A4 Blanco y Negro', precio: 80 },
      { servicio: 'Impresión A4 Color', precio: 200 },
      { servicio: 'Encuadernación Anillado', precio: 500 },
      { servicio: 'Plastificado A4', precio: 300 }
    ];

    for (const priceData of defaultPrices) {
      await Price.findOneAndUpdate(
        { servicio: priceData.servicio },
        { $setOnInsert: priceData },
        { upsert: true }
      );
    }
    console.log('✓ Precios por defecto inicializados');

    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
  }
}

module.exports = initializeDatabase;