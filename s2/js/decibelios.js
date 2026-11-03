/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 2 · interactivo «decibelios» (Iago, 3-nov): antes del salto a Santiago, calibrar la INTENSIDAD.
   Cuatro señales de la máquina (220 · 440 · 880 · 1760 Hz, timbres suaves). Cada una: un deslizador de ganancia que empieza
   en silencio y un SONÓMETRO de aguja que mide de verdad el nivel (AnalyserNode → RMS → dBFS → dB de la escala del
   sonómetro). (Iago, 3-nov 09:56) Los cuatro con la MISMA escala (40–100 dB) y el objetivo en un sitio distinto del dial,
   marcado con una franja de color que cubre el margen de encaje (±1,5 dB) y su número encima. Encaja a ±1,5 dB (sfx_anillo_encaja) y el canal
   se queda sonando bajito. Con los cuatro, la máquina se activa y se enciende «Continuar»; al pulsarlo, fundido breve.
   cfg = { canales:[{hz, obj, pos, nombre?}], cartel, cartelCorto, pista, textoFin, destino, sfxActiva:[rutas] }
     pos = dónde cae el objetivo en el deslizador (0–1), distinto por canal
   Deslizador como el de calibrar (T1): pointer capture (ratón y táctil), clic en la pista = salta ahí, Mayús = arrastre lento,
   flechas ±1 (Mayús ±10), rueda, botones − y +. Chrome 94: sin ?. ni ??.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const I = B.inter, M = () => B.motor, V = () => B.viento;
  const el = B.el, NS = 'http://www.w3.org/2000/svg';
  const btn = (txt, cls, fn, tit) => { const b = el('button', cls || '', txt); b.type = 'button'; if (tit) { b.title = tit; b.setAttribute('aria-label', tit); } if (fn) b.addEventListener('click', ev => { ev.stopPropagation(); fn(b); }); return b; };
  const sv = (tag, at, padre) => { const n = document.createElementNS(NS, tag); Object.keys(at || {}).forEach(k => n.setAttribute(k, at[k])); if (padre) padre.appendChild(n); return n; };
  const coma = x => String(x).replace('.', ',');

  /* timbres: armónicos suaves, menos cuanto más aguda (nada estridente) */
  const TIMBRE = { 220: [1, .34, .14, .06, .025], 440: [1, .24, .07, .02], 880: [1, .12, .025], 1760: [1, .04] };
  const SPAN = 48;      // dB que recorre el deslizador entero (≈0,5 dB por paso)
  const TOL = 1.5;      // encaja a ±1,5 dB (la franja de color del dial cubre exactamente este margen)

  I.decibelios = function (cfg, c) {
    const AC = B.ac();
    const CAN = cfg.canales || [{ hz: 220, obj: 62, pos: .46 }, { hz: 440, obj: 76, pos: .78 }, { hz: 880, obj: 52, pos: .34 }, { hz: 1760, obj: 88, pos: .62 }];
    const ESC = cfg.escala || [40, 100];   // la misma escala en los cuatro sonómetros
    /* nivel (dBFS) que mide el sonómetro en el objetivo, y amplitud que llega al altavoz en el objetivo (menor cuanto más aguda) */
    const DBFS = [-24, -27, -30, -33], OIDO = f => .075 * Math.pow(220 / f, .6);
    const coro = AC.createGain(); coro.gain.value = 1; coro.connect(B.bus.inst);
    let vivo = true, activa = false, fin = null, raf = 0;
    function fuera(fd) {
      if (!vivo) return; vivo = false; cancelAnimationFrame(raf); fd = fd || .5;
      const t = AC.currentTime; coro.gain.cancelScheduledValues(t); coro.gain.setValueAtTime(coro.gain.value, t); coro.gain.linearRampToValueAtTime(0, t + fd);
      canales.forEach(k => { try { k.osc.stop(t + fd + .05); k.lfo.stop(t + fd + .05); } catch (e) { } });
      setTimeout(() => { try { coro.disconnect(); } catch (e) { } }, (fd + .3) * 1000);
    }
    c.alMorir.push(() => fuera(.15));

    const p = B.$('#inter'); p.innerHTML = ''; p.className = 'on i-db';
    /* la pantalla de la máquina: cuatro anillos que se encienden + estado */
    const pant = el('div', 'db-pant'); p.appendChild(pant);
    const mini = sv('svg', { viewBox: '-50 -50 100 100', class: 'db-anillos' }, pant);
    const anillos = CAN.map((x, i) => sv('circle', { r: 16 + i * 9, class: 'an', 'stroke-dasharray': i % 2 ? '7 4' : '16 5' }, mini));
    sv('circle', { r: 8, class: 'nuc' }, mini);
    const pTxt = el('div', 'db-ptxt'); pant.appendChild(pTxt);
    const pCuenta = el('b', 'db-cuenta'); pant.appendChild(pCuenta);
    const fila = el('div', 'db-canales'); p.appendChild(fila);

    const canales = CAN.map((cf, i) => {
      const hz = cf.hz, obj = cf.obj, pos0 = cf.pos == null ? .5 : cf.pos, LO = ESC[0], HI = ESC[1];
      const arm = TIMBRE[hz] || [1, .1];
      /* el oscilador (forma de onda sin normalizar: su RMS se conoce) + un vibrato lento que no cambia el nivel */
      const real = new Float32Array(arm.length + 1), imag = new Float32Array(arm.length + 1);
      arm.forEach((a, n) => { imag[n + 1] = a; });
      const rms0 = Math.sqrt(arm.reduce((s, a) => s + a * a, 0) / 2);
      const osc = AC.createOscillator(); osc.setPeriodicWave(AC.createPeriodicWave(real, imag, { disableNormalization: true })); osc.frequency.value = hz;
      const lfo = AC.createOscillator(), lfoG = AC.createGain(); lfo.frequency.value = 4.6 + i * .37; lfoG.gain.value = hz * .0022; lfo.connect(lfoG); lfoG.connect(osc.frequency);
      const sig = AC.createGain(); sig.gain.value = 0;              // la señal que mide el sonómetro
      const an = AC.createAnalyser(); an.fftSize = 2048; an.smoothingTimeConstant = 0;
      const aud = AC.createGain(); aud.gain.value = 0;              // lo que llega al altavoz (con techo: nunca más de +6 dB sobre el objetivo)
      osc.connect(sig); sig.connect(an); osc.connect(aud); aud.connect(coro);
      osc.start(); lfo.start();
      const gObj = Math.pow(10, DBFS[i] / 20) / rms0, audObj = OIDO(hz);
      const lect = v => v <= 0 ? -Infinity : obj + (v / 100 - pos0) * SPAN;     // lectura teórica (dB de la escala) para el paso v

      /* ── la columna ── */
      const col = el('div', 'db-can'); fila.appendChild(col);
      col.appendChild(el('div', 'db-cab', '<b>Señal ' + (i + 1) + '</b><span>' + hz + ' Hz</span><i class="luz"></i>'));
      /* sonómetro de aguja: arco de 120°, escala común 40–100 dB; el objetivo, en su sitio del dial: franja ámbar ±1,5 dB,
         raya blanca en su centro y su número encima */
      const g = sv('svg', { viewBox: '0 -42 360 256', class: 'db-medidor' }); col.appendChild(g);
      const CX = 180, CY = 196, R = 150, ANG = 60;
      const ang = d => (B.clamp((d - LO) / (HI - LO), -.04, 1.04) * 2 - 1) * ANG;       // dB → grados (0 = vertical)
      const pt = (a, r) => { const t = (a - 90) * Math.PI / 180; return [CX + r * Math.cos(t), CY + r * Math.sin(t)]; };
      const arco = (d0, d1, r) => { const a = pt(ang(d0), r), b = pt(ang(d1), r); return 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' A' + r + ' ' + r + ' 0 0 1 ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1); };
      sv('path', { d: arco(LO, HI, R), class: 'm-arco' }, g);
      sv('path', { d: arco(HI - 5, HI, R - 6), class: 'm-rojo' }, g);
      sv('path', { d: arco(obj - TOL, obj + TOL, R - 5), class: 'm-zona' }, g);
      for (let d = LO; d <= HI; d += 2) {
        const may = (d - LO) % 10 === 0, a = pt(ang(d), R + 2), b = pt(ang(d), R + (may ? 18 : 10));
        sv('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: may ? 'm-may' : 'm-men' }, g);
        if (may && Math.abs(d - obj) >= 7) { const q = pt(ang(d), R + 34); const tx = sv('text', { x: q[0], y: q[1] + 7, class: 'm-num' }, g); tx.textContent = d; }
      }
      const c0 = pt(ang(obj), R - 26), c1 = pt(ang(obj), R + 26); sv('line', { x1: c0[0], y1: c0[1], x2: c1[0], y2: c1[1], class: 'm-centro' }, g);
      const qo = pt(ang(obj), R + 54);
      sv('rect', { x: qo[0] - 30, y: qo[1] - 19, width: 60, height: 34, class: 'm-obj-caja' }, g);
      const to = sv('text', { x: qo[0], y: qo[1] + 8, class: 'm-obj' }, g); to.textContent = obj;
      const ag = sv('g', { class: 'm-aguja' }, g);
      sv('line', { x1: CX, y1: CY + 12, x2: CX, y2: CY - R - 8 }, ag);
      sv('circle', { cx: CX, cy: CY, r: 13, class: 'm-eje' }, g);
      const num = el('div', 'db-num', '—'); col.appendChild(num);
      col.appendChild(el('div', 'db-obj', 'Objetivo <b>' + obj + ' dB</b>'));
      /* el deslizador */
      const ctl = el('div', 'db-ctl'); col.appendChild(ctl);
      const menos = btn('−', 'cuad', () => paso(-1), 'Bajar la señal ' + (i + 1)), mas = btn('+', 'cuad', () => paso(1), 'Subir la señal ' + (i + 1));
      const pista = el('div', 'db-pista'); pista.tabIndex = 0; pista.setAttribute('role', 'slider'); pista.setAttribute('aria-label', 'Intensidad de la señal ' + (i + 1));
      pista.setAttribute('aria-valuemin', 0); pista.setAttribute('aria-valuemax', 100);
      const rel = el('i', 'db-rel'), tir = el('i', 'db-tir'); pista.appendChild(rel); pista.appendChild(tir);
      pista.appendChild(el('span', 'db-ext', '<b>silencio</b><b>máx.</b>'));
      ctl.appendChild(menos); ctl.appendChild(pista); ctl.appendChild(mas);

      const k = { i: i, obj: obj, pos: pos0, osc: osc, lfo: lfo, col: col, pista: pista, ok: false, v: 0, x: LO - 3, vel: 0, okT: 0, pasado: false };
      let posTir = 0, arr = null, dbAct = -Infinity;
      function aplica() {   // ganancias según el valor (con el encaje: a ±1 dB queda exacto)
        let d = lect(k.v); if (Math.abs(d - obj) <= TOL) d = obj;
        dbAct = d;
        const t = AC.currentTime, gs = d === -Infinity ? 0 : gObj * Math.pow(10, (d - obj) / 20);
        const ga = d === -Infinity ? 0 : audObj * Math.min(2, Math.pow(10, (d - obj) / 20)) * (k.ok ? .45 : 1);
        sig.gain.setTargetAtTime(gs, t, .015); aud.gain.setTargetAtTime(ga, t, .04);
      }
      k.aplica = aplica;
      function pinta() { tir.style.left = (posTir * 100) + '%'; rel.style.width = (posTir * 100) + '%'; pista.setAttribute('aria-valuenow', k.v); }
      function pon(v, desdePos) {
        if (activa) return;
        k.v = B.clamp(Math.round(v), 0, 100); posTir = desdePos != null ? desdePos : k.v / 100;
        aplica(); pinta();
      }
      function paso(d) { pon(k.v + d); }
      k.pon = pon;
      /* lectura de verdad: RMS de la señal → dBFS → dB del sonómetro (si el audio está parado, la teórica) */
      const buf = new Float32Array(an.fftSize);
      k.mide = function () {
        if (AC.state !== 'running') return dbAct;
        an.getFloatTimeDomainData(buf); let s = 0; for (let n = 0; n < buf.length; n++) s += buf[n] * buf[n];
        const rms = Math.sqrt(s / buf.length); return rms < 1e-7 ? -Infinity : 20 * Math.log10(rms) - DBFS[i] + obj;
      };
      k.dibuja = function (dt, m) {
        /* aguja con inercia: muelle amortiguado (un pelín de rebote, como un sonómetro de verdad) */
        const meta = m === -Infinity ? LO - 3 : B.clamp(m, LO - 3, HI + 3);
        for (let n = Math.ceil(dt / .008), h = dt / n; n > 0; n--) { const acc = 70 * (meta - k.x) - 12.5 * k.vel; k.vel += acc * h; k.x += k.vel * h; }   // en pasitos: igual de rápida con pocos fotogramas
        if (k.x < LO - 3) { k.x = LO - 3; k.vel = Math.max(0, k.vel); }
        if (k.x > HI + 3) { k.x = HI + 3; k.vel = Math.min(0, k.vel); }
        ag.setAttribute('transform', 'rotate(' + ang(k.x).toFixed(2) + ' ' + CX + ' ' + CY + ')');
        num.textContent = m === -Infinity || k.x < LO - 2 ? '—' : coma(k.x.toFixed(1)) + ' dB';
        col.classList.toggle('cerca', !k.ok && Math.abs(k.x - obj) <= 3);
        col.classList.toggle('alto', !k.ok && k.x > obj + 6);
      };
      /* arrastre (pointer capture) */
      pista.addEventListener('pointerdown', ev => {
        if (activa || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
        ev.preventDefault(); ev.stopPropagation(); pista.focus();
        const r = pista.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width, tr = tir.getBoundingClientRect();
        if (ev.clientX < tr.left - 6 || ev.clientX > tr.right + 6) { posTir = B.clamp(x, 0, 1); pon(posTir * 100, posTir); }
        arr = { id: ev.pointerId, x: ev.clientX, p: posTir, w: r.width, l: r.left }; arr.off = posTir - x;
        try { pista.setPointerCapture(ev.pointerId); } catch (e) { }
        col.classList.add('mueve');
      });
      pista.addEventListener('pointermove', ev => {
        if (!arr || ev.pointerId !== arr.id) return;
        ev.preventDefault();
        const dx = ev.clientX - arr.x, xr = (ev.clientX - arr.l) / arr.w; arr.x = ev.clientX;
        if (ev.shiftKey) { arr.p = B.clamp(arr.p + dx / arr.w * .25, 0, 1); arr.off = arr.p - xr; }   // con Mayúsculas, lento
        else arr.p = B.clamp(xr + arr.off, 0, 1);
        pon(arr.p * 100, arr.p);
      });
      const suelta = ev => { if (!arr || (ev && ev.pointerId !== arr.id)) return; try { pista.releasePointerCapture(arr.id); } catch (e) { } arr = null; col.classList.remove('mueve'); posTir = k.v / 100; pinta(); };
      pista.addEventListener('pointerup', suelta); pista.addEventListener('pointercancel', suelta); pista.addEventListener('lostpointercapture', () => suelta());
      pista.addEventListener('keydown', ev => {
        const t = ev.key, d = ev.shiftKey ? 10 : 1;
        if (t === 'ArrowRight' || t === 'ArrowUp') { ev.preventDefault(); ev.stopPropagation(); paso(d); }
        else if (t === 'ArrowLeft' || t === 'ArrowDown') { ev.preventDefault(); ev.stopPropagation(); paso(-d); }
        else if (t === 'PageUp' || t === 'PageDown') { ev.preventDefault(); ev.stopPropagation(); paso(t === 'PageUp' ? 10 : -10); }
        else if (t === 'Home' || t === 'End') { ev.preventDefault(); ev.stopPropagation(); pon(t === 'Home' ? 0 : 100); }
        else ev.stopPropagation();
      });
      pista.addEventListener('wheel', ev => { if (activa) return; ev.preventDefault(); paso((ev.deltaY < 0 || ev.deltaX > 0 ? 1 : -1) * (ev.shiftKey ? 10 : 1)); }, { passive: false });
      k.fija = () => { pista.tabIndex = -1; col.classList.add('fija'); menos.disabled = mas.disabled = true; };
      k.anillo = anillos[i];
      pinta();
      return k;
    });
    B._db = canales;   // (solo para las pruebas automáticas)

    const corto = cfg.cartelCorto || 'Sube cada señal hasta que la aguja de su sonómetro quede <b>en el centro de la zona ámbar</b>. Afina con − y + (o con las flechas; con Mayús, de 10 en 10).';
    let pistaVista = false;
    function estado() {
      const n = canales.filter(k => k.ok).length;
      pTxt.innerHTML = activa ? B.esc(cfg.destino || 'Intensidad calibrada · Destino: Santiago, hacia 1730') : 'Calibración de intensidad';
      pCuenta.textContent = activa ? 'LISTO' : n + ' / ' + canales.length;
    }
    estado();
    /* el bucle: mide, mueve las agujas, encaja y avisa si alguien se pasa */
    let tAnt = performance.now();
    (function bucle(ahora) {
      if (!vivo) return;
      const dt = Math.min(.25, Math.max(.001, ((ahora || performance.now()) - tAnt) / 1000)); tAnt = ahora || performance.now();
      let pasado = null;
      canales.forEach(k => {
        const m = k.mide(); k.dibuja(dt, m);
        if (activa) return;
        const dentro = m !== -Infinity && Math.abs(m - k.obj) <= TOL && Math.abs(k.x - k.obj) <= TOL;
        if (!k.ok) {
          k.okT = dentro ? k.okT + dt : 0;
          if (k.okT >= .3) { k.ok = true; k.col.classList.add('ok'); k.anillo.classList.add('on'); B.sfx('../s1/sfx/sfx_anillo_encaja.mp3', .9); k.aplica(); estado(); revisa(); }
        } else if (!(m !== -Infinity && Math.abs(m - k.obj) <= TOL + .3)) { k.ok = false; k.okT = 0; k.col.classList.remove('ok'); k.anillo.classList.remove('on'); k.aplica(); estado(); }
        if (!k.ok && m !== -Infinity && m > k.obj + 3) pasado = k;
      });
      if (!activa) {
        if (pasado && !pistaVista) { pistaVista = true; M().barraTexto(cfg.pista ? cfg.pista.replace('{n}', pasado.i + 1) : 'Te has pasado en la <b>señal ' + (pasado.i + 1) + '</b>: baja un poco su intensidad hasta que la aguja vuelva <b>al centro de la zona</b>.'); }
        else if (!pasado && pistaVista) { pistaVista = false; M().barraTexto(corto); }
      }
      raf = requestAnimationFrame(bucle);
    })();

    function revisa() {
      if (activa || !canales.every(k => k.ok)) return;
      activa = true;
      canales.forEach(k => k.fija());
      p.classList.add('activa'); mini.classList.add('gira'); V().ui('enciende');
      B.arr(cfg.sfxActiva).forEach((x, n) => B.espera(n * .6, c).then(ok => ok && B.sfx(x, .8)));
      const t = AC.currentTime; coro.gain.cancelScheduledValues(t); coro.gain.setValueAtTime(coro.gain.value, t); coro.gain.linearRampToValueAtTime(1.5, t + .8);   // el acorde completo crece al activarse
      estado();
      M().barraTexto(cfg.textoFin || 'Intensidad calibrada: cada señal en su nivel exacto.');
      M().esperaSigue(c).then(ok => { fuera(ok ? .6 : .15); if (fin) fin(ok); });   // al pulsar Continuar, fundido breve: nada sonando debajo de lo siguiente
    }
    return M().cartel(cfg.cartel || 'Calibra la intensidad: sube cada señal hasta que su sonómetro quede justo en el centro de la zona marcada.', { botones: [], aulaSolo: false })
      .then(() => new Promise(res => { fin = res; c.alMorir.push(() => res(false)); M().barraTexto(corto); }));
  };
})(window.TR);
