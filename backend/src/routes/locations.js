const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { authenticateToken } = require('../middleware/auth');

// GET /api/locations/states - Obtener todos los estados
router.get('/states', 
  authenticateToken, 
  locationController.getStates
);

// GET /api/locations/municipalities/:stateName - Obtener municipios por estado
router.get('/municipalities/:stateName', 
  authenticateToken, 
  locationController.getMunicipalitiesByState
);

// GET /api/locations/all - Obtener todos los estados y municipios
router.get('/all', 
  authenticateToken, 
  locationController.getAllStatesAndMunicipalities
);

module.exports = router; 