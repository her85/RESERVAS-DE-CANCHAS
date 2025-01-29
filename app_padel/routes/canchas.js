const express = require('express');
const router = express.Router();
const Cancha = require('../models/cancha');

// Ruta para obtener todas las canchas
router.get('/', async (req, res) => {
  try {
    const db = client.db('canchas_padel'); // Obtén la base de datos
    const canchas = await db.collection('canchas').find().toArray(); // Usa find().toArray() para obtener todos los documentos

    res.render('canchas/index', { canchas }); // Renderiza la vista 'canchas/index.ejs' y pasa los datos de las canchas
  } catch (error) {
    console.error('Error al obtener las canchas:', error);
    res.status(500).send('Error al obtener las canchas');
  }
});

module.exports = router;