/* Módulo 2: contenido a fondo, preguntas de nivel examen y caso de estudio. */
(function(){
var L="https://learn.microsoft.com/en-us/";
var F=L+"azure/foundry/";
var A=L+"agent-framework/";
function tabla(cab,filas){
  return '<div class="tw"><table><thead><tr>'+cab.map(function(c){return '<th>'+c+'</th>'}).join("")+'</tr></thead><tbody>'+
    filas.map(function(f){return '<tr>'+f.map(function(c){return '<td>'+c+'</td>'}).join("")+'</tr>'}).join("")+'</tbody></table></div>';
}
function codigo(t){return '<pre><code>'+t.replace(/&/g,"&amp;").replace(/</g,"&lt;")+'</code></pre>'}

/* ---------- 2-1 ---------- */
EXTRA["2-1"]={secciones:[
{t:"Elegir SDK y endpoint",html:
 '<p>La decisión depende de las capacidades requeridas, no del lenguaje. Un recurso Foundry ofrece todos estos endpoints; un recurso Azure OpenAI solo ofrece <code>/openai/v1</code>.</p>'+
 tabla(["SDK","Endpoint","Cuándo usarlo"],[
  ["Foundry SDK (<code>azure-ai-projects&gt;=2.3.0</code>)","<code>https://&lt;recurso&gt;.services.ai.azure.com/api/projects/&lt;proyecto&gt;</code>","Agentes, evaluaciones, conexiones y tools de la plataforma"],
  ["Agent Framework (<code>agent-framework-foundry</code>)","Responses API del proyecto, mediante <code>FoundryChatClient</code>","Hosted agents y sistemas multiagente en código"],
  ["OpenAI SDK","<code>https://&lt;recurso&gt;.openai.azure.com/openai/v1</code>","Máxima compatibilidad, menor latencia y embeddings"],
  ["SDK de Foundry Tools","Endpoint propio de cada servicio","Vision, Speech, Language y servicios similares"]])+
 '<p>El proyecto usa dos clientes. <b>Project client</b> atiende operaciones propias de Foundry, como conexiones o agentes. El <b>cliente compatible con OpenAI</b>, que devuelve <code>get_openai_client()</code>, ejecuta respuestas, conversaciones y evaluaciones. Las API keys funcionan en <code>/openai/v1</code>. En producción conviene una credencial específica, como <code>ManagedIdentityCredential</code>, en lugar de <code>DefaultAzureCredential</code>, para evitar sondeos innecesarios.</p>'},
{t:"Consumir cada familia de modelos",html:
 tabla(["Familia","Ejemplos","Consideración clave"],[
  ["LLM y razonamiento","<code>gpt-5.4</code>, <code>gpt-5.5</code>","Los tokens de razonamiento se facturan como salida"],
  ["Modelos pequeños","<code>gpt-5.4-mini</code>, <code>gpt-5.4-nano</code>","Menor costo y latencia en tareas acotadas"],
  ["En dispositivo","Foundry Local con Phi, Mistral o Qwen","Sin conexión, sin suscripción de Azure y un solo usuario"],
  ["Código","<code>gpt-5.3-codex</code>","La CLI de Codex en Azure usa <code>wire_api=\"responses\"</code>"],
  ["Multimodales","Modelos con visión","<code>image_url</code> admite <code>detail</code>: <code>low</code>, <code>high</code> o <code>auto</code>"]])+
 '<p>El nombre del modelo varía con el tiempo; el examen premia el criterio. Global Standard es el punto de partida, Data Zone limita el procesamiento a una zona y Batch reduce 50 % el costo de trabajos asíncronos. <b>Instant access</b> (preview) permite llamar a modelos admitidos sin crear un despliegue.</p>'},
{t:"Dos formas de ejecutar un turno",html:
 codigo(`# Sin agente persistente: el modelo se indica en cada llamada
openai = project.get_openai_client()
r = openai.responses.create(model="gpt-5-mini", input="Resume el aviso")

# Con agente: el cliente queda vinculado por nombre
openai = project.get_openai_client(agent_name="siniestros")
r = openai.responses.create(conversation=conv.id, input="Hola")

# Con un cliente sin vincular, se referencia en la solicitud
r = openai.responses.create(
    input="Hola",
    extra_body={"agent_reference": {"name": "siniestros",
                                    "type": "agent_reference"}},
)`)+
 '<p>Con <code>stream=True</code>, un error a mitad del flujo no cambia el HTTP 200: llega como un evento <code>error</code>. Por eso el código debe inspeccionar los eventos. El modo <code>background</code> sirve para operaciones largas: la respuesta se consulta hasta que termina.</p>'}
],preguntas:[
{d:2,tipo:"unica",esc:"Proseware mantiene una aplicación RAG propia escrita con el OpenAI SDK. Solo usa modelos de OpenAI, genera embeddings y no necesita tools de Foundry. La prioridad es la menor latencia con el mínimo cambio de código.",
 q:"¿Qué configuración de cliente corresponde?",
 ops:["OpenAI SDK contra https://<recurso>.openai.azure.com/openai/v1","AIProjectClient contra el endpoint del proyecto y get_openai_client()","FoundryChatClient de Agent Framework contra el endpoint del proyecto","Un hosted agent que exponga el protocolo Responses"],ok:[0],
 exp:"La documentación recomienda el OpenAI SDK para máxima compatibilidad, menor latencia y embeddings. El cliente de proyecto y FoundryChatClient aportan tools y datos de proyecto que aquí no se necesitan, y exigen más cambios. Un hosted agent agregaría cómputo y despliegue sin beneficio.",
 fuente:F+"how-to/develop/sdk-overview"},
{d:2,tipo:"completar",esc:"Una aplicación debe conectarse a un proyecto de Foundry sin claves y hacer una llamada directa a un despliegue llamado gpt-5-mini.",
 q:"Complete el código con azure-ai-projects 2.x.",
 codigo:`from azure.ai.projects import {{0}}
from azure.identity import DefaultAzureCredential

project = AIProjectClient(
    endpoint="https://<recurso>.services.ai.azure.com/api/projects/<proyecto>",
    credential={{1}}(),
)
openai = project.{{2}}()
response = openai.{{3}}.create(
    model="gpt-5-mini",
    input="Resume la política de devoluciones",
)
print(response.{{4}})`,
 huecos:[{ops:["AIProjectClient","AgentsClient","OpenAI","FoundryChatClient"],ok:0},
  {ops:["DefaultAzureCredential","AzureKeyCredential","ApiKeyCredential","get_bearer_token_provider"],ok:0},
  {ops:["get_openai_client","get_azure_openai_client","inference.get_client","connect_openai"],ok:0},
  {ops:["responses","threads","runs","assistants"],ok:0},
  {ops:["output_text","choices[0].text","content","message"],ok:0}],
 exp:"AIProjectClient recibe el endpoint del proyecto y una credencial de Entra. get_openai_client() entrega el cliente compatible, responses.create ejecuta la llamada y output_text contiene el texto. threads y runs pertenecen a la API clásica, y AzureKeyCredential no cumple el requisito sin claves.",
 fuente:F+"how-to/develop/sdk-overview"},
{d:2,tipo:"sino",esc:"Un equipo revisa una aplicación creada con azure-ai-projects 2.x y prepara su paso a producción.",
 q:"Indique si cada afirmación es correcta.",
 afirm:[{t:"Un recurso Azure OpenAI ofrece el endpoint /api/projects/<proyecto> además de /openai/v1.",ok:false},
  {t:"La versión 1.x de azure-ai-projects corresponde a Foundry (new), y la 2.x a Foundry (classic).",ok:false},
  {t:"Las API keys funcionan en el endpoint /openai/v1.",ok:true},
  {t:"El cliente de proyecto se usa para operaciones propias de Foundry, como consultar conexiones.",ok:true}],
 exp:"Un recurso Azure OpenAI solo ofrece /openai/v1. La versión 2.x corresponde a Foundry (new) y la 1.x a Foundry (classic). Las API keys se aceptan en /openai/v1. Las conexiones y las propiedades del proyecto corresponden al project client.",
 fuente:F+"how-to/develop/sdk-overview"},
{d:2,tipo:"multiple",esc:"Wide World Importers tiene dos cargas. La primera es una app de inspección para tabletas en almacenes sin conexión, cuyos datos no deben salir del dispositivo. La segunda genera dos millones de descripciones de producto cada noche, con entrega en 24 horas y al menor costo.",
 q:"¿Qué dos opciones se deben elegir?",
 ops:["Modelo pequeño con Foundry Local en la tableta","Despliegue Global Batch para las descripciones","Despliegue Global Provisioned para las descripciones","Model router para la app de inspección","Global Standard para la app de inspección"],ok:[0,1],
 exp:"Foundry Local ejecuta la inferencia en el dispositivo y funciona sin conexión. Global Batch reduce 50 % el costo y su objetivo es de 24 horas. Provisioned reserva capacidad y no minimiza el costo. Model router y Global Standard requieren conexión con Azure.",
 fuente:F+"foundry-models/concepts/deployment-types"},
{d:2,tipo:"orden",esc:"Una persona ya tiene el rol Foundry User y un modelo desplegado. Debe crear un prompt agent por código y mantener una conversación de dos turnos.",
 q:"Ordene las acciones.",
 pasos:["Instalar azure-ai-projects>=2.3.0 e iniciar sesión con az login","Crear AIProjectClient con el endpoint del proyecto y una credencial","Llamar a agents.create_version con PromptAgentDefinition","Obtener el cliente con get_openai_client(agent_name=...) y crear la conversación con conversations.create()","Llamar dos veces a responses.create con el mismo conversation.id"],
 sobran:["Crear un thread y un run con la API clásica","Publicar el agente en Teams para obtener un endpoint"],
 exp:"Primero se prepara el entorno y luego se crea el cliente, porque la definición del agente se envía a través de él. Después se obtiene el cliente vinculado y se reutiliza el identificador de conversación. Threads y runs son de la API clásica, y publicar no es necesario para invocar por código.",
 fuente:F+"agents/quickstarts/prompt-agent"}
]};

/* ---------- 2-2 ---------- */
EXTRA["2-2"]={secciones:[
{t:"Ajuste según el tipo de modelo",html:
 '<p>Las técnicas no se aplican por igual. La guía de prompt engineering advierte que no se recomienda para modelos de razonamiento como <code>gpt-5</code> y la serie o.</p>'+
 tabla(["Aspecto","Sin razonamiento","Con razonamiento"],[
  ["Control principal","<code>temperature</code> o <code>top_p</code>","<code>reasoning_effort</code> y <code>text.verbosity</code>"],
  ["Límite de salida","<code>max_tokens</code> en modelos clásicos","<code>max_output_tokens</code> en Responses; <code>max_completion_tokens</code> en Chat Completions"],
  ["Pasos intermedios","Chain of thought en el prompt","Objetivo, restricciones y contrato de salida; el resumen se pide con <code>reasoning.summary</code>"],
  ["Rol del prompt","<code>system</code>","<code>developer</code>, o <code>system</code> en modelos recientes, sin combinar ambos"]])+
 '<p>Salvo excepciones documentadas, como GPT-6 Astra, los modelos de razonamiento no admiten <code>temperature</code>, <code>top_p</code>, <code>presence_penalty</code>, <code>frequency_penalty</code>, <code>logprobs</code>, <code>top_logprobs</code>, <code>logit_bias</code> ni <code>max_tokens</code>. Extraer el razonamiento en bruto por otras vías no está admitido y puede infringir la política de uso.</p>'+
 '<p>El límite de salida incluye los tokens de razonamiento. Si se agota, la respuesta llega con <code>status: "incomplete"</code>, quizá sin texto visible, y aun así se paga la entrada y el razonamiento. Microsoft sugiere reservar al menos 25 000 tokens al explorar una carga nueva.</p>'},
{t:"Reglas de structured outputs",html:
 codigo(`class Aviso(BaseModel):
    poliza: str
    fecha: str
    gravedad: str | None  # opcional: admite null, pero sigue siendo requerido

r = openai.responses.parse(
    model="gpt-5-mini",
    input=texto,
    text_format=Aviso,
)
print(r.output_parsed)`)+
 '<ul><li>En Responses el esquema va en <code>text.format</code>; en Chat Completions, en <code>response_format</code>.</li><li>Todos los campos deben ser <code>required</code> y cada objeto debe declarar <code>additionalProperties: false</code>.</li><li>Límites: 100 propiedades y cinco niveles de anidación.</li><li>La raíz no puede ser <code>anyOf</code>.</li><li>No se admiten <code>pattern</code>, <code>format</code>, <code>minimum</code>, <code>maxLength</code> ni <code>minItems</code>, entre otros. Esas reglas se validan en la aplicación.</li><li>Con <code>strict: true</code> en funciones, <code>parallel_tool_calls</code> debe ser <code>false</code>.</li></ul>'+
 '<p>La guía indica que structured outputs no se admite en Foundry Agent Service, aunque <code>PromptAgentDefinition</code> expone <code>text</code>. Conviene validar este punto en el entorno concreto.</p>'},
{t:"Reflexión y autocrítica",html:
 '<p>La reflexión separa <b>generar</b> de <b>evaluar</b>. Un segundo agente revisa contra criterios y el ciclo termina con una condición explícita.</p>'+
 codigo(`workflow = GroupChatBuilder(
    participants=[redactor, revisor],
    selection_func=alternar,
    termination_condition=lambda conv: len(conv) >= 6,
).build()`)+
 '<p>El límite protege costo y latencia. En modelos de razonamiento se indica qué significa terminar y cómo verificar el trabajo. Dos técnicas reducen fabricaciones: pedir citas junto al texto que respaldan y ofrecer una salida, como responder <i>not found</i> si falta el dato.</p>'},
{t:"Orquestar varios modelos",html:
 '<p><b>Model router</b> se despliega como un modelo y elige el modelo subyacente por solicitud.</p>'+
 tabla(["Modo","Comportamiento"],[["Balanced (predeterminado)","Margen de calidad pequeño y elige el más económico"],["Cost","Margen mayor para ahorrar más"],["Quality","Máxima calidad, sin considerar el costo"]])+
 '<p>El <b>model subset</b> limita los modelos permitidos y también define el conjunto de failover, por lo que conviene incluir al menos dos. La ventana de contexto efectiva es la del modelo más pequeño. La decisión se basa solo en el texto, y no procesa audio.</p>'}
],preguntas:[
{d:2,tipo:"unica",esc:"Trey Research cambia un despliegue de gpt-4o-mini por gpt-5-mini. La aplicación usa Chat Completions con temperature=0.2 y max_tokens=800. Tras el cambio, las solicitudes devuelven error de parámetro no admitido.",
 q:"¿Qué ajuste resuelve el problema con el menor cambio funcional?",
 ops:["Eliminar temperature, sustituir max_tokens por max_completion_tokens y ajustar reasoning_effort si hace falta","Sustituir temperature por top_p=0.2 y conservar max_tokens","Agregar presence_penalty=0 y reducir max_tokens","Mantener los parámetros y usar la Responses API con max_tokens"],ok:[0],
 exp:"gpt-5-mini es un modelo de razonamiento: no admite temperature, top_p ni max_tokens. En Chat Completions el límite es max_completion_tokens y el comportamiento se regula con reasoning_effort. top_p y presence_penalty tampoco se admiten, y Responses usa max_output_tokens.",
 fuente:F+"openai/how-to/reasoning"},
{d:2,tipo:"completar",esc:"Un servicio de Python debe convertir correos en un objeto validado con Pydantic mediante la Responses API.",
 q:"Complete el código.",
 codigo:`from pydantic import {{0}}

class Pedido(BaseModel):
    numero: str
    importe: float
    urgente: bool

r = openai.responses.{{1}}(
    model="gpt-5-mini",
    input=correo,
    {{2}}=Pedido,
)
pedido = r.{{3}}`,
 huecos:[{ops:["BaseModel","TypedModel","Schema","Field"],ok:0},
  {ops:["parse","create_json","validate","format"],ok:0},
  {ops:["text_format","response_format","json_schema","output_schema"],ok:0},
  {ops:["output_parsed","output_text","parsed","choices[0].message.parsed"],ok:0}],
 exp:"En la Responses API, responses.parse recibe el modelo Pydantic en text_format y deja el objeto en output_parsed. response_format y choices[0].message.parsed corresponden a Chat Completions. output_text devolvería texto sin convertir.",
 fuente:F+"openai/how-to/structured-outputs"},
{d:2,tipo:"sino",esc:"Una aseguradora diseña esquemas estrictos para extraer datos de pólizas.",
 q:"Indique si cada afirmación es correcta.",
 afirm:[{t:"Para que un campo sea opcional en modo estricto, se le permite null y se mantiene en required.",ok:true},
  {t:"La palabra clave pattern garantiza el formato de un número de póliza en la salida estricta.",ok:false},
  {t:"La raíz del esquema puede ser anyOf si cada rama es un objeto.",ok:false},
  {t:"Un esquema admite hasta cinco niveles de anidación.",ok:true},
  {t:"JSON mode garantiza JSON válido, pero no la adherencia a un esquema.",ok:true}],
 exp:"La opcionalidad se emula con un tipo que admite null. pattern no se admite en structured outputs, por lo que el formato se valida en la aplicación. La raíz no puede ser anyOf. El límite es de cinco niveles y 100 propiedades. JSON mode solo asegura JSON válido.",
 fuente:F+"openai/how-to/structured-outputs"},
{d:2,tipo:"unica",esc:"Woodgrove Bank usa gpt-5.4 en la Responses API para analizar contratos. Auditoría necesita entender cómo se llegó a cada conclusión, sin infringir las políticas del servicio ni degradar el modelo.",
 q:"¿Qué se debe implementar?",
 ops:["Solicitar reasoning.summary y guardar el resumen con la respuesta","Agregar al prompt la instrucción de mostrar todo el razonamiento interno","Cambiar a un modelo sin razonamiento y pedir chain of thought en cada prompt","Leer los tokens de output_tokens_details.reasoning_tokens y reconstruir el razonamiento"],ok:[0],
 exp:"reasoning.summary es la vía admitida para obtener un resumen del razonamiento. Intentar extraer el razonamiento en bruto no está admitido y puede infringir la política de uso. Cambiar de modelo degrada el análisis. reasoning_tokens solo informa un conteo, no contenido.",
 fuente:F+"openai/how-to/reasoning"},
{d:2,tipo:"multiple",esc:"Litware atiende un gran volumen de consultas sencillas y algunas muy complejas. Quiere el mayor ahorro posible. Cumplimiento solo autoriza tres modelos, y una caída de uno de ellos no debe interrumpir el servicio.",
 q:"¿Qué dos configuraciones de model router corresponden?",
 ops:["Routing mode Cost","Model subset con los tres modelos autorizados","Routing mode Quality","Model subset con un único modelo autorizado","Desplegar por separado cada modelo OpenAI del pool"],ok:[0,1],
 exp:"Cost amplía el margen de calidad para elegir modelos más económicos. El subset limita el enrutamiento a modelos aprobados y actúa como conjunto de failover, que requiere al menos dos. Quality ignora el costo, un subset de un modelo no tiene alternativa, y los modelos OpenAI admitidos no requieren despliegues propios.",
 fuente:F+"openai/concepts/model-router"}
]};

/* ---------- 2-3 ---------- */
EXTRA["2-3"]={secciones:[
{t:"Matriz de decisión ampliada",html:
 tabla(["Criterio","Prompt agent","Voice-based (preview)","Hosted agent","Responses API efímera"],[
  ["Código de runtime","Ninguno","Ninguno para la orquestación de voz","Propio","Propio, en la app"],
  ["Cómputo","Gestionado","Gestionado","Contenedor gestionado por Foundry","El de la aplicación"],
  ["Costo","Inferencia y tools","Voice Live y modelo","Inferencia, tools y cómputo","Inferencia y tools"],
  ["Recurso en Foundry","Sí, versionado","Sí, versionado","Sí, versión inmutable","No"],
  ["Copilot harness y optimizer","Sí (preview)","No indicado","Optimizer sí; harness no aplica","No"]])+
 '<p>Los patrones efímero y hosted son <b>complementarios</b>: el mismo código de Agent Framework puede ejecutarse dentro de la app y publicarse como hosted agent. El <b>Microsoft Copilot harness</b> (preview) no crea otro tipo de agente: sigue siendo un prompt agent, exige <code>conversation</code> en cada llamada, no admite <code>previous_response_id</code> y rechaza <code>strict: true</code> en funciones.</p>'},
{t:"Hosted agents por dentro",html:
 tabla(["Protocolo","Escenario","Estado de sesión"],[
  ["Responses","Chat, RAG, tools y <code>background: true</code>","Historial gestionado por conversation ID"],
  ["Invocations","Webhooks, JSON arbitrario, AG-UI","Session ID; el código gestiona el estado"],
  ["Invocations (WebSocket)","Voz y streaming bidireccional","Conexión persistente"],
  ["Activity","Teams y Microsoft 365","Puente automático desde Responses"],
  ["A2A","Delegación entre agentes","Endpoint <code>/protocols/a2a</code>"]])+
 '<ul><li><b>Aislamiento:</b> sandbox con aislamiento de VM por sesión; <code>$HOME</code> y <code>/files</code> persisten.</li><li><b>Tamaños:</b> 0.5 vCPU/1 GiB, 1 vCPU/2 GiB y 2 vCPU/4 GiB.</li><li><b>Inactividad:</b> de 2 a 240 minutos, 15 de forma predeterminada. Tras 30 días inactiva, la sesión se elimina.</li><li><b>Costo:</b> CPU y memoria se definen por sesión y se facturan durante las sesiones activas, de modo que el sobredimensionamiento se multiplica por la concurrencia. Si los picos sostenidos superan cerca de 70 %, se aumenta la asignación en otra versión.</li><li><b>Identidad:</b> la identidad Entra dedicada del agente se usa en runtime; la identidad del proyecto atiende operaciones de plataforma, como leer del registro. Los accesos externos se conceden con RBAC a la del agente.</li></ul>'+
 '<p>Los secretos no se colocan en imágenes ni en variables de entorno. Las variables son inmutables por versión.</p>'},
{t:"Definir el agente: rol, objetivo y límites",html:
 '<p><code>PromptAgentDefinition</code> admite <code>model</code>, <code>instructions</code>, <code>temperature</code>, <code>top_p</code>, <code>reasoning</code>, <code>tools</code>, <code>tool_choice</code>, <code>text</code>, <code>structured_inputs</code> y <code>rai_config</code>. Las instrucciones eficaces cubren cuatro puntos:</p>'+
 codigo(`Rol: asistente de reclamaciones de transporte.
Objetivo: resolver el estado de un envío o abrir un caso.
Tools: usa el índice para políticas y la API para envíos.
Salida: si no hay datos, indica "no disponible" y pide el número.`)+
 '<p><code>structured_inputs</code> declara valores que el llamador aporta en cada invocación y que se referencian como <code>{{placeholder}}</code>. Sirve, por ejemplo, para pasar un token por usuario a los headers de una tool MCP.</p>'}
],preguntas:[
{d:2,tipo:"unica",esc:"Tailwind Traders recibe eventos de Jira con su propio formato JSON, que no se puede modificar. Un agente en LangGraph debe clasificarlos y mantener archivos entre eventos relacionados. Se busca evitar la administración de infraestructura de contenedores.",
 q:"¿Qué solución corresponde?",
 ops:["Hosted agent con el protocolo Invocations","Hosted agent con el protocolo Responses","Prompt agent con una tool OpenAPI","Código propio en la app con Responses API efímera"],ok:[0],
 exp:"El código LangGraph requiere un hosted agent, e Invocations acepta payloads arbitrarios. El estado de archivos persiste en $HOME y /files por sesión. Responses exige el contrato /responses, que el emisor no puede cambiar. Un prompt agent no ejecuta LangGraph, y el patrón efímero dejaría la infraestructura a cargo del equipo.",
 fuente:F+"agents/concepts/hosted-agents"},
{d:2,tipo:"unica",esc:"Un ISV distribuye una aplicación cuya definición de agente debe versionarse con su código y cambiar de instrucciones por solicitud. No quiere recursos de agente que sincronizar en Foundry, pero sus tools deben llamar a SharePoint en nombre del usuario y aplicar los filtros de contenido del proyecto.",
 q:"¿Qué enfoque cumple todas las condiciones?",
 ops:["Responses API en el endpoint del proyecto","Responses API en el endpoint Azure OpenAI","Prompt agent creado desde el pipeline de CI/CD","Prompt agent con Microsoft Copilot harness"],ok:[0],
 exp:"El patrón efímero en el endpoint del proyecto mantiene la definición en la app y aporta tools de Foundry, OBO y gobernanza del proyecto. El endpoint Azure OpenAI no ofrece estas capacidades de proyecto. Un prompt agent, con o sin harness, es un recurso versionado en Foundry.",
 fuente:F+"agents/quickstarts/responses-api"},
{d:2,tipo:"sino",esc:"Fabrikam despliega un hosted agent con 1 vCPU y 2 GiB y espera 200 sesiones simultáneas.",
 q:"Indique si cada afirmación es correcta.",
 afirm:[{t:"Los valores de CPU y memoria describen una sola sesión, no el total del agente.",ok:true},
  {t:"Cuando vence el tiempo de inactividad se libera el cómputo y se conserva el contenido de $HOME.",ok:true},
  {t:"Se debe configurar un número de réplicas y un pool activo para atender las 200 sesiones.",ok:false},
  {t:"Es obligatorio publicar el agente para invocarlo por código.",ok:false},
  {t:"Para leer de una cuenta de almacenamiento propia, se asigna el rol RBAC a la identidad de la cuenta de usuario que hizo el despliegue.",ok:false}],
 exp:"Cada sesión tiene su sandbox, por lo que los valores son por sesión. Al quedar inactiva se libera el cómputo y el estado persiste. No existe un número de réplicas que configurar. El endpoint está disponible tras desplegar, sin publicar. El acceso externo se concede a la identidad Entra del agente.",
 fuente:F+"agents/concepts/hosted-agents"},
{d:2,tipo:"orden",esc:"Un equipo parte de una plantilla de hosted agent y quiere probar localmente antes de desplegar con Azure Developer CLI.",
 q:"Ordene los comandos.",
 pasos:["azd ai agent init","azd provision","azd ai agent run","azd deploy","azd ai agent invoke"],
 sobran:["az acr login","azd ai agent publish"],
 exp:"init crea el proyecto, provision aprovisiona lo declarado en azure.yaml, run prueba en local, deploy empaqueta y envía el código, e invoke prueba el agente desplegado. El flujo con código no requiere iniciar sesión manualmente en un registro.",
 fuente:F+"agents/quickstarts/quickstart-hosted-agent"},
{d:2,tipo:"completar",esc:"Un script debe crear una versión de hosted agent desde código. El agente atiende chat y debe usar el tamaño de sandbox más pequeño.",
 q:"Complete el código.",
 codigo:`created = project.agents.{{0}}(
    agent_name="basico",
    definition={{1}}(
        cpu="0.5",
        memory="{{2}}",
        code_configuration=CodeConfiguration(
            runtime="python_3_14",
            entry_point=["python", "main.py"],
            dependency_resolution=CodeDependencyResolution.REMOTE_BUILD,
        ),
        protocol_versions=[
            ProtocolVersionRecord(protocol="{{3}}", version="2.0.0")
        ],
    ),
    code=code_stream,
)`,
 huecos:[{ops:["create_version_from_code","create_version","deploy_code","begin_create"],ok:0},
  {ops:["HostedAgentDefinition","PromptAgentDefinition","ContainerAgentDefinition","WorkflowAgentDefinition"],ok:0},
  {ops:["1Gi","2Gi","4Gi","512Mi"],ok:0},
  {ops:["responses","activity","a2a","websocket"],ok:0}],
 exp:"create_version_from_code carga el código con una HostedAgentDefinition. A 0.5 vCPU le corresponde 1 GiB. El protocolo responses cubre el chat. PromptAgentDefinition no ejecuta código propio, y create_version no recibe el paquete de código.",
 fuente:F+"agents/quickstarts/quickstart-hosted-agent"}
]};

/* ---------- 2-4 ---------- */
EXTRA["2-4"]={secciones:[
{t:"Datos que deciden entre tools",html:
 tabla(["Tool","Datos clave","En Toolbox"],[
  ["MCP","<code>allowed_tools</code>; 100 s sin streaming; endpoint privado solo con Standard Setup y red privada","Sí"],
  ["Function calling","Ejecuta el cliente; una ejecución expira a los 10 minutos","No"],
  ["OpenAPI","Spec 3.0 o 3.1; <code>operationId</code> obligatorio; un esquema de API key por tool","Sí"],
  ["Azure AI Search","Un índice por tool; <code>top_k</code> 5; <code>vector_semantic_hybrid</code> por defecto","Sí"],
  ["SharePoint, Azure Functions, Bing","Integración directa con el agente","No"],
  ["Tool search","Meta-tools <code>tool_search</code> y <code>call_tool</code>","Solo Toolbox"]])+
 '<p>Una tool funciona solo si la admiten <b>el modelo y la región</b>. <b>Content Understanding</b> no figura como tool propia en la tabla de tools de Foundry. Una opción de diseño es exponer su Analyze API mediante una función u OpenAPI, para entregar al agente Markdown o campos con puntuación de confianza.</p>'},
{t:"Bucle de function calling",html:
 codigo(`func_tool = FunctionTool(
    name="estado_envio",
    description="Obtiene el estado de un envío por su número.",
    parameters={"type": "object",
                "properties": {"numero": {"type": "string"}},
                "required": ["numero"],
                "additionalProperties": False},
    strict=True,
)
salidas = []
for item in response.output:
    if item.type == "function_call":
        args = json.loads(item.arguments)
        salidas.append(FunctionCallOutput(
            type="function_call_output",
            call_id=item.call_id,
            output=json.dumps(estado_envio(**args)),
        ))
response = openai.responses.create(input=salidas,
                                   conversation=conversation.id)`)+
 '<p>Si el modelo solicita varias funciones, todas las salidas se devuelven en una sola llamada. El límite de 10 minutos se aplica al tiempo total: para una tarea lenta, se devuelve un estado y se consulta después. Los argumentos y resultados se tratan como entrada no confiable. El portal no permite agregar funciones.</p>'},
{t:"Controlar la selección",html:
 '<p><code>tool_choice</code> da el control más determinista: <code>auto</code>, <code>required</code> o <code>none</code>. Si dos tools se solapan, se agrega una regla, por ejemplo: «usar File Search antes que Web Search para contenido interno».</p>'+
 '<p>Con decenas o cientos de tools, <b>tool search</b> oculta las definiciones y reduce tokens y errores de selección. Las tools críticas se pueden fijar con <b>Pin</b>. Toolbox también versiona: se prueba una versión nueva y se promueve como predeterminada, sin cambiar los agentes.</p>'},
{t:"Tres niveles de aprobación",html:
 tabla(["Nivel","Configuración","Evento","Respuesta"],[
  ["Tool MCP","<code>require_approval</code>: <code>always</code> (por defecto), <code>never</code>, <code>{\"never\":[...]}</code> o <code>{\"always\":[...]}</code>","<code>mcp_approval_request</code>","<code>McpApprovalResponse(approve=..., approval_request_id=...)</code>"],
  ["Agente de Agent Framework","<code>@tool(approval_mode=\"always_require\")</code>","<code>result.user_input_requests</code>","<code>to_function_approval_response(True)</code>"],
  ["Workflow","Misma tool u otro executor con <code>ctx.request_info()</code>","Evento <code>request_info</code>","<code>workflow.run(responses=...)</code>"]])+
 '<p>En Agent Framework, la respuesta solo autoriza si coincide con una solicitud pendiente de la misma <code>AgentSession</code>; de lo contrario se ignora. Desactivar ese vínculo permite aprobaciones falsas o repetidas. Con el Harness Agent de Agent Framework, las aprobaciones permanentes se guardan en la sesión y conviene revisarlas si cambia el conjunto de tools.</p>'}
],preguntas:[
{d:2,tipo:"completar",esc:"Un agente usa un servidor MCP con diez operaciones. Solo debe acceder a consultar_saldo y emitir_abono, y una persona debe revisar cada llamada. Las credenciales no pueden estar en el código.",
 q:"Complete el código.",
 codigo:`tool = MCPTool(
    server_label="pagos",
    server_url=URL_MCP,
    {{0}}=["consultar_saldo", "emitir_abono"],
    require_approval="{{1}}",
    {{2}}=NOMBRE_CONEXION,
)
# ...
entradas = []
for item in response.output:
    if item.type == "{{3}}":
        entradas.append(McpApprovalResponse(
            type="mcp_approval_response",
            approve=decision_revisor(item),
            {{4}}=item.id,
        ))
response = openai.responses.create(
    conversation=conversation.id,
    input=entradas,
)`,
 huecos:[{ops:["allowed_tools","tools_filter","enabled_tools","tool_names"],ok:0},
  {ops:["always","never","auto","required"],ok:0},
  {ops:["project_connection_id","connection_string","api_key","credential"],ok:0},
  {ops:["mcp_approval_request","function_call","mcp_call","approval_required"],ok:0},
  {ops:["approval_request_id","call_id","response_id","tool_call_id"],ok:0}],
 exp:"allowed_tools limita las operaciones y always exige revisión. project_connection_id referencia una conexión que guarda las credenciales. La aprobación se detecta con mcp_approval_request y se vincula con approval_request_id en la misma conversación. call_id corresponde a function calling.",
 fuente:F+"agents/how-to/tools/model-context-protocol"},
{d:2,tipo:"unica",esc:"Un agente de Adventure Works llama a una función que lanza una conciliación en el ERP, la cual tarda unos 25 minutos. Las respuestas fallan por expiración antes de devolver el resultado.",
 q:"¿Qué cambio se debe aplicar?",
 ops:["Devolver de inmediato un identificador y un estado, y consultar el resultado con una llamada posterior","Reintentar la función hasta que termine dentro de la ejecución","Dividir el resultado en varios function_call_output enviados con el mismo call_id","Activar strict=True en la definición de la función"],ok:[0],
 exp:"Una ejecución expira 10 minutos después de crearse, y el límite cubre el tiempo total, no cada función. La guía indica devolver un estado y hacer polling. Reintentar no evita la expiración. Dividir la salida no acorta la tarea, y strict solo afecta al esquema.",
 fuente:F+"agents/how-to/tools/function-calling"},
{d:2,tipo:"multiple",esc:"Litware quiere gobernar sus tools en un Toolbox. Un agente usa un servidor MCP, una API con spec OpenAPI, un índice de Azure AI Search, una función local de cálculo de impuestos y SharePoint.",
 q:"¿Qué dos tools se deben mantener fuera del Toolbox, conectadas de forma directa?",
 ops:["La función local de cálculo de impuestos","SharePoint","El servidor MCP","La API con spec OpenAPI","El índice de Azure AI Search"],ok:[0,1],
 exp:"Function calling se ejecuta en el cliente, por lo que no se incluye en Toolbox, y SharePoint figura solo como integración directa. MCP, OpenAPI y Azure AI Search sí se pueden incluir, lo que centraliza credenciales y versiones.",
 fuente:F+"agents/concepts/toolbox-overview"},
{d:2,tipo:"unica",esc:"Una empresa tiene un Toolbox con 300 tools. El consumo de tokens de entrada creció y el modelo elige a veces una tool parecida pero incorrecta. Dos tools de identidad deben estar siempre disponibles. No se quiere cambiar el código de los agentes.",
 q:"¿Qué se debe hacer?",
 ops:["Habilitar tool search y fijar con Pin las dos tools críticas","Establecer tool_choice en required en todos los agentes","Crear un Toolbox por agente con las mismas 300 tools","Aumentar max_output_tokens y el nivel de reasoning_effort"],ok:[0],
 exp:"Tool search oculta las definiciones y expone tool_search y call_tool, lo que reduce tokens y mejora la selección. Pin mantiene las tools críticas visibles. required obliga a llamar una tool pero no reduce la lista. Duplicar Toolbox no reduce definiciones, y aumentar parámetros agrega costo.",
 fuente:F+"agents/concepts/toolbox-overview"},
{d:2,tipo:"sino",esc:"Un equipo de seguridad revisa los controles de un agente con tools sensibles.",
 q:"Indique si cada afirmación es correcta.",
 afirm:[{t:"Si se omite require_approval en una tool MCP, se aplica always.",ok:true},
  {t:"Un prompt agent con Copilot harness continúa tras una aprobación usando previous_response_id.",ok:false},
  {t:"Una lista allowed_tools vacía permite todas las tools del servidor.",ok:true},
  {t:"Las descripciones de un servidor MCP remoto son confiables porque el agente ya tiene una conexión autenticada.",ok:false},
  {t:"Basic agent setup admite servidores MCP privados.",ok:false}],
 exp:"always es el valor predeterminado. El harness exige continuar en la misma conversation. Una lista vacía equivale a no restringir. Las descripciones MCP pueden contener inyecciones indirectas. Los servidores privados requieren Standard Setup con red privada.",
 fuente:F+"agents/how-to/tools/model-context-protocol"}
]};

/* ---------- 2-5 ---------- */
EXTRA["2-5"]={secciones:[
{t:"Tres formas de llevar el contexto",html:
 tabla(["Mecanismo","Dónde vive el historial","Uso típico"],[
  ["<code>conversation</code>","En el servicio, como items persistentes","Multiturno; también lo exige el Copilot harness"],
  ["<code>previous_response_id</code>","En una respuesta almacenada","Encadenar turnos sin crear una conversación"],
  ["Reenviar items en <code>input</code>","En la aplicación","Control total, con <code>store=False</code> si procede"]])+
 '<p>En Azure OpenAI, la Responses API retiene los datos 30 días de forma predeterminada. Para conversaciones largas existe la compactación con <code>responses.compact</code> o <code>context_management</code>. En hosted agents, el protocolo Responses usa conversation ID, mientras que Invocations usa session ID y el código gestiona el historial. El <b>state store</b> guarda JSON por clave para estado de aplicación que la plataforma no administra.</p>'},
{t:"Memory (preview): configuración real",html:
 codigo(`options = MemoryStoreDefaultOptions(
    user_profile_enabled=True,
    chat_summary_enabled=True,
    procedural_memory_enabled=True,
    user_profile_details="Evita datos financieros y credenciales",
)
store = project.beta.memory_stores.create(
    name="soporte",
    definition=MemoryStoreDefaultDefinition(
        chat_model=CHAT, embedding_model=EMBEDDING, options=options),
)
tool = MemorySearchPreviewTool(
    memory_store_name="soporte",
    scope="{{$userId}}",
    update_delay=300,
)`)+
 '<ul><li><b>Scope:</b> <code>{{$userId}}</code> se resuelve con el header <code>x-memory-user-id</code> o, si falta, con el TID y OID de Entra. Las API de bajo nivel requieren indicar <code>scope</code>.</li><li><b>Escritura:</b> <code>update_delay</code> aplaza la actualización hasta un periodo de inactividad; 300 segundos es el valor predeterminado.</li><li><b>Lectura:</b> <code>search_memories</code> sin <code>items</code> devuelve memorias estáticas de perfil; con <code>items</code>, contextuales.</li><li><b>Retención:</b> <code>default_ttl_seconds</code> se define al crear el store; <code>0</code> significa sin vencimiento.</li><li><b>Límites:</b> 100 scopes por store, 10 000 memorias por scope y sin integración con VNet.</li></ul>'},
{t:"Conocimiento: comparación de opciones",html:
 tabla(["Criterio","Foundry IQ","Tool Azure AI Search","File search"],[
  ["Fuentes","Blob, SharePoint, OneLake, web y más","Un índice existente","Archivos en un vector store"],
  ["Consulta","Agentic retrieval en varias fuentes","Tipo configurable con <code>query_type</code>","Palabra clave y semántica"],
  ["Permisos","ACL y etiquetas Purview en consulta","<code>filter</code> común para todas las consultas","Sin filtrado por usuario documentado"],
  ["Reutilización","Varios agentes comparten la base","Por tool","Un vector store por agente y por conversación"],
  ["Límites","Solo la tool <code>knowledge_base_retrieve</code>","Mismo tenant; con VNet privada, identidad administrada","512 MB y 5 M de tokens por archivo; 10 000 archivos"]])+
 '<p>Foundry IQ tiene funciones GA y preview según la versión de la API de Search; la planificación con LLM y la síntesis de respuesta figuran como preview. El agente se conecta por MCP mediante una conexión <code>RemoteTool</code> con <code>ProjectManagedIdentity</code>. Para filtrar por usuario se usa <code>x-ms-query-source-authorization</code>: Agent Service lo establece si el llamador es un usuario; si es un servicio, lo aporta la aplicación. Sin ese token, las fuentes con permisos devuelven resultados sin filtrar.</p>'+
 '<p>Roles: <b>Search Index Data Reader</b> para la identidad del proyecto en Search y, si la base usa un LLM, <b>Cognitive Services User</b> para la identidad de Search en el recurso Foundry.</p>'}
],preguntas:[
{d:2,tipo:"completar",esc:"Un asistente necesita recordar preferencias de cada usuario entre sesiones mediante Memory (preview), y no debe guardar datos de salud.",
 q:"Complete el código.",
 codigo:`store = project.{{0}}.memory_stores.create(
    name="preferencias",
    definition=MemoryStoreDefaultDefinition(
        chat_model=CHAT,
        {{1}}=EMBEDDING,
        options=MemoryStoreDefaultOptions(
            user_profile_enabled=True,
            {{2}}="Excluye datos de salud y credenciales",
        ),
    ),
)
tool = {{3}}(
    memory_store_name="preferencias",
    scope="{{$userId}}",
    update_delay=300,
)`,
 huecos:[{ops:["beta","agents","connections","telemetry"],ok:0},
  {ops:["embedding_model","vector_model","index_model","search_model"],ok:0},
  {ops:["user_profile_details","exclude_fields","memory_filter","instructions"],ok:0},
  {ops:["MemorySearchPreviewTool","MemoryTool","FileSearchTool","AzureAISearchTool"],ok:0}],
 exp:"Los memory stores están en project.beta.memory_stores. La definición requiere chat_model y embedding_model. user_profile_details orienta qué guardar o excluir, y MemorySearchPreviewTool conecta el store con el agente.",
 fuente:F+"agents/how-to/memory-usage"},
{d:2,tipo:"unica",esc:"Un backend de Lamna Healthcare llama a un prompt agent con una sola identidad de servicio en nombre de miles de usuarios finales. Cada usuario debe tener memoria aislada, sin codificar identificadores en la definición del agente.",
 q:"¿Qué configuración corresponde a Memory (preview)?",
 ops:["scope=\"{{$userId}}\" en la tool y el header x-memory-user-id en cada llamada","scope=\"{{$userId}}\" en la tool, sin headers adicionales","Un valor fijo de scope por agente y un memory store compartido","Crear una versión del agente por cada usuario con su scope"],ok:[0],
 exp:"Sin header, {{$userId}} usaría el TID y OID del llamador, que aquí es siempre el servicio, y todos los usuarios compartirían memoria. El header x-memory-user-id resuelve al usuario final. Un scope fijo no aísla, y una versión por usuario no escala ni cumple el requisito.",
 fuente:F+"agents/how-to/memory-usage"},
{d:2,tipo:"unica",esc:"Una consultora tiene políticas en SharePoint y Blob Storage. Tres agentes deben consultar ambas fuentes, con citas, y cada empleado solo debe ver el contenido autorizado. Las preguntas complejas requieren varias subconsultas.",
 q:"¿Qué solución corresponde?",
 ops:["Una base de conocimiento de Foundry IQ conectada por MCP, con el token del usuario en x-ms-query-source-authorization","Una tool Azure AI Search por agente, con un filter fijo en cada una","File search con un vector store que combine todos los documentos","Memory con procedural_memory_enabled para guardar las políticas"],ok:[0],
 exp:"Foundry IQ combina varias fuentes, se comparte entre agentes, descompone consultas y aplica permisos del usuario. La tool de Search apunta a un índice y su filter no depende del usuario. File search está pensado para archivos aportados, y Memory guarda contexto aprendido, no conocimiento curado.",
 fuente:F+"agents/concepts/what-is-foundry-iq"},
{d:2,tipo:"multiple",esc:"Un agente usa una base de conocimiento con planificación por LLM. Al consultar, Search devuelve 403. El proyecto y el servicio de Search tienen identidad administrada asignada por el sistema. Se debe aplicar el mínimo privilegio.",
 q:"¿Qué dos asignaciones son necesarias?",
 ops:["Search Index Data Reader para la identidad del proyecto en Azure AI Search","Cognitive Services User para la identidad de Search en el recurso de Foundry","Search Index Data Contributor para la identidad del proyecto en Azure AI Search","Owner para la identidad del proyecto en Azure AI Search","Foundry Account Owner para la identidad de Search"],ok:[0,1],
 exp:"La identidad del proyecto necesita leer índices con Search Index Data Reader. La de Search llama al LLM con Cognitive Services User. Contributor solo aplica si el agente escribe documentos. Owner y Foundry Account Owner exceden el mínimo privilegio.",
 fuente:F+"agents/how-to/foundry-iq-connect"},
{d:2,tipo:"sino",esc:"Un arquitecto define cómo combinar agentes, conversaciones y respuestas en una aplicación multiturno.",
 q:"Indique si cada afirmación es correcta.",
 afirm:[{t:"Sin un objeto conversation, el contexto se puede mantener con una respuesta almacenada o reenviando items.",ok:true},
  {t:"Cada respuesta debe asociarse siempre a un agente y a una conversación.",ok:false},
  {t:"Conviene un agente persistente si varias solicitudes requieren el mismo comportamiento y las mismas tools.",ok:true},
  {t:"Los modos streaming y background cambian la relación entre agentes, conversaciones y respuestas.",ok:false}],
 exp:"Sin conversation se puede encadenar una respuesta almacenada o reenviar items. Una respuesta puede ejecutarse con o sin agente y conversación. El agente aporta configuración reutilizable. Streaming y background solo cambian cómo la aplicación recibe la respuesta.",
 fuente:F+"agents/concepts/runtime-components"}
]};

/* ---------- 2-6 ---------- */
EXTRA["2-6"]={secciones:[
{t:"Builders y señales de decisión",html:
 tabla(["Patrón","Builder en Python","Topología","Señal en el enunciado"],[
  ["Sequential","<code>SequentialBuilder</code>","Tubería","Cada paso depende del anterior"],
  ["Concurrent","<code>ConcurrentBuilder</code>","Fan-out y fan-in","Análisis independientes y combinación"],
  ["Handoff","<code>HandoffBuilder</code>","Malla, sin orquestador","Un especialista asume todo el caso"],
  ["Group chat","<code>GroupChatBuilder</code>","Estrella con orquestador","Revisión iterativa en varias rondas"],
  ["Magentic","<code>MagenticBuilder</code>","Gestor con plan","Solución desconocida de antemano"]])+
 '<p>Handoff no equivale a <b>agent-as-tool</b> (<code>agent.as_tool()</code>). En handoff, el receptor toma el control y la propiedad de la tarea. Con agent-as-tool, el agente principal conserva la tarea, el control vuelve a él y decide qué contexto compartir. Handoff y group chat filtran las llamadas y los resultados de tools al sincronizar el historial.</p>'+
 '<p>En Sequential, <code>chain_only_agent_responses=True</code> limita el contexto a la última respuesta. En Concurrent, <code>with_aggregator</code> reemplaza la combinación predeterminada.</p>'},
{t:"Híbridos con reglas y workflows propios",html:
 '<p>Agent Framework recomienda escribir una función si esta resuelve la tarea. Las reglas de negocio se implementan en <b>executors</b> deterministas y el LLM queda para lo ambiguo. Los orquestadores admiten mezclar agentes y executors.</p>'+
 codigo(`class ControlImporte(Executor):
    @handler
    async def revisar(self, caso: Caso, ctx: WorkflowContext[Caso, str]) -> None:
        if caso.importe > 10000:
            await ctx.request_info(request_data=caso, response_type=bool)
        else:
            await ctx.send_message(caso)

    @response_handler
    async def decision(self, original: Caso, aprobado: bool,
                       ctx: WorkflowContext[Caso, str]) -> None:
        if aprobado:
            await ctx.send_message(original)
        else:
            await ctx.yield_output("Rechazado por el supervisor")`)+
 '<p><code>WorkflowBuilder</code> usa executors, edges con condiciones y supersteps. La API funcional con <code>@workflow</code> es experimental en Python. Un workflow se expone como agente con <code>workflow.as_agent()</code>.</p>'},
{t:"Salvaguardas de autonomía y durabilidad",html:
 tabla(["Control","Mecanismo"],[
  ["Detener rondas","<code>termination_condition</code>, <code>max_round_count</code>"],
  ["Evitar bloqueos en Magentic","<code>max_stall_count</code>, <code>max_reset_count</code>"],
  ["Revisar el plan","<code>enable_plan_review=True</code>; desactivado por defecto en Python"],
  ["Handoff autónomo (experimental en Python)","<code>with_autonomous_mode()</code>; 50 turnos por defecto, con <code>turn_limits</code>"],
  ["Pausar tras un agente","<code>.with_request_info(agents=[...])</code>"],
  ["Sobrevivir a reinicios","<code>CosmosCheckpointStorage</code> en producción"]])+
 '<p>Los checkpoints se crean al terminar cada superstep e incluyen las solicitudes pendientes, que se vuelven a emitir al restaurar. Sequential, Concurrent y Group chat no se detienen sin configuración para recibir texto libre del usuario; handoff sí es interactivo. El almacén de checkpoints es un límite de confianza: nunca se cargan datos manipulados.</p>'},
{t:"Migración antes del retiro",html:
 '<p>Foundry retira los workflows visuales el 1 de diciembre de 2026. El YAML se exporta antes de esa fecha.</p>'+
 tabla(["Objetivo","Destino"],[
  ["Conservar la lógica en código o YAML","Agent Framework, desplegado como hosted agent"],
  ["Mantener un diseñador visual","Azure Logic Apps"],
  ["Conectar dos agentes sin flujo formal","A2A"]])+
 '<p>La tool <code>a2a</code> (<code>A2ATool</code>, protocolo 1.0) es GA; <code>a2a_preview</code> (0.3) sigue en preview. Con destinos Foundry, A2A solo admite texto y no admite streaming. El llamador requiere <b>Foundry Agent Consumer</b> en el proyecto destino. Connected Agents no existe en el servicio nuevo.</p>'}
],preguntas:[
{d:2,tipo:"unica",esc:"Antes de lanzar un producto, los equipos legal, financiero y técnico deben evaluar la misma propuesta sin influirse entre sí. Después, un agente debe unificar los resultados en un informe de 200 palabras.",
 q:"¿Qué orquestación corresponde?",
 ops:["ConcurrentBuilder con un agregador personalizado","SequentialBuilder con los tres agentes y un redactor","GroupChatBuilder con selección round-robin","HandoffBuilder con un agente de triaje"],ok:[0],
 exp:"Concurrent ejecuta los agentes de forma independiente sobre la misma entrada, y with_aggregator sintetiza los resultados. En Sequential y Group chat, cada agente ve lo anterior, lo que introduce influencia. Handoff transfiere el control a un único especialista.",
 fuente:A+"workflows/orchestrations/concurrent"},
{d:2,tipo:"unica",esc:"Un agente de viajes mantiene la relación con el cliente. Para el clima consulta a otro agente, le envía solo la ciudad y las fechas, y debe redactar él mismo la respuesta final.",
 q:"¿Qué patrón corresponde?",
 ops:["Agent-as-tool con agente.as_tool()","Handoff entre los dos agentes","Group chat con orquestador","Magentic con un gestor"],ok:[0],
 exp:"En agent-as-tool, el agente principal conserva la tarea, recupera el control y comparte solo el contexto necesario. En handoff, el receptor asume el caso con todo el contexto. Group chat comparte el historial, y Magentic agrega planificación innecesaria.",
 fuente:A+"workflows/orchestrations/handoff"},
{d:2,tipo:"completar",esc:"Un soporte en Python usa triaje y especialistas que se transfieren el caso. El triaje puede avanzar solo un máximo de tres turnos. Los reembolsos requieren revisión humana y el flujo debe reanudarse tras reiniciar el proceso en un único servidor.",
 q:"Complete el código.",
 codigo:`@tool(approval_mode="{{0}}")
def procesar_reembolso(pedido: str) -> str:
    """Procesa un reembolso."""
    ...

storage = {{1}}(storage_path="./checkpoints")

workflow = (
    {{2}}(
        name="soporte",
        participants=[triaje, reembolsos, envios],
        {{3}}=storage,
    )
    .with_start_agent(triaje)
    .{{4}}(agents=[triaje], turn_limits={triaje.name: 3})
    .build()
)`,
 huecos:[{ops:["always_require","never_require","required","manual"],ok:0},
  {ops:["FileCheckpointStorage","InMemoryCheckpointStorage","SessionStorage","TempCheckpointStorage"],ok:0},
  {ops:["HandoffBuilder","MagenticBuilder","SequentialBuilder","ConcurrentBuilder"],ok:0},
  {ops:["checkpoint_storage","storage","state_store","checkpoint_id"],ok:0},
  {ops:["with_autonomous_mode","with_request_info","add_handoff","enable_return_to_previous"],ok:0}],
 exp:"always_require pausa antes de ejecutar la tool. FileCheckpointStorage conserva el estado en disco en un único servidor; en memoria se perdería. HandoffBuilder recibe checkpoint_storage y with_autonomous_mode admite turn_limits. Para un entorno distribuido se usaría CosmosCheckpointStorage.",
 fuente:A+"workflows/orchestrations/handoff"},
{d:2,tipo:"sino",esc:"Una empresa planifica la migración de sus workflows visuales de Foundry en noviembre de 2026.",
 q:"Indique si cada afirmación es correcta.",
 afirm:[{t:"Tras el retiro, una definición YAML puede seguir ejecutándose si se despliega como hosted agent.",ok:true},
  {t:"Un hosted agent se puede agregar como nodo en el diseñador de workflows.",ok:false},
  {t:"Tras el retiro, el diseñador sigue disponible para ejecutar flujos dentro del portal.",ok:false},
  {t:"Si se requiere un lienzo visual de bajo código, Azure Logic Apps es la ruta indicada.",ok:true},
  {t:"Para una delegación simple entre dos agentes, sin flujo formal, A2A es una ruta válida.",ok:true}],
 exp:"Foundry sigue ejecutando definiciones YAML desplegadas como hosted agent. Los hosted agents no se admiten en el diseñador. Tras el 1 de diciembre de 2026, ni el diseñador ni la ejecución en el portal tienen soporte. Logic Apps es la opción visual, y A2A cubre delegaciones simples.",
 fuente:F+"agents/concepts/workflow"},
{d:2,tipo:"orden",esc:"En un flujo con handoff, la aprobación de una tool puede tardar dos días y el proceso se detiene mientras tanto.",
 q:"Ordene las acciones.",
 pasos:["Crear el workflow con un almacén de checkpoints","Ejecutar workflow.run hasta recibir el evento request_info","Dejar finalizar el proceso con el checkpoint guardado","Restaurar con workflow.run(checkpoint_id=...) para recuperar las solicitudes pendientes","Enviar la decisión con workflow.run(responses=...)"],
 sobran:["Crear una nueva conversación y repetir la solicitud original"],
 exp:"El almacén se configura al construir el workflow. La ejecución se pausa con request_info y el checkpoint guarda la solicitud. Al restaurar, la solicitud se emite de nuevo y se responde con responses. Repetir la solicitud original perdería el estado y podría duplicar acciones.",
 fuente:A+"workflows/orchestrations/handoff"}
]};

/* ---------- Caso de estudio ---------- */
CASOS.push({id:"caso-m2",modulo:2,t:"Alpine Logística: reclamaciones de transporte",
 texto:'<h4>Contexto</h4><p>Alpine Logística es un operador de transporte con sede en la Unión Europea. Atiende a clientes desde un portal web cuyo backend usa una única identidad de servicio. Hoy gestiona las reclamaciones con un workflow visual de Foundry creado en el portal.</p>'+
 '<h4>Requisitos técnicos</h4><ul><li><b>T1.</b> El agente de atención debe usar un servidor MCP remoto solo para <code>consultar_saldo</code> y <code>emitir_abono</code>. Cada abono requiere revisión humana.</li><li><b>T2.</b> Las tarifas y políticas están en SharePoint y Blob Storage, con permisos por usuario. Varios agentes deben compartir ese conocimiento.</li><li><b>T3.</b> El agente recordará preferencias de cada cliente entre sesiones (Memory, preview). No se guardarán datos financieros y las memorias vencerán a los 90 días.</li><li><b>T4.</b> Un agente de triaje transfiere cada reclamación a un especialista. Las superiores a 10 000 EUR requieren análisis independientes de fraude, legal y finanzas, y su resultado consolidado se somete a un supervisor.</li><li><b>T5.</b> El umbral de 10 000 EUR debe aplicarse siempre con una regla determinista.</li><li><b>T6.</b> La aprobación del supervisor puede tardar tres días, y el flujo debe reanudarse en otra instancia.</li><li><b>T7.</b> Todo el procesamiento de inferencia debe permanecer en la zona de datos de la UE.</li></ul>'+
 '<h4>Requisitos de negocio</h4><ul><li><b>B1.</b> El agente de atención debe minimizar el código y la infraestructura que se administra.</li><li><b>B2.</b> El flujo de reclamaciones debe seguir operando después del 1 de diciembre de 2026.</li><li><b>B3.</b> Cada noche se resumen 500 000 albaranes al menor costo. Basta con entregar en 24 horas.</li></ul>',
 preguntas:[
 {d:1,tipo:"multiple",q:"¿Qué dos tipos de despliegue cumplen T7 y B3 para el agente de atención y los resúmenes nocturnos?",
  ops:["Data Zone Standard para el agente de atención","Data Zone Batch para los resúmenes nocturnos","Global Batch para los resúmenes nocturnos","Global Standard para el agente de atención","Global Provisioned para el agente de atención"],ok:[0,1],
  exp:"Los tipos Data Zone limitan el procesamiento a la zona UE. Data Zone Standard atiende tráfico en línea por token, y Data Zone Batch ofrece 50 % de descuento con objetivo de 24 horas. Los tipos Global pueden procesar en cualquier región de Azure y no cumplen T7.",
  fuente:F+"foundry-models/concepts/deployment-types"},
 {d:2,tipo:"unica",q:"¿Qué tipo de agente corresponde a la atención al cliente para cumplir B1 y T1?",
  ops:["Prompt agent con la tool MCP","Hosted agent con Agent Framework","Responses API efímera dentro del backend","Hosted agent con protocolo Invocations"],ok:[0],
  exp:"Un prompt agent no tiene código de runtime ni contenedores, y admite tools MCP con aprobación. Los hosted agents agregan código propio y cómputo. El patrón efímero deja la definición y la lógica de aprobación en el código de la aplicación, por lo que no minimiza lo administrado.",
  fuente:F+"agents/overview"},
 {d:2,tipo:"completar",q:"Para cumplir T2, complete la conexión del agente con la base de conocimiento, de modo que cada solicitud se filtre con el token del usuario.",
  codigo:`mcp_kb_tool = MCPTool(
    server_label="knowledge-base",
    server_url=mcp_endpoint,
    require_approval="never",
    allowed_tools=["{{0}}"],
    project_connection_id=conexion,
    {{1}}={"x-ms-query-source-authorization": "{{search_auth_token}}"},
)
agent = project.agents.create_version(
    agent_name="atencion",
    definition=PromptAgentDefinition(
        model=MODELO,
        instructions=instrucciones,
        tools=[mcp_kb_tool],
        {{2}}={"search_auth_token": StructuredInputDefinition(
            description="Token de Search del usuario",
            required=True,
            schema={"type": "string"},
        )},
    ),
)`,
  huecos:[{ops:["knowledge_base_retrieve","search_documents","retrieve_all","query_index"],ok:0},
   {ops:["headers","metadata","extra_headers","auth"],ok:0},
   {ops:["structured_inputs","tool_resources","variables","extra_body"],ok:0}],
  exp:"knowledge_base_retrieve es la tool admitida con Foundry Agent Service. headers transporta el token mediante el marcador, y structured_inputs declara el valor que el llamador aporta en cada invocación. Sin ese token, las fuentes con permisos no se filtrarían por usuario.",
  fuente:F+"agents/how-to/foundry-iq-connect"},
 {d:2,tipo:"unica",q:"¿Qué configuración de Memory cumple T3 con el menor esfuerzo?",
  ops:["Al crear el store, definir user_profile_details para excluir datos financieros y default_ttl_seconds para 90 días","Al crear el store, deshabilitar user_profile_enabled y eliminar cada memoria con una tarea diaria","Crear el store sin opciones y agregar default_ttl_seconds después, sin verificar la versión de API","Indicar en las instrucciones del agente que olvide los datos financieros y use una conversación por cliente"],ok:[0],
  exp:"user_profile_details orienta qué extraer o excluir, y default_ttl_seconds se configura al crear el store. Deshabilitar el perfil eliminaría las preferencias que se buscan. Las actualizaciones posteriores de estas opciones dependen de la versión de API. Las instrucciones no sustituyen estos controles, y una conversación no retiene entre sesiones.",
  fuente:F+"agents/how-to/memory-usage"},
 {d:2,tipo:"unica",q:"¿Qué diseño cumple T4, T5 y B2?",
  ops:["Agent Framework desplegado como hosted agent: handoff para el triaje, un executor de reglas para el umbral, Concurrent para los tres análisis y checkpoints en Azure Cosmos DB","Workflow visual de Foundry con un nodo group chat y una instrucción que indique el umbral al modelo","Azure Logic Apps con un prompt agent que decida el umbral según su criterio","Un prompt agent con tres agentes A2A que el modelo llame cuando lo considere necesario"],ok:[0],
  exp:"Agent Framework es la ruta recomendada tras el retiro. Handoff cubre la transferencia, un executor aplica la regla sin el LLM, Concurrent mantiene los análisis independientes y Cosmos DB permite reanudar en otra instancia. El workflow visual se retira. Las otras opciones dejan el umbral a criterio del modelo, lo que incumple T5.",
  fuente:F+"agents/concepts/workflow"},
 {d:2,tipo:"sino",q:"Indique si cada afirmación sobre T4, T5 y T6 es correcta.",
  afirm:[{t:"Al restaurar un checkpoint, la solicitud pendiente del supervisor se vuelve a emitir.",ok:true},
   {t:"Se puede reanudar desde un checkpoint y responder en la misma llamada con checkpoint_id y responses.",ok:true},
   {t:"ConcurrentBuilder pausa por sí solo para recibir comentarios libres del supervisor.",ok:false},
   {t:"El executor de reglas puede usar ctx.request_info y recibir la decisión en un método con @response_handler.",ok:true}],
  exp:"Las solicitudes pendientes se guardan en el checkpoint y se emiten al restaurar. workflow.run acepta checkpoint_id y responses a la vez. Concurrent no pausa por sí solo para texto libre; se necesita un workflow propio con solicitudes. request_info y @response_handler implementan la pausa en un executor.",
  fuente:A+"workflows/human-in-the-loop"}
 ]});
})();
