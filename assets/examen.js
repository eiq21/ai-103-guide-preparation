/* Motor de preguntas con formato de examen.
   tipos: unica, multiple, sino, orden, completar */
var EXTRA={};   /* EXTRA["1-2"]={secciones:[{t,html}],preguntas:[...]} */
var CASOS=[];   /* {id,modulo,t,texto,preguntas:[...]} */
var EX=(function(){
  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
  function mezcla(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
  function inicial(q){
    if(q.tipo==="unica"||q.tipo==="multiple")return [];
    if(q.tipo==="sino")return q.afirm.map(function(){return null});
    if(q.tipo==="orden")return [];
    if(q.tipo==="completar")return q.huecos.map(function(){return -1});
  }
  function completa(q,a){
    if(q.tipo==="unica")return a.length===1;
    if(q.tipo==="multiple")return a.length===q.ok.length;
    if(q.tipo==="sino")return a.every(function(x){return x!==null});
    if(q.tipo==="orden")return a.length===q.pasos.length;
    if(q.tipo==="completar")return a.every(function(x){return x>=0});
  }
  function correcta(q,a){
    if(!completa(q,a))return false;
    if(q.tipo==="unica"||q.tipo==="multiple")return q.ok.every(function(v){return a.indexOf(v)>=0});
    if(q.tipo==="sino")return q.afirm.every(function(f,i){return f.ok===a[i]});
    if(q.tipo==="orden")return q.pasos.every(function(p,i){return p===a[i]});
    if(q.tipo==="completar")return q.huecos.every(function(h,i){return h.ok===a[i]});
  }
  function respuestaTexto(q){
    if(q.tipo==="unica"||q.tipo==="multiple")return q.ok.map(function(i){return esc(q.ops[i])}).join(" + ");
    if(q.tipo==="sino")return q.afirm.map(function(f){return esc(f.t)+": <b>"+(f.ok?"Sí":"No")+"</b>"}).join("<br>");
    if(q.tipo==="orden")return q.pasos.map(function(p,i){return (i+1)+". "+esc(p)}).join("<br>");
    if(q.tipo==="completar")return q.huecos.map(function(h,i){return "Hueco "+(i+1)+": <code>"+esc(h.ops[h.ok])+"</code>"}).join("<br>");
  }
  var ETIQ={unica:"seleccione una",multiple:"",sino:"indique Sí o No en cada afirmación",orden:"ordene los pasos",completar:"complete el código"};
  /* opts: {modo:"practica"|"examen",rotulo,cambio()} */
  function monta(el,q,opts){
    var ans=opts.ans||inicial(q),fin=false;
    var ordenOps=q.ops?mezcla(q.ops.map(function(_,i){return i})):[];
    var banco=q.tipo==="orden"?mezcla(q.pasos.concat(q.sobran||[])):[];
    var ids=Math.random().toString(36).slice(2,7);
    function html(){
      var etiq=q.tipo==="multiple"?"seleccione "+q.ok.length:ETIQ[q.tipo];
      var h='<div class="qb"><span class="qn">'+esc(opts.rotulo||"nivel examen")+' · '+etiq+'</span>';
      if(q.esc)h+='<p class="esc">'+esc(q.esc)+'</p>';
      h+='<p class="qt">'+esc(q.q)+'</p>';
      if(q.tipo==="unica"||q.tipo==="multiple"){
        h+='<div class="opts">'+ordenOps.map(function(o,i){var c="opt";
          if(fin){if(q.ok.indexOf(o)>=0)c+=" ok";else if(ans.indexOf(o)>=0)c+=" no"}
          return '<button class="'+c+'" data-o="'+o+'" aria-pressed="'+(ans.indexOf(o)>=0)+'"'+(fin?" disabled":"")+'><span>'+"ABCDEF".charAt(i)+'</span><span>'+esc(q.ops[o])+'</span></button>'}).join("")+'</div>';
      }
      if(q.tipo==="sino"){
        h+='<div class="tw"><table><thead><tr><th>Afirmación</th><th>Sí</th><th>No</th></tr></thead><tbody>'+q.afirm.map(function(f,i){
          function cel(v){var on=ans[i]===v,c="yn";if(fin&&f.ok===v)c+=" ok";else if(fin&&on)c+=" no";
            return '<td><button class="'+c+'" data-s="'+i+'" data-v="'+(v?1:0)+'" aria-pressed="'+on+'"'+(fin?" disabled":"")+'>'+(v?"Sí":"No")+'</button></td>'}
          return '<tr><td>'+esc(f.t)+'</td>'+cel(true)+cel(false)+'</tr>'}).join("")+'</tbody></table></div>';
      }
      if(q.tipo==="orden"){
        h+='<div class="ordcols"><div><span class="qn">acciones</span>'+banco.map(function(p,i){var usado=ans.indexOf(p)>=0;
          return '<button class="opt ord" data-p="'+i+'"'+(usado||fin?" disabled":"")+'><span>+</span><span>'+esc(usado?"(seleccionada)":p)+'</span></button>'}).join("")+'</div>'+
          '<div><span class="qn">secuencia</span>'+(ans.length?ans.map(function(p,i){var c="opt ord";if(fin)c+=q.pasos[i]===p?" ok":" no";
          return '<button class="'+c+'" data-q="'+i+'"'+(fin?" disabled":"")+'><span>'+(i+1)+'</span><span>'+esc(p)+'</span></button>'}).join(""):'<p class="qn">Seleccione las acciones en orden.</p>')+'</div></div>';
      }
      if(q.tipo==="completar"){
        var t=esc(q.codigo).replace(/\{\{(\d+)\}\}/g,function(_,n){n=+n;var hu=q.huecos[n];
          var c="hueco";if(fin)c+=ans[n]===hu.ok?" ok":" no";
          return '<select class="'+c+'" data-h="'+n+'" aria-label="Hueco '+(n+1)+'"'+(fin?" disabled":"")+'><option value="-1">elegir…</option>'+hu.ops.map(function(o,i){return '<option value="'+i+'"'+(ans[n]===i?" selected":"")+'>'+esc(o)+'</option>'}).join("")+'</select>'});
        h+='<pre class="cod"><code>'+t+'</code></pre>';
      }
      if(opts.modo==="practica"&&!fin)h+='<div><button class="btn" data-c'+(completa(q,ans)?"":" disabled")+'>Comprobar</button></div>';
      if(fin)h+=retro(q,ans);
      return h+'</div>';
    }
    function pinta(){el.innerHTML=html()}
    function cambio(){if(opts.cambio)opts.cambio(ans)}
    el.onclick=function(e){
      if(fin)return;
      if(e.target.closest("[data-c]")){fin=true;pinta();if(opts.fin)opts.fin(correcta(q,ans));return}
      var b;
      if((b=e.target.closest("[data-o]"))){var o=+b.getAttribute("data-o");
        if(q.tipo==="unica")ans=[o];else{var i=ans.indexOf(o);if(i>=0)ans.splice(i,1);else if(ans.length<q.ok.length)ans.push(o)}
      }else if((b=e.target.closest("[data-s]"))){ans[+b.getAttribute("data-s")]=b.getAttribute("data-v")==="1"}
      else if((b=e.target.closest("[data-p]"))){var p=banco[+b.getAttribute("data-p")];if(ans.length<q.pasos.length)ans.push(p)}
      else if((b=e.target.closest("[data-q]"))){ans.splice(+b.getAttribute("data-q"),1)}
      else return;
      pinta();cambio();
    };
    el.onchange=function(e){var s=e.target.closest("[data-h]");if(!s)return;ans[+s.getAttribute("data-h")]=+s.value;cambio();pinta()};
    pinta();
    return {respuesta:function(){return ans},completa:function(){return completa(q,ans)},correcta:function(){return correcta(q,ans)}};
  }
  function retro(q,a){
    var ok=correcta(q,a);
    return '<div class="why"><p><b>'+(ok?"Correcto.":"Incorrecto.")+'</b> '+esc(q.exp)+'</p>'+(q.fuente?'<p><a href="'+esc(q.fuente)+'" target="_blank" rel="noopener">Ver fuente oficial</a></p>':"")+'</div>';
  }
  return {monta:monta,completa:completa,correcta:correcta,respuestaTexto:respuestaTexto,mezcla:mezcla,esc:esc};
})();
