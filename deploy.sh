#!/bin/bash

# ===========================================
# SCRIPT DE DEPLOYMENT CON DOCKER-COMPOSE
# ===========================================
# Uso: ./deploy.sh [prod|homo]

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Determinar ambiente
ENV=$1

if [ -z "$ENV" ]; then
    echo ""
    echo "========================================="
    echo "  SELECCIONAR AMBIENTE DE DEPLOYMENT"
    echo "========================================="
    echo ""
    echo "  1) local - Desarrollo local"
    echo "            URL: http://localhost"
    echo ""
    echo "  2) homo  - Homologación (sin SSL)"
    echo "            Server: vps-4920631-x.dattaweb.com"
    echo ""
    echo "  3) prod  - Producción (con SSL)"
    echo "            Server: vps-1359379-x.dattaweb.com"
    echo "            Domain: graficarumbos.com.ar"
    echo ""
    read -p "Selecciona ambiente [local/homo/prod]: " ENV
fi

# Validar ambiente
if [[ "$ENV" != "prod" && "$ENV" != "homo" && "$ENV" != "local" ]]; then
    log_error "Ambiente inválido: $ENV"
    echo "Uso: ./deploy.sh [local|homo|prod]"
    exit 1
fi

# Local usa la misma config que homo
COMPOSE_ENV=$ENV
if [ "$ENV" == "local" ]; then
    COMPOSE_ENV="homo"
fi

echo ""
echo "========================================="
echo "  DEPLOYMENT: ${ENV^^}"
echo "========================================="
echo ""

# Verificar archivos necesarios
if [ ! -f "frontend/nginx.${COMPOSE_ENV}.conf" ]; then
    log_error "No se encontró frontend/nginx.${COMPOSE_ENV}.conf"
    exit 1
fi

if [ ! -f "docker-compose.${COMPOSE_ENV}.yml" ]; then
    log_error "No se encontró docker-compose.${COMPOSE_ENV}.yml"
    exit 1
fi

# Para producción, verificar certificados SSL
if [ "$COMPOSE_ENV" == "prod" ]; then
    log_info "Verificando certificados SSL..."
    mkdir -p ssl
    
    if [ ! -f "ssl/graficarumbos.crt" ] || [ ! -f "ssl/graficarumbos.key" ]; then
        log_error "Certificados SSL no encontrados en ./ssl/"
        echo "   Necesitas:"
        echo "   - ssl/graficarumbos.crt"
        echo "   - ssl/graficarumbos.key"
        echo ""
        exit 1
    fi
    log_success "Certificados SSL encontrados"
fi

# Crear directorios necesarios
log_info "Creando directorios necesarios..."
mkdir -p ssl uploads/pedidos uploads/productos

# Copiar nginx config correcto
log_info "Configurando nginx para ambiente: ${ENV}"
cp "frontend/nginx.${COMPOSE_ENV}.conf" frontend/nginx.conf
log_success "frontend/nginx.conf configurado para ${ENV}"

# Detener contenedores existentes
log_info "Deteniendo contenedores existentes..."
docker-compose -f "docker-compose.${COMPOSE_ENV}.yml" down 2>/dev/null || true

# Limpiar imágenes anteriores (opcional, para rebuild limpio)
log_info "Limpiando imágenes anteriores..."
docker rmi -f $(docker images -q 'fotocopias-app*' 2>/dev/null) 2>/dev/null || true

# Construir y levantar
log_info "Construyendo e iniciando servicios..."
docker-compose -f "docker-compose.${COMPOSE_ENV}.yml" up -d --build

# Esperar un momento
sleep 3

# Mostrar estado
echo ""
echo "========================================="
echo "  🎉 DEPLOYMENT COMPLETADO - ${ENV^^}"
echo "========================================="
echo ""

log_info "Estado de los servicios:"
docker-compose -f "docker-compose.${COMPOSE_ENV}.yml" ps

echo ""
log_info "URLs disponibles:"
if [ "$ENV" == "prod" ]; then
    echo "   - HTTP:  http://graficarumbos.com.ar"
    echo "   - HTTPS: https://graficarumbos.com.ar"
    echo "   - Server: http://vps-1359379-x.dattaweb.com"
elif [ "$ENV" == "homo" ]; then
    echo "   - HTTP: http://vps-4920631-x.dattaweb.com"
    echo "   - Localhost: http://localhost"
else
    echo "   - HTTP: http://localhost"
fi
echo "   - MongoDB Admin: http://localhost:8081"

echo ""
log_info "Logs del frontend:"
docker-compose -f "docker-compose.${COMPOSE_ENV}.yml" logs --tail 20 grafica-web