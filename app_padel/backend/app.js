const express = require('express');
const bodyParser = require('body-parser'); //Middleware
const path = require("path");
const session = require('express-session');
// const csurf = require('csurf');
// const helmet = require('helmet');
const app = express();

// Seguridad HTTP headers
// app.use(helmet({
//   contentSecurityPolicy: {
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
//       styleSrc: ["'self'", "https://cdn.jsdelivr.net", "'unsafe-inline'"],
//       imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
//       connectSrc: ["'self'"],
//       fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
//       objectSrc: ["'none'"],
//       upgradeInsecureRequests: [],
//     },
//   },
// }));

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'padel_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Sesión expira al cerrar el navegador
}));

// Protección CSRF
// app.use(csurf());
// app.use((req, res, next) => {
//   res.locals.csrfToken = req.csrfToken();
//   res.locals.userId = req.session.userId;
//   res.locals.userRole = req.session.userRole;
//   next();
// });

// Configuramos el servidor para usar archivos estáticos
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use(bodyParser.urlencoded({ extended: true }));  // Habilita el análisis de cuerpos de solicitud
// Configuramos el motor de plantillas a usar y la carpeta donde se encuentran
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "../frontend/views"));

// Middleware para pasar variables globales a todas las vistas
app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.userRole = req.session.userRole;
  res.locals.currentPath = req.path;
  next();
});

// Rutas
const canchasRoutes = require('./routes/canchas');
const reservasRoutes = require('./routes/reservas');
const usuariosRoutes = require('./routes/usuarios');

// Middleware para proteger rutas sensibles
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/usuarios/login');
  }
  next();
}

// Middleware para roles
function requireRole(role) {
  return function (req, res, next) {
    if (!req.session.userRole || req.session.userRole !== role) {
      // Si es una vista, redirigir a inicio
      return res.redirect('/');
    }
    next();
  };
}

// Proteger rutas de reservas y usuarios (solo autenticados)
app.use('/reservas', requireLogin);
// Solo proteger /usuarios excepto login y registro
app.use('/usuarios', (req, res, next) => {
  if (req.path === '/login' || req.path === '/registro') {
    return next();
  }
  return requireLogin(req, res, next);
});
// Proteger vista de usuarios solo para admin
app.use('/usuarios', (req, res, next) => {
  if (req.path === '/' && req.method === 'GET') {
    return requireRole('admin')(req, res, next);
  }
  next();
});

// Usar routers
app.use('/canchas', canchasRoutes);
app.use('/reservas', reservasRoutes);
app.use('/usuarios', usuariosRoutes);

// Rutas públicas
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/usuarios/login', (req, res) => {
  res.render('login');
});
app.get('/usuarios/registro', (req, res) => {
  res.render('registro');
});
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error al cerrar sesión');
    }
    res.redirect('/usuarios/login');
  });
});

// Manejo de errores CSRF
// app.use((err, req, res, next) => {
//   if (err.code === 'EBADCSRFTOKEN') {
//     return res.status(403).render('login', { error: 'Sesión expirada o token CSRF inválido. Por favor, recarga la página e intenta de nuevo.', success: null });
//   }
//   next(err);
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor iniciado en el puerto http://localhost:${PORT}`));