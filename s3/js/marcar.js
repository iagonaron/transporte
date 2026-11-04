/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 3 · interactivo «marcar» (Iago 4-nov): después de la explicación del pianista, el ALUMNO coge el lápiz de la repisa
   del atril (pulsándolo o arrastrándolo: el cursor o el dedo pasa a ser el lápiz) y marca él mismo su partitura ANTES de tocar:
     1 · tacha la ARMADURA de TODOS los pentagramas, en el orden que quiera (cada una tachada se queda; «Tacha las armaduras (2/4)»)
     2 · tacha TODAS las claves de sol, igual
     3 · escribe UNA vez la clave de do en 4.ª, en cualquier pentagrama y en su línea: al acertar, el lápiz la escribe sola,
         escalonada, en los demás. Si la pone en otra línea, se le explica con suavidad y se borra.
   Un trazo que no vale se borra con una pista suave. Las marcas (sus propios trazos, uno por pentagrama: armS, solS) se guardan en
   la sesión (T3.guardaMarcas) y se quedan en claves, tiempo real y repeticiones. Volver a empezar este ejercicio las borra.
   (pruebas) TR._marcar = { paso(), hechos(), listo(), lapiz(), trazo(tipo, si) → [{x,y}…] px de pantalla, linea(li, si) → {x,y} }
   Chrome 94: sin ?. ni ??. Ratón y táctil (pointer events, touch-action:none).
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const I = B.inter, M = () => B.motor, V = () => B.viento, T3 = B.t3, el = B.el;
  const ORD = ['5.ª', '4.ª', '3.ª', '2.ª', '1.ª'];   // línea VexFlow 0 (arriba) = 5.ª contando desde abajo
  const NS = 'http://www.w3.org/2000/svg';

  I.marcar = function (cfg, c) {
    const p = B.$('#inter'); T3.prepAtril(p, 'i-marcar');
    T3.borraMarcas();   // empezar este ejercicio es lo único que borra las marcas
    const hoja = T3.hoja(p, { can: T3.cancion(), marcas: null });
    const SIS = hoja.sistemas, N = SIS.length;
    const PASOS = [
      { t: n => 'Tacha las armaduras (' + n + '/' + N + ')', s: 'los dos sostenidos de cada pentagrama: fuera' },
      { t: n => 'Tacha las claves de sol (' + n + '/' + N + ')', s: 'esta partitura no la lees en clave de sol' },
      { t: () => 'Escribe la clave de do en 4.ª', s: 'una vez, en la línea donde va su centro' }];
    const izq = el('div', 'at-panel izq'); p.appendChild(izq);
    izq.appendChild(el('small', 'at-ptit', 'Tu partitura · a lápiz'));
    const lista = el('ol', 'mc-pasos'); izq.appendChild(lista);
    const lis = PASOS.map((x, i) => { const li = el('li'); lista.appendChild(li); return li; });
    const der = el('div', 'at-panel der'); p.appendChild(der);
    const msg = el('div', 'at-msg'); der.appendChild(msg);
    const di = (t, cls) => { msg.className = 'at-msg on' + (cls ? ' ' + cls : ''); msg.innerHTML = t; };
    let paso = 0, sigue = null, listo = false, dibujando = null, son = null, fantasma = null;
    const hechos = [SIS.map(() => null), SIS.map(() => null)];   // trazos del alumno (uv) por pentagrama: armaduras · claves de sol
    const cuenta = i => hechos[i].filter(x => x).length;
    const pinta = () => lis.forEach((li, i) => {
      li.innerHTML = '<i>' + (i + 1) + '</i><span><b>' + PASOS[i].t(i < 2 ? cuenta(i) : 0) + '</b><small>' + PASOS[i].s + '</small></span>';
      li.classList.toggle('act', i === paso); li.classList.toggle('ya', i < paso); });
    const lp = T3.lapices(p, hoja, { interactivo: true, alCoger: () => { V().ui('clic');
      di(paso === 2 ? 'Ahora, la clave de do: pulsa (o arrastra) sobre la <b>línea</b> donde va su centro, en cualquier pentagrama.' : 'Ya tienes el lápiz. Tacha ' + (paso === 0 ? 'las <b>armaduras</b>' : 'las <b>claves de sol</b>') + ' de todos los pentagramas, en el orden que quieras.'); } });
    const amplia = (b, px, py) => ({ x: b.x - px, y: b.y - py, w: b.w + 2 * px, h: b.h + 2 * py });
    const dentro = (q, b) => q.x >= b.x && q.x <= b.x + b.w && q.y >= b.y && q.y <= b.y + b.h;
    const muestrea = pts => { const r = []; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], z = pts[i], n = Math.max(1, Math.ceil(Math.hypot(z.x - a.x, z.y - a.y) / 2)); for (let j = 0; j < n; j++) r.push({ x: a.x + (z.x - a.x) * j / n, y: a.y + (z.y - a.y) * j / n }); } if (pts.length) r.push(pts[pts.length - 1]); return r; };
    /* ¿qué marca de qué pentagrama toca el trazo? → { si, ok, uv } o una pista */
    function valida(tipo, pts) {
      const mu = muestrea(pts);
      let mejor = null;
      SIS.forEach((S, si) => {
        const k = hoja.cajas(S), b = tipo === 'arm' ? k.arm : k.sol; if (!b) return;
        const ms = mu.filter(q => dentro(q, amplia(b, 5, tipo === 'arm' ? 9 : 4)));
        if (ms.length && (!mejor || ms.length > mejor.ms.length)) mejor = { si: si, b: b, ms: ms };
      });
      if (!mejor) {
        const toca = SIS.some(S => { const k = hoja.cajas(S), o = tipo === 'arm' ? k.sol : k.arm; return o && mu.some(q => dentro(q, amplia(o, 3, 3))); });
        if (toca) return { ok: false, txt: tipo === 'arm' ? 'Eso es una <b>clave de sol</b>: las tacharás en el paso 2. Ahora, los <b>dos sostenidos</b> que van justo después.' : 'Las armaduras ya están. Ahora tacha las <b>claves de sol</b>, al principio de cada pentagrama.' };
        return { ok: false, txt: tipo === 'arm' ? 'Ese trazo no toca ninguna armadura: los <b>dos sostenidos</b> van justo después de cada clave de sol.' : 'Ese trazo no toca ninguna clave de sol: está al principio de cada pentagrama.' };
      }
      if (hechos[tipo === 'arm' ? 0 : 1][mejor.si]) return { ok: false, txt: 'Esa ya está tachada. Busca otro pentagrama.' };
      const b = mejor.b, xs = mejor.ms.map(q => q.x), ys = mejor.ms.map(q => q.y), sx = Math.max.apply(null, xs) - Math.min.apply(null, xs), sy = Math.max.apply(null, ys) - Math.min.apply(null, ys);
      if (tipo === 'arm' && sx < b.w * .62) return { ok: false, txt: 'Casi: alarga el trazo para que cruce <b>los dos</b> sostenidos.' };
      if (tipo === 'sol' && sy < b.h * .4 && sx < b.w * .6) return { ok: false, txt: 'Casi: haz el trazo un poco más largo, que cruce la clave de lado a lado.' };
      return { ok: true, si: mejor.si, uv: pts.map(q => [(q.x - b.x) / b.w, (q.y - b.y) / b.h]) };
    }
    const borra = g => { g.classList.add('borra'); setTimeout(() => g.remove(), 700); };
    /* ── dibujar con el lápiz (pasos 1 y 2) ── */
    hoja.capa.addEventListener('pointerdown', ev => {
      if (!lp.levantado() || listo || paso > 2) return;
      ev.preventDefault();
      if (hoja.capa.setPointerCapture) try { hoja.capa.setPointerCapture(ev.pointerId); } catch (e) { }
      const q = hoja.aLocal(ev.clientX, ev.clientY);
      if (paso === 2) { colocaFantasma(q); dibujando = { clave: true, q: q }; return; }
      dibujando = { pts: [q], g: hoja.trazoEl('M' + q.x + ' ' + q.y, 2.6, hoja.gVivo) };
      son = T3.sonLapiz();
    });
    hoja.capa.addEventListener('pointermove', ev => {
      const q = hoja.aLocal(ev.clientX, ev.clientY);
      if (paso === 2 && lp.levantado() && !listo) { colocaFantasma(q); if (dibujando && dibujando.clave) dibujando.q = q; }
      if (!dibujando || dibujando.clave) return;
      const u = dibujando.pts[dibujando.pts.length - 1], d = Math.hypot(q.x - u.x, q.y - u.y);
      if (d < 1.5) return;
      dibujando.pts.push(q); B.$$('path', dibujando.g).forEach(pa => pa.setAttribute('d', hoja.camino(dibujando.pts.map(z => [z.x, z.y]))));
      if (son) son.vel(d * 2);
    });
    const fin = ev => {
      if (!dibujando) return; const dd = dibujando; dibujando = null;
      if (son) { son.para(); son = null; }
      if (dd.clave) { const q = ev && ev.clientX != null ? hoja.aLocal(ev.clientX, ev.clientY) : dd.q; return ponClave(q); }
      if (dd.pts.length < 3) { dd.g.remove(); return; }
      const tipo = paso === 0 ? 'arm' : 'sol', r = valida(tipo, dd.pts);
      if (!r.ok) { V().ui('mal'); di(r.txt, 'mal'); setTimeout(() => borra(dd.g), 500); return; }
      hoja.gMarcas.appendChild(dd.g); hechos[paso][r.si] = r.uv; V().ui('ok');
      const n = cuenta(paso);
      if (n < N) di((tipo === 'arm' ? '¡Bien! Armadura tachada' : '¡Bien! Clave de sol tachada') + ': <b>' + n + ' de ' + N + '</b>. Sigue con los demás pentagramas.', 'ok');
      else if (tipo === 'arm') { paso = 1; di('¡Fuera todos los sostenidos: tocas en <b>Do M</b>! Ahora <b>tacha las claves de sol</b>.', 'ok'); }
      else { paso = 2; di('¡Bien! Ahora <b>escribe la clave de do en 4.ª</b> una vez: pulsa sobre la línea donde va su centro, en cualquier pentagrama.', 'ok'); }
      pinta();
    };
    hoja.capa.addEventListener('pointerup', fin);
    hoja.capa.addEventListener('pointercancel', () => { if (dibujando && dibujando.g) dibujando.g.remove(); dibujando = null; if (son) { son.para(); son = null; } if (fantasma) { fantasma.remove(); fantasma = null; } });
    /* ── paso 3: la clave de do, en el pentagrama y la línea que se elijan ── */
    function lineaDe(q) {
      let mejor = null;
      SIS.forEach((S, si) => { const k = hoja.cajas(S); if (q.y < k.lineas[0] - 2.5 * k.sp || q.y > k.lineas[4] + 2.5 * k.sp) return;
        k.lineas.forEach((y, li) => { const d = Math.abs(q.y - y); if (!mejor || d < mejor.d) mejor = { si: si, li: li, d: d }; }); });
      return mejor;
    }
    function colocaFantasma(q) {
      if (fantasma) { fantasma.remove(); fantasma = null; }
      const r = lineaDe(q); if (!r) return;
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'at-fantasma');
      hoja.dClaveDo(SIS[r.si], r.li).forEach((d, i) => { const pa = document.createElementNS(NS, 'path'); pa.setAttribute('d', d); pa.setAttribute('fill', 'none'); pa.setAttribute('stroke', '#3b3b3d'); pa.setAttribute('stroke-width', i ? 2 : 3.2); pa.setAttribute('stroke-linecap', 'round'); g.appendChild(pa); });
      hoja.gVivo.appendChild(g); fantasma = g;
    }
    let poniendo = false;
    function ponClave(q) {
      if (fantasma) { fantasma.remove(); fantasma = null; }
      if (poniendo) return;
      const r = lineaDe(q);
      if (!r) { di('Escríbela sobre un <b>pentagrama</b>, al principio: pulsa sobre una de sus líneas.', 'mal'); return; }
      poniendo = true;
      const antes = B.$$('.at-trazo', hoja.gMarcas).length;
      hoja.dibuja('do', r.si, { anima: true, linea: r.li, c: c }).then(() => {
        poniendo = false; if (c.muerto) return;
        const nuevos = B.$$('.at-trazo', hoja.gMarcas).slice(antes);
        if (r.li !== 1) {
          V().ui('mal');
          di('Así el do de la clave caería en la <b>' + ORD[r.li] + ' línea</b>' + (r.li === 2 ? ' (sería la clave de do en 3.ª)' : '') + '. Para este truco, su centro tiene que caer en la <b>4.ª línea</b>, contando desde abajo. Prueba otra vez.', 'mal');
          setTimeout(() => nuevos.forEach(borra), 1100); return;
        }
        V().ui('ok'); paso = 3; pinta(); termina(r.si);
      });
    }
    /* ── la clave de do, sola y escalonada en los demás pentagramas; las marcas, guardadas para toda la secuencia ── */
    function termina(hecha) {
      listo = true; T3.guardaMarcas({ armS: hechos[0], solS: hechos[1], do: 1 });
      di('¡Eso es! La escribo también en los demás pentagramas…', 'ok');
      let pr = Promise.resolve();
      SIS.forEach((S, si) => { if (si !== hecha) pr = pr.then(() => hoja.dibuja('do', si, { anima: true, c: c })); });
      pr.then(() => {
        if (c.muerto) return; lp.vuelve();
        di('Tu partitura ya está marcada: léela <b>en clave de do en 4.ª</b>, con la armadura de <b>Do M</b>. Pulsa <b>Continuar</b>.', 'ok');
        M().barraTexto('Partitura marcada. Pulsa <b>Continuar</b>.');
        M().esperaSigue(c).then(ok => sigue && sigue(ok));
        if (M().aula) B.espera(3, c).then(ok => ok && sigue && sigue(true));
      });
    }
    pinta(); di('Coge el <b>lápiz</b> de la repisa del atril: púlsalo o arrástralo.');
    /* (pruebas) */
    B._marcar = {
      paso: () => paso, listo: () => listo, hechos: () => [cuenta(0), cuenta(1)], N: N,
      lapiz: () => { const r = lp.rep.getBoundingClientRect(); return { x: r.left + r.width * .5, y: r.top + r.height * .5 }; },
      trazo: (tipo, si) => { const k = hoja.cajas(SIS[si || 0]), b = (tipo || (paso === 0 ? 'arm' : 'sol')) === 'arm' ? k.arm : k.sol; return [[b.x - 6, b.y + b.h * .85], [b.x + b.w * .5, b.y + b.h * .5], [b.x + b.w + 6, b.y + b.h * .15]].map(z => hoja.aPantalla(z[0], z[1])); },
      linea: (li, si) => { const k = hoja.cajas(SIS[si || 0]); return hoja.aPantalla(k.x0 + 30, k.lineas[li]); }
    };
    return M().cartel(cfg.cartel, { botones: [], aulaSolo: false }).then(() => new Promise(res => {
      sigue = res; c.alMorir.push(() => { if (son) son.para(); res(false); });
      if (cfg.cartelCorto) M().barraTexto(cfg.cartelCorto);
      if (M().aula) B.espera(4, c).then(ok => { if (!ok || listo) return; T3.guardaMarcas({ do: 1 }); hoja.marcasAlumno(); res(true); });
    }));
  };
})(window.TR);
