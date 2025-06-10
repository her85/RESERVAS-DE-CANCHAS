class Usuario {
    constructor(nombre, email, password) {
      this.nombre = nombre;
      this.email = email;
      this.password = password; // ¡Importante!: Encripta las contraseñas antes de guardarlas en la base de datos
    }
  }
  
  module.exports = Usuario;