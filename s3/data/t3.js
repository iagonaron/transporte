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
    NOA: { nombre: 'Noa', color: '#7fd4ff', lado: 'izq', alto: .86, dir: PJ1, _: 'neutra', poses: ['neutra', 'aburrida', 'traviesa', 'sorpresa', 'pensativa', 'emocion', 'arrepentida'],
      rutas: { arrepentida: 'img/t3/pj/noa_arrepentida.png' },
      mira: { neutra: 'izq', aburrida: 'izq', traviesa: 'izq', sorpresa: 'izq', pensativa: 'izq', emocion: 'izq', arrepentida: 'izq' } },
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
,
    /* (4-nov, «que no haya escenas planas») capas nuevas, sintetizadas en bucle sin costura (sfx/amb_t3_*.mp3, −22…−25 LUFS):
       el zumbido del Transportador, pitidos de consola espaciados al azar, el mar lejano bajo la Torre, crujidos de madera y
       cuerdas del teatro y gaviotas lejanas. Volúmenes discretos: quedan 10–20 dB por debajo de la voz */
    zumbido: { src: SF('amb_t3_transportador'), vol: .2 }, zumbidoBajo: { src: SF('amb_t3_transportador'), vol: .1 },
    consola: { src: SF('amb_t3_consola'), vol: .18 }, consolaBaja: { src: SF('amb_t3_consola'), vol: .09 },
    marLejos: { src: SF1('amb_mar_noche'), vol: .06 },
    crujidos: { src: SF('amb_t3_crujidos'), vol: .22 }, crujidosBajo: { src: SF('amb_t3_crujidos'), vol: .12 },
    gaviotas: { src: SF('amb_t3_gaviotas'), vol: .16 }, gaviotasBaja: { src: SF('amb_t3_gaviotas'), vol: .08 }
  };
  /* laboratorio: con voz (LABA), de fondo (LABB) y en los interactivos (LABI: sin pitidos, para no confundir el oído) */
  const LABA = [AMB.lab, AMB.zumbido, AMB.consola, AMB.marLejos], LABB = [AMB.labBajo, AMB.zumbidoBajo, AMB.consolaBaja, AMB.marLejos],
    LABI = [AMB.labBajo, AMB.zumbidoBajo, AMB.marLejos];
  const MUS = {
    lab: { src: [{ src: S1 + 'mus/mus_tension.mp3', vol: .16 }] },
    tension: { src: [{ src: S1 + 'mus/mus_tension.mp3', vol: .4 }] },
    viaje: { src: [{ src: S1 + 'mus/mus_viaje.mp3', vol: .55, bucle: false }] },
    teatro: { src: [{ src: 'mus/t3_mus_bastidores.mp3', vol: .4 }, { src: S1 + 'mus/mus_coruna2100.mp3', vol: .18 }] },   // (A) bucle sin costura, ya discreto
    teatroBajo: { src: [{ src: 'mus/t3_mus_bastidores.mp3', vol: .24 }, { src: S1 + 'mus/mus_coruna2100.mp3', vol: .1 }] },
    resumen: { src: [{ src: S1 + 'mus/mus_coruna2100.mp3', vol: .16 }] },
    bronca: { src: [{ src: S1 + 'mus/mus_tension.mp3', vol: .14 }] },
    padre: { src: [{ src: S1 + 'mus/t1_tema_sint.mp3', vol: .22 }] },
    plaza: { src: [{ src: 'mus/t3_mus_pita.mp3', vol: .5, bucle: false }, { src: S1 + 'mus/mus_cierre.mp3', vol: .3 }] },
    /* (Iago 4-nov) el final: clímax sobre el tema de Noa (A, 29,0 s). golpe = segundo del GOLPE en el fichero (audio/t3/LISTA.md · tiempos_t3.json
       t3_mus_final.golpe_s); en = segundo en que entra cada voz (sus huecos en la música). Si A rehace la música, cambiar SOLO estos números */
    final: { src: [{ src: 'mus/t3_mus_final.mp3', vol: .55, bucle: false }, { src: 'mus/t3_mus_pita.mp3', vol: .5, bucle: false }, { src: S1 + 'mus/mus_cierre.mp3', vol: .3 }], golpe: 23.45,
      en: { t3_026: 1.6, mano: 5.8, t3_027: 7.6, t3_028: 10.4, t3_029: 13.6, t3_030: 18.3 } }   // silencio total de 23,05 a 23,45; el acorde se apaga hacia 28,5 s
  };
  /* la canción del recital (A): el original en Re M (con el agudo roto) y la transportada a Do M; si faltan, js/mental.js la toca con el piano */
  const CANCION = { do: 'mus/t3_cancion_do.mp3', roto: 'mus/t3_cancion_re_rota.mp3', c1: 4.8 };   // (A, audio/t3/LISTA.md) 2 compases de piano: el c. 1 empieza a los 4,80 s; cada compás 2,25 s
  B._CANCION = CANCION;

  /* ── láminas (PLANOS-T3.md, ayudante C). desc = lo que dice el marcador mientras falta. ocultaPj: quien ya sale en la lámina ── */
  const N = k => 'img/t3/' + k + '.webp', T1 = k => S1 + 'img/t1/' + k + '.webp', T2 = k => S2 + 'img/t2/' + k + '.webp';
  const O = MARCAS ? (a => a) : function () { return [].concat.apply([], arguments); };
  const POLVO = c => [{ tipo: 'polvo', zona: [0, 0, 1, 1], n: 14, color: c || '#ffe2b8' }];
  const LAB = POLVO('#cfe8ff'), FOCO = (x, y, w, h) => [{ tipo: 'respira', zona: [x, y, w, h], color: '#ffd9a0', vel: 1.2 }];
  /* (4-nov, «vida» de T3) LUCES REALES de cada lámina, detectadas por brillo en img/t3/*.webp (las 24 recortadas a 16:9, ya sobre la imagen nueva): [x, y, radio del halo, color].
     BR(clave, opciones) → capa «brillos» (js/vida.js): cada luz tintinea con su propio ritmo aleatorio, sutil */
  const LZ = {
    lab_noche: [[0.2697, 0.2945, 16, '#ffd59a'], [0.3183, 0.4611, 9, '#ffd59a'], [0.3377, 0.0825, 9, '#ffd59a'], [0.2529, 0.1461, 10, '#ffd59a'], [0.9173, 0.111, 11, '#ffd59a'], [0.5157, 0.276, 7, '#ffb35a'], [0.719, 0.2237, 8, '#ffb35a'], [0.2752, 0.8458, 9, '#ffd59a'], [0.4193, 0.7389, 8, '#8fe6ff'], [0.5752, 0.7632, 7, '#ffd59a'], [0.7492, 0.7425, 8, '#8fe6ff'], [0.4282, 0.6274, 6, '#8fe6ff'], [0.7397, 0.6297, 6, '#8fe6ff'], [0.9322, 0.8003, 9, '#8fe6ff'], [0.9553, 0.6708, 5, '#8fe6ff']],
    lab_amaro_calibra: [[0.7725, 0.0318, 12, '#ffd59a'], [0.4294, 0.1882, 10, '#ffd59a'], [0.844, 0.349, 8, '#ffd59a'], [0.3151, 0.1692, 8, '#ffb35a'], [0.2946, 0.4649, 7, '#ffb35a'], [0.8022, 0.7755, 5, '#8fe6ff'], [0.8452, 0.7823, 5, '#8fe6ff'], [0.8642, 0.7914, 5, '#8fe6ff'], [0.9471, 0.8218, 5, '#8fe6ff'], [0.9638, 0.8381, 5, '#8fe6ff'], [0.9852, 0.8369, 5, '#8fe6ff'], [0.8754, 0.883, 5, '#8fe6ff'], [0.9129, 0.6242, 13, '#8fe6ff'], [0.2978, 0.8545, 8, '#8fe6ff'], [0.1729, 0.2385, 8, '#8fe6ff'], [0.2108, 0.4347, 7, '#8fe6ff'], [0.3307, 0.4775, 8, '#8fe6ff'], [0.1688, 0.5682, 7, '#8fe6ff']],
    lab_noa_cansada: [[0.6408, 0.2749, 17, '#ffd59a'], [0.6031, 0.6943, 7, '#ffd59a'], [0.6336, 0.7077, 7, '#ffd59a'], [0.742, 0.6027, 7, '#ffd59a'], [0.9809, 0.3033, 9, '#8fe6ff'], [0.9829, 0.4874, 9, '#8fe6ff'], [0.9162, 0.8005, 6, '#8fe6ff']],
    consola_holo: [[0.9513, 0.0284, 10, '#ffd59a'], [0.9516, 0.0736, 9, '#ffd59a'], [0.1908, 0.0238, 10, '#ffd59a'], [0.8888, 0.7989, 13, '#ffd59a'], [0.9562, 0.9862, 10, '#ffd59a'], [0.1882, 0.7793, 9, '#ffb35a'], [0.0634, 0.7701, 9, '#ffb35a'], [0.0233, 0.7304, 8, '#ffb35a'], [0.505, 0.0367, 8, '#ffd59a'], [0.4933, 0.8027, 15, '#8fe6ff'], [0.2197, 0.6037, 4, '#8fe6ff'], [0.2296, 0.6068, 4, '#8fe6ff'], [0.2411, 0.6089, 4, '#8fe6ff'], [0.036, 0.3449, 9, '#ffd59a']],
    lab_amaro_sonrie: [[0.0808, 0.3242, 14, '#ffd59a'], [0.9276, 0.0477, 13, '#ffd59a'], [0.9269, 0.1964, 13, '#ffd59a'], [0.281, 0.4564, 10, '#ffd59a'], [0.3867, 0.7926, 10, '#8fe6ff'], [0.2626, 0.9487, 9, '#8fe6ff']],
    lab_amaro_destino: [[0.0389, 0.4665, 13, '#ffd59a'], [0.0519, 0.96, 11, '#ffd59a'], [0.27, 0.6459, 8, '#ffd59a'], [0.2108, 0.178, 9, '#ffd59a'], [0.8447, 0.6787, 15, '#8fe6ff'], [0.6211, 0.0259, 7, '#8fe6ff'], [0.6762, 0.1328, 7, '#8fe6ff'], [0.3526, 0.5906, 7, '#8fe6ff'], [0.3508, 0.6977, 6, '#8fe6ff'], [0.9132, 0.9502, 7, '#ffd59a'], [0.8787, 0.5781, 6, '#8fe6ff']],
    holo_rosalia: [[0.9512, 0.0297, 10, '#ffd59a'], [0.9512, 0.0714, 9, '#ffd59a'], [0.0358, 0.3454, 9, '#ffd59a'], [0.1877, 0.7795, 9, '#ffb35a'], [0.8863, 0.7984, 13, '#ffd59a'], [0.8633, 0.6004, 9, '#8fe6ff'], [0.9141, 0.5952, 10, '#8fe6ff'], [0.4867, 0.8471, 13, '#8fe6ff'], [0.6002, 0.8232, 9, '#8fe6ff'], [0.0649, 0.7707, 8, '#ffb35a']],
    lab_noa_resopla: [[0.976, 0.5304, 12, '#8fe6ff'], [0.7376, 0.6513, 10, '#8fe6ff'], [0.8763, 0.0368, 9, '#8fe6ff'], [0.9624, 0.8096, 9, '#8fe6ff'], [0.575, 0.8095, 8, '#8fe6ff'], [0.5589, 0.1076, 10, '#8fe6ff'], [0.1138, 0.3754, 9, '#ffd59a'], [0.1079, 0.1725, 9, '#ffd59a'], [0.1091, 0.1294, 8, '#ffd59a'], [0.762, 0.9602, 8, '#ffd59a'], [0.925, 0.5502, 7, '#ffd59a'], [0.8766, 0.8326, 7, '#ffd59a']],
    lab_amaro_seria: [[0.7461, 0.0785, 9, '#ffd59a'], [0.422, 0.2048, 10, '#ffd59a'], [0.3086, 0.1817, 8, '#ffd59a'], [0.2506, 0.6209, 7, '#ffd59a'], [0.8081, 0.7884, 4, '#8fe6ff'], [0.8531, 0.7804, 4, '#8fe6ff'], [0.8697, 0.7836, 4, '#8fe6ff'], [0.9013, 0.7384, 4, '#8fe6ff'], [0.9725, 0.7646, 4, '#8fe6ff'], [0.9336, 0.8341, 4, '#8fe6ff'], [0.9784, 0.8477, 4, '#8fe6ff'], [0.777, 0.6938, 10, '#8fe6ff'], [0.2941, 0.8589, 8, '#8fe6ff']],
    registro_pantalla: [[0.2121, 0.909, 16, '#ffb35a'], [0.789, 0.9101, 16, '#ffb35a'], [0.0351, 0.2333, 10, '#ffb35a'], [0.0285, 0.6337, 10, '#ffb35a'], [0.9652, 0.649, 10, '#ffb35a'], [0.73, 0.49, 22, '#8fe6ff']],
    lab_noa_culpa: [[0.6445, 0.2855, 17, '#ffd59a'], [0.6401, 0.017, 10, '#ffd59a'], [0.6215, 0.3677, 9, '#ffd59a'], [0.7404, 0.5999, 7, '#ffd59a'], [0.6047, 0.6926, 7, '#ffd59a'], [0.6662, 0.8088, 7, '#ffd59a'], [0.9672, 0.3172, 10, '#8fe6ff'], [0.9772, 0.5167, 10, '#8fe6ff'], [0.9834, 0.1872, 8, '#8fe6ff']],
    lab_amaro_enfadada: [[0.2392, 0.2272, 11, '#8fe6ff'], [0.1287, 0.7377, 10, '#8fe6ff'], [0.1091, 0.0372, 10, '#8fe6ff'], [0.0228, 0.3628, 8, '#8fe6ff'], [0.5518, 0.3713, 8, '#ffd59a'], [0.2945, 0.8316, 7, '#8fe6ff']],
    lab_noa_cuaderno: [[0.6942, 0.374, 17, '#ffd59a'], [0.7372, 0.1353, 10, '#ffd59a'], [0.6572, 0.4631, 9, '#ffd59a'], [0.7412, 0.9546, 8, '#ffd59a'], [0.7148, 0.6897, 6, '#ffd59a'], [0.7668, 0.6974, 6, '#ffd59a'], [0.8027, 0.7033, 6, '#ffd59a'], [0.908, 0.6529, 6, '#ffd59a']],
    lab_amaro_ablanda: [[0.1934, 0.4386, 17, '#ffd59a'], [0.2281, 0.0805, 12, '#ffd59a'], [0.1871, 0.8106, 8, '#ffd59a'], [0.2227, 0.8158, 8, '#ffd59a'], [0.894, 0.253, 10, '#8fe6ff'], [0.9246, 0.1739, 9, '#8fe6ff'], [0.8757, 0.621, 9, '#8fe6ff'], [0.8627, 0.4494, 7, '#8fe6ff']],
    lab_noa_decidida: [[0.7439, 0.3902, 17, '#ffd59a'], [0.7762, 0.0686, 10, '#ffd59a'], [0.6815, 0.876, 10, '#ffd59a'], [0.0343, 0.19, 10, '#8fe6ff'], [0.0264, 0.4014, 10, '#8fe6ff'], [0.0644, 0.5915, 9, '#8fe6ff'], [0.0742, 0.013, 9, '#8fe6ff']],
    pulsera_mensaje: [[0.1562, 0.1236, 22, '#ffd59a'], [0.9616, 0.5535, 16, '#8fe6ff'], [0.9694, 0.3616, 13, '#8fe6ff'], [0.6391, 0.0134, 13, '#8fe6ff'], [0.9592, 0.6612, 11, '#ffd59a']],
    lab_noa_aparta: [[0.6678, 0.3168, 15, '#ffd59a'], [0.7621, 0.0408, 10, '#ffd59a'], [0.6895, 0.5176, 8, '#ffd59a'], [0.5618, 0.8318, 7, '#ffb35a'], [0.1374, 0.1396, 10, '#8fe6ff'], [0.0577, 0.5006, 10, '#8fe6ff'], [0.0317, 0.2705, 9, '#8fe6ff'], [0.09, 0.6285, 8, '#ffd59a'], [0.8964, 0.7976, 5, '#8fe6ff'], [0.9619, 0.8303, 5, '#8fe6ff']],
    lab_juntas: [[0.4893, 0.3698, 13, '#8fe6ff'], [0.5234, 0.5335, 9, '#8fe6ff'], [0.0494, 0.3032, 13, '#ffd59a'], [0.0843, 0.4765, 8, '#ffd59a'], [0.0496, 0.6769, 8, '#ffd59a'], [0.1111, 0.0247, 8, '#ffd59a'], [0.8519, 0.1744, 10, '#ffd59a'], [0.9024, 0.3724, 7, '#ffb35a'], [0.9337, 0.6586, 8, '#8fe6ff'], [0.8154, 0.954, 9, '#8fe6ff'], [0.6106, 0.4338, 7, '#8fe6ff']],
    camerino_piano: [[0.8976, 0.0161, 15, '#ffe6b8'], [0.8973, 0.1007, 15, '#ffe6b8'], [0.8975, 0.2056, 15, '#ffe6b8'], [0.8984, 0.3124, 15, '#ffe6b8'], [0.9267, 0.6657, 10, '#ffe6b8'], [0.8712, 0.5467, 8, '#ffe6b8'], [0.1732, 0.1323, 17, '#ffd59a'], [0.073, 0.7738, 8, '#ffd59a']],
    rosalia_sala: [[0.4128, 0.3096, 7, '#ffe6b8'], [0.474, 0.3114, 7, '#ffe6b8'], [0.5634, 0.3065, 7, '#ffe6b8'], [0.6177, 0.3117, 7, '#ffe6b8'], [0.407, 0.3185, 6, '#ffe6b8'], [0.4407, 0.3288, 6, '#ffe6b8'], [0.5409, 0.3262, 6, '#ffe6b8'], [0.628, 0.326, 6, '#ffe6b8'], [0.0801, 0.3764, 9, '#ffd59a'], [0.95, 0.3716, 9, '#ffd59a'], [0.8319, 0.1582, 9, '#ffd59a'], [0.0942, 0.0542, 9, '#ffd59a'], [0.8278, 0.4267, 8, '#ffd59a'], [0.2057, 0.4295, 8, '#ffd59a'], [0.9461, 0.0453, 8, '#ffd59a'], [0.1983, 0.1606, 8, '#ffd59a']],
    sala_rosalia: [[0.0701, 0.3606, 9, '#ffd59a'], [0.5748, 0.1909, 9, '#ffd59a'], [0.4293, 0.1897, 9, '#ffd59a'], [0.8472, 0.4027, 9, '#ffd59a'], [0.4245, 0.4286, 9, '#ffd59a'], [0.7133, 0.4217, 9, '#ffd59a'], [0.1531, 0.0953, 8, '#ffd59a'], [0.9629, 0.3627, 8, '#ffd59a'], [0.8491, 0.0947, 8, '#ffd59a'], [0.1612, 0.3974, 8, '#ffd59a'], [0.2816, 0.1649, 8, '#ffd59a'], [0.7168, 0.1654, 8, '#ffd59a'], [0.295, 0.4205, 8, '#ffd59a'], [0.5721, 0.4292, 8, '#ffd59a']],
    recital: [[0.3777, 0.019, 9, '#ffd59a'], [0.618, 0.0528, 9, '#ffd59a'], [0.0478, 0.2375, 9, '#ffd59a'], [0.129, 0.2777, 9, '#ffd59a'], [0.1967, 0.2736, 8, '#ffd59a'], [0.3924, 0.311, 9, '#ffd59a'], [0.6095, 0.3244, 9, '#ffd59a'], [0.8047, 0.3183, 9, '#ffd59a'], [0.8686, 0.3404, 8, '#ffd59a']],
    recital_cantante: [[0.9448, 0.5217, 14, '#ffb35a']],
    escenario_vacio: [[0.2315, 0.2599, 13, '#ffe6b8']],
    pasillo_camerinos: [[0.4036, 0.1915, 12, '#ffd59a'], [0.7094, 0.0025, 12, '#ffd59a'], [0.334, 0.0013, 10, '#ffd59a'], [0.283, 0.0075, 9, '#ffd59a'], [0.8692, 0.0198, 9, '#ffd59a'], [0.7379, 0.012, 9, '#ffd59a']],
    bastidores_llegada: [[0.333, 0.0488, 13, '#cfefff'], [0.2832, 0.1982, 8, '#cfefff'], [0.9758, 0.1405, 10, '#ffd59a'], [0.976, 0.7355, 9, '#ffd59a'], [0.9085, 0.7992, 9, '#ffd59a']],
    regidora_prisa: [[0.489, 0.0632, 15, '#cfefff']],
    noa_carpeta: [[0.7018, 0.1657, 13, '#cfefff'], [0.9934, 0.1917, 10, '#ffd59a'], [0.9818, 0.9806, 13, '#ffd59a']],
    bastidores_aviso: [[0.9458, 0.3286, 8, '#ffe6b8'], [0.9473, 0.3944, 8, '#ffe6b8'], [0.9476, 0.464, 8, '#ffe6b8'], [0.9474, 0.5306, 8, '#ffe6b8'], [0.8677, 0.1398, 11, '#ffe6b8'], [0.2031, 0.1532, 11, '#cfefff'], [0.8446, 0.0063, 8, '#ffe6b8']],
    noa_camerino: [[0.0936, 0.177, 14, '#ffd59a'], [0.1453, 0.3069, 10, '#ffd59a'], [0.2057, 0.3579, 8, '#ffd59a'], [0.2203, 0.3678, 6, '#ffd59a']],
    cantante_agudo: [[0.7684, 0.0478, 14, '#ffe6b8'], [0.7755, 0.1764, 14, '#ffe6b8'], [0.7711, 0.3171, 14, '#ffe6b8'], [0.775, 0.4625, 14, '#ffe6b8'], [0.7725, 0.6057, 14, '#ffe6b8'], [0.8281, 0.1723, 11, '#ffe6b8'], [0.828, 0.3201, 11, '#ffe6b8'], [0.8283, 0.4563, 11, '#ffe6b8'], [0.8143, 0.0245, 11, '#ffe6b8'], [0.1213, 0.305, 13, '#ffd59a']],
    cantante_panico: [[0.7966, 0.1238, 20, '#ffe6b8'], [0.8752, 0.0873, 22, '#ffe6b8'], [0.9752, 0.048, 22, '#ffe6b8'], [0.8122, 0.3048, 18, '#ffe6b8'], [0.8659, 0.3242, 18, '#ffe6b8'], [0.8159, 0.5151, 16, '#ffe6b8'], [0.8659, 0.5255, 16, '#ffe6b8'], [0.8102, 0.7164, 16, '#ffe6b8'], [0.867, 0.7203, 16, '#ffe6b8']],
    cantante_canta: [[0.7563, 0.0211, 12, '#ffe6b8'], [0.7993, 0.0267, 12, '#ffe6b8'], [0.7569, 0.1447, 12, '#ffe6b8'], [0.7987, 0.1459, 12, '#ffe6b8'], [0.7527, 0.2681, 11, '#ffe6b8'], [0.9695, 0.2824, 12, '#ffe6b8'], [0.9691, 0.4304, 12, '#ffe6b8'], [0.9691, 0.1184, 11, '#ffe6b8']],
    cantante_duda: [[0.5692, 0.0248, 14, '#ffe6b8'], [0.5672, 0.1552, 15, '#ffe6b8'], [0.5677, 0.3229, 15, '#ffe6b8'], [0.5714, 0.4918, 15, '#ffe6b8'], [0.6354, 0.1647, 13, '#ffe6b8'], [0.6357, 0.3253, 13, '#ffe6b8'], [0.8757, 0.0833, 15, '#ffe6b8'], [0.8709, 0.2859, 15, '#ffe6b8'], [0.8745, 0.5044, 15, '#ffe6b8'], [0.8825, 0.7226, 14, '#ffe6b8']],
    pianista_reloj: [[0.1919, 0.0239, 12, '#ffd59a'], [0.8821, 0.078, 10, '#ffd59a']],
    pianista_atril: [[0.0456, 0.1196, 19, '#ffe6b8'], [0.0476, 0.2645, 19, '#ffe6b8'], [0.7492, 0.1047, 10, '#ffd59a'], [0.0599, 0.5148, 8, '#ffd59a']],
    manos_teclas: [[0.5397, 0.014, 12, '#ffe6b8'], [0.8122, 0.3012, 12, '#ffd59a'], [0.8378, 0.3381, 10, '#ffd59a'], [0.7524, 0.1657, 10, '#ffd59a']],
    pasillo_cantante: [[0.399, 0.0087, 14, '#ffd59a'], [0.4903, 0.2419, 8, '#ffd59a'], [0.8496, 0.0726, 6, '#ffe6b8'], [0.851, 0.1567, 6, '#ffe6b8'], [0.8519, 0.2155, 6, '#ffe6b8'], [0.8514, 0.2717, 6, '#ffe6b8'], [0.8516, 0.3378, 6, '#ffe6b8']],
    pasillo_noa: [[0.7029, 0.0346, 18, '#ffd59a'], [0.8279, 0.3667, 12, '#ffd59a'], [0.998, 0.339, 7, '#ffe6b8'], [0.9976, 0.4702, 7, '#ffe6b8'], [0.9968, 0.563, 7, '#ffe6b8'], [0.9971, 0.6781, 7, '#ffe6b8']],
    pasillo_regidora: [[0.7218, 0.0023, 13, '#ffd59a'], [0.4066, 0.1837, 8, '#ffd59a'], [0.6675, 0.1009, 6, '#ffe6b8'], [0.6664, 0.1752, 6, '#ffe6b8'], [0.6684, 0.2333, 6, '#ffe6b8'], [0.669, 0.2837, 6, '#ffe6b8'], [0.6684, 0.3349, 6, '#ffe6b8']],
    pasillo_escabulle: [[0.7106, 0.0449, 13, '#ffd59a'], [0.406, 0.1499, 8, '#ffd59a'], [0.8148, 0.0602, 6, '#ffe6b8'], [0.8146, 0.1188, 6, '#ffe6b8'], [0.8146, 0.1839, 6, '#ffe6b8'], [0.8139, 0.2623, 6, '#ffe6b8'], [0.8133, 0.3506, 6, '#ffe6b8'], [0.575, 0.5347, 9, '#8fe6ff']],
    sala_aplausos: [[0.1522, 0.1114, 8, '#ffd59a'], [0.28, 0.1817, 8, '#ffd59a'], [0.4275, 0.2076, 8, '#ffd59a'], [0.5749, 0.2072, 8, '#ffd59a'], [0.7175, 0.1833, 8, '#ffd59a'], [0.8514, 0.1121, 8, '#ffd59a'], [0.164, 0.4137, 8, '#ffd59a'], [0.3027, 0.4364, 8, '#ffd59a'], [0.5749, 0.4449, 8, '#ffd59a'], [0.7129, 0.436, 8, '#ffd59a'], [0.8472, 0.4188, 8, '#ffd59a'], [0.9658, 0.3719, 8, '#ffd59a'], [0.2824, 0.0204, 7, '#ffd59a'], [0.5005, 0.0447, 7, '#ffd59a'], [0.7047, 0.02, 7, '#ffd59a']],
    noa_mariapita: [[0.6317, 0.481, 10, '#ffd59a'], [0.9428, 0.5685, 10, '#ffd59a'], [0.6921, 0.5701, 7, '#ffd59a'], [0.8037, 0.5927, 7, '#ffd59a'], [0.9489, 0.5734, 7, '#ffd59a'], [0.3989, 0.5866, 7, '#ffd59a'], [0.4998, 0.6041, 7, '#ffd59a'], [0.4442, 0.6867, 10, '#9fe8ff'], [0.7609, 0.8038, 9, '#9fe8ff'], [0.9304, 0.8081, 7, '#ffd59a'], [0.5685, 0.932, 7, '#ffd59a'], [0.6379, 0.9219, 7, '#ffd59a']],
    noa_se_gira: [[0.9234, 0.1679, 12, '#ffd59a'], [0.8457, 0.1339, 10, '#ffd59a'], [0.6593, 0.3376, 12, '#9fe8ff'], [0.9025, 0.3459, 12, '#9fe8ff'], [0.7413, 0.428, 8, '#9fe8ff'], [0.6585, 0.7529, 8, '#ffd59a']],
    recuerdo_terraza: [[0.6656, 0.0257, 5, '#ffffff'], [0.8411, 0.1146, 5, '#ffffff'], [0.5386, 0.1029, 9, '#ffd59a'], [0.9813, 0.1795, 10, '#ffd59a'], [0.9469, 0.2268, 9, '#ffd59a'], [0.9741, 0.524, 9, '#ffd59a'], [0.7989, 0.5607, 7, '#fff0c8'], [0.8264, 0.7081, 7, '#fff0c8'], [0.7781, 0.4437, 6, '#fff0c8'], [0.1852, 0.5231, 6, '#fff0c8']],
    atril_piano: [[0.0241, 0.2279, 14, '#ffd59a'], [0.1361, 0.08, 11, '#ffd59a']],
    cuaderno_fechas: [[0.985, 0.3, 30, '#8fe6ff']],
    mano_hombro: [[0.6699, 0.1305, 13, '#ffd59a'], [0.7954, 0.2262, 9, '#ffd59a'], [0.8311, 0.2222, 9, '#ffd59a'], [0.8898, 0.1795, 9, '#ffd59a'], [0.9492, 0.1782, 9, '#ffd59a'], [0.4582, 0.369, 11, '#9fe8ff'], [0.6879, 0.3807, 11, '#9fe8ff'], [0.8885, 0.3957, 10, '#9fe8ff'], [0.819, 0.5309, 8, '#9fe8ff'], [0.5821, 0.6201, 9, '#ffd59a'], [0.6938, 0.6501, 8, '#ffd59a'], [0.9319, 0.6656, 8, '#ffd59a']],
    mariapita: [[0.1888, 0.441, 10, '#ffd59a'], [0.9208, 0.4425, 10, '#ffd59a'], [0.0313, 0.5359, 7, '#ffd59a'], [0.0935, 0.5502, 7, '#ffd59a'], [0.1504, 0.5579, 7, '#ffd59a'], [0.8296, 0.584, 7, '#ffd59a'], [0.8961, 0.5803, 7, '#ffd59a'], [0.9664, 0.5802, 7, '#ffd59a'], [0.3682, 0.6018, 6, '#ffd59a'], [0.4214, 0.5984, 6, '#ffd59a'], [0.5018, 0.5926, 6, '#ffd59a'], [0.5596, 0.6047, 6, '#ffd59a'], [0.6389, 0.6086, 6, '#ffd59a'], [0.7017, 0.6038, 6, '#ffd59a'], [0.2603, 0.7443, 8, '#9fe8ff'], [0.0473, 0.6191, 10, '#9fe8ff'], [0.9557, 0.6228, 10, '#9fe8ff'], [0.4133, 0.7398, 6, '#ffd59a'], [0.6205, 0.7455, 6, '#ffd59a'], [0.8002, 0.7424, 6, '#ffd59a'], [0.2859, 0.8915, 7, '#ffd59a']],
    recital_pianista: [[0.1309, 0.2469, 10, '#ffb35a']]
  };
  const BR = (k, o) => [Object.assign({ tipo: 'brillos', p: LZ[k] }, o || {})];
  const MOTAS = (z, n, c, v) => [{ tipo: 'polvo', zona: z, n: n || 10, color: c || '#ffe2b8', vel: v || .2 }];   // polvo en un haz de luz
  const HAZ = (x, y, w, h, c) => [{ tipo: 'haz', zona: [x, y, w, h], color: c || '#ffe2b0', vel: .8 }];
  const PANT = (x, y, w, h, c) => [{ tipo: 'parpadeo', zona: [x, y, w, h], color: c || '#9fe4ff' }];
  const I3 = (k, desc, o) => Object.assign({ src: N(k), desc: desc }, o || {});
  const IMG = {
    /* ── 1 · laboratorio, de noche, justo después de T2 ── */
    labNoche: O(I3('lab_noche', 'Laboratorio bajo la Torre, de noche, justo después de T2: el Transportador en reposo (anillos tenues), el cuaderno del padre abierto en la mesa, Noa a la izquierda y Amaro a la derecha junto a la consola; plano general, luz azul baja', { ocultaPj: ['NOA', 'AMARO'], vida: BR('lab_noche').concat([{ tipo: 'anillos', zona: [0.4, -0.023, 0.38, 0.593], n: 2 }], PANT(0.91, 0.397, 0.09, 0.142), LAB) }),
      { src: T2('lab_noche_noa'), vida: [{ tipo: 'anillos', zona: [.3, .1, .4, .7], n: 2 }].concat(LAB) }),
    amaroCalibra: O(I3('lab_amaro_calibra', 'Amaro a la derecha junto a la consola, mira a Noa (hacia la izquierda), seria pero tranquila, una mano sobre el panel; plano medio; luz cian de la consola', { ocultaPj: ['AMARO'], vida: BR('lab_amaro_calibra').concat(PANT(0.79, 0.48, 0.17, 0.237), LAB) }),
      { src: T2('lab_amaro_firme'), ocultaPj: ['AMARO'], vida: LAB }),
    noaCansada: O(I3('lab_noa_cansada', 'Noa a la izquierda, plano medio, cansada e incrédula, mira a Amaro (hacia la derecha); el pelo todavía húmedo de Santiago, auriculares al cuello; nada de brazos cruzados ni de encogerse de hombros', { ocultaPj: ['NOA'], vida: BR('lab_noa_cansada').concat(LAB) }),
      { src: T2('lab_noa_sonrisa'), ocultaPj: ['NOA'], vida: LAB }),
    consola: O(I3('consola_holo', 'DETALLE sin personas: la consola holográfica del Transportador se enciende; paneles cian y ámbar flotando en los bordes, CENTRO LIMPIO (la web dibuja el repaso encima)', { vida: BR('consola_holo').concat(PANT(.02, .03, .27, .6), PANT(.88, .05, .11, .55)) }),
      { src: T1('prueba_consola'), vida: [{ tipo: 'traza', zona: [.40, .48, .33, .07], periodo: .16 }, { tipo: 'parpadeo', zona: [.38, .33, .36, .25], color: '#9fe4ff' }] }),
    amaroSonrie: O(I3('lab_amaro_sonrie', 'Amaro, primer plano, sonríe a medias mirando la consola (hacia la izquierda); el reflejo cian del «100 %» en la cara', { ocultaPj: ['AMARO'], vida: BR('lab_amaro_sonrie').concat(PANT(0, 0.587, 0.26, 0.533), LAB) }),
      { src: T2('lab_amaro_firme'), ocultaPj: ['AMARO'], vida: LAB }),
    amaroDestino: I3('lab_amaro_destino', 'Amaro teclea el destino en la consola; sobre ella flota un holograma con la fachada del Teatro Rosalía de Castro; Noa al fondo a la izquierda, atenta, con las manos en la mesa; nada de brazos cruzados ni de encogerse de hombros', { ocultaPj: ['AMARO', 'NOA'], vida: BR('lab_amaro_destino').concat(PANT(0.69, 0.137, 0.29, 0.474), [{ tipo: 'chispas', zona: [0.76, 0.231, 0.17, 0.45], n: 8, vel: .5, color: '#9ff0ff' }], LAB) }),
    holoRosalia: I3('holo_rosalia', 'DETALLE: holograma cian de la fachada real del Teatro Rosalía de Castro (A Coruña) con «2026» en el panel; fondo del laboratorio desenfocado', { vida: BR('holo_rosalia').concat(PANT(.3, .14, .52, .56), [{ tipo: 'chispas', zona: [.32, .3, .48, .5], n: 10, vel: .4, color: '#9ff0ff' }]) }),
    noaResopla: O(I3('lab_noa_resopla', 'Noa, primer plano, pone los ojos en blanco y murmura para sí; luz de los anillos que empiezan a girar detrás; nada de brazos cruzados ni de encogerse de hombros', { ocultaPj: ['NOA'], vida: BR('lab_noa_resopla').concat(LAB) }),
      { src: T1('lab_centro'), vida: [{ tipo: 'anillos', zona: [.16, 0, .7, 1], n: 3 }].concat(LAB) }   /* (Iago 4-nov) nada de lab_noa_brazos: lab vacío + la pose de Noa encima */),
    maquina: { src: T1('prueba_cerca'), vida: [{ tipo: 'anillos', zona: [.2, 0, .65, .78], n: 3 }, { tipo: 'pulso', zona: [.42, .1, .18, .3], color: '#58b8ff' },
      { tipo: 'chispas', zona: [.3, .62, .4, .14], n: 10, color: '#9ff0ff' }, { tipo: 'arco', zona: [.775, .27, .04, .06] },
      { tipo: 'brillos', p: [[.158, .265, 12, '#ffd59a'], [.89, .27, 12, '#ffd59a'], [.04, .27, 10, '#ffd59a']] }].concat(LAB) },
    /* ── 2 · Teatro Rosalía de Castro, 2026 ── */
    /* (Iago 4-nov, GUION 3b) la secuencia de entrada: dron sobre A Coruña en 2026 (la ciudad REAL; sin nada futurista) */
    dronBahia: I3('dron_bahia', 'Vuelo de dron al atardecer sobre la ensenada del Orzán y la playa de Riazor, A Coruña 2026, fiel a la ciudad real: el paseo marítimo curvo con sus farolas y barandilla, los edificios de galerías blancas del frente marítimo, el estadio de Riazor a la izquierda y, al fondo en la punta norte, la Torre de Hércules; mar con algo de oleaje, luz cálida; sin elementos futuristas', { mueve: true }),
    dronCiudadVieja: I3('dron_ciudad_vieja', 'Dron sobre la Avenida de la Marina, A Coruña 2026, fiel a la real: la larga fachada de galerías blancas acristaladas frente a la dársena con barcos, el Obelisco, y detrás los tejados de la Ciudad Vieja; atardecer, farolas que se encienden', { mueve: true }),
    dronRiego: I3('dron_riego_de_agua', 'Dron que baja despacio hacia la rúa Riego de Agua, A Coruña 2026: calle peatonal estrecha del centro, edificios de galerías y soportales, gente paseando con abrigo, el Palacio Municipal de María Pita asomando al fondo; fiel a la calle real; atardecer', { mueve: true }),
    salaEnsayo: I3('rosalia_sala', 'Interior REAL del Teatro Rosalía de Castro durante el ensayo, quince minutos antes del recital: patio de butacas aún vacío con butacas rojas, palcos en herradura con molduras blancas y doradas, la gran lámpara central a media luz, el escenario con luces de trabajo y un piano de cola; vista desde el fondo de la platea; fiel a las fotos reales', { mueve: true, vida: BR('rosalia_sala', { chispa: .03 }).concat(HAZ(.45, .31, .16, .3), MOTAS([.42, .3, .24, .3], 10)) }),
    camerinoPiano: I3('camerino_piano', 'Camerino 2 del Rosalía durante el ensayo: tocador con espejo rodeado de bombillas, botellas de agua, un termo y bebidas, un ramo de flores; un PIANO DE PARED (teclas negras en grupos de 2 y 3) donde el PIANISTA acompaña mirando a las teclas; la CANTANTE (pelirroja, ondas sueltas, fular) canta de pie junto al piano con esfuerzo; luz cálida; plano general', { vida: BR('camerino_piano', { a: .4, chispa: .06 }).concat(POLVO()) }),
    fachada: I3('rosalia_fachada', 'Exterior REAL del Teatro Rosalía de Castro (rúa Riego de Agua, A Coruña) al anochecer de 2026: fachada iluminada, cartel del recital, gente entrando; fiel a las fotos reales', { vida: [{ tipo: 'luces', zona: [.15, .25, .7, .4], n: 14, color: '#ffe2b0' }] }),
    llegada: I3('bastidores_llegada', 'Entre bastidores: telón rojo, cuerdas y contrapesos, luces de trabajo azules; Noa aparece entre anillos de luz (último fotograma del vídeo de llegada)', { ocultaPj: ['NOA'], vida: BR('bastidores_llegada').concat([{ tipo: 'anillos', zona: [.3, .4, .4, .4], n: 2, color: '#9fe4ff' }], POLVO('#cfe0ff')) }),
    regidora: I3('regidora_prisa', 'La REGIDORA (mujer de unos 40, auriculares de diadema con micro, carpeta, ropa negra de técnica) llega con prisa y le pone un pinganillo a Noa; plano a dos: Noa a la izquierda, la regidora a la derecha mirando hacia ella', { ocultaPj: ['NOA'], vida: BR('regidora_prisa').concat(POLVO('#cfe0ff')) }),
    noaCarpeta: I3('noa_carpeta', 'Noa, plano medio, con el pinganillo puesto y una carpeta en las manos, desconcertada; mira hacia la derecha (por donde se ha ido la regidora); luz azul de bastidores', { ocultaPj: ['NOA'], vida: BR('noa_carpeta').concat(POLVO('#cfe0ff')) }),
    pasillo: I3('pasillo_camerinos', 'Pasillo de camerinos del teatro: puertas numeradas, la del «2» entreabierta con luz cálida; Noa de espaldas camina hacia ella con la carpeta', { vida: BR('pasillo_camerinos').concat([{ tipo: 'respira', zona: [.61, .15, .07, .3], color: '#ffd9a0', vel: 1.3 }], POLVO()) }),
    /* ── 3 · el camerino 2 ── */
    agudo: I3('cantante_agudo', 'La CANTANTE (soprano de unos 35, PELIRROJA con ondas sueltas, vestido de concierto azul noche, fular al cuello, fiel a su hoja) intenta el agudo y se lleva la mano a la garganta: la voz se le rompe; plano medio; mira al frente', { vida: BR('cantante_agudo', { a: .4, chispa: .06 }) }),
    panico: I3('cantante_panico', 'La cantante, primer plano, al borde del pánico, ronca; mira hacia la izquierda (a Noa y al pianista)', { vida: BR('cantante_panico', { a: .3, chispa: .05 }) }),
    cantanteCanta: I3('cantante_canta', 'Ensayo en el camerino: la cantante canta junto al piano vertical con la voz tomada, una mano en el fular, gesto de esfuerzo; el pianista toca mirando a las teclas (2+3); plano medio, luz cálida', { vida: BR('cantante_canta', { a: .4, chispa: .06 }).concat(MOTAS([.5, .02, .2, .3], 6)) }),
    noaCamerino: I3('noa_camerino', 'Noa en la puerta del camerino con la carpeta, plano medio, se atreve a proponer algo; mira hacia la derecha', { ocultaPj: ['NOA'], vida: BR('noa_camerino').concat(POLVO()) }),
    pianistaReloj: I3('pianista_reloj', 'El PIANISTA (hombre de unos 55, canoso, gafas, chaqueta oscura, tranquilo y con oficio) mira su reloj de pulsera sentado al piano vertical; plano medio; mira hacia la izquierda', { vida: BR('pianista_reloj').concat(POLVO()) }),
    duda: I3('cantante_duda', 'La cantante, plano medio, incrédula, se vuelve hacia el pianista (mira a la izquierda); mano en el fular', { vida: BR('cantante_duda', { a: .32, chispa: .05 }) }),
    pianistaAtril: I3('pianista_atril', 'El pianista señala con calma la partitura del atril, sonríe apenas; mira a la cantante (hacia la derecha); plano medio corto; teclado 2+3 visible', { vida: BR('pianista_atril', { a: .34, chispa: .05 }).concat(POLVO()) }),
    /* (Iago 4-nov) toda la secuencia del transporte mental (pianista, lápiz, claves, tiempo real) sobre el atril del piano de cola.
       La partitura se dibuja ENCIMA de la hoja A4 de la imagen: calibración en TR.ATRIL (abajo). Mientras C no la haga, el fondo
       provisional dibujado en código (img/provisional/atril_provisional.webp, 2880×1620). */
    atrilPiano: O(I3('atril_piano', 'Atril de un piano de cola, vista FRONTAL y centrada, luz cálida de camerino; sobre el atril una hoja A4 en blanco, recta y sin texto, ocupando el centro; un lápiz de grafito apoyado en la repisa del atril; debajo, el borde de las teclas (negras en grupos 2+3); sin manos ni personas', { vida: BR('atril_piano', { a: .26, chispa: 0 }) }),
      { src: 'img/provisional/atril_provisional.webp' }),
    manos: I3('manos_teclas', 'DETALLE: las manos del pianista tocando (teclas negras en grupos de 2 y 3, anatomía correcta), luz cálida, poca profundidad de campo', { vida: BR('manos_teclas', { a: .3 }).concat(POLVO()) }),
    /* ── 4 · el recital ── */
    aviso: I3('bastidores_aviso', 'Noa entre bastidores, a contraluz, una mano en el pinganillo, mira hacia el escenario iluminado (a la derecha); detrás, el telón rojo', { ocultaPj: ['NOA'], vida: BR('bastidores_aviso', { chispa: .05 }).concat(MOTAS([.8, 0, .2, 1], 8), POLVO('#ffe2b8')) }),
    sala: I3('sala_rosalia', 'La sala REAL del Teatro Rosalía vista desde el escenario: patio de butacas lleno, palcos en herradura con molduras doradas, la lámpara central; las luces de sala bajan; fiel a las fotos reales', { vida: BR('sala_rosalia', { a: .38, chispa: .05 }) }),
    recital: I3('recital', 'El recital desde un lateral del escenario: la cantante canta junto al piano de cola (teclas 2+3), el pianista toca mirando a las teclas; foco cálido, público en penumbra', { vida: BR('recital').concat(HAZ(.18, 0, .3, .75), MOTAS([.55, 0, .4, .3], 12)) }),
    recitalCantante: I3('recital_cantante', 'La cantante, plano medio en el escenario, canta el agudo con gesto de alivio; foco cálido, fondo oscuro', { vida: BR('recital_cantante').concat(HAZ(.2, 0, .5, .65), MOTAS([0, 0, .4, .6], 12)) }),
    recitalPianista: I3('recital_pianista', 'El pianista de perfil en el piano de cola, concentrado en las teclas (2+3), transportando en la cabeza; la partitura en el atril; foco cálido', { vida: BR('recital_pianista', { a: .3 }).concat(HAZ(.12, 0, .5, .65), MOTAS([.1, 0, .55, .6], 12)) }),
    publico: I3('sala_publico', 'El público del Rosalía escucha en penumbra, emocionado; caras, edades y ropas variadas (nadie se parece a Noa)', { vida: [{ tipo: 'polvo', zona: [0, 0, 1, 1], n: 18, color: '#ffe2b8' }] }),
    aplausos: I3('sala_aplausos', 'El público del Rosalía en pie, aplaudiendo; palcos llenos; caras y edades variadas (nadie se parece a Noa); la cantante y el pianista saludan en primer término, de espaldas', { vida: BR('sala_aplausos', { chispa: .06 }).concat([{ tipo: 'reflejos', zona: [.4, .88, .4, .08], n: 10, color: '#ffe0b0' }]) }),
    pasilloCantante: I3('pasillo_cantante', 'Pasillo de bastidores: la cantante, con un ramo de flores, se acerca agradecida a Noa (Noa a la izquierda, de tres cuartos); la cantante mira hacia ella', { ocultaPj: ['NOA'], vida: BR('pasillo_cantante').concat(MOTAS([.42, 0, .14, .8], 8)) }),
    pasilloNoa: I3('pasillo_noa', 'Noa, primer plano, sonrisa tímida al decir su nombre; pasillo de bastidores con luz de trabajo; mira hacia la derecha', { ocultaPj: ['NOA'], vida: BR('pasillo_noa').concat(POLVO()) }),
    pasilloRegidora: I3('pasillo_regidora', 'La regidora al fondo del pasillo, contrariada, señala a Noa con la carpeta; mira hacia la izquierda', { vida: BR('pasillo_regidora').concat(POLVO()) }),
    /* (Iago 4-nov 19:46) tras «¡La de prácticas no se llama Noa!», Noa ya está en otro lugar: sale por la puerta de artistas a la calle (Runway image) */
    saleTeatro: I3('noa_sale_teatro', 'De noche, Noa sale por la puerta de artistas del Teatro Rosalía a una calle del casco viejo con farolas y suelo mojado; mira atrás con media sonrisa; pulsera en cian', { ocultaPj: ['NOA'],
      vida: [{ tipo: 'brillos', p: [[.285, .115, 16, '#ffd59a'], [.2, .29, 12, '#ffd59a'], [.082, .375, 9, '#ffd59a'], [.065, .41, 7, '#ffd59a'], [.71, .07, 10, '#ffe6b8']] },
        { tipo: 'reflejos', zona: [0, .62, .34, .36], n: 10, color: '#ffd59a' }].concat(PANT(.49, .52, .03, .05)) }),
    escabulle: I3('pasillo_escabulle', 'Noa se escabulle por el pasillo hacia una puerta de servicio, mira atrás con media sonrisa; su pulsera se ilumina en cian', { ocultaPj: ['NOA'], vida: BR('pasillo_escabulle').concat(PANT(0.545, 0.492, 0.06, 0.083)) }),
    escenario: I3('escenario_vacio', 'El escenario del Rosalía vacío tras el recital: el piano de cola cerrado con la partitura en el atril, un solo foco encendido; CENTRO LIMPIO para las láminas', { vida: BR('escenario_vacio', { a: .45 }).concat(HAZ(.13, .26, .24, .5), MOTAS([.15, .27, .2, .5], 12), POLVO('#ffe2b8')) }),
    /* ── 5 · vuelta y bronca (laboratorio) ── */
    amaroSeria: O(I3('lab_amaro_seria', 'Amaro a la derecha, seria y fría, con la pantalla del registro abierta a su lado; mira a Noa (hacia la izquierda); laboratorio de noche', { ocultaPj: ['AMARO'], vida: BR('lab_amaro_seria').concat(PANT(.8, .06, .2, .42), LAB) }),
      { src: T2('lab_amaro_sospecha'), ocultaPj: ['AMARO'], vida: LAB }),
    registro: O(I3('registro_pantalla', 'DETALLE: la pantalla del registro del Transportador, sin texto (la web pone las líneas y la coordenada borrada); cian sobre negro', { ocultaPj: ['AMARO'], vida: BR('registro_pantalla').concat(PANT(.07, .08, .86, .78)) }),
      { src: T2('registro_dos'), ocultaPj: ['AMARO'], vida: [{ tipo: 'parpadeo', zona: [.1, .1, .5, .6], color: '#9fe4ff' }] }),
    noaCulpa: O(I3('lab_noa_culpa', 'Noa a la izquierda, AVERGONZADA y TRISTE: mirada baja, ojos húmedos, hombros caídos, las dos manos agarrando la correa del estuche delante del pecho; plano medio; luz azul baja; nada de sonrisa, brazos cruzados ni encogerse de hombros', { ocultaPj: ['NOA'], vida: BR('lab_noa_culpa').concat(LAB) }),
      { src: T1('lab_centro'), vida: [{ tipo: 'anillos', zona: [.16, 0, .7, 1], n: 3 }].concat(LAB) }   /* (Iago 4-nov) nada de lab_noa_brazos: lab vacío + la pose de Noa encima */),
    amaroEnfadada: O(I3('lab_amaro_enfadada', 'Amaro, plano medio, dolida y enfadada, gesto abierto con la mano; mira a la izquierda', { ocultaPj: ['AMARO'], vida: BR('lab_amaro_enfadada').concat(LAB) }),
      { src: T2('lab_amaro_sospecha'), ocultaPj: ['AMARO'], vida: LAB }),
    noaCuaderno: O(I3('lab_noa_cuaderno', 'Noa abraza el cuaderno de su padre contra el pecho, con los ojos húmedos; mira a Amaro (hacia la derecha)', { ocultaPj: ['NOA'], vida: BR('lab_noa_cuaderno').concat(LAB) }),
      { src: T2('lab_cuaderno'), vida: LAB }),
    cuadernoFechas: O(I3('cuaderno_fechas', 'DETALLE: página del cuaderno del padre con fechas y coordenadas a mano y un boceto de la plaza de María Pita con sus soportales (la web escribe el rótulo)', { vida: BR('cuaderno_fechas', { a: .22, chispa: 0 }).concat(POLVO()) }),
      { src: T2('cuaderno_otra'), vida: POLVO() }),
    amaroAblanda: O(I3('lab_amaro_ablanda', 'Amaro, primer plano, se ablanda: suspira y casi sonríe; mira a la izquierda', { ocultaPj: ['AMARO'], vida: BR('lab_amaro_ablanda').concat(LAB) }),
      { src: T2('lab_dos'), ocultaPj: ['NOA', 'AMARO'], vida: LAB }),
    recuerdo: I3('recuerdo_terraza', 'RECUERDO (tonos cálidos, bordes suaves): Noa de niña (unos 8 años) con su padre Xoán adulto (fiel a su hoja, clarinete en Si♭) en una terraza de la plaza de María Pita al atardecer, sacando los instrumentos', { vida: BR('recuerdo_terraza', { chispa: .12 }).concat(POLVO('#ffe2b8')) }),
    noaDecidida: O(I3('lab_noa_decidida', 'Noa, primer plano, decidida y serena, mira a Amaro (hacia la derecha); nada de brazos cruzados ni de encogerse de hombros', { ocultaPj: ['NOA'], vida: BR('lab_noa_decidida').concat(LAB) }),
      { src: T1('lab_centro'), vida: [{ tipo: 'anillos', zona: [.16, 0, .7, 1], n: 3 }].concat(LAB) }   /* (Iago 4-nov) nada de lab_noa_brazos: lab vacío + la pose de Noa encima */),
    pulsera: I3('pulsera_mensaje', 'DETALLE: la muñeca de Noa con la pulsera encendida (un mensaje entrante, la pantalla SIN texto: la web lo escribe al lado); fondo del laboratorio desenfocado', { vida: [{ tipo: 'vibra', zona: [0.28, 0.326, 0.16, 0.284] }].concat(PANT(0.3, 0.374, 0.12, 0.19, '#ffc48a'), BR('pulsera_mensaje', { chispa: 0 })) }),
    noaAparta: O(I3('lab_noa_aparta', 'Noa aparta la vista de la pulsera y baja la mano sin contestar; mira hacia la consola (a la derecha); luz azul', { ocultaPj: ['NOA'], vida: BR('lab_noa_aparta').concat(PANT(0.9, 0.054, 0.1, 0.474), LAB) }),
      { src: T2('lab_noche_noa'), vida: LAB }),
    juntas: O(I3('lab_juntas', 'Noa y Amaro, juntas ante la consola, preparan el salto; el Transportador se enciende; plano a dos (Noa a la izquierda, Amaro a la derecha)', { ocultaPj: ['NOA', 'AMARO'], vida: BR('lab_juntas').concat([{ tipo: 'pulso', zona: [.42, .28, .14, .22], color: '#58c8ff', vel: .8 }, { tipo: 'chispas', zona: [.44, .3, .16, .2], n: 8, vel: .6, color: '#9ff0ff' }], LAB) }),
      { src: T2('lab_dos'), ocultaPj: ['NOA', 'AMARO'], vida: [{ tipo: 'anillos', zona: [.38, .05, .3, .6], n: 3 }].concat(LAB) }),
    /* ── 6 · plaza de María Pita, 2070 (Iago 4-nov: moderna, reconocible) ── */
    plaza: I3('mariapita', 'Plaza de María Pita al atardecer, reconocible (el Palacio Municipal, los soportales, la estatua) pero MODERNA: alguna reforma, locales y terrazas actualizados, luminarias y mobiliario de diseño, detalles de la estética de 2100 en versión sutil (unos 30 años antes: aún sin hologramas ni drones por todas partes); gente en las terrazas con caras variadas, nadie se parece a Noa; plano general', { vida: BR('mariapita', { chispa: .05 }).concat([{ tipo: 'leds', p: [[.815, .135, '#ff6a5a'], [.83, .135, '#bfefff']], tam: 1.6, f: 3.1 },
      { tipo: 'reflejos', zona: [.4, .735, .44, .025], n: 10, color: '#ffe8c0' }, { tipo: 'reflejos', zona: [.22, .84, .14, .12], n: 6, color: '#ffe8c0' }]) }),
    noaPlaza: I3('noa_mariapita', 'Noa de tres cuartos de espaldas, en la plaza de María Pita modernizada, mira las terrazas (locales actualizados, mobiliario de diseño, sutiles toques de futuro) con emoción contenida; contraluz de atardecer; los soportales detrás', { ocultaPj: ['NOA'], vida: BR('noa_mariapita', { chispa: .06 }).concat([{ tipo: 'reflejos', zona: [.56, .9, .12, .07], n: 6, color: '#ffe8c0' }], POLVO('#ffe2b8')) }),
    mano: I3('mano_hombro', 'DETALLE: la mano de un chico joven se apoya en el hombro de Noa (su sudadera), SIN cara y sin pistas de la fecha; al fondo, desenfocada, la plaza de María Pita modernizada al atardecer', { ocultaPj: ['NOA'], vida: BR('mano_hombro', { chispa: .05 }).concat([{ tipo: 'reflejos', zona: [.56, .6, .4, .08], n: 8, color: '#ffe8c0' }]) }),
    noaGira: I3('noa_se_gira', 'Noa se gira, desconcertada, hacia el chico que le ha puesto la mano en el hombro; primer plano de Noa (mira hacia la derecha); del chico solo se ve el hombro y la espalda, de espaldas o fuera de foco, SIN que se le vea la cara; atardecer, terrazas modernas de María Pita desenfocadas', { ocultaPj: ['NOA'], vida: BR('noa_se_gira', { chispa: .03 }) })
  };
  B._IMG = IMG;
  /* (D2) la misma lámina con FUNDIDO al entrar (s): motor.js lo lee de la propia lámina (p. ej. los planos del recital) */
  const FD = (im, s) => Array.isArray(im) ? im.map(x => FD(x, s)) : Object.assign({}, im, { funde: s == null ? 1 : s });
  /* CALIBRACIÓN del atril (fracciones del fondo 1920×1080): dónde está la hoja A4 (x, y, ancho, alto) y el lápiz de la repisa
     (x, y = esquina superior izquierda, w = largo, rot en grados). «real» = para img/t3/atril_piano.webp: AJUSTAR cuando llegue
     (lapizEnImagen: true si el lápiz ya está pintado en la imagen: el de la web queda invisible y solo hace de botón). */
  B.ATRIL = {
    provisional: { hoja: { x: .372, y: .045, w: .256, h: .635 }, lapiz: { x: .468, y: .686, w: .135, rot: -2.5 }, lapizEnImagen: false },
    real: { hoja: { x: .366, y: .029, w: .269, h: .650 }, lapiz: { x: .682, y: .649, w: .189, rot: 0 }, lapizEnImagen: true }   /* (4-nov) calibrado por CH1 sobre atril_piano.webp */
  };

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
      SFo('sfx_papel'), SF('sfx_t3_voz_rota'), SF('sfx_t3_aplausos'), SF('sfx_t3_pinganillo_clic'), SF('sfx_t3_pasos_pasillo'), SF('sfx_t3_telon'), SF('sfx_t3_pulsera_notif'), SF('sfx_t3_transicion'), SF('sfx_t3_lapiz_tacha'), SF('sfx_t3_lapiz_escribe'),
      SF('amb_t3_consola'), SF('amb_t3_transportador'), SF('amb_t3_gaviotas'), SF('amb_t3_crujidos'), SF1('amb_mar_noche')]
      .concat(Object.keys(IMG).map(k => B.primero(IMG[k])).filter(q => q && !q.falta).map(q => q.src))
      .concat(B.viento.MUESTRAS_RUTAS || [], B.viento.UI_RUTAS, B.t3.pianoRutas(), [CANCION.do, CANCION.roto, 'voz/t3/t3_021p.mp3', 'voz/t3/t3_015n.mp3']),
    escenas: [
      /* 0 · Arranque sin palabras: el laboratorio de noche, justo donde acabó T2 */
      { id: 'e0', titulo: 'Entrada', planos: [
        { id: 'p0', nombre: 'Negro', negro: true, auto: 1, amb: [AMB.labBajo, AMB.mar, AMB.zumbidoBajo], mus: MUS.lab },
        { id: 'p0a', nombre: 'El laboratorio, esa misma noche', img: IMG.labNoche, pj: null, auto: 4, amb: [AMB.lab, AMB.mar, AMB.zumbido, AMB.consola] }
      ] },
      /* 1 · La calibración de Noa (repaso de T1 y T2 en la consola holográfica) */
      { id: 'e1', titulo: 'Calibración', planos: [
        { id: 'p1a', nombre: 'Amaro: una calibración', img: IMG.amaroCalibra, amb: LABA, mus: MUS.lab, pj: null, antes: .4,
          lineas: [
            { id: 't3_001', quien: 'AMARO', pj: { q: 'AMARO', pose: 'tableta' }, texto: 'Bueno. Antes de volver a encender nada, vamos a ver si lo de Santiago se te ha quedado.' },
            { id: 't3_002', quien: 'NOA', img: IMG.noaCansada, pj: { q: 'NOA', pose: 'aburrida' }, texto: '¿Un examen? ¿Ahora?', espera: .4 },
            { id: 't3_003', quien: 'AMARO', img: IMG.amaroCalibra, imgs: [{ en: .7, img: IMG.consola }], pj: { q: 'AMARO', pose: 'explica' }, sfx: [{ src: SF1('sfx_destello'), en: .68, vol: .5 }],
              texto: 'Una calibración. Para ti.', espera: .8 }
          ] },
        { id: 'p1b', nombre: 'Repaso en la consola', img: IMG.consola, amb: LABI, mus: MUS.lab, pj: null, auto: .3,
          inter: { tipo: 'repaso',
            cartel: 'La consola del Transportador va a <b>calibrarte</b>: tres pruebas rápidas sobre lo que ya sabes. Une cada instrumento con su afinación y con lo que suena cuando lee Do, responde cuatro preguntas de transporte escrito y separa sus ventajas y desventajas.',
            cartelCorto: 'Toca una ficha y después su hueco (o arrástrala). Si no encaja, vuelve a su sitio: prueba otra vez.' } },
        { id: 'p1c', nombre: 'Amaro sonríe a medias', img: IMG.amaroSonrie, amb: LABA, pj: null, auto: 2.6, sfx: [{ src: SF1('sfx_anillo_encaja'), t: .1, vol: .5 }] }
      ] },
      /* 2 · Amaro elige el destino */
      { id: 'e2', titulo: 'El destino', planos: [
        { id: 'p2a', nombre: 'Hoy elijo yo', img: IMG.amaroDestino, amb: LABA, mus: MUS.lab, pj: null,
          lineas: [
            { id: 't3_004', quien: 'AMARO', pj: { q: 'AMARO', pose: 'tableta' }, imgs: [{ en: .42, img: IMG.holoRosalia }], sfx: [{ src: SF1('sfx_ui_clic'), t: .4 }, { src: SF1('sfx_ui_clic'), t: .7 }, { src: SF1('sfx_destello'), en: .4, vol: .5 }],
              texto: 'Hoy elijo yo. Nada de irse tan atrás en el tiempo. Un concierto en el Teatro Rosalía, en 2026. Un sitio tranquilo.',
              claves: { claves: ['Teatro Rosalía · 2026'], ens: [.45], pos: 'arriba' } },
          ] },
        { id: 'p2b', nombre: 'El Transportador se activa', img: IMG.maquina, amb: LABA, mus: MUS.tension, pj: null, auto: 3.4,
          sfx: [{ src: SF1('sfx_maquina_arranca'), t: .1 }, { src: SF1('sfx_anillos_giran'), t: 1.2 }] }
      ] },
      /* 3 · El salto y la llegada a bastidores del Rosalía */
      { id: 'e3', titulo: 'Teatro Rosalía, 2026', planos: [
        { id: 'p3a', nombre: 'El salto', tunel: { de: 2100, a: 2026 }, dur: 5, blanco: 2.2, sfxBlanco: SF1o('sfx_flash_blanco'), amb: [], mus: MUS.tension, sfx: [{ src: SF1('sfx_salto_tiempo'), t: 0 }] },
        /* (Iago 4-nov, GUION 3b) SECUENCIA CINEMÁTICA (~33 s): el ensayo de la cantante suena sin cortes de principio a fin, cada vez
           más cerca (js/secuencia.js); el camerino se ancla a la quiebra del la5 (audio/t3/tiempos_t3.json: la5 31,80 s · quiebra 32,42 s) */
        { id: 'p3s', nombre: 'Entrada · A Coruña, 2026', img: IMG.dronBahia, amb: [], mus: false, pj: null, auto: .1,
          inter: { tipo: 'secuencia', mp3: CANCION.roto, dur: 33.46, la5: 31.8, quiebra: 31.56, antesCamerino: 6,
            planos: { dron: [IMG.dronBahia, IMG.dronCiudadVieja, IMG.dronRiego, I3('dron_rosalia_f0', 'Primer fotograma del vídeo de dron hacia la fachada del Rosalía')], sala: IMG.salaEnsayo, llegada: IMG.llegada, regidora: IMG.regidora,
              pasillo: IMG.pasillo, camerino: [IMG.camerinoPiano, IMG.cantanteCanta], agudo: IMG.agudo },
            vids: { montaje: 'vid/dron_montaje.mp4', llegada: 'vid/llegada_bastidores.mp4' },   /* (Iago 4-nov 22:37) los 4 planos de dron en un solo vídeo con cortes directos */
            amb: { dron: [{ src: [SF('sfx_t3_plaza_atardecer'), SF1('amb_ciudad2100')], vol: .3 }, AMB.mar, AMB.gaviotas], sala: [AMB.salaBaja, AMB.crujidosBajo], bastidores: [AMB.bastidores, AMB.crujidos], pasillo: [AMB.pasillo, AMB.crujidosBajo], camerino: [AMB.camerino] },
            sfxPasos: SFx(SF('sfx_t3_pasos_pasillo'), SF1('sfx_pasos_rapidos')), sfxRota: SF('sfx_t3_voz_rota'),
            lineas: {
              narr: { id: 't3_006', quien: 'NARRADOR', texto: 'A Coruña, 2026. Teatro Rosalía de Castro. Faltan quince minutos para el recital.', claves: { claves: ['A Coruña · 2026', 'Teatro Rosalía de Castro'], ens: [.05, .42], pos: 'arriba' } },
              reg: { id: 't3_007', quien: 'REGIDORA', sfx: [{ src: SF1('sfx_pasos_rapidos'), t: 0, vol: .5 }, { src: SFx(SF('sfx_t3_pinganillo_clic'), SF1('sfx_ui_clic')), en: .25, vol: .7 }],
                texto: '¡Por fin! Tú eres la de prácticas, ¿no? Toma la carpeta y ve al camerino dos. Quince minutos.' },
              noa: { id: 't3_008', quien: 'NOA', img: IMG.noaCarpeta, pj: { q: 'NOA', pose: 'sorpresa' }, texto: 'Eh… sí. Claro. Camerino dos.' } } } }
      ] },
      /* 4 · El camerino: la cantante, afónica, no llega al agudo */
      { id: 'e4', titulo: 'El camerino', planos: [
        { id: 'p4c', nombre: '¿Hay que suspender?', img: IMG.panico, amb: [AMB.camerino, AMB.crujidosBajo], mus: MUS.teatroBajo, pj: null,
          lineas: [
            { id: 't3_009', quien: 'CANTANTE', texto: 'No llego. Hoy no llego al agudo. ¡Hay que suspender!', espera: .3 },
            { id: 't3_010', quien: 'NOA', img: IMG.noaCamerino, pj: { q: 'NOA', pose: 'pensativa' }, texto: '¿Y si se la bajamos? Yo sé reescribirla en otra tonalidad…' },
            { id: 't3_011', quien: 'PIANISTA', pj: null, img: IMG.pianistaReloj,               texto: 'En quince minutos no da tiempo a copiar nada. Pero no hace falta: te la toco más grave leyendo esta misma partitura.',
              claves: { claves: ['La misma partitura'], ens: [.78], pos: 'arriba' } },
            { id: 't3_012', quien: 'CANTANTE', pj: null, img: IMG.duda, texto: '¿Sin escribirla?', espera: .3 },
            { id: 't3_013', quien: 'PIANISTA', pj: null, img: IMG.pianistaAtril, texto: 'Sin escribirla. Lo hago en la cabeza mientras toco.',
              claves: { claves: ['En la cabeza'], ens: [.55], pos: 'arriba' }, espera: .5 }
          ] }
      ] },
      /* 5 · El pianista se lo explica a Noa (láminas dibujadas en código) */
      { id: 'e5', titulo: 'En la cabeza', planos: [
        /* (Iago 4-nov) el pianista lo enseña a lápiz sobre la A4 del atril; los trazos van con la voz (pausas medidas en voz/t3/t3_014*.mp3) */
        { id: 'p5a', nombre: 'Cómo se transporta en la cabeza', img: IMG.atrilPiano, amb: [AMB.camerino], mus: false, pj: null, antes: .4,
          lineas: [
            { id: 't3_014', quien: 'PIANISTA', lamina: { tipo: 'atril' },
              al: [{ t: 4.1, fn: c => B.lamina.anota('texto', c) }, { t: 5.55, fn: c => B.lamina.anota('arm', c) }, { t: 8.5, fn: c => B.lamina.anota('lee', c) }],
              texto: 'Mira. Primero piensas en la tonalidad nueva: un tono más grave, do mayor. Así que tacho la armadura: fuera los dos sostenidos. Luego lees cada nota y tocas la que está un tono más abajo.', espera: .8 },
            { id: 't3_014b', quien: 'PIANISTA',
              al: [{ t: 1.95, fn: c => B.lamina.anota('sol', c) }, { t: 3.3, fn: c => B.lamina.anota('do', c) }, { t: 5.25, fn: c => B.lamina.anota('nombres', c) }, { t: 12.4, fn: c => B.lamina.anota('dibujo', c) }],
              texto: 'Y un truco, si te ayuda: tacho la clave de sol y apunto una clave de do en cuarta. Así cada nota cae justo una segunda más abajo; solo tienes que tocarla una octava más arriba. Lo que cuenta es el dibujo: subir, bajar, saltar.', espera: 1.2 }
          ] },
        /* (Iago 4-nov) ahora el ALUMNO coge el lápiz de la repisa y marca su partitura antes de tocar */
        { id: 'p5b', nombre: 'Tu partitura, a lápiz', img: IMG.atrilPiano, amb: [AMB.camerino], mus: false, pj: null, auto: .3,
          inter: { tipo: 'marcar',
            cartel: 'Ahora tú. Coge el <b>lápiz</b> de la repisa del atril y marca tu partitura antes de tocar, como el pianista: <b>1</b> · tacha la armadura · <b>2</b> · tacha la clave de sol · <b>3</b> · escribe la clave de do en 4.ª en su línea.',
            cartelCorto: 'Coge el lápiz de la repisa (púlsalo o arrástralo) y marca tu partitura: con el ratón o con el dedo.' } }
      ] },
      /* 6 · Interactivo 1b: leer por claves (clave de do en 4.ª, armadura de Do M, una 8.ª más arriba) */
      { id: 'e6', titulo: 'Por claves', planos: [
        { id: 'p6', nombre: 'Leer en clave de do en 4.ª', img: IMG.atrilPiano, amb: [AMB.camerino], mus: false, pj: null, auto: .3,
          inter: { tipo: 'claves', compases: [0, 8], ejemplo: 1,   // (Iago 4-nov) la página entera, seguida
            cartel: 'Prueba el truco con tu partitura marcada: lee cada nota iluminada en <b>clave de do en 4.ª</b>, con la armadura de <b>Do mayor</b> (sin alteraciones), y tócala en el teclado. Suena <b>una octava más arriba</b> de lo que lees en esa clave. Lee la página entera, nota a nota; la primera ya está hecha.',
            cartelCorto: 'Lee la nota en <b>clave de do en 4.ª</b> (4.ª línea = Do) y tócala. Teclado del ordenador: <b>A S D F G H J</b> = Do Re Mi Fa Sol La Si.' } }
      ] },
      /* 7 · Interactivo 2: transporte mental en tiempo real, con el teclado (ensayo con el pianista) */
      { id: 'e7', titulo: 'Ensayo', planos: [
        { id: 'p7', nombre: 'Transporte mental en tiempo real', img: IMG.atrilPiano, amb: [AMB.camerino], ambInter: [], mus: false, pj: null, auto: .3,
          inter: { tipo: 'mental',
            tempos: [{ nombre: 'Lento', bpm: 50, compases: [0, 8], espera: true, guia: true }, { nombre: 'Medio', bpm: 66, compases: [0, 8], guia: false }, { nombre: 'De concierto', bpm: 80, compases: [0, 8], guia: false }],   // (Iago 4-nov) solo los 8 compases de la hoja
            cartel: 'Ensaya con el pianista. La partitura está en <b>Re mayor</b>; tú tocas cada nota <b>una 2.ª mayor más grave</b> (en <b>Do mayor</b>, sin alteraciones) antes de que pase el cursor. Tres tempos: <b>lento</b> (el cursor te espera), <b>medio</b> y <b>de concierto</b>. Antes de cada uno, un compás de entrada con el metrónomo (1 · 2 · 3). Los fallos no restan: sigue tocando.',
            cartelCorto: 'Toca cada nota <b>una 2.ª M más grave</b> antes de que pase el cursor. Ratón o teclado: <b>A S D F G H J</b> = Do Re Mi Fa Sol La Si.' } }
      ] },
      /* 8 · El recital: la canción, transportada; el agudo llega; el público aplaude */
      { id: 'e8', titulo: 'El recital', planos: [
        { id: 'p8a', nombre: 'Sala, tres, dos, uno…', img: IMG.aviso, amb: [AMB.sala, AMB.crujidos], mus: false, pj: null, antes: .5,
          lineas: [
            { id: 't3_014c', quien: 'NOA', sfx: [{ src: SFx(SF('sfx_t3_pinganillo_clic'), SF1('sfx_ui_clic')), t: 0, vol: .7 }], texto: 'Sala, tres, dos, uno…', espera: .6 }
          ] },
        { id: 'p8b', nombre: 'La sala', img: IMG.sala, amb: [AMB.salaBaja, AMB.crujidosBajo], mus: false, pj: null, auto: 4.6, sfx: [{ src: SF('sfx_t3_telon'), t: .2, vol: .7 }] },
        { id: 'p8c', nombre: 'El recital · Do M', img: IMG.recital, amb: [], mus: false, pj: null, auto: .2,
          inter: { tipo: 'recital', mp3: CANCION.do, c1: CANCION.c1, fin: 44.6,   /* (Iago 4-nov) aplausos justo al acabar el piano (último acorde ~44,5 s) */ rotulo: 'Tonalidad transportada · <b>Do M</b> · una 2.ª M más grave',
            /* (Iago 4-nov) un plano nuevo cada ~4 s; mientras Noa piensa (t3_015n), ella mirando emocionada desde bastidores */
            /* (D2) un plano cada 4–6 s, con fundido de 1 s. La voz entra a los 4,80 s (tiempos_t3.json); Noa piensa de 8,3 a ~27 s
               (plano de Noa en bastidores al empezar y al acabar su frase); el agudo (sol5) a los 31,8 s, con la cantante; voz hasta 40,5 s */
            rotuloDura: 3.5,
            imgs: [{ t: 0, img: IMG.recital }, { t: 4.4, img: FD(IMG.recitalCantante) }, { t: 13.0, img: FD(IMG.recitalCantante, 1.01) }, { t: 17.4, img: FD(IMG.recital) },
              { t: 22.0, img: FD(IMG.aviso, 1.01) }, { t: 27.4, img: FD(IMG.publico) }, { t: 31.2, img: FD(IMG.recitalCantante, 1.02) }, { t: 36.0, img: FD(IMG.recitalPianista) },
              { t: 40.6, img: FD(IMG.recital, 1.01) }, { t: 45.0, img: FD(IMG.publico, 1.01) }],
            interior: { t: 8.3, duck: -8, img: FD(IMG.aviso),
              linea: { id: 't3_015n', quien: 'NOA', nombre: 'Noa (piensa)', estilo: 'interior', filtro: 'interior',
                texto: 'Papá… estoy en Coruña, en una época en la que todavía no habías nacido. He venido al Teatro Rosalía y es increíble: me gusta mucho más que como está ahora. Y he ayudado a una cantante a salvar su concierto… he aprendido a transportar en la cabeza. Tu máquina ya está dando sus frutos.' } } } },
        { id: 'p8d', nombre: 'Aplausos', img: IMG.aplausos, amb: [AMB.sala, AMB.crujidos], mus: false, pj: null, auto: 4.2,
          sfx: [{ src: SF('sfx_t3_aplausos'), t: 0, vol: 1 }] },
        { id: 'p8e', nombre: 'En el pasillo', img: IMG.pasilloCantante, amb: [AMB.pasillo, AMB.crujidosBajo], mus: MUS.teatroBajo, pj: null,
          lineas: [
            { id: 't3_015', quien: 'CANTANTE', pj: null, texto: 'Gracias, de verdad. ¿Cómo te llamas?' },
            { id: 't3_015b', quien: 'NOA', img: IMG.pasilloNoa, pj: { q: 'NOA', pose: 'emocion' }, texto: 'Noa.', espera: .4 },
            { id: 't3_015c', quien: 'REGIDORA', pj: null, img: IMG.pasilloRegidora, texto: '¡La de prácticas no se llama Noa!', espera: .2 }
          ] },
        { id: 'p8f', nombre: 'Noa sale del teatro', img: IMG.saleTeatro, amb: [AMB.mar, { src: SF('sfx_t3_plaza_atardecer'), vol: .12 }], mus: MUS.teatroBajo, pj: null, auto: 3.4,
          sfx: [{ src: SF1('sfx_pasos_rapidos'), t: 0, vol: .6 }, { src: SF1('sfx_pulsera_vibra'), t: 1.6, vol: .5 }] }
      ] },
      /* 9 · Resumen del narrador */
      { id: 'e9', titulo: 'Transporte mental', planos: [
        { id: 'p9', nombre: 'Resumen', img: IMG.escenario, amb: [AMB.salaBaja, AMB.crujidosBajo], mus: MUS.resumen, pj: null, antes: .5,
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
        { id: 'p10b', nombre: 'Vuelta al laboratorio', video: S1 + 'vid/vuelta.mp4', tunel: { de: 2026, a: 2100 }, dur: 5, blanco: 1.1, amb: LABB,
          sfx: [{ src: SF1('sfx_salto_tiempo'), t: 0, vol: .6 }, { src: SF1('sfx_destello'), t: 3.6, vol: .9 }, { src: SF1('sfx_llegada'), t: 3.9, vol: 1.1 }, { src: SF1('sfx_impacto'), t: 3.9, vol: .5 }, { src: SF1o('sfx_maquina_apaga'), t: 4.4, vol: .6 }] },
        { id: 'p10c', nombre: 'La bronca', img: IMG.amaroSeria, amb: LABA, mus: MUS.bronca, pj: null, antes: 1,
          lineas: [
            { id: 't3_018', quien: 'AMARO', pj: { q: 'AMARO', pose: 'helada' }, imgs: [{ en: .22, img: IMG.registro }, { en: .9, img: IMG.amaroSeria }], laminas: [{ en: .22, lamina: REG }, { en: .9, lamina: null }],
              texto: 'Noa. He encontrado esto. La coordenada del viaje que hiciste antes a Santiago no la puse yo. Y alguien borró otra.', espera: .4 },
            { id: 't3_019', quien: 'NOA', img: IMG.noaCulpa, pj: { q: 'NOA', pose: 'arrepentida' }, texto: 'Fui yo. Lo siento, Amaro. De verdad.', espera: .8 },
            { id: 't3_020', quien: 'AMARO', img: IMG.amaroEnfadada, pj: { q: 'AMARO', pose: 'alarma' }, texto: 'Te he mandado a sitios donde podías hacerte daño. Confiaba en ti.', espera: .5 },
            { id: 't3_021', quien: 'NOA', img: IMG.noaCuaderno, mus: MUS.padre, pj: { q: 'NOA', pose: 'emocion' },
              texto: 'Ya lo sé. Es que… creo que con esta máquina podría volver a ver a mi padre.', espera: .8 },
            { id: 't3_022', quien: 'AMARO', img: IMG.amaroAblanda, lamina: null, pj: { q: 'AMARO', pose: 'explica' }, texto: '…Venga. Vamos a intentarlo. Pero juntas, y sin más secretos. ¿Dónde crees que podrías encontrarlo?', espera: .4 },
            { id: 't3_023', quien: 'NOA', img: IMG.recuerdo, pj: { q: 'NOA', pose: 'emocion' }, texto: 'En la plaza de María Pita. Íbamos allí después del laboratorio: él se pedía algo en una terraza y sacábamos los instrumentos.',
              claves: { claves: ['Plaza de María Pita'], ens: [.08], pos: 'arriba' } },
            { id: 't3_024', quien: 'AMARO', img: IMG.amaroAblanda, pj: { q: 'AMARO', pose: 'explica' }, texto: '¿Y cuándo?', espera: .3 },
            { id: 't3_025', quien: 'NOA', img: IMG.noaDecidida, pj: { q: 'NOA', pose: 'pensativa' }, texto: 'Cuando sea. Pero antes del accidente.', espera: .6 }
          ] },
        /* 🤖💡 pista sutil de la madre: un mensaje en la pulsera que Noa aparta sin contestar (texto en pantalla, sin voz) */
        { id: 'p10d', nombre: 'Un mensaje de mamá', img: IMG.pulsera, amb: LABB, mus: MUS.lab, pj: null, auto: 9,
          aviso: { de: 'Mamá', txt: '¿Vienes a cenar?', tipo: 'mama', botones: true }, sfx: [{ src: SF1('sfx_pulsera_vibra'), t: .05, vol: .7 }, { src: SFx(SF('sfx_t3_pulsera_notif'), SF1('sfx_notificacion')), t: .2, vol: .6 }],
          /* (Iago 4-nov) Noa duda ~2 s (la notificación quieta, con un leve pulso), dice en voz baja «Mamá… ahora no.» (t3_021p) y pulsa «Posponer» */
          /* (D2) llega a los 0,2 s · Noa duda en silencio ~1,7 s · a los 1,9 s «Mamá… ahora no.» (2,77 s, sin caja) · acaba a los 4,67 s
             y justo entonces el dedo baja (4,6 s) y pulsa «Posponer» (~5,0 s; antes, 3,8 s) · se pliega y sale hacia los 7,1 s */
          imgs: [{ t: 6.6, img: FD(IMG.noaAparta, .8) }], al: [{ t: .9, fn: c => B.capas.pospone(c, { duda: 3.7, voz: 'voz/t3/t3_021p.mp3', vozEn: 1.0 }) }] }   /* (Iago 4-nov) el dedo de Noa pulsa «Posponer»: se ve que la aparta */
      ] },
      /* 11 · Ejercicio final OPCIONAL: transporte mental con el generador (3 niveles) */
      { id: 'e11', titulo: 'Ejercicio final', planos: [
        { id: 'p11', nombre: 'Ejercicio final (opcional)', img: IMG.consola, amb: LABI, mus: false, pj: null, auto: .3,
          inter: { tipo: 'mentalFinal',
            cartel: 'Antes del último viaje, si quieres, practica el transporte mental: <b>tres melodías nuevas</b>, cada una un poco más difícil. Mira el intervalo, piensa la tonalidad nueva y toca cada nota transportada en el teclado. Al final verás tu nota.',
            cartelCorto: 'Toca cada nota transportada en el teclado. <b>A S D F G H J</b> = Do Re Mi Fa Sol La Si · <b>W E T Y U</b> = las negras.' } }
      ] },
      /* 12 · El viaje final: plaza de María Pita, 2070 (cliffhanger) */
      { id: 'e12', titulo: 'María Pita, 2070', planos: [
        /* (Iago 4-nov) el salto como en T1/T2: Noa subida en el Transportador (vídeo del salto de T1) y luego el túnel */
        { id: 'p12a', nombre: 'Noa en el Transportador', video: S1 + 'vid/salto.mp4', img: { src: N('lab_juntas') }, dur: 5,   /* (D2) reserva SIN vida (nada de anillos) si faltara el vídeo */ amb: LABB, mus: MUS.tension, pj: null,
          desc: 'Vídeo del salto (T1): Noa en el Transportador, los anillos se disparan',
          sfx: [{ src: SF1('sfx_maquina_arranca'), t: .1 }, { src: SF1('sfx_anillos_giran'), t: 1.2 }, { src: SF1o('sfx_flash_blanco'), t: 3.6, vol: .6 }] },   /* (D2) el vídeo acaba en blanco: de ahí, el túnel */
        { id: 'p12b', nombre: 'El salto a 2070', tunel: { de: 2100, a: 2070 }, dur: 5, blanco: 2.2, sfxBlanco: SF1o('sfx_flash_blanco'), amb: [], mus: MUS.tension, sfx: [{ src: SF1('sfx_salto_tiempo'), t: 0 }] },
        /* (Iago 4-nov) la música del final (A: mus/t3_mus_final.mp3) arranca aquí; su GOLPE coincide con «Continuará…» (p12e) */
        { id: 'p12c', nombre: 'Plaza de María Pita, 2070', fondoVid: 'vid/mariapita.mp4', img: IMG.plaza, amb: [AMB.plaza, AMB.gaviotas], mus: MUS.final, pj: null, antes: 1,
          sfx: [{ src: SF1('sfx_llegada'), t: 0, vol: .7 }], al: [{ t: 0, fn: () => { B._tFinal0 = B.ahora(); } }],
          lineas: [
            { id: 't3_026', quien: 'NOA', img: IMG.noaPlaza, pj: { q: 'NOA', pose: 'emocion' }, texto: 'He querido venir aquí… porque aquí éramos felices.', claves: { claves: ['Plaza de María Pita · 2070'], ts: [.2], pos: 'arriba' }, enMus: MUS.final.en.t3_026, espera: MUS.final.en.mano - MUS.final.en.t3_026 - 3.6 }   /* (D2) la mano entra a los 5,8 s de la música */
          ] },
        { id: 'p12d', nombre: 'Una mano en el hombro', img: IMG.mano, amb: [AMB.plazaBaja, AMB.gaviotasBaja], pj: null, antes: 1.2,
          imgs: [{ t: 0, img: IMG.mano }],
          lineas: [
            { id: 't3_027', quien: 'CHICO', texto: 'Iria, ¿dónde te habías metido?', enMus: MUS.final.en.t3_027 },
            { id: 't3_028', quien: 'NOA', img: IMG.noaGira, pj: null, texto: 'Me confundes. Me llamo Noa.', enMus: MUS.final.en.t3_028 },
            { id: 't3_029', quien: 'CHICO', texto: 'Ah, perdona. Pensaba que eras…', enMus: MUS.final.en.t3_029 },
            { id: 't3_030', quien: 'NOA', texto: '…Iria se llama mi madre. Espera un momento… ¿Cómo te llamas tú?', enMus: MUS.final.en.t3_030 }   /* (D2) acaba a los 23,05 s: 0,4 s de silencio y el golpe */
          ] },
        /* corte a negro; «Continuará…» (motor) cae en el golpe de la música (MUS.final.golpe, s desde que arranca en p12c) */
        { id: 'p12e', nombre: 'Negro', negro: true, auto: .1, amb: [], pj: null, inter: { tipo: 'esperaGolpe', golpe: MUS.final.golpe, adelanto: .2, minimo: .2, sinGolpe: 1.4 } }
      ] }
    ]
  });
})(window.TR);
