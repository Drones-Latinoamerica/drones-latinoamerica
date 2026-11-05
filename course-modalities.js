(() => {
  const catalog = Object.freeze({
    recorded: Object.freeze({name: 'Curso grabado', price: 299, hours: 0}),
    zoom: Object.freeze({name: 'Curso personalizado por Zoom', price: 999, hours: 8}),
  });
  const getMode = value => catalog[value === 'zoom' ? 'zoom' : 'recorded'];
  window.AssembleCourse = Object.freeze({catalog, getMode});
  if (document.body.dataset.stage !== 'assemble') return;
  const offer = document.querySelector('.stage-offer');
  const fieldset = document.createElement('fieldset');
  fieldset.className = 'course-modalities';
  const video = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 5h26v19H3V5ZM1 28h30M13 10l8 5-8 5V10Z"/></svg>';
  const call = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 5h26v22H3V5Zm12 3a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM7 25v-2a8 8 0 0 1 16 0v2M25 11l4-2v9l-4-2"/></svg>';
  fieldset.innerHTML = `<legend>Elige tu modalidad de curso</legend>
    <label class="course-mode-card"><input type="radio" name="course-mode" value="recorded" checked><span class="course-mode-icon">${video}</span><span class="course-mode-copy"><strong>Curso grabado</strong><span>Aprende a tu propio ritmo con lecciones en video, guías y recursos descargables.</span></span><b class="course-mode-price" data-i18n-skip>USD $299</b></label>
    <label class="course-mode-card is-zoom"><input type="radio" name="course-mode" value="zoom"><span class="course-mode-icon">${call}</span><span class="course-mode-copy"><strong>Curso personalizado por Zoom</strong><span class="course-mode-hours"><b>8 horas de clases privadas.</b><b>4 sesiones de 2 horas.</b></span><span>Acompañamiento individual con un instructor.</span><span>Incluye acceso al curso grabado.</span></span><span class="course-mode-cost"><small>Más completo</small><b class="course-mode-price" data-i18n-skip>USD $999</b></span></label>`;
  offer.querySelector('.build-stage-price').remove();
  offer.prepend(fieldset);
  const note = document.createElement('p');
  note.className = 'course-mode-note';
  note.innerHTML = '<span aria-hidden="true">ⓘ</span><span>El curso no incluye el kit del dron. Puedes adquirir el Kit de Dron (10 pulgadas) por separado.</span>';
  fieldset.after(note);
  const update = () => {
    const selected = fieldset.querySelector('input:checked').value;
    const params = new URLSearchParams({contacto:'ventas', producto:'assemble', modalidad:selected});
    offer.querySelector('[data-stage-sales]').href = `/cotizacion.html?${params}`;
  };
  fieldset.querySelectorAll('input').forEach(input=>input.addEventListener('change',update));
  update();
})();
