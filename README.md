# supermind.

**Your local-first second brain.** Capture notes, links, and files — supermind organizes them automatically and makes them instantly searchable, entirely on your device.

No account. No server. No tracking. Your data never leaves your browser.

## Features

- 🗄️ **Local-First Storage** — everything is persisted to your browser's storage on your device. Nothing is uploaded anywhere, ever.
- 🔐 **Optional Encryption at Rest** — protect your content with AES-256-GCM (Web Crypto API). The key is derived from your passphrase with PBKDF2 (250k iterations) and only ever lives in memory. Includes auto-lock after inactivity.
- 🧠 **Automatic Organization** — on-device heuristics tag, summarize, and categorize content as you save it, and detect deadlines/follow-ups to create reminders.
- 🔍 **Instant Fuzzy Search** — Fuse.js-powered search across content, summaries, and tags, combined with category / type / tag / date / favorite filters. `Cmd/Ctrl+K` from anywhere.
- 📥 **Capture Anything** — text notes, web links, images, audio, video, and PDFs via drag & drop, file picker, or clipboard paste. Small files are embedded so they survive reloads.
- 📊 **Real Analytics & Insights** — activity charts, top categories/tags, tag co-occurrence connections, related-content suggestions, and review prompts — all computed from your own data, locally.
- 💾 **Backup & Restore** — one-click JSON export and import (Settings → Data & Storage).
- ⌨️ **Keyboard Shortcuts** — `Cmd/Ctrl+N` add content, `Cmd/Ctrl+K` search, `Cmd/Ctrl+,` settings, `Cmd/Ctrl+1…5` switch categories.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Type-check
npm run typecheck

# Lint
npm run lint

# Build for production
npm run build
```

Open the app, enter a name (that's the whole "sign-up"), optionally set an encryption passphrase, and start capturing.

## How It Works

- **State**: [Zustand](https://github.com/pmndrs/zustand) with `persist` middleware writing to `localStorage`.
- **Encryption**: when enabled, the sensitive fields of every item (text, summary, tags, file data) are encrypted with AES-256-GCM before being persisted. Plaintext exists only in memory while the workspace is unlocked; locking (manually or via auto-lock) clears the key.
- **"AI" features**: honest, lightweight heuristics — keyword-based tagging, extractive sentence-scoring summaries, category scoring, and reminder keyword detection. Everything runs synchronously on-device; no model, no API calls.
- **Search**: Fuse.js fuzzy matching over content, summaries, tags, and sources.

## Honest Limitations

- **No sync** — local-first means exactly that. Use export/import to move data between browsers or devices.
- **Storage bounds** — `localStorage` holds roughly 5MB, so files over ~1.5MB keep their name and metadata rather than the full file contents.
- **Lost passphrase = lost data** — real encryption has no reset button. Export backups.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **State**: Zustand (persisted)
- **Search**: Fuse.js
- **Encryption**: Web Crypto API (AES-256-GCM, PBKDF2)
- **Build**: Vite

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes (`npm run typecheck && npm run lint && npm run build` should pass)
4. Submit a pull request

## License

MIT
