class Usuario {
    constructor(nombre, email, password, rol = 'usuario') {
      this.nombre = nombre;
      this.email = email;
      this.password = password; // ¡Importante!: Encripta las contraseñas antes de guardarlas en la base de datos
      this.rol = rol;
    }
  }
  
  module.exports = Usuario;