# supermind

A second brain that lives on your device. You write notes, paste links, and drop files into it. It tags them, files them, and finds them again when you search. There is no account, no server, and no tracking. If you open the network tab, nothing is talking to anyone.

## Why local-first

Most note apps are a database you rent. This one is a notebook you own. Everything sits in your browser's storage, so it works offline, loads instantly, and can't leak what it never sends. The trade is honest: there is no sync, and if you clear your browser data without exporting first, it's gone.

## What it does

**Capture.** Press Ctrl+N (or Cmd+N) anywhere and start typing. Paste a link, drop in an image, a PDF, an audio file. Small files are embedded whole so they survive reloads; big ones keep their name and metadata.

**Organize.** As you save, the app tags and categorizes each entry and writes a short summary for longer ones. If a note mentions a deadline or a follow-up, it becomes a reminder. All of this is plain heuristics running in your browser. No model, no API calls, and the code doesn't pretend otherwise.

**Find.** Ctrl+K opens a command palette with fuzzy search across everything: content, summaries, tags, sources. Filters stack on top: category, type, tag, date, starred.

**See the shape of it.** The graph view draws your tags as a constellation, connected when they appear together. The almanac view is a printed page of your own stats: capture activity over thirty days, most-used tags, patterns like when you write most.

**Lock it.** Optional encryption at rest with AES-256-GCM. The key comes from your passphrase through PBKDF2 at 250,000 iterations, lives only in memory, and is cleared when you lock the app or walk away with auto-lock on. Lose the passphrase and the data stays locked. Real encryption has no reset button, so export backups.

**Take it out.** One click exports everything as JSON. Import merges a backup back in and skips duplicates. Print any page and the interface disappears, leaving just the content on paper.

## Running it

```bash
npm install
npm run dev
```

For a production build:

```bash
npm run build
npm run preview
```

`npm run typecheck` and `npm run lint` should both pass before you commit.

Open the app, type a name, and you're in. That is the entire signup. Set an encryption passphrase during onboarding or later in Settings, or never.

## Keyboard shortcuts

Press `?` in the app for the full list. The short version:

| Keys | Action |
| --- | --- |
| Ctrl/Cmd+K | Command palette |
| Ctrl/Cmd+N | New entry |
| Ctrl/Cmd+, | Settings |
| H, T, G, A | Switch views (home, book, graph, almanac) |
| Ctrl/Cmd+1 to 5 | Jump between categories |

## How it's built

React 18 with TypeScript, bundled by Vite. State is a single Zustand store persisted to localStorage. Search is Fuse.js. Encryption uses the Web Crypto API directly. The graph is a custom force simulation on a canvas, no charting library. Styling is Tailwind plus a small set of design tokens: warm paper, ink, one vermilion accent, a serif for display type and a mono for labels.

When encryption is on, the sensitive fields of every item are encrypted before anything touches storage. Plaintext exists only in memory while the app is unlocked.

## Limits worth knowing

localStorage holds around 5MB, so this is for notes and small files, not a media library. Files over 1.5MB are recorded by name only. There is no multi-device sync; export and import is the way to move data. And the automatic tagging is keyword heuristics, which are fast and private but not clever.

## Contributing

Fork, branch, make the checks pass (`npm run typecheck && npm run lint && npm run build`), open a pull request.

## License

MIT
