"""Genera el audio de la clase guiada con voz a partir de assets/voz-datos.js.

Uso:
  python3 -m venv .venv && .venv/bin/pip install edge-tts
  .venv/bin/python tools/generar-audio.py            # solo lo que cambió
  .venv/bin/python tools/generar-audio.py --todo     # regenera todo

Escribe assets/audio/<lección>/<n>.mp3, las marcas de tiempo de cada palabra en
assets/audio/<lección>/marcas.json ([ms, inicio, largo] por palabra, para los subtítulos
y el señalador) y un manifiesto con el hash de cada texto, para no regenerar lo que no cambió. Usa voces neuronales de Microsoft vía edge-tts.
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


def alinea(texto, palabras):
    """Ubica cada palabra hablada en el texto: devuelve [ms, inicio, largo]."""
    r, cur, bajo = [], 0, texto.lower()
    for ms, w in palabras:
        i = bajo.find(w.lower(), cur)
        if i < 0:
            continue
        r.append([ms, i, len(w)])
        cur = i + len(w)
    return r


async def genera(texto, destino, sem):
    async with sem:
        for intento in range(4):
            try:
                c = edge_tts.Communicate(texto, VOZ, rate=VELOCIDAD, boundary="WordBoundary")
                audio, palabras = bytearray(), []
                async for x in c.stream():
                    if x["type"] == "audio":
                        audio += x["data"]
                    elif x["type"] == "WordBoundary":
                        palabras.append((x["offset"] // 10000, x["text"]))
                destino.write_bytes(audio)
                return alinea(texto, palabras)
            except Exception:  # la red falla a veces: reintentar
                if intento == 3:
                    raise
                await asyncio.sleep(2 + intento * 3)


async def main():
    todo = "--todo" in sys.argv
    guiones = carga()
    viejo = {} if todo or not MANIFIESTO.exists() else json.loads(MANIFIESTO.read_text())
    nuevo, tareas, sem = {}, [], asyncio.Semaphore(6)
    marcas = {}
    for lid, segs in guiones.items():
        carpeta = SALIDA / lid
        carpeta.mkdir(parents=True, exist_ok=True)
        for f in carpeta.glob("*.mp3"):  # quita audios que sobran
            if int(f.stem) >= len(segs):
                f.unlink()
        fm = carpeta / "marcas.json"
        previas = json.loads(fm.read_text()) if fm.exists() and not todo else []
        marcas[lid] = [previas[n] if n < len(previas) else None for n in range(len(segs))]
        for n, s in enumerate(segs):
            clave = f"{lid}/{n}"
            h = hashlib.sha1(f"{VOZ}|{VELOCIDAD}|{s['t']}".encode()).hexdigest()[:12]
            nuevo[clave] = h
            destino = carpeta / f"{n}.mp3"
            if viejo.get(clave) != h or not destino.exists() or not marcas[lid][n]:
                tareas.append((lid, n, genera(s["t"], destino, sem)))
    print(f"{len(tareas)} audios por generar")
    hechos = await asyncio.gather(*(t[2] for t in tareas))
    for (lid, n, _), m in zip(tareas, hechos):
        marcas[lid][n] = m
    for lid, m in marcas.items():
        (SALIDA / lid / "marcas.json").write_text(json.dumps(m, separators=(",", ":")))
    MANIFIESTO.write_text(json.dumps(nuevo, indent=0, sort_keys=True))
    print("listo")


asyncio.run(main())
