const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  // Los campos dinámicos se agregarán según los datos
  // Por ejemplo: "Quintana Roo": ["Bacalar", "Benito Juarez", ...]
}, {
  strict: false, // Permite campos dinámicos
  timestamps: true,
  collection: 'states' // Especifica el nombre de la colección
});

// Índices para mejorar performance
stateSchema.index({ '$**': 'text' });

module.exports = mongoose.model('State', stateSchema); 