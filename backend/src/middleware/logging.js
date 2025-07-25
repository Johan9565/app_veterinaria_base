const Log = require('../models/Log');

// Función helper para obtener IP de manera segura
const getClientIP = (req) => {
  if (!req) return 'unknown';
  return req.ip || 
         req.connection?.remoteAddress || 
         req.headers?.['x-forwarded-for'] || 
         req.headers?.['x-real-ip'] || 
         'unknown';
};

// Función helper para obtener User-Agent de manera segura
const getUserAgent = (req) => {
  if (!req || typeof req.get !== 'function') return 'unknown';
  return req.get('User-Agent') || 'unknown';
};

// Función helper para obtener información de request de manera segura
const getRequestInfo = (req) => {
  if (!req) {
    return {
      ipAddress: 'unknown',
      userAgent: 'unknown',
      method: 'unknown',
      url: 'unknown'
    };
  }
  
  return {
    ipAddress: getClientIP(req),
    userAgent: getUserAgent(req),
    method: req.method || 'unknown',
    url: req.originalUrl || req.url || 'unknown'
  };
};

// Middleware para logging automático de peticiones HTTP
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Capturar información de la petición
  const requestInfo = {
    ...getRequestInfo(req),
    timestamp: new Date()
  };

  // Interceptar el final de la respuesta
  const originalSend = res.send;
  res.send = function(data) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Determinar el nivel del log basado en el código de respuesta
    let level = 'info';
    if (res.statusCode >= 500) {
      level = 'error';
    } else if (res.statusCode >= 400) {
      level = 'warning';
    }

    // Determinar la categoría basada en la URL
    let category = 'api';
    if (req.originalUrl.startsWith('/api/auth')) {
      category = 'auth';
    } else if (req.originalUrl.startsWith('/api/users')) {
      category = 'user';
    } else if (req.originalUrl.startsWith('/api/permissions')) {
      category = 'permission';
    } else if (req.originalUrl.startsWith('/api/veterinaries')) {
      category = 'veterinary';
    } else if (req.originalUrl.startsWith('/api/logs')) {
      category = 'system';
    }

    // Determinar la acción basada en el método HTTP
    let action = 'view';
    switch (req.method) {
      case 'POST':
        action = 'create';
        break;
      case 'PUT':
      case 'PATCH':
        action = 'update';
        break;
      case 'DELETE':
        action = 'delete';
        break;
      case 'GET':
        action = 'view';
        break;
    }

    // Crear el mensaje del log
    const message = `${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime}ms)`;

    // Preparar datos del log
    const logData = {
      level,
      category,
      action,
      message,
      ipAddress: requestInfo.ipAddress,
      userAgent: requestInfo.userAgent,
      method: requestInfo.method,
      url: requestInfo.url,
      statusCode: res.statusCode,
      responseTime,
      timestamp: requestInfo.timestamp
    };

    // Agregar información del usuario si está autenticado
    if (req.user) {
      logData.userId = req.user._id;
      logData.userInfo = {
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      };
    }

    // Crear el log de forma asíncrona (no bloquear la respuesta)
    Log.createLog(logData).catch(error => {
      console.error('Error creating request log:', error);
    });

    // Llamar al método original
    return originalSend.call(this, data);
  };

  next();
};

// Middleware para logging de errores
const errorLogger = (error, req, res, next) => {
  const requestInfo = getRequestInfo(req);
  const logData = {
    level: 'error',
    category: 'system',
    action: 'error',
    message: error.message || 'Error interno del servidor',
    ...requestInfo,
    statusCode: error.status || 500,
    metadata: {
      stack: error.stack,
      name: error.name
    },
    timestamp: new Date()
  };

  // Agregar información del usuario si está autenticado
  if (req.user) {
    logData.userId = req.user._id;
    logData.userInfo = {
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    };
  }

  // Crear el log de error
  Log.createLog(logData).catch(logError => {
    console.error('Error creating error log:', logError);
  });

  next(error);
};

// Función helper para crear logs manuales
const createActivityLog = async (data) => {
  try {
    const logData = {
      level: data.level || 'info',
      category: data.category || 'system',
      action: data.action,
      message: data.message,
      timestamp: new Date(),
      ...data
    };

    return await Log.createLog(logData);
  } catch (error) {
    console.error('Error creating activity log:', error);
    return null;
  }
};

// Función helper para logging de autenticación
const logAuthActivity = async (action, user, req, success = true, details = {}) => {
  const requestInfo = getRequestInfo(req);
  const logData = {
    level: success ? 'info' : 'security',
    category: 'auth',
    action,
    message: `${action} ${success ? 'exitoso' : 'fallido'} - ${user?.email || 'Usuario desconocido'}`,
    ...requestInfo,
    metadata: {
      success,
      ...details
    }
  };

  if (user) {
    logData.userId = user._id;
    logData.userInfo = {
      email: user.email,
      name: user.name,
      role: user.role
    };
  }

  return await Log.createLog(logData);
};

// Función helper para logging de operaciones CRUD
const logCRUDActivity = async (action, resource, user, req, details,level = 'info') => {
  const requestInfo = getRequestInfo(req);
  const logData = {
    level: level,
    category: resource.toLowerCase(),
    action,
    message: `${action} ${resource} - ${details.id || 'N/A'}`,
    ...requestInfo,
    resources: [{
      type: resource.toLowerCase(),
      id: details.id,
      action
    }],
    metadata: details
  };

  if (user) {
    logData.userId = user._id;
    logData.userInfo = {
      email: user.email,
      name: user.name,
      role: user.role
    };
  }

  return await Log.createLog(logData);
};

module.exports = {
  requestLogger,
  errorLogger,
  createActivityLog,
  logAuthActivity,
  logCRUDActivity
}; 