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
