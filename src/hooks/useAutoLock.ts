import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

// Locks the encrypted workspace after a period of inactivity by clearing the
// in-memory key, forcing a passphrase unlock to continue.
export const useAutoLock = () => {
  const autoLock = useStore(s => s.settings.security.autoLock);
  const timeoutMinutes = useStore(s => s.settings.security.autoLockTimeout);
  const encryptionEnabled = useStore(s => s.user?.encryptionEnabled);
  const isEncryptionSetup = useStore(s => s.isEncryptionSetup);
  const lock = useStore(s => s.lock);
  const timerRef = useRef<number>();

  useEffect(() => {
    const enabled = autoLock && encryptionEnabled && isEncryptionSetup;
    if (!enabled) return;

    const reset = () => {
      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        lock();
        toast('Workspace locked after inactivity', { icon: '🔒' });
      }, timeoutMinutes * 60_000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      window.clearTimeout(timerRef.current);
      events.forEach(e => window.removeEventListener(e, reset));
    };
  }, [autoLock, timeoutMinutes, encryptionEnabled, isEncryptionSetup, lock]);
};
