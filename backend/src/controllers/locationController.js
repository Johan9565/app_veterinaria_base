const State = require('../models/State');

// Obtener todos los estados
const getStates = async (req, res) => {
  try {
  
    
    const statesData = await State.find({});
  
    
    const states = statesData.map(state => {
      const keys = Object.keys(state.toObject());
      
      return keys.filter(key => key !== '_id' && key !== '__v');
    }).flat();

   
    
    res.json({
      success: true,
      data: states
    });
  } catch (error) {
    console.error('❌ getStates - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estados',
      error: error.message
    });
  }
};

// Obtener municipios por estado
const getMunicipalitiesByState = async (req, res) => {
  try {
    const { stateName } = req.params;
   
    
    const state = await State.findOne({ [stateName]: { $exists: true } });
    
    if (!state) {
      return res.status(404).json({
        success: false,
        message: 'Estado no encontrado'
      });
    }

    const municipalities = state[stateName] || [];
    
    res.json({
      success: true,
      data: municipalities
    });
  } catch (error) {
    console.error('❌ getMunicipalitiesByState - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo municipios',
      error: error.message
    });
  }
};

// Obtener todos los estados y municipios
const getAllStatesAndMunicipalities = async (req, res) => {
  try {
   
    const statesData = await State.find({});
    
    const result = {};
    statesData.forEach(state => {
      const stateObj = state.toObject();
      Object.keys(stateObj).forEach(key => {
        if (key !== '_id' && key !== '__v') {
          result[key] = stateObj[key];
        }
      });
    });

    
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ getAllStatesAndMunicipalities - Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estados y municipios',
      error: error.message
    });
  }
};

module.exports = {
  getStates,
  getMunicipalitiesByState,
  getAllStatesAndMunicipalities
}; 