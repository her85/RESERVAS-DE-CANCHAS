require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion } = require("mongodb");
const { MONGODB_USR, MONGODB_PWD } =  require("./config/config.js");
const bodyParser = require('body-parser'); //Middleware
const app = express();

// Conexión a MongoDB utilizando variables de entorno
const uri =
  "mongodb+srv://" + MONGODB_USR + ":" + MONGODB_PWD + "@cluster0.hloqam6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Creamos un nuevo cliente de MongoDB con la versión estable de la API
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Función para conectar a la base de datos
async function connectToDb() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB!");
    // Ahora puedes realizar operaciones de MongoDB usando el objeto `client`
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
  }
}

// Conectamos a la base de datos
connectToDb();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));  // Habilita el análisis de cuerpos de solicitud
app.use(express.static('public'));

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