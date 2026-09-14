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
    const cleanViList: string[] = [];
    for (const d of defs) {
      if (!d.vietnameseMeaning) continue;
      const raw = d.vietnameseMeaning.trim();
      if (/[a-zA-Z]{6,}\s+[a-zA-Z]{4,}/.test(raw)) continue;

      const parts = raw.split(/[;,/]/).map((p) => p.trim());
      for (const p of parts) {
        if (p && !cleanViList.includes(p)) {
          cleanViList.push(p);
        }
      }
    }

    const combinedVietnamese = cleanViList.length > 0 ? cleanViList.slice(0, 3).join(', ') : primaryDef.vietnameseMeaning || '';

    // Combine top 3 English meanings
    const englishMeanings = defs
      .map((d) => d.englishMeaning)
      .filter((e, i, self) => Boolean(e) && self.indexOf(e) === i);

    const combinedEnglish = englishMeanings.join(' | ');

    // Collect all examples from top 3 meanings
    const allExamples = defs.flatMap((d) => d.examples || []);

    const effectivePos = (enriched.partOfSpeech && enriched.partOfSpeech !== 'noun')
      ? enriched.partOfSpeech
      : (type && type !== 'noun' ? type : (enriched.partOfSpeech || 'noun'));

    return NextResponse.json({
      term: enriched.term,
      partOfSpeech: effectivePos,
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
