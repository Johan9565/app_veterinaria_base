const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  // Información básica del log
  level: {
    type: String,
    required: true,
    enum: ['info', 'warning', 'error', 'debug', 'security'],
    default: 'info'
  },
  
  // Categoría del log para facilitar filtros
  category: {
    type: String,
    required: true,
    enum: [
      'auth', 'user', 'pet', 'appointment', 'veterinary', 
      'permission', 'system', 'api', 'database', 'security'
    ]
  },
  
  // Acción específica realizada
  action: {
    type: String,
    required: true,
    trim: true
  },
  
  // Descripción detallada del evento
  message: {
    type: String,
    required: true,
    trim: true
  },
  
  // Usuario que realizó la acción
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Puede ser null para logs del sistema
  },
  
  // Información del usuario (cached para evitar joins)
  userInfo: {
    email: String,
    name: String,
    role: String
  },
  
  // IP del cliente
  ipAddress: {
    type: String,
    trim: true
  },
  
  // User Agent del navegador
  userAgent: {
    type: String,
    trim: true
  },
  
  // Método HTTP
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD']
  },
  
  // URL de la petición
  url: {
    type: String,
    trim: true
  },
  
  // Código de respuesta HTTP
  statusCode: {
    type: Number,
    min: 100,
    max: 599
  },
  
  // Tiempo de respuesta en milisegundos
  responseTime: {
    type: Number,
    min: 0
  },
  
  // Datos adicionales (opcional)
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Recursos afectados (opcional)
  resources: [{
    type: {
      type: String,
      enum: ['user', 'pet', 'appointment', 'veterinary', 'permission']
    },
    id: mongoose.Schema.Types.ObjectId,
    action: String
  }],
  
  // Timestamp de creación
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  // Configuración para optimizar consultas
  collection: 'system_logs'
});

// Índices para optimizar consultas frecuentes
logSchema.index({ timestamp: -1 }); // Ordenar por fecha descendente
logSchema.index({ level: 1, timestamp: -1 }); // Filtrar por nivel y fecha
logSchema.index({ category: 1, timestamp: -1 }); // Filtrar por categoría y fecha
logSchema.index({ userId: 1, timestamp: -1 }); // Filtrar por usuario y fecha
logSchema.index({ action: 1, timestamp: -1 }); // Filtrar por acción y fecha
logSchema.index({ 'userInfo.role': 1, timestamp: -1 }); // Filtrar por rol y fecha
logSchema.index({ statusCode: 1, timestamp: -1 }); // Filtrar por código de respuesta
logSchema.index({ ipAddress: 1, timestamp: -1 }); // Filtrar por IP

// Índice compuesto para consultas complejas
logSchema.index({ 
  category: 1, 
  level: 1, 
  timestamp: -1 
});

// Índice TTL para limpiar logs antiguos automáticamente (opcional)
// logSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 días

// Métodos estáticos para consultas optimizadas
logSchema.statics = {
  // Obtener logs con paginación
  async getLogs(options = {}) {
    const {
      page = 1,
      limit = 50,
      level,
      category,
      action,
      userId,
      userRole,
      startDate,
      endDate,
      search,
      sortBy = 'timestamp',
      sortOrder = 'desc'
    } = options;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    // Construir filtros
    const filters = {};

    if (level) filters.level = level;
    if (category) filters.category = category;
    if (action) filters.action = action;
    if (userId) filters.userId = userId;
    if (userRole) filters['userInfo.role'] = userRole;

    // Filtro de fechas
    if (startDate || endDate) {
      filters.timestamp = {};
      if (startDate) filters.timestamp.$gte = new Date(startDate);
      if (endDate) filters.timestamp.$lte = new Date(endDate);
    }

    // Búsqueda en texto
    if (search) {
      filters.$or = [
        { message: { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { 'userInfo.name': { $regex: search, $options: 'i' } },
        { 'userInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Ejecutar consulta con paginación
    const [logs, total] = await Promise.all([
      this.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      this.countDocuments(filters)
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // Obtener estadísticas de logs
  async getLogStats(options = {}) {
    const { startDate, endDate, category, level } = options;

    const filters = {};
    if (startDate || endDate) {
      filters.timestamp = {};
      if (startDate) filters.timestamp.$gte = new Date(startDate);
      if (endDate) filters.timestamp.$lte = new Date(endDate);
    }
    if (category) filters.category = category;
    if (level) filters.level = level;

    const [
      totalLogs,
      logsByLevel,
      logsByCategory,
      logsByHour,
      logsByDay,
      topUsers,
      topActions,
      errorCount
    ] = await Promise.all([
      // Total de logs
      this.countDocuments(filters),
      
      // Logs por nivel
      this.aggregate([
        { $match: filters },
        { $group: { _id: '$level', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Logs por categoría
      this.aggregate([
        { $match: filters },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      
      // Logs por hora del día
      this.aggregate([
        { $match: filters },
        { 
          $group: { 
            _id: { $hour: '$timestamp' }, 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Logs por día
      this.aggregate([
        { $match: filters },
        { 
          $group: { 
            _id: { 
              $dateToString: { 
                format: '%Y-%m-%d', 
                date: '$timestamp' 
              } 
            }, 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { _id: -1 } },
        { $limit: 30 }
      ]),
      
      // Usuarios más activos
      this.aggregate([
        { $match: { ...filters, userId: { $exists: true, $ne: null } } },
        { $group: { _id: '$userId', count: { $sum: 1 }, userInfo: { $first: '$userInfo' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Acciones más frecuentes
      this.aggregate([
        { $match: filters },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      
      // Conteo de errores
      this.countDocuments({ ...filters, level: 'error' })
    ]);

    return {
      totalLogs,
      logsByLevel,
      logsByCategory,
      logsByHour,
      logsByDay,
      topUsers,
      topActions,
      errorCount,
      errorPercentage: totalLogs > 0 ? (errorCount / totalLogs * 100).toFixed(2) : 0
    };
  },

  // Crear log de forma optimizada
  async createLog(logData) {
    try {
      const log = new this(logData);
      await log.save();
      return log;
    } catch (error) {
      console.error('Error creating log:', error);
      // No lanzar error para no interrumpir el flujo principal
      return null;
    }
  },

  // Limpiar logs antiguos
  async cleanOldLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.deleteMany({
      timestamp: { $lt: cutoffDate }
    });

    return result.deletedCount;
  },

  // Obtener logs de errores recientes
  async getRecentErrors(limit = 100) {
    return this.find({ level: 'error' })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  },

  // Obtener actividad de un usuario específico
  async getUserActivity(userId, limit = 50) {
    return this.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean();
  }
};

// Métodos de instancia
logSchema.methods = {
  // Formatear log para mostrar
  toDisplayFormat() {
    return {
      id: this._id,
      level: this.level,
      category: this.category,
      action: this.action,
      message: this.message,
      user: this.userInfo ? {
        name: this.userInfo.name,
        email: this.userInfo.email,
        role: this.userInfo.role
      } : null,
      ipAddress: this.ipAddress,
      method: this.method,
      url: this.url,
      statusCode: this.statusCode,
      responseTime: this.responseTime,
      resources: this.resources,
      timestamp: this.timestamp,
      metadata: this.metadata
    };
  }
};

module.exports = mongoose.model('Log', logSchema); 