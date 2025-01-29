const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuario');

// Ruta para registrar un usuario
router.post('/registro', async (req, res) => {
  try {
    const db = client.db('padel');
    const { nombre, email, password } = req.body;

    // ¡Importante!: Encripta la contraseña antes de guardarla
    // const hashedPassword = await bcrypt.hash(password, 10); // Ejemplo usando bcrypt

    const nuevoUsuario = new Usuario(nombre, email, password); // Guarda la contraseña encriptada

    const result = await db.collection('usuarios').insertOne(nuevoUsuario);

    res.redirect('/usuarios/login'); // Redirige al usuario a la página de inicio de sesión
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).send('Error al registrar el usuario');
  }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const db = client.db('canchas_padel');
    const { email, password } = req.body;

    const usuario = await db.collection('usuarios').findOne({ email });

    if (usuario) {
      // ¡Importante!: Compara la contraseña ingresada con la contraseña encriptada en la base de datos
      // const match = await bcrypt.compare(password, usuario.password); // Ejemplo usando bcrypt

      if (password === usuario.password) { //  Reemplaza con la comparación correcta
        // Si las contraseñas coinciden, crea una sesión o token para el usuario
        req.session.userId = usuario._id; // Ejemplo usando sesiones de Express

        res.redirect('/'); // Redirige al usuario a la página principal
      } else {
        res.send('Contraseña incorrecta');
      }
    } else {
      res.send('Usuario no encontrado');
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).send('Error al iniciar sesión');
  }
});

// Otras rutas para obtener, modificar o eliminar usuarios si es necesario
// ...

module.exports = router;