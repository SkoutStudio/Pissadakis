import * as THREE from "three";

const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);

const isMobile = matchMedia("(max-width: 700px)").matches;
document.getElementById("year").textContent = new Date().getFullYear();

/* =========================================================
 * 1. THREE.JS — extruded logo shield on the red stage
 * ======================================================= */
const canvas = document.getElementById("stage");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.5 : 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 0, 8);

scene.add(new THREE.AmbientLight(0xffffff, 0.9));
const key = new THREE.DirectionalLight(0xffffff, 2.2);
key.position.set(3, 4, 5);
scene.add(key);
const rim = new THREE.PointLight(0xff2a2a, 30, 20);
rim.position.set(-3, -2, 2);
scene.add(rim);

const loader = new THREE.TextureLoader();
const load = (url) => new Promise((res) => loader.load(url, res));

const SHIELD_W = 2.2;
const SHIELD_H = SHIELD_W * (1248 / 1024);
const DEPTH = 0.24;

const shield = new THREE.Group();     // driven by scroll
const floater = new THREE.Group();    // idle float + mouse parallax
floater.add(shield);
scene.add(floater);

const faceUniforms = { map: { value: null }, uShine: { value: -0.5 } };
const faceMaterial = new THREE.ShaderMaterial({
  uniforms: faceUniforms,
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */ `
    uniform sampler2D map;
    uniform float uShine;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(map, vUv);
      if (c.a < 0.5) discard;
      float d = (vUv.x + (1.0 - vUv.y)) * 0.5 - uShine;
      float band = smoothstep(0.09, 0.0, abs(d));
      gl_FragColor = vec4(c.rgb + band * 0.6, 1.0);
      #include <colorspace_fragment>
    }`,
});

async function buildShield() {
  const [logo, sil] = await Promise.all([load("assets/logo.png"), load("assets/logo-silhouette.png")]);
  logo.colorSpace = THREE.SRGBColorSpace;
  logo.anisotropy = renderer.capabilities.getMaxAnisotropy();
  faceUniforms.map.value = logo;

  const geo = new THREE.PlaneGeometry(SHIELD_W, SHIELD_H);

  // Thickness: stacked silhouette slices with a dark-gold metal edge
  const slices = isMobile ? 26 : 44;
  const edgeA = new THREE.Color("#1b2a24");
  const edgeB = new THREE.Color("#9c8414");
  for (let i = 0; i < slices; i++) {
    const t = i / (slices - 1);
    const mat = new THREE.MeshStandardMaterial({
      color: edgeA.clone().lerp(edgeB, Math.sin(t * Math.PI)),
      alphaMap: sil,
      alphaTest: 0.5,
      metalness: 0.6,
      roughness: 0.35,
      side: THREE.DoubleSide,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.z = -DEPTH / 2 + t * DEPTH;
    m.scale.setScalar(0.995);
    shield.add(m);
  }

  const front = new THREE.Mesh(geo, faceMaterial);
  front.position.z = DEPTH / 2 + 0.002;
  shield.add(front);

  const back = new THREE.Mesh(geo, faceMaterial);
  back.rotation.y = Math.PI;
  back.position.z = -DEPTH / 2 - 0.002;
  shield.add(back);
}

/* ---------- embers ---------- */
function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.3, "rgba(255,255,255,.6)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

const EMBERS = isMobile ? 350 : 800;
const emberPos = new Float32Array(EMBERS * 3);
const emberCol = new Float32Array(EMBERS * 3);
const emberSpeed = new Float32Array(EMBERS);
const palette = [new THREE.Color("#f7e43a"), new THREE.Color("#ff8a1a"), new THREE.Color("#ffffff")];
for (let i = 0; i < EMBERS; i++) {
  emberPos[i * 3] = (Math.random() - 0.5) * 16;
  emberPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
  emberPos[i * 3 + 2] = -Math.random() * 20 + 4;
  const c = palette[(Math.random() * palette.length) | 0];
  emberCol.set([c.r, c.g, c.b], i * 3);
  emberSpeed[i] = 0.004 + Math.random() * 0.012;
}
const emberGeo = new THREE.BufferGeometry();
emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPos, 3));
emberGeo.setAttribute("color", new THREE.BufferAttribute(emberCol, 3));
const embers = new THREE.Points(
  emberGeo,
  new THREE.PointsMaterial({
    size: 0.07,
    map: dotTexture(),
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    opacity: 0.9,
  })
);
scene.add(embers);

/* ---------- scroll-driven state ---------- */
const S = { rotX: 0, rotY: 0, rotZ: 0, x: 0, y: 0, z: 0, scale: 1, shine: -0.5, warp: 0 };
const intro = { s: 0, r: -Math.PI }; // entrance, kept separate from the scroll state
let baseScale = 1;

function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  const visH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const visW = visH * camera.aspect;
  baseScale = Math.min(1, (visW * 0.72) / SHIELD_W, (visH * (isMobile ? 0.48 : 0.62)) / SHIELD_H);
}
addEventListener("resize", resize);
resize();

const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
addEventListener("pointermove", (e) => {
  mouse.tx = (e.clientX / innerWidth) * 2 - 1;
  mouse.ty = (e.clientY / innerHeight) * 2 - 1;
});

let heroActive = true;
const clock = new THREE.Clock();
function tick() {
  requestAnimationFrame(tick);
  if (!heroActive) return;
  const t = clock.getElapsedTime();

  mouse.x += (mouse.tx - mouse.x) * 0.06;
  mouse.y += (mouse.ty - mouse.y) * 0.06;

  floater.position.y = Math.sin(t * 1.2) * 0.08;
  floater.rotation.y = mouse.x * 0.35;
  floater.rotation.x = mouse.y * 0.25;

  shield.rotation.set(S.rotX, S.rotY + intro.r + Math.sin(t * 0.6) * 0.08, S.rotZ);
  shield.position.set(S.x, S.y, S.z);
  shield.scale.setScalar(baseScale * S.scale * intro.s);
  faceUniforms.uShine.value = S.shine;

  rim.position.x = Math.cos(t) * 3;
  rim.position.y = Math.sin(t * 0.7) * 2;

  const p = emberGeo.attributes.position.array;
  for (let i = 0; i < EMBERS; i++) {
    p[i * 3 + 1] += emberSpeed[i];
    p[i * 3 + 2] += S.warp * (0.15 + emberSpeed[i] * 12);
    if (p[i * 3 + 1] > 5) p[i * 3 + 1] = -5;
    if (p[i * 3 + 2] > 7.5) p[i * 3 + 2] = -16;
  }
  emberGeo.attributes.position.needsUpdate = true;
  embers.material.size = 0.07 + S.warp * 0.08;

  renderer.render(scene, camera);
}

/* =========================================================
 * 2. HERO SCROLL TIMELINE
 * ======================================================= */
function heroTimeline() {
  const letters = gsap.utils.toArray("#heroWord span");
  const flash = document.getElementById("flash");

  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: "#hero",
      start: "top top",
      end: "bottom bottom",
      scrub: 1,
      onToggle: (self) => {
        heroActive = self.isActive || self.progress < 1;
        canvas.style.visibility = heroActive ? "visible" : "hidden";
      },
    },
  });

  // Act 1 — the word explodes into 3D, the shield does a full spin
  tl.to("#scrollHint", { opacity: 0, duration: 0.5 }, 0);
  letters.forEach((el, i) => {
    const d = i - (letters.length - 1) / 2;
    tl.to(el, {
      x: d * (isMobile ? 40 : 120),
      y: gsap.utils.random(-200, 200),
      z: gsap.utils.random(200, 900),
      rotationY: d * 25,
      rotationX: gsap.utils.random(-90, 90),
      opacity: 0,
      duration: 3,
      ease: "power2.in",
    }, 0);
  });
  tl.to(S, { rotY: Math.PI * 2, scale: 1.15, duration: 3, ease: "power1.inOut" }, 0);
  tl.to(S, { shine: 1.5, duration: 2 }, 1.5);

  // Act 2 — three-quarter turn to show the thickness, copy reveals
  tl.to(S, { rotY: Math.PI * 2 + 0.75, rotX: -0.25, x: isMobile ? 0 : 0.9, duration: 2, ease: "power2.inOut" }, 3);
  tl.fromTo("#copyLeft", { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1 }, 3.4);
  tl.fromTo("#copyRight", { opacity: 0, y: -60 }, { opacity: 1, y: 0, duration: 1 }, 3.8);
  tl.to(S, { shine: -0.5, duration: 0.01 }, 4.9);
  tl.to(S, { rotY: Math.PI * 2 - 0.75, x: isMobile ? 0 : -0.9, rotZ: 0.08, duration: 2, ease: "power2.inOut" }, 5);
  tl.to(S, { shine: 1.5, duration: 1.5 }, 5.5);
  tl.to(["#copyLeft", "#copyRight"], { opacity: 0, y: (i) => (i ? -40 : 40), duration: 0.8 }, 6.6);

  // Act 3 — face the camera, then fly straight through it
  tl.to(S, { rotY: Math.PI * 4, rotX: 0, rotZ: 0, x: 0, duration: 1.5, ease: "power2.inOut" }, 7);
  tl.to(S, { z: 7.4, warp: 1, duration: 2, ease: "power3.in" }, 8.3);
  tl.to(".hero__word", { opacity: 0, duration: 0.5 }, 8.3);
  tl.to(flash, { opacity: 1, duration: 0.35 }, 9.9);
  tl.to(flash, { opacity: 0, duration: 0.6 }, 10.3);
}

/* =========================================================
 * 3. PROJECTS — 3D fly-through tunnel + grid
 * ======================================================= */
const projects = window.PROJECTS || [];
const pad = (n) => String(n).padStart(2, "0");

function media(p, i) {
  return p.src
    ? `<img src="assets/projects/${p.src}" alt="${p.title}" loading="lazy" />`
    : `<div class="placeholder">${pad(i + 1)}</div>`;
}

function buildProjects() {
  const world = document.getElementById("world");
  const grid = document.getElementById("grid");
  const GAP = isMobile ? 700 : 950;
  const n = projects.length;

  document.getElementById("projTotal").textContent = pad(n);
  document.querySelector(".projects").style.height = `${100 + n * 70}vh`;

  const cards = projects.map((p, i) => {
    const fig = document.createElement("figure");
    fig.className = "card3d";
    fig.innerHTML = `${media(p, i)}<figcaption><strong>${p.title}</strong><span>${p.place} · ${p.year}</span></figcaption>`;
    const side = i % 2 ? 1 : -1;
    const x = isMobile ? side * 30 : side * Math.min(innerWidth * 0.17, 260);
    const y = (i % 3 - 1) * 40;
    const z = -i * GAP;
    fig.dataset.z = z;
    gsap.set(fig, { x, y, z, rotationY: -side * 14 });
    fig.addEventListener("click", () => openLightbox(p));
    world.appendChild(fig);

    const th = document.createElement("figure");
    th.className = "thumb";
    th.innerHTML = `${media(p, i)}<figcaption>${p.title}</figcaption>`;
    th.addEventListener("click", () => openLightbox(p));
    th.addEventListener("pointermove", (e) => {
      const r = th.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      th.style.transform = `perspective(700px) rotateY(${px * 14}deg) rotateX(${-py * 14}deg) scale(1.03)`;
    });
    th.addEventListener("pointerleave", () => (th.style.transform = ""));
    grid.appendChild(th);
    return fig;
  });

  const now = document.getElementById("projNow");
  const bar = document.getElementById("projBar");
  const total = (n - 1) * GAP + 650;

  const update = (p) => {
    const wz = p * total - 350;
    gsap.set(world, { z: wz, rotationZ: Math.sin(p * Math.PI * 2) * 3 });
    cards.forEach((c) => {
      const rel = +c.dataset.z + wz;
      let o = 1;
      if (rel > 250) o = 1 - (rel - 250) / 450;
      else if (rel < -GAP * 3) o = 1 - (-GAP * 3 - rel) / GAP;
      o = Math.max(0, Math.min(1, o));
      c.style.opacity = o;
      c.style.pointerEvents = o > 0.6 ? "auto" : "none";
    });
    now.textContent = pad(Math.min(n, Math.round(p * (n - 1)) + 1));
    bar.style.width = `${p * 100}%`;
  };
  update(0);

  ScrollTrigger.create({
    trigger: "#projects",
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    onUpdate: (self) => update(self.progress),
  });

  gsap.from(".thumb", {
    y: 80, opacity: 0, rotationX: -25, stagger: 0.08, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: "#grid", start: "top 85%" },
  });
  gsap.from(".contact > *:not(footer)", {
    y: 60, opacity: 0, stagger: 0.12, duration: 0.9, ease: "power3.out",
    scrollTrigger: { trigger: "#contact", start: "top 70%" },
  });
  gsap.from(".contact__logo", {
    rotationY: 180, duration: 1.4, ease: "power3.out",
    scrollTrigger: { trigger: "#contact", start: "top 70%" },
  });
}

/* ---------- lightbox ---------- */
const lb = document.getElementById("lightbox");
function openLightbox(p) {
  if (!p.src) return;
  lb.querySelector("img").src = `assets/projects/${p.src}`;
  lb.querySelector("p").textContent = `${p.title} — ${p.place} · ${p.year}`;
  lb.hidden = false;
}
lb.addEventListener("click", (e) => {
  if (e.target !== lb.querySelector("img")) lb.hidden = true;
});
addEventListener("keydown", (e) => e.key === "Escape" && (lb.hidden = true));

/* =========================================================
 * boot
 * ======================================================= */
buildProjects();
heroTimeline();
buildShield().then(() => {
  tick();
  gsap.to(intro, { s: 1, r: 0, duration: 1.6, ease: "elastic.out(1, 0.6)" });
  document.body.classList.add("is-ready");
  document.getElementById("loader").classList.add("is-done");
  ScrollTrigger.refresh();
});
