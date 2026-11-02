/* ============================================================
   MiniMundos — datos de la tienda (@minimundos.tienda)
   Cambia textos, precios y productos AQUI. No toques el HTML.
   ============================================================ */

const CONFIG = {
  marca: 'MiniMundos',
  handle: '@minimundos.tienda',
  lema: 'la casa de las series',
  firma: 'ED-Dev',

  // TEMPORAL: numero personal de Erickson hasta que la tienda tenga el suyo.
  // Cuando llegue el numero real, cambia SOLO esta linea.
  WHATSAPP_URL: 'https://wa.me/584241875518'
};

/* Los mundos. 'paleta' pinta la sala completa: fondo, cartas, botones.
   'estado' es lo unico que aparece si el mundo aun no existe.
   'link' es el destino del boton al final. */
const MUNDOS = [
  {
    id: 'instrumentos',
    numero: '01',
    nombre: 'Mundo Instrumentos',
    paleta: 'instrumentos',
    estado: 'Serie en camino',
    bajada: 'Ritmos que se aprenden con las manos. Tambores y sonidos para empezar.',
    detalle:
      'El primer territorio sonoro de MiniMundos. Aquí nace Ritmos para copiar y nuestros primeros instrumentos pensados para manos pequeñas. No hace falta leer música para tocar con confianza.',
    cartas: [
      {
        tipo: 'Serie',
        nombre: 'Ritmos para copiar',
        texto: 'Una serie para aprender tocando. Episodio 1 en preparación.',
        etiqueta: 'En producción',
        boton: 'Quiero aviso por WhatsApp',
        mensaje: 'Hola MiniMundos, quiero que me avisen cuando salga el Episodio 1 de Ritmos para copiar.'
      },
      {
        tipo: 'Producto',
        nombre: 'Tambor infantil',
        texto: 'Tacto suave, sonido claro. Hecho para manos pequeñas y curiosidad grande.',
        etiqueta: 'Muy pronto',
        precio: 'Muy pronto',
        precioNota: 'Aún sin precio público. Escríbenos y te contamos.',
        boton: 'Consultar por WhatsApp',
        mensaje: 'Hola MiniMundos, quiero información del tambor infantil.'
      }
    ]
  },
  {
    id: 'plantillas',
    numero: '02',
    nombre: 'Mundo Plantillas',
    paleta: 'plantillas',
    estado: 'Muy pronto',
    bajada: 'Construye tu propio sonido con papel y tijeras.',
    detalle:
      'Guías y plantillas para armar instrumentos en casa. Un taller de papel donde la imaginación suena.',
    cartas: []
  },
  {
    id: 'cubos',
    numero: '03',
    nombre: 'Mundo Cubos',
    paleta: 'cubos',
    estado: 'Próximamente',
    bajada: 'Un espacio en construcción, reservado para lo próximo.',
    detalle:
      'Aquí aparecerá cuando esté listo. En MiniMundos solo publicamos lo que ya existe.',
    cartas: []
  }
];

// Textos sueltos de la pagina.
const TEXTOS = {
  mapaTitulo: 'Explora los mundos',
  mapaPista: 'Desliza o usa las flechas del teclado',
  mapaNota: 'Solo mostramos lo que ya existe.',
  whatsappFlotante: 'Háblanos',
  whatsappAria: 'Escribir a MiniMundos por WhatsApp',
  cerrarAviso: 'Cerrar aviso',
  sinMundos: 'Aún no hay mundos publicados.',
  sinContenido: 'Este mundo aún no tiene contenido publicado.'
};

// Aviso de arriba. Si no quieres aviso, deja el texto vacío ('').
const AVISO = '';
