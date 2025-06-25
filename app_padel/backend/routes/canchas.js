const express = require('express');
const router = express.Router();
const { param, validationResult } = require('express-validator');
const canchasController = require('../controllers/canchasController');

// Ruta para obtener todas las canchas
router.get('/', canchasController.listarCanchas);
// Ruta para ver detalle de una cancha
router.get('/:id',
  [
    param('id').isMongoId().withMessage('ID de cancha inválido')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('cancha', { cancha: null, error: errors.array().map(e => e.msg).join(', ') });
    }
    next();
  },
  canchasController.detalleCancha
);

module.exports = router;