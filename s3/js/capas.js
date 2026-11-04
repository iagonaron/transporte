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
  /* (T2) cada personaje con su carpeta: Noa, Amaro y la madre reutilizan las poses de T1 (PJ[q].dir = '../s1/img/t1/pj/') */
  /* (T3) PJ[q].rutas = { pose: 'ruta' } para poses nuevas fuera de la carpeta común (p. ej. noa_arrepentida.png de T3) */
  const RUTA = (q, pose) => (B.PJ && B.PJ[q] && B.PJ[q].rutas && B.PJ[q].rutas[pose]) ||
    ((B.PJ && B.PJ[q] && B.PJ[q].dir) || 'img/t2/pj/') + String(q).toLowerCase() + '_' + pose + '.webp';
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
  const quitaVisual = () => { B.$$('.tr-pj', capa).forEach(e => e.remove()); pjEl = null; pjAct = null; capa.classList.remove('pj-izq', 'pj-der'); };
  function ponPj(o) {
    asegura();
    if (o) {
      const q0 = o.q || (pjAct && pjAct.q) || (pjPedido && pjPedido.q);
      const n = Object.assign({}, pjPedido && pjPedido.q === q0 ? pjPedido : {}); Object.keys(o).forEach(k => { if (o[k] !== undefined) n[k] = o[k]; }); n.q = q0;
      pjPedido = q0 ? n : null; o = pjPedido ? Object.assign({}, pjPedido) : null;
    } else pjPedido = null;
    if (o && C.oculta.indexOf(o.q) >= 0) { quitaVisual(); return; }
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
      const w = B.el('div', 'tr-pj ' + lado + (marco ? ' marco-' + marco : '') + (mira && mira !== 'frente' && mira !== quiere ? ' espejo' : ''));   // marco 'llamada': la cara en la pantalla de la pulsera w.style.setProperty('--alto', alto); w.dataset.pose = q + '_' + pose;
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
  C.aplicaOculta = function () {
    asegura();
    if (pjAct && C.oculta.indexOf(pjAct.q) >= 0) { quitaVisual(); return; }
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
    /* (T3, Iago 4-nov) notificación con botones (Responder · Posponer): C.pospone() hace que el dedo de Noa la aparte */
    if (o.botones) avisoEl.insertAdjacentHTML('beforeend', '<div class="av-bot"><em class="av-resp">Responder</em><em class="av-posp"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 9v4.5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M5 4l3-2M19 4l-3-2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Posponer</em></div><u class="av-dedo"></u><strong class="av-pospuesto">Pospuesto · 1 h</strong>');
    capa.appendChild(avisoEl);
  };
  /* el dedo pulsa «Posponer» (clic suave), la notificación se pliega hacia un lado con «Pospuesto · 1 h» y desaparece (~2,5 s en total) */
  /* (Iago 4-nov) o = { duda (s quieta, con un leve pulso de luz), voz (Noa en voz baja antes de pulsar: «Mamá… ahora no.»), vozEn } */
  C.pospone = function (c, o) {
    o = o || {};
    const a = avisoEl; if (!a || !a.querySelector('.av-posp')) return;
    if (o.duda) a.classList.add('duda');
    if (o.voz) B.espera(o.vozEn || 0, c).then(ok => { if (!ok || !a.isConnected || !B.buf[o.voz]) return; B.agacha(true); const h = B.suena(o.voz, { bus: B.bus.voz, grupo: 'voz' }); B.espera(B.buf[o.voz].duration, c).then(() => B.agacha(false)); });
    B.espera(o.duda || 0, c).then(ok => { if (!ok || !a.isConnected) return; a.classList.remove('duda'); pulsa(); });
    function pulsa() {
    a.classList.add('dedo');
    B.espera(.4, c).then(ok => { if (!ok || !a.isConnected) return; a.classList.add('pulsa'); B.sfx('../s1/sfx/sfx_ui_clic.mp3', .9); return B.espera(.45, c); })
      .then(ok => { if (!ok || !a.isConnected) return; a.classList.add('pospuesta'); return B.espera(1.05, c); })
      .then(ok => { if (!ok || !a.isConnected) return; a.classList.add('sale'); return B.espera(.6, c); })
      .then(ok => { if (ok && a.isConnected && a === avisoEl) C.aviso(null); });
    }
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
  C.limpia = function () { quitaClaves(); C.aviso(null); ponPj(null); };
})(window.TR);
