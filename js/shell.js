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
  hoy.setHours(0, 0, 0, 0);                          // medianoche local, igual que "fin"
  const fin = new Date(p.fecha_fin + 'T00:00:00');   // medianoche
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
