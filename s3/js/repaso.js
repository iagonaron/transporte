/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 3 · interactivo «repaso» (~2 min): la CONSOLA HOLOGRÁFICA del Transportador calibra a Noa con lo de T1 y T2.
     1 · Instrumentos: une cada instrumento con su afinación y con lo que suena cuando lee Do (8 fichas)
     2 · Transporte escrito: 4 preguntas (tonalidad y armadura nuevas · número y dirección de las diferencias)
     3 · Ventajas y desventajas del transporte escrito: 6 fichas a dos columnas
   Al acabar: «Calibración de Noa: 100 %» y se enciende «Continuar». Fallos sin castigo: la ficha vuelve a su sitio.
   Fichas: tocar la ficha y después su hueco, o arrastrarla (ratón y táctil). Estética «Onda»: cian #63e6ff · ámbar #ffb547.
   (pruebas) TR._repaso.paso() hace la siguiente acción correcta con clics; TR._repaso.fase() dice en qué prueba está.
   Chrome 94: sin ?. ni ??.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const I = B.inter, M = () => B.motor, V = () => B.viento, el = B.el;
  const NS = 'http://www.w3.org/2000/svg';
  const baraja = a => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = r[i]; r[i] = r[j]; r[j] = t; } return r; };
  const btn = (txt, cls, fn) => { const b = el('button', cls || '', txt); b.type = 'button'; if (fn) b.addEventListener('click', ev => { ev.stopPropagation(); fn(b); }); return b; };

  const INST = [
    { n: 'Clarinete', af: 'en Si♭', su: 'Si♭ · una 2.ª M más grave' },
    { n: 'Trompa', af: 'en Fa', su: 'Fa · una 5.ª J más grave' },
    { n: 'Saxofón alto', af: 'en Mi♭', su: 'Mi♭ · una 6.ª M más grave' },
    { n: 'Oboe', af: 'en Do', su: 'Do · lo mismo que lee' }
  ];
  const TEST = [
    { q: 'Transportas por escrito una melodía de <b>Sol M</b> una <b>2.ª M descendente</b>. ¿Tonalidad nueva y armadura?',
      ops: ['Fa M · 1♭', 'La M · 3♯', 'Fa M · sin alteraciones', 'Mi♭ M · 3♭'], ok: 0, ex: 'Sol, un tono más abajo, es fa: <b>Fa M</b> lleva un bemol (si♭).' },
    { q: 'De <b>Re M</b> una <b>2.ª M ascendente</b>. ¿Tonalidad nueva y armadura?',
      ops: ['Mi M · 4♯', 'Mi M · 2♯', 'Do M · sin alteraciones', 'Mi♭ M · 3♭'], ok: 0, ex: 'Re, un tono más arriba, es mi: <b>Mi M</b> lleva cuatro sostenidos.' },
    { q: 'De <b>Sol M (1♯)</b> a <b>Fa M (1♭)</b>: ¿cuántas diferencias hay y hacia dónde?',
      ops: ['2 hacia abajo', '2 hacia arriba', '1 hacia abajo', 'Ninguna'], ok: 0, ex: 'Un sostenido menos y un bemol más: <b>2 diferencias hacia abajo</b>.' },
    { q: 'De <b>Si♭ M (2♭)</b> una 2.ª M ascendente, a <b>Do M</b>: ¿cuántas diferencias hay y hacia dónde?',
      ops: ['2 hacia arriba', '2 hacia abajo', '3 hacia arriba', '1 hacia arriba'], ok: 0, ex: 'Dos bemoles menos: <b>2 diferencias hacia arriba</b>.' }
  ];
  const VD = [
    { t: 'Cuando ya está escrito, solo tienes que tocarlo', k: 'v' },
    { t: 'Mientras tocas, no tienes que pensar en el transporte', k: 'v' },
    { t: 'Puedes revisarlo con calma antes de tocar', k: 'v' },
    { t: 'Lleva tiempo', k: 'd' },
    { t: 'La partitura original ya no te sirve para esa versión', k: 'd' },
    { t: 'Hay que copiar nota a nota, sin errores', k: 'd' }
  ];
  const TOTAL = INST.length * 2 + TEST.length + VD.length;

  /* ── fichas: tocar + hueco, o arrastrar ── */
  function fichas(raiz, alSoltar) {
    let sel = null, arr = null;
    const escala = () => { const e = B.$('#escena'); return e ? e.getBoundingClientRect().width / 1920 : 1; };
    const selecciona = f => { if (sel) sel.classList.remove('sel'); sel = f && f !== sel ? f : null; if (sel) sel.classList.add('sel'); raiz.classList.toggle('con-sel', !!sel); };
    raiz.addEventListener('click', ev => {
      if (arr && arr.movido) return;
      const f = ev.target.closest('.rp-ficha'), h = ev.target.closest('.rp-hueco');
      if (f && !f.classList.contains('ok')) { ev.stopPropagation(); selecciona(f); return; }
      if (h && sel) { ev.stopPropagation(); const s = sel; selecciona(null); alSoltar(s, h); }
    });
    raiz.addEventListener('pointerdown', ev => {
      const f = ev.target.closest('.rp-ficha'); if (!f || f.classList.contains('ok') || ev.button > 0) return;
      arr = { f: f, x: ev.clientX, y: ev.clientY, movido: false, k: escala() };
      const mueve = e => {
        if (!arr) return;
        const dx = e.clientX - arr.x, dy = e.clientY - arr.y;
        if (!arr.movido && Math.abs(dx) + Math.abs(dy) < 9) return;
        if (!arr.movido) { arr.movido = true; selecciona(null); f.classList.add('arrastra'); }
        f.style.transform = 'translate(' + (dx / arr.k) + 'px,' + (dy / arr.k) + 'px)';
        const h = document.elementFromPoint(e.clientX, e.clientY); B.$$('.rp-hueco.encima', raiz).forEach(x => x.classList.remove('encima'));
        const hh = h && h.closest ? h.closest('.rp-hueco') : null; if (hh) hh.classList.add('encima');
      };
      const suelta = e => {
        document.removeEventListener('pointermove', mueve); document.removeEventListener('pointerup', suelta); document.removeEventListener('pointercancel', suelta);
        const a = arr; if (!a) return;
        B.$$('.rp-hueco.encima', raiz).forEach(x => x.classList.remove('encima'));
        if (a.movido) {
          const h = document.elementFromPoint(e.clientX, e.clientY), hh = h && h.closest ? h.closest('.rp-hueco') : null;   // antes de soltarla (si no, la ficha aún tapa el hueco)
          f.classList.remove('arrastra'); f.style.transform = '';
          if (hh) alSoltar(f, hh);
          setTimeout(() => { arr = null; }, 30);
        } else arr = null;
      };
      document.addEventListener('pointermove', mueve); document.addEventListener('pointerup', suelta); document.addEventListener('pointercancel', suelta);
    });
    return { selecciona: selecciona };
  }

  I.repaso = function (cfg, c) {
    const p = B.$('#inter'); p.innerHTML = ''; p.className = 'on i-repaso';
    let hechos = 0, fase = 0, sigue = null, fin = false;
    /* ── cabecera de la consola: anillo de calibración, título y las tres pruebas ── */
    const con = el('div', 'rp-consola'); p.appendChild(con);
    const cab = el('div', 'rp-cab'); con.appendChild(cab);
    const ani = document.createElementNS(NS, 'svg'); ani.setAttribute('viewBox', '0 0 100 100'); ani.setAttribute('class', 'rp-anillo');
    ani.innerHTML = '<circle cx="50" cy="50" r="42" class="fondo"/><circle cx="50" cy="50" r="42" class="arco" stroke-dasharray="0 264" transform="rotate(-90 50 50)"/><circle cx="50" cy="50" r="33" class="int" stroke-dasharray="3 6"/>';
    cab.appendChild(ani);
    const tit = el('div', 'rp-tit', '<small>Consola del Transportador</small><b>Calibración de Noa</b>'); cab.appendChild(tit);
    const pasos = el('div', 'rp-pasos'); cab.appendChild(pasos);
    const NP = ['Instrumentos', 'Transporte escrito', 'Ventajas y desventajas'];
    const chips = NP.map((t, i) => { const d = el('div', 'rp-paso', '<i>' + (i + 1) + '</i><span>' + t + '</span>'); pasos.appendChild(d); return d; });
    const pct = el('b', 'rp-pct', '0 %'); cab.appendChild(pct);
    let cuerpo = el('div', 'rp-cuerpo'); con.appendChild(cuerpo);
    /* cada prueba en un cuerpo NUEVO (los oyentes de las fichas no se acumulan de una prueba a otra) */
    const limpia = cls => { const n = el('div', 'rp-cuerpo ' + cls); con.replaceChild(n, cuerpo); cuerpo = n; };
    const nota = el('div', 'rp-nota'); con.appendChild(nota);
    const pinta = () => {
      const v = Math.round(hechos / TOTAL * 100);
      pct.textContent = v + ' %';
      B.$('.arco', ani).setAttribute('stroke-dasharray', (264 * hechos / TOTAL).toFixed(1) + ' 264');
      chips.forEach((ch, i) => { ch.classList.toggle('act', i === fase); ch.classList.toggle('ya', i < fase); });
    };
    const dice = (txt, tipo) => { nota.className = 'rp-nota on' + (tipo ? ' ' + tipo : ''); nota.innerHTML = txt; };
    const suma = () => { hechos++; pinta(); };
    let accion = null;   // (pruebas) la siguiente acción correcta
    B._repaso = { paso: () => accion && accion(), fase: () => fase, hecho: () => fin };

    /* ══ 1 · instrumentos ══ */
    function unir() {
      limpia('f-unir');
      const tabla = el('div', 'rp-tabla'); cuerpo.appendChild(tabla);
      tabla.appendChild(el('div', 'rp-th', 'Instrumento')); tabla.appendChild(el('div', 'rp-th', 'Afinación')); tabla.appendChild(el('div', 'rp-th', 'Cuando lee <b>Do</b>, suena…'));
      INST.forEach((x, i) => {
        tabla.appendChild(el('div', 'rp-inst', '<b>' + x.n + '</b>'));
        const h1 = el('div', 'rp-hueco', '<i>?</i>'); h1.dataset.k = 'af' + i; tabla.appendChild(h1);
        const h2 = el('div', 'rp-hueco ancho', '<i>?</i>'); h2.dataset.k = 'su' + i; tabla.appendChild(h2);
      });
      const pozo = el('div', 'rp-pozo'); cuerpo.appendChild(pozo);
      const g1 = el('div', 'rp-grupo'), g2 = el('div', 'rp-grupo'); pozo.appendChild(g1); pozo.appendChild(g2);
      baraja(INST.map((x, i) => ({ t: x.af, k: 'af' + i }))).forEach(f => { const d = el('div', 'rp-ficha', f.t); d.dataset.k = f.k; g1.appendChild(d); });
      baraja(INST.map((x, i) => ({ t: x.su, k: 'su' + i }))).forEach(f => { const d = el('div', 'rp-ficha ancho', f.t); d.dataset.k = f.k; g2.appendChild(d); });
      let bien = 0;
      fichas(cuerpo, (f, h) => {
        if (h.classList.contains('lleno')) return;
        if (f.dataset.k === h.dataset.k) {
          h.innerHTML = ''; h.appendChild(f); f.classList.add('ok'); f.classList.remove('sel'); h.classList.add('lleno', 'ok'); V().ui('ok'); suma(); bien++;
          dice(bien < 8 ? '¡Encaja! Sigue.' : '¡Instrumentos calibrados!', 'ok');
          if (bien === 8) B.espera(1.1, c).then(ok => ok && siguiente());
        } else {
          V().ui('mal'); h.classList.add('mal'); setTimeout(() => h.classList.remove('mal'), 520); f.classList.add('vuelve'); setTimeout(() => f.classList.remove('vuelve'), 420);
          const k = f.dataset.k.slice(0, 2), ins = INST[+h.dataset.k.slice(2)];
          if (k !== h.dataset.k.slice(0, 2)) dice('Esa ficha va en la otra columna.', 'mal');
          else dice(k === 'af' ? 'No es esa. Piensa: ¿en qué afinación está el <b>' + ins.n.toLowerCase() + '</b>?' : 'Cuando lee Do, suena la nota de su afinación: ¿cuál es la del <b>' + ins.n.toLowerCase() + '</b>?', 'mal');
        }
      });
      dice('');
      accion = () => { const f = B.$$('.rp-ficha:not(.ok)', cuerpo)[0]; if (!f) return; f.click(); const h = B.$('.rp-hueco[data-k="' + f.dataset.k + '"]', cuerpo); if (h) h.click(); };
    }
    /* ══ 2 · transporte escrito: cuatro preguntas ══ */
    function test() {
      limpia('f-test');
      let k = 0;
      const caja = el('div', 'rp-preg'); cuerpo.appendChild(caja);
      function monta() {
        const q = TEST[k], orden = baraja(q.ops.map((t, i) => i));
        caja.innerHTML = '<small>Pregunta ' + (k + 1) + ' de ' + TEST.length + '</small><p>' + q.q + '</p>';
        const ops = el('div', 'rp-ops'); caja.appendChild(ops);
        let resuelta = false;
        orden.forEach(i => {
          const b = btn(q.ops[i], 'rp-op', () => {
            if (resuelta || b.classList.contains('mal')) return;
            if (i === q.ok) { resuelta = true; b.classList.add('ok'); V().ui('ok'); suma(); dice('¡Correcto! ' + q.ex, 'ok');
              B.espera(1.6, c).then(ok => { if (!ok) return; k++; if (k < TEST.length) monta(); else siguiente(); }); }
            else { b.classList.add('mal'); V().ui('mal'); dice('Todavía no. ' + q.ex.replace(/<b>[^<]*<\/b>/, '…') + ' Prueba otra.', 'mal'); }
          });
          b.dataset.i = i; ops.appendChild(b);
        });
        dice(''); M().barraTexto('Elige la respuesta correcta. Si fallas, lee la pista y prueba otra.');
        accion = () => { const b = B.$('.rp-op[data-i="' + q.ok + '"]', caja); if (b) b.click(); };
      }
      monta();
    }
    /* ══ 3 · ventajas y desventajas del transporte escrito ══ */
    function ventajas() {
      limpia('f-vd');
      cuerpo.appendChild(el('div', 'rp-sub', 'Transporte <b>escrito</b>: ¿ventaja o desventaja?'));
      const cols = el('div', 'rp-cols'); cuerpo.appendChild(cols);
      const hv = el('div', 'rp-hueco col v', '<b class="rp-ct">Ventajas</b>'); hv.dataset.k = 'v';
      const hd = el('div', 'rp-hueco col d', '<b class="rp-ct">Desventajas</b>'); hd.dataset.k = 'd';
      cols.appendChild(hv); cols.appendChild(hd);
      const pozo = el('div', 'rp-pozo vd'); cuerpo.appendChild(pozo);
      baraja(VD).forEach(x => { const d = el('div', 'rp-ficha vd', x.t); d.dataset.k = x.k; pozo.appendChild(d); });
      let bien = 0;
      fichas(cuerpo, (f, h) => {
        if (f.dataset.k === h.dataset.k) {
          h.appendChild(f); f.classList.add('ok'); f.classList.remove('sel'); V().ui('ok'); suma(); bien++;
          dice(bien < VD.length ? '¡Bien!' : '¡Ya está!', 'ok');
          if (bien === VD.length) B.espera(1, c).then(ok => ok && siguiente());
        } else {
          V().ui('mal'); h.classList.add('mal'); setTimeout(() => h.classList.remove('mal'), 520); f.classList.add('vuelve'); setTimeout(() => f.classList.remove('vuelve'), 420);
          dice('Esa no va ahí. Acuérdate de Don Ramón copiando el himno: ¿le facilitaba el trabajo o se lo complicaba?', 'mal');
        }
      });
      dice(''); M().barraTexto('Toca una ficha y después su columna (o arrástrala hasta ella).');
      accion = () => { const f = B.$$('.rp-ficha:not(.ok)', cuerpo)[0]; if (!f) return; f.click(); (f.dataset.k === 'v' ? hv : hd).click(); };
    }
    /* ══ final: 100 % ══ */
    function final() {
      fin = true; accion = null; fase = 3; pinta();
      limpia('f-fin');
      const f = el('div', 'rp-final', '<small>Calibración de Noa</small><b>100 %</b><span>Transporte escrito e instrumentos transpositores: todo en su sitio.</span>');
      cuerpo.appendChild(f); con.classList.add('completa'); nota.className = 'rp-nota'; nota.innerHTML = '';
      B.sfx('../s1/sfx/sfx_anillo_encaja.mp3', .8); B.espera(.25, c).then(ok => ok && B.sfx('../s1/sfx/sfx_destello.mp3', .5));
      M().barraTexto('Calibración completa. Pulsa <b>Continuar</b>.');
      M().esperaSigue(c).then(ok => sigue && sigue(ok));
      if (M().aula) B.espera(4, c).then(ok => ok && sigue && sigue(true));
    }
    const FASES = [unir, test, ventajas];
    function siguiente() { if (c.muerto) return; fase++; pinta(); if (fase < FASES.length) FASES[fase](); else final(); }
    pinta(); FASES[0]();
    return M().cartel(cfg.cartel, { botones: [], aulaSolo: false }).then(() => new Promise(res => {
      sigue = res; c.alMorir.push(() => res(false));
      if (cfg.cartelCorto) M().barraTexto(cfg.cartelCorto);
    }));
  };
})(window.TR);
