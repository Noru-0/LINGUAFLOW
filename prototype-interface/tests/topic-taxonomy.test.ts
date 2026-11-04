import { describe, it, expect } from 'vitest'
import { INITIAL_TOPICS, fastLookupTopicByKeywords } from '../lib/db/initial_topics'
import { findTopicDetails } from '../services/gemini-service'

describe('Topic Taxonomy & Classification Engine', () => {
  it('should define exactly 10 standardized major domains', () => {
    expect(INITIAL_TOPICS.length).toBe(10)
    const majorIds = INITIAL_TOPICS.map((m) => m.id)
    expect(majorIds).toEqual([
      'env',
      'tech',
      'biz',
      'edu',
      'health',
      'soc',
      'urban',
      'travel',
      'life',
      'gov',
    ])
  })

  it('should ensure all subtopics have valid parentId references', () => {
    let totalSubtopics = 0
    for (const major of INITIAL_TOPICS) {
      expect(major.subtopics.length).toBeGreaterThanOrEqual(3)
      for (const sub of major.subtopics) {
        totalSubtopics++
        expect(sub.parentId).toBe(major.id)
        expect(sub.id.startsWith(major.id + '.')).toBe(true)
        expect(sub.keywords.length).toBeGreaterThan(0)
      }
    }
    expect(totalSubtopics).toBeGreaterThanOrEqual(40)
  })

  it('should correctly classify common vocabulary using Tier 1 fast lookup', () => {
    const testCases = [
      { term: 'emissions', expectedSub: 'env.climate' },
      { term: 'biodiversity', expectedSub: 'env.wildlife' },
      { term: 'solar', expectedSub: 'env.energy' },
      { term: 'recycling', expectedSub: 'env.pollution' },
      { term: 'tsunami', expectedSub: 'env.disaster' },
      { term: 'algorithm', expectedSub: 'tech.ai' },
      { term: 'cybersecurity', expectedSub: 'tech.cyber' },
      { term: 'astronomy', expectedSub: 'tech.space' },
      { term: 'genetics', expectedSub: 'tech.bio' },
      { term: 'dividend', expectedSub: 'biz.finance' },
      { term: 'recruitment', expectedSub: 'biz.career' },
      { term: 'pedagogy', expectedSub: 'edu.pedagogy' },
      { term: 'dissertation', expectedSub: 'edu.research' },
      { term: 'burnout', expectedSub: 'health.mental' },
      { term: 'gentrification', expectedSub: 'urban.planning' },
      { term: 'diplomacy', expectedSub: 'gov.diplomacy' },
    ]

    for (const tc of testCases) {
      const match = fastLookupTopicByKeywords(tc.term)
      expect(match).not.toBeNull()
      expect(match?.subtopicId).toBe(tc.expectedSub)
    }
  })

  it('should resolve full topic details using findTopicDetails', () => {
    const details = findTopicDetails('env.climate')
    expect(details).not.toBeNull()
    expect(details?.majorTopicId).toBe('env')
    expect(details?.majorTopicName).toBe('Environment & Nature')
    expect(details?.subtopicId).toBe('env.climate')
    expect(details?.subtopicName).toBe('Climate Change & Global Warming')
    expect(details?.confidence).toBeGreaterThan(0.8)
  })
})

