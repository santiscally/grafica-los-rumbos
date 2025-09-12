#!/bin/bash

echo "🔄 Deteniendo y eliminando contenedores existentes..."

# Detener contenedores si están corriendo
docker stop grafica-web grafica-api grafica-db grafica-db-admin 2>/dev/null || true

# Eliminar contenedores existentes
docker rm grafica-web grafica-api grafica-db grafica-db-admin 2>/dev/null || true

# Eliminar imágenes locales (opcional - descomenta si quieres rebuild completo)
# docker rmi grafica-web grafica-api 2>/dev/null || true

echo "✅ Limpieza completada"

# Crear la red (eliminar si existe primero)
docker network rm grafica-network 2>/dev/null || true
docker network create grafica-network

echo "🚀 Iniciando servicios..."

# Iniciar MongoDB
docker run -d --name grafica-db \
  --network grafica-network \
  -v mongo-data:/data/db \
  --restart always \
  mongo:6.0

echo "📊 MongoDB iniciado"

# Iniciar MongoDB Express
docker run -d --name grafica-db-admin \
  --network grafica-network \
  -p 8081:8081 \
  -e ME_CONFIG_MONGODB_SERVER=grafica-db \
  -e ME_CONFIG_BASICAUTH_USERNAME=admin \
  -e ME_CONFIG_BASICAUTH_PASSWORD=pass \
  --restart always \
  mongo-express

echo "🔧 MongoDB Express iniciado"

# Construir e iniciar Backend
docker build -t grafica-api ./backend
docker run -d --name grafica-api \
  --network grafica-network \
  -e MONGODB_URI=mongodb://grafica-db:27017/fotocopias \
  -e JWT_SECRET=supersecretkey \
  -e ADMIN_EMAIL=admin@admin.com \
  -e ADMIN_PASSWORD=password123 \
  -v ./uploads/pedidos:/app/pedidos \
  -v ./uploads/productos:/app/productos \
  --restart always \
  grafica-api

echo "🔗 API iniciada"

# Construir e iniciar Frontend con Nginx (con SSL)
docker build -t grafica-web ./frontend
docker run -d --name grafica-web \
  --network grafica-network \
  -p 80:80 \
  -p 443:443 \
  -v ./frontend/assets:/usr/share/nginx/html/assets \
  -v ./ssl:/etc/nginx/ssl \
  --restart always \
  grafica-web

echo "🌐 Frontend iniciado con SSL"

echo "✅ Todos los servicios están corriendo:"
echo "   - Web: http://localhost (redirige a https://)"
echo "   - Web SSL: https://localhost"
echo "   - MongoDB Admin: http://localhost:8081"
echo "   - Dominio: https://graficarumbos.com.ar"

# Mostrar estado de contenedores
docker ps --filter "network=grafica-network"