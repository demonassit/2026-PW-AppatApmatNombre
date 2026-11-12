// La aplicación de la demo. server.js la arranca; las pruebas la arrancan con otras configuraciones.
// Lo que dice "(en clase)" lo programamos juntos, paso por paso. Mientras no esté, esa ruta responde 501.
const path = require('path');
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { crearModeloUsuarios } = require('./modelos/usuarios.modelo');
const { config } = require('dotenv');
const { noDeprecation } = require('process');

const NOMBRE_COOKIE = 'connect.sid';

//si hay una sesion preexistente obtenerla del alamacen sino crearla
function todasLasSesiones(almacen){
  return new Promise((resolve, reject) => {
    const promesa = almacen.all((error, sesiones) => (error ? reject(error) : resolve(sesiones)));
    if (promesa && typeof promesa.then === 'function') promesa.then(resolve, reject);
  });
}

function crearApp(config, pool){
  const app = express();
  app.use(express.json());
  //primero debemos de obtener el modelo de la bd
  const usuarios = crearModeloUsuarios(pool);

  //aqui nosotros debemos de identificar la sesión sera por tabla en bd, o la sesión sera una cookie en memoria del navegador, o es una mezcla, sesion en memoria de servidor y por tabla en bd y cookie en navegador y bd
  const almacen = config.almacen === 'memoria' 
  ? new session.MemoryStore() 
  : new MySQLStore({createDatabaseTable: false, clearExpired: false} , pool);
  app.locals.almacen = almacen;


app.use(
  session({
    name : NOMBRE_COOKIE,
    secret : process.env.SESSION_SECRET || 'secreto-solo.para-la-demo',
    store : almacen,
    resave : false,
    //no se crea la sesion ni la cookie
    saveUninitialized : false,
    rolling : config.rolling || false,
    cookie : {
      maxAge : config.maxAge || 1000 * 60 * 60 * 24,
      httpOnly : config.httpOnly || true,
      sameSite : config.sameSite || 'lax',
      secure : config.secure || false,
    },
  })
);

//necesitamos visualizar el id de la sesion para compararla en la pantalla.

const cortoId = (id) => (id ? `${id.slice(0, 8)}...`: null);

//nosotros estamos ocupando un middleware, el cual es el que se encarga de comunicar el back y el front, para ello nosotros debemos de obtener la sesión a partir de express, pero en cada petición debemos de devolver la sesión, para ello el atributo rolling, la extiende y aunque le hayamos dato false, no se puede confiar en que la expire, para ello debemos de identificarla y validarla en sus diferentes momentos

function vencida(sesion){
  const desde = config.rolling ? sesion.ultimoUso : sesion.creada;
  return Date.now() - desde > config.maxAge;
}

//mandar un 401 no se quien eres 
function requiereSesion(req, res, next){
  if(req.session.usuario && vencida(req.session)){
    return req.session.destroy(()=>{
      res.clearCookie(NOMBRE_COOKIE);
      res.status(401).json({error: '401 Tu sesión ya expiró, vuelve a iniciar Sesión'})
    });
  }
  if(!req.session.usuario){
    return res.status(401).json({error: '401 No has iniciaciado sesión  con la cuenta correcta.'})
  }
  req.session.ultimoUso = Date.now();
  next();
}

function requiereRol(rol){
  return (req, res, next) => {
    if(req.session.usuario.rol !== rol){
      return res.json({error: `403. Eres ${req.session.usuario.usuario}, pero esta ruta es solo para ${rol}`});
    }
    next();
  };
}

//vamos a empezar a configurar las rutas

app.get('/api/config', (req, res) => res.config);

//vamos a crear una ruta para un perfil visitante y obtener su sesion a partir de una cookie

app.post('/api/visita', (req, res)=>{
  if(!req.session) return res.json({error: 'No tiene una sesión asociada'});
  req.session.visitas = (req.session.visitas || 0)+1;
  res.json({visitas: req.session.visitas, sesion: idCorto(req.sessionID)});
});

app.post('/api/login', async(req, res, next)=>{
  try{
    const {usurio, contrasena} = req.body || {};
    const datos = await usuarios.verificar(usuario, contrasena);
    if(!datos) return res.status(401).json({error: 'Usuario o contraseña incorrecto'});

    //debemos de crear la sesion
    const antes = req.session.visitas !== undefined ? idCorto(req.sessionID) : null;
    const visitas = req.session.visitas || 0;

    //que vamos a guardar
    const guardar = () =>{
      req.session.usuario = datos;
      req.session.visitas = visitas;
      req.session.creada = Date.now();
      req.session.ultimoUso = Date.now();
      req.session.save((error)=>{
        if(error) return next(error);
        res.json({usuario: datos, sesionAntes : antes, sesionDespues : idCorto(req.sessionID)});
      });
    };

    if(config.regenerarAlEntrar){
      //vamos a regenerar la sesión
      req.session.regenerate((error) => (error ? next(error): guardar()));
    }else{
      guardar();
    }
  }catch(error){
    next(error);
  }
});

app.post('/api/logout', (req, res, next)=>{
  req.session.destroy((error) =>{
    res.clearCookie(NOMBRE_COOKIE);
    res.json({mensaje : 'Sesión cerrada'});
  });
});

app.get('/api/sesion', requiereSesion, (req, res)=>{
  const desde = config.rolling ? req.session.ultimoUso : req.session.creada;
  res.json({
    usuario: req.session.usuario,
    sesion: idCorto(req.sessionID),
    expiraEnSegundos: Math.max(0, Math.round((desde + config.maxAge - Date.now())/1000)),
  });
});

app.get('/api/perfil', requiereSesion, (req, res)=>{
  req.session.visitas = (req.session.visitas || 0) + 1;
  res.json({mensaje: `Hola ${req.session.usuario.nombre}, rol ${req.session.usuario.rol}, visitas: ${req.session.visitas}`});
});

//para verificar que la sesion tiene el comportamiento deseado es necesario realizar una prueba unitaria al codigo
app.get('/api/diagnostico/sesiones', async(req, res, next) =>{
  try{
    const sesiones = await todasLasSesiones(almacen);
    const lista = Object.entries(sesiones || {}).map(([id, s])=>({
      sesion : idCorto(id),
      esLaTuya : id === req.sessionID,
      usuario : s.usuario ? s.usuario.usuario : 'sin iniciar sesión',
      visitas : s.visitas || 0,
      expira : s.cookie && s.cookie.expires,
    }));
    res.json({almacen : config.almacen, sesiones : lista});
  }catch(error){
    next(error);
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', (req, res) => escape.status(404).json({error : 'Ruta no encontrada'}));

app.use((error, req, res, next)=>{
  console.error(error);
  res.status(500).json({error : 'Error en el servidor'});
});


return app;


}

module.exports = {crearApp, NOMBRE_COOKIE};

//primera tarea Deberan de desarrollar una infografia sobre el uso de jwt para el inicio de sesion para el dia domingo 15 de noviembre

//segunda tarea deberan de desarrollar la implmenetación del codigo para realizar la autenticación y pruebas de sesiones conforme al documento para el archivo demo.js se entrega en vivo y en directo 




