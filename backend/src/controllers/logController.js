const Log = require('../models/Log');
const User = require('../models/User');

// Obtener logs con filtros y paginación
const getLogs = async (req, res) => {
  try {
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
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100), // Máximo 100 por página
      level,
      category,
      action,
      userId,
      userRole,
      startDate,
      endDate,
      search,
      sortBy,
      sortOrder
    };

    const result = await Log.getLogs(options);

    res.json({
      success: true,
      data: {
        logs: result.logs.map(log => log.toDisplayFormat ? log.toDisplayFormat() : log),
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Error obteniendo logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo logs del sistema',
      error: error.message
    });
  }
};

// Obtener estadísticas de logs
const getLogStats = async (req, res) => {
  try {
    const { startDate, endDate, category, level } = req.query;

    const options = { startDate, endDate, category, level };
    const stats = await Log.getLogStats(options);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas de logs',
      error: error.message
    });
  }
};

// Obtener logs de errores recientes
const getRecentErrors = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const errors = await Log.getRecentErrors(parseInt(limit));

    res.json({
      success: true,
      data: {
        errors: errors.map(error => error.toDisplayFormat ? error.toDisplayFormat() : error),
        count: errors.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo errores recientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo errores recientes',
      error: error.message
    });
  }
};

// Obtener actividad de un usuario específico
const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const activity = await Log.getUserActivity(userId, parseInt(limit));

    res.json({
      success: true,
      data: {
        user: user.toPublicJSON(),
        activity: activity.map(log => log.toDisplayFormat ? log.toDisplayFormat() : log),
        count: activity.length
      }
    });
  } catch (error) {
    console.error('Error obteniendo actividad del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo actividad del usuario',
      error: error.message
    });
  }
};

// Obtener logs por categoría
const getLogsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
      category
    };

    const result = await Log.getLogs(options);

    res.json({
      success: true,
      data: {
        category,
        logs: result.logs.map(log => log.toDisplayFormat ? log.toDisplayFormat() : log),
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Error obteniendo logs por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo logs por categoría',
      error: error.message
    });
  }
};

// Obtener logs por nivel
const getLogsByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100),
      level
    };

    const result = await Log.getLogs(options);

    res.json({
      success: true,
      data: {
        level,
        logs: result.logs.map(log => log.toDisplayFormat ? log.toDisplayFormat() : log),
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Error obteniendo logs por nivel:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo logs por nivel',
      error: error.message
    });
  }
};

// Exportar logs a CSV
const exportLogs = async (req, res) => {
  try {
    const {
      level,
      category,
      action,
      userId,
      userRole,
      startDate,
      endDate,
      search
    } = req.query;

    const options = {
      level,
      category,
      action,
      userId,
      userRole,
      startDate,
      endDate,
      search,
      limit: 10000 // Máximo 10,000 registros para exportar
    };

    const result = await Log.getLogs(options);

    // Generar CSV
    const csvHeaders = [
      'ID',
      'Timestamp',
      'Level',
      'Category',
      'Action',
      'Message',
      'User Name',
      'User Email',
      'User Role',
      'IP Address',
      'Method',
      'URL',
      'Status Code',
      'Response Time (ms)'
    ];

    const csvRows = result.logs.map(log => [
      log._id,
      log.timestamp,
      log.level,
      log.category,
      log.action,
      log.message,
      log.userInfo?.name || '',
      log.userInfo?.email || '',
      log.userInfo?.role || '',
      log.ipAddress || '',
      log.method || '',
      log.url || '',
      log.statusCode || '',
      log.responseTime || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=system_logs_${new Date().toISOString().split('T')[0]}.csv`);

    res.send(csvContent);
  } catch (error) {
    console.error('Error exportando logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error exportando logs',
      error: error.message
    });
  }
};

// Limpiar logs antiguos
const cleanOldLogs = async (req, res) => {
  try {
    const { daysToKeep = 90 } = req.body;

    const deletedCount = await Log.cleanOldLogs(parseInt(daysToKeep));

    res.json({
      success: true,
      message: `Se eliminaron ${deletedCount} logs antiguos`,
      data: {
        deletedCount,
        daysKept: daysToKeep
      }
    });
  } catch (error) {
    console.error('Error limpiando logs antiguos:', error);
    res.status(500).json({
      success: false,
      message: 'Error limpiando logs antiguos',
      error: error.message
    });
  }
};

// Obtener un log específico
const getLogById = async (req, res) => {
  try {
    const { logId } = req.params;

    const log = await Log.findById(logId);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Log no encontrado'
      });
    }

    res.json({
      success: true,
      data: log.toDisplayFormat ? log.toDisplayFormat() : log
    });
  } catch (error) {
    console.error('Error obteniendo log:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo log',
      error: error.message
    });
  }
};

// Crear log manualmente (para testing)
const createLog = async (req, res) => {
  try {
    const logData = req.body;
    
    // Agregar información del usuario si está autenticado
    if (req.user) {
      logData.userId = req.user._id;
      logData.userInfo = {
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      };
    }

    // Agregar información de la petición
    logData.ipAddress = req.ip;
    logData.userAgent = req.get('User-Agent');
    logData.method = req.method;
    logData.url = req.originalUrl;

    const log = await Log.createLog(logData);

    if (!log) {
      return res.status(500).json({
        success: false,
        message: 'Error creando log'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Log creado exitosamente',
      data: log.toDisplayFormat ? log.toDisplayFormat() : log
    });
  } catch (error) {
    console.error('Error creando log:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando log',
      error: error.message
    });
  }
};

module.exports = {
  getLogs,
  getLogStats,
  getRecentErrors,
  getUserActivity,
  getLogsByCategory,
  getLogsByLevel,
  exportLogs,
  cleanOldLogs,
  getLogById,
  createLog
}; 