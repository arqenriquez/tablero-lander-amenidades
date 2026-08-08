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

---

## Actualizar el programa de obra

1. En MS Project: **Archivo → Guardar como → XML**.
2. Reemplaza `data/programa-lander.xml` con el archivo nuevo. **No cambies el nombre** —
   `js/gantt.js` lo busca con esa ruta exacta.
3. Commit y push.

### Revisarlo antes de publicar

Abre `programa.html` y **arrastra el XML nuevo sobre la página**. Se dibuja en tu
navegador sin tocar el repositorio, así confirmas que el export salió bien antes de
subirlo. También sirve el botón "Seleccionar archivo XML".

### Qué lee el Gantt de cada tarea

| Campo de MS Project | Para qué |
|---|---|
| `Name` | Nombre de la tarea |
| `OutlineLevel` | Nivel de jerarquía y sangría |
| `Summary` | Marca las filas de resumen (barra oscura) |
| `Milestone` | Dibuja el rombo del hito |
| `Critical` | Contorno rojo de ruta crítica |
| `Start` / `Finish` | Posición y ancho de la barra |
| `Duration` | Columna "Duración" |
| `PercentComplete` | Relleno de avance dentro de la barra |
| `StartDate` / `FinishDate` del proyecto | Rango del calendario |
| `StatusDate` del proyecto | Posición inicial de la línea de corte |

Si el proyecto no trae `StatusDate`, la fecha de corte arranca en hoy. La línea vertical
solo se dibuja cuando esa fecha cae dentro del rango del programa.

### Colores de las barras

Se calculan comparando el avance real contra el esperado a la fecha de corte:

- **Verde** — completada al 100 %
- **Verde claro** — en proceso y al corriente
- **Rojo** — atrasada (venció, o va más de 10 % por debajo de lo esperado)
- **Naranja** — debió iniciar y sigue en 0 %
- **Gris/verde claro** — aún no inicia
