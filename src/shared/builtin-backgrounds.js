/**
 * CF Studio - Built-in Light Background Patterns & Gradients
 * Original CSS patterns adhering to light theme aesthetics.
 * Curated, restrained, lightweight. Zero third-party assets.
 */

export const BUILTIN_BACKGROUNDS = Object.freeze([
  Object.freeze({
    id: 'soft-grid',
    name: 'Soft Grid',
    description: 'Minimal technical drafting grid on clean ivory.',
    style: {
      backgroundImage: 'radial-gradient(circle, var(--cfs-border) 1.2px, transparent 1.2px)',
      backgroundSize: '20px 20px',
      backgroundRepeat: 'repeat',
    },
  }),
  Object.freeze({
    id: 'sakura-pattern',
    name: 'Sakura Petals',
    description: 'Subtle spring petal ambient with soft rose hints.',
    style: {
      backgroundImage: 'radial-gradient(ellipse at 20% 20%, rgba(225, 74, 112, 0.08) 0%, transparent 40%), radial-gradient(ellipse at 80% 80%, rgba(225, 74, 112, 0.06) 0%, transparent 40%)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    },
  }),
  Object.freeze({
    id: 'subtle-topo',
    name: 'Subtle Topo',
    description: 'Calm topographic elevation lines with gentle contrast.',
    style: {
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 12px, var(--cfs-border) 12px, var(--cfs-border) 13px)',
      backgroundSize: 'auto',
      backgroundRepeat: 'repeat',
    },
  }),
  Object.freeze({
    id: 'sunlight-gradient',
    name: 'Sunlight Wash',
    description: 'Warm morning daylight gradient from top-right.',
    style: {
      backgroundImage: 'linear-gradient(135deg, rgba(255, 238, 204, 0.45) 0%, rgba(255, 255, 255, 0) 60%)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    },
  }),
  Object.freeze({
    id: 'watercolor-wash',
    name: 'Watercolor Wash',
    description: 'Soft artistic pastel glaze with gentle ambient flow.',
    style: {
      backgroundImage: 'radial-gradient(ellipse at 15% 30%, rgba(2, 132, 199, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 85% 70%, rgba(145, 66, 154, 0.06) 0%, transparent 50%)',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    },
  }),
  Object.freeze({
    id: 'minimal-dots',
    name: 'Minimal Dots',
    description: 'Clean micro-matrix dots for clean structure.',
    style: {
      backgroundImage: 'radial-gradient(circle, var(--cfs-text-muted) 0.8px, transparent 0.8px)',
      backgroundSize: '14px 14px',
      backgroundRepeat: 'repeat',
    },
  }),
]);

export function getBuiltinBackground(id) {
  return BUILTIN_BACKGROUNDS.find((b) => b.id === id) || BUILTIN_BACKGROUNDS[0];
}
