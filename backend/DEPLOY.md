# Guía de Deploy - Backend

## Variables de Entorno Requeridas

Configura las siguientes variables de entorno en Render:

### Configuración del Servidor
- `PORT`: 5000 (por defecto)
- `NODE_ENV`: production

### Base de Datos MongoDB
- `MONGODB_URI`: URL de conexión a MongoDB Atlas
  - Ejemplo: `mongodb+srv://username:password@cluster.mongodb.net/veterinaria?retryWrites=true&w=majority`

### JWT Secret
- `JWT_SECRET`: Clave secreta para firmar tokens JWT
  - Ejemplo: `your-super-secret-jwt-key-here`

### Cloudinary Configuration
- `CLOUDINARY_CLOUD_NAME`: Nombre de tu cuenta en Cloudinary
- `CLOUDINARY_API_KEY`: API Key de Cloudinary
- `CLOUDINARY_API_SECRET`: API Secret de Cloudinary

### Frontend URL
- `FRONTEND_URL`: URL del frontend desplegado
  - Ejemplo: `https://veterinaria-frontend.onrender.com`

## Comandos de Deploy

### Build Command
```bash
cd backend && npm install
```

### Start Command
```bash
cd backend && npm start
```

## Configuración de CORS

El backend está configurado para aceptar requests del frontend. Asegúrate de que la variable `FRONTEND_URL` esté configurada correctamente.

## Base de Datos

1. Crea una cuenta en MongoDB Atlas
2. Crea un cluster
3. Configura las credenciales de acceso
4. Obtén la URI de conexión
5. Configura la variable `MONGODB_URI` en Render

## Cloudinary

1. Crea una cuenta en Cloudinary
2. Obtén las credenciales de la API
3. Configura las variables de entorno en Render:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET` 