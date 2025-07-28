# 🚀 Guía de Deploy en Render - Veterinaria App

Esta guía te ayudará a desplegar la aplicación completa de veterinaria en Render.

## 📋 Prerrequisitos

1. **Cuenta en Render**: [render.com](https://render.com)
2. **Cuenta en MongoDB Atlas**: [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
3. **Cuenta en Cloudinary**: [cloudinary.com](https://cloudinary.com)
4. **Repositorio en GitHub**: Sube tu código a GitHub

## 🏗️ Estructura del Proyecto

```
app_veterinaria/
├── backend/           # API Node.js + Express
├── frontend-web/      # React + Vite
├── mobile-app/        # React Native (opcional)
├── render.yaml        # Configuración de Render
└── DEPLOY_GUIDE.md   # Esta guía
```

## 🔧 Paso 1: Configurar MongoDB Atlas

1. **Crear cuenta en MongoDB Atlas**
2. **Crear un cluster** (gratuito)
3. **Configurar acceso a la base de datos**:
   - Crear usuario y contraseña
   - Configurar IP whitelist (0.0.0.0/0 para desarrollo)
4. **Obtener la URI de conexión**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/veterinaria?retryWrites=true&w=majority
   ```

## ☁️ Paso 2: Configurar Cloudinary

1. **Crear cuenta en Cloudinary**
2. **Obtener credenciales**:
   - Cloud Name
   - API Key
   - API Secret
3. **Configurar carpeta para imágenes**:
   - Crear carpeta `veterinarias/logos`
   - Crear carpeta `veterinarias/images`

## 🚀 Paso 3: Deploy en Render

### Opción A: Deploy Automático con render.yaml

1. **Subir código a GitHub**
2. **En Render Dashboard**:
   - Click "New +"
   - Seleccionar "Blueprint"
   - Conectar repositorio de GitHub
   - Render detectará automáticamente el `render.yaml`

### Opción B: Deploy Manual

#### Backend (API)

1. **Crear nuevo Web Service**:
   - Name: `veterinaria-backend`
   - Environment: `Node`
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`

2. **Configurar variables de entorno**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/veterinaria?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   FRONTEND_URL=https://veterinaria-frontend.onrender.com
   ```

#### Frontend (Web)

1. **Crear nuevo Static Site**:
   - Name: `veterinaria-frontend`
   - Build Command: `cd frontend-web && npm install && npm run build`
   - Publish Directory: `frontend-web/dist`

2. **Configurar variables de entorno**:
   ```
   VITE_API_URL=https://veterinaria-backend.onrender.com/api
   ```

## 🔗 Paso 4: Configurar URLs

Una vez desplegado, actualiza las URLs en Render:

### Backend
- URL: `https://veterinaria-backend.onrender.com`
- Actualizar `FRONTEND_URL` con la URL del frontend

### Frontend
- URL: `https://veterinaria-frontend.onrender.com`
- Actualizar `VITE_API_URL` con la URL del backend

## 📊 Paso 5: Verificar el Deploy

### Backend
- Health check: `https://veterinaria-backend.onrender.com/api/health`
- Debería responder: `{"status":"OK","message":"Servidor veterinaria funcionando correctamente"}`

### Frontend
- Abrir: `https://veterinaria-frontend.onrender.com`
- Verificar que la aplicación carga correctamente
- Probar login y funcionalidades

## 🔧 Paso 6: Configurar Base de Datos

1. **Conectar a MongoDB Atlas**
2. **Crear colecciones iniciales**:
   ```javascript
   // Colección: users
   // Colección: veterinaries
   // Colección: states (para estados y municipios)
   // Colección: logs
   ```

3. **Insertar datos de estados** (opcional):
   ```javascript
   // Ejemplo para Quintana Roo
   {
     "Quintana Roo": [
       "Bacalar", "Benito Juarez", "Cozumel", "Felipe Carrillo Puerto",
       "Isla Mujeres", "Jose Maria Morelos", "Lazaro Cardenas",
       "Othon P. Blanco", "Puerto Morelos", "Solidaridad", "Tulum"
     ]
   }
   ```

## 🛠️ Troubleshooting

### Backend no inicia
- Verificar variables de entorno
- Revisar logs en Render Dashboard
- Verificar conexión a MongoDB

### Frontend no carga
- Verificar `VITE_API_URL`
- Revisar build logs
- Verificar que el backend esté funcionando

### CORS errors
- Verificar `FRONTEND_URL` en backend
- Asegurar que las URLs coincidan

### Imágenes no se suben
- Verificar credenciales de Cloudinary
- Revisar permisos de carpeta

## 📱 URLs Finales

- **Frontend**: `https://veterinaria-frontend.onrender.com`
- **Backend API**: `https://veterinaria-backend.onrender.com`
- **API Health**: `https://veterinaria-backend.onrender.com/api/health`

## 🔄 Actualizaciones

Para actualizar la aplicación:
1. Hacer cambios en el código
2. Commit y push a GitHub
3. Render detectará automáticamente los cambios
4. Desplegará automáticamente

## 📞 Soporte

Si tienes problemas:
1. Revisar logs en Render Dashboard
2. Verificar variables de entorno
3. Probar endpoints individualmente
4. Revisar conexiones a servicios externos 