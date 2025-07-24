FROM node:20-alpine
WORKDIR /app

# Instalar dependencias globales para desarrollo
RUN npm install -g nodemon

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 5000

# Comando para desarrollo (nodemon se ejecutará desde docker-compose)
CMD ["npm", "run", "dev"]
