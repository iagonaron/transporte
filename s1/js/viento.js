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
    oboe: { o1: 'sawtooth', o2: 'square', m2: 3, g2: .08, corte: 6, abre: 1.3, form: [[1150, 6, 1.6], [2900, 5, .7]], gan: .26, atk: .035, vib: .006, ruido: .05 }
  };
  /* saxo alto con muestras reales (mus/saxo/, cada 3 semitonos; tonejs-instruments, MIT); si no están, el sintetizado */
  const SAX = { D3: 50, F3: 53, Gs3: 56, B3: 59, D4: 62, F4: 65, Gs4: 68, B4: 71, D5: 74, F5: 77, Gs5: 80 };
  V.SAX_RUTAS = Object.keys(SAX).map(k => 'mus/saxo/' + k + '.mp3');
  function saxoMuestra(midi, t, dur, vel) {
    let mejor = null, d = 99;
    Object.keys(SAX).forEach(k => { const r = 'mus/saxo/' + k + '.mp3', dd = Math.abs(SAX[k] - midi); if (B.buf[r] && dd < d) { d = dd; mejor = [r, SAX[k]]; } });
    if (!mejor) return false;
    const C = B.ac(), s = C.createBufferSource(), g = C.createGain();
    s.buffer = B.buf[mejor[0]]; s.playbackRate.value = Math.pow(2, (midi - mejor[1]) / 12);
    const v = .9 * vel;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .015);
    g.gain.setValueAtTime(v, t + Math.max(.03, dur)); g.gain.linearRampToValueAtTime(0, t + dur + .12);
    s.connect(g); g.connect(B.bus.inst); s.start(t); s.stop(t + dur + .15);
    vivos.push(s); s.onended = () => { const i = vivos.indexOf(s); if (i >= 0) vivos.splice(i, 1); };
    return true;
  }
  /* MUESTRAS REALES (Iago, 2-nov: Splice) para trompa, clarinete, oboe y flauta: mus/<instr>/<instr>_<nota>.mp3 (nota: C4, Cs4, C#4, Db4…).
     Se descubren solas en el inventario (data/recursos.js); sampler por playbackRate desde la muestra más cercana, envolvente suave.
     Mientras no estén, el sintetizado de siempre. */
  const PC = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  const MUE = {};
  /* afinación medida de cada muestra (C4, 2-nov) y muestras staccato (solo notas cortas) */
  const CENTS = { flauta_A5: 19, flauta_E5: 8, flauta_G4: 4, flauta_E6: 3, clarinete_F3: 15, clarinete_As3: 10 };
  const CORTA = { clarinete_A4: 1, clarinete_Fs4: 1, clarinete_C5: 1 };
  Object.keys(B.RECURSOS || {}).forEach(r => {
    const m = /^mus\/(trompa|clarinete|oboe|flauta)\/[a-z]+_([a-g])(s|#|b)?(-?\d)\.(mp3|wav|ogg)$/i.exec(r);
    if (!m) return;
    const midi = 12 * (+m[4] + 1) + PC[m[2].toLowerCase()] + (m[3] === 's' || m[3] === '#' ? 1 : m[3] === 'b' ? -1 : 0);
    const base = r.replace(/^.*\//, '').replace(/\.\w+$/, '');
    (MUE[m[1].toLowerCase()] = MUE[m[1].toLowerCase()] || []).push([r, midi, CENTS[base] || 0, CORTA[base] ? 1 : 0]);
  });
  V.MUESTRAS_RUTAS = [].concat.apply([], Object.keys(MUE).map(k => MUE[k].map(x => x[0])));
  const ENV = { trompa: [.06, .25], clarinete: [.03, .18], oboe: [.03, .16], flauta: [.05, .22] };
  function muestra(tipo, midi, t, dur, vel) {
    const l = MUE[tipo]; if (!l) return false;
    const cerca = cand => { let m = null, dd = 99; cand.forEach(x => { const d = Math.abs(x[1] - midi); if (B.buf[x[0]] && d < dd) { dd = d; m = x; } }); return [m, dd]; };
    let [mejor, d] = cerca(l.filter(x => !x[3]));   // primero las sostenidas
    if (!mejor || dur <= .45) { const o = cerca(l); if (o[0] && (!mejor || o[1] < d)) mejor = o[0]; }   // (Iago 22:55) las staccato solo para notas cortas: las largas, siempre con una sostenida
    if (!mejor) return false;
    const C = B.ac(), s = C.createBufferSource(), g = C.createGain(), e = ENV[tipo] || [.03, .2];
    s.buffer = B.buf[mejor[0]]; s.playbackRate.value = Math.pow(2, (midi - mejor[1]) / 12 - (mejor[2] || 0) / 1200);   // con su corrección de afinación
    const v = .85 * vel, fin = t + Math.min(dur, s.buffer.duration / s.playbackRate.value - e[1]);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + e[0]);
    g.gain.setValueAtTime(v, Math.max(t + e[0] + .01, fin)); g.gain.linearRampToValueAtTime(0, Math.max(t + e[0] + .01, fin) + e[1]);
    s.connect(g); g.connect(B.bus.inst); s.start(t); s.stop(Math.max(t + e[0] + .01, fin) + e[1] + .05);
    vivos.push(s); s.onended = () => { const i = vivos.indexOf(s); if (i >= 0) vivos.splice(i, 1); };
    return true;
  }
  V.nota = function (tipo, midi, t, dur, vel) {
    if (tipo === 'saxo' && saxoMuestra(midi, t || B.ac().currentTime, Math.max(.08, dur || .5), vel == null ? .8 : vel)) return;
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
  V.parar = function () { vivos.slice().forEach(o => { try { o.stop(); } catch (e) { } }); vivos.length = 0; if (window.Sonido) Sonido.parar(); };
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
  const UI_SFX = { ok: 'sfx/sfx_ui_ok.mp3', mal: 'sfx/sfx_ui_error.mp3', clic: 'sfx/sfx_ui_clic.mp3', anillo: 'sfx/sfx_anillo_encaja.mp3', enciende: 'sfx/sfx_destello.mp3' };
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
