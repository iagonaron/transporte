# Notas de piano · Transporte 3 (teclado del interactivo)

Piano de cola **Salamander Grand Piano V3** (Alexander Holm, licencia CC-BY 3.0: hay que citarlo en los créditos).

- Nombre del fichero = nota en inglés con **bemoles** + octava científica, como en `s1/js/sonido.js`: `C4.mp3` = do4 = do central (MIDI 60); `Db4.mp3` = re♭4 = do♯4 (MIDI 61); `Gb4.mp3` = fa♯4 (MIDI 66).
- Cromático de **do3 (C3, MIDI 48) a do6 (C6, MIDI 84)**; además A1, C2, Eb2, Gb2 y A2 porque `sonido.js` las precarga.
- MIDI → nombre: `["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"][midi % 12] + (Math.floor(midi / 12) - 1)`.
- Cada nota: ataque en el instante 0 (sin silencio delante), tecla mantenida 2,6 s y después los apagadores (≈ 3,4 s en total). Para notas más cortas, fundido en el motor (p. ej. 0,15 s).
- Todas con la misma ganancia (pico máx. −3 dBFS en el conjunto), secas (sin reverb), estéreo 44,1 kHz, 160 kbps.
- Afinación: la del piano real (afinación «estirada»: hasta +9 cents en la5 y +12 en do6, como un piano de concierto).

| MIDI | fichero | nota |
|---|---|---|
| 33 | A1.mp3 | la1 |
| 36 | C2.mp3 | do2 |
| 39 | Eb2.mp3 | mi♭/re♯2 |
| 42 | Gb2.mp3 | sol♭/fa♯2 |
| 45 | A2.mp3 | la2 |
| 48 | C3.mp3 | do3 |
| 49 | Db3.mp3 | re♭/do♯3 |
| 50 | D3.mp3 | re3 |
| 51 | Eb3.mp3 | mi♭/re♯3 |
| 52 | E3.mp3 | mi3 |
| 53 | F3.mp3 | fa3 |
| 54 | Gb3.mp3 | sol♭/fa♯3 |
| 55 | G3.mp3 | sol3 |
| 56 | Ab3.mp3 | la♭/sol♯3 |
| 57 | A3.mp3 | la3 |
| 58 | Bb3.mp3 | si♭/la♯3 |
| 59 | B3.mp3 | si3 |
| 60 | C4.mp3 | do4 |
| 61 | Db4.mp3 | re♭/do♯4 |
| 62 | D4.mp3 | re4 |
| 63 | Eb4.mp3 | mi♭/re♯4 |
| 64 | E4.mp3 | mi4 |
| 65 | F4.mp3 | fa4 |
| 66 | Gb4.mp3 | sol♭/fa♯4 |
| 67 | G4.mp3 | sol4 |
| 68 | Ab4.mp3 | la♭/sol♯4 |
| 69 | A4.mp3 | la4 |
| 70 | Bb4.mp3 | si♭/la♯4 |
| 71 | B4.mp3 | si4 |
| 72 | C5.mp3 | do5 |
| 73 | Db5.mp3 | re♭/do♯5 |
| 74 | D5.mp3 | re5 |
| 75 | Eb5.mp3 | mi♭/re♯5 |
| 76 | E5.mp3 | mi5 |
| 77 | F5.mp3 | fa5 |
| 78 | Gb5.mp3 | sol♭/fa♯5 |
| 79 | G5.mp3 | sol5 |
| 80 | Ab5.mp3 | la♭/sol♯5 |
| 81 | A5.mp3 | la5 |
| 82 | Bb5.mp3 | si♭/la♯5 |
| 83 | B5.mp3 | si5 |
| 84 | C6.mp3 | do6 |
