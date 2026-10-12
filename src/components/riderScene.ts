import * as T from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { Region } from "../types";
import type { RiderStyle } from "../lib/experience";
import { riderStyles } from "../lib/experience";
export interface SceneController {
  setActive: (active: boolean) => void;
  setSelected: (region: Region | "all") => void;
  turn: (direction: number) => void;
  dispose: () => void;
}
// Procedural model: no downloads, textures, commercial assets, HDR maps, or postprocessing.
export function createRiderScene(
  host: HTMLElement,
  style: RiderStyle,
  onSelect: (region: Region) => void,
  onSlow: () => void,
): SceneController {
  const palette = riderStyles.find((s) => s.id === style)!;
  const renderer = new T.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = T.SRGBColorSpace;
  const canvas = renderer.domElement;
  canvas.setAttribute(
    "aria-label",
    "Drehbare 3D-Fahrerfigur. Mit Pfeiltasten drehen; Körperbereiche über die beschrifteten Schaltflächen auswählen.",
  );
  canvas.setAttribute("role", "img");
  canvas.tabIndex = 0;
  host.append(canvas);
  const scene = new T.Scene();
  const camera = new T.OrthographicCamera(-2.6, 2.6, 3.15, -3.15, 0.1, 50);
  camera.position.set(6, 4.4, 12);
  camera.lookAt(0, 2.55, 0);
  scene.add(new T.HemisphereLight(0xffffff, 0x61435a, 2.15));
  const key = new T.DirectionalLight(0xffffff, 3.1);
  key.position.set(-5, 8, 6);
  scene.add(key);
  const rim = new T.DirectionalLight(0xffdaee, 1.2);
  rim.position.set(4, 4, -5);
  scene.add(rim);
  const root = new T.Group();
  scene.add(root);
  const geometries = new Set<T.BufferGeometry>(),
    materials = new Set<T.Material>();
  const pickable: T.Mesh[] = [];
  const groups = new Map<Region, T.Mesh[]>();
  const mat = (color: string, shine = 32) => {
    const m = new T.MeshPhongMaterial({
      color,
      shininess: shine,
      specular: "#5f5260",
    });
    materials.add(m);
    return m;
  };
  const coat = mat(palette.color),
    coatDark = mat(palette.dark),
    bagMat = mat(palette.bag),
    pants = mat("#29232f", 10),
    glove = mat("#322537", 12),
    white = mat("#fff9fb", 45),
    skin = mat("#daaa8d", 8),
    face = mat("#372d38", 10),
    sole = mat("#d7cdd7", 20),
    strap = mat("#423447", 12);
  const add = (
    geometry: T.BufferGeometry,
    material: T.Material,
    position: [number, number, number],
    region?: Region,
    parent: T.Object3D = root,
  ) => {
    geometries.add(geometry);
    const mesh = new T.Mesh(geometry, material);
    mesh.position.set(...position);
    parent.add(mesh);
    if (region) {
      mesh.userData.region = region;
      pickable.push(mesh);
      groups.set(region, [...(groups.get(region) ?? []), mesh]);
    }
    return mesh;
  };
  const ball = (
    position: [number, number, number],
    scale: [number, number, number],
    material: T.Material,
    region?: Region,
  ) => {
    const m = add(new T.SphereGeometry(1, 16, 10), material, position, region);
    m.scale.set(...scale);
    return m;
  };
  const box = (
    position: [number, number, number],
    size: [number, number, number],
    material: T.Material,
    region?: Region,
    radius = 0.08,
  ) =>
    add(new RoundedBoxGeometry(...size, 2, radius), material, position, region);
  const limb = (
    a: [number, number, number],
    b: [number, number, number],
    radius: number,
    material: T.Material,
    region: Region,
  ) => {
    const start = new T.Vector3(...a),
      end = new T.Vector3(...b);
    const length = start.distanceTo(end);
    const m = add(
      new T.CapsuleGeometry(radius, Math.max(0.02, length - 2 * radius), 4, 12),
      material,
      [...start.clone().add(end).multiplyScalar(0.5).toArray()] as [
        number,
        number,
        number,
      ],
      region,
    );
    m.quaternion.setFromUnitVectors(
      new T.Vector3(0, 1, 0),
      end.sub(start).normalize(),
    );
    return m;
  };
  // Studio plinth and soft contact shadow, made entirely from small geometries.
  const plate = add(
    new T.CylinderGeometry(1.43, 1.48, 0.14, 40),
    mat("#fff4fa", 60),
    [0, 0.01, 0],
  );
  const ring = add(
    new T.TorusGeometry(1.4, 0.028, 6, 40),
    mat(palette.light),
    [0, 0.09, 0],
  );
  ring.rotation.x = Math.PI / 2;
  const shadow = ball([0, 0.09, 0.02], [0.91, 0.018, 0.67], mat("#cdb3c3", 0));
  shadow.userData.decorative = true;
  // Legs and reinforced shoes.
  for (const side of [-1, 1]) {
    limb(
      [side * 0.28, 2.22, 0],
      [side * 0.33, 1.22, 0.04],
      0.235,
      pants,
      "beine",
    );
    limb(
      [side * 0.33, 1.32, 0.04],
      [side * 0.39, 0.48, 0.13],
      0.195,
      pants,
      "beine",
    );
    box([side * 0.36, 0.75, 0.24], [0.34, 0.085, 0.04], white, "beine", 0.025);
    box([side * 0.39, 0.32, 0.3], [0.43, 0.4, 0.78], white, "fuesse", 0.12);
    box([side * 0.39, 0.17, 0.34], [0.46, 0.1, 0.81], sole, "fuesse", 0.045);
    box([side * 0.39, 0.45, 0.21], [0.31, 0.04, 0.4], strap, "fuesse", 0.02);
    for (let i = 0; i < 3; i++)
      box(
        [side * 0.39, 0.47, 0.27 + i * 0.075],
        [0.27, 0.018, 0.025],
        white,
        "fuesse",
        0.009,
      );
  }
  // Insulated jacket, zipper and pockets.
  box([0, 2.98, 0], [1.12, 1.57, 0.78], coat, "oberkoerper", 0.23);
  box([0, 2.22, 0.015], [1.08, 0.13, 0.73], coatDark, "oberkoerper", 0.055);
  box([0, 2.42, 0.408], [1.03, 0.075, 0.035], white, "oberkoerper", 0.022);
  box([0, 3.04, 0.405], [0.035, 1.38, 0.03], white, "oberkoerper", 0.015);
  for (const side of [-1, 1]) {
    box(
      [side * 0.28, 2.77, 0.41],
      [0.27, 0.045, 0.035],
      coatDark,
      "oberkoerper",
      0.02,
    );
    const upper = limb(
      [side * 0.57, 3.48, 0],
      [side * 0.79, 2.94, 0.07],
      0.21,
      coat,
      "oberkoerper",
    );
    limb(
      [side * 0.79, 2.94, 0.07],
      [side * 0.83, 2.43, 0.22],
      0.18,
      coat,
      "oberkoerper",
    );
    box(
      [side * 0.83, 2.47, 0.24],
      [0.31, 0.1, 0.31],
      white,
      "oberkoerper",
      0.035,
    );
    ball([side * 0.84, 2.25, 0.25], [0.19, 0.25, 0.2], glove, "haende");
    ball([side * 0.68, 2.27, 0.37], [0.07, 0.14, 0.08], glove, "haende");
    box(
      [side * 0.84, 2.29, 0.437],
      [0.18, 0.035, 0.012],
      white,
      "haende",
      0.01,
    );
    upper.rotation.z += side * 0.015;
  }
  // Insulated delivery bag and padded harness. Deliberately no company logos.
  box([0, 3.03, -0.65], [1.08, 1.34, 0.59], bagMat, "oberkoerper", 0.16);
  box([0, 3.71, -0.63], [1.09, 0.13, 0.6], coatDark, "oberkoerper", 0.06);
  box([0, 3.04, -0.96], [0.84, 0.075, 0.02], white, "oberkoerper", 0.02);
  for (const side of [-1, 1]) {
    const m = box(
      [side * 0.39, 3.15, 0.405],
      [0.095, 1.19, 0.045],
      strap,
      "oberkoerper",
      0.035,
    );
    m.rotation.z = side * 0.15;
    box(
      [side * 0.39, 2.96, 0.435],
      [0.13, 0.17, 0.035],
      white,
      "oberkoerper",
      0.025,
    );
  }
  // Neck warmer, face and sculpted cycling helmet.
  const gaiter = add(
    new T.TorusGeometry(0.3, 0.13, 8, 22),
    glove,
    [0, 3.77, 0],
    "kopf",
  );
  gaiter.rotation.x = Math.PI / 2;
  ball([0, 4.19, 0.025], [0.425, 0.48, 0.38], skin, "kopf");
  for (const side of [-1, 1]) {
    ball([side * 0.4, 4.2, 0.01], [0.08, 0.12, 0.09], skin, "kopf");
    ball([side * 0.135, 4.28, 0.377], [0.036, 0.045, 0.022], face, "kopf");
  }
  ball([0, 4.17, 0.419], [0.065, 0.078, 0.065], skin, "kopf");
  box([0, 4.055, 0.371], [0.13, 0.025, 0.027], face, "kopf", 0.012);
  ball([0, 4.53, 0], [0.51, 0.32, 0.45], white, "kopf");
  const helmetRim = add(
    new T.TorusGeometry(0.43, 0.052, 8, 24),
    sole,
    [0, 4.4, 0],
    "kopf",
  );
  helmetRim.rotation.x = Math.PI / 2;
  helmetRim.scale.y = 0.89;
  for (const x of [-0.23, 0, 0.23]) {
    const vent = box(
      [x, 4.78, 0.04],
      [0.065, 0.025, 0.27],
      strap,
      "kopf",
      0.025,
    );
    vent.rotation.z = -x * 0.4;
  }
  for (const side of [-1, 1])
    limb(
      [side * 0.32, 4.37, 0.14],
      [side * 0.2, 3.92, 0.22],
      0.025,
      strap,
      "kopf",
    );
  // Small spokes and frame give the model a bicycle silhouette behind the rider.
  const bike = new T.Group();
  root.add(bike);
  bike.position.set(0.52, 0.13, -1.02);
  const bikeMaterial = mat(palette.dark, 25),
    tire = mat("#514557", 4),
    silver = mat("#ddd2dd", 40);
  const rod = (
    a: [number, number, number],
    b: [number, number, number],
    radius = 0.033,
  ) => {
    const va = new T.Vector3(...a),
      vb = new T.Vector3(...b);
    const geo = new T.CylinderGeometry(radius, radius, va.distanceTo(vb), 6);
    const m = add(
      geo,
      bikeMaterial,
      [...va.clone().add(vb).multiplyScalar(0.5).toArray()] as [
        number,
        number,
        number,
      ],
      undefined,
      bike,
    );
    m.quaternion.setFromUnitVectors(
      new T.Vector3(0, 1, 0),
      vb.sub(va).normalize(),
    );
  };
  for (const x of [-1.04, 1.04]) {
    add(
      new T.TorusGeometry(0.69, 0.055, 8, 28),
      tire,
      [x, 0.72, 0],
      undefined,
      bike,
    );
    add(
      new T.TorusGeometry(0.625, 0.012, 5, 28),
      silver,
      [x, 0.72, 0],
      undefined,
      bike,
    );
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      rod(
        [x, 0.72, 0],
        [x + Math.cos(angle) * 0.61, 0.72 + Math.sin(angle) * 0.61, 0],
        0.009,
      );
    }
  }
  for (const [a, b] of [
    [
      [-1.04, 0.72, 0],
      [-0.32, 1.44, 0],
    ],
    [
      [-1.04, 0.72, 0],
      [0, 0.68, 0],
    ],
    [
      [0, 0.68, 0],
      [-0.32, 1.44, 0],
    ],
    [
      [-0.32, 1.44, 0],
      [0.68, 1.47, 0],
    ],
    [
      [0.68, 1.47, 0],
      [0, 0.68, 0],
    ],
    [
      [0.68, 1.47, 0],
      [1.04, 0.72, 0],
    ],
    [
      [0.68, 1.47, 0],
      [0.62, 1.78, 0],
    ],
  ])
    rod(a as [number, number, number], b as [number, number, number]);
  let active = false,
    disposed = false,
    selected: Region | "all" = "all",
    yaw = -0.17,
    lastFrame = 0,
    slowCount = 0;
  // Clone only selected materials so highlighting never recolors other body regions.
  for (const mesh of pickable) {
    const clone = (mesh.material as T.MeshPhongMaterial).clone();
    materials.add(clone);
    mesh.material = clone;
  }
  const render = (time = 0) => {
    if (disposed || time - lastFrame < 1000 / 24) return;
    lastFrame = time;
    root.rotation.y = yaw + Math.sin(time * 0.00024) * 0.055;
    root.position.y = Math.sin(time * 0.0006) * 0.018;
    const start = performance.now();
    renderer.render(scene, camera);
    if (performance.now() - start > 40) {
      slowCount++;
      if (slowCount === 12) onSlow();
    }
  };
  const resize = () => {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h || disposed) return;
    const aspect = w / h;
    camera.left = -3.1 * aspect;
    camera.right = 3.1 * aspect;
    camera.top = 3.1;
    camera.bottom = -3.1;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    lastFrame = -Infinity;
    render(performance.now());
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  let startX = 0,
    startY = 0,
    moved = false;
  const down = (e: PointerEvent) => {
    startX = e.clientX;
    startY = e.clientY;
    moved = false;
  };
  const move = (e: PointerEvent) => {
    if (e.buttons !== 1) return;
    if (Math.abs(e.clientX - startX) > 7) {
      yaw += Math.max(-0.035, Math.min(0.035, (e.clientX - startX) * 0.001));
      moved = true;
    }
  };
  const up = (e: PointerEvent) => {
    if (moved || Math.abs(e.clientY - startY) > 8) return;
    const rect = canvas.getBoundingClientRect();
    const pointer = new T.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      (-(e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const ray = new T.Raycaster();
    ray.setFromCamera(pointer, camera);
    const hit = ray.intersectObjects(pickable, false)[0];
    if (hit?.object.userData.region) onSelect(hit.object.userData.region);
  };
  const keyboard = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      yaw += e.key === "ArrowLeft" ? -0.25 : 0.25;
      lastFrame = -Infinity;
      render(performance.now());
    }
  };
  canvas.addEventListener("pointerdown", down);
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("keydown", keyboard);
  const lost = (e: Event) => {
    e.preventDefault();
    onSlow();
  };
  canvas.addEventListener("webglcontextlost", lost);
  return {
    setActive(value) {
      if (disposed || value === active) return;
      active = value;
      renderer.setAnimationLoop(active ? render : null);
    },
    setSelected(region) {
      selected = region;
      for (const mesh of pickable) {
        const material = mesh.material as T.MeshPhongMaterial;
        material.emissive.set(
          mesh.userData.region === selected ? palette.light : "#000000",
        );
        material.emissiveIntensity =
          mesh.userData.region === selected ? 0.13 : 0;
      }
      lastFrame = -Infinity;
      render(performance.now());
    },
    turn(direction) {
      yaw += direction * 0.3;
      lastFrame = -Infinity;
      render(performance.now());
    },
    dispose() {
      disposed = true;
      observer.disconnect();
      renderer.setAnimationLoop(null);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("keydown", keyboard);
      canvas.removeEventListener("webglcontextlost", lost);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
