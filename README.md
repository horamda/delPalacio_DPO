# delPalacio_SA
Politicas, links, varios

## Recorrido interior 3D (MVP)

Página estática: `visita_deposito.html`, enlazada desde `ubicacion.html`.
Usa geometría 3D proyectada en Canvas 2D, sin dependencias externas, backend,
compilación, claves ni permisos de geolocalización. Compatible con GitHub Pages
en el subdirectorio del repositorio: todos sus recursos usan rutas relativas.

### Sectores y QR

Ejemplo de destino para un QR:
`https://horamda.github.io/delPalacio_DPO/visita_deposito.html?sector=picking`

Identificadores disponibles: `ingreso`, `picking`, `terminados`, `reempaque`,
`bloqueados`, `activos`, `oficinas`. Seleccionar un sector actualiza la URL y
permite copiarla para un generador de QR. No se generan imágenes QR en esta versión.
Un enlace sin sector o con un identificador inválido no presupone una ubicación.
Los botones del listado sirven como alternativa al QR y a la interacción con el
modelo; los controles de vista también funcionan con teclado y en pantallas táctiles.

El sector indicado por el enlace representa el cartel escaneado, no una posición
medida ni seguimiento en tiempo real. No se utiliza GPS interior.

### Sustituir la demostración

La distribución, nombres y volúmenes son ejemplos; no constituyen un plano del
depósito, una ruta peatonal autorizada ni un plano de evacuación. No se identificó
un modelo 3D o plano interior verificable durante la revisión del repositorio.
Las coordenadas de `sectors` en `visita-deposito.js` son unidades abstractas,
no metros. Para reemplazarlas: validar sectores y circulación con el responsable
del depósito, obtener un relevamiento, actualizar esa configuración (o sustituir
el renderizador por el modelo validado) y conservar los IDs para no romper los QR.
Validar la correspondencia entre cada cartel y su sector antes del uso operativo.

### Desarrollo y despliegue

Servir la raíz con `python -m http.server 8000` y abrir
`http://localhost:8000/visita_deposito.html?sector=picking`.
En GitHub Pages, publicar la raíz de `main` del repositorio `horamda/delPalacio_DPO`.
No se requiere un proceso de build. Verificar enlace sin parámetro, sector válido,
sector inválido, selección manual, historial, copia de enlace y vista móvil.
