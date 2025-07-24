const mongoose = require('mongoose');
const Permission = require('../models/Permission');
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

// Función para limpiar permisos existentes
async function clearPermissions() {
  try {
    await Permission.deleteMany({});
    console.log('🗑️ Permisos existentes eliminados');
  } catch (error) {
    console.error('❌ Error eliminando permisos:', error);
  }
}

// Función para crear permisos iniciales
async function createInitialPermissions() {
  try {
    const permissions = [
      // Permisos de usuarios
      {
        name: 'users.view',
        description: 'Ver usuarios del sistema',
        category: 'users',
        action: 'view'
      },
      {
        name: 'users.create',
        description: 'Crear nuevos usuarios',
        category: 'users',
        action: 'create'
      },
      {
        name: 'users.edit',
        description: 'Editar usuarios existentes',
        category: 'users',
        action: 'edit'
      },
      {
        name: 'users.delete',
        description: 'Eliminar usuarios',
        category: 'users',
        action: 'delete'
      },

      // Permisos de mascotas
      {
        name: 'pets.view',
        description: 'Ver mascotas',
        category: 'pets',
        action: 'view'
      },
      {
        name: 'pets.create',
        description: 'Crear nuevas mascotas',
        category: 'pets',
        action: 'create'
      },
      {
        name: 'pets.edit',
        description: 'Editar mascotas existentes',
        category: 'pets',
        action: 'edit'
      },
      {
        name: 'pets.delete',
        description: 'Eliminar mascotas',
        category: 'pets',
        action: 'delete'
      },

      // Permisos de citas
      {
        name: 'appointments.view',
        description: 'Ver citas',
        category: 'appointments',
        action: 'view'
      },
      {
        name: 'appointments.create',
        description: 'Crear nuevas citas',
        category: 'appointments',
        action: 'create'
      },
      {
        name: 'appointments.edit',
        description: 'Editar citas existentes',
        category: 'appointments',
        action: 'edit'
      },
      {
        name: 'appointments.delete',
        description: 'Eliminar citas',
        category: 'appointments',
        action: 'delete'
      },

      // Permisos de permisos
      {
        name: 'permissions.view',
        description: 'Ver permisos del sistema',
        category: 'permissions',
        action: 'view'
      },
      {
        name: 'permissions.assign',
        description: 'Asignar permisos a usuarios',
        category: 'permissions',
        action: 'assign'
      },

      // Permisos de reportes
      {
        name: 'reports.view',
        description: 'Ver reportes',
        category: 'reports',
        action: 'view'
      },
      {
        name: 'reports.create',
        description: 'Crear reportes',
        category: 'reports',
        action: 'create'
      },

      // Permisos de configuración
      {
        name: 'settings.view',
        description: 'Ver configuración del sistema',
        category: 'settings',
        action: 'view'
      },
      {
        name: 'settings.edit',
        description: 'Editar configuración del sistema',
        category: 'settings',
        action: 'edit'
      }
    ];

    const createdPermissions = await Permission.insertMany(permissions);
    console.log(`✅ ${createdPermissions.length} permisos creados exitosamente`);

    // Mostrar información de los permisos creados
    createdPermissions.forEach(permission => {
      console.log(`🔑 ${permission.name} - ${permission.description}`);
    });

    return createdPermissions;
  } catch (error) {
    console.error('❌ Error creando permisos:', error);
    throw error;
  }
}

// Función para actualizar usuarios existentes con permisos por defecto
async function updateUsersWithDefaultPermissions() {
  try {
    const users = await User.find({});
    let updatedCount = 0;

    for (const user of users) {
      const defaultPermissions = await User.getDefaultPermissions(user.role);
      user.permissions = defaultPermissions;
      await user.save();
      updatedCount++;
    }

    console.log(`✅ ${updatedCount} usuarios actualizados con permisos por defecto`);
  } catch (error) {
    console.error('❌ Error actualizando usuarios:', error);
  }
}

// Función para mostrar estadísticas
async function showStatistics() {
  try {
    const totalPermissions = await Permission.countDocuments();
    const totalUsers = await User.countDocuments();
    const stats = await Permission.getStats();

    console.log('\n📊 Estadísticas de la Base de Datos:');
    console.log(`   Total de permisos: ${totalPermissions}`);
    console.log(`   Total de usuarios: ${totalUsers}`);
    console.log(`   Permisos por categoría:`);
    
    stats.byCategory.forEach(category => {
      console.log(`     ${category._id}: ${category.count} permisos`);
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
  }
}

// Función principal
async function seedPermissions() {
  try {
    console.log('🚀 Iniciando seed de permisos...\n');
    
    await connectDB();
    await clearPermissions();
    await createInitialPermissions();
    await updateUsersWithDefaultPermissions();
    await showStatistics();
    
    console.log('\n✅ Seed de permisos completado exitosamente!');
    console.log('\n💡 Para agregar nuevos permisos, inserta directamente en la base de datos:');
    console.log('   db.permissions.insertOne({');
    console.log('     name: "nuevo.permiso",');
    console.log('     description: "Descripción del nuevo permiso",');
    console.log('     category: "categoria",');
    console.log('     action: "accion",');
    console.log('     isActive: true');
    console.log('   })');
    
  } catch (error) {
    console.error('❌ Error en el seed de permisos:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
if (require.main === module) {
  seedPermissions();
}

module.exports = { seedPermissions }; 