const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la mascota es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },
  species: {
    type: String,
    required: [true, 'La especie es requerida'],
    enum: ['perro', 'gato', 'ave', 'reptil', 'roedor', 'conejo', 'caballo', 'otro'],
    trim: true
  },
  breed: {
    type: String,
    trim: true,
    maxlength: [100, 'La raza no puede exceder 100 caracteres']
  },
  gender: {
    type: String,
    required: [true, 'El género es requerido'],
    enum: ['macho', 'hembra'],
    trim: true
  },
  birthDate: {
    type: Date,
    required: [true, 'La fecha de nacimiento es requerida']
  },
  weight: {
    value: {
      type: Number,
      min: [0, 'El peso no puede ser negativo'],
      required: [true, 'El peso es requerido']
    },
    unit: {
      type: String,
      enum: ['kg', 'lb'],
      default: 'kg'
    }
  },
  color: {
    type: String,
    trim: true,
    maxlength: [50, 'El color no puede exceder 50 caracteres']
  },
  microchip: {
    number: {
      type: String,
      trim: true,
      unique: true,
      sparse: true // Permite valores null/undefined
    },
    implantedDate: {
      type: Date
    }
  },
  isNeutered: {
    type: Boolean,
    default: false
  },
  neuteredDate: {
    type: Date
  },
  healthStatus: {
    type: String,
    enum: ['excelente', 'bueno', 'regular', 'malo', 'crítico'],
    default: 'bueno'
  },
  allergies: [{
    type: String,
    trim: true
  }],
  medications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      trim: true
    },
    frequency: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  vaccinations: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    nextDueDate: {
      type: Date
    },
    veterinarian: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  medicalHistory: [{
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['consulta', 'vacunación', 'cirugía', 'emergencia', 'chequeo', 'otro'],
      required: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    diagnosis: {
      type: String,
      trim: true
    },
    treatment: {
      type: String,
      trim: true
    },
    veterinarian: {
      type: String,
      trim: true
    },
    veterinary: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Veterinary'
    },
    cost: {
      type: Number,
      min: 0
    },
    followUpDate: {
      type: Date
    }
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El propietario es requerido']
  },
  veterinary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Veterinary'
  },
  photo: {
    url: {
      type: String,
      trim: true
    },
    publicId: {
      type: String,
      trim: true
    }
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emergencyContact: {
    name: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    relationship: {
      type: String,
      trim: true
    }
  },
  insurance: {
    provider: {
      type: String,
      trim: true
    },
    policyNumber: {
      type: String,
      trim: true
    },
    expiryDate: {
      type: Date
    }
  }
}, {
  timestamps: true
});

// Índices para mejorar performance
petSchema.index({ owner: 1 });
petSchema.index({ veterinary: 1 });
petSchema.index({ species: 1 });
petSchema.index({ name: 1 });
petSchema.index({ microchip: 1 });
petSchema.index({ isActive: 1 });
petSchema.index({ 'medicalHistory.date': -1 });

// Método para calcular la edad
petSchema.methods.getAge = function() {
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Método para obtener la edad en formato legible
petSchema.methods.getAgeString = function() {
  const age = this.getAge();
  if (age === 0) {
    const months = Math.floor((new Date() - new Date(this.birthDate)) / (1000 * 60 * 60 * 24 * 30));
    return `${months} mes${months !== 1 ? 'es' : ''}`;
  }
  return `${age} año${age !== 1 ? 's' : ''}`;
};

// Método estático para obtener mascotas por propietario
petSchema.statics.getByOwner = function(ownerId) {
  return this.find({ owner: ownerId, isActive: true })
    .populate('owner', 'name email phone')
    .populate('veterinary', 'name address phone')
    .sort({ createdAt: -1 });
};

// Método estático para obtener mascotas por veterinaria
petSchema.statics.getByVeterinary = function(veterinaryId) {
  return this.find({ veterinary: veterinaryId, isActive: true })
    .populate('owner', 'name email phone')
    .sort({ createdAt: -1 });
};

// Método estático para buscar mascotas
petSchema.statics.searchPets = function(query, filters = {}) {
  const searchQuery = {
    isActive: true,
    ...filters
  };

  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { breed: { $regex: query, $options: 'i' } },
      { 'microchip.number': { $regex: query, $options: 'i' } }
    ];
  }

  return this.find(searchQuery)
    .populate('owner', 'name email phone')
    .populate('veterinary', 'name address')
    .sort({ createdAt: -1 });
};

// Método para agregar registro médico
petSchema.methods.addMedicalRecord = function(record) {
  this.medicalHistory.push({
    ...record,
    date: new Date()
  });
  return this.save();
};

// Método para agregar vacuna
petSchema.methods.addVaccination = function(vaccination) {
  this.vaccinations.push({
    ...vaccination,
    date: new Date()
  });
  return this.save();
};

// Método para agregar medicamento
petSchema.methods.addMedication = function(medication) {
  this.medications.push({
    ...medication,
    startDate: new Date()
  });
  return this.save();
};

module.exports = mongoose.model('Pet', petSchema); 