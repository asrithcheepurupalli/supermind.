import React from 'react';
import { motion } from 'framer-motion';
import { Network, MousePointerClick, Pause, Play, Shuffle } from 'lucide-react';
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

      // Draw
      ctx.clearRect(0, 0, width, height);

      const inkAlpha = isDark ? 0.16 : 0.1;
      for (const e of edges) {
        const a = nodes[e.a];
        const b = nodes[e.b];
        const connectedToHover = hovered >= 0 && (e.a === hovered || e.b === hovered);
        ctx.strokeStyle = connectedToHover
          ? `hsla(160, 84%, ${isDark ? 45 : 32}%, 0.65)`
          : `hsla(0, 0%, ${isDark ? 100 : 0}%, ${inkAlpha})`;
        ctx.lineWidth = connectedToHover ? 1.8 : Math.min(2, 0.6 + e.weight * 0.3);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const isHovered = i === hovered;
        const isNeighbor = hovered >= 0 && neighbors.get(hovered)?.has(i);
        const dimmed = hovered >= 0 && !isHovered && !isNeighbor;
        const breathe = 1 + Math.sin(time * 2 + n.phase) * 0.05;
        const r = n.radius * (isHovered ? 1.25 : breathe);

        const light = isDark ? 60 : 42;
        const alpha = dimmed ? 0.25 : 1;

        // soft glow
        const glow = ctx.createRadialGradient(n.x, n.y, r * 0.3, n.x, n.y, r * 2.2);
        glow.addColorStop(0, `hsla(${n.hue}, 70%, ${light}%, ${0.28 * alpha})`);
        glow.addColorStop(1, `hsla(${n.hue}, 70%, ${light}%, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // core
        ctx.fillStyle = `hsla(${n.hue}, 72%, ${light}%, ${alpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fill();

        // surface ring separates overlapping marks
        ctx.strokeStyle = isDark ? 'rgba(3, 7, 18, 0.9)' : 'rgba(255, 255, 255, 0.95)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // labels: always for large nodes, on hover/neighbor for the rest — text in ink, not series color
        const showLabel = isHovered || isNeighbor || n.radius > 10;
        if (showLabel && !dimmed) {
          ctx.font = `${isHovered ? 600 : 500} ${isHovered ? 13 : 11.5}px 'Inter Variable', -apple-system, sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = isDark
            ? `rgba(243, 244, 246, ${isHovered ? 1 : 0.85})`
            : `rgba(17, 24, 39, ${isHovered ? 1 : 0.8})`;
          ctx.fillText(n.tag, n.x, n.y - r - 7);
          if (isHovered) {
            ctx.font = `400 10.5px 'Inter Variable', -apple-system, sans-serif`;
            ctx.fillStyle = isDark ? 'rgba(156, 163, 175, 0.9)' : 'rgba(107, 114, 128, 0.9)';
            ctx.fillText(`${n.count} item${n.count !== 1 ? 's' : ''} · click to explore`, n.x, n.y + r + 16);
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
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto w-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <div className="inline-flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Network className="text-white" size={20} />
          </div>
          <h2 className="text-2xl font-bold text-primary">Knowledge Graph</h2>
        </div>
        <p className="text-secondary text-sm flex items-center justify-center gap-2">
          <MousePointerClick size={14} />
          {hoveredTag
            ? <>Click to explore everything tagged <span className="text-emerald-600 dark:text-emerald-400 font-semibold">#{hoveredTag}</span></>
            : 'A living map of how your knowledge connects — hover a node, click to dive in'}
        </p>
      </motion.div>

      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="flex-1 glass-card rounded-3xl overflow-hidden relative min-h-[400px] mb-20 sm:mb-4"
      >
        {nonGuideCount < 2 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
            <Network size={48} className="text-muted mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">Your graph is waiting to grow</h3>
            <p className="text-secondary max-w-sm">
              Add a few notes and links — as tags start co-occurring, this becomes a living map
              of your mind's connections.
            </p>
          </div>
        ) : (
          <>
            <canvas ref={canvasRef} className="absolute inset-0" />
            {/* Simulation controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={() => setPaused(p => !p)}
                title={paused ? 'Resume motion' : 'Pause motion'}
                className="haptic w-9 h-9 rounded-xl glass-button flex items-center justify-center text-secondary hover:text-primary"
              >
                {paused ? <Play size={14} /> : <Pause size={14} />}
              </button>
              <button
                onClick={() => { setPaused(false); setSeed(s => s + 1); }}
                title="Shuffle layout"
                className="haptic w-9 h-9 rounded-xl glass-button flex items-center justify-center text-secondary hover:text-primary"
              >
                <Shuffle size={14} />
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
