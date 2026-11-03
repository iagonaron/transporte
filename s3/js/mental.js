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
        const geo = T3.pinta(h, comps, { fifths: op.fifths, num: op.num, den: op.den, ancho: op.ancho || 1050, alto: op.alto || 115, y: op.y == null ? 12 : op.y, sinCompas: s0 > 0, final: s0 + porS >= ncomp, margen: op.fantasma ? 48 : null, ancho1: s0 > 0 ? 60 + Math.max(2, Math.abs(op.fifths || 0)) * 11 : null });
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
    return { pagina: pagina, marca: marca, cursor: cursor, etiqueta: etiqueta, apaga: () => sist.forEach(S => { S.cur.style.opacity = '0'; }), el: caja };
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
    function pulsoAudio(p) {   // claqueta de entrada y acompañamiento
      if (p < 0) { tic(p === -cuenta); return; }
      const comp = Math.floor(p / cuenta), pu = p - comp * cuenta, a = o.acorde ? o.acorde(comp, pu) : null;
      if (!a) return;
      const t = C.currentTime + .005;
      if (pu === 0) T3.piano(a.bajo, t, spb * cuenta * .9, .22);   // vals: el bajo en la 1.ª parte, el acorde en la 2.ª y la 3.ª
      else T3.acorde(a.notas, t, spb * .8, .16);
    }
    function tic(fuerte) {
      try { const t = C.currentTime + .005, os = C.createOscillator(), g = C.createGain(); os.type = 'triangle'; os.frequency.value = fuerte ? 1760 : 1320;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(fuerte ? .12 : .08, t + .003); g.gain.exponentialRampToValueAtTime(.0005, t + .07);
        os.connect(g); g.connect(B.bus.ui); os.start(t); os.stop(t + .09); } catch (e) { }
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
        if (o.guia && o.guia()) V().nota('oboe', o.objetivo(ns[i]), C.currentTime + .01, Math.max(.15, ns[i].beats * spb * .92), .3);
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
    const p = B.$('#inter'); p.innerHTML = ''; p.className = 'on i-mental i-claves';
    const can = T3.cancion(), rg = cfg.compases || [0, 3], notas = trozo(can, rg[0], rg[1]);
    const cab = el('div', 'mt-cab'); p.appendChild(cab);
    cab.appendChild(el('div', 'mt-lado', '<small>Lo que está escrito</small><b>Clave de sol · Re M</b>'));
    const prog = el('div', 'mt-prog'); cab.appendChild(prog);
    cab.appendChild(el('div', 'mt-lado der', '<small>Lo que lees</small><b class="cian">Clave de do en 4.ª · Do M · +8.ª</b>'));
    const v = vista(p, notas, { fifths: can.fifths, num: can.num, den: can.den, porSistema: 4, porPagina: 4, fantasma: true, etiquetas: true, ancho: 860, alto: 120, y: 22 });
    const msg = el('div', 'mt-msg'); p.appendChild(msg);
    const tw = el('div', 'mt-tw'); p.appendChild(tw);
    let k = Math.min(cfg.ejemplo || 0, notas.length), fallos = 0, listo = false, sigue = null;
    const objetivo = n => { const t = T3.enTenor(n); return t.midi; };
    const pintaProg = () => { prog.innerHTML = notas.map((n, i) => '<i class="' + (i < k ? 'ya' : i === k ? 'act' : '') + '"></i>').join(''); };
    /* la del ejemplo (la primera), resuelta */
    for (let i = 0; i < k; i++) { const t = T3.enTenor(notas[i]); v.marca(notas[i].i, 'n-ok'); v.etiqueta(notas[i].i, '<s>' + T3.nombre(notas[i].l, notas[i].a) + '</s><b>' + T3.NOM[t.l] + '</b>', 'ok'); }
    const di = (t, cls) => { msg.className = 'mt-msg on' + (cls ? ' ' + cls : ''); msg.innerHTML = t; };
    function marcaAct() {
      pintaProg();
      if (k >= notas.length) return;
      v.marca(notas[k].i, 'n-act'); v.etiqueta(notas[k].i, '?', 'act');
    }
    function toca(m, porTecla) {
      if (k >= notas.length) { T3.piano(m, 0, .4, .3); return; }
      const n = notas[k], mo = objetivo(n), t = T3.enTenor(n);
      if ((((mo - m) % 12) + 12) % 12 === 0) {
        T3.piano(mo, 0, .6, .5); V().ui('ok');
        v.marca(n.i, fallos >= 2 ? 'n-ayuda' : 'n-ok'); v.etiqueta(n.i, '<s>' + T3.nombre(n.l, n.a) + '</s><b>' + T3.NOM[t.l] + '</b>', 'ok');
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
      di('¡Eso es! Cada nota, <b>una 2.ª más abajo</b>: ya estás tocando en <b>Do M</b>, sin escribir nada.', 'ok');
      const C = B.ac(); let t = C.currentTime + .5; notas.forEach(n => { T3.piano(objetivo(n), t, n.beats * .55, .4); t += n.beats * .6; });
      if (!listo) { listo = true; M().barraTexto('¡Lectura por claves completa! Pulsa <b>Continuar</b>.'); M().esperaSigue(c).then(ok => sigue && sigue(ok)); }
    }
    const tec = T3.teclado(tw, { desde: 60, hasta: 83, base: 72, alTocar: toca });
    c.alMorir.push(() => tec.fuera());
    marcaAct(); di('Lee la nota iluminada en <b>clave de do en 4.ª</b> y tócala.');
    B._mental = { toca: m => toca(m, false), objetivo: () => k < notas.length ? objetivo(notas[k]) : null, estado: () => ({ k: k, total: notas.length }) };
    return M().cartel(cfg.cartel, { botones: [], aulaSolo: false }).then(() => new Promise(res => {
      sigue = res; c.alMorir.push(() => res(false)); if (cfg.cartelCorto) M().barraTexto(cfg.cartelCorto);
    }));
  };

  /* ════════ panel común del tiempo real (mental y mentalFinal) ════════ */
  function panelReal(p, titIzq, titDer) {
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
    const p = B.$('#inter'); p.innerHTML = ''; p.className = 'on i-mental i-real';
    const can = T3.cancion(), TEMPOS = cfg.tempos || [{ nombre: 'Lento', bpm: 50, compases: [0, 8], espera: true, guia: true }, { nombre: 'Medio', bpm: 66, compases: [0, 16] }, { nombre: 'De concierto', bpm: 80, compases: [0, 16] }];
    const P = panelReal(p, '<small>Partitura original</small><b>Re M · 2♯</b>', '<small>Tú tocas · una 2.ª M ↓</small><b class="cian">Do M · sin alteraciones</b>');
    let k = 0, ej = null, v = null, tec = null, guia = true, listo = false, sigue = null;
    const res = TEMPOS.map(() => null);
    const bGuia = btn('', 'mt-guia', () => { guia = !guia; pintaGuia(); }, 'Voz guía: canta la nota que tienes que tocar');
    const pintaGuia = () => { bGuia.innerHTML = '<i></i>Voz guía · ' + (guia ? 'sí' : 'no'); bGuia.classList.toggle('on', guia); bGuia.setAttribute('aria-pressed', guia ? 'true' : 'false'); };
    const bOtra = btn('↻ Repetir este tempo', '', () => empieza(k)), bSig = btn('Siguiente tempo ▶', 'prim', () => empieza(k + 1));
    bOtra.style.display = 'none'; bSig.style.display = 'none';
    function chips() {
      P.chips.innerHTML = '';
      TEMPOS.forEach((x, i) => { const d = el('div', 'mt-chip' + (i === k ? ' act' : '') + (res[i] ? ' ya' : ''), '<b>' + x.nombre + '</b><small>negra = ' + x.bpm + (res[i] ? ' · ' + res[i].ok + '/' + res[i].total : '') + '</small>'); P.chips.appendChild(d); });
      P.chips.appendChild(bGuia);
    }
    function monta(i) {
      const tp = TEMPOS[i], rg = tp.compases || [0, 16], ns = trozo(can, rg[0], rg[1]);
      P.zona.innerHTML = ''; v = vista(P.zona, ns, { fifths: can.fifths, num: can.num, den: can.den, porSistema: 4, porPagina: 8 });
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
        alEstado: (n, e, x) => {
          if (e === 'ok') { ok++; P.di('<b>' + nomM(n.midi - 2, 0) + '</b> ✓ · aciertos: <b>' + ok + '</b>', 'ok'); }
          else if (e === 'mal') P.di('Esa era <b>' + nomM(x.m, 0) + '</b>; aquí va <b>' + nomM(x.mo, 0) + '</b> (lo escrito, ' + T3.nombre(n.l, n.a) + ', una 2.ª M más grave). ¡Sigue!', 'mal');
          else if (e === 'pasa') P.di('Se te ha pasado una: no pasa nada, <b>sigue</b> con la siguiente.', 'pasa');
        },
        alFin: r => { res[k] = r; ej = null; chips(); fin(r); } });
      B._mental.ej = ej;
      P.di('Escucha la entrada (un compás) y… <b>¡toca!</b>');
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
    const can = T3.cancion(), C = B.ac();
    let h = null, fin = false, res = null, dur;
    const INTRO = 2, spbMp3 = 60 / (can.tempo || 80);
    if (cfg.mp3 && B.buf[cfg.mp3]) {
      h = B.suena(cfg.mp3, { bus: B.bus.sfx, vol: 1, grupo: 'sfx' }); if (V().suelta) V().suelta(h); dur = B.buf[cfg.mp3].duration;
      const c1 = cfg.c1 != null ? cfg.c1 : INTRO * can.num * spbMp3;   // segundo en que empieza el c. 1 en el mp3 (A: 4,80 s)
      B.arr(cfg.imgs).forEach(x => B.espera(RAP() ? .05 : (x.t != null ? x.t : c1 + x.c * can.num * spbMp3), c).then(ok => ok && !fin && Mo.cambia(x.img)));
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

  /* ════════ mentalFinal: ejercicio final opcional con el generador ════════ */
  const NIV = [{ n: 1, bpm: 60, espera: true, verDestino: true, nombre: 'Melodía 1 · el cursor te espera' }, { n: 2, bpm: 56, espera: false, verDestino: false, nombre: 'Melodía 2 · a tempo' }, { n: 3, bpm: 60, espera: false, verDestino: false, nombre: 'Melodía 3 · a tempo' }];
  function genera(n) {
    for (let i = 0; i < 60; i++) { const ex = B.escrito.generar(n); if (ex && !ex.notas.some(x => x.dur === '16')) return ex; }
    return B.escrito.generar(1);
  }
  I.mentalFinal = function (cfg, c) {
    const p = B.$('#inter'); p.innerHTML = ''; p.className = 'on i-mental i-real i-final';
    const P = panelReal(p, '', '');
    let k = 0, ej = null, v = null, guia = false, sigue = null, ex = null, listo = false;
    const notasF = [];
    const bGuia = btn('', 'mt-guia', () => { guia = !guia; pintaGuia(); }, 'Voz guía: canta la nota que tienes que tocar');
    const pintaGuia = () => { bGuia.innerHTML = '<i></i>Voz guía · ' + (guia ? 'sí' : 'no'); bGuia.classList.toggle('on', guia); bGuia.setAttribute('aria-pressed', guia ? 'true' : 'false'); };
    const bSig = btn('Siguiente melodía ▶', 'prim', () => { k++; monta(); });
    const bFin = btn('Terminar', 'disc', () => acaba(true), 'Terminar el ejercicio y seguir con la historia');
    bSig.style.display = 'none';
    function chips() {
      P.chips.innerHTML = '';
      NIV.forEach((x, i) => { const d = el('div', 'mt-chip' + (i === k ? ' act' : '') + (notasF[i] != null ? ' ya' : ''), '<b>' + (i + 1) + '</b><small>' + (notasF[i] != null ? Math.round(notasF[i] * 100) + ' %' : x.espera ? 'te espera' : 'a tempo') + '</small>'); P.chips.appendChild(d); });
      P.chips.appendChild(bGuia);
    }
    function monta() {
      if (ej) ej.para(); bSig.style.display = 'none';
      const nv = NIV[k]; ex = genera(nv.n); guia = false; pintaGuia(); chips();
      const ns = ex.notas.map((x, i) => { const n = T3.nota(x.step.toLowerCase(), x.alter, x.octave, x.dur, x.compas); n.i = i; return n; });
      let t = 0; ns.forEach(n => { n.t = t; t += n.beats; });
      const semis = ex.transp.dir * ex.transp.semis;
      P.izq.innerHTML = '<small>Melodía ' + (k + 1) + ' de 3 · original</small><b>' + ex.key.name + ' M · ' + T3.armTxt(ex.key.fifths) + '</b>';
      const dest = ex.destino.name + ' M · ' + T3.armTxt(ex.destino.fifths);
      P.der.innerHTML = '<small>Tú tocas · ' + ex.transp.corto + '</small><span class="mt-fila"><b class="cian" id="mfDest">' + (nv.verDestino ? dest : '¿…?') + '</b></span>';
      if (!nv.verDestino) { const bp = btn('Pista', 'mt-pista', () => { const d = B.$('#mfDest'); if (d) d.textContent = dest; bp.remove(); }, 'Ver la tonalidad nueva'); const fi = B.$('.mt-fila', P.der); fi.insertBefore(bp, fi.firstChild); }
      P.zona.innerHTML = ''; v = vista(P.zona, ns, { fifths: ex.key.fifths, num: ex.compas.num, den: ex.compas.den, porSistema: 4, porPagina: 4, ancho: 1050, alto: 125, y: 16 });
      P.capa.innerHTML = ''; P.capa.className = 'mt-capa on';
      const b = btn('▶ Empezar · ' + nv.nombre, 'prim mt-empieza', () => arranca(ns, semis)); P.capa.appendChild(b); setTimeout(() => { if (b.isConnected) b.focus(); }, 60);
      P.di('Piensa primero la <b>tonalidad nueva</b>; después, cada nota <b>' + ex.transp.lbl.toLowerCase() + '</b>.');
      M().barraTexto(cfg.cartelCorto || '');
    }
    function arranca(ns, semis) {
      P.capa.className = 'mt-capa'; P.capa.innerHTML = '';
      const nv = NIV[k]; let ok = 0;
      ej = ejecutor({ notas: ns, objetivo: n => n.midi + semis, bpm: nv.bpm, espera: nv.espera, guia: () => guia, num: ex.compas.den === 8 ? 3 : ex.compas.num, acorde: null, v: v, c: c,
        alEstado: (n, e, x) => {
          if (e === 'ok') { ok++; P.di('<b>' + nomM(n.midi + semis, ex.destino.fifths) + '</b> ✓', 'ok'); }
          else if (e === 'mal') P.di('Esa era <b>' + nomM(x.m, ex.destino.fifths) + '</b>; aquí va <b>' + nomM(x.mo, ex.destino.fifths) + '</b>. ¡Sigue!', 'mal');
          else if (e === 'pasa') P.di('Se te ha pasado una: <b>sigue</b>.', 'pasa');
        },
        alFin: r => { ej = null; notasF[k] = r.ok / Math.max(1, r.total); chips(); finMel(r); } });
      B._mental.ej = ej;
    }
    function finMel(r) {
      P.capa.className = 'mt-capa on res'; P.capa.innerHTML = '<div class="mt-res"><small>Melodía ' + (k + 1) + '</small><b>' + Math.round(notasF[k] * 100) + ' %</b><span>' + r.ok + ' de ' + r.total + ' notas</span></div>';
      if (k < NIV.length - 1) { bSig.style.display = ''; M().barraTexto('Melodía ' + (k + 1) + ': <b>' + Math.round(notasF[k] * 100) + ' %</b>. Pulsa <b>Siguiente melodía</b>.'); setTimeout(() => bSig.focus(), 60); }
      else {
        const media = notasF.reduce((a, b) => a + b, 0) / notasF.length, nota = Math.round(media * 100) / 10;
        B.notaFinal = nota; try { B.guarda('tr_t3_nota', { nota: nota, cuando: Date.now() }); } catch (e) { }
        bFin.style.display = 'none';
        if (!listo) { listo = true; M().barraTexto('Tus tres melodías: ' + notasF.map(x => Math.round(x * 100) + ' %').join(' · ') + '. <b>Nota: ' + String(nota).replace('.', ',') + '</b>'); M().esperaSigue(c).then(ok => acaba(ok)); }
      }
    }
    let resolver = null, hecho = false;
    function acaba(ok) { if (hecho) return; hecho = true; if (ej) ej.para(); B.$('#cartel').classList.remove('on'); if (resolver) resolver(ok); }
    const tw = P.tw, tec = T3.teclado(tw, { desde: 57, hasta: 83, base: 60, alTocar: (m, porTecla) => { if (ej) { const r = ej.tecla(m, porTecla); if (!r.ok) tec.marca(m, 'mal', 300); } else T3.piano(m, 0, .4, .3); } });
    c.alMorir.push(() => { tec.fuera(); if (ej) ej.para(); });
    B._mental = { toca: m => ej ? ej.tecla(m, false) : null, objetivo: () => ej ? ej.objetivo() : null, estado: () => ({ k: k, notas: notasF, ej: ej ? ej.estado() : null }), empieza: () => { const b = B.$('.mt-empieza', p); if (b) b.click(); } };
    /* (Iago 3-nov) OPCIONAL: «Practicar» o seguir con la historia; durante, «Terminar» siempre a mano */
    const bSeguir = btn('Seguir sin practicar ▶', '', () => { B.$('#cartel').classList.remove('on'); B.$('#cartel').innerHTML = ''; acaba(true); });
    return new Promise(r => {
      resolver = r; c.alMorir.push(() => r(false));
      M().cartel(cfg.cartel, { botones: [bSig, bFin], boton: 'Practicar: 3 melodías', extra: [bSeguir], aulaSolo: false }).then(() => { if (!hecho) monta(); });
    });
  };
})(window.TR);
