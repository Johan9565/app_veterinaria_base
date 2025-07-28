const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  // Los campos dinámicos se agregarán según los datos
  // Por ejemplo: "Quintana Roo": ["Bacalar", "Benito Juarez", ...]
}, {
  strict: false, // Permite campos dinámicos
  timestamps: true
});

// Índices para mejorar performance
locationSchema.index({ '$**': 'text' });

module.exports = mongoose.model('Location', locationSchema); 