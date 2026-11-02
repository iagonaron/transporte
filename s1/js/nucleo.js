/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE · núcleo (espacio de nombres TR)
   Adaptado del núcleo de 4 Sabores (repo afrolatin, sabores/js/nucleo.js, namespace BLUES).
   Un solo AudioContext; todo el tiempo del portal va con su reloj. La pausa general es la de
   Modulación (js/controles.js, cargado ANTES): suspende el AudioContext y congela setTimeout,
   requestAnimationFrame y vídeos, así que voces, esperas, partículas e interactivos se paran a la vez.
   Chrome 94 (aula): sin ?. ni ?? ni .at() ni replaceAll.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
window.TR = window.TR || {};
(function (B) {
  B.VERSION = '2026-11-02';
  B.CFG = B.CFG || {};
  B.inter = B.inter || {};

  /* ── utilidades ── */
  B.$ = (s, c) => (c || document).querySelector(s);
  B.$$ = (s, c) => Array.prototype.slice.call((c || document).querySelectorAll(s));
  B.el = function (tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  B.clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
  B.arr = x => x == null ? [] : (Array.isArray(x) ? x : [x]);
  B.frec = m => 440 * Math.pow(2, (m - 69) / 12);
  B.azar = (a, b) => a + Math.random() * (b - a);
  B.esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  B.guarda = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  B.lee = function (k, def) { try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch (e) { return def; } };
  B.param = function (k) { const m = new RegExp('[?&]' + k + '=([^&#]*)').exec(location.search); return m ? decodeURIComponent(m[1]) : null; };

  /* ══════════ AUDIO ══════════ */
  let AC = null;
  B.bus = {};
  B.ac = function () {
    if (!AC) {
      AC = new (window.AudioContext || window.webkitAudioContext)();
      const master = AC.createGain(); master.gain.value = .9;
      const comp = AC.createDynamicsCompressor();
      comp.threshold.value = -12; comp.knee.value = 20; comp.ratio.value = 3.5; comp.attack.value = .005; comp.release.value = .22;
      master.connect(comp); comp.connect(AC.destination);
      B.bus.master = master;
      let revIn = null;   /* reverberación de sala (respuesta sintética) */
      try {
        const rev = AC.createConvolver(); rev.buffer = irSala(1.8, 2.6); rev.normalize = true;
        const rg = AC.createGain(); rg.gain.value = .3;
        const hp = AC.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 220;
        revIn = AC.createGain(); revIn.connect(hp); hp.connect(rev); rev.connect(rg); rg.connect(master);
      } catch (e) { revIn = null; }
      B.bus.rev = revIn;
      const mk = (vol, envio) => {
        const g = AC.createGain(); g.gain.value = vol; g.connect(master);
        if (envio && revIn) { const s = AC.createGain(); s.gain.value = envio; g.connect(s); s.connect(revIn); }
        return g;
      };
      B.bus.voz = mk(1.0, .03);
      B.bus.mus = mk(.8, 0);
      B.bus.amb = mk(.75, 0);
      B.bus.sfx = mk(.9, .06);
      B.bus.inst = mk(.95, .22);   /* piano, saxo, flautas, osciladores de los interactivos */
      B.bus.ui = mk(.8, 0);        /* pitidos del texto y del interfaz */
      /* la música y el ambiente se agachan cuando habla alguien */
      B.bus.duck = AC.createGain(); B.bus.duck.gain.value = 1;
      B.bus.mus.disconnect(); B.bus.mus.connect(B.bus.duck); B.bus.duck.connect(master);
      B.bus.ambDuck = AC.createGain(); B.bus.ambDuck.gain.value = 1;
      B.bus.amb.disconnect(); B.bus.amb.connect(B.bus.ambDuck); B.bus.ambDuck.connect(master);
      const n = 2 * AC.sampleRate; B.ruidoBuf = AC.createBuffer(1, n, AC.sampleRate);
      const d = B.ruidoBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    if (AC.state === 'suspended' && !B.pausado() && B.arrancado) { try { AC.resume(); } catch (e) { } }
    return AC;
  };
  function irSala(seg, caida) {
    const sr = AC.sampleRate, n = Math.floor(sr * seg), b = AC.createBuffer(2, n, sr);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c);
      for (let i = 0; i < n; i++) { const t = i / n; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, caida); }
    }
    return b;
  }
  B.agacha = function (on) {
    if (!AC) return;
    const t = AC.currentTime;
    B.bus.duck.gain.cancelScheduledValues(t); B.bus.duck.gain.setTargetAtTime(on ? .4 : 1, t, on ? .06 : .3);
    B.bus.ambDuck.gain.cancelScheduledValues(t); B.bus.ambDuck.gain.setTargetAtTime(on ? .7 : 1, t, on ? .08 : .3);
  };
  B.ruido = function () { const s = B.ac().createBufferSource(); s.buffer = B.ruidoBuf; s.loop = true; return s; };

  const vivos = new Set();
  B.vivo = function (n, grupo) { n._grupo = grupo || 'plano'; vivos.add(n); n.onended = () => vivos.delete(n); return n; };
  B.cortaVivos = function (grupo) { vivos.forEach(n => { if (!grupo || n._grupo === grupo) { try { n.stop(0); } catch (e) { } vivos.delete(n); } }); };

  /* reproducir un búfer ya cargado (si no existe, null: no suena y no rompe) */
  B.suena = function (ruta, o) {
    o = o || {};
    const buf = B.buf[ruta]; if (!buf) return null;
    const C = B.ac(), s = C.createBufferSource(), g = C.createGain();
    s.buffer = buf; s.loop = !!o.bucle;
    const vol = o.vol == null ? 1 : o.vol, t = o.t || C.currentTime;
    if (o.fade) { g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + o.fade); } else g.gain.value = vol;
    s.connect(g); g.connect(o.bus || B.bus.sfx);
    s.start(t, o.offset || 0);
    B.vivo(s, o.grupo);
    return {
      fuente: s, gan: g, dur: buf.duration,
      parar(f) { const tt = C.currentTime; try { g.gain.cancelScheduledValues(tt); g.gain.setValueAtTime(g.gain.value, tt); g.gain.linearRampToValueAtTime(0, tt + (f || .05)); s.stop(tt + (f || .05) + .02); } catch (e) { } }
    };
  };
  /* voz por la pulsera o por radio: banda de teléfono (300–3400 Hz), un poco de saturación; la radio, además, con cortes y soplido */
  B.filtroVoz = function (tipo, dur) {
    const C = B.ac(), t = C.currentTime;
    const hp = C.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = tipo === 'radio' ? 420 : 320; hp.Q.value = .8;
    const lp = C.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = tipo === 'radio' ? 2900 : 3400; lp.Q.value = .9;
    const pk = C.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 1600; pk.gain.value = 5; pk.Q.value = 1;
    const ws = C.createWaveShaper(), cur = new Float32Array(1024); for (let i = 0; i < 1024; i++) { const x = i / 511.5 - 1; cur[i] = Math.tanh(x * 2.2) / Math.tanh(2.2); } ws.curve = cur;
    const sal = C.createGain(); sal.gain.value = 1.25;
    hp.connect(lp); lp.connect(pk); pk.connect(ws); ws.connect(sal); sal.connect(B.bus.voz);
    if (tipo === 'radio') {
      /* cortes: huecos breves y al azar (la frase se entiende, pero «se va») */
      let k = t + .5; const fin = t + (dur || 4);
      while (k < fin - .3) { const d = .08 + Math.random() * .18; sal.gain.setValueAtTime(1.25, k); sal.gain.linearRampToValueAtTime(.05, k + .02); sal.gain.setValueAtTime(.05, k + d); sal.gain.linearRampToValueAtTime(1.25, k + d + .03); k += .45 + Math.random() * .7; }
      const r = B.ruido(), rf = C.createBiquadFilter(), rg = C.createGain(); rf.type = 'bandpass'; rf.frequency.value = 2200; rf.Q.value = .6;
      rg.gain.setValueAtTime(0, t); rg.gain.linearRampToValueAtTime(.035, t + .1); rg.gain.setValueAtTime(.035, t + (dur || 4)); rg.gain.linearRampToValueAtTime(0, t + (dur || 4) + .3);
      r.connect(rf); rf.connect(rg); rg.connect(B.bus.voz); r.start(t); r.stop(t + (dur || 4) + .4); B.vivo(r, 'voz');
    }
    return hp;
  };
  /* tabla de niveles de los efectos (data: TR.SFX_NIVEL = { nombre: [dB medidos, dB objetivo] }): iguala la sonoridad de Splice */
  B.ganSfx = function (src) { const k = String(src).replace(/^.*\//, '').replace(/\.\w+$/, ''), t = B.SFX_NIVEL && B.SFX_NIVEL[k]; return t ? B.clamp(Math.pow(10, (t[1] - t[0]) / 20), .05, 2.2) : 1; };
  B.sfx = function (src, vol) { return B.suena(src, { vol: (vol == null ? .8 : vol) * B.ganSfx(src), bus: B.bus.sfx, grupo: 'sfx' }); };

  /* ambientes en bucle y música, con fundidos entre planos */
  const ambAct = new Map(); let musAct = null;
  B.ambiente = function (lista) {
    if (!AC) return;
    const nuevos = new Map(); B.arr(lista).forEach(a => { if (typeof a === 'string') a = { src: a }; if (!a) return; const q = B.primero(a.src, 'audio'); if (q && !q.falta) nuevos.set(q.src, Object.assign({}, a, { src: q.src })); });
    ambAct.forEach((h, src) => { if (!nuevos.has(src)) { if (h) h.parar(1.4); ambAct.delete(src); } });
    nuevos.forEach((a, src) => {
      const vol = a.vol == null ? .5 : a.vol;
      if (ambAct.has(src)) { const h = ambAct.get(src); if (h) h.gan.gain.setTargetAtTime(vol, AC.currentTime, .4); return; }
      ambAct.set(src, B.suena(src, { bus: B.bus.amb, vol: vol, bucle: true, fade: 1.4, grupo: 'amb' }));
    });
  };
  B.musica = function (m) {
    if (!AC) return;
    if (m && Array.isArray(m.src)) { const q = B.primero(m.src, 'audio'); m = Object.assign({}, m, { src: q ? q.src : null }, q && q.vol != null ? { vol: q.vol } : {}, q && q.bucle != null ? { bucle: q.bucle } : {}); if (!m.src) m = null; }
    if (m && musAct && musAct.src === m.src) { if (m.vol != null && musAct.h) musAct.h.gan.gain.setTargetAtTime(m.vol, AC.currentTime, .9); return; }
    if (musAct && musAct.h) musAct.h.parar(m && m.corte ? .25 : 1.6);
    musAct = null;
    if (m && m.src && B.buf[m.src]) { const vol = m.vol == null ? .7 : m.vol; musAct = { src: m.src, h: B.suena(m.src, { bus: B.bus.mus, vol: vol, bucle: m.bucle !== false, fade: m.corte ? .03 : .9, grupo: 'mus' }) }; }
    else if (m && m.src) musAct = { src: m.src, h: null };   /* falta el fichero: se apunta para no repetir */
  };
  B.musicaCorta = function () { if (musAct && musAct.h) musAct.h.parar(.08); musAct = null; };
  B.silencioTotal = function () { B.ambiente([]); B.musica(null); };

  /* ══════════ RELOJ ══════════ (el del AudioContext: con la pausa se congela) */
  B.arrancado = false;
  B.ahora = () => AC ? AC.currentTime : performance.now() / 1000;
  const esperas = new Set();
  B.control = function () {
    const c = { muerto: false, alMorir: [], matar() { if (c.muerto) return; c.muerto = true; c.alMorir.splice(0).forEach(f => { try { f(); } catch (e) { console.warn(e); } }); } };
    return c;
  };
  B.espera = function (seg, ctl) {
    return new Promise(res => {
      if (ctl && ctl.muerto) return res(false);
      esperas.add({ fin: B.ahora() + Math.max(0, seg), res: res, ctl: ctl });
    });
  };
  function revisa() {
    const t = B.ahora();
    esperas.forEach(w => {
      if (w.ctl && w.ctl.muerto) { esperas.delete(w); w.res(false); }
      else if (t >= w.fin) { esperas.delete(w); try { w.res(true); } catch (e) { console.error(e); } }
    });
  }
  function bucle() { revisa(); requestAnimationFrame(bucle); }
  requestAnimationFrame(bucle);
  setInterval(revisa, 30);
  B.pausado = () => !!(window.Pausa && window.Pausa.on);
  B.pausa = function (on) { if (!window.Pausa) return; if (on == null) on = !window.Pausa.on; on ? window.Pausa.pausa() : window.Pausa.sigue(); };

  /* ══════════ RECURSOS ══════════
     data/recursos.js (lo genera inventario.py) dice qué ficheros existen y cuánto pesan. Lo que no está ahí
     se da por ausente y se sustituye por un MARCADOR: así no hay peticiones que fallen ni errores en la consola.
     Si data/recursos.js no existe (TR.RECURSOS null), se intenta cargar todo y lo que falle queda como marcador. */
  B.RECURSOS = B.RECURSOS || null;
  B.buf = {};      // ruta → AudioBuffer
  B.img = {};      // ruta → URL lista para <img>
  const tiene = (o, r) => !!(o && Object.prototype.hasOwnProperty.call(o, r));
  B.existe = r => !!r && (B.RECURSOS ? tiene(B.RECURSOS, r) : true);
  B.esAudio = r => /\.(mp3|ogg|opus|wav|m4a)$/i.test(r);
  B.esImagen = r => /\.(webp|jpe?g|png|avif|gif)$/i.test(r);
  B.precarga = function (rutas, alProgreso) {
    const lista = Array.from(new Set(rutas.filter(Boolean)));
    const hay = lista.filter(r => B.existe(r) && !B.buf[r] && !B.img[r] && (B.esAudio(r) || B.esImagen(r)));
    const total = hay.reduce((a, r) => a + ((B.RECURSOS && B.RECURSOS[r]) || 100000), 0);
    let hecho = 0; const enCurso = {};
    const avisa = () => { let parcial = 0; Object.keys(enCurso).forEach(k => { parcial += enCurso[k]; }); if (alProgreso) alProgreso({ bytes: hecho + parcial, total: total, ficheros: hay.length, faltan: lista.length - hay.length }); };
    avisa();
    const cola = hay.slice();
    function uno(r) {
      return fetch(r).then(resp => {
        if (!resp.ok) throw new Error('HTTP ' + resp.status);
        if (resp.body && resp.body.getReader) {
          const lec = resp.body.getReader(), trozos = []; let n = 0;
          const lee = () => lec.read().then(x => { if (x.done) return new Blob(trozos); trozos.push(x.value); n += x.value.length; enCurso[r] = n; avisa(); return lee(); });
          return lee();
        }
        return resp.blob();
      }).then(datos => {
        if (B.esAudio(r)) return datos.arrayBuffer().then(ab => new Promise((ok, mal) => B.ac().decodeAudioData(ab, ok, mal))).then(b => { B.buf[r] = b; });
        const url = URL.createObjectURL(datos); const im = new Image(); im.src = url; B.img[r] = url;
        return im.decode ? im.decode().catch(() => { }) : null;
      }).catch(e => { console.warn('No se pudo cargar', r, e && e.message); if (B.RECURSOS) delete B.RECURSOS[r]; else B.FALTA[r] = 1; })
        .then(() => { delete enCurso[r]; hecho += ((B.RECURSOS && B.RECURSOS[r]) || 100000); avisa(); });
    }
    const obreros = []; for (let k = 0; k < 4; k++) obreros.push((function sigue() { return cola.length ? uno(cola.shift()).then(sigue) : Promise.resolve(); })());
    return Promise.all(obreros).then(() => ({ total: total, ficheros: hay.length }));
  };
  B.FALTA = {};
  B.hayImg = r => !!(r && B.img[r]);
  /* recursos con sustituto: 'a.webp' | ['a.webp', 'b.webp'] | [{src:'a.webp'}, {src:'b.webp', zoom, cx, cy}] → el primero que exista
     (cuando C4 deja el fichero bueno, se usa solo; mientras, el sustituto o, si no hay ninguno, el marcador del primero) */
  B.opc = function (x) { return B.arr(x).map(o => typeof o === 'string' ? { src: o } : o).filter(o => o && o.src); };
  B.primero = function (x, tipo) {
    const l = B.opc(x);
    for (let i = 0; i < l.length; i++) { const r = l[i].src; if (tipo === 'audio' ? !!B.buf[r] : B.existe(r)) return l[i]; }
    return l.length ? Object.assign({ falta: true }, l[0]) : null;
  };
  B.todas = x => B.opc(x).map(o => o.src);

  /* vídeo entero a Blob antes de reproducirlo (patrón de Modulación). window.TROZOS = {'vid/x.mp4': 2} une x.mp4.1 + x.mp4.2 */
  const PRE = {};
  B.precargaVideo = function (src, alProgreso) {
    if (PRE[src]) return PRE[src];
    const n = (window.TROZOS || {})[src] || 0;
    function baja(url, alP) {
      return fetch(url).then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const total = +r.headers.get('content-length') || 0;
        if (!r.body || !total) return r.blob();
        const lector = r.body.getReader(), trozos = []; let recibido = 0;
        const lee = () => lector.read().then(x => { if (x.done) return new Blob(trozos, { type: 'video/mp4' }); trozos.push(x.value); recibido += x.value.length; if (alP) alP(recibido / total); return lee(); });
        return lee();
      });
    }
    let p;
    if (n) {
      const hechos = []; for (let i = 0; i < n; i++) hechos.push(0);
      const partes = []; for (let j = 0; j < n; j++) partes.push(baja(src + '.' + (j + 1), f => { hechos[j] = f; if (alProgreso) alProgreso(hechos.reduce((a, b) => a + b, 0) / n); }));
      p = Promise.all(partes).then(bs => new Blob(bs, { type: 'video/mp4' }));
    } else p = baja(src, alProgreso);
    PRE[src] = p.then(b => URL.createObjectURL(b)).catch(() => { delete PRE[src]; return null; });
    return PRE[src];
  };
  B.hayVideo = src => !!src && (B.RECURSOS ? (tiene(B.RECURSOS, src) || !!(window.TROZOS && window.TROZOS[src])) : true);

  /* ══════════ PROGRESO (localStorage, con try/catch) ══════════ */
  const KP = 'tr_t1_progreso_v1';
  B.progreso = {
    leer() { return B.lee(KP, { escenas: {}, ultima: 0 }); },
    escena(i, id) { const p = this.leer(); p.ultima = i; p.escenas[id] = 1; B.guarda(KP, p); },
    fin() { const p = this.leer(); p.terminada = 1; B.guarda(KP, p); },
    /* «Seguir donde lo dejaste»: el último plano empezado (null al terminar la sesión) */
    plano(e, k) { const p = this.leer(); p.punto = e == null ? null : { e: e, k: k }; B.guarda(KP, p); },
    donde() { const p = this.leer(); return p.punto && typeof p.punto.e === 'number' ? p.punto : null; }
  };
})(window.TR);
