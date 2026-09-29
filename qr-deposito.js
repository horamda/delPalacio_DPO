(() => {
  const base='https://horamda.github.io/delPalacio_DPO/visita_deposito.html';
  const cards=document.querySelector('#cards');
  const sectors=window.CASA_CENTRAL_LAYOUT.filter(s=>!s.group||s.id==='punto-encuentro');
  function update(){const n=cards.querySelectorAll('input:checked').length;document.querySelector('#count').textContent=n+' carteles seleccionados';document.querySelector('#print').disabled=!n;}
  for(const s of sectors){
    const url=new URL(base);url.searchParams.set('sector',s.id);url.searchParams.set('origen','qr');
    const qr=qrcodegen.QrCode.encodeText(url.href,qrcodegen.QrCode.Ecc.MEDIUM),size=qr.size+8;
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox',`0 0 ${size} ${size}`);svg.setAttribute('class','qr');svg.setAttribute('role','img');svg.setAttribute('aria-label','Código QR de '+s.name);svg.setAttribute('shape-rendering','crispEdges');
    const bg=document.createElementNS(svg.namespaceURI,'rect');bg.setAttribute('width','100%');bg.setAttribute('height','100%');bg.setAttribute('fill','white');svg.append(bg);
    const path=document.createElementNS(svg.namespaceURI,'path');let d='';for(let y=0;y<qr.size;y++)for(let x=0;x<qr.size;x++)if(qr.getModule(x,y))d+=`M${x+4},${y+4}h1v1h-1z `;path.setAttribute('d',d);path.setAttribute('fill','black');svg.append(path);
    const card=document.createElement('article');card.className='card';
    const label=document.createElement('label');label.className='choose';const input=document.createElement('input');input.type='checkbox';input.checked=!['terminados','oficinas'].includes(s.id);label.append(input,document.createTextNode('Incluir en impresión'));card.classList.toggle('chosen',input.checked);input.onchange=()=>{card.classList.toggle('chosen',input.checked);update();};
    const brand=document.createElement('p');brand.className='brand';brand.textContent='DEL PALACIO S.A. · CASA CENTRAL';
    const heading=document.createElement('h2');heading.textContent=s.name;
    const instruction=document.createElement('p');instruction.className='instruction';instruction.textContent='Escaneá para ubicar este sector en el plano';
    const note=document.createElement('small');note.textContent='Abrí la cámara del celular y tocá el enlace. La ubicación corresponde a este cartel, sin seguimiento en tiempo real.';
    const code=document.createElement('p');code.className='code';code.textContent='CASA CENTRAL / '+s.id;
    const links=document.createElement('div');links.className='links';const open=document.createElement('a');open.href=url.href;open.target='_blank';open.rel='noopener';open.textContent='Probar enlace';
    const download=document.createElement('a');download.className='download';download.textContent='Descargar QR';download.download='qr-casa-central-'+s.id+'.svg';download.href=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));links.append(open,download);
    card.append(label,brand,heading,svg,instruction,note,code,links);cards.append(card);
  }
  for(const [id,checked] of [['all',true],['none',false]])document.querySelector('#'+id).onclick=()=>{cards.querySelectorAll('input').forEach(input=>{input.checked=checked;input.dispatchEvent(new Event('change'));});};
  document.querySelector('#print').onclick=()=>window.print();update();
})();
