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

    const cleanWord = word.trim();
    const cleanType = type.trim();

    // Pass word and requested partOfSpeech to vocabulary pipeline
    const enriched = await enrichVocabulary(cleanWord, cleanType);
    const defs = enriched.definitions || [];

    const primaryDef = defs[0] || {
      englishMeaning: '',
      vietnameseMeaning: '',
      cefrLevel: null,
      examples: [],
    };

    // Combine distinct Vietnamese meanings (up to 4)
    const cleanViList: string[] = [];
    for (const d of defs) {
      if (!d.vietnameseMeaning) continue;
      const raw = d.vietnameseMeaning.trim();
      const parts = raw.split(/[;,/]/).map((p) => p.trim());
      for (const p of parts) {
        if (p && !cleanViList.includes(p) && cleanViList.length < 4) {
          cleanViList.push(p);
        }
      }
    }

    const combinedVietnamese = cleanViList.length > 0
      ? cleanViList.join(', ')
      : (primaryDef.vietnameseMeaning || '');

    // English Definition
    const englishMeanings = defs
      .map((d) => d.englishMeaning)
      .filter((e, i, self) => Boolean(e) && self.indexOf(e) === i);
    const combinedEnglish = primaryDef.englishMeaning || englishMeanings[0] || '';

    // Collect all examples
    const allExamples = defs.flatMap((d) => d.examples || []).filter((ex) => Boolean(ex) && ex.trim().length > 0);
    const primaryExample = primaryDef.examples?.[0] || allExamples[0] || '';

    const effectivePos = cleanType || enriched.partOfSpeech || 'noun';

    return NextResponse.json({
      term: enriched.term,
      partOfSpeech: effectivePos,
      phonetic: enriched.ipaUk || enriched.ipaUs || '',
      vietnameseMeaning: combinedVietnamese,
      englishMeaning: combinedEnglish,
      cefrLevel: enriched.cefrLevel || primaryDef.cefrLevel || 'B1',
      example: primaryExample,
      examples: allExamples,
      audioUrl: enriched.audioUkUrl || enriched.audioUsUrl,
      imageUrl: enriched.imageUrl,
      definitions: defs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
