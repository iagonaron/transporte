/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 2 · «La misma canción, más grave» — datos de la sesión (GUION-S2 v2 · PLANOS-T2.md)
   Mismo formato que data/t1.js (ver su cabecera). Novedades de T2:
     · lo común de T1 se usa por ruta relativa '../s1/…' (poses de Noa/Amaro/madre, túnel, vuelta, efectos, músicas, muestras)
     · lamina / laminas: [{en | t, lamina}] → TR.lamina (láminas dibujadas en código: armaduras, melodías, registro, rótulos)
     · si una imagen de T2 aún no está, sale su MARCADOR (nombre + descripción); en el laboratorio, la de T1 que sirve de reserva
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  B.CFG = { blipConVoz: false, marcaFalta: true };
  const V = () => B.viento;
  const PJ1 = '../s1/img/t1/pj/';
  B.PJ = {
    NOA: { nombre: 'Noa', color: '#7fd4ff', lado: 'izq', alto: .86, dir: PJ1, _: 'neutra', poses: ['neutra', 'aburrida', 'traviesa', 'sorpresa', 'pensativa', 'emocion'],
      mira: { neutra: 'izq', aburrida: 'izq', traviesa: 'izq', sorpresa: 'izq', pensativa: 'izq', emocion: 'izq' } },
    AMARO: { nombre: 'Dra. Amaro', color: '#c9b6ff', lado: 'der', alto: .84, dir: PJ1, _: 'explica', poses: ['explica', 'tableta', 'alarma', 'helada'],
      mira: { explica: 'izq', tableta: 'der', alarma: 'der', helada: 'der' } },
    MADRE: { nombre: 'Mamá', color: '#ffc48a', lado: 'der', alto: .8, dir: PJ1, _: 'decepcion', poses: ['decepcion'], mira: { decepcion: 'der' } },   // (Iago 3-nov) caras hacia el centro: se voltea
    COPISTA: { nombre: 'Don Ramón', color: '#e9c48a', lado: 'der', poses: [] },
    MAESTRO: { nombre: 'Maestro de capilla', color: '#ffd9a0', lado: 'der', poses: [] }
  };

  /* niveles de los efectos de Splice (los de T1, medidos 2-nov) → objetivo; los de T2 se miden cuando lleguen */
  B.SFX_NIVEL = {
    sfx_alarma: [-16.6, -17], sfx_anillo_encaja: [-26.4, -22], sfx_anillos_giran: [-16.3, -19], sfx_destello: [-17.4, -20], sfx_estuche_cierra: [-19.7, -18],
    sfx_llegada: [-13, -18], sfx_maquina_arranca: [-10.2, -18], sfx_notificacion: [-16.7, -21], sfx_pasos_rapidos: [-23.8, -19],
    sfx_puerta_scifi: [-9.9, -19], sfx_pulsera_vibra: [-4.3, -20], sfx_radio_interferencia: [-12.7, -22], sfx_salto_tiempo: [-15.3, -17],
    sfx_ui_clic: [-17.9, -28], sfx_ui_error: [-16.3, -24], sfx_ui_ok: [-22.1, -24]
  };
  /* rutas: T2 propias (s2/sfx, s2/mus) con su marcador sintetizado (*_sint, mus/render_t2.py) · comunes de T1 (../s1/…) */
  const S1 = '../s1/', SF1 = n => S1 + 'sfx/' + n + '.mp3', SF1o = n => B.existe(SF1(n)) ? SF1(n) : SF1(n + '_sint');
  const SF = n => 'sfx/' + n + '.mp3', SFo = n => B.existe(SF(n)) ? SF(n) : SF(n + '_sint'), SFl = n => [SF(n), SF(n + '_sint')];
  const AMB = {
    casa: { src: SFl('amb_casa_lluvia'), vol: .26 }, casaBaja: { src: SFl('amb_casa_lluvia'), vol: .15 },
    ciudad: { src: SF1('amb_ciudad2100'), vol: .3 }, mar: { src: SF1('amb_mar_noche'), vol: .22 },
    lab: { src: SF1('amb_laboratorio'), vol: .34 }, labBajo: { src: SF1('amb_laboratorio'), vol: .16 },
    lluvia: { src: SFl('amb_lluvia_piedra'), vol: .27 }, lluviaBaja: { src: SFl('amb_lluvia_piedra'), vol: .11 },
    archivo: { src: SFl('amb_archivo'), vol: .36 }, organo: { src: SFl('amb_organo_lejos'), vol: .2 }, organoBajo: { src: SFl('amb_organo_lejos'), vol: .1 }
  };
  const MUS = {
    entrada: { src: [{ src: S1 + 'mus/mus_coruna2100.mp3', vol: .32 }] },
    casa: { src: [{ src: 'mus/mus_casa.mp3', vol: .42 }, { src: 'mus/t2_casa_sint.mp3', vol: .36 }] },
    casaBaja: { src: [{ src: 'mus/mus_casa.mp3', vol: .2 }, { src: 'mus/t2_casa_sint.mp3', vol: .18 }] },
    lab: { src: [{ src: S1 + 'mus/mus_tension.mp3', vol: .2 }] }, tension: { src: [{ src: S1 + 'mus/mus_tension.mp3', vol: .4 }] },
    santiago: { src: [{ src: 'mus/mus_santiago.mp3', vol: .4 }, { src: 'mus/t2_santiago_sint.mp3', vol: .34 }] },
    santiagoBajo: { src: [{ src: 'mus/mus_santiago.mp3', vol: .14 }, { src: 'mus/t2_santiago_sint.mp3', vol: .12 }] },
    viaje: { src: [{ src: S1 + 'mus/mus_viaje.mp3', vol: .55, bucle: false }] },
    resumen: { src: [{ src: S1 + 'mus/mus_coruna2100.mp3', vol: .16 }] },
    cierre: { src: [{ src: S1 + 'mus/mus_cierre.mp3', vol: .55 }] }
  };

  /* ── láminas (PLANOS-T2.md). desc = lo que dice el marcador mientras falta. ocultaPj: quien ya sale en la lámina ── */
  const N = k => 'img/t2/' + k + '.webp', T1 = k => S1 + 'img/t1/' + k + '.webp';
  const O = function () { return [].concat.apply([], arguments); };
  const POLVO = c => [{ tipo: 'polvo', zona: [0, 0, 1, 1], n: 14, color: c || '#ffe2b8' }];
  const LLUVIA = (z, n) => [{ tipo: 'lluvia', zona: z || [0, 0, 1, 1], n: n || 120 }];
  const VELA = (x, y) => [{ tipo: 'respira', zona: [x - .04, y - .05, .08, .1], color: '#ffcf8a', vel: 1.3 }, { tipo: 'chispas', zona: [x - .01, y - .03, .02, .05], n: 4, color: '#ffd28a' }];
  const I2 = (k, desc, o) => Object.assign({ src: N(k), desc: desc }, o || {});
  const IMG = {
    edificio: I2('casa_edificio', 'Edificio de la madre junto al Orzán, anochecer, lluvia fina', { vida: LLUVIA(null, 90).concat([{ tipo: 'luces', zona: [.2, .2, .6, .5], n: 18, color: '#ffe2b0' }, { tipo: 'drones', zona: [.1, .02, .8, .2], n: 2 }]) }),
    puertaAbre: I2('casa_puerta_abre', 'La puerta del piso se abre: Noa mojada con el estuche; Lumi le da la bienvenida', { ocultaPj: ['NOA'], vida: [{ tipo: 'respira', zona: [.6, .3, .2, .3], color: '#ffcf8a', vel: 1.6 }].concat(POLVO()) }),
    casa: I2('casa_general', 'Salón-comedor de la madre (2100): mesa para dos, ventanal con lluvia y luces del Orzán; Lumi sirve', { ocultaPj: ['NOA', 'MADRE'], vida: [].concat([{ tipo: 'luces', zona: [0, .2, .33, .4], n: 14, color: '#bfe0ff' }, { tipo: 'respira', zona: [.55, .25, .1, .15], color: '#ffcf8a', vel: 1.5 }]) }),
    lumiSirve: I2('casa_lumi_sirve', 'DETALLE: Lumi sirve verdura en el plato de la madre', { ocultaPj: ['MADRE'], vida: [{ tipo: 'respira', zona: [.4, .1, .25, .25], color: '#ffcf8a', vel: 1.4 }].concat(POLVO()) }),
    madre: I2('casa_madre', 'La madre, plano medio, mirando a Noa: cariño y reproche cansado', { ocultaPj: ['MADRE'], vida: [].concat(POLVO()) }),
    noaPlato: I2('casa_noa_plato', 'Noa, plano medio, sin levantar la vista del plato, pasota', { ocultaPj: ['NOA'], vida: POLVO() }),
    madreFoto: I2('casa_madre_foto', 'La madre mira de reojo la foto del aparador (el padre con su clarinete)', { ocultaPj: ['MADRE'], vida: [{ tipo: 'respira', zona: [.05, .3, .3, .4], color: '#ffcf8a', vel: 1 }].concat(POLVO()) }),
    noaCrispada: I2('casa_noa_crispada', 'Noa, primer plano, levanta la vista, crispada', { ocultaPj: ['NOA'], vida: POLVO() }),
    dos: I2('casa_dos', 'Sobre el hombro de Noa: la madre, más suave; la lluvia en el ventanal entre las dos', { ocultaPj: ['NOA', 'MADRE'], vida: [].concat(POLVO()) }),
    noaLevanta: I2('casa_noa_levanta', 'Noa de pie coge el estuche y se gira hacia la puerta; la madre, mano a medio camino', { ocultaPj: ['NOA', 'MADRE'], vida: [] }),
    puertaCierra: I2('casa_puerta_cierra', 'La puerta se cierra tras Noa; Lumi junto a la puerta, luz baja', { vida: [{ tipo: 'apaga', zona: [.55, .3, .25, .3], dur: 2.5, color: '#ffcf8a' }] }),
    madreSola: I2('casa_madre_sola', 'La madre sola a la mesa, mirando la lluvia; el plato de Noa intacto', { vida: [].concat(POLVO()) }),
    plato: I2('casa_plato', 'DETALLE: el brazo de Lumi recoge el plato de Noa sin tocar', { vida: [{ tipo: 'apaga', zona: [.3, .1, .4, .4], dur: 4, color: '#ffcf8a' }].concat(POLVO()) }),
    /* laboratorio: con reserva de T1 (y la pose encima) mientras no lleguen las nuevas */
    torre: O(I2('torre_amanecer', 'La Torre de Hércules esa misma noche, con lluvia; Noa sube deprisa hacia la entrada', { vida: [{ tipo: 'faro', zona: [.5, .2, .4, 0] }].concat(POLVO('#cfe8ff')) }),
      { src: T1('dron_torre'), vida: [{ tipo: 'faro', zona: [.36, .114, .42, 0] }, { tipo: 'drones', zona: [.45, .0, .55, .25], n: 3 }] }),
    labEspera: O(I2('lab_amaro_espera', 'Laboratorio de noche: Amaro sigue allí, a la derecha, junto a la consola', { ocultaPj: ['AMARO'], vida: [{ tipo: 'anillos', zona: [.3, .05, .35, .6], n: 2 }].concat(POLVO('#cfe8ff')) }),
      { src: T1('laboratorio'), ocultaPj: ['NOA', 'AMARO'], vida: [{ tipo: 'anillos', zona: [.38, .05, .35, .62], n: 3 }].concat(POLVO('#cfe8ff')) }),
    labModulo: O(I2('lab_amaro_modulo', 'Amaro enseña el viejo módulo de Noa, mirando hacia ella', { ocultaPj: ['AMARO'], vida: [{ tipo: 'chispas', zona: [.4, .4, .2, .2], n: 8, color: '#7fd4ff' }].concat(POLVO('#cfe8ff')) }),
      { src: T1('lab_modulo'), vida: [{ tipo: 'respira', zona: [.12, .25, .35, .5], color: '#58c8ff', vel: 2 }].concat(POLVO()) }),
    labRegMod: O(I2('lab_registro_modulo', 'DETALLE: pantalla del registro con un bloque en ámbar (el módulo que no está en los planos)', { vida: [{ tipo: 'parpadeo', zona: [.2, .15, .6, .6], color: '#ffcf8a' }] }),
      { src: T1('lab_registro'), vida: [{ tipo: 'parpadeo', zona: [.36, .14, .6, .52], color: '#9fe4ff' }, { tipo: 'traza', zona: [.40, .62, .52, .025], periodo: .17 }] }),
    labNoa: O(I2('lab_noa_brazos', 'Noa a la izquierda, brazos cruzados, desafiante, mirando a Amaro', { ocultaPj: ['NOA'], vida: POLVO('#cfe8ff') }),
      { src: T1('laboratorio'), zoom: 2, cx: .55, cy: .4, vida: [{ tipo: 'anillos', zona: [.16, 0, .7, 1], n: 3 }].concat(POLVO('#cfe8ff')) }),
    labDos: O(I2('lab_dos', 'Plano a dos: Noa a la izquierda, Amaro a la derecha, el Transportador entre ellas', { ocultaPj: ['NOA', 'AMARO'], vida: [{ tipo: 'anillos', zona: [.38, .05, .3, .6], n: 3 }].concat(POLVO('#cfe8ff')) }),
      { src: T1('laboratorio'), zoom: 2, cx: .55, cy: .4, vida: [{ tipo: 'anillos', zona: [.16, 0, .7, 1], n: 3 }].concat(POLVO('#cfe8ff')) }),
    labCuaderno: I2('lab_cuaderno', 'Noa saca a escondidas el cuaderno de su padre; Amaro de espaldas en la consola', { ocultaPj: ['NOA', 'AMARO'], vida: POLVO('#cfe8ff') }),
    cuaderno: I2('cuaderno_santiago', 'DETALLE: página del cuaderno del padre (boceto de la Torre del Reloj, pentagramas); la web escribe el rótulo', { vida: POLVO() }),
    pulsera: I2('pulsera_teclea', 'DETALLE: el dedo de Noa teclea en su pulsera; el cuaderno debajo', { vida: [{ tipo: 'vibra', zona: [.45, .35, .15, .25] }, { tipo: 'parpadeo', zona: [.4, .25, .25, .4], color: '#9fe4ff' }] }),
    maquina: { src: T1('prueba'), zoom: 1.25, cx: .4, cy: .4, vida: [{ tipo: 'anillos', zona: [.34, .025, .59, .875], n: 3 }, { tipo: 'pulso', zona: [.55, .3, .2, .3], color: '#58b8ff' }].concat(POLVO('#cfe8ff')) },
    /* Santiago, hacia 1730 */
    llegada: I2('claustro_llegada', 'Claustro de la catedral con lluvia fina: Noa aparece entre anillos de luz', { ocultaPj: ['NOA'], vida: LLUVIA().concat([{ tipo: 'anillos', zona: [.3, .5, .4, .3], n: 2, color: '#9fe4ff' }]) }),
    claustroNoa: I2('claustro_noa', 'Noa bajo un arco del claustro, mira alrededor; gotas en el pelo', { ocultaPj: ['NOA'], vida: LLUVIA([.5, 0, .5, 1], 90) }),
    quintana: I2('quintana_berenguela', 'Praza da Quintana hacia 1730 con lluvia; la Torre del Reloj (Berenguela); gente de la época', { vida: LLUVIA(null, 150) }),
    campanas: I2('berenguela_campanas', 'Contrapicado: las campanas de la Berenguela sonando bajo la lluvia', { vida: LLUVIA(null, 120) }),
    archivo: I2('archivo_general', 'Archivo de la Capilla de Música: Don Ramón en su mesa bajo la ventana con lluvia; velas', { vida: [].concat(VELA(.156, .49).concat(VELA(.708, .48), VELA(.099, .31)), POLVO('#ffe8c0')) }),
    pluma: I2('copista_pluma', 'DETALLE: la mano de Don Ramón copia con pluma y tinta en papel pautado', { vida: VELA(.11, .15).concat(POLVO('#ffe8c0')) }),
    maestro: I2('archivo_maestro', 'El maestro de capilla entra con prisa, partitura en alto', { vida: POLVO('#ffe8c0') }),
    himno: I2('archivo_himno', 'DETALLE: el maestro deja el himno en la mesa y señala el pentagrama; un fagot barroco apoyado en la pared', { vida: VELA(.09, .13).concat(POLVO('#ffe8c0')) }),
    copista: I2('archivo_copista', 'Don Ramón resopla y señala el montón de partes por copiar', { vida: VELA(.055, .46).concat(POLVO('#ffe8c0')) }),
    noaAsoma: I2('archivo_noa_asoma', 'Noa se asoma por la puerta del claustro, mojada, mano a medio levantar', { ocultaPj: ['NOA'], vida: [].concat(POLVO('#ffe8c0')) }),
    copistaMira: I2('archivo_copista_mira', 'Don Ramón mira a Noa de arriba abajo por encima de los anteojos', { vida: POLVO('#ffe8c0') }),
    noaExplica: I2('archivo_noa_explica', 'Noa junto a la mesa, señala la armadura; Don Ramón, sorprendido', { ocultaPj: ['NOA'], vida: VELA(.067, .2).concat(POLVO('#ffe8c0')) }),
    mesa: I2('archivo_mesa', 'Cenital SIN personas: la mesa del copista (papel pautado, pluma, tintero, vela); centro limpio', { vida: VELA(.078, .05).concat(POLVO('#ffe8c0')) }),
    copistaSorpresa: I2('archivo_copista_sorpresa', 'Don Ramón sostiene la hoja nueva a contraluz, admirado; Noa con media sonrisa', { ocultaPj: ['NOA'], vida: VELA(.071, .5).concat(POLVO('#ffe8c0')) }),
    noaLejos: I2('archivo_noa_lejos', 'Noa, primer plano, mira la ventana con lluvia: sonrisa melancólica', { ocultaPj: ['NOA'], vida: [] }),
    ministriles: I2('ministriles', 'Galería del claustro: los tres ministriles tocan (chirimía, sacabuche, fagot barroco); el maestro marca el compás', { vida: [].concat(POLVO('#ffe8c0')) }),
    bajon: I2('ministriles_bajon', 'El bajonista, rojo y apurado: se le quiebra la nota aguda', { vida: POLVO('#ffe8c0') }),
    tocan: I2('ministriles_tocan', 'Los tres tocan relajados el himno transportado; el maestro asiente', { vida: [].concat(POLVO('#ffe8c0')) }),
    minNoa: I2('ministriles_noa', 'Noa escucha junto a una columna, satisfecha; los ministriles desenfocados', { ocultaPj: ['NOA'], vida: [] }),
    claustroPulsera: I2('claustro_pulsera', 'DETALLE: la pulsera de Noa chisporrotea bajo la lluvia', { vida: [{ tipo: 'parpadeo', zona: [.38, .3, .25, .4], color: '#9fe4ff' }, { tipo: 'arco', zona: [.48, .45, .05, .1], color: '#9fe4ff' }].concat(LLUVIA(null, 100)) }),
    /* vuelta */
    amaroSospecha: O(I2('lab_amaro_sospecha', 'Amaro a la derecha, brazos cruzados, ceja levantada; la máquina humea', { ocultaPj: ['AMARO'], vida: [{ tipo: 'humo', zona: [.2, .1, .3, .4], n: 8 }].concat(POLVO('#cfe8ff')) }),
      { src: T1('laboratorio'), zoom: 2, cx: .55, cy: .4, vida: [{ tipo: 'humo', zona: [.3, .1, .4, .5], n: 8 }, { tipo: 'anillos', zona: [.16, 0, .7, 1], n: 2 }] }),
    noaSonrisa: O(I2('lab_noa_sonrisa', 'Noa a la izquierda, media sonrisa, gotas de lluvia de Santiago en el pelo', { ocultaPj: ['NOA'], vida: POLVO('#cfe8ff') }),
      { src: T1('laboratorio'), zoom: 2, cx: .55, cy: .4, vida: [{ tipo: 'anillos', zona: [.16, 0, .7, 1], n: 2 }].concat(POLVO('#cfe8ff')) }),
    amaroFirme: O(I2('lab_amaro_firme', 'Amaro señala la consola con firmeza: «el destino lo elijo yo»', { ocultaPj: ['AMARO'], vida: POLVO('#cfe8ff') }),
      { src: T1('prueba_consola'), vida: [{ tipo: 'traza', zona: [.40, .48, .33, .07], periodo: .16 }, { tipo: 'parpadeo', zona: [.38, .33, .36, .25], color: '#9fe4ff' }] }),
    registro: O(I2('registro_dos', 'DETALLE: pantalla del registro con dos puntos de coordenadas (la web pone las cifras)', { vida: [{ tipo: 'parpadeo', zona: [.1, .1, .5, .6], color: '#9fe4ff' }] }),
      { src: T1('lab_registro'), vida: [{ tipo: 'traza', zona: [.40, .62, .52, .025], periodo: .17 }].concat(POLVO('#cfe8ff')) }),
    dedo: O(I2('registro_dedo', 'DETALLE: el dedo de Noa borra el segundo punto; Amaro de espaldas al fondo', { vida: [{ tipo: 'parpadeo', zona: [.2, .1, .6, .6], color: '#9fe4ff' }] }),
      { src: T1('lab_registro'), zoom: 1.4, cx: .7, cy: .45, vida: POLVO('#cfe8ff') }),
    /* resumen y cierre */
    mesaLuz: O(I2('archivo_mesa', 'Cenital SIN personas: la mesa del copista', { luz: .45, vida: POLVO('#ffe8c0') }), { src: T1('definicion'), vida: POLVO() }),
    nocheNoa: O(I2('lab_noche_noa', 'Noa sola en el laboratorio de noche; el Transportador apagado; el cuaderno en la mesa', { ocultaPj: ['NOA'], vida: [{ tipo: 'apaga', zona: [.3, .1, .4, .7], dur: 9, color: '#58c8ff' }].concat(POLVO('#cfe8ff')) }),
      { src: T1('laboratorio'), zoom: 2, cx: .55, cy: .4, luz: .5, vida: [{ tipo: 'apaga', zona: [.2, .05, .6, .9], dur: 9 }].concat(POLVO('#cfe8ff')) }),
    cierre: O(I2('cierre_cuaderno', 'Noa sola de noche junto al Transportador apagado, hojea el cuaderno a la luz de la pulsera', { ocultaPj: ['NOA'], vida: [{ tipo: 'respira', zona: [.2, .4, .2, .3], color: '#9fe4ff', vel: 1.2 }].concat(POLVO('#cfe8ff')) }),
      { src: T1('laboratorio'), zoom: 2, cx: .55, cy: .4, luz: .45, vida: POLVO('#cfe8ff') }),
    cuadernoOtra: I2('cuaderno_otra', 'DETALLE: otra página del cuaderno: una fecha medio borrada (ilegible) y el boceto de un concierto', { vida: [{ tipo: 'respira', zona: [.1, .1, .8, .8], color: '#9fe4ff', vel: .8 }] })
  };
  B._IMG = IMG;

  /* ── el himno de la procesión (Sol M, 3/4): chirimía = la melodía; sacabuche = voz interior; bajón = la melodía una 8.ª grave.
     Original: al bajón se le QUIEBRA el re agudo (re4). Transportado una 2.ª M más grave (Fa M): suena igual, más grave. ── */
  const HIMNO = { ton: 'Sol', compas: '3/4', transp: 4,
    compases: [[['g/4', 'q'], ['b/4', 'q'], ['d/5', 'q']], [['c/5', '8'], ['b/4', '8'], ['a/4', 'q'], ['f#/4', 'q']], [['g/4', 'hd']]] };
  const VOCES = {
    chirimia: [[67, 1], [71, 1], [74, 1], [72, .5], [71, .5], [69, 1], [66, 1], [67, 3]],
    sacabuche: [[62, 3], [64, 1], [62, 1], [60, 1], [59, 3]],
    bajon: [[55, 1], [59, 1], [62, 1], [60, .5], [59, .5], [57, 1], [54, 1], [55, 3]]
  };
  const NEGRA = .72;
  /* (Iago 3-nov) en la escena 6 el himno suena GRABADO con muestras reales (chirimía/oboe, sacabuche/trombón antiguo, bajón/fagot; reverb de claustro):
     s2/mus/himno_original.mp3 (con la quiebra del re4) y himno_fa.mp3; los hace audio/render_himno.py con estas mismas VOCES y NEGRA,
     la 1.ª nota a 0,05 s del principio del fichero (así suena a la vez que antes: +0,1 s). Si falta el mp3, las notas sueltas de siempre. */
  const HIMNO_MP3 = { orig: 'mus/himno_original.mp3', fa: 'mus/himno_fa.mp3' };
  function tocaHimno(semis, quiebra) {
    const mp3 = quiebra && semis === 0 ? HIMNO_MP3.orig : !quiebra && semis === -2 ? HIMNO_MP3.fa : null;
    if (mp3 && B.buf[mp3]) { const h = B.suena(mp3, { t: B.ac().currentTime + .05, bus: B.bus.sfx, vol: 1, grupo: 'sfx' }); if (V().suelta) V().suelta(h); return; }
    const t0 = B.ac().currentTime + .1, corta = quiebra ? 2.6 : 99;
    Object.keys(VOCES).forEach(ins => { let t = 0; VOCES[ins].forEach(([m, d], i) => {
      if (t >= corta) return;
      const vel = ins === 'chirimia' ? .62 : ins === 'sacabuche' ? .6 : .72, dd = Math.min(d, corta - t) * NEGRA;
      if (quiebra && ins === 'bajon' && i === 2) V().quiebra('bajon', m + semis, t0 + t * NEGRA, d * NEGRA * 1.4, .8);
      else V().nota(ins, m + semis, t0 + t * NEGRA, dd * .95, vel);
      t += d; }); });
  }
  B._tocaHimno = tocaHimno;
  const ARM = (titulo, cambios, ens) => ({ tipo: 'armaduras', titulo: titulo, izq: { ton: 'Sol Mayor', f: 1 }, der: { ton: 'Fa Mayor', f: -1 }, flecha: '2.ª M ↓', cambios: cambios, ens: ens, total: cambios ? '2 ↓' : null });
  const REG = borra => ({ tipo: 'registro', titulo: 'Registro · último viaje', filas: [{ a: 'Santiago de Compostela', b: '≈ 1730' }, { a: '42.88 · −8.54 · ████', b: 'sin fecha', estado: 'parpadea' }], borra: borra });

  B.sesion({
    titulo: 'Transporte 2', subtitulo: 'La misma canción, más grave', sup: 'Unidad 9 · 2.º GP',
    recursos: [SF1('sfx_ui_clic'), SF1('sfx_destello'), SF1('sfx_llegada'), SF1('sfx_salto_tiempo'), SF1o('sfx_flash_blanco'), SF1o('sfx_maquina_apaga'), SF1('sfx_impacto'), SF1('sfx_radio_interferencia'),
      SF1('sfx_anillos_giran'), SF1('sfx_maquina_arranca'), SF1('sfx_anillo_encaja'), SF1('sfx_pulsera_vibra'), SF1('sfx_puerta_scifi'), SF1('sfx_estuche_cierra'),
      SFo('sfx_lumi'), SFo('sfx_plato'), SFo('sfx_silla'), SFo('sfx_puerta_casa'), SFo('sfx_campanas'), SFo('sfx_pluma'), SFo('sfx_papel'), SFo('sfx_pasos_piedra')]
      .concat(Object.keys(IMG).map(k => B.primero(IMG[k])).filter(q => q && !q.falta).map(q => q.src))
      .concat(B.viento.SAX_RUTAS, B.viento.UI_RUTAS, B.viento.MUESTRAS_RUTAS || [], [HIMNO_MP3.orig, HIMNO_MP3.fa]),
    escenas: [
      /* 0 · Arranque sin palabras: Coruña 2100 al anochecer → el edificio de la madre → la puerta se abre */
      { id: 'e0', titulo: 'Entrada', planos: [
        { id: 'p0', nombre: 'Negro', negro: true, auto: 1, amb: [AMB.ciudad], mus: MUS.entrada },
        { id: 'p0a', nombre: 'A Coruña 2100 · anochecer', fondoVid: S1 + 'vid/portada_coruna2100.mp4', img: { src: T1('coruna2100') }, pj: null, auto: 3.5, amb: [AMB.ciudad, AMB.mar] },
        { id: 'p0b', nombre: 'El edificio de la madre', img: IMG.edificio, pj: null, auto: 3.5, amb: [AMB.casaBaja, AMB.mar], mus: MUS.casa },
        { id: 'p0c', nombre: 'La puerta se abre', img: IMG.puertaAbre, pj: null, auto: 3, amb: [AMB.casa], sfx: [{ src: SF1('sfx_puerta_scifi'), t: .1, vol: .6 }, { src: SFo('sfx_lumi'), t: 1, vol: .22 }] }
      ] },
      /* 1 · Casa de la madre: tensión sin reconciliación */
      { id: 'e1', titulo: 'Casa de mamá', planos: [
        { id: 'p1a', nombre: 'Casa de la madre · la cena', img: IMG.casa, amb: [AMB.casa], mus: MUS.casa, pj: null,
          lineas: [
            { id: 't2_001', quien: 'NARRADOR', texto: 'Esa noche, Noa cena en casa de su madre. Hacía semanas que no venía.', claves: { claves: ['A Coruña · 2100'], ts: [.3], pos: 'arriba' }, espera: .6 },
            { id: 't2_002', quien: 'MADRE', img: IMG.lumiSirve, texto: 'Gracias, Lumi.', sfx: [{ src: SFo('sfx_lumi'), t: 0, vol: .15 }, { src: SFo('sfx_plato'), t: .9, vol: .45 }], espera: .5 },
            { id: 't2_003', quien: 'MADRE', img: IMG.madre, pj: { q: 'MADRE', pose: 'decepcion' }, texto: 'Te pasas el día en el laboratorio o con el saxo. Casi no te veo.' },
            { id: 't2_004', quien: 'NOA', img: IMG.noaPlato, pj: { q: 'NOA', pose: 'aburrida' }, texto: 'Estoy aquí, ¿no?', espera: .6 },
            { id: 't2_005', quien: 'MADRE', img: IMG.madreFoto, pj: { q: 'MADRE', pose: 'decepcion' }, texto: 'Estás aquí… como estaba tu padre. Aquí, pero no.', espera: .5 },
            { id: 't2_006', quien: 'NOA', img: IMG.noaCrispada, pj: { q: 'NOA', pose: 'aburrida' }, texto: 'No empieces con papá.', espera: .6 },
            { id: 't2_007', quien: 'MADRE', img: IMG.dos, pj: { q: 'MADRE', pose: 'decepcion' }, texto: 'Tu padre y yo dejamos de hablarnos poco a poco. No quiero que nos pase lo mismo a nosotras.', espera: .4 },
            { id: 't2_008', quien: 'NOA', img: IMG.noaLevanta, pj: { q: 'NOA', pose: 'aburrida' }, sfx: [{ src: SFo('sfx_silla'), t: 0, vol: .7 }, { src: SF1('sfx_estuche_cierra'), en: .6, vol: .6 }],
              texto: 'Me voy. Tengo mucho trabajo, mamá. Tengo cosas más importantes que esto.' }
          ] },
        /* la puerta; la madre se queda sola; Lumi recoge el plato de Noa sin tocar (música y lluvia, sin palabras) */
        { id: 'p1b', nombre: 'La madre se queda sola', img: IMG.puertaCierra, amb: [AMB.casa], mus: MUS.casa, pj: null, auto: 9,   // (Iago 3-nov) sin el plano del plato
          sfx: [{ src: SFo('sfx_puerta_casa'), t: .3, vol: .8 }, { src: SFo('sfx_lumi'), t: 6.8, vol: .12 }],
          imgs: [{ t: 2.4, img: IMG.madreSola }] }
      ] },
      /* 2 · Laboratorio: Amaro descubre el módulo; Noa elige el destino con el cuaderno de su padre */
      { id: 'e2', titulo: 'El módulo', planos: [
        { id: 'p2a', nombre: 'La Torre, de mañana', img: IMG.torre, amb: [AMB.mar, AMB.labBajo], mus: MUS.lab, pj: null, antes: .8,
          lineas: [
            { id: 't2_009', quien: 'NARRADOR', imgs: [{ en: .5, img: IMG.labEspera }], amb: [AMB.lab], sfx: [{ src: SF1('sfx_puerta_scifi'), en: .48, vol: .6 }],
              texto: 'Noa no tenía que volver a la Torre hasta el día siguiente. Pero esa misma noche fue directa allí. Y no estaba sola: la doctora Amaro también seguía allí.' },
            { id: 't2_010', quien: 'AMARO', img: IMG.labModulo, imgs: [{ en: .55, img: IMG.labRegMod }], pj: { q: 'AMARO', pose: 'tableta' }, poses: [{ en: .6, pose: 'explica' }],
              texto: 'He revisado el registro línea por línea… y he encontrado esto. Un módulo que no aparece en ningún plano. ¿Lo pusiste tú?', claves: { claves: ['Un módulo que no está en los planos'], ens: [.58], pos: 'izq' } },
            { id: 't2_011', quien: 'NOA', img: IMG.labNoa, pj: { q: 'NOA', pose: 'traviesa' }, texto: '¿Eso? Ni idea. No lo había visto en mi vida.', espera: .6 },
            { id: 't2_012', quien: 'AMARO', img: IMG.labDos, pj: { q: 'AMARO', pose: 'alarma' }, texto: 'Ya, claro. Ayer viajaste cuarenta mil años atrás. ¿Sabes lo peligroso que es eso?', claves: { claves: ['−40 000 años'], ens: [.35], pos: 'arriba' } },
            { id: 't2_013', quien: 'NOA', img: IMG.labNoa, pj: { q: 'NOA', pose: 'neutra' }, texto: 'Por eso hoy no iremos tan atrás. Solo un poco. Mi padre no se habría rendido a la primera, ¿verdad?' },
            { id: 't2_014', quien: 'AMARO', img: IMG.labDos, pj: { q: 'AMARO', pose: 'tableta' }, texto: 'Tu padre… Está bien. Unos siglos. Ni uno más.', espera: .5 }
          ] },
        /* mientras Amaro se gira a la consola, Noa abre a escondidas el cuaderno de su padre y teclea el destino en su pulsera */
        { id: 'p2b', nombre: 'El cuaderno del padre', img: O(IMG.labCuaderno, IMG.cuaderno), amb: [AMB.lab], pj: null, antes: 2.4, sfx: [{ src: SFo('sfx_papel'), t: .6, vol: .7 }],
          lineas: [
            { id: 't2_015', quien: 'NARRADOR', img: IMG.cuaderno, imgs: [{ en: .62, img: IMG.pulsera }],
              lamina: { tipo: 'texto', txt: 'Santiago · Capilla de Música<br><small>hacia 1730</small>', x: .7, y: .24, rot: -4, estilo: B.existe(N('cuaderno_santiago')) ? 'tinta' : 'holo' },
              laminas: [{ en: .62, lamina: null }], sfx: [{ src: SF1('sfx_ui_clic'), en: .66 }, { src: SF1('sfx_ui_clic'), en: .72 }, { src: SF1('sfx_destello'), en: .82, vol: .6 }],
              texto: 'Lo que Amaro no ve es que Noa ya ha elegido el destino. Lo ha sacado del cuaderno de su padre.' }
          ] },
        /* (Iago 3-nov) antes del salto, otra vez lo de las frecuencias, pero con DECIBELIOS: cuatro señales, un sonómetro en cada una
           (js/decibelios.js · css/decibelios.css). Al activarse suenan los anillos; el arranque de la máquina lo pone p2c */
        { id: 'p2cal', nombre: 'Calibrar la intensidad', img: { src: T1('prueba_consola'), vida: [{ tipo: 'traza', zona: [.40, .48, .33, .07], periodo: .16 }, { tipo: 'parpadeo', zona: [.38, .33, .36, .25], color: '#9fe4ff' }] },
          amb: [AMB.lab], ambInter: [AMB.labBajo], mus: MUS.lab,
          lineas: [{ id: 't2_015b', quien: 'AMARO', pj: { q: 'AMARO', pose: 'tableta' }, texto: 'Esta vez calibramos la intensidad. Cada señal, en su nivel exacto. Ni un decibelio de más.' }],
          inter: { tipo: 'decibelios',
            escala: [40, 100], canales: [{ hz: 220, obj: 62, pos: .46 }, { hz: 440, obj: 76, pos: .78 }, { hz: 880, obj: 52, pos: .34 }, { hz: 1760, obj: 88, pos: .62 }],   /* (Iago 09:56) misma escala 40–100; el objetivo en otro sitio del dial y del deslizador */
            cartel: 'Calibra la intensidad: sube cada señal hasta que su sonómetro quede justo en el centro de la zona marcada.',
            cartelCorto: 'Sube cada señal hasta que la aguja quede <b>en el centro de la zona ámbar</b>. Afina con − y + (o con las flechas; con Mayús, de 10 en 10).',
            textoFin: 'Intensidad calibrada: cada señal, en su nivel exacto.', destino: 'Intensidad calibrada · Destino: Santiago, hacia 1730',
            sfxActiva: [SF1('sfx_anillos_giran')] } },
        { id: 'p2c', nombre: 'El Transportador se activa', img: IMG.maquina, amb: [AMB.lab], mus: MUS.tension, pj: null, auto: 3.4,
          sfx: [{ src: SF1('sfx_maquina_arranca'), t: .1 }, { src: SF1('sfx_anillos_giran'), t: 1.2 }] }
      ] },
      /* 3 · El salto y la llegada a Santiago */
      { id: 'e3', titulo: 'Santiago, hacia 1730', planos: [
        { id: 'p3a', nombre: 'El salto', tunel: { de: 2100, a: 1730 }, dur: 5, blanco: 2.2, sfxBlanco: SF1o('sfx_flash_blanco'), amb: [], mus: MUS.tension, sfx: [{ src: SF1('sfx_salto_tiempo'), t: 0 }] },
        { id: 'p3b', nombre: 'La llegada al claustro', video: 'vid/llegada.mp4', img: IMG.llegada, desc: 'Runway 1080p: Noa aparece en el claustro con lluvia fina', dur: 5, auto: 5, pj: null,
          amb: [AMB.lluvia, AMB.organoBajo], mus: MUS.santiago, sfx: [{ src: SF1('sfx_llegada'), t: 0 }] },
        { id: 'p3c', nombre: 'Claustro y Quintana', funde: 1.2, img: IMG.claustroNoa, amb: [AMB.lluvia, AMB.organoBajo], mus: MUS.santiago, pj: null, antes: .6,
          lineas: [
            { id: 't2_016', quien: 'NOA', texto: 'Vale. Ya no estamos tan atrás. Hay civilización… perfecto.', espera: .6 },
            { id: 't2_017', quien: 'NARRADOR', img: IMG.quintana, imgs: [{ en: .52, img: IMG.campanas }], sfx: [{ src: SFo('sfx_campanas'), en: .5, vol: .8 }],
              texto: 'Santiago de Compostela, hacia 1730. Las campanas de la catedral llaman a ensayo.', claves: { claves: ['Santiago · hacia 1730'], ts: [.4], pos: 'arriba' }, espera: 1.4 }
          ] }
      ] },
      /* 4 · El archivo de la Capilla de Música */
      { id: 'e4', titulo: 'El copista', planos: [
        { id: 'p4a', nombre: 'Archivo de la Capilla de Música', img: IMG.archivo, amb: [AMB.archivo, AMB.organoBajo], mus: MUS.santiagoBajo, pj: null, antes: .8,
          lineas: [
            { id: 't2_018', quien: 'NARRADOR', imgs: [{ en: .5, img: IMG.pluma, vid: 'vid/copista.mp4' }], sfx: [{ src: SFo('sfx_pluma'), en: .5, vol: .7 }],
              texto: 'En el archivo de la Capilla de Música trabaja un copista. Ya existe la imprenta, pero la música de la catedral no se imprime: el maestro la compone para sus músicos, y cada parte se copia a mano, nota a nota.', claves: { claves: ['Copia a mano'], ens: [.62], pos: 'arriba' } },
            { id: 't2_019', quien: 'MAESTRO', img: IMG.maestro, imgs: [{ en: .5, img: IMG.himno }], sfx: [{ src: SFo('sfx_pasos_piedra'), t: 0, vol: .7 }, { src: SFo('sfx_papel'), en: .5, vol: .7 }],
              texto: '¡Don Ramón! Los ministriles tocan este himno mañana en la procesión, y está demasiado agudo para el fagot. Cópielo un tono más grave.', claves: { claves: ['Un tono más grave'], ens: [.86], pos: 'arriba' } },
            { id: 't2_020', quien: 'COPISTA', img: IMG.copista, texto: '¿Un tono más grave? ¿Todo? Nota por nota… no acabaré antes de vísperas.' },
            { id: 't2_021', quien: 'NOA', img: IMG.noaAsoma, texto: 'Puedo ayudarle. Sé hacerlo.', espera: .4 },
            { id: 't2_022', quien: 'COPISTA', img: IMG.copistaMira, texto: '¿Tú? …Está bien. Pero sin borrones.', espera: .4 },
            { id: 't2_023', quien: 'NOA', img: IMG.noaExplica, imgs: [{ en: .5, img: IMG.mesa }],
              texto: 'Está en sol mayor. Un tono más grave es fa mayor: un bemol en la armadura. Y cada nota, una segunda mayor más abajo.',
              claves: { claves: ['Sol M → Fa M', '1♭', '2.ª M ↓'], ens: [.2, .45, .78], pos: 'arriba' } }
          ] }
      ] },
      /* 5 · Interactivo 1: el transporte escrito, guiado (mecánica de Teoría PRO) */
      { id: 'e5', titulo: 'Copiar un tono más grave', planos: [
        { id: 'p5', nombre: 'La mesa del copista', img: IMG.mesa, amb: [AMB.archivo], ambInter: [{ src: SFl('amb_archivo'), vol: .16 }], mus: MUS.santiagoBajo, pj: null, auto: .6,
          inter: { tipo: 'escrito', modo: 'guiado', melodia: HIMNO, alterar: false,   /* (Iago 3-nov) en T2 sin alteraciones accidentales: fuera ♭ ♮ ♯ */
            cartel: 'Ayuda a Don Ramón: el himno está en <b>Sol mayor</b> y hay que copiarlo <b>una 2.ª mayor más grave</b>. Primero elige con las ruedas la <b>tonalidad nueva</b> y su <b>armadura</b>. Después coloca cada nota en el pentagrama de abajo (la nota de arriba que toca se ilumina en rojo). Cuando acabes, pulsa <b>Corregir</b>.',
            cartelCorto: 'Tonalidad nueva y armadura con las ruedas; luego cada nota, <b>una 2.ª mayor más abajo</b>. Pulsa <b>▶ Original</b> para oír el himno.',
            pistas: { ton: 'La tónica también baja una 2.ª mayor: de sol, un tono más abajo.', arm: 'Noa ya lo ha dicho: fa mayor lleva un bemol en la armadura (si♭).',
              notas: 'Cada nota baja un grado: si estaba en una línea, va al espacio de justo debajo (y al revés). Las rojas no están en su sitio.' },
            bien: '¡Ni un borrón! <b>Fa mayor</b>, un bemol, y cada nota una 2.ª mayor más abajo.', sigueAlAcertar: 1.6, piel: 'epoca' },
          despues: [
            /* (Iago 3-nov) al acertar suena enseguida Don Ramón (sigueAlAcertar), sin esperar a «Continuar» */
            { id: 't2_024', quien: 'COPISTA', img: IMG.copistaSorpresa, sfx: [{ src: SFo('sfx_papel'), t: 0, vol: .6 }], texto: 'Muy bien, muchacha. Nada mal. ¿Dónde aprendiste a hacer esto?', amb: [AMB.archivo] },
            { id: 't2_025b', quien: 'COPISTA', img: IMG.copistaMira, texto: 'Y, por cierto, ¿qué son esos artilugios que llevas en el cuello y en la mano? Y esa ropa… es de lo más gallarda.', espera: .3 },
            { id: 't2_025', quien: 'NOA', img: IMG.noaLejos, pj: { q: 'NOA', pose: 'traviesa' }, texto: 'Uf… es una historia muy larga. Creo que mejor no se lo cuento.', espera: 1 }
          ] }
      ] },
      /* 6 · Los ministriles lo tocan: el original (al bajón se le quiebra el re agudo) y el transportado */
      { id: 'e6', titulo: 'Los ministriles', planos: [
        { id: 'p6a', nombre: 'Ensayo · el original (Sol M)', img: IMG.ministriles, amb: [AMB.lluviaBaja], mus: false, pj: null, auto: 5.2, imgs: [{ t: 2.1, img: IMG.bajon }],
          claves: null, al: [{ t: .4, fn: () => tocaHimno(0, true) }] },
        { id: 'p6b', nombre: 'Ensayo · un tono más grave (Fa M)', img: IMG.tocan, amb: [AMB.lluviaBaja], mus: false, pj: null, auto: 8, antes: 0,
          al: [{ t: .6, fn: () => tocaHimno(-2, false) }] },
        { id: 'p6c', nombre: 'Las diferencias · Sol M → Fa M', img: IMG.minNoa, amb: [AMB.lluviaBaja, AMB.organoBajo], mus: MUS.santiagoBajo, pj: null,
          lineas: [
            /* (Iago 3-nov) diferencias simplificadas: cuántas y hacia dónde (sin listar las notas) */
            { id: 't2_026', quien: 'NARRADOR', imgs: [{ en: .2, img: IMG.mesaLuz }, { en: .62, img: IMG.pluma }],
              laminas: [{ en: .2, lamina: Object.assign(ARM('Sol M (1♯) → Fa M (1♭) · 2 diferencias ↓', ['2 diferencias ↓'], [4]), { total: null }) }],
              texto: 'Es el mismo himno, a otra altura. Al pasar de sol mayor a fa mayor, la armadura cambia en dos alteraciones, hacia abajo: un sostenido menos y un bemol más. Son las diferencias: dos, hacia abajo.', espera: 1 }
          ] }
      ] },
      /* 7 · Interactivo 2: las diferencias (trCorregir de Teoría PRO), simplificado (Iago 3-nov): solo cuántas y hacia dónde */
      { id: 'e7', titulo: 'Las diferencias', planos: [
        { id: 'p7', nombre: 'Las diferencias', img: IMG.mesa, amb: [AMB.archivo], mus: MUS.santiagoBajo, pj: null, auto: .3,
          inter: { tipo: 'diferencias', piel: 'epoca', notas: false,
            cartel: 'Ahora tú: cuenta las <b>diferencias</b>. Mira las dos armaduras y elige <b>cuántas</b> alteraciones cambian y si van <b>hacia arriba</b> (más sostenidos o menos bemoles) o <b>hacia abajo</b> (más bemoles o menos sostenidos). Después, <b>Corregir</b>.',
            cartelCorto: 'Cuántas diferencias y hacia dónde. Después, <b>Corregir</b>.',
            fin: 'Las diferencias: cuántas alteraciones cambian de una armadura a la otra, y hacia dónde.',
            items: [
              { de: { ton: 'Re Mayor', f: 2 }, a: { ton: 'Mi Mayor', f: 4 }, transp: '2.ª M ↑', bien: '¡Exacto! De 2♯ a 4♯: dos diferencias hacia arriba (dos sostenidos más).', explica: 'De 2♯ a 4♯ hay dos sostenidos más: son <b>2 diferencias hacia arriba</b>.' },
              { de: { ton: 'Fa Mayor', f: -1 }, a: { ton: 'Mi♭ Mayor', f: -3 }, transp: '2.ª M ↓', bien: '¡Exacto! De 1♭ a 3♭: dos diferencias hacia abajo (dos bemoles más).', explica: 'De 1♭ a 3♭ hay dos bemoles más: son <b>2 diferencias hacia abajo</b>.' }
            ] } }
      ] },
      /* 8 · Vuelta: Amaro sospecha; Noa borra la segunda coordenada */
      { id: 'e8', titulo: 'Vuelta', planos: [
        { id: 'p8a', nombre: 'La pulsera chisporrotea', img: IMG.claustroPulsera, amb: [AMB.lluvia], mus: false, pj: null, antes: .4,
          lineas: [{ id: 't2_027', quien: 'AMARO', nombre: 'Radio · Amaro', filtro: 'radio', estilo: 'radio', sfx: [{ src: SF1('sfx_radio_interferencia'), t: 0 }], texto: 'Noa… te traigo de vuelta… ahora.', auto: .4 }] },
        { id: 'p8b', nombre: 'Túnel', tunel: { de: 1730, a: 2100 }, dur: 4, mus: MUS.viaje, amb: [], sfx: [{ src: SF1('sfx_salto_tiempo'), t: 0 }] },
        { id: 'p8c', nombre: 'Vuelta al laboratorio', video: S1 + 'vid/vuelta.mp4', tunel: { de: 1730, a: 2100 }, dur: 5, blanco: 1.1, amb: [AMB.labBajo],
          sfx: [{ src: SF1('sfx_salto_tiempo'), t: 0, vol: .6 }, { src: SF1('sfx_destello'), t: 3.6, vol: .9 }, { src: SF1('sfx_llegada'), t: 3.9, vol: 1.1 }, { src: SF1('sfx_impacto'), t: 3.9, vol: .5 }, { src: SF1o('sfx_maquina_apaga'), t: 4.4, vol: .6 }] },
        { id: 'p8d', nombre: 'Laboratorio · ¿casualidad?', img: IMG.amaroSospecha, amb: [AMB.lab], pj: null, antes: 1,
          lineas: [
            { id: 't2_028', quien: 'AMARO', pj: { q: 'AMARO', pose: 'helada' }, texto: 'Qué curioso… Solo programé que viajaras unos siglos atrás, y has aparecido en Santiago. No logro entenderlo.' },
            { id: 't2_029', quien: 'NOA', img: IMG.noaSonrisa, pj: { q: 'NOA', pose: 'traviesa' }, texto: 'Será que a la máquina le gustan las campanas.', espera: .4 },
            { id: 't2_030', quien: 'AMARO', img: IMG.amaroFirme, pj: { q: 'AMARO', pose: 'explica' }, texto: 'El módulo es tu herencia, de acuerdo. Pero recuerda que aquí los parámetros y el destino los elijo yo.' },
            /* en la pantalla del registro parpadea una SEGUNDA coordenada; mientras Amaro se gira, Noa la borra */
            { id: 't2_031', quien: 'NOA', img: IMG.registro, imgs: [{ t: 1.9, img: IMG.dedo }], lamina: REG({ fila: 1, t: 2.8 }), pj: null,
              sfx: [{ src: SF1('sfx_ui_clic'), t: 2.7, vol: .9 }], texto: 'Claro.', espera: 4.2 }
          ] }
      ] },
      /* 9 · Resumen del narrador (láminas dibujadas en código) */
      { id: 'e9', titulo: 'Transporte escrito', planos: [
        { id: 'p9', nombre: 'Resumen', img: IMG.mesaLuz, amb: [AMB.labBajo], mus: MUS.resumen, pj: null, antes: .6,
          lineas: [
            { id: 't2_032', quien: 'NARRADOR', lamina: ARM('1 · La tonalidad nueva y su armadura'),
              laminas: [{ en: .52, lamina: { tipo: 'melodias', titulo: '2 · Cada nota, el mismo intervalo', ex: B.escrito.fijo(HIMNO), paso: .62, t0: .3 } }],
              texto: 'Transportar por escrito es copiar la obra de nuevo en otra tonalidad. Primero decides la tonalidad nueva y su armadura. Después mueves cada nota el mismo intervalo.', espera: .6 },
            { id: 't2_033', quien: 'NARRADOR', img: IMG.pluma, lamina: null, imgs: [{ en: .6, img: IMG.tocan }],
              texto: 'Sus desventajas: lleva tiempo, y la partitura original ya no te sirve para esa versión. Su ventaja: cuando ya está escrito, solo tienes que tocarlo.',
              claves: { claves: ['Lleva tiempo', 'El original ya no sirve', 'Ventaja: solo tocarlo'], ens: [.14, .33, .66], pos: 'arriba' } },
            { id: 't2_034', quien: 'NARRADOR', img: IMG.nocheNoa, texto: '¿Y si no hubiera tiempo para copiarla? Entonces habría que transportar en la cabeza, mientras se toca. Pero eso… será otro viaje.',
              claves: { claves: ['Transporte mental'], ens: [.55], pos: 'arriba' }, espera: 1.2 }
          ] }
      ] },
      /* 10 · Ejercicio final (generador TR_ESC, 3 melodías de dificultad creciente, con nota) y cierre */
      { id: 'e10', titulo: 'Ejercicio final', planos: [
        { id: 'p10', nombre: 'Ejercicio final', img: IMG.mesaLuz, amb: [AMB.labBajo], mus: MUS.resumen, pj: null, auto: .4,
          inter: { tipo: 'escrito', modo: 'final', niveles: [1, 2, 3], alterar: false, opcional: true,   /* (Iago 3-nov) opcional: practicar o volver al menú */
            cartel: 'Si quieres, practica con el ejercicio final: <b>tres melodías</b>, cada una un poco más difícil. En cada una, elige la <b>tonalidad nueva</b> y su <b>armadura</b>, coloca todas las notas transportadas y pulsa <b>Corregir</b> (una sola vez). Al final verás tu nota.',
            cartelCorto: 'Tonalidad nueva + armadura + cada nota transportada. Después, <b>Corregir</b>.' } },
        { id: 'p10b', nombre: 'Cierre · el cuaderno', img: IMG.cierre, amb: [AMB.labBajo], mus: MUS.cierre, pj: null, auto: 9,
          imgs: [{ t: 4.6, img: IMG.cuadernoOtra }], sfx: [{ src: SFo('sfx_papel'), t: 4.2, vol: .6 }] }
      ] }
    ]
  });
})(window.TR);
