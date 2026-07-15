import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(17, 24, 39, 0.98)',
          color: '#fff',
          border: '1px solid rgba(16, 185, 129, 0.2)',
          borderRadius: '16px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(16, 185, 129, 0.1)',
          fontSize: '14px',
          fontWeight: '500',
          padding: '16px 20px',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'rgba(16, 185, 129, 0.1)',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.1)',
          },
        },
      }}
    />
  );
}