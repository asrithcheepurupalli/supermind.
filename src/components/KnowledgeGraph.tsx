import React from 'react';
import { motion } from 'framer-motion';
import { Pause, Play, Shuffle } from 'lucide-react';
import { SavedContent } from '../types';
import { useStore, defaultFilter } from '../store/useStore';
import { hapticTap } from '../utils/haptics';

interface GraphNode {
  tag: string;
  count: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  phase: number; // for the breathing effect
}

interface GraphEdge {
  a: number;
  b: number;
  weight: number;
}

const MAX_NODES = 36;
const MAX_EDGES = 90;
// A small set of hues in the app's family, assigned by stable tag order.
const HUES = [160, 200, 250, 280, 320, 30];

const buildGraph = (content: SavedContent[], width: number, height: number) => {
  const items = content.filter(c => !c.metadata?.isGuide);
  const counts = new Map<string, number>();
  const pairs = new Map<string, number>();

  for (const item of items) {
    const tags = [...new Set(item.tags)];
    for (const tag of tags) counts.set(tag, (counts.get(tag) || 0) + 1);
    const sorted = [...tags].sort();
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const key = `${sorted[i]}|${sorted[j]}`;
        pairs.set(key, (pairs.get(key) || 0) + 1);
      }
    }
  }

  const topTags = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_NODES);

  const indexOf = new Map(topTags.map(([tag], i) => [tag, i]));
  const maxCount = Math.max(1, ...topTags.map(([, c]) => c));

  const nodes: GraphNode[] = topTags.map(([tag, count], i) => {
    const angle = (i / Math.max(1, topTags.length)) * Math.PI * 2;
    const spread = Math.min(width, height) * 0.3;
    return {
      tag,
      count,
      x: width / 2 + Math.cos(angle) * spread * (0.5 + Math.random() * 0.5),
      y: height / 2 + Math.sin(angle) * spread * (0.5 + Math.random() * 0.5),
      vx: 0,
      vy: 0,
      radius: 7 + (count / maxCount) * 18,
      hue: HUES[i % HUES.length],
      phase: Math.random() * Math.PI * 2,
    };
  });

  const edges: GraphEdge[] = [...pairs.entries()]
    .map(([key, weight]) => {
      const [ta, tb] = key.split('|');
      const a = indexOf.get(ta);
      const b = indexOf.get(tb);
      return a !== undefined && b !== undefined ? { a, b, weight } : null;
    })
    .filter((e): e is GraphEdge => e !== null)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_EDGES);

  return { nodes, edges };
};

export default function KnowledgeGraph() {
  const { content, setFilter, setActiveView, settings } = useStore();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [hoveredTag, setHoveredTag] = React.useState<string | null>(null);
  const [paused, setPaused] = React.useState(false);
  const [seed, setSeed] = React.useState(0);
  const pausedRef = React.useRef(false);
  pausedRef.current = paused;
  const hoverRef = React.useRef<number>(-1);
  const isDark = settings.theme === 'dark' ||
    (settings.theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const nonGuideCount = React.useMemo(
    () => content.filter(c => !c.metadata?.isGuide && c.tags.length > 0).length,
    [content]
  );

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Paper Mind inks, read from the live CSS tokens. Re-read every frame:
    // this effect can run before App toggles the `.dark` class, and reading
    // once at setup would freeze the wrong palette onto the canvas.
    let INK = '#17150f';
    let ACCENT = '#f04e23';
    let PAPER = '#fffdf7';
    let INK_LINE = 'rgba(23,21,15,0.16)';
    const readTokens = () => {
      const css = getComputedStyle(document.documentElement);
      INK = css.getPropertyValue('--ink').trim() || INK;
      ACCENT = css.getPropertyValue('--accent').trim() || ACCENT;
      PAPER = css.getPropertyValue('--paper-raised').trim() || PAPER;
      INK_LINE = css.getPropertyValue('--ink-line').trim() || INK_LINE;
    };
    readTokens();

    let width = container.clientWidth;
    let height = container.clientHeight;
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

    const { nodes, edges } = buildGraph(content, width, height);
    if (nodes.length === 0) return;

    const neighbors = new Map<number, Set<number>>();
    for (const e of edges) {
      if (!neighbors.has(e.a)) neighbors.set(e.a, new Set());
      if (!neighbors.has(e.b)) neighbors.set(e.b, new Set());
      neighbors.get(e.a)!.add(e.b);
      neighbors.get(e.b)!.add(e.a);
    }

    let mouseX = -1000;
    let mouseY = -1000;
    let animationFrame = 0;
    let time = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };
    const handleClick = () => {
      if (hoverRef.current >= 0) {
        const tag = nodes[hoverRef.current].tag;
        hapticTap();
        setFilter({ ...defaultFilter, tags: [tag] });
        setActiveView('timeline');
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', resize);

    const step = () => {
      if (pausedRef.current) {
        animationFrame = requestAnimationFrame(step);
        return;
      }
      time += 0.008;

      // Physics: pairwise repulsion, spring edges, gentle centering.
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const distSq = Math.max(100, dx * dx + dy * dy);
          const force = 2200 / distSq;
          const dist = Math.sqrt(distSq);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          n.vx += fx; n.vy += fy;
          m.vx -= fx; m.vy -= fy;
        }
        // center gravity
        n.vx += (width / 2 - n.x) * 0.0012;
        n.vy += (height / 2 - n.y) * 0.0012;
      }

      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.max(1, Math.sqrt(dx * dx + dy * dy));
        const target = 120 - Math.min(40, e.weight * 8);
        const force = (dist - target) * 0.0028 * Math.min(3, e.weight);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      }

      // Integrate with damping; keep everything gently alive.
      hoverRef.current = -1;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.vx *= 0.86;
        n.vy *= 0.86;
        n.x += n.vx + Math.sin(time * 1.4 + n.phase) * 0.18;
        n.y += n.vy + Math.cos(time * 1.1 + n.phase) * 0.18;
        n.x = Math.max(n.radius + 4, Math.min(width - n.radius - 4, n.x));
        n.y = Math.max(n.radius + 4, Math.min(height - n.radius - 4, n.y));

        const dx = mouseX - n.x;
        const dy = mouseY - n.y;
        if (dx * dx + dy * dy < (n.radius + 10) * (n.radius + 10)) {
          hoverRef.current = i;
        }
      }

      const hovered = hoverRef.current;
      setHoveredTag(hovered >= 0 ? nodes[hovered].tag : null);
      canvas.style.cursor = hovered >= 0 ? 'pointer' : 'default';

      // ---- Draw ----
      readTokens();
      ctx.clearRect(0, 0, width, height);

      // Notebook dot grid behind the constellation.
      ctx.fillStyle = INK_LINE;
      for (let gx = 14; gx < width; gx += 26) {
        for (let gy = 14; gy < height; gy += 26) {
          ctx.fillRect(gx, gy, 1.1, 1.1);
        }
      }

      // Curved gradient edges with energy particles flowing along them.
      const quadPoint = (ax: number, ay: number, cx: number, cy: number, bx: number, by: number, t: number) => {
        const u = 1 - t;
        return {
          x: u * u * ax + 2 * u * t * cx + t * t * bx,
          y: u * u * ay + 2 * u * t * cy + t * t * by,
        };
      };

      for (let ei = 0; ei < edges.length; ei++) {
        const e = edges[ei];
        const a = nodes[e.a];
        const b = nodes[e.b];
        const connectedToHover = hovered >= 0 && (e.a === hovered || e.b === hovered);
        const dimmedEdge = hovered >= 0 && !connectedToHover;

        // Curve control point: perpendicular offset that sways with time.
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const sway = Math.sin(time * 0.9 + ei) * 0.06;
        const cx = mx - dy * (0.14 + sway);
        const cy = my + dx * (0.14 + sway);

        ctx.globalAlpha = dimmedEdge ? 0.12 : connectedToHover ? 0.95 : Math.min(0.55, 0.22 + e.weight * 0.1);
        ctx.strokeStyle = connectedToHover ? ACCENT : INK;
        ctx.lineWidth = connectedToHover ? 1.8 : Math.min(1.5, 0.6 + e.weight * 0.25);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(cx, cy, b.x, b.y);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Energy particles: one per strong edge, two when hovered.
        if (!dimmedEdge && (e.weight >= 2 || connectedToHover)) {
          const particleCount = connectedToHover ? 2 : 1;
          const speed = connectedToHover ? 0.35 : 0.12;
          for (let pi = 0; pi < particleCount; pi++) {
            const t = ((time * speed + ei * 0.37 + pi * 0.5) % 1);
            const pt = quadPoint(a.x, a.y, cx, cy, b.x, b.y, t);
            const pr = connectedToHover ? 2.4 : 1.7;
            ctx.fillStyle = ACCENT;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pr, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // Nodes: shaded orbs with bloom, specular highlight, and rim.
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const isHovered = i === hovered;
        const isNeighbor = hovered >= 0 && neighbors.get(hovered)?.has(i);
        const dimmed = hovered >= 0 && !isHovered && !isNeighbor;
        const breathe = 1 + Math.sin(time * 2 + n.phase) * 0.05;
        const r = n.radius * (isHovered ? 1.28 : breathe);

        const alpha = dimmed ? 0.22 : 1;
        // Big tags are vermilion seals; small tags are hollow ink rings.
        const filled = n.radius > 13 || isHovered;

        ctx.globalAlpha = alpha;
        ctx.fillStyle = isHovered ? INK : filled ? ACCENT : PAPER;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // hover: hand-drawn dashed orbit, slowly rotating
        if (isHovered) {
          ctx.save();
          ctx.translate(n.x, n.y);
          ctx.rotate(time * 1.6);
          ctx.setLineDash([5, 6]);
          ctx.strokeStyle = ACCENT;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, r + 8, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // labels in ink with a soft pill backdrop, never in series color
        const showLabel = isHovered || isNeighbor || n.radius > 10;
        if (showLabel && !dimmed) {
          const fontSize = isHovered ? 11 : 9.5;
          ctx.font = `500 ${fontSize}px 'JetBrains Mono', ui-monospace, monospace`;
          ctx.textAlign = 'center';
          const label = n.tag.toUpperCase();
          const tw = ctx.measureText(label).width;
          const pad = 6;
          const ly = n.y - r - (isHovered ? 14 : 11);
          ctx.fillStyle = PAPER;
          ctx.strokeStyle = isHovered ? ACCENT : INK_LINE;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(n.x - tw / 2 - pad, ly - fontSize, tw + pad * 2, fontSize + 8, 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = INK;
          ctx.fillText(label, n.x, ly + 3);
          if (isHovered) {
            ctx.font = `500 9px 'JetBrains Mono', ui-monospace, monospace`;
            ctx.fillStyle = ACCENT;
            ctx.fillText(`${n.count} ITEM${n.count !== 1 ? 'S' : ''} · CLICK TO OPEN`, n.x, n.y + r + 20);
          }
        }
      }

      animationFrame = requestAnimationFrame(step);
    };

    animationFrame = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrame);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', resize);
    };
  }, [content, isDark, setFilter, setActiveView, seed]);

  return (
    <div className="h-full flex flex-col px-6 pt-8 pb-6 max-w-6xl mx-auto w-full">
      {/* Plate heading — like a figure in a field notebook */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex items-end justify-between gap-4"
      >
        <div>
          <p className="font-label text-[10px] text-accent mb-2">
            Plate II · {nonGuideCount} entries · {new Date().toLocaleDateString('en-US', { year: 'numeric' })}
          </p>
          <h2 className="font-display text-4xl sm:text-5xl text-ink leading-none">
            The constellation<span className="text-accent">.</span>
          </h2>
        </div>
        <p className="font-label text-[9px] text-ink-faint text-right hidden sm:block max-w-[220px] leading-relaxed pb-1">
          {hoveredTag ? (
            <>reading: <span className="text-accent">#{hoveredTag}</span> — click to open</>
          ) : (
            <>every tag is a star. tags that appear together are drawn together.</>
          )}
        </p>
      </motion.div>

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="card-ink-static flex-1 rounded-sm overflow-hidden relative min-h-[400px] mb-20 sm:mb-4"
      >
        {nonGuideCount < 2 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 dot-grid">
            <span className="stamp mb-5">Uncharted</span>
            <h3 className="font-display text-3xl text-ink mb-3">Your graph is waiting to grow</h3>
            <p className="text-ink-soft text-sm max-w-sm leading-relaxed">
              Add a few notes and links — as tags start co-occurring, this becomes a living map
              of your mind's connections.
            </p>
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} className="absolute inset-0" />
            {/* Legend — bottom-left corner, like a map key */}
            <div className="absolute bottom-3 left-4 pointer-events-none hidden sm:flex items-center gap-4 font-label text-[8px] text-ink-faint">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[var(--accent)]" /> major theme
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full border-[1.5px] border-[var(--ink)]" /> minor tag
              </span>
              <span className="hidden md:inline">line weight = how often they meet</span>
            </div>
            {/* Simulation controls — instrument switches */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => setPaused(p => !p)}
                title={paused ? 'Resume motion' : 'Pause motion'}
                className="btn-paper haptic w-8 h-8 rounded-sm flex items-center justify-center"
              >
                {paused ? <Play size={12} /> : <Pause size={12} />}
              </button>
              <button
                onClick={() => { setPaused(false); setSeed(s => s + 1); }}
                title="Shuffle layout"
                className="btn-paper haptic w-8 h-8 rounded-sm flex items-center justify-center"
              >
                <Shuffle size={12} />
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
