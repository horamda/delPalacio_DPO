(() => {
  const $=id=>document.getElementById(id);
  const workspace=document.querySelector('.workspace'),panel=document.querySelector('.panel'),viewer=$('mapSection');
  const panelDialog=$('panelDialog'),mapDialog=$('mapDialog');
  const tabs=[$('sectorsTab'),$('layersTab')];
  function lockScroll(){document.body.classList.toggle('modal-open',panelDialog.open||mapDialog.open);}
  function availableHeight(){
    const height=window.visualViewport?.height||innerHeight;
    document.documentElement.style.setProperty('--visible-height',height+'px');
    panelDialog.classList.toggle('compact',height<550);
  }
  window.visualViewport?.addEventListener('resize',availableHeight);addEventListener('resize',availableHeight);availableHeight();
  function setTab(index){
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;$(tab.getAttribute('aria-controls')).hidden=i!==index;});
  }
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>setTab(i));
    tab.addEventListener('keydown',e=>{
      if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?1:1-i;setTab(next);tabs[next].focus();}
    });
  });
  function openPanel(index){
    setTab(index);
    panelDialog.append(panel);panelDialog.showModal();lockScroll();
    if(index===0)$('sectorSearch').focus();else tabs[1].focus();
  }
  $('openSectors').onclick=()=>openPanel(0);
  $('openLayers').onclick=()=>openPanel(1);
  $('closePanel').onclick=()=>panelDialog.close();
  panelDialog.addEventListener('close',()=>{workspace.append(panel);lockScroll();});
  $('openEditor').onclick=()=>{const editor=$('annotationEditor');editor.open=true;editor.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('annotationType').focus({preventScroll:true});};
  $('expandMap').onclick=()=>{
    if(mapDialog.open){mapDialog.close();return;}
    mapDialog.append(viewer);mapDialog.showModal();lockScroll();
    $('expandMap').textContent='✕ Cerrar';$('expandMap').setAttribute('aria-label','Cerrar mapa ampliado');$('expandMap').focus();
  };
  mapDialog.addEventListener('close',()=>{
    workspace.prepend(viewer);$('expandMap').textContent='⛶ Ampliar';$('expandMap').setAttribute('aria-label','Ampliar mapa');lockScroll();$('expandMap').focus();
  });
  function normalize(value){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
  const buttons=[...document.querySelectorAll('.sector-button')];
  function search(){
    const terms=normalize($('sectorSearch').value).split(/\s+/).filter(Boolean);
    let count=0;
    buttons.forEach(b=>{const match=terms.every(t=>normalize(b.textContent).includes(t));b.hidden=!match;if(match)count++;});
    $('searchCount').textContent=count+' de '+buttons.length+' sectores';$('emptySearch').hidden=count!==0;
  }
  $('sectorSearch').addEventListener('input',search);search();
  document.querySelectorAll('[data-query]').forEach(button=>button.addEventListener('click',()=>{$('sectorSearch').value=button.dataset.query;search();}));
  $('fitMap').onclick=()=>$('resetView').click();
  addEventListener('sectorselected',e=>{
    if(e.detail.manual&&panelDialog.open){panelDialog.close();viewer.focus({preventScroll:true});}
  });
  // En modo edición, las instrucciones y Cancelar permanecen junto al mapa.
  const canvas=$('warehouseCanvas');
  function placement(){const active=canvas.classList.contains('placing');$('placementNotice').hidden=!active;$('viewSelection').hidden=active;$('placementText').textContent=$('annotationStatus').textContent;}
  new MutationObserver(placement).observe(canvas,{attributes:true,attributeFilter:['class']});
  new MutationObserver(placement).observe($('annotationStatus'),{childList:true,subtree:true,characterData:true});
  $('cancelPlacement').onclick=()=>$('cancelAnnotation').click();placement();
})();
