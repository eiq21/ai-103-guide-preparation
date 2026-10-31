/* Módulo 3 · Calidad y seguridad. Contenido "A fondo", preguntas y caso de estudio. */
(function(){
  var F="https://learn.microsoft.com/en-us/azure/foundry/";
  var U={
    overview:F+"guardrails/guardrails-overview",
    puntos:F+"guardrails/intervention-points",
    crear:F+"guardrails/how-to-create-guardrails",
    defecto:F+"guardrails/default-safety-policies",
    shields:F+"openai/concepts/content-filter-prompt-shields",
    mcp:F+"agents/how-to/tools/model-context-protocol",
    gateway:F+"agents/how-to/tools/governance",
    procedencia:F+"responsible-ai/content-safety/provenance-disclosure",
    evaluadores:F+"concepts/built-in-evaluators",
    rag:F+"concepts/evaluation-evaluators/rag-evaluators",
    agente:F+"concepts/evaluation-evaluators/agent-evaluators",
    seguridad:F+"concepts/evaluation-evaluators/risk-safety-evaluators",
    custom:F+"concepts/evaluation-evaluators/custom-evaluators",
    nube:F+"observability/how-to/cloud-evaluation",
    resultados:F+"observability/how-to/cloud-evaluation-results",
    evalAgente:F+"observability/how-to/evaluate-agent",
    redteam:F+"concepts/ai-red-teaming-agent",
    monModelos:F+"foundry-models/how-to/monitor-models",
    trazas:F+"observability/how-to/trace-agent-setup",
    sensible:F+"observability/how-to/traces-sensitive-content",
    interacciones:F+"observability/how-to/cloud-evaluation-deployed-interactions",
    dashboard:F+"observability/how-to/how-to-monitor-agents-dashboard",
    cluster:F+"observability/how-to/cluster-analysis",
    gha:F+"how-to/evaluation-github-action",
    ciclo:F+"agents/concepts/development-lifecycle"
  };
  function tabla(cab,filas){
    return '<div class="tw"><table><thead><tr>'+cab.map(function(c){return '<th>'+c+'</th>'}).join("")+'</tr></thead><tbody>'+
      filas.map(function(f){return '<tr>'+f.map(function(c){return '<td>'+c+'</td>'}).join("")+'</tr>'}).join("")+'</tbody></table></div>';
  }
  function cod(s){
    return '<pre><code>'+s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")+'</code></pre>';
  }

  /* ---------- 3-1 Guardrails ---------- */
  EXTRA["3-1"]={secciones:[
    {t:"Matriz de aplicabilidad: modelos frente a agentes",html:
      '<p>Un guardrail puede asignarse a varios modelos y agentes, pero no todos sus controles se ejecutan en todos ellos. Un control no aplicable no produce error: simplemente no surte efecto. Los guardrails para agentes están en <b>preview</b> y solo cubren agentes de Foundry Agent Service, no otros agentes registrados en Foundry Control Plane.</p>'+
      tabla(["Elemento","Modelos","Agentes (preview)"],[
        ["Hate, Sexual, Self-harm, Violence","Sí","Sí"],
        ["User prompt attacks, Indirect attacks","Sí","Sí"],
        ["Protected material (texto y código)","Sí","Sí"],
        ["PII (preview), Task Adherence (preview)","Sí","Sí"],
        ["Spotlighting (preview), Groundedness (preview)","Sí","No"],
        ["Puntos Tool call y Tool response (preview)","No","Sí"],
        ["Acción Annotate","Sí","No"]
      ])+
      '<p>Groundedness detection (preview) en Azure OpenAI se retira el 30 de abril de 2027. La alternativa documentada es usar evaluaciones de Foundry o una validación de grounding propia.</p>'+
      '<h4>Cobertura real de las tools</h4><p>Tool call y Tool response exigen soporte de moderación en la propia tool. La documentación actual lista Azure AI Search, Azure Functions, OpenAPI, SharePoint Grounding, Fabric Data Agent, Bing Grounding, Bing Custom Search y Browser Automation. Para una tool fuera de la lista, como un servidor MCP, el control no tiene efecto y debe compensarse con restricciones y aprobaciones. Cada punto de intervención añade alrededor de 50 a 100 ms.</p>'},
    {t:"Prompt Shields y documentos no confiables",html:
      tabla(["Aspecto","User prompt attacks","Document attacks (Indirect attacks)"],[
        ["Otro nombre","Jailbreak risk detection (anterior)","XPIA"],
        ["Estado inicial","Activo","Inactivo: debe habilitarse"],
        ["Punto","User input","User input en modelos; Tool response en agentes (preview)"],
        ["Campo analizado","<code>user_prompts</code> / <code>userPrompt</code>","<code>documents</code>"]
      ])+
      '<p>En Chat Completions, la detección indirecta depende de un delimitador que separa el documento de la entrada directa. El contenido no revisado debe ir con JSON escaping.</p>'+
      cod('{"role":"user","content":"Resuma este correo. \\"\\"\\" <documents>\\nHola Jos\\\\u00E9...\\n</documents> \\"\\"\\""}')+
      '<p><b>Spotlighting</b> (preview, inactivo por defecto) codifica el documento en Base64 para marcarlo como menos confiable. Solo funciona con Chat Completions, aumenta los tokens y puede hacer que la respuesta mencione la codificación.</p>'+
      '<p>Prompt Shields no juzga si un contenido es dañino, veraz o está fundamentado. Sus modelos se entrenaron y evaluaron principalmente en inglés, por lo que conviene probar con ataques y contenido benigno en cada idioma. La API independiente de Azure AI Content Safety analiza un <code>userPrompt</code> y hasta cinco <code>documents</code>, devuelve <code>attackDetected</code> y deja la decisión de bloquear a la aplicación.</p>'},
    {t:"Configuración e interpretación de resultados",html:
      '<ul><li>En REST, un guardrail es una <b>RAI policy</b>. Se asigna al despliegue con <code>raiPolicyName</code>.</li>'+
      '<li>El encabezado <code>x-policy-id</code> sobrescribe el guardrail en una sola llamada. No está disponible para entradas con imágenes. Un nombre inexistente devuelve <code>InvalidContentFilterPolicy</code>.</li>'+
      '<li>Los guardrails predeterminados de Microsoft no se editan. Debe crearse uno personalizado.</li>'+
      '<li>Los controles de contenido dañino en entrada y salida no se eliminan: se sobrescriben.</li>'+
      '<li>Un guardrail asignado no se elimina hasta reasignar sus modelos y agentes.</li></ul>'+
      tabla(["Situación","Señal en la API"],[
        ["Entrada bloqueada","HTTP 400 con código <code>content_filter</code>"],
        ["Salida bloqueada","<code>finish_reason</code> igual a <code>content_filter</code>"],
        ["Detectado sin bloqueo","<code>detected: true</code> y <code>filtered: false</code>"]
      ])+
      '<p>El modo solo anotación en salidas de contenido dañino requiere aprobación de modified guardrails.</p>'},
    {t:"Gobernar agentes: supervisión, restricciones y tools",html:
      tabla(["Necesidad","Mecanismo","Detalle clave"],[
        ["Limitar tools MCP","<code>allowed_tools</code>","Lista no vacía. Omitirla o usar <code>[]</code> permite todas"],
        ["Aprobación en MCP","<code>require_approval</code>","<code>always</code> (defecto), <code>never</code>, o listas por tool"],
        ["Aprobación en function tools","<code>approval_mode</code> en Agent Framework","<code>always_require</code>; se reanuda en la misma sesión"],
        ["Detectar acciones desalineadas","Task Adherence (preview)","<code>taskRiskDetected</code> permite bloquear o escalar"],
        ["Políticas sobre tráfico MCP","AI gateway (preview)","Azure API Management; solo tools MCP nuevas sin managed OAuth"],
        ["Cumplimiento de la flota","Foundry Control Plane","Azure Policy, Defender y Purview"]
      ])+
      cod('tool = MCPTool(\n    server_label="reclamos",\n    server_url=URL_MCP,\n    allowed_tools=["consultar", "actualizar"],\n    require_approval={"always": ["actualizar"]},\n    project_connection_id=CONEXION,\n)')+
      '<p>Cuando una llamada requiere aprobación, la respuesta incluye un elemento <code>mcp_approval_request</code>. La aplicación revisa tool y argumentos, y envía un <code>mcp_approval_response</code> con el <code>approval_request_id</code> en la misma conversación.</p>'+
      '<p><b>Criterio de decisión:</b> las lecturas de bajo riesgo pueden ejecutarse sin aprobación, las escrituras y transacciones deben exigirla, y las acciones irreversibles requieren además divulgación y confirmación. La aprobación debe aplicarse fuera de las decisiones del modelo; una instrucción en el prompt no basta.</p>'},
    {t:"Auditoría y procedencia",html:
      tabla(["Evidencia requerida","Fuente"],[
        ["Qué hizo el agente en cada ejecución","Trazas en Application Insights"],
        ["Quién cambió despliegues o accesos","Categoría de log <b>Audit</b>, mediante diagnostic setting"],
        ["Quién aprobó una tool","Registro propio de aprobaciones y llamadas"],
        ["Qué política regía","Políticas versionadas en Foundry Control Plane"],
        ["Origen del contenido generado","Content Credentials (C2PA) y marcas de agua invisibles"]
      ])+
      '<p>Content Credentials adjunta metadatos firmados criptográficamente, lo que permite comprobar que no se alteraron. Las marcas de agua pueden sobrevivir cuando se eliminan los metadatos. La verificación se realiza con el sitio de detección o la Content Provenance Detection API.</p>'+
      '<p>La procedencia no prueba veracidad, autoría ni intención, y puede perderse al recortar, redimensionar, convertir o comprimir el archivo. La cobertura varía por modelo y modalidad.</p>'}
  ],preguntas:[
    {d:1,tipo:"sino",esc:"Litware Finanzas tiene un despliegue con el guardrail GR-Modelo, con Violence en High para entrada y salida. Su agente de asesoría usa ese despliegue y tiene asignado GR-Agente, con Violence en Low para User input y Output, sin controles en Tool call ni Tool response. GR-Agente incluye además controles de Groundedness y Spotlighting.",q:"Indique si cada afirmación es correcta.",
      afirm:[
        {t:"Las consultas del usuario al agente se analizan por Violence con nivel Low.",ok:true},
        {t:"El contenido que el agente envía a una tool se analiza por Violence con nivel High, heredado del despliegue.",ok:false},
        {t:"Los controles de Groundedness y Spotlighting no surten efecto en el agente, pero sí en un modelo que use GR-Agente.",ok:true},
        {t:"Otro agente sin guardrail propio que use el mismo despliegue queda protegido por GR-Modelo.",ok:true}
      ],
      exp:"El guardrail del agente reemplaza por completo al del modelo, de modo que la entrada usa Low y las tools quedan sin análisis de Violence porque GR-Agente no define controles en esos puntos. Groundedness y Spotlighting no aplican a agentes, aunque siguen vigentes para modelos con ese guardrail. Un agente sin guardrail personalizado hereda el de su despliegue.",fuente:U.overview},
    {d:1,tipo:"multiple",esc:"Proseware llama directamente a un despliegue por Chat Completions, sin agentes. Inserta el texto de correos y PDF de proveedores en el mensaje del usuario. Debe bloquear instrucciones ocultas antes de que el modelo las procese, y los textos contienen acentos y saltos de línea.",q:"¿Qué tres acciones deben realizarse?",
      ops:[
        "Asignar al despliegue un guardrail con Document attack en User input y acción Annotate and block.",
        "Encerrar el texto de cada documento en el delimitador de documentos dentro del mensaje.",
        "Aplicar JSON escaping al contenido no revisado antes de enviarlo.",
        "Agregar un control de Indirect attacks en Tool response para los documentos insertados.",
        "Subir Violence y Hate a High para aumentar la sensibilidad de Prompt Shields.",
        "Mover el texto de los proveedores al mensaje system para separarlo de la entrada del usuario."
      ],ok:[0,1,2],
      exp:"La detección de ataques en documentos está inactiva por defecto y, en llamadas a modelos, actúa en User input. Depende del delimitador y requiere JSON escaping en contenido no revisado. Tool response solo aplica a agentes. Los niveles de contenido dañino no alteran la sensibilidad de Prompt Shields. El mensaje system debe reservarse a instrucciones confiables.",fuente:U.crear},
    {d:1,tipo:"completar",esc:"Una aplicación de Northwind debe asignar un guardrail a un despliegue, aplicar uno más estricto en una sola llamada y reconocer cuándo se bloqueó una salida.",q:"Complete la configuración.",
      codigo:'# 1. Propiedad del despliegue en Azure Resource Manager\n{ "properties": { "{{0}}": "guardrail-finanzas" } }\n\n# 2. Sobrescritura por solicitud\ncurl --request POST --url "$URL" \\\n  --header "{{1}}: guardrail-estricto" --data @cuerpo.json\n\n# 3. Detección de una salida bloqueada\nif respuesta.choices[0].finish_reason == "{{2}}":\n    registrar_bloqueo()',
      huecos:[
        {ops:["raiPolicyName","guardrailName","contentFilterId","safetyPolicy"],ok:0},
        {ops:["x-ms-guardrail","x-policy-id","x-rai-policy","x-content-filter"],ok:1},
        {ops:["guardrail_blocked","length","content_filter","safety_stop"],ok:2}
      ],
      exp:"Un guardrail se representa como RAI policy y se asigna con raiPolicyName. El encabezado x-policy-id lo sobrescribe en esa llamada. Una salida filtrada se identifica con finish_reason igual a content_filter; length indica truncamiento por tokens, y los demás valores no existen.",fuente:U.crear},
    {d:1,tipo:"orden",esc:"Tailwind Traders incorpora un control contra inyección indirecta en un agente que consulta Azure AI Search. El cambio no debe afectar a producción hasta validarse.",q:"Ordene las acciones.",
      pasos:[
        "Crear un guardrail personalizado con Indirect attacks en Tool response y Annotate and block.",
        "Asignar el guardrail a un agente de no producción.",
        "Abrir Try in Playground y enviar consultas benignas y maliciosas representativas.",
        "Medir de nuevo el comportamiento tras los ajustes.",
        "Asignar el guardrail al agente de producción."
      ],
      sobran:["Editar Microsoft.DefaultV2 para añadir el control.","Cambiar la acción a Annotate para ver detecciones sin bloqueo en el agente."],
      exp:"La asignación cambia el comportamiento de inmediato, por lo que la prueba debe hacerse con un agente de no producción y repetirse tras cada ajuste. Los guardrails predeterminados no se editan, y los agentes no admiten la acción Annotate.",fuente:U.crear},
    {d:1,tipo:"unica",esc:"El agente de Fabrikam usa Azure AI Search y el servidor MCP de un socio. Un control de Indirect attacks en Tool response detiene las inyecciones llegadas por Search, pero no las del servidor MCP. El guardrail está asignado al agente y las funciones preview están activas.",q:"¿Qué medida responde mejor a la causa?",
      ops:[
        "Asignar el mismo guardrail al despliegue del modelo para extender el análisis a todas las tools.",
        "Tratar al servidor MCP como no confiable, restringir allowed_tools y exigir aprobación en operaciones de riesgo.",
        "Activar Spotlighting en el control para que el modelo desconfíe de las respuestas MCP.",
        "Añadir un control de User prompt attacks en Tool response para cubrir el servidor MCP."
      ],ok:[1],
      exp:"Los puntos de tool requieren soporte de moderación y MCP no figura entre las tools listadas, por lo que el control no actúa allí. Deben aplicarse restricciones y aprobaciones. El guardrail del modelo no cambia nada porque el del agente lo reemplaza. Spotlighting no aplica a agentes, y User prompt attacks solo se analiza en User input.",fuente:U.puntos},
    {d:1,tipo:"unica",esc:"Wingtip Publicidad genera imágenes con un modelo compatible con procedencia. Su área legal exige verificar que cada pieza fue generada con IA y comprobar que esa información no se alteró. Las piezas pasan por un proceso de compresión antes de publicarse.",q:"¿Qué enfoque cumple el requisito?",
      ops:[
        "Activar la categoría Audit en diagnostic settings y usarla como certificado de cada imagen.",
        "Aplicar un control de Protected material para marcar las imágenes generadas con IA.",
        "Verificar Content Credentials y marcas de agua con la API de detección, conservando el archivo original.",
        "Considerar la presencia de C2PA como prueba de autoría y de veracidad de la imagen."
      ],ok:[2],
      exp:"Content Credentials aporta metadatos firmados y las marcas de agua refuerzan la señal; ambos se verifican con el sitio o la API de detección. La compresión puede eliminar la procedencia, por lo que conviene conservar el original. Audit registra operaciones administrativas, Protected material detecta contenido protegido, y C2PA no demuestra autoría ni veracidad.",fuente:U.procedencia}
  ]};

  /* ---------- 3-2 Evaluación ---------- */
  EXTRA["3-2"]={secciones:[
    {t:"Arquitectura de una evaluación en la nube",html:
      '<p>Una <b>evaluation</b> es un contenedor que fija el esquema de datos y los <code>testing_criteria</code>. Cada <b>run</b> aporta una fuente de datos. Esa estructura hace comparables las ejecuciones. El proceso es asíncrono: el estado termina en <code>completed</code>, <code>failed</code> o <code>canceled</code>.</p>'+
      tabla(["Punto de partida","Tipo de data source"],[
        ["Dataset con consultas y respuestas","<code>jsonl</code>"],
        ["Consultas que un modelo o agente debe responder","<code>azure_ai_target_completions</code>"],
        ["Respuestas ya almacenadas, por ID","<code>azure_ai_responses</code> (solo <code>file_content</code>)"],
        ["Trazas de Application Insights (preview)","<code>azure_ai_traces</code>"],
        ["Pruebas adversariales","<code>azure_ai_red_team</code>"]
      ])+
      '<p>En <code>data_mapping</code>, <code>{{item.campo}}</code> apunta al dataset. <code>{{sample.output_text}}</code> entrega el texto generado y <code>{{sample.output_items}}</code> la salida estructurada con llamadas a tools.</p>'+
      cod('{\n  "type": "azure_ai_evaluator",\n  "name": "fundamentacion",\n  "evaluator_name": "builtin.groundedness",\n  "initialization_parameters": {"deployment_name": modelo},\n  "data_mapping": {\n    "context": "{{item.context}}",\n    "response": "{{item.response}}"\n  }\n}')+
      '<p>Cada fila admite hasta 2 MB y cada lote hasta 100.000 filas. Las evaluaciones del playground de agentes están activas por defecto y se facturan por consumo.</p>'},
    {t:"Entradas, juez y umbrales",html:
      tabla(["Evaluador","Entradas","¿Requiere deployment?","Resultado"],[
        ["Groundedness","<code>response</code> y <code>context</code>; <code>query</code> recomendado","Sí","1 a 5, umbral 3"],
        ["Relevance","<code>query</code>, <code>response</code>","Sí","1 a 5, umbral 3"],
        ["Retrieval","<code>query</code>, <code>context</code>","Sí","1 a 5, umbral 3"],
        ["Document Retrieval","<code>retrieval_ground_truth</code>, <code>retrieved_documents</code>","No","NDCG, XDCG, Fidelity, Holes"],
        ["Response Completeness (preview)","<code>ground_truth</code>, <code>response</code>","Sí","1 a 5, umbral 3"],
        ["Groundedness Pro (preview)","<code>query</code>, <code>response</code>, <code>context</code>","No","Aprobado o fallido"],
        ["Violence, Sexual, Self-Harm, Hate","<code>query</code>, <code>response</code> o <code>messages</code>","No","0 a 7, umbral 3"]
      ])+
      '<p><b>Atención a la dirección del umbral:</b> en calidad, se aprueba con una puntuación igual o superior al umbral. En contenido dañino, se aprueba con una severidad igual o inferior. Groundedness mide precisión, es decir, no fabricar. Response Completeness mide recall, es decir, no omitir.</p>'+
      '<p><b>Explicación:</b> los evaluadores con juez LLM devuelven <code>reason</code>, y algunos añaden <code>details</code>. Los evaluadores de seguridad usan modelos hospedados por Microsoft, y sus resultados agregados se expresan como <b>defect rate</b>.</p>'},
    {t:"Evaluadores de agente: sistema y proceso",html:
      tabla(["Enfoque","Pregunta","Evaluadores"],[
        ["Sistema","¿Se logró el resultado?","Task Completion, Task Adherence e Intent Resolution (preview); Task Navigation Efficiency"],
        ["Proceso","¿Cada paso fue correcto?","Tool Call Accuracy, Tool Selection, Tool Input Accuracy, Tool Output Utilization, Tool Call Success"]
      ])+
      '<p><b>Task Navigation Efficiency</b> requiere <code>expected_actions</code> y no usa juez. Sus modos son <code>exact_match</code>, <code>in_order_match</code> y <code>any_order_match</code>; los dos últimos admiten pasos adicionales.</p>'+
      '<p><b>Limitación de tools:</b> debe evitarse Tool Call Accuracy, Tool Input Accuracy, Tool Output Utilization, Tool Call Success y Groundedness si la conversación incluye Azure AI Search, Bing, SharePoint Grounding, Code Interpreter, Fabric Data Agent o Web Search. Una alternativa documentada es envolver esas tools como function tools definidas por el usuario.</p>'+
      '<p>Output Quality y Tool Use Quality (preview) agrupan varios evaluadores en una llamada al juez. El resultado principal pasa solo si pasan todos los componentes aplicables. Quality Grader figura como deprecated y ya no puede ejecutarse. Los evaluadores <b>rubric</b> (preview) puntúan dimensiones ponderadas de 1 a 5 y normalizan a 0-1, con umbral predeterminado 0,5.</p>'},
    {t:"Seguridad: evaluadores y red teaming",html:
      tabla(["Riesgo","Objetivo","Red teaming"],[
        ["Contenido dañino, Protected Materials, Code Vulnerability, Ungrounded Attributes","Modelos y agentes","Local y nube"],
        ["Indirect Attack (evaluador)","Solo modelos","En agentes, estrategia Indirect Jailbreak"],
        ["Prohibited Actions, Sensitive Data Leakage (preview)","Solo agentes","Solo nube"],
        ["Task Adherence","Solo agentes","Solo nube"]
      ])+
      '<p>El <b>AI Red Teaming Agent</b> usa PyRIT y los evaluadores de riesgo. Su métrica central es <b>Attack Success Rate (ASR)</b>: porcentaje de ataques exitosos sobre el total. Por tanto, un ASR bajo es lo deseable.</p>'+
      '<ul><li>Para Prohibited Actions se genera una taxonomía que debe revisarse y confirmarse antes del run.</li>'+
      '<li>Admite prompt agents y agentes hospedados con tools de Azure. No admite workflows, agentes externos, function tools ni Browser Automation.</li>'+
      '<li>Debe ejecutarse en un entorno <i>purple</i>: no productivo, con recursos similares a producción.</li>'+
      '<li>Los resultados pueden incluir falsos positivos y requieren revisión humana.</li>'+
      '<li>Groundedness Pro, Protected Material y red teaming tienen menos regiones disponibles.</li></ul>'},
    {t:"Evaluadores personalizados (preview)",html:
      tabla(["Tipo","Uso","Puntuación","Límites"],[
        ["Code-based","Reglas deterministas, formato, longitud","Función <code>grade()</code>, 0,0 a 1,0","Sin red, 256 KB, 2 minutos por llamada"],
        ["Prompt-based","Juicios subjetivos, como tono","Ordinal, continua o binaria","Requiere <code>deployment_name</code> y <code>threshold</code>"],
        ["Endpoint-based","Red, modelos propios, lógica compleja","JSON con <code>score</code>, <code>reason</code> y <code>status</code>","Respuesta en 30 segundos"]
      ])+
      cod('def grade(sample: dict, item: dict) -> float:\n    respuesta = item.get("response", "")\n    return 1.0 if "aviso legal" in respuesta.lower() else 0.0')+
      '<p>Si <code>grade()</code> lanza una excepción, el elemento queda con 0,0 y se marca como error. Aunque no llame a un LLM, el evaluador code-based exige <code>deployment_name</code> y <code>pass_threshold</code> para orquestar la ejecución.</p>'}
  ],preguntas:[
    {d:2,tipo:"unica",esc:"Relecloud tiene 500 consultas con etiquetas de relevancia asignadas por expertos a cada documento. Debe comparar búsqueda vectorial e híbrida con varios top_k y tamaños de chunk, obtener métricas de ranking y evitar un modelo juez.",q:"¿Qué evaluador debe usar?",
      ops:["Retrieval","Document Retrieval","Groundedness Pro","Response Completeness"],ok:[1],
      exp:"Document Retrieval compara resultados con etiquetas de relevancia, devuelve NDCG, XDCG y Fidelity, y no requiere deployment; es el indicado para un parameter sweep. Retrieval usa un juez LLM y se aplica cuando no hay ground truth. Groundedness Pro mide la respuesta frente al contexto, y Response Completeness compara la respuesta con ground truth.",fuente:U.rag},
    {d:2,tipo:"completar",esc:"Un equipo evalúa la versión 7 de un agente de soporte. El servicio debe enviar cada consulta al agente y puntuar sus llamadas a tools y el texto final.",q:"Complete la configuración.",
      codigo:'testing_criteria = [\n  {\n    "type": "azure_ai_evaluator",\n    "name": "tools",\n    "evaluator_name": "builtin.tool_call_accuracy",\n    "initialization_parameters": {"{{0}}": modelo},\n    "data_mapping": {\n      "query": "{{item.query}}",\n      "response": "{{1}}",\n      "tool_definitions": "{{item.tool_definitions}}",\n    },\n  },\n  {\n    "type": "azure_ai_evaluator",\n    "name": "violencia",\n    "evaluator_name": "builtin.violence",\n    "data_mapping": {\n      "query": "{{item.query}}",\n      "response": "{{2}}",\n    },\n  },\n]\n\nrun = client.evals.runs.create(\n  eval_id=evaluacion.id,\n  name="version-7",\n  data_source={\n    "type": "{{3}}",\n    "source": {"type": "file_id", "id": dataset.id},\n    "input_messages": plantilla,\n    "target": {"type": "azure_ai_agent", "name": "soporte", "version": "7"},\n  },\n)',
      huecos:[
        {ops:["deployment_name","model_endpoint","judge_id","connection_name"],ok:0},
        {ops:["{{item.response}}","{{sample.output_items}}","{{sample.output_text}}","{{item.tool_calls}}"],ok:1},
        {ops:["{{sample.output_text}}","{{item.context}}","{{sample.tool_definitions}}","{{item.ground_truth}}"],ok:0},
        {ops:["azure_ai_responses","jsonl","azure_ai_target_completions","azure_ai_red_team"],ok:2}
      ],
      exp:"Tool Call Accuracy usa un juez indicado en deployment_name y necesita la salida estructurada de sample.output_items. Violence espera texto, por lo que se mapea sample.output_text. El tipo azure_ai_target_completions genera las respuestas invocando el destino; azure_ai_responses evalúa respuestas ya existentes.",fuente:U.evalAgente},
    {d:2,tipo:"sino",esc:"Una ejecución usa umbrales predeterminados. Un elemento obtiene Violence 3, Groundedness 3 y Hate and Unfairness 5.",q:"Indique si cada afirmación es correcta.",
      afirm:[
        {t:"Violence aprueba, porque la severidad no supera el umbral.",ok:true},
        {t:"Groundedness aprueba, porque la puntuación alcanza el umbral.",ok:true},
        {t:"Hate and Unfairness aprueba, porque una puntuación mayor indica mejor resultado.",ok:false},
        {t:"builtin.violence necesita deployment_name en initialization_parameters.",ok:false}
      ],
      exp:"Los evaluadores de contenido dañino usan una escala de 0 a 7 y aprueban con severidad igual o inferior a 3, de modo que 5 falla. Los evaluadores RAG aprueban con 3 o más. Los evaluadores de seguridad usan modelos hospedados, por lo que no requieren deployment_name.",fuente:U.seguridad},
    {d:1,tipo:"multiple",esc:"Woodgrove Bank tiene un prompt agent que usa tools de Azure. Antes de lanzarlo, debe comprobar automáticamente si puede ejecutar acciones prohibidas según sus políticas o filtrar datos sensibles.",q:"¿Qué dos acciones son adecuadas?",
      ops:[
        "Ejecutar el AI Red Teaming Agent en la nube contra una versión del agente.",
        "Revisar y confirmar la taxonomía de acciones prohibidas antes de crear el run.",
        "Ejecutar el escaneo local en el agente de compilación para cubrir ambas categorías.",
        "Lanzar los ataques contra el agente de producción con datos reales de clientes.",
        "Considerar aprobado el agente cuando el Attack Success Rate sea cercano a 100%."
      ],ok:[0,1],
      exp:"Las categorías agénticas solo están disponibles en la nube y Prohibited Actions requiere confirmar una taxonomía. La ejecución local no las cubre. Se recomienda un entorno no productivo con datos sintéticos. ASR mide ataques exitosos, por lo que un valor alto indica mayor riesgo.",fuente:U.redteam},
    {d:2,tipo:"unica",esc:"Lucerne Publishing necesita comprobar en cada evaluación que una respuesta cite un identificador vigente. La validación debe consultar en tiempo real una API interna, cuya lógica ya se ejecuta en Azure Functions.",q:"¿Qué tipo de evaluador debe crear?",
      ops:["Code-based con grade()","Prompt-based binario","Endpoint-based","String Checker de Azure OpenAI"],ok:[2],
      exp:"El evaluador endpoint-based delega la puntuación en un servicio HTTP propio y admite acceso a red. El code-based se ejecuta en un sandbox sin red. El prompt-based depende del criterio de un LLM y no consulta la API. String Checker solo realiza validaciones de texto y patrones.",fuente:U.custom},
    {d:2,tipo:"orden",esc:"Un equipo automatiza una evaluación en la nube con el SDK de Foundry a partir de un dataset ya cargado.",q:"Ordene los pasos.",
      pasos:[
        "Definir data_source_config y testing_criteria con sus data_mapping.",
        "Crear la evaluación con client.evals.create.",
        "Iniciar la ejecución con client.evals.runs.create.",
        "Consultar el estado hasta que sea completed, failed o canceled.",
        "Recuperar output_items y report_url."
      ],
      sobran:["Aprovisionar compute propio para ejecutar los evaluadores."],
      exp:"El flujo define datos y evaluadores, crea la evaluación e inicia un run. Al ser asíncrono, debe consultarse el estado antes de leer resultados. La evaluación en la nube no requiere administrar compute.",fuente:U.resultados}
  ]};

  /* ---------- 3-3 Observabilidad y CI/CD ---------- */
  EXTRA["3-3"]={secciones:[
    {t:"Dos capas de telemetría",html:
      tabla(["Capa","Activación","Contenido","Uso"],[
        ["Métricas de Azure Monitor","Automática","<code>ModelRequests</code>, <code>InputTokens</code>, <code>OutputTokens</code>, <code>TimeToResponse</code>, <code>ProvisionedUtilization</code>","Alertas casi en tiempo real por despliegue"],
        ["Logs de recurso","Diagnostic setting","Categorías RequestResponse, Trace y Audit","Consultas KQL en Log Analytics"],
        ["Trazas de agente","Application Insights conectado","Spans, tools, tokens, duración","Depurar una ejecución"],
        ["Evaluaciones","Reglas o programaciones","Calidad y seguridad","Detectar regresiones"]
      ])+
      '<p>Se recomienda la categoría de métricas <b>Models</b>, que incluye todos los modelos del recurso, frente a la categoría Azure OpenAI. Un valor de Provisioned Utilization igual o superior a 100% produce errores 429. Si Log Analytics está vacío, debe revisarse el diagnostic setting y esperar hasta 15 minutos.</p>'+
      '<p><b>Referencias del panel de agentes (preview):</b> la latencia superior a 10 segundos sugiere throttling, tools complejas o problemas de red; una tasa de éxito inferior a 95% justifica investigar.</p>'},
    {t:"Tracing con OpenTelemetry",html:
      '<p>La opción recomendada es el <b>tracing server-side</b>: tras conectar Application Insights, Foundry registra prompt agents, hosted agents y workflows sin cambios de código. La instrumentación <b>client-side</b> se añade para observar la lógica propia. El tracing es GA para prompt y hosted agents; para workflows y agentes externos sigue en preview.</p>'+
      tabla(["Span o atributo","Registra"],[
        ["<code>invoke_agent</code>","Invocación de un agente; anidado indica otro agente llamado"],
        ["<code>invoke_workflow</code>","Flujo coordinado"],
        ["<code>plan</code>","Planificación o descomposición de tareas"],
        ["<code>execute_tool</code>","Ejecución de una tool"],
        ["<code>gen_ai.tool.call.arguments</code> y <code>.result</code>","Argumentos y resultado de la tool"]
      ])+
      '<p>Los spans se usan para atribuir la latencia a modelo o tool, y las conversaciones se localizan por Response ID o Trace ID. El portal permite consultar las trazas de los últimos 90 días, mientras que la retención y el costo dependen de Application Insights y Log Analytics. Para consultar telemetría se necesita Log Analytics Reader. Las convenciones GenAI de OpenTelemetry tienen estado Development y pueden cambiar.</p>'},
    {t:"Contenido sensible en las trazas",html:
      '<p>Desde el 30 de septiembre de 2026, los valores de <code>gen_ai.input.messages</code>, <code>gen_ai.output.messages</code>, <code>gen_ai.system_instructions</code>, las definiciones, argumentos y resultados de tools, y la explicación de evaluación se envían solo a <code>AppGenAIContent</code> en los datos nuevos. En <code>AppDependencies</code>, <code>AppTraces</code> y <code>AppEvents</code> queda un puntero, por lo que las consultas y alertas propias deben actualizarse.</p>'+
      '<ol><li>Establecer <code>AppGenAIContent</code> como tabla <b>Protected</b>, con acceso denegado por defecto.</li>'+
      '<li>Asignar <b>Privileged Monitoring Data Reader</b> en el recurso de Application Insights a las identidades autorizadas.</li>'+
      '<li>Mantener al resto con roles estándar: siguen viendo datos no sensibles.</li>'+
      '<li>Comprobar ambos perfiles.</li></ol>'+
      '<p>El feature flag <code>optOutProtectGenAISensitiveData</code> mantiene temporalmente el enrutamiento anterior y termina el 30 de septiembre de 2027. Para datos muy sensibles, además, debe minimizarse o redactarse el contenido antes de que llegue a la telemetría.</p>'},
    {t:"Monitoreo de agentes desplegados",html:
      tabla(["Requisito","Mecanismo"],[
        ["Calidad sobre tráfico real","<b>Continuous evaluation</b> con muestreo"],
        ["Drift respecto a una referencia","<b>Scheduled evaluation</b> con un dataset fijo"],
        ["Calidad de grounding","Groundedness, Relevance y Retrieval de forma recurrente"],
        ["Eventos de seguridad","Evaluadores de riesgo y red team scans (preview)"],
        ["Notificación","Alerts (preview) sobre latencia, tokens, puntuaciones y hallazgos"],
        ["Causa raíz","Trazas y cluster analysis"]
      ])+
      cod('regla = project_client.evaluation_rules.create_or_update(\n    id="calidad-produccion",\n    evaluation_rule=EvaluationRule(\n        display_name="Calidad en producción",\n        action=ContinuousEvaluationRuleAction(\n            eval_id=evaluacion.id, max_hourly_runs=100),\n        event_type=EvaluationRuleEventType.RESPONSE_COMPLETED,\n        filter=EvaluationRuleFilter(agent_name=agente.name),\n        enabled=True,\n    ),\n)')+
      '<p>La regla requiere que la identidad administrada del proyecto tenga <b>Foundry User</b> (antes Azure AI User). Si se omiten runs, debe revisarse <code>max_hourly_runs</code>, cuyo valor predeterminado es 100. <b>Intelligent sampling</b> selecciona trazas diversas sin costo de inferencia adicional.</p>'+
      '<p><b>Cluster analysis</b> (preview) agrupa muestras con problemas similares y propone acciones. Su resultado no se almacena: debe descargarse en CSV antes de salir de la página.</p>'+
      '<p>Un agente externo puede evaluarse por trazas (preview) si emite spans <code>invoke_agent</code> con las convenciones GenAI hacia Application Insights.</p>'},
    {t:"Integración con CI/CD",html:
      tabla(["Plataforma","Componente","Autenticación"],[
        ["GitHub Actions","<code>microsoft/ai-agent-evals@v3-beta</code>","Azure Login con OpenID Connect"],
        ["Azure DevOps","Tarea <code>AIAgentEvaluation@2</code>","Service connection de Azure Resource Manager"]
      ])+
      cod(`- uses: microsoft/ai-agent-evals@v3-beta
  with:
    azure-ai-project-endpoint: \${{ vars.PROYECTO }}
    deployment-name: \${{ vars.JUEZ }}
    agent-ids: "soporte:11,soporte:12"
    baseline-agent-id: "soporte:11"
    data-path: \${{ github.workspace }}/eval/dataset.json`)+
      '<p>El informe aparece en el resumen de la ejecución, con intervalos de confianza y comparación estadística por pares. Se recomienda no ejecutarla en cada commit para controlar costos.</p>'+
      '<p>Para una puerta programática con el SDK, el pipeline puede calcular la tasa de aprobación y fallar si no alcanza el mínimo:</p>'+
      cod('c = run.to_dict()["result_counts"]\nif c["passed"] / c["total"] < 0.85:\n    raise SystemExit("Puerta de calidad no superada")')+
      '<p><b>Versiones y publicación:</b> cada versión es inmutable y se referencia como <code>nombre:versión</code>, lo que permite dirigir solicitudes y revertir. En el modelo actual, el agente nace con identidad propia y endpoint estable, con propiedades como <code>agent_endpoint</code> y <code>version_selector</code>. <b>Agent Applications</b> es el modelo heredado: al publicar por esa vía, los permisos del proyecto no se transfieren. En ambos casos debe aplicarse mínimo privilegio a la identidad del agente.</p>'}
  ],preguntas:[
    {d:1,tipo:"unica",esc:"Adatum ve tokens y solicitudes en la pestaña Metrics de un despliegue. Necesita consultar con KQL cada solicitud, con su código de estado y latencia, pero Log Analytics no devuelve datos después de varias horas.",q:"¿Qué debe configurar?",
      ops:[
        "Un diagnostic setting en el recurso Foundry que envíe RequestResponse a Log Analytics.",
        "La conexión de Application Insights al proyecto para reemplazar los logs de recurso.",
        "El rol Monitoring Reader en el recurso para cada analista del equipo.",
        "La categoría de métricas Models dentro del explorador de métricas."
      ],ok:[0],
      exp:"Las métricas se recopilan automáticamente, pero los logs deben enrutarse con un diagnostic setting. Application Insights almacena trazas, no sustituye esos logs. Monitoring Reader permite ver métricas y no crea datos en Log Analytics. La categoría Models solo organiza métricas.",fuente:U.monModelos},
    {d:2,tipo:"sino",esc:"Trey Research conectó Application Insights a su proyecto. Usa un prompt agent y consulta trazas desde el portal y desde KQL. La tabla AppGenAIContent tiene protección Protected.",q:"Indique si cada afirmación es correcta.",
      afirm:[
        {t:"Las trazas server-side del agente no requieren cambios en el código.",ok:true},
        {t:"La retención de las trazas sigue la configuración de Application Insights y Log Analytics.",ok:true},
        {t:"Un usuario con solo Log Analytics Reader puede leer los prompts almacenados en AppGenAIContent.",ok:false},
        {t:"Una alerta nueva que necesite los valores de gen_ai.input.messages debe leerlos de AppGenAIContent, no de AppDependencies.",ok:true}
      ],
      exp:"El tracing server-side se activa al conectar Application Insights, y la retención depende de ese recurso. Una tabla protegida requiere Privileged Monitoring Data Reader. Para datos ingeridos desde el 30 de septiembre de 2026, los valores sensibles se leen de AppGenAIContent, salvo que se use el opt-out temporal.",fuente:U.sensible},
    {d:2,tipo:"unica",esc:"Un run de Alpine Ski House muestra 40% de fallos en varios evaluadores. El equipo debe identificar patrones recurrentes, obtener próximos pasos y compartir el análisis en una reunión al día siguiente.",q:"¿Qué debe hacer?",
      ops:[
        "Crear una alerta de Azure Monitor sobre la puntuación y esperar nuevas muestras.",
        "Generar un cluster analysis del run y descargarlo en CSV antes de salir de la página.",
        "Programar un red team scan sobre el agente para clasificar los fallos del run.",
        "Abrir la evaluación al día siguiente, porque el análisis queda guardado en el run."
      ],ok:[1],
      exp:"Cluster analysis agrupa muestras con problemas similares y ofrece recomendaciones, pero no se almacena, por lo que debe descargarse. Una alerta avisa sin explicar la causa. El red teaming busca vulnerabilidades adversariales y no analiza los fallos existentes.",fuente:U.cluster},
    {d:2,tipo:"completar",esc:"Se debe evaluar automáticamente cada respuesta completada de un agente, con un máximo de 100 ejecuciones por hora.",q:"Complete la regla.",
      codigo:'regla = project_client.evaluation_rules.create_or_update(\n    id="calidad-soporte",\n    evaluation_rule=EvaluationRule(\n        display_name="Calidad en producción",\n        action={{0}}(eval_id=evaluacion.id, {{1}}=100),\n        event_type=EvaluationRuleEventType.{{2}},\n        filter=EvaluationRuleFilter({{3}}=agente.name),\n        enabled=True,\n    ),\n)',
      huecos:[
        {ops:["ScheduledEvaluationAction","ContinuousEvaluationRuleAction","EvaluationScheduleTask","RecurrenceTrigger"],ok:1},
        {ops:["max_traces","rate_limit","max_hourly_runs","sample_rate"],ok:2},
        {ops:["RESPONSE_COMPLETED","RUN_STARTED","TRACE_INGESTED","CONVERSATION_CLOSED"],ok:0},
        {ops:["deployment_name","project_name","agent_id_list","agent_name"],ok:3}
      ],
      exp:"La evaluación continua se crea con EvaluationRule y ContinuousEvaluationRuleAction, se dispara con RESPONSE_COMPLETED y se limita con max_hourly_runs. El filtro usa agent_name. EvaluationScheduleTask y RecurrenceTrigger corresponden a la evaluación programada.",fuente:U.dashboard},
    {d:1,tipo:"orden",esc:"Contoso Pharma debe liberar nuevas versiones de un agente desde GitHub Actions, sin secretos de larga duración y comparándolas con la versión vigente antes de exponerlas.",q:"Ordene las acciones del pipeline.",
      pasos:[
        "Autenticar el flujo con Azure Login mediante OpenID Connect.",
        "Crear una nueva versión del agente desde la definición del repositorio.",
        "Ejecutar ai-agent-evals con ambas versiones en agent-ids y la vigente como baseline.",
        "Revisar puntuaciones, intervalos de confianza y comparación estadística.",
        "Exponer la nueva versión en el endpoint estable."
      ],
      sobran:["Guardar una API key del proyecto en el repositorio para la evaluación."],
      exp:"Primero se obtiene identidad con Entra ID. Después se crea la versión inmutable, se compara con la baseline y, solo si supera la revisión, se expone. La autenticación recomendada evita guardar secretos en el repositorio.",fuente:U.gha},
    {d:2,tipo:"multiple",esc:"Humongous Insurance ejecuta un agente LangChain en Azure Kubernetes Service, fuera de Foundry Agent Service. Quiere aplicar evaluadores de Foundry a sus interacciones reales mediante azure_ai_traces (preview), sin reproducir solicitudes.",q:"¿Qué tres requisitos deben cumplirse?",
      ops:[
        "Emitir spans invoke_agent con las convenciones GenAI de OpenTelemetry, incluidos los mensajes.",
        "Enviar las trazas al recurso de Application Insights conectado al proyecto.",
        "Conceder a la identidad administrada del proyecto el rol Reader sobre Application Insights.",
        "Confiar en el tracing server-side de Foundry, que captura este agente sin instrumentación.",
        "Reunir los response IDs y entregarlos a azure_ai_responses mediante file_id.",
        "Eliminar gen_ai.input.messages y gen_ai.output.messages de los spans evaluados."
      ],ok:[0,1,2],
      exp:"La evaluación de trazas lee spans invoke_agent desde Application Insights, por lo que el agente debe instrumentarse y enviar la telemetría al recurso conectado, y la identidad del proyecto debe poder leerla. El tracing server-side se limita a agentes hospedados en Foundry. azure_ai_responses atiende respuestas de agentes de Foundry y no admite file_id. Sin los mensajes, los evaluadores de calidad no devuelven puntuación.",fuente:U.interacciones}
  ]};

  /* ---------- Caso de estudio ---------- */
  CASOS.push({id:"caso-m3",modulo:3,t:"Tailspin Salud: agente de reembolsos",
    texto:'<h4>Contexto</h4><p>Tailspin Salud administra planes médicos. Su equipo crea un prompt agent en Foundry Agent Service llamado <code>reembolsos</code>. El agente consulta manuales y correos de prestadores en Azure AI Search, y usa un servidor MCP interno con las tools <code>consultar_reclamo</code>, <code>emitir_reembolso</code> y <code>eliminar_reclamo</code>. El proyecto está conectado a Application Insights. La versión 12 está en producción y la versión 13 es candidata.</p>'+
      '<h4>Requisitos técnicos</h4><ul>'+
      '<li>Las instrucciones ocultas en contenido devuelto por Azure AI Search deben detener al agente.</li>'+
      '<li>El agente no debe poder usar <code>eliminar_reclamo</code>.</li>'+
      '<li><code>consultar_reclamo</code> debe ejecutarse sin interrupciones. Cada <code>emitir_reembolso</code> requiere aprobación.</li>'+
      '<li>Las evaluaciones deben verificar la secuencia: buscar política, consultar reclamo y emitir reembolso. Se admiten pasos intermedios adicionales.</li>'+
      '<li>El pipeline usa GitHub Actions y no debe almacenar secretos de larga duración.</li></ul>'+
      '<h4>Requisitos de negocio</h4><ul>'+
      '<li>Solo el grupo de Cumplimiento puede leer prompts y respuestas en las trazas. Operaciones debe seguir viendo latencia y tokens.</li>'+
      '<li>Debe medirse la calidad sobre el tráfico real y detectarse cada semana cualquier desviación respecto a un dataset de referencia.</li>'+
      '<li>El equipo debe recibir avisos cuando bajen las puntuaciones.</li>'+
      '<li>La versión candidata debe compararse estadísticamente con la vigente, limitando el costo de evaluación.</li></ul>',
    preguntas:[
      {d:1,tipo:"unica",q:"¿Qué control debe añadirse al guardrail del agente para cumplir el primer requisito técnico?",
        ops:[
          "Riesgo Indirect attacks, punto Tool response, acción Annotate and block.",
          "Riesgo Indirect attacks, punto User input, acción Annotate.",
          "Riesgo User prompt attacks, punto Tool response, acción Annotate and block.",
          "Riesgo Groundedness, punto Output, acción Annotate and block."
        ],ok:[0],
        exp:"El contenido llega desde una tool, por lo que el punto correcto es Tool response. Azure AI Search admite moderación, y al detectar el ataque el agente se detiene. Los agentes no admiten Annotate, User prompt attacks solo se analiza en User input, y Groundedness no aplica a agentes.",fuente:U.puntos},
      {d:1,tipo:"completar",q:"Complete el código que configura el servidor MCP y procesa las aprobaciones.",
        codigo:'tool = MCPTool(\n    server_label="reclamos",\n    server_url=URL_MCP,\n    allowed_tools={{0}},\n    require_approval={{1}},\n    project_connection_id=CONEXION,\n)\n\nfor item in respuesta.output:\n    if item.type == "{{2}}" and es_aprobado(item):\n        aprobaciones.append(McpApprovalResponse(\n            type="mcp_approval_response",\n            approve=True,\n            {{3}}=item.id,\n        ))',
        huecos:[
          {ops:['[]','["consultar_reclamo", "emitir_reembolso"]','["eliminar_reclamo"]','"all"'],ok:1},
          {ops:['"never"','"always"','{"always": ["emitir_reembolso"]}','{"never": ["emitir_reembolso"]}'],ok:2},
          {ops:["mcp_approval_request","mcp_call","tool_call","function_call"],ok:0},
          {ops:["response_id","tool_call_id","conversation_id","approval_request_id"],ok:3}
        ],
        exp:"allowed_tools debe ser una lista no vacía: el valor [] permite todas las tools. Con {\"always\": [...]} solo emitir_reembolso exige aprobación, mientras que \"always\" interrumpiría también las consultas. La solicitud llega como mcp_approval_request y se responde con approval_request_id en la misma conversación.",fuente:U.mcp},
      {d:2,tipo:"sino",q:"El equipo prepara la evaluación del agente. Indique si cada afirmación es correcta.",
        afirm:[
          {t:"Tool Call Accuracy debe evitarse si las conversaciones evaluadas incluyen llamadas a Azure AI Search en su forma integrada.",ok:true},
          {t:"Envolver esa búsqueda como function tool definida por el usuario es una alternativa documentada.",ok:true},
          {t:"Task Navigation Efficiency con in_order_match cumple el requisito de la secuencia.",ok:true},
          {t:"Task Navigation Efficiency requiere un deployment como juez.",ok:false}
        ],
        exp:"Azure AI Search tiene soporte limitado en varios evaluadores de tools, y envolverla como function tool es la alternativa indicada. in_order_match exige los pasos en orden y admite pasos adicionales. Task Navigation Efficiency compara con expected_actions y no necesita deployment_name.",fuente:U.agente},
      {d:1,tipo:"unica",q:"¿Qué configuración cumple el requisito de acceso a las trazas?",
        ops:[
          "Asignar Log Analytics Reader a Cumplimiento y registrar optOutProtectGenAISensitiveData.",
          "Asignar Foundry Owner a Cumplimiento y retirar a Operaciones del proyecto de Foundry.",
          "Proteger AppGenAIContent y asignar Privileged Monitoring Data Reader a Cumplimiento.",
          "Desconectar Application Insights y entregar a Cumplimiento exportaciones de los diálogos."
        ],ok:[2],
        exp:"AppGenAIContent concentra el contenido sensible. Al protegerla, solo quienes tengan Privileged Monitoring Data Reader pueden leerlo, y Operaciones conserva la telemetría no sensible con roles estándar. El opt-out mantiene el contenido en las tablas existentes. Foundry Owner no es el control de esa tabla, y desconectar Application Insights elimina el monitoreo.",fuente:U.sensible},
      {d:1,tipo:"multiple",q:"¿Qué tres elementos cumplen los requisitos de monitoreo?",
        ops:[
          "Continuous evaluation con muestreo del tráfico real.",
          "Evaluación programada semanal con el dataset de referencia.",
          "Alertas sobre las puntuaciones de evaluación.",
          "Cluster analysis semanal como mecanismo de medición automática.",
          "Benchmarks del catálogo de modelos ejecutados sobre datos públicos."
        ],ok:[0,1,2],
        exp:"La evaluación continua mide tráfico real, la programada con un dataset fijo detecta drift y las alertas notifican las caídas. Cluster analysis es un análisis bajo demanda de runs completados, y los benchmarks ayudan a elegir un modelo, no a vigilar el agente.",fuente:F+"concepts/observability"},
      {d:1,tipo:"unica",q:"¿Qué diseño de pipeline cumple los requisitos de CI/CD y de costo?",
        ops:[
          "Ejecutar ai-agent-evals en cada commit, con una API key en GitHub Secrets y agent-ids reembolsos:13.",
          "Ejecutar ai-agent-evals al fusionar en main, con OIDC, agent-ids reembolsos:12,reembolsos:13 y baseline reembolsos:12.",
          "Ejecutar ai-agent-evals al fusionar en main, con OIDC y solo agent-ids reembolsos:13.",
          "Ejecutar a diario un red team scan en producción y publicar reembolsos:13 si no hay hallazgos."
        ],ok:[1],
        exp:"Indicar ambas versiones habilita la comparación estadística, y baseline-agent-id fija la referencia. OIDC evita secretos de larga duración, y limitar los disparadores reduce costos. Evaluar solo la candidata no compara, y el red teaming no mide la regresión de calidad.",fuente:U.gha}
    ]});
})();
