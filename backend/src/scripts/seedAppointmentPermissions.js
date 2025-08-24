const mongoose = require('mongoose');
const Permission = require('../models/Permission');
require('dotenv').config();

const appointmentPermissions = [
  {
    name: 'appointments.read',
    description: 'Ver citas y sus detalles',
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
    name: 'appointments.update',
    description: 'Actualizar citas existentes',
    category: 'appointments',
    action: 'edit'
  },
  {
    name: 'appointments.delete',
    description: 'Eliminar citas',
    category: 'appointments',
    action: 'delete'
  },
  {
    name: 'appointments.manage',
    description: 'Gestionar todas las citas (incluye crear, editar, eliminar)',
    category: 'appointments',
    action: 'manage_staff'
  },
  {
    name: 'appointments.stats',
    description: 'Ver estadísticas de citas',
    category: 'appointments',
    action: 'stats'
  }
];

const seedAppointmentPermissions = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/veterinaria', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');

    // Verificar si ya existen los permisos
    const existingPermissions = await Permission.find({
      name: { $in: appointmentPermissions.map(p => p.name) }
    });

    if (existingPermissions.length > 0) {
      console.log('⚠️  Algunos permisos de citas ya existen:');
      existingPermissions.forEach(perm => {
        console.log(`   - ${perm.name}`);
      });
    }

    // Crear permisos que no existen
    const permissionsToCreate = appointmentPermissions.filter(
      perm => !existingPermissions.find(existing => existing.name === perm.name)
    );

    if (permissionsToCreate.length === 0) {
      console.log('✅ Todos los permisos de citas ya existen');
      return;
    }

    // Insertar permisos
    const createdPermissions = await Permission.insertMany(permissionsToCreate);

    console.log('✅ Permisos de citas creados exitosamente:');
    createdPermissions.forEach(perm => {
      console.log(`   - ${perm.name}: ${perm.description}`);
    });

    console.log(`\n📊 Resumen:`);
    console.log(`   - Permisos existentes: ${existingPermissions.length}`);
    console.log(`   - Permisos creados: ${createdPermissions.length}`);
    console.log(`   - Total de permisos de citas: ${existingPermissions.length + createdPermissions.length}`);

  } catch (error) {
    console.error('❌ Error creando permisos de citas:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
};

// Ejecutar el script
if (require.main === module) {
  seedAppointmentPermissions();
}

module.exports = seedAppointmentPermissions;
