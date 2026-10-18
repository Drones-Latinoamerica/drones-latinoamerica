(function () {
  "use strict";

  const MAX_FILE_BYTES = 3 * 1024 * 1024;

  /* El sitio se publica en GitHub Pages, que sirve solo archivos estaticos:
   * no hay backend propio. El formulario apuntaba a /api/design-contributions
   * y comprobaba /api/health, rutas que alli devuelven 404, de modo que la
   * comprobacion fallaba siempre y el envio quedaba bloqueado.
   * Se usa FormSubmit, el mismo servicio que ya funciona en la cotizacion.
   * Admite adjuntos con enctype multipart/form-data, hasta 10 MB sumando
   * todos los archivos; aqui el limite propio es de 3 MB. */
  const FORM_ENDPOINT = "https://formsubmit.co/droneslatinos@gmail.com";
  const CATEGORY_KEY = document.body.dataset.libraryCategory;
  const root = document.getElementById("design-library-root");

  const categories = {
    blueprints: {
      href: "../blueprints/?v=20261011-9",
      image: "../../assets/design-engineering/blueprint-quadcopter-example.png",
      icon: "▧",
    },
    wiring: {
      href: "../wiring-diagrams/?v=20261018-fiber-wiring-1",
      icon: "⌁",
      documents: [
        {
          image: "../../assets/design-engineering/wiring-diagram-cubepilot.webp",
          // Diagrama vertical (1131x1391). Sin esta marca, la miniatura lo
          // recorta dentro de una caja 16/10 y solo se ve un fragmento ampliado.
          tall: true,
          isExample: false,
          download: "diagrama-cableado-ecosistema-cubepilot.webp",
        },
        {
          image: "../../assets/design-engineering/wiring-diagram-fiber-optic-overview.png",
          isExample: false,
          download: "diagrama-fibra-optica-modulos-aereo-terrestre.png",
        },
        {
          image: "../../assets/design-engineering/wiring-diagram-fiber-optic-detailed.png",
          tall: true,
          isExample: false,
          download: "diagrama-fibra-optica-sistema-fpv-detallado.png",
        },
      ],
    },
    schematics: {
      href: "../schematics/?v=20261011-9",
      image: "../../assets/design-engineering/schematic-drone-system.jpg",
      icon: "◇",
    },
    exploded: {
      href: "../exploded-view/?v=20261011-9",
      icon: "▣",
      // Esta categoria tiene varios documentos. Las laminas son verticales,
      // asi que llevan tall: con la caja 16/10 y object-fit cover se
      // recortaria media vista y se perderian las cotas.
      documents: [
        {
          image: "../../assets/design-engineering/exploded-view-quadcopter-fpv.webp",
          tall: true,
          isExample: false,
          download: "vista-explotada-cuadricoptero-fpv.webp",
        },
        {
          image: "../../assets/design-engineering/exploded-view-fixed-wing.webp",
          tall: true,
          isExample: false,
          download: "vista-explotada-ala-fija.webp",
        },
      ],
    },
  };

  let state = {
    query: "",
    filters: new Set(),
  };

  /* FormSubmit devuelve a esta pagina con ?enviado=1. Se lee una sola vez
   * aqui porque render() puede ejecutarse varias veces (al cargar y al
   * resolverse el idioma): si se leyera dentro, el primer pase limpiaria
   * la URL y el segundo ya no encontraria la marca. */
  let envioConfirmado = new URLSearchParams(location.search).has("enviado");
  if (envioConfirmado) {
    history.replaceState(null, "", location.pathname + location.hash);
  }

  const escapeHtml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  const normalize = (value) => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const getLanguage = () => (window.DLI18n && window.DLI18n.getLanguage()) || "es";

  const getDictionary = () => {
    const lang = getLanguage();
    const translations = window.DLI18n && window.DLI18n.translations;
    return translations && translations[lang] && translations[lang].designLibrary;
  };

  const categoryKeys = Object.keys(categories);

  /* Una categoria puede traer un solo documento (campos sueltos, que es el
   * formato original) o varios en "documents". Estas dos funciones reducen
   * ambos casos a una lista, para que el resto del codigo no distinga. */
  const documentosDe = (config) => config.documents || [config];

  const textosDe = (category) => category.documents || [{
    title: category.exampleTitle,
    description: category.exampleDescription,
    tags: category.exampleTags,
  }];

  const renderCategoryLinks = (dict) => categoryKeys.map((key) => {
    const item = categories[key];
    const category = dict.categories[key];
    const active = key === CATEGORY_KEY;
    return `
      <a class="library-nav-link${active ? " is-active" : ""}" href="${item.href}"${active ? ' aria-current="page"' : ""}>
        <span aria-hidden="true">${item.icon}</span>
        ${escapeHtml(category.title)}
      </a>`;
  }).join("");

  const renderFilters = (category, common) => category.filterOptions.map((option) => `
    <label class="library-filter-option">
      <input type="checkbox" value="${escapeHtml(option)}" data-library-filter />
      <span>${escapeHtml(option)}</span>
    </label>`).join("");

  const renderTags = (tags) => tags.map((tag) => `<span class="library-tag">${escapeHtml(tag)}</span>`).join("");

  const renderDocument = (texto, common, doc, indice) => {
    const esEjemplo = doc.isExample !== false;
    const verTexto = esEjemplo ? common.viewExample : common.viewDocument;
    return `
    <article class="library-document-card" data-library-document data-doc="${indice}">
      <button class="library-document-media${doc.tall ? " is-tall" : ""}" type="button" data-open-example="${indice}" aria-label="${escapeHtml(verTexto)}: ${escapeHtml(texto.title)}">
        <img src="${doc.image}" alt="${escapeHtml(texto.title)}" loading="lazy" />
        ${esEjemplo ? `<span class="library-example-badge">${escapeHtml(common.example)}</span>` : ""}
      </button>
      <div class="library-document-body">
        <div>
          <h2>${escapeHtml(texto.title)}</h2>
          <p>${escapeHtml(texto.description)}</p>
        </div>
        <div class="library-tags">${renderTags(texto.tags)}</div>
        <div class="library-document-actions">
          <button class="btn btn-primary library-document-action" type="button" data-open-example="${indice}">
            ${escapeHtml(verTexto)} <span aria-hidden="true">→</span>
          </button>
          ${doc.download ? `<a class="btn btn-ghost library-document-download" href="${doc.image}" download="${escapeHtml(doc.download)}">
            <span aria-hidden="true">↓</span> ${escapeHtml(common.download)}
          </a>` : ""}
        </div>
      </div>
    </article>`;
  };

  const renderDocuments = (category, common, config) => {
    const docs = documentosDe(config);
    const textos = textosDe(category);
    return docs.map((doc, i) => renderDocument(textos[i] || textos[0], common, doc, i)).join("");
  };

  const renderForm = (category, common) => `
    <section class="contribution-panel" id="contribution-form" hidden>
      <div class="contribution-heading">
        <div>
          <p class="section-kicker">${escapeHtml(common.contributeKicker)}</p>
          <h2>${escapeHtml(common.formTitle)}</h2>
          <p>${escapeHtml(common.formIntro)}</p>
        </div>
        <button class="contribution-close" type="button" data-close-form aria-label="${escapeHtml(common.close)}">×</button>
      </div>
      <form class="contribution-form" data-contribution-form novalidate
            action="${FORM_ENDPOINT}" method="POST" enctype="multipart/form-data">
        <div class="form-honeypot" aria-hidden="true">
          <label>Website<input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
        </div>
        <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <input type="hidden" name="_subject" value="${escapeHtml(common.formTitle)}: ${escapeHtml(category.title)}" />
        <input type="hidden" name="_template" value="table" />
        <input type="hidden" name="_captcha" value="false" />
        <input type="hidden" name="_next" value="${location.origin}${location.pathname}?enviado=1" />
        <input type="hidden" name="category" value="${escapeHtml(category.title)}" />
        <input type="hidden" name="startedAt" value="${Date.now()}" />
        <label class="form-field">
          <span>${escapeHtml(common.fullName)} *</span>
          <input type="text" name="fullName" maxlength="120" autocomplete="name" required />
        </label>
        <label class="form-field">
          <span>${escapeHtml(common.email)} *</span>
          <input type="email" name="email" maxlength="180" autocomplete="email" required />
        </label>
        <label class="form-field">
          <span>${escapeHtml(common.country)}</span>
          <input type="text" name="country" maxlength="100" autocomplete="country-name" />
        </label>
        <label class="form-field">
          <span>${escapeHtml(common.category)}</span>
          <input type="text" value="${escapeHtml(category.title)}" readonly />
        </label>
        <label class="form-field form-field-wide">
          <span>${escapeHtml(common.designTitle)} *</span>
          <input type="text" name="designTitle" maxlength="160" required />
        </label>
        <label class="form-field form-field-wide">
          <span>${escapeHtml(common.description)} *</span>
          <textarea name="description" rows="5" maxlength="2000" required></textarea>
        </label>
        <div class="form-field form-field-wide">
          <span>${escapeHtml(common.file)} *</span>
          <label class="file-picker">
            <input type="file" name="file" accept=".pdf,.rar,.zip,application/pdf,application/zip,application/x-rar-compressed" required data-file-input />
            <strong>${escapeHtml(common.chooseFile)}</strong>
            <span data-file-name>${escapeHtml(common.noFile)}</span>
          </label>
          <small>${escapeHtml(common.fileHelp)}</small>
        </div>
        <label class="rights-field form-field-wide">
          <input type="checkbox" name="rightsConfirmed" value="true" required />
          <span>${escapeHtml(common.rights)} *</span>
        </label>
        <div class="form-field-wide form-status" data-form-status role="status" aria-live="polite"></div>
        <div class="form-field-wide">
          <button class="btn btn-primary contribution-submit" type="submit">${escapeHtml(common.submit)} <span aria-hidden="true">→</span></button>
        </div>
      </form>
    </section>`;

  const renderViewer = (texto, common, doc, indice) => {
    const esEjemplo = doc.isExample !== false;
    return `
    <dialog class="example-viewer" data-example-dialog="${indice}">
      <div class="example-viewer-head">
        <div><span>${escapeHtml(esEjemplo ? common.illustrative : common.reference)}</span><h2>${escapeHtml(texto.title)}</h2></div>
        <button type="button" data-close-example aria-label="${escapeHtml(common.close)}">×</button>
      </div>
      <img src="${doc.image}" alt="${escapeHtml(texto.title)}" />
      <p>${escapeHtml(texto.description)}</p>
      ${doc.download ? `<div class="example-viewer-actions">
        <a class="btn btn-primary" href="${doc.image}" download="${escapeHtml(doc.download)}">
          <span aria-hidden="true">↓</span> ${escapeHtml(common.download)}
        </a>
      </div>` : ""}
      ${esEjemplo ? `<div class="example-disclaimer"><strong>!</strong><span>${escapeHtml(common.disclaimer)}</span></div>` : ""}
    </dialog>`;
  };

  const renderViewers = (category, common, config) => {
    const docs = documentosDe(config);
    const textos = textosDe(category);
    return docs.map((doc, i) => renderViewer(textos[i] || textos[0], common, doc, i)).join("");
  };

  const render = () => {
    const dict = getDictionary();
    const config = categories[CATEGORY_KEY];
    if (!root || !dict || !config || !dict.categories[CATEGORY_KEY]) {
      return;
    }

    const common = dict.common;
    const category = dict.categories[CATEGORY_KEY];
    document.title = `${category.title} | ${common.section}`;

    root.innerHTML = `
      <div class="container library-shell">
        <nav class="engineering-breadcrumb" aria-label="${escapeHtml(common.menuAria)}">
          <a href="../../index.html#inicio">${escapeHtml(common.home)}</a><span aria-hidden="true">›</span>
          <a href="../../index.html#diseno-ingenieria">${escapeHtml(common.section)}</a><span aria-hidden="true">›</span>
          <strong>${escapeHtml(category.title)}</strong>
        </nav>
        <div class="library-layout">
          <aside class="library-sidebar">
            <h2>${escapeHtml(common.libraryNav)}</h2>
            <nav class="library-category-nav" aria-label="${escapeHtml(common.menuAria)}">${renderCategoryLinks(dict)}</nav>
            <div class="library-filter-panel">
              <h3>${escapeHtml(common.filters)}</h3>
              <div class="library-filter-list">${renderFilters(category, common)}</div>
              <button type="button" class="library-clear-filters" data-clear-filters>${escapeHtml(common.clearFilters)}</button>
            </div>
          </aside>
          <div class="library-content">
            <header class="library-hero">
              <div><p class="section-kicker">${escapeHtml(common.section)}</p><h1>${escapeHtml(category.title)}</h1><p>${escapeHtml(category.intro)}</p></div>
              <label class="library-search"><span aria-hidden="true">⌕</span><input type="search" placeholder="${escapeHtml(category.search)}" aria-label="${escapeHtml(common.searchAria)}" data-library-search /></label>
            </header>
            <div class="library-results" data-library-results>
              ${renderDocuments(category, common, config)}
              <div class="library-empty" data-library-empty hidden><span aria-hidden="true">⌕</span><h2>${escapeHtml(common.noResults)}</h2><p>${escapeHtml(common.noResultsCopy)}</p></div>
            </div>
            <section class="contribution-invite">
              <div><p class="section-kicker">${escapeHtml(common.contributeKicker)}</p><h2>${escapeHtml(category.invite)}</h2></div>
              <button class="btn btn-primary" type="button" data-open-form>${escapeHtml(category.inviteButton)} <span aria-hidden="true">→</span></button>
            </section>
            ${renderForm(category, common)}
          </div>
        </div>
      </div>
      ${renderViewers(category, common, config)}`;

    bindInteractions(category, common);
  };

  const matchesFilters = (texto) => {
    const haystack = normalize(texto.title + " " + texto.description);
    const queryMatches = !state.query || haystack.includes(normalize(state.query));
    const filterMatches = state.filters.size === 0
      || (texto.tags || []).some((tag) => state.filters.has(tag));
    return queryMatches && filterMatches;
  };

  const updateResults = (category) => {
    const textos = textosDe(category);
    const empty = root.querySelector("[data-library-empty]");
    let algunoVisible = false;
    root.querySelectorAll("[data-library-document]").forEach((card) => {
      const texto = textos[Number(card.dataset.doc) || 0] || textos[0];
      const visible = matchesFilters(texto);
      card.hidden = !visible;
      if (visible) algunoVisible = true;
    });
    empty.hidden = algunoVisible;
  };

  const fileSignatureIsValid = async (file, extension) => {
    const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    if (extension === "pdf") {
      return bytes.length >= 5 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
    }
    if (extension === "zip") {
      return bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && [0x03, 0x05, 0x07].includes(bytes[2]) && [0x04, 0x06, 0x08].includes(bytes[3]);
    }
    if (extension === "rar") {
      return bytes.length >= 7 && bytes[0] === 0x52 && bytes[1] === 0x61 && bytes[2] === 0x72 && bytes[3] === 0x21 && bytes[4] === 0x1a && bytes[5] === 0x07;
    }
    return false;
  };

  const validateFile = async (file, common) => {
    if (!file) {
      return common.invalidFile;
    }
    if (file.size > MAX_FILE_BYTES) {
      return common.largeFile;
    }
    const extension = (file.name.split(".").pop() || "").toLowerCase();
    if (!["pdf", "rar", "zip"].includes(extension) || !(await fileSignatureIsValid(file, extension))) {
      return common.invalidFile;
    }
    return "";
  };

  /* FormSubmit es un servicio externo: no hay nada que comprobar antes de
   * enviar, a diferencia del backend propio que nunca existio. */

  const bindInteractions = (category, common) => {
    const search = root.querySelector("[data-library-search]");
    search.addEventListener("input", () => {
      state.query = search.value;
      updateResults(category);
    });

    root.querySelectorAll("[data-library-filter]").forEach((input) => {
      input.addEventListener("change", () => {
        if (input.checked) state.filters.add(input.value);
        else state.filters.delete(input.value);
        updateResults(category);
      });
    });

    root.querySelector("[data-clear-filters]").addEventListener("click", () => {
      state.filters.clear();
      root.querySelectorAll("[data-library-filter]").forEach((input) => { input.checked = false; });
      updateResults(category);
    });

    // Hay un visor por documento: cada boton abre el suyo por indice.
    root.querySelectorAll("[data-open-example]").forEach((button) => {
      button.addEventListener("click", () => {
        const indice = button.dataset.openExample || "0";
        const dialog = document.querySelector('[data-example-dialog="' + indice + '"]');
        if (!dialog) return;
        if (typeof dialog.showModal === "function") dialog.showModal();
        else dialog.setAttribute("open", "");
      });
    });
    document.querySelectorAll("[data-example-dialog]").forEach((dialog) => {
      const cerrar = dialog.querySelector("[data-close-example]");
      if (cerrar) cerrar.addEventListener("click", () => dialog.close());
      dialog.addEventListener("click", (event) => {
        if (event.target === dialog) dialog.close();
      });
    });

    const panel = root.querySelector("#contribution-form");
    const form = root.querySelector("[data-contribution-form]");
    const formStatus = root.querySelector("[data-form-status]");
    const submitButton = form.querySelector('button[type="submit"]');
    // El boton nacia deshabilitado a la espera de /api/health, que en
    // GitHub Pages devuelve 404: no se habilitaba nunca.
    submitButton.disabled = false;
    panel.dataset.serviceReady = "true";
    formStatus.textContent = "";

    root.querySelector("[data-open-form]").addEventListener("click", () => {
      panel.hidden = false;
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
      panel.querySelector('input[name="fullName"]').focus({ preventScroll: true });
    });
    root.querySelector("[data-close-form]").addEventListener("click", () => { panel.hidden = true; });

    // Confirmar el envio al volver de FormSubmit.
    if (envioConfirmado) {
      panel.hidden = false;
      formStatus.textContent = common.success;
      formStatus.className = "form-field-wide form-status is-success";
      panel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const fileInput = root.querySelector("[data-file-input]");
    const fileName = root.querySelector("[data-file-name]");
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files && fileInput.files[0];
      fileName.textContent = file ? `${file.name} · ${(file.size / 1024 / 1024).toFixed(2)} MB` : common.noFile;
      const status = root.querySelector("[data-form-status]");
      const error = file ? await validateFile(file, common) : "";
      status.textContent = error;
      status.className = `form-field-wide form-status${error ? " is-error" : ""}`;
    });

    form.addEventListener("submit", (event) => submitContribution(event, common));
  };

  const submitContribution = async (event, common) => {
    event.preventDefault();
    const form = event.currentTarget;
    const status = form.querySelector("[data-form-status]");
    const submit = form.querySelector("button[type=" + '"submit"' + "]");

    if (!form.reportValidity()) {
      return;
    }

    const file = form.elements.file.files && form.elements.file.files[0];
    const fileError = await validateFile(file, common);
    if (fileError) {
      status.textContent = fileError;
      status.className = "form-field-wide form-status is-error";
      return;
    }

    // Validado: se deja que el navegador haga el POST normal a FormSubmit.
    // Hace falta un envio nativo, no fetch, porque el adjunto viaja como
    // multipart y la respuesta es una redireccion a _next.
    submit.disabled = true;
    submit.textContent = common.sending;
    status.textContent = "";
    status.className = "form-field-wide form-status";
    HTMLFormElement.prototype.submit.call(form);
  };


  const init = () => {
    state = { query: "", filters: new Set() };
    render();
  };

  document.addEventListener("languagechange", init);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
