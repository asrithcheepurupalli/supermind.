import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-center"
      containerStyle={{ top: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--paper-raised)',
          color: 'var(--ink)',
          border: '1.5px solid var(--ink)',
          borderRadius: '2px',
          boxShadow: '4px 4px 0 0 var(--ink)',
          fontSize: '14px',
          fontWeight: '500',
          padding: '12px 16px',
        },
        success: {
          iconTheme: {
            primary: 'var(--accent)',
            secondary: 'var(--paper)',
          },
        },
        error: {
          iconTheme: {
            primary: 'var(--accent)',
            secondary: 'var(--paper)',
          },
        },
      }}
    />
  );
}