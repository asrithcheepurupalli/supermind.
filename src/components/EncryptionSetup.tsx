import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Eye, EyeOff, AlertCircle, CheckCircle, Lock, Fingerprint } from 'lucide-react';
import { encryptionManager } from '../utils/encryption';
import Button from './ui/Button';
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
    toast.success('Secure password generated! Please save it safely.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!isLogin && passwordStrength < 4) {
      toast.error('Please use a stronger password');
      return;
    }

    setIsLoading(true);

    try {
      await encryptionManager.generateMasterKey(password);
      onComplete(password);
      toast.success(isLogin ? 'Encryption key loaded' : 'Encryption setup complete');
    } catch {
      toast.error('Failed to setup encryption');
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (strength: number): string => {
    if (strength < 2) return 'bg-red-500';
    if (strength < 4) return 'bg-yellow-500';
    if (strength < 5) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const getStrengthText = (strength: number): string => {
    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Fair';
    if (strength < 5) return 'Good';
    return 'Strong';
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="text-white" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {isLogin ? 'Unlock Your Encrypted Data' : 'Secure Your Mind'}
        </h2>
        <p className="text-gray-400">
          {isLogin 
            ? 'Enter your encryption password to access your data'
            : 'Set up end-to-end encryption to protect your content'
          }
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-white font-medium mb-2">
            {isLogin ? 'Encryption Password' : 'Master Password'}
          </label>
          <div className="relative">
            <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your master password"
              className="w-full pl-10 pr-12 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {!isLogin && password && (
            <div className="mt-2">
              <div className="flex gap-1 mb-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                      passwordStrength > i ? getStrengthColor(passwordStrength) : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Password strength: <span className={passwordStrength >= 4 ? 'text-emerald-400' : 'text-yellow-400'}>
                  {getStrengthText(passwordStrength)}
                </span>
              </p>
            </div>
          )}
        </div>

        {!isLogin && (
          <div>
            <label className="block text-white font-medium mb-2">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your master password"
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                required
              />
              {confirmPassword && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {password === confirmPassword ? (
                    <CheckCircle className="text-emerald-400" size={18} />
                  ) : (
                    <AlertCircle className="text-red-400" size={18} />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {!isLogin && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Fingerprint className="text-blue-400 mt-0.5" size={18} />
              <div>
                <h4 className="text-blue-400 font-medium mb-1">Need a secure password?</h4>
                <p className="text-gray-400 text-sm mb-3">
                  We can generate a cryptographically secure password for you.
                </p>
                <button
                  type="button"
                  onClick={generateSecurePassword}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Generate Secure Password
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="text-emerald-400 mt-0.5" size={18} />
            <div className="text-sm">
              <h4 className="text-emerald-400 font-medium mb-1">Zero-Knowledge Security</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• Your password never leaves your device</li>
                <li>• All encryption happens locally</li>
                <li>• Even we cannot access your data</li>
                <li>• Military-grade AES-256 encryption</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          disabled={!password || (!isLogin && password !== confirmPassword)}
        >
          {isLogin ? 'Unlock Data' : 'Setup Encryption'}
        </Button>
      </form>

      {useGeneratedPassword && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-400 mt-0.5" size={18} />
            <div className="text-sm">
              <h4 className="text-yellow-400 font-medium mb-1">Important: Save Your Password</h4>
              <p className="text-gray-400">
                Please save this password in a secure location. If you lose it, your encrypted data cannot be recovered.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}