import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import '@fontsource-variable/inter';
import '@fontsource/instrument-serif';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import App from './App.tsx';
import { useStore } from './store/useStore';
import './index.css';

// The notebook now hydrates from IndexedDB, which is asynchronous. Hold the
// first paint until the pages are read back (a handful of milliseconds, well
// inside the splash) so the app never flashes a blank, signed-out state.
// The 3s failsafe means a wedged database still boots an empty notebook
// rather than nothing at all.
let started = false;
const start = () => {
  if (started) return;
  started = true;

  // reducedMotion="user": when the OS asks for less motion, framer keeps
  // opacity fades but drops the springs and slides, everywhere at once.
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </StrictMode>
  );

  // Fade out the boot splash once React has painted, but never before the ink
  // rule has drawn itself once. On fast loads the app was mounting in under
  // 100ms and the splash vanished before it was ever seen.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const boot = document.getElementById('boot');
      if (!boot) return;
      const shownAt = (window as unknown as { __bootShownAt?: number }).__bootShownAt ?? performance.now();
      const elapsed = performance.now() - shownAt;
      const remaining = Math.max(0, 1150 - elapsed);
      setTimeout(() => {
        boot.classList.add('boot-done');
        setTimeout(() => boot.remove(), 450);
      }, remaining);
    });
  });
};

if (useStore.persist.hasHydrated()) start();
else useStore.persist.onFinishHydration(start);
setTimeout(start, 3000);

// Ask the browser to treat our storage as persistent so notes are never
// silently evicted under disk pressure. Best-effort; browsers may decline.
if (navigator.storage?.persist) {
  navigator.storage.persist().catch(() => {});
}

// Offline support + PWA installability. Production only, so dev reloads stay instant.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const firstInstall = !navigator.serviceWorker.controller;
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .then((reg) => {
        if (!firstInstall) return;
        // Tell the user once, the first time offline support becomes real.
        const worker = reg.installing || reg.waiting;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'activated') {
            import('react-hot-toast').then(({ default: toast }) =>
              toast('supermind is saved on this device and works offline now.')
            );
          }
        });
      })
      .catch(() => {
        // Offline support is progressive enhancement — never block the app on it.
      });
  });
}
