import assert from "node:assert/strict";

const baseUrl = process.env.TEST_BASE_URL || "http://127.0.0.1:4180";

const createFields = () => ({
  fullName: "Prueba local",
  email: "test@example.com",
  country: "Canadá",
  category: "blueprints",
  designTitle: "Plano de prueba",
  description: "Archivo creado únicamente para validar el flujo local.",
  rightsConfirmed: "true",
  startedAt: String(Date.now() - 5000),
  website: "",
});

const createForm = (blob, filename) => {
  const form = new FormData();
  Object.entries(createFields()).forEach(([key, value]) => form.append(key, value));
  form.append("file", blob, filename);
  return form;
};

const routes = [
  ["/design-engineering/blueprints/", "blueprints"],
  ["/design-engineering/wiring-diagrams/", "wiring"],
  ["/design-engineering/schematics/", "schematics"],
  ["/design-engineering/exploded-view/", "exploded"],
];

const health = await fetch(`${baseUrl}/api/health`).then((response) => response.json());
assert.equal(health.ok, true);
assert.equal(health.testMode, true);

for (const [route, category] of routes) {
  const response = await fetch(`${baseUrl}${route}`);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, new RegExp(`data-library-category="${category}"`));
}

const validPdf = new Blob([Buffer.from("%PDF-1.4\n% local validation fixture\n%%EOF\n")], { type: "application/pdf" });
const validResponse = await fetch(`${baseUrl}/api/design-contributions`, {
  method: "POST",
  body: createForm(validPdf, "ejemplo.pdf"),
});
assert.equal(validResponse.status, 202);
assert.equal((await validResponse.json()).pendingReview, true);

const invalidPdf = new Blob([Buffer.from("not a pdf")], { type: "application/pdf" });
const invalidResponse = await fetch(`${baseUrl}/api/design-contributions`, {
  method: "POST",
  body: createForm(invalidPdf, "falso.pdf"),
});
assert.equal(invalidResponse.status, 400);
assert.equal((await invalidResponse.json()).code, "INVALID_FILE");

const oversizedZip = new Blob([
  Buffer.from([0x50, 0x4b, 0x03, 0x04]),
  Buffer.alloc((3 * 1024 * 1024) + 1),
], { type: "application/zip" });
const oversizedResponse = await fetch(`${baseUrl}/api/design-contributions`, {
  method: "POST",
  body: createForm(oversizedZip, "grande.zip"),
});
assert.equal(oversizedResponse.status, 413);
assert.equal((await oversizedResponse.json()).code, "FILE_TOO_LARGE");

console.log("Integration checks passed: 4 routes, valid submission, signature rejection, and 3 MB limit.");
