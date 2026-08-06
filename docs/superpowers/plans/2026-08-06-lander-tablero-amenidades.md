# LANDER · Tablero de Amenidades — Plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDA: usa `superpowers:subagent-driven-development`
> (recomendado) o `superpowers:executing-plans` para ejecutar este plan tarea por tarea.
> Los pasos usan casillas (`- [ ]`) para seguimiento.

**Goal:** Publicar el tablero de control de amenidades de LANDER con la portada de 4
módulos y el módulo de Planos funcionando (catálogo de 17 PDFs, filtro por especialidad,
buscador y visor a pantalla completa).

**Architecture:** Sitio 100 % estático. Cada página HTML trae su contenido de respaldo
escrito a mano y lo enriquece en runtime con `fetch()` sobre archivos JSON de `data/`.
No hay build step, ni backend, ni dependencias de npm o CDN. El sistema de diseño se
extrae del tablero de Altozano (`../06. ALTOZANO - TABLERO GENERAL/css/styles.css`)
tomando **solo** los bloques compartidos, no el archivo completo.

**Tech Stack:** HTML5, CSS3 (custom properties), JavaScript ES2020 vanilla. Google Fonts
(Poppins, Inter, JetBrains Mono). Sin frameworks. Git + GitHub Pages + Vercel.

**Spec:** `docs/superpowers/specs/2026-08-06-lander-tablero-amenidades-design.md`

---

## Global Constraints

Estas reglas aplican a **todas** las tareas.

- **Sin dependencias externas.** Nada de npm, bundlers, ni `<script src="https://cdn...">`.
  La única excepción ya aprobada es la hoja de Google Fonts.
- **Idioma:** todo el texto visible, los comentarios de código y los mensajes de commit
  van en español. Los identificadores de código también (`cargarCatalogo`, no `loadCatalog`),
  siguiendo el patrón de Altozano.
- **Nombres de archivo de los PDFs no se renombran nunca.** Contienen espacios y puntos;
  toda URL construida hacia ellos **debe** pasar por `encodeURIComponent(archivo)`.
  Sin esto los 17 planos dan 404.
- **Contraste.** Solo `--accent` (#5A7F26) y `--accent2-dark` (#63666A) pueden usarse como
  color de texto sobre fondo blanco. `--accent-mid` (#6E9B2E) y `--accent-bright` (#8CC63F)
  van únicamente en rellenos, bordes, íconos, barras y degradados.
- **Ningún fallo de datos deja la página en blanco.** Todo `fetch` va en `try/catch` con
  `console.warn` y un estado de respaldo visible.
- **Cache-busting:** los `<link>` y `<script>` locales llevan `?v=20260806`. Si se cambia
  un archivo después de publicar, se sube esa fecha.
- **Verificación:** este proyecto **no tiene framework de pruebas** y este plan no
  introduce uno — así lo fija el spec (§8). Cada tarea cierra con comprobaciones
  ejecutables (comandos `node`/`git`) y una lista de comprobación manual en el navegador,
  servido con Live Server. Abrir el HTML con doble clic **no funciona**: `fetch()` falla
  bajo `file://`.
- **Commits frecuentes:** una tarea, un commit, en español, terminando con la línea
  `Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>`.

---

## Estructura de archivos

| Archivo | Responsabilidad | Tarea |
|---|---|---|
| `css/styles.css` | Tokens LANDER + componentes compartidos + estilos de planos y visor | 1, 4, 5 |
| `index.html` | Portada: topbar, hero, indicadores, grid de 4 módulos, footer | 1 |
| `data/proyecto.json` | Nombre, cliente, ubicación, alcance, fechas, descripción | 2 |
| `js/branding.js` | Título de pestaña, meta description y textos `data-brand-*` | 2 |
| `js/shell.js` | Hero e indicadores de la portada (solo `index.html`) | 2 |
| `data/planos/index.json` | Catálogo de las 17 láminas + orden de especialidades | 3 |
| `data/reportes/index.json` | `{ "semanas_publicadas": [] }` — alimenta los indicadores | 3 |
| `planos.html` | Estructura de la página de planos y del overlay del visor | 4, 5 |
| `js/planos.js` | Carga, filtros, buscador, agrupación, render y visor | 4, 5 |
| `README.md` · `MANUAL-ACTUALIZACION.md` · `vercel.json` | Docs y publicación | 6 |

`branding.js` no sabe nada de planos. `planos.js` no sabe nada del hero. `shell.js` solo
se carga en la portada. Ningún archivo pasa de ~400 líneas.

---

## Tarea 1: Sistema de diseño y portada estática

Extrae de Altozano solo los bloques compartidos, los repinta con la paleta LANDER y
construye la portada con contenido escrito a mano. Al terminar, la portada se ve completa
y correcta **sin una sola línea de JavaScript**.

**Files:**
- Create: `css/styles.css`
- Create: `index.html`
- Create: `assets/.gitkeep`

**Interfaces:**
- Consumes: nada (primera tarea).
- Produces: las clases CSS que consumen las tareas 4 y 5 — `.topbar`, `.topbar-inner`,
  `.topbar-logo`, `.topbar-tag`, `.topbar-inicio`, `.back-link`, `.page-hero`,
  `.cards-section`, `.empty-state`, `.loading`, `.fade-up` (+ `.delay-1..3`, `.visible`),
  `footer`. Y los tokens `--accent`, `--accent-dark`, `--accent-mid`, `--accent-bright`,
  `--accent-soft`, `--accent2`, `--accent2-dark`, `--accent2-soft`, `--ink`, `--ink-soft`,
  `--ink-mute`, `--line`, `--line-soft`, `--bg`, `--bg-soft`, `--bg-soft-2`,
  `--font-display`, `--font-body`, `--font-mono`, `--ease-out`.

---

- [ ] **Paso 1: Extraer los bloques compartidos de la hoja de Altozano**

Desde la raíz del proyecto LANDER, en Git Bash:

```bash
SRC="../06. ALTOZANO - TABLERO GENERAL/css/styles.css"
{
  sed -n '1,296p'     "$SRC"   # tokens, base, topbar, home-hero, quickstats, modules, page-hero
  sed -n '690,717p'   "$SRC"   # lightbox (base del visor) + .cards-section
  sed -n '1147,1186p' "$SRC"   # estados genéricos, footer, animaciones on-scroll
  sed -n '1187,1248p' "$SRC"   # responsive
  sed -n '2049,2063p' "$SRC"   # accesibilidad: prefers-reduced-motion
} > css/styles.css
wc -l css/styles.css
```

Esperado: entre 440 y 460 líneas. Si sale mucho menos, la ruta a Altozano está mal.

Deliberadamente **no** se copian los bloques de estimaciones, checklist, galería, PPC,
look ahead, tablas ni gráficas: este tablero no los usa.

- [ ] **Paso 2: Verificar que las llaves quedaron balanceadas**

Cortar por número de línea puede partir una regla a la mitad. Comprobar:

```bash
node -e "const s=require('fs').readFileSync('css/styles.css','utf8');const a=(s.match(/{/g)||[]).length,b=(s.match(/}/g)||[]).length;console.log('abre',a,'cierra',b, a===b?'OK':'DESBALANCEADO');"
```

Esperado: `OK`. Si sale `DESBALANCEADO`, ajustar el rango del bloque culpable (revisar el
final de cada `sed` con `sed -n '296p' "$SRC"` etc.) y repetir el paso 1.

- [ ] **Paso 3: Reemplazar el encabezado y el bloque `:root` por la paleta LANDER**

Sustituir **todo** lo que va desde la línea 1 hasta el cierre `}` del `:root` (línea 46
del archivo recién generado) por:

```css
/* ============================================================
   LANDER · TABLERO DE AMENIDADES · Sistema de diseño
   Metta Arquitectura y Construcción
   Paleta: fondos claros · verde LANDER + gris del logotipo
   Tipografía: Poppins (display) · Inter (texto) · JetBrains Mono
   ------------------------------------------------------------
   Hoja de estilos COMPARTIDA por todas las páginas del tablero.
   Derivada del sistema de diseño del tablero Altozano.
   ============================================================ */

:root {
  /* ----- Fondos y tinta ----- */
  --bg: #ffffff;
  --bg-soft: #fafaf8;
  --bg-soft-2: #f2f3ef;
  --bg-elev: #ffffff;
  --ink: #2b2e2c;
  --ink-soft: #4c504d;
  --ink-mute: #8b8f8c;
  --line: #e5e6e1;
  --line-soft: #eff0ec;

  /* ----- Acento VERDE (principal, del logo LANDER) ----- */
  --accent: #5A7F26;         /* texto, links, botones      · 4.7:1 sobre blanco */
  --accent-dark: #47651E;    /* hover */
  --accent-mid: #6E9B2E;     /* rellenos, bordes, íconos   · 3.3:1 — NUNCA texto */
  --accent-bright: #8CC63F;  /* lima del logo — sobre fondo oscuro, barras */
  --accent-soft: #eef6e1;

  /* ----- Acento GRIS (secundario, del logotipo) ----- */
  --accent2: #808285;
  --accent2-dark: #63666A;   /* texto secundario           · 5.8:1 sobre blanco */
  --accent2-soft: #f1f2f2;

  /* ----- Semánticos ----- */
  --red: #c0392b;
  --green: #1f8f3e;
  --yellow: #c49a2a;
  --orange: #d98428;

  /* ----- Tipografía ----- */
  --font-display: 'Poppins', system-ui, -apple-system, sans-serif;
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  /* ----- Easing (curva "de la casa", salida suave) ----- */
  --ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);
}
```

- [ ] **Paso 4: Sustituir los tokens `--gold*` heredados de Altozano**

Quedaron 7 referencias a tokens que ya no existen. El reemplazo **no** es un
find-and-replace ciego: depende de si el color va sobre el hero oscuro o sobre blanco.

| Selector | Antes | Después | Por qué |
|---|---|---|---|
| `.home-hero .eyebrow` | `var(--gold)` | `var(--accent-bright)` | Va sobre el hero oscuro; el lima luce ahí |
| `.home-hero h1 span` | `var(--gold)` | `var(--accent-bright)` | Ídem |
| `.home-meta-item .lbl` | `var(--gold)` | `var(--accent-bright)` | Ídem |
| `.quickstat .val.gold` | `var(--gold-dark)` | `var(--accent2-dark)` | Va sobre blanco; además renombrar el selector a `.quickstat .val.alt` |
| `.module-card:nth-child(even) .module-icon` | `var(--gold-soft)` / `var(--gold-dark)` | `var(--accent2-soft)` / `var(--accent2-dark)` | Alternancia verde/gris |
| `.module-card:nth-child(even) .module-arrow` | `var(--gold-dark)` | `var(--accent2-dark)` | Ídem |
| `.module-card:nth-child(even) .module-arrow .dot` | `var(--gold-dark)` | `var(--accent2-dark)` | Ídem |

- [ ] **Paso 5: Repintar los colores de Altozano escritos a mano (rgba)**

Cuatro reglas traen el verde de Altozano hardcodeado. Sustituir exactamente:

```css
/* .home-hero — degradado del hero */
    linear-gradient(110deg, rgba(28,45,12,0.92) 0%, rgba(58,86,26,0.72) 55%, rgba(90,127,38,0.45) 100%),
    url('../assets/hero-cliente.jpg') center/cover no-repeat;

/* .home-hero::after — halo lima */
  background: radial-gradient(circle, rgba(140,198,63,0.25) 0%, transparent 65%);

/* .quickstat — sombra */
  box-shadow: 0 24px 50px -28px rgba(71,101,30,0.25);

/* .module-card::before — velo diagonal */
  background: linear-gradient(150deg, transparent 40%, rgba(90,127,38,0.07) 100%);

/* .module-card:hover — sombra */
  box-shadow: 0 22px 50px -22px rgba(90,127,38,0.32);
```

Ojo con `url('../assets/hero-altozano.jpg')` → `url('../assets/hero-cliente.jpg')`.

- [ ] **Paso 6: Limpiar el bloque responsive de selectores ajenos**

Dentro de `@media (max-width: 1024px)` borrar estas dos líneas — pertenecen a módulos de
Altozano que este tablero no tiene:

```css
  .weeks-grid { grid-template-columns: repeat(3, 1fr); }
  .checklist-grid { grid-template-columns: repeat(2, 1fr); }
```

Y dentro de `@media (max-width: 480px)` borrar:

```css
  .weeks-grid { grid-template-columns: 1fr; }
```

- [ ] **Paso 7: Confirmar que no quedan rastros de Altozano**

```bash
grep -niE 'altozano|--gold|weeks-grid|checklist-grid' css/styles.css
```

Esperado: **sin resultados**. Si aparece algo, corregirlo antes de seguir.

- [ ] **Paso 8: Crear `index.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LANDER · Tablero de Control | Metta</title>
<meta name="description" content="Tablero de control del paquete de amenidades de __CLIENTE__ — Casa Club en Hermosillo, Sonora. Metta Arquitectura y Construcción.">
<link rel="icon" type="image/png" href="assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<!-- CACHE-BUSTING: sube ?v=YYYYMMDD cuando cambies styles.css o los scripts -->
<link rel="stylesheet" href="css/styles.css?v=20260806">
</head>
<body data-seccion="Tablero de Control">

<nav class="topbar">
  <div class="topbar-inner">
    <a href="index.html" class="topbar-logo">
      <img src="assets/logo-cliente.png" alt="LANDER" onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">
      <span class="fallback" style="display:none">LANDER</span>
      <img src="assets/logo-metta.png" alt="Metta" onerror="this.style.display='none'">
    </a>
    <a href="index.html" class="topbar-inicio">INICIO</a>
    <span class="topbar-tag">Tablero de Control · Metta</span>
  </div>
</nav>

<!-- ============ HERO PRINCIPAL ============ -->
<section class="home-hero">
  <div class="home-hero-inner">
    <div class="eyebrow fade-up">Gerencia de Proyecto · <span data-brand-gerencia>Metta Arquitectura y Construcción</span></div>
    <h1 class="fade-up delay-1"><span id="hero-nombre">LANDER · Amenidades</span><br>Tablero de control</h1>
    <p class="lead fade-up delay-2" id="hero-descripcion">
      Seguimiento del paquete de amenidades del desarrollo LANDER en Hermosillo, Sonora.
      Planos ejecutivos, presupuesto base, programa de obra y reportes semanales —
      todo en un solo lugar.
    </p>
    <div class="home-meta fade-up delay-3">
      <div class="home-meta-item">
        <div class="lbl">Ubicación</div>
        <div class="val" id="meta-ubicacion">Hermosillo, Sonora</div>
      </div>
      <div class="home-meta-item">
        <div class="lbl">Alcance</div>
        <div class="val" id="meta-alcance">Casa Club · Etapa 1</div>
      </div>
      <div class="home-meta-item">
        <div class="lbl">Inicio</div>
        <div class="val" id="meta-inicio">—</div>
      </div>
      <div class="home-meta-item">
        <div class="lbl">Término</div>
        <div class="val" id="meta-fin">—</div>
      </div>
    </div>
  </div>
</section>

<!-- ============ BANDA DE INDICADORES RÁPIDOS ============ -->
<section class="quickstats">
  <div class="quickstats-grid">
    <div class="quickstat fade-up">
      <div class="lbl">Avance real</div>
      <div class="val accent" id="qs-real">—</div>
      <div class="sub" id="qs-real-sub">Sin reportes aún</div>
    </div>
    <div class="quickstat fade-up delay-1">
      <div class="lbl">Avance programado</div>
      <div class="val" id="qs-prog">—</div>
      <div class="sub">A la fecha de corte</div>
    </div>
    <div class="quickstat fade-up delay-2">
      <div class="lbl">Variación</div>
      <div class="val" id="qs-var">—</div>
      <div class="sub" id="qs-var-sub">Real vs. programado</div>
    </div>
    <div class="quickstat fade-up delay-3">
      <div class="lbl">Días restantes</div>
      <div class="val alt" id="qs-dias">—</div>
      <div class="sub" id="qs-dias-sub">Para el término de obra</div>
    </div>
  </div>
</section>

<!-- ============ GRID DE MÓDULOS ============ -->
<section class="modules">
  <div class="modules-header">
    <h2>Módulos del tablero</h2>
    <span class="count">4 módulos</span>
  </div>
  <div class="modules-grid">

    <a href="planos.html" class="module-card fade-up">
      <div class="module-card-top">
        <div class="module-icon">📐</div>
        <div class="module-num">01</div>
      </div>
      <h3>Planos</h3>
      <p>Paquete de planos ejecutivos del Casa Club. Filtra por especialidad o busca por clave, y ábrelos a pantalla completa sin salir del tablero.</p>
      <div class="module-arrow">Ver planos <span class="dot">→</span></div>
    </a>

    <div class="module-card disabled fade-up delay-1">
      <div class="module-card-top">
        <div class="module-icon">💵</div>
        <span class="soon-badge">Próximamente</span>
      </div>
      <h3>Presupuesto base interno</h3>
      <p>Presupuesto base de control interno de la obra, con su desglose por partida.</p>
    </div>

    <div class="module-card disabled fade-up delay-2">
      <div class="module-card-top">
        <div class="module-icon">📅</div>
        <span class="soon-badge">Próximamente</span>
      </div>
      <h3>Programa de obra</h3>
      <p>Gantt del programa de obra con ruta crítica y avance por tarea. En elaboración.</p>
    </div>

    <div class="module-card disabled fade-up">
      <div class="module-card-top">
        <div class="module-icon">📈</div>
        <span class="soon-badge">Próximamente</span>
      </div>
      <h3>Reportes semanales</h3>
      <p>Reporte de estatus semanal: avance físico-financiero, actividades y reporte fotográfico.</p>
    </div>

  </div>
</section>

<footer>
  <div class="brand">LANDER <span>·</span> Tablero de Control</div>
  <div><span data-brand-gerencia>Metta Arquitectura y Construcción</span> · Gerencia de Proyecto · <span data-brand-ubicacion>Hermosillo, Sonora</span></div>
</footer>

</body>
</html>
```

Nota: las tarjetas pendientes son `<div class="module-card disabled">` — sin `href` y sin
`.module-arrow`. Las clases `.disabled` y `.soon-badge` ya vienen en el CSS extraído.

- [ ] **Paso 9: Verificar en el navegador**

Levantar Live Server y abrir `index.html`. Comprobar:

- La topbar muestra "LANDER" en texto (aún no hay `logo-cliente.png` — el `onerror` debe
  ocultar la imagen rota, no dejar el ícono de imagen fallida).
- El hero se ve con degradado verde. Sin `hero-cliente.jpg` el degradado sale sólido: es
  lo esperado, no un error.
- Los 4 recuadros de indicadores muestran `—`.
- Se ven las 4 tarjetas: Planos con flecha "Ver planos" y las otras tres con badge
  "Próximamente", atenuadas y no clicables.
- Las tarjetas alternan verde (1ª y 3ª) y gris (2ª y 4ª) en el ícono.
- La consola del navegador no tiene errores (aún no hay JS, así que debe estar limpia).
- Achicar la ventana a ~700 px: el grid pasa a 2 columnas y luego a 1.

- [ ] **Paso 10: Commit**

```bash
git add css/styles.css index.html assets/.gitkeep
git commit -m "feat: sistema de diseño LANDER y portada estática

Extrae de Altozano solo los bloques compartidos de la hoja de estilos
(tokens, topbar, hero, indicadores, cards, footer, animaciones,
responsive y reduced-motion) y los repinta con la paleta LANDER:
verde #5A7F26 para texto y gris #63666A como acento secundario.

La portada queda completa y correcta sin JavaScript.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Tarea 2: Datos del proyecto y branding dinámico

Mete los datos del proyecto en un solo JSON y hace que la portada y el `<title>` se
alimenten de ahí. Al terminar, cambiar el nombre del cliente en un archivo se refleja en
toda la página.

**Files:**
- Create: `data/proyecto.json`
- Create: `js/branding.js`
- Create: `js/shell.js`
- Modify: `index.html` (agregar los dos `<script>` antes de `</body>`)

**Interfaces:**
- Consumes: de la tarea 1, los `id` de `index.html` (`#hero-nombre`, `#hero-descripcion`,
  `#meta-ubicacion`, `#meta-alcance`, `#meta-inicio`, `#meta-fin`, `#qs-real`, `#qs-prog`,
  `#qs-var`, `#qs-dias`, `#qs-real-sub`, `#qs-var-sub`, `#qs-dias-sub`), los atributos
  `data-brand-gerencia` / `data-brand-ubicacion` y `body[data-seccion]`.
- Produces: `data/proyecto.json` con la forma `{ proyecto: { nombre, nombre_corto,
  subtitulo, cliente, gerencia, ubicacion, alcance, fecha_inicio, fecha_fin, descripcion } }`,
  consumido por `branding.js` (todas las páginas) y `shell.js`. `branding.js` se carga en
  `planos.html` en la tarea 4.

---

- [ ] **Paso 1: Crear `data/proyecto.json`**

```json
{
  "proyecto": {
    "nombre": "LANDER · Amenidades",
    "nombre_corto": "LANDER",
    "subtitulo": "Casa Club · Amenidades",
    "cliente": "Desarrollos Residenciales LANDER",
    "gerencia": "Metta Arquitectura y Construcción",
    "ubicacion": "Hermosillo, Sonora",
    "alcance": "Casa Club · Etapa 1",
    "fecha_inicio": "2026-08-10",
    "fecha_fin": "2026-09-21",
    "descripcion": "Seguimiento del paquete de amenidades del desarrollo LANDER en Hermosillo, Sonora. Planos ejecutivos, presupuesto base, programa de obra y reportes semanales — todo en un solo lugar."
  }
}
```

> `fecha_fin` es estimada: inicio + 6 semanas. Cambiará cuando exista el programa de obra.

- [ ] **Paso 2: Verificar que el JSON es válido**

```bash
node -e "const p=require('./data/proyecto.json').proyecto;const f=['nombre','nombre_corto','cliente','gerencia','ubicacion','alcance','fecha_inicio','fecha_fin','descripcion'];const falta=f.filter(k=>!p[k]);console.log(falta.length?'FALTAN: '+falta:'OK, todos los campos presentes');"
```

Esperado: `OK, todos los campos presentes`.

- [ ] **Paso 3: Crear `js/branding.js`**

```js
/* ============================================================
   LANDER · TABLERO · Identidad compartida
   Se carga en TODAS las páginas. Lee data/proyecto.json y:
   - arma el <title> con nombre_corto + sección + gerencia
   - sustituye __CLIENTE__ en el <meta description>
   - rellena los elementos con data-brand-*
   Si el JSON no carga, la página conserva sus textos de respaldo.
   ============================================================ */

(async function () {
  let p = null;
  try {
    const resp = await fetch(`data/proyecto.json?t=${Date.now()}`, { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    p = (await resp.json()).proyecto;
  } catch (e) {
    console.warn('branding: no se pudo cargar proyecto.json —', e.message);
    return;
  }
  if (!p) return;

  /* Título de la pestaña: "LANDER · Planos | Metta Arquitectura y Construcción" */
  const seccion = document.body.dataset.seccion || '';
  const izq = [p.nombre_corto, seccion].filter(Boolean).join(' · ');
  document.title = p.gerencia ? `${izq} | ${p.gerencia}` : izq;

  /* Meta description: el HTML trae el marcador __CLIENTE__ */
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.content = meta.content.replace('__CLIENTE__', p.cliente || p.nombre || '');

  /* Textos de marca repartidos por la página */
  const poner = (attr, valor) => {
    if (!valor) return;
    document.querySelectorAll(`[${attr}]`).forEach(el => { el.textContent = valor; });
  };
  poner('data-brand-cliente', p.cliente);
  poner('data-brand-gerencia', p.gerencia);
  poner('data-brand-ubicacion', p.ubicacion);

  /* alt correcto del logo del cliente */
  const logo = document.querySelector('.topbar-logo img');
  if (logo) logo.alt = p.nombre_corto || p.nombre || '';
})();
```

- [ ] **Paso 4: Crear `js/shell.js`**

```js
/* ============================================================
   LANDER · TABLERO · Lógica de la portada (index.html)
   - Llena el hero con data/proyecto.json
   - Llena la banda de indicadores con el ÚLTIMO reporte semanal
     publicado. Mientras no haya reportes, "Días restantes" sí se
     calcula (sale de fecha_fin) y los otros tres quedan en "—".
   ============================================================ */

const $ = (sel) => document.querySelector(sel);
const fmt = (n, d = 2) => Number(n).toFixed(d);

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
               'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/* Convierte "2026-08-10" en "10 de agosto, 2026" */
function fechaLarga(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} de ${MESES[m - 1]}, ${y}`;
}

async function cargarJSON(ruta) {
  try {
    const resp = await fetch(`${ruta}?t=${Date.now()}`, { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch (e) {
    console.warn(`No se pudo cargar ${ruta}:`, e.message);
    return null;
  }
}

/* Hero y meta del proyecto */
function renderProyecto(datos) {
  if (!datos || !datos.proyecto) return;
  const p = datos.proyecto;

  $('#hero-nombre').textContent = p.nombre || 'LANDER · Amenidades';
  if (p.descripcion) $('#hero-descripcion').textContent = p.descripcion;
  $('#meta-ubicacion').textContent = p.ubicacion || '—';
  $('#meta-alcance').textContent = p.alcance || '—';
  $('#meta-inicio').textContent = fechaLarga(p.fecha_inicio);
  $('#meta-fin').textContent = fechaLarga(p.fecha_fin);

  /* Días restantes para el término de obra */
  if (!p.fecha_fin) return;
  const hoy = new Date();
  const fin = new Date(p.fecha_fin + 'T00:00:00');
  const dias = Math.round((fin - hoy) / (1000 * 60 * 60 * 24));
  const el = $('#qs-dias');
  if (dias > 0) {
    el.textContent = dias;
    $('#qs-dias-sub').textContent = `Para el ${fechaLarga(p.fecha_fin)}`;
  } else if (dias === 0) {
    el.textContent = 'Hoy';
    $('#qs-dias-sub').textContent = 'Es la fecha de término';
  } else {
    el.textContent = `+${Math.abs(dias)}`;
    $('#qs-dias-sub').textContent = 'Días vencidos del plazo';
  }
}

/* Banda de indicadores, alimentada por el último reporte semanal */
async function renderQuickstats() {
  const indice = await cargarJSON('data/reportes/index.json');
  const semanas = indice?.semanas_publicadas || [];
  if (!semanas.length) {
    $('#qs-real-sub').textContent = 'Sin reportes aún';
    return;
  }

  const ultima = [...semanas].sort((a, b) => parseInt(b) - parseInt(a))[0];
  const data = await cargarJSON(`data/reportes/semana-${ultima}.json`);
  if (!data || !data.avance_global) {
    $('#qs-real-sub').textContent = 'Reporte no disponible';
    return;
  }

  const g = data.avance_global;
  $('#qs-real').textContent = fmt(g.real_pct) + '%';
  $('#qs-prog').textContent = fmt(g.programado_pct) + '%';
  $('#qs-real-sub').textContent = `Semana ${ultima} · ${data.semana?.periodo || ''}`;

  const varEl = $('#qs-var');
  const signo = g.variacion_pct >= 0 ? '+' : '';
  varEl.textContent = `${signo}${fmt(g.variacion_pct)}%`;
  varEl.classList.add(g.variacion_pct >= 0 ? 'pos' : 'neg');
  $('#qs-var-sub').textContent = g.variacion_pct >= 0
    ? 'Adelanto sobre el programa'
    : 'Atraso respecto al programa';
}

/* Animaciones al hacer scroll */
function animar() {
  const io = new IntersectionObserver((entradas) => {
    entradas.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
}

async function init() {
  renderProyecto(await cargarJSON('data/proyecto.json'));
  await renderQuickstats();
  animar();
}

document.addEventListener('DOMContentLoaded', init);
```

- [ ] **Paso 5: Enlazar los scripts en `index.html`**

Justo antes de `</body>`:

```html
<script src="js/branding.js?v=20260806"></script>
<script src="js/shell.js?v=20260806"></script>
</body>
```

- [ ] **Paso 6: Verificar en el navegador**

Recargar `index.html` con Live Server. Comprobar:

- El título de la pestaña dice **"LANDER · Tablero de Control | Metta Arquitectura y Construcción"**.
- El hero muestra Ubicación "Hermosillo, Sonora", Alcance "Casa Club · Etapa 1",
  Inicio "10 de agosto, 2026", Término "21 de septiembre, 2026".
- **"Días restantes" muestra un número**, no `—`.
- Los otros tres indicadores siguen en `—` y el primero dice "Sin reportes aún". En la
  consola aparece un `warn` de `data/reportes/index.json` — es correcto, ese archivo se
  crea en la tarea 3.
- Las tarjetas entran con la animación `fade-up` al hacer scroll.

Prueba de que el branding es real: cambiar temporalmente `"nombre_corto": "LANDER"` por
`"PRUEBA"`, recargar, confirmar que el título de la pestaña cambia, y **revertirlo**.

- [ ] **Paso 7: Commit**

```bash
git add data/proyecto.json js/branding.js js/shell.js index.html
git commit -m "feat: datos del proyecto y branding dinámico de la portada

Todo el texto de marca sale de data/proyecto.json: título de pestaña,
meta description, hero y pie. La banda de indicadores queda cableada;
'Días restantes' ya calcula contra la fecha de término y los otros
tres esperan al primer reporte semanal.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Tarea 3: Catálogo de planos

Transcribe las 17 láminas al JSON que consume el módulo. Las claves y nombres salen del
cuadro de datos de cada PDF (campos CONTENIDO y PLANO No.), ya validados con el cliente.

**Files:**
- Create: `data/planos/index.json`
- Create: `data/reportes/index.json`

**Interfaces:**
- Consumes: los 17 PDFs ya presentes en `data/planos/`.
- Produces: `data/planos/index.json` con la forma
  `{ actualizado: string, especialidades: [{id, nombre}], planos: [{clave, nombre, especialidad, archivo, revision?, fecha?, notas?}] }`,
  consumido por `js/planos.js` en las tareas 4 y 5.
  `data/reportes/index.json` con `{ semanas_publicadas: [] }`, consumido por `shell.js`.

---

- [ ] **Paso 1: Crear `data/reportes/index.json`**

```json
{
  "semanas_publicadas": []
}
```

- [ ] **Paso 2: Crear `data/planos/index.json`**

Cuidado al transcribir los nombres de archivo: los estructurales llevan **dos espacios**
entre `CLUB` y `MDP`.

```json
{
  "actualizado": "2026-08-06",
  "especialidades": [
    { "id": "arquitectonico", "nombre": "Arquitectónico" },
    { "id": "estructural",    "nombre": "Estructural" },
    { "id": "electrico",      "nombre": "Eléctrico" },
    { "id": "hidrosanitario", "nombre": "Hidrosanitario" },
    { "id": "aire",           "nombre": "Aire acondicionado" },
    { "id": "paisajismo",     "nombre": "Paisajismo" },
    { "id": "herreria",       "nombre": "Herrería y cancelería" },
    { "id": "acabados",       "nombre": "Acabados" }
  ],
  "planos": [
    { "clave": "ARQ-01", "nombre": "Planta de conjunto",      "especialidad": "arquitectonico", "archivo": "01.ARQ-CC-MDP NORTE V.03-01.CONJUNTO.pdf",  "revision": "V.03" },
    { "clave": "ARQ-02", "nombre": "Planta arquitectónica",   "especialidad": "arquitectonico", "archivo": "01.ARQ-CC-MDP NORTE V.03-02.ARQ.pdf",       "revision": "V.03", "fecha": "2026-06-15" },
    { "clave": "ARQ-03", "nombre": "Fachadas",                "especialidad": "arquitectonico", "archivo": "01.ARQ-CC-MDP NORTE V.03-03.FACHADAS.pdf",  "revision": "V.03" },
    { "clave": "ARQ-04", "nombre": "Cortes",                  "especialidad": "arquitectonico", "archivo": "01.ARQ-CC-MDP NORTE V.03-04.CORTES.pdf",    "revision": "V.03" },

    { "clave": "EST-01", "nombre": "Planta de conjunto",                        "especialidad": "estructural", "archivo": "03.- ESTRUCTURAL CASA CLUB  MDP NORTE 260223-EST-01.pdf", "fecha": "2026-02-23" },
    { "clave": "EST-02", "nombre": "Estructural de cubierta metálica 1",        "especialidad": "estructural", "archivo": "03.- ESTRUCTURAL CASA CLUB  MDP NORTE 260223-EST-02.pdf", "fecha": "2026-02-23" },
    { "clave": "EST-03", "nombre": "Cimentación cubierta metálica 1",           "especialidad": "estructural", "archivo": "03.- ESTRUCTURAL CASA CLUB  MDP NORTE 260223-EST-03.pdf", "fecha": "2026-02-23" },
    { "clave": "EST-04", "nombre": "Estructural de cubierta metálica 2",        "especialidad": "estructural", "archivo": "03.- ESTRUCTURAL CASA CLUB  MDP NORTE 260223-EST-04.pdf", "fecha": "2026-02-23" },
    { "clave": "EST-05", "nombre": "Cimentación cubierta metálica 2",           "especialidad": "estructural", "archivo": "03.- ESTRUCTURAL CASA CLUB  MDP NORTE 260223-EST-05.pdf", "fecha": "2026-02-23" },
    { "clave": "EST-06", "nombre": "Estructural de módulo de baños",            "especialidad": "estructural", "archivo": "03.- ESTRUCTURAL CASA CLUB  MDP NORTE 260223-EST-06.pdf", "fecha": "2026-02-23" },
    { "clave": "EST-07", "nombre": "Estructural de pórticos PR-01",             "especialidad": "estructural", "archivo": "03.- ESTRUCTURAL CASA CLUB  MDP NORTE 260223-EST-07.pdf", "fecha": "2026-02-23" },
    { "clave": "EST-08", "nombre": "Estructural de pórticos PR-02, 03 y 04",    "especialidad": "estructural", "archivo": "03.- ESTRUCTURAL CASA CLUB  MDP NORTE 260223-EST-08.pdf", "fecha": "2026-02-23" },
    { "clave": "EST-09", "nombre": "Estructural de cuarto de máquinas y fire pit", "especialidad": "estructural", "archivo": "03.- ESTRUCTURAL CASA CLUB  MDP NORTE 260223-EST-09.pdf", "fecha": "2026-02-23" },

    { "clave": "IH-01",  "nombre": "Instalación hidráulica",  "especialidad": "hidrosanitario", "archivo": "04.INST. HIDROSANITARIA-CC-MDPL II V.02-HIDRAULICO.pdf", "revision": "V.02" },
    { "clave": "IS-01",  "nombre": "Instalación sanitaria",   "especialidad": "hidrosanitario", "archivo": "04.INST. HIDROSANITARIA-CC-MDPL II V.02-SANITARIO.pdf",  "revision": "V.02" },

    { "clave": "ACA-01", "nombre": "Planta de acabados",      "especialidad": "acabados", "archivo": "05.PLANO DE ACABADOS-CC-MDPL II V.03-ACA-01.pdf", "revision": "V.03" },
    { "clave": "ACA-02", "nombre": "Acabados en fachada",     "especialidad": "acabados", "archivo": "05.PLANO DE ACABADOS-CC-MDPL II V.03-ACA-02.pdf", "revision": "V.03" }
  ]
}
```

> La fecha del paquete estructural viene del `260223` del nombre de archivo leído como
> AAMMDD. No está en el cuadro de datos; confirmar con el proyectista si se vuelve
> relevante. Ver spec §6.4.

- [ ] **Paso 3: Verificar que cada `archivo` existe realmente en disco**

Este es el error de mantenimiento más probable del módulo — un nombre mal transcrito y el
plano da 404 sin aviso.

```bash
node -e "
const fs=require('fs'), c=require('./data/planos/index.json');
const ids=new Set(c.especialidades.map(e=>e.id));
let err=0;
for (const p of c.planos) {
  if (!fs.existsSync('data/planos/'+p.archivo)) { console.log('FALTA ARCHIVO:', p.clave, '->', p.archivo); err++; }
  if (!ids.has(p.especialidad)) { console.log('ESPECIALIDAD DESCONOCIDA:', p.clave, '->', p.especialidad); err++; }
}
const pdfs=fs.readdirSync('data/planos').filter(f=>f.toLowerCase().endsWith('.pdf'));
const usados=new Set(c.planos.map(p=>p.archivo));
pdfs.filter(f=>!usados.has(f)).forEach(f=>{ console.log('PDF SIN CATALOGAR:', f); err++; });
console.log(err ? '=> '+err+' problema(s)' : '=> OK: '+c.planos.length+' planos, todos con archivo existente');
"
```

Esperado: `=> OK: 17 planos, todos con archivo existente`.

- [ ] **Paso 4: Verificar que los indicadores dejaron de avisar**

Recargar `index.html`. La consola ya no debe mostrar el `warn` de
`data/reportes/index.json`, y el primer indicador debe decir "Sin reportes aún".

- [ ] **Paso 5: Commit**

```bash
git add data/planos/index.json data/reportes/index.json
git commit -m "feat: catálogo de los 17 planos del Casa Club

Claves y nombres tomados del cuadro de datos de cada PDF. Se declaran
las 8 especialidades del paquete ejecutivo aunque hoy solo cuatro
tengan lámina; el módulo solo dibuja chip para las que tienen planos.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Tarea 4: Página de planos — lista, filtros y buscador

Construye `planos.html` y la parte de `js/planos.js` que carga el catálogo y lo presenta.
Al terminar, se pueden filtrar y buscar los 17 planos, y el botón "Abrir" los lanza en
pestaña nueva. El visor a pantalla completa llega en la tarea 5 y **mejora** ese botón sin
quitarlo: el `href` se queda como respaldo para iOS y para navegación sin JavaScript.

**Files:**
- Create: `planos.html`
- Create: `js/planos.js`
- Modify: `css/styles.css` (agregar bloque al final)

**Interfaces:**
- Consumes: `data/planos/index.json` (tarea 3), `js/branding.js` (tarea 2), y del CSS de la
  tarea 1: `.topbar`, `.page-hero`, `.cards-section`, `.empty-state`, `.loading`, `.fade-up`,
  `footer`, y los tokens de color.
- Produces: en `js/planos.js`, el objeto `estado` (`{ catalogo, filtro, busqueda, visibles }`),
  las funciones `normaliza(texto)`, `urlPlano(plano)`, `aplicarFiltros()`, `render()` y el
  stub `abrirPlano(indice)`. La tarea 5 reemplaza `abrirPlano` y usa `estado.visibles`.

---

- [ ] **Paso 1: Crear `planos.html`**

```html
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>LANDER · Planos | Metta</title>
<meta name="description" content="Paquete de planos ejecutivos del Casa Club de __CLIENTE__.">
<link rel="icon" type="image/png" href="assets/favicon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/styles.css?v=20260806">
</head>
<body data-seccion="Planos">

<nav class="topbar">
  <div class="topbar-inner">
    <a href="index.html" class="topbar-logo">
      <img src="assets/logo-cliente.png" alt="LANDER" onerror="this.style.display='none';this.nextElementSibling.style.display='inline'">
      <span class="fallback" style="display:none">LANDER</span>
      <img src="assets/logo-metta.png" alt="Metta" onerror="this.style.display='none'">
    </a>
    <a href="index.html" class="topbar-inicio">INICIO</a>
    <a href="index.html" class="back-link">← Volver al tablero</a>
  </div>
</nav>

<section class="page-hero">
  <div class="eyebrow fade-up">Módulo 01 · Proyecto ejecutivo</div>
  <h1 class="fade-up delay-1">Planos</h1>
  <p class="lead fade-up delay-2">
    Paquete de planos del Casa Club. Filtra por especialidad o busca por clave y nombre;
    da clic en cualquier lámina para abrirla a pantalla completa.
  </p>
</section>

<div class="planos-toolbar">
  <div class="planos-toolbar-inner">
    <div class="planos-buscador" id="buscador-wrap">
      <span class="ico" aria-hidden="true">🔍</span>
      <input type="search" id="buscador" placeholder="Buscar por clave o nombre…" aria-label="Buscar planos" autocomplete="off">
      <button type="button" class="limpiar" id="limpiar-busqueda" aria-label="Limpiar búsqueda">✕</button>
    </div>
    <div class="planos-chips" id="chips" role="group" aria-label="Filtrar por especialidad">
      <span class="planos-conteo" id="conteo">—</span>
    </div>
  </div>
</div>

<section class="cards-section">
  <div id="lista"><div class="loading">Cargando planos…</div></div>
</section>

<footer>
  <div class="brand">LANDER <span>·</span> Planos</div>
  <div><span data-brand-gerencia>Metta Arquitectura y Construcción</span> · Gerencia de Proyecto</div>
</footer>

<script src="js/branding.js?v=20260806"></script>
<script src="js/planos.js?v=20260806"></script>
</body>
</html>
```

- [ ] **Paso 2: Agregar los estilos de la barra y el listado al final de `css/styles.css`**

> El `top: 61px` de `.planos-toolbar` es la altura de la topbar sticky (≈63 px con su
> borde). Si al hacer scroll se cuela una franja de contenido entre la topbar y la barra
> de filtros, mide la topbar con las devtools y ajusta ese valor y el de la media query
> de 768 px.

```css
/* ============================================================
   MÓDULO 01 · PLANOS — barra de filtros y listado
   ============================================================ */
.planos-toolbar {
  position: sticky; top: 61px; z-index: 40;
  background: rgba(255,255,255,0.92);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-block: 1px solid var(--line);
  padding: 1rem 0;
}
.planos-toolbar-inner {
  max-width: 1280px; margin: 0 auto; padding: 0 2rem;
  display: flex; flex-direction: column; gap: 0.9rem;
}

/* ---------- Buscador ---------- */
.planos-buscador { position: relative; max-width: 420px; width: 100%; }
.planos-buscador input {
  width: 100%; font-family: var(--font-body); font-size: 0.92rem;
  padding: 0.7rem 2.4rem 0.7rem 2.5rem;
  border: 1px solid var(--line); border-radius: 999px;
  background: var(--bg-soft); color: var(--ink);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
}
.planos-buscador input::-webkit-search-cancel-button { display: none; }
.planos-buscador input:focus {
  outline: none; background: #fff;
  border-color: var(--accent-mid);
  box-shadow: 0 0 0 3px var(--accent-soft);
}
.planos-buscador .ico {
  position: absolute; left: 0.9rem; top: 50%; transform: translateY(-50%);
  font-size: 0.9rem; pointer-events: none; opacity: 0.55;
}
.planos-buscador .limpiar {
  position: absolute; right: 0.5rem; top: 50%; transform: translateY(-50%);
  border: 0; background: none; cursor: pointer; color: var(--ink-mute);
  font-size: 0.9rem; padding: 0.35rem; border-radius: 50%; line-height: 1; display: none;
}
.planos-buscador.tiene-texto .limpiar { display: block; }
.planos-buscador .limpiar:hover { color: var(--ink); background: var(--bg-soft-2); }

/* ---------- Chips de especialidad ---------- */
.planos-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
.planos-chip {
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: 0.5rem 0.95rem; border-radius: 999px;
  background: var(--bg-soft); border: 1px solid var(--line-soft);
  font-family: var(--font-body); font-size: 0.85rem; font-weight: 500;
  color: var(--ink-soft); cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
.planos-chip:hover { border-color: var(--accent-mid); color: var(--accent); }
.planos-chip.activo { background: var(--accent); border-color: var(--accent); color: #fff; }
.planos-chip .n { font-family: var(--font-mono); font-size: 0.74rem; opacity: 0.7; }
.planos-conteo {
  margin-left: auto; font-family: var(--font-mono);
  font-size: 0.8rem; color: var(--ink-mute); white-space: nowrap;
}

/* ---------- Encabezado de grupo ---------- */
.planos-grupo {
  font-family: var(--font-display); font-size: 0.76rem; font-weight: 600;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-mute);
  margin: 2.2rem 0 0.85rem; padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--line-soft);
}
.planos-grupo:first-child { margin-top: 0; }

/* ---------- Fila de plano ---------- */
.plano-fila {
  display: flex; align-items: center; gap: 1.1rem;
  padding: 1rem 1.2rem; border-radius: 14px; margin-bottom: 0.6rem;
  background: var(--bg-soft); border: 1px solid var(--line-soft);
  transition: border-color 0.22s var(--ease-out), box-shadow 0.22s var(--ease-out), transform 0.22s var(--ease-out);
}
.plano-fila:hover {
  border-color: var(--accent-mid); transform: translateY(-2px);
  box-shadow: 0 14px 30px -18px rgba(90,127,38,0.35);
}
.plano-ico {
  width: 42px; height: 42px; border-radius: 11px; flex-shrink: 0;
  background: var(--accent-soft); color: var(--accent);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.62rem; font-weight: 500;
}
.plano-datos { min-width: 0; flex: 1; }
.plano-clave {
  font-family: var(--font-mono); font-size: 0.72rem; font-weight: 500;
  color: var(--accent); letter-spacing: 0.06em;
}
.plano-nombre {
  font-family: var(--font-display); font-size: 1.02rem; font-weight: 500;
  letter-spacing: -0.015em; line-height: 1.3; margin-top: 0.1rem; color: var(--ink);
}
.plano-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.45rem; }
.plano-tag {
  font-size: 0.68rem; font-weight: 500; padding: 0.2rem 0.55rem; border-radius: 999px;
  background: var(--accent2-soft); color: var(--accent2-dark);
}
.plano-acciones { display: flex; gap: 0.5rem; flex-shrink: 0; }
.plano-btn {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-family: var(--font-body); font-size: 0.8rem; font-weight: 500;
  padding: 0.55rem 1rem; border-radius: 999px; cursor: pointer;
  text-decoration: none; border: 1px solid var(--line);
  background: #fff; color: var(--ink-soft);
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
.plano-btn:hover { border-color: var(--accent-mid); color: var(--accent); }
.plano-btn-primario { background: var(--accent); border-color: var(--accent); color: #fff; }
.plano-btn-primario:hover { background: var(--accent-dark); border-color: var(--accent-dark); color: #fff; }

@media (max-width: 768px) {
  .planos-toolbar { top: 57px; }
  .planos-toolbar-inner { padding: 0 1.25rem; }
  .planos-conteo { margin-left: 0; width: 100%; }
  .plano-fila { flex-wrap: wrap; gap: 0.8rem; }
  .plano-acciones { width: 100%; }
  .plano-btn { flex: 1; justify-content: center; }
}
```

- [ ] **Paso 3: Crear `js/planos.js` (lista y filtros)**

```js
/* ============================================================
   LANDER · TABLERO · Módulo 01 · Planos
   Carga data/planos/index.json, dibuja los filtros y el listado.
   Agrupa por especialidad cuando no hay filtro ni búsqueda; en
   cuanto se filtra o se busca, pasa a lista plana ordenada por clave.
   ============================================================ */

const RUTA_PDFS = 'data/planos/';

const estado = {
  catalogo: null,   // { actualizado, especialidades, planos }
  filtro: 'todas',  // id de especialidad o 'todas'
  busqueda: '',
  visibles: [],     // planos que pasan filtro + búsqueda, en el orden mostrado
};

const el = (sel) => document.querySelector(sel);

/* Minúsculas y sin acentos, para que "hidraulico" encuentre "Hidráulica".
   \p{Diacritic} son las marcas de acento que suelta normalize('NFD').
   Se usa la propiedad Unicode (bandera u) en vez del rango literal
   U+0300-U+036F, que son caracteres invisibles y se corrompen al copiar. */
function normaliza(texto) {
  return (texto || '').toString().toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

/* Los nombres de archivo traen espacios y puntos: hay que codificarlos */
function urlPlano(plano) {
  return RUTA_PDFS + encodeURIComponent(plano.archivo);
}

/* "2026-02-23" -> "23 feb 2026" */
const MESES_CORTOS = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
function fechaCorta(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MESES_CORTOS[m - 1]} ${y}`;
}

/* Nombre visible de una especialidad; si no está declarada, usa su id crudo */
function nombreEspecialidad(id) {
  const e = estado.catalogo.especialidades.find(x => x.id === id);
  return e ? e.nombre : id;
}

/* Orden de especialidades: primero las declaradas, luego las no declaradas */
function especialidadesConPlanos() {
  const declaradas = estado.catalogo.especialidades.map(e => e.id);
  const usadas = [...new Set(estado.catalogo.planos.map(p => p.especialidad))];
  const enOrden = declaradas.filter(id => usadas.includes(id));
  const extras = usadas.filter(id => !declaradas.includes(id)).sort();
  return [...enOrden, ...extras];
}

/* ------------------------------------------------------------
   Filtrado
   ------------------------------------------------------------ */
function aplicarFiltros() {
  const q = normaliza(estado.busqueda).trim();
  let lista = estado.catalogo.planos.filter(p => {
    if (estado.filtro !== 'todas' && p.especialidad !== estado.filtro) return false;
    if (!q) return true;
    return normaliza(`${p.clave} ${p.nombre} ${p.notas || ''}`).includes(q);
  });

  if (estado.filtro === 'todas' && !q) {
    /* Modo agrupado: respeta el orden de especialidades y, dentro, la clave */
    const orden = especialidadesConPlanos();
    lista.sort((a, b) => {
      const d = orden.indexOf(a.especialidad) - orden.indexOf(b.especialidad);
      return d !== 0 ? d : a.clave.localeCompare(b.clave, 'es');
    });
  } else {
    lista.sort((a, b) => a.clave.localeCompare(b.clave, 'es'));
  }

  estado.visibles = lista;
}

/* ------------------------------------------------------------
   Render
   ------------------------------------------------------------ */
function renderChips() {
  const cont = el('#chips');
  const conteo = el('#conteo');
  cont.querySelectorAll('.planos-chip').forEach(c => c.remove());

  const total = estado.catalogo.planos.length;
  const chips = [{ id: 'todas', nombre: 'Todas', n: total }];
  especialidadesConPlanos().forEach(id => {
    chips.push({
      id,
      nombre: nombreEspecialidad(id),
      n: estado.catalogo.planos.filter(p => p.especialidad === id).length,
    });
  });

  chips.forEach(c => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'planos-chip' + (estado.filtro === c.id ? ' activo' : '');
    b.setAttribute('aria-pressed', String(estado.filtro === c.id));
    b.innerHTML = `${c.nombre} <span class="n">${c.n}</span>`;
    b.addEventListener('click', () => { estado.filtro = c.id; render(); });
    cont.insertBefore(b, conteo);
  });
}

function filaPlano(plano, indice) {
  const tags = [];
  if (plano.revision) tags.push(plano.revision);
  if (plano.fecha) tags.push(fechaCorta(plano.fecha));
  if (plano.notas) tags.push(plano.notas);

  const fila = document.createElement('div');
  fila.className = 'plano-fila';
  fila.innerHTML = `
    <div class="plano-ico" aria-hidden="true">PDF</div>
    <div class="plano-datos">
      <div class="plano-clave">${plano.clave}</div>
      <div class="plano-nombre">${plano.nombre}</div>
      ${tags.length ? `<div class="plano-tags">${tags.map(t => `<span class="plano-tag">${t}</span>`).join('')}</div>` : ''}
    </div>
    <div class="plano-acciones">
      <a class="plano-btn plano-btn-primario abrir" href="${urlPlano(plano)}" target="_blank" rel="noopener">Abrir</a>
      <a class="plano-btn" href="${urlPlano(plano)}" download="${plano.clave} ${plano.nombre}.pdf">Descargar</a>
    </div>`;

  /* El visor de la tarea 5 se engancha aquí; el href queda como respaldo */
  fila.querySelector('.abrir').addEventListener('click', (ev) => abrirPlano(indice, ev));
  return fila;
}

function renderLista() {
  const cont = el('#lista');
  cont.innerHTML = '';

  if (!estado.visibles.length) {
    cont.innerHTML = estado.busqueda || estado.filtro !== 'todas'
      ? `<div class="empty-state">
           <div class="icon">🔍</div>
           <h3>Ningún plano coincide</h3>
           <p>No hay resultados para los filtros activos.</p>
           <p><button type="button" class="plano-btn" id="reset-filtros">Limpiar filtros</button></p>
         </div>`
      : `<div class="empty-state">
           <div class="icon">📐</div>
           <h3>Aún no hay planos publicados</h3>
           <p>Coloca los PDF en <code>data/planos/</code> y agrégalos al arreglo
              <code>planos</code> de <code>data/planos/index.json</code>.</p>
         </div>`;
    const reset = el('#reset-filtros');
    if (reset) reset.addEventListener('click', () => {
      estado.filtro = 'todas';
      estado.busqueda = '';
      el('#buscador').value = '';
      el('#buscador-wrap').classList.remove('tiene-texto');
      render();
    });
    return;
  }

  const agrupado = estado.filtro === 'todas' && !estado.busqueda.trim();
  let grupoActual = null;

  estado.visibles.forEach((plano, i) => {
    if (agrupado && plano.especialidad !== grupoActual) {
      grupoActual = plano.especialidad;
      const h = document.createElement('h2');
      h.className = 'planos-grupo';
      h.textContent = nombreEspecialidad(grupoActual);
      cont.appendChild(h);
    }
    cont.appendChild(filaPlano(plano, i));
  });
}

function renderConteo() {
  const n = estado.visibles.length;
  const total = estado.catalogo.planos.length;
  el('#conteo').textContent = n === total
    ? `${total} plano${total === 1 ? '' : 's'}`
    : `${n} de ${total} planos`;
}

function render() {
  aplicarFiltros();
  renderChips();
  renderConteo();
  renderLista();
}

/* Stub: la tarea 5 lo sustituye por el visor a pantalla completa.
   Por ahora deja pasar el clic y el navegador abre el PDF en otra pestaña. */
function abrirPlano(_indice, _ev) { /* sin comportamiento propio todavía */ }

/* ------------------------------------------------------------
   Arranque
   ------------------------------------------------------------ */
async function init() {
  try {
    const resp = await fetch(`data/planos/index.json?t=${Date.now()}`, { cache: 'no-cache' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    estado.catalogo = await resp.json();
  } catch (e) {
    console.warn('planos: no se pudo cargar el catálogo —', e.message);
    el('#lista').innerHTML = `
      <div class="empty-state">
        <div class="icon">📐</div>
        <h3>Aún no hay planos publicados</h3>
        <p>No se pudo leer <code>data/planos/index.json</code>.</p>
      </div>`;
    el('#conteo').textContent = '—';
    return;
  }

  estado.catalogo.especialidades = estado.catalogo.especialidades || [];
  estado.catalogo.planos = estado.catalogo.planos || [];

  const input = el('#buscador');
  input.addEventListener('input', () => {
    estado.busqueda = input.value;
    el('#buscador-wrap').classList.toggle('tiene-texto', input.value.length > 0);
    render();
  });
  el('#limpiar-busqueda').addEventListener('click', () => {
    input.value = '';
    estado.busqueda = '';
    el('#buscador-wrap').classList.remove('tiene-texto');
    input.focus();
    render();
  });

  render();
}

document.addEventListener('DOMContentLoaded', init);
```

- [ ] **Paso 4: Verificar en el navegador**

Abrir `planos.html` con Live Server:

- Se ven **4 chips** con contadores: Todas 17, Arquitectónico 4, Estructural 9,
  Hidrosanitario 2, Acabados 2. **No** aparecen Eléctrico, Aire acondicionado, Paisajismo
  ni Herrería — no tienen planos.
- Con "Todas" activo, la lista sale agrupada con encabezados ARQUITECTÓNICO, ESTRUCTURAL,
  HIDROSANITARIO, ACABADOS en ese orden.
- El contador dice "17 planos".
- Clic en "Estructural": la lista pasa a plana, 9 filas, contador "9 de 17 planos".
- Escribir `hidraulica` (sin acento) en el buscador: encuentra IH-01 "Instalación
  hidráulica". Esto valida la normalización de acentos. `HIDRÁULICA` en mayúsculas y con
  acento debe dar el mismo resultado.
  > El buscador hace coincidencia de subcadena sobre el texto sin acentos; no conoce
  > género ni raíces. `hidraulico` en masculino da **cero** resultados y eso es correcto:
  > el plano se llama "hidráulica". Buscar `hidrau` los encuentra igual.
- Escribir `zzz`: sale el estado vacío con el botón "Limpiar filtros", y el botón funciona.
- Clic en "Abrir" de ARQ-01: se abre el PDF en pestaña nueva. **Este es el paso crítico
  del `encodeURIComponent`** — si da 404, el nombre de archivo no se está codificando.
- Clic en "Abrir" de EST-01 (el del nombre con doble espacio): también debe abrir.
- Consola sin errores.

- [ ] **Paso 5: Commit**

```bash
git add planos.html js/planos.js css/styles.css
git commit -m "feat: módulo de planos con filtros y buscador

Lista los 17 planos agrupados por especialidad, con chips de filtro
que solo aparecen para las especialidades que tienen lámina, buscador
insensible a acentos y estados vacíos con salida.

Los nombres de archivo pasan por encodeURIComponent: traen espacios y
puntos que de otro modo rompen la URL.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Tarea 5: Visor de PDF a pantalla completa

Convierte el botón "Abrir" en un overlay que muestra el plano sin salir del tablero, con
navegación entre láminas del filtro activo, respaldo para iOS y link compartible.

**Files:**
- Modify: `planos.html` (agregar el markup del overlay antes de los `<script>`)
- Modify: `js/planos.js` (sustituir el stub `abrirPlano` y agregar el bloque del visor)
- Modify: `css/styles.css` (agregar bloque al final)

**Interfaces:**
- Consumes: de la tarea 4 — `estado.visibles`, `urlPlano(plano)`, `render()`, y la clase
  `.abrir` de cada fila con su listener ya conectado a `abrirPlano(indice, ev)`.
- Produces: `abrirPlano(indice, ev)`, `cerrarVisor()`, `navegarVisor(delta)`,
  `pintarVisor()` y `estado.indiceVisor`. Nada posterior depende de ellos.

---

- [ ] **Paso 1: Agregar el markup del overlay a `planos.html`**

Justo antes de `<script src="js/branding.js...">`:

```html
<!-- VISOR DE PLANOS -->
<div class="visor" id="visor" role="dialog" aria-modal="true" aria-labelledby="visor-nombre">
  <div class="visor-barra">
    <div class="visor-titulo">
      <span class="visor-clave" id="visor-clave"></span>
      <span class="visor-nombre" id="visor-nombre"></span>
    </div>
    <span class="visor-contador" id="visor-contador"></span>
    <div class="visor-acciones">
      <button type="button" class="visor-btn" id="visor-prev" aria-label="Plano anterior">‹</button>
      <button type="button" class="visor-btn" id="visor-next" aria-label="Plano siguiente">›</button>
      <a class="visor-btn" id="visor-pestana" href="#" target="_blank" rel="noopener">Abrir en pestaña ↗</a>
      <a class="visor-btn" id="visor-descargar" href="#" download>Descargar ⬇</a>
      <button type="button" class="visor-btn visor-cerrar" id="visor-cerrar" aria-label="Cerrar">✕</button>
    </div>
  </div>
  <div class="visor-cuerpo" id="visor-cuerpo"></div>
</div>
```

- [ ] **Paso 2: Agregar los estilos del visor al final de `css/styles.css`**

```css
/* ============================================================
   MÓDULO 01 · PLANOS — visor a pantalla completa
   ============================================================ */
.visor {
  position: fixed; inset: 0; z-index: 200;
  display: none; flex-direction: column;
  background: rgba(16,20,12,0.97);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
}
.visor.abierto { display: flex; }
body.visor-abierto { overflow: hidden; }

.visor-barra {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.8rem 1.25rem; flex-shrink: 0; flex-wrap: wrap;
  border-bottom: 1px solid rgba(255,255,255,0.12);
  color: #fff;
}
.visor-titulo { min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
.visor-clave {
  font-family: var(--font-mono); font-size: 0.7rem; font-weight: 500;
  color: var(--accent-bright); letter-spacing: 0.08em;
}
.visor-nombre {
  font-family: var(--font-display); font-size: 1rem; font-weight: 500;
  letter-spacing: -0.015em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.visor-contador {
  font-family: var(--font-mono); font-size: 0.78rem;
  color: rgba(255,255,255,0.6); margin-left: auto;
}
.visor-acciones { display: flex; align-items: center; gap: 0.45rem; flex-wrap: wrap; }
.visor-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.3rem;
  font-family: var(--font-body); font-size: 0.78rem; font-weight: 500;
  min-height: 36px; padding: 0 0.85rem; border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.22); background: rgba(255,255,255,0.08);
  color: #fff; text-decoration: none; cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}
.visor-btn:hover { background: rgba(255,255,255,0.2); }
.visor-btn:disabled { opacity: 0.3; cursor: default; }
.visor-btn:disabled:hover { background: rgba(255,255,255,0.08); }
#visor-prev, #visor-next { min-width: 36px; padding: 0; font-size: 1.15rem; line-height: 1; }
.visor-cerrar { border-color: rgba(255,255,255,0.35); }

.visor-cuerpo { flex: 1; min-height: 0; position: relative; }
.visor-cuerpo iframe { width: 100%; height: 100%; border: 0; display: block; background: #fff; }

/* Respaldo cuando el navegador no puede embeber PDF (Safari en iOS) */
.visor-fallback {
  height: 100%; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 1rem;
  padding: 2rem; text-align: center; color: #fff;
}
.visor-fallback .ico { font-size: 2.5rem; }
.visor-fallback h3 { font-family: var(--font-display); font-weight: 500; font-size: 1.15rem; }
.visor-fallback p { font-size: 0.9rem; color: rgba(255,255,255,0.7); max-width: 34ch; }
.visor-fallback .visor-btn {
  min-height: 46px; padding: 0 1.6rem; font-size: 0.92rem;
  background: var(--accent-mid); border-color: var(--accent-mid);
}
.visor-fallback .visor-btn:hover { background: var(--accent-bright); border-color: var(--accent-bright); color: #1c2d0c; }

@media (max-width: 768px) {
  .visor-barra { gap: 0.6rem; padding: 0.7rem 0.9rem; }
  .visor-nombre { font-size: 0.9rem; }
  .visor-contador { order: 3; margin-left: 0; }
  .visor-acciones { order: 4; width: 100%; }
}
```

- [ ] **Paso 3: Sustituir el stub y agregar la lógica del visor en `js/planos.js`**

Borrar por completo estas dos líneas:

```js
/* Stub: la tarea 5 lo sustituye por el visor a pantalla completa.
   Por ahora deja pasar el clic y el navegador abre el PDF en otra pestaña. */
function abrirPlano(_indice, _ev) { /* sin comportamiento propio todavía */ }
```

y poner en su lugar:

```js
/* ------------------------------------------------------------
   Visor a pantalla completa
   ------------------------------------------------------------ */

/* Safari en iOS no hace scroll dentro de un iframe con PDF: muestra
   solo la primera página o una pantalla en blanco. Ahí usamos respaldo. */
function puedeEmbeberPDF() {
  const esIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (esIOS) return false;
  if (navigator.pdfViewerEnabled === false) return false;
  return true;
}

function pintarVisor() {
  const plano = estado.visibles[estado.indiceVisor];
  if (!plano) return;
  const url = urlPlano(plano);

  el('#visor-clave').textContent = plano.clave;
  el('#visor-nombre').textContent = plano.nombre;
  el('#visor-contador').textContent = `${estado.indiceVisor + 1} / ${estado.visibles.length}`;
  el('#visor-pestana').href = url;
  const desc = el('#visor-descargar');
  desc.href = url;
  desc.setAttribute('download', `${plano.clave} ${plano.nombre}.pdf`);

  el('#visor-prev').disabled = estado.indiceVisor === 0;
  el('#visor-next').disabled = estado.indiceVisor === estado.visibles.length - 1;

  const cuerpo = el('#visor-cuerpo');
  cuerpo.innerHTML = puedeEmbeberPDF()
    ? `<iframe src="${url}#view=FitH" title="${plano.clave} · ${plano.nombre}"></iframe>`
    : `<div class="visor-fallback">
         <div class="ico">📄</div>
         <h3>${plano.clave} · ${plano.nombre}</h3>
         <p>Tu navegador no puede mostrar el PDF dentro de la página.</p>
         <a class="visor-btn" href="${url}" target="_blank" rel="noopener">Abrir plano</a>
       </div>`;
}

function abrirPlano(indice, ev) {
  if (ev) ev.preventDefault();
  estado.indiceVisor = indice;
  el('#visor').classList.add('abierto');
  document.body.classList.add('visor-abierto');
  pintarVisor();
  el('#visor-cerrar').focus();

  /* Link compartible + el botón atrás del celular cierra el visor */
  const plano = estado.visibles[indice];
  history.pushState({ visor: true }, '', `?plano=${encodeURIComponent(plano.clave)}`);
}

function cerrarVisor({ volverHistorial = true } = {}) {
  if (!el('#visor').classList.contains('abierto')) return;
  el('#visor').classList.remove('abierto');
  document.body.classList.remove('visor-abierto');
  el('#visor-cuerpo').innerHTML = '';   // detiene la carga del PDF
  estado.indiceVisor = -1;
  if (volverHistorial && history.state && history.state.visor) history.back();
}

function navegarVisor(delta) {
  const siguiente = estado.indiceVisor + delta;
  if (siguiente < 0 || siguiente >= estado.visibles.length) return;
  estado.indiceVisor = siguiente;
  pintarVisor();
  const plano = estado.visibles[siguiente];
  history.replaceState({ visor: true }, '', `?plano=${encodeURIComponent(plano.clave)}`);
}

function conectarVisor() {
  el('#visor-cerrar').addEventListener('click', () => cerrarVisor());
  el('#visor-prev').addEventListener('click', () => navegarVisor(-1));
  el('#visor-next').addEventListener('click', () => navegarVisor(1));

  /* Clic en el fondo (no en la barra ni en el PDF) cierra */
  el('#visor').addEventListener('click', (ev) => {
    if (ev.target === el('#visor') || ev.target === el('#visor-cuerpo')) cerrarVisor();
  });

  document.addEventListener('keydown', (ev) => {
    if (!el('#visor').classList.contains('abierto')) return;
    if (ev.key === 'Escape')     { cerrarVisor(); }
    if (ev.key === 'ArrowLeft')  { navegarVisor(-1); }
    if (ev.key === 'ArrowRight') { navegarVisor(1); }
  });

  /* Botón atrás del navegador */
  window.addEventListener('popstate', () => cerrarVisor({ volverHistorial: false }));
}

/* Abre directo el plano de ?plano=CLAVE, si viene en la URL */
function abrirDesdeURL() {
  const clave = new URLSearchParams(location.search).get('plano');
  if (!clave) return;
  const i = estado.visibles.findIndex(p => p.clave === clave);
  if (i >= 0) abrirPlano(i, null);
}
```

- [ ] **Paso 4: Declarar `indiceVisor` y llamar a las funciones nuevas**

En el objeto `estado`, agregar la propiedad:

```js
  visibles: [],     // planos que pasan filtro + búsqueda, en el orden mostrado
  indiceVisor: -1,  // índice dentro de visibles del plano abierto en el visor
```

Y al final de `init()`, después de `render();`:

```js
  render();
  conectarVisor();
  abrirDesdeURL();
```

- [ ] **Paso 5: Verificar en el navegador (escritorio)**

- Clic en cualquier fila → se abre el overlay a pantalla completa con el PDF visible y
  con scroll dentro del visor nativo.
- La barra muestra la clave, el nombre y el contador "1 / 17".
- `Esc` cierra. El botón ✕ cierra. Clic en el fondo negro cierra.
- Con "Todas" activo, ← y → recorren las 17 láminas en orden.
- En la primera lámina, ‹ sale deshabilitado; en la última, ›.
- **Prueba clave del alcance del filtro:** activar el chip "Acabados" (2 planos), abrir
  ACA-01. El contador debe decir "1 / 2", no "1 / 17", y › debe llevar a ACA-02 y
  deshabilitarse ahí.
- Con el visor abierto, la página de atrás no hace scroll.
- Al abrir un plano la URL cambia a `?plano=ARQ-01`. El botón **atrás** del navegador
  cierra el visor y deja la lista intacta.
- Copiar `planos.html?plano=EST-06`, pegarla en una pestaña nueva: abre directo esa lámina.
- "Abrir en pestaña ↗" y "Descargar ⬇" funcionan con EST-01 (nombre con doble espacio).

- [ ] **Paso 6: Verificar en celular**

Abrir la URL de Live Server desde el teléfono (misma red Wi-Fi):

- **Android/Chrome:** el PDF se embebe y hace zoom con dos dedos.
- **iPhone/Safari:** debe salir la tarjeta de respaldo con el botón grande "Abrir plano",
  **no** una pantalla en blanco. Este es el punto que justifica el fallback.
- El botón atrás del teléfono cierra el visor sin salir del tablero.

- [ ] **Paso 7: Commit**

```bash
git add planos.html js/planos.js css/styles.css
git commit -m "feat: visor de planos a pantalla completa

Overlay con el visor nativo del navegador en iframe, navegación entre
láminas del filtro activo con flechas y teclado, cierre con Esc y
bloqueo del scroll de fondo.

Incluye respaldo para Safari en iOS, que no hace scroll dentro de un
iframe con PDF, y link compartible ?plano=CLAVE que además hace que el
botón atrás del celular cierre el visor en vez de salir del tablero.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Tarea 6: Documentación y publicación

Deja el proyecto entregable: manual para agregar planos sin tocar código, README y
configuración de Vercel.

**Files:**
- Create: `README.md`
- Create: `MANUAL-ACTUALIZACION.md`
- Create: `vercel.json`

**Interfaces:**
- Consumes: la estructura final de archivos de las tareas 1-5.
- Produces: nada que consuma código.

---

- [ ] **Paso 1: Crear `vercel.json`**

```json
{
  "cleanUrls": false,
  "trailingSlash": false,
  "headers": [
    {
      "source": "/data/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }]
    },
    {
      "source": "/(.*)\\.pdf",
      "headers": [{ "key": "Content-Type", "value": "application/pdf" }]
    }
  ]
}
```

El header de `Content-Type` importa: sin él algunos hosts sirven el PDF como descarga y el
iframe del visor sale vacío.

- [ ] **Paso 2: Crear `MANUAL-ACTUALIZACION.md`**

````markdown
# Manual de actualización · Tablero LANDER

Todo el contenido vive en `data/`. **Para actualizar el tablero no se toca código.**

---

## Agregar un plano

1. Copia el PDF a la carpeta `data/planos/`. **No lo renombres.**
2. Abre `data/planos/index.json` y agrega un objeto al arreglo `planos`:

```json
{
  "clave": "IE-01",
  "nombre": "Instalación eléctrica",
  "especialidad": "electrico",
  "archivo": "02.INST. ELECTRICA-CC-MDPL II V.01-IE-01.pdf",
  "revision": "V.01",
  "fecha": "2026-08-20",
  "notas": "Liberado para construcción"
}
```

| Campo | ¿Obligatorio? | Qué es |
|---|---|---|
| `clave` | Sí | La del cuadro de datos del plano (ARQ-01, EST-03…) |
| `nombre` | Sí | El campo CONTENIDO del cuadro de datos |
| `especialidad` | Sí | Un `id` del arreglo `especialidades` de arriba del mismo archivo |
| `archivo` | Sí | Nombre exacto del PDF, con espacios y puntos incluidos |
| `revision` | No | Versión del plano. Si falta, no se muestra la etiqueta |
| `fecha` | No | Formato `AAAA-MM-DD`. Si falta, no se muestra la etiqueta |
| `notas` | No | Texto libre. También se puede buscar por él |

3. Guarda, haz commit y sube. En 1-2 minutos está publicado.

> El chip del filtro aparece solo cuando la especialidad tiene al menos un plano. Al
> subir el primer plano eléctrico, el chip "Eléctrico" aparece solo.

## Sustituir un plano por una revisión nueva

1. Copia el PDF nuevo a `data/planos/`.
2. En `index.json`, cambia el `archivo` de esa clave por el nombre nuevo y actualiza
   `revision` y `fecha`.
3. Borra el PDF viejo si ya no se necesita.

## Agregar una especialidad que no existe

Agrega un objeto al arreglo `especialidades`, en la posición donde quieras que salga el
chip:

```json
{ "id": "voz-datos", "nombre": "Voz y datos" }
```

El `id` va en minúsculas, sin acentos y sin espacios.

## Comprobar que el catálogo quedó bien

Antes de subir, desde la raíz del proyecto:

```bash
node -e "
const fs=require('fs'), c=require('./data/planos/index.json');
const ids=new Set(c.especialidades.map(e=>e.id));
let err=0;
for (const p of c.planos) {
  if (!fs.existsSync('data/planos/'+p.archivo)) { console.log('FALTA ARCHIVO:', p.clave, '->', p.archivo); err++; }
  if (!ids.has(p.especialidad)) { console.log('ESPECIALIDAD DESCONOCIDA:', p.clave, '->', p.especialidad); err++; }
}
const pdfs=fs.readdirSync('data/planos').filter(f=>f.toLowerCase().endsWith('.pdf'));
const usados=new Set(c.planos.map(p=>p.archivo));
pdfs.filter(f=>!usados.has(f)).forEach(f=>{ console.log('PDF SIN CATALOGAR:', f); err++; });
console.log(err ? '=> '+err+' problema(s)' : '=> OK: '+c.planos.length+' planos');
"
```

El error más común es una letra distinta en el nombre del archivo. Este comando lo caza.

## Cambiar datos del proyecto

Edita `data/proyecto.json`. El nombre, la ubicación, el alcance y las fechas se reflejan
en la portada, en el pie y en el título de todas las pestañas a la vez.

Cuando exista el programa de obra definitivo, actualiza `fecha_fin`: de ahí sale el
indicador "Días restantes".
````

- [ ] **Paso 3: Crear `README.md`**

````markdown
# LANDER · Tablero de Control · Amenidades

Tablero de control del paquete de amenidades (Casa Club) del desarrollo **LANDER** en
Hermosillo, Sonora. Desarrollado para Metta Arquitectura y Construcción.

Sitio web **estático** — HTML + CSS + JavaScript vanilla, sin frameworks, sin backend y
sin dependencias de npm. Se actualiza editando archivos de datos y subiendo un commit.

---

## Estructura

```
├── index.html               Portada: hero, indicadores y 4 módulos
├── planos.html              Módulo 01 · Catálogo de planos + visor PDF
│
├── css/styles.css           Sistema de diseño compartido
├── js/
│   ├── branding.js          Identidad desde proyecto.json (todas las páginas)
│   ├── shell.js             Lógica de la portada
│   └── planos.js            Catálogo, filtros, buscador y visor
│
├── data/
│   ├── proyecto.json        Datos base del proyecto
│   ├── planos/              index.json + los PDF
│   └── reportes/index.json  Semanas publicadas (vacío por ahora)
│
├── assets/                  logo-cliente.png · logo-metta.png · hero-cliente.jpg · favicon.png
└── docs/superpowers/        Diseño y plan de implementación
```

## Módulos

| # | Módulo | Estado |
|---|---|---|
| 01 | Planos | Activo — 17 láminas del Casa Club |
| 02 | Presupuesto base interno | Próximamente |
| 03 | Programa de obra | Próximamente |
| 04 | Reportes semanales | Próximamente |

## Verlo en tu computadora

El sitio carga JSON con `fetch()`, que **no funciona** abriendo el HTML con doble clic
(`file://`). Hace falta un servidor local:

1. Abre la carpeta en **Visual Studio Code**.
2. Instala la extensión **Live Server** (Ritwick Dey).
3. Clic derecho en `index.html` → **"Open with Live Server"**.

## Publicar

**GitHub Pages:** Settings → Pages → rama `main`, carpeta `/ (root)`.

**Vercel:** importar el repositorio; se detecta como sitio estático y `vercel.json` hace
el resto. No hay build command.

## Actualizar

Ver **MANUAL-ACTUALIZACION.md**. Todo pasa por `data/` — no se toca código.

## Identidad visual

- **Colores:** verde LANDER `#5A7F26` (texto) y `#8CC63F` (lima del logo, rellenos), gris
  `#63666A` como acento secundario, fondos claros.
- **Tipografía:** Poppins (títulos), Inter (texto), JetBrains Mono (claves y números).

---

Metta Arquitectura y Construcción · Gerencia de Proyecto · Hermosillo, Sonora
````

- [ ] **Paso 4: Probar el manual de verdad**

La única forma de saber si el manual sirve es seguirlo. Agregar un plano ficticio:
copiar cualquier PDF existente como `data/planos/PRUEBA.pdf`, agregarlo a `index.json`
con `"clave": "IE-01", "especialidad": "electrico"`, correr el comando de comprobación
del manual y recargar `planos.html`.

Esperado: aparece el chip **Eléctrico** con contador 1, el contador general dice
"18 planos" y el plano abre en el visor.

Luego **revertir**: borrar `data/planos/PRUEBA.pdf`, quitar su entrada del JSON, volver a
correr la comprobación (debe decir `=> OK: 17 planos`) y confirmar que el chip Eléctrico
desapareció.

- [ ] **Paso 5: Commit**

```bash
git add README.md MANUAL-ACTUALIZACION.md vercel.json
git commit -m "docs: README, manual de actualización y configuración de Vercel

El manual incluye el comando de validación del catálogo, que caza el
error más probable de mantenimiento: un nombre de archivo mal escrito
en index.json.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

- [ ] **Paso 6: Publicar**

```bash
gh repo create tablero-lander-amenidades --private --source=. --remote=origin --push
```

Después, en GitHub: **Settings → Pages → Source: `main` / `root`**. Esperar 1-2 minutos y
abrir `https://<usuario>.github.io/tablero-lander-amenidades/`.

Luego en Vercel: **Add New → Project → Import** el mismo repositorio. Framework Preset:
*Other*. Sin build command, output directory `.`.

**Verificar en ambas URLs publicadas** (no solo en local):

- La portada carga y "Días restantes" muestra número.
- `planos.html` lista los 17 planos.
- **Un plano con espacios en el nombre abre en el visor.** Es el punto donde GitHub Pages
  y Vercel se comportan distinto que Live Server.

---

## Insumos que faltan (no bloquean)

Sustituirlos después no requiere tocar código:

| Archivo | Mientras no exista |
|---|---|
| `assets/logo-cliente.png` | La topbar muestra el texto "LANDER" |
| `assets/logo-metta.png` | No se muestra nada en su lugar |
| `assets/hero-cliente.jpg` | El hero sale con degradado verde sólido |
| `assets/favicon.png` | La pestaña usa el ícono por defecto del navegador |
