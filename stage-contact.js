(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('contacto') !== 'ventas') return;
  const courseMode = params.get('producto') === 'assemble' && window.AssembleCourse
    ? window.AssembleCourse.getMode(params.get('modalidad'))
    : params.get('producto') === 'fly' && window.FlightCourse
      ? window.FlightCourse.getMode(params.get('modalidad')) : null;
  const flightTraining = params.get('producto') === 'fly' && courseMode?.hours > 0;
  const products = {
    kit: 'Kit de Dron 10 pulgadas — USD $599 desde',
    assemble: courseMode ? `Ensambla y Configura — USD $${courseMode.price}` : 'Ensambla y Configura — USD $299',
    fly: courseMode ? `Vuela y Domina — USD $${courseMode.price}` : 'Vuela y Domina — USD $399',
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
    const fields = [['Modalidad del curso',courseMode.name],[flightTraining ? 'Precio de referencia en USD' : 'Precio en USD',String(courseMode.price)],[flightTraining ? 'Horas de entrenamiento' : 'Horas de clases privadas',String(courseMode.hours)]];
    if (courseMode.hours) fields.push(['Sesiones privadas','4 sesiones de 2 horas'],['Curso grabado','Incluido']);
    fields.forEach(([name,value])=>{
      const field = document.createElement('input');
      field.type = 'hidden'; field.name = name; field.value = value;
      form.append(field);
    });
    const summary = document.createElement('div');
    summary.className = 'kit-selection-summary';
    summary.innerHTML = `<p><strong>Modalidad del curso:</strong> <span>${courseMode.name}</span></p><p><strong>${flightTraining ? 'Precio de referencia:' : 'Precio:'}</strong> <b data-i18n-skip>USD $${courseMode.price}</b></p>${courseMode.hours ? `<p>${flightTraining ? '8 horas de entrenamiento.' : '8 horas de clases privadas.'}</p><p>4 sesiones de 2 horas.</p><p>Incluye acceso al curso grabado.</p>` : ''}`;
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
  if (flightTraining) {
    form.querySelector('[name="País"]').required = true;
    const cityLabel = document.createElement('label');
    cityLabel.className = 'form-field';
    cityLabel.innerHTML = '<span>Ciudad *</span><input type="text" name="Ciudad" required autocomplete="address-level2" placeholder="Tu ciudad">';
    form.querySelector('.form-grid').append(cityLabel);
    const preference = form.querySelector('[name="Modalidad"]');
    preference.disabled = false;
    preference.required = true;
    preference.closest('label').hidden = false;
    preference.innerHTML = '<option value="">Selecciona una opción</option><option value="Zoom">Zoom</option><option value="Presencial">Presencial</option>';
    const status = document.createElement('input');
    status.type = 'hidden'; status.name = 'Confirmación del entrenamiento';
    form.append(status);
    const notice = document.createElement('div');
    notice.className = 'kit-selection-summary form-field-full';
    notice.innerHTML = '<p>USD $999 es un precio de referencia. Ventas confirmará el precio final y la disponibilidad del entrenamiento presencial según tu ubicación.</p><p data-in-person-warning hidden>Entrenamiento presencial: disponibilidad y precio pendientes de confirmación por Ventas según país, ciudad e instructor local.</p>';
    preference.closest('label').after(notice);
    const updatePreference = () => {
      const inPerson = preference.value === 'Presencial';
      notice.querySelector('[data-in-person-warning]').hidden = !inPerson;
      status.value = inPerson ? 'Presencial: disponibilidad y precio pendientes de confirmación por Ventas según país, ciudad e instructor local.' : 'Precio personalizado de referencia: USD $999. Preferencia y programación por confirmar con Ventas.';
    };
    preference.addEventListener('change', updatePreference);
    updatePreference();
  }
  form.querySelector('textarea').placeholder = 'Escribe tu consulta sobre este producto...';
  form.querySelector('button[type="submit"]').textContent = 'Enviar consulta a Ventas';
  form.querySelector('.form-note').textContent = 'Tu consulta se envía a nuestro equipo comercial.';
})();
