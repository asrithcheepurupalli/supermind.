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
  ArrowLeft,
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
  Waves
} from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

// Team member component
const TeamMember = ({ member, index }: { member: any; index: number }) => {
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
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-3xl p-8 hover:bg-gray-800/60 hover:border-gray-600/50 transition-all duration-500 transform hover:scale-105">
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold shadow-2xl">
            {member.name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: 999999999, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-emerald-400/20"
          />
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 text-center">{member.name}</h3>
        <p className="text-emerald-400 text-center mb-4 font-medium">{member.role}</p>
        <p className="text-gray-300 text-center text-sm leading-relaxed mb-4">{member.bio}</p>
        
        <div className="flex justify-center gap-2">
          {member.skills.map((skill: string, i: number) => (
            <span
              key={i}
              className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded-full text-xs border border-gray-600/50"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Timeline component
const TimelineEvent = ({ event, index }: { event: any; index: number }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      className={`flex items-center gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
    >
      <div className="flex-1">
        <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 hover:bg-gray-800/60 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <event.icon className="text-emerald-400" size={24} />
            <h3 className="text-xl font-bold text-white">{event.title}</h3>
          </div>
          <p className="text-gray-300 leading-relaxed mb-3">{event.description}</p>
          <div className="text-emerald-400 text-sm font-medium">{event.date}</div>
        </div>
      </div>
      
      <div className="relative">
        <div className="w-4 h-4 bg-emerald-400 rounded-full border-4 border-gray-900 shadow-lg" />
        {index < 4 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-0.5 h-20 bg-gradient-to-b from-emerald-400 to-transparent" />
        )}
      </div>
      
      <div className="flex-1" />
    </motion.div>
  );
};

// Value proposition component
const ValueCard = ({ value, index }: { value: any; index: number }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${value.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-3xl`} />
      
      <div className="relative bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-3xl p-8 hover:bg-gray-800/60 hover:border-gray-600/50 transition-all duration-500">
        <motion.div
          animate={isHovered ? { y: -10, rotate: 360 } : { y: 0, rotate: 0 }}
          transition={{ duration: 0.5 }}
          className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 shadow-2xl`}
        >
          <value.icon className="text-white" size={28} />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-white mb-4">{value.title}</h3>
        <p className="text-gray-300 leading-relaxed mb-6">{value.description}</p>
        
        <div className="space-y-2">
          {value.points.map((point: string, i: number) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: index * 0.2 + i * 0.1 }}
              className="flex items-center gap-3 text-sm text-gray-400"
            >
              <div className="w-2 h-2 bg-emerald-400 rounded-full" />
              {point}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default function AboutPage({ onBack }: AboutPageProps) {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const team = [
    {
      name: "Alex Chen",
      role: "Founder & CEO",
      bio: "Former Google AI researcher with a passion for democratizing knowledge management. PhD in Computer Science from Stanford.",
      skills: ["AI/ML", "Product Strategy", "Leadership"]
    },
    {
      name: "Sarah Rodriguez",
      role: "CTO & Co-founder",
      bio: "Security expert and full-stack engineer. Previously led encryption teams at Signal and built secure systems at scale.",
      skills: ["Cryptography", "Backend", "Security"]
    },
    {
      name: "Marcus Kim",
      role: "Head of Design",
      bio: "Award-winning designer who believes beautiful interfaces should make complex technology feel magical and intuitive.",
      skills: ["UI/UX", "Product Design", "Branding"]
    },
    {
      name: "Elena Volkov",
      role: "AI Research Lead",
      bio: "PhD in Natural Language Processing from MIT. Specializes in semantic understanding and knowledge graph construction.",
      skills: ["NLP", "Knowledge Graphs", "Research"]
    }
  ];

  const timeline = [
    {
      icon: Lightbulb,
      title: "The Spark",
      description: "Alex was drowning in bookmarks, notes, and saved articles. Despite having access to incredible AI tools, organizing personal knowledge remained frustratingly manual.",
      date: "January 2023"
    },
    {
      icon: Users,
      title: "Finding Our Team",
      description: "Sarah joined after experiencing the same pain points with encrypted note-taking. Marcus and Elena completed our founding team, bringing design excellence and AI expertise.",
      date: "March 2023"
    },
    {
      icon: Code,
      title: "First Prototype",
      description: "We built our first working prototype with local AI processing and client-side encryption. The magic of automatic organization with complete privacy was born.",
      date: "June 2023"
    },
    {
      icon: Rocket,
      title: "Beta Launch",
      description: "Launched private beta with 100 power users. Their feedback shaped our vision of a truly intelligent, secure second brain that learns and grows with you.",
      date: "October 2023"
    },
    {
      icon: Globe,
      title: "Public Release",
      description: "Today, we're proud to share Supermind with the world. A new era of knowledge management begins - intelligent, secure, and beautifully human.",
      date: "January 2024"
    }
  ];

  const values = [
    {
      icon: Brain,
      title: "Intelligence Amplification",
      description: "We believe AI should amplify human intelligence, not replace it. Our goal is to make you smarter, more creative, and more productive.",
      gradient: "from-purple-500 to-pink-500",
      points: [
        "AI that learns your thinking patterns",
        "Contextual insights and connections",
        "Proactive knowledge surfacing",
        "Seamless human-AI collaboration"
      ]
    },
    {
      icon: Shield,
      title: "Privacy by Design",
      description: "Your thoughts are sacred. We built Supermind with zero-knowledge architecture, ensuring your data remains completely private.",
      gradient: "from-emerald-500 to-green-500",
      points: [
        "End-to-end encryption always",
        "No server-side data access",
        "Open-source cryptography",
        "You own your data completely"
      ]
    },
    {
      icon: Heart,
      title: "Human-Centered Design",
      description: "Technology should feel magical, not overwhelming. Every interaction is crafted to feel natural, beautiful, and empowering.",
      gradient: "from-rose-500 to-pink-500",
      points: [
        "Intuitive, delightful interfaces",
        "Accessibility for everyone",
        "Thoughtful micro-interactions",
        "Beauty in every detail"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: 999999999, ease: "linear" }}
          className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 60, repeat: 999999999, ease: "linear" }}
          className="absolute top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: 999999999, ease: "linear" }}
          className="absolute bottom-40 right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="flex items-center gap-3 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl transition-all duration-200 text-white hover:text-emerald-400"
            >
              <ArrowLeft size={20} />
              <span>Back to App</span>
            </motion.button>
            
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center"
              >
                <Sparkles className="text-white" size={20} />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                supermind.
              </span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        style={{ y: heroY, opacity: heroOpacity }}
        className="relative min-h-screen flex items-center justify-center px-6 pt-20"
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
              <span>About Supermind</span>
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-bold mb-8 leading-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-400 to-blue-400">
              the story
            </span>
            <br />
            <span className="text-white">behind the mind</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12"
          >
            Born from frustration with scattered digital knowledge, supermind. represents our vision of what personal AI should be: 
            <span className="text-emerald-400 font-semibold"> intelligent, secure, and profoundly human</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              { icon: Users, label: "150K+ Users", desc: "Trust us with their knowledge" },
              { icon: Shield, label: "Zero Breaches", desc: "Perfect security record" },
              { icon: Zap, label: "2.5M+ Items", desc: "Organized and secured" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6"
              >
                <stat.icon className="text-emerald-400 mx-auto mb-4" size={32} />
                <div className="text-3xl font-bold text-white mb-2">{stat.label}</div>
                <div className="text-gray-400">{stat.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Origin Story */}
      <section className="py-32 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                the problem
              </span>
              <span className="text-white"> that started it all</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8">
                <Quote className="text-emerald-400 mb-4" size={32} />
                <p className="text-xl text-gray-300 leading-relaxed italic mb-6">
                  "I had thousands of bookmarks, hundreds of notes, and dozens of apps trying to organize my digital life. 
                  Yet I could never find what I needed when I needed it. The tools were smart, but they didn't understand me."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    AC
                  </div>
                  <div>
                    <div className="text-white font-semibold">Alex Chen</div>
                    <div className="text-gray-400 text-sm">Founder & CEO</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-3xl font-bold text-white mb-6">The Scattered Mind Problem</h3>
              <div className="space-y-4">
                {[
                  "Information scattered across dozens of apps and platforms",
                  "No understanding of context or personal relevance",
                  "Privacy concerns with cloud-based AI processing",
                  "Manual organization that never scales with growth"
                ].map((problem, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                  >
                    <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 bg-red-400 rounded-full" />
                    </div>
                    <p className="text-gray-300">{problem}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-32 px-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                our core
              </span>
              <span className="text-white"> beliefs</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              These principles guide every decision we make, from the smallest UI detail to our fundamental architecture choices.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <ValueCard key={value.title} value={value} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                our
              </span>
              <span className="text-white"> journey</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From a frustrated researcher's late-night coding session to a platform trusted by thousands worldwide.
            </p>
          </motion.div>

          <div className="space-y-12">
            {timeline.map((event, index) => (
              <TimelineEvent key={event.title} event={event} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-32 px-6 bg-gradient-to-r from-gray-900/50 to-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                meet the
              </span>
              <span className="text-white"> minds</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A diverse team of researchers, engineers, and designers united by the vision of augmenting human intelligence.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <TeamMember key={member.name} member={member} index={index} />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-3xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Join Our Mission</h3>
              <p className="text-gray-300 text-lg mb-6">
                We're always looking for passionate individuals who share our vision of augmenting human intelligence 
                while preserving privacy and human agency.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-500/25"
              >
                View Open Positions
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Vision for the Future */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                the future
              </span>
              <span className="text-white"> we're building</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              supermind. is just the beginning. We're working toward a future where AI amplifies human potential 
              while preserving what makes us uniquely human.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Telescope,
                title: "Universal Knowledge Interface",
                description: "A single, intelligent interface that understands and organizes all human knowledge, from personal notes to global research."
              },
              {
                icon: Network,
                title: "Collective Intelligence",
                description: "Privacy-preserving collaboration that allows knowledge sharing without compromising individual privacy."
              },
              {
                icon: Infinity,
                title: "Infinite Memory",
                description: "AI that remembers everything you've ever learned, thought, or discovered, making it instantly accessible when needed."
              },
              {
                icon: Atom,
                title: "Thought Amplification",
                description: "AI that doesn't just store your thoughts but helps you think better, connecting ideas in ways you never imagined."
              },
              {
                icon: Globe,
                title: "Global Knowledge Graph",
                description: "A decentralized, encrypted network of human knowledge that grows smarter while keeping individual data private."
              },
              {
                icon: Rocket,
                title: "Human-AI Symbiosis",
                description: "The perfect partnership between human creativity and AI capability, where both grow stronger together."
              }
            ].map((vision, index) => (
              <motion.div
                key={vision.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 hover:bg-gray-800/60 hover:border-gray-600/50 transition-all duration-300"
              >
                <vision.icon className="text-emerald-400 mb-4" size={32} />
                <h3 className="text-xl font-bold text-white mb-3">{vision.title}</h3>
                <p className="text-gray-300 leading-relaxed">{vision.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-32 px-6">
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
            
            <div className="relative bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-3xl p-12">
              <div className="flex items-center justify-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 2, repeat: 999999999, ease: "linear" }}
                  className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center"
                >
                  <Brain className="text-emerald-400" size={24} />
                </motion.div>
                <div className="text-emerald-400 font-semibold">Join the Revolution</div>
              </div>
              
              <h2 className="text-5xl font-bold mb-6 text-white">
                your mind, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">amplified</span>
              </h2>
              <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                Be part of the future of human-AI collaboration. Experience what it means to have a truly intelligent, 
                secure second brain that grows with you.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(16, 185, 129, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="px-12 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center gap-3 shadow-2xl mx-auto"
              >
                Start Your Journey
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: 999999999 }}
                >
                  <Rocket size={24} />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}