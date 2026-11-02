/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE · túnel de luz propio (mientras no llegue vid/salto.mp4 de Runway, y en los tramos de la vuelta)
   TR.tunel(capa, { dur, de: 2100, a: -40000, color, parada }, control) → Promise
   Lienzo 2D a media resolución: estelas que salen del centro, anillos de luz que pasan, el contador de años que
   cae (o sube) en escala logarítmica respecto al presente y un destello al llegar. Se congela con la pausa general.
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const W = 960, H = 540, AHORA = 2150;
  const fmt = y => { const n = Math.round(y), s = Math.abs(n) < 10000 ? String(Math.abs(n)) : String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); return (n < 0 ? '−' : '') + s; };
  const u = y => Math.log(AHORA - y), deU = v => AHORA - Math.exp(v);
  B.tunel = function (capa, o, c) {
    o = o || {};
    const dur = o.dur || 5, de = o.de == null ? 2100 : o.de, a = o.a == null ? -40000 : o.a;
    const col = o.color || [88, 184, 255];
    const cv = B.el('canvas', 'tunel'); cv.width = W; cv.height = H; capa.appendChild(cv);
    /* con o.video (vid/tunel.mp4 de Runway): el vídeo de fondo en vez del dibujo, y un destello blanco suave al entrar y al salir */
    let vid = null, fl = null;
    if (o.video) {
      cv.style.display = 'none';
      vid = B.el('video', 'tunel-vid'); vid.muted = true; vid.loop = true; vid.playsInline = true; vid.src = o.video; capa.appendChild(vid);   // el vídeo es un bucle perfecto (vid/tunel_bucle.mp4, fundido cruzado interno)
      const pp = vid.play(); if (pp && pp.catch) pp.catch(() => { });
      fl = B.el('i', 'tunel-flash'); capa.appendChild(fl);
    }
    const cont = B.el('div', 'tunel-anio'); cont.innerHTML = '<small>año</small><b></b>'; capa.appendChild(cont);
    const bAnio = B.$('b', cont);
    if (o.contador === false) cont.style.display = 'none';
    const cx = cv.getContext('2d');
    const est = []; for (let i = 0; i < 140; i++) est.push({ an: Math.random() * 6.283, z: Math.random(), v: .4 + Math.random() * .8, h: Math.random() });
    const t0 = B.ahora();
    return new Promise(res => {
      let vivo = true;
      if (c) c.alMorir.push(() => { vivo = false; res(false); });
      (function dibuja() {
        if (!vivo) return;
        const t = B.ahora() - t0, k = Math.min(1, t / dur);
        if (vid) {
          const e = k < .12 ? 0 : k > .86 ? 1 : (1 - Math.cos(Math.PI * (k - .12) / .74)) / 2;
          bAnio.textContent = fmt(deU(u(de) + (u(a) - u(de)) * e));
          const ent = Math.min(1, t / .6), sal = (k > .88 && !o.sigue) ? (k - .88) / .12 : 0;   // o.sigue: el túnel continúa en el plano siguiente (sin flash blanco al salir)
          fl.style.opacity = Math.max(.75 * (1 - ent), .85 * sal).toFixed(3);
          if (k >= 1) {
            vivo = false;
            if (o.sigue) B.tunelFase = { v: vid, t: vid.currentTime, ts: performance.now(), dur: vid.duration || 0 };   // el vídeo SIGUE sonando/rodando: el plano siguiente lo recoge en la misma fase
            else try { vid.pause(); } catch (x) { }
            B.espera(o.sigue ? 0 : .15, c).then(ok => res(ok)); return;
          }
          return requestAnimationFrame(dibuja);
        }
        const vel = Math.sin(Math.PI * Math.min(1, k * 1.08)) * .9 + .25;   // acelera y frena
        cx.fillStyle = 'rgba(2,4,12,.35)'; cx.fillRect(0, 0, W, H);
        const mx = W / 2 + Math.sin(t * 1.3) * 18, my = H / 2 + Math.cos(t * 1.1) * 10;
        /* anillos que pasan */
        for (let r = 0; r < 7; r++) {
          const f = ((t * .7 * (1 + vel) + r / 7) % 1), R = Math.pow(f, 2.2) * W * .9;
          cx.strokeStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (.5 * f * (1 - f) * 4 * .5).toFixed(3) + ')';
          cx.lineWidth = 1 + f * 10; cx.beginPath(); cx.ellipse(mx, my, R, R * .62, 0, 0, 6.283); cx.stroke();
        }
        /* estelas */
        est.forEach(s => {
          s.z += .012 * s.v * (1 + vel * 3); if (s.z > 1) { s.z = 0; s.an = Math.random() * 6.283; }
          const r1 = Math.pow(s.z, 2) * W * .75, r2 = Math.pow(Math.min(1, s.z + .03 + vel * .05), 2) * W * .75;
          const hue = s.h < .7 ? col : [255, 220, 170];
          cx.strokeStyle = 'rgba(' + hue[0] + ',' + hue[1] + ',' + hue[2] + ',' + (.25 + .7 * s.z).toFixed(3) + ')';
          cx.lineWidth = .6 + s.z * 2.4; cx.beginPath();
          cx.moveTo(mx + Math.cos(s.an) * r1, my + Math.sin(s.an) * r1 * .62); cx.lineTo(mx + Math.cos(s.an) * r2, my + Math.sin(s.an) * r2 * .62); cx.stroke();
        });
        /* núcleo */
        const g = cx.createRadialGradient(mx, my, 0, mx, my, 140 + vel * 60);
        g.addColorStop(0, 'rgba(235,248,255,' + (.55 + .3 * vel).toFixed(3) + ')'); g.addColorStop(.35, 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        cx.fillStyle = g; cx.fillRect(0, 0, W, H);
        /* contador de años: logarítmico respecto al presente, con un poco de inercia al final */
        const e = k < .12 ? 0 : k > .86 ? 1 : (1 - Math.cos(Math.PI * (k - .12) / .74)) / 2;
        bAnio.textContent = fmt(deU(u(de) + (u(a) - u(de)) * e));
        /* destello de llegada */
        if (k > .9) { cx.fillStyle = 'rgba(255,255,255,' + ((k - .9) / .1 * .9).toFixed(3) + ')'; cx.fillRect(0, 0, W, H); }
        if (k >= 1) { vivo = false; B.espera(.15, c).then(ok => res(ok)); return; }
        requestAnimationFrame(dibuja);
      })();
    });
  };
})(window.TR);
