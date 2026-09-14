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
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('[Unsplash] No access key provided. Skipping image fetch.');
    return null;
  }

  // Tinh chỉnh search query: nếu có ngữ cảnh (ví dụ: nghĩa ngắn gọn) thì bổ sung 1 từ khóa
  let searchQuery = term;
  if (contextHint) {
    // Lấy 1 từ quan trọng nhất từ nghĩa để làm context (bỏ stop words)
    const keywords = contextHint
      .replace(/[^\w\s]/gi, '')
      .split(' ')
      .filter((w) => w.length > 4 && !['something', 'someone', 'action', 'state'].includes(w.toLowerCase()));
    
    if (keywords.length > 0) {
      searchQuery = `${term} ${keywords[0]}`;
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
    if (!photo) {
      // Fallback: nếu query nâng cao không ra kết quả, search lại duy nhất tên từ vựng
      if (searchQuery !== term) {
        return fetchContextualImage(term);
      }
      return null;
    }

    return {
      // Sử dụng kích thước 'small' (400px width) cho flashcard UI
      imageUrl: photo.urls.small,
      thumbnailUrl: photo.urls.thumb,
      photographer: photo.user.name,
      sourceUrl: photo.links.html,
    };
  } catch (error: any) {
    console.error('[Unsplash Service Error]:', error.message);
    return null;
  }
}
