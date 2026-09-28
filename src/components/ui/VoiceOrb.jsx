import { useEffect, useRef } from 'react';

const COLORS = {
  ai: [
    { r: 0, g: 242, b: 254 },   // Cyan
    { r: 79, g: 172, b: 254 },  // Bright Blue
    { r: 161, g: 140, b: 209 }, // Soft Purple
  ],
  user: [
    { r: 255, g: 255, b: 255 }, // Pure White
    { r: 226, g: 226, b: 226 }, // Silver
    { r: 180, g: 220, b: 255 }, // Ice Blue
  ]
};

export default function VoiceOrb({ level = 0, active = false, variant = 'ai', size = 120, className = '' }) {
  const canvasRef = useRef(null);
  const levelRef = useRef(0);
  const smoothedLevelRef = useRef(0);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = size / 2;
    const cy = size / 2;
    const palette = COLORS[variant] || COLORS.ai;

    let raf = 0;
    let cancelled = false;

    function drawVolumetricNode(x, y, radius, color, alphaMultiplier) {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${1 * alphaMultiplier})`);
      grad.addColorStop(0.4, `rgba(${color.r}, ${color.g}, ${color.b}, ${0.5 * alphaMultiplier})`);
      grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
      
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    }

    function frame() {
      if (cancelled) return;
      
      const targetLevel = active ? levelRef.current : 0;
      smoothedLevelRef.current += (targetLevel - smoothedLevelRef.current) * 0.15;
      const amp = Math.max(0.01, smoothedLevelRef.current); 
      
      const t = performance.now() / 1000;
      ctx.clearRect(0, 0, size, size);
      
      // Additive Blending for 3D Holographic effect
      ctx.globalCompositeOperation = 'screen';

      const coreIdle = active ? Math.sin(t * 2) * size * 0.02 : 0;
      const coreRadius = (size * 0.25) + coreIdle + (amp * size * 0.2);
      
      drawVolumetricNode(cx, cy, coreRadius, palette[0], 0.8 + (amp * 0.2));

      if (active) {
        const x1 = cx + Math.sin(t * 1.5) * (size * 0.12 * (1 + amp * 2));
        const y1 = cy + Math.cos(t * 2.1) * (size * 0.12 * (1 + amp * 2));
        drawVolumetricNode(x1, y1, coreRadius * 0.8, palette[1], 0.7 + amp);

        const x2 = cx + Math.cos(t * 1.8) * (size * 0.14 * (1 + amp * 1.5));
        const y2 = cy + Math.sin(t * 2.4) * (size * 0.14 * (1 + amp * 1.5));
        drawVolumetricNode(x2, y2, coreRadius * 0.9, palette[2], 0.7 + amp);

        const x3 = cx + Math.sin(t * 3) * (size * 0.08 * (1 + amp));
        const y3 = cy + Math.cos(t * 3.5) * (size * 0.08 * (1 + amp));
        drawVolumetricNode(x3, y3, coreRadius * 0.5, palette[0], 0.9 + amp);
      }

      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    }
    
    raf = requestAnimationFrame(frame);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [variant, size, active]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} className={className} role="img" />;
}