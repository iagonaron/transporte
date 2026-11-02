/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE · motor de la sesión (escenas → planos → frases), sobre el patrón de 4 Sabores (M.di, montaPlano,
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
  let S = null, ctl = null, escIdx = 0;
  const $ = id => document.getElementById(id);

  /* ── lámina de fondo (o marcador si falta el fichero) ──
     src: 'img/t1/x.webp' o lista con sustitutos [{src, zoom, cx, cy, ajuste:'contain', luz, vida}] → el primero que exista.
     zoom/cx/cy: encuadre dentro de la lámina (cx, cy = punto que queda en el centro, fracciones); ajuste 'contain' = lámina
     vertical entera sobre una copia desenfocada; luz = brillo (p. ej. .6 para «de noche»). */
  let fondoAct = null, fondoOpc = null;
  M.fondo = function (src, o) {
    o = o || {};
    const f = $('fondo');
    const q = src ? B.primero(src) : null;
    const clave = q ? JSON.stringify(q) : null;
    if (clave === fondoAct && !o.forzar) return fondoOpc;
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
    } else { nuevo.classList.add('marca'); nuevo.innerHTML = '<div><b>' + B.esc(o.nombre || 'Lámina') + '</b><small>' + B.esc(q.src) + '</small>' + (o.desc ? '<span>' + B.esc(o.desc) + '</span>' : '') + '</div>'; }
    f.appendChild(nuevo);
    B.$$('.lam', f).forEach(e => { if (e !== nuevo) e.remove(); });
    if (B.capas) { B.capas.oculta = (q && !q.falta && q.ocultaPj) || []; const a = B.capas.pjActual(); if (a && B.capas.oculta.indexOf(a.q) >= 0) B.capas.pj(null); }
    return q;
  };
  /* vídeo de fondo en bucle, mudo (p. ej. el dron sobre Coruña): si no está, se queda la lámina */
  let vfondo = null;
  let vfondoSrc = null;
  function fondoVideo(src) {
    if (src && src === vfondoSrc && vfondo) return;
    vfondoSrc = src && B.hayVideo(src) ? src : null;
    if (vfondo) { try { vfondo.pause(); } catch (e) { } vfondo.remove(); vfondo = null; }
    if (!src || !B.hayVideo(src)) return;
    B.precargaVideo(src).then(url => {
      if (!url || vfondoSrc !== src) return;
      vfondo = B.el('video', 'vfondo'); vfondo.muted = true; vfondo.loop = true; vfondo.playsInline = true; vfondo.src = url;
      $('fondo').appendChild(vfondo); const p = vfondo.play(); if (p && p.catch) p.catch(() => { });
      B.vida.quita();   // la «vida» se pensó para la lámina: con el vídeo del dron sobra
    });
  }

  /* ── montar un plano ── */
  function montaPlano(p) {
    $('escena').classList.toggle('con-inter', false);
    const q = M.fondo(p.negro ? null : p.img, { nombre: p.nombre, desc: p.desc });
    fondoVideo(p.fondoVid);
    if (p.amb !== undefined) B.ambiente(p.amb);
    if (p.mus === false) B.musica(null); else if (p.mus) B.musica(p.mus);
    if (vfondo && vfondoSrc) B.vida.quita(); else B.vida.pon((q && !q.falta && q.vida) || p.vida || []);
    B.capas.plano(p);
    $('efecto').className = p.efecto ? 'ef-' + p.efecto : '';
    B.arr(p.sfx).forEach(x => B.espera(x.t || 0, ctl).then(ok => ok && B.sfx(x.src, x.vol)));
    /* reacciones y sucesos del plano (sin frase): poses [{t, q, pose}] y al [{t, fn}] */
    if (p.poses) B.capas.linea({ poses: p.poses, mantenClaves: true }, p.auto || 4, ctl);
    B.arr(p.al).forEach(x => B.espera(x.t || 0, ctl).then(ok => ok && x.fn(ctl)));
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
    const vozSrc = l.voz === false ? null : (l.voz || ('voz/t1/' + l.id + '.mp3'));
    const hayVoz = !!(vozSrc && B.buf[vozSrc]);
    const txt = l.texto || '';
    const durTxt = Math.max(1.6, txt.length * .062);
    const dur = RAPIDO ? .3 : (hayVoz ? B.buf[vozSrc].duration : durTxt) + (l.espera || 0);
    if (l.img) { const qi = M.fondo(l.img, { nombre: l.imgNombre || l.img, desc: l.imgDesc }); if (l.vida === undefined && qi && !qi.falta && qi.vida && !(vfondo && vfondoSrc)) B.vida.pon(qi.vida); }
    if (l.mus !== undefined) { if (l.mus === false) B.musicaCorta(); else B.musica(l.mus); }
    if (l.amb !== undefined) B.ambiente(l.amb);
    if (l.vida !== undefined) B.vida.pon(l.vida);
    B.capas.linea(l, dur, c);
    B.arr(l.sfx).forEach(x => B.espera(x.t != null ? x.t : (x.en || 0) * dur, c).then(ok => ok && B.sfx(x.src, x.vol)));
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
        if (AULA || l.auto) auto = setTimeout(() => fin(true), 1000 * Math.max(l.auto || 0, 1.2 + (hayVoz ? .3 : txt.length * .02)));
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
      box.appendChild(b); capa.appendChild(box); capa.classList.add('on');
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
  M.finInter = function () { M.barra(null); $('cartel').classList.remove('on'); $('inter').innerHTML = ''; $('inter').className = ''; $('escena').classList.remove('con-inter'); };

  /* ══════════ VÍDEO ══════════ con «Cargando… %»; si falta, un marcador que dura lo previsto */
  function video(p, c) {
    const capa = $('video');
    capa.innerHTML = ''; capa.classList.add('on'); caja(false);
    B.capas.limpia(); B.vida.quita();
    if (p.tunel && (!p.video || !B.hayVideo(p.video))) {   // transición propia mientras no llegue el vídeo de Runway
      B.arr(p.sfx).forEach(x => B.espera(x.t || 0, c).then(ok => ok && B.sfx(x.src, x.vol)));
      return B.tunel(capa, Object.assign({ dur: RAPIDO ? .5 : (p.dur || 5) }, p.tunel), c).then(ok => { capa.classList.remove('on'); capa.innerHTML = ''; return ok; });
    }
    if (!B.hayVideo(p.video)) {
      capa.innerHTML = '<div class="vmarca"><b>' + B.esc(p.nombre || 'Vídeo') + '</b><small>' + B.esc(p.video) + '</small><span>' + B.esc(p.desc || '') + '</span><i></i></div>';
      const barra = B.$('.vmarca i', capa), dur = RAPIDO ? .5 : (p.dur || 5), t0 = B.ahora();
      const iv = setInterval(() => { barra.style.width = Math.min(100, (B.ahora() - t0) / dur * 100) + '%'; }, 100);
      B.arr(p.sfx).forEach(x => B.espera(x.t || 0, c).then(ok => ok && B.sfx(x.src, x.vol)));
      return B.espera(dur, c).then(ok => { clearInterval(iv); capa.classList.remove('on'); capa.innerHTML = ''; return ok; });
    }
    const carga = B.el('div', 'vcarga', 'Cargando… 0 %'); capa.appendChild(carga);
    return B.precargaVideo(p.video, f => { carga.textContent = 'Cargando… ' + Math.round(f * 100) + ' %'; }).then(url => {
      if (c && c.muerto) return false;
      carga.remove();
      if (!url) { capa.classList.remove('on'); return true; }
      const v = B.el('video'); v.playsInline = true; v.src = url; v.volume = p.vol == null ? 1 : p.vol; capa.appendChild(v);
      return new Promise(res => {
        const fin = ok => { v.onended = null; try { v.pause(); } catch (e) { } capa.classList.remove('on'); capa.innerHTML = ''; res(ok); };
        v.onended = () => fin(true); v.onerror = () => fin(true);
        if (c) c.alMorir.push(() => fin(false));
        const pr = v.play(); if (pr && pr.catch) pr.catch(() => fin(true));
      });
    });
  }

  /* ══════════ RECORRIDO ══════════ */
  function lineas(ls, c) {
    let i = 0;
    const sig = () => { if (c.muerto) return Promise.resolve(false); if (i >= ls.length) return Promise.resolve(true); const l = ls[i++]; return M.di(l, c).then(ok => ok ? sig() : false); };
    return sig();
  }
  function plano(p, c) {
    M.plano = p.id; document.body.setAttribute('data-plano', p.id);
    const vidOk = p.video && B.hayVideo(p.video);
    if (vidOk || p.tunel || (p.video && !p.img)) {   // plano de vídeo (o túnel); si falta el vídeo y hay img, se monta como lámina fija: el sonido va dentro del vídeo (la música del plano anterior se apaga si mus:false)
      if (p.mus === false) B.musica(null); else if (p.mus) B.musica(p.mus);
      if (p.amb !== undefined) B.ambiente(p.amb);
      $('marcaSub').textContent = (S.escenas[escIdx] || {}).titulo || '';
      return video(p, c);
    }
    montaPlano(p);
    const ls = B.arr(p.lineas);
    let paso = ls.length ? (p.antes ? (caja(false), B.espera(RAPIDO ? .1 : p.antes, c).then(ok => ok ? (caja(true), lineas(ls, c)) : false)) : (caja(true), lineas(ls, c)))
      : (caja(false), B.espera(RAPIDO ? .3 : (p.auto || 0), c));
    if (p.inter) paso = paso.then(ok => {
      if (!ok) return false;
      const f = B.inter[p.inter.tipo];
      if (!f) { console.warn('Interactivo desconocido', p.inter.tipo); return true; }
      caja(false); $('escena').classList.add('con-inter'); B.capas.quitaClaves();
      if (p.ambInter !== undefined) B.ambiente(p.ambInter);   // el ambiente baja mientras suenan los instrumentos del interactivo
      return Promise.resolve(f(p.inter, c)).then(ok2 => { M.finInter(); return ok2; });
    });
    if (p.despues) paso = paso.then(ok => ok ? (caja(true), lineas(p.despues, c)) : false);
    return paso;
  }
  function escena(i) {
    if (ctl) ctl.matar();
    ctl = B.control(); const c = ctl;
    escIdx = i;
    const e = S.escenas[i]; if (!e) return fin();
    B.progreso.escena(i, e.id);
    pintaPuntos();
    let k = 0;
    const sig = () => { if (c.muerto) return; if (k >= e.planos.length) return escena(i + 1); const p = e.planos[k++]; plano(p, c).then(ok => { if (ok) sig(); }); };
    sig();
  }
  M.escena = escena;
  M.actual = () => escIdx;
  function pintaPuntos() {
    const d = $('puntos'); if (!d) return; d.innerHTML = '';
    S.escenas.forEach((e, i) => { const s = B.el('i', i < escIdx ? 'ya' : (i === escIdx ? 'act' : '')); s.title = e.titulo; d.appendChild(s); });
  }
  function fin() {
    caja(false); B.capas.limpia(); B.vida.quita(); B.progreso.fin();
    const capa = $('cartel'); capa.innerHTML = '';
    const box = B.el('div', 'cart fin');
    box.innerHTML = '<p class="sup">' + B.esc(S.titulo) + '</p><h2>' + B.esc(S.subtitulo || '') + '</h2>';
    const b = B.el('button', 'prim', 'Cerrar sesión'); b.type = 'button';
    b.addEventListener('click', () => { location.href = (window.MOD_VOLVER || '../prueba.html') + location.hash; });
    const r = B.el('button', '', '↺ Repetir'); r.type = 'button'; r.addEventListener('click', () => { capa.classList.remove('on'); escena(0); });
    const f = B.el('div', 'fila'); f.appendChild(r); f.appendChild(b); box.appendChild(f);
    capa.appendChild(box); capa.classList.add('on');
    M.terminado = true;
  }

  /* ── recursos de la sesión (para la precarga) ── */
  function recursos() {
    const r = [];
    const A = a => B.todas(a && a.src !== undefined ? a.src : a).forEach(x => r.push(x));
    const L = l => { if (!l) return; r.push(l.voz === false ? null : (l.voz || ('voz/t1/' + l.id + '.mp3'))); if (l.img) A(l.img); B.arr(l.sfx).forEach(x => r.push(x.src)); if (l.mus) A(l.mus); B.arr(l.amb).forEach(A); };
    S.escenas.forEach(e => e.planos.forEach(p => {
      if (p.img) A(p.img); B.arr(p.amb).forEach(A); if (p.mus) A(p.mus);
      B.arr(p.sfx).forEach(x => r.push(x.src)); B.arr(p.lineas).concat(B.arr(p.despues)).forEach(L);
      if (p.inter) { B.arr(p.inter.recursos).forEach(x => r.push(x)); B.arr(p.inter.preguntas).forEach(q => q.fondo && A(q.fondo)); if (p.inter.fondo) A(p.inter.fondo); }
    }));
    return r.concat(B.capas.recursos(S), B.arr(S.recursos));
  }
  function videos() { const v = []; S.escenas.forEach(e => e.planos.forEach(p => { if (p.video && B.hayVideo(p.video)) v.push(p.video); if (p.fondoVid && B.hayVideo(p.fondoVid)) v.push(p.fondoVid); })); return v; }

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
    let cargado = false, pulsado = false;
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
    ini.addEventListener('click', pulsa);
    document.addEventListener('keydown', function k(ev) { if (ini.classList.contains('fuera')) return document.removeEventListener('keydown', k); if (ev.key === 'Enter' || ev.key === ' ') pulsa(); });
    /* Continuar: botón, clic en la caja, Intro o espacio */
    $('bCont').addEventListener('click', ev => { ev.stopPropagation(); if (esperaSigue) esperaSigue(); });
    $('dialogo').addEventListener('click', () => { if (esperaSigue) esperaSigue(); });
    /* teclas de interfaz (Splice) en los botones de los interactivos */
    $('escena').addEventListener('click', ev => { const b = ev.target.closest && ev.target.closest('button'); if (b && !b.disabled && b.id !== 'bCont' && b.id !== 'bInterSig' && B.viento) B.viento.ui('clic'); }, true);
    document.addEventListener('keydown', ev => {
      if ((ev.key === 'Enter' || ev.key === ' ') && esperaSigue && $('dialogo').classList.contains('on') && !/INPUT|TEXTAREA|BUTTON|SELECT/.test((document.activeElement || {}).tagName || '')) { ev.preventDefault(); esperaSigue(); }
    });
  });
  function arranca() {
    const ini = $('inicio');
    B.arrancado = true;
    try { B.ac().resume(); } catch (e) { }
    ini.classList.add('sale');
    setTimeout(() => { ini.classList.add('fuera'); }, 1200);
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
