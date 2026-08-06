# LANDER · Tablero de Control · Amenidades — Diseño

**Fecha:** 2026-08-06
**Cliente:** Desarrollos Residenciales LANDER (https://www.lander.com.mx)
**Gerencia de proyecto:** Metta Arquitectura y Construcción
**Estado:** Diseño aprobado, listo para plan de implementación

---

## 1. Propósito

Tablero de control del paquete de **amenidades** del desarrollo LANDER. Sitio web
estático (HTML + CSS + JavaScript vanilla, sin frameworks ni backend), en la misma
familia que el tablero de Altozano pero con menos módulos y con un módulo nuevo que
Altozano no tiene: el catálogo de planos.

En esta primera entrega solo **un módulo tiene lógica** (Planos). Los otros tres se
publican como tarjetas marcadas "Próximamente" y se diseñan en prompts posteriores.

### Datos del proyecto

| Dato | Valor |
|---|---|
| Nombre | LANDER · Amenidades |
| Cliente | Desarrollos Residenciales LANDER |
| Fecha de inicio | 2026-08-10 |
| Duración estimada | 6 semanas |
| Fecha de término estimada | 2026-09-21 |
| Etapa | Etapa 1 (habrá una 2ª etapa) |
| Ubicación | Hermosillo, Sonora |
| Inmueble | Casa Club |

La duración es preliminar y cambiará cuando exista el programa de obra. Vive en
`data/proyecto.json`, no en el código, para poder ajustarla sin tocar HTML.

---

## 2. Decisiones tomadas

| Decisión | Elección | Razón |
|---|---|---|
| Enfoque de construcción | Desde cero, reusando solo el sistema de diseño de Altozano | 4 módulos, uno con lógica. Heredar la plantilla completa arrastra ~150 KB de JS muerto (PPC, Look Ahead, checklists, estimaciones) y sus datos de ejemplo. |
| Visor de PDF | Overlay + `<iframe>` con el visor nativo del navegador | Zoom, paginación, buscar texto, imprimir y descargar salen gratis. Cero dependencias de CDN. Alternativa descartada: PDF.js (~1 MB y mucho más código a mantener). |
| Clasificación de planos | Por especialidad | Es la clasificación del paquete ejecutivo. Descartadas: por amenidad/área y por fase. |
| Banda de indicadores en portada | Cableada pero vacía | Se llena sola cuando exista el primer reporte semanal, sin tocar código. |
| Módulos pendientes | Tarjeta con badge "Próximamente", sin link | Evita páginas muertas de "en construcción". |
| Publicación | GitHub + GitHub Pages, y además deploy en Vercel | Ambos apuntan al mismo repositorio. |

---

## 3. Arquitectura

Sitio estático. Cada página HTML carga sus datos con `fetch()` desde `data/`. No hay
build step, no hay backend, no hay base de datos. Todo el contenido editable vive en
JSON y en archivos PDF.

### Estructura de archivos

```
32. LANDER - TABLERO DE CONTROL - AMENIDADES/
├── index.html                 Portada: navbar + hero + indicadores + 4 cards
├── planos.html                Módulo 01 · Catálogo de planos + visor PDF
│
├── css/
│   └── styles.css             Sistema de diseño compartido (tokens LANDER)
│
├── js/
│   ├── branding.js            Título, meta y textos de marca desde proyecto.json
│   ├── shell.js               Lógica de index.html (hero + banda de indicadores)
│   └── planos.js              Catálogo, filtros, buscador y visor
│
├── data/
│   ├── proyecto.json          Datos base del proyecto
│   ├── planos/
│   │   ├── index.json         Catálogo de planos (metadatos)
│   │   └── *.pdf              Los archivos de planos
│   └── reportes/
│       └── index.json         { "semanas_publicadas": [] }
│
├── assets/
│   ├── logo-cliente.png       Logo LANDER
│   ├── logo-metta.png         Logo Metta
│   ├── hero-cliente.jpg       Render o foto para el hero
│   └── favicon.png
│
├── docs/superpowers/specs/    Documentos de diseño
├── .gitignore
├── vercel.json                Configuración de deploy en Vercel
├── README.md
└── MANUAL-ACTUALIZACION.md    Cómo agregar planos sin tocar código
```

### Responsabilidad de cada unidad

| Archivo | Qué hace | De qué depende |
|---|---|---|
| `branding.js` | Construye el `<title>`, rellena elementos con `data-brand-*` y el `alt` del logo | `data/proyecto.json` |
| `shell.js` | Llena el hero y la banda de indicadores de la portada | `data/proyecto.json`, `data/reportes/index.json` |
| `planos.js` | Carga el catálogo, dibuja lista y filtros, controla el visor | `data/planos/index.json` |
| `styles.css` | Tokens de color/tipografía y todos los componentes compartidos | — |

`branding.js` no sabe nada de planos. `planos.js` no sabe nada del hero. `shell.js` solo
se carga en `index.html`. Ningún archivo pasa de ~400 líneas.

---

## 4. Sistema de diseño

Se copia `css/styles.css` de Altozano como base y se sustituyen los tokens de color.
Estructura, tipografía y componentes (topbar, hero, cards, footer, animaciones
`fade-up`) se conservan para que la familia de tableros se sienta consistente.

### Paleta — derivada del logo LANDER

```css
:root {
  /* Acento principal — verde olivo LANDER */
  --accent:        #6E9B2E;   /* texto, botones, links */
  --accent-dark:   #55781F;   /* hover */
  --accent-bright: #8CC63F;   /* lima del logo — rellenos, barras, detalles */
  --accent-soft:   #eef6e1;   /* fondos suaves */

  /* Secundario — gris del logotipo */
  --gray:          #808285;
  --gray-soft:     #f2f2f2;

  /* Tinta y fondos (heredados del patrón Altozano) */
  --ink:           #2b2e2c;
  --bg:            #ffffff;
  --bg-soft:       #faf9f7;
}
```

**Regla de contraste:** `--accent-bright` (#8CC63F) da 2.1:1 sobre blanco, insuficiente
para texto. Se usa **solo** en rellenos, barras, degradados y detalles gráficos. Todo
texto de acento usa `--accent` (#6E9B2E).

Tipografía sin cambios: Poppins (títulos), Inter (texto), JetBrains Mono (números y
claves de plano).

---

## 5. Portada (`index.html`)

### Navbar

Sticky con blur, mismo componente que Altozano. Logo LANDER + logo Metta a la
izquierda, botón INICIO, y el tag "Tablero de Control · Metta" a la derecha. Si un
archivo de logo falta, el `onerror` lo oculta y cae al texto de respaldo.

### Hero

Fondo con `assets/hero-cliente.jpg` y degradado verde LANDER encima. Contiene:

- Eyebrow: "Gerencia de Proyecto · Metta Arquitectura y Construcción"
- Título: "LANDER / Amenidades · Tablero de control"
- Lead descriptivo (desde `proyecto.json`)
- Fila de 4 datos: **Ubicación · Alcance · Inicio · Término**

Todos los valores se leen de `data/proyecto.json`. Si `ubicacion` está vacía, se
muestra `—`.

### Banda de indicadores

Cuatro recuadros, cableados igual que Altozano:

| Indicador | Comportamiento hoy |
|---|---|
| Avance real | `—` · "Sin reportes aún" |
| Avance programado | `—` |
| Variación | `—` |
| Días restantes | **Número real**, calculado de `fecha_fin` |

Los tres primeros se llenan automáticamente cuando exista
`data/reportes/semana-01.json` y su número esté en `semanas_publicadas`. No requiere
cambios de código.

### Grid de módulos

Encabezado "Módulos del tablero · 4 módulos" y cuatro tarjetas:

| # | Ícono | Módulo | Estado | Destino |
|---|---|---|---|---|
| 01 | 📐 | Planos | Activa | `planos.html` |
| 02 | 💵 | Presupuesto base interno | Próximamente | — |
| 03 | 📅 | Programa de obra | Próximamente | — |
| 04 | 📈 | Reportes semanales | Próximamente | — |

Las tarjetas pendientes se renderizan como `<div class="module-card is-soon">` en lugar
de `<a>`: badge "Próximamente" en la esquina superior, sin hover-lift, cursor normal, y
sin `href`. Activar un módulo después = cambiar `div` por `a`, agregar `href` y quitar
la clase.

### Footer

Marca LANDER + línea de Metta, mismo componente que Altozano.

---

## 6. Módulo 01 · Planos

### 6.1 Catálogo de datos — `data/planos/index.json`

```json
{
  "actualizado": "2026-08-06",
  "especialidades": [
    { "id": "arquitectonico",  "nombre": "Arquitectónico" },
    { "id": "estructural",     "nombre": "Estructural" },
    { "id": "electrico",       "nombre": "Eléctrico" },
    { "id": "hidrosanitario",  "nombre": "Hidrosanitario" },
    { "id": "aire",            "nombre": "Aire acondicionado" },
    { "id": "paisajismo",      "nombre": "Paisajismo" },
    { "id": "herreria",        "nombre": "Herrería y cancelería" },
    { "id": "acabados",        "nombre": "Acabados" }
  ],
  "planos": [
    {
      "clave": "ARQ-01",
      "nombre": "Planta arquitectónica · Casa club",
      "especialidad": "arquitectonico",
      "archivo": "ARQ-01-planta-casa-club.pdf",
      "revision": "R2",
      "fecha": "2026-08-01",
      "notas": "Liberado para construcción"
    }
  ]
}
```

**Campos obligatorios:** `clave`, `nombre`, `especialidad`, `archivo`.
**Campos opcionales:** `revision`, `fecha`, `notas`. Si faltan, su chip no se dibuja.

`archivo` es el nombre del PDF dentro de `data/planos/`, no una ruta completa.

**Reglas del arreglo `especialidades`:**

- Define el **orden** y el **nombre visible** de los filtros.
- Solo se dibuja el chip de una especialidad si tiene al menos un plano.
- Si un plano trae una `especialidad` que no está en el arreglo, el plano **igual
  aparece**: se le genera un chip y un grupo con su id crudo como etiqueta, colocados
  al final del orden. Nunca se pierde un plano por un id mal escrito.

Agregar una especialidad nueva es editar este JSON. Nunca requiere tocar JavaScript.

### 6.2 Lista y filtros — `planos.html`

**Barra superior sticky** con tres elementos:

1. **Buscador** — filtra en vivo (`input` event) por `clave`, `nombre` y `notas`.
   Insensible a mayúsculas y acentos.
2. **Chips de especialidad** — "Todas" más un chip por especialidad con plano,
   cada uno con su contador.
3. **Contador de resultados** — "12 de 34 planos".

**Lista de resultados.** Filas anchas, no miniaturas: un PDF no da preview sin
renderizarlo y una cuadrícula de rectángulos grises no aporta información. Cada fila
contiene:

- Ícono PDF y `clave` en monoespaciada
- `nombre` del plano en tamaño grande
- Chips pequeños con `revision` y `fecha`
- Botones **Abrir** y **Descargar** a la derecha

**Modo de agrupación:**

| Estado | Presentación |
|---|---|
| Filtro "Todas" y buscador vacío | Agrupada por especialidad, con encabezado por grupo |
| Filtro activo o búsqueda con texto | Lista plana ordenada por `clave` |

**Estados vacíos:**

| Situación | Qué se muestra |
|---|---|
| `index.json` no existe o falla el fetch | "Aún no hay planos publicados" + nota de cómo agregarlos |
| `planos` es un arreglo vacío | Mismo mensaje |
| Búsqueda sin coincidencias | "Ningún plano coincide con «texto»" + botón "Limpiar filtros" |

### 6.3 Visor

Overlay a pantalla completa, fondo casi negro con blur.

**Barra superior del visor:**
- Izquierda: `clave` y `nombre` del plano
- Derecha: **Abrir en pestaña ↗**, **Descargar ⬇**, **Cerrar ✕**

**Cuerpo:** `<iframe src="data/planos/{archivo}#view=FitH">`. El visor nativo del
navegador aporta zoom, paginación, buscar texto, imprimir y descargar.

**Navegación entre planos:** flechas ‹ › que recorren los planos **del filtro activo**,
no del catálogo completo. Contador "3 / 12". Teclas ← y →. Las flechas se deshabilitan
en el primer y último elemento.

**Cierre:** botón ✕, tecla `Esc`, o clic fuera del área del PDF.

**Fallback iOS/Safari.** Safari en iOS no permite hacer scroll dentro de un iframe con
PDF; muestra solo la primera página o una pantalla en blanco. Detección por
`navigator.pdfViewerEnabled === false` o user agent iOS. En ese caso, en lugar del
iframe se muestra una tarjeta centrada con el nombre del plano y un botón grande
"Abrir plano" que lo lanza en pestaña nueva.

**Deep link.** Al abrir un plano se hace `history.pushState` con `?plano=ARQ-01`. Esto
logra dos cosas: el botón atrás del celular cierra el visor en vez de salir del tablero,
y se puede compartir por WhatsApp el link directo a un plano. Al cargar `planos.html`
con ese parámetro, el visor se abre en ese plano automáticamente.

### 6.4 Inventario entregado

17 PDFs (≈15 MB) en `data/planos/`, todos del **Casa Club**. Las claves y los nombres se
extrajeron del campo **CONTENIDO** y **PLANO No.** del cuadro de datos de cada PDF
(vía `pdftotext -layout`), no del nombre de archivo.

| Clave | Nombre | Especialidad | Versión |
|---|---|---|---|
| ARQ-01 | Planta de conjunto | Arquitectónico | V.03 |
| ARQ-02 | Planta arquitectónica | Arquitectónico | V.03 |
| ARQ-03 | Fachadas | Arquitectónico | V.03 |
| ARQ-04 | Cortes | Arquitectónico | V.03 |
| EST-01 | Planta de conjunto | Estructural | — |
| EST-02 | Estructural de cubierta metálica 1 | Estructural | — |
| EST-03 | Cimentación cubierta metálica 1 | Estructural | — |
| EST-04 | Estructural de cubierta metálica 2 | Estructural | — |
| EST-05 | Cimentación cubierta metálica 2 | Estructural | — |
| EST-06 | Estructural de módulo de baños | Estructural | — |
| EST-07 | Estructural de pórticos PR-01 | Estructural | — |
| EST-08 | Estructural de pórticos PR-02, 03 y 04 | Estructural | — |
| EST-09 | Estructural de cuarto de máquinas y fire pit | Estructural | — |
| IH-01 | Instalación hidráulica | Hidrosanitario | V.02 |
| IS-01 | Instalación sanitaria | Hidrosanitario | V.02 |
| ACA-01 | Planta de acabados | Acabados | V.03 |
| ACA-02 | Acabados en fachada | Acabados | V.03 |

**Los nombres de archivo no se renombran.** El campo `archivo` del catálogo apunta al
nombre tal cual llegó del proyectista; `clave` y `nombre` son los campos legibles que ve
el usuario. Cuando llegue una revisión nueva, se sustituye el PDF y se ajusta una línea
del JSON, sin renombrar nada.

**Fechas.** Solo ARQ-02 trae fecha legible en el cuadro de datos (15/06/2026). El resto
no la expone. El paquete estructural lleva `260223` en el nombre de archivo, que por
formato AAMMDD correspondería al **23/02/2026** — es una lectura del nombre, no del
cuadro de datos, así que se marca en el JSON pero conviene confirmarla con el
proyectista. Los planos sin fecha simplemente no dibujan ese chip.

Las especialidades declaradas en `especialidades` que hoy no tienen plano (Eléctrico,
Aire acondicionado, Paisajismo, Herrería y cancelería) **no dibujan chip** hasta que
exista al menos un PDF suyo. Quedan declaradas para no tener que editar el JSON después.

**Observación sobre el paquete:** los prefijos de archivo van 01, 03, 04, 05 — falta el
**02**, que por la secuencia típica correspondería a instalación eléctrica. No bloquea
nada: el módulo funciona con lo que haya y el chip de Eléctrico aparece solo cuando se
sume ese paquete.

---

## 7. Manejo de errores

| Falla | Comportamiento |
|---|---|
| `proyecto.json` no carga | Hero y meta muestran los textos de respaldo del HTML. La página no truena. |
| `reportes/index.json` no carga o está vacío | Indicadores muestran `—` con "Sin reportes aún". "Días restantes" sigue funcionando. |
| `planos/index.json` no carga | Estado vacío con instrucciones. |
| Un PDF no existe (404) | El iframe muestra el error del navegador. Los botones "Abrir en pestaña" y "Descargar" siguen visibles. |
| Falta un logo o el hero | `onerror` oculta la imagen y cae al texto de respaldo. |

Todo `fetch` va envuelto en `try/catch` con `console.warn`, siguiendo el patrón de
`shell.js` de Altozano. Ninguna falla de datos deja la página en blanco.

---

## 8. Verificación

Estos tableros no tienen framework de pruebas y este no introduce uno. La verificación
es una lista de comprobación manual, ejecutada con Live Server:

**Portada**
- [ ] Hero muestra nombre, alcance, inicio (10 ago 2026) y término (21 sep 2026)
- [ ] "Días restantes" muestra un número, no `—`
- [ ] Los otros tres indicadores muestran `—` con "Sin reportes aún"
- [ ] Las 3 tarjetas "Próximamente" no son clicables y no tienen hover-lift
- [ ] La tarjeta de Planos navega a `planos.html`

**Planos**
- [ ] Catálogo vacío → estado vacío con instrucciones, sin errores en consola
- [ ] Con un solo plano → se dibuja el chip de su especialidad y ninguno más
- [ ] Filtro "Todas" → lista agrupada por especialidad
- [ ] Filtro por especialidad → lista plana, contador correcto
- [ ] Búsqueda sin resultados → mensaje y botón "Limpiar filtros"
- [ ] Búsqueda con acentos ("hidráulico" encuentra "Hidraulico")

**Visor**
- [ ] Clic en un plano abre el overlay con el PDF visible
- [ ] `Esc`, ✕ y clic fuera cierran el visor
- [ ] ← y → navegan dentro del filtro activo, no del catálogo completo
- [ ] Flechas deshabilitadas en el primer y último plano
- [ ] Botón atrás del navegador cierra el visor
- [ ] `planos.html?plano=ARQ-01` abre directo ese plano
- [ ] Pasada en celular (Chrome Android y Safari iOS)

**Publicación**
- [ ] El sitio publicado en GitHub Pages carga los PDFs
- [ ] El deploy de Vercel carga los PDFs

---

## 9. Operación

**Agregar un plano:**
1. Copiar el PDF a `data/planos/`
2. Agregar un objeto al arreglo `planos` de `data/planos/index.json`
3. Commit y push

Sin tocar código. Queda documentado paso a paso en `MANUAL-ACTUALIZACION.md`.

**Ver en local:** Live Server en VS Code. Con doble clic al HTML el `fetch()` falla por
la política de `file://`.

**Publicación:** repositorio en GitHub con Pages activado (rama `main`, carpeta raíz), y
además proyecto en Vercel apuntando al mismo repositorio. `vercel.json` con la
configuración de sitio estático, tomando como referencia el de Altozano.

---

## 10. Insumos pendientes

Estos faltantes **no bloquean** la implementación. El sitio funciona sin ellos gracias a
los respaldos; se sustituyen después sin tocar código.

| Insumo | Destino | Mientras tanto |
|---|---|---|
| Logo LANDER en PNG con fondo transparente | `assets/logo-cliente.png` | Texto "LANDER" como respaldo |
| Render o foto del proyecto (mín. 1600 px de ancho) | `assets/hero-cliente.jpg` | Degradado verde sólido |
| Favicon | `assets/favicon.png` | Sin favicon |

Los PDFs de planos **ya están entregados** (17 archivos, ver §6.4).

---

## 11. Fuera de alcance de esta entrega

- Diseño y lógica de **Presupuesto base interno** (prompt posterior)
- Diseño y lógica de **Programa de obra** (el programa aún se está elaborando)
- Diseño y lógica de **Reportes semanales** (aún no inicia)
- Módulos de Altozano que no se piden aquí: bitácora, estimaciones, checklist de
  calidad, galería, PPC y Look Ahead
- Autenticación o control de acceso
- Etapa 2 del proyecto
