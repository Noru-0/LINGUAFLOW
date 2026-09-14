import axios from 'axios';

export async function getFallbackAudio(term: string): Promise<string | null> {
  try {
    const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(term)}`, {
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
