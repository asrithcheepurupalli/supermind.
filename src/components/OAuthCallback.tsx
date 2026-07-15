import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { authService } from '../utils/auth';
import { useStore } from '../store/useStore';

interface OAuthCallbackProps {
  provider: string;
}

export default function OAuthCallback({ provider }: OAuthCallbackProps) {
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('Processing authentication...');
  const { setUser } = useStore();

  React.useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        setMessage(`Completing ${provider} authentication...`);
        
        const user = await authService.handleOAuthCallback(provider, code, state);
        
        if (user) {
          setUser(user);
          setStatus('success');
          setMessage(`Successfully signed in with ${provider}!`);
          
          // Redirect to main app after a short delay
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else {
          throw new Error('Failed to authenticate user');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Authentication failed');
        
        // Redirect back to login after a delay
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleCallback();
  }, [provider, setUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-8 max-w-md w-full text-center"
      >
        <div className="mb-6">
          {status === 'loading' && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <Loader2 className="w-full h-full text-emerald-400" />
            </motion.div>
          )}
          
          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <CheckCircle className="w-full h-full text-emerald-400" />
            </motion.div>
          )}
          
          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <XCircle className="w-full h-full text-red-400" />
            </motion.div>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          {status === 'loading' && 'Authenticating...'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>
        
        <p className="text-gray-300 mb-6">{message}</p>
        
        {status === 'loading' && (
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <span>Please wait while we complete your</span>
            <span className="capitalize font-medium text-emerald-400">{provider}</span>
            <span>authentication</span>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-gray-400 text-sm">
            Redirecting to your dashboard...
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-gray-400 text-sm">
            Redirecting back to login...
          </div>
        )}
      </motion.div>
    </div>
  );
}