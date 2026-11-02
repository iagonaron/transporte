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
    NOA: { nombre: 'Noa', color: '#7fd4ff', lado: 'izq', alto: .86, _: 'neutra', poses: ['neutra', 'aburrida', 'pulsera_fastidio', 'pulsera_interes', 'traviesa', 'sorpresa', 'pensativa', 'emocion'] },
    AMARO: { nombre: 'Dra. Amaro', color: '#c9b6ff', lado: 'der', alto: .84, _: 'explica', poses: ['explica', 'tableta', 'alarma', 'helada'] },
    MADRE: { nombre: 'Mamá', color: '#ffc48a', lado: 'der', alto: .8, marco: 'llamada', _: 'llama', poses: ['llama', 'decepcion'] },
    PIANISTA: { nombre: 'Pianista', color: '#ffe08a', lado: 'der', alto: .8, _: 'sonrie', poses: ['sonrie', 'resopla'] },
    TALLADOR: { nombre: 'Tallador', color: '#e9b07a', lado: 'der', alto: .84, _: 'talla', poses: ['toca', 'talla', 'sorpresa', 'sonrie'] },
    NINA: { nombre: 'Niña', color: '#ffd1a1', lado: 'der', alto: .74, _: 'toca', poses: ['toca', 'frustrada', 'feliz', 'senala'] }
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
    sfx_ui_clic: [-17.9, -28], sfx_ui_error: [-16.3, -24], sfx_ui_ok: [-22.1, -24]
  };
  /* paisaje sonoro (Splice, s1/sfx/): ambientes en bucle con fundido entre planos y golpes en su momento */
  const SF = n => 'sfx/' + n + '.mp3';
  const AMB = {
    aula: { src: SF('amb_aula'), vol: .3 }, ciudad: { src: SF('amb_ciudad2100'), vol: .42 }, mar: { src: SF('amb_mar_noche'), vol: .3 },
    lab: { src: SF('amb_laboratorio'), vol: .36 }, labBajo: { src: SF('amb_laboratorio'), vol: .16 }, paleo: { src: SF('amb_paleolitico'), vol: .42 },
    fuego: { src: SF('amb_fuego'), vol: .3 }, fuegoBajo: { src: SF('amb_fuego'), vol: .14 }, paleoBajo: { src: SF('amb_paleolitico'), vol: .18 },
    orquesta: { src: SF('amb_orquesta_afinando'), vol: .34 }, orquestaBajo: { src: SF('amb_orquesta_afinando'), vol: .08 }
  };
  /* música (Suno, s1/mus/); mientras no llegue, el tema v4 sintetizado (cuerdas + piano, bajo); en el Paleolítico, solo ambiente */
  const SINT = { src: 'mus/t1_tema_sint.mp3', vol: .26 };
  const MUS = {
    coruna: { src: [{ src: 'mus/mus_coruna2100.mp3', vol: .5 }, SINT] },
    paleo: { src: [{ src: 'mus/mus_paleolitico.mp3', vol: .45 }] },
    cierre: { src: [{ src: 'mus/mus_cierre.mp3', vol: .6 }, { src: 'mus/t1_tema_sint.mp3', vol: .34 }] },
    ensayo: { src: 'mus/t1_ensayo.mp3', vol: .8, bucle: false }
  };

  /* fondos (C4, s1/img/t1/) con sustitutos mientras falten; la «vida» va con cada encuadre */
  const VIDA = {
    aula: [{ tipo: 'polvo', zona: [.42, .02, .52, .8], n: 22, color: '#ffe2b8' }, { tipo: 'parpadeo', zona: [.42, .37, .13, .25], color: '#9fe4ff' },
      { tipo: 'luces', zona: [.69, .2, .27, .07], n: 14, color: '#cfe9ff' }],
    conserv: [{ tipo: 'luces', zona: [.3, .05, .7, .35], n: 22, color: '#ffe9c0' }, { tipo: 'drones', zona: [.35, .0, .5, .08], n: 3 }, { tipo: 'polvo', zona: [.3, .4, .7, .5], n: 10, color: '#fff0d0' }],
    corunaEntera: [{ tipo: 'faro', zona: [.183, .098, .4, 0] }, { tipo: 'drones', zona: [.25, .03, .75, .22], n: 7 }, { tipo: 'luces', zona: [.26, .28, .6, .1], n: 26, color: '#a8d4ff' },
      { tipo: 'reflejos', zona: [.05, .55, .95, .2], n: 24, color: '#bfe0ff' }],
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
    llegada: [{ tipo: 'anillos', zona: [.27, .55, .5, .3], n: 2, color: '#9fe4ff' }, { tipo: 'chispas', zona: [.3, .1, .45, .75], n: 22, color: '#cfeeff' }, { tipo: 'reflejos', zona: [0, .4, .45, .2], n: 14, color: '#ffd9a0' }]
  };
  /* ocultaPj: personajes que YA salen en la lámina → no se les pone la pose encima (Iago/C4: nunca el mismo personaje dos veces).
     Encuadres «sin gente» (zoom) para las frases con reacción: labCentro (la máquina), pruebaAmaro (sin Amaro), tallador (sin Noa). */
  const IMG = {
    aula: { src: 'img/t1/aula2100.webp', ocultaPj: ['NOA', 'PIANISTA'] },
    conserv: { src: 'img/t1/conservatorio2100.webp', ocultaPj: ['NOA'] },
    riazor: { src: 'img/t1/dron_riazor.webp', vida: [{ tipo: 'luces', zona: [.55, .3, .42, .25], n: 30, color: '#a8d4ff' }, { tipo: 'drones', zona: [0, .0, 1, .18], n: 6 },
      { tipo: 'reflejos', zona: [0, .4, .38, .45], n: 20, color: '#bfe0ff' }, { tipo: 'faro', zona: [.126, .172, .12, 0] }] },
    orzan: { src: 'img/t1/coruna2100.webp', mueve: true, vida: VIDA.corunaEntera },
    torre: { src: 'img/t1/dron_torre.webp', vida: [{ tipo: 'faro', zona: [.282, .115, .42, 0] }, { tipo: 'drones', zona: [.3, .0, .7, .25], n: 5 },
      { tipo: 'luces', zona: [.35, .3, .65, .12], n: 22, color: '#a8d4ff' }, { tipo: 'reflejos', zona: [.3, .42, .7, .18], n: 22, color: '#bfe0ff' }] },
    lab: { src: 'img/t1/laboratorio.webp', ocultaPj: ['NOA', 'AMARO'] },
    labCentro: { src: 'img/t1/laboratorio.webp', zoom: 2, cx: .55, cy: .4,
      vida: [{ tipo: 'anillos', zona: [.16, 0, .7, 1], n: 3 }, { tipo: 'polvo', zona: [0, 0, 1, 1], n: 18, color: '#cfe8ff' }] },
    pruebaAmaro: { src: 'img/t1/prueba.webp', zoom: 1.25, cx: .4, cy: .4, ocultaPj: ['NOA'],
      vida: [{ tipo: 'anillos', zona: [.34, .025, .59, .875], n: 3 }, { tipo: 'onda', zona: [.93, .375, .07, .09] }, { tipo: 'polvo', zona: [.2, 0, .7, 1], n: 18, color: '#cfe8ff' }] },
    llegada: { src: 'img/t1/llegada.webp', vida: VIDA.llegada, ocultaPj: ['NOA'] },
    modulo: { src: 'img/t1/lab_modulo.webp', ocultaPj: ['NOA'], vida: [{ tipo: 'chispas', zona: [.17, .3, .25, .4], n: 14, color: '#7fd4ff' }, { tipo: 'respira', zona: [.12, .25, .35, .5], color: '#58c8ff', vel: 2 },
      { tipo: 'polvo', zona: [.4, 0, .6, 1], n: 12, color: '#ffe2b8' }] },
    tallador: [{ src: 'img/t1/tallador.webp', vida: VIDA.paleoCerca }, { src: 'img/t1/paleolitico.webp', zoom: 1.6, cx: .68, cy: .5, vida: VIDA.paleoCerca, ocultaPj: ['TALLADOR', 'NINA'] }],
    trompa: [{ src: 'img/t1/viaje_trompa_s18.webp', ajuste: 'contain', ocultaPj: ['NOA'] }],
    clarinete: [{ src: 'img/t1/viaje_clarinete_s19.webp', ajuste: 'contain', ocultaPj: ['NOA'] }],
    orquesta: { src: 'img/t1/orquesta2100.webp', ocultaPj: ['NOA'] },
    fotoPadre: { src: 'img/t1/foto_padre_clarinete.webp', vida: VIDA.fotoReal },
    definicion: { src: 'img/t1/definicion.webp', vida: [{ tipo: 'polvo', zona: [0, 0, 1, 1], n: 20, color: '#ffe2b8' }, { tipo: 'respira', zona: [.25, .2, .5, .6], color: '#58b8ff' },
      { tipo: 'reflejos', zona: [0, .82, 1, .15], n: 16, color: '#ffd9a0' }] },
    cierre: { src: 'img/t1/foto_padre_clarinete.webp', luz: .78, vida: VIDA.fotoReal }
  };

  /* sonidos de plano: la equivocación del prólogo, la flauta del tallador, la trompa con sus tonos y los dos clarinetes */
  const equivoca = c => { B.musicaCorta(); const t = B.ac().currentTime + .02; V().nota('saxo', 73, t, .62, .85); [48, 64, 67, 71].forEach(m => V().piano(m, t + .01, .9, .2)); };
  const flautaDibujo = (base, veces) => { const e8 = B.TEMA.corchea, sube = { 5: 0, 4: 2, 3: 3, 2: 5, 1: 7, 0: 9 }; let t = B.ac().currentTime + .05;
    for (let v = 0; v < (veces || 1); v++) { DIBUJO.forEach((k, i) => { V().nota('flauta', base + sube[k], t, RITMO[i] * e8 * .95, .7); t += RITMO[i] * e8; }); t += 2 * e8; } };
  const frase = (tipo, notas, t, d, vel) => { const t0 = B.ac().currentTime + (t || 0); notas.forEach((m, i) => V().nota(tipo, m, t0 + i * d, d * (i === notas.length - 1 ? 2.2 : .95), vel || .75)); };

  B.sesion({
    titulo: 'Transporte 1', subtitulo: 'El mismo dibujo, a otra altura', sup: 'Unidad 9 · 2.º GP',
    recursos: [FL.grande.img, FL.mediana.img, FL.pequena.img, 'img/t1/inst_saxo.webp', 'img/t1/inst_clarinete.webp', 'img/t1/inst_trompa.webp',
      SF('sfx_pulsera_vibra'), SF('sfx_notificacion'), SF('sfx_llave_saxo'), SF('sfx_estuche_cierra'), SF('sfx_pasos_rapidos'), SF('sfx_puerta_scifi'), SF('sfx_maquina_arranca'),
      SF('sfx_anillos_giran'), SF('sfx_alarma'), SF('sfx_salto_tiempo'), SF('sfx_llegada'), SF('sfx_radio_interferencia'), SF('sfx_tallar_cana')]
      .concat(B.viento.SAX_RUTAS, B.viento.UI_RUTAS),
    escenas: [
      /* 0 · Arranque */
      { id: 'e0', titulo: 'Arranque', planos: [
        { id: 'p0', nombre: 'Negro', negro: true, efecto: 'pulso', auto: 3.2, amb: [], mus: false, sfx: [{ src: SF('sfx_llave_saxo'), t: .6 }] }
      ] },
      /* 1 · Prólogo: el aula */
      { id: 'e1', titulo: 'El aula', planos: [
        { id: 'p1a0', nombre: 'Aula de estudio · 2100', img: IMG.aula, desc: 'Madera clara, paneles que respiran luz, atril holográfico, la Torre en la ventana',
          amb: [AMB.aula], mus: MUS.ensayo, vida: VIDA.aula, pj: null, auto: 3.6,   // Noa ya está tocando en la lámina: sin pose encima
          al: [{ t: .15 + 6 * 60 / 170, fn: equivoca }] },   // se equivoca en un sostenido al empezar el 2.º compás (Do♯ en vez de Do)
        { id: 'p1a', nombre: 'Aula de estudio · 2100', img: IMG.aula, amb: [AMB.aula], vida: VIDA.aula,
          lineas: [
            { id: 't1_001', quien: 'PIANISTA', pj: { q: 'PIANISTA', pose: 'sonrie' }, poses: [{ en: .5, pose: 'resopla' }], texto: '¿Otra vez desde el principio? Yo estoy en mi menor; no sé cómo te aclaras con tantos sostenidos.' },
            { id: 't1_002', quien: 'NOA', pj: { q: 'NOA', pose: 'aburrida' }, poses: [{ en: .78, pose: 'pensativa' }], texto: 'Ni yo. Mi papel dice do sostenido menor. Cuatro sostenidos. Y luego suena igual que lo tuyo. No tiene sentido.' }
          ],
          inter: { tipo: 'prologo', titulo: 'El tema de Noa · dos papeles', compases: 8,
            cartel: 'Mira las dos partituras: arriba, el <b>saxo alto</b> en Do♯ menor (4♯); abajo, el <b>piano</b> en Mi menor (1♯). Pulsa <b>▶ Las dos</b> y escucha.',
            pregunta: '¿Por qué dos partituras distintas suenan igual? Guárdate la pregunta.' } },
        { id: 'p1b', nombre: 'Aula · la pulsera', img: IMG.aula, amb: [AMB.aula], vida: VIDA.aula, pj: null, antes: 1.5,
          aviso: { de: 'Mamá', txt: 'Llamada entrante' }, sfx: [{ src: SF('sfx_pulsera_vibra'), t: 0 }],
          lineas: [
            { id: 't1_003', quien: 'MADRE', filtro: 'telefono', pj: { q: 'MADRE', pose: 'llama' }, aviso: { de: 'Mamá', txt: 'En llamada' }, texto: 'Hola, cariño… ¿Vienes esta tarde? Podemos dar un paseo por el Orzán.' },
            { id: 't1_004', quien: 'NOA', pj: { q: 'MADRE', pose: 'llama' }, poses: [{ en: .9, q: 'MADRE', pose: 'decepcion' }], aviso: { de: 'Mamá', txt: 'En llamada' },
              sfx: [{ src: SF('sfx_notificacion'), en: .92 }], texto: 'Ahora no puedo, mamá. Estoy practicando.', espera: 1.2 }
          ] },
        { id: 'p1c', nombre: 'Aula · retoman el ensayo', img: IMG.aula, amb: [AMB.aula], vida: VIDA.aula, mus: MUS.ensayo, auto: 7.5, pj: null },
        { id: 'p1d', nombre: 'Aula · mensaje del laboratorio', img: IMG.aula, amb: [AMB.aula], vida: VIDA.aula,
          lineas: [
            { id: 't1_005', quien: 'AMARO', nombre: 'Laboratorio · Amaro', filtro: 'telefono', mus: false, pj: { q: 'NOA', pose: 'pulsera_interes' },
              aviso: { de: 'Laboratorio · Amaro', txt: 'Hoy es el día. Te esperamos en la Torre.', tipo: 'lab' },
              sfx: [{ src: SF('sfx_pulsera_vibra'), t: 0 }], texto: 'Noa. Hoy es el día. Te esperamos en la Torre.' }
          ] },
        { id: 'p1e', nombre: 'Aula · sale corriendo', img: IMG.aula, amb: [AMB.aula], vida: VIDA.aula, pj: null, auto: 2.6,
          sfx: [{ src: SF('sfx_estuche_cierra'), t: .1 }, { src: SF('sfx_pasos_rapidos'), t: .8 }, { src: SF('sfx_puerta_scifi'), t: 1.8 }] }
      ] },
      /* 2 · Coruña 2100 */
      { id: 'e2', titulo: 'A Coruña, 2100', planos: [
        { id: 'p2a', nombre: 'Conservatorio 2100', img: IMG.conserv, desc: 'Fachada real modernizada', amb: [AMB.ciudad], mus: MUS.coruna, pj: null, vida: VIDA.conserv, antes: 2.2,
          lineas: [{ id: 't1_006', quien: 'NARRADOR', texto: 'A Coruña, año 2100. Las máquinas hacen casi todo el trabajo, y la gente dedica sus días a lo que antes no tenía tiempo: tocar, bailar, pintar.', claves: { claves: ['A Coruña · 2100'], ts: [0] } },
            { id: 't1_007', quien: 'NARRADOR', texto: 'Y aun así, todo el mundo sigue yendo con prisa a todas partes.', espera: 1.5 }] },
        { id: 'p2b', fondoVid: 'vid/dron_coruna.mp4', nombre: 'Riazor 2100 · dron', img: IMG.riazor, desc: 'Estadio blanquiazul de noche, sin escudos reales', amb: [AMB.ciudad], pj: null, antes: 2.5,
          lineas: [{ id: 't1_008', quien: 'NARRADOR', texto: 'Riazor brilla toda la noche: el Depor es líder y va a por su décima Liga.', espera: 1.5 }] },
        { id: 'p2c', fondoVid: 'vid/dron_coruna.mp4', nombre: 'Playa del Orzán 2100 · dron', img: IMG.orzan, amb: [AMB.ciudad, AMB.mar], pj: null, antes: 2,
          lineas: [{ id: 't1_009', quien: 'NARRADOR', texto: 'Pero hay cosas que ya nadie sabe hacer a mano. Si una canción no te queda bien, la IA la cambia por ti. Si tu instrumento no está afinado, lo afina ella.', claves: { claves: ['Nadie sabe hacer nada a mano'], ts: [1.2] }, espera: 1.2 }] },
        { id: 'p2d', fondoVid: 'vid/dron_coruna.mp4', nombre: 'La Torre de noche · dron', img: IMG.torre, desc: 'La Torre de Hércules, igual que siempre, con la ciudad futurista detrás', amb: [AMB.mar, { src: SF('amb_ciudad2100'), vol: .2 }], pj: null, antes: 2.5,
          lineas: [{ id: 't1_010', quien: 'NARRADOR', texto: 'La ciudad está irreconocible. Solo una cosa sigue exactamente igual que hace dos mil años.', espera: 2.5 }] }
      ] },
      /* 3 · El laboratorio */
      { id: 'e3', titulo: 'El laboratorio', planos: [
        { id: 'p3a', nombre: 'Laboratorio bajo la Torre', img: IMG.lab, desc: 'Piedra romana y cables; el Transportador en el centro; la foto del padre en una mesa',
          amb: [AMB.lab], mus: MUS.coruna, pj: null, vida: VIDA.lab, sfx: [{ src: SF('sfx_puerta_scifi'), t: .2 }], antes: 2,
          lineas: [
            { id: 't1_011', quien: 'NARRADOR', texto: 'Debajo de la Torre trabaja un laboratorio que no aparece en ningún mapa. Hacen lo único que la IA todavía no sabe hacer: una máquina que viaja como viaja el sonido, en ondas.', claves: { claves: ['El Transportador'], ts: [7.5] } },
            { id: 't1_012', quien: 'NARRADOR', texto: 'La empezó el padre de Noa. No llegó a terminarla: hace tres años, un coche sin conductor tomó una mala decisión.', espera: .8 },
            { id: 't1_013', quien: 'AMARO', img: IMG.labCentro, pj: { q: 'AMARO', pose: 'explica' }, poses: [{ en: .62, pose: 'tableta' }], texto: 'El Transportador te llevará al otro lado de la sala. Solo eso. Si funciona, mañana podríamos ir de la Torre a cualquier sitio del mundo en un instante. Pero solo a otro lugar: la misma hora, el mismo día.' },
            { id: 't1_014', quien: 'NOA', pj: { q: 'NOA', pose: 'neutra' }, texto: 'Le prometí que sería yo quien la probara.' }
          ] },
        { id: 'p3b', nombre: 'Detalle · el módulo', img: IMG.modulo, desc: 'Noa conecta a escondidas un viejo módulo con una pegatina gastada', amb: [AMB.lab], pj: null, auto: 3.8,
          sfx: [{ src: SF('sfx_ui_clic'), t: 1.3 }, { src: SF('sfx_destello'), t: 1.6 }] }
      ] },
      /* 4 · La prueba: calibrar */
      { id: 'e4', titulo: 'La prueba', planos: [
        { id: 'p4a', nombre: 'El Transportador', img: IMG.pruebaAmaro, desc: 'Noa dentro de la máquina; Amaro en la consola', amb: [AMB.lab], mus: false,
          lineas: [{ id: 't1_015', quien: 'AMARO', pj: { q: 'AMARO', pose: 'tableta' }, poses: [{ en: .45, pose: 'explica' }], texto: 'Frecuencia base: doscientos veinte hercios. Coloca sus múltiplos exactos: por dos, por tres, por cuatro y por cinco.' }],
          inter: { tipo: 'calibrar', base: 220, multiplos: [2, 3, 4, 5], inicio: [347, 512, 1003, 871],
            cartel: 'Calibra el Transportador: la base es <b>220 Hz</b>. Mueve cada deslizador hasta su múltiplo <b>exacto</b> (×2, ×3, ×4, ×5). Usa − y + para afinar de 1 en 1.',
            destino: 'Destino: Laboratorio · 0 m', alarma: 'Coordenada temporal: activada', textoFin: 'Calibración perfecta. Pero… ¿qué es esa línea roja?',
            sfxActiva: [SF('sfx_maquina_arranca'), SF('sfx_anillos_giran')], sfxAlarma: SF('sfx_alarma') },
          despues: [
            { id: 't1_016', quien: 'AMARO', pj: { q: 'AMARO', pose: 'explica' }, texto: 'Calibración perfecta. Destino: el laboratorio, a cero metros. Adelante.' },
            { id: 't1_017', quien: 'AMARO', pj: { q: 'AMARO', pose: 'alarma' }, texto: '¿Qué es esto? ¡Noa, sal de ahí!' },
            { id: 't1_018', quien: 'NOA', pj: { q: 'NOA', pose: 'traviesa' }, texto: 'Todavía no.', espera: .6 }
          ] }
      ] },
      /* 5 · El salto: vídeo de Runway; mientras, túnel propio con el contador */
      { id: 'e5', titulo: 'El salto', planos: [
        { id: 'p5', nombre: 'El salto', video: 'vid/salto.mp4', tunel: { de: 2100, a: -40000 }, dur: 7, mus: false, amb: [], desc: 'Runway 1080p: el anillo se dispara, túnel, contador 2100 → −40 000',
          sfx: [{ src: SF('sfx_salto_tiempo'), t: 0 }] }
      ] },
      /* 6 · Paleolítico */
      { id: 'e6', titulo: 'Paleolítico', planos: [
        { id: 'p6a0', nombre: 'La llegada', video: 'vid/llegada.mp4', img: IMG.llegada, desc: 'Noa aparece junto al río, entre anillos de luz', amb: [AMB.paleo, AMB.fuego], mus: MUS.paleo, pj: null, auto: 5.5,
          sfx: [{ src: SF('sfx_llegada'), t: 0 }] },
        { id: 'p6a', nombre: 'La llegada · −40 000', img: IMG.llegada, amb: [AMB.paleo, AMB.fuego], mus: MUS.paleo, pj: null, antes: 1.2,
          lineas: [
            { id: 't1_019', quien: 'NOA', texto: 'Demasiado lejos… mucho más de lo que calculé.', claves: { claves: ['−40 000 años'], ts: [0] }, espera: .8 }
          ] },
        { id: 'p6b', nombre: 'El tallador de flautas', img: IMG.tallador, desc: 'Un hombre talla tres flautas de caña junto al fuego y toca la grande', amb: [AMB.paleo, AMB.fuego],
          pj: { q: 'TALLADOR', pose: 'talla' }, auto: 7.2, sfx: [{ src: SF('sfx_tallar_cana'), t: .2 }],
          poses: [{ t: 1.6, q: 'TALLADOR', pose: 'toca' }, { t: 5.2, q: 'NOA', pose: 'sorpresa' }],
          al: [{ t: 1.8, fn: () => flautaDibujo(FL.grande.base, 2) }] }
      ] },
      /* 7 · Tres flautas */
      { id: 'e7', titulo: 'Tres flautas', planos: [
        { id: 'p7', nombre: 'Las tres flautas', img: IMG.tallador, pj: null, amb: [AMB.paleoBajo, AMB.fuegoBajo], mus: false,
          inter: { tipo: 'flautas', flautas: [FL.grande, FL.mediana, FL.pequena], digitaciones: DIBUJO, ritmo: RITMO,
            cartel: 'Tapa los mismos agujeros en las tres flautas y escucha. Pulsa <b>▶ Dibujo</b> en cada una: los dedos hacen lo mismo… ¿y el sonido?',
            reto: 'Reto: escucha A, B y C y ponlas en orden, <b>de la más grave a la más aguda</b>.',
            bien: '¡Exacto! El mismo dibujo, a otra altura.', mal: 'Todavía no. Escúchalas otra vez y vuelve a ordenarlas.' } }
      ] },
      /* 8 · Tocar juntos */
      { id: 'e8', titulo: 'Tocar juntos', planos: [
        { id: 'p8a', nombre: 'El tallador y la niña', img: IMG.tallador, amb: [AMB.paleo, AMB.fuego], pj: { q: 'NINA', pose: 'senala' }, auto: 2.6,
          poses: [{ t: 1.5, q: 'TALLADOR', pose: 'sonrie' }] },
        { id: 'p8', nombre: 'El tallador y la niña', img: IMG.tallador, desc: 'El tallador con la flauta grande y una niña con la pequeña', pj: null, amb: [AMB.paleoBajo, AMB.fuegoBajo],
          inter: { tipo: 'juntos', flautas: [FL.grande, FL.pequena], quienG: 'Él · grande', quienP: 'Ella · pequeña', digitaciones: DIBUJO, ritmo: RITMO,
            cartel: 'Él toca la grande y ella la pequeña. Escucha qué pasa si los dos tapan los mismos agujeros. Después, <b>elige con qué digitación tiene que empezar la pequeña</b> para que suene igual que la grande.',
            titOpciones: 'La pequeña empieza con…', bien: '¡Ahora suenan igual! (la pequeña, una octava más aguda)', mal: 'Todavía no suenan igual. Prueba otra digitación.' } },
        { id: 'p8b', nombre: 'El tallador y la niña', img: IMG.tallador, amb: [AMB.paleo, AMB.fuego], pj: { q: 'NINA', pose: 'feliz' }, antes: 1.6,
          lineas: [
            { id: 't1_020', quien: 'NOA', pj: { q: 'NOA', pose: 'sorpresa' }, poses: [{ en: .55, pose: 'pensativa' }], texto: 'Ella toca otros agujeros… pero suena lo mismo. Como yo con el piano.' },
            { id: 't1_021', quien: 'AMARO', nombre: 'Radio · Amaro', filtro: 'radio', estilo: 'radio', pj: { q: 'NOA', pose: 'sorpresa' }, sfx: [{ src: SF('sfx_radio_interferencia'), t: 0 }], texto: 'Noa… ¿me oyes? … Te traemos de vuelta…' }
          ] }
      ] },
      /* 9 · Viaje de vuelta: paradas relámpago (túnel propio en los tramos) */
      { id: 'e9', titulo: 'Viaje de vuelta', planos: [
        { id: 'p9a', nombre: 'Túnel', tunel: { de: -40000, a: 1750 }, dur: 3.4, mus: false, amb: [], sfx: [{ src: SF('sfx_salto_tiempo'), t: 0 }] },
        { id: 'p9b', nombre: 'Siglo XVIII · trompista', img: IMG.trompa, desc: 'Un trompista cambia un tubo de su trompa natural (los «tonos»)', pj: null, auto: 5.4,
          vida: [{ tipo: 'luces', zona: [.25, .0, .35, .3], n: 10, color: '#ffd9a0' }, { tipo: 'respira', zona: [.3, .3, .4, .5], color: '#ffcf8a' }], sfx: [{ src: SF('sfx_llegada'), t: 0 }],
          al: [{ t: .9, fn: () => frase('trompa', [60, 64, 67, 72], 0, .32) }, { t: 3.1, fn: () => frase('trompa', [62, 66, 69, 74], 0, .32) }],   // la misma digitación con otro tono: suena en Re
        },
        { id: 'p9c', nombre: 'Túnel', tunel: { de: 1750, a: 1850 }, dur: 1.8, sfx: [{ src: SF('sfx_salto_tiempo'), t: 0, vol: .5 }] },
        { id: 'p9d', nombre: 'Siglo XIX · clarinetista', img: IMG.clarinete, desc: 'Un clarinetista elige entre su clarinete en Si♭ y su clarinete en La', pj: null, auto: 5.4,
          vida: [{ tipo: 'luces', zona: [.0, .3, .2, .4], n: 8, color: '#ffd9a0' }, { tipo: 'respira', zona: [.3, .3, .4, .5], color: '#ffcf8a' }], sfx: [{ src: SF('sfx_llegada'), t: 0 }],
          al: [{ t: .9, fn: () => frase('clarinete', [65, 67, 69, 70], 0, .3) }, { t: 3.0, fn: () => frase('clarinete', [64, 66, 68, 69], 0, .3) }] },   // lo mismo escrito: en Si♭ y en La
        { id: 'p9e', nombre: 'Túnel · Noa', negro: true, efecto: 'pulso', amb: [], vida: [{ tipo: 'anillos', zona: [.3, .15, .4, .7], n: 3, color: '#58b8ff' }, { tipo: 'polvo', zona: [0, 0, 1, 1], n: 20, color: '#9fdcff' }],
          lineas: [{ id: 't1_022', quien: 'NOA', pj: { q: 'NOA', pose: 'pensativa' }, texto: 'No es un error. Es una forma de hacer que el mismo dibujo encaje.' }] },
        { id: 'p9f', nombre: 'Vuelta al laboratorio', video: 'vid/vuelta.mp4', tunel: { de: 1850, a: 2100 }, dur: 2.4, sfx: [{ src: SF('sfx_salto_tiempo'), t: 0, vol: .5 }, { src: SF('sfx_llegada'), t: 2 }] }
      ] },
      /* 10 · Por fin entiende su saxo */
      { id: 'e10', titulo: 'Afinar con el oboe', planos: [
        { id: 'p10a', nombre: 'Laboratorio · el registro', img: IMG.labCentro, amb: [AMB.lab], mus: false,
          lineas: [{ id: 't1_023', quien: 'AMARO', pj: { q: 'AMARO', pose: 'tableta' }, poses: [{ en: .22, pose: 'helada' }], texto: 'Esto no puede ser. Se suponía que solo viajaba en el espacio… Según el registro has estado en el mismo sitio, pero hace cuarenta mil años. Y luego en el siglo dieciocho. Y en el diecinueve.', claves: { claves: ['−40 000', 's. XVIII', 's. XIX'], ts: [7, 9.6, 11.2] } }] },
        { id: 'p10a2', nombre: 'Laboratorio · Noa calla', img: IMG.labCentro, amb: [AMB.lab], pj: { q: 'NOA', pose: 'neutra' }, auto: 2.4 },
        { id: 'p10b', nombre: 'Ensayo de orquesta · 2100', img: IMG.orquesta, desc: 'Esa tarde, en el conservatorio: el oboe da el La', amb: [AMB.orquesta], ambInter: [AMB.orquestaBajo], pj: { q: 'NOA', pose: 'pensativa' }, vida: VIDA.orquesta, antes: 2,
          lineas: [{ id: 't1_024', quien: 'NOA', estilo: 'interior', nombre: 'Noa (piensa)', texto: 'Mi saxo no se equivoca de nombre. Es como la flauta pequeña: con la misma digitación suena a otra altura. Por eso mi papel lleva otra armadura.' }],
          inter: { tipo: 'oboe', fondo: IMG.orquesta,
            cartel: 'El oboe da el <b>La</b>. Elige en el teclado la nota <b>escrita</b> que tiene que tocar cada instrumento para que suene La. Escucha y pulsa <b>Comprobar</b>.',
            fin: 'Los tres afinados con el oboe: cada uno lee otra nota, pero todos suenan La.',
            preguntas: [
              { id: 'saxo', nombre: 'Saxo alto en Mi♭', sub: 'suena una 6.ª mayor más grave', timbre: 'saxo', pasos: 5, semis: 9, texto: '¿Qué nota tiene que tocar Noa en su <b>saxo alto en Mi♭</b> para que suene La?', bien: '¡Fa♯! Noa lee Fa♯ y suena La.', mal: 'Escucha: no suena como el oboe. Prueba otra nota.' },
              { id: 'clarinete', nombre: 'Clarinete en Si♭', sub: 'suena una 2.ª mayor más grave', timbre: 'clarinete', pasos: 1, semis: 2, fondo: IMG.fotoPadre, fondoNombre: 'Foto del padre con su clarinete', texto: 'Y en el <b>clarinete en Si♭</b> de su padre, ¿qué nota escrita suena La?', bien: '¡Si! El clarinete en Si♭ lee Si y suena La.', mal: 'Todavía no suena La. Prueba otra nota.' },
              { id: 'trompa', nombre: 'Trompa en Fa', sub: 'suena una 5.ª justa más grave', timbre: 'trompa', pasos: 4, semis: 7, texto: '¿Y la <b>trompa en Fa</b>? ¿Qué nota escrita suena La?', bien: '¡Mi! La trompa en Fa lee Mi y suena La.', mal: 'Todavía no suena La. Prueba otra nota.' }
            ] },
          despues: [
            { id: 't1_029', quien: 'NARRADOR', voz: false, amb: [AMB.orquestaBajo], texto: 'Por eso las dos partituras del principio suenan igual: el saxo alto suena una sexta mayor más grave de lo que lee. Noa lee Do♯ menor y suena Mi menor, como el piano.', claves: { claves: ['Saxo: Do♯ m (escrito)', '=', 'Piano: Mi m (suena)'], ts: [2, 2.6, 3.2] } }
          ] }
      ] },
      /* 11 · Definición */
      { id: 'e11', titulo: 'Transportar', planos: [
        { id: 'p11', nombre: 'Definición', img: IMG.definicion, desc: 'Fondo sobrio (pentagrama de luz)', mus: false, amb: [AMB.labBajo], pj: null,
          lineas: [
            { id: 't1_025', quien: 'NARRADOR', texto: 'Transportar es escribir o interpretar una obra en una tonalidad distinta, más grave o más aguda.', claves: { claves: ['Transportar', 'otra tonalidad', 'más grave o más aguda'], ts: [0, 3.4, 5.2] } },
            { id: 't1_026', quien: 'NARRADOR', texto: 'Ojo: el transporte es absoluto. El modo no cambia.', claves: { claves: ['Absoluto', 'el modo no cambia'], ts: [1.2, 2.8] } },
            { id: 't1_027', quien: 'NARRADOR', texto: 'Hay dos formas de hacerlo: escribiéndolo de nuevo, o en tu cabeza mientras tocas.', claves: { claves: ['Escrito', 'Mental'], ts: [2.4, 4] } }
          ] }
      ] },
      /* 12 · Cierre */
      { id: 'e12', titulo: 'Cierre', planos: [
        { id: 'p12', nombre: 'Laboratorio de noche · la foto', img: IMG.cierre, desc: 'De noche, a solas, Noa mira la foto de su padre con el clarinete', amb: [AMB.labBajo], mus: MUS.cierre, antes: 2.2,
          pj: { q: 'NOA', pose: 'emocion', lado: 'der' },
          lineas: [{ id: 't1_028', quien: 'NOA', pj: { q: 'NOA', pose: 'emocion', lado: 'der' }, texto: 'Papá… he conseguido que la máquina no solo me lleve a otro lugar, sino a otra época. Te prometo que conseguiré que me lleve hasta ti.', espera: 2.5 }] }
      ] }
    ]
  });
})(window.TR);
