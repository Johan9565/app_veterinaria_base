const mongoose = require('mongoose');
const Permission = require('../models/Permission');
require('dotenv').config();

const veterinaryPermissions = [
  {
    name: 'veterinaries.create',
    description: 'Crear nuevas veterinarias',
    category: 'veterinaries',
    action: 'create',
    isActive: true
  },
  {
    name: 'veterinaries.view',
    description: 'Ver veterinarias',
    category: 'veterinaries',
    action: 'view',
    isActive: true
  },
  {
    name: 'veterinaries.update',
    description: 'Actualizar veterinarias',
    category: 'veterinaries',
    action: 'update',
    isActive: true
  },
  {
    name: 'veterinaries.delete',
    description: 'Eliminar veterinarias',
    category: 'veterinaries',
    action: 'delete',
    isActive: true
  },
  {
    name: 'veterinaries.manage_staff',
    description: 'Gestionar personal de veterinarias',
    category: 'veterinaries',
    action: 'manage_staff',
    isActive: true
  },
  {
    name: 'veterinaries.stats',
    description: 'Ver estadísticas de veterinarias',
    category: 'veterinaries',
    action: 'stats',
    isActive: true
  },
  {
    name: 'veterinaries.verify',
    description: 'Verificar veterinarias',
    category: 'veterinaries',
    action: 'verify',
    isActive: true
  }
];

async function seedVeterinaryPermissions() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/veterinaria', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Conectado a MongoDB');

    console.log('🌱 Iniciando seed de permisos de veterinarias...');

    for (const permissionData of veterinaryPermissions) {
      const existingPermission = await Permission.findOne({ name: permissionData.name });
      
      if (existingPermission) {
        console.log(`⚠️  Permiso ${permissionData.name} ya existe, actualizando...`);
        await Permission.findByIdAndUpdate(existingPermission._id, permissionData, { new: true });
      } else {
        console.log(`➕ Creando permiso: ${permissionData.name}`);
        const permission = new Permission(permissionData);
        await permission.save();
      }
    }

    console.log('✅ Permisos de veterinarias creados/actualizados exitosamente');
    
    // Mostrar permisos creados
    const allVeterinaryPermissions = await Permission.find({ category: 'veterinaries' });
    console.log('\n📋 Permisos de veterinarias disponibles:');
    allVeterinaryPermissions.forEach(perm => {
      console.log(`  - ${perm.name}: ${perm.description}`);
    });

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  seedVeterinaryPermissions();
}

module.exports = seedVeterinaryPermissions; 