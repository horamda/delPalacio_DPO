# delPalacio_DPO

Políticas, links y herramientas de del Palacio S.A.

## Recorrido 3D de Casa Central

Página estática `visita_deposito.html`, enlazada desde `ubicacion.html`.
Canvas 2D con proyección de geometría 3D; sin bibliotecas externas, backend,
compilación, claves ni permisos de geolocalización. Compatible con GitHub Pages
con rutas relativas al subdirectorio del repositorio.

### Fuente y límites

El usuario identificó `Layout general DPO 2026 (1).png` como el plano de Casa
Central. Se conserva sin modificaciones en `img/layout-casa-central-2026.png`
y se puede consultar desde el recorrido. Indica Calle Chascomús 386, Partido
de la Costa, superficie total aproximada 15.000 m², Sacconi al oeste y Julio
Campos al sur. No se deducen dimensiones individuales a partir de esa área.

`layout-casa-central.js` contiene sectores y rectángulos trazados visualmente
sobre la fuente, en píxeles, no en metros. La distribución es aproximada y las
alturas son extrusiones ilustrativas. El trazado simplifica recintos; no reproduce
todos los detalles ni equipos de emergencia. No es una ruta autorizada
ni un plano de evacuación. El original mantiene su señalización y leyenda.
Validar medidas, alturas, sectores y circulación con el responsable de la sede
antes de usarlo como guía operativa.

La capa «Mostrar sendas peatonales» incluye las bandas verdes rayadas de la
fuente y un tramo adicional señalado en verde por el usuario en una captura:
el frente del almacenamiento, conectando cancha 5 con canchas 2–4 y control
de rechazados. Los diez tramos se configuran en `CASA_CENTRAL_WALKWAYS` dentro
de `layout-casa-central.js`; el comentario del tramo identifica esa corrección.
La capa roja «Mostrar senda de seguridad» usa `CASA_CENTRAL_SAFETY_PATHS`.
«Mostrar sentido de evacuación» usa los nueve vectores de flechas de la fuente
en `CASA_CENTRAL_EVACUATION`: ocho hacia el norte y uno hacia el oeste.
Las tres capas están activadas al abrir y pueden ocultarse independientemente.
No se representan las barreras amarillas.
Las sendas se superponen al modelo para que no desaparezcan detrás de los
volúmenes ilustrativos. La vista superior permite revisar su trazado.
No calcula rutas ni verifica transitabilidad.

El punto de encuentro PE se sitúa aproximadamente en la esquina de Sacconi y
Chascomús (noroeste), según indicación explícita del usuario. Este marcador no
figura en el PNG original y su origen se aclara en la interfaz. Se configura en
`CASA_CENTRAL_MEETING_POINT`, se selecciona tocándolo o desde el listado y admite
el enlace `visita_deposito.html?sector=punto-encuentro`. No se inventa un recorrido
que conecte las flechas originales con esta esquina. Posteriormente el usuario
confirmó las direcciones exteriores: por Chascomús hacia Sacconi y por Sacconi
hacia Chascomús, ambas hacia PE. Esas flechas se almacenan por separado en
`CASA_CENTRAL_EXTERIOR_EVACUATION` y se distinguen de las extraídas del PNG.
El usuario también confirmó flechas junto a los docks 1, 2 y 3 hacia Chascomús;
se configuran en `CASA_CENTRAL_DOCK_EVACUATION` y usan la misma capa de evacuación.

### Presentación y edición local

El estilo visual toma como referencia `best.png` aportado por el usuario. El mapa
sigue siendo geometría interactiva, no una imagen plana. `visita-escena.js` agrega
racks, cajas, vehículos, edificios y cerco ilustrativos: no son un relevamiento
de cantidades, alturas o equipamiento real. Las calles son franjas esquemáticas.
La ubicación de sectores conserva el plano original, aunque la referencia estética
muestre otra distribución. Los carteles de sectores pueden ocultarse.

«Agregar etiquetas y trazados al gráfico» abre el editor de `visita-etiquetas.js`.
Admite texto, extintor, botiquín, alarma, lavaojos, baños, encuentro, flecha de
evacuación, senda peatonal, senda de seguridad y barrera amarilla. Se elige el
tipo, texto opcional y dirección (para flechas), y luego se coloca en vista superior.
Las sendas y barreras requieren dos puntos; se ajustan al eje horizontal o vertical.
También funciona con flechas del teclado, Enter y Escape. Permite reubicar,
eliminar y filtrar los agregados por tipo.

Los agregados se guardan sólo en `localStorage` de ese navegador bajo
`dpo-casa-central-annotations-v1`; no alteran la versión pública ni el plano base.
Exportar e importar JSON permite compartirlos. La importación valida versión,
tipos, coordenadas y límite de 100 elementos; agrega IDs nuevos sin reemplazar
los existentes. No se ejecuta HTML de las etiquetas. Si el almacenamiento está
bloqueado, se informa y se permite exportar los cambios de la sesión.

### Sectores y enlaces QR

Ejemplos:

- `https://horamda.github.io/delPalacio_DPO/visita_deposito.html?sector=cancha-1`
- `https://horamda.github.io/delPalacio_DPO/visita_deposito.html?sector=dock-2`
- `https://horamda.github.io/delPalacio_DPO/visita_deposito.html?sector=picking`

IDs disponibles: `cancha-1` a `cancha-6`, `terminados`, `reempaque`, `bloqueados`,
`pop-pesado`, `oficinas`, `dock-1` a `dock-3`, `control-consolidados`,
`control-rechazados`, `clasificacion-vacios`, `vacios-para-clasificar`,
`paletas-clasificadas`, `estiba-vacios`, `taller`, `estacionamiento-camiones`,
`estacionamiento`. Dos grupos adicionales: `picking` y `activos`.

Compatibilidad con el MVP inicial:

- `picking` resalta las seis canchas; es una agrupación de la app.
- `terminados` resalta los bloques rotulados Almacenamiento. El plano no indica
  su contenido; la interfaz conserva el nombre del plano.
- `activos` agrupa las áreas de vacíos, sin inventar un recinto único.
- `ingreso` no selecciona ubicación: el ingreso genérico anterior no está
  identificado como tal en el plano. Se explica y se pide selección manual.

La selección manual actualiza la URL, que puede copiarse para generar un QR.
El QR identifica el cartel escaneado; no mide posición ni sigue movimientos.
No se utiliza GPS interior. El listado y los controles admiten teclado y móvil.
La vista superior conserva la orientación del plano; restablecer vuelve a 3D.

### Uso en móvil y accesibilidad

`visita-ux.js` organiza la interfaz: pestañas Sectores / Capas, búsqueda sin
distinción de tildes o mayúsculas, aviso de resultados vacíos y panel modal en
móvil. Al elegir un sector, el panel móvil se cierra y el mapa queda visible.
El mapa se puede ampliar en un diálogo con cierre por botón o Escape; al cambiar
de tamaño se recalcula el canvas. La altura del panel considera el teclado móvil.
Las capas, selección, zoom y agregados se conservan al ampliar o cerrar.

Controles: arrastre horizontal para girar; botones +/− o Ctrl/Command + rueda
para zoom. La rueda normal desplaza la página y el gesto vertical permite
desplazarse en móvil. Con el canvas enfocado: izquierda/derecha giran, +/− hacen
zoom y Home restablece. Las pestañas admiten izquierda/derecha y Home/End.
Durante una colocación, instrucciones y botón Cancelar se muestran sobre el mapa.

La pantalla ofrece «Vista 3D» y «Plano 2D»; el segundo representa las áreas
sin racks ni vehículos ilustrativos para facilitar la lectura de sendas.
«Centrar» encuadra el sector seleccionado, incluidos grupos y punto de encuentro.
«Mover» cambia el arrastre de giro a desplazamiento; con ese modo activo las
flechas del teclado desplazan el mapa. Restablecer conserva la vista 2D/3D elegida.
La brújula sigue la orientación del norte. Las etiquetas son seleccionables y
su densidad puede ser automática, todas o sólo el sector seleccionado.
Los accesos Todos / Canchas / Docks aplican búsquedas rápidas al listado.

### Desarrollo y despliegue

Servir la raíz con `python -m http.server 8000` y abrir
`http://localhost:8000/visita_deposito.html?sector=cancha-1`.
GitHub Pages publica la raíz de `main` en `horamda/delPalacio_DPO`; no requiere build.
Mantener los IDs publicados al corregir el trazado para conservar los QR.
Verificar sectores, grupos, enlaces inválidos, selección manual, historial,
portapapeles, vista superior, acceso al original y pantallas móviles.

### Carteles imprimibles

`qr_deposito.html` genera 24 QR SVG y carteles A4 seleccionables (imprimir / guardar PDF).
Los enlaces apuntan al sitio publicado, incluso al generar desde localhost.
Oficinas y Almacenamiento abarcan varios bloques y quedan desmarcados por defecto.
Los grupos Picking y Vacios no generan carteles para evitar ubicaciones ambiguas.
Los carteles usan `?sector=ID&origen=qr`: abren 2D centrado en el sector, conservan
la referencia del cartel al explorar y permiten volver a ella. No siguen movimientos.
Probar cada cartel con un celular y colocarlo en el sector que indica.
Un enlace sin sector valido no presupone ubicacion. Necesita Internet para abrir el mapa.
Biblioteca local: Project Nayuki, licencia MIT incluida en `vendor/qrcodegen.js`.
Fuente: https://www.nayuki.io/page/qr-code-generator-library
