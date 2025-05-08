#!/bin/bash

# Crear la red
docker network create grafica-network

# Iniciar MongoDB
docker run -d --name grafica-db \
  --network grafica-network \
  -v mongo-data:/data/db \
  mongo:6.0

# Iniciar MongoDB Express
docker run -d --name grafica-db-admin \
  --network grafica-network \
  -p 8081:8081 \
  -e ME_CONFIG_MONGODB_SERVER=grafica-db \
  -e ME_CONFIG_BASICAUTH_USERNAME=admin \
  -e ME_CONFIG_BASICAUTH_PASSWORD=pass \
  mongo-express

# Construir e iniciar Backend
docker build -t grafica-api ./backend
docker run -d --name grafica-api \
  --network grafica-network \
  -e MONGODB_URI=mongodb://grafica-db:27017/fotocopias \
  -e JWT_SECRET=supersecretkey \
  -e ADMIN_EMAIL=admin@admin.com \
  -e ADMIN_PASSWORD=password123 \
  grafica-api

# Construir e iniciar Frontend con Nginx
docker build -t grafica-web ./frontend
docker run -d --name grafica-web \
  --network grafica-network \
  -p 80:80 \
  grafica-web