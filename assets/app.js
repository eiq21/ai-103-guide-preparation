(function(){
"use strict";
var CLAVE="ai103-guia-v2";
var est={hechas:{},resp:{},ruta:5};
try{var g=localStorage.getItem(CLAVE);if(g){var o=JSON.parse(g);for(var k in o)est[k]=o[k]}}catch(e){}
function guardar(){try{localStorage.setItem(CLAVE,JSON.stringify(est))}catch(e){}}
function $(s){return document.querySelector(s)}
function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
var app=$("#app");

var LEC=[];
MODULOS.forEach(function(m){m.lecciones.forEach(function(l,i){l.id=m.n+"-"+(i+1);l.num=m.n+"."+(i+1);l.mod=m;LEC.push(l)})});
var AVISO_LECCION={};
LEC.forEach(function(l){l.ej.forEach(function(i){AVISO_LECCION[i]=l})});
function siguientePendiente(){for(var i=0;i<LEC.length;i++)if(!est.hechas[LEC[i].id])return LEC[i];return null}
function cuentaHechas(){return LEC.filter(function(l){return est.hechas[l.id]}).length}
function barra(){$("#prog").textContent=cuentaHechas()+"/"+LEC.length+" lecciones"}

var RUTAS={
 5:[["Día 1","Módulo 1 · Fundamentos de Foundry","3 h"],["Día 2","Módulo 2 · Aplicaciones y agentes","3 h 30"],["Día 3","Módulos 3 y 4 · Calidad, recuperación y extracción","4 h"],["Día 4","Módulo 5 · Visión, texto y voz","2 h 30"],["Día 5","Simulacro, repaso y preparación final","2 h"]],
 4:[["Día 1","Módulo 1 · Fundamentos de Foundry","3 h"],["Día 2","Módulos 2 y 3 · Agentes, calidad y seguridad","5 h"],["Día 3","Módulos 4 y 5 · Recuperación, visión, texto y voz","5 h"],["Día 4","Simulacro, repaso y preparación final","2 h"]]
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
  '<section class="pad hero"><p class="tagv">// exam AI-103 · developing AI apps and agents on Azure</p><h1>Guía de preparación <mark>AI-103</mark></h1><p class="lead">Un curso breve para preparar el examen en 4 o 5 días. Cada lección explica un tema, lo aplica a un caso real y termina con ejercicios.</p><div class="cta">'+
   (sig?'<a class="btn pri" href="#/lesson/'+sig.id+'">'+(iniciado?"Continuar: ":"Comenzar: ")+sig.num+' '+sig.t+'</a>':'<a class="btn pri" href="#/mock-exam">Hacer el simulacro</a>')+
   '<a class="btn" href="#index">Ver índice</a></div></section>'+
  '<section class="pad sec"><span class="secn">§00</span><h2>Cómo funciona.</h2><div class="stack"><p class="lead">Todas las lecciones siguen el mismo orden. A lo largo del curso se construye una solución para Contoso Seguros, una aseguradora ficticia.</p>'+
   '<div class="steps4"><div><b>1. Concepto</b><small>Lo esencial, con un esquema.</small></div><div><b>2. Ejemplo</b><small>El tema aplicado al caso.</small></div><div><b>3. Tropiezos</b><small>Errores que el examen aprovecha.</small></div><div><b>4. Ahora prueba</b><small>Ejercicios con explicación.</small></div></div></div></section>'+
  '<section class="pad sec"><span class="secn">§01</span><h2>Qué evalúa el examen.</h2><div class="stack"><p class="lead">Dos dominios concentran entre 55 y 65 % del examen, por eso los módulos 1 y 2 tienen mayor duración. Negro: peso mínimo. Amarillo: peso máximo.</p><div>'+pesos+'</div></div></section>'+
  '<section class="pad sec"><span class="secn">§02</span><h2>Elige tu ruta.</h2><div class="stack"><div class="switch" style="justify-self:start"><button data-ruta="4" aria-pressed="'+(est.ruta===4)+'">4 días</button><button data-ruta="5" aria-pressed="'+(est.ruta===5)+'">5 días</button></div><div class="route">'+ruta+'</div></div></section>'+
  '<section class="pad sec" id="index"><span class="secn">§03</span><h2>Índice.</h2><div class="stack">'+indice+'</div></section>'+
  '<section class="pad sec"><span class="secn">§04</span><h2>Práctica final.</h2><div class="grid2"><a class="linkcard" href="#/mock-exam"><b>Simulacro</b><span>30 preguntas según el peso de cada dominio.</span></a><a class="linkcard" href="#/flashcards"><b>Tarjetas</b><span>'+TARJETAS.length+' conceptos clave para repasar.</span></a><a class="linkcard" href="#/exam-day"><b>Día del examen</b><span>Condiciones, gestión del tiempo y resumen.</span></a></div></section>';
}

/* Ejercicio */
function pintarPregunta(el,idx,n){
  var q=PREGUNTAS[idx],multi=q[3].length>1,sel=[],fin=false;
  var orden=q[2].map(function(_,i){return i}).sort(function(){return Math.random()-.5});
  function acierto(){return sel.length===q[3].length&&q[3].every(function(v){return sel.indexOf(v)>=0})}
  function pintar(){
    var h='<div class="qb"><span class="qn">ejercicio '+n+(multi?" · seleccione 2":"")+'</span><p class="qt">'+esc(q[1])+'</p><div class="opts">'+
     orden.map(function(o,i){var c="opt";if(fin){if(q[3].indexOf(o)>=0)c+=" ok";else if(sel.indexOf(o)>=0)c+=" no"}
      return '<button class="'+c+'" data-o="'+o+'" aria-pressed="'+(sel.indexOf(o)>=0)+'"'+(fin?" disabled":"")+'><span>'+"ABCD".charAt(i)+'</span><span>'+esc(q[2][o])+'</span></button>'}).join("")+'</div>';
    if(multi&&!fin)h+='<div><button class="btn" data-c'+(sel.length===2?"":" disabled")+'>Comprobar</button></div>';
    if(fin)h+='<p class="why"><b>'+(acierto()?"Correcto.":"Incorrecto.")+'</b> '+esc(q[4])+'</p>';
    el.innerHTML=h+'</div>';
  }
  function cerrar(){fin=true;est.resp[idx]=acierto();guardar();pintar()}
  el.addEventListener("click",function(e){
    if(fin)return;
    if(e.target.closest("[data-c]")){cerrar();return}
    var b=e.target.closest("[data-o]");if(!b)return;
    var o=+b.getAttribute("data-o");
    if(!multi){sel=[o];cerrar();return}
    var i=sel.indexOf(o);if(i>=0)sel.splice(i,1);else if(sel.length<2)sel.push(o);
    pintar();
  });
  pintar();
}

/* Lección */
function leccion(id){
  var l=null,i=-1;LEC.forEach(function(x,j){if(x.id===id){l=x;i=j}});
  if(!l){location.hash="#/";return}
  var ant=LEC[i-1],sig=LEC[i+1];
  var docs=l.docs.map(function(d){return '<li><a href="'+DOC+d[1]+'" target="_blank" rel="noopener">'+d[0]+'</a></li>'}).join("");
  app.innerHTML='<article class="pad"><div class="meta"><a href="#index">← índice</a><span>/</span><span>módulo '+l.mod.n+': '+l.mod.t+'</span><span>/</span><span>'+l.num+'</span><span>/</span><span>'+l.min+' min</span></div>'+
   '<div class="prose"><h1 class="les-t">'+l.t+'</h1><p class="obj"><b>Objetivo:</b> '+l.obj+'</p>'+
   '<h2><small>§1</small>Concepto</h2>'+l.html+
   '<h2><small>§2</small>Ejemplo: Contoso Seguros</h2><div class="case">'+l.ejemplo+'</div>'+
   '<h2><small>§3</small>Tropiezos frecuentes</h2><div class="pit"><ul>'+l.tropiezos.map(function(t){return '<li>'+t+'</li>'}).join("")+'</ul></div>'+
   '<h2><small>§4</small>Ahora prueba</h2><div class="stack" id="ej"></div>'+
   '<div class="lab"><b>Práctica:</b> '+l.practica+'</div>'+
   '<h2><small>§5</small>Para profundizar</h2><ul>'+docs+'</ul>'+
   '<div class="done"><button class="btn pri" id="hecha">'+(est.hechas[l.id]?"Lección completada ✓":"Marcar como completada")+'</button></div></div></article>'+
   '<nav class="pn">'+(ant?'<a href="#/lesson/'+ant.id+'"><small>← anterior</small>'+ant.num+' '+ant.t+'</a>':'<a href="#/"><small>← inicio</small>Portada</a>')+
   (sig?'<a href="#/lesson/'+sig.id+'"><small>siguiente →</small>'+sig.num+' '+sig.t+'</a>':'<a href="#/mock-exam"><small>siguiente →</small>Simulacro</a>')+'</nav>';
  var cont=$("#ej");
  l.ej.forEach(function(idx,j){var d=document.createElement("div");cont.appendChild(d);pintarPregunta(d,idx,j+1)});
  $("#hecha").addEventListener("click",function(){
    est.hechas[l.id]=!est.hechas[l.id];guardar();barra();
    this.textContent=est.hechas[l.id]?"Lección completada ✓":"Marcar como completada";
  });
}

/* Simulacro */
function elegir(){
  var cupos={1:9,2:11,3:3,4:3,5:4},r=[];
  Object.keys(cupos).forEach(function(d){
    var p=[];PREGUNTAS.forEach(function(q,i){if(q[0]==d)p.push(i)});
    p.sort(function(){return Math.random()-.5});r=r.concat(p.slice(0,cupos[d]));
  });
  return r.sort(function(){return Math.random()-.5});
}
function simulacro(){
  var lista=elegir(),pos=0,bien={};
  function resultado(){
    var ok=lista.filter(function(i){return bien[i]}).length,pc=Math.round(ok/lista.length*100);
    var fall=lista.filter(function(i){return !bien[i]});
    var porD=DOMINIOS.map(function(d){var t=lista.filter(function(i){return PREGUNTAS[i][0]===d.n}),o=t.filter(function(i){return bien[i]}).length;
      return [d.t,o+"/"+t.length,Math.round(o/t.length*100)+" %"]});
    app.innerHTML='<section class="pad"><div class="prose"><span class="secn">resultado</span><p class="score">'+pc+' %</p><p>'+ok+' de '+lista.length+' respuestas correctas. La meta recomendada es 80 %. Este valor no predice el puntaje oficial.</p>'+
     tabla(["Dominio","Aciertos","%"],porD)+
     (fall.length?'<h2>Para reforzar</h2><div class="stack">'+fall.map(function(i){var l=AVISO_LECCION[i];return '<div class="qb"><p class="qt">'+esc(PREGUNTAS[i][1])+'</p><p>Respuesta: <b>'+PREGUNTAS[i][3].map(function(o){return esc(PREGUNTAS[i][2][o])}).join(" + ")+'</b></p><p class="why">'+esc(PREGUNTAS[i][4])+'</p>'+(l?'<a href="#/lesson/'+l.id+'">Repasar '+l.num+' '+l.t+'</a>':"")+'</div>'}).join("")+'</div>':"")+
     '<div class="cta"><a class="btn pri" href="#/mock-exam" id="otro">Nuevo simulacro</a><a class="btn" href="#/">Volver al inicio</a></div></div></section>';
    $("#otro").addEventListener("click",function(e){e.preventDefault();simulacro()});
  }
  function pintar(){
    var idx=lista[pos],q=PREGUNTAS[idx],multi=q[3].length>1,sel=[];
    var orden=q[2].map(function(_,i){return i}).sort(function(){return Math.random()-.5});
    function dib(){
      app.innerHTML='<section class="pad"><div class="prose"><span class="secn">simulacro · pregunta '+(pos+1)+' de '+lista.length+'</span><div class="pbar"><i style="width:'+pos/lista.length*100+'%"></i></div>'+
       '<div class="qb"><p class="qt">'+esc(q[1])+'</p><div class="opts">'+orden.map(function(o,i){return '<button class="opt" data-o="'+o+'" aria-pressed="'+(sel.indexOf(o)>=0)+'"><span>'+"ABCD".charAt(i)+'</span><span>'+esc(q[2][o])+'</span></button>'}).join("")+'</div>'+
       '<div><button class="btn pri" id="sig"'+(sel.length===q[3].length?"":" disabled")+'>'+(pos+1===lista.length?"Ver resultado":"Siguiente")+'</button></div></div></div></section>';
      app.querySelectorAll("[data-o]").forEach(function(b){b.addEventListener("click",function(){
        var o=+b.getAttribute("data-o");
        if(!multi)sel=[o];else{var i=sel.indexOf(o);if(i>=0)sel.splice(i,1);else if(sel.length<q[3].length)sel.push(o)}
        dib();
      })});
      $("#sig").addEventListener("click",function(){
        bien[idx]=sel.length===q[3].length&&q[3].every(function(v){return sel.indexOf(v)>=0});
        est.resp[idx]=bien[idx];guardar();pos++;
        if(pos<lista.length)pintar();else resultado();window.scrollTo(0,0);
      });
    }
    dib();
  }
  pintar();
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
