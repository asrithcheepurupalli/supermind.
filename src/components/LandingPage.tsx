import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  ArrowDown,
  Command,
  Lock,
  Search,
  PenLine,
  Link as LinkIcon,
  Network,
  History,
  HardDrive,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onAbout: () => void;
}

/* ---------- pieces ---------- */

// Strip of washi tape holding a card down.
function Tape({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute w-20 h-6 bg-[var(--accent-soft)] border border-[var(--ink-line)] backdrop-blur-[1px] ${className}`}
      style={{ clipPath: 'polygon(2% 0, 98% 4%, 100% 96%, 0 100%)' }}
    />
  );
}

// A pinned index card for the hero collage.
function IndexCard({
  rotate,
  className,
  children,
  delay = 0,
}: {
  rotate: number;
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: rotate * 2 }}
      animate={{ opacity: 1, y: 0, rotate }}
      whileHover={{ rotate: 0, scale: 1.04, zIndex: 30 }}
      transition={{ delay, type: 'spring', stiffness: 120, damping: 15 }}
      className={`card-ink rounded-sm p-5 absolute cursor-default ${className}`}
    >
      {children}
    </motion.div>
  );
}

const MARQUEE_WORDS = ['capture', 'tag', 'connect', 'recall', 'encrypt', 'rediscover'];

/* ---------- page ---------- */

export default function LandingPage({ onGetStarted, onAbout }: LandingPageProps) {
  const { scrollY } = useScroll();
  const collageY = useTransform(scrollY, [0, 700], [0, -60]);

  const chapters = [
    {
      num: '01',
      title: 'Capture without friction',
      body: 'Notes, links, images, files. One keystroke to save, zero forms to fill. Your thought lands on paper before it evaporates.',
      icon: PenLine,
      demo: (
        <div className="card-ink-static rounded-sm p-5 rotate-[-1deg]">
          <div className="font-label text-[10px] text-ink-faint mb-3">quick capture</div>
          <p className="font-display text-2xl text-ink leading-snug mb-4">
            "The best interface is the one you forget is there."
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {['#design', '#quotes'].map(t => (
                <span key={t} className="font-label text-[10px] text-accent">{t}</span>
              ))}
            </div>
            <span className="font-label text-[10px] text-ink-faint">auto-filed · 0.2s</span>
          </div>
        </div>
      ),
    },
    {
      num: '02',
      title: 'It files itself',
      body: 'Tags, summaries, categories, reminders — extracted on your device the instant you save. The librarian lives inside the notebook.',
      icon: Search,
      demo: (
        <div className="card-ink-static rounded-sm p-5 rotate-[1deg]">
          <div className="font-label text-[10px] text-ink-faint mb-3">on-device organizer</div>
          {[
            ['reads your note', 'done'],
            ['writes 4 tags', 'done'],
            ['files under health', 'done'],
            ['sets friday reminder', 'done'],
          ].map(([label, state]) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-[var(--ink-line)] last:border-0">
              <span className="text-ink text-sm">{label}</span>
              <span className="font-label text-[9px] text-accent">{state}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      num: '03',
      title: 'Watch ideas find each other',
      body: 'A living graph of your tags, drawn from what you actually save. Hover a node and its connections light up. Click and dive in.',
      icon: Network,
      demo: (
        <div className="card-ink-static rounded-sm p-5 rotate-[-1deg] relative overflow-hidden">
          <div className="font-label text-[10px] text-ink-faint mb-3">knowledge graph</div>
          <svg viewBox="0 0 280 130" className="w-full">
            <g stroke="var(--ink-line)" strokeWidth="1">
              <path d="M50 70 Q 100 30 150 55" fill="none" />
              <path d="M150 55 Q 200 80 235 45" fill="none" />
              <path d="M50 70 Q 110 105 190 95" fill="none" />
              <path d="M150 55 Q 165 80 190 95" fill="none" />
            </g>
            {[
              { x: 50, y: 70, r: 13, label: 'design' },
              { x: 150, y: 55, r: 17, label: 'ideas' },
              { x: 235, y: 45, r: 10, label: 'reading' },
              { x: 190, y: 95, r: 11, label: 'work' },
            ].map(n => (
              <g key={n.label}>
                <circle cx={n.x} cy={n.y} r={n.r} fill="var(--accent)" opacity="0.9" />
                <circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke="var(--ink)" strokeWidth="1.5" />
                <text x={n.x} y={n.y - n.r - 6} textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono" fill="var(--ink-soft)">
                  {n.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      ),
    },
    {
      num: '04',
      title: 'Sealed, if you want it sealed',
      body: 'AES-256 encryption at rest with a passphrase only you know. Auto-locks when you step away. No server ever sees a byte — there is no server.',
      icon: Lock,
      demo: (
        <div className="card-ink-static rounded-sm p-5 rotate-[1deg]">
          <div className="flex items-start justify-between mb-4">
            <div className="font-label text-[10px] text-ink-faint">vault status</div>
            <span className="stamp text-[10px] text-accent">sealed</span>
          </div>
          <div className="font-label text-xs text-ink-soft space-y-2">
            <div>cipher ......... AES-256-GCM</div>
            <div>key ............ passphrase-derived</div>
            <div>server ......... none. ever.</div>
            <div>auto-lock ...... 15 min idle</div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink relative overflow-x-hidden noise">
      {/* Nav */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b-[1.5px] border-ink"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-3xl tracking-tight">supermind</span>
            <span className="w-2 h-2 rounded-full bg-accent inline-block" />
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onAbout} className="font-label text-xs text-ink-soft hover:text-ink transition-colors">
              About
            </button>
            <button
              onClick={onGetStarted}
              className="btn-ink haptic font-label text-xs px-5 py-2.5 rounded-sm"
            >
              Get Started →
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative dot-grid">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-28 grid lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-label text-[11px] text-accent mb-8"
            >
              [ a local-first second brain ]
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="font-display text-6xl md:text-[5.5rem] leading-[0.98] tracking-tight mb-8"
            >
              A mind that
              <br />
              <em className="marker">never forgets<span className="text-accent">.</span></em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="text-lg text-ink-soft max-w-md leading-relaxed mb-10"
            >
              Every note, link, and stray thought — captured in a keystroke, filed by
              an organizer that lives on your device, and found again the moment you need it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="flex items-center gap-5"
            >
              <button
                onClick={onGetStarted}
                className="btn-ink haptic px-8 py-4 rounded-sm font-semibold text-base inline-flex items-center gap-3"
              >
                Open your notebook
                <ArrowRight size={18} />
              </button>
              <div className="font-label text-[10px] text-ink-faint leading-relaxed">
                no account<br />no server<br />no catch
              </div>
            </motion.div>
          </div>

          {/* Card collage */}
          <motion.div style={{ y: collageY }} className="relative h-[460px] hidden lg:block">
            <IndexCard rotate={-4} delay={0.3} className="top-2 left-2 w-64 z-10">
              <Tape className="-top-3 left-16 rotate-[-4deg]" />
              <div className="font-label text-[10px] text-ink-faint mb-2">note · 09:41</div>
              <p className="font-display text-xl leading-snug">
                Call nonna about the pasta recipe — the one with the burnt butter.
              </p>
              <div className="flex gap-2 mt-3">
                <span className="font-label text-[10px] text-accent">#family</span>
                <span className="font-label text-[10px] text-accent">#recipes</span>
              </div>
            </IndexCard>

            <IndexCard rotate={3} delay={0.45} className="top-24 right-0 w-60 z-20">
              <div className="font-label text-[10px] text-ink-faint mb-2 flex items-center gap-1">
                <LinkIcon size={10} /> link · saved
              </div>
              <p className="text-sm text-ink leading-relaxed">
                "How spaced repetition rewires long-term memory" — 12 min read
              </p>
              <div className="mt-3 pt-3 border-t border-[var(--ink-line)] flex justify-between items-center">
                <span className="font-label text-[10px] text-accent">#learning</span>
                <span className="font-label text-[9px] text-ink-faint">reminder: sun</span>
              </div>
            </IndexCard>

            <IndexCard rotate={-2} delay={0.6} className="bottom-16 left-10 w-72 z-30">
              <Tape className="-top-3 right-10 rotate-[3deg]" />
              <div className="flex items-center justify-between mb-3">
                <div className="font-label text-[10px] text-ink-faint">memory lane</div>
                <History size={12} className="text-accent" />
              </div>
              <p className="font-display text-lg leading-snug mb-2">
                One month ago you wrote:
              </p>
              <p className="text-sm text-ink-soft italic">
                "Start the studio. Stop waiting for permission."
              </p>
            </IndexCard>

            <IndexCard rotate={5} delay={0.75} className="bottom-2 right-8 w-44 z-10">
              <div className="stamp text-[10px] text-accent inline-block mb-3">encrypted</div>
              <div className="font-label text-[10px] text-ink-soft leading-relaxed">
                aes-256-gcm<br />
                key: yours only<br />
                server: none
              </div>
            </IndexCard>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-10 flex justify-center lg:justify-start">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="font-label text-[10px] text-ink-faint flex items-center gap-2"
          >
            <ArrowDown size={12} /> scroll
          </motion.div>
        </div>
      </section>

      {/* Marquee */}
      <div className="border-y-[1.5px] border-ink bg-accent overflow-hidden py-3 select-none" aria-hidden>
        <div className="animate-marquee flex whitespace-nowrap w-max">
          {[0, 1].map(half => (
            <div key={half} className="flex">
              {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((word, i) => (
                <span key={`${half}-${i}`} className="font-label text-sm text-paper mx-6 flex items-center gap-6">
                  {word} <span className="w-1.5 h-1.5 rounded-full bg-paper inline-block" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Chapters */}
      <section className="max-w-6xl mx-auto px-6 py-28 space-y-28">
        {chapters.map((chapter, i) => (
          <motion.div
            key={chapter.num}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`grid lg:grid-cols-2 gap-14 items-center ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}
          >
            <div>
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-display text-7xl text-accent leading-none">{chapter.num}</span>
                <chapter.icon size={20} className="text-ink-faint" />
              </div>
              <h2 className="font-display text-4xl md:text-5xl leading-tight tracking-tight mb-5">
                {chapter.title}
              </h2>
              <p className="text-ink-soft text-lg leading-relaxed max-w-md">{chapter.body}</p>
            </div>
            <div className="max-w-sm mx-auto w-full">{chapter.demo}</div>
          </motion.div>
        ))}
      </section>

      {/* Command strip */}
      <section className="border-y-[1.5px] border-ink bg-paper-raised">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="font-display text-3xl md:text-4xl tracking-tight mb-2">
              The whole notebook, <em className="marker-accent">one keystroke away</em>
            </h3>
            <p className="text-ink-soft">Search every thought. Jump anywhere. Run any action.</p>
          </div>
          <div className="card-ink-static rounded-sm px-6 py-4 flex items-center gap-4 rotate-[-1deg]">
            <span className="font-label text-xs text-ink-soft flex items-center gap-1.5">
              <Command size={13} /> K
            </span>
            <span className="w-px h-6 bg-[var(--ink-line)]" />
            <span className="font-display text-xl italic text-ink-soft">ask anything…</span>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="max-w-4xl mx-auto px-6 py-32 text-center ruled">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-label text-[11px] text-accent mb-10"
        >
          [ the principle ]
        </motion.p>
        <motion.blockquote
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl md:text-6xl leading-[1.12] tracking-tight"
        >
          Your thoughts belong <em className="marker">on your device</em>,
          <br />
          not on someone's <span className="line-through decoration-[var(--accent)] decoration-4">server</span>.
        </motion.blockquote>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex items-center justify-center gap-8 font-label text-[10px] text-ink-faint"
        >
          <span className="flex items-center gap-1.5"><HardDrive size={11} /> local-first</span>
          <span className="flex items-center gap-1.5"><Lock size={11} /> aes-256 optional</span>
          <span>0 bytes uploaded</span>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-ink-static rounded-sm px-8 py-16 md:px-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 dot-grid opacity-60" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-5xl md:text-7xl tracking-tight leading-[1.02] mb-6">
              Begin your
              <br />
              <em className="marker">second brain.</em>
            </h2>
            <p className="text-ink-soft text-lg mb-10">
              Thirty seconds. A name. That's the whole sign-up.
            </p>
            <button
              onClick={onGetStarted}
              className="btn-ink haptic px-10 py-4 rounded-sm font-semibold text-lg inline-flex items-center gap-3"
            >
              Open your notebook <ArrowRight size={19} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Colophon footer */}
      <footer className="border-t-[1.5px] border-ink">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-xl">supermind</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          </div>
          <div className="font-label text-[10px] text-ink-faint text-center md:text-right leading-relaxed">
            set in instrument serif & jetbrains mono · runs entirely on your device
            <br />
            © {new Date().getFullYear()} — your thoughts, your rules, your privacy.{' '}
            <button onClick={onAbout} className="underline hover:text-ink transition-colors">about</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
