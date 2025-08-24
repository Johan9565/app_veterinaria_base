const Pet = require('../models/Pet');
const User = require('../models/User');
const Veterinary = require('../models/Veterinary');
const { logCRUDActivity } = require('../middleware/logging');
const cloudinaryService = require('../services/cloudinaryService');

// Obtener todas las mascotas (con filtros)
const getAllPets = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      species, 
      owner, 
      veterinary,
      healthStatus 
    } = req.query;

    const filters = {};
    
    if (species) filters.species = species;
    if (owner) filters.owner = owner;
    if (veterinary) filters.veterinary = veterinary;
    if (healthStatus) filters.healthStatus = healthStatus;

    const pets = await Pet.searchPets(search, filters)
      .populate('owner', 'name email phone')
      .populate('veterinary', 'name address')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Pet.countDocuments({ isActive: true, ...filters });

    res.json({
      success: true,
      data: {
        pets,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPets: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ getAllPets - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo mascotas',
      error: error.message
    });
  }
};

// Obtener mascota por ID
const getPetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pet = await Pet.findById(id)
      .populate('owner', 'name email phone')
      .populate('veterinary', 'name address phone');
    
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }

    res.json({
      success: true,
      data: { pet }
    });
  } catch (error) {
    console.error('❌ getPetById - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo mascota',
      error: error.message
    });
  }
};

// Obtener mascotas del usuario actual
const getUserPets = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    
    const pets = await Pet.getByOwner(userId);
    
    res.json({
      success: true,
      data: { pets }
    });
  } catch (error) {
    console.error('❌ getUserPets - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo mascotas del usuario',
      error: error.message
    });
  }
};

// Obtener mascotas de una veterinaria
const getVeterinaryPets = async (req, res) => {
  try {
    const { veterinaryId } = req.params;
    
    const pets = await Pet.getByVeterinary(veterinaryId);
    
    res.json({
      success: true,
      data: { pets }
    });
  } catch (error) {
    console.error('❌ getVeterinaryPets - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo mascotas de la veterinaria',
      error: error.message
    });
  }
};

// Crear nueva mascota
const createPet = async (req, res) => {
  try {
    const petData = req.body;
    
    // Asignar el propietario desde el token de autenticación si no se especifica
    if (!petData.owner) {
      petData.owner = req.user.id;
    }
    
    // Verificar que el propietario existe
    const owner = await User.findById(petData.owner);
    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Propietario no encontrado'
      });
    }
    
    // Verificar que la veterinaria existe (si se proporciona)
    if (petData.veterinary) {
      const veterinary = await Veterinary.findById(petData.veterinary);
      if (!veterinary) {
        return res.status(404).json({
          success: false,
          message: 'Veterinaria no encontrada'
        });
      }
    }

    const pet = new Pet(petData);
    await pet.save();
    
    await pet.populate('owner', 'name email phone');
    if (pet.veterinary) {
      await pet.populate('veterinary', 'name address');
    }
    
    res.status(201).json({
      success: true,
      message: 'Mascota creada exitosamente',
      data: { pet }
    });
    
    logCRUDActivity('create', 'pet', req.user, req, { id: pet._id, name: pet.name });
  } catch (error) {
    console.error('❌ createPet - Error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Datos de validación incorrectos',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creando mascota',
      error: error.message
    });
  }
};

// Actualizar mascota
const updatePet = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }
    
    // Verificar permisos: solo el propietario o personal de la veterinaria puede editar
    const isOwner = pet.owner.toString() === req.user.id;
    const isVeterinaryStaff = await Veterinary.findOne({
      _id: pet.veterinary,
      'staff.user': req.user.id
    });
    
    if (!isOwner && !isVeterinaryStaff && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para editar esta mascota'
      });
    }
    
    Object.assign(pet, updateData);
    await pet.save();
    
    await pet.populate('owner', 'name email phone');
    await pet.populate('veterinary', 'name address');
    
    res.json({
      success: true,
      message: 'Mascota actualizada exitosamente',
      data: { pet }
    });
    
    logCRUDActivity('update', 'pet', req.user, req, { id: pet._id, name: pet.name });
  } catch (error) {
    console.error('❌ updatePet - Error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Datos de validación incorrectos',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error actualizando mascota',
      error: error.message
    });
  }
};

// Eliminar mascota (soft delete)
const deletePet = async (req, res) => {
  try {
    const { id } = req.params;
    
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }
    
    // Verificar permisos: solo el propietario puede eliminar
    if (pet.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta mascota'
      });
    }
    
    pet.isActive = false;
    await pet.save();
    
    res.json({
      success: true,
      message: 'Mascota eliminada exitosamente'
    });
    
    logCRUDActivity('delete', 'pet', req.user, req, { id: pet._id, name: pet.name });
  } catch (error) {
    console.error('❌ deletePet - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando mascota',
      error: error.message
    });
  }
};

// Agregar registro médico
const addMedicalRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const recordData = req.body;
    
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }
    
    // Verificar permisos: solo personal de la veterinaria puede agregar registros médicos
    const isVeterinaryStaff = await Veterinary.findOne({
      _id: pet.veterinary,
      'staff.user': req.user.id
    });
    
    if (!isVeterinaryStaff && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para agregar registros médicos'
      });
    }
    
    await pet.addMedicalRecord(recordData);
    
    await pet.populate('owner', 'name email phone');
    await pet.populate('veterinary', 'name address');
    
    res.json({
      success: true,
      message: 'Registro médico agregado exitosamente',
      data: { pet }
    });
    
    logCRUDActivity('addMedicalRecord', 'pet', req.user, req, { id: pet._id, name: pet.name });
  } catch (error) {
    console.error('❌ addMedicalRecord - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error agregando registro médico',
      error: error.message
    });
  }
};

// Agregar vacuna
const addVaccination = async (req, res) => {
  try {
    const { id } = req.params;
    const vaccinationData = req.body;
    
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }
    
    // Verificar permisos: solo personal de la veterinaria puede agregar vacunas
    const isVeterinaryStaff = await Veterinary.findOne({
      _id: pet.veterinary,
      'staff.user': req.user.id
    });
    
    if (!isVeterinaryStaff && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para agregar vacunas'
      });
    }
    
    await pet.addVaccination(vaccinationData);
    
    await pet.populate('owner', 'name email phone');
    await pet.populate('veterinary', 'name address');
    
    res.json({
      success: true,
      message: 'Vacuna agregada exitosamente',
      data: { pet }
    });
    
    logCRUDActivity('addVaccination', 'pet', req.user, req, { id: pet._id, name: pet.name });
  } catch (error) {
    console.error('❌ addVaccination - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error agregando vacuna',
      error: error.message
    });
  }
};

// Obtener estadísticas de mascotas
const getPetStats = async (req, res) => {
  try {
    const stats = await Pet.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalPets: { $sum: 1 },
          bySpecies: {
            $push: {
              species: '$species',
              count: 1
            }
          },
          byHealthStatus: {
            $push: {
              status: '$healthStatus',
              count: 1
            }
          },
          averageAge: {
            $avg: {
              $divide: [
                { $subtract: [new Date(), '$birthDate'] },
                365 * 24 * 60 * 60 * 1000
              ]
            }
          }
        }
      }
    ]);

    // Procesar estadísticas
    const result = stats[0] || { totalPets: 0, bySpecies: [], byHealthStatus: [], averageAge: 0 };
    
    // Agrupar por especie
    const speciesStats = {};
    result.bySpecies.forEach(item => {
      speciesStats[item.species] = (speciesStats[item.species] || 0) + item.count;
    });
    
    // Agrupar por estado de salud
    const healthStats = {};
    result.byHealthStatus.forEach(item => {
      healthStats[item.status] = (healthStats[item.status] || 0) + item.count;
    });

    res.json({
      success: true,
      data: {
        totalPets: result.totalPets,
        bySpecies: speciesStats,
        byHealthStatus: healthStats,
        averageAge: Math.round(result.averageAge * 10) / 10
      }
    });
  } catch (error) {
    console.error('❌ getPetStats - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
};

// Subir imagen de mascota
const uploadPetImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la mascota existe
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }

    // Verificar que el usuario tiene permisos para esta mascota
    if (req.user.role !== 'admin' && req.user.role !== 'veterinario') {
      if (pet.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar esta mascota'
        });
      }
    }

    // Verificar que se subió un archivo
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha subido ningún archivo'
      });
    }

    // Validar el archivo
    const validation = cloudinaryService.validateImageFile(req.file);
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    // Subir imagen a Cloudinary
    const uploadResult = await cloudinaryService.uploadPetImage(req.file);

    // Si ya existe una imagen anterior, eliminarla de Cloudinary
    if (pet.photo && pet.photo.publicId) {
      try {
        await cloudinaryService.deleteImage(pet.photo.publicId);
      } catch (deleteError) {
        console.warn('No se pudo eliminar la imagen anterior:', deleteError.message);
      }
    }

    // Actualizar la mascota con la nueva imagen
    pet.photo = {
      url: uploadResult.url,
      publicId: uploadResult.publicId
    };

    await pet.save();

    // Poblar datos relacionados
    await pet.populate('owner', 'name email phone');
    await pet.populate('veterinary', 'name address');

    res.json({
      success: true,
      message: 'Imagen subida exitosamente',
      data: { 
        pet,
        image: {
          url: uploadResult.url,
          publicId: uploadResult.publicId,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          size: uploadResult.size
        }
      }
    });

    logCRUDActivity('uploadPetImage', 'pet', req.user, req, { id: pet._id, name: pet.name });
  } catch (error) {
    console.error('❌ uploadPetImage - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error subiendo imagen',
      error: error.message
    });
  }
};

// Eliminar imagen de mascota
const deletePetImage = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que la mascota existe
    const pet = await Pet.findById(id);
    if (!pet) {
      return res.status(404).json({
        success: false,
        message: 'Mascota no encontrada'
      });
    }

    // Verificar que el usuario tiene permisos para esta mascota
    if (req.user.role !== 'admin' && req.user.role !== 'veterinario') {
      if (pet.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para modificar esta mascota'
        });
      }
    }

    // Verificar que la mascota tiene una imagen
    if (!pet.photo || !pet.photo.publicId) {
      return res.status(400).json({
        success: false,
        message: 'La mascota no tiene una imagen para eliminar'
      });
    }

    // Eliminar imagen de Cloudinary
    await cloudinaryService.deleteImage(pet.photo.publicId);

    // Limpiar datos de imagen en la mascota
    pet.photo = {
      url: null,
      publicId: null
    };

    await pet.save();

    // Poblar datos relacionados
    await pet.populate('owner', 'name email phone');
    await pet.populate('veterinary', 'name address');

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente',
      data: { pet }
    });

    logCRUDActivity('deletePetImage', 'pet', req.user, req, { id: pet._id, name: pet.name });
  } catch (error) {
    console.error('❌ deletePetImage - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando imagen',
      error: error.message
    });
  }
};

module.exports = {
  getAllPets,
  getPetById,
  getUserPets,
  getVeterinaryPets,
  createPet,
  updatePet,
  deletePet,
  addMedicalRecord,
  addVaccination,
  getPetStats,
  uploadPetImage,
  deletePetImage
}; 