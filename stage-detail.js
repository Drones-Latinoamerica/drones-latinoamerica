(() => {
  const stage = document.body.dataset.stage;
  if (!stage) return;
  const data = {
    kit: {
      title: 'Kit de Dron (10 pulgadas)', price: 'USD $599', image: '/assets/build-stage-kit.jpg',
      alt: 'Caja de Drones Latinoamérica junto a componentes de un dron FPV de 10 pulgadas sin ensamblar',
      description: 'Recibe en tu domicilio un kit con los componentes necesarios para armar tu propio dron FPV de 10 pulgadas.',
      checks: ['Componentes principales del dron', 'Lista de piezas incluida', 'Envíos internacionales disponibles (costo adicional)'],
      modules: [['layers','Estructura de 10 pulgadas'],['motor','Cuatro motores'],['chip','Controladora de vuelo + ESC'],['camera','Cámara FPV analógica'],['propeller','Hélices'],['battery','Batería'],['settings','Tornillos y accesorios']],
      product: 'Kit de Dron 10 pulgadas — USD $599 desde',
    },
    assemble: {
      title: 'Ensambla y Configura', price: 'USD $299', image: '/assets/build-stage-configure.jpg', badge: 'ETAPA 2',
      alt: 'Manos ensamblando un dron FPV junto a una computadora con software de configuración',
      description: 'Monta tu dron paso a paso y aprende a configurar su controlador de vuelo con Betaflight o INAV.',
      learning: ['Ensambla tu dron FPV de 10 pulgadas.', 'Conecta y configura la controladora de vuelo.', 'Configura Betaflight o INAV.', 'Realiza pruebas y deja tu dron listo para volar.'],
      features: [['video','Guía en video'],['settings','Betaflight / INAV'],['check','Pruebas del sistema']],
      modules: [['settings','Preparación y herramientas'],['layers','Ensamble del dron'],['settings','Conexiones y cableado'],['settings','Configuración en Betaflight'],['controller','Configuración en INAV'],['check','Pruebas y calibración']],
      product: 'Ensambla y Configura — USD $299',
    },
    fly: {
      title: 'Vuela y Domina', price: 'USD $399', image: '/assets/build-stage-fly.jpg', badge: 'ETAPA 3',
      alt: 'Piloto con gafas FPV y radiocontrol practicando el vuelo de un dron en un campo abierto',
      description: 'Aprende a volar de forma segura, mejora tu técnica y domina maniobras avanzadas con tu dron FPV.',
      learning: ['Configurar tu dron para vuelo real (Betaflight o INAV).', 'Realizar despegues y aterrizajes seguros.', 'Mejorar el control, precisión y estabilidad del vuelo.', 'Ejecutar maniobras avanzadas (giros, flips, rolls, dives).', 'Aplicar buenas prácticas y normativa de seguridad.'],
      features: [['video','Guía en video'],['controller','Simulador de vuelo'],['chart','Prácticas avanzadas']],
      checks: ['Técnicas de vuelo paso a paso', 'Seguridad y buenas prácticas', 'Maniobras intermedias y avanzadas', 'Preparación para vuelo real (FPV / Manual)'],
      modules: [['video','Simulador de vuelo'],['settings','Configuración y ajustes del dron'],['controller','Despegue y aterrizaje'],['shield','Seguridad y normativa'],['chart','Maniobras intermedias y avanzadas'],['check','Prácticas de vuelo real (FPV)']],
      product: 'Vuela y Domina — USD $399',
    },
  }[stage];
  if (!data) return;
  const icon = (name) => {
    const span = document.createElement('span');
    span.className = 'stage-icon';
    const shapes = {
      motor: 'M6 9h12v9H6V9Zm6-7v7M4 12H2m20 0h-2M8 21h8',
      chip: 'M6 6h12v12H6V6Zm3 3h6v6H9V9ZM9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m12 0h4M2 15h4m12 0h4',
      camera: 'M3 7h5l2-3h4l2 3h5v13H3V7Zm9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
      battery: 'M2 6h18v12H2V6Zm18 4h2v4h-2M12 8l-4 5h5l-3 4',
      propeller: 'M12 12C1 11 1 5 5 4c4-1 6 4 7 8Zm0 0c11 1 11 7 7 8-4 1-6-4-7-8Zm0-2v4',
      chat: 'M21 11a9 9 0 0 1-9 9 11 11 0 0 1-4-1l-6 3 2-6a9 9 0 1 1 17-5ZM7 11h.01M12 11h.01M17 11h.01',
    };
    const svg = createBuildJourneyIcon(name);
    if (shapes[name]) svg.querySelector('path').setAttribute('d', shapes[name]);
    span.append(svg);
    return span.outerHTML;
  };
  const list = (items) => `<ul class="stage-checks">${items.map(text => `<li>${text}</li>`).join('')}</ul>`;
  const features = (items) => `<div class="stage-feature-row">${items.map(([name,text]) => `<div>${icon(name)}<span>${text}</span></div>`).join('')}</div>`;
  const payments = () => `<div class="stage-payments"><strong>Métodos de pago:</strong><span class="stage-bitcoin"><b aria-hidden="true">₿</b> Bitcoin</span><span class="stage-stripe" aria-disabled="true"><b>stripe</b><small>(Próximamente)</small></span></div>`;
  const offer = () => `<aside class="stage-offer" aria-label="Información comercial"><div class="build-stage-price">${stage === 'kit' ? '<span>Desde</span>' : ''}<strong>${data.price}</strong></div>${stage === 'kit' ? `<div class="stage-quantity"><label for="kit-quantity">Cantidad</label><div class="stage-quantity-controls"><button type="button" data-quantity-step="-1" aria-label="Reducir cantidad">−</button><input id="kit-quantity" type="number" value="1" min="1" max="99" step="1" inputmode="numeric"><button type="button" data-quantity-step="1" aria-label="Aumentar cantidad">+</button></div></div>` : ''}${payments()}<a class="btn btn-primary stage-sales" data-stage-sales href="/cotizacion.html?contacto=ventas&producto=${stage}">${icon('chat')}<span>Contactar Departamento de Ventas</span></a></aside>`;
  const gallery = stage === 'kit' ? `<div class="stage-gallery" role="group" aria-label="Galería del kit">${['Kit completo','Detalle de componentes','Estructura y hélices'].map((name,index) => `<button type="button" data-gallery-view="${index}" aria-pressed="${index === 0}"><div class="stage-thumb"><img src="${data.image}" alt="${name}" style="object-position:${index === 0 ? 'center' : index === 1 ? 'right bottom' : 'right center'}"></div><span>${name}</span></button>`).join('')}</div>` : '';
  document.querySelector('[data-stage-content]').innerHTML = `
    <nav class="breadcrumb" aria-label="Ruta de navegación"><a href="/index.html#inicio">Inicio</a><span aria-hidden="true">›</span><a href="/index.html#${stage === 'kit' ? 'construye-configura-vuela' : 'cursos'}">${stage === 'kit' ? 'Kits de Drones' : 'Cursos'}</a><span aria-hidden="true">›</span><strong>${data.title}</strong></nav>
    <div class="stage-layout${stage === 'kit' ? ' is-kit' : ''}">
      <div><div class="stage-photo" data-stage-photo><img src="${data.image}" alt="${data.alt}" width="1200" height="675">${data.badge ? `<span class="build-stage-label">${data.badge}</span>` : ''}</div>${gallery}${data.learning ? `<section class="stage-learning"><h2>¿Qué aprenderás?</h2>${list(data.learning)}</section>` : ''}</div>
      <section class="stage-summary" aria-labelledby="stage-title">${stage === 'kit' ? '<span class="stage-kit-label">KIT COMPLETO</span>' : ''}<h1 id="stage-title">${data.title}</h1><p>${data.description}</p>${data.checks ? list(data.checks) : ''}${data.features ? features(data.features) : ''}${stage === 'kit' ? `<p class="stage-kit-note">${icon('book')}<span>El curso Ensambla y Configura se vende por separado.</span></p>` : offer()}</section>
      ${stage === 'kit' ? offer() : ''}
    </div>
    <section class="stage-curriculum"><h2>${stage === 'kit' ? '¿Qué incluye el kit?' : 'Contenido del curso'}</h2><div class="stage-module-grid${stage === 'kit' ? ' is-included' : ''}">${data.modules.map(([name,text],i) => `<article class="stage-module">${icon(name)}<strong>${stage === 'kit' ? '' : `${i+1}. `}<span>${text}</span></strong></article>`).join('')}</div></section>`;
  const quantity = document.querySelector('#kit-quantity');
  const updateSales = () => {
    const count = quantity ? Math.max(1, Math.min(99, Math.floor(Number(quantity.value) || 1))) : 1;
    if (quantity) quantity.value = count;
    const params = new URLSearchParams({contacto:'ventas',producto:stage,cantidad:String(count)});
    document.querySelector('[data-stage-sales]').href = `/cotizacion.html?${params}`;
  };
  quantity?.addEventListener('change', updateSales);
  document.querySelectorAll('[data-quantity-step]').forEach(button => button.addEventListener('click', () => {
    quantity.value = Number(quantity.value || 1) + Number(button.dataset.quantityStep);
    updateSales();
  }));
  document.querySelectorAll('[data-gallery-view]').forEach(button => button.addEventListener('click', () => {
    const view = Number(button.dataset.galleryView);
    document.querySelector('[data-stage-photo]').className = `stage-photo${view === 1 ? ' is-detail' : view === 2 ? ' is-frame' : ''}`;
    document.querySelectorAll('[data-gallery-view]').forEach(item => item.setAttribute('aria-pressed',String(item === button)));
  }));
  updateSales();
})();
