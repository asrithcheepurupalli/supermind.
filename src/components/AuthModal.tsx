import React from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  User,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Brain,
  AlertCircle,
  CheckCircle,
  HardDrive,
} from 'lucide-react';
import EncryptionSetup from './EncryptionSetup';

interface AuthModalProps {
  onComplete: (name: string, email: string, encryptionPassword?: string) => void;
}

const features = [
  {
    icon: HardDrive,
    title: 'Local-First & Private',
    description: 'Everything you save is stored on your device. No account, no server, no tracking.',
  },
  {
    icon: Brain,
    title: 'Automatic Organization',
    description: 'Content is tagged, summarized, and categorized on-device as you add it.',
  },
  {
    icon: Zap,
    title: 'Instant Search',
    description: 'Fuzzy search across all your notes, links, and files in milliseconds.',
  },
  {
    icon: Shield,
    title: 'Optional Encryption',
    description: 'Protect your data at rest with AES-256-GCM using a passphrase only you know.',
  },
];

export default function AuthModal({ onComplete }: AuthModalProps) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [enableEncryption, setEnableEncryption] = React.useState(false);
  const [showEncryptionSetup, setShowEncryptionSetup] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'A name is required';
    }
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (enableEncryption) {
      setShowEncryptionSetup(true);
    } else {
      onComplete(name.trim(), email.trim());
    }
  };

  const handleEncryptionComplete = (encryptionPassword: string) => {
    onComplete(name.trim(), email.trim(), encryptionPassword);
  };

  if (showEncryptionSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <EncryptionSetup onComplete={handleEncryptionComplete} />
          <button
            onClick={() => {
              setShowEncryptionSetup(false);
              setEnableEncryption(false);
            }}
            className="mt-6 w-full text-center text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Back / skip encryption for now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex overflow-hidden">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />

        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">supermind.</h1>
                <p className="text-emerald-400 text-sm">Your Local-First Second Brain</p>
              </div>
            </div>

            <div className="space-y-6 mb-12">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Capture everything.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                  Keep it on your device.
                </span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Save notes, links, and files. supermind organizes them automatically and makes
                them instantly searchable — entirely on your device.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <IconComponent className="text-emerald-400" size={18} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Profile Setup */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md my-8 lg:my-0"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">supermind.</h1>
              <p className="text-emerald-400 text-sm">Your Local-First Second Brain</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">
              Set up your space
            </h2>
            <p className="text-gray-400 text-sm lg:text-base">
              No account needed — your profile and everything you save stay on this device.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white font-medium mb-2">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  placeholder="What should we call you?"
                  autoFocus
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.name
                      ? 'border-red-500/50 focus:ring-red-500/50'
                      : 'border-gray-700/50 focus:ring-emerald-500/50 focus:border-emerald-500/50'
                  } text-sm lg:text-base`}
                />
                {errors.name && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertCircle className="text-red-400" size={18} />
                  </div>
                )}
              </div>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {errors.name}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                Email <span className="text-gray-500 font-normal">(optional, shown on your profile)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.email
                      ? 'border-red-500/50 focus:ring-red-500/50'
                      : 'border-gray-700/50 focus:ring-emerald-500/50 focus:border-emerald-500/50'
                  } text-sm lg:text-base`}
                />
                {errors.email ? (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertCircle className="text-red-400" size={18} />
                  </div>
                ) : email && /\S+@\S+\.\S+/.test(email) && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="text-emerald-400" size={18} />
                  </div>
                )}
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Encryption Opt-in */}
            <button
              type="button"
              onClick={() => setEnableEncryption(!enableEncryption)}
              className={`w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                enableEncryption
                  ? 'bg-emerald-500/10 border-emerald-500/40'
                  : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600/50'
              }`}
            >
              <div className={`w-5 h-5 mt-0.5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                enableEncryption ? 'bg-emerald-500 border-emerald-500' : 'border-gray-600'
              }`}>
                {enableEncryption && <CheckCircle className="text-white" size={14} />}
              </div>
              <div>
                <div className="flex items-center gap-2 text-white font-medium">
                  <Shield size={14} className="text-emerald-400" />
                  Encrypt my data at rest
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  You'll set a passphrase next. Without it, your saved content can't be read —
                  not even from this device's storage.
                </p>
              </div>
            </button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/25 touch-manipulation text-sm lg:text-base"
            >
              {enableEncryption ? 'Continue to Encryption Setup' : 'Create My Space'}
              <ArrowRight size={18} />
            </motion.button>
          </form>

          <p className="text-center text-xs lg:text-sm text-gray-500 mt-6">
            Your data stays in this browser's storage. Export a backup any time from
            Settings → Data &amp; Storage.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
