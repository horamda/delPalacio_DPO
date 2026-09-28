(() => {
  // Coordenadas abstractas de demostración, NO metros ni posiciones verificadas.
  // Reemplazar esta configuración al disponer de un relevamiento aprobado.
  const sectors = [
    { id:'ingreso', name:'Ingreso y recepción', color:'#2f80ed', x:-5.3, z:3.2, w:3.0, d:2.4, h:1.0, note:'Punto inicial sugerido para visitantes.' },
    { id:'picking', name:'Picking', color:'#f2994a', x:-1.6, z:1.9, w:4.2, d:3.5, h:1.8, note:'Zona de preparación de pedidos.' },
    { id:'terminados', name:'Producto terminado', color:'#27ae60', x:3.0, z:1.9, w:4.2, d:3.5, h:2.15, note:'Almacenamiento de producto terminado.' },
    { id:'reempaque', name:'Reempaque', color:'#9b51e0', x:-3.8, z:-2.2, w:2.8, d:2.2, h:1.25, note:'Área destinada al proceso de reempaque.' },
    { id:'bloqueados', name:'Bloqueados', color:'#eb5757', x:-.4, z:-2.2, w:2.8, d:2.2, h:1.35, note:'Sector de mercadería bloqueada o no conforme.' },
    { id:'activos', name:'Activos retornables', color:'#00a6a6', x:3.3, z:-2.2, w:3.8, d:2.2, h:1.45, note:'Zona demostrativa para activos retornables.' },
    { id:'oficinas', name:'Oficinas', color:'#65758b', x:-5.2, z:-.1, w:2.0, d:1.7, h:1.7, note:'Área administrativa y de recepción interna.' }
  ];
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
  let selected = null, yaw = -.72, pitch = .68, zoomFactor = 1, dragging = false, moved = false, lastX = 0, hitAreas = [];
  function scale(){ return Math.min(canvas.clientWidth / 20, canvas.clientHeight / 16) * zoomFactor; }

  sectors.forEach(s => {
    const b = document.createElement('button');
    b.className = 'sector-button'; b.type = 'button'; b.dataset.sector = s.id;
    b.style.setProperty('--sector-color',s.color);
    b.innerHTML = `<span class="dot" aria-hidden="true"></span><strong>${s.name}</strong><small>Ver</small>`;
    b.addEventListener('click',() => select(s.id,true)); list.appendChild(b);
  });

  function safeSector(value){ return Object.hasOwn(byId,value) ? value : null; }
  function select(id,updateUrl=false){
    selected = safeSector(id); const s = byId[selected];
    title.textContent = s ? s.name : 'Elegí un sector';
    note.textContent = s ? s.note : id ? 'El enlace no identifica un sector válido. Seleccioná uno del listado.' : 'Escaneá el QR de un sector o elegí uno del listado.';
    source.textContent = s ? updateUrl ? 'Selección manual' : 'Sector indicado por el enlace / QR' : 'Sin sector indicado';
    copy.disabled = !s;
    status.textContent = '';
    const u = new URL(location.href);
    if(s) u.searchParams.set('sector',selected);
    link.value = s ? u.href : '';
    canvas.setAttribute('aria-label', `Modelo 3D demostrativo, no a escala.${s ? ' Sector resaltado: ' + s.name : ' Sin sector seleccionado.'}`);
    document.querySelectorAll('.sector-button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.sector === selected)));
    if(updateUrl && s) history.pushState({},'',u);
    draw();
  }

  function resize(){ if(!ctx)return; const dpr=Math.min(devicePixelRatio||1,2); const r=canvas.getBoundingClientRect(); canvas.width=r.width*dpr; canvas.height=r.height*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); draw(); }
  function project(p){
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
    const x=p.x*cy-p.z*sy, z=p.x*sy+p.z*cy;
    return { x:canvas.clientWidth/2+x*scale(), y:canvas.clientHeight*.56-(p.y*cp-z*sp)*scale() };
  }
  function shade(hex,amt){ const n=parseInt(hex.slice(1),16),r=Math.max(0,Math.min(255,(n>>16)+amt)),g=Math.max(0,Math.min(255,((n>>8)&255)+amt)),b=Math.max(0,Math.min(255,(n&255)+amt)); return `rgb(${r},${g},${b})`; }
  function poly(points,fill,stroke='rgba(17,31,48,.22)',width=1){ ctx.beginPath(); points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)); ctx.closePath(); ctx.fillStyle=fill; ctx.fill(); ctx.strokeStyle=stroke; ctx.lineWidth=width; ctx.stroke(); }
  function box(s){
    const x0=s.x-s.w/2,x1=s.x+s.w/2,z0=s.z-s.d/2,z1=s.z+s.d/2,y=s.h;
    const a=project({x:x0,y:0,z:z0}),b=project({x:x1,y:0,z:z0}),c=project({x:x1,y:0,z:z1}),d=project({x:x0,y:0,z:z1});
    const A=project({x:x0,y,z:z0}),B=project({x:x1,y,z:z0}),C=project({x:x1,y,z:z1}),D=project({x:x0,y,z:z1});
    const active=s.id===selected, edge=active?'#ffd43b':'rgba(17,31,48,.25)', lw=active?4:1;
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
    ctx.font=`700 ${canvas.clientWidth<500?10:s.id===selected?15:13}px system-ui`; ctx.textAlign='center'; ctx.textBaseline='bottom'; ctx.fillStyle='#142033'; ctx.strokeStyle='rgba(255,255,255,.95)'; ctx.lineWidth=4;
    ctx.strokeText(s.name,center.x,center.y); ctx.fillText(s.name,center.x,center.y);
  }
  function draw(){
    if(!ctx || !canvas.clientWidth)return; ctx.clearRect(0,0,canvas.clientWidth,canvas.clientHeight); hitAreas=[];
    const ground=[project({x:-7,y:0,z:-4.5}),project({x:6,y:0,z:-4.5}),project({x:6,y:0,z:4.8}),project({x:-7,y:0,z:4.8})]; poly(ground,'rgba(255,255,255,.73)','rgba(72,95,120,.28)',2);
    ctx.strokeStyle='rgba(91,117,143,.12)'; ctx.lineWidth=1;
    for(let x=-7;x<=6;x++){ const a=project({x,y:.01,z:-4.5}),b=project({x,y:.01,z:4.8}); ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke(); }
    for(let z=-4;z<=4;z++){ const a=project({x:-7,y:.01,z}),b=project({x:6,y:.01,z}); ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke(); }
    [...sectors].sort((m,n)=>((m.x*Math.sin(yaw)+m.z*Math.cos(yaw))-(n.x*Math.sin(yaw)+n.z*Math.cos(yaw)))).forEach(box);
    sectors.filter(s=>s.id!==selected).forEach(label);
    if(selected) label(byId[selected]);
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
  document.querySelector('#resetView').addEventListener('click',()=>{yaw=-.72;pitch=.68;zoomFactor=1;draw();});
  copy.addEventListener('click',async()=>{ if(!selected)return; try{await navigator.clipboard.writeText(link.value);status.textContent='Enlace copiado. Podés usarlo para generar el QR.';}catch{link.focus();link.select();status.textContent='Copiá el enlace seleccionado con el menú de tu dispositivo.';} });
  addEventListener('popstate',()=>select(new URLSearchParams(location.search).get('sector')));
  addEventListener('resize',resize); select(new URLSearchParams(location.search).get('sector')); resize();
})();
