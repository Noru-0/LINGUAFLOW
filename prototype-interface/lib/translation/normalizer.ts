/**
 * Text Normalization Pipeline for Grammar Evaluation
 * 
 * Rules:
 * 1. Trim leading/trailing whitespace
 * 2. Collapse multiple internal spaces
 * 3. Strip punctuation (. , ! ? ; : " ' - ` ~)
 * 4. Convert to lowercase
 */
export function normalizeText(text: string): string {
  if (!text) return ''

  return text
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:"'\-`~–—]/g, '')
    .replace(/\s+/g, ' ')
}
