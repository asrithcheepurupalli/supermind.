import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface SecurityBadgeProps {
  variant?: 'compact' | 'detailed' | 'floating';
}

// A wax-seal of sorts: a small stamped paper slip confirming the vault is
// sealed. Only the floating variant is used in the app shell.
export default function SecurityBadge({ variant = 'floating' }: SecurityBadgeProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  if (variant !== 'floating') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 z-40 hidden lg:block print:!hidden"
    >
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="card-ink-static rounded-sm px-3.5 py-2.5 max-w-[240px] -rotate-1"
      >
        <div className="flex items-center gap-2.5">
          <Shield size={14} className="text-accent flex-shrink-0" />
          <div className="font-label text-[9px] text-ink leading-tight">
            sealed · aes-256
            <span className="block text-ink-faint">local-only storage</span>
          </div>
        </div>
        {isHovered && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-ink-faint text-[10px] leading-relaxed mt-2 pt-2 border-t border-dotted border-[var(--ink-line)]"
          >
            Your content is encrypted with AES-256-GCM before it is written to this
            device's storage. The key is derived from your passphrase and never stored.
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
