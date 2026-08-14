export type CometTrailOptions = {
  canvas: HTMLCanvasElement;
  /** Returns the current accent as an `r, g, b` string, re-read every frame so theme changes apply instantly. */
  getColorChannels: () => string;
};

const BEAD_COUNT = 22;
const HISTORY_LIMIT = 240;
const FOLLOW_EASING = 0.55;
const HEAD_RADIUS = 5.5;
const GLOW_RADIUS = 26;
const MAX_PIXEL_RATIO = 2;

type Bead = { x: number; y: number };

/**
 * Pointer-following comet drawn on its own 2D overlay canvas above the page.
 * Each bead lags the one before it, so the trail bunches on fast movement and
 * strings out on slow movement.
 */
export function createCometTrail({ canvas, getColorChannels }: CometTrailOptions) {
  const context = canvas.getContext('2d');
  if (!context) return null;

  const beads: Bead[] = Array.from({ length: BEAD_COUNT }, () => ({ x: 0, y: 0 }));
  const history: number[] = [];
  const pointer = { x: 0, y: 0 };
  let hasPointer = false;
  let frameId = 0;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const handlePointerMove = (event: PointerEvent) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;

    if (!hasPointer) {
      hasPointer = true;
      // Seed every bead at the cursor so the trail does not whip in from 0,0.
      for (const bead of beads) {
        bead.x = pointer.x;
        bead.y = pointer.y;
      }
    }
  };

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', handlePointerMove, { passive: true });

  const draw = () => {
    frameId = requestAnimationFrame(draw);
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (!hasPointer) return;

    history.unshift(pointer.x, pointer.y);
    if (history.length > HISTORY_LIMIT) history.length = HISTORY_LIMIT;

    const frames = history.length / 2;
    const channels = getColorChannels();

    for (let index = BEAD_COUNT - 1; index >= 0; index -= 1) {
      const sample = Math.min(frames - 1, index * 3) * 2;
      const bead = beads[index]!;
      bead.x += ((history[sample] ?? bead.x) - bead.x) * FOLLOW_EASING;
      bead.y += ((history[sample + 1] ?? bead.y) - bead.y) * FOLLOW_EASING;

      const falloff = index / (BEAD_COUNT - 1);
      context.beginPath();
      context.arc(bead.x, bead.y, HEAD_RADIUS * (1 - falloff * 0.86), 0, Math.PI * 2);
      context.fillStyle = `rgba(${channels}, ${((1 - falloff) * 0.8 + 0.03).toFixed(3)})`;
      context.fill();
    }

    const head = beads[0]!;
    const glow = context.createRadialGradient(head.x, head.y, 0, head.x, head.y, GLOW_RADIUS);
    glow.addColorStop(0, `rgba(${channels}, 0.3)`);
    glow.addColorStop(1, `rgba(${channels}, 0)`);
    context.fillStyle = glow;
    context.beginPath();
    context.arc(head.x, head.y, GLOW_RADIUS, 0, Math.PI * 2);
    context.fill();
  };

  draw();

  return {
    dispose() {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
    },
  };
}
