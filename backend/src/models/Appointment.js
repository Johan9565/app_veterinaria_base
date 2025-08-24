const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: [true, 'La mascota es requerida']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El propietario es requerido']
  },
  veterinary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Veterinary',
    required: [true, 'La veterinaria es requerida']
  },
  veterinarian: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El veterinario es requerido']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'La fecha de la cita es requerida']
  },
  appointmentTime: {
    type: String,
    required: [true, 'La hora de la cita es requerida'],
    match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
  },
  duration: {
    type: Number,
    default: 30, // duración en minutos
    min: [15, 'La duración mínima es 15 minutos'],
    max: [240, 'La duración máxima es 4 horas']
  },
  type: {
    type: String,
    required: [true, 'El tipo de cita es requerido'],
    enum: [
      'consulta_general',
      'vacunacion',
      'cirugia',
      'radiografia',
      'laboratorio',
      'grooming',
      'emergencia',
      'seguimiento',
      'especialidad',
      'otro'
    ]
  },
  status: {
    type: String,
    enum: [
      'programada',
      'confirmada',
      'en_proceso',
      'completada',
      'cancelada',
      'no_show'
    ],
    default: 'programada'
  },
  priority: {
    type: String,
    enum: ['baja', 'normal', 'alta', 'urgente'],
    default: 'normal'
  },
  reason: {
    type: String,
    required: [true, 'El motivo de la cita es requerido'],
    trim: true,
    minlength: [10, 'El motivo debe tener al menos 10 caracteres'],
    maxlength: [500, 'El motivo no puede exceder 500 caracteres']
  },
  symptoms: [{
    type: String,
    trim: true,
    maxlength: [200, 'Cada síntoma no puede exceder 200 caracteres']
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Las notas no pueden exceder 1000 caracteres']
  },
  diagnosis: {
    type: String,
    trim: true,
    maxlength: [1000, 'El diagnóstico no puede exceder 1000 caracteres']
  },
  treatment: {
    type: String,
    trim: true,
    maxlength: [1000, 'El tratamiento no puede exceder 1000 caracteres']
  },
  prescription: [{
    medication: {
      type: String,
      trim: true,
      required: true
    },
    dosage: {
      type: String,
      trim: true,
      required: true
    },
    frequency: {
      type: String,
      trim: true,
      required: true
    },
    duration: {
      type: String,
      trim: true,
      required: true
    },
    instructions: {
      type: String,
      trim: true
    }
  }],
  cost: {
    amount: {
      type: Number,
      min: [0, 'El costo no puede ser negativo']
    },
    currency: {
      type: String,
      default: 'MXN',
      enum: ['MXN', 'USD', 'EUR']
    },
    paid: {
      type: Boolean,
      default: false
    },
    paymentMethod: {
      type: String,
      enum: ['efectivo', 'tarjeta', 'transferencia', 'otro']
    }
  },
  followUp: {
    required: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Las notas de seguimiento no pueden exceder 500 caracteres']
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Índices para mejorar performance
appointmentSchema.index({ pet: 1 });
appointmentSchema.index({ owner: 1 });
appointmentSchema.index({ veterinary: 1 });
appointmentSchema.index({ veterinarian: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ type: 1 });
appointmentSchema.index({ isActive: 1 });
appointmentSchema.index({ 'cost.paid': 1 });

// Método estático para buscar citas con filtros
appointmentSchema.statics.searchAppointments = function(search, filters = {}) {
  const query = { isActive: true, ...filters };
  
  if (search) {
    query.$or = [
      { reason: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
      { diagnosis: { $regex: search, $options: 'i' } },
      { treatment: { $regex: search, $options: 'i' } }
    ];
  }
  
  return this.find(query).sort({ appointmentDate: -1, appointmentTime: -1 });
};

// Método estático para obtener citas por propietario
appointmentSchema.statics.getByOwner = function(ownerId) {
  return this.find({ owner: ownerId, isActive: true })
    .populate('pet', 'name species breed')
    .populate('veterinary', 'name address')
    .populate('veterinarian', 'name')
    .sort({ appointmentDate: -1, appointmentTime: -1 });
};

// Método estático para obtener citas por veterinaria
appointmentSchema.statics.getByVeterinary = function(veterinaryId) {
  return this.find({ veterinary: veterinaryId, isActive: true })
    .populate('pet', 'name species breed')
    .populate('owner', 'name email phone')
    .populate('veterinarian', 'name')
    .sort({ appointmentDate: -1, appointmentTime: -1 });
};

// Método estático para obtener citas por veterinario
appointmentSchema.statics.getByVeterinarian = function(veterinarianId) {
  return this.find({ veterinarian: veterinarianId, isActive: true })
    .populate('pet', 'name species breed')
    .populate('owner', 'name email phone')
    .populate('veterinary', 'name address')
    .sort({ appointmentDate: -1, appointmentTime: -1 });
};

// Método estático para obtener citas por fecha
appointmentSchema.statics.getByDate = function(date) {
  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  
  return this.find({
    appointmentDate: { $gte: startDate, $lte: endDate },
    isActive: true
  })
    .populate('pet', 'name species breed')
    .populate('owner', 'name email phone')
    .populate('veterinary', 'name address')
    .populate('veterinarian', 'name')
    .sort({ appointmentTime: 1 });
};

// Método estático para verificar disponibilidad
appointmentSchema.statics.checkAvailability = function(veterinaryId, veterinarianId, date, time, duration, excludeId = null) {
  const appointmentTime = new Date(`${date}T${time}`);
  const endTime = new Date(appointmentTime.getTime() + duration * 60000);
  
  const query = {
    veterinary: veterinaryId,
    veterinarian: veterinarianId,
    appointmentDate: date,
    isActive: true,
    status: { $nin: ['cancelada', 'no_show'] },
    $or: [
      {
        appointmentTime: { $lt: time },
        $expr: {
          $gt: [
            { $add: [{ $dateFromString: { dateString: { $concat: [{ $dateToString: { date: '$appointmentDate', format: '%Y-%m-%d' } }, 'T', '$appointmentTime'] } } }, { $multiply: ['$duration', 60000] }] },
            appointmentTime
          ]
        }
      },
      {
        appointmentTime: { $lt: endTime.toTimeString().slice(0, 5) },
        $expr: {
          $gt: [
            { $dateFromString: { dateString: { $concat: [{ $dateToString: { date: '$appointmentDate', format: '%Y-%m-%d' } }, 'T', '$appointmentTime'] } } },
            appointmentTime
          ]
        }
      }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.findOne(query);
};

// Método de instancia para actualizar estado
appointmentSchema.methods.updateStatus = function(newStatus, updatedBy) {
  this.status = newStatus;
  this.updatedBy = updatedBy;
  return this.save();
};

// Método de instancia para marcar como pagada
appointmentSchema.methods.markAsPaid = function(paymentMethod, updatedBy) {
  this.cost.paid = true;
  this.cost.paymentMethod = paymentMethod;
  this.updatedBy = updatedBy;
  return this.save();
};

// Middleware para validar fecha futura
appointmentSchema.pre('save', function(next) {
  const appointmentDateTime = new Date(`${this.appointmentDate.toISOString().split('T')[0]}T${this.appointmentTime}`);
  
  if (appointmentDateTime <= new Date()) {
    return next(new Error('La cita debe ser programada para una fecha y hora futura'));
  }
  
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
