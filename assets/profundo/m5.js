/* Módulo 5: Visión, texto y voz. Contenido "A fondo", preguntas y caso de estudio. */
(function(){
  var U=function(p){return "https://learn.microsoft.com/en-us/azure/"+p};
  var F={
    img:U("foundry/openai/how-to/dall-e"),
    sora:U("foundry/openai/concepts/video-generation"),
    vision:U("foundry/openai/how-to/gpt-with-vision"),
    shields:U("foundry/openai/concepts/content-filter-prompt-shields"),
    agentic:U("ai-services/content-understanding/concepts/agentic-mode"),
    cuvideo:U("ai-services/content-understanding/video/overview"),
    culimites:U("ai-services/content-understanding/service-limits"),
    cuguard:U("ai-services/content-understanding/concepts/guardrails"),
    pii:U("ai-services/language-service/personally-identifiable-information/overview"),
    schema:U("foundry/openai/how-to/structured-outputs"),
    trad:U("ai-services/translator/text-translation/2026-06-06/translate-api"),
    tradmig:U("ai-services/translator/text-translation/how-to/migrate-to-2026-06-06"),
    adapt:U("ai-services/translator/foundry/adaptive-custom-translation"),
    voz:U("foundry/agents/how-to/migrate-from-voice-live"),
    vozcustom:U("ai-services/speech-service/voice-live-how-to-customize"),
    vozhow:U("ai-services/speech-service/voice-live-how-to"),
    cspeech:U("ai-services/speech-service/custom-speech-overview"),
    strad:U("ai-services/speech-service/how-to-translate-speech"),
  };
  function T(h,r){
    return '<div class="tw"><table><thead><tr>'+h.map(function(x){return '<th>'+x+'</th>'}).join("")+'</tr></thead><tbody>'+
      r.map(function(f){return '<tr>'+f.map(function(c){return '<td>'+c+'</td>'}).join("")+'</tr>'}).join("")+'</tbody></table></div>';
  }
  function C(s){return '<pre><code>'+s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</code></pre>'}

  /* ---------- 5-1 ---------- */
  EXTRA["5-1"]={
    secciones:[
      {t:"Controles de generación",html:
        '<p>La elección del modelo fija qué controles existen. <code>gpt-image-2.5-sunburst</code> prioriza la precisión de edición, <code>gpt-image-2.5-flare</code> la velocidad y <code>gpt-image-2</code> ofrece alta resolución; los tres figuran como GA. <code>dall-e-3</code> ya no funciona, y las fechas de la serie <code>gpt-image-1</code> deben confirmarse en el calendario de retiros antes de diseñar sobre ella.</p>'+
        T(["Control","Regla","Decisión típica"],[
          ["<code>size</code>","En la serie 2 y 2.5: lados múltiplos de 16, lado máximo 3840, relación hasta 3:1, entre 655 360 y 8 294 400 píxeles","Banner: <code>1536x864</code>. Con <code>size=auto</code> las reglas no se garantizan"],
          ["<code>quality</code>","Serie 2.5: <code>low</code>, <code>medium</code>, <code>high</code>, <code>xhigh</code>, <code>max</code>, <code>auto</code>","Borrador con <code>low</code>; pieza final con un nivel superior"],
          ["<code>output_format</code>","PNG (predeterminado) o JPEG; WEBP no se admite","JPEG para peso; PNG para transparencia"],
          ["<code>output_compression</code>","0 a 100; solo tiene efecto en JPEG","Reducir peso de miniaturas"],
          ["<code>stream</code> y <code>partial_images</code>","0 a 3 imágenes parciales","Mostrar progreso en una interfaz"],
          ["<code>n</code>","1 a 10","Generar variantes para revisión"]
        ])+
        '<p>La serie GPT-image no admite <code>response_format</code>: el resultado siempre llega en <code>b64_json</code>. Las resoluciones por encima de <code>2560x1440</code> se consideran experimentales en la serie 2.5.</p>'},
      {t:"Edición con máscara, por prompt y con referencias",html:
        '<p>Una edición por prompt envía solo imagen e instrucción, y el modelo decide qué zonas cambian. La máscara acota el cambio: debe ser PNG, tener las mismas dimensiones que la imagen y marcar con alfa 0 los píxeles editables. El endpoint admite hasta 16 imágenes de entrada, PNG o JPG, de menos de 50 MB cada una; esa misma vía sirve para generar a partir de medios de referencia.</p>'+
        C(`url = f"{endpoint}openai/deployments/{deployment}/images/edits?api-version={api_version}"
files = {
    "image": ("foto.png", open("foto.png", "rb"), "image/png"),
    "mask": ("mascara.png", open("mascara.png", "rb"), "image/png"),
}
body = {"prompt": "Sustituir el cielo por un atardecer", "n": 1, "quality": "high"}
r = requests.post(url, headers={"Api-Key": key}, data=body, files=files).json()
imagen = base64.b64decode(r["data"][0]["b64_json"])`)+
        '<p>El parámetro <code>input_fidelity</code> controla el esfuerzo por conservar estilo y rasgos, sobre todo faciales, de las imágenes de entrada. No se admite en <code>gpt-image-1-mini</code>, y la documentación no confirma su soporte en la serie 2.5, por lo que conviene validarlo en el despliegue elegido.</p>'+
        T(["Necesidad","Enfoque"],[
          ["Cambiar un objeto concreto sin tocar el resto","Edición con máscara"],
          ["Cambiar el estilo global","Edición por prompt"],
          ["Combinar producto y logotipo en una escena","Edición con varias imágenes de entrada"],
          ["Mantener un rostro reconocible","<code>input_fidelity</code>, si el modelo lo admite"]
        ])},
      {t:"Moderación y procedencia",html:
        '<p>El filtro actúa en dos momentos. Si el prompt se considera dañino, no se genera nada y la respuesta indica <code>content_policy_violation</code>. Si el problema surge en el resultado, la imagen generada se filtra con el mensaje "Generated image was filtered as a result of our safety system". La primera situación se corrige con el prompt; la segunda puede requerir reformular la escena. Las imágenes fotorrealistas de menores se bloquean de forma predeterminada.</p>'+
        '<p>Para transparencia, Azure OpenAI incorpora Content Credentials: un manifiesto C2PA firmado que declara el origen generado, se añade sin configuración y se comprueba con herramientas externas de verificación. No equivale a una marca de agua visible. La página que lo describe corresponde al portal clásico y nombra las series DALL·E y GPT-image-1, de modo que debe verificarse en modelos más recientes.</p>'}
    ],
    preguntas:[
      {d:3,tipo:"unica",esc:"Fabrikam Home publica fotos de sofás. Marketing debe sustituir únicamente el fondo de cada foto; el sofá y su etiqueta deben permanecer intactos. Las fotos son PNG de 1536x1024 y el modelo desplegado es gpt-image-2.5-sunburst.",
       q:"¿Qué configuración de la solicitud cumple el requisito?",
       ops:["Llamar a images/edits con multipart/form-data, la foto y una máscara PNG de 1536x1024 con alfa 0 en el fondo","Llamar a images/edits con multipart/form-data, la foto y una máscara PNG de 1536x1024 con el fondo pintado de negro opaco","Llamar a images/generations con JSON, la foto en base64 y un prompt que indique conservar el sofá","Llamar a images/edits con multipart/form-data, la foto y una máscara PNG de 1024x1024 con alfa 0 en el fondo"],ok:[0],
       exp:"La máscara debe ser PNG, tener las mismas dimensiones que la imagen y marcar la zona editable con píxeles totalmente transparentes. El color negro opaco no marca nada como editable. images/generations no recibe la imagen de partida. Una máscara de otras dimensiones incumple el requisito de tamaño.",fuente:F.img},
      {d:3,tipo:"multiple",esc:"Northwind Editorial automatiza portadas con gpt-image-2.5-flare y fija el valor de size en cada solicitud para evitar rechazos.",
       q:"¿Qué valores de size cumplen las reglas de dimensiones personalizadas?",
       ops:["1536x864","1000x1000","3840x1280","3840x1024","512x512","2048x1152"],ok:[0,2,5],
       exp:"1536x864, 3840x1280 y 2048x1152 usan múltiplos de 16, respetan la relación máxima de 3:1 y quedan dentro del rango de píxeles. 1000x1000 no usa múltiplos de 16. 3840x1024 supera la relación 3:1. 512x512 queda por debajo de 655 360 píxeles.",fuente:F.img},
      {d:3,tipo:"sino",esc:"Un equipo revisa la configuración de una aplicación que genera imágenes con gpt-image-2 y las entrega en una galería web.",
       q:"Indique si cada afirmación es correcta.",
       afirm:[
         {t:"Con output_format=png, output_compression=60 reduce el peso del archivo.",ok:false},
         {t:"Enviar response_format=url permite recibir un enlace temporal en lugar de base64.",ok:false},
         {t:"stream=true con partial_images=2 permite mostrar avances antes de la imagen final.",ok:true},
         {t:"Para obtener WEBP debe convertirse el resultado en la aplicación, ya que la API no lo genera.",ok:true}
       ],
       exp:"output_compression solo aplica a JPEG. La serie GPT-image no admite response_format y devuelve b64_json. stream y partial_images entregan imágenes parciales. WEBP no está soportado como salida en Azure, por lo que cualquier conversión queda en manos de la aplicación.",fuente:F.img},
      {d:3,tipo:"orden",esc:"Contoso Inmobiliaria debe borrar un cartel en fotos de fachadas sin alterar el resto del edificio.",
       q:"Ordene los pasos del flujo de inpainting.",
       pasos:["Crear un PNG del mismo tamaño que la foto con alfa 0 sobre el cartel","Enviar foto, máscara y prompt a images/edits como multipart/form-data","Decodificar el valor b64_json de la respuesta","Comprobar el resultado antes de publicarlo"],
       sobran:["Enviar la máscara dentro de un cuerpo JSON","Solicitar response_format=url para descargar la imagen"],
       exp:"La máscara se prepara primero porque define la zona editable. La solicitud es multipart/form-data, no JSON, y la serie GPT-image devuelve siempre b64_json, por lo que response_format no procede. La revisión final protege la publicación.",fuente:F.img},
      {d:3,tipo:"completar",esc:"Una aplicación en Python cambia solo la zona marcada de una imagen mediante REST.",
       q:"Complete el código.",
       codigo:`url = f"{endpoint}openai/deployments/{deployment}/images/{{0}}?api-version={api_version}"
files = {
    "image": ("foto.png", open("foto.png", "rb"), "image/png"),
    "{{1}}": ("zona.png", open("zona.png", "rb"), "image/png"),
}
r = requests.post(url, headers={"Api-Key": key}, data={"prompt": prompt}, files=files).json()
imagen = base64.b64decode(r["data"][0]["{{2}}"])`,
       huecos:[{ops:["edits","generations","variations"],ok:0},{ops:["mask","alpha","overlay"],ok:0},{ops:["b64_json","url","image"],ok:0}],
       exp:"La edición usa images/edits. El archivo que delimita la zona se envía en el campo mask. La respuesta entrega la imagen en data[0].b64_json; url no se aplica a la serie GPT-image.",fuente:F.img}
    ]
  };

  /* ---------- 5-2 ---------- */
  EXTRA["5-2"]={
    secciones:[
      {t:"API v1 y ciclo del trabajo",html:
        '<p>Sora 2 sigue en <b>preview</b> y usa la API v1, con cinco operaciones: crear, consultar estado, descargar, listar y eliminar. La generación es asíncrona, por lo que la aplicación no debe mantener una petición abierta: conviene guardar el identificador y consultar el estado.</p>'+
        C(`video = client.videos.create(
    model="sora-2",  # nombre del despliegue
    prompt="Plano medio de una bicicleta en una calle mojada al amanecer",
    size="1280x720", seconds="8")

while video.status not in ("completed", "failed", "cancelled"):
    time.sleep(20)
    video = client.videos.retrieve(video.id)

if video.status == "completed":
    client.videos.download_content(video.id, variant="video").write_to_file("spot.mp4")`)+
        '<p>Se recomienda autenticación sin claves con <code>DefaultAzureCredential</code>, el rol <code>Cognitive Services User</code> y el ámbito <code>https://ai.azure.com/.default</code>. La facturación es por segundo, de modo que duración y número de reintentos influyen de forma directa en el costo.</p>'+
        '<p><b>Aviso de vigencia.</b> El calendario de retiros muestra <code>sora-2</code> 2025-12-08 con fecha 2026-10-15, mientras el catálogo de modelos aún lo lista en preview. Antes de comprometer una solución debe confirmarse la disponibilidad real.</p>'},
      {t:"Medios de referencia y edición de videos generados",html:
        T(["Entrada","Parámetro","Uso"],[
          ["Texto","<code>prompt</code>","Escena nueva"],
          ["Imagen + texto","<code>input_reference</code>","Anclar el primer fotograma, por ejemplo una foto de producto"],
          ["Video generado + texto","<code>videos.remix(video_id, prompt)</code>","Ajuste puntual que conserva estructura, movimiento y encuadre"]
        ])+
        '<p><code>input_reference</code> admite <code>image/jpeg</code>, <code>image/png</code> o <code>image/webp</code> y debe coincidir exactamente con <code>size</code>. Si la foto mide 1024x1024 y el video 1280x720, primero debe recortarse o redimensionarse. <code>remix</code> requiere el identificador de un video completado y funciona mejor con una sola modificación bien descrita: las instrucciones estrechas conservan más fidelidad y reducen defectos visuales.</p>'+
        '<p>Regenerar con <code>create</code> es preferible cuando cambia la escena completa. Remix es preferible cuando solo cambia un atributo, como la paleta de color o la iluminación.</p>'},
      {t:"Restricciones que condicionan el diseño",html:
        T(["Restricción","Consecuencia"],[
          ["Solo contenido apto para menores de 18 años","Conviene moderar el prompt antes de crear el trabajo"],
          ["Personajes y música con copyright se rechazan","La revisión debe cubrir también las indicaciones de audio, ya que el modelo genera sonido"],
          ["No se generan personas reales ni figuras públicas","Una campaña con un portavoz real no es viable"],
          ["Imágenes de entrada con rostros humanos se rechazan","Las fotos de empleados no sirven como referencia"],
          ["Trabajos disponibles hasta 24 horas","El MP4 debe copiarse a almacenamiento propio"],
          ["Dificultad con física compleja y secuencias temporales precisas","Es prudente pedir escenas simples y prever revisión humana"]
        ])+
        '<p>Para mejores resultados, los prompts deben redactarse en inglés u otros idiomas de escritura latina e incluir tipo de plano, sujeto, acción, entorno, iluminación y movimiento de cámara.</p>'+
        '<p>La página oficial presenta dos conjuntos de límites: la referencia de la API indica 720x1280 o 1280x720 y 4, 8 o 12 segundos, mientras que la sección de limitaciones cita más resoluciones y de 1 a 20 segundos. Para este curso se adoptan los valores de la referencia de la API v1.</p>'}
    ],
    preguntas:[
      {d:3,tipo:"unica",esc:"Adventure Works aprobó un video de 8 segundos generado con Sora 2. El director creativo quiere una paleta más cálida y exige conservar el movimiento y el encuadre aprobados. El video sigue disponible.",
       q:"¿Qué operación debe usarse?",
       ops:["videos.remix con el identificador del video y una única instrucción sobre la paleta","videos.create con el mismo prompt ampliado con la nueva paleta","videos.create con un fotograma del video como input_reference","images/edits sobre cada fotograma exportado con una máscara PNG"],ok:[0],
       exp:"Remix reutiliza la estructura, el movimiento y el encuadre de un video completado, y funciona mejor con un solo ajuste. Crear de nuevo con el mismo prompt produce otra interpretación. input_reference solo ancla el primer fotograma. Editar fotograma por fotograma no garantiza coherencia temporal y no es el flujo previsto.",fuente:F.sora},
      {d:3,tipo:"sino",esc:"Una agencia prepara una campaña con Sora 2. Dispone de una foto de producto de 1024x1024, una foto de su directora general y un guion que cita a un personaje de cómic protegido. El video final será de 1280x720.",
       q:"Indique si cada afirmación es correcta.",
       afirm:[
         {t:"La foto de producto puede enviarse sin cambios como input_reference.",ok:false},
         {t:"La foto de la directora general es una referencia válida si se ajusta al tamaño del video.",ok:false},
         {t:"El guion debe modificarse porque los personajes con copyright se rechazan.",ok:true},
         {t:"La agencia debe copiar el MP4 a su almacenamiento, ya que el trabajo solo está disponible durante un tiempo limitado.",ok:true}
       ],
       exp:"input_reference debe coincidir exactamente con size. Las imágenes de entrada con rostros humanos se rechazan, sea cual sea su tamaño. Los personajes con copyright también se rechazan. Los trabajos se conservan hasta 24 horas, por lo que debe guardarse una copia.",fuente:F.sora},
      {d:3,tipo:"completar",esc:"Un servicio en Python crea un video, espera a que finalice y guarda el MP4.",
       q:"Complete el código.",
       codigo:`video = client.videos.{{0}}(model=despliegue, prompt=texto, size="1280x720")
while video.status not in ("completed", "failed", "cancelled"):
    time.sleep(20)
    video = client.videos.{{1}}(video.id)
if video.status == "completed":
    client.videos.{{2}}(video.id, variant="video").write_to_file("spot.mp4")`,
       huecos:[{ops:["create","generate","submit"],ok:0},{ops:["retrieve","poll","status"],ok:0},{ops:["download_content","get_file","export"],ok:0}],
       exp:"videos.create inicia el trabajo. videos.retrieve consulta el estado y videos.download_content recupera el archivo con variant=video.",fuente:F.sora},
      {d:3,tipo:"orden",esc:"Tailwind Traders convierte una foto de producto sin personas en un clip de 1280x720 y necesita un ajuste de iluminación posterior.",
       q:"Ordene las acciones.",
       pasos:["Ajustar la imagen a 1280x720","Llamar a videos.create con input_reference y size=1280x720","Consultar con videos.retrieve hasta el estado completed","Descargar el MP4 a almacenamiento propio","Llamar a videos.remix con una sola instrucción de iluminación"],
       sobran:["Enviar una máscara PNG con alfa 0 sobre los fotogramas"],
       exp:"La referencia debe coincidir con size antes de crear el trabajo. Después se consulta el estado y se guarda el resultado, ya que está disponible por tiempo limitado. Remix exige un video completado. Las máscaras pertenecen a la edición de imágenes, no a este flujo.",fuente:F.sora}
    ]
  };

  /* ---------- 5-3 ---------- */
  EXTRA["5-3"]={
    secciones:[
      {t:"Captions, alt text y preguntas sobre evidencia visual",html:
        '<p>En Chat Completions cada mensaje combina partes <code>text</code> e <code>image_url</code>. El nivel de detalle regula costo y precisión. Cada solicitud admite hasta 10 imágenes de hasta 20 MB, en JPEG, PNG, WEBP o GIF (solo el primer fotograma).</p>'+
        C(`{"role": "user", "content": [
  {"type": "text", "text": "Genere alt text de 125 caracteres o menos y una descripción ampliada. Si un dato no es visible, indique: no visible."},
  {"type": "image_url", "image_url": {"url": data_url, "detail": "high"}}
]}`)+
        T(["<code>detail</code>","Comportamiento","Uso"],[
          ["<code>low</code>","Versión de 512x512, menos tokens","Caption breve de una foto simple"],
          ["<code>high</code>","Vista general y segmentos detallados de 512x512","Lectura de etiquetas o daños pequeños"],
          ["<code>auto</code>","Predeterminado; decide según el tamaño","Cargas variadas"]
        ])+
        '<p>Las URL deben ser públicas: los endpoints privados y las cuentas con firewall no sirven, porque la imagen se obtiene desde infraestructura de Microsoft. La alternativa es un data URL en base64. Debe fijarse <code>max_tokens</code> o, en modelos de razonamiento, <code>max_completion_tokens</code>, para evitar respuestas cortadas. Para respuestas basadas en evidencia, el prompt debe exigir citar lo visible y declarar lo que no se aprecia. Un buen alt text describe la función de la imagen en su contexto; la descripción ampliada aporta el detalle.</p>'},
      {t:"Content Understanding para imagen y video",html:
        '<p>La versión GA es <code>2025-11-01</code>. El análisis es asíncrono: responde <code>202</code> con <code>Operation-Location</code>. Los analizadores personalizados solo derivan de <code>prebuilt-document</code>, <code>-image</code>, <code>-audio</code> o <code>-video</code>.</p>'+
        C(`{ "baseAnalyzerId": "prebuilt-video",
  "models": {"completion": "gpt-5.2"},
  "config": {"returnDetails": true, "enableSegment": true,
    "contentCategories": {"noticia": {"description": "Cada noticia completa, sin anuncios"}}},
  "fieldSchema": {"fields": {
    "marca": {"type": "string", "method": "generate", "description": "Marca visible o citada"},
    "riesgo": {"type": "string", "method": "classify", "enum": ["apto", "revisar"]}
  }}}`)+
        T(["Límite","Implicación"],[
          ["Métodos en imagen y video: <code>generate</code> y <code>classify</code>","<code>extract</code> queda para documentos"],
          ["Video: una sola <code>contentCategories</code>","Una segmentación por analizador"],
          ["Cerca de 1 fotograma por segundo a 512x512","Se pierden eventos fugaces y texto pequeño"],
          ["Solo se transcribe el habla","Música y efectos se ignoran"],
          ["<code>analyzeBinary</code>: 200 MB y 30 minutos; <code>analyze</code> por URL: 4 GB y 2 horas","Videos largos desde Blob Storage"]
        ])+
        '<p>Para ubicar elementos debe distinguirse el medio. <code>estimateFieldSourceAndConfidence</code> y los cuadros delimitadores solo se documentan para documentos. En video, la ubicación temporal procede de los segmentos y de <code>cameraShotTimesMs</code>, disponible con <code>returnDetails</code>. En imagen, los campos describen presencia, conteo o estado, y la documentación no garantiza coordenadas.</p>'},
      {t:"De single-task y pro mode a agentic mode",html:
        '<p>Un pipeline <b>single-task</b> corresponde a un analizador estándar: una tarea definida por esquema, adecuada para la extracción directa. <b>Pro mode</b> solo existía en <code>2025-05-01-preview</code>, ya retirada, y su sustituto es <b>agentic mode</b> (preview, <code>2026-06-01-preview</code>), que se activa con <code>"workflow": "agentic"</code> en <code>config</code>.</p>'+
        '<p>Agentic mode razona, calcula y valida, pero solo en analizadores de documento, con un archivo por solicitud (que puede contener varios documentos relacionados), sin campos <code>extract</code> ni ejemplos etiquetados, y con unos 400 000 TPM por trabajo. No es un reemplazo directo si el flujo dependía de varios archivos o de datos de referencia.</p>'},
      {t:"Filtros, inyección por imagen y reglas visuales",html:
        '<p>Los guardrails clasifican <code>hate</code>, <code>sexual</code>, <code>violence</code> y <code>self-harm</code> en texto e imagen. Analyze Image devuelve severidades 0, 2, 4 y 6. Prompt Shields analiza <b>texto suministrado</b>, no píxeles, y la detección de ataques en documentos está desactivada por defecto. Por ello, el texto incrustado se extrae con OCR y se envía en <code>documents</code> antes de pasar la imagen al modelo. El análisis independiente admite <code>userPrompt</code> y hasta cinco documentos, y devuelve <code>attackDetected</code>.</p>'+
        T(["Regla","Mecanismo"],[
          ["Símbolos prohibidos, uso de marca","Campo <code>classify</code> en Content Understanding y revisión humana"],
          ["Incidente visual emergente","Custom categories (rapid), en preview y con retiro el 30 de abril de 2027"],
          ["Términos exactos","Blocklists, solo texto"],
          ["Marca de agua visible","Posproceso de la aplicación; no se documenta un parámetro de plataforma"]
        ])+
        '<p>Si un guardrail suprime campos, Content Understanding puede responder <code>Succeeded</code> con <code>HarmfulContentFiltered</code> en <code>result.warnings</code>. Un campo vacío no prueba, por sí solo, la ausencia del dato.</p>'}
    ],
    preguntas:[
      {d:3,tipo:"unica",esc:"Lucerne Seguros guarda fotos de siniestros en una cuenta de Azure Storage accesible solo por private endpoint. Una llamada a un modelo multimodal con la URL de cada foto falla, aunque el recurso de Foundry está en la misma red virtual.",
       q:"¿Qué cambio resuelve el problema y mantiene la cuenta privada?",
       ops:["Leer la imagen desde la aplicación y enviarla como data URL en base64","Conceder al recurso de Foundry el rol Storage Blob Data Reader sobre la cuenta","Crear un private endpoint adicional para el recurso de Foundry en la subred de Storage","Generar una SAS y añadirla a la URL sin cambiar la configuración de red"],ok:[0],
       exp:"La imagen se obtiene desde infraestructura gestionada por Microsoft, no desde la red virtual, por lo que las URL con private endpoint o firewall no funcionan. El data URL evita esa descarga. Los roles y los private endpoints no cambian el origen de la solicitud, y una SAS no atraviesa la restricción de red.",fuente:F.vision},
      {d:3,tipo:"multiple",esc:"Fabrikam Media analizará noticieros de 40 minutos en Blob Storage. Necesita dividir cada emisión por noticia y obtener en cada una la marca citada y una clasificación entre apto y revisar.",
       q:"¿Qué elementos debe incluir el analizador personalizado?",
       ops:["baseAnalyzerId con el valor prebuilt-video","enableSegment=true con una categoría en contentCategories que describa la división por noticia","Un campo con method=classify y enum para la clasificación","Un campo con method=extract para la marca","Dos categorías en contentCategories, una para noticias y otra para anuncios"],ok:[0,1,2],
       exp:"Los analizadores personalizados derivan de una base por modalidad. La segmentación requiere enableSegment y contentCategories, con una sola categoría en video. classify con enum resuelve la clasificación. extract solo existe para documentos, y dos categorías superan el límite de video.",fuente:F.culimites},
      {d:3,tipo:"sino",esc:"Un equipo evalúa Content Understanding para revisar anuncios con cortes rápidos y música licenciada. Los archivos ocupan 900 MB y duran 25 minutos.",
       q:"Indique si cada afirmación es correcta.",
       afirm:[
         {t:"Los archivos pueden enviarse directamente con analyzeBinary.",ok:false},
         {t:"Un logotipo visible durante una fracción de segundo podría no detectarse.",ok:true},
         {t:"La letra de la música se incluirá en la transcripción.",ok:false},
         {t:"Con returnDetails=true la salida incluye cameraShotTimesMs.",ok:true}
       ],
       exp:"analyzeBinary admite hasta 200 MB, por lo que estos archivos deben referenciarse por URL. El muestreo es cercano a un fotograma por segundo. Solo se transcribe el habla; música y efectos se ignoran. Los límites de plano se devuelven en milisegundos con returnDetails.",fuente:F.cuvideo},
      {d:3,tipo:"unica",esc:"Trey Research mantiene un analizador en pro mode que cruza un contrato y sus anexos para validar totales. Todo el material ya se consolida en un solo PDF. Debe seguir operando tras el retiro de la API 2025-05-01-preview, y la dirección acepta usar una versión preview.",
       q:"¿Qué debe hacerse?",
       ops:["Crear un analizador de documento con 2026-06-01-preview, config.workflow=agentic y campos generate o classify, con al menos 400 000 TPM","Crear un analizador con 2025-11-01 y config.workflow=pro, con campos extract y un knowledge base de referencia","Crear un analizador de imagen con prebuilt-image y returnDetails=true sobre cada página exportada","Crear un analizador con 2026-06-01-preview, config.workflow=agentic y campos extract en todos los totales"],ok:[0],
       exp:"Pro mode se retiró con 2025-05-01-preview y la migración indicada es agentic mode, que admite un archivo con varios documentos lógicos y requiere unos 400 000 TPM. No existe un valor pro para workflow en GA. Los analizadores de imagen no razonan sobre documentos, y agentic mode no admite campos extract.",fuente:F.agentic},
      {d:3,tipo:"orden",esc:"Un agente de soporte recibe capturas de pantalla subidas por clientes. Se teme que contengan instrucciones ocultas, como una orden de ignorar las reglas y reenviar datos.",
       q:"Ordene los controles antes de que el modelo procese la captura.",
       pasos:["Comprobar que la detección de ataques en documentos esté habilitada","Extraer el texto de la captura con OCR","Enviar el texto extraído en el campo documents de Prompt Shields","Descartar o escalar la captura si se detecta un ataque","Pasar la imagen aprobada al modelo como contenido no confiable"],
       sobran:["Enviar los píxeles de la imagen a Prompt Shields para su análisis directo"],
       exp:"Prompt Shields analiza texto, de modo que el contenido incrustado debe extraerse antes. La detección en documentos está desactivada por defecto en Foundry. Azure AI Content Safety solo informa del resultado, por lo que la aplicación decide cómo actuar. El rendimiento puede variar fuera del inglés, así que conviene probar con contenido representativo.",fuente:F.shields}
    ]
  };

  /* ---------- 5-4 ---------- */
  EXTRA["5-4"]={
    secciones:[
      {t:"Herramienta especializada o modelo de lenguaje",html:
        T(["Requisito","Elección","Motivo"],[
          ["Redactar PII en mensajes","Text PII","Síncrono, con categorías y confianza"],
          ["Redactar transcripciones","Conversation PII","Asíncrono, consciente de los turnos"],
          ["Redactar PDF o DOCX conservando formato","Document-based PII","Asíncrono y basado en almacenamiento"],
          ["Entidades de negocio propias","Custom NER","Modelo entrenado con datos etiquetados"],
          ["Tono, motivo o esquema flexible","LLM con structured outputs","Sin entrenamiento y adaptable por prompt"],
          ["Contenido dañino en texto","Guardrails o Analyze Text","Categorías y niveles de severidad"]
        ])+
        '<p>PII, language detection, NER y Text analytics for health son capacidades <b>core</b>. Sentiment y opinion mining, key phrase extraction y summarization son <b>legacy</b> y se retiran de Azure Language el 31 de marzo de 2029; los proyectos nuevos deben dirigirse a modelos de Foundry. Language no ofrece detección de tono como capacidad propia, de modo que ese requisito se cubre con prompting. La anonimización con reemplazo sintético de PII sigue en preview, igual que el control de PII en guardrails.</p>'},
      {t:"JSON fiable con structured outputs",html:
        '<p>JSON mode garantiza JSON válido, no el cumplimiento de un esquema. Structured outputs sí lo hace: en Chat Completions se define en <code>response_format</code>, y en Responses en <code>text.format</code>.</p>'+
        C(`"text": {"format": {
  "type": "json_schema", "name": "Reclamo", "strict": true,
  "schema": {
    "type": "object",
    "properties": {
      "tema":  {"type": "string"},
      "tono":  {"type": "string", "enum": ["calmado", "molesto", "urgente"]},
      "poliza": {"type": ["string", "null"]}
    },
    "required": ["tema", "tono", "poliza"],
    "additionalProperties": false
}}}`)+
        '<p>Reglas clave: todos los campos van en <code>required</code>; lo opcional se simula con una unión con <code>null</code>; cada objeto lleva <code>additionalProperties: false</code>; se admiten hasta 100 propiedades y cinco niveles de anidación. No se admiten <code>pattern</code>, <code>format</code>, <code>minimum</code>, <code>maximum</code> ni <code>minItems</code>, y la raíz no puede ser <code>anyOf</code>. Estas validaciones deben quedar en la aplicación. Tampoco se soporta con Foundry Agent Service, <code>gpt-audio</code> ni llamadas paralelas a funciones.</p>'},
      {t:"Translator 2026-06-06 y traducción con LLM",html:
        '<p>La versión GA <code>2026-06-06</code> no es compatible con v3.0: <code>to</code> pasa a <code>targets</code>, y desaparecen Detect, BreakSentence y Dictionary Lookup. La detección de idioma pasa a Azure Language.</p>'+
        C(`{"inputs": [{"text": "Your claim was approved.", "language": "en",
  "targets": [{"language": "es", "deploymentName": "gpt51-trad",
               "tone": "formal", "allowFallback": false}]}]}`)+
        T(["Motor","<code>deploymentName</code>","Datos","Actualización"],[
          ["NMT","<code>general</code> (predeterminado)","Ninguno","Gestionada"],
          ["Custom Translator","ID de categoría","Unos 10 000 pares","Reentrenar, hasta unas 48 h"],
          ["LLM","Despliegue propio","Opcional","Sin entrenamiento"],
          ["LLM adaptativo","Despliegue + <code>adaptiveDatasetId</code>","5 a 10 000 pares","Minutos"]
        ])+
        '<p><code>tone</code> y <code>gender</code> se aplican a la traducción con LLM. <code>referenceTextPairs</code> admite hasta cinco pares y, si se envía, ignora <code>adaptiveDatasetId</code>. El LLM requiere un recurso de Foundry y <b>no está disponible con private endpoint</b>. <code>allowFallback=false</code> devuelve error si el modelo no admite el par de idiomas, en lugar de recurrir al sistema general. Document Translation usa Blob Storage en modo asíncrono; el modo síncrono trata un archivo y responde directamente.</p>'},
      {t:"Salidas adaptadas a cumplimiento",html:
        '<p>Un resumen de cumplimiento combina controles deterministas y generativos: primero se redacta la PII, después se resume con instrucciones de dominio y, por último, se valida el esquema en la aplicación. El prompt debe definir audiencia, secciones obligatorias, términos permitidos y la obligación de indicar cuando un dato no conste en la fuente. Si el costo o la latencia importan, un modelo pequeño puede clasificar y uno mayor resumir solo los casos complejos.</p>'}
    ],
    preguntas:[
      {d:4,tipo:"unica",esc:"Woodgrove Bank almacena transcripciones de un centro de contacto con turnos identificados de cliente y agente. Debe redactar datos personales antes de que un equipo de analítica las use. El proceso es nocturno y la detección debe aprovechar el contexto de cada turno.",
       q:"¿Qué capacidad debe utilizarse?",
       ops:["Conversation PII","Text PII","Document-based PII","Custom NER"],ok:[0],
       exp:"Conversation PII trata intercambios por turnos y transcripciones en trabajos asíncronos. Text PII se orienta a cadenas en tiempo de solicitud. Document-based PII procesa archivos nativos. Custom NER extrae categorías propias, pero no resuelve la redacción con conciencia de la conversación.",fuente:F.pii},
      {d:4,tipo:"multiple",esc:"Un esquema con strict=true es rechazado. Define prioridad con minimum=1 y maximum=5, codigo con pattern, comentario solo en properties y no en required, y el objeto no incluye additionalProperties.",
       q:"¿Qué cambios son necesarios?",
       ops:["Añadir additionalProperties=false","Incluir comentario en required y permitir null en su tipo","Eliminar minimum, maximum y pattern, y validarlos en la aplicación","Cambiar la raíz a anyOf con las dos variantes del objeto","Sustituir strict=true por JSON mode manteniendo el esquema"],ok:[0,1,2],
       exp:"Structured outputs exige additionalProperties=false, todos los campos en required y no admite minimum, maximum ni pattern. Lo opcional se simula con una unión con null. La raíz no puede ser anyOf, y JSON mode no garantiza el cumplimiento del esquema.",fuente:F.schema},
      {d:4,tipo:"completar",esc:"Un despacho traduce avisos al español con un despliegue GPT-5.1 llamado gpt51-legal, en tono formal. Si el modelo no admite el par de idiomas debe producirse un error, nunca una traducción con otro motor.",
       q:"Complete el cuerpo para la API 2026-06-06.",
       codigo:`{"inputs": [{"text": aviso, "language": "en",
  "{{0}}": [{"language": "es", "{{1}}": "gpt51-legal",
             "tone": "formal", "{{2}}": false}]}]}`,
       huecos:[{ops:["targets","to","outputs"],ok:0},{ops:["deploymentName","model","category"],ok:0},{ops:["allowFallback","strict","fallbackToNmt"],ok:0}],
       exp:"La API 2026-06-06 sustituye to por el array targets. deploymentName selecciona el LLM. allowFallback tiene valor predeterminado true; con false el servicio devuelve error si el par de idiomas no está soportado.",fuente:F.trad},
      {d:4,tipo:"sino",esc:"Margie's Travel migra de Translator v3.0 a 2026-06-06 y estudia usar un LLM. Su recurso actual usa private endpoint y su código llama a Detect antes de traducir.",
       q:"Indique si cada afirmación es correcta.",
       afirm:[
         {t:"Basta con cambiar api-version a 2026-06-06 para migrar.",ok:false},
         {t:"La detección debe trasladarse a otro servicio, como Azure Language.",ok:true},
         {t:"La traducción con LLM no estará disponible mientras el recurso use private endpoint.",ok:true},
         {t:"Si una solicitud incluye referenceTextPairs y adaptiveDatasetId, se ignora adaptiveDatasetId.",ok:true}
       ],
       exp:"La versión no es compatible con v3.0, de modo que cambian cuerpo y respuesta. Detect se elimina y se remite a Language. La documentación excluye el LLM con private endpoint. Los pares de referencia tienen prioridad sobre adaptiveDatasetId.",fuente:F.tradmig},
      {d:4,tipo:"unica",esc:"Contoso Soporte traduce tickets con un LLM. Dispone de 900 pares de frases alineadas, y sus términos cambian cada semana. Los cambios deben aplicarse en el mismo día, sin ciclos de reentrenamiento.",
       q:"¿Qué opción cumple el requisito?",
       ops:["Adaptive custom translation con adaptiveDatasetId","Custom Translator con un modelo NMT entrenado","referenceTextPairs con los 900 pares en cada solicitud","Fine-tuning del despliegue LLM con los 900 pares"],ok:[0],
       exp:"Adaptive custom translation acepta de 5 a 10 000 pares, crea el conjunto en minutos y no requiere entrenamiento. Custom Translator suele necesitar unos 10 000 pares y reentrenamiento, de hasta unas 48 horas. referenceTextPairs admite hasta cinco pares. El fine-tuning implica entrenamiento y despliegue, contrario al requisito.",fuente:F.adapt}
    ]
  };

  /* ---------- 5-5 ---------- */
  EXTRA["5-5"]={
    secciones:[
      {t:"Rutas de voz para un agente",html:
        T(["Opción","Quién gestiona","Cuándo usarla"],[
          ["Voice Live directo","Sesión WebSocket y <code>session.update</code> desde el cliente","Voz de baja latencia con control fino, sin definir un agente"],
          ["Voice Live + agente de texto","Voice Live aporta el audio; el agente, la lógica","Reutilizar un agente sin rediseñarlo"],
          ["Agente de voz de Foundry (preview)","Definición versionada con <code>kind: voice</code>","Telefonía integrada, revisión de llamadas y configuración unificada"],
          ["STT + modelo + TTS propios","La aplicación orquesta todo","Requisitos no cubiertos por lo anterior, con más latencia y trabajo"]
        ])+
        '<p>Un agente de texto no puede convertirse en agente de voz: se crea uno nuevo. Ese agente usa el endpoint del proyecto, <code>api-version=v1</code> y el encabezado <code>Foundry-Features: VoiceAgents=V1Preview</code>. Las funciones nativas las ejecuta el cliente, mientras que MCP y toolbox las ejecuta el servicio. <code>store</code> es <code>false</code> por defecto; al activarlo se guardan transcripción, eventos y audio, por lo que deben revisarse consentimiento y retención.</p>'+
        '<p>En Voice Live se paga según el modelo (Pro, Standard o Lite), sin elegir el nivel. Para clientes web o móviles se recomienda WebRTC. Un recurso de Speech no admite integración con Agent Service ni BYOM. Los guardrails no cubren modelos de transcripción de audio.</p>'},
      {t:"Configuración de la sesión y personalización",html:
        C(`{"type": "session.update", "session": {
  "turn_detection": {"type": "azure_semantic_vad_multilingual",
                     "remove_filler_words": true, "silence_duration_ms": 500},
  "input_audio_noise_reduction": {"type": "azure_deep_noise_suppression_headset"},
  "input_audio_echo_cancellation": {"type": "server_echo_cancellation"},
  "input_audio_transcription": {"model": "azure-speech", "language": "en",
    "phrase_list": ["Póliza Plus"],
    "custom_speech": {"es-ES": "<model-id>"}},
  "voice": {"name": "es-ES-ElviraNeural", "type": "azure-standard"}
}}`)+
        T(["Necesidad","Solución","Advertencia"],[
          ["Términos que cambian a menudo","<code>phrase_list</code>","No admite <code>whisper-1</code> ni los modelos <code>gpt-4o-*-transcribe</code>"],
          ["Jerga o acústica estable","Custom speech","Solo con <code>azure-speech</code>; el modelo debe estar en el mismo recurso"],
          ["Pronunciación de salida","<code>custom_lexicon_url</code>","Vale para voces estándar y custom"],
          ["Voz de marca","Custom voice","Acceso limitado"]
        ])},
      {t:"Ciclo de custom speech",html:
        '<p>Primero se mide: se compara la transcripción del modelo base con una humana y se obtiene el <b>WER</b>. Si es alto, se crea el proyecto, se suben datos de prueba, se entrena con texto o con audio y transcripciones, se evalúa y se despliega. El texto mejora el vocabulario; el audio con referencias mejora las condiciones acústicas. Entrenar con audio exige una región con hardware dedicado.</p>'+
        '<p>Salvo en batch transcription, se requiere un endpoint personalizado, que tiene costo de alojamiento. Si el modelo solo se usa en batch, no hace falta. El modelo desplegado permanece fijo hasta su actualización y tiene vida limitada. Varios modelos son recomendables cuando cada área del dominio tiene vocabulario distinto. Un modelo personalizado también sirve en speech translation.</p>'},
      {t:"Razonamiento desde audio y traducción de voz",html:
        '<p><b>Audio como entrada del modelo.</b> <code>gpt-audio</code> admite partes <code>input_audio</code> en Chat Completions, con <code>modalities</code> de texto y audio, y archivos de hasta 20 MB. Razona sobre el audio sin una transcripción previa, pero no admite structured outputs. Si se necesita un esquema estricto, se añade un segundo paso con un modelo compatible.</p>'+
        C(`{"type": "input_audio", "input_audio": {"data": audio_b64, "format": "wav"}}`)+
        T(["Escenario","Opción"],[
          ["Audio en vivo con idioma conocido","<code>TranslationRecognizer</code>"],
          ["Conversación con idiomas que cambian","Live Interpreter, endpoint v2"],
          ["Archivo grabado","LLM Speech con <code>task: translate</code> y <code>targetLanguage</code>"],
          ["Grabaciones en volumen","Batch transcription y traducción de texto"]
        ])+
        '<p><code>add_target_language</code> usa códigos de idioma como <code>fr</code>, y no locales. El evento <code>synthesizing</code> solo funciona con un destino, por lo que varios destinos requieren <code>SpeechSynthesizer</code>. El servicio incluye dos idiomas; los siguientes requieren un recurso multiservicio y tienen cargo aparte. Con traducción multilingüe no hay resultados intermedios. LLM Speech es el modo mejorado del endpoint de fast transcription, para audio grabado; con <code>translate</code> no hay diarización.</p>'}
    ],
    preguntas:[
      {d:4,tipo:"unica",esc:"City Power crea una línea telefónica. Necesita llamadas entrantes por Twilio sin desarrollar la integración, modelo speech-to-speech, y grabaciones y transcripciones para auditoría, con trazas de la detección de turnos. Tiene un agente de texto en producción, y acepta funciones en preview.",
       q:"¿Qué enfoque cumple los requisitos?",
       ops:["Crear un agente de Foundry con kind: voice y activar store","Cambiar el modo de interacción del agente de texto actual a voz","Conectar Voice Live al agente de texto existente mediante agent_id y project_id","Orquestar STT, modelo y TTS en la aplicación con el Speech SDK"],ok:[0],
       exp:"El agente de voz admite modelos speech-to-speech, telefonía integrada, conversaciones guardadas con store y trazas del pipeline de voz. Un agente de texto no se convierte en agente de voz. Voice Live con agente de texto usa modelos de texto y requiere integrar la telefonía. La orquestación propia también obliga a desarrollar esa integración.",fuente:F.voz},
      {d:4,tipo:"completar",esc:"Una sesión de Voice Live atiende en inglés y español a operarios con auriculares en un almacén ruidoso. Debe preservarse la voz cercana, evitar interrupciones por muletillas y usar un modelo de custom speech para español; el inglés usa el modelo base.",
       q:"Complete el mensaje session.update.",
       codigo:`{"type": "session.update", "session": {
  "turn_detection": {"type": "{{0}}", "remove_filler_words": true},
  "input_audio_noise_reduction": {"type": "{{1}}"},
  "input_audio_transcription": {"model": "{{2}}", "language": "en",
    "{{3}}": {"es-ES": "<model-id>"}}
}}`,
       huecos:[
         {ops:["azure_semantic_vad_multilingual","server_vad","semantic_vad"],ok:0},
         {ops:["azure_deep_noise_suppression_headset","near_field","server_echo_cancellation"],ok:0},
         {ops:["azure-speech","gpt-4o-transcribe","whisper-1"],ok:0},
         {ops:["custom_speech","phrase_list","custom_lexicon_url"],ok:0}
       ],
       exp:"azure_semantic_vad_multilingual cubre ambos idiomas y admite la eliminación de muletillas, que no está disponible en server_vad ni en semantic_vad. El modo headset preserva la voz cercana frente al ruido y a otras voces. Custom speech solo funciona con azure-speech y se declara en custom_speech, por locale.",fuente:F.vozhow},
      {d:4,tipo:"orden",esc:"Una clínica obtiene mala precisión con nombres de fármacos en dictados en tiempo real y quiere justificar la inversión con una métrica.",
       q:"Ordene los pasos de custom speech.",
       pasos:["Crear un proyecto y elegir el modelo base","Subir datos de prueba con transcripciones humanas","Entrenar el modelo con texto y audio del dominio","Comparar el WER con el del modelo base","Desplegar el modelo en un endpoint personalizado"],
       sobran:["Omitir el endpoint, ya que solo es necesario en batch transcription"],
       exp:"La secuencia es proyecto, datos, entrenamiento, evaluación con WER y despliegue. En tiempo real el endpoint es obligatorio; solo batch transcription puede prescindir de él.",fuente:F.cspeech},
      {d:4,tipo:"sino",esc:"Una aplicación de conferencias traduce audio del inglés con Speech SDK. Se proponen varios cambios.",
       q:"Indique si cada afirmación es correcta.",
       afirm:[
         {t:"add_target_language(\"fr-FR\") es la forma correcta de indicar francés como destino.",ok:false},
         {t:"Con dos idiomas de destino, voice_name y el evento synthesizing entregan audio en ambos.",ok:false},
         {t:"Live Interpreter puede atender a oradores que cambian de idioma sin reiniciar la sesión.",ok:true},
         {t:"Un modelo de custom speech puede emplearse en speech translation.",ok:true}
       ],
       exp:"Los destinos usan códigos de idioma, no locales. La síntesis por evento solo admite un destino; para varios se usa SpeechSynthesizer. Live Interpreter identifica el idioma de forma continua, con endpoint v2 y rango abierto. Custom speech se aplica a tiempo real, speech translation y batch.",fuente:F.strad},
      {d:4,tipo:"unica",esc:"Proseware recibe mensajes de voz de hasta 15 MB. La urgencia debe valorarse por cómo habla el cliente, no solo por sus palabras, y el sistema de tickets exige JSON que cumpla un esquema estricto.",
       q:"¿Qué diseño cumple ambos requisitos?",
       ops:["Analizar el audio con gpt-audio y convertir su salida con un modelo que admita structured outputs","Llamar a gpt-audio con input_audio y response_format strict en una sola solicitud","Transcribir con batch transcription y enviar solo el texto a un modelo con structured outputs","Aplicar sentiment analysis de Azure Language a la transcripción y mapear el resultado al esquema"],ok:[0],
       exp:"gpt-audio razona sobre el audio y acepta el tamaño indicado, pero no admite structured outputs, de ahí el segundo paso. La llamada única no está soportada. La transcripción, por sí sola, pierde cómo se dijo el mensaje, lo mismo que sentiment analysis, que además evalúa solo texto.",fuente:F.schema}
    ]
  };

  /* ---------- Caso de estudio ---------- */
  CASOS.push({
    id:"caso-m5",modulo:5,t:"Wide World Importers: catálogo, reseñas y voz",
    texto:'<h4>Contexto</h4><p>Wide World Importers vende artículos para el hogar en España, México y Estados Unidos. Moderniza su contenido y su atención al cliente sobre Microsoft Foundry, con un proyecto en una región admitida y recursos sujetos a revisión de seguridad.</p>'+
      '<h4>Situación actual</h4><ul><li>Los clientes suben reseñas con texto y hasta 10 fotos a una cuenta de Storage accesible solo por private endpoint.</li><li>Los socios entregan anuncios de video de hasta 30 minutos y 800 MB en Blob Storage.</li><li>Existe una línea de voz en pruebas con Voice Live, usada en tiendas ruidosas.</li></ul>'+
      '<h4>Requisitos técnicos</h4><ol><li><b>RT1.</b> Cada anuncio debe recibir una decisión global de cumplimiento de marca, con independencia del momento en que aparezca el problema.</li><li><b>RT2.</b> El texto incrustado en las fotos de reseñas no debe alcanzar al modelo sin analizarse.</li><li><b>RT3.</b> Las reseñas deben convertirse en JSON con esquema estricto, incluidos tema, tono y aspectos valorados. Es un proyecto nuevo.</li><li><b>RT4.</b> Las respuestas al cliente se traducen con un LLM y un glosario de unos 3000 pares que cambia cada semana.</li><li><b>RT5.</b> La voz debe reconocer nombres de colecciones que cambian a diario y el vocabulario técnico de tienda, ya estable.</li></ol>'+
      '<h4>Requisitos de negocio</h4><ul><li>Todo resultado marcado por controles de seguridad se envía a revisión humana.</li><li>Se prefieren funciones GA cuando existan.</li><li>No debe abrirse la cuenta de Storage a Internet.</li></ul>',
    preguntas:[
      {d:3,tipo:"unica",esc:"Considere RT1 y el tamaño de los anuncios.",
       q:"¿Qué configuración de Content Understanding debe usarse?",
       ops:["Analizador sobre prebuilt-video con enableSegment=false, campo classify con enum y análisis por URL","Analizador sobre prebuilt-video con enableSegment=true, campo classify con enum y analyzeBinary","Analizador sobre prebuilt-image con campo generate, aplicado a un fotograma por minuto","Analizador sobre prebuilt-document con config.workflow=agentic y campo extract"],ok:[0],
       exp:"Con enableSegment=false todo el video es un único segmento, el enfoque indicado para comprobaciones de seguridad de marca en cualquier parte del anuncio. 800 MB superan los 200 MB de analyzeBinary, de modo que se usa analyze por URL. Muestrear por minuto perdería contenido, y agentic mode solo opera con documentos.",fuente:F.cuvideo},
      {d:3,tipo:"sino",esc:"Considere la situación actual de las fotos, RT2 y los requisitos de negocio.",
       q:"Indique si cada afirmación es correcta.",
       afirm:[
         {t:"Las fotos pueden enviarse al modelo como data URL sin abrir la cuenta de Storage.",ok:true},
         {t:"Una reseña con sus 10 fotos puede enviarse en una sola solicitud.",ok:true},
         {t:"Prompt Shields protegerá las fotos sin pasos adicionales, porque analiza los píxeles.",ok:false},
         {t:"Debe habilitarse la detección de ataques en documentos, ya que está desactivada por defecto.",ok:true}
       ],
       exp:"Los data URL evitan que la imagen deba descargarse desde la cuenta privada. El límite es de 10 imágenes por solicitud. Prompt Shields analiza texto, por lo que se necesita OCR previo. La detección en documentos debe activarse al configurar el guardrail.",fuente:F.shields},
      {d:3,tipo:"unica",esc:"Un anuncio devuelve status=Succeeded, pero el campo de cumplimiento aparece vacío. result.warnings contiene HarmfulContentFiltered.",
       q:"¿Qué debe hacer la aplicación?",
       ops:["Enviar el anuncio a revisión humana, porque el campo fue suprimido por un guardrail","Registrar el anuncio como apto, porque la operación terminó con éxito","Registrar que el anuncio no contiene el dato, porque el campo está vacío","Repetir el análisis hasta que el campo tenga valor"],ok:[0],
       exp:"HarmfulContentFiltered indica supresión de campos, y Succeeded no garantiza que todos tengan valor. Un campo vacío no prueba la ausencia del dato. Repetir no aborda la causa, y el requisito de negocio exige revisión humana.",fuente:F.cuguard},
      {d:4,tipo:"unica",esc:"Considere RT3.",
       q:"¿Qué solución debe implementarse?",
       ops:["Llamada directa a un modelo con la API Responses y text.format de tipo json_schema con strict=true","Sentiment analysis y opinion mining de Azure Language, con un adaptador a JSON","Agente de Foundry Agent Service con salida en structured outputs","Llamada a un modelo con JSON mode y un ejemplo del formato en el prompt"],ok:[0],
       exp:"Structured outputs con strict garantiza el esquema y el prompt cubre el tono. Sentiment es legacy, se retira el 31 de marzo de 2029 y los proyectos nuevos deben ir a modelos de Foundry. Structured outputs no se admite en Foundry Agent Service. JSON mode no asegura el cumplimiento del esquema.",fuente:F.schema},
      {d:4,tipo:"unica",esc:"Considere RT4.",
       q:"¿Qué configuración de Translator debe usarse?",
       ops:["deploymentName del LLM con adaptiveDatasetId de un conjunto adaptativo","deploymentName del LLM con referenceTextPairs que contenga el glosario completo","deploymentName con el ID de categoría de un modelo de Custom Translator","Valor general en deploymentName con un diccionario dinámico de v3.0"],ok:[0],
       exp:"El conjunto adaptativo admite hasta 10 000 pares, se actualiza en minutos y orienta al LLM. referenceTextPairs admite hasta cinco pares. Custom Translator exige reentrenamiento y usa NMT. El valor general también usa NMT, lo que incumple el requisito de usar un LLM.",fuente:F.adapt},
      {d:4,tipo:"multiple",esc:"Considere RT5 y las tiendas ruidosas. La sesión usa transcripción azure-speech y el recurso actual de Foundry.",
       q:"¿Qué acciones se deben realizar?",
       ops:["Actualizar las colecciones en phrase_list de la configuración de sesión","Usar en custom_speech un modelo disponible en el mismo recurso de Foundry","Cambiar la transcripción a gpt-4o-transcribe para conservar phrase_list","Referenciar un modelo de custom speech de otro recurso, sin copiarlo","Crear un modelo de custom speech nuevo cada día para las colecciones"],ok:[0,1],
       exp:"phrase_list es una personalización ligera, adecuada para términos que cambian a diario. Custom speech cubre el vocabulario estable y debe estar en el mismo recurso, por lo que un modelo externo debe copiarse antes. phrase_list no admite gpt-4o-transcribe, y entrenar a diario no es proporcionado.",fuente:F.vozcustom}
    ]
  });
})();
