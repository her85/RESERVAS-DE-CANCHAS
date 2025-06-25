const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const usuariosController = require('../controllers/usuariosController');

// Crear usuario (registro)
router.post('/registro',
  [
    body('nombre').trim().escape().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('registro', { error: errors.array().map(e => e.msg).join(', '), success: null });
    }
    next();
  },
  usuariosController.crearUsuario
);
// Login usuario
router.post('/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Contraseña inválida')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('login', { error: errors.array().map(e => e.msg).join(', '), success: null });
    }
    next();
  },
  usuariosController.loginUsuario
);
// Listar usuarios
router.get('/', usuariosController.listarUsuarios);
// Editar usuario (PUT)
router.put('/:id',
  [
    body('nombre').optional().trim().escape().notEmpty().withMessage('El nombre es obligatorio'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
    body('password').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    next();
  },
  usuariosController.editarUsuario
);
// Eliminar usuario (DELETE)
router.delete('/:id', usuariosController.eliminarUsuario);

module.exports = router;