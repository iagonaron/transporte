/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE · motor de la sesión (copia de T2 para T3: voces en voz/t3/, cierre con «Continuará») (escenas → planos → frases), sobre el patrón de 4 Sabores (M.di, montaPlano,
   recogida de recursos) y la caja de diálogo de Modulación (letra a letra con pitido; «Continuar» oscuro hasta
   que se puede seguir, luego naranja + blip retro de controles.js, sin parpadeos).
   · Con voz (voz/t1/<id>.mp3 en data/recursos.js): suena la voz, el texto se escribe a su ritmo y las poses van a sus tiempos.
   · Sin voz: el texto se escribe a 32 ms por letra y la frase «dura» según su longitud.
   · Modo Aula (?aula=1): los cuadros pasan solos tras el tiempo de lectura (los interactivos esperan).
   · ?escena=N empieza en la escena N (para probar).
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const M = B.motor = {};
  const AULA = B.param('aula') === '1';
  const RAPIDO = B.param('rapido') === '1';   // solo para probar: texto al instante y frases de 0,3 s
  M.aula = AULA;
  /* el profe (cuenta Protester: llega con «#c=<uuid>» desde prueba.html, como en 4 Sabores): los puntitos de arriba
     son clicables y saltan a cualquier escena o plano. Se recuerda en esta pestaña (sessionStorage). */
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const PROF = (function () {
    let si = false;
    try { const q = {}; (location.hash || '').replace(/^#/, '').split('&').forEach(x => { const i = x.indexOf('='); if (i > 0) q[x.slice(0, i)] = decodeURIComponent(x.slice(i + 1)); }); si = UUID.test(q.c || ''); } catch (e) { }
    try { if (si) sessionStorage.setItem('tr_prof', '1'); else si = sessionStorage.getItem('tr_prof') === '1'; } catch (e) { }
    return si || B.param('profe') === '1';
  })();
  M.prof = PROF;
  let S = null, ctl = null, escIdx = 0;
  const $ = id => document.getElementById(id);

  /* ── lámina de fondo (o marcador si falta el fichero) ──
     src: 'img/t1/x.webp' o lista con sustitutos [{src, zoom, cx, cy, ajuste:'contain', luz, vida}] → el primero que exista.
     zoom/cx/cy: encuadre dentro de la lámina (cx, cy = punto que queda en el centro, fracciones); ajuste 'contain' = lámina
     vertical entera sobre una copia desenfocada; luz = brillo (p. ej. .6 para «de noche»). */
  /* CAMBIO LIMPIO (Iago, 2-nov): doble búfer. La lámina nueva se descodifica ANTES (img.decode) y se pone ENCIMA de la
     vieja; la vieja se retira dos fotogramas después. Nunca se pasa por fondo vacío ni por negro. Lo que tiene que
     esperar a que la lámina nueva esté pintada (quitar el vídeo de fondo, el último fotograma de un vídeo) va en alPintar. */
  let fondoAct = null, fondoOpc = null, gen = 0, pendiente = false;
  const alPintar = [];
  const DEC = new Map();
  function decod(url) {
    if (DEC.has(url)) return DEC.get(url);
    const pr = new Promise(res => { const im = new Image(); im.src = url; const ok = () => res(im);
      (im.decode ? im.decode() : Promise.resolve()).then(ok, ok); setTimeout(ok, 2500); });
    DEC.set(url, pr); if (DEC.size > 14) DEC.delete(DEC.keys().next().value);   // pocas a la vez: el aula tiene poca memoria
    return pr;
  }
  M.predecod = function (src) { const q = src ? B.primero(src) : null; if (q && !q.falta) decod(B.img[q.src] || q.src); };
  function trasPintar(fd) { pendiente = false; alPintar.splice(0).forEach(fn => { try { fn(fd || 0); } catch (e) { console.warn(e); } }); }
  M.fondo = function (src, o) {
    o = o || {};
    const f = $('fondo');
    const q = src ? B.primero(src) : null;
    const clave = q ? JSON.stringify(q) : null;
    if (clave === fondoAct && !o.forzar) { if (!pendiente) trasPintar(o.funde); return fondoOpc; }
    /* fundido cruzado lento (Iago, 2-nov) cuando la lámina es la misma imagen con otro encuadre o con halos (o si el plano lo pide) */
    const fd = o.funde != null ? o.funde : (q && q.funde != null) ? q.funde : (q && fondoOpc && !q.falta && !fondoOpc.falta && q.src === fondoOpc.src ? 1.2 : 0);
    fondoAct = clave; fondoOpc = q;
    const nuevo = B.el('div', 'lam');
    if (!q) nuevo.classList.add('negra');
    else if (!q.falta) {
      const u = 'url("' + (B.img[q.src] || q.src) + '")';
      if (q.ajuste === 'contain') { nuevo.classList.add('contain'); const bg = B.el('i', 'desen'); bg.style.backgroundImage = u; nuevo.appendChild(bg); const fr = B.el('i', 'frente'); fr.style.backgroundImage = u; nuevo.appendChild(fr); }
      else nuevo.style.backgroundImage = u;
      if (q.zoom && q.zoom > 1) {
        const z = q.zoom, cx = q.cx == null ? .5 : q.cx, cy = q.cy == null ? .5 : q.cy;
        const px = B.clamp((cx * z - .5) / (z - 1), 0, 1), py = B.clamp((cy * z - .5) / (z - 1), 0, 1);
        nuevo.style.backgroundSize = (z * 100) + '% auto'; nuevo.style.backgroundPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%';
      }
      if (q.luz != null) nuevo.style.filter = 'brightness(' + q.luz + ') saturate(' + (q.luz < 1 ? .85 : 1) + ')';
      if (q.mueve) nuevo.classList.add('mueve');
    } else { nuevo.classList.add('marca'); nuevo.innerHTML = '<div><b>' + B.esc(o.nombre || 'Lámina') + '</b><small>' + B.esc(q.src) + '</small>' + ((o.desc || q.desc) ? '<span>' + B.esc(o.desc || q.desc) + '</span>' : '') + '</div>'; }
    const mi = ++gen; pendiente = true;
    const pinta = () => {
      if (mi !== gen) return;   // ya se pidió otra
      const fdLam = M._congelado ? 0 : fd;   // desde un vídeo congelado, lo que se funde es el vídeo (encima), no la lámina
      if (fdLam) { nuevo.style.opacity = '0'; nuevo.style.transition = 'opacity ' + fdLam + 's ease'; }
      if (vfondo && vfondo.parentNode === f) f.insertBefore(nuevo, vfondo); else f.appendChild(nuevo);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (mi !== gen) return;
        if (fdLam) { nuevo.style.opacity = '1'; trasPintar(0); setTimeout(() => { if (mi === gen) B.$$('.lam', f).forEach(e => { if (e !== nuevo) e.remove(); }); }, fdLam * 1000 + 60); return; }
        B.$$('.lam', f).forEach(e => { if (e !== nuevo) e.remove(); });
        trasPintar(fd);
      }));
    };
    if (q && !q.falta) decod(B.img[q.src] || q.src).then(pinta); else pinta();
    if (B.capas) { B.capas.oculta = (q && !q.falta && q.ocultaPj) || []; B.capas.aplicaOculta(); }
    return q;
  };
  /* cambio de lámina DENTRO del plano (img / imgs de la línea, imgs del plano): instantáneo, como las poses.
     Si el fichero falta, se queda la lámina anterior (sin marcador). La «vida» pasa a la de la lámina nueva, o se quita. */
  M.cambia = function (src, o) {
    const q = src ? B.primero(src) : null;
    if (!q) return null;
    /* (T2) si la lámina aún no está, su MARCADOR (nombre del fichero y descripción): se ve qué falta sin romper nada */
    if (q.falta && !B.CFG.marcaFalta) return null;
    const ant = fondoAct, r = M.fondo(src, Object.assign(q.falta ? { nombre: q.nombre || q.src.replace(/^.*\//, ''), desc: q.desc } : {}, o || {}));
    if (fondoAct !== ant) { if (vfondo) fondoVideo(null); B.vida.pon((r && !r.falta && r.vida) || []); }   // fondoVideo(null) espera a que la lámina esté pintada   // el vídeo de fondo (si lo había) deja paso a la lámina nueva
    return r;
  };
  function programaLams(lista, dur, c) {
    if (!B.lamina) return;
    B.arr(lista).forEach(x => { const t = x.t != null ? x.t : (x.en || 0) * dur; B.espera(Math.max(0, t), c).then(ok => ok && B.lamina.pon(x.lamina, c)); });
  }
  function programaImgs(lista, dur, c) {
    B.arr(lista).forEach(x => { const t = x.t != null ? x.t : (x.en || 0) * dur; B.espera(Math.max(0, t), c).then(ok => { if (!ok) return; M.cambia(x.img); if (x.vid) fondoVideo(x.vid, x.vidUnaVez); }); });   // (3-nov) x.vid: vídeo en bucle sobre esa lámina
  }
  /* vídeo de fondo en bucle, mudo (p. ej. el dron sobre Coruña): si no está, se queda la lámina */
  let vfondo = null;
  let vfondoSrc = null;
  /* (Iago 4-nov 21:56) que los vídeos arranquen fluidos desde el primer fotograma: se bajan al empezar la sesión y, poco antes de usarlos,
     se «ceban» (un <video> oculto que ya ha decodificado su primer fotograma). Como mucho 2 a la vez (memoria del iPad). */
  const VLISTO = {};
  M.preparaVideo = function (src) {
    if (!src || VLISTO[src] || src === vfondoSrc || !B.hayVideo(src)) return;
    const ks = Object.keys(VLISTO); if (ks.length >= 1) {   /* (4-nov 22:37) iPad: como mucho UN vídeo cebado a la vez */ const k = ks[0], o = VLISTO[k]; delete VLISTO[k]; const vv = o.v || o.el; if (vv) { try { vv.pause(); } catch (e) { } vv.remove(); } }
    const o = VLISTO[src] = { v: null };
    B.precargaVideo(src).then(url => {
      if (!url || VLISTO[src] !== o) return;
      const v = B.el('video', 'vfondo vcebo'); v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
      v.style.cssText = 'opacity:0;pointer-events:none';
      document.body.appendChild(v); o.el = v;
      /* se arranca un instante (para que decodifique) y se para en el fotograma 0; solo entonces queda disponible */
      const pr = v.play(); const para = () => { if (VLISTO[src] !== o) return; try { v.pause(); v.currentTime = 0; } catch (e) { } o.v = v; };
      if (pr && pr.then) pr.then(para).catch(para); else para();
    });
  };
  function fondoVideo(src, unaVez) {
    if (src && src === vfondoSrc && vfondo) return;
    vfondoSrc = src && B.hayVideo(src) ? src : null;
    if (vfondo) { const v = vfondo; vfondo = null; const quita = () => { try { v.pause(); } catch (e) { } v.remove(); }; if (pendiente) alPintar.push(quita); else quita(); }
    if (!src || !B.hayVideo(src)) return;
    const listo = VLISTO[src]; if (listo && listo.v) delete VLISTO[src];
    (listo && listo.v ? Promise.resolve(listo.v.src) : B.precargaVideo(src)).then(url => {
      if (!url || vfondoSrc !== src) return;
      const v = vfondo = (listo && listo.v) || B.el('video', 'vfondo'); v.muted = true; v.loop = !unaVez; v.playsInline = true; v.style.opacity = '0';
      if (listo && listo.v) { v.classList.remove('vcebo'); try { v.currentTime = 0; } catch (e) { } } else v.src = url;
      v.addEventListener('playing', () => { v.style.opacity = ''; }, { once: true });   // hasta que pinta su primer fotograma, se ve la lámina
      $('fondo').appendChild(v); const p = v.play(); if (p && p.catch) p.catch(() => { });
      B.vida.quita();   // la «vida» se pensó para la lámina: con el vídeo del dron sobra
    });
  }

  /* ── montar un plano ── */
  function montaPlano(p) {
    /* (Iago 4-nov) si el plano va directo a otro interactivo, se deja el anterior pintado (y su piel) hasta que el nuevo lo sustituya */
    if (!(p.inter && !B.arr(p.lineas).length)) M.limpiaInter();
    const q = M.fondo(p.negro ? null : p.img, { nombre: p.nombre, desc: p.desc, funde: p.funde });
    fondoVideo(p.fondoVid);
    if (p.amb !== undefined) B.ambiente(p.amb);
    if (p.mus === false) B.musica(null); else if (p.mus) B.musica(p.mus);
    if (vfondo && vfondoSrc) B.vida.quita(); else B.vida.pon((q && !q.falta && q.vida) || p.vida || []);
    B.capas.plano(p);
    const directo = p.inter && !B.arr(p.lineas).length;
    if (B.lamina && !(directo && p.lamina === undefined)) B.lamina.pon(p.lamina || null, ctl);   // (T2) lámina dibujada en código; (4-nov) si va directo a un interactivo, se queda hasta que este pinte
    programaLams(p.laminas, p.auto || 4, ctl);
    $('efecto').className = p.efecto ? 'ef-' + p.efecto : '';
    $('fondo').className = p.fondoClase || '';   // p. ej. 'ensuena' (desenfoque y ondulación)
    $('escena').classList.toggle('recuerdo', !!p.recuerdo);   // tinte cálido y bordes suaves (el ensayo es un recuerdo de Noa)
    B.arr(p.sfx).forEach(x => B.espera(x.t || 0, ctl).then(ok => ok && B.sfx(x.src, x.vol)));
    /* reacciones y sucesos del plano (sin frase): poses [{t, q, pose}] y al [{t, fn}] */
    if (p.poses) B.capas.linea({ poses: p.poses, mantenClaves: true }, p.auto || 4, ctl);
    B.arr(p.al).forEach(x => B.espera(x.t || 0, ctl).then(ok => ok && x.fn(ctl)));
    programaImgs(p.imgs, p.auto || 4, ctl);   // imgs del plano: [{t (s desde que empieza el plano) | en (fracción de auto), img}]
    pintaTit(p);
  }
  function pintaTit(p) { const e = S.escenas[escIdx]; $('marcaSub').textContent = e ? e.titulo : ''; }

  /* ══════════ CAJA DE DIÁLOGO ══════════ */
  let blipOn = true;
  function blip() {
    if (!blipOn) return;
    try {
      const c = B.ac(); if (c.state !== 'running') return;
      const o = c.createOscillator(), g = c.createGain(); o.type = 'square'; o.frequency.value = 880 + Math.random() * 60;
      g.gain.setValueAtTime(.13, c.currentTime); g.gain.exponentialRampToValueAtTime(.0005, c.currentTime + .045);
      o.connect(g); g.connect(B.bus.ui); o.start(); o.stop(c.currentTime + .05);
    } catch (e) { }
  }
  M.blip = blip;
  let esperaSigue = null;   // función que resuelve el «Continuar» que se está esperando
  function caja(on) { $('dialogo').classList.toggle('on', !!on); }
  function pintaTexto(txt, n) {
    const p = $('dTexto'); p.innerHTML = '';
    const a = B.el('span'); a.textContent = txt.slice(0, n); p.appendChild(a);
    const cu = B.el('span', 'cur'); cu.textContent = '_'; p.appendChild(cu);
    const b = B.el('span', 'oculto'); b.textContent = txt.slice(n); p.appendChild(b);   // el resto ocupa ya su sitio: nada salta de renglón
  }
  /* una frase: voz + texto letra a letra + reacciones; resuelve al pulsar «Continuar» */
  M.di = function (l, c) {
    c = c || ctl;
    const P = (B.PJ && B.PJ[l.quien]) || null;
    const nom = l.nombre || (P ? P.nombre : (l.quien === 'NARRADOR' ? 'Narrador' : l.quien || ''));
    const d = $('dialogo');
    d.className = 'on' + (l.estilo ? ' ' + l.estilo : '') + (l.quien === 'NARRADOR' ? ' narra' : '');
    $('dQuien').textContent = nom; $('dQuien').style.setProperty('--c', (P && P.color) || '#7fd4ff');
    $('dQuien').hidden = !nom;
    const bC = $('bCont'); bC.classList.remove('late'); bC.disabled = true; bC.textContent = l.boton || 'Continuar ▶';
    const vozSrc = l.voz === false ? null : (l.voz || ((B.CFG.voz || 'voz/t4/') + l.id + '.mp3'));
    const hayVoz = !!(vozSrc && B.buf[vozSrc]);
    const txt = l.texto || '';
    const durTxt = Math.max(1.6, txt.length * .075 + .3);   // (T2) sin voz: ~13 letras/s, el ritmo real de las voces de T1
    const dur = RAPIDO ? .3 : (hayVoz ? B.buf[vozSrc].duration : durTxt) + (l.espera || 0);
    M._durLinea = dur;   // (T3) las láminas que reparten sus partes por fracciones de la frase (balanza)
    if (l.img) M.cambia(l.img);
    programaImgs(l.imgs, dur, c);
    if (l.lamina !== undefined && B.lamina) B.lamina.pon(l.lamina, c);
    programaLams(l.laminas, dur, c);
    if (l.mus !== undefined) { if (l.mus === false) B.musicaCorta(); else B.musica(l.mus); }
    if (l.amb !== undefined) B.ambiente(l.amb);
    if (l.vida !== undefined) B.vida.pon(l.vida);
    B.capas.linea(l, dur, c);
    B.arr(l.sfx).forEach(x => B.espera(x.t != null ? x.t : (x.en || 0) * dur, c).then(ok => ok && B.sfx(x.src, x.vol)));
    /* sucesos de la frase: {t | en | tras (s después de acabar la voz), fn} */
    B.arr(l.al).forEach(x => B.espera(x.tras != null ? dur - (l.espera || 0) + x.tras : x.t != null ? x.t : (x.en || 0) * dur, c).then(ok => ok && x.fn(c)));
    let h = null;
    const t0 = B.ahora();
    if (hayVoz && !RAPIDO) { B.agacha(true); h = B.suena(vozSrc, { bus: l.filtro ? B.filtroVoz(l.filtro, B.buf[vozSrc].duration) : B.bus.voz, grupo: 'voz', vol: l.vol }); }
    return new Promise(res => {
      let n = 0, escrito = false, vozFin = !hayVoz, listo = false, ultBlip = 0, auto = null, hecho = false;
      pintaTexto(txt, 0);
      const vel = RAPIDO ? .001 : hayVoz ? Math.max(.012, (B.buf[vozSrc].duration * .9) / Math.max(1, txt.length)) : .032;
      const iv = setInterval(() => {
        if (c && c.muerto) return fin(false);
        if (escrito) return;
        const meta = Math.min(txt.length, Math.floor((B.ahora() - t0) / vel) + 1);
        if (meta > n) {
          n = meta; pintaTexto(txt, n);
          const ini = txt.slice(0, n).search(/\S+$/), enPal = ini < 0 ? -1 : n - 1 - ini, ms = performance.now();
          if ((!hayVoz || B.CFG.blipConVoz) && enPal >= 0 && enPal % 2 === 0 && ms - ultBlip > 70) { blip(); ultBlip = ms; }
        }
        if (n >= txt.length) { escrito = true; pintaTexto(txt, txt.length); prueba(); }
      }, 30);
      B.espera(dur, c).then(ok => { if (!ok) return fin(false); vozFin = true; if (hayVoz) B.agacha(false); prueba(); });
      function prueba() {
        if (listo || !escrito || !vozFin) return;
        listo = true; bC.disabled = false; bC.classList.add('late'); d.classList.add('lista');
        if (l.enMus != null) auto = setTimeout(() => fin(true), 0);   // (D2) frase anclada a la música: sigue sola en cuanto acaba
        else if (AULA || l.auto) auto = setTimeout(() => fin(true), 1000 * Math.max(l.auto || 0, 1.2 + (hayVoz ? .3 : txt.length * .02)));
      }
      function toca() {   // clic en la caja: completa el texto; con todo listo, sigue
        if (!escrito) { escrito = true; n = txt.length; pintaTexto(txt, n); prueba(); return; }
        if (listo) fin(true);
      }
      function fin(ok) {
        if (hecho) return; hecho = true;
        clearInterval(iv); clearTimeout(auto); esperaSigue = null; d.classList.remove('lista');
        bC.classList.remove('late'); bC.disabled = true;
        if (!ok && h) h.parar(.1);
        if (hayVoz) B.agacha(false);
        res(ok);
      }
      esperaSigue = toca;
      /* (Iago 5-nov) l.sigueEn: a esos segundos de la voz, la frase siguiente entra SIN «Continuar» (la interrumpe; la voz sigue sonando) */
      if (l.sigueEn != null && !RAPIDO) setTimeout(() => { if (hecho) return; escrito = true; pintaTexto(txt, txt.length); fin(true); }, 1000 * l.sigueEn);
      if (c) c.alMorir.push(() => fin(false));
    });
  };
  M.calla = function () { caja(false); };

  /* ══════════ CARTELES DE LOS INTERACTIVOS ══════════
     primero en el centro con «Entendido»; después, abajo junto a los botones */
  M.cartel = function (txt, o) {
    o = o || {};
    caja(false);
    const capa = $('cartel'), bar = $('barra');
    return new Promise(res => {
      capa.innerHTML = '';
      const box = B.el('div', 'cart'); box.innerHTML = '<p>' + txt + '</p>';
      const b = B.el('button', 'prim', o.boton || 'Entendido'); b.type = 'button';
      if (o.extra) { const f = B.el('div', 'fila'); f.appendChild(b); B.arr(o.extra).forEach(x => f.appendChild(x)); box.appendChild(f); }   /* (3-nov) botones de más (p. ej. «Transportarnos al menú principal») */
      else box.appendChild(b);
      capa.appendChild(box); capa.classList.add('on');
      const sigue = () => { capa.classList.remove('on'); capa.innerHTML = ''; M.barra(txt, o.botones); res(true); };
      b.addEventListener('click', ev => { ev.stopPropagation(); sigue(); });
      if (AULA && o.aulaSolo !== false) setTimeout(() => { if (capa.classList.contains('on')) sigue(); }, 4500);
      setTimeout(() => b.focus(), 50);
    });
  };
  /* barra inferior: texto del cartel + botones del interactivo + «Continuar» (se enciende al terminar) */
  M.barra = function (txt, botones) {
    const bar = $('barra');
    bar.innerHTML = '';
    if (txt == null) { bar.classList.remove('on'); return null; }
    const p = B.el('p', 'bt'); p.innerHTML = txt; bar.appendChild(p);
    const fila = B.el('div', 'bb'); bar.appendChild(fila);
    B.arr(botones).forEach(b => fila.appendChild(b));
    const cont = B.el('button', 'prim bCorr', 'Continuar ▶'); cont.type = 'button'; cont.disabled = true; cont.id = 'bInterSig';
    fila.appendChild(cont);
    bar.classList.add('on');
    return cont;
  };
  M.barraTexto = function (txt) { const p = B.$('#barra .bt'); if (p) p.innerHTML = txt; };
  /* espera a que el interactivo deje seguir: enciende «Continuar» de la barra y resuelve al pulsarlo */
  M.esperaSigue = function (c) {
    const b = $('bInterSig'); if (!b) return Promise.resolve(true);
    b.disabled = false; b.classList.add('late');
    return new Promise(res => {
      const f = ev => { if (ev) ev.stopPropagation(); b.removeEventListener('click', f); res(true); };
      b.addEventListener('click', f);
      if (c) c.alMorir.push(() => res(false));
    });
  };
  /* (Iago 4-nov) al acabar un interactivo, su contenido NO se vacía todavía: se queda pintado (sin poder tocarse) hasta que el
     siguiente interactivo pinta el suyo encima, o hasta que un plano sin interactivo lo retira. Así nunca se ve el fondo «vacío». */
  M.limpiaInter = function () { $('inter').innerHTML = ''; $('inter').className = ''; $('escena').classList.remove('con-inter', 'piel-epoca', 'piel-teatro'); };
  M.finInter = function (limpia) { M.barra(null); $('cartel').classList.remove('on'); if (limpia) { M.limpiaInter(); return; } $('inter').classList.add('saliente'); };

  /* ══════════ VÍDEO ══════════ con «Cargando… %»; si falta, un marcador que dura lo previsto */
  /* al acabar un vídeo o un túnel no se quita la capa: se queda el último fotograma hasta que la lámina siguiente está pintada */
  function congela(capa) {
    M._congelado = true;
    alPintar.push(fd => {
      M._congelado = false;
      const quita = () => { if (M._congelado) return; capa.classList.remove('on'); capa.style.transition = ''; capa.style.opacity = ''; B.$$('video', capa).forEach(v => { try { v.pause(); } catch (e) { } }); capa.innerHTML = ''; };
      if (fd) { capa.style.transition = 'opacity ' + fd + 's ease'; capa.style.opacity = '0'; setTimeout(quita, fd * 1000 + 50); } else quita();
    });
  }
  /* fundido a blanco (Iago, 2-nov: antes del Paleolítico): sube muy despacio al final del plano y se va al empezar el siguiente */
  function blanco(on, seg) { const b = $('blanco'); if (!b) return; b.style.transition = 'opacity ' + (seg || 1.5) + 's ' + (on ? 'ease-in' : 'ease-out'); b.classList.toggle('on', !!on); M._blanco = !!on; }
  function programaBlanco(p, c, dur) { if (!p.blanco) return; B.espera(Math.max(0, dur - p.blanco), c).then(ok => { if (!ok) return; blanco(true, p.blanco); if (p.sfxBlanco) B.sfx(p.sfxBlanco, .8); }); }
  M.descongela = function () { if (M._congelado) trasPintar(); };
  function video(p, c) {
    const capa = $('video');
    const viejos = Array.from(capa.children), quitaViejos = () => viejos.forEach(e => { if (e.tagName === 'VIDEO') try { e.pause(); } catch (x) { } e.remove(); });
    alPintar.length = 0; M._congelado = false; pendiente = false;   // el vídeo nuevo sustituye al congelado
    capa.style.transition = ''; capa.style.opacity = '';
    capa.classList.add('on'); caja(false);
    B.capas.limpia(); B.vida.quita(); if (B.lamina) B.lamina.pon(null);
    if (p.tunel && (!p.video || !B.hayVideo(p.video))) {   // transición propia mientras no llegue el vídeo de Runway
      B.arr(p.sfx).forEach(x => B.espera(x.t || 0, c).then(ok => ok && B.sfx(x.src, x.vol)));
      const dT = RAPIDO ? .5 : (p.dur || 5);
      programaBlanco(p, c, dT);
      /* vid/tunel.mp4 (Runway, sin texto) sirve para TODOS los saltos: un trozo en los cortos, entero en el largo; encima, el contador */
      const vt = B.hayVideo(TUNEL) ? B.precargaVideo(TUNEL) : Promise.resolve(null);
      return vt.then(url => {
        if (c && c.muerto) return false;
        const pr = B.tunel(capa, Object.assign({ dur: dT, video: url || null }, p.tunel), c);
        B.arr(p.destellos).forEach(d => B.espera(RAPIDO ? .1 : (d.t || 0), c).then(ok => ok && destello(capa, d, c)));
        requestAnimationFrame(() => requestAnimationFrame(quitaViejos));
        return pr.then(ok => { congela(capa); return ok; });
      });
    }
    if (!B.hayVideo(p.video)) {
      quitaViejos(); capa.innerHTML = '<div class="vmarca"><b>' + B.esc(p.nombre || 'Vídeo') + '</b><small>' + B.esc(p.video) + '</small><span>' + B.esc(p.desc || '') + '</span><i></i></div>';
      const barra = B.$('.vmarca i', capa), dur = RAPIDO ? .5 : (p.dur || 5), t0 = B.ahora();
      const iv = setInterval(() => { barra.style.width = Math.min(100, (B.ahora() - t0) / dur * 100) + '%'; }, 100);
      B.arr(p.sfx).forEach(x => B.espera(x.t || 0, c).then(ok => ok && B.sfx(x.src, x.vol)));
      return B.espera(dur, c).then(ok => { clearInterval(iv); capa.classList.remove('on'); capa.innerHTML = ''; return ok; });
    }
    const carga = B.el('div', 'vcarga', 'Cargando… 0 %'); capa.appendChild(carga);
    return B.precargaVideo(p.video, f => { carga.textContent = 'Cargando… ' + Math.round(f * 100) + ' %'; }).then(url => {
      if (c && c.muerto) return false;
      carga.remove();
      if (!url) { quitaViejos(); capa.classList.remove('on'); return true; }
      const v = B.el('video'); v.playsInline = true; v.src = url; v.volume = p.vol == null ? 1 : p.vol; v.style.opacity = '0'; capa.appendChild(v);
      v.addEventListener('playing', () => { v.style.opacity = ''; requestAnimationFrame(quitaViejos); programaBlanco(p, c, RAPIDO ? .5 : (v.duration || p.dur || 5));
        /* los vídeos de Runway no traen sonido: los efectos y sucesos del plano van a su tiempo desde que empieza a verse */
        B.arr(p.sfx).forEach(x => B.espera(x.t || 0, c).then(ok => ok && B.sfx(x.src, x.vol)));
        B.arr(p.al).forEach(x => B.espera(x.t || 0, c).then(ok => ok && x.fn(c))); }, { once: true });   // hasta su primer fotograma, se ve lo de antes
      return new Promise(res => {
        const fin = ok => { v.onended = null; try { v.pause(); } catch (e) { } if (ok) congela(capa); else { capa.classList.remove('on'); capa.innerHTML = ''; } res(ok); };
        v.onended = () => fin(true); v.onerror = () => fin(true);
        if (c) c.alMorir.push(() => fin(false));
        const pr = v.play(); if (pr && pr.catch) pr.catch(() => fin(true));
      });
    });
  }

  /* ══════════ RECORRIDO ══════════ */
  function lineas(ls, c) {
    let i = 0;
    const sig = () => { if (c.muerto) return Promise.resolve(false); if (i >= ls.length) return Promise.resolve(true); const l = ls[i++];
      /* (D2, T3 final) l.enMus = segundo de la música (desde B._tFinal0) en que entra la frase: la voz cae donde A dejó su hueco */
      const tm = l.enMus != null && B._tFinal0 != null && !RAPIDO ? l.enMus - (B.ahora() - B._tFinal0) : 0;
      return (tm > .02 ? B.espera(tm, c) : Promise.resolve(true)).then(ok => ok ? M.di(l, c) : false).then(ok => ok ? sig() : false); };
    return sig();
  }
  const TUNEL = '../s1/vid/tunel.mp4';
  /* DESTELLO dentro del túnel (Iago, 2-nov: viaje de vuelta): ~3 s de un vídeo (o lámina) envuelto en la nebulosa del túnel,
     sin fecha ni rótulo; con su sonido (sfx) y sus sucesos (fn). d = { t, dur, video, desde (s del vídeo), img, sfx, vol, fn } */
  function destello(capa, d, c) {
    const dur = RAPIDO ? .4 : (d.dur || 3), box = B.el('div', 'destello'); let v = null;
    if (d.video && B.hayVideo(d.video)) {
      v = B.el('video'); v.muted = true; v.playsInline = true; v.preload = 'auto';
      B.precargaVideo(d.video).then(url => { if (!url || !box.isConnected) return; v.src = url;
        v.addEventListener('loadedmetadata', () => { try { v.currentTime = d.desde || 0; } catch (e) { } const pp = v.play(); if (pp && pp.catch) pp.catch(() => { }); }, { once: true }); });
      box.appendChild(v);
    } else if (d.img) { const q = B.primero(d.img); if (q && !q.falta) { const im = B.el('img'); im.src = q.src; box.appendChild(im); } }
    box.appendChild(B.el('i', 'destello-neb'));
    capa.appendChild(box);
    requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('on')));
    if (d.sfx) B.sfx(d.sfx, d.vol == null ? 1 : d.vol);
    if (d.fn) d.fn(c);
    const quita = () => { box.classList.remove('on'); setTimeout(() => { if (v) try { v.pause(); } catch (e) { } box.remove(); }, 900); };
    B.espera(Math.max(.2, dur - .7), c).then(quita);
  }
  /* TELETRANSPORTE reutilizable (Iago, 2-nov): el túnel (vid/tunel.mp4 de Runway; si no está, el túnel dibujado) con su sonido
     (salto + flash) y fundido a blanco al final. o = { dur (s, 3–4 por defecto), desde, hasta (años: si se dan, sale el contador), alFinal } */
  M.teletransporte = function (o) {
    o = o || {};
    const capa = $('video'), dur = o.dur || 3.6, c = B.control();
    alPintar.length = 0; M._congelado = false; capa.style.transition = ''; capa.style.opacity = '';
    capa.innerHTML = ''; capa.classList.add('on'); caja(false); B.capas.limpia(); B.vida.quita(); $('cartel').classList.remove('on');
    B.musica(null); B.ambiente([]);
    B.sfx('../s1/sfx/sfx_salto_tiempo.mp3', .8);
    const fl = B.existe('../s1/sfx/sfx_flash_blanco.mp3') ? '../s1/sfx/sfx_flash_blanco.mp3' : '../s1/sfx/sfx_flash_blanco_sint.mp3';
    B.espera(Math.max(0, dur - 2.9), c).then(ok => { if (!ok) return; B.sfx(fl, .8); });   // (Iago 3-nov) el destello suena entero antes de cambiar de página
    B.espera(Math.max(0, dur - 1.7), c).then(ok => { if (!ok) return; blanco(true, 1.6); });
    const vt = B.hayVideo(TUNEL) ? B.precargaVideo(TUNEL) : Promise.resolve(null);
    return vt.then(url => B.tunel(capa, { dur: dur, de: o.desde == null ? 2100 : o.desde, a: o.hasta == null ? 2100 : o.hasta, video: url || null, contador: o.desde != null }, c))
      .then(() => B.espera(.2, c)).then(() => { if (o.alFinal) o.alFinal(); return true; });
  };
  function plano(p, c) {
    M.plano = p.id; document.body.setAttribute('data-plano', p.id);
    if (M._blanco) setTimeout(() => blanco(false, 1.6), 250);   // del blanco a lo siguiente
    const vidOk = p.video && B.hayVideo(p.video);
    if (vidOk || p.tunel || (p.video && !p.img)) {   // plano de vídeo (o túnel); si falta el vídeo y hay img, se monta como lámina fija: el sonido va dentro del vídeo (la música del plano anterior se apaga si mus:false)
      if (p.mus === false) B.musica(null); else if (p.mus) B.musica(p.mus);
      if (p.amb !== undefined) B.ambiente(p.amb);
      $('marcaSub').textContent = (S.escenas[escIdx] || {}).titulo || '';
      M.limpiaInter();
      return video(p, c);
    }
    montaPlano(p);
    const ls = B.arr(p.lineas);
    vidsDe(p).concat(vidsDe(sigPlano(p) || {})).slice(0, 1).forEach(M.preparaVideo);   // los de este plano y, si cabe, los del siguiente
    B.arr(p.imgs).concat(ls.concat(B.arr(p.despues)).reduce((a, l) => a.concat(l.img ? [{ img: l.img }] : [], B.arr(l.imgs)), [])).forEach(x => M.predecod(x.img));
    let paso = ls.length ? (p.antes ? (caja(false), B.espera(RAPIDO ? .1 : p.antes, c).then(ok => ok ? (caja(true), lineas(ls, c)) : false)) : (caja(true), lineas(ls, c)))
      : (caja(false), B.espera(RAPIDO ? .3 : (p.auto || 0), c));
    if (p.inter) paso = paso.then(ok => {
      if (!ok) return false;
      const f = B.inter[p.inter.tipo];
      if (!f) { console.warn('Interactivo desconocido', p.inter.tipo); return true; }
      caja(false); $('escena').classList.add('con-inter'); B.capas.quitaClaves();
      $('escena').classList.toggle('piel-epoca', p.inter.piel === 'epoca');   /* (3-nov) piel «época» (Santiago, 1730): panel, cartel y barra */
      if (p.ambInter !== undefined) B.ambiente(p.ambInter);   // el ambiente baja mientras suenan los instrumentos del interactivo
      const r = f(p.inter, c);
      if (B.lamina && p.lamina === undefined && !B.arr(p.lineas).length) { const lam = $('lamina'); if (lam && lam.children.length) { lam.innerHTML = ''; B.lamina.pon(null); } }   // el interactivo ya está pintado: fuera la lámina de antes, sin hueco
      return Promise.resolve(r).then(ok2 => { M.finInter(); return ok2; });
    });
    if (p.despues) paso = paso.then(ok => ok ? (caja(true), lineas(p.despues, c)) : false);
    return paso;
  }
  function escena(i, k0) {
    if (ctl) ctl.matar();
    ctl = B.control(); const c = ctl;
    escIdx = i;
    const e = S.escenas[i]; if (!e) return fin();
    B.progreso.escena(i, e.id);
    pintaPuntos();
    let k = Math.max(0, Math.min((k0 || 0), e.planos.length - 1));
    const sig = () => { if (c.muerto) return; if (k >= e.planos.length) return escena(i + 1); B.progreso.plano(i, k); const p = e.planos[k++]; plano(p, c).then(ok => { if (ok) sig(); }); };
    sig();
  }
  /* saltar (profe) o seguir donde se dejó: limpia lo que hubiera en pantalla y pone la música y el ambiente que tocan en ese punto */
  function sonidoEn(i, k) {
    let mus = null, amb = [];
    for (let a = 0; a < S.escenas.length; a++) for (let b = 0; b < S.escenas[a].planos.length; b++) {
      if (a > i || (a === i && b >= k)) return { mus: mus, amb: amb };
      const p = S.escenas[a].planos[b];
      if (p.mus === false) mus = null; else if (p.mus) mus = p.mus;
      if (p.amb !== undefined) amb = p.amb;
      B.arr(p.lineas).concat(B.arr(p.despues)).forEach(l => { if (l.mus === false) mus = null; else if (l.mus) mus = l.mus; if (l.amb !== undefined) amb = l.amb; });
    }
    return { mus: mus, amb: amb };
  }
  function salta(i, k) {
    if (ctl) ctl.matar();
    M.terminado = false; M.finInter(true); caja(false); B.capas.limpia(); B.vida.quita(); if (B.lamina) B.lamina.pon(null);
    const cv = $('video'); cv.classList.remove('on'); cv.innerHTML = ''; cv.style.opacity = ''; alPintar.length = 0; M._congelado = false; blanco(false, .1); $('cartel').classList.remove('on', 'negro'); $('cartel').innerHTML = ''; fin._visto = false;
    if (window.TR.viento) B.viento.parar();
    const p = (S.escenas[i] || {}).planos ? S.escenas[i].planos[k || 0] : null;
    const so = sonidoEn(i, k || 0);
    if (!p || p.mus === undefined) B.musica(so.mus && so.mus.bucle === false ? null : so.mus);
    if (!p || p.amb === undefined) B.ambiente(so.amb);
    escena(i, k || 0);
  }
  M.salta = salta;
  M.hayFondoVideo = () => !!vfondo;
  M.fondoVideo = fondoVideo;   // (T3) la secuencia cinemática pone sus vídeos de dron
  M.escena = escena;
  M.actual = () => escIdx;
  function pintaPuntos() {
    const d = $('puntos'); if (!d) return; d.innerHTML = '';
    d.classList.toggle('saltar', PROF);
    S.escenas.forEach((e, i) => {
      const s = B.el('i', i < escIdx ? 'ya' : (i === escIdx ? 'act' : '')); s.title = e.titulo; d.appendChild(s);
      if (PROF) s.addEventListener('click', ev => { ev.stopPropagation(); menuPlanos(i); });
    });
  }
  /* profe: al pulsar un puntito, la lista de planos de esa escena */
  function menuPlanos(i) {
    const d = $('puntos'), viejo = B.$('.saltos', d); if (viejo) { viejo.remove(); if (+viejo.dataset.e === i) return; }
    const e = S.escenas[i], m = B.el('div', 'saltos'); m.dataset.e = i;
    m.appendChild(B.el('b', '', (i + 1) + ' · ' + e.titulo));
    e.planos.forEach((p, k) => { const b = B.el('button', '', p.nombre || p.id); b.type = 'button'; b.addEventListener('click', ev => { ev.stopPropagation(); m.remove(); salta(i, k); }); m.appendChild(b); });
    d.appendChild(m);
    const cierra = ev => { if (!m.contains(ev.target)) { m.remove(); document.removeEventListener('pointerdown', cierra, true); } };
    setTimeout(() => document.addEventListener('pointerdown', cierra, true), 0);
  }
  /* teletransporte al menú principal (el hash #c= del profe viaja intacto) */
  function aMenu() { M.teletransporte({ dur: 3.6, alFinal: () => { const v = window.MOD_VOLVER || '../prueba.html'; location.href = v + (v.indexOf('?') < 0 ? '?' : '&') + 'tp=1' + location.hash; } }); }
  /* (Iago 3-nov) salir al menú desde un interactivo opcional (ejercicio final): la sesión cuenta como vista */
  M.alMenu = function () {
    if (M._yendo) return; M._yendo = true;
    if (ctl) ctl.matar(); M.finInter(true); caja(false); B.capas.limpia();
    try { B.progreso.fin(); B.progreso.plano(null); } catch (e) { }
    aMenu();
  };
  function fin() {
    caja(false); B.capas.limpia(); B.vida.quita(); B.progreso.fin(); B.progreso.plano(null);
    if (!S.continuara) M.limpiaInter();   // (T4) la tarjeta final, sin el ejercicio detrás
    const capa = $('cartel'); capa.innerHTML = '';
    /* (T3) cliffhanger: negro → «Continuará» (S.continuara = texto) → la tarjeta final con «Transportarnos al menú principal» */
    if (S.continuara && !fin._visto) {
      fin._visto = true; if (B.lamina) B.lamina.pon(null);
      const cv = $('video'); cv.classList.remove('on'); cv.innerHTML = '';
      M.fondo(null);
      const ct = B.el('div', 'continuara', '<span>' + B.esc(S.continuara) + '</span>'); capa.appendChild(ct); capa.classList.add('on', 'negro');
      requestAnimationFrame(() => requestAnimationFrame(() => ct.classList.add('on')));
      const c = B.control(); ctl = c;
      B.espera(RAPIDO ? .3 : (S.continuaraDur || 4.2), c).then(ok => { if (!ok) return; ct.classList.add('va'); return B.espera(RAPIDO ? .1 : 1.1, c); })
        .then(ok => { if (ok === false || c.muerto) return; capa.classList.remove('negro'); fin(); });
      return;
    }
    fin._visto = false;
    const box = B.el('div', 'cart fin');
    box.innerHTML = '<p class="sup">' + B.esc(S.titulo) + '</p><h2>' + B.esc(S.subtitulo || '') + '</h2>' + (B.notaFinal != null ? '<p class="nota">Tu nota en el ejercicio final: <b>' + String(B.notaFinal).replace('.', ',') + '</b></p>' : '');
    if (B.lamina) B.lamina.pon(null);
    const b = B.el('button', 'prim', 'Transportarnos al menú principal'); b.type = 'button';
    b.addEventListener('click', () => { b.disabled = true; capa.classList.remove('on'); capa.innerHTML = ''; aMenu(); });
    const r = B.el('button', '', '↺ Repetir'); r.type = 'button'; r.addEventListener('click', () => { capa.classList.remove('on'); fin._visto = false; salta(0, 0); });
    const f = B.el('div', 'fila'); f.appendChild(r); f.appendChild(b); box.appendChild(f);
    capa.appendChild(box); capa.classList.add('on');
    M.terminado = true;
  }

  /* ── recursos de la sesión (para la precarga) ── */
  function recursos() {
    const r = [];
    const A = a => B.todas(a && a.src !== undefined ? a.src : a).forEach(x => r.push(x));
    const L = l => { if (!l) return; r.push(l.voz === false ? null : (l.voz || ((B.CFG.voz || 'voz/t4/') + l.id + '.mp3'))); if (l.img) A(l.img); B.arr(l.sfx).forEach(x => r.push(x.src)); if (l.mus) A(l.mus); B.arr(l.amb).forEach(A); };
    S.escenas.forEach(e => e.planos.forEach(p => {
      if (p.img) A(p.img); B.arr(p.amb).forEach(A); if (p.mus) A(p.mus);
      B.arr(p.sfx).forEach(x => r.push(x.src)); B.arr(p.lineas).concat(B.arr(p.despues)).forEach(L);
      if (p.inter) { if (p.inter.lineas) Object.keys(p.inter.lineas).forEach(k => L(p.inter.lineas[k])); /* (4-nov) voces de la secuencia de entrada */ if (p.inter.mp3) A(p.inter.mp3); B.arr(p.inter.recursos).forEach(x => r.push(x)); B.arr(p.inter.preguntas).forEach(q => q.fondo && A(q.fondo)); if (p.inter.fondo) A(p.inter.fondo); }
    }));
    return r.concat(B.capas.recursos(S), B.arr(S.recursos));
  }
  function sigPlano(p) { if (!S) return null; const ps = []; S.escenas.forEach(e => e.planos.forEach(q => ps.push(q))); const i = ps.indexOf(p); return i >= 0 ? ps[i + 1] : null; }
  function vidsDe(p) { const v = []; if (p.fondoVid) v.push(p.fondoVid); const I = l => B.arr(l && l.imgs).forEach(x => x.vid && v.push(x.vid)); I(p); B.arr(p.lineas).forEach(I);
    if (p.inter && p.inter.vids) Object.values(p.inter.vids).forEach(x => B.arr(x).forEach(y => v.push(y))); return v.filter(x => B.hayVideo(x)); }
  function videos() { const v = []; if (B.hayVideo(TUNEL) && S.escenas.some(e => e.planos.some(p => p.tunel))) v.push(TUNEL); S.escenas.forEach(e => e.planos.forEach(p => { if (p.video && B.hayVideo(p.video)) v.push(p.video); if (p.fondoVid && B.hayVideo(p.fondoVid)) v.push(p.fondoVid); B.arr(p.destellos).forEach(d => { if (d.video && B.hayVideo(d.video)) v.push(d.video); }); vidsDe(p).forEach(x => v.indexOf(x) < 0 && v.push(x)); })); return v; }

  /* ══════════ ARRANQUE ══════════ */
  B.sesion = function (d) { S = d; };
  M.sesion = () => S;
  document.addEventListener('DOMContentLoaded', function () {
    if (!S) return;
    document.title = S.titulo + ' · Transporte';
    $('marcaTit').textContent = S.titulo;
    $('iSup').textContent = S.sup || ''; $('iTit').textContent = S.titulo; $('iSub').textContent = S.subtitulo || '';
    encaja(); window.addEventListener('resize', encaja);
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(n => document.addEventListener(n, () => setTimeout(encaja, 60)));
    if (AULA) document.body.classList.add('aula');
    B.ac();
    const ini = $('inicio'), est = $('iEstado');
    let cargado = false, pulsado = false, desde = null;
    const g = B.progreso.donde();   // { e, k } del último plano, si quedó a medias
    const nPunto = B.param('escena') ? null : (g && (g.e > 0 || g.k > 0) && g.e < S.escenas.length ? g : null);
    if (nPunto) {
      ini.classList.add('con-sigue');
      const t = S.escenas[nPunto.e] ? S.escenas[nPunto.e].titulo : '';
      $('bSigue').title = 'Escena ' + (nPunto.e + 1) + ' · ' + t;
      $('bSigue').addEventListener('click', ev => { ev.stopPropagation(); desde = nPunto; pulsa(); });
      $('bDesde0').addEventListener('click', ev => { ev.stopPropagation(); desde = { e: 0, k: 0 }; pulsa(); });
    }
    const piano = window.Sonido ? Sonido.listo() : Promise.resolve();
    Promise.all([piano, B.precarga(recursos(), pr => {
      const k = pr.total ? Math.min(99, Math.round(pr.bytes / pr.total * 100)) : 99;
      if (!cargado) est.textContent = 'Cargando… ' + k + ' %';
    })]).then(() => {
      cargado = true; ini.classList.add('listo'); est.textContent = '';
      videos().forEach(v => B.precargaVideo(v));   // los vídeos siguen bajando mientras empieza la sesión
      if (pulsado) arranca();
    });
    const pulsa = () => {
      if (pulsado) return; pulsado = true;
      try { const c = B.ac(); if (c.resume) c.resume(); } catch (e) { }
      ini.classList.add('va');
      if (cargado) arranca(); else est.textContent = est.textContent || 'Cargando…';
    };
    ini.addEventListener('click', () => { if (!nPunto) pulsa(); });
    document.addEventListener('keydown', function k(ev) { if (ini.classList.contains('fuera')) return document.removeEventListener('keydown', k); if (ev.key === 'Enter' || ev.key === ' ') { if (nPunto && !desde) desde = nPunto; pulsa(); } });
    M._desde = () => desde;
    /* Continuar: botón, clic en la caja, Intro o espacio */
    $('bCont').addEventListener('click', ev => { ev.stopPropagation(); if (esperaSigue) esperaSigue(); });
    $('dialogo').addEventListener('click', () => { if (esperaSigue) esperaSigue(); });
    /* teclas de interfaz (Splice) en los botones de los interactivos */
    $('escena').addEventListener('click', ev => { const b = ev.target.closest && ev.target.closest('button'); if (b && !b.disabled && b.id !== 'bCont' && b.id !== 'bInterSig' && B.viento) B.viento.ui('clic'); }, true);
    document.addEventListener('keydown', ev => {
      if ((ev.key === 'Enter' || ev.key === ' ') && esperaSigue && $('dialogo').classList.contains('on') && !/INPUT|TEXTAREA|BUTTON|SELECT/.test((document.activeElement || {}).tagName || '')) { ev.preventDefault(); esperaSigue(); }
    });
  });
  /* (Iago 5-nov 16:45) VOLUNTARIOS: con la cuenta Protester y en hora de clase, al empezar sale «Seleccionar voluntario»
     (gp.lmathome.es/voluntarios/lm-voluntarios.js, cargado por index.html). A los alumnos no les pasa nada: no hay LMVoluntarios. */
  let volEstado = 0;   // 0 sin ofrecer · 1 ofreciendo · 2 hecho
  function arranca() {
    if (volEstado === 1) return;
    if (volEstado === 0 && window.LMVoluntarios && window.LMVoluntarios.ofrece) {
      volEstado = 1; try { B.ac().resume(); } catch (e) { }
      const sigue = () => { volEstado = 2; arranca0(); };
      let p; try { p = window.LMVoluntarios.ofrece({}); } catch (e) { p = null; }
      return p && p.then ? p.then(sigue, sigue) : sigue();
    }
    volEstado = 2; return arranca0();
  }
  function arranca0() {
    const ini = $('inicio');
    B.arrancado = true;
    try { B.ac().resume(); } catch (e) { }
    ini.classList.add('sale');
    setTimeout(() => { ini.classList.add('fuera'); }, 1200);
    const d = M._desde && M._desde();
    if (d && (d.e > 0 || d.k > 0)) return salta(d.e, d.k);
    const n = parseInt(B.param('escena') || '0', 10) || 0;
    escena(Math.max(0, Math.min(S.escenas.length - 1, n)));
  }
  /* el escenario 1920×1080 se escala para caber entero (con o sin pantalla completa: nunca hay scroll) */
  function encaja() {
    const e = $('escena'); if (!e) return;
    const k = Math.min(innerWidth / 1920, innerHeight / 1080);
    e.style.transform = 'translate(-50%,-50%) scale(' + k.toFixed(4) + ')';
  }
  M.encaja = encaja;
})(window.TR);
