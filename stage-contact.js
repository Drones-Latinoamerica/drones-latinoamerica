(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('contacto') !== 'ventas') return;
  const products = {
    kit: 'Kit de Dron 10 pulgadas — USD $599 desde',
    assemble: 'Ensambla y Configura — USD $299',
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
  if (params.get('producto') === 'kit' && window.KitOptions) {
    // Recalcular con el catálogo local; no confiar en importes del enlace.
    const selection = window.KitOptions.calculate({goggles:params.get('gafas') === '1', radio:params.get('radio') === '1', quantity});
    const catalog = window.KitOptions.catalog;
    const fields = [
      ['Gafas FPV',selection.goggles ? `Sí — ${catalog.goggles.name}` : 'No'],
      ['Radiocontrol',selection.radio ? `Sí — ${catalog.radio.name}` : 'No'],
      ['Precio total estimado en USD',String(selection.total)],
    ];
    fields.forEach(([name,value])=>{
      const field = document.createElement('input');
      field.type = 'hidden'; field.name = name; field.value = value;
      form.append(field);
    });
    const summary = document.createElement('div');
    summary.className = 'kit-selection-summary';
    summary.innerHTML = `<p><strong>Gafas FPV:</strong> <span>${selection.goggles ? 'Sí' : 'No'}</span>${selection.goggles ? ` — ${catalog.goggles.name}` : ''}</p><p><strong>Radiocontrol:</strong> <span>${selection.radio ? 'Sí' : 'No'}</span>${selection.radio ? ` — ${catalog.radio.name}` : ''}</p><p><strong>Cantidad:</strong> <span>${selection.quantity}</span></p><p><strong>Total estimado:</strong> <b data-i18n-skip>${window.KitOptions.usd(selection.total)}</b></p>`;
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
