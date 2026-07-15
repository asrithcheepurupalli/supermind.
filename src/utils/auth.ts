import { User } from '../types';
import { toast } from 'react-hot-toast';

// OAuth configuration
const OAUTH_CONFIG = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'demo-google-client-id',
    redirectUri: `${window.location.origin}/auth/callback/google`,
    scope: 'openid email profile',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  },
  github: {
    clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || 'demo-github-client-id',
    redirectUri: `${window.location.origin}/auth/callback/github`,
    scope: 'user:email',
    authUrl: 'https://github.com/login/oauth/authorize',
  },
  apple: {
    clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'demo-apple-client-id',
    redirectUri: `${window.location.origin}/auth/callback/apple`,
    scope: 'name email',
    authUrl: 'https://appleid.apple.com/auth/authorize',
  },
};

export class AuthService {
  private static instance: AuthService;
  
  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Generate secure random state for OAuth
  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Store state in sessionStorage for verification
  private storeState(provider: string, state: string): void {
    sessionStorage.setItem(`oauth_state_${provider}`, state);
  }

  // Verify state from callback
  private verifyState(provider: string, state: string): boolean {
    const storedState = sessionStorage.getItem(`oauth_state_${provider}`);
    sessionStorage.removeItem(`oauth_state_${provider}`);
    return storedState === state;
  }

  // Google OAuth
  async signInWithGoogle(): Promise<void> {
    try {
      const state = this.generateState();
      this.storeState('google', state);

      const params = new URLSearchParams({
        client_id: OAUTH_CONFIG.google.clientId,
        redirect_uri: OAUTH_CONFIG.google.redirectUri,
        response_type: 'code',
        scope: OAUTH_CONFIG.google.scope,
        state,
        access_type: 'offline',
        prompt: 'consent',
      });

      const authUrl = `${OAUTH_CONFIG.google.authUrl}?${params.toString()}`;
      
      // For demo purposes, we'll simulate the OAuth flow
      if (OAUTH_CONFIG.google.clientId === 'demo-google-client-id') {
        await this.simulateOAuthSuccess('google');
        return;
      }

      window.location.href = authUrl;
    } catch (error) {
      console.error('Google OAuth error:', error);
      toast.error('Failed to sign in with Google');
    }
  }

  // GitHub OAuth
  async signInWithGitHub(): Promise<void> {
    try {
      const state = this.generateState();
      this.storeState('github', state);

      const params = new URLSearchParams({
        client_id: OAUTH_CONFIG.github.clientId,
        redirect_uri: OAUTH_CONFIG.github.redirectUri,
        scope: OAUTH_CONFIG.github.scope,
        state,
        allow_signup: 'true',
      });

      const authUrl = `${OAUTH_CONFIG.github.authUrl}?${params.toString()}`;
      
      // For demo purposes, we'll simulate the OAuth flow
      if (OAUTH_CONFIG.github.clientId === 'demo-github-client-id') {
        await this.simulateOAuthSuccess('github');
        return;
      }

      window.location.href = authUrl;
    } catch (error) {
      console.error('GitHub OAuth error:', error);
      toast.error('Failed to sign in with GitHub');
    }
  }

  // Apple OAuth
  async signInWithApple(): Promise<void> {
    try {
      const state = this.generateState();
      this.storeState('apple', state);

      const params = new URLSearchParams({
        client_id: OAUTH_CONFIG.apple.clientId,
        redirect_uri: OAUTH_CONFIG.apple.redirectUri,
        response_type: 'code id_token',
        scope: OAUTH_CONFIG.apple.scope,
        response_mode: 'form_post',
        state,
      });

      const authUrl = `${OAUTH_CONFIG.apple.authUrl}?${params.toString()}`;
      
      // For demo purposes, we'll simulate the OAuth flow
      if (OAUTH_CONFIG.apple.clientId === 'demo-apple-client-id') {
        await this.simulateOAuthSuccess('apple');
        return;
      }

      window.location.href = authUrl;
    } catch (error) {
      console.error('Apple OAuth error:', error);
      toast.error('Failed to sign in with Apple');
    }
  }

  // Handle OAuth callback
  async handleOAuthCallback(provider: string, code: string, state: string): Promise<User | null> {
    try {
      // Verify state parameter
      if (!this.verifyState(provider, state)) {
        throw new Error('Invalid state parameter');
      }

      // Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(provider, code);
      
      // Get user info from provider
      const userInfo = await this.getUserInfo(provider, tokens.access_token);
      
      // Create user object
      const user: User = {
        id: `${provider}_${userInfo.id}`,
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.avatar,
        subscription: 'free',
        encryptionEnabled: false,
      };

      return user;
    } catch (error) {
      console.error(`${provider} OAuth callback error:`, error);
      toast.error(`Failed to complete ${provider} authentication`);
      return null;
    }
  }

  // Exchange authorization code for access token
  private async exchangeCodeForTokens(provider: string, code: string): Promise<any> {
    const config = OAUTH_CONFIG[provider as keyof typeof OAUTH_CONFIG];
    
    const tokenEndpoints = {
      google: 'https://oauth2.googleapis.com/token',
      github: 'https://github.com/login/oauth/access_token',
      apple: 'https://appleid.apple.com/auth/token',
    };

    const response = await fetch(tokenEndpoints[provider as keyof typeof tokenEndpoints], {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: import.meta.env[`VITE_${provider.toUpperCase()}_CLIENT_SECRET`] || 'demo-secret',
        code,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Get user information from provider
  private async getUserInfo(provider: string, accessToken: string): Promise<any> {
    const userEndpoints = {
      google: 'https://www.googleapis.com/oauth2/v2/userinfo',
      github: 'https://api.github.com/user',
      apple: 'https://appleid.apple.com/auth/userinfo', // Note: Apple doesn't provide a userinfo endpoint
    };

    if (provider === 'apple') {
      // For Apple, user info is typically provided in the ID token
      // This is a simplified implementation
      return {
        id: 'apple_user_id',
        email: 'user@privaterelay.appleid.com',
        name: 'Apple User',
        avatar: null,
      };
    }

    const response = await fetch(userEndpoints[provider as keyof typeof userEndpoints], {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    const userInfo = await response.json();

    // Normalize user info across providers
    switch (provider) {
      case 'google':
        return {
          id: userInfo.id,
          email: userInfo.email,
          name: userInfo.name,
          avatar: userInfo.picture,
        };
      case 'github':
        return {
          id: userInfo.id.toString(),
          email: userInfo.email,
          name: userInfo.name || userInfo.login,
          avatar: userInfo.avatar_url,
        };
      default:
        return userInfo;
    }
  }

  // Simulate OAuth success for demo purposes
  private async simulateOAuthSuccess(provider: string): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUsers = {
          google: {
            id: `google_${Date.now()}`,
            email: 'user@gmail.com',
            name: 'Google User',
            avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=150',
            subscription: 'free' as const,
            encryptionEnabled: false,
          },
          github: {
            id: `github_${Date.now()}`,
            email: 'user@github.com',
            name: 'GitHub Developer',
            avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?w=150',
            subscription: 'free' as const,
            encryptionEnabled: false,
          },
          apple: {
            id: `apple_${Date.now()}`,
            email: 'user@privaterelay.appleid.com',
            name: 'Apple User',
            avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?w=150',
            subscription: 'free' as const,
            encryptionEnabled: false,
          },
        };

        const user = mockUsers[provider as keyof typeof mockUsers];
        
        // Dispatch custom event to notify the app
        window.dispatchEvent(new CustomEvent('oauth-success', { 
          detail: { user, provider } 
        }));
        
        resolve(user);
      }, 1500); // Simulate network delay
    });
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      // Clear any stored tokens
      sessionStorage.clear();
      
      // Clear all localStorage items related to the app
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('supermind') || key.includes('auth') || key.includes('user'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  }
}

export const authService = AuthService.getInstance();