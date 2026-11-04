/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 3 · SECUENCIA CINEMÁTICA de entrada (GUION-S3 3b, Iago 4-nov): después del túnel 2100 → 2026, ~33 s en los que
   suena SIN CORTES el ensayo de la cantante en Re M (una sola pista, que nunca se reinicia) mientras cambian los planos:
     dron sobre A Coruña (3–4 planos) + t3_006 → sala del Rosalía → Noa aparece entre bastidores (destello) + t3_007, t3_008
     → pasillo de camerinos → CAMERINO, que se ancla a la QUIEBRA del la5 (la imagen de la cantante coincide con ella).
   La voz cambia de «distancia» con WebAudio (pasa-bajos, reverberación, nivel), con transiciones suaves:
     dron etérea (reverb 3,6 s, 70 % húmeda, 3 kHz, −10 dB) · sala 50 % · pasillo 30 % (tras la puerta) · camerino seca (5 %) y plena.
   Va por el bus de música: los diálogos la agachan solos. Tolera otra toma: lee la duración del fichero, reparte los planos en
   proporción y ancla el camerino a cfg.quiebra (s; si falta, duración − 1,88 s como en la toma de A).
   cfg = { mp3, quiebra, la5, planos: { dron:[img…], sala, llegada, pasillo, camerino:[img…], agudo }, vids:{…}, lineas:{ narr, reg, noa }, amb:{…} }
   Chrome 94: sin ?. ni ??.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const I = B.inter, M = () => B.motor;
  const RAP = () => B.param('rapido') === '1';
  /* (Iago 4-nov) la toma llega SECA: la distancia se hace sobre todo con REVERB (larga, con pre-delay), y un filtro suave.
     hum = proporción húmeda de la mezcla (seca = 1 − hum) · f = pasa-bajos (Hz) · db = nivel */
  const DIST = {
    dron: { f: 3000, db: -10, hum: .7, q: .5 }, sala: { f: 6000, db: -6, hum: .5, q: .5 },
    pasillo: { f: 2600, db: -4, hum: .3, q: .6 }, camerino: { f: 18000, db: 0, hum: .05, q: .5 } };
  const TAU = .5;   // setTargetAtTime: ≈ 1,5 s de transición
  function irSala(C, seg) { const sr = C.sampleRate, n = Math.floor(sr * seg), b = C.createBuffer(2, n, sr); for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.2); } return b; }
  I.secuencia = function (cfg, c) {
    const Mo = M(), C = B.ac(), E = B.$('#escena');
    E.classList.remove('con-inter'); B.$('#inter').className = '';
    B.musica(null);
    const buf = B.buf[cfg.mp3], D = buf ? buf.duration : 34.3;
    const Q = cfg.quiebra != null && Math.abs(D - (cfg.dur || 34.3)) < .3 ? cfg.quiebra : D - ((cfg.dur || 34.3) - (cfg.quiebra || 32.42));
    const K = RAP() ? .08 : 1;   // (pruebas) todo más deprisa
    /* ── la pista de la voz con su «distancia» ── */
    let src = null, lp = null, g = null, wet = null, dry = null;
    if (buf) {
      src = C.createBufferSource(); src.buffer = buf;
      lp = C.createBiquadFilter(); lp.type = 'lowpass'; g = C.createGain(); dry = C.createGain(); wet = C.createGain();
      const pre = C.createDelay(.2); pre.delayTime.value = .07;   // pre-delay de la reverb
      const rv = C.createConvolver(); rv.buffer = irSala(C, 3.6); rv.normalize = true;
      src.connect(lp); lp.connect(dry); dry.connect(g); lp.connect(pre); pre.connect(rv); rv.connect(wet); wet.connect(g); g.connect(B.bus.mus);
      const d0 = DIST.dron; lp.frequency.value = d0.f; lp.Q.value = d0.q; g.gain.value = Math.pow(10, d0.db / 20); wet.gain.value = d0.hum * 1.6; dry.gain.value = 1 - d0.hum;
      B.vivo(src, 'mus');   // (4-nov) arranca más abajo, tras calcular preR
    }
    /* wet ×1,6: la reverb normalizada suena más baja que la señal seca; así la mezcla percibida es la de «hum» */
    const distancia = n => { if (!lp) return; const d = DIST[n], t = C.currentTime, k = TAU; lp.frequency.setTargetAtTime(d.f, t, k); lp.Q.setTargetAtTime(d.q, t, k); g.gain.setTargetAtTime(Math.pow(10, d.db / 20), t, k); wet.gain.setTargetAtTime(d.hum * 1.6, t, k); dry.gain.setTargetAtTime(1 - d.hum, t, k); };
    const para = f => { if (!src) return; try { const t = C.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + (f || .3)); src.stop(t + (f || .3) + .05); } catch (e) { } src = null; };
    /* ── el reparto: camerino anclado a la quiebra; lo de antes, en proporción ── */
    const durVoz = l => { const r = (B.CFG.voz || 'voz/t3/') + l.id + '.mp3'; return B.buf[r] ? B.buf[r].duration : Math.max(1.6, l.texto.length * .075); };
    const L = cfg.lineas, dDial = durVoz(L.reg) + durVoz(L.noa) + .9;
    const tCam = Math.max(8, Q - (cfg.antesCamerino || 6));
    const libre = Math.max(6, tCam - dDial - 1.4);
    const tDron = Math.max(durVoz(L.narr) + 1.6, libre * .58), tSala = Math.max(2.4, libre * .2), tPas = Math.max(2.2, libre - tDron - tSala);
    /* (Iago 4-nov) planos de dron más largos: cada uno dShot s; si no caben antes de que avance la voz, los primeros van ANTES de que empiece el ensayo (preR) */
    const dShot = cfg.dronShot || 4.4, preR = Math.max(0, cfg.planos.dron.length * dShot - tDron);
    const T = { sala: tDron, llegada: tDron + tSala, dial: tDron + tSala + 1.4, pasillo: tDron + tSala + 1.4 + dDial, cam: tCam };
    B._secuencia = { T: T, D: D, Q: Q, tPas: tPas, preR: preR, dShot: dShot };
    if (src && !RAP()) src.start(C.currentTime + .05 + preR);
    const P = cfg.planos, V = cfg.vids || {};
    const pon = (img, vid) => { Mo.cambia(img, { funde: .9 }); if (vid && Mo.fondoVideo) Mo.fondoVideo(vid, true); };
    /* (Iago 4-nov) los planos de dron de Coruña: CORTE DIRECTO, sin fundidos ni deriva/zoom de la lámina */
    const F = B.$('#fondo');
    const ponCorte = (img, vid) => { F.classList.add('corte'); Mo.cambia(img, { funde: 0 }); if (vid && Mo.fondoVideo) Mo.fondoVideo(vid, true); };
    const en0 = (t, fn) => B.espera(t * K, c).then(ok => { if (ok) fn(); return ok; });   // tiempo absoluto desde el inicio de la secuencia
    const en = (t, fn) => en0(t + preR, fn);   // tiempo de la VOZ (empieza en preR)
    return new Promise(res => {
      let fin = false;
      const acaba = ok => { if (fin) return; fin = true; F.classList.remove('corte'); if (!ok) para(.15); res(ok); };
      c.alMorir.push(() => acaba(false));
      /* 1 · dron (y el narrador) */
      const nD = P.dron.length;
      P.dron.forEach((img, i) => en0(i * dShot, () => { ponCorte(img, V.dron && V.dron[i]); if (Mo.preparaVideo && V.dron) Mo.preparaVideo(V.dron[i + 1] || V.llegada); }));   /* (4-nov) el siguiente vídeo, ya cebado */
      B.ambiente(cfg.amb.dron);
      en0(1.2, () => Mo.di(Object.assign({ auto: .2 }, L.narr), c).then(() => { if (!fin) Mo.calla(); }));
      /* 2 · la sala */
      en(T.sala, () => { F.classList.remove('corte'); pon(P.sala); distancia('sala'); B.ambiente(cfg.amb.sala); });
      /* 3 · Noa aparece entre bastidores (destello) y la regidora la intercepta */
      en(T.llegada, () => { pon(P.llegada, V.llegada); distancia('pasillo'); B.ambiente(cfg.amb.bastidores); B.sfx('../s1/sfx/sfx_llegada.mp3', .8); E.classList.add('destello-t3'); setTimeout(() => E.classList.remove('destello-t3'), 900); });
      en(T.dial, () => { pon(P.regidora); Mo.di(Object.assign({ auto: .15 }, L.reg), c).then(ok => ok && !fin ? Mo.di(Object.assign({ auto: .15 }, L.noa), c) : false).then(() => { if (!fin) Mo.calla(); }); });
      /* 4 · el pasillo de camerinos (la voz, tras la puerta) */
      en(T.pasillo, () => { Mo.calla(); B.capas.pj(null); pon(P.pasillo); B.ambiente(cfg.amb.pasillo); if (cfg.sfxPasos) B.sfx(cfg.sfxPasos, .6); });
      /* 5 · camerino: la voz, nítida; la cantante en el la5 y la quiebra */
      en(T.cam, () => { Mo.calla(); B.capas.pj(null); pon(P.camerino[0]); distancia('camerino'); B.ambiente(cfg.amb.camerino); if (cfg.sfxPuerta) B.sfx(cfg.sfxPuerta, .5); });
      if (P.camerino[1]) en(T.cam + (Q - T.cam) * .5, () => pon(P.camerino[1]));
      en(Q - .12, () => { pon(P.agudo); if (!buf && cfg.sfxRota) B.sfx(cfg.sfxRota, .9); });
      en(Q + 1.1, () => acaba(true));   // la cola de la sala sigue sonando en el plano siguiente
    });
  };
})(window.TR);
