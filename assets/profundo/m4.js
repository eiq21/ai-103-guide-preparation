/* Módulo 4: Recuperación y extracción. Contenido "A fondo", preguntas y caso de estudio. */
(function(){
  var S="https://learn.microsoft.com/en-us/azure/search/";
  var CU="https://learn.microsoft.com/en-us/azure/ai-services/content-understanding/";
  var AG="https://learn.microsoft.com/en-us/azure/foundry/agents/";
  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
  function pre(c){return "<pre><code>"+esc(c)+"</code></pre>"}
  function tabla(cab,filas){
    return '<div class="tw"><table><thead><tr>'+cab.map(function(c){return "<th>"+c+"</th>"}).join("")+
      "</tr></thead><tbody>"+filas.map(function(f){return "<tr>"+f.map(function(c){return "<td>"+c+"</td>"}).join("")+"</tr>"}).join("")+
      "</tbody></table></div>";
  }

  /* ---------- 4-1 Anatomía de RAG ---------- */
  EXTRA["4-1"]={secciones:[
    {t:"Classic RAG o agentic retrieval",html:
      "<p>Azure AI Search ofrece dos caminos. La documentación recomienda empezar por agentic retrieval en implementaciones nuevas, pero la decisión depende de las restricciones.</p>"+
      tabla(["Criterio","Classic RAG","Agentic retrieval"],[
        ["Consultas","Una sola consulta híbrida","Varias subconsultas en paralelo"],
        ["Orquestación","La aplicación entrega los resultados al LLM","Una knowledge base gestiona el pipeline"],
        ["Latencia","Menor; sin LLM en la planificación","Mayor por la planificación"],
        ["Elegir si","Solo se admiten funciones GA, ya existe orquestación o se requiere control fino","El cliente es un agente, las preguntas son complejas o conversacionales y se necesitan citas"]
      ])+
      "<p>Matiz clave: agentic retrieval tiene una versión GA (<code>2026-04-01</code>), limitada a retrieval mínimo y extractivo. La planificación con LLM y la síntesis de respuestas siguen en preview.</p>"},
    {t:"Diseño de un índice de chunks",html:
      "<p>En RAG, el documento de búsqueda es el chunk. Los campos del padre se repiten en cada chunk, que es el patrón recomendado.</p>"+
      pre('{\n  "name": "politicas-chunks",\n  "fields": [\n    { "name": "chunk_id", "type": "Edm.String", "key": true,\n      "filterable": true, "analyzer": "keyword" },\n    { "name": "parent_id", "type": "Edm.String", "filterable": true },\n    { "name": "title", "type": "Edm.String", "searchable": true,\n      "retrievable": true },\n    { "name": "chunk", "type": "Edm.String", "searchable": true,\n      "retrievable": true },\n    { "name": "chunk_vector", "type": "Collection(Edm.Single)",\n      "searchable": true, "retrievable": false, "stored": false,\n      "dimensions": 1536, "vectorSearchProfile": "perfil-hnsw" }\n  ]\n}')+
      "<ul><li>La clave debe ser <code>Edm.String</code> con el analyzer <code>keyword</code>.</li><li><code>parent_id</code> debe ser filtrable y no puede ser la clave.</li><li>El vector no es legible: <code>retrievable</code> y <code>stored</code> en <code>false</code> ahorran espacio.</li><li>Con <code>stored: false</code>, toda actualización parcial debe incluir el vector, aunque no cambie; de lo contrario se pierde.</li></ul>"},
    {t:"Pull o push según fuente y frescura",html:
      tabla(["Situación","Ruta"],[
        ["Blob, ADLS Gen2, Azure SQL, Cosmos DB for NoSQL, Table Storage, OneLake","Indexer (GA)"],
        ["SharePoint, Azure Files, MySQL, Cosmos DB for MongoDB o Gremlin","Indexer en preview"],
        ["Cosmos DB for Cassandra","Sin indexer: push"],
        ["Actualización con frecuencia menor a 5 minutos","Push con <code>mergeOrUpload</code>"],
        ["Audio y video","Extracción con Content Understanding y carga posterior al índice"]
      ])+
      "<p>El push acepta hasta 1000 documentos o unos 16 MB por lote. La acción <code>upload</code> deja en null los campos omitidos; <code>merge</code> y <code>mergeOrUpload</code> conservan los no enviados.</p>"},
    {t:"Diagnóstico de fallas de grounding",html:
      tabla(["Síntoma","Causa probable","Corrección"],[
        ["Responde sobre temas ajenos al corpus","Una consulta vectorial siempre devuelve <code>k</code> vecinos","Usar hybrid y exigir respuesta «no lo sé»"],
        ["No encuentra códigos de producto","Solo se consulta el campo vectorial","Agregar <code>search</code> con BM25"],
        ["Error de dimensiones al consultar","Modelo distinto al del vector","Igualar modelo y <code>dimensions</code>"],
        ["Tablas partidas en los fragmentos","Chunking por longitud","Extracción y chunking por layout"],
        ["Contexto excesivo para el LLM","Se devuelven campos innecesarios","Limitar con <code>select</code> y <code>top</code>"]
      ])}
  ],preguntas:[
    {d:5,tipo:"unica",esc:"Northwind Banca ya opera un orquestador propio que llama a un modelo de chat. Compliance solo admite funciones GA. Las preguntas son directas, la latencia objetivo es mínima y el equipo desea conservar el control de cada paso de la consulta.",
     q:"¿Qué enfoque de recuperación corresponde adoptar?",
     ops:["Agentic retrieval con planificación por LLM y reasoning effort medium en una knowledge base nueva","Classic RAG con consulta híbrida y semantic ranker","Agentic retrieval con síntesis de respuestas sobre una knowledge base","Solo búsqueda vectorial, sin campos de texto en el índice"],ok:[1],
     exp:"Classic RAG encaja cuando se requieren solo funciones GA, se quiere preservar la orquestación existente, importa la velocidad y se necesita control fino. La planificación por LLM y la síntesis de respuestas están en preview. Prescindir del texto eliminaría la coincidencia exacta y dejaría al LLM sin contenido legible.",
     fuente:S+"retrieval-augmented-generation-overview"},
    {d:5,tipo:"multiple",esc:"Fabrikam Legal divide contratos con un indexer y una Text Split skill. Cada chunk debe ser un documento de búsqueda con el título del contrato. El índice no debe contener documentos padre con campos de chunk nulos, y el seguimiento de cambios debe seguir funcionando.",
     q:"¿Qué configuraciones se deben aplicar?",
     ops:["Definir projectionMode como skipIndexingParentDocuments","Mapear title en selectors.mappings de la index projection","Crear parent_id como Edm.String filtrable, distinto de la clave","Crear un field mapping del indexer hacia el campo de clave del padre","Omitir projectionMode para usar el valor predeterminado"],ok:[0,1,2],
     exp:"skipIndexingParentDocuments evita documentos padre con nulos, a diferencia del valor predeterminado includeIndexingParentDocuments. En una index projection se deben mapear de forma explícita todos los campos, salvo las claves. parent_id debe ser Edm.String y filtrable, sin ser la clave. Un field mapping hacia la clave del padre interrumpe el seguimiento de cambios.",
     fuente:S+"search-how-to-define-index-projections"},
    {d:5,tipo:"sino",esc:"Un equipo revisa los supuestos de diseño de una solución RAG sobre Azure AI Search antes de pasarla a producción.",
     q:"Indique si cada afirmación es correcta.",
     afirm:[
      {t:"Una consulta solo vectorial puede devolver k resultados aunque ninguno sea realmente similar.",ok:true},
      {t:"Un vectorizer puede usar un modelo distinto al de la indexación si las dimensiones coinciden.",ok:false},
      {t:"En classic RAG, la aplicación orquesta la entrega de los resultados al LLM.",ok:true},
      {t:"Un resultado vectorial se puede convertir de nuevo a texto para enviarlo al LLM.",ok:false}],
     exp:"La búsqueda de vecinos siempre devuelve k coincidencias si existen documentos. El vectorizer debe usar el mismo modelo que generó los vectores: igualar dimensiones no basta, porque los espacios vectoriales son distintos. La conversión es de un solo sentido, por eso el índice conserva campos de texto.",
     fuente:S+"vector-search-integrated-vectorization"},
    {d:5,tipo:"orden",esc:"Una aplicación de classic RAG envía una consulta híbrida con un vector query de tipo text y semantic ranker. El índice tiene un vectorizer asignado.",
     q:"Ordene lo que ocurre en el servicio de búsqueda desde que llega la solicitud.",
     pasos:["La solicitud llega con search y vectorQueries","El vectorizer convierte el texto de la consulta en un embedding","BM25 y la búsqueda vectorial se ejecutan en paralelo","RRF fusiona las listas en un único resultado","El semantic ranker reordena los primeros 50 resultados"],
     sobran:["El semantic ranker consulta de nuevo todo el corpus","Un modelo generativo redacta las captions"],
     exp:"El texto se vectoriza en el momento de la consulta, ambas búsquedas corren en paralelo y RRF las fusiona. Semantic ranker actúa después de RRF y solo sobre los primeros 50 resultados: no vuelve a consultar el corpus. Las captions son texto literal del índice; no las genera un modelo.",
     fuente:S+"hybrid-search-ranking"},
    {d:5,tipo:"unica",esc:"Tailwind Traders actualiza el stock y la descripción de productos cada minuto. El cambio debe ser buscable en menos de dos minutos. Los documentos tienen campos que no cambian y un campo vectorial con stored en false.",
     q:"¿Qué estrategia de carga cumple los requisitos sin perder datos?",
     ops:["Programar un indexer con un intervalo de un minuto","Usar la acción upload enviando solo la clave y los campos modificados para reducir el tamaño del lote","Usar mergeOrUpload enviando los campos modificados y también el vector","Programar el indexer cada cinco minutos y habilitar caché de enriquecimiento"],ok:[2],
     exp:"El intervalo mínimo de un indexer es de cinco minutos, por lo que el requisito exige push. mergeOrUpload conserva los campos no enviados, pero con stored en false el vector se debe incluir o se pierde. La acción upload deja en null los campos omitidos.",
     fuente:S+"search-howto-reindex"}
  ]};

  /* ---------- 4-2 Tipos de búsqueda ---------- */
  EXTRA["4-2"]={secciones:[
    {t:"RRF por dentro",html:
      "<p>RRF suma, para cada documento, <code>1/(rank + k)</code> en cada lista. Este <code>k</code> es una constante cercana a 60 y no tiene relación con el <code>k</code> de vecinos. Cada consulta aporta como máximo cerca de <code>1/60</code>, de modo que una fusión de dos consultas ronda 0.033 como techo.</p>"+
      tabla(["Solicitud","Ejecuciones fusionadas"],[
        ["Texto + 1 vector query","2"],
        ["Texto + 1 vector query sobre 2 campos","3"],
        ["Texto + 2 vector queries sobre 5 campos","11"]
      ])+
      tabla(["Método","Propiedad","Rango"],[
        ["Full-text (BM25)","<code>@search.score</code>","Sin límite superior"],
        ["Vector (cosine)","<code>@search.score</code>","0.333 a 1.00"],
        ["Hybrid (RRF)","<code>@search.score</code>","Según el número de consultas fusionadas"],
        ["Semantic","<code>@search.rerankerScore</code>","0.00 a 4.00"]
      ])+
      "<p>Por eso un umbral fijo no sirve en hybrid: los rangos de RRF son pequeños y volátiles. <code>weight</code> solo aplica a vector queries (valor predeterminado 1.0); el texto mantiene un peso neutro implícito. <code>threshold</code> y <code>maxTextRecallSize</code> están en preview.</p>"},
    {t:"Filtros y vectorFilterMode",html:
      tabla(["Modo","Recall","Riesgo de falsos negativos","Uso"],[
        ["<code>preFilter</code> (predeterminado)","Muy alto","Ninguno","Filtros selectivos, <code>k</code> pequeño, dominios sensibles"],
        ["<code>postFilter</code>","Medio a alto","Moderado","Filtros poco selectivos, <code>k</code> alto, prioridad a latencia"],
        ["<code>strictPostFilter</code> (preview)","Bajo","Alto; puede devolver cero","Navegación por facetas"]
      ])+
      "<p>El filtro actúa sobre campos filtrables no vectoriales. Con un filtro muy selectivo, <code>preFilter</code> recorre más grafo y aumenta la latencia; en ese caso conviene evaluar <code>exhaustive: true</code>.</p>"},
    {t:"Límites de semantic ranker",html:
      "<ul><li>Reordena solo los 50 primeros resultados; no busca de nuevo.</li><li>Recibe hasta 2000 tokens por documento: 128 para título, 128 para palabras clave y el resto para contenido. El orden de los campos importa, y lo que excede el límite se ignora.</li><li><code>search=*</code> no aplica ranking y no genera cobro. <code>orderby</code> junto con semantic devuelve HTTP 400.</li><li>Captions y answers son texto literal del índice.</li><li>Query rewrite está en preview.</li></ul>"+
      tabla(["Parámetro","Admite"],[
        ["<code>queryType: semantic</code>","Texto plano e hybrid"],
        ["<code>semanticQuery</code>","Además, sintaxis simple o Lucene y consultas solo vectoriales"]
      ])},
    {t:"Consulta completa",html:
      pre('{\n  "search": "cobertura de baterías en tránsito",\n  "filter": "pais eq \'CL\'",\n  "vectorFilterMode": "preFilter",\n  "vectorQueries": [{\n    "kind": "text",\n    "text": "cobertura de baterías en tránsito",\n    "fields": "chunk_vector",\n    "k": 50\n  }],\n  "queryType": "semantic",\n  "semanticConfiguration": "cfg",\n  "captions": "extractive|highlight-true",\n  "answers": "extractive|count-3",\n  "select": "title, chunk",\n  "top": 5\n}')+
      "<p>En hybrid, <code>top</code> define cuántos resultados vuelven y <code>k</code> cuántos aporta el lado vectorial. Para depurar pesos, el parámetro <code>debug</code> con valor <code>vector</code>, <code>semantic</code> o <code>all</code> devuelve subpuntajes.</p>"}
  ],preguntas:[
    {d:5,tipo:"completar",esc:"Un agente de Wide World Importers consulta aranceles. El servicio debe vectorizar el texto, el filtro por país es muy selectivo y no se admite perder coincidencias. Se busca dar al reranker el máximo de entradas y mostrar captions con resaltado.",
     q:"Complete la solicitud de búsqueda.",
     codigo:`{
  "search": "arancel para baterías de litio",
  "filter": "pais eq 'CL'",
  "vectorFilterMode": "{{0}}",
  "vectorQueries": [{
    "kind": "{{1}}",
    "text": "arancel para baterías de litio",
    "fields": "chunk_vector",
    "k": {{2}}
  }],
  "queryType": "{{3}}",
  "semanticConfiguration": "cfg",
  "captions": "{{4}}",
  "top": 5
}`,
     huecos:[{ops:["preFilter","postFilter","strictPostFilter"],ok:0},{ops:["vector","text","imageUrl"],ok:1},{ops:["5","50","1000"],ok:1},{ops:["simple","full","semantic"],ok:2},{ops:["extractive|highlight-true","generative|highlight-true","extractive|count-3"],ok:0}],
     exp:"preFilter no tiene riesgo de falsos negativos. kind text indica que el vectorizer convierte la cadena. k en 50 maximiza las entradas del reranker. queryType semantic activa el reranking. Las captions son extractivas y admiten highlight; count se usa en answers.",
     fuente:S+"vector-search-how-to-query"},
    {d:5,tipo:"unica",esc:"Un buscador de jurisprudencia usa un filtro que selecciona el 0.05 % del índice, con k igual a 10. La omisión de un fallo relevante es inaceptable. La latencia es una prioridad secundaria.",
     q:"¿Qué configuración de filtro corresponde?",
     ops:["postFilter con k igual a 10","strictPostFilter con k igual a 10","preFilter, evaluando exhaustive en true","Sin filter en la consulta, filtrando después en la aplicación"],ok:[2],
     exp:"preFilter garantiza k resultados si existen, y exhaustive es la opción sugerida para filtros muy selectivos. Los modos de postfiltrado pueden omitir coincidencias con filtros selectivos y k pequeño; strictPostFilter incluso puede devolver cero. Filtrar en la aplicación tiene el mismo problema.",
     fuente:S+"vector-search-filters"},
    {d:5,tipo:"sino",esc:"Una consulta incluye search, una vector query dirigida a los campos titleVector y contentVector con weight en 2.0, y queryType semantic.",
     q:"Indique si cada afirmación es correcta.",
     afirm:[
      {t:"RRF fusiona tres ejecuciones de consulta.",ok:true},
      {t:"La constante k de RRF es el mismo parámetro k de la vector query.",ok:false},
      {t:"El weight permite reducir también el peso de la parte de texto.",ok:false},
      {t:"@search.rerankerScore se calcula después de RRF y se informa por separado de @search.score.",ok:true}],
     exp:"Una consulta de texto más una vector query sobre dos campos son tres ejecuciones. Las dos k son independientes: una es la constante de RRF y la otra el número de vecinos. weight aplica solo a vectores; el texto tiene peso neutro implícito. Semantic ranking ocurre tras RRF y su puntaje se informa aparte.",
     fuente:S+"hybrid-search-ranking"},
    {d:5,tipo:"multiple",esc:"Una aplicación envía esta consulta y recibe un error HTTP 400: search con valor asterisco, queryType semantic, semanticConfiguration cfg y orderby fecha desc. Se requiere ranking semántico.",
     q:"¿Qué cambios se deben realizar?",
     ops:["Eliminar orderby de la consulta","Sustituir el asterisco por una consulta en texto plano","Agregar vectorQueries con k igual a 50","Agregar captions extractive a la solicitud"],ok:[0,1],
     exp:"orderby sustituye los puntajes y provoca HTTP 400 con semantic ranking. Con search en asterisco no hay términos que evaluar, por lo que tampoco se aplica ranking. Agregar vectores o captions no corrige ninguna de las dos causas.",
     fuente:S+"semantic-how-to-query-request"},
    {d:5,tipo:"unica",esc:"Cada contrato de 60 páginas se indexa como un solo documento. Las cláusulas de las últimas páginas nunca influyen en el reranking, aunque el contrato aparece entre los 50 primeros resultados.",
     q:"¿Qué acción corrige la causa?",
     ops:["Aumentar top a 200 para que se reordenen más resultados","Mover el contenido a prioritizedKeywordsFields","Activar answers extractive en la consulta","Dividir el contenido en chunks"],ok:[3],
     exp:"El ranker recibe hasta 2000 tokens por documento e ignora lo que excede. Dividir en chunks permite evaluar cada parte. top no cambia el máximo de 50 documentos, las palabras clave disponen de solo 128 tokens y answers no afecta a las entradas.",
     fuente:S+"semantic-search-overview"}
  ]};

  /* ---------- 4-3 Indexación y skills ---------- */
  EXTRA["4-3"]={secciones:[
    {t:"Cuatro etapas y tres mapeos",html:
      "<p>El indexer ejecuta: document cracking, field mappings, skillset y output field mappings. Toda salida de una skill vive en un árbol en memoria y no llega al índice sin un mapeo.</p>"+
      tabla(["Mapeo","Dónde","Origen"],[
        ["<code>fieldMappings</code>","Indexer","Campo de la fuente, sin cambios"],
        ["<code>outputFieldMappings</code>","Indexer","Nodo del árbol enriquecido"],
        ["<code>selectors.mappings</code>","Skillset","Nodo proyectado a chunks"]
      ])+
      "<p>El <code>context</code> fija cuántas veces corre la skill y dónde cuelga su salida.</p>"+
      pre('{\n  "skills": [\n    { "@odata.type": "#Microsoft.Skills.Text.SplitSkill",\n      "context": "/document", "textSplitMode": "pages",\n      "maximumPageLength": 2000, "pageOverlapLength": 200,\n      "inputs": [{ "name": "text", "source": "/document/content" }],\n      "outputs": [{ "name": "textItems", "targetName": "pages" }] },\n    { "@odata.type": "#Microsoft.Skills.Text.AzureOpenAIEmbeddingSkill",\n      "context": "/document/pages/*",\n      "resourceUri": "https://aoai.openai.azure.com",\n      "deploymentId": "embed-idx", "modelName": "text-embedding-3-small",\n      "inputs": [{ "name": "text", "source": "/document/pages/*" }],\n      "outputs": [{ "name": "embedding", "targetName": "chunk_vector" }] }\n  ]\n}')+
      "<p>El valor predeterminado de <code>maximumPageLength</code> es 5000 caracteres. Contar en tokens (<code>unit</code>) está en preview. Se aconseja una deployment de embeddings distinta para indexar y para consultar.</p>"},
    {t:"Elegir la skill de extracción",html:
      tabla(["Skill","Aporta","Costo y nota"],[
        ["Document Extraction","Texto e imágenes; requiere chunking aparte","Imágenes según precio de AI Search"],
        ["Azure Content Understanding (GA en <code>2026-04-01</code>)","Chunking propio, Markdown, tablas entre páginas, ubicación","Sin 20 documentos gratis; recomendada para skillsets nuevos"],
        ["Document Layout","Markdown por secciones o texto","Soportada para pipelines existentes; 20 documentos gratis por indexer al día"],
        ["OCR + Text Merge","Texto de imágenes reinsertado en el contenido","Requiere <code>imageAction</code>; OCR queda al final de cada página"],
        ["GenAI Prompt (GA)","Verbalización y resúmenes con un LLM","Costo del modelo; tiempo límite fijo de 30 s"]
      ])+
      "<p>Las skills de archivo reciben <code>/document/file_data</code>, que se activa con <code>allowSkillsetToReadFileData: true</code>. La descripción de imágenes y el chunking semántico de la skill de Content Understanding están en preview desde <code>2026-05-01-preview</code>.</p>"},
    {t:"Contrato de la Custom Web API skill",html:
      tabla(["Parámetro","Valor"],[
        ["<code>uri</code>","Solo https"],
        ["<code>timeout</code>","30 s por defecto; de 1 a 230 s; formato <code>PT60S</code>"],
        ["<code>batchSize</code>","1000 por defecto"],
        ["<code>degreeOfParallelism</code>","5 por defecto; de 1 a 10"],
        ["<code>authResourceId</code>","Identifica la app de destino, por ejemplo <code>api://&lt;appId&gt;</code>"]
      ])+
      "<p>La API recibe y devuelve <code>values</code>. Cada registro de respuesta lleva <code>recordId</code>, <code>data</code>, <code>errors</code> y <code>warnings</code>; estos dos últimos son obligatorios, aunque valgan null. El orden no importa. Hay dos reintentos ante 429, 502 y 503. Las entradas provienen de documentos y deben tratarse como no confiables.</p>"},
    {t:"Monitoreo de ingesta, índice y relevancia",html:
      tabla(["Pregunta","Señal"],[
        ["¿Fallaron documentos?","Get Indexer Status: <code>lastResult</code>, <code>itemsFailed</code>, <code>errors</code>; hasta 50 ejecuciones"],
        ["¿Alertas de ingesta?","<code>DocumentsProcessedCount</code> y <code>SkillExecutionCount</code>, dimensión <code>Failed</code>"],
        ["¿Crece el índice?","<code>IndexStorageUsage</code> e <code>IndexVectorUsage</code> por índice"],
        ["¿Salud de consulta?","<code>SearchLatency</code> y <code>ThrottledSearchQueriesPercentage</code>"],
        ["¿Qué se consulta?","Diagnostic settings hacia <code>AzureDiagnostics</code>: <code>Query.Search</code>"],
        ["¿Falla una skill?","Debug sessions: árbol enriquecido y mapeos"]
      ])+
      "<p>Dos trampas: el estado superior <code>running</code> indica que el indexer está disponible, no que esté ejecutándose; y una ejecución es <b>success</b> aunque tenga errores si no supera <code>maxFailedItems</code>. El activity log solo registra el plano de control.</p>"}
  ],preguntas:[
    {d:5,tipo:"orden",esc:"Un indexer procesa PDF desde Blob Storage con un skillset de OCR y entidades. Los resultados se envían a un índice.",
     q:"Ordene las etapas para cada documento.",
     pasos:["Document cracking","Field mappings","Ejecución del skillset","Output field mappings"],
     sobran:["Reranking semántico","Fusión con RRF"],
     exp:"Primero se abre el archivo y se extrae el contenido. Los field mappings ocurren antes de las transformaciones. Luego corre el skillset, y los output field mappings envían los nodos enriquecidos al índice. RRF y reranking son operaciones de consulta, no de indexación.",
     fuente:S+"search-indexer-overview"},
    {d:5,tipo:"completar",esc:"Una función protegida con Microsoft Entra ID clasifica el riesgo de cada chunk en un máximo de tres minutos por lote. La API se satura con más de dos llamadas simultáneas. El search service usa managed identity.",
     q:"Complete la definición de la skill.",
     codigo:`{
  "@odata.type": "{{0}}",
  "name": "clasificador-riesgo",
  "context": "{{1}}",
  "uri": "https://func-riesgo.azurewebsites.net/api/clasificar",
  "httpMethod": "POST",
  "timeout": "{{2}}",
  "batchSize": 10,
  "degreeOfParallelism": {{3}},
  "authResourceId": "{{4}}",
  "inputs": [{ "name": "texto", "source": "/document/pages/*" }],
  "outputs": [{ "name": "riesgo" }]
}`,
     huecos:[{ops:["#Microsoft.Skills.Custom.WebApiSkill","#Microsoft.Skills.Custom.ChatCompletionSkill","#Microsoft.Skills.Util.ShaperSkill"],ok:0},{ops:["/document","/document/pages/*","/document/normalized_images/*"],ok:1},{ops:["PT30S","PT180S","PT300S"],ok:1},{ops:["1","2","5"],ok:1},{ops:["api://func-riesgo","https://svc.search.windows.net","/document/riesgo"],ok:0}],
     exp:"La skill personalizada usa WebApiSkill. El contexto por chunk es /document/pages/*. Tres minutos son PT180S; PT300S supera el máximo de 230 segundos. degreeOfParallelism limita las llamadas simultáneas. authResourceId identifica la aplicación de destino, no el servicio de búsqueda.",
     fuente:S+"cognitive-search-custom-skill-web-api"},
    {d:5,tipo:"unica",esc:"Adventure Works crea un pipeline nuevo para PDF y PPTX. Hay tablas que cruzan páginas, las citas deben indicar la página y se prefiere una sola skill para extraer y fragmentar. Producción solo admite funciones GA.",
     q:"¿Qué configuración corresponde?",
     ops:["Content Understanding skill con locationMetadata y chunking de tamaño fijo","Content Understanding skill con chunking method semantic y unit en tokens para respetar párrafos","Document Extraction skill con Text Split skill","Document Layout skill con outputFormat text"],ok:[0],
     exp:"La skill de Content Understanding es GA, extrae y fragmenta, reconoce tablas entre páginas y devuelve ubicación. El chunking semantic está en preview. Document Extraction no preserva tablas ni entrega ubicación del texto. Document Layout se mantiene para pipelines existentes y entrega tablas como texto plano.",
     fuente:S+"cognitive-search-skill-content-understanding"},
    {d:1,tipo:"multiple",esc:"El indexer de Contoso Energía muestra success en todas las ejecuciones, pero faltan 1200 de 90 000 documentos en el índice. maxFailedItems tiene un valor alto. El equipo quiere detectar el problema de forma temprana.",
     q:"¿Qué acciones son correctas?",
     ops:["Revisar lastResult, itemsFailed y errors con Get Indexer Status","Crear una alerta sobre DocumentsProcessedCount con la dimensión Failed","Reducir maxFailedItems para que la ejecución no termine en success con tantos errores","Buscar los errores por documento en el activity log de Azure","Interpretar el estado superior running como una ejecución en curso"],ok:[0,1,2],
     exp:"Get Indexer Status detalla cada ejecución. La métrica admite la dimensión Failed para alertas. Una ejecución termina en success si los errores no superan maxFailedItems, de modo que bajar el valor expone el problema. El activity log registra solo el plano de control, y el estado running significa que el indexer está disponible.",
     fuente:S+"search-monitor-indexers"},
    {d:5,tipo:"sino",esc:"Se implementa la API de una Custom Web API skill que recibe lotes de registros.",
     q:"Indique si cada afirmación es correcta.",
     afirm:[
      {t:"Las propiedades errors y warnings deben existir en cada registro, aunque valgan null.",ok:true},
      {t:"Un registro con un recordId que no estaba en la solicitud se descarta.",ok:true},
      {t:"Los registros deben devolverse en el mismo orden en que llegaron.",ok:false},
      {t:"Una respuesta 200 con Content-Type text/plain es válida si el cuerpo contiene JSON correcto.",ok:false},
      {t:"El indexer reintenta dos veces ante un 429.",ok:true}],
     exp:"El contrato exige errors y warnings, y recordId correlaciona la respuesta, por lo que el orden no importa y los identificadores desconocidos se descartan. La respuesta debe ser application/json, o no se aplican enriquecimientos. Existen dos reintentos ante 429, 502 y 503.",
     fuente:S+"cognitive-search-custom-skill-web-api"}
  ]};

  /* ---------- 4-4 Agentic retrieval y Foundry IQ ---------- */
  EXTRA["4-4"]={secciones:[
    {t:"Contrato GA y contrato preview",html:
      "<p>Nombres: la antigua <b>knowledge agent</b> se llama ahora <b>knowledge base</b>. Foundry IQ es la capa administrada de Foundry sobre este motor; el portal solo ofrece acceso preview.</p>"+
      tabla(["Capacidad","<code>2026-04-01</code> (GA)","<code>2026-08-01-preview</code>"],[
        ["Entrada","<code>intents</code>","<code>intents</code> o <code>messages</code>"],
        ["Planificación con LLM","No","Sí"],
        ["<code>retrievalReasoningEffort</code>","No existe","<code>minimal</code>, <code>low</code>, <code>medium</code>, <code>auto</code>"],
        ["Síntesis de respuesta","No; solo extractiva","<code>outputMode: answerSynthesis</code>"],
        ["Knowledge sources","<code>searchIndex</code>, <code>azureBlob</code>, <code>indexedOneLake</code>, <code>web</code>","Además SharePoint, Azure SQL, File, Fabric, MCP server, Work IQ"]
      ])+
      pre('POST {endpoint}/knowledgebases/kb-politicas/retrieve?api-version=2026-04-01\n{\n  "intents": [\n    { "type": "semantic", "search": "plazo para reclamar un envío" }\n  ],\n  "knowledgeSourceParams": [\n    { "knowledgeSourceName": "ks-politicas", "kind": "searchIndex" }\n  ]\n}')+
      "<p>En GA, una pregunta de seguimiento es una nueva solicitud con un nuevo intent: no existe un historial de <code>messages</code>.</p>"},
    {t:"Knowledge sources e índice",html:
      tabla(["Tipo","Forma","Contenido"],[
        ["Indexed","Search index, blob, OneLake, SharePoint indexado, Azure SQL, File","Se ingiere antes; a veces con pipeline generado"],
        ["Remote","SharePoint remoto, Fabric, MCP server, Work IQ, web","Nunca se ingiere; se consulta al momento"]
      ])+
      "<p>La knowledge source debe existir antes que la knowledge base, y ambas en el mismo search service. Un índice propio requiere campos <code>searchable</code> y <code>retrievable</code> y una configuración semántica con <code>prioritizedContentFields</code>. Se recomiendan campos de cita, y vectores con vectorizer. Una <code>description</code> de hasta 4000 caracteres ayuda al LLM a seleccionar fuentes y no requiere reconstruir el índice.</p>"},
    {t:"Reasoning effort (preview)",html:
      tabla(["Nivel","Comportamiento","Restricciones"],[
        ["<code>minimal</code>","Sin LLM: consulta todas las fuentes","Salida extractiva; sin síntesis ni web"],
        ["<code>low</code>","Un pase de planificación; predeterminado","Hasta 50 documentos para semantic ranking"],
        ["<code>medium</code>","Clasificador semántico y un solo reintento","Regiones seleccionadas"],
        ["<code>auto</code>","Pase ligero; escala hasta medium si hace falta","Requiere modelo en la knowledge base"]
      ])+
      "<p>Se define en la knowledge base y se puede sobrescribir por solicitud. El costo es doble: tokens de retrieval en AI Search y tokens del LLM en Azure OpenAI. Desde <code>2026-04-01</code>, la propiedad <code>knowledgeRetrieval</code> (<code>free</code> o <code>standard</code>) controla ese cobro, separada de <code>semanticSearch</code>.</p>"},
    {t:"Conexión con un agente",html:
      "<p>La knowledge base se expone por MCP y la conexión requiere preview: categoría <code>RemoteTool</code> y API <code>2026-08-01-preview</code>. Los proyectos hub-based no se admiten.</p>"+
      pre('{\n  "server_label": "knowledge-base",\n  "server_url": "{search}/knowledgebases/kb/mcp?api-version=2026-08-01-preview",\n  "require_approval": "never",\n  "allowed_tools": ["knowledge_base_retrieve"],\n  "project_connection_id": "conexion-kb",\n  "type": "mcp"\n}')+
      tabla(["Identidad","Rol","Dónde"],[
        ["Managed identity del proyecto","Search Index Data Reader","Search service"],
        ["Managed identity del search service (si hay LLM)","Cognitive Services User","Recurso padre del proyecto"],
        ["Quien crea la conexión","Foundry Project Manager (antes Azure AI Project Manager)","Recurso padre del proyecto"]
      ])+
      "<p>Para contenido con permisos, el token del usuario viaja en <code>x-ms-query-source-authorization</code> (preview): lo define Agent Service si quien llama es un usuario, o lo envía la aplicación. Sin él, las fuentes con permisos devuelven resultados sin filtrar. Las instrucciones deben exigir el uso de la tool y citas; <code>knowledge_base_retrieve</code> es la única tool admitida.</p>"}
  ],preguntas:[
    {d:5,tipo:"unica",esc:"Un asistente de Tailwind Traders usa una knowledge base. Producción solo admite funciones GA con SLA. Los usuarios hacen preguntas de seguimiento dentro de la misma conversación.",
     q:"¿Cómo se debe atender una pregunta de seguimiento?",
     ops:["Usar 2026-04-01 y enviar en messages el historial completo de la conversación","Usar 2026-04-01 y enviar un nuevo retrieve con otro intent semantic","Usar 2026-04-01 y definir retrievalReasoningEffort en low","Usar 2026-08-01-preview con reasoning effort medium"],ok:[1],
     exp:"La versión GA no mantiene una transcripción de messages: cada seguimiento es una nueva solicitud con un nuevo intent semántico. retrievalReasoningEffort no existe en 2026-04-01. La versión preview incumple el requisito de GA con SLA.",
     fuente:S+"agentic-retrieval-how-to-migrate"},
    {d:5,tipo:"completar",esc:"Una aplicación consulta una knowledge base con la API estable. Su knowledge source envuelve un índice ya existente y la consulta se envía directamente, sin planificación con LLM.",
     q:"Complete la solicitud.",
     codigo:`POST {endpoint}/knowledgebases/kb-envios/{{0}}?api-version={{1}}
{
  "{{2}}": [
    { "type": "semantic", "search": "plazo para reclamar un envío" }
  ],
  "knowledgeSourceParams": [
    { "knowledgeSourceName": "ks-envios", "kind": "{{3}}" }
  ]
}`,
     huecos:[{ops:["retrieve","docs/search","mcp"],ok:0},{ops:["2026-08-01-preview","2026-04-01","2025-11-01-preview"],ok:1},{ops:["messages","queries","intents"],ok:2},{ops:["searchIndex","remoteSharePoint","web"],ok:0}],
     exp:"La acción es retrieve sobre la knowledge base. 2026-04-01 es la versión estable y su única entrada son los intents. El kind searchIndex corresponde a una knowledge source que envuelve un índice existente. messages solo existe en preview.",
     fuente:S+"agentic-retrieval-how-to-retrieve"},
    {d:5,tipo:"sino",esc:"Un equipo evalúa niveles de razonamiento en una knowledge base con la API 2026-08-01-preview.",
     q:"Indique si cada afirmación es correcta.",
     afirm:[
      {t:"Con minimal no se usa un LLM para planificar las consultas.",ok:true},
      {t:"Con medium se repite la búsqueda tantas veces como sea necesario.",ok:false},
      {t:"El nivel auto requiere un modelo configurado en la knowledge base.",ok:true},
      {t:"Si no se define el nivel en la knowledge base ni en la solicitud, se usa low.",ok:true},
      {t:"Con minimal se puede usar answer synthesis.",ok:false}],
     exp:"minimal desactiva la planificación con LLM y exige salida extractiva, por lo que no admite síntesis. medium permite una sola iteración adicional, para limitar costo y latencia. auto necesita un modelo en la knowledge base. Si no se indica un nivel, el servicio usa low.",
     fuente:S+"agentic-retrieval-how-to-set-retrieval-reasoning-effort"},
    {d:2,tipo:"orden",esc:"Se conectará contenido en Blob Storage a un agente de Foundry Agent Service mediante Foundry IQ, por código. Los roles ya están asignados.",
     q:"Ordene las acciones.",
     pasos:["Crear la knowledge source","Crear la knowledge base que la referencia","Crear la conexión RemoteTool del proyecto hacia el endpoint MCP","Crear la versión del agente con la tool MCP","Enviar una consulta en una conversación del agente"],
     sobran:["Crear un proyecto hub-based para la conexión","Registrar la tool knowledge_base_search en allowed_tools"],
     exp:"La knowledge base referencia knowledge sources, que deben existir antes. La conexión apunta al endpoint MCP de la knowledge base y la tool del agente usa esa conexión. Los proyectos hub-based no se admiten, y la tool admitida es knowledge_base_retrieve.",
     fuente:AG+"how-to/foundry-iq-connect"},
    {d:5,tipo:"multiple",esc:"Un agente recibe un 403 de Azure AI Search al consultar una knowledge base. Además, la knowledge base tiene un LLM para query planning y sus llamadas al modelo fallan por permisos. Se usa autenticación con roles.",
     q:"¿Qué asignaciones de roles se deben realizar?",
     ops:["Search Index Data Reader para la managed identity del proyecto, en el search service","Cognitive Services User para la managed identity del search service, en el recurso padre del proyecto","Search Index Data Reader para la managed identity del search service, en el proyecto","Search Service Contributor para el usuario final, en el search service"],ok:[0,1],
     exp:"El proyecto accede a la búsqueda con su managed identity, que necesita Search Index Data Reader. El search service llama al LLM con su propia identidad, que necesita Cognitive Services User en el recurso padre. Las otras asignaciones invierten la dirección de la llamada o dan permisos de administración innecesarios.",
     fuente:AG+"how-to/foundry-iq-connect"}
  ]};

  /* ---------- 4-5 Content Understanding ---------- */
  EXTRA["4-5"]={secciones:[
    {t:"Content Understanding, Document Intelligence o modelo propio",html:
      "<p>Nombre actual: <b>Azure Content Understanding in Foundry Tools</b>, GA con la API <code>2025-11-01</code>. La versión <code>2026-06-01-preview</code> agrega agentic mode, detección de firmas y metadatos de documento.</p>"+
      tabla(["Escenario","Herramienta"],[
        ["Solo OCR o layout","Content Understanding: <code>prebuilt-read</code> o <code>prebuilt-layout</code>"],
        ["Multimodal o preparación para RAG","Analyzers prebuilt o custom de Content Understanding"],
        ["Formularios estructurados y plantillas comunes","Modelo prebuilt de Document Intelligence"],
        ["Contratos y documentos poco estructurados","<code>prebuilt-contract</code>"],
        ["Extracción propia sin etiquetar, o documentos no estructurados","Custom analyzer (zero-shot)"],
        ["Documentos muy estructurados con etiquetas","Modelo custom de Document Intelligence"],
        ["Local o sin conexión","Contenedores de Document Intelligence"],
        ["Control total de modelos y prompts","Solución propia; sin confianza ni grounding integrados"]
      ])},
    {t:"Anatomía de un custom analyzer",html:
      pre('{\n  "analyzerId": "polizas",\n  "description": "Extrae datos de pólizas de transporte",\n  "baseAnalyzerId": "prebuilt-document",\n  "models": { "completion": "gpt-5.2" },\n  "config": { "tableFormat": "markdown",\n              "estimateFieldSourceAndConfidence": true },\n  "fieldSchema": { "name": "Poliza", "fields": {\n    "Numero": { "type": "string", "method": "extract",\n      "description": "Número de póliza en el encabezado" },\n    "Riesgo": { "type": "string", "method": "classify",\n      "enum": ["Bajo", "Medio", "Alto"] },\n    "Resumen": { "type": "string", "method": "generate" }\n  }}\n}')+
      "<ul><li>Solo se deriva de <code>prebuilt-document</code>, <code>-image</code>, <code>-audio</code> o <code>-video</code>.</li><li><code>extract</code> funciona solo en documentos y exige <code>estimateSourceAndConfidence</code> en el campo o su equivalente del analyzer.</li><li><code>description</code> actúa como un miniprompt.</li><li><code>models</code> lleva nombres de modelo, no de deployment. La asignación se hace con <code>PATCH /contentunderstanding/defaults</code> o con <code>modelDeployments</code> en cada solicitud, que tiene prioridad.</li><li>Para producción, se recomienda copiar la definición prebuilt con GET y crear una propia con PUT, porque puede cambiar entre versiones.</li></ul>"},
    {t:"Opciones de config por modalidad",html:
      tabla(["Modalidad","Opciones"],[
        ["Documento","<code>enableOcr</code>, <code>enableLayout</code>, <code>enableFormula</code>, <code>enableBarcode</code>, <code>tableFormat</code>, <code>enableFigureDescription</code>, <code>enableFigureAnalysis</code>, <code>enableSegment</code>, <code>contentCategories</code>, <code>omitContent</code>"],
        ["Audio","<code>returnDetails</code>, <code>locales</code>"],
        ["Video","<code>returnDetails</code>, <code>locales</code>, <code>contentCategories</code> (una sola), <code>enableSegment</code>, <code>omitContent</code>"],
        ["Imagen","<code>returnDetails</code>"]
      ])+
      "<p>Figuras: <code>enableFigureDescription</code> y <code>enableFigureAnalysis</code> están en <code>false</code> por defecto. Tablas: <code>tableFormat</code> es <code>html</code> por defecto, adecuado para tablas complejas.</p>"+
      "<p>Enrutamiento: con <code>contentCategories</code>, sin una categoría «other» el contenido se fuerza a una de las categorías definidas. Una categoría sin <code>analyzerId</code> solo clasifica. <code>enableSegment: true</code> divide el archivo por categorías; con <code>false</code> clasifica el archivo completo. <code>omitContent: true</code> devuelve solo campos estructurados o el resultado de los subanalyzers.</p>"},
    {t:"Salidas para RAG y para automatización",html:
      tabla(["Modalidad","Analyzer para RAG","Salida principal"],[
        ["Documento","<code>prebuilt-documentSearch</code>","Markdown, resumen, figuras y chunks"],
        ["Imagen","<code>prebuilt-imageSearch</code>","Descripción de un párrafo"],
        ["Audio","<code>prebuilt-audioSearch</code>","Transcripción y resumen"],
        ["Video","<code>prebuilt-videoSearch</code>","Segmentos con transcripción y descripción"]
      ])+
      "<p>La respuesta está en <code>result.contents[]</code>. <code>markdown</code> alimenta RAG y razonamiento; <code>fields</code> alimenta la automatización, con <code>confidence</code>, <code>spans</code> y <code>source</code> cuando corresponde. El valor de confianza va de 0 a 1 y permite enviar a revisión humana lo que quede bajo el umbral.</p>"+
      "<p>Las guardrails de la deployment pueden restringir campos generados y dejar el contenido disponible: un análisis puede terminar con advertencias y sin algunos campos. Estas advertencias se deben revisar antes de automatizar. <code>usage</code> informa páginas, horas y tokens consumidos.</p>"}
  ],preguntas:[
    {d:5,tipo:"completar",esc:"Se crea un custom analyzer de pólizas. El número debe tomarse literal del documento, el riesgo debe ser Bajo, Medio o Alto, y las tablas deben quedar en formato simple para procesarse como texto.",
     q:"Complete la definición.",
     codigo:`{
  "analyzerId": "polizas",
  "baseAnalyzerId": "{{0}}",
  "config": { "enableOcr": true, "tableFormat": "{{1}}" },
  "fieldSchema": {
    "name": "Poliza",
    "fields": {
      "Numero": {
        "type": "string",
        "method": "{{2}}",
        "estimateSourceAndConfidence": {{3}},
        "description": "Número de póliza en el encabezado"
      },
      "Riesgo": {
        "type": "string",
        "method": "{{4}}",
        "enum": ["Bajo", "Medio", "Alto"]
      }
    }
  }
}`,
     huecos:[{ops:["prebuilt-document","prebuilt-layout","prebuilt-documentSearch"],ok:0},{ops:["html","markdown","text"],ok:1},{ops:["generate","classify","extract"],ok:2},{ops:["true","false"],ok:0},{ops:["classify","extract","generate"],ok:0}],
     exp:"Los custom analyzers de documentos derivan de prebuilt-document. markdown conviene para tablas simples y procesamiento de texto. extract toma el valor literal y exige estimateSourceAndConfidence en true. classify con enum elige entre un conjunto fijo de categorías.",
     fuente:CU+"concepts/analyzer-reference"},
    {d:5,tipo:"unica",esc:"Una red de clínicas recibe cartas de derivación de cientos de médicos, sin plantilla común y sin datos etiquetados. Se debe inferir la especialidad, que no siempre aparece escrita, y enviar a revisión humana los valores dudosos, viendo su origen.",
     q:"¿Qué solución corresponde?",
     ops:["Modelo custom de Document Intelligence entrenado con cinco muestras","prebuilt-layout con reglas en la aplicación","Un modelo de chat con un prompt propio y un umbral de confianza fijo definido en la aplicación","Custom analyzer de Content Understanding con grounding y confianza activados"],ok:[3],
     exp:"Un custom analyzer permite empezar sin etiquetas, describir campos, inferir valores y obtener confianza y origen. Document Intelligence custom requiere etiquetar y se orienta a documentos muy estructurados. prebuilt-layout no extrae campos. Una solución propia exige construir aparte la confianza y el grounding.",
     fuente:CU+"choosing-right-ai-tool"},
    {d:5,tipo:"multiple",esc:"Un PDF por lote mezcla facturas, recibos y condiciones generales. Solo se necesitan los campos de las facturas en la respuesta. Lo que no sea factura no debe forzarse a esa categoría.",
     q:"¿Qué configuraciones del analyzer se deben aplicar?",
     ops:["Definir enableSegment en true","Definir contentCategories con invoice apuntando a prebuilt-invoice y una categoría other sin analyzerId","Definir omitContent en true","Definir baseAnalyzerId con el valor prebuilt-invoice","Sustituir contentCategories por segmentPerPage en true"],ok:[0,1,2],
     exp:"enableSegment divide el archivo según las categorías. La categoría other evita forzar contenido, y sin analyzerId solo clasifica. omitContent devuelve únicamente los resultados de subanalyzers. Solo se puede derivar de los cuatro analyzers base, y segmentPerPage no reemplaza las categorías.",
     fuente:CU+"concepts/analyzer-reference"},
    {d:3,tipo:"unica",esc:"Un analyzer con baseAnalyzerId prebuilt-video define el campo Marca con method extract y estimateSourceAndConfidence en true. Esa configuración no es válida para video. Se necesita obtener la marca que aparece en cada segmento.",
     q:"¿Qué cambio corresponde?",
     ops:["Definir enableOcr en true dentro de config","Cambiar baseAnalyzerId a prebuilt-document y conservar el campo con extract","Mantener extract y agregar locales en config","Usar method generate y quitar estimateSourceAndConfidence"],ok:[3],
     exp:"extract se admite solo en documentos, igual que la estimación de origen y confianza. En video, el valor se genera con generate. enableOcr es una opción de documentos, cambiar la base dejaría de procesar video, y locales no modifica el método de extracción.",
     fuente:CU+"overview"},
    {d:5,tipo:"sino",esc:"Un equipo configura deployments y opciones de analyzers con la API 2025-11-01.",
     q:"Indique si cada afirmación es correcta.",
     afirm:[
      {t:"La propiedad models de un custom analyzer contiene nombres de modelos, no nombres de deployments.",ok:true},
      {t:"prebuilt-layout requiere una deployment de un modelo de lenguaje.",ok:false},
      {t:"modelDeployments en una solicitud de análisis prevalece sobre los valores predeterminados del recurso.",ok:true},
      {t:"estimateFieldSourceAndConfidence se admite en analyzers de audio.",ok:false}],
     exp:"models usa nombres del catálogo y el servicio los asocia con deployments mediante defaults o modelDeployments, que prevalece en esa solicitud. prebuilt-layout, prebuilt-read y prebuilt-digitalParse no requieren modelos. La estimación de origen y confianza es para analyzers de documentos.",
     fuente:CU+"concepts/models-deployments"}
  ]};

  /* ---------- Caso de estudio ---------- */
  CASOS.push({id:"caso-m4",modulo:4,t:"Fabrikam Aduanas",
    texto:
      "<h4>Contexto</h4><p>Fabrikam Aduanas gestiona trámites de importación para unos 2000 clientes. Guarda en Azure Blob Storage 400 000 archivos PDF y DOCX, muchos escaneados, además de grabaciones diarias de llamadas. Desea un buscador interno y un agente en Foundry Agent Service que respondan con citas.</p>"+
      "<h4>Requisitos técnicos</h4><ul><li>Los PDF contienen tablas de mercancías que cruzan páginas, y las citas deben indicar la página.</li><li>Las consultas combinan códigos arancelarios exactos, como 8471.30, con preguntas en lenguaje natural.</li><li>Cada consulta se filtra por <code>clienteId</code>; cada cliente representa cerca del 0.5 % del índice.</li><li>Un documento nuevo debe ser buscable en un máximo de 15 minutos, y los eliminados deben desaparecer del índice.</li><li>Las conexiones entre servicios deben usar managed identity.</li><li>El contenido de las llamadas debe poder consultarse junto con los documentos.</li></ul>"+
      "<h4>Requisitos de negocio</h4><ul><li>El índice y el buscador interno solo pueden usar funciones GA.</li><li>El agente es un piloto y puede usar funciones preview.</li><li>Las facturas de cientos de proveedores, con formatos variados, deben extraerse sin etiquetar muestras.</li><li>Todo valor de factura con confianza menor a 0.8 pasa a revisión humana, que debe ver el origen del dato.</li><li>La omisión de un documento de un cliente en una consulta es un incidente grave.</li></ul>",
    preguntas:[
      {d:5,tipo:"unica",esc:"Se diseña la ingesta de los PDF y DOCX para el índice de producción.",
       q:"¿Qué pipeline cumple los requisitos?",
       ops:["Indexer con allowSkillsetToReadFileData, Content Understanding skill con locationMetadata, embedding skill e index projections","Indexer con imageAction, OCR skill, Text Merge skill y Text Split skill","Indexer con allowSkillsetToReadFileData, Content Understanding skill con chunking semantic en tokens, embedding skill e index projections","Indexer con Document Extraction skill, Text Split skill y embedding skill"],ok:[0],
       exp:"allowSkillsetToReadFileData entrega el archivo a la skill de Content Understanding, que es GA, conserva tablas entre páginas y devuelve la página mediante locationMetadata. El chunking semantic está en preview y el índice debe ser GA. OCR con Text Merge y Document Extraction no preservan tablas ni la ubicación del texto.",
       fuente:S+"cognitive-search-skill-content-understanding"},
      {d:5,tipo:"completar",esc:"El buscador interno ejecuta consultas híbridas con vectorizer y reranking. Solo se deben enviar campos legibles a la interfaz.",
       q:"Complete la consulta.",
       codigo:`{
  "search": "8471.30 requisitos de importación",
  "filter": "clienteId {{0}} 'C-1042'",
  "vectorFilterMode": "{{1}}",
  "vectorQueries": [{
    "kind": "text",
    "text": "requisitos de importación para equipos de cómputo",
    "fields": "chunk_vector",
    "k": 50
  }],
  "queryType": "{{2}}",
  "semanticConfiguration": "cfg",
  "select": "{{3}}",
  "top": 10
}`,
       huecos:[{ops:["eq","like","=="],ok:0},{ops:["strictPostFilter","postFilter","preFilter"],ok:2},{ops:["semantic","full","vector"],ok:0},{ops:["title, chunk, pagina","chunk_vector","*"],ok:0}],
       exp:"Un filtro OData usa eq. preFilter evita falsos negativos, requisito crítico porque omitir un documento es un incidente. queryType semantic activa el reranking. select debe devolver campos legibles, no el vector. strictPostFilter además está en preview.",
       fuente:S+"vector-search-filters"},
      {d:5,tipo:"unica",esc:"Se deben incorporar las grabaciones de llamadas al mismo índice con el menor desarrollo posible.",
       q:"¿Qué enfoque corresponde?",
       ops:["Agregar la OCR skill al skillset de los documentos","Analizar el audio con prebuilt-audioSearch y cargar el resultado con la push API","Definir imageAction en generateNormalizedImages en el indexer de Blob Storage y agregar Text Merge skill","Crear una knowledge source remota que apunte al contenedor de audio"],ok:[1],
       exp:"prebuilt-audioSearch transcribe y resume conversaciones, y el resultado se puede preparar y cargar al índice. La ingesta multimodal nativa de AI Search cubre documentos con texto e imágenes, por lo que OCR e imageAction no transcriben audio. Una knowledge source remota no aplica a un contenedor de Blob, que se ingiere como fuente indexada.",
       fuente:CU+"concepts/prebuilt-analyzers"},
      {d:5,tipo:"multiple",esc:"Se diseña la extracción de las facturas para automatizar el registro.",
       q:"¿Qué acciones cumplen los requisitos?",
       ops:["Obtener la definición de prebuilt-invoice con GET y crear un analyzer propio con PUT","Activar estimateFieldSourceAndConfidence en el analyzer","Enviar a revisión humana los campos con confianza menor a 0.8, mostrando su source","Crear un analyzer con baseAnalyzerId prebuilt-invoice","Entrenar un modelo custom de Document Intelligence para cada proveedor"],ok:[0,1,2],
       exp:"Un prebuilt sirve de plantilla y copiarlo protege de cambios entre versiones. estimateFieldSourceAndConfidence entrega confianza y origen, que sustentan la revisión humana. Solo se puede derivar de los cuatro analyzers base. Entrenar por proveedor exige etiquetar muestras, lo que el requisito excluye.",
       fuente:CU+"concepts/prebuilt-analyzers"},
      {d:5,tipo:"sino",esc:"Se revisa el plan operativo del indexer y sus conexiones.",
       q:"Indique si cada afirmación es correcta.",
       afirm:[
        {t:"Un programa de 15 minutos es compatible con el mínimo admitido por los indexers.",ok:true},
        {t:"Blob Storage requiere habilitar manualmente la detección de cambios por fecha.",ok:false},
        {t:"Para eliminar los chunks de un documento borrado, la fuente necesita una dataDeletionDetectionPolicy.",ok:true},
        {t:"La managed identity del search service necesita Cognitive Services OpenAI User para llamar a la embedding skill.",ok:true}],
       exp:"El mínimo es de cinco minutos. Azure Storage tiene detección de cambios integrada, sin configuración manual. Los chunks de un padre eliminado solo se borran si una dataDeletionDetectionPolicy lo detecta. La skill de embeddings usa la identidad del search service, que requiere Cognitive Services OpenAI User.",
       fuente:S+"search-how-to-define-index-projections"},
      {d:2,tipo:"unica",esc:"En el piloto, el agente tiene conexión a la knowledge base, y las llamadas no devuelven errores. Sin embargo, responde con conocimiento general, sin citas y sin invocar la knowledge base.",
       q:"¿Qué se debe verificar primero?",
       ops:["Que allowed_tools incluya knowledge_base_retrieve y las instrucciones exijan usar la tool","Que la managed identity del proyecto tenga Search Index Data Contributor sobre el search service","Que el endpoint MCP use la versión estable 2026-04-01","Que retrievalReasoningEffort tenga el valor medium"],ok:[0],
       exp:"Si el agente no ancla sus respuestas, se debe confirmar la tool MCP con knowledge_base_retrieve y hacer explícitas las instrucciones. Search Index Data Contributor solo hace falta para escribir, y un fallo de permisos daría un 403. El endpoint MCP usa 2026-08-01-preview. Subir el razonamiento no ayuda si la tool no se invoca.",
       fuente:AG+"how-to/foundry-iq-connect"}
    ]});
})();
