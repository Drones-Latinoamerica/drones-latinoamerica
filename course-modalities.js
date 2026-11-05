(() => {
  const catalog = Object.freeze({
    recorded: Object.freeze({name: 'Curso grabado', price: 299, hours: 0}),
    zoom: Object.freeze({name: 'Curso personalizado por Zoom', price: 999, hours: 8}),
  });
  const getMode = value => catalog[value === 'zoom' ? 'zoom' : 'recorded'];
  window.AssembleCourse = Object.freeze({catalog, getMode});
  const flightCatalog = Object.freeze({
    recorded: Object.freeze({name: 'Curso grabado', price: 399, hours: 0}),
    instructor: Object.freeze({name: 'Entrenamiento con instructor', price: 999, hours: 8}),
  });
  window.FlightCourse = Object.freeze({catalog:flightCatalog, getMode:value=>flightCatalog[value === 'instructor' ? 'instructor' : 'recorded']});
  const stage = document.body.dataset.stage;
  if (stage !== 'assemble' && stage !== 'fly') return;
  const isFly = stage === 'fly';
  const modes = isFly ? flightCatalog : catalog;
  const premiumKey = isFly ? 'instructor' : 'zoom';
  const premium = modes[premiumKey];
  const offer = document.querySelector('.stage-offer');
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'course-modalities';
  const video = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 5h26v19H3V5ZM1 28h30M13 10l8 5-8 5V10Z"/></svg>';
  const call = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 5h26v22H3V5Zm12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM7 25v-2a8 8 0 0 1 16 0v2M25 11l4-2v9l-4-2"/></svg>';
  fieldset.innerHTML = `<legend>Elige tu modalidad de curso</legend>
    <label class="course-mode-card"><input type="radio" name="course-mode" value="recorded" checked><span class="course-mode-icon">${video}</span><span class="course-mode-copy"><strong>Curso grabado</strong><span>${isFly ? 'Aprende a tu propio ritmo con lecciones en video, guías y ejercicios de simulador.' : 'Aprende a tu propio ritmo con lecciones en video, guías y recursos descargables.'}</span></span><b class="course-mode-price" data-i18n-skip>USD $${modes.recorded.price}</b></label>
    <label class="course-mode-card is-zoom"><input type="radio" name="course-mode" value="${premiumKey}"><span class="course-mode-icon">${call}</span><span class="course-mode-copy"><strong>${premium.name}</strong><span class="course-mode-hours"><b>${isFly ? '8 horas de entrenamiento.' : '8 horas de clases privadas.'}</b><b>4 sesiones de 2 horas.</b></span><span>${isFly ? 'Clases personalizadas por Zoom o presenciales, según ubicación y disponibilidad del instructor.' : 'Acompañamiento individual con un instructor.'}</span><span>Incluye acceso al curso grabado.</span></span><span class="course-mode-cost"><small>Más completo</small><b class="course-mode-price" data-i18n-skip>USD $${premium.price}</b>${isFly ? '<small class="course-mode-reference">Precio de referencia</small>' : ''}</span></label>`;
  offer.querySelector('.build-stage-price').remove();
  offer.prepend(fieldset);
  const note = document.createElement('p');
  note.className = 'course-mode-note';
  note.innerHTML = isFly
    ? '<span aria-hidden="true">ⓘ</span><span><strong>Entrenamiento presencial con instructor</strong><br><span>Prácticas de vuelo supervisadas, maniobras, despegues, aterrizajes y seguridad operacional. Disponibilidad y precio sujetos al país, ciudad y presencia de un instructor local.</span><br><span>USD $999 es un precio de referencia. Ventas confirmará el precio final y la disponibilidad del entrenamiento presencial según tu ubicación.</span></span>'
    : '<span aria-hidden="true">ⓘ</span><span>El curso no incluye el kit del dron. Puedes adquirir el Kit de Dron (10 pulgadas) por separado.</span>';
  fieldset.after(note);
  const update = () => {
    const selected = fieldset.querySelector('input:checked').value;
    const params = new URLSearchParams({contacto:'ventas', producto:stage, modalidad:selected});
    offer.querySelector('[data-stage-sales]').href = `/cotizacion.html?${params}`;
  };
  fieldset.querySelectorAll('input').forEach(input=>input.addEventListener('change',update));
  update();
})();
