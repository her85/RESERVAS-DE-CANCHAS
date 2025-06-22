const express = require('express');
const bodyParser = require('body-parser'); //Middleware
const path = require("path");
const session = require('express-session');
const app = express();

// Configuración de sesiones
app.use(session({
  secret: process.env.SESSION_SECRET || 'padel_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 día
}));

// Configuramos el servidor para usar archivos estáticos
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use(bodyParser.urlencoded({ extended: true }));  // Habilita el análisis de cuerpos de solicitud
// Configuramos el motor de plantillas a usar y la carpeta donde se encuentran
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "../frontend/views"));

// Rutas
const canchasRoutes = require('./routes/canchas');
const reservasRoutes = require('./routes/reservas');
const usuariosRoutes = require('./routes/usuarios');

app.use('/canchas', canchasRoutes);
app.use('/reservas', reservasRoutes);
app.use('/usuarios', usuariosRoutes);

// Middleware para proteger rutas sensibles
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/usuarios/login');
  }
  next();
}

// Proteger rutas de reservas y usuarios
app.use('/reservas', requireLogin);
app.use('/usuarios', requireLogin);

app.get('/', (req, res) => {
  res.render('index');
});

// Mantén accesibles las rutas de registro y login
app.get('/usuarios/login', (req, res) => {
  res.render('login');
});
app.get('/usuarios/registro', (req, res) => {
  res.render('registro');
});
// Renderizar listado de reservas
app.get('/reservas', (req, res, next) => {
  // Delega en el controlador de reservas (ya implementado en la ruta)
  require('./routes/reservas')(req, res, next);
});
// Renderizar listado de usuarios
app.get('/usuarios', (req, res, next) => {
  require('./routes/usuarios')(req, res, next);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor iniciado en el puerto http://localhost:${PORT}`));