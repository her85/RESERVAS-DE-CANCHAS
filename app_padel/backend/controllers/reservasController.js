// Controlador para reservas
const { client, connectToDb } = require('../database/db');
const Reserva = require('../models/reserva');

module.exports = {
  // Crear reserva
  crearReserva: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const { cancha, usuario, fecha, hora } = req.body;
      const nuevaReserva = new Reserva(cancha, usuario, fecha, hora);
      await db.collection('reservas').insertOne(nuevaReserva);
      res.redirect('/reservas');
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      res.status(500).send('Error al crear la reserva');
    }
  },
  // Listar reservas
  listarReservas: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const reservas = await db.collection('reservas').find().toArray();
      res.render('reserva', { reservas });
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      res.status(500).send('Error al obtener reservas');
    }
  },
  // Editar reserva
  editarReserva: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const { id } = req.params;
      const { cancha, usuario, fecha, hora } = req.body;
      await db.collection('reservas').updateOne(
        { _id: require('mongodb').ObjectId(id) },
        { $set: { cancha, usuario, fecha, hora } }
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
      await db.collection('reservas').deleteOne({ _id: require('mongodb').ObjectId(id) });
      res.redirect('/reservas');
    } catch (error) {
      console.error('Error al eliminar la reserva:', error);
      res.status(500).send('Error al eliminar la reserva');
    }
  }
};
