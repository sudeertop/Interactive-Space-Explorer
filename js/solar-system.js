import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { BODY_CONTENT_FALLBACKS, BODY_GEOMETRY, OVERVIEW_FALLBACK } from "./bodies.js";
import { glowSprite, proceduralMap, ringMap } from "./textures.js";

/* ================================================================
   Güneş Sistemi'ni Keşfet — main interactive scene
   ================================================================ */

const canvas = document.getElementById("scene");
const labelLayer = document.getElementById("labels");
const panelBody = document.getElementById("panel-body");
const scaleNote = document.getElementById("scale-note");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const landingEmbed = new URLSearchParams(window.location.search).get("embed") === "landing";

/* ---------- renderer ------------------------------------------- */

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const maxAniso = renderer.capabilities.getMaxAnisotropy();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x05060a);

const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 4000);
camera.position.set(0, 46, 132);

/* The whole disc out to Neptune must fit the viewport at any aspect ratio —
   otherwise the outer planets are unreachable. Recomputed on resize until the
   user takes over the camera. */
const MAX_ORBIT = Math.max(...BODY_GEOMETRY.filter((b) => !b.parent).map((b) => b.orbitRadius));
let userTookOver = false;

function getSystemFrame() {
  const halfV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  const need = MAX_ORBIT + 7; // margin for the outermost label
  const d = Math.max((need / (halfV * camera.aspect)) * 1.05, need * 1.7);
  return {
    position: new THREE.Vector3(0, 0.35, 1).normalize().multiplyScalar(d),
    target: new THREE.Vector3(0, 0, 0),
  };
}

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.rotateSpeed = 0.42;
controls.zoomSpeed = 0.7;
controls.enablePan = false;
controls.minDistance = 16;
controls.maxDistance = 900;
controls.maxPolarAngle = Math.PI * 0.86;
controls.minPolarAngle = Math.PI * 0.08;
controls.enabled = !landingEmbed;
controls.addEventListener("start", () => {
  userTookOver = true;
});

function applyCameraFrame(frame) {
  camera.position.copy(frame.position);
  controls.target.copy(frame.target);
  camera.lookAt(frame.target);
  controls.update();
}

function frameSystem() {
  applyCameraFrame(getSystemFrame());
}

function getLandingFrame() {
  const full = getSystemFrame();
  const target = new THREE.Vector3(-MAX_ORBIT * 0.18, 0, 0);
  const direction = full.position.clone().normalize();
  return {
    position: target.clone().add(direction.multiplyScalar(full.position.length() * 0.54)),
    target,
  };
}

function frameLanding() {
  applyCameraFrame(getLandingFrame());
}

let entryTransition = null;
let entryTransitionComplete = false;

function beginEntryTransition() {
  if (!landingEmbed || entryTransition || entryTransitionComplete) return;
  const destination = getSystemFrame();
  entryTransition = {
    startedAt: performance.now(),
    duration: 1900,
    fromPosition: camera.position.clone(),
    fromTarget: controls.target.clone(),
    toPosition: destination.position,
    toTarget: destination.target,
  };
}

if (landingEmbed) {
  window.addEventListener("message", (event) => {
    if (event.origin === window.location.origin && event.data?.type === "solar-entry-start") {
      beginEntryTransition();
    }
  });
} else {
  try {
    if (window.sessionStorage.getItem("solar-entry-transition")) {
      window.sessionStorage.removeItem("solar-entry-transition");
      document.body.classList.add("is-arriving");
      window.setTimeout(() => document.body.classList.remove("is-arriving"), 1000);
    }
  } catch {
    // Arrival remains usable if storage is unavailable.
  }
}

/* ---------- lighting -------------------------------------------- */

const sunLight = new THREE.PointLight(0xfff0dc, 3600, 0, 2);
scene.add(sunLight);
scene.add(new THREE.AmbientLight(0x2a3348, 0.5));

/* ---------- star field ------------------------------------------ */

function buildStars() {
  const count = 4200;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    // uniform on a large sphere shell
    const u = Math.random() * 2 - 1;
    const theta = Math.random() * Math.PI * 2;
    const r = 900 + Math.random() * 900;
    const s = Math.sqrt(1 - u * u);
    pos[i * 3] = r * s * Math.cos(theta);
    pos[i * 3 + 1] = r * u;
    pos[i * 3 + 2] = r * s * Math.sin(theta);
    // real star colours skew blue-white to amber; keep them desaturated
    const t = Math.random();
    c.setHSL(t < 0.75 ? 0.58 : 0.09, 0.18, 0.55 + Math.random() * 0.4);
    col[i * 3] = c.r;
    col[i * 3 + 1] = c.g;
    col[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size: 1.7,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  scene.add(new THREE.Points(geo, mat));
}
buildStars();

/* ---------- bodies ---------------------------------------------- */

const SPHERE = new THREE.SphereGeometry(1, 64, 48);
const DEFAULT_LABEL_OFFSET = [10, -7];
/* Fixed mobile offsets spread the tightly packed inner-system labels without
   frame-by-frame collision solving. A body always keeps the same placement. */
const MOBILE_LABEL_OFFSETS = {
  sun: [-30, -36],
  mercury: [-72, -15],
  venus: [-72, 10],
  earth: [24, -30],
  moon: [24, 28],
  mars: [38, 10],
  jupiter: [38, -14],
  saturn: [-78, 4],
};
const INITIAL_ORBIT_ANGLES = {
  sun: 0,
  mercury: 0.7,
  venus: 2.2,
  earth: 4,
  moon: 2,
  mars: 5.3,
  jupiter: 1.4,
  saturn: 3.5,
  uranus: 5.7,
  neptune: 2.8,
};
/** @type {Map<string, {spec: object, pivot: THREE.Object3D, mesh: THREE.Mesh, label: HTMLElement, angle: number}>} */
const bodies = new Map();
const pickables = [];
/** @type {Map<string, THREE.Material>} */
const materials = new Map();

/* Orbital periods retain their scientific relationship, while the common rate
   is deliberately calm: Earth completes a visual orbit in roughly 3 minutes.
   Axial periods use a gentler exponent so slow rotators remain perceptible;
   negative periods preserve retrograde rotation for Venus and Uranus. */
const ORBIT_BASE_RATE = 0.035;
const ORBIT_RATE_EXPONENT = 0.7;
const AXIAL_BASE_RATE = 0.12;
const AXIAL_RATE_EXPONENT = 0.32;

function axialRateFor(rotationHours) {
  if (!rotationHours) return 0;
  const direction = Math.sign(rotationHours);
  const relativePeriod = Math.abs(rotationHours) / 23.93;
  const rate = AXIAL_BASE_RATE / Math.pow(relativePeriod, AXIAL_RATE_EXPONENT);
  return direction * THREE.MathUtils.clamp(rate, 0.025, 0.2);
}

function ringMesh(spec) {
  const [innerK, outerK] = spec.rings;
  const geo = new THREE.RingGeometry(spec.radius * innerK, spec.radius * outerK, 160, 1);
  // RingGeometry ships square UVs; remap u to normalised radius so the band map reads outward
  const p = geo.attributes.position;
  const uv = geo.attributes.uv;
  const inner = spec.radius * innerK;
  const outer = spec.radius * outerK;
  for (let i = 0; i < p.count; i++) {
    const d = Math.hypot(p.getX(i), p.getY(i));
    uv.setXY(i, (d - inner) / (outer - inner), 0.5);
  }
  uv.needsUpdate = true;
  const mat = new THREE.MeshBasicMaterial({
    map: ringMap(spec.color, spec.id),
    side: THREE.DoubleSide,
    transparent: true,
    opacity: spec.id === "saturn" ? 0.92 : 0.4,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

function orbitLine(radius) {
  const pts = [];
  for (let i = 0; i <= 256; i++) {
    const a = (i / 256) * Math.PI * 2;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({
    color: 0x8fa0bd,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
  });
  return new THREE.LineLoop(geo, mat);
}

function buildBody(spec) {
  const map = proceduralMap(spec, maxAniso);
  const isStar = spec.surface === "star";
  const material = isStar
    ? new THREE.MeshBasicMaterial({ map })
    : new THREE.MeshStandardMaterial({ map, roughness: 0.92, metalness: 0.02 });

  materials.set(spec.id, material);
  const mesh = new THREE.Mesh(SPHERE, material);
  mesh.scale.setScalar(spec.radius);
  mesh.rotation.z = spec.tilt ?? 0;
  mesh.userData.bodyId = spec.id;

  // pivot carries the orbital position; the mesh spins inside it
  const pivot = new THREE.Object3D();
  const holder = new THREE.Object3D();
  holder.position.x = spec.orbitRadius;
  holder.add(mesh);
  if (spec.rings) holder.add(ringMesh(spec));
  pivot.add(holder);

  if (isStar) {
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowSprite(),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    sprite.scale.setScalar(spec.radius * 4);
    holder.add(sprite);
  }

  const parent = spec.parent ? bodies.get(spec.parent) : null;
  if (parent) {
    parent.holder.add(pivot); // orbit the parent's holder
  } else {
    scene.add(pivot);
    if (spec.orbitRadius > 0) scene.add(orbitLine(spec.orbitRadius));
  }

  const label = document.createElement("button");
  label.type = "button";
  label.className = `label label--${spec.mode}`;
  label.dataset.testid = `label-${spec.id}`;
  label.setAttribute("data-body", spec.id);
  label.innerHTML = `<span class="label__dot"></span><span class="label__name">${spec.name.toLocaleUpperCase("tr-TR")}</span>${
    spec.mode === "page" ? '<span class="label__mark">↗</span>' : ""
  }`;
  label.addEventListener("click", () => select(spec.id));
  labelLayer.appendChild(label);

  const entry = {
    spec,
    pivot,
    holder,
    mesh,
    label,
    offset: spec.labelOffset ?? DEFAULT_LABEL_OFFSET,
    angle: INITIAL_ORBIT_ANGLES[spec.id] ?? 0,
    axialRate: axialRateFor(spec.rotationHours),
  };
  pivot.rotation.y = entry.angle;
  bodies.set(spec.id, entry);
  pickables.push(mesh);
}

BODY_GEOMETRY.forEach(buildBody);

/* selection reticle — a thin camera-facing ring, no glow */
const reticle = new THREE.Mesh(
  new THREE.RingGeometry(1, 1.035, 96),
  new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthTest: false,
  }),
);
reticle.renderOrder = 5;
reticle.visible = false;
scene.add(reticle);

/* ---------- editorial content ----------------------------------- */

let selectedId = null;

const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m],
  );

function sectionsHtml(sections) {
  if (!sections || !sections.length) return "";
  return `<div class="panel__sections">${sections
    .map(
      (s) => `<section class="panel__section">
        <h3 class="panel__h3">${esc(s.heading)}</h3>
        <p class="panel__p">${esc(s.body)}</p>
      </section>`,
    )
    .join("")}</div>`;
}

function renderOverview() {
  const stats = OVERVIEW_FALLBACK.stats;
  panelBody.innerHTML = `
    <p class="kicker">${esc(OVERVIEW_FALLBACK.kicker)}</p>
    <h2 class="panel__title" data-testid="panel-title">${esc(OVERVIEW_FALLBACK.title)}</h2>
    <p class="panel__lead">${esc(OVERVIEW_FALLBACK.lead)}</p>
    <dl class="stats" data-testid="panel-stats">${stats
      .map((s) => `<div class="stats__row"><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`)
      .join("")}</dl>
    ${sectionsHtml(OVERVIEW_FALLBACK.sections)}
    <p class="panel__hint" data-testid="panel-hint">${esc(OVERVIEW_FALLBACK.hint)}</p>`;
  animatePanel();
}

function renderBody(id) {
  const spec = bodies.get(id).spec;
  const data = BODY_CONTENT_FALLBACKS[id];
  const stats = data?.stats ?? [];
  panelBody.innerHTML = `
    <p class="kicker">${esc(data?.kicker ?? spec.kicker)}</p>
    <h2 class="panel__title" data-testid="panel-title">${esc(spec.name)}</h2>
    <p class="panel__lead">${esc(data?.lead ?? spec.lead)}</p>
    ${
      stats.length
        ? `<dl class="stats" data-testid="panel-stats">${stats
            .map(
              (s) =>
                `<div class="stats__row"><dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd></div>`,
            )
            .join("")}</dl>`
        : '<p class="panel__hint">Ayrıntılı veriler yüklenemedi.</p>'
    }
    ${sectionsHtml(data?.sections)}`;
  animatePanel();
}

function animatePanel() {
  if (reduceMotion) return;
  panelBody.animate(
    [
      { opacity: 0, transform: "translateY(7px)" },
      { opacity: 1, transform: "none" },
    ],
    { duration: 340, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  );
  panelBody.parentElement.scrollTop = 0;
}

/* ---------- selection ------------------------------------------- */

function select(id) {
  const entry = bodies.get(id);
  if (!entry) return;

  // Category A — Sun / Moon / Mars / Saturn own dedicated exploration pages.
  if (entry.spec.mode === "page" && entry.spec.href) {
    window.location.href = entry.spec.href;
    return;
  }

  // Category B — panel only. The scene keeps its viewing context.
  selectedId = id;
  bodies.forEach((b, key) => b.label.classList.toggle("is-selected", key === id));
  reticle.visible = true;
  syncIndex();
  renderBody(id);
}

function clearSelection() {
  selectedId = null;
  bodies.forEach((b) => b.label.classList.remove("is-selected"));
  reticle.visible = false;
  syncIndex();
  renderOverview();
}

document.getElementById("panel-reset").addEventListener("click", clearSelection);

/* ---------- body index (panel) ----------------------------------- */

const indexEl = document.getElementById("body-index");

BODY_GEOMETRY.forEach((spec) => {
  const item = document.createElement("button");
  item.type = "button";
  item.className = "index__item";
  item.dataset.testid = `index-${spec.id}`;
  item.dataset.body = spec.id;
  item.dataset.active = "false";
  item.innerHTML =
    `<span class="index__dot"></span>${spec.name.toLocaleUpperCase("tr-TR")}` +
    (spec.mode === "page" ? '<span class="index__mark">↗</span>' : "");
  item.addEventListener("click", () => select(spec.id));
  indexEl.appendChild(item);
});

function syncIndex() {
  indexEl.querySelectorAll(".index__item").forEach((el) => {
    el.dataset.active = String(el.dataset.body === selectedId);
  });
}

/* ---------- pointer picking ------------------------------------- */

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downAt = null;
let hoveredId = null;

function pickAt(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(pickables, false)[0];
  return hit ? hit.object.userData.bodyId : null;
}

canvas.addEventListener("pointerdown", (e) => {
  downAt = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener("pointerup", (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
  downAt = null;
  if (moved > 5) return; // it was an orbit drag, not a click
  const id = pickAt(e.clientX, e.clientY);
  if (id) select(id);
});

canvas.addEventListener("pointermove", (e) => {
  const id = pickAt(e.clientX, e.clientY);
  if (id === hoveredId) return;
  hoveredId = id;
  canvas.style.cursor = id ? "pointer" : "grab";
  bodies.forEach((b, key) => b.label.classList.toggle("is-hover", key === hoveredId));
});

/* ---------- loop ------------------------------------------------- */

const projected = new THREE.Vector3();
const clock = new THREE.Clock();

function updateLabels() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  bodies.forEach((entry) => {
    entry.mesh.getWorldPosition(projected);
    const dist = projected.distanceTo(camera.position);
    projected.project(camera);
    const visible = projected.z < 1 && Math.abs(projected.x) < 1.1 && Math.abs(projected.y) < 1.1;
    const el = entry.label;
    if (!visible) {
      if (el.style.visibility !== "hidden") el.style.visibility = "hidden";
      return;
    }
    if (el.style.visibility === "hidden") el.style.visibility = "";
    const offset = window.innerWidth <= 860
      ? MOBILE_LABEL_OFFSETS[entry.spec.id] ?? entry.offset
      : entry.offset;
    const x = (projected.x * 0.5 + 0.5) * w + offset[0];
    const y = (-projected.y * 0.5 + 0.5) * h + offset[1];
    el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    el.style.opacity = dist > 700 ? "0.3" : "1";
  });
}

function tick() {
  const dt = clock.getDelta();
  if (!reduceMotion) {
    bodies.forEach((entry) => {
      const { spec, pivot, mesh, axialRate } = entry;
      if (spec.periodDays) {
        pivot.rotation.y +=
          (dt * ORBIT_BASE_RATE) /
          Math.pow(spec.periodDays / 365.25, ORBIT_RATE_EXPONENT);
      }
      mesh.rotation.y += dt * axialRate;
    });
  }

  if (selectedId) {
    const entry = bodies.get(selectedId);
    entry.mesh.getWorldPosition(reticle.position);
    reticle.scale.setScalar(entry.spec.radius * 1.75);
    reticle.quaternion.copy(camera.quaternion);
  }

  if (entryTransition) {
    const progress = THREE.MathUtils.clamp(
      (performance.now() - entryTransition.startedAt) / entryTransition.duration,
      0,
      1,
    );
    const eased = progress * progress * (3 - 2 * progress);
    camera.position.lerpVectors(
      entryTransition.fromPosition,
      entryTransition.toPosition,
      eased,
    );
    controls.target.lerpVectors(entryTransition.fromTarget, entryTransition.toTarget, eased);

    if (progress === 1) {
      entryTransition = null;
      entryTransitionComplete = true;
      window.parent.postMessage({ type: "solar-entry-complete" }, window.location.origin);
    }
  }

  controls.update();
  updateLabels();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  if (!userTookOver && !entryTransition) {
    if (landingEmbed && !entryTransitionComplete) frameLanding();
    else frameSystem();
  }
}

new ResizeObserver(resize).observe(canvas);
resize();
canvas.style.cursor = "grab";
renderOverview();
if (!landingEmbed && scaleNote) scaleNote.hidden = false;
tick();
