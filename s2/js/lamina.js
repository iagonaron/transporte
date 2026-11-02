/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 2 · LÁMINAS DIBUJADAS EN CÓDIGO (DECISIONES 21:00: «láminas didácticas con notación musical se DIBUJAN en código»;
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
    const ex = s.ex, E = B.escrito;
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
    ex.notas.forEach((n, i) => B.espera(t0 + i * paso, c).then(ok => { if (!ok || !box.isConnected) return; pinta(i); if (s.suena !== false) B.viento.nota('chirimia', n.midi + ex.transp.dir * ex.transp.semis, B.ac().currentTime + .01, paso * .9, .32); }));
    B.espera(t0 + ex.notas.length * paso + .2, c).then(ok => { if (ok && box.isConnected) pinta(ex.notas.length); });
  };
  L.tarjeta = function (box, s) {
    if (s.titulo) box.appendChild(el('div', 'lam-tit', s.titulo));
    s.lineas.forEach(x => box.appendChild(el('p', '', x)));
  };
})(window.TR);
