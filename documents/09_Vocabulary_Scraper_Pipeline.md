# Backend Implementation Guide: Automated Vocabulary Enrichment Pipeline

Tài liệu này hướng dẫn xây dựng dịch vụ backend tự động thu thập metadata toàn diện cho một từ vựng tiếng Anh:
1. **Cambridge Dictionary Scraping:** Nghĩa (tiếng Anh & tiếng Việt), CEFR level (A1-C2), từ loại (POS), phiên âm IPA UK/US, câu ví dụ thực tế.
2. **Contextual Unsplash Image Fetching:** Tìm kiếm và chọn lọc ảnh minh họa tối ưu theo ngữ nghĩa.
3. **Pronunciation Audio Integration:** Lấy trực tiếp file MP3 bản xứ từ CDN của Cambridge kết hợp cơ chế fallback dự phòng (Free Dictionary API / Web Speech).

---

## 1. Cài Đặt Dependencies

Khởi tạo các thư viện cần thiết cho Node.js/TypeScript:

```bash
npm install axios cheerio
npm install -D @types/cheerio
axios: Gửi HTTP requests giả lập trình duyệt để bypass bộ lọc bot.

cheerio: Phân tích và trích xuất dữ liệu DOM HTML phía server cực nhanh (nhẹ hơn nhiều so với Puppeteer/Playwright khi chỉ cần cào text/HTML tĩnh).

2. Interface Dữ Liệu Chuẩn Đầu Ra (DTO)
Tạo file types/vocabulary.ts:

TypeScript
export interface DefinitionItem {
  cefrLevel: string | null;      // "B1", "B2", "C1", etc.
  englishMeaning: string;        // Định nghĩa tiếng Anh
  vietnameseMeaning: string;     // Bản dịch tiếng Việt
  examples: string[];            // Danh sách câu ví dụ
}

export interface VocabularyMetadata {
  term: string;
  partOfSpeech: string;          // "noun", "verb", "adjective", etc.
  ipaUk: string;                 // "/əˈkʌm.plɪʃ/"
  ipaUs: string;
  audioUkUrl: string | null;     // Link file MP3 UK
  audioUsUrl: string | null;     // Link file MP3 US
  definitions: DefinitionItem[];
  imageUrl: string | null;
  imagePhotographer: string | null;
}
3. Module 1: Cambridge Dictionary Scraper
Cambridge có cơ chế chặn Cloudflare nhẹ đối với các request không có header chuẩn. Ta cần giả lập User-Agent của trình duyệt hiện đại.

Tạo file services/cambridge-scraper.ts:

TypeScript
import axios from 'axios';
import * as cheerio from 'cheerio';
import { VocabularyMetadata, DefinitionItem } from '../types/vocabulary';

const CAMBRIDGE_BASE = '[https://dictionary.cambridge.org/vi/dictionary/english-vietnamese](https://dictionary.cambridge.org/vi/dictionary/english-vietnamese)';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Referer': '[https://dictionary.cambridge.org/vi/](https://dictionary.cambridge.org/vi/)',
};

export async function scrapeCambridge(word: string): Promise<Partial<VocabularyMetadata> | null> {
  const cleanWord = encodeURIComponent(word.trim().toLowerCase());
  const url = `${CAMBRIDGE_BASE}/${cleanWord}`;

  try {
    const { data: html } = await axios.get(url, { headers: HEADERS, timeout: 8000 });
    const $ = cheerio.load(html);

    // 1. Kiểm tra từ có tồn tại trong từ điển hay không
    const entry = $('.entry-body__el').first();
    if (!entry.length) {
      return null;
    }

    // 2. Từ loại (Part of Speech)
    const partOfSpeech = entry.find('.pos').first().text().trim() || 'unknown';

    // 3. Phiên âm IPA & Link Audio MP3 (UK / US)
    const ukSection = entry.find('.uk.dpron-i').first();
    const usSection = entry.find('.us.dpron-i').first();

    const ipaUk = ukSection.find('.ipa').first().text().trim();
    const ipaUs = usSection.find('.ipa').first().text().trim();

    // Link âm thanh nằm trong thẻ <source type="audio/mpeg" src="...">
    const getAudioUrl = (section: cheerio.Cheerio<cheerio.Element>) => {
      const src = section.find('audio source[type="audio/mpeg"]').first().attr('src');
      return src ? `[https://dictionary.cambridge.org](https://dictionary.cambridge.org)${src}` : null;
    };

    const audioUkUrl = getAudioUrl(ukSection);
    const audioUsUrl = getAudioUrl(usSection);

    // 4. Bóc tách từng nghĩa, CEFR Level, và ví dụ
    const definitions: DefinitionItem[] = [];

    entry.find('.def-block.ddef_block').each((_, defEl) => {
      const $def =$(defEl);

      // CEFR Level (thường nằm trong class .epp-xref, ví dụ: "b2")
      const rawLevel = $def.find('.epp-xref.dxref').first().text().trim();
      const cefrLevel = rawLevel ? rawLevel.toUpperCase() : null;

      // Định nghĩa tiếng Anh
      const englishMeaning = $def.find('.def.ddef_d.db').first().text().trim().replace(/:$/, '');

      // Nghĩa tiếng Việt (trong phiên bản từ điển English-Vietnamese)
      const vietnameseMeaning = $def.find('.trans.dtrans.dtrans-se').first().text().trim();

      // Danh sách câu ví dụ
      const examples: string[] = [];
      $def.find('.examp.dexamp').each((__, exEl) => {
        const egText = $(exEl).find('.eg.deg').text().trim();
        if (egText) {
          examples.push(egText);
        }
      });

      if (englishMeaning || vietnameseMeaning) {
        definitions.push({
          cefrLevel,
          englishMeaning,
          vietnameseMeaning,
          examples: examples.slice(0, 3), // Lấy tối đa 3 ví dụ tiêu biểu nhất
        });
      }
    });

    return {
      term: word,
      partOfSpeech,
      ipaUk: ipaUk ? `/${ipaUk}/` : '',
      ipaUs: ipaUs ? `/${ipaUs}/` : '',
      audioUkUrl,
      audioUsUrl,
      definitions,
    };
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.warn(`[Cambridge Scraper] Word not found: "${word}"`);
      return null;
    }
    console.error(`[Cambridge Scraper Error] Failed for "${word}":`, error.message);
    throw error;
  }
}
4. Module 2: Contextual Image Fetcher (Unsplash)
Để ảnh tìm được phù hợp ngữ nghĩa của từ và câu thay vì ra ảnh ngẫu nhiên, ta áp dụng 2 chiến thuật:

Kết hợp Từ khóa + Từ loại / Ngữ cảnh: Thay vì chỉ search accomplish, ta search accomplish goal hoặc lấy từ khóa chính từ định nghĩa / câu ví dụ đầu tiên.

Bộ lọc chất lượng Unsplash: Ép tỉ lệ ảnh ngang (landscape), lọc ảnh an toàn (content_filter=high), và chỉ lấy kích cỡ small (~400px rộng) để tối ưu tốc độ load flashcard.

Tạo file services/unsplash-service.ts:

TypeScript
import axios from 'axios';

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';

export interface ImageResult {
  imageUrl: string;
  thumbnailUrl: string;
  photographer: string;
  sourceUrl: string;
}

export async function fetchContextualImage(
  term: string,
  contextHint?: string
): Promise<ImageResult null |> {
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('[Unsplash] No access key provided. Skipping image fetch.');
    return null;
  }

  // Tinh chỉnh search query: nếu có ngữ cảnh (ví dụ: nghĩa ngắn gọn) thì bổ sung 1 từ khóa
  let searchQuery = term;
  if (contextHint) {
    // Lấy 1 từ quan trọng nhất từ nghĩa để làm context (bỏ stop words)
    const keywords = contextHint
      .replace(/[^\w\s]/gi, '')
      .split(' ')
      .filter((w) => w.length > 4 && !['something', 'someone', 'action', 'state'].includes(w.toLowerCase()));
    
    if (keywords.length > 0) {
      searchQuery = `${term} ${keywords[0]}`;
    }
  }

  try {
    const res = await axios.get('[https://api.unsplash.com/search/photos](https://api.unsplash.com/search/photos)', {
      params: {
        query: searchQuery,
        page: 1,
        per_page: 1,
        orientation: 'landscape',
        content_filter: 'high',
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
      timeout: 5000,
    });

    const photo = res.data.results?.[0];
    if (!photo) {
      // Fallback: nếu query nâng cao không ra kết quả, search lại duy nhất tên từ vựng
      if (searchQuery !== term) {
        return fetchContextualImage(term);
      }
      return null;
    }

    return {
      // Sử dụng kích thước 'small' (400px width) cho flashcard UI
      imageUrl: photo.urls.small,
      thumbnailUrl: photo.urls.thumb,
      photographer: photo.user.name,
      sourceUrl: photo.links.html,
    };
  } catch (error: any) {
    console.error('[Unsplash Service Error]:', error.message);
    return null;
  }
}
5. Module 3: Pronunciation Audio Fallback Strategy
Mặc dù scraper lấy trực tiếp link MP3 từ Cambridge CDN, đôi khi một số từ hiếm hoặc từ biến thể sẽ không có audio từ Cambridge. Ta thiết lập chiến lược fallback 3 lớp:

Lớp 1 (Ưu tiên cao nhất): Audio MP3 từ Cambridge Dictionary CDN.

Lớp 2 (Dự phòng Backend): Gọi qua Free Dictionary API (api.dictionaryapi.dev) để lấy audio của Oxford / Wiktionary nếu Cambridge thiếu.

Lớp 3 (Client-side Fallback): Nếu backend trả về audioUrl: null, client sẽ tự động gọi window.speechSynthesis (Web Speech API) để phát âm mà không bị lỗi giao diện.

Tạo file services/audio-fallback.ts:

TypeScript
import axios from 'axios';

export async function getFallbackAudio(term: string): Promise<string | null> {
  try {
    const res = await axios.get(`[https://api.dictionaryapi.dev/api/v2/entries/en/$](https://api.dictionaryapi.dev/api/v2/entries/en/$){encodeURIComponent(term)}`, {
      timeout: 3000,
    });
    const phonetics = res.data?.[0]?.phonetics || [];
    
    for (const item of phonetics) {
      if (item.audio && item.audio.endsWith('.mp3')) {
        return item.audio;
      }
    }
    return null;
  } catch {
    return null;
  }
}
6. Pipeline Orchestrator (Tổng Hợp Xử Lý)
Tạo file services/vocabulary-pipeline.ts đóng vai trò Controller điều phối toàn bộ luồng:

TypeScript
import { scrapeCambridge } from './cambridge-scraper';
import { fetchContextualImage } from './unsplash-service';
import { getFallbackAudio } from './audio-fallback';
import { VocabularyMetadata } from '../types/vocabulary';

export async function enrichVocabulary(word: string): Promise<VocabularyMetadata> {
  // Bước 1: Thu thập metadata từ Cambridge Dictionary
  const cambridgeData = await scrapeCambridge(word);

  if (!cambridgeData || !cambridgeData.definitions || cambridgeData.definitions.length === 0) {
    throw new Error(`Word "${word}" not found or failed to parse from Cambridge Dictionary.`);
  }

  // Bước 2: Kiểm tra và bù đắp file Audio nếu bị thiếu
  let audioUk = cambridgeData.audioUkUrl || null;
  let audioUs = cambridgeData.audioUsUrl || null;

  if (!audioUk && !audioUs) {
    const fallback = await getFallbackAudio(word);
    audioUk = fallback;
    audioUs = fallback;
  }

  // Bước 3: Thu thập ảnh minh họa Unsplash theo ngữ nghĩa chính đầu tiên
  const primaryMeaning = cambridgeData.definitions[0]?.englishMeaning || '';
  const imageData = await fetchContextualImage(word, primaryMeaning);

  // Bước 4: Đóng gói dữ liệu hoàn chỉnh
  return {
    term: cambridgeData.term || word,
    partOfSpeech: cambridgeData.partOfSpeech || 'noun',
    ipaUk: cambridgeData.ipaUk || '',
    ipaUs: cambridgeData.ipaUs || '',
    audioUkUrl: audioUk,
    audioUsUrl: audioUs,
    definitions: cambridgeData.definitions,
    imageUrl: imageData?.imageUrl || null,
    imagePhotographer: imageData?.photographer || null,
  };
}
7. API Endpoint & Lưu Vào Supabase Database
Tạo API Route (Next.js App Router: app/api/cards/enrich/route.ts):

TypeScript
import { NextResponse } from 'next/server';
import { enrichVocabulary } from '@/services/vocabulary-pipeline';
import { supabase } from '@/lib/supabase'; // Supabase client instance

export async function POST(req: Request) {
  try {
    const { word, userId } = await req.json();

    if (!word || !userId) {
      return NextResponse.json({ error: 'Missing word or userId' }, { status: 400 });
    }

    // 1. Chạy Enrichment Pipeline
    const enriched = await enrichVocabulary(word);

    // 2. Chuẩn bị dữ liệu lưu vào bảng cards
    const primaryDef = enriched.definitions[0];
    const example = primaryDef.examples[0] || '';

    const { data: card, error: cardError } = await supabase
      .from('cards')
      .insert({
        user_id: userId,
        term: enriched.term,
        part_of_speech: enriched.partOfSpeech,
        phonetic: enriched.ipaUk || enriched.ipaUs,
        meaning: primaryDef.vietnameseMeaning || primaryDef.englishMeaning,
        english_meaning: primaryDef.englishMeaning,
        cefr_level: primaryDef.cefrLevel,
        example_sentence: example,
        audio_url: enriched.audioUkUrl || enriched.audioUsUrl,
        image_url: enriched.imageUrl,
        all_definitions: enriched.definitions, // Cột JSONB lưu toàn bộ nghĩa & ví dụ
      })
      .select()
      .single();

    if (cardError) {
      return NextResponse.json({ error: cardError.message }, { status: 500 });
    }

    // 3. Khởi tạo trạng thái DSR / SRS ban đầu cho thẻ
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + 1);

    await supabase.from('card_dsr_state').insert({
      card_id: card.id,
      user_id: userId,
      difficulty: 5.0,
      stability: 1.0,
      due_date: nextDue.toISOString(),
    });

    return NextResponse.json({ success: true, data: card });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
8. Kiểm Thử Pipeline Trực Tiếp (CLI Runner)
Bạn có thể tạo một script scripts/test-enrich.ts để test nhanh trên Terminal mà không cần bật Web UI:

TypeScript
// Chạy lệnh: npx ts-node scripts/test-enrich.ts accomplish
import { enrichVocabulary } from '../services/vocabulary-pipeline';

async function run() {
  const targetWord = process.argv[2] || 'accomplish';
  console.log(`[Testing Pipeline] Fetching data for: "${targetWord}"...`);

  const result = await enrichVocabulary(targetWord);
  console.log(JSON.stringify(result, null, 2));
}

run();
Kết quả JSON mẫu đầu ra:
JSON
{
  "term": "accomplish",
  "partOfSpeech": "verb",
  "ipaUk": "/əˈkʌm.plɪʃ/",
  "ipaUs": "/əˈkɑːm.plɪʃ/",
  "audioUkUrl": "[https://dictionary.cambridge.org/vi/media/english-vietnamese/uk_pron/u/uka/ukacc/ukaccor029.mp3](https://dictionary.cambridge.org/vi/media/english-vietnamese/uk_pron/u/uka/ukacc/ukaccor029.mp3)",
  "audioUsUrl": "[https://dictionary.cambridge.org/vi/media/english-vietnamese/us_pron/a/acc/accom/accomplish.mp3](https://dictionary.cambridge.org/vi/media/english-vietnamese/us_pron/a/acc/accom/accomplish.mp3)",
  "definitions": [
    {
      "cefrLevel": "B2",
      "englishMeaning": "to finish something successfully or to achieve something",
      "vietnameseMeaning": "hoàn thành, đạt được",
      "examples": [
        "The students accomplished the task in less than ten minutes.",
        "She accomplished such a lot during her visit."
      ]
    }
  ],
  "imageUrl": "[https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400](https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400)",
  "imagePhotographer": "Priscilla Du Preez"
}