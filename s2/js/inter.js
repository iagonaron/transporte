/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 2 · interactivos (2.ª persona del singular; cartel primero en el centro con «Entendido» y después abajo,
   junto a los botones; «Continuar» se enciende cuando ya se puede seguir).
     escrito      · transporte escrito de Teoría PRO (TR_ESC): guiado con la melodía fija del himno, o el ejercicio final
                    con el generador (3 melodías de dificultad creciente y nota)
     diferencias  · número 0–7 + dirección ↑/↓ + notas afectadas Do…Si (trCorregir de Teoría PRO), varios ítems
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  const I = B.inter, M = () => B.motor, E = () => B.escrito;
  const el = B.el;
  const btn = (txt, cls, fn, tit) => { const b = el('button', cls || '', txt); b.type = 'button'; if (tit) { b.title = tit; b.setAttribute('aria-label', tit); } if (fn) b.addEventListener('click', ev => { ev.stopPropagation(); fn(b); }); return b; };
  const panel = (cls, piel) => { const p = B.$('#inter'); p.innerHTML = ''; p.className = 'on ' + (cls || '') + (piel ? ' ' + piel : ''); return p; };   /* piel: 'epoca' (Santiago, 1730) */

  /* ════════ a · TRANSPORTE ESCRITO ════════
     cfg = { modo:'guiado', melodia:{ton, compas, compases, transp}, cartel, pistas:{ton, arm, notas}, bien }
         | { modo:'final', niveles:[1,2,3], cartel } */
  I.escrito = function (cfg, c) {
    const p = panel('i-escrito', cfg.piel);
    const final = cfg.modo === 'final', niveles = cfg.niveles || [1, 2, 3], notas = [];
    let k = 0, api = null, intentos = 0, listo = false, solVista = false;
    const bSol = btn('Ver la solución', '', () => { if (api) { solVista = true; api.solucion(); api.bloquea(); habilita(cfg.trasSolucion || 'Así queda: cada nota, una 2.ª mayor más abajo, con un bemol en la armadura.'); } });
    const bSig = btn('Siguiente melodía ▶', 'prim', () => siguiente());
    bSol.style.display = 'none'; bSig.style.display = 'none';
    /* (Iago 3-nov) ejercicio final OPCIONAL: «Practicar» o «Transportarnos al menú principal»; durante, «Terminar» siempre a mano */
    const opcional = final && cfg.opcional;
    const bFin = btn('Terminar', 'disc', () => M().alMenu(), 'Terminar y transportarnos al menú principal');
    const bMenu = btn('Transportarnos al menú principal', '', () => M().alMenu());
    const monta = () => {
      const ex = final ? E().generar(niveles[k]) : E().fijo(cfg.melodia);
      intentos = 0;
      api = E().panel(p, ex, { alterar: cfg.alterar, guiado: !final, instrumento: final ? 'piano' : 'chirimia', cabecera: final ? 'Melodía ' + (k + 1) + ' de ' + niveles.length : null,
        alCorregir: (pt, e) => final ? corrFinal(pt) : corrGuiado(pt, e) });
      B._apiEscrito = api;   // (pruebas) acceso a la API del panel
    };
    function corrGuiado(pt, ex) {
      intentos++;
      if (pt >= .999 && solVista) return;   // la solución que se ha pedido no cuenta como acierto (la gestiona bSol)
      if (pt >= .999) { api.bloquea(); habilita(cfg.bien || '¡Perfecto! Ni un borrón.');
        /* (Iago 3-nov) al acertar, sigue solo enseguida (suena Don Ramón) sin esperar a «Continuar» */
        if (cfg.sigueAlAcertar != null) B.espera(cfg.sigueAlAcertar, c).then(ok => { if (ok && sigue) sigue(true); });
        return; }
      const P = cfg.pistas || {}, l = [];
      if (!E().okTon(ex)) l.push(P.ton || 'La tónica también baja una 2.ª mayor.');
      if (!E().okArm(ex)) l.push(P.arm || 'Revisa la armadura de la tonalidad nueva.');
      if (E().notasMal(ex).some(x => x)) l.push(P.notas || 'Las notas en rojo no están una 2.ª mayor más abajo que las de arriba.');
      M().barraTexto('<b>Pista:</b> ' + l.join(' '));
      if (intentos >= 2) { bSol.style.display = ''; habilita(null); }
    }
    function corrFinal(pt) {
      notas[k] = pt; api.bloquea();
      if (k < niveles.length - 1) { bSig.style.display = ''; M().barraTexto('Melodía ' + (k + 1) + ': <b>' + Math.round(pt * 100) + ' %</b>. Pulsa <b>Siguiente melodía</b>.'); }
      else {
        const media = notas.reduce((a, b) => a + b, 0) / notas.length, nota = Math.round(media * 100) / 10;
        B.notaFinal = nota; try { B.guarda('tr_t2_nota', { nota: nota, cuando: Date.now() }); } catch (e) { }
        bFin.style.display = 'none';
        habilita('Tus tres melodías: ' + notas.map(x => Math.round(x * 100) + ' %').join(' · ') + '. <b>Nota: ' + String(nota).replace('.', ',') + '</b>');
      }
    }
    function siguiente() { bSig.style.display = 'none'; k++; monta(); M().barraTexto(cfg.cartelCorto || 'Elige la tonalidad nueva y su armadura, coloca cada nota y pulsa <b>Corregir</b>.'); }
    let sigue = null;
    function habilita(txt) { if (txt) M().barraTexto(txt); if (!listo) { listo = true; M().esperaSigue(c).then(ok => sigue && sigue(ok)); } }
    monta();
    return M().cartel(cfg.cartel, opcional ? { botones: [bSol, bSig, bFin], boton: cfg.botonPracticar || 'Practicar: 3 melodías', extra: [bMenu], aulaSolo: false }
      : { botones: [bSol, bSig], aulaSolo: false }).then(() => new Promise(res => {
      sigue = res; c.alMorir.push(() => res(false));
      if (cfg.cartelCorto) M().barraTexto(cfg.cartelCorto);
    }));
  };

  /* ════════ b · LAS DIFERENCIAS ════════
     cfg = { items:[{ de:{ton, f}, a:{ton, f}, transp:'2.ª M ↑' }], cartel } · diferencias = |fB − fA|, dirección = signo,
     notas = las que cambian de alteración (orden de ♯ al subir, de ♭ al bajar) */
  const SH = ['Fa', 'Do', 'Sol', 'Re', 'La', 'Mi', 'Si'], FLs = ['Si', 'Mi', 'La', 'Re', 'Sol', 'Do', 'Fa'], NOTAS = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'];
  function calcula(fA, fB) {
    const r = [];
    if (fB > fA) for (let f = fA; f < fB; f++) r.push(f >= 0 ? SH[f] : FLs[-f - 1]);
    else for (let f = fA; f > fB; f--) r.push(f > 0 ? SH[f - 1] : FLs[-f]);
    return { n: Math.abs(fB - fA), dir: fB > fA ? 'asc' : 'desc', notas: r };
  }
  I._dif = calcula;
  const flecha = (d, t) => '<svg viewBox="0 0 24 24" width="' + t + '" height="' + t + '" aria-hidden="true"><path d="' + (d === 'asc' ? 'M12 3 L20 13 H15 V21 H9 V13 H4 Z' : 'M12 21 L20 11 H15 V3 H9 V11 H4 Z') + '" fill="currentColor"/></svg>';
  I.diferencias = function (cfg, c) {
    const p = panel('i-dif', cfg.piel);
    let k = 0, listo = false, sigue = null;
    const bSig = btn('Siguiente ▶', 'prim', () => { bSig.style.display = 'none'; k++; monta(); M().barraTexto(cfg.cartelCorto); });
    bSig.style.display = 'none';
    function monta() {
      const it = cfg.items[k], sol = calcula(it.de.f, it.a.f);
      const sel = { n: 0, dir: null, notas: {} };
      p.innerHTML = '';
      const w = el('div', 'dif');
      const hoja = el('div', 'esc-hoja'); w.appendChild(hoja);   /* (3-nov) la «hoja»: en la piel época, el papel pautado */
      hoja.appendChild(el('div', 'esc-cab', '<span class="esc-num">' + (k + 1) + ' de ' + cfg.items.length + '</span>De <b>' + it.de.ton + '</b> una <b>' + it.transp + '</b> → <b>' + it.a.ton + '</b>'));
      const arm = el('div', 'dif-arm'); hoja.appendChild(arm);
      const hA = el('div', 'dif-pe partitura'), hB = el('div', 'dif-pe partitura'); arm.appendChild(hA); arm.appendChild(el('div', 'arm-flecha', '<span>' + it.transp + '</span><i></i>')); arm.appendChild(hB);
      const ctl = el('div', 'esc-ctl dif-ctl'); w.appendChild(ctl);
      const g1 = el('div', 'esc-g'); g1.appendChild(el('small', '', 'Diferencias')); const rN = el('div'); g1.appendChild(rN); ctl.appendChild(g1);
      const wN = Rueda.crea(rN, ['0', '1', '2', '3', '4', '5', '6', '7'], 0, ix => { sel.n = ix; });
      const g2 = el('div', 'esc-g'); g2.appendChild(el('small', '', 'Dirección')); const f2 = el('div', 'esc-f'); g2.appendChild(f2); ctl.appendChild(g2);
      /* (Iago 3-nov) botones aclarados: flecha + «Hacia abajo · más bemoles / menos sostenidos» (y al revés) */
      const largo = cfg.notas === false, dTxt = (d, t, sub) => flecha(d, 34) + (largo ? '<span class="dir-t"><b>' + t + '</b><small>' + sub + '</small></span>' : '');
      const bA = btn(dTxt('asc', 'Hacia arriba', 'más sostenidos / menos bemoles'), (largo ? 'dir largo' : 'cuad acc dir'), () => { sel.dir = sel.dir === 'asc' ? null : 'asc'; dirs(); }, 'Hacia arriba (más sostenidos / menos bemoles)');
      const bD = btn(dTxt('desc', 'Hacia abajo', 'más bemoles / menos sostenidos'), (largo ? 'dir largo' : 'cuad acc dir'), () => { sel.dir = sel.dir === 'desc' ? null : 'desc'; dirs(); }, 'Hacia abajo (más bemoles / menos sostenidos)');
      if (largo) { f2.classList.add('esc-col'); f2.appendChild(bD); f2.appendChild(bA); } else { f2.appendChild(bA); f2.appendChild(bD); }
      const dirs = () => { bA.classList.toggle('on', sel.dir === 'asc'); bD.classList.toggle('on', sel.dir === 'desc'); };
      const g3 = el('div', 'esc-g'); g3.appendChild(el('small', '', 'Notas que cambian')); const f3 = el('div', 'esc-f dif-notas'); g3.appendChild(f3);
      if (cfg.notas !== false) ctl.appendChild(g3);   /* (Iago 3-nov) notas:false → solo cuántas y hacia dónde (T2) */
      const bn = NOTAS.map(nm => { const b = btn(nm, 'acc nota', () => { sel.notas[nm] = !sel.notas[nm]; b.classList.toggle('on', !!sel.notas[nm]); }); b.dataset.n = nm; f3.appendChild(b); return b; });
      const g4 = el('div', 'esc-g esc-cor'); const bC = btn('✓ Corregir', 'prim', () => corrige()); g4.appendChild(bC); ctl.appendChild(g4);
      const res = el('div', 'dif-res'); w.appendChild(res);
      p.appendChild(w);
      armadura(hA, it.de.f, it.de.ton); armadura(hB, it.a.f, it.a.ton);
      function corrige() {
        const okN = sel.n === sol.n && (sol.n === 0 || sel.dir === sol.dir);
        const marc = NOTAS.filter(n => sel.notas[n]), okNotas = cfg.notas === false || (marc.length === sol.notas.length && sol.notas.every(n => sel.notas[n]));
        bn.forEach(b => { const n = b.dataset.n, es = sol.notas.indexOf(n) >= 0, m = !!sel.notas[n]; b.classList.remove('on'); b.classList.toggle('n-ok', es && m); b.classList.toggle('n-sol', es && !m); b.classList.toggle('n-mal', m && !es); b.disabled = true; });
        bA.disabled = bD.disabled = bC.disabled = true; rN.classList.add('quieta');
        const solTxt = sol.n + ' ' + flecha(sol.dir, 26);
        res.innerHTML = '<div class="' + (okN ? 'ok' : 'mal') + '"><small>Diferencias</small>' + (okN ? solTxt : '<s>' + sel.n + (sel.dir ? ' ' + flecha(sel.dir, 22) : '') + '</s> ' + solTxt) + '</div>' +
          (cfg.notas === false ? '' : '<div class="' + (okNotas ? 'ok' : 'mal') + '"><small>Notas</small>' + sol.notas.join(', ') + '</div>') +
          '<p>' + (okN && okNotas ? (it.bien || '¡Correcto!') : (it.explica || '')) + '</p>';
        B.viento.ui(okN && okNotas ? 'ok' : 'mal');
        if (k < cfg.items.length - 1) bSig.style.display = '';
        else if (!listo) { listo = true; M().barraTexto(cfg.fin || 'Así se cuentan las diferencias.'); M().esperaSigue(c).then(ok => sigue && sigue(ok)); }
      }
    }
    function armadura(host, f, ton) {
      const VF = Vex.Flow, w = 420, h = 130;
      const r = new VF.Renderer(host, VF.Renderer.Backends.SVG); r.resize(w, h);
      const tin = E().pal(host).tinta, ctx = r.getContext(); ctx.setFillStyle(tin); ctx.setStrokeStyle(tin);
      const st = new VF.Stave(10, 14, w - 20); st.addClef('treble'); if (f) st.addKeySignature(E().ksName(f)); st.setContext(ctx).draw();
      const svg = host.querySelector('svg'); svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); svg.style.width = '100%'; svg.style.height = 'auto'; svg.removeAttribute('width'); svg.removeAttribute('height');
      host.appendChild(el('b', 'arm-ton', ton + ' · ' + E().armTxt(f)));
    }
    monta();
    return M().cartel(cfg.cartel, { botones: [bSig], aulaSolo: false }).then(() => new Promise(res => {
      sigue = res; c.alMorir.push(() => res(false)); if (cfg.cartelCorto) M().barraTexto(cfg.cartelCorto);
    }));
  };
})(window.TR);
