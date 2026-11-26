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
  collocations?: string[]
}

const DEFAULT_API_URL = 'http://127.0.0.1:8000'

/**
 * Call the standalone Python FastAPI `vocab_classifier` service for batch inference.
 * Returns null when the service is offline so callers can fall back gracefully.
 */
export async function classifyCardsWithVocabClassifier(
  cardsInput: VocabCardInput[],
  options?: { apiUrl?: string; timeoutMs?: number }
): Promise<Map<string, VocabClassifierPrediction> | null> {
  if (cardsInput.length === 0) {
    return new Map()
  }

  const baseUrl = (options?.apiUrl || process.env.VOCAB_CLASSIFIER_API_URL || DEFAULT_API_URL).replace(/\/+$/, '')
  const timeout = options?.timeoutMs ?? 5000

  const validItems = cardsInput
    .map((c) => {
      const def = (c.englishMeaning || c.vietnameseMeaning || '').trim()
      return {
        sense_id: c.id,
        word: (c.term || '').trim(),
        pos: (c.partOfSpeech || 'unknown').trim() || 'unknown',
        definition: def,
        examples: c.exampleSentence ? [c.exampleSentence] : [],
        collocations: Array.isArray(c.collocations) ? c.collocations : [],
      }
    })
    .filter((item) => item.word.length > 0 && item.definition.length > 0)

  if (validItems.length === 0) {
    return null
  }

  try {
    const response = await axios.post(
      `${baseUrl}/predict/batch`,
      { items: validItems },
      { timeout, headers: { 'Content-Type': 'application/json' } }
    )
    const preds: VocabClassifierPrediction[] = response.data?.predictions || []
    const mapped = new Map<string, VocabClassifierPrediction>()
    for (const p of preds) {
      if (p.sense_id) {
        mapped.set(p.sense_id, p)
      }
    }
    return mapped
  } catch {
    return null
  }
}
