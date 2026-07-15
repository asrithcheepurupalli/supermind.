import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff, Fingerprint, Key } from 'lucide-react';

interface SecurityBadgeProps {
  variant?: 'compact' | 'detailed' | 'floating';
  showDetails?: boolean;
}

export default function SecurityBadge({ variant = 'compact', showDetails = false }: SecurityBadgeProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  if (variant === 'floating') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-4 left-4 z-40 hidden lg:block"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="bg-gray-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 shadow-2xl hover:shadow-emerald-500/20 transition-all duration-300"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: isHovered ? 360 : 0 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center"
            >
              <Shield className="text-emerald-400" size={20} />
            </motion.div>
            <div>
              <div className="text-white font-semibold text-sm">End-to-End Encrypted</div>
              <div className="text-emerald-400 text-xs">Zero-Knowledge Security</div>
            </div>
          </div>
          
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-gray-700/50"
            >
              <div className="text-xs text-gray-400">
                Your data is encrypted on your device before it ever leaves. Even we can't see your content.
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <Shield className="text-emerald-400" size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Military-Grade Security</h3>
            <p className="text-emerald-400 text-sm">End-to-End Encrypted • Zero-Knowledge Architecture</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
            <Lock className="text-blue-400" size={16} />
            <div>
              <div className="text-white text-sm font-medium">AES-256 Encryption</div>
              <div className="text-gray-400 text-xs">Client-side encryption</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
            <EyeOff className="text-purple-400" size={16} />
            <div>
              <div className="text-white text-sm font-medium">Zero-Knowledge</div>
              <div className="text-gray-400 text-xs">We can't see your data</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-xl">
            <Fingerprint className="text-emerald-400" size={16} />
            <div>
              <div className="text-white text-sm font-medium">Biometric Auth</div>
              <div className="text-gray-400 text-xs">Secure access control</div>
            </div>
          </div>
        </div>
        
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-gray-700/30"
          >
            <div className="text-sm text-gray-300 space-y-2">
              <p>• Your content is encrypted on your device using AES-256 encryption before transmission</p>
              <p>• Encryption keys are derived from your password and never leave your device</p>
              <p>• Even our servers cannot decrypt your data - true zero-knowledge architecture</p>
              <p>• All AI processing happens locally on your device to maintain privacy</p>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  // Compact variant
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
      <Shield className="text-emerald-400" size={14} />
      <span className="text-emerald-400 text-sm font-medium">End-to-End Encrypted</span>
    </div>
  );
}