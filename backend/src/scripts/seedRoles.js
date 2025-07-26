const mongoose = require('mongoose');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
require('dotenv').config();

// Configuración de roles del sistema
const systemRoles = [
  {
    name: 'admin',
    displayName: 'Administrador',
    description: 'Rol con acceso completo a todas las funcionalidades del sistema',
    isSystem: true,
    priority: 100,
    permissions: [] // Se llenará con todos los permisos disponibles
  },
  {
    name: 'veterinario',
    displayName: 'Veterinario',
    description: 'Rol para profesionales veterinarios con acceso a gestión de mascotas y citas',
    isSystem: true,
    priority: 50,
    permissions: [
      'pets.view',
      'pets.edit',
      'appointments.view',
      'appointments.create',
      'appointments.edit',
      'reports.view',
      'reports.create',
      'veterinaries.view',
      'veterinaries.edit',
      'veterinaries.manage_staff'
    ]
  },
  {
    name: 'cliente',
    displayName: 'Cliente',
    description: 'Rol para clientes con acceso básico a sus mascotas y citas',
    isSystem: true,
    priority: 10,
    permissions: [
      'pets.view',
      'pets.create',
      'appointments.view',
      'appointments.create',
      'veterinaries.view'
    ]
  },
  {
    name: 'asistente',
    displayName: 'Asistente Veterinario',
    description: 'Rol para asistentes veterinarios con permisos limitados',
    isSystem: true,
    priority: 30,
    permissions: [
      'pets.view',
      'appointments.view',
      'appointments.create',
      'appointments.edit',
      'veterinaries.view'
    ]
  },
  {
    name: 'recepcionista',
    displayName: 'Recepcionista',
    description: 'Rol para recepcionistas con acceso a citas y clientes',
    isSystem: true,
    priority: 20,
    permissions: [
      'pets.view',
      'appointments.view',
      'appointments.create',
      'appointments.edit',
      'veterinaries.view'
    ]
  }
];

async function seedRoles() {
  try {
    console.log('🌱 Iniciando seed de roles...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/veterinaria', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');

    // Obtener todos los permisos disponibles para el rol admin
    const allPermissions = await Permission.getAllPermissionNames();
    console.log(`📋 Permisos disponibles: ${allPermissions.length}`);

    // Actualizar el rol admin con todos los permisos
    const adminRole = systemRoles.find(role => role.name === 'admin');
    if (adminRole) {
      adminRole.permissions = allPermissions;
    }

    // Crear o actualizar roles del sistema
    for (const roleData of systemRoles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      
      if (existingRole) {
        // Actualizar rol existente
        existingRole.displayName = roleData.displayName;
        existingRole.description = roleData.description;
        existingRole.permissions = roleData.permissions;
        existingRole.priority = roleData.priority;
        existingRole.isSystem = roleData.isSystem;
        existingRole.isActive = true;
        
        await existingRole.save();
        console.log(`🔄 Rol actualizado: ${roleData.displayName}`);
      } else {
        // Crear nuevo rol
        const newRole = new Role(roleData);
        await newRole.save();
        console.log(`✅ Rol creado: ${roleData.displayName}`);
      }
    }

    // Mostrar resumen
    const totalRoles = await Role.countDocuments();
    const systemRolesCount = await Role.countDocuments({ isSystem: true });
    const customRolesCount = await Role.countDocuments({ isSystem: false });

    console.log('\n📊 Resumen de roles:');
    console.log(`   Total: ${totalRoles}`);
    console.log(`   Sistema: ${systemRolesCount}`);
    console.log(`   Personalizados: ${customRolesCount}`);

    // Mostrar roles creados
    const roles = await Role.find().sort({ priority: -1, name: 1 });
    console.log('\n📋 Roles disponibles:');
    roles.forEach(role => {
      console.log(`   ${role.isSystem ? '🔧' : '👤'} ${role.displayName} (${role.name}) - ${role.permissions.length} permisos`);
    });

    console.log('\n✅ Seed de roles completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante el seed de roles:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedRoles();
}

module.exports = seedRoles; 