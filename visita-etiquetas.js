// Editor local: los agregados nunca modifican el plano base ni el repositorio.
window.createLayoutEditor = function(api) {
  const types={
    texto:{name:'Etiqueta de texto',tag:'TXT',color:'#345775'},
    extintor:{name:'Extintor',tag:'EXT',color:'#215ad1'},
    botiquin:{name:'Botiquín',tag:'+',color:'#bc2333'},
    alarma:{name:'Alarma de incendio',tag:'A',color:'#bc2333'},
    lavaojos:{name:'Lavaojos',tag:'LO',color:'#087d36'},
    banos:{name:'Baños',tag:'WC',color:'#214e75'},
    encuentro:{name:'Punto de encuentro',tag:'PE',color:'#087d36'},
    evacuacion:{name:'Flecha de evacuación',tag:'EV',color:'#087d36'},
    peatonal:{name:'Senda peatonal',tag:'SP',color:'#079c37'},
    seguridad:{name:'Senda de seguridad',tag:'SS',color:'#e3242b'},
    barrera:{name:'Barrera de seguridad',tag:'BS',color:'#e7c400'}
  };
  const directions={north:[0,-1],south:[0,1],west:[-1,0],east:[1,0]};
  const $=id=>document.getElementById(id);
  const type=$('annotationType'),text=$('annotationText'),direction=$('annotationDirection');
  const status=$('annotationStatus'),filter=$('annotationFilter'),list=$('annotationList');
  const key='dpo-casa-central-annotations-v1';
  let items=[],pending=null,start=null,cursor={x:529,z:611};
  const isPath=t=>t==='peatonal'||t==='seguridad'||t==='barrera';
  const owns=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
  const validPoint=(x,z)=>Number.isFinite(x)&&Number.isFinite(z)&&x>=-100&&x<=1100&&z>=-100&&z<=1300;
  function validate(data){
    if(!data||data.version!==1||!Array.isArray(data.items)||data.items.length>100)throw Error('Formato de archivo inválido (máximo 100 agregados).');
    const ids=new Set();
    return data.items.map(i=>{
      if(!i||typeof i.id!=='string'||i.id.length>80||ids.has(i.id)||!owns(types,i.type)||typeof i.text!=='string'||i.text.length>60||!owns(directions,i.direction)||!validPoint(i.x,i.z))throw Error('El archivo contiene una etiqueta inválida.');
      ids.add(i.id);
      const clean={id:i.id,type:i.type,text:i.text,direction:i.direction,x:i.x,z:i.z};
      if(isPath(i.type)){
        if(!validPoint(i.x2,i.z2)||(i.x!==i.x2&&i.z!==i.z2)||Math.hypot(i.x2-i.x,i.z2-i.z)<8)throw Error('El archivo contiene una senda inválida.');
        clean.x2=i.x2;clean.z2=i.z2;
      }
      return clean;
    });
  }
  function save(message){
    try{localStorage.setItem(key,JSON.stringify({version:1,items}));status.textContent=message+' Guardado en este navegador.';}
    catch{status.textContent=message+' No se pudo guardar en este navegador: exportá los agregados antes de cerrar.';}
    renderList();api.redraw();
  }
  function cancel(){pending=null;start=null;$('cancelAnnotation').disabled=true;api.canvas.classList.remove('placing');api.redraw();}
  function renderList(){
    list.replaceChildren();
    const visible=items.filter(i=>filter.value==='all'||i.type===filter.value);
    if(!visible.length){const li=document.createElement('li');li.textContent='Sin agregados de este tipo.';list.append(li);}
    visible.forEach(item=>{
      const li=document.createElement('li'),name=document.createElement('span');
      name.textContent=types[item.type].name+(item.text?' · '+item.text:'');
      const move=document.createElement('button');move.type='button';move.textContent='Reubicar';move.setAttribute('aria-label','Reubicar '+name.textContent);
      move.onclick=()=>arm(item);
      const remove=document.createElement('button');remove.type='button';remove.textContent='Eliminar';remove.setAttribute('aria-label','Eliminar '+name.textContent);
      remove.onclick=()=>{if(pending?.id===item.id)cancel();items=items.filter(i=>i.id!==item.id);save('Agregado eliminado.');};
      li.append(name,move,remove);list.append(li);
    });
  }
  function arm(existing){
    if(!existing&&items.length>=100){status.textContent='Límite de 100 agregados. Eliminá alguno para continuar.';return;}
    pending=existing?{...existing}:{id:crypto.randomUUID(),type:type.value,text:text.value.trim(),direction:direction.value};
    start=null;cursor=existing?{x:existing.x,z:existing.z}:{x:529,z:611};
    filter.value='all';renderList();api.topView();api.canvas.classList.add('placing');$('cancelAnnotation').disabled=false;
    status.textContent=isPath(pending.type)?'Marcá el inicio de la senda. Después marcá el fin.':'Tocá el gráfico para colocar la etiqueta.';
    status.textContent+=' Con teclado: flechas para mover, Enter para colocar, Escape para cancelar.';
    api.canvas.scrollIntoView({block:'center'});api.canvas.focus({preventScroll:true});api.redraw();
  }
  function place(p){
    if(!pending)return;
    const x=Math.round(p.x),z=Math.round(p.z);
    if(!validPoint(x,z)){status.textContent='Elegí un punto dentro del plano o de las calles visibles.';return;}
    if(isPath(pending.type)&&!start){start={x,z};cursor={x,z};status.textContent='Ahora marcá el fin de la senda (horizontal o vertical). Escape cancela.';api.redraw();return;}
    let item={...pending,x,z};
    if(start){
      item={...pending,...start,x2:Math.abs(x-start.x)>=Math.abs(z-start.z)?x:start.x,z2:Math.abs(x-start.x)>=Math.abs(z-start.z)?start.z:z};
      if(Math.hypot(item.x2-item.x,item.z2-item.z)<8){status.textContent='Elegí un fin más alejado del inicio.';return;}
    }
    items=items.filter(i=>i.id!==item.id);items.push(item);cancel();save('Agregado colocado.');
  }
  function draw(){
    items.filter(i=>filter.value==='all'||i.type===filter.value).forEach(item=>{
      const t=types[item.type];
      if(isPath(item.type)){
        const horizontal=item.z===item.z2;
        api.paths([[Math.min(item.x,item.x2)-(horizontal?0:9),Math.min(item.z,item.z2)-(horizontal?9:0),horizontal?Math.abs(item.x2-item.x):18,horizontal?18:Math.abs(item.z2-item.z)]],t.color,item.type!=='barrera');
      }else if(item.type==='evacuacion'){
        const [dx,dz]=directions[item.direction];api.arrow({...item,dx,dz});
      }else{
        const p=api.project(item.x,item.z),ctx=api.ctx;
        ctx.fillStyle=t.color;ctx.fillRect(p.x-13,p.y-13,26,26);
        ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(p.x-13,p.y-13,26,26);
        ctx.font='800 10px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText(t.tag,p.x,p.y);
      }
      if(item.text){
        const p=api.project(item.x,item.z),ctx=api.ctx;ctx.font='600 11px system-ui';
        const content=item.text.length>30?item.text.slice(0,29)+'…':item.text;
        const w=ctx.measureText(content).width+8;
        const x=Math.max(w/2+4,Math.min(api.canvas.clientWidth-w/2-4,p.x));
        ctx.fillStyle='#fff';ctx.fillRect(x-w/2,p.y+16,w,18);ctx.fillStyle=t.color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(content,x,p.y+25);
      }
    });
    if(pending){
      const p=api.project(cursor.x,cursor.z),ctx=api.ctx;
      ctx.strokeStyle='#0b63ce';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-10,p.y);ctx.lineTo(p.x+10,p.y);ctx.moveTo(p.x,p.y-10);ctx.lineTo(p.x,p.y+10);ctx.stroke();
      if(start){const a=api.project(start.x,start.z);ctx.fillStyle='#0b63ce';ctx.beginPath();ctx.arc(a.x,a.y,5,0,Math.PI*2);ctx.fill();}
    }
  }
  Object.entries(types).forEach(([value,t])=>{type.add(new Option(t.name,value));filter.add(new Option(t.name,value));});
  direction.disabled=true;
  type.onchange=()=>{direction.disabled=type.value!=='evacuacion';};
  $('startAnnotation').onclick=()=>arm();
  $('cancelAnnotation').onclick=()=>{cancel();status.textContent='Colocación cancelada.';};
  filter.onchange=()=>{renderList();api.redraw();};
  $('exportAnnotations').onclick=()=>{
    const url=URL.createObjectURL(new Blob([JSON.stringify({version:1,items},null,2)],{type:'application/json'}));
    const a=document.createElement('a');a.href=url;a.download='casa-central-agregados.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    status.textContent='Archivo exportado con '+items.length+' agregados.';
  };
  $('importAnnotations').onchange=async e=>{
    const file=e.target.files[0];if(!file)return;
    try{
      if(file.size>200000)throw Error('El archivo supera el tamaño permitido.');
      const imported=validate(JSON.parse(await file.text()));
      const ids=new Set(items.map(i=>i.id)),extra=imported.filter(i=>!ids.has(i.id));
      if(items.length+extra.length>100)throw Error('La importación supera el máximo de 100 agregados.');
      cancel();items.push(...extra);filter.value='all';save(extra.length+' agregados importados; los existentes se conservaron.');
    }catch(error){status.textContent='No se importó el archivo: '+error.message;}
    e.target.value='';
  };
  api.canvas.addEventListener('keydown',e=>{
    if(!pending)return;
    const delta={ArrowUp:[0,-15],ArrowDown:[0,15],ArrowLeft:[-15,0],ArrowRight:[15,0]}[e.key];
    if(delta){e.preventDefault();cursor={x:Math.max(-100,Math.min(1100,cursor.x+delta[0])),z:Math.max(-100,Math.min(1300,cursor.z+delta[1]))};api.redraw();}
    if(e.key==='Enter'){e.preventDefault();place(cursor);}
    if(e.key==='Escape'){cancel();status.textContent='Colocación cancelada.';}
  });
  try{const saved=localStorage.getItem(key);if(saved)items=validate(JSON.parse(saved));}
  catch{status.textContent='No se pudieron cargar los agregados guardados. Podés importar una copia.';}
  renderList();
  return {get placing(){return Boolean(pending);},place,draw,cancel,hover(p){if(pending){cursor=p;api.redraw();}}};
};
