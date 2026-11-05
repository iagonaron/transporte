/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 4 · «Las diferencias» — interactivos y láminas propios de T4 (ayudante D, 4-nov noche)
   Mecánica como Teoría at home PRO; estética «Onda» de T2/T3 (y la hoja del cuaderno de Xoán para la parte).
     escucha     · el dúo de Noa y Xoán (mus/t4_duo.mp3) o «el mal» (mus/t4_duo_mal.mp3) con «↻ Escúchalo otra vez»;
                   si falta el mp3, lo tocan el clarinete y el saxo de viento.js con la parte de t4/melodia.json
     montana     · LA MONTAÑA DE LAS DIFERENCIAS: cumbre de sostenidos ↑ · nivel del mar = Do M · profundidades de bemoles ↓.
                   Cada ítem: coloca las dos tonalidades a su altura (toca la ficha y su nivel, o arrástrala) y di cuántas
                   diferencias hay y en qué dirección. Seis ítems, de menos a más
     pasarParte  · TR_ESC (js/escrito.js) CON ♭ ♮ ♯: la parte de clarinete en Si♭ (Re M, 8 compases, 2 accidentales) → saxo alto
                   en Mi♭ (La M, 5.ª J ↑). Paso 0: tonalidad y armadura nuevas (ventana); después las notas; corrección 50/50
     difFinal    · ejercicio final OPCIONAL: generador de transporte por diferencias, 3 niveles (el 3.º con accidentales).
                   Paso 0 (tonalidad, armadura y diferencias) cuenta el 50 %; las notas, el otro 50 %
   Láminas: escalaDif (la escala de alturas con el salto de una tonalidad a otra) · simbolos (♯ que suben / ♭ que bajan, en su
   orden) · accDif (accidentales que viajan con su nota) · tablaDif (tabla resumen)
   Chrome 94: sin ?. ni ??, sin :has() ni color-mix().
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const T4 = B.t4 = {}, I = B.inter, L = B.lamina, M = () => B.motor, E = () => B.escrito;
  const el = B.el, RAP = () => B.param('rapido') === '1';
  const btn = (txt, cls, fn, tit) => { const b = el('button', cls || '', txt); b.type = 'button'; if (tit) { b.title = tit; b.setAttribute('aria-label', tit); } if (fn) b.addEventListener('click', ev => { ev.stopPropagation(); fn(b, ev); }); return b; };
  const panel = cls => { const p = B.$('#inter'); p.innerHTML = ''; p.className = 'on ' + (cls || ''); return p; };

  /* ── tonalidades (Mayores) y su altura = nº de quintas (♯ +, ♭ −) ── */
  const TON = [['Si M', 5], ['Mi M', 4], ['La M', 3], ['Re M', 2], ['Sol M', 1], ['Do M', 0], ['Fa M', -1], ['Si♭ M', -2], ['Mi♭ M', -3], ['La♭ M', -4], ['Re♭ M', -5]];
  T4.f = n => { for (let i = 0; i < TON.length; i++) if (TON[i][0] === n) return TON[i][1]; return 0; };
  T4.ton = f => { for (let i = 0; i < TON.length; i++) if (TON[i][1] === f) return TON[i][0]; return '?'; };
  T4.arm = f => f === 0 ? 'sin alteraciones' : Math.abs(f) + (f > 0 ? '♯' : '♭');
  const ORD_S = ['fa', 'do', 'sol', 're', 'la', 'mi', 'si'], ORD_B = ['si', 'mi', 'la', 're', 'sol', 'do', 'fa'];
  /* (Iago 4-nov 22:09) NOTAS AFECTADAS, pulsando (como trCorregir de Teoría PRO e inter.js · diferencias): las n primeras del orden
     de los sostenidos si las diferencias son ascendentes, o del de los bemoles si son descendentes */
  const NOMBRES = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'], may = x => x.charAt(0).toUpperCase() + x.slice(1);
  T4.afectadas = (n, asc) => (asc ? ORD_S : ORD_B).slice(0, n).map(may);
  /* fila de 7 botones conmutables → { el, botones, sel(), corrige(sol) → ok, bloquea() } */
  T4.filaNotas = function (titulo) {
    const g = el('div', 'esc-g af-g'); if (titulo) g.appendChild(el('small', '', titulo));
    const f = el('div', 'esc-f dif-notas'); g.appendChild(f);
    const s = {};
    const bs = NOMBRES.map(nm => { const b = btn(nm, 'acc nota', () => { s[nm] = !s[nm]; b.classList.toggle('on', !!s[nm]); }, nm); b.dataset.n = nm; f.appendChild(b); return b; });
    return { el: g, botones: bs, sel: () => NOMBRES.filter(n => s[n]),
      corrige(sol) { const ok = sol.length === NOMBRES.filter(n => s[n]).length && sol.every(n => s[n]);
        bs.forEach(b => { const n = b.dataset.n, es = sol.indexOf(n) >= 0, m = !!s[n]; b.classList.remove('on'); b.classList.toggle('n-ok', es && m); b.classList.toggle('n-sol', es && !m); b.classList.toggle('n-mal', m && !es); b.disabled = true; });
        return ok; },
      bloquea() { bs.forEach(b => { b.disabled = true; }); } };
  };
  /* una nota suelta en clave de sol, con su alteración (ejemplo de la nota afectada) */
  const NOTA_K = { do: 'c/5', re: 'd/5', mi: 'e/5', fa: 'f/5', sol: 'g/4', la: 'a/4', si: 'b/4' };
  T4.miniNota = function (host, k, acc, col, rotulo) {
    try { const VF = Vex.Flow, w = 190, h = 118, r = new VF.Renderer(host, VF.Renderer.Backends.SVG); r.resize(w, h);
      const ctx = r.getContext(); ctx.setFillStyle('#eaf3ff'); ctx.setStrokeStyle('#eaf3ff');
      const st = new VF.Stave(4, 6, w - 8); st.addClef('treble'); st.setContext(ctx).draw(); st.setNoteStartX(st.getNoteStartX() + 34);
      const sn = new VF.StaveNote({ keys: [k], duration: 'w', clef: 'treble' }); if (acc) sn.addModifier(new VF.Accidental(acc), 0);
      sn.setStyle({ fillStyle: col, strokeStyle: col }); sn.getModifiers().forEach(m => m.setStyle && m.setStyle({ fillStyle: col, strokeStyle: col }));
      const v = new VF.Voice({ num_beats: 4, beat_value: 4 }).setStrict(false).addTickables([sn]); new VF.Formatter().joinVoices([v]).format([v], 60); v.draw(ctx, st);
      const svg = host.querySelector('svg'); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); svg.style.width = '100%'; svg.style.height = 'auto'; svg.removeAttribute('width'); svg.removeAttribute('height');
    } catch (e) { }
    if (rotulo) host.appendChild(el('small', '', rotulo));
  };
  /* «De 2♯ a 3♯: un sostenido más → 1 diferencia ascendente» */
  const num = (n, s, p) => n + ' ' + (n === 1 ? s : p);
  T4.explica = function (fa, fb, sinNotas) {   // sinNotas: en la montaña, las notas afectadas se preguntan en el 3.er paso
    const n = Math.abs(fb - fa), asc = fb > fa, partes = [];
    if (fa >= 0 && fb >= 0) partes.push(num(n, 'sostenido', 'sostenidos') + (asc ? ' más' : ' menos'));
    else if (fa <= 0 && fb <= 0) partes.push(num(n, 'bemol', 'bemoles') + (asc ? ' menos' : ' más'));
    else if (fa < 0) partes.push(num(-fa, 'bemol', 'bemoles') + ' menos', num(fb, 'sostenido', 'sostenidos') + ' más');
    else partes.push(num(fa, 'sostenido', 'sostenidos') + ' menos', num(-fb, 'bemol', 'bemoles') + ' más');
    return 'De ' + T4.arm(fa) + ' a ' + T4.arm(fb) + ': ' + partes.join(' y ') + ' → <b>' + (n === 0 ? 'ninguna diferencia' : num(n, 'diferencia', 'diferencias') + ' ' + (asc ? (n === 1 ? 'ascendente' : 'ascendentes') : (n === 1 ? 'descendente' : 'descendentes'))) + '</b>' +
      (n && !sinNotas ? ' · ' + (n === 1 ? 'nota afectada' : 'notas afectadas') + ': <b>' + (asc ? ORD_S : ORD_B).slice(0, n).join(', ') + '</b>' : '') + '.';   /* (Iago 4-nov 21:58) decir las notas afectadas */
  };
  const flecha = (d, t) => '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" aria-hidden="true"><path d="' + (d === 'asc' ? 'M12 3 L20 13 H15 V21 H9 V13 H4 Z' : 'M12 21 L20 11 H15 V3 H9 V11 H4 Z') + '" fill="currentColor"/></svg>';
  T4.flecha = flecha;

  /* ══════════ LA PARTE DE CLARINETE (t4/melodia.json → data/melodia_t4.js, ayudante A) ══════════ */
  /* reserva por si faltara data/melodia_t4.js: la misma parte (4-nov 19:33: sol♯ en el c. 4, do♮ en el c. 6, si♭ en el c. 7) */
  const RESERVA = { tono: 'Re M', compas: '6/8', tempo: 56, notas: ('1 re4 corchea|1 mi4 corchea|1 fa#4 corchea|1 la4 negra_p|2 si4 negra_p|2 la4 corchea|2 sol4 negra|3 fa#4 negra|3 mi4 corchea|3 re4 corchea|3 mi4 negra|' +
    '4 sol4 negra|4 sol#4 corchea|4 la4 negra_p|5 re4 corchea|5 mi4 corchea|5 fa#4 corchea|5 la4 negra|5 re5 corchea|6 re5 negra_p|6 do5 negra|6 si4 corchea|7 sib4 corchea|7 la4 corchea|7 sol4 corchea|7 fa#4 negra|7 mi4 corchea|8 re4 blanca_p')
    .split('|').map(x => { const p = x.split(' '); return { c: +p[0], n: p[1], d: p[2] }; }) };
  const LET = { do: 'c', re: 'd', mi: 'e', fa: 'f', sol: 'g', la: 'a', si: 'b' };
  const DUR = { corchea: '8', negra: 'q', negra_p: 'qd', blanca: 'h', blanca_p: 'hd', semicorchea: '16', redonda: 'w' };
  T4.mel = () => B.MELODIA4 || RESERVA;
  /* def para E.fijo: { ton:'Re', compas:'6/8', compases:[[['d/4','8'], …], …], transp: 7 (5.ª J ↑) } */
  T4.def = function () {
    const m = T4.mel(), cs = [];
    m.notas.forEach(n => { const r = /^(do|re|mi|fa|sol|la|si)(#|b|♯|♭)?(-?\d)/.exec(String(n.n).toLowerCase()); if (!r) return;
      let al = r[2] === '#' || r[2] === '♯' ? '#' : r[2] === 'b' || r[2] === '♭' ? 'b' : '';
      (cs[n.c - 1] = cs[n.c - 1] || []).push([LET[r[1]] + al + '/' + r[3], DUR[n.d] || 'q']); });
    return { ton: String(m.tono || 'Re M').replace(/\s*M(ayor)?$/, ''), compas: m.compas || '6/8', compases: cs.filter(Boolean), transp: 7 };
  };
  T4.ex = function () { const ex = E().fijo(T4.def()), t = T4.mel().tempo || 56; ex.negra8 = 60 / t / 1.5; return ex; };   // 6/8: negra con puntillo = tempo
  /* el dúo sintetizado (si faltan los mp3 de A): bien = clarinete (escrito −2) + saxo con la parte buena (escrito −9): unísono;
     mal = los dos leen la parte de clarinete (el saxo suena una 5.ª J por debajo) */
  T4.toca = function (modo, alFin) {
    const ex = T4.ex(), sol = ex.notas.map((n, i) => E().solNota(ex, i)), V = B.viento, C = B.ac(), q = ex.negra8;
    let t = C.currentTime + .15;
    ex.notas.forEach((n, i) => {
      const d = E().durBeats(n.dur) * q;
      V.nota('clarinete', n.midi - 2, t, d * .94, .62);
      const ms = modo === 'mal' ? n.midi - 9 : n.midi + 7 - 9;
      V.nota('saxo', ms, t + .012, d * .94, .55);
      t += d;
    });
    const tot = t - C.currentTime; if (alFin) B.espera(tot + .2).then(alFin); return tot + .2;
  };

  /* ══════════ a · ESCUCHAR (el dúo, «el mal») ══════════
     cfg = { mp3, sint:'bien'|'mal', rotulo, otraVez:'↻ Escúchalo otra vez', imgs:[{t|en, img}], texto (barra), dur } */
  I.escucha = function (cfg, c) {
    const p = panel('i-escucha'); B.$('#escena').classList.remove('con-inter');
    if (cfg.rotulo) p.appendChild(el('div', 'esc4-rot', cfg.rotulo));
    let h = null, gen = 0, cerrado = false;
    const para = () => { gen++; if (h) { h.parar(.25); h = null; } try { B.viento.parar(); } catch (e) { } };
    const toca = () => {
      para(); const mi = gen;
      let dur;
      if (cfg.mp3 && B.buf[cfg.mp3]) { h = B.suena(cfg.mp3, { bus: B.bus.mus, grupo: 'plano', vol: cfg.vol == null ? 1 : cfg.vol }); dur = B.buf[cfg.mp3].duration; }
      else dur = T4.toca(cfg.sint || 'bien');
      if (RAP()) dur = Math.min(dur, 1.2);
      B.arr(cfg.imgs).forEach(x => { const t = x.t != null ? x.t : (x.en || 0) * dur; B.espera(t, c).then(ok => { if (ok && mi === gen && !cerrado) M().cambia(x.img); }); });
      B.espera(dur + .1, c).then(ok => { if (!ok || mi !== gen || cerrado) return; if (cfg.alAcabar) M().barraTexto(cfg.alAcabar); if (cfg.sigueSolo) fin(true); });
    };
    const bOtra = cfg.otraVez ? btn(cfg.otraVez, '', () => { if (cfg.img) M().cambia(cfg.img); toca(); }) : null;
    M().barra(cfg.texto || '', bOtra ? [bOtra] : []);
    let res = null;
    const fin = ok => { if (cerrado) return; cerrado = true; para(); if (res) res(ok); };
    toca();
    return new Promise(r => { res = r; c.alMorir.push(() => fin(false)); M().esperaSigue(c).then(ok => fin(ok)); });   // (Iago 2-nov) «Continuar» siempre pulsable al escuchar
  };

  /* ══════════ LA MONTAÑA (dibujo común del interactivo y de la lámina) ══════════ */
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, at, padre) => { const e = document.createElementNS(NS, tag); Object.keys(at || {}).forEach(k => e.setAttribute(k, at[k])); if (padre) padre.appendChild(e); return e; };
  const MT = { W: 1000, H: 760, mar: 380, paso: 62, x0: 30, xEsc: 800 };
  T4.yNivel = f => MT.mar - f * MT.paso;
  T4.dibujaMontana = function (host, o) {
    o = o || {};
    const W = MT.W, H = MT.H, Y = T4.yNivel, svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'mt-svg', 'aria-hidden': 'true' }, host);
    const defs = sv('defs', {}, svg), gr = (id, st) => { const g = sv('linearGradient', { id: id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs); st.forEach(s => sv('stop', { offset: s[0], 'stop-color': s[1], 'stop-opacity': s[2] == null ? 1 : s[2] }, g)); };
    gr('mtCielo', [[0, '#07122b'], [.75, '#123a63'], [1, '#2c6c8f']]);
    gr('mtRoca', [[0, '#3d5a7c'], [1, '#14233a']]);
    gr('mtMar', [[0, '#0f6a86'], [.45, '#09405c'], [1, '#03111f']]);
    gr('mtNieve', [[0, '#ffffff'], [1, '#cfe9ff']]);
    sv('rect', { x: 0, y: 0, width: W, height: MT.mar, fill: 'url(#mtCielo)' }, svg);
    for (let i = 0; i < 36; i++) sv('circle', { cx: (i * 263) % W, cy: (i * 97) % (MT.mar - 60) + 6, r: i % 5 === 0 ? 1.8 : 1.1, fill: '#dff3ff', opacity: .35 + (i % 4) * .12, class: 'mt-est' }, svg);
    /* la montaña (cumbre en +5) y su nieve */
    const cima = Y(5) - 8;
    sv('path', { d: 'M ' + MT.x0 + ' ' + MT.mar + ' L 150 ' + Y(2.2) + ' L 215 ' + Y(1.7) + ' L 320 ' + Y(4) + ' L 372 ' + Y(3.4) + ' L 470 ' + cima + ' L 560 ' + Y(3.6) + ' L 615 ' + Y(4.1) + ' L 700 ' + Y(1.9) + ' L 760 ' + Y(1.1) + ' L 790 ' + MT.mar + ' Z', fill: 'url(#mtRoca)', stroke: '#7fb6e6', 'stroke-opacity': .45, 'stroke-width': 2 }, svg);
    sv('path', { d: 'M 430 ' + (cima + 52) + ' L 470 ' + cima + ' L 520 ' + (cima + 58) + ' L 500 ' + (cima + 48) + ' L 486 ' + (cima + 64) + ' L 468 ' + (cima + 44) + ' L 452 ' + (cima + 60) + ' Z', fill: 'url(#mtNieve)', opacity: .92 }, svg);
    sv('path', { d: 'M 300 ' + (Y(4) + 34) + ' L 320 ' + Y(4) + ' L 344 ' + (Y(4) + 30) + ' L 330 ' + (Y(4) + 24) + ' Z', fill: '#eaf6ff', opacity: .7 }, svg);
    /* sendero en zigzag hasta la cumbre */
    let d = 'M 120 ' + (MT.mar - 4); for (let f = 1; f <= 5; f++) d += ' L ' + (f % 2 ? 640 - f * 22 : 260 + f * 30) + ' ' + (Y(f) + 10);
    sv('path', { d: d, fill: 'none', stroke: '#ffd59a', 'stroke-opacity': .5, 'stroke-width': 3, 'stroke-dasharray': '2 10', 'stroke-linecap': 'round' }, svg);
    /* el mar y las profundidades */
    /* (Iago 5-nov) bajo el mar se ve, a través del agua, el fondo: la montaña sigue hacia abajo hasta la fosa de los bemoles */
    gr('mtRoca', [[0, '#2f6f86'], [1, '#0b2236']]);
    sv('path', { d: 'M ' + MT.x0 + ' ' + MT.mar + ' L 110 ' + Y(-1.4) + ' L 190 ' + Y(-2.5) + ' L 260 ' + Y(-2.2) + ' L 330 ' + Y(-3.5) + ' L 410 ' + Y(-4.4) + ' L 470 ' + Y(-5) + ' L 540 ' + Y(-4.3) + ' L 600 ' + Y(-3.9) + ' L 670 ' + Y(-2.8) + ' L 730 ' + Y(-1.7) + ' L 790 ' + MT.mar + ' Z', fill: 'url(#mtRoca)', opacity: .95 }, svg);
    sv('path', { d: 'M 150 ' + Y(-2) + ' q 30 -16 60 0 M 520 ' + Y(-4) + ' q 26 -14 52 0 M 640 ' + Y(-2.6) + ' q 20 -12 40 0', fill: 'none', stroke: '#7fd8c8', 'stroke-opacity': .35, 'stroke-width': 3, 'stroke-linecap': 'round' }, svg);   // algas
    sv('rect', { x: 0, y: MT.mar, width: W, height: H - MT.mar, fill: 'url(#mtMar)', opacity: .62 }, svg);   // agua semitransparente
    sv('path', { d: 'M 0 ' + (H - 26) + ' Q 120 ' + (H - 60) + ' 240 ' + (H - 30) + ' T 480 ' + (H - 36) + ' T 760 ' + (H - 22) + ' L 760 ' + H + ' L 0 ' + H + ' Z', fill: '#020a14', opacity: .8 }, svg);
    for (let i = 0; i < 14; i++) sv('circle', { cx: 60 + (i * 151) % 700, cy: MT.mar + 40 + (i * 83) % (H - MT.mar - 70), r: 2 + i % 4, fill: 'none', stroke: '#bff0ff', 'stroke-opacity': .45, class: 'mt-burbuja', style: 'animation-delay:' + (-i * .7) + 's' }, svg);
    let ola = 'M 0 ' + MT.mar; for (let x = 0; x <= W; x += 40) ola += ' Q ' + (x + 10) + ' ' + (MT.mar - 6) + ' ' + (x + 20) + ' ' + MT.mar + ' T ' + (x + 40) + ' ' + MT.mar;
    sv('path', { d: ola, fill: 'none', stroke: '#9ff0ff', 'stroke-width': 3, class: 'mt-ola' }, svg);
    /* niveles: líneas finas y su altura (5♯ … 0 … 5♭) */
    for (let f = 5; f >= -5; f--) {
      const y = Y(f);
      if (f !== 0) sv('line', { x1: 70, y1: y, x2: MT.xEsc - 6, y2: y, stroke: f > 0 ? '#ffd59a' : '#9ff0ff', 'stroke-opacity': .16, 'stroke-dasharray': '6 8' }, svg);
      const t = sv('text', { x: 18, y: y + 9, class: 'mt-alt' + (f === 0 ? ' cero' : f > 0 ? ' sos' : ' bem') }, svg); t.textContent = f === 0 ? '0' : Math.abs(f) + (f > 0 ? '♯' : '♭');
    }
    const tm = sv('text', { x: 70, y: MT.mar - 12, class: 'mt-mar' }, svg); tm.textContent = 'Nivel del mar · Do M';
    if (o.rotulos !== false) {
      const t1 = sv('text', { x: 560, y: 34, class: 'mt-rot sos' }, svg); t1.textContent = '↑ Cumbre de los sostenidos';
      const t2 = sv('text', { x: 520, y: H - 14, class: 'mt-rot bem' }, svg); t2.textContent = '↓ Profundidades de los bemoles';
    }
    /* el viajero (el del videojuego): sube y baja por la escala */
    const via = sv('g', { class: 'mt-viajero', transform: 'translate(' + (MT.xEsc - 26) + ',' + MT.mar + ')' }, svg);
    sv('circle', { r: 17, fill: '#ffb547', opacity: .22 }, via); sv('circle', { r: 9, fill: '#ffb547' }, via); sv('circle', { r: 13, fill: 'none', stroke: '#fff3d6', 'stroke-width': 2 }, via);
    via.style.display = 'none';
    return { svg: svg, via: via };
  };
  /* mueve el viajero de una altura a otra, con ♯ o ♭ que saltan en cada nivel y una nota por paso */
  /* barrido «tecnológico» (sin altura de nota reconocible): sierra + cuadrada desafinadas por un filtro resonante que sube o baja */
  T4.barrido = function (sube, f) {
    try { const ac = B.ac(), t = ac.currentTime + .01, d = .42, out = B.bus.sfx || B.bus.master;
      const g = ac.createGain(), lp = ac.createBiquadFilter(); lp.type = 'bandpass'; lp.Q.value = 6;
      const o1 = ac.createOscillator(), o2 = ac.createOscillator(); o1.type = 'sawtooth'; o2.type = 'square';
      const base = 180 + 14 * (f || 0), a = sube ? base : base * 2.6, b = sube ? base * 2.6 : base;
      o1.frequency.setValueAtTime(a, t); o1.frequency.exponentialRampToValueAtTime(b, t + d);
      o2.frequency.setValueAtTime(a * 1.013, t); o2.frequency.exponentialRampToValueAtTime(b * 1.013, t + d);
      lp.frequency.setValueAtTime(sube ? 700 : 3200, t); lp.frequency.exponentialRampToValueAtTime(sube ? 3200 : 700, t + d);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.11, t + .04); g.gain.setValueAtTime(.11, t + d * .6); g.gain.exponentialRampToValueAtTime(.001, t + d);
      o1.connect(lp); o2.connect(lp); lp.connect(g); g.connect(out); o1.start(t); o2.start(t); o1.stop(t + d + .02); o2.stop(t + d + .02);
    } catch (e) { }
  };
  T4.viaja = function (m, capa, fa, fb, c) {
    const via = m.via, Y = T4.yNivel, n = Math.abs(fb - fa), s = fb > fa ? 1 : -1, paso = RAP() ? .05 : .55;
    via.style.display = ''; via.setAttribute('transform', 'translate(' + (MT.xEsc - 26) + ',' + Y(fa) + ')');
    via.style.transition = 'none'; via.style.transform = 'translate(' + (MT.xEsc - 26) + 'px,' + Y(fa) + 'px)'; via.getBoundingClientRect();
    let pr = Promise.resolve(true);
    for (let k = 1; k <= n; k++) {
      const f = fa + s * k;
      pr = pr.then(ok => ok === false ? false : B.espera(paso, c).then(ok2 => {
        if (!ok2) return false;
        via.style.transition = 'transform ' + paso + 's ease-in-out'; via.setAttribute('transform', 'translate(' + (MT.xEsc - 26) + ',' + Y(f) + ')');
        via.style.transform = 'translate(' + (MT.xEsc - 26) + 'px,' + Y(f) + 'px)';
        /* qué cambia en ese paso: al subir, un ♯ más (si f > 0) o un ♭ menos; al bajar, al revés */
        const sube = s > 0, gl = sube ? (f > 0 ? '+♯' : '−♭') : (f < 0 ? '+♭' : '−♯');
        const g = el('i', 'mt-glifo ' + (gl.indexOf('♯') >= 0 ? 'sos' : 'bem'), gl);
        g.style.top = ((Y(f) - 22) / MT.H * 100) + '%'; g.style.left = ((MT.xEsc - 96) / MT.W * 100) + '%';
        capa.appendChild(g); requestAnimationFrame(() => g.classList.add('on')); setTimeout(() => g.remove(), 2200);
        T4.barrido(sube, f);   /* (Iago 5-nov 09:14) nada de notas: un barrido electrónico que sube o baja */
        return true;
      }));
    }
    return pr;
  };

  /* ══════════ b · LA MONTAÑA DE LAS DIFERENCIAS ══════════
     cfg = { items:[{ de:'Re M', a:'La M', bien }], cartel, cartelCorto, fin } */
  I.montana = function (cfg, c) {
    const p = panel('i-montana');
    const w = el('div', 'mt'), mapa = el('div', 'mt-mapa'), ficha = el('div', 'mt-ficha');
    w.appendChild(mapa); w.appendChild(ficha); p.appendChild(w);
    const m = T4.dibujaMontana(mapa), capaG = el('div', 'mt-capa'); mapa.appendChild(capaG);
    /* los huecos de cada altura (a la derecha de la montaña) */
    const huecos = {};
    for (let f = 5; f >= -5; f--) {
      const h = el('div', 'mt-hueco' + (f === 0 ? ' cero' : f > 0 ? ' sos' : ' bem'));
      h.style.top = ((T4.yNivel(f) - 24) / MT.H * 100) + '%'; h.style.left = (MT.xEsc / MT.W * 100) + '%'; h.dataset.f = f;
      h.innerHTML = '<small>' + (f === 0 ? '0' : Math.abs(f) + (f > 0 ? '♯' : '♭')) + '</small><b></b>';
      h.addEventListener('click', ev => { ev.stopPropagation(); if (selChip) prueba(selChip, f); });
      mapa.appendChild(h); huecos[f] = h;
    }
    const puestas = {};   // tonalidades ya colocadas (se quedan en la montaña)
    let k = 0, selChip = null, sigue = null, listo = false;
    const bSig = btn('Siguiente ▶', 'prim', () => { bSig.style.display = 'none'; k++; monta(); M().barraTexto(cfg.cartelCorto); });
    bSig.style.display = 'none';
    function pon(ton, f, viejo) {
      puestas[ton] = f; const h = huecos[f]; h.classList.add('lleno'); if (viejo) h.classList.add('viejo'); else h.classList.remove('viejo');
      B.$('b', h).textContent = ton;
    }
    function monta() {
      const it = cfg.items[k], fa = T4.f(it.de), fb = T4.f(it.a);
      Object.keys(huecos).forEach(f => huecos[f].classList.remove('act', 'mal', 'ok'));
      Object.keys(puestas).forEach(t => { huecos[puestas[t]].classList.add('viejo'); });
      m.via.style.display = 'none'; selChip = null;
      ficha.innerHTML = ''; B.$$('.mt-guia', mapa).forEach(x => x.remove());
      ficha.appendChild(el('div', 'esc-cab', '<span class="esc-num">' + (k + 1) + ' de ' + cfg.items.length + '</span>De <b>' + it.de + '</b> a <b>' + it.a + '</b>'));
      const paso1 = el('div', 'mt-paso', '<small>1 · Coloca cada tonalidad a su altura</small>'); ficha.appendChild(paso1);
      const bandeja = el('div', 'mt-bandeja'); paso1.appendChild(bandeja);
      const paso2 = el('div', 'mt-paso mt-p2', '<small>2 · ¿Cuántas diferencias y hacia dónde?</small>'); ficha.appendChild(paso2);
      const ctl = el('div', 'esc-ctl dif-ctl mt-ctl'); paso2.appendChild(ctl);
      const g1 = el('div', 'esc-g'); g1.appendChild(el('small', '', 'Diferencias')); const rN = el('div'); g1.appendChild(rN); ctl.appendChild(g1);
      const sel = { n: 0, dir: null };
      Rueda.crea(rN, ['0', '1', '2', '3', '4', '5', '6', '7'], 0, ix => { sel.n = ix; });
      const g2 = el('div', 'esc-g'); g2.appendChild(el('small', '', 'Dirección')); const f2 = el('div', 'esc-f esc-col'); g2.appendChild(f2); ctl.appendChild(g2);
      const dTxt = (d, t, sub) => flecha(d, 30) + '<span class="dir-t"><b>' + t + '</b><small>' + sub + '</small></span>';
      const bA = btn(dTxt('asc', 'Ascendente', 'más ♯ o menos ♭'), 'dir largo', () => { sel.dir = sel.dir === 'asc' ? null : 'asc'; dirs(); }, 'Ascendente (más sostenidos o menos bemoles)');
      const bD = btn(dTxt('desc', 'Descendente', 'más ♭ o menos ♯'), 'dir largo', () => { sel.dir = sel.dir === 'desc' ? null : 'desc'; dirs(); }, 'Descendente (más bemoles o menos sostenidos)');
      f2.appendChild(bA); f2.appendChild(bD);
      const dirs = () => { bA.classList.toggle('on', sel.dir === 'asc'); bD.classList.toggle('on', sel.dir === 'desc'); };
      const bC = btn('✓ Corregir', 'prim', () => corrige()); const g4 = el('div', 'esc-g esc-cor'); g4.appendChild(bC); ctl.appendChild(g4);
      const res = el('div', 'dif-res mt-res'); ficha.appendChild(res);
      ficha.appendChild(bSig);
      const falta = () => [it.de, it.a].filter(t => puestas[t] == null);
      const activa = () => { const ok = !falta().length; paso2.classList.toggle('on', ok);
        if (ok && !B.$('.mt-chip', bandeja)) bandeja.innerHTML = '<span class="mt-listo">✓ ' + it.de + ' y ' + it.a + ', cada una a su altura</span>'; [bA, bD, bC].forEach(b => { b.disabled = !ok; }); rN.classList.toggle('quieta', !ok);
        if (ok) { huecos[fa].classList.add('act'); huecos[fb].classList.add('act'); huecos[fa].classList.remove('viejo'); huecos[fb].classList.remove('viejo');
          m.via.style.display = ''; m.via.style.transition = 'none'; m.via.style.transform = 'translate(' + (MT.xEsc - 26) + 'px,' + T4.yNivel(fa) + 'px)'; m.via.setAttribute('transform', 'translate(' + (MT.xEsc - 26) + ',' + T4.yNivel(fa) + ')');
          /* (Iago 5-nov 09:15) guía sutil: chevrones que tintinean desde el círculo hacia donde va */
          if (fb !== fa) { const gu = el('div', 'mt-guia ' + (fb > fa ? 'arriba' : 'abajo'), '<i></i><i></i><i></i>');
            gu.style.left = ((MT.xEsc - 26) / MT.W * 100) + '%'; gu.style.top = (T4.yNivel(fa) / MT.H * 100) + '%'; mapa.appendChild(gu); }
          M().barraTexto('El viajero está en <b>' + it.de + '</b>. ¿Cuántos niveles hay hasta <b>' + it.a + '</b>, y hacia dónde?'); } };
      /* las fichas: tocar y tocar su altura, o arrastrar */
      [it.de, it.a].filter((t, i, a) => a.indexOf(t) === i).forEach(t => {
        if (puestas[t] != null) { const y = el('span', 'mt-chip ya', t + ' <small>ya está</small>'); bandeja.appendChild(y); return; }
        const ch = btn(t, 'mt-chip', () => { selChip = selChip === ch ? null : ch; B.$$('.mt-chip', bandeja).forEach(x => x.classList.toggle('on', x === selChip)); });
        ch.dataset.ton = t; ch.dataset.err = 0; bandeja.appendChild(ch); arrastrable(ch);
      });
      prueba = function (ch, f) {
        const t = ch.dataset.ton, ok = T4.f(t) === f, h = huecos[f];
        if (ok) { pon(t, f); ch.remove(); selChip = null; B.viento.ui('ok'); h.classList.add('ok'); setTimeout(() => h.classList.remove('ok'), 700);
          M().barraTexto('<b>' + t + '</b> lleva ' + T4.arm(f) + (f === 0 ? ': al nivel del mar.' : f > 0 ? ': ' + f + (f === 1 ? ' nivel' : ' niveles') + ' por encima del mar.' : ': ' + (-f) + (f === -1 ? ' nivel' : ' niveles') + ' bajo el mar.'));
          if (!B.$('.mt-chip:not(.ya)', bandeja)) B.espera(RAP() ? .1 : .9, c).then(o => o && activa());
          else B.$$('.mt-chip', bandeja).forEach(x => x.classList.remove('on'));
        } else {
          const e = +ch.dataset.err + 1; ch.dataset.err = e; B.viento.ui('mal');
          h.classList.add('mal'); setTimeout(() => h.classList.remove('mal'), 700); ch.classList.add('sacude'); setTimeout(() => ch.classList.remove('sacude'), 500);
          M().barraTexto(e < 2 ? '<b>' + t + '</b> no está a esa altura. Piensa en su armadura: los sostenidos suben, los bemoles bajan.' : '<b>' + t + '</b> lleva <b>' + T4.arm(T4.f(t)) + '</b> en la armadura: ' + (T4.f(t) === 0 ? 'va al nivel del mar.' : T4.f(t) > 0 ? 'súbela ' + T4.f(t) + ' por encima del mar.' : 'bájala ' + (-T4.f(t)) + ' bajo el mar.'));
        }
      };
      function corrige() {
        const sol = { n: Math.abs(fb - fa), dir: fb > fa ? 'asc' : 'desc' };
        const okN = sel.n === sol.n && (sol.n === 0 || sel.dir === sol.dir);
        [bA, bD, bC].forEach(b => { b.disabled = true; }); rN.classList.add('quieta'); B.$$('.mt-guia', mapa).forEach(x => x.remove());
        const solTxt = sol.n + ' ' + flecha(sol.dir, 26);
        res.innerHTML = '<div class="' + (okN ? 'ok' : 'mal') + '"><small>Diferencias</small>' + (okN ? solTxt : '<s>' + sel.n + (sel.dir ? ' ' + flecha(sel.dir, 22) : '') + '</s> ' + solTxt) + '</div><p>' + (okN ? (it.bien || '¡Exacto! ') : '') + T4.explica(fa, fb, true) + '</p>';
        B.viento.ui(okN ? 'ok' : 'mal');
        T4.viaja(m, capaG, fa, fb, c).then(ok => {
          if (!ok) return;
          if (!sol.n) return sigueItem();
          /* (Iago 4-nov 22:09) 3.er paso: qué notas quedan afectadas, pulsando */
          paso1.style.display = 'none'; paso2.style.display = 'none'; paso3.style.display = '';   /* (Iago 5-nov 09:12) sin el paso 2 no se apiñan los textos */ B.$('button.prim', paso3).disabled = false;
          M().barraTexto('Y ahora: ¿qué ' + (sol.n === 1 ? 'nota queda afectada? Púlsala' : 'notas quedan afectadas? Púlsalas') + ' y <b>Comprueba</b>.');
        });
        corrige3 = function () {
          const af = T4.afectadas(sol.n, sol.dir === 'asc'), okA = fila3.corrige(af); B.$('button.prim', paso3).disabled = true;
          res3.innerHTML = '<span class="' + (okA ? 'ok' : 'mal') + '">' + (okA ? '✓ ' : '✗ ') + (af.length === 1 ? 'La nota afectada es ' : 'Las notas afectadas son ') + '<b>' + af.join(', ') + '</b>.</span>';
          B.viento.ui(okA ? 'ok' : 'mal');
          /* (Iago 5-nov 09:13) la regla, en la ficha (donde se contesta) y con un ejemplo en pentagrama: la nota afectada con una
             alteración accidental → cómo queda. Los ejemplos van cambiando (♭→♮, ♮→♯ · ♯→♮, ♮→♭) */
          const asc = sol.dir === 'asc', nAf = (asc ? ORD_S : ORD_B)[0], ej = asc ? [['b', 'n'], ['n', '#']][k % 2] : [['#', 'n'], ['n', 'b']][k % 2];
          const G = { b: '♭', n: '♮', '#': '♯' };
          const card = el('div', 'mt-afx ' + sol.dir, '<p>' + (af.length === 1 ? 'Nota afectada: <b>' + nAf + '</b>. Si lleva' : 'Notas afectadas: <b>' + (asc ? ORD_S : ORD_B).slice(0, sol.n).join(', ') + '</b>. Si llevan') +
            ' alteración accidental, ' + (af.length === 1 ? (asc ? 'sube' : 'baja') : (asc ? 'suben' : 'bajan')) + ' <b>medio tono</b>. Por ejemplo:</p>');
          const fila = el('div', 'mt-afx-f'), n1 = el('div', 'mt-afx-n'), n2 = el('div', 'mt-afx-n');
          fila.appendChild(n1); fila.appendChild(el('i', 'mt-afx-fl', '<span>' + (asc ? '↑' : '↓') + ' ½ tono</span>')); fila.appendChild(n2); card.appendChild(fila); paso3.appendChild(card);
          T4.miniNota(n1, NOTA_K[nAf], ej[0], '#ffb547', nAf + G[ej[0]]); T4.miniNota(n2, NOTA_K[nAf], ej[1], '#7dffa8', nAf + G[ej[1]]);
          requestAnimationFrame(() => card.classList.add('on'));
          sigueItem();
        };
      }
      const paso3 = el('div', 'mt-paso mt-p3'), fila3 = T4.filaNotas('3 · ¿Qué notas quedan afectadas? Púlsalas'), res3 = el('div', 'mt-res3');
      const b3 = btn('✓ Comprobar', 'prim', () => corrige3()); const f3b = el('div', 'mt-p3-pie'); f3b.appendChild(b3); f3b.appendChild(res3);
      paso3.appendChild(fila3.el); paso3.appendChild(f3b); paso3.style.display = 'none'; ficha.insertBefore(paso3, bSig);
      let corrige3 = () => { };
      function sigueItem() {
        if (k < cfg.items.length - 1) bSig.style.display = '';
        else if (!listo) { listo = true; M().barraTexto(cfg.fin || 'Ya sabes contar las diferencias: cuántos niveles, hacia dónde y qué notas quedan afectadas.'); M().esperaSigue(c).then(o => sigue && sigue(o)); }
      }
      if (!falta().length) activa(); else paso2.classList.remove('on'), [bA, bD, bC].forEach(b => { b.disabled = true; }), rN.classList.add('quieta');
    }
    let prueba = () => { };
    /* arrastrar una ficha con el ratón o el dedo hasta su altura */
    function arrastrable(ch) {
      let fantasma = null, id = null, x0 = 0, y0 = 0, mov = false;
      const esc = () => B.$('#escena').getBoundingClientRect(), k1 = () => esc().width / 1920;
      /* (Iago 5-nov, iPad: se quedó una ficha «Re M» flotando) limpieza a prueba de toques: otro dedo, captura perdida o soltar fuera */
      const limpia = () => { B.$$('.mt-chip.fantasma').forEach(x => x.remove()); fantasma = null; ch.classList.remove('cogida'); B.$$('.mt-hueco', mapa).forEach(h => h.classList.remove('sobre')); };
      ch.style.touchAction = 'none';
      ch.addEventListener('pointerdown', ev => { if (id != null || fantasma) { limpia(); mov = false; } id = ev.pointerId; x0 = ev.clientX; y0 = ev.clientY; mov = false; try { ch.setPointerCapture(id); } catch (e) { } });
      ch.addEventListener('pointermove', ev => {
        if (ev.pointerId !== id) return;
        if (!mov && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 8) return;
        if (!mov) { mov = true; fantasma = el('span', 'mt-chip fantasma', ch.dataset.ton); B.$('#escena').appendChild(fantasma); ch.classList.add('cogida'); }
        const r = esc(), k = k1(); fantasma.style.left = ((ev.clientX - r.left) / k) + 'px'; fantasma.style.top = ((ev.clientY - r.top) / k) + 'px';
        B.$$('.mt-hueco', mapa).forEach(h => { const b = h.getBoundingClientRect(); h.classList.toggle('sobre', ev.clientX >= b.left - 30 && ev.clientX <= b.right && ev.clientY >= b.top && ev.clientY <= b.bottom); });
      });
      const suelta = ev => {
        if (ev.pointerId !== id) return; id = null;
        if (!mov) { limpia(); return; }
        ev.stopPropagation(); ch.classList.remove('cogida'); if (fantasma) { fantasma.remove(); fantasma = null; }
        let f = null; B.$$('.mt-hueco', mapa).forEach(h => { if (h.classList.contains('sobre')) f = +h.dataset.f; h.classList.remove('sobre'); });
        if (f != null) prueba(ch, f);
        ch._sinClic = true; setTimeout(() => { ch._sinClic = false; }, 50);
      };
      ch.addEventListener('pointerup', suelta); ch.addEventListener('pointercancel', suelta);
      ch.addEventListener('lostpointercapture', ev => { if (ev.pointerId === id) suelta(ev); else if (fantasma && id == null) limpia(); });
      window.addEventListener('pointerup', ev => { if (fantasma && (id == null || ev.pointerId === id)) { if (ev.pointerId === id) suelta(ev); else limpia(); } }, true);
      ch.addEventListener('click', ev => { if (ch._sinClic) ev.stopImmediatePropagation(); }, true);
    }
    monta();
    return M().cartel(cfg.cartel, { botones: [], aulaSolo: false }).then(() => new Promise(res => {
      sigue = res; c.alMorir.push(() => res(false)); if (cfg.cartelCorto) M().barraTexto(cfg.cartelCorto);
    }));
  };

  /* ══════════ PASO 0 · ventana de tonalidad, armadura (y diferencias) ══════════
     o = { ex, titulo, texto, diferencias:bool, validar:bool (repite hasta acertar) | false (una vez: puntúa), pistas, alListo(r) }
     r = { tonOk, armOk, difOk } */
  function paso0(host, o) {
    const ex = o.ex, cap = el('div', 'p0-capa'), box = el('div', 'p0');
    cap.appendChild(box); host.appendChild(cap);
    box.appendChild(el('div', 'p0-tit', o.titulo || 'Paso 0 · Antes de escribir ninguna nota'));
    box.appendChild(el('p', 'p0-txt', o.texto || ''));
    const fila = el('div', 'esc-ctl p0-fila'); box.appendChild(fila);
    const s = { nat: null, alt: 0, arm: null, n: 0, dir: null };
    const nats = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'], natInv = nats.slice().reverse().concat(['—']);
    const gT = el('div', 'esc-g'); gT.appendChild(el('small', '', 'Tonalidad nueva')); const fT = el('div', 'esc-f'); gT.appendChild(fT); fila.appendChild(gT);
    const rT = el('div'); fT.appendChild(rT);
    const cA = el('div', 'esc-col'), bB = btn('♭', 'cuad acc', () => { s.alt = s.alt === -1 ? 0 : -1; pinta(); }, 'Bemol'), bS = btn('♯', 'cuad acc', () => { s.alt = s.alt === 1 ? 0 : 1; pinta(); }, 'Sostenido');
    cA.appendChild(bB); cA.appendChild(bS); fT.appendChild(cA);
    const lT = el('b', 'esc-lbl', '—'); gT.appendChild(lT);
    Rueda.crea(rT, natInv, natInv.length - 1, ix => { s.nat = ix < nats.length ? nats[nats.length - 1 - ix] : null; pinta(); });
    const gA = el('div', 'esc-g'); gA.appendChild(el('small', '', 'Armadura nueva')); const rA = el('div'); gA.appendChild(rA); fila.appendChild(gA);
    const armV = []; for (let k = 7; k >= 1; k--) armV.push({ f: k, txt: k + '♯' }); armV.push({ f: 0, txt: '—' }); for (let k = 1; k <= 7; k++) armV.push({ f: -k, txt: k + '♭' });
    Rueda.crea(rA, armV.map(x => x.txt), 7, ix => { s.arm = armV[ix].f; });
    let bAs = null, bDs = null;
    if (o.diferencias) {
      const gN = el('div', 'esc-g'); gN.appendChild(el('small', '', 'Diferencias')); const rN = el('div'); gN.appendChild(rN); fila.appendChild(gN);
      Rueda.crea(rN, ['0', '1', '2', '3', '4', '5', '6', '7'], 0, ix => { s.n = ix; });
      const gD = el('div', 'esc-g'); gD.appendChild(el('small', '', 'Dirección')); const fD = el('div', 'esc-f esc-col'); gD.appendChild(fD); fila.appendChild(gD);
      const dTxt = (d, t) => flecha(d, 26) + '<span class="dir-t"><b>' + t + '</b></span>';
      bAs = btn(dTxt('asc', 'Ascendente'), 'dir largo', () => { s.dir = s.dir === 'asc' ? null : 'asc'; pinta(); }, 'Ascendente');
      bDs = btn(dTxt('desc', 'Descendente'), 'dir largo', () => { s.dir = s.dir === 'desc' ? null : 'desc'; pinta(); }, 'Descendente');
      fD.appendChild(bAs); fD.appendChild(bDs);
    }
    const dTon = ex.destino.name, dF = ex.destino.fifths, dN = Math.abs(dF - ex.key.fifths), dDir = dF > ex.key.fifths ? 'asc' : 'desc', afSol = T4.afectadas(dN, dDir === 'asc');
    let fAf = null;
    if (o.afectadas) { fAf = T4.filaNotas('Notas afectadas: pulsa las que cambian'); const ff = el('div', 'esc-ctl p0-fila p0-af'); ff.appendChild(fAf.el); box.appendChild(ff); }
    function pinta() { lT.textContent = s.nat ? s.nat + (s.alt === 1 ? '♯' : s.alt === -1 ? '♭' : '') + ' Mayor' : '—'; bB.classList.toggle('on', s.alt === -1); bS.classList.toggle('on', s.alt === 1);
      if (bAs) { bAs.classList.toggle('on', s.dir === 'asc'); bDs.classList.toggle('on', s.dir === 'desc'); } }
    const pie = el('div', 'p0-pie'), msg = el('p', 'p0-msg'); box.appendChild(pie); pie.appendChild(msg);
    let intentos = 0;
    const bSol = btn('Ver la solución', '', () => { cierra({ tonOk: false, armOk: false, difOk: false, vista: true }); }); bSol.style.display = 'none';
    const bOk = btn(o.validar === false ? 'Comprobar' : '✓ Comprobar', 'prim', () => comprueba());
    pie.appendChild(bSol); pie.appendChild(bOk);
    function comprueba() {
      const ton = s.nat ? s.nat + (s.alt === 1 ? '♯' : s.alt === -1 ? '♭' : '') : null;
      const r = { tonOk: ton === dTon, armOk: (s.arm == null ? 0 : s.arm) === dF, difOk: !o.diferencias || (s.n === dN && (dN === 0 || s.dir === dDir)) };
      const elegidas = fAf ? fAf.sel() : [];
      r.afOk = !fAf || (elegidas.length === afSol.length && afSol.every(n => elegidas.indexOf(n) >= 0));
      const todo = r.tonOk && r.armOk && r.difOk && r.afOk;
      intentos++;
      if (o.validar !== false) {
        if (todo) { if (fAf) fAf.corrige(afSol); B.viento.ui('ok'); msg.className = 'p0-msg ok'; msg.innerHTML = '✓ ' + (o.bien || ('<b>' + dTon + ' Mayor</b>, ' + T4.arm(dF) + '.')); bOk.disabled = true; B.espera(RAP() ? .1 : 1.3).then(() => cierra(r)); return; }
        B.viento.ui('mal'); const P = o.pistas || {}, l = [];
        if (!r.tonOk) l.push(P.ton || 'Revisa la tónica: muévela el intervalo del transporte.');
        if (!r.armOk) l.push(P.arm || 'Revisa la armadura de la tonalidad nueva.');
        if (!r.difOk) l.push(P.dif || 'Cuenta las alteraciones que cambian entre las dos armaduras, y hacia dónde.');
        if (!r.afOk) l.push(P.afect || 'Las notas afectadas son las primeras del orden de los sostenidos (si suben) o de los bemoles (si bajan).');
        msg.className = 'p0-msg mal'; msg.innerHTML = '<b>Pista:</b> ' + l.join(' ');
        if (intentos >= 2) bSol.style.display = '';
        return;
      }
      /* sin repetir: se ve lo que estaba bien y lo que no, con la respuesta */
      B.viento.ui(todo ? 'ok' : 'mal');
      const linea = (ok, txt) => '<span class="' + (ok ? 'ok' : 'mal') + '">' + (ok ? '✓ ' : '✗ ') + txt + '</span>';
      msg.className = 'p0-msg'; msg.innerHTML = linea(r.tonOk, 'Tonalidad: <b>' + dTon + ' Mayor</b>') + linea(r.armOk, 'Armadura: <b>' + T4.arm(dF) + '</b>') +
        (o.diferencias ? linea(r.difOk, 'Diferencias: <b>' + dN + '</b> ' + (dN ? flecha(dDir, 20) : '')) : '') +
        (fAf ? linea(r.afOk, 'Notas afectadas: <b>' + (afSol.length ? afSol.join(', ') : 'ninguna') + '</b>') : '');
      if (fAf) fAf.corrige(afSol);
      bOk.textContent = 'Seguir con las notas ▶'; bOk.onclick = null;
      const nuevo = bOk.cloneNode(true); bOk.replaceWith(nuevo); nuevo.addEventListener('click', ev => { ev.stopPropagation(); cierra(r); });
      [rT, rA].forEach(x => x.classList.add('quieta')); B.$$('button.acc, button.dir', box).forEach(b => { b.disabled = true; }); B.$$('.rueda', box).forEach(x => x.classList.add('quieta'));
    }
    function cierra(r) { cap.classList.add('va'); setTimeout(() => cap.remove(), 450); if (o.alListo) o.alListo(r); }
    setTimeout(() => cap.classList.add('on'), 30);
  }
  T4.paso0 = paso0;

  /* (Iago 22:10–22:11) la barra cuenta las notas «?» que quedan por decidir */
  const barraDudas = (api, txtFin) => { if (!api || !api._transcrito || (api._pista && api._pista > Date.now())) return; const n = api.dudas();   // (no pisa la pista de un fallo)
    M().barraTexto(n ? 'Te quedan <b>' + n + '</b> ' + (n === 1 ? 'nota que parpadea' : 'notas que parpadean') + ': define su alteración. Llevan copiada la del original: <b>púlsala</b> y elige ♭ ♮ ♯ o <b>✓ Validar</b>. Cada decisión se corrige al momento y cuenta el <b>primer intento</b>.' : (txtFin || 'Todas las notas definidas. Pulsa <b>Corregir</b>.')); };
  /* (Iago 07:22) pista al fallar una nota que parpadeaba: si cae en una nota afectada, su alteración cambia ½ tono; si no, se copia igual */
  const NOM_ES = { C: 'do', D: 're', E: 'mi', F: 'fa', G: 'sol', A: 'la', B: 'si' };
  const alDecidir = getApi => (ok, gi, ex) => { const api = getApi(); if (ok) { api._pista = 0; return barraDudas(api); }
    api._pista = Date.now() + 3600;
    const n = ex.notas[gi], sN = E().solNota(ex, gi), nom = NOM_ES[sN.step], cambia = (n.alter || 0) !== sN.alter;
    M().barraTexto('<b>Pista:</b> ' + (cambia ? '<b>' + nom + '</b> es la nota afectada: su alteración ' + (sN.alter > (n.alter || 0) ? 'sube' : 'baja') + ' ½ tono.' : '<b>' + nom + '</b> no es nota afectada: la alteración se copia igual.') + ' Vuelve a intentarlo.');
    setTimeout(() => { if (api && api.dudas && api.dudas()) barraDudas(api); }, 3700); };
  /* el cartel fijo y el recordatorio, a partir de la melodía (después del paso 0) */
  const ponAfect = (api, ex) => { const n = Math.abs(ex.destino.fifths - ex.key.fifths), asc = ex.destino.fifths > ex.key.fifths, af = T4.afectadas(n, asc);
    api.ponCartel(n + ' ' + (n === 1 ? 'diferencia' : 'diferencias') + ' ' + (asc ? '↑' : '↓') + ' · ' + (af.length === 1 ? 'nota afectada' : 'notas afectadas') + ': <b>' + af.join(' · ').toUpperCase() + '</b>');
    api.ponAfectadas((af.length === 1 ? 'Nota afectada: ' : 'Notas afectadas: ') + af.join(', ').toLowerCase()); };
  const bTranscribir = getApi => { const b = btn('✎ Transcribir', '', () => { const api = getApi(); if (!api || !api.transcribe) return; api._transcrito = true; api.transcribe(); b.disabled = true; barraDudas(api); },
    'Escribe todas las notas transportadas; las que llevan alteración accidental, con la del original copiada y un «?»'); b.style.display = 'none'; return b; };

  /* ══════════ c · PASAR LA PARTE (guiado) ══════════
     cfg = { cartel, cartelCorto, pistas:{ton, arm, notas}, bien, sigueAlAcertar, paso0:{titulo, texto, bien} } */
  I.pasarParte = function (cfg, c) {
    const p = panel('i-escrito cuaderno i-parte');
    const ex = T4.ex();
    let api = null, intentos = 0, listo = false, solVista = false, sigue = null;
    const bSol = btn('Ver la solución', '', () => { if (!api) return; solVista = true; api.solucion(); api.bloquea(); habilita(cfg.trasSolucion || 'Así queda tu parte de saxo: <b>La M</b> (3♯), cada nota una 5.ª justa más arriba y los accidentales con su nota.'); });
    bSol.style.display = 'none';
    /* (Iago 4-nov 22:01, 22:10) «✎ Transcribir»: escribe todas; las que llevan alteración accidental, copiada y con «?» (escrito.js · transcribe) */
    const bTra = bTranscribir(() => api);
    api = E().panel(p, ex, { alterar: true, guiado: true, lado: true, porFila: 4, altoFila: 100,
      titulo: 'Pasa la parte de <b>clarinete en Si♭</b> a <b>saxo alto en Mi♭</b> · <b>' + ex.transp.lbl + '</b>',
      etiquetaOrig: 'Parte de Xoán · <b>clarinete en Si♭</b> · <b>' + ex.key.name + ' Mayor</b> (' + T4.arm(ex.key.fifths) + ')',
      etiquetaAlu: '<b>Tu parte de saxo alto en Mi♭</b> · las notas, con <b>✎ Transcribir</b>; tú decides las que parpadean', soloTranscribir: true,
      sonOrig: { inst: 'clarinete', off: -2 }, sonAlu: { inst: 'saxo', off: -9 }, txtOrig: '▶ Clarinete', txtAlu: '▶ Tu saxo', juntos: '▶ Los dos a la vez',
      sinFantasma: true, alDecidir: alDecidir(() => api), alCambio: () => barraDudas(api), alCorregir: (pt, e) => corr(pt, e) });
    B._apiEscrito = api;
    function corr(pt, ex2) {
      intentos++;
      if (pt >= .999 && solVista) return;
      if (pt >= .999) { api.bloquea(); bSol.style.display = 'none'; habilita(cfg.bien || '¡Perfecto! Tu parte de saxo ya suena con la de Xoán.');
        if (cfg.sigueAlAcertar != null) B.espera(cfg.sigueAlAcertar, c).then(ok => { if (ok && sigue) sigue(true); });
        return; }
      const P = cfg.pistas || {}, mal = E().notasMal(ex2), l = [];
      if (mal.some(x => x)) l.push(P.notas || 'Las notas en rojo no están en su sitio.');
      if (ex2.conAcc) { const malAcc = ex2.notas.some((n, i) => mal[i] && ex2.aluNotas[i] && E().stepTransportado(n, ex2.transp).step === ex2.aluNotas[i].step && E().stepTransportado(n, ex2.transp).octave === ex2.aluNotas[i].octave);
        if (malAcc) l.push(P.acc || 'Alguna nota está en su sitio pero le falta (o le sobra) una alteración: los accidentales viajan con su nota.'); }
      M().barraTexto('<b>Pista:</b> ' + l.join(' '));
      if (intentos >= 2) { bSol.style.display = ''; habilita(null); }
    }
    function habilita(txt) { if (txt) M().barraTexto(txt); if (!listo) { listo = true; M().esperaSigue(c).then(ok => sigue && sigue(ok)); } }
    const P0 = cfg.paso0 || {};
    return M().cartel(cfg.cartel, { botones: [bTra, bSol], aulaSolo: false }).then(() => new Promise(res => {
      sigue = res; c.alMorir.push(() => res(false));
      M().barraTexto(P0.barra || '<b>Paso 0</b> · elige la tonalidad y la armadura de tu parte de saxo.');
      paso0(p, { ex: ex, titulo: P0.titulo || 'Paso 0 · La tonalidad de tu parte', texto: P0.texto || '', validar: true, pistas: cfg.pistas, bien: P0.bien, diferencias: true, afectadas: true,
        /* (Iago 5-nov 09:16) «✎ Transcribir» en una ventana en el centro: es la ÚNICA forma de poner las notas (a mano sería muy tedioso) */
        alListo: () => { api.fijaTonArm(); ponAfect(api, ex);
          const n = Math.abs(ex.destino.fifths - ex.key.fifths), af = T4.afectadas(n, ex.destino.fifths > ex.key.fifths);
          M().cartel('<b>Ahora, las notas.</b> Pulsa <b>✎ Transcribir</b> y se escribirán solas, cada una una <b>5.ª justa más arriba</b>. Las que llevan alteración accidental <b>parpadean</b>: púlsalas y decide si llevan ♭, ♮ o ♯. Recuerda: ' + (af.length === 1 ? 'la nota afectada es <b>' : 'las notas afectadas son <b>') + af.join(', ').toLowerCase() + '</b>.',
            { boton: '✎ Transcribir', botones: [bSol], aulaSolo: false })
            .then(() => { if (!api || !api.transcribe) return; api._transcrito = true; api.transcribe(); barraDudas(api); });
        } });
    }));
  };

  /* ══════════ d · EJERCICIO FINAL (opcional): transporte por diferencias, 3 niveles ══════════
     cfg = { niveles:[{…NIVEL de escrito.js…, acc}], cartel, cartelCorto, opcional:true } */
  I.difFinal = function (cfg, c) {
    const p = panel('i-escrito i-final4');
    const niveles = cfg.niveles, notas = [];
    let k = 0, api = null, listo = false, sigue = null, s0 = null;
    const bSig = btn('Siguiente melodía ▶', 'prim', () => { bSig.style.display = 'none'; k++; monta(); });
    bSig.style.display = 'none';
    const bFin = btn('Terminar', 'disc', () => M().alMenu(), 'Terminar y transportarnos al menú principal');
    const bMenu = btn('Transportarnos al menú principal', '', () => M().alMenu());
    const bTra = bTranscribir(() => api);
    function monta() {
      const ex = E().generar(niveles[k]);
      bTra.style.display = 'none'; bTra.disabled = false;
      s0 = null;
      api = E().panel(p, ex, { alterar: true, lado: true, cabecera: 'Melodía ' + (k + 1) + ' de ' + niveles.length + (niveles[k].acc ? ' · con accidentales' : ''), instrumento: 'piano',
        /* (Iago 22:09) paso 0 = 50 %: tonalidad y armadura 25 % · número y dirección 12,5 % · notas afectadas 12,5 %; las notas, el otro 50 % */
        puntua: e => (s0 ? (s0.tonOk && s0.armOk ? .25 : 0) + (s0.difOk ? .125 : 0) + (s0.afOk ? .125 : 0) : 0) + .5 * E().notasBien(e) / e.notas.length,
        resTxt: () => (s0 && s0.tonOk && s0.armOk ? '✓' : '✗') + ' tonalidad y armadura · ' + (s0 && s0.difOk ? '✓' : '✗') + ' diferencias · ' + (s0 && s0.afOk ? '✓' : '✗') + ' notas afectadas',
        sinFantasma: true, alDecidir: alDecidir(() => api), alCambio: () => barraDudas(api), alCorregir: pt => corr(pt) });
      B._apiEscrito = api;
      M().barraTexto('<b>Paso 0</b> · tonalidad, armadura, diferencias y notas afectadas. Una sola vez: cuenta para la nota.');
      paso0(p, { ex: ex, diferencias: true, afectadas: true, validar: false, titulo: 'Paso 0 · Melodía ' + (k + 1) + ' de ' + niveles.length,
        texto: 'La melodía está en <b>' + ex.key.name + ' Mayor</b> (' + T4.arm(ex.key.fifths) + ') y hay que transportarla una <b>' + ex.transp.lbl + '</b>. ¿Tonalidad nueva, armadura, diferencias y notas afectadas?',
        alListo: r => { s0 = r; api.fijaTonArm(); ponAfect(api, ex); bTra.style.display = ''; M().barraTexto((cfg.cartelCorto || 'Coloca cada nota transportada (y sus alteraciones). Después, <b>Corregir</b>.') + ' Si quieres, <b>✎ Transcribir</b> las escribe y tú defines las que <b>parpadean</b>.'); } });
    }
    function corr(pt) {
      notas[k] = pt; api.bloquea(); bTra.style.display = 'none';
      if (k < niveles.length - 1) { bSig.style.display = ''; M().barraTexto('Melodía ' + (k + 1) + ': <b>' + Math.round(pt * 100) + ' %</b>. Pulsa <b>Siguiente melodía</b>.'); }
      else {
        const media = notas.reduce((a, b) => a + b, 0) / notas.length, nota = Math.round(media * 100) / 10;
        B.notaFinal = nota; try { B.guarda('tr_t4_nota', { nota: nota, cuando: Date.now() }); } catch (e) { }
        bFin.style.display = 'none';
        M().barraTexto('Tus tres melodías: ' + notas.map(x => Math.round(x * 100) + ' %').join(' · ') + '. <b>Nota: ' + String(nota).replace('.', ',') + '</b>');
        if (!listo) { listo = true; M().esperaSigue(c).then(ok => sigue && sigue(ok)); }
      }
    }
    /* el panel no se monta hasta que se elige «Practicar» (si no, se quedaría el paso 0 abierto detrás del cartel) */
    return M().cartel(cfg.cartel, cfg.opcional ? { botones: [bTra, bSig, bFin], boton: cfg.botonPracticar || 'Practicar: 3 melodías', extra: [bMenu], aulaSolo: false } : { botones: [bSig], aulaSolo: false })
      .then(() => new Promise(res => { sigue = res; c.alMorir.push(() => res(false)); monta(); }));
  };

  /* ══════════ LÁMINAS ══════════ */
  /* la escala de alturas (Do M al nivel del mar) con el salto de una tonalidad a otra: { titulo, de:'Re M', a:'La M', t } */
  L.escalaDif = function (box, s, c) {
    if (s.titulo) box.appendChild(el('div', 'lam-tit', s.titulo));
    const mapa = el('div', 'mt-mapa mini'); box.appendChild(mapa);
    const m = T4.dibujaMontana(mapa, { rotulos: s.rotulos }), capa = el('div', 'mt-capa'); mapa.appendChild(capa);
    const pinta = (ton, cls) => { const f = T4.f(ton), h = el('div', 'mt-hueco lleno ' + cls + (f === 0 ? ' cero' : f > 0 ? ' sos' : ' bem'));
      h.style.top = ((T4.yNivel(f) - 24) / MT.H * 100) + '%'; h.style.left = (MT.xEsc / MT.W * 100) + '%';
      h.innerHTML = '<small>' + (f === 0 ? '0' : Math.abs(f) + (f > 0 ? '♯' : '♭')) + '</small><b>' + ton + '</b>'; mapa.appendChild(h); return h; };
    (s.todas || []).forEach(t => pinta(t, 'viejo'));
    if (!s.de) return;
    const fa = T4.f(s.de), fb = T4.f(s.a);
    pinta(s.de, 'act');
    B.espera(s.t || 1, c).then(ok => { if (!ok || !box.isConnected) return; T4.viaja(m, capa, fa, fb, c).then(o => { if (o && box.isConnected) { pinta(s.a, 'act');
      if (s.cuenta !== false) { const b = el('div', 'mt-cuenta', Math.abs(fb - fa) + ' ' + flecha(fb > fa ? 'asc' : 'desc', 30) + '<small>' + (fb > fa ? 'ascendente' : 'descendente') + '</small>'); mapa.appendChild(b); requestAnimationFrame(() => b.classList.add('on')); } } }); });
  };
  /* el flashback: ♯ que aparecen subiendo (o ♭ bajando), en su orden: { simbolo:'♯'|'♭', t0, cada } */
  L.simbolos = function (box, s, c) {
    const sube = s.simbolo !== '♭', ord = sube ? ORD_S : ORD_B, n = s.n || 7, cada = s.cada || .9;
    box.classList.add(sube ? 'sube' : 'baja');
    box.appendChild(el('div', 'sim-tit', sube ? '↑ Más sostenidos' : '↓ Más bemoles'));
    const col = el('div', 'sim-col'); box.appendChild(col);
    for (let i = 0; i < n; i++) {
      const g = el('div', 'sim-g', '<b>' + (sube ? '♯' : '♭') + '</b><small>' + ord[i] + '</small><i>' + (i + 1) + (sube ? '♯' : '♭') + '</i>');
      g.style[sube ? 'bottom' : 'top'] = (i / (n - 1) * 86) + '%'; col.appendChild(g);
      B.espera((s.t0 || 1) + i * cada, c).then(ok => { if (ok && box.isConnected) { g.classList.add('on'); try { B.viento.piano(sube ? 66 + i * 2 : 70 - i * 2, B.ac().currentTime + .01, .5, .16); } catch (e) { } } });
    }
  };
  /* los accidentales viajan con su nota: filas [{ de:'c/5', deAcc:'n', a:'g/5', aAcc:'n', txt }] (VexFlow), una tras otra */
  L.accDif = function (box, s, c) {
    if (s.titulo) box.appendChild(el('div', 'lam-tit', s.titulo));
    const VF = Vex.Flow, dur = (B.motor && B.motor._durLinea) || 10;
    const nota = (host, f, k, acc, rotulo) => {
      const w = 300, h = 120, r = new VF.Renderer(host, VF.Renderer.Backends.SVG); r.resize(w, h);
      const ctx = r.getContext(); ctx.setFillStyle('#eaf3ff'); ctx.setStrokeStyle('#eaf3ff');
      const st = new VF.Stave(6, 4, w - 12); st.addClef('treble'); if (f) st.addKeySignature(E().ksName(f)); st.setContext(ctx).draw(); st.setNoteStartX(st.getNoteStartX() + 70);   // la nota (con su alteración) en el centro
      const sn = new VF.StaveNote({ keys: [k], duration: 'w', clef: 'treble' }); if (acc) sn.addModifier(new VF.Accidental(acc), 0);
      sn.setStyle({ fillStyle: '#ffb547', strokeStyle: '#ffb547' }); sn.getModifiers().forEach(m => m.setStyle && m.setStyle({ fillStyle: '#ffb547', strokeStyle: '#ffb547' }));
      const v = new VF.Voice({ num_beats: 4, beat_value: 4 }).setStrict(false).addTickables([sn]); new VF.Formatter().joinVoices([v]).format([v], 90); v.draw(ctx, st);
      const svg = host.querySelector('svg'); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); svg.style.width = '100%'; svg.style.height = 'auto'; svg.removeAttribute('width'); svg.removeAttribute('height');
      host.appendChild(el('small', 'acc-rot', rotulo));
    };
    const cab = el('div', 'acc-fila acc-cab', '<span>Clarinete en Si♭ · <b>Re M</b></span><i></i><span>Saxo alto en Mi♭ · <b>La M</b></span><em></em>'); box.appendChild(cab);
    s.filas.forEach((x, i) => {
      const f = el('div', 'acc-fila'), a = el('div', 'acc-pe'), b = el('div', 'acc-pe');
      f.appendChild(a); f.appendChild(el('i', 'acc-fl', '<span>5.ª J ↑</span>')); f.appendChild(b); f.appendChild(el('em', 'acc-txt', x.txt));
      box.appendChild(f);
      nota(a, 2, x.de, x.deAcc, x.deTxt || '');
      /* (Iago 4-nov 22:07) si la diferencia cambia la alteración, se ANIMA: primero se copia la del original (fa♭) y la diferencia la sube (fa♮) */
      const cambia = x.aAcc !== x.deAcc;
      if (cambia) { b.classList.add('acc-morf'); const b1 = el('div', 'v1'), b2 = el('div', 'v2'); b.appendChild(b1); b.appendChild(b2);
        nota(b1, 3, x.a, x.deAcc, (x.aTxt || '').replace(/[♮♯♭]$/, '') + ({ b: '♭', '#': '♯', n: '♮' }[x.deAcc] || '') + ' ?'); nota(b2, 3, x.a, x.aAcc, x.aTxt || '');
        b.appendChild(el('span', 'acc-sube', (x.aAcc === 'n' && x.deAcc === 'b') || (x.aAcc === '#' && x.deAcc === 'n') ? '↑ ½ tono' : '↓ ½ tono')); }
      else nota(b, 3, x.a, x.aAcc, x.aTxt || '');
      const e = (s.ens || [])[i]; B.espera(e == null ? .6 + i * 1.6 : (e > 1 ? e : e * dur), c).then(ok => { if (!ok) return; f.classList.add('on');
        if (cambia) B.espera(RAP() ? .1 : 1.6, c).then(ok2 => { if (ok2) { b.classList.add('ya'); B.viento.ui('ok'); } }); });
    });
  };
  /* ══ (Iago 4-nov 22:07 · 5-nov 07:18–07:19) TRANSPORTE ANIMADO sobre un trozo real de la parte, con LOS DOS PENTAGRAMAS ══
     Arriba Xoán (clarinete en Si♭, Re M); abajo Noa (saxo alto en Mi♭, La M: su armadura entra animada). Cada nota BAJA del pentagrama de
     Xoán al de Noa, una 5.ª J más arriba, y deja una línea de unión tenue con su original. Mientras Xoán habla de un caso, la pareja se
     resalta en los dos pentagramas. Etiqueta FIJA «1 diferencia ↑ · nota afectada: FA» (brilla cuando se nombra fa). Al final, la
     comparación «sol ♮ = ♮» frente a «fa ♭ → ♮».
     s = { titulo, compases:[desde, hasta), paso, ens:{ arm, cascada, sos, do, sib, fa, morfo, comp } (s; si ≤ 1, fracción de la frase) }
     Capas VexFlow: A (Xoán) · B (Noa, con la alteración COPIADA del original) · C (la nota afectada ya corregida, verde) + una capa SVG
     de uniones y halos. Solo transform y opacity (nada de filtros: iPad). */
  L.transpAnim = function (box, s, c) {
    if (s.titulo) box.appendChild(el('div', 'lam-tit', s.titulo));
    const ex = T4.ex(), cs = s.compases || [3, 7], K = RAP() ? .12 : 1, dur = (B.motor && B.motor._durLinea) || 24;
    const T = x => (x > 1 ? x : x * dur) * K;
    const ens = Object.assign({ arm: 5.4, cascada: 8.4, sos: null, do: 11.2, doDura: 4.9, sib: 17.4, fa: 19.4, afect: 20.7, morfo: 25.4, comp: 27.3 }, s.ens || {}), paso = (s.paso || .25) * K;
    const sub = ex.compases.slice(cs[0], cs[1]), notas = [].concat.apply([], sub), idx = notas.map(n => ex.notas.indexOf(n));
    const fO = ex.key.fifths, fD = ex.destino.fifths, nDif = Math.abs(fD - fO), asc = fD > fO, AF = T4.afectadas(nDif, asc);
    const sol = idx.map(i => E().solNota(ex, i));
    const acc = notas.map(n => (n.alter || 0) !== E().armAlt(n.step, fO));
    const nB = notas.map((n, k) => Object.assign({}, n, { step: sol[k].step, octave: sol[k].octave, alter: acc[k] ? (n.alter || 0) : sol[k].alter }));
    const nC = notas.map((n, k) => Object.assign({}, n, { step: sol[k].step, octave: sol[k].octave, alter: sol[k].alter }));
    const cambia = notas.map((n, k) => acc[k] && (n.alter || 0) !== sol[k].alter);
    const mk = (ns, f) => { const cps = [], it = ns.slice(); sub.forEach((m, ci) => { cps.push(it.splice(0, m.length).map(x => Object.assign({}, x, { compas: ci }))); });
      return { key: { fifths: f }, compas: ex.compas, compases: cps, notas: [].concat.apply([], cps) }; };
    const NS = 'http://www.w3.org/2000/svg', mkS = (tag, at, padre) => { const e = document.createElementNS(NS, tag); Object.keys(at).forEach(k => e.setAttribute(k, at[k])); if (padre) padre.appendChild(e); return e; };
    const pe = el('div', 'tA-pe2'); box.appendChild(pe);
    const rA = el('div', 'tA-fila xoan', '<span class="tA-q">Xoán</span> Clarinete en Si♭ · <b>' + ex.key.name + ' M</b> · ' + T4.arm(fO)), hA = el('div', 'tA-capa a');
    const rB = el('div', 'tA-fila noa', '<span class="tA-q">Noa</span> Saxo alto en Mi♭ · <b>' + ex.destino.name + ' M</b> · ' + T4.arm(fD) + '<span class="tA-int">' + ex.transp.corto + '</span>');
    const fija = el('div', 'tA-fija', nDif + ' ' + (nDif === 1 ? 'diferencia' : 'diferencias') + ' ' + (asc ? '↑' : '↓') + ' · ' + (AF.length === 1 ? 'nota afectada' : 'notas afectadas') + ': <b>' + AF.join(' · ').toUpperCase() + '</b>');
    rB.appendChild(fija);
    const zB = el('div', 'tA-zb'), hB = el('div', 'tA-capa b'), hC = el('div', 'tA-capa c'); zB.appendChild(hB); zB.appendChild(hC);
    const comp = el('div', 'tA-comp');
    [rA, hA, rB, zB, comp].forEach(x => pe.appendChild(x));
    const ov = mkS('svg', { class: 'tA-ov', 'aria-hidden': 'true' }, null); pe.appendChild(ov);
    const et = el('div', 'tA-et'); pe.appendChild(et);
    const opA = { modo: 'orig', otroF: 4, alto: 122, y: 4, W: 900, inicioNotas: 128, sinCompas: true, sinFinal: true, fifths: fO };
    const opB = Object.assign({}, opA, { alto: 150, y: 18, fifths: fD });
    const gA = E().pinta(hA, mk(notas, fO), opA), gB = E().pinta(hB, mk(nB, fD), opB), gC = E().pinta(hC, mk(nC, fD), opB);
    const notasDe = g => [].concat.apply([], g.comps.map(cg => cg.notes.map(n => n.el)));
    const eA = notasDe(gA), eB = notasDe(gB), eC = notasDe(gC);
    /* B: el pentagrama y la clave se ven desde el principio; la armadura, las notas, corchetes y plicas, no. C: solo su nota afectada, después */
    const kB = gB.svg.querySelector('.vf-keysignature'), kidsB = kB ? Array.from(kB.children) : [];
    kidsB.forEach(x => { x.classList.add('tA-fade'); x.style.opacity = '0'; });
    Array.from(gC.svg.children).forEach(x => { x.style.opacity = '0'; });
    eC.forEach(g => { if (g) { g.style.opacity = '0'; g.parentNode && g.parentNode.style && (g.parentNode.style.opacity = ''); } });
    const plicas = sv => Array.from(sv.children).filter(x => x.classList && x.classList.contains('vf-stem'));
    const beams = sv => Array.from(sv.querySelectorAll('.vf-beam'));
    const bB = beams(gB.svg), sB = plicas(gB.svg);
    bB.concat(sB).forEach(x => { x.classList.add('tA-fade'); x.style.opacity = '0'; });
    eB.forEach(g => { if (g) { g.style.opacity = '0'; } });
    const cabeza = g => { const h = g && g.querySelector('.vf-notehead'); if (!h) return null; const b = h.getBBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
    const cerca = (ls, p) => p ? ls.filter(x => { const b = x.getBBox(); return Math.abs(b.x + b.width / 2 - p.x) < 14; }) : [];
    const enBeam = (bs, g) => { const p = cabeza(g); if (!p) return null; let r = null; bs.forEach(b => { const bb = b.getBBox(); if (p.x >= bb.x - 9 && p.x <= bb.x + bb.width + 9) r = b; }); return r; };
    /* posiciones en píxeles del contenedor (la escena va escalada) */
    const esc = () => { const r = pe.getBoundingClientRect(); return { r: r, k: (r.width / (pe.offsetWidth || 1)) || 1 }; };
    const en = (g) => { const h = g && g.querySelector('.vf-notehead'); if (!h) return null; const b = h.getBoundingClientRect(), E2 = esc(); return { x: (b.left + b.width / 2 - E2.r.left) / E2.k, y: (b.top + b.height / 2 - E2.r.top) / E2.k, r: b.height / 2 / E2.k }; };
    const ajustaOv = () => { const w = pe.offsetWidth, h = pe.offsetHeight; ov.setAttribute('viewBox', '0 0 ' + w + ' ' + h); ov.setAttribute('width', w); ov.setAttribute('height', h); };
    const uniones = [];
    const halo = (g, cls, ms) => { const p = en(g); if (!p) return null; ajustaOv(); const r = mkS('rect', { x: p.x - 30, y: p.y - 24, width: 60, height: 48, rx: 10, class: 'tA-halo ' + cls }, ov);
      requestAnimationFrame(() => requestAnimationFrame(() => r.classList.add('on'))); if (ms) setTimeout(() => { r.classList.remove('on'); setTimeout(() => r.remove(), 700); }, ms * 1000 * K); return r; };
    const etiqueta = (txt, cls, g, abajo, ms) => { const p = en(g); if (!p) return null; const r = el('div', 'tA-rot ' + cls + (abajo ? ' abajo' : ''), txt); r.style.left = p.x + 'px'; r.style.top = (p.y + (abajo ? 40 : -40)) + 'px'; et.appendChild(r);
      requestAnimationFrame(() => requestAnimationFrame(() => r.classList.add('on'))); if (ms) setTimeout(() => { r.classList.remove('on'); setTimeout(() => r.remove(), 600); }, ms * 1000 * K); return r; };
    const pareja = (k, cls, ms) => { halo(eA[k], cls, ms); halo(cambia[k] && eC[k] && eC[k].style.opacity === '1' ? eC[k] : eB[k], cls, ms); const u = uniones[k]; if (u) { u.classList.add('fuerte', cls); if (ms) setTimeout(() => u.classList.remove('fuerte'), ms * 1000 * K); } };
    const PCn = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }, MID = n => 12 * (n.octave + 1) + PCn[n.step] + (n.alter || 0);
    const saxo = (n, d) => { try { B.viento.nota('saxo', MID(n) - 9, B.ac().currentTime + .01, d || .3, .38); } catch (e) { } };   // lo que suena el saxo alto (−9)
    const kSos = acc.findIndex((a, k) => a && !cambia[k] && (notas[k].alter || 0) === 1), kNat = acc.findIndex((a, k) => a && !cambia[k] && (notas[k].alter || 0) === 0), kf = cambia.indexOf(true);
    /* 1 · la armadura de Noa entra sostenido a sostenido; el nuevo (sol♯), en cian. Con ella, la etiqueta fija */
    B.espera(T(ens.arm), c).then(ok => { if (!ok || !box.isConnected) return;
      kidsB.forEach((x, i) => B.espera(i * .32 * K, c).then(o => { if (!o) return; x.style.opacity = '1'; if (i >= kidsB.length - nDif) x.classList.add('tA-nuevo'); }));
      B.espera(kidsB.length * .32 * K + .2, c).then(o => { if (o) fija.classList.add('on'); });
      box.classList.add('con-arm'); B.viento.ui('ok'); });
    /* 2 · la cascada: cada nota baja del pentagrama de Xoán al de Noa (una 5.ª J más arriba) y deja su unión */
    B.espera(T(ens.cascada), c).then(ok => { if (!ok || !box.isConnected) return;
      box.classList.add('en-saxo');
      eB.forEach((g, k) => { if (!g) return; B.espera(k * paso, c).then(ok2 => { if (!ok2 || !box.isConnected) return;
        const pa = en(eA[k]), pb = en(g), E2 = esc(), vb = gB.svg.viewBox.baseVal, kb = gB.svg.getBoundingClientRect().width / E2.k / vb.width;
        const dy = pa && pb ? (pa.y - pb.y) / kb : -60;
        g.style.transition = 'none'; g.style.transform = 'translate(0px,' + dy.toFixed(1) + 'px)'; g.getBoundingClientRect();
        g.classList.add('tA-nota'); g.style.transition = ''; g.style.opacity = '1'; g.style.transform = 'translate(0px,0px)';
        if (eA[k]) { eA[k].classList.add('tA-sale'); setTimeout(() => eA[k].classList.remove('tA-sale'), 500); }
        B.espera(.5 * K, c).then(ok3 => { if (!ok3 || !box.isConnected) return; saxo(nB[k]);
          const p = cabeza(g); cerca(sB, p).forEach(x => { x.style.opacity = '1'; });
          const bb = enBeam(bB, g); if (bb && eB.filter(h => h && enBeam(bB, h) === bb).every(h => h.style.opacity === '1')) bb.style.opacity = '1';
          const a2 = en(eA[k]), b2 = en(g); if (a2 && b2) { ajustaOv(); uniones[k] = mkS('line', { x1: a2.x, y1: a2.y + a2.r + 4, x2: b2.x, y2: b2.y - b2.r - 4, class: 'tA-union' }, ov); }
          if (k === kSos && ens.sos == null) pareja(k, 'ambar', 1.8);   // sol♯ ↔ re♯: breve, aunque no lo nombre
        }); }); });
    });
    if (ens.sos != null && kSos >= 0) B.espera(T(ens.sos), c).then(ok => { if (ok && box.isConnected) pareja(kSos, 'ambar', 1.8); });
    /* 3 · do♮ ↔ sol♮: sol NO es nota afectada → el ♮ se queda */
    if (kNat >= 0) B.espera(T(ens.do), c).then(ok => { if (!ok || !box.isConnected) return; pareja(kNat, 'ambar', ens.doDura);
      etiqueta('<b>' + NOMS[nB[kNat].step] + '</b>: NO es nota afectada → el ♮ se queda', 'ambar', eB[kNat], true, ens.doDura + .2); B.viento.ui('ok'); });
    /* 4 · si♭ ↔ fa: fa SÍ es nota afectada → ♭ sube a ♮ (el fa, del color de la etiqueta fija) */
    if (kf >= 0) {
      B.espera(T(ens.sib), c).then(ok => { if (ok && box.isConnected) halo(eA[kf], 'cian', 2.6); });
      B.espera(T(ens.fa), c).then(ok => { if (!ok || !box.isConnected) return; pareja(kf, 'cian', 0); fija.classList.add('brilla');
        etiqueta('<b>' + NOMS[nB[kf].step] + '</b>: SÍ es nota afectada → ♭ sube a ♮', 'cian', eB[kf], true, 0); eB[kf].classList.add('tA-afec'); setTimeout(() => fija.classList.remove('brilla'), 2400 * K); });
      if (ens.afect != null) B.espera(T(ens.afect), c).then(ok => { if (!ok || !box.isConnected) return; fija.classList.remove('brilla'); void fija.offsetWidth; fija.classList.add('brilla'); setTimeout(() => fija.classList.remove('brilla'), 2600 * K); });
      B.espera(T(ens.morfo), c).then(ok => { if (!ok || !box.isConnected) return; const p = en(eB[kf]);
        eB[kf].classList.add('tA-fuera'); eB[kf].style.opacity = '0'; if (eC[kf]) { eC[kf].classList.add('tA-verde'); eC[kf].style.opacity = '1'; }
        fija.classList.add('brilla'); setTimeout(() => fija.classList.remove('brilla'), 2400 * K);
        if (p) { etiqueta('↑ ½ tono · <b>' + T3n(nC[kf]) + '</b>', 'verde', eC[kf] || eB[kf], false, 0); }
        B.viento.ui('ok'); saxo(nC[kf], .6); });
    }
    /* 5 · al final, una junto a la otra: «sol ♮ = ♮» frente a «fa ♭ → ♮» */
    B.espera(T(ens.comp), c).then(ok => { if (!ok || !box.isConnected) return;
      const sim = a => a === 1 ? '♯' : a === -1 ? '♭' : '♮';
      comp.innerHTML = (kNat >= 0 ? '<span class="ambar"><b>' + NOMS[nB[kNat].step] + '</b> ' + sim(nB[kNat].alter) + ' = ' + sim(nC[kNat].alter) + '<small>no es nota afectada</small></span>' : '') +
        (kf >= 0 ? '<span class="cian"><b>' + NOMS[nB[kf].step] + '</b> ' + sim(nB[kf].alter) + ' → ' + sim(nC[kf].alter) + '<small>nota afectada</small></span>' : '');
      B.$$('.tA-rot.ambar, .tA-rot.cian', et).forEach(r => r.classList.remove('on'));
      comp.classList.add('on'); });
  };
  const NOMS = { C: 'do', D: 're', E: 'mi', F: 'fa', G: 'sol', A: 'la', B: 'si' };
  const T3n = n => NOMS[n.step] + (n.alter === 1 ? '♯' : n.alter === -1 ? '♭' : '♮');
  /* (Iago 5-nov) refuerzo visual de t4_013b: el orden de los sostenidos y, al compás de la voz, se iluminan fa · fa do · fa do sol
     s = { titulo, orden: 's' | 'b', pasos: [[t, n], …] } (t en s desde que empieza la frase) */
  L.afectadas = function (box, s, c) {
    if (s.titulo) box.appendChild(el('div', 'lam-tit', s.titulo));
    const ord = s.orden === 'b' ? ORD_B : ORD_S, fila = el('div', 'afx-fila' + (s.orden === 'b' ? ' bem' : '')); box.appendChild(fila);
    const cs = ord.map((n, i) => { const x = el('div', 'afx-n', '<b>' + n + '</b><small>' + (i + 1) + '.º</small>'); fila.appendChild(x); return x; });
    const pie = el('div', 'afx-pie', ''); box.appendChild(pie);
    B.arr(s.pasos).forEach(([t, n]) => B.espera(RAP() ? .05 : t, c).then(ok => {
      if (!ok) return; fila.classList.add('on');
      cs.forEach((x, i) => { const on = i < n; if (on && !x.classList.contains('si')) { x.classList.add('si', 'pop'); setTimeout(() => x.classList.remove('pop'), 700); } else if (!on) x.classList.remove('si'); });
      pie.innerHTML = n ? (n === 1 ? '1 diferencia → <b>' : n + ' diferencias → <b>') + ord.slice(0, n).join(' · ') + '</b>' : '';
      if (n) B.viento.ui('ok');
    }));
  };
  /* (Iago 5-nov 09:10) curiosidad: de bemoles a MENOS bemoles también es subir. La escala de alturas con el salto y, debajo,
     las notas afectadas en el orden de los sostenidos: { titulo, de, a, t, pasos:[[s, n]…] } */
  L.difAfect = function (box, s, c) {
    L.escalaDif(box, { titulo: s.titulo, de: s.de, a: s.a, t: s.t, rotulos: false, todas: s.todas }, c);
    L.afectadas(box, { orden: 's', pasos: s.pasos }, c);
  };
  /* (Iago 5-nov 09:21) refuerzo del narrador: «más ♯ o menos ♭ → ascendentes; más ♭ o menos ♯ → descendentes», con las alteraciones
     apareciendo o desapareciendo una a una. s = { titulo, ens:{ arm, asc, s1, b1, desc, b2, s2 } } (s) */
  L.reglaDif = function (box, s, c) {
    if (s.titulo) box.appendChild(el('div', 'lam-tit', s.titulo));
    const E = s.ens || {}, R = RAP(), cuando = t => B.espera(R ? .05 : t, c);
    const top = el('div', 'rg-top', '<span>Re M <b class="sos">♯♯</b></span><i>→</i><span>La M <b class="sos">♯♯♯</b></span><em>1 alteración más · ' + flecha('asc', 26) + '</em>');
    box.appendChild(top); cuando(E.arm || .4).then(ok => ok && top.classList.add('on'));
    const cols = el('div', 'rg-cols'); box.appendChild(cols);
    /* una fila: glifos que van de n0 a n1 (aparece uno nuevo o se va el último) */
    const fila = (col, gl, n0, n1, txt, t) => {
      const f = el('div', 'rg-f'), g = el('div', 'rg-g ' + (gl === '♯' ? 'sos' : 'bem'));
      for (let i = 0; i < Math.max(n0, n1); i++) { const x = el('b', i < n0 ? 'ya' : 'nuevo', gl); g.appendChild(x); }
      f.appendChild(g); f.appendChild(el('small', '', txt)); col.appendChild(f);
      cuando(t).then(ok => { if (!ok) return; f.classList.add('on');
        B.espera(R ? .05 : .7, c).then(o2 => { if (!o2) return; const bs = B.$$('b', g);
          if (n1 > n0) bs.slice(n0).forEach(x => x.classList.add('entra')); else bs.slice(n1).forEach(x => x.classList.add('sale'));
          try { B.viento.ui('ok'); } catch (e) { } }); });
    };
    const col = (d, t, tit, filas) => { const k = el('div', 'rg-col ' + d), h = el('div', 'rg-cab', flecha(d, 40) + '<b>' + tit + '</b>'); k.appendChild(h); cols.appendChild(k);
      filas.forEach(x => fila(k, ...x)); cuando(t).then(ok => ok && k.classList.add('on')); };
    col('asc', E.asc || 6.8, 'Ascendentes', [['♯', 2, 3, 'más sostenidos', E.s1 || 7.2], ['♭', 3, 2, 'menos bemoles', E.b1 || 8.3]]);
    col('desc', E.desc || 10.5, 'Descendentes', [['♭', 1, 2, 'más bemoles', E.b2 || 11], ['♯', 3, 2, 'menos sostenidos', E.s2 || 12]]);
  };
  /* la tabla resumen (como la de Teoría at home PRO): { titulo, ens } */
  L.tablaDif = function (box, s, c) {
    if (s.titulo) box.appendChild(el('div', 'lam-tit', s.titulo));
    const dur = (B.motor && B.motor._durLinea) || 12;
    const t = el('div', 'tdif'); box.appendChild(t);
    const filas = s.filas || [
      ['', '<b class="sos">' + flecha('asc', 28) + ' Ascendentes</b>', '<b class="bem">' + flecha('desc', 28) + ' Descendentes</b>'],
      ['Cuándo', 'más ♯ o menos ♭', 'más ♭ o menos ♯'],
      ['Notas afectadas, por orden', 'fa · do · sol · re · la · mi · si', 'si · mi · la · re · sol · do · fa'],
      ['Sus alteraciones accidentales', 'suben un semitono<br><span class="tdif-acc">♭ → ♮ · ♮ → ♯ · ♯ → 𝄪</span>', 'bajan un semitono<br><span class="tdif-acc">♯ → ♮ · ♮ → ♭ · ♭ → 𝄫</span>'],
      ['Las notas sin alteraciones accidentales', 'las resuelve la armadura nueva', 'las resuelve la armadura nueva'],
      ['Las demás alteraciones', 'se copian igual: <b>do♮ → sol♮</b> · <b>sol♯ → re♯</b>', 'se copian igual']
    ];
    filas.forEach((f, i) => {
      const r = el('div', 'tdif-f' + (i === 0 ? ' tdif-cab' : ''));   /* (Iago 5-nov 09:21) «cab» chocaba con la cabecera general (position:absolute) */ f.forEach((x, j) => r.appendChild(el('div', 'tdif-c' + (j === 0 ? ' et' : ''), x))); t.appendChild(r);
      const e = (s.ens || [])[i]; if (i === 0) r.classList.add('on'); else B.espera(e == null ? .4 + i * 1.4 : (e > 1 ? e : e * dur), c).then(ok => ok && r.classList.add('on'));
    });
  };
})(window.TR);
