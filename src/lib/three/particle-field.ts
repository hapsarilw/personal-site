import {
  BufferAttribute,
  BufferGeometry,
  Clock,
  Color,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  TorusGeometry,
  WebGLRenderer,
  type BufferGeometry as TBufferGeometry,
} from 'three';

import type { FieldPalette } from './palette';

export type ParticleFieldOptions = {
  canvas: HTMLCanvasElement;
  density: number;
  palette: FieldPalette;
  /** When true the field holds still and only the camera arc responds to scroll. */
  reducedMotion: boolean;
};

export type ParticleFieldHandle = {
  setPalette: (palette: FieldPalette) => void;
  dispose: () => void;
};

const ACCENT_PARTICLE_RATIO = 0.16;
const MAX_PIXEL_RATIO = 2;
const DENSITY_RANGE = { min: 200, max: 4000 } as const;

const FIELD_SPREAD = { x: 58, y: 38 } as const;
/** Every particle sits well behind the camera plane, so none renders as a
 *  near-field square that appears to track the cursor. */
const FIELD_DEPTH = { near: -6, range: 46 } as const;

type ShapeDefinition = {
  geometry: TBufferGeometry;
  position: [number, number, number];
};

function createShapeDefinitions(): ShapeDefinition[] {
  return [
    { geometry: new IcosahedronGeometry(4.4, 1), position: [-11, 3.5, -14] },
    { geometry: new TorusGeometry(3.1, 0.9, 10, 34), position: [12.5, -4.5, -17] },
    { geometry: new OctahedronGeometry(3.3, 0), position: [7, 6.5, -21] },
  ];
}

function createParticles(count: number, palette: FieldPalette) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const isAccent: boolean[] = [];

  const accentColor = new Color(palette.accent);
  const baseColor = new Color(palette.base);

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * FIELD_SPREAD.x;
    positions[i * 3 + 1] = (Math.random() - 0.5) * FIELD_SPREAD.y;
    positions[i * 3 + 2] = FIELD_DEPTH.near - Math.random() * FIELD_DEPTH.range;

    const accent = Math.random() < ACCENT_PARTICLE_RATIO;
    isAccent.push(accent);

    const color = accent ? accentColor : baseColor;
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('color', new BufferAttribute(colors, 3));

  return { geometry, isAccent };
}

/**
 * Builds the ambient background field and drives it from scroll and pointer.
 *
 * Deliberately framework-free: it owns a canvas and returns a handle, so the
 * React component around it is only lifecycle glue and can stay a dozen lines.
 */
export function createParticleField({
  canvas,
  density,
  palette,
  reducedMotion,
}: ParticleFieldOptions): ParticleFieldHandle | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'low-power',
    });
  } catch {
    return null; // No WebGL — the site is fully usable without the field.
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));

  const scene = new Scene();
  const camera = new PerspectiveCamera(58, 1, 0.1, 140);
  camera.position.set(0, 0, 16);

  const count = Math.round(
    Math.max(DENSITY_RANGE.min, Math.min(DENSITY_RANGE.max, density)),
  );
  const { geometry, isAccent } = createParticles(count, palette);

  const pointsMaterial = new PointsMaterial({
    size: palette.pointSize,
    vertexColors: true,
    transparent: true,
    opacity: palette.pointOpacity,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const points = new Points(geometry, pointsMaterial);
  scene.add(points);

  const shapes = createShapeDefinitions().map(({ geometry: shapeGeometry, position }, index) => {
    const material = new MeshBasicMaterial({
      color: new Color(palette.shapeColor),
      wireframe: true,
      transparent: true,
      opacity: palette.shapeOpacities[index === 0 ? 0 : 1],
    });
    const mesh = new Mesh(shapeGeometry, material);
    mesh.position.set(...position);
    scene.add(mesh);
    return { mesh, material, origin: position };
  });

  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const lookAt = { x: 0, y: 0 };
  let scrollProgress = 0;
  let frameId = 0;

  const handleResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  const handlePointerMove = (event: PointerEvent) => {
    pointer.targetX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.targetY = (event.clientY / window.innerHeight - 0.5) * 2;
  };

  handleResize();
  window.addEventListener('resize', handleResize);
  window.addEventListener('pointermove', handlePointerMove, { passive: true });

  const clock = new Clock();

  const renderFrame = () => {
    frameId = requestAnimationFrame(renderFrame);

    const elapsed = clock.getElapsedTime();
    const scrollable = Math.max(1, document.body.scrollHeight - window.innerHeight);
    const target = Math.min(1, (window.scrollY || 0) / scrollable);

    pointer.x += (pointer.targetX - pointer.x) * 0.045;
    pointer.y += (pointer.targetY - pointer.y) * 0.045;
    // Ease the scroll value so the camera glides instead of snapping.
    scrollProgress += (target - scrollProgress) * 0.07;
    const progress = scrollProgress;

    if (!reducedMotion) {
      // The field drifts and banks as you travel down the page.
      points.rotation.y = elapsed * 0.02 + progress * 0.65 + pointer.x * 0.14;
      points.rotation.x = pointer.y * 0.09 + progress * 0.14;
      points.rotation.z = progress * 0.3;
      points.position.y = Math.sin(elapsed * 0.12) * 0.7;

      // Each solid follows its own slow lissajous orbit.
      shapes.forEach(({ mesh, origin }, index) => {
        const [originX, originY, originZ] = origin;
        const rate = 1 + index * 0.55;
        mesh.position.x = originX + Math.sin(elapsed * 0.13 * rate + index) * 2.3;
        mesh.position.y = originY + Math.cos(elapsed * 0.1 * rate + index * 1.7) * 1.9;
        mesh.position.z = originZ + Math.sin(elapsed * 0.075 * rate) * 2.6;
        mesh.rotation.x = elapsed * (0.09 + index * 0.03);
        mesh.rotation.y = elapsed * (0.13 - index * 0.02);
        mesh.rotation.z = elapsed * 0.05 * (index % 2 ? -1 : 1);
      });
    }

    // The camera travels a curved arc through the field rather than zooming.
    const angle = progress * Math.PI * 1.25;
    camera.position.x = Math.sin(angle) * 7.6 + pointer.x * 1.1;
    camera.position.y =
      -progress * 8 + Math.sin(progress * Math.PI * 2.2) * 1.5 + pointer.y * -0.7;
    camera.position.z = 15.5 - progress * 2.4 + Math.cos(angle) * 3.4;

    lookAt.x += (Math.sin(angle * 0.62) * 3.4 - lookAt.x) * 0.05;
    lookAt.y += (-progress * 8 - lookAt.y) * 0.05;
    camera.lookAt(lookAt.x, lookAt.y, -15);
    camera.rotation.z = Math.sin(angle) * 0.065;

    renderer.render(scene, camera);
  };

  renderFrame();

  return {
    setPalette(next) {
      const accentColor = new Color(next.accent);
      const baseColor = new Color(next.base);
      const colorAttribute = geometry.getAttribute('color') as BufferAttribute;

      for (let i = 0; i < isAccent.length; i += 1) {
        const color = isAccent[i] ? accentColor : baseColor;
        colorAttribute.setXYZ(i, color.r, color.g, color.b);
      }
      colorAttribute.needsUpdate = true;

      pointsMaterial.opacity = next.pointOpacity;
      pointsMaterial.size = next.pointSize;

      shapes.forEach(({ material }, index) => {
        material.color.set(next.shapeColor);
        material.opacity = next.shapeOpacities[index === 0 ? 0 : 1] ?? 0.1;
      });
    },

    dispose() {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);

      geometry.dispose();
      pointsMaterial.dispose();
      shapes.forEach(({ mesh, material }) => {
        mesh.geometry.dispose();
        material.dispose();
      });
      renderer.dispose();
    },
  };
}
