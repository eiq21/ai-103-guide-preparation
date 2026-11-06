/* Profesor en voz: lee un guion breve por lección con la voz del navegador (Web Speech API).
   Los guiones viven en VOZ (voz-datos.js): {"4-1":["párrafo", ...]}. No es la lección leída:
   es una explicación hablada con lo que más pregunta el examen.
   Se habla frase por frase: así la pausa es fiable y Chrome no corta textos largos. */
(function(){
  var S=window.speechSynthesis;
  if(!S||!window.SpeechSynthesisUtterance)return;
  var CLAVE="ai103-voz";
  var pref={vel:1,voz:""};
  try{var g=JSON.parse(localStorage.getItem(CLAVE)||"{}");if(g.vel)pref.vel=g.vel;if(g.voz)pref.voz=g.voz}catch(e){}
  function guarda(){try{localStorage.setItem(CLAVE,JSON.stringify(pref))}catch(e){}}

  /* Voces en español, las de mejor calidad primero. */
  function voces(){
    return S.getVoices().filter(function(v){return /^es([-_]|$)/i.test(v.lang)}).sort(function(a,b){return nota(b)-nota(a)});
  }
  function nota(v){
    var n=0,t=v.name;
    if(/natural|online|neural/i.test(t))n+=8;
    if(/google/i.test(t))n+=5;
    if(/paulina|m[oó]nica|marisol|dalia|elena|sabina|helena|lucia|luc[ií]a/i.test(t))n+=4;
    if(/es[-_](MX|US|419|PE|CO|AR|CL)/i.test(v.lang))n+=2;
    if(v.localService===false)n+=1;
    if(/eddy|flo\b|grandma|grandpa|reed|rocko|sandy|shelley|bells|bubbles|jester|organ|trinoids|whisper|zarvox|bahh|boing|wobble/i.test(t))n-=20;
    return n;
  }
  function vozElegida(){
    var vs=voces();
    return vs.filter(function(v){return v.name===pref.voz})[0]||vs[0]||null;
  }

  /* Estado de la lectura */
  var guion=[],frases=[],pos=0,leyendo=false,turno=0,ui=null;
  function trocea(ps){
    var r=[];
    ps.forEach(function(p,i){
      p.split(/(?<=[.!?…]["»”]?)\s+/).forEach(function(f){f=f.trim();if(f)r.push({p:i,t:f})});
    });
    return r;
  }
  function habla(){
    if(pos>=frases.length){fin();return}
    var mio=++turno,f=frases[pos];
    var u=new SpeechSynthesisUtterance(f.t);
    var v=vozElegida();
    if(v){u.voice=v;u.lang=v.lang}else u.lang="es-MX";
    u.rate=pref.vel;
    u.onend=function(){if(mio!==turno||!leyendo)return;pos++;habla()};
    u.onerror=function(e){if(mio!==turno||!leyendo)return;if(e.error==="interrupted"||e.error==="canceled")return;pos++;habla()};
    pinta();
    S.speak(u);
  }
  function play(){
    if(!frases.length)return;
    if(pos>=frases.length)pos=0;
    leyendo=true;S.cancel();habla();
  }
  function pausa(){leyendo=false;turno++;S.cancel();pinta()}
  function fin(){leyendo=false;turno++;pos=0;pinta(true)}
  function salta(d){
    var p=frases[Math.min(pos,frases.length-1)].p+d;
    if(p<0)p=0;if(p>=guion.length){pausa();return}
    for(var i=0;i<frases.length;i++)if(frases[i].p===p){pos=i;break}
    if(leyendo){turno++;S.cancel();habla()}else pinta();
  }

  function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;")}
  function pinta(terminado){
    if(!ui)return;
    var f=frases[Math.min(pos,frases.length-1)],p=f.p;
    ui.btn.textContent=leyendo?"❚❚ Pausar":(pos>0&&!terminado?"▶ Continuar":"▶ Escuchar al profesor");
    ui.btn.setAttribute("aria-pressed",leyendo);
    ui.box.classList.toggle("on",leyendo||pos>0||!!terminado);
    ui.prog.textContent=terminado?"Explicación terminada":"Parte "+(p+1)+" de "+guion.length;
    ui.bar.style.width=(terminado?100:Math.round(pos/frases.length*100))+"%";
    ui.txt.innerHTML=frases.filter(function(x){return x.p===p}).map(function(x){
      return x===f&&leyendo?'<mark class="voz-ya">'+esc(x.t)+'</mark>':esc(x.t)}).join(" ");
  }
  function llenaVoces(){
    if(!ui)return;
    var vs=voces(),sel=vozElegida();
    ui.sel.innerHTML=vs.length?vs.map(function(v){
      return '<option value="'+esc(v.name)+'"'+(sel&&v.name===sel.name?" selected":"")+'>'+esc(v.name.replace(/^Microsoft |^Google /,""))+' · '+v.lang+'</option>'}).join(""):'<option>Voz del sistema</option>';
  }

  function panel(){
    var d=document.createElement("div");d.className="voz";
    d.innerHTML='<div class="voz-ctl">'+
      '<button class="btn pri voz-play" type="button" aria-pressed="false">▶ Escuchar al profesor</button>'+
      '<button class="btn voz-ant" type="button" title="Parte anterior" aria-label="Parte anterior">⏮</button>'+
      '<button class="btn voz-sig" type="button" title="Parte siguiente" aria-label="Parte siguiente">⏭</button>'+
      '<label>Velocidad <select class="voz-vel">'+[0.85,1,1.15,1.3,1.5].map(function(v){
        return '<option value="'+v+'"'+(v===pref.vel?" selected":"")+'>'+String(v).replace(".",",")+'×</option>'}).join("")+'</select></label>'+
      '<label>Voz <select class="voz-sel"></select></label></div>'+
      '<div class="voz-box"><div class="voz-pr"><span class="voz-prog"></span><span class="voz-bar"><i></i></span></div><p class="voz-txt"></p></div>';
    ui={btn:d.querySelector(".voz-play"),box:d.querySelector(".voz-box"),prog:d.querySelector(".voz-prog"),
      bar:d.querySelector(".voz-bar i"),txt:d.querySelector(".voz-txt"),sel:d.querySelector(".voz-sel")};
    ui.btn.addEventListener("click",function(){leyendo?pausa():play()});
    d.querySelector(".voz-ant").addEventListener("click",function(){salta(-1)});
    d.querySelector(".voz-sig").addEventListener("click",function(){salta(1)});
    d.querySelector(".voz-vel").addEventListener("change",function(){
      pref.vel=parseFloat(this.value);guarda();if(leyendo){turno++;S.cancel();habla()}});
    ui.sel.addEventListener("change",function(){pref.voz=this.value;guarda();if(leyendo){turno++;S.cancel();habla()}});
    llenaVoces();pinta();
    return d;
  }

  function pasa(){
    var art=document.querySelector("#app article");
    if(!art||art.dataset.voz)return;
    var m=location.hash.match(/^#\/lesson\/(\d-\d)$/);
    var g=m&&window.VOZ&&VOZ[m[1]];
    if(!g||!g.length)return;
    art.dataset.voz="1";
    guion=g;frases=trocea(g);pos=0;leyendo=false;
    var obj=art.querySelector(".obj");
    if(!obj)return;
    obj.parentNode.insertBefore(panel(),obj.nextSibling);
  }
  /* Al cambiar de página se calla. */
  window.addEventListener("hashchange",function(){leyendo=false;turno++;S.cancel();ui=null});
  window.addEventListener("pagehide",function(){S.cancel()});
  if("onvoiceschanged" in S)S.addEventListener("voiceschanged",llenaVoces);
  new MutationObserver(pasa).observe(document.getElementById("app"),{childList:true,subtree:true});
  S.cancel();pasa();
})();
