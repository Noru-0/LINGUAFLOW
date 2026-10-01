import axios from 'axios';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';

export interface ImageResult {
  imageUrl: string;
  thumbnailUrl: string;
  photographer: string;
  sourceUrl: string;
}

export async function fetchContextualImage(
  term: string,
  contextHint?: string
): Promise<ImageResult | null> {
  const cleanTerm = term.trim().toLowerCase();
  if (!cleanTerm) return null;

  // 1. Try Unsplash if access key is available
  if (UNSPLASH_ACCESS_KEY) {
    let searchQuery = cleanTerm;
    if (contextHint) {
      const keywords = contextHint
        .replace(/[^\w\s]/gi, '')
        .split(' ')
        .filter((w) => w.length > 4 && !['something', 'someone', 'action', 'state'].includes(w.toLowerCase()));
      
      if (keywords.length > 0) {
        searchQuery = `${cleanTerm} ${keywords[0]}`;
      }
    }

    try {
      const res = await axios.get('https://api.unsplash.com/search/photos', {
        params: {
          query: searchQuery,
          page: 1,
          per_page: 1,
          orientation: 'landscape',
          content_filter: 'high',
        },
        headers: {
          Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        },
        timeout: 5000,
      });

      const photo = res.data.results?.[0];
      if (photo) {
        return {
          imageUrl: photo.urls.small,
          thumbnailUrl: photo.urls.thumb,
          photographer: photo.user.name,
          sourceUrl: photo.links.html,
        };
      } else if (searchQuery !== cleanTerm) {
        // Retry with just cleanTerm
        const retryRes = await axios.get('https://api.unsplash.com/search/photos', {
          params: { query: cleanTerm, page: 1, per_page: 1, orientation: 'landscape' },
          headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
          timeout: 4000,
        });
        const retryPhoto = retryRes.data.results?.[0];
        if (retryPhoto) {
          return {
            imageUrl: retryPhoto.urls.small,
            thumbnailUrl: retryPhoto.urls.thumb,
            photographer: retryPhoto.user.name,
            sourceUrl: retryPhoto.links.html,
          };
        }
      }
    } catch (error: any) {
      console.warn('[Unsplash Service Error]:', error.message);
    }
  }

  // 2. Try Openverse Public API (Free, no API key required)
  try {
    const openverseRes = await axios.get(`https://api.openverse.org/v1/images/`, {
      params: { q: cleanTerm, page_size: 1 },
      timeout: 4000,
    });
    const item = openverseRes.data?.results?.[0];
    if (item && item.url) {
      return {
        imageUrl: item.url,
        thumbnailUrl: item.thumbnail || item.url,
        photographer: item.creator || 'Openverse Community',
        sourceUrl: item.foreign_landing_url || item.url,
      };
    }
  } catch {}

  // 3. Guaranteed visual fallback
  return {
    imageUrl: `https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&auto=format&fit=crop&q=80`,
    thumbnailUrl: `https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&auto=format&fit=crop&q=80`,
    photographer: 'Unsplash Community',
    sourceUrl: 'https://unsplash.com',
  };
}

