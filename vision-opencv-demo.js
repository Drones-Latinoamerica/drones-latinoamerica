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

  // Resolución de trabajo: pequeña a propósito. Todo el análisis corre sobre
  // ~220px de ancho, lo que mantiene cada detección en pocos milisegundos y
  // evita que el video se congele.
  const WORK_WIDTH = 220;

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

  // ---- Utilidades de geometría -------------------------------------------

  const cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  // Envolvente convexa (monotone chain). Devuelve el polígono en orden.
  const convexHull = (points) => {
    if (points.length < 4) {
      return points.slice();
    }

    const sorted = points.slice().sort((a, b) => a.x - b.x || a.y - b.y);
    const lower = [];
    for (const point of sorted) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
        lower.pop();
      }
      lower.push(point);
    }

    const upper = [];
    for (let i = sorted.length - 1; i >= 0; i -= 1) {
      const point = sorted[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
        upper.pop();
      }
      upper.push(point);
    }

    return lower.slice(0, -1).concat(upper.slice(0, -1));
  };

  const perpendicularDistance = (point, start, end) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.hypot(dx, dy);
    if (!length) {
      return Math.hypot(point.x - start.x, point.y - start.y);
    }
    return Math.abs(dy * point.x - dx * point.y + end.x * start.y - end.y * start.x) / length;
  };

  // Ramer–Douglas–Peucker sobre una polilínea abierta.
  const rdp = (points, epsilon) => {
    if (points.length < 3) {
      return points;
    }

    let maxDistance = 0;
    let index = 0;
    const first = points[0];
    const last = points[points.length - 1];

    for (let i = 1; i < points.length - 1; i += 1) {
      const distance = perpendicularDistance(points[i], first, last);
      if (distance > maxDistance) {
        maxDistance = distance;
        index = i;
      }
    }

    if (maxDistance > epsilon) {
      const left = rdp(points.slice(0, index + 1), epsilon);
      const right = rdp(points.slice(index), epsilon);
      return left.slice(0, -1).concat(right);
    }

    return [first, last];
  };

  // Aproxima un polígono cerrado (equivalente a approxPolyDP de OpenCV).
  const approxClosedPolygon = (polygon, epsilon) => {
    if (polygon.length < 4) {
      return polygon.slice();
    }

    // Se parte el contorno cerrado en dos mitades usando el punto más lejano.
    let index = 0;
    let maxDistance = -1;
    for (let i = 1; i < polygon.length; i += 1) {
      const distance = (polygon[i].x - polygon[0].x) ** 2 + (polygon[i].y - polygon[0].y) ** 2;
      if (distance > maxDistance) {
        maxDistance = distance;
        index = i;
      }
    }

    const firstHalf = rdp(polygon.slice(0, index + 1), epsilon);
    const secondHalf = rdp(polygon.slice(index).concat([polygon[0]]), epsilon);
    return firstHalf.slice(0, -1).concat(secondHalf.slice(0, -1));
  };

  const polygonArea = (points) => {
    let area = 0;
    for (let i = 0; i < points.length; i += 1) {
      const next = points[(i + 1) % points.length];
      area += points[i].x * next.y - next.x * points[i].y;
    }
    return Math.abs(area) / 2;
  };

  const polygonPerimeter = (points) => {
    let perimeter = 0;
    for (let i = 0; i < points.length; i += 1) {
      const next = points[(i + 1) % points.length];
      perimeter += Math.hypot(next.x - points[i].x, next.y - points[i].y);
    }
    return perimeter;
  };

  // ---- Umbral de Otsu -----------------------------------------------------
  // Calcula automáticamente el punto de corte entre claro y oscuro, así que
  // funciona con distintas iluminaciones sin ajustes manuales.
  const otsuThreshold = (histogram, total) => {
    let sum = 0;
    for (let i = 0; i < 256; i += 1) {
      sum += i * histogram[i];
    }

    let sumBackground = 0;
    let weightBackground = 0;
    let maxVariance = -1;
    let threshold = 127;

    for (let i = 0; i < 256; i += 1) {
      weightBackground += histogram[i];
      if (!weightBackground) {
        continue;
      }
      const weightForeground = total - weightBackground;
      if (!weightForeground) {
        break;
      }

      sumBackground += i * histogram[i];
      const meanBackground = sumBackground / weightBackground;
      const meanForeground = (sum - sumBackground) / weightForeground;
      const variance = weightBackground * weightForeground * (meanBackground - meanForeground) ** 2;

      if (variance > maxVariance) {
        maxVariance = variance;
        threshold = i;
      }
    }

    return threshold;
  };

  // ---- Clasificación ------------------------------------------------------
  const targetLabel = {
    square: "CUADRADO",
    circle: "CÍRCULO",
    triangle: "TRIÁNGULO",
  };

  const classify = (vertices, circularity, aspect) => {
    // El orden importa: el círculo se comprueba primero porque su circularidad
    // (~0.9) es mayor que la de un cuadrado (~0.79).
    if (circularity >= 0.8 && vertices >= 5) {
      return { label: "CÍRCULO", confidence: Math.round(70 + circularity * 28) };
    }
    if (vertices === 3) {
      return { label: "TRIÁNGULO", confidence: 90 };
    }
    if ((vertices === 4 || vertices === 5) && aspect >= 0.55 && aspect <= 1.8) {
      const squareness = 1 - Math.min(1, Math.abs(aspect - 1));
      return { label: "CUADRADO", confidence: Math.round(80 + squareness * 15) };
    }
    if (circularity >= 0.72 && vertices >= 5) {
      return { label: "CÍRCULO", confidence: Math.round(65 + circularity * 25) };
    }
    return null;
  };

  // ---- Análisis de un frame (función pura sobre los píxeles) --------------
  // Recibe los datos RGBA y devuelve la figura encontrada en coordenadas del
  // frame de trabajo, o null. Separarlo del video lo hace fácil de probar.
  const analyzeFrame = (data, width, height) => {
    const pixels = width * height;

    // Gris + histograma en una sola pasada.
    const gray = new Uint8Array(pixels);
    const histogram = new Uint32Array(256);
    for (let i = 0; i < pixels; i += 1) {
      const p = i * 4;
      const value = (data[p] * 299 + data[p + 1] * 587 + data[p + 2] * 114) / 1000;
      const level = value | 0;
      gray[i] = level;
      histogram[level] += 1;
    }

    const threshold = otsuThreshold(histogram, pixels);
    // Primer plano = trazo oscuro sobre papel claro. El umbral de Otsu es
    // inclusivo (la clase oscura es [0..t]), por eso se compara con <=: con
    // figuras de un solo tono, usar < dejaría la máscara vacía.
    const mask = new Uint8Array(pixels);
    for (let i = 0; i < pixels; i += 1) {
      mask[i] = gray[i] <= threshold ? 1 : 0;
    }

    // Componentes conectados (relleno por inundación con pila de índices).
    const labels = new Int32Array(pixels);
    const stack = new Int32Array(pixels);
    const components = [];
    let nextLabel = 0;

    for (let start = 0; start < pixels; start += 1) {
      if (!mask[start] || labels[start]) {
        continue;
      }

      nextLabel += 1;
      let stackSize = 0;
      stack[stackSize++] = start;
      labels[start] = nextLabel;

      let count = 0;
      let minX = width;
      let minY = height;
      let maxX = -1;
      let maxY = -1;

      while (stackSize > 0) {
        const index = stack[--stackSize];
        const x = index % width;
        const y = (index - x) / width;

        count += 1;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

        if (x > 0) {
          const n = index - 1;
          if (mask[n] && !labels[n]) {
            labels[n] = nextLabel;
            stack[stackSize++] = n;
          }
        }
        if (x < width - 1) {
          const n = index + 1;
          if (mask[n] && !labels[n]) {
            labels[n] = nextLabel;
            stack[stackSize++] = n;
          }
        }
        if (y > 0) {
          const n = index - width;
          if (mask[n] && !labels[n]) {
            labels[n] = nextLabel;
            stack[stackSize++] = n;
          }
        }
        if (y < height - 1) {
          const n = index + width;
          if (mask[n] && !labels[n]) {
            labels[n] = nextLabel;
            stack[stackSize++] = n;
          }
        }
      }

      const touchesBorder = minX <= 0 || minY <= 0 || maxX >= width - 1 || maxY >= height - 1;
      components.push({ label: nextLabel, count, minX, minY, maxX, maxY, touchesBorder });
    }

    // Candidatos: ni pegados al borde (mano, fondo, marco) ni demasiado
    // pequeños/grandes. Se evalúan de mayor a menor tamaño.
    const minPixels = Math.max(40, pixels * 0.004);
    const maxPixels = pixels * 0.65;
    const candidates = components
      .filter((component) => {
        if (component.touchesBorder) return false;
        if (component.count < minPixels || component.count > maxPixels) return false;
        const boxWidth = component.maxX - component.minX + 1;
        const boxHeight = component.maxY - component.minY + 1;
        return boxWidth >= 12 && boxHeight >= 12;
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    for (const component of candidates) {
      // Puntos extremos por fila: suficientes para la envolvente convexa y
      // mucho más baratos que recorrer todos los píxeles del componente.
      const points = [];
      for (let y = component.minY; y <= component.maxY; y += 1) {
        let rowMin = -1;
        let rowMax = -1;
        const rowOffset = y * width;
        for (let x = component.minX; x <= component.maxX; x += 1) {
          if (labels[rowOffset + x] === component.label) {
            if (rowMin < 0) rowMin = x;
            rowMax = x;
          }
        }
        if (rowMin >= 0) {
          points.push({ x: rowMin, y });
          if (rowMax !== rowMin) {
            points.push({ x: rowMax, y });
          }
        }
      }

      if (points.length < 3) {
        continue;
      }

      const hull = convexHull(points);
      if (hull.length < 3) {
        continue;
      }

      const perimeter = polygonPerimeter(hull);
      const area = polygonArea(hull);
      if (!perimeter || !area) {
        continue;
      }

      const approx = approxClosedPolygon(hull, 0.035 * perimeter);
      const vertices = approx.length;
      const circularity = (4 * Math.PI * area) / (perimeter * perimeter);
      const boxWidth = component.maxX - component.minX + 1;
      const boxHeight = component.maxY - component.minY + 1;
      const aspect = boxWidth / boxHeight;

      const decision = classify(vertices, circularity, aspect);
      if (!decision) {
        continue;
      }

      if (state.shapeTarget !== "auto" && decision.label !== targetLabel[state.shapeTarget]) {
        continue;
      }

      return {
        label: decision.label,
        confidence: Math.min(98, decision.confidence),
        bounds: {
          x: component.minX,
          y: component.minY,
          width: boxWidth,
          height: boxHeight,
        },
        points: approx,
      };
    }

    return null;
  };

  // ---- Detección sobre el frame actual de la cámara -----------------------
  const detectShape = () => {
    const vw = els.video.videoWidth || 0;
    const vh = els.video.videoHeight || 0;
    if (!vw || !vh) {
      return null;
    }

    const width = WORK_WIDTH;
    const height = Math.max(120, Math.round(width * (vh / vw)));
    if (els.workCanvas.width !== width || els.workCanvas.height !== height) {
      els.workCanvas.width = width;
      els.workCanvas.height = height;
    }

    const ctx = els.workCanvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(els.video, 0, 0, width, height);
    const { data } = ctx.getImageData(0, 0, width, height);

    const found = analyzeFrame(data, width, height);
    if (!found) {
      return null;
    }

    // Reescala del frame de trabajo al canvas de salida.
    const scaleX = els.canvas.width / width;
    const scaleY = els.canvas.height / height;
    return {
      label: found.label,
      confidence: found.confidence,
      bounds: {
        x: Math.round(found.bounds.x * scaleX),
        y: Math.round(found.bounds.y * scaleY),
        width: Math.round(found.bounds.width * scaleX),
        height: Math.round(found.bounds.height * scaleY),
      },
      points: found.points.map((point) => ({
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
    if (state.frameIndex % 3 === 0) {
      try {
        state.lastDetection = detectShape();
      } catch (error) {
        state.lastDetection = null;
      }
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
      setStatus("Solicitando permiso para usar la cámara...");
      state.webcam ||= new window.WebcamService(els.video);
      await state.webcam.start();
      state.running = true;
      state.paused = false;
      setStatus("Cámara activa. Muestra una hoja blanca con una figura dibujada en negro.", "ok");
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

  window.addEventListener("pagehide", stopDemo);
  window.addEventListener("beforeunload", stopDemo);
})();
