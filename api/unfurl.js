// Stateless link unfurler. When someone files a link, the app asks this
// function for the page's own card: og:title, og:image, and the blurb the
// site already publishes for exactly this purpose. Nothing is stored, nothing
// is logged, and only the link being saved ever reaches it — never the
// notebook. Responses are cached at the edge so popular pages unfurl once.

export const config = { runtime: 'edge' };

const MAX_HTML = 300_000; // metadata lives in <head>; no need to read the whole page
const FETCH_TIMEOUT = 6_000;

// Refuse anything that could point the fetch at ourselves or a private network.
const PRIVATE_HOST =
  /^(localhost$|.*\.local$|.*\.internal$|0\.|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[::1?\]$|\[f[cd])/i;

const decodeEntities = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ');

// Attribute order varies in the wild: find the tag by its name first, then
// pull content out of it, so both orderings work.
const metaContent = (html, name) => {
  const tag = html.match(
    new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*>`, 'i')
  )?.[0];
  const content = tag?.match(/content\s*=\s*["']([^"']+)["']/i)?.[1];
  return content ? decodeEntities(content).trim() : undefined;
};

const firstOf = (html, names) => {
  for (const name of names) {
    const v = metaContent(html, name);
    if (v) return v;
  }
  return undefined;
};

const json = (body, status, cache) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': cache || 'no-store',
    },
  });

export default async function handler(req) {
  const target = new URL(req.url).searchParams.get('url') || '';

  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return json({ error: 'bad url' }, 400);
  }
  if (!/^https?:$/.test(parsed.protocol) || PRIVATE_HOST.test(parsed.hostname)) {
    return json({ error: 'refused' }, 400);
  }

  let res;
  try {
    res = await fetch(parsed.href, {
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; supermind-unfurl/1.0; +https://supermind.ink)',
        accept: 'text/html,application/xhtml+xml',
        'accept-language': 'en',
      },
    });
  } catch {
    return json({ error: 'unreachable' }, 502);
  }

  if (!res.ok || !(res.headers.get('content-type') || '').includes('text/html')) {
    res.body?.cancel?.();
    return json({ error: 'not a page' }, 415);
  }

  let html = '';
  try {
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (html.length < MAX_HTML) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
    }
    reader.cancel().catch(() => {});
  } catch {
    return json({ error: 'unreadable' }, 502);
  }

  const title =
    firstOf(html, ['og:title', 'twitter:title']) ||
    (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] &&
      decodeEntities(html.match(/<title[^>]*>([^<]+)<\/title>/i)[1]).trim());
  const description = firstOf(html, ['og:description', 'twitter:description', 'description']);
  const site = firstOf(html, ['og:site_name']);

  let image = firstOf(html, ['og:image', 'og:image:url', 'twitter:image']);
  if (image) {
    try {
      const resolved = new URL(image, res.url);
      image = /^https?:$/.test(resolved.protocol) ? resolved.href : undefined;
    } catch {
      image = undefined;
    }
  }

  return json(
    {
      title: title?.slice(0, 300),
      description: description?.slice(0, 500),
      image,
      site: site?.slice(0, 100),
    },
    200,
    'public, s-maxage=86400, stale-while-revalidate=604800'
  );
}
