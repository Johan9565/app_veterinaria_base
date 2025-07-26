const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
require('dotenv').config();

async function migrateToPermissionBased() {
  try {
    console.log('🔄 Iniciando migración a sistema basado en permisos...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/veterinaria', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');

    // 1. Verificar que los roles del sistema existan
    console.log('\n📋 Verificando roles del sistema...');
    const systemRoles = await Role.find({ isSystem: true });
    if (systemRoles.length === 0) {
      console.log('⚠️  No se encontraron roles del sistema. Ejecutando seed de roles...');
      const seedRoles = require('./seedRoles');
      await seedRoles();
    }

    // 2. Obtener todos los usuarios
    console.log('\n👥 Migrando usuarios...');
    const users = await User.find({});
    console.log(`📊 Total de usuarios a migrar: ${users.length}`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`\n🔄 Migrando usuario: ${user.email} (rol actual: ${user.role})`);
        
        // Verificar si el rol existe en la base de datos
        const role = await Role.findOne({ name: user.role, isActive: true });
        
        if (!role) {
          console.log(`⚠️  Rol '${user.role}' no encontrado para usuario ${user.email}. Asignando rol 'cliente' por defecto.`);
          
          // Asignar rol cliente por defecto
          const defaultRole = await Role.findOne({ name: 'cliente', isActive: true });
          if (defaultRole) {
            user.role = 'cliente';
            user.permissions = defaultRole.permissions;
          } else {
            console.log(`❌ Error: No se encontró el rol 'cliente' para el usuario ${user.email}`);
            errorCount++;
            continue;
          }
        } else {
          // Si el rol existe, actualizar permisos según el rol
          console.log(`✅ Rol '${user.role}' encontrado. Permisos del rol: ${role.permissions.length}`);
          
          // Si el usuario no tiene permisos personalizados, usar los del rol
          if (user.permissions.length === 0) {
            user.permissions = role.permissions;
            console.log(`📝 Asignando permisos del rol: ${role.permissions.join(', ')}`);
          } else {
            console.log(`📝 Usuario ya tiene permisos personalizados: ${user.permissions.join(', ')}`);
            // Mantener permisos existentes pero verificar que sean válidos
            const validPermissions = [];
            for (const permission of user.permissions) {
              const isValid = await Permission.isValidPermission(permission);
              if (isValid) {
                validPermissions.push(permission);
              } else {
                console.log(`⚠️  Permiso inválido removido: ${permission}`);
              }
            }
            user.permissions = validPermissions;
          }
        }

        // Guardar usuario actualizado
        await user.save();
        console.log(`✅ Usuario migrado exitosamente: ${user.email}`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error migrando usuario ${user.email}:`, error.message);
        errorCount++;
      }
    }

    // 3. Mostrar resumen de migración
    console.log('\n📊 Resumen de migración:');
    console.log(`   ✅ Usuarios migrados exitosamente: ${migratedCount}`);
    console.log(`   ❌ Errores durante migración: ${errorCount}`);
    console.log(`   📋 Total procesados: ${users.length}`);

    // 4. Verificar estado final
    console.log('\n🔍 Verificando estado final...');
    const finalUsers = await User.find({});
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          avgPermissions: { $avg: { $size: '$permissions' } }
        }
      }
    ]);

    console.log('\n📋 Distribución de usuarios por rol:');
    usersByRole.forEach(group => {
      console.log(`   ${group._id}: ${group.count} usuarios (${Math.round(group.avgPermissions)} permisos promedio)`);
    });

    // 5. Verificar permisos
    console.log('\n🔐 Verificando permisos...');
    const allPermissions = await Permission.getAllPermissionNames();
    console.log(`   Permisos disponibles en el sistema: ${allPermissions.length}`);

    const usersWithInvalidPermissions = await User.find({
      permissions: { $exists: true, $ne: [] }
    });

    let invalidPermissionsFound = 0;
    for (const user of usersWithInvalidPermissions) {
      for (const permission of user.permissions) {
        if (!allPermissions.includes(permission)) {
          console.log(`⚠️  Usuario ${user.email} tiene permiso inválido: ${permission}`);
          invalidPermissionsFound++;
        }
      }
    }

    if (invalidPermissionsFound === 0) {
      console.log('✅ Todos los permisos son válidos');
    } else {
      console.log(`⚠️  Se encontraron ${invalidPermissionsFound} permisos inválidos`);
    }

    console.log('\n✅ Migración completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateToPermissionBased();
}

module.exports = migrateToPermissionBased; 