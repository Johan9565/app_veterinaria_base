const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configurar almacenamiento temporal
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Formato de archivo no válido. Solo se permiten JPG, PNG, GIF y WebP.'), false);
  }
};

// Configurar multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1 // Solo un archivo por vez
  }
});

// Middleware para subir logo de veterinaria
const uploadVeterinaryLogo = upload.single('logo');

// Middleware para subir imagen de veterinaria
const uploadVeterinaryImage = upload.single('image');

// Middleware para limpiar archivos temporales
const cleanupTempFile = (req, res, next) => {
  // Limpiar archivo temporal después de procesar
  res.on('finish', () => {
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error('Error eliminando archivo temporal:', err);
        }
      });
    }
  });
  next();
};

module.exports = {
  uploadVeterinaryLogo,
  uploadVeterinaryImage,
  cleanupTempFile
}; 