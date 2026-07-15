import React from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  Brain, 
  Sparkles, 
  Shield, 
  Zap, 
  Heart, 
  Users, 
  Lightbulb,
  Target,
  Rocket,
  Globe,
  Lock,
  Eye,
  ArrowRight,
  Quote,
  Star,
  Coffee,
  Code,
  Palette,
  Cpu,
  Database,
  Search,
  Layers,
  Network,
  Infinity,
  Atom,
  Telescope,
  Microscope,
  Compass,
  Map,
  Route,
  Puzzle,
  Magnet,
  Orbit,
  Waves,
  Plus,
  Tag,
  FileText,
  Image,
  Video,
  Mic,
  Link,
  Calendar,
  BarChart3,
  Bookmark,
  Archive,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Bell,
  Filter,
  Grid,
  List,
  Clock,
  TrendingUp,
  Activity,
  Headphones,
  Camera,
  Type,
  FileType
} from 'lucide-react';
import Particles from './Particles';

interface LandingPageProps {
  onGetStarted: () => void;
  onAbout: () => void;
}

const FeatureCard = ({ feature, index }: { feature: any; index: number }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateY: -15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      className="group relative"
    >
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:bg-white/20 hover:border-white/30 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl">
        <div className="relative mb-6">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
            <feature.icon size={32} />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: 999999999, ease: "linear" }}
            className="absolute inset-0 rounded-2xl border-2 border-emerald-400/20 group-hover:border-emerald-400/40 transition-colors duration-300"
          />
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors duration-300">{feature.title}</h3>
        <p className="text-gray-300 text-lg leading-relaxed mb-6">{feature.description}</p>
        
        <div className="space-y-3">
          {feature.points.map((point: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: index * 0.2 + i * 0.1 }}
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

  const features = [
    {
      icon: Brain,
      title: "🤖 Smart Robot Helper",
      description: "Like having a super smart robot friend that remembers everything for you! It reads your stuff and magically sorts it into neat piles.",
      gradient: "from-purple-500 to-pink-500",
      points: [
        "Automatically sorts your stuff (like a magic filing cabinet!)",
        "Remembers where you put everything",
        "Makes smart tags so you can find things fast",
        "Works like having a personal assistant"
      ]
    },
    {
      icon: Shield,
      title: "🔒 Super Secret Vault",
      description: "Your thoughts are locked up tighter than a treasure chest! Even we can't peek inside - it's YOUR secret diary.",
      gradient: "from-emerald-500 to-green-500",
      points: [
        "Military-grade locks (like spy movies!)",
        "Only YOU have the secret key",
        "Everything stays on YOUR computer",
        "Safer than hiding under your mattress"
      ]
    },
    {
      icon: Search,
      title: "🔍 Magic Search Detective",
      description: "Just tell it what you're looking for in normal words, and BOOM! It finds exactly what you need, even if you forgot where you put it.",
      gradient: "from-blue-500 to-cyan-500",
      points: [
        "Talk to it like a friend, not a computer",
        "Finds stuff even with fuzzy memories",
        "Searches through EVERYTHING instantly",
        "Like having Google for your brain"
      ]
    },
    {
      icon: Zap,
      title: "⚡ Lightning Fast Everything",
      description: "Faster than you can say 'supercalifragilisticexpialidocious'! Add anything, find anything, organize anything - all in a flash.",
      gradient: "from-yellow-500 to-orange-500",
      points: [
        "Add stuff with one click (or drag and drop!)",
        "Works with photos, videos, links, notes",
        "Instant results, no waiting around",
        "Keyboard shortcuts for ninja speed"
      ]
    },
    {
      icon: Sparkles,
      title: "✨ AI Magic Wand",
      description: "Watch the magic happen! It reads your content and creates perfect summaries, tags, and categories without you lifting a finger.",
      gradient: "from-indigo-500 to-purple-500",
      points: [
        "Writes summaries better than book reports",
        "Creates tags like a labeling machine",
        "Suggests when to review stuff",
        "Connects related ideas automatically"
      ]
    },
    {
      icon: BarChart3,
      title: "📊 Cool Stats Dashboard",
      description: "See awesome charts about your learning! Track your progress like a video game with levels, achievements, and cool graphs.",
      gradient: "from-pink-500 to-rose-500",
      points: [
        "Pretty charts that show your progress",
        "See what topics you love most",
        "Track your learning streaks",
        "Discover patterns in your interests"
      ]
    }
  ];

  const testimonials = [
    {
      name: "Alex, Student",
      role: "High School",
      avatar: "AS",
      quote: "Finally! Something that actually helps me organize my school notes without being boring."
    },
    {
      name: "Jamie, Creator",
      role: "Content Creator",
      avatar: "JC",
      quote: "It's like having a personal assistant that never forgets anything. Game changer!"
    },
    {
      name: "Sam, Developer",
      role: "Software Engineer",
      avatar: "SD",
      quote: "The AI tagging is so smart, it's almost scary. In a good way!"
    }
  ];

  const [currentTestimonial, setCurrentTestimonial] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Bolt.new Badge - Top Right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="fixed top-24 right-8 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
          className="relative group"
        >
          <div className="w-20 h-20 rounded-full shadow-2xl hover:shadow-white/30 transition-all duration-300 border-2 border-white/30 hover:border-white/50 overflow-hidden">
            <img 
              src="/white_circle_360x360.png" 
              alt="Bolt.new Badge" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Animated Ring */}
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full border-2 border-white/40"
          />
          
          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            whileHover={{ opacity: 1, scale: 1, x: 0 }}
            className="absolute right-full top-1/2 transform -translate-y-1/2 mr-6 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-3 whitespace-nowrap pointer-events-none shadow-lg"
          >
            <div className="text-gray-900 text-sm font-semibold">Powered by Bolt.new</div>
            <div className="text-gray-600 text-xs">Made in Bolt</div>
            {/* Arrow */}
            <div className="absolute left-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-white/95 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* 3D Neural Network Background */}
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
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: 999999999, ease: "linear" }}
              >
                <Brain size={20} className="text-emerald-400" />
              </motion.div>
              <span>Your AI-Powered Second Brain</span>
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-emerald-600 to-blue-600 dark:from-white dark:via-emerald-400 dark:to-blue-400">
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
            Like having a super smart friend who remembers everything you save, organizes it perfectly, and helps you find it instantly. 
            <span className="text-emerald-400 font-semibold"> All while keeping your secrets completely safe!</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(16, 185, 129, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onGetStarted}
              className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 rounded-2xl font-bold text-xl text-white transition-all duration-300 flex items-center gap-3 shadow-2xl"
            >
              Start Building Your Brain
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: 999999999 }}
              >
                <ArrowRight size={24} />
              </motion.div>
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
              { icon: Shield, label: "100% Private", desc: "Your secrets stay secret" },
              { icon: Zap, label: "Lightning Fast", desc: "Find anything in milliseconds" },
              { icon: Brain, label: "AI Powered", desc: "Smart organization magic" }
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">
                superpowers
              </span>
              <span className="text-white"> for your brain</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Imagine if your brain had magical powers to never forget anything, organize everything perfectly, and find any memory instantly. That's what we built!
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-gradient-to-r from-gray-900/30 to-gray-800/30 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">
                early users
              </span>
              <span className="text-white"> love it</span>
            </h2>
            <p className="text-xl text-gray-300">
              Real feedback from our first brave testers who helped us build something amazing!
            </p>
          </motion.div>

          <div className="relative">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 text-center"
            >
              <Quote className="text-emerald-500 mx-auto mb-6" size={48} />
              <p className="text-2xl text-gray-300 italic mb-8 leading-relaxed">
                "{testimonials[currentTestimonial].quote}"
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {testimonials[currentTestimonial].avatar}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-lg">{testimonials[currentTestimonial].name}</div>
                  <div className="text-gray-300">{testimonials[currentTestimonial].role}</div>
                </div>
              </div>
            </motion.div>
            
            <div className="flex justify-center gap-3 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-emerald-500 scale-125' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
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
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: 999999999, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-3xl"
            />
            
            <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: 999999999, ease: "linear" }}
                  className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center"
                >
                  <Brain className="text-emerald-500" size={24} />
                </motion.div>
                <div className="text-emerald-400 font-semibold">Ready to Get Started?</div>
              </div>
              
              <h2 className="text-5xl font-bold mb-6 text-white">
                your brain, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400">supercharged</span>
              </h2>
              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Join the early adopters who are already building their perfect digital brain. 
                It's free to start, and your future self will thank you!
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(16, 185, 129, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onGetStarted}
                className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 rounded-2xl font-bold text-xl text-white transition-all duration-300 flex items-center gap-3 shadow-2xl mx-auto"
              >
                Start Your Journey
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: 999999999, ease: "easeInOut" }}
                >
                  <Rocket size={24} />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Simple Footer */}
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
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full opacity-90 shadow-lg overflow-hidden border border-white/20">
                  <img 
                    src="/white_circle_360x360.png" 
                    alt="Bolt.new" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm opacity-90 font-medium">Powered by Bolt.new</span>
              </div>
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
            © 2024 supermind. Your thoughts, your rules, your privacy.
          </div>
        </div>
      </footer>
    </div>
  );
}