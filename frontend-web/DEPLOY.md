# Guía de Deploy - Frontend

## Variables de Entorno Requeridas

Configura las siguientes variables de entorno en Render:

### API URL
- `VITE_API_URL`: URL del backend desplegado
  - Ejemplo: `https://veterinaria-backend.onrender.com/api`

## Comandos de Deploy

### Build Command
```bash
cd frontend-web && npm install && npm run build
```

### Static Publish Path
```
./frontend-web/dist
```

## Configuración de Vite

El archivo `vite.config.js` está configurado para:
- Construir la aplicación en modo producción
- Generar source maps para debugging
- Configurar el servidor de desarrollo

## Variables de Entorno

El frontend usa las siguientes variables de entorno:

- `VITE_API_URL`: URL del backend API
- `VITE_CLOUDINARY_CLOUD_NAME`: Nombre de la cuenta de Cloudinary (opcional)

## Build Output

La aplicación se construye en la carpeta `dist/` que contiene:
- Archivos HTML, CSS y JavaScript optimizados
- Assets estáticos
- Configuración para servir como aplicación SPA

## Configuración de Render

1. Conecta tu repositorio de GitHub
2. Selecciona el directorio raíz del proyecto
3. Configura como servicio estático
4. Establece el build command y static publish path
5. Configura las variables de entorno 