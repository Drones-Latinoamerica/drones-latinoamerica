/*
 * Soporte bilingüe (ES / EN) para Drones Latinoamérica.
 *
 * Arquitectura: las traducciones viven centralizadas en `translations`,
 * organizadas por sección. El HTML se escribe en español (idioma principal)
 * y el motor empareja cada clave es↔en para intercambiar el texto visible.
 * Así no hay textos duplicados repartidos por el markup.
 *
 * Español es el idioma por defecto. El idioma elegido se guarda en
 * localStorage y se puede forzar con ?lang=en / ?lang=es.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "dl-lang";
  const DEFAULT_LANG = "es";
  const SUPPORTED = ["es", "en"];

  const translations = {
    es: {
      nav: {
        home: "Inicio",
        community: "Comunidad",
        courses: "Cursos",
        projects: "Proyectos",
        forum: "Foro",
        events: "Eventos",
        marketplace: "Marketplace",
        resources: "Recursos",
      },
      actions: {
        search: "Buscar",
        join: "Únete gratis",
        joinUpper: "ÚNETE GRATIS",
        exploreWorkshops: "EXPLORAR TALLERES",
        joinCommunity: "ÚNETE A LA COMUNIDAD",
        searchPlaceholder: "Cursos, proyectos, pilotos, eventos...",
        searchLabel: "Buscar en Drones Latinoamérica",
        openMenu: "Abrir menú",
        mainNav: "Navegación principal",
        subscribe: "Suscribirme",
      },
      hero: {
        eyebrow: "Bienvenido a Drones Latinoamérica",
        title: "Conectamos, enseñamos y construimos el futuro de los drones en Latinoamérica",
        copy: "La comunidad más grande para pilotos, constructores, ingenieros e innovadores de drones en la región.",
        members: "Miembros",
        courses: "Cursos y talleres",
        projects: "Proyectos",
        countries: "Países",
        posts: "Publicaciones",
      },
      sections: {
        kickerTraining: "Formación aplicada",
        kickerSimulators: "Simuladores de drones",
        kickerDemos: "Demos interactivas",
        kickerGear: "Equipos y componentes",
        kickerNews: "Google Noticias",
        kickerActivity: "Actividad reciente",
        kickerWatch: "Aprende viendo",
        kickerLibrary: "Biblioteca",
        kickerDirectory: "Directorio UAV",
        kickerNetwork: "Red de drones",
        kickerNextGen: "Nueva generación UAV",
        courses: "Cursos y talleres",
        simulators: "Simuladores de drones para todos los niveles",
        vision: "Visión Artificial con Webcam",
        marketplace: "Marketplace destacado",
        news: "Noticias y Actualidades",
        forum: "Foro destacado",
        videos: "Videos y Canales recomendados",
        guides: "Guías y Manuales",
        manufacturers: "Fabricantes y Empresas de Drones",
        communities: "Otras comunidades",
        beBig: "Sé parte de algo grande",
        sponsors: "Aliados y patrocinadores",
        allPrograms: "Ver todos los programas",
        moreNews: "Ver más noticias",
        goForum: "Ir al foro",
        mainCategories: "Categorías principales",
      },
      courses: {
        basic: "Básico",
        intermediate: "Intermedio",
        advanced: "Avanzado",
        simulation: "Simulación",
        online: "Online",
        hours2: "◷ 2 horas",
        hours4: "◷ 4 horas",
        hours5: "◷ 5 horas",
        hours8: "◷ 8 horas",
        intro: "Introducción a Drones",
        pixhawk: "Pixhawk para Principiantes",
        fixedWing: "Construcción de UAV de Ala Fija",
        photogrammetry: "Fotogrametría con Drones",
      },
      simulators: {
        intro: "Entrena, explora y perfecciona tus habilidades con simuladores diseñados para cada etapa de tu aprendizaje.",
        customTitle: "¿Necesitas un simulador personalizado?",
        customCopy: "Hacemos simuladores con maquetado personalizado de ciudades o escenarios para entrenamientos, demostraciones y proyectos especiales.",
        freeTitle: "Prueba el juego gratis",
        freeCopy: "Simulador básico gratuito para que pruebes los controles y vivas la experiencia de volar un dron.",
        tilesTitle: "Simulador con Google Photorealistic 3D Tiles",
        tilesCopy: "Explora ciudades reales en 3D con datos de Google. Entorno hiperrealista para planificar y entrenar.",
        proTitle: "Simulador Profesional personalizado",
        proCopy: "Simula tu ciudad con física avanzada, misiones desafiantes y escenarios profesionales a medida.",
        quote: "Pedir presupuesto",
        tryFree: "Probar gratis ahora",
        open: "Abrir simulador",
        askSale: "Preguntar por venta",
      },
      vision: {
        intro: "Explora tres niveles de visión artificial y seguimiento de objetos. Prueba demostraciones interactivas directamente desde tu cámara web o solicita una solución personalizada.",
        basicTitle: "OpenCV Básico",
        basicCopy: "Muéstrale una figura en papel y te dirá qué ve mientras la sigue en tiempo real.",
        yoloTitle: "YOLO + OpenCV",
        yoloCopy: "Detecta objetos y dibujos como carros, aviones y tazas, y luego los sigue.",
        customTitle: "Visión Artificial Personalizada",
        customCopy: "Desarrollo de sistemas personalizados con C++, OpenCV y YOLO para proyectos profesionales.",
        customNeed: "¿Necesitas una solución personalizada?",
        customNeedCopy: "Desarrollamos sistemas de visión artificial a medida para drones, robótica, tráfico, seguridad y automatización.",
        demoBasic: "Probar Demo OpenCV",
        demoYolo: "Probar Demo YOLO + OpenCV",
        requestQuote: "Solicitar cotización",
      },
      marketplace: {
        viewProducts: "Ver productos",
        viewResources: "Ver recursos",
        drones: "Drones",
        radios: "Radios y controles",
        controllers: "Controladoras de vuelo",
        cameras: "Cámaras y sensores",
        accessories: "Accesorios",
        simulators: "Simuladores",
        goggles: "Gafas y Video",
        motors: "Motores y Baterías",
        gps: "GPS y Navegación",
        power: "Energía y ESC",
        frame: "Chasis (Frame)",
        props: "Hélices",
        computers: "Computadoras de flight",
        printers: "Impresoras 3D",
        guards: "Protectores para drones",
      },
      news: {
        defense: "Defensa",
        regulation: "Regulación",
        technology: "Tecnología",
        war: "Guerra y defensa",
        civil: "Seguridad civil",
        videoDefense: "Video · Defensa",
        videoFpv: "Video · FPV",
        readMore: "Leer más",
        watchVideo: "Ver video",
        footnote: "Las noticias enlazan a sus fuentes originales.",
        seeAll: "Ver todas las noticias",
        seeLess: "Ver menos",
      },
      forum: {
        title: "Comunidad Drones Latinoamérica",
        copy: "Participa en nuestro foro, comparte experiencias, haz preguntas y conecta con otros entusiastas de los drones en Latinoamérica.",
        visit: "Visitar el foro",
      },
      videos: {
        seeAll: "Ver todos los videos",
        seeLess: "Ver menos",
        empty: "No hay videos en esta categoría todavía.",
        catDrones: "Drones",
        catRockets: "Cohetes",
        catAero: "Aeromodelismo",
        catAi: "Inteligencia Artificial",
        catPrinters: "Impresoras 3D",
        catChem: "Química",
        catMixed: "Variados",
        catAssembly: "Línea de Ensamblaje",
        catSpinning: "Metal Spinning",
        catMolding: "Moldeo de Silicona",
        catFiber: "Fibra de Vidrio",
        catFounders: "Emprendedores Latinos",
        lblDrones: "Drones",
        dscDrones: "Construcción, configuración y vuelo de drones: guías paso a paso, componentes y pruebas en campo.",
        lblRockets: "Cohetería experimental",
        dscRockets: "Diseño, construcción y lanzamiento de cohetes amateur, motores y sistemas de recuperación.",
        lblAero: "Aeromodelismo",
        dscAero: "Aviones y alas fijas de radiocontrol: construcción, ajustes y vuelo.",
        lblAi: "Inteligencia Artificial",
        dscAi: "Visión artificial, detección de objetos y vuelo autónomo aplicados a drones y robótica.",
        lblPrinters: "Impresión 3D",
        dscPrinters: "Impresión de piezas, chasis y soportes a medida para drones y prototipos.",
        lblChem: "Química aplicada",
        dscChem: "Materiales, resinas, adhesivos y procesos químicos útiles en la fabricación.",
        lblMixed: "Variados",
        dscMixed: "Procesos de taller, herramientas y técnicas de fabricación que no encajan en una sola categoría.",
        lblAssembly: "Línea de ensamblaje (Assembly Line)",
        dscAssembly: "Producción en serie: ensamblaje de electrónica, PCBA, SMT y control de calidad en fábrica.",
        lblSpinning: "Repujado de metal por rotación (Metal Spinning)",
        dscSpinning: "Para fabricar componentes metálicos redondos o cónicos, como carcasas, soportes o piezas mecánicas del dron.",
        lblMolding: "Moldeo de plástico y resina (Plastic & Resin Molding)",
        dscMolding: "Para crear soportes de cámara, protectores, cajas para electrónica, tapas y piezas personalizadas del dron.",
        lblFiber: "Moldeo de fibra de vidrio (Fiberglass Molding)",
        dscFiber: "Para fabricar el fuselaje, carcasas, cubiertas y otras partes ligeras y resistentes del dron.",
        lblFounders: "Emprendedores Latinos",
        dscFounders: "Historias, ideas y negocios de emprendedores de Latinoamérica.",
      },
      guides: {
        book: "Libro",
        thesis: "Trabajo de grado",
        guide: "Guía",
        read: "Leer documento",
        download: "Descargar PDF",
        bookCopy: "Obra de referencia que cubre el diseño, los principios de navegación y las aplicaciones de los drones.",
        upcCopy: "Memoria de TFG con el proceso completo de diseño y construcción de un dron, paso a paso.",
        upvCopy: "Documento técnico sobre el diseño y la fabricación de un prototipo de dron, de la idea al prototipo.",
        diyCopy: "Guía introductoria sobre construcción de drones, piezas, fabricación y pasos clave para un proyecto DIY.",
      },
      manufacturers: {
        intro: "Conoce algunas de las principales compañías que diseñan, fabrican y desarrollan drones y tecnología UAV alrededor del mundo.",
        visitSite: "Visitar sitio",
        seeAll: "Ver todos los fabricantes",
        seeLess: "Ver menos",
      },
      communities: {
        visit: "Visitar comunidad",
        seeAll: "Ver todas las comunidades",
        seeLess: "Ver menos",
      },
      form: {
        intro: "Ya seas principiante o experto, aquí encontrarás personas, recursos y oportunidades para crecer en el mundo de los drones.",
        newsletter: "Newsletter",
        newsletterCopy: "Recibe noticias, cursos, eventos exclusivos para la comunidad.",
        emailPlaceholder: "Tu correo electrónico",
      },
      footer: {
        navigation: "Navegación",
        resources: "Recursos",
        community: "Comunidad",
        guides: "Guías",
        manuals: "Manuales",
        software: "Software",
        plans: "Planes",
        tutorials: "Tutoriales",
        faq: "Preguntas frecuentes",
        members: "Miembros",
        groups: "Grupos",
        gallery: "Galería",
        blog: "Blog",
        rules: "Normas",
        terms: "Términos y condiciones",
        privacy: "Privacidad",
        contact: "Contacto",
        rights: "© 2026 Drones Latinoamérica. Todos los derechos reservados.",
      },
      ui: {
        language: "Idioma",
        spanish: "Español",
        english: "English",
        langLabel: "Cambiar idioma",
      },
      seo: {
        title: "Drones Latinoamérica | Comunidad, cursos y marketplace",
        description:
          "Comunidad de pilotos, constructores e innovadores de drones en Latinoamérica. Cursos, proyectos, foro, eventos, recursos y marketplace.",
      },
    },

    en: {
      nav: {
        home: "Home",
        community: "Community",
        courses: "Courses",
        projects: "Projects",
        forum: "Forum",
        events: "Events",
        marketplace: "Marketplace",
        resources: "Resources",
      },
      actions: {
        search: "Search",
        join: "Join Free",
        joinUpper: "JOIN FREE",
        exploreWorkshops: "EXPLORE WORKSHOPS",
        joinCommunity: "JOIN THE COMMUNITY",
        searchPlaceholder: "Courses, projects, pilots, events...",
        searchLabel: "Search Drones Latin America",
        openMenu: "Open menu",
        mainNav: "Main navigation",
        subscribe: "Subscribe",
      },
      hero: {
        eyebrow: "Welcome to Drones Latin America",
        title: "We connect, teach, and build the future of drones in Latin America",
        copy: "The largest community for drone pilots, builders, engineers, and innovators in the region.",
        members: "Members",
        courses: "Courses & workshops",
        projects: "Projects",
        countries: "Countries",
        posts: "Posts",
      },
      sections: {
        kickerTraining: "Applied training",
        kickerSimulators: "Drone simulators",
        kickerDemos: "Interactive demos",
        kickerGear: "Gear & components",
        kickerNews: "Google News",
        kickerActivity: "Recent activity",
        kickerWatch: "Learn by watching",
        kickerLibrary: "Library",
        kickerDirectory: "UAV directory",
        kickerNetwork: "Drone network",
        kickerNextGen: "Next-gen UAV",
        courses: "Courses & workshops",
        simulators: "Drone simulators for every level",
        vision: "Computer Vision with Webcam",
        marketplace: "Featured marketplace",
        news: "News & Updates",
        forum: "Featured forum",
        videos: "Recommended videos & channels",
        guides: "Guides & Manuals",
        manufacturers: "Drone Manufacturers & Companies",
        communities: "Other communities",
        beBig: "Be part of something big",
        sponsors: "Partners & sponsors",
        allPrograms: "See all programs",
        moreNews: "See more news",
        goForum: "Go to the forum",
        mainCategories: "Main categories",
      },
      courses: {
        basic: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",
        simulation: "Simulation",
        online: "Online",
        hours2: "◷ 2 hours",
        hours4: "◷ 4 hours",
        hours5: "◷ 5 hours",
        hours8: "◷ 8 hours",
        intro: "Introduction to Drones",
        pixhawk: "Pixhawk for Beginners",
        fixedWing: "Fixed-Wing UAV Building",
        photogrammetry: "Drone Photogrammetry",
      },
      simulators: {
        intro: "Train, explore, and sharpen your skills with simulators designed for every stage of your learning.",
        customTitle: "Need a custom simulator?",
        customCopy: "We build simulators with custom-modeled cities or scenarios for training, demos, and special projects.",
        freeTitle: "Try the game for free",
        freeCopy: "A free basic simulator so you can test the controls and experience flying a drone.",
        tilesTitle: "Simulator with Google Photorealistic 3D Tiles",
        tilesCopy: "Explore real cities in 3D with Google data. A hyper-realistic environment to plan and train.",
        proTitle: "Custom Professional Simulator",
        proCopy: "Simulate your city with advanced physics, challenging missions, and tailor-made professional scenarios.",
        quote: "Request a quote",
        tryFree: "Try it free now",
        open: "Open simulator",
        askSale: "Ask about purchase",
      },
      vision: {
        intro: "Explore three levels of computer vision and object tracking. Try interactive demos straight from your webcam or request a custom solution.",
        basicTitle: "OpenCV Basics",
        basicCopy: "Show it a shape on paper and it will tell you what it sees while tracking it in real time.",
        yoloTitle: "YOLO + OpenCV",
        yoloCopy: "Detects objects and drawings such as cars, planes, and cups, then tracks them.",
        customTitle: "Custom Computer Vision",
        customCopy: "Development of custom systems with C++, OpenCV, and YOLO for professional projects.",
        customNeed: "Need a custom solution?",
        customNeedCopy: "We build tailor-made computer vision systems for drones, robotics, traffic, security, and automation.",
        demoBasic: "Try the OpenCV Demo",
        demoYolo: "Try the YOLO + OpenCV Demo",
        requestQuote: "Request a quote",
      },
      marketplace: {
        viewProducts: "View products",
        viewResources: "View resources",
        drones: "Drones",
        radios: "Radios & controllers",
        controllers: "Flight controllers",
        cameras: "Cameras & sensors",
        accessories: "Accessories",
        simulators: "Simulators",
        goggles: "Goggles & Video",
        motors: "Motors & Batteries",
        gps: "GPS & Navigation",
        power: "Power & ESC",
        frame: "Frame",
        props: "Propellers",
        computers: "Flight computers",
        printers: "3D Printers",
        guards: "Drone guards",
      },
      news: {
        defense: "Defense",
        regulation: "Regulation",
        technology: "Technology",
        war: "War & defense",
        civil: "Civil safety",
        videoDefense: "Video · Defense",
        videoFpv: "Video · FPV",
        readMore: "Read more",
        watchVideo: "Watch video",
        footnote: "News items link to their original sources.",
        seeAll: "See all news",
        seeLess: "See less",
      },
      forum: {
        title: "Drones Latin America Community",
        copy: "Join our forum, share experiences, ask questions, and connect with other drone enthusiasts across Latin America.",
        visit: "Visit the forum",
      },
      videos: {
        seeAll: "See all videos",
        seeLess: "See less",
        empty: "There are no videos in this category yet.",
        catDrones: "Drones",
        catRockets: "Rockets",
        catAero: "RC Aircraft",
        catAi: "Artificial Intelligence",
        catPrinters: "3D Printers",
        catChem: "Chemistry",
        catMixed: "Mixed",
        catAssembly: "Assembly Line",
        catSpinning: "Metal Spinning",
        catMolding: "Resin Molding",
        catFiber: "Fiberglass",
        catFounders: "Latin Founders",
        lblDrones: "Drones",
        dscDrones: "Building, configuring, and flying drones: step-by-step guides, components, and field tests.",
        lblRockets: "Experimental rocketry",
        dscRockets: "Design, construction, and launch of amateur rockets, motors, and recovery systems.",
        lblAero: "RC aircraft",
        dscAero: "Radio-controlled planes and fixed wings: building, tuning, and flying.",
        lblAi: "Artificial Intelligence",
        dscAi: "Computer vision, object detection, and autonomous flight applied to drones and robotics.",
        lblPrinters: "3D printing",
        dscPrinters: "Printing custom parts, frames, and mounts for drones and prototypes.",
        lblChem: "Applied chemistry",
        dscChem: "Materials, resins, adhesives, and chemical processes useful in manufacturing.",
        lblMixed: "Mixed",
        dscMixed: "Workshop processes, tools, and manufacturing techniques that don't fit a single category.",
        lblAssembly: "Assembly Line",
        dscAssembly: "Mass production: electronics assembly, PCBA, SMT, and factory quality control.",
        lblSpinning: "Metal Spinning",
        dscSpinning: "To make round or conical metal components, such as housings, mounts, or mechanical drone parts.",
        lblMolding: "Plastic & Resin Molding",
        dscMolding: "To create camera mounts, guards, electronics enclosures, covers, and custom drone parts.",
        lblFiber: "Fiberglass Molding",
        dscFiber: "To build the fuselage, housings, covers, and other lightweight, strong drone parts.",
        lblFounders: "Latin Founders",
        dscFounders: "Stories, ideas, and businesses from entrepreneurs across Latin America.",
      },
      guides: {
        book: "Book",
        thesis: "Thesis",
        guide: "Guide",
        read: "Read document",
        download: "Download PDF",
        bookCopy: "A reference work covering drone design, navigation principles, and applications.",
        upcCopy: "Final-degree thesis with the complete drone design and build process, step by step.",
        upvCopy: "Technical document on designing and manufacturing a drone prototype, from idea to prototype.",
        diyCopy: "Introductory guide to drone building, parts, manufacturing, and key steps for a DIY project.",
      },
      manufacturers: {
        intro: "Meet some of the leading companies that design, manufacture, and develop drones and UAV technology worldwide.",
        visitSite: "Visit site",
        seeAll: "See all manufacturers",
        seeLess: "See less",
      },
      communities: {
        visit: "Visit community",
        seeAll: "See all communities",
        seeLess: "See less",
      },
      form: {
        intro: "Whether you're a beginner or an expert, here you'll find people, resources, and opportunities to grow in the drone world.",
        newsletter: "Newsletter",
        newsletterCopy: "Get news, courses, and exclusive events for the community.",
        emailPlaceholder: "Your email address",
      },
      footer: {
        navigation: "Navigation",
        resources: "Resources",
        community: "Community",
        guides: "Guides",
        manuals: "Manuals",
        software: "Software",
        plans: "Plans",
        tutorials: "Tutorials",
        faq: "FAQ",
        members: "Members",
        groups: "Groups",
        gallery: "Gallery",
        blog: "Blog",
        rules: "Rules",
        terms: "Terms & conditions",
        privacy: "Privacy",
        contact: "Contact",
        rights: "© 2026 Drones Latin America. All rights reserved.",
      },
      ui: {
        language: "Language",
        spanish: "Español",
        english: "English",
        langLabel: "Change language",
      },
      seo: {
        title: "Drones Latin America | Community, courses and marketplace",
        description:
          "A community of drone pilots, builders, and innovators in Latin America. Courses, projects, forum, events, resources, and marketplace.",
      },
    },
  };

  // ---- Construcción de los diccionarios es <-> en -------------------------
  const flatten = (obj, prefix, out) => {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const path = prefix ? `${prefix}.${key}` : key;
      if (value && typeof value === "object") {
        flatten(value, path, out);
      } else {
        out[path] = String(value);
      }
    });
    return out;
  };

  const flatEs = flatten(translations.es, "", {});
  const flatEn = flatten(translations.en, "", {});

  // Mapa texto-español -> texto-inglés (se ignoran las claves cuyo texto es
  // idéntico en ambos idiomas: no hay nada que intercambiar).
  const ES_TO_EN = new Map();
  Object.keys(flatEs).forEach((key) => {
    const es = flatEs[key];
    const en = flatEn[key];
    if (en && es !== en && !ES_TO_EN.has(es)) {
      ES_TO_EN.set(es, en);
    }
  });

  // ---- Recorrido del DOM --------------------------------------------------
  // El HTML está escrito en español, así que guardamos el texto original de
  // cada nodo y lo restauramos al volver a español.
  const originals = new WeakMap();
  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA"]);

  const shouldSkip = (node) => {
    let el = node.parentElement;
    while (el) {
      if (SKIP_TAGS.has(el.tagName) || el.hasAttribute("data-i18n-skip")) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  };

  const translateTextNodes = (lang) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let current = walker.nextNode();
    while (current) {
      nodes.push(current);
      current = walker.nextNode();
    }

    nodes.forEach((node) => {
      if (!node.nodeValue || !node.nodeValue.trim()) {
        return;
      }
      if (shouldSkip(node)) {
        return;
      }

      let original = originals.get(node);
      if (original === undefined) {
        original = node.nodeValue;
        originals.set(node, original);
      }

      if (lang === "es") {
        if (node.nodeValue !== original) {
          node.nodeValue = original;
        }
        return;
      }

      const trimmed = original.trim();
      const translated = ES_TO_EN.get(trimmed);
      if (translated) {
        node.nodeValue = original.replace(trimmed, translated);
      }
    });
  };

  // Atributos que también contienen texto visible o accesible.
  const ATTRS = [
    "placeholder",
    "aria-label",
    "title",
    "alt",
    "data-label-more",
    "data-label-less",
    "data-video-label",
    "data-video-description",
  ];

  const attrOriginals = new WeakMap();

  const translateAttributes = (lang) => {
    ATTRS.forEach((attr) => {
      document.querySelectorAll(`[${attr}]`).forEach((el) => {
        let store = attrOriginals.get(el);
        if (!store) {
          store = {};
          attrOriginals.set(el, store);
        }
        if (store[attr] === undefined) {
          store[attr] = el.getAttribute(attr) || "";
        }

        const original = store[attr];
        if (!original) {
          return;
        }

        if (lang === "es") {
          el.setAttribute(attr, original);
          return;
        }

        const translated = ES_TO_EN.get(original.trim());
        if (translated) {
          el.setAttribute(attr, translated);
        }
      });
    });
  };

  // ---- SEO: lang, title, description, hreflang ---------------------------
  const applyDocumentMeta = (lang) => {
    const dict = translations[lang] || translations[DEFAULT_LANG];
    document.documentElement.setAttribute("lang", lang);

    if (dict.seo && dict.seo.title) {
      document.title = dict.seo.title;
    }
    const meta = document.querySelector('meta[name="description"]');
    if (meta && dict.seo && dict.seo.description) {
      meta.setAttribute("content", dict.seo.description);
    }
  };

  // ---- Selector de idioma -------------------------------------------------
  const updateSwitcherUI = (lang) => {
    document.querySelectorAll("[data-lang-current]").forEach((el) => {
      el.textContent = lang.toUpperCase();
    });
    document.querySelectorAll("[data-lang-option]").forEach((el) => {
      const isActive = el.getAttribute("data-lang-option") === lang;
      el.classList.toggle("is-active", isActive);
      el.setAttribute("aria-checked", String(isActive));
    });
    document.querySelectorAll("[data-lang-heading]").forEach((el) => {
      const dict = translations[lang] || translations[DEFAULT_LANG];
      el.textContent = dict.ui.language;
    });
  };

  const closeMenus = () => {
    document.querySelectorAll("[data-lang-menu]").forEach((menu) => {
      menu.hidden = true;
    });
    document.querySelectorAll("[data-lang-toggle]").forEach((toggle) => {
      toggle.setAttribute("aria-expanded", "false");
    });
  };

  let currentLang = DEFAULT_LANG;

  const setLanguage = (lang, { persist = true } = {}) => {
    if (SUPPORTED.indexOf(lang) === -1) {
      lang = DEFAULT_LANG;
    }
    currentLang = lang;

    translateTextNodes(lang);
    translateAttributes(lang);
    applyDocumentMeta(lang);
    updateSwitcherUI(lang);

    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (error) {
        /* modo privado: se ignora */
      }
    }

    // Vuelve a pintar widgets que generan texto desde JS (filtro de videos).
    if (typeof window.reapplyVideoFilter === "function") {
      window.reapplyVideoFilter();
    }

    document.dispatchEvent(new CustomEvent("languagechange", { detail: { lang } }));
  };

  const readInitialLang = () => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang");
    if (fromUrl && SUPPORTED.indexOf(fromUrl) !== -1) {
      return fromUrl;
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.indexOf(stored) !== -1) {
        return stored;
      }
    } catch (error) {
      /* sin acceso a localStorage */
    }
    return DEFAULT_LANG;
  };

  const init = () => {
    // Desplegable (escritorio)
    document.querySelectorAll("[data-lang-toggle]").forEach((toggle) => {
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        const wrapper = toggle.closest("[data-lang-switch]");
        const menu = wrapper && wrapper.querySelector("[data-lang-menu]");
        if (!menu) {
          return;
        }
        const willOpen = menu.hidden;
        closeMenus();
        menu.hidden = !willOpen;
        toggle.setAttribute("aria-expanded", String(willOpen));
      });
    });

    // Opciones (escritorio y móvil comparten data-lang-option)
    document.querySelectorAll("[data-lang-option]").forEach((option) => {
      option.addEventListener("click", (event) => {
        event.preventDefault();
        setLanguage(option.getAttribute("data-lang-option"));
        closeMenus();
      });
    });

    document.addEventListener("click", closeMenus);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenus();
      }
    });

    setLanguage(readInitialLang(), { persist: false });
  };

  window.DLI18n = {
    setLanguage,
    getLanguage: () => currentLang,
    translations,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
