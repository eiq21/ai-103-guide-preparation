/* Mapas visuales por lección: capas, niveles, etapas, decisiones y clasificaciones. */
function capas(items){
  return '<div class="capas">'+items.map(function(i,n){var p=i.split("|");
    return '<div class="capa'+(p[2]?" "+p[2]:"")+'"><span class="capn">'+(n+1)+'</span><b>'+p[0]+'</b><span>'+(p[1]||"")+'</span></div>'}).join("")+'</div>';
}
function etapas(items){
  return '<ol class="etapas">'+items.map(function(i){var p=i.split("|");
    return '<li class="'+(p[2]||"")+'"><b>'+p[0]+'</b>'+(p[1]?'<span>'+p[1]+'</span>':"")+'</li>'}).join("")+'</ol>';
}
function decision(items){
  return '<div class="dec">'+items.map(function(i){var p=i.split("|");
    return '<div class="decf"><span class="decq">'+p[0]+'</span><span class="decs"><b>Sí</b> '+p[1]+'</span>'+(p[2]?'<span class="decn"><b>No</b> '+p[2]+'</span>':'')+'</div>'}).join("")+'</div>';
}
function niveles(items){
  return '<div class="nivs">'+items.map(function(i,n){var p=i.split("|");
    return '<div style="--n:'+(n+1)+'"><b>'+p[0]+'</b>'+(p[1]||"")+'</div>'}).join("")+'</div>';
}
function clases(items){
  return '<div class="clases">'+items.map(function(g){var p=g.split("|");
    return '<div><b>'+p[0]+'</b><ul>'+p.slice(1).map(function(x){return '<li>'+x+'</li>'}).join("")+'</ul></div>'}).join("")+'</div>';
}
function urlp(partes){
  return '<div class="url">'+partes.map(function(x){var p=x.split("|");return '<span class="'+(p[1]||"")+'"><code>'+p[0].replace(/</g,"&lt;")+'</code>'+(p[2]?'<em>'+p[2]+'</em>':'')+'</span>'}).join("")+'</div>';
}

/* Lección nueva */
MODULOS[0].lecciones.push({t:"Endpoints de Foundry",min:20,
  obj:"Identificar qué endpoint corresponde a cada tarea y cómo autenticarse.",
  html:'<p>Un recurso de Foundry no tiene una sola dirección. Expone varios endpoints porque atiende necesidades distintas. La clave es preguntar <b>qué se quiere hacer</b>: usar un proyecto, llamar a un modelo con API OpenAI, usar una herramienta especializada o administrar el recurso.</p>',
  ejemplo:'<p>Contoso Seguros tiene cuatro necesidades:</p>'+tabla(["Necesidad","Endpoint"],[["Agente de siniestros con tools","Proyecto: <code>/api/projects/siniestros</code>"],["Embeddings para indexar pólizas","OpenAI: <code>/openai/v1</code>"],["Transcribir llamadas","Foundry Tools: Speech"],["Crear un despliegue desde Bicep","Plano de control: Azure Resource Manager"]])+'<p>Las cuatro pertenecen al mismo recurso, salvo Azure AI Search, que es un servicio aparte con su propio endpoint.</p>',
  tropiezos:["El endpoint de proyecto no enruta embeddings: se usa <code>/openai/v1</code>.","Agentes, evaluaciones y Toolbox no admiten API key; requieren Entra ID.","<code>/openai/v1</code> no lleva <code>api-version</code>; la ruta de despliegue clásica sí.","Un recurso Azure OpenAI solo ofrece <code>/openai/v1</code>; un recurso Foundry ofrece todos.","Entra ID requiere subdominio personalizado: los endpoints regionales no lo admiten."],
  ej:[],practica:"Abrir el proyecto en el portal, copiar sus endpoints e indicar para cada uno qué SDK lo usa.",
  docs:[["SDKs y endpoints de Foundry","azure/foundry/how-to/develop/sdk-overview"],["Endpoints de Foundry Models","azure/foundry/foundry-models/concepts/endpoints"],["Autenticación y autorización","azure/foundry/concepts/authentication-authorization-foundry"]]});
MODULOS[0].h="6 h";

EXTRA["1-6"]={secciones:[
 {t:"Dos planos: administrar o usar",html:'<p>Toda operación pertenece a un plano. Administrar pasa por Azure Resource Manager y usa <code>actions</code> de RBAC. Usar pasa por los endpoints del recurso y usa <code>dataActions</code>.</p>'+tabla(["Plano","Ejemplos","Herramientas"],[["Control","Crear recurso o proyecto, desplegar modelo, asignar roles","Portal, CLI, Bicep, Terraform"],["Datos","Inferencia, agentes, evaluaciones","SDK, REST, playground"]])},
 {t:"Autenticación por capacidad",html:tabla(["Capacidad","API key","Entra ID"],[["Inferencia básica","Sí","Sí"],["Agent Service","No","Sí"],["Evaluaciones","No","Sí"],["Toolbox","No","Sí"],["Content Understanding por lotes","Sí","Sí"]])+'<p>El token de Entra ID se solicita con el scope <code>https://ai.azure.com/.default</code>.</p>'},
 {t:"Código por endpoint",html:codigo('# 1. Proyecto: agentes y Responses\nproject = AIProjectClient(\n    endpoint="https://contoso.services.ai.azure.com/api/projects/siniestros",\n    credential=DefaultAzureCredential(),\n)\n\n# 2. OpenAI: embeddings y máxima compatibilidad\nclient = OpenAI(\n    base_url="https://contoso.openai.azure.com/openai/v1/",\n    api_key=token_provider,\n)')}
],preguntas:[
 {d:1,tipo:"unica",esc:"Contoso prepara una ingesta RAG desde una aplicación que ya usa AIProjectClient para sus agentes. Debe generar embeddings con text-embedding-3-large.",q:"¿Qué endpoint corresponde a la generación de embeddings?",ops:["https://contoso.openai.azure.com/openai/v1","https://contoso.services.ai.azure.com/api/projects/rag","https://contoso.cognitiveservices.azure.com/","https://management.azure.com/"],ok:[0],exp:"El endpoint de proyecto no enruta solicitudes de embeddings, por lo que se usa /openai/v1. Foundry Tools y Resource Manager no atienden esta inferencia.",fuente:"https://learn.microsoft.com/en-us/azure/foundry/how-to/develop/sdk-overview"},
 {d:1,tipo:"sino",esc:"Un equipo revisa los endpoints de un recurso de Foundry.",q:"Indique si cada afirmación es correcta.",afirm:[{t:"Una API key sirve para llamar a un agente de Foundry Agent Service.",ok:false},{t:"La ruta /openai/v1/ no requiere el parámetro api-version.",ok:true},{t:"Un recurso Azure OpenAI ofrece también el endpoint de proyecto.",ok:false},{t:"El parámetro model de /openai/v1 recibe el nombre del despliegue.",ok:true}],exp:"Agent Service requiere Entra ID. La ruta v1 usa versionado implícito y recibe el despliegue en model. Un recurso Azure OpenAI solo ofrece /openai/v1.",fuente:"https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/endpoints"},
 {d:1,tipo:"completar",esc:"Se debe consumir un despliegue con Entra ID, sin secretos, mediante la ruta v1.",q:"Complete el código.",codigo:'token_provider = get_bearer_token_provider(\n    DefaultAzureCredential(), "{{0}}"\n)\nclient = OpenAI(\n    base_url="https://contoso.openai.azure.com/{{1}}/",\n    api_key=token_provider,\n)',huecos:[{ops:["https://ai.azure.com/.default","https://management.azure.com/.default","https://search.azure.com/.default"],ok:0},{ops:["openai/v1","api/projects/siniestros","openai/deployments"],ok:0}],exp:"Foundry usa el scope https://ai.azure.com/.default. El cliente OpenAI apunta a la ruta /openai/v1/.",fuente:"https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/endpoints"},
 {d:1,tipo:"unica",esc:"Una llamada con DefaultAzureCredential a un recurso devuelve el error Custom subdomain required. El recurso usa un endpoint regional.",q:"¿Qué debe hacerse?",ops:["Configurar un subdominio personalizado en el recurso","Asignar Foundry Owner al usuario","Cambiar a una API key en producción","Agregar api-version a la URL"],ok:[0],exp:"La autenticación con tokens requiere un subdominio personalizado. Un rol no resuelve este error, y una API key evita el requisito sin cumplir la autenticación sin secretos.",fuente:"https://learn.microsoft.com/en-us/azure/foundry/concepts/authentication-authorization-foundry"},
 {d:1,tipo:"multiple",esc:"Una empresa clasifica sus operaciones por plano antes de asignar roles.",q:"¿Qué dos operaciones pertenecen al plano de control?",ops:["Crear un despliegue de modelo","Crear una conexión de proyecto","Ejecutar una evaluación","Enviar un mensaje a un agente"],ok:[0,1],exp:"Desplegar modelos y crear conexiones son acciones de control. Evaluar y conversar con agentes son operaciones del plano de datos.",fuente:"https://learn.microsoft.com/en-us/azure/foundry/concepts/authentication-authorization-foundry"}
]};

var MAPAS={
"1-1":[{t:"Capas de la plataforma",tipo:"capas",html:capas(["Suscripción|Facturación y cuota","Grupo de recursos|Ciclo de vida común","Foundry resource|Seguridad, red, modelos desplegados, keys|hot","Project|Agentes, evaluaciones, conexiones del equipo|hot","Agente|Versiones, identidad y endpoint propio"])},
 {t:"Qué pertenece a cada nivel",tipo:"clasificación",html:clases(["Recurso|Despliegues de modelos|Red y private endpoints|Claves de API|Cuota asignada","Proyecto|Agentes|Evaluaciones y trazas|Archivos y conexiones de proyecto|Permisos del equipo"])}],
"1-2":[{t:"Árbol de decisión de despliegue",tipo:"decisión",html:decision(["¿Se trata de un modelo fine-tuned en evaluación?|Developer|Continuar","¿La carga es asíncrona y puede esperar?|Batch|Continuar","¿Es alta, constante o exige latencia estable?|Provisioned (PTU)|Standard","¿Hay residencia de datos por zona o geografía?|Data Zone o Regional|Global"])},
 {t:"Formas de consumir un modelo",tipo:"niveles",html:niveles(["Instant access|Sin despliegue (preview)","Serverless API|Despliegue por token o PTU","Managed compute|Cómputo propio del modelo"])}],
"1-3":[{t:"Dos planos de operación",tipo:"capas",html:capas(["Plano de control|Crear recursos, desplegar, asignar roles · RBAC actions","Plano de datos|Inferencia, agentes, evaluaciones · RBAC dataActions|hot"])},
 {t:"Niveles de alcance",tipo:"niveles",html:niveles(["Suscripción|Cuota y Owner","Grupo de recursos","Recurso|Modelos","Proyecto|Construir","Agente|Solo endpoint"])},
 {t:"Tipos de identidad",tipo:"clasificación",html:clases(["Personas|User principal","Aplicaciones|Service principal con secreto o certificado","Recursos de Azure|Managed identity de sistema|Managed identity de usuario","Agentes|Agent identity sin permisos iniciales"])}],
"1-4":[{t:"Capas de aislamiento de red",tipo:"capas",html:capas(["Cliente|VNet, VPN o ExpressRoute","Private endpoint|Entrada privada al recurso|hot","Foundry resource|Acceso público deshabilitado","Agentes|Red privada para prompt agents; BYO VNet en hosted","Dependencias|Cosmos DB, Storage y AI Search privados"])},
 {t:"Etapas de standard setup",tipo:"etapas",html:etapas(["Dependencias|Cosmos DB, Storage, AI Search y Key Vault","Foundry|Recurso, modelo y capability settings","Proyecto|Hereda o sobrescribe la configuración","Roles de ejecución|Identidad del proyecto","Acceso|Foundry User a desarrolladores"])}],
"1-5":[{t:"Del límite global a la solicitud",tipo:"capas",html:capas(["Cuota|Suscripción, región, modelo y tipo","Despliegue|TPM asignado|hot","RPM|Proporcional al TPM","Ventana|Evaluación cada 1 a 10 segundos","Solicitud|Aceptada o 429|gate"])},
 {t:"Diagnóstico de un 429",tipo:"decisión",html:decision(["¿El mensaje indica rate limit exceeded?|Rebalancear TPM o pedir cuota|Continuar","¿Hay picos en pocos segundos?|Distribuir solicitudes|Continuar","¿El límite real es menor al configurado?|Ajuste temporal: reintentar|Revisar capacidad","¿Persiste en producción crítica?|Evaluar PTU|Backoff y retry-after-ms"])}],
"1-6":[{t:"Mapa general de endpoints",tipo:"mapa",html:'<div class="epm"><div class="epr"><b>Tu aplicación</b><span>¿Qué necesita hacer?</span></div><div class="epg">'+
  '<div class="ep e1"><span class="ept">Construir con el proyecto</span><b>Project endpoint</b><code>services.ai.azure.com/api/projects/&lt;project&gt;</code><ul><li>Agentes y Responses</li><li>Evaluaciones y tools</li><li>Foundry SDK</li></ul><em>Solo Entra ID</em></div>'+
  '<div class="ep e2"><span class="ept">Llamar modelos</span><b>OpenAI endpoint</b><code>openai.azure.com/openai/v1</code><ul><li>Responses y Chat Completions</li><li>Embeddings</li><li>OpenAI SDK</li></ul><em>Entra ID o API key</em></div>'+
  '<div class="ep e3"><span class="ept">Modelos Anthropic</span><b>Anthropic endpoint</b><code>services.ai.azure.com/anthropic</code><ul><li>Modelos de ese proveedor</li><li>SDK del proveedor</li></ul><em>Según SDK</em></div>'+
  '<div class="ep e4"><span class="ept">Herramientas</span><b>Foundry Tools</b><code>cognitiveservices.azure.com</code><ul><li>Language, Vision, Content Safety</li><li>Speech y Translator pueden usar hosts propios</li></ul><em>Entra ID con subdominio o key</em></div>'+
  '<div class="ep e5"><span class="ept">Administrar</span><b>Azure Resource Manager</b><code>management.azure.com</code><ul><li>Recursos y despliegues</li><li>Roles y red</li><li>CLI, Bicep, portal</li></ul><em>Plano de control</em></div>'+
  '<div class="ep e6"><span class="ept">Servicio aparte</span><b>Azure AI Search</b><code>&lt;servicio&gt;.search.windows.net</code><ul><li>Índices y consultas</li><li>Knowledge bases</li></ul><em>Recurso independiente</em></div>'+
  '</div></div>'},
 {t:"Anatomía de una URL",tipo:"clasificación",html:'<p><b>Proyecto</b></p>'+urlp(["https://|a|protocolo","contoso|b|recurso",".services.ai.azure.com|c|host Foundry","/api/projects|d|API de proyecto","/siniestros|e|proyecto"])+'<p><b>OpenAI v1</b></p>'+urlp(["https://|a|protocolo","contoso|b|recurso",".openai.azure.com|c|host OpenAI","/openai/v1|d|API estable"])+'<p><b>Ruta de agente</b></p>'+urlp(["…/api/projects/siniestros|d|proyecto","/agents/soporte|e|agente","/endpoint/protocols/openai/responses|c|protocolo"])},
 {t:"Árbol de decisión",tipo:"decisión",html:decision(["¿Se crea o modifica un recurso?|Azure Resource Manager|Continuar","¿Se usa un agente, evaluación o tool de proyecto?|Project endpoint|Continuar","¿Se necesitan embeddings o compatibilidad OpenAI?|<code>/openai/v1</code>|Continuar","¿Es una capacidad especializada?|Foundry Tools|Revisar el SDK del proveedor"])},
 {t:"Ruta clásica y ruta v1",tipo:"clasificación",html:tabla(["","Ruta de despliegue","Ruta v1"],[["URL","<code>/openai/deployments/&lt;nombre&gt;/…</code>","<code>/openai/v1/…</code>"],["Despliegue","En la URL","En el campo <code>model</code>"],["Versión","<code>api-version</code> obligatorio","Implícita"]])}],
"2-1":[{t:"Capas del stack de desarrollo",tipo:"capas",html:capas(["Aplicación|Lógica de negocio","Agent Framework|Orquestación multiagente, opcional","Foundry SDK|<code>AIProjectClient</code>|hot","Cliente OpenAI|<code>get_openai_client()</code>|hot","Endpoint|Proyecto u <code>/openai/v1</code>","Despliegue|Modelo"])},
 {t:"Etapas de un turno",tipo:"etapas",html:etapas(["Crear cliente|Endpoint y credencial","Crear versión|Agente","Abrir conversación|Historial","Crear respuesta|Entrada del turno","Leer salida|<code>output_text</code>"])}],
"2-2":[{t:"Niveles de control de la salida",tipo:"niveles",html:niveles(["Prompt libre|Sin garantía","Formato en prompt|Más consistente","JSON mode|JSON válido","Structured outputs|Cumple el esquema"])},
 {t:"Capas de un prompt",tipo:"capas",html:capas(["Rol y objetivo|Quién es y qué busca","Contexto|Datos recuperados","Reglas|Límites y qué no hacer","Ejemplos|Few-shot","Formato de salida|Esquema o estructura"])},
 {t:"Bucle de autocrítica",tipo:"etapas",html:etapas(["Generar|Borrador","Criticar|Con criterios|hot","Revisar|Mejorar","Parar|Límite de iteraciones|gate"])}],
"2-3":[{t:"Quién administra cada capa",tipo:"clasificación",html:tabla(["Capa","Prompt agent","Hosted agent","Responses API"],[["Definición","Foundry","Tu código","Tu código"],["Orquestación","Foundry","Tu código","Tu código"],["Cómputo","Foundry","Foundry (contenedor)","Tu aplicación"],["Tools de plataforma","Foundry","Foundry","Foundry"],["Modelo","Foundry","Foundry","Foundry"]])},
 {t:"Árbol de decisión",tipo:"decisión",html:decision(["¿Es una conversación por voz en tiempo real?|Voice-based prompt agent|Continuar","¿Ya existe código o lógica propia?|Hosted agent|Continuar","¿La definición debe vivir en la app?|Responses API|Prompt agent"])}],
"2-4":[{t:"Clasificación de tools por dónde se ejecutan",tipo:"clasificación",html:clases(["Tu aplicación|Function calling","Foundry|Code interpreter|File search|Web search","Sistema remoto|OpenAPI|MCP|A2A","Conjunto compartido|Toolbox con endpoint MCP"])},
 {t:"Bucle de function calling",tipo:"etapas",html:etapas(["Enviar|Pregunta y schema","Modelo decide|<code>function_call</code>|hot","App ejecuta|Tu código","Devolver|<code>function_call_output</code>|hot","Responder|Texto final"])}],
"2-5":[{t:"Horizonte del contexto",tipo:"niveles",html:niveles(["Turno|Input","Sesión|Conversation","Entre sesiones|Memory","Organización|Foundry IQ"])},
 {t:"Fases de Memory",tipo:"etapas",html:etapas(["Extracción|Datos clave de la conversación","Consolidación|Unir y resolver conflictos|hot","Recuperación|Búsqueda de lo relevante"])},
 {t:"Tipos de memoria",tipo:"clasificación",html:clases(["User profile|Preferencias estables|Inicio de conversación","Chat summary|Resúmenes previos|En cada turno","Procedural|Rutinas reutilizables|Tareas recurrentes"])}],
"2-6":[{t:"Árbol de decisión de orquestación",tipo:"decisión",html:decision(["¿Los pasos tienen orden fijo?|Sequential|Continuar","¿Pueden ejecutarse a la vez?|Concurrent|Continuar","¿Un especialista toma el control?|Handoff|Continuar","¿Un gestor modera el diálogo?|Group chat|Magentic si el plan cambia"])},
 {t:"Niveles de autonomía",tipo:"niveles",html:niveles(["Asistido|Humano decide","Aprobación|Humano aprueba","Supervisado|Humano audita","Autónomo|Con límites"])}],
"3-1":[{t:"Capas de defensa",tipo:"capas",html:capas(["Identidad|Mínimo privilegio","Red|Aislamiento","Guardrails|Riesgo, punto y acción|hot","Control de tools|<code>allowed_tools</code> y aprobación","Supervisión humana|Acciones sensibles","Auditoría|Trazas y procedencia"])},
 {t:"Anatomía de un control",tipo:"etapas",html:etapas(["Riesgo|Qué detectar","Punto de intervención|Dónde revisar|hot","Acción|Annotate o block"])},
 {t:"Clasificación de riesgos",tipo:"clasificación",html:clases(["Contenido dañino|Hate|Sexual|Self-harm|Violence","Ataques|User prompt attacks|Indirect attacks","Protección de datos|PII|Protected material","Comportamiento|Task Adherence|Groundedness (modelos)"])}],
"3-2":[{t:"Familias de evaluadores",tipo:"clasificación",html:clases(["Calidad general|Coherence|Fluency","RAG|Retrieval|Groundedness|Relevance|Response Completeness","Agente|Intent Resolution|Task Adherence|Tool Selection|Tool Input Accuracy","Similitud|F1|BLEU|ROUGE|METEOR","Riesgo|Violence|Indirect Attack|Code Vulnerability"])},
 {t:"Etapas de una evaluación",tipo:"etapas",html:etapas(["Dataset|Consultas y respuestas","Evaluadores|Selección","Ejecución|En la nube|hot","Resultados|Puntuaciones","Decisión|Umbral|gate"])},
 {t:"Diagnóstico por capas",tipo:"decisión",html:decision(["¿Se recuperó el documento correcto?|Revisar Groundedness|Fallo de Retrieval","¿La respuesta se apoya en el contexto?|Revisar Relevance|Fallo de Groundedness","¿Responde a la pregunta?|Revisar Completeness|Fallo de Relevance"])}],
"3-3":[{t:"Capas de observabilidad",tipo:"capas",html:capas(["Aplicación|Instrumentación OpenTelemetry","Foundry|Trazas de agente y modelo","Application Insights|Almacén y consultas|hot","Evaluación continua|Calidad en producción","Alertas|Azure Monitor"])},
 {t:"Etapas de CI/CD",tipo:"etapas",html:etapas(["Infraestructura|Bicep o Terraform","Versión|Nuevo agente","Evaluar|Dataset|hot","Puerta|Umbral de calidad|gate","Promover|Producción","Monitorear|Trazas"])}],
"4-1":[{t:"Capas de una solución RAG",tipo:"capas",html:capas(["Fuentes|Documentos","Ingesta|Extracción y chunking","Índice|Texto y vectores|hot","Recuperación|Híbrida y reranking|hot","Generación|LLM con citas","Evaluación|Calidad"])},
 {t:"Dónde falla RAG",tipo:"decisión",html:decision(["¿El contenido está en el índice?|Revisar la consulta|Fallo de ingesta","¿Aparece en los primeros resultados?|Revisar el prompt|Fallo de relevancia","¿La respuesta usa ese contexto?|Revisar la calidad|Fallo de grounding"])}],
"4-2":[{t:"Etapas de una consulta",tipo:"etapas",html:etapas(["L1 Recuperación|BM25 y vector en paralelo","Fusión|RRF|hot","L2 Reranking|Semantic ranker|hot","Respuesta|Resultados ordenados"])},
 {t:"Árbol de decisión",tipo:"decisión",html:decision(["¿Busca códigos o nombres exactos?|Keyword o hybrid|Continuar","¿Busca por significado?|Vector o hybrid|Continuar","¿Importa el orden del top?|Agregar semantic ranker|Hybrid simple","¿Son varias preguntas en una?|Agentic retrieval|Consulta única"])}],
"4-3":[{t:"Etapas del indexer",tipo:"etapas",html:etapas(["Document cracking|Abrir y extraer contenido","Field mappings|Origen a índice","Skillset|Enriquecer|hot","Output field mappings|Enriquecido a índice"])},
 {t:"Clasificación de skills",tipo:"clasificación",html:clases(["Texto|Text Split|Entity recognition|Key phrases","Imagen y documento|OCR|Layout","Vectores|Azure OpenAI Embedding","Propias|Custom Web API skill"])}],
"4-4":[{t:"Niveles de reasoning effort",tipo:"niveles",html:niveles(["minimal|Sin planificación","low|Planifica, predeterminado","medium|Más razonamiento"])},
 {t:"Capas de Foundry IQ",tipo:"capas",html:capas(["Agentes|Consumen conocimiento","Knowledge base|Orquesta la recuperación|hot","Knowledge sources|Indexadas o remotas","Azure AI Search|Infraestructura","Datos|Blob, SharePoint, OneLake, web"])}],
"4-5":[{t:"Niveles de analyzers",tipo:"niveles",html:niveles(["prebuilt-read|OCR","prebuilt-layout|Estructura","prebuilt-documentSearch|RAG","Dominio|Factura, contrato","Custom|Esquema propio"])},
 {t:"Métodos de campo",tipo:"clasificación",html:clases(["Extract|Valor tal como aparece|Solo documentos","Classify|Categoría predefinida|Todas las modalidades","Generate|Valor generado|Resúmenes y descripciones"])},
 {t:"Árbol de decisión",tipo:"decisión",html:decision(["¿Solo se necesita texto?|prebuilt-read|Continuar","¿Hace falta estructura sin LLM?|prebuilt-layout|Continuar","¿Es para RAG?|prebuilt-documentSearch|Continuar","¿Existe prebuilt de dominio?|Usarlo o copiarlo|Custom analyzer"])}],
"4-6":[{t:"Decisiones de un campo vectorial",tipo:"capas",html:capas(["Chunk|Tamaño y solape","Modelo|Dimensiones y métrica|hot","Algoritmo|HNSW o exhaustive KNN","Compresión|Scalar, binary y MRL|hot","Almacenamiento|stored y retrievable"])},
 {t:"Árbol de decisión de compresión",tipo:"decisión",html:decision(["¿El índice vectorial cabe en memoria?|Sin compresión|Continuar","¿Se busca una reducción moderada?|Scalar quantization int8|Continuar","¿El modelo es text-embedding-3?|Binary + truncationDimension ≥ 1024|Binary quantization","¿Nadie lee los vectores?|<code>stored: false</code> además|Mantener stored"])}],
"4-7":[{t:"Capas del prompt de RAG",tipo:"capas",html:capas(["Instrucciones|Rol y alcance","Reglas de grounding|Solo fuentes, «no lo sé»|hot","Fuentes|Delimitadas, con id y metadatos|hot","Pregunta|Reescrita si es seguimiento","Formato|Citas y estructura"])},
 {t:"Árbol de decisión del camino",tipo:"decisión",html:decision(["¿Se necesita control fino o solo GA?|Classic RAG desde la app|Continuar","¿Son varias fuentes o permisos por usuario?|Foundry IQ|Continuar","¿Es un índice existente?|Tool Azure AI Search|Continuar","¿Son archivos del usuario en la sesión?|File search|Revisar el requisito"])}],
"4-8":[{t:"Capas de protección",tipo:"capas",html:capas(["Identidad|Token de Entra ID del usuario","Red|Private endpoint y shared private link","Servicio|Roles RBAC, sin claves","Documento|Filtro o permisos nativos|hot","Contenido|Prompt Shields y PII|hot"])},
 {t:"Árbol de decisión de permisos",tipo:"decisión",html:decision(["¿Se exige solo GA o la identidad es propia?|Security filters|Continuar","¿El contenido está en ADLS Gen2 o Blob con ACL?|ACL y RBAC scopes (preview)|Continuar","¿Está en SharePoint?|ACL de SharePoint (preview)|Continuar","¿Ya se clasifica con Purview?|Etiquetas de Purview (preview)|Security filters"])}],
"4-9":[{t:"Familias de evaluación",tipo:"clasificación",html:clases(["Proceso: recuperación|Document Retrieval, con qrels|Retrieval, con juez LLM","Sistema: respuesta|Groundedness: precisión|Relevance|Response Completeness: recall"])},
 {t:"Diagnóstico por métricas",tipo:"decisión",html:decision(["¿Fidelity es baja?|Mejorar chunking, embeddings o hybrid|Continuar","¿NDCG es bajo?|Semantic ranker o scoring profile|Continuar","¿Groundedness es bajo?|Reforzar el prompt de grounding|Continuar","¿Completeness es baja?|Más contexto: k, top o chunks|Promover"])}],
"5-1":[{t:"Clasificación de operaciones",tipo:"clasificación",html:clases(["Generations|Texto a imagen|JSON","Edits por prompt|Imagen de entrada|Sin máscara","Edits con máscara|Inpainting|Alpha 0","Edits con referencias|Hasta 16 imágenes"])}],
"5-2":[{t:"Tipos de entrada",tipo:"niveles",html:niveles(["Texto|Prompt","Imagen|<code>input_reference</code>","Video|<code>remix_video_id</code>"])},
 {t:"Árbol de decisión",tipo:"decisión",html:decision(["¿Hay un video completado por ajustar?|Remix con un cambio|Continuar","¿Hay una imagen de partida?|<code>input_reference</code> del mismo tamaño|Solo prompt"])}],
"5-3":[{t:"Árbol de decisión multimodal",tipo:"decisión",html:decision(["¿Es una pregunta puntual sobre la imagen?|Modelo multimodal|Continuar","¿Se requieren campos repetibles?|Content Understanding|Continuar","¿Es video por segmentos?|<code>prebuilt-videoSearch</code>|Revisar el requisito"])},
 {t:"Capas de seguridad visual",tipo:"capas",html:capas(["Entrada|Filtro de contenido","Texto en imagen|Indirect attacks|gate","Modelo|Instrucciones de solo observación","Salida|Filtro de respuesta","Política|Marca, símbolos y revisión"])}],
"5-4":[{t:"Árbol de decisión de texto",tipo:"decisión",html:decision(["¿Son datos personales?|PII detection|Continuar","¿Son entidades propias con etiquetas?|Custom NER|Continuar","¿Se requiere un JSON exacto?|LLM con structured outputs|Continuar","¿Es traducción con terminología estable?|Azure Translator|LLM con prompt de dominio"])},
 {t:"Clasificación de Azure Language",tipo:"clasificación",html:clases(["Core|PII detection|Language detection|NER|Text analytics for health","Legacy|Sentiment|Key phrases|Summarization|CLU|Question answering"])}],
"5-5":[{t:"Niveles de personalización de voz",tipo:"niveles",html:niveles(["Modelo base|Sin ajuste","Phrase list|Sin entrenar","Custom speech|Con entrenamiento"])},
 {t:"Clasificación de capacidades",tipo:"clasificación",html:clases(["Entrada|Speech to text en tiempo real|Batch transcription|Custom speech","Salida|Text to speech|SSML|Custom voice","Tiempo real|Voice Live|Voice-based prompt agent","Traducción|Speech translation"])},
 {t:"Etapas de custom speech",tipo:"etapas",html:etapas(["Datos|Audio y texto","Entrenar|Modelo personalizado|hot","Probar|Calidad","Desplegar|Endpoint personalizado"])}]
};

/* Panorama de cada módulo: cada paso enlaza con su lección. */
var PANORAMAS={
1:{t:"De la suscripción a la primera llamada",p:[["Organizar","Recurso y proyecto","1-1"],["Desplegar","Modelo y tipo","1-2"],["Dar acceso","Roles e identidad","1-3"],["Aislar","Red y datos","1-4"],["Controlar","Cuota y costo","1-5"],["Conectar","Endpoint correcto","1-6"]]},
2:{t:"Cómo se construye una solución",p:[["Conectar","SDK y cliente","2-1"],["Instruir","Prompt y salida","2-2"],["Elegir","Tipo de agente","2-3"],["Equipar","Tools y aprobación","2-4"],["Informar","Memoria y conocimiento","2-5"],["Orquestar","Varios agentes","2-6"]]},
3:{t:"Cómo se protege y se mide",p:[["Prevenir","Guardrails","3-1"],["Medir","Evaluadores","3-2"],["Observar y automatizar","Trazas y CI/CD","3-3"]]},
4:{t:"Del documento a la respuesta",p:[["Entender","Anatomía de RAG","4-1"],["Buscar","Tipos de búsqueda","4-2"],["Enriquecer","Indexer y skills","4-3"],["Razonar","Agentic retrieval","4-4"],["Extraer","Content Understanding","4-5"],["Vectorizar","Chunks y vectores","4-6"],["Generar","Grounding y citas","4-7"],["Proteger","Permisos","4-8"],["Medir","Evaluar y optimizar","4-9"]]},
5:{t:"Una decisión por tipo de contenido",p:[["Imagen","Generar y editar","5-1"],["Video","Sora 2","5-2"],["Multimodal","Entender medios","5-3"],["Texto","Analizar y traducir","5-4"],["Voz","STT, TTS y agentes","5-5"]]}
};

/* Ubicación de cada esquema dentro de la lectura: "concepto" o el título de una sección A fondo. */
MAPAS["2-1"].unshift({t:"Qué endpoint usar según la tarea",html:MAPAS["1-6"][0].html});
var UBICA={
"1-1":["concepto","Qué se comparte y qué se aísla"],
"1-2":["concepto","Serverless, managed compute e instant access"],
"1-3":["Plano de control y plano de datos","Alcances","Identidades de ejecución"],
"1-4":["Tres superficies de red","Provisionar standard setup"],
"1-5":["Cuota, capacidad y límite efectivo","concepto"],
"1-6":["concepto","concepto","concepto","concepto"],
"2-1":["Elegir SDK y endpoint","Elegir SDK y endpoint","Dos formas de ejecutar un turno"],
"2-2":["Reglas de structured outputs","concepto","Reflexión y autocrítica"],
"2-3":["Matriz de decisión ampliada","concepto"],
"2-4":["concepto","Bucle de function calling"],
"2-5":["Tres formas de llevar el contexto","Memory (preview): configuración real","Memory (preview): configuración real"],
"2-6":["Builders y señales de decisión","Salvaguardas de autonomía y durabilidad"],
"3-1":["Gobernar agentes: supervisión, restricciones y tools","concepto","Matriz de aplicabilidad: modelos frente a agentes"],
"3-2":["concepto","Arquitectura de una evaluación en la nube","concepto"],
"3-3":["Dos capas de telemetría","Integración con CI/CD"],
"4-1":["concepto","Diagnóstico de fallas de grounding"],
"4-2":["RRF por dentro","concepto"],
"4-3":["Cuatro etapas y tres mapeos","Elegir la skill de extracción"],
"4-4":["Reasoning effort (preview)","Knowledge sources e índice"],
"4-5":["concepto","Anatomía de un custom analyzer","Content Understanding, Document Intelligence o modelo propio"],
"4-6":["Algoritmo y métrica","Compresión y almacenamiento"],
"4-7":["Prompt de grounding","concepto"],
"4-8":["Acceso al servicio y red","concepto"],
"4-9":["concepto","Del síntoma a la palanca"],
"5-1":["Edición con máscara, por prompt y con referencias"],
"5-2":["Medios de referencia y edición de videos generados","Medios de referencia y edición de videos generados"],
"5-3":["Captions, alt text y preguntas sobre evidencia visual","Filtros, inyección por imagen y reglas visuales"],
"5-4":["Herramienta especializada o modelo de lenguaje","concepto"],
"5-5":["Configuración de la sesión y personalización","Rutas de voz para un agente","Ciclo de custom speech"]
};
Object.keys(MAPAS).forEach(function(id){MAPAS[id].forEach(function(m,i){m.en=UBICA[id][i]})});
