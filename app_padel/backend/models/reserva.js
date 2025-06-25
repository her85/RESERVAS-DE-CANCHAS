class Reserva {
    constructor({ cancha, usuario, fecha, hora }) {
      this.cancha = cancha; // Debe ser ObjectId
      this.usuario = usuario; // Debe ser ObjectId
      this.fecha = fecha;
      this.hora = hora;
    }
    // Método para poblar datos relacionados (opcional, para futuro)
    static fromDb(doc) {
      return new Reserva({
        cancha: doc.cancha,
        usuario: doc.usuario,
        fecha: doc.fecha,
        hora: doc.hora
      });
    }
  }
  
  module.exports = Reserva;