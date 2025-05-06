# Sistema de Pedidos de Fotocopias

Sistema web para gestionar pedidos de fotocopias escolares.

## Características

- **Landing Page**: Catálogo de productos con filtros por año escolar y materia
- **Órdenes**: Creación de pedidos sin necesidad de registro
- **Panel de Admin**: Gestión de pedidos y productos
- **Notificaciones**: Sistema para notificar a clientes (simulado)

## Requisitos

- Docker y Docker Compose
- Node.js (si quieres ejecutar sin Docker)

## Instalación

1. Clona el repositorio
```bash
git clone https://github.com/tu-usuario/fotocopias-app.git
cd fotocopias-app
```

2. Configura las variables de entorno
```bash
# En la raíz del proyecto, crea un archivo .env
cp backend/.env.example backend/.env
```

3. Construye y ejecuta con Docker
```bash
docker-compose up --build
```

4. Accede a la aplicación
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Admin Panel: http://localhost:3000/admin

## Credenciales de Admin

Por defecto:
- Email: admin@admin.com
- Contraseña: password123

## API Endpoints

### Públicos
- `GET /api/products` - Obtener productos
- `POST /api/orders` - Crear orden

### Protegidos (requieren autenticación)
- `POST /api/auth/login` - Login
- `GET /api/orders` - Listar órdenes
- `PUT /api/orders/:id/status` - Actualizar estado
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto
