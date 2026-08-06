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
  indiceVisor: -1,  // índice dentro de visibles del plano abierto en el visor
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
  conectarVisor();
  abrirDesdeURL();
}

document.addEventListener('DOMContentLoaded', init);
