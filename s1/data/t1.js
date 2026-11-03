/* ══════════════════════════════════════════════════════════════════════
   TRANSPORTE 1 · «El mismo dibujo, a otra altura» — datos de la sesión (GUION-S1 v2 + GUION-VOZ-T1 v1 · tema de Noa v4)
   Se edita a mano. Formato:
   · Personajes: TR.PJ[CLAVE] = { nombre, color, lado, alto, _: pose por defecto, poses:[…] }
       pose → img/t1/pj/<clave en minúsculas>_<pose>.webp (WebP con alfa, medio cuerpo)
   · Escena: { id, titulo, planos:[…] }
   · Plano: { id, nombre, img, desc, amb:[{src,vol}], ambInter, mus:{src,vol} | false, vida:[{tipo,zona,n,color}],
              pj:{q,pose,lado} | null, aviso, negro, efecto, sfx:[{src,t}], poses:[{t,q,pose}], al:[{t,fn}], antes (s),
              lineas:[…], inter:{tipo,…}, despues:[…], video, tunel:{de,a}, dur, auto (s, plano sin frases) }
     img (y mus/amb src) admite SUSTITUTOS: [{src:'img/t1/bueno.webp'}, {src:'img/t1/otro.webp', zoom, cx, cy, luz, ajuste, mueve, vida}]
     → se usa el primero que exista; cuando C4 deje el bueno, entra solo (y con él la «vida» del plano).
   · Línea: { id:'t1_001' (→ voz/t1/t1_001.mp3), quien, texto, pj, poses:[{t (s) | en (0–1), q, pose}], filtro:'telefono'|'radio',
              claves:{claves:[…], ts:[…]}, img, sfx:[{src, t|en}], aviso:{de, txt, tipo}, estilo:'interior'|'radio', espera, voz:false }
   ══════════════════════════════════════════════════════════════════════ */
'use strict';
(function (B) {
  B.CFG = { blipConVoz: false };
  const V = () => B.viento;

  B.PJ = {
    NOA: { nombre: 'Noa', color: '#7fd4ff', lado: 'izq', alto: .86, _: 'neutra', poses: ['neutra', 'aburrida', 'pulsera_fastidio', 'pulsera_interes', 'traviesa', 'sorpresa', 'pensativa', 'emocion'],
      mira: { neutra: 'izq', aburrida: 'izq', traviesa: 'izq', sorpresa: 'izq', pensativa: 'izq', emocion: 'izq', pulsera_fastidio: 'frente', pulsera_interes: 'frente' } },
    AMARO: { nombre: 'Dra. Amaro', color: '#c9b6ff', lado: 'der', alto: .84, _: 'explica', poses: ['explica', 'tableta', 'alarma', 'helada'],
      mira: { explica: 'izq', tableta: 'der', alarma: 'der', helada: 'der' } },   // explica ya la volteó C4 en el fichero
    MADRE: { nombre: 'Mamá', color: '#ffc48a', lado: 'der', alto: .8, marco: 'llamada', _: 'llama', poses: ['llama', 'decepcion'] },
    PIANISTA: { nombre: 'Pianista', color: '#ffe08a', lado: 'der', alto: .8, _: 'sonrie', poses: ['sonrie', 'resopla'], mira: { sonrie: 'izq', resopla: 'der' } },
    TALLADOR: { nombre: 'Tallador', color: '#e9b07a', lado: 'der', alto: .84, _: 'talla', poses: ['toca', 'talla', 'sorpresa', 'sonrie'], mira: { toca: 'izq', talla: 'frente', sorpresa: 'der', sonrie: 'izq' } },
    TROMPISTA: { nombre: 'Trompista', color: '#ffd9a0', lado: 'der', poses: [] }, CLARINETISTA: { nombre: 'Clarinetista', color: '#ffd9a0', lado: 'der', poses: [] },
    NINA: { nombre: 'Niña', color: '#ffd1a1', lado: 'der', alto: .74, _: 'toca', poses: ['toca', 'frustrada', 'feliz', 'senala'], mira: { toca: 'frente', frustrada: 'frente', feliz: 'der', senala: 'der' } }
  };

  /* el tema de Noa v4 (C4, 2-nov 15:53): 6/8, Mi m → Sol M, corchea a 170. [nota de CONCIERTO, corcheas]. El saxo alto lo lee 6.ª M más aguda.
     acordes por compás: [corcheas, bajo, [voces]] (el piano arpegia en corcheas, como la maqueta) */
  B.TEMA = {
    corchea: 60 / 170, compas: '6/8', grupos: [3, 3],
    mel: [
      [['e/4', 1], ['f#/4', 1], ['g/4', 1], ['b/4', 3]], [['c/5', 3], ['b/4', 1], ['a/4', 2]], [['a/4', 2], ['g/4', 1], ['f#/4', 1], ['e/4', 2]], [['f#/4', 6]],
      [['e/4', 1], ['f#/4', 1], ['g/4', 1], ['b/4', 2], ['e/5', 1]], [['e/5', 3], ['d/5', 2], ['c/5', 1]], [['b/4', 3], ['c/5', 1], ['eb/5', 2]], [['d/5', 4], ['c/5', 1], ['a/4', 1]],
      [['b/4', 2], ['d/5', 1], ['g/5', 3]], [['f#/5', 2], ['e/5', 1], ['d/5', 3]], [['eb/5', 3], ['d/5', 1], ['c/5', 2]], [['c/5', 2], ['d/5', 1], ['f/5', 3]],
      [['d/5', 3], ['b/4', 1], ['g/4', 2]], [['e/5', 3], ['eb/5', 3]], [['d/5', 2], ['c/5', 1], ['b/4', 1], ['a/4', 2]], [['g/4', 6]]
    ],
    acordes: [
      [[6, 'e/2', ['g/3', 'b/3', 'd/4', 'f#/4']]], [[6, 'c/3', ['e/3', 'g/3', 'b/3']]], [[6, 'a/2', ['g/3', 'c/4', 'e/4']]], [[3, 'b/2', ['a/3', 'e/4', 'f#/4']], [3, 'b/2', ['a/3', 'd#/4', 'f#/4']]],
      [[6, 'e/2', ['g/3', 'b/3', 'e/4']]], [[3, 'c/3', ['e/3', 'g/3', 'b/3', 'f#/4']], [3, 'd/3', ['a/3', 'd/4', 'f#/4']]], [[3, 'b/2', ['g/3', 'd/4']], [3, 'c/3', ['eb/3', 'g/3', 'a/3']]], [[3, 'd/3', ['g/3', 'b/3']], [3, 'd/3', ['a/3', 'c/4', 'f#/4']]],
      [[6, 'g/2', ['b/3', 'd/4', 'g/4']]], [[3, 'f#/2', ['b/3', 'd/4', 'f#/4']], [3, 'e/2', ['g/3', 'b/3', 'd/4']]], [[6, 'eb/3', ['g/3', 'bb/3', 'eb/4']]], [[6, 'f/2', ['a/3', 'c/4', 'f/4']]],
      [[6, 'g/2', ['b/3', 'd/4', 'g/4']]], [[3, 'c/3', ['e/3', 'g/3', 'c/4']], [3, 'c/3', ['eb/3', 'g/3', 'c/4']]], [[3, 'd/3', ['g/3', 'b/3', 'd/4']], [3, 'd/3', ['a/3', 'c/4', 'f#/4']]], [[6, 'g/2', ['b/3', 'd/4', 'g/4']]]
    ]
  };

  /* tres flautas de caña (C4: PNG horizontales, embocadura a la izquierda, 5 agujeros). base = nota con los 5 tapados (MIDI).
     El dibujo, como el arranque del tema de Noa: mi–fa♯–sol–si (5, 4, 3 y 1 agujeros tapados) */
  const FL = {
    grande: { id: 'grande', nombre: 'Grande', img: 'img/t1/flauta_grande.webp', base: 64, ancho: 1000, agujeros: [.366, .446, .521, .597, .674], agY: .55, color: '#ffcf7a' },
    mediana: { id: 'mediana', nombre: 'Mediana', img: 'img/t1/flauta_mediana.webp', base: 66, ancho: 790, agujeros: [.372, .453, .529, .605, .682], agY: .48, color: '#9fe3b0' },
    pequena: { id: 'pequena', nombre: 'Pequeña', img: 'img/t1/flauta_pequena.webp', base: 69, ancho: 610, agujeros: [.37, .448, .523, .599, .675], agY: .53, color: '#8fd0ff' }
  };
  const DIBUJO = [5, 4, 3, 1], RITMO = [1, 1, 1, 3];

  /* niveles de los efectos de Splice (medidos 2-nov: media del cuarto más fuerte en ventanas de 100 ms, dBFS) → objetivo.
     Los ambientes vienen ya a −20 LUFS y se ajustan con su vol. Para retocar uno, cambia su objetivo. */
  B.SFX_NIVEL = {
    sfx_alarma: [-16.6, -17], sfx_anillo_encaja: [-26.4, -22], sfx_anillos_giran: [-16.3, -19], sfx_destello: [-17.4, -20], sfx_estuche_cierra: [-19.7, -18],
    sfx_llave_saxo: [-18, -18], sfx_llegada: [-13, -18], sfx_maquina_arranca: [-10.2, -18], sfx_notificacion: [-16.7, -21], sfx_pasos_rapidos: [-23.8, -19],
    sfx_puerta_scifi: [-9.9, -19], sfx_pulsera_vibra: [-4.3, -20], sfx_radio_interferencia: [-12.7, -22], sfx_salto_tiempo: [-15.3, -17], sfx_tallar_cana: [-14.7, -19],
    sfx_ui_clic: [-17.9, -28], sfx_ui_error: [-16.3, -24], sfx_ui_ok: [-22.1, -24],
    sfx_arpa_sube: [-16.4, -23], sfx_arpa_baja: [-16.8, -23]   /* (3-nov) arpas de Splice: suaves, por debajo de la voz */
  };
  /* paisaje sonoro (Splice, s1/sfx/): ambientes en bucle con fundido entre planos y golpes en su momento */
  const SF = n => 'sfx/' + n + '.mp3';
  const SFo = n => B.existe(SF(n)) ? SF(n) : SF(n + '_sint');   // el bueno si ya está; si no, el marcador sintetizado
  const AMB = {
    aula: { src: SF('amb_aula'), vol: .3 }, ciudad: { src: SF('amb_ciudad2100'), vol: .42 }, mar: { src: SF('amb_mar_noche'), vol: .3 },
    lab: { src: SF('amb_laboratorio'), vol: .36 }, labBajo: { src: SF('amb_laboratorio'), vol: .16 }, paleo: { src: SF('amb_paleolitico'), vol: .24 },
    fuego: { src: SF('amb_fuego'), vol: .3 }, fuegoBajo: { src: SF('amb_fuego'), vol: .14 }, paleoBajo: { src: SF('amb_paleolitico'), vol: .1 },
    orquesta: { src: SF('amb_orquesta_afinando'), vol: .34 }, orquestaBajo: { src: SF('amb_orquesta_afinando'), vol: .08 },
    pasillo: { src: SF('amb_pasillo'), vol: .42 },
    grillos: { src: [SF('amb_grillos'), SF('amb_grillos_sint')], vol: .2 }, viento: { src: [SF('amb_viento_juncos'), SF('amb_viento_juncos_sint')], vol: .22 }, ciudadLejos: { src: SF('amb_ciudad2100'), vol: .3 }
  };
  /* música (Suno, s1/mus/); mientras no llegue, el tema v4 sintetizado (cuerdas + piano, bajo); en el Paleolítico, solo ambiente */
  const SINT = { src: 'mus/t1_tema_sint.mp3', vol: .26 };
  const MUS = {
    viaje: { src: [{ src: 'mus/mus_viaje.mp3', vol: .55, bucle: false }, { src: 'mus/t1_tension_sint.mp3', vol: .22 }] },   // todo el viaje de vuelta, continua; resuelve al llegar a 2100
    coruna: { src: [{ src: 'mus/mus_coruna2100.mp3', vol: .5 }, SINT] }, corunaBaja: { src: [{ src: 'mus/mus_coruna2100.mp3', vol: .2 }, { src: 'mus/t1_tema_sint.mp3', vol: .12 }] },
    paleo: { src: [{ src: 'mus/mus_paleolitico.mp3', vol: .45 }] }, paleoBajo: { src: [{ src: 'mus/mus_paleolitico.mp3', vol: .16 }] },   // misma pista: solo baja (no se corta)
    cierre: { src: [{ src: 'mus/mus_cierre.mp3', vol: .6 }, { src: 'mus/t1_tema_sint.mp3', vol: .34 }] },
    ensayo: { src: 'mus/t1_ensayo.mp3', vol: .8, bucle: false },
    entrada: { src: 'mus/t1_entrada.mp3', vol: .62, bucle: false },   // el saxo de Noa que se acerca (compases 11–16): ciudad → pasillo → manos
    tension: { src: [{ src: 'mus/mus_tension.mp3', vol: .42 }, { src: 'mus/t1_tension_sint.mp3', vol: .3 }] },   // desde que Noa entra en la máquina hasta el salto
    tensionBaja: { src: [{ src: 'mus/mus_tension.mp3', vol: .26 }, { src: 'mus/t1_tension_sint.mp3', vol: .2 }] }
  };

  /* fondos (C4, s1/img/t1/) con sustitutos mientras falten; la «vida» va con cada encuadre */
  const VIDA = {
    aula: [{ tipo: 'polvo', zona: [.42, .02, .52, .8], n: 22, color: '#ffe2b8' }, { tipo: 'atril', q: [.46, .385, .545, .38, .50, .585, .405, .60] },
      { tipo: 'faro', zona: [.565, .062, .1, 0] }, { tipo: 'luces', zona: [.69, .2, .27, .07], n: 14, color: '#cfe9ff' }],
    conserv: [{ tipo: 'luces', zona: [.3, .05, .7, .35], n: 22, color: '#ffe9c0' }, { tipo: 'drones', zona: [.35, .0, .5, .08], n: 3 }, { tipo: 'polvo', zona: [.3, .4, .7, .5], n: 10, color: '#fff0d0' }],
    corunaEntera: [{ tipo: 'faro', zona: [.163, .305, .4, 0] }, { tipo: 'drones', zona: [.2, .03, .75, .22], n: 6 }, { tipo: 'luces', zona: [.33, .36, .6, .12], n: 26, color: '#a8d4ff' },
      { tipo: 'luces', zona: [.8, .42, .16, .08], n: 12, color: '#cfe9ff' }, { tipo: 'respira', zona: [.82, .44, .05, .06], color: '#9fe4ff', vel: 3 },
      { tipo: 'leds', p: [[.52, .32, '#ff5a5a'], [.94, .23]], f: 3 }, { tipo: 'reflejos', zona: [.05, .52, .85, .25], n: 24, color: '#bfe0ff' }],
    lab: [{ tipo: 'anillos', zona: [.38, .05, .35, .62], n: 3 }, { tipo: 'onda', zona: [.765, .215, .07, .075] }, { tipo: 'onda', zona: [.89, .415, .08, .055], color: '#7fffd0', tam: 1.5 },
      { tipo: 'polvo', zona: [0, 0, 1, 1], n: 18, color: '#cfe8ff' }, { tipo: 'luces', zona: [.66, .55, .3, .2], n: 10, color: '#58c8ff' }],
    paleo: [{ tipo: 'chispas', zona: [.68, .48, .12, .24], n: 16, color: '#ffb35a' }, { tipo: 'reflejos', zona: [.55, .28, .45, .12], n: 20, color: '#ffd9a0' },
      { tipo: 'polvo', zona: [.3, .2, .7, .6], n: 10, color: '#ffe2b8' }],
    paleoCerca: [{ tipo: 'chispas', zona: [.5, .5, .2, .36], n: 18, color: '#ffb35a' }, { tipo: 'reflejos', zona: [0, .14, 1, .16], n: 20, color: '#ffd9a0' }],
    orquesta: [{ tipo: 'respira', zona: [.15, 0, .7, .7], color: '#ffcf8a' }, { tipo: 'polvo', zona: [0, 0, 1, .8], n: 16, color: '#ffe8c0' }],
    foto: [{ tipo: 'respira', zona: [.25, .1, .5, .7], color: '#ffcf8a' }, { tipo: 'polvo', zona: [0, 0, 1, 1], n: 14, color: '#ffe8c0' }],
    fotoReal: [{ tipo: 'respira', zona: [.1, .08, .46, .7], color: '#ffcf8a' }, { tipo: 'respira', zona: [.1, .08, .14, .2], color: '#ffe2a8', vel: 1.6 },
      { tipo: 'anillos', zona: [.72, .0, .28, .55], n: 2, color: '#58c8ff' }, { tipo: 'polvo', zona: [0, 0, 1, 1], n: 14, color: '#ffe8c0' }],
    prueba: [{ tipo: 'anillos', zona: [.27, .02, .47, .7], n: 3 }, { tipo: 'onda', zona: [.745, .3, .1, .07] }, { tipo: 'onda', zona: [.885, .475, .1, .06], color: '#7fffd0', tam: 1.5 },
      { tipo: 'polvo', zona: [.2, 0, .6, .9], n: 18, color: '#cfe8ff' }],
    llegadaFin: [{ tipo: 'reflejos', zona: [0, .45, .45, .15], n: 14, color: '#ffd9a0' }, { tipo: 'chispas', zona: [.4, .15, .2, .6], n: 6, color: '#cfeeff' }],
    llegada: [{ tipo: 'anillos', zona: [.27, .55, .5, .3], n: 2, color: '#9fe4ff' }, { tipo: 'chispas', zona: [.3, .1, .45, .75], n: 22, color: '#cfeeff' }, { tipo: 'reflejos', zona: [0, .4, .45, .2], n: 14, color: '#ffd9a0' }]
  };
  /* ocultaPj: personajes que YA salen en la lámina → no se les pone la pose encima (Iago/C4: nunca el mismo personaje dos veces).
     Encuadres «sin gente» (zoom) para las frases con reacción: labCentro (la máquina), pruebaAmaro (sin Amaro), tallador (sin Noa). */
  const IMG = {
    aula: { src: 'img/t1/aula2100.webp', ocultaPj: ['NOA', 'PIANISTA'], vida: VIDA.aula },
    conserv: { src: 'img/t1/conservatorio2100.webp', ocultaPj: ['NOA'], vida: VIDA.conserv },
    riazor: { src: 'img/t1/dron_riazor.webp', vida: [{ tipo: 'faro', zona: [.107, .393, .25, 0] }, { tipo: 'luces', zona: [.56, .28, .42, .08], n: 20, color: '#cfe9ff' },
      { tipo: 'pulso', zona: [.6, .37, .08, .1], color: '#9fe4ff', vel: .6 }, { tipo: 'respira', zona: [.6, .37, .08, .1], color: '#9fe4ff', vel: 3 },
      { tipo: 'leds', p: [[.735, .1, '#ff5a5a'], [.495, .25], [.36, .32]], f: 3 }, { tipo: 'reflejos', zona: [0, .52, .7, .4], n: 22, color: '#bfe0ff' }] },
    orzan: { src: 'img/t1/coruna2100.webp', vida: VIDA.corunaEntera },   // la vista aprobada de la portada (Monte de San Pedro)
    torre: { src: 'img/t1/dron_torre.webp', vida: [{ tipo: 'faro', zona: [.36, .114, .42, 0] }, { tipo: 'drones', zona: [.45, .0, .55, .25], n: 4 },
      { tipo: 'luces', zona: [.42, .38, .58, .12], n: 22, color: '#a8d4ff' }, { tipo: 'respira', zona: [.84, .47, .1, .07], color: '#9fe4ff', vel: 3 },
      { tipo: 'reflejos', zona: [.72, .55, .28, .2], n: 16, color: '#bfe0ff' }] },
    lab: { src: 'img/t1/laboratorio.webp', ocultaPj: ['NOA', 'AMARO'], vida: VIDA.lab },
    labCentro: { src: 'img/t1/laboratorio.webp', zoom: 2, cx: .55, cy: .4,
      vida: [{ tipo: 'anillos', zona: [.16, 0, .7, 1], n: 3 }, { tipo: 'polvo', zona: [0, 0, 1, 1], n: 18, color: '#cfe8ff' }] },
    pruebaAmaro: { src: 'img/t1/prueba.webp', zoom: 1.25, cx: .4, cy: .4, ocultaPj: ['NOA'],
      vida: [{ tipo: 'anillos', zona: [.34, .025, .59, .875], n: 3 }, { tipo: 'onda', zona: [.93, .375, .07, .09] }, { tipo: 'polvo', zona: [.2, 0, .7, 1], n: 18, color: '#cfe8ff' }] },
    llegada: { src: 'img/t1/llegada_fin.webp', vida: VIDA.llegadaFin, ocultaPj: ['NOA'] },   /* (Iago 22:32) = último fotograma de llegada.mp4 */
    modulo: { src: 'img/t1/lab_modulo.webp', ocultaPj: ['NOA'], vida: [{ tipo: 'chispas', zona: [.17, .3, .25, .4], n: 14, color: '#7fd4ff' }, { tipo: 'respira', zona: [.12, .25, .35, .5], color: '#58c8ff', vel: 2 },
      { tipo: 'polvo', zona: [.4, 0, .6, 1], n: 12, color: '#ffe2b8' }] },
    tallador: [{ src: 'img/t1/tallador.webp', vida: VIDA.paleoCerca }, { src: 'img/t1/paleolitico.webp', zoom: 1.6, cx: .68, cy: .5, vida: VIDA.paleoCerca, ocultaPj: ['TALLADOR', 'NINA'] }],
    trompa: [{ src: 'img/t1/viaje_trompa_s18.webp', ocultaPj: ['NOA'] }],   // ya 1920×1080: a pantalla completa
    clarinete: [{ src: 'img/t1/viaje_clarinete_s19.webp', ocultaPj: ['NOA'] }],
    orquesta: { src: 'img/t1/orquesta2100.webp', ocultaPj: ['NOA'], vida: VIDA.orquesta },
    fotoPadre: { src: 'img/t1/foto_padre_clarinete.webp', vida: VIDA.fotoReal },
    definicion: { src: 'img/t1/definicion.webp', vida: [{ tipo: 'polvo', zona: [0, 0, 1, 1], n: 20, color: '#ffe2b8' }, { tipo: 'respira', zona: [.25, .2, .5, .6], color: '#58b8ff' },
      { tipo: 'reflejos', zona: [0, .82, 1, .15], n: 16, color: '#ffd9a0' }] },
    cierre: { src: 'img/t1/foto_padre_clarinete.webp', luz: .78, vida: VIDA.fotoReal }
  };
  /* láminas nuevas (PLANOS-T1.md): ninguna imagen más de ~7 s. Si el fichero aún no está, se queda la lámina anterior.
     ocultaPj: quien ya sale en la lámina no lleva la pose encima. */
  const N = k => 'img/t1/' + k + '.webp';
  const O = function () { return [].concat.apply([], arguments); };   // lámina con sustitutas: la primera que exista
  const POLVO = c => [{ tipo: 'polvo', zona: [0, 0, 1, 1], n: 14, color: c || '#ffe2b8' }];
  /* amaro_llamada: la pantallita de llamada sobre la pulsera (x .70–.83, y .30–.55), sus tres iconos y la máquina al fondo */
  const AMARO_LL = [{ tipo: 'parpadeo', zona: [.695, .3, .135, .25], color: '#9fe4ff' }, { tipo: 'vibra', zona: [.72, .55, .08, .06], n: 2 },
    { tipo: 'leds', p: [[.716, .515], [.756, .515], [.792, .515]], f: 1.8, tam: 1.4 }, { tipo: 'anillos', zona: [.07, .05, .35, .7], n: 2, color: '#58c8ff' },
    { tipo: 'onda', zona: [.83, .75, .14, .05], color: '#7fe4ff', tam: 1.3 }, { tipo: 'polvo', zona: [0, 0, 1, 1], n: 14, color: '#cfe8ff' }];
  Object.assign(IMG, {
    pasillo: [{ src: N('pasillo2100'), vida: [{ tipo: 'onda', zona: [.272, .33, .042, .05], color: '#9fe4ff', tam: 1.5 }, { tipo: 'parpadeo', zona: [.268, .29, .05, .13], color: '#9fe4ff' },
      { tipo: 'pulso', zona: [.745, .2, .06, .18], color: '#9fe4ff', vel: .5 }, { tipo: 'parpadeo', zona: [.955, .42, .045, .09], color: '#9fe4ff' }].concat(POLVO()) },
      { src: 'img/t1/conservatorio2100.webp', zoom: 1.35, cx: .5, cy: .45, ocultaPj: ['NOA'], vida: POLVO() }],
    aulaManos: [{ src: N('aula_manos'), ocultaPj: ['NOA'], vida: [{ tipo: 'leds', p: [[.25, .637]], f: 1.6 }].concat(POLVO()) }, { src: 'img/t1/aula2100.webp', zoom: 2.2, cx: .3, cy: .62, ocultaPj: ['NOA'], vida: POLVO() }],
    aulaPianista: { src: N('aula_pianista'), ocultaPj: ['PIANISTA', 'NOA'], vida: [{ tipo: 'atril', q: [.104, .304, .242, .304, .204, .637, .05, .637] }, { tipo: 'faro', zona: [.35, .06, .1, 0] }].concat(POLVO()) },
    aulaNoaPapel: { src: N('aula_noa_papel'), ocultaPj: ['NOA'], vida: [{ tipo: 'atril', q: [.729, .422, .904, .415, .867, .807, .683, .815] }, { tipo: 'respira', zona: [.655, .08, .04, .06], color: '#ffe9b0', vel: 1.5 },
      { tipo: 'leds', p: [[.215, .805]], f: 1.4 }].concat(POLVO()) },
    aulaAtriles: { src: N('aula_atriles'), vida: [{ tipo: 'parpadeo', zona: [.1, .2, .8, .55], color: '#9fe4ff' }].concat(POLVO('#cfe8ff')) },
    aulaPulsera: { src: N('aula_pulsera'), ocultaPj: ['NOA'], vida: [{ tipo: 'vibra', zona: [.415, .27, .2, .36] }, { tipo: 'respira', zona: [.81, .05, .05, .08], color: '#ffe9b0', vel: 1.5 }] },
    aulaNoaLlamada: { src: N('aula_noa_llamada'), ocultaPj: ['NOA', 'PIANISTA'], vida: [{ tipo: 'vibra', zona: [.48, .55, .15, .22] }, { tipo: 'faro', zona: [.66, .13, .06, 0] }].concat(POLVO()) },
    aulaTeclas: { src: N('aula_teclas'), ocultaPj: ['PIANISTA', 'NOA'], vida: POLVO() },
    aulaSale: { src: N('aula_sale'), ocultaPj: ['NOA', 'PIANISTA'], vida: [{ tipo: 'atril', q: [.52, .407, .595, .40, .56, .57, .47, .575], vel: 2 }, { tipo: 'faro', zona: [.60, .10, .1, 0] }, { tipo: 'leds', p: [[.24, .50]], f: 3 }].concat(POLVO()) },
    corunaPlaza: { src: N('coruna_plaza'), vida: [{ tipo: 'parpadeo', zona: [.09, .2, .04, .18], color: '#9fe4ff' }, { tipo: 'leds', p: [[.13, .25], [.33, .27], [.41, .265], [.52, .29], [.57, .27], [.89, .32], [.97, .23], [.83, .33]], f: 1.3, tam: 1.3 },
      { tipo: 'leds', p: [[.645, .09, '#ff5a5a'], [.65, .205]], f: 3 }].concat(POLVO('#fff0d0')) },
    corunaPrisa: { src: N('coruna_prisa'), ocultaPj: ['NOA'], vida: [{ tipo: 'faro', zona: [.09, .18, .08, 0] }, { tipo: 'leds', p: [[.148, .578], [.395, .712], [.675, .437], [.71, .29], [.27, .225]], f: 2.6 },
      { tipo: 'parpadeo', zona: [.915, .335, .065, .08], color: '#9fe4ff' }, { tipo: 'onda', zona: [.925, .36, .045, .03], color: '#9fe4ff', tam: 1.2 }, { tipo: 'luces', zona: [0, 0, 1, .1], n: 14, color: '#a8d4ff' }] },
    riazorMarcador: { src: N('riazor_marcador'), vida: [{ tipo: 'barrido', zona: [.40, .215, .42, .43], n: 5 }, { tipo: 'pulso', zona: [.2, .25, .19, .4], color: '#9fe4ff', vel: .45 },
      { tipo: 'respira', zona: [.24, .3, .11, .26], color: '#cfefff', vel: 3.2 }, { tipo: 'luces', zona: [.82, .35, .18, .3], n: 14, color: '#dfefff' }] },
    orzanCancion: { src: N('orzan_cancion'), vida: [{ tipo: 'parpadeo', zona: [.5, .03, .34, .43], color: '#9fe4ff' }, { tipo: 'notas', zona: [.545, .125, .25, .09], n: 6, sesgo: -.1 },
      { tipo: 'notas', zona: [.54, .295, .25, .09], n: 6, sesgo: -.1, color: '#ffe2a8' }, { tipo: 'faro', zona: [.928, .225, .08, 0] }, { tipo: 'reflejos', zona: [.5, .5, .5, .2], n: 16, color: '#bfe0ff' }] },
    orzanAfina: { src: N('orzan_afina'), vida: [{ tipo: 'aguja', zona: [.704, .305, 0, .112], dx: .004 }, { tipo: 'parpadeo', zona: [.62, .11, .2, .22], color: '#9fe4ff' },
      { tipo: 'faro', zona: [.913, .235, .08, 0] }, { tipo: 'reflejos', zona: [.7, .42, .3, .2], n: 14, color: '#bfe0ff' }] },
    cocheLluvia: { src: N('coche_lluvia'), vida: [{ tipo: 'lluvia', zona: [0, 0, 1, 1], n: 150 }, { tipo: 'leds', p: [[.68, .405, '#ff3030']], f: 2.4, tam: 2.4 }, { tipo: 'respira', zona: [.5, .58, .17, .07], color: '#7fe4ff', vel: 1.2 },
      { tipo: 'faro', zona: [.158, .37, .06, 0] }, { tipo: 'reflejos', zona: [.3, .65, .7, .3], n: 22, color: '#9fc8ff' }] },
    labHolomapa: { src: N('lab_holomapa'), vida: [{ tipo: 'globo', zona: [.45, .07, .44, .73] }, { tipo: 'pulso', zona: [.67, .26, .04, .05], color: '#ffe2a8', vel: .8 },
      { tipo: 'leds', p: [[.62, .43, '#ffe2a8'], [.74, .42, '#ffe2a8'], [.57, .53, '#ffe2a8'], [.81, .51, '#ffe2a8'], [.52, .43, '#ffe2a8']], f: 1.8 },
      { tipo: 'chispas', zona: [.6, .5, .14, .32], n: 14, color: '#9fe4ff' }, { tipo: 'onda', zona: [.86, .6, .13, .07], color: '#7fe4ff', tam: 1.4 }].concat(POLVO('#cfe8ff')) },
    pruebaConsola: { src: N('prueba_consola'), vida: [{ tipo: 'traza', zona: [.40, .48, .33, .07], periodo: .16 }, { tipo: 'parpadeo', zona: [.38, .33, .36, .25], color: '#9fe4ff' },
      { tipo: 'respira', zona: [.47, .59, .15, .06], color: '#9fe4ff', vel: 2 }, { tipo: 'leds', p: [[.775, .43], [.81, .52], [.86, .46], [.915, .41]], f: 1.5 }].concat(POLVO('#cfe8ff')) },
    moduloHumo: { src: N('modulo_humo'), vida: [{ tipo: 'humo', zona: [.28, .0, .28, .45], n: 12 }, { tipo: 'arco', zona: [.22, .38, .05, .09] }, { tipo: 'chispas', zona: [.2, .35, .14, .3], n: 20, color: '#ffd28a' },
      { tipo: 'leds', p: [[.204, .445], [.204, .47], [.204, .5], [.204, .53], [.204, .555], [.414, .47], [.414, .49], [.305, .565], [.39, .565]], color: '#ff2a2a', f: 4 }, { tipo: 'respira', zona: [0, 0, 1, 1], color: '#ff3b3b', vel: 3 }] },
    pruebaAlarma: [{ src: N('prueba_alarma'), vida: [{ tipo: 'faro', zona: [.87, .15, .3, 0], color: '#ff4a3a', vel: 3.5 }, { tipo: 'respira', zona: [0, 0, 1, 1], color: '#ff3b3b', vel: 3 },
        { tipo: 'parpadeo', zona: [.40, .37, .35, .2], color: '#ff6a5a' }, { tipo: 'leds', p: [[.775, .43], [.81, .52], [.86, .46], [.915, .41]], f: 4 }] },
      { src: 'img/t1/prueba.webp', zoom: 1.25, cx: .4, cy: .4, luz: .75, ocultaPj: ['NOA'], vida: [{ tipo: 'respira', zona: [0, 0, 1, 1], color: '#ff3b3b', vel: 3 }] }],
    pruebaNoa: { src: N('prueba_noa_traviesa'), ocultaPj: ['NOA'], vida: [{ tipo: 'respira', zona: [.0, .55, .7, .4], color: '#58c8ff', vel: 1.6 }, { tipo: 'leds', p: [[.815, .555], [.815, .58]], color: '#ff4a3a', f: 3 },
      { tipo: 'polvo', zona: [.1, .1, .8, .8], n: 16, color: '#cfe8ff' }] },
    llegadaCerca: { src: 'img/t1/llegada_fin.webp', zoom: 1.3, cx: .5, cy: .42, ocultaPj: ['NOA'], vida: [{ tipo: 'reflejos', zona: [0, .5, 1, .3], n: 16, color: '#ffd9a0' }] },
    paleoLejos: [{ src: N('paleo_lejos'), ocultaPj: ['NOA'], vida: [{ tipo: 'chispas', zona: [.55, .45, .1, .15], n: 10, color: '#ffb35a' }, { tipo: 'reflejos', zona: [0, .6, 1, .25], n: 16, color: '#ffd9a0' }] },
      { src: 'img/t1/paleolitico.webp', vida: VIDA.paleo }],
    paleoPadreHija: { src: N('paleo_padre_hija'), ocultaPj: ['TALLADOR', 'NINA'], vida: VIDA.paleoCerca },
    paleoTalla: { src: N('paleo_talla'), ocultaPj: ['TALLADOR'], vida: [{ tipo: 'chispas', zona: [.2, .5, .3, .4], n: 8, color: '#ffb35a' }].concat(POLVO()) },
    paleoAcerca: { src: N('paleo_acerca'), ocultaPj: ['NOA'], vida: [{ tipo: 'reflejos', zona: [0, .1, 1, .2], n: 14, color: '#ffd9a0' }, { tipo: 'chispas', zona: [.7, .4, .2, .3], n: 8, color: '#ffb35a' }] },
    paleoPadreFlauta: { src: N('paleo_padre_flauta'), ocultaPj: ['TALLADOR', 'NINA'], vida: [{ tipo: 'chispas', zona: [.05, .78, .17, .22], n: 16, color: '#ffb35a' },
      { tipo: 'reflejos', zona: [.55, .2, .3, .2], n: 14, color: '#ffd9a0' }, { tipo: 'respira', zona: [.8, .1, .12, .12], color: '#ffcf8a', vel: 1 }] },
    paleoNoaMira: { src: N('paleo_noa_mira'), ocultaPj: ['NOA'], vida: [{ tipo: 'reflejos', zona: [.65, .5, .35, .2], n: 16, color: '#ffd9a0' }, { tipo: 'polvo', zona: [.6, .1, .4, .6], n: 10, color: '#ffe2b8' }] },
    paleoPulsera: { src: N('paleo_pulsera_radio'), ocultaPj: ['NOA'], vida: [{ tipo: 'parpadeo', zona: [.40, .33, .16, .42], color: '#9fe4ff' }, { tipo: 'arco', zona: [.49, .45, .05, .12], color: '#9fe4ff' },
      { tipo: 'chispas', zona: [.42, .33, .16, .4], n: 10, color: '#bfeeff' }, { tipo: 'chispas', zona: [.85, .62, .15, .38], n: 14, color: '#ffb35a' }] },
    labRegistro: { src: N('lab_registro'), vida: [{ tipo: 'parpadeo', zona: [.36, .14, .6, .52], color: '#9fe4ff' },   // t1_023 v3: un punto lejano (−40 000, fijo) y dos borrosos sin fecha (el registro «se vuelve loco»)
      { tipo: 'leds', sec: true, tes: [.7], p: [[.415, .437, '#bff6ff']], tam: 4 },
      { tipo: 'leds', p: [[.75, .415, '#bff6ff'], [.867, .407, '#bff6ff'], [.758, .43, '#9fe4ff'], [.858, .392, '#9fe4ff']], f: 9, tam: 5 },
      { tipo: 'arco', zona: [.73, .37, .16, .09], color: '#9fe4ff' },
      { tipo: 'traza', zona: [.40, .62, .52, .025], periodo: .17 }].concat(POLVO('#cfe8ff')) },
    orquestaNoa: { src: N('orquesta_noa_saxo'), ocultaPj: ['NOA'], vida: [{ tipo: 'respira', zona: [.79, .04, .05, .08], color: '#ffe9b0', vel: 1.5 }, { tipo: 'polvo', zona: [0, 0, 1, .8], n: 16, color: '#ffe8c0' }] },
    defAbsoluto: { src: N('def_absoluto'), vida: POLVO() },
    defDosFormas: { src: N('def_dos_formas'), ocultaPj: ['NOA'], vida: [{ tipo: 'atril', q: [.28, .53, .47, .52, .45, .78, .22, .83], n: 3 },
      { tipo: 'polvo', zona: [.52, 0, .48, 1], n: 18, color: '#ffd98a' }, { tipo: 'respira', zona: [.55, .05, .42, .8], color: '#ffcf7a', vel: 1.2 }] },
    amaroLlamada: { src: N('amaro_llamada'), ocultaPj: ['AMARO'], vida: AMARO_LL },
    labLlamada: { src: 'img/t1/laboratorio.webp', zoom: 2, cx: .55, cy: .4, vida: [{ tipo: 'anillos', zona: [.16, 0, .7, 1], n: 3 }, { tipo: 'polvo', zona: [0, 0, 1, 1], n: 18, color: '#cfe8ff' }] },   // mientras: la máquina (sin gente) y la pose de Amaro
    defAbsolutoSi: { src: N('def_absoluto'), zoom: 1.45, cx: .6, cy: .55, vida: POLVO() },   // el segundo motivo, más cerca (fundido: misma lámina)
    trompaCerca: { src: 'img/t1/viaje_trompa_s18.webp', zoom: 1.3, cx: .5, cy: .45 }, clarineteCerca: { src: 'img/t1/viaje_clarinete_s19.webp', zoom: 1.3, cx: .5, cy: .45 },
    resInstr: { src: N('res_instrumentos'), vida: [{ tipo: 'polvo', zona: [0, 0, 1, 1], n: 18, color: '#ffe2b8' }, { tipo: 'respira', zona: [.1, .2, .8, .5], color: '#58b8ff' }] },
    resTaller: { src: N('res_taller'), vida: POLVO() },
    torrePuerta: { src: N('torre_puerta'), vida: [{ tipo: 'respira', zona: [.4, .35, .2, .55], color: '#9fe4ff', vel: .6 }] },   // luz por la rendija
    resOrq1: { src: N('res_orquesta1') }, resOrq2: { src: N('res_orquesta2') }, resOrq3: { src: N('res_orquesta3') },
    paleoPadreDa: { src: N('paleo_padre_da'), ocultaPj: ['TALLADOR', 'NINA'], vida: VIDA.paleoCerca },
    paleoNinaToca: { src: N('paleo_nina_toca'), ocultaPj: ['TALLADOR', 'NINA'], vida: VIDA.paleoCerca },
    resFlautas: { src: N('res_flautas'), vida: [{ tipo: 'polvo', zona: [0, 0, 1, 1], n: 16, color: '#ffe2b8' }] },
    cierreLab: { src: 'img/t1/laboratorio.webp', zoom: 2, cx: .55, cy: .4, luz: .5, vida: [{ tipo: 'apaga', zona: [.2, .05, .6, .9], dur: 9 }, { tipo: 'polvo', zona: [0, 0, 1, 1], n: 12, color: '#cfe8ff' }] },   // mientras no llegue cierre_noa_foto: la máquina, de noche, apagándose
    cierreNoa: { src: N('cierre_noa_foto'), ocultaPj: ['NOA'], vida: [{ tipo: 'apaga', zona: [0, 0, .4, .5], dur: 9, color: '#58c8ff' }, { tipo: 'respira', zona: [.86, .06, .06, .08], color: '#ffd9a0', vel: 1.4 },
      { tipo: 'polvo', zona: [0, 0, .5, .8], n: 12, color: '#cfe8ff' }] }   // la luz del Transportador se va apagando
  });

  B._IMG = IMG;   // (para las pruebas: comprobar la «vida» de cada lámina)
  /* sonidos de plano: la equivocación del prólogo, la flauta del tallador, la trompa con sus tonos y los dos clarinetes */
  const equivoca = c => { B.musicaCorta(); const t = B.ac().currentTime + .02; V().nota('saxo', 73, t, .62, .85); [48, 64, 67, 71].forEach(m => V().piano(m, t + .01, .9, .2)); };
  const flautaDibujo = (base, veces) => { const e8 = B.TEMA.corchea, sube = { 5: 0, 4: 2, 3: 3, 2: 5, 1: 7, 0: 9 }; let t = B.ac().currentTime + .05;
    for (let v = 0; v < (veces || 1); v++) { DIBUJO.forEach((k, i) => { V().nota('flauta', base + sube[k], t, RITMO[i] * e8 * .95, .7); t += RITMO[i] * e8; }); t += 2 * e8; } };
  const sacude = () => { ['fondo', 'capas'].forEach(id => { const e = document.getElementById(id); e.classList.remove('sacude'); void e.offsetWidth; e.classList.add('sacude'); }); };
  const alarmaRoja = () => { document.getElementById('efecto').className = 'ef-alarma'; };
  /* el motivo de Noa (mi–fa♯–sol–si, corcheas 1-1-1-3) en el saxo muestreado con su acorde de piano, bajito bajo la voz */
  const motivo = (mel, acorde) => { const T = B.teoria, e8 = B.TEMA.corchea, t0 = B.ac().currentTime + .05; let t = 0;
    acorde.forEach(k => V().piano(T.midi(k), t0, 6 * e8, .16));
    mel.forEach((k, i) => { const d = [1, 1, 1, 3][i] * e8; V().nota('saxo', T.midi(k), t0 + t, d * .96, .45); t += d; }); };
  /* (Iago 3-nov) ensoñación: el arpa empieza A LA VEZ que la pose pensativa y la ondulación; al entrar la voz del recuerdo, se retira */
  const ARPA_SUBE = B.existe(SF('sfx_arpa_sube')) ? SF('sfx_arpa_sube') : SF('sfx_arpa_sube_sint'), ARPA_BAJA = B.existe(SF('sfx_arpa_baja')) ? SF('sfx_arpa_baja') : SF('sfx_arpa_baja_sint');
  let arpaH = null;
  const arpaEntra = () => { arpaH = B.sfx(ARPA_SUBE, .8); };
  const arpaSale = () => { if (arpaH) { arpaH.parar(1.6); arpaH = null; } };
  const frase = (tipo, notas, t, d, vel) => { const t0 = B.ac().currentTime + (t || 0); notas.forEach((m, i) => V().nota(tipo, m, t0 + i * d, d * (i === notas.length - 1 ? 2.2 : .95), vel || .75)); };

  B.sesion({
    titulo: 'Transporte 1', subtitulo: 'El mismo dibujo, a otra altura', sup: 'Unidad 9 · 2.º GP',
    recursos: [FL.grande.img, FL.mediana.img, FL.pequena.img, 'img/t1/inst_saxo.webp', 'img/t1/inst_clarinete.webp', 'img/t1/inst_trompa.webp',
      SF('sfx_pulsera_vibra'), SF('sfx_notificacion'), SF('sfx_llave_saxo'), SF('sfx_estuche_cierra'), SF('sfx_pasos_rapidos'), SF('sfx_puerta_scifi'), SF('sfx_maquina_arranca'),
      SF('sfx_anillos_giran'), SF('sfx_alarma'), SF('sfx_salto_tiempo'), SF('sfx_llegada'), SF('sfx_radio_interferencia'), SF('sfx_tallar_cana'),
      SFo('sfx_zumbido_sube'), SFo('sfx_chispazo'), SFo('sfx_humo'), SFo('sfx_impacto'), SFo('sfx_flash_blanco'), SFo('sfx_maquina_apaga'), SF('sfx_anillo_encaja'), SF('sfx_destello'), SF('sfx_eco_trompista'), SF('sfx_eco_clarinetista'), SF('sfx_pasos_hierba'), SF('sfx_blanco_brillo'), SF('sfx_flash_sale'), ARPA_SUBE, ARPA_BAJA].concat(Object.keys(IMG).map(k => B.primero(IMG[k])).filter(q => q && !q.falta).map(q => q.src))
      .concat(B.viento.SAX_RUTAS, B.viento.UI_RUTAS, B.viento.MUESTRAS_RUTAS || []),
    escenas: [
      /* 0 · Entrada sin palabras (brief 3, C): la ciudad → el pasillo del conservatorio → las manos de Noa; su saxo se acerca */
      { id: 'e0', titulo: 'Entrada', planos: [
        { id: 'p0', nombre: 'Negro', negro: true, efecto: 'pulso', auto: 1.4, amb: [], mus: false, sfx: [{ src: SF('sfx_llave_saxo'), t: .3, vol: .5 }] },
        { id: 'p0a', nombre: 'A Coruña 2100', fondoVid: 'vid/portada_coruna2100.mp4', img: IMG.orzan, pj: null, auto: 5.5, amb: [AMB.ciudadLejos], mus: MUS.entrada },
        { id: 'p0b', nombre: 'Pasillo del conservatorio · 2100', img: IMG.pasillo, desc: 'Puertas de aulas; detrás, gente estudiando', pj: null, auto: 5.5, amb: [AMB.pasillo] },
        { id: 'p0c', nombre: 'Las manos de Noa', img: IMG.aulaManos, desc: 'Detalle: los dedos de Noa en las llaves del saxo', pj: null, auto: 3.2, amb: [{ src: SF('amb_aula'), vol: .18 }] }
      ] },
      /* 1 · Prólogo: el aula */
      { id: 'e1', titulo: 'El aula', planos: [
        { id: 'p1a0', nombre: 'Aula de estudio · 2100', img: IMG.aula, desc: 'Madera clara, paneles que respiran luz, atril holográfico, la Torre en la ventana',
          amb: [AMB.aula], mus: MUS.ensayo, vida: VIDA.aula, pj: null, auto: 3.6,   // Noa ya está tocando en la lámina: sin pose encima
          al: [{ t: .15 + 6 * 60 / 170, fn: equivoca }] },   // se equivoca en un sostenido al empezar el 2.º compás (Do♯ en vez de Do)
        { id: 'p1a', nombre: 'Aula de estudio · 2100', img: IMG.aula, amb: [AMB.aula], vida: VIDA.aula,
          lineas: [
            { id: 't1_001', quien: 'PIANISTA', img: IMG.aulaPianista, pj: { q: 'PIANISTA', pose: 'sonrie' }, texto: 'No te preocupes, Noa, es normal: tienes muchas alteraciones.' },
            { id: 't1_002', quien: 'NOA', img: IMG.aulaNoaPapel, imgs: [{ en: .55, img: IMG.aulaAtriles }], pj: { q: 'NOA', pose: 'aburrida' }, poses: [{ en: .6, pose: 'pensativa' }], texto: 'Pero si tu partitura está en mi menor, con un solo sostenido… ¿por qué tengo yo tantos?' },
            { id: 't1_002b', quien: 'PIANISTA', img: IMG.aulaPianista, pj: { q: 'PIANISTA', pose: 'sonrie' }, texto: 'Ah, eso es porque tu saxo…',
              sfx: [{ src: SF('sfx_pulsera_vibra'), en: .9 }], auto: .2 }   // la pulsera la corta en seco: sigue sola a la llamada
          ] },
        { id: 'p1b', nombre: 'Aula · la pulsera', img: O(IMG.aulaPulsera, IMG.aula), amb: [AMB.aula], vida: VIDA.aula, pj: null, antes: 1,
          aviso: { de: 'Mamá', txt: 'Llamada entrante' }, sfx: [{ src: SF('sfx_pulsera_vibra'), t: 0 }],
          lineas: [
            { id: 't1_003', quien: 'MADRE', filtro: 'telefono', pj: { q: 'MADRE', pose: 'llama' }, aviso: { de: 'Mamá', txt: 'En llamada' }, texto: 'Hola, cariño… ¿Vienes esta tarde? Podemos dar un paseo por el Orzán.' },
            { id: 't1_004', quien: 'NOA', img: IMG.aulaNoaLlamada, pj: { q: 'MADRE', pose: 'llama' }, poses: [{ en: .9, q: 'MADRE', pose: 'decepcion' }], aviso: { de: 'Mamá', txt: 'En llamada' },
              sfx: [{ src: SF('sfx_notificacion'), en: .92 }], texto: 'Ahora no puedo, mamá. Estoy practicando.', espera: 1.2 }
          ] },
        /* tras colgar, retoman el ensayo: el interactivo de las dos partituras (la duda de Noa se queda sin resolver) */
        { id: 'p1c', nombre: 'Aula · retoman el ensayo', img: IMG.aula, amb: [AMB.aula], vida: VIDA.aula, mus: false, auto: 2.4, pj: null,
          inter: { tipo: 'prologo', titulo: 'El tema de Noa · dos papeles', compases: 8,
            cartel: 'Mira las dos partituras: arriba, el <b>saxo alto</b> en Do♯ menor (4♯); abajo, el <b>piano</b> en Mi menor (1♯), con sus dos manos. Pulsa <b>▶ Las dos</b> y escucha.',
            pregunta: '¿Por qué dos partituras distintas suenan igual? Guárdate la pregunta.' } },
        /* (Iago, 2-nov) primero vibra la pulsera sobre el aula (~1,2 s) y solo después se ve a Amaro llamando desde el laboratorio */
        { id: 'p1d', nombre: 'Aula · mensaje del laboratorio', img: O(IMG.aulaPulsera, IMG.aula), amb: [AMB.aula], vida: VIDA.aula, pj: null, antes: 1.2,
          sfx: [{ src: SF('sfx_pulsera_vibra'), t: 0 }], aviso: { de: 'Laboratorio · Amaro', txt: 'Llamada entrante', tipo: 'lab' },
          lineas: [
            { id: 't1_005', quien: 'AMARO', nombre: 'Laboratorio · Amaro', filtro: 'telefono', mus: false, pj: { q: 'AMARO', pose: 'explica', lado: 'der', marco: 'llamada' },   /* (Iago 22:26) cuadrito de llamada de móvil, como la madre */
              aviso: { de: 'Laboratorio · Amaro', txt: 'Hoy es el día. Te esperamos en la Torre.', tipo: 'lab' }, texto: 'Noa. Hoy es el día. Te esperamos en la Torre.' }
          ] },
        { id: 'p1d2', nombre: 'Aula · a Noa se le enciende la mirada', img: O(IMG.aulaNoaLlamada, IMG.aulaPulsera, IMG.aula), amb: [AMB.aula], pj: null, auto: 1.6 },
        /* recoge deprisa: «Me tengo que ir.» mientras cierra el estuche; después, los pasos y la puerta */
        { id: 'p1e', nombre: 'Aula · recoge', img: O(IMG.aulaSale, IMG.aula), amb: [AMB.aula], vida: VIDA.aula, pj: null,
          sfx: [{ src: SF('sfx_estuche_cierra'), t: .1 }],
          lineas: [{ id: 't1_005b', quien: 'NOA', texto: 'Me tengo que ir.', auto: .3 }] },
        { id: 'p1e2', nombre: 'Aula · sale corriendo', img: O(IMG.aulaSale, IMG.aula), amb: [AMB.aula], pj: null, auto: 2,
          sfx: [{ src: SF('sfx_pasos_rapidos'), t: 0 }, { src: SF('sfx_puerta_scifi'), t: 1 }] }
      ] },
      /* 2 · Coruña 2100 (vista aprobada de la portada; láminas de calle para que ninguna dure más de ~7 s) */
      { id: 'e2', titulo: 'A Coruña, 2100', planos: [
        { id: 'p2a', nombre: 'Conservatorio 2100', img: IMG.conserv, desc: 'Fachada real modernizada', amb: [AMB.ciudad], mus: MUS.coruna, pj: null, vida: VIDA.conserv, antes: 2.2,
          lineas: [{ id: 't1_006', quien: 'NARRADOR', imgs: [{ en: .4, img: IMG.corunaPlaza }], texto: 'A Coruña, año 2100. Las máquinas hacen casi todo el trabajo, y la gente dedica sus días a lo que antes no tenía tiempo: tocar, bailar, pintar.', claves: { claves: ['A Coruña · 2100'], ts: [0], pos: 'arriba' } },
            { id: 't1_007', quien: 'NARRADOR', img: IMG.corunaPrisa, texto: 'Y aun así, todo el mundo sigue yendo con prisa a todas partes.', espera: 1.5 }] },
        { id: 'p2b', fondoVid: 'vid/dron_coruna.mp4', nombre: 'Riazor 2100 · dron', img: IMG.riazor, desc: 'Estadio blanquiazul de noche, sin escudos reales', amb: [AMB.ciudad], pj: null, antes: 2.5,
          lineas: [{ id: 't1_008', quien: 'NARRADOR', imgs: [{ en: .45, img: IMG.riazorMarcador }], texto: 'Riazor brilla toda la noche: el Depor es líder y va a por su décima Liga.', espera: 1.5 }] },
        { id: 'p2c', fondoVid: 'vid/portada_coruna2100.mp4', nombre: 'Playa del Orzán 2100', img: IMG.orzan, amb: [AMB.ciudad, AMB.mar], pj: null, antes: 2,
          lineas: [{ id: 't1_009', quien: 'NARRADOR', imgs: [{ en: .31, img: IMG.orzanCancion }, { en: .63, img: IMG.orzanAfina }], texto: 'Pero hay cosas que ya nadie sabe hacer a mano. Si una canción no te queda bien, la inteligencia artificial la cambia por ti. Si tu instrumento no está afinado, lo afina ella.', claves: { claves: ['Nadie sabe hacer nada a mano'], ts: [1.2], pos: 'arriba' }, espera: 1.2 }] },
        { id: 'p2d', fondoVid: 'vid/portada_coruna2100.mp4', nombre: 'La ciudad y la Torre', img: IMG.orzan, desc: 'La ciudad irreconocible → la Torre de Hércules, igual que siempre', amb: [AMB.mar, { src: SF('amb_ciudad2100'), vol: .2 }], pj: null, antes: 2.5,
          lineas: [{ id: 't1_010', quien: 'NARRADOR', imgs: [{ en: .35, img: IMG.torre }], texto: 'La ciudad está irreconocible. Solo una cosa sigue exactamente igual que hace dos mil años.', espera: 2.5 }] }
      ] },
      /* 3 · El laboratorio */
      { id: 'e3', titulo: 'El laboratorio', planos: [
        /* (Iago 3-nov) mientras dice «Debajo de la Torre…», primero la puerta real de la Torre con luz por la rendija; luego se abre al laboratorio */
        { id: 'p3a', nombre: 'Laboratorio bajo la Torre', img: O(IMG.torrePuerta, IMG.lab), desc: 'Puerta de la Torre (luz por la rendija) → piedra romana y cables; el Transportador en el centro',
          amb: [AMB.lab], mus: MUS.coruna, pj: null, vida: VIDA.lab, antes: 2,
          lineas: [
            { id: 't1_011', quien: 'NARRADOR', imgs: [{ en: .27, img: IMG.lab }, { en: .5, img: IMG.labCentro }], sfx: [{ src: SF('sfx_puerta_scifi'), en: .24 }], texto: 'Debajo de la Torre trabaja un laboratorio que no aparece en ningún mapa. Hacen lo único que la inteligencia artificial todavía no sabe hacer: una máquina que viaja como viaja el sonido, en ondas.', claves: { claves: ['El Transportador'], ts: [8.4], pos: 'arriba' } },
            { id: 't1_012', quien: 'NARRADOR', img: IMG.fotoPadre, imgs: [{ en: .47, img: IMG.cocheLluvia }], texto: 'La empezó el padre de Noa. No llegó a terminarla: hace tres años, un coche sin conductor tomó una mala decisión.', espera: .8 },
            { id: 't1_013', quien: 'AMARO', img: IMG.labCentro, imgs: [{ en: .53, img: IMG.labHolomapa }], pj: { q: 'AMARO', pose: 'explica' }, poses: [{ en: .62, pose: 'tableta' }], texto: 'El Transportador te llevará fuera de la Torre, a treinta metros de aquí. Solo eso. Si funciona, mañana podríamos ir de la Torre a cualquier sitio del mundo en un instante. Pero solo a otro lugar: la misma hora, el mismo día.' },
            { id: 't1_014', quien: 'NOA', img: IMG.fotoPadre, pj: { q: 'NOA', pose: 'neutra' }, texto: 'Le prometí que sería yo quien la probara.' }
          ] },
        { id: 'p3b', nombre: 'Detalle · el módulo', img: IMG.modulo, desc: 'Noa conecta a escondidas un viejo módulo con una pegatina gastada', amb: [AMB.lab], pj: null, auto: 3.8,
          sfx: [{ src: SF('sfx_ui_clic'), t: .35 }, { src: SF('sfx_destello'), t: .6 }] }   // (Iago 3-nov) el clic de enchufar, casi al aparecer el plano
      ] },
      /* 4 · La prueba: calibrar (octavas) → el módulo de Noa revienta → alarma. Tensión continua hasta el salto. */
      { id: 'e4', titulo: 'La prueba', planos: [
        { id: 'p4a', nombre: 'El Transportador', img: IMG.pruebaAmaro, desc: 'Noa dentro de la máquina; Amaro en la consola', amb: [AMB.lab], mus: MUS.tension,
          lineas: [{ id: 't1_015', quien: 'AMARO', imgs: [{ en: .5, img: IMG.pruebaConsola }], pj: { q: 'AMARO', pose: 'tableta' }, poses: [{ en: .45, pose: 'explica' }], texto: 'Frecuencia base: doscientos veinte hercios. Coloca sus octavas: por dos, por cuatro, por ocho y por dieciséis.' }],
          inter: { tipo: 'calibrar', base: 220, multiplos: [2, 4, 8, 16], rangos: [[400, 500], [760, 920], [1700, 2000], [3000, 4000]]   /* (Iago 22:30) cada octava en su sitio del deslizador: 40 %, 75 %, 20 %, 52 % */, tol: [1, 1, 1, 2],
            cartel: 'Calibra el Transportador: la base es <b>220 Hz</b>. Arrastra cada deslizador hasta su octava <b>exacta</b> (×2, ×4, ×8, ×16). Afina con − y + (o con las flechas) de 1 en 1 Hz.',
            destino: 'Destino: exterior de la Torre · 30 m', alarma: 'Coordenada temporal: activada', textoFin: 'Calibración perfecta. Pero… ¿qué es esa línea roja?',
            sfxActiva: [SF('sfx_maquina_arranca'), SF('sfx_anillos_giran')], sfxAlarma: SF('sfx_alarma') },
          despues: [
            { id: 't1_016', quien: 'AMARO', img: IMG.pruebaConsola, pj: { q: 'AMARO', pose: 'explica' }, texto: 'Calibración perfecta. Destino: fuera de la Torre, a treinta metros. Adelante.' }
          ] },
        { id: 'p4b', nombre: 'El módulo revienta', img: IMG.pruebaAmaro, amb: [AMB.lab], pj: null, auto: 6, imgs: [{ t: 3.9, img: IMG.moduloHumo }],   // riser 4,3 s → golpe a 3,9 s
          sfx: [{ src: SFo('sfx_zumbido_sube'), t: 0, vol: .75 }, { src: SFo('sfx_chispazo'), t: 3.68, vol: .85 }, { src: SFo('sfx_impacto'), t: 3.9, vol: .75 }, { src: SFo('sfx_humo'), t: 4.05, vol: .6 }],
          al: [{ t: 3.9, fn: sacude }, { t: 3.95, fn: alarmaRoja }] },
        { id: 'p4c', nombre: 'Alarma', img: IMG.pruebaAlarma, amb: [AMB.lab], pj: null, efecto: 'alarma', sfx: [{ src: SF('sfx_alarma'), t: .1, vol: .35 }],
          lineas: [
            { id: 't1_017', quien: 'AMARO', pj: { q: 'AMARO', pose: 'alarma' }, texto: '¿Qué es esto? ¡Noa, sal de ahí!' },
            { id: 't1_018', quien: 'NOA', img: IMG.pruebaNoa, pj: { q: 'NOA', pose: 'traviesa' }, texto: 'Todavía no.', espera: .6 }
          ] }
      ] },
      /* 5 · El salto: vídeo de Runway; mientras, túnel propio con el contador */
      { id: 'e5', titulo: 'El salto', planos: [
        /* (Iago 3-nov) el blanco dura más: al acabar el vídeo se sostiene 3,2 s (blanco pleno ≈3,5 s) con un brillo etéreo;
           mientras, entra despacio la música del Paleolítico y los ambientes de la playa muy bajos (siguen sin corte en p6a0) */
        { id: 'p5', blanco: 2.8, sfxBlanco: SFo('sfx_flash_blanco'),
          blancoPleno: { dur: 3.2, precarga: 'vid/llegada.mp4', sfx: [{ src: SF('sfx_blanco_brillo'), t: 0, vol: .8 }],
            mus: Object.assign({}, MUS.paleo, { fade: 3.6 }), musT: .2,
            amb: [Object.assign({}, AMB.paleoBajo, { fade: 2.5 }), Object.assign({}, AMB.fuegoBajo, { fade: 2.5 }), Object.assign({}, AMB.grillos, { vol: .08, fade: 2.5 }), Object.assign({}, AMB.viento, { vol: .08, fade: 2.5 })], ambT: .5 },
          nombre: 'El salto', video: 'vid/salto.mp4', tunel: { de: 2100, a: -40000 }, dur: 7, mus: MUS.tensionBaja, amb: [], desc: 'Runway 1080p: el anillo se dispara, túnel, contador 2100 → −40 000',
          sfx: [{ src: SF('sfx_salto_tiempo'), t: 0 }] }
      ] },
      /* 6 · Paleolítico */
      { id: 'e6', titulo: 'Paleolítico', planos: [
        { id: 'p6a0', blancoSale: { fd: 1.8, sfx: SF('sfx_flash_sale'), vol: .8 },   // (Iago 3-nov) el blanco se disuelve sobre el primer fotograma, con su efecto
          nombre: 'La llegada', video: 'vid/llegada.mp4', img: IMG.llegada, desc: 'Noa aparece junto al río, entre anillos de luz; se recoge el moño (v2, 5,0 s)', amb: [AMB.paleo, AMB.fuego, AMB.grillos, AMB.viento], mus: MUS.paleo, pj: null, auto: 5, dur: 5,
          sfx: [{ src: SF('sfx_llegada'), t: 0 }] },
        { id: 'p6a', funde: 1.2, nombre: 'La llegada · −40 000', img: IMG.llegada, amb: [AMB.paleo, AMB.fuego, AMB.grillos, AMB.viento], mus: MUS.paleo, pj: null, antes: 1.2,
          lineas: [
            { id: 't1_019', quien: 'NOA', texto: 'Demasiado antiguo… creo que he calculado mal el tiempo.', claves: { claves: ['−40 000 años'], ts: [0], pos: 'izq' }, espera: .8 },
            { id: 't1_019b', quien: 'NARRADOR', texto: 'Al parecer, el Transportador no solo la ha desplazado treinta metros: la ha llevado cuarenta mil años atrás.' },   /* (Iago 22:45) sobra lo de la playa */
            { id: 't1_019c', quien: 'NARRADOR', img: IMG.paleoLejos, imgs: [{ en: .45, img: IMG.paleoPadreHija }], texto: 'Junto al fuego hay un padre y su hija. Hace cuarenta mil años, las personas ya eran como nosotros: el mismo cuerpo, la misma voz… y las mismas ganas de hacer música.' },
            { id: 't1_019d', quien: 'NARRADOR', img: O(IMG.paleoTalla, IMG.tallador), imgs: [{ en: .5, img: IMG.paleoAcerca }], texto: 'Él talla flautas con las cañas del río. Noa se acerca despacio, sin hacer ruido, para escucharlas.',
              sfx: [{ src: SF('sfx_tallar_cana'), en: .03, vol: .6 }, { src: B.existe(SF('sfx_pasos_hierba')) ? SF('sfx_pasos_hierba') : SF('sfx_pasos_juncos_sint'), en: .5, vol: .75 }] }
          ] },
        { id: 'p6b', nombre: 'El tallador de flautas', img: IMG.tallador, desc: 'Un hombre talla tres flautas de caña junto al fuego y toca la grande', amb: [AMB.paleo, AMB.fuego, AMB.grillos, AMB.viento],
          pj: { q: 'TALLADOR', pose: 'talla' }, auto: 7.2, sfx: [{ src: SF('sfx_tallar_cana'), t: .2 }], imgs: [{ t: 1.6, img: IMG.paleoPadreFlauta }, { t: 5.2, img: IMG.paleoNoaMira }],
          poses: [{ t: 1.6, q: 'TALLADOR', pose: 'toca' }, { t: 5.2, q: 'NOA', pose: 'sorpresa' }],
          al: [{ t: 1.8, fn: () => flautaDibujo(FL.grande.base, 2) }] }
      ] },
      /* (Iago 22:47) fuera el interactivo de ordenar tres flautas: solo la del padre y la de la hija («para no liar») */
      /* 8 · Tocar juntos */
      { id: 'e8', titulo: 'Tocar juntos', planos: [
        /* (Iago 22:46) el padre le da la flautita a la hija y ella toca lo mismo, más agudo */
        { id: 'p8a', nombre: 'El padre le da la flauta pequeña', img: O(IMG.paleoPadreDa, IMG.tallador), mus: MUS.paleo, amb: [AMB.paleo, AMB.fuego, AMB.grillos, AMB.viento], pj: null, auto: 3.2 },
        { id: 'p8a2', nombre: 'La niña toca', img: O(IMG.paleoNinaToca, IMG.tallador), mus: MUS.paleoBajo, amb: [AMB.paleo, AMB.fuego, AMB.grillos, AMB.viento], pj: null, auto: 4.4,
          al: [{ t: .4, fn: () => flautaDibujo(FL.pequena.base, 1) }] },   // (Iago 3-nov) con la MISMA digitación que el padre: suena otra cosa (aún no encaja)
        { id: 'p8', nombre: 'El tallador y la niña', mus: MUS.paleoBajo, img: IMG.tallador, desc: 'El tallador con la flauta grande y una niña con la pequeña', pj: null, amb: [AMB.paleoBajo, AMB.fuegoBajo, AMB.grillos],
          inter: { tipo: 'juntos', fondoToca: IMG.paleoPadreFlauta, fondo: IMG.tallador, opciones: [5, 4, 3, 2, 1], flautas: [FL.grande, FL.pequena], quienG: 'Él · grande', quienP: 'Ella · pequeña', digitaciones: DIBUJO, ritmo: RITMO,
            cartel: 'Él toca la grande y ella la pequeña. Prueba primero con la <b>misma digitación</b> (los dos tapan todos los agujeros) y escucha. Después prueba las otras posiciones de la pequeña y <b>elige con cuál tiene que empezar</b> para que suene igual que la grande, pero más aguda.',
            titOpciones: 'Prueba la pequeña empezando con…', bien: '¡Ahora suenan igual! (la pequeña, una octava más aguda)', mal: 'Todavía no suenan igual. Prueba otra digitación.' } },
        { id: 'p8b', nombre: 'El tallador y la niña', mus: MUS.paleo, img: IMG.tallador, amb: [AMB.paleo, AMB.fuego, AMB.grillos, AMB.viento], pj: { q: 'NINA', pose: 'feliz' }, antes: 1.6,
          lineas: [
            { id: 't1_020', quien: 'NOA', img: IMG.paleoNoaMira, pj: { q: 'NOA', pose: 'sorpresa' }, poses: [{ en: .55, pose: 'pensativa' }], texto: 'Ella toca otras posiciones… pero suena lo mismo. Como yo con el piano.' },
            { id: 't1_021', quien: 'AMARO', img: IMG.paleoPulsera, nombre: 'Radio · Amaro', filtro: 'radio', estilo: 'radio', pj: { q: 'NOA', pose: 'sorpresa' }, sfx: [{ src: SF('sfx_radio_interferencia'), t: 0 }], texto: 'Noa… ¿me oyes? … Te traemos de vuelta…' }
          ] }
      ] },
      /* 9 · Viaje de vuelta (Iago, 2-nov, CAMBIO: anula las paradas de 10–12 s): del Paleolítico a 2100 DE UN TIRÓN por el túnel,
         con dos DESTELLOS breves (~3 s) y SIN FECHA (ni rótulos ni contador): el trompista y el clarinetista envueltos en la nebulosa,
         cada uno con media frase lejana (eco, filtro, bajito) y el sonido de su instrumento (sampler) */
      { id: 'e9', titulo: 'Viaje de vuelta', planos: [
        { id: 'p9a', nombre: 'Túnel · viaje de vuelta', tunel: { de: -40000, a: 2100, contador: false, sigue: true }, dur: 9.8, mus: MUS.viaje, amb: [],
          sfx: [{ src: SF('sfx_salto_tiempo'), t: 0 }, { src: SF('sfx_destello'), t: 1.3, vol: .5 }, { src: SF('sfx_destello'), t: 5.3, vol: .5 }],
          destellos: [
            { t: 1.4, dur: 3.2, video: 'vid/viaje_trompa.mp4', desde: 2.5, img: IMG.trompa, quien: 'Trompista', texto: 'Cambio el tono: pongo este tubo, más largo…', sfx: SF('sfx_eco_trompista'), vol: .9,
              fn: () => frase('trompa', [51, 55, 58, 63], .9, .36, .5) },   // «Cambio el tono: pongo este tubo, más largo…» · Do–Mi–Sol–Do escrito, suena Mi♭
            { t: 5.4, dur: 3.2, video: 'vid/viaje_clarinete.mp4', desde: 2.5, img: IMG.clarinete, quien: 'Clarinetista', texto: 'Cojo el clarinete en la, un poco más largo…', sfx: SF('sfx_eco_clarinetista'), vol: .9,
              fn: () => frase('clarinete', [69, 71, 73, 74], .9, .32, .5) }   // «Cojo el clarinete en la, un poco más largo…» · Do–Re–Mi–Fa escrito, suena La–Si–Do♯–Re
          ] },
        { id: 'p9e', nombre: 'Túnel · Noa', negro: true, funde: .9, fondoVid: 'vid/tunel_bucle.mp4', amb: [], vida: [{ tipo: 'anillos', zona: [.3, .15, .4, .7], n: 3, color: '#58b8ff' }, { tipo: 'polvo', zona: [0, 0, 1, 1], n: 20, color: '#9fdcff' }],
          lineas: [{ id: 't1_022', quien: 'NOA', pj: { q: 'NOA', pose: 'pensativa' }, texto: 'No es un error. Es una forma de hacer que el mismo dibujo encaje.' }] },
        /* la llegada a 2100 NO es anticlimática: destello, llegada fuerte, la música del viaje culmina y se va; luego, el ambiente del laboratorio */
        { id: 'p9f', nombre: 'Vuelta al laboratorio', video: 'vid/vuelta.mp4', fundeEntra: .8, tunel: { de: -40000, a: 2100, contador: false }, dur: 5, blanco: 1.1, amb: [],
          sfx: [{ src: SF('sfx_salto_tiempo'), t: 0, vol: .7 }, { src: SF('sfx_destello'), t: 3.6, vol: 1 }, { src: SF('sfx_llegada'), t: 3.9, vol: 1.3 }, { src: SF('sfx_impacto'), t: 3.9, vol: .7 }, { src: SFo('sfx_maquina_apaga'), t: 4.4, vol: .6 }],
          al: [{ t: 1.2, fn: () => B.musica({ src: 'mus/mus_viaje.mp3', vol: .9 }) }, { t: 4.2, fn: () => B.musica(null) }] }
      ] },
      /* 10 · Por fin entiende su saxo */
      { id: 'e10', titulo: 'Afinar con el oboe', planos: [
        { id: 'p10a', nombre: 'Laboratorio · el registro', img: IMG.labCentro, amb: [AMB.lab],
          lineas: [{ id: 't1_023', quien: 'AMARO', imgs: [{ en: .45, img: IMG.labRegistro }], pj: { q: 'AMARO', pose: 'tableta' }, poses: [{ en: .18, pose: 'helada' }], texto: 'Esto no puede ser. Se suponía que solo viajaba en el espacio… Según el registro, has estado en el mismo sitio, pero hace cuarenta mil años. Y en el viaje de vuelta, el registro se vuelve loco: destellos de otras épocas que no consigo fechar.', claves: { claves: ['−40 000 años', 'Destellos sin fecha'], ens: [.4, .72], pos: 'arriba' } }] },
        { id: 'p10a2', nombre: 'Laboratorio · Noa calla', img: IMG.labCentro, amb: [AMB.lab], pj: { q: 'NOA', pose: 'neutra' }, auto: 1.2,   // (Iago 3-nov) menos espera antes del gesto de pensar (era 2,4)
          al: [{ t: 0, fn: () => { B.capas.decod(B.capas.ruta('NOA', 'pensativa')); B.motor.predecod(IMG.orquesta); } }] },   // la pose y el recuerdo ya descodificados: entran sin retraso
        /* (Iago 3-nov) pose pensativa, arpa, ondulación/desenfoque y tinte cálido, todo a la vez desde el primer instante */
        { id: 'p10s', nombre: 'Noa se queda pensando', img: IMG.labCentro, amb: [AMB.labBajo], mus: false, pj: { q: 'NOA', pose: 'pensativa' }, auto: 3.6, ensueno: 'entra', recuerdo: true,
          al: [{ t: 0, fn: arpaEntra }] },
        { id: 'p10b', recuerdo: true, funde: 2.4, ensueno: 'sale', ensuenoDur: 3.4, al: [{ t: .4, fn: arpaSale }], nombre: 'Ensayo de orquesta · 2100 (recuerdo)', img: IMG.orquesta, desc: 'Esa tarde, en el conservatorio: el oboe da el La', mus: false, amb: [AMB.orquesta], ambInter: [AMB.orquestaBajo], pj: { q: 'NOA', pose: 'pensativa' }, vida: VIDA.orquesta, antes: .5,   // (Iago 3-nov) la frase empieza MIENTRAS aparece la orquesta (era antes: 2)
          lineas: [{ id: 't1_024', quien: 'NOA', imgs: [{ en: .45, img: IMG.orquestaNoa }], estilo: 'interior', nombre: 'Noa (piensa)', texto: 'Mi saxo no se equivoca de nombre. Es como la flauta pequeña: con la misma digitación suena a otra altura. Por eso mi papel lleva otra armadura.' }],
          inter: { tipo: 'oboe', fondo: IMG.orquesta,
            cartel: 'El oboe da el <b>La</b>. Elige en el teclado la nota <b>escrita</b> que tiene que tocar cada instrumento para que suene La. Escucha y pulsa <b>Comprobar</b>.',
            fin: 'Los tres afinados con el oboe: cada uno lee otra nota, pero todos suenan La.',
            preguntas: [
              { id: 'saxo', nombre: 'Saxo alto en Mi♭', sub: 'suena una 6.ª mayor más grave', timbre: 'saxo', pasos: 5, semis: 9, texto: '¿Qué nota tiene que tocar Noa en su <b>saxo alto en Mi♭</b> para que suene La?', bien: '¡Fa♯! Noa lee Fa♯ y suena La.', mal: 'Escucha: no suena como el oboe. Prueba otra nota.' },
              { id: 'clarinete', nombre: 'Clarinete en Si♭', sub: 'suena una 2.ª mayor más grave', timbre: 'clarinete', pasos: 1, semis: 2, fondo: IMG.fotoPadre, fondoNombre: 'Foto del padre con su clarinete', texto: 'Y en el <b>clarinete en Si♭</b> de su padre, ¿qué nota escrita suena La?', bien: '¡Si! El clarinete en Si♭ lee Si y suena La.', mal: 'Todavía no suena La. Prueba otra nota.' },
              { id: 'trompa', octava: 4, nombre: 'Trompa en Fa', sub: 'suena una 5.ª justa más grave', timbre: 'trompa', pasos: 4, semis: 7, texto: '¿Y la <b>trompa en Fa</b>? ¿Qué nota escrita suena La?', bien: '¡Mi! La trompa en Fa lee Mi y suena La.', mal: 'Todavía no suena La. Prueba otra nota.' }
            ] },
          despues: [
            { id: 't1_029', quien: 'NARRADOR', img: IMG.orquesta, imgs: [{ en: .66, img: O(IMG.aulaAtriles, IMG.orquestaNoa) }], amb: [AMB.orquestaBajo], texto: 'Por eso las dos partituras del principio suenan igual: el saxo alto suena una sexta mayor más grave de lo que lee. Noa lee Do♯ menor y suena Mi menor, como el piano.', claves: { claves: ['Saxo: Do♯ m (escrito)', '=', 'Piano: Mi m (suena)'], ts: [2, 2.6, 3.2] } }
          ] }
      ] },
      /* 11 · Definición */
      { id: 'e11', titulo: 'Transportar', planos: [
        { id: 'p11', funde: 1.6, sfx: [{ src: ARPA_BAJA, t: 0, vol: .8 }], nombre: 'Definición', img: IMG.definicion, desc: 'Fondo sobrio (pentagrama de luz)', mus: false, amb: [AMB.labBajo], pj: null,
          lineas: [
            { id: 't1_025', quien: 'NARRADOR', texto: 'Transportar es escribir o interpretar una obra en una tonalidad distinta, más grave o más aguda.', claves: { claves: ['Transportar', 'otra tonalidad', 'más grave o más aguda'], ts: [0, 3.4, 5.2] } },
            { id: 't1_026', quien: 'NARRADOR', img: IMG.defAbsoluto, imgs: [{ en: .36, img: IMG.defAbsolutoSi }, { en: .66, img: IMG.orquestaNoa }], texto: 'Ojo: el transporte es absoluto. El modo no cambia. Si una obra está en mi menor y la transportas una quinta más aguda, estará en si menor: sigue siendo menor. Transportar es tocar lo mismo a otra altura. Si una canción suena triste, seguirá sonando triste aunque suene más aguda.',
              claves: { claves: ['Mi m → Si m', 'sigue siendo menor'], ts: [8, 10.8], pos: 'arriba' },
              al: [{ en: .3, fn: () => motivo(['e/4', 'f#/4', 'g/4', 'b/4'], ['e/3', 'b/3', 'g/4']) }, { en: .52, fn: () => motivo(['b/4', 'c#/5', 'd/5', 'f#/5'], ['b/2', 'f#/3', 'd/4']) }] },
          ] },
        /* (Iago, 2-nov) RESUMEN del narrador antes de «Hay dos formas…» */
        { id: 'p11r', nombre: 'Repaso', img: IMG.resInstr, amb: [AMB.labBajo], pj: null,
          lineas: [
            { id: 't1_res1', quien: 'NARRADOR', img: IMG.aulaNoaPapel, imgs: [{ en: .5, img: IMG.resInstr }], texto: 'Repasemos. Hay instrumentos que no suenan lo que leen: son los instrumentos transpositores. El saxo alto, el clarinete, la trompa…',
              claves: { claves: ['Instrumentos transpositores'], ens: [.25], pos: 'arriba' } },
            /* (Iago 23:01) todos los transpositores de la orquesta; trombón y tuba, no */
            { id: 't1_res1b', quien: 'NARRADOR', img: IMG.resOrq1, imgs: [{ en: .32, img: IMG.resOrq2 }, { en: .79, img: IMG.resOrq3 }], texto: 'Y en la orquesta hay más: la trompeta en si bemol y el corno inglés, en fa. Otros solo cambian de octava: el flautín suena una octava más agudo de lo escrito, y el contrabajo y el contrafagot, una más grave. El trombón y la tuba, en cambio, se escriben tal como suenan.' },
            { id: 't1_res2', quien: 'NARRADOR', img: O(IMG.resTaller, IMG.paleoTalla), imgs: [{ en: .28, img: IMG.resFlautas }, { en: .55, img: IMG.paleoTalla }, { en: .78, img: IMG.paleoNinaToca }], texto: 'Antes no había fábricas de precisión. Cada artesano hacía sus instrumentos a mano: a veces, de distintos tamaños a propósito; y aunque intentara hacerlos iguales, nunca salían exactos, porque la madera, la caña o el metal nunca son del todo iguales. Además, cada ciudad tenía su propia afinación. Al final resultó más práctico mantener iguales las posiciones de los dedos, y no el sonido que daban.',
              claves: { claves: ['Misma digitación, distinto sonido'], ens: [.8], pos: 'arriba' } },   /* (Iago 3-nov) imperfección artesanal + afinaciones locales → se estandariza la digitación */
            { id: 't1_res3', quien: 'NARRADOR', img: IMG.trompa, imgs: [{ en: .3, img: IMG.clarinete }, { en: .6, img: IMG.aulaNoaPapel }], texto: 'Por eso cada instrumento se escribe según su tamaño: la trompa cambiaba de tubo, el clarinetista elegía entre el clarinete en si bemol y el clarinete en la, y el saxo alto lee una sexta mayor más aguda de lo que suena. Así todos pueden leer con las mismas posiciones.',
              claves: { claves: ['Trompa: cambia de tubo', 'Clarinete en Si♭ o en La', 'Saxo alto: lee una 6.ª M más aguda'], ens: [.12, .38, .64], pos: 'arriba' } }
          ] },
        { id: 'p11c', nombre: 'Dos formas', img: IMG.defDosFormas, amb: [AMB.labBajo], pj: null,
          lineas: [
            { id: 't1_027', quien: 'NARRADOR', img: IMG.orquesta, imgs: [{ en: .3, img: IMG.aula }, { en: .6, img: IMG.defDosFormas }], texto: 'Así que, para tocar juntos, estos instrumentos necesitan transportar. Y no solo ellos: también hace falta, por ejemplo, cuando una canción queda demasiado aguda o demasiado grave para quien la canta. Hay dos formas de hacer el transporte: escribiéndolo de nuevo, que se llama transporte escrito, o en tu cabeza mientras tocas, que se llama transporte mental.',
              claves: { claves: ['Transporte escrito', 'Transporte mental'], ts: [16.4, 18.5] } }   /* (Iago 23:04) retoma por qué hace falta transportar */
          ] }
      ] },
      /* 12 · Cierre */
      { id: 'e12', titulo: 'Cierre', planos: [
        { id: 'p12', nombre: 'Laboratorio de noche · la foto', img: IMG.cierre, desc: 'De noche, a solas, Noa mira la foto de su padre con el clarinete', amb: [AMB.labBajo], mus: MUS.cierre, antes: 2.2,
          pj: { q: 'NOA', pose: 'emocion', lado: 'der' },
          lineas: [{ id: 't1_028', quien: 'NOA', imgs: [{ en: .5, img: O(IMG.cierreNoa, IMG.cierreLab) }], pj: { q: 'NOA', pose: 'emocion', lado: 'der' }, texto: 'Papá… he conseguido que la máquina no solo me lleve a otro lugar, sino a otra época. Te prometo que conseguiré que me lleve hasta ti.', espera: 2.5 }] }
      ] }
    ]
  });
})(window.TR);
