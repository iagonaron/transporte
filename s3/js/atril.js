/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 3 · EL ATRIL (Iago 4-nov): toda la secuencia del transporte mental en el camerino se ve como una IMAGEN de fondo:
   el atril de un piano de cola de frente, con una hoja A4 impresa (VexFlow, tinta negra) y un LÁPIZ en la repisa.
     · fondo: img/t3/atril_piano.webp (ayudante C); mientras falta, img/provisional/atril_provisional.webp (dibujado en código)
     · TR.ATRIL (data/t3.js) = { provisional:{hoja:{x,y,w,h}, lapiz:{x,y,w,rot}}, real:{…} } en fracciones del fondo: dónde cae la
       hoja A4 de la imagen y dónde está el lápiz → la partitura se dibuja ENCIMA de esa hoja (se ajusta ahí cuando llegue la lámina)
     · T3.hoja(host, op) → la partitura (8 compases, 4 sistemas de 2) + capa de lápiz; T3.lapices(host, hoja) → el lápiz de la repisa
       (se levanta y pasa a ser el cursor) y el lápiz que se mueve al escribir
     · marcas a lápiz: tachar la armadura ('arm'), tachar la clave de sol ('sol'), escribir la clave de do en 4.ª ('do'), «Do M»
       ('texto'), nombres bajo las notas ('nombres') y el dibujo de la melodía ('dibujo'). Trazos de grafito animados y su sonido.
     · T3.marcas: las del alumno (sus propios trazos), guardadas en la sesión (localStorage tr_t3_marcas): se quedan en toda la
       secuencia (claves, tiempo real y repeticiones). Solo las borra volver a empezar el ejercicio del lápiz.
   Chrome 94: sin ?. ni ??. Ratón y táctil (pointer events).
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const T3 = B.t3 = B.t3 || {}, el = B.el, NS = 'http://www.w3.org/2000/svg';
  const GRAF = '#3b3b3d';
  const sv = (tag, at, padre) => { const n = document.createElementNS(NS, tag); Object.keys(at || {}).forEach(k => n.setAttribute(k, at[k])); if (padre) padre.appendChild(n); return n; };
  const RAP = () => B.param('rapido') === '1';
  const DEF = { hoja: { x: .372, y: .045, w: .256, h: .635 }, lapiz: { x: .468, y: .686, w: .135, rot: -2.5 }, lapizEnImagen: false };
  T3.FONDO = 'img/t3/atril_piano.webp';
  T3.calib = function () {
    const A = B.ATRIL || {}, real = B.existe(T3.FONDO) && B.param('marcas') !== '1';
    return (real && A.real) || A.provisional || DEF;
  };
  const escala = () => { const e = B.$('#escena'); return e ? e.getBoundingClientRect().width / 1920 : 1; };

  /* ── marcas del alumno (estado de la sesión) ── */
  const KM = 'tr_t3_marcas';
  T3.marcas = B.lee(KM, null);   // { arm:[[u,v]…], sol:[[u,v]…], do: línea }  (u,v: relativos a la caja de la armadura / de la clave)
  T3.guardaMarcas = m => { T3.marcas = m; B.guarda(KM, m); };
  T3.borraMarcas = () => { T3.marcas = null; try { localStorage.removeItem(KM); } catch (e) { } };

  /* ── sonido de lápiz sobre papel: ruido filtrado cuyo volumen sigue a la velocidad del trazo ── */
  T3.sonLapiz = function () {
    const C = B.ac(), r = B.ruido(), bp = C.createBiquadFilter(), hp = C.createBiquadFilter(), g = C.createGain();
    bp.type = 'bandpass'; bp.frequency.value = 3600; bp.Q.value = .7; hp.type = 'highpass'; hp.frequency.value = 1400;
    g.gain.value = 0; r.connect(bp); bp.connect(hp); hp.connect(g); g.connect(B.bus.sfx); r.start(); B.vivo(r, 'sfx');
    let vivo = true;
    return {
      vel(v) { if (!vivo) return; const t = C.currentTime, obj = Math.min(.11, v * .0016) * (.75 + Math.random() * .5); g.gain.setTargetAtTime(obj, t, .015); bp.frequency.setTargetAtTime(3000 + Math.random() * 1600, t, .02); },
      para() { if (!vivo) return; vivo = false; const t = C.currentTime; g.gain.setTargetAtTime(0, t, .03); try { r.stop(t + .25); } catch (e) { } }
    };
  };

  /* ── el lápiz (SVG): tumbado (repisa) o escribiendo (punta abajo a la izquierda) ── */
  const LAPIZ = '<rect x="22" y="-5.5" width="118" height="11" rx="1" fill="#e0ad1d"/><rect x="22" y="-5.5" width="118" height="3.6" fill="#f2c94a"/>' +
    '<rect x="22" y="1.9" width="118" height="3.6" fill="#b98a10"/><path d="M22 -5.5 L4 -1.3 L4 1.3 L22 5.5 Z" fill="#e8c9a0"/><path d="M4 -1.3 L0 0 L4 1.3 Z" fill="#2b2b2e"/>' +
    '<rect x="140" y="-5.5" width="9" height="11" fill="#9aa0a6"/><rect x="149" y="-5.5" width="12" height="11" rx="2.5" fill="#c0392b"/>' +
    '<text x="60" y="3.3" font-size="7" font-family="Saira SC,sans-serif" fill="#1c1c1c" opacity=".55" letter-spacing=".6">HB · 2</text>';
  function lapizSvg(cls, angulo) {
    const s = document.createElementNS(NS, 'svg'); s.setAttribute('class', cls);
    if (angulo == null) { s.setAttribute('viewBox', '-2 -8 166 16'); s.innerHTML = LAPIZ; }
    else { s.setAttribute('viewBox', '0 -150 150 150'); s.innerHTML = '<g transform="rotate(' + angulo + ')"><g filter="url(#lpSombra)">' + LAPIZ + '</g></g>' +
      '<defs><filter id="lpSombra" x="-20%" y="-50%" width="140%" height="300%"><feDropShadow dx="2" dy="5" stdDeviation="3" flood-opacity=".35"/></filter></defs>'; }
    return s;
  }

  /* ══════════ LA HOJA ══════════
     op = { can, sistemas: 4, porSistema: 2, compases: 8 (cuántos se imprimen), titulo, marcas: 'alumno' | 'todas' | null, etiquetas }
     api: el, sistemas:[{wrap, geo, svg, cur, et}], capa (SVG en px de la hoja), loc(sis, x, y), cajas(sis) → {arm, sol, x0, lineas[5], sp},
          aLocal(clientX, clientY), aPantalla(x, y), traza(d, o) → Promise, dibuja(tipo, sis, o) → Promise, marcasAlumno(), rect() */
  T3.hoja = function (host, op) {
    op = op || {};
    const cal = T3.calib(), W = cal.hoja.w * 1920, H = cal.hoja.h * 1080, can = op.can || T3.cancion();
    const hoja = el('div', 'at-hoja'); host.appendChild(hoja);
    hoja.style.left = (cal.hoja.x * 1920) + 'px'; hoja.style.top = (cal.hoja.y * 1080) + 'px'; hoja.style.width = W + 'px'; hoja.style.height = H + 'px';
    const M = can.raw || {};
    hoja.appendChild(el('div', 'at-cab', '<b>' + B.esc(can.titulo || 'Cantiga') + '</b><span class="i">' + B.esc(M.tempo_texto || 'Andante cantabile') + '</span><span class="d">Música original</span>'));
    const sisBox = el('div', 'at-sistemas'); hoja.appendChild(sisBox);
    const capa = sv('svg', { class: 'at-capa', viewBox: '0 0 ' + W + ' ' + H, width: W, height: H });
    capa.innerHTML = '<defs><filter id="grafito" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="r"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="r" scale="1.6" xChannelSelector="R" yChannelSelector="G"/></filter></defs>';
    hoja.appendChild(capa);
    const gMarcas = sv('g', { class: 'at-marcas' }, capa), gVivo = sv('g', { class: 'at-vivo' }, capa);
    const NS_ = op.sistemas || 4, PS = op.porSistema || 2, NC = Math.min(op.compases || 8, can.compases.length);
    const api = { el: hoja, W: W, H: H, capa: capa, gMarcas: gMarcas, gVivo: gVivo, sistemas: [], cal: cal, can: can };
    /* ── la página: 8 compases en 4 sistemas de 2; doble barra final en el último ── */
    for (let s = 0; s < NS_; s++) {
      const m0 = s * PS; if (m0 >= NC) break;
      const comps = can.compases.slice(m0, Math.min(NC, m0 + PS)).filter(x => x && x.length);
      const wrap = el('div', 'at-sis'), pe = el('div', 'at-pe'); wrap.appendChild(pe); sisBox.appendChild(wrap);
      const geo = T3.pinta(pe, comps, { fifths: can.fifths, num: can.num, den: can.den, ancho: 340, alto: 104, y: 26, margen: 3, sinCompas: s > 0,
        final: m0 + PS >= NC, ancho1: s > 0 ? 78 : 104, tinta: '#141414' });
      const cur = el('i', 'at-cursor'); wrap.appendChild(cur);
      const et = el('div', 'at-et'); wrap.appendChild(et);
      api.sistemas.push({ wrap: wrap, geo: geo, svg: geo.svg, cur: cur, et: et, m0: m0 });
    }
    /* ── coordenadas: unidades del viewBox de un sistema → px de la hoja ── */
    api.loc = function (S, x, y) {
      const r = S.svg.getBoundingClientRect(), hr = hoja.getBoundingClientRect(), k = escala();
      return { x: (r.left - hr.left + x * r.width / S.geo.W) / k, y: (r.top - hr.top + y * r.height / S.geo.H) / k };
    };
    api.aLocal = (cx, cy) => { const hr = hoja.getBoundingClientRect(), k = escala(); return { x: (cx - hr.left) / k, y: (cy - hr.top) / k }; };
    api.aPantalla = (x, y) => { const hr = hoja.getBoundingClientRect(), k = escala(); return { x: hr.left + x * k, y: hr.top + y * k }; };
    api.rect = () => ({ x: cal.hoja.x * 1920, y: cal.hoja.y * 1080, w: W, h: H });
    const caja = (S, sel) => { const g = S.svg.querySelector(sel); if (!g || !g.getBBox) return null; const b = g.getBBox(); if (!b.width) return null; const a = api.loc(S, b.x, b.y), z = api.loc(S, b.x + b.width, b.y + b.height); return { x: a.x, y: a.y, w: z.x - a.x, h: z.y - a.y }; };
    api.cajas = function (S) {
      const st = S.geo.staves[0], ls = [0, 1, 2, 3, 4].map(i => api.loc(S, 0, st.getYForLine(i)).y);
      return { arm: caja(S, '.vf-keysignature'), sol: caja(S, '.vf-clef'), x0: api.loc(S, st.getX(), 0).x, lineas: ls, sp: ls[1] - ls[0] };
    };
    /* ── trazos de grafito ── */
    const camino = pts => { if (!pts.length) return ''; let d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1); for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; d += ' Q' + pts[i][0].toFixed(1) + ' ' + pts[i][1].toFixed(1) + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1); } if (pts.length > 1) { const l = pts[pts.length - 1]; d += ' L' + l[0].toFixed(1) + ' ' + l[1].toFixed(1); } return d; };
    api.camino = camino;
    api.trazoEl = function (d, ancho, padre) {
      const g = sv('g', { class: 'at-trazo', filter: 'url(#grafito)' }, padre || gMarcas);
      sv('path', { d: d, fill: 'none', stroke: GRAF, 'stroke-width': ancho || 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: .82 }, g);
      sv('path', { d: d, fill: 'none', stroke: '#6d6d70', 'stroke-width': (ancho || 2.4) * .45, 'stroke-linecap': 'round', opacity: .5, transform: 'translate(.7,.5)' }, g);
      return g;
    };
    /* anima un trazo: el lápiz recorre el camino (la punta en cada punto) y el grafito aparece detrás; o = { dur, ancho, c, lapiz } */
    api.traza = function (d, o) {
      o = o || {};
      const g = api.trazoEl(d, o.ancho), ps = B.$$('path', g), L = ps[0].getTotalLength(), dur = RAP() ? .05 : (o.dur || .8);
      if (!o.anima) return Promise.resolve(g);
      ps.forEach(p => { p.style.strokeDasharray = L + ' ' + L; p.style.strokeDashoffset = L; });
      const son = o.sonido === false ? null : T3.sonLapiz(), lp = api.lapiz;
      return new Promise(res => {
        const t0 = performance.now(); let ult = null;
        const paso = () => {
          if (o.c && o.c.muerto) { if (son) son.para(); return res(g); }
          const f = Math.min(1, (performance.now() - t0) / (dur * 1000)), e = f < .5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
          ps.forEach(p => { p.style.strokeDashoffset = L * (1 - e); });
          const pt = ps[0].getPointAtLength(L * e);
          if (lp) lp.pon(pt.x, pt.y);
          if (son && ult) son.vel(Math.hypot(pt.x - ult.x, pt.y - ult.y) * 60);
          ult = pt;
          if (f < 1) requestAnimationFrame(paso); else { if (son) son.para(); ps.forEach(p => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }); res(g); }
        };
        requestAnimationFrame(paso);
      });
    };
    /* ── las marcas: d de cada una, a partir de las cajas del sistema S (y, si las hay, de los trazos del alumno) ── */
    const deCaja = (bx, uv) => uv.map(p => [bx.x + p[0] * bx.w, bx.y + p[1] * bx.h]);
    api.dMarca = function (tipo, S, mAlu) {
      const k = api.cajas(S);
      if (tipo === 'arm' && k.arm) { if (mAlu && mAlu.arm) return camino(deCaja(k.arm, mAlu.arm)); const b = k.arm; return camino([[b.x - 5, b.y + b.h * .86], [b.x + b.w * .5, b.y + b.h * .5 + 2], [b.x + b.w + 5, b.y + b.h * .1]]); }
      if (tipo === 'sol' && k.sol) { if (mAlu && mAlu.sol) return camino(deCaja(k.sol, mAlu.sol)); const b = k.sol; return camino([[b.x - 4, b.y + b.h * .88], [b.x + b.w * .45, b.y + b.h * .52], [b.x + b.w + 5, b.y + b.h * .14]]); }
      if (tipo === 'do') return api.dClaveDo(S, mAlu && mAlu.do != null ? mAlu.do : 1);
      return '';
    };
    /* clave de do escrita a mano en el margen izquierdo del sistema: dos barras y la «B» de la clave, centrada en la línea li (0 = la de arriba) */
    api.dClaveDo = function (S, li) {
      const k = api.cajas(S), yc = k.lineas[li], sp = k.sp, top = yc - 2 * sp, bot = yc + 2 * sp, x = Math.max(4, k.x0 - 25);
      return ['M' + x + ' ' + top + ' L' + x + ' ' + bot, 'M' + (x + 5.5) + ' ' + top + ' L' + (x + 5.5) + ' ' + bot,
        'M' + (x + 8) + ' ' + (top + 1) + ' C' + (x + 21) + ' ' + (top - 1) + ' ' + (x + 21) + ' ' + (yc - 3) + ' ' + (x + 9) + ' ' + yc +
        ' C' + (x + 21) + ' ' + (yc + 3) + ' ' + (x + 21) + ' ' + (bot + 1) + ' ' + (x + 8) + ' ' + (bot - 1)];
    };
    /* dibuja una marca (animada o no): tipo 'arm' | 'sol' | 'do' (o.linea) | 'texto' | 'nombres' | 'dibujo' | 'lee' */
    api.dibuja = function (tipo, si, o) {
      o = o || {}; const S = api.sistemas[si]; if (!S) return Promise.resolve();
      const an = !!o.anima, c = o.c;
      if (tipo === 'do') {
        const ds = api.dClaveDo(S, o.linea == null ? 1 : o.linea);
        return api.traza(ds[0], { anima: an, dur: .3, ancho: 3.4, c: c }).then(() => api.traza(ds[1], { anima: an, dur: .25, ancho: 1.7, c: c })).then(() => api.traza(ds[2], { anima: an, dur: .55, ancho: 2.2, c: c }));
      }
      if (tipo === 'arm' || tipo === 'sol') return api.traza(api.dMarca(tipo, S, o.alu), { anima: an, dur: o.dur || .8, ancho: 2.6, c: c });
      if (tipo === 'texto') {   // «Do M» a lápiz encima de la armadura tachada
        const k = api.cajas(S), b = k.arm || { x: k.x0 + 40, y: k.lineas[0], w: 20, h: 10 }, x = b.x + b.w / 2, y = k.lineas[0] - 1.3 * k.sp;
        const g = sv('g', { class: 'at-texto', filter: 'url(#grafito)' }, gMarcas);
        const tx = sv('text', { x: x, y: y, 'text-anchor': 'middle', class: 'at-lapiztxt' }, g); tx.textContent = o.txt || 'Do M';
        if (!an || RAP()) return Promise.resolve();
        const bb = tx.getBBox(), id = 'clip' + Math.round(Math.random() * 1e9), cp = sv('clipPath', { id: id }, capa), rc = sv('rect', { x: bb.x - 2, y: bb.y - 4, width: 0, height: bb.height + 8 }, cp);
        g.setAttribute('clip-path', 'url(#' + id + ')');
        const son = T3.sonLapiz(), lp = api.lapiz, dur = .7;
        return new Promise(res => { const t0 = performance.now(); const paso = () => { if (c && c.muerto) { son.para(); return res(); } const f = Math.min(1, (performance.now() - t0) / (dur * 1000));
          rc.setAttribute('width', (bb.width + 4) * f); if (lp) lp.pon(bb.x + bb.width * f, bb.y + bb.height * (.55 + .3 * Math.sin(f * 40))); son.vel(30 + 20 * Math.random());
          if (f < 1) requestAnimationFrame(paso); else { son.para(); g.removeAttribute('clip-path'); res(); } }; requestAnimationFrame(paso); });
      }
      if (tipo === 'nombres' || tipo === 'lee') {   // nota a nota: se ilumina, suena una 2.ª M más grave y (nombres) se apunta su nombre debajo
        const k = api.cajas(S), y = k.lineas[4] + 2.6 * k.sp, ns = S.geo.notas;
        let p = Promise.resolve();
        ns.forEach(gn => { p = p.then(() => {
          if (c && c.muerto) return;
          if (gn.el) gn.el.classList.add('n-act');
          T3.piano(gn.n.midi - 2, B.ac().currentTime + .01, .45, .3);
          if (tipo === 'nombres') { const x = api.loc(S, gn.x, 0).x, t = sv('text', { x: x, y: y, 'text-anchor': 'middle', class: 'at-lapiztxt at-nom', filter: 'url(#grafito)' }, gMarcas); t.textContent = T3.NOM[T3.enTenor(gn.n).l]; if (api.lapiz) api.lapiz.pon(x + 8, y - 4); }
          return B.espera(RAP() ? .02 : (o.paso || .36), c).then(() => { if (gn.el) gn.el.classList.remove('n-act'); });
        }); });
        return p;
      }
      if (tipo === 'dibujo') {
        const pts = S.geo.notas.map(gn => { let y = 0; try { y = gn.sn.getYs()[0]; } catch (e) { y = S.geo.yTop; } const q = api.loc(S, gn.x, y); return [q.x, q.y - 15]; });
        return api.traza(camino(pts), { anima: an, dur: o.dur || 1.3, ancho: 1.8, c: c });
      }
      return Promise.resolve();
    };
    /* las marcas del alumno (o las del pianista si aún no las ha hecho: la partitura de los ejercicios nunca sale «limpia») */
    api.marcasAlumno = function () {
      B.$$('.at-trazo', gMarcas).forEach(n => n.remove());
      const m = T3.marcas;
      api.sistemas.forEach((S, i) => { api.dibuja('arm', i, { alu: m }); api.dibuja('sol', i, { alu: m }); api.dibuja('do', i, { linea: m && m.do != null ? m.do : 1 }); });
    };
    if (op.marcas === 'alumno') api.marcasAlumno();
    return api;
  };

  /* ══════════ LOS LÁPICES ══════════ el de la repisa (se puede coger) y el que escribe (sigue a la punta)
     T3.lapices(host, hoja, { interactivo, alCoger }) → { pon(x, y) (px de la hoja), coge(), suelta(), levantado(), vuelve() } */
  T3.lapices = function (host, hoja, o) {
    o = o || {};
    const cal = hoja.cal, L = cal.lapiz, k0 = { x: cal.hoja.x * 1920, y: cal.hoja.y * 1080 };
    const rep = el('div', 'at-repisa' + (cal.lapizEnImagen ? ' en-imagen' : '') + (o.interactivo ? ' coge' : '')); host.appendChild(rep);
    rep.style.left = (L.x * 1920) + 'px'; rep.style.top = (L.y * 1080) + 'px'; rep.style.width = (L.w * 1920) + 'px'; rep.style.transform = 'rotate(' + (L.rot || 0) + 'deg)';
    rep.appendChild(lapizSvg('at-lp-rep'));
    /* (4-nov) si el lápiz va pintado en la lámina, al cogerlo se tapa con el mismo trozo de la lámina sin lápiz (atril_piano_sinlapiz.webp) */
    const SIN = 'img/t3/atril_piano_sinlapiz.webp';
    if (cal.lapizEnImagen && B.existe(SIN)) {
      const Z = { x: .675, y: .641, w: .201, h: .059 }, par = el('div', 'at-parche');
      par.style.cssText = 'left:' + (Z.x * 1920) + 'px;top:' + (Z.y * 1080) + 'px;width:' + (Z.w * 1920) + 'px;height:' + (Z.h * 1080) + 'px;' +
        'background-image:url(' + SIN + ');background-size:1920px 1080px;background-position:-' + (Z.x * 1920) + 'px -' + (Z.y * 1080) + 'px';
      rep.insertAdjacentElement('afterend', par);
    }
    if (o.interactivo) rep.appendChild(el('span', 'at-lp-aviso', 'Coge el lápiz'));
    const vuela = el('div', 'at-lp-vuela'); vuela.appendChild(lapizSvg('at-lp-svg', -48)); host.appendChild(vuela);
    let lev = false, pos = null;
    const api = {
      pon(x, y) { pos = { x: x, y: y }; vuela.style.left = (k0.x + x) + 'px'; vuela.style.top = (k0.y + y - 150) + 'px'; },
      ponStage(x, y) { api.pon(x - k0.x, y - k0.y); },
      coge(x, y) { if (lev) return; lev = true; rep.classList.add('fuera'); vuela.classList.add('on'); host.classList.add('con-lapiz');
        if (x == null) { const r = { x: L.x * 1920 + L.w * 960, y: L.y * 1080 }; api.ponStage(r.x, r.y - 30); } else api.ponStage(x, y);
        if (o.alCoger) o.alCoger(); },
      vuelve() { lev = false; rep.classList.remove('fuera'); vuela.classList.remove('on'); host.classList.remove('con-lapiz'); },
      levantado: () => lev, rep: rep, vuela: vuela, pos: () => pos
    };
    hoja.lapiz = api;
    /* el pianista: el lápiz se ve volando solo mientras escribe */
    if (!o.interactivo) {
      const pon0 = api.pon; let tmr = 0;
      api.pon = (x, y) => { if (!lev) { lev = true; rep.classList.add('fuera'); vuela.classList.add('on'); } pon0(x, y); clearTimeout(tmr); tmr = setTimeout(() => { if (o.vuelveSolo !== false) api.vuelve(); }, 1400); };
    } else {
      const aStage = ev => { const r = B.$('#escena').getBoundingClientRect(), k = escala(); return { x: (ev.clientX - r.left) / k, y: (ev.clientY - r.top) / k }; };
      rep.addEventListener('pointerdown', ev => { ev.preventDefault(); ev.stopPropagation(); const s = aStage(ev); api.coge(s.x, s.y); });
      host.addEventListener('pointermove', ev => { if (!lev) return; const s = aStage(ev); api.ponStage(s.x, s.y); });
      host.addEventListener('pointerdown', ev => { if (!lev) return; const s = aStage(ev); api.ponStage(s.x, s.y); });
    }
    return api;
  };

  /* ══════════ VISTA para los ejercicios (claves, tiempo real): la hoja con las marcas del alumno, cursor y estados de nota ══════════
     T3.vistaAtril(hoja, notas) → { marca(i, cls), cursor(bpos), etiqueta(i, txt, cls), apaga() } (la misma API que la vista de mental.js) */
  T3.vistaAtril = function (hoja, notas) {
    const mapa = {};
    hoja.sistemas.forEach(S => {
      const k = hoja.cajas(S), top = (k.lineas[0] - 2 * k.sp), alto = 8 * k.sp, r0 = hoja.loc(S, 0, 0), r1 = hoja.loc(S, S.geo.W, S.geo.H);
      S.cur.style.top = ((top - r0.y) / (r1.y - r0.y) * 100) + '%'; S.cur.style.height = (alto / (r1.y - r0.y) * 100) + '%';
      S.et.style.top = ((k.lineas[4] + 1.2 * k.sp - r0.y) / (r1.y - r0.y) * 100) + '%';
      const last = S.geo.staves[S.geo.staves.length - 1]; S.fin = last.getX() + last.getWidth() - 4;
      S.geo.notas.forEach(g => { mapa[g.i] = { g: g, S: S }; ['n-act', 'n-ok', 'n-mal', 'n-pasa', 'n-ayuda'].forEach(c => g.el && g.el.classList.remove(c)); });
      B.$$('.at-etq', S.et).forEach(e => e.remove());
    });
    function marca(i, cls) { const m = mapa[i]; if (!m || !m.g.el) return; ['n-act', 'n-ok', 'n-mal', 'n-pasa', 'n-ayuda'].forEach(k => m.g.el.classList.remove(k)); if (cls) m.g.el.classList.add(cls); }
    function etiqueta(i, txt, cls) {
      const m = mapa[i]; if (!m) return;
      let e = B.$('[data-i="' + i + '"]', m.S.et); if (!e) { e = el('span', 'at-etq'); e.dataset.i = i; m.S.et.appendChild(e); }
      e.style.left = (m.g.x / m.S.geo.W * 100) + '%'; e.className = 'at-etq ' + (cls || ''); e.innerHTML = txt;
    }
    function cursor(bpos) {
      let k = -1; for (let j = 0; j < notas.length; j++) { if (notas[j].t <= bpos + 1e-6) k = j; else break; }
      const n = notas[Math.max(0, k)]; hoja.sistemas.forEach(S => { S.cur.style.opacity = '0'; });
      const m = mapa[n.i]; if (!m) return;
      let x;
      if (k < 0) x = m.g.x - 30;
      else { const sig = notas[k + 1], ms = sig ? mapa[sig.i] : null, x1 = ms && ms.S === m.S ? ms.g.x : m.S.fin, fr = B.clamp((bpos - n.t) / n.beats, 0, 1); x = m.g.x + (x1 - m.g.x) * fr; }
      m.S.cur.style.left = (x / m.S.geo.W * 100) + '%'; m.S.cur.style.opacity = '1';
    }
    return { marca: marca, cursor: cursor, etiqueta: etiqueta, apaga: () => hoja.sistemas.forEach(S => { S.cur.style.opacity = '0'; }), el: hoja.el };
  };

  /* prepara #inter (o la lámina) para el atril: a pantalla completa, sin oscurecer el fondo, piel «teatro» (cartel y barra sobrios) */
  T3.prepAtril = function (p, cls) {
    p.innerHTML = ''; p.className = 'on atril ' + (cls || '');
    const e = B.$('#escena'); e.classList.remove('con-inter'); e.classList.add('piel-teatro');
  };
})(window.TR);
