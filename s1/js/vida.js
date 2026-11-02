/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE · «VIDA» en los fondos (Iago 2-nov 15:18: partículas, destellos, lamparitas que titilan)
   Un lienzo 2D a media resolución sobre la lámina; pocas partículas y 30 fps como mucho (aula lenta).
   Se para con la pausa general (controles.js congela requestAnimationFrame).
   Por plano: vida: [{ tipo, zona:[x, y, ancho, alto] (fracciones de la lámina), n, color, tam, vel }]
     'polvo'   motas que flotan despacio y brillan un poco (luz de sala, laboratorio)
     'chispas' chispas que suben y se apagan (hoguera, máquina)
     'luces'   puntos fijos que titilan (ciudad, consolas, lamparitas)
     'haz'     un haz de luz suave que respira (ventana, faro, Transportador)
     'pulso'   un anillo de luz que late desde el centro de la zona (arranque, máquina)
     'parpadeo' un brillo que titila como una pantalla holográfica (atril del aula)
     'drones'  lucecitas que cruzan el cielo despacio, con su destello (ciudad)
     'faro'    el haz de la Torre girando (zona: x, y = la linterna; ancho = largo del haz)
     'onda'    una onda que corre por una pantalla (consolas del laboratorio)
     'reflejos' destellos horizontales que rielan sobre el agua (río, mar)
     'respira' una luz cálida que respira (orquesta, foto)
     'anillos' anillos elípticos que laten con un pulso que los recorre (el Transportador)
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const V = B.vida = {};
  let cv = null, cx = null, W = 960, H = 540, capas = [], raf = null, ult = 0, t0 = 0;
  const DEF = {
    polvo: { n: 26, color: '#ffe8c0', tam: 1.6, vel: .25 },
    chispas: { n: 18, color: '#ffb35a', tam: 1.5, vel: 1 },
    luces: { n: 22, color: '#bfe6ff', tam: 1.7, vel: 1 },
    haz: { n: 1, color: '#bfe6ff', tam: 1, vel: 1 },
    pulso: { n: 1, color: '#58b8ff', tam: 1, vel: 1 },
    parpadeo: { n: 1, color: '#9fe4ff', tam: 1, vel: 1 },
    drones: { n: 6, color: '#ffffff', tam: 1.6, vel: 1 },
    faro: { n: 1, color: '#fff2c8', tam: 1, vel: 1 },
    onda: { n: 1, color: '#58e0ff', tam: 2, vel: 1 },
    reflejos: { n: 22, color: '#ffe0b0', tam: 1, vel: 1 },
    respira: { n: 1, color: '#ffcf8a', tam: 1, vel: 1 },
    anillos: { n: 3, color: '#58c8ff', tam: 1, vel: 1 }
  };
  function asegura() {
    if (cv && cv.isConnected) return;
    cv = B.$('#vida'); if (!cv) return;
    cv.width = W; cv.height = H; cx = cv.getContext('2d');
  }
  function zona(z) { z = z || [0, 0, 1, 1]; return { x: z[0] * W, y: z[1] * H, w: z[2] * W, h: z[3] * H }; }
  function nueva(c, z, inicio) {
    const p = { x: z.x + Math.random() * z.w, y: z.y + Math.random() * z.h, f: Math.random() * 6.28, r: c.tam * (.6 + Math.random() * .9) };
    if (c.tipo === 'polvo') { p.vx = (Math.random() - .5) * .25 * c.vel; p.vy = (-.05 - Math.random() * .2) * c.vel; }
    if (c.tipo === 'chispas') { p.vx = (Math.random() - .5) * .5; p.vy = -(.4 + Math.random() * 1.1) * c.vel; p.vida = 0; p.max = 40 + Math.random() * 60; if (!inicio) p.y = z.y + z.h * (.7 + Math.random() * .3); }
    if (c.tipo === 'luces') { p.v = .02 + Math.random() * .08; }
    if (c.tipo === 'drones') { p.vx = (Math.random() < .5 ? -1 : 1) * (.25 + Math.random() * .45) * c.vel; p.bob = Math.random() * 6.28; p.rojo = Math.random() < .35; }
    if (c.tipo === 'reflejos') { p.l = 6 + Math.random() * 22; p.v = .04 + Math.random() * .09; }
    return p;
  }
  V.pon = function (lista) {
    asegura(); if (!cv) return;
    capas = B.arr(lista).map(o => {
      const c = Object.assign({}, DEF[o.tipo] || DEF.polvo, o);
      c.z = zona(o.zona);
      c.ps = []; for (let i = 0; i < c.n; i++) c.ps.push(nueva(c, c.z, true));
      return c;
    });
    cx.clearRect(0, 0, W, H);
    cv.style.display = capas.length ? '' : 'none';
    if (capas.length && !raf) { t0 = performance.now(); raf = requestAnimationFrame(tic); }
  };
  V.quita = function () { V.pon([]); };
  function tic(ms) {
    raf = null;
    if (!capas.length) return;
    raf = requestAnimationFrame(tic);
    if (ms - ult < 33) return;
    ult = ms;
    const t = (ms - t0) / 1000;
    cx.clearRect(0, 0, W, H);
    capas.forEach(c => {
      const z = c.z;
      if (c.tipo === 'haz') {
        const a = .10 + .07 * Math.sin(t * .9 * c.vel);
        const g = cx.createLinearGradient(z.x, z.y, z.x + z.w * .3, z.y + z.h);
        g.addColorStop(0, hex(c.color, a * 1.6)); g.addColorStop(1, hex(c.color, 0));
        cx.fillStyle = g; cx.beginPath();
        cx.moveTo(z.x + z.w * .35, z.y); cx.lineTo(z.x + z.w * .65, z.y); cx.lineTo(z.x + z.w, z.y + z.h); cx.lineTo(z.x, z.y + z.h); cx.closePath(); cx.fill();
        return;
      }
      if (c.tipo === 'pulso') {
        const k = (t * .55 * c.vel) % 1, R = Math.max(z.w, z.h) * .5;
        cx.strokeStyle = hex(c.color, .55 * (1 - k)); cx.lineWidth = 3 + 5 * (1 - k);
        cx.beginPath(); cx.arc(z.x + z.w / 2, z.y + z.h / 2, R * (.1 + k), 0, 6.283); cx.stroke();
        const g = cx.createRadialGradient(z.x + z.w / 2, z.y + z.h / 2, 0, z.x + z.w / 2, z.y + z.h / 2, R * .5);
        g.addColorStop(0, hex(c.color, .22 + .12 * Math.sin(t * 3))); g.addColorStop(1, hex(c.color, 0));
        cx.fillStyle = g; cx.fillRect(z.x, z.y, z.w, z.h);
        return;
      }
      if (c.tipo === 'parpadeo') {
        const fl = .55 + .25 * Math.sin(t * 7.3) + .2 * Math.sin(t * 17.1) - (Math.sin(t * 1.3) > .96 ? .5 : 0);
        const g = cx.createRadialGradient(z.x + z.w / 2, z.y + z.h / 2, 0, z.x + z.w / 2, z.y + z.h / 2, Math.max(z.w, z.h) * .62);
        g.addColorStop(0, hex(c.color, .2 * fl)); g.addColorStop(1, hex(c.color, 0));
        cx.fillStyle = g; cx.fillRect(z.x - z.w * .2, z.y - z.h * .2, z.w * 1.4, z.h * 1.4);
        cx.globalAlpha = .25 * fl; cx.fillStyle = c.color; const yl = z.y + ((t * 40) % z.h); cx.fillRect(z.x, yl, z.w, 1.2); cx.globalAlpha = 1;   // línea de barrido
        return;
      }
      if (c.tipo === 'faro') {
        const ang = t * .9 * c.vel, L = z.w, ox = z.x, oy = z.y, co = Math.cos(ang), an = .07 + .05 * Math.abs(Math.sin(ang));
        const inten = .1 + .28 * Math.max(0, co) + .06;   // más fuerte cuando apunta hacia ti
        [1, -1].forEach(lado => {
          const dir = lado > 0 ? 0 : Math.PI, k = Math.abs(Math.sin(ang)) * .9 + .1;   // el haz se acorta al girar hacia/desde la cámara
          const g = cx.createRadialGradient(ox, oy, 0, ox, oy, L * k);
          g.addColorStop(0, hex(c.color, inten * (lado > 0 ? 1 : .6))); g.addColorStop(1, hex(c.color, 0));
          cx.fillStyle = g; cx.beginPath(); cx.moveTo(ox, oy);
          cx.arc(ox, oy, L * k, dir - an + (lado > 0 ? .06 : -.06), dir + an + (lado > 0 ? .06 : -.06)); cx.closePath(); cx.fill();
        });
        const g2 = cx.createRadialGradient(ox, oy, 0, ox, oy, 14); g2.addColorStop(0, hex(c.color, .55 + .3 * Math.max(0, co))); g2.addColorStop(1, hex(c.color, 0));
        cx.fillStyle = g2; cx.fillRect(ox - 14, oy - 14, 28, 28);
        return;
      }
      if (c.tipo === 'onda') {
        cx.strokeStyle = hex(c.color, .7); cx.lineWidth = c.tam; cx.beginPath();
        for (let k = 0; k <= 40; k++) { const u = k / 40, x = z.x + u * z.w; const y = z.y + z.h / 2 + Math.sin(u * 14 - t * 5 * c.vel) * z.h * .32 * (.6 + .4 * Math.sin(u * 3 + t)); k ? cx.lineTo(x, y) : cx.moveTo(x, y); }
        cx.stroke();
        return;
      }
      if (c.tipo === 'respira') {
        const a = .08 + .07 * Math.sin(t * .8 * c.vel);
        const g = cx.createRadialGradient(z.x + z.w / 2, z.y + z.h / 2, 0, z.x + z.w / 2, z.y + z.h / 2, Math.max(z.w, z.h) * .6);
        g.addColorStop(0, hex(c.color, a)); g.addColorStop(1, hex(c.color, 0));
        cx.fillStyle = g; cx.fillRect(z.x - z.w * .1, z.y - z.h * .1, z.w * 1.2, z.h * 1.2);
        return;
      }
      if (c.tipo === 'anillos') {
        const mx = z.x + z.w / 2, my = z.y + z.h / 2;
        for (let k = 0; k < c.n; k++) {
          const f = 1 - k * .16, lat = .25 + .2 * Math.sin(t * 2.4 * c.vel - k * .9);
          cx.strokeStyle = hex(c.color, lat); cx.lineWidth = 2.2;
          cx.beginPath(); cx.ellipse(mx, my, z.w / 2 * f, z.h / 2 * f, 0, 0, 6.283); cx.stroke();
          const ap = t * (1.1 + k * .35) * c.vel * (k % 2 ? -1 : 1);   // pulso que recorre el anillo
          cx.strokeStyle = hex('#ffffff', .55); cx.lineWidth = 3.2;
          cx.beginPath(); cx.ellipse(mx, my, z.w / 2 * f, z.h / 2 * f, 0, ap, ap + .5); cx.stroke();
        }
        return;
      }
      c.ps.forEach((p, i) => {
        let a;
        if (c.tipo === 'polvo') {
          p.x += p.vx; p.y += p.vy; p.f += .03;
          if (p.y < z.y || p.x < z.x || p.x > z.x + z.w) { c.ps[i] = nueva(c, z, true); c.ps[i].y = z.y + z.h; }
          a = .18 + .32 * Math.abs(Math.sin(p.f));
        } else if (c.tipo === 'chispas') {
          p.x += p.vx + Math.sin(p.f) * .3; p.y += p.vy; p.f += .2; p.vida++;
          if (p.vida > p.max || p.y < z.y) { c.ps[i] = nueva(c, z, false); return; }
          a = (1 - p.vida / p.max) * (.55 + .45 * Math.abs(Math.sin(p.f * 2)));
        } else if (c.tipo === 'drones') {
          p.x += p.vx; p.bob += .05; if (p.x < z.x - 10) p.x = z.x + z.w + 8; if (p.x > z.x + z.w + 10) p.x = z.x - 8;
          const y = p.y + Math.sin(p.bob) * 1.5;
          cx.globalAlpha = .75; cx.fillStyle = '#dfefff'; cx.beginPath(); cx.arc(p.x, y, p.r * .8, 0, 6.283); cx.fill();
          if (Math.sin(t * 5 + p.f) > .6) { cx.globalAlpha = .9; cx.fillStyle = p.rojo ? '#ff5a5a' : '#9fe0ff'; cx.beginPath(); cx.arc(p.x + 3, y, p.r * 1.1, 0, 6.283); cx.fill(); cx.globalAlpha = .25; cx.beginPath(); cx.arc(p.x + 3, y, p.r * 4, 0, 6.283); cx.fill(); }
          return;
        } else if (c.tipo === 'reflejos') {
          p.f += p.v; a = .5 * Math.pow(Math.max(0, Math.sin(p.f)), 4); p.x += Math.sin(p.f * .3) * .15;
          cx.globalAlpha = a; cx.fillStyle = c.color; cx.fillRect(p.x - p.l / 2, p.y, p.l, 1.4);
          return;
        } else {
          p.f += p.v; a = .15 + .75 * Math.pow(Math.abs(Math.sin(p.f)), 3);
        }
        cx.globalAlpha = a; cx.fillStyle = c.color;
        cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.283); cx.fill();
        if (p.r > 1.2) { cx.globalAlpha = a * .22; cx.beginPath(); cx.arc(p.x, p.y, p.r * 3.2, 0, 6.283); cx.fill(); }
      });
      cx.globalAlpha = 1;
    });
  }
  function hex(h, a) {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h);
    if (!m) return 'rgba(255,255,255,' + a + ')';
    return 'rgba(' + parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) + ',' + Math.max(0, a).toFixed(3) + ')';
  }
})(window.TR);
