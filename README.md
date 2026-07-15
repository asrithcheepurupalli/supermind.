# supermind. - Your AI-Powered Second Brain

A revolutionary knowledge management application with end-to-end encryption and AI-powered organization.

## Features

- 🧠 **AI-Powered Organization**: Automatic categorization and tagging
- 🔒 **End-to-End Encryption**: Military-grade security with zero-knowledge architecture
- 🔍 **Intelligent Search**: Natural language search with semantic understanding
- 📱 **Cross-Platform**: Works on all devices with real-time sync
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations
- 🔐 **OAuth Authentication**: Sign in with Google, GitHub, or Apple

## OAuth Setup

### Google OAuth Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Add your domain to authorized origins:
   - `http://localhost:5173` (for development)
   - `https://yourdomain.com` (for production)
6. Add redirect URIs:
   - `http://localhost:5173/auth/callback/google`
   - `https://yourdomain.com/auth/callback/google`
7. Copy the Client ID and Client Secret to your `.env` file

### GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the application details:
   - Application name: "supermind."
   - Homepage URL: `https://yourdomain.com`
   - Authorization callback URL: `https://yourdomain.com/auth/callback/github`
4. Copy the Client ID and Client Secret to your `.env` file

### Apple OAuth Setup

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Sign in with your Apple Developer account
3. Go to "Certificates, Identifiers & Profiles"
4. Create a new App ID with Sign In with Apple capability
5. Create a Service ID for web authentication
6. Configure the redirect URLs
7. Copy the Client ID and Client Secret to your `.env` file

## Environment Variables

Copy `.env.example` to `.env` and fill in your OAuth credentials:

```bash
cp .env.example .env
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Security Features

- **Zero-Knowledge Architecture**: Your data is encrypted on your device before transmission
- **AES-256 Encryption**: Military-grade encryption for all sensitive data
- **Biometric Authentication**: Support for fingerprint and face recognition
- **Auto-lock**: Automatic session timeout for security
- **Secure OAuth**: Industry-standard OAuth 2.0 implementation

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **State Management**: Zustand with persistence
- **Authentication**: OAuth 2.0 (Google, GitHub, Apple)
- **Encryption**: Web Crypto API with AES-256-GCM
- **Search**: Fuse.js for fuzzy search
- **Build Tool**: Vite
- **Deployment**: Netlify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@supermind.app or join our Discord community.