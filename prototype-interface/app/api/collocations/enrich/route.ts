import { NextResponse } from 'next/server'
import axios from 'axios'
import { INITIAL_COLLOCATIONS } from '@/lib/db/initial_collocations'

export const dynamic = 'force-dynamic'

// In-memory cache for fast response (TTL: 2 hours)
const collocCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL_MS = 2 * 60 * 60 * 1000

function normalizeKey(str: string): string {
  return (str || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function buildFallbackExamples(phrase: string, head: string, tail: string): string[] {
  const clean = phrase.trim()
  const cap = clean.charAt(0).toUpperCase() + clean.slice(1)
  return [
    `The committee worked tirelessly to ${clean} before the end of the summit.`,
    `It is crucial that students learn how to ${clean} in academic writing.`,
    `In everyday business communication, professionals frequently ${clean} to achieve better results.`,
    `${cap} can have a significant positive impact on long-term productivity.`,
  ]
}

export async function enrichSingleCollocation(phrase: string) {
  const cleanPhrase = phrase.trim()
  if (!cleanPhrase) return null

  const key = normalizeKey(cleanPhrase)

  // 1. Cache hit
  const cached = collocCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  // 2. Local database / INITIAL_COLLOCATIONS match
  const localMatch = INITIAL_COLLOCATIONS.find(
    (c) =>
      normalizeKey(c.full_phrase) === key ||
      normalizeKey(`${c.head_word} ${c.tail_chunk}`) === key
  )

  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

  // 3. If Gemini is available, call AI for rich multi-context examples & deep collocation analysis
  if (apiKey) {
    const models = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash']
    const promptText = `Analyze the English collocation or phrase "${cleanPhrase}":

1. "headWord": The root/head word (e.g., "reach", "make", "bitterly", "deeply", "take").
2. "tailChunk": The accompanying chunk (e.g., "an agreement", "an effort", "disappointed", "rooted", "into account").
3. "fullPhrase": The natural, standard full collocation phrase (e.g., "make an effort").
4. "vietnameseMeaning": 2-3 accurate, natural Vietnamese meanings separated by commas (e.g. "đạt được thỏa thuận, đi đến thống nhất").
5. "englishMeaning": A concise, clear English explanation of this collocation.
6. "cefrLevel": CEFR level ("B1", "B2", "C1", "C2").
7. "ieltsTopic": Relevant IELTS topic (e.g., "Everyday Verbs", "Business & Work", "Study & Education", "Travel & Tourism", "Health & Fitness", "Society & Culture", "Science & Technology", "Environment & Nature", "Crime & Law", "Feelings & Emotions", "Academic").
8. "examples": An array of exactly 3 to 4 DIVERSE, natural, complete English sentences using "${cleanPhrase}" in DIFFERENT realistic contexts (1 academic essay context, 1 workplace/business context, 1 everyday conversation context, 1 formal/news context). Each sentence MUST be complete, grammatically sound, and clearly highlight the collocation.
9. "distractors": An array of 2-3 common/plausible incorrect combinations learners might confuse (e.g., for "make a decision" -> ["do a decision", "take a decision"]).

Return ONLY a valid raw JSON object (no markdown, no code fences):
{
  "headWord": "make",
  "tailChunk": "an effort",
  "fullPhrase": "${cleanPhrase}",
  "vietnameseMeaning": "nỗ lực, cố gắng",
  "englishMeaning": "to try hard to do something",
  "cefrLevel": "B1",
  "ieltsTopic": "Everyday Verbs",
  "examples": [
    "She made a conscious effort to improve her public speaking skills.",
    "The government must make a concerted effort to curb rising inflation.",
    "I'm making a special effort to get to work on time every morning."
  ],
  "distractors": ["do an effort", "take an effort"]
}`

    for (const modelName of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`
        const res = await axios.post(
          url,
          {
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'application/json',
            },
          },
          { headers: { 'Content-Type': 'application/json' }, timeout: 12000 }
        )

        const rawText = res.data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (rawText) {
          const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim()
          const parsed = JSON.parse(cleanJson)

          let exList: string[] = Array.isArray(parsed.examples)
            ? parsed.examples.filter((e: any) => typeof e === 'string' && e.trim().length > 0)
            : []

          // If localMatch has an example sentence and not in exList, prepend it
          if (localMatch?.example_sentence && !exList.includes(localMatch.example_sentence)) {
            exList.unshift(localMatch.example_sentence)
          }

          if (exList.length === 0) {
            exList = buildFallbackExamples(
              parsed.fullPhrase || cleanPhrase,
              parsed.headWord || '',
              parsed.tailChunk || ''
            )
          }

          const result = {
            headWord: parsed.headWord || localMatch?.head_word || cleanPhrase.split(' ')[0] || cleanPhrase,
            tailChunk:
              parsed.tailChunk ||
              localMatch?.tail_chunk ||
              cleanPhrase.split(' ').slice(1).join(' ') ||
              '',
            fullPhrase: parsed.fullPhrase || localMatch?.full_phrase || cleanPhrase,
            vietnameseMeaning:
              parsed.vietnameseMeaning ||
              localMatch?.meaning_vi ||
              `Nghĩa của ${cleanPhrase}`,
            englishMeaning: parsed.englishMeaning || `Collocation phrase: ${cleanPhrase}`,
            cefrLevel: parsed.cefrLevel || localMatch?.cefr_level || 'B2',
            ieltsTopic: parsed.ieltsTopic || localMatch?.ielts_topic || localMatch?.category || 'General',
            category: parsed.ieltsTopic || localMatch?.category || localMatch?.ielts_topic || 'General',
            examples: exList,
            exampleSentence: exList.join('\n\n• '),
            primaryExample: exList[0] || '',
            distractors:
              Array.isArray(parsed.distractors) && parsed.distractors.length > 0
                ? parsed.distractors
                : localMatch?.distractors || [],
          }

          if (collocCache.size > 500) {
            const firstKey = collocCache.keys().next().value
            if (firstKey) collocCache.delete(firstKey)
          }
          collocCache.set(key, { data: result, timestamp: Date.now() })
          return result
        }
      } catch (err) {
        // Try next model or fallback
      }
    }
  }

  // 4. Local match fallback with generated multi-examples
  if (localMatch) {
    const exList = [
      localMatch.example_sentence,
      ...buildFallbackExamples(localMatch.full_phrase, localMatch.head_word, localMatch.tail_chunk).slice(0, 3),
    ].filter(Boolean)

    const result = {
      headWord: localMatch.head_word,
      tailChunk: localMatch.tail_chunk,
      fullPhrase: localMatch.full_phrase,
      vietnameseMeaning: localMatch.meaning_vi,
      englishMeaning: `Collocation: ${localMatch.head_word} + ${localMatch.tail_chunk}`,
      cefrLevel: localMatch.cefr_level || 'B2',
      ieltsTopic: localMatch.ielts_topic || localMatch.category || 'General',
      category: localMatch.category || localMatch.ielts_topic || 'General',
      examples: exList,
      exampleSentence: exList.join('\n\n• '),
      primaryExample: localMatch.example_sentence,
      distractors: localMatch.distractors || [],
    }

    collocCache.set(key, { data: result, timestamp: Date.now() })
    return result
  }

  // 5. Intelligent syntactic heuristic fallback
  const words = cleanPhrase.split(/\s+/)
  const head = words[0] || cleanPhrase
  const tail = words.slice(1).join(' ')
  const fallbackExs = buildFallbackExamples(cleanPhrase, head, tail)

  const fallbackResult = {
    headWord: head,
    tailChunk: tail,
    fullPhrase: cleanPhrase,
    vietnameseMeaning: `Nghĩa của cụm từ ${cleanPhrase}`,
    englishMeaning: `Collocation phrase consisting of "${head}" and "${tail}"`,
    cefrLevel: cleanPhrase.length > 15 ? 'C1' : 'B2',
    ieltsTopic: 'Everyday Collocations',
    category: 'General',
    examples: fallbackExs,
    exampleSentence: fallbackExs.join('\n\n• '),
    primaryExample: fallbackExs[0],
    distractors: [],
  }

  collocCache.set(key, { data: fallbackResult, timestamp: Date.now() })
  return fallbackResult
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const phrase = searchParams.get('phrase') || searchParams.get('q') || searchParams.get('word')

    if (!phrase || !phrase.trim()) {
      return NextResponse.json({ error: 'Missing phrase parameter' }, { status: 400 })
    }

    const result = await enrichSingleCollocation(phrase)
    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Collocation enrichment error:', error)
    return NextResponse.json({ error: error.message || 'Failed to enrich collocation' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    if (body.phrase) {
      const result = await enrichSingleCollocation(body.phrase)
      return NextResponse.json(result)
    }

    if (Array.isArray(body.phrases)) {
      const results = await Promise.all(
        body.phrases.slice(0, 50).map((p: string) => enrichSingleCollocation(p))
      )
      return NextResponse.json({ results })
    }

    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  } catch (error: any) {
    console.error('Batch collocation enrichment error:', error)
    return NextResponse.json({ error: error.message || 'Failed to enrich collocations' }, { status: 500 })
  }
}
