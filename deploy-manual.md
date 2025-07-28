# 🚀 Deploy Manual en Render

## Paso 1: Preparar el Repositorio

1. **Subir código a GitHub**:
   ```bash
   git add .
   git commit -m "Preparar para deploy en Render"
   git push origin main
   ```

## Paso 2: Configurar MongoDB Atlas

1. **Crear cuenta en MongoDB Atlas**
2. **Crear cluster gratuito**
3. **Configurar acceso**:
   - Database Access → Add New Database User
   - Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
4. **Obtener connection string**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/veterinaria?retryWrites=true&w=majority
   ```

## Paso 3: Configurar Cloudinary

1. **Crear cuenta en Cloudinary**
2. **Obtener credenciales** del Dashboard:
   - Cloud Name
   - API Key
   - API Secret

## Paso 4: Deploy Backend en Render

1. **Ir a [render.com](https://render.com)**
2. **Crear nuevo Web Service**
3. **Conectar repositorio de GitHub**
4. **Configurar**:
   - **Name**: `veterinaria-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`

5. **Configurar Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/veterinaria?retryWrites=true&w=majority
   JWT_SECRET=tu-super-secret-jwt-key-aqui
   CLOUDINARY_CLOUD_NAME=tu-cloud-name
   CLOUDINARY_API_KEY=tu-api-key
   CLOUDINARY_API_SECRET=tu-api-secret
   FRONTEND_URL=https://veterinaria-frontend.onrender.com
   ```

6. **Deploy**

## Paso 5: Deploy Frontend en Render

1. **Crear nuevo Static Site**
2. **Conectar repositorio de GitHub**
3. **Configurar**:
   - **Name**: `veterinaria-frontend`
   - **Build Command**: `cd frontend-web && npm install && npm run build`
   - **Publish Directory**: `frontend-web/dist`

4. **Configurar Environment Variables**:
   ```
   VITE_API_URL=https://veterinaria-backend.onrender.com/api
   ```

5. **Deploy**

## Paso 6: Actualizar URLs

### Backend
- Ir a Settings del backend
- Actualizar `FRONTEND_URL` con la URL del frontend

### Frontend
- Ir a Settings del frontend
- Actualizar `VITE_API_URL` con la URL del backend

## Paso 7: Verificar Deploy

### Backend
```bash
curl https://veterinaria-backend.onrender.com/api/health
```

### Frontend
- Abrir: `https://veterinaria-frontend.onrender.com`
- Probar login y funcionalidades

## URLs Finales

- **Frontend**: `https://veterinaria-frontend.onrender.com`
- **Backend**: `https://veterinaria-backend.onrender.com`
- **API Health**: `https://veterinaria-backend.onrender.com/api/health`

## Troubleshooting

### Backend no inicia
- Verificar variables de entorno
- Revisar logs en Render
- Verificar conexión a MongoDB

### Frontend no carga
- Verificar `VITE_API_URL`
- Revisar build logs
- Verificar que backend esté funcionando

### CORS errors
- Verificar `FRONTEND_URL` en backend
- Asegurar que URLs coincidan 