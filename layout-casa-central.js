// Trazado visual sobre el PNG aportado por el usuario (1055 × 1491 px).
// rect = [izquierda, arriba, ancho, alto] en píxeles de la imagen fuente.
// No son metros. h es una extrusión ilustrativa en unidades de dibujo.
// Los grupos Picking y Vacíos agrupan áreas; no agregan recintos al plano.
window.CASA_CENTRAL_LAYOUT = [
  {id:'picking', name:'Canchas 1 a 6 · Picking', tag:'Picking', color:'#de913a', group:true, note:'Agrupación de las seis canchas del plano. Para identificar una cancha concreta, usá su propio enlace QR.'},
  {id:'cancha-1', name:'Cancha 1', tag:'C1', parent:'picking', color:'#de913a', rects:[[778,357,92,107],[891,357,23,107]], h:.5},
  {id:'cancha-2', name:'Cancha 2', tag:'C2', parent:'picking', color:'#de913a', rects:[[645,461,21,137]], h:.5},
  {id:'cancha-3', name:'Cancha 3', tag:'C3', parent:'picking', color:'#de913a', rects:[[589,461,19,137],[619,461,21,137]], h:.5},
  {id:'cancha-4', name:'Cancha 4', tag:'C4', parent:'picking', color:'#de913a', rects:[[677,461,35,137]], h:.5},
  {id:'cancha-5', name:'Cancha 5', tag:'C5', parent:'picking', color:'#de913a', rects:[[778,487,92,111],[892,487,22,111]], h:.5},
  {id:'cancha-6', name:'Cancha 6', tag:'C6', parent:'picking', color:'#de913a', rects:[[671,235,61,170]], h:.5},
  {id:'terminados', name:'Almacenamiento', tag:'AL', color:'#36a47a', rects:[[592,647,120,219],[798,651,113,335],[592,926,120,60],[592,987,120,114],[798,987,113,56],[842,1093,69,53]], h:.6, note:'Áreas rotuladas «Almacenamiento» en el plano. Se conserva el identificador terminados del MVP; el plano no especifica el contenido de cada área.'},
  {id:'reempaque', name:'Reempaque', tag:'R', color:'#9866c7', rects:[[846,313,87,21]], h:.25},
  {id:'bloqueados', name:'Bloqueados', tag:'B', color:'#d65e6a', rects:[[592,1126,119,21]], h:.25},
  {id:'pop-pesado', name:'P.O.P. Pesado', tag:'POP', color:'#8d748b', rects:[[592,1102,119,22]], h:.25},
  {id:'oficinas', name:'Oficinas', tag:'OF', color:'#5888bc', rects:[[516,95,48,110],[569,95,75,107],[597,210,47,48],[569,315,75,82]], h:.65},
  {id:'dock-1', name:'Dock 1', tag:'D1', color:'#7486a1', rects:[[427,342,132,52]], h:.15},
  {id:'dock-2', name:'Dock 2', tag:'D2', color:'#7486a1', rects:[[427,460,132,53]], h:.15},
  {id:'dock-3', name:'Dock 3', tag:'D3', color:'#7486a1', rects:[[427,926,51,187]], h:.15},
  {id:'control-consolidados', name:'Control de consolidados', tag:'CC', color:'#63a8b4', rects:[[274,524,133,36],[274,581,133,32]], h:.2},
  {id:'control-rechazados', name:'Control de rechazados', tag:'CR', color:'#c18c73', rects:[[492,621,69,54]], h:.25},
  {id:'activos', name:'Vacíos · áreas agrupadas', tag:'Vacíos', color:'#549da4', group:true, note:'Agrupación de clasificación de vacíos, vacíos para clasificar, paletas y estiba. Se conserva el enlace activos del MVP; el plano no rotula un sector único de activos retornables.'},
  {id:'clasificacion-vacios', name:'Clasificación de vacíos', tag:'CV', parent:'activos', color:'#549da4', rects:[[159,624,50,175]], h:.2},
  {id:'vacios-para-clasificar', name:'Vacíos para clasificar', tag:'VC', parent:'activos', color:'#549da4', rects:[[159,864,64,60]], h:.2},
  {id:'paletas-clasificadas', name:'Paletas clasificadas', tag:'PC', parent:'activos', color:'#549da4', rects:[[224,883,125,41]], h:.2},
  {id:'estiba-vacios', name:'Estiba de vacíos clasificados', tag:'EV', parent:'activos', color:'#549da4', rects:[[159,928,190,226]], h:.4},
  {id:'taller', name:'Taller', tag:'T', color:'#9c8766', rects:[[188,80,90,63]], h:.7},
  {id:'estacionamiento-camiones', name:'Estacionamiento de camiones', tag:'EC', color:'#8796a5', rects:[[71,180,111,332]], h:.06},
  {id:'estacionamiento', name:'Estacionamiento', tag:'E', color:'#8796a5', rects:[[785,51,214,151]], h:.06}
];
