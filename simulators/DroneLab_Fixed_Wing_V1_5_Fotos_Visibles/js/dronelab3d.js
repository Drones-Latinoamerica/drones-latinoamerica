/* DroneLab · puente entre los modelos GLB de Blender y el simulador (app.js).
 *
 * app.js es un script clasico; este modulo ES publica su API en
 * window.DroneLab3D y avisa con el evento "dronelab3d-ready".
 *
 * Migracion progresiva: cada componente que ya tiene GLB se declara en
 * PART_MODELS y deja de dibujarse con la geometria procedural antigua.
 * Los que todavia no lo tienen siguen funcionando igual que antes, asi que
 * la aplicacion nunca queda a medias.
 */
import * as THREE from 'three';
import { GLTFLoader } from '../assets/vendor/three/loaders/GLTFLoader.js';
import { DRACOLoader } from '../assets/vendor/three/loaders/DRACOLoader.js';
import { RoomEnvironment } from '../assets/vendor/three/environments/RoomEnvironment.js';
import { PART_MODELS, MINIATURA_ALTERNATIVA, MINIATURA_ZOOM, MINIATURA_VISTA,
         hasModel, ESCALA } from './modelos.js?v=2.5.1';

export { THREE, PART_MODELS, hasModel, ESCALA };

const MODEL_DIR = 'assets/models/';
/* Version de los modelos. Los .glb tambien se cachean en el navegador, asi
 * que al regenerarlos hay que cambiarla o se sigue sirviendo el anterior. */
export const VERSION_MODELOS = '2.5.1';

/* ---------------------------------------------------------------- carga --- */
const draco = new DRACOLoader().setDecoderPath('assets/vendor/three/draco/');
const loader = new GLTFLoader().setDRACOLoader(draco);
const cache = new Map();

export function loadModel(name) {
  if (!cache.has(name)) {
    cache.set(name, new Promise((resolve, reject) => {
      loader.load(MODEL_DIR + name + '.glb?v=' + VERSION_MODELOS,
        (gltf) => resolve(gltf.scene),
        undefined,
        (err) => reject(new Error('No se pudo cargar ' + name + '.glb: ' + (err.message || err))));
    }));
  }
  return cache.get(name).then((scene) => scene.clone(true));
}

/* ------------------------------------------------------------- entorno --- */
let envMap = null;
export function getEnvironment(renderer) {
  if (!envMap) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
  }
  return envMap;
}

export function addStudioLights(scene) {
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 4, 5);
  const fill = new THREE.DirectionalLight(0xdbeaff, 0.55);
  fill.position.set(-4, 1.5, 2.5);
  const rim = new THREE.DirectionalLight(0xcfe6ff, 0.9);
  rim.position.set(-1.5, 2.5, -4);
  scene.add(key, fill, rim, new THREE.AmbientLight(0xffffff, 0.25));
}

export function frameObject(object, camera, fill = 0.75, dir = null) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z) || 1;
  const dist = (maxDim / (2 * Math.tan((camera.fov * Math.PI / 180) / 2))) / fill;
  // Encuadre 3/4 desde arriba-delante-derecha. Tras exportar a glTF Y-up,
  // el "arriba" del componente es -Z y su frente es +Y, asi que el eje se
  // compone 0.55*derecha + 0.65*arriba + 0.52*frente. Con el valor anterior
  // (+Z) la camara miraba el REVERSO de las placas: la controladora salia
  // como un rectangulo blanco de serigrafia en vez de su cara azul.
  const eje = new THREE.Vector3(...(dir || [0.55, 0.52, -0.65])).normalize();
  camera.position.copy(center).addScaledVector(eje, dist);
  camera.near = dist / 100;
  camera.far = dist * 100;
  camera.updateProjectionMatrix();
  camera.lookAt(center);
  return { center, size, dist };
}

/* ------------------------------------------- instancia colocada en el avion --- */
/* Posiciones de anclaje ya resueltas, para no reconstruir una pieza cada
 * vez que otra se cuelga de ella. Se vacia si cambia el registro. */
const anclajesResueltos = new Map();

export async function buildPart(id, _visitados) {
  const spec = PART_MODELS[id];
  if (!spec) return null;

  const model = await loadModel(spec.file);
  // Giro sobre el eje propio de la pieza, antes de orientarla en el avion.
  if (spec.spin) model.rotation.y = spec.spin;

  const holder = new THREE.Group();
  holder.name = 'part_' + id;
  holder.add(model);
  // Escala unica: conserva las proporciones reales entre componentes.
  holder.scale.setScalar(ESCALA);
  holder.rotation.set(...(spec.rot || [0, 0, 0]));
  holder.userData.partId = id;

  holder.userData.anchors = {};
  model.traverse((o) => {
    if (o.name && o.name.startsWith('A_')) holder.userData.anchors[o.name] = o;
  });

  if (spec.attach) {
    // Montaje por anclaje: la pieza se coloca haciendo coincidir su propio
    // punto de union con el de la pieza a la que va unida, como en el avion
    // real. Evita coordenadas a mano que se desincronizan.
    const visitados = _visitados || new Set();
    if (visitados.has(id)) {
      throw new Error('Montaje circular en ' + id);
    }
    visitados.add(id);
    const destino = await anchorPosition(spec.attach.to, spec.attach.anchor, visitados);
    holder.position.set(0, 0, 0);
    holder.updateMatrixWorld(true);
    const propio = holder.userData.anchors[spec.attach.mine];
    if (!propio) {
      throw new Error('La pieza ' + id + ' no tiene el anclaje ' + spec.attach.mine);
    }
    const desfase = propio.getWorldPosition(new THREE.Vector3());
    holder.position.copy(destino).sub(desfase);
    if (spec.attach.offset) holder.position.add(new THREE.Vector3(...spec.attach.offset));
  } else {
    holder.position.set(...(spec.pos || [0, 0, 0]));
  }

  holder.updateMatrixWorld(true);
  return holder;
}

/* Posicion en el espacio del simulador de un anclaje de una pieza. */
export async function anchorPosition(id, anchor, visitados) {
  const clave = id + '/' + anchor;
  if (anclajesResueltos.has(clave)) return anclajesResueltos.get(clave).clone();
  const pieza = await buildPart(id, visitados);
  if (!pieza) throw new Error('Pieza desconocida: ' + id);
  const nodo = pieza.userData.anchors[anchor];
  if (!nodo) throw new Error('La pieza ' + id + ' no tiene el anclaje ' + anchor);
  const p = nodo.getWorldPosition(new THREE.Vector3());
  anclajesResueltos.set(clave, p.clone());
  return p;
}

export function anchorWorldPosition(holder, anchorName) {
  const a = holder?.userData?.anchors?.[anchorName];
  if (!a) return null;
  return a.getWorldPosition(new THREE.Vector3());
}

/* ------------------------------------------------- miniaturas del banco ---
 * Se renderiza el MISMO GLB en un renderer compartido y se guarda el dataURL.
 * No hay archivos de imagen: la tarjeta nunca puede quedar desincronizada
 * del modelo ni salir en blanco como las fotografias de la version anterior.
 */
let thumbRenderer = null;
const thumbCache = new Map();
/* Estadisticas medidas en el momento de renderizar. Se calculan leyendo el
 * buffer de WebGL y no decodificando la imagen: img.decode() se queda
 * colgado cuando la pestana no esta visible, porque el navegador difiere el
 * decodificado. */
const thumbStats = new Map();

export function archivoDe(id) {
  return (PART_MODELS[id] && PART_MODELS[id].file) || MINIATURA_ALTERNATIVA[id] || null;
}

export async function renderThumbnail(name, size = 192) {
  if (thumbCache.has(name)) return thumbCache.get(name);
  if (!thumbRenderer) {
    thumbRenderer = new THREE.WebGLRenderer({
      antialias: true, alpha: true, preserveDrawingBuffer: true });
    thumbRenderer.setPixelRatio(1);
    thumbRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    thumbRenderer.outputColorSpace = THREE.SRGBColorSpace;
  }
  thumbRenderer.setSize(size, size, false);

  const scene = new THREE.Scene();
  scene.environment = getEnvironment(thumbRenderer);
  addStudioLights(scene);
  const model = await loadModel(name);
  scene.add(model);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.001, 100);
  frameObject(model, camera, 0.72 * (MINIATURA_ZOOM[name] || 1), MINIATURA_VISTA[name]);
  thumbRenderer.render(scene, camera);

  // Medir cobertura y brillo directamente del buffer, antes de nada mas.
  try {
    const gl = thumbRenderer.getContext();
    const px = new Uint8Array(size * size * 4);
    gl.readPixels(0, 0, size, size, gl.RGBA, gl.UNSIGNED_BYTE, px);
    let visibles = 0, suma = 0;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] > 24) { visibles++; suma += (px[i] + px[i + 1] + px[i + 2]) / 3; }
    }
    thumbStats.set(name, {
      cobertura: +(visibles / (size * size) * 100).toFixed(1),
      brillo: visibles ? Math.round(suma / visibles) : 0,
      pixeles: visibles,
    });
  } catch (e) {
    thumbStats.set(name, null);
  }

  const url = thumbRenderer.domElement.toDataURL('image/webp', 0.9);
  thumbCache.set(name, url);
  scene.remove(model);
  model.traverse((o) => { if (o.isMesh) o.geometry.dispose(); });
  return url;
}

/* --------------------------------------------- visor giratorio de ficha --- */
export function getThumbStats(name) { return thumbStats.get(name) || null; }

export class PartViewer {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.scene = new THREE.Scene();
    this.scene.environment = getEnvironment(this.renderer);
    addStudioLights(this.scene);
    this.camera = new THREE.PerspectiveCamera(30, 1, 0.001, 100);
    this.model = null;
    this.angle = 0;
    this.drag = null;
    this._bind();
  }

  _bind() {
    const c = this.canvas;
    c.style.touchAction = 'none';
    c.addEventListener('pointerdown', (e) => {
      this.drag = { x: e.clientX, a: this.angle };
      c.setPointerCapture(e.pointerId);
    });
    c.addEventListener('pointermove', (e) => {
      if (!this.drag) return;
      this.angle = this.drag.a + (e.clientX - this.drag.x) * 0.012;
      this.auto = false;
    });
    const stop = () => { this.drag = null; };
    c.addEventListener('pointerup', stop);
    c.addEventListener('pointercancel', stop);
  }

  async show(name) {
    if (this.actual === name) return;
    this.actual = name;
    const model = await loadModel(name);
    if (this.actual !== name) return;        // llego otra peticion mientras tanto
    if (this.model) {
      this.scene.remove(this.model);
      this.model.traverse((o) => { if (o.isMesh) o.geometry.dispose(); });
    }
    this.pivot = new THREE.Group();
    this.pivot.add(model);
    this.model = this.pivot;
    this.scene.add(this.pivot);
    this.auto = true;
    frameObject(model, this.camera, 0.68);
    this.start();
  }

  start() {
    if (this._running) return;
    this._running = true;
    const tick = () => {
      if (!this._running) return;
      this._raf = requestAnimationFrame(tick);
      const w = this.canvas.clientWidth || 160, h = this.canvas.clientHeight || 160;
      if (this.canvas.width !== w || this.canvas.height !== h) {
        this.renderer.setSize(w, h, false);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
      }
      if (this.auto) this.angle += 0.006;
      if (this.pivot) this.pivot.rotation.y = this.angle;
      this.renderer.render(this.scene, this.camera);
    };
    tick();
  }

  stop() { this._running = false; cancelAnimationFrame(this._raf); }

  /* Libera el contexto WebGL. Sin esto, crear un visor por componente agota
   * el limite de contextos del navegador (~16) y la pagina deja de pintar. */
  dispose() {
    this.stop();
    if (this.model) {
      this.scene.remove(this.model);
      this.model.traverse((o) => { if (o.isMesh) o.geometry.dispose(); });
      this.model = null;
    }
    this.renderer.dispose();
    const ext = this.renderer.getContext().getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
  }
}

/* ------------------------------------------------------------- publicar --- */
window.DroneLab3D = {
  THREE, PART_MODELS, MINIATURA_ALTERNATIVA, MINIATURA_ZOOM, MINIATURA_VISTA,
  hasModel, archivoDe,
  ESCALA, VERSION_MODELOS,
  loadModel, buildPart, anchorPosition, anchorWorldPosition, renderThumbnail,
  getThumbStats,
  getEnvironment, addStudioLights, frameObject, PartViewer,
};
window.dispatchEvent(new Event('dronelab3d-ready'));
