const bcrypt = require('bcryptjs');
//necesitamos al modelo
const usuariosModel = require('../Modelo/usuarios');

const {validarCorreo, calidarBoleta, validarContrasena} = require('../validaciones')

//que pasa si el correo y la boleta se duplica
function esDuplicado(error){
    return error.code === 'ER_DUP_ENTRY' || error.code === '23505';
}


async function listarUsuarios(req , res) {
    try{
        const usuarios = await usuariosModel.listar();
        res.json(usuarios);
    }catch(error){
        res.status(500).json({error: error.message})
    }
    
}

async function obtenerUsuario(req, res) {
    try{
        const usuario = await usuariosModel.obtenerPorId(req.params.id);
        if(!usuario) return res.status(404).json({error: 'Usuario no encontrado'});
        res.json(usuario);
    }catch(error){
        res.status(500).json({error: error.message});
    }
}

