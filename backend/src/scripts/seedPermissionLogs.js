const mongoose = require('mongoose');
const Log = require('../models/Log');
const User = require('../models/User');
const Permission = require('../models/Permission');

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

// Función para generar logs de permisos de prueba
async function generatePermissionLogs() {
  try {
    console.log('🚀 Generando logs de permisos de prueba...');

    // Obtener algunos usuarios para asociar con los logs
    const users = await User.find().limit(5);
    
    if (users.length === 0) {
      console.log('⚠️ No hay usuarios en la base de datos. Creando logs sin usuarios...');
    }

    // Obtener permisos disponibles
    const permissions = await Permission.find({ isActive: true });
    const permissionNames = permissions.map(p => p.name);

    const permissionLogs = [];

    // Logs de consulta de permisos
    for (let i = 0; i < 40; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const actions = ['get_all_permissions', 'get_permissions_by_category', 'get_permissions_by_action', 'validate_permission'];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      permissionLogs.push({
        level: 'info',
        category: 'permission',
        action: action,
        message: `Consulta de permisos - ${action}`,
        userId: user?._id,
        userInfo: user ? {
          email: user.email,
          name: user.name,
          role: user.role
        } : null,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        method: 'GET',
        url: '/api/permissions',
        statusCode: 200,
        responseTime: Math.floor(Math.random() * 200) + 30,
        metadata: {
          success: true,
          action: action,
          totalPermissions: Math.floor(Math.random() * 50) + 10
        },
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Últimos 7 días
      });
    }

    // Logs de asignación de permisos
    for (let i = 0; i < 25; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const targetUser = users[Math.floor(Math.random() * users.length)];
      
      if (user && targetUser) {
        const numPermissions = Math.floor(Math.random() * 8) + 2;
        const assignedPermissions = permissionNames.slice(0, numPermissions);
        const previousPermissions = permissionNames.slice(numPermissions, numPermissions + Math.floor(Math.random() * 5));
        
        permissionLogs.push({
          level: 'info',
          category: 'permission',
          action: 'assign_permissions_to_user',
          message: `Asignación de permisos - ${assignedPermissions.length} permisos asignados`,
          userId: user._id,
          userInfo: {
            email: user.email,
            name: user.name,
            role: user.role
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          method: 'PUT',
          url: `/api/permissions/user/${targetUser._id}`,
          statusCode: 200,
          responseTime: Math.floor(Math.random() * 300) + 100,
          metadata: {
            success: true,
            action: 'assign_permissions_to_user',
            targetUserId: targetUser._id,
            targetUserEmail: targetUser.email,
            targetUserRole: targetUser.role,
            previousPermissions: previousPermissions,
            newPermissions: assignedPermissions,
            permissionsAdded: assignedPermissions.filter(p => !previousPermissions.includes(p)),
            permissionsRemoved: previousPermissions.filter(p => !assignedPermissions.includes(p))
          },
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }
    }

    // Logs de reseteo de permisos
    for (let i = 0; i < 15; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const targetUser = users[Math.floor(Math.random() * users.length)];
      
      if (user && targetUser) {
        const defaultPermissions = await User.getDefaultPermissions(targetUser.role);
        const previousPermissions = permissionNames.slice(0, Math.floor(Math.random() * 10) + 5);
        
        permissionLogs.push({
          level: 'info',
          category: 'permission',
          action: 'reset_user_permissions',
          message: `Reseteo de permisos - permisos restaurados a valores por defecto`,
          userId: user._id,
          userInfo: {
            email: user.email,
            name: user.name,
            role: user.role
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          method: 'POST',
          url: `/api/permissions/user/${targetUser._id}/reset`,
          statusCode: 200,
          responseTime: Math.floor(Math.random() * 200) + 50,
          metadata: {
            success: true,
            action: 'reset_user_permissions',
            targetUserId: targetUser._id,
            targetUserEmail: targetUser.email,
            targetUserRole: targetUser.role,
            previousPermissions: previousPermissions,
            newPermissions: defaultPermissions,
            permissionsRemoved: previousPermissions.filter(p => !defaultPermissions.includes(p)),
            permissionsAdded: defaultPermissions.filter(p => !previousPermissions.includes(p))
          },
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }
    }

    // Logs de consulta de permisos de usuario específico
    for (let i = 0; i < 30; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const targetUser = users[Math.floor(Math.random() * users.length)];
      
      if (user && targetUser) {
        permissionLogs.push({
          level: 'info',
          category: 'permission',
          action: 'get_user_permissions',
          message: `Consulta de permisos de usuario - ${targetUser.email}`,
          userId: user._id,
          userInfo: {
            email: user.email,
            name: user.name,
            role: user.role
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          method: 'GET',
          url: `/api/permissions/user/${targetUser._id}`,
          statusCode: 200,
          responseTime: Math.floor(Math.random() * 150) + 20,
          metadata: {
            success: true,
            action: 'get_user_permissions',
            targetUserId: targetUser._id,
            targetUserRole: targetUser.role,
            userPermissionsCount: targetUser.permissions.length,
            hasCustomPermissions: Math.random() > 0.5
          },
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }
    }

    // Logs de errores de permisos
    for (let i = 0; i < 10; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const errorTypes = ['user_not_found', 'invalid_permissions', 'insufficient_permissions'];
      const errorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
      
      permissionLogs.push({
        level: 'error',
        category: 'permission',
        action: 'permission_error',
        message: `Error en operación de permisos - ${errorType}`,
        userId: user?._id,
        userInfo: user ? {
          email: user.email,
          name: user.name,
          role: user.role
        } : null,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        method: 'PUT',
        url: '/api/permissions/user/invalid-id',
        statusCode: 404,
        responseTime: Math.floor(Math.random() * 100) + 20,
        metadata: {
          success: false,
          action: 'permission_operation',
          error: errorType,
          reason: errorType
        },
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      });
    }

    // Logs de creación de usuarios con permisos por defecto
    for (let i = 0; i < 8; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const roles = ['cliente', 'veterinario'];
      const role = roles[Math.floor(Math.random() * roles.length)];
      const defaultPermissions = await User.getDefaultPermissions(role);
      
      if (user) {
        permissionLogs.push({
          level: 'info',
          category: 'permission',
          action: 'create_user_with_default_permissions',
          message: `Creación de usuario con permisos por defecto - rol: ${role}`,
          userId: user._id,
          userInfo: {
            email: user.email,
            name: user.name,
            role: user.role
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          method: 'POST',
          url: '/api/users',
          statusCode: 201,
          responseTime: Math.floor(Math.random() * 500) + 200,
          metadata: {
            success: true,
            action: 'create_user_with_default_permissions',
            newUserRole: role,
            assignedPermissions: defaultPermissions,
            permissionsCount: defaultPermissions.length
          },
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
        });
      }
    }

    // Logs de validación de permisos
    for (let i = 0; i < 20; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const permissionToValidate = permissionNames[Math.floor(Math.random() * permissionNames.length)];
      
      if (user) {
        permissionLogs.push({
          level: 'info',
          category: 'permission',
          action: 'validate_permission',
          message: `Validación de permiso - ${permissionToValidate}`,
          userId: user._id,
          userInfo: {
            email: user.email,
            name: user.name,
            role: user.role
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          method: 'GET',
          url: `/api/permissions/validate/${permissionToValidate}`,
          statusCode: 200,
          responseTime: Math.floor(Math.random() * 50) + 10,
          metadata: {
            success: true,
            action: 'validate_permission',
            permission: permissionToValidate,
            isValid: true
          },
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }
    }

    // Logs de estadísticas de permisos
    for (let i = 0; i < 12; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      
      if (user) {
        permissionLogs.push({
          level: 'info',
          category: 'permission',
          action: 'get_permission_stats',
          message: `Consulta de estadísticas de permisos`,
          userId: user._id,
          userInfo: {
            email: user.email,
            name: user.name,
            role: user.role
          },
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          method: 'GET',
          url: '/api/permissions/stats',
          statusCode: 200,
          responseTime: Math.floor(Math.random() * 100) + 30,
          metadata: {
            success: true,
            action: 'get_permission_stats',
            totalPermissions: Math.floor(Math.random() * 100) + 50,
            categories: ['users', 'permissions', 'veterinary', 'logs'],
            actions: ['view', 'create', 'edit', 'delete', 'assign']
          },
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }
    }

    // Insertar logs en lotes para mejor rendimiento
    const batchSize = 50;
    for (let i = 0; i < permissionLogs.length; i += batchSize) {
      const batch = permissionLogs.slice(i, i + batchSize);
      await Log.insertMany(batch);
      console.log(`📝 Insertados ${Math.min(i + batchSize, permissionLogs.length)} logs de permisos...`);
    }

    console.log(`✅ ${permissionLogs.length} logs de permisos generados exitosamente`);

  } catch (error) {
    console.error('❌ Error generando logs de permisos:', error);
    throw error;
  }
}

// Función para mostrar estadísticas de logs de permisos
async function showPermissionLogStatistics() {
  try {
    const stats = await Log.aggregate([
      { $match: { category: 'permission' } },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    console.log('\n📊 Estadísticas de Logs de Permisos:');
    stats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} logs`);
    });

    // Contar logs por nivel
    const levelStats = await Log.aggregate([
      { $match: { category: 'permission' } },
      { $group: { _id: '$level', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n   Logs por nivel:');
    levelStats.forEach(stat => {
      console.log(`     ${stat._id}: ${stat.count} logs`);
    });

    // Contar operaciones exitosas vs fallidas
    const successStats = await Log.aggregate([
      { $match: { category: 'permission' } },
      { $group: { _id: '$metadata.success', count: { $sum: 1 } } }
    ]);

    console.log('\n   Operaciones por resultado:');
    successStats.forEach(stat => {
      const status = stat._id ? 'Exitosas' : 'Fallidas';
      console.log(`     ${status}: ${stat.count} logs`);
    });

    // Mostrar usuarios más activos en gestión de permisos
    const activeUsers = await Log.aggregate([
      { $match: { category: 'permission' } },
      { $group: { _id: '$userInfo.email', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    console.log('\n   Usuarios más activos en gestión de permisos:');
    activeUsers.forEach((user, index) => {
      console.log(`     ${index + 1}. ${user._id}: ${user.count} operaciones`);
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
  }
}

// Función principal
async function seedPermissionLogs() {
  try {
    console.log('🚀 Iniciando generación de logs de permisos...\n');
    
    await connectDB();
    await generatePermissionLogs();
    await showPermissionLogStatistics();
    
    console.log('\n✅ Generación de logs de permisos completada!');
    console.log('\n💡 Los logs incluyen:');
    console.log('   - Consultas de permisos (listar, por categoría, por acción)');
    console.log('   - Asignación de permisos a usuarios');
    console.log('   - Reseteo de permisos a valores por defecto');
    console.log('   - Consulta de permisos de usuarios específicos');
    console.log('   - Creación de usuarios con permisos por defecto');
    console.log('   - Errores en operaciones de permisos');
    console.log('   - Validación de permisos');
    console.log('   - Estadísticas de permisos');
    
  } catch (error) {
    console.error('❌ Error en la generación de logs de permisos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
if (require.main === module) {
  seedPermissionLogs();
}

module.exports = { seedPermissionLogs }; 