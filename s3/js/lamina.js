/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 3 (copia de T2 + fantasma, mentalDef, balanza) · LÁMINAS DIBUJADAS EN CÓDIGO (DECISIONES 21:00: «láminas didácticas con notación musical se DIBUJAN en código»;
   pantallas y hologramas se animan por código, sin zoom). Capa #lamina entre los personajes y los interactivos.
   TR.lamina.pon(spec | null, control)
     { tipo:'texto', txt, x, y, w, rot, estilo:'tinta'|'holo', tam }                      rótulo sobre la imagen (p. ej. la página del cuaderno)
     { tipo:'registro', titulo, filas:[{a, b, estado:'fijo'|'parpadea'}], borra:{fila, t} }   pantalla del registro del Transportador
     { tipo:'armaduras', titulo, izq:{ton, f}, der:{ton, f}, flecha, cambios:[…], total, ens:[s…] }   dos armaduras y lo que cambia
     { tipo:'melodias', titulo, ex, paso (s por nota) }                                   melodía original y transportada, nota a nota
     { tipo:'tarjeta', titulo, lineas:[…], pos:'der'|'izq' }                               ventaja / desventajas
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const L = B.lamina = {};
  let capa = null, act = null, gen = 0;
  const el = B.el;
  function asegura() { if (capa && capa.isConnected) return capa; capa = B.$('#lamina'); return capa; }
  L.pon = function (spec, c) {
    asegura(); if (!capa) return;
    const mi = ++gen;
    if (act) { const v = act; v.classList.remove('on'); setTimeout(() => v.remove(), 600); act = null; }
    if (!spec) return;
    const f = L[spec.tipo]; if (!f) return;
    const box = el('div', 'lam-' + spec.tipo + (spec.pos ? ' pos-' + spec.pos : '')); capa.appendChild(box); act = box;
    try { f(box, spec, c || B.control()); } catch (e) { console.warn('lámina', spec.tipo, e); }
    requestAnimationFrame(() => requestAnimationFrame(() => { if (mi === gen) box.classList.add('on'); }));
  };
  const pct = v => (v * 100).toFixed(2) + '%';
  L.texto = function (box, s) {
    box.style.left = pct(s.x || .5); box.style.top = pct(s.y || .5); if (s.w) box.style.width = pct(s.w);
    box.style.transform = 'translate(-50%,-50%) rotate(' + (s.rot || 0) + 'deg)';
    box.classList.add(s.estilo || 'holo'); if (s.tam) box.style.fontSize = s.tam + 'px';
    box.innerHTML = s.txt;
  };
  L.registro = function (box, s, c) {
    box.innerHTML = '<div class="reg-tit">' + B.esc(s.titulo || 'Registro del Transportador') + '</div>';
    const filas = s.filas.map((f, i) => {
      const r = el('div', 'reg-fila ' + (f.estado || 'fijo')); r.innerHTML = '<i></i><b>' + f.a + '</b><span>' + f.b + '</span>'; box.appendChild(r);
      if (f.t) { r.classList.add('oculta'); B.espera(f.t, c).then(ok => ok && r.classList.remove('oculta')); }
      return r;
    });
    if (s.borra) B.espera(s.borra.t || 0, c).then(ok => {
      if (!ok) return; const r = filas[s.borra.fila]; if (!r) return;
      r.classList.add('borra'); B.sfx(B.existe('../s1/sfx/sfx_ui_clic.mp3') ? '../s1/sfx/sfx_ui_clic.mp3' : '', .7);
      setTimeout(() => r.classList.add('fuera'), 700);
    });
  };
  /* dos pentagramas solo con clave y armadura (VexFlow), una flecha con el intervalo y, si se dan, los cambios uno a uno */
  function armadura(host, f, ton) {
    const VF = Vex.Flow, w = 250, h = 112;
    const r = new VF.Renderer(host, VF.Renderer.Backends.SVG); r.resize(w, h);
    const ctx = r.getContext(); ctx.setFillStyle('#eaf3ff'); ctx.setStrokeStyle('#eaf3ff');
    const st = new VF.Stave(8, 6, w - 16); st.addClef('treble'); if (f) st.addKeySignature(B.escrito.ksName(f)); st.setContext(ctx).draw();
    const svg = host.querySelector('svg'); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); svg.style.width = '100%'; svg.style.height = 'auto'; svg.removeAttribute('width'); svg.removeAttribute('height');
    host.appendChild(el('b', 'arm-ton', ton));
    host.appendChild(el('small', 'arm-f', B.escrito.armTxt(f)));
  }
  L.armaduras = function (box, s, c) {
    if (s.titulo) box.appendChild(el('div', 'lam-tit', s.titulo));
    const fila = el('div', 'arm-fila'); box.appendChild(fila);
    const a = el('div', 'arm-pe'), fl = el('div', 'arm-flecha', '<span>' + (s.flecha || '→') + '</span><i></i>'), b = el('div', 'arm-pe');
    fila.appendChild(a); fila.appendChild(fl); fila.appendChild(b);
    armadura(a, s.izq.f, s.izq.ton); armadura(b, s.der.f, s.der.ton);
    if (s.cambios) {
      const cf = el('div', 'arm-cambios'); box.appendChild(cf);
      s.cambios.forEach((x, i) => { const ch = el('span', 'arm-ch', x); cf.appendChild(ch); B.espera((s.ens && s.ens[i]) || (1 + i * 1.2), c).then(ok => ok && ch.classList.add('on')); });
      if (s.total) { const t = el('span', 'arm-ch total', s.total); cf.appendChild(t); B.espera((s.ens && s.ens[s.cambios.length]) || (1.2 + s.cambios.length * 1.2), c).then(ok => ok && t.classList.add('on')); }
    }
  };
  /* la melodía arriba (original) y abajo (transportada); las notas se encienden por parejas, con su flecha */
  L.melodias = function (box, s, c) {
    if (s.titulo) box.appendChild(el('div', 'lam-tit', s.titulo));
    const E = B.escrito;
    /* (T3) la canción del recital (TR.MELODIA): sus compases [desde, hasta) en el formato de E.fijo, una 2.ª M ↓ */
    const ex = s.ex || (s.mel === 'cancion' ? E.fijo({ ton: B.t3.cancion().ton, compas: B.t3.cancion().num + '/' + B.t3.cancion().den, transp: 4,
      compases: B.t3.cancion().compases.slice(s.compases ? s.compases[0] : 0, s.compases ? s.compases[1] : 4).map(cm => cm.map(n => [n.l + (n.a === 1 ? '#' : n.a === -1 ? 'b' : '') + '/' + n.o, n.dur])) }) : null);
    if (!ex) return;
    const sol = ex.notas.map(n => { const st = E.stepTransportado(n, ex.transp); return { step: st.step, octave: st.octave, alter: 0 }; });
    const pa = el('div', 'mel-pe'), pb = el('div', 'mel-pe');
    pa.appendChild(el('small', '', ex.key.name + ' Mayor')); const ha = el('div'); pa.appendChild(ha);
    pb.appendChild(el('small', '', ex.destino.name + ' Mayor · ' + ex.transp.corto)); const hb = el('div'); pb.appendChild(hb);
    box.appendChild(pa); box.appendChild(pb);
    const exB = Object.assign({}, ex, { aluArm: ex.destino.fifths });
    const pinta = k => {
      const ap = ex.notas.map((_, i) => i).filter(i => i > k);
      E.pinta(ha, ex, { modo: 'orig', otroF: ex.destino.fifths, hl: k >= 0 ? k : null, alto: 130, y: 16 });
      E.pinta(hb, exB, { modo: 'alu', notas: sol.map((n, i) => i <= k ? n : null), otroF: ex.key.fifths, sel: k >= 0 ? k : null, alto: 140, y: 20 });
    };
    pinta(-1);
    const paso = s.paso || .55, t0 = s.t0 || .6;
    ex.notas.forEach((n, i) => B.espera(t0 + i * paso, c).then(ok => { if (!ok || !box.isConnected) return; pinta(i); if (s.suena !== false) { const m = n.midi + ex.transp.dir * ex.transp.semis; if (s.inst === 'piano') B.t3.piano(m, B.ac().currentTime + .01, paso * 1.4, .34); else B.viento.nota('chirimia', m, B.ac().currentTime + .01, paso * .9, .32); } }));
    B.espera(t0 + ex.notas.length * paso + .2, c).then(ok => { if (ok && box.isConnected) pinta(ex.notas.length); });
  };
  L.tarjeta = function (box, s) {
    if (s.titulo) box.appendChild(el('div', 'lam-tit', s.titulo));
    s.lineas.forEach(x => box.appendChild(el('p', '', x)));
  };
  /* ══════════ (T3) ══════════ */
  /* la melodía original (clave de sol, Re M) y, a su tiempo, la clave de do en 4.ª «fantasma» encima: cada nota se lee una 2.ª más
     abajo (sol de la 2.ª línea → fa); debajo, el nombre original y, en cian, la lectura en clave de do (+ 8.ª) = la nota transportada */
  L.fantasma = function (box, s, c) {
    const T3 = B.t3, can = T3.cancion(), cs = can.compases.slice(s.compases ? s.compases[0] : 0, s.compases ? s.compases[1] : 3);
    if (s.titulo) box.appendChild(el('div', 'lam-tit', s.titulo));
    const pe = el('div', 'fan-pe'); box.appendChild(pe);
    const h1 = el('div', 'fan-orig'), h2 = el('div', 'fan-capa'); pe.appendChild(h1); pe.appendChild(h2);
    const geo = T3.pinta(h1, cs, { fifths: can.fifths, num: can.num, den: can.den, ancho: 860, alto: 118, y: 18, final: false, margen: 48 });
    T3.fantasma(h2, geo, { tachaArm: can.fifths, armTxt: 'Do M' });
    const noms = el('div', 'fan-noms'); pe.appendChild(noms);
    geo.notas.forEach(g => {
      const t = T3.enTenor(g.n), d = el('div', 'fan-nom');
      d.style.left = (g.x / geo.W * 100) + '%';
      d.innerHTML = '<span>' + T3.nombre(g.n.l, g.n.a) + '</span><b>' + T3.NOM[t.l] + '</b>';
      noms.appendChild(d);
    });
    const ley = el('div', 'fan-ley', '<span><i class="o"></i>Clave de sol · <b>Re M</b> (lo que está escrito)</span><span><i class="f"></i>Clave de do en 4.ª · <b>Do M</b> · y una 8.ª más arriba</span>');
    box.appendChild(ley);
    B.espera(s.t || 1, c).then(ok => { if (ok && box.isConnected) box.classList.add('con-fan'); });
    B.espera(s.tNombres || 4, c).then(ok => { if (!ok || !box.isConnected) return; box.classList.add('con-noms');
      cs.reduce((a, m) => a.concat(m), []).forEach((n, i) => B.espera(i * .42, c).then(ok2 => { if (!ok2 || !box.isConnected) return; const x = noms.children[i]; if (x) x.classList.add('on'); T3.piano(n.midi - 2, B.ac().currentTime + .01, .5, .3); })); });
  };
  /* definición: original → (cabeza) → otra tonalidad, a la vez */
  L.mentalDef = function (box, s, c) {
    if (s.titulo) box.appendChild(el('div', 'lam-tit', s.titulo));
    const f = el('div', 'md-fila'); box.appendChild(f);
    const paso = (cls, tit, sub) => { const d = el('div', 'md-paso ' + cls, '<b>' + tit + '</b><small>' + sub + '</small>'); f.appendChild(d); return d; };
    const a = paso('a', 'Partitura original', 'la de siempre · Re M'), fl1 = el('i', 'md-fl'); f.appendChild(fl1);
    const b = paso('b', 'En la cabeza', 'tonalidad nueva · mismo intervalo'), fl2 = el('i', 'md-fl'); f.appendChild(fl2);
    const d = paso('c', 'Suena en otra tonalidad', 'a la vez · Do M');
    [a, fl1, b, fl2, d].forEach((x, i) => B.espera((s.t || .4) + i * .55, c).then(ok => ok && x.classList.add('on')));
  };
  /* dos columnas: desventajas | ventajas, cada cosa a su tiempo (ens: fracciones de la frase o segundos si > 1) */
  L.balanza = function (box, s, c) {
    if (s.titulo) box.appendChild(el('div', 'lam-tit', s.titulo));
    const f = el('div', 'bal-fila'); box.appendChild(f);
    const dur = (B.motor && B.motor._durLinea) || 9;
    [['izq', s.izq, 'menos'], ['der', s.der, 'mas']].forEach(x => {
      const col = el('div', 'bal-col ' + x[2]); col.appendChild(el('b', 'bal-tit', x[1].tit)); f.appendChild(col);
      x[1].items.forEach((t, i) => { const it = el('div', 'bal-it', t); col.appendChild(it); const e = (x[1].ens || [])[i] || (i + 1); B.espera(e > 1 ? e : e * dur, c).then(ok => ok && it.classList.add('on')); });
    });
  };
  /* (T3, Iago 4-nov) el atril del pianista: la A4 sobre el atril de la imagen de fondo y el lápiz de la repisa.
     Las anotaciones van a su tiempo con la voz (sucesos «al» de la frase en data/t3.js): TR.lamina.anota(que, c), en cola. */
  L.atril = function (box, s, c) {
    const h = B.t3.hoja(box, { can: B.t3.cancion(), marcas: null });
    const lp = B.t3.lapices(box, h, { interactivo: false });
    L._atril = { h: h, lp: lp, box: box, cola: Promise.resolve() };
  };
  L.anota = function (que, c) {
    const A = L._atril; if (!A || !A.box.isConnected) return Promise.resolve();
    const h = A.h, n = h.sistemas.length, an = { anima: true, c: c };
    const todos = (tipo, o) => { let p = h.dibuja(tipo, 0, Object.assign({}, an, o)); for (let i = 1; i < n; i++) { const j = i; p = p.then(() => h.dibuja(tipo, j, Object.assign({}, an, o, { dur: .3 }))); } return p; };
    const hazlo = () => {
      if (c && c.muerto) return;
      if (que === 'texto') return h.dibuja('texto', 0, an);
      if (que === 'arm') return todos('arm', { dur: .8 });
      if (que === 'sol') return todos('sol', { dur: .7 });
      if (que === 'do') { let p = h.dibuja('do', 0, an); for (let i = 1; i < n; i++) { const j = i; p = p.then(() => h.dibuja('do', j, { anima: false })); } return p; }
      if (que === 'lee') return h.dibuja('lee', 0, an).then(() => h.dibuja('lee', 1, an));
      if (que === 'nombres') return h.dibuja('nombres', 0, an).then(() => h.dibuja('nombres', 1, an));
      if (que === 'dibujo') return h.dibuja('dibujo', 0, { anima: true, c: c, dur: .7 }).then(() => h.dibuja('dibujo', 1, { anima: true, c: c, dur: .7 }));
    };
    A.cola = A.cola.then(hazlo, hazlo);
    return A.cola;
  };
})(window.TR);
