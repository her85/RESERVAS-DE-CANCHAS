const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const reservasController = require('../controllers/reservasController');
const { connectToDb, client } = require('../database/db');

// Listar reservas
router.get('/', reservasController.listarReservas);
// Crear reserva
router.post('/',
  [
    body('cancha').trim().escape().notEmpty().withMessage('Cancha requerida'),
    body('usuario').optional().trim().escape(),
    body('fecha').isISO8601().withMessage('Fecha inválida'),
    body('hora').matches(/^([01]\d|2[0-3]):00$/).withMessage('Hora inválida - solo en punto (ej. 14:00)'),
    body('duracion').optional().isIn(['1','2']).withMessage('Duración inválida'),
    // Fecha+hora no pueden ser en el pasado
    body('fecha').custom((fecha, { req }) => {
      const hora = req.body.hora;
      if (!hora) return true; // hora validada por otro middleware
      const reservaDate = new Date(`${fecha}T${hora}:00`);
      if (isNaN(reservaDate.getTime())) throw new Error('Fecha u hora inválida');
      if (reservaDate < new Date()) throw new Error('La reserva no puede ser anterior a la fecha y hora actual');
      return true;
    }),
    // Disponibilidad: comprobada en el controlador considerando duración
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
    body('hora').optional().matches(/^([01]\d|2[0-3]):00$/).withMessage('Hora inválida - solo en punto (ej. 14:00)'),
    body('duracion').optional().isIn(['1','2']).withMessage('Duración inválida')
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
// Editar reserva (POST para formularios HTML)
router.post('/editar/:id',
  [
    body('cancha').optional().trim().escape().notEmpty().withMessage('Cancha requerida'),
    body('usuario').optional().trim().escape(),
    body('fecha').optional().isISO8601().withMessage('Fecha inválida'),
    body('hora').optional().matches(/^([01]\d|2[0-3]):00$/).withMessage('Hora inválida - solo en punto (ej. 14:00)'),
    body('duracion').optional().isIn(['1','2']).withMessage('Duración inválida'),
    // Si se proporciona fecha y hora, no pueden ser pasado
    body('fecha').custom((fecha, { req }) => {
      const hora = req.body.hora;
      if (!fecha || !hora) return true;
      const reservaDate = new Date(`${fecha}T${hora}:00`);
      if (isNaN(reservaDate.getTime())) throw new Error('Fecha u hora inválida');
      if (reservaDate < new Date()) throw new Error('La reserva no puede ser anterior a la fecha y hora actual');
      return true;
    }),
    // Disponibilidad: comprobada en el controlador considerando duración
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('reserva', { reservas: [], error: errors.array().map(e => e.msg).join(', ') });
    }
    next();
  },
  reservasController.editarReserva
);
// Eliminar reserva (DELETE)
router.delete('/:id', reservasController.eliminarReserva);
// Eliminar reserva (POST para formularios HTML)
router.post('/eliminar/:id', reservasController.eliminarReserva);

module.exports = router;