import { normalizeText } from './normalizer'
import { diffWords } from 'diff'

export interface EvaluationResult {
  isCorrect: boolean
  matchedCanonical: string | null
  suggestedAnswer: string
  normalizedUserSubmission: string
  normalizedCanonicalMatch: string | null
  diff: Array<{
    value: string
    added?: boolean
    removed?: boolean
  }>
}

export function evaluateTranslation(
  userSubmission: string,
  canonicalAnswers: string[]
): EvaluationResult {
  const normUser = normalizeText(userSubmission)
  
  let isCorrect = false
  let matchedCanonical: string | null = null
  let normalizedCanonicalMatch: string | null = null

  // Check against all acceptable canonical translations
  for (const canonical of canonicalAnswers) {
    const normCanonical = normalizeText(canonical)
    if (normUser === normCanonical) {
      isCorrect = true
      matchedCanonical = canonical
      normalizedCanonicalMatch = normCanonical
      break
    }
  }

  const primaryCanonical = canonicalAnswers[0] || ''
  const targetForDiff = matchedCanonical || primaryCanonical

  // Word-level diff comparison between normalized user submission and target canonical
  const wordDiffs = diffWords(normUser, normalizeText(targetForDiff))

  return {
    isCorrect,
    matchedCanonical,
    suggestedAnswer: targetForDiff,
    normalizedUserSubmission: normUser,
    normalizedCanonicalMatch: normalizedCanonicalMatch || normalizeText(targetForDiff),
    diff: wordDiffs.map(d => ({
      value: d.value,
      added: d.added,
      removed: d.removed,
    })),
  }
}
