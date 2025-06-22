// Controlador para usuarios
const { client, connectToDb } = require('../database/db');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');

module.exports = {
  // Crear usuario (registro)
  crearUsuario: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('padel');
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
      const nuevoUsuario = new Usuario(nombre, email, hashedPassword);
      await db.collection('usuarios').insertOne(nuevoUsuario);
      return res.render('registro', { error: null, success: 'Usuario registrado correctamente. Ahora puedes iniciar sesión.' });
    } catch (error) {
      console.error('Error al registrar el usuario:', error);
      return res.render('registro', { error: 'Error al registrar el usuario', success: null });
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
      const { nombre, email, password } = req.body;
      let updateFields = { nombre, email };
      if (password) {
        updateFields.password = await bcrypt.hash(password, 10);
      }
      await db.collection('usuarios').updateOne(
        { _id: require('mongodb').ObjectId(id) },
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
      await db.collection('usuarios').deleteOne({ _id: require('mongodb').ObjectId(id) });
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
      return res.render('login', { error: null, success: 'Inicio de sesión exitoso.' });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return res.render('login', { error: 'Error al iniciar sesión', success: null });
    }
  }
};
