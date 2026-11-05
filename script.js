const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const nav = document.querySelector("[data-nav]");
const searchToggle = document.querySelector("[data-search-toggle]");
const searchPanel = document.querySelector("[data-search-panel]");
const searchInput = document.querySelector("#site-search");
const navLinks = document.querySelectorAll(".main-nav a");

const setHeaderState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
};

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

menuToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  document.body.classList.toggle("menu-open", Boolean(isOpen));
  menuToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.forEach((item) => item.classList.remove("is-active"));
    link.classList.add("is-active");
    nav?.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

searchToggle?.addEventListener("click", () => {
  const isOpen = searchPanel?.classList.toggle("is-open");
  searchToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  if (isOpen) {
    window.setTimeout(() => searchInput?.focus(), 120);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  searchPanel?.classList.remove("is-open");
  nav?.classList.remove("is-open");
  document.body.classList.remove("menu-open");
  searchToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-expanded", "false");
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const clickedSearch = target.closest("[data-search-panel], [data-search-toggle]");
  if (!clickedSearch) {
    searchPanel?.classList.remove("is-open");
    searchToggle?.setAttribute("aria-expanded", "false");
  }
});

searchPanel?.addEventListener("submit", (event) => {
  event.preventDefault();
  searchPanel.classList.remove("is-open");
  searchToggle?.setAttribute("aria-expanded", "false");
});

// Construye, Configura y Vuela: contenido comercial centralizado para que
// precios, imágenes y características puedan actualizarse en un solo lugar.
const buildJourneyStageData = Object.freeze([
  {
    stage: "ETAPA 1",
    title: 'Recibe tu Kit de Dron (10")',
    description: "Te enviamos a tu domicilio un kit con los componentes necesarios para armar tu propio dron de 10 pulgadas.",
    image: "assets/build-stage-kit.jpg",
    imageAlt: "Caja de Drones Latinoamérica junto a componentes de un dron FPV de 10 pulgadas sin ensamblar",
    features: [
      { icon: "layers", label: "Kit de componentes" },
      { icon: "book", label: "Manual PDF" },
      { icon: "truck", label: "Envío a domicilio" },
    ],
    pricePrefix: "Desde",
    price: "USD $719",
    action: "Comprar Kit",
    href: "/kits/dron-10-pulgadas/",
    featured: true,
  },
  {
    stage: "ETAPA 2",
    title: "Ensambla y Configura",
    description: "Monta tu dron paso a paso y aprende a configurar su controlador de vuelo con Betaflight o INAV.",
    image: "assets/build-stage-configure.jpg",
    imageAlt: "Manos ensamblando un dron FPV junto a una computadora con software de configuración",
    features: [
      { icon: "video", label: "Guía en video" },
      { icon: "settings", label: "Betaflight / INAV" },
      { icon: "check", label: "Pruebas del sistema" },
    ],
    pricePrefix: "",
    price: "USD $299",
    action: "Comprar Etapa 2",
    href: "/cursos/ensambla-y-configura/",
    featured: false,
  },
  {
    stage: "ETAPA 3",
    title: "Vuela y Domina",
    description: "Aprende a volar de forma segura, mejora tu técnica y domina maniobras avanzadas.",
    image: "assets/build-stage-fly.jpg",
    imageAlt: "Piloto con gafas FPV y radiocontrol practicando el vuelo de un dron en un campo abierto",
    features: [
      { icon: "controller", label: "Técnicas de vuelo" },
      { icon: "shield", label: "Seguridad y buenas prácticas" },
      { icon: "chart", label: "Maniobras avanzadas" },
    ],
    pricePrefix: "",
    price: "USD $399",
    action: "Comprar Etapa 3",
    href: "/cursos/vuela-y-domina/",
    featured: false,
  },
]);

const buildJourneyIconPaths = Object.freeze({
  layers: "M12 2 3 7l9 5 9-5-9-5ZM3 12l9 5 9-5M3 17l9 5 9-5",
  book: "M4 4h6a2 2 0 0 1 2 2v14a3 3 0 0 0-3-3H4V4Zm16 0h-6a2 2 0 0 0-2 2v14a3 3 0 0 1 3-3h5V4Z",
  truck: "M3 6h11v10H3V6Zm11 4h4l3 4v2h-7v-6ZM7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  video: "M4 5h16v14H4V5Zm6 4 5 3-5 3V9Z",
  settings: "M4 6h10M18 6h2M4 12h3m4 0h9M4 18h8m4 0h4M14 3v6M7 9v6m5 0v6",
  check: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM7.5 12.5l3 3 6-7",
  controller: "M7 8h10a4 4 0 0 1 3.7 5.5l-1.4 3.4a2 2 0 0 1-3.3.7L14.4 16H9.6L8 17.6a2 2 0 0 1-3.3-.7l-1.4-3.4A4 4 0 0 1 7 8Zm1 3v4m-2-2h4m6-1h.01m2 2h.01",
  shield: "M12 2 4 5v6c0 5.2 3.4 9.2 8 11 4.6-1.8 8-5.8 8-11V5l-8-3Zm-3 10 2 2 4-5",
  chart: "M4 20V11h4v9H4Zm6 0V7h4v13h-4Zm6 0V3h4v17h-4Z",
  cart: "M3 4h2l2.4 10.2a2 2 0 0 0 2 1.5h7.8a2 2 0 0 0 1.9-1.4L21 8H7m3 12h.01M18 20h.01",
});

const createBuildJourneyIcon = (name) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("focusable", "false");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", buildJourneyIconPaths[name] || buildJourneyIconPaths.check);
  svg.append(path);
  return svg;
};

const createBuildJourneyCard = (item) => {
  const card = document.createElement("article");
  card.className = `build-stage-card${item.featured ? " is-featured" : ""}`;

  const media = document.createElement("div");
  media.className = "build-stage-media";
  const image = document.createElement("img");
  image.src = item.image;
  image.alt = item.imageAlt;
  image.loading = "lazy";
  const stage = document.createElement("span");
  stage.className = "build-stage-label";
  stage.textContent = item.stage;
  media.append(image, stage);

  const body = document.createElement("div");
  body.className = "build-stage-body";
  const title = document.createElement("h3");
  const titleLink = document.createElement("a");
  titleLink.href = item.href;
  titleLink.textContent = item.title;
  title.append(titleLink);
  const description = document.createElement("p");
  description.className = "build-stage-description";
  description.textContent = item.description;

  const features = document.createElement("ul");
  features.className = "build-stage-features";
  item.features.forEach((feature) => {
    const row = document.createElement("li");
    const icon = document.createElement("span");
    icon.className = "build-stage-feature-icon";
    icon.append(createBuildJourneyIcon(feature.icon));
    const label = document.createElement("span");
    label.textContent = feature.label;
    row.append(icon, label);
    features.append(row);
  });

  const footer = document.createElement("div");
  footer.className = "build-stage-footer";
  const price = document.createElement("div");
  price.className = "build-stage-price";
  if (item.pricePrefix) {
    const prefix = document.createElement("span");
    prefix.textContent = item.pricePrefix;
    price.append(prefix);
  }
  const amount = document.createElement("strong");
  amount.textContent = item.price;
  price.append(amount);

  const action = document.createElement("a");
  action.className = `build-stage-action${item.featured ? " is-primary" : ""}`;
  action.href = item.href;
  action.append(createBuildJourneyIcon("cart"), document.createTextNode(item.action));

  footer.append(price, action);
  body.append(title, description, features, footer);
  card.append(media, body);
  return card;
};

const buildJourneyGrid = document.querySelector("[data-build-journey-grid]");
if (buildJourneyGrid) {
  buildJourneyGrid.append(...buildJourneyStageData.map(createBuildJourneyCard));
}

// Foro: muestra los últimos temas de GitHub Discussions desde forum-latest.json
// (archivo del mismo dominio generado por el workflow, sin llamadas externas).
// Si no hay temas o falla la carga, se conserva la tarjeta estática de invitación.
const forumFeed = document.querySelector("[data-forum-list]");

if (forumFeed) {
  const renderTopic = (topic) => {
    const link = document.createElement("a");
    link.className = "forum-item";
    link.href = topic.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";

    const icon = document.createElement("span");
    icon.className = "forum-icon";
    icon.setAttribute("aria-hidden", "true");

    const body = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = topic.title;
    const small = document.createElement("small");
    const meta = [];
    if (topic.category) {
      meta.push(topic.category);
    }
    const comments = Number(topic.comments) || 0;
    meta.push(comments === 1 ? "1 comentario" : `${comments} comentarios`);
    small.textContent = meta.join(" · ");
    body.append(strong, small);

    const chevron = document.createElement("em");
    chevron.setAttribute("aria-hidden", "true");
    chevron.textContent = "›";

    link.append(icon, body, chevron);
    return link;
  };

  fetch("forum-latest.json")
    .then((response) => (response.ok ? response.json() : Promise.reject()))
    .then((data) => {
      const topics = (data && data.topics) || [];
      if (!topics.length) {
        return; // sin temas: se mantiene la tarjeta estática de invitación
      }

      const card = document.createElement("article");
      card.className = "forum-card forum-card-wide";
      const list = document.createElement("div");
      list.className = "forum-list forum-list-grid";
      topics.slice(0, 6).forEach((topic) => list.append(renderTopic(topic)));
      card.append(list);
      forumFeed.replaceChildren(card);
    })
    .catch(() => {
      /* se conserva la tarjeta estática de invitación */
    });
}

const videoFilterButtons = document.querySelectorAll("[data-video-filter]");
const videosGrid = document.getElementById("videos-grid");
Array.from(videosGrid?.querySelectorAll("[data-video-recent]") || [])
  .reverse()
  .forEach((card) => videosGrid.prepend(card));
const videoCards = videosGrid?.querySelectorAll("[data-video-category]");
const videoEmptyMessage = document.querySelector("[data-video-empty]");
const videosSeeMoreButton = document.querySelector('[data-see-more="videos-grid"]');
const videoDescriptionBox = document.querySelector("[data-video-description-box]");
const videoDescriptionLabel = document.querySelector("[data-video-description-label]");
const videoDescriptionText = document.querySelector("[data-video-description-text]");
let activeVideoCategory = "drones";
let areVideosExpanded = false;

const updateVideosSeeMoreState = (visibleCount) => {
  if (!videosSeeMoreButton) {
    return;
  }

  videosSeeMoreButton.parentElement?.toggleAttribute("hidden", visibleCount <= 3);
  videosSeeMoreButton.setAttribute("aria-expanded", String(areVideosExpanded));
  videosSeeMoreButton.textContent = areVideosExpanded
    ? videosSeeMoreButton.dataset.labelLess || "Ver menos"
    : videosSeeMoreButton.dataset.labelMore || "Ver todos los videos";
};

// Muestra bajo las pestañas el nombre completo y la descripción de la
// categoría activa. Los textos viven en los data-* de cada botón.
const updateVideoDescription = (category) => {
  if (!videoDescriptionBox) {
    return;
  }

  const button = document.querySelector(`[data-video-filter="${category}"]`);
  const label = button?.dataset.videoLabel || "";
  const description = button?.dataset.videoDescription || "";

  if (videoDescriptionLabel) {
    videoDescriptionLabel.textContent = label ? `${label}:` : "";
  }
  if (videoDescriptionText) {
    videoDescriptionText.textContent = description;
  }

  videoDescriptionBox.toggleAttribute("hidden", !label && !description);
};

const applyVideoFilter = (category, { keepExpanded = false } = {}) => {
  if (!videosGrid || !videoCards) {
    return;
  }

  activeVideoCategory = category;
  updateVideoDescription(category);
  if (!keepExpanded) {
    areVideosExpanded = false;
  }

  let visibleCount = 0;
  videoCards.forEach((card) => {
    const isVisible = card.getAttribute("data-video-category") === category;
    card.classList.toggle("is-hidden", !isVisible);
    if (isVisible) {
      visibleCount += 1;
      card.classList.toggle("is-over-limit", visibleCount > 3);
    } else {
      card.classList.remove("is-over-limit");
    }
  });

  videosGrid.classList.toggle("is-collapsed", !areVideosExpanded);
  videoEmptyMessage?.toggleAttribute("hidden", visibleCount > 0);
  updateVideosSeeMoreState(visibleCount);
};

document.querySelectorAll("[data-see-more]").forEach((button) => {
  button.addEventListener("click", () => {
    const grid = document.getElementById(button.getAttribute("data-see-more"));
    if (!grid) {
      return;
    }

    if (grid === videosGrid) {
      areVideosExpanded = !areVideosExpanded;
      applyVideoFilter(activeVideoCategory, { keepExpanded: true });
      return;
    }

    if (grid === docsGrid) {
      areDocsExpanded = !areDocsExpanded;
      applyDocFilter(activeDocCategory, { keepExpanded: true });
      return;
    }

    if (grid === commGrid) {
      areCommsExpanded = !areCommsExpanded;
      applyCommFilter(activeCommCategory, { keepExpanded: true });
      return;
    }

    const isCollapsed = grid.classList.toggle("is-collapsed");
    button.setAttribute("aria-expanded", String(!isCollapsed));
    button.textContent = isCollapsed
      ? button.dataset.labelMore
      : button.dataset.labelLess;
  });
});

videoFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.getAttribute("data-video-filter");
    if (!category) {
      return;
    }

    videoFilterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    applyVideoFilter(category);
  });
});

applyVideoFilter(activeVideoCategory);

// Permite que el sistema de idiomas vuelva a pintar los textos que este
// widget genera desde JS (etiquetas de categoría y descripción).
// Guías y Manuales: mismo patrón de categorías que los videos.
const docFilterButtons = document.querySelectorAll("[data-doc-filter]");
const docsGrid = document.getElementById("docs-grid");
const docCards = docsGrid?.querySelectorAll("[data-doc-category]");
const docsSeeMoreButton = document.querySelector('[data-see-more="docs-grid"]');
const docDescriptionBox = document.querySelector("[data-doc-description-box]");
const docDescriptionLabel = document.querySelector("[data-doc-description-label]");
const docDescriptionText = document.querySelector("[data-doc-description-text]");
let activeDocCategory = "drones";
let areDocsExpanded = false;

const updateDocDescription = (category) => {
  if (!docDescriptionBox) {
    return;
  }
  const button = document.querySelector(`[data-doc-filter="${category}"]`);
  const label = button?.dataset.docLabel || "";
  const description = button?.dataset.docDescription || "";
  if (docDescriptionLabel) {
    docDescriptionLabel.textContent = label ? `${label}:` : "";
  }
  if (docDescriptionText) {
    docDescriptionText.textContent = description;
  }
  docDescriptionBox.toggleAttribute("hidden", !label && !description);
};

const applyDocFilter = (category, { keepExpanded = false } = {}) => {
  if (!docsGrid || !docCards) {
    return;
  }

  activeDocCategory = category;
  updateDocDescription(category);
  if (!keepExpanded) {
    areDocsExpanded = false;
  }

  let visibleCount = 0;
  docCards.forEach((card) => {
    const isVisible = card.getAttribute("data-doc-category") === category;
    card.classList.toggle("is-hidden", !isVisible);
    if (isVisible) {
      visibleCount += 1;
      card.classList.toggle("is-over-limit", visibleCount > 3);
    } else {
      card.classList.remove("is-over-limit");
    }
  });

  docsGrid.classList.toggle("is-collapsed", !areDocsExpanded);

  if (docsSeeMoreButton) {
    docsSeeMoreButton.parentElement?.toggleAttribute("hidden", visibleCount <= 3);
    docsSeeMoreButton.setAttribute("aria-expanded", String(areDocsExpanded));
    docsSeeMoreButton.textContent = areDocsExpanded
      ? docsSeeMoreButton.dataset.labelLess || "Ver menos"
      : docsSeeMoreButton.dataset.labelMore || "Ver todas las Guías y Manuales";
  }
};

docFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.getAttribute("data-doc-filter");
    if (!category) {
      return;
    }
    docFilterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    applyDocFilter(category);
  });
});

applyDocFilter(activeDocCategory);

// Permite al sistema de idiomas repintar los textos generados aquí.
// Otras comunidades: mismo patrón de categorías.
const commFilterButtons = document.querySelectorAll("[data-comm-filter]");
const commGrid = document.getElementById("communities-grid");
const commCards = commGrid?.querySelectorAll("[data-comm-category]");
const commSeeMoreButton = document.querySelector('[data-see-more="communities-grid"]');
const commDescriptionBox = document.querySelector("[data-comm-description-box]");
const commDescriptionLabel = document.querySelector("[data-comm-description-label]");
const commDescriptionText = document.querySelector("[data-comm-description-text]");
let activeCommCategory = "drones";
let areCommsExpanded = false;

const updateCommDescription = (category) => {
  if (!commDescriptionBox) {
    return;
  }
  const button = document.querySelector(`[data-comm-filter="${category}"]`);
  const label = button?.dataset.commLabel || "";
  const description = button?.dataset.commDescription || "";
  if (commDescriptionLabel) {
    commDescriptionLabel.textContent = label ? `${label}:` : "";
  }
  if (commDescriptionText) {
    commDescriptionText.textContent = description;
  }
  commDescriptionBox.toggleAttribute("hidden", !label && !description);
};

const applyCommFilter = (category, { keepExpanded = false } = {}) => {
  if (!commGrid || !commCards) {
    return;
  }

  activeCommCategory = category;
  updateCommDescription(category);
  if (!keepExpanded) {
    areCommsExpanded = false;
  }

  let visibleCount = 0;
  commCards.forEach((card) => {
    const isVisible = card.getAttribute("data-comm-category") === category;
    card.classList.toggle("is-hidden", !isVisible);
    if (isVisible) {
      visibleCount += 1;
      card.classList.toggle("is-over-limit", visibleCount > 4);
    } else {
      card.classList.remove("is-over-limit");
    }
  });

  commGrid.classList.toggle("is-collapsed", !areCommsExpanded);

  if (commSeeMoreButton) {
    commSeeMoreButton.parentElement?.toggleAttribute("hidden", visibleCount <= 4);
    commSeeMoreButton.setAttribute("aria-expanded", String(areCommsExpanded));
    commSeeMoreButton.textContent = areCommsExpanded
      ? commSeeMoreButton.dataset.labelLess || "Ver menos"
      : commSeeMoreButton.dataset.labelMore || "Ver todas las comunidades";
  }
};

commFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.getAttribute("data-comm-filter");
    if (!category) {
      return;
    }
    commFilterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    applyCommFilter(category);
  });
});

applyCommFilter(activeCommCategory);

// Fabricantes y tiendas: mismo patrón de categorías (sin colapso, se muestran todas).
const mfgFilterButtons = document.querySelectorAll("[data-mfg-filter]");
const mfgGrid = document.getElementById("manufacturers-grid");
const mfgCards = mfgGrid?.querySelectorAll("[data-mfg-category]");
const mfgDescriptionBox = document.querySelector("[data-mfg-description-box]");
const mfgDescriptionLabel = document.querySelector("[data-mfg-description-label]");
const mfgDescriptionText = document.querySelector("[data-mfg-description-text]");
let activeMfgCategory = "fabricantes";

const applyMfgFilter = (category) => {
  if (!mfgGrid || !mfgCards) {
    return;
  }

  activeMfgCategory = category;

  const button = document.querySelector(`[data-mfg-filter="${category}"]`);
  const label = button?.dataset.mfgLabel || "";
  const description = button?.dataset.mfgDescription || "";
  if (mfgDescriptionLabel) {
    mfgDescriptionLabel.textContent = label ? `${label}:` : "";
  }
  if (mfgDescriptionText) {
    mfgDescriptionText.textContent = description;
  }
  mfgDescriptionBox?.toggleAttribute("hidden", !label && !description);

  mfgCards.forEach((card) => {
    card.classList.toggle("is-hidden", card.getAttribute("data-mfg-category") !== category);
  });
};

mfgFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const category = button.getAttribute("data-mfg-filter");
    if (!category) {
      return;
    }
    mfgFilterButtons.forEach((item) => {
      const isActive = item === button;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });
    applyMfgFilter(category);
  });
});

applyMfgFilter(activeMfgCategory);

window.reapplyMfgFilter = () => {
  applyMfgFilter(activeMfgCategory);
};

window.reapplyCommFilter = () => {
  applyCommFilter(activeCommCategory, { keepExpanded: true });
};

window.reapplyDocFilter = () => {
  applyDocFilter(activeDocCategory, { keepExpanded: true });
};

window.reapplyVideoFilter = () => {
  applyVideoFilter(activeVideoCategory, { keepExpanded: true });
};

const quoteForm = document.querySelector(".site-form");
if (quoteForm) {
  const params = new URLSearchParams(window.location.search);
  const subject = params.get("asunto");
  const service = params.get("servicio");

  if (subject) {
    const subjectInput = quoteForm.querySelector('input[name="_subject"]');
    if (subjectInput) {
      subjectInput.value = subject;
    }
  }

  if (service) {
    const serviceInput = quoteForm.querySelector('input[name="Curso o servicio de interés"]');
    const messageInput = quoteForm.querySelector('textarea[name="Mensaje"]');

    if (serviceInput && !serviceInput.value) {
      serviceInput.value = service;
    }

    if (messageInput && !messageInput.value) {
      messageInput.value = [
        `Tipo de proyecto: ${service}`,
        "Objetos que necesita detectar:",
        "Plataforma: navegador / computadora / Raspberry Pi / Jetson / dron / robot / cámara de tráfico / otra",
        "Descripción del proyecto:",
        "Presupuesto aproximado:"
      ].join("\n");
    }
  }
}
