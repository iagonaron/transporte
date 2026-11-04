/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 3 · interactivos del TRANSPORTE MENTAL (estética «Onda», 2.ª persona, fallos sin castigo):
     agudo        · camerino: la cantante intenta el agudo de la canción (Re M) y se le rompe la voz (mp3 de A o sintetizado)
     claves       · leer la melodía en clave de do en 4.ª (fantasma) con la armadura de Do M y tocarla en el teclado (una 8.ª arriba)
     mental       · TIEMPO REAL: la partitura original (Re M) avanza con un cursor; tocas cada nota una 2.ª M más grave antes de que pase.
                    Tres tempos (lento: el cursor te espera · medio · de concierto), acompañamiento de piano en Do M y «voz guía»
     recital      · suena la canción transportada (mp3 de A o, si falta, piano + voz guía), con sus láminas a su compás
     mentalFinal  · ejercicio final OPCIONAL: 3 melodías del generador (TR_ESC) para transportar en la cabeza, con nota
   (pruebas) TR._mental = { estado(), toca(midi), objetivo() } mientras hay uno en marcha.
   Chrome 94: sin ?. ni ??.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const I = B.inter, M = () => B.motor, V = () => B.viento, T3 = B.t3, el = B.el;
  const RAP = () => B.param('rapido') === '1';
  const btn = (txt, cls, fn, tit) => T3.btn(txt, cls, fn, tit);
  const oct = m => Math.floor(m / 12) - 1;
  const nomM = (m, f) => T3.nombrePc(m % 12, f);
  const nomOct = (m, f) => nomM(m, f).toLowerCase() + oct(m);

  /* ══════════ VISTA DE LA PARTITURA con cursor ══════════
     notas: [{ l, a, o, dur, beats, c (compás relativo 0…), t (pulsos desde el principio), i }] → páginas de 8 compases (2 sistemas de 4) */
  function vista(host, notas, op) {
    const caja = el('div', 'mt-part'); host.appendChild(caja);
    const ncomp = notas.length ? notas[notas.length - 1].c + 1 : 1, porS = op.porSistema || 4, porP = op.porPagina || 8;
    const sist = []; let pag = -1, mapa = {};
    function pagina(p) {
      if (p === pag) return; pag = p; caja.innerHTML = ''; sist.length = 0; mapa = {};
      for (let s0 = p * porP; s0 < Math.min(ncomp, (p + 1) * porP); s0 += porS) {
        const w = el('div', 'mt-sis'), h = el('div', 'mt-pe'); w.appendChild(h); caja.appendChild(w);
        const comps = []; for (let k = s0; k < Math.min(ncomp, s0 + porS); k++) comps.push(notas.filter(n => n.c === k));
        const geo = T3.pinta(h, comps, { fifths: op.fifths, num: op.num, den: op.den, ancho: op.ancho || 1050, alto: op.alto || 115, y: op.y == null ? 12 : op.y, sinCompas: s0 > 0, final: s0 + porS >= ncomp, margen: op.margen != null ? op.margen : (op.fantasma ? 48 : null), ancho1: s0 > 0 ? 60 + Math.max(2, Math.abs(op.fifths || 0)) * 11 : null });
        if (op.fantasma) { const h2 = el('div', 'mt-fan'); w.appendChild(h2); T3.fantasma(h2, geo, { tachaArm: op.fifths, armTxt: op.armTxt || 'Do M' }); }
        const cur = el('i', 'mt-cursor'); w.appendChild(cur);
        cur.style.top = ((geo.yTop - 22) / geo.H * 100) + '%'; cur.style.height = ((geo.yBot - geo.yTop + 44) / geo.H * 100) + '%';
        const last = geo.staves[geo.staves.length - 1], fin = last.getX() + last.getWidth() - 4;
        const S = { w: w, geo: geo, cur: cur, fin: fin, desde: s0 };
        geo.notas.forEach(g => { mapa[g.i] = { g: g, s: S }; if (estados[g.i]) marca(g.i, estados[g.i]); });
        if (op.etiquetas) { const et = el('div', 'mt-et'); w.appendChild(et); S.et = et; }
        sist.push(S);
      }
    }
    const estados = {};
    function marca(i, cls) {
      estados[i] = cls; const m = mapa[i]; if (!m || !m.g.el) return;
      ['n-act', 'n-ok', 'n-mal', 'n-pasa', 'n-ayuda'].forEach(k => m.g.el.classList.remove(k)); if (cls) m.g.el.classList.add(cls);
    }
    function etiqueta(i, txt, cls) {
      const m = mapa[i]; if (!m || !m.s.et) return;
      let e = B.$('[data-i="' + i + '"]', m.s.et); if (!e) { e = el('span', 'mt-etq'); e.dataset.i = i; m.s.et.appendChild(e); }
      e.style.left = (m.g.x / m.s.geo.W * 100) + '%'; e.className = 'mt-etq ' + (cls || ''); e.innerHTML = txt;
    }
    function cursor(bpos) {
      /* la nota bajo el cursor y la siguiente → x interpolada */
      let k = -1; for (let j = 0; j < notas.length; j++) { if (notas[j].t <= bpos + 1e-6) k = j; else break; }
      const n = notas[Math.max(0, k)]; pagina(Math.floor(n.c / porP));
      sist.forEach(S => { S.cur.style.opacity = '0'; });
      const m = mapa[n.i]; if (!m) return;
      let x;
      if (k < 0) x = m.g.x - 34;
      else {
        const sig = notas[k + 1], ms = sig ? mapa[sig.i] : null, x1 = ms && ms.s === m.s ? ms.g.x : m.s.fin;
        const fr = B.clamp((bpos - n.t) / n.beats, 0, 1); x = m.g.x + (x1 - m.g.x) * fr;
      }
      m.s.cur.style.left = (x / m.s.geo.W * 100) + '%'; m.s.cur.style.opacity = '1';
    }
    pagina(0);
    return { pagina: pagina, marca: marca, cursor: cursor, etiqueta: etiqueta, apaga: () => sist.forEach(S => { S.cur.style.opacity = '0'; }), el: caja, sistemas: () => sist };
  }

  /* ══════════ EJECUTOR en tiempo real ══════════
     o = { notas, objetivo(n) → midi, bpm, espera, guia() → bool, num, acorde(compás, pulso) → {bajo, notas} | null, v (vista),
           alEstado(n, estado, extra), alFin(res), c } → { tecla(m, porTecla), para(), estado() } */
  function ejecutor(o) {
    const C = B.ac(), bps = (RAP() ? o.bpm * 4 : o.bpm) / 60, ns = o.notas, N = ns.length;
    const total = N ? ns[N - 1].t + ns[N - 1].beats : 0, cuenta = o.num || 3;
    const est = ns.map(() => ({ hit: false, pasa: false, mal: 0 }));
    let bpos = -cuenta, ult = B.ahora(), vivo = true, congelado = false, raf = 0, ultPulso = -cuenta - 1, ultOnset = -1;
    const spb = 1 / bps;
    /* (Iago 4-nov) METRÓNOMO: un compás de entrada siempre (con la cuenta visible, o.alPulso) y, a tempo (no en el lento, que
       espera), el clic sigue mientras se toca si está encendido (o.metro()). El acompañamiento se apaga con un fundido en el último compás. */
    const ultComp = Math.ceil(total / cuenta) - 1;
    function pulsoAudio(p) {
      if (p < 0) { tic(p === -cuenta); if (o.alPulso) o.alPulso(p + cuenta, true); return; }
      const comp = Math.floor(p / cuenta), pu = p - comp * cuenta;
      if (!o.espera) { if (o.metro && o.metro()) tic(pu === 0); if (o.alPulso) o.alPulso(pu, false); }
      const a = o.acorde ? o.acorde(comp, pu) : null;
      if (!a) return;
      const t = C.currentTime + .005;
      if (comp >= ultComp) { if (pu === 0) { T3.piano(a.bajo, t, spb * cuenta * 1.5, .19); T3.acorde(a.notas, t + spb, spb * cuenta * 1.1, .12); } return; }   // último compás: se deja sonar y se apaga
      if (pu === 0) T3.piano(a.bajo, t, spb * cuenta * .9, .22);   // vals: el bajo en la 1.ª parte, el acorde en la 2.ª y la 3.ª
      else T3.acorde(a.notas, t, spb * .8, .16);
    }
    /* clic de claves (madera): golpe resonante muy corto; el primer tiempo, más agudo y más fuerte */
    function tic(fuerte) {
      try {
        const t = C.currentTime + .005, f = fuerte ? 2650 : 2050, os = C.createOscillator(), g = C.createGain(), bp = C.createBiquadFilter();
        os.type = 'sine'; os.frequency.setValueAtTime(f * 1.04, t); os.frequency.exponentialRampToValueAtTime(f, t + .02);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(fuerte ? .34 : .22, t + .0015); g.gain.exponentialRampToValueAtTime(.0004, t + (fuerte ? .085 : .06));
        os.connect(g); g.connect(B.bus.ui); os.start(t); os.stop(t + .1);
        const r = B.ruido(), rg = C.createGain(); bp.type = 'bandpass'; bp.frequency.value = f * 1.6; bp.Q.value = 3;
        rg.gain.setValueAtTime(fuerte ? .22 : .14, t); rg.gain.exponentialRampToValueAtTime(.0004, t + .018); r.connect(bp); bp.connect(rg); rg.connect(B.bus.ui); r.start(t); r.stop(t + .03);
      } catch (e) { }
    }
    const ventana = i => { const n = ns[i], prev = ns[i - 1], e = Math.min(.35, prev ? prev.beats * .45 : .35); return [n.t - e, n.t + n.beats]; };
    function bucle() {
      if (!vivo) return;
      const ah = B.ahora(), dt = Math.min(.1, Math.max(0, ah - ult)); ult = ah;
      /* modo lento: el cursor ESPERA al final de la nota que aún no has tocado */
      let objetivoB = bpos + dt * bps;
      if (o.espera) for (let i = 0; i < N; i++) { const tope = ns[i].t + ns[i].beats * .8; if (!est[i].hit && tope <= objetivoB) { objetivoB = Math.min(objetivoB, Math.max(bpos, tope)); congelado = true; break; } }   // se para a 4/5 de la nota: el cursor sigue encima de ella
      if (!o.espera || objetivoB > bpos) { if (objetivoB > bpos + 1e-4) congelado = false; bpos = Math.max(bpos, objetivoB); }
      /* pulsos (claqueta y acompañamiento) */
      const p = Math.floor(bpos + 1e-6);
      while (ultPulso < p && ultPulso < Math.ceil(total)) { ultPulso++; if (ultPulso < Math.ceil(total)) pulsoAudio(ultPulso); }
      /* comienzo de nota: voz guía */
      for (let i = ultOnset + 1; i < N && ns[i].t <= bpos + 1e-6; i++) {
        ultOnset = i; o.v.marca(ns[i].i, est[i].hit ? 'n-ok' : 'n-act');
        if (o.guia && o.guia()) T3.coro(o.objetivo(ns[i]), C.currentTime + .01, Math.max(.15, ns[i].beats * spb * .95), .3);   // (4-nov) coro «ooh», sin estirar
        if (o.alEstado) o.alEstado(ns[i], 'empieza');
      }
      /* las que se han pasado sin tocar */
      for (let i = 0; i < N; i++) if (!est[i].hit && !est[i].pasa && bpos >= ns[i].t + ns[i].beats + .04) { est[i].pasa = true; o.v.marca(ns[i].i, 'n-pasa'); if (o.alEstado) o.alEstado(ns[i], 'pasa'); }
      o.v.cursor(Math.min(bpos, total - .001));
      if (bpos >= total + .6) return acaba();
      raf = requestAnimationFrame(bucle);
    }
    function acaba() {
      if (!vivo) return; vivo = false; cancelAnimationFrame(raf); o.v.apaga();
      const ok = est.filter(x => x.hit).length, prim = est.filter(x => x.hit && !x.mal).length;
      if (o.alFin) o.alFin({ ok: ok, prim: prim, total: N });
    }
    function tecla(m, porTecla) {
      if (!vivo) return;
      /* candidatas: las notas cuya ventana contiene el cursor y que aún no se han tocado (primero la más antigua) */
      const cand = []; for (let i = 0; i < N; i++) { const w = ventana(i); if (!est[i].hit && !est[i].pasa && bpos >= w[0] && bpos < w[1] + (o.espera ? 99 : .04)) cand.push(i); }
      const prox = cand.length ? cand[0] : (function () { for (let i = 0; i < N; i++) if (!est[i].hit && !est[i].pasa) return i; return -1; })();
      const obj = prox >= 0 ? o.objetivo(ns[prox]) : null;
      let acierto = -1; cand.forEach(i => { if (acierto < 0 && ((o.objetivo(ns[i]) - m) % 12 + 12) % 12 === 0) acierto = i; });
      if (acierto >= 0) {
        const i = acierto, mo = o.objetivo(ns[i]); est[i].hit = true;
        T3.piano(mo, C.currentTime + .005, Math.max(.25, ns[i].beats * spb * .95), .5);
        o.v.marca(ns[i].i, 'n-ok'); if (o.alEstado) o.alEstado(ns[i], 'ok', { m: m, mo: mo, porTecla: porTecla });
        if (o.espera) congelado = false;
        return { ok: true, i: i };
      }
      const suena = obj != null ? T3.aOctava(m, obj) : m;
      T3.piano(suena, C.currentTime + .005, .3, .26);
      if (prox >= 0 && cand.length) { est[prox].mal++; if (o.alEstado) o.alEstado(ns[prox], 'mal', { m: suena, mo: obj }); }
      return { ok: false, i: prox };
    }
    raf = requestAnimationFrame(bucle);
    if (o.c) o.c.alMorir.push(() => { vivo = false; cancelAnimationFrame(raf); });
    return { tecla: tecla, para: () => { vivo = false; cancelAnimationFrame(raf); }, estado: () => ({ bpos: bpos, est: est, congelado: congelado, vivo: vivo }),
      objetivo: () => { for (let i = 0; i < N; i++) if (!est[i].hit && !est[i].pasa && bpos >= ventana(i)[0]) return o.objetivo(ns[i]); return null; } };
  }

  /* la canción (o un trozo) re-temporizada desde 0, con los compases relativos */
  function trozo(can, desde, hasta) {
    const l = can.notas.filter(n => n.c >= desde && n.c < hasta), t0 = l.length ? l[0].t : 0;
    return l.map(n => Object.assign({}, n, { t: n.t - t0, c: n.c - desde, cAbs: n.c }));
  }
  /* acompañamiento de la canción en Do M (2.ª M ↓): acordes de melodia.json, [cifrado, nº de negras] por compás */
  function acompana(can, desde, semis) {
    const A = {}; (can.acordes || []).forEach(x => { A[x.c - 1] = x.acordes; });
    return (comp, pu) => {
      const l = A[comp + desde]; if (!l) return null;
      let acc = 0; for (let k = 0; k < l.length; k++) { if (pu < acc + l[k][1]) return T3.acordeDe(l[k][0], semis == null ? -2 : semis); acc += l[k][1]; }
      return null;
    };
  }

  /* ════════ agudo: el original (Re M) se rompe en el la5 ════════ */
  I.agudo = function (cfg, c) {
    B.$('#escena').classList.remove('con-inter');
    const C = B.ac();
    if (cfg.mp3 && B.buf[cfg.mp3]) { const h = B.suena(cfg.mp3, { bus: B.bus.sfx, vol: 1, grupo: 'sfx' }); if (V().suelta) V().suelta(h); return B.espera(RAP() ? .3 : B.buf[cfg.mp3].duration + .2, c); }
    /* sintetizado: compases 12–13 del original (mi5 fa♯5 sol5 | la5), piano + voz (oboe) que se quiebra en el la5 */
    const can = T3.cancion(), spb = 60 / 72, t0 = C.currentTime + .15;
    const ns = can.notas.filter(n => n.c === 11 || n.c === 12);
    const ini = ns.length ? ns[0].t : 0, acc = acompana(can, 0, 0);
    [11, 12].forEach((cm, k) => { const a = acc(cm, 0) || T3.acordeDe(cm === 11 ? 'A7' : 'D', 0); const t = t0 + k * 3 * spb; T3.piano(a.bajo, t, 3 * spb * .9, .2); T3.acorde(a.notas, t + spb, spb * .8, .14); if (k === 0) T3.acorde(a.notas, t + 2 * spb, spb * .8, .14); });
    let tq = null;
    ns.forEach(n => { const t = t0 + (n.t - ini) * spb, d = n.beats * spb;
      if (n.midi >= 81) { tq = t; if (cfg.sfx && B.buf[cfg.sfx]) B.sfx(cfg.sfx, .9); else V().quiebra('oboe', n.midi, t, d * .9, .7); }
      else V().nota('oboe', n.midi, t, d * .95, .55); });
    return B.espera(RAP() ? .3 : (ns.length ? (ns[ns.length - 1].t - ini + 2.2) * spb + .6 : 4), c);
  };

  /* ════════ claves: leer en clave de do en 4.ª ════════ */
  I.claves = function (cfg, c) {
    /* (Iago 4-nov) en el atril: la A4 con las marcas a lápiz del alumno (T3.marcas), sin clave fantasma */
    const p = B.$('#inter'); T3.prepAtril(p, 'i-mental i-claves');
    /* (Iago 4-nov) TODA la página seguida: los 8 compases de los 4 pentagramas, nota a nota; el cursor va de pentagrama en pentagrama */
    const can = T3.cancion(), rg = cfg.compases || [0, 8], notas = trozo(can, rg[0], rg[1]);
    const NAYUDA = cfg.ayudaNombres != null ? cfg.ayudaNombres : notas.filter(n => n.c < 2).length;   // nombres a lápiz bajo las notas: solo en el 1.er pentagrama
    const hoja = T3.hoja(p, { can: can, marcas: 'alumno' });
    const cab = el('div', 'at-panel izq'); p.appendChild(cab);
    cab.appendChild(el('div', 'mt-lado', '<small>Lo que está impreso</small><b>Clave de sol · Re M</b>'));
    cab.appendChild(el('div', 'mt-lado', '<small>Lo que lees, con tus marcas</small><b class="cian">Clave de do en 4.ª · Do M</b><small>y suena una 8.ª más arriba</small>'));
    const prog = el('div', 'mt-prog'); cab.appendChild(prog);
    const v = T3.vistaAtril(hoja, notas);
    const der = el('div', 'at-panel der'); p.appendChild(der);
    const msg = el('div', 'at-msg'); der.appendChild(msg);
    const tw = el('div', 'mt-tw'); p.appendChild(tw);
    let k = Math.min(cfg.ejemplo || 0, notas.length), fallos = 0, listo = false, sigue = null, aciertos = 0;
    const cuenta = el('div', 'cl-cuenta'); cab.appendChild(cuenta);
    const pintaCuenta = () => { cuenta.innerHTML = 'Aciertos a la primera: <b>' + aciertos + '</b> · nota <b>' + Math.min(k + 1, notas.length) + '</b> de ' + notas.length; };
    const objetivo = n => { const t = T3.enTenor(n); return t.midi; };
    const pintaProg = () => { prog.innerHTML = notas.map((n, i) => '<i class="' + (i < k ? 'ya' : i === k ? 'act' : '') + '"></i>').join(''); };
    /* la del ejemplo (la primera), resuelta */
    for (let i = 0; i < k; i++) { const t = T3.enTenor(notas[i]); v.marca(notas[i].i, 'n-ok'); v.etiqueta(notas[i].i, '<s>' + T3.nombre(notas[i].l, notas[i].a) + '</s><b>' + T3.NOM[t.l] + '</b>', 'ok'); }
    const di = (t, cls) => { msg.className = 'at-msg on' + (cls ? ' ' + cls : ''); msg.innerHTML = t; };
    function marcaAct() {
      pintaProg();
      pintaCuenta();
      if (k >= notas.length) { v.apaga(); return; }
      v.marca(notas[k].i, 'n-act'); v.etiqueta(notas[k].i, '?', 'act'); v.cursor(notas[k].t + .001);
    }
    function toca(m, porTecla) {
      if (k >= notas.length) { T3.piano(m, 0, .4, .3); return; }
      const n = notas[k], mo = objetivo(n), t = T3.enTenor(n);
      if ((((mo - m) % 12) + 12) % 12 === 0) {
        T3.piano(mo, 0, .6, .5); V().ui('ok');
        if (!fallos) aciertos++;
        v.marca(n.i, fallos >= 2 ? 'n-ayuda' : 'n-ok');
        if (k < NAYUDA) v.etiqueta(n.i, '<s>' + T3.nombre(n.l, n.a) + '</s><b>' + T3.NOM[t.l] + '</b>', 'ok'); else v.etiqueta(n.i, '', 'vacia');
        if (!porTecla && m !== mo) di('¡Sí, <b>' + T3.NOM[t.l] + '</b>! Recuerda: suena <b>una 8.ª más arriba</b> de lo que lees en clave de do: <b>' + nomOct(mo, 0) + '</b>.', 'ok');
        else di('¡Sí! <b>' + T3.nombre(n.l, n.a) + '</b> en clave de sol se lee <b>' + T3.NOM[t.l] + '</b> en clave de do en 4.ª.', 'ok');
        k++; fallos = 0; marcaAct();
        if (k >= notas.length) termina();
        return;
      }
      fallos++; T3.piano(T3.aOctava(m, mo), 0, .3, .25); tec.marca(m, 'mal', 380);
      if (fallos === 1) di('Todavía no. En clave de do en 4.ª, <b>la 4.ª línea es Do</b>: cuenta desde ahí.', 'mal');
      else { di('Está en <b>' + T3.lugar(T3.pos(n)) + '</b>: en clave de do en 4.ª ahí va el <b>' + T3.NOM[t.l].toLowerCase() + '</b>. Tócalo.', 'mal'); tec.marca(mo, 'pista', 1400); }
    }
    function termina() {
      di('¡Página entera! <b>' + aciertos + ' de ' + notas.length + '</b> a la primera. Cada nota, <b>una 2.ª más abajo</b>: ya estás tocando en <b>Do M</b>, sin escribir nada.', 'ok');
      const C = B.ac(); let t = C.currentTime + .5; notas.forEach(n => { T3.piano(objetivo(n), t, n.beats * .55, .4); t += n.beats * .6; });
      if (!listo) { listo = true; M().barraTexto('¡Lectura por claves completa: <b>' + aciertos + ' de ' + notas.length + '</b> a la primera! Pulsa <b>Continuar</b>.'); M().esperaSigue(c).then(ok => sigue && sigue(ok)); }
    }
    const tec = T3.teclado(tw, { desde: 60, hasta: 83, base: 72, alTocar: toca });
    c.alMorir.push(() => tec.fuera());
    marcaAct(); di('Lee la nota iluminada en <b>clave de do en 4.ª</b> y tócala.');
    B._mental = { toca: m => toca(m, false), objetivo: () => k < notas.length ? objetivo(notas[k]) : null, estado: () => ({ k: k, total: notas.length, aciertos: aciertos }) };
    return M().cartel(cfg.cartel, { botones: [], aulaSolo: false }).then(() => new Promise(res => {
      sigue = res; c.alMorir.push(() => res(false)); if (cfg.cartelCorto) M().barraTexto(cfg.cartelCorto);
    }));
  };

  /* ════════ metrónomo visual: un punto que late y la cuenta de entrada «1 · 2 · 3»; botón para silenciarlo (encendido) ════════ */
  function metronomo(host, num) {
    const w = el('div', 'mt-metro'); host.appendChild(w);
    const pt = el('i', 'mt-punto'); w.appendChild(pt);
    const cu = el('div', 'mt-cuenta'); w.appendChild(cu);
    let on = true;
    const b = btn('', 'mt-guia mt-bmetro', () => { on = !on; pinta(); }, 'Metrónomo');
    const pinta = () => { b.innerHTML = '<i></i>Metrónomo · ' + (on ? 'sí' : 'no'); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); };
    pinta();
    let nn = num || 3; const num_ = () => nn;
    const cuenta = (n, k) => { cu.innerHTML = []
      .concat(Array.apply(null, Array(n)).map((_, i) => '<span class="' + (i < k ? 'ya' : '') + (i === k - 1 ? ' act' : '') + '">' + (i + 1) + '</span>')).join('<em>·</em>'); };
    return {
      el: w, boton: b, on: () => on,
      pulso(pu, entrada) {
        pt.classList.remove('late', 'fuerte'); void pt.offsetWidth; pt.classList.add('late'); if (pu === 0 || (entrada && pu === 1)) pt.classList.add('fuerte');
        if (entrada) { w.classList.add('entrada'); cuenta(num_(), pu); if (pu >= num_()) setTimeout(() => w.classList.remove('entrada'), 380); }
        else w.classList.remove('entrada');
      },
      reinicia() { w.classList.remove('entrada'); cu.innerHTML = ''; },
      num(n) { nn = n || 3; }
    };
  }

  /* ════════ panel común del tiempo real (mental y mentalFinal) ════════ */
  function panelReal(p, titIzq, titDer, hoja) {
    if (hoja) {   // (atril) paneles a los lados de la A4; la capa de «Empezar» y el resultado, encima de la hoja
      const cab = el('div', 'at-panel izq'); p.appendChild(cab);
      const izq = el('div', 'mt-lado', titIzq); cab.appendChild(izq);
      const der = el('div', 'mt-lado', titDer); cab.appendChild(der);
      const chips = el('div', 'mt-chips'); cab.appendChild(chips);
      const pd = el('div', 'at-panel der'); p.appendChild(pd);
      const msg = el('div', 'at-msg'); pd.appendChild(msg);
      const tw = el('div', 'mt-tw'); p.appendChild(tw);
      const capa = el('div', 'mt-capa'); p.appendChild(capa); const r = hoja.rect();
      capa.style.cssText = 'left:' + r.x + 'px;top:' + r.y + 'px;width:' + r.w + 'px;height:' + r.h + 'px;transform:none';
      return { cab: cab, izq: izq, der: der, chips: chips, zona: null, msg: msg, tw: tw, capa: capa,
        di(t, cls) { msg.className = 'at-msg on' + (cls ? ' ' + cls : ''); msg.innerHTML = t; } };
    }
    const cab = el('div', 'mt-cab'); p.appendChild(cab);
    const izq = el('div', 'mt-lado', titIzq); cab.appendChild(izq);
    const chips = el('div', 'mt-chips'); cab.appendChild(chips);
    const der = el('div', 'mt-lado der', titDer); cab.appendChild(der);
    const zona = el('div', 'mt-zona'); p.appendChild(zona);
    const msg = el('div', 'mt-msg'); p.appendChild(msg);
    const tw = el('div', 'mt-tw'); p.appendChild(tw);
    const capa = el('div', 'mt-capa'); p.appendChild(capa);   // «▶ Empezar» y el resultado, encima de la partitura
    return { cab: cab, izq: izq, der: der, chips: chips, zona: zona, msg: msg, tw: tw, capa: capa,
      di(t, cls) { msg.className = 'mt-msg on' + (cls ? ' ' + cls : ''); msg.innerHTML = t; } };
  }

  /* ════════ mental: tiempo real con la canción ════════ */
  I.mental = function (cfg, c) {
    /* (Iago 4-nov) en el atril, con las marcas del alumno; solo los 8 primeros compases (lo que cabe en la hoja): ahí acaba */
    const p = B.$('#inter'); T3.prepAtril(p, 'i-mental i-real');
    const can = T3.cancion(), TEMPOS = (cfg.tempos || [{ nombre: 'Lento', bpm: 50, espera: true, guia: true }, { nombre: 'Medio', bpm: 66 }, { nombre: 'De concierto', bpm: 80 }]).map(x => Object.assign({}, x, { compases: [0, 8] }));
    const hoja = T3.hoja(p, { can: can, marcas: 'alumno' });
    const P = panelReal(p, '<small>Partitura impresa</small><b>Re M · 2♯</b>', '<small>Tú tocas · una 2.ª M ↓</small><b class="cian">Do M · sin alteraciones</b>', hoja);
    const MT = metronomo(P.cab, can.num);
    let k = 0, ej = null, v = null, tec = null, guia = true, listo = false, sigue = null;
    const res = TEMPOS.map(() => null);
    const bGuia = btn('', 'mt-guia', () => { guia = !guia; pintaGuia(); }, 'Voz guía: canta la nota que tienes que tocar');
    const pintaGuia = () => { bGuia.innerHTML = '<i></i>Voz guía · ' + (guia ? 'sí' : 'no'); bGuia.classList.toggle('on', guia); bGuia.setAttribute('aria-pressed', guia ? 'true' : 'false'); };
    const bOtra = btn('↻ Repetir este tempo', '', () => empieza(k)), bSig = btn('Siguiente tempo ▶', 'prim', () => empieza(k + 1));
    bOtra.style.display = 'none'; bSig.style.display = 'none';
    function chips() {
      P.chips.innerHTML = '';
      TEMPOS.forEach((x, i) => { const d = el('div', 'mt-chip' + (i === k ? ' act' : '') + (res[i] ? ' ya' : ''), '<b>' + x.nombre + '</b><small>negra = ' + x.bpm + (res[i] ? ' · ' + res[i].ok + '/' + res[i].total : '') + '</small>'); P.chips.appendChild(d); });
      P.chips.appendChild(bGuia); P.chips.appendChild(MT.boton);
    }
    function monta(i) {
      const tp = TEMPOS[i], rg = tp.compases || [0, 8], ns = trozo(can, rg[0], rg[1]);
      v = T3.vistaAtril(hoja, ns); MT.reinicia();
      return ns;
    }
    function empieza(i) {
      if (ej) ej.para(); k = i; bOtra.style.display = 'none'; bSig.style.display = 'none';
      const tp = TEMPOS[k]; guia = !!tp.guia; pintaGuia(); chips();
      const ns = monta(k), rg = tp.compases || [0, 16];
      P.capa.innerHTML = ''; P.capa.className = 'mt-capa on';
      const b = btn('▶ Empezar · ' + tp.nombre + ' <small>negra = ' + tp.bpm + (tp.espera ? ' · el cursor te espera' : '') + '</small>', 'prim mt-empieza', () => arranca(ns, rg));
      P.capa.appendChild(b); setTimeout(() => { if (b.isConnected) b.focus(); }, 60);
      P.di(tp.espera ? 'Tempo lento: el cursor <b>te espera</b> en cada nota hasta que la toques.' : 'Ahora el cursor <b>no espera</b>: si se te pasa una, sigue con la siguiente.');
      if (M().aula) B.espera(2.5, c).then(ok => ok && b.isConnected && b.click());
    }
    function arranca(ns, rg) {
      P.capa.className = 'mt-capa'; P.capa.innerHTML = '';
      const tp = TEMPOS[k]; let ok = 0;
      M().barraTexto(cfg.cartelCorto || '');
      ej = ejecutor({ notas: ns, objetivo: n => n.midi - 2, bpm: tp.bpm, espera: !!tp.espera, guia: () => guia, num: can.num, acorde: acompana(can, rg[0]), v: v, c: c,
        metro: MT.on, alPulso: MT.pulso,
        alEstado: (n, e, x) => {
          if (e === 'ok') { ok++; P.di('<b>' + nomM(n.midi - 2, 0) + '</b> ✓ · aciertos: <b>' + ok + '</b>', 'ok'); }
          else if (e === 'mal') P.di('Esa era <b>' + nomM(x.m, 0) + '</b>; aquí va <b>' + nomM(x.mo, 0) + '</b> (lo escrito, ' + T3.nombre(n.l, n.a) + ', una 2.ª M más grave). ¡Sigue!', 'mal');
          else if (e === 'pasa') P.di('Se te ha pasado una: no pasa nada, <b>sigue</b> con la siguiente.', 'pasa');
        },
        alFin: r => { res[k] = r; ej = null; chips(); fin(r); } });
      B._mental.ej = ej;
      P.di('Escucha el compás de entrada (<b>1 · 2 · 3</b>) y… <b>¡toca!</b>');
    }
    function fin(r) {
      const pc = Math.round(r.ok / Math.max(1, r.total) * 100);
      P.capa.className = 'mt-capa on res'; P.capa.innerHTML = '<div class="mt-res"><small>' + TEMPOS[k].nombre + '</small><b>' + r.ok + ' de ' + r.total + '</b><span>' +
        (pc >= 90 ? '¡Como un pianista de oficio!' : pc >= 60 ? '¡Muy bien! Con práctica, cada vez más fácil.' : 'El transporte mental exige mucha práctica: ¡sigue intentándolo!') + '</span></div>';
      V().ui(pc >= 60 ? 'ok' : 'clic');
      bOtra.style.display = '';
      if (k < TEMPOS.length - 1) { bSig.style.display = ''; M().barraTexto('Pulsa <b>Siguiente tempo</b> (o repite este).'); setTimeout(() => bSig.focus(), 60); }
      else if (!listo) { listo = true; M().barraTexto('¡Ensayo hecho a tempo de concierto! Pulsa <b>Continuar</b> (o repite un tempo).'); M().esperaSigue(c).then(ok => sigue && sigue(ok)); }
      if (M().aula) B.espera(3, c).then(ok => { if (!ok) return; if (k < TEMPOS.length - 1) empieza(k + 1); else if (sigue) sigue(true); });
    }
    tec = T3.teclado(P.tw, { desde: 60, hasta: 83, base: 60, alTocar: (m, porTecla) => { if (ej) { const r = ej.tecla(m, porTecla); if (!r.ok) tec.marca(m, 'mal', 300); } else T3.piano(m, 0, .4, .3); } });
    c.alMorir.push(() => { tec.fuera(); if (ej) ej.para(); });
    B._mental = { toca: m => tec && (ej ? ej.tecla(m, false) : null), objetivo: () => ej ? ej.objetivo() : null, estado: () => ({ k: k, res: res, ej: ej ? ej.estado() : null }), empieza: () => { const b = B.$('.mt-empieza', p); if (b) b.click(); } };
    chips(); monta(0);
    return M().cartel(cfg.cartel, { botones: [bOtra, bSig], aulaSolo: false }).then(() => new Promise(r => {
      sigue = r; c.alMorir.push(() => r(false)); if (cfg.cartelCorto) M().barraTexto(cfg.cartelCorto);
      empieza(0);
    }));
  };

  /* ════════ recital: la canción transportada ════════ */
  I.recital = function (cfg, c) {
    if (cfg.sinMp3 === 'agudo' && !(cfg.mp3 && B.buf[cfg.mp3])) return I.agudo({ sfx: cfg.sfx }, c);   // sin el mp3 de A: el agudo sintetizado
    const Mo = M(), p = B.$('#inter'); B.$('#escena').classList.remove('con-inter');
    p.innerHTML = ''; p.className = 'on i-recital';
    const rot = el('div', 'rc-rot', cfg.rotulo || 'Do M'); p.appendChild(rot);
    const bSig = btn('Continuar ▶', 'prim rc-sig', () => acaba(true)); p.appendChild(bSig);
    requestAnimationFrame(() => requestAnimationFrame(() => rot.classList.add('on')));
    /* (Iago 4-nov) el rótulo solo al empezar (3,5 s) y se desvanece: no tapa la cara de la cantante */
    B.espera(RAP() ? .1 : (cfg.rotuloDura || 3.5), c).then(ok => ok && rot.classList.remove('on'));
    const can = T3.cancion(), C = B.ac();
    let h = null, fin = false, res = null, dur;
    const INTRO = 2, spbMp3 = 60 / (can.tempo || 80);
    if (cfg.mp3 && B.buf[cfg.mp3]) {
      h = B.suena(cfg.mp3, { bus: B.bus.sfx, vol: 1, grupo: 'sfx' }); if (V().suelta) V().suelta(h); dur = B.buf[cfg.mp3].duration;
      const c1 = cfg.c1 != null ? cfg.c1 : INTRO * can.num * spbMp3;   // segundo en que empieza el c. 1 en el mp3 (A: 4,80 s)
      B.arr(cfg.imgs).forEach(x => B.espera(RAP() ? .05 : (x.t != null ? x.t : c1 + x.c * can.num * spbMp3), c).then(ok => ok && !fin && Mo.cambia(x.img)));
      /* (Iago 4-nov) la voz interior de Noa (t3_015n) sobre la canción, que baja unos 8 dB (ducking suave) y vuelve a subir */
      const IN = cfg.interior;
      if (IN && !RAP()) B.espera(IN.t, c).then(ok => {   // (en ?rapido=1 no: se solaparía con las frases siguientes)
        if (!ok || fin) return;
        const gg = h.gan.gain, t = C.currentTime, base = gg.value; gg.cancelScheduledValues(t); gg.setValueAtTime(base, t); gg.setTargetAtTime(base * Math.pow(10, (IN.duck || -8) / 20), t, .35);
        bSig.style.visibility = 'hidden';
        if (IN.img) Mo.cambia(IN.img);
        Mo.di(Object.assign({ auto: .2 }, IN.linea), c).then(ok2 => { if (!fin) Mo.calla(); bSig.style.visibility = ''; if (!fin && h) { const t2 = C.currentTime; gg.cancelScheduledValues(t2); gg.setValueAtTime(gg.value, t2); gg.setTargetAtTime(base, t2, .6); } });
      });
    } else {
      /* sin el mp3: piano (acordes de melodia.json) + la melodía en Do M con la voz guía (oboe), a negra = 76 */
      const spb = 60 / 76, t0 = C.currentTime + .3, acc = acompana(can, 0);
      for (let cm = -INTRO; cm < 16; cm++) for (let pu = 0; pu < can.num; pu++) {
        const a = acc(Math.max(0, cm), cm < 0 ? 0 : pu) || T3.acordeDe('D', -2); const t = t0 + ((cm + INTRO) * can.num + pu) * spb;
        if (pu === 0) T3.piano(a.bajo, t, can.num * spb * .92, .22); else T3.acorde(a.notas, t, spb * .85, .15);
      }
      can.notas.forEach(n => V().nota('oboe', n.midi - 2, t0 + (INTRO * can.num + n.t) * spb, n.beats * spb * .95, .6));
      dur = (INTRO * can.num + can.total) * spb + 1.4;
      B.arr(cfg.imgs).forEach(x => x.c != null && B.espera(RAP() ? .05 : .3 + (INTRO + x.c) * can.num * spb, c).then(ok => ok && !fin && Mo.cambia(x.img)));
    }
    return new Promise(r => {
      res = r;
      B.espera(RAP() ? .4 : dur + .2, c).then(ok => acaba(ok));
      c.alMorir.push(() => acaba(false));
    });
    function acaba(ok) {
      if (fin) return; fin = true;
      if (h && ok) try { h.parar(.6); } catch (e) { }
      if (ok) { V().parar(); T3.calla(); }
      res(ok);
    }
  };

  /* ════════ mentalFinal: ejercicio final opcional con el generador (estética de consola) ════════
     (Iago 4-nov) GUIADO en cada melodía, antes de tocar: 1 · ventana «¿A qué tonalidad transportas?» · 2 · «¿Qué armadura tiene?»
     · 3 · tachar con un trazo de luz la armadura original · 4 · tachar la clave de sol y elegir la clave que ayuda (2.ª M ↓ → do en 4.ª;
     2.ª M ↑ → do en 3.ª; en las dos se toca una 8.ª más arriba de lo que se lee) · 5 · compás de entrada, metrónomo y a tocar.
     Para que el método por claves valga siempre, el generador se limita a 2.ªs mayores (↑ y ↓). Las marcas se quedan al repetir. */
  const NIV = [{ n: 1, bpm: 60, espera: true, nombre: 'Melodía 1 · el cursor te espera' }, { n: 2, bpm: 56, espera: false, nombre: 'Melodía 2 · a tempo' }, { n: 3, bpm: 60, espera: false, nombre: 'Melodía 3 · a tempo' }];
  function genera(n) {
    for (let i = 0; i < 400; i++) { const ex = B.escrito.generar(n); if (ex && ex.transp.semis === 2 && ex.transp.dgrado === 1 && !ex.notas.some(x => x.dur === '16')) return ex; }
    for (let i = 0; i < 400; i++) { const ex = B.escrito.generar(1); if (ex && ex.transp.semis === 2) return ex; }
    return B.escrito.generar(1);
  }
  const NOMBRE_T = ['Do', 'Re♭', 'Re', 'Mi♭', 'Mi', 'Fa', 'Fa♯', 'Sol', 'La♭', 'La', 'Si♭', 'Si'];
  const CLAVES = { do4: 'Clave de do en 4.ª', do3: 'Clave de do en 3.ª', do1: 'Clave de do en 1.ª', fa4: 'Clave de fa en 4.ª' };
  const baraja = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = r[i]; r[i] = r[j]; r[j] = t; } return r; };
  /* sonido del trazo de luz: un zumbido suave que sigue a la velocidad */
  function sonLuz() {
    const C = B.ac(), o = C.createOscillator(), o2 = C.createOscillator(), g = C.createGain(), f = C.createBiquadFilter();
    o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = 880; o2.frequency.value = 1320; f.type = 'lowpass'; f.frequency.value = 3000; g.gain.value = 0;
    o.connect(f); o2.connect(f); f.connect(g); g.connect(B.bus.sfx); o.start(); o2.start();
    let vivo = true;
    return { vel(v) { if (!vivo) return; const t = C.currentTime, x = Math.min(1, v / 40); g.gain.setTargetAtTime(.018 + .05 * x, t, .02); o.frequency.setTargetAtTime(760 + 600 * x, t, .03); o2.frequency.setTargetAtTime(1200 + 700 * x, t, .03); },
      para() { if (!vivo) return; vivo = false; const t = C.currentTime; g.gain.setTargetAtTime(0, t, .04); o.stop(t + .3); o2.stop(t + .3); } };
  }
  I.mentalFinal = function (cfg, c) {
    const p = B.$('#inter'); p.innerHTML = ''; p.className = 'on i-mental i-real i-final';
    const P = panelReal(p, '', '');
    /* fila bajo la partitura: los pasos guiados y el metrónomo */
    const fila = el('div', 'mf-fila'); p.insertBefore(fila, P.msg);
    const MT = metronomo(fila, 3); MT.el.classList.add('en-final');
    let k = 0, ej = null, v = null, guia = false, ex = null, listo = false, fase = 0, ns = null, semis = 0, capaLuz = null, dib = null, sonL = null, popAct = null;
    const notasF = [];
    const bGuia = btn('', 'mt-guia', () => { guia = !guia; pintaGuia(); }, 'Voz guía: canta la nota que tienes que tocar');
    const pintaGuia = () => { bGuia.innerHTML = '<i></i>Voz guía · ' + (guia ? 'sí' : 'no'); bGuia.classList.toggle('on', guia); bGuia.setAttribute('aria-pressed', guia ? 'true' : 'false'); };
    const bSig = btn('Siguiente melodía ▶', 'prim', () => { k++; monta(); });
    const bOtra = btn('↻ Repetir esta melodía', '', () => listoParaTocar(true));
    const bFin = btn('Terminar', 'disc', () => acaba(true), 'Terminar el ejercicio y seguir con la historia');
    bSig.style.display = 'none'; bOtra.style.display = 'none';
    const pasosEl = el('div', 'mf-pasos'); fila.insertBefore(pasosEl, MT.el);
    const PASOS = ['Tonalidad', 'Armadura', 'Tacha la armadura', 'Clave', 'A tocar'];
    const pintaPasos = () => { const f = Math.floor(fase); pasosEl.innerHTML = PASOS.map((t, i) => '<span class="' + (i < f ? 'ya' : i === f ? 'act' : '') + '"><i>' + (i + 1) + '</i>' + t + '</span>').join(''); };
    function chips() {
      P.chips.innerHTML = '';
      NIV.forEach((x, i) => { const d = el('div', 'mt-chip' + (i === k ? ' act' : '') + (notasF[i] != null ? ' ya' : ''), '<b>' + (i + 1) + '</b><small>' + (notasF[i] != null ? Math.round(notasF[i] * 100) + ' %' : x.espera ? 'te espera' : 'a tempo') + '</small>'); P.chips.appendChild(d); });
      P.chips.appendChild(bGuia); P.chips.appendChild(MT.boton);
    }
    /* ── ventana emergente de la consola, centrada sobre el teclado (la partitura queda a la vista) ── */
    function pop(titulo, ops, okIdx, pista, alAcertar) {
      cierraPop();
      const w = el('div', 'mf-pop'); const caja = el('div', 'mf-caja'); w.appendChild(caja);
      caja.appendChild(el('b', 'mf-tit', titulo));
      const fila = el('div', 'mf-ops'); caja.appendChild(fila);
      const nota = el('p', 'mf-pista'); caja.appendChild(nota);
      let resuelto = false;
      baraja(ops.map((t, i) => i)).forEach(i => {
        const b = btn(ops[i], 'mf-op', () => {
          if (resuelto || b.classList.contains('mal')) return;
          if (i === okIdx) { resuelto = true; b.classList.add('ok'); V().ui('ok'); setTimeout(() => { cierraPop(); alAcertar(); }, RAP() ? 50 : 750); }
          else { b.classList.add('mal'); V().ui('mal'); nota.innerHTML = pista; nota.classList.add('on'); }
        });
        b.dataset.i = i; fila.appendChild(b);
      });
      p.appendChild(w); popAct = { w: w, ok: okIdx };
      requestAnimationFrame(() => requestAnimationFrame(() => w.classList.add('on')));
    }
    function cierraPop() { if (popAct) { const w = popAct.w; w.classList.remove('on'); setTimeout(() => w.remove(), 250); popAct = null; } }
    /* ── la capa de luz sobre el pentagrama (unidades del viewBox de VexFlow) ── */
    const S0 = () => v.sistemas()[0];
    function prepCapa() {
      const S = S0(), pe = S.geo.svg.parentNode; pe.style.position = 'relative';
      capaLuz = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); capaLuz.setAttribute('class', 'mf-luz'); capaLuz.setAttribute('viewBox', '0 0 ' + S.geo.W + ' ' + S.geo.H);
      pe.appendChild(capaLuz);
      capaLuz.addEventListener('pointerdown', ev => { if (fase !== 2 && fase !== 3.1) return; ev.preventDefault(); try { capaLuz.setPointerCapture(ev.pointerId); } catch (e) { } const q = aVb(ev); dib = { pts: [q], el: linea([q]) }; sonL = sonLuz(); });
      capaLuz.addEventListener('pointermove', ev => { if (!dib) return; const q = aVb(ev), u = dib.pts[dib.pts.length - 1], d = Math.hypot(q.x - u.x, q.y - u.y); if (d < 1) return; dib.pts.push(q); dib.el.setAttribute('points', dib.pts.map(z => z.x.toFixed(1) + ',' + z.y.toFixed(1)).join(' ')); if (sonL) sonL.vel(d * 3); });
      const suelta = () => { if (!dib) return; const d = dib; dib = null; if (sonL) { sonL.para(); sonL = null; } valida(d); };
      capaLuz.addEventListener('pointerup', suelta); capaLuz.addEventListener('pointercancel', () => { if (dib) dib.el.remove(); dib = null; if (sonL) { sonL.para(); sonL = null; } });
    }
    function aVb(ev) { const pt = capaLuz.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; const m = capaLuz.getScreenCTM(); const q = pt.matrixTransform(m.inverse()); return { x: q.x, y: q.y }; }
    function linea(pts) { const l = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'); l.setAttribute('class', 'mf-trazo'); l.setAttribute('points', pts.map(z => z.x + ',' + z.y).join(' ')); capaLuz.appendChild(l); return l; }
    const caja = sel => { const g = S0().geo.svg.querySelector(sel); if (!g) return null; const b = g.getBBox(); return b.width ? b : null; };
    function valida(d) {
      const esArm = fase === 2, b = caja(esArm ? '.vf-keysignature' : '.vf-clef');
      if (d.pts.length < 3 || !b) { d.el.remove(); return; }
      const bb = { x: b.x - 4, y: b.y - (esArm ? 7 : 3), w: b.width + 8, h: b.height + (esArm ? 14 : 6) };
      const ms = [];
      for (let i = 1; i < d.pts.length; i++) { const a = d.pts[i - 1], z = d.pts[i], n = Math.max(1, Math.ceil(Math.hypot(z.x - a.x, z.y - a.y))); for (let j = 0; j <= n; j++) { const q = { x: a.x + (z.x - a.x) * j / n, y: a.y + (z.y - a.y) * j / n }; if (q.x >= bb.x && q.x <= bb.x + bb.w && q.y >= bb.y && q.y <= bb.y + bb.h) ms.push(q); } }
      const sx = ms.length ? Math.max.apply(null, ms.map(q => q.x)) - Math.min.apply(null, ms.map(q => q.x)) : 0, sy = ms.length ? Math.max.apply(null, ms.map(q => q.y)) - Math.min.apply(null, ms.map(q => q.y)) : 0;
      const ok = esArm ? sx >= b.width * .6 : (sy >= b.height * .4 || sx >= b.width * .6);
      if (!ok) { V().ui('mal'); d.el.classList.add('borra'); setTimeout(() => d.el.remove(), 600);
        P.di(ms.length ? 'Casi: alarga el trazo para que cruce ' + (esArm ? 'toda la armadura' : 'la clave de lado a lado') + '.' : 'Ese trazo no toca ' + (esArm ? 'la <b>armadura</b>: va justo después de la clave de sol' : 'la <b>clave de sol</b>, al principio del pentagrama') + '.', 'mal'); return; }
      V().ui('ok'); d.el.classList.add('fija');
      if (esArm) { rotulo(); fase = 3; pintaPasos(); P.di('Ahora <b>tacha la clave de sol</b> con otro trazo.'); fase = 3.1; }
      else { fase = 3.2; pasoClave(); }
    }
    /* la tonalidad y armadura nuevas, escritas en luz encima de la armadura tachada */
    function rotulo() {
      const b = caja('.vf-keysignature') || caja('.vf-clef'), t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', b.x + b.width / 2 + (caja('.vf-keysignature') ? 0 : 30)); t.setAttribute('y', S0().geo.yTop - 24); t.setAttribute('text-anchor', 'middle'); t.setAttribute('class', 'mf-rot');
      t.textContent = ex.destino.name + ' M' + (ex.destino.fifths ? ' · ' + T3.armTxt(ex.destino.fifths) : ''); capaLuz.appendChild(t);
    }
    /* la clave que ayuda, dibujada en luz a la izquierda de la de sol tachada (VexFlow: tenor = do en 4.ª, alto = do en 3.ª) */
    function dibujaClave(tipo) {
      const S = S0(), VF = Vex.Flow, tmp = el('div'); tmp.style.cssText = 'position:absolute;left:-9999px;top:0'; document.body.appendChild(tmp);
      const r = new VF.Renderer(tmp, VF.Renderer.Backends.SVG); r.resize(S.geo.W, S.geo.H); const ctx = r.getContext(); ctx.setFillStyle('#63e6ff'); ctx.setStrokeStyle('#63e6ff');
      const st = new VF.Stave(S.geo.staves[0].getX() - 50, S.geo.staves[0].getY(), 60); st.addClef(tipo);
      st.setConfigForLines([0, 1, 2, 3, 4].map(() => ({ visible: false }))); st.setBegBarType(VF.Barline.type.NONE); st.setEndBarType(VF.Barline.type.NONE);
      st.setContext(ctx).draw();
      const cl = tmp.querySelector('.vf-clef'), g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'mf-clave');
      if (cl) g.appendChild(cl); capaLuz.appendChild(g); tmp.remove();
    }
    function pasoClave() {
      const baja = ex.transp.dir < 0, okK = baja ? 'do4' : 'do3', ks = ['do4', 'do3', 'do1', 'fa4'];
      pop('¿Qué clave te ayuda a leerla ' + ex.transp.corto + '?', ks.map(x => CLAVES[x]), ks.indexOf(okK),
        'Piensa dónde cae el do: con la <b>clave de do en 4.ª</b>, cada nota se lee una 2.ª más abajo; con la <b>de do en 3.ª</b>, una 2.ª más arriba. En las dos se toca una 8.ª más arriba de lo que se lee.',
        () => { dibujaClave(baja ? 'tenor' : 'alto'); P.di('<b>' + CLAVES[okK] + '</b>: lee cada nota en esa clave y tócala <b>una 8.ª más arriba</b>. Así sale ' + ex.transp.lbl.toLowerCase() + '.', 'ok'); listoParaTocar(false); });
    }
    /* ── cada melodía: los pasos guiados y luego a tocar ── */
    function monta() {
      if (ej) ej.para(); bSig.style.display = 'none'; bOtra.style.display = 'none'; cierraPop();
      const nv = NIV[k]; ex = genera(nv.n); guia = false; pintaGuia(); chips(); fase = 0; pintaPasos();
      ns = ex.notas.map((x, i) => { const n = T3.nota(x.step.toLowerCase(), x.alter, x.octave, x.dur, x.compas); n.i = i; return n; });
      let t = 0; ns.forEach(n => { n.t = t; t += n.beats; });
      semis = ex.transp.dir * ex.transp.semis;
      P.izq.innerHTML = '<small>Melodía ' + (k + 1) + ' de 3 · original</small><b>' + ex.key.name + ' M · ' + T3.armTxt(ex.key.fifths) + '</b>';
      P.der.innerHTML = '<small>Tú tocas · ' + ex.transp.corto + '</small><span class="mt-fila"><b class="cian" id="mfDest">¿…?</b></span>';
      P.zona.innerHTML = ''; v = vista(P.zona, ns, { fifths: ex.key.fifths, num: ex.compas.num, den: ex.compas.den, porSistema: 4, porPagina: 4, ancho: 1050, alto: 125, y: 16, margen: 56 });
      prepCapa();
      P.capa.innerHTML = ''; P.capa.className = 'mt-capa';
      M().barraTexto('Antes de tocar, prepara la partitura: tonalidad, armadura, tachar y clave.');
      /* 1 · la tonalidad nueva */
      const tn = ex.destino.name, otras = [];
      [ex.transp.dir * -2, 1 * ex.transp.dir, 0, 4 * ex.transp.dir, -1].forEach(d => { const pc = ((ex.key.step === 'C' ? 0 : { D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[ex.key.step]) + (ex.key.alter || 0) + d + 24) % 12; const nm = NOMBRE_T[pc]; if (nm !== tn && otras.indexOf(nm) < 0 && otras.length < 3) otras.push(nm); });
      const ops1 = [tn].concat(otras).map(x => x + ' M');
      P.di('Esta melodía está en <b>' + ex.key.name + ' M</b> y la tocas <b>' + ex.transp.lbl.toLowerCase() + '</b>.');
      pop('¿A qué tonalidad transportas?', ops1, 0, 'La tónica también se mueve <b>' + ex.transp.lbl.toLowerCase() + '</b>: de <b>' + ex.key.name + '</b>, un tono más ' + (ex.transp.dir > 0 ? 'arriba' : 'abajo') + '.', () => {
        B.$('#mfDest').textContent = tn + ' M'; fase = 1; pintaPasos();
        /* 2 · su armadura */
        const f = ex.destino.fifths, cands = [f]; [f + 2 * ex.transp.dir, f - 2 * ex.transp.dir, ex.key.fifths, f + 1].forEach(x => { if (Math.abs(x) <= 6 && cands.indexOf(x) < 0 && cands.length < 4) cands.push(x); });
        const txt = x => x === 0 ? 'Sin alteraciones' : T3.armTxt(x);
        pop('¿Qué armadura tiene ' + tn + ' M?', cands.map(txt), 0, 'Una 2.ª mayor ' + (ex.transp.dir > 0 ? '↑ suma dos sostenidos (o quita dos bemoles)' : '↓ suma dos bemoles (o quita dos sostenidos)') + ': de ' + T3.armTxt(ex.key.fifths) + ', cuenta dos.', () => {
          B.$('#mfDest').textContent = tn + ' M · ' + T3.armTxt(f); fase = 2; pintaPasos();
          /* 3 · tachar la armadura (si la hay) */
          if (!ex.key.fifths) { rotulo(); P.di(ex.key.name + ' M no lleva armadura: nada que tachar. Ahora <b>tacha la clave de sol</b> con un trazo.'); fase = 3.1; pintaPasos(); return; }
          P.di('Tacha la <b>armadura original</b>: haz un trazo encima, con el ratón o con el dedo.');
        });
      });
    }
    function listoParaTocar(repite) {
      fase = 4; pintaPasos(); bOtra.style.display = 'none'; bSig.style.display = 'none';
      P.capa.innerHTML = ''; P.capa.className = 'mt-capa on';
      const nv = NIV[k], b = btn('▶ ' + (repite ? 'Otra vez · ' : 'Empezar · ') + nv.nombre, 'prim mt-empieza', () => arranca()); P.capa.appendChild(b);
      setTimeout(() => { if (b.isConnected) b.focus(); }, 60);
      M().barraTexto(cfg.cartelCorto || '');
    }
    function arranca() {
      P.capa.className = 'mt-capa'; P.capa.innerHTML = '';
      const nv = NIV[k]; let ok = 0;
      ns.forEach(n => v.marca(n.i, null));
      MT.num(ex.compas.den === 8 ? 3 : ex.compas.num); MT.reinicia();
      ej = ejecutor({ notas: ns, objetivo: n => n.midi + semis, bpm: nv.bpm, espera: nv.espera, guia: () => guia, num: ex.compas.den === 8 ? 3 : ex.compas.num, acorde: null, v: v, c: c, metro: MT.on, alPulso: MT.pulso,
        alEstado: (n, e, x) => {
          if (e === 'ok') { ok++; P.di('<b>' + nomM(n.midi + semis, ex.destino.fifths) + '</b> ✓', 'ok'); }
          else if (e === 'mal') P.di('Esa era <b>' + nomM(x.m, ex.destino.fifths) + '</b>; aquí va <b>' + nomM(x.mo, ex.destino.fifths) + '</b>. ¡Sigue!', 'mal');
          else if (e === 'pasa') P.di('Se te ha pasado una: <b>sigue</b>.', 'pasa');
        },
        alFin: r => { ej = null; notasF[k] = Math.max(notasF[k] || 0, r.ok / Math.max(1, r.total)); chips(); finMel(r); } });
      B._mental.ej = ej;
      P.di('Compás de entrada (<b>1 · 2 · 3</b>) y… <b>¡toca!</b>');
    }
    function finMel(r) {
      P.capa.className = 'mt-capa on res'; P.capa.innerHTML = '<div class="mt-res"><small>Melodía ' + (k + 1) + '</small><b>' + Math.round(r.ok / Math.max(1, r.total) * 100) + ' %</b><span>' + r.ok + ' de ' + r.total + ' notas</span></div>';
      bOtra.style.display = '';
      if (k < NIV.length - 1) { bSig.style.display = ''; M().barraTexto('Melodía ' + (k + 1) + ': <b>' + Math.round(notasF[k] * 100) + ' %</b>. Pulsa <b>Siguiente melodía</b> (o repítela).'); setTimeout(() => bSig.focus(), 60); }
      else {
        const media = notasF.reduce((a, b) => a + b, 0) / notasF.length, nota = Math.round(media * 100) / 10;
        B.notaFinal = nota; try { B.guarda('tr_t3_nota', { nota: nota, cuando: Date.now() }); } catch (e) { }
        bFin.style.display = 'none';
        M().barraTexto('Tus tres melodías: ' + notasF.map(x => Math.round(x * 100) + ' %').join(' · ') + '. <b>Nota: ' + String(nota).replace('.', ',') + '</b>');
        if (!listo) { listo = true; M().esperaSigue(c).then(ok => acaba(ok)); }
      }
    }
    let resolver = null, hecho = false;
    function acaba(ok) { if (hecho) return; hecho = true; if (ej) ej.para(); cierraPop(); B.$('#cartel').classList.remove('on'); if (resolver) resolver(ok); }
    const tw = P.tw, tec = T3.teclado(tw, { desde: 57, hasta: 83, base: 60, alTocar: (m, porTecla) => { if (ej) { const r = ej.tecla(m, porTecla); if (!r.ok) tec.marca(m, 'mal', 300); } else T3.piano(m, 0, .4, .3); } });
    c.alMorir.push(() => { tec.fuera(); if (ej) ej.para(); if (sonL) sonL.para(); });
    B._mental = { toca: m => ej ? ej.tecla(m, false) : null, objetivo: () => ej ? ej.objetivo() : null, estado: () => ({ k: k, notas: notasF, ej: ej ? ej.estado() : null, fase: fase }), empieza: () => { const b = B.$('.mt-empieza', p); if (b) b.click(); } };
    /* (pruebas) la opción correcta de la ventana abierta y un trazo bueno (px de pantalla) */
    B._final = {
      fase: () => fase, ex: () => ex, pop: () => !!popAct,
      opcion: bien => { if (!popAct) return null; const b = B.$$('.mf-op', popAct.w).filter(x => bien ? +x.dataset.i === popAct.ok : +x.dataset.i !== popAct.ok && !x.classList.contains('mal'))[0]; if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; },
      trazo: () => { const b = caja(fase === 2 ? '.vf-keysignature' : '.vf-clef'); if (!b) return null; const m = capaLuz.getScreenCTM(), P2 = (x, y) => { const pt = capaLuz.createSVGPoint(); pt.x = x; pt.y = y; const q = pt.matrixTransform(m); return { x: q.x, y: q.y }; };
        return [P2(b.x - 5, b.y + b.height * .85), P2(b.x + b.width / 2, b.y + b.height / 2), P2(b.x + b.width + 5, b.y + b.height * .15)]; }
    };
    /* (Iago 3-nov) OPCIONAL: «Practicar» o seguir con la historia; durante, «Terminar» siempre a mano */
    const bSeguir = btn('Seguir sin practicar ▶', '', () => { B.$('#cartel').classList.remove('on'); B.$('#cartel').innerHTML = ''; acaba(true); });
    return new Promise(r => {
      resolver = r; c.alMorir.push(() => r(false));
      M().cartel(cfg.cartel, { botones: [bOtra, bSig, bFin], boton: 'Practicar: 3 melodías', extra: [bSeguir], aulaSolo: false }).then(() => { if (!hecho) monta(); });
    });
  };
  /* ════════ esperaGolpe: el negro final dura hasta el GOLPE de la música (s desde que arrancó en p12c, B._tFinal0); entonces el motor
     pone «Continuará…». Si la música del final aún no está (o no hay golpe), el negro de siempre (sinGolpe s). ════════ */
  I.esperaGolpe = function (cfg, c) {
    B.$('#escena').classList.remove('con-inter'); B.$('#inter').className = '';
    const hay = cfg.golpe != null && B._tFinal0 != null && B.buf['mus/t3_mus_final.mp3'];
    const t = hay ? cfg.golpe - (B.ahora() - B._tFinal0) - (cfg.adelanto || 0) : (cfg.sinGolpe || 1.4);
    if (hay) document.body.classList.add('golpe-final');
    return B.espera(RAP() ? .2 : Math.max(cfg.minimo || .3, t), c);
  };
})(window.TR);
