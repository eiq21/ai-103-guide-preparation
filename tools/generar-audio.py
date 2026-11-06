"""Genera el audio de la clase guiada con voz a partir de assets/voz-datos.js.

Uso:
  python3 -m venv .venv && .venv/bin/pip install edge-tts
  .venv/bin/python tools/generar-audio.py            # solo lo que cambió
  .venv/bin/python tools/generar-audio.py --todo     # regenera todo

Escribe assets/audio/<lección>/<n>.mp3 y un manifiesto con el hash de cada texto,
para no regenerar lo que no cambió. Usa voces neuronales de Microsoft vía edge-tts.
"""
import asyncio, hashlib, json, pathlib, re, sys
import edge_tts

VOZ = "es-MX-JorgeNeural"
VELOCIDAD = "-4%"
RAIZ = pathlib.Path(__file__).resolve().parent.parent
DATOS = RAIZ / "assets" / "voz-datos.js"
SALIDA = RAIZ / "assets" / "audio"
MANIFIESTO = SALIDA / "manifiesto.json"


def carga():
    txt = DATOS.read_text(encoding="utf-8")
    return json.loads(re.search(r"var VOZ=(\{.*\});", txt, re.S).group(1))


async def genera(texto, destino, sem):
    async with sem:
        for intento in range(4):
            try:
                await edge_tts.Communicate(texto, VOZ, rate=VELOCIDAD).save(str(destino))
                return
            except Exception as e:  # la red falla a veces: reintentar
                if intento == 3:
                    raise
                await asyncio.sleep(2 + intento * 3)


async def main():
    todo = "--todo" in sys.argv
    guiones = carga()
    viejo = {} if todo or not MANIFIESTO.exists() else json.loads(MANIFIESTO.read_text())
    nuevo, tareas, sem = {}, [], asyncio.Semaphore(6)
    for lid, segs in guiones.items():
        carpeta = SALIDA / lid
        carpeta.mkdir(parents=True, exist_ok=True)
        for f in carpeta.glob("*.mp3"):  # quita audios que sobran
            if int(f.stem) >= len(segs):
                f.unlink()
        for n, s in enumerate(segs):
            clave = f"{lid}/{n}"
            h = hashlib.sha1(f"{VOZ}|{VELOCIDAD}|{s['t']}".encode()).hexdigest()[:12]
            nuevo[clave] = h
            destino = carpeta / f"{n}.mp3"
            if viejo.get(clave) != h or not destino.exists():
                tareas.append(genera(s["t"], destino, sem))
    print(f"{len(tareas)} audios por generar")
    await asyncio.gather(*tareas)
    MANIFIESTO.write_text(json.dumps(nuevo, indent=0, sort_keys=True))
    print("listo")


asyncio.run(main())
