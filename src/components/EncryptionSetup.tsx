import React from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { encryptionManager } from '../utils/encryption';
import toast from 'react-hot-toast';

interface EncryptionSetupProps {
  onComplete: (password: string) => void;
  isLogin?: boolean;
}

export default function EncryptionSetup({ onComplete, isLogin = false }: EncryptionSetupProps) {
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [passwordStrength, setPasswordStrength] = React.useState(0);
  const [useGeneratedPassword, setUseGeneratedPassword] = React.useState(false);

  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (pwd.length >= 12) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[a-z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return strength;
  };

  React.useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  const generateSecurePassword = () => {
    const generated = encryptionManager.generateSecurePassword(16);
    setPassword(generated);
    setConfirmPassword(generated);
    setUseGeneratedPassword(true);
    toast.success('Passphrase generated. Save it somewhere safe.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      toast.error('Passphrases do not match');
      return;
    }

    if (!isLogin && passwordStrength < 4) {
      toast.error('Please use a stronger passphrase');
      return;
    }

    setIsLoading(true);

    try {
      await encryptionManager.generateMasterKey(password);
      onComplete(password);
    } catch {
      toast.error('Failed to set up encryption');
    } finally {
      setIsLoading(false);
    }
  };

  const strengthWord = passwordStrength < 2 ? 'weak' : passwordStrength < 4 ? 'fair' : passwordStrength < 5 ? 'good' : 'strong';

  return (
    <div className="card-ink-static rounded-sm p-8 relative rotate-[-0.5deg]">
      <div className="flex items-start justify-between mb-6">
        <div className="font-label text-[10px] text-ink-faint">
          {isLogin ? 'vault · locked' : 'vault · setup'}
        </div>
        <span className="stamp text-[10px] text-accent">{isLogin ? 'sealed' : 'aes-256'}</span>
      </div>

      <h2 className="font-display text-3xl md:text-4xl tracking-tight mb-3 text-ink">
        {isLogin ? <>The notebook is <em className="marker">sealed</em>.</> : <>Choose your <em className="marker">passphrase</em></>}
      </h2>
      <p className="text-ink-soft text-sm leading-relaxed mb-8">
        {isLogin
          ? 'Your passphrase opens it. The key never left this device.'
          : 'It becomes your encryption key, never stored and never sent. Lose it and the vault stays sealed for good.'}
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="font-label text-[10px] text-ink-soft block mb-2">
            {isLogin ? 'passphrase' : 'passphrase'}
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your passphrase"
              autoFocus
              className="bare-input w-full bg-paper border-[1.5px] border-ink rounded-sm px-4 py-3 pr-12 text-ink outline-none focus:border-[var(--accent)] transition-colors font-medium"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors"
              aria-label="Toggle passphrase visibility"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {!isLogin && password && (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex gap-1 flex-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-[5px] flex-1 rounded-full border border-ink transition-colors duration-200 ${
                      passwordStrength > i ? 'bg-accent' : 'bg-paper'
                    }`}
                  />
                ))}
              </div>
              <span className="font-label text-[9px] text-ink-soft w-12 text-right">{strengthWord}</span>
            </div>
          )}
        </div>

        {!isLogin && (
          <div>
            <label className="font-label text-[10px] text-ink-soft block mb-2">confirm</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="The same passphrase again"
                className="bare-input w-full bg-paper border-[1.5px] border-ink rounded-sm px-4 py-3 pr-12 text-ink outline-none focus:border-[var(--accent)] transition-colors font-medium"
                required
              />
              {confirmPassword && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {password === confirmPassword ? (
                    <Check size={16} className="text-accent" />
                  ) : (
                    <AlertCircle size={16} className="text-ink-faint" />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!isLogin && (
          <button
            type="button"
            onClick={generateSecurePassword}
            className="font-label text-[10px] text-accent hover:underline"
          >
            → generate one for me
          </button>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn-ink haptic w-full py-3.5 rounded-sm font-semibold disabled:opacity-40 disabled:pointer-events-none"
        >
          {isLoading ? 'working…' : isLogin ? 'Open the notebook' : 'Seal the notebook'}
        </button>
      </form>

      {useGeneratedPassword && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 border-[1.5px] border-ink rounded-sm p-4 bg-[var(--accent-soft)]"
        >
          <p className="font-label text-[9px] text-ink leading-relaxed">
            write it down. real encryption has no reset.
          </p>
        </motion.div>
      )}

      {!isLogin && !useGeneratedPassword && (
        <p className="font-label text-[9px] text-ink-faint mt-6 leading-relaxed">
          key derived on this device (pbkdf2 · 250k) and held in memory only
        </p>
      )}

      {isLogin && (
        <p className="font-label text-[9px] text-ink-faint mt-6 leading-relaxed">
          lost the passphrase? real encryption has no reset. start a fresh notebook and
          restore from a backup file if you kept one.
        </p>
      )}
    </div>
  );
}
