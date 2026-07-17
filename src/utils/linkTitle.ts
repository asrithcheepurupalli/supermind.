// A readable title for a bare URL, derived without any network request.
// CORS blocks fetching page titles from the browser, and phoning a metadata
// service would break the no-servers promise. The slug usually knows the
// title anyway: /how-to-think-clearly reads fine once the dashes go.

const looksLikeId = (s: string) => {
  const letters = s.replace(/[^a-z]/gi, '');
  return letters.length < 4 || /^[0-9a-f-]{8,}$/i.test(s);
};

export const hostForUrl = (raw: string): string => {
  try {
    return new URL(raw).hostname.replace(/^www\./, '');
  } catch {
    return raw;
  }
};

export const titleForUrl = (raw: string): string => {
  try {
    const u = new URL(raw);
    const segments = u.pathname.split('/').filter(Boolean).map(s => {
      try { return decodeURIComponent(s); } catch { return s; }
    });

    // Walk from the end past ids, indexes, and file extensions to the last
    // segment that reads like words.
    for (let i = segments.length - 1; i >= 0; i--) {
      const cleaned = segments[i].replace(/\.(html?|php|aspx?|htm)$/i, '');
      if (looksLikeId(cleaned)) continue;
      const words = cleaned.replace(/[-_+]+/g, ' ').replace(/\s+/g, ' ').trim();
      if (words.length >= 4 && /[a-z]/i.test(words)) {
        return words.charAt(0).toUpperCase() + words.slice(1);
      }
    }
    return hostForUrl(raw);
  } catch {
    return raw;
  }
};
