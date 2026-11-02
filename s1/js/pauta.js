/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE · pentagramas con VexFlow 4 (local, js/vexflow.js) y teoría mínima para transportar
   TR.pauta.dibuja(cont, op) → { notas: [ { pe, sis, t0, d, x, el } ], alto }
     op = { ancho, compas:'7/8', grupos:[2,2,3], sistemas:[[0,4],[5,8]] (compases de cada línea),
            pentas:[ { nombre, armadura:'C#m', clave:'treble', compases:[ [ {k:'c#/5', d:2}, … ], … ] } ],
            tinta, sepSis, sepPe }   (d en corcheas)
   TR.teoria.midi('f#/4') · TR.teoria.transporta('e/4', pasos, semitonos) → 'c#/5'
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const T = B.teoria = {};
  const PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }, LET = 'cdefgab';
  const ALT = { '': 0, 'n': 0, '#': 1, '##': 2, 'b': -1, 'bb': -2 };
  T.lee = function (k) { const m = /^([a-g])(##|#|bb|b|n)?\/(-?\d)$/.exec(k); return m ? { l: m[1], a: ALT[m[2] || ''], o: +m[3] } : null; };
  T.midi = function (k) { const n = T.lee(k); return n ? 12 * (n.o + 1) + PC[n.l] + n.a : null; };
  T.escribe = function (l, a, o) { return l + ({ '-2': 'bb', '-1': 'b', '0': '', '1': '#', '2': '##' }[String(a)]) + '/' + o; };
  /* transporta una nota: pasos = grados de la letra (6.ª = 5), semis = semitonos (6.ª M = 9); negativos hacia abajo */
  T.transporta = function (k, pasos, semis) {
    const n = T.lee(k), i = LET.indexOf(n.l) + pasos, l = LET[((i % 7) + 7) % 7], o = n.o + Math.floor(i / 7);
    const objetivo = T.midi(k) + semis, base = 12 * (o + 1) + PC[l];
    return T.escribe(l, objetivo - base, o);
  };
  T.NOMBRE = { c: 'Do', d: 'Re', e: 'Mi', f: 'Fa', g: 'Sol', a: 'La', b: 'Si' };
  T.nombre = function (k) { const n = T.lee(k); return T.NOMBRE[n.l] + ({ '-2': '𝄫', '-1': '♭', '0': '', '1': '♯', '2': '𝄪' }[String(n.a)]); };

  const P = B.pauta = {};
  const DUR = { 1: ['8', 0], 2: ['q', 0], 3: ['q', 1], 4: ['h', 0], 6: ['h', 1], 7: ['h', 2], 8: ['w', 0] };
  P.dibuja = function (cont, op) {
    const VF = Vex.Flow;
    cont.innerHTML = '';
    const W = op.ancho || 1400, pentas = op.pentas, np = pentas.length;
    const sepPe = op.sepPe || 112, sepSis = op.sepSis || 40, alto1 = sepPe * np;
    const sistemas = op.sistemas || [[0, pentas[0].compases.length - 1]];
    const H = sistemas.length * alto1 + (sistemas.length - 1) * sepSis + 30;
    const r = new VF.Renderer(cont, VF.Renderer.Backends.SVG); r.resize(W, H);
    const ctx = r.getContext();
    const tinta = op.tinta || '#eaf6ff';
    ctx.setFillStyle(tinta); ctx.setStrokeStyle(tinta);
    const x0 = op.margen == null ? (np > 1 ? 130 : 20) : op.margen;
    const notas = [];
    const grupos = (op.grupos || [2, 2, 3]).map(g => new VF.Fraction(g, 8));
    const [nb, bv] = (op.compas || '7/8').split('/').map(Number);
    const t0Compas = []; { let acc = 0; pentas[0].compases.forEach((cm, i) => { t0Compas[i] = acc; acc += cm.reduce((a, n) => a + n.d, 0); }); }
    sistemas.forEach((rg, si) => {
      const y0 = 6 + si * (alto1 + sepSis), nC = rg[1] - rg[0] + 1;
      /* primer compás de la línea: clave + armadura (+ compás en la primera); se alinea el comienzo de las notas en todos los pentagramas */
      const prim = pentas.map((pe, pi) => { const s = new VF.Stave(x0, y0 + pi * sepPe, 200); s.addClef(pe.clave || 'treble'); if (pe.armadura) s.addKeySignature(pe.armadura); if (si === 0 && op.compas !== false) s.addTimeSignature(op.compas || '7/8'); return s; });
      const extra = Math.max.apply(null, prim.map(s => s.getNoteStartX() - s.getX()));
      const bw = (W - x0 - 6 - extra) / nC;
      const filas = pentas.map(() => []);
      for (let c = 0; c < nC; c++) {
        const ci = rg[0] + c, x = c === 0 ? x0 : x0 + extra + bw * c, w = c === 0 ? bw + extra : bw;
        const vozs = [], porPe = [];
        pentas.forEach((pe, pi) => {
          const s = c === 0 ? prim[pi] : new VF.Stave(x, y0 + pi * sepPe, w);
          if (c === 0) { s.setWidth(w); s.setNoteStartX(x0 + extra); }
          if (c === nC - 1 && si === sistemas.length - 1) s.setEndBarType(VF.Barline.type.END);
          s.setContext(ctx).draw();
          filas[pi].push(s);
          const sn = pe.compases[ci].map(n => {
            const dd = DUR[n.d] || ['q', 0];
            const nota = new VF.StaveNote({ clef: pe.clave || 'treble', keys: [n.r ? 'b/4' : n.k], duration: dd[0] + (n.r ? 'r' : ''), auto_stem: true });
            for (let k = 0; k < dd[1]; k++) VF.Dot.buildAndAttach([nota], { all: true });
            if (n.col) nota.setStyle({ fillStyle: n.col, strokeStyle: n.col });
            return nota;
          });
          const v = new VF.Voice({ num_beats: nb, beat_value: bv }).setStrict(false).addTickables(sn);
          if (pe.armadura) VF.Accidental.applyAccidentals([v], pe.armadura); else VF.Accidental.applyAccidentals([v], 'C');
          vozs.push(v); porPe.push({ s: s, sn: sn, pe: pe, pi: pi });
        });
        const fm = new VF.Formatter(); vozs.forEach(v => fm.joinVoices([v]));
        fm.format(vozs, w - (c === 0 ? extra : 0) - 22);
        porPe.forEach((o, k) => {
          const beams = VF.Beam.generateBeams(o.sn, { groups: grupos });
          vozs[k].draw(ctx, o.s); beams.forEach(b => b.setContext(ctx).draw());
          let t = t0Compas[ci];
          o.sn.forEach((nt, j) => {
            const d = o.pe.compases[ci][j].d;
            notas.push({ pe: o.pi, sis: si, c: ci, t0: t, d: d, x: nt.getAbsoluteX() + 6, y: o.s.getYForLine(0), el: nt.getSVGElement ? nt.getSVGElement() : null });
            t += d;
          });
        });
      }
      if (np > 1) {
        new VF.StaveConnector(filas[0][0], filas[np - 1][0]).setType('singleLeft').setContext(ctx).draw();
        new VF.StaveConnector(filas[0][0], filas[np - 1][0]).setType('bracket').setContext(ctx).draw();
        filas[0].forEach((s, c) => { const cn = new VF.StaveConnector(s, filas[np - 1][c]); cn.setType(c === nC - 1 && si === sistemas.length - 1 ? 'boldDoubleRight' : 'singleRight'); cn.setContext(ctx).draw(); });
      }
      /* nombre del instrumento a la izquierda */
      if (np > 1 && op.nombres !== false) pentas.forEach((pe, pi) => {
        const tx = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tx.setAttribute('x', 4); tx.setAttribute('y', y0 + pi * sepPe + 46); tx.setAttribute('class', 'pnom');
        tx.textContent = si === 0 ? pe.nombre : (pe.corto || pe.nombre);
        cont.querySelector('svg').appendChild(tx);
        if (pe.sub && si === 0) { const t2 = tx.cloneNode(); t2.setAttribute('y', y0 + pi * sepPe + 66); t2.setAttribute('class', 'pnom sub'); t2.textContent = pe.sub; cont.querySelector('svg').appendChild(t2); }
      });
    });
    return { notas: notas, alto: H, ancho: W, sepPe: sepPe, alto1: alto1, sepSis: sepSis };
  };
})(window.TR);
