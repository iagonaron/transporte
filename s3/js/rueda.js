/* Transporte 2 · copiada de Modulación (s3/js/rueda.js) · rueda deslizante (C1, 2-nov-2026) — la misma rueda de TEORÍA at home PRO (makeWheel), en ES5.
   Rueda.crea(host, items, inicio, alCambiar) → {pon(i, avisa), idx(), valor()}
   Arriba sostenidos, abajo bemoles (Rueda.ARM = [7,6,…,0,…,-7], Rueda.armTxt(f) → '3♯' · '0' · '2♭'). */
(function(){
  var H = 46, ultimo = 0;   /* (T2) escenario 1920×1080: renglones de 46 px */
  function tick(){
    var n = performance.now(); if(n - ultimo < 55) return; ultimo = n;   /* como mucho un tic cada 55 ms */
    try{ var c = window.Sonido && Sonido.ctx; if(!c || c.state !== 'running') return; var t = c.currentTime;
      var o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter(); o.type = 'sine';
      o.frequency.setValueAtTime(320, t); o.frequency.exponentialRampToValueAtTime(180, t + .05);
      lp.type = 'lowpass'; lp.frequency.value = 1200; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + .07);
      o.connect(lp); lp.connect(g); g.connect(Sonido.salida || c.destination); o.start(t); o.stop(t + .09); }catch(e){}
  }
  function crea(host, items, inicio, alCambiar){
    host.classList.add('rueda'); host.innerHTML = '<div class="rBanda"></div><div class="rLista"></div>';
    var lista = host.querySelector('.rLista'), esc = 1, idx = inicio || 0, vivo = idx, arrastra = false, y0 = 0, movido = 0, acc = 0, bloq = false, accT = null;
    lista.innerHTML = items.map(function(t, i){ return '<div class="rIt" data-i="' + i + '">' + t + '</div>'; }).join('');
    var its = [].slice.call(lista.children);
    function luce(k){ its.forEach(function(e, i){ e.classList.toggle('sel', i === k); }); }
    function situa(ix){ lista.style.transform = 'translateY(' + (H - ix*H) + 'px)'; }
    function fija(ni, avisa){
      ni = Math.max(0, Math.min(items.length - 1, ni)); var cambia = ni !== idx; idx = vivo = ni;
      lista.style.transition = 'transform .18s cubic-bezier(.22,.61,.36,1)'; situa(idx); luce(idx);
      if(avisa){ if(cambia) tick(); if(alCambiar) alCambiar(idx); }
    }
    its.forEach(function(e, i){ e.addEventListener('click', function(){ if(movido > 6 || host.classList.contains('quieta')) return; fija(i, true); }); });
    function mueve(e){
      if(!arrastra) return; var y = e.touches ? e.touches[0].clientY : e.clientY, dy = (y - y0) / esc;   /* (T2) el escenario va escalado */ movido = Math.max(movido, Math.abs(dy));
      lista.style.transition = 'none'; lista.style.transform = 'translateY(' + (H - idx*H + dy) + 'px)';
      var c = Math.max(0, Math.min(items.length - 1, Math.round(idx - dy/H))); if(c !== vivo){ vivo = c; luce(c); tick(); }
      if(e.cancelable) e.preventDefault();
    }
    function suelta(e){
      if(!arrastra) return; arrastra = false; quita();
      var y = e.changedTouches ? e.changedTouches[0].clientY : (e.clientY != null ? e.clientY : y0), dy = (y - y0) / esc;
      if(Math.abs(dy) < 6){ situa(idx); luce(idx); return; } fija(Math.round(idx - dy/H), true);
    }
    function quita(){ window.removeEventListener('pointermove', mueve); window.removeEventListener('pointerup', suelta); window.removeEventListener('pointercancel', suelta); }
    host.addEventListener('pointerdown', function(e){ if(host.classList.contains('quieta')) return; arrastra = true; movido = 0; vivo = idx; y0 = e.clientY; esc = (host.getBoundingClientRect().height / (host.offsetHeight || 1)) || 1;
      window.addEventListener('pointermove', mueve); window.addEventListener('pointerup', suelta); window.addEventListener('pointercancel', suelta); if(e.cancelable) e.preventDefault(); });
    host.addEventListener('wheel', function(e){ e.preventDefault(); if(host.classList.contains('quieta')) return;
      acc += e.deltaY; clearTimeout(accT); accT = setTimeout(function(){ acc = 0; }, 160); if(bloq) return;
      if(Math.abs(acc) >= 40){ fija(idx + (acc > 0 ? 1 : -1), true); acc = 0; bloq = true; setTimeout(function(){ bloq = false; }, 120); } }, {passive:false});
    fija(idx, false);
    return {pon:fija, idx:function(){ return idx; }, valor:function(){ return items[idx]; }};
  }
  var ARM = [7,6,5,4,3,2,1,0,-1,-2,-3,-4,-5,-6,-7];
  function armTxt(f){ return f === 0 ? '0' : Math.abs(f) + (f > 0 ? '♯' : '♭'); }
  window.Rueda = {crea:crea, ARM:ARM, armTxt:armTxt};
})();
