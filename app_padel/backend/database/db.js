require('dotenv').config();

const { MongoClient, ServerApiVersion } = require("mongodb");
const { MONGODB_USR, MONGODB_PWD } =  require("./config");

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

// Función para conectar a la base de datos y devolver el cliente
async function connectToDb() {
  try {
    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
      console.log("Conectado a MongoDB!");
    }
    return client;
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error);
    throw error;
  }
}

module.exports = { client, connectToDb };