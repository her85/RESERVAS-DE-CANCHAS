// Controlador para usuarios
const { client, connectToDb } = require('../database/db');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');

module.exports = {
  // Crear usuario (registro)
  crearUsuario: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const { nombre, email, password } = req.body;
      // Validación básica
      if (!nombre || !email || !password) {
        return res.render('registro', { error: 'Todos los campos son obligatorios', success: null });
      }
      // Verifica si el usuario ya existe
      const existe = await db.collection('usuarios').findOne({ email });
      if (existe) {
        return res.render('registro', { error: 'El email ya está registrado', success: null });
      }
      // Encripta la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);
      // Permitir asignar rol solo si el usuario autenticado es admin (para pruebas, por ahora solo usuario normal)
      const rol = req.body.rol && req.session.userRole === 'admin' ? req.body.rol : 'usuario';
      const nuevoUsuario = new Usuario(nombre, email, hashedPassword, rol);
      await db.collection('usuarios').insertOne(nuevoUsuario);
      return res.render('registro', { error: null, success: 'Usuario registrado correctamente. Ahora puedes iniciar sesión.' });
    } catch (error) {
      const errorMsg = error.message.includes('No se pudo conectar a la base de datos')
        ? error.message
        : 'Error al registrar el usuario';
      return res.render('registro', { error: errorMsg, success: null });
    }
  },
  // Listar usuarios
  listarUsuarios: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const usuarios = await db.collection('usuarios').find().toArray();
      res.render('usuarios', { usuarios });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).send('Error al obtener usuarios');
    }
  },
  // Editar usuario
  editarUsuario: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send('ID de usuario inválido');
      }
      const { nombre, email, password } = req.body;
      let updateFields = { nombre, email };
      if (password) {
        updateFields.password = await bcrypt.hash(password, 10);
      }
      await db.collection('usuarios').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields }
      );
      res.redirect('/usuarios');
    } catch (error) {
      console.error('Error al editar el usuario:', error);
      res.status(500).send('Error al editar el usuario');
    }
  },
  // Eliminar usuario
  eliminarUsuario: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send('ID de usuario inválido');
      }
      await db.collection('usuarios').deleteOne({ _id: new ObjectId(id) });
      res.redirect('/usuarios');
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      res.status(500).send('Error al eliminar el usuario');
    }
  },
  // Login de usuario
  loginUsuario: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const { email, password } = req.body;
      if (!email || !password) {
        return res.render('login', { error: 'Email y contraseña son obligatorios', success: null });
      }
      const usuario = await db.collection('usuarios').findOne({ email });
      if (!usuario) {
        return res.render('login', { error: 'Usuario no encontrado', success: null });
      }
      const match = await bcrypt.compare(password, usuario.password);
      if (!match) {
        return res.render('login', { error: 'Contraseña incorrecta', success: null });
      }
      req.session.userId = usuario._id;
      req.session.userName = usuario.nombre;
      req.session.userRole = usuario.rol || 'usuario';
      return res.redirect('/canchas');
    } catch (error) {
      const errorMsg = error.message.includes('No se pudo conectar a la base de datos')
        ? error.message
        : 'Error al iniciar sesión';
      return res.render('login', { error: errorMsg, success: null });
    }
  }
};
