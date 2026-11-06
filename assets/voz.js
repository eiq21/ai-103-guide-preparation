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
  function suelta(){if(typeof quitaPunto==="function")quitaPunto();zonaActual=[];if(luz)luz.classList.remove("on")}
  function enfoca(){
    zonaActual=zona(seg[pos].k);
    if(!zonaActual.length){suelta();return}
    if(!luz){luz=document.createElement("div");luz.className="voz-luz";document.body.appendChild(luz)}
    ubica();luz.classList.add("on");
    zonaActual[0].scrollIntoView({behavior:"smooth",block:"start"});
  }
  window.addEventListener("resize",ubica);

  /* Subtítulos y señalador, sincronizados con el tiempo de cada palabra (marcas.json).
     El señalador busca, dentro de la sección, la fila, paso o término que comparte más
     palabras con la frase que se está diciendo. */
  var marcas=null,frases=[],fraseAct=-1,palAct=-1,bucle=0,punto=null,cands=[];
  var VACIAS=" para como esta este esto estos estas pero porque cuando donde sobre entre desde hasta tiene tienen puede pueden solo cada otra otro otras otros aqui mira fijate bien ahora vamos veamos pasemos clave examen recuerda leccion seccion tabla diagrama esquema ejemplo siempre nunca tambien mismo misma decir hacer usar usas usar sirve parte caso casos forma formas ";
  function quita(x){return x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"")}
  function fichas(x){return (quita(x).match(/[a-z0-9]{4,}/g)||[]).filter(function(w){return VACIAS.indexOf(" "+w+" ")<0})}
  function candidatos(){
    var vistos=[],r=[];
    zonaActual.forEach(function(z){
      var els=[z].concat([].slice.call(z.querySelectorAll("tr,li,.step,.cell,dt,dd,b,strong,code,mark,span,div,p")));
      els.forEach(function(e){
        if(e.matches("h2,h3,thead tr")||e.closest("pre"))return;
        var tx=e.textContent.replace(/\s+/g," ").trim();
        if(tx.length<3||tx.length>180||vistos.indexOf(e)>=0)return;
        vistos.push(e);
        var f=fichas(tx).filter(function(w,i,a){return a.indexOf(w)===i});
        if(f.length)r.push({e:e,f:f,n:tx.length});
      });
    });
    return r;
  }
  function prepara(){
    var t=seg[pos].t,re=/[.!?…]["»”]?(\s+|$)/g,m,a=0;frases=[];
    while((m=re.exec(t))){frases.push({a:a,b:m.index+m[0].length});a=m.index+m[0].length;if(a>=t.length)break}
    if(a<t.length)frases.push({a:a,b:t.length});
    frases.forEach(function(f){f.fich=fichas(t.slice(f.a,f.b))});
    fraseAct=-1;palAct=-1;cands=candidatos();
  }
  function quitaPunto(){if(punto){punto.classList.remove("voz-punto");punto=null}}
  function senala(f){
    var S=frases[f].fich,mejor=null,ms=0;
    cands.forEach(function(c){
      var k=0,largo=0;c.f.forEach(function(w){if(S.indexOf(w)>=0){k++;largo=Math.max(largo,w.length)}});
      if(!k)return;
      if(k<2&&!(c.f.length<=2&&largo>=5))return;
      var sc=k*2+k/c.f.length-c.n/2000;
      if(sc>ms){ms=sc;mejor=c.e}
    });
    if(mejor&&mejor.closest("td,th"))mejor=mejor.closest("tr");
    if(mejor===punto)return;
    quitaPunto();
    if(!mejor)return;
    punto=mejor;punto.classList.add("voz-punto");
    var r=punto.getBoundingClientRect(),alto=innerHeight-(barra?barra.offsetHeight+30:0);
    if(r.top<70||r.bottom>alto)punto.scrollIntoView({behavior:"smooth",block:"center"});
  }
  function esc(x){return x.replace(/&/g,"&amp;").replace(/</g,"&lt;")}
  function capta(w){
    var cap=barra&&barra.querySelector(".vb-cap");if(!cap||!frases.length)return;
    var t=seg[pos].t,mk=marcas&&marcas[pos],c=w>=0?mk[w][1]:0,f=0;
    while(f<frases.length-1&&c>=frases[f].b)f++;
    if(f!==fraseAct){fraseAct=f;senala(f)}
    var fr=frases[f],i=w>=0?Math.max(mk[w][1],fr.a):fr.a,j=w>=0?Math.min(mk[w][1]+mk[w][2],fr.b):fr.a;
    cap.innerHTML='<span class="vb-dicho">'+esc(t.slice(fr.a,i))+'</span><b>'+esc(t.slice(i,j))+'</b>'+esc(t.slice(j,fr.b));
  }
  function sigue(){
    cancelAnimationFrame(bucle);
    (function paso(){
      if(!leyendo)return;
      var mk=marcas&&marcas[pos],ms=audio.currentTime*1000;
      if(mk){var w=-1;for(var i=0;i<mk.length&&mk[i][0]<=ms;i++)w=i;if(w!==palAct){palAct=w;capta(w)}}
      if(barra&&audio.duration)barra.querySelector(".vb-bar i").style.width=((pos+Math.min(1,audio.currentTime/audio.duration))/seg.length*100)+"%";
      bucle=requestAnimationFrame(paso);
    })();
  }

  function siguiente(mio){
    if(mio!==turno||!leyendo)return;
    clearTimeout(espera);
    espera=setTimeout(function(){if(mio!==turno||!leyendo)return;pos++;reproduce()},PAUSA);
  }
  /* Respaldo si falta el audio: voz del navegador. */
  function respaldo(mio){
    var S=window.speechSynthesis;if(!S){siguiente(mio);return}
    var u=new SpeechSynthesisUtterance(seg[pos].t);u.lang="es-MX";u.rate=pref.vel;
    var cap=barra&&barra.querySelector(".vb-cap");if(cap)cap.textContent=seg[pos].t;
    u.onend=function(){siguiente(mio)};S.speak(u);
  }
  function reproduce(){
    if(pos>=seg.length){termina();return}
    var mio=++turno;
    enfoca();pinta();quitaPunto();prepara();capta(-1);
    audio.onended=function(){siguiente(mio)};
    audio.onerror=function(){if(mio===turno)respaldo(mio)};
    audio.src="assets/audio/"+id+"/"+pos+".mp3";
    audio.playbackRate=pref.vel;
    sigue();
    var p=audio.play();if(p&&p.catch)p.catch(function(e){if(mio===turno&&e.name!=="AbortError")respaldo(mio)});
  }
  function calla(){cancelAnimationFrame(bucle);turno++;clearTimeout(espera);audio.pause();if(window.speechSynthesis)speechSynthesis.cancel()}
  function play(){
    if(!seg.length)return;
    if(pos>=seg.length)pos=0;
    leyendo=true;muestra(true);
    /* Si se pausó a mitad de una sección, continúa desde ese punto. */
    if(audio.currentTime>0&&!audio.ended&&audio.getAttribute("src")==="assets/audio/"+id+"/"+pos+".mp3"){
      var mio=++turno;audio.onended=function(){siguiente(mio)};audio.play();sigue();
    }else reproduce();
  }
  function pausa(){leyendo=false;calla();pinta()}
  function reinicia(){leyendo=false;calla();suelta();pos=0;audio.removeAttribute("src")}
  function termina(){reinicia();pinta(true)}
  function salta(d){
    var n=pos+d;if(n<0)n=0;if(n>=seg.length)return;
    calla();quitaPunto();audio.removeAttribute("src");pos=n;
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
    barra.innerHTML='<div class="vb-bar"><i></i></div><p class="vb-cap" aria-live="off"></p><div class="vb-in">'+
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
    id=m[1];seg=g;pos=0;leyendo=false;marcas=null;
    var esta=id;
    fetch("assets/audio/"+id+"/marcas.json").then(function(r){return r.ok?r.json():null}).then(function(j){if(esta===id)marcas=j}).catch(function(){});
    crea();
  }
  /* Al cambiar de página se calla y se quita la barra. */
  window.addEventListener("hashchange",function(){reinicia();if(luz){luz.remove();luz=null}muestra(false);if(barra)barra.remove();barra=null;boton=null});
  new MutationObserver(pasa).observe(document.getElementById("app"),{childList:true,subtree:true});
  pasa();
})();
