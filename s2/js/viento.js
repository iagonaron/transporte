/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE · instrumentos sintetizados (lo escrito = lo que suena)
   Basado en playViento del portal antiguo de Transporte, con más cuerpo: formantes, vibrato que entra tarde,
   soplo de ataque. Todo por TR.bus.inst (con la reverberación de sala) y con el reloj del AudioContext.
   TR.viento.nota(tipo, midi, t, dur, vel) · tipo: 'saxo' | 'flauta' (caña) | 'clarinete' | 'trompa' | 'oboe'
   TR.viento.seno(frec) → { frec(f), parar() }   (oscilador del Transportador)
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const V = B.viento = {};
  const vivos = [];
  const PERFIL = {
    saxo: { o1: 'sawtooth', o2: 'square', m2: 2, g2: .12, corte: 5.5, abre: 2.6, form: [[900, 3, 1.4], [1700, 4, .9]], gan: .38, atk: .045, vib: .007, ruido: .07 },
    flauta: { o1: 'triangle', o2: 'sine', m2: 2, g2: .2, corte: 7, abre: 1, form: null, gan: .5, atk: .07, vib: .004, ruido: .16 },
    clarinete: { o1: 'square', o2: 'sine', m2: 3, g2: .12, corte: 4.2, abre: 1.6, form: [[1500, 3, .6]], gan: .3, atk: .04, vib: .002, ruido: .05 },
    trompa: { o1: 'sawtooth', o2: 'sine', m2: 2, g2: .15, corte: 2.6, abre: 1.8, form: [[450, 2, 1.2]], gan: .42, atk: .1, vib: .003, ruido: .03 },
    oboe: { o1: 'sawtooth', o2: 'square', m2: 3, g2: .08, corte: 6, abre: 1.3, form: [[1150, 6, 1.6], [2900, 5, .7]], gan: .26, atk: .035, vib: .006, ruido: .05 },
    /* (T2) ministriles de la Capilla de Música, hacia 1730, mientras no lleguen las muestras de Splice (s2/mus/<instr>/):
       chirimía (doble lengüeta, campana ancha: brillante y nasal), sacabuche (trombón antiguo: redondo y suave), bajón (dulcián: grave, de madera, algo áspero) */
    chirimia: { o1: 'sawtooth', o2: 'square', m2: 2, g2: .16, corte: 9, abre: 1.25, form: [[1250, 4, 1.8], [2700, 5, 1.1], [3600, 6, .5]], gan: .22, atk: .03, vib: .005, ruido: .06 },
    sacabuche: { o1: 'sawtooth', o2: 'sine', m2: 1, g2: .3, corte: 3.4, abre: 2.1, form: [[560, 2.2, 1.3], [1150, 3, .5]], gan: .36, atk: .07, vib: .002, ruido: .025 },
    bajon: { o1: 'sawtooth', o2: 'square', m2: 2, g2: .1, corte: 4.6, abre: 1.5, form: [[470, 3, 1.5], [1180, 4, .8], [2400, 5, .25]], gan: .34, atk: .05, vib: .003, ruido: .05 }
  };
  /* MUESTRAS REALES (3-nov, sets multimuestra hechos con audio/vsco_interactivos.py): mus/<instr>/<instr>_<nota>.mp3 (nota: C4, Cs4, C#4, Db4…),
     una sostenida cada 2–3 semitonos en el registro que se usa, mono, todas a −20 LUFS, con su ataque y su cola natural.
       T2 (s2/mus/): chirimía = oboe VSCO-2-CE (CC0) con el color del himno · sacabuche = trombón antiguo VSCO · bajón = fagot VSCO
       T1 (../s1/mus/): saxo (tonejs-instruments, MIT), clarinete, trompa, oboe (VSCO), flauta de caña (quena de Splice completada)
     Se descubren solas en el inventario (data/recursos.js); sampler por playbackRate desde la muestra más cercana (≤ 1,5 st).
     Si faltan, el sintetizado de siempre. */
  V.SAX_RUTAS = [];   // (el saxo ya va con las demás, en MUESTRAS_RUTAS)
  const PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  const MUE = {};
  /* afinación medida de cada muestra (cents; + = alta; vsco_interactivos.json, 3-nov) y muestras staccato (solo notas cortas; ahora ninguna) */
  const CENTS = { clarinete_C5: 2, clarinete_D5: 1, clarinete_F4: 3, clarinete_G4: 4, flauta_A5: 18, flauta_E5: -9, flauta_G4: -4,
    oboe_As4: 2, oboe_C5: 2, oboe_D5: 2, oboe_F4: 2, oboe_G4: 3, trompa_C4: -1, trompa_D3: -2, trompa_D4: -1, trompa_E4: -1, trompa_F3: -1,
    chirimia_As3: 3, chirimia_As4: 2, chirimia_C4: 2, chirimia_C5: 2, chirimia_D4: 2, chirimia_D5: 2, chirimia_F4: 2, chirimia_F5: 3, chirimia_G4: 3, chirimia_G5: 3 };
  const CORTA = {};
  Object.keys(B.RECURSOS || {}).forEach(r => {
    const m = /^(?:\.\.\/s1\/)?mus\/(saxo|trompa|clarinete|oboe|flauta|chirimia|sacabuche|bajon)\/[a-z]+_([a-g])(s|#|b)?(-?\d)\.(mp3|wav|ogg)$/i.exec(r);
    if (!m) return;
    const midi = 12 * (+m[4] + 1) + PC[m[2].toLowerCase()] + (m[3] === 's' || m[3] === '#' ? 1 : m[3] === 'b' ? -1 : 0);
    const base = r.replace(/^.*\//, '').replace(/\.\w+$/, '');
    (MUE[m[1].toLowerCase()] = MUE[m[1].toLowerCase()] || []).push([r, midi, CENTS[base] || 0, CORTA[base] ? 1 : 0]);
  });
  V.MUESTRAS_RUTAS = [].concat.apply([], Object.keys(MUE).map(k => MUE[k].map(x => x[0])));
  /* [rampa de entrada, suelta] (s): la muestra ya trae su ataque real, así que la rampa es mínima (solo evita el clic);
     ganancia por instrumento = el nivel que tenían las muestras de antes (lo que Iago ya oyó equilibrado con voz y música) */
  const ENV = { saxo: [.006, .12], trompa: [.008, .2], clarinete: [.006, .14], oboe: [.006, .14], flauta: [.01, .18], chirimia: [.006, .12], sacabuche: [.008, .18], bajon: [.006, .15] };
  const GAN = { saxo: 2.0, clarinete: 2.15, trompa: 3.4, oboe: 2.3, flauta: 4.0, chirimia: 1.15, sacabuche: 1.2, bajon: 1.2 };   // (T2: la chirimía en vivo, al nivel del himno grabado)
  function muestra(tipo, midi, t, dur, vel) {
    const l = MUE[tipo]; if (!l) return false;
    const cerca = cand => { let m = null, dd = 99; cand.forEach(x => { const d = Math.abs(x[1] - midi); if (B.buf[x[0]] && d < dd) { dd = d; m = x; } }); return [m, dd]; };
    let [mejor, d] = cerca(l.filter(x => !x[3]));   // primero las sostenidas
    if (!mejor || (dur <= .45 || d > 5)) { const o = cerca(l); if (o[0] && (!mejor || o[1] < d)) mejor = o[0]; }   // notas cortas (o lejos): también las staccato
    if (!mejor) return false;
    const C = B.ac(), s = C.createBufferSource(), g = C.createGain(), e0 = ENV[tipo] || [.01, .18];
    const e = [e0[0], dur <= .45 ? e0[1] * .75 : e0[1]];   // las cortas sueltan antes (que no se emborronen); las largas, con su cola
    s.buffer = B.buf[mejor[0]]; s.playbackRate.value = Math.pow(2, (midi - mejor[1]) / 12 - (mejor[2] || 0) / 1200);   // con su corrección de afinación
    const v = (GAN[tipo] || .85) * vel, fin = t + Math.min(dur, s.buffer.duration / s.playbackRate.value - e[1]);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + e[0]);
    g.gain.setValueAtTime(v, Math.max(t + e[0] + .01, fin)); g.gain.linearRampToValueAtTime(0, Math.max(t + e[0] + .01, fin) + e[1]);
    s.connect(g); g.connect(B.bus.inst); s.start(t); s.stop(Math.max(t + e[0] + .01, fin) + e[1] + .05);
    vivos.push(s); s.onended = () => { const i = vivos.indexOf(s); if (i >= 0) vivos.splice(i, 1); };
    return true;
  }
  V.nota = function (tipo, midi, t, dur, vel) {
    if (MUE[tipo] && muestra(tipo, midi, t || B.ac().currentTime, Math.max(.08, dur || .5), vel == null ? .8 : vel)) return;
    const C = B.ac(), P = PERFIL[tipo] || PERFIL.saxo, f = B.frec(midi);
    t = t || C.currentTime; dur = Math.max(.08, dur || .5); vel = vel == null ? .8 : vel;
    const sal = C.createGain(); sal.gain.value = 1; sal.connect(B.bus.inst);
    const env = C.createGain(), lp = C.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = .7;
    const o1 = C.createOscillator(), o2 = C.createOscillator(), g2 = C.createGain();
    o1.type = P.o1; o2.type = P.o2; o1.frequency.value = f; o2.frequency.value = f * P.m2; g2.gain.value = P.g2;
    /* el filtro se abre al atacar (brillo) y se cierra un poco al sostener */
    lp.frequency.setValueAtTime(f * P.corte * .5, t);
    lp.frequency.linearRampToValueAtTime(Math.min(16000, f * P.corte * P.abre), t + P.atk * 1.5);
    lp.frequency.setTargetAtTime(f * P.corte, t + P.atk * 2, .15);
    o1.connect(lp); o2.connect(g2); g2.connect(lp);
    let ult = lp;
    if (P.form) {   // formantes (cuerpo del instrumento) en paralelo
      const mez = C.createGain(); mez.gain.value = 1; lp.connect(mez);
      P.form.forEach(F => { const bp = C.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = F[0]; bp.Q.value = F[1]; const g = C.createGain(); g.gain.value = F[2]; lp.connect(bp); bp.connect(g); g.connect(mez); });
      ult = mez;
    }
    ult.connect(env); env.connect(sal);
    const g = P.gan * vel;
    env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(g, t + P.atk); env.gain.setTargetAtTime(g * .82, t + P.atk, .2);
    env.gain.setValueAtTime(g * .8, t + Math.max(P.atk, dur - .06)); env.gain.linearRampToValueAtTime(0, t + dur + .05);
    /* vibrato que entra a los 0,25 s (solo en notas largas) */
    const lfo = C.createOscillator(), lg = C.createGain(); lfo.frequency.value = 5 + Math.random() * .6;
    lg.gain.setValueAtTime(0, t); lg.gain.setValueAtTime(0, t + .25); lg.gain.linearRampToValueAtTime(f * P.vib, t + .6);
    lfo.connect(lg); lg.connect(o1.frequency); lg.connect(o2.frequency);
    /* soplo */
    const nb = B.ruido(), nf = C.createBiquadFilter(), ng = C.createGain();
    nf.type = 'bandpass'; nf.frequency.value = Math.min(9000, f * 2.5); nf.Q.value = 1.2;
    ng.gain.setValueAtTime(P.ruido * vel, t); ng.gain.exponentialRampToValueAtTime(.0008, t + .12 + (tipo === 'flauta' ? dur * .8 : 0));
    nb.connect(nf); nf.connect(ng); ng.connect(sal);
    const off = t + dur + .12;
    [o1, o2, lfo, nb].forEach(o => { o.start(t); o.stop(off); vivos.push(o); o.onended = () => { const i = vivos.indexOf(o); if (i >= 0) vivos.splice(i, 1); }; });
  };
  /* (T2) la nota aguda que se le QUIEBRA al bajón: empieza bien, se le va un «gallo» (salta casi una octava, chirría) y se ahoga */
  V.quiebra = function (tipo, midi, t, dur, vel) {
    const C = B.ac(); t = t || C.currentTime; vel = vel == null ? .8 : vel;
    V.nota(tipo, midi, t, dur * .32, vel);
    const f = B.frec(midi), o = C.createOscillator(), o2 = C.createOscillator(), g = C.createGain(), bp = C.createBiquadFilter(), sal = C.createGain();
    o.type = 'square'; o2.type = 'sawtooth'; bp.type = 'bandpass'; bp.frequency.value = f * 3; bp.Q.value = 2; sal.gain.value = 1; sal.connect(B.bus.inst);
    const t1 = t + dur * .3;
    o.frequency.setValueAtTime(f * 1.02, t1); o.frequency.linearRampToValueAtTime(f * 1.86, t1 + .07); o.frequency.setValueAtTime(f * 1.86, t1 + .12);
    o.frequency.linearRampToValueAtTime(f * .96, t1 + .3); o2.frequency.setValueAtTime(f * 1.9, t1); o2.frequency.linearRampToValueAtTime(f * 1.4, t1 + .28);
    const lfo = C.createOscillator(), lg = C.createGain(); lfo.frequency.value = 23; lg.gain.value = f * .05; lfo.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0, t1); g.gain.linearRampToValueAtTime(.16 * vel, t1 + .03); g.gain.setValueAtTime(.16 * vel, t1 + .2); g.gain.linearRampToValueAtTime(.05 * vel, t1 + .34);
    g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(bp); o2.connect(bp); bp.connect(g); g.connect(sal);
    const nb = B.ruido(), nf = C.createBiquadFilter(), ng = C.createGain(); nf.type = 'bandpass'; nf.frequency.value = 1800; nf.Q.value = .8;
    ng.gain.setValueAtTime(0, t1); ng.gain.linearRampToValueAtTime(.08 * vel, t1 + .02); ng.gain.exponentialRampToValueAtTime(.001, t + dur);
    nb.connect(nf); nf.connect(ng); ng.connect(sal);
    V.nota(tipo, midi - 1, t1 + .3, Math.max(.1, dur * .7 - .3), vel * .35);   // lo que queda: una nota ahogada y baja
    [o, o2, lfo, nb].forEach(x => { x.start(t1); x.stop(t + dur + .05); vivos.push(x); x.onended = () => { const i = vivos.indexOf(x); if (i >= 0) vivos.splice(i, 1); }; });
  };
  /* (T2) audio grabado que hace de instrumento (el himno de los ministriles, s2/mus/himno_*.mp3): se apaga con un fundido corto al saltar de plano */
  const sueltos = [];
  V.suelta = function (h) { if (h) { sueltos.push(h); if (h.fuente) h.fuente.addEventListener('ended', () => { const i = sueltos.indexOf(h); if (i >= 0) sueltos.splice(i, 1); }); } return h; };
  V.parar = function () { vivos.slice().forEach(o => { try { o.stop(); } catch (e) { } }); vivos.length = 0; sueltos.splice(0).forEach(h => { try { h.parar(.25); } catch (e) { } }); if (window.Sonido) Sonido.parar(); };
  /* piano (muestras de Modulación) */
  V.piano = function (midi, t, dur, vol) { if (window.Sonido) Sonido.nota(midi, t, dur, vol == null ? .45 : vol); };
  /* oscilador seno que suena mientras se mueve un deslizador */
  V.seno = function (frec, vol) {
    const C = B.ac(), o = C.createOscillator(), g = C.createGain();
    o.type = 'sine'; o.frequency.value = frec; g.gain.setValueAtTime(0, C.currentTime); g.gain.linearRampToValueAtTime(vol || .16, C.currentTime + .04);
    o.connect(g); g.connect(B.bus.inst); o.start();
    return {
      frec(f) { o.frequency.setTargetAtTime(f, C.currentTime, .012); },
      parar(fd) { const t = C.currentTime; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t); g.gain.linearRampToValueAtTime(0, t + (fd || .12)); o.stop(t + (fd || .12) + .02); }
    };
  };
  /* pitidos de interfaz: acierto, error, encendido */
  /* pitidos de interfaz: si están los de Splice (sfx/sfx_ui_*.mp3), suenan esos */
  const UI_SFX = { ok: '../s1/sfx/sfx_ui_ok.mp3', mal: '../s1/sfx/sfx_ui_error.mp3', clic: '../s1/sfx/sfx_ui_clic.mp3', anillo: '../s1/sfx/sfx_anillo_encaja.mp3', enciende: '../s1/sfx/sfx_destello.mp3' };
  V.UI_RUTAS = Object.keys(UI_SFX).map(k => UI_SFX[k]);
  V.ui = function (tipo) {
    if (UI_SFX[tipo] && B.buf[UI_SFX[tipo]]) { B.sfx(UI_SFX[tipo], 1); return; }
    if (tipo === 'clic') return;
    if (tipo === 'anillo') tipo = 'ok';
    try {
      const C = B.ac(), t = C.currentTime + .01;
      const ns = tipo === 'ok' ? [[1046.5, 0], [1568, .07]] : tipo === 'mal' ? [[220, 0], [196, .09]] : [[784, 0], [1175, .06], [1568, .12]];
      ns.forEach(n => { const o = C.createOscillator(), g = C.createGain(); o.type = tipo === 'mal' ? 'sawtooth' : 'square'; o.frequency.value = n[0];
        g.gain.setValueAtTime(0, t + n[1]); g.gain.linearRampToValueAtTime(.06, t + n[1] + .005); g.gain.exponentialRampToValueAtTime(.0008, t + n[1] + .12);
        o.connect(g); g.connect(B.bus.ui); o.start(t + n[1]); o.stop(t + n[1] + .15); });
    } catch (e) { }
  };
})(window.TR);
