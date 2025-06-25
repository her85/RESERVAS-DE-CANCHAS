// Controlador para reservas
const { client, connectToDb } = require('../database/db');
const Reserva = require('../models/reserva');
const { ObjectId } = require('mongodb');

module.exports = {
  // Crear reserva
  crearReserva: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const { cancha, usuario, fecha, hora } = req.body;
      // Si el usuario está autenticado, usar su id de sesión
      let usuarioId = req.session && req.session.userId ? req.session.userId : usuario;
      // Asegurar que usuarioId sea ObjectId si es válido
      usuarioId = ObjectId.isValid(usuarioId) ? new ObjectId(usuarioId) : usuarioId;
      // Guardar el ObjectId de la cancha
      const canchaId = ObjectId.isValid(cancha) ? new ObjectId(cancha) : cancha;
      const reservaObj = new Reserva({ cancha: canchaId, usuario: usuarioId, fecha, hora });
      await db.collection('reservas').insertOne(reservaObj);
      res.redirect('/reservas');
    } catch (error) {
      const errorMsg = error.message.includes('No se pudo conectar a la base de datos')
        ? error.message
        : 'Error al crear la reserva';
      res.status(500).render('reserva', { reservas: [], error: errorMsg });
    }
  },
  // Listar reservas
  listarReservas: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      // Obtener todas las canchas para el select en la vista
      const canchas = await db.collection('canchas').find().toArray();
      // Obtener todos los usuarios solo si el rol es admin
      let usuarios = [];
      if (req.session.userRole === 'admin') {
        usuarios = await db.collection('usuarios').find({}, { projection: { password: 0 } }).toArray();
      }
      // Filtro: si no es admin, solo mostrar sus reservas
      let match = {};
      if (req.session.userRole !== 'admin') {
        const userId = ObjectId.isValid(req.session.userId) ? new ObjectId(req.session.userId) : req.session.userId;
        match = { usuario: userId };
      }
      // Hacer lookup para traer el nombre de la cancha y del usuario
      const reservas = await db.collection('reservas').aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'canchas',
            localField: 'cancha',
            foreignField: '_id',
            as: 'canchaObj'
          }
        },
        {
          $unwind: {
            path: '$canchaObj',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'usuarios',
            localField: 'usuario',
            foreignField: '_id',
            as: 'usuarioObj'
          }
        },
        {
          $unwind: {
            path: '$usuarioObj',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            cancha: '$canchaObj',
            usuario: '$usuarioObj'
          }
        },
        {
          $project: {
            canchaObj: 0,
            usuarioObj: 0,
            'usuario.password': 0 // nunca mostrar password
          }
        }
      ]).toArray();
      res.render('reserva', { reservas, canchas, usuarios });
    } catch (error) {
      const errorMsg = error.message.includes('No se pudo conectar a la base de datos')
        ? error.message
        : 'Error al obtener reservas';
      res.status(500).render('reserva', { reservas: [], canchas: [], usuarios: [], error: errorMsg });
    }
  },
  // Editar reserva
  editarReserva: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const { id } = req.params;
      const { cancha, usuario, fecha, hora } = req.body;
      // Guardar el ObjectId de la cancha
      const canchaId = ObjectId.isValid(cancha) ? new ObjectId(cancha) : cancha;
      // Si el usuario no es admin, forzar el usuario de la sesión
      let usuarioId = usuario;
      if (req.session.userRole !== 'admin') {
        usuarioId = req.session.userId;
      }
      // Asegurar que usuarioId sea ObjectId si es válido
      const usuarioObjId = ObjectId.isValid(usuarioId) ? new ObjectId(usuarioId) : usuarioId;
      await db.collection('reservas').updateOne(
        { _id: new ObjectId(id) },
        { $set: { cancha: canchaId, usuario: usuarioObjId, fecha, hora } }
      );
      res.redirect('/reservas');
    } catch (error) {
      console.error('Error al editar la reserva:', error);
      res.status(500).send('Error al editar la reserva');
    }
  },
  // Eliminar reserva
  eliminarReserva: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const { id } = req.params;
      // Seguridad: solo admin puede eliminar cualquier reserva, usuario solo la suya
      let filtro = { _id: new ObjectId(id) };
      if (req.session.userRole !== 'admin') {
        filtro.usuario = req.session.userId;
      }
      const resultado = await db.collection('reservas').deleteOne(filtro);
      if (resultado.deletedCount === 0) {
        return res.status(403).send('No tienes permiso para eliminar esta reserva.');
      }
      res.redirect('/reservas');
    } catch (error) {
      console.error('Error al eliminar la reserva:', error);
      res.status(500).send('Error al eliminar la reserva');
    }
  }
};
