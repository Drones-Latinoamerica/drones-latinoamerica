(() => {
  // Precios comerciales estimados del sitio, editables en un solo lugar.
  // SKY04X Pro reemplaza a DJI Goggles 2 para el sistema analógico documentado.
  const catalog = Object.freeze({
    base: 719,
    goggles: Object.freeze({
      name: 'Skyzone SKY04X Pro', price: 779,
      image: '/assets/kit-sky04x-pro.jpg', label: 'Gafas FPV',
      features: ['Pantallas OLED 1920 × 1080.', 'Receptor Steadyview de 5.8 GHz y 48 canales.', 'Grabación DVR y ajuste de enfoque.'],
      compatibility: 'Para video analógico de 5.8 GHz. Ventas debe confirmar el transmisor de video y el canal del kit. DJI Goggles 2 no admite video analógico.',
      source: 'https://www.skyzonefpv.com/products/sky04x-pro',
    }),
    radio: Object.freeze({
      name: 'RadioMaster TX16S MKII — ELRS', price: 359,
      image: '/assets/amazon-radiomaster-tx16s.jpg', label: 'Radiocontrol',
      features: ['Módulo interno ExpressLRS de 2.4 GHz.', 'Firmware EdgeTX y pantalla táctil de 4.3 pulgadas.', 'Gimbals con sensores Hall.'],
      compatibility: 'Requiere un receptor ExpressLRS de 2.4 GHz compatible y enlazado. El receptor del kit no está especificado; Ventas debe confirmar su compatibilidad. Fotografía de referencia de la familia TX16S.',
      source: 'https://radiomasterrc.com/collections/tx16s/products/tx16s-mark-ii-radio-controller',
    }),
  });
  const usd = value => `USD $${Number(value).toLocaleString('en-US', {maximumFractionDigits: 0})}`;
  const calculate = ({goggles = false, radio = false, quantity = 1} = {}) => {
    const count = Math.max(1, Math.min(99, Math.floor(Number(quantity) || 1)));
    const subtotal = catalog.base + (goggles ? catalog.goggles.price : 0) + (radio ? catalog.radio.price : 0);
    return {quantity: count, subtotal, total: subtotal * count, goggles: Boolean(goggles), radio: Boolean(radio)};
  };
  window.KitOptions = Object.freeze({catalog, calculate, usd});
  if (document.body.dataset.stage !== 'kit') return;
  const panel = document.querySelector('.stage-offer');
  const price = panel.querySelector('.build-stage-price');
  const config = document.createElement('div');
  config.className = 'kit-configuration';
  config.innerHTML = `<h2>Configura tu kit</h2><div class="kit-base"><strong>Kit de Dron (10 pulgadas)</strong><b data-i18n-skip>${usd(catalog.base)}</b></div><div class="kit-accessories">${['goggles','radio'].map(key => {
    const item = catalog[key];
    return `<div class="kit-accessory"><label for="kit-${key}"><input id="kit-${key}" type="checkbox" data-kit-option="${key}"><img src="${item.image}" alt="${item.name}" width="64" height="64"><span><strong>${item.label}</strong><small>${item.name}</small></span></label><button type="button" class="kit-info" data-kit-info="${key}" aria-label="${key === 'goggles' ? 'Información de las gafas FPV' : 'Información del radiocontrol'}" aria-haspopup="dialog">ⓘ</button><b class="kit-extra" data-i18n-skip>+ ${usd(item.price)}</b></div>`;
  }).join('')}</div>`;
  panel.insertBefore(config, price);
  price.className = 'kit-total';
  price.innerHTML = '<strong>Total del producto:</strong><output data-kit-total data-i18n-skip aria-live="polite" aria-atomic="true"></output>';
  const shipping = document.createElement('div');
  shipping.className = 'kit-shipping-notice';
  shipping.innerHTML = '<span class="kit-shipping-icon" aria-hidden="true">ⓘ</span><div><strong>Envío no incluido</strong><p>El costo de envío varía según el país y la dirección de destino. Nuestro Departamento de Ventas confirmará el importe final antes de la compra.</p></div>';
  price.after(shipping);
  const note = document.createElement('p');
  note.className = 'kit-estimate';
  note.textContent = 'Precios en USD. No incluyen envío ni impuestos. Ventas confirmará los accesorios y su compatibilidad.';
  shipping.after(note);
  const quantity = panel.querySelector('#kit-quantity');
  const update = () => {
    const selection = calculate({goggles: panel.querySelector('#kit-goggles').checked, radio: panel.querySelector('#kit-radio').checked, quantity: quantity.value});
    quantity.value = selection.quantity;
    panel.querySelector('[data-kit-total]').textContent = usd(selection.total);
    const params = new URLSearchParams({contacto:'ventas', producto:'kit', cantidad:String(selection.quantity), gafas:selection.goggles ? '1':'0', radio:selection.radio ? '1':'0'});
    panel.querySelector('[data-stage-sales]').href = `/cotizacion.html?${params}`;
  };
  panel.querySelectorAll('[data-kit-option]').forEach(input => input.addEventListener('change',update));
  quantity.addEventListener('input',update);
  quantity.addEventListener('change',update);
  panel.querySelectorAll('[data-quantity-step]').forEach(button => button.addEventListener('click',update));
  ['goggles','radio'].forEach(key => {
    const item = catalog[key];
    const dialog = document.createElement('dialog');
    dialog.className = 'kit-accessory-dialog';
    dialog.setAttribute('aria-labelledby',`kit-info-title-${key}`);
    dialog.innerHTML = `<button type="button" class="kit-dialog-close" aria-label="Cerrar">×</button><img src="${item.image}" alt="${item.name}" width="220" height="180"><h2 id="kit-info-title-${key}">${item.name}</h2><ul>${item.features.map(text=>`<li>${text}</li>`).join('')}</ul><h3>Compatibilidad con el kit</h3><p>${item.compatibility}</p><p><strong>Precio adicional estimado:</strong> <span data-i18n-skip>${usd(item.price)}</span></p>`;
    document.body.append(dialog);
    panel.querySelector(`[data-kit-info="${key}"]`).addEventListener('click',()=>dialog.showModal());
    dialog.querySelector('button').addEventListener('click',()=>dialog.close());
    dialog.addEventListener('click',event=>{if(event.target === dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();}});
  });
  update();
})();
