// La aplicación de la demo. server.js la arranca; las pruebas la arrancan con otras configuraciones.
// Lo que dice "(en clase)" lo programamos juntos, paso por paso. Mientras no esté, esa ruta responde 501.
const path = require('path');
const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { crearModeloUsuarios } = require('./modelos/usuarios.modelo');
const { config } = require('dotenv');

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
}

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




