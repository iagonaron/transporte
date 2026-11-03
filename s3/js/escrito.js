/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 2 · TRANSPORTE ESCRITO — la mecánica EXACTA de TR_ESC de Teoría PRO (teoriapro/index.html ~15028–15909,
   montarEscrito 16349–16430), adaptada a la estética de Transporte, a Chrome 94 (sin ?. ni ??) y a ratón + táctil:
     · generar(nivel): 7 tonalidades Mayores (Do, Sol, Re, Fa, Si♭, La, Mi♭), compás 2/4, 3/4 o 6/8, 3 compases (2 de ritmo
       libre + 1 de resolución), melodía diatónica (empieza y acaba en tónica, mayoría de 2.ªs, semicorcheas por grado
       conjunto, sin repeticiones, ámbito Sol3–Do6), 7 transportes; se descartan |armadura destino| > 4 o fuera de La3–La5.
       (T2) nivel 1 · 2 · 3 = dificultad creciente (tonalidades, transportes, compases y figuras).
     · el alumno: rueda de tonalidad nueva (nota + ♭/♯ + M/m), rueda de armadura, coloca cada nota con clic/toque y nota
       fantasma (el ritmo se pone solo), ♭ ♮ ♯ sobre la nota seleccionada (alteraciones «neutras»), ↶ Deshacer con pila, × para borrar.
     · corrección: 50 % tonalidad + armadura (en paquete: todo o nada) + 50 % alturas (nombre de la cabeza y octava);
       cada nota se pinta verde/roja según su altura REAL contando la armadura que puso el alumno.
   TR.escrito = { generar(nivel), fijo(def), panel(host, ex, cfg) → api, pinta(host, ex, op), puntua(ex), sonar(ex, cual) }
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const E = B.escrito = {};
  const STEPS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'], ST = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const ES = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' };
  const SH = ['F', 'C', 'G', 'D', 'A', 'E', 'B'], FL = ['B', 'E', 'A', 'D', 'G', 'C', 'F'];
  const midi = (s, o, a) => 12 * (o + 1) + ST[s] + (a || 0);
  const rint = n => Math.floor(Math.random() * n), pick = a => a[rint(a.length)];
  const KS_POS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'], KS_NEG = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
  const ksName = f => f >= 0 ? KS_POS[f] : KS_NEG[-f];
  E.ksName = ksName;
  const accTxt = a => a === 1 ? '♯' : a === -1 ? '♭' : '';
  E.armTxt = f => f == null ? '—' : f === 0 ? 'sin alteraciones' : Math.abs(f) + (f > 0 ? '♯' : '♭');

  const KEYS = [
    { name: 'Do', step: 'C', alter: 0, fifths: 0 }, { name: 'Sol', step: 'G', alter: 0, fifths: 1 }, { name: 'Re', step: 'D', alter: 0, fifths: 2 },
    { name: 'Fa', step: 'F', alter: 0, fifths: -1 }, { name: 'Si♭', step: 'B', alter: -1, fifths: -2 }, { name: 'La', step: 'A', alter: 0, fifths: 3 },
    { name: 'Mi♭', step: 'E', alter: -1, fifths: -3 }];
  const TRANSPORTES = [
    { lbl: '2.ª Mayor ascendente', corto: '2.ª M ↑', semis: 2, dir: 1, dgrado: 1 }, { lbl: '2.ª menor ascendente', corto: '2.ª m ↑', semis: 1, dir: 1, dgrado: 1 },
    { lbl: '3.ª Mayor ascendente', corto: '3.ª M ↑', semis: 4, dir: 1, dgrado: 2 }, { lbl: '3.ª menor ascendente', corto: '3.ª m ↑', semis: 3, dir: 1, dgrado: 2 },
    { lbl: '2.ª Mayor descendente', corto: '2.ª M ↓', semis: 2, dir: -1, dgrado: 1 }, { lbl: '3.ª menor descendente', corto: '3.ª m ↓', semis: 3, dir: -1, dgrado: 2 },
    { lbl: '3.ª Mayor descendente', corto: '3.ª M ↓', semis: 4, dir: -1, dgrado: 2 }];
  E.TRANSPORTES = TRANSPORTES;
  function escalaMayor(key) {
    const acc = {};
    if (key.fifths > 0) for (let i = 0; i < key.fifths; i++) acc[SH[i]] = 1;
    else if (key.fifths < 0) for (let j = 0; j < -key.fifths; j++) acc[FL[j]] = -1;
    const ti = STEPS.indexOf(key.step), esc = [];
    for (let g = 0; g < 7; g++) { const st = STEPS[(ti + g) % 7]; esc.push({ step: st, alter: acc[st] || 0 }); }
    return esc;
  }
  const RIT_34 = [['q', 'q', 'q'], ['h', 'q'], ['q', 'h'], ['q', '8', '8', 'q'], ['8', '8', 'q', 'q'], ['q', 'q', '8', '8'], ['8', '8', '8', '8', 'q'],
    ['qd', '8', 'q'], ['q', 'qd', '8'], ['qd', '8', '8', '8'], ['16', '16', '16', '16', 'q', 'q'], ['q', '16', '16', '16', '16', 'q'], ['8', '8', 'q', '8', '8']];
  const RIT_24 = [['q', 'q'], ['h'], ['q', '8', '8'], ['8', '8', 'q'], ['8', '8', '8', '8'], ['qd', '8'], ['q', '16', '16', '8'], ['16', '16', '8', 'q'], ['8', '8', '16', '16', '8']];
  const RIT_68 = [['qd', 'qd'], ['8', '8', '8', 'qd'], ['qd', '8', '8', '8'], ['8', '8', '8', '8', '8', '8'], ['q', '8', 'qd'], ['qd', 'q', '8'], ['8', '8', '8', 'q', '8'], ['q', '8', '8', '8', '8']];
  const durBeats = d => d === 'w' ? 4 : d === 'hd' ? 3 : d === 'h' ? 2 : d === 'q' ? 1 : d === 'qd' ? 1.5 : d === '8' ? .5 : d === '16' ? .25 : 1;
  E.durBeats = durBeats;
  /* (T2) dificultad creciente: 1 = tonalidades sencillas, 2.ª Mayor, 2/4 y 3/4 sin semicorcheas ni puntillos;
     2 = las 7 tonalidades, 2.ªs y 3.ªs menores, también 6/8, sin semicorcheas; 3 = todo, como Teoría PRO */
  const NIVEL = {
    1: { keys: ['Do', 'Sol', 'Fa', 'Re'], tr: [0, 4], comp: ['2/4', '3/4'], sin: ['16', 'qd'], maxF: 3 },
    2: { keys: null, tr: [0, 1, 3, 4, 5], comp: ['2/4', '3/4', '6/8'], sin: ['16'], maxF: 4 },
    3: { keys: null, tr: [0, 1, 2, 3, 4, 5, 6], comp: ['2/4', '3/4', '6/8'], sin: [], maxF: 4 }
  };
  E.generar = function (nivel) {
    for (let i = 0; i < 300; i++) { const c = intenta(NIVEL[nivel] || NIVEL[3]); if (c) return c; }
    return intenta(NIVEL[1], true);
  };
  function intenta(N, forzar) {
    const keys = N.keys ? KEYS.filter(k => N.keys.indexOf(k.name) >= 0) : KEYS;
    const key = forzar ? KEYS[0] : pick(keys), esc = escalaMayor(key);
    const CD = { '2/4': { num: 2, den: 4, rit: RIT_24 }, '3/4': { num: 3, den: 4, rit: RIT_34 }, '6/8': { num: 6, den: 8, rit: RIT_68 } };
    const compasDef = CD[pick(N.comp)], beats = compasDef.num * (4 / compasDef.den), oct0 = 4, NCOMP = 3;
    const ritOk = compasDef.rit.filter(p => !p.some(d => N.sin.indexOf(d) >= 0));
    const patrones = [];
    for (let c = 0; c < NCOMP - 1; c++) {
      let pat = pick(ritOk.length ? ritOk : compasDef.rit);
      const suma = pat.reduce((a, d) => a + durBeats(d), 0);
      if (Math.abs(suma - beats) > .01) { pat = []; let acc = 0; while (acc < beats) { pat.push('q'); acc++; } }
      patrones.push(pat);
    }
    patrones.push(Math.abs(beats - 3) < .01 ? ['hd'] : Math.abs(beats - 2) < .01 ? ['h'] : ['q', 'q']);
    const figs = []; patrones.forEach((pat, ci) => pat.forEach(d => figs.push({ dur: d, is16: d === '16', compas: ci })));
    const total = figs.length;
    let escN = [];
    for (let oc = oct0 - 2; oc <= oct0 + 2; oc++) for (let g = 0; g < 7; g++) escN.push({ step: esc[g].step, alter: esc[g].alter, octave: oc, midi: midi(esc[g].step, oc, esc[g].alter) });
    escN.sort((a, b) => a.midi - b.midi); escN = escN.filter(n => n.midi >= 55 && n.midi <= 84);
    const NMAX = escN.length - 1, cl = i => Math.max(0, Math.min(NMAX, i));
    let iTon = 0, bd = 999; escN.forEach((n, i) => { if (n.step === key.step && Math.abs(n.alter) === Math.abs(esc[0].alter)) { const d = Math.abs(n.octave - oct0); if (d < bd) { bd = d; iTon = i; } } });
    const idxs = new Array(total); idxs[0] = iTon; idxs[total - 1] = iTon;
    if (total >= 3) idxs[total - 2] = cl(iTon + (Math.random() < .6 ? 1 : -1));
    let lastLeapDir = 0, leapStreak = 0, cooldown = 0;
    for (let pi = 1; pi < total - 2; pi++) {
      const prevI = idxs[pi - 1]; let step;
      const conj = figs[pi].is16 || (pi > 0 && figs[pi - 1].is16);
      if (conj) { step = Math.random() < .5 ? -1 : 1; leapStreak = 0; lastLeapDir = 0; cooldown = 0; }
      else if (cooldown > 0) { step = -Math.sign(lastLeapDir || 1); cooldown = 0; leapStreak = 0; lastLeapDir = 0; }
      else {
        const rr = Math.random();
        if (rr < .85) { step = Math.random() < .5 ? -1 : 1; leapStreak = 0; lastLeapDir = 0; }
        else if (rr < .97) { let d3 = Math.random() < .5 ? -1 : 1; if (leapStreak >= 1 && lastLeapDir !== 0) d3 = lastLeapDir; step = d3 * 2; if (lastLeapDir === d3) leapStreak++; else leapStreak = 1; lastLeapDir = d3; if (leapStreak >= 2) cooldown = 1; }
        else { step = Math.random() < .5 ? -3 : 3; lastLeapDir = Math.sign(step); leapStreak = 0; cooldown = 1; }
      }
      let ni = cl(prevI + step);
      if (conj && Math.abs(ni - prevI) !== 1) { ni = cl(prevI - step); if (Math.abs(ni - prevI) !== 1) ni = prevI + 1 <= NMAX ? prevI + 1 : prevI - 1; }
      if (ni === prevI) { ni = cl(prevI + (step >= 0 ? 1 : -1)); if (ni === prevI) ni = prevI + 1 <= NMAX ? prevI + 1 : prevI - 1; }
      idxs[pi] = ni;
    }
    const notas = []; let ig = 0;
    patrones.forEach((pat, cc) => pat.forEach(d => { const r = escN[idxs[ig++]]; notas.push({ step: r.step, octave: r.octave, alter: r.alter, midi: r.midi, dur: d, compas: cc }); }));
    const idxDe = nn => { for (let i = 0; i < escN.length; i++) if (escN[i].midi === nn.midi) return i; return -1; };
    const ponI = (nn, i) => { i = cl(i); const r = escN[i]; nn.step = r.step; nn.octave = r.octave; nn.alter = r.alter; nn.midi = r.midi; };
    for (let pass = 0; pass < 5; pass++) {
      let cambios = 0;
      for (let q2 = 1; q2 < notas.length - 1; q2++) { let g2 = 0; while (Math.abs(notas[q2].midi - notas[q2 - 1].midi) > 7 && g2 < 6) { ponI(notas[q2], idxDe(notas[q2]) + (notas[q2].midi > notas[q2 - 1].midi ? -1 : 1)); g2++; cambios++; } }
      for (let q = 1; q < notas.length; q++) {
        const ult = q === notas.length - 1, semi = notas[q].dur === '16' || notas[q - 1].dur === '16', iv = Math.abs(notas[q].midi - notas[q - 1].midi);
        if (!ult && semi && iv > 2) { ponI(notas[q], idxDe(notas[q - 1]) + (notas[q].midi > notas[q - 1].midi ? 1 : -1)); cambios++; }
        if (!ult && notas[q].midi === notas[q - 1].midi) { const ci = idxDe(notas[q]); let n2 = cl(ci + 1); if (escN[n2].midi === notas[q - 1].midi) n2 = cl(ci - 1); if (notas[q + 1] && escN[n2].midi === notas[q + 1].midi) n2 = cl(ci + (n2 > ci ? -1 : 1)); ponI(notas[q], n2); cambios++; }
      }
      if (!cambios) break;
    }
    const transp = forzar ? TRANSPORTES[0] : TRANSPORTES[pick(N.tr)];
    const destino = calcularDestino(key, transp);
    if (Math.abs(destino.fifths) > N.maxF) return null;
    const tm = notas.map(n => n.midi + transp.dir * transp.semis);
    if (Math.min.apply(null, tm) < 57 || Math.max.apply(null, tm) > 81) return null;
    const om = notas.map(n => n.midi);
    if (Math.min.apply(null, om) < 55 || Math.max.apply(null, om) > 81) return null;
    if (!notas.some(n => n.dur === '8') && !forzar) return null;
    return monta(key, compasDef, notas, transp, destino);
  }
  function monta(key, compasDef, notas, transp, destino) {
    const compases = []; notas.forEach(n => { (compases[n.compas] = compases[n.compas] || []).push(n); });
    return { key: key, compas: { num: compasDef.num, den: compasDef.den }, compases: compases, notas: notas, transp: transp, destino: destino,
      aluNotas: notas.map(() => null), aluTon: null, aluArm: null, aluTonNat: null, aluTonAlt: 0, aluTonModo: 'M', aluModoElegido: false, undo: [] };
  }
  function calcularDestino(key, transp) {
    const ti = STEPS.indexOf(key.step), ns = STEPS[(ti + transp.dir * transp.dgrado + 700) % 7];
    const obj = midi(key.step, 4, key.alter) + transp.dir * transp.semis;
    let oct = 4; while (midi(ns, oct, 0) < obj - 6) oct++; while (midi(ns, oct, 0) > obj + 6) oct--;
    const alter = obj - midi(ns, oct, 0), fifths = { F: -1, C: 0, G: 1, D: 2, A: 3, E: 4, B: 5 }[ns] + alter * 7;
    return { step: ns, alter: alter, fifths: fifths, name: ES[ns] + accTxt(alter) };
  }
  E.calcularDestino = calcularDestino;
  /* (T2) melodía fija (la del himno del guion): def = { ton:'Sol', compas:'3/4', notas:[['g/4','q'], …] (compás por compás: [[…],[…]]), transp: índice } */
  E.fijo = function (def) {
    const key = KEYS.filter(k => k.name === def.ton)[0], cd = def.compas.split('/').map(Number);
    const notas = [];
    def.compases.forEach((cm, ci) => cm.forEach(x => { const m = /^([a-g])(#|b)?\/(\d)$/.exec(x[0]); const st = m[1].toUpperCase(), al = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0, oc = +m[3];
      notas.push({ step: st, octave: oc, alter: al, midi: midi(st, oc, al), dur: x[1], compas: ci }); }));
    const transp = TRANSPORTES[def.transp];
    return monta(key, { num: cd[0], den: cd[1] }, notas, transp, calcularDestino(key, transp));
  };

  /* ── teoría de la corrección (idéntica a Teoría PRO) ── */
  function inKS(step, alt, f) { if (f == null || f === 0) return false; if (f > 0 && alt === 1) return SH.slice(0, f).indexOf(step) >= 0; if (f < 0 && alt === -1) return FL.slice(0, -f).indexOf(step) >= 0; return false; }
  function alterEfectiva(alu, fifths) {
    if (alu.alter === 1 || alu.alter === -1) return alu.alter;
    if (alu.nat) return 0;   // (T2) becuadro explícito: natural aunque la armadura diga otra cosa
    if (fifths == null || fifths === 0) return 0;
    if (fifths > 0 && SH.slice(0, fifths).indexOf(alu.step) >= 0) return 1;
    if (fifths < 0 && FL.slice(0, -fifths).indexOf(alu.step) >= 0) return -1;
    return 0;
  }
  E.midiAlu = (ex, alu) => midi(alu.step, alu.octave, alterEfectiva(alu, ex.aluArm));
  const correctaAltura = (ex, gi, alu) => E.midiAlu(ex, alu) === ex.notas[gi].midi + ex.transp.dir * ex.transp.semis;
  function stepTransportado(orig, transp) {
    const ti = STEPS.indexOf(orig.step), p = transp.dir * transp.dgrado;
    return { step: STEPS[(ti + p + 700) % 7], octave: orig.octave + Math.floor((ti + p) / 7) };
  }
  E.stepTransportado = stepTransportado;
  E.okTon = ex => ex.aluTon != null && ex.aluTon === ex.destino.name && !(ex.aluModoElegido && ex.aluTonModo === 'm');
  E.okArm = ex => ex.aluArm != null ? ex.aluArm === ex.destino.fifths : ex.destino.fifths === 0;
  E.puntua = function (ex) {
    let p = (E.okTon(ex) && E.okArm(ex)) ? .5 : 0, ok = 0;
    ex.notas.forEach((n, i) => { const a = ex.aluNotas[i]; if (!a) return; const s = stepTransportado(n, ex.transp); if (a.step === s.step && a.octave === s.octave) ok++; });
    return p + .5 * (ex.notas.length ? ok / ex.notas.length : 0);
  };
  E.notasMal = ex => ex.notas.map((n, i) => { const a = ex.aluNotas[i]; return !a || !correctaAltura(ex, i, a); });

  /* ══════════ PENTAGRAMA (VexFlow) ══════════
     op = { modo:'orig'|'alu', fifths, otroF (para alinear compases entre los dos pentagramas), hl (índice resaltado en ámbar),
            sel (nota seleccionada), corr (pinta verde/rojo), notas (lista alternativa: p. ej. la solución) }  → geo */
  const W = 1000;
  /* (3-nov) dos pieles de tinta: «onda» (2100, futurista) y «época» (Santiago, 1730: tinta sepia sobre papel, resalte en almagre).
     La piel la decide el contenedor: si está dentro de .epoca, se pinta en tinta. */
  const PIEL = {
    onda: { tinta: '#eaf3ff', resalte: '#ffb547', verde: '#7dffa8', rojo: '#ff6b6b', apagada: 'rgba(234,243,255,.35)', fantasma: 'rgba(99,230,255,.75)', fondoX: 'rgba(6,12,29,.92)' },
    epoca: { tinta: '#26180c', resalte: '#a8321b', verde: '#2c6a27', rojo: '#c0261c', apagada: 'rgba(38,24,12,.3)', fantasma: 'rgba(38,24,12,.42)', fondoX: '#f3e6c6' } };
  const pal = h => (h && h.closest && h.closest('.epoca')) ? PIEL.epoca : PIEL.onda;
  E.pal = pal;
  const baseDur = d => d === 'qd' ? 'q' : d === 'hd' ? 'h' : d, conPunto = d => d === 'qd' || d === 'hd';
  const keyDe = n => n.step.toLowerCase() + (n.alter === 1 ? '#' : n.alter === -1 ? 'b' : '') + '/' + n.octave;
  E.pinta = function (host, ex, op) {
    op = op || {};
    const VF = Vex.Flow; host.innerHTML = '';
    const K = pal(host), TINTA = K.tinta, AMBAR = K.resalte, VERDE = K.verde, ROJO = K.rojo;
    const alu = op.modo === 'alu', H = op.alto || (alu ? 140 : 128), ys = op.y == null ? (alu ? 14 : 8) : op.y;
    const r = new VF.Renderer(host, VF.Renderer.Backends.SVG); r.resize(W, H);
    const ctx = r.getContext(); ctx.setFillStyle(TINTA); ctx.setStrokeStyle(TINTA);
    const svg = host.querySelector('svg'); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.removeAttribute('width'); svg.removeAttribute('height'); svg.style.width = '100%'; svg.style.height = 'auto';
    const fifths = op.fifths === undefined ? (alu ? ex.aluArm : ex.key.fifths) : op.fifths;
    const armAncho = Math.max(Math.abs(fifths || 0), Math.abs(op.otroF || 0), 4) * 10;
    const L = 8, R = 14, extra = 70 + armAncho, n = ex.compases.length, wRest = (W - L - R - extra) / n;
    let x = L, gi0 = 0;
    const geo = { comps: [], svg: svg };
    ex.compases.forEach((mn, ci) => {
      const wC = ci === 0 ? wRest + extra : wRest;
      const st = new VF.Stave(x, ys, wC);
      if (ci === 0) { st.addClef('treble'); if (fifths != null && fifths !== 0) st.addKeySignature(ksName(fifths)); st.addTimeSignature(ex.compas.num + '/' + ex.compas.den); }
      if (ci === n - 1) st.setEndBarType(VF.Barline.type.END);
      st.setContext(ctx).draw();
      const sns = mn.map((nn, ki) => {
        const gi = gi0 + ki;
        let nota = alu ? (op.notas ? op.notas[gi] : ex.aluNotas[gi]) : nn, sn, col = TINTA;
        if (nota) {
          sn = new VF.StaveNote({ keys: [keyDe(nota)], duration: baseDur(nn.dur), clef: 'treble', auto_stem: true });
          if (alu) { if (nota.alter) sn.addModifier(new VF.Accidental(nota.alter === 1 ? '#' : 'b'), 0); else if (nota.nat) sn.addModifier(new VF.Accidental('n'), 0); }
          if (op.corr) col = correctaAltura(ex, gi, nota) ? VERDE : ROJO;
          else if (gi === op.sel || gi === op.hl) col = AMBAR;
          else if (op.apagadas && op.apagadas.indexOf(gi) >= 0) col = K.apagada;
        } else {
          sn = new VF.StaveNote({ keys: ['b/4'], duration: baseDur(nn.dur) + 'r', clef: 'treble' });
          col = 'rgba(0,0,0,0)';
        }
        if (conPunto(nn.dur)) VF.Dot.buildAndAttach([sn], { all: true });
        sn.setStyle({ fillStyle: col, strokeStyle: col }); sn.setLedgerLineStyle({ fillStyle: col, strokeStyle: col, lineWidth: 1.6 });
        sn.getModifiers().forEach(m => m.setStyle && m.setStyle({ fillStyle: col, strokeStyle: col }));
        sn._col = col;
        return sn;
      });
      const voice = new VF.Voice({ num_beats: ex.compas.num, beat_value: ex.compas.den }).setStrict(false).addTickables(sns);
      /* corchetes por PULSO (como beamsPorPulso de Teoría PRO): solo corcheas/semicorcheas seguidas dentro del mismo pulso.
         (3-nov) se crean ANTES de formatear y con TODAS las plicas del grupo en la misma dirección (B.pauta.plicas) */
      const beams = [], PB = ex.compas.den === 8 ? 1.5 : 1; let pos = 0, grupo = [], pulso = -1;
      const cierra = () => { if (grupo.length > 1) { B.pauta.plicas(grupo); beams.push(new VF.Beam(grupo)); } grupo = []; };
      mn.forEach((nn, ki) => {
        const d = durBeats(nn.dur), p = Math.floor(pos / PB + 1e-6), rest = !!(sns[ki].isRest && sns[ki].isRest());
        if ((nn.dur === '8' || nn.dur === '16') && !rest) { if (p !== pulso) cierra(); grupo.push(sns[ki]); pulso = p; } else { cierra(); pulso = -1; }
        pos += d;
      });
      cierra();
      let area; try { area = (x + wC - 12) - st.getNoteStartX(); } catch (e) { area = wC - (ci === 0 ? extra : 16); }
      new VF.Formatter().joinVoices([voice]).format([voice], Math.max(40, area));
      beams.forEach(b => { const ns = b.getNotes ? b.getNotes() : (b.notes || []), c = ns.length && ns.every(x => x._col === ns[0]._col) ? ns[0]._col : TINTA; b.setStyle({ fillStyle: c, strokeStyle: c }); });
      voice.draw(ctx, st); beams.forEach(b => b.setContext(ctx).draw());
      const cg = { stave: st, notes: [] };
      sns.forEach((sn, ki) => { let cx; try { cx = sn.getAbsoluteX() + 6; } catch (e) { cx = x + wC / 2; } cg.notes.push({ gi: gi0 + ki, x: cx, dur: mn[ki].dur, el: sn.getSVGElement ? sn.getSVGElement() : null }); });
      geo.comps.push(cg);
      x += wC; gi0 += mn.length;
    });
    return geo;
  };
  /* Y de una nota y altura por Y (clave de sol: F5 en la línea superior; cada grado = medio espacio); ámbito La3–La5 */
  function yNota(st, s) { const top = st.getYForLine(0), bot = st.getYForLine(4), h = (bot - top) / 8; return top + ((STEPS.indexOf('F') + 5 * 7) - (STEPS.indexOf(s.step) + s.octave * 7)) * h; }
  function alturaY(st, y) {
    const top = st.getYForLine(0), bot = st.getYForLine(4), h = (bot - top) / 8;
    let d = Math.round((y - top) / h), idx = STEPS.indexOf('F') + 5 * 7 - d;   // índice diatónico absoluto
    const lo = STEPS.indexOf('A') + 3 * 7, hi = STEPS.indexOf('A') + 5 * 7;
    idx = Math.max(lo, Math.min(hi, idx));
    return { step: STEPS[idx % 7], octave: Math.floor(idx / 7) };
  }
  function svgPt(svg, ev) {
    try { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; const m = svg.getScreenCTM(); if (!m) return null; const q = p.matrixTransform(m.inverse()); return { x: q.x, y: q.y }; }
    catch (e) { return null; }
  }
  const NS = 'http://www.w3.org/2000/svg';
  function svgEl(tag, at) { const e = document.createElementNS(NS, tag); Object.keys(at).forEach(k => e.setAttribute(k, at[k])); return e; }
  function fantasma(svg, st, x, s, dur) {
    quitaFantasma(svg);
    const y = yNota(st, s), COL = pal(svg).fantasma, g = svgEl('g', { id: 'fantasma', 'pointer-events': 'none' });
    const code = String(dur || 'q').replace(/[dr]/g, ''), blanca = code === 'h', nf = code === '8' ? 1 : code === '16' ? 2 : 0;
    const top = st.getYForLine(0), bot = st.getYForLine(4), sp = (bot - top) / 4;
    for (let ly = top - sp; ly >= y - 1; ly -= sp) g.appendChild(svgEl('line', { x1: x - 11, y1: ly, x2: x + 11, y2: ly, stroke: COL, 'stroke-width': 1.6 }));
    for (let ly = bot + sp; ly <= y + 1; ly += sp) g.appendChild(svgEl('line', { x1: x - 11, y1: ly, x2: x + 11, y2: ly, stroke: COL, 'stroke-width': 1.6 }));
    const head = svgEl('ellipse', { cx: x, cy: y, rx: 6.4, ry: 4.5, transform: 'rotate(-18 ' + x + ' ' + y + ')' });
    if (blanca) { head.setAttribute('fill', 'none'); head.setAttribute('stroke', COL); head.setAttribute('stroke-width', '1.8'); } else head.setAttribute('fill', COL);
    g.appendChild(head);
    /* (3-nov) plica como la escribiría el copista: desde la 3.ª línea hacia arriba, plica abajo a la IZQUIERDA y corchete hacia arriba;
       por debajo, plica arriba a la DERECHA y corchete hacia abajo. El corchete siempre a la derecha de la plica. */
    const abajo = y <= st.getYForLine(2) + .5, sx = abajo ? x - 5.8 : x + 5.8, ey = abajo ? y + 34 : y - 34, sg = abajo ? -1 : 1;
    g.appendChild(svgEl('line', { x1: sx, y1: y + (abajo ? 1 : -1), x2: sx, y2: ey, stroke: COL, 'stroke-width': 1.6 }));
    for (let f = 0; f < nf; f++) g.appendChild(svgEl('path', { d: 'M ' + sx + ' ' + (ey + sg * f * 7) + ' q 9 ' + (4 * sg) + ' 7 ' + (14 * sg), fill: 'none', stroke: COL, 'stroke-width': 2.2 }));
    if (/d/.test(String(dur))) g.appendChild(svgEl('circle', { cx: x + 12, cy: y, r: 1.8, fill: COL }));
    svg.appendChild(g);
  }
  function quitaFantasma(svg) { const g = svg.querySelector('#fantasma'); if (g) g.remove(); }

  /* sonar: la original o la del alumno (con la armadura que puso), con la chirimía o el piano */
  E.sonar = function (ex, cual, tipo, alFin) {
    const V = B.viento, C = B.ac(), negra = ex.compas.den === 8 ? .5 : .62; let t = C.currentTime + .15;   // 6/8: corchea a 0,25 s
    ex.notas.forEach((n, i) => {
      const d = durBeats(n.dur) * negra;
      let m = null;
      if (cual === 'orig') m = n.midi; else if (cual === 'sol') m = n.midi + ex.transp.dir * ex.transp.semis; else { const a = ex.aluNotas[i]; if (a) m = E.midiAlu(ex, a); }
      if (m != null) { if (tipo === 'piano') V.piano(m, t, d * .95, .42); else V.nota(tipo || 'chirimia', m, t, d * .93, .75); }
      t += d;
    });
    const tot = t - C.currentTime; if (alFin) B.espera(tot + .2).then(alFin); return tot;
  };

  /* ══════════ PANEL DEL ALUMNO (montarEscrito) ══════════
     cfg = { guiado, cabecera, instrumento, alCorregir(p, ex), pistas:true, alterar:false (oculta ♭ ♮ ♯) } → api { ex, corrige(), solucion(), bloquea() } */
  E.panel = function (host, ex, cfg) {
    cfg = cfg || {};
    const el = B.el, btn = (txt, cls, fn, tit) => { const b = el('button', cls || '', txt); b.type = 'button'; if (tit) { b.title = tit; b.setAttribute('aria-label', tit); } b.addEventListener('click', ev => { ev.stopPropagation(); fn(b); }); return b; };
    host.innerHTML = '';
    const w = el('div', 'esc'), hoja = el('div', 'esc-hoja');   /* (3-nov) la «hoja»: en la piel época, el papel pautado */
    const cab = el('div', 'esc-cab'); cab.innerHTML = (cfg.cabecera ? '<span class="esc-num">' + cfg.cabecera + '</span>' : '') + 'Transporta la melodía: <b>' + ex.transp.lbl + '</b>';
    w.appendChild(hoja); hoja.appendChild(cab);
    const pO = el('div', 'esc-pe'); pO.appendChild(el('small', '', 'Melodía original · <b>' + ex.key.name + ' Mayor</b> (' + E.armTxt(ex.key.fifths) + ')'));
    const hO = el('div', 'partitura esc-orig'); pO.appendChild(hO); hoja.appendChild(pO);
    const pA = el('div', 'esc-pe'); pA.appendChild(el('small', '', '<b>Tu transporte</b> · pasa el ratón o el dedo por el pentagrama y pulsa para colocar cada nota (el ritmo se pone solo)'));
    const hA = el('div', 'partitura esc-alu'); pA.appendChild(hA); hoja.appendChild(pA);
    const ctl = el('div', 'esc-ctl'); w.appendChild(ctl);
    host.appendChild(w);
    let sel = null, bloqueado = false, corregido = false, geo = null;
    const vacio = () => { for (let i = 0; i < ex.notas.length; i++) if (!ex.aluNotas[i]) return i; return -1; };
    function redraw() {
      const hl = cfg.guiado && !corregido ? (sel != null ? sel : vacio()) : null;
      E.pinta(hO, ex, { modo: 'orig', otroF: ex.aluArm, hl: hl == null || hl < 0 ? null : hl });
      geo = E.pinta(hA, ex, { modo: 'alu', otroF: ex.key.fifths, sel: corregido ? null : sel, corr: corregido });
      if (!bloqueado) engancha();
      if (sel != null && ex.aluNotas[sel] && !corregido && !bloqueado) cruz();
      pintaAcc(); bDes.disabled = !ex.undo.length || bloqueado;
    }
    /* ── colocar notas: ratón (mover = fantasma, clic = colocar) y táctil (tocar → arrastrar → soltar = colocar) ── */
    function cercana(pt) { let best = null, bd = 1e9; geo.comps.forEach(cg => cg.notes.forEach(nt => { const d = Math.abs(nt.x - pt.x); if (d < bd) { bd = d; best = { nt: nt, cg: cg }; } })); return best; }
    function engancha() {
      const svg = geo.svg; svg.classList.add('activa');
      let tocando = false;
      const mueve = ev => { const pt = svgPt(svg, ev); if (!pt) return; const b = cercana(pt); if (!b) return quitaFantasma(svg); let x = b.nt.x, dur = b.nt.dur;
        if (ev.pointerType !== 'mouse' && !ex.aluNotas[b.nt.gi]) { const v = vacio(); if (v >= 0 && v !== b.nt.gi) { const r = destinoGi(v); if (r) { x = r.nt.x; dur = r.nt.dur; } } }
        fantasma(svg, b.cg.stave, x, alturaY(b.cg.stave, pt.y), dur); };
      const coloca = ev => {
        const pt = svgPt(svg, ev); if (!pt) return; let b = cercana(pt); if (!b) return;
        /* en táctil la colocación avanza de una en una: un hueco vacío que no es el siguiente se redirige al siguiente (Teoría PRO, R3) */
        if (ev.pointerType !== 'mouse' && !ex.aluNotas[b.nt.gi]) { const v = vacio(); if (v >= 0 && v !== b.nt.gi) { const r = destinoGi(v); if (r) b = r; } }
        const s = alturaY(b.cg.stave, pt.y), gi = b.nt.gi, prev = ex.aluNotas[gi];
        if (prev && prev.step === s.step && prev.octave === s.octave) { sel = gi; redraw(); return; }   // tocar la nota ya puesta: solo seleccionarla
        ex.undo.push({ gi: gi, prev: prev ? Object.assign({}, prev) : null });
        ex.aluNotas[gi] = { step: s.step, octave: s.octave, alter: 0 };
        sel = gi; B.viento.piano(E.midiAlu(ex, ex.aluNotas[gi]), B.ac().currentTime + .01, .35, .35);
        limpiaCorr(); redraw();
      };
      svg.onpointermove = ev => { if (bloqueado) return; if (ev.pointerType === 'mouse' || tocando) mueve(ev); };
      svg.onpointerleave = () => { if (!tocando) quitaFantasma(svg); };
      svg.onpointerdown = ev => { if (bloqueado || ev.target.closest && ev.target.closest('.esc-x')) return; if (ev.pointerType !== 'mouse') { tocando = true; try { svg.setPointerCapture(ev.pointerId); } catch (e) { } mueve(ev); } if (ev.cancelable) ev.preventDefault(); };
      svg.onpointerup = ev => { if (bloqueado || ev.target.closest && ev.target.closest('.esc-x')) return; if (ev.pointerType !== 'mouse') { tocando = false; quitaFantasma(svg); } if (ev.button > 0) return; coloca(ev); };
      svg.onpointercancel = () => { tocando = false; quitaFantasma(svg); };
    }
    function destinoGi(gi) { let r = null; geo.comps.forEach(cg => cg.notes.forEach(nt => { if (nt.gi === gi) r = { nt: nt, cg: cg }; })); return r; }
    /* × junto a la nota seleccionada: la borra (y se puede deshacer) */
    function cruz() {
      const r = destinoGi(sel), a = ex.aluNotas[sel]; if (!r || !a) return;
      const K = pal(geo.svg), ROJO = K.rojo, y = yNota(r.cg.stave, a), g = svgEl('g', { class: 'esc-x', transform: 'translate(' + (r.nt.x + 20) + ',' + (y - 24) + ')' });
      g.appendChild(svgEl('circle', { r: 9, fill: K.fondoX, stroke: ROJO, 'stroke-width': 1.6 }));
      g.appendChild(svgEl('path', { d: 'M -4 -4 L 4 4 M 4 -4 L -4 4', stroke: ROJO, 'stroke-width': 2 }));
      g.addEventListener('pointerdown', ev => { ev.stopPropagation(); if (ev.cancelable) ev.preventDefault(); });
      g.addEventListener('pointerup', ev => { ev.stopPropagation(); ex.undo.push({ gi: sel, prev: Object.assign({}, ex.aluNotas[sel]) }); ex.aluNotas[sel] = null; sel = null; limpiaCorr(); redraw(); });
      geo.svg.appendChild(g);
    }
    function limpiaCorr() { if (corregido) { corregido = false; res.innerHTML = ''; res.className = 'esc-res'; } }
    /* ── controles: tonalidad (rueda de nota + ♭/♯ + M/m), armadura (rueda), alterar nota (♭ ♮ ♯), deshacer, escuchar, corregir ── */
    const gTon = el('div', 'esc-g'); gTon.appendChild(el('small', '', 'Nueva tonalidad'));
    const fTon = el('div', 'esc-f'); const rTon = el('div'); fTon.appendChild(rTon);
    const cAlt = el('div', 'esc-col'), bTb = btn('♭', 'cuad acc', () => { ex.aluTonAlt = ex.aluTonAlt === -1 ? 0 : -1; ton(); }, 'Bemol'), bTs = btn('♯', 'cuad acc', () => { ex.aluTonAlt = ex.aluTonAlt === 1 ? 0 : 1; ton(); }, 'Sostenido');
    cAlt.appendChild(bTb); cAlt.appendChild(bTs); fTon.appendChild(cAlt);
    const cMod = el('div', 'esc-col'), bM = btn('M', 'cuad acc', () => { ex.aluTonModo = 'M'; ex.aluModoElegido = true; ton(); }, 'Mayor'), bm = btn('m', 'cuad acc', () => { ex.aluTonModo = 'm'; ex.aluModoElegido = true; ton(); }, 'menor');
    cMod.appendChild(bM); cMod.appendChild(bm); fTon.appendChild(cMod);
    gTon.appendChild(fTon); const lTon = el('b', 'esc-lbl', '—'); gTon.appendChild(lTon); ctl.appendChild(gTon);
    const nats = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'], natInv = nats.slice().reverse().concat(['—']);
    const wTon = Rueda.crea(rTon, natInv, natInv.length - 1, ix => { ex.aluTonNat = ix < nats.length ? nats[nats.length - 1 - ix] : null; ton(); });
    function ton() {
      ex.aluTon = ex.aluTonNat ? ex.aluTonNat + accTxt(ex.aluTonAlt) : null;
      lTon.textContent = ex.aluTonNat ? ex.aluTonNat + accTxt(ex.aluTonAlt) + (ex.aluModoElegido ? (ex.aluTonModo === 'm' ? ' menor' : ' Mayor') : '') : '—';
      bTb.classList.toggle('on', ex.aluTonAlt === -1); bTs.classList.toggle('on', ex.aluTonAlt === 1);
      bM.classList.toggle('on', ex.aluModoElegido && ex.aluTonModo === 'M'); bm.classList.toggle('on', ex.aluModoElegido && ex.aluTonModo === 'm');
      limpiaCorr();
    }
    const gArm = el('div', 'esc-g'); gArm.appendChild(el('small', '', 'Nueva armadura')); const rArm = el('div'); gArm.appendChild(rArm); ctl.appendChild(gArm);
    const armV = []; for (let s = 7; s >= 1; s--) armV.push({ f: s, txt: s + '♯' }); armV.push({ f: null, txt: '—' }); for (let b = 1; b <= 7; b++) armV.push({ f: -b, txt: b + '♭' });
    const wArm = Rueda.crea(rArm, armV.map(o => o.txt), 7, ix => { ex.aluArm = armV[ix].f; limpiaCorr(); redraw(); });
    const gAcc = el('div', 'esc-g'); gAcc.appendChild(el('small', '', 'Alterar nota')); const fAcc = el('div', 'esc-f');
    const bAb = btn('♭', 'cuad acc', () => acc(-1), 'Bemol en la nota seleccionada'), bAn = btn('♮', 'cuad acc', () => acc(0), 'Becuadro en la nota seleccionada'), bAs = btn('♯', 'cuad acc', () => acc(1), 'Sostenido en la nota seleccionada');
    [bAb, bAn, bAs].forEach(b => fAcc.appendChild(b)); gAcc.appendChild(fAcc);
    if (cfg.alterar !== false) ctl.appendChild(gAcc);   /* (3-nov) alterar:false → sin ♭ ♮ ♯ (T2: melodías sin alteraciones accidentales) */
    function acc(v) {
      if (sel == null || bloqueado) return; const a = ex.aluNotas[sel]; if (!a) return;
      const ya = (a.alter === v && v !== 0) || (v === 0 && a.nat);
      ex.undo.push({ gi: sel, prev: Object.assign({}, a) });
      if (ya) { a.alter = 0; a.nat = false; }                                   // pulsar otra vez la misma: se quita
      else if (v !== 0 && !a.alter && inKS(a.step, v, ex.aluArm)) { a.pulsado = v; ex.undo.pop(); pintaAcc(); return; }   // ya lo es por la armadura: nada (alteraciones neutras)
      else { a.alter = v; a.nat = v === 0; }
      B.viento.piano(E.midiAlu(ex, a), B.ac().currentTime + .01, .35, .35);
      limpiaCorr(); redraw();
    }
    function pintaAcc() {
      const a = !corregido && sel != null ? ex.aluNotas[sel] : null;
      const cur = a ? (a.alter ? a.alter : a.nat ? 0 : (a.pulsado && inKS(a.step, a.pulsado, ex.aluArm) ? a.pulsado : null)) : null;
      bAb.classList.toggle('on', cur === -1); bAn.classList.toggle('on', cur === 0); bAs.classList.toggle('on', cur === 1);
      [bAb, bAn, bAs].forEach(b => { b.disabled = !a || bloqueado; });
    }
    const gHer = el('div', 'esc-g esc-her');
    const bDes = btn('↶ Deshacer', '', () => {
      const u = ex.undo.pop(); if (!u) return; ex.aluNotas[u.gi] = u.prev; sel = u.prev ? u.gi : null; limpiaCorr(); redraw();
    });
    const bOir = btn('▶ Original', '', () => E.sonar(ex, 'orig', cfg.instrumento));
    const bTuya = btn('▶ La tuya', '', () => E.sonar(ex, 'alu', cfg.instrumento));
    gHer.appendChild(bDes); const fo = el('div', 'esc-f'); fo.appendChild(bOir); fo.appendChild(bTuya); gHer.appendChild(fo); ctl.appendChild(gHer);
    const gCor = el('div', 'esc-g esc-cor');
    const bCor = btn('✓ Corregir', 'prim', () => corrige()); gCor.appendChild(bCor);
    const res = el('div', 'esc-res'); gCor.appendChild(res); ctl.appendChild(gCor);
    function corrige() {
      if (bloqueado) return;
      corregido = true; sel = null;
      const p = E.puntua(ex), pack = E.okTon(ex) && E.okArm(ex);
      redraw();
      res.innerHTML = '<span class="pct">' + Math.round(p * 100) + ' %</span><span>' + (pack ? '✓' : '✗') + ' tonalidad y armadura' + (pack ? '' : ' (−50 %)') + '</span>';
      res.className = 'esc-res ' + (p >= .85 ? 'ok' : p >= .5 ? 'medio' : 'mal');
      B.viento.ui(p >= .999 ? 'ok' : 'mal');
      if (cfg.alCorregir) cfg.alCorregir(p, ex);
      return p;
    }
    redraw(); ton();
    return {
      ex: ex, corrige: corrige,
      solucion() {   // (guiado) rellena la respuesta correcta: tonalidad, armadura y notas
        ex.aluTonNat = ES[ex.destino.step]; ex.aluTonAlt = ex.destino.alter; ex.aluTonModo = 'M'; ex.aluModoElegido = true;
        wTon.pon(natInv.indexOf(ex.aluTonNat), false); ton();
        ex.aluArm = ex.destino.fifths === 0 ? null : ex.destino.fifths; wArm.pon(armV.findIndex(o => o.f === ex.aluArm), false);
        ex.notas.forEach((n, i) => { const s = stepTransportado(n, ex.transp); ex.aluNotas[i] = { step: s.step, octave: s.octave, alter: 0 }; });
        corrige();
      },
      bloquea(on) { bloqueado = on !== false; bCor.disabled = bloqueado; [rTon, rArm].forEach(r => r.classList.toggle('quieta', bloqueado)); [bTb, bTs, bM, bm].forEach(b => { b.disabled = bloqueado; }); redraw(); },
      boton: bCor, resultado: res
    };
  };
})(window.TR);
