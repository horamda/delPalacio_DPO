(() => {
  const sectors = window.CASA_CENTRAL_LAYOUT;
  // Transformación de píxeles del plano a unidades abstractas, sin escala métrica.
  const point = (px, py) => ({x:(px-529)/80, y:0, z:(py-611)/80});
  const shapes = sectors.flatMap(s => (s.rects || []).map(([left,top,w,d],i) => ({
    ...s, ...point(left+w/2,top+d/2), w:w/80, d:d/80, label:i===0
  })));
  const scene=window.buildVisitorScene(shapes);
  let editor;
  const byId = Object.fromEntries(sectors.map(s => [s.id,s]));
  const canvas = document.querySelector('#warehouseCanvas');
  const ctx = canvas.getContext('2d');
  const list = document.querySelector('#sectorList');
  const title = document.querySelector('#currentTitle');
  const note = document.querySelector('#currentNote');
  const copy = document.querySelector('#copySectorLink');
  const source = document.querySelector('#selectionSource');
  const link = document.querySelector('#sectorLink');
  const status = document.querySelector('#copyStatus');
  const walkwaysToggle = document.querySelector('#showWalkways');
  const safetyToggle = document.querySelector('#showSafetyPaths');
  const evacuationToggle = document.querySelector('#showEvacuation');
  const labelsToggle = document.querySelector('#showSectorLabels');
  const tooltip=document.querySelector('#mapTooltip'),density=document.querySelector('#labelDensity');
  let selected = null, yaw = -.13, pitch = .95, zoomFactor = 1, panX=0,panY=0,panMode=false,dragging = false, moved = false, lastX = 0, lastY=0, hitAreas = [], labelAreas = [];
  function fittedYaw(flat){return canvas.clientWidth>canvas.clientHeight*1.15 ? (flat?-Math.PI/2:-1.35) : (flat?0:-.13);}
  function scale(){
    // Fit the complete site and surrounding streets, reserving only the toolbars.
    const width=15.1*Math.abs(Math.cos(yaw))+17.3*Math.abs(Math.sin(yaw));
    const depth=(15.1*Math.abs(Math.sin(yaw))+17.3*Math.abs(Math.cos(yaw)))*Math.sin(pitch)+.9*Math.cos(pitch);
    return Math.max(1,Math.min((canvas.clientWidth-30)/width,(canvas.clientHeight-(canvas.clientWidth>900?100:180))/depth))*zoomFactor;
  }
  function originY(){return canvas.clientHeight*.5+(canvas.clientWidth>900?20:-10);}

  sectors.forEach(s => {
    const b = document.createElement('button');
    b.className = 'sector-button'; b.type = 'button'; b.dataset.sector = s.id;
    b.style.setProperty('--sector-color',s.color);
    b.innerHTML = `<span class="dot" aria-hidden="true"></span><strong>${s.name}</strong><small>${s.tag}</small>`;
    b.addEventListener('click',() => select(s.id,true)); list.appendChild(b);
  });

  function safeSector(value){ return Object.hasOwn(byId,value) ? value : null; }
  function select(id,updateUrl=false){
    selected = safeSector(id); const s = byId[selected];
    title.textContent = s ? s.name : 'Elegí un sector';
    note.textContent = s ? (s.note || 'Sector identificado en el Layout general 2026 de Casa Central. Volumen ilustrativo; sin medidas ni altura verificadas.') : id === 'ingreso' ? 'El ingreso genérico del MVP no está identificado en este plano. Elegí un sector rotulado.' : id ? 'El enlace no identifica un sector válido. Seleccioná uno del listado.' : 'Escaneá el QR de un sector o elegí uno del listado.';
    source.textContent = s ? updateUrl ? 'Selección manual' : 'Sector indicado por el enlace / QR' : 'Sin sector indicado';
    document.querySelector('#viewSelection').textContent = s ? 'Resaltado: ' + s.name : 'Elegí un sector del mapa o del listado';
    copy.disabled = !s;
    document.querySelector('#focusSector').disabled=!s;
    status.textContent = '';
    const u = new URL(location.href);
    if(s) u.searchParams.set('sector',selected);
    link.value = s ? u.href : '';
    canvas.setAttribute('aria-label', `Casa Central: esquema 3D basado en el layout 2026; alturas ilustrativas.${s ? ' Sector resaltado: ' + s.name : ' Sin sector seleccionado.'}`);
    document.querySelectorAll('.sector-button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sector === selected)));
    if(updateUrl && s) history.pushState({},'',u);
    draw();
    dispatchEvent(new CustomEvent('sectorselected',{detail:{id:selected,manual:updateUrl}}));
  }

  let wideFrame;
  function resize(){ if(!ctx)return; const wide=canvas.clientWidth>canvas.clientHeight*1.15;
    if(wide!==wideFrame && zoomFactor===1 && panX===0 && panY===0)yaw=fittedYaw(Math.abs(pitch-Math.PI/2)<.001);
    wideFrame=wide; const dpr=Math.min(devicePixelRatio||1,2); const r=canvas.getBoundingClientRect(); canvas.width=r.width*dpr; canvas.height=r.height*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); draw(); }
  function project(p){
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
    const x=p.x*cy-p.z*sy, z=p.x*sy+p.z*cy;
    return { x:canvas.clientWidth/2+panX+x*scale(), y:originY()+panY-(p.y*cp-z*sp)*scale() };
  }
  function shade(hex,amt){ const n=parseInt(hex.slice(1),16),r=Math.max(0,Math.min(255,(n>>16)+amt)),g=Math.max(0,Math.min(255,((n>>8)&255)+amt)),b=Math.max(0,Math.min(255,(n&255)+amt)); return `rgb(${r},${g},${b})`; }
  function poly(points,fill,stroke='rgba(17,31,48,.22)',width=1){ ctx.beginPath(); points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); ctx.strokeStyle=stroke; ctx.lineWidth=width; ctx.stroke(); }
  function box(s){
    const x0=s.x-s.w/2,x1=s.x+s.w/2,z0=s.z-s.d/2,z1=s.z+s.d/2,y0=s.y0||0,y=y0+s.h;
    const a=project({x:x0,y:y0,z:z0}),b=project({x:x1,y:y0,z:z0}),c=project({x:x1,y:y0,z:z1}),d=project({x:x0,y:y0,z:z1});
    const A=project({x:x0,y,z:z0}),B=project({x:x1,y,z:z0}),C=project({x:x1,y,z:z1}),D=project({x:x0,y,z:z1});
    const active=s.id===selected || s.parent===selected, edge=active?'#ffd43b':'rgba(17,31,48,.22)', lw=active?1.5:.5;
    const faces=[];
    if(Math.cos(yaw)<0) faces.push([[a,b,B,A],-24]);
    if(Math.sin(yaw)>0) faces.push([[b,c,C,B],-38]);
    if(Math.cos(yaw)>=0) faces.push([[c,d,D,C],-12]);
    if(Math.sin(yaw)<=0) faces.push([[d,a,A,D],-30]);
    faces.push([[A,B,C,D],18]);
    faces.forEach(([points,tint])=>{ poly(points,active ? shade('#ffd43b',tint) : shade(s.color,tint),edge,lw); if(byId[s.id])hitAreas.push({id:s.id,poly:points}); });
  }
  function label(s){
    const active=s.id===selected||s.parent===selected;
    if(density.value==='selected'&&!active)return;
    const center=project({x:s.x,y:1.05,z:s.z});
    const size=canvas.clientWidth<600?10:11;
    const name=canvas.clientWidth<650?s.tag:s.name.replace(' · Picking','');
    ctx.font=`700 ${size}px system-ui`;
    const width=ctx.measureText(name).width+12;
    let x=center.x,y=center.y;
    const candidates=[];
    for(let row=-4;row<=4;row++)for(const col of [0,-1,1])candidates.push({x:center.x+col*(width*.6+12),y:center.y+row*(size+12)});
    candidates.sort((a,b)=>Math.hypot(a.x-center.x,a.y-center.y)-Math.hypot(b.x-center.x,b.y-center.y));
    const free=candidates.find(p=>p.x-width/2>4&&p.x+width/2<canvas.clientWidth-4&&p.y-size>66&&p.y<canvas.clientHeight-114&&!labelAreas.some(r=>p.x+width/2>r.left&&p.x-width/2<r.right&&p.y>r.top&&p.y-size-8<r.bottom));
    if(!free&&density.value==='auto'&&!active)return;
    if(free){x=free.x;y=free.y;}
    labelAreas.push({left:x-width/2,right:x+width/2,top:y-size-5,bottom:y});
    if(y!==center.y || x!==center.x){ctx.beginPath();ctx.moveTo(center.x,center.y);ctx.lineTo(x,y);ctx.strokeStyle='#52667d';ctx.lineWidth=1;ctx.stroke();}
    x=Math.max(width/2+5,Math.min(canvas.clientWidth-width/2-5,x));
    ctx.fillStyle=active?'#075c99':'#062d48';ctx.fillRect(x-width/2,y-size-5,width,size+8);
    ctx.strokeStyle='#f2f5f0';ctx.lineWidth=1;ctx.strokeRect(x-width/2,y-size-5,width,size+8);
    ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillStyle='#fff';ctx.fillText(name,x,y);
    hitAreas.push({id:s.id,poly:[{x:x-width/2,y:y-size-5},{x:x+width/2,y:y-size-5},{x:x+width/2,y:y+3},{x:x-width/2,y:y+3}]});
  }
  function drawStripedPaths(paths,color,striped=true){
    function rect(x,z,w,d,fill){
      poly([[x,z],[x+w,z],[x+w,z+d],[x,z+d]].map(([px,py])=>project(point(px,py))),fill,fill,.4);
    }
    paths.forEach(([x,z,w,d])=>{
      rect(x,z,w,d,color);
      if(!striped)return;
      // Rayado transversal blanco, conservando el color de cada tipo de senda.
      if(w>d){ for(let offset=4;offset<w-3;offset+=10) rect(x+offset,z+3,Math.min(4,w-offset-3),d-6,'#ffffff'); }
      else { for(let offset=4;offset<d-3;offset+=10) rect(x+3,z+offset,w-6,Math.min(4,d-offset-3),'#ffffff'); }
    });
  }
  function drawArrow({x,z,dx,dz}){
      // Flecha orientada en el plano del suelo; gira con la cámara.
      const outline=[[-6,-16],[6,-16],[6,5],[12,5],[0,20],[-12,5],[-6,5]];
      const vertices=outline.map(([side,forward])=>project(point(x-dz*side+dx*forward,z+dx*side+dz*forward)));
      poly(vertices,'#00c52c','#087d36',.6);
      labelAreas.push({left:Math.min(...vertices.map(p=>p.x))-3,right:Math.max(...vertices.map(p=>p.x))+3,top:Math.min(...vertices.map(p=>p.y))-3,bottom:Math.max(...vertices.map(p=>p.y))+3});
  }
  function drawEvacuation(){
    if(!evacuationToggle.checked)return;
    [...window.CASA_CENTRAL_EVACUATION,...window.CASA_CENTRAL_EXTERIOR_EVACUATION,...window.CASA_CENTRAL_DOCK_EVACUATION].forEach(drawArrow);
  }
  function drawStreets(){
    const rect=(x,z,w,d,color)=>poly([[x,z],[x+w,z],[x+w,z+d],[x,z+d]].map(([a,b])=>project(point(a,b))),color,color,.5);
    rect(-75,-80,1080,128,'#555e63');rect(-75,48,131,1126,'#555e63');rect(-75,1174,1080,106,'#555e63');
    rect(45,95,10,1040,'#cdd0c9');rect(98,38,905,10,'#cdd0c9');rect(94,1173,909,10,'#cdd0c9');
    ctx.save();ctx.fillStyle='#fff';ctx.font='700 12px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
    [['CALLE CHASCOMÚS',529,-48,1,0],['CALLE JULIO CAMPOS',529,1250,1,0],['CALLE SACCONI',-48,650,0,1]].forEach(([name,x,z,dx,dz])=>{
      const p=project(point(x,z)),q=project(point(x+dx*50,z+dz*50));
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(q.y-p.y,q.x-p.x));ctx.fillText(name,0,0);ctx.restore();
    });ctx.restore();
  }
  function drawMeetingPoint(){
    const {x,z}=window.CASA_CENTRAL_MEETING_POINT;
    const p=project(point(x,z)), half=16;
    const corners=[{x:p.x-half,y:p.y-half},{x:p.x+half,y:p.y-half},{x:p.x+half,y:p.y+half},{x:p.x-half,y:p.y+half}];
    poly(corners,'#087d36',selected==='punto-encuentro'?'#ffd43b':'#ffffff',selected==='punto-encuentro'?4:2);
    ctx.fillStyle='#ffffff';ctx.font='800 13px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('PE',p.x,p.y);
    hitAreas.push({id:'punto-encuentro',poly:corners});
  }
  function draw(){
    if(!ctx || !canvas.clientWidth)return; ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight); hitAreas=[];labelAreas=[];
    document.querySelector('#zoomLevel').textContent=Math.round(zoomFactor*100)+'%';
    const flat=Math.abs(pitch-Math.PI/2)<.001;
    document.querySelector('#topView').setAttribute('aria-pressed',String(flat));
    document.querySelector('#perspectiveView').setAttribute('aria-pressed',String(!flat));
    document.querySelector('#compassArrow').style.transform=`rotate(${Math.atan2(-Math.cos(yaw)*Math.sin(pitch),Math.sin(yaw))+Math.PI/2}rad)`;
    document.querySelector('#panMode').setAttribute('aria-pressed',String(panMode));
    canvas.classList.toggle('panning',panMode);
    document.querySelector('#mapGestureHint').textContent=panMode?'Arrastrá para mover · + / − para acercar':'Arrastrá para girar · + / − para acercar · alturas ilustrativas';
    drawStreets();
    const perimeter=[[98,50],[1003,50],[1003,1173],[94,1173],[56,1136],[56,89]];
    poly(perimeter.map(([x,z])=>project(point(x,z))), '#bfc0b5', '#7d8785', 3);
    // Contorno aproximado del edificio principal; patios y circulación quedan libres.
    poly([[567,206],[937,206],[937,1171],[567,1171]].map(([x,z])=>project(point(x,z))), '#d8d0b9', '#a5a694');
    // Juntas de piso ilustrativas, sin escala métrica.
    for(let z=100;z<1170;z+=65){const a=project(point(60,z)),b=project(point(1000,z));ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle='rgba(61,73,69,.1)';ctx.lineWidth=.6;ctx.stroke();}
    if(flat){shapes.forEach(s=>box({...s,h:.015}));}
    else {
      shapes.forEach(s=>{const dx=.13,dz=.16;poly([{x:s.x-s.w/2+dx,y:0,z:s.z-s.d/2+dz},{x:s.x+s.w/2+dx,y:0,z:s.z-s.d/2+dz},{x:s.x+s.w/2+dx,y:0,z:s.z+s.d/2+dz},{x:s.x-s.w/2+dx,y:0,z:s.z+s.d/2+dz}].map(project),'rgba(33,42,38,.13)','transparent',0);});
      [...scene].sort((m,n)=>((m.x*Math.sin(yaw)+m.z*Math.cos(yaw)+(m.y0||0)*.001)-(n.x*Math.sin(yaw)+n.z*Math.cos(yaw)+(n.y0||0)*.001))).forEach(box);
    }
    // Capas visibles sobre la geometría: no perder tramos detrás de bloques.
    if(walkwaysToggle.checked) drawStripedPaths(window.CASA_CENTRAL_WALKWAYS,'#079c37');
    if(safetyToggle.checked) drawStripedPaths(window.CASA_CENTRAL_SAFETY_PATHS,'#e3242b');
    // Señalización superpuesta para que la geometría simplificada no oculte flechas.
    drawEvacuation();
    if(labelsToggle.checked){
      shapes.filter(s=>s.label && (s.id===selected || s.parent===selected)).forEach(label);
      shapes.filter(s=>s.label && s.id!==selected && s.parent!==selected).forEach(label);
    }
    drawMeetingPoint();
    editor?.draw();
  }
  function inside(p,poly){ let c=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ if(((poly[i].y>p.y)!==(poly[j].y>p.y))&&(p.x<(poly[j].x-poly[i].x)*(p.y-poly[i].y)/(poly[j].y-poly[i].y)+poly[i].x))c=!c; } return c; }
  function unproject(p){const rx=(p.x-canvas.clientWidth/2-panX)/scale(),rz=(p.y-originY()-panY)/(scale()*Math.sin(pitch));return {x:(rx*Math.cos(yaw)+rz*Math.sin(yaw))*80+529,z:(-rx*Math.sin(yaw)+rz*Math.cos(yaw))*80+611};}
  function hover(e){
    if(e.pointerType==='touch')return;
    const r=canvas.getBoundingClientRect(),p={x:e.clientX-r.left,y:e.clientY-r.top};
    const hit=[...hitAreas].reverse().find(h=>inside(p,h.poly));
    tooltip.hidden=!hit;
    if(hit){tooltip.textContent=byId[hit.id].name;tooltip.style.left=Math.max(8,Math.min(p.x+14,canvas.clientWidth-tooltip.offsetWidth-8))+'px';tooltip.style.top=Math.max(8,p.y-38)+'px';}
  }
  canvas.addEventListener('pointerleave',()=>{tooltip.hidden=true;});
  canvas.addEventListener('pointerdown',e=>{tooltip.hidden=true; dragging=true;moved=false;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove',e=>{if(editor?.placing){const r=canvas.getBoundingClientRect();editor.hover(unproject({x:e.clientX-r.left,y:e.clientY-r.top}));if(dragging&&Math.hypot(e.clientX-lastX,e.clientY-lastY)>6)moved=true;return;} if(!dragging){hover(e);return;} const dx=e.clientX-lastX,dy=e.clientY-lastY; if(Math.hypot(dx,dy)>1){moved=true;if(panMode){panX=Math.max(-canvas.clientWidth*2,Math.min(canvas.clientWidth*2,panX+dx));panY=Math.max(-canvas.clientHeight*2,Math.min(canvas.clientHeight*2,panY+dy));}else yaw+=dx*.009;lastX=e.clientX;lastY=e.clientY;draw();} });
  canvas.addEventListener('pointerup',e=>{ dragging=false; if(!moved){ const r=canvas.getBoundingClientRect(),p={x:e.clientX-r.left,y:e.clientY-r.top};if(editor?.placing){editor.place(unproject(p));return;} const hit=[...hitAreas].reverse().find(h=>inside(p,h.poly)); if(hit)select(hit.id,true); } });
  canvas.addEventListener('pointercancel',()=>{dragging=false;moved=false;});
  canvas.addEventListener('lostpointercapture',()=>{dragging=false;});
  function zoomBy(delta){const before=zoomFactor;zoomFactor=Math.max(.6,Math.min(2.4,zoomFactor+delta));panX*=zoomFactor/before;panY*=zoomFactor/before;draw();}
  function view(flat){editor?.cancel();yaw=fittedYaw(flat);pitch=flat?Math.PI/2:.95;zoomFactor=1;panX=panY=0;panMode=flat;tooltip.hidden=true;draw();}
  function focusSector(){
    if(!selected)return;editor?.cancel();zoomFactor=1;panX=panY=0;
    const bounds=shapes.filter(s=>s.id===selected||s.parent===selected).flatMap(s=>[-1,1].flatMap(a=>[-1,1].map(b=>project({x:s.x+a*s.w/2,y:0,z:s.z+b*s.d/2}))));
    if(!bounds.length){bounds.push(project(point(window.CASA_CENTRAL_MEETING_POINT.x,window.CASA_CENTRAL_MEETING_POINT.z)));}
    const xs=bounds.map(p=>p.x),ys=bounds.map(p=>p.y),left=Math.min(...xs),right=Math.max(...xs),top=Math.min(...ys),bottom=Math.max(...ys);
    zoomFactor=Math.max(.6,Math.min(2.4,(canvas.clientWidth-70)/(right-left+70),(canvas.clientHeight-220)/(bottom-top+70)));
    panX=-( (left+right)/2-canvas.clientWidth/2)*zoomFactor;panY=-((top+bottom)/2-originY())*zoomFactor;draw();
  }
  canvas.addEventListener('wheel',e=>{if(!e.ctrlKey&&!e.metaKey)return; e.preventDefault();zoomBy(-e.deltaY*.001); },{passive:false});
  canvas.addEventListener('keydown',e=>{
    if(editor?.placing)return;
    if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();if(panMode){panX+=e.key==='ArrowLeft'?-25:e.key==='ArrowRight'?25:0;panY+=e.key==='ArrowUp'?-25:e.key==='ArrowDown'?25:0;}else if(e.key==='ArrowLeft'||e.key==='ArrowRight')yaw+=e.key==='ArrowLeft'?-.25:.25;draw();}
    if(e.key==='+'||e.key==='='){e.preventDefault();zoomBy(.15);}
    if(e.key==='-'){e.preventDefault();zoomBy(-.15);}
    if(e.key==='Home'){e.preventDefault();document.querySelector('#resetView').click();}
  });
  document.querySelector('#zoomIn').addEventListener('click',()=>zoomBy(.15));
  document.querySelector('#zoomOut').addEventListener('click',()=>zoomBy(-.15));
  document.querySelector('#rotateLeft').addEventListener('click',()=>{editor?.cancel();yaw-=.25;draw();});
  document.querySelector('#rotateRight').addEventListener('click',()=>{editor?.cancel();yaw+=.25;draw();});
  document.querySelector('#resetView').addEventListener('click',()=>view(Math.abs(pitch-Math.PI/2)<.001));
  document.querySelector('#topView').addEventListener('click',()=>view(true));
  document.querySelector('#perspectiveView').addEventListener('click',()=>view(false));
  document.querySelector('#focusSector').addEventListener('click',focusSector);
  document.querySelector('#panMode').addEventListener('click',()=>{editor?.cancel();panMode=!panMode;draw();});
  walkwaysToggle.addEventListener('change',draw);
  safetyToggle.addEventListener('change',draw);
  evacuationToggle.addEventListener('change',draw);
  labelsToggle.addEventListener('change',draw);
  density.addEventListener('change',draw);
  copy.addEventListener('click',async()=>{ if(!selected)return; try{await navigator.clipboard.writeText(link.value);status.textContent='Enlace copiado. Podés usarlo para generar el QR.';}catch{document.querySelector('.share-details').open=true;link.focus();link.select();status.textContent='Copiá el enlace seleccionado con el menú de tu dispositivo.';} });
  addEventListener('popstate',()=>select(new URLSearchParams(location.search).get('sector')));
  editor=window.createLayoutEditor({canvas,ctx,redraw:draw,project:(x,z)=>project(point(x,z)),paths:drawStripedPaths,arrow:drawArrow,topView(){yaw=0;pitch=Math.PI/2;zoomFactor=1;panX=panY=0;panMode=false;draw();}});
  yaw=fittedYaw(false);
  addEventListener('resize',resize); select(new URLSearchParams(location.search).get('sector')); resize();
  new ResizeObserver(resize).observe(canvas);
})();
