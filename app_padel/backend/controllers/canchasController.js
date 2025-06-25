// Controlador para canchas
const { client, connectToDb } = require('../database/db');
const { ObjectId } = require('mongodb');

module.exports = {
  listarCanchas: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const canchas = await db.collection('canchas').find().toArray();
      res.render('canchas/index', { canchas });
    } catch (error) {
      const errorMsg = error.message.includes('No se pudo conectar a la base de datos')
        ? error.message
        : 'Error al obtener las canchas';
      res.status(500).render('canchas/index', { canchas: [], error: errorMsg });
    }
  },
  detalleCancha: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const cancha = await db.collection('canchas').findOne({ _id: new ObjectId(req.params.id) });
      if (!cancha) {
        return res.status(404).render('cancha', { cancha: null, error: 'Cancha no encontrada' });
      }
      res.render('cancha', { cancha, error: null });
    } catch (error) {
      console.error('Error detalleCancha:', error); // <--- asegúrate de tener esto
      const errorMsg = error.message.includes('No se pudo conectar a la base de datos')
        ? error.message
        : 'Error al obtener la cancha';
      res.status(500).render('cancha', { cancha: null, error: errorMsg });
    }
  }
};
