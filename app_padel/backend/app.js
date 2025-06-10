const express = require('express');
const bodyParser = require('body-parser'); //Middleware
const path = require("path");
const app = express();

// Configuramos el servidor para usar archivos estáticos
app.use(express.static(path.join(__dirname, "../frontend/public")));
app.use(bodyParser.urlencoded({ extended: true }));  // Habilita el análisis de cuerpos de solicitud
// Configuramos el motor de plantillas a usar y la carpeta donde se encuentran
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "../frontend/views"));

// Rutas
const canchasRoutes = require('./routes/canchas');
//const reservasRoutes = require('./routes/reservas');
//const usuariosRoutes = require('./routes/usuarios');

app.use('/canchas', canchasRoutes);
//app.use('/reservas', reservasRoutes);
//app.use('/usuarios', usuariosRoutes);

app.get('/', (req, res) => {
  res.render('index');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor iniciado en el puerto http://localhost:${PORT}`));