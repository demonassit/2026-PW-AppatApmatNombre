//vamos atener funciones que se encargan de validar correo, boleta y contraseña

//wiii mas tarea siiiii

//aqui va funcion de correo
function validarCorreo(correo){
    if (typeof correo !== 'string') return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim());
}

//aqui va funcion de boleta
function validarBoleta(boleta){
    if (typeof boleta !== 'string') return false;
    return /^\d{10}$/.test(boleta.trim());
}

function validarContrasena(contrasena){
    if (typeof contrasena !== 'string') return false;
    return contrasena.length >= 8;
}

module.exports = {validarCorreo, validarBoleta, validarContrasena};

