// Link previews. YouTube and Vimeo answer directly from the browser via
// their CORS-open oEmbed endpoints, thumbnails included, so those never
// touch our unfurler. Everything else goes through /api/unfurl, a stateless
// edge function that reads the page's own og: card and stores nothing.
// Offline or on a dev preview the fetch simply fails and the entry keeps
// its slug-derived title.

import type { LinkPreview } from '../types';

const PREVIEW_TIMEOUT = 8_000;

export const youtubeId = (url: string): string | null => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, '');
    if (host === 'youtu.be') return u.pathname.slice(1).split('/')[0] || null;
    if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') return u.searchParams.get('v');
      const m = u.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{6,})/);
      return m ? m[1] : null;
    }
  } catch { /* not a url */ }
  return null;
};

const vimeoId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname.replace(/^www\./, '') !== 'vimeo.com') return null;
    const m = u.pathname.match(/^\/(\d{6,})/);
    return m ? m[1] : null;
  } catch { /* not a url */ }
  return null;
};

const fetchJson = async (url: string): Promise<Record<string, unknown> | null> => {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(PREVIEW_TIMEOUT) });
    if (!res.ok || !(res.headers.get('content-type') || '').includes('json')) return null;
    return await res.json();
  } catch {
    return null;
  }
};

const str = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;

const clean = (p: LinkPreview): LinkPreview | null => {
  const out: LinkPreview = {};
  if (p.title) out.title = p.title.slice(0, 300);
  if (p.description) out.description = p.description.slice(0, 500);
  if (p.image && /^https:\/\//.test(p.image)) out.image = p.image;
  if (p.site) out.site = p.site.slice(0, 100);
  if (p.video && /^https:\/\//.test(p.video)) out.video = p.video;
  return out.title || out.image ? out : null;
};

export const fetchLinkPreview = async (url: string): Promise<LinkPreview | null> => {
  const yt = youtubeId(url);
  if (yt) {
    const data = await fetchJson(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`
    );
    return clean({
      title: str(data?.title),
      site: str(data?.author_name) ? `YouTube · ${str(data?.author_name)}` : 'YouTube',
      image: `https://img.youtube.com/vi/${yt}/hqdefault.jpg`,
      video: `https://www.youtube-nocookie.com/embed/${yt}`,
    });
  }

  const vm = vimeoId(url);
  if (vm) {
    const data = await fetchJson(
      `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`
    );
    if (!data) return null;
    return clean({
      title: str(data.title),
      site: str(data.author_name) ? `Vimeo · ${str(data.author_name)}` : 'Vimeo',
      image: str(data.thumbnail_url),
      video: `https://player.vimeo.com/video/${vm}`,
    });
  }

  const data = await fetchJson(`/api/unfurl?url=${encodeURIComponent(url)}`);
  if (!data) return null;
  return clean({
    title: str(data.title),
    description: str(data.description),
    image: str(data.image),
    site: str(data.site),
  });
};
