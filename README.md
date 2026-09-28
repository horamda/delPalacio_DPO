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

La capa «Mostrar sendas peatonales» traza únicamente las bandas verdes rayadas
de la fuente. Sus nueve tramos se configuran en `CASA_CENTRAL_WALKWAYS` dentro de
`layout-casa-central.js`, conservando interrupciones, sin prolongar conexiones.
No incluye las sendas rojas de seguridad, las barreras amarillas ni las flechas
verdes de evacuación. Está activada al abrir la página y puede ocultarse.
Se dibuja sobre el suelo: los volúmenes pueden taparla en 3D; la vista superior
permite revisar todos los tramos. No calcula rutas ni verifica transitabilidad.

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
No se generan imágenes QR. Un enlace sin sector o inválido no presupone ubicación.
El QR identifica el cartel escaneado; no mide posición ni sigue movimientos.
No se utiliza GPS interior. El listado y los controles admiten teclado y móvil.
La vista superior conserva la orientación del plano; restablecer vuelve a 3D.

### Desarrollo y despliegue

Servir la raíz con `python -m http.server 8000` y abrir
`http://localhost:8000/visita_deposito.html?sector=cancha-1`.
GitHub Pages publica la raíz de `main` en `horamda/delPalacio_DPO`; no requiere build.
Mantener los IDs publicados al corregir el trazado para conservar los QR.
Verificar sectores, grupos, enlaces inválidos, selección manual, historial,
portapapeles, vista superior, acceso al original y pantallas móviles.
