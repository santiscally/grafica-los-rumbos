# Etapa de construcción
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Construir la app para producción
RUN npm run build

# Etapa de producción
FROM nginx:alpine

# Copiar la build de React al directorio de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# El archivo de configuración de Nginx vendrá de un volumen
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]