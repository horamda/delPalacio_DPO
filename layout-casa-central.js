// Trazado visual sobre el PNG aportado por el usuario (1055 × 1491 px).
// rect = [izquierda, arriba, ancho, alto] en píxeles de la imagen fuente.
// No son metros. h es una extrusión ilustrativa en unidades de dibujo.
// Los grupos Picking y Vacíos agrupan áreas; no agregan recintos al plano.
window.CASA_CENTRAL_LAYOUT = [
  {id:'punto-encuentro', name:'Punto de encuentro · Sacconi y Chascomús', tag:'PE', color:'#087d36', group:true, note:'Esquina de Sacconi y Chascomús, indicada por el usuario como punto de encuentro. Marcador aproximado de la esquina; no se deduce un itinerario hasta ella.'},
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

// Bandas verdes del plano y correcciones indicadas explícitamente por el usuario.
// Rectángulos en píxeles de la misma fuente. Conservar las interrupciones:
// no unir por inferencia ni confundir flechas de evacuación con sendas.
window.CASA_CENTRAL_WALKWAYS = [
  [650,210,193,20], // Norte de cancha 6, hasta el borde este.
  [650,230,20,187], // Lateral de cancha 6.
  [568,399,82,19], // Frente a oficinas, junto a dock 1.
  [824,230,20,42], // Tramo norte del lateral de reempaque.
  [824,310,20,28], // Tramo al sur del símbolo de lavaojos.
  [824,338,110,20], // Frente a reempaque.
  [914,358,20,264], // Lateral este de canchas 1 y 5.
  [798,603,116,19], // Borde sur de cancha 5.
  [568,449,18,173], // Lateral oeste de cancha 3, junto a dock 2.
  [548,603,250,19] // Corrección en captura del usuario: frente a almacenamiento,
                    // conecta cancha 5 con canchas 2–4 y control de rechazados.
];

// Bandas rojas rotuladas «Senda de seguridad» en la fuente (píxeles).
window.CASA_CENTRAL_SAFETY_PATHS = [
  [407,320,20,797],
  [427,320,139,20], [548,340,18,55], [427,395,139,19],
  [427,438,139,20], [548,458,18,55], [427,513,139,19],
  [194,560,213,20],
  [427,901,137,20], [479,921,20,196]
];
// Centro de cada flecha y vector de dirección según el PNG (arriba = norte).
window.CASA_CENTRAL_EVACUATION = [
  {x:540,z:111,dx:0,dz:-1}, {x:663,z:145,dx:0,dz:-1},
  {x:767,z:149,dx:0,dz:-1}, {x:767,z:366,dx:0,dz:-1},
  {x:690,z:441,dx:-1,dz:0}, {x:767,z:510,dx:0,dz:-1},
  {x:767,z:703,dx:0,dz:-1}, {x:768,z:928,dx:0,dz:-1},
  {x:768,z:1039,dx:0,dz:-1}
];
// Ubicación proporcionada por el usuario, no presente como símbolo en el PNG.
window.CASA_CENTRAL_MEETING_POINT = {x:65,z:60};

// Sentidos exteriores confirmados por el usuario: ambas calles hacia PE.
// Coordenadas esquemáticas fuera del perímetro, no procedentes del PNG.
window.CASA_CENTRAL_EXTERIOR_EVACUATION = [
  ...[870,700,530,360,190].map(x=>({x,z:0,dx:-1,dz:0})),
  ...[1030,840,650,460,270,130].map(z=>({x:15,z,dx:0,dz:-1}))
];

// Confirmación del usuario: junto a los tres docks, hacia Chascomús (norte).
// Marcadores junto al corredor rojo, sin modificar el trazado de la senda.
window.CASA_CENTRAL_DOCK_EVACUATION = [
  {x:385,z:368,dx:0,dz:-1}, // Dock 1.
  {x:385,z:486,dx:0,dz:-1}, // Dock 2.
  {x:385,z:1015,dx:0,dz:-1} // Dock 3.
];
