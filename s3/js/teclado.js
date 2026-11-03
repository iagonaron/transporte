/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 3 · utilidades del transporte MENTAL (TR.t3):
     · piano por muestras: las de s3/mus/piano/ (ayudante A, TR.PIANO del inventario) y, si faltan, las de T1 (sonido.js)
     · la canción del recital (TR.MELODIA = t3/melodia.json → data/melodia_t3.js): nombres en español → VexFlow
     · pentagramas con VexFlow (plicas como pauta.plicas, corchetes por pulso, armadura y alteraciones sólo si cambian)
     · TECLADO en pantalla (teclas negras en grupos de 2 y 3, como un piano real) que también se toca con el teclado del
       ordenador: A S D F G H J K = do re mi fa sol la si do · W E = do♯ re♯ · T Y U = fa♯ sol♯ la♯
   Chrome 94 (aula): sin ?. ni ?? ni .at() ni replaceAll.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const T3 = B.t3 = B.t3 || {};
  const el = B.el;

  /* ══════════ PIANO ══════════ */
  const vivos = [];
  const GAN = 1.35;   // (medido 3-nov) las muestras de A (Salamander) quedan 2,6 dB por debajo de las de T1: así suenan igual que el piano de T1
  const listaPiano = () => (B.PIANO || []).filter(x => B.buf[x[0]]);
  T3.pianoRutas = () => (B.PIANO || []).map(x => x[0]);
  T3.piano = function (midi, t, dur, vol) {
    const C = B.ac(); t = t || C.currentTime; dur = dur || .6; vol = vol == null ? .45 : vol;
    const l = listaPiano();
    if (!l.length) { if (window.Sonido) Sonido.nota(midi, t, dur, vol); return; }
    let m = null, d = 99; l.forEach(x => { const dd = Math.abs(x[1] - midi); if (dd < d) { d = dd; m = x; } });
    const s = C.createBufferSource(), g = C.createGain(); s.buffer = B.buf[m[0]]; s.playbackRate.value = Math.pow(2, (midi - m[1]) / 12);
    const v = vol * GAN, suelta = Math.min(dur, s.buffer.duration / s.playbackRate.value - .3);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .004);
    g.gain.setValueAtTime(v, t + Math.max(.01, suelta)); g.gain.exponentialRampToValueAtTime(.0008, t + Math.max(.01, suelta) + .55);
    s.connect(g); g.connect(B.bus.inst); s.start(t); s.stop(t + Math.max(.01, suelta) + .6);
    vivos.push(s); s.onended = () => { const i = vivos.indexOf(s); if (i >= 0) vivos.splice(i, 1); };
  };
  T3.acorde = function (midis, t, dur, vol) { const v = (vol == null ? .3 : vol) / Math.sqrt(Math.max(1, midis.length) * .7); midis.forEach((m, i) => T3.piano(m, t + i * .006, dur, v)); };
  T3.calla = function () { vivos.splice(0).forEach(s => { try { s.stop(); } catch (e) { } }); if (window.Sonido) Sonido.parar(); };

  /* ══════════ TEORÍA ══════════ */
  const PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }, LET = 'cdefgab';
  const ES = { do: 'c', re: 'd', mi: 'e', fa: 'f', sol: 'g', la: 'a', si: 'b' };
  const NOM = { c: 'Do', d: 'Re', e: 'Mi', f: 'Fa', g: 'Sol', a: 'La', b: 'Si' };
  T3.NOM = NOM;
  const SH = 'fcgdaeb', FL = 'beadgcf';
  /* alteraciones de la armadura: fifths > 0 sostenidos, < 0 bemoles → { f: 1, c: 1 } */
  T3.armadura = function (f) { const a = {}; for (let i = 0; i < Math.abs(f || 0); i++) a[(f > 0 ? SH : FL)[i]] = f > 0 ? 1 : -1; return a; };
  T3.midi = (l, a, o) => 12 * (o + 1) + PC[l] + (a || 0);
  T3.nombre = (l, a) => NOM[l] + (a === 1 ? '♯' : a === -1 ? '♭' : '');
  T3.nombrePc = function (pc, f) {   // nombre de una clase de altura con la ortografía de la armadura (sostenidos o bemoles)
    const s = ['Do', 'Do♯', 'Re', 'Re♯', 'Mi', 'Fa', 'Fa♯', 'Sol', 'Sol♯', 'La', 'La♯', 'Si'], b = ['Do', 'Re♭', 'Re', 'Mi♭', 'Mi', 'Fa', 'Sol♭', 'Sol', 'La♭', 'La', 'Si♭', 'Si'];
    return ((f || 0) < 0 ? b : s)[((pc % 12) + 12) % 12];
  };
  /* nota española 'fa#5' | 'si♭4' | 'reb4' → { l, a, o } */
  T3.lee = function (n) {
    const m = /^(do|re|mi|fa|sol|la|si)(#|♯|b|♭|s)?(-?\d)$/i.exec(String(n).trim());
    if (!m) return null;
    return { l: ES[m[1].toLowerCase()], a: m[2] ? (/[#♯s]/.test(m[2]) ? 1 : -1) : 0, o: +m[3] };
  };
  const DUR = { redonda: ['w', 4], blanca_p: ['hd', 3], blanca: ['h', 2], negra_p: ['qd', 1.5], negra: ['q', 1], corchea_p: ['8d', .75], corchea: ['8', .5], semicorchea: ['16', .25] };
  const BEATS = { w: 4, hd: 3, h: 2, qd: 1.5, q: 1, '8d': .75, '8': .5, '16': .25 };
  T3.beats = d => BEATS[d] || 1;
  const nota = (l, a, o, dur, c) => ({ l: l, a: a, o: o, midi: T3.midi(l, a, o), dur: dur, beats: T3.beats(dur), c: c });
  T3.nota = nota;
  /* la canción del recital (TR.MELODIA) → { ton, fifths, num, den, tempo, notas[], compases[[…]], agudo } */
  T3.cancion = function (M) {
    M = M || B.MELODIA || RESERVA;
    const fifths = (function (a) { const m = /^(\d)\s*([#♯b♭])?/.exec(String(a == null ? '0' : a)); return m ? (+m[1]) * (m[2] && /[b♭]/.test(m[2]) ? -1 : 1) : 0; })(M.armadura);
    const cd = String(M.compas || '3/4').split('/').map(Number);
    const notas = [];
    (M.notas || []).forEach((x, i) => {
      const p = T3.lee(x.n), d = DUR[String(x.d).toLowerCase()] || DUR.negra;
      if (!p) return;
      const nn = nota(p.l, p.a, p.o, d[0], (x.c || 1) - 1); nn.i = notas.length; notas.push(nn);
    });
    const compases = []; notas.forEach(n => { (compases[n.c] = compases[n.c] || []).push(n); });
    let t = 0; notas.forEach(n => { n.t = t; t += n.beats; });
    const ag = M.agudo_que_se_rompe || {};
    return { titulo: M.titulo || '', ton: String(M.tono || 'Re M').replace(/\s*M$/, ''), fifths: fifths, num: cd[0], den: cd[1], tempo: M.tempo || 80,
      notas: notas, compases: compases, total: t, agudo: ag.indice_nota != null ? ag.indice_nota : -1, acordes: M.acordes || [], raw: M };
  };
  /* reserva (los 4 primeros compases) por si aún no se ha copiado data/melodia_t3.js */
  const RESERVA = { titulo: 'Cantiga', tono: 'Re M', armadura: '2#', compas: '3/4', tempo: 80, notas: [
    { c: 1, n: 're5', d: 'negra_p' }, { c: 1, n: 'do#5', d: 'corchea' }, { c: 1, n: 'si4', d: 'negra' }, { c: 2, n: 'la4', d: 'negra' }, { c: 2, n: 'fa#4', d: 'negra' }, { c: 2, n: 're4', d: 'negra' },
    { c: 3, n: 'mi4', d: 'negra' }, { c: 3, n: 'fa#4', d: 'negra' }, { c: 3, n: 'sol4', d: 'negra' }, { c: 4, n: 'la4', d: 'blanca_p' }] };
  /* transporta una nota por grados y semitonos (2.ª M ↓ = −1 grado, −2 semitonos) */
  T3.transporta = function (n, pasos, semis) {
    const i = LET.indexOf(n.l) + pasos, l = LET[((i % 7) + 7) % 7], o = n.o + Math.floor(i / 7);
    const a = n.midi + semis - T3.midi(l, 0, o);
    const r = nota(l, a, o, n.dur, n.c); r.i = n.i; r.t = n.t; return r;
  };
  /* cifrado americano → acorde (midis) una 2.ª M más grave si semis = −2: bajo en la 2.ª octava, acorde cerrado en la 3.ª */
  T3.acordeDe = function (cif, semis) {
    const m = /^([A-G])([#b]?)(m?)(7?)/.exec(cif); if (!m) return null;
    let r = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (semis || 0); r = ((r % 12) + 12) % 12;
    const tri = [0, m[3] ? 3 : 4, 7].concat(m[4] ? [10] : []);
    const bajo = 36 + r + (r < 4 ? 12 : 0), base = 48 + r + (r > 7 ? -12 : 0);
    return { bajo: bajo, notas: tri.map(x => base + x).map(x => x > 60 ? x - 12 : x) };
  };

  /* ══════════ PENTAGRAMA (VexFlow) ══════════
     T3.pinta(host, compases, op) → { svg, W, H, notas:[{ i, x, el, n }], staves }
       compases: [[nota…], …] (nota = { l, a, o, dur, i }) · op = { fifths, num, den, clef:'treble', ancho:W (viewBox), alto, y,
         primera (clave + armadura + compás en el primero), final (doble barra al final), color(i) → color | null, tinta,
         ancho1 (anchura extra del primer compás), fantasma: 'tenor' (capa aparte con la clave de do en 4.ª, ver T3.fantasma) } */
  const NS = 'http://www.w3.org/2000/svg';
  const base = d => d === 'qd' ? 'q' : d === 'hd' ? 'h' : d === '8d' ? '8' : d, punto = d => /d$/.test(d);
  const keyDe = n => n.l + (n.a === 1 ? '#' : n.a === -1 ? 'b' : n.a === 2 ? '##' : n.a === -2 ? 'bb' : '') + '/' + n.o;
  const KS_P = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'], KS_N = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
  T3.ks = f => f >= 0 ? KS_P[f] : KS_N[-f];
  T3.armTxt = f => !f ? 'sin alteraciones' : Math.abs(f) + (f > 0 ? '♯' : '♭');
  T3.pinta = function (host, compases, op) {
    op = op || {};
    const VF = Vex.Flow; host.innerHTML = '';
    const W = op.ancho || 1600, H = op.alto || 150, y0 = op.y == null ? 14 : op.y, tinta = op.tinta || '#eaf3ff';
    const r = new VF.Renderer(host, VF.Renderer.Backends.SVG); r.resize(W, H);
    const ctx = r.getContext(); ctx.setFillStyle(tinta); ctx.setStrokeStyle(tinta);
    const svg = host.querySelector('svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.removeAttribute('width'); svg.removeAttribute('height'); svg.style.width = '100%'; svg.style.height = 'auto';
    const f = op.fifths || 0, arm = T3.armadura(f), primera = op.primera !== false;
    const extra = primera ? (op.ancho1 != null ? op.ancho1 : 92 + Math.max(2, Math.abs(f)) * 11 + (op.sinCompas ? 0 : 30)) : 14;
    const L = op.margen == null ? 6 : op.margen, n = compases.length, wR = (W - L - 10 - extra) / n;
    let x = L;
    const geo = { svg: svg, W: W, H: H, notas: [], staves: [] };
    compases.forEach((mn, ci) => {
      const wC = ci === 0 ? wR + extra : wR;
      const st = new VF.Stave(x, y0, wC);
      if (ci === 0 && primera) { st.addClef(op.clef || 'treble'); if (f) st.addKeySignature(T3.ks(f)); if (!op.sinCompas) st.addTimeSignature((op.num || 3) + '/' + (op.den || 4)); }
      if (ci === n - 1 && op.final) st.setEndBarType(VF.Barline.type.END);
      st.setContext(ctx).draw(); geo.staves.push(st);
      const sns = mn.map(nn => {
        const sn = new VF.StaveNote({ keys: [keyDe(nn)], duration: base(nn.dur), clef: op.clef || 'treble', auto_stem: true });
        const enArm = arm[nn.l] || 0;
        if (nn.a !== enArm) sn.addModifier(new VF.Accidental(nn.a === 1 ? '#' : nn.a === -1 ? 'b' : 'n'), 0);
        if (punto(nn.dur)) VF.Dot.buildAndAttach([sn], { all: true });
        const col = (op.color && op.color(nn.i)) || tinta;
        sn.setStyle({ fillStyle: col, strokeStyle: col }); sn.setLedgerLineStyle({ fillStyle: col, strokeStyle: col, lineWidth: 1.6 });
        sn.getModifiers().forEach(m => m.setStyle && m.setStyle({ fillStyle: col, strokeStyle: col }));
        sn._col = col;
        return sn;
      });
      const voice = new VF.Voice({ num_beats: op.num || 3, beat_value: op.den || 4 }).setStrict(false).addTickables(sns);
      /* corchetes por PULSO (solo corcheas/semicorcheas seguidas dentro del mismo pulso), plicas iguales en el grupo */
      const beams = [], PB = (op.den || 4) === 8 ? 1.5 : 1; let pos = 0, grupo = [], pulso = -1;
      const cierra = () => { if (grupo.length > 1) { B.pauta.plicas(grupo); beams.push(new VF.Beam(grupo)); } grupo = []; };
      mn.forEach((nn, ki) => {
        const p = Math.floor(pos / PB + 1e-6);
        if (nn.dur === '8' || nn.dur === '16') { if (p !== pulso) cierra(); grupo.push(sns[ki]); pulso = p; } else { cierra(); pulso = -1; }
        pos += nn.beats;
      });
      cierra();
      let area; try { area = (x + wC - 14) - st.getNoteStartX(); } catch (e) { area = wC - 30; }
      new VF.Formatter().joinVoices([voice]).format([voice], Math.max(40, area));
      beams.forEach(b => { const ns = b.getNotes ? b.getNotes() : [], c = ns.length && ns.every(z => z._col === ns[0]._col) ? ns[0]._col : tinta; b.setStyle({ fillStyle: c, strokeStyle: c }); });
      voice.draw(ctx, st); beams.forEach(b => b.setContext(ctx).draw());
      sns.forEach((sn, ki) => { let cx; try { cx = sn.getAbsoluteX() + 7; } catch (e) { cx = x + wC / 2; } geo.notas.push({ i: mn[ki].i, x: cx, el: sn.getSVGElement ? sn.getSVGElement() : null, n: mn[ki], st: st, sn: sn }); });
      x += wC;
    });
    geo.yTop = geo.staves[0].getYForLine(0); geo.yBot = geo.staves[0].getYForLine(4);
    return geo;
  };
  /* capa «fantasma»: la clave de do en 4.ª encima de la de sol (mismo pentagrama), en cian translúcido, y la armadura
     tachada con «Do M» encima. host2 = un div superpuesto exactamente al del pentagrama (mismo ancho). */
  T3.fantasma = function (host2, geo, op) {
    op = op || {};
    const VF = Vex.Flow; host2.innerHTML = '';
    const r = new VF.Renderer(host2, VF.Renderer.Backends.SVG); r.resize(geo.W, geo.H);
    const ctx = r.getContext(), COL = op.color || '#63e6ff'; ctx.setFillStyle(COL); ctx.setStrokeStyle(COL);
    const svg = host2.querySelector('svg'); svg.setAttribute('viewBox', '0 0 ' + geo.W + ' ' + geo.H); svg.removeAttribute('width'); svg.removeAttribute('height'); svg.style.width = '100%'; svg.style.height = 'auto';
    const s0 = geo.staves[0];
    /* sólo la clave: el pentagrama (líneas y barras) ya está debajo */
    const st = new VF.Stave(s0.getX(), s0.getY(), 90); st.addClef('tenor');
    st.setConfigForLines([0, 1, 2, 3, 4].map(() => ({ visible: false }))); st.setBegBarType(VF.Barline.type.NONE); st.setEndBarType(VF.Barline.type.NONE);
    st.setContext(ctx).draw();
    /* (revisión C4) la clave de sol, tenue y un poco a la izquierda; la de do en 4.ª, en su sitio; la armadura original, muy suave
       (sin tachar) y «Do M» encima del pentagrama, sin tapar nada */
    const sol = geo.svg.querySelector('.vf-clef'); if (sol) sol.classList.add('fan-sol');   // (CSS) tenue y 40 px a la izquierda
    const kg = geo.svg.querySelector('.vf-keysignature'); if (kg) kg.classList.add('fan-armsuave');
    if (op.tachaArm != null) {
      let ax = s0.getX() + 60;
      try { if (kg && kg.getBBox) { const bb = kg.getBBox(); if (bb.width > 0) ax = bb.x + bb.width / 2; } } catch (e) { }
      const tx = document.createElementNS(NS, 'text'); tx.setAttribute('x', ax); tx.setAttribute('y', geo.yTop - 20); tx.setAttribute('text-anchor', 'middle'); tx.setAttribute('class', 'fan-arm');
      tx.textContent = op.armTxt || 'Do M'; svg.appendChild(tx);
    }
    return svg;
  };
  /* posición en el pentagrama (0 = 1.ª línea) de una nota en clave de sol y su lectura en clave de do en 4.ª (+ 8.ª) */
  T3.pos = n => (LET.indexOf(n.l) + n.o * 7) - (LET.indexOf('e') + 4 * 7);
  T3.lugar = function (p) {   // 'la 2.ª línea' · 'el 3.er espacio' · 'la 1.ª línea adicional por debajo'…
    const ord = k => ['1.ª', '2.ª', '3.ª', '4.ª', '5.ª'][k - 1] || (k + '.ª'), ordM = k => ['1.er', '2.º', '3.er', '4.º'][k - 1] || (k + '.º');
    if (p >= 0 && p <= 8) return p % 2 === 0 ? 'la ' + ord(p / 2 + 1) + ' línea' : 'el ' + ordM((p + 1) / 2) + ' espacio';
    if (p === -1) return 'el espacio de debajo del pentagrama';
    if (p === 9) return 'el espacio de encima del pentagrama';
    if (p < -1) return p % 2 === 0 ? 'la ' + ord(-p / 2) + ' línea adicional por debajo' : 'el espacio bajo la ' + ord((-p - 1) / 2) + ' línea adicional';
    return p % 2 === 0 ? 'la ' + ord((p - 8) / 2) + ' línea adicional por encima' : 'el espacio sobre la ' + ord((p - 9) / 2) + ' línea adicional';
  };
  /* en clave de do en 4.ª, el mismo sitio se lee una 9.ª más abajo; «una octava más arriba» = una 2.ª más abajo */
  T3.enTenor = function (n) { const i = LET.indexOf(n.l) - 1, l = LET[(i + 7) % 7], o = n.o + (i < 0 ? -1 : 0); return { l: l, o: o, a: 0, midi: T3.midi(l, 0, o) }; };

  /* ══════════ TECLADO ══════════
     T3.teclado(host, { desde: 60, hasta: 83, nombres: true, letras: true, base: 60, alTocar(midi, porTecla) }) → api
     api.marca(midi, cls, ms) · api.luz(midi | null) · api.fuera() (quita el oyente del teclado del ordenador) */
  const NEG = { 1: 1, 3: 1, 6: 1, 8: 1, 10: 1 };
  const CODIGO = { KeyA: 0, KeyW: 1, KeyS: 2, KeyE: 3, KeyD: 4, KeyF: 5, KeyT: 6, KeyG: 7, KeyY: 8, KeyH: 9, KeyU: 10, KeyJ: 11, KeyK: 12 };
  const LETRA = { 0: 'A', 1: 'W', 2: 'S', 3: 'E', 4: 'D', 5: 'F', 6: 'T', 7: 'G', 8: 'Y', 9: 'H', 10: 'U', 11: 'J', 12: 'K' };
  T3.teclado = function (host, cfg) {
    cfg = cfg || {};
    const desde = cfg.desde || 60, hasta = cfg.hasta || 83, baseK = cfg.base == null ? desde : cfg.base;
    const tec = el('div', 't3-teclado'); host.appendChild(tec);
    const blancas = []; for (let m = desde; m <= hasta; m++) if (!NEG[m % 12]) blancas.push(m);
    const ancho = 100 / blancas.length, teclas = {};
    blancas.forEach((m, k) => {
      const t = el('div', 't3-tb'); t.dataset.m = m; t.style.left = (k * ancho) + '%'; t.style.width = ancho + '%';
      const pc = m % 12, nm = ['Do', '', 'Re', '', 'Mi', 'Fa', '', 'Sol', '', 'La', '', 'Si'][pc];
      t.innerHTML = '<i class="t3-nom">' + (cfg.nombres === false ? '' : nm) + '</i>' + (cfg.letras !== false && m - baseK >= 0 && m - baseK <= 12 ? '<u>' + LETRA[m - baseK] + '</u>' : '');
      tec.appendChild(t); teclas[m] = t;
    });
    for (let m = desde; m <= hasta; m++) if (NEG[m % 12]) {
      const k = blancas.indexOf(m - 1); if (k < 0) continue;
      const t = el('div', 't3-tn'); t.dataset.m = m; t.style.left = ((k + 1) * ancho - ancho * .31) + '%'; t.style.width = (ancho * .62) + '%';
      if (cfg.letras !== false && m - baseK >= 0 && m - baseK <= 12) t.innerHTML = '<u>' + LETRA[m - baseK] + '</u>';
      tec.appendChild(t); teclas[m] = t;
    }
    let bloq = false;
    const toca = (m, porTecla) => { if (bloq) return; const t = teclas[m]; if (t) { t.classList.add('pulsa'); setTimeout(() => t.classList.remove('pulsa'), 160); } if (cfg.alTocar) cfg.alTocar(m, !!porTecla); };
    tec.addEventListener('pointerdown', ev => { const t = ev.target.closest('.t3-tb,.t3-tn'); if (!t) return; ev.preventDefault(); ev.stopPropagation(); toca(+t.dataset.m, false); });
    const kd = ev => {
      if (ev.repeat || ev.ctrlKey || ev.metaKey || ev.altKey) return;
      if (/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) return;
      const o = CODIGO[ev.code]; if (o == null) return;
      ev.preventDefault(); toca(baseK + o, true);
    };
    document.addEventListener('keydown', kd);
    const api = {
      el: tec, teclas: teclas,
      marca(m, cls, ms) { const t = teclas[m]; if (!t) return; t.classList.add(cls); setTimeout(() => t.classList.remove(cls), ms || 420); },
      luz(m) { Object.keys(teclas).forEach(k => teclas[k].classList.toggle('luz', +k === m)); },
      bloquea(on) { bloq = !!on; tec.classList.toggle('bloq', bloq); },
      fuera() { document.removeEventListener('keydown', kd); }
    };
    return api;
  };
  /* la tecla pulsada, llevada a la octava más cercana a la que se espera (con el teclado del ordenador se toca en una sola octava) */
  T3.aOctava = function (m, objetivo) { if (objetivo == null) return m; let x = m; while (x - objetivo > 6) x -= 12; while (objetivo - x > 6) x += 12; return x; };

  /* ══════════ BOTONES ══════════ */
  T3.btn = (txt, cls, fn, tit) => { const b = el('button', cls || '', txt); b.type = 'button'; if (tit) { b.title = tit; b.setAttribute('aria-label', tit); } if (fn) b.addEventListener('click', ev => { ev.stopPropagation(); fn(b); }); return b; };
})(window.TR);
