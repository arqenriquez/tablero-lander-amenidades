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
