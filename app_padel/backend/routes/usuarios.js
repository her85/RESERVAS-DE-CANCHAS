const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');

// Crear usuario (registro)
router.post('/registro', usuariosController.crearUsuario);
// Login usuario
router.post('/login', usuariosController.loginUsuario);
// Listar usuarios
router.get('/', usuariosController.listarUsuarios);
// Editar usuario
router.post('/editar/:id', usuariosController.editarUsuario);
// Eliminar usuario
router.post('/eliminar/:id', usuariosController.eliminarUsuario);

module.exports = router;