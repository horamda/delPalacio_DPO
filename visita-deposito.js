(() => {
  const sectors = window.CASA_CENTRAL_LAYOUT;
  // Transformación de píxeles del plano a unidades abstractas, sin escala métrica.
  const point = (px, py) => ({x:(px-529)/80, y:0, z:(py-611)/80});
  const shapes = sectors.flatMap(s => (s.rects || []).map(([left,top,w,d],i) => ({
    ...s, ...point(left+w/2,top+d/2), w:w/80, d:d/80, label:i===0
  })));
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
  let selected = null, yaw = -.3, pitch = .95, zoomFactor = 1, dragging = false, moved = false, lastX = 0, hitAreas = [], labelAreas = [];
  function scale(){ return Math.min(canvas.clientWidth / 20, canvas.clientHeight / 22) * zoomFactor; }

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
    document.querySelector('#viewSelection').textContent = s ? 'Resaltado: ' + s.name : 'Seleccioná un sector · las siglas corresponden al listado';
    copy.disabled = !s;
    status.textContent = '';
    const u = new URL(location.href);
    if(s) u.searchParams.set('sector',selected);
    link.value = s ? u.href : '';
    canvas.setAttribute('aria-label', `Casa Central: esquema 3D basado en el layout 2026; alturas ilustrativas.${s ? ' Sector resaltado: ' + s.name : ' Sin sector seleccionado.'}`);
    document.querySelectorAll('.sector-button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sector === selected)));
    if(updateUrl && s) history.pushState({},'',u);
    draw();
  }

  function resize(){ if(!ctx)return; const dpr=Math.min(devicePixelRatio||1,2); const r=canvas.getBoundingClientRect(); canvas.width=r.width*dpr; canvas.height=r.height*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); draw(); }
  function project(p){
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
    const x=p.x*cy-p.z*sy, z=p.x*sy+p.z*cy;
    return { x:canvas.clientWidth/2+x*scale(), y:canvas.clientHeight*.5-(p.y*cp-z*sp)*scale() };
  }
  function shade(hex,amt){ const n=parseInt(hex.slice(1),16),r=Math.max(0,Math.min(255,(n>>16)+amt)),g=Math.max(0,Math.min(255,((n>>8)&255)+amt)),b=Math.max(0,Math.min(255,(n&255)+amt)); return `rgb(${r},${g},${b})`; }
  function poly(points,fill,stroke='rgba(17,31,48,.22)',width=1){ ctx.beginPath(); points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); ctx.strokeStyle=stroke; ctx.lineWidth=width; ctx.stroke(); }
  function box(s){
    const x0=s.x-s.w/2,x1=s.x+s.w/2,z0=s.z-s.d/2,z1=s.z+s.d/2,y=s.h;
    const a=project({x:x0,y:0,z:z0}),b=project({x:x1,y:0,z:z0}),c=project({x:x1,y:0,z:z1}),d=project({x:x0,y:0,z:z1});
    const A=project({x:x0,y,z:z0}),B=project({x:x1,y,z:z0}),C=project({x:x1,y,z:z1}),D=project({x:x0,y,z:z1});
    const active=s.id===selected || s.parent===selected, edge=active?'#ffd43b':'rgba(17,31,48,.25)', lw=active?4:1;
    const faces=[];
    if(Math.cos(yaw)<0) faces.push([[a,b,B,A],-24]);
    if(Math.sin(yaw)>0) faces.push([[b,c,C,B],-38]);
    if(Math.cos(yaw)>=0) faces.push([[c,d,D,C],-12]);
    if(Math.sin(yaw)<=0) faces.push([[d,a,A,D],-30]);
    faces.push([[A,B,C,D],18]);
    faces.forEach(([points,tint])=>{ poly(points,active ? shade('#ffd43b',tint) : shade(s.color,tint),edge,lw); hitAreas.push({id:s.id,poly:points}); });
  }
  function label(s){
    const center=project({x:s.x,y:s.h+.18,z:s.z});
    const size=canvas.clientWidth<500?11:13;
    ctx.font=`700 ${size}px system-ui`;
    const width=ctx.measureText(s.tag).width+6;
    let x=center.x,y=center.y;
    const overlaps=()=>labelAreas.some(r=>x+width/2>r.left && x-width/2<r.right && y>r.top && y-size-5<r.bottom);
    for(let tries=0;tries<20 && overlaps();tries++) {
      y-=size+7;
      if(y-size<110){x+=width+8;y=center.y;}
    }
    labelAreas.push({left:x-width/2,right:x+width/2,top:y-size-5,bottom:y});
    if(y!==center.y || x!==center.x){ctx.beginPath();ctx.moveTo(center.x,center.y);ctx.lineTo(x,y);ctx.strokeStyle='#52667d';ctx.lineWidth=1;ctx.stroke();}
    ctx.fillStyle='rgba(255,255,255,.94)';ctx.fillRect(x-width/2,y-size-3,width,size+4);
    ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillStyle='#142033';ctx.fillText(s.tag,x,y);
  }
  function drawStripedPaths(paths,color){
    function rect(x,z,w,d,fill){
      poly([[x,z],[x+w,z],[x+w,z+d],[x,z+d]].map(([px,py])=>project(point(px,py))),fill,fill,.4);
    }
    paths.forEach(([x,z,w,d])=>{
      rect(x,z,w,d,color);
      // Rayado transversal blanco, conservando el color de cada tipo de senda.
      if(w>d){ for(let offset=4;offset<w-3;offset+=10) rect(x+offset,z+3,Math.min(4,w-offset-3),d-6,'#ffffff'); }
      else { for(let offset=4;offset<d-3;offset+=10) rect(x+3,z+offset,w-6,Math.min(4,d-offset-3),'#ffffff'); }
    });
  }
  function drawEvacuation(){
    if(!evacuationToggle.checked)return;
    window.CASA_CENTRAL_EVACUATION.forEach(({x,z,dx,dz})=>{
      // Flecha orientada en el plano del suelo; gira con la cámara.
      const outline=[[-6,-16],[6,-16],[6,5],[12,5],[0,20],[-12,5],[-6,5]];
      const vertices=outline.map(([side,forward])=>project(point(x-dz*side+dx*forward,z+dx*side+dz*forward)));
      poly(vertices,'#00c52c','#087d36',.6);
      labelAreas.push({left:Math.min(...vertices.map(p=>p.x))-3,right:Math.max(...vertices.map(p=>p.x))+3,top:Math.min(...vertices.map(p=>p.y))-3,bottom:Math.max(...vertices.map(p=>p.y))+3});
    });
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
    const perimeter=[[98,50],[1003,50],[1003,1173],[94,1173],[56,1136],[56,89]];
    poly(perimeter.map(([x,z])=>project(point(x,z))), '#f9fafb', '#8190a1', 2);
    // Contorno aproximado del edificio principal; patios y circulación quedan libres.
    poly([[567,206],[937,206],[937,1171],[567,1171]].map(([x,z])=>project(point(x,z))), '#e3edf3', '#a5b6c4');
    if(walkwaysToggle.checked) drawStripedPaths(window.CASA_CENTRAL_WALKWAYS,'#079c37');
    if(safetyToggle.checked) drawStripedPaths(window.CASA_CENTRAL_SAFETY_PATHS,'#e3242b');
    ctx.save();
    ctx.font='700 11px system-ui'; ctx.textAlign='center'; ctx.fillStyle='#49576a';
    const streets=[['CHASCOMÚS · NORTE',529,24],['JULIO CAMPOS',529,1215],['SACCONI',12,650]];
    streets.forEach(([name,x,z])=>{const p=project(point(x,z)); ctx.fillText(name,p.x,p.y);});
    ctx.restore();
    [...shapes].sort((m,n)=>((m.x*Math.sin(yaw)+m.z*Math.cos(yaw))-(n.x*Math.sin(yaw)+n.z*Math.cos(yaw)))).forEach(box);
    // Señalización superpuesta para que la geometría simplificada no oculte flechas.
    drawEvacuation();
    shapes.filter(s=>s.label && (s.id===selected || s.parent===selected)).forEach(label);
    shapes.filter(s=>s.label && s.id!==selected && s.parent!==selected).forEach(label);
    drawMeetingPoint();
  }
  function inside(p,poly){ let c=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){ if(((poly[i].y>p.y)!==(poly[j].y>p.y))&&(p.x<(poly[j].x-poly[i].x)*(p.y-poly[i].y)/(poly[j].y-poly[i].y)+poly[i].x))c=!c; } return c; }
  canvas.addEventListener('pointerdown',e=>{ dragging=true;moved=false;lastX=e.clientX;canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove',e=>{ if(!dragging)return; const dx=e.clientX-lastX; if(Math.abs(dx)>1){moved=true;yaw+=dx*.009;lastX=e.clientX;draw();} });
  canvas.addEventListener('pointerup',e=>{ dragging=false; if(!moved){ const r=canvas.getBoundingClientRect(),p={x:e.clientX-r.left,y:e.clientY-r.top}; const hit=[...hitAreas].reverse().find(h=>inside(p,h.poly)); if(hit)select(hit.id,true); } });
  canvas.addEventListener('pointercancel',()=>{dragging=false;moved=false;});
  canvas.addEventListener('lostpointercapture',()=>{dragging=false;});
  function zoomBy(delta){ zoomFactor=Math.max(.6,Math.min(1.8,zoomFactor+delta));draw(); }
  canvas.addEventListener('wheel',e=>{ e.preventDefault();zoomBy(-e.deltaY*.001); },{passive:false});
  document.querySelector('#zoomIn').addEventListener('click',()=>zoomBy(.15));
  document.querySelector('#zoomOut').addEventListener('click',()=>zoomBy(-.15));
  document.querySelector('#rotateLeft').addEventListener('click',()=>{yaw-=.25;draw();});
  document.querySelector('#rotateRight').addEventListener('click',()=>{yaw+=.25;draw();});
  document.querySelector('#resetView').addEventListener('click',()=>{yaw=-.3;pitch=.95;zoomFactor=1;draw();});
  document.querySelector('#topView').addEventListener('click',()=>{yaw=0;pitch=Math.PI/2;zoomFactor=1;draw();});
  walkwaysToggle.addEventListener('change',draw);
  safetyToggle.addEventListener('change',draw);
  evacuationToggle.addEventListener('change',draw);
  copy.addEventListener('click',async()=>{ if(!selected)return; try{await navigator.clipboard.writeText(link.value);status.textContent='Enlace copiado. Podés usarlo para generar el QR.';}catch{link.focus();link.select();status.textContent='Copiá el enlace seleccionado con el menú de tu dispositivo.';} });
  addEventListener('popstate',()=>select(new URLSearchParams(location.search).get('sector')));
  addEventListener('resize',resize); select(new URLSearchParams(location.search).get('sector')); resize();
})();
