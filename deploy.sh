#!/bin/bash

echo "🧹 LIMPIEZA FORZADA - Eliminando todo lo relacionado..."

# Parar todos los contenedores relacionados (forzado)
echo "⏹️  Deteniendo contenedores..."
docker stop $(docker ps -aq --filter "name=grafica-") 2>/dev/null || true

# Eliminar todos los contenedores relacionados (forzado)
echo "🗑️  Eliminando contenedores..."
docker rm -f grafica-web grafica-api grafica-db grafica-db-admin 2>/dev/null || true

# Eliminar red (forzado)
echo "🔗 Eliminando red..."
docker network rm grafica-network 2>/dev/null || true

# Eliminar imágenes locales para rebuild limpio
echo "🖼️  Eliminando imágenes locales..."
docker rmi -f grafica-web grafica-api 2>/dev/null || true

# Limpieza adicional (opcional pero recomendada)
echo "🧽 Limpieza profunda del sistema Docker..."
docker system prune -f --volumes 2>/dev/null || true

echo "✅ Limpieza completada - Sistema Docker limpio"
echo ""

# Crear estructura de directorios necesaria
echo "📁 Creando directorios necesarios..."
mkdir -p ssl uploads/pedidos uploads/productos

# Verificar certificados SSL
if [ ! -f "ssl/graficarumbos.crt" ] || [ ! -f "ssl/graficarumbos.key" ]; then
    echo "⚠️  ADVERTENCIA: Certificados SSL no encontrados en ./ssl/"
    echo "   Asegúrate de tener:"
    echo "   - ssl/graficarumbos.crt"
    echo "   - ssl/graficarumbos.key"
    echo ""
    read -p "¿Continuar sin SSL? (y/N): " continue_without_ssl
    if [[ ! $continue_without_ssl =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelado. Configura los certificados SSL primero."
        exit 1
    fi
fi

echo "🚀 INICIANDO DEPLOYMENT LIMPIO..."
echo ""

# Crear la red
echo "🔗 Creando red..."
docker network create grafica-network

# Iniciar MongoDB
echo "📊 Iniciando MongoDB..."
docker run -d --name grafica-db \
  --network grafica-network \
  -v mongo-data:/data/db \
  --restart always \
  mongo:6.0

# Esperar a que MongoDB esté listo
echo "⏳ Esperando que MongoDB esté listo..."
sleep 5

# Iniciar MongoDB Express
echo "🔧 Iniciando MongoDB Express..."
docker run -d --name grafica-db-admin \
  --network grafica-network \
  -p 8081:8081 \
  -e ME_CONFIG_MONGODB_SERVER=grafica-db \
  -e ME_CONFIG_BASICAUTH_USERNAME=admin \
  -e ME_CONFIG_BASICAUTH_PASSWORD=pass \
  --restart always \
  mongo-express

# Construir e iniciar Backend
echo "🔗 Construyendo e iniciando Backend..."
docker build --no-cache -t grafica-api ./backend
docker run -d --name grafica-api \
  --network grafica-network \
  -e MONGODB_URI=mongodb://grafica-db:27017/fotocopias \
  -e JWT_SECRET=supersecretkey \
  -e ADMIN_EMAIL=admin@admin.com \
  -e ADMIN_PASSWORD=password123 \
  -v "$(pwd)/uploads/pedidos:/app/pedidos" \
  -v "$(pwd)/uploads/productos:/app/productos" \
  --restart always \
  grafica-api

# Construir e iniciar Frontend con SSL
echo "🌐 Construyendo e iniciando Frontend..."
docker build --no-cache -t grafica-web ./frontend

# Verificar si tenemos certificados SSL para decidir puertos
if [ -f "ssl/graficarumbos.crt" ] && [ -f "ssl/graficarumbos.key" ]; then
    echo "✅ Certificados SSL encontrados - Iniciando con HTTPS..."
    docker run -d --name grafica-web \
      --network grafica-network \
      -p 80:80 \
      -p 443:443 \
      -v "$(pwd)/frontend/assets:/usr/share/nginx/html/assets" \
      -v "$(pwd)/ssl:/etc/nginx/ssl" \
      --restart always \
      grafica-web
    echo "🔐 SSL habilitado"
else
    echo "⚠️  Iniciando sin SSL (solo HTTP)..."
    docker run -d --name grafica-web \
      --network grafica-network \
      -p 80:80 \
      -v "$(pwd)/frontend/assets:/usr/share/nginx/html/assets" \
      --restart always \
      grafica-web
fi

echo ""
echo "🎉 DEPLOYMENT COMPLETADO"
echo "================================"
echo "📊 Estado de los servicios:"
docker ps --filter "network=grafica-network" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🌐 URLs disponibles:"
echo "   - Web: http://graficarumbos.com.ar"
if [ -f "ssl/graficarumbos.crt" ]; then
    echo "   - Web SSL: https://graficarumbos.com.ar"
fi
echo "   - MongoDB Admin: http://$(curl -s ifconfig.me):8081"

echo ""
echo "📋 Logs útiles:"
echo "   docker logs grafica-web"
echo "   docker logs grafica-api" 
echo "   docker logs grafica-db"

# Mostrar logs recientes del web para debug
echo ""
echo "📄 Logs recientes del frontend:"
docker logs --tail 10 grafica-web