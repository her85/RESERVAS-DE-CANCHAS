require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');

const MONGODB_USR = process.env.MONGODB_USR;
const MONGODB_PWD = process.env.MONGODB_PWD;
if (!MONGODB_USR || !MONGODB_PWD) {
  console.error('Faltan variables de entorno MONGODB_USR o MONGODB_PWD');
  process.exit(1);
}

const uri = "mongodb+srv://" + MONGODB_USR + ":" + MONGODB_PWD + "@cluster0.hloqam6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function seedAdmin() {
  try {
    await client.connect();
    const db = client.db('canchas_padel');

    const email = process.env.ADMIN_EMAIL || 'admin@local.dev';
    const nombre = process.env.ADMIN_NAME || 'Administrador';
    const plainPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

    const existing = await db.collection('usuarios').findOne({ email });
    const hashed = await bcrypt.hash(plainPassword, 10);

    if (existing) {
      await db.collection('usuarios').updateOne(
        { _id: existing._id },
        { $set: { rol: 'admin', nombre, password: hashed } }
      );
      console.log(`Usuario admin actualizado: ${email}`);
    } else {
      const nuevo = { nombre, email, password: hashed, rol: 'admin' };
      await db.collection('usuarios').insertOne(nuevo);
      console.log(`Usuario admin creado: ${email}`);
    }
  } catch (err) {
    console.error('Error al ejecutar seedAdmin:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

seedAdmin();
