/* Modulación · controles comunes de las sesiones (C1, 1-nov-2026, a petición de Iago):
   ↩ volver al portal · ⏸/▶ pausa general · ⛶ pantalla completa · y que cada escena quepa en pantalla sin scroll.
   Se carga ANTES que el resto de scripts: la pausa congela el reloj de la página (performance.now, setTimeout,
   requestAnimationFrame), los audios/vídeos y el sonido Web Audio, así que se para cualquier secuencia a medias
   (texto que se escribe, acordes, juego, cinemáticas) y al reanudar sigue justo donde estaba.               */
(function(){
  'use strict';
  var P = {on:false, desde:0, perdido:0, media:[], ctxs:[], raf:[]};
  var realNow = performance.now.bind(performance);
  window.__pausa = P;

  /* ---- reloj: el tiempo en pausa no cuenta ---- */
  performance.now = function(){ return (P.on ? P.desde : realNow()) - P.perdido; };

  /* ---- requestAnimationFrame: en pausa, las vueltas esperan ---- */
  var rRaf = window.requestAnimationFrame.bind(window), rCaf = window.cancelAnimationFrame.bind(window);
  var nRaf = 0, vivosRaf = {};
  function pideRaf(id, cb){ vivosRaf[id] = rRaf(function(){ delete vivosRaf[id]; if(P.on){ P.raf.push([id, cb]); return; } cb(performance.now()); }); }
  window.requestAnimationFrame = function(cb){ var id = ++nRaf; pideRaf(id, cb); return id; };
  window.cancelAnimationFrame = function(id){ if(vivosRaf[id] != null){ rCaf(vivosRaf[id]); delete vivosRaf[id]; } P.raf = P.raf.filter(function(x){ return x[0] !== id; }); };

  /* ---- setTimeout: en pausa se guarda lo que faltaba ---- */
  var rST = window.setTimeout.bind(window), rCT = window.clearTimeout.bind(window);
  var nT = 0, T = {};
  function arma(id){ var t = T[id]; t.real = rST(function(){ delete T[id]; t.cb.apply(window, t.args); }, Math.max(0, t.fin - realNow())); }
  window.setTimeout = function(cb, ms){
    if(typeof cb !== 'function') return rST.apply(window, arguments);
    var id = 'm' + (++nT), args = [].slice.call(arguments, 2);
    T[id] = {cb:cb, args:args, fin:realNow() + (+ms || 0), falta:0};
    if(P.on) T[id].falta = +ms || 0; else arma(id);
    return id;
  };
  window.clearTimeout = function(id){ if(T[id]){ if(T[id].real != null) rCT(T[id].real); delete T[id]; } else rCT(id); };

  /* ---- setInterval: en pausa se saltan las vueltas ---- */
  var rSI = window.setInterval.bind(window);
  window.setInterval = function(cb, ms){
    if(typeof cb !== 'function') return rSI.apply(window, arguments);
    var args = [].slice.call(arguments, 2);
    return rSI(function(){ if(!P.on) cb.apply(window, args); }, ms);
  };

  /* ---- audio y vídeo: se apuntan los que suenan ---- */
  var todos = [];
  var rPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function(){
    if(todos.indexOf(this) < 0) todos.push(this);
    if(P.on){ if(P.media.indexOf(this) < 0) P.media.push(this); return Promise.resolve(); }   /* algo quiso sonar en pausa: sonará al reanudar */
    return rPlay.apply(this, arguments);
  };
  /* ---- Web Audio: se suspenden todos los contextos y no se dejan despertar en pausa ---- */
  ['AudioContext', 'webkitAudioContext'].forEach(function(n){
    var C = window[n]; if(!C) return;
    var Envuelto = function(){ var c = new (Function.prototype.bind.apply(C, [null].concat([].slice.call(arguments))))(); P.ctxs.push(c); if(P.on) try{ c.suspend(); }catch(e){} return c; };
    Envuelto.prototype = C.prototype; window[n] = Envuelto;
  });
  if(window.AudioContext || window.BaseAudioContext){
    var proto = (window.BaseAudioContext || window.AudioContext).prototype, rRes = proto.resume;
    if(rRes) proto.resume = function(){ return P.on ? Promise.resolve() : rRes.apply(this, arguments); };
  }

  function pausa(){
    if(P.on) return;
    P.on = true; P.desde = realNow();
    Object.keys(T).forEach(function(id){ var t = T[id]; if(t.real != null){ rCT(t.real); t.real = null; } t.falta = Math.max(0, t.fin - realNow()); });
    P.media = todos.filter(function(m){ return !m.paused && !m.ended; });
    P.media.forEach(function(m){ try{ m.pause(); }catch(e){} });
    P.ctxs.forEach(function(c){ try{ if(c.state === 'running') c.suspend(); }catch(e){} });
    pinta();
  }
  function sigue(){
    if(!P.on) return;
    P.perdido += realNow() - P.desde; P.on = false;
    P.ctxs.forEach(function(c){ try{ rRes ? rRes.call(c) : c.resume(); }catch(e){} });
    var m = P.media; P.media = [];
    m.forEach(function(x){ try{ var p = rPlay.call(x); if(p && p.catch) p.catch(function(){}); }catch(e){} });
    Object.keys(T).forEach(function(id){ var t = T[id]; if(t.real == null){ t.fin = realNow() + t.falta; arma(id); } });
    var r = P.raf; P.raf = []; r.forEach(function(x){ pideRaf(x[0], x[1]); });
    pinta();
  }
  window.Pausa = {pausa:pausa, sigue:sigue, get on(){ return P.on; }};

  /* ---- pantalla completa ---- */
  function enCompleta(){ return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function completa(){
    var d = document.documentElement;
    if(enCompleta()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else (d.requestFullscreen || d.webkitRequestFullscreen).call(d);
  }

  /* ---- que todo quepa sin scroll (Iago 1-nov 20:34: que no se recoloque al pasar de pestaña) ----
     1) UNA medida para todo el portal: con la pantalla actual se calcula cuánto puede medir el cuadro de vídeo/juego (16:9)
        y se aplica igual en todas las escenas (variable --marcoMax). Solo se recalcula si cambia el tamaño de la ventana.
     2) Si alguna escena aún no cabe (partitura, cuestionario), su escala se calcula una sola vez, se guarda
        y las siguientes veces se aplica al instante, antes de pintarse, sin mover nada. */
  var TAM = '', ESCALA = {};
  function medidaGlobal(){
    var t = innerWidth + 'x' + innerHeight; if(t === TAM) return; TAM = t; ESCALA = {};
    var cab = document.querySelector('.cab'), voz = document.querySelector('.voz'), nav = document.querySelector('.nav'), app = document.querySelector('.app');
    var resto = (cab ? cab.offsetHeight : 50) + (voz ? Math.max(voz.offsetHeight, 70) : 90) + (nav ? nav.offsetHeight : 44) + 34 + 4*12 + 50;   /* cabecera, recuadro de texto, botones, título y márgenes */
    var h = Math.max(220, innerHeight - resto), w = Math.min(app ? app.clientWidth : innerWidth, Math.round(h*16/9));
    document.documentElement.style.setProperty('--marcoMax', w + 'px');
  }
  function aplica(e, f){
    if(f && f < .999){ e.style.transformOrigin = '50% 0'; e.style.transform = 'scale(' + f.toFixed(3) + ')'; e.style.marginBottom = (-(e.offsetHeight*(1 - f))).toFixed(0) + 'px'; }
    else { e.style.transform = ''; e.style.transformOrigin = ''; e.style.marginBottom = ''; }
  }
  function mide(e){   /* solo la primera vez que se ve cada escena con este tamaño de pantalla */
    var k = e.dataset.e; aplica(e, 1);
    var sobra = document.documentElement.scrollHeight - innerHeight, f = 1;
    if(sobra > 2){ var H = e.getBoundingClientRect().height; f = Math.max(.45, (H - sobra - 4)/H); }
    ESCALA[k] = f; aplica(e, f);
  }
  var visto = null;
  function encaja(){
    medidaGlobal();
    var e = document.querySelector('section.escena.on'); if(!e) return;
    var k = e.dataset.e;
    if(ESCALA[k] != null){ if(visto !== e){ aplica(e, ESCALA[k]); visto = e; } return; }
    visto = e; mide(e);
    rST(function(){ if(document.querySelector('section.escena.on') === e && ESCALA[k] === 1 && document.documentElement.scrollHeight - innerHeight > 2) mide(e); }, 1200);   /* por si el contenido tardó en dibujarse */
  }
  function encajaLuego(){ encaja(); }
  window.Encaja = encaja;

  /* ---- botones en la cabecera, junto a ♪ y al modo (sin franja propia) ---- */
  var SVG = {
    volver:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6 4 12l6 6v-4h5a4 4 0 0 1 0 8h-2v2h2a6 6 0 0 0 0-12h-5V6z" transform="translate(0 -3)"/></svg>',
    pausa:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>',
    play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5v15l12.5-7.5z"/></svg>',
    full:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v2H6v4H4zm10 0h6v6h-2V6h-4zM4 14h2v4h4v2H4zm14 0h2v6h-6v-2h4z"/></svg>',
    sale:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h2v6H4V8h4zm6 0h2v4h4v2h-6zM4 14h6v6H8v-4H4zm10 0h6v2h-4v4h-2z"/></svg>'
  };
  var bP, bF;
  function pinta(){
    if(bP){ bP.innerHTML = P.on ? SVG.play : SVG.pausa; bP.title = P.on ? 'Seguir (P)' : 'Pausa (P)'; bP.setAttribute('aria-pressed', P.on); }
    if(bF){ bF.innerHTML = enCompleta() ? SVG.sale : SVG.full; bF.title = enCompleta() ? 'Salir de pantalla completa' : 'Pantalla completa'; }
    document.body && document.body.classList.toggle('enPausa', P.on);
  }
  function boton(id, titulo, svg, fn){
    var b = document.createElement('button'); b.type = 'button'; b.id = id; b.className = 'mute ctlB'; b.title = titulo; b.setAttribute('aria-label', titulo); b.innerHTML = svg;
    b.addEventListener('click', function(ev){ ev.stopPropagation(); fn(); b.blur(); }); return b;
  }
  document.addEventListener('DOMContentLoaded', function(){
    var css = document.createElement('style');
    css.textContent = '.ctlB svg{width:18px;height:18px;fill:currentColor;display:block;margin:auto}.ctlB{display:inline-flex;align-items:center;justify-content:center;width:42px}' +
      '.ctlB[aria-pressed="true"]{background-color:#c9a24a;color:#fff}' +
      'body.enPausa .app::after{content:"⏸ EN PAUSA";position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:60;padding:10px 22px;background:rgba(5,8,20,.82);border:3px double #f4d58a;color:#ffe7a3;font:400 22px/1.2 "DotGothic16",monospace;letter-spacing:.15em;pointer-events:none}' +
      'html:fullscreen,html:-webkit-full-screen{overflow:auto}' +
      '.escena .marco{max-width:var(--marcoMax,100%);margin-inline:auto}' +
      /* (Iago 2-nov) nada de parpadeos en los botones: «Continuar» oscurecido mientras escribe el texto; cuando se puede seguir, naranja + blip retro breve */
      '.nav #bCont:not(.late){filter:saturate(.15) brightness(.55);transition:filter .25s}.nav #bCont.late{filter:none;transition:filter .25s}' +
      '.nav #bCont.late,#bSig.llama,.bCorr.late,#bCorr.late{animation:none!important}';
    document.head.appendChild(css);
    var fila = document.querySelector('.cab .fila'); if(!fila) return;
    var volverA = window.MOD_VOLVER || '../prueba.html';
    var bV = boton('bVolver', 'Volver al portal', SVG.volver, function(){ location.href = volverA + location.hash; });   /* (2-nov) conserva la cuenta (#c=…) al volver al menú */
    bP = boton('bPausa', 'Pausa (P)', SVG.pausa, function(){ P.on ? sigue() : pausa(); });
    bF = boton('bFull', 'Pantalla completa', SVG.full, completa);
    if(!(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen)) bF.hidden = true;
    fila.insertBefore(bF, fila.firstChild); fila.insertBefore(bP, fila.firstChild); fila.insertBefore(bV, fila.firstChild);
    pinta();
    /* si en pausa se toca cualquier otra cosa de la página, primero se reanuda */
    document.addEventListener('pointerdown', function(ev){ if(P.on && !(ev.target.closest && ev.target.closest('#bPausa'))) sigue(); }, true);
    document.addEventListener('keydown', function(ev){
      if((ev.key === 'p' || ev.key === 'P') && !/INPUT|TEXTAREA/.test((document.activeElement || {}).tagName || '')){ ev.preventDefault(); P.on ? sigue() : pausa(); }
    }, true);
    ['fullscreenchange', 'webkitfullscreenchange'].forEach(function(n){ document.addEventListener(n, function(){ pinta(); visto = null; rST(encaja, 150); }); });
    window.addEventListener('resize', function(){ visto = null; rST(encaja, 120); });
    new MutationObserver(function(){ var e = document.querySelector('section.escena.on'); if(e !== visto) encaja(); }).observe(document.querySelector('.app') || document.body, {subtree:true, attributes:true, attributeFilter:['class']});
    encajaLuego();
    /* (Iago 2-nov) blip retro breve al activarse un botón de seguir (Continuar, Siguiente, Comprobar/Corregir) */
    function blipActiva(){
      try{ var S = window.Sonido; if(!S) return; var c = S.ctx; if(c.state !== 'running') return;
        var t = c.currentTime + .01, g0 = c.createGain(); g0.gain.value = .07; g0.connect(S.salida);
        [[1318.5, 0], [1975.5, .055]].forEach(function(n){ var o = c.createOscillator(), g = c.createGain(); o.type = 'square'; o.frequency.value = n[0];
          g.gain.setValueAtTime(0, t + n[1]); g.gain.linearRampToValueAtTime(.6, t + n[1] + .004); g.gain.exponentialRampToValueAtTime(.001, t + n[1] + .07);
          o.connect(g); g.connect(g0); o.start(t + n[1]); o.stop(t + n[1] + .1); }); }catch(e){}
    }
    var ultBlip = 0;
    new MutationObserver(function(ms){
      ms.forEach(function(m){ var el = m.target; if(!el.classList) return;
        var es = el.id === 'bCont' || el.id === 'bSig' || el.classList.contains('bCorr'); if(!es || el.hidden) return;
        var antes = ' ' + (m.oldValue || '') + ' ', ahora = el.classList.contains('late') || el.classList.contains('llama');
        if(ahora && antes.indexOf(' late ') < 0 && antes.indexOf(' llama ') < 0 && performance.now() - ultBlip > 400){ ultBlip = performance.now(); blipActiva(); }
      });
    }).observe(document.body, {subtree:true, attributes:true, attributeFilter:['class'], attributeOldValue:true});
    /* (Iago 2-nov) «Pulsa para empezar»: un blip retro con cada parpadeo. Solo suena si el navegador ya deja (has tocado algo antes en el portal); si no, suena al pulsar */
    var st = document.querySelector('#inicio .start');
    if(st){
      try{ var c0 = window.Sonido && Sonido.ctx; if(c0 && c0.state === 'suspended') c0.resume(); }catch(e){}
      var latido = function(e){ if(e.animationName !== 'parpadea') return; var ini = document.getElementById('inicio'); if(!ini || ini.classList.contains('va')) return;
        try{ var S = window.Sonido; if(!S) return; var c = S.ctx; if(c.state !== 'running') return;
          var t = c.currentTime + .01, g0 = c.createGain(); g0.gain.value = .05; g0.connect(S.salida);
          [[1567.98, 0], [2093, .07]].forEach(function(n){ var o = c.createOscillator(), g = c.createGain(); o.type = 'square'; o.frequency.value = n[0];
            g.gain.setValueAtTime(0, t + n[1]); g.gain.linearRampToValueAtTime(.6, t + n[1] + .004); g.gain.exponentialRampToValueAtTime(.001, t + n[1] + .08);
            o.connect(g); g.connect(g0); o.start(t + n[1]); o.stop(t + n[1] + .11); }); }catch(err){} };
      st.addEventListener('animationstart', latido); st.addEventListener('animationiteration', latido);
    }
  });
})();
