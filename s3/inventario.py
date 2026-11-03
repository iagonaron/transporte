#!/usr/bin/env python3
"""Transporte 3 · inventario de recursos → data/recursos.js (+ data/melodia_t3.js)
Recorre img/, voz/, mus/, sfx/ y vid/ de esta carpeta y escribe TR.RECURSOS = {ruta: bytes} y window.TROZOS
(vídeos partidos en x.mp4.1, x.mp4.2…, para el tope de subida de GitHub). Lo que no esté en el inventario
se ve como MARCADOR en la página (sin peticiones que fallen). Ejecútalo cada vez que añadas o quites ficheros:
    python3 inventario.py
Con --trocea, los vídeos de vid/ de más de 9 MB se parten en x.mp4.1, x.mp4.2… (y el entero pasa a vid/_enteros/,
que no se publica). Las carpetas que empiezan por «_» no entran en el inventario.
(T3) Además:
  · lo común de T1 (../s1/: poses, túnel, efectos, músicas, muestras) y las láminas de T2 del laboratorio (../s2/img/t2/,
    reserva mientras no lleguen las de T3) se usan por ruta relativa, sin duplicarlas;
  · las muestras de piano de s3/mus/piano/ (ayudante A) van en TR.PIANO = [[ruta, midi], …] (las carga js/teclado.js);
  · la melodía del recital (../../t3/melodia.json, ayudante A) se copia a data/melodia_t3.js (TR.MELODIA), porque la
    web publicada no lleva la carpeta t3/. Si no está, se queda la copia anterior (o la de reserva de data/t3.js).
"""
import json, os, re, sys, shutil
AQUI = os.path.dirname(os.path.abspath(__file__))
EXT = re.compile(r'\.(webp|png|jpe?g|avif|gif|mp3|ogg|wav|m4a|mp4|webm)$', re.I)
TROZO = re.compile(r'^(.*\.(?:mp4|webm))\.(\d+)$', re.I)
rec, trozos, piano = {}, {}, []
TOPE = 9 * 1024 * 1024
if '--trocea' in sys.argv:   # (solo s3/vid)
    vd = os.path.join(AQUI, 'vid')
    for f in sorted(os.listdir(vd)) if os.path.isdir(vd) else []:
        ruta = os.path.join(vd, f)
        if os.path.isfile(ruta) and re.search(r'\.(mp4|webm)$', f, re.I) and os.path.getsize(ruta) > TOPE:
            with open(ruta, 'rb') as e:
                k = 0
                while True:
                    b = e.read(TOPE)
                    if not b: break
                    k += 1
                    with open(ruta + '.' + str(k), 'wb') as o: o.write(b)
            os.makedirs(os.path.join(vd, '_enteros'), exist_ok=True)
            shutil.move(ruta, os.path.join(vd, '_enteros', f))
            print('troceado', f, '→', k, 'trozos')
S1 = os.path.normpath(os.path.join(AQUI, '..', 's1'))
S2 = os.path.normpath(os.path.join(AQUI, '..', 's2'))
RAICES = [(os.path.join(AQUI, c), AQUI) for c in ('img', 'voz', 'mus', 'sfx', 'vid')] + \
         [(os.path.join(S1, c), AQUI) for c in ('img/t1', 'mus', 'sfx', 'vid')] + \
         [(os.path.join(S2, 'img/t2'), AQUI)]
NOTA = re.compile(r'(?:^|[_\-\s])([A-Ga-g])(s|#|b)?(-?\d)(?:[_\-\s.]|$)')
PC = {'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11}
for raiz, base in RAICES:
    for d, ds, fs in os.walk(raiz):
        ds[:] = [x for x in ds if not x.startswith('_')]
        for f in sorted(fs):
            ruta = os.path.relpath(os.path.join(d, f), base).replace(os.sep, '/')
            m = TROZO.match(ruta)
            if m:
                trozos[m.group(1)] = max(trozos.get(m.group(1), 0), int(m.group(2)))
                rec[m.group(1)] = rec.get(m.group(1), 0) + os.path.getsize(os.path.join(d, f))
            elif EXT.search(f) and 'mus/piano/' not in ruta:
                rec[ruta] = os.path.getsize(os.path.join(d, f))
            elif EXT.search(f) and ruta.startswith('mus/piano/'):
                rec[ruta] = os.path.getsize(os.path.join(d, f))   # (T3) las de s3 se precargan; las de ../s1 las carga sonido.js
                n = NOTA.search(os.path.splitext(f)[0] + '.')
                if n:
                    al = 1 if n.group(2) in ('s', '#') else (-1 if n.group(2) == 'b' else 0)
                    piano.append([ruta, 12 * (int(n.group(3)) + 1) + PC[n.group(1).lower()] + al])
with open(os.path.join(AQUI, 'data', 'recursos.js'), 'w', encoding='utf-8') as out:
    out.write('/* GENERADO por inventario.py: no editar a mano */\n')
    out.write('window.TR = window.TR || {};\nTR.RECURSOS = ' + json.dumps(dict(sorted(rec.items())), ensure_ascii=False, indent=0) + ';\n')
    out.write('window.TROZOS = ' + json.dumps(trozos) + ';\n')
    out.write('TR.PIANO = ' + json.dumps(sorted(piano, key=lambda x: x[1])) + ';\n')
MEL = os.path.normpath(os.path.join(AQUI, '..', '..', 't3', 'melodia.json'))
if os.path.isfile(MEL):
    with open(MEL, encoding='utf-8') as e: mel = json.load(e)
    with open(os.path.join(AQUI, 'data', 'melodia_t3.js'), 'w', encoding='utf-8') as out:
        out.write('/* GENERADO por inventario.py desde t3/melodia.json (ayudante A): no editar a mano */\n')
        out.write('window.TR = window.TR || {};\nTR.MELODIA = ' + json.dumps(mel, ensure_ascii=False) + ';\n')
    print('melodía:', mel.get('titulo'), '·', len(mel.get('notas', [])), 'notas')
print(len(rec), 'ficheros ·', round(sum(rec.values()) / 1048576, 1), 'MB · piano:', len(piano), 'muestras · trozos:', trozos)
