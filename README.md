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
