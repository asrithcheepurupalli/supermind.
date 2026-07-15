import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource/instrument-serif';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Fade out the boot splash once React has painted its first frame.
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const boot = document.getElementById('boot');
    if (boot) {
      boot.classList.add('boot-done');
      setTimeout(() => boot.remove(), 400);
    }
  });
});

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
