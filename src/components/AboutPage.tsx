import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Brain,
  Shield,
  HardDrive,
  Search,
  Sparkles,
  Lock,
  Code,
  Heart,
  Zap,
  Database,
  EyeOff,
} from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

const principles = [
  {
    icon: HardDrive,
    title: 'Local-First, Always',
    description:
      'Your knowledge base lives in your browser\'s storage on your device. There is no server, no account, and no telemetry. If you clear your data, it\'s gone — which is why one-click export exists.',
  },
  {
    icon: Lock,
    title: 'Privacy by Architecture',
    description:
      'Optional encryption at rest uses AES-256-GCM via the Web Crypto API. The key is derived from your passphrase with PBKDF2 (250,000 iterations) and only ever exists in memory. Nobody — including this app\'s code — can read your data without it.',
  },
  {
    icon: Brain,
    title: 'On-Device Intelligence',
    description:
      'Tagging, summaries, category suggestions, reminder detection, and insights are all computed locally with lightweight heuristics. No content is ever sent to an AI API or any other service.',
  },
  {
    icon: Search,
    title: 'Instant Retrieval',
    description:
      'Fuzzy search (powered by Fuse.js) works across content, summaries, and tags, combined with category, type, tag, date, and favorite filters — because capture is worthless without retrieval.',
  },
];

const stack = [
  { icon: Code, label: 'React 18 + TypeScript' },
  { icon: Zap, label: 'Vite + Tailwind CSS' },
  { icon: Database, label: 'Zustand (persisted locally)' },
  { icon: Search, label: 'Fuse.js fuzzy search' },
  { icon: Shield, label: 'Web Crypto API (AES-256-GCM)' },
  { icon: Sparkles, label: 'Framer Motion' },
];

export default function AboutPage({ onBack }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 right-4 z-40 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl"
      >
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              supermind.
            </span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-medium transition-all duration-200"
          >
            <ArrowLeft size={18} />
            Back
          </motion.button>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-8"
          >
            <span className="text-white">a second brain that is </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
              actually yours
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xl text-gray-300 leading-relaxed"
          >
            Most note and bookmarking tools ask you to trade privacy for convenience: your
            thoughts go to someone else's server, get mined for signals, and can vanish when a
            company pivots. supermind takes the opposite bet — a knowledge base that is fast,
            organized, and delightful precisely <em>because</em> it never leaves your device.
          </motion.p>
        </div>
      </section>

      {/* Principles */}
      <section className="py-20 px-6 bg-gradient-to-r from-gray-900/40 to-gray-800/40">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-center mb-16"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
              principles
            </span>
            <span className="text-white"> we don't compromise on</span>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {principles.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <principle.icon className="text-white" size={26} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{principle.title}</h3>
                <p className="text-gray-300 leading-relaxed">{principle.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Honest limitations */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white/5 border border-white/10 rounded-3xl p-10"
          >
            <div className="flex items-center gap-3 mb-6">
              <EyeOff className="text-emerald-400" size={24} />
              <h2 className="text-3xl font-bold text-white">What supermind is not</h2>
            </div>
            <ul className="space-y-4 text-gray-300 leading-relaxed list-disc list-inside">
              <li>
                <strong className="text-white">It doesn't sync between devices.</strong> Local-first
                means exactly that. Use export/import to move your data between browsers.
              </li>
              <li>
                <strong className="text-white">Its "smarts" are honest heuristics, not a language model.</strong>{' '}
                Tagging and summaries use keyword and sentence-scoring techniques that run
                instantly and privately. They're useful, not magical.
              </li>
              <li>
                <strong className="text-white">Storage is bounded by your browser.</strong> localStorage
                offers roughly 5MB, so large files keep their name and metadata rather than the
                full file.
              </li>
              <li>
                <strong className="text-white">A forgotten passphrase is unrecoverable.</strong> That's
                the point of real encryption — there is no reset button, so keep a backup.
              </li>
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-20 px-6 bg-gradient-to-r from-gray-900/40 to-gray-800/40">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold mb-12"
          >
            <span className="text-white">built with </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
              boring, reliable tech
            </span>
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stack.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl p-4 text-left"
              >
                <item.icon className="text-emerald-400 flex-shrink-0" size={20} />
                <span className="text-gray-200 text-sm font-medium">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-12"
          >
            <Heart className="text-emerald-400 mx-auto mb-6" size={32} />
            <h2 className="text-4xl font-bold text-white mb-6">Try it — it's already yours</h2>
            <p className="text-gray-300 text-lg mb-10">
              No account, no credit card, no data leaving your machine. Just open it up and
              start capturing.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 rounded-2xl font-bold text-lg text-white transition-all duration-300 shadow-2xl"
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} supermind. Your thoughts, your rules, your privacy.
      </footer>
    </div>
  );
}
