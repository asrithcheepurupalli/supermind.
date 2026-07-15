import React from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Shield,
  Zap,
  ArrowRight,
  Rocket,
  Search,
  BarChart3,
  HardDrive,
  Upload,
  Tag,
  type LucideIcon,
} from 'lucide-react';
import Particles from './Particles';

interface LandingPageProps {
  onGetStarted: () => void;
  onAbout: () => void;
}

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  points: string[];
}

const FeatureCard = ({ feature, index }: { feature: Feature; index: number }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15 }}
      className="group relative"
    >
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:bg-white/20 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl h-full">
        <div className="relative mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
            <feature.icon size={32} />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors duration-300">{feature.title}</h3>
        <p className="text-gray-300 text-lg leading-relaxed mb-6">{feature.description}</p>

        <div className="space-y-3">
          {feature.points.map((point, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: index * 0.15 + i * 0.1 }}
              className="flex items-center gap-3 text-gray-300"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full group-hover:scale-125 transition-transform duration-200" />
              <span className="text-sm">{point}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function LandingPage({ onGetStarted, onAbout }: LandingPageProps) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const features: Feature[] = [
    {
      icon: HardDrive,
      title: 'Local-First',
      description: 'Everything lives in your browser storage on this device. No account, no server, no tracking — ever.',
      gradient: 'from-emerald-500 to-green-500',
      points: [
        'No sign-up required — just a name',
        'Nothing is uploaded anywhere',
        'One-click JSON export and import',
        'Delete everything whenever you want',
      ],
    },
    {
      icon: Shield,
      title: 'Optional Encryption',
      description: 'Turn on encryption at rest and your content is sealed with AES-256-GCM using a passphrase only you know.',
      gradient: 'from-blue-500 to-cyan-500',
      points: [
        'AES-256-GCM via the Web Crypto API',
        'Key derived from your passphrase (PBKDF2)',
        'Auto-lock after inactivity',
        'Key lives in memory only — never stored',
      ],
    },
    {
      icon: Brain,
      title: 'Automatic Organization',
      description: 'Notes, links, and files are tagged, summarized, and categorized as you save them — computed entirely on your device.',
      gradient: 'from-purple-500 to-pink-500',
      points: [
        'Auto-tagging from content keywords',
        'Extractive summaries of longer notes',
        'Smart category suggestions',
        'Reminder detection for deadlines & follow-ups',
      ],
    },
    {
      icon: Search,
      title: 'Instant Fuzzy Search',
      description: 'Find anything in milliseconds, even with typos or half-remembered phrases, across all your content and tags.',
      gradient: 'from-yellow-500 to-orange-500',
      points: [
        'Fuzzy matching across text, tags & summaries',
        'Filter by category, type, tag, or date',
        'Cmd/Ctrl+K from anywhere',
        'Favorites and bulk actions',
      ],
    },
    {
      icon: Upload,
      title: 'Capture Anything',
      description: 'Text notes, web links, images, audio, video, and PDFs — drag and drop or paste straight from your clipboard.',
      gradient: 'from-indigo-500 to-purple-500',
      points: [
        'Drag & drop or file picker',
        'Clipboard paste in one click',
        'Small files stored inline so they survive reloads',
        'Keyboard shortcut: Cmd/Ctrl+N',
      ],
    },
    {
      icon: BarChart3,
      title: 'Real Insights',
      description: 'Activity charts, tag connections, related-content suggestions, and patterns — all computed from your own data.',
      gradient: 'from-pink-500 to-rose-500',
      points: [
        '30-day activity chart',
        'Top categories and tags',
        'Tag co-occurrence connections',
        'Overdue-reminder and review suggestions',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Particle Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <Particles
          particleColors={['#ffffff', '#ffffff', '#ffffff']}
          particleCount={500}
          particleSpread={12}
          speed={0.08}
          particleBaseSize={60}
          moveParticlesOnHover={true}
          particleHoverFactor={0.3}
          alphaParticles={false}
          disableRotation={false}
          sizeRandomness={0}
          cameraDistance={20}
          className="opacity-60"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 right-4 z-40 bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl"
      >
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg"
              >
                <Sparkles className="text-white" size={24} />
              </motion.div>
              <span className="text-3xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
                supermind.
              </span>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAbout}
                className="px-6 py-3 text-white/80 hover:text-white transition-colors font-medium"
              >
                About
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
              >
                Get Started Free
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center px-6 pt-32 z-10"
      >
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 backdrop-blur-sm border border-emerald-500/30 rounded-full text-lg font-medium mb-8">
              <Brain size={20} className="text-emerald-400" />
              <span>Your Local-First Second Brain</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-400 to-blue-400">
              never forget
            </span>
            <br />
            <span className="text-white">anything again</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12"
          >
            Save notes, links, and files. supermind organizes them automatically and makes them
            instantly searchable —
            <span className="text-emerald-400 font-semibold"> entirely on your device, never on a server.</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(16, 185, 129, 0.4)' }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 rounded-2xl font-bold text-xl text-white transition-all duration-300 flex items-center gap-3 shadow-2xl"
            >
              Start Building Your Brain
              <ArrowRight size={24} />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAbout}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white rounded-2xl font-semibold text-lg transition-all duration-200 shadow-lg"
            >
              Learn More
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              { icon: Shield, label: '100% Private', desc: 'Local-only, optional encryption' },
              { icon: Zap, label: 'Instant Search', desc: 'Fuzzy search in milliseconds' },
              { icon: Tag, label: 'Auto-Organized', desc: 'Tags & summaries on-device' },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105"
              >
                <stat.icon className="text-emerald-500 mx-auto mb-4" size={32} />
                <div className="text-xl font-bold text-white mb-2">{stat.label}</div>
                <div className="text-gray-300">{stat.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                everything you need
              </span>
              <span className="text-white"> — nothing you don't</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A complete knowledge base that respects your privacy. Every feature below works
              today, offline, with no account.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 bg-gradient-to-r from-gray-900/30 to-gray-800/30 relative z-10">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-white">up and running in </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                30 seconds
              </span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Set up your space',
                desc: 'Enter a name — that\'s it. Optionally add an encryption passphrase for data at rest.',
              },
              {
                step: '2',
                title: 'Capture everything',
                desc: 'Drop in notes, links, images, and files. Each one is tagged and summarized automatically.',
              },
              {
                step: '3',
                title: 'Rediscover instantly',
                desc: 'Search, filter, and browse insights that connect what you\'ve saved over time.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 text-center"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                  <Brain className="text-emerald-500" size={24} />
                </div>
                <div className="text-emerald-400 font-semibold">Ready to Get Started?</div>
              </div>

              <h2 className="text-5xl font-bold mb-6 text-white">
                your brain, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">supercharged</span>
              </h2>
              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Free, private, and yours. No account to create, no data to hand over —
                just open it and start capturing.
              </p>

              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 25px 50px rgba(16, 185, 129, 0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 rounded-2xl font-bold text-xl text-white transition-all duration-300 flex items-center gap-3 shadow-2xl mx-auto"
              >
                Start Your Journey
                <Rocket size={24} />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white" size={16} />
              </div>
              <span className="text-2xl font-bold text-white">supermind.</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <button
                onClick={onAbout}
                className="hover:text-white transition-colors"
              >
                About
              </button>
              <span>Made with ❤️ for curious minds</span>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} supermind. Your thoughts, your rules, your privacy.
          </div>
        </div>
      </footer>
    </div>
  );
}
