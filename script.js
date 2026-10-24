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
