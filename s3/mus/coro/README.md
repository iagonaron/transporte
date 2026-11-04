# Coro «ooh» · voz guía de los ejercicios de T3 (tiempo real y ejercicio final)

Fuente: **FluidR3 GM** (Frank Wen, licencia **MIT**), programa 53 «Voice Oohs», sintetizado con FluidSynth, sin reverb ni chorus. Do6 está hecho con la muestra de si5 subida un semitono, porque el original tenía un golpe en el bucle.

- **Nombres**, iguales que en `mus/piano/`: la nota en inglés con **bemoles** y la octava científica. `C4.mp3` = do4 = do central (MIDI 60), `Db4.mp3` = do♯4 (MIDI 61), `Gb4.mp3` = fa♯4… De MIDI a nombre: `["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"][midi % 12] + (Math.floor(midi / 12) - 1)`.
- **Rango**: de do3 (C3, MIDI 48) a do6 (C6, MIDI 84), cromático, 37 ficheros.
- **Formato**: mono, 44,1 kHz, 128 kbps, 4,0 s por fichero. El ataque es suave (40 ms) y suena desde el instante 0. Tramo estable de 0,05 a 3,0 s: el nivel varía unos ±1,5 dB y la altura queda a ±1 cent (de do3 a si3 hay un leve vibrato de ±14 cents). Fundido de 1 s al final. Todas con el pico a −20 dBFS.
- **Uso**: no se estiran ni se reafinan. Para una nota de duración `d` se reproduce la muestra desde 0 y en `t0 + d` se baja la ganancia a 0 en unos 120 ms (`gain.setTargetAtTime(0, t0 + d, 0.04)` o una rampa lineal de 0,12 s); después se para la fuente (`src.stop(t0 + d + 0.15)`). Así suena igual de estable a cualquier tempo.
  - Si una nota dura más de unos 2,9 s, el fundido propio de la muestra empieza a notarse (de 3 a 4 s). Para esos casos, o se repite la nota, o se encadena una segunda copia con fundido cruzado de 0,3 s.
  - Las notas legato van una tras otra, sin hueco: el release de 120 ms de la anterior se solapa con el ataque de 40 ms de la siguiente.
- **Nivel**: a −20 dBFS de pico quedan unos 6 dB por debajo de las notas del piano. Se ajusta con la ganancia del motor.
- Para rehacerlas: `python3 -I audio/t3/render_coro.py`.
