// Ambientación ilustrativa: no representa cantidades ni alturas relevadas.
window.buildVisitorScene = function(shapes){
  const scene=[];
  function add(s,x,z,w,d,h,color,y0=0){scene.push({...s,x,z,w,d,h,color,y0,detail:true});}
  shapes.forEach(s=>{
    const rack=s.parent==='picking'||s.id==='terminados'||s.parent==='activos';
    scene.push({...s,h:rack?.04:s.h,color:rack?'#aaa795':s.id.startsWith('dock')?'#999d9d':s.id.includes('estacionamiento')?'#696f70':'#d4d9d7'});
    if(rack){
      const cols=Math.max(1,Math.floor(s.w/.48)),rows=Math.max(1,Math.floor(s.d/.48));
      const cw=s.w/cols*.72,cd=s.d/rows*.8;
      for(let c=0;c<cols;c++){
        const x=s.x-s.w/2+(c+.5)*s.w/cols;
        for(const level of [.15,.56]){
          add(s,x,s.z,cw,s.d,.045,'#d2a529',level);
          for(let r=0;r<rows;r++){
            const z=s.z-s.d/2+(r+.5)*s.d/rows;
            add(s,x,z,cw*.86,cd,.27,(r+c)%2?'#bfa478':'#d9bb83',level+.05);
            add(s,x,z,.02,cd+.01,.275,'#a48e6e',level+.05);
          }
        }
        for(const side of [-1,1])for(const end of [-1,1])add(s,x+side*cw/2,s.z+end*s.d/2,.035,.035,.97,'#305574');
      }
    }else if(s.id.startsWith('dock')){
      const vertical=s.d>s.w;
      const w=vertical?s.w*.66:s.w*.76,d=vertical?s.d*.72:s.d*.68;
      add(s,s.x,s.z,w,d,.29,'#e9ebea',.13);
      add(s,s.x+(vertical?0:w*.57),s.z+(vertical?d*.57:0),vertical?w:w*.24,vertical?d*.2:d,.3,'#245b82',.12);
      for(const sign of [-1,1])add(s,s.x+sign*w*.35,s.z+d*.4,.09,.1,.13,'#283442');
    }else if(s.id.includes('estacionamiento')){
      const truck=s.id==='estacionamiento-camiones';
      for(let i=0;i<(truck?2:5);i++){
        const x=truck?s.x:s.x-s.w/2+.3+i*.45,z=truck?s.z-1+i*1.7:s.z+.25;
        add(s,x,z,truck?.58:.27,truck?1.35:.58,truck?.3:.15,['#bcc9cf','#285374','#c8c7bf'][i%3],.07);
        add(s,x,z-.15,truck?.5:.22,.18,.06,'#314a5a',truck?.37:.22);
      }
    }else if(s.id==='oficinas'||s.id==='taller'){
      add(s,s.x,s.z,s.w+.04,s.d+.04,.07,'#edf0ed',s.h);
      const count=Math.max(1,Math.floor(s.w/.3));
      for(let i=0;i<count;i++)add(s,s.x-s.w/2+(i+.5)*s.w/count,s.z+s.d/2+.01,.12,.025,.17,'#335771',.25);
    }
  });
  // Cerco esquemático; se mantienen los huecos de acceso del plano fuente.
  const fence={id:'__decor__',name:'Cerco',h:.25};
  [[98,50,460,50],[565,50,1003,50],[56,89,56,1136],[94,1173,449,1173],[518,1173,1003,1173],[1003,50,1003,1173]].forEach(([x,z,x2,z2])=>{
    const horizontal=z===z2,w=horizontal?(x2-x)/80:.035,d=horizontal?.035:(z2-z)/80;
    add(fence,((x+x2)/2-529)/80,((z+z2)/2-611)/80,w,d,.06,'#b5beb8',.26);
    const count=Math.ceil(Math.hypot(x2-x,z2-z)/40);
    for(let i=0;i<=count;i++)add(fence,(x+(x2-x)*i/count-529)/80,(z+(z2-z)*i/count-611)/80,.025,.025,.34,'#7f9390');
  });
  return scene;
};
