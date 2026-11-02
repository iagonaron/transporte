/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE · CAPAS sobre las láminas (adaptado de 4 Sabores, sabores/js/capas4s.js)
   · Personaje de medio cuerpo (WebP con alfa): img/t1/pj/<pj>_<pose>.webp. Cambio de pose INSTANTÁNEO
     (pantalla del aula lenta): la pose nueva entra cuando ya está descodificada; mientras, se queda la de antes.
     Si falta el fichero, se ve un MARCADOR (silueta oscura con el nombre del fichero) en el mismo sitio.
   · Palabras clave en el centro (sin subtítulos).
   · Aviso de la pulsera de Noa (quién llama y el mensaje).
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const C = B.capas = {};
  let capa = null, pjEl = null, pjAct = null, clavesEl = null, avisoEl = null;
  const RUTA = (q, pose) => 'img/t1/pj/' + String(q).toLowerCase() + '_' + pose + '.webp';
  const PJ = q => (B.PJ && B.PJ[q]) || null;
  C.ruta = RUTA;
  function asegura() {
    if (capa && capa.isConnected) return capa;
    capa = B.$('#capas');
    return capa;
  }
  const url = r => (B.img && B.img[r]) || r;

  /* ── personaje ── */
  const LISTO = new Map();   // src → <img> ya descodificada
  function decod(src) {
    if (!src || !B.existe(src)) return Promise.resolve(null);
    if (LISTO.has(src)) return Promise.resolve(LISTO.get(src));
    const im = new Image(); im.src = url(src); im.alt = ''; im.draggable = false;
    return (im.decode ? im.decode() : Promise.resolve()).then(() => { LISTO.set(src, im); return im; }, () => null);
  }
  C.decod = decod;
  function marcador(q, pose, src) {
    const d = B.el('div', 'pj-marca');
    const p = PJ(q);
    d.innerHTML = '<b>' + B.esc(p ? p.nombre : q) + '</b><span>' + B.esc(pose) + '</span><small>' + B.esc(src) + '</small>';
    if (p && p.color) d.style.setProperty('--c', p.color);
    return d;
  }
  C.oculta = [];   // personajes que ya salen grandes en la lámina sustituta: no se les pone la pose encima
  /* pjPedido: el personaje que pide la frase aunque ahora no se vea (porque la lámina ya lo lleva). Si la frase cambia a
     una lámina sin él (img / imgs de la línea), vuelve a salir con la última pose pedida. */
  let pjPedido = null;
  /* quitaVisual(fd, deja): con fd > 0 la pose se va con un FUNDIDO de fd s (la misma duración que el fondo que cambia); sin fd, de golpe.
     deja: no tocar las poses que ya se están yendo con fundido (clase 'sale') */
  const quitaVisual = (fd, deja) => {
    B.$$('.tr-pj', capa).forEach(e => {
      if (e.classList.contains('sale')) { if (!deja) e.remove(); return; }
      if (fd > 0) { e.classList.add('sale'); e.style.transition = 'opacity ' + fd + 's ease'; e.getBoundingClientRect(); e.style.opacity = '0'; setTimeout(() => e.remove(), fd * 1000 + 80); }
      else e.remove();
    });
    pjEl = null; pjAct = null; capa.classList.remove('pj-izq', 'pj-der');
  };
  function ponPj(o) {
    asegura();
    if (o) {
      const q0 = o.q || (pjAct && pjAct.q) || (pjPedido && pjPedido.q);
      const n = Object.assign({}, pjPedido && pjPedido.q === q0 ? pjPedido : {}); Object.keys(o).forEach(k => { if (o[k] !== undefined) n[k] = o[k]; }); n.q = q0;
      pjPedido = q0 ? n : null; o = pjPedido ? Object.assign({}, pjPedido) : null;
    } else pjPedido = null;
    if (o && C.oculta.indexOf(o.q) >= 0) { quitaVisual(0, true); return; }
    if (!o) { quitaVisual(); return; }
    const q = o.q || (pjAct && pjAct.q); if (!q) return;
    const p = PJ(q) || {};
    const pose = o.pose || (pjAct && pjAct.q === q && pjAct.pose) || p._ || 'explica';
    const lado = o.lado || (pjAct && pjAct.q === q && pjAct.lado) || p.lado || 'der';
    const alto = o.alto || p.alto || .8, marco = o.marco || p.marco || '';
    if (pjEl && pjAct && pjAct.q === q && pjAct.lado === lado && pjAct.pose === pose) return;
    const src = RUTA(q, pose);
    pjAct = { q: q, pose: pose, lado: lado, alto: alto };
    const pon = (nodo) => {
      if (!pjAct || pjAct.q !== q || pjAct.pose !== pose) return;   // ya se pidió otra pose
      /* cada personaje mira hacia el centro (hacia quien le habla): si la pose mira hacia fuera, se voltea */
      const mira = (p.mira || {})[pose], quiere = lado === 'izq' ? 'der' : 'izq';
      const w = B.el('div', 'tr-pj ' + lado + (marco ? ' marco-' + marco : '') + (!marco && mira && mira !== 'frente' && mira !== quiere ? ' espejo' : ''));   // marco 'llamada': la cara en la pantalla de la pulsera w.style.setProperty('--alto', alto); w.dataset.pose = q + '_' + pose;
      w.appendChild(nodo);
      capa.appendChild(w);
      B.$$('.tr-pj', capa).forEach(e => { if (e !== w) e.remove(); });
      pjEl = w;
      capa.classList.toggle('pj-izq', lado === 'izq'); capa.classList.toggle('pj-der', lado === 'der');
    };
    if (!B.existe(src)) { pon(marcador(q, pose, src)); return; }
    decod(src).then(im => pon(im ? im.cloneNode() : marcador(q, pose, src)));
  }
  C.pj = ponPj;
  /* tras cambiar de lámina: esconde al personaje si la lámina ya lo lleva, o lo devuelve si no */
  C.aplicaOculta = function (fd) {
    asegura();
    if (pjAct && C.oculta.indexOf(pjAct.q) >= 0) { quitaVisual(fd); return; }   // fd: si el fondo cambia con fundido, la pose se funde con él
    if (!pjAct && pjPedido && C.oculta.indexOf(pjPedido.q) < 0) ponPj(Object.assign({}, pjPedido));
  };
  C.pjActual = () => pjAct;

  /* ── palabras clave ── */
  function ponClaves(it, c, dur) {
    asegura();
    quitaClaves(true);
    /* (Iago, 2-nov) cada palabra clave dura ~2,5 s y se va con un fundido, para no tapar lo que pasa en la lámina;
       pos: 'arriba' | 'izq' | 'der' (por defecto, centro alto) para no tapar caras ni pantallas */
    const box = B.el('div', 'tr-claves ' + (it.estilo || 'fila') + (it.pos ? ' pos-' + it.pos : '')); capa.appendChild(box); clavesEl = box;
    const dura = it.dura || 2.5;
    B.arr(it.claves).forEach((x, i) => {
      const ch = B.el('span', 'tr-clave'); ch.textContent = x; box.appendChild(ch);
      const t = it.ens && dur ? it.ens[i] * dur : it.ts ? it.ts[i] : (it.t || 0) + i * (it.paso || .7);   // ens: fracciones de la frase (si aún no hay voz)
      B.espera(t, c).then(ok => { if (ok && box.isConnected) ch.classList.add('on'); });
      B.espera(t + dura, c).then(ok => { if (ok && box.isConnected) ch.classList.remove('on'); });
    });
  }
  function quitaClaves() { if (clavesEl) { clavesEl.remove(); clavesEl = null; } }
  C.claves = ponClaves; C.quitaClaves = quitaClaves;

  /* ── aviso de la pulsera ── */
  C.aviso = function (o) {
    asegura();
    if (avisoEl) { avisoEl.remove(); avisoEl = null; }
    if (!o) return;
    avisoEl = B.el('div', 'tr-aviso' + (o.tipo ? ' ' + o.tipo : ''));
    avisoEl.innerHTML = '<i></i><b>' + B.esc(o.de || '') + '</b>' + (o.txt ? '<span>' + B.esc(o.txt) + '</span>' : '');
    capa.appendChild(avisoEl);
  };

  /* ── lo llama el motor ── */
  C.plano = function (p) {
    asegura(); quitaClaves(); C.aviso(null);
    if (p.pj === null || p.sinPj) ponPj(null);
    else if (p.pj) ponPj(p.pj);
    capa.classList.toggle('oscuro', !!p.oscuro);
    if (p.aviso) C.aviso(p.aviso);
  };
  /* reacciones de la frase: poses [{t | en, pose, q, lado}] (t en segundos desde que empieza la frase; en = fracción 0–1) */
  C.linea = function (l, dur, c) {
    if (l.pj !== undefined) ponPj(l.pj);
    if (!l.claves && !l.mantenClaves) quitaClaves();
    if (l.aviso !== undefined) C.aviso(l.aviso);
    B.arr(l.poses).forEach(it => {
      const t = it.t != null ? it.t : (it.en || 0) * dur;
      const o = { q: it.q, pose: it.pose, lado: it.lado };
      const q = o.q || (pjAct && pjAct.q);
      if (q && t > .4) B.espera(t - .4, c).then(ok => ok && decod(RUTA(q, o.pose)));   // descodificada 0,4 s antes: entra a su tiempo
      B.espera(t, c).then(ok => ok && ponPj(o));
    });
    if (l.claves) ponClaves(l.claves, c, dur);
  };
  C.recursos = function (sesion) {
    const r = [];
    Object.keys(B.PJ || {}).forEach(q => B.arr(B.PJ[q].poses).forEach(p => r.push(RUTA(q, p))));
    return r;
  };
  C.limpia = function (fd) { quitaClaves(); C.aviso(null); if (fd > 0) { pjPedido = null; quitaVisual(fd); } else ponPj(null); };   // fd: la pose sale con fundido
})(window.TR);
