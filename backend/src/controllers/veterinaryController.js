const Veterinary = require('../models/Veterinary');
const User = require('../models/User');

// Obtener todas las veterinarias (con paginación y filtros)
const getAllVeterinaries = async (req, res) => {
  try {
    console.log('🔍 getAllVeterinaries - Iniciando...');
    const { 
      page = 1, 
      limit = 10, 
      search, 
      city, 
      state, 
      service, 
      isActive,
      emergencyAvailable,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;
    
    // Construir filtros
    const filters = {};
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (emergencyAvailable !== undefined) filters.emergencyAvailable = emergencyAvailable === 'true';
    if (city) filters.city = { $regex: city, $options: 'i' };
    if (state) filters.state = { $regex: state, $options: 'i' };
    if (service) filters.services = service;
    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { specialties: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const veterinaries = await Veterinary.find(filters)
      .populate('owner', 'name email')
      .populate('staff.user', 'name email role')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Veterinary.countDocuments(filters);

    console.log('🔍 getAllVeterinaries - Veterinarias obtenidas:', veterinaries.length);
    
    res.json({
      success: true,
      data: {
        veterinaries,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('❌ getAllVeterinaries - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo veterinarias',
      error: error.message
    });
  }
};

// Obtener veterinaria por ID
const getVeterinaryById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 getVeterinaryById - Buscando veterinaria:', id);
    
    const veterinary = await Veterinary.findById(id)
      .populate('owner', 'name email phone')
      .populate('staff.user', 'name email role phone');
    
    if (!veterinary) {
      return res.status(404).json({
        success: false,
        message: 'Veterinaria no encontrada'
      });
    }

    console.log('🔍 getVeterinaryById - Veterinaria encontrada:', veterinary.name);
    
    res.json({
      success: true,
      data: { veterinary }
    });
  } catch (error) {
    console.error('❌ getVeterinaryById - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo veterinaria',
      error: error.message
    });
  }
};

// Crear nueva veterinaria
const createVeterinary = async (req, res) => {
  try {
    console.log('🔍 createVeterinary - Iniciando creación...');
    const veterinaryData = req.body;
    
    // Asignar el propietario desde el token de autenticación
    veterinaryData.owner = req.user.id;
    
    // Validar que el email no exista
    const existingVeterinary = await Veterinary.findOne({ email: veterinaryData.email });
    if (existingVeterinary) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una veterinaria con ese email'
      });
    }

    const veterinary = new Veterinary(veterinaryData);
    await veterinary.save();
    
    // Poblar datos del propietario
    await veterinary.populate('owner', 'name email');
    
    console.log('🔍 createVeterinary - Veterinaria creada:', veterinary.name);
    
    res.status(201).json({
      success: true,
      message: 'Veterinaria creada exitosamente',
      data: { veterinary }
    });
  } catch (error) {
    console.error('❌ createVeterinary - Error:', error);
    
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
      message: 'Error creando veterinaria',
      error: error.message
    });
  }
};

// Actualizar veterinaria
const updateVeterinary = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    console.log('🔍 updateVeterinary - Actualizando veterinaria:', id);
    
    // Verificar que la veterinaria existe
    const veterinary = await Veterinary.findById(id);
    if (!veterinary) {
      return res.status(404).json({
        success: false,
        message: 'Veterinaria no encontrada'
      });
    }
    
    // Verificar permisos (solo propietario o admin puede actualizar)
    if (veterinary.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para actualizar esta veterinaria'
      });
    }
    
    // Si se está actualizando el email, verificar que no exista
    if (updateData.email && updateData.email !== veterinary.email) {
      const existingVeterinary = await Veterinary.findOne({ email: updateData.email });
      if (existingVeterinary) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una veterinaria con ese email'
        });
      }
    }
    
    const updatedVeterinary = await Veterinary.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');
    
    console.log('🔍 updateVeterinary - Veterinaria actualizada:', updatedVeterinary.name);
    
    res.json({
      success: true,
      message: 'Veterinaria actualizada exitosamente',
      data: { veterinary: updatedVeterinary }
    });
  } catch (error) {
    console.error('❌ updateVeterinary - Error:', error);
    
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
      message: 'Error actualizando veterinaria',
      error: error.message
    });
  }
};

// Eliminar veterinaria (soft delete)
const deleteVeterinary = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 deleteVeterinary - Eliminando veterinaria:', id);
    
    const veterinary = await Veterinary.findById(id);
    if (!veterinary) {
      return res.status(404).json({
        success: false,
        message: 'Veterinaria no encontrada'
      });
    }
    
    // Verificar permisos
    if (veterinary.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta veterinaria'
      });
    }
    
    // Soft delete - marcar como inactiva
    veterinary.isActive = false;
    await veterinary.save();
    
    console.log('🔍 deleteVeterinary - Veterinaria eliminada:', veterinary.name);
    
    res.json({
      success: true,
      message: 'Veterinaria eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ deleteVeterinary - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando veterinaria',
      error: error.message
    });
  }
};

// Buscar veterinarias cercanas
const findNearbyVeterinaries = async (req, res) => {
  try {
    const { lat, lng, distance = 10000 } = req.query;
    console.log('🔍 findNearbyVeterinaries - Buscando cerca de:', lat, lng);
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren coordenadas de latitud y longitud'
      });
    }
    
    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const veterinaries = await Veterinary.findNearby(coordinates, parseInt(distance))
      .populate('owner', 'name email')
      .limit(20);
    
    console.log('🔍 findNearbyVeterinaries - Veterinarias encontradas:', veterinaries.length);
    
    res.json({
      success: true,
      data: {
        veterinaries,
        total: veterinaries.length,
        coordinates: { lat, lng },
        maxDistance: distance
      }
    });
  } catch (error) {
    console.error('❌ findNearbyVeterinaries - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error buscando veterinarias cercanas',
      error: error.message
    });
  }
};

// Buscar por servicios
const findVeterinariesByService = async (req, res) => {
  try {
    const { service } = req.params;
    console.log('🔍 findVeterinariesByService - Buscando servicio:', service);
    
    const veterinaries = await Veterinary.findByService(service)
      .populate('owner', 'name email')
      .sort({ rating: -1 });
    
    console.log('🔍 findVeterinariesByService - Veterinarias encontradas:', veterinaries.length);
    
    res.json({
      success: true,
      data: {
        service,
        veterinaries,
        total: veterinaries.length
      }
    });
  } catch (error) {
    console.error('❌ findVeterinariesByService - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error buscando veterinarias por servicio',
      error: error.message
    });
  }
};

// Obtener veterinarias del usuario
const getUserVeterinaries = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.id;
    console.log('🔍 getUserVeterinaries - Buscando veterinarias del usuario:', userId);

    let veterinaries;
    const permissions = req.user.permissions || [];

    // Buscar veterinarias donde el usuario es propietario O está en el staff
    if (permissions.includes('veterinaries.view')) {
      veterinaries = await Veterinary.find({})
        .populate('staff.user', 'name email role')
        .populate('owner', 'name email role')
        .sort({ createdAt: -1 });
    } else {
      veterinaries = await Veterinary.find({
        $or: [
          { owner: userId },
          { 'staff.user': userId }
        ]
      })
        .populate('staff.user', 'name email role')
        .populate('owner', 'name email role')
        .sort({ createdAt: -1 });
    }
    
    
    console.log('🔍 getUserVeterinaries - Veterinarias encontradas:', veterinaries.length);
    
    // Agregar información del rol del usuario en cada veterinaria
    const veterinariesWithUserRole = veterinaries.map(veterinary => {
      const veterinaryObj = veterinary.toObject();
      
      // Verificar si es propietario
      if (veterinary.owner && veterinary.owner._id.toString() === userId) {
        veterinaryObj.userRole = 'owner';
      } else {
        // Buscar en el staff
        const staffMember = veterinary.staff.find(member => 
          member.user && member.user._id.toString() === userId
        );
        veterinaryObj.userRole = staffMember ? staffMember.role : null;
      }
      
      return veterinaryObj;
    });
    
    res.json({
      success: true,
      data: {
        veterinaries: veterinariesWithUserRole,
        total: veterinaries.length
      }
    });
  } catch (error) {
    console.error('❌ getUserVeterinaries - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo veterinarias del usuario',
      error: error.message
    });
  }
};

// Agregar personal a la veterinaria
const addStaffMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    console.log('🔍 addStaffMember - Agregando personal a veterinaria:', id);
    
    const veterinary = await Veterinary.findById(id);
    if (!veterinary) {
      return res.status(404).json({
        success: false,
        message: 'Veterinaria no encontrada'
      });
    }
    
    // Verificar permisos
    if (veterinary.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para agregar personal a esta veterinaria'
      });
    }
    
    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar que no esté ya en el personal
    const existingStaff = veterinary.staff.find(staff => staff.user.toString() === userId);
    if (existingStaff) {
      return res.status(400).json({
        success: false,
        message: 'El usuario ya es parte del personal de esta veterinaria'
      });
    }
    
    veterinary.staff.push({ user: userId, role });
    await veterinary.save();
    
    await veterinary.populate('staff.user', 'name email role');
    
    console.log('🔍 addStaffMember - Personal agregado exitosamente');
    
    res.json({
      success: true,
      message: 'Personal agregado exitosamente',
      data: { veterinary }
    });
  } catch (error) {
    console.error('❌ addStaffMember - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error agregando personal',
      error: error.message
    });
  }
};

// Remover personal de la veterinaria
const removeStaffMember = async (req, res) => {
  try {
    const { id, staffId } = req.params;
    console.log('🔍 removeStaffMember - Removiendo personal:', staffId);
    
    const veterinary = await Veterinary.findById(id);
    if (!veterinary) {
      return res.status(404).json({
        success: false,
        message: 'Veterinaria no encontrada'
      });
    }
    
    // Verificar permisos
    if (veterinary.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para remover personal de esta veterinaria'
      });
    }
    
    veterinary.staff = veterinary.staff.filter(staff => staff._id.toString() !== staffId);
    await veterinary.save();
    
    await veterinary.populate('staff.user', 'name email role');
    
    console.log('🔍 removeStaffMember - Personal removido exitosamente');
    
    res.json({
      success: true,
      message: 'Personal removido exitosamente',
      data: { veterinary }
    });
  } catch (error) {
    console.error('❌ removeStaffMember - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removiendo personal',
      error: error.message
    });
  }
};

// Obtener estadísticas de veterinarias
const getVeterinaryStats = async (req, res) => {
  try {
    console.log('🔍 getVeterinaryStats - Obteniendo estadísticas...');
    
    const totalVeterinaries = await Veterinary.countDocuments();
    const activeVeterinaries = await Veterinary.countDocuments({ isActive: true });
    const emergencyVeterinaries = await Veterinary.countDocuments({ emergencyAvailable: true });
    const verifiedVeterinaries = await Veterinary.countDocuments({ isVerified: true });
    
    // Veterinarias por ciudad (top 5)
    const topCities = await Veterinary.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$city', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Servicios más populares
    const popularServices = await Veterinary.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$services' },
      { $group: { _id: '$services', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    console.log('🔍 getVeterinaryStats - Estadísticas obtenidas');
    
    res.json({
      success: true,
      data: {
        total: totalVeterinaries,
        active: activeVeterinaries,
        emergency: emergencyVeterinaries,
        verified: verifiedVeterinaries,
        topCities,
        popularServices
      }
    });
  } catch (error) {
    console.error('❌ getVeterinaryStats - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
};

module.exports = {
  getAllVeterinaries,
  getVeterinaryById,
  createVeterinary,
  updateVeterinary,
  deleteVeterinary,
  findNearbyVeterinaries,
  findVeterinariesByService,
  getUserVeterinaries,
  addStaffMember,
  removeStaffMember,
  getVeterinaryStats
}; 