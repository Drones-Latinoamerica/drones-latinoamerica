(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('contacto') !== 'ventas') return;
  const courseMode = params.get('producto') === 'assemble' && window.AssembleCourse
    ? window.AssembleCourse.getMode(params.get('modalidad')) : null;
  const products = {
    kit: 'Kit de Dron 10 pulgadas — USD $599 desde',
    assemble: courseMode ? `Ensambla y Configura — USD $${courseMode.price}` : 'Ensambla y Configura — USD $299',
    fly: 'Vuela y Domina — USD $399',
  };
  const product = products[params.get('producto')];
  if (!product) return;
  const quantity = Math.max(1,Math.min(99,Math.floor(Number(params.get('cantidad')) || 1)));
  document.title = 'Contactar Departamento de Ventas | Drones Latinoamérica';
  document.querySelector('.form-intro .section-kicker').textContent = 'Construye, Configura y Vuela';
  document.querySelector('.form-intro h1').textContent = 'Contactar Departamento de Ventas';
  const intro = document.querySelector('.form-intro > p:last-child');
  intro.className = 'stage-contact-selection';
  intro.textContent = product;
  document.querySelector('.breadcrumb strong').textContent = 'Departamento de Ventas';
  const form = document.querySelector('.site-form');
  form.querySelector('[name="_subject"]').value = `Consulta comercial | ${product}`;
  const selected = form.querySelector('[name="Curso o servicio de interés"]');
  selected.value = product;
  selected.readOnly = true;
  const quantityField = form.querySelector('[name="Número de participantes"]');
  quantityField.name = 'Cantidad';
  quantityField.value = quantity;
  quantityField.readOnly = true;
  quantityField.closest('label').querySelector('span').textContent = 'Cantidad';
  if (courseMode) {
    const fields = [['Modalidad del curso',courseMode.name],['Precio en USD',String(courseMode.price)],['Horas de clases privadas',String(courseMode.hours)]];
    if (courseMode.hours) fields.push(['Sesiones privadas','4 sesiones de 2 horas'],['Curso grabado','Incluido']);
    fields.forEach(([name,value])=>{
      const field = document.createElement('input');
      field.type = 'hidden'; field.name = name; field.value = value;
      form.append(field);
    });
    const summary = document.createElement('div');
    summary.className = 'kit-selection-summary';
    summary.innerHTML = `<p><strong>Modalidad del curso:</strong> <span>${courseMode.name}</span></p><p><strong>Precio:</strong> <b data-i18n-skip>USD $${courseMode.price}</b></p>${courseMode.hours ? '<p>8 horas de clases privadas.</p><p>4 sesiones de 2 horas.</p><p>Incluye acceso al curso grabado.</p>' : ''}`;
    intro.after(summary);
  }
  if (params.get('producto') === 'kit' && window.KitOptions) {
    // Recalcular con el catálogo local; no confiar en importes del enlace.
    const selection = window.KitOptions.calculate({goggles:params.get('gafas') === '1', radio:params.get('radio') === '1', quantity});
    const catalog = window.KitOptions.catalog;
    const fields = [
      ['Gafas FPV',selection.goggles ? `Sí — ${catalog.goggles.name}` : 'No'],
      ['Radiocontrol',selection.radio ? `Sí — ${catalog.radio.name}` : 'No'],
      ['Subtotal del producto en USD',String(selection.total)],
      ['Envío','Pendiente de cotización'],
      ['Moneda e importes','USD. No incluye envío ni impuestos.'],
    ];
    fields.forEach(([name,value])=>{
      const field = document.createElement('input');
      field.type = 'hidden'; field.name = name; field.value = value;
      form.append(field);
    });
    const summary = document.createElement('div');
    summary.className = 'kit-selection-summary';
    summary.innerHTML = `<p><strong>Gafas FPV:</strong> <span>${selection.goggles ? 'Sí' : 'No'}</span>${selection.goggles ? ` — ${catalog.goggles.name}` : ''}</p><p><strong>Radiocontrol:</strong> <span>${selection.radio ? 'Sí' : 'No'}</span>${selection.radio ? ` — ${catalog.radio.name}` : ''}</p><p><strong>Cantidad:</strong> <span>${selection.quantity}</span></p><p><strong>Subtotal del producto:</strong> <b data-i18n-skip>${window.KitOptions.usd(selection.total)}</b></p><p><strong>Envío:</strong> <span>Pendiente de cotización</span></p><p>Precios en USD. No incluyen envío ni impuestos.</p>`;
    intro.after(summary);
  }
  if (params.get('producto') !== 'kit') { quantityField.closest('label').hidden = true; }
  ['Comunidad / Grupo / Compañía','Modalidad'].forEach(name => {
    const field = form.querySelector(`[name="${name}"]`);
    field.disabled = true;
    field.closest('label').hidden = true;
  });
  form.querySelector('textarea').placeholder = 'Escribe tu consulta sobre este producto...';
  form.querySelector('button[type="submit"]').textContent = 'Enviar consulta a Ventas';
  form.querySelector('.form-note').textContent = 'Tu consulta se envía a nuestro equipo comercial.';
})();
