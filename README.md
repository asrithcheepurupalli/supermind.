# supermind

Live at [supermind.ink](https://supermind.ink).

A second brain that lives on your device. You write notes, paste links, and drop files into it. It tags them, files them, and finds them again when you search. There is no account, no database, and no tracking. The one thing that can leave the device is a link you save, sent to a stateless unfurler so the entry gets the page's title and image; it stores nothing, and you can turn it off.

## Why local-first

Most note apps are a database you rent. This one is a notebook you own. Everything sits in your browser's storage, so it works offline, loads instantly, and can't leak what it never sends. The trade is honest: there is no sync, and if you clear your browser data without exporting first, it's gone.

## What it does

**Capture.** This is the whole product, so it works from everywhere. Press Ctrl+N (or Cmd+N) and start typing. Paste text, a link, or an image anywhere in the app, outside a text field, and it files itself on the spot. Install it on a phone and it shows up in the share sheet, so anything you can share becomes a note. You can even write your first thought on the landing page before you have a profile; it will be waiting inside, already filed. On a desk, drag the "save on supermind" bookmarklet from Settings to your bookmarks bar and the page you are reading is one click from filed; `/?add=` works as a plain capture URL for anything else. A share that arrives while the notebook is sealed waits politely and files itself the moment you unlock. Attachments up to 100MB each live in their own IndexedDB drawer as native blobs, so filing a note never rewrites your media; bigger ones keep their name and metadata.

**Organize.** As you save, the app tags each entry with the strongest words you actually wrote, sorts it into a category, and writes a short summary for longer ones. Dates in plain language become real reminders: "call mom on tuesday at 5pm", "rent due aug 3", "in 3 days" all resolve to the right moment. All of this is heuristics running in your browser. No model, no API calls, and the code doesn't pretend otherwise.

**Links look like pages, not URLs.** A saved link earns the page's own card: title, image, and blurb, tipped into the book like a clipping. YouTube and Vimeo cards play right there in the page. Cards are fetched through a stateless edge function that sees only the link, stores nothing, and answers from cache; video titles come straight from oEmbed in your browser. The card travels inside the encrypted payload like everything else, and switching off "Show previews" keeps saves fully offline.

**Find.** Ctrl+K opens a command palette with fuzzy search across everything: content, summaries, tags, sources. Filters stack on top: category, type, tag, date, starred.

**See the shape of it.** The graph view draws your tags as a constellation, connected when they appear together. The almanac view is a printed page of your own stats: capture activity over thirty days, most-used tags, patterns like when you write most.

**Write lists that work.** Start a line with `- [ ]` and it renders as a checkbox you can tick right in the book. Bullets, **bold**, *italic*, and `code` notation render too; the stored text stays plain markdown.

**Be reminded.** Reminders ring a system notification when they come due while the notebook is open, and any dated entry can be handed to your calendar as an .ics event, so your phone does the reminding when the notebook is closed.

**Lock it.** Optional encryption at rest with AES-256-GCM. The key comes from your passphrase through PBKDF2 at 250,000 iterations, lives only in memory, and is cleared when you lock the app or walk away with auto-lock on. Lose the passphrase and the data stays locked. Real encryption has no reset button, so export backups.

**Take it out.** One click exports everything as JSON or Markdown. "Pass to another device" hands the whole notebook to AirDrop or your share sheet, and the receiving device can restore it during onboarding with one tap. Import merges and skips duplicates. Print any page and the interface disappears, leaving just the content on paper.

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

React 18 with TypeScript, bundled by Vite. State is a single Zustand store persisted to IndexedDB, with a silent migration for notebooks that began life in localStorage. Search is Fuse.js. Encryption uses the Web Crypto API directly. The graph is a custom force simulation on a canvas, no charting library. Styling is Tailwind plus a small set of design tokens: warm paper, ink, one vermilion accent, a serif for display type and a mono for labels.

When encryption is on, the sensitive fields of every item and the raw bytes of every attachment are encrypted before anything touches storage. Plaintext exists only in memory while the app is unlocked. Exports are intentionally plaintext, so treat a backup like the open notebook.

## Limits worth knowing

Storage is IndexedDB, so a notebook can grow to gigabytes, and the browser is asked to treat it as persistent. Attachments up to 100MB each live in a separate file drawer, encrypted when the notebook is sealed; anything bigger is recorded by name only. Exports inline the files back in, so a backup is still one portable document. There is no background sync; moving between devices is a deliberate hand-off, one file, never a server. And the organizer is deterministic heuristics reading your own words, which is fast and private, but it is not a language model.

## Contributing

Fork, branch, make the checks pass (`npm run typecheck && npm run lint && npm run build`), open a pull request.

## License

MIT

A [made.](https://made-by-ac.com) product.
