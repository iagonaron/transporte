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
   PANTALLAS Y LUCES DE CADA LÁMINA (Iago, 2-nov: «anímalo por encima, alineado al píxel»; en esas láminas, sin zoom ni movimiento):
     'aguja'   aguja de un afinador: oscila y se estabiliza en verde en el centro (zona: x, y = eje; alto = largo de la aguja;
               tapa la aguja pintada con el color «fondo»)
     'barrido' filas de una pantalla que se encienden de arriba abajo (zona = la tabla; n = filas)
     'notas'   notas de luz que se recolocan sobre un pentagrama holográfico (zona = el pentagrama; n = notas)
     'vibra'   ondas que salen de un punto a los dos lados (pulsera que vibra)
     'atril'   cursor que avanza por las líneas de un atril holográfico (q: [x1,y1, x2,y2, x3,y3, x4,y4] = esquinas
               sup-izq, sup-der, inf-der, inf-izq; n = sistemas)
     'leds'    lucecitas fijas que parpadean (p: [[x,y], …]); sec: true → se encienden una tras otra y se quedan
     'humo'    bocanadas de humo que suben y se abren · 'arco' chispazo eléctrico · 'lluvia' lluvia en diagonal
     'apaga'   una luz que se va apagando (dur s) · 'globo' meridianos girando · 'traza' destello que recorre una onda pintada
     'brillos' (T3, Iago 4-nov: «que toda lucecita tintinee, cada una con su ritmo») halos sobre las luces REALES de la lámina:
               p: [[x, y, r, color], …] (fracciones; r = radio del halo en px del lienzo de 960, opcional; color opcional).
               Cada luz respira y titila con su propio ritmo aleatorio, a veces baja un instante (bombilla) y, de vez en cuando,
               suelta un destello en cruz (chispa = destellos por luz y segundo; 0 = ninguno). a = intensidad (.34), tint = cuánto titila (1)
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const V = B.vida = {};
  /* (T3, aula lenta) se dibuja en coordenadas de 960×540 pero el lienzo real es de 640×360 (RES): 2,25 veces menos píxeles que rasterizar y subir */
  const RES = 2 / 3;
  let cv = null, cx = null, cv2 = null, cx2 = null, W = 960, H = 540, capas = [], raf = null, ult = 0, t0 = 0;
  /* las pantallas se pintan en un segundo lienzo SIN fusión «screen» (si no, no se ven sobre un holograma claro ni pueden tapar la aguja pintada) */
  const NORMAL = { aguja: 1, atril: 1, notas: 1, barrido: 1 };
  const DEF = {
    aguja: { n: 1, color: '#ffb547', tam: 2, vel: 1, fondo: '#0b1a3c' }, barrido: { n: 5, color: '#63e6ff', tam: 1, vel: 1 },
    notas: { n: 7, color: '#9ff0ff', tam: 1, vel: 1 }, vibra: { n: 3, color: '#63e6ff', tam: 1, vel: 1 },
    atril: { n: 4, color: '#bff6ff', tam: 1, vel: 1 }, leds: { n: 0, color: '#63e6ff', tam: 1.6, vel: 1 },
    humo: { n: 14, color: '#c8ccd4', tam: 1, vel: 1 }, arco: { n: 1, color: '#bfe6ff', tam: 1, vel: 1 },
    lluvia: { n: 140, color: '#cfe0ff', tam: 1, vel: 1 }, globo: { n: 1, color: '#9fe4ff', tam: 1, vel: 1 }, traza: { n: 1, color: '#bff6ff', tam: 1, vel: 1 }, apaga: { n: 1, color: '#58c8ff', tam: 1, vel: 1, dur: 8 },
    brillos: { n: 0, color: '#ffd9a0', tam: 14, vel: 1, a: .42, tint: 1, chispa: .07, esc: 1.5 },
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
    cv.width = W * RES; cv.height = H * RES; cx = cv.getContext('2d'); cx.setTransform(RES, 0, 0, RES, 0, 0);
    cv2 = B.$('#vidaN'); if (!cv2) { cv2 = document.createElement('canvas'); cv2.id = 'vidaN'; cv2.setAttribute('aria-hidden', 'true'); cv.parentNode.insertBefore(cv2, cv.nextSibling); }
    cv2.width = W * RES; cv2.height = H * RES; cx2 = cv2.getContext('2d'); cx2.setTransform(RES, 0, 0, RES, 0, 0);
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
      c.t0 = performance.now();
      if (c.tipo === 'notas') c.ps.forEach((p, i) => { p.x = c.z.x + c.z.w * (i + .5) / c.n; p.l = Math.floor(Math.random() * 9); p.tx = p.x; p.tl = p.l; p.prox = 1 + Math.random() * 3; });
      if (c.tipo === 'humo') c.ps.forEach(p => { p.vida = Math.random() * 120; p.max = 120 + Math.random() * 80; });
      if (c.tipo === 'lluvia') c.ps.forEach(p => { p.l = 8 + Math.random() * 14; p.v = 9 + Math.random() * 6; });
      if (c.tipo === 'brillos') c.ls = B.arr(c.p).map(q => ({ x: q[0] * W, y: q[1] * H, r: (q[2] || c.tam) * c.esc, col: q[3] || c.color,
        fa: .25 + Math.random() * .8, fb: 2 + Math.random() * 5, f1: Math.random() * 6.28, f2: Math.random() * 6.28, baja: 2 + Math.random() * 10, g: -1 }));
      if (c.tipo === 'leds') c.fr = B.arr(c.p).map(() => .7 + Math.random() * .6);   // (T3) cada led con su ritmo
      return c;
    });
    cx.clearRect(0, 0, W, H); cx2.clearRect(0, 0, W, H);
    cv.style.display = capas.length ? '' : 'none'; cv2.style.display = capas.some(c => NORMAL[c.tipo]) ? '' : 'none';
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
    cx.clearRect(0, 0, W, H); cx2.clearRect(0, 0, W, H);
    capas.forEach(c => {
      const z = c.z;
      if (NORMAL[c.tipo]) { const k = cx; cx = cx2; try { pantalla(c, z, t, (ms - c.t0) / 1000); } finally { cx = k; } return; }
      if (pantalla(c, z, t, (ms - c.t0) / 1000)) return;
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
        brillo(z.x + z.w / 2, z.y + z.h / 2, R * .5, c.color, .22 + .12 * Math.sin(t * 3));
        return;
      }
      if (c.tipo === 'parpadeo') {
        const fl = .55 + .25 * Math.sin(t * 7.3) + .2 * Math.sin(t * 17.1) - (Math.sin(t * 1.3) > .96 ? .5 : 0);
        const Rr = Math.max(z.w, z.h) * .62;   // (T3) el resplandor, del sprite cacheado (antes, un degradado nuevo en cada fotograma)
        cx.globalAlpha = Math.max(0, Math.min(1, .2 * fl)); cx.drawImage(halo(c.color, 1), z.x + z.w / 2 - Rr, z.y + z.h / 2 - Rr, Rr * 2, Rr * 2); cx.globalAlpha = 1;
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
        brillo(z.x + z.w / 2, z.y + z.h / 2, Math.max(z.w, z.h) * .6, c.color, .08 + .07 * Math.sin(t * .8 * c.vel));
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
  /* ── pantallas y luces de las láminas ── */
  const P = (q, u, v) => {   // punto dentro del cuadrilátero q (fracciones) → píxeles del lienzo
    const x = (1 - v) * ((1 - u) * q[0] + u * q[2]) + v * ((1 - u) * q[6] + u * q[4]), y = (1 - v) * ((1 - u) * q[1] + u * q[3]) + v * ((1 - u) * q[7] + u * q[5]);
    return [x * W, y * H];
  };
  function brillo(x, y, r, col, a) { const k = cx.globalAlpha; cx.globalAlpha = Math.max(0, Math.min(1, a)) * k; cx.drawImage(halo(col, 1), x - r, y - r, r * 2, r * 2); cx.globalAlpha = k; }   // (T3) sprite cacheado
  function pantalla(c, z, t, tl) {
    if (c.tipo === 'aguja') {
      const A = .9 * Math.exp(-tl * .45 * c.vel), ang = A * Math.sin(tl * 5.2 * c.vel) + .25 * A * Math.sin(tl * 13), L = z.h, ok = A < .06;
      const col = ok ? '#5dff8a' : c.color;
      cx.strokeStyle = hex(c.fondo, .92); cx.lineWidth = 6; cx.lineCap = 'round';   // tapa la aguja pintada
      cx.beginPath(); cx.moveTo(z.x, z.y - 4); cx.lineTo(z.x + (c.dx || 0) * W, z.y - L * .98); cx.stroke();
      const xt = z.x + Math.sin(ang) * L, yt = z.y - Math.cos(ang) * L;
      cx.strokeStyle = hex(col, .35); cx.lineWidth = 7; cx.beginPath(); cx.moveTo(z.x, z.y); cx.lineTo(xt, yt); cx.stroke();
      cx.strokeStyle = hex(col, 1); cx.lineWidth = c.tam; cx.beginPath(); cx.moveTo(z.x, z.y); cx.lineTo(xt, yt); cx.stroke();
      brillo(z.x, z.y, 9, col, .9);
      if (ok) brillo(xt, yt, 14 + 3 * Math.sin(t * 4), '#5dff8a', .5);
      cx.lineCap = 'butt'; return true;
    }
    if (c.tipo === 'barrido') {
      const n = c.n, hF = z.h / n, k = (t * .5 * c.vel) % 1.4;
      for (let i = 0; i < n; i++) {
        const d = k * n - i, a = d >= 0 && d < 2.2 ? .32 * (1 - d / 2.2) : 0;
        if (a > 0) { const g = cx.createLinearGradient(z.x, 0, z.x + z.w, 0); g.addColorStop(0, hex(c.color, 0)); g.addColorStop(.15, hex(c.color, a)); g.addColorStop(.85, hex(c.color, a)); g.addColorStop(1, hex(c.color, 0)); cx.fillStyle = g; cx.fillRect(z.x, z.y + i * hF + hF * .12, z.w, hF * .76); }
      }
      const yb = z.y + (k / 1.4) * z.h * 1.2; if (yb < z.y + z.h) { cx.globalAlpha = .45; cx.fillStyle = c.color; cx.fillRect(z.x, yb, z.w, 1.2); cx.globalAlpha = 1; }
      return true;
    }
    if (c.tipo === 'notas') {
      const lin = z.h / 8;
      c.ps.forEach((p, i) => {
        p.prox -= 1 / 30;
        if (p.prox <= 0) { p.tl = Math.floor(Math.random() * 9); p.tx = B.clamp(p.tx + (Math.random() - .5) * z.w * .18, z.x + 6, z.x + z.w - 6); p.prox = 1.6 + Math.random() * 2.6; }
        p.x += (p.tx - p.x) * .08; p.l += (p.tl - p.l) * .1;
        const x = p.x, y = z.y + z.h - p.l * lin + (c.sesgo || 0) * (x - z.x), a = .55 + .3 * Math.sin(t * 3 + i);
        brillo(x, y, 9, c.color, .35 * a);
        cx.globalAlpha = a; cx.fillStyle = c.color; cx.beginPath(); cx.ellipse(x, y, lin * .62, lin * .45, -.35, 0, 6.283); cx.fill();
        cx.fillRect(x + lin * .5, y - lin * 3.2, 1.2, lin * 3.2); cx.globalAlpha = 1;
      });
      return true;
    }
    if (c.tipo === 'vibra') {
      const mx = z.x + z.w / 2, my = z.y + z.h / 2, R = Math.max(z.w, z.h) / 2;
      for (let k = 0; k < c.n; k++) {
        const f = ((t * 1.6 * c.vel + k / c.n) % 1), r = R * (.35 + .65 * f), a = .7 * (1 - f) * (.6 + .4 * Math.abs(Math.sin(t * 9)));
        cx.strokeStyle = hex(c.color, a); cx.lineWidth = 2.4;
        [0, Math.PI].forEach(o => { cx.beginPath(); cx.ellipse(mx, my, r, r * (z.h / z.w), c.giro || 0, o - .75, o + .75); cx.stroke(); });
      }
      brillo(mx, my, R * .5, c.color, .18 + .12 * Math.sin(t * 9));
      return true;
    }
    if (c.tipo === 'atril') {
      const q = c.q, n = c.n, per = 3.2 / c.vel, k = (t / per) % n, fila = Math.floor(k), u = .08 + .86 * (k - fila);
      const v0 = (fila + .2) / n, v1 = (fila + .8) / n, a = P(q, u, v0), b = P(q, u, v1);
      cx.strokeStyle = hex(c.color, .9); cx.lineWidth = 2; cx.beginPath(); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke();
      brillo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.abs(b[1] - a[1]) * .9 + 6, c.color, .35);
      const fl = .1 + .05 * Math.sin(t * 7) + (Math.sin(t * 1.1) > .97 ? -.08 : 0), m = P(q, .5, .5);   // el panel titila un poco
      brillo(m[0], m[1], Math.abs(P(q, 1, .5)[0] - P(q, 0, .5)[0]) * .7, c.color, Math.max(0, fl));
      return true;
    }
    if (c.tipo === 'leds') {
      B.arr(c.p).forEach((pt, i) => {
        const x = pt[0] * W, y = pt[1] * H, col = pt[2] || c.color;
        let a;
        if (c.sec) { const ti = tl - (c.tes ? c.tes[i] : (c.ini || .5) + i * (c.paso || 1.2)); a = ti < 0 ? .05 : Math.min(1, ti * 3) * (.8 + .2 * Math.sin(t * 3 + i)); }
        else a = .25 + .75 * Math.pow(Math.max(0, Math.sin(t * (c.f || 2.2) * c.vel * (c.fr ? c.fr[i] : 1) + i * 2.1 + (pt[3] || 0))), 2);
        brillo(x, y, c.tam * 6, col, .45 * a); cx.globalAlpha = a; cx.fillStyle = col; cx.beginPath(); cx.arc(x, y, c.tam, 0, 6.283); cx.fill(); cx.globalAlpha = 1;
      });
      return true;
    }
    if (c.tipo === 'brillos') {
      const dt = 1 / 30;
      c.ls.forEach(l => {
        let k = .72 + c.tint * (.2 * Math.sin(6.283 * l.fa * t * c.vel + l.f1) + .08 * Math.sin(6.283 * l.fb * t + l.f2));
        if (tl > l.baja) { if (tl < l.baja + .09) k *= .55; else l.baja = tl + 3 + Math.random() * 11; }   // un parpadeo breve, a su aire
        const R = l.r * 2.6; cx.globalAlpha = Math.max(0, Math.min(1, c.a * .55 * k)); cx.drawImage(halo(l.col), l.x - R, l.y - R, R * 2, R * 2);   // la luz que se derrama alrededor
        cx.globalAlpha = Math.max(0, Math.min(1, c.a * k)); cx.drawImage(halo(l.col), l.x - l.r, l.y - l.r, l.r * 2, l.r * 2);
        if (l.g < 0 && c.chispa && Math.random() < c.chispa * dt) l.g = 0;
        if (l.g >= 0) {
          l.g += dt / .75; if (l.g >= 1) l.g = -1;
          else { const e = Math.sin(Math.PI * l.g), L = l.r * (1.6 + 1.6 * e); cx.globalAlpha = .7 * e; cx.drawImage(estrella(l.col), l.x - L, l.y - L, L * 2, L * 2); }
        }
      });
      cx.globalAlpha = 1; return true;
    }
    if (c.tipo === 'humo') {
      c.ps.forEach((p, i) => {
        p.vida += c.vel; if (p.vida > p.max) { p.vida = 0; p.max = 120 + Math.random() * 80; p.x0 = z.x + z.w * (.1 + Math.random() * .25); }
        const f = p.vida / p.max, x = (p.x0 || z.x + z.w * .2) + f * z.w * .55 + Math.sin(f * 6 + i) * 12, y = z.y + z.h * (1 - f), r = 8 + f * 46;
        brillo(x, y, r, c.color, .16 * Math.sin(Math.PI * f));
      });
      return true;
    }
    if (c.tipo === 'arco') {
      if (Math.random() < .45) {
        const mx = z.x + z.w / 2, my = z.y + z.h / 2;
        for (let k = 0; k < 2; k++) {
          cx.strokeStyle = hex(c.color, .5 + Math.random() * .5); cx.lineWidth = 1.2; cx.beginPath(); cx.moveTo(mx, my);
          let x = mx, y = my; const an = Math.random() * 6.283;
          for (let s = 0; s < 5; s++) { x += Math.cos(an) * z.w * .12 + (Math.random() - .5) * z.w * .15; y += Math.sin(an) * z.h * .12 + (Math.random() - .5) * z.h * .15; cx.lineTo(x, y); }
          cx.stroke();
        }
        brillo(mx, my, Math.max(z.w, z.h) * .6, c.color, .35 + Math.random() * .3);
      }
      return true;
    }
    if (c.tipo === 'lluvia') {
      cx.strokeStyle = hex(c.color, .32); cx.lineWidth = 1; cx.beginPath();
      c.ps.forEach(p => { p.y += p.v * c.vel; p.x -= p.v * .18; if (p.y > z.y + z.h) { p.y = z.y - p.l; p.x = z.x + Math.random() * z.w * 1.1; } cx.moveTo(p.x, p.y); cx.lineTo(p.x + p.l * .18, p.y - p.l); });
      cx.stroke(); return true;
    }
    if (c.tipo === 'globo') {   // meridianos que giran sobre un globo holográfico
      const mx = z.x + z.w / 2, my = z.y + z.h / 2, rx = z.w / 2, ry = z.h / 2;
      for (let k = 0; k < 4; k++) {
        const f = Math.sin(t * .5 * c.vel + k * Math.PI / 4), a = .12 + .14 * Math.abs(Math.cos(t * .5 * c.vel + k * Math.PI / 4));
        cx.strokeStyle = hex(c.color, a); cx.lineWidth = 1.2; cx.beginPath(); cx.ellipse(mx, my, Math.abs(f) * rx + .5, ry, 0, 0, 6.283); cx.stroke();
      }
      const yb = my + Math.sin(t * .7) * ry * .9; cx.strokeStyle = hex(c.color, .18); cx.beginPath(); cx.ellipse(mx, yb, rx * Math.sqrt(Math.max(0, 1 - Math.pow((yb - my) / ry, 2))), ry * .08, 0, 0, 6.283); cx.stroke();
      return true;
    }
    if (c.tipo === 'traza') {   // un destello que recorre la onda pintada en la pantalla (zona: x0, y centro, ancho, amplitud)
      const P2 = (c.periodo || .16) * W, A = z.h, u = (t * .35 * c.vel) % 1;
      for (let k = 0; k < 14; k++) {
        const uu = u - k * .012; if (uu < 0) continue;
        const x = z.x + uu * z.w, y = z.y - A * Math.sin(2 * Math.PI * (x - z.x) / P2 + (c.fase || 0));
        brillo(x, y, 10 - k * .5, c.color, .55 * (1 - k / 14));
      }
      return true;
    }
    if (c.tipo === 'apaga') {
      const f = Math.max(0, 1 - tl / c.dur), fl = f * (.85 + .15 * Math.sin(t * 6));
      const g = cx.createRadialGradient(z.x + z.w / 2, z.y + z.h / 2, 0, z.x + z.w / 2, z.y + z.h / 2, Math.max(z.w, z.h) * .6);
      g.addColorStop(0, hex(c.color, .3 * fl)); g.addColorStop(1, hex(c.color, 0)); cx.fillStyle = g; cx.fillRect(z.x - z.w * .1, z.y - z.h * .1, z.w * 1.2, z.h * 1.2);
      return true;
    }
    return false;
  }
  /* sprites cacheados por color (más barato que crear degradados en cada fotograma: el aula es lenta) */
  const SPR = {};
  function halo(col, lineal) {
    const k = (lineal ? 'l' : 'h') + col; if (SPR[k]) return SPR[k];
    const s = document.createElement('canvas'); s.width = s.height = 64; const g2 = s.getContext('2d'), g = g2.createRadialGradient(32, 32, 0, 32, 32, 32);
    if (lineal) { g.addColorStop(0, hex(col, 1)); g.addColorStop(1, hex(col, 0)); }
    else { g.addColorStop(0, hex(col, 1)); g.addColorStop(.12, hex(col, .85)); g.addColorStop(.25, hex(col, .5)); g.addColorStop(.55, hex(col, .14)); g.addColorStop(1, hex(col, 0)); }
    g2.fillStyle = g; g2.fillRect(0, 0, 64, 64); return (SPR[k] = s);
  }
  function estrella(col) {
    const k = 'e' + col; if (SPR[k]) return SPR[k];
    const s = document.createElement('canvas'); s.width = s.height = 128; const g2 = s.getContext('2d');
    [0, 1].forEach(v => { const g = v ? g2.createLinearGradient(0, 0, 0, 128) : g2.createLinearGradient(0, 0, 128, 0);
      g.addColorStop(0, hex('#ffffff', 0)); g.addColorStop(.5, hex('#ffffff', .95)); g.addColorStop(1, hex('#ffffff', 0)); g2.fillStyle = g;
      if (v) g2.fillRect(63, 0, 2, 128); else g2.fillRect(0, 63, 128, 2); });
    const h = g2.createRadialGradient(64, 64, 0, 64, 64, 18); h.addColorStop(0, hex('#ffffff', .9)); h.addColorStop(.4, hex(col, .5)); h.addColorStop(1, hex(col, 0));
    g2.fillStyle = h; g2.fillRect(46, 46, 36, 36); return (SPR[k] = s);
  }
  function hex(h, a) {
    const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(h);
    if (!m) return 'rgba(255,255,255,' + a + ')';
    return 'rgba(' + parseInt(m[1], 16) + ',' + parseInt(m[2], 16) + ',' + parseInt(m[3], 16) + ',' + Math.max(0, a).toFixed(3) + ')';
  }
})(window.TR);
