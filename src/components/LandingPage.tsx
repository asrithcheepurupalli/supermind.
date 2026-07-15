import React from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Shield,
  ArrowRight,
  Search,
  HardDrive,
  Command,
  History,
  Network,
  Zap,
  Lock,
  Plus,
  Clock,
  Star,
  CornerDownLeft,
} from 'lucide-react';
import Particles from './Particles';
import HeroGraph from './landing/HeroGraph';

interface LandingPageProps {
  onGetStarted: () => void;
  onAbout: () => void;
}

/* ---------- micro-components ---------- */

const ROTATING_WORDS = ['that article', 'that idea', 'that recipe', 'that quote', 'anything'];

function RotatingWord() {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % ROTATING_WORDS.length), 2200);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-grid overflow-visible align-baseline justify-items-center">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={ROTATING_WORDS[index]}
          layout
          initial={{ y: '60%', opacity: 0, filter: 'blur(6px)' }}
          animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
          exit={{ y: '-60%', opacity: 0, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="col-start-1 row-start-1 whitespace-nowrap text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-blue-400 text-shine"
        >
          {ROTATING_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// CTA that leans toward the cursor.
function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [offset, setOffset] = React.useState({ x: 0, y: 0 });
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const rect = ref.current!.getBoundingClientRect();
        setOffset({
          x: (e.clientX - rect.left - rect.width / 2) * 0.18,
          y: (e.clientY - rect.top - rect.height / 2) * 0.3,
        });
      }}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
    >
      <motion.div animate={offset} transition={{ type: 'spring', stiffness: 200, damping: 18 }}>
        {children}
      </motion.div>
    </div>
  );
}

// Product frame that tilts in 3D toward the cursor.
function TiltFrame({ children }: { children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = React.useState({ rx: 0, ry: 0 });
  return (
    <div
      ref={ref}
      style={{ perspective: 1200 }}
      onMouseMove={(e) => {
        const rect = ref.current!.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ rx: -py * 7, ry: px * 9 });
      }}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
    >
      <motion.div
        animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
        transition={{ type: 'spring', stiffness: 150, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {children}
      </motion.div>
    </div>
  );
}

/* ---------- bento cells ---------- */

function PaletteMock() {
  const rows = [
    { icon: Plus, label: 'Add Content', kbd: '⌘N' },
    { icon: Network, label: 'Go to Knowledge Graph' },
    { icon: Star, label: 'Show Favorites Only' },
    { icon: Lock, label: 'Lock Workspace' },
  ];
  return (
    <div className="rounded-2xl bg-black/50 border border-white/10 overflow-hidden text-left shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <Search size={14} className="text-gray-500" />
        <span className="text-gray-400 text-sm">lock</span>
        <span className="w-px h-4 bg-emerald-400 animate-pulse" />
      </div>
      {rows.map((row, i) => (
        <div
          key={row.label}
          className={`flex items-center gap-3 px-4 py-2.5 text-sm ${i === 3 ? 'bg-emerald-500/15' : ''}`}
        >
          <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <row.icon size={12} />
          </div>
          <span className="text-gray-200 flex-1">{row.label}</span>
          {row.kbd && <span className="text-[10px] text-gray-500">{row.kbd}</span>}
          {i === 3 && <CornerDownLeft size={12} className="text-gray-500" />}
        </div>
      ))}
    </div>
  );
}

function MemoryLaneMock() {
  const cards = [
    { label: 'ONE MONTH AGO', text: 'That pasta recipe from nonna\'s cookbook' },
    { label: 'ONE WEEK AGO', text: 'Sketches for the studio rebrand' },
    { label: 'YESTERDAY', text: 'Why spaced repetition actually works' },
  ];
  return (
    <div className="relative h-44">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.15 }}
          className="absolute inset-x-0 rounded-xl bg-black/60 border border-white/10 p-3 shadow-xl"
          style={{ top: i * 44, zIndex: i, scale: 0.94 + i * 0.03 }}
        >
          <div className="text-purple-400 text-[10px] font-bold tracking-widest mb-1">{card.label}</div>
          <div className="text-gray-200 text-sm truncate">{card.text}</div>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------- page ---------- */

export default function LandingPage({ onGetStarted, onAbout }: LandingPageProps) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 600], [0, -120]);
  const heroOpacity = useTransform(scrollY, [0, 420], [1, 0]);

  const bento = [
    {
      span: 'lg:col-span-2 lg:row-span-2',
      title: 'A living map of your mind',
      desc: 'Your tags become a breathing, force-directed graph. Hover to see connections light up; click any node to dive into that corner of your knowledge.',
      icon: Network,
      body: (
        <div className="relative h-[300px] lg:h-[440px] rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
          <HeroGraph className="absolute inset-0" />
        </div>
      ),
    },
    {
      span: '',
      title: '⌘K everything',
      desc: 'One keystroke. Search every thought, jump anywhere, run any action.',
      icon: Command,
      body: <PaletteMock />,
    },
    {
      span: '',
      title: 'Memory Lane',
      desc: 'Past-you resurfaces every morning: yesterday, a week ago, a month ago.',
      icon: History,
      body: <MemoryLaneMock />,
    },
    {
      span: '',
      title: 'Sealed at rest',
      desc: 'AES-256-GCM with a passphrase only you know. Auto-locks when you walk away.',
      icon: Shield,
      body: (
        <div className="relative h-36 flex items-center justify-center">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-emerald-400/30"
              initial={{ width: 56, height: 56, opacity: 0 }}
              animate={{ width: 56 + i * 70, height: 56 + i * 70, opacity: [0, 0.7, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.9 }}
            />
          ))}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Lock size={22} className="text-white" />
          </div>
        </div>
      ),
    },
    {
      span: '',
      title: 'Nothing ever leaves',
      desc: 'No account. No server. No telemetry. Your knowledge lives on your device — export it any time.',
      icon: HardDrive,
      body: (
        <div className="flex items-center justify-center h-36">
          <div className="text-center">
            <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400 tabular-nums">0</div>
            <div className="text-gray-400 text-sm mt-1">bytes sent to a server, ever</div>
          </div>
        </div>
      ),
    },
    {
      span: '',
      title: 'Organized before you blink',
      desc: 'Tags, summaries, categories, and reminders — computed on-device the instant you save.',
      icon: Zap,
      body: (
        <div className="space-y-2">
          {['#design', '#health', '#reading'].map((tag, i) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="flex items-center gap-2 text-sm"
            >
              <Sparkles size={12} className="text-emerald-400" />
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs">{tag}</span>
              <span className="text-gray-500 text-xs">auto-applied</span>
            </motion.div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden relative noise">
      {/* Ambient gradient mesh */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-[20%] left-[10%] w-[46rem] h-[46rem] rounded-full bg-emerald-500/[0.08] blur-[140px]" />
        <div className="absolute top-[30%] -right-[10%] w-[40rem] h-[40rem] rounded-full bg-blue-500/[0.08] blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[36rem] h-[36rem] rounded-full bg-purple-500/[0.06] blur-[140px]" />
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <Particles
          particleColors={['#ffffff', '#ffffff', '#ffffff']}
          particleCount={260}
          particleSpread={12}
          speed={0.06}
          particleBaseSize={50}
          moveParticlesOnHover={true}
          particleHoverFactor={0.25}
          alphaParticles={false}
          disableRotation={false}
          sizeRandomness={0}
          cameraDistance={20}
          className="opacity-40"
        />
      </div>

      {/* Nav */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 right-4 z-40 bg-black/30 backdrop-blur-2xl border border-white/10 rounded-2xl"
      >
        <div className="px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="text-white" size={20} />
            </div>
            <span className="text-2xl font-bold tracking-tight">supermind.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onAbout}
              className="px-5 py-2.5 text-white/70 hover:text-white transition-colors font-medium text-sm"
            >
              About
            </button>
            <button
              onClick={onGetStarted}
              className="haptic px-6 py-2.5 bg-white text-black hover:bg-gray-100 font-semibold rounded-xl transition-colors text-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative pt-44 pb-10 px-6 z-10"
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-full text-sm font-medium mb-10 text-gray-300"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Local-first · Encrypted · Yours
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-6xl md:text-[5.4rem] font-bold leading-[1.04] tracking-tight mb-8"
          >
            never forget
            <br />
            <RotatingWord />
            <span className="text-white"> again</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            The second brain that organizes itself, answers in a keystroke,
            and never sends a byte to anyone's server.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20"
          >
            <Magnetic>
              <button
                onClick={onGetStarted}
                className="haptic group px-10 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl font-bold text-lg text-white flex items-center gap-3 shadow-[0_20px_60px_-12px_rgba(16,185,129,0.5)]"
              >
                Start Building Your Brain
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Magnetic>
            <button
              onClick={onAbout}
              className="px-7 py-4 text-gray-300 hover:text-white font-medium transition-colors"
            >
              How it's built →
            </button>
          </motion.div>

          {/* Product frame */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <TiltFrame>
              <div className="glow-frame rounded-3xl bg-[#0a0a10]/90 backdrop-blur-xl shadow-[0_60px_120px_-30px_rgba(0,0,0,0.9)] overflow-hidden text-left">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.07]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="flex items-center gap-2 px-4 py-1 rounded-lg bg-white/[0.05] text-gray-500 text-xs">
                      <Lock size={10} />
                      supermind — everything stays on this device
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 text-xs">
                    <Command size={11} />K
                  </div>
                </div>
                {/* Graph viewport */}
                <div className="relative h-[380px] md:h-[440px]">
                  <HeroGraph className="absolute inset-0 w-full h-full" />
                  {/* floating stat chips */}
                  <div className="absolute bottom-5 left-5 flex gap-3">
                    {[
                      { icon: Brain, label: '128 thoughts' },
                      { icon: Clock, label: '12-day streak' },
                      { icon: Shield, label: 'encrypted' },
                    ].map((chip) => (
                      <div key={chip.label} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur border border-white/10 text-xs text-gray-300">
                        <chip.icon size={11} className="text-emerald-400" />
                        {chip.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TiltFrame>
          </motion.div>
        </div>
      </motion.section>

      {/* Bento grid */}
      <section className="py-28 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
              Built like it <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">matters</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Every feature below is real, works offline, and runs entirely on your device.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-fr">
            {bento.map((cell, index) => (
              <motion.div
                key={cell.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: (index % 3) * 0.12 }}
                className={`${cell.span} group flex flex-col rounded-3xl bg-white/[0.035] hover:bg-white/[0.055] border border-white/[0.08] hover:border-white/[0.16] p-7 transition-colors duration-300`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center">
                    <cell.icon size={16} className="text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold">{cell.title}</h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">{cell.desc}</p>
                <div className="mt-auto">{cell.body}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-center mb-16"
          >
            Thirty seconds to a <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">second brain</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
            <div className="hidden md:block absolute top-12 left-[18%] right-[18%] h-px bg-gradient-to-r from-emerald-500/40 via-blue-500/40 to-purple-500/40" />
            {[
              { step: '01', title: 'Name yourself', desc: 'That\'s the entire sign-up. Optionally seal everything with a passphrase.' },
              { step: '02', title: 'Capture anything', desc: 'Notes, links, images, files. Tagged, summarized, and filed before you blink.' },
              { step: '03', title: 'Watch it connect', desc: 'Search in a keystroke, browse the graph, and let Memory Lane surprise you.' },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative text-center px-4"
              >
                <div className="relative w-24 h-24 mx-auto mb-6 rounded-3xl bg-[#0a0a10] border border-white/10 flex items-center justify-center">
                  <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-blue-400 tabular-nums">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="glow-frame rounded-[2rem] bg-[#0a0a10]/80 backdrop-blur-xl p-14 md:p-20 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(16,185,129,0.15),transparent_60%)]" />
            <div className="relative">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                your mind,<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 text-shine">beautifully kept</span>
              </h2>
              <p className="text-lg text-gray-400 mb-12 max-w-xl mx-auto">
                No account. No cloud. No catch. Open it and start capturing —
                it's already yours.
              </p>
              <Magnetic>
                <button
                  onClick={onGetStarted}
                  className="haptic px-12 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-[0_20px_60px_-12px_rgba(255,255,255,0.3)]"
                >
                  Open supermind
                </button>
              </Magnetic>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/[0.07] relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={14} />
            </div>
            <span className="text-lg font-bold">supermind.</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <button onClick={onAbout} className="hover:text-white transition-colors">About</button>
            <span>© {new Date().getFullYear()} — your thoughts, your rules, your privacy.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
