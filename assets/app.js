(function(){
"use strict";
var CLAVE="ai103-guia-v2";
var est={hechas:{},ruta:5};
try{var g=localStorage.getItem(CLAVE);if(g){var o=JSON.parse(g);for(var k in o)est[k]=o[k]}}catch(e){}
function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify(est))}catch(e){}}
function $(s){return document.querySelector(s)}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
var app=$("#app");

var LEC=[];
MODULOS.forEach(function(m){m.lecciones.forEach(function(l,i){l.id=m.n+"-"+(i+1);l.num=m.n+"."+(i+1);l.mod=m;l.min+=(m.n===3?40:25);LEC.push(l)})});
function siguientePendiente(){for(var i=0;i<LEC.length;i++)if(!est.hechas[LEC[i].id])return LEC[i];return null}
function cuentaHechas(){return LEC.filter(function(l){return est.hechas[l.id]}).length}
function barra(){$("#prog").textContent=cuentaHechas()+"/"+LEC.length+" lecciones"}

var RUTAS={
 5:[["Día 1","Módulo 1 · Fundamentos de Foundry","5 h"],["Día 2","Módulo 2 · Aplicaciones y agentes","6 h"],["Día 3","Módulos 3 y 4 · Calidad, recuperación y extracción","7 h 30"],["Día 4","Módulo 5 · Visión, texto y voz","4 h 30"],["Día 5","Examen de práctica y repaso final","3 h"]],
 4:[["Día 1","Módulo 1 · Fundamentos de Foundry","5 h"],["Día 2","Módulos 2 y 3 · Agentes, calidad y seguridad","9 h"],["Día 3","Módulos 4 y 5 · Recuperación, visión, texto y voz","9 h"],["Día 4","Examen de práctica y repaso final","3 h"]]
};

/* Inicio */
function inicio(){
  var sig=siguientePendiente(),iniciado=cuentaHechas()>0;
  var pesos=DOMINIOS.map(function(d){return '<div class="wrow"><span>'+d.t+'</span><em>'+d.min+'-'+d.max+' %</em><div class="bar-t"><i class="max" style="width:'+d.max/40*100+'%"></i><i style="width:'+d.min/40*100+'%"></i></div></div>'}).join("");
  var ruta=RUTAS[est.ruta].map(function(r){return '<div><b>'+r[0]+'</b><span>'+r[1]+'</span><span>'+r[2]+'</span></div>'}).join("");
  var indice=MODULOS.map(function(m){
    return '<div class="mod"><div class="modh"><h3>Módulo '+m.n+' · '+m.t+'</h3><span>'+m.h+'</span><p>'+m.d+'</p></div>'+
     m.lecciones.map(function(l){return '<a class="les" href="#/lesson/'+l.id+'"><span class="num">'+l.num+'</span><span>'+l.t+'</span><span class="tm">'+l.min+' min</span><span class="ok">'+(est.hechas[l.id]?"✓":"")+'</span></a>'}).join("")+'</div>';
  }).join("");
  app.innerHTML=
  '<section class="pad hero"><p class="tagv">// exam AI-103 · developing AI apps and agents on Azure</p><h1>Guía de preparación <mark>AI-103</mark></h1><p class="lead">Un curso breve para preparar el examen en 4 o 5 días. Cada lección profundiza en un tema, lo aplica a un caso práctico y termina con preguntas de nivel examen.</p><div class="cta">'+
   (sig?'<a class="btn pri" href="#/lesson/'+sig.id+'">'+(iniciado?"Continuar: ":"Comenzar: ")+sig.num+' '+sig.t+'</a>':'<a class="btn pri" href="#/mock-exam">Hacer el simulacro</a>')+
   '<a class="btn" href="#index">Ver índice</a></div></section>'+
  '<section class="pad sec"><span class="secn">§00</span><h2>Cómo funciona.</h2><div class="stack"><p class="lead">Todas las lecciones siguen el mismo orden. A lo largo del curso se construye una solución para Contoso Seguros, una aseguradora ficticia.</p>'+
   '<div class="steps4"><div><b>1. Concepto</b><small>Lo esencial, con un esquema.</small></div><div><b>2. A fondo</b><small>Detalles, comparaciones y código.</small></div><div><b>3. Ejemplo y tropiezos</b><small>El tema aplicado al caso y errores comunes.</small></div><div><b>4. Preguntas</b><small>Nivel examen, con explicación y fuente.</small></div></div></div></section>'+
  '<section class="pad sec"><span class="secn">§01</span><h2>Qué evalúa el examen.</h2><div class="stack"><p class="lead">Dos dominios concentran entre 55 y 65 % del examen, por eso los módulos 1 y 2 tienen mayor duración. Negro: peso mínimo. Amarillo: peso máximo.</p><div>'+pesos+'</div></div></section>'+
  '<section class="pad sec"><span class="secn">§02</span><h2>Elige tu ruta.</h2><div class="stack"><div class="switch" style="justify-self:start"><button data-ruta="4" aria-pressed="'+(est.ruta===4)+'">4 días</button><button data-ruta="5" aria-pressed="'+(est.ruta===5)+'">5 días</button></div><div class="route">'+ruta+'</div><p class="note">Con menos tiempo disponible, conviene priorizar Concepto, Tropiezos y Preguntas nivel examen, y dejar A fondo para los temas con más errores.</p></div></section>'+
  '<section class="pad sec" id="index"><span class="secn">§03</span><h2>Índice.</h2><div class="stack">'+indice+'</div></section>'+
  '<section class="pad sec"><span class="secn">§04</span><h2>Práctica final.</h2><div class="grid2"><a class="linkcard" href="#/mock-exam"><b>Examen de práctica</b><span>Preguntas de varios tipos, caso de estudio y 120 minutos.</span></a><a class="linkcard" href="#/flashcards"><b>Tarjetas</b><span>'+TARJETAS.length+' conceptos clave para repasar.</span></a><a class="linkcard" href="#/exam-day"><b>Día del examen</b><span>Condiciones, gestión del tiempo y resumen.</span></a></div></section>';
}

/* Lección */
function leccion(id){
  var l=null,i=-1;LEC.forEach(function(x,j){if(x.id===id){l=x;i=j}});
  if(!l){location.hash="#/";return}
  var ant=LEC[i-1],sig=LEC[i+1],n=0;
  var ex=EXTRA[l.id]||{secciones:[],preguntas:[]};
  var secs=ex.secciones.length?'<h2><small>§2</small>A fondo</h2>'+ex.secciones.map(function(x){return '<h3>'+x.t+'</h3>'+x.html}).join(""):'';
  var docs=l.docs.map(function(d){return '<li><a href="'+DOC+d[1]+'" target="_blank" rel="noopener">'+d[0]+'</a></li>'}).join("");
  app.innerHTML='<article class="pad"><div class="meta"><a href="#index">← índice</a><span>/</span><span>módulo '+l.mod.n+': '+l.mod.t+'</span><span>/</span><span>'+l.num+'</span><span>/</span><span>'+l.min+' min</span></div>'+
   '<div class="prose"><h1 class="les-t">'+l.t+'</h1><p class="obj"><b>Objetivo:</b> '+l.obj+'</p>'+
   '<h2><small>§1</small>Concepto</h2>'+l.html+
   secs+
   '<h2><small>§'+(n=3)+'</small>Ejemplo: Contoso Seguros</h2><div class="case">'+l.ejemplo+'</div>'+
   '<h2><small>§4</small>Tropiezos frecuentes</h2><div class="pit"><ul>'+l.tropiezos.map(function(t){return '<li>'+t+'</li>'}).join("")+'</ul></div>'+
   '<h2><small>§5</small>Preguntas nivel examen</h2><p>Estas preguntas siguen el formato de una certificación: escenario, restricciones y opciones plausibles.</p><div class="stack" id="exq"></div>'+
   '<div class="lab"><b>Práctica:</b> '+l.practica+'</div>'+
   '<h2><small>§6</small>Para profundizar</h2><ul>'+docs+'</ul>'+
   '<div class="done"><button class="btn pri" id="hecha">'+(est.hechas[l.id]?"Lección completada ✓":"Marcar como completada")+'</button></div></div></article>'+
   '<nav class="pn">'+(ant?'<a href="#/lesson/'+ant.id+'"><small>← anterior</small>'+ant.num+' '+ant.t+'</a>':'<a href="#/"><small>← inicio</small>Portada</a>')+
   (sig?'<a href="#/lesson/'+sig.id+'"><small>siguiente →</small>'+sig.num+' '+sig.t+'</a>':'<a href="#/mock-exam"><small>siguiente →</small>Simulacro</a>')+'</nav>';
  var cx=$("#exq");if(cx)ex.preguntas.forEach(function(q,j){var d=document.createElement("div");cx.appendChild(d);EX.monta(d,q,{modo:"practica",rotulo:"pregunta "+(j+1)})});
  $("#hecha").addEventListener("click",function(){
    est.hechas[l.id]=!est.hechas[l.id];guardar();barra();
    this.textContent=est.hechas[l.id]?"Lección completada ✓":"Marcar como completada";
  });
}

/* Simulacro con formato de examen */
function bancoExamen(){
  var r=[];Object.keys(EXTRA).forEach(function(id){EXTRA[id].preguntas.forEach(function(q){r.push({q:q,lec:id})})});return r;
}
function armar(){
  var cupos={1:12,2:15,3:6,4:6,5:6},pool=bancoExamen(),sel=[];
  Object.keys(cupos).forEach(function(d){sel=sel.concat(EX.mezcla(pool.filter(function(x){return x.q.d==d})).slice(0,cupos[d]))});
  sel=EX.mezcla(sel);
  var caso=EX.mezcla(CASOS)[0];
  if(caso)caso.preguntas.forEach(function(q){sel.push({q:q,caso:caso})});
  return sel;
}
var RELOJ=null;
function simulacro(){
  clearInterval(RELOJ);
  var lista=armar();
  if(!lista.length){app.innerHTML='<section class="pad"><p>El banco de preguntas no está disponible.</p></section>';return}
  app.innerHTML='<section class="pad"><div class="prose"><span class="secn">simulacro</span><h1 class="les-t">Examen de práctica</h1><p class="lead">'+lista.length+' preguntas con formato de certificación y 120 minutos. Incluye preguntas de varios tipos y un caso de estudio. La corrección aparece al final.</p>'+
   '<p class="note">Las preguntas son originales: reproducen el estilo de una certificación, no el contenido del examen real.</p><div class="cta"><button class="btn pri" id="go">Iniciar examen</button><a class="btn" href="#/">Volver</a></div></div></section>';
  $("#go").addEventListener("click",function(){correr(lista)});
}
function correr(lista){
  var pos=0,resp=lista.map(function(){return null}),marca={},fin=Date.now()+120*60000,api=null;
  function reloj(){var r=Math.max(0,fin-Date.now()),m=Math.floor(r/60000),s=Math.floor(r/1000)%60,e=$("#clk");if(e)e.textContent=m+":"+String(s).padStart(2,"0");if(r<=0)terminar()}
  function guarda(){if(api)resp[pos]=api.respuesta()}
  function ir(n){guarda();pos=n;pinta();window.scrollTo(0,0)}
  function pinta(){
    var x=lista[pos];
    app.innerHTML='<section class="pad"><div class="prose"><div class="exbar"><span class="secn">pregunta '+(pos+1)+' de '+lista.length+'</span><span class="secn">tiempo <b id="clk"></b></span></div><div class="pbar"><i style="width:'+(pos+1)/lista.length*100+'%"></i></div>'+
     (x.caso?'<details class="casebox" open><summary>Caso de estudio: '+EX.esc(x.caso.t)+'</summary>'+x.caso.texto+'</details>':"")+
     '<div id="qq"></div><label class="mk"><input type="checkbox" id="mk"'+(marca[pos]?" checked":"")+'> Marcar para revisar</label>'+
     '<div class="cta"><button class="btn" id="pv"'+(pos?"":" disabled")+'>Anterior</button><button class="btn" id="nx"'+(pos+1<lista.length?"":" disabled")+'>Siguiente</button><button class="btn" id="rv">Revisión</button></div></div></section>';
    api=EX.monta($("#qq"),x.q,{modo:"examen",rotulo:"examen",ans:resp[pos]||undefined,cambio:function(a){resp[pos]=a}});
    $("#mk").addEventListener("change",function(){marca[pos]=this.checked});
    $("#pv").addEventListener("click",function(){ir(pos-1)});$("#nx").addEventListener("click",function(){ir(pos+1)});
    $("#rv").addEventListener("click",function(){guarda();revision()});
    reloj();
  }
  function revision(){
    app.innerHTML='<section class="pad"><div class="prose"><span class="secn">revisión</span><div class="exbar"><h1 class="les-t">Revisión</h1><span class="secn">tiempo <b id="clk"></b></span></div><p>Seleccione una pregunta para volver a ella.</p><div class="revg">'+lista.map(function(x,i){var c=resp[i]&&EX.completa(x.q,resp[i]);
      return '<button class="btn'+(c?" hecho":"")+(marca[i]?" marc":"")+'" data-g="'+i+'">'+(i+1)+(marca[i]?" ⚑":"")+'</button>'}).join("")+'</div><div class="cta"><button class="btn pri" id="fn">Terminar y corregir</button></div></div></section>';
    app.querySelector(".revg").addEventListener("click",function(e){var b=e.target.closest("[data-g]");if(b){api=null;pos=+b.getAttribute("data-g");pinta();window.scrollTo(0,0)}});
    $("#fn").addEventListener("click",terminar);api=null;reloj();
  }
  function terminar(){
    clearInterval(RELOJ);guarda();
    var ok=function(i){return !!resp[i]&&EX.correcta(lista[i].q,resp[i])};
    var tot=lista.filter(function(_,i){return ok(i)}).length,pc=Math.round(tot/lista.length*100);
    var filas=DOMINIOS.map(function(d){var t=[];lista.forEach(function(x,i){if(x.q.d===d.n)t.push(i)});var o=t.filter(ok).length;return [d.t,o+"/"+t.length,t.length?Math.round(o/t.length*100)+" %":"—"]});
    var mal=[];lista.forEach(function(x,i){if(!ok(i))mal.push(x)});
    app.innerHTML='<section class="pad"><div class="prose"><span class="secn">resultado</span><p class="score">'+pc+' %</p><p>'+tot+' de '+lista.length+' correctas. La meta recomendada es 80 %. Este valor no predice el puntaje oficial.</p>'+tabla(["Dominio","Aciertos","%"],filas)+
     (mal.length?'<h2>Para reforzar</h2><div class="stack">'+mal.map(function(x){var l=x.lec&&LEC.filter(function(y){return y.id===x.lec})[0];
       return '<div class="qb">'+(x.q.esc?'<p class="esc">'+EX.esc(x.q.esc)+'</p>':"")+'<p class="qt">'+EX.esc(x.q.q)+'</p><p>Respuesta:<br>'+EX.respuestaTexto(x.q)+'</p><p class="why">'+EX.esc(x.q.exp)+'</p>'+(x.q.fuente?'<a href="'+EX.esc(x.q.fuente)+'" target="_blank" rel="noopener">Fuente oficial</a>':"")+(l?' · <a href="#/lesson/'+l.id+'">Repasar '+l.num+'</a>':"")+'</div>'}).join("")+'</div>':"")+
     '<div class="cta"><button class="btn pri" id="otro">Nuevo examen</button><a class="btn" href="#/">Volver al inicio</a></div></div></section>';
    $("#otro").addEventListener("click",simulacro);window.scrollTo(0,0);
  }
  RELOJ=setInterval(reloj,1000);
  pinta();
}

/* Tarjetas */
function tarjetasVista(){
  var filtro=0,orden=[],pos=0,ver=false;
  function barajar(){orden=[];TARJETAS.forEach(function(c,i){if(!filtro||c[0]===filtro)orden.push(i)});orden.sort(function(){return Math.random()-.5});pos=0;ver=false}
  function dib(){
    var c=TARJETAS[orden[pos]];
    app.innerHTML='<section class="pad"><div class="prose"><span class="secn">repaso</span><h1 class="les-t">Tarjetas</h1><p class="lead">Se responde mentalmente y luego se voltea la tarjeta. Las dudosas regresan al final del mazo.</p><div class="chips" id="fl">'+
     [0,1,2,3,4,5].map(function(d){return '<button data-d="'+d+'" aria-pressed="'+(filtro===d)+'">'+(d?"Dominio "+d:"Todas")+'</button>'}).join("")+'</div>'+
     '<button class="flip" id="fp"><span>'+(pos+1)+' de '+orden.length+' · dominio '+c[0]+'</span><b>'+esc(c[1])+'</b>'+(ver?'<span class="ans">'+esc(c[2])+'</span>':'<span>Seleccione para ver la respuesta.</span>')+'</button>'+
     (ver?'<div class="cta"><button class="btn" id="rep">Repasar de nuevo</button><button class="btn pri" id="ok">La sabía</button></div>':"")+'</div></section>';
    $("#fp").addEventListener("click",function(){ver=true;dib()});
    $("#fl").addEventListener("click",function(e){var b=e.target.closest("button");if(b){filtro=+b.getAttribute("data-d");barajar();dib()}});
    if(ver){
      $("#ok").addEventListener("click",function(){pos=(pos+1)%orden.length;ver=false;dib()});
      $("#rep").addEventListener("click",function(){orden.push(orden[pos]);pos++;ver=false;dib()});
    }
  }
  barajar();dib();
}

/* Día del examen */
function examen(){
  app.innerHTML='<section class="pad"><div class="prose"><span class="secn">preparación final</span><h1 class="les-t">Día del examen</h1>'+
   '<h2><small>§1</small>Condiciones</h2>'+tabla(["Tema","Detalle"],[["Duración","120 minutos de examen y 140 de asiento"],["Aprobación","700 o más"],["Preguntas","La mayoría de los exámenes contiene entre 40 y 60"],["Microsoft Learn","Disponible, pero el reloj no se detiene"],["Pausas","El reloj sigue y no se vuelve a las preguntas ya vistas"],["Reintento","Después de 24 horas"]])+
   '<h2><small>§2</small>Búsquedas en Learn</h2><p>Conviene ensayar cómo localizar estas páginas.</p>'+tabla(["Duda","Búsqueda"],[["Despliegue","deployment types Foundry Models"],["Rol","role-based access control Microsoft Foundry"],["Evaluador","built-in evaluators reference"],["Guardrail","guardrails and controls overview"],["Analyzer","Content Understanding prebuilt analyzers"]])+
   '<h2><small>§3</small>Resumen de decisiones</h2>'+tabla(["Si el enunciado dice…","Se piensa en…"],[["Datos dentro de la UE","Data Zone"],["Carga constante y latencia estable","PTU"],["Asíncrono y barato","Batch"],["Sin secretos","Managed identity"],["Solo invocar un agente","Foundry Agent Consumer"],["Datos en recursos propios","Standard setup"],["Código existente","Hosted agent"],["Preferencias entre sesiones","Memory"],["Conocimiento corporativo con permisos","Foundry IQ"],["Código exacto y concepto","Hybrid"],["Pregunta compuesta","Agentic retrieval"],["Salida exacta","Structured outputs"],["Voz en tiempo real","Voice Live"],["Inventa datos","Groundedness"],["Instrucciones ocultas en una fuente","Indirect attacks"]])+
   '<h2><small>§4</small>Nombres que pueden variar</h2><p>El temario es de abril de 2026. Azure AI User equivale a Foundry User. Si aparecen pro mode o workflows visuales, conviene responder según el concepto. Las preguntas cubren sobre todo funciones GA, aunque pueden incluir preview de uso común.</p>'+
   '<h2><small>§5</small>Recursos oficiales</h2><ul><li><a href="'+DOC+'credentials/certifications/resources/study-guides/ai-103" target="_blank" rel="noopener">Guía de estudio AI-103</a></li><li><a href="http://aka.ms/AI103-PA" target="_blank" rel="noopener">Practice Assessment</a></li><li><a href="https://aka.ms/examdemo" target="_blank" rel="noopener">Exam sandbox</a></li><li><a href="https://aka.ms/AI103-ExamPrep" target="_blank" rel="noopener">Videos de preparación</a></li><li><a href="'+DOC+'credentials/support/exam-duration-exam-experience" target="_blank" rel="noopener">Duración y experiencia del examen</a></li></ul></div></section>';
}

/* Rutas */
function rutas(){
  clearInterval(RELOJ);
  var h=location.hash||"#/",m;
  var nav=document.querySelectorAll(".nav a");
  nav.forEach(function(a){a.classList.toggle("on",a.getAttribute("href")===h)});
  barra();
  if((m=h.match(/^#\/lesson\/(\d-\d)$/))){leccion(m[1]);window.scrollTo(0,0)}
  else if(h==="#/mock-exam"){simulacro();window.scrollTo(0,0)}
  else if(h==="#/flashcards"){tarjetasVista();window.scrollTo(0,0)}
  else if(h==="#/exam-day"){examen();window.scrollTo(0,0)}
  else if(h==="#index"){inicio();var t=$("#index");if(t)t.scrollIntoView()}
  else{inicio();window.scrollTo(0,0)}
}
app.addEventListener("click",function(e){
  var b=e.target.closest("[data-ruta]");if(!b)return;
  est.ruta=+b.getAttribute("data-ruta");guardar();var y=window.scrollY;inicio();window.scrollTo(0,y);
});
window.addEventListener("hashchange",rutas);
rutas();
})();
