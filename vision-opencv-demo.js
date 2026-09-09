(function () {
  const state = {
    webcam: null,
    running: false,
    paused: false,
    showContours: true,
    rafId: 0,
    lastFrameAt: performance.now(),
    frameIndex: 0,
    lastDetection: null,
    shapeTarget: "auto",
    cvReady: false,
  };

  const $ = (selector) => document.querySelector(selector);

  const els = {
    video: $("#camera-video"),
    canvas: $("#output-canvas"),
    workCanvas: $("#work-canvas"),
    status: $("#demo-status"),
    shape: $("#detected-shape"),
    confidence: $("#detected-confidence"),
    position: $("#detected-position"),
    tracking: $("#tracking-status"),
    fps: $("#fps-value"),
    start: $("#start-camera"),
    pause: $("#pause-camera"),
    stop: $("#stop-camera"),
    switch: $("#switch-camera"),
    contours: $("#toggle-contours"),
    shapeButtons: document.querySelectorAll("[data-shape-target]"),
  };

  // Ancho al que se reduce el frame para procesar (más rápido). El resultado
  // se reescala al tamaño real del canvas de salida.
  const WORK_WIDTH = 480;

  const setStatus = (message, tone = "") => {
    els.status.textContent = message;
    els.status.dataset.tone = tone;
  };

  const resetReadout = () => {
    els.shape.textContent = "Figura no reconocida";
    els.confidence.textContent = "0%";
    els.position.textContent = "-";
    els.tracking.textContent = "SIN SEGUIMIENTO";
  };

  const resizeCanvas = () => {
    const width = els.video.videoWidth || 960;
    const height = els.video.videoHeight || 540;
    if (els.canvas.width !== width || els.canvas.height !== height) {
      els.canvas.width = width;
      els.canvas.height = height;
    }
  };

  // ---- Carga de OpenCV.js -------------------------------------------------
  const waitForOpenCv = () =>
    new Promise((resolve, reject) => {
      const deadline = performance.now() + 30000; // 30 s de margen
      const check = () => {
        const cv = window.cv;
        // Según la versión, cv puede ser el módulo ya listo, una promesa
        // (factory) o un módulo que avisa con onRuntimeInitialized.
        if (cv && typeof cv.Mat === "function") {
          resolve(cv);
          return;
        }
        if (cv && typeof cv.then === "function") {
          cv.then((mod) => {
            window.cv = mod;
            resolve(mod);
          }).catch(reject);
          return;
        }
        if (cv && typeof cv === "object" && "onRuntimeInitialized" in cv) {
          cv.onRuntimeInitialized = () => resolve(window.cv);
          return;
        }
        if (performance.now() > deadline) {
          reject(new Error("No se pudo cargar OpenCV.js. Revisa tu conexión e inténtalo de nuevo."));
          return;
        }
        setTimeout(check, 60);
      };
      check();
    });

  // Carga OpenCV una sola vez (memoizada) y marca cvReady cuando está listo.
  let cvPromise = null;
  const loadCv = () => {
    if (!cvPromise) {
      cvPromise = waitForOpenCv().then((cv) => {
        state.cvReady = true;
        return cv;
      });
    }
    return cvPromise;
  };

  const targetLabel = {
    square: "CUADRADO",
    circle: "CÍRCULO",
    triangle: "TRIÁNGULO",
  };

  // Clasifica un contorno aproximado (número de vértices + circularidad).
  const classify = (vertices, circularity, aspect, convex) => {
    // Círculo: muy circular y con muchos vértices al aproximar.
    if (circularity >= 0.8 && vertices >= 5) {
      return { label: "CÍRCULO", confidence: Math.round(70 + circularity * 28) };
    }
    // Triángulo: 3 vértices.
    if (vertices === 3) {
      return { label: "TRIÁNGULO", confidence: convex ? 90 : 80 };
    }
    // Cuadrado / rectángulo: 4 (a veces 5) vértices.
    if ((vertices === 4 || vertices === 5) && aspect >= 0.55 && aspect <= 1.8) {
      const squareness = 1 - Math.min(1, Math.abs(aspect - 1));
      return { label: "CUADRADO", confidence: Math.round(80 + squareness * 15) };
    }
    // Respaldo por circularidad para círculos algo irregulares.
    if (circularity >= 0.72 && vertices >= 5) {
      return { label: "CÍRCULO", confidence: Math.round(65 + circularity * 25) };
    }
    return null;
  };

  // Ejecuta la detección con OpenCV sobre el frame actual y devuelve la mejor
  // figura encontrada (en coordenadas del canvas de salida) o null.
  const detectShape = () => {
    const cv = window.cv;
    if (!cv || typeof cv.Mat !== "function") {
      return null;
    }

    const vw = els.video.videoWidth || 0;
    const vh = els.video.videoHeight || 0;
    if (!vw || !vh) {
      return null;
    }

    const width = WORK_WIDTH;
    const height = Math.max(180, Math.round(width * (vh / vw)));
    els.workCanvas.width = width;
    els.workCanvas.height = height;
    const wctx = els.workCanvas.getContext("2d", { willReadFrequently: true });
    wctx.drawImage(els.video, 0, 0, width, height);

    const src = cv.imread(els.workCanvas);
    const gray = new cv.Mat();
    const thresh = new cv.Mat();
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    let result = null;

    try {
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
      // Umbral adaptativo invertido: resalta trazos/figuras oscuras sobre
      // fondo claro, sin depender de una iluminación uniforme.
      cv.adaptiveThreshold(
        gray,
        thresh,
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY_INV,
        19,
        7
      );
      // Cierra pequeños huecos para que los contornos queden completos.
      const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(3, 3));
      cv.morphologyEx(thresh, thresh, cv.MORPH_CLOSE, kernel);
      kernel.delete();

      cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      const imgArea = width * height;
      const minArea = imgArea * 0.008;
      const maxArea = imgArea * 0.9;
      let bestArea = 0;

      for (let i = 0; i < contours.size(); i += 1) {
        const cnt = contours.get(i);
        const area = cv.contourArea(cnt, false);

        if (area < minArea || area > maxArea) {
          cnt.delete();
          continue;
        }

        const rect = cv.boundingRect(cnt);
        // Descarta contornos pegados al borde (mano, borde de la hoja, marco).
        const margin = 2;
        const touchesBorder =
          rect.x <= margin ||
          rect.y <= margin ||
          rect.x + rect.width >= width - margin ||
          rect.y + rect.height >= height - margin;
        if (touchesBorder) {
          cnt.delete();
          continue;
        }

        const peri = cv.arcLength(cnt, true);
        const approx = new cv.Mat();
        cv.approxPolyDP(cnt, approx, 0.035 * peri, true);
        const vertices = approx.rows;
        const circularity = peri > 0 ? (4 * Math.PI * area) / (peri * peri) : 0;
        const aspect = rect.width / Math.max(rect.height, 1);
        const convex = cv.isContourConvex(approx);

        const decision = classify(vertices, circularity, aspect, convex);

        if (decision) {
          const matchesTarget =
            state.shapeTarget === "auto" || decision.label === targetLabel[state.shapeTarget];
          if (matchesTarget && area > bestArea) {
            bestArea = area;
            const pts = [];
            for (let p = 0; p < approx.rows; p += 1) {
              pts.push({ x: approx.data32S[p * 2], y: approx.data32S[p * 2 + 1] });
            }
            result = {
              label: decision.label,
              confidence: Math.min(98, decision.confidence),
              bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
              points: pts,
            };
          }
        }

        approx.delete();
        cnt.delete();
      }
    } catch (error) {
      result = null;
    } finally {
      src.delete();
      gray.delete();
      thresh.delete();
      contours.delete();
      hierarchy.delete();
    }

    if (!result) {
      return null;
    }

    // Reescala del frame de trabajo al canvas de salida.
    const scaleX = els.canvas.width / width;
    const scaleY = els.canvas.height / height;
    return {
      label: result.label,
      confidence: result.confidence,
      bounds: {
        x: Math.round(result.bounds.x * scaleX),
        y: Math.round(result.bounds.y * scaleY),
        width: Math.round(result.bounds.width * scaleX),
        height: Math.round(result.bounds.height * scaleY),
      },
      points: result.points.map((point) => ({
        x: Math.round(point.x * scaleX),
        y: Math.round(point.y * scaleY),
      })),
    };
  };

  const drawDetection = (ctx, detection) => {
    const { bounds, label, confidence, points } = detection;
    const centerX = Math.round(bounds.x + bounds.width / 2);
    const centerY = Math.round(bounds.y + bounds.height / 2);

    if (state.showContours && points.length > 1) {
      ctx.save();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(126, 211, 33, 0.9)";
      ctx.beginPath();
      points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    ctx.lineWidth = 4;
    ctx.strokeStyle = "#51d20c";
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.fillStyle = "rgba(81, 210, 12, 0.95)";
    ctx.fillRect(bounds.x, Math.max(0, bounds.y - 34), Math.min(230, bounds.width + 70), 30);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px system-ui, sans-serif";
    ctx.fillText(`${label} ${confidence}%`, bounds.x + 10, Math.max(22, bounds.y - 12));

    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#51d20c";
    ctx.fill();

    els.shape.textContent = label;
    els.confidence.textContent = `${confidence}%`;
    els.position.textContent = `${centerX}, ${centerY}`;
    els.tracking.textContent = "SIGUIENDO";
  };

  const processFrame = () => {
    if (!state.running) {
      return;
    }

    if (state.paused) {
      state.rafId = requestAnimationFrame(processFrame);
      return;
    }

    resizeCanvas();
    const ctx = els.canvas.getContext("2d");
    ctx.drawImage(els.video, 0, 0, els.canvas.width, els.canvas.height);

    state.frameIndex += 1;
    if (state.cvReady && state.frameIndex % 3 === 0) {
      state.lastDetection = detectShape();
    }

    if (state.lastDetection) {
      drawDetection(ctx, state.lastDetection);
    } else {
      resetReadout();
    }

    const now = performance.now();
    els.fps.textContent = String(Math.round(1000 / Math.max(now - state.lastFrameAt, 1)));
    state.lastFrameAt = now;
    state.rafId = requestAnimationFrame(processFrame);
  };

  const startDemo = async () => {
    try {
      els.start.disabled = true;
      // Importante: pedimos la cámara ANTES de cualquier espera larga, para no
      // perder el gesto del usuario (algunos navegadores bloquean getUserMedia
      // si se llama después de un await prolongado, como la carga de OpenCV).
      setStatus("Solicitando permiso para usar la cámara...");
      state.webcam ||= new window.WebcamService(els.video);
      await state.webcam.start();
      state.running = true;
      state.paused = false;

      if (state.cvReady) {
        setStatus("Cámara activa. Muestra una hoja blanca con una figura dibujada en negro.", "ok");
      } else {
        setStatus("Cámara activa. Cargando OpenCV.js para el reconocimiento...", "ok");
        // OpenCV se carga en segundo plano; la detección arranca al estar listo.
        loadCv()
          .then(() => {
            if (state.running) {
              setStatus("Cámara activa. Muestra una hoja blanca con una figura dibujada en negro.", "ok");
            }
          })
          .catch((error) => setStatus(error.message, "error"));
      }

      processFrame();
    } catch (error) {
      setStatus(error.message, "error");
      els.start.disabled = false;
    }
  };

  const stopDemo = () => {
    state.running = false;
    state.paused = false;
    cancelAnimationFrame(state.rafId);
    state.webcam?.stop();
    els.canvas.getContext("2d").clearRect(0, 0, els.canvas.width, els.canvas.height);
    state.lastDetection = null;
    resetReadout();
    els.start.disabled = false;
    els.pause.textContent = "Pausar";
    setStatus("Cámara detenida.");
  };

  els.start?.addEventListener("click", startDemo);
  els.pause?.addEventListener("click", () => {
    state.paused = !state.paused;
    els.pause.textContent = state.paused ? "Reanudar" : "Pausar";
    setStatus(state.paused ? "Procesamiento en pausa." : "Procesamiento activo.", state.paused ? "" : "ok");
  });
  els.stop?.addEventListener("click", stopDemo);
  els.switch?.addEventListener("click", async () => {
    try {
      await state.webcam?.switchCamera();
      setStatus("Cámara cambiada.", "ok");
    } catch (error) {
      setStatus(error.message, "error");
    }
  });
  els.contours?.addEventListener("change", () => {
    state.showContours = els.contours.checked;
  });
  els.shapeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.shapeTarget = button.dataset.shapeTarget || "auto";
      state.lastDetection = null;
      els.shapeButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-pressed", String(isActive));
      });
      setStatus(
        state.shapeTarget === "auto"
          ? "Modo automático activo. Muestra una figura clara dentro de la hoja."
          : `Modo ${button.textContent.trim()} activo. Muestra esa figura dentro de la hoja.`,
        "ok"
      );
    });
  });

  // Precarga OpenCV en segundo plano al abrir la página (el <script async> ya
  // está descargándolo); así el reconocimiento suele estar listo al activar la
  // cámara, sin bloquear el botón ni el permiso de cámara.
  loadCv().catch(() => {
    /* si falla, la cámara igual funciona; se reintenta al activar */
  });

  window.addEventListener("pagehide", stopDemo);
  window.addEventListener("beforeunload", stopDemo);
})();
