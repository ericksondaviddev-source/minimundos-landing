/* ============================================================
   MiniMundos — app.js
   Construye las salas desde data.js y maneja:
   navegación (clic, teclado, rueda), mapa, barra, rutas #/id
   y el fondo cósmico (canvas 2D + linterna).
   ============================================================ */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var MENOS_MOVIMIENTO = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ESCRITORIO = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function wa(mensaje) {
    return CONFIG.WHATSAPP_URL + '?text=' + encodeURIComponent(mensaje || '');
  }
  var ICONO_WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1a11 11 0 0 1-4-2.6 9.4 9.4 0 0 1-2-3.2c-.2-.7-.2-1.3 0-1.8.1-.4.5-.9.8-1.1.2-.2.5-.2.7-.2h.5c.2 0 .4.1.6.5l.8 1.9c.1.2 0 .4-.1.6l-.4.5c-.1.2-.2.3 0 .6a7 7 0 0 0 2.9 2.5c.3.1.4 0 .6-.2l.6-.7c.2-.2.3-.2.6-.1l1.8.9c.3.1.4.3.4.5s0 .8-.2 1.4Z"/></svg>';

  /* ---------- Salas: portada + 4 mundos ---------- */
  var salas = [
    {
      id: 'portada', numero: '00', nombre: 'Inicio', paleta: 'portada', mapa: true,
      html: htmlPortada()
    }
  ].concat(MUNDOS.map(function (m) {
    return {
      id: m.id, numero: m.numero, nombre: m.nombre, paleta: m.paleta, mapa: true,
      html: htmlMundo(m)
    };
  }));

  function htmlPortada() {
    var islas = MUNDOS.map(function (m) {
      return '' +
        '<a class="isla" href="#/' + esc(m.id) + '" data-ir="' + esc(m.id) + '" data-mundo="' + esc(m.paleta) + '">' +
          '<span class="isla__num">Mundo ' + esc(m.numero) + '</span>' +
          '<h3 class="isla__nombre">' + esc(m.nombre) + '</h3>' +
          '<p class="isla__bajada">' + esc(m.bajada) + '</p>' +
          '<span class="isla__estado">' + esc(m.estado) + '</span>' +
          '<span class="isla__entrar">Entrar &#8594;</span>' +
        '</a>';
    }).join('');

    return '' +
      '<div class="lienzo portada">' +
        '<h1 class="portada__titulo">' + esc(CONFIG.marca) + '</h1>' +
        '<p class="portada__lema">' + esc(CONFIG.lema) + '</p>' +
        '<p class="portada__intro">Tres mundos para tocar, armar y crear. ' +
          'Entra por el mapa y descubre lo que ya está vivo.</p>' +
        '<h2 class="mapaTitulo">' + esc(TEXTOS.mapaTitulo) + '</h2>' +
        '<div class="islas">' + islas + '</div>' +
        '<p class="pie">' + esc(TEXTOS.mapaPista) + ' &nbsp;&#183;&nbsp; ' + esc(TEXTOS.mapaNota) + '</p>' +
      '</div>';
  }

  function carta(c, i) {
    var precio = c.precio
      ? '<div class="precio">' +
          '<span class="precio__rotulo">Precio</span>' +
          '<span class="precio__monto">' + esc(c.precio) + '</span>' +
          (c.precioNota ? '<p class="precio__nota">' + esc(c.precioNota) + '</p>' : '') +
        '</div>'
      : '';
    var boton = c.boton
      ? '<a class="boton" href="' + wa(c.mensaje) + '" target="_blank" rel="noopener">' +
          ICONO_WA + '<span>' + esc(c.boton) + '</span></a>'
      : '';
    return '' +
      '<article class="carta' + (c.tipo === 'Aviso' ? ' carta--aviso' : '') + '">' +
        '<div class="carta__cabeza">' +
          '<span class="carta__tipo">' + esc(c.tipo) + '</span>' +
          (c.etiqueta ? '<span class="carta__etiqueta">' + esc(c.etiqueta) + '</span>' : '') +
        '</div>' +
        '<h3 class="carta__nombre">' + esc(c.nombre) + '</h3>' +
        '<p class="carta__texto">' + esc(c.texto) + '</p>' +
        precio + boton +
      '</article>';
  }

  function htmlMundo(m) {
    var cartas = m.cartas && m.cartas.length
      ? m.cartas.map(carta).join('')
      : carta({
          tipo: 'Aviso',
          nombre: m.estado,
          // Texto propio: NO se repite el "detalle" que ya está arriba.
          texto: TEXTOS.sinContenido,
          etiqueta: 'En preparación'
        });
    return '' +
      '<div class="lienzo">' +
        '<div class="sala__rejilla">' +
          '<div>' +
            '<p class="kicker">Mundo ' + esc(m.numero) + '</p>' +
            '<h2 class="titulo">' + esc(m.nombre) + '</h2>' +
            '<p class="bajada">' + esc(m.bajada) + '</p>' +
            '<p class="detalle">' + esc(m.detalle) + '</p>' +
          '</div>' +
          '<div class="bento' + (m.cartas && m.cartas.length > 1 ? ' bento--doble' : ' bento--una') + '">' +
            cartas +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ---------- Pintar ---------- */
  var escenario = $('#contenido');
  escenario.innerHTML = salas.map(function (s) {
    return '' +
      '<section class="sala" id="' + esc(s.id) + '" data-mundo="' + esc(s.paleta) + '" ' +
        'data-fantasma="' + esc(s.numero) + '" aria-labelledby="t-' + esc(s.id) + '" ' +
        'data-sala="' + esc(s.id) + '">' +
        '<h2 class="sr-only" id="t-' + esc(s.id) + '">' + esc(s.nombre) + '</h2>' +
        // Envoltorio con recorte propio: si el numero asomara de la sala,
        // crearia desborde vertical y la sala entera ganaria barra de scroll.
        '<span class="sala__fantasma" data-numero="' + esc(s.numero) + '" aria-hidden="true"></span>' +
        s.html +
        '<p class="pie sala__pie"></p>' +
      '</section>';
  }).join('');

  var mapaLista = $('#mapaLista');
  mapaLista.innerHTML = salas.map(function (s) {
    return '' +
      '<li><button type="button" class="mapa__punto" data-ir="' + esc(s.id) + '" ' +
      'aria-current="false"><span></span>' +
      '<span class="mapa__nombre">' + esc(s.nombre) + '</span></button></li>';
  }).join('');

  var nodos = Array.prototype.slice.call(escenario.querySelectorAll('.sala'));  var barra = $('#barra');
  var vivo = $('#vivo');
  var wafijo = $('#wafijo');
  $('#wafijoTexto').textContent = TEXTOS.whatsappFlotante;
  wafijo.setAttribute('href', CONFIG.WHATSAPP_URL);
  wafijo.setAttribute('aria-label', TEXTOS.whatsappAria);

  if (AVISO && AVISO.trim()) {
    var aviso = $('#aviso');
    $('#avisoTexto').textContent = AVISO;
    aviso.hidden = false;
    $('#avisoCerrar').addEventListener('click', function () { aviso.hidden = true; });
  }

  /* Pista de "desliza": solo en los mundos, no en la portada (ya lo dice ahí) */
  nodos.forEach(function (n, i) {
    var pie = n.querySelector('.sala__pie');
    if (!pie) return;
    if (n.id === 'portada') { pie.remove(); return; }
    pie.textContent = i < nodos.length - 1 ? 'Desliza \u2192' : '\u2190 Volver al inicio';
  });

  /* ---------- Navegación ---------- */
  function indiceDe(id) {
    for (var i = 0; i < nodos.length; i++) if (nodos[i].id === id) return i;
    return -1;
  }

  function irA(i, cambiarRuta) {
    i = Math.max(0, Math.min(nodos.length - 1, i));
    var destino = nodos[i];
    try {
      destino.scrollIntoView({ behavior: MENOS_MOVIMIENTO ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
    } catch (e) {
      escenario.scrollLeft = destino.offsetLeft - (escenario.clientWidth - destino.offsetWidth) / 2;
    }
    if (cambiarRuta !== false) ponerRuta(destino.id);
  }

  // Clics en mapa y en islas
  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-ir]') : null;
    if (!t) return;
    e.preventDefault();
    var i = indiceDe(t.getAttribute('data-ir'));
    if (i >= 0) irA(i);
  });

  // Teclado: flechas y Home/End
  window.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); irA(actual + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); irA(actual - 1); }
    else if (e.key === 'Home') { e.preventDefault(); irA(0); }
    else if (e.key === 'End') { e.preventDefault(); irA(nodos.length - 1); }
  });

  // Rueda vertical del ratón -> avanza una sala (con enfriamiento)
  var enfriando = false;
  escenario.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;   // gesto horizontal: nativo
    e.preventDefault();
    if (enfriando) return;
    enfriando = true;
    irA(actual + (e.deltaY > 0 ? 1 : -1));
    setTimeout(function () { enfriando = false; }, 620);
  }, { passive: false });

  /* ---------- Estado actual: barra, mapa, paleta, rutas ---------- */
  var actual = -1;
  var paletaActual = null;
  var farol = $('#farol');
  var tRuta = 0;

  function actualizar() {
    var centro = escenario.scrollLeft + escenario.clientWidth / 2;
    var mejor = 0, mejorDist = Infinity;
    nodos.forEach(function (n, i) {
      var d = Math.abs(n.offsetLeft + n.offsetWidth / 2 - centro);
      if (d < mejorDist) { mejorDist = d; mejor = i; }
    });

    var max = escenario.scrollWidth - escenario.clientWidth;
    barra.style.width = (max > 0 ? (escenario.scrollLeft / max) * 100 : 0) + '%';

    if (mejor === actual) return;
    actual = mejor;
    var s = salas[actual];
    var id = nodos[actual].id;

    Array.prototype.forEach.call(mapaLista.children, function (li, i) {
      var b = li.firstElementChild;
      var vivo2 = i === actual;
      b.setAttribute('aria-current', vivo2 ? 'true' : 'false');
      b.setAttribute('aria-label', s.nombre);
    });

    var fondo = nodos[actual].getAttribute('data-mundo');
    if (fondo !== paletaActual) {
      paletaActual = fondo;
      if (window.MiniMundosFondo) window.MiniMundosFondo.paleta(fondo);
      // La linterna toma el color del mundo activo
      if (farol) {
        farol.style.setProperty('--farol-color',
          getComputedStyle(nodos[actual]).getPropertyValue('--farol-color'));
      }
    }

    vivo.textContent = 'Sala ' + (actual + 1) + ' de ' + nodos.length + ': ' + s.nombre;
    // La URL sigue la sala sin pegar saltos ni llenar el historial
    clearTimeout(tRuta);
    tRuta = setTimeout(function () { ponerRuta(id); }, 220);
  }

  var raf = false;
  escenario.addEventListener('scroll', function () {
    if (raf) return;
    raf = true;
    requestAnimationFrame(function () { raf = false; actualizar(); });
  }, { passive: true });

  /* ---------- Rutas: #/id al cargar y con atrás/adelante ---------- */
  function desdeHash() {
    var m = /^#\/([\w-]+)$/.exec(location.hash || '');
    return m ? indiceDe(m[1]) : 0;
  }
  // El hash solo manda cuando lo cambia el usuario (atrás/adelante o URL ajena),
  // jamás cuando lo escribe la propia navegación.
  var rutaPropia = false;
  function ponerRuta(id) {
    rutaPropia = true;
    try {
      // Sobre file:// el origen es null y replaceState lanzaria error: se ignora.
      history.replaceState(null, '', id === 'portada' ? './' : '#/' + id);
    } catch (e) { /* sin rutas en file://: la navegacion sigue igual */ }
    setTimeout(function () { rutaPropia = false; }, 60);
  }
  window.addEventListener('hashchange', function () {
    if (rutaPropia) return;
    irA(desdeHash(), false);
  });

  /* ---------- Arranque ---------- */
  function arrancar() {
    var i = desdeHash();
    // offsetLeft se mide DESPUES del primer layout real
    requestAnimationFrame(function () {
      escenario.scrollLeft = nodos[i].offsetLeft - (escenario.clientWidth - nodos[i].offsetWidth) / 2;
      actualizar();
      if (window.MiniMundosFondo) window.MiniMundosFondo.iniciar();
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(arrancar).catch(arrancar);
  } else {
    arrancar();
  }
  window.addEventListener('resize', function () { irA(actual >= 0 ? actual : 0, false); });

  /* ---------- Fondo cósmico (canvas 2D) ---------- */
  window.MiniMundosFondo = (function () {
    var cv = $('#cosmos'), ctx = cv.getContext('2d', { alpha: true });
    var W = 0, H = 0, dpr = 1;
    var estrellas = [], polvo = [], estrellasCol = [];
    var paletas = {
      portada:      { a: [110, 140, 255], b: [255, 170, 90] },
      tambores:     { a: [255, 150, 60],  b: [255, 92, 20] },
      instrumentos: { a: [150, 120, 255], b: [90, 60, 220] },
      plantillas:   { a: [45, 212, 191],  b: [20, 160, 140] },
      cubos:        { a: [96, 165, 250],  b: [50, 110, 240] }
    };
    var objetivo = paletas.portada;
    var mezcla = { a: paletas.portada.a.slice(), b: paletas.portada.b.slice() };
    var mx = 0.5, my = 0.5, tmx = 0.5, tmy = 0.5;
    var scroll = 0, arrancado = false;
    var nubeLista = '', nubeKey = '';
    var sprites = [];

    /* Sprites de estrella pre-renderizados: dibujarlos cuesta mucho menos que
       trazar 200 arcos por frame. */
    function hacerSprites() {
      var tam = [2, 3, 4, 5];
      sprites = [];
      for (var s = 0; s < tam.length; s++) {
        var d = Math.ceil(tam[s] * dpr);
        var c = document.createElement('canvas');
        c.width = c.height = d;
        var x = c.getContext('2d');
        var r = d / 2;
        var g = x.createRadialGradient(r, r, 0, r, r, r);
        g.addColorStop(0, 'rgba(255,255,255,1)');
        g.addColorStop(0.45, 'rgba(255,255,255,.85)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        x.fillStyle = g;
        x.beginPath(); x.arc(r, r, r, 0, 6.2832); x.fill();
        sprites.push({ c: c, d: d });
      }
    }

    function semilla(s) { return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; }

    function medida() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nubeLista = '';
      hacerSprites();
      crear();
    }

    function crear() {
      var r = semilla(20260101);
      var area = W * H;
      var nEst = Math.round(Math.min(350, Math.max(120, area / 5000)));
      var nPol = Math.round(Math.min(90, Math.max(30, area / 25000)));
      var nCol = Math.round(Math.min(120, Math.max(40, area / 20000)));
      estrellas = []; polvo = []; estrellasCol = [];
      for (var i = 0; i < nEst; i++) {
        estrellas.push({
          x: r(), y: r(),
          r: 0.4 + r() * 1.0,
          p: 0.25 + r() * 1.5,
          t: r() * 6.28,
          v: 0.5 + r() * 1.1
        });
      }
      for (var k = 0; k < nCol; k++) {
        estrellasCol.push({
          x: r(), y: r(),
          r: 0.6 + r() * 0.9,
          p: 0.2 + r() * 1.2,
          t: r() * 6.28,
          v: 0.4 + r() * 0.9,
          hue: r()
        });
      }
      for (var j = 0; j < nPol; j++) {
        polvo.push({
          x: r(), y: r(),
          r: 0.8 + r() * 1.7,
          vx: (r() - 0.5) * 0.012,
          vy: -(0.004 + r() * 0.012),
          a: 0.05 + r() * 0.16
        });
      }
    }

    function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

    // --- OPTIMIZACION (verificado: sin esto, p95 = 33ms) ---
    // Los dos gradientes a pantalla completa son estaticos mientras la paleta no
    // cambia, asi que se pintan UNA sola vez en un canvas aparte y cada frame
    // solo hace un drawImage + las estrellas. Pintarlos cada frame costaba el doble.
    var nube = document.createElement('canvas');
    var nubeCtx = nube.getContext('2d');
    function rehacerNube() {
      if (W === 0 || H === 0) return;
      nube.width = Math.round(W * dpr); nube.height = Math.round(H * dpr);
      nubeCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      nubeCtx.clearRect(0, 0, W, H);
      var g1 = nubeCtx.createRadialGradient(W * 0.18, H * 0.12, 0, W * 0.18, H * 0.12, Math.max(W, H) * 0.75);
      g1.addColorStop(0, rgba(mezcla.a, 0.22));
      g1.addColorStop(1, rgba(mezcla.a, 0));
      nubeCtx.fillStyle = g1; nubeCtx.fillRect(0, 0, W, H);
      var g2 = nubeCtx.createRadialGradient(W * 0.86, H * 0.9, 0, W * 0.86, H * 0.9, Math.max(W, H) * 0.7);
      g2.addColorStop(0, rgba(mezcla.b, 0.16));
      g2.addColorStop(1, rgba(mezcla.b, 0));
      nubeCtx.fillStyle = g2; nubeCtx.fillRect(0, 0, W, H);
    }

    function dibujar() {
      ctx.clearRect(0, 0, W, H);

      // Neblina: reutilizada hasta que la paleta deje de moverse
      if (nubeLista !== nubeKey) {
        rehacerNube();
        nubeLista = nubeKey;
      }
      ctx.drawImage(nube, 0, 0, W, H);

      // Parallax leve ligado al scroll y al ratón
      var px = scroll * 0.05 + (mx - 0.5) * 14;
      var py = (my - 0.5) * 10;
      var i, e;
      var ahora = performance.now() * 0.001;

      // Estrellas por sprite pre-renderizado (drawImage ~ beginPath+arc+fill)
      // y agrupadas en 4 niveles de alfa: 4 cambios de estado, no 200.
      for (var nivel = 0; nivel < 4; nivel++) {
        for (i = 0; i < estrellas.length; i++) {
          e = estrellas[i];
          var x = ((e.x * 1.6 - 0.3) * W + px * e.p) % (W + 60);
          if (x < -30) x += W + 60;
          var parp = 0.55 + 0.45 * Math.sin(e.t + ahora * e.v);
          var a = (0.25 + 0.55 * parp) * (0.5 + e.p * 0.4);
          if (((a * 4) | 0) !== nivel) continue;
          var sp = sprites[Math.min(sprites.length - 1, (e.r * 2) | 0)];
          ctx.globalAlpha = a;
          ctx.drawImage(sp.c, x - sp.d / 2, e.y * H + py * e.p * 0.4 - sp.d / 2, sp.d, sp.d);
        }
      }
      ctx.globalAlpha = 1;

      // Estrellas de color tintadas por paleta
      for (i = 0; i < estrellasCol.length; i++) {
        e = estrellasCol[i];
        var x2 = ((e.x * 1.6 - 0.3) * W + px * e.p * 0.6) % (W + 60);
        if (x2 < -30) x2 += W + 60;
        var parp2 = 0.6 + 0.4 * Math.sin(e.t + ahora * e.v);
        var a2 = (0.18 + 0.35 * parp2);
        var hue = (e.hue * 360 + ahora * 5) % 360;
        // mezcla entre el color de paleta y un tinte cálido
        var r = mezcla.a[0], g = mezcla.a[1], b = mezcla.a[2];
        ctx.globalAlpha = a2 * 0.8;
        ctx.fillStyle = 'hsla(' + (hue + (r*0.3)) + ',70%,65%,' + a2 + ')';
        ctx.beginPath();
        ctx.arc(x2, e.y * H + py * e.p * 0.3, e.r * 0.9, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (i = 0; i < polvo.length; i++) {
        e = polvo[i];
        e.x += e.vx; e.y += e.vy;
        if (e.y < -0.05) { e.y = 1.05; e.x = Math.random(); }
        if (e.x < -0.05) e.x = 1.05; else if (e.x > 1.05) e.x = -0.05;
        ctx.globalAlpha = e.a;
        ctx.fillStyle = rgba(mezcla.a, 1);
        ctx.beginPath();
        ctx.arc(e.x * W + px * 0.8, e.y * H + py, e.r, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function bucle() {
      if (!arrancado) return;
      // Mezcla de paleta: los dos colores a la vez, ~1 s
      var moviendose = false;
      var claves = ['a', 'b'];
      for (var c = 0; c < claves.length; c++) {
        for (var k = 0; k < 3; k++) {
          var d = objetivo[claves[c]][k] - mezcla[claves[c]][k];
          if (Math.abs(d) > 1) { mezcla[claves[c]][k] += d * 0.07; moviendose = true; }
          else mezcla[claves[c]][k] = objetivo[claves[c]][k];
        }
      }
      mx += (tmx - mx) * 0.06;
      my += (tmy - my) * 0.06;
      // La nube solo se rehace mientras la paleta se mueve
      nubeKey = moviendose ? 'm' + mezcla.a.join(',') + mezcla.b.join(',') : 'fija';
      dibujar();
      requestAnimationFrame(bucle);
    }

    return {
      iniciar: function () {
        if (arrancado) return;
        arrancado = true;
        medida();
        if (MENOS_MOVIMIENTO) { nubeKey = ''; dibujar(); return; }
        requestAnimationFrame(bucle);
      },
      pausar: function () { arrancado = false; },
      reanudar: function () {
        if (arrancado || MENOS_MOVIMIENTO) return;
        arrancado = true;
        requestAnimationFrame(bucle);
      },
      paleta: function (id) {
        objetivo = paletas[id] || paletas.portada;
        if (MENOS_MOVIMIENTO) {
          mezcla = { a: objetivo.a.slice(), b: objetivo.b.slice() };
          nubeKey = '';
          dibujar();
        }
      },
      scroll: function (v) { scroll = v; },
      raton: function (x, y) { tmx = x; tmy = y; },
      redibujar: function () { medida(); dibujar(); }
    };
  })();

  var fondo = window.MiniMundosFondo;

  // La linterna sigue al ratón (solo desktop)
  if (ESCRITORIO && !MENOS_MOVIMIENTO) {
    var farol = $('#farol'), lx = 0, ly = 0, ltx = 0, lty = 0, lraf = false;
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      ltx = e.clientX; lty = e.clientY;
      if (!lraf) {
        lraf = true;
        requestAnimationFrame(function () {
          lraf = false;
          lx += (ltx - lx) * 0.22; ly += (lty - ly) * 0.22;
          farol.style.transform = 'translate3d(' + lx + 'px,' + ly + 'px,0)';
        });
      }
    }, { passive: true });
  }

  // Scroll -> fondo
  escenario.addEventListener('scroll', function () { fondo.scroll(escenario.scrollLeft); }, { passive: true });
  window.addEventListener('pointermove', function (e) {
    fondo.raton(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
  }, { passive: true });

  var rEspera;
  window.addEventListener('resize', function () {
    clearTimeout(rEspera);
    rEspera = setTimeout(function () { fondo.redibujar(); }, 160);
  });

  document.addEventListener('visibilitychange', function () {
    if (!fondo) return;
    if (document.hidden) fondo.pausar();
    else fondo.reanudar();
  });
})();
