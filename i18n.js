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
        assemblyBadge: "Armado paso a paso",
        assemblyTitle: "Simulador de Ensamblado",
        assemblyCopy: "Arma un dron pieza por pieza en 3D: monta los componentes, conecta el cableado y prueba el vuelo.",
        fixedWingBadge: "Nuevo · Ala fija",
        fixedWingTitle: "DroneLab Fixed Wing",
        fixedWingCopy: "Construye un avión FPV de ala fija paso a paso, explora sus componentes en 3D y practica desde la estación de piloto.",
        quote: "Pedir presupuesto",
        tryFree: "Probar gratis ahora",
        open: "Abrir simulador",
        askSale: "Preguntar por venta",
        seeAll: "Ver todos los simuladores",
        seeLess: "Ver menos",
      },
      designEngineering: {
        kicker: "Recursos técnicos",
        title: "Diseño e Ingeniería",
        intro: "Planos, esquemas y modelos técnicos para diseñar, construir y comprender cada componente de un dron. Explora recursos profesionales y aprende cómo se integran la mecánica, la electrónica y el software.",
        categoriesLabel: "Categorías de diseño e ingeniería para drones",
        aviationBadge: "Aeronáutica",
        electronicsBadge: "Electrónica",
        circuitsBadge: "Circuitos",
        assemblyBadge: "Ensamblaje",
        blueprintsTitle: "Planos técnicos",
        blueprintsCopy: "Planos técnicos con medidas, vistas y dimensiones para drones de ala fija, multirrotores y VTOL.",
        blueprintsAction: "Ver planos",
        wiringTitle: "Diagramas de cableado",
        wiringCopy: "Aprende cómo conectar correctamente los componentes eléctricos y electrónicos de un dron.",
        wiringAction: "Ver diagramas",
        schematicsTitle: "Esquemas electrónicos",
        schematicsCopy: "Comprende los circuitos, componentes electrónicos y conexiones internas de los sistemas de un dron.",
        schematicsAction: "Ver esquemas",
        explodedTitle: "Vistas de despiece",
        explodedCopy: "Explora cada componente y descubre cómo se ensamblan las diferentes partes de un dron.",
        explodedAction: "Ver despiece",
        back: "Volver a Diseño e Ingeniería",
        what: "Qué encontrarás",
        use: "Cómo utilizar este recurso",
        safety: "Antes de construir",
        safetyCopy: "Verifica siempre las especificaciones del fabricante y la compatibilidad eléctrica y mecánica antes de construir o energizar un sistema.",
        blueprintsPageIntro: "Aprende a interpretar vistas, cotas y proporciones para convertir una idea de aeronave en una estructura construible.",
        wiringPageIntro: "Organiza la distribución de potencia y señales para conectar cada componente de forma clara, segura y mantenible.",
        schematicsPageIntro: "Analiza cómo circulan la energía y las señales mediante símbolos y conexiones normalizadas.",
        explodedPageIntro: "Estudia la posición y el orden de montaje de cada pieza antes de iniciar el ensamblaje.",
        blueprintItem1: "Vistas superior, lateral y frontal",
        blueprintItem2: "Cotas, ejes y referencias de escala",
        blueprintItem3: "Configuraciones de ala fija, multirrotor y VTOL",
        wiringItem1: "Distribución de batería y alimentación",
        wiringItem2: "Conexiones entre controladora, ESC y motores",
        wiringItem3: "Señales de receptor, GPS y periféricos",
        schematicItem1: "Símbolos eléctricos esenciales",
        schematicItem2: "Rutas de potencia, tierra y señal",
        schematicItem3: "Bloques funcionales del sistema de vuelo",
        explodedItem1: "Orden correcto de las capas del chasis",
        explodedItem2: "Ubicación de electrónica, motores y cámara",
        explodedItem3: "Tornillería, separadores y puntos de fijación",
        blueprintsUse: "Comienza por identificar la escala y las vistas ortogonales. Después, relaciona cada cota con el material y el proceso de fabricación previsto.",
        wiringUse: "Sigue primero las líneas de potencia y luego las señales. Comprueba polaridad, voltaje y capacidad de corriente antes de conectar la batería.",
        schematicsUse: "Lee el esquema por bloques: alimentación, control, sensores y actuadores. Usa las referencias comunes para seguir cada señal.",
        explodedUse: "Revisa la secuencia desde la placa inferior hasta la cubierta. Agrupa fijaciones y separadores antes de montar los módulos electrónicos.",
      },
      designLibrary: {
        common: {
          home: "Inicio",
          section: "Diseño e Ingeniería",
          libraryNav: "Bibliotecas de Diseño e Ingeniería",
          filters: "Filtrar por tema",
          clearFilters: "Limpiar filtros",
          example: "EJEMPLO",
          viewExample: "Ver ejemplo",
          viewDocument: "Ver diagrama",
          download: "Descargar",
          reference: "Documento de referencia",
          noResults: "No encontramos resultados",
          noResultsCopy: "Prueba otra búsqueda o elimina los filtros seleccionados.",
          illustrative: "Ejemplo ilustrativo",
          disclaimer: "Este ejemplo es demostrativo. No es un documento técnico verificado ni está disponible para descarga.",
          close: "Cerrar",
          contributeKicker: "Biblioteca colaborativa",
          formTitle: "Enviar un diseño para revisión",
          formIntro: "Tu archivo no se publicará automáticamente. El equipo administrativo lo revisará antes de incorporarlo a la biblioteca.",
          fullName: "Nombre completo",
          email: "Correo electrónico",
          country: "País (opcional)",
          category: "Categoría",
          designTitle: "Título del diseño",
          description: "Descripción",
          file: "Archivo adjunto",
          fileHelp: "Un archivo PDF, RAR o ZIP de hasta 3 MB.",
          chooseFile: "Seleccionar archivo",
          noFile: "Ningún archivo seleccionado",
          rights: "Confirmo que tengo derecho a compartir este material y autorizo su revisión para una posible publicación.",
          required: "Campo obligatorio",
          submit: "Enviar para revisión",
          sending: "Enviando…",
          success: "Tu contribución fue recibida y quedó pendiente de revisión.",
          serviceUnavailable: "El servicio de recepción todavía no está configurado. Inténtalo de nuevo cuando el administrador active el correo.",
          genericError: "No pudimos enviar el archivo. Revisa los datos e inténtalo de nuevo.",
          invalidFile: "Selecciona un archivo PDF, RAR o ZIP válido.",
          largeFile: "El archivo supera el máximo permitido de 3 MB.",
          searchAria: "Buscar documentos por título o descripción",
          menuAria: "Cambiar de biblioteca",
        },
        categories: {
          blueprints: {
            title: "Planos técnicos",
            intro: "Explora planos técnicos con medidas, vistas y dimensiones para drones de ala fija, multirrotores, VTOL e híbridos.",
            search: "Buscar planos…",
            filterOptions: ["Ala fija", "Multirrotor", "VTOL", "Híbridos"],
            exampleTitle: "Plano de un cuadricóptero",
            exampleDescription: "Ejemplo ilustrativo de un plano técnico que muestra las dimensiones y la estructura de un dron.",
            exampleTags: ["Multirrotor"],
            invite: "¿Tienes planos técnicos de drones? Compártelos con nuestra comunidad y ayuda a otros constructores.",
            inviteButton: "Enviar mis planos",
          },
          wiring: {
            title: "Diagramas de cableado",
            intro: "Consulta diagramas que explican las conexiones de potencia y señales entre los componentes eléctricos de un dron.",
            search: "Buscar diagramas…",
            filterOptions: ["Alimentación", "Controladora", "Motores", "Comunicaciones"],
            exampleTitle: "Cableado del ecosistema CubePilot",
            exampleDescription: "Cómo se conectan físicamente los componentes de un dron: controladora Cube, GPS RTK, motores, ESC, batería, sensores, cámara y telemetría.",
            exampleTags: ["Alimentación", "Controladora", "Motores", "Comunicaciones"],
            invite: "¿Has creado diagramas de conexiones para drones? Comparte tus conocimientos con otros aficionados.",
            inviteButton: "Enviar mi diagrama",
          },
          schematics: {
            title: "Esquemas electrónicos",
            intro: "Comprende circuitos, componentes y señales mediante esquemas electrónicos organizados por función.",
            search: "Buscar esquemas…",
            filterOptions: ["Alimentación", "Sensores", "Control", "Comunicaciones"],
            exampleTitle: "Circuito electrónico de un dron",
            exampleDescription: "Ejemplo ilustrativo de un circuito electrónico utilizado para explicar el funcionamiento de los sistemas de un dron.",
            exampleTags: ["Control"],
            invite: "¿Tienes esquemas electrónicos que puedan ayudar a otros constructores? Comparte tus diseños.",
            inviteButton: "Enviar mi esquema",
          },
          exploded: {
            title: "Vistas de despiece",
            intro: "Estudia cómo se relacionan y ensamblan el chasis, los motores, la electrónica y las demás piezas de un dron.",
            search: "Buscar vistas de despiece…",
            filterOptions: ["Chasis", "Motores", "Electrónica", "Ensamblaje completo"],
            documents: [
              {
                title: "Vista explotada isométrica de un cuadricóptero FPV",
                description: "Despiece acotado con la posición de cada pieza: marco de fibra de carbono, motores 2212 920KV, ESC de 30 A, controladora de vuelo, PDB, GPS, batería LiPo, gimbal y hélices, con las rutas de cableado y la lista de materiales.",
                tags: ["Chasis", "Motores", "Electrónica", "Ensamblaje completo"],
              },
              {
                title: "Vista explotada de un dron de ala fija",
                description: "Despiece de un ala fija de 1500 mm de envergadura: fuselaje y cuadernas, conjunto del ala con largueros y actuadores de alerón, estabilizadores, motor sin escobillas de 980 kV con estator y bobinas, ESC, bahía de aviónica, GPS, batería LiPo de 5000 mAh, tren de aterrizaje y cámara de 4K en cárdan de 3 ejes.",
                tags: ["Chasis", "Motores", "Electrónica", "Ensamblaje completo"],
              },
            ],
            invite: "¿Has elaborado vistas de despiece o guías visuales de ensamblaje? Compártelas con nuestra comunidad.",
            inviteButton: "Enviar mi diseño",
          },
        },
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
        computers: "Computadoras de vuelo",
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
        catCarbon: "Fibra de Carbono",
        lblCarbon: "Moldeo de fibra de carbono (Carbon Fiber Molding)",
        dscCarbon: "Para fabricar brazos, chasis y piezas estructurales ultraligeras y muy resistentes del dron.",
        catCnc: "CNC",
        lblCnc: "Control numérico por computadora (CNC)",
        dscCnc: "Para mecanizar y cortar con precisión piezas de chasis, soportes y moldes del dron.",
        catPlans: "Planos",
        lblPlans: "Diseño y Planos",
        dscPlans: "Planos, modelado y diseño de piezas: del boceto al archivo listo para fabricar.",
        catElec: "Electrónica",
        lblElec: "Electrónica",
        dscElec: "Circuitos, soldadura, sensores y alimentación: la electrónica que hace volar al dron.",
        catTurbine: "Turbinas",
        lblTurbine: "Turbinas y motores a reacción",
        dscTurbine: "Construcción y pruebas de microturbinas y turborreactores caseros, paso a paso.",
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
      makers: {
        country: "País: China",
        dji: "Drones de consumo, fotografía aérea, drones profesionales e industriales.",
        autel: "Fotografía aérea, drones profesionales, inspección e industria.",
        jouav: "Drones industriales, VTOL, mapping, inspección y UAV profesionales.",
        ehang: "eVTOL, aeronaves autónomas, movilidad aérea y tecnología UAV.",
        keku: "Fabricación de drones, OEM/ODM y drones personalizados.",
        space: "Fabricación de drones, OEM/ODM, drones personalizados e industriales.",
        sanray: "Drones industriales, drones de carga pesada y soluciones UAV personalizadas.",
        loong: "Drones agrícolas, industriales, logística, VTOL y fabricación OEM/ODM.",
        visitArrow: "Visitar sitio →",
      },
      features: {
        communityTitle: "Comunidad",
        communityCopy: "Comparte, aprende y crece junto a otros pilotos.",
        eventsTitle: "Eventos y encuentros",
        eventsCopy: "Participa en retos online y presenciales.",
        resourcesCopy: "Manuales, guías, planos y tutoriales.",
        skillsTitle: "Mejora tus habilidades",
        skillsCopy: "Practica, analiza y perfecciona cada vuelo.",
        trainCopy: "Entrena en entornos controlados antes de volar en campo.",
        levelsCopy: "Desde principiantes hasta pilotos avanzados.",
        joinCommunityLink: "Únete a la comunidad",
        visitCommunityArrow: "Visitar comunidad →",
      },
      visionUi: {
        privateTitle: "Privado y seguro",
        privateCopy: "El video se procesa localmente y no se almacena.",
        levelsTitle: "Para todos los niveles",
        levelsCopy: "Desde demostraciones básicas hasta proyectos avanzados.",
        handsTitle: "Aprendizaje práctico",
        handsCopy: "Experimenta con visión artificial desde el navegador.",
        tailoredTitle: "Soluciones a medida",
        tailoredCopy: "Desarrollos personalizados para proyectos profesionales.",
        bulletCpp: "Detección personalizada con C++",
        bulletTracking: "Tracking y análisis avanzado",
        bulletSolutions: "Soluciones para drones, robótica y tráfico",
        easy: "Fácil",
        practicalGuide: "Guía práctica",
        tryFree: "Pruébalo gratis",
        circles: "Círculos",
        triangles: "Triángulos",
        cups: "Tazas y objetos",
        position: "Posición:",
        positionXY: "Posición (x, y):",
      },
      docsCat: {
        catDocDrones: "Drones",
        lblDocDrones: "Drones",
        dscDocDrones: "Libros, trabajos de grado y guías para diseñar y construir drones paso a paso.",
        catDocRadar: "Radares",
        lblDocRadar: "Radares",
        dscDocRadar: "Proyectos de código abierto para detectar aeronaves y drones: hardware, firmware y software.",
        openProject: "Ver proyecto en GitHub →",
        tagProject: "Proyecto abierto",
        radar1: "AERIS-10 — Radar de hasta 20 km",
        radar1d: "Diseño abierto de radar con circuitos, PCB, antenas, firmware y software. Dos versiones: AERIS-10N (3 km) y AERIS-10E (20 km) de alcance de diseño, con procesamiento digital de señales, FPGA e interfaz en Python.",
        radar2: "Passive Radar — Detección de aviones por reflejos",
        radar2d: "Radar pasivo con receptor PlutoSDR y antenas que detecta reflejos de señales de radio. Su autor lo usó para seguir aviones sobre París.",
        radar3: "DeFli — Receptor de aviación tripulada y no tripulada",
        radar3d: "Guía de hardware para recibir señales ADS-B de aviones, Remote ID de drones y otras señales de radio.",
      },
      guidesUi: {
        readGuide: "Leer guía →",
        readDoc: "Leer documento →",
        downloadPdf: "Descargar PDF →",
        seeAllGuides: "Ver todas las Guías y Manuales",
      },
      newsItems: {
        h1: "Ucrania usa drones de medio alcance para presionar la logística en Crimea",
        d1: "La campaña busca aislar rutas, puertos y suministros estratégicos en la península ocupada.",
        h2: "Cambios en reglas para drones llegarán en 2026",
        d2: "El reporte resume cambios previstos en normas para pilotos recreativos y comerciales.",
        h3: "DJI Matrice 400 refuerza el mercado de drones empresariales",
        d3: "La plataforma ofrece hasta 59 minutos de vuelo, 6 kg de carga y sensores avanzados para inspección.",
        h4: "FBI incauta drones cerca de estadios y advierte multas de hasta $100,000",
        d4: "Las restricciones temporales de vuelo alrededor de sedes deportivas elevan la vigilancia a pilotos.",
        h5: "Zelenskyy promete llevar la guerra de vuelta a Rusia tras oleada de drones",
        d5: "El reporte sigue ataques con drones contra territorio ruso y objetivos logísticos vinculados a Crimea.",
        h6: "Un ataque ruso con drones en Sumy deja víctimas civiles",
        d6: "El caso muestra cómo los drones siguen marcando el impacto humanitario y operativo del conflicto.",
        h7: "Cómo la industria militar ucraniana usa drones e impresoras 3D para combatir a Rusia",
        d7: "Reportaje sobre la producción de drones e impresión 3D en la industria de defensa ucraniana.",
        h8: "¿Por qué los drones FPV llevan alambres metálicos o resortes al frente?",
        d8: "Explicación de para qué sirven los alambres y resortes frontales en los drones FPV.",
      },
      reels: {
        spinning: "Repujado de metal por rotación (metal spinning)",
        molding: "Moldeo de silicona para colada de resina",
        fiber: "Laminado de fibra de vidrio",
        assembly: "Línea de ensamblaje en fábrica",
        founders: "Emprendedores latinos: ideas y negocios",
        workshop: "Proceso de taller y fabricación",
        dip: "Inserción de componentes DIP (through-hole) en fábrica",
        psu: "Proceso de fabricación de fuentes de poder",
        battery: "Fabricación profesional de baterías para teléfonos",
        quality: "Control de calidad y tecnología en la línea de producción",
        pcbaFull: "Fábrica de PCBA a máxima producción",
        pcbaSmt: "Fabricación de PCBA y ensamblaje SMT profesional",
        factoryReal: "Grabación real dentro de una fábrica de electrónica",
        ict: "Pruebas en circuito (ICT) en la línea de producción",
        pcbLine: "Fábrica de PCB con línea de producción SMT",
        psu3000: "Cómo se fabrica una fuente de poder de 3000W",
        oem: "Fabricación de PCBA OEM por contrato",
        appliances: "Fabricante profesional de PCBA para electrodomésticos",
        changzhou: "Fábrica propia de electrónica en Changzhou",
        safeTitle: "Seguro y confiable",
        chuyka: "Detector de drones Chuyka para seguridad civil",
        amesh: "Drones con red A-Mesh para coordinación aérea",
        ground: "Drones que emergen directamente del suelo",
        shenzhen: "Fábrica de drones económicos en Shenzhen, China",
        carbon: "Laminado de fibra de carbono",
        instagram: "Reel recomendado de Instagram",
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
        assemblyBadge: "Step-by-step build",
        assemblyTitle: "Assembly Simulator",
        assemblyCopy: "Build a drone part by part in 3D: mount the components, wire them up and test the flight.",
        fixedWingBadge: "New · Fixed wing",
        fixedWingTitle: "DroneLab Fixed Wing",
        fixedWingCopy: "Build a fixed-wing FPV aircraft step by step, explore its components in 3D, and practice from the pilot station.",
        quote: "Request a quote",
        tryFree: "Try it free now",
        open: "Open simulator",
        askSale: "Ask about purchase",
        seeAll: "See all simulators",
        seeLess: "See less",
      },
      designEngineering: {
        kicker: "Technical resources",
        title: "Design & Engineering",
        intro: "Blueprints, schematics, and technical models to design, build, and understand every drone component. Explore professional resources and learn how mechanics, electronics, and software work together.",
        categoriesLabel: "Drone design and engineering categories",
        aviationBadge: "Aeronautics",
        electronicsBadge: "Electronics",
        circuitsBadge: "Circuits",
        assemblyBadge: "Assembly",
        blueprintsTitle: "Technical blueprints",
        blueprintsCopy: "Technical drawings with measurements, views, and dimensions for fixed-wing, multirotor, and VTOL drones.",
        blueprintsAction: "View blueprints",
        wiringTitle: "Wiring diagrams",
        wiringCopy: "Learn how to correctly connect a drone's electrical and electronic components.",
        wiringAction: "View diagrams",
        schematicsTitle: "Electronic schematics",
        schematicsCopy: "Understand the circuits, electronic components, and internal connections in drone systems.",
        schematicsAction: "View schematics",
        explodedTitle: "Exploded views",
        explodedCopy: "Explore every component and discover how the different parts of a drone fit together.",
        explodedAction: "View exploded view",
        back: "Back to Design & Engineering",
        what: "What you will find",
        use: "How to use this resource",
        safety: "Before you build",
        safetyCopy: "Always check manufacturer specifications and electrical and mechanical compatibility before building or powering a system.",
        blueprintsPageIntro: "Learn to interpret views, dimensions, and proportions to turn an aircraft idea into a buildable structure.",
        wiringPageIntro: "Organize power and signal distribution to connect each component clearly, safely, and maintainably.",
        schematicsPageIntro: "Analyze how power and signals flow through standardized symbols and connections.",
        explodedPageIntro: "Study the position and assembly order of every part before starting the build.",
        blueprintItem1: "Top, side, and front views",
        blueprintItem2: "Dimensions, axes, and scale references",
        blueprintItem3: "Fixed-wing, multirotor, and VTOL configurations",
        wiringItem1: "Battery and power distribution",
        wiringItem2: "Connections between controller, ESCs, and motors",
        wiringItem3: "Receiver, GPS, and peripheral signals",
        schematicItem1: "Essential electrical symbols",
        schematicItem2: "Power, ground, and signal paths",
        schematicItem3: "Functional blocks of the flight system",
        explodedItem1: "Correct frame-layer order",
        explodedItem2: "Electronics, motor, and camera placement",
        explodedItem3: "Fasteners, standoffs, and mounting points",
        blueprintsUse: "Start by identifying the scale and orthographic views. Then relate each dimension to the intended material and manufacturing process.",
        wiringUse: "Follow the power lines first, then the signals. Check polarity, voltage, and current capacity before connecting the battery.",
        schematicsUse: "Read the schematic by blocks: power, control, sensors, and actuators. Use common references to trace each signal.",
        explodedUse: "Review the sequence from the lower plate to the cover. Group fasteners and standoffs before installing electronic modules.",
      },
      designLibrary: {
        common: {
          home: "Home",
          section: "Design & Engineering",
          libraryNav: "Design & Engineering libraries",
          filters: "Filter by topic",
          clearFilters: "Clear filters",
          example: "EXAMPLE",
          viewExample: "View example",
          viewDocument: "View diagram",
          download: "Download",
          reference: "Reference document",
          noResults: "No results found",
          noResultsCopy: "Try another search or remove the selected filters.",
          illustrative: "Illustrative example",
          disclaimer: "This is a demonstration example. It is not a verified technical document and is not available for download.",
          close: "Close",
          contributeKicker: "Collaborative library",
          formTitle: "Submit a design for review",
          formIntro: "Your file will not be published automatically. The administrative team will review it before adding it to the library.",
          fullName: "Full name",
          email: "Email address",
          country: "Country (optional)",
          category: "Category",
          designTitle: "Design title",
          description: "Description",
          file: "Attached file",
          fileHelp: "One PDF, RAR, or ZIP file up to 3 MB.",
          chooseFile: "Select file",
          noFile: "No file selected",
          rights: "I confirm that I have the right to share this material and authorize its review for possible publication.",
          required: "Required field",
          submit: "Submit for review",
          sending: "Sending…",
          success: "Your contribution was received and is pending review.",
          serviceUnavailable: "The submission service is not configured yet. Try again when the administrator activates email delivery.",
          genericError: "We could not send the file. Check the information and try again.",
          invalidFile: "Select a valid PDF, RAR, or ZIP file.",
          largeFile: "The file exceeds the 3 MB maximum.",
          searchAria: "Search documents by title or description",
          menuAria: "Switch library",
        },
        categories: {
          blueprints: {
            title: "Technical blueprints",
            intro: "Explore technical drawings with measurements, views, and dimensions for fixed-wing, multirotor, VTOL, and hybrid drones.",
            search: "Search blueprints…",
            filterOptions: ["Fixed wing", "Multirotor", "VTOL", "Hybrid"],
            exampleTitle: "Quadcopter blueprint",
            exampleDescription: "An illustrative technical drawing showing a drone's dimensions and structure.",
            exampleTags: ["Multirotor"],
            invite: "Do you have technical drone blueprints? Share them with our community and help other builders.",
            inviteButton: "Submit my blueprints",
          },
          wiring: {
            title: "Wiring diagrams",
            intro: "Browse diagrams explaining power and signal connections between a drone's electrical components.",
            search: "Search diagrams…",
            filterOptions: ["Power", "Flight controller", "Motors", "Communications"],
            exampleTitle: "CubePilot ecosystem wiring",
            exampleDescription: "How a drone's components are physically connected: Cube flight controller, RTK GPS, motors, ESCs, battery, sensors, camera and telemetry.",
            exampleTags: ["Power", "Flight controller", "Motors", "Communications"],
            invite: "Have you created drone connection diagrams? Share your knowledge with other enthusiasts.",
            inviteButton: "Submit my diagram",
          },
          schematics: {
            title: "Electronic schematics",
            intro: "Understand circuits, components, and signals through electronic schematics organized by function.",
            search: "Search schematics…",
            filterOptions: ["Power", "Sensors", "Control", "Communications"],
            exampleTitle: "Drone electronic circuit",
            exampleDescription: "An illustrative circuit schematic used to explain how a drone's systems work.",
            exampleTags: ["Control"],
            invite: "Do you have electronic schematics that could help other builders? Share your designs.",
            inviteButton: "Submit my schematic",
          },
          exploded: {
            title: "Exploded views",
            intro: "Study how a drone's frame, motors, electronics, and other parts relate to one another and fit together.",
            search: "Search exploded views…",
            filterOptions: ["Frame", "Motors", "Electronics", "Complete assembly"],
            documents: [
              {
                title: "FPV quadcopter isometric exploded view",
                description: "Dimensioned exploded view showing where each part goes: carbon fibre frame, 2212 920KV motors, 30 A ESCs, flight controller, PDB, GPS, LiPo battery, gimbal and propellers, with wiring routes and the bill of materials.",
                tags: ["Frame", "Motors", "Electronics", "Full assembly"],
              },
              {
                title: "Fixed-wing drone exploded view",
                description: "Exploded view of a 1500 mm wingspan fixed-wing aircraft: fuselage and formers, wing assembly with spars and aileron actuators, stabilisers, 980 kV brushless motor with stator and windings, ESC, avionics bay, GPS, 5000 mAh LiPo battery, landing gear and a 4K camera on a 3-axis gimbal.",
                tags: ["Frame", "Motors", "Electronics", "Full assembly"],
              },
            ],
            invite: "Have you created exploded views or visual assembly guides? Share them with our community.",
            inviteButton: "Submit my design",
          },
        },
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
        catCarbon: "Carbon Fiber",
        lblCarbon: "Carbon Fiber Molding",
        dscCarbon: "To build arms, frames, and ultra-light, very strong structural parts of the drone.",
        catCnc: "CNC",
        lblCnc: "Computer Numerical Control (CNC)",
        dscCnc: "To machine and cut frame parts, mounts and moulds for the drone with precision.",
        catPlans: "Blueprints",
        lblPlans: "Design & Blueprints",
        dscPlans: "Blueprints, modelling and part design: from sketch to a file ready to manufacture.",
        catElec: "Electronics",
        lblElec: "Electronics",
        dscElec: "Circuits, soldering, sensors and power: the electronics that get the drone flying.",
        catTurbine: "Turbines",
        lblTurbine: "Turbines & jet engines",
        dscTurbine: "Building and testing home-made microturbines and turbojets, step by step.",
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
      makers: {
        country: "Country: China",
        dji: "Consumer drones, aerial photography, professional and industrial drones.",
        autel: "Aerial photography, professional drones, inspection and industry.",
        jouav: "Industrial drones, VTOL, mapping, inspection and professional UAVs.",
        ehang: "eVTOL, autonomous aircraft, air mobility and UAV technology.",
        keku: "Drone manufacturing, OEM/ODM and custom drones.",
        space: "Drone manufacturing, OEM/ODM, custom and industrial drones.",
        sanray: "Industrial drones, heavy-lift drones and custom UAV solutions.",
        loong: "Agricultural and industrial drones, logistics, VTOL and OEM/ODM manufacturing.",
        visitArrow: "Visit site →",
      },
      features: {
        communityTitle: "Community",
        communityCopy: "Share, learn and grow alongside other pilots.",
        eventsTitle: "Events & meetups",
        eventsCopy: "Take part in online and in-person challenges.",
        resourcesCopy: "Manuals, guides, blueprints and tutorials.",
        skillsTitle: "Sharpen your skills",
        skillsCopy: "Practice, review and perfect every flight.",
        trainCopy: "Train in controlled environments before flying in the field.",
        levelsCopy: "From beginners to advanced pilots.",
        joinCommunityLink: "Join the community",
        visitCommunityArrow: "Visit community →",
      },
      visionUi: {
        privateTitle: "Private and secure",
        privateCopy: "Video is processed locally and never stored.",
        levelsTitle: "For every level",
        levelsCopy: "From basic demos to advanced projects.",
        handsTitle: "Hands-on learning",
        handsCopy: "Experiment with computer vision right from your browser.",
        tailoredTitle: "Tailor-made solutions",
        tailoredCopy: "Custom development for professional projects.",
        bulletCpp: "Custom detection with C++",
        bulletTracking: "Advanced tracking and analysis",
        bulletSolutions: "Solutions for drones, robotics and traffic",
        easy: "Easy",
        practicalGuide: "Practical guide",
        tryFree: "Try it free",
        circles: "Circles",
        triangles: "Triangles",
        cups: "Cups and objects",
        position: "Position:",
        positionXY: "Position (x, y):",
      },
      docsCat: {
        catDocDrones: "Drones",
        lblDocDrones: "Drones",
        dscDocDrones: "Books, theses and guides to design and build drones step by step.",
        catDocRadar: "Radar",
        lblDocRadar: "Radar",
        dscDocRadar: "Open-source projects to detect aircraft and drones: hardware, firmware and software.",
        openProject: "View project on GitHub →",
        tagProject: "Open project",
        radar1: "AERIS-10 — Radar with up to 20 km range",
        radar1d: "An open radar design with circuits, PCB, antennas, firmware and software. Two versions: AERIS-10N (3 km) and AERIS-10E (20 km) design range, using digital signal processing, an FPGA and a Python interface.",
        radar2: "Passive Radar — Spotting planes from their reflections",
        radar2d: "A passive radar using a PlutoSDR receiver and antennas to detect radio signal reflections. Its author used it to track planes over Paris.",
        radar3: "DeFli — Manned and unmanned aviation receiver",
        radar3d: "A hardware guide to receive ADS-B signals from aircraft, drone Remote ID and other radio signals.",
      },
      guidesUi: {
        readGuide: "Read guide →",
        readDoc: "Read document →",
        downloadPdf: "Download PDF →",
        seeAllGuides: "See all Guides & Manuals",
      },
      newsItems: {
        h1: "Ukraine uses medium-range drones to squeeze logistics in Crimea",
        d1: "The campaign aims to cut off strategic routes, ports and supplies on the occupied peninsula.",
        h2: "Drone rule changes are coming in 2026",
        d2: "The report summarises upcoming changes to rules for recreational and commercial pilots.",
        h3: "DJI Matrice 400 strengthens the enterprise drone market",
        d3: "The platform offers up to 59 minutes of flight, 6 kg payload and advanced inspection sensors.",
        h4: "FBI seizes drones near stadiums and warns of fines up to $100,000",
        d4: "Temporary flight restrictions around sports venues increase scrutiny of pilots.",
        h5: "Zelenskyy vows to take the war back to Russia after a wave of drones",
        d5: "The report tracks drone attacks on Russian territory and logistics targets linked to Crimea.",
        h6: "A Russian drone attack on Sumy leaves civilian casualties",
        d6: "The case shows how drones keep shaping the humanitarian and operational impact of the conflict.",
        h7: "How Ukraine's military industry uses drones and 3D printers to fight Russia",
        d7: "A report on drone production and 3D printing in Ukraine's defence industry.",
        h8: "Why do FPV drones carry metal wires or springs at the front?",
        d8: "An explanation of what the front wires and springs on FPV drones are for.",
      },
      reels: {
        spinning: "Metal spinning",
        molding: "Silicone moulds for resin casting",
        fiber: "Fiberglass lamination",
        assembly: "Factory assembly line",
        founders: "Latin founders: ideas and businesses",
        workshop: "Workshop and manufacturing process",
        dip: "DIP (through-hole) component insertion in a factory",
        psu: "Power supply manufacturing process",
        battery: "Professional phone battery manufacturing",
        quality: "Quality control and technology on the production line",
        pcbaFull: "PCBA factory running at full capacity",
        pcbaSmt: "Professional PCBA manufacturing and SMT assembly",
        factoryReal: "Real footage from inside an electronics factory",
        ict: "In-circuit testing (ICT) on the production line",
        pcbLine: "PCB factory with an SMT production line",
        psu3000: "How a 3000W power supply is made",
        oem: "PCBA OEM contract manufacturing",
        appliances: "Professional PCBA manufacturer for home appliances",
        changzhou: "In-house electronics factory in Changzhou",
        safeTitle: "Safe and reliable",
        chuyka: "Chuyka drone detector for civil security",
        amesh: "Drones with an A-Mesh network for aerial coordination",
        ground: "Drones that emerge straight from the ground",
        shenzhen: "Low-cost drone factory in Shenzhen, China",
        carbon: "Carbon fiber lamination",
        instagram: "Recommended Instagram reel",
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

  // En el HTML un párrafo puede ocupar varias líneas, así que su texto trae
  // saltos de línea e indentación en medio. Normalizamos los espacios para
  // que el texto del DOM coincida con el de las traducciones.
  const normalize = (value) => value.replace(/\s+/g, " ").trim();

  // Mapa texto-español -> texto-inglés (se ignoran las claves cuyo texto es
  // idéntico en ambos idiomas: no hay nada que intercambiar).
  const ES_TO_EN = new Map();
  Object.keys(flatEs).forEach((key) => {
    const es = normalize(flatEs[key]);
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
      const translated = ES_TO_EN.get(normalize(trimmed));
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
    "data-doc-label",
    "data-doc-description",
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

        const translated = ES_TO_EN.get(normalize(original));
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

    if (document.documentElement.hasAttribute("data-i18n-preserve-meta")) {
      return;
    }

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
    if (typeof window.reapplyDocFilter === "function") {
      window.reapplyDocFilter();
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
