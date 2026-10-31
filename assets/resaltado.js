/* Colorea el código por función: cada color representa siempre el mismo papel. */
(function(){
  var KW="from|import|def|class|return|if|else|elif|for|while|in|with|as|try|except|raise|await|async|not|and|or|lambda|pass|None|True|False|true|false|null|GET|POST|PUT|PATCH|DELETE";
  var RE=new RegExp([
    '((?:^|(?<=\\s))(?:#|//)(?!/).*$)',                 /* 1 comentario */
    '("(?:[^"\\\\\\n]|\\\\.)*"|\'(?:[^\'\\\\\\n]|\\\\.)*\')', /* 2 cadena */
    '(\\b(?:'+KW+')\\b)',                               /* 3 palabra clave */
    '((?<=\\s)--?[a-zA-Z][\\w-]*)',                     /* 4 opción de CLI */
    '(\\b[A-Z][A-Z0-9_]{2,}\\b)',                       /* 5 constante */
    '(\\b[A-Z]+[a-z0-9]+[A-Z]\\w*\\b|\\b[A-Z]\\w*(?=\\())', /* 6 clase */
    '(\\b[a-zA-Z_]\\w*(?=\\())',                        /* 7 función o método */
    '(\\b[a-zA-Z_]\\w*(?==[^=]))',                      /* 8 parámetro */
    '(\\b\\d+(?:\\.\\d+)?\\b)'                          /* 9 número */
  ].join('|'),'gm');
  var CLASE={1:"h-com",2:"h-str",3:"h-kw",4:"h-par",5:"h-cte",6:"h-cls",7:"h-fn",8:"h-par",9:"h-cte"};
  function tiñe(nodo){
    var t=nodo.nodeValue,fr=document.createDocumentFragment(),u=0,m,hay=false;
    RE.lastIndex=0;
    while((m=RE.exec(t))){
      if(!m[0]){RE.lastIndex++;continue}
      var g=1;while(g<10&&m[g]===undefined)g++;
      var c=CLASE[g];
      if(g===2&&/^\s*:/.test(t.slice(m.index+m[0].length)))c="h-key";
      if(m.index>u)fr.appendChild(document.createTextNode(t.slice(u,m.index)));
      var s=document.createElement("span");s.className=c;s.textContent=m[0];fr.appendChild(s);
      u=m.index+m[0].length;hay=true;
    }
    if(!hay)return;
    if(u<t.length)fr.appendChild(document.createTextNode(t.slice(u)));
    nodo.parentNode.replaceChild(fr,nodo);
  }
  function leyenda(){
    var d=document.createElement("p");d.className="hl-ley";
    d.innerHTML='<b>Colores del código:</b> <span class="h-kw">palabra reservada</span> <span class="h-cls">clase</span> <span class="h-fn">método</span> <span class="h-par">parámetro</span> <span class="h-key">clave JSON</span> <span class="h-str">texto</span> <span class="h-cte">valor o constante</span> <span class="h-com">comentario</span>';
    return d;
  }
  function pasa(raiz){
    var hay=false;
    raiz.querySelectorAll("pre code").forEach(function(c){
      if(c.dataset.hl||c.closest(".pat"))return;
      c.dataset.hl="1";hay=true;
      var w=document.createTreeWalker(c,NodeFilter.SHOW_TEXT,{acceptNode:function(n){return n.parentNode.closest("select")?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}}),ns=[],n;
      while((n=w.nextNode()))ns.push(n);
      ns.forEach(tiñe);
    });
    if(hay&&!raiz.querySelector(".hl-ley")){
      var p=[].filter.call(raiz.querySelectorAll(".prose pre"),function(x){return !x.closest(".qb,.pat")})[0];
      if(p)p.parentNode.insertBefore(leyenda(),p.nextSibling);
    }
  }
  var app=document.getElementById("app");
  new MutationObserver(function(){pasa(app)}).observe(app,{childList:true,subtree:true});
})();
