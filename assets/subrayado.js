/* Resaltador de estudio: marca frases de cada lección con un color por función.
   Los datos viven en SUBRAYADO (subrayado-datos.js): {"4-1":[["clave","frase exacta"], ...]}.
   Colores: clave (idea central), decision (regla para elegir), dato (memorizar), trampa (error común).
   No se marcan las preguntas, para no adelantar respuestas. */
(function(){
  var CLAVE="ai103-subrayado";
  var NOMBRES={clave:"Idea clave",decision:"Regla de decisión",dato:"Dato para memorizar",trampa:"Trampa"};
  var activo=true;
  try{activo=localStorage.getItem(CLAVE)!=="off"}catch(e){}
  function aplicaEstado(){document.body.classList.toggle("sub-off",!activo)}
  aplicaEstado();

  var EXCLUIR="pre,select,button,.flow,.stairs,.qb,.sub,.ruta,.meta,.les-t,.subbar,.hl-ley";
  function nodosTexto(raiz){
    var w=document.createTreeWalker(raiz,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      return n.parentNode.closest(EXCLUIR)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),r=[],n;
    while((n=w.nextNode()))r.push(n);
    return r;
  }
  function marca(raiz,color,frase){
    var ns=nodosTexto(raiz);
    for(var i=0;i<ns.length;i++){
      var t=ns[i].nodeValue,p=t.indexOf(frase);
      if(p<0)continue;
      var resto=ns[i].splitText(p);resto.splitText(frase.length);
      var m=document.createElement("mark");
      m.className="sub sub-"+color;m.title=NOMBRES[color]||"";
      resto.parentNode.replaceChild(m,resto);m.appendChild(resto);
      return true;
    }
    return false;
  }
  function barra(){
    var d=document.createElement("div");d.className="subbar";
    d.innerHTML='<button class="btn" type="button" aria-pressed="'+activo+'">'+(activo?"Resaltador activado":"Resaltador desactivado")+'</button>'+
      '<span class="subley">'+Object.keys(NOMBRES).map(function(k){return '<mark class="sub sub-'+k+'">'+NOMBRES[k]+'</mark>'}).join(" ")+'</span>';
    d.querySelector("button").addEventListener("click",function(){
      activo=!activo;try{localStorage.setItem(CLAVE,activo?"on":"off")}catch(e){}
      aplicaEstado();this.setAttribute("aria-pressed",activo);this.textContent=activo?"Resaltador activado":"Resaltador desactivado";
    });
    return d;
  }
  function pasa(){
    var art=document.querySelector("#app article");
    if(!art||art.dataset.sub)return;
    var m=location.hash.match(/^#\/lesson\/(\d-\d)$/);
    var lista=m&&window.SUBRAYADO&&SUBRAYADO[m[1]];
    if(!lista||!lista.length)return;
    art.dataset.sub="1";
    var prosa=art.querySelector(".prose")||art;
    lista.forEach(function(x){marca(prosa,x[0],x[1])});
    var obj=prosa.querySelector(".obj");
    if(obj)obj.parentNode.insertBefore(barra(),obj.nextSibling);
  }
  var app=document.getElementById("app");
  new MutationObserver(pasa).observe(app,{childList:true,subtree:true});
  pasa();
})();
