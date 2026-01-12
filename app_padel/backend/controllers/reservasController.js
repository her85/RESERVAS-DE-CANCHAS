// Controlador para reservas
const { client, connectToDb } = require('../database/db');
const Reserva = require('../models/reserva');
const { ObjectId } = require('mongodb');

module.exports = {
  // Crear reserva
  crearReserva: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const { cancha, usuario, fecha, hora, duracion } = req.body;
      // Si el usuario está autenticado, usar su id de sesión
      let usuarioId = req.session && req.session.userId ? req.session.userId : usuario;
      // Asegurar que usuarioId sea ObjectId si es válido
      usuarioId = ObjectId.isValid(usuarioId) ? new ObjectId(usuarioId) : usuarioId;
      // Guardar el ObjectId de la cancha
      const canchaId = ObjectId.isValid(cancha) ? new ObjectId(cancha) : cancha;
      // Validar formato y restricciones: hora en punto y duracion 1 o 2
      const dur = parseInt(duracion) || 1;
      if (![1, 2].includes(dur)) {
        throw new Error('Duración inválida');
      }
      if (!/^([01]\d|2[0-3]):00$/.test(hora)) {
        throw new Error('Solo se permiten reservas en horas redondas (ej. 14:00)');
      }
      // Validar que la fecha+hora de inicio no sea menor a ahora
      const reservaDate = new Date(`${fecha}T${hora}:00`);
      const now = new Date();
      if (isNaN(reservaDate.getTime())) {
        throw new Error('Fecha u hora inválida');
      }
      if (reservaDate < now) {
        // Obtener canchas y usuarios para renderizar la vista con datos
        const canchas = await db.collection('canchas').find().toArray();
        const usuarios = req.session.userRole === 'admin' ? await db.collection('usuarios').find({}, { projection: { password: 0 } }).toArray() : [];
        return res.status(400).render('reserva', { reservas: [], canchas, usuarios, error: 'La reserva no puede ser anterior a la fecha y hora actual.', backTo: '/canchas' });
      }
      // Validar disponibilidad: comprobar solapamientos considerando duracion (1 o 2 horas)
      const existentes = await db.collection('reservas').find({ cancha: canchaId, fecha }).toArray();
      const startHour = parseInt(hora.split(':')[0]);
      const endHour = startHour + dur;
      for (const ex of existentes) {
        const exStart = parseInt((ex.hora || '00:00').split(':')[0]);
        const exDur = ex.duracion ? parseInt(ex.duracion) : 1;
        const exEnd = exStart + exDur;
        if (startHour < exEnd && exStart < endHour) {
          const canchas = await db.collection('canchas').find().toArray();
          const usuarios = req.session.userRole === 'admin' ? await db.collection('usuarios').find({}, { projection: { password: 0 } }).toArray() : [];
          return res.status(400).render('reserva', { reservas: [], canchas, usuarios, error: 'La cancha ya está reservada en ese rango horario.', backTo: '/canchas' });
        }
      }

      const reservaObj = new Reserva({ cancha: canchaId, usuario: usuarioId, fecha, hora, duracion: dur });
      await db.collection('reservas').insertOne(reservaObj);
      res.redirect('/reservas');
    } catch (error) {
      const errorMsg = error.message.includes('No se pudo conectar a la base de datos')
        ? error.message
        : 'Error al crear la reserva';
      res.status(500).render('reserva', { reservas: [], error: errorMsg });
    }
  },
  // Listar reservas
  listarReservas: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      // Obtener todas las canchas para el select en la vista
      const canchas = await db.collection('canchas').find().toArray();
      // Obtener todos los usuarios solo si el rol es admin
      let usuarios = [];
      if (req.session.userRole === 'admin') {
        usuarios = await db.collection('usuarios').find({}, { projection: { password: 0 } }).toArray();
      }
      // Filtro: si no es admin, solo mostrar sus reservas
      let match = {};
      if (req.session.userRole !== 'admin') {
        const userId = ObjectId.isValid(req.session.userId) ? new ObjectId(req.session.userId) : req.session.userId;
        match = { usuario: userId };
      }
      // Hacer lookup para traer el nombre de la cancha y del usuario
      const reservas = await db.collection('reservas').aggregate([
        { $match: match },
        {
          $lookup: {
            from: 'canchas',
            localField: 'cancha',
            foreignField: '_id',
            as: 'canchaObj'
          }
        },
        {
          $unwind: {
            path: '$canchaObj',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $lookup: {
            from: 'usuarios',
            localField: 'usuario',
            foreignField: '_id',
            as: 'usuarioObj'
          }
        },
        {
          $unwind: {
            path: '$usuarioObj',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $addFields: {
            cancha: '$canchaObj',
            usuario: '$usuarioObj'
          }
        },
        {
          $project: {
            canchaObj: 0,
            usuarioObj: 0,
            'usuario.password': 0 // nunca mostrar password
          }
        }
      ]).toArray();
      res.render('reserva', { reservas, canchas, usuarios });
    } catch (error) {
      const errorMsg = error.message.includes('No se pudo conectar a la base de datos')
        ? error.message
        : 'Error al obtener reservas';
      res.status(500).render('reserva', { reservas: [], canchas: [], usuarios: [], error: errorMsg });
    }
  },
  // Editar reserva
  editarReserva: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const { id } = req.params;
      const { cancha, usuario, fecha, hora, duracion } = req.body;
      // Guardar el ObjectId de la cancha
      const canchaId = ObjectId.isValid(cancha) ? new ObjectId(cancha) : cancha;
      const isForm = req.method === 'POST' || (req.headers['content-type'] && req.headers['content-type'].includes('application/x-www-form-urlencoded'));
      // Validar que la fecha+hora no sea menor a ahora (si se proporciona)
      if (fecha && hora) {
        if (!/^([01]\d|2[0-3]):00$/.test(hora)) {
          if (isForm) {
            const canchas = await db.collection('canchas').find().toArray();
            const usuarios = req.session.userRole === 'admin' ? await db.collection('usuarios').find({}, { projection: { password: 0 } }).toArray() : [];
            return res.status(400).render('reserva', { reservas: [], canchas, usuarios, error: 'Solo se permiten reservas en horas redondas (ej. 14:00)', backTo: '/reservas' });
          }
          return res.status(400).send('Solo se permiten reservas en horas redondas (ej. 14:00)');
        }
        const dur = parseInt(duracion) || 1;
        if (![1, 2].includes(dur)) {
          if (isForm) {
            const canchas = await db.collection('canchas').find().toArray();
            const usuarios = req.session.userRole === 'admin' ? await db.collection('usuarios').find({}, { projection: { password: 0 } }).toArray() : [];
            return res.status(400).render('reserva', { reservas: [], canchas, usuarios, error: 'Duración inválida', backTo: '/reservas' });
          }
          return res.status(400).send('Duración inválida');
        }
        const reservaDate = new Date(`${fecha}T${hora}:00`);
        const now = new Date();
        if (isNaN(reservaDate.getTime())) {
          if (isForm) {
            const canchas = await db.collection('canchas').find().toArray();
            const usuarios = req.session.userRole === 'admin' ? await db.collection('usuarios').find({}, { projection: { password: 0 } }).toArray() : [];
            return res.status(400).render('reserva', { reservas: [], canchas, usuarios, error: 'Fecha u hora inválida', backTo: '/reservas' });
          }
          return res.status(400).send('Fecha u hora inválida');
        }
        if (reservaDate < now) {
          if (isForm) {
            const canchas = await db.collection('canchas').find().toArray();
            const usuarios = req.session.userRole === 'admin' ? await db.collection('usuarios').find({}, { projection: { password: 0 } }).toArray() : [];
            return res.status(400).render('reserva', { reservas: [], canchas, usuarios, error: 'La reserva no puede ser anterior a la fecha y hora actual.', backTo: '/reservas' });
          }
          return res.status(400).send('La reserva no puede ser anterior a la fecha y hora actual.');
        }
      }
      // Si el usuario no es admin, forzar el usuario de la sesión
      let usuarioId = usuario;
      if (req.session.userRole !== 'admin') {
        usuarioId = req.session.userId;
      }
      // Asegurar que usuarioId sea ObjectId si es válido
      const usuarioObjId = ObjectId.isValid(usuarioId) ? new ObjectId(usuarioId) : usuarioId;
      // Validar solapamientos si se cambió fecha/hora/duracion
      if (fecha && hora) {
        const dur = parseInt(duracion) || 1;
        const startHour = parseInt(hora.split(':')[0]);
        const endHour = startHour + dur;
        const existentes = await db.collection('reservas').find({ cancha: canchaId, fecha, _id: { $ne: new ObjectId(id) } }).toArray();
        for (const ex of existentes) {
          const exStart = parseInt((ex.hora || '00:00').split(':')[0]);
          const exDur = ex.duracion ? parseInt(ex.duracion) : 1;
          const exEnd = exStart + exDur;
          if (startHour < exEnd && exStart < endHour) {
              if (isForm) {
                const canchas = await db.collection('canchas').find().toArray();
                const usuarios = req.session.userRole === 'admin' ? await db.collection('usuarios').find({}, { projection: { password: 0 } }).toArray() : [];
                return res.status(400).render('reserva', { reservas: [], canchas, usuarios, error: 'La cancha ya está reservada en ese rango horario.', backTo: '/reservas' });
              }
              return res.status(400).send('La cancha ya está reservada en ese rango horario.');
            }
        }
      }
        await db.collection('reservas').updateOne(
          { _id: new ObjectId(id) },
          { $set: { cancha: canchaId, usuario: usuarioObjId, fecha, hora, duracion: parseInt(duracion) || 1 } }
        );
        // Si el formulario viene del HTML, mostrar mensaje centrado y redirigir tras unos segundos
        if (isForm) {
          // obtener listas y reservas para renderizar
          const canchas = await db.collection('canchas').find().toArray();
          const usuarios = (typeof req.session.userRole !== 'undefined' && req.session.userRole === 'admin') ? await db.collection('usuarios').find({}, { projection: { password: 0 } }).toArray() : [];
          // obtener reservas (mismo pipeline que en listarReservas)
          let match = {};
          if (!(typeof req.session.userRole !== 'undefined' && req.session.userRole === 'admin')) {
            const userId = ObjectId.isValid(req.session.userId) ? new ObjectId(req.session.userId) : req.session.userId;
            match = { usuario: userId };
          }
          const reservas = await db.collection('reservas').aggregate([
            { $match: match },
            { $lookup: { from: 'canchas', localField: 'cancha', foreignField: '_id', as: 'canchaObj' } },
            { $unwind: { path: '$canchaObj', preserveNullAndEmptyArrays: true } },
            { $lookup: { from: 'usuarios', localField: 'usuario', foreignField: '_id', as: 'usuarioObj' } },
            { $unwind: { path: '$usuarioObj', preserveNullAndEmptyArrays: true } },
            { $addFields: { cancha: '$canchaObj', usuario: '$usuarioObj' } },
            { $project: { canchaObj: 0, usuarioObj: 0, 'usuario.password': 0 } }
          ]).toArray();
          return res.render('reserva', { reservas, canchas, usuarios, success: 'Reserva actualizada correctamente.', backTo: '/reservas' });
        }
        return res.redirect('/reservas');
    } catch (error) {
      console.error('Error al editar la reserva:', error);
        if (req.method === 'POST') {
          try {
            await connectToDb();
            const db = client.db('canchas_padel');
            const canchas = await db.collection('canchas').find().toArray();
            const usuarios = (typeof req.session.userRole !== 'undefined' && req.session.userRole === 'admin') ? await db.collection('usuarios').find({}, { projection: { password: 0 } }).toArray() : [];
            return res.status(500).render('reserva', { reservas: [], canchas, usuarios, error: 'Error al editar la reserva', backTo: '/reservas' });
          } catch (err) {
            return res.status(500).send('Error al editar la reserva');
          }
        }
        res.status(500).send('Error al editar la reserva');
    }
  },
  // Eliminar reserva
  eliminarReserva: async (req, res) => {
    try {
      await connectToDb();
      const db = client.db('canchas_padel');
      const { id } = req.params;
      // Seguridad: solo admin puede eliminar cualquier reserva, usuario solo la suya
      let filtro = { _id: new ObjectId(id) };
      if (req.session.userRole !== 'admin') {
        filtro.usuario = req.session.userId;
      }
      const resultado = await db.collection('reservas').deleteOne(filtro);
      if (resultado.deletedCount === 0) {
        return res.status(403).send('No tienes permiso para eliminar esta reserva.');
      }
      res.redirect('/reservas');
    } catch (error) {
      console.error('Error al eliminar la reserva:', error);
      res.status(500).send('Error al eliminar la reserva');
    }
  }
};
