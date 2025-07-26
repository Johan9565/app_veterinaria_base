const mongoose = require('mongoose');

const veterinarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre de la veterinaria es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  address: {
    type: String,
    required: [true, 'La dirección es requerida'],
    trim: true,
    minlength: [10, 'La dirección debe tener al menos 10 caracteres'],
    maxlength: [200, 'La dirección no puede exceder 200 caracteres']
  },
  phone: {
    type: String,
    required: [true, 'El teléfono es requerido'],
    trim: true,
    match: [/^[\+]?[0-9\s\-\(\)]{10,15}$/, 'Formato de teléfono inválido']
  },
  email: {
    type: String,
    required: [true, 'El correo electrónico es requerido'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  // Campos adicionales útiles
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'La descripción no puede exceder 500 caracteres']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'URL inválida']
  },
  logo: {
    url: {
      type: String,
      trim: true
    },
    publicId: {
      type: String,
      trim: true
    },
    width: {
      type: Number
    },
    height: {
      type: Number
    }
  },
  services: [{
    type: String,
    trim: true,
    enum: [
      'consultas_generales',
      'vacunacion',
      'cirugia',
      'radiografia',
      'laboratorio',
      'grooming',
      'emergencias',
      'especialidades',
      'farmacia',
      'hospitalizacion'
    ]
  }],
  specialties: [{
    type: String,
    trim: true
  }],
  hours: {
    monday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    tuesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    wednesday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    thursday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    friday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '18:00' },
      closed: { type: Boolean, default: false }
    },
    saturday: {
      open: { type: String, default: '09:00' },
      close: { type: String, default: '14:00' },
      closed: { type: Boolean, default: false }
    },
    sunday: {
      open: { type: String, default: '10:00' },
      close: { type: String, default: '14:00' },
      closed: { type: Boolean, default: true }
    }
  },
  emergencyPhone: {
    type: String,
    trim: true,
    match: [/^[\+]?[0-9\s\-\(\)]{10,15}$/, 'Formato de teléfono inválido']
  },
  emergencyAvailable: {
    type: Boolean,
    default: false
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  city: {
    type: String,
    required: [true, 'La ciudad es requerida'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'El estado/provincia es requerido'],
    trim: true
  },
  zipCode: {
    type: String,
    trim: true
  },
  country: {
    type: String,
    default: 'México',
    trim: true
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El propietario es requerido']
  },
  staff: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['veterinario', 'asistente', 'recepcionista', 'administrador'],
      default: 'veterinario'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  images: [{
    url: String,
    caption: String,
    isMain: {
      type: Boolean,
      default: false
    }
  }],
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String
  }
}, {
  timestamps: true
});

// Índices para mejorar performance
veterinarySchema.index({ name: 1 });
veterinarySchema.index({ city: 1, state: 1 });
veterinarySchema.index({ isActive: 1 });
veterinarySchema.index({ owner: 1 });
veterinarySchema.index({ location: '2dsphere' });
veterinarySchema.index({ email: 1 }, { unique: true });

// Método estático para obtener veterinarias activas
veterinarySchema.statics.getActiveVeterinaries = function() {
  return this.find({ isActive: true }).sort({ name: 1 });
};

// Método estático para buscar por ubicación
veterinarySchema.statics.findNearby = function(coordinates, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    isActive: true
  });
};

// Método estático para buscar por servicios
veterinarySchema.statics.findByService = function(service) {
  return this.find({
    services: service,
    isActive: true
  });
};

// Método para calcular rating promedio
veterinarySchema.methods.updateRating = function(newRating) {
  const totalRating = (this.rating * this.reviewCount) + newRating;
  this.reviewCount += 1;
  this.rating = totalRating / this.reviewCount;
  return this.save();
};

// Método para verificar si está abierta
veterinarySchema.methods.isOpen = function() {
  const now = new Date();
  const dayOfWeek = now.toLocaleLowerCase().slice(0, 3);
  const currentTime = now.toTimeString().slice(0, 5);
  
  const todayHours = this.hours[dayOfWeek];
  if (todayHours.closed) return false;
  
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
};

module.exports = mongoose.model('Veterinary', veterinarySchema); 