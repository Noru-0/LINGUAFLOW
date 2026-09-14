import { NextResponse } from 'next/server';
import { enrichVocabulary } from '@/services/vocabulary-pipeline';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const word = searchParams.get('word') || searchParams.get('w') || searchParams.get('q');
    const type = searchParams.get('type') || searchParams.get('pos') || '';

    if (!word || !word.trim()) {
      return NextResponse.json({ error: 'Missing word parameter' }, { status: 400 });
    }

    const enriched = await enrichVocabulary(word.trim());
    let defs = (enriched.definitions || []).slice(0, 3);

    // If type is specified, sort definitions matching partOfSpeech
    if (type && type.trim() && defs.length > 0) {
      const cleanType = type.trim().toLowerCase();
      defs.sort((a, b) => {
        const matchA = (enriched.partOfSpeech || '').toLowerCase().includes(cleanType) ? 1 : 0;
        const matchB = (enriched.partOfSpeech || '').toLowerCase().includes(cleanType) ? 1 : 0;
        return matchB - matchA;
      });
    }

    const primaryDef = defs[0] || {
      englishMeaning: '',
      vietnameseMeaning: '',
      cefrLevel: null,
      examples: [],
    };

    // Combine top 3 distinct Vietnamese meanings
    const vietnameseMeanings = defs
      .map((d) => d.vietnameseMeaning)
      .filter((v, i, self) => Boolean(v) && self.indexOf(v) === i);

    const combinedVietnamese = vietnameseMeanings.length > 0 ? vietnameseMeanings.join('; ') : primaryDef.englishMeaning;

    // Combine top 3 English meanings
    const englishMeanings = defs
      .map((d) => d.englishMeaning)
      .filter((e, i, self) => Boolean(e) && self.indexOf(e) === i);

    const combinedEnglish = englishMeanings.join(' | ');

    // Collect all examples from top 3 meanings
    const allExamples = defs.flatMap((d) => d.examples || []);

    return NextResponse.json({
      term: enriched.term,
      partOfSpeech: type || enriched.partOfSpeech || 'noun',
      phonetic: enriched.ipaUk || enriched.ipaUs || '',
      vietnameseMeaning: combinedVietnamese,
      englishMeaning: combinedEnglish || primaryDef.englishMeaning,
      cefrLevel: primaryDef.cefrLevel || (enriched as any).cefrLevel || 'B1',
      example: allExamples[0] || primaryDef.examples[0] || '',
      examples: allExamples,
      audioUrl: enriched.audioUkUrl || enriched.audioUsUrl,
      imageUrl: enriched.imageUrl,
      definitions: defs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
