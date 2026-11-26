import axios from 'axios'

export interface VocabClassifierCandidate {
  id: string
  name: string
  confidence: number
}

export interface VocabClassifierPrediction {
  sense_id?: string | null
  word: string
  pos: string
  prediction: {
    main_topic: VocabClassifierCandidate
    subtopic: VocabClassifierCandidate
  }
  joint_confidence: number
  status: 'accepted' | 'needs_review'
  abstained: boolean
  abstention_reasons: string[]
  model_version: string
  review_record: {
    predicted_main_topic: string
    predicted_subtopic: string
    human_verified: boolean
    prediction_status: 'accepted' | 'needs_review'
    model_version: string
  }
}

export interface VocabCardInput {
  id: string
  term: string
  partOfSpeech?: string | null
  englishMeaning?: string | null
  vietnameseMeaning?: string | null
  exampleSentence?: string | null
  collocations?: unknown
}

export interface VocabClassifierBatchResult {
  predictions: Map<string, VocabClassifierPrediction> | null
  error: string | null
  apiUrl: string
}

const DEFAULT_API_URL = 'https://vocab-classifier-745665682684.asia-southeast1.run.app'

function normalizeCollocationsList(raw: unknown): string[] {
  if (!raw) return []
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === 'object' && Array.isArray((raw as any).collocations)
      ? (raw as any).collocations
      : []

  const result: string[] = []
  for (const item of list) {
    if (typeof item === 'string') {
      const s = item.trim()
      if (s) result.push(s)
    } else if (item && typeof item === 'object') {
      const candidate =
        (item as any).fullPhrase ||
        (item as any).full_phrase ||
        (item as any).phrase ||
        (item as any).text ||
        (item as any).collocation
      if (typeof candidate === 'string' && candidate.trim()) {
        result.push(candidate.trim())
      }
    }
  }
  return result
}

function buildValidPayloadItems(cardsInput: VocabCardInput[]) {
  return cardsInput
    .map((c) => {
      const def = String(c.englishMeaning || c.vietnameseMeaning || '').trim()
      const word = String(c.term || '').trim()
      const pos = typeof c.partOfSpeech === 'string' && c.partOfSpeech.trim() ? c.partOfSpeech.trim() : 'unknown'
      const ex = typeof c.exampleSentence === 'string' && c.exampleSentence.trim() ? [c.exampleSentence.trim()] : []
      return {
        sense_id: String(c.id),
        word,
        pos,
        definition: def,
        examples: ex,
        collocations: normalizeCollocationsList(c.collocations),
      }
    })
    .filter((item) => item.word.length > 0 && item.definition.length > 0)
}

/**
 * Call the standalone Python FastAPI `vocab_classifier` service in resilient chunks,
 * returning both predictions and diagnostic error details if fallback is triggered.
 */
export async function classifyCardsWithVocabClassifierDetailed(
  cardsInput: VocabCardInput[],
  options?: { apiUrl?: string; timeoutMs?: number; chunkSize?: number }
): Promise<VocabClassifierBatchResult> {
  const baseUrl = (options?.apiUrl || process.env.VOCAB_CLASSIFIER_API_URL || DEFAULT_API_URL).replace(/\/+$/, '')
  if (cardsInput.length === 0) {
    return { predictions: new Map(), error: null, apiUrl: baseUrl }
  }

  const validItems = buildValidPayloadItems(cardsInput)
  if (validItems.length === 0) {
    return { predictions: null, error: 'No items had both non-empty word and definition', apiUrl: baseUrl }
  }

  const timeout = options?.timeoutMs ?? 45000
  const chunkSize = options?.chunkSize ?? 120
  const mapped = new Map<string, VocabClassifierPrediction>()
  const errors: string[] = []

  for (let i = 0; i < validItems.length; i += chunkSize) {
    const chunk = validItems.slice(i, i + chunkSize)
    try {
      const response = await axios.post(
        `${baseUrl}/predict/batch`,
        { items: chunk },
        { timeout, headers: { 'Content-Type': 'application/json' } }
      )
      const preds: VocabClassifierPrediction[] = response.data?.predictions || []
      for (const p of preds) {
        if (p.sense_id) {
          mapped.set(p.sense_id, p)
        }
      }
    } catch (err: any) {
      const status = err?.response?.status
      const detail = err?.response?.data ? JSON.stringify(err.response.data).slice(0, 200) : err?.message
      errors.push(`chunk@${i}(${chunk.length}): ${status ? `HTTP ${status} ` : ''}${detail || 'unknown error'}`)
    }
  }

  if (mapped.size === 0) {
    return {
      predictions: null,
      error: errors.join('; ') || 'Classifier returned 0 predictions',
      apiUrl: baseUrl,
    }
  }

  return {
    predictions: mapped,
    error: errors.length > 0 ? errors.join('; ') : null,
    apiUrl: baseUrl,
  }
}

/**
 * Convenience wrapper returning prediction Map directly, or null when unavailable.
 */
export async function classifyCardsWithVocabClassifier(
  cardsInput: VocabCardInput[],
  options?: { apiUrl?: string; timeoutMs?: number; chunkSize?: number }
): Promise<Map<string, VocabClassifierPrediction> | null> {
  const res = await classifyCardsWithVocabClassifierDetailed(cardsInput, options)
  return res.predictions
}

/**
 * Classify a single vocabulary word/sense via the batch classifier endpoint.
 */
export async function classifySingleWordWithVocabClassifier(
  input: Omit<VocabCardInput, 'id'> & { id?: string },
  options?: { apiUrl?: string; timeoutMs?: number }
): Promise<VocabClassifierPrediction | null> {
  const id = input.id || 'single_sense'
  const res = await classifyCardsWithVocabClassifier([{ ...input, id }], options)
  return res?.get(id) || null
}
