/* Frases resaltadas por lección: [color, frase exacta]. */
var SUBRAYADO={
"1-1": [
[
"dato",
"bajo un solo recurso de Azure"
],
[
"clave",
"es la frontera de seguridad, red y administración"
],
[
"clave",
"organiza el trabajo de un equipo o caso de uso"
],
[
"dato",
"Responses API: conversations, responses"
],
[
"clave",
"un agente no accede a archivos, conversaciones ni índices de otro proyecto"
],
[
"dato",
"heredan del padre la seguridad de red, los despliegues y las herramientas de Azure integradas"
],
[
"trampa",
"No se puede cambiar después de crear el recurso"
],
[
"dato",
"Requiere rol Owner e identidad administrada habilitada."
],
[
"decision",
"Agente con instrucciones, modelo y tools, sin runtime"
],
[
"dato",
"Workflows (preview) se retira el 1 de diciembre de 2026"
],
[
"decision",
"Se crea un proyecto por equipo para separar agentes y evaluaciones."
],
[
"trampa",
"Crear un hub para un proyecto nuevo."
],
[
"trampa",
"Asumir que un proyecto es una frontera de red."
]
],
"1-2": [
[
"clave",
"La primera define la fila; la segunda, la columna."
],
[
"decision",
"recibe modelos primero, tiene el menor precio y la mayor cobertura"
],
[
"decision",
"Clasificar o extraer con baja latencia y volumen alto"
],
[
"dato",
"Los modelos vendidos por Azure tienen soporte de Microsoft y se facturan con medidores de Azure"
],
[
"trampa",
"fine-tuning se reserva para cuando prompt y recuperación no alcanzan"
],
[
"dato",
"Balanced (default)"
],
[
"dato",
"Los tipos de despliegue solo aplican a Serverless API."
],
[
"dato",
"Crecer más de 50 % en menos de 15 minutos degrada a Standard"
],
[
"dato",
"50 % de descuento"
],
[
"trampa",
"Cada asset ID coincide como prefijo: sin barra final,"
],
[
"decision",
"UE, volumen constante, latencia estable"
],
[
"trampa",
"solo evalúa modelos fine-tuned: dura 24 horas y no tiene SLA."
],
[
"trampa",
"Batch tiene objetivo de 24 horas, pero no un SLA en tiempo real."
]
],
"1-3": [
[
"clave",
"Primero se identifica quién actúa y qué necesita hacer."
],
[
"dato",
"Cognitive Services Usages Reader"
],
[
"decision",
"una app debe usar managed identity"
],
[
"clave",
"Owner y Contributor no construyen en un proyecto"
],
[
"trampa",
"un 403 al crear un agente no se corrige con más permisos de gestión."
],
[
"dato",
"Fine-tuning exige ambos planos"
],
[
"trampa",
"un grupo de recursos no autoriza la Usages API"
],
[
"dato",
"Agents, Evaluations y Toolbox no admiten API key."
],
[
"dato",
"puede tardar desde minutos hasta horas"
],
[
"dato",
"Al migrarlos cambia la identidad y las asignaciones de rol existentes no se transfieren."
],
[
"trampa",
"Con una API key no aplica RBAC: la clave concede acceso total."
],
[
"trampa",
"Foundry Account Owner administra el recurso, pero no construye en proyectos."
]
],
"1-4": [
[
"clave",
"¿quién guarda los datos de los agentes?"
],
[
"dato",
"Los prompt agents admiten red privada, y los hosted agents admiten BYO VNet."
],
[
"clave",
"Quitar un private endpoint no vuelve público el recurso"
],
[
"dato",
"168.63.129.16"
],
[
"trampa",
"Basic no admite customer-managed keys ni aislamiento de salida con BYO VNet"
],
[
"dato",
"Cosmos DB con al menos 3000 RU/s"
],
[
"trampa",
"Los roles de quien despliega no sustituyen a los de ejecución."
],
[
"dato",
"mínimo /27, /24 recomendado en producción"
],
[
"trampa",
"La salida no se añade a un recurso existente: se redespliega."
],
[
"dato",
"Logic Apps, Browser Automation, Computer Use, Image Generation, Fabric Data Agent"
],
[
"decision",
"Un private endpoint por sí solo no resolvería el requisito"
],
[
"trampa",
"Los memory stores no admiten integración con VNet."
]
],
"1-5": [
[
"clave",
"Cada despliegue recibe una parte"
],
[
"decision",
"Rebalancear TPM o usar PTU"
],
[
"dato",
"Eliminar un recurso con REST sin borrar sus despliegues retiene la cuota 48 horas"
],
[
"dato",
"128 herramientas por agente o 1000 versiones"
],
[
"clave",
"Un valor alto reduce la concurrencia"
],
[
"decision",
"Requiere un despliegue de pago por uso con el mismo modelo y versión."
],
[
"dato",
"Prevalece si ambas existen"
],
[
"trampa",
"La hora de PTU se cobra exista o no tráfico, y el despliegue no se pausa."
],
[
"dato",
"Una reserva aplica por tipo, región (salvo Global) y alcance, nunca por modelo."
],
[
"trampa",
"Azure OpenAI no ofrece un límite duro de gasto."
],
[
"trampa",
"Reintentar de inmediato: las solicitudes fallidas también cuentan."
],
[
"decision",
"repartir el proceso durante el minuto y respetar"
]
],
"1-6": [
[
"clave",
"qué se quiere hacer"
],
[
"clave",
"Administrar pasa por Azure Resource Manager"
],
[
"dato",
"https://ai.azure.com/.default"
],
[
"decision",
"Plano de control: Azure Resource Manager"
],
[
"dato",
"salvo Azure AI Search, que es un servicio aparte con su propio endpoint"
],
[
"trampa",
"El endpoint de proyecto no enruta embeddings"
],
[
"trampa",
"Agentes, evaluaciones y Toolbox no admiten API key; requieren Entra ID."
],
[
"dato",
"la ruta de despliegue clásica sí."
],
[
"dato",
"un recurso Foundry ofrece todos."
],
[
"trampa",
"Entra ID requiere subdominio personalizado: los endpoints regionales no lo admiten."
]
],
"2-1": [
[
"clave",
"un cliente de proyecto y un cliente OpenAI sobre el mismo endpoint"
],
[
"decision",
"La decisión depende de las capacidades requeridas, no del lenguaje."
],
[
"dato",
"un recurso Azure OpenAI solo ofrece"
],
[
"decision",
"Agentes, evaluaciones, conexiones y tools de la plataforma"
],
[
"decision",
"Máxima compatibilidad, menor latencia y embeddings"
],
[
"dato",
"Los tokens de razonamiento se facturan como salida"
],
[
"decision",
"Sin conexión, sin suscripción de Azure y un solo usuario"
],
[
"dato",
"Batch reduce 50 % el costo de trabajos asíncronos"
],
[
"trampa",
"un error a mitad del flujo no cambia el HTTP 200"
],
[
"trampa",
"indica la API clásica"
],
[
"trampa",
"2.x no es compatible con 1.x"
],
[
"trampa",
"recibe el nombre del despliegue"
]
],
"2-2": [
[
"clave",
"La calidad mejora primero con instrucciones claras, contexto y ejemplos."
],
[
"trampa",
"Pedir JSON en el prompt no garantiza el esquema."
],
[
"dato",
"Se ajusta uno."
],
[
"trampa",
"no se recomienda para modelos de razonamiento como"
],
[
"dato",
"El límite de salida incluye los tokens de razonamiento."
],
[
"dato",
"Microsoft sugiere reservar al menos 25 000 tokens al explorar una carga nueva."
],
[
"dato",
"Límites: 100 propiedades y cinco niveles de anidación."
],
[
"trampa",
"La raíz no puede ser"
],
[
"dato",
"Balanced (predeterminado)"
],
[
"clave",
"limita los modelos permitidos y también define el conjunto de failover, por lo que conviene incluir al menos dos."
],
[
"trampa",
"Creer que"
],
[
"trampa",
"Crear bucles de autocrítica sin límite."
]
],
"2-3": [
[
"clave",
"El tipo de agente indica cuánto construye el equipo y cuánto administra Foundry."
],
[
"decision",
"¿Código en LangGraph o Agent Framework?"
],
[
"decision",
"¿Voz sin hospedar la orquestación?"
],
[
"dato",
"Contenedor gestionado por Foundry"
],
[
"clave",
"complementarios"
],
[
"trampa",
"no crea otro tipo de agente: sigue siendo un prompt agent, exige"
],
[
"dato",
"0.5 vCPU/1 GiB, 1 vCPU/2 GiB y 2 vCPU/4 GiB."
],
[
"dato",
"de 2 a 240 minutos, 15 de forma predeterminada."
],
[
"trampa",
"Los secretos no se colocan en imágenes ni en variables de entorno."
],
[
"dato",
"Motor de reglas existente en LangGraph"
],
[
"trampa",
"Si una función común resuelve la tarea, no se necesita un agente."
],
[
"trampa",
"El patrón efímero no admite el agent optimizer."
]
],
"2-4": [
[
"decision",
"Foundry llama a la API"
],
[
"dato",
"100 s sin streaming; endpoint privado solo con Standard Setup y red privada"
],
[
"dato",
"Ejecuta el cliente; una ejecución expira a los 10 minutos"
],
[
"dato",
"Spec 3.0 o 3.1;"
],
[
"dato",
"por defecto"
],
[
"trampa",
"Content Understanding"
],
[
"clave",
"El límite de 10 minutos se aplica al tiempo total"
],
[
"trampa",
"Los argumentos y resultados se tratan como entrada no confiable."
],
[
"clave",
"da el control más determinista:"
],
[
"decision",
"oculta las definiciones y reduce tokens y errores de selección"
],
[
"dato",
"(por defecto),"
],
[
"trampa",
"la respuesta solo autoriza si coincide con una solicitud pendiente de la misma"
],
[
"trampa",
"permite todas las tools del servidor."
],
[
"trampa",
"Function calling no ejecuta código: la aplicación debe hacerlo."
]
],
"2-5": [
[
"clave",
"Lo aprendido del usuario entre sesiones."
],
[
"clave",
"Conocimiento corporativo con permisos."
],
[
"dato",
"Memory extrae, consolida y recupera tres tipos de información:"
],
[
"decision",
"Encadenar turnos sin crear una conversación"
],
[
"dato",
"la Responses API retiene los datos 30 días de forma predeterminada."
],
[
"dato",
"300 segundos es el valor predeterminado."
],
[
"dato",
"100 scopes por store, 10 000 memorias por scope y sin integración con VNet."
],
[
"decision",
"ACL y etiquetas Purview en consulta"
],
[
"dato",
"512 MB y 5 M de tokens por archivo; 10 000 archivos"
],
[
"trampa",
"Sin ese token, las fuentes con permisos devuelven resultados sin filtrar."
],
[
"dato",
"Search Index Data Reader"
],
[
"trampa",
"Usar memory para documentos corporativos."
],
[
"trampa",
"también puede sufrir inyecciones."
]
],
"2-6": [
[
"dato",
"Los workflows visuales de Foundry se retiran el 1 de diciembre de 2026."
],
[
"decision",
"Cada paso depende del anterior"
],
[
"decision",
"Análisis independientes y combinación"
],
[
"decision",
"Un especialista asume todo el caso"
],
[
"decision",
"Revisión iterativa en varias rondas"
],
[
"decision",
"Solución desconocida de antemano"
],
[
"trampa",
"Handoff no equivale a"
],
[
"clave",
"el receptor toma el control y la propiedad de la tarea."
],
[
"clave",
"el agente principal conserva la tarea, el control vuelve a él"
],
[
"decision",
"Agent Framework recomienda escribir una función si esta resuelve la tarea."
],
[
"dato",
"50 turnos por defecto, con"
],
[
"decision",
"Azure Logic Apps"
],
[
"dato",
"Foundry Agent Consumer"
],
[
"trampa",
"Connected Agents no existe en el servicio nuevo."
],
[
"trampa",
"El examen evalúa el patrón, aunque cambie la herramienta."
]
],
"3-1": [
[
"clave",
"Un guardrail es una colección de controles."
],
[
"dato",
"El nombre del nivel indica cuán estricto es, no la severidad que bloquea."
],
[
"clave",
"Un control no aplicable no produce error: simplemente no surte efecto."
],
[
"dato",
"y solo cubren agentes de Foundry Agent Service"
],
[
"dato",
"se retira el 30 de abril de 2027"
],
[
"trampa",
"Para una tool fuera de la lista, como un servidor MCP, el control no tiene efecto"
],
[
"dato",
"Cada punto de intervención añade alrededor de 50 a 100 ms."
],
[
"dato",
"Inactivo: debe habilitarse"
],
[
"trampa",
"Prompt Shields no juzga si un contenido es dañino, veraz o está fundamentado."
],
[
"dato",
"sobrescribe el guardrail en una sola llamada"
],
[
"trampa",
"Los guardrails predeterminados de Microsoft no se editan."
],
[
"decision",
"las lecturas de bajo riesgo pueden ejecutarse sin aprobación, las escrituras y transacciones deben exigirla"
],
[
"trampa",
"una instrucción en el prompt no basta."
],
[
"trampa",
"El guardrail del agente reemplaza por completo al del modelo."
]
],
"3-2": [
[
"decision",
"Afirma algo ausente del contexto"
],
[
"dato",
"Groundedness devuelve una puntuación de 1 a 5 con un modelo."
],
[
"dato",
"Groundedness Pro devuelve aprobado o fallido y no requiere despliegue."
],
[
"clave",
"Esa estructura hace comparables las ejecuciones."
],
[
"dato",
"Cada fila admite hasta 2 MB y cada lote hasta 100.000 filas."
],
[
"trampa",
"en calidad, se aprueba con una puntuación igual o superior al umbral. En contenido dañino, se aprueba con una severidad igual o inferior."
],
[
"clave",
"Groundedness mide precisión, es decir, no fabricar. Response Completeness mide recall, es decir, no omitir."
],
[
"trampa",
"debe evitarse Tool Call Accuracy, Tool Input Accuracy, Tool Output Utilization, Tool Call Success y Groundedness"
],
[
"dato",
"umbral predeterminado 0,5"
],
[
"trampa",
"un ASR bajo es lo deseable."
],
[
"dato",
"Sin red, 256 KB, 2 minutos por llamada"
],
[
"trampa",
"Confundir Groundedness con Relevance."
]
],
"3-3": [
[
"clave",
"una evaluación actúa como puerta de calidad."
],
[
"dato",
"Un valor de Provisioned Utilization igual o superior a 100% produce errores 429."
],
[
"dato",
"la latencia superior a 10 segundos sugiere throttling"
],
[
"dato",
"El tracing es GA para prompt y hosted agents; para workflows y agentes externos sigue en preview."
],
[
"dato",
"Para consultar telemetría se necesita Log Analytics Reader."
],
[
"dato",
"Desde el 30 de septiembre de 2026"
],
[
"dato",
"Privileged Monitoring Data Reader"
],
[
"dato",
"cuyo valor predeterminado es 100"
],
[
"trampa",
"Su resultado no se almacena: debe descargarse en CSV antes de salir de la página."
],
[
"dato",
"microsoft/ai-agent-evals@v3-beta"
],
[
"dato",
"cada versión es inmutable y se referencia como"
],
[
"trampa",
"los permisos del proyecto no se transfieren"
],
[
"trampa",
"Las métricas de tokens no sustituyen a la revisión de los errores 429."
],
[
"decision",
"Continuous evaluation"
]
],
"4-1": [
[
"clave",
"RAG separa dos momentos: preparar el contenido y responder preguntas."
],
[
"decision",
"La documentación recomienda empezar por agentic retrieval en implementaciones nuevas"
],
[
"decision",
"Solo se admiten funciones GA, ya existe orquestación o se requiere control fino"
],
[
"dato",
"limitada a retrieval mínimo y extractivo"
],
[
"clave",
"En RAG, el documento de búsqueda es el chunk."
],
[
"dato",
"Indexer en preview"
],
[
"dato",
"El push acepta hasta 1000 documentos o unos 16 MB por lote."
],
[
"trampa",
"deja en null los campos omitidos;"
],
[
"trampa",
"toda actualización parcial debe incluir el vector, aunque no cambie; de lo contrario se pierde."
],
[
"decision",
"Usar hybrid y exigir respuesta «no lo sé»"
],
[
"trampa",
"Si cambia el modelo de embeddings, se debe vectorizar de nuevo."
]
],
"4-2": [
[
"dato",
"BM25; códigos y nombres"
],
[
"dato",
"Ambas con RRF"
],
[
"dato",
"es una constante cercana a 60"
],
[
"dato",
"0.333 a 1.00"
],
[
"dato",
"0.00 a 4.00"
],
[
"trampa",
"Por eso un umbral fijo no sirve en hybrid: los rangos de RRF son pequeños y volátiles."
],
[
"dato",
"valor predeterminado 1.0"
],
[
"dato",
"Reordena solo los 50 primeros resultados; no busca de nuevo."
],
[
"dato",
"Recibe hasta 2000 tokens por documento: 128 para título, 128 para palabras clave y el resto para contenido."
],
[
"trampa",
"junto con semantic devuelve HTTP 400."
],
[
"trampa",
"Alto; puede devolver cero"
],
[
"trampa",
"anula el orden por relevancia."
]
],
"4-3": [
[
"clave",
"Toda salida de una skill vive en un árbol en memoria y no llega al índice sin un mapeo."
],
[
"clave",
"fija cuántas veces corre la skill y dónde cuelga su salida."
],
[
"dato",
"Sin 20 documentos gratis; recomendada para skillsets nuevos"
],
[
"dato",
"Costo del modelo; tiempo límite fijo de 30 s"
],
[
"dato",
"30 s por defecto; de 1 a 230 s; formato"
],
[
"dato",
"5 por defecto; de 1 a 10"
],
[
"dato",
"Hay dos reintentos ante 429, 502 y 503."
],
[
"trampa",
"Las entradas provienen de documentos y deben tratarse como no confiables."
],
[
"trampa",
"indica que el indexer está disponible, no que esté ejecutándose"
],
[
"trampa",
"Confundir indexer (orquesta) con skillset (enriquece)."
]
],
"4-4": [
[
"decision",
"Planifica con LLM; valor predeterminado"
],
[
"decision",
"Omite la planificación"
],
[
"clave",
"usa este motor sobre knowledge bases compartidas, con permisos."
],
[
"dato",
"Requiere una knowledge base y al menos una knowledge source."
],
[
"trampa",
"En GA, una pregunta de seguimiento es una nueva solicitud con un nuevo intent"
],
[
"dato",
"La knowledge source debe existir antes que la knowledge base, y ambas en el mismo search service."
],
[
"dato",
"de hasta 4000 caracteres ayuda al LLM a seleccionar fuentes y no requiere reconstruir el índice."
],
[
"dato",
"Hasta 50 documentos para semantic ranking"
],
[
"clave",
"El costo es doble: tokens de retrieval en AI Search y tokens del LLM en Azure OpenAI."
],
[
"trampa",
"Sin él, las fuentes con permisos devuelven resultados sin filtrar."
],
[
"trampa",
"Agentic retrieval añade latencia: no es necesario para preguntas simples."
]
],
"4-5": [
[
"dato",
"prebuilt-documentSearch"
],
[
"dato",
"prebuilt-invoice"
],
[
"clave",
"sirve para RAG y razonamiento."
],
[
"clave",
"sirve para automatización."
],
[
"decision",
"Modelo prebuilt de Document Intelligence"
],
[
"decision",
"Contenedores de Document Intelligence"
],
[
"clave",
"actúa como un miniprompt."
],
[
"dato",
"lleva nombres de modelo, no de deployment."
],
[
"trampa",
"sin una categoría «other» el contenido se fuerza a una de las categorías definidas."
],
[
"dato",
"El valor de confianza va de 0 a 1 y permite enviar a revisión humana lo que quede bajo el umbral."
],
[
"trampa",
"Extract solo funciona con documentos."
],
[
"trampa",
"Pro mode se retiró de la API; su sucesor es agentic mode en preview."
]
],
"4-6": [
[
"clave",
"Las tres se toman al crear el índice y cambiarlas después obliga a reindexar."
],
[
"dato",
"~512 tokens, 25 % de solape"
],
[
"dato",
"1 a 3072"
],
[
"dato",
"es de 8191 tokens, unas 6000 palabras"
],
[
"dato",
"chunks de 512 tokens, unos 2000 caracteres, con 25 % de solape (128 tokens)"
],
[
"decision",
"Producción: rápido y escalable"
],
[
"decision",
"Corpus pequeño o se necesita recall exacto"
],
[
"dato",
"Debe ser la del modelo;"
],
[
"decision",
"Recomendada como primera opción; admite rescoring"
],
[
"dato",
"Disco, hasta 50 % por campo"
],
[
"dato",
"El valor predeterminado es 4."
],
[
"trampa",
"por debajo de 1000 cae la calidad."
],
[
"clave",
"Ambos deben usar el mismo modelo."
],
[
"trampa",
"La compresión y el recorte se definen en campos nuevos: no se agregan a un campo ya vectorizado."
]
],
"4-7": [
[
"clave",
"Un buen índice con un prompt débil sigue produciendo respuestas inventadas."
],
[
"decision",
"Classic RAG, solo GA o control fino de cada paso"
],
[
"decision",
"Un índice existente; citas"
],
[
"decision",
"Varias fuentes, permisos por usuario o preguntas compuestas"
],
[
"clave",
"Decir «no lo sé» con una frase fija"
],
[
"clave",
"Fuentes delimitadas y tratadas como datos"
],
[
"decision",
"Descarta fragmentos débiles; esta escala de 0 a 4 sí es comparable entre consultas"
],
[
"trampa",
"No sirve: los valores de RRF son pequeños y varían por consulta"
],
[
"trampa",
"debe convertirse en una consulta autónoma antes de buscar."
],
[
"dato",
"Un solo índice por tool; distingue mayúsculas"
],
[
"dato",
"Es un requisito distinto al de Foundry IQ, que lee con Search Index Data Reader."
],
[
"trampa",
"la API key no se admite"
],
[
"trampa",
"Más chunks no siempre es mejor: aumentan costo, latencia y el ruido que distrae al modelo."
],
[
"trampa",
"El texto recuperado es dato, no instrucción: se delimita y se revisa con Prompt Shields."
]
],
"4-8": [
[
"clave",
"el filtro se aplica en la"
],
[
"clave",
"un fallo de permisos no aparece como un error"
],
[
"decision",
"Identidad propia, índice push o requisito de solo GA"
],
[
"decision",
"ADLS Gen2 o Blob con ACL o roles existentes"
],
[
"dato",
"Sin ese encabezado no hay recorte por usuario."
],
[
"dato",
"responde en menos de un segundo aunque haya cientos de valores."
],
[
"decision",
"Conviene usar grupos, no usuarios: cambian menos y el filtro es más corto."
],
[
"dato",
"Funciona con cualquier versión de la API, con push o con indexer, y es GA."
],
[
"dato",
"y el token del usuario decide qué documentos vuelven."
],
[
"dato",
"Requiere la managed identity del sistema del search service, un solo tenant y autenticación RBAC"
],
[
"trampa",
"Evitar en producción"
],
[
"decision",
"Conexión con managed identity; la API key no se admite"
],
[
"decision",
"PII Detection skill con enmascaramiento al indexar"
],
[
"trampa",
"nunca de un parámetro que envíe el navegador."
],
[
"trampa",
"Un security filter es una comparación de cadenas: no autentica."
],
[
"trampa",
"pero no protege nada: el filtro debe ir en cada consulta."
]
],
"4-9": [
[
"clave",
"Optimizar RAG sin medir es adivinar."
],
[
"clave",
"¿se recuperó lo correcto?"
],
[
"clave",
"¿la respuesta lo usó bien?"
],
[
"dato",
"Document Retrieval no usa un juez LLM ni requiere deployment."
],
[
"dato",
"Compara los documentos recuperados con etiquetas humanas de relevancia, llamadas"
],
[
"decision",
"Completeness baja con Groundedness alto"
],
[
"decision",
"NDCG bajo con Fidelity aceptable"
],
[
"decision",
"Semantic ranker, configuración semántica, scoring profile"
],
[
"decision",
"Siglas y jerga: SOAT y Seguro Obligatorio de Accidentes de Tránsito"
],
[
"trampa",
"Las palancas de texto no mejoran una consulta solo vectorial, y las vectoriales no ayudan con códigos exactos."
],
[
"decision",
"El modelo no inventa, pero omite: el problema está antes, en la recuperación."
],
[
"decision",
"Se cambia una sola palanca"
],
[
"trampa",
"Endurecer el prompt no corrige una recuperación pobre: el modelo no puede citar lo que no recibió."
],
[
"trampa",
"Cambiar varias palancas a la vez impide saber cuál ayudó."
],
[
"trampa",
"Synonym maps solo afectan la parte de texto: no cambian la búsqueda vectorial."
]
],
"5-1": [
[
"clave",
"modifica imágenes y usa"
],
[
"dato",
"Requiere PNG"
],
[
"dato",
"Solo JPEG"
],
[
"decision",
"prioriza la precisión de edición,"
],
[
"dato",
"ya no funciona, y las fechas de la serie"
],
[
"dato",
"PNG (predeterminado) o JPEG; WEBP no se admite"
],
[
"trampa",
"Con"
],
[
"clave",
"La máscara acota el cambio: debe ser PNG, tener las mismas dimensiones que la imagen y marcar con alfa 0 los píxeles editables."
],
[
"dato",
"hasta 16 imágenes de entrada, PNG o JPG, de menos de 50 MB cada una"
],
[
"decision",
"Edición con máscara"
],
[
"trampa",
"No equivale a una marca de agua visible."
],
[
"trampa",
"La máscara marca con transparencia, no con negro."
],
[
"dato",
"se retiró el 4 de marzo de 2026."
]
],
"5-2": [
[
"dato",
"4, 8 o 12"
],
[
"dato",
"preview"
],
[
"clave",
"La generación es asíncrona, por lo que la aplicación no debe mantener una petición abierta"
],
[
"dato",
"Cognitive Services User"
],
[
"dato",
"La facturación es por segundo"
],
[
"trampa",
"Aviso de vigencia."
],
[
"decision",
"Remix es preferible cuando solo cambia un atributo, como la paleta de color o la iluminación."
],
[
"trampa",
"debe coincidir exactamente con"
],
[
"dato",
"Trabajos disponibles hasta 24 horas"
],
[
"trampa",
"Imágenes de entrada con rostros humanos se rechazan"
],
[
"trampa",
"No se generan personas reales ni figuras públicas"
],
[
"decision",
"con esa única instrucción, y conserva estructura y encuadre."
]
],
"5-3": [
[
"decision",
"Modelo multimodal con instrucciones"
],
[
"decision",
"Content Understanding"
],
[
"trampa",
"El contenido visual también es una entrada no confiable."
],
[
"dato",
"hasta 10 imágenes de hasta 20 MB"
],
[
"dato",
"Predeterminado; decide según el tamaño"
],
[
"trampa",
"los endpoints privados y las cuentas con firewall no sirven"
],
[
"dato",
"2025-11-01"
],
[
"dato",
"Una segmentación por analizador"
],
[
"dato",
"Cerca de 1 fotograma por segundo a 512x512"
],
[
"trampa",
"Prompt Shields analiza"
],
[
"clave",
"el texto incrustado se extrae con OCR y se envía en"
],
[
"trampa",
"Un campo vacío no prueba, por sí solo, la ausencia del dato."
],
[
"trampa",
"Asumir que una imagen es segura porque no contiene texto visible."
]
],
"5-4": [
[
"decision",
"Language: PII detection"
],
[
"decision",
"LLM con structured outputs"
],
[
"decision",
"Azure Translator"
],
[
"dato",
"se retiran de Azure Language el 31 de marzo de 2029"
],
[
"trampa",
"JSON mode garantiza JSON válido, no el cumplimiento de un esquema."
],
[
"dato",
"hasta 100 propiedades y cinco niveles de anidación"
],
[
"trampa",
"Estas validaciones deben quedar en la aplicación."
],
[
"dato",
"no es compatible con v3.0:"
],
[
"dato",
"Unos 10 000 pares"
],
[
"trampa",
"en lugar de recurrir al sistema general"
],
[
"clave",
"primero se redacta la PII, después se resume con instrucciones de dominio y, por último, se valida el esquema en la aplicación"
],
[
"trampa",
"Usar Custom NER cuando Prebuilt NER es suficiente."
],
[
"trampa",
"Language y Translator son Foundry Tools, no despliegues de modelos."
]
],
"5-5": [
[
"decision",
"Voice Live API"
],
[
"decision",
"Phrase list"
],
[
"decision",
"Custom speech"
],
[
"decision",
"Telefonía integrada, revisión de llamadas y configuración unificada"
],
[
"trampa",
"Un agente de texto no puede convertirse en agente de voz: se crea uno nuevo."
],
[
"dato",
"Foundry-Features: VoiceAgents=V1Preview"
],
[
"dato",
"Un recurso de Speech no admite integración con Agent Service ni BYOM."
],
[
"clave",
"se compara la transcripción del modelo base con una humana"
],
[
"trampa",
"Entrenar con audio exige una región con hardware dedicado."
],
[
"dato",
"archivos de hasta 20 MB"
],
[
"dato",
"El servicio incluye dos idiomas"
],
[
"trampa",
"Los guardrails no cubren modelos de transcripción de audio."
]
]
};
