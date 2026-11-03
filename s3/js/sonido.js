/* Modulación · sonido común (C1) · copiado a Transporte (usa el AudioContext de TR si existe). Piano por muestras (las del portal antiguo: La, Do, Mi♭, Sol♭ de cada octava)
   API: Sonido.listo() → Promise · Sonido.acorde(['c/4','e/4','g/4'], t, dur, vol) · Sonido.nota('f#/4', t, dur, vol)
        Sonido.ahora() · Sonido.parar() · Sonido.ctx                                     */
(function(){
  var BASE = (window.MOD_BASE || '') + 'mus/piano/';
  var MUESTRAS = ['A1','C2','Eb2','Gb2','A2','C3','Eb3','Gb3','A3','C4','Eb4','Gb4','A4','C5','Eb5','Gb5','A5','C6'];
  var PC = {c:0,d:2,e:4,f:5,g:7,a:9,b:11};
  var ctx = null, master = null, buf = {}, vivas = [], cargando = null;
  function midiDe(nombre){            /* 'f#/4', 'bb/3', 'Eb4', 'cn/5' */
    var m = /^([a-gA-G])(bb|##|#|b|n)?\/?(-?\d)$/.exec(String(nombre).trim());
    if(!m) return null;
    var alt = {'#':1,'##':2,'b':-1,'bb':-2,'n':0}[m[2]||'n'] || 0;
    return 12*(+m[3]+1) + PC[m[1].toLowerCase()] + alt;
  }
  function ctxOk(){
    /* (Transporte) un solo AudioContext para todo el portal: el del núcleo TR, por el bus de instrumentos */
    if(!ctx && window.TR && TR.ac){ ctx = TR.ac(); master = TR.bus.inst; }
    if(!ctx){
      var C = window.AudioContext || window.webkitAudioContext; ctx = new C();
      master = ctx.createGain(); master.gain.value = .9;
      var comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 3;
      master.connect(comp); comp.connect(ctx.destination);
    }
    if(ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function cargar(){
    if(cargando) return cargando;
    ctxOk();
    cargando = Promise.all(MUESTRAS.map(function(k){
      return fetch(BASE + k + '.mp3').then(function(r){ return r.arrayBuffer(); })
        .then(function(ab){ return new Promise(function(ok, ko){ ctx.decodeAudioData(ab, ok, ko); }); })
        .then(function(b){ buf[k] = {b:b, midi:midiDe(k)}; }).catch(function(){});
    }));
    return cargando;
  }
  function cercana(midi){
    var mejor = null, d = 99;
    for(var k in buf){ var dd = Math.abs(buf[k].midi - midi); if(dd < d){ d = dd; mejor = buf[k]; } }
    return mejor;
  }
  function nota(n, t, dur, vol, destino){
    var midi = typeof n === 'number' ? n : midiDe(n); if(midi == null) return;
    var s = cercana(midi); if(!s) return;
    t = t == null ? ctx.currentTime : t; dur = dur || 1; vol = vol == null ? .5 : vol;
    var src = ctx.createBufferSource(); src.buffer = s.b;
    src.playbackRate.value = Math.pow(2, (midi - s.midi)/12);
    var g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.setValueAtTime(vol, t + dur);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur + .45);
    src.connect(g); g.connect(destino || master);
    src.start(t); src.stop(t + dur + .5);
    vivas.push(src); src.onended = function(){ var i = vivas.indexOf(src); if(i >= 0) vivas.splice(i,1); };
  }
  function acorde(notas, t, dur, vol, destino){
    vol = vol == null ? .42 : vol;
    var v = vol / Math.sqrt(Math.max(1, notas.length) * .7);
    notas.forEach(function(n, i){ nota(n, (t == null ? ctx.currentTime : t) + i*.005, dur, v, destino);   /* arpegiado mínimo: el acorde suena junto */ });
  }
  window.Sonido = {
    listo: function(){ return cargar(); },
    nota: nota, acorde: acorde, midiDe: midiDe,
    ahora: function(){ return ctxOk().currentTime; },
    parar: function(){ vivas.slice().forEach(function(s){ try{ s.stop(); }catch(e){} }); vivas = []; },
    get ctx(){ return ctxOk(); }, get salida(){ ctxOk(); return master; }
  };
})();

/* cifrado: los acordes menores se escriben con guion (Dm → D-, B♭m7 → B♭-7, Dm/A → D-/A) */
window.menor = function(s){ return String(s).replace(/(^|\/)?([A-G][♭♯b#]?)m(?!aj)/g, function(t, a, r){ return (a || '') + r + '-'; }); };
