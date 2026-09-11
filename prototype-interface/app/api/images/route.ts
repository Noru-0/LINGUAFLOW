import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type UnsplashPhoto = {
  id: string
  description: string | null
  alt_description: string | null
  urls: { raw: string; full: string; regular: string; small: string; thumb: string }
  user: { name: string; links: { html: string } }
  links: { html: string }
}

type UnsplashSearchResponse = {
  total: number
  results: UnsplashPhoto[]
}

type ImageResult = {
  url: string
  thumbUrl: string
  alt: string
  author: string
  authorUrl: string
  pageUrl: string
  source: 'unsplash' | 'openverse'
}

// In-memory cache so repeated reviews of the same word don't re-hit the API.
const cache = new Map<string, { at: number; images: ImageResult[] }>()
const CACHE_TTL_MS = 1000 * 60 * 60 * 6 // 6 hours

function normalizeQuery(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 3)
    .join(' ')
}

async function searchUnsplash(query: string, perPage: number): Promise<ImageResult[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return []

  const url = new URL('https://api.unsplash.com/search/photos')
  url.searchParams.set('query', query)
  url.searchParams.set('per_page', String(perPage))
  url.searchParams.set('orientation', 'landscape')
  url.searchParams.set('content_filter', 'high')

  const res = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${key}`,
      'Accept-Version': 'v1',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    console.error('Unsplash search failed:', res.status, await res.text().catch(() => ''))
    return []
  }

  const data = (await res.json()) as UnsplashSearchResponse
  return (data.results || []).map((photo) => ({
    url: photo.urls.regular,
    thumbUrl: photo.urls.small,
    alt: photo.alt_description || photo.description || query,
    author: photo.user?.name || 'Unknown',
    authorUrl: photo.user?.links?.html || 'https://unsplash.com',
    pageUrl: photo.links?.html || 'https://unsplash.com',
    source: 'unsplash' as const,
  }))
}

async function searchOpenverse(query: string, perPage: number): Promise<ImageResult[]> {
  const url = new URL('https://api.openverse.org/v1/images/')
  url.searchParams.set('q', query)
  url.searchParams.set('page_size', String(perPage))
  url.searchParams.set('license_type', 'commercial')
  url.searchParams.set('mature', 'false')

  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) return []

  const data = await res.json()
  return (data.results || [])
    .filter((item: any) => item.url)
    .map((item: any) => ({
      url: item.url,
      thumbUrl: item.thumbnail || item.url,
      alt: item.title || query,
      author: item.creator || 'Unknown',
      authorUrl: item.creator_url || 'https://openverse.org',
      pageUrl: item.foreign_landing_url || item.url,
      source: 'openverse' as const,
    }))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const raw = searchParams.get('q') || ''
  const query = normalizeQuery(raw)

  if (!query) {
    return NextResponse.json({ images: [] })
  }

  const cached = cache.get(query)
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json({ query, images: cached.images, cached: true })
  }

  try {
    let images = await searchUnsplash(query, 6)
    // Fall back to a broader query if the exact term has no results.
    if (images.length === 0 && query.includes(' ')) {
      images = await searchUnsplash(query.split(' ')[0], 6)
    }
    if (images.length === 0) {
      images = await searchOpenverse(query, 6)
    }

    cache.set(query, { at: Date.now(), images })
    return NextResponse.json({ query, images })
  } catch (error) {
    console.error('Image search error:', error)
    return NextResponse.json({ query, images: [], error: 'Image search failed' }, { status: 200 })
  }
}
