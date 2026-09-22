export interface InitialSpeakingPrompt {
  id: string
  part: 1 | 2 | 3
  topic: string
  question_prompt: string
  cue_points_json: string
  model_response: string
  suggested_vocabulary_json: string
}

export const INITIAL_SPEAKING_PROMPTS: InitialSpeakingPrompt[] = [
  // --- PART 2: CUE CARDS ---
  {
    id: 'prompt-spk-001',
    part: 2,
    topic: 'Technology & Everyday Life',
    question_prompt: 'Describe a piece of technology that you use frequently and find essential.',
    cue_points_json: JSON.stringify([
      'What the technology is and when you acquired it',
      'How often you use it and for what purposes',
      'Why you find it so essential to your daily routine',
      'And explain how your life would be different without it',
    ]),
    model_response:
      'I would like to talk about my laptop, which has become an indispensable asset in my academic and professional endeavors. I acquired it roughly two years ago, and since then, it has completely streamlined my daily tasks. I utilize it for everything from drafting research proposals to participating in virtual seminars. Without this device, my overall productivity would suffer significantly.',
    suggested_vocabulary_json: JSON.stringify([
      'indispensable asset',
      'streamline daily tasks',
      'boost overall productivity',
      'virtual seminars',
      'technological breakthrough',
    ]),
  },
  {
    id: 'prompt-spk-002',
    part: 2,
    topic: 'Education & Learning Experience',
    question_prompt: 'Describe a memorable course or subject you studied in high school or university.',
    cue_points_json: JSON.stringify([
      'What the course was and who taught it',
      'What key topics or skills were covered',
      'Why the teaching style left a deep impression on you',
      'And explain how this knowledge helped your personal development',
    ]),
    model_response:
      'A particularly memorable course I completed was World History during my freshman year at university. The professor employed an interactive seminar approach that fostered critical thinking skills rather than relying on rote memorization. We analyzed historical events through multifaceted perspectives, which paved the way for a deeper comprehension of modern geopolitics.',
    suggested_vocabulary_json: JSON.stringify([
      'foster critical thinking skills',
      'interactive seminar approach',
      'broaden horizons',
      'acquire invaluable insights',
      'multifaceted perspectives',
    ]),
  },
  {
    id: 'prompt-spk-003',
    part: 2,
    topic: 'Environment & Places',
    question_prompt: 'Describe a quiet place you like to visit to relax or concentrate.',
    cue_points_json: JSON.stringify([
      'Where this place is located',
      'How often you go there and who you go with',
      'What you usually do when you visit this place',
      'And explain why this place helps you unwind and recharge',
    ]),
    model_response:
      'I would love to describe a secluded botanical garden situated on the outskirts of my city. I make a habit of visiting it bi-weekly whenever I feel overwhelmed by urban hustle. The serene environment, surrounded by lush flora and gentle trickling streams, exerts a profound calming impact on my mind. It serves as my sanctuary to recharge my mental battery.',
    suggested_vocabulary_json: JSON.stringify([
      'secluded sanctuary',
      'exert a profound impact',
      'overwhelmed by urban hustle',
      'recharge mental battery',
      'serene atmosphere',
    ]),
  },
  {
    id: 'prompt-spk-004',
    part: 2,
    topic: 'Work & Ambition',
    question_prompt: 'Describe a challenging project or goal you successfully accomplished.',
    cue_points_json: JSON.stringify([
      'What the goal or project was',
      'What obstacles or difficulties you encountered',
      'How you overcame these challenges',
      'And explain how you felt after achieving this goal',
    ]),
    model_response:
      'An ambitious goal I achieved was leading a student team to organize a university-wide environmental campaign. We faced severe time constraints and budget shortages. To overcome these hurdles, we leveraged social media marketing to secure corporate sponsorship. Completing this project gave me a competitive edge and boosted my confidence in leadership.',
    suggested_vocabulary_json: JSON.stringify([
      'ambitious goal',
      'gain a competitive edge',
      'overcome formidable hurdles',
      'secure corporate sponsorship',
      'time constraints',
    ]),
  },

  // --- PART 3: IN-DEPTH DISCUSSION PROMPTS ---
  {
    id: 'prompt-spk-005',
    part: 3,
    topic: 'Artificial Intelligence & Society',
    question_prompt: 'How do you think artificial intelligence will impact job markets in the next decade?',
    cue_points_json: JSON.stringify([]),
    model_response:
      'Artificial intelligence will undoubtedly exert a profound impact on global workforce dynamics. While routine administrative duties will face rapid automation, AI will also pave the way for novel industries requiring human creativity and ethical oversight. To mitigate job displacement, educational institutions must prioritize training students in adaptive digital skills.',
    suggested_vocabulary_json: JSON.stringify([
      'workforce dynamics',
      'exert a profound impact',
      'mitigate job displacement',
      'pave the way for novel industries',
      'adaptive digital skill set',
    ]),
  },
  {
    id: 'prompt-spk-006',
    part: 3,
    topic: 'Environmental Sustainability',
    question_prompt: 'What measures should governments prioritize to encourage green energy adoption?',
    cue_points_json: JSON.stringify([]),
    model_response:
      'Governments should primarily harness the potential of financial incentives, such as tax credits for solar installation and subsidies for electric vehicles. Furthermore, regulators must impose stringent sanctions on industrial polluters to curb toxic emissions. Public awareness campaigns also play an indispensable role in promoting eco-friendly habits.',
    suggested_vocabulary_json: JSON.stringify([
      'harness the potential of',
      'impose stringent sanctions on',
      'curb toxic emissions',
      'play an indispensable role',
      'financial incentives',
    ]),
  },
  {
    id: 'prompt-spk-007',
    part: 3,
    topic: 'Higher Education & Society',
    question_prompt: 'Should university education be made completely free for all students?',
    cue_points_json: JSON.stringify([]),
    model_response:
      'Providing free higher education can certainly help bridge the socioeconomic divide by granting equal opportunities to underprivileged students. However, doing so poses a significant fiscal burden on national budgets. A balanced approach could involve targeted scholarships and government-backed interest-free loans rather than blanket subsidies.',
    suggested_vocabulary_json: JSON.stringify([
      'bridge the socioeconomic divide',
      'fiscal burden',
      'underprivileged students',
      'blanket subsidies',
      'equal opportunities',
    ]),
  },
  {
    id: 'prompt-spk-008',
    part: 3,
    topic: 'Urbanization & Housing',
    question_prompt: 'What are the main causes of housing shortages in modern megacities?',
    cue_points_json: JSON.stringify([]),
    model_response:
      'The principal factor behind urban housing shortages is rapid rural-to-urban migration driven by job prospects. Furthermore, real estate speculation by investment firms inflates property prices beyond affordable levels for average citizens. Municipalities must address the root causes by investing in affordable housing infrastructure.',
    suggested_vocabulary_json: JSON.stringify([
      'address the root causes',
      'rural-to-urban migration',
      'real estate speculation',
      'affordable housing infrastructure',
      'municipalities',
    ]),
  },
]
