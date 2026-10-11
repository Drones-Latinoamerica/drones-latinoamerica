/* DroneLab - registro de modelos 3D y montaje del avion.
 *
 * Los GLB salen de Blender en metros reales. El simulador usa unidades
 * ilustrativas: el fuselaje original ocupa de z=-3.72 a z=+4.25, es decir
 * 7.97 unidades para 0.80 m reales. De ahi la escala unica:
 *
 *      ESCALA = 10 unidades por metro
 *
 * MONTAJE POR ANCLAJES
 * Solo el fuselaje tiene posicion absoluta. Cada pieza se coloca haciendo
 * coincidir uno de sus anclajes con el de la pieza a la que va unida, igual
 * que en el avion real. Asi no hay coordenadas calculadas a mano que se
 * desincronicen cuando cambia un modelo: si el ala crece, su raiz sigue
 * apoyada en la cuna del fuselaje.
 *
 * Ejes del simulador:  +X derecha, +Y arriba, -Z morro.
 * Ejes del modelo tras exportar a glTF Y-up: frente=+Y, arriba=-Z.
 * Por eso la orientacion estandar es rot=[-90,0,0] con spin=180.
 */

export const ESCALA = 10.0;          // unidades del simulador por metro

// Orientacion estandar: el frente de la pieza mira al morro del avion.
const AL_MORRO = { rot: [-Math.PI / 2, 0, 0], spin: Math.PI };
// Pieza cuyo frente mira a la cola (conectores hacia atras).
const A_LA_COLA = { rot: [Math.PI / 2, 0, 0], spin: 0 };
// Nota: con spin=0 el "arriba" del modelo acaba apuntando hacia -Y, es
// decir la pieza queda boca abajo. Toda pieza con arriba/abajo definido
// usa AL_MORRO, que es la unica orientacion que deja el modelo derecho.

/* Cada entrada:
 *   file     nombre del .glb en assets/models
 *   pos      posicion absoluta (solo la pieza raiz del montaje)
 *   attach   {to, anchor, mine, offset} para colocarla por su anclaje
 *   rot/spin orientacion
 *   real     ficha tecnica mostrada en la guia
 */
export const PART_MODELS = {
  // ------------------------------------------------- estructura principal
  body: {
    file: 'fuselaje', ...AL_MORRO,
    // Unica posicion absoluta: el morro del modelo sobresale 0.30 m (3 u)
    // por delante del origen, asi que -3.72 + 3.0 = -0.72.
    pos: [0, 0.99, -0.72],
    real: { 'Longitud': '800 mm', 'Seccion maestra': '86 x 112 mm',
            'Material': 'espuma EPO moldeada' },
  },
  spar: {
    file: 'larguero', ...AL_MORRO,
    attach: { to: 'body', anchor: 'A_wing', mine: 'A_center', offset: [0, -0.18, 0] },
    real: { 'Tubo': 'carbono O16 mm', 'Longitud': '190 mm' },
  },
  wingL: {
    file: 'ala', ...AL_MORRO,
    attach: { to: 'body', anchor: 'A_wing', mine: 'A_root' },
    real: { 'Envergadura': '550 mm', 'Perfil': 'NACA 4412',
            'Cuerda': '165 a 125 mm', 'Diedro': '3 grados' },
  },
  wingR: {
    file: 'ala_der', ...AL_MORRO,
    attach: { to: 'body', anchor: 'A_wing', mine: 'A_root' },
    real: { 'Envergadura': '550 mm', 'Perfil': 'NACA 4412',
            'Cuerda': '165 a 125 mm', 'Diedro': '3 grados' },
  },
  ailL: {
    file: 'aleron', ...AL_MORRO,
    attach: { to: 'wingL', anchor: 'A_aileron', mine: 'A_hinge' },
    real: { 'Cuerda': '26% de la del ala', 'Envergadura': '242 mm' },
  },
  ailR: {
    file: 'aleron_der', ...AL_MORRO,
    attach: { to: 'wingR', anchor: 'A_aileron', mine: 'A_hinge' },
    real: { 'Cuerda': '26% de la del ala', 'Envergadura': '242 mm' },
  },
  tailH: {
    file: 'estab_h', ...AL_MORRO,
    attach: { to: 'body', anchor: 'A_tail_h', mine: 'A_mount' },
    real: { 'Envergadura': '340 mm', 'Perfil': 'NACA 0010 simetrico' },
  },
  tailV: {
    file: 'estab_v', ...AL_MORRO,
    attach: { to: 'body', anchor: 'A_tail_v', mine: 'A_mount' },
    real: { 'Altura': '125 mm', 'Perfil': 'NACA 0010 simetrico' },
  },
  gear: {
    file: 'tren', ...AL_MORRO,
    attach: { to: 'body', anchor: 'A_gear_main', mine: 'A_mount' },
    real: { 'Via': '176 mm', 'Ruedas': 'O46 mm', 'Pata': 'alambre O4 mm' },
  },
  gearNose: {
    file: 'tren_morro', ...AL_MORRO,
    attach: { to: 'body', anchor: 'A_gear_nose', mine: 'A_mount' },
    real: { 'Rueda': 'O37 mm', 'Pata': 'alambre O4 mm',
            'Direccion': 'brazo acoplado al servo de timon' },
  },
  connectors: {
    file: 'conectores', ...AL_MORRO,
    // Juego de conectores dispuesto sobre la mesa, junto al avion: es
    // material de estudio, no una pieza que se atornille a la celula.
    pos: [2.70, -0.36, -1.45],
    real: { 'XT60': 'macho y hembra, 60 A', 'Bullet': '3.5 mm, 3 unidades',
            'Servo': 'JST 3 vias, paso 2.54 mm' },
  },

  // ------------------------------------------------------------ propulsion
  motorMount: {
    file: 'soporte_motor', ...AL_MORRO,
    attach: { to: 'body', anchor: 'A_firewall', mine: 'A_firewall' },
    real: { 'Mamparo': '52 x 56 mm', 'Separadores': 'nylon 9 mm',
            'Tornilleria': 'M3' },
  },
  motor: {
    file: 'motor', ...AL_MORRO,
    attach: { to: 'motorMount', anchor: 'A_motor', mine: 'A_mount' },
    real: { 'Campana': 'O27.8 x 27 mm', 'Eje': 'O3.17 mm',
            'Montaje': '16 / 19 mm', 'Fases': '3 x bullet 3.5 mm' },
  },
  prop: {
    file: 'helice', ...AL_MORRO,
    attach: { to: 'motor', anchor: 'A_shaft', mine: 'A_shaft' },
    real: { 'Diametro': '203 mm (8 pulgadas)', 'Paso': '152 mm (6 pulgadas)',
            'Palas': '2', 'Taladro': 'O6.35 mm' },
  },

  // ----------------------------------------------------------- electronica
  esc: {
    file: 'esc', ...A_LA_COLA,
    attach: { to: 'body', anchor: 'A_bay_fc', mine: 'A_mount',
              offset: [0.22, -0.02, -1.95] },
    real: { 'Corriente': '40 A continuos', 'Entrada': '2S a 4S LiPo',
            'BEC': '5 V / 3 A', 'Tamano': '68 x 26 x 10 mm' },
  },
  battery: {
    file: 'bateria', ...A_LA_COLA,
    attach: { to: 'body', anchor: 'A_bay_lipo', mine: 'A_mount' },
    real: { 'Quimica': 'LiPo 3S', 'Tension': '11.1 V nominal',
            'Capacidad': '2200 mAh', 'Conector': 'XT60 + balanceo JST-XH' },
  },
  fc: {
    file: 'fc', ...AL_MORRO,
    attach: { to: 'body', anchor: 'A_bay_fc', mine: 'A_mount' },
    real: { 'Placa': 'H743-WING, 85 x 42 mm', 'MCU': 'STM32H743',
            'Salidas': 'PWM + UART + I2C', 'Alimentacion': 'BEC separado' },
  },
  rx: {
    file: 'receptor', ...A_LA_COLA,
    attach: { to: 'body', anchor: 'A_bay_fc', mine: 'A_mount',
              offset: [-0.34, -0.10, 0.95] },
    real: { 'Enlace': 'ELRS 2.4 GHz', 'Interfaz': 'UART CRSF',
            'Alimentacion': '5 V' },
  },
  gpsMast: {
    file: 'mastil_gps', ...AL_MORRO,
    attach: { to: 'body', anchor: 'A_wing', mine: 'A_mount',
              offset: [0, -0.10, 1.90] },
    real: { 'Altura': '74 mm', 'Base': '32 x 32 mm', 'Tubo': 'carbono O7 mm' },
  },
  gps: {
    file: 'gps', ...A_LA_COLA,
    attach: { to: 'gpsMast', anchor: 'A_gps', mine: 'A_mount' },
    real: { 'GNSS': 'M10, hasta 4 constelaciones',
            'Compas': 'QMC5883L por I2C', 'Carcasa': '28 x 28 x 8 mm' },
  },
  servoL: {
    file: 'servo', ...AL_MORRO,
    attach: { to: 'wingL', anchor: 'A_servo', mine: 'A_mount' },
    real: { 'Par': '1.8 kg-cm a 6 V', 'Peso': '9 g', 'Senal': 'PWM 50 Hz' },
  },
  servoR: {
    file: 'servo', ...AL_MORRO,
    attach: { to: 'wingR', anchor: 'A_servo', mine: 'A_mount' },
    real: { 'Par': '1.8 kg-cm a 6 V', 'Peso': '9 g', 'Senal': 'PWM 50 Hz' },
  },
  servoE: {
    file: 'servo', ...AL_MORRO,
    attach: { to: 'body', anchor: 'A_tail_h', mine: 'A_mount',
              offset: [-0.27, -0.14, -0.55] },
    real: { 'Par': '1.8 kg-cm a 6 V', 'Peso': '9 g', 'Senal': 'PWM 50 Hz' },
  },
  servoRud: {
    file: 'servo', ...AL_MORRO,
    attach: { to: 'body', anchor: 'A_tail_h', mine: 'A_mount',
              offset: [0.28, -0.14, -0.48] },
    real: { 'Par': '1.8 kg-cm a 6 V', 'Peso': '9 g', 'Senal': 'PWM 50 Hz' },
  },
};

/* Encuadre de la miniatura para piezas muy alargadas o dominadas por un
 * cable: con el encuadre por defecto el cuerpo util sale diminuto. */
/* Direccion de camara para la miniatura, cuando el encuadre 3/4 estandar
 * deja la pieza de canto. El vector apunta del objeto hacia el ojo. */
export const MINIATURA_VISTA = {
  // El encuadre por defecto ya mira la cara util de cada pieza. Solo se
  // anota aqui lo que necesite un angulo distinto.
  conectores: [0.40, 0.35, -0.82],   // bandeja plana: casi en planta
};

export const MINIATURA_ZOOM = {
  receptor: 1.45, larguero: 1.15, esc: 1.15, bateria: 1.10, servo: 1.10,
};

/* Piezas sin GLB propio que reutilizan el de otra para su miniatura. */
export const MINIATURA_ALTERNATIVA = {
  rodL: 'conectores', rodR: 'conectores',
  rodE: 'conectores', rodRud: 'conectores',
};

export const hasModel = (id) =>
  Object.prototype.hasOwnProperty.call(PART_MODELS, id);
