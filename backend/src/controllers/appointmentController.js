const Appointment = require('../models/Appointment');
const Pet = require('../models/Pet');
const User = require('../models/User');
const Veterinary = require('../models/Veterinary');
const { logCRUDActivity } = require('../middleware/logging');

// Obtener todas las citas (con filtros)
const getAllAppointments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      status, 
      type, 
      veterinary,
      veterinarian,
      owner,
      date,
      priority
    } = req.query;

    const filters = {};
    
    if (status) filters.status = status;
    if (type) filters.type = type;
    if (veterinary) filters.veterinary = veterinary;
    if (veterinarian) filters.veterinarian = veterinarian;
    if (owner) filters.owner = owner;
    if (priority) filters.priority = priority;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      filters.appointmentDate = { $gte: startDate, $lte: endDate };
    }

    const appointments = await Appointment.searchAppointments(search, filters)
      .populate('pet', 'name species breed')
      .populate('owner', 'name email phone')
      .populate('veterinary', 'name address')
      .populate('veterinarian', 'name')
      .populate('createdBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Appointment.countDocuments({ isActive: true, ...filters });

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalAppointments: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('❌ getAllAppointments - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo citas',
      error: error.message
    });
  }
};

// Obtener cita por ID
const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id)
      .populate('pet', 'name species breed gender birthDate weight')
      .populate('owner', 'name email phone')
      .populate('veterinary', 'name address phone')
      .populate('veterinarian', 'name email phone')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    res.json({
      success: true,
      data: { appointment }
    });
  } catch (error) {
    console.error('❌ getAppointmentById - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo cita',
      error: error.message
    });
  }
};

// Obtener citas del propietario
const getOwnerAppointments = async (req, res) => {
  try {
    const ownerId = req.params.ownerId || req.user.id;
    
    const appointments = await Appointment.getByOwner(ownerId);
    
    res.json({
      success: true,
      data: { appointments }
    });
  } catch (error) {
    console.error('❌ getOwnerAppointments - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo citas del propietario',
      error: error.message
    });
  }
};

// Obtener citas de la veterinaria
const getVeterinaryAppointments = async (req, res) => {
  try {
    const { veterinaryId } = req.params;
    
    const appointments = await Appointment.getByVeterinary(veterinaryId);
    
    res.json({
      success: true,
      data: { appointments }
    });
  } catch (error) {
    console.error('❌ getVeterinaryAppointments - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo citas de la veterinaria',
      error: error.message
    });
  }
};

// Obtener citas del veterinario
const getVeterinarianAppointments = async (req, res) => {
  try {
    const veterinarianId = req.params.veterinarianId || req.user.id;
    
    const appointments = await Appointment.getByVeterinarian(veterinarianId);
    
    res.json({
      success: true,
      data: { appointments }
    });
  } catch (error) {
    console.error('❌ getVeterinarianAppointments - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo citas del veterinario',
      error: error.message
    });
  }
};

// Obtener citas por fecha
const getAppointmentsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    
    const appointments = await Appointment.getByDate(date);
    
    res.json({
      success: true,
      data: { appointments }
    });
  } catch (error) {
    console.error('❌ getAppointmentsByDate - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo citas por fecha',
      error: error.message
    });
  }
};

// Crear nueva cita
const createAppointment = async (req, res) => {
  try {
    const {
      pet,
      owner,
      veterinary,
      veterinarian,
      appointmentDate,
      appointmentTime,
      duration,
      type,
      priority,
      reason,
      symptoms,
      notes
    } = req.body;

    // Verificar que la mascota existe y pertenece al propietario
    const petExists = await Pet.findOne({ _id: pet, owner, isActive: true });
    if (!petExists) {
      return res.status(400).json({
        success: false,
        message: 'La mascota no existe o no pertenece al propietario especificado'
      });
    }

    // Verificar que la veterinaria existe
    const veterinaryExists = await Veterinary.findOne({ _id: veterinary, isActive: true });
    if (!veterinaryExists) {
      return res.status(400).json({
        success: false,
        message: 'La veterinaria no existe'
      });
    }

    // Verificar que el veterinario existe y tiene rol de veterinario
    const veterinarianExists = await User.findOne({ 
      _id: veterinarian, 
      role: 'veterinario',
      isActive: true 
    });
    if (!veterinarianExists) {
      return res.status(400).json({
        success: false,
        message: 'El veterinario no existe o no tiene el rol correcto'
      });
    }

    // Verificar disponibilidad
    const conflict = await Appointment.checkAvailability(
      veterinary,
      veterinarian,
      appointmentDate,
      appointmentTime,
      duration || 30
    );

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'El veterinario no está disponible en ese horario'
      });
    }

    const appointment = new Appointment({
      pet,
      owner,
      veterinary,
      veterinarian,
      appointmentDate,
      appointmentTime,
      duration: duration || 30,
      type,
      priority: priority || 'normal',
      reason,
      symptoms: symptoms || [],
      notes: notes || '',
      createdBy: req.user.id
    });

    await appointment.save();

    // Log de la actividad
    await logCRUDActivity(req.user.id, 'appointment', 'create', appointment._id, {
      pet: petExists.name,
      owner: owner,
      veterinary: veterinaryExists.name,
      date: appointmentDate,
      time: appointmentTime
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('pet', 'name species breed')
      .populate('owner', 'name email phone')
      .populate('veterinary', 'name address')
      .populate('veterinarian', 'name');

    res.status(201).json({
      success: true,
      message: 'Cita creada exitosamente',
      data: { appointment: populatedAppointment }
    });
  } catch (error) {
    console.error('❌ createAppointment - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando cita',
      error: error.message
    });
  }
};

// Actualizar cita
const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    // Si se está actualizando fecha/hora, verificar disponibilidad
    if ((updateData.appointmentDate || updateData.appointmentTime || updateData.duration) && 
        appointment.status !== 'cancelada') {
      
      const newDate = updateData.appointmentDate || appointment.appointmentDate;
      const newTime = updateData.appointmentTime || appointment.appointmentTime;
      const newDuration = updateData.duration || appointment.duration;

      const conflict = await Appointment.checkAvailability(
        appointment.veterinary,
        appointment.veterinarian,
        newDate,
        newTime,
        newDuration,
        id
      );

      if (conflict) {
        return res.status(400).json({
          success: false,
          message: 'El veterinario no está disponible en ese horario'
        });
      }
    }

    // Actualizar campos
    Object.keys(updateData).forEach(key => {
      if (key !== 'createdBy' && key !== '_id' && key !== '__v') {
        appointment[key] = updateData[key];
      }
    });

    appointment.updatedBy = req.user.id;
    await appointment.save();

    // Log de la actividad
    await logCRUDActivity(req.user.id, 'appointment', 'update', appointment._id, {
      changes: Object.keys(updateData)
    });

    const updatedAppointment = await Appointment.findById(id)
      .populate('pet', 'name species breed')
      .populate('owner', 'name email phone')
      .populate('veterinary', 'name address')
      .populate('veterinarian', 'name');

    res.json({
      success: true,
      message: 'Cita actualizada exitosamente',
      data: { appointment: updatedAppointment }
    });
  } catch (error) {
    console.error('❌ updateAppointment - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando cita',
      error: error.message
    });
  }
};

// Actualizar estado de la cita
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    await appointment.updateStatus(status, req.user.id);

    // Log de la actividad
    await logCRUDActivity(req.user.id, 'appointment', 'status_update', appointment._id, {
      oldStatus: appointment.status,
      newStatus: status
    });

    const updatedAppointment = await Appointment.findById(id)
      .populate('pet', 'name species breed')
      .populate('owner', 'name email phone')
      .populate('veterinary', 'name address')
      .populate('veterinarian', 'name');

    res.json({
      success: true,
      message: 'Estado de la cita actualizado exitosamente',
      data: { appointment: updatedAppointment }
    });
  } catch (error) {
    console.error('❌ updateAppointmentStatus - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando estado de la cita',
      error: error.message
    });
  }
};

// Marcar cita como pagada
const markAppointmentAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    await appointment.markAsPaid(paymentMethod, req.user.id);

    // Log de la actividad
    await logCRUDActivity(req.user.id, 'appointment', 'payment', appointment._id, {
      paymentMethod,
      amount: appointment.cost.amount
    });

    const updatedAppointment = await Appointment.findById(id)
      .populate('pet', 'name species breed')
      .populate('owner', 'name email phone')
      .populate('veterinary', 'name address')
      .populate('veterinarian', 'name');

    res.json({
      success: true,
      message: 'Cita marcada como pagada exitosamente',
      data: { appointment: updatedAppointment }
    });
  } catch (error) {
    console.error('❌ markAppointmentAsPaid - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marcando cita como pagada',
      error: error.message
    });
  }
};

// Eliminar cita (soft delete)
const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Cita no encontrada'
      });
    }

    // Solo permitir eliminar citas programadas o canceladas
    if (!['programada', 'cancelada'].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una cita que ya ha sido procesada'
      });
    }

    appointment.isActive = false;
    appointment.updatedBy = req.user.id;
    await appointment.save();

    // Log de la actividad
    await logCRUDActivity(req.user.id, 'appointment', 'delete', appointment._id, {
      pet: appointment.pet,
      date: appointment.appointmentDate,
      time: appointment.appointmentTime
    });

    res.json({
      success: true,
      message: 'Cita eliminada exitosamente'
    });
  } catch (error) {
    console.error('❌ deleteAppointment - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error eliminando cita',
      error: error.message
    });
  }
};

// Verificar disponibilidad
const checkAvailability = async (req, res) => {
  try {
    const { veterinary, veterinarian, date, time, duration = 30 } = req.query;

    if (!veterinary || !veterinarian || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos son requeridos: veterinary, veterinarian, date, time'
      });
    }

    const conflict = await Appointment.checkAvailability(
      veterinary,
      veterinarian,
      date,
      time,
      duration
    );

    res.json({
      success: true,
      data: {
        available: !conflict,
        conflict: conflict ? {
          id: conflict._id,
          pet: conflict.pet,
          time: conflict.appointmentTime,
          duration: conflict.duration
        } : null
      }
    });
  } catch (error) {
    console.error('❌ checkAvailability - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando disponibilidad',
      error: error.message
    });
  }
};

// Obtener estadísticas de citas
const getAppointmentStats = async (req, res) => {
  try {
    const { veterinary, veterinarian, startDate, endDate } = req.query;

    const filters = { isActive: true };
    if (veterinary) filters.veterinary = veterinary;
    if (veterinarian) filters.veterinarian = veterinarian;
    if (startDate && endDate) {
      filters.appointmentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const stats = await Appointment.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalCost: { $sum: '$cost.amount' }
        }
      }
    ]);

    const totalAppointments = await Appointment.countDocuments(filters);
    const totalRevenue = await Appointment.aggregate([
      { $match: { ...filters, 'cost.paid': true } },
      { $group: { _id: null, total: { $sum: '$cost.amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        stats,
        totalAppointments,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('❌ getAppointmentStats - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  getOwnerAppointments,
  getVeterinaryAppointments,
  getVeterinarianAppointments,
  getAppointmentsByDate,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  markAppointmentAsPaid,
  deleteAppointment,
  checkAvailability,
  getAppointmentStats
};
