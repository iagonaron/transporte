/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 3 · interactivo «marcar» (Iago 4-nov): después de la explicación del pianista, el ALUMNO coge el lápiz de la repisa
   del atril (pulsándolo o arrastrándolo: el cursor o el dedo pasa a ser el lápiz) y marca él mismo su partitura ANTES de tocar:
     1 · tacha la armadura (un trazo que cruce los dos sostenidos)   2 · tacha la clave de sol
     3 · escribe la clave de do en 4.ª: la coloca en una línea (si no es la 4.ª, se le explica con suavidad y se borra)
   Un trazo que no vale se borra con una pista suave. Con las tres marcas, el lápiz las copia en los demás sistemas y se enciende
   «Continuar». Las marcas (sus propios trazos) se guardan en la sesión (T3.guardaMarcas) y se quedan en claves y tiempo real.
   Volver a empezar este ejercicio es lo único que las borra.
   (pruebas) TR._marcar = { paso(), trazo(n) → [{x,y}…] en px de pantalla para un trazo bueno, linea(li) → {x,y}, lapiz() → {x,y} }
   Chrome 94: sin ?. ni ??. Ratón y táctil (pointer events, touch-action:none).
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const I = B.inter, M = () => B.motor, V = () => B.viento, T3 = B.t3, el = B.el;
  const ORD = ['5.ª', '4.ª', '3.ª', '2.ª', '1.ª'];   // línea VexFlow 0 (arriba) = 5.ª contando desde abajo
  const PASOS = [
    { t: 'Tacha la armadura', s: 'los dos sostenidos: fuera' },
    { t: 'Tacha la clave de sol', s: 'esta partitura no la lees en clave de sol' },
    { t: 'Escribe la clave de do en 4.ª', s: 'pulsa en la línea donde va su centro' }];

  I.marcar = function (cfg, c) {
    const p = B.$('#inter'); T3.prepAtril(p, 'i-marcar');
    T3.borraMarcas();   // empezar este ejercicio es lo único que borra las marcas
    const hoja = T3.hoja(p, { can: T3.cancion(), marcas: null });
    const izq = el('div', 'at-panel izq'); p.appendChild(izq);
    izq.appendChild(el('small', 'at-ptit', 'Tu partitura · a lápiz'));
    const lista = el('ol', 'mc-pasos'); izq.appendChild(lista);
    const lis = PASOS.map((x, i) => { const li = el('li', '', '<i>' + (i + 1) + '</i><span><b>' + x.t + '</b><small>' + x.s + '</small></span>'); lista.appendChild(li); return li; });
    const der = el('div', 'at-panel der'); p.appendChild(der);
    const msg = el('div', 'at-msg'); der.appendChild(msg);
    const di = (t, cls) => { msg.className = 'at-msg on' + (cls ? ' ' + cls : ''); msg.innerHTML = t; };
    let paso = 0, sigue = null, listo = false, dibujando = null, son = null, fantasma = null;
    const alu = { arm: null, sol: null, do: null };
    const S0 = hoja.sistemas[0];
    const pinta = () => lis.forEach((li, i) => { li.classList.toggle('act', i === paso); li.classList.toggle('ya', i < paso); });
    const lp = T3.lapices(p, hoja, { interactivo: true, alCoger: () => { V().ui('clic'); di(paso === 2 ? 'Ahora, la clave de do: pulsa (o arrastra) sobre la <b>línea</b> donde va su centro.' : 'Ya tienes el lápiz. <b>' + PASOS[paso].t + '</b>: dibuja un trazo encima.'); } });
    /* la caja de la marca, ampliada un poco */
    const amplia = (b, px, py) => ({ x: b.x - px, y: b.y - py, w: b.w + 2 * px, h: b.h + 2 * py });
    const dentro = (q, b) => q.x >= b.x && q.x <= b.x + b.w && q.y >= b.y && q.y <= b.y + b.h;
    const muestrea = pts => { const r = []; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], z = pts[i], n = Math.max(1, Math.ceil(Math.hypot(z.x - a.x, z.y - a.y) / 2)); for (let j = 0; j < n; j++) r.push({ x: a.x + (z.x - a.x) * j / n, y: a.y + (z.y - a.y) * j / n }); } if (pts.length) r.push(pts[pts.length - 1]); return r; };
    function valida(tipo, pts) {
      const k = hoja.cajas(S0), b = tipo === 'arm' ? k.arm : k.sol; if (!b) return { ok: true };
      const bb = amplia(b, 5, tipo === 'arm' ? 9 : 4), ms = muestrea(pts).filter(q => dentro(q, bb));
      if (!ms.length) {
        const otra = tipo === 'arm' ? k.sol : k.arm, toca = otra && muestrea(pts).some(q => dentro(q, amplia(otra, 3, 3)));
        if (toca) return { ok: false, txt: tipo === 'arm' ? 'Eso es la <b>clave de sol</b>: la tacharás en el paso 2. Ahora, los <b>dos sostenidos</b> que van justo después.' : 'La armadura ya está. Ahora tacha la <b>clave de sol</b>, la del principio del pentagrama.' };
        return { ok: false, txt: tipo === 'arm' ? 'Ese trazo no toca la armadura. Los <b>dos sostenidos</b> están en el primer pentagrama, justo después de la clave de sol.' : 'Ese trazo no toca la clave de sol: está al principio del <b>primer pentagrama</b>.' };
      }
      const xs = ms.map(q => q.x), ys = ms.map(q => q.y), sx = Math.max.apply(null, xs) - Math.min.apply(null, xs), sy = Math.max.apply(null, ys) - Math.min.apply(null, ys);
      if (tipo === 'arm' && sx < b.w * .62) return { ok: false, txt: 'Casi: alarga el trazo para que cruce <b>los dos</b> sostenidos.' };
      if (tipo === 'sol' && sy < b.h * .4 && sx < b.w * .6) return { ok: false, txt: 'Casi: haz el trazo un poco más largo, que cruce la clave de lado a lado.' };
      return { ok: true, uv: pts.map(q => [(q.x - b.x) / b.w, (q.y - b.y) / b.h]) };
    }
    const borra = g => { g.classList.add('borra'); setTimeout(() => g.remove(), 700); };
    /* ── dibujar con el lápiz (pasos 1 y 2) ── */
    hoja.capa.addEventListener('pointerdown', ev => {
      if (!lp.levantado() || listo || paso > 2) return;
      ev.preventDefault();
      if (hoja.capa.setPointerCapture) try { hoja.capa.setPointerCapture(ev.pointerId); } catch (e) { }
      const q = hoja.aLocal(ev.clientX, ev.clientY);
      if (paso === 2) { colocaFantasma(q); dibujando = { clave: true, q: q }; return; }
      dibujando = { pts: [q], g: hoja.trazoEl('M' + q.x + ' ' + q.y, 2.6, hoja.gVivo), t: performance.now() };
      son = T3.sonLapiz();
    });
    hoja.capa.addEventListener('pointermove', ev => {
      const q = hoja.aLocal(ev.clientX, ev.clientY);
      if (paso === 2 && lp.levantado() && !listo) colocaFantasma(q);
      if (!dibujando || dibujando.clave) return;
      const u = dibujando.pts[dibujando.pts.length - 1], d = Math.hypot(q.x - u.x, q.y - u.y);
      if (d < 1.5) return;
      dibujando.pts.push(q); B.$$('path', dibujando.g).forEach(pa => pa.setAttribute('d', hoja.camino(dibujando.pts.map(z => [z.x, z.y]))));
      if (son) son.vel(d * 2);
    });
    const fin = ev => {
      if (!dibujando) return; const dd = dibujando; dibujando = null;
      if (son) { son.para(); son = null; }
      if (dd.clave) { const q = ev ? hoja.aLocal(ev.clientX, ev.clientY) : dd.q; return ponClave(q); }
      if (dd.pts.length < 3) { dd.g.remove(); return; }
      const tipo = paso === 0 ? 'arm' : 'sol', r = valida(tipo, dd.pts);
      if (!r.ok) { V().ui('mal'); di(r.txt, 'mal'); setTimeout(() => borra(dd.g), 500); return; }
      hoja.gMarcas.appendChild(dd.g); alu[tipo] = r.uv; V().ui('ok');
      di(tipo === 'arm' ? '¡Eso es! Fuera los dos sostenidos: tocas en <b>Do M</b>. Ahora <b>tacha la clave de sol</b>.' : '¡Bien! Ahora <b>escribe la clave de do en 4.ª</b>: pulsa sobre la línea donde va su centro.', 'ok');
      paso++; pinta();
    };
    hoja.capa.addEventListener('pointerup', fin); hoja.capa.addEventListener('pointercancel', () => { if (dibujando && dibujando.g) dibujando.g.remove(); dibujando = null; if (son) { son.para(); son = null; } });
    /* ── paso 3: la clave de do, en la línea que se elija ── */
    const lineaDe = q => { const k = hoja.cajas(S0); if (q.y < k.lineas[0] - 2.5 * k.sp || q.y > k.lineas[4] + 2.5 * k.sp) return -1; let mi = 0, dm = 1e9; k.lineas.forEach((y, i) => { const d = Math.abs(q.y - y); if (d < dm) { dm = d; mi = i; } }); return mi; };
    function colocaFantasma(q) {
      const li = lineaDe(q); if (fantasma) { fantasma.remove(); fantasma = null; } if (li < 0) return;
      fantasma = el('i'); const g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'at-fantasma');
      hoja.dClaveDo(S0, li).forEach((d, i) => { const pa = document.createElementNS('http://www.w3.org/2000/svg', 'path'); pa.setAttribute('d', d); pa.setAttribute('fill', 'none'); pa.setAttribute('stroke', '#3b3b3d'); pa.setAttribute('stroke-width', i ? 2 : 3.2); pa.setAttribute('stroke-linecap', 'round'); g.appendChild(pa); });
      hoja.gVivo.appendChild(g); fantasma = g;
    }
    function ponClave(q) {
      if (fantasma) { fantasma.remove(); fantasma = null; }
      const li = lineaDe(q);
      if (li < 0) { di('Escríbela en el <b>primer pentagrama</b>, al principio: pulsa sobre una de sus líneas.', 'mal'); return; }
      const antes = B.$$('.at-trazo', hoja.gMarcas).length;
      hoja.dibuja('do', 0, { anima: true, linea: li, c: c }).then(() => {
        if (c.muerto) return;
        const nuevos = B.$$('.at-trazo', hoja.gMarcas).slice(antes);
        if (li !== 1) {
          V().ui('mal');
          di('Así el do de la clave caería en la <b>' + ORD[li] + ' línea</b>' + (li === 2 ? ' (sería la clave de do en 3.ª)' : '') + '. Para este truco, su centro tiene que caer en la <b>4.ª línea</b>, contando desde abajo. Prueba otra vez.', 'mal');
          setTimeout(() => nuevos.forEach(borra), 1100); return;
        }
        alu.do = 1; V().ui('ok'); paso = 3; pinta(); termina();
      });
    }
    /* ── las tres marcas: el lápiz las copia en los demás sistemas; se guardan para toda la secuencia ── */
    function termina() {
      listo = true; T3.guardaMarcas({ arm: alu.arm, sol: alu.sol, do: 1 });
      di('¡Tu partitura ya está marcada! Copio las mismas marcas en los demás pentagramas…', 'ok');
      let pr = Promise.resolve();
      hoja.sistemas.slice(1).forEach((S, j) => { pr = pr.then(() => hoja.dibuja('arm', j + 1, { anima: true, dur: .35, alu: T3.marcas, c: c })).then(() => hoja.dibuja('sol', j + 1, { anima: true, dur: .3, alu: T3.marcas, c: c })).then(() => hoja.dibuja('do', j + 1, { anima: true, c: c })); });
      pr.then(() => {
        if (c.muerto) return; lp.vuelve();
        di('Ya puedes leer la partitura <b>en clave de do en 4.ª</b>, con la armadura de <b>Do M</b>. Pulsa <b>Continuar</b>.', 'ok');
        M().barraTexto('Partitura marcada. Pulsa <b>Continuar</b>.');
        M().esperaSigue(c).then(ok => sigue && sigue(ok));
        if (M().aula) B.espera(3, c).then(ok => ok && sigue && sigue(true));
      });
    }
    pinta(); di('Coge el <b>lápiz</b> de la repisa del atril: púlsalo o arrástralo.');
    /* (pruebas) */
    B._marcar = {
      paso: () => paso, listo: () => listo,
      lapiz: () => { const r = lp.rep.getBoundingClientRect(); return { x: r.left + r.width * .5, y: r.top + r.height * .5 }; },
      trazo: tipo => { const k = hoja.cajas(S0), b = (tipo || (paso === 0 ? 'arm' : 'sol')) === 'arm' ? k.arm : k.sol; return [[b.x - 6, b.y + b.h * .85], [b.x + b.w * .5, b.y + b.h * .5], [b.x + b.w + 6, b.y + b.h * .15]].map(z => hoja.aPantalla(z[0], z[1])); },
      linea: li => { const k = hoja.cajas(S0); return hoja.aPantalla(k.x0 + 30, k.lineas[li]); }
    };
    return M().cartel(cfg.cartel, { botones: [], aulaSolo: false }).then(() => new Promise(res => {
      sigue = res; c.alMorir.push(() => { if (son) son.para(); res(false); });
      if (cfg.cartelCorto) M().barraTexto(cfg.cartelCorto);
      if (M().aula) B.espera(4, c).then(ok => { if (!ok || listo) return; T3.guardaMarcas({ arm: null, sol: null, do: 1 }); hoja.marcasAlumno(); res(true); });
    }));
  };
})(window.TR);
