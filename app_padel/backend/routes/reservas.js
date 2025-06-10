const express = require('express');
const router = express.Router();
const Reserva = require('../models/reserva');

// Ruta para crear una reserva
router.post('/', async (req, res) => {
  try {
    const db = client.db('canchas_padel');
    const { cancha, usuario, fecha, hora } = req.body;
    const nuevaReserva = new Reserva(cancha, usuario, fecha, hora);

    const result = await db.collection('reservas').insertOne(nuevaReserva);

    res.redirect('/reservas'); // Redirige a la página de reservas o a donde desees
  } catch (error) {
    console.error('Error al crear la reserva:', error);
    res.status(500).send('Error al crear la reserva');
  }
});

// Otras rutas para obtener, modificar o eliminar reservas si es necesario
// ...

module.exports = router;