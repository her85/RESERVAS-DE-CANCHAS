const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');

// Listar reservas
router.get('/', reservasController.listarReservas);
// Crear reserva
router.post('/', reservasController.crearReserva);
// Editar reserva
router.post('/editar/:id', reservasController.editarReserva);
// Eliminar reserva
router.post('/eliminar/:id', reservasController.eliminarReserva);

module.exports = router;