import { NextResponse } from 'next/server';
import { enrichVocabulary } from '@/services/vocabulary-pipeline';
import { db } from '@/lib/db';
import * as sqliteSchema from '@/lib/db/schema';
import * as pgSchema from '@/lib/db/pg_schema';
import { isSupabaseConfigured, supabase } from '@/lib/db/supabase';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { word, deckId, userId } = await req.json();

    if (!word || !userId) {
      return NextResponse.json({ error: 'Missing word or userId' }, { status: 400 });
    }

    // 1. Run Enrichment Pipeline
    const enriched = await enrichVocabulary(word);

    // 2. Prepare card data (Top 3 definitions)
    const top3Defs = (enriched.definitions || []).slice(0, 3);
    const primaryDef = top3Defs[0] || {
      englishMeaning: '',
      vietnameseMeaning: '',
      cefrLevel: null,
      examples: [],
    };

    const vietnameseMeanings = top3Defs
      .map((d) => d.vietnameseMeaning)
      .filter((v, i, self) => Boolean(v) && self.indexOf(v) === i);

    const vietnameseDefinition = vietnameseMeanings.length > 0 ? vietnameseMeanings.join('; ') : primaryDef.englishMeaning;
    const englishMeaning = top3Defs.map((d) => d.englishMeaning).filter(Boolean).join(' | ') || primaryDef.englishMeaning;
    const example = top3Defs.flatMap((d) => d.examples)[0] || primaryDef.examples[0] || '';

    const cardId = `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const effectiveDeckId = deckId || 'default-deck';

    let cardRecord: any = null;
    let savedToSupabase = false;

    if (isSupabaseConfigured()) {
      try {
        // Ensure user & deck exist in Supabase
        await supabase.from('users').upsert({
          id: userId,
          email: `${userId}@example.com`,
          password_hash: 'dummy_hash',
          name: userId,
        }, { onConflict: 'id' });

        await supabase.from('decks').upsert({
          id: effectiveDeckId,
          user_id: userId,
          title: 'Default Deck',
          description: 'Auto-created deck for enriched cards',
        }, { onConflict: 'id' });

        const { data: card, error: cardError } = await supabase
          .from('cards')
          .insert({
            id: cardId,
            deck_id: effectiveDeckId,
            user_id: userId,
            term: enriched.term,
            part_of_speech: enriched.partOfSpeech,
            phonetic: enriched.ipaUk || enriched.ipaUs,
            vietnamese_definition: vietnameseDefinition,
            example_sentence: example,
          })
          .select()
          .single();

        if (!cardError && card) {
          cardRecord = card;
          savedToSupabase = true;

          const nextDue = new Date();
          nextDue.setDate(nextDue.getDate() + 1);

          await supabase.from('card_dsr_state').insert({
            id: `dsr_${cardId}`,
            card_id: cardId,
            user_id: userId,
            difficulty: 5.0,
            stability: 1.0,
            reps: 0,
            lapses: 0,
            due_date: nextDue.toISOString(),
          });
        }
      } catch (err: any) {
        console.warn('[Supabase Insert Warning] Falling back to local database:', err.message);
      }
    }

    if (!savedToSupabase) {
      const isPostgres = Boolean(process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL);
      const targetCardsTable = isPostgres ? pgSchema.cards : sqliteSchema.cards;
      const targetDecksTable = isPostgres ? pgSchema.decks : sqliteSchema.decks;
      const targetUsersTable = isPostgres ? pgSchema.users : sqliteSchema.users;
      const targetDsrTable = isPostgres ? pgSchema.cardDsrStates : sqliteSchema.cardDsrStates;

      // Ensure user and deck exist for Foreign Key constraint
      try {
        const existingUsers = await db.select().from(targetUsersTable).where(eq(targetUsersTable.id, userId)).limit(1);
        if (!existingUsers || existingUsers.length === 0) {
          await db.insert(targetUsersTable).values({
            id: userId,
            email: `${userId}@example.com`,
            passwordHash: 'dummy_hash',
            name: userId,
          });
        }

        const existingDecks = await db.select().from(targetDecksTable).where(eq(targetDecksTable.id, effectiveDeckId)).limit(1);
        if (!existingDecks || existingDecks.length === 0) {
          await db.insert(targetDecksTable).values({
            id: effectiveDeckId,
            userId: userId,
            title: 'Default Deck',
            description: 'Auto-created deck for enriched cards',
          });
        }
      } catch (fkErr: any) {
        console.warn('[FK Provisioning Note]:', fkErr.message);
      }

      const insertValues: any = {
        id: cardId,
        deckId: effectiveDeckId,
        term: enriched.term,
        partOfSpeech: enriched.partOfSpeech,
        phonetic: enriched.ipaUk || enriched.ipaUs,
        vietnameseDefinition: vietnameseDefinition,
        exampleSentence: example,
      };

      if (!isPostgres) {
        insertValues.englishMeaning = englishMeaning;
        insertValues.cefrLevel = primaryDef.cefrLevel;
        insertValues.audioUrl = enriched.audioUkUrl || enriched.audioUsUrl;
        insertValues.imageUrl = enriched.imageUrl;
        insertValues.allDefinitionsJson = JSON.stringify(top3Defs);
      }

      const insertedCards = await db.insert(targetCardsTable).values(insertValues).returning();
      cardRecord = insertedCards[0] || { id: cardId, term: enriched.term, ...insertValues };

      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + 1);

      try {
        await db.insert(targetDsrTable).values({
          id: `dsr_${cardId}`,
          cardId: cardId,
          userId: userId,
          difficulty: 5.0,
          stability: 1.0,
          reps: 0,
          lapses: 0,
          dueDate: nextDue.toISOString(),
        });
      } catch {}
    }

    return NextResponse.json({ success: true, data: cardRecord, metadata: { ...enriched, definitions: top3Defs } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
