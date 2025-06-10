# Canchas de Pádel

Aplicación web para la reserva de canchas de pádel. Permite a los usuarios consultar la disponibilidad, seleccionar fecha y hora, y realizar reservas de manera sencilla.

## Características principales
- Visualización de disponibilidad de canchas en tiempo real
- Reserva de canchas por fecha y hora
- Gestión de usuarios
- Panel de administración (opcional)

## Tecnologías utilizadas
- **Node.js**: Entorno de ejecución para la lógica de servidor y API
- **Express**: Framework web para Node.js
- **MongoDB**: Base de datos NoSQL para usuarios, canchas y reservas
- **EJS**: Motor de plantillas para renderizar vistas dinámicas
- **JavaScript**: Lógica de cliente y servidor
- **CSS**: Estilos y diseño de la aplicación
- **Dotenv**: Gestión de variables de entorno
- **Body-parser**: Middleware para procesar datos de formularios

## Instalación y ejecución
1. Clona el repositorio:
   ```bash
   git clone <url-del-repositorio>
   ```
2. Instala las dependencias:
   ```bash
   cd RESERVAS CANCHAS/app_padel
   npm install
   ```
3. Configura las variables de entorno en un archivo `.env` (ver ejemplo `.env.example` si existe).
4. Inicia la aplicación:
   ```bash
   npm start
   ```
5. Accede a la app desde tu navegador en `http://localhost:3000` (o el puerto configurado).

## Estructura del proyecto
- `backend/`: Lógica de servidor, rutas, modelos y controladores
- `frontend/`: Vistas y recursos estáticos
- `docs/`: Documentación adicional


