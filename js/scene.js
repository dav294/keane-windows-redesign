/**
 * Keane Windows & Doors — Three.js Hero Scene
 * Floating glass panes with warm lighting
 */
import * as THREE from 'three';

let renderer, scene, camera, clock;
let panes = [];
let particleSystem;
let goldLight, blueLight;
let scrollY = 0;
let targetCamY = 0;
let destroyed = false;

export function initScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  clock = new THREE.Clock();

  // ── Renderer ────────────────────────────────────────────────
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // ── Scene & Camera ───────────────────────────────────────────
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c0f14);
  scene.fog = new THREE.FogExp2(0x0c0f14, 0.06);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    60
  );
  camera.position.set(0, 0, 7);

  // ── Lights ───────────────────────────────────────────────────
  const ambientLight = new THREE.AmbientLight(0x1a2040, 1.5);
  scene.add(ambientLight);

  // Warm brand-red light (sunlight through glass)
  goldLight = new THREE.PointLight(0xd43015, 10, 18);
  goldLight.position.set(4, 3, 4);
  scene.add(goldLight);

  // Cool blue accent
  blueLight = new THREE.PointLight(0x3060c8, 5, 16);
  blueLight.position.set(-5, -2, 2);
  scene.add(blueLight);

  // Soft fill
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(0, 5, 6);
  scene.add(fillLight);

  // ── Glass Panes ──────────────────────────────────────────────
  buildPanes();

  // ── Particles ────────────────────────────────────────────────
  buildParticles();

  // ── Resize handler ───────────────────────────────────────────
  window.addEventListener('resize', onResize, { passive: true });

  // ── Start loop ───────────────────────────────────────────────
  tick();
}

function buildPanes() {
  const paneData = [
    { pos: [-3.2,  0.8, -2.0], rot: [0.04,  0.40, 0.03], w: 1.6, h: 2.8, opacity: 0.12 },
    { pos: [ 3.6, -0.6, -3.2], rot: [0.06, -0.45, 0.02], w: 2.0, h: 3.2, opacity: 0.08 },
    { pos: [ 0.4,  1.6, -0.8], rot: [-0.03, 0.12, 0.04], w: 1.2, h: 2.2, opacity: 0.14 },
    { pos: [-5.0, -1.0, -4.5], rot: [ 0.00,  0.55, 0.00], w: 2.2, h: 3.6, opacity: 0.05 },
    { pos: [ 5.2,  1.2, -2.8], rot: [0.04, -0.32, 0.00], w: 1.4, h: 2.4, opacity: 0.07 },
    { pos: [ 1.2, -2.2,  0.2], rot: [0.08,  0.22, 0.05], w: 1.0, h: 1.8, opacity: 0.10 },
    { pos: [-2.4, -1.8, -1.2], rot: [-0.06,-0.18, 0.02], w: 1.3, h: 2.0, opacity: 0.11 },
    { pos: [ 4.0, -0.4, -1.0], rot: [0.03,  0.38, 0.00], w: 1.1, h: 2.0, opacity: 0.13 },
  ];

  const edgeMat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.18,
  });

  paneData.forEach((d, i) => {
    const geo = new THREE.PlaneGeometry(d.w, d.h, 2, 3);

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0.75, 0.88, 1.0),
      metalness: 0.05,
      roughness: 0.02,
      transparent: true,
      opacity: d.opacity,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...d.pos);
    mesh.rotation.set(...d.rot);

    // Gold edge outline
    const edgeGeo = new THREE.EdgesGeometry(geo);
    const edges = new THREE.LineSegments(edgeGeo, edgeMat.clone());
    mesh.add(edges);

    // Cross dividers (window pane look)
    const crossMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.10,
    });
    const crossPoints = [
      new THREE.Vector3(-d.w / 2, 0, 0.001),
      new THREE.Vector3( d.w / 2, 0, 0.001),
      new THREE.Vector3(0, -d.h / 2, 0.001),
      new THREE.Vector3(0,  d.h / 2, 0.001),
    ];
    const crossLine = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints([crossPoints[0], crossPoints[1]]),
      crossMat
    );
    const crossLine2 = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints([crossPoints[2], crossPoints[3]]),
      crossMat.clone()
    );
    mesh.add(crossLine);
    mesh.add(crossLine2);

    mesh.userData = {
      baseY: d.pos[1],
      baseRotY: d.rot[1],
      speed: 0.18 + (i * 0.04),
      phase: i * 0.78,
      dir: i % 2 === 0 ? 1 : -1,
    };

    scene.add(mesh);
    panes.push(mesh);
  });
}

function buildParticles() {
  const count = 280;
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    sizes[i] = Math.random() * 1.5 + 0.4;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.03,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true,
  });

  particleSystem = new THREE.Points(geo, mat);
  scene.add(particleSystem);
}

function tick() {
  if (destroyed) return;
  requestAnimationFrame(tick);

  const t = clock.getElapsedTime();

  // Animate panes
  panes.forEach((pane) => {
    const { baseY, baseRotY, speed, phase, dir } = pane.userData;
    pane.position.y = baseY + Math.sin(t * speed + phase) * 0.12;
    pane.rotation.y = baseRotY + Math.sin(t * speed * 0.6 + phase) * 0.015 * dir;
  });

  // Orbit lights slowly
  goldLight.position.x = 4 * Math.cos(t * 0.15);
  goldLight.position.z = 3 + 2 * Math.sin(t * 0.15);
  blueLight.position.x = -5 * Math.cos(t * 0.1);
  blueLight.position.z = 2 + 1.5 * Math.sin(t * 0.1);

  // Particles drift
  particleSystem.rotation.y = t * 0.018;
  particleSystem.rotation.x = t * 0.006;

  // Smooth camera parallax on scroll
  targetCamY = -scrollY * 0.0018;
  camera.position.y += (targetCamY - camera.position.y) * 0.06;

  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function updateScroll(y) {
  scrollY = y;
}

export function destroy() {
  destroyed = true;
  window.removeEventListener('resize', onResize);
  renderer.dispose();
}
