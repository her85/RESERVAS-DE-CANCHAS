// migrarUsuariosReservas.js
require('dotenv').config();
const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://" + process.env.MONGODB_USR + ":" + process.env.MONGODB_PWD + "@cluster0.hloqam6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function migrarUsuariosEnReservas() {
  try {
    await client.connect();
    const db = client.db('canchas_padel');
    const reservas = await db.collection('reservas').find({}).toArray();
    let actualizadas = 0;
    for (const reserva of reservas) {
      // Si usuario ya es ObjectId, saltar
      if (typeof reserva.usuario === 'object' && reserva.usuario instanceof ObjectId) continue;
      // Buscar usuario por id string (puede ser string de ObjectId o email antiguo)
      let usuarioDoc = null;
      // Si es un string de ObjectId
      if (ObjectId.isValid(reserva.usuario)) {
        usuarioDoc = await db.collection('usuarios').findOne({ _id: new ObjectId(reserva.usuario) });
      }
      // Si no se encontró, intentar por email (caso muy raro)
      if (!usuarioDoc && typeof reserva.usuario === 'string') {
        usuarioDoc = await db.collection('usuarios').findOne({ email: reserva.usuario });
      }
      if (usuarioDoc) {
        await db.collection('reservas').updateOne(
          { _id: reserva._id },
          { $set: { usuario: usuarioDoc._id } }
        );
        actualizadas++;
      }
    }
    console.log(`Reservas actualizadas: ${actualizadas}`);
  } catch (error) {
    console.error('Error en la migración:', error);
  } finally {
    await client.close();
  }
}

migrarUsuariosEnReservas();
