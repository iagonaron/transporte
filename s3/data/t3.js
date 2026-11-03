/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 3 · «El transporte mental» — datos de la sesión (GUION-S3.md v2, 3-nov 20:20)
   Mismo formato que data/t2.js. Novedades de T3:
     · I3('clave', 'descripción del plano') → img/t3/<clave>.webp (1920×1080, ayudante C). Mientras falta, su MARCADOR;
       en el laboratorio, la lámina de T2/T1 que sirve de reserva (?marcas=1 enseña los marcadores aunque haya reserva)
     · voces en voz/t3/t3_XXX.mp3 (ayudante B) · música mus/t3_*.mp3 (A) · efectos sfx/sfx_t3_*.mp3 y amb_t3_*.mp3 (B):
       si aún no están, no suenan (y no rompen nada)
     · interactivos nuevos: repaso (js/repaso.js) · claves, mental, recital, mentalFinal (js/mental.js)
     · cierre: negro → «Continuará» → «Transportarnos al menú principal» (motor.js · S.continuara)
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  B.CFG = { blipConVoz: false, marcaFalta: true, voz: 'voz/t3/' };
  const PJ1 = '../s1/img/t1/pj/';
  B.PJ = {
    NOA: { nombre: 'Noa', color: '#7fd4ff', lado: 'izq', alto: .86, dir: PJ1, _: 'neutra', poses: ['neutra', 'aburrida', 'traviesa', 'sorpresa', 'pensativa', 'emocion'],
      mira: { neutra: 'izq', aburrida: 'izq', traviesa: 'izq', sorpresa: 'izq', pensativa: 'izq', emocion: 'izq' } },
    AMARO: { nombre: 'Dra. Amaro', color: '#c9b6ff', lado: 'der', alto: .84, dir: PJ1, _: 'explica', poses: ['explica', 'tableta', 'alarma', 'helada'],
      mira: { explica: 'izq', tableta: 'der', alarma: 'der', helada: 'der' } },
    /* personajes nuevos de T3: sin pose PNG (salen en las láminas de C); el chico, sólo voz y la mano en la imagen */
    REGIDORA: { nombre: 'Regidora', color: '#ff9f7a', lado: 'der', poses: [] },
    CANTANTE: { nombre: 'Cantante', color: '#f3a6d6', lado: 'der', poses: [] },
    PIANISTA: { nombre: 'Pianista', color: '#bfe38a', lado: 'der', poses: [] },
    CHICO: { nombre: 'Chico', color: '#9fe8c8', lado: 'der', poses: [] }
  };
  B.SFX_NIVEL = {
    sfx_alarma: [-16.6, -17], sfx_anillo_encaja: [-26.4, -22], sfx_anillos_giran: [-16.3, -19], sfx_destello: [-17.4, -20], sfx_estuche_cierra: [-19.7, -18],
    sfx_llegada: [-13, -18], sfx_maquina_arranca: [-10.2, -18], sfx_notificacion: [-16.7, -21], sfx_pasos_rapidos: [-23.8, -19],
    sfx_puerta_scifi: [-9.9, -19], sfx_pulsera_vibra: [-4.3, -20], sfx_radio_interferencia: [-12.7, -22], sfx_salto_tiempo: [-15.3, -17],
    sfx_ui_clic: [-17.9, -28], sfx_ui_error: [-16.3, -24], sfx_ui_ok: [-22.1, -24]
  };
  const MARCAS = B.param('marcas') === '1';
  /* rutas: T3 propias (s3/sfx, s3/mus) · comunes de T1 (../s1/…) · láminas de T2 de reserva (../s2/img/t2/) */
  const S1 = '../s1/', S2 = '../s2/', SF1 = n => S1 + 'sfx/' + n + '.mp3', SF1o = n => B.existe(SF1(n)) ? SF1(n) : SF1(n + '_sint');
  const SF = n => 'sfx/' + n + '.mp3', SFo = n => B.existe(SF(n)) ? SF(n) : SF(n + '_sint');
  /* el primero que exista de una lista de efectos (los de B con su nombre; si no, uno parecido de T1) */
  const SFx = function () { const l = [].slice.call(arguments); for (let i = 0; i < l.length; i++) if (B.existe(l[i])) return l[i]; return l[0]; };
  const AMB = {
    lab: { src: SF1('amb_laboratorio'), vol: .34 }, labBajo: { src: SF1('amb_laboratorio'), vol: .16 }, mar: { src: SF1('amb_mar_noche'), vol: .2 },
    bastidores: { src: [SF('sfx_t3_bastidores'), SF1('amb_pasillo')], vol: .34 }, camerino: { src: [SF('sfx_t3_camerino_zumbido'), SF1('amb_pasillo')], vol: .3 },
    sala: { src: [SF('sfx_t3_murmullo_sala'), SF1('amb_orquesta_afinando')], vol: .4 }, salaBaja: { src: [SF('sfx_t3_murmullo_sala'), SF1('amb_orquesta_afinando')], vol: .14 },
    pasillo: { src: [SF('sfx_t3_bastidores'), SF1('amb_pasillo')], vol: .18 },
    plaza: { src: [SF('sfx_t3_plaza_atardecer'), SF1('amb_ciudad2100')], vol: .4 }, plazaBaja: { src: [SF('sfx_t3_plaza_atardecer'), SF1('amb_ciudad2100')], vol: .2 }
  };
  const MUS = {
    lab: { src: [{ src: S1 + 'mus/mus_tension.mp3', vol: .16 }] },
    tension: { src: [{ src: S1 + 'mus/mus_tension.mp3', vol: .4 }] },
    viaje: { src: [{ src: S1 + 'mus/mus_viaje.mp3', vol: .55, bucle: false }] },
    teatro: { src: [{ src: 'mus/t3_mus_bastidores.mp3', vol: .4 }, { src: S1 + 'mus/mus_coruna2100.mp3', vol: .18 }] },   // (A) bucle sin costura, ya discreto
    teatroBajo: { src: [{ src: 'mus/t3_mus_bastidores.mp3', vol: .24 }, { src: S1 + 'mus/mus_coruna2100.mp3', vol: .1 }] },
    resumen: { src: [{ src: S1 + 'mus/mus_coruna2100.mp3', vol: .16 }] },
    bronca: { src: [{ src: S1 + 'mus/mus_tension.mp3', vol: .14 }] },
    padre: { src: [{ src: S1 + 'mus/t1_tema_sint.mp3', vol: .22 }] },
    plaza: { src: [{ src: 'mus/t3_mus_pita.mp3', vol: .5, bucle: false }, { src: S1 + 'mus/mus_cierre.mp3', vol: .3 }] }   // (A) 47 s: a los 36,7 s se queda suspendida (t3_027)
  };
  /* la canción del recital (A): el original en Re M (con el agudo roto) y la transportada a Do M; si faltan, js/mental.js la toca con el piano */
  const CANCION = { do: 'mus/t3_cancion_do.mp3', roto: 'mus/t3_cancion_re_rota.mp3', c1: 4.8 };   // (A, audio/t3/LISTA.md) 2 compases de piano: el c. 1 empieza a los 4,80 s; cada compás 2,25 s
  B._CANCION = CANCION;

  /* ── láminas (PLANOS-T3.md, ayudante C). desc = lo que dice el marcador mientras falta. ocultaPj: quien ya sale en la lámina ── */
  const N = k => 'img/t3/' + k + '.webp', T1 = k => S1 + 'img/t1/' + k + '.webp', T2 = k => S2 + 'img/t2/' + k + '.webp';
  const O = MARCAS ? (a => a) : function () { return [].concat.apply([], arguments); };
  const POLVO = c => [{ tipo: 'polvo', zona: [0, 0, 1, 1], n: 14, color: c || '#ffe2b8' }];
  const LAB = POLVO('#cfe8ff'), FOCO = (x, y, w, h) => [{ tipo: 'respira', zona: [x, y, w, h], color: '#ffd9a0', vel: 1.2 }];
  const I3 = (k, desc, o) => Object.assign({ src: N(k), desc: desc }, o || {});
  const IMG = {
    /* ── 1 · laboratorio, de noche, justo después de T2 ── */
    labNoche: O(I3('lab_noche', 'Laboratorio bajo la Torre, de noche, justo después de T2: el Transportador en reposo (anillos tenues), el cuaderno del padre abierto en la mesa, Noa a la izquierda y Amaro a la derecha junto a la consola; plano general, luz azul baja', { ocultaPj: ['NOA', 'AMARO'], vida: [{ tipo: 'anillos', zona: [.36, .05, .3, .6], n: 2 }].concat(LAB) }),
      { src: T2('lab_noche_noa'), vida: [{ tipo: 'anillos', zona: [.3, .1, .4, .7], n: 2 }].concat(LAB) }),
    amaroCalibra: O(I3('lab_amaro_calibra', 'Amaro a la derecha junto a la consola, mira a Noa (hacia la izquierda), seria pero tranquila, una mano sobre el panel; plano medio; luz cian de la consola', { ocultaPj: ['AMARO'], vida: LAB }),
      { src: T2('lab_amaro_firme'), ocultaPj: ['AMARO'], vida: LAB }),
    noaCansada: O(I3('lab_noa_cansada', 'Noa a la izquierda, plano medio, cansada e incrédula, mira a Amaro (hacia la derecha); el pelo todavía húmedo de Santiago, auriculares al cuello', { ocultaPj: ['NOA'], vida: LAB }),
      { src: T2('lab_noa_sonrisa'), ocultaPj: ['NOA'], vida: LAB }),
    consola: O(I3('consola_holo', 'DETALLE sin personas: la consola holográfica del Transportador se enciende; paneles cian y ámbar flotando en los bordes, CENTRO LIMPIO (la web dibuja el repaso encima)', { vida: [{ tipo: 'parpadeo', zona: [.05, .1, .9, .7], color: '#9fe4ff' }] }),
      { src: T1('prueba_consola'), vida: [{ tipo: 'traza', zona: [.40, .48, .33, .07], periodo: .16 }, { tipo: 'parpadeo', zona: [.38, .33, .36, .25], color: '#9fe4ff' }] }),
    amaroSonrie: O(I3('lab_amaro_sonrie', 'Amaro, primer plano, sonríe a medias mirando la consola (hacia la izquierda); el reflejo cian del «100 %» en la cara', { ocultaPj: ['AMARO'], vida: LAB }),
      { src: T2('lab_amaro_firme'), ocultaPj: ['AMARO'], vida: LAB }),
    amaroDestino: I3('lab_amaro_destino', 'Amaro teclea el destino en la consola; sobre ella flota un holograma con la fachada del Teatro Rosalía de Castro; Noa al fondo a la izquierda, brazos cruzados', { ocultaPj: ['AMARO', 'NOA'], vida: [{ tipo: 'parpadeo', zona: [.3, .1, .4, .5], color: '#9fe4ff' }].concat(LAB) }),
    holoRosalia: I3('holo_rosalia', 'DETALLE: holograma cian de la fachada real del Teatro Rosalía de Castro (A Coruña) con «2026» en el panel; fondo del laboratorio desenfocado', { vida: [{ tipo: 'parpadeo', zona: [.2, .1, .6, .7], color: '#9fe4ff' }, { tipo: 'traza', zona: [.25, .82, .5, .02], periodo: .2 }] }),
    noaResopla: O(I3('lab_noa_resopla', 'Noa, primer plano, pone los ojos en blanco y murmura para sí; luz de los anillos que empiezan a girar detrás', { ocultaPj: ['NOA'], vida: LAB }),
      { src: T2('lab_noa_brazos'), ocultaPj: ['NOA'], vida: LAB }),
    maquina: { src: T1('prueba_cerca'), vida: [{ tipo: 'anillos', zona: [.2, 0, .65, .78], n: 3 }, { tipo: 'pulso', zona: [.42, .1, .18, .3], color: '#58b8ff' }].concat(LAB) },
    /* ── 2 · Teatro Rosalía de Castro, 2026 ── */
    fachada: I3('rosalia_fachada', 'Exterior REAL del Teatro Rosalía de Castro (rúa Riego de Agua, A Coruña) al anochecer de 2026: fachada iluminada, cartel del recital, gente entrando; fiel a las fotos reales', { vida: [{ tipo: 'luces', zona: [.15, .25, .7, .4], n: 14, color: '#ffe2b0' }] }),
    llegada: I3('bastidores_llegada', 'Entre bastidores: telón rojo, cuerdas y contrapesos, luces de trabajo azules; Noa aparece entre anillos de luz (último fotograma del vídeo de llegada)', { ocultaPj: ['NOA'], vida: [{ tipo: 'anillos', zona: [.3, .4, .4, .4], n: 2, color: '#9fe4ff' }] }),
    bastidores: I3('bastidores', 'Bastidores del Rosalía, plano general SIN Noa: telón rojo por detrás, varas y cuerdas, luces de trabajo azules, dos técnicos al fondo; centro algo despejado', { vida: POLVO('#cfe0ff') }),
    regidora: I3('regidora_prisa', 'La REGIDORA (mujer de unos 40, auriculares de diadema con micro, carpeta, ropa negra de técnica) llega con prisa y le pone un pinganillo a Noa; plano a dos: Noa a la izquierda, la regidora a la derecha mirando hacia ella', { ocultaPj: ['NOA'], vida: POLVO('#cfe0ff') }),
    noaCarpeta: I3('noa_carpeta', 'Noa, plano medio, con el pinganillo puesto y una carpeta en las manos, desconcertada; mira hacia la derecha (por donde se ha ido la regidora); luz azul de bastidores', { ocultaPj: ['NOA'], vida: POLVO('#cfe0ff') }),
    pasillo: I3('pasillo_camerinos', 'Pasillo de camerinos del teatro: puertas numeradas, la del «2» entreabierta con luz cálida; Noa de espaldas camina hacia ella con la carpeta', { vida: FOCO(.55, .2, .2, .5) }),
    /* ── 3 · el camerino 2 ── */
    camerino: I3('camerino', 'Camerino 2, plano general: espejo con bombillas a la derecha, piano vertical a la izquierda (teclas negras en grupos de 2 y 3) con la partitura en el atril; la CANTANTE de pie junto al espejo y el PIANISTA sentado al piano; luz cálida', { vida: FOCO(.6, .1, .3, .4).concat(POLVO()) }),
    agudo: I3('cantante_agudo', 'La CANTANTE (soprano de unos 35, PELIRROJA con ondas sueltas, vestido de concierto azul noche, fular al cuello, fiel a su hoja) intenta el agudo y se lleva la mano a la garganta: la voz se le rompe; plano medio; mira al frente', { vida: POLVO() }),
    panico: I3('cantante_panico', 'La cantante, primer plano, al borde del pánico, ronca; mira hacia la izquierda (a Noa y al pianista)', { vida: POLVO() }),
    cantanteCanta: I3('cantante_canta', 'Ensayo en el camerino: la cantante canta junto al piano vertical con la voz tomada, una mano en el fular, gesto de esfuerzo; el pianista toca mirando a las teclas (2+3); plano medio, luz cálida', { vida: POLVO() }),
    noaEscucha: I3('noa_escucha', 'Noa escucha desde la puerta del camerino con la carpeta, preocupada al oír a la cantante; mira hacia la derecha', { ocultaPj: ['NOA'], vida: POLVO() }),
    noaCamerino: I3('noa_camerino', 'Noa en la puerta del camerino con la carpeta, plano medio, se atreve a proponer algo; mira hacia la derecha', { ocultaPj: ['NOA'], vida: POLVO() }),
    pianistaReloj: I3('pianista_reloj', 'El PIANISTA (hombre de unos 55, canoso, gafas, chaqueta oscura, tranquilo y con oficio) mira su reloj de pulsera sentado al piano vertical; plano medio; mira hacia la izquierda', { vida: POLVO() }),
    duda: I3('cantante_duda', 'La cantante, plano medio, incrédula, se vuelve hacia el pianista (mira a la izquierda); mano en el fular', { vida: POLVO() }),
    pianistaAtril: I3('pianista_atril', 'El pianista señala con calma la partitura del atril, sonríe apenas; mira a la cantante (hacia la derecha); plano medio corto; teclado 2+3 visible', { vida: POLVO() }),
    atril: I3('atril_partitura', 'DETALLE oblicuo SIN caras: la partitura en el atril del piano vertical (papel claro, CENTRO LIMPIO: la web dibuja la lámina encima); abajo, las manos del pianista apoyadas en las teclas (negras en grupos de 2 y 3)', { vida: FOCO(.2, .05, .6, .4) }),
    manos: I3('manos_teclas', 'DETALLE: las manos del pianista tocando (teclas negras en grupos de 2 y 3, anatomía correcta), luz cálida, poca profundidad de campo', { vida: FOCO(.2, .3, .6, .4) }),
    ensayo: I3('camerino_ensayo', 'Ensayo en el camerino: el pianista toca el piano vertical, la cantante canta bajito a su lado, Noa a la izquierda mira la partitura por encima del hombro del pianista; plano general cálido', { ocultaPj: ['NOA'], vida: POLVO() }),
    /* ── 4 · el recital ── */
    aviso: I3('bastidores_aviso', 'Noa entre bastidores, a contraluz, una mano en el pinganillo, mira hacia el escenario iluminado (a la derecha); detrás, el telón rojo', { ocultaPj: ['NOA'], vida: POLVO('#ffe2b8') }),
    sala: I3('sala_rosalia', 'La sala REAL del Teatro Rosalía vista desde el escenario: patio de butacas lleno, palcos en herradura con molduras doradas, la lámpara central; las luces de sala bajan; fiel a las fotos reales', { vida: [{ tipo: 'luces', zona: [.05, .05, .9, .5], n: 20, color: '#ffe2b0' }] }),
    recital: I3('recital', 'El recital desde un lateral del escenario: la cantante canta junto al piano de cola (teclas 2+3), el pianista toca mirando a las teclas; foco cálido, público en penumbra', { vida: FOCO(.35, .1, .3, .5) }),
    recitalCantante: I3('recital_cantante', 'La cantante, plano medio en el escenario, canta el agudo con gesto de alivio; foco cálido, fondo oscuro', { vida: FOCO(.3, .05, .4, .5) }),
    recitalPianista: I3('recital_pianista', 'El pianista de perfil en el piano de cola, concentrado en las teclas (2+3), transportando en la cabeza; la partitura en el atril; foco cálido', { vida: FOCO(.3, .1, .4, .4) }),
    publico: I3('sala_publico', 'El público del Rosalía escucha en penumbra, emocionado; caras, edades y ropas variadas (nadie se parece a Noa)', { vida: POLVO('#ffe2b8') }),
    aplausos: I3('sala_aplausos', 'El público del Rosalía en pie, aplaudiendo; palcos llenos; caras y edades variadas (nadie se parece a Noa); la cantante y el pianista saludan en primer término, de espaldas', { vida: [{ tipo: 'luces', zona: [.05, .05, .9, .5], n: 16, color: '#ffe2b0' }] }),
    pasilloCantante: I3('pasillo_cantante', 'Pasillo de bastidores: la cantante, con un ramo de flores, se acerca agradecida a Noa (Noa a la izquierda, de tres cuartos); la cantante mira hacia ella', { ocultaPj: ['NOA'], vida: POLVO() }),
    pasilloNoa: I3('pasillo_noa', 'Noa, primer plano, sonrisa tímida al decir su nombre; pasillo de bastidores con luz de trabajo; mira hacia la derecha', { ocultaPj: ['NOA'], vida: POLVO() }),
    pasilloRegidora: I3('pasillo_regidora', 'La regidora al fondo del pasillo, contrariada, señala a Noa con la carpeta; mira hacia la izquierda', { vida: POLVO() }),
    escabulle: I3('pasillo_escabulle', 'Noa se escabulle por el pasillo hacia una puerta de servicio, mira atrás con media sonrisa; su pulsera se ilumina en cian', { ocultaPj: ['NOA'], vida: [{ tipo: 'parpadeo', zona: [.3, .45, .15, .15], color: '#9fe4ff' }] }),
    escenario: I3('escenario_vacio', 'El escenario del Rosalía vacío tras el recital: el piano de cola cerrado con la partitura en el atril, un solo foco encendido; CENTRO LIMPIO para las láminas', { vida: FOCO(.3, .2, .4, .5).concat(POLVO('#ffe2b8')) }),
    /* ── 5 · vuelta y bronca (laboratorio) ── */
    amaroSeria: O(I3('lab_amaro_seria', 'Amaro a la derecha, seria y fría, con la pantalla del registro abierta a su lado; mira a Noa (hacia la izquierda); laboratorio de noche', { ocultaPj: ['AMARO'], vida: LAB }),
      { src: T2('lab_amaro_sospecha'), ocultaPj: ['AMARO'], vida: LAB }),
    registro: O(I3('registro_pantalla', 'DETALLE: la pantalla del registro del Transportador, sin texto (la web pone las líneas y la coordenada borrada); cian sobre negro', { ocultaPj: ['AMARO'], vida: [{ tipo: 'parpadeo', zona: [.1, .1, .5, .6], color: '#9fe4ff' }] }),
      { src: T2('registro_dos'), ocultaPj: ['AMARO'], vida: [{ tipo: 'parpadeo', zona: [.1, .1, .5, .6], color: '#9fe4ff' }] }),
    noaCulpa: O(I3('lab_noa_culpa', 'Noa a la izquierda, mira al suelo, culpable; plano medio; luz azul baja', { ocultaPj: ['NOA'], vida: LAB }),
      { src: T2('lab_noa_brazos'), ocultaPj: ['NOA'], vida: LAB }),
    amaroEnfadada: O(I3('lab_amaro_enfadada', 'Amaro, plano medio, dolida y enfadada, gesto abierto con la mano; mira a la izquierda', { ocultaPj: ['AMARO'], vida: LAB }),
      { src: T2('lab_amaro_sospecha'), ocultaPj: ['AMARO'], vida: LAB }),
    noaCuaderno: O(I3('lab_noa_cuaderno', 'Noa abraza el cuaderno de su padre contra el pecho, con los ojos húmedos; mira a Amaro (hacia la derecha)', { ocultaPj: ['NOA'], vida: LAB }),
      { src: T2('lab_cuaderno'), vida: LAB }),
    cuadernoFechas: O(I3('cuaderno_fechas', 'DETALLE: página del cuaderno del padre con fechas y coordenadas a mano y un boceto de la plaza de María Pita con sus soportales (la web escribe el rótulo)', { vida: POLVO() }),
      { src: T2('cuaderno_otra'), vida: POLVO() }),
    amaroAblanda: O(I3('lab_amaro_ablanda', 'Amaro, primer plano, se ablanda: suspira y casi sonríe; mira a la izquierda', { ocultaPj: ['AMARO'], vida: LAB }),
      { src: T2('lab_dos'), ocultaPj: ['NOA', 'AMARO'], vida: LAB }),
    recuerdo: I3('recuerdo_terraza', 'RECUERDO (tonos cálidos, bordes suaves): Noa de niña (unos 8 años) con su padre Xoán adulto (fiel a su hoja, clarinete en Si♭) en una terraza de la plaza de María Pita al atardecer, sacando los instrumentos', { vida: POLVO('#ffe2b8') }),
    noaDecidida: O(I3('lab_noa_decidida', 'Noa, primer plano, decidida y serena, mira a Amaro (hacia la derecha)', { ocultaPj: ['NOA'], vida: LAB }),
      { src: T2('lab_noa_brazos'), ocultaPj: ['NOA'], vida: LAB }),
    pulsera: I3('pulsera_mensaje', 'DETALLE: la muñeca de Noa con la pulsera encendida (un mensaje entrante, la pantalla SIN texto: la web lo escribe al lado); fondo del laboratorio desenfocado', { vida: [{ tipo: 'vibra', zona: [.4, .35, .2, .25] }, { tipo: 'parpadeo', zona: [.38, .3, .25, .35], color: '#ffc48a' }] }),
    noaAparta: O(I3('lab_noa_aparta', 'Noa aparta la vista de la pulsera y baja la mano sin contestar; mira hacia la consola (a la derecha); luz azul', { ocultaPj: ['NOA'], vida: LAB }),
      { src: T2('lab_noche_noa'), vida: LAB }),
    juntas: O(I3('lab_juntas', 'Noa y Amaro, juntas ante la consola, preparan el salto; el Transportador se enciende; plano a dos (Noa a la izquierda, Amaro a la derecha)', { ocultaPj: ['NOA', 'AMARO'], vida: [{ tipo: 'anillos', zona: [.3, .05, .4, .6], n: 3 }].concat(LAB) }),
      { src: T2('lab_dos'), ocultaPj: ['NOA', 'AMARO'], vida: [{ tipo: 'anillos', zona: [.38, .05, .3, .6], n: 3 }].concat(LAB) }),
    /* ── 6 · plaza de María Pita, 2070 ── */
    plaza: I3('mariapita', 'Plaza de María Pita en 2070 al atardecer, tal como es hoy: el Palacio Municipal, los soportales, terrazas con gente (caras variadas, nadie se parece a Noa); apenas algún detalle de futuro cercano; plano general fiel a la plaza real', { vida: [{ tipo: 'luces', zona: [.05, .35, .9, .35], n: 16, color: '#ffe2b0' }] }),
    noaPlaza: I3('noa_mariapita', 'Noa de tres cuartos de espaldas, en la plaza, mira las terrazas con emoción contenida; contraluz de atardecer; los soportales detrás', { ocultaPj: ['NOA'], vida: POLVO('#ffe2b8') }),
    mano: I3('mano_hombro', 'DETALLE: la mano de un chico joven se apoya en el hombro de Noa (su sudadera), SIN cara; atardecer en María Pita, desenfocado', { ocultaPj: ['NOA'], vida: [] }),
    noaHelada: I3('noa_helada', 'Noa, primer plano, helada, sin girarse; los ojos muy abiertos; luz de atardecer; la mano todavía en su hombro, al borde del encuadre', { ocultaPj: ['NOA'], vida: [] })
  };
  B._IMG = IMG;

  /* ── láminas en código ── */
  const REG = { tipo: 'registro', titulo: 'Registro · coordenadas',
    filas: [{ a: 'Santiago de Compostela', b: 'no programada', estado: 'parpadea' }, { a: '42.88 · −8.54 · ████', b: 'borrada · recuperada', estado: 'parpadea', t: 3.4 }] };
  const ARM = { tipo: 'armaduras', titulo: '1 · Piensa en la tonalidad nueva y su armadura', izq: { ton: 'Re Mayor', f: 2 }, der: { ton: 'Do Mayor', f: 0 }, flecha: '2.ª M ↓',
    cambios: ['Fuera los dos sostenidos'], ens: [3.2], total: null };

  B.sesion({
    titulo: 'Transporte 3', subtitulo: 'El transporte mental', sup: 'Unidad 9 · 2.º GP',
    continuara: 'Continuará…',
    recursos: [SF1('sfx_ui_clic'), SF1('sfx_destello'), SF1('sfx_llegada'), SF1('sfx_salto_tiempo'), SF1o('sfx_flash_blanco'), SF1o('sfx_maquina_apaga'), SF1('sfx_impacto'),
      SF1('sfx_anillos_giran'), SF1('sfx_maquina_arranca'), SF1('sfx_anillo_encaja'), SF1('sfx_pulsera_vibra'), SF1('sfx_notificacion'), SF1('sfx_puerta_scifi'), SF1('sfx_pasos_rapidos'), SF1('sfx_ui_ok'), SF1('sfx_ui_error'),
      SFo('sfx_papel'), SF('sfx_t3_voz_rota'), SF('sfx_t3_aplausos'), SF('sfx_t3_pinganillo_clic'), SF('sfx_t3_pasos_pasillo'), SF('sfx_t3_telon'), SF('sfx_t3_pulsera_notif')]
      .concat(Object.keys(IMG).map(k => B.primero(IMG[k])).filter(q => q && !q.falta).map(q => q.src))
      .concat(B.viento.MUESTRAS_RUTAS || [], B.viento.UI_RUTAS, B.t3.pianoRutas(), [CANCION.do, CANCION.roto]),
    escenas: [
      /* 0 · Arranque sin palabras: el laboratorio de noche, justo donde acabó T2 */
      { id: 'e0', titulo: 'Entrada', planos: [
        { id: 'p0', nombre: 'Negro', negro: true, auto: 1, amb: [AMB.labBajo, AMB.mar], mus: MUS.lab },
        { id: 'p0a', nombre: 'El laboratorio, esa misma noche', img: IMG.labNoche, pj: null, auto: 4, amb: [AMB.lab, AMB.mar] }
      ] },
      /* 1 · La calibración de Noa (repaso de T1 y T2 en la consola holográfica) */
      { id: 'e1', titulo: 'Calibración', planos: [
        { id: 'p1a', nombre: 'Amaro: una calibración', img: IMG.amaroCalibra, amb: [AMB.lab], mus: MUS.lab, pj: null, antes: .4,
          lineas: [
            { id: 't3_001', quien: 'AMARO', pj: { q: 'AMARO', pose: 'tableta' }, texto: 'Bueno. Antes de volver a encender nada, vamos a ver si lo de Santiago se te ha quedado.' },
            { id: 't3_002', quien: 'NOA', img: IMG.noaCansada, pj: { q: 'NOA', pose: 'aburrida' }, texto: '¿Un examen? ¿Ahora?', espera: .4 },
            { id: 't3_003', quien: 'AMARO', img: IMG.amaroCalibra, imgs: [{ en: .7, img: IMG.consola }], pj: { q: 'AMARO', pose: 'explica' }, sfx: [{ src: SF1('sfx_destello'), en: .68, vol: .5 }],
              texto: 'Una calibración. Para ti.', espera: .8 }
          ] },
        { id: 'p1b', nombre: 'Repaso en la consola', img: IMG.consola, amb: [AMB.labBajo], mus: MUS.lab, pj: null, auto: .3,
          inter: { tipo: 'repaso',
            cartel: 'La consola del Transportador va a <b>calibrarte</b>: tres pruebas rápidas sobre lo que ya sabes. Une cada instrumento con su afinación y con lo que suena cuando lee Do, responde cuatro preguntas de transporte escrito y separa sus ventajas y desventajas.',
            cartelCorto: 'Toca una ficha y después su hueco (o arrástrala). Si no encaja, vuelve a su sitio: prueba otra vez.' } },
        { id: 'p1c', nombre: 'Amaro sonríe a medias', img: IMG.amaroSonrie, amb: [AMB.lab], pj: null, auto: 2.6, sfx: [{ src: SF1('sfx_anillo_encaja'), t: .1, vol: .5 }] }
      ] },
      /* 2 · Amaro elige el destino */
      { id: 'e2', titulo: 'El destino', planos: [
        { id: 'p2a', nombre: 'Hoy elijo yo', img: IMG.amaroDestino, amb: [AMB.lab], mus: MUS.lab, pj: null,
          lineas: [
            { id: 't3_004', quien: 'AMARO', pj: { q: 'AMARO', pose: 'tableta' }, imgs: [{ en: .42, img: IMG.holoRosalia }], sfx: [{ src: SF1('sfx_ui_clic'), t: .4 }, { src: SF1('sfx_ui_clic'), t: .7 }, { src: SF1('sfx_destello'), en: .4, vol: .5 }],
              texto: 'Hoy elijo yo. Nada de siglos. Un concierto en el Teatro Rosalía, en 2026. Un sitio tranquilo. ¿Qué podría salir mal?',
              claves: { claves: ['Teatro Rosalía · 2026'], ens: [.45], pos: 'arriba' } },
            { id: 't3_005', quien: 'NOA', img: IMG.noaResopla, pj: { q: 'NOA', pose: 'traviesa' }, texto: 'Eso ya lo has dicho otras veces…', espera: .5 }
          ] },
        { id: 'p2b', nombre: 'El Transportador se activa', img: IMG.maquina, amb: [AMB.lab], mus: MUS.tension, pj: null, auto: 3.4,
          sfx: [{ src: SF1('sfx_maquina_arranca'), t: .1 }, { src: SF1('sfx_anillos_giran'), t: 1.2 }] }
      ] },
      /* 3 · El salto y la llegada a bastidores del Rosalía */
      { id: 'e3', titulo: 'Teatro Rosalía, 2026', planos: [
        { id: 'p3a', nombre: 'El salto', tunel: { de: 2100, a: 2026 }, dur: 5, blanco: 2.2, sfxBlanco: SF1o('sfx_flash_blanco'), amb: [], mus: MUS.tension, sfx: [{ src: SF1('sfx_salto_tiempo'), t: 0 }] },
        { id: 'p3b', nombre: 'Llegada entre bastidores', video: 'vid/llegada_bastidores.mp4', img: IMG.llegada, desc: 'Runway 1080p (5 s): Noa aparece entre bastidores, telón rojo y luces de trabajo azules', dur: 5, auto: 4, pj: null,
          amb: [AMB.bastidores], mus: MUS.teatroBajo, sfx: [{ src: SF1('sfx_llegada'), t: 0 }] },
        { id: 'p3c', nombre: 'Bastidores', funde: 1, img: IMG.fachada, amb: [AMB.bastidores], mus: MUS.teatro, pj: null, antes: .5,
          lineas: [
            { id: 't3_006', quien: 'NARRADOR', imgs: [{ en: .56, img: IMG.bastidores }], texto: 'A Coruña, 2026. Teatro Rosalía de Castro. Faltan quince minutos para el recital.',
              claves: { claves: ['A Coruña · 2026', 'Teatro Rosalía de Castro'], ens: [.05, .42], pos: 'arriba' }, espera: .6 },
            { id: 't3_007', quien: 'REGIDORA', img: IMG.regidora, sfx: [{ src: SF1('sfx_pasos_rapidos'), t: 0, vol: .5 }, { src: SFx(SF('sfx_t3_pinganillo_clic'), SF1('sfx_ui_clic')), en: .25, vol: .7 }],
              texto: '¡Por fin! Tú eres la de prácticas, ¿no? Toma la carpeta y ve al camerino dos. Quince minutos.' },
            { id: 't3_008', quien: 'NOA', img: IMG.noaCarpeta, pj: { q: 'NOA', pose: 'sorpresa' }, texto: 'Eh… sí. Claro. Camerino dos.', espera: .5 }
          ] },
        { id: 'p3d', nombre: 'Pasillo de camerinos', img: IMG.pasillo, amb: [AMB.pasillo], mus: MUS.teatroBajo, pj: null, auto: 3.2,
          sfx: [{ src: SFx(SF('sfx_t3_pasos_pasillo'), SF1('sfx_pasos_rapidos')), t: .1, vol: .7 }] }
      ] },
      /* 4 · El camerino: la cantante, afónica, no llega al agudo */
      { id: 'e4', titulo: 'El camerino', planos: [
        { id: 'p4a', nombre: 'Camerino 2', img: IMG.camerino, amb: [AMB.camerino], mus: false, pj: null, auto: 2.4 },
        /* (A) la canción original en Re M con la voz tomada: el la5 (c. 13) se quiebra a los 32,4 s y el pianista para */
        { id: 'p4b', nombre: 'Ensayo · el agudo se rompe', img: IMG.cantanteCanta, amb: [AMB.camerino], mus: false, pj: null, auto: .2,
          inter: { tipo: 'recital', mp3: CANCION.roto, c1: CANCION.c1, rotulo: 'Tonalidad original · <b>Re M</b>', sinMp3: 'agudo', sfx: SF('sfx_t3_voz_rota'), sigue: true,
            imgs: [{ c: 0, img: IMG.cantanteCanta }, { c: 3, img: IMG.manos }, { c: 6, img: IMG.noaEscucha }, { c: 9, img: IMG.cantanteCanta }, { t: 31.7, img: IMG.agudo }] } },
        { id: 'p4c', nombre: '¿Hay que suspender?', img: IMG.panico, amb: [AMB.camerino], mus: MUS.teatroBajo, pj: null,
          lineas: [
            { id: 't3_009', quien: 'CANTANTE', texto: 'No llego. Hoy no llego al agudo. ¡Hay que suspender!', espera: .3 },
            { id: 't3_010', quien: 'NOA', img: IMG.noaCamerino, pj: { q: 'NOA', pose: 'pensativa' }, texto: '¿Y si se la bajamos? Yo sé reescribirla en otra tonalidad…' },
            { id: 't3_011', quien: 'PIANISTA', img: IMG.pianistaReloj,               texto: 'En quince minutos no da tiempo a copiar nada. Pero no hace falta: te la toco más grave leyendo esta misma partitura.',
              claves: { claves: ['La misma partitura'], ens: [.78], pos: 'arriba' } },
            { id: 't3_012', quien: 'CANTANTE', img: IMG.duda, texto: '¿Sin escribirla?', espera: .3 },
            { id: 't3_013', quien: 'PIANISTA', img: IMG.pianistaAtril, texto: 'Sin escribirla. Lo hago en la cabeza mientras toco.',
              claves: { claves: ['En la cabeza'], ens: [.55], pos: 'arriba' }, espera: .5 }
          ] }
      ] },
      /* 5 · El pianista se lo explica a Noa (láminas dibujadas en código) */
      { id: 'e5', titulo: 'En la cabeza', planos: [
        { id: 'p5a', nombre: 'Cómo se transporta en la cabeza', img: IMG.atril, amb: [AMB.camerino], mus: false, pj: null, antes: .4,
          lineas: [
            { id: 't3_014', quien: 'PIANISTA', lamina: ARM,
              laminas: [{ en: .5, lamina: { tipo: 'melodias', titulo: '2 · Cada nota, el mismo intervalo más abajo', ex: null, mel: 'cancion', compases: [0, 3], paso: .5, t0: .4, inst: 'piano' } }],
              texto: 'Primero piensas en la tonalidad nueva y en su armadura. Luego lees cada nota y tocas la que está el mismo intervalo más abajo. Lo que cuenta no es cada nota, sino el dibujo: subir, bajar, saltar.', espera: .6 },
            { id: 't3_014b', quien: 'PIANISTA', lamina: { tipo: 'fantasma', titulo: 'Un truco · la clave de do en 4.ª', compases: [0, 3], t: 1.2, tNombres: 4.6 },
              texto: 'Y un truco: si te ayuda, imagina que la partitura está en clave de do en cuarta. Cada nota cae justo una segunda más abajo; solo tienes que cambiar la armadura y tocarla una octava más arriba.', espera: 1 }
          ] }
      ] },
      /* 6 · Interactivo 1b: leer por claves (clave de do en 4.ª, armadura de Do M, una 8.ª más arriba) */
      { id: 'e6', titulo: 'Por claves', planos: [
        { id: 'p6', nombre: 'Leer en clave de do en 4.ª', img: IMG.atril, amb: [AMB.camerino], mus: false, pj: null, auto: .3,
          inter: { tipo: 'claves', compases: [0, 3], ejemplo: 1,
            cartel: 'Prueba el truco del pianista: lee cada nota iluminada como si estuviera en <b>clave de do en 4.ª</b>, con la armadura de <b>Do mayor</b> (sin alteraciones), y tócala en el teclado. Suena <b>una octava más arriba</b> de lo que lees en esa clave. La primera ya está hecha.',
            cartelCorto: 'Lee la nota en <b>clave de do en 4.ª</b> (4.ª línea = Do) y tócala. Teclado del ordenador: <b>A S D F G H J</b> = Do Re Mi Fa Sol La Si.' } }
      ] },
      /* 7 · Interactivo 2: transporte mental en tiempo real, con el teclado (ensayo con el pianista) */
      { id: 'e7', titulo: 'Ensayo', planos: [
        { id: 'p7', nombre: 'Transporte mental en tiempo real', img: IMG.ensayo, amb: [AMB.camerino], ambInter: [], mus: false, pj: null, auto: .3,
          inter: { tipo: 'mental',
            tempos: [{ nombre: 'Lento', bpm: 50, compases: [0, 8], espera: true, guia: true }, { nombre: 'Medio', bpm: 66, compases: [0, 16], guia: false }, { nombre: 'De concierto', bpm: 80, compases: [0, 16], guia: false }],
            cartel: 'Ensaya con el pianista. La partitura está en <b>Re mayor</b>; tú tocas cada nota <b>una 2.ª mayor más grave</b> (en <b>Do mayor</b>, sin alteraciones) antes de que pase el cursor. Tres tempos: <b>lento</b> (el cursor te espera), <b>medio</b> y <b>de concierto</b>. Los fallos no restan: sigue tocando.',
            cartelCorto: 'Toca cada nota <b>una 2.ª M más grave</b> antes de que pase el cursor. Ratón o teclado: <b>A S D F G H J</b> = Do Re Mi Fa Sol La Si.' } }
      ] },
      /* 8 · El recital: la canción, transportada; el agudo llega; el público aplaude */
      { id: 'e8', titulo: 'El recital', planos: [
        { id: 'p8a', nombre: 'Sala, tres, dos, uno…', img: IMG.aviso, amb: [AMB.sala], mus: false, pj: null, antes: .5,
          lineas: [
            { id: 't3_014c', quien: 'NOA', sfx: [{ src: SFx(SF('sfx_t3_pinganillo_clic'), SF1('sfx_ui_clic')), t: 0, vol: .7 }], texto: 'Sala, tres, dos, uno…', espera: .6 }
          ] },
        { id: 'p8b', nombre: 'La sala', img: IMG.sala, amb: [AMB.salaBaja], mus: false, pj: null, auto: 4.6, sfx: [{ src: SF('sfx_t3_telon'), t: .2, vol: .7 }] },
        { id: 'p8c', nombre: 'El recital · Do M', img: IMG.recital, amb: [], mus: false, pj: null, auto: .2,
          inter: { tipo: 'recital', mp3: CANCION.do, c1: CANCION.c1, rotulo: 'Tonalidad transportada · <b>Do M</b> · una 2.ª M más grave',
            imgs: [{ c: 0, img: IMG.recital }, { c: 3, img: IMG.recitalPianista }, { c: 6, img: IMG.publico }, { c: 9, img: IMG.manos }, { c: 12, img: IMG.recitalCantante }, { c: 15, img: IMG.recital }] } },
        { id: 'p8d', nombre: 'Aplausos', img: IMG.aplausos, amb: [AMB.sala], mus: false, pj: null, auto: 4.2,
          sfx: [{ src: SF('sfx_t3_aplausos'), t: 0, vol: 1 }] },
        { id: 'p8e', nombre: 'En el pasillo', img: IMG.pasilloCantante, amb: [AMB.pasillo], mus: MUS.teatroBajo, pj: null,
          lineas: [
            { id: 't3_015', quien: 'CANTANTE', texto: 'Gracias, de verdad. ¿Cómo te llamas?' },
            { id: 't3_015b', quien: 'NOA', img: IMG.pasilloNoa, pj: { q: 'NOA', pose: 'emocion' }, texto: 'Noa.', espera: .4 },
            { id: 't3_015c', quien: 'REGIDORA', img: IMG.pasilloRegidora, texto: '¡La de prácticas no se llama Noa!', espera: .2 }
          ] },
        { id: 'p8f', nombre: 'Noa se escabulle', img: IMG.escabulle, amb: [AMB.pasillo], mus: MUS.teatroBajo, pj: null, auto: 3.4,
          sfx: [{ src: SF1('sfx_pasos_rapidos'), t: 0, vol: .6 }, { src: SF1('sfx_pulsera_vibra'), t: 1.6, vol: .5 }] }
      ] },
      /* 9 · Resumen del narrador */
      { id: 'e9', titulo: 'Transporte mental', planos: [
        { id: 'p9', nombre: 'Resumen', img: IMG.escenario, amb: [AMB.salaBaja], mus: MUS.resumen, pj: null, antes: .5,
          lineas: [
            { id: 't3_016', quien: 'NARRADOR', lamina: { tipo: 'mentalDef', titulo: 'Transporte mental', t: .5 },
              texto: 'Transportar mentalmente es leer la partitura original y tocarla, a la vez, en otra tonalidad.', espera: .6 },
            { id: 't3_017', quien: 'NARRADOR', lamina: { tipo: 'balanza', titulo: 'Transporte mental',
                izq: { tit: 'Desventajas', items: ['Es difícil', 'Exige mucha práctica'], ens: [.12, .26] },
                der: { tit: 'Ventajas', items: ['Es inmediato', 'Sirve la misma partitura de siempre'], ens: [.62, .78] } },
              texto: 'Sus desventajas: es difícil y exige mucha práctica. Sus ventajas: es inmediato y sirve la misma partitura de siempre.', espera: 1 }
          ] }
      ] },
      /* 10 · Vuelta y bronca: Amaro descubre lo de las coordenadas; Noa confiesa */
      { id: 'e10', titulo: 'Sin más secretos', planos: [
        { id: 'p10a', nombre: 'Túnel', tunel: { de: 2026, a: 2100 }, dur: 4, mus: MUS.viaje, amb: [], sfx: [{ src: SF1('sfx_salto_tiempo'), t: 0 }] },
        { id: 'p10b', nombre: 'Vuelta al laboratorio', video: S1 + 'vid/vuelta.mp4', tunel: { de: 2026, a: 2100 }, dur: 5, blanco: 1.1, amb: [AMB.labBajo],
          sfx: [{ src: SF1('sfx_salto_tiempo'), t: 0, vol: .6 }, { src: SF1('sfx_destello'), t: 3.6, vol: .9 }, { src: SF1('sfx_llegada'), t: 3.9, vol: 1.1 }, { src: SF1('sfx_impacto'), t: 3.9, vol: .5 }, { src: SF1o('sfx_maquina_apaga'), t: 4.4, vol: .6 }] },
        { id: 'p10c', nombre: 'La bronca', img: IMG.amaroSeria, amb: [AMB.lab], mus: MUS.bronca, pj: null, antes: 1,
          lineas: [
            { id: 't3_018', quien: 'AMARO', pj: { q: 'AMARO', pose: 'helada' }, imgs: [{ en: .22, img: IMG.registro }, { en: .9, img: IMG.amaroSeria }], laminas: [{ en: .22, lamina: REG }, { en: .9, lamina: null }],
              texto: 'Noa. He encontrado esto. La coordenada de Santiago no la puse yo. Y alguien borró otra.', espera: .4 },
            { id: 't3_019', quien: 'NOA', img: IMG.noaCulpa, pj: { q: 'NOA', pose: 'pensativa' }, texto: 'Fui yo. Lo siento, Amaro. De verdad.', espera: .8 },
            { id: 't3_020', quien: 'AMARO', img: IMG.amaroEnfadada, pj: { q: 'AMARO', pose: 'alarma' }, texto: 'Te he mandado a sitios donde podías hacerte daño. ¡Confiaba en ti!', espera: .5 },
            { id: 't3_021', quien: 'NOA', img: IMG.noaCuaderno, mus: MUS.padre, pj: { q: 'NOA', pose: 'emocion' }, imgs: [{ en: .74, img: IMG.cuadernoFechas }],
              laminas: [{ en: .74, lamina: { tipo: 'texto', txt: 'Xoán · fechas y destinos', x: .7, y: .2, rot: -3, estilo: B.existe(N('cuaderno_fechas')) || B.existe(T2('cuaderno_otra')) ? 'tinta' : 'holo' } }],
              texto: 'Ya lo sé. Es que… creo que con esta máquina podría volver a ver a mi padre. Por eso la empezó él. Sus fechas están en el cuaderno.', espera: .8 },
            { id: 't3_022', quien: 'AMARO', img: IMG.amaroAblanda, lamina: null, pj: { q: 'AMARO', pose: 'explica' }, texto: '…Venga. Vamos a intentarlo. Pero juntas, y sin más secretos. ¿Dónde crees que podrías encontrarlo?', espera: .4 },
            { id: 't3_023', quien: 'NOA', img: IMG.recuerdo, pj: { q: 'NOA', pose: 'emocion' }, texto: 'En la plaza de María Pita. Íbamos allí después del laboratorio: él se pedía algo en una terraza y sacábamos los instrumentos.',
              claves: { claves: ['Plaza de María Pita'], ens: [.08], pos: 'arriba' } },
            { id: 't3_024', quien: 'AMARO', img: IMG.amaroAblanda, pj: { q: 'AMARO', pose: 'explica' }, texto: '¿Y cuándo?', espera: .3 },
            { id: 't3_025', quien: 'NOA', img: IMG.noaDecidida, pj: { q: 'NOA', pose: 'neutra' }, texto: 'Cuando tenía mi edad. En 2070.', claves: { claves: ['2070'], ens: [.62], pos: 'arriba' }, espera: .6 }
          ] },
        /* 🤖💡 pista sutil de la madre: un mensaje en la pulsera que Noa aparta sin contestar (texto en pantalla, sin voz) */
        { id: 'p10d', nombre: 'Un mensaje de mamá', img: IMG.pulsera, amb: [AMB.labBajo], mus: MUS.lab, pj: null, auto: 4.4,
          aviso: { de: 'Mamá', txt: '¿Vienes a cenar?', tipo: 'mama' }, sfx: [{ src: SF1('sfx_pulsera_vibra'), t: .05, vol: .7 }, { src: SFx(SF('sfx_t3_pulsera_notif'), SF1('sfx_notificacion')), t: .2, vol: .6 }],
          imgs: [{ t: 2.6, img: IMG.noaAparta }], al: [{ t: 2.4, fn: () => B.capas.aviso(null) }] }
      ] },
      /* 11 · Ejercicio final OPCIONAL: transporte mental con el generador (3 niveles) */
      { id: 'e11', titulo: 'Ejercicio final', planos: [
        { id: 'p11', nombre: 'Ejercicio final (opcional)', img: IMG.consola, amb: [AMB.labBajo], mus: false, pj: null, auto: .3,
          inter: { tipo: 'mentalFinal',
            cartel: 'Antes del último viaje, si quieres, practica el transporte mental: <b>tres melodías nuevas</b>, cada una un poco más difícil. Mira el intervalo, piensa la tonalidad nueva y toca cada nota transportada en el teclado. Al final verás tu nota.',
            cartelCorto: 'Toca cada nota transportada en el teclado. <b>A S D F G H J</b> = Do Re Mi Fa Sol La Si · <b>W E T Y U</b> = las negras.' } }
      ] },
      /* 12 · El viaje final: plaza de María Pita, 2070 (cliffhanger) */
      { id: 'e12', titulo: 'María Pita, 2070', planos: [
        { id: 'p12a', nombre: 'Juntas, ante la consola', img: IMG.juntas, amb: [AMB.lab], mus: MUS.tension, pj: null, auto: 3.4,
          sfx: [{ src: SF1('sfx_maquina_arranca'), t: .1 }, { src: SF1('sfx_anillos_giran'), t: 1.2 }] },
        { id: 'p12b', nombre: 'El salto a 2070', tunel: { de: 2100, a: 2070 }, dur: 5, blanco: 2.2, sfxBlanco: SF1o('sfx_flash_blanco'), amb: [], mus: MUS.tension, sfx: [{ src: SF1('sfx_salto_tiempo'), t: 0 }] },
        { id: 'p12c', nombre: 'Plaza de María Pita, 2070', fondoVid: 'vid/mariapita.mp4', img: IMG.plaza, amb: [AMB.plaza], mus: MUS.plaza, pj: null, antes: 3.2,
          sfx: [{ src: SF1('sfx_llegada'), t: 0, vol: .7 }],
          lineas: [
            { id: 't3_026', quien: 'NOA', img: IMG.noaPlaza, pj: { q: 'NOA', pose: 'emocion' }, texto: 'He querido venir aquí… porque aquí éramos felices.', claves: { claves: ['Plaza de María Pita · 2070'], ts: [.2], pos: 'arriba' }, espera: 1.4 }
          ] },
        { id: 'p12d', nombre: 'Una mano en el hombro', img: IMG.mano, amb: [AMB.plazaBaja], mus: false, pj: null, antes: 1.6,
          imgs: [{ t: 0, img: IMG.mano, vid: 'vid/mano.mp4', vidUnaVez: true }],
          lineas: [
            { id: 't3_027', quien: 'CHICO', texto: '¿Iria? ¿Eres tú?', espera: .8 },
            { id: 't3_028', quien: 'NOA', img: IMG.noaHelada, pj: null, texto: 'Iria… Así se llama mi madre.', espera: 1.6 }
          ] },
        { id: 'p12e', nombre: 'Negro', negro: true, auto: 1.4, amb: [], mus: false, pj: null }
      ] }
    ]
  });
})(window.TR);
