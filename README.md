# Canchas de Pádel

Aplicación web para la reserva de canchas de pádel. Permite a los usuarios consultar la disponibilidad, seleccionar fecha y hora, y realizar reservas de manera sencilla.

## Características principales
- Visualización de disponibilidad de canchas en tiempo real
- Reserva de canchas por fecha y hora
- Gestión de usuarios (registro, login, edición, eliminación)
- Gestión de reservas (crear, listar, editar, eliminar)
- Panel de administración (en desarrollo)
- Seguridad: contraseñas encriptadas, rutas protegidas, sesiones
- Feedback visual de errores y éxito en formularios
- Pruebas automatizadas con Jest y Supertest

## Tecnologías utilizadas
- **Node.js**: Entorno de ejecución para la lógica de servidor y API
- **Express**: Framework web para Node.js
- **MongoDB**: Base de datos NoSQL para usuarios, canchas y reservas
- **EJS**: Motor de plantillas para renderizar vistas dinámicas
- **JavaScript**: Lógica de cliente y servidor
- **CSS**: Estilos y diseño de la aplicación
- **Dotenv**: Gestión de variables de entorno
- **Body-parser**: Middleware para procesar datos de formularios
- **bcrypt**: Encriptación de contraseñas
- **express-session**: Manejo de sesiones
- **Jest** y **Supertest**: Pruebas automatizadas

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
- `tests/`: Pruebas automatizadas

---

# Documentación de Endpoints y Flujo de la App

## Endpoints principales

### Usuarios
- `GET /usuarios` — Listar usuarios (protegido, requiere login)
- `POST /usuarios/registro` — Registrar usuario
- `POST /usuarios/login` — Iniciar sesión
- `POST /usuarios/editar/:id` — Editar usuario (protegido)
- `POST /usuarios/eliminar/:id` — Eliminar usuario (protegido)

### Reservas
- `GET /reservas` — Listar reservas (protegido)
- `POST /reservas` — Crear reserva (protegido)
- `POST /reservas/editar/:id` — Editar reserva (protegido)
- `POST /reservas/eliminar/:id` — Eliminar reserva (protegido)

### Canchas
- `GET /canchas` — Listar canchas

### Autenticación y vistas
- `GET /usuarios/login` — Formulario de login
- `GET /usuarios/registro` — Formulario de registro
- `GET /` — Página principal

## Flujo de la app
1. El usuario se registra o inicia sesión.
2. Si está autenticado, puede acceder a reservas y usuarios.
3. Puede crear, editar y eliminar reservas y usuarios.
4. Las contraseñas se almacenan encriptadas y las rutas protegidas requieren sesión activa.

## Seguridad
- Las rutas protegidas usan middleware para exigir autenticación.
- Las contraseñas se encriptan con bcrypt.
- Sesiones gestionadas con express-session.

## Pruebas automatizadas

Las pruebas se encuentran en la carpeta `tests/` y usan Jest y Supertest.

Ejemplo de prueba:
```js
const request = require('supertest');
const app = require('../backend/app');

describe('Registro de usuario', () => {
  it('debe rechazar registro sin email', async () => {
    const res = await request(app)
      .post('/usuarios/registro')
      .send({ nombre: 'Test', password: '1234' });
    expect(res.text).toContain('obligatorios');
  });
});
```

Para ejecutar las pruebas:
1. Instala dependencias: `npm install --save-dev jest supertest`
2. Ejecuta: `npm test`

---

## Autor
- [Hernan Botto]