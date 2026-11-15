/**
 * CF Studio - Atmospheric Particle Animator
 * Lightweight, hardware-accelerated 2D canvas animation for Impressive themes.
 * Runs on a detached fixed canvas inside #cfs-bg-layer behind Codeforces content.
 * Features:
 * - Rain visibly falls
 * - Aurora slowly moves
 * - Autumn leaves visibly fall and drift
 * - Snowflakes visibly fall
 * - Zero interaction interference (pointer-events: none)
 * - Zero layout changes
 * - Automatic pause when tab is inactive
 * - Respects prefers-reduced-motion and animationsEnabled toggle
 */

let activeCanvas = null;
let activeCtx = null;
let animFrameId = null;
let currentEffect = null;
let particles = [];
let lastTimestamp = 0;
let resizeHandler = null;

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function initParticles(effect, width, height) {
  particles = [];
  const count = getParticleCount(effect);

  for (let i = 0; i < count; i++) {
    particles.push(createParticle(effect, width, height, true));
  }
}

function getParticleCount(effect) {
  switch (effect) {
    case 'rain':
    case 'anime-rain':
      return 55;
    case 'snow':
    case 'snowfall':
      return 45;
    case 'leaves':
    case 'autumn-leaves':
      return 26;
    case 'petals':
      return 28;
    case 'bubbles':
      return 32;
    case 'fireflies':
      return 24;
    case 'spores':
      return 24;
    case 'aurora':
      return 4; // 4 wave control points
    default:
      return 20;
  }
}

function createParticle(effect, width, height, initial = false) {
  const startY = initial ? randomRange(0, height) : randomRange(-60, -10);

  switch (effect) {
    case 'rain':
    case 'anime-rain':
      return {
        x: randomRange(0, width + 100),
        y: startY,
        len: randomRange(16, 28),
        speed: randomRange(14, 22),
        color: 'rgba(148, 163, 184, 0.45)',
        width: randomRange(1.2, 1.8),
      };

    case 'snow':
    case 'snowfall':
      return {
        x: randomRange(0, width),
        y: startY,
        radius: randomRange(1.5, 3.8),
        speed: randomRange(0.8, 2.2),
        swaySpeed: randomRange(0.015, 0.035),
        swayAmount: randomRange(0.6, 1.8),
        swayOffset: randomRange(0, Math.PI * 2),
        opacity: randomRange(0.5, 0.9),
      };

    case 'leaves':
    case 'autumn-leaves':
      return {
        x: randomRange(0, width),
        y: startY,
        size: randomRange(7, 14),
        speed: randomRange(1.2, 2.6),
        driftSpeed: randomRange(0.015, 0.03),
        driftAmount: randomRange(1.4, 2.8),
        driftOffset: randomRange(0, Math.PI * 2),
        rotation: randomRange(0, Math.PI * 2),
        rotSpeed: randomRange(-0.02, 0.02),
        color: ['#ea580c', '#f59e0b', '#dc2626', '#b45309'][Math.floor(Math.random() * 4)],
        opacity: randomRange(0.65, 0.88),
      };

    case 'petals':
      return {
        x: randomRange(0, width),
        y: startY,
        size: randomRange(6, 11),
        speed: randomRange(0.9, 2.0),
        driftSpeed: randomRange(0.01, 0.025),
        driftAmount: randomRange(1.0, 2.2),
        driftOffset: randomRange(0, Math.PI * 2),
        rotation: randomRange(0, Math.PI * 2),
        rotSpeed: randomRange(-0.015, 0.015),
        color: '#f472b6',
        opacity: randomRange(0.55, 0.8),
      };

    case 'bubbles':
      return {
        x: randomRange(0, width),
        y: initial ? randomRange(0, height) : randomRange(height + 10, height + 60),
        radius: randomRange(2.5, 6.5),
        speed: randomRange(0.8, 2.0),
        wobbleSpeed: randomRange(0.02, 0.04),
        wobbleOffset: randomRange(0, Math.PI * 2),
        color: 'rgba(56, 189, 248, 0.45)',
      };

    case 'fireflies':
      return {
        x: randomRange(0, width),
        y: randomRange(0, height),
        radius: randomRange(2.0, 4.0),
        vx: randomRange(-0.4, 0.4),
        vy: randomRange(-0.4, 0.4),
        phase: randomRange(0, Math.PI * 2),
        pulseSpeed: randomRange(0.02, 0.04),
        color: '#fde047',
      };

    case 'spores':
      return {
        x: randomRange(0, width),
        y: initial ? randomRange(0, height) : randomRange(height + 10, height + 40),
        radius: randomRange(1.8, 3.5),
        speed: randomRange(0.5, 1.4),
        driftOffset: randomRange(0, Math.PI * 2),
        color: '#c084fc',
        opacity: randomRange(0.4, 0.75),
      };

    case 'aurora':
      return {
        phase: randomRange(0, Math.PI * 2),
        speed: randomRange(0.003, 0.007),
        amp: randomRange(40, 90),
      };

    default:
      return {
        x: randomRange(0, width),
        y: startY,
        radius: 2,
        speed: 1,
      };
  }
}

function updateAndDrawParticles(ctx, width, height, time) {
  ctx.clearRect(0, 0, width, height);

  switch (currentEffect) {
    case 'rain':
    case 'anime-rain': {
      ctx.lineWidth = 1.5;
      for (const p of particles) {
        ctx.strokeStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.len * 0.28, p.y + p.len);
        ctx.stroke();

        p.y += p.speed;
        p.x -= p.speed * 0.28;

        if (p.y > height + 20 || p.x < -20) {
          p.y = randomRange(-40, -10);
          p.x = randomRange(0, width + 60);
        }
      }
      break;
    }

    case 'snow':
    case 'snowfall': {
      for (const p of particles) {
        p.y += p.speed;
        p.swayOffset += p.swaySpeed;
        const currentX = p.x + Math.sin(p.swayOffset) * p.swayAmount * 10;

        ctx.fillStyle = `rgba(226, 232, 240, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(currentX, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        if (p.y > height + 10) {
          p.y = randomRange(-30, -5);
          p.x = randomRange(0, width);
        }
      }
      break;
    }

    case 'leaves':
    case 'autumn-leaves': {
      for (const p of particles) {
        p.y += p.speed;
        p.driftOffset += p.driftSpeed;
        p.rotation += p.rotSpeed;
        const currentX = p.x + Math.sin(p.driftOffset) * p.driftAmount * 15;

        ctx.save();
        ctx.translate(currentX, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;

        // Elegant leaf silhouette
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.y > height + 20) {
          p.y = randomRange(-40, -10);
          p.x = randomRange(0, width);
        }
      }
      break;
    }

    case 'petals': {
      for (const p of particles) {
        p.y += p.speed;
        p.driftOffset += p.driftSpeed;
        p.rotation += p.rotSpeed;
        const currentX = p.x + Math.sin(p.driftOffset) * p.driftAmount * 12;

        ctx.save();
        ctx.translate(currentX, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;

        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (p.y > height + 20) {
          p.y = randomRange(-30, -10);
          p.x = randomRange(0, width);
        }
      }
      break;
    }

    case 'bubbles': {
      for (const p of particles) {
        p.y -= p.speed;
        p.wobbleOffset += p.wobbleSpeed;
        const currentX = p.x + Math.sin(p.wobbleOffset) * 6;

        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(currentX, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();

        if (p.y < -10) {
          p.y = randomRange(height + 10, height + 40);
          p.x = randomRange(0, width);
        }
      }
      break;
    }

    case 'fireflies': {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.phase += p.pulseSpeed;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const pulse = 0.4 + 0.5 * Math.sin(p.phase);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = pulse * 0.75;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = pulse * 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }

    case 'spores': {
      for (const p of particles) {
        p.y -= p.speed;
        p.driftOffset += 0.02;
        const currentX = p.x + Math.sin(p.driftOffset) * 4;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.beginPath();
        ctx.arc(currentX, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        if (p.y < -10) {
          p.y = randomRange(height + 10, height + 30);
          p.x = randomRange(0, width);
        }
      }
      break;
    }

    case 'aurora': {
      // Slowly drifting undulating aurora curtain
      const t = time * 0.0008;
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const grad = ctx.createLinearGradient(0, height * 0.1, 0, height * 0.6);
      grad.addColorStop(0, 'rgba(94, 234, 212, 0)');
      grad.addColorStop(0.3, 'rgba(94, 234, 212, 0.16)');
      grad.addColorStop(0.6, 'rgba(192, 132, 252, 0.14)');
      grad.addColorStop(1, 'rgba(168, 85, 247, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.35);

      for (let x = 0; x <= width; x += 60) {
        const y = height * 0.35 +
          Math.sin(x * 0.003 + t) * 45 +
          Math.cos(x * 0.005 - t * 0.7) * 30;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height * 0.65);
      ctx.lineTo(0, height * 0.65);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      break;
    }

    default:
      break;
  }
}

function loop(timestamp) {
  if (!activeCanvas || !activeCtx) return;

  // Pause when document is hidden to save GPU/CPU
  if (typeof document !== 'undefined' && document.hidden) {
    animFrameId = requestAnimationFrame(loop);
    return;
  }

  const width = activeCanvas.width;
  const height = activeCanvas.height;

  updateAndDrawParticles(activeCtx, width, height, timestamp);
  animFrameId = requestAnimationFrame(loop);
}

/**
 * Starts or updates atmospheric particle animation on the background canvas.
 * @param {HTMLCanvasElement} canvas
 * @param {string} effectName
 */
export function startAtmosphericAnimation(canvas, effectName) {
  if (!canvas || typeof window === 'undefined') return;

  const prefersReduced = typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    stopAtmosphericAnimation();
    return;
  }

  // If already running this effect on this canvas, keep going
  if (activeCanvas === canvas && currentEffect === effectName && animFrameId) {
    return;
  }

  stopAtmosphericAnimation();

  activeCanvas = canvas;
  activeCtx = canvas.getContext ? canvas.getContext('2d') : null;
  if (!activeCtx) return;

  currentEffect = effectName;

  const w = window.innerWidth || 1920;
  const h = window.innerHeight || 1080;
  canvas.width = w;
  canvas.height = h;

  initParticles(effectName, w, h);

  if (!resizeHandler) {
    resizeHandler = () => {
      if (activeCanvas) {
        activeCanvas.width = window.innerWidth || 1920;
        activeCanvas.height = window.innerHeight || 1080;
        initParticles(currentEffect, activeCanvas.width, activeCanvas.height);
      }
    };
    window.addEventListener('resize', resizeHandler, { passive: true });
  }

  animFrameId = requestAnimationFrame(loop);
}

/**
 * Stops any running atmospheric particle animation.
 */
export function stopAtmosphericAnimation() {
  if (animFrameId) {
    cancelAnimationFrame(animFrameId);
    animFrameId = null;
  }
  if (activeCtx && activeCanvas) {
    activeCtx.clearRect(0, 0, activeCanvas.width, activeCanvas.height);
  }
  activeCanvas = null;
  activeCtx = null;
  currentEffect = null;
  particles = [];

  if (resizeHandler && typeof window !== 'undefined') {
    window.removeEventListener('resize', resizeHandler);
    resizeHandler = null;
  }
}
