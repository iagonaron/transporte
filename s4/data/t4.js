/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 4 · «Las diferencias» — datos de la sesión (GUION-S4.md, 4-nov 19:30) · ayudante D
   Mismo formato que data/t3.js. Novedades de T4:
     · I4('clave', 'descripción del plano') → img/t4/<clave>.webp (1920×1080, ayudante C). Mientras falta, su MARCADOR; donde
       sirve, una lámina de RESERVA de T1/T2/T3 (laboratorio, casa de la madre de T2, María Pita de T3). ?marcas=1 enseña los
       marcadores aunque haya reserva.
     · «vida» de cada lámina: capa «brillos» sobre sus LUCES REALES, que inventario.py detecta solas en img/t4/*.webp
       (data/luces_t4.js · TR.LUCES4), más partículas, reflejos y pantallas por plano.
     · voces en voz/t4/t4_XXX.mp3 (ayudante B) · música mus/t4_*.mp3 (A) · efectos sfx/sfx_t4_*.mp3 y amb_t4_*.mp3 (B):
       si aún no están, no suenan (y no rompen nada: se usa el primero que exista de cada lista).
     · interactivos nuevos (js/t4.js): escucha (el dúo, «el mal») · montana · pasarParte · difFinal
     · cierre: tras la madre y el resumen, el ejercicio final OPCIONAL y «Transportarnos al menú principal» (motor.js · fin)
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  B.CFG = { blipConVoz: false, marcaFalta: true, voz: 'voz/t4/' };
  const PJ1 = '../s1/img/t1/pj/';
  B.PJ = {
    NOA: { nombre: 'Noa', color: '#7fd4ff', lado: 'izq', alto: .86, dir: PJ1, _: 'neutra', poses: ['neutra', 'aburrida', 'traviesa', 'sorpresa', 'pensativa', 'emocion', 'arrepentida'],
      rutas: { arrepentida: '../s3/img/t3/pj/noa_arrepentida.png' },
      mira: { neutra: 'izq', aburrida: 'izq', traviesa: 'izq', sorpresa: 'izq', pensativa: 'izq', emocion: 'izq', arrepentida: 'izq' } },
    AMARO: { nombre: 'Dra. Amaro', color: '#c9b6ff', lado: 'der', alto: .84, dir: PJ1, _: 'explica', poses: ['explica', 'tableta', 'alarma', 'helada'],
      mira: { explica: 'izq', tableta: 'der', alarma: 'der', helada: 'der' } },
    /* Xoán con 16 años y la madre: sin pose PNG (salen en las láminas de C) */
    XOAN: { nombre: 'Xoán', color: '#9fe8c8', lado: 'der', poses: [] },
    MADRE: { nombre: 'Iria (madre de Noa)', color: '#ffc48a', lado: 'der', poses: [] }
  };
  B.SFX_NIVEL = {
    sfx_anillo_encaja: [-26.4, -22], sfx_anillos_giran: [-16.3, -19], sfx_destello: [-17.4, -20], sfx_estuche_cierra: [-19.7, -18],
    sfx_llegada: [-13, -18], sfx_maquina_arranca: [-10.2, -18], sfx_notificacion: [-16.7, -21], sfx_puerta_scifi: [-9.9, -19],
    sfx_pulsera_vibra: [-4.3, -20], sfx_radio_interferencia: [-12.7, -22], sfx_salto_tiempo: [-15.3, -17], sfx_ui_clic: [-17.9, -28], sfx_ui_error: [-16.3, -24], sfx_ui_ok: [-22.1, -24]
  };
  const MARCAS = B.param('marcas') === '1';
  /* rutas: T4 propias (s4/…) · comunes de T1 (../s1/…) · de T2 (../s2/…) y de T3 (../s3/…) */
  const S1 = '../s1/', S2 = '../s2/', S3 = '../s3/', SF1 = n => S1 + 'sfx/' + n + '.mp3', SF1o = n => B.existe(SF1(n)) ? SF1(n) : SF1(n + '_sint');
  const SF = n => 'sfx/' + n + '.mp3', SF2 = n => B.existe(S2 + 'sfx/' + n + '.mp3') ? S2 + 'sfx/' + n + '.mp3' : S2 + 'sfx/' + n + '_sint.mp3', SF3 = n => S3 + 'sfx/' + n + '.mp3';
  /* el primero que exista de una lista de efectos (los de B con su nombre; si no, uno parecido de T1–T3) */
  const SFx = function () { const l = [].slice.call(arguments); for (let i = 0; i < l.length; i++) if (B.existe(l[i])) return l[i]; return l[0]; };
  /* ── ambientes en CAPAS (Iago 4-nov: nada de sonidos planos). src = lista: suena la primera que exista ── */
  const AMB = {
    plaza: { src: [SF('amb_t4_plaza'), SF1('amb_ciudad2100')], vol: .32 }, plazaBaja: { src: [SF('amb_t4_plaza'), SF1('amb_ciudad2100')], vol: .16 },
    terraza: { src: [SF('amb_t4_terraza'), SF('amb_t4_plaza'), SF1('amb_ciudad2100')], vol: .3 }, terrazaBaja: { src: [SF('amb_t4_terraza'), SF('amb_t4_plaza'), SF1('amb_ciudad2100')], vol: .14 },
    soportales: { src: [SF('amb_t4_soportales'), SF('amb_t4_plaza'), SF1('amb_ciudad2100')], vol: .26 }, soportalesBaja: { src: [SF('amb_t4_soportales'), SF('amb_t4_plaza'), SF1('amb_ciudad2100')], vol: .12 },
    noche: { src: [SF('amb_t4_plaza_noche'), SF3('sfx_t3_plaza_atardecer')], vol: .3 }, nocheDuo: { src: [SF('amb_t4_plaza_noche'), SF3('sfx_t3_plaza_atardecer')], vol: .2 },   /* (Iago 5-nov 09:18) gente cerca durante el dúo */ nocheBaja: { src: [SF('amb_t4_plaza_noche'), SF3('sfx_t3_plaza_atardecer')], vol: .16 },
    gaviotas: { src: SF3('amb_t3_gaviotas'), vol: .1 }, gaviotasBaja: { src: SF3('amb_t3_gaviotas'), vol: .05 },
    mar: { src: SF1('amb_mar_noche'), vol: .14 }, marLejos: { src: SF1('amb_mar_noche'), vol: .06 },
    lab: { src: SF1('amb_laboratorio'), vol: .34 }, labBajo: { src: SF1('amb_laboratorio'), vol: .16 },
    zumbido: { src: SF3('amb_t3_transportador'), vol: .18 }, consola: { src: SF3('amb_t3_consola'), vol: .14 },
    casa: { src: [SF('amb_t4_casa'), SF2('amb_casa_lluvia')], vol: .2 }, casaBaja: { src: [SF('amb_t4_casa'), SF2('amb_casa_lluvia')], vol: .11 },
    recuerdo: { src: [SF('amb_t4_videojuego'), SF1('amb_viento_juncos')], vol: .1 }
  };
  const PLAZA = [AMB.plaza, AMB.gaviotas], TERRAZA = [AMB.terraza, AMB.gaviotasBaja], SOPORTALES = [AMB.soportales, AMB.gaviotasBaja],
    SOPI = [AMB.soportalesBaja], NOCHE = [AMB.noche],   /* (Iago 5-nov) sin mar en la plaza de noche: gente */ LABA = [AMB.lab, AMB.zumbido, AMB.consola, AMB.marLejos], CASA = [AMB.casa];
  const MUS = {
    tema: { src: [{ src: S1 + 'mus/t1_tema_sint.mp3', vol: .2 }] },
    terraza: { src: [{ src: 'mus/t4_terraza.mp3', vol: .42 }, { src: S1 + 'mus/mus_cierre.mp3', vol: .22 }] },     // (A) bucle sin costura, −17 LUFS: bajo el narrador
    terrazaBaja: { src: [{ src: 'mus/t4_terraza.mp3', vol: .18 }, { src: S1 + 'mus/mus_cierre.mp3', vol: .1 }] },
    despedida: { src: [{ src: 'mus/t4_despedida.mp3', vol: .5, bucle: false }, { src: S1 + 'mus/t1_tema_sint.mp3', vol: .2 }] },   // (A) 30,1 s, el clarinete solo
    /* (Iago 5-nov 07:25) del final del dúo a la despedida: la banda sonora principal del portal, en bucle, para ir cerrando */
    cierre: { src: [{ src: S1 + 'mus/t1_tema_sint.mp3', vol: .3 }] },
    /* (Iago 5-nov 07:26) la casa de la madre CON música: nana del tema de Noa (piano y cuerdas pp), emotiva */
    casa: { src: [{ src: 'mus/t4_casa.mp3', vol: .5, bucle: false }, { src: S1 + 'mus/t1_tema_sint.mp3', vol: .2 }] },
    viaje: { src: [{ src: S1 + 'mus/mus_viaje.mp3', vol: .55, bucle: false }] },
    resumen: { src: [{ src: S1 + 'mus/mus_coruna2100.mp3', vol: .16 }] }
  };
  const DUO = { bien: 'mus/t4_duo.mp3', mal: 'mus/t4_duo_mal.mp3', vuelta2: 17.69 };   // (A, audio/t4/LISTA.md · tiempos_t4.json)

  /* ── láminas (PLANOS-T4.md, ayudante C). desc = lo que dice el marcador mientras falta. ocultaPj: quien ya sale en la lámina ── */
  const N = k => 'img/t4/' + k + '.webp', T1 = k => S1 + 'img/t1/' + k + '.webp', T2 = k => S2 + 'img/t2/' + k + '.webp', T3 = k => S3 + 'img/t3/' + k + '.webp';
  const O = MARCAS ? (a => a) : function () { return [].concat.apply([], arguments); };
  const LZ = B.LUCES4 || {};
  /* brillos sobre las luces reales (automáticas) de la lámina k (o de la reserva 't3:x' / 't2:x') */
  const BR = (k, o) => LZ[k] && LZ[k].length ? [Object.assign({ tipo: 'brillos', p: LZ[k] }, o || {})] : [];
  const POLVO = (c, n) => [{ tipo: 'polvo', zona: [0, 0, 1, 1], n: n || 14, color: c || '#ffe2b8' }];
  const MOTAS = (z, n, c) => [{ tipo: 'polvo', zona: z, n: n || 10, color: c || '#ffe2b8', vel: .2 }];
  const HAZ = (x, y, w, h, c) => [{ tipo: 'haz', zona: [x, y, w, h], color: c || '#ffe2b0', vel: .8 }];
  const SUELO = (z, n) => [{ tipo: 'reflejos', zona: z || [.05, .82, .9, .12], n: n || 10, color: '#ffe8c0' }];   // el granito mojado de la plaza
  const FAROLAS = (n) => [{ tipo: 'luces', zona: [0, .25, 1, .4], n: n || 12, color: '#ffe2b0' }];
  /* (Iago 4-nov, «parecían mocos») nada de POLVO ni MOTAS sobre las caras: solo en los detalles sin personas y en el recuerdo del
     videojuego; en los planos con personajes, solo los brillos de las luces reales y los reflejos del suelo */
  const I4 = (k, desc, o) => Object.assign({ src: N(k), desc: desc }, o || {});
  const R3 = (k, o) => Object.assign({ src: T3(k) }, o || {}), R2 = (k, o) => Object.assign({ src: T2(k) }, o || {});
  /* reglas que van en TODOS los encargos de imagen (DECISIONES): */
  const XOAN = 'Xoán con 16 años (fiel a img/t4/reencuentro_xoan: pelo castaño rizado, pecas, chaqueta verde oliva, camiseta blanca, pulsera naranja), chaval normal de 2070 sin nada del laboratorio';
  const CLAR = 'clarinete en Si♭ negro (fiel a img/tr_t3_hoja_xoan16.png)', SAXO = 'saxo alto en Mi♭ dorado (fiel a img/tr_noa_hoja_v2.png)';
  const PITA = 'plaza de María Pita en 2070 (reconocible: Palacio Municipal, soportales, estatua; locales y terrazas modernos, como en T3)';
  const IMG = {
    /* ── 1 · el reencuentro (retoma el final de T3: ahora sí se ve la cara de Xoán) ── */
    plaza: R3('mariapita', { vida: BR('t3:mariapita', { chispa: .05 }).concat(SUELO([.4, .735, .44, .025])) }),
    mano: R3('mano_hombro', { ocultaPj: ['NOA'], vida: BR('t3:mano_hombro', { chispa: .05 }) }),
    /* (Iago 4-nov 20:06) en T4 la cara de Xoán se ve desde su primera frase: mano en el hombro y, al empezar a hablar, corte a su cara */
    xoanLlama: O(I4('xoan_llama', 'PRIMER PLANO de ' + XOAN + ', por encima del hombro de Noa (de Noa solo el pelo y el hombro, desenfocados, de espaldas): con la mano aún en su hombro, la llama con naturalidad y alivio, como a alguien conocido («Iria, ¿dónde te habías metido?»); media sonrisa; atardecer en la ' + PITA, { ocultaPj: ['NOA'], vida: BR('xoan_llama', { chispa: .05 }) }),
      I4('reencuentro_xoan', '')),
    noaGira: R3('noa_se_gira', { ocultaPj: ['NOA'], vida: BR('t3:noa_se_gira', { chispa: .03 }) }),
    xoanPerdona: O(I4('xoan_perdona', 'PRIMER PLANO de ' + XOAN + ': se da cuenta de que se ha equivocado, apurado, media sonrisa de disculpa, una mano en la nuca; mira a Noa (hacia la izquierda); atardecer en la ' + PITA + ', terrazas desenfocadas', { vida: BR('xoan_perdona').concat(SUELO()) }),
      R3('noa_mariapita', { vida: BR('t3:noa_mariapita') })),
    noaSospecha: O(I4('reencuentro_noa', 'PRIMER PLANO de Noa, con sospecha y ligera excitación (no abatida): ¿Cómo te llamas tú?; mira a Xoán (hacia la derecha); de Xoán solo el hombro, desenfocado; atardecer, terrazas de María Pita', { ocultaPj: ['NOA'], vida: BR('reencuentro_noa', { chispa: .05 }).concat(SUELO([.3, .8, .4, .1])) }),
      R3('noa_se_gira', { ocultaPj: ['NOA'] })),
    xoanSonrie: O(I4('reencuentro_xoan', 'PRIMER PLANO de ' + XOAN + ': sonríe, extrañado, al decir su nombre; mira a Noa (hacia la izquierda); de Noa solo el pelo y el hombro, desenfocados; atardecer', { vida: BR('reencuentro_xoan', { chispa: .05 }).concat(SUELO([.55, .6, .4, .1])) }),
      R3('mariapita')),
    dos: O(I4('reencuentro_dos', 'Plano a dos, de perfil: Noa (izquierda) y Xoán (derecha), de la misma edad, frente a frente en la ' + PITA + ' al atardecer; los dos se miran sin saber qué decir; la estatua y el Palacio al fondo', { ocultaPj: ['NOA'], vida: BR('reencuentro_dos', { chispa: .05 }).concat(SUELO()) }),
      R3('mariapita')),
    /* ── 2 · terrazas de María Pita, horas después (del atardecer a la noche) ── */
    terraza: O(I4('terraza_general', 'Una terraza moderna bajo los soportales de la ' + PITA + ', a última hora de la tarde: Noa y Xoán sentados frente a frente en una mesa pequeña, hablando; dos bebidas (nada de comida animal); el estuche RECTANGULAR del saxo de Noa apoyado en su silla; gente variada en otras mesas (nadie se parece a Noa); plano general', { ocultaPj: ['NOA'], vida: BR('terraza_general', { chispa: .05 }).concat(SUELO()) }),
      R3('mariapita')),
    risas: O(I4('terraza_risas', 'Plano medio a dos en la terraza: Noa y Xoán se ríen a carcajadas de algo que ha dicho ella; la luz del atardecer ya baja y se encienden las luces de los soportales', { ocultaPj: ['NOA'], vida: BR('terraza_risas', { chispa: .05 }) }),
      R3('noa_mariapita')),
    estuches: O(I4('terraza_estuches', 'DETALLE sobre la mesa de la terraza: el estuche RECTANGULAR abierto del ' + SAXO + ' y, al lado, el estuche del ' + CLAR + ' (piezas encajadas en su terciopelo); dos vasos; las manos de los dos señalando las llaves', { vida: BR('terraza_estuches', { chispa: .06 }).concat(POLVO()) }),
      R3('mariapita')),
    xoanSerio: O(I4('terraza_xoan_serio', 'PRIMER PLANO de ' + XOAN + ' escuchando, serio y conmovido (Noa le acaba de contar algo de su madre, sin que se diga); la luz de la terraza en la cara; fondo desenfocado de soportales iluminados', { vida: BR('terraza_xoan_serio') }),
      R3('mariapita')),
    terrazaNoche: O(I4('terraza_noche', 'La misma terraza de la ' + PITA + ' ya de NOCHE: farolas y luces de los locales encendidas, menos gente; Noa y Xoán siguen hablando, relajados; plano general desde un poco más lejos', { ocultaPj: ['NOA'], vida: BR('terraza_noche', { chispa: .07 }).concat(SUELO(), FAROLAS(8)) }),
      R3('mariapita', { luz: .6 })),
    /* ── 3 · tocar en la calle, bajo los soportales ── */
    xoanPide: O(I4('soportales_xoan', XOAN + ' bajo los soportales de María Pita, de noche, con el ' + CLAR + ' en la mano SIN tocarlo (no en posición de tocar); medio en broma, medio en serio, le pide a Noa la melodía; plano medio; mira a la izquierda', { vida: BR('soportales_xoan', { chispa: .05 }).concat(SUELO([.1, .85, .8, .1])) }),
      R3('mariapita', { luz: .6 })),
    tararea: O(I4('noa_tararea', 'Bajo los soportales, de noche: Noa tararea (labios entreabiertos, marca el ritmo con la mano), con el ' + SAXO + ' colgado sin tocarlo; Xoán, a su lado, escribe en un cuaderno de pentagramas apoyado en la rodilla; plano a dos', { ocultaPj: ['NOA'], vida: BR('noa_tararea') }),
      R3('noa_mariapita')),
    cuaderno: O(I4('cuaderno_xoan_notas', 'DETALLE: la mano de Xoán escribe a LÁPIZ notas en un cuaderno de pentagramas (clave de sol y dos sostenidos en la armadura, notación correcta), bajo la luz cálida de una farola de los soportales', { vida: [{ tipo: 'brillos', p: [[.045, .06, 24, '#ffd59a']], a: .3 }] }   /* (Iago 4-nov) las notas reales del tema de Noa, compuestas en código sobre cuaderno_xoan_base */),
      R3('mariapita', { luz: .6 })),
    sacan: O(I4('soportales_instrumentos', 'Bajo los soportales, de noche: Noa y Xoán sacan y montan sus instrumentos (' + SAXO + ' y ' + CLAR + '), los estuches abiertos en el suelo, el cuaderno de pentagramas en un atril plegable; plano a dos', { ocultaPj: ['NOA'], vida: BR('soportales_instrumentos', { chispa: .05 }).concat(SUELO()) }),
      R3('mariapita', { luz: .6 })),
    tocanMal: O(I4('soportales_tocan_mal', 'Noa y Xoán tocan a la vez bajo los soportales, leyendo los dos el MISMO cuaderno del atril (' + SAXO + ', ' + CLAR + ', posición de tocar real); ya se nota que algo no encaja: ceño fruncido de los dos', { ocultaPj: ['NOA'], vida: BR('soportales_tocan_mal').concat(SUELO()) }),
      R3('mariapita', { luz: .6 })),
    mueca: O(I4('soportales_mueca', 'Noa y Xoán dejan de tocar a la vez y se miran con una mueca de «¡uf, qué mal suena!», medio riéndose; los instrumentos bajados (no en posición de tocar); soportales de noche', { ocultaPj: ['NOA'], vida: BR('soportales_mueca') }),
      R3('noa_mariapita')),
    /* ── 4 · Xoán explica las diferencias ── */
    explica: O(I4('xoan_explica', XOAN + ' explica con el lápiz sobre el cuaderno de pentagramas abierto en el atril plegable (sin tocar el clarinete, que cuelga de su mano); Noa, de espaldas o de perfil a la izquierda, escucha; plano medio; luz de farola', { ocultaPj: ['NOA'], vida: BR('xoan_explica') }),
      R3('mariapita', { luz: .6 })),
    noaCuenta: O(I4('noa_cuenta', 'PRIMER PLANO de Noa: cuenta con los dedos y responde segura («Una»), media sonrisa; mira a Xoán (hacia la derecha); soportales de noche desenfocados', { ocultaPj: ['NOA'], vida: BR('noa_cuenta') }),
      R3('noa_se_gira', { ocultaPj: ['NOA'] })),
    /* FLASHBACK (Iago 2-nov y 4-nov): el universo del videojuego del portal de Modulación; solo un guiño visual, nada musical */
    flashMontana: I4('flash_montana_consola', 'RECUERDO (tonos cálidos, bordes suaves): el videojuego del portal de Modulación: su viajero trepa una montaña nevada hacia la cumbre, en el mismo universo y estilo que los vídeos de Modulación (PROYECTO/runway/wow5_*.mp4); sin interfaz ni música', { vida: [] }),
    flashAgua: I4('flash_agua_consola', 'RECUERDO (tonos cálidos, bordes suaves): el mismo viajero del videojuego de Modulación se zambulle y bucea hacia el fondo de un mar azul, con rayos de luz desde la superficie; mismo universo y estilo; sin interfaz', { vida: [] }),
    accCuaderno: O(I4('cuaderno_accidental', 'DETALLE: el dedo de Xoán señala un BECUADRO a lápiz en el cuaderno de pentagramas (notación correcta, clave de sol, dos sostenidos), bajo la luz de la farola; CENTRO LIMPIO (la web dibuja la explicación encima)', { vida: BR('cuaderno_accidental', { a: .22, chispa: 0 }).concat(POLVO()) }),
      R3('mariapita', { luz: .5 })),
    /* fondo de los interactivos, del resumen y del ejercicio final */
    mesa: O(I4('cuaderno_mesa', 'DETALLE CENITAL sin personas: el cuaderno de pentagramas de Xoán abierto sobre una mesa de la terraza de noche, con un lápiz, el borde del estuche del saxo y un vaso; luz cálida de farola; CENTRO LIMPIO (la web dibuja el interactivo encima)', { vida: BR('cuaderno_mesa', { a: .2, chispa: 0 }).concat(POLVO('#ffe2b8', 10)) }),
      R3('mariapita', { luz: .45 })),
    /* ── 7 · tocan juntos (bien afinado); la gente se para a escuchar ── */
    duo: O(I4('soportales_duo', 'Noa (' + SAXO + ') y Xoán (' + CLAR + ') tocan juntos bajo los soportales de María Pita, de noche, leyendo cada uno SU parte en el atril plegable; posición de tocar real, concentrados y felices; plano general con los arcos de los soportales', { ocultaPj: ['NOA'], vida: BR('soportales_duo', { chispa: .07 }).concat(SUELO()) }),
      R3('mariapita', { luz: .6 })),
    duoNoa: O(I4('duo_noa', 'Noa toca el ' + SAXO + ' con los ojos cerrados, emocionada; plano medio bajo los soportales de noche; luz cálida de farola en el metal', { ocultaPj: ['NOA'], vida: BR('duo_noa', { chispa: .08 }) }),
      R3('noa_mariapita')),
    duoXoan: O(I4('duo_xoan', XOAN + ' toca el ' + CLAR + ', mira de reojo a Noa con una sonrisa; plano medio; soportales de noche', { vida: BR('duo_xoan', { chispa: .08 }) }),
      R3('mariapita', { luz: .6 })),
    /* (Iago 5-nov 09:18) sin público amontonado (no sale en más planos): una paseante a lo lejos se gira a disfrutarlo */
    paseante: O(I4('soportales_paseante', 'De noche, bajo los soportales de María Pita (2070): UNA paseante se para a unos metros, se gira hacia los soportales y sonríe disfrutando; al fondo, pequeños y desenfocados, Noa y Xoán tocando; nada de público', { vida: BR('soportales_paseante', { chispa: .06 }).concat(SUELO()) }),
      I4('soportales_duo', '')),
    publico: O(I4('soportales_publico', 'La gente se para a escuchar bajo los soportales de María Pita, de noche (2070): caras, edades, pieles y ropas variadas, nadie se parece a Noa; alguno graba con una pulsera; en primer término, desenfocados, los dos músicos', { vida: BR('soportales_publico', { chispa: .06 }).concat(SUELO()) }),
      R3('mariapita', { luz: .6 })),
    miradas: O(I4('duo_miradas', 'Noa y Xoán terminan la última nota y se miran, sonriendo, con los instrumentos aún en posición de tocar; plano a dos de perfil; farolas', { ocultaPj: ['NOA'], vida: BR('duo_miradas', { chispa: .08 }) }),
      R3('noa_mariapita')),
    noaEmocion: O(I4('noa_emocion', 'PRIMER PLANO de Noa, emocionada y cálida, sin llorar, el saxo bajado (no en posición de tocar); mira a Xoán (hacia la derecha); bokeh de farolas', { ocultaPj: ['NOA'], vida: BR('noa_emocion', { chispa: .06 }) }),
      R3('noa_mariapita')),
    /* ── 8 · la despedida (de noche, plaza casi vacía) ── */
    despedida: O(I4('despedida_plaza', 'La ' + PITA + ' de noche, casi vacía: Noa y Xoán de pie junto a la estatua, con los estuches cerrados; el Palacio Municipal iluminado; plano general', { ocultaPj: ['NOA'], vida: BR('despedida_plaza', { chispa: .05 }).concat(SUELO(), FAROLAS(10)) }),
      R3('mariapita', { luz: .5 })),
    xoanSereno: O(I4('despedida_xoan', 'PRIMER PLANO de ' + XOAN + ', sereno y serio, de noche: le dice a Noa que vuelva con su madre; mira a la izquierda; farolas desenfocadas', { vida: BR('despedida_xoan') }),
      R3('mariapita', { luz: .5 })),
    noaDuda: O(I4('despedida_noa', 'PRIMER PLANO de Noa, de noche, dudando, los ojos brillantes: no quiere irse; mira a Xoán (hacia la derecha); nada de brazos cruzados', { ocultaPj: ['NOA'], vida: BR('despedida_noa') }),
      R3('noa_mariapita')),
    xoanSonrisa: O(I4('despedida_xoan_sonrie', 'PRIMER PLANO de ' + XOAN + ', medio sonriendo con ternura («Lo he entendido a la primera»), de noche; mira a la izquierda; distinto gesto que en despedida_xoan', { vida: BR('despedida_xoan_sonrie') }),
      R3('mariapita', { luz: .5 })),
    abrazo: O(I4('despedida_abrazo', 'Noa y Xoán se abrazan en la plaza de María Pita de noche (abrazo de padre e hija con la misma edad, nada que se pueda leer como romance: él le pone la mano en la cabeza), los estuches en el suelo; plano medio', { ocultaPj: ['NOA'], vida: BR('despedida_abrazo', { chispa: .05 }) }),
      R3('mariapita', { luz: .5 })),
    pulsera: O(I4('despedida_pulsera', 'DETALLE: la pulsera de Noa se ilumina en cian con una llamada entrante (pantalla SIN texto), sobre la sudadera, mientras se separa del abrazo; fondo de la plaza de noche desenfocado', { vida: [{ tipo: 'vibra', zona: [.42, .38, .16, .24] }].concat(BR('despedida_pulsera', { chispa: 0 })) }),
      R3('mariapita', { luz: .5 })),
    /* ── 9 · vuelta a 2100: el laboratorio (reservas de T3) ── */
    labAmaro: O(I4('lab_amaro_espera', 'Laboratorio bajo la Torre, de noche: Amaro a la derecha, junto a la consola, espera a Noa y la mira (hacia la izquierda) con una pregunta en la cara; el Transportador apagándose; plano medio', { ocultaPj: ['AMARO'], vida: BR('lab_amaro_espera') }),
      R3('lab_amaro_ablanda', { ocultaPj: ['AMARO'], vida: BR('t3:lab_amaro_ablanda') })),
    labNoa: O(I4('lab_noa_vuelve', 'Laboratorio de noche: Noa a la izquierda, serena y decidida, ya se está colgando el estuche para irse; mira a Amaro (hacia la derecha); nada de brazos cruzados ni de encogerse de hombros', { ocultaPj: ['NOA'], vida: BR('lab_noa_vuelve') }),
      R3('lab_noa_decidida', { ocultaPj: ['NOA'], vida: BR('t3:lab_noa_decidida') })),
    /* ── 10 · casa de la madre (la de T2; Lumi; señales sutiles de la enfermedad: bastón, pastillero, pulsera médica) ── */
    edificio: O(I4('casa_edificio_noche', 'El edificio de la madre junto al Orzán (el de T2), esa misma noche, sin lluvia; una sola ventana encendida', { vida: BR('casa_edificio_noche', { chispa: .04 }).concat(FAROLAS(14)) }),
      R2('casa_edificio', { vida: BR('t2:casa_edificio').concat(FAROLAS(14)) })),
    puerta: O(I4('casa_puerta_noa', 'La puerta de casa de la madre se abre (la de T2): Noa en el umbral, con el estuche del saxo, tímida; Lumi (robot doméstico NO humanoide) a un lado; luz cálida', { ocultaPj: ['NOA'], vida: BR('casa_puerta_noa') }),
      R2('casa_puerta_abre', { vida: BR('t2:casa_puerta_abre') })),
    iria: O(I4('casa_iria_sorpresa', 'Iria (la madre de Noa, la de T2: fiel a su hoja), en bata, sorprendida y cansada; se apoya un poco en un bastón; pulsera médica; mira hacia la puerta (a la izquierda); salón de T2 de noche', { vida: BR('casa_iria_sorpresa') }),
      R2('casa_madre', { vida: BR('t2:casa_madre') })),
    noaLlega: O(I4('casa_noa_llega', 'PRIMER PLANO de Noa en la puerta del salón de su madre, de noche: sonrisa tímida, se quita los auriculares del cuello; mira a la derecha', { ocultaPj: ['NOA'], vida: BR('casa_noa_llega') }),
      R2('casa_general', { vida: BR('t2:casa_general') })),
    abrazoMadre: O(I4('casa_abrazo', 'Iria y Noa se abrazan en el salón (la madre emocionada, ojos cerrados; Noa la abraza con cuidado); Lumi al fondo; luz cálida', { ocultaPj: ['NOA'], vida: BR('casa_abrazo') }),
      R2('casa_dos', { vida: BR('t2:casa_dos') })),
    cena: O(I4('casa_cena', 'Noa y su madre cenan juntas en la mesa del salón de T2 (comida vegetal), hablando y sonriendo; Lumi les sirve; el pastillero inteligente en la mesa; plano general cálido', { ocultaPj: ['NOA'], vida: BR('casa_cena') }),
      R2('casa_lumi_sirve', { vida: BR('t2:casa_lumi_sirve') })),
    ventana: O(I4('casa_ventana', 'Desde fuera, de noche: la ventana iluminada de la casa de la madre; dentro se adivinan dos siluetas a la mesa; el mar del Orzán y la Torre de Hércules lejos (clavada a la real)', { vida: BR('casa_ventana', { chispa: .04 }).concat([{ tipo: 'faro', zona: [.85, .2, .3, 0] }], [{ tipo: 'reflejos', zona: [0, .8, 1, .15], n: 14, color: '#ffe0b0' }]) }),
      R2('casa_edificio', { vida: BR('t2:casa_edificio').concat(FAROLAS(14)) }))
  };
  B._IMG = IMG;
  const FD = (im, s) => Array.isArray(im) ? im.map(x => FD(x, s)) : Object.assign({}, im, { funde: s == null ? 1 : s });

  /* ── láminas en código ── */
  const ARM = { tipo: 'armaduras', titulo: 'Clarinete en Si♭ → saxo alto en Mi♭', izq: { ton: 'Re Mayor', f: 2 }, der: { ton: 'La Mayor', f: 3 }, flecha: '5.ª J ↑',
    cambios: ['+ sol♯'], ens: [6.7, 7.6], total: '1 diferencia' };
  const ACC = { tipo: 'accDif', titulo: 'Los accidentales viajan con su nota', ens: [.34, .52, .76],
    filas: [{ de: 'c/5', deAcc: 'n', a: 'g/5', aAcc: 'n', deTxt: 'do♮', aTxt: 'sol♮', txt: 'Se copia igual: <b>♮ → ♮</b>' },
      { de: 'g#/4', deAcc: '#', a: 'd#/5', aAcc: '#', deTxt: 'sol♯', aTxt: 're♯', txt: 'Se copia igual: <b>♯ → ♯</b>' },
      { de: 'bb/4', deAcc: 'b', a: 'f/5', aAcc: 'n', deTxt: 'si♭', aTxt: 'fa♮', txt: 'Fa es la nota afectada por la diferencia: <b>sube un semitono</b>, ♭ → ♮' }] };

  B.sesion({
    titulo: 'Transporte 4', subtitulo: 'Las diferencias', sup: 'Unidad 9 · 2.º GP',
    recursos: [SF1('sfx_ui_clic'), SF1('sfx_destello'), SF1('sfx_llegada'), SF1('sfx_salto_tiempo'), SF1o('sfx_flash_blanco'), SF1o('sfx_maquina_apaga'), SF1('sfx_impacto'),
      SF1('sfx_pulsera_vibra'), SF1('sfx_notificacion'), SF1('sfx_puerta_scifi'), SF1('sfx_estuche_cierra'), SF1('sfx_llave_saxo'), SF1('sfx_ui_ok'), SF1('sfx_ui_error'), SF1o('sfx_arpa_sube'), SF1o('sfx_arpa_baja'),
      SF('sfx_papel'), SF3('sfx_t3_lapiz_escribe'), SF2('sfx_lumi'), SF2('sfx_plato'), SF2('sfx_puerta_casa'), SF2('sfx_silla'),
      SF('sfx_t4_estuche_abre'), SF('sfx_t4_lapiz'), SF('sfx_t4_aplausos'), SF('sfx_t4_pulsera_llamada'), SF('sfx_t4_abrazo'), SF('sfx_t4_cubiertos'),
      DUO.bien, DUO.mal, 'voz/t4/t4_021b.mp3']
      .concat(Object.keys(IMG).map(k => B.primero(IMG[k])).filter(q => q && !q.falta).map(q => q.src))
      .concat(B.viento.MUESTRAS_RUTAS || [], B.viento.UI_RUTAS || []),
    escenas: [
      /* 0 · Entrada sin palabras: la plaza de María Pita, 2070, justo donde acabó T3 */
      { id: 'e0', titulo: 'Entrada', planos: [
        { id: 'p0', nombre: 'Negro', negro: true, auto: 1, amb: [AMB.plazaBaja, AMB.gaviotasBaja] },
        { id: 'p0a', nombre: 'Plaza de María Pita, 2070', fondoVid: S3 + 'vid/mariapita.mp4', img: IMG.plaza, pj: null, auto: 3.6, amb: PLAZA, mus: MUS.tema,
          claves: { claves: ['Plaza de María Pita · 2070'], ts: [.4], pos: 'arriba' } }
      ] },
      /* 1 · El reencuentro (retoma las cuatro frases del final de T3 y, ahora sí, la cara de Xoán) */
      { id: 'e1', titulo: 'Reencuentro', planos: [
        { id: 'p1a', nombre: 'Iria, ¿dónde te habías metido?', img: IMG.mano, amb: PLAZA, mus: false, pj: null, antes: 1.8,
          lineas: [
            { id: 't4_001', quien: 'XOAN', pj: null, imgs: [{ t: .45, img: IMG.xoanLlama }], texto: 'Iria, ¿dónde te habías metido?', espera: .2 },
            { id: 't4_002', quien: 'NOA', img: IMG.noaGira, pj: null, texto: 'Me confundes. Me llamo Noa.', espera: .3 },
            { id: 't4_003', quien: 'XOAN', img: IMG.xoanPerdona, pj: null, texto: 'Ah, perdona. Pensaba que eras…', sigueEn: 2.35 },   /* (Iago 5-nov) Noa le interrumpe en «eras…» */
            { id: 't4_004', quien: 'NOA', img: IMG.noaSospecha, pj: null, texto: '…Iria se llama mi madre. Espera un momento… ¿Cómo te llamas tú?', espera: .5 },
            { id: 't4_005', quien: 'XOAN', img: IMG.xoanSonrie, pj: null, texto: 'Xoán.', espera: 1.2 },
            { id: 't4_006', quien: 'NARRADOR', img: IMG.dos, imgs: [{ t: 0, img: IMG.dos, vid: 'vid/reencuentro.mp4', vidUnaVez: true }], mus: MUS.tema,
              texto: 'Y así fue como padre e hija se reencontraron… aunque con la misma edad.', espera: 1 }
          ] }
      ] },
      /* 2 · Terrazas de María Pita, horas después (del atardecer a la noche) */
      { id: 'e2', titulo: 'La terraza', planos: [
        { id: 'p2a', nombre: 'Horas después, en una terraza', img: IMG.terraza, amb: TERRAZA, mus: MUS.terraza, pj: null, antes: 1.4,
          lineas: [
            { id: 't4_007', quien: 'NARRADOR', imgs: [{ en: .25, img: IMG.risas }, { en: .45, img: IMG.estuches }, { en: .6, img: IMG.xoanSerio }, { en: .85, img: FD(IMG.terrazaNoche, 1.4) }],
              claves: { claves: ['Horas después'], ts: [.2], pos: 'arriba' },
              texto: 'Pasaron la tarde en una terraza. Hablaron de todo: de música, de la ciudad, de la infancia de Noa, de su madre… y de por qué Noa estaba allí. Xoán tardó en creérselo. Pero al final se lo creyó.', espera: 1.4 }
          ] }
        /* (Iago 4-nov 21:54) fuera el plano suelto «Xoán escucha» (p2b): sobraba; Xoán serio ya sale dentro de t4_007 */
      ] },
      /* 3 · Tocar en la calle, bajo los soportales */
      { id: 'e3', titulo: 'Bajo los soportales', planos: [
        { id: 'p3a', nombre: 'Enséñame esa melodía', img: IMG.xoanPide, amb: SOPORTALES, mus: false, pj: null, antes: .8,
          lineas: [
            { id: 't4_008', quien: 'XOAN', pj: null, texto: 'Si de verdad eres mi hija… enséñame esa melodía. La que dices que te escribiré.', espera: .4 },
            { id: 't4_009', quien: 'NOA', img: IMG.tararea, imgs: [{ en: .45, img: IMG.cuaderno }], pj: null,
              sfx: [{ src: SFx(SF('sfx_t4_lapiz'), SF3('sfx_t3_lapiz_escribe')), en: .45, vol: .5 }],
              texto: 'Así. Pero si la tocamos con tu parte y la mía… no va a sonar igual.', espera: .4 },
            { id: 't4_010', quien: 'XOAN', img: IMG.sacan, pj: null, sfx: [{ src: SFx(SF('sfx_t4_estuche_abre'), SF1('sfx_estuche_cierra')), t: .2, vol: .5 }, { src: SF1('sfx_llave_saxo'), en: .6, vol: .4 }],
              texto: 'Claro: mi clarinete está en si bemol y tu saxo en mi bemol. Hay que pasar mi parte a la tuya.', espera: .5 }
          ] },
        /* (GUION) suena mal a propósito: los dos leen la MISMA partitura (A: mus/t4_duo_mal.mp3, 5,9 s) */
        { id: 'p3b', nombre: 'Así no: la misma partitura', img: IMG.tocanMal, amb: SOPI, mus: false, pj: null, auto: .3,
          inter: { tipo: 'escucha', mp3: DUO.mal, sint: 'mal', img: IMG.tocanMal, otraVez: '↻ Escúchalo otra vez',
            rotulo: 'Los dos leen la <b>misma</b> partitura: la de clarinete',
            texto: 'Los dos leen la <b>misma</b> partitura… y el saxo suena una 5.ª justa más grave que el clarinete. Escúchalo otra vez si quieres.',
            imgs: [{ t: 0, img: IMG.tocanMal }, { t: 4.6, img: IMG.mueca }] } }
      ] },
      /* 4 · Xoán explica las diferencias (láminas en código: armaduras · montaña · accidentales) y el flashback del videojuego */
      { id: 'e4', titulo: 'Las diferencias', planos: [
        { id: 'p4a', nombre: 'Re M → La M', img: IMG.explica, amb: SOPORTALES, mus: MUS.terrazaBaja, pj: null, antes: .6,
          lineas: [
            { id: 't4_011', quien: 'XOAN', lamina: ARM, pj: null, texto: 'Mi parte está en re mayor: dos sostenidos. La tuya tiene que estar en la mayor: tres sostenidos. ¿Cuántas alteraciones cambian?', espera: .3 },
            { id: 't4_012', quien: 'NOA', img: IMG.noaCuenta, pj: null, texto: 'Una. Sale un sostenido más.', espera: .3 },
            { id: 't4_013', quien: 'XOAN', img: IMG.explica, lamina: { tipo: 'escalaDif', titulo: 'Una diferencia ascendente', de: 'Re M', a: 'La M', t: 1.3, rotulos: false }, pj: null,
              texto: 'Eso es una diferencia. Y como hay más sostenidos, es ascendente.', espera: .4 },
            /* (Iago 4-nov 21:58) faltaba decir qué notas quedan afectadas */
            { id: 't4_013b', quien: 'XOAN', img: IMG.explica, pj: null,
              lamina: { tipo: 'afectadas', titulo: 'Notas afectadas · orden de los sostenidos', orden: 's', pasos: [[.3, 0], [6.0, 1], [8.3, 2], [10.9, 1], [11.4, 2], [12.0, 3]] },   /* (Iago 5-nov) tiempos medidos en las pausas de voz/t4/t4_013b.mp3 */
              texto: 'Y una diferencia ascendente afecta a una nota: la primera del orden de los sostenidos, fa. Si fueran dos, serían fa y do; si fueran tres, fa, do y sol.', espera: .8 },
            /* (Iago 5-nov 09:10) la curiosidad: de bemoles a MENOS bemoles también son ascendentes, y afectan fa, do… (tiempos: voz/t4/t4_013f.mp3) */
            { id: 't4_013f', quien: 'XOAN', img: IMG.explica, pj: null,
              lamina: { tipo: 'difAfect', titulo: 'Menos ♭: también ascendentes', de: 'Mi♭ M', a: 'Fa M', t: 4.6, todas: ['Do M', 'Si♭ M'], pasos: [[11.3, 1], [12.05, 2]] },   /* (Iago 09:31) lo curioso: afectan las del orden de los SOSTENIDOS aunque todo sean bemoles */
              texto: 'Y ojo con esto, que es curioso: si pasas a una tonalidad con menos bemoles, las diferencias son ascendentes, y las notas afectadas son las del orden de los sostenidos: fa, do… aunque las dos armaduras tengan bemoles.', espera: .8 },
            /* (Iago 5-nov 07:18) lo saca Noa, y momento de risas */
            { id: 't4_013c', quien: 'NOA', img: IMG.noaCuenta, lamina: null, pj: null, texto: 'Creo que ya lo entiendo… Es como un videojuego al que estuve viciada de niña. Siempre me reñías porque no estudiaba saxo.', espera: .3 },
            { id: 't4_013d', quien: 'XOAN', img: IMG.explica, pj: null, texto: '¿Que yo te reñía? Vaya… qué padre más pesado voy a ser.', espera: .3 }
          ] },
        /* (Iago 4-nov 21:56) el videojuego, dentro de una consola portátil en manos de Noa niña (vídeo incrustado en la pantalla de img/t4/flash_consola) */
        /* FLASHBACK: el videojuego de Modulación (C: vid/flash_montana.mp4 y vid/flash_agua.mp4, 5 s, 1080p; si faltan, sus láminas) */
        { id: 'p4b', nombre: 'Recuerdo · la montaña', img: IMG.flashMontana, recuerdo: true, amb: [AMB.recuerdo], mus: MUS.terrazaBaja, pj: null, antes: .4,
          lineas: [
            /* (Iago 5-nov) lo saca la propia Noa: así Xoán no tiene por qué saber nada del videojuego. Un solo vídeo para las dos frases (sigueEn: sin «Continuar») */
            { id: 't4_013e', quien: 'NOA', imgs: [{ t: 0, img: IMG.flashMontana, vid: 'vid/flash_montana_consola.mp4', vidUnaVez: true }], pj: null, sigueEn: 10.1,   /* voz v2: 9,82 s; el vídeo de la consola dura ahora 23 s (se añadió otra escalada al final) */
              texto: 'Un poco, sí. En ese juego, las tonalidades con más sostenidos estaban arriba, en las montañas, y las de más bemoles, en el fondo del mar.' },   /* (Iago 5-nov 09:10) */
            { id: 't4_014', quien: 'XOAN', lamina: { tipo: 'simbolos', simbolo: '♯', t0: 7.2, cada: .7 }, pj: null, sigueEn: 12.25,
              texto: 'Pues atiende, que esto es un poco raro y complejo. Imagínate que escalas una de esas montañas… Eso son las diferencias ascendentes: cuanto más subes, más sostenidos.' },
            { id: 't4_015', quien: 'XOAN', img: IMG.flashAgua, imgs: [{ t: 0, img: IMG.flashAgua, vid: 'vid/flash_agua_consola.mp4', vidUnaVez: true }],
              lamina: { tipo: 'simbolos', simbolo: '♭', t0: 2.9, cada: .6 }, pj: null,
              texto: 'Y cuando te metes en el agua, hacia abajo… más bemoles. Las diferencias descendentes.', espera: 1 }
          ] },
        { id: 'p4c', nombre: 'Los accidentales', img: IMG.accCuaderno, recuerdo: false, amb: SOPORTALES, mus: MUS.terrazaBaja, pj: null, antes: .5,
          lineas: [
            /* (Iago 22:07 · 5-nov 07:18) los DOS pentagramas (Xoán arriba, Noa abajo) sobre la parte real (cc. 4–7, con sol♯, do♮ y si♭). ens en s:
               armadura «la armadura nueva» 5,2 · cascada «Si en mi parte hay un do becuadro…» 8,2 · letrero «la nota afectada» 16,9 · fa♮ «sino fa becuadro» 20 */
            { id: 't4_016', quien: 'XOAN', lamina: { tipo: 'transpAnim', titulo: 'La parte de Noa, una 5.ª justa más arriba', compases: [3, 7], paso: .25,
                /* (5-nov) cuadrados con la voz nueva (28,8 s, silencedetect): «la armadura nueva» 5,2 · «Si en mi parte…» 8,5 · «sol becuadro» 10,4 · «sol no es la nota afectada… se queda igual» 12,7–16,6 · «este si bemol» 17,4 · «va a parar a fa» 19,3 · «y fa sí es la nota afectada» 20,6 · «sino fa becuadro» 25,2 · «lo ha subido» 27,2 */
                ens: { arm: 5.4, cascada: 8.4, do: 11.2, doDura: 4.9, sib: 17.4, fa: 19.4, afect: 20.7, morfo: 25.4, comp: 27.3 } }, pj: null,
              texto: 'Y ojo: las diferencias solo importan en las notas con alteraciones accidentales; las demás ya las resuelve la armadura nueva. Si en mi parte hay un do becuadro, en la tuya será un sol becuadro: sol no es la nota afectada, así que el becuadro se queda igual. Pero mira este si bemol: va a parar a fa, y fa sí es la nota afectada por la diferencia. Así que no será fa bemol, sino fa becuadro: la diferencia lo ha subido.', espera: 1.4 }
          ] }
      ] },
      /* 5 · Interactivo 1: la montaña de las diferencias */
      { id: 'e5', titulo: 'La montaña', planos: [
        { id: 'p5', nombre: 'La montaña de las diferencias', img: IMG.mesa, amb: SOPI, mus: false, pj: null, auto: .3,
          inter: { tipo: 'montana',
            cartel: '<b>La montaña de las diferencias</b>. Do mayor está al <b>nivel del mar</b>; cada sostenido sube un nivel hacia la <b>cumbre</b> y cada bemol baja uno hacia las <b>profundidades</b>. En cada pareja, coloca las dos tonalidades a su altura, di cuántas diferencias hay, si son <b>ascendentes ↑</b> o <b>descendentes ↓</b> y qué <b>notas quedan afectadas</b>.',
            cartelCorto: 'Toca una tonalidad y después su altura (o arrástrala). Luego, cuántas diferencias y hacia dónde.',
            fin: 'Las diferencias son los niveles que separan las dos armaduras: <b>↑ ascendentes</b> si subes, <b>↓ descendentes</b> si bajas.',
            items: [
              { de: 'Re M', a: 'La M', bien: '¡Exacto! Como la parte de Xoán. ' },
              { de: 'Do M', a: 'Fa M' },
              { de: 'Fa M', a: 'Mi♭ M' },
              { de: 'Sol M', a: 'Mi M' },
              { de: 'Si♭ M', a: 'Re M' },
              { de: 'La M', a: 'Mi♭ M' }
            ] } }
      ] },
      /* 6 · Interactivo 2: pasar la parte (TR_ESC con ♭ ♮ ♯; paso 0; corrección 50/50) */
      { id: 'e6', titulo: 'Pasar la parte', planos: [
        { id: 'p6', nombre: 'La parte de saxo alto', img: IMG.mesa, amb: SOPI, mus: false, pj: null, auto: .3,
          inter: { tipo: 'pasarParte',
            cartel: 'Ahora tú: pasa la parte de clarinete en Si♭ de Xoán (<b>Re mayor</b>) a la parte de <b>saxo alto en Mi♭</b> de Noa: una <b>5.ª justa ascendente</b>. Primero, el <b>paso 0</b>: la tonalidad y la armadura nuevas. Después, <b>✎ Transcribir</b> escribe las notas y tú decides la alteración (♭ ♮ ♯) de las que parpadean; al final, <b>Corregir</b>. Con <b>▶ Los dos a la vez</b> oyes si encajan.',
            cartelCorto: 'Cada nota, una <b>5.ª justa más arriba</b>. Los accidentales se copian igual, salvo en la nota afectada por la diferencia (fa), que sube un semitono.',
            paso0: { titulo: 'Paso 0 · La tonalidad de tu parte', texto: 'La parte de Xoán está en <b>Re mayor</b> (2♯). Tu saxo la necesita una <b>5.ª justa más arriba</b>. ¿En qué tonalidad va tu parte, qué armadura lleva, cuántas diferencias hay, hacia dónde y qué nota queda afectada?',
              bien: '<b>La Mayor</b>, con tres sostenidos: una diferencia ascendente, y la nota afectada es <b>fa</b>.' },
            pistas: { ton: 'Sube la tónica una 5.ª justa: de re, cinco notas hacia arriba.', arm: 'La mayor lleva tres sostenidos: fa, do y sol.',
              dif: 'De 2♯ a 3♯ hay un sostenido más: 1 diferencia ascendente.', afect: 'Una diferencia ascendente afecta a la primera nota del orden de los sostenidos: fa.',
              notas: 'Las notas en rojo no están una 5.ª justa más arriba (cuatro notas por encima en el nombre).',
              acc: 'Revisa los accidentales: el sol♯ pasa a re♯, el do♮ a sol♮ y el si♭ a fa♮ (fa es la nota afectada por la diferencia).' },
            bien: '¡Perfecto! Tu parte de saxo en <b>La M</b> suena igual que la de clarinete de Xoán.', sigueAlAcertar: 1.8 } }
      ] },
      /* 7 · Tocan juntos bajo los soportales (A: mus/t4_duo.mp3, 39 s; 2.ª vuelta a los 17,69 s con el saxo una 3.ª por encima) */
      { id: 'e7', titulo: 'El dúo', planos: [
        { id: 'p7a', nombre: 'Tocan juntos', img: IMG.duo, amb: [AMB.nocheDuo, AMB.soportalesBaja], mus: false, pj: null, auto: .4,
          inter: { tipo: 'escucha', mp3: DUO.bien, sint: 'bien', sigueSolo: true,
            rotulo: 'Clarinete en Si♭ · <b>Re M</b> + saxo alto en Mi♭ · <b>La M</b> = suenan en <b>Do M</b>',
            texto: 'Cada uno lee <b>su</b> parte: el clarinete en Re M y el saxo en La M. Suenan juntos, en Do M.',
            imgs: [{ t: 0, img: IMG.duo, vid: 'vid/tocan.mp4', vidUnaVez: true }, { t: 5.4, img: FD(IMG.duoNoa) }, { t: 10.6, img: FD(IMG.duoXoan) }, { t: 15.4, img: FD(IMG.paseante) }, { t: DUO.vuelta2, img: FD(IMG.duo, .8) },
              { t: 23.4, img: FD(IMG.duoNoa, 1.01) }, { t: 28.4, img: FD(IMG.duoXoan, 1.01) }, { t: 33.4, img: FD(IMG.miradas) }] },
          sfx: [{ src: SF('sfx_t4_aplausos_pocos'), t: DUO.vuelta2 - .3, vol: .2 }] },   /* (Iago 5-nov 09:18) algunos aplauden entre vuelta y vuelta */
        { id: 'p7b', nombre: 'Suena igual', img: IMG.noaEmocion, amb: SOPORTALES, mus: MUS.cierre, pj: null, antes: .6,
          sfx: [{ src: SFx(SF('sfx_t4_aplausos'), SF3('sfx_t3_aplausos')), t: 0, vol: .45 }],
          lineas: [
            { id: 't4_017', quien: 'NOA', pj: null, texto: 'Papá… suena igual que cuando la tocabas en casa para dormirme.', espera: 1 }
          ] }
      ] },
      /* 8 · La despedida (de noche; A: mus/t4_despedida.mp3, el tema en el clarinete solo) */
      { id: 'e8', titulo: 'La despedida', planos: [
        { id: 'p8a', nombre: 'Plaza casi vacía', img: IMG.despedida, amb: NOCHE, mus: MUS.cierre, pj: null, auto: 3 },
        { id: 'p8b', nombre: 'Vuelve con tu madre', img: IMG.xoanSereno, amb: NOCHE, pj: null,
          lineas: [
            { id: 't4_018', quien: 'XOAN', pj: null, texto: 'Oye… vuelve con tu madre. Te necesita. Y no hay tanto tiempo como crees.', espera: .6 },
            { id: 't4_019', quien: 'NOA', img: IMG.noaDuda, pj: null, texto: 'Si me quedo aquí, contigo…', espera: .2 },
            { id: 't4_020', quien: 'XOAN', img: IMG.xoanSonrisa, pj: null, texto: '…acabaría habiendo dos Noas. Tienes que irte, para no crear esa paradoja temporal. Y quiero que cuides de tu madre.', espera: .6 },
            { id: 't4_021', quien: 'NOA', img: IMG.abrazo, pj: null,   /* (Iago 5-nov) «Gracias, papá» en imagen fija, sin vídeo */
              sfx: [{ src: SF('sfx_t4_abrazo'), t: 0, vol: .5 }], texto: 'Gracias, papá.', espera: 2.4 },
            /* Amaro llama por la pulsera (sin id en el guion: t4_021b; ⚠ falta su voz) */
            { id: 't4_021b', quien: 'AMARO', img: IMG.pulsera, mus: false,   /* (Iago 5-nov) la pulsera corta en seco la banda sonora */ nombre: 'Pulsera · Amaro', filtro: 'telefono', pj: { q: 'AMARO', pose: 'tableta', lado: 'der', marco: 'llamada' },
              sfx: [{ src: SF1('sfx_pulsera_vibra'), t: 0, vol: .7 }, { src: SFx(SF('sfx_t4_pulsera_llamada'), SF1('sfx_notificacion')), t: .15, vol: .5 }],
              texto: 'Noa… es la hora.', espera: 1 }
          ] }
      ] },
      /* 9 · Vuelta a 2100 (túnel 2070 → 2100) → laboratorio, breve */
      { id: 'e9', titulo: 'Vuelta a 2100', planos: [
        { id: 'p9a', nombre: 'Túnel', tunel: { de: 2070, a: 2100 }, dur: 4, mus: MUS.viaje, amb: [], sfx: [{ src: SF1('sfx_salto_tiempo'), t: 0 }] },
        { id: 'p9b', nombre: 'Vuelta al laboratorio', video: S1 + 'vid/vuelta.mp4', tunel: { de: 2070, a: 2100 }, dur: 5, blanco: 1.1, amb: [AMB.labBajo],
          sfx: [{ src: SF1('sfx_salto_tiempo'), t: 0, vol: .6 }, { src: SF1('sfx_destello'), t: 3.6, vol: .9 }, { src: SF1('sfx_llegada'), t: 3.9, vol: 1.1 }, { src: SF1('sfx_impacto'), t: 3.9, vol: .5 }, { src: SF1o('sfx_maquina_apaga'), t: 4.4, vol: .6 }] },
        { id: 'p9c', nombre: '¿Lo encontraste?', img: IMG.labAmaro, amb: LABA, mus: false, pj: null, antes: 1,
          lineas: [
            { id: 't4_022', quien: 'AMARO', pj: { q: 'AMARO', pose: 'explica' }, texto: '¿Lo encontraste?', espera: .6 },
            { id: 't4_023', quien: 'NOA', img: IMG.labNoa, pj: { q: 'NOA', pose: 'emocion' }, sfx: [{ src: SF1('sfx_estuche_cierra'), en: .7, vol: .4 }],
              texto: 'Sí. Y ahora tengo que ir a otro sitio.', espera: .8 }
          ] }
      ] },
      /* 10 · Casa de la madre (la de T2): abrazo y cena, SIN música (Iago) */
      { id: 'e10', titulo: 'Cena con mamá', planos: [
        { id: 'p10a', nombre: 'El edificio de la madre', img: IMG.edificio, amb: [AMB.casaBaja, AMB.mar], mus: MUS.casa, pj: null, auto: 3.2 },
        { id: 'p10b', nombre: 'La puerta se abre', img: IMG.puerta, amb: CASA, pj: null, auto: 2.6,
          sfx: [{ src: SF1('sfx_puerta_scifi'), t: .1, vol: .6 }, { src: SF2('sfx_lumi'), t: 1.1, vol: .2 }] },
        { id: 'p10c', nombre: 'Siempre hay sitio', img: IMG.iria, amb: CASA, pj: null, antes: .3,
          lineas: [
            { id: 't4_024', quien: 'MADRE', pj: null, texto: '¿Noa? ¿Qué haces aquí tan tarde?', espera: .5 },
            { id: 't4_025', quien: 'NOA', img: IMG.noaLlega, pj: null, texto: 'Venía a cenar contigo. Si todavía hay sitio.', espera: .6 },
            { id: 't4_026', quien: 'MADRE', img: IMG.abrazoMadre, pj: null, texto: 'Siempre hay sitio.', espera: 2.2 }
          ] },
        { id: 'p10d', nombre: 'La cena', img: FD(IMG.cena, 1.2), amb: CASA, pj: null, antes: 2.6,
          sfx: [{ src: SF2('sfx_silla'), t: .2, vol: .5 }, { src: SF2('sfx_lumi'), t: 1.2, vol: .15 }, { src: SFx(SF('sfx_t4_cubiertos'), SF2('sfx_plato')), t: 1.8, vol: .4 }],
          lineas: [
            { id: 't4_027', quien: 'NARRADOR', imgs: [{ en: .55, img: FD(IMG.ventana, 1.6) }], amb: [AMB.casaBaja, AMB.mar],
              texto: 'Ninguna máquina puede sustituir el tiempo que pasamos con quien queremos. Ni siquiera una que viaja en el tiempo.', espera: 1.8 }
          ] }
      ] },
      /* 11 · Resumen del narrador (láminas en código; ⚠ t4_028–t4_030 no están en el guion: redactadas por D, faltan sus voces) */
      { id: 'e11', titulo: 'Por diferencias', planos: [
        { id: 'p11', nombre: 'Resumen', img: IMG.mesa, amb: SOPI, mus: MUS.resumen, pj: null, antes: .6,
          lineas: [
            /* (Iago 5-nov 09:21) refuerzo visual: las alteraciones aparecen o se van, con flecha (tiempos medidos en voz/t4/t4_028.mp3) */
            { id: 't4_028', quien: 'NARRADOR', lamina: { tipo: 'reglaDif', titulo: 'Las diferencias', ens: { arm: .4, asc: 6.8, s1: 7.2, b1: 8.2, desc: 10.45, b2: 10.9, s2: 11.9 } },
              texto: 'Transportar por diferencias es comparar las dos armaduras: cuántas alteraciones cambian y hacia dónde. Si hay más sostenidos o menos bemoles, son ascendentes; si hay más bemoles o menos sostenidos, descendentes.', espera: .8 },
            { id: 't4_029', quien: 'NARRADOR', lamina: { tipo: 'tablaDif', titulo: 'Transporte por diferencias', ens: [0, .08, .25, .45, .65, .85] },
              texto: 'Las notas afectadas se cuentan en el orden de las alteraciones: fa, do, sol… si son ascendentes; si, mi, la… si son descendentes. Pero ojo: esto solo se aplica a las notas que llevan alteraciones accidentales; las demás ya las resuelve la armadura nueva.', espera: 1 },
            { id: 't4_030', quien: 'NARRADOR', lamina: Object.assign({}, ACC, { titulo: 'Y los accidentales', filas: [ACC.filas[2], ACC.filas[0], ACC.filas[1]], ens: [6.0, 11.9, 14.1] }),   /* (Iago 5-nov) primero si♭→fa, como dice el texto; tiempos medidos en la voz */
              texto: 'Si una nota afectada lleva una alteración accidental, esa alteración sube o baja un semitono: por eso el si bemol pasa a fa becuadro. Las demás alteraciones accidentales no cambian: el do becuadro pasa a sol becuadro, y el sol sostenido, a re sostenido.', espera: 1.4 }
          ] }
      ] },
      /* 12 · Ejercicio final OPCIONAL (generador por diferencias, 3 niveles; el 3.º con accidentales) → «Transportarnos al menú principal» */
      { id: 'e12', titulo: 'Ejercicio final', planos: [
        { id: 'p12', nombre: 'Ejercicio final (opcional)', img: IMG.mesa, amb: SOPI, pj: null, auto: .3,
          inter: { tipo: 'difFinal', opcional: true,
            niveles: [
              /* (Iago 22:10) las tres con alteraciones accidentales; afect: al menos una cae en una nota afectada y tiene que cambiar */
              { keys: ['Do', 'Sol', 'Fa', 'Re'], tr: [0, 4, 7], comp: ['2/4', '3/4'], sin: ['16', 'qd'], maxF: 3, dif: 2, acc: 2, afect: true },
              { keys: null, tr: [0, 1, 3, 4, 5, 7, 8, 9, 10], comp: ['2/4', '3/4', '6/8'], sin: ['16'], maxF: 4, acc: 2, afect: true },
              { keys: null, tr: [0, 1, 3, 4, 5, 7, 8, 9, 10], comp: ['2/4', '3/4', '6/8'], sin: ['16'], maxF: 4, acc: 3, afect: true }
            ],
            cartel: 'Si quieres, practica el <b>transporte por diferencias</b>: <b>tres melodías</b>, cada una más difícil y todas con <b>alteraciones accidentales</b>. En cada una, el <b>paso 0</b> (tonalidad nueva, armadura, diferencias y notas afectadas) vale la mitad de la nota; las notas, la otra mitad. Con <b>✎ Transcribir</b> se escriben solas y tú defines las que <b>parpadean</b> (cada decisión se corrige al momento; cuenta el primer intento). Al final verás tu nota.',
            cartelCorto: 'Coloca cada nota transportada, con sus alteraciones. Después, <b>Corregir</b> (una sola vez).' } }
      ] }
    ]
  });
})(window.TR);
