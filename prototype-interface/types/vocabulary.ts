export interface DefinitionItem {
  cefrLevel: string | null;      // "B1", "B2", "C1", etc.
  englishMeaning: string;        // Định nghĩa tiếng Anh
  vietnameseMeaning: string;     // Bản dịch tiếng Việt
  examples: string[];            // Danh sách câu ví dụ
}

export interface TopicClassification {
  majorTopicId: string;
  majorTopicName: string;
  subtopicId: string;
  subtopicName: string;
  confidence: number;
}

export interface VocabularyMetadata {
  term: string;
  partOfSpeech: string;          // "noun", "verb", "adjective", etc.
  ipaUk: string;                 // "/əˈkʌm.plɪʃ/"
  ipaUs: string;
  audioUkUrl: string | null;     // Link file MP3 UK
  audioUsUrl: string | null;     // Link file MP3 US
  definitions: DefinitionItem[];
  cefrLevel?: string | null;
  imageUrl: string | null;
  imagePhotographer: string | null;
  topicClassification?: TopicClassification | null;
}
