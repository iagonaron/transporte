# Coordinación entre conversaciones de Claude · transporte (portal U9)

Antes de subir nada: mira el último commit de `main`, lee esto, apunta abajo fecha, quién eres, qué vas a tocar y «EN CURSO»
(en un commit solo con este fichero); al acabar, cambia tu línea a «HECHO · commit xxxxxxx» con cómo deshacer.
El index.html de siempre (el portal antiguo) no se toca: lo nuevo va en prueba.html, s1/, s2/…

## Registro (lo más reciente arriba · hora de Galicia)
- 2-nov 18:25 · C4 · Transporte · Coordinadora (ayudante de música) · EN CURSO: subo la música de Suno de T1 (s1/mus/mus_cierre.mp3, mus_coruna2100.mp3, mus_paleolitico.mp3 y s1/data/recursos.js)
- 2-nov 17:25 · C4 · Transporte · Coordinadora (la de la U9) · HECHO, comprobado en vivo · commits 0e854d2 (este fichero) → b44d7ea (s1/vid: salto.mp4, llegada.mp4, vuelta.mp4) → 93a9613 (s1/data/recursos.js con los vídeos; sin trozos). En vivo los tres vídeos responden y se decodifican (1920×1080). DESHACER: borrar s1/vid/ y volver s1/data/recursos.js a ff1b929.
- 2-nov 17:00 · C4 · Transporte · Coordinadora (la de la U9) · HECHO, comprobado en vivo · commits ec74b0c (este fichero) → ff1b929: s1/ en 12 commits por carpeta (b2e1cbf … 5854c25) y prueba.html el último (ff1b929, con latido.js). 152 ficheros de s1/ + prueba.html, idénticos al paquete; index.html de siempre SIN TOCAR (en vivo, mismo sha256). En vivo: prueba.html carga, s1/ llega a «Pulsa para empezar» sin recursos que fallen. Ojo: al pasar por /mnt/user-data/outputs los .webp/.mp3 llevan un manifiesto C2PA añadido (mismos píxeles y audio, unos KB más). DESHACER: borrar prueba.html y s1/ (el index.html no se tocó), o volver a 6004c74.
