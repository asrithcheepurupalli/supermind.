import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Shield,
  ArrowRight,
  ArrowLeft,
  HardDrive,
  Check,
  Lock,
  Brain,
  Library,
} from 'lucide-react';
import EncryptionSetup from './EncryptionSetup';
import { hapticTap, hapticSuccess } from '../utils/haptics';

interface AuthModalProps {
  onComplete: (name: string, email: string, encryptionPassword?: string) => void;
}

type Step = 'name' | 'email' | 'privacy' | 'passphrase' | 'building';

const stepOrder: Step[] = ['name', 'email', 'privacy'];

const slide = {
  initial: { opacity: 0, y: 28, filter: 'blur(8px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -28, filter: 'blur(8px)' },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

export default function AuthModal({ onComplete }: AuthModalProps) {
  const [step, setStep] = React.useState<Step>('name');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [vault, setVault] = React.useState<'standard' | 'encrypted'>('standard');
  const [passphrase, setPassphrase] = React.useState<string | undefined>();
  const [buildStage, setBuildStage] = React.useState(0);
  const goToName = () => setStep('name');

  const submitName = () => {
    if (!name.trim()) return;
    hapticTap();
    setStep('email');
  };

  const submitEmail = () => {
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setEmailError('That doesn\'t look like a valid email — or just leave it blank.');
      return;
    }
    hapticTap();
    setStep('privacy');
  };

  const startBuilding = (password?: string) => {
    setPassphrase(password);
    hapticSuccess();
    setStep('building');
  };

  // Orchestrated "building your space" sequence, then hand off to the app.
  React.useEffect(() => {
    if (step !== 'building') return;
    const timers = [
      setTimeout(() => setBuildStage(1), 600),
      setTimeout(() => setBuildStage(2), 1250),
      setTimeout(() => setBuildStage(3), 1900),
      setTimeout(() => onComplete(name.trim(), email.trim(), passphrase), 2600),
    ];
    return () => timers.forEach(clearTimeout);
  }, [step, name, email, passphrase, onComplete]);

  const buildStages = [
    { icon: Library, label: 'Creating your library' },
    { icon: Brain, label: 'Waking the on-device organizer' },
    passphrase
      ? { icon: Lock, label: 'Forging your encryption key' }
      : { icon: HardDrive, label: 'Anchoring everything to this device' },
  ];

  const progressIndex = stepOrder.indexOf(step as (typeof stepOrder)[number]);

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col relative overflow-hidden noise">
      {/* Ambient gradient mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-[25%] left-[15%] w-[40rem] h-[40rem] rounded-full bg-emerald-500/[0.09] blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[5%] w-[36rem] h-[36rem] rounded-full bg-blue-500/[0.09] blur-[130px]" />
      </div>

      {/* Top bar: brand + progress */}
      <div className="relative z-10 flex items-center justify-between px-8 pt-8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
            <Sparkles className="text-white" size={17} />
          </div>
          <span className="text-xl font-bold tracking-tight">supermind.</span>
        </div>
        {progressIndex >= 0 && (
          <div className="flex items-center gap-2">
            {stepOrder.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i <= progressIndex ? 'w-8 bg-gradient-to-r from-emerald-400 to-blue-400' : 'w-4 bg-white/15'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {step === 'name' && (
            <motion.div key="name" {...slide} className="w-full max-w-2xl text-center">
              <p className="text-emerald-400 font-medium mb-6 tracking-wide text-sm uppercase">
                Let's set up your space — no account needed
              </p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-12 leading-tight">
                What should we<br />call you?
              </h1>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitName()}
                placeholder="What should we call you?"
                aria-label="Your name"
                className="bare-input w-full max-w-md mx-auto block bg-transparent text-center text-3xl md:text-4xl font-semibold placeholder-white/20 outline-none border-b-2 border-white/15 focus:border-emerald-400/70 pb-4 transition-colors caret-emerald-400"
              />
              <div className="h-20 mt-10">
                <AnimatePresence>
                  {name.trim() && (
                    <motion.button
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 12, scale: 0.95 }}
                      onClick={submitName}
                      className="haptic px-9 py-4 bg-white text-black rounded-2xl font-bold text-lg inline-flex items-center gap-3 shadow-[0_20px_60px_-15px_rgba(255,255,255,0.35)]"
                    >
                      Continue
                      <ArrowRight size={19} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              <p className="text-gray-500 text-sm">press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300">↵</kbd> to continue</p>
            </motion.div>
          )}

          {step === 'email' && (
            <motion.div key="email" {...slide} className="w-full max-w-2xl text-center">
              <p className="text-emerald-400 font-medium mb-6 tracking-wide text-sm uppercase">
                Nice to meet you, {name.trim().split(' ')[0]}
              </p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
                An email for your profile?
              </h1>
              <p className="text-gray-400 text-lg mb-12">
                Purely cosmetic — it never leaves this device. Skip it freely.
              </p>
              <input
                autoFocus
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && submitEmail()}
                placeholder="you@example.com"
                aria-label="Email (optional)"
                className="bare-input w-full max-w-md mx-auto block bg-transparent text-center text-2xl md:text-3xl font-medium placeholder-white/20 outline-none border-b-2 border-white/15 focus:border-emerald-400/70 pb-4 transition-colors caret-emerald-400"
              />
              {emailError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm mt-4">
                  {emailError}
                </motion.p>
              )}
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={goToName}
                  className="haptic p-4 rounded-2xl bg-white/[0.06] hover:bg-white/10 border border-white/10 transition-colors"
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={submitEmail}
                  className="haptic px-9 py-4 bg-white text-black rounded-2xl font-bold text-lg inline-flex items-center gap-3 shadow-[0_20px_60px_-15px_rgba(255,255,255,0.35)]"
                >
                  {email.trim() ? 'Continue' : 'Skip'}
                  <ArrowRight size={19} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'privacy' && (
            <motion.div key="privacy" {...slide} className="w-full max-w-3xl text-center">
              <p className="text-emerald-400 font-medium mb-6 tracking-wide text-sm uppercase">
                One last choice
              </p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 leading-tight">
                How protected should<br />your mind be?
              </h1>
              <p className="text-gray-400 text-lg mb-12">
                Either way, nothing ever leaves this device.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-2xl mx-auto mb-12">
                {[
                  {
                    id: 'standard' as const,
                    icon: HardDrive,
                    title: 'Local-Only',
                    desc: 'Your data lives in this browser\'s storage, in the clear. Simple and instant.',
                    tag: 'Default',
                  },
                  {
                    id: 'encrypted' as const,
                    icon: Shield,
                    title: 'Encrypted Vault',
                    desc: 'AES-256-GCM at rest with a passphrase only you know, plus auto-lock. Unrecoverable without it.',
                    tag: 'Recommended',
                  },
                ].map((option) => {
                  const active = vault === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => { hapticTap(); setVault(option.id); }}
                      className={`haptic relative text-left p-6 rounded-3xl border transition-all duration-300 ${
                        active
                          ? 'bg-emerald-500/[0.08] border-emerald-400/50 shadow-[0_20px_60px_-20px_rgba(16,185,129,0.4)]'
                          : 'bg-white/[0.04] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className={`absolute top-5 right-5 w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        active ? 'bg-emerald-500 border-emerald-500' : 'border-white/25'
                      }`}>
                        {active && <Check size={13} className="text-white" />}
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/25 to-blue-500/25 border border-white/10 flex items-center justify-center mb-5">
                        <option.icon size={20} className="text-emerald-400" />
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{option.title}</h3>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-gray-300">{option.tag}</span>
                      </div>
                      <p className="text-gray-400 text-sm leading-relaxed">{option.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setStep('email')}
                  className="haptic p-4 rounded-2xl bg-white/[0.06] hover:bg-white/10 border border-white/10 transition-colors"
                  aria-label="Back"
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  onClick={() => {
                    if (vault === 'encrypted') {
                      hapticTap();
                      setStep('passphrase');
                    } else {
                      startBuilding();
                    }
                  }}
                  className="haptic px-9 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-2xl font-bold text-lg inline-flex items-center gap-3 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)]"
                >
                  {vault === 'encrypted' ? 'Set My Passphrase' : 'Create My Space'}
                  <ArrowRight size={19} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'passphrase' && (
            <motion.div key="passphrase" {...slide} className="w-full max-w-md">
              <EncryptionSetup onComplete={(password) => startBuilding(password)} />
              <button
                onClick={() => setStep('privacy')}
                className="mt-6 w-full text-center text-gray-500 hover:text-white text-sm transition-colors"
              >
                ← Back to privacy options
              </button>
            </motion.div>
          )}

          {step === 'building' && (
            <motion.div key="building" {...slide} className="w-full max-w-md text-center">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 16 }}
                className="w-20 h-20 mx-auto mb-10 rounded-3xl bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center shadow-[0_30px_80px_-20px_rgba(16,185,129,0.6)]"
              >
                <Sparkles className="text-white" size={32} />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-10">
                Building your space, {name.trim().split(' ')[0]}…
              </h1>
              <div className="space-y-4 text-left max-w-xs mx-auto">
                {buildStages.map((stage, i) => {
                  const done = buildStage > i;
                  const current = buildStage === i;
                  return (
                    <motion.div
                      key={stage.label}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: done || current ? 1 : 0.35, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                        done ? 'bg-emerald-500 text-white' : 'bg-white/10 text-gray-400'
                      }`}>
                        {done ? <Check size={14} /> : <stage.icon size={14} className={current ? 'animate-pulse' : ''} />}
                      </div>
                      <span className={`text-sm ${done ? 'text-white' : 'text-gray-400'}`}>{stage.label}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer note */}
      <div className="relative z-10 pb-8 text-center text-gray-600 text-xs">
        Local-first · no account · export a backup any time
      </div>
    </div>
  );
}
