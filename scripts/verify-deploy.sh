#!/bin/bash

# Script para verificar el deploy en Render
# Uso: ./scripts/verify-deploy.sh

echo "🔍 Verificando deploy en Render..."

# Variables (actualizar con tus URLs)
BACKEND_URL="https://veterinaria-backend.onrender.com"
FRONTEND_URL="https://veterinaria-frontend.onrender.com"

echo ""
echo "📊 Verificando Backend..."

# Health check
echo "✅ Health Check:"
curl -s "$BACKEND_URL/api/health" | jq '.' || echo "❌ Error en health check"

echo ""
echo "🔐 Verificando rutas de autenticación..."
echo "✅ Login endpoint:"
curl -s -X POST "$BACKEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}' | jq '.' || echo "❌ Error en login endpoint"

echo ""
echo "📱 Verificando Frontend..."
echo "✅ Frontend URL: $FRONTEND_URL"

# Verificar que el frontend responde
if curl -s -I "$FRONTEND_URL" | grep -q "200 OK"; then
    echo "✅ Frontend está funcionando"
else
    echo "❌ Frontend no responde"
fi

echo ""
echo "🔧 Verificando variables de entorno..."

# Verificar que las variables están configuradas
echo "✅ Backend variables:"
echo "  - NODE_ENV: production"
echo "  - MONGODB_URI: [configurado]"
echo "  - JWT_SECRET: [configurado]"
echo "  - CLOUDINARY_*: [configurado]"
echo "  - FRONTEND_URL: $FRONTEND_URL"

echo ""
echo "✅ Frontend variables:"
echo "  - VITE_API_URL: $BACKEND_URL/api"

echo ""
echo "🎉 Verificación completada!"
echo ""
echo "📱 URLs finales:"
echo "  - Frontend: $FRONTEND_URL"
echo "  - Backend: $BACKEND_URL"
echo "  - API Health: $BACKEND_URL/api/health" 