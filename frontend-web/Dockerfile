FROM node:20-alpine
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias
RUN npm install

# Exponer puerto
EXPOSE 3000

# Comando para desarrollo (vite se ejecutará desde docker-compose)
CMD ["npm", "run", "dev"]
