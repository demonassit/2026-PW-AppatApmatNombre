// 03-strings-fechas.js
// Métodos de string más usados + el objeto Date — conecta con la validación
// de fecha (DD/MM/AAAA) de la semana 4. Completa cada TODO.

const entrada = '  María López  ';

// TODO: trim — imprime `entrada` sin espacios sobrantes, para quitar los espacios 
console.log('Ejemplo de uso de .trim()');
console.log(`"${entrada.trim()}"`)


// TODO: split — parte el resultado del trim en un arreglo `partes`, separado por espacio, para parte de string en un arreglo, usando un seprador
console.log('Ejemplo de split');
const partes = entrada.trim().split(' ');
console.log(partes); 


// TODO: includes — imprime si 'correo@cecyt9.ipn.mx' contiene '@'
console.log('Manejo de includes')
console.log('correo@cecyt9.com'.includes('@'));

// TODO: replace y replaceAll — con '05/09/2026', reemplaza '/' por '-'
//       primero con replace (una sola vez) y luego con replaceAll (todas)

console.log('Manejo de Replace / ReplaceAll')
console.log('05/09/2026'.replace('/', '-')); //solo lo hace con la primera /
console.log('05/09/2026'.replaceAll('/', '-')); //lo hace con todas

// TODO: template literals — usando `nombre = 'María'` y `cupo = 25`, imprime
//       "María se inscribió en un taller con cupo para 25 personas."
console.log('\n Uso de template literals')
const nombre = 'María';
const cupo = 25;
console.log(`${nombre} se inscribio en un taller con cupo para ${cupo} personas`);


// TODO: Date — completa esta función para construir un objeto Date a partir
// de un texto 'DD/MM/AAAA' (recuerda: los meses en Date empiezan en 0)
console.log('Manejo de Date')
function fechaDesdeTexto(textoFecha) {
  // TODO
  const[dia, mes, anio] = textoFecha.split('/').map(Number);
  return new Date(anio, mes - 1, dia); //los meses den date empiezan en 0
}

// TODO: usa fechaDesdeTexto('05/09/2026'), imprime su toISOString() y su
// getDay(); luego calcula cuántos días de diferencia hay contra `new Date()`
const fechaAsistencia = fechaDesdeTexto('05/09/2026');
console.log('Fecha Construida', fechaAsistencia.toISOString());
console.log('Dia de la semana (0=domingo)', fechaAsistencia.getDay());

const hoy = new Date();
const diaDeDiferencia = Math.round((fechaAsistencia - hoy) / (1000 * 60 * 60 * 24));
console.log(`Faltan ${diaDeDiferencia} dias(s) para la fecha de asistencia (puede ser negativo si ya paso) `);
