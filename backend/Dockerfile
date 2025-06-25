FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Crear directorios de almacenamiento con permisos apropiados
RUN mkdir -p /app/pedidos /app/productos && \
    chmod -R 755 /app/pedidos /app/productos

# Exponer puerto
EXPOSE 5000

# Comando de inicio
CMD ["npm", "run", "dev"]