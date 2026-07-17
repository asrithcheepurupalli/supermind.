import React from 'react';
import { SavedContent } from '../types';
import { loadFileUrl } from '../utils/fileVault';

// Resolve an entry's attachment to something the page can render: the
// legacy embedded data URL if it still has one, otherwise its blob in the
// file drawer via a cached object URL.
export function useFileUrl(item: SavedContent): string | undefined {
  const [url, setUrl] = React.useState<string | undefined>(item.fileUrl);
  React.useEffect(() => {
    let alive = true;
    if (item.fileUrl) {
      setUrl(item.fileUrl);
      return;
    }
    if (!item.fileKey) {
      setUrl(undefined);
      return;
    }
    loadFileUrl(item.fileKey).then(u => { if (alive) setUrl(u ?? undefined); });
    return () => { alive = false; };
  }, [item.fileUrl, item.fileKey]);
  return url;
}
