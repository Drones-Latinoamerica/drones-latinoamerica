import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const port = Number(process.env.PORT || 4180);
const maxFileBytes = 3 * 1024 * 1024;
const minimumFillTimeMs = 3000;
const rateWindowMs = 15 * 60 * 1000;
const maxRequestsPerWindow = 5;
const testMode = process.env.CONTRIBUTION_TEST_MODE === "true";
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(currentDir, "..", "..");

const categoryConfig = {
  blueprints: {
    label: "Planos técnicos",
    subject: "Nuevo plano técnico recibido — Drones Latinoamérica",
  },
  wiring: {
    label: "Diagramas de cableado",
    subject: "Nuevo diagrama de cableado recibido — Drones Latinoamérica",
  },
  schematics: {
    label: "Esquemas electrónicos",
    subject: "Nuevo esquema electrónico recibido — Drones Latinoamérica",
  },
  exploded: {
    label: "Vistas de despiece",
    subject: "Nueva vista de despiece recibida — Drones Latinoamérica",
  },
};

const allowedOrigins = new Set(
  String(process.env.CONTRIBUTION_ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);

const mailConfigured = testMode || [
  "ADMIN_EMAIL",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASS",
  "SMTP_FROM",
].every((key) => Boolean(process.env[key]));

const transporter = testMode
  ? nodemailer.createTransport({ jsonTransport: true })
  : mailConfigured
    ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
    : null;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileBytes,
    files: 1,
    fields: 20,
    fieldSize: 20 * 1024,
  },
});

const requestsByIp = new Map();

const securityHeaders = (_request, response, next) => {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("X-Frame-Options", "SAMEORIGIN");
  response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  response.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
};

const verifyOrigin = (request, response, next) => {
  const origin = request.get("origin");
  if (origin && allowedOrigins.size && !allowedOrigins.has(origin)) {
    return response.status(403).json({ ok: false, code: "ORIGIN_REJECTED" });
  }
  return next();
};

const rateLimit = (request, response, next) => {
  const now = Date.now();
  const ip = request.ip || request.socket.remoteAddress || "unknown";
  const recent = (requestsByIp.get(ip) || []).filter((timestamp) => now - timestamp < rateWindowMs);
  if (recent.length >= maxRequestsPerWindow) {
    return response.status(429).json({ ok: false, code: "RATE_LIMITED" });
  }
  recent.push(now);
  requestsByIp.set(ip, recent);
  return next();
};

const cleanText = (value, maximum) => String(value || "").trim().slice(0, maximum);

const safeFilename = (value) => path.basename(String(value || "archivo"))
  .replace(/[\u0000-\u001f\u007f]/g, "")
  .replace(/[^a-zA-Z0-9._() -]/g, "_")
  .slice(0, 180);

const detectFileType = (buffer) => {
  if (buffer.length >= 5 && buffer.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    return { extension: "pdf", mime: "application/pdf" };
  }
  const zipSignatures = ["504b0304", "504b0506", "504b0708"];
  if (buffer.length >= 4 && zipSignatures.includes(buffer.subarray(0, 4).toString("hex"))) {
    return { extension: "zip", mime: "application/zip" };
  }
  const rar4 = "526172211a0700";
  const rar5 = "526172211a070100";
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature.startsWith(rar4) || signature === rar5) {
    return { extension: "rar", mime: "application/vnd.rar" };
  }
  return null;
};

const validateFields = (body) => {
  const values = {
    fullName: cleanText(body.fullName, 120),
    email: cleanText(body.email, 180).toLowerCase(),
    country: cleanText(body.country, 100),
    category: cleanText(body.category, 40),
    designTitle: cleanText(body.designTitle, 160),
    description: cleanText(body.description, 2000),
    rightsConfirmed: body.rightsConfirmed === "true",
    startedAt: Number(body.startedAt),
    website: cleanText(body.website, 200),
  };

  if (values.website) return { bot: true, values };
  if (!values.fullName || !values.designTitle || !values.description || !values.rightsConfirmed) return { error: "INVALID_FIELDS" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return { error: "INVALID_FIELDS" };
  if (!categoryConfig[values.category]) return { error: "INVALID_CATEGORY" };
  if (!Number.isFinite(values.startedAt) || Date.now() - values.startedAt < minimumFillTimeMs) return { error: "SPAM_CHECK_FAILED" };
  return { values };
};

app.disable("x-powered-by");
app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS || 0));
app.use(securityHeaders);

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, mailConfigured, testMode });
});

app.post(
  "/api/design-contributions",
  verifyOrigin,
  rateLimit,
  upload.single("file"),
  async (request, response, next) => {
    try {
      const validation = validateFields(request.body || {});
      if (validation.bot) return response.status(202).json({ ok: true });
      if (validation.error) return response.status(400).json({ ok: false, code: validation.error });
      if (!request.file) return response.status(400).json({ ok: false, code: "INVALID_FILE" });

      const detected = detectFileType(request.file.buffer);
      const originalExtension = path.extname(request.file.originalname).slice(1).toLowerCase();
      if (!detected || detected.extension !== originalExtension) {
        return response.status(400).json({ ok: false, code: "INVALID_FILE" });
      }
      if (!transporter || !mailConfigured) {
        return response.status(503).json({ ok: false, code: "SERVICE_UNAVAILABLE" });
      }

      const values = validation.values;
      const category = categoryConfig[values.category];
      const filename = safeFilename(request.file.originalname);
      const text = [
        "Nueva contribución pendiente de revisión.",
        "",
        `Categoría: ${category.label}`,
        `Nombre: ${values.fullName}`,
        `Correo: ${values.email}`,
        `País: ${values.country || "No indicado"}`,
        `Título: ${values.designTitle}`,
        "",
        "Descripción:",
        values.description,
        "",
        `Archivo: ${filename}`,
        `Tamaño: ${request.file.size} bytes`,
        "Derechos confirmados: Sí",
        "",
        "El archivo no ha sido publicado automáticamente.",
      ].join("\n");

      await transporter.sendMail({
        from: testMode ? "test@localhost" : process.env.SMTP_FROM,
        to: testMode ? "admin@localhost" : process.env.ADMIN_EMAIL,
        replyTo: values.email,
        subject: category.subject,
        text,
        attachments: [{
          filename,
          content: request.file.buffer,
          contentType: detected.mime,
        }],
      });

      return response.status(202).json({ ok: true, pendingReview: true });
    } catch (error) {
      return next(error);
    }
  },
);

app.use(express.static(repositoryRoot, {
  dotfiles: "ignore",
  extensions: ["html"],
  index: "index.html",
  maxAge: 0,
}));

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") return response.status(413).json({ ok: false, code: "FILE_TOO_LARGE" });
    return response.status(400).json({ ok: false, code: "INVALID_FILE" });
  }
  console.error("Contribution delivery failed:", error && error.message ? error.message : "Unknown error");
  return response.status(500).json({ ok: false, code: "DELIVERY_FAILED" });
});

app.listen(port, "127.0.0.1", () => {
  console.log(`Design contribution server listening on http://127.0.0.1:${port}`);
  if (!mailConfigured) console.warn("Email delivery is disabled until SMTP and ADMIN_EMAIL are configured.");
});
