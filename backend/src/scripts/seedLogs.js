const mongoose = require('mongoose');
const Log = require('../models/Log');
const User = require('../models/User');

// Configuración de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/veterinaria';

// Función para conectar a MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    process.exit(1);
  }
}

// Función para generar logs de prueba
async function generateTestLogs() {
  try {
    console.log('🚀 Generando logs de prueba...');

    // Obtener algunos usuarios para asociar con los logs
    const users = await User.find().limit(5);
    
    if (users.length === 0) {
      console.log('⚠️ No hay usuarios en la base de datos. Creando logs sin usuarios...');
    }

    const testLogs = [];

    // Logs de autenticación
    for (let i = 0; i < 50; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const isSuccess = Math.random() > 0.1; // 90% éxito

      testLogs.push({
        level: isSuccess ? 'info' : 'security',
        category: 'auth',
        action: 'login',
        message: `Login ${isSuccess ? 'exitoso' : 'fallido'} - ${user?.email || 'usuario@test.com'}`,
        userId: user?._id,
        userInfo: user ? {
          email: user.email,
          name: user.name,
          role: user.role
        } : null,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        method: 'POST',
        url: '/api/auth/login',
        statusCode: isSuccess ? 200 : 401,
        responseTime: Math.floor(Math.random() * 500) + 50,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
      });
    }

    // Logs de usuarios
    for (let i = 0; i < 100; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const actions = ['view', 'create', 'update', 'delete'];
      const action = actions[Math.floor(Math.random() * actions.length)];

      testLogs.push({
        level: 'info',
        category: 'user',
        action,
        message: `${action} usuario - ID: ${Math.floor(Math.random() * 1000)}`,
        userId: user?._id,
        userInfo: user ? {
          email: user.email,
          name: user.name,
          role: user.role
        } : null,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        method: action === 'view' ? 'GET' : action === 'create' ? 'POST' : action === 'update' ? 'PUT' : 'DELETE',
        url: `/api/users/${action === 'view' ? '' : Math.floor(Math.random() * 1000)}`,
        statusCode: 200,
        responseTime: Math.floor(Math.random() * 300) + 30,
        resources: [{
          type: 'user',
          id: new mongoose.Types.ObjectId(),
          action
        }],
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }

    // Logs de permisos
    for (let i = 0; i < 30; i++) {
      const user = users[Math.floor(Math.random() * users.length)];

      testLogs.push({
        level: 'info',
        category: 'permission',
        action: 'assign',
        message: 'Asignación de permisos a usuario',
        userId: user?._id,
        userInfo: user ? {
          email: user.email,
          name: user.name,
          role: user.role
        } : null,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        method: 'PUT',
        url: '/api/permissions/user/123',
        statusCode: 200,
        responseTime: Math.floor(Math.random() * 200) + 50,
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }

    // Logs de errores
    for (let i = 0; i < 20; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const errors = [
        'Error de validación en formulario',
        'Recurso no encontrado',
        'Error de conexión a base de datos',
        'Timeout en petición',
        'Error de permisos insuficientes'
      ];
      const error = errors[Math.floor(Math.random() * errors.length)];

      testLogs.push({
        level: 'error',
        category: 'system',
        action: 'error',
        message: error,
        userId: user?._id,
        userInfo: user ? {
          email: user.email,
          name: user.name,
          role: user.role
        } : null,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        method: 'GET',
        url: '/api/users',
        statusCode: Math.floor(Math.random() * 200) + 400,
        responseTime: Math.floor(Math.random() * 1000) + 100,
        metadata: {
          error: error,
          stack: 'Error stack trace...'
        },
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }

    // Logs de veterinarias
    for (let i = 0; i < 80; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const actions = ['view', 'create', 'update', 'delete'];
      const action = actions[Math.floor(Math.random() * actions.length)];

      testLogs.push({
        level: 'info',
        category: 'veterinary',
        action,
        message: `${action} veterinaria - ID: ${Math.floor(Math.random() * 1000)}`,
        userId: user?._id,
        userInfo: user ? {
          email: user.email,
          name: user.name,
          role: user.role
        } : null,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        method: action === 'view' ? 'GET' : action === 'create' ? 'POST' : action === 'update' ? 'PUT' : 'DELETE',
        url: `/api/veterinaries/${action === 'view' ? '' : Math.floor(Math.random() * 1000)}`,
        statusCode: 200,
        responseTime: Math.floor(Math.random() * 400) + 40,
        resources: [{
          type: 'veterinary',
          id: new mongoose.Types.ObjectId(),
          action
        }],
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
    }

    // Insertar logs en lotes para mejor rendimiento
    const batchSize = 50;
    for (let i = 0; i < testLogs.length; i += batchSize) {
      const batch = testLogs.slice(i, i + batchSize);
      await Log.insertMany(batch);
      console.log(`📝 Insertados ${Math.min(i + batchSize, testLogs.length)} logs...`);
    }

    console.log(`✅ ${testLogs.length} logs de prueba generados exitosamente`);

  } catch (error) {
    console.error('❌ Error generando logs de prueba:', error);
    throw error;
  }
}

// Función para mostrar estadísticas
async function showLogStatistics() {
  try {
    const stats = await Log.getLogStats();
    
    console.log('\n📊 Estadísticas de Logs:');
    console.log(`   Total de logs: ${stats.totalLogs}`);
    console.log(`   Errores: ${stats.errorCount} (${stats.errorPercentage}%)`);
    console.log('\n   Logs por nivel:');
    stats.logsByLevel.forEach(level => {
      console.log(`     ${level._id}: ${level.count}`);
    });
    
    console.log('\n   Logs por categoría:');
    stats.logsByCategory.forEach(category => {
      console.log(`     ${category._id}: ${category.count}`);
    });

    console.log('\n   Usuarios más activos:');
    stats.topUsers.forEach(user => {
      console.log(`     ${user.userInfo?.name || 'Usuario'}: ${user.count} acciones`);
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
  }
}

// Función principal
async function seedLogs() {
  try {
    console.log('🚀 Iniciando generación de logs de prueba...\n');
    
    await connectDB();
    await generateTestLogs();
    await showLogStatistics();
    
    console.log('\n✅ Generación de logs de prueba completada!');
    console.log('\n💡 Los logs incluyen:');
    console.log('   - Logs de autenticación (login/logout)');
    console.log('   - Logs de operaciones CRUD de usuarios');
    console.log('   - Logs de gestión de permisos');
    console.log('   - Logs de errores del sistema');
    console.log('   - Logs de operaciones de veterinarias');
    
  } catch (error) {
    console.error('❌ Error en la generación de logs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
if (require.main === module) {
  seedLogs();
}

module.exports = { seedLogs }; 