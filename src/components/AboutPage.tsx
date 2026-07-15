import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import MadeBadge from './MadeBadge';

interface AboutPageProps {
  onBack: () => void;
}

const principles = [
  {
    num: '01',
    title: 'Local first, actually',
    description:
      'Your notes live in your browser\'s storage, on your machine. There is no server, no account, and no telemetry. The flip side is that clearing your browser data clears your notes, which is why export is one click away.',
  },
  {
    num: '02',
    title: 'Privacy by architecture',
    description:
      'Turn on encryption and every entry is sealed with AES-256 before it touches storage. The key comes from your passphrase and exists only in memory. Even this app\'s own code cannot read your data without it.',
  },
  {
    num: '03',
    title: 'Smarts without a model',
    description:
      'Tagging, summaries, categories, and reminders are plain heuristics running in your browser. Nothing is sent to an AI service. They are quick and useful, not clever, and the code does not pretend otherwise.',
  },
  {
    num: '04',
    title: 'Capture is nothing without recall',
    description:
      'Fuzzy search covers everything you have written, tags and summaries included, and forgives typos. Filters stack on top. A note you cannot find again was never really saved.',
  },
];

const notList = [
  {
    title: 'It does not sync.',
    detail: 'Local first means exactly that. Export and import moves your data between browsers and machines.',
  },
  {
    title: 'It is not an AI.',
    detail: 'The organizer is keyword heuristics, fast and private. Useful, not magical.',
  },
  {
    title: 'It is not a media library.',
    detail: 'Browser storage holds about 5MB, so files over 1.5MB are recorded by name only.',
  },
  {
    title: 'It cannot reset your passphrase.',
    detail: 'Real encryption has no back door. Keep a backup.',
  },
];

const stack = [
  'react 18 + typescript',
  'vite + tailwind css',
  'zustand, persisted locally',
  'fuse.js search',
  'web crypto api, aes-256-gcm',
  'framer motion',
];

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-paper text-ink noise">
      {/* Header */}
      <header className="border-b-[1.5px] border-ink bg-paper sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-xl tracking-tight">supermind</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          </div>
          <button
            onClick={onBack}
            className="btn-paper haptic px-4 py-2 rounded-sm font-label text-[10px] inline-flex items-center gap-2"
          >
            <ArrowLeft size={12} /> Back
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="font-label text-[10px] text-accent mb-4"
        >
          [ about this notebook ]
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl md:text-6xl tracking-tight leading-[1.05] mb-8"
        >
          A second brain that is <em className="marker">actually yours</em>.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="text-lg text-ink-soft leading-relaxed max-w-2xl"
        >
          Most note tools ask you to trade privacy for convenience. Your thoughts go to
          someone else's server, get mined for signals, and can vanish when a company
          pivots. supermind makes the opposite bet: it is fast, organized, and pleasant
          to use precisely because it never leaves your device.
        </motion.p>
      </section>

      {/* Principles */}
      <section className="border-y-[1.5px] border-ink bg-paper-raised">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <p className="font-label text-[10px] text-ink-soft mb-10">The principles</p>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            {principles.map((p, i) => (
              <motion.div
                key={p.num}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
              >
                <p className="font-label text-[10px] text-accent mb-2">{p.num}</p>
                <h3 className="font-display text-2xl text-ink mb-2">{p.title}</h3>
                <p className="text-ink-soft text-sm leading-relaxed">{p.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What it is not */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="flex items-baseline gap-3 mb-8">
          <span className="stamp">No fine print</span>
          <h2 className="font-display text-3xl text-ink">What supermind is not</h2>
        </div>
        <div className="space-y-5 max-w-2xl">
          {notList.map((item) => (
            <div key={item.title} className="flex gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              <p className="text-sm leading-relaxed">
                <strong className="text-ink font-semibold">{item.title}</strong>{' '}
                <span className="text-ink-soft">{item.detail}</span>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Stack */}
      <section className="border-t-[1.5px] border-[var(--ink-line)]">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <p className="font-label text-[10px] text-ink-soft mb-5">Built with boring, reliable tech</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {stack.map((item) => (
              <span key={item} className="font-label text-[10px] text-ink-faint">{item}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24 pt-8">
        <div className="card-ink-static rounded-sm px-8 py-12 text-center">
          <h2 className="font-display text-4xl text-ink mb-3">
            Try it. It is <em className="marker">already yours</em>.
          </h2>
          <p className="text-ink-soft mb-8">
            No account, no card, no data leaving your machine. Open it and start writing.
          </p>
          <button
            onClick={onBack}
            className="btn-ink haptic px-8 py-3.5 rounded-sm font-semibold inline-flex items-center gap-2"
          >
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-[1.5px] border-ink">
        <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col items-center gap-3">
          <MadeBadge />
          <p className="font-label text-[9px] text-ink-faint">
            © {new Date().getFullYear()} supermind · runs entirely on your device
          </p>
        </div>
      </footer>
    </div>
  );
}
