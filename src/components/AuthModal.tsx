import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff,
  Chrome, 
  Github,
  Apple,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Brain,
  CheckCircle,
  AlertCircle,
  Key,
  Fingerprint,
  Loader2
} from 'lucide-react';
import { authService } from '../utils/auth';
import { toast } from 'react-hot-toast';
import EncryptionSetup from './EncryptionSetup';

interface AuthModalProps {
  isLogin: boolean;
  onToggle: () => void;
  onAuth: (email: string, password: string, name?: string) => void;
}

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Organization',
    description: 'Automatically categorize and tag your content with advanced AI - all processed locally for privacy'
  },
  {
    icon: Zap,
    title: 'Lightning Fast Search',
    description: 'Find anything instantly with our intelligent search engine'
  },
  {
    icon: Shield,
    title: 'End-to-End Encryption',
    description: 'Military-grade encryption ensures your data remains completely private'
  }
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Product Designer',
    avatar: 'SC',
    quote: 'Supermind has completely transformed how I organize my research and inspiration.'
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Software Engineer',
    avatar: 'MR',
    quote: 'The AI tagging is incredibly accurate. It saves me hours every week.'
  },
  {
    name: 'Emily Watson',
    role: 'Content Creator',
    avatar: 'EW',
    quote: 'Finally, a second brain that actually understands what I need.'
  }
];

export default function AuthModal({ isLogin, onToggle, onAuth }: AuthModalProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [currentTestimonial, setCurrentTestimonial] = React.useState(0);
  const [showEncryptionSetup, setShowEncryptionSetup] = React.useState(false);
  const [pendingAuth, setPendingAuth] = React.useState<{email: string, password: string, name?: string} | null>(null);
  const [oauthLoading, setOauthLoading] = React.useState<string | null>(null);

  // Rotate testimonials
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Listen for OAuth success events
  React.useEffect(() => {
    const handleOAuthSuccess = (event: CustomEvent) => {
      const { user, provider } = event.detail;
      setOauthLoading(null);
      onAuth(user.email, 'oauth-password', user.name);
      toast.success(`Welcome ${user.name}! Signed in with ${provider} 🎉`);
    };

    window.addEventListener('oauth-success', handleOAuthSuccess as EventListener);
    return () => window.removeEventListener('oauth-success', handleOAuthSuccess as EventListener);
  }, [onAuth]);
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (!isLogin && !name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    if (isLogin) {
      // For login, proceed directly
      await new Promise(resolve => setTimeout(resolve, 1500));
      onAuth(email, password, name);
      setIsLoading(false);
    } else {
      // For signup, show encryption setup
      setPendingAuth({ email, password, name });
      setShowEncryptionSetup(true);
      setIsLoading(false);
    }
  };

  const handleSocialAuth = async (provider: string) => {
    try {
      setOauthLoading(provider);
      
      switch (provider) {
        case 'google':
          await authService.signInWithGoogle();
          break;
        case 'github':
          await authService.signInWithGitHub();
          break;
        case 'apple':
          await authService.signInWithApple();
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`${provider} OAuth error:`, error);
      setOauthLoading(null);
      toast.error(`Failed to sign in with ${provider}`);
    }
  };

  const handleEncryptionComplete = (encryptionPassword: string) => {
    if (pendingAuth) {
      onAuth(pendingAuth.email, pendingAuth.password, pendingAuth.name);
      setShowEncryptionSetup(false);
      setPendingAuth(null);
    }
  };

  if (showEncryptionSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <EncryptionSetup onComplete={handleEncryptionComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex overflow-hidden">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(59,130,246,0.1),transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo & Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">supermind.</h1>
                <p className="text-emerald-400 text-sm">Your AI-Powered Second Brain</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Capture everything.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
                  Securely remember anything.
                </span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Transform how you save, organize, and rediscover information with AI that understands your content while keeping it completely private with end-to-end encryption.
              </p>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <IconComponent className="text-emerald-400" size={18} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6"
              >
                <p className="text-gray-300 italic mb-4">"{testimonials[currentTestimonial].quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {testimonials[currentTestimonial].avatar}
                    </span>
                  </div>
                  <div>
                    <div className="text-white font-medium">{testimonials[currentTestimonial].name}</div>
                    <div className="text-gray-400 text-sm">{testimonials[currentTestimonial].role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Testimonial indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-emerald-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md my-8 lg:my-0"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Supermind</h1>
              <p className="text-emerald-400 text-sm">Your AI-Powered Second Brain</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl lg:text-3xl font-bold text-white mb-3"
            >
              {isLogin ? 'Welcome back' : 'Create your account'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-gray-400 text-sm lg:text-base"
            >
              {isLogin 
                ? 'Sign in to access your second brain' 
                : 'Join thousands of users organizing their digital life with complete privacy'
              }
            </motion.p>
            
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center justify-center gap-2 mt-3 text-emerald-400 text-xs lg:text-sm"
              >
                <Shield size={16} />
                <span>End-to-end encrypted by default</span>
              </motion.div>
            )}
          </div>

          {/* Social Auth Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-3 mb-6"
          >
            <button
              onClick={() => handleSocialAuth('google')}
              disabled={isLoading || oauthLoading !== null}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 text-gray-900 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm lg:text-base shadow-lg hover:shadow-xl"
            >
              {oauthLoading === 'google' ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Chrome size={20} />
              )}
              {oauthLoading === 'google' ? 'Connecting...' : 'Continue with Google'}
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleSocialAuth('github')}
                disabled={isLoading || oauthLoading !== null}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-medium transition-all duration-200 border border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm lg:text-base shadow-lg hover:shadow-xl"
              >
                {oauthLoading === 'github' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Github size={18} />
                )}
                {oauthLoading === 'github' ? 'Connecting...' : 'GitHub'}
              </button>
              <button
                onClick={() => handleSocialAuth('apple')}
                disabled={isLoading || oauthLoading !== null}
                className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-xl font-medium transition-all duration-200 border border-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm lg:text-base shadow-lg hover:shadow-xl"
              >
                {oauthLoading === 'apple' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Apple size={18} />
                )}
                {oauthLoading === 'apple' ? 'Connecting...' : 'Apple'}
              </button>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-gray-700"></div>
            <span className="px-4 text-gray-400 text-xs lg:text-sm">or continue with email</span>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {!isLogin && (
              <div>
                <label className="block text-white font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                    }}
                    placeholder="Enter your full name"
                    className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.name 
                        ? 'border-red-500/50 focus:ring-red-500/50' 
                        : 'border-gray-700/50 focus:ring-emerald-500/50 focus:border-emerald-500/50'
                    } text-sm lg:text-base`}
                  />
                  {errors.name && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <AlertCircle className="text-red-400" size={18} />
                    </div>
                  )}
                </div>
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-1"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>
            )}

            <div>
              <label className="block text-white font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-500/50 focus:ring-red-500/50' 
                      : 'border-gray-700/50 focus:ring-emerald-500/50 focus:border-emerald-500/50'
                  } text-sm lg:text-base`}
                />
                {errors.email ? (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <AlertCircle className="text-red-400" size={18} />
                  </div>
                ) : email && /\S+@\S+\.\S+/.test(email) && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <CheckCircle className="text-emerald-400" size={18} />
                  </div>
                )}
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            <div>
              <label className="block text-white font-medium mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-500/50 focus:ring-red-500/50' 
                      : 'border-gray-700/50 focus:ring-emerald-500/50 focus:border-emerald-500/50'
                  } text-sm lg:text-base`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm mt-1"
                >
                  {errors.password}
                </motion.p>
              )}
              {!isLogin && !errors.password && password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                          password.length > i * 2 ? 'bg-emerald-400' : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    Password strength: {password.length < 4 ? 'Weak' : password.length < 8 ? 'Good' : 'Strong'}
                  </p>
                </div>
              )}
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-emerald-500 bg-gray-800 border-gray-600 rounded focus:ring-emerald-500 focus:ring-2 touch-manipulation"
                  />
                  <span className="text-gray-300 text-sm">Remember me</span>
                </label>
                <button
                  type="button"
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || oauthLoading !== null}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-emerald-500/25 touch-manipulation text-sm lg:text-base"
            >
              {isLoading || oauthLoading !== null ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </motion.form>

          {/* Terms & Privacy */}
          {!isLogin && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-center text-xs lg:text-sm text-gray-400 mt-4"
            >
              By creating an account, you agree to our{' '}
              <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Terms of Service
              </button>{' '}
              and{' '}
              <button className="text-emerald-400 hover:text-emerald-300 transition-colors">
                Privacy Policy
              </button>. Your data will be encrypted end-to-end for maximum privacy.
            </motion.p>
          )}

          {/* Toggle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center mt-6 text-sm lg:text-base"
          >
            <span className="text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={onToggle}
              disabled={oauthLoading !== null}
              className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors touch-manipulation disabled:opacity-50"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </motion.div>
          
          {/* OAuth Loading Indicator */}
          {oauthLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
                <Loader2 size={16} className="animate-spin" />
                <span>Connecting to {oauthLoading}...</span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}