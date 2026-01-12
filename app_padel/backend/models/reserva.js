class Reserva {
  constructor({ cancha, usuario, fecha, hora, duracion = 1 }) {
    this.cancha = cancha; // Debe ser ObjectId
    this.usuario = usuario; // Debe ser ObjectId
    this.fecha = fecha;
    this.hora = hora; // formato 'HH:MM' (solo HH:00)
    this.duracion = duracion; // duracion en horas (1 o 2)
  }
  // Método para poblar datos relacionados (opcional, para futuro)
  static fromDb(doc) {
    return new Reserva({
      cancha: doc.cancha,
      usuario: doc.usuario,
      fecha: doc.fecha,
      hora: doc.hora,
      duracion: doc.duracion || 1
    });
  }
}
  
  module.exports = Reserva;