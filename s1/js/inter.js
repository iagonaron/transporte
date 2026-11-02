/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 1 · los cinco interactivos (2.ª persona del singular; cartel primero en el centro con «Entendido»
   y después abajo, junto a los botones; «Continuar» se enciende cuando ya se puede seguir).
   Cada uno: TR.inter.<tipo>(cfg, control) → Promise (true = terminado). Los datos (textos, notas) van en data/t1.js.
     prologo   · dos partituras (saxo alto en Do♯ m, piano en Mi m) que suenan igual, con cursor
     calibrar  · frecuencia base 220 Hz y sus octavas exactas ×2 ×4 ×8 ×16 → la máquina se activa (la base suena todo el rato y cada octava colocada se suma, bajito)
     flautas   · tres flautas, la misma digitación: el mismo dibujo a tres alturas + reto de ordenarlas
     juntos    · la grande y la pequeña: qué digitación hace que suenen igual (a la octava)
     oboe      · el La del oboe: qué nota escrita toca el saxo alto, el clarinete en Si♭ y la trompa en Fa
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const I = B.inter, M = () => B.motor, T = B.teoria, V = () => B.viento;
  const el = B.el;
  const btn = (txt, cls, fn, tit) => { const b = el('button', cls || '', txt); b.type = 'button'; if (tit) { b.title = tit; b.setAttribute('aria-label', tit); } if (fn) b.addEventListener('click', ev => { ev.stopPropagation(); fn(b); }); return b; };
  const panel = (cls) => { const p = B.$('#inter'); p.innerHTML = ''; p.className = 'on ' + (cls || ''); return p; };
  const E8 = () => (B.TEMA && B.TEMA.corchea) || 60 / 170;
  const CMP = () => (B.TEMA && B.TEMA.compas) || '6/8', GRP = () => (B.TEMA && B.TEMA.grupos) || [3, 3];
  function img(src, cls, alt) {
    if (B.existe(src)) { const im = el('img', cls || ''); im.src = B.img[src] || src; im.alt = alt || ''; im.draggable = false; return im; }
    const d = el('div', (cls || '') + ' imarca'); d.innerHTML = '<small>' + B.esc(src) + '</small>'; return d;
  }
  /* el tema de Noa: en concierto (lo que suena) y escrito para saxo alto en Mi♭ (6.ª M más aguda) */
  function compases(trans, n) {
    return B.TEMA.mel.slice(0, n || B.TEMA.mel.length).map(cm => cm.map(n => ({ k: trans ? T.transporta(n[0], trans[0], trans[1]) : n[0], d: n[1] })));
  }

  /* ════════ a · PRÓLOGO: saxo alto (Do♯ m, escrito) + piano en sistema doble (Mi m) que suenan igual ════════
     El piano se escribe tal cual lo toca toca(): mano izquierda, el bajo en negras con puntillo (clave de fa);
     mano derecha, el arpegio de corcheas (clave de sol). «Continuar» se puede pulsar desde el principio (solo es escuchar). */
  const sube8 = k => { const n = T.lee(k); return T.escribe(n.l, n.a, n.o + 1); };
  const arpegio = a => [sube8(a[1])].concat(a[2], a[2].slice(1, -1).reverse());   // la misma secuencia que suena
  function pianoEscrito(n) {
    const md = [], mi = [];
    B.TEMA.acordes.slice(0, n).forEach(bar => {
      const cd = [], ci = [];
      bar.forEach(a => { const seq = arpegio(a); for (let k = 0; k < a[0]; k++) cd.push({ k: seq[k % seq.length], d: 1 }); for (let o = 0; o < a[0]; o += 3) ci.push({ k: a[1], d: 3 }); });
      md.push(cd); mi.push(ci);
    });
    return { md: md, mi: mi };
  }
  I.prologo = function (cfg, c) {
    const p = panel('i-prologo');
    p.appendChild(el('h3', '', cfg.titulo || 'El tema de Noa'));
    const cont = el('div', 'partitura'); p.appendChild(cont);
    const NC = cfg.compases || 8;
    const pz = pianoEscrito(NC);
    const sax = { nombre: 'Saxo alto', sub: 'en Mi♭ · Do♯ m', corto: 'Sax.', armadura: 'C#m', clave: 'treble', compases: compases([5, 9], NC) };
    const md = { nombre: 'Piano', sub: 'Mi m', corto: 'Pno.', armadura: 'Em', clave: 'treble', nomDy: 44, compases: pz.md };
    const mi = { nombre: '', armadura: 'Em', clave: 'bass', compases: pz.mi };
    const R = B.pauta.dibuja(cont, { ancho: 1740, compas: CMP(), grupos: GRP(), sistemas: [[0, NC / 2 - 1], [NC / 2, NC - 1]], pentas: [sax, md, mi],
      seps: [0, 112, 200], sepPe: 96, sepSis: 4, llave: [1, 2], unidos: [[0], [1, 2]], corchete: true });
    const cur = el('div', 'cursor'); cont.appendChild(cur);
    let sonando = null, oido = false;
    const bAmbas = btn('▶ Las dos', 'prim', () => toca('ambas')), bSax = btn('Solo saxo', '', () => toca('saxo')), bPia = btn('Solo piano', '', () => toca('piano')), bPara = btn('■', 'cuad', () => para(), 'Parar');
    return M().cartel(cfg.cartel, { botones: [bAmbas, bSax, bPia, bPara] }).then(() => new Promise(res => {
      c.alMorir.push(() => { para(); res(false); });
      I._prologoFin = () => { if (oido) return; oido = true; if (cfg.pregunta) M().barraTexto(cfg.pregunta); };
      M().esperaSigue(c).then(ok => { para(); res(ok); });   // desde el principio
    }));
    function para() { if (sonando) { sonando.vivo = false; sonando = null; } V().parar(); cur.classList.remove('on'); B.$$('.act', cont).forEach(e => e.classList.remove('act')); }
    function toca(que) {
      para();
      const C = B.ac(), t0 = C.currentTime + .25, e8 = E8();
      const yo = sonando = { vivo: true };
      const mel = B.TEMA.mel.slice(0, NC); let t = 0;
      mel.forEach(cm => cm.forEach(n => {
        const m = T.midi(n[0]), d = n[1] * e8;
        if (que !== 'piano') V().nota('saxo', m, t0 + t * e8, d * .97 + .02, .8);   // el saxo suena lo escrito 6.ª M más grave: = la nota de concierto
        t += n[1];
      }));
      /* el piano: bajo en cada parte y arpegio en corcheas (como la maqueta v4 de C4) */
      if (que !== 'saxo') { let tc = 0; B.TEMA.acordes.slice(0, NC).forEach(bar => bar.forEach(a => {
        const d = a[0], bajo = T.midi(a[1]), seq = arpegio(a).map(T.midi);
        for (let o = 0; o < d; o += 3) V().piano(bajo, t0 + (tc + o) * e8, 3 * e8 * .95, que === 'ambas' ? .3 : .36);
        for (let k = 0; k < d; k++) V().piano(seq[k % seq.length], t0 + (tc + k) * e8 + .005, e8 * 1.3, (k % 3 === 0 ? .2 : .14) * (que === 'ambas' ? 1 : 1.2));
        tc += d; })); }
      const total = t;
      const pes = que === 'saxo' ? [0] : que === 'piano' ? [1, 2] : [0, 1, 2], guia = que === 'piano' ? 1 : 0;
      cur.classList.add('on');
      let antG = null, antSet = '';
      (function mira() {
        if (!yo.vivo) return;
        const e = (B.ac().currentTime - t0) / e8;
        if (e >= total) { para(); if (I._prologoFin) I._prologoFin(); return; }
        if (e >= 0) {
          const act = R.notas.filter(x => pes.indexOf(x.pe) >= 0 && e >= x.t0 && e < x.t0 + x.d);
          const clave = act.map(x => R.notas.indexOf(x)).join();
          if (clave !== antSet) {
            B.$$('.act', cont).forEach(x => x.classList.remove('act'));
            act.forEach(x => x.el && x.el.classList.add('act'));
            antSet = clave;
          }
          const g = act.find(x => x.pe === guia);
          if (g && g !== antG) {
            const top = 10 + 6 + g.sis * (R.alto1 + R.sepSis) + 14;
            cur.style.left = (14 + g.x - 4) + 'px'; cur.style.top = top + 'px'; cur.style.height = (R.alto1 - 30) + 'px';
            antG = g;
          }
        }
        requestAnimationFrame(mira);
      })();
    }
  };

  /* ════════ b · CALIBRAR EL TRANSPORTADOR ════════ */
  I.calibrar = function (cfg, c) {
    const base = cfg.base || 220, mult = cfg.multiplos || [2, 4, 8, 16], ini = cfg.inicio || [583, 1130, 2210, 2905];
    const maxHz = base * (Math.max.apply(null, mult) + 1);
    /* el acorde de octavas: la base suena desde que aparece el interactivo; cada octava colocada se queda sonando.
       Ganancia repartida y menor cuanto más aguda (1760/3520 no chillan), con fundido al entrar y al salir. */
    const AC = B.ac(), coro = AC.createGain(); coro.gain.setValueAtTime(0, AC.currentTime); coro.gain.linearRampToValueAtTime(1, AC.currentTime + 1.6); coro.connect(B.bus.inst);
    const GAN = f => .05 * Math.pow(220 / f, .75);   // 220 → .05 · 440 → .03 · 880 → .018 · 1760 → .011 · 3520 → .006
    const voces = {};
    function vozOn(f) {
      if (voces[f]) return; const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime;
      o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(GAN(f), t + .6);
      o.connect(g); g.connect(coro); o.start(); voces[f] = { o: o, g: g };
    }
    function vozOff(f) { const v = voces[f]; if (!v) return; delete voces[f]; const t = AC.currentTime; v.g.gain.cancelScheduledValues(t); v.g.gain.setValueAtTime(v.g.gain.value, t); v.g.gain.linearRampToValueAtTime(0, t + .3); v.o.stop(t + .35); }
    let coroVivo = true;
    function coroFuera(fd) {
      if (!coroVivo) return; coroVivo = false; const t = AC.currentTime; fd = fd || 1.2;
      coro.gain.cancelScheduledValues(t); coro.gain.setValueAtTime(coro.gain.value, t); coro.gain.linearRampToValueAtTime(0, t + fd);
      Object.keys(voces).forEach(f => voces[f].o.stop(t + fd + .05)); setTimeout(() => { try { coro.disconnect(); } catch (e) { } }, (fd + .2) * 1000);
    }
    c.alMorir.push(() => coroFuera(.4));
    vozOn(base);
    const p = panel('i-calibrar');
    const izq = el('div', 'cal-maq'), der = el('div', 'cal-filas'); p.appendChild(izq); p.appendChild(der);
    /* la máquina: cuatro anillos concéntricos que se encienden */
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '-200 -200 400 400'); svg.setAttribute('class', 'anillos');
    const anillos = mult.map((m, i) => { const r = 70 + i * 34; const g = document.createElementNS(NS, 'circle'); g.setAttribute('r', r); g.setAttribute('class', 'an'); g.setAttribute('stroke-dasharray', (i % 2 ? '18 10' : '42 12')); svg.appendChild(g); return g; });
    const nucleo = document.createElementNS(NS, 'circle'); nucleo.setAttribute('r', 46); nucleo.setAttribute('class', 'nuc'); svg.appendChild(nucleo);
    const tb = document.createElementNS(NS, 'text'); tb.setAttribute('class', 'tbase'); tb.setAttribute('y', 10); tb.textContent = base + ' Hz'; svg.appendChild(tb);
    izq.appendChild(svg);
    const pant = el('div', 'cal-pant'); pant.innerHTML = '<div>Frecuencia base · <b>' + base + ' Hz</b></div>'; izq.appendChild(pant);
    const bBase = btn('🔊 Base ' + base + ' Hz', '', () => { const o = V().seno(base, .12); setTimeout(() => o.parar(.3), 1100); });
    let hechos = mult.map(() => false), activa = false;
    const filas = mult.map((m, i) => {
      const f = el('div', 'cal-fila'), lab = el('b', 'mx', '×' + m), menos = btn('−', 'cuad', () => mueve(-1), 'Bajar 1 Hz'), mas = btn('+', 'cuad', () => mueve(1), 'Subir 1 Hz');
      const sl = el('input'); sl.type = 'range'; sl.min = base; sl.max = maxHz; sl.step = 1; sl.value = ini[i];
      const hz = el('span', 'hz'), luz = el('i', 'luz');
      f.appendChild(lab); f.appendChild(menos); f.appendChild(sl); f.appendChild(mas); f.appendChild(hz); f.appendChild(luz); der.appendChild(f);
      let osc = null, tCorta = null;
      const volMov = () => .15 * Math.pow(440 / Math.max(440, +sl.value), .5);   // el que se mueve, por encima, pero sin chillar arriba
      const suena = () => { if (activa) return; if (!osc) osc = V().seno(+sl.value, volMov()); else osc.frec(+sl.value); clearTimeout(tCorta); tCorta = setTimeout(() => { if (osc) { osc.parar(.25); osc = null; } }, 420); };
      const pinta = () => { hz.textContent = sl.value + ' Hz'; const ok = +sl.value === base * m; f.classList.toggle('ok', ok); anillos[i].classList.toggle('on', ok);
        if (ok && !hechos[i]) { hechos[i] = true; V().ui('anillo'); vozOn(base * m); } if (!ok && hechos[i]) { hechos[i] = false; vozOff(base * m); } revisa(); };
      function mueve(d) { if (activa) return; sl.value = B.clamp(+sl.value + d, base, maxHz); suena(); pinta(); }
      sl.addEventListener('input', () => { suena(); pinta(); });
      sl.addEventListener('keydown', ev => ev.stopPropagation());
      c.alMorir.push(() => { if (osc) osc.parar(.05); });
      pinta();
      return { f: f, sl: sl };
    });
    let fin = null;
    function revisa() {
      if (activa || !hechos.every(Boolean)) return;
      activa = true;
      filas.forEach(x => { x.sl.disabled = true; });
      svg.classList.add('gira'); p.classList.add('activa'); V().ui('enciende');
      B.arr(cfg.sfxActiva).forEach((x, k) => B.espera(k * .6, c).then(ok => ok && B.sfx(x, .8)));
      coro.gain.linearRampToValueAtTime(1.6, AC.currentTime + .8);   // el acorde completo crece al activarse
      pant.innerHTML = '<div>' + B.esc(cfg.destino || 'Destino: exterior de la Torre · 30 m') + '</div>';
      B.espera(1.8, c).then(ok => {
        if (!ok) return;
        const al = el('div', 'alarma', B.esc(cfg.alarma || 'Coordenada temporal: activada')); pant.appendChild(al); p.classList.add('rojo');
        if (cfg.sfxAlarma) B.sfx(cfg.sfxAlarma, .7); else V().ui('mal');
        M().barraTexto(cfg.textoFin || 'Calibración perfecta.');
        M().esperaSigue(c).then(ok2 => { coroFuera(1.5); if (fin) fin(ok2); });
      });
    }
    return M().cartel(cfg.cartel, { botones: [bBase] }).then(() => new Promise(res => { fin = res; c.alMorir.push(() => res(false)); }));
  };

  /* ════════ flautas: datos comunes ════════ */
  /* 5 agujeros; se cuentan los tapados seguidos desde la embocadura: 5 → nota base, 4 → +2, 3 → +3, 2 → +5, 1 → +7, 0 → +9 */
  const SUBE = { 5: 0, 4: 2, 3: 3, 2: 5, 1: 7, 0: 9 };
  const tapados = hs => { let k = 0; while (k < hs.length && hs[k]) k++; return k; };
  function flauta(def, op) {
    op = op || {};
    const w = el('div', 'flauta ' + (def.id || '')); w.style.setProperty('--w', def.ancho + 'px');
    const cuerpo = el('div', 'fl-cuerpo'); w.appendChild(cuerpo);
    cuerpo.appendChild(img(def.img, 'fl-img', def.nombre));
    const hs = [0, 0, 0, 0, 0], bot = [];
    (def.agujeros || [.366, .446, .521, .597, .674]).forEach((x, i) => {
      const a = el('button', 'ag'); a.type = 'button'; a.style.left = (x * 100) + '%'; a.style.top = ((def.agY || .52) * 100) + '%';
      a.title = 'Agujero ' + (i + 1); a.setAttribute('aria-label', 'Agujero ' + (i + 1));
      if (op.tocable !== false) a.addEventListener('click', ev => { ev.stopPropagation(); hs[i] = hs[i] ? 0 : 1; pinta(); if (op.alTocar) op.alTocar(tapados(hs)); });
      else a.disabled = true;
      cuerpo.appendChild(a); bot.push(a);
    });
    function pinta() { bot.forEach((b, i) => b.classList.toggle('tap', !!hs[i])); }
    const api = {
      el: w, def: def,
      pon(k) { for (let i = 0; i < 5; i++) hs[i] = i < k ? 1 : 0; pinta(); },
      tapados: () => tapados(hs),
      nota: k => def.base + SUBE[k],
      /* toca el dibujo (digitaciones del tema) moviendo los dedos */
      dibujo(digs, ritmo, t0, c, vol) {
        const e8 = E8(); let t = 0;
        digs.forEach((k, i) => {
          const d = ritmo[i] * e8;
          V().nota('flauta', def.base + SUBE[k] + (op.desplaza || 0), t0 + t * e8, d * .95, vol || .8);
          const cuando = t0 + t * e8 - B.ac().currentTime;
          B.espera(Math.max(0, cuando), c).then(ok => { if (ok) api.pon(k); });
          t += ritmo[i];
        });
        return t * e8;
      }
    };
    return api;
  }
  function diagrama(k, cls) {   // digitación dibujada: ● tapado · ○ abierto (de la embocadura hacia el final)
    const d = el('div', 'dig ' + (cls || ''));
    for (let i = 0; i < 5; i++) d.appendChild(el('i', i < k ? 'tap' : ''));
    return d;
  }

  /* ════════ c · TRES FLAUTAS ════════ */
  I.flautas = function (cfg, c) {
    const F = cfg.flautas, digs = cfg.digitaciones || [5, 4, 3, 1], ritmo = cfg.ritmo || [1, 1, 1, 3];
    const p = panel('i-flautas');
    const arriba = el('div', 'fl-arriba'); p.appendChild(arriba);
    const pc = el('div', 'partitura mini'); arriba.appendChild(pc);
    const tira = el('div', 'fl-tira'); tira.appendChild(el('span', '', 'Digitación del dibujo')); digs.forEach(k => tira.appendChild(diagrama(k))); arriba.appendChild(tira);
    /* el pentagrama: un compás por flauta, el mismo dibujo desplazado entero */
    const nombreNota = m => { const N = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b']; return N[m % 12] + '/' + (Math.floor(m / 12) - 1); };
    const compasDe = f => digs.map((k, i) => ({ k: nombreNota(f.base + SUBE[k]), d: ritmo[i], col: f.color }));
    const R = B.pauta.dibuja(pc, { ancho: 1180, compas: CMP(), grupos: GRP(), margen: 20, pentas: [{ armadura: null, compases: F.map(compasDe) }], sepPe: 100 });
    const notasDe = i => R.notas.filter(n => n.c === i);
    F.forEach((f, i) => notasDe(i).forEach(n => { if (n.el) n.el.classList.add('apagada'); }));
    const lista = el('div', 'fl-lista'); p.appendChild(lista);
    const oidas = F.map(() => false);
    let ocupado = false;
    const fls = F.map((f, i) => {
      const fila = el('div', 'fl-fila');
      fila.appendChild(el('b', 'fl-nom', f.nombre));
      const api = flauta(f, { alTocar: k => { if (!ocupado) V().nota('flauta', f.base + SUBE[k], B.ac().currentTime + .01, .6, .8); } });
      fila.appendChild(api.el);
      fila.appendChild(btn('▶ Dibujo', 'prim', () => {
        if (ocupado) return; ocupado = true;
        const dur = api.dibujo(digs, ritmo, B.ac().currentTime + .1, c);
        notasDe(i).forEach(n => { if (n.el) { n.el.classList.remove('apagada'); n.el.classList.add('act'); } });
        B.espera(dur + .2, c).then(() => { ocupado = false; notasDe(i).forEach(n => n.el && n.el.classList.remove('act')); oidas[i] = true; if (oidas.every(Boolean)) reto(); });
      }, 'Tocar el dibujo en la flauta ' + f.nombre.toLowerCase()));
      lista.appendChild(fila);
      return api;
    });
    let res0 = null;
    /* reto de ARRASTRAR (Iago, 2-nov): las tres flautas, desordenadas y dibujadas al mismo tamaño (que decida el oído);
       al pasar o tocar cada una suena; se arrastran a tres huecos (de grave a agudo, izquierda → derecha) y se comprueba.
       Pointer events (ratón y táctil), Chrome 94. ↶ devuelve la última colocada; ⟲ empieza de nuevo. */
    function reto() {
      if (p.classList.contains('en-reto')) return;
      p.classList.add('en-reto');
      M().barraTexto(cfg.reto);
      const caja = el('div', 'fl-reto'); p.appendChild(caja);
      const orden = [0, 1, 2].sort(() => Math.random() - .5); if (orden.join() === '0,1,2') orden.reverse();
      B._flOrden = orden;   // (solo para las pruebas automáticas)
      const origen = el('div', 'fl-origen'), huecos = el('div', 'huecos'); caja.appendChild(origen); caja.appendChild(huecos);
      const hs = ['Más grave', '', 'Más aguda'].map(t => { const h = el('div', 'hueco'); h.appendChild(el('small', '', t || '·')); huecos.appendChild(h); return h; });
      const sitio = [], colocadas = [];   // sitio[j] = hueco (k) o null; colocadas = pila para deshacer
      let hecho = false, sonandoHasta = 0;
      const suenaF = fi => { const ahora = B.ac().currentTime; if (ahora < sonandoHasta) return; const f = F[fi], t0 = ahora + .03; let t = 0;
        digs.forEach((k, q) => { V().nota('flauta', f.base + SUBE[k], t0 + t * E8(), ritmo[q] * E8() * .95, .8); t += ritmo[q]; }); sonandoHasta = t0 + t * E8(); };
      const cartas = ['A', 'B', 'C'].map((L, j) => {
        const fi = orden[j], f = F[fi], card = el('div', 'fl-carta');
        const base = el('div', 'fl-base'); base.appendChild(el('b', 'fl-letra', L)); origen.appendChild(base);
        card.appendChild(img(f.img, 'fl-cimg', 'Flauta ' + L)); card.appendChild(el('b', 'fl-letra', L));
        card.setAttribute('role', 'button'); card.setAttribute('aria-label', 'Flauta ' + L + ': arrástrala a su hueco'); card.tabIndex = 0;
        base.appendChild(card); sitio[j] = null;
        card.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse' && !arr) suenaF(fi); });
        let arr = null;
        card.addEventListener('pointerdown', ev => {
          if (hecho) return; ev.preventDefault(); ev.stopPropagation();
          suenaF(fi);
          const k = B.$('#escena').getBoundingClientRect().width / 1920;
          arr = { x: ev.clientX, y: ev.clientY, k: k, id: ev.pointerId };
          try { card.setPointerCapture(ev.pointerId); } catch (e) { }
          card.classList.add('arrastra');
        });
        card.addEventListener('pointermove', ev => { if (!arr || ev.pointerId !== arr.id) return; card.style.transform = 'translate(' + ((ev.clientX - arr.x) / arr.k) + 'px,' + ((ev.clientY - arr.y) / arr.k) + 'px) scale(1.04)'; });
        const suelta = ev => {
          if (!arr) return; const a = arr; arr = null;
          try { card.releasePointerCapture(a.id); } catch (e) { }
          card.classList.remove('arrastra');
          const x = ev.clientX, y = ev.clientY;
          const hk = hs.findIndex(h => { const r = h.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; });
          if (hk >= 0 && (sitio.indexOf(hk) < 0 || sitio[j] === hk)) { pon(j, hk); B.sfx('sfx/sfx_anillo_encaja.mp3', .8); }
          else if (Math.abs(x - a.x) + Math.abs(y - a.y) > 12) { vuelve(j); V().ui('mal'); }
          else card.style.transform = '';
        };
        card.addEventListener('pointerup', suelta); card.addEventListener('pointercancel', suelta);
        return { card: card, base: base, fi: fi, L: L };
      });
      function pon(j, hk) {
        const ct = cartas[j]; ct.card.style.transform = '';
        const prev = sitio[j]; sitio[j] = hk; hs[hk].appendChild(ct.card); hs[hk].classList.add('lleno');
        if (prev != null && prev !== hk) hs[prev].classList.remove('lleno');
        const i = colocadas.indexOf(j); if (i >= 0) colocadas.splice(i, 1); colocadas.push(j);
        pinta();
      }
      function vuelve(j) {
        const ct = cartas[j]; ct.card.style.transform = '';
        if (sitio[j] != null) hs[sitio[j]].classList.remove('lleno');
        sitio[j] = null; ct.base.appendChild(ct.card);
        const i = colocadas.indexOf(j); if (i >= 0) colocadas.splice(i, 1);
        pinta();
      }
      const bDes = btn('↶', 'cuad', () => { if (hecho || !colocadas.length) return; vuelve(colocadas[colocadas.length - 1]); }, 'Deshacer: devuelve la última flauta');
      const bOtra = btn('⟲', 'cuad', () => { if (hecho) return; cartas.forEach((x, j) => vuelve(j)); }, 'Empezar de nuevo');
      const bComp = btn('Comprobar', '', () => comprueba());
      const fila = B.$('#barra .bb'), sig = B.$('#bInterSig');
      [bDes, bOtra, bComp].forEach(b => fila.insertBefore(b, sig));
      function pinta() { const n = sitio.filter(x => x != null).length; bComp.disabled = hecho || n < 3; bDes.disabled = hecho || !colocadas.length; bOtra.disabled = hecho || !n; }
      pinta();
      function comprueba() {
        if (hecho || sitio.filter(x => x != null).length < 3) return;
        const mal = cartas.map((ct, j) => j).filter(j => sitio[j] !== cartas[j].fi);   // hueco k = flauta k (0 grande = más grave)
        if (!mal.length) {
          hecho = true; V().ui('ok'); caja.classList.add('bien'); pinta();
          hs.forEach((h, k) => h.appendChild(el('span', 'fl-nombre', F[k].nombre)));
          M().barraTexto(cfg.bien); M().esperaSigue(c).then(ok => res0 && res0(ok));
        } else {
          V().ui('mal'); caja.classList.add('mal'); M().barraTexto(cfg.mal);
          setTimeout(() => { caja.classList.remove('mal'); mal.forEach(vuelve); }, 900);
        }
      }
    }
    return M().cartel(cfg.cartel, { botones: [] }).then(() => new Promise(res => { res0 = res; c.alMorir.push(() => res(false)); }));
  };

  /* ════════ d · TOCAR JUNTOS ════════ */
  I.juntos = function (cfg, c) {
    const F = cfg.flautas, G = F[0], P = F[1], digs = cfg.digitaciones || [5, 4, 3, 1], ritmo = cfg.ritmo || [1, 1, 1, 3];
    const p = panel('i-juntos');
    const filas = el('div', 'fl-lista'); p.appendChild(filas);
    const mk = (f, quien) => { const fila = el('div', 'fl-fila'); fila.appendChild(el('b', 'fl-nom', quien)); const a = flauta(f, { tocable: false }); fila.appendChild(a.el); filas.appendChild(fila); return a; };
    const aG = mk(G, cfg.quienG || 'Él · grande'), aP = mk(P, cfg.quienP || 'Ella · pequeña');
    const ops = el('div', 'j-ops'); p.appendChild(ops);
    ops.appendChild(el('span', 'j-tit', cfg.titOpciones || 'La flauta pequeña empieza con…'));
    let ocupado = false, res0 = null;
    function juntos(kP) {
      if (ocupado) return Promise.resolve(); ocupado = true;
      const t0 = B.ac().currentTime + .1, sube = SUBE[kP] - SUBE[digs[0]];
      const dur = aG.dibujo(digs, ritmo, t0, c, .7);
      /* la pequeña: el mismo dibujo, empezando con la digitación elegida */
      let t = 0; digs.forEach((k, i) => { V().nota('flauta', P.base + SUBE[digs[0]] + sube + (SUBE[k] - SUBE[digs[0]]), t0 + t * E8(), ritmo[i] * E8() * .95, .7); t += ritmo[i]; });
      aP.pon(kP);
      return B.espera(dur + .3, c).then(() => { ocupado = false; });
    }
    const bMisma = btn('▶ Con la misma digitación', 'prim', () => juntos(digs[0]));
    (cfg.opciones || [5, 3, 2, 1]).forEach(k => {
      const o = btn('', 'j-op', b => {
        if (ocupado || p.classList.contains('hecho')) return;
        B.$$('.j-op', ops).forEach(x => x.classList.remove('sel')); b.classList.add('sel');
        const bien = (P.base + SUBE[k] - (G.base + SUBE[digs[0]])) % 12 === 0;
        juntos(k).then(() => {
          if (bien) { V().ui('ok'); b.classList.add('bien'); p.classList.add('hecho'); M().barraTexto(cfg.bien); M().esperaSigue(c).then(ok => res0 && res0(ok)); }
          else { V().ui('mal'); b.classList.add('malo'); M().barraTexto(cfg.mal); }
        });
      }, 'Digitación con ' + k + ' agujeros tapados');
      o.appendChild(diagrama(k)); ops.appendChild(o);
    });
    return M().cartel(cfg.cartel, { botones: [bMisma] }).then(() => new Promise(res => { res0 = res; c.alMorir.push(() => res(false)); }));
  };

  /* ════════ e · AFINAR CON EL OBOE ════════ */
  I.oboe = function (cfg, c) {
    const Q = cfg.preguntas;
    const p = panel('i-oboe');
    const izq = el('div', 'ob-izq'), der = el('div', 'ob-der'); p.appendChild(izq); p.appendChild(der);
    const inst = el('div', 'ob-inst'); izq.appendChild(inst);
    const notas = el('div', 'ob-notas'); izq.appendChild(notas);
    const pe = el('div', 'partitura ob-p'); notas.appendChild(pe);
    const teclado = el('div', 'teclado'); der.appendChild(teclado);
    const lect = el('div', 'ob-lect'); der.appendChild(lect);
    let qi = 0, elegida = null, res0 = null, hecha = false;
    const bLa = btn('🔊 La del oboe', 'prim', () => V().nota('oboe', 69, B.ac().currentTime + .05, 2, .9));
    const bComp = btn('Comprobar', '', () => comprueba());
    /* teclado de dos octavas (Do4–Si5): cada tecla toca el instrumento con la nota escrita (suena transportada) */
    const BL = [['c', 0], ['d', 2], ['e', 4], ['f', 5], ['g', 7], ['a', 9], ['b', 11]], NEG = { c: 'c#', d: 'd#', f: 'f#', g: 'g#', a: 'a#' };
    [4, 5].forEach(o => BL.forEach(b => {
      const k = el('button', 'tb'); k.type = 'button'; k.dataset.k = b[0] + '/' + o; k.innerHTML = '<small>' + T.NOMBRE[b[0]] + '</small>';
      k.addEventListener('click', ev => { ev.stopPropagation(); elige(k.dataset.k); }); teclado.appendChild(k);
      if (NEG[b[0]]) { const n = el('button', 'tn'); n.type = 'button'; n.dataset.k = NEG[b[0]] + '/' + o; n.title = T.nombre(n.dataset.k); n.addEventListener('click', ev => { ev.stopPropagation(); elige(n.dataset.k); }); k.appendChild(n); }
    }));
    function pregunta() {
      const q = Q[qi]; elegida = null; hecha = false;
      inst.innerHTML = '';
      inst.appendChild(img(q.img || ('img/t1/inst_' + q.id + '.webp'), 'ob-img', q.nombre));
      inst.appendChild(el('b', '', q.nombre));
      inst.appendChild(el('small', '', q.sub || ''));
      M().barraTexto(q.texto);
      if (q.fondo) M().fondo(q.fondo, { nombre: q.fondoNombre || 'Foto' }); else if (cfg.fondo) M().fondo(cfg.fondo, {});
      B.$$('.tb,.tn', teclado).forEach(x => x.classList.remove('sel', 'bien'));
      pinta(); lect.textContent = '';
    }
    function pinta() {
      const q = Q[qi];
      const real = elegida ? T.transporta(elegida, -q.pasos, -q.semis) : null;
      const blanca = k => [{ k: k, d: 8 }];
      const silencio = [{ k: 'b/4', d: 8, r: true }];
      B.pauta.dibuja(pe, { ancho: 640, compas: false, margen: 12, sistemas: [[0, 1]], pentas: [{ armadura: null, compases: [elegida ? blanca(elegida) : silencio, real ? blanca(real) : silencio] }], sepPe: 96 });
      const et = el('div', 'ob-et'); et.innerHTML = '<span>Escrita</span><span>Suena</span>'; pe.appendChild(et);
      if (elegida) lect.innerHTML = 'Escrita: <b>' + T.nombre(elegida) + '</b> → suena: <b>' + T.nombre(real) + '</b>';
    }
    function elige(k) {
      if (hecha) return;
      const q = Q[qi]; elegida = k;
      B.$$('.tb,.tn', teclado).forEach(x => x.classList.toggle('sel', x.dataset.k === k));
      V().nota(q.timbre, T.midi(k) - q.semis, B.ac().currentTime + .03, 1.2, .85);
      pinta();
    }
    function comprueba() {
      if (!elegida || hecha) { if (!elegida) V().ui('mal'); return; }
      const q = Q[qi], pc = ((T.midi(elegida) - q.semis) % 12 + 12) % 12;
      if (pc === 9) {
        hecha = true; V().ui('ok'); B.$$('.sel', teclado).forEach(x => x.classList.add('bien'));
        M().barraTexto(q.bien);
        const t = B.ac().currentTime + .1; V().nota('oboe', 69, t, 1.6, .6); V().nota(q.timbre, T.midi(elegida) - q.semis, t, 1.6, .7);
        B.espera(2.2, c).then(ok => { if (!ok) return; qi++; if (qi < Q.length) pregunta(); else { M().barraTexto(cfg.fin); if (cfg.fondo) M().fondo(cfg.fondo, {}); M().esperaSigue(c).then(ok2 => res0 && res0(ok2)); } });
      } else { V().ui('mal'); M().barraTexto(q.mal); }
    }
    return M().cartel(cfg.cartel, { botones: [bLa, bComp] }).then(() => { pregunta(); V().nota('oboe', 69, B.ac().currentTime + .1, 2, .9); return new Promise(res => { res0 = res; c.alMorir.push(() => res(false)); }); });
  };
})(window.TR);
