/* Clase guiada con voz: recorre la lección sección por sección.
   Para cada sección baja la página hasta ella, la resalta y reproduce la explicación del profesor.
   Luego hace una pausa breve y sigue con la siguiente.
   Guiones: VOZ en voz-datos.js, {"4-1":[{k:"título de sección",t:"texto"}, ...]}.
   Audio: assets/audio/<id>/<n>.mp3, generado con voz neuronal. Si un archivo falta,
   se usa la voz del navegador como respaldo. */
(function(){
  var CLAVE="ai103-voz",PAUSA=900;
  var pref={vel:1};
  try{var g=JSON.parse(localStorage.getItem(CLAVE)||"{}");if(g.vel)pref.vel=g.vel}catch(e){}
  function guarda(){try{localStorage.setItem(CLAVE,JSON.stringify(pref))}catch(e){}}

  var id="",seg=[],pos=0,leyendo=false,turno=0,audio=new Audio(),espera=null,barra=null,boton=null;
  audio.preload="auto";

  function limpia(s){return s.replace(/\s+/g," ").trim()}
  /* Elementos de una sección: su título y lo que sigue hasta el próximo título. */
  function zona(k){
    var pr=document.querySelector("#app .prose");if(!pr)return [];
    var r=[],n;
    if(k==="Inicio"){
      var o=pr.querySelector(".obj");if(!o)return [];
      r=[o];n=o.nextElementSibling;
      while(n&&!n.matches("h2,h3")){if(!n.matches(".voz,.subbar"))r.push(n);n=n.nextElementSibling}
      return r;
    }
    var hs=pr.querySelectorAll("h2,h3"),h=null;
    for(var i=0;i<hs.length;i++){var c=hs[i].cloneNode(true);c.querySelectorAll("small").forEach(function(x){x.remove()});
      if(limpia(c.textContent)===k){h=hs[i];break}}
    if(!h)return [];
    r=[h];n=h.nextElementSibling;
    while(n&&!n.matches("h2,h3")){r.push(n);n=n.nextElementSibling}
    return r;
  }
  /* Una sola franja de luz detrás de toda la sección, sin cortes entre bloques. */
  var luz=null,zonaActual=[];
  function ubica(){
    if(!luz||!zonaActual.length)return;
    var a=zonaActual[0].getBoundingClientRect(),z=zonaActual[zonaActual.length-1].getBoundingClientRect();
    var pr=document.querySelector("#app .prose").getBoundingClientRect();
    luz.style.top=(a.top+scrollY-8)+"px";luz.style.height=(z.bottom-a.top+16)+"px";
    luz.style.left=(pr.left+scrollX-16)+"px";luz.style.width=(pr.width+32)+"px";
  }
  function suelta(){zonaActual=[];if(luz)luz.classList.remove("on")}
  function enfoca(){
    zonaActual=zona(seg[pos].k);
    if(!zonaActual.length){suelta();return}
    if(!luz){luz=document.createElement("div");luz.className="voz-luz";document.body.appendChild(luz)}
    ubica();luz.classList.add("on");
    zonaActual[0].scrollIntoView({behavior:"smooth",block:"start"});
  }
  window.addEventListener("resize",ubica);

  function siguiente(mio){
    if(mio!==turno||!leyendo)return;
    clearTimeout(espera);
    espera=setTimeout(function(){if(mio!==turno||!leyendo)return;pos++;reproduce()},PAUSA);
  }
  /* Respaldo si falta el audio: voz del navegador. */
  function respaldo(mio){
    var S=window.speechSynthesis;if(!S){siguiente(mio);return}
    var u=new SpeechSynthesisUtterance(seg[pos].t);u.lang="es-MX";u.rate=pref.vel;
    u.onend=function(){siguiente(mio)};S.speak(u);
  }
  function reproduce(){
    if(pos>=seg.length){termina();return}
    var mio=++turno;
    enfoca();pinta();
    audio.onended=function(){siguiente(mio)};
    audio.onerror=function(){if(mio===turno)respaldo(mio)};
    audio.src="assets/audio/"+id+"/"+pos+".mp3";
    audio.playbackRate=pref.vel;
    var p=audio.play();if(p&&p.catch)p.catch(function(e){if(mio===turno&&e.name!=="AbortError")respaldo(mio)});
  }
  function calla(){turno++;clearTimeout(espera);audio.pause();if(window.speechSynthesis)speechSynthesis.cancel()}
  function play(){
    if(!seg.length)return;
    if(pos>=seg.length)pos=0;
    leyendo=true;muestra(true);
    /* Si se pausó a mitad de una sección, continúa desde ese punto. */
    if(audio.currentTime>0&&!audio.ended&&audio.getAttribute("src")==="assets/audio/"+id+"/"+pos+".mp3"){
      var mio=++turno;audio.onended=function(){siguiente(mio)};audio.play();enfoca();pinta();
    }else reproduce();
  }
  function pausa(){leyendo=false;calla();pinta()}
  function reinicia(){leyendo=false;calla();suelta();pos=0;audio.removeAttribute("src")}
  function termina(){reinicia();pinta(true)}
  function salta(d){
    var n=pos+d;if(n<0)n=0;if(n>=seg.length)return;
    calla();audio.removeAttribute("src");pos=n;
    if(leyendo)reproduce();else{enfoca();pinta()}
  }
  function cierra(){reinicia();muestra(false);pinta()}

  function muestra(si){if(barra)barra.classList.toggle("on",si);document.body.classList.toggle("voz-abierta",si)}
  function pinta(fin){
    if(boton)boton.textContent=leyendo?"❚❚ Pausar la clase":(pos>0?"▶ Continuar la clase":"▶ Clase guiada con voz");
    if(!barra)return;
    var b=barra.querySelector(".vb-play");
    b.textContent=leyendo?"❚❚":"▶";b.setAttribute("aria-label",leyendo?"Pausar":"Reproducir");
    var k=seg[Math.min(pos,seg.length-1)].k;
    barra.querySelector(".vb-sec").textContent=fin?"Clase terminada":(k==="Inicio"?"Introducción":k);
    barra.querySelector(".vb-n").textContent=fin?"":(pos+1)+" de "+seg.length;
    barra.querySelector(".vb-bar i").style.width=(fin?100:Math.round(pos/seg.length*100))+"%";
  }

  function crea(){
    var art=document.querySelector("#app article"),obj=art&&art.querySelector(".obj");
    if(!obj)return;
    var pal=seg.reduce(function(a,s){return a+s.t.split(/\s+/).length},0),min=Math.max(1,Math.round(pal/140));
    var d=document.createElement("div");d.className="voz";
    d.innerHTML='<button class="btn pri" type="button">▶ Clase guiada con voz</button><span>El profesor recorre cada sección y explica lo importante. Unos '+min+' min.</span>';
    boton=d.querySelector("button");
    boton.addEventListener("click",function(){leyendo?pausa():play()});
    obj.parentNode.insertBefore(d,obj.nextSibling);

    barra=document.createElement("div");barra.className="vozbar";barra.setAttribute("role","region");barra.setAttribute("aria-label","Clase guiada con voz");
    barra.innerHTML='<div class="vb-bar"><i></i></div><div class="vb-in">'+
      '<button type="button" class="vb-ant" aria-label="Sección anterior" title="Sección anterior">⏮</button>'+
      '<button type="button" class="vb-play" aria-label="Reproducir">▶</button>'+
      '<button type="button" class="vb-sig" aria-label="Sección siguiente" title="Sección siguiente">⏭</button>'+
      '<span class="vb-txt"><small class="vb-n"></small><b class="vb-sec"></b></span>'+
      '<select class="vb-vel" aria-label="Velocidad">'+[0.9,1,1.15,1.3,1.5].map(function(v){
        return '<option value="'+v+'"'+(v===pref.vel?" selected":"")+'>'+String(v).replace(".",",")+'×</option>'}).join("")+'</select>'+
      '<button type="button" class="vb-x" aria-label="Cerrar" title="Cerrar">✕</button></div>';
    barra.querySelector(".vb-play").addEventListener("click",function(){leyendo?pausa():play()});
    barra.querySelector(".vb-ant").addEventListener("click",function(){salta(-1)});
    barra.querySelector(".vb-sig").addEventListener("click",function(){salta(1)});
    barra.querySelector(".vb-x").addEventListener("click",cierra);
    barra.querySelector(".vb-vel").addEventListener("change",function(){pref.vel=parseFloat(this.value);guarda();audio.playbackRate=pref.vel});
    document.body.appendChild(barra);
    pinta();
  }

  function pasa(){
    var art=document.querySelector("#app article");
    if(!art||art.dataset.voz)return;
    var m=location.hash.match(/^#\/lesson\/(\d-\d)$/);
    var g=m&&window.VOZ&&VOZ[m[1]];
    if(!g||!g.length)return;
    art.dataset.voz="1";
    id=m[1];seg=g;pos=0;leyendo=false;
    crea();
  }
  /* Al cambiar de página se calla y se quita la barra. */
  window.addEventListener("hashchange",function(){reinicia();if(luz){luz.remove();luz=null}muestra(false);if(barra)barra.remove();barra=null;boton=null});
  new MutationObserver(pasa).observe(document.getElementById("app"),{childList:true,subtree:true});
  pasa();
})();
