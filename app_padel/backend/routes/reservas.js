const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const reservasController = require('../controllers/reservasController');

// Listar reservas
router.get('/', reservasController.listarReservas);
// Crear reserva
router.post('/',
  [
    body('cancha').trim().escape().notEmpty().withMessage('Cancha requerida'),
    body('usuario').optional().trim().escape(),
    body('fecha').isISO8601().withMessage('Fecha inválida'),
    body('hora').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Hora inválida')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('reserva', { reservas: [], error: errors.array().map(e => e.msg).join(', ') });
    }
    next();
  },
  reservasController.crearReserva
);
// Editar reserva (PUT)
router.put('/:id',
  [
    body('cancha').optional().trim().escape().notEmpty().withMessage('Cancha requerida'),
    body('usuario').optional().trim().escape(),
    body('fecha').optional().isISO8601().withMessage('Fecha inválida'),
    body('hora').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Hora inválida')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    next();
  },
  reservasController.editarReserva
);
// Eliminar reserva (DELETE)
router.delete('/:id', reservasController.eliminarReserva);

module.exports = router;