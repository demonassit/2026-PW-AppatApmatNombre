//vamos atener funciones que se encargan de validar correo, boleta y contraseña

//wiii mas tarea siiiii

//aqui va funcion de correo
function validarCorreo(correo){

}

//aqui va funcion de boleta
function validarBoleta(boleta){

}

function validarContrasena(contrasena){
    if (typeof contrasena !== 'string') return false;
    return contrasena.length >= 8;
}

module.exports = {validarCorreo, validarBoleta, validarContrasena};

