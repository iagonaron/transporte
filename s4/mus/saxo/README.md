# Notas sueltas · saxo (Transporte 4)
- Nombres en **SONIDO REAL** (no en nota escrita), como `mus/piano/`: `C4.mp3` = do4 real (MIDI 60); bemoles: Db, Eb, Gb, Ab, Bb. MIDI → nombre: `["C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B"][midi % 12] + (Math.floor(midi / 12) - 1)`.
- Para tocar una nota ESCRITA: clarinete en Si♭ → real = escrita − 2; saxo alto en Mi♭ → real = escrita − 9.
- Rango: Ab3–A5 (real; escrito F4–F#6). Saxo alto Karoryfer (CC0, vía tonejs-instruments).
- Cada nota: 2,2 s sostenida + 0,6 s de caída; ataque suave (30 ms) desde el instante 0; mono, 160 kbps, la más fuerte del conjunto a −6 dBFS. Para notas más cortas, cortar con un release de ~80–120 ms.
