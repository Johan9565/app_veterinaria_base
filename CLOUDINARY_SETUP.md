# Configuración de Cloudinary

Este proyecto utiliza Cloudinary para el almacenamiento y gestión de imágenes. **Las subidas se realizan desde el backend** para mayor seguridad y control.

## 1. Crear cuenta en Cloudinary

1. Ve a [cloudinary.com](https://cloudinary.com)
2. Regístrate para obtener una cuenta gratuita
3. Accede a tu Dashboard

## 2. Obtener credenciales

En tu Dashboard de Cloudinary, encontrarás:
- **Cloud Name**: Tu nombre de nube único
- **API Key**: Clave de API (requerida para subidas desde el backend)
- **API Secret**: Secreto de API (requerido para subidas desde el backend)

## 3. Configurar variables de entorno

### Opción A: Archivo .env (Recomendado para desarrollo local)

Crea un archivo `.env` en el directorio `backend/`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/veterinaria

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

### Opción B: Docker Compose (Para desarrollo con Docker)

Modifica el archivo `docker-compose.yml` en la sección del backend:

```yaml
environment:
  - NODE_ENV=development
  - MONGODB_URI=mongodb://mongo:27017/veterinaria
  - JWT_SECRET=your-secret-key-dev
  - FRONTEND_URL=http://localhost:3000
  - CLOUDINARY_CLOUD_NAME=tu-cloud-name
  - CLOUDINARY_API_KEY=tu-api-key
  - CLOUDINARY_API_SECRET=tu-api-secret
```

### Frontend (archivo `.env` en `frontend-web/`)

```env
# API URL
VITE_API_URL=http://localhost:5000/api
```

## 5. Estructura de carpetas en Cloudinary

El sistema organizará las imágenes en las siguientes carpetas:
- `veterinarias/logos/` - Logos de veterinarias
- `veterinarias/images/` - Imágenes generales de veterinarias

## 6. Funcionalidades implementadas

### Frontend
- ✅ Interfaz de subida de logos de veterinarias
- ✅ Validación de formatos (JPG, PNG, GIF, WebP)
- ✅ Validación de tamaño (máximo 5MB)
- ✅ Preview de imágenes en tiempo real
- ✅ Eliminación de logos
- ✅ Manejo de errores
- ✅ Envío de archivos al backend

### Backend
- ✅ Servicio de Cloudinary con autenticación segura
- ✅ Middleware de subida de archivos con Multer
- ✅ Controlador de subidas con validaciones
- ✅ Rutas protegidas con autenticación y permisos
- ✅ Modelo actualizado para incluir logo
- ✅ Almacenamiento de URL y metadata de Cloudinary
- ✅ Limpieza automática de archivos temporales

## 7. Servicios disponibles

### Frontend - CloudinaryService
- `uploadVeterinaryLogo(file)` - Enviar logo al backend para subida
- `uploadVeterinaryImage(file)` - Enviar imagen al backend para subida
- `deleteImage(publicId)` - Eliminar imagen de Cloudinary
- `validateImageFile(file)` - Validar archivo de imagen
- `getOptimizedUrl(url, options)` - Obtener URL optimizada

### Backend - CloudinaryService
- `uploadImage(file, folder)` - Subir imagen a Cloudinary
- `uploadVeterinaryLogo(file)` - Subir logo de veterinaria
- `uploadVeterinaryImages(file)` - Subir imágenes de veterinaria
- `deleteImage(publicId)` - Eliminar imagen de Cloudinary
- `validateImageFile(file)` - Validar archivo de imagen
- `getOptimizedUrl(url, options)` - Obtener URL optimizada

### Backend - UploadController
- `uploadVeterinaryLogo(req, res)` - Manejar subida de logo
- `uploadVeterinaryImage(req, res)` - Manejar subida de imagen
- `deleteImage(req, res)` - Manejar eliminación de imagen

## 8. Seguridad

- **Subidas desde el backend**: Todas las subidas pasan por el servidor
- **Autenticación requerida**: Todas las rutas de subida requieren JWT válido
- **Permisos granulares**: Control de acceso basado en roles y permisos
- **Validación de archivos**: Verificación de tipo, tamaño y contenido
- **Limpieza automática**: Los archivos temporales se eliminan automáticamente
- **HTTPS**: Todas las URLs de Cloudinary usan HTTPS
- **API Keys seguras**: Las credenciales de Cloudinary solo están en el backend

## 9. Optimización

Cloudinary automáticamente:
- Optimiza las imágenes
- Proporciona diferentes formatos según el navegador
- Permite transformaciones en tiempo real
- Ofrece CDN global

## 10. Troubleshooting

### Error: "Cannot find module 'cloudinary'"
- **Causa**: El módulo cloudinary no está instalado en el contenedor Docker
- **Solución**: 
  ```bash
  # Reconstruir el contenedor
  docker-compose build backend
  docker-compose up backend
  
  # O instalar manualmente en el contenedor
  docker-compose exec backend npm install cloudinary multer
  ```

### Error: "Configuración de Cloudinary incompleta"
- Verifica que las variables de entorno del backend estén configuradas
- Asegúrate de que el archivo `.env` esté en el directorio `backend/`
- Confirma que `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET` estén definidos

### Error: "Error al subir la imagen"
- Verifica que las credenciales de Cloudinary sean correctas
- Confirma que el backend esté funcionando correctamente
- Revisa que el archivo no exceda el tamaño máximo (5MB)
- Verifica que el usuario tenga los permisos necesarios

### Error: "Formato de imagen no válido"
- Asegúrate de que el archivo sea JPG, PNG, GIF o WebP
- Verifica que el archivo sea realmente una imagen válida
- Confirma que el archivo no esté corrupto

### Error: "401 Unauthorized"
- Verifica que el token JWT sea válido
- Confirma que el usuario tenga los permisos necesarios
- Revisa que la sesión no haya expirado

### Error: "413 Payload Too Large"
- El archivo excede el límite de 5MB
- Comprime la imagen o usa un archivo más pequeño 