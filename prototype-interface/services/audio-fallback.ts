import axios from 'axios';

export async function getFallbackAudio(term: string): Promise<string | null> {
  const cleanTerm = term.trim().toLowerCase();
  if (!cleanTerm) return null;

  try {
    const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanTerm)}`, {
      timeout: 3000,
    });
    const phonetics = res.data?.[0]?.phonetics || [];
    
    for (const item of phonetics) {
      if (item.audio && item.audio.trim().length > 0) {
        let audio = item.audio.trim();
        if (audio.startsWith('//')) audio = `https:${audio}`;
        if (audio.startsWith('http')) return audio;
      }
    }
  } catch {}

  // 100% Reliable native English pronunciation fallback
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${encodeURIComponent(cleanTerm)}`;
}

