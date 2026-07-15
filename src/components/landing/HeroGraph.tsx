import React from 'react';

// A compact, self-animating knowledge-graph vignette used on the landing page
// and in product teaser cards. Purely decorative: seeded with example labels
// (or real tags via props) and rendered with the same visual language as the
// full KnowledgeGraph view.
interface HeroGraphProps {
  labels?: string[];
  className?: string;
}

const DEFAULT_LABELS = [
  'design', 'health', 'reading', 'ideas', 'work',
  'travel', 'recipes', 'code', 'music', 'goals', 'quotes', 'films',
];

const HUES = [160, 200, 250, 280, 320, 30];

interface Node {
  label: string;
  x: number; y: number; vx: number; vy: number;
  r: number; hue: number; phase: number;
}

export default function HeroGraph({ labels = DEFAULT_LABELS, className = '' }: HeroGraphProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const resize = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rand = (() => {
      // Deterministic per-mount layout so it always looks composed.
      let seed = 42;
      return () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
    })();

    const nodes: Node[] = labels.slice(0, 12).map((label, i) => ({
      label,
      x: width * (0.15 + rand() * 0.7),
      y: height * (0.15 + rand() * 0.7),
      vx: 0,
      vy: 0,
      r: 8 + rand() * 14,
      hue: HUES[i % HUES.length],
      phase: rand() * Math.PI * 2,
    }));

    // Sparse edges between nearby-indexed nodes for a composed look.
    const edges: Array<[number, number]> = [];
    for (let i = 0; i < nodes.length; i++) {
      edges.push([i, (i + 1) % nodes.length]);
      if (i % 3 === 0) edges.push([i, (i + 4) % nodes.length]);
    }

    let frame = 0;
    let time = 0;

    const step = () => {
      time += 0.006;

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const distSq = Math.max(120, dx * dx + dy * dy);
          const f = 900 / distSq;
          const d = Math.sqrt(distSq);
          n.vx += (dx / d) * f; n.vy += (dy / d) * f;
          m.vx -= (dx / d) * f; m.vy -= (dy / d) * f;
        }
        n.vx += (width / 2 - n.x) * 0.0011;
        n.vy += (height / 2 - n.y) * 0.0011;
      }

      for (const [a, b] of edges) {
        const na = nodes[a];
        const nb = nodes[b];
        const dx = nb.x - na.x;
        const dy = nb.y - na.y;
        const d = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const f = (d - 110) * 0.002;
        na.vx += (dx / d) * f; na.vy += (dy / d) * f;
        nb.vx -= (dx / d) * f; nb.vy -= (dy / d) * f;
      }

      ctx.clearRect(0, 0, width, height);

      for (const [a, b] of edges) {
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
        ctx.stroke();
      }

      for (const n of nodes) {
        n.vx *= 0.85;
        n.vy *= 0.85;
        n.x += n.vx + Math.sin(time * 1.3 + n.phase) * 0.22;
        n.y += n.vy + Math.cos(time + n.phase) * 0.22;
        n.x = Math.max(n.r + 2, Math.min(width - n.r - 2, n.x));
        n.y = Math.max(n.r + 2, Math.min(height - n.r - 2, n.y));

        const breathe = 1 + Math.sin(time * 2 + n.phase) * 0.06;
        const r = n.r * breathe;

        const glow = ctx.createRadialGradient(n.x, n.y, r * 0.2, n.x, n.y, r * 2.4);
        glow.addColorStop(0, `hsla(${n.hue}, 75%, 55%, 0.35)`);
        glow.addColorStop(1, `hsla(${n.hue}, 75%, 55%, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 2.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `hsla(${n.hue}, 72%, 58%, 1)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.55)';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (n.r > 11) {
          ctx.font = "500 11px 'Inter Variable', -apple-system, sans-serif";
          ctx.textAlign = 'center';
          ctx.fillStyle = 'rgba(243,244,246,0.9)';
          ctx.fillText(n.label, n.x, n.y - r - 6);
        }
      }

      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [labels]);

  return (
    <div ref={containerRef} className={className || 'relative w-full h-full'}>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
