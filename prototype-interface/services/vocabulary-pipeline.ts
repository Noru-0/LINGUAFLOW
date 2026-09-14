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
