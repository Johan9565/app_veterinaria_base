# 🚀 Deploy en Vercel + Railway

## 📋 **Prerrequisitos**
- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Railway](https://railway.app)
- MongoDB Atlas configurado
- Cloudinary configurado

## 🔧 **Paso 1: Deploy Backend en Railway**

### 1.1 Crear proyecto en Railway
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Crear proyecto
railway init
```

### 1.2 Configurar variables de entorno en Railway
```bash
# En Railway Dashboard o CLI
railway variables set NODE_ENV=production
railway variables set MONGODB_URI=tu_mongodb_uri
railway variables set JWT_SECRET=tu_jwt_secret
railway variables set CLOUDINARY_CLOUD_NAME=tu_cloudinary_name
railway variables set CLOUDINARY_API_KEY=tu_cloudinary_key
railway variables set CLOUDINARY_API_SECRET=tu_cloudinary_secret
railway variables set FRONTEND_URL=https://tu-app.vercel.app
```

### 1.3 Deploy backend
```bash
# Desde la carpeta backend
cd backend
railway up
```

### 1.4 Obtener URL del backend
```bash
railway status
# Copiar la URL (ej: https://tu-backend.railway.app)
```

## 🌐 **Paso 2: Deploy Frontend en Vercel**

### 2.1 Conectar repositorio
1. Ve a [vercel.com](https://vercel.com)
2. Click "New Project"
3. Importa tu repositorio de GitHub
4. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend-web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.2 Configurar variables de entorno en Vercel
En el dashboard de Vercel, ve a Settings > Environment Variables:

```
VITE_API_URL=https://tu-backend.railway.app/api
```

### 2.3 Deploy frontend
```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend-web
vercel --prod
```

## 🔗 **Paso 3: Configurar CORS**

### 3.1 Actualizar CORS en backend
En `backend/src/index.js`, actualiza:

```javascript
app.use(cors({
  origin: [
    'https://tu-app.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### 3.2 Redeploy backend
```bash
cd backend
railway up
```

## ✅ **Paso 4: Verificar deploy**

### 4.1 Verificar backend
```bash
curl https://tu-backend.railway.app/api/health
```

### 4.2 Verificar frontend
- Visita tu URL de Vercel
- Prueba login/registro
- Verifica que las llamadas a la API funcionen

## 🔧 **Comandos útiles**

### Railway
```bash
railway status          # Ver estado del proyecto
railway logs           # Ver logs
railway variables      # Ver variables de entorno
railway up            # Deploy
```

### Vercel
```bash
vercel status         # Ver estado del proyecto
vercel logs          # Ver logs
vercel env ls        # Ver variables de entorno
vercel --prod        # Deploy a producción
```

## 🚨 **Solución de problemas**

### Error de CORS
- Verifica que la URL del frontend esté en CORS del backend
- Asegúrate de que `FRONTEND_URL` esté configurada correctamente

### Error de conexión a MongoDB
- Verifica que `MONGODB_URI` esté correcta
- Asegúrate de que la IP de Railway esté en whitelist de MongoDB Atlas

### Error de build en Vercel
- Verifica que `package.json` esté en la carpeta correcta
- Asegúrate de que todas las dependencias estén instaladas

## 📞 **Soporte**
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs) 