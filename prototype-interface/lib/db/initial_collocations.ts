export interface InitialCollocation {
  id: string
  category: string
  head_word: string
  tail_chunk: string
  full_phrase: string
  meaning_vi: string
  example_sentence: string
  distractors: string[]
  cefr_level: 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  ielts_topic: string
}

export const INITIAL_COLLOCATIONS: InitialCollocation[] = [
  {
    "id": "colloc-cambridge-001",
    "category": "Introduction to Collocations",
    "head_word": "make",
    "tail_chunk": "an effort",
    "full_phrase": "make an effort",
    "meaning_vi": "nỗ lực, cố gắng",
    "example_sentence": "Students must make a special effort to learn English collocations.",
    "distractors": [
      "do an effort",
      "take an effort",
      "give an effort"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-002",
    "category": "Introduction to Collocations",
    "head_word": "take",
    "tail_chunk": "a photo",
    "full_phrase": "take a photo",
    "meaning_vi": "chụp ảnh",
    "example_sentence": "She took a photo of the ancient monuments during her trip.",
    "distractors": [
      "make a photo",
      "do a photo",
      "have a photo"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-003",
    "category": "Introduction to Collocations",
    "head_word": "keep to",
    "tail_chunk": "the rules",
    "full_phrase": "keep to the rules",
    "meaning_vi": "tuân thủ các quy tắc",
    "example_sentence": "All participants must keep to the rules of the competition.",
    "distractors": [
      "make the rules",
      "hold the rules",
      "take the rules"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Academic Writing"
  },
  {
    "id": "colloc-cambridge-004",
    "category": "Introduction to Collocations",
    "head_word": "stick to",
    "tail_chunk": "the rules",
    "full_phrase": "stick to the rules",
    "meaning_vi": "tuân thủ, bám sát các quy tắc",
    "example_sentence": "It is important to stick to the rules when conducting scientific research.",
    "distractors": [
      "paste the rules",
      "fix the rules",
      "join the rules"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Academic Writing"
  },
  {
    "id": "colloc-cambridge-005",
    "category": "Introduction to Collocations",
    "head_word": "watch",
    "tail_chunk": "TV",
    "full_phrase": "watch TV",
    "meaning_vi": "xem TV",
    "example_sentence": "He likes to watch TV after finishing his homework.",
    "distractors": [
      "look at TV",
      "see TV",
      "view TV"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-006",
    "category": "Introduction to Collocations",
    "head_word": "powerful",
    "tail_chunk": "engine",
    "full_phrase": "powerful engine",
    "meaning_vi": "động cơ mạnh mẽ",
    "example_sentence": "The sports car is equipped with a very powerful engine.",
    "distractors": [
      "strong engine",
      "big engine",
      "heavy engine"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Technology"
  },
  {
    "id": "colloc-cambridge-007",
    "category": "Introduction to Collocations",
    "head_word": "ancient",
    "tail_chunk": "monuments",
    "full_phrase": "ancient monuments",
    "meaning_vi": "các di tích cổ",
    "example_sentence": "Tourists from all over the world visit these ancient monuments.",
    "distractors": [
      "antique monuments",
      "old monuments",
      "aged monuments"
    ],
    "cefr_level": "B2",
    "ielts_topic": "History & Culture"
  },
  {
    "id": "colloc-cambridge-008",
    "category": "Introduction to Collocations",
    "head_word": "make",
    "tail_chunk": "mistakes",
    "full_phrase": "make mistakes",
    "meaning_vi": "mắc lỗi",
    "example_sentence": "Everyone tends to make a few mistakes when learning a new language.",
    "distractors": [
      "do mistakes",
      "have mistakes",
      "take mistakes"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Education"
  },
  {
    "id": "colloc-cambridge-009",
    "category": "Introduction to Collocations",
    "head_word": "strictly",
    "tail_chunk": "forbidden",
    "full_phrase": "strictly forbidden",
    "meaning_vi": "bị cấm ngặt nghèo, nghiêm cấm",
    "example_sentence": "Smoking is strictly forbidden inside the museum building.",
    "distractors": [
      "strongly forbidden",
      "heavily forbidden",
      "hardly forbidden"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Rules & Laws"
  },
  {
    "id": "colloc-cambridge-010",
    "category": "Introduction to Collocations",
    "head_word": "bitterly",
    "tail_chunk": "cold",
    "full_phrase": "bitterly cold",
    "meaning_vi": "lạnh cắt da cắt thịt, lạnh cóng",
    "example_sentence": "The weather outside was bitterly cold during the winter night.",
    "distractors": [
      "strongly cold",
      "heavily cold",
      "powerfully cold"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-011",
    "category": "Introduction to Collocations",
    "head_word": "pitch",
    "tail_chunk": "dark",
    "full_phrase": "pitch dark",
    "meaning_vi": "tối như mực",
    "example_sentence": "It was pitch dark outside because all the streetlights had failed.",
    "distractors": [
      "deep dark",
      "heavy dark",
      "strong dark"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-012",
    "category": "Introduction to Collocations",
    "head_word": "poverty",
    "tail_chunk": "breeds crime",
    "full_phrase": "poverty breeds crime",
    "meaning_vi": "nạn đói nghèo sinh ra tội phạm",
    "example_sentence": "Many sociologists argue that poverty breeds crime in urban areas.",
    "distractors": [
      "poverty makes crime",
      "poverty causes crime strictly",
      "poverty does crime"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Society"
  },
  {
    "id": "colloc-cambridge-013",
    "category": "Introduction to Collocations",
    "head_word": "substantial",
    "tail_chunk": "meal",
    "full_phrase": "substantial meal",
    "meaning_vi": "bữa ăn thịnh soạn, đầy đủ dưỡng chất",
    "example_sentence": "They enjoyed a substantial meal before setting off on their long journey.",
    "distractors": [
      "big meal strongly",
      "heavy meal largely",
      "large meal greatly"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Food & Health"
  },
  {
    "id": "colloc-cambridge-014",
    "category": "Introduction to Collocations",
    "head_word": "fast",
    "tail_chunk": "cars",
    "full_phrase": "fast cars",
    "meaning_vi": "xe hơi tốc độ cao",
    "example_sentence": "Young drivers are often attracted to fast cars.",
    "distractors": [
      "quick cars",
      "rapid cars",
      "swift cars"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Transport"
  },
  {
    "id": "colloc-cambridge-015",
    "category": "Introduction to Collocations",
    "head_word": "fast",
    "tail_chunk": "food",
    "full_phrase": "fast food",
    "meaning_vi": "đồ ăn nhanh",
    "example_sentence": "Eating too much fast food can lead to health problems.",
    "distractors": [
      "quick food",
      "rapid food",
      "swift food"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Food & Health"
  },
  {
    "id": "colloc-cambridge-016",
    "category": "Introduction to Collocations",
    "head_word": "quick",
    "tail_chunk": "glance",
    "full_phrase": "quick glance",
    "meaning_vi": "cái nhìn lướt qua nhanh chóng",
    "example_sentence": "She cast a quick glance at her watch before answering the question.",
    "distractors": [
      "fast glance",
      "rapid glance",
      "swift glance"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Everyday Actions"
  },
  {
    "id": "colloc-cambridge-017",
    "category": "Introduction to Collocations",
    "head_word": "quick",
    "tail_chunk": "meal",
    "full_phrase": "quick meal",
    "meaning_vi": "bữa ăn nhanh",
    "example_sentence": "We had a quick meal at the diner before the meeting.",
    "distractors": [
      "fast meal",
      "speedy meal",
      "rapid meal"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Food & Health"
  },
  {
    "id": "colloc-cambridge-018",
    "category": "Learning Strategies",
    "head_word": "sharp",
    "tail_chunk": "pain",
    "full_phrase": "a sharp pain",
    "meaning_vi": "cơn đau nhói",
    "example_sentence": "She had a sharp pain in her side and hoped that a hot bath might ease it.",
    "distractors": [
      "a strong pain",
      "a hard pain",
      "a heavy pain"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Health & Medicine"
  },
  {
    "id": "colloc-cambridge-019",
    "category": "Learning Strategies",
    "head_word": "sharp",
    "tail_chunk": "bend/turn",
    "full_phrase": "a sharp bend",
    "meaning_vi": "khúc cua gấp",
    "example_sentence": "Drive slowly because there is a sharp bend ahead on the road.",
    "distractors": [
      "a hard bend",
      "a heavy bend",
      "a strict bend"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel & Transport"
  },
  {
    "id": "colloc-cambridge-020",
    "category": "Learning Strategies",
    "head_word": "sharp",
    "tail_chunk": "contrast/difference",
    "full_phrase": "a sharp contrast",
    "meaning_vi": "sự tương phản rõ rệt",
    "example_sentence": "His polite behavior today is in sharp contrast to his rudeness yesterday.",
    "distractors": [
      "a strong contrast",
      "a heavy contrast",
      "a big contrast"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Academic Writing"
  },
  {
    "id": "colloc-cambridge-021",
    "category": "Learning Strategies",
    "head_word": "sharp",
    "tail_chunk": "rise/increase/drop",
    "full_phrase": "a sharp rise",
    "meaning_vi": "sự tăng vọt, sự tăng mạnh",
    "example_sentence": "There has been a sharp rise in the cost of living this year.",
    "distractors": [
      "a fast rise",
      "a big rise",
      "a quick rise"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Business & Economics"
  },
  {
    "id": "colloc-cambridge-022",
    "category": "Everyday Verbs",
    "head_word": "have",
    "tail_chunk": "access to",
    "full_phrase": "have access to",
    "meaning_vi": "có quyền tiếp cận với",
    "example_sentence": "I don’t have access to that kind of secret information.",
    "distractors": [
      "make access to",
      "get access with",
      "take access to"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Technology & Information"
  },
  {
    "id": "colloc-cambridge-023",
    "category": "Everyday Verbs",
    "head_word": "give",
    "tail_chunk": "a piece of advice",
    "full_phrase": "give a piece of advice",
    "meaning_vi": "đưa ra một lời khuyên",
    "example_sentence": "My teacher gave me a very useful piece of advice for the exam.",
    "distractors": [
      "make a piece of advice",
      "take a piece of advice",
      "do a piece of advice"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Education"
  },
  {
    "id": "colloc-cambridge-024",
    "category": "Everyday Verbs",
    "head_word": "find",
    "tail_chunk": "a way",
    "full_phrase": "find a way",
    "meaning_vi": "tìm ra cách",
    "example_sentence": "I must find a way to help him solve his financial problems.",
    "distractors": [
      "make a way",
      "do a way",
      "take a way"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Problem Solving"
  },
  {
    "id": "colloc-cambridge-025",
    "category": "Everyday Verbs",
    "head_word": "get in",
    "tail_chunk": "someone's way",
    "full_phrase": "get in someone's way",
    "meaning_vi": "cản đường ai đó",
    "example_sentence": "Please tell me if I’m getting in your way while you are cooking.",
    "distractors": [
      "make in someone's way",
      "take in someone's way",
      "put in someone's way"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Everyday Life"
  },
  {
    "id": "colloc-cambridge-026",
    "category": "Everyday Verbs",
    "head_word": "give",
    "tail_chunk": "way",
    "full_phrase": "give way",
    "meaning_vi": "nhường đường",
    "example_sentence": "You must give way to traffic coming from the left at this roundabout.",
    "distractors": [
      "make way",
      "take way",
      "do way"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel & Transport"
  },
  {
    "id": "colloc-cambridge-027",
    "category": "Everyday Verbs",
    "head_word": "give",
    "tail_chunk": "a lift",
    "full_phrase": "give someone a lift",
    "meaning_vi": "cho ai đi nhờ xe",
    "example_sentence": "After giving Mark a lift to the airport, Julie made her way home.",
    "distractors": [
      "make a lift",
      "take a lift",
      "do a lift"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Travel & Transport"
  },
  {
    "id": "colloc-cambridge-028",
    "category": "Everyday Verbs",
    "head_word": "make",
    "tail_chunk": "one's way",
    "full_phrase": "make one's way",
    "meaning_vi": "đi về hướng, di chuyển về phía",
    "example_sentence": "She gathered her belongings and made her way home.",
    "distractors": [
      "do one's way",
      "take one's way",
      "go one's way"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel & Transport"
  },
  {
    "id": "colloc-cambridge-029",
    "category": "Emotions & Feelings",
    "head_word": "lead",
    "tail_chunk": "a life",
    "full_phrase": "lead an exciting life",
    "meaning_vi": "sống một cuộc đời",
    "example_sentence": "What an exciting life he led traveling around the world!",
    "distractors": [
      "make a life",
      "do a life",
      "have an exciting life"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Lifestyle"
  },
  {
    "id": "colloc-cambridge-030",
    "category": "Emotions & Feelings",
    "head_word": "desperately",
    "tail_chunk": "jealous",
    "full_phrase": "desperately jealous",
    "meaning_vi": "ghen tị phát điên / cực kỳ ghen tị",
    "example_sentence": "At times Julie felt desperately jealous of his successful career.",
    "distractors": [
      "heavily jealous",
      "strongly jealous",
      "bitterly jealous"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Emotions"
  },
  {
    "id": "colloc-cambridge-031",
    "category": "Everyday Verbs",
    "head_word": "take",
    "tail_chunk": "care of",
    "full_phrase": "take care of",
    "meaning_vi": "chăm sóc",
    "example_sentence": "She spent her time taking care of him and the young children.",
    "distractors": [
      "make care of",
      "do care of",
      "give care of"
    ],
    "cefr_level": "A2",
    "ielts_topic": "Family & Relationships"
  },
  {
    "id": "colloc-cambridge-032",
    "category": "Everyday Verbs",
    "head_word": "make",
    "tail_chunk": "demands on",
    "full_phrase": "make demands on",
    "meaning_vi": "đặt ra yêu cầu/gánh nặng cho ai",
    "example_sentence": "Her sister was getting divorced and would doubtless be making demands on her too.",
    "distractors": [
      "do demands on",
      "take demands on",
      "give demands on"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-033",
    "category": "Everyday Verbs",
    "head_word": "give",
    "tail_chunk": "a call",
    "full_phrase": "give someone a call",
    "meaning_vi": "gọi điện cho ai",
    "example_sentence": "Julie had promised to give her sister a call as soon as she got home.",
    "distractors": [
      "make a call",
      "take a call",
      "do a call"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Communication"
  },
  {
    "id": "colloc-cambridge-034",
    "category": "Everyday Verbs",
    "head_word": "run",
    "tail_chunk": "a bath",
    "full_phrase": "run a bath",
    "meaning_vi": "xả nước bồn tắm",
    "example_sentence": "She decided to run herself a bath to relax after a stressful day.",
    "distractors": [
      "make a bath",
      "take a bath",
      "do a bath"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Daily Routine"
  },
  {
    "id": "colloc-cambridge-035",
    "category": "Learning Strategies",
    "head_word": "get",
    "tail_chunk": "into the habit",
    "full_phrase": "get into the habit",
    "meaning_vi": "hình thành thói quen",
    "example_sentence": "Get into the habit of making a note of any good collocations you read.",
    "distractors": [
      "make into the habit",
      "take into the habit",
      "do into the habit"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Education & Habits"
  },
  {
    "id": "colloc-cambridge-036",
    "category": "Learning Strategies",
    "head_word": "make",
    "tail_chunk": "a note",
    "full_phrase": "make a note",
    "meaning_vi": "ghi chú",
    "example_sentence": "You should make a note of important vocabulary during the lecture.",
    "distractors": [
      "do a note",
      "take a note",
      "write a note"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Education"
  },
  {
    "id": "colloc-cambridge-037",
    "category": "Learning Strategies",
    "head_word": "make",
    "tail_chunk": "a point",
    "full_phrase": "make a point",
    "meaning_vi": "coi trọng việc gì, đặc biệt chú ý làm gì",
    "example_sentence": "When you look up a new word, make a point of noting it down.",
    "distractors": [
      "do a point",
      "take a point",
      "give a point"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Education & Study"
  },
  {
    "id": "colloc-cambridge-038",
    "category": "Using your dictionary",
    "head_word": "take",
    "tail_chunk": "somebody up on an offer",
    "full_phrase": "take somebody up on an offer",
    "meaning_vi": "nhận lời đề nghị của ai đó",
    "example_sentence": "I would love to take you up on your offer to help with the project.",
    "distractors": [
      "make somebody up on an offer",
      "get somebody up on an offer",
      "do somebody up on an offer"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-039",
    "category": "Using your dictionary",
    "head_word": "accept",
    "tail_chunk": "an offer",
    "full_phrase": "accept an offer",
    "meaning_vi": "chấp nhận một lời đề nghị",
    "example_sentence": "She decided to accept the job offer immediately.",
    "distractors": [
      "take an offer",
      "make an offer",
      "do an offer"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-040",
    "category": "Using your dictionary",
    "head_word": "look up",
    "tail_chunk": "words",
    "full_phrase": "look up words",
    "meaning_vi": "tra cứu từ vựng",
    "example_sentence": "Students should look up unfamiliar words in a good learner's dictionary.",
    "distractors": [
      "search up words",
      "find up words",
      "seek up words"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Education"
  },
  {
    "id": "colloc-cambridge-041",
    "category": "Types of Collocation",
    "head_word": "bright",
    "tail_chunk": "colour",
    "full_phrase": "bright colour",
    "meaning_vi": "màu sắc tươi sáng",
    "example_sentence": "Emma always wears red or yellow or some other bright colour.",
    "distractors": [
      "light colour",
      "shiny colour",
      "strong colour"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Art & Fashion"
  },
  {
    "id": "colloc-cambridge-042",
    "category": "Types of Collocation",
    "head_word": "brief",
    "tail_chunk": "chat",
    "full_phrase": "brief chat",
    "meaning_vi": "cuộc trò chuyện ngắn",
    "example_sentence": "We had a brief chat about the exams but didn’t have time to discuss them properly.",
    "distractors": [
      "short chat",
      "quick talk",
      "fast chat"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Communication"
  },
  {
    "id": "colloc-cambridge-043",
    "category": "Types of Collocation",
    "head_word": "major",
    "tail_chunk": "problem",
    "full_phrase": "major problem",
    "meaning_vi": "vấn đề lớn, vấn đề trọng tâm",
    "example_sentence": "Unemployment is a major problem for the government at the moment.",
    "distractors": [
      "big problem",
      "main problem",
      "heavy problem"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Society"
  },
  {
    "id": "colloc-cambridge-044",
    "category": "Types of Collocation",
    "head_word": "key",
    "tail_chunk": "issue",
    "full_phrase": "key issue",
    "meaning_vi": "vấn đề then chốt",
    "example_sentence": "Improving the health service is another key issue for government.",
    "distractors": [
      "main issue",
      "crucial question",
      "central point"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Government & Politics"
  },
  {
    "id": "colloc-cambridge-045",
    "category": "Types of Collocation",
    "head_word": "economy",
    "tail_chunk": "boomed",
    "full_phrase": "the economy boomed",
    "meaning_vi": "nền kinh tế bùng nổ",
    "example_sentence": "The economy boomed in the 1990s and created many jobs.",
    "distractors": [
      "the economy grew up",
      "the economy raised",
      "the economy increased"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Economics & Business"
  },
  {
    "id": "colloc-cambridge-046",
    "category": "Types of Collocation",
    "head_word": "launch",
    "tail_chunk": "a product",
    "full_phrase": "launch a product",
    "meaning_vi": "ra mắt sản phẩm",
    "example_sentence": "The company successfully launched the product in the market last year.",
    "distractors": [
      "release a product",
      "open a product",
      "introduce a good"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Business & Marketing"
  },
  {
    "id": "colloc-cambridge-047",
    "category": "Types of Collocation",
    "head_word": "pose",
    "tail_chunk": "a problem",
    "full_phrase": "pose a problem",
    "meaning_vi": "gây ra vấn đề, đặt ra vấn đề",
    "example_sentence": "The sudden price increase poses a serious problem for our business.",
    "distractors": [
      "make a problem",
      "give a problem",
      "do a problem"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Academic Writing"
  },
  {
    "id": "colloc-cambridge-048",
    "category": "Types of Collocation",
    "head_word": "create",
    "tail_chunk": "opportunities",
    "full_phrase": "create opportunities",
    "meaning_vi": "tạo ra cơ hội",
    "example_sentence": "The rapid development of the internet has created new opportunities for our business.",
    "distractors": [
      "make opportunities",
      "build opportunities",
      "do opportunities"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Business & Employment"
  },
  {
    "id": "colloc-cambridge-049",
    "category": "Types of Collocation",
    "head_word": "surge",
    "tail_chunk": "of anger",
    "full_phrase": "a surge of anger",
    "meaning_vi": "sự dâng trào cơn giận",
    "example_sentence": "As Max read the unfair lies about him, he felt a sudden surge of anger.",
    "distractors": [
      "a wave of anger",
      "a rush of angry",
      "a flow of anger"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Emotions"
  },
  {
    "id": "colloc-cambridge-050",
    "category": "Types of Collocation",
    "head_word": "sense",
    "tail_chunk": "of pride",
    "full_phrase": "a sense of pride",
    "meaning_vi": "niềm tự hào",
    "example_sentence": "Every parent feels a deep sense of pride when their child wins an award.",
    "distractors": [
      "a feeling of proud",
      "an emotion of pride",
      "a mood of pride"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Psychology & Family"
  },
  {
    "id": "colloc-cambridge-051",
    "category": "Types of Collocation",
    "head_word": "pang",
    "tail_chunk": "of nostalgia",
    "full_phrase": "a pang of nostalgia",
    "meaning_vi": "cảm giác bồi hồi, hoài niệm chợt nhói lên",
    "example_sentence": "I felt a sudden pang of nostalgia when I saw the old photos of my childhood village.",
    "distractors": [
      "a wave of nostalgia",
      "a touch of nostalgic",
      "a pain of nostalgia"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Emotions"
  },
  {
    "id": "colloc-cambridge-052",
    "category": "Types of Collocation",
    "head_word": "burst",
    "tail_chunk": "into tears",
    "full_phrase": "burst into tears",
    "meaning_vi": "oà khóc",
    "example_sentence": "When she spilt coffee on her new white dress, the little girl burst into tears.",
    "distractors": [
      "break into tears",
      "start into tears",
      "fall into tears"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Emotions"
  },
  {
    "id": "colloc-cambridge-053",
    "category": "Types of Collocation",
    "head_word": "pull",
    "tail_chunk": "steadily",
    "full_phrase": "pull steadily",
    "meaning_vi": "kéo đều đặn và chắc chắn",
    "example_sentence": "She pulled steadily on the rope to help the hiker climb up to safety.",
    "distractors": [
      "pull strongly",
      "pull firmly",
      "pull continuously"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Actions"
  },
  {
    "id": "colloc-cambridge-054",
    "category": "Types of Collocation",
    "head_word": "happily",
    "tail_chunk": "married",
    "full_phrase": "happily married",
    "meaning_vi": "kết hôn hạnh phúc",
    "example_sentence": "My grandparents have been happily married for over fifty years.",
    "distractors": [
      "joyfully married",
      "luckily married",
      "pleasantly married"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-055",
    "category": "Types of Collocation",
    "head_word": "fully",
    "tail_chunk": "aware",
    "full_phrase": "fully aware",
    "meaning_vi": "hoàn toàn nhận thức rõ",
    "example_sentence": "I am fully aware that there are serious problems we need to solve.",
    "distractors": [
      "completely aware",
      "totally aware",
      "utterly aware"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Mind & Cognition"
  },
  {
    "id": "colloc-cambridge-056",
    "category": "Types of Collocation",
    "head_word": "blissfully",
    "tail_chunk": "unaware",
    "full_phrase": "blissfully unaware",
    "meaning_vi": "hoàn toàn không hay biết (thường về điều khó chịu sắp xảy ra)",
    "example_sentence": "Harry was blissfully unaware that a surprise party was being planned for him.",
    "distractors": [
      "happily unaware",
      "joyfully unaware",
      "completely unaware"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Human Behavior"
  },
  {
    "id": "colloc-cambridge-057",
    "category": "Register: Spoken English",
    "head_word": "bored",
    "tail_chunk": "stiff",
    "full_phrase": "bored stiff",
    "meaning_vi": "chán chết đi được, cực kỳ chán",
    "example_sentence": "He was bored stiff during the long lecture.",
    "distractors": [
      "bored hard",
      "bored heavy",
      "bored strong"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Everyday Communication"
  },
  {
    "id": "colloc-cambridge-058",
    "category": "Register: Spoken English",
    "head_word": "badly",
    "tail_chunk": "need",
    "full_phrase": "badly need",
    "meaning_vi": "rất cần",
    "example_sentence": "She badly needs a vacation after working all month.",
    "distractors": [
      "heavily need",
      "strongly need",
      "deeply need"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Communication"
  },
  {
    "id": "colloc-cambridge-059",
    "category": "Register: Business English",
    "head_word": "submit",
    "tail_chunk": "a tender",
    "full_phrase": "submit a tender",
    "meaning_vi": "nộp đơn thầu, bỏ thầu",
    "example_sentence": "The construction company decided to submit a tender for the new bridge project.",
    "distractors": [
      "give a tender",
      "make a tender",
      "offer a tender"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Business & Work"
  },
  {
    "id": "colloc-cambridge-060",
    "category": "Register: Business English",
    "head_word": "raise",
    "tail_chunk": "capital",
    "full_phrase": "raise capital",
    "meaning_vi": "huy động vốn",
    "example_sentence": "The startup needs to raise capital before launching the new app.",
    "distractors": [
      "rise capital",
      "make capital",
      "get up capital"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Business & Work"
  },
  {
    "id": "colloc-cambridge-061",
    "category": "Register: Business English",
    "head_word": "go into",
    "tail_chunk": "partnership",
    "full_phrase": "go into partnership",
    "meaning_vi": "hợp tác kinh doanh, hùn hạp",
    "example_sentence": "He decided to go into partnership with his former colleague.",
    "distractors": [
      "make partnership",
      "enter partnership",
      "do partnership"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Business & Work"
  },
  {
    "id": "colloc-cambridge-062",
    "category": "Register: Business English",
    "head_word": "start up",
    "tail_chunk": "a business",
    "full_phrase": "start up a business",
    "meaning_vi": "khởi nghiệp, bắt đầu kinh doanh",
    "example_sentence": "She wants to start up a business selling handmade crafts.",
    "distractors": [
      "make a business",
      "open a business",
      "create a business"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Business & Work"
  },
  {
    "id": "colloc-cambridge-063",
    "category": "Register: Newspaper English",
    "head_word": "axe",
    "tail_chunk": "jobs",
    "full_phrase": "axe jobs",
    "meaning_vi": "cắt giảm việc làm (hàng loạt)",
    "example_sentence": "The local factory is planning to axe hundreds of jobs next month.",
    "distractors": [
      "cut jobs",
      "delete jobs",
      "remove jobs"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Business & Work"
  },
  {
    "id": "colloc-cambridge-064",
    "category": "Register: Newspaper English",
    "head_word": "slash",
    "tail_chunk": "prices",
    "full_phrase": "slash prices",
    "meaning_vi": "cắt giảm giá mạnh",
    "example_sentence": "The supermarket decided to slash prices for the holiday season.",
    "distractors": [
      "reduce prices",
      "lower prices",
      "decrease prices"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Consumerism"
  },
  {
    "id": "colloc-cambridge-065",
    "category": "Register: Newspaper English",
    "head_word": "government",
    "tail_chunk": "spending",
    "full_phrase": "government spending",
    "meaning_vi": "chi tiêu của chính phủ",
    "example_sentence": "Government spending on healthcare has increased significantly this year.",
    "distractors": [
      "state spending",
      "public spending",
      "official spending"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Government & Society"
  },
  {
    "id": "colloc-cambridge-066",
    "category": "Register: Newspaper English",
    "head_word": "crack down",
    "tail_chunk": "on speeding",
    "full_phrase": "crack down on speeding",
    "meaning_vi": "trấn áp, xử lý nghiêm tình trạng chạy quá tốc độ",
    "example_sentence": "The local police will crack down on speeding in residential areas.",
    "distractors": [
      "hit down on speeding",
      "strike down on speeding",
      "beat down on speeding"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Crime & Law"
  },
  {
    "id": "colloc-cambridge-067",
    "category": "Intensifying Adverbs",
    "head_word": "highly",
    "tail_chunk": "unlikely",
    "full_phrase": "highly unlikely",
    "meaning_vi": "rất khó xảy ra",
    "example_sentence": "It is highly unlikely that I will finish my work on time.",
    "distractors": [
      "very unlikely",
      "utterly unlikely",
      "deeply unlikely"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Academic Writing"
  },
  {
    "id": "colloc-cambridge-068",
    "category": "Intensifying Adverbs",
    "head_word": "highly",
    "tail_chunk": "unusual",
    "full_phrase": "highly unusual",
    "meaning_vi": "rất bất thường",
    "example_sentence": "Julia's highly unusual behaviour began to worry her parents.",
    "distractors": [
      "bitterly unusual",
      "strongly unusual",
      "utterly unusual"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-069",
    "category": "Intensifying Adverbs",
    "head_word": "absolutely",
    "tail_chunk": "stupid",
    "full_phrase": "absolutely stupid",
    "meaning_vi": "vô cùng ngốc nghếch, cực kỳ ngu ngốc",
    "example_sentence": "It was an absolutely stupid comment to make during the meeting.",
    "distractors": [
      "very stupid",
      "deeply stupid",
      "highly stupid"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-070",
    "category": "Intensifying Adverbs",
    "head_word": "utterly",
    "tail_chunk": "devastated",
    "full_phrase": "utterly devastated",
    "meaning_vi": "hoàn toàn tàn phá, suy sụp hoàn toàn",
    "example_sentence": "The whole area was utterly devastated after the earthquake.",
    "distractors": [
      "very devastated",
      "highly devastated",
      "bitterly devastated"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-071",
    "category": "Intensifying Adverbs",
    "head_word": "bitterly",
    "tail_chunk": "disappointed",
    "full_phrase": "bitterly disappointed",
    "meaning_vi": "vô cùng thất vọng, cay đắng thất vọng",
    "example_sentence": "I was bitterly disappointed when I failed the exam.",
    "distractors": [
      "very disappointed",
      "strongly disappointed",
      "deeply disappointed"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Emotions"
  },
  {
    "id": "colloc-cambridge-072",
    "category": "Intensifying Adverbs",
    "head_word": "deeply",
    "tail_chunk": "committed",
    "full_phrase": "deeply committed",
    "meaning_vi": "hết lòng tận tụy, cam kết sâu sắc",
    "example_sentence": "Professor McDellvit was always deeply committed to her students.",
    "distractors": [
      "very committed",
      "utterly committed",
      "bitterly committed"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Work & Study"
  },
  {
    "id": "colloc-cambridge-073",
    "category": "Intensifying Adverbs",
    "head_word": "ridiculously",
    "tail_chunk": "expensive",
    "full_phrase": "ridiculously expensive",
    "meaning_vi": "đắt đỏ một cách vô lý",
    "example_sentence": "The restaurant was ridiculously expensive, so we did not order much.",
    "distractors": [
      "very expensive",
      "strongly expensive",
      "utterly expensive"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Consumerism"
  },
  {
    "id": "colloc-cambridge-074",
    "category": "Intensifying Adverbs",
    "head_word": "strongly",
    "tail_chunk": "recommend",
    "full_phrase": "strongly recommend",
    "meaning_vi": "kịch liệt giới thiệu, kiên quyết khuyên nhủ",
    "example_sentence": "I would strongly recommend that you learn a foreign language.",
    "distractors": [
      "highly recommend",
      "deeply recommend",
      "utterly recommend"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Academic Writing"
  },
  {
    "id": "colloc-cambridge-075",
    "category": "Intensifying Adverbs",
    "head_word": "strongly",
    "tail_chunk": "oppose",
    "full_phrase": "strongly oppose",
    "meaning_vi": "kịch liệt phản đối",
    "example_sentence": "Local residents strongly oppose the construction of the new factory.",
    "distractors": [
      "deeply oppose",
      "utterly oppose",
      "ridiculously oppose"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Society"
  },
  {
    "id": "colloc-cambridge-076",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "do",
    "tail_chunk": "your best",
    "full_phrase": "do your best",
    "meaning_vi": "làm hết sức mình",
    "example_sentence": "All that matters in the exam is to do your best.",
    "distractors": [
      "make your best",
      "give your best",
      "take your best"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-077",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "do",
    "tail_chunk": "damage",
    "full_phrase": "do damage",
    "meaning_vi": "gây thiệt hại",
    "example_sentence": "The storm did some damage to our roof.",
    "distractors": [
      "make damage",
      "cause damage to roof",
      "create damage"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-078",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "do",
    "tail_chunk": "an experiment",
    "full_phrase": "do an experiment",
    "meaning_vi": "làm thí nghiệm",
    "example_sentence": "We are doing an experiment to test how the metal reacts with water.",
    "distractors": [
      "make an experiment",
      "perform an experiment",
      "take an experiment"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Science & Technology"
  },
  {
    "id": "colloc-cambridge-079",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "do",
    "tail_chunk": "someone a favour",
    "full_phrase": "do someone a favour",
    "meaning_vi": "giúp ai đó một việc",
    "example_sentence": "Could you do me a favour and pick me up some milk from the supermarket?",
    "distractors": [
      "make someone a favour",
      "give someone a favour",
      "take someone a favour"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-080",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "do",
    "tail_chunk": "harm",
    "full_phrase": "do harm",
    "meaning_vi": "gây hại",
    "example_sentence": "Changing the rules may do more harm than good.",
    "distractors": [
      "make harm",
      "give harm",
      "cause harm"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-081",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "do",
    "tail_chunk": "the washing",
    "full_phrase": "do the washing",
    "meaning_vi": "giặt quần áo",
    "example_sentence": "I’ll do the washing if you do the ironing.",
    "distractors": [
      "make the washing",
      "clean the washing",
      "wash the washing"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-082",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "make",
    "tail_chunk": "arrangements",
    "full_phrase": "make arrangements",
    "meaning_vi": "sắp xếp, chuẩn bị",
    "example_sentence": "The school can make arrangements for pupils with special needs.",
    "distractors": [
      "do arrangements",
      "take arrangements",
      "have arrangements"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-083",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "make",
    "tail_chunk": "a choice",
    "full_phrase": "make a choice",
    "meaning_vi": "đưa ra sự lựa chọn",
    "example_sentence": "Amelia had to make a choice between her career and her family.",
    "distractors": [
      "do a choice",
      "take a choice",
      "give a choice"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-084",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "make",
    "tail_chunk": "a comment",
    "full_phrase": "make a comment",
    "meaning_vi": "đưa ra bình luận",
    "example_sentence": "Would anyone like to make any comments on the talk?",
    "distractors": [
      "do a comment",
      "say a comment",
      "speak a comment"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Communication"
  },
  {
    "id": "colloc-cambridge-085",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "make",
    "tail_chunk": "a contribution",
    "full_phrase": "make a contribution",
    "meaning_vi": "đóng góp",
    "example_sentence": "She made a useful contribution to the discussion.",
    "distractors": [
      "do a contribution",
      "give a contribution",
      "take a contribution"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Academic Writing"
  },
  {
    "id": "colloc-cambridge-086",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "make",
    "tail_chunk": "a decision",
    "full_phrase": "make a decision",
    "meaning_vi": "đưa ra quyết định",
    "example_sentence": "I’m glad it’s you who has to make the decision, not me.",
    "distractors": [
      "do a decision",
      "take a decision",
      "give a decision"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-087",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "make",
    "tail_chunk": "an excuse",
    "full_phrase": "make an excuse",
    "meaning_vi": "viện cớ",
    "example_sentence": "I’m too tired to go out tonight. Let’s make an excuse and stay at home.",
    "distractors": [
      "do an excuse",
      "give an excuse",
      "take an excuse"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-088",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "make",
    "tail_chunk": "friends",
    "full_phrase": "make friends",
    "meaning_vi": "kết bạn",
    "example_sentence": "Caroline is very good at making friends.",
    "distractors": [
      "do friends",
      "find friends",
      "get friends"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-089",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "make",
    "tail_chunk": "a mistake",
    "full_phrase": "make a mistake",
    "meaning_vi": "mắc lỗi",
    "example_sentence": "They’ve made a mistake in our bill.",
    "distractors": [
      "do a mistake",
      "commit a mistake",
      "have a mistake"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-090",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "make",
    "tail_chunk": "a phone call",
    "full_phrase": "make a phone call",
    "meaning_vi": "gọi điện thoại",
    "example_sentence": "I’ve got to make some phone calls before dinner.",
    "distractors": [
      "do a phone call",
      "have a phone call",
      "take a phone call"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Technology & Communication"
  },
  {
    "id": "colloc-cambridge-091",
    "category": "Everyday Verbs: Make/Do",
    "head_word": "make",
    "tail_chunk": "progress",
    "full_phrase": "make progress",
    "meaning_vi": "tiến bộ",
    "example_sentence": "Holly is making progress with all her schoolwork.",
    "distractors": [
      "do progress",
      "have progress",
      "take progress"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Work & Study"
  },
  {
    "id": "colloc-cambridge-092",
    "category": "Everyday Verbs: Changes",
    "head_word": "go",
    "tail_chunk": "mad",
    "full_phrase": "go mad",
    "meaning_vi": "trở nên phát điên",
    "example_sentence": "Some people say you go mad if you live in complete isolation.",
    "distractors": [
      "get mad",
      "become mad",
      "turn mad"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-093",
    "category": "Everyday Verbs: Changes",
    "head_word": "go",
    "tail_chunk": "bald",
    "full_phrase": "go bald",
    "meaning_vi": "bị hói đầu",
    "example_sentence": "Many men tend to go bald as they grow older.",
    "distractors": [
      "get bald",
      "become bald",
      "turn bald"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-094",
    "category": "Everyday Verbs: Changes",
    "head_word": "go",
    "tail_chunk": "grey",
    "full_phrase": "go grey",
    "meaning_vi": "bạc tóc, chuyển sang màu xám",
    "example_sentence": "His hair began to go grey in his early thirties.",
    "distractors": [
      "get grey",
      "become grey",
      "make grey"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-095",
    "category": "Everyday Verbs: Changes",
    "head_word": "go",
    "tail_chunk": "blind",
    "full_phrase": "go blind",
    "meaning_vi": "bị mù",
    "example_sentence": "Without proper treatment, the disease can cause patients to go blind.",
    "distractors": [
      "get blind",
      "turn blind",
      "have blind"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Health"
  },
  {
    "id": "colloc-cambridge-096",
    "category": "Everyday Verbs: Changes",
    "head_word": "go",
    "tail_chunk": "deaf",
    "full_phrase": "go deaf",
    "meaning_vi": "bị điếc",
    "example_sentence": "Working in a noisy factory for years caused him to go deaf.",
    "distractors": [
      "get deaf",
      "turn deaf",
      "become deaf"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Health"
  },
  {
    "id": "colloc-cambridge-097",
    "category": "Everyday Verbs: Changes",
    "head_word": "turn",
    "tail_chunk": "red",
    "full_phrase": "turn red",
    "meaning_vi": "đỏ mặt",
    "example_sentence": "Her face turned red when everyone started singing happy birthday to her.",
    "distractors": [
      "go red",
      "get red",
      "make red"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-098",
    "category": "Everyday Verbs: Changes",
    "head_word": "turn",
    "tail_chunk": "white",
    "full_phrase": "turn white",
    "meaning_vi": "chuyển sang màu trắng",
    "example_sentence": "The terrifying news caused her hair to turn white overnight.",
    "distractors": [
      "go white",
      "get white",
      "become white"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-099",
    "category": "Everyday Verbs: Changes",
    "head_word": "become",
    "tail_chunk": "pregnant",
    "full_phrase": "become pregnant",
    "meaning_vi": "mang thai",
    "example_sentence": "She decided to quit her job after she became pregnant.",
    "distractors": [
      "get pregnant",
      "make pregnant",
      "have pregnant"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Health"
  },
  {
    "id": "colloc-cambridge-100",
    "category": "Everyday Verbs: Changes",
    "head_word": "become",
    "tail_chunk": "involved in",
    "full_phrase": "become involved in",
    "meaning_vi": "tham gia vào, vướng vào",
    "example_sentence": "I would like to become involved in raising money for environmental charities.",
    "distractors": [
      "get involved in",
      "make involved in",
      "take involved in"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Society"
  },
  {
    "id": "colloc-cambridge-101",
    "category": "Everyday Verbs: Changes",
    "head_word": "become",
    "tail_chunk": "depressed",
    "full_phrase": "become depressed",
    "meaning_vi": "trở nên trầm cảm, chán nản",
    "example_sentence": "Many people tend to become depressed during the dark winter months.",
    "distractors": [
      "get depressed",
      "go depressed",
      "turn depressed"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Health"
  },
  {
    "id": "colloc-cambridge-102",
    "category": "Everyday Verbs: Changes",
    "head_word": "become",
    "tail_chunk": "extinct",
    "full_phrase": "become extinct",
    "meaning_vi": "tuyệt chủng",
    "example_sentence": "Numerous species of animals have become extinct due to human activities.",
    "distractors": [
      "get extinct",
      "go extinct",
      "turn extinct"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-103",
    "category": "Everyday Verbs: Changes",
    "head_word": "become",
    "tail_chunk": "homeless",
    "full_phrase": "become homeless",
    "meaning_vi": "trở thành người vô gia cư",
    "example_sentence": "Thousands of people could become homeless if the natural disaster strikes.",
    "distractors": [
      "get homeless",
      "go homeless",
      "make homeless"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Society"
  },
  {
    "id": "colloc-cambridge-104",
    "category": "Everyday Verbs: Changes",
    "head_word": "become",
    "tail_chunk": "famous",
    "full_phrase": "become famous",
    "meaning_vi": "trở nên nổi tiếng",
    "example_sentence": "Their local bakery has become famous for its delicious apple tarts.",
    "distractors": [
      "get famous",
      "make famous",
      "turn famous"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Media & Culture"
  },
  {
    "id": "colloc-cambridge-105",
    "category": "Everyday Verbs: Changes",
    "head_word": "fall",
    "tail_chunk": "ill",
    "full_phrase": "fall ill",
    "meaning_vi": "đổ bệnh",
    "example_sentence": "He fell ill unexpectedly and had to be rushed to the hospital.",
    "distractors": [
      "get ill",
      "become ill",
      "make ill"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Health"
  },
  {
    "id": "colloc-cambridge-106",
    "category": "Everyday Verbs: Changes",
    "head_word": "fall",
    "tail_chunk": "silent",
    "full_phrase": "fall silent",
    "meaning_vi": "trở nên im lặng",
    "example_sentence": "The entire auditorium fell silent when the shocking news was announced.",
    "distractors": [
      "get silent",
      "go silent",
      "turn silent"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-107",
    "category": "Everyday Verbs: Changes",
    "head_word": "grow",
    "tail_chunk": "older",
    "full_phrase": "grow older",
    "meaning_vi": "trở nên già đi",
    "example_sentence": "As my father grew older, he preferred to spend more time relaxing at home.",
    "distractors": [
      "get older",
      "become older",
      "make older"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Lifestyle"
  },
  {
    "id": "colloc-cambridge-108",
    "category": "Everyday Verbs: Have/Take/Pay",
    "head_word": "have",
    "tail_chunk": "an accident",
    "full_phrase": "have an accident",
    "meaning_vi": "gặp tai nạn",
    "example_sentence": "Mr Grey had an accident last night but he is OK now.",
    "distractors": [
      "make an accident",
      "get an accident",
      "do an accident"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-109",
    "category": "Everyday Verbs: Have/Take/Pay",
    "head_word": "have",
    "tail_chunk": "an argument",
    "full_phrase": "have an argument",
    "meaning_vi": "tranh cãi, cãi nhau",
    "example_sentence": "We had an argument about how to fix the car.",
    "distractors": [
      "make an argument",
      "do an argument",
      "give an argument"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-110",
    "category": "Everyday Verbs: Have/Take/Pay",
    "head_word": "have",
    "tail_chunk": "a break",
    "full_phrase": "have a break",
    "meaning_vi": "nghỉ giải lao",
    "example_sentence": "Let's have a break when you finish this exercise.",
    "distractors": [
      "make a break",
      "do a break",
      "take a break"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-111",
    "category": "Everyday Verbs: Have/Take/Pay",
    "head_word": "have",
    "tail_chunk": "difficulty",
    "full_phrase": "have difficulty",
    "meaning_vi": "gặp khó khăn",
    "example_sentence": "The class had difficulty understanding what to do.",
    "distractors": [
      "make difficulty",
      "do difficulty",
      "get difficulty"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-112",
    "category": "Everyday Verbs: Have/Take/Pay",
    "head_word": "have",
    "tail_chunk": "fun",
    "full_phrase": "have fun",
    "meaning_vi": "vui vẻ",
    "example_sentence": "I'm sure you'll have fun on the school trip.",
    "distractors": [
      "make fun",
      "do fun",
      "get fun"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-113",
    "category": "Everyday Verbs: Have/Take/Pay",
    "head_word": "pay",
    "tail_chunk": "attention",
    "full_phrase": "pay attention",
    "meaning_vi": "chú ý",
    "example_sentence": "You must pay attention to the teacher.",
    "distractors": [
      "give attention",
      "make attention",
      "spend attention"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-114",
    "category": "Everyday Verbs: Have/Take/Pay",
    "head_word": "pay",
    "tail_chunk": "a compliment",
    "full_phrase": "pay a compliment",
    "meaning_vi": "khen ngợi, ca tụng",
    "example_sentence": "I was trying to pay her a compliment but she misunderstood.",
    "distractors": [
      "give a compliment",
      "make a compliment",
      "say a compliment"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-115",
    "category": "Everyday Verbs: Have/Take/Pay",
    "head_word": "pay",
    "tail_chunk": "tribute",
    "full_phrase": "pay tribute",
    "meaning_vi": "tỏ lòng thành kính, tri ân",
    "example_sentence": "When Jack retired, his boss made a speech paying tribute to all he had done.",
    "distractors": [
      "give tribute",
      "make tribute",
      "do tribute"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Academic Writing"
  },
  {
    "id": "colloc-cambridge-116",
    "category": "Everyday Verbs: Have/Take/Pay",
    "head_word": "take",
    "tail_chunk": "a holiday",
    "full_phrase": "take a holiday",
    "meaning_vi": "đi nghỉ mát, nghỉ lễ",
    "example_sentence": "We're so glad we decided to take a holiday here.",
    "distractors": [
      "make a holiday",
      "have a holiday",
      "do a holiday"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-117",
    "category": "Everyday Verbs: Have/Take/Pay",
    "head_word": "take",
    "tail_chunk": "a trip",
    "full_phrase": "take a trip",
    "meaning_vi": "đi du lịch, đi chơi",
    "example_sentence": "Yesterday we took a trip to the mountains.",
    "distractors": [
      "make a trip",
      "go a trip",
      "do a trip"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-118",
    "category": "Everyday Verbs: Have/Take/Pay",
    "head_word": "take",
    "tail_chunk": "a risk",
    "full_phrase": "take a risk",
    "meaning_vi": "liều lĩnh, chịu rủi ro",
    "example_sentence": "We were taking a risk as we didn't know exactly what we'd find there.",
    "distractors": [
      "make a risk",
      "have a risk",
      "do a risk"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-119",
    "category": "Everyday Verbs: Have/Take/Pay",
    "head_word": "take",
    "tail_chunk": "advantage",
    "full_phrase": "take advantage",
    "meaning_vi": "tận dụng cơ hội",
    "example_sentence": "Take advantage of being in London as there are always plenty of jobs.",
    "distractors": [
      "make advantage",
      "have advantage",
      "get advantage"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Work & Study"
  },
  {
    "id": "colloc-cambridge-120",
    "category": "Everyday Verbs: Have/Take/Pay",
    "head_word": "take",
    "tail_chunk": "action",
    "full_phrase": "take action",
    "meaning_vi": "hành động",
    "example_sentence": "You'll soon find something else, so take action, that's my advice.",
    "distractors": [
      "make action",
      "do action",
      "give action"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-121",
    "category": "Synonyms and confusable words",
    "head_word": "ancient",
    "tail_chunk": "history",
    "full_phrase": "ancient history",
    "meaning_vi": "lịch sử cổ đại",
    "example_sentence": "She studied ancient history at university.",
    "distractors": [
      "old history",
      "antique history",
      "elderly history"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Academic Study"
  },
  {
    "id": "colloc-cambridge-122",
    "category": "Synonyms and confusable words",
    "head_word": "antique",
    "tail_chunk": "furniture",
    "full_phrase": "antique furniture",
    "meaning_vi": "đồ nội thất cổ",
    "example_sentence": "This luxury shop sells expensive antique furniture.",
    "distractors": [
      "old furniture",
      "ancient furniture",
      "elderly furniture"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Everyday Life"
  },
  {
    "id": "colloc-cambridge-123",
    "category": "Synonyms and confusable words",
    "head_word": "elderly",
    "tail_chunk": "person",
    "full_phrase": "elderly person",
    "meaning_vi": "người cao tuổi",
    "example_sentence": "I helped an elderly person who was trying to cross the busy road.",
    "distractors": [
      "old person",
      "ancient person",
      "antique person"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Society"
  },
  {
    "id": "colloc-cambridge-124",
    "category": "Synonyms and confusable words",
    "head_word": "single",
    "tail_chunk": "parent",
    "full_phrase": "single parent",
    "meaning_vi": "cha/mẹ đơn thân",
    "example_sentence": "Donna is a single parent; it’s difficult for her to work full time.",
    "distractors": [
      "sole parent",
      "alone parent",
      "lonely parent"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Family"
  },
  {
    "id": "colloc-cambridge-125",
    "category": "Synonyms and confusable words",
    "head_word": "sole",
    "tail_chunk": "survivor",
    "full_phrase": "sole survivor",
    "meaning_vi": "người sống sót duy nhất",
    "example_sentence": "She was the sole survivor of the tragic plane crash.",
    "distractors": [
      "only survivor",
      "single survivor",
      "lonely survivor"
    ],
    "cefr_level": "C1",
    "ielts_topic": "News and Current Affairs"
  },
  {
    "id": "colloc-cambridge-126",
    "category": "Synonyms and confusable words",
    "head_word": "only",
    "tail_chunk": "child",
    "full_phrase": "only child",
    "meaning_vi": "con một",
    "example_sentence": "I am an only child; I sometimes wonder what it would be like to have a sibling.",
    "distractors": [
      "single child",
      "sole child",
      "alone child"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Family"
  },
  {
    "id": "colloc-cambridge-127",
    "category": "Synonyms and confusable words",
    "head_word": "close",
    "tail_chunk": "meeting",
    "full_phrase": "close a meeting",
    "meaning_vi": "tuyên bố bế mạc cuộc họp",
    "example_sentence": "The chairperson closed the meeting at 4.30 pm.",
    "distractors": [
      "shut a meeting",
      "end a meeting",
      "finish a meeting"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Work & Study"
  },
  {
    "id": "colloc-cambridge-128",
    "category": "Synonyms and confusable words",
    "head_word": "start",
    "tail_chunk": "car",
    "full_phrase": "start a car",
    "meaning_vi": "khởi động xe ô tô",
    "example_sentence": "It was a cold winter morning and I could not start my car.",
    "distractors": [
      "begin a car",
      "make a car",
      "turn a car"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Life"
  },
  {
    "id": "colloc-cambridge-129",
    "category": "Synonyms and confusable words",
    "head_word": "charge",
    "tail_chunk": "phone",
    "full_phrase": "charge a phone",
    "meaning_vi": "sạc điện thoại",
    "example_sentence": "I need to charge my phone before I leave the house.",
    "distractors": [
      "load a phone",
      "power a phone",
      "fill a phone"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Technology"
  },
  {
    "id": "colloc-cambridge-130",
    "category": "Synonyms and confusable words",
    "head_word": "grow",
    "tail_chunk": "crops",
    "full_phrase": "grow crops",
    "meaning_vi": "trồng hoa màu",
    "example_sentence": "In the fertile south, the local farmers grow various crops.",
    "distractors": [
      "raise crops",
      "plant crops",
      "make crops"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment & Agriculture"
  },
  {
    "id": "colloc-cambridge-131",
    "category": "Synonyms and confusable words",
    "head_word": "raise",
    "tail_chunk": "cattle",
    "full_phrase": "raise cattle",
    "meaning_vi": "chăn nuôi gia súc",
    "example_sentence": "In the northern region, farmers mostly raise cattle for meat and dairy.",
    "distractors": [
      "grow cattle",
      "feed cattle",
      "keep cattle"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment & Agriculture"
  },
  {
    "id": "colloc-cambridge-132",
    "category": "Synonyms and confusable words",
    "head_word": "gain",
    "tail_chunk": "power, control, access",
    "full_phrase": "gain control",
    "meaning_vi": "giành quyền kiểm soát",
    "example_sentence": "The Socialist Party gained control of the National Assembly.",
    "distractors": [
      "win control",
      "make control",
      "earn control"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Politics & Society"
  },
  {
    "id": "colloc-cambridge-133",
    "category": "Synonyms and confusable words",
    "head_word": "gain",
    "tail_chunk": "a reputation, publicity, recognition, an advantage",
    "full_phrase": "gain recognition",
    "meaning_vi": "đạt được sự công nhận, thừa nhận",
    "example_sentence": "Her paintings gained recognition thanks to a major exhibition in New York.",
    "distractors": [
      "win recognition",
      "make recognition",
      "earn recognition"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts & Media"
  },
  {
    "id": "colloc-cambridge-134",
    "category": "Synonyms and confusable words",
    "head_word": "win",
    "tail_chunk": "an award, a prize, a medal, a match",
    "full_phrase": "win a medal",
    "meaning_vi": "giành huy chương",
    "example_sentence": "He won a medal in the 2016 Olympic Games.",
    "distractors": [
      "gain a medal",
      "earn a medal",
      "make a medal"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Sports & Competition"
  },
  {
    "id": "colloc-cambridge-135",
    "category": "Synonyms and confusable words",
    "head_word": "win",
    "tail_chunk": "a battle, a war, an election",
    "full_phrase": "win an election",
    "meaning_vi": "thắng cử, chiến thắng bầu cử",
    "example_sentence": "The Conservative Party won the 2015 General Election.",
    "distractors": [
      "gain an election",
      "earn an election",
      "achieve an election"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Politics & Society"
  },
  {
    "id": "colloc-cambridge-136",
    "category": "Synonyms and confusable words",
    "head_word": "earn",
    "tail_chunk": "a salary, money",
    "full_phrase": "earn a salary",
    "meaning_vi": "kiếm tiền lương",
    "example_sentence": "She works hard every day to earn a good salary.",
    "distractors": [
      "win a salary",
      "gain a salary",
      "make a salary"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Work & Career"
  },
  {
    "id": "colloc-cambridge-137",
    "category": "Synonyms and confusable words",
    "head_word": "make",
    "tail_chunk": "a profit, money",
    "full_phrase": "make a profit",
    "meaning_vi": "kiếm lợi nhuận",
    "example_sentence": "The company made a profit last year despite the economic downturn.",
    "distractors": [
      "win a profit",
      "gain a profit",
      "earn a profit"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Business & Economics"
  },
  {
    "id": "colloc-cambridge-138",
    "category": "Synonyms and confusable words",
    "head_word": "achieve",
    "tail_chunk": "success, your goals, your aims",
    "full_phrase": "achieve success",
    "meaning_vi": "đạt được thành công",
    "example_sentence": "It is difficult to achieve success in international sport without total dedication.",
    "distractors": [
      "win success",
      "gain success",
      "make success"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Personal Development"
  },
  {
    "id": "colloc-cambridge-139",
    "category": "Synonyms and confusable words",
    "head_word": "beat",
    "tail_chunk": "a team, an opponent",
    "full_phrase": "beat an opponent",
    "meaning_vi": "đánh bại đối thủ",
    "example_sentence": "He successfully defeated his opponent in the tennis final.",
    "distractors": [
      "win an opponent",
      "gain an opponent",
      "earn an opponent"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Sports & Competition"
  },
  {
    "id": "colloc-cambridge-140",
    "category": "Metaphor",
    "head_word": "sunny",
    "tail_chunk": "smile",
    "full_phrase": "a sunny smile",
    "meaning_vi": "nụ cười rạng rỡ, vui tươi",
    "example_sentence": "She greeted everyone in the room with a sunny smile.",
    "distractors": [
      "a bright smile",
      "a sunny laugh",
      "a sunny look"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Emotions and Personality"
  },
  {
    "id": "colloc-cambridge-141",
    "category": "Metaphor",
    "head_word": "face",
    "tail_chunk": "lights up",
    "full_phrase": "a face lights up",
    "meaning_vi": "Khuôn mặt bừng sáng, thể hiện sự vui mừng",
    "example_sentence": "Her face lights up whenever she talks about her grandchildren.",
    "distractors": [
      "a face shines up",
      "a face glows up",
      "a face brightens up"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Emotions and Personality"
  },
  {
    "id": "colloc-cambridge-142",
    "category": "Metaphor",
    "head_word": "dark",
    "tail_chunk": "thoughts",
    "full_phrase": "dark thoughts",
    "meaning_vi": "những suy nghĩ u ám, tiêu cực",
    "example_sentence": "He sat alone in the corner, troubled by dark thoughts.",
    "distractors": [
      "black thoughts",
      "shadowy thoughts",
      "grim thoughts"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Mental Health and Psychology"
  },
  {
    "id": "colloc-cambridge-143",
    "category": "Metaphor",
    "head_word": "heated",
    "tail_chunk": "debate",
    "full_phrase": "a heated debate",
    "meaning_vi": "một cuộc tranh luận nảy lửa, căng thẳng",
    "example_sentence": "The committee engaged in a heated debate over the new budget.",
    "distractors": [
      "a hot debate",
      "a warm debate",
      "a fiery debate"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Academic Writing and Discussion"
  },
  {
    "id": "colloc-cambridge-144",
    "category": "Metaphor",
    "head_word": "fiery",
    "tail_chunk": "temper",
    "full_phrase": "a fiery temper",
    "meaning_vi": "tính khí nóng nảy, dễ nổi giận",
    "example_sentence": "He is known for having a fiery temper when things do not go as planned.",
    "distractors": [
      "a hot temper",
      "a flaming temper",
      "a burning temper"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Emotions and Personality"
  },
  {
    "id": "colloc-cambridge-145",
    "category": "Metaphor",
    "head_word": "tempers",
    "tail_chunk": "flared",
    "full_phrase": "tempers flared",
    "meaning_vi": "cơn giận bùng lên, sự tức giận bùng phát",
    "example_sentence": "Tempers flared as the argument between the two drivers continued.",
    "distractors": [
      "tempers burned",
      "tempers blazed",
      "tempers flashed"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Conflict and Resolution"
  },
  {
    "id": "colloc-cambridge-146",
    "category": "Metaphor",
    "head_word": "cheeks",
    "tail_chunk": "burn with embarrassment",
    "full_phrase": "cheeks burn with embarrassment",
    "meaning_vi": "má đỏ bừng vì xấu hổ",
    "example_sentence": "Her cheeks burned with embarrassment when she realized her mistake.",
    "distractors": [
      "cheeks glow with embarrassment",
      "cheeks fire with embarrassment",
      "cheeks shine with embarrassment"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Emotions and Personality"
  },
  {
    "id": "colloc-cambridge-147",
    "category": "Metaphor",
    "head_word": "blaze",
    "tail_chunk": "of publicity",
    "full_phrase": "a blaze of publicity",
    "meaning_vi": "sự chú ý công khai rầm rộ",
    "example_sentence": "The movie star arrived at the festival in a blaze of publicity.",
    "distractors": [
      "a flame of publicity",
      "a fire of publicity",
      "a flash of publicity"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Media and Entertainment"
  },
  {
    "id": "colloc-cambridge-148",
    "category": "Metaphor",
    "head_word": "ideas",
    "tail_chunk": "flow",
    "full_phrase": "ideas flow",
    "meaning_vi": "ý tưởng tuôn trào, trôi chảy",
    "example_sentence": "During the brainstorming session, the ideas flowed easily among team members.",
    "distractors": [
      "ideas stream",
      "ideas pour",
      "ideas run"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Work and Study"
  },
  {
    "id": "colloc-cambridge-149",
    "category": "Metaphor",
    "head_word": "floods",
    "tail_chunk": "of tears",
    "full_phrase": "floods of tears",
    "meaning_vi": "nước mắt đầm đìa, khóc như mưa",
    "example_sentence": "The child burst into floods of tears after dropping her ice cream.",
    "distractors": [
      "rivers of tears",
      "streams of tears",
      "pools of tears"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Emotions and Personality"
  },
  {
    "id": "colloc-cambridge-150",
    "category": "Metaphor",
    "head_word": "tears",
    "tail_chunk": "streaming down",
    "full_phrase": "tears streaming down someone's face",
    "meaning_vi": "nước mắt chảy ròng ròng trên mặt",
    "example_sentence": "She watched the sad movie with tears streaming down her face.",
    "distractors": [
      "tears flowing down",
      "tears pouring down",
      "tears sliding down"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Emotions and Personality"
  },
  {
    "id": "colloc-cambridge-151",
    "category": "Metaphor",
    "head_word": "stream",
    "tail_chunk": "of traffic",
    "full_phrase": "a stream of traffic",
    "meaning_vi": "dòng xe cộ nối đuôi nhau liên tục",
    "example_sentence": "There was a constant stream of traffic outside our window all night.",
    "distractors": [
      "a flow of traffic",
      "a flood of traffic",
      "a river of traffic"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel and Transport"
  },
  {
    "id": "colloc-cambridge-152",
    "category": "Topic: Weather",
    "head_word": "weather",
    "tail_chunk": "deteriorates",
    "full_phrase": "weather deteriorates",
    "meaning_vi": "thời tiết xấu đi, chuyển biến tệ hơn",
    "example_sentence": "The weather is likely to deteriorate later on today.",
    "distractors": [
      "weather breaks down",
      "weather degenerates",
      "weather reduces"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-153",
    "category": "Topic: Weather",
    "head_word": "fog",
    "tail_chunk": "thick / dense",
    "full_phrase": "dense fog",
    "meaning_vi": "sương mù dày đặc",
    "example_sentence": "Dense fog caused serious traffic delays on the motorway this morning.",
    "distractors": [
      "hard fog",
      "solid fog",
      "strong fog"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-154",
    "category": "Topic: Weather",
    "head_word": "patches",
    "tail_chunk": "of fog",
    "full_phrase": "patches of fog",
    "meaning_vi": "từng dải/vạt sương mù rải rác",
    "example_sentence": "There were patches of fog on the east coast, but they cleared by noon.",
    "distractors": [
      "pieces of fog",
      "slices of fog",
      "parts of fog"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-155",
    "category": "Topic: Weather",
    "head_word": "blanket",
    "tail_chunk": "of fog",
    "full_phrase": "a blanket of fog",
    "meaning_vi": "lớp sương mù dày bao phủ diện rộng",
    "example_sentence": "A thick blanket of fog covered the entire valley overnight.",
    "distractors": [
      "a carpet of fog",
      "a sheet of fog",
      "a curtain of fog"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-156",
    "category": "Topic: Weather",
    "head_word": "fog",
    "tail_chunk": "lifts",
    "full_phrase": "fog lifts",
    "meaning_vi": "sương mù tan đi",
    "example_sentence": "The morning fog lifted as the sun began to shine warmly.",
    "distractors": [
      "fog rises",
      "fog disappears",
      "fog leaves"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-157",
    "category": "Topic: Weather",
    "head_word": "rain",
    "tail_chunk": "driving",
    "full_phrase": "driving rain",
    "meaning_vi": "mưa quất mạnh, mưa rào xối xả tạt vào mặt",
    "example_sentence": "Driving rain made visibility on the highway extremely poor.",
    "distractors": [
      "running rain",
      "rushing rain",
      "speeding rain"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-158",
    "category": "Topic: Weather",
    "head_word": "snow",
    "tail_chunk": "crisp",
    "full_phrase": "crisp snow",
    "meaning_vi": "tuyết mới rơi còn xốp và cứng",
    "example_sentence": "The crisp snow crunched pleasantly under our winter boots.",
    "distractors": [
      "crunchy snow",
      "hard snow",
      "dry snow"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-159",
    "category": "Topic: Weather",
    "head_word": "frost",
    "tail_chunk": "hard",
    "full_phrase": "hard frost",
    "meaning_vi": "sương giá đậm, sương muối nặng hạt",
    "example_sentence": "There was a hard frost last night that killed all the garden flowers.",
    "distractors": [
      "solid frost",
      "strong frost",
      "heavy frost"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-160",
    "category": "Topic: Weather",
    "head_word": "winds",
    "tail_chunk": "biting",
    "full_phrase": "biting winds",
    "meaning_vi": "gió lạnh buốt, buốt da cắt thịt",
    "example_sentence": "Biting winds swept across the barren landscape throughout January.",
    "distractors": [
      "cutting winds",
      "sharp winds",
      "stinging winds"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-161",
    "category": "Topic: Weather",
    "head_word": "wind",
    "tail_chunk": "picks up",
    "full_phrase": "wind picks up",
    "meaning_vi": "gió thổi mạnh lên",
    "example_sentence": "The wind is picking up and we should probably head indoors.",
    "distractors": [
      "wind rises up",
      "wind stands up",
      "wind takes up"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-162",
    "category": "Topic: Weather",
    "head_word": "sunshine",
    "tail_chunk": "unbroken",
    "full_phrase": "unbroken sunshine",
    "meaning_vi": "nắng chang chang không ngắt quãng, trời trong không gợn mây",
    "example_sentence": "We enjoyed a whole week of unbroken sunshine during our holiday.",
    "distractors": [
      "endless sunshine",
      "continuous sunshine",
      "unstopped sunshine"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-163",
    "category": "Topic: Weather",
    "head_word": "hot",
    "tail_chunk": "scorching",
    "full_phrase": "scorching hot",
    "meaning_vi": "nóng như thiêu như đốt",
    "example_sentence": "It was scorching hot in the afternoon, so we stayed inside.",
    "distractors": [
      "burning hot",
      "baking hot",
      "boilingly hot"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-164",
    "category": "Topic: Weather",
    "head_word": "soak up",
    "tail_chunk": "the sunshine",
    "full_phrase": "soak up the sunshine",
    "meaning_vi": "tắm nắng, tận hưởng ánh nắng chan hòa",
    "example_sentence": "Tourists love to lie by the pool and soak up the sunshine.",
    "distractors": [
      "absorb the sunshine",
      "take up the sunshine",
      "drink the sunshine"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-165",
    "category": "Topic: Weather",
    "head_word": "torrential",
    "tail_chunk": "rain",
    "full_phrase": "torrential rain",
    "meaning_vi": "mưa như trút nước, mưa tầm tã",
    "example_sentence": "Torrential rain caused severe flash floods across the province.",
    "distractors": [
      "stormy rain",
      "pouring rain",
      "cascading rain"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-166",
    "category": "Topic: Weather",
    "head_word": "freak",
    "tail_chunk": "weather conditions",
    "full_phrase": "freak weather conditions",
    "meaning_vi": "hiện tượng thời tiết dị thường, bất thường",
    "example_sentence": "Freak weather conditions brought snow to the desert region.",
    "distractors": [
      "weird weather conditions",
      "bizarre weather conditions",
      "monster weather conditions"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-167",
    "category": "Topic: Weather",
    "head_word": "gale-force",
    "tail_chunk": "winds",
    "full_phrase": "gale-force winds",
    "meaning_vi": "gió mạnh cấp bão, gió giật dữ dội",
    "example_sentence": "Gale-force winds blew down several large trees in the park.",
    "distractors": [
      "hurricane-strength winds",
      "stormy-force winds",
      "storm-power winds"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-168",
    "category": "Topic: Weather",
    "head_word": "burst",
    "tail_chunk": "banks",
    "full_phrase": "burst their banks",
    "meaning_vi": "vỡ bờ, nước tràn bờ (sông)",
    "example_sentence": "Several local rivers burst their banks after hours of torrential downpours.",
    "distractors": [
      "break their banks",
      "explode their borders",
      "overflow their edges"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-169",
    "category": "Topic: Travel",
    "head_word": "in-flight",
    "tail_chunk": "entertainment",
    "full_phrase": "in-flight entertainment",
    "meaning_vi": "giải trí trên máy bay",
    "example_sentence": "The airline offers excellent in-flight entertainment on long-haul routes.",
    "distractors": [
      "on-flight entertainment",
      "during-flight entertainment",
      "flight entertainment"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-170",
    "category": "Topic: Travel",
    "head_word": "fasten",
    "tail_chunk": "seatbelts",
    "full_phrase": "fasten seatbelts",
    "meaning_vi": "thắt dây an toàn",
    "example_sentence": "Passengers must fasten their seatbelts before the aircraft takes off.",
    "distractors": [
      "tie seatbelts",
      "lock seatbelts",
      "fix seatbelts"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-171",
    "category": "Topic: Travel",
    "head_word": "board",
    "tail_chunk": "the plane",
    "full_phrase": "board the plane",
    "meaning_vi": "lên máy bay",
    "example_sentence": "All passengers are kindly requested to board the plane immediately.",
    "distractors": [
      "get into the plane",
      "enter the plane",
      "catch the plane"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-172",
    "category": "Topic: Travel",
    "head_word": "connecting",
    "tail_chunk": "flight",
    "full_phrase": "connecting flight",
    "meaning_vi": "chuyến bay nối chuyến",
    "example_sentence": "We had to run across the airport to catch our connecting flight.",
    "distractors": [
      "linking flight",
      "joining flight",
      "transfer flight"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-173",
    "category": "Topic: Travel",
    "head_word": "window",
    "tail_chunk": "seat",
    "full_phrase": "window seat",
    "meaning_vi": "ghế cạnh cửa sổ",
    "example_sentence": "She always prefers a window seat so she can look at the clouds.",
    "distractors": [
      "glass seat",
      "wall seat",
      "side seat"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-174",
    "category": "Topic: Travel",
    "head_word": "aisle",
    "tail_chunk": "seat",
    "full_phrase": "aisle seat",
    "meaning_vi": "ghế cạnh lối đi",
    "example_sentence": "He requested an aisle seat because he likes to stretch his legs.",
    "distractors": [
      "corridor seat",
      "middle seat",
      "path seat"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-175",
    "category": "Topic: Travel",
    "head_word": "charter",
    "tail_chunk": "flight",
    "full_phrase": "charter flight",
    "meaning_vi": "chuyến bay thuê chuyến",
    "example_sentence": "They booked a cheap charter flight for their summer holiday.",
    "distractors": [
      "private flight",
      "rented flight",
      "special flight"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-176",
    "category": "Topic: Travel",
    "head_word": "scheduled",
    "tail_chunk": "flight",
    "full_phrase": "scheduled flight",
    "meaning_vi": "chuyến bay định kỳ, chuyến bay thương mại",
    "example_sentence": "A scheduled flight is usually more reliable than a budget option.",
    "distractors": [
      "regular flight",
      "fixed flight",
      "timetabled flight"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-177",
    "category": "Topic: Travel",
    "head_word": "budget",
    "tail_chunk": "accommodation",
    "full_phrase": "budget accommodation",
    "meaning_vi": "chỗ ở giá rẻ",
    "example_sentence": "Students usually look for budget accommodation when travelling abroad.",
    "distractors": [
      "cheap accommodation",
      "economy accommodation",
      "low-cost accommodation"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-178",
    "category": "Topic: Travel",
    "head_word": "make",
    "tail_chunk": "a reservation",
    "full_phrase": "make a reservation",
    "meaning_vi": "đặt chỗ trước",
    "example_sentence": "It is advisable to make a reservation before visiting popular restaurants.",
    "distractors": [
      "do a reservation",
      "take a reservation",
      "give a reservation"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-179",
    "category": "Topic: Travel",
    "head_word": "fully",
    "tail_chunk": "booked",
    "full_phrase": "fully booked",
    "meaning_vi": "đã được đặt kín chỗ",
    "example_sentence": "The hotel was fully booked for the entire summer season.",
    "distractors": [
      "completely booked",
      "totally reserved",
      "fully reserved"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-180",
    "category": "Topic: Travel",
    "head_word": "smooth",
    "tail_chunk": "flight",
    "full_phrase": "smooth flight",
    "meaning_vi": "chuyến bay suôn sẻ, êm ả",
    "example_sentence": "We had a very smooth flight with no turbulence at all.",
    "distractors": [
      "soft flight",
      "quiet flight",
      "easy flight"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-181",
    "category": "Topic: Travel",
    "head_word": "bumpy",
    "tail_chunk": "flight",
    "full_phrase": "bumpy flight",
    "meaning_vi": "chuyến bay bị xóc",
    "example_sentence": "Passengers were asked to remain seated during the bumpy flight.",
    "distractors": [
      "rough flight",
      "shaky flight",
      "hard flight"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-182",
    "category": "Topic: Travel",
    "head_word": "business",
    "tail_chunk": "travel",
    "full_phrase": "business travel",
    "meaning_vi": "đi lại vì mục đích công việc",
    "example_sentence": "Company policies have changed regarding expenses for business travel.",
    "distractors": [
      "work travel",
      "corporate travel",
      "office travel"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-183",
    "category": "Topic: Travel",
    "head_word": "return",
    "tail_chunk": "journey",
    "full_phrase": "return journey",
    "meaning_vi": "chuyến đi về",
    "example_sentence": "The return journey took longer because of heavy traffic.",
    "distractors": [
      "back journey",
      "comeback journey",
      "reverse journey"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-184",
    "category": "Topic: Travel",
    "head_word": "take",
    "tail_chunk": "a day trip",
    "full_phrase": "take a day trip",
    "meaning_vi": "đi chơi trong ngày",
    "example_sentence": "We decided to take a day trip to the nearby historic town.",
    "distractors": [
      "make a day trip",
      "do a day trip",
      "have a day trip"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-185",
    "category": "Topic: Travel",
    "head_word": "take",
    "tail_chunk": "a boat trip",
    "full_phrase": "take a boat trip",
    "meaning_vi": "đi dạo bằng thuyền",
    "example_sentence": "Tourists can take a boat trip across the lake to see the castle.",
    "distractors": [
      "make a boat trip",
      "go a boat trip",
      "ride a boat trip"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-186",
    "category": "Topic: Countryside",
    "head_word": "uninterrupted",
    "tail_chunk": "view",
    "full_phrase": "uninterrupted view",
    "meaning_vi": "tầm nhìn không bị che khuất",
    "example_sentence": "From most rooms there are uninterrupted views of the castle.",
    "distractors": [
      "unbroken view",
      "clearer view",
      "continuous view"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-187",
    "category": "Topic: Countryside",
    "head_word": "panoramic",
    "tail_chunk": "view",
    "full_phrase": "panoramic view",
    "meaning_vi": "tầm nhìn toàn cảnh",
    "example_sentence": "Diners have a panoramic view of the countryside from the top floor restaurant.",
    "distractors": [
      "wide view",
      "full view",
      "general view"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-188",
    "category": "Topic: Countryside",
    "head_word": "spectacular",
    "tail_chunk": "view",
    "full_phrase": "spectacular view",
    "meaning_vi": "cảnh quan ngoạn mục",
    "example_sentence": "From the balcony there is a spectacular view of the mountains.",
    "distractors": [
      "amazing view",
      "wonderful view",
      "beautiful view"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-189",
    "category": "Topic: Countryside",
    "head_word": "admire",
    "tail_chunk": "a view",
    "full_phrase": "admire a view",
    "meaning_vi": "ngắm cảnh",
    "example_sentence": "We stopped for a few minutes to admire the view.",
    "distractors": [
      "look a view",
      "watch a view",
      "see a view"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-190",
    "category": "Topic: Countryside",
    "head_word": "breathtaking",
    "tail_chunk": "scenery",
    "full_phrase": "breathtaking scenery",
    "meaning_vi": "phong cảnh đẹp đến nghẹt thở",
    "example_sentence": "The area has some breathtaking scenery including mountains and lakes.",
    "distractors": [
      "stunning scenery",
      "gorgeous scenery",
      "magnificent scenery"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-191",
    "category": "Topic: Countryside",
    "head_word": "dominate",
    "tail_chunk": "the landscape",
    "full_phrase": "dominate the landscape",
    "meaning_vi": "bao trùm cả phong cảnh",
    "example_sentence": "The ancient castle dominates the landscape for miles around.",
    "distractors": [
      "control the landscape",
      "cover the landscape",
      "overlook the landscape"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-192",
    "category": "Topic: Countryside",
    "head_word": "sandy",
    "tail_chunk": "beach",
    "full_phrase": "sandy beach",
    "meaning_vi": "bãi biển cát",
    "example_sentence": "The resort hotel has its own private sandy beach.",
    "distractors": [
      "sand beach",
      "sand-covered beach",
      "dusty beach"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-193",
    "category": "Topic: Countryside",
    "head_word": "secluded",
    "tail_chunk": "beach",
    "full_phrase": "secluded beach",
    "meaning_vi": "bãi biển vắng vẻ, biệt lập",
    "example_sentence": "You will love the secluded beaches along this quiet coastline.",
    "distractors": [
      "hidden beach",
      "private beach",
      "isolated beach"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-194",
    "category": "Topic: Countryside",
    "head_word": "golden",
    "tail_chunk": "sands",
    "full_phrase": "golden sands",
    "meaning_vi": "bãi cát vàng",
    "example_sentence": "You can wander for miles along the golden sands.",
    "distractors": [
      "yellow sands",
      "bright sands",
      "sunny sands"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-195",
    "category": "Topic: Countryside",
    "head_word": "tranquil",
    "tail_chunk": "countryside",
    "full_phrase": "tranquil countryside",
    "meaning_vi": "vùng quê thanh bình",
    "example_sentence": "You can quickly escape to the tranquil countryside.",
    "distractors": [
      "quiet countryside",
      "silent countryside",
      "calm countryside"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-196",
    "category": "Topic: Countryside",
    "head_word": "catch",
    "tail_chunk": "a glimpse",
    "full_phrase": "catch a glimpse",
    "meaning_vi": "nhìn thoáng qua",
    "example_sentence": "As we turned a corner, we caught a glimpse of a kingfisher.",
    "distractors": [
      "take a glimpse",
      "make a glimpse",
      "get a glimpse"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Travel"
  },
  {
    "id": "colloc-cambridge-197",
    "category": "Topic: Countryside",
    "head_word": "take",
    "tail_chunk": "a picture",
    "full_phrase": "take a picture",
    "meaning_vi": "chụp một bức ảnh",
    "example_sentence": "John tried to take a picture of the bird before it flew off.",
    "distractors": [
      "make a picture",
      "do a picture",
      "shoot a picture"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-198",
    "category": "Topic: Countryside",
    "head_word": "catch",
    "tail_chunk": "sight of",
    "full_phrase": "catch sight of",
    "meaning_vi": "thoáng thấy, bắt gặp",
    "example_sentence": "The bird caught sight of us and immediately flew off.",
    "distractors": [
      "take sight of",
      "make sight of",
      "see sight of"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Everyday Verbs"
  },
  {
    "id": "colloc-cambridge-199",
    "category": "Topic: Countryside",
    "head_word": "fall",
    "tail_chunk": "into ruin",
    "full_phrase": "fall into ruin",
    "meaning_vi": "rơi vào cảnh đổ nát, hoang tàn",
    "example_sentence": "The old abbey fell into ruin about three hundred years ago.",
    "distractors": [
      "drop into ruin",
      "go into ruin",
      "come into ruin"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-200",
    "category": "Topic: Countryside",
    "head_word": "unspoilt",
    "tail_chunk": "countryside",
    "full_phrase": "unspoilt countryside",
    "meaning_vi": "vùng nông thôn hoang sơ, chưa bị tàn phá",
    "example_sentence": "The cottage is situated in some wonderful unspoilt countryside.",
    "distractors": [
      "untouched countryside",
      "unharmed countryside",
      "pure countryside"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-201",
    "category": "Topic: Countryside",
    "head_word": "dense",
    "tail_chunk": "forest",
    "full_phrase": "dense forest",
    "meaning_vi": "rừng rậm",
    "example_sentence": "The cabin is hidden on the edge of a dense forest.",
    "distractors": [
      "thick forest",
      "heavy forest",
      "crowded forest"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-202",
    "category": "Topic: Towns and Cities",
    "head_word": "urban",
    "tail_chunk": "wasteland",
    "full_phrase": "urban wasteland",
    "meaning_vi": "vùng đất hoang hóa đô thị",
    "example_sentence": "Some of the inner-city areas have turned into an urban wasteland.",
    "distractors": [
      "city wasteland",
      "town wasteland",
      "municipal wasteland"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-203",
    "category": "Topic: Towns and Cities",
    "head_word": "no-go",
    "tail_chunk": "area",
    "full_phrase": "no-go area",
    "meaning_vi": "khu vực cấm vào, khu vực nguy hiểm",
    "example_sentence": "Certain streets have become no-go areas due to high crime rates.",
    "distractors": [
      "no-entry area",
      "forbidden area",
      "stop area"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Society"
  },
  {
    "id": "colloc-cambridge-204",
    "category": "Topic: Towns and Cities",
    "head_word": "run-down",
    "tail_chunk": "building",
    "full_phrase": "run-down building",
    "meaning_vi": "tòa nhà xuống cấp",
    "example_sentence": "The government plans to renovate many run-down buildings in the district.",
    "distractors": [
      "broken building",
      "worn building",
      "collapsed building"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Architecture"
  },
  {
    "id": "colloc-cambridge-205",
    "category": "Topic: Towns and Cities",
    "head_word": "deprived",
    "tail_chunk": "area",
    "full_phrase": "deprived area",
    "meaning_vi": "vùng thiếu thốn, khu vực nghèo khó",
    "example_sentence": "Children growing up in a deprived area often face significant social challenges.",
    "distractors": [
      "poor area",
      "poverty area",
      "disadvantaged area"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Society"
  },
  {
    "id": "colloc-cambridge-206",
    "category": "Topic: Towns and Cities",
    "head_word": "sprawling",
    "tail_chunk": "city",
    "full_phrase": "sprawling city",
    "meaning_vi": "thành phố trải rộng ngổn ngang",
    "example_sentence": "Navigating through such a sprawling city can be quite exhausting.",
    "distractors": [
      "spread city",
      "stretching city",
      "broad city"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Urbanization"
  },
  {
    "id": "colloc-cambridge-207",
    "category": "Topic: Towns and Cities",
    "head_word": "bumper-to-bumper",
    "tail_chunk": "traffic",
    "full_phrase": "bumper-to-bumper traffic",
    "meaning_vi": "giao thông ùn tắc nối đuôi nhau",
    "example_sentence": "We got stuck in bumper-to-bumper traffic on our way to work.",
    "distractors": [
      "bumper-to-bumper car",
      "bumper-to-bumper jam",
      "bumper-to-bumper road"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Transport"
  },
  {
    "id": "colloc-cambridge-208",
    "category": "Topic: Towns and Cities",
    "head_word": "exhaust",
    "tail_chunk": "fumes",
    "full_phrase": "exhaust fumes",
    "meaning_vi": "khí thải động cơ",
    "example_sentence": "The heavy exhaust fumes from buses make the air difficult to breathe.",
    "distractors": [
      "smoke fumes",
      "engine fumes",
      "car exhaust"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-209",
    "category": "Topic: Towns and Cities",
    "head_word": "incessant",
    "tail_chunk": "roar",
    "full_phrase": "incessant roar",
    "meaning_vi": "tiếng gầm rú liên tục, không dứt",
    "example_sentence": "The incessant roar of trucks kept residents awake all night.",
    "distractors": [
      "constant roar",
      "endless roar",
      "eternal roar"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Environment"
  },
  {
    "id": "colloc-cambridge-210",
    "category": "Topic: Towns and Cities",
    "head_word": "shanty",
    "tail_chunk": "town",
    "full_phrase": "shanty town",
    "meaning_vi": "khu ổ chuột",
    "example_sentence": "Many rural migrants end up living in makeshift shanty towns.",
    "distractors": [
      "cabin town",
      "hut town",
      "slum town"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Society"
  },
  {
    "id": "colloc-cambridge-211",
    "category": "Topic: Towns and Cities",
    "head_word": "cobbled",
    "tail_chunk": "street",
    "full_phrase": "cobbled street",
    "meaning_vi": "đường lát đá cuội",
    "example_sentence": "Tourists love walking along the narrow cobbled streets of the old town.",
    "distractors": [
      "stone street",
      "brick street",
      "rock street"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Tourism"
  },
  {
    "id": "colloc-cambridge-212",
    "category": "People: Character and Behaviour",
    "head_word": "play",
    "tail_chunk": "a joke/trick",
    "full_phrase": "play a joke",
    "meaning_vi": "trêu ghẹo, chơi khăm ai",
    "example_sentence": "The children played a joke on the teacher by hiding under their desks.",
    "distractors": [
      "make a joke",
      "do a joke",
      "give a joke"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-213",
    "category": "People: Character and Behaviour",
    "head_word": "take",
    "tail_chunk": "a joke",
    "full_phrase": "take a joke",
    "meaning_vi": "chịu được việc bị đùa cợt, không giận khi bị trêu",
    "example_sentence": "Fortunately, the teacher could take a joke and didn’t punish them.",
    "distractors": [
      "accept a joke",
      "get a joke",
      "make a joke"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-214",
    "category": "People: Character and Behaviour",
    "head_word": "swallow",
    "tail_chunk": "your pride",
    "full_phrase": "swallow your pride",
    "meaning_vi": "nén lòng tự ái, dẹp bỏ tôi",
    "example_sentence": "Isabella swallowed her pride and admitted that she was wrong.",
    "distractors": [
      "eat your pride",
      "bite your pride",
      "lose your pride"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-215",
    "category": "People: Character and Behaviour",
    "head_word": "throw",
    "tail_chunk": "a tantrum",
    "full_phrase": "throw a tantrum",
    "meaning_vi": "nổi cơn tam bành, hờn dỗi ăn vạ",
    "example_sentence": "The child threw a tantrum when I wouldn’t buy him any sweets.",
    "distractors": [
      "make a tantrum",
      "give a tantrum",
      "have a tantrum"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-216",
    "category": "People: Character and Behaviour",
    "head_word": "lose",
    "tail_chunk": "your patience",
    "full_phrase": "lose your patience",
    "meaning_vi": "mất kiên nhẫn, hết chịu nổi",
    "example_sentence": "Finally I lost my patience and shouted at her.",
    "distractors": [
      "miss your patience",
      "drop your patience",
      "let your patience"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-217",
    "category": "People: Character and Behaviour",
    "head_word": "come",
    "tail_chunk": "to terms with",
    "full_phrase": "come to terms with",
    "meaning_vi": "chấp nhận một thực tế phũ phàng",
    "example_sentence": "Nick has found it hard to come to terms with his illness.",
    "distractors": [
      "reach to terms with",
      "arrive to terms with",
      "get to terms with"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Health"
  },
  {
    "id": "colloc-cambridge-218",
    "category": "People: Character and Behaviour",
    "head_word": "reveal",
    "tail_chunk": "your true character",
    "full_phrase": "reveal your true character",
    "meaning_vi": "bộc lộ bản chất thật",
    "example_sentence": "Daniel’s failure to support her has certainly revealed his true character.",
    "distractors": [
      "show your true character",
      "display your true character",
      "expose your true character"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-219",
    "category": "People: Character and Behaviour",
    "head_word": "make",
    "tail_chunk": "snap decisions",
    "full_phrase": "make snap decisions",
    "meaning_vi": "đưa ra quyết định chớp nhoáng, vội vàng",
    "example_sentence": "He tends to make snap decisions without thinking carefully.",
    "distractors": [
      "take snap decisions",
      "do snap decisions",
      "give snap decisions"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Decision Making"
  },
  {
    "id": "colloc-cambridge-220",
    "category": "People: Character and Behaviour",
    "head_word": "keep",
    "tail_chunk": "your word",
    "full_phrase": "keep your word",
    "meaning_vi": "giữ lời hứa",
    "example_sentence": "She always keeps her word, so you can trust her completely.",
    "distractors": [
      "hold your word",
      "save your word",
      "make your word"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-221",
    "category": "People: Character and Behaviour",
    "head_word": "bear",
    "tail_chunk": "a grudge",
    "full_phrase": "bear a grudge",
    "meaning_vi": "mang bụng thù hằn, ôm hận",
    "example_sentence": "She is very forgiving and never bears a grudge against anyone.",
    "distractors": [
      "carry a grudge",
      "hold a grudge",
      "keep a grudge"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-222",
    "category": "Topic: Physical Appearance",
    "head_word": "short",
    "tail_chunk": "dumpy woman",
    "full_phrase": "short, dumpy woman",
    "meaning_vi": "người phụ nữ thấp và hơi béo",
    "example_sentence": "A short, dumpy woman was selling flowers at a stall on the street corner.",
    "distractors": [
      "small fat woman",
      "little chubby lady",
      "low thick female"
    ],
    "cefr_level": "B2",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-223",
    "category": "Topic: Physical Appearance",
    "head_word": "portly",
    "tail_chunk": "gentleman",
    "full_phrase": "portly gentleman",
    "meaning_vi": "quý ông béo và tròn người (thường là trung niên hoặc lớn tuổi)",
    "example_sentence": "A portly gentleman answered the door with a polite smile.",
    "distractors": [
      "fat gentleman",
      "heavy gentleman",
      "thick gentleman"
    ],
    "cefr_level": "C1",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-224",
    "category": "Topic: Physical Appearance",
    "head_word": "lanky",
    "tail_chunk": "youth",
    "full_phrase": "lanky youth",
    "meaning_vi": "thanh niên cao gầy và có dáng đi vụng về",
    "example_sentence": "A lanky youth was standing impatiently at the street corner.",
    "distractors": [
      "tall youth",
      "thin youth",
      "slender youth"
    ],
    "cefr_level": "C1",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-225",
    "category": "Topic: Physical Appearance",
    "head_word": "dishevelled",
    "tail_chunk": "hair",
    "full_phrase": "dishevelled hair",
    "meaning_vi": "mái tóc bù xù, rối tung",
    "example_sentence": "I wouldn’t like people to see me with dishevelled hair and dirty clothes.",
    "distractors": [
      "messy hair",
      "untidy hair",
      "broken hair"
    ],
    "cefr_level": "B2",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-226",
    "category": "Topic: Physical Appearance",
    "head_word": "bear",
    "tail_chunk": "a striking resemblance",
    "full_phrase": "bear a striking resemblance",
    "meaning_vi": "giống nhau một cách kỳ lạ / rất giống",
    "example_sentence": "He bears a striking resemblance to his father in both looks and personality.",
    "distractors": [
      "have a striking resemblance",
      "make a striking resemblance",
      "hold a striking resemblance"
    ],
    "cefr_level": "C1",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-227",
    "category": "Topic: Physical Appearance",
    "head_word": "striking",
    "tail_chunk": "appearance",
    "full_phrase": "striking appearance",
    "meaning_vi": "ngoại hình nổi bật, thu hút",
    "example_sentence": "The lady who entered the room had a very striking appearance.",
    "distractors": [
      "surprising appearance",
      "shocking appearance",
      "stunning look"
    ],
    "cefr_level": "B2",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-228",
    "category": "Topic: Physical Appearance",
    "head_word": "well-built",
    "tail_chunk": "body",
    "full_phrase": "well-built",
    "meaning_vi": "vạm vỡ, cường tráng",
    "example_sentence": "My father and my two older brothers are all well-built with broad shoulders.",
    "distractors": [
      "good-built",
      "strong-built",
      "nice-built"
    ],
    "cefr_level": "B2",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-229",
    "category": "Topic: Physical Appearance",
    "head_word": "broad",
    "tail_chunk": "shoulders",
    "full_phrase": "broad shoulders",
    "meaning_vi": "vai rộng",
    "example_sentence": "He is a tall man with broad shoulders and a strong frame.",
    "distractors": [
      "wide shoulders",
      "large shoulders",
      "big shoulders"
    ],
    "cefr_level": "B1",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-230",
    "category": "Topic: Physical Appearance",
    "head_word": "youthful",
    "tail_chunk": "appearance",
    "full_phrase": "youthful appearance",
    "meaning_vi": "vẻ ngoài trẻ trung",
    "example_sentence": "He still has a very youthful appearance for someone who is over forty.",
    "distractors": [
      "young appearance",
      "childish appearance",
      "boyish appearance"
    ],
    "cefr_level": "B2",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-231",
    "category": "Topic: Physical Appearance",
    "head_word": "bushy",
    "tail_chunk": "eyebrows",
    "full_phrase": "bushy eyebrows",
    "meaning_vi": "lông mày rậm",
    "example_sentence": "My brothers both have thick hair and bushy eyebrows.",
    "distractors": [
      "hairy eyebrows",
      "thick eyebrows",
      "shaggy eyebrows"
    ],
    "cefr_level": "B2",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-232",
    "category": "Topic: Physical Appearance",
    "head_word": "chubby",
    "tail_chunk": "cheeks",
    "full_phrase": "chubby cheeks",
    "meaning_vi": "má phúng phính",
    "example_sentence": "My younger brother is only two, but he’s very cute, with chubby cheeks.",
    "distractors": [
      "fat cheeks",
      "round cheeks",
      "plump cheeks"
    ],
    "cefr_level": "B1",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-233",
    "category": "Topic: Physical Appearance",
    "head_word": "jet-black",
    "tail_chunk": "hair",
    "full_phrase": "jet-black hair",
    "meaning_vi": "tóc đen nhánh",
    "example_sentence": "My mother had jet-black hair when she was younger.",
    "distractors": [
      "dark-black hair",
      "coal-black hair",
      "night-black hair"
    ],
    "cefr_level": "B2",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-234",
    "category": "Topic: Physical Appearance",
    "head_word": "fair",
    "tail_chunk": "hair",
    "full_phrase": "fair hair",
    "meaning_vi": "tóc vàng sáng / tóc sáng màu",
    "example_sentence": "On my father’s side of the family, some members have fair hair.",
    "distractors": [
      "light hair",
      "white hair",
      "blonde hair"
    ],
    "cefr_level": "B1",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-235",
    "category": "Topic: Physical Appearance",
    "head_word": "ginger",
    "tail_chunk": "hair",
    "full_phrase": "ginger hair",
    "meaning_vi": "tóc màu đỏ cam",
    "example_sentence": "Some of my relatives have natural ginger hair and freckles.",
    "distractors": [
      "red hair",
      "orange hair",
      "brown hair"
    ],
    "cefr_level": "B2",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-236",
    "category": "Topic: Physical Appearance",
    "head_word": "droopy",
    "tail_chunk": "moustache",
    "full_phrase": "droopy moustache",
    "meaning_vi": "bộ râu mép rủ xuống",
    "example_sentence": "My grandfather has a round face and a droopy moustache.",
    "distractors": [
      "hanging moustache",
      "falling moustache",
      "downward moustache"
    ],
    "cefr_level": "C1",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-237",
    "category": "Topic: Physical Appearance",
    "head_word": "oval",
    "tail_chunk": "face",
    "full_phrase": "oval face",
    "meaning_vi": "khuôn mặt trái xoan",
    "example_sentence": "She has an oval face and a delicate upturned nose.",
    "distractors": [
      "egg face",
      "round face",
      "curved face"
    ],
    "cefr_level": "B1",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-238",
    "category": "Topic: Physical Appearance",
    "head_word": "slim",
    "tail_chunk": "figure",
    "full_phrase": "slim figure",
    "meaning_vi": "vóc dáng mảnh mai",
    "example_sentence": "My older sister looks like a model and has a slim figure.",
    "distractors": [
      "thin figure",
      "skinny figure",
      "slender body"
    ],
    "cefr_level": "B2",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-239",
    "category": "Topic: Physical Appearance",
    "head_word": "slender",
    "tail_chunk": "waist",
    "full_phrase": "slender waist",
    "meaning_vi": "vòng eo thon thả",
    "example_sentence": "She wore a tight dress that highlighted her slender waist.",
    "distractors": [
      "slim waist",
      "thin waist",
      "narrow waist"
    ],
    "cefr_level": "B2",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-240",
    "category": "Topic: Physical Appearance",
    "head_word": "lovely",
    "tail_chunk": "complexion",
    "full_phrase": "lovely complexion",
    "meaning_vi": "làn da đẹp, mịn màng",
    "example_sentence": "She has a lovely complexion and clear, glowing skin.",
    "distractors": [
      "nice skin",
      "beautiful face",
      "good complexion"
    ],
    "cefr_level": "B2",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-241",
    "category": "Topic: Physical Appearance",
    "head_word": "sleek",
    "tail_chunk": "hair",
    "full_phrase": "sleek hair",
    "meaning_vi": "mái tóc mượt mà, suôn bóng",
    "example_sentence": "She has beautiful sleek, shoulder-length hair that shines in the light.",
    "distractors": [
      "smooth hair",
      "soft hair",
      "shiny hair"
    ],
    "cefr_level": "B2",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-242",
    "category": "Topic: Physical Appearance",
    "head_word": "immaculately",
    "tail_chunk": "groomed",
    "full_phrase": "immaculately groomed",
    "meaning_vi": "chải chuốt, ăn mặc chỉn chu hoàn hảo",
    "example_sentence": "She always looks professional and is immaculately groomed for every meeting.",
    "distractors": [
      "perfectly groomed",
      "neatly groomed",
      "cleanly groomed"
    ],
    "cefr_level": "C1",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-243",
    "category": "Topic: Physical Appearance",
    "head_word": "coarse",
    "tail_chunk": "hair",
    "full_phrase": "coarse hair",
    "meaning_vi": "mái tóc thô, cứng",
    "example_sentence": "I feel so ordinary next to her because I have coarse hair.",
    "distractors": [
      "rough hair",
      "hard hair",
      "thick hair"
    ],
    "cefr_level": "C1",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-244",
    "category": "Topic: Physical Appearance",
    "head_word": "broad",
    "tail_chunk": "hips",
    "full_phrase": "broad hips",
    "meaning_vi": "hông to / hông rộng",
    "example_sentence": "She thinks she has rather broad hips, but she always looks nice.",
    "distractors": [
      "wide hips",
      "large hips",
      "big hips"
    ],
    "cefr_level": "B2",
    "ielts_topic": "People and Appearance"
  },
  {
    "id": "colloc-cambridge-245",
    "category": "Topic: Family & Relationships",
    "head_word": "nuclear",
    "tail_chunk": "family",
    "full_phrase": "nuclear family",
    "meaning_vi": "gia đình hạt nhân",
    "example_sentence": "A nuclear family consists only of parents and their children.",
    "distractors": [
      "central family",
      "core family",
      "basic family"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-246",
    "category": "Topic: Family & Relationships",
    "head_word": "extended",
    "tail_chunk": "family",
    "full_phrase": "extended family",
    "meaning_vi": "gia đình đại gia đình, gia đình mở rộng",
    "example_sentence": "She lives with her extended family, including her grandparents and cousins.",
    "distractors": [
      "large family",
      "big family",
      "expanded family"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-247",
    "category": "Topic: Family & Relationships",
    "head_word": "close",
    "tail_chunk": "relatives",
    "full_phrase": "close relatives",
    "meaning_vi": "người thân gần",
    "example_sentence": "Only close relatives were invited to the small wedding ceremony.",
    "distractors": [
      "near relatives",
      "intimate relatives",
      "tight relatives"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-248",
    "category": "Topic: Family & Relationships",
    "head_word": "distant",
    "tail_chunk": "relatives",
    "full_phrase": "distant relatives",
    "meaning_vi": "họ hàng xa",
    "example_sentence": "He discovered some distant relatives living in Australia.",
    "distractors": [
      "far relatives",
      "remote relatives",
      "away relatives"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-249",
    "category": "Topic: Family & Relationships",
    "head_word": "immediate",
    "tail_chunk": "family",
    "full_phrase": "immediate family",
    "meaning_vi": "gia đình ruột thịt",
    "example_sentence": "She shares all her secrets only with her immediate family.",
    "distractors": [
      "instant family",
      "direct family",
      "first family"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-250",
    "category": "Topic: Family & Relationships",
    "head_word": "blood",
    "tail_chunk": "relative",
    "full_phrase": "blood relative",
    "meaning_vi": "người có cùng huyết thống",
    "example_sentence": "They look alike because they are blood relatives.",
    "distractors": [
      "bone relative",
      "flesh relative",
      "gene relative"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-251",
    "category": "Topic: Family & Relationships",
    "head_word": "close-knit",
    "tail_chunk": "family",
    "full_phrase": "close-knit family",
    "meaning_vi": "gia đình gắn bó khăng khít",
    "example_sentence": "They are a very close-knit family who always support each other.",
    "distractors": [
      "tight-knit family",
      "bound family",
      "close family-knit"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-252",
    "category": "Topic: Family & Relationships",
    "head_word": "dysfunctional",
    "tail_chunk": "family",
    "full_phrase": "dysfunctional family",
    "meaning_vi": "gia đình kém hòa thuận, bất ổn",
    "example_sentence": "Growing up in a dysfunctional family can affect a child's mental health.",
    "distractors": [
      "unfunctional family",
      "broken family",
      "malfunctional family"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-253",
    "category": "Topic: Family & Relationships",
    "head_word": "bitter",
    "tail_chunk": "divorce",
    "full_phrase": "bitter divorce",
    "meaning_vi": "cuộc ly hôn đầy cay đắng, tranh chấp",
    "example_sentence": "The couple went through a bitter divorce after ten years of marriage.",
    "distractors": [
      "sour divorce",
      "angry divorce",
      "hard divorce"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-254",
    "category": "Topic: Family & Relationships",
    "head_word": "broken",
    "tail_chunk": "home",
    "full_phrase": "broken home",
    "meaning_vi": "mái ấm gia đình đổ vỡ",
    "example_sentence": "He grew up in a broken home after his parents divorced when he was five.",
    "distractors": [
      "damaged home",
      "ruptured home",
      "split home"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-255",
    "category": "Topic: Family & Relationships",
    "head_word": "stable",
    "tail_chunk": "home",
    "full_phrase": "stable home",
    "meaning_vi": "mái ấm gia đình ổn định",
    "example_sentence": "Children need a stable home environment to develop properly.",
    "distractors": [
      "steady home",
      "fixed home",
      "secure home"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-256",
    "category": "Topic: Family & Relationships",
    "head_word": "confirmed",
    "tail_chunk": "bachelor",
    "full_phrase": "confirmed bachelor",
    "meaning_vi": "người đàn ông độc thân lâu năm (không muốn kết hôn)",
    "example_sentence": "Uncle John is a confirmed bachelor who has no intention of ever marrying.",
    "distractors": [
      "certain bachelor",
      "fixed bachelor",
      "assured bachelor"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-257",
    "category": "Topic: Family & Relationships",
    "head_word": "start",
    "tail_chunk": "a family",
    "full_phrase": "start a family",
    "meaning_vi": "bắt đầu có con, xây dựng gia đình",
    "example_sentence": "They bought a larger house because they want to start a family soon.",
    "distractors": [
      "begin a family",
      "make a family",
      "create a family"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-258",
    "category": "Topic: Family & Relationships",
    "head_word": "expect",
    "tail_chunk": "a baby",
    "full_phrase": "expect a baby",
    "meaning_vi": "mang thai, sắp sinh con",
    "example_sentence": "Sarah and Mark are expecting a baby due in September.",
    "distractors": [
      "wait a baby",
      "anticipate a baby",
      "hope a baby"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-259",
    "category": "Topic: Family & Relationships",
    "head_word": "bring up",
    "tail_chunk": "children",
    "full_phrase": "bring up children",
    "meaning_vi": "nuôi dạy con cái",
    "example_sentence": "She had to bring up four children on her own after her husband passed away.",
    "distractors": [
      "take up children",
      "grow up children",
      "raise up children"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-260",
    "category": "Topic: Family & Relationships",
    "head_word": "apply for",
    "tail_chunk": "custody",
    "full_phrase": "apply for custody",
    "meaning_vi": "nộp đơn giành quyền nuôi con",
    "example_sentence": "The father decided to apply for custody of his children after the separation.",
    "distractors": [
      "request custody",
      "demand custody",
      "ask custody"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-261",
    "category": "Topic: Family & Relationships",
    "head_word": "provide for",
    "tail_chunk": "family",
    "full_phrase": "provide for family",
    "meaning_vi": "chu cấp cho gia đình",
    "example_sentence": "He works two jobs to provide for his family and pay the mortgage.",
    "distractors": [
      "support for family",
      "supply for family",
      "give for family"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-262",
    "category": "Topic: Family & Relationships",
    "head_word": "set up",
    "tail_chunk": "home",
    "full_phrase": "set up home",
    "meaning_vi": "dựng xây tổ ấm riêng",
    "example_sentence": "After graduation, the young couple decided to set up home in London.",
    "distractors": [
      "make home",
      "build home",
      "establish home"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-263",
    "category": "Relationships",
    "head_word": "strike up",
    "tail_chunk": "a friendship",
    "full_phrase": "strike up a friendship",
    "meaning_vi": "bắt đầu một tình bạn",
    "example_sentence": "Nathan struck up a friendship with a girl he met on holiday.",
    "distractors": [
      "make a friendship",
      "take a friendship",
      "do a friendship"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-264",
    "category": "Relationships",
    "head_word": "form",
    "tail_chunk": "a friendship",
    "full_phrase": "form a friendship",
    "meaning_vi": "hình thành tình bạn",
    "example_sentence": "Audrey formed a lasting friendship with the boy she sat next to at primary school.",
    "distractors": [
      "make a friendship",
      "build a friendship",
      "create a friendship"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-265",
    "category": "Relationships",
    "head_word": "cement",
    "tail_chunk": "a friendship",
    "full_phrase": "cement a friendship",
    "meaning_vi": "thắt chặt tình bạn",
    "example_sentence": "Spending several weeks on holiday together has cemented their friendship.",
    "distractors": [
      "glue a friendship",
      "solidify a friendship",
      "fix a friendship"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-266",
    "category": "Relationships",
    "head_word": "close",
    "tail_chunk": "friends",
    "full_phrase": "close friends",
    "meaning_vi": "bạn thân",
    "example_sentence": "I’m glad that our children are such close friends, aren’t you?",
    "distractors": [
      "near friends",
      "tight friends",
      "intimate friends"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-267",
    "category": "Relationships",
    "head_word": "mutual",
    "tail_chunk": "friends",
    "full_phrase": "mutual friends",
    "meaning_vi": "bạn chung",
    "example_sentence": "We met through mutual friends at a birthday party last year.",
    "distractors": [
      "common friends",
      "shared friends",
      "joint friends"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-268",
    "category": "Relationships",
    "head_word": "casual",
    "tail_chunk": "acquaintance",
    "full_phrase": "casual acquaintance",
    "meaning_vi": "người quen xã giao",
    "example_sentence": "I don’t know Santiago well; we’re just casual acquaintances.",
    "distractors": [
      "slight acquaintance",
      "informal acquaintance",
      "minor acquaintance"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-269",
    "category": "Relationships",
    "head_word": "keep in",
    "tail_chunk": "contact",
    "full_phrase": "keep in contact",
    "meaning_vi": "giữ liên lạc",
    "example_sentence": "We must keep in contact when the course ends.",
    "distractors": [
      "hold in contact",
      "stay in touch",
      "maintain contact"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-270",
    "category": "Relationships",
    "head_word": "fall madly in",
    "tail_chunk": "love",
    "full_phrase": "fall madly in love",
    "meaning_vi": "yêu say đắm",
    "example_sentence": "I fell madly in love with Anton from the moment I met him.",
    "distractors": [
      "drop madly in love",
      "jump madly in love",
      "get madly in love"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-271",
    "category": "Relationships",
    "head_word": "love at first",
    "tail_chunk": "sight",
    "full_phrase": "love at first sight",
    "meaning_vi": "yêu từ cái nhìn đầu tiên",
    "example_sentence": "It was certainly love at first sight when they met at the station.",
    "distractors": [
      "love at first look",
      "love at first glance",
      "love at first meeting"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-272",
    "category": "Relationships",
    "head_word": "desperately in",
    "tail_chunk": "love",
    "full_phrase": "desperately in love",
    "meaning_vi": "yêu tha thiết, yêu điên cuồng",
    "example_sentence": "He told me that he was desperately in love with me too.",
    "distractors": [
      "badly in love",
      "heavily in love",
      "strongly in love"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-273",
    "category": "Relationships",
    "head_word": "make a",
    "tail_chunk": "commitment",
    "full_phrase": "make a commitment",
    "meaning_vi": "đưa ra cam kết, gắn bó",
    "example_sentence": "They realised that they wanted to make a commitment to each other.",
    "distractors": [
      "do a commitment",
      "give a commitment",
      "take a commitment"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Relationships"
  },
  {
    "id": "colloc-cambridge-274",
    "category": "Houses, flats and rooms",
    "head_word": "leave",
    "tail_chunk": "home",
    "full_phrase": "leave home",
    "meaning_vi": "rời khỏi nhà",
    "example_sentence": "She left home to go to university at the age of eighteen.",
    "distractors": [
      "exit home",
      "depart home",
      "go away home"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Housing & Accommodation"
  },
  {
    "id": "colloc-cambridge-275",
    "category": "Houses, flats and rooms",
    "head_word": "make",
    "tail_chunk": "yourself at home",
    "full_phrase": "make yourself at home",
    "meaning_vi": "tự nhiên như ở nhà, thoải mái như ở nhà",
    "example_sentence": "Please come in and make yourself at home while I get some drinks.",
    "distractors": [
      "do yourself at home",
      "feel yourself at home",
      "put yourself at home"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Housing & Accommodation"
  },
  {
    "id": "colloc-cambridge-276",
    "category": "Houses, flats and rooms",
    "head_word": "feel",
    "tail_chunk": "at home",
    "full_phrase": "feel at home",
    "meaning_vi": "cảm thấy thoải mái, thấy như ở nhà",
    "example_sentence": "I haven't lived in this city for long, but I already feel at home here.",
    "distractors": [
      "be at home",
      "stay at home",
      "find at home"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Housing & Accommodation"
  },
  {
    "id": "colloc-cambridge-277",
    "category": "Houses, flats and rooms",
    "head_word": "second",
    "tail_chunk": "home",
    "full_phrase": "second home",
    "meaning_vi": "nhà thứ hai (nhà nghỉ cuối tuần)",
    "example_sentence": "They bought a lovely second home near the coast for weekend getaways.",
    "distractors": [
      "another home",
      "two home",
      "secondary home"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Housing & Accommodation"
  },
  {
    "id": "colloc-cambridge-278",
    "category": "Houses, flats and rooms",
    "head_word": "fully",
    "tail_chunk": "furnished",
    "full_phrase": "fully furnished",
    "meaning_vi": "đầy đủ nội thất",
    "example_sentence": "We are looking for a fully furnished flat available to rent from next month.",
    "distractors": [
      "completely furnished",
      "totally furnished",
      "all furnished"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Housing & Accommodation"
  },
  {
    "id": "colloc-cambridge-279",
    "category": "Houses, flats and rooms",
    "head_word": "residential",
    "tail_chunk": "area",
    "full_phrase": "residential area",
    "meaning_vi": "khu dân cư",
    "example_sentence": "The apartment is located in a quiet residential area.",
    "distractors": [
      "living area",
      "population area",
      "house area"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Housing & Accommodation"
  },
  {
    "id": "colloc-cambridge-280",
    "category": "Houses, flats and rooms",
    "head_word": "newly-built",
    "tail_chunk": "apartment",
    "full_phrase": "newly-built apartment",
    "meaning_vi": "căn hộ mới xây",
    "example_sentence": "They moved into a spacious newly-built apartment last week.",
    "distractors": [
      "new-built apartment",
      "freshly-built apartment",
      "recent-built apartment"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Housing & Accommodation"
  },
  {
    "id": "colloc-cambridge-281",
    "category": "Houses, flats and rooms",
    "head_word": "fully-fitted",
    "tail_chunk": "kitchen",
    "full_phrase": "fully-fitted kitchen",
    "meaning_vi": "phòng bếp được lắp đặt đầy đủ thiết bị",
    "example_sentence": "The house features a modern, fully-fitted kitchen with all appliances.",
    "distractors": [
      "fully-furnished kitchen",
      "complete kitchen",
      "all-fitted kitchen"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Housing & Accommodation"
  },
  {
    "id": "colloc-cambridge-282",
    "category": "Houses, flats and rooms",
    "head_word": "off-road",
    "tail_chunk": "parking",
    "full_phrase": "off-road parking",
    "meaning_vi": "chỗ đỗ xe ngoài đường chính (trong khuôn viên nhà)",
    "example_sentence": "The property comes with the great advantage of secure off-road parking.",
    "distractors": [
      "out-road parking",
      "street parking",
      "away-road parking"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Housing & Accommodation"
  },
  {
    "id": "colloc-cambridge-283",
    "category": "Houses, flats and rooms",
    "head_word": "dream",
    "tail_chunk": "home",
    "full_phrase": "dream home",
    "meaning_vi": "ngôi nhà mơ ước",
    "example_sentence": "After years of saving, they finally bought their dream home in the countryside.",
    "distractors": [
      "ideal home",
      "fantasy home",
      "perfect home"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Housing & Accommodation"
  },
  {
    "id": "colloc-cambridge-284",
    "category": "Houses, flats and rooms",
    "head_word": "build",
    "tail_chunk": "an extension",
    "full_phrase": "build an extension",
    "meaning_vi": "xây thêm phần nối liền nhà (phòng mở rộng)",
    "example_sentence": "They decided to build an extension to create a larger kitchen.",
    "distractors": [
      "make an extension",
      "construct an extension",
      "create an extension"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Housing & Accommodation"
  },
  {
    "id": "colloc-cambridge-285",
    "category": "Houses, flats and rooms",
    "head_word": "do up",
    "tail_chunk": "an old house",
    "full_phrase": "do up an old house",
    "meaning_vi": "tân trang, sửa sang lại một ngôi nhà cũ",
    "example_sentence": "It takes a lot of time and money to do up an old house.",
    "distractors": [
      "make up an old house",
      "fix up an old house",
      "repair up an old house"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Housing & Accommodation"
  },
  {
    "id": "colloc-cambridge-286",
    "category": "Houses, flats and rooms",
    "head_word": "shortage of",
    "tail_chunk": "affordable housing",
    "full_phrase": "shortage of affordable housing",
    "meaning_vi": "tình trạng thiếu nhà ở giá rẻ",
    "example_sentence": "There is a severe shortage of affordable housing in major cities nowadays.",
    "distractors": [
      "lack of affordable housing",
      "want of affordable housing",
      "decrease of affordable housing"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Housing & Accommodation"
  },
  {
    "id": "colloc-cambridge-287",
    "category": "Houses, flats and rooms",
    "head_word": "take out",
    "tail_chunk": "a mortgage",
    "full_phrase": "take out a mortgage",
    "meaning_vi": "vay tiền mua nhà (thế chấp)",
    "example_sentence": "They had to take out a large mortgage to buy their first apartment.",
    "distractors": [
      "make a mortgage",
      "get out a mortgage",
      "borrow a mortgage"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Housing & Accommodation"
  },
  {
    "id": "colloc-cambridge-288",
    "category": "Houses, flats and rooms",
    "head_word": "house-warming",
    "tail_chunk": "party",
    "full_phrase": "house-warming party",
    "meaning_vi": "tiệc tân gia",
    "example_sentence": "We are hosting a house-warming party this Saturday to celebrate our new flat.",
    "distractors": [
      "home-warming party",
      "house-welcoming party",
      "new-house party"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Housing & Accommodation"
  },
  {
    "id": "colloc-cambridge-289",
    "category": "Topic: Food & Drink",
    "head_word": "junk",
    "tail_chunk": "food",
    "full_phrase": "junk food",
    "meaning_vi": "đồ ăn vặt, thức ăn nhanh không lành mạnh",
    "example_sentence": "Children should avoid eating too much junk food to maintain good health.",
    "distractors": [
      "rubbish food",
      "waste food",
      "garbage food"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Health & Diet"
  },
  {
    "id": "colloc-cambridge-290",
    "category": "Topic: Food & Drink",
    "head_word": "nourishing",
    "tail_chunk": "meals",
    "full_phrase": "nourishing meals",
    "meaning_vi": "những bữa ăn bổ dưỡng",
    "example_sentence": "Parents always try to provide nourishing meals for their growing children.",
    "distractors": [
      "nutritious meals",
      "healthy foods",
      "feeding meals"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Health & Diet"
  },
  {
    "id": "colloc-cambridge-291",
    "category": "Topic: Food & Drink",
    "head_word": "fresh",
    "tail_chunk": "produce",
    "full_phrase": "fresh produce",
    "meaning_vi": "nông sản tươi sống",
    "example_sentence": "Local markets are famous for selling fresh produce directly from farms.",
    "distractors": [
      "new produce",
      "green produce",
      "natural produce"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment & Agriculture"
  },
  {
    "id": "colloc-cambridge-292",
    "category": "Topic: Food & Drink",
    "head_word": "ready",
    "tail_chunk": "meals",
    "full_phrase": "ready meals",
    "meaning_vi": "đồ ăn làm sẵn (chỉ cần hâm nóng)",
    "example_sentence": "Busy office workers often rely on ready meals because they are quick to heat up.",
    "distractors": [
      "fast meals",
      "quick meals",
      "instant meals"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Lifestyle"
  },
  {
    "id": "colloc-cambridge-293",
    "category": "Topic: Food & Drink",
    "head_word": "food",
    "tail_chunk": "additives",
    "full_phrase": "food additives",
    "meaning_vi": "chất phụ gia thực phẩm",
    "example_sentence": "Many packaged snacks contain artificial food additives to improve flavor.",
    "distractors": [
      "food supplements",
      "food ingredients",
      "food chemicals"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Science & Health"
  },
  {
    "id": "colloc-cambridge-294",
    "category": "Topic: Food & Drink",
    "head_word": "processed",
    "tail_chunk": "foods",
    "full_phrase": "processed foods",
    "meaning_vi": "thực phẩm chế biến sẵn",
    "example_sentence": "Eating too many processed foods can lead to various health problems.",
    "distractors": [
      "manufactured foods",
      "artificial foods",
      "factory foods"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Health & Diet"
  },
  {
    "id": "colloc-cambridge-295",
    "category": "Topic: Food & Drink",
    "head_word": "perishable",
    "tail_chunk": "food",
    "full_phrase": "perishable food",
    "meaning_vi": "thực phẩm dễ hỏng, dễ ôi thiu",
    "example_sentence": "Supermarkets must store perishable food in refrigerators to prevent it from spoiling.",
    "distractors": [
      "breakable food",
      "spoiled food",
      "fragile food"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Environment & Business"
  },
  {
    "id": "colloc-cambridge-296",
    "category": "Topic: Food & Drink",
    "head_word": "food",
    "tail_chunk": "poisoning",
    "full_phrase": "food poisoning",
    "meaning_vi": "ngộ độc thực phẩm",
    "example_sentence": "Several customers suffered from food poisoning after eating at the unhygienic restaurant.",
    "distractors": [
      "food sickness",
      "meal poisoning",
      "eating infection"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Health & Medicine"
  },
  {
    "id": "colloc-cambridge-297",
    "category": "Topic: Food & Drink",
    "head_word": "light",
    "tail_chunk": "meal",
    "full_phrase": "light meal",
    "meaning_vi": "bữa ăn nhẹ",
    "example_sentence": "She prefers to have a light meal before going to bed.",
    "distractors": [
      "small meal",
      "thin meal",
      "soft meal"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Lifestyle"
  },
  {
    "id": "colloc-cambridge-298",
    "category": "Topic: Food & Drink",
    "head_word": "slap-up",
    "tail_chunk": "meal",
    "full_phrase": "slap-up meal",
    "meaning_vi": "bữa ăn lớn và rất ngon",
    "example_sentence": "They celebrated their anniversary with a slap-up meal at a five-star restaurant.",
    "distractors": [
      "hit-up meal",
      "knock-up meal",
      "grand meal"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Lifestyle"
  },
  {
    "id": "colloc-cambridge-299",
    "category": "Topic: Food & Drink",
    "head_word": "gourmet",
    "tail_chunk": "meal",
    "full_phrase": "gourmet meal",
    "meaning_vi": "bữa ăn cao cấp, dành cho sành ăn",
    "example_sentence": "The chef prepared an exquisite gourmet meal for the food critics.",
    "distractors": [
      "luxury meal",
      "chef meal",
      "fine meal"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Lifestyle"
  },
  {
    "id": "colloc-cambridge-300",
    "category": "Topic: Food & Drink",
    "head_word": "home-cooked",
    "tail_chunk": "food",
    "full_phrase": "home-cooked food",
    "meaning_vi": "đồ ăn nấu tại nhà",
    "example_sentence": "Nothing beats the taste of traditional home-cooked food when you are away from family.",
    "distractors": [
      "house-cooked food",
      "family-cooked food",
      "homemade food"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Lifestyle"
  },
  {
    "id": "colloc-cambridge-301",
    "category": "Topic: Food & Drink",
    "head_word": "quick",
    "tail_chunk": "snack",
    "full_phrase": "quick snack",
    "meaning_vi": "bữa ăn nhẹ nhanh chóng",
    "example_sentence": "I grabbed a quick snack before running to my afternoon lecture.",
    "distractors": [
      "fast snack",
      "short snack",
      "rapid snack"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Lifestyle"
  },
  {
    "id": "colloc-cambridge-302",
    "category": "Topic: Food & Drink",
    "head_word": "refreshing",
    "tail_chunk": "drink",
    "full_phrase": "refreshing drink",
    "meaning_vi": "đồ uống giải khát",
    "example_sentence": "A cold lemonade is a truly refreshing drink on a hot summer day.",
    "distractors": [
      "cooling drink",
      "fresh drink",
      "renewing drink"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Lifestyle"
  },
  {
    "id": "colloc-cambridge-303",
    "category": "Topic: Food & Drink",
    "head_word": "healthy",
    "tail_chunk": "appetite",
    "full_phrase": "healthy appetite",
    "meaning_vi": "sự thèm ăn tốt, sức ăn khỏe",
    "example_sentence": "Growing teenagers usually have a healthy appetite after playing sports.",
    "distractors": [
      "good appetite",
      "big appetite",
      "strong appetite"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Health & Lifestyle"
  },
  {
    "id": "colloc-cambridge-304",
    "category": "Topic: Food & Drink",
    "head_word": "hearty",
    "tail_chunk": "breakfast",
    "full_phrase": "hearty breakfast",
    "meaning_vi": "bữa sáng thịnh soạn, đầy đủ năng lượng",
    "example_sentence": "He ate a hearty breakfast of eggs, bacon, and toast to start his day.",
    "distractors": [
      "heavy breakfast",
      "strong breakfast",
      "big breakfast"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Lifestyle"
  },
  {
    "id": "colloc-cambridge-305",
    "category": "Topic: Food & Drink",
    "head_word": "soft",
    "tail_chunk": "drink",
    "full_phrase": "soft drink",
    "meaning_vi": "đồ uống có ga, không chứa cồn",
    "example_sentence": "She ordered a soft drink instead of alcohol at the party.",
    "distractors": [
      "light drink",
      "sweet drink",
      "gentle drink"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Lifestyle"
  },
  {
    "id": "colloc-cambridge-306",
    "category": "Topic: Food & Drink",
    "head_word": "spoil",
    "tail_chunk": "appetite",
    "full_phrase": "spoil appetite",
    "meaning_vi": "làm mất cảm giác thèm ăn",
    "example_sentence": "Eating sweets before dinner will spoil your appetite.",
    "distractors": [
      "ruin appetite",
      "destroy appetite",
      "break appetite"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Health & Diet"
  },
  {
    "id": "colloc-cambridge-307",
    "category": "Topic: Food & Drink",
    "head_word": "set",
    "tail_chunk": "menu",
    "full_phrase": "set menu",
    "meaning_vi": "thực đơn chọn gói (cố định món)",
    "example_sentence": "The restaurant offers an affordable set menu for lunchgoers.",
    "distractors": [
      "fixed menu",
      "group menu",
      "standard menu"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Tourism & Dining"
  },
  {
    "id": "colloc-cambridge-308",
    "category": "Films and Books",
    "head_word": "bad",
    "tail_chunk": "review",
    "full_phrase": "give a bad review",
    "meaning_vi": "đưa ra lời đánh giá tệ",
    "example_sentence": "The film critics gave the new thriller a very bad review.",
    "distractors": [
      "make a bad review",
      "do a bad review",
      "write a bad criticism"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Arts and Media"
  },
  {
    "id": "colloc-cambridge-309",
    "category": "Films and Books",
    "head_word": "based",
    "tail_chunk": "on a true story",
    "full_phrase": "based on a true story",
    "meaning_vi": "dựa trên một câu chuyện có thật",
    "example_sentence": "The historical drama is based on a true story from the 19th century.",
    "distractors": [
      "based in a true story",
      "made on a true story",
      "rooted on a true story"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Arts and Media"
  },
  {
    "id": "colloc-cambridge-310",
    "category": "Films and Books",
    "head_word": "captures",
    "tail_chunk": "an atmosphere",
    "full_phrase": "capture an atmosphere",
    "meaning_vi": "tái hiện/bắt trọn bầu không khí",
    "example_sentence": "The director successfully captures an atmosphere of mystery and suspense.",
    "distractors": [
      "catch an atmosphere",
      "hold an atmosphere",
      "take an atmosphere"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts and Media"
  },
  {
    "id": "colloc-cambridge-311",
    "category": "Films and Books",
    "head_word": "deals",
    "tail_chunk": "with a topic",
    "full_phrase": "deal with a topic",
    "meaning_vi": "đề cập đến, bàn về một chủ đề",
    "example_sentence": "The novel deals with a very sensitive topic about modern society.",
    "distractors": [
      "handle with a topic",
      "treat with a topic",
      "manage a topic"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts and Media"
  },
  {
    "id": "colloc-cambridge-312",
    "category": "Films and Books",
    "head_word": "happy",
    "tail_chunk": "ending",
    "full_phrase": "have a happy ending",
    "meaning_vi": "có một cái kết có hậu",
    "example_sentence": "Most romantic comedies have a happy ending that satisfies the audience.",
    "distractors": [
      "make a happy ending",
      "take a happy ending",
      "get a happy ending"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Arts and Media"
  },
  {
    "id": "colloc-cambridge-313",
    "category": "Films and Books",
    "head_word": "highly",
    "tail_chunk": "recommended",
    "full_phrase": "highly recommended",
    "meaning_vi": "rất đáng xem, rất được giới thiệu",
    "example_sentence": "This science fiction novel is highly recommended by many book reviewers.",
    "distractors": [
      "strongly recommended",
      "deeply recommended",
      "heavily recommended"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Arts and Media"
  },
  {
    "id": "colloc-cambridge-314",
    "category": "Films and Books",
    "head_word": "box-office",
    "tail_chunk": "hit",
    "full_phrase": "box-office hit",
    "meaning_vi": "phim ăn khách, thành công vang dội về doanh thu phòng vé",
    "example_sentence": "The superhero movie became an immediate box-office hit worldwide.",
    "distractors": [
      "cinema-office hit",
      "ticket-office hit",
      "film-office hit"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts and Media"
  },
  {
    "id": "colloc-cambridge-315",
    "category": "Films and Books",
    "head_word": "engrossed",
    "tail_chunk": "in a book",
    "full_phrase": "be engrossed in a book",
    "meaning_vi": "mải mê đọc sách",
    "example_sentence": "She was so engrossed in her book that she missed her bus stop.",
    "distractors": [
      "be absorbed with a book",
      "be focused for a book",
      "be interested on a book"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts and Media"
  },
  {
    "id": "colloc-cambridge-316",
    "category": "Films and Books",
    "head_word": "compulsive",
    "tail_chunk": "reading",
    "full_phrase": "compulsive reading",
    "meaning_vi": "sách đọc cuốn hút không thể rời mắt",
    "example_sentence": "His latest biography of the singer is absolutely compulsive reading.",
    "distractors": [
      "addictive reading",
      "obsessive reading",
      "fascinating reading"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Arts and Media"
  },
  {
    "id": "colloc-cambridge-317",
    "category": "Films and Books",
    "head_word": "bedtime",
    "tail_chunk": "reading",
    "full_phrase": "bedtime reading",
    "meaning_vi": "sách đọc trước khi đi ngủ",
    "example_sentence": "I prefer light fiction as bedtime reading rather than heavy textbooks.",
    "distractors": [
      "nighttime reading",
      "sleep-time reading",
      "evening reading"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts and Media"
  },
  {
    "id": "colloc-cambridge-318",
    "category": "Films and Books",
    "head_word": "easy",
    "tail_chunk": "read",
    "full_phrase": "an easy read",
    "meaning_vi": "cuốn sách dễ đọc, giải trí nhẹ nhàng",
    "example_sentence": "Short stories are usually an easy read for language learners.",
    "distractors": [
      "a simple reading",
      "an easily read",
      "a light reading"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts and Media"
  },
  {
    "id": "colloc-cambridge-319",
    "category": "Films and Books",
    "head_word": "flick",
    "tail_chunk": "through a book",
    "full_phrase": "flick through a book",
    "meaning_vi": "lật giở nhanh qua cuốn sách",
    "example_sentence": "He just flicked through the magazine while waiting in the lobby.",
    "distractors": [
      "look through a book",
      "see through a book",
      "glance in a book"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts and Media"
  },
  {
    "id": "colloc-cambridge-320",
    "category": "Films and Books",
    "head_word": "beautifully",
    "tail_chunk": "written",
    "full_phrase": "beautifully written",
    "meaning_vi": "được viết một cách hay và tinh tế",
    "example_sentence": "Her debut novel is beautifully written and full of poetic imagery.",
    "distractors": [
      "nicely written",
      "wonderfully written",
      "perfectly written"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts and Media"
  },
  {
    "id": "colloc-cambridge-321",
    "category": "Films and Books",
    "head_word": "cast",
    "tail_chunk": "a film",
    "full_phrase": "cast a film",
    "meaning_vi": "tuyển diễn viên cho phim",
    "example_sentence": "The director spent months trying to cast the film properly.",
    "distractors": [
      "select a film",
      "choose a film",
      "pick a film"
    ],
    "cefr_level": "C1",
    "ielts_topic": "Arts and Media"
  },
  {
    "id": "colloc-cambridge-322",
    "category": "Films and Books",
    "head_word": "shoot",
    "tail_chunk": "a film",
    "full_phrase": "shoot a film",
    "meaning_vi": "quay phim",
    "example_sentence": "They plan to shoot the entire film on location in Scotland.",
    "distractors": [
      "take a film",
      "make a filming",
      "record a film"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts and Media"
  },
  {
    "id": "colloc-cambridge-323",
    "category": "Topic: Music",
    "head_word": "musical",
    "tail_chunk": "talent",
    "full_phrase": "musical talent",
    "meaning_vi": "tài năng âm nhạc",
    "example_sentence": "He has no musical talent whatsoever and cannot even sing in tune.",
    "distractors": [
      "music talent",
      "musical skill",
      "musical gift"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Arts & Culture"
  },
  {
    "id": "colloc-cambridge-324",
    "category": "Topic: Music",
    "head_word": "strum",
    "tail_chunk": "a guitar",
    "full_phrase": "strum a guitar",
    "meaning_vi": "gảy đàn ghi-ta",
    "example_sentence": "I saw him sitting on the beach and strumming a guitar.",
    "distractors": [
      "play a guitar",
      "strike a guitar",
      "beat a guitar"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts & Culture"
  },
  {
    "id": "colloc-cambridge-325",
    "category": "Topic: Music",
    "head_word": "take up",
    "tail_chunk": "the guitar",
    "full_phrase": "take up the guitar",
    "meaning_vi": "bắt đầu học chơi đàn ghi-ta",
    "example_sentence": "She decided to take up the guitar after watching her favorite band perform.",
    "distractors": [
      "take in the guitar",
      "pick up the guitar",
      "start the guitar"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Arts & Culture"
  },
  {
    "id": "colloc-cambridge-326",
    "category": "Topic: Music",
    "head_word": "tune",
    "tail_chunk": "an instrument",
    "full_phrase": "tune an instrument",
    "meaning_vi": "lên dây nhạc cụ",
    "example_sentence": "The violinist spent a few minutes tuning her instrument before the concert.",
    "distractors": [
      "adjust an instrument",
      "fix an instrument",
      "sound an instrument"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts & Culture"
  },
  {
    "id": "colloc-cambridge-327",
    "category": "Topic: Music",
    "head_word": "live",
    "tail_chunk": "music",
    "full_phrase": "live music",
    "meaning_vi": "nhạc sống",
    "example_sentence": "We went to a local pub to enjoy some great live music.",
    "distractors": [
      "real music",
      "life music",
      "active music"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Arts & Culture"
  },
  {
    "id": "colloc-cambridge-328",
    "category": "Topic: Music",
    "head_word": "make",
    "tail_chunk": "a big impact",
    "full_phrase": "make a big impact",
    "meaning_vi": "tạo ra tiếng vang lớn, ảnh hưởng lớn",
    "example_sentence": "The young pop singer made a big impact with her debut single.",
    "distractors": [
      "do a big impact",
      "have a big impact",
      "give a big impact"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts & Culture"
  },
  {
    "id": "colloc-cambridge-329",
    "category": "Topic: Music",
    "head_word": "background",
    "tail_chunk": "music",
    "full_phrase": "background music",
    "meaning_vi": "nhạc nền",
    "example_sentence": "Soft background music was playing while guests entered the dining room.",
    "distractors": [
      "underground music",
      "back music",
      "low music"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Arts & Culture"
  },
  {
    "id": "colloc-cambridge-330",
    "category": "Topic: Music",
    "head_word": "debut",
    "tail_chunk": "album",
    "full_phrase": "debut album",
    "meaning_vi": "album đầu tay",
    "example_sentence": "The band's debut album received rave reviews from music critics.",
    "distractors": [
      "first album",
      "start album",
      "initial album"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts & Culture"
  },
  {
    "id": "colloc-cambridge-331",
    "category": "Topic: Music",
    "head_word": "live",
    "tail_chunk": "performance",
    "full_phrase": "live performance",
    "meaning_vi": "buổi biểu diễn trực tiếp",
    "example_sentence": "Fans waited for hours outside the venue to see their live performance.",
    "distractors": [
      "real performance",
      "active performance",
      "stage performance"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Arts & Culture"
  },
  {
    "id": "colloc-cambridge-332",
    "category": "Topic: Music",
    "head_word": "catchy",
    "tail_chunk": "tunes",
    "full_phrase": "catchy tunes",
    "meaning_vi": "giai điệu bắt tai",
    "example_sentence": "The commercial features a catchy tune that stays in your head all day.",
    "distractors": [
      "attractive tunes",
      "gripping tunes",
      "appealing tunes"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts & Culture"
  },
  {
    "id": "colloc-cambridge-333",
    "category": "Topic: Music",
    "head_word": "massive",
    "tail_chunk": "hit",
    "full_phrase": "massive hit",
    "meaning_vi": "bản hit đình đám, thành công lớn",
    "example_sentence": "Their second single became a massive hit across the globe.",
    "distractors": [
      "huge hit",
      "large hit",
      "big success"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts & Culture"
  },
  {
    "id": "colloc-cambridge-334",
    "category": "Topic: Music",
    "head_word": "go on",
    "tail_chunk": "tour",
    "full_phrase": "go on tour",
    "meaning_vi": "đi lưu diễn",
    "example_sentence": "The rock band will go on tour to promote their latest record.",
    "distractors": [
      "go to tour",
      "travel on tour",
      "make a tour"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Arts & Culture"
  },
  {
    "id": "colloc-cambridge-335",
    "category": "Topic: Music",
    "head_word": "classical",
    "tail_chunk": "music",
    "full_phrase": "classical music",
    "meaning_vi": "nhạc cổ điển",
    "example_sentence": "Listening to classical music helps him concentrate while studying.",
    "distractors": [
      "classic music",
      "old music",
      "traditional music"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Arts & Culture"
  },
  {
    "id": "colloc-cambridge-336",
    "category": "Topic: Music",
    "head_word": "go",
    "tail_chunk": "solo",
    "full_phrase": "go solo",
    "meaning_vi": "tách ra hát đơn, hoạt động đơn lẻ",
    "example_sentence": "After years in the boy band, he decided to go solo.",
    "distractors": [
      "go alone",
      "become solo",
      "walk solo"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Arts & Culture"
  },
  {
    "id": "colloc-cambridge-337",
    "category": "Topic: Sport",
    "head_word": "win",
    "tail_chunk": "matches",
    "full_phrase": "win matches",
    "meaning_vi": "thắng các trận đấu",
    "example_sentence": "Our local team always tries hard to win matches during the season.",
    "distractors": [
      "gain matches",
      "earn matches",
      "achieve matches"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Sport & Fitness"
  },
  {
    "id": "colloc-cambridge-338",
    "category": "Topic: Sport",
    "head_word": "lose",
    "tail_chunk": "matches",
    "full_phrase": "lose matches",
    "meaning_vi": "thua các trận đấu",
    "example_sentence": "It is disappointing to lose matches after playing so well.",
    "distractors": [
      "miss matches",
      "fail matches",
      "drop matches"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Sport & Fitness"
  },
  {
    "id": "colloc-cambridge-339",
    "category": "Topic: Sport",
    "head_word": "train",
    "tail_chunk": "hard",
    "full_phrase": "train hard",
    "meaning_vi": "tập luyện chăm chỉ",
    "example_sentence": "Professional athletes must train hard every single day to stay competitive.",
    "distractors": [
      "practice hard",
      "exercise hard",
      "study hard"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Sport & Fitness"
  },
  {
    "id": "colloc-cambridge-340",
    "category": "Topic: Sport",
    "head_word": "break",
    "tail_chunk": "the world record",
    "full_phrase": "break the world record",
    "meaning_vi": "phá kỷ lục thế giới",
    "example_sentence": "She managed to break the world record in the 100-meter sprint.",
    "distractors": [
      "rupture the world record",
      "destroy the world record",
      "crack the world record"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Sport & Fitness"
  },
  {
    "id": "colloc-cambridge-341",
    "category": "Topic: Sport",
    "head_word": "set",
    "tail_chunk": "a new world record",
    "full_phrase": "set a new world record",
    "meaning_vi": "thiết lập kỷ lục thế giới mới",
    "example_sentence": "The young runner set a new world record at the international championship.",
    "distractors": [
      "make a new world record",
      "put a new world record",
      "create a new world record"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Sport & Fitness"
  },
  {
    "id": "colloc-cambridge-342",
    "category": "Topic: Sport",
    "head_word": "fail",
    "tail_chunk": "a drugs test",
    "full_phrase": "fail a drugs test",
    "meaning_vi": "rớt bài kiểm tra doping",
    "example_sentence": "The famous cyclist had to face a suspension after he failed a drugs test.",
    "distractors": [
      "miss a drugs test",
      "lose a drugs test",
      "break a drugs test"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Sport & Fitness"
  },
  {
    "id": "colloc-cambridge-343",
    "category": "Topic: Sport",
    "head_word": "score",
    "tail_chunk": "a goal",
    "full_phrase": "score a goal",
    "meaning_vi": "ghi bàn",
    "example_sentence": "The striker scored a goal in the final minutes of the match.",
    "distractors": [
      "make a goal",
      "do a goal",
      "win a goal"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Sport & Fitness"
  },
  {
    "id": "colloc-cambridge-344",
    "category": "Topic: Sport",
    "head_word": "take",
    "tail_chunk": "possession of the ball",
    "full_phrase": "take possession of the ball",
    "meaning_vi": "giành quyền kiểm soát bóng",
    "example_sentence": "The defender successfully took possession of the ball from the opponent.",
    "distractors": [
      "get possession of the ball",
      "hold possession of the ball",
      "make possession of the ball"
    ],
    "cefr_level": "B2",
    "ielts_topic": "Sport & Fitness"
  },
  {
    "id": "colloc-cambridge-345",
    "category": "Topic: Sport",
    "head_word": "take",
    "tail_chunk": "a penalty",
    "full_phrase": "take a penalty",
    "meaning_vi": "sút phạt đền",
    "example_sentence": "The team captain stepped up to take a penalty in the crucial shootout.",
    "distractors": [
      "make a penalty",
      "do a penalty",
      "give a penalty"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Sport & Fitness"
  },
  {
    "id": "colloc-cambridge-346",
    "category": "Topic: Sport",
    "head_word": "take",
    "tail_chunk": "a free kick",
    "full_phrase": "take a free kick",
    "meaning_vi": "sút phạt trực tiếp",
    "example_sentence": "He placed the ball carefully before he took a free kick.",
    "distractors": [
      "make a free kick",
      "do a free kick",
      "kick a free kick"
    ],
    "cefr_level": "B1",
    "ielts_topic": "Sport & Fitness"
  }
];
