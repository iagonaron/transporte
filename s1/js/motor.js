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
    if (clave === fondoAct && !o.forzar) {
      if (o.ensueno) B.$$('#fondo .lam').forEach(e => { if (e._clave === clave && !e._de) ensuena(e, o.ensueno.modo, o.ensueno.dur); });   // misma lámina: se anima la que ya se ve
      if (!pendiente) trasPintar(o.funde); return fondoOpc; }
    /* fundido cruzado lento (Iago, 2-nov) cuando la lámina es la misma imagen con otro encuadre o con halos (o si el plano lo pide) */
    const fd = o.funde != null ? o.funde : (q && fondoOpc && !q.falta && !fondoOpc.falta && (q.src === fondoOpc.src || q.funde) ? (q.funde || 1.2) : 0);   // q.funde: lámina hermana (p. ej. def_absoluto → def_absoluto_si) que entra con fundido
    fondoAct = clave; fondoOpc = q;
    const nuevo = B.el('div', 'lam'); nuevo._clave = clave;
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
    const mi = ++gen; pendiente = true;
    const pinta = () => {
      if (mi !== gen) return;   // ya se pidió otra
      const fdLam = M._congelado ? 0 : fd;   // desde un vídeo congelado, lo que se funde es el vídeo (encima), no la lámina
      if (fdLam) { nuevo.style.opacity = '0'; nuevo.style.transition = 'opacity ' + fdLam + 's ease'; }
      if (vfondo && vfondo.parentNode === f) f.insertBefore(nuevo, vfondo); else f.appendChild(nuevo);
      if (o.ensueno) ensuena(nuevo, o.ensueno.modo, o.ensueno.dur);   // el recuerdo entra desenfocado y cálido y se enfoca
      else if (o.anima && nuevo.animate) nuevo.animate(o.anima.k, o.anima.o);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (mi !== gen) return;
        if (fdLam) { nuevo.style.opacity = '1'; trasPintar(0); setTimeout(() => { if (mi === gen) B.$$('.lam', f).forEach(e => { if (e !== nuevo && e._de !== nuevo) e.remove(); }); }, fdLam * 1000 + 60); return; }
        B.$$('.lam', f).forEach(e => { if (e !== nuevo && e._de !== nuevo) e.remove(); });   // (las capas de la ensoñación de la lámina nueva se quitan solas)
        trasPintar(fd);
      }));
    };
    if (q && !q.falta) decod(B.img[q.src] || q.src).then(pinta); else pinta();
    /* la pose del personaje que la lámina nueva ya lleva se va con el MISMO fundido que el fondo (Iago, 2-nov: Noa no desaparece de golpe) */
    if (B.capas) { B.capas.oculta = (q && !q.falta && q.ocultaPj) || []; B.capas.aplicaOculta(M._congelado ? 0 : fd); }
    return q;
  };
  /* cambio de lámina DENTRO del plano (img / imgs de la línea, imgs del plano): instantáneo, como las poses.
     Si el fichero falta, se queda la lámina anterior (sin marcador). La «vida» pasa a la de la lámina nueva, o se quita. */
  M.cambia = function (src, o) {
    const q = src ? B.primero(src) : null;
    if (!q || q.falta) return null;
    const ant = fondoAct, r = M.fondo(src, o || {});
    if (fondoAct !== ant) { if (vfondo) fondoVideo(null); B.vida.pon((r && r.vida) || []); }   // fondoVideo(null) espera a que la lámina esté pintada   // el vídeo de fondo (si lo había) deja paso a la lámina nueva
    return r;
  };
  function programaImgs(lista, dur, c) {
    B.arr(lista).forEach(x => { const t = x.t != null ? x.t : (x.en || 0) * dur; B.espera(Math.max(0, t), c).then(ok => ok && M.cambia(x.img)); });
  }
  /* vídeo de fondo en bucle, mudo (p. ej. el dron sobre Coruña): si no está, se queda la lámina */
  let vfondo = null;
  let vfondoSrc = null;
  let esperaVF = null;   // se resuelve cuando el vídeo de fondo nuevo ya se está viendo (el túnel congelado no se retira antes)
  function fondoVideo(src) {
    if (src && src === vfondoSrc && vfondo) return;
    esperaVF = null;
    vfondoSrc = src && B.hayVideo(src) ? src : null;
    if (vfondo) { const v = vfondo; vfondo = null; const quita = () => { try { v.pause(); } catch (e) { } v.remove(); }; if (pendiente) alPintar.push(quita); else quita(); }
    if (!src || !B.hayVideo(src)) return;
    let sueltaVF = null; esperaVF = new Promise(r => { sueltaVF = r; setTimeout(r, 1800); });
    B.precargaVideo(src).then(url => {
      if (!url || vfondoSrc !== src) { sueltaVF(); return; }
      const v = vfondo = B.el('video', 'vfondo'); v.muted = true; v.loop = true; v.playsInline = true; v.style.opacity = '0'; v.src = url;
      v.addEventListener('playing', () => { v.style.opacity = ''; sueltaVF(); }, { once: true });   // hasta que pinta su primer fotograma, se ve la lámina
      /* RELEVO: si el túnel del plano anterior (p9a) iba en este mismo vídeo, éste arranca en la misma fase en vez de reiniciarse */
      const F = B.tunelFase;
      if (F && F.v && F.v.isConnected && F.dur && performance.now() - F.ts < 4000) {
        v.preload = 'auto';
        v.addEventListener('loadedmetadata', () => { try { v.currentTime = ((F.v.currentTime || F.t) + .12) % (v.duration || F.dur); } catch (e) { } const pp = v.play(); if (pp && pp.catch) pp.catch(() => { }); }, { once: true });
        $('fondo').appendChild(v); B.tunelFase = null;
      } else { $('fondo').appendChild(v); const p = v.play(); if (p && p.catch) p.catch(() => { }); }
      B.vida.quita();   // la «vida» se pensó para la lámina: con el vídeo del dron sobra
    });
  }

  /* ENSOÑACIÓN (Iago 3-nov): p.ensueno = 'entra' → la lámina que se ve ondula, se desenfoca, brilla y se entibia a la vez que suena el arpa
     (dura lo que el plano; se queda así); 'sale' → la lámina nueva (el recuerdo) entra con ese mismo estado y se enfoca mientras funde,
     encima de la anterior, que sigue desenfocada: sin cortes. Web Animations (Chrome 94); mismas listas de filtros en todos los pasos. */
  const ENS = [[0, 0, 1, 1, 0, 1, 0], [.22, 1.6, 1.05, 1.06, .1, 1.012, .5], [.48, 4.2, 1.12, 1.02, .2, 1.026, -.6], [.74, 7, 1.2, .94, .3, 1.04, .7], [1, 10, 1.28, .88, .36, 1.05, -.35]];
  const ensPaso = x => ({ offset: x[0], filter: 'blur(' + x[1] + 'px) brightness(' + x[2] + ') saturate(' + x[3] + ') sepia(' + x[4] + ')', transform: 'scale(' + x[5] + ') skewX(' + x[6] + 'deg)' });
  const ENS_ENTRA = ENS.map(ensPaso), ENS_SALE = [[0, 10, 1.28, .88, .36, 1.05, -.35], [.45, 3.6, 1.1, .97, .18, 1.022, .4], [1, 0, 1, 1, 0, 1, 0]].map(ensPaso);
  /* ENSOÑACIÓN BARATA (Iago 3-nov: en el ordenador del aula iba a tirones, «como si cargara»). Animar filter:blur() a 1920×1080
     obliga a re-desenfocar la lámina entera en cada fotograma (y en la salida, dos láminas a la vez); en un equipo sin GPU fuerte
     lo hace la CPU. Ahora el desenfoque y el tinte se PRE-RENDERIZAN al cargar (lienzo 960×540 con ctx.filter → JPEG en memoria,
     descodificado y retenido; dos niveles: medio y pleno) y durante la ensoñación solo hay FUNDIDOS DE OPACIDAD entre capas hermanas
     (una capa cada una: sin superficies intermedias) y una ONDULACIÓN ligera con transform (escala y deriva, sin sesgo) sobre #fondo.
     La «vida» (partículas con fusión «screen», cara de componer) se retira mientras dura el sueño y vuelve al enfocar el recuerdo.
     Las listas con filtros de arriba quedan de reserva si el navegador no tiene ctx.filter. */
  /* medio a 1920×1080 (va quieto: el compositor lo copia 1:1) · pleno a 960×540 (es el que ondula; con 10 px de desenfoque no se nota) */
  const ENS_NIV = [{ w: 1920, blur: 4.2, f: 'brightness(1.12) saturate(1.02) sepia(.2)' }, { w: 960, blur: 10, f: 'brightness(1.28) saturate(.88) sepia(.36)' }];
  const ONDA = [[0, 1, 0, 0], [.22, 1.012, .25, -.12], [.48, 1.026, -.3, .1], [.74, 1.04, .35, -.08], [1, 1.05, -.15, .05]];   // [offset, escala, dx %, dy %]
  const ondaPaso = x => ({ offset: x[0], transform: 'translate(' + x[2] + '%,' + x[3] + '%) scale(' + x[1] + ')' });
  const ONDA_ENTRA = ONDA.map(ondaPaso), ONDA_SALE = [[0, 1.05, -.15, .05], [.45, 1.022, .2, -.06], [1, 1, 0, 0]].map(ondaPaso);
  const ENSL = new Map();   // clave de la lámina (JSON del encuadre) → [url medio, url pleno]
  let ondaAnim = null;
  const hayFiltroCanvas = (function () { try { const c = document.createElement('canvas').getContext('2d'); return !!c && 'filter' in c; } catch (e) { return false; } })();
  /* región de la imagen fuente que se ve en el escenario 1920×1080 (mismo cálculo que background-size/-position de M.fondo) */
  function encuadre(q, iw, ih) {
    const SW = 1920, SH = 1080; let dw, dh, ox, oy;
    if (q.zoom && q.zoom > 1) {
      const z = q.zoom, cx = q.cx == null ? .5 : q.cx, cy = q.cy == null ? .5 : q.cy;
      const px = B.clamp((cx * z - .5) / (z - 1), 0, 1), py = B.clamp((cy * z - .5) / (z - 1), 0, 1);
      dw = SW * z; dh = dw * ih / iw; ox = px * (SW - dw); oy = py * (SH - dh);
    } else { const k = Math.max(SW / iw, SH / ih); dw = iw * k; dh = ih * k; ox = (SW - dw) / 2; oy = (SH - dh) / 2; }
    return { sx: -ox / dw * iw, sy: -oy / dh * ih, sw: SW / dw * iw, sh: SH / dh * ih };
  }
  function lienzoEns(im, r, niv) {
    const W = niv.w, H = Math.round(niv.w * 9 / 16), b = niv.blur * W / 1920, m = Math.ceil(b * 3), esc = W / r.sw, ms = m / esc;
    const iw = im.naturalWidth, ih = im.naturalHeight;
    const t = document.createElement('canvas'); t.width = W + 2 * m; t.height = H + 2 * m; const tx = t.getContext('2d');
    /* margen para que el desenfoque no oscurezca los bordes: primero la región ampliada recortada a la imagen (estirada), encima la exacta */
    const x0 = Math.max(0, r.sx - ms), y0 = Math.max(0, r.sy - ms), x1 = Math.min(iw, r.sx + r.sw + ms), y1 = Math.min(ih, r.sy + r.sh + ms);
    tx.drawImage(im, x0, y0, x1 - x0, y1 - y0, 0, 0, t.width, t.height);
    tx.drawImage(im, r.sx - ms, r.sy - ms, r.sw + 2 * ms, r.sh + 2 * ms, 0, 0, t.width, t.height);
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const cx = c.getContext('2d', { alpha: false }); cx.filter = 'blur(' + b + 'px) ' + niv.f; cx.drawImage(t, -m, -m); cx.filter = 'none';
    return new Promise(res => c.toBlob(bl => {
      if (!bl) return res(null);
      const u = URL.createObjectURL(bl), i2 = new Image(); i2.src = u; B.vivas.push(i2);   // descodificada y retenida
      const ok = () => res(u); (i2.decode ? i2.decode() : Promise.resolve()).then(ok, ok);
    }, 'image/jpeg', .9));
  }
  function prepEns(q) {
    if (!hayFiltroCanvas || !q || q.falta || q.ajuste === 'contain') return Promise.resolve();
    const clave = JSON.stringify(q); if (ENSL.has(clave)) return Promise.resolve();
    ENSL.set(clave, null);
    return decod(B.img[q.src] || q.src).then(im => {
      if (!im || !im.naturalWidth) return;
      const r = encuadre(q, im.naturalWidth, im.naturalHeight);
      return Promise.all(ENS_NIV.map(n => lienzoEns(im, r, n))).then(us => { if (us[0] && us[1]) ENSL.set(clave, us); });
    }).catch(e => console.warn('ensoñación', e));
  }
  function capaEns(url, de) { const e = B.el('div', 'lam ens'); e.style.backgroundImage = 'url("' + url + '")'; e.style.opacity = '0'; e._de = de; return e; }
  const vidaSueno = on => { $('escena').classList.toggle('sueno', !!on); if (B.vida.duerme) B.vida.duerme(!!on); };   // la «vida» se retira (y no se dibuja) durante el sueño
  function paraOnda() { if (ondaAnim) { try { ondaAnim.cancel(); } catch (e) { } ondaAnim = null; } }
  const ensReserva = [];
  const quitaEns = de => { B.$$('#fondo .lam.ens').forEach(e => { if (!de || e._de === de) e.parentNode.removeChild(e); });   // capas de la ensoñación (de una lámina o todas)
    if (!de) { ensReserva.splice(0).forEach(a => { try { a.cancel(); } catch (e) { } }); B.$$('#fondo .lam').forEach(e => { e.style.visibility = ''; }); } };
  /* lam: la lámina; modo 'entra' (se queda desenfocada) | 'sale' (el recuerdo llega desenfocado y se enfoca) */
  function ensuena(lam, modo, dur) {
    const us = ENSL.get(lam._clave), entra = modo === 'entra', f = $('fondo');
    if (!us || !lam.animate) { if (lam.animate) ensReserva.push(lam.animate(entra ? ENS_ENTRA : ENS_SALE, { duration: dur, easing: entra ? 'linear' : 'ease-out', fill: entra ? 'forwards' : 'none' })); return; }   // de reserva: filtros animados
    quitaEns(lam);   // (si se repite el plano, no se apilan)
    const a = capaEns(us[0], lam), b = capaEns(us[1], lam), sig = lam.nextSibling;
    f.insertBefore(a, sig); f.insertBefore(b, sig);   // encima de su lámina (y debajo del vídeo de fondo, si lo hubiera)
    /* la ondulación va solo en la capa más desenfocada (la que más se ve en el sueño): las de debajo quedan quietas y el compositor
       no re-muestrea todo el escenario en cada fotograma; lo que queda tapado del todo se oculta (visibility) para no pintarlo */
    paraOnda();
    b.animate(entra ? ONDA_ENTRA : ONDA_SALE, { duration: dur, easing: entra ? 'linear' : 'ease-out', fill: entra ? 'forwards' : 'none' });
    if (entra) {
      vidaSueno(true);
      const fa = a.animate([{ opacity: 0 }, { opacity: 1, offset: .55 }, { opacity: 1 }], { duration: dur, easing: 'ease-in-out', fill: 'forwards' });
      b.animate([{ opacity: 0 }, { opacity: 0, offset: .3 }, { opacity: 1 }], { duration: dur, easing: 'ease-in', fill: 'forwards' });
      B.espera(dur * .56 / 1000, ctl).then(ok => { if (ok && a.isConnected) lam.style.visibility = 'hidden'; });   // la nítida, ya tapada por el medio
      fa.onfinish = () => { if (b.isConnected) a.style.visibility = 'hidden'; };   // el medio, ya tapado por el pleno
      return;
    }
    /* sale: el recuerdo desenfocado (pleno) funde sobre la lámina anterior, también desenfocada; cuando ya la tapa, debajo aparecen su
       nivel medio y la lámina nítida, se retira lo anterior y se va enfocando: pleno → medio → nítida */
    const k = Math.min(.4, 1100 / dur);
    lam.style.transition = ''; lam.style.opacity = ''; lam.style.visibility = 'hidden'; a.style.visibility = 'hidden';
    a.style.opacity = '1';
    a.animate([{ opacity: 1 }, { opacity: 1, offset: .6 }, { opacity: 0 }], { duration: dur, easing: 'ease-out', fill: 'forwards' });
    b.animate([{ opacity: 0 }, { opacity: 1, offset: k }, { opacity: 0, offset: .6 }, { opacity: 0 }], { duration: dur, easing: 'ease-in-out', fill: 'forwards' });
    B.espera(dur * k / 1000 + .02, ctl).then(() => {
      if (!a.isConnected) return;
      lam.style.visibility = ''; a.style.visibility = '';
      B.$$('#fondo .lam').forEach(e => { if (e !== lam && e._de !== lam) e.parentNode.removeChild(e); });   // lo anterior, ya tapado
    });
    B.espera(dur / 1000 + .05, ctl).then(() => { if (a.parentNode) a.parentNode.removeChild(a); if (b.parentNode) b.parentNode.removeChild(b); vidaSueno(false); });   // enfocada: fuera las capas y vuelve la «vida»
  }
  /* PRECALENTAR (un plano antes): las capas del sueño y la lámina del recuerdo se ponen un instante casi transparentes encima de todo,
     para que el compositor las rasterice y suba ANTES (la primera vez era lo que más tironeaba); luego se quitan */
  function precalienta(p) {
    const f = $('fondo'), q = B.primero(p.img); if (!q || q.falta) return;
    const us = ENSL.get(JSON.stringify(q)), ps = [];
    if (us) us.forEach(u => ps.push(capaEns(u, 'pre')));
    if (p.ensueno === 'sale') { const e = B.el('div', 'lam'); e._de = 'pre'; const u = 'url("' + (B.img[q.src] || q.src) + '")'; e.style.backgroundImage = u;
      if (q.zoom && q.zoom > 1) { const z = q.zoom, cx = q.cx == null ? .5 : q.cx, cy = q.cy == null ? .5 : q.cy, px = B.clamp((cx * z - .5) / (z - 1), 0, 1), py = B.clamp((cy * z - .5) / (z - 1), 0, 1);
        e.style.backgroundSize = (z * 100) + '% auto'; e.style.backgroundPosition = (px * 100).toFixed(2) + '% ' + (py * 100).toFixed(2) + '%'; }
      ps.push(e); }
    ps.forEach(e => { e.style.opacity = '.004'; f.appendChild(e); });
    setTimeout(() => ps.forEach(e => { if (e.parentNode) e.parentNode.removeChild(e); }), 700);
  }
  /* todo lo de la ensoñación, listo antes de empezar (la pantalla de carga lo espera) */
  M.prepEnsuenos = function () {
    const ps = []; S.escenas.forEach(e => e.planos.forEach((p, k) => {
      if (!p.ensueno) return;
      ps.push(prepEns(B.primero(p.img)));
      if (p.ensueno === 'entra' && k > 0) ps.push(prepEns(B.primero(e.planos[k - 1].img)));   // por si la lámina que se ve es la del plano anterior
    }));
    return Promise.all(ps);
  };
  /* ── montar un plano ── */
  function montaPlano(p) {
    $('escena').classList.toggle('con-inter', false);
    const ensDur = (RAPIDO ? .3 : (p.ensuenoDur || p.auto || 3.5)) * 1000;
    const q = M.fondo(p.negro ? null : p.img, { nombre: p.nombre, desc: p.desc, funde: p.funde, ensueno: p.ensueno ? { modo: p.ensueno, dur: ensDur } : null });
    fondoVideo(p.fondoVid);
    if (p.amb !== undefined) B.ambiente(p.amb);
    if (p.mus === false) B.musica(null); else if (p.mus) B.musica(p.mus);
    if (vfondo && vfondoSrc) B.vida.quita(); else B.vida.pon((q && !q.falta && q.vida) || p.vida || []);
    B.capas.plano(p);
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
    const vozSrc = l.voz === false ? null : (l.voz || ('voz/t1/' + l.id + '.mp3'));
    const hayVoz = !!(vozSrc && B.buf[vozSrc]);
    const txt = l.texto || '';
    const durTxt = Math.max(1.6, txt.length * .062);
    /* (Iago 22:28) «Continuar» se enciende ~1 s antes de que acabe la voz; si se pulsa entonces, la voz anterior
       acaba sola (no se corta) y la siguiente arranca justo cuando termina (retraso ≤ 1 s, el texto e imagen ya cambian) */
    const retraso = (hayVoz && !RAPIDO) ? Math.max(0, (M._vozHasta || 0) - B.ahora()) : 0;
    const dur = RAPIDO ? .3 : retraso + (hayVoz ? B.buf[vozSrc].duration : durTxt) + (l.espera || 0);
    const antesFin = (RAPIDO || !hayVoz) ? 0 : Math.min(1, B.buf[vozSrc].duration * .25) + (l.espera || 0);
    if (l.img) M.cambia(l.img);
    programaImgs(l.imgs, dur, c);
    if (l.mus !== undefined) { if (l.mus === false) B.musicaCorta(); else B.musica(l.mus); }
    if (l.amb !== undefined) B.ambiente(l.amb);
    if (l.vida !== undefined) B.vida.pon(l.vida);
    B.capas.linea(l, dur, c);
    B.arr(l.sfx).forEach(x => B.espera(x.t != null ? x.t : (x.en || 0) * dur, c).then(ok => ok && B.sfx(x.src, x.vol)));
    /* sucesos de la frase: {t | en | tras (s después de acabar la voz), fn} */
    B.arr(l.al).forEach(x => B.espera(x.tras != null ? dur - (l.espera || 0) + x.tras : x.t != null ? x.t : (x.en || 0) * dur, c).then(ok => ok && x.fn(c)));
    let h = null;
    const t0 = B.ahora() + retraso;
    if (hayVoz && !RAPIDO) { B.agacha(true); M._vozHasta = t0 + B.buf[vozSrc].duration;
      const fil = l.filtro || (l.estilo === 'interior' ? 'interior' : null);   // (Iago 3-nov) las frases 'interior' suenan como voz de la conciencia
      const arranca = () => { h = B.suena(vozSrc, { bus: fil ? B.filtroVoz(fil, B.buf[vozSrc].duration) : B.bus.voz, grupo: 'voz', vol: l.vol }); };
      if (retraso > .02) B.espera(retraso, c).then(ok => ok && arranca()); else arranca(); }
    return new Promise(res => {
      let n = 0, escrito = false, vozFin = !hayVoz, listo = false, ultBlip = 0, auto = null, hecho = false;
      pintaTexto(txt, 0);
      const vel = RAPIDO ? .001 : hayVoz ? Math.max(.012, ((B.buf[vozSrc].duration - antesFin + (l.espera || 0)) * .9) / Math.max(1, txt.length)) : .032;
      const iv = setInterval(() => {
        if (c && c.muerto) return fin(false);
        if (escrito) return;
        const meta = Math.min(txt.length, Math.max(0, Math.floor((B.ahora() - t0) / vel) + 1));
        if (meta > n) {
          n = meta; pintaTexto(txt, n);
          const ini = txt.slice(0, n).search(/\S+$/), enPal = ini < 0 ? -1 : n - 1 - ini, ms = performance.now();
          if ((!hayVoz || B.CFG.blipConVoz) && enPal >= 0 && enPal % 2 === 0 && ms - ultBlip > 70) { blip(); ultBlip = ms; }
        }
        if (n >= txt.length) { escrito = true; pintaTexto(txt, txt.length); prueba(); }
      }, 30);
      B.espera(Math.max(.3, dur - antesFin), c).then(ok => { if (!ok) return fin(false); vozFin = true; prueba(); });
      if (hayVoz && !RAPIDO) B.espera(dur, c).then(ok => ok && !hecho && B.agacha(false));
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
        if (!ok && h) { h.parar(.1); M._vozHasta = 0; }
        if (hayVoz && !ok) B.agacha(false);
        if (hayVoz && ok) { const q = Math.max(0, (M._vozHasta || 0) - B.ahora()); setTimeout(() => { if (!esperaSigue || M._vozHasta <= B.ahora() + .05) B.agacha(false); }, q * 1000); }
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
  /* al acabar un vídeo o un túnel no se quita la capa: se queda el último fotograma hasta que la lámina siguiente está pintada */
  function congela(capa) {
    M._congelado = true;
    alPintar.push(fd => {
      M._congelado = false;
      const quita = () => { if (M._congelado) return; capa.classList.remove('on'); capa.style.transition = ''; capa.style.opacity = ''; B.$$('video', capa).forEach(v => { try { v.pause(); } catch (e) { } }); capa.innerHTML = ''; };
      const va = () => { if (fd) { capa.style.transition = 'opacity ' + fd + 's ease'; capa.style.opacity = '0'; setTimeout(quita, fd * 1000 + 50); } else quita(); };
      if (esperaVF) esperaVF.then(va); else va();   // si el plano siguiente trae vídeo de fondo, el túnel se retira (con fundido) cuando éste ya se ve: nunca pasa por negro
    });
  }
  /* fundido a blanco (Iago, 2-nov: antes del Paleolítico): sube muy despacio al final del plano y se va al empezar el siguiente */
  function blanco(on, seg) { const b = $('blanco'); if (!b) return; b.style.transition = 'opacity ' + (seg || 1.5) + 's ' + (on ? 'ease-in' : 'ease-out'); b.classList.toggle('on', !!on); M._blanco = !!on; }
  function programaBlanco(p, c, dur) { if (!p.blanco) return; B.espera(Math.max(0, dur - p.blanco), c).then(ok => { if (!ok) return; blanco(true, p.blanco); if (p.sfxBlanco) B.sfx(p.sfxBlanco, .8); }); }
  /* (Iago 3-nov) blanco pleno sostenido al acabar el vídeo: p.blancoPleno = { dur (s), precarga (vídeo del plano siguiente),
     sfx:[{src,t,vol}], mus (con fade: entra despacio), musT, amb (muy bajos), ambT }. Lo de después sigue sin corte en el plano siguiente. */
  function sostieneBlanco(o, c) {
    if (RAPIDO) return B.espera(.3, c);
    if (o.precarga && B.hayVideo(o.precarga)) B.precargaVideo(o.precarga);
    B.arr(o.sfx).forEach(x => B.espera(x.t || 0, c).then(ok => ok && B.sfx(x.src, x.vol)));
    if (o.mus) B.espera(o.musT || 0, c).then(ok => ok && B.musica(o.mus));
    if (o.amb) B.espera(o.ambT || 0, c).then(ok => ok && B.ambiente(o.amb));
    return B.espera(o.dur || 3, c);
  }
  /* p.blancoSale = { fd (s), sfx, vol }: el blanco no se va al empezar el plano, sino sobre el primer fotograma de su vídeo, con su efecto */
  function sueltaBlanco(p) { if (!M._blanco || !p.blancoSale) return; const o = p.blancoSale; blanco(false, RAPIDO ? .2 : (o.fd || 1.6)); if (o.sfx && !RAPIDO) B.sfx(o.sfx, o.vol); }
  M.descongela = function () { if (M._congelado) trasPintar(); };
  function video(p, c) {
    const capa = $('video');
    const viejos = Array.from(capa.children), quitaViejos = () => viejos.forEach(e => { if (e.tagName === 'VIDEO') try { e.pause(); } catch (x) { } e.remove(); });
    alPintar.length = 0; M._congelado = false; pendiente = false;   // el vídeo nuevo sustituye al congelado
    capa.style.transition = ''; capa.style.opacity = '';
    capa.classList.add('on'); caja(false);
    B.capas.limpia(p.fundeEntra); B.vida.quita();
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
      v.addEventListener('playing', () => {
        if (vfondo && p.fundeEntra) {   // viene de un vídeo de fondo (el túnel): fundido cruzado, y el de fondo se retira cuando ya no se ve
          v.style.transition = 'opacity ' + p.fundeEntra + 's ease'; v.getBoundingClientRect(); v.style.opacity = '';
          setTimeout(() => { v.style.transition = ''; fondoVideo(null); }, p.fundeEntra * 1000 + 120);
        } else v.style.opacity = '';
        requestAnimationFrame(quitaViejos); sueltaBlanco(p); programaBlanco(p, c, RAPIDO ? .5 : (v.duration || p.dur || 5));
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
    const sig = () => { if (c.muerto) return Promise.resolve(false); if (i >= ls.length) return Promise.resolve(true); const l = ls[i++]; return M.di(l, c).then(ok => ok ? sig() : false); };
    return sig();
  }
  const TUNEL = B.hayVideo('vid/tunel_bucle.mp4') ? 'vid/tunel_bucle.mp4' : 'vid/tunel.mp4';   // el bucle perfecto (fundido cruzado interno de 1 s) si está
  /* DESTELLO dentro del túnel (Iago, 2-nov: viaje de vuelta): ~3 s de un vídeo (o lámina) envuelto en la nebulosa del túnel,
     sin fecha ni rótulo; con su sonido (sfx) y sus sucesos (fn). d = { t, dur, video, desde (s del vídeo), img, sfx, vol, fn } */
  const ecos = new Set();
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
    /* media frase como texto en pantalla (lejana, onírica) mientras suena el eco: fundido de entrada y de salida, abajo para no tapar caras */
    let tx = null;
    if (d.texto) {
      tx = B.el('div', 'destello-txt'); tx.innerHTML = (d.quien ? '<small>' + B.esc(d.quien) + '</small>' : '') + '<span>' + B.esc(d.texto) + '</span>'; capa.appendChild(tx);
      B.espera(RAPIDO ? .05 : .45, c).then(ok => ok && tx.isConnected && tx.classList.add('on'));
    }
    requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add('on')));
    /* (Iago 3-nov) el eco de la voz NO se corta: ni al irse el destello ni al cambiar de plano (sigue su cola de reverb hasta el silencio);
       solo lo corta un salto del profe (salta) */
    if (d.sfx) { const h = B.sfx(d.sfx, d.vol == null ? 1 : d.vol); if (h) { ecos.add(h); h.fuente.addEventListener('ended', () => ecos.delete(h)); } }
    if (d.fn) d.fn(c);
    const quita = () => { box.classList.remove('on'); if (tx) tx.classList.remove('on'); setTimeout(() => { if (v) try { v.pause(); } catch (e) { } box.remove(); if (tx) tx.remove(); }, 1100); };
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
    B.sfx('sfx/sfx_salto_tiempo.mp3', .8);
    const fl = B.existe('sfx/sfx_flash_blanco.mp3') ? 'sfx/sfx_flash_blanco.mp3' : 'sfx/sfx_flash_blanco_sint.mp3';
    B.espera(Math.max(0, dur - 2.9), c).then(ok => { if (!ok) return; B.sfx(fl, .8); });   // (Iago 3-nov) el destello suena entero antes de cambiar de página
    B.espera(Math.max(0, dur - 1.7), c).then(ok => { if (!ok) return; blanco(true, 1.6); });
    const vt = B.hayVideo(TUNEL) ? B.precargaVideo(TUNEL) : Promise.resolve(null);
    return vt.then(url => B.tunel(capa, { dur: dur, de: o.desde == null ? 2100 : o.desde, a: o.hasta == null ? 2100 : o.hasta, video: url || null, contador: o.desde != null }, c))
      .then(() => B.espera(.2, c)).then(() => { if (o.alFinal) o.alFinal(); return true; });
  };
  function plano(p, c) {
    M.plano = p.id; document.body.setAttribute('data-plano', p.id);
    if (!p.ensueno) { paraOnda(); quitaEns(); vidaSueno(false); }   // fuera de la ensoñación: lámina nítida, sin ondulación y con la «vida» de siempre
    { const pls = (S.escenas[escIdx] || {}).planos || [], k = pls.indexOf(p);   // la ensoñación que viene (en este plano o el siguiente), ya rasterizada
      if (k >= 0 && !p.ensueno) [pls[k + 1], pls[k + 2]].forEach(x => { if (x && x.ensueno) setTimeout(() => { if (M.plano === p.id) precalienta(x); }, 150); }); }
    if (M._blanco && !p.blancoSale) setTimeout(() => blanco(false, 1.6), 250);   // del blanco a lo siguiente
    else if (M._blanco) setTimeout(() => { if (M.plano === p.id) sueltaBlanco(p); }, 6000);   // red de seguridad: si su vídeo no llega a verse
    const vidOk = p.video && B.hayVideo(p.video);
    if (vidOk || p.tunel || (p.video && !p.img)) {   // plano de vídeo (o túnel); si falta el vídeo y hay img, se monta como lámina fija: el sonido va dentro del vídeo (la música del plano anterior se apaga si mus:false)
      if (p.mus === false) B.musica(null); else if (p.mus) B.musica(p.mus);
      if (p.amb !== undefined) B.ambiente(p.amb);
      $('marcaSub').textContent = (S.escenas[escIdx] || {}).titulo || '';
      return p.blancoPleno ? video(p, c).then(ok => ok ? sostieneBlanco(p.blancoPleno, c) : false) : video(p, c);
    }
    montaPlano(p);
    const ls = B.arr(p.lineas);
    B.arr(p.imgs).concat(ls.concat(B.arr(p.despues)).reduce((a, l) => a.concat(l.img ? [{ img: l.img }] : [], B.arr(l.imgs)), [])).forEach(x => M.predecod(x.img));
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
    ecos.forEach(h => h.parar(.35)); ecos.clear();   // los ecos de los destellos solo se cortan con un salto del profe
    M.terminado = false; M.finInter(); caja(false); B.capas.limpia(); B.vida.quita();
    const cv = $('video'); cv.classList.remove('on'); cv.innerHTML = ''; cv.style.opacity = ''; alPintar.length = 0; M._congelado = false; blanco(false, .1); $('cartel').classList.remove('on'); $('cartel').innerHTML = '';
    if (window.TR.viento) B.viento.parar();
    const p = (S.escenas[i] || {}).planos ? S.escenas[i].planos[k || 0] : null;
    const so = sonidoEn(i, k || 0);
    if (!p || p.mus === undefined) B.musica(so.mus && so.mus.bucle === false ? null : so.mus);
    if (!p || p.amb === undefined) B.ambiente(so.amb);
    escena(i, k || 0);
  }
  M.salta = salta;
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
  function fin() {
    caja(false); B.capas.limpia(); B.vida.quita(); B.progreso.fin(); B.progreso.plano(null);
    const capa = $('cartel'); capa.innerHTML = '';
    const box = B.el('div', 'cart fin');
    box.innerHTML = '<p class="sup">' + B.esc(S.titulo) + '</p><h2>' + B.esc(S.subtitulo || '') + '</h2>';
    const b = B.el('button', 'prim', 'Transportarnos al menú principal'); b.type = 'button';
    b.addEventListener('click', () => { b.disabled = true; capa.classList.remove('on'); capa.innerHTML = '';
      M.teletransporte({ dur: 3.6, alFinal: () => { const v = window.MOD_VOLVER || '../prueba.html'; location.href = v + (v.indexOf('?') < 0 ? '?' : '&') + 'tp=1' + location.hash; } }); });
    const r = B.el('button', '', '↺ Repetir'); r.type = 'button'; r.addEventListener('click', () => { capa.classList.remove('on'); salta(0, 0); });
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
  /* (Iago 3-nov, aula lenta) TRANSICIONES ESPECIALES — el túnel (saltos y teletransporte final), el salto con su blanco, la llegada,
     los destellos del viaje de vuelta, la vuelta y la ensoñación: sus vídeos se bajan enteros y sus láminas se descodifican y se
     GUARDAN descodificadas ANTES de empezar (la pantalla de carga lo espera) */
  const especial = p => !!(p.tunel || p.ensueno || p.blanco || p.blancoPleno || p.blancoSale || p.destellos);
  function videosTrans() {
    const v = []; const pon = x => { if (x && B.hayVideo(x) && v.indexOf(x) < 0) v.push(x); };
    if (S.escenas.some(e => e.planos.some(p => p.tunel))) pon(TUNEL);
    S.escenas.forEach(e => e.planos.forEach(p => { if (!especial(p)) return; pon(p.video); pon(p.fondoVid); if (p.blancoPleno) pon(p.blancoPleno.precarga); B.arr(p.destellos).forEach(d => pon(d.video)); }));
    return v;
  }
  function imgsTrans() {
    const r = []; const pon = x => { const q = x ? B.primero(x) : null; if (q && !q.falta && r.indexOf(q.src) < 0) r.push(q.src); };
    const pl = []; S.escenas.forEach(e => e.planos.forEach(p => pl.push(p)));
    pl.forEach((p, i) => { if (!especial(p)) return; pon(p.img); B.arr(p.destellos).forEach(d => pon(d.img)); if (pl[i + 1]) pon(pl[i + 1].img); if (i > 0 && p.ensueno) pon(pl[i - 1].img); });
    return r;
  }
  B.vivas = [];   // láminas de las transiciones, descodificadas y retenidas (el navegador no las tira)
  function decodTrans() {
    return Promise.all(imgsTrans().map(src => new Promise(res => {
      const im = new Image(); im.src = B.img[src] || src; B.vivas.push(im);
      const ok = () => res(); (im.decode ? im.decode() : Promise.resolve()).then(ok, ok); setTimeout(ok, 6000);
    })));
  }
  function videos() { const v = []; if (B.hayVideo(TUNEL) && S.escenas.some(e => e.planos.some(p => p.tunel))) v.push(TUNEL); S.escenas.forEach(e => e.planos.forEach(p => { if (p.video && B.hayVideo(p.video)) v.push(p.video); if (p.fondoVid && B.hayVideo(p.fondoVid)) v.push(p.fondoVid); B.arr(p.destellos).forEach(d => { if (d.video && B.hayVideo(d.video)) v.push(d.video); }); })); return v; }

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
    /* la barra cuenta los recursos (láminas y sonidos) y los vídeos de las transiciones especiales */
    const vTr = videosTrans(), vHecho = {}, vTot = vTr.reduce((a, v) => a + ((B.RECURSOS && B.RECURSOS[v]) || 2e6), 0);
    let rHecho = 0, rTot = 0;
    const barra = () => {
      let vh = 0; Object.keys(vHecho).forEach(k => { vh += vHecho[k]; });
      const tot = rTot + vTot, k = tot ? Math.min(99, Math.round((rHecho + vh) / tot * 100)) : 99;
      if (!cargado) est.textContent = 'Cargando… ' + k + ' %';
    };
    const pVid = Promise.all(vTr.map(v => B.precargaVideo(v, f => { vHecho[v] = f * ((B.RECURSOS && B.RECURSOS[v]) || 2e6); barra(); })
      .then(() => { vHecho[v] = (B.RECURSOS && B.RECURSOS[v]) || 2e6; barra(); })));
    const pRec = B.precarga(recursos(), pr => { rHecho = pr.bytes; rTot = pr.total; barra(); })
      .then(() => { if (B.prepVoz) B.prepVoz(); return Promise.all([M.prepEnsuenos(), decodTrans()]); });   // tras bajar: ensoñación pre-renderizada y láminas de las transiciones descodificadas
    Promise.all([piano, pRec, pVid]).then(() => {
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
  function arranca() {
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
