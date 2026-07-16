import { SavedContent } from '../types';

// A note shared as a link carries its own contents in the URL fragment.
// Fragments are never sent to any server, so sharing keeps the no-server
// promise: the note lives in the link, and only the person holding the
// link can read it.
export interface SharedNote {
  t: string; // text
  d?: string; // ISO date
  g?: string[]; // tags
  k?: SavedContent['contentType'];
}

const toBase64Url = (s: string): string => {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromBase64Url = (s: string): string => {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

export const buildShareUrl = (item: SavedContent): string => {
  const payload: SharedNote = {
    t: item.contentText.slice(0, 4000),
    d: item.timestamp.toISOString(),
    g: item.tags.slice(0, 6),
    k: item.contentType,
  };
  const base = `${window.location.origin}${window.location.pathname}`;
  return `${base}#n=${toBase64Url(JSON.stringify(payload))}`;
};

export const parseSharedNote = (hash: string): SharedNote | null => {
  if (!hash.startsWith('#n=')) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(hash.slice(3)));
    if (typeof parsed?.t !== 'string' || !parsed.t.trim()) return null;
    return {
      t: parsed.t.slice(0, 4000),
      d: typeof parsed.d === 'string' ? parsed.d : undefined,
      g: Array.isArray(parsed.g) ? parsed.g.filter((x: unknown) => typeof x === 'string').slice(0, 6) : [],
      k: parsed.k,
    };
  } catch {
    return null;
  }
};

// Renders a note as a Paper Mind card image (1200x630), fully client-side.
export const renderNoteImage = async (item: SavedContent): Promise<Blob | null> => {
  await document.fonts.ready;
  const W = 1200;
  const H = 630;
  const canvas = document.createElement('canvas');
  canvas.width = W * 2;
  canvas.height = H * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(2, 2);

  // paper + dot grid
  ctx.fillStyle = '#faf6ee';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(23,21,15,0.13)';
  for (let x = 20; x < W; x += 26) {
    for (let y = 20; y < H; y += 26) {
      ctx.fillRect(x, y, 1.6, 1.6);
    }
  }

  // the card
  const cx = 80, cy = 80, cw = W - 160, ch = H - 160;
  ctx.fillStyle = 'rgba(23,21,15,0.9)';
  ctx.fillRect(cx + 8, cy + 8, cw, ch); // offset shadow
  ctx.fillStyle = '#fffdf7';
  ctx.fillRect(cx, cy, cw, ch);
  ctx.strokeStyle = '#17150f';
  ctx.lineWidth = 3;
  ctx.strokeRect(cx, cy, cw, ch);

  // washi tape
  ctx.save();
  ctx.translate(cx + cw / 2, cy);
  ctx.rotate(-0.04);
  ctx.fillStyle = 'rgba(240,78,35,0.18)';
  ctx.fillRect(-60, -14, 120, 28);
  ctx.restore();

  // date kicker
  const date = item.timestamp.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  ctx.fillStyle = '#f04e23';
  ctx.font = '600 17px "JetBrains Mono", monospace';
  ctx.fillText(`[ A NOTE · ${date.toUpperCase()} ]`, cx + 56, cy + 78);

  // note text, wrapped serif
  ctx.fillStyle = '#17150f';
  ctx.font = '44px "Instrument Serif", Georgia, serif';
  const words = item.contentText.split(/\s+/);
  const maxWidth = cw - 112;
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length === 5) break;
    } else {
      line = test;
    }
  }
  if (lines.length < 6 && line) lines.push(line);
  if (words.join(' ').length > lines.join(' ').length) {
    lines[lines.length - 1] = lines[lines.length - 1].replace(/\s+\S*$/, '') + ' …';
  }
  lines.forEach((l, i) => ctx.fillText(l, cx + 56, cy + 150 + i * 58));

  // tags
  if (item.tags.length) {
    ctx.fillStyle = '#f04e23';
    ctx.font = '600 16px "JetBrains Mono", monospace';
    ctx.fillText(item.tags.slice(0, 5).map(t => `#${t.toUpperCase()}`).join('   '), cx + 56, cy + ch - 60);
  }

  // colophon
  ctx.fillStyle = 'rgba(23,21,15,0.45)';
  ctx.font = '600 15px "JetBrains Mono", monospace';
  ctx.fillText('SUPERMIND.INK', cx + cw - 190, cy + ch - 60);

  // the full stop mark
  ctx.fillStyle = '#f04e23';
  ctx.beginPath();
  ctx.arc(cx + cw - 210, cy + ch - 66, 7, 0, Math.PI * 2);
  ctx.fill();

  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
};
