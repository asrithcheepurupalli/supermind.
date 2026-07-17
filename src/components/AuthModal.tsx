import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  HardDrive,
  Check,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';
import EncryptionSetup from './EncryptionSetup';
import { hapticTap, hapticSuccess } from '../utils/haptics';
import { useStore } from '../store/useStore';

const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

interface AuthModalProps {
  onComplete: (name: string, email: string, encryptionPassword?: string) => void;
}

type Step = 'name' | 'email' | 'privacy' | 'passphrase' | 'building';

const stepOrder: Step[] = ['name', 'email', 'privacy'];

const slide = {
  initial: { opacity: 0, y: 26, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -26, filter: 'blur(6px)' },
  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const },
};

export default function AuthModal({ onComplete }: AuthModalProps) {
  const [step, setStep] = React.useState<Step>('name');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState('');
  const [vault, setVault] = React.useState<'standard' | 'encrypted'>('standard');
  const [passphrase, setPassphrase] = React.useState<string | undefined>();
  const [buildStage, setBuildStage] = React.useState(0);

  const firstName = name.trim().split(' ')[0];

  const submitName = () => {
    if (!name.trim()) return;
    hapticTap();
    setStep('email');
  };

  const submitEmail = () => {
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      setEmailError("That doesn't look like an email. You can also leave it blank.");
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

  // A notebook passed from another device: restore profile and entries in
  // one move, no signup dance. The file never leaves the browser.
  const restoreInputRef = React.useRef<HTMLInputElement>(null);
  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const { setUser, importContent } = useStore.getState();
        const owner = typeof data?.owner === 'string' && data.owner.trim() ? data.owner.trim() : 'friend';
        setUser({ id: 'local', name: owner, email: '', encryptionEnabled: false, createdAt: new Date() });
        const count = importContent(data);
        hapticSuccess();
        toast.success(`Welcome back, ${owner.split(' ')[0]}. ${count} entries restored.`);
      } catch {
        toast.error("That file doesn't look like a supermind notebook.");
      }
    };
    reader.readAsText(file);
  };

  // Orchestrated "writing your notebook" sequence, then hand off to the app.
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
    'binding your library',
    'waking the on-device organizer',
    passphrase ? 'forging your encryption key' : 'anchoring everything to this device',
  ];

  const progressIndex = stepOrder.indexOf(step as (typeof stepOrder)[number]);

  return (
    <div className="min-h-screen bg-paper text-ink flex flex-col relative overflow-hidden noise dot-grid">
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-8" style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.75rem)' }}>
        <div className="flex items-baseline gap-1">
          <span className="font-display text-2xl tracking-tight">supermind</span>
          <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
        </div>
        {progressIndex >= 0 && (
          <div className="flex items-center gap-3">
            <span className="font-label text-[10px] text-ink-faint tabular-nums">
              0{progressIndex + 1} / 03
            </span>
            <div className="flex items-center gap-1.5">
              {stepOrder.map((s, i) => (
                <div
                  key={s}
                  className={`h-[3px] rounded-full transition-all duration-500 ${
                    i <= progressIndex ? 'w-7 bg-accent' : 'w-3.5 bg-[var(--ink-line)]'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {step === 'name' && (
            <motion.div key="name" {...slide} className="w-full max-w-2xl text-center">
              <p className="font-label text-[11px] text-accent mb-8">
                [ set up your space · no account needed ]
              </p>
              <h1 className="font-display text-5xl md:text-7xl leading-[1.02] tracking-tight mb-14">
                What should we
                <br />
                <em className="marker">call you?</em>
              </h1>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitName()}
                placeholder="What should we call you?"
                aria-label="Your name"
                className="bare-input font-display italic w-full max-w-md mx-auto block bg-transparent text-center text-3xl md:text-4xl placeholder:text-[var(--ink-faint)] placeholder:not-italic outline-none border-b-2 border-ink pb-3 transition-colors focus:border-[var(--accent)] caret-[var(--accent)] text-ink"
              />
              <div className="h-20 mt-10">
                <AnimatePresence>
                  {name.trim() && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      onClick={submitName}
                      className="btn-ink haptic px-8 py-3.5 rounded-sm font-semibold inline-flex items-center gap-3"
                    >
                      Continue <ArrowRight size={17} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
              {!isTouch && (
                <p className="font-label text-[10px] text-ink-faint">
                  press <kbd className="keycap keycap-press text-[10px] !py-0.5 !px-2">↵</kbd> to continue
                </p>
              )}
              <p className="font-label text-[9px] text-ink-faint mt-8">
                moving from another device?{' '}
                <button
                  onClick={() => restoreInputRef.current?.click()}
                  className="text-accent hover:underline underline-offset-2"
                >
                  bring your notebook
                </button>
              </p>
              <input
                ref={restoreInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleRestoreFile}
                className="hidden"
              />
            </motion.div>
          )}

          {step === 'email' && (
            <motion.div key="email" {...slide} className="w-full max-w-2xl text-center">
              <p className="font-label text-[11px] text-accent mb-8">
                [ nice to meet you, {firstName} ]
              </p>
              <h1 className="font-display text-5xl md:text-7xl leading-[1.02] tracking-tight mb-4">
                An email for
                <br />
                your <em className="marker">profile?</em>
              </h1>
              <p className="text-ink-soft text-lg mb-12">
                Only used to greet you. It never leaves this device, and you can skip it.
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
                className="bare-input font-display italic w-full max-w-md mx-auto block bg-transparent text-center text-2xl md:text-3xl placeholder:text-[var(--ink-faint)] placeholder:not-italic outline-none border-b-2 border-ink pb-3 transition-colors focus:border-[var(--accent)] caret-[var(--accent)] text-ink"
              />
              {emailError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-label text-[10px] text-accent mt-4">
                  {emailError}
                </motion.p>
              )}
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => setStep('name')}
                  className="btn-paper haptic p-3.5 rounded-sm"
                  aria-label="Back"
                >
                  <ArrowLeft size={17} />
                </button>
                <button
                  onClick={submitEmail}
                  className="btn-ink haptic px-8 py-3.5 rounded-sm font-semibold inline-flex items-center gap-3"
                >
                  {email.trim() ? 'Continue' : 'Skip'} <ArrowRight size={17} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'privacy' && (
            <motion.div key="privacy" {...slide} className="w-full max-w-3xl text-center">
              <p className="font-label text-[11px] text-accent mb-8">
                [ one last choice ]
              </p>
              <h1 className="font-display text-5xl md:text-7xl leading-[1.02] tracking-tight mb-4">
                How protected should
                <br />
                your <em className="marker">mind</em> be?
              </h1>
              <p className="text-ink-soft text-lg mb-12">
                Either way, nothing ever leaves this device.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
                {[
                  {
                    id: 'standard' as const,
                    icon: HardDrive,
                    title: 'Local-Only',
                    stampText: 'open',
                    rotate: '-rotate-1',
                    desc: "Lives in this browser's storage, in the clear. Simple and instant.",
                  },
                  {
                    id: 'encrypted' as const,
                    icon: Shield,
                    title: 'Encrypted Vault',
                    stampText: 'sealed',
                    rotate: 'rotate-1',
                    desc: 'AES-256 at rest with a passphrase only you know, plus auto-lock. Unrecoverable without it.',
                  },
                ].map((option) => {
                  const active = vault === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => { hapticTap(); setVault(option.id); }}
                      className={`card-ink haptic relative text-left p-6 rounded-sm transition-colors ${option.rotate} ${
                        active ? 'outline outline-2 outline-[var(--accent)] outline-offset-2' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-5">
                        <div className={`w-11 h-11 rounded-sm border-[1.5px] border-ink flex items-center justify-center ${active ? 'bg-accent text-paper' : 'bg-paper text-ink'} transition-colors`}>
                          <option.icon size={18} />
                        </div>
                        <span className={`stamp text-[10px] transition-colors ${active ? 'text-accent' : 'text-ink-faint'}`}>
                          {option.stampText}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-display text-2xl">{option.title}</h3>
                        {active && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 rounded-full bg-accent text-paper flex items-center justify-center"
                          >
                            <Check size={12} />
                          </motion.span>
                        )}
                      </div>
                      <p className="text-ink-soft text-sm leading-relaxed">{option.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setStep('email')}
                  className="btn-paper haptic p-3.5 rounded-sm"
                  aria-label="Back"
                >
                  <ArrowLeft size={17} />
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
                  className="btn-ink haptic px-8 py-3.5 rounded-sm font-semibold inline-flex items-center gap-3"
                >
                  {vault === 'encrypted' ? 'Set My Passphrase' : 'Create My Space'}
                  <ArrowRight size={17} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'passphrase' && (
            <motion.div key="passphrase" {...slide} className="w-full max-w-md">
              <EncryptionSetup onComplete={(password) => startBuilding(password)} />
              <button
                onClick={() => setStep('privacy')}
                className="mt-6 w-full text-center font-label text-[10px] text-ink-faint hover:text-ink transition-colors"
              >
                ← back to privacy options
              </button>
            </motion.div>
          )}

          {step === 'building' && (
            <motion.div key="building" {...slide} className="w-full max-w-md">
              <div className="card-ink-static rounded-sm p-8 ruled relative">
                <div className="font-label text-[10px] text-ink-faint mb-6">
                  page 01 · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <h1 className="font-display text-3xl md:text-4xl tracking-tight mb-8">
                  Binding your notebook, <em className="marker">{firstName}</em>…
                </h1>
                <div className="space-y-[14px]">
                  {buildStages.map((label, i) => {
                    const done = buildStage > i;
                    const current = buildStage === i;
                    return (
                      <div key={label} className="flex items-center gap-3">
                        <span className={`w-5 h-5 border-[1.5px] border-ink rounded-sm flex items-center justify-center flex-shrink-0 ${done ? 'bg-accent' : 'bg-paper'} transition-colors duration-300`}>
                          {done && (
                            <motion.span initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                              <Check size={12} className="text-paper" />
                            </motion.span>
                          )}
                        </span>
                        <span className={`font-display text-lg italic transition-opacity duration-300 ${done ? 'text-ink' : current ? 'text-ink-soft' : 'text-ink-faint opacity-50'}`}>
                          {label}
                        </span>
                        {current && (
                          <span className="inline-block w-[2px] h-[1em] bg-accent animate-pulse ml-1" />
                        )}
                      </div>
                    );
                  })}
                </div>
                <motion.span
                  initial={{ opacity: 0, scale: 2.2, rotate: 10 }}
                  animate={buildStage >= 3 ? { opacity: 1, scale: 1, rotate: -3 } : {}}
                  transition={{ type: 'spring', stiffness: 320, damping: 15 }}
                  className="stamp text-xs text-accent absolute bottom-6 right-6"
                >
                  yours
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer note */}
      <div className="relative z-10 pb-7 text-center font-label text-[10px] text-ink-faint">
        local-first · no account · export a backup any time
      </div>
    </div>
  );
}
