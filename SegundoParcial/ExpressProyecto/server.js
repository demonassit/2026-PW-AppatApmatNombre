const express = require('express')
const usuarios = require('./Controlador/usuarios_controlador');

const app = express();

app.use(express.json());


const PORT = 4000;


//tenemos la ruta principal por medio del metodo get
app.get('/saludo', (req, res) => {
    res.json({mensaje:'Hola esto es una prueba en GET'});
});

//rutas por medio del metodo post, como un endpoint propio
app.post('/eco', (req, res) => {
    const {texto} = req.body;
    if(!texto){
        return res.status(400).json({error:'EL texto es obligatorio'});
    }
    res.status(201).json({eco:texto})
});

//rutas del CRUD de usuarios (las consume /admin/usuarios del mini-proyecto-next)
app.get('/api/usuarios', usuarios.listarUsuarios);
app.get('/api/usuarios/:id', usuarios.obtenerUsuario);
app.post('/api/usuarios', usuarios.crearUsuario);
app.put('/api/usuarios/:id', usuarios.actualizarUsuario);
app.delete('/api/usuarios/:id', usuarios.eliminarUsuario);

app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto: ${PORT}`);
})

