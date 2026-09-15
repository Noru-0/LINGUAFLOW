// Initial seed dataset containing 100 IELTS paragraph translation exercises
// Spanning all 5 CEFR Levels (A2, B1, B2, C1, C2) across diverse academic and general themes.

export interface InitialParagraph {
  id: string
  themeCategory: string
  subTopic: string
  targetBand: 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  vietnameseParagraph: string
  targetCollocationsJson: string
  modelTranslation: string
  grammarBreakdown: string
  createdAt: string
}

const nowIso = new Date().toISOString()

export const initial100Paragraphs: InitialParagraph[] = [
  // ==========================================
  // LEVEL A2 (20 Exercises)
  // ==========================================
  {
    id: 'para_a2_01',
    themeCategory: 'Daily Life & Personal Experiences',
    subTopic: 'My Daily Routine and Family Life',
    targetBand: 'A2',
    vietnameseParagraph: 'Gia đình tôi sống trong một ngôi nhà nhỏ ở ngoại thành. Vào buổi sáng, chúng tôi thường ăn sáng cùng nhau trước khi đi làm. Tối đến, mọi người thích xem tivi và trò chuyện về một ngày đã qua. Tôi cảm thấy rất hạnh phúc khi ở bên gia đình.',
    targetCollocationsJson: JSON.stringify([
      { term: 'small house', meaning: 'ngôi nhà nhỏ' },
      { term: 'have breakfast together', meaning: 'ăn sáng cùng nhau' },
      { term: 'chat about the day', meaning: 'trò chuyện về một ngày' },
      { term: 'feel happy', meaning: 'cảm thấy hạnh phúc' }
    ]),
    modelTranslation: 'My family lives in a small house in the suburbs. In the morning, we usually have breakfast together before going to work. In the evening, everyone likes watching TV and chatting about the day. I feel very happy when I am with my family.',
    grammarBreakdown: '1. Present simple tense ("lives", "have breakfast") for daily habits.\n2. Time prepositions ("in the morning", "in the evening").\n3. Temporal conjunction ("before going to work").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_02',
    themeCategory: 'Food, Cooking & Nutrition',
    subTopic: 'Cooking Dinner at Home',
    targetBand: 'A2',
    vietnameseParagraph: 'Mẹ tôi rất thích nấu ăn cho cả nhà vào cuối tuần. Bà thường đi chợ sớm để mua rau tươi và cá. Sau đó, tôi giúp mẹ chuẩn bị gia vị và dọn bàn ăn. Cả gia đình cùng thưởng thức bữa tối rất ngon miệng.',
    targetCollocationsJson: JSON.stringify([
      { term: 'cook dinner', meaning: 'nấu bữa tối' },
      { term: 'fresh vegetables', meaning: 'rau tươi' },
      { term: 'prepare spices', meaning: 'chuẩn bị gia vị' },
      { term: 'enjoy dinner', meaning: 'thưởng thức bữa tối' }
    ]),
    modelTranslation: 'My mother loves cooking for the family on weekends. She usually goes to the market early to buy fresh vegetables and fish. After that, I help her prepare spices and set the table. The whole family enjoys a delicious dinner together.',
    grammarBreakdown: '1. Love + V-ing ("loves cooking").\n2. Frequency adverbs ("usually goes").\n3. Sequence connectors ("After that").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_03',
    themeCategory: 'Hobbies & Free Time',
    subTopic: 'Playing Football with Friends',
    targetBand: 'A2',
    vietnameseParagraph: 'Tôi thường chơi bóng đá với bạn bè vào chiều thứ Bảy. Chúng tôi tập luyện tại công viên gần nhà trong hai giờ. Thể thao giúp tôi giải tỏa căng thẳng sau một tuần học tập vất vả. Thỉnh thoảng chúng tôi cùng đi uống nước sau trận đấu.',
    targetCollocationsJson: JSON.stringify([
      { term: 'play football', meaning: 'chơi bóng đá' },
      { term: 'relieve stress', meaning: 'giải tỏa căng thẳng' },
      { term: 'hard week', meaning: 'một tuần vất vả' },
      { term: 'after the match', meaning: 'sau trận đấu' }
    ]),
    modelTranslation: 'I often play football with my friends on Saturday afternoons. We practice at the park near my house for two hours. Sports help me relieve stress after a hard week of studying. Sometimes we go out for drinks after the match.',
    grammarBreakdown: '1. Duration preposition ("for two hours").\n2. Help + object + bare verb ("help me relieve stress").\n3. Adverb of frequency ("Sometimes").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_04',
    themeCategory: 'School & Education',
    subTopic: 'My Favorite Subject at School',
    targetBand: 'A2',
    vietnameseParagraph: 'Tiếng Anh là môn học yêu thích nhất của tôi ở trường. Thầy giáo của tôi rất thân thiện và luôn giúp đỡ học sinh. Mỗi ngày, tôi dành 30 phút để học từ vựng mới. Tôi hy vọng sẽ nói tiếng Anh lưu khoát trong tương lai.',
    targetCollocationsJson: JSON.stringify([
      { term: 'favorite subject', meaning: 'môn học yêu thích' },
      { term: 'friendly teacher', meaning: 'thầy giáo thân thiện' },
      { term: 'new vocabulary', meaning: 'từ vựng mới' },
      { term: 'speak fluently', meaning: 'nói lưu khoát' }
    ]),
    modelTranslation: 'English is my favorite subject at school. My teacher is very friendly and always helps students. Every day, I spend 30 minutes learning new vocabulary. I hope to speak English fluently in the future.',
    grammarBreakdown: '1. Superlative expression ("favorite subject").\n2. Spend + time + V-ing ("spend 30 minutes learning").\n3. Hope + to-infinitive ("hope to speak").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_05',
    themeCategory: 'Shopping & Consumer Habits',
    subTopic: 'Going Weekend Shopping',
    targetBand: 'A2',
    vietnameseParagraph: 'Chị gái tôi thích đi siêu thị mua sắm vào Sunday. Siêu thị gần nhà bán rất nhiều đồ dùng gia đình và quần áo đẹp. Hôm nay chúng tôi mua một chiếc áo khoác mới cho mùa đông. Chúng tôi trả tiền bằng thẻ tín dụng rất tiện lợi.',
    targetCollocationsJson: JSON.stringify([
      { term: 'go shopping', meaning: 'đi mua sắm' },
      { term: 'household items', meaning: 'đồ dùng gia đình' },
      { term: 'new jacket', meaning: 'áo khoác mới' },
      { term: 'pay by credit card', meaning: 'trả tiền bằng thẻ tín dụng' }
    ]),
    modelTranslation: 'My sister likes going to the supermarket to shop on Sundays. The supermarket near our house sells many household items and nice clothes. Today we bought a new jacket for winter. We paid by credit card, which was very convenient.',
    grammarBreakdown: '1. Like + V-ing ("likes going").\n2. Past simple tense ("bought", "paid").\n3. Non-defining relative clause ("which was very convenient").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_06',
    themeCategory: 'Transportation & Travel',
    subTopic: 'Riding Bicycle to Work',
    targetBand: 'A2',
    vietnameseParagraph: 'Tôi đi làm bằng xe đạp mỗi ngày thay vì đi xe máy. Đi xe đạp không chỉ tiết kiệm tiền xăng mà còn tốt cho sức khỏe. Con đường đến công ty có nhiều cây xanh rất thoáng mát. Tôi luôn đội mũ bảo hiểm để đảm bảo an toàn.',
    targetCollocationsJson: JSON.stringify([
      { term: 'ride a bicycle', meaning: 'đi xe đạp' },
      { term: 'save fuel cost', meaning: 'tiết kiệm tiền xăng' },
      { term: 'good for health', meaning: 'tốt cho sức khỏe' },
      { term: 'wear a helmet', meaning: 'đội mũ bảo hiểm' }
    ]),
    modelTranslation: 'I ride my bicycle to work every day instead of taking a motorbike. Cycling not only saves fuel costs but is also good for my health. The road to my company has many trees and is very cool. I always wear a helmet to stay safe.',
    grammarBreakdown: '1. Prepositional phrase ("instead of taking").\n2. Gerund subject ("Cycling not only saves...").\n3. Purpose infinitive ("to stay safe").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_07',
    themeCategory: 'Hometown & Community',
    subTopic: 'My Peaceful Village',
    targetBand: 'A2',
    vietnameseParagraph: 'Quê hương tôi là một ngôi làng nhỏ ven sông. Người dân ở đây rất thân thiện và sẵn sàng giúp đỡ lẫn nhau. Không khí buổi sáng rất trong lành và yên tĩnh. Tôi rất yêu cuộc sống bình yên ở quê nhà.',
    targetCollocationsJson: JSON.stringify([
      { term: 'peaceful village', meaning: 'ngôi làng bình yên' },
      { term: 'riverside town', meaning: 'ngôi làng ven sông' },
      { term: 'fresh air', meaning: 'không khí trong lành' },
      { term: 'friendly people', meaning: 'người dân thân thiện' }
    ]),
    modelTranslation: 'My hometown is a small village by the river. The people here are very friendly and always ready to help each other. The morning air is very fresh and quiet. I love the peaceful life in my hometown very much.',
    grammarBreakdown: '1. Preposition of place ("by the river").\n2. Adjective + to-infinitive ("ready to help").\n3. Reciprocal pronoun ("each other").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_08',
    themeCategory: 'Pets & Nature',
    subTopic: 'My Dog Max',
    targetBand: 'A2',
    vietnameseParagraph: 'Tôi có một chú chó nhỏ tên là Max. Nó có bộ lông màu trắng và rất thích chạy nhảy trong sân. Mỗi chiều sau khi đi học về, tôi thường dẫn Max đi dạo. Max là một người bạn thân thiết của tôi.',
    targetCollocationsJson: JSON.stringify([
      { term: 'pet dog', meaning: 'chú chó cún' },
      { term: 'white fur', meaning: 'bộ lông màu trắng' },
      { term: 'take a walk', meaning: 'dẫn đi dạo' },
      { term: 'close friend', meaning: 'người bạn thân thiết' }
    ]),
    modelTranslation: 'I have a small dog named Max. He has white fur and loves running around in the yard. Every afternoon after coming home from school, I usually take Max for a walk. Max is a close friend of mine.',
    grammarBreakdown: '1. Past participle as adjective ("named Max").\n2. Love + V-ing ("loves running").\n3. Temporal clause with gerund ("after coming home").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_09',
    themeCategory: 'Weather & Seasons',
    subTopic: 'Rainy Days in Summer',
    targetBand: 'A2',
    vietnameseParagraph: 'Mùa hè ở thành phố tôi thường có những cơn mưa rào bất chợt. Khi trời mưa, tôi thích ngồi bên cửa sổ đọc sách và uống trà nóng. Cơn mưa làm không khí trở nên mát mẻ hơn sau những ngày nắng nóng. Đường phố trở nên vắng vẻ hơn.',
    targetCollocationsJson: JSON.stringify([
      { term: 'summer rain', meaning: 'mưa rào mùa hè' },
      { term: 'read books', meaning: 'đọc sách' },
      { term: 'hot tea', meaning: 'trà nóng' },
      { term: 'cool air', meaning: 'không khí mát mẻ' }
    ]),
    modelTranslation: 'Summer in my city often brings sudden rain showers. When it rains, I like sitting by the window, reading books, and drinking hot tea. The rain makes the air cooler after hot days. The streets become quiet.',
    grammarBreakdown: '1. Compound clauses with participle phrases ("sitting... reading... drinking").\n2. Make + object + adjective ("makes the air cooler").\n3. Comparative adjective ("cooler").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_10',
    themeCategory: 'Health & Fitness',
    subTopic: 'Morning Exercises',
    targetBand: 'A2',
    vietnameseParagraph: 'Tập thể dục buổi sáng giúp tôi có nhiều năng lượng cho một ngày mới. Tôi thường dậy lúc 6 giờ và chạy bộ 20 phút. Sau đó tôi tắm nước ấm và ăn sáng nhẹ. Nhờ thói quen này, tôi ít khi bị ốm.',
    targetCollocationsJson: JSON.stringify([
      { term: 'morning exercise', meaning: 'tập thể dục buổi sáng' },
      { term: 'have energy', meaning: 'có năng lượng' },
      { term: 'go jogging', meaning: 'chạy bộ' },
      { term: 'light breakfast', meaning: 'ăn sáng nhẹ' }
    ]),
    modelTranslation: 'Doing morning exercises gives me plenty of energy for a new day. I usually wake up at 6 a.m. and go jogging for 20 minutes. Then I take a warm shower and have a light breakfast. Thanks to this habit, I rarely get sick.',
    grammarBreakdown: '1. Gerund subject ("Doing morning exercises").\n2. Sequence connectors ("Then").\n3. Prepositional phrase ("Thanks to this habit").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_11',
    themeCategory: 'Music & Entertainment',
    subTopic: 'Listening to Music',
    targetBand: 'A2',
    vietnameseParagraph: 'Âm nhạc là một phần quan trọng trong cuộc sống hàng ngày của tôi. Tôi thích nghe nhạc nhẹ khi làm bài tập về nhà. Âm nhạc giúp tôi tập trung tốt hơn và cảm thấy thư thái. Ca sĩ yêu thích của tôi có giọng hát rất truyền cảm.',
    targetCollocationsJson: JSON.stringify([
      { term: 'important part', meaning: 'phần quan trọng' },
      { term: 'soft music', meaning: 'nhạc nhẹ' },
      { term: 'stay focused', meaning: 'tập trung' },
      { term: 'favorite singer', meaning: 'ca sĩ yêu thích' }
    ]),
    modelTranslation: 'Music is an important part of my daily life. I like listening to soft music while doing my homework. Music helps me stay focused and feel relaxed. My favorite singer has a very expressive voice.',
    grammarBreakdown: '1. Temporal clause ("while doing my homework").\n2. Help + object + bare infinitive ("helps me stay focused").\n3. Coordinate adjective phrase ("stay focused and feel relaxed").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_12',
    themeCategory: 'Movies & Cinema',
    subTopic: 'Going to the Cinema',
    targetBand: 'A2',
    vietnameseParagraph: 'Cuối tuần trước, tôi và các bạn đã đi xem một bộ phim hoạt hình mới. Rạp chiếu phim rất rộng rãi và hiện đại. Chúng tôi mua bắp rang bơ và nước ngọt trước khi vào rạp. Bộ phim rất hài hước và ai cũng cười vui vẻ.',
    targetCollocationsJson: JSON.stringify([
      { term: 'animated movie', meaning: 'phim hoạt hình' },
      { term: 'modern cinema', meaning: 'rạp chiếu phim hiện đại' },
      { term: 'popcorn and soda', meaning: 'bắp rang bơ và nước ngọt' },
      { term: 'funny film', meaning: 'bộ phim hài hước' }
    ]),
    modelTranslation: 'Last weekend, my friends and I went to see a new animated movie. The cinema was very spacious and modern. We bought popcorn and soda before entering the theater. The movie was very funny and everyone laughed happily.',
    grammarBreakdown: '1. Simple past tense ("went", "was", "bought", "laughed").\n2. Time adverbial ("Last weekend").\n3. Indefinite pronoun agreement ("everyone laughed").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_13',
    themeCategory: 'Technology & Gadgets',
    subTopic: 'Using Smartphone',
    targetBand: 'A2',
    vietnameseParagraph: 'Chiếc điện thoại thông minh giúp ích rất nhiều cho việc học của tôi. Tôi dùng nó để tra từ điển và gọi điện cho gia đình. Tuy nhiên, tôi cố gắng không sử dụng điện thoại quá 2 giờ mỗi ngày. Việc dùng điện thoại quá nhiều không tốt cho mắt.',
    targetCollocationsJson: JSON.stringify([
      { term: 'useful tool', meaning: 'công cụ hữu ích' },
      { term: 'look up dictionary', meaning: 'tra từ điển' },
      { term: 'call family', meaning: 'gọi điện cho gia đình' },
      { term: 'good for eyes', meaning: 'tốt cho mắt' }
    ]),
    modelTranslation: 'My smartphone is very useful for my studies. I use it to look up words in the dictionary and call my family. However, I try not to use my phone for more than 2 hours a day. Using the phone too much is bad for the eyes.',
    grammarBreakdown: '1. Purpose infinitive ("to look up words").\n2. Try + negative infinitive ("try not to use").\n3. Gerund subject ("Using the phone too much...").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_14',
    themeCategory: 'Holidays & Celebrations',
    subTopic: 'Tet Holiday in Vietnam',
    targetBand: 'A2',
    vietnameseParagraph: 'Tết là lễ hội lớn nhất trong năm tại Việt Nam. Mọi người trang trí nhà cửa với hoa đào và hoa mai. Trẻ em rất thích Tết vì được nhận tiền mừng tuổi. Cả gia đình quây quầy chúc Tết và trao nhau những lời chúc tốt đẹp.',
    targetCollocationsJson: JSON.stringify([
      { term: 'biggest festival', meaning: 'lễ hội lớn nhất' },
      { term: 'decorate house', meaning: 'trang trí nhà cửa' },
      { term: 'lucky money', meaning: 'tiền mừng tuổi' },
      { term: 'best wishes', meaning: 'những lời chúc tốt đẹp' }
    ]),
    modelTranslation: 'Tet is the biggest festival of the year in Vietnam. People decorate their houses with peach blossoms and apricot flowers. Children love Tet because they receive lucky money. The whole family gathers to exchange best wishes.',
    grammarBreakdown: '1. Superlative ("the biggest festival").\n2. Reason clause ("because they receive lucky money").\n3. Infinitive of purpose ("gathers to exchange").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_15',
    themeCategory: 'Travel & Vacations',
    subTopic: 'Trip to the Beach',
    targetBand: 'A2',
    vietnameseParagraph: 'Mùa hè năm ngoái, gia đình tôi đã có một chuyến du lịch biển tuyệt vời. Chúng tôi tắm biển và xây lâu đài cát vào buổi sáng. Buổi tối, chúng tôi thưởng thức hải sản tươi sống ở một nhà hàng ven biển. Đó là một kỷ niệm khó quên.',
    targetCollocationsJson: JSON.stringify([
      { term: 'beach trip', meaning: 'chuyến du lịch biển' },
      { term: 'build sandcastles', meaning: 'xây lâu đài cát' },
      { term: 'fresh seafood', meaning: 'hải sản tươi sống' },
      { term: 'unforgettable memory', meaning: 'kỷ niệm khó quên' }
    ]),
    modelTranslation: 'Last summer, my family took a wonderful trip to the beach. We swam in the sea and built sandcastles in the morning. In the evening, we enjoyed fresh seafood at a seaside restaurant. It was an unforgettable memory.',
    grammarBreakdown: '1. Past simple verbs ("took", "swam", "built", "enjoyed").\n2. Time expressions ("Last summer").\n3. Descriptive adjectives ("wonderful", "unforgettable").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_16',
    themeCategory: 'Work & Jobs',
    subTopic: 'Part-Time Job at a Coffee Shop',
    targetBand: 'A2',
    vietnameseParagraph: 'Tôi đang làm công việc bán thời gian tại một quán cà phê nhỏ. Công việc của tôi là pha cà phê và phục vụ khách hàng. Đồng nghiệp của tôi rất vui vẻ và nhiệt tình chỉ bảo. Công việc này giúp tôi kiếm thêm thu nhập và giao tiếp tốt hơn.',
    targetCollocationsJson: JSON.stringify([
      { term: 'part-time job', meaning: 'công việc bán thời gian' },
      { term: 'serve customers', meaning: 'phục vụ khách hàng' },
      { term: 'extra income', meaning: 'thu nhập thêm' },
      { term: 'communicate better', meaning: 'giao tiếp tốt hơn' }
    ]),
    modelTranslation: 'I am working a part-time job at a small coffee shop. My job is to make coffee and serve customers. My colleagues are very friendly and enthusiastic in guiding me. This job helps me earn extra income and communicate better.',
    grammarBreakdown: '1. Present continuous for current state ("am working").\n2. Predicate infinitive ("is to make coffee").\n3. Parallel infinitives ("earn extra income and communicate better").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_17',
    themeCategory: 'Reading & Books',
    subTopic: 'Visiting the City Library',
    targetBand: 'A2',
    vietnameseParagraph: 'Thư viện thành phố là nơi yên tĩnh thích hợp để đọc sách và học tập. Tôi đến đây hai lần một tuần để mượn sách tiểu thuyết. Thư viện có hàng ngàn cuốn sách thuộc nhiều lĩnh vực khác nhau. Không gian ở đây luôn sạch sẽ và thoáng mát.',
    targetCollocationsJson: JSON.stringify([
      { term: 'city library', meaning: 'thư viện thành phố' },
      { term: 'borrow novels', meaning: 'mượn sách tiểu thuyết' },
      { term: 'quiet place', meaning: 'nơi yên tĩnh' },
      { term: 'thousands of books', meaning: 'hàng ngàn cuốn sách' }
    ]),
    modelTranslation: 'The city library is a quiet place suitable for reading books and studying. I come here twice a week to borrow novels. The library has thousands of books in various fields. The atmosphere here is always clean and cool.',
    grammarBreakdown: '1. Frequency adverbial ("twice a week").\n2. Adjective modifier ("suitable for reading").\n3. Quantifier phrase ("thousands of books").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_18',
    themeCategory: 'Environment & Nature',
    subTopic: 'Planting Trees in the Garden',
    targetBand: 'A2',
    vietnameseParagraph: 'Ông nội tôi rất thích trồng cây và chăm sóc hoa trong vườn. Mỗi ngày ông đều tưới nước và tỉa cành cho cây cảnh. Tôi hay giúp ông nhặt lá khô và bón phân. Khu vườn nhỏ luôn ngập tràn sắc màu và hương thơm.',
    targetCollocationsJson: JSON.stringify([
      { term: 'plant trees', meaning: 'trồng cây' },
      { term: 'water plants', meaning: 'tưới nước cho cây' },
      { term: 'small garden', meaning: 'khu vườn nhỏ' },
      { term: 'full of colors', meaning: 'ngập tràn sắc màu' }
    ]),
    modelTranslation: 'My grandfather likes planting trees and taking care of flowers in the garden. Every day he waters the plants and prunes the bonsai. I often help him pick up dry leaves and apply fertilizer. The small garden is always full of colors and fragrance.',
    grammarBreakdown: '1. Parallel gerunds ("planting trees and taking care").\n2. Frequency expressions ("Every day", "often").\n3. Predicate adjective phrase ("full of colors").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_19',
    themeCategory: 'Sports & Activities',
    subTopic: 'Swimming Lessons',
    targetBand: 'A2',
    vietnameseParagraph: 'Tôi bắt đầu học bơi từ mùa hè năm ngoái. Ban đầu tôi rất sợ nước nhưng huấn luyện viên đã kiên nhẫn hướng dẫn. Hiện tại tôi có thể bơi thạo 50 mét mà không mệt. Bơi lội giúp cơ thể tôi khỏe mạnh hơn.',
    targetCollocationsJson: JSON.stringify([
      { term: 'swimming lessons', meaning: 'học bơi' },
      { term: 'afraid of water', meaning: 'sợ nước' },
      { term: 'patient coach', meaning: 'huấn luyện viên kiên nhẫn' },
      { term: 'healthy body', meaning: 'cơ thể khỏe mạnh' }
    ]),
    modelTranslation: 'I started taking swimming lessons last summer. At first I was afraid of water, but the coach guided me patiently. Now I can swim 50 meters easily without getting tired. Swimming helps my body become healthier.',
    grammarBreakdown: '1. Start + V-ing ("started taking").\n2. Contrast conjunction ("but").\n3. Preposition + gerund ("without getting tired").',
    createdAt: nowIso
  },
  {
    id: 'para_a2_20',
    themeCategory: 'Friendship & Social Life',
    subTopic: 'Meeting Old Friends',
    targetBand: 'A2',
    vietnameseParagraph: 'Tối qua tôi đã gặp lại những người bạn học cấp hai tại một quán trà sữa. Chúng tôi đã lâu không gặp nên có rất nhiều chuyện để kể. Mọi người cùng ôn lại những kỷ niệm vui vẻ thời đi học. Tôi hy vọng chúng tôi sẽ giữ liên lạc thường xuyên.',
    targetCollocationsJson: JSON.stringify([
      { term: 'old classmates', meaning: 'bạn học cũ' },
      { term: 'milk tea shop', meaning: 'quán trà sữa' },
      { term: 'happy memories', meaning: 'kỷ niệm vui vẻ' },
      { term: 'keep in touch', meaning: 'giữ liên lạc' }
    ]),
    modelTranslation: 'Last night I met my junior high school classmates at a milk tea shop. We had not seen each other for a long time, so we had a lot of stories to tell. Everyone recalled happy school memories together. I hope we will keep in touch regularly.',
    grammarBreakdown: '1. Past perfect tense ("had not seen").\n2. Result conjunction ("so").\n3. Infinitive of purpose ("stories to tell").',
    createdAt: nowIso
  },

  // ==========================================
  // LEVEL B1 (20 Exercises)
  // ==========================================
  {
    id: 'para_b1_01',
    themeCategory: 'Travel, Holidays & Tourism',
    subTopic: 'Independent Travel and Cultural Exploration',
    targetBand: 'B1',
    vietnameseParagraph: 'Du lịch tự túc ngày càng trở nên phổ biến đối với giới trẻ. Nó không chỉ giúp họ tiết kiệm chi phí mà còn mang lại cơ hội trải nghiệm văn hóa bản địa một cách tự do. Nhiều người tin rằng việc đi du lịch giúp họ mở rộng tầm nhìn và trở nên tự lập hơn.',
    targetCollocationsJson: JSON.stringify([
      { term: 'independent travel', meaning: 'du lịch tự túc' },
      { term: 'save money', meaning: 'tiết kiệm chi phí' },
      { term: 'local culture', meaning: 'văn hóa bản địa' },
      { term: 'broaden horizons', meaning: 'mở rộng tầm nhìn' }
    ]),
    modelTranslation: 'Independent travel is becoming increasingly popular among young people. It not only helps them save money but also offers an opportunity to experience local culture freely. Many people believe that traveling helps broaden their horizons and become more independent.',
    grammarBreakdown: '1. Present continuous for trends ("is becoming increasingly popular").\n2. Correlative structure ("not only ... but also").\n3. Indirect clause ("believe that traveling helps...").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_02',
    themeCategory: 'Environment & Sustainable Living',
    subTopic: 'Reducing Plastic Waste in Daily Life',
    targetBand: 'B1',
    vietnameseParagraph: 'Việc giảm thiểu rác thải nhựa đang trở thành một thói quen quan trọng của nhiều hộ gia đình. Thay vì dùng túi ni-lông một lần, mọi người bắt đầu mang theo túi vải khi đi chợ. Nhiều cửa hàng cũng khuyến khích khách hàng tự mang bình nước cá nhân. Những hành động nhỏ này góp phần bảo vệ môi trường sống.',
    targetCollocationsJson: JSON.stringify([
      { term: 'reduce plastic waste', meaning: 'giảm thiểu rác thải nhựa' },
      { term: 'single-use bags', meaning: 'túi dùng một lần' },
      { term: 'cloth bags', meaning: 'túi vải' },
      { term: 'protect the environment', meaning: 'bảo vệ môi trường' }
    ]),
    modelTranslation: 'Reducing plastic waste is becoming an important habit for many households. Instead of using single-use plastic bags, people are starting to bring cloth bags when shopping. Many stores also encourage customers to bring their own water bottles. These small actions contribute to protecting the environment.',
    grammarBreakdown: '1. Gerund phrase as subject ("Reducing plastic waste").\n2. Prepositional contrast ("Instead of using").\n3. Contribute to + V-ing ("contribute to protecting").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_03',
    themeCategory: 'Education & Learning Habits',
    subTopic: 'Benefits of Online Learning Platforms',
    targetBand: 'B1',
    vietnameseParagraph: 'Các khóa học trực tuyến cho phép sinh viên học tập linh hoạt theo thời gian riêng. Người học có thể dễ dàng truy cập bài giảng từ bất kỳ đâu chỉ với thiết bị kết nối internet. Tuy nhiên, hình thức này đòi hỏi tinh thần tự giác cao và khả năng quản lý thời gian tốt. Nếu không tập trung, sinh viên rất dễ bị xao lãng.',
    targetCollocationsJson: JSON.stringify([
      { term: 'online courses', meaning: 'khóa học trực tuyến' },
      { term: 'flexible schedule', meaning: 'thời gian linh hoạt' },
      { term: 'self-discipline', meaning: 'tinh thần tự giác' },
      { term: 'time management', meaning: 'quản lý thời gian' }
    ]),
    modelTranslation: 'Online courses allow students to learn flexibly on their own schedules. Learners can easily access lectures from anywhere with an internet-connected device. However, this format requires high self-discipline and good time management skills. Without focus, students can easily get distracted.',
    grammarBreakdown: '1. Allow + object + to-infinitive ("allow students to learn").\n2. Prepositional phrase ("with an internet-connected device").\n3. Conditional preposition ("Without focus").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_04',
    themeCategory: 'Health & Wellbeing',
    subTopic: 'Importance of Getting Enough Sleep',
    targetBand: 'B1',
    vietnameseParagraph: 'Ngủ đủ giấc đóng vai trò thiết yếu đối với sức khỏe thể chất và tinh thần. Thức khuya thường xuyên có thể dẫn đến suy giảm trí nhớ và mệt mỏi kéo dài. Bác sĩ khuyên người trưởng thành nên ngủ từ 7 đến 8 tiếng mỗi đêm. Duy trì lịch ngủ đều đặn sẽ giúp cải thiện khả năng làm việc.',
    targetCollocationsJson: JSON.stringify([
      { term: 'get enough sleep', meaning: 'ngủ đủ giấc' },
      { term: 'physical health', meaning: 'sức khỏe thể chất' },
      { term: 'stay up late', meaning: 'thức khuya' },
      { term: 'memory loss', meaning: 'suy giảm trí nhớ' }
    ]),
    modelTranslation: 'Getting enough sleep plays an essential role in physical and mental health. Staying up late regularly can lead to memory decline and prolonged fatigue. Doctors advise adults to sleep 7 to 8 hours per night. Maintaining a regular sleep schedule helps improve productivity.',
    grammarBreakdown: '1. Play a role in + N/V-ing ("plays an essential role in").\n2. Lead to + noun ("lead to memory decline").\n3. Advise + object + to-infinitive ("advise adults to sleep").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_05',
    themeCategory: 'Work & Career Choice',
    subTopic: 'Working Remotely from Home',
    targetBand: 'B1',
    vietnameseParagraph: 'Làm việc từ xa mang lại sự thoải mái cho nhân viên vì họ không phải di chuyển trong giờ cao điểm. Họ có thể sắp xếp không gian làm việc cá nhân và tiết kiệm chi phí đi lại. Tuy nhiên, việc thiếu sự tương tác trực tiếp có thể khiến một số người cảm thấy cô đơn. Do đó, việc duy trì liên lạc với đồng nghiệp là rất cần thiết.',
    targetCollocationsJson: JSON.stringify([
      { term: 'work remotely', meaning: 'làm việc từ xa' },
      { term: 'rush hour', meaning: 'giờ cao điểm' },
      { term: 'travel expenses', meaning: 'chi phí đi lại' },
      { term: 'face-to-face interaction', meaning: 'tương tác trực tiếp' }
    ]),
    modelTranslation: 'Working remotely offers comfort to employees as they do not have to commute during rush hour. They can arrange a personalized workspace and save on travel expenses. However, the lack of face-to-face interaction can make some people feel lonely. Therefore, keeping in touch with colleagues is essential.',
    grammarBreakdown: '1. Causal clause with "as" ("as they do not have to commute").\n2. Make + object + bare verb ("make some people feel lonely").\n3. Conjunctive adverb ("Therefore").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_06',
    themeCategory: 'Social Media & Communication',
    subTopic: 'Impact of Social Media on Youth',
    targetBand: 'B1',
    vietnameseParagraph: 'Mạng xã hội đã làm thay đổi hoàn toàn cách người trẻ kết nối và chia sẻ thông tin. Nó giúp họ cập nhật tin tức nhanh chóng và duy trì tình bạn dù ở xa. Mặc dù vậy, việc dành quá nhiều thời gian trên mạng xã hội có thể làm giảm sự tập trung vào việc học. Giới trẻ nên học cách sử dụng mạng xã hội một cách thông minh.',
    targetCollocationsJson: JSON.stringify([
      { term: 'social media', meaning: 'mạng xã hội' },
      { term: 'share information', meaning: 'chia sẻ thông tin' },
      { term: 'stay updated', meaning: 'cập nhật tin tức' },
      { term: 'use wisely', meaning: 'sử dụng thông minh' }
    ]),
    modelTranslation: 'Social media has completely changed how young people connect and share information. It helps them stay updated with news quickly and maintain friendships despite long distances. Even so, spending too much time on social media can reduce study focus. Youths should learn to use social media wisely.',
    grammarBreakdown: '1. Present perfect for recent change ("has completely changed").\n2. Concessive preposition ("despite long distances").\n3. Gerund subject ("spending too much time").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_07',
    themeCategory: 'Public Transport & Urban Life',
    subTopic: 'Using Public Buses in Big Cities',
    targetBand: 'B1',
    vietnameseParagraph: 'Sử dụng xe buýt công cộng là một giải pháp hiệu quả để giảm ùn tắc giao thông ở các đô thị lớn. Vé xe buýt rất rẻ và phù hợp với túi tiền của sinh viên. Hơn nữa, việc di chuyển bằng xe buýt giúp hạn chế lượng khí thải từ phương tiện cá nhân. Chính quyền thành phố đang đầu tư thêm nhiều xe buýt điện hiện đại.',
    targetCollocationsJson: JSON.stringify([
      { term: 'public buses', meaning: 'xe buýt công cộng' },
      { term: 'traffic congestion', meaning: 'ùn tắc giao thông' },
      { term: 'affordable price', meaning: 'phù hợp túi tiền' },
      { term: 'vehicle emissions', meaning: 'khí thải phương tiện' }
    ]),
    modelTranslation: 'Using public buses is an effective solution to reduce traffic congestion in large cities. Bus tickets are very cheap and affordable for students. Furthermore, traveling by bus helps limit vehicle emissions from personal transport. The city government is investing in more modern electric buses.',
    grammarBreakdown: '1. Noun phrase modifier ("effective solution to reduce").\n2. Transition addition ("Furthermore").\n3. Present continuous for ongoing action ("is investing").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_08',
    themeCategory: 'Language Learning',
    subTopic: 'Learning a Second Language',
    targetBand: 'B1',
    vietnameseParagraph: 'Học một ngoại ngữ mới mang lại nhiều lợi ích cho sự phát triển trí não. Nó không chỉ mở ra nhiều cơ hội việc làm tốt hơn mà còn giúp bạn hiểu sâu hơn về các văn hóa khác. Phương pháp hiệu quả nhất là luyện tập giao tiếp hàng ngày với người bản xứ. Sự kiên trì là chìa khóa để thành công.',
    targetCollocationsJson: JSON.stringify([
      { term: 'second language', meaning: 'ngoại ngữ thứ hai' },
      { term: 'brain development', meaning: 'phát triển trí não' },
      { term: 'job opportunities', meaning: 'cơ hội việc làm' },
      { term: 'native speakers', meaning: 'người bản xứ' }
    ]),
    modelTranslation: 'Learning a second language brings many benefits to brain development. It not only opens up better job opportunities but also helps you understand other cultures more deeply. The most effective method is practicing daily communication with native speakers. Perseverance is the key to success.',
    grammarBreakdown: '1. Correlative conjunction ("not only ... but also").\n2. Superlative modifier ("The most effective method").\n3. Preposition phrase ("key to success").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_09',
    themeCategory: 'City vs Countryside',
    subTopic: 'Living in City versus Countryside',
    targetBand: 'B1',
    vietnameseParagraph: 'Sống ở thành phố lớn cung cấp cơ hội việc làm và dịch vụ y tế tốt hơn nhiều so với nông thôn. Ngược lại, cuộc sống ở làng quê mang lại sự yên bình và không khí sạch sẽ hơn. Nhiều người trẻ thích sự sôi động của đô thị, trong khi người lớn tuổi lại chọn sự tĩnh lặng của thôn quê. Mỗi môi trường đều có những ưu điểm riêng.',
    targetCollocationsJson: JSON.stringify([
      { term: 'job opportunities', meaning: 'cơ hội việc làm' },
      { term: 'medical services', meaning: 'dịch vụ y tế' },
      { term: 'peaceful life', meaning: 'cuộc sống yên bình' },
      { term: 'unique advantages', meaning: 'ưu điểm riêng' }
    ]),
    modelTranslation: 'Living in a big city provides much better job opportunities and medical services than in the countryside. On the contrary, life in a village offers peace and cleaner air. Many young people prefer the excitement of urban areas, whereas older people choose the quietness of rural regions. Each environment has its own unique advantages.',
    grammarBreakdown: '1. Comparative clause ("much better ... than").\n2. Contrastive adverb ("On the contrary").\n3. Subordinating conjunction of contrast ("whereas").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_10',
    themeCategory: 'Fast Food & Youth Trends',
    subTopic: 'Rise of Fast Food Culture',
    targetBand: 'B1',
    vietnameseParagraph: 'Đồ ăn nhanh ngày càng được ưa chuộng bởi sự tiện lợi và hương vị hấp dẫn. Nhịp sống hối hả khiến nhiều người bận rộn không có thời gian tự nấu ăn tại nhà. Tuy nhiên, việc tiêu thụ thường xuyên thực phẩm chứa nhiều chất béo có thể gây ra nguy cơ béo phì. Chúng ta nên duy trì chế độ ăn uống cân bằng.',
    targetCollocationsJson: JSON.stringify([
      { term: 'fast food', meaning: 'đồ ăn nhanh' },
      { term: 'busy lifestyle', meaning: 'nhịp sống hối hả' },
      { term: 'high fat intake', meaning: 'chứa nhiều chất béo' },
      { term: 'balanced diet', meaning: 'chế độ ăn cân bằng' }
    ]),
    modelTranslation: 'Fast food is becoming increasingly popular due to its convenience and appealing flavor. A busy lifestyle leaves many people with no time to cook at home. However, frequent consumption of high-fat foods can lead to obesity risks. We should maintain a balanced diet.',
    grammarBreakdown: '1. Preposition of cause ("due to its convenience").\n2. Causative result ("leaves many people with no time").\n3. Modal obligation ("should maintain").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_11',
    themeCategory: 'Music & Culture',
    subTopic: 'Music Festivals and Community Spirit',
    targetBand: 'B1',
    vietnameseParagraph: 'Các lễ hội âm nhạc ngoài trời thu hút hàng ngàn khán giả trẻ tham gia mỗi mùa hè. Đây là nơi mọi người cùng chia sẻ đam mê âm nhạc và kết nối bạn bè mới. Âm nhạc tạo ra bầu không khí sôi động và đầy năng lượng. Những sự kiện này giúp làm giàu đời sống tinh thần của cộng đồng.',
    targetCollocationsJson: JSON.stringify([
      { term: 'music festival', meaning: 'lễ hội âm nhạc' },
      { term: 'outdoor event', meaning: 'sự kiện ngoài trời' },
      { term: 'share passion', meaning: 'chia sẻ đam mê' },
      { term: 'community spirit', meaning: 'đời sống cộng đồng' }
    ]),
    modelTranslation: 'Outdoor music festivals attract thousands of young spectators every summer. This is a place where people share their passion for music and make new friends. Music creates a vibrant and energetic atmosphere. These events help enrich the spiritual life of the community.',
    grammarBreakdown: '1. Relative clause of place ("a place where people share").\n2. Coordinate adjectives ("vibrant and energetic").\n3. Help + bare verb ("help enrich").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_12',
    themeCategory: 'Technology & Everyday Life',
    subTopic: 'Smart Homes and Daily Convenience',
    targetBand: 'B1',
    vietnameseParagraph: 'Thiết bị nhà thông minh giúp cuộc sống gia đình trở nên tiện nghi và an toàn hơn. Chủ nhà có thể điều khiển đèn và điều hòa từ xa thông qua ứng dụng điện thoại. Việc này không chỉ tiết kiệm điện năng mà còn giảm bớt lo lắng khi vắng nhà. Công nghệ đang nâng cao chất lượng cuộc sống hàng ngày.',
    targetCollocationsJson: JSON.stringify([
      { term: 'smart home devices', meaning: 'thiết bị nhà thông minh' },
      { term: 'remote control', meaning: 'điều khiển từ xa' },
      { term: 'save electricity', meaning: 'tiết kiệm điện năng' },
      { term: 'improve quality of life', meaning: 'nâng cao chất lượng cuộc sống' }
    ]),
    modelTranslation: 'Smart home devices make family life more convenient and secure. Homeowners can control lights and air conditioning remotely via a smartphone app. This not only saves electricity but also reduces anxiety when away from home. Technology is improving daily quality of life.',
    grammarBreakdown: '1. Make + object + adjective ("make family life more convenient").\n2. Prepositional mean ("via a smartphone app").\n3. Temporal ellipsis ("when away from home").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_13',
    themeCategory: 'Volunteering & Community Action',
    subTopic: 'Youth Volunteering in Rural Areas',
    targetBand: 'B1',
    vietnameseParagraph: 'Các hoạt động tình nguyện hè mang lại nhiều trải nghiệm quý báu cho sinh viên đại học. Họ đến các vùng sâu vùng xa để dạy học và hỗ trợ xây dựng nhà tình thương. Những chuyến đi này giúp thanh niên hiểu thêm về những khó khăn của người dân vùng khó. Đó cũng là cơ hội để phát triển kỹ năng sống.',
    targetCollocationsJson: JSON.stringify([
      { term: 'volunteer activities', meaning: 'hoạt động tình nguyện' },
      { term: 'remote areas', meaning: 'vùng sâu vùng xa' },
      { term: 'charity houses', meaning: 'nhà tình thương' },
      { term: 'life skills', meaning: 'kỹ năng sống' }
    ]),
    modelTranslation: 'Summer volunteer activities bring valuable experiences to university students. They travel to remote areas to teach children and support building charity houses. These trips help young people understand the hardships of disadvantaged communities better. It is also an opportunity to develop life skills.',
    grammarBreakdown: '1. Purpose infinitives ("to teach ... and support").\n2. Comparative modifier ("understand ... better").\n3. Infinitive post-modifier ("opportunity to develop").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_14',
    themeCategory: 'Renewable Energy',
    subTopic: 'Solar Energy for Residential Houses',
    targetBand: 'B1',
    vietnameseParagraph: 'Việc lắp đặt pin năng lượng mặt trời trên mái nhà đang được nhiều gia đình lựa chọn. Năng lượng mặt trời là nguồn năng lượng sạch và không bao giờ cạn kiệt. Mặc dù chi phí đầu tư ban đầu khá cao, gia đình có thể tiết kiệm rất nhiều tiền điện về lâu dài. Đây là hướng đi bền vững cho tương lai.',
    targetCollocationsJson: JSON.stringify([
      { term: 'solar panels', meaning: 'pin năng lượng mặt trời' },
      { term: 'clean energy source', meaning: 'nguồn năng lượng sạch' },
      { term: 'initial investment cost', meaning: 'chi phí đầu tư ban đầu' },
      { term: 'long-term savings', meaning: 'tiết kiệm lâu dài' }
    ]),
    modelTranslation: 'Installing rooftop solar panels is being chosen by many families. Solar energy is a clean and inexhaustible energy source. Although the initial investment cost is relatively high, households can save a lot on electricity bills in the long run. This is a sustainable direction for the future.',
    grammarBreakdown: '1. Passive continuous voice ("is being chosen").\n2. Concessive clause ("Although the initial investment...").\n3. Idiomatic prepositional phrase ("in the long run").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_15',
    themeCategory: 'Sports & Discipline',
    subTopic: 'Martial Arts for Self-Discipline',
    targetBand: 'B1',
    vietnameseParagraph: 'Luyện tập võ thuật không chỉ giúp nâng cao khả năng tự vệ mà còn rèn luyện tính kỷ luật. Học viên phải tuân thủ các quy tắc nghiêm ngặt và tôn trọng thầy dạy. Nhờ đó, người học trở nên kiên nhẫn và tự tin hơn trong cuộc sống. Võ thuật là sự kết hợp giữa thể chất và tinh thần.',
    targetCollocationsJson: JSON.stringify([
      { term: 'martial arts', meaning: 'luyện tập võ thuật' },
      { term: 'self-defense skills', meaning: 'khả năng tự vệ' },
      { term: 'strict rules', meaning: 'quy tắc nghiêm ngặt' },
      { term: 'physical and mental balance', meaning: 'kết hợp thể chất và tinh thần' }
    ]),
    modelTranslation: 'Practicing martial arts not only improves self-defense skills but also cultivates personal discipline. Students must comply with strict rules and respect their instructors. As a result, learners become more patient and confident in life. Martial arts represent a combination of physical and mental strength.',
    grammarBreakdown: '1. Correlative sentence structure ("not only ... but also").\n2. Modal obligation ("must comply with").\n3. Transition result phrase ("As a result").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_16',
    themeCategory: 'Online Shopping Trends',
    subTopic: 'Convenience of E-commerce Platforms',
    targetBand: 'B1',
    vietnameseParagraph: 'Mua sắm qua mạng đã trở thành thói quen phổ biến của cư dân đô thị. Người tiêu dùng có thể so sánh giá cả giữa các gian hàng chỉ bằng vài cú nhấp chuột. Dịch vụ giao hàng tận nhà giúp tiết kiệm thời gian di chuyển đáng kể. Tuy nhiên, mua hàng online cũng ẩn chứa nguy cơ mua phải hàng giả.',
    targetCollocationsJson: JSON.stringify([
      { term: 'online shopping', meaning: 'mua sắm qua mạng' },
      { term: 'compare prices', meaning: 'so sánh giá cả' },
      { term: 'home delivery service', meaning: 'dịch vụ giao hàng tận nhà' },
      { term: 'fake goods', meaning: 'hàng giả' }
    ]),
    modelTranslation: 'Online shopping has become a common habit among urban residents. Consumers can compare prices between stores with just a few clicks. Home delivery services help save significant travel time. However, buying online also carries the risk of purchasing fake goods.',
    grammarBreakdown: '1. Present perfect state ("has become a common habit").\n2. Prepositional phrase ("with just a few clicks").\n3. Preposition + gerund ("risk of purchasing fake goods").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_17',
    themeCategory: 'Reading & Knowledge',
    subTopic: 'Developing a Habit of Reading Books',
    targetBand: 'B1',
    vietnameseParagraph: 'Đọc sách hàng ngày là một phương pháp tuyệt vời để trau dồi kiến thức và mở rộng vốn từ. Những cuốn sách hay cung cấp góc nhìn sâu sắc về cuộc sống và con người. Dành 20 phút đọc sách trước khi đi ngủ giúp tâm trí thư thái hơn. Thói quen này nên được khuyến khích ở trẻ em.',
    targetCollocationsJson: JSON.stringify([
      { term: 'read books daily', meaning: 'đọc sách hàng ngày' },
      { term: 'expand vocabulary', meaning: 'mở rộng vốn từ' },
      { term: 'deep perspectives', meaning: 'góc nhìn sâu sắc' },
      { term: 'relaxing mind', meaning: 'tâm trí thư thái' }
    ]),
    modelTranslation: 'Reading books daily is a wonderful method to cultivate knowledge and expand vocabulary. Good books provide deep perspectives on life and human nature. Spending 20 minutes reading before sleep helps relax the mind. This habit should be encouraged in children.',
    grammarBreakdown: '1. Infinitive post-modifiers ("method to cultivate... and expand").\n2. Temporal participle clause ("reading before sleep").\n3. Passive voice modal ("should be encouraged").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_18',
    themeCategory: 'Career & Skills',
    subTopic: 'Importance of Teamwork Skills',
    targetBand: 'B1',
    vietnameseParagraph: 'Kỹ năng làm việc nhóm là yêu cầu bắt buộc trong môi trường công sở hiện đại. Một dự án lớn đòi hỏi sự phối hợp nhịp nhàng giữa nhiều cá nhân có chuyên môn khác nhau. Việc biết lắng nghe và tôn trọng ý kiến đồng nghiệp giúp công việc hoàn thành nhanh chóng. Tinh thần đồng đội quyết định sự thành công chung.',
    targetCollocationsJson: JSON.stringify([
      { term: 'teamwork skills', meaning: 'kỹ năng làm việc nhóm' },
      { term: 'modern workplace', meaning: 'môi trường công sở hiện đại' },
      { term: 'smooth cooperation', meaning: 'sự phối hợp nhịp nhàng' },
      { term: 'team spirit', meaning: 'tinh thần đồng đội' }
    ]),
    modelTranslation: 'Teamwork skills are a mandatory requirement in the modern workplace. A large project requires smooth cooperation among individuals with different expertise. Knowing how to listen to and respect colleagues’ opinions helps tasks finish quickly. Team spirit determines overall success.',
    grammarBreakdown: '1. Prepositional phrase ("among individuals with different expertise").\n2. Gerund clause subject ("Knowing how to listen...").\n3. Adverb modifier ("finish quickly").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_19',
    themeCategory: 'Environmental Protection',
    subTopic: 'Sorting Waste at Source',
    targetBand: 'B1',
    vietnameseParagraph: 'Phân loại rác tại nguồn giúp nâng cao hiệu quả của quá trình tái chế rác thải. Rác hữu cơ có thể làm phân bón cho cây trồng, trong khi nhựa và giấy được đưa vào nhà máy tái chế. Việc này giảm tải lượng rác đưa ra các bãi chôn lấp. Mỗi người dân đều đóng vai trò quan trọng.',
    targetCollocationsJson: JSON.stringify([
      { term: 'sort waste at source', meaning: 'phân loại rác tại nguồn' },
      { term: 'recycling process', meaning: 'quá trình tái chế' },
      { term: 'organic waste', meaning: 'rác hữu cơ' },
      { term: 'landfill sites', meaning: 'bãi chôn lấp' }
    ]),
    modelTranslation: 'Sorting waste at source helps improve the efficiency of the recycling process. Organic waste can be used as plant fertilizer, while plastic and paper are sent to recycling plants. This reduces the volume of garbage sent to landfill sites. Every citizen plays an important role.',
    grammarBreakdown: '1. Passive voice modal ("can be used").\n2. Contrastive subordinator ("while").\n3. Reduced participle phrase ("sent to landfill sites").',
    createdAt: nowIso
  },
  {
    id: 'para_b1_20',
    themeCategory: 'Cultural Diversity',
    subTopic: 'Respecting Traditional Cultural Values',
    targetBand: 'B1',
    vietnameseParagraph: 'Bảo tồn văn hóa truyền thống là trách nhiệm của mọi thế hệ trong thời kỳ hội nhập. Các lễ hội dân gian và trang phục truyền thống thể hiện bản sắc riêng của mỗi dân族. Giữ gìn nét đẹp văn hóa giúp kết nối quá khứ với hiện tại. Chúng ta cần tự hào về di sản của dân tộc.',
    targetCollocationsJson: JSON.stringify([
      { term: 'preserve traditional culture', meaning: 'bảo tồn văn hóa truyền thống' },
      { term: 'cultural identity', meaning: 'bản sắc văn hóa' },
      { term: 'folk festivals', meaning: 'lễ hội dân gian' },
      { term: 'national heritage', meaning: 'di sản dân tộc' }
    ]),
    modelTranslation: 'Preserving traditional culture is the responsibility of every generation in an era of integration. Folk festivals and traditional costumes display the unique identity of each ethnic group. Safeguarding cultural beauty helps connect the past with the present. We need to be proud of our national heritage.',
    grammarBreakdown: '1. Prepositional modification ("in an era of integration").\n2. Parallel noun phrase object ("connect the past with the present").\n3. Adjective complement ("be proud of").',
    createdAt: nowIso
  },

  // ==========================================
  // LEVEL B2 (20 Exercises)
  // ==========================================
  {
    id: 'para_b2_01',
    themeCategory: 'Work, Career & Modern Society',
    subTopic: 'Work-Life Balance in the Digital Era',
    targetBand: 'B2',
    vietnameseParagraph: 'Cân bằng giữa công việc và cuộc sống cá nhân là yếu tố then chốt giúp nâng cao chất lượng cuộc sống. Mặc dù công nghệ hiện đại giúp làm việc từ xa dễ dàng hơn, nó cũng khiến ranh giới giữa giờ làm và giờ nghỉ bị xóa mờ. Do đó, các công ty nên khuyến khích nhân viên ngắt kết nối sau giờ làm.',
    targetCollocationsJson: JSON.stringify([
      { term: 'work-life balance', meaning: 'cân bằng công việc - cuộc sống' },
      { term: 'remote work', meaning: 'làm việc từ xa' },
      { term: 'blur the boundary', meaning: 'xóa mờ ranh giới' },
      { term: 'disconnect after work', meaning: 'ngắt kết nối sau giờ làm' }
    ]),
    modelTranslation: 'Achieving a healthy work-life balance is a key factor in improving overall quality of life. Although modern technology makes remote work much easier, it also blurs the boundary between work and rest hours. Therefore, companies should encourage employees to disconnect after working hours.',
    grammarBreakdown: '1. Gerund subject ("Achieving a healthy work-life balance...").\n2. Concessive clause ("Although modern technology makes...").\n3. Modal recommendation ("should encourage employees to disconnect").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_02',
    themeCategory: 'Urbanization & City Planning',
    subTopic: 'Challenges of Rapid Urbanization',
    targetBand: 'B2',
    vietnameseParagraph: 'Tốc độ đô thị hóa nhanh chóng đang tạo ra áp lực nặng nề lên cơ sở hạ tầng giao thông và nhà ở. Hàng triệu người di cư ra thành phố khiến vấn đề ô nhiễm môi trường và thiếu hụt không gian xanh trở nên trầm trọng. Chính quyền địa phương cần phê duyệt các quy hoạch đô thị bền vững.',
    targetCollocationsJson: JSON.stringify([
      { term: 'rapid urbanization', meaning: 'đô thị hóa nhanh chóng' },
      { term: 'heavy pressure', meaning: 'áp lực nặng nề' },
      { term: 'green space shortage', meaning: 'thiếu hụt không gian xanh' },
      { term: 'sustainable urban planning', meaning: 'quy hoạch đô thị bền vững' }
    ]),
    modelTranslation: 'The rapid pace of urbanization is exerting heavy pressure on transport infrastructure and housing. Millions of migrants moving to cities have aggravated environmental pollution and green space shortages. Local authorities urgently need to approve sustainable urban planning schemes.',
    grammarBreakdown: '1. Idiomatic verb phrase ("exerting heavy pressure on").\n2. Present perfect cause-and-effect ("have aggravated").\n3. Urgent modal requirement ("urgently need to approve").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_03',
    themeCategory: 'Green Technology & Environment',
    subTopic: 'Transitioning to Renewable Energy Grids',
    targetBand: 'B2',
    vietnameseParagraph: 'Chuyển đổi sang năng lượng tái tạo là bước đi bắt buộc để ứng phó với biến đổi khí hậu toàn cầu. Việc thay thế nhiên liệu hóa thạch bằng năng lượng gió và mặt trời sẽ làm giảm đáng kể lượng phát thải khí nhà kính. Tuy nhiên, việc lưu trữ năng lượng vẫn còn là một thách thức kỹ thuật lớn.',
    targetCollocationsJson: JSON.stringify([
      { term: 'transitioning to renewable energy', meaning: 'chuyển đổi sang năng lượng tái tạo' },
      { term: 'fossil fuels', meaning: 'nhiên liệu hóa thạch' },
      { term: 'greenhouse gas emissions', meaning: 'phát thải khí nhà kính' },
      { term: 'technological challenge', meaning: 'thách thức kỹ thuật' }
    ]),
    modelTranslation: 'Transitioning to renewable energy represents a mandatory step in addressing global climate change. Replacing fossil fuels with wind and solar power will significantly curtail greenhouse gas emissions. Nevertheless, energy storage remains a major technological challenge.',
    grammarBreakdown: '1. Formal verb predicate ("represents a mandatory step").\n2. Gerund subject ("Replacing fossil fuels...").\n3. Transition adverb ("Nevertheless").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_04',
    themeCategory: 'Artificial Intelligence & Ethics',
    subTopic: 'AI Automation in Daily Industry Operations',
    targetBand: 'B2',
    vietnameseParagraph: 'Sự xuất hiện của công nghệ trí tuệ nhân tạo đang tối ưu hóa nhiều quy trình sản xuất và kinh doanh. Robot tự động có khả năng xử lý khối lượng công việc khổng lồ với độ chính xác cao tuyệt đối. Mặc dù vậy, sự thay thế lao động con người có nguy cơ gia tăng tỷ lệ thất nghiệp.',
    targetCollocationsJson: JSON.stringify([
      { term: 'AI adoption', meaning: 'ứng dụng trí tuệ nhân tạo' },
      { term: 'optimize production', meaning: 'tối ưu hóa sản xuất' },
      { term: 'absolute accuracy', meaning: 'độ chính xác tuyệt đối' },
      { term: 'unemployment rate', meaning: 'tỷ lệ thất nghiệp' }
    ]),
    modelTranslation: 'The emergence of artificial intelligence technology is optimizing numerous manufacturing and business processes. Automated robots possess the capacity to handle massive workloads with absolute precision. Despite this, replacing human labour risks exacerbating unemployment rates.',
    grammarBreakdown: '1. Present continuous trend ("is optimizing").\n2. Noun collocation ("capacity to handle massive workloads").\n3. Prepositional contrast ("Despite this, replacing... risks").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_05',
    themeCategory: 'Mental Health & Modern Lifestyle',
    subTopic: 'Raising Mental Health Awareness',
    targetBand: 'B2',
    vietnameseParagraph: 'Nâng cao nhận thức về sức khỏe tinh thần là chủ đề đang nhận được sự quan tâm rộng rãi từ xã hội. Áp lực công việc và sự so sánh trên mạng xã hội dễ khiến người trẻ rơi vào trạng thái trầm cảm. Việc tìm kiếm tư vấn tâm lý nên được nhìn nhận một cách cởi mở thay vì kì thị.',
    targetCollocationsJson: JSON.stringify([
      { term: 'mental health awareness', meaning: 'nhận thức sức khỏe tinh thần' },
      { term: 'widespread attention', meaning: 'sự quan tâm rộng rãi' },
      { term: 'fall into depression', meaning: 'rơi vào trầm cảm' },
      { term: 'psychological counseling', meaning: 'tư vấn tâm lý' }
    ]),
    modelTranslation: 'Raising mental health awareness is a topic receiving widespread attention from modern society. Work pressures and social media comparisons easily drive young people into depressive states. Seeking psychological counseling should be viewed openly rather than stigmatized.',
    grammarBreakdown: '1. Participle phrase post-modifier ("a topic receiving widespread attention").\n2. Causative action ("drive young people into depressive states").\n3. Passive comparison ("viewed openly rather than stigmatized").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_06',
    themeCategory: 'Global Trade & Economics',
    subTopic: 'Impact of E-commerce on Global Supply Chains',
    targetBand: 'B2',
    vietnameseParagraph: 'Sự phát triển bùng nổ của thương mại điện tử đã thay đổi hoàn toàn phương thức vận hành của chuỗi cung ứng toàn cầu. Khách hàng giờ đây kỳ vọng giao hàng siêu tốc và theo dõi đơn hàng theo thời gian thực. Điều này buộc các doanh nghiệp logistics phải chuyển đổi số toàn diện.',
    targetCollocationsJson: JSON.stringify([
      { term: 'e-commerce boom', meaning: 'bùng nổ thương mại điện tử' },
      { term: 'global supply chains', meaning: 'chuỗi cung ứng toàn cầu' },
      { term: 'real-time tracking', meaning: 'theo dõi thời gian thực' },
      { term: 'digital transformation', meaning: 'chuyển đổi số' }
    ]),
    modelTranslation: 'The explosive growth of e-commerce has fundamentally transformed the operation of global supply chains. Consumers now expect ultra-fast delivery and real-time order tracking. This compels logistics enterprises to undergo comprehensive digital transformation.',
    grammarBreakdown: '1. Adverbial modifier ("fundamentally transformed").\n2. Temporal reference ("now expect").\n3. Active causative ("compels logistics enterprises to undergo").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_07',
    themeCategory: 'Sustainable Tourism',
    subTopic: 'Promoting Sustainable Eco-Tourism',
    targetBand: 'B2',
    vietnameseParagraph: 'Du lịch sinh thái bền vững nhằm mục đích bảo vệ đa dạng sinh học và đem lại lợi ích kinh tế trực tiếp cho cộng đồng địa phương. Khách du lịch được khuyến khích tôn trọng phong tục tập quán và hạn chế tối đa việc gây tổn hại tài nguyên thiên nhiên. Đây là giải pháp ngăn chặn tình trạng du lịch quá tải.',
    targetCollocationsJson: JSON.stringify([
      { term: 'sustainable eco-tourism', meaning: 'du lịch sinh thái bền vững' },
      { term: 'protect biodiversity', meaning: 'bảo vệ đa dạng sinh học' },
      { term: 'respect local customs', meaning: 'tôn trọng phong tục địa phương' },
      { term: 'overtourism prevention', meaning: 'ngăn chặn du lịch quá tải' }
    ]),
    modelTranslation: 'Sustainable eco-tourism aims to protect biodiversity and bring direct economic benefits to local communities. Tourists are encouraged to respect indigenous customs and minimize damage to natural resources. This serves as a vital measure to prevent overtourism.',
    grammarBreakdown: '1. Dual infinitive purpose ("to protect... and bring").\n2. Passive recommendation ("are encouraged to respect").\n3. Functional predicate ("serves as a vital measure").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_08',
    themeCategory: 'Education & Lifelong Learning',
    subTopic: 'Cultivating Lifelong Learning Skills',
    targetBand: 'B2',
    vietnameseParagraph: 'Trong một thị trường lao động biến động không ngừng, khả năng tự học và học tập suốt đời là chìa khóa duy nhất để duy trì năng lực cạnh tranh. Bằng cấp đại học không còn là đảm bảo vĩnh viễn cho thành công sự nghiệp. Người lao động cần liên tục cập nhật kỹ năng mới.',
    targetCollocationsJson: JSON.stringify([
      { term: 'volatile job market', meaning: 'thị trường lao động biến động' },
      { term: 'lifelong learning', meaning: 'học tập suốt đời' },
      { term: 'maintain competitiveness', meaning: 'duy trì năng lực cạnh tranh' },
      { term: 'upskill continuously', meaning: 'liên tục cập nhật kỹ năng' }
    ]),
    modelTranslation: 'In an ever-changing job market, the capacity for self-study and lifelong learning serves as the sole key to maintaining competitiveness. A university degree is no longer a permanent guarantee of career success. Employees must continuously upskill themselves to adapt to industry demands.',
    grammarBreakdown: '1. Compound adjective modifier ("ever-changing job market").\n2. Prepositional gerund ("key to maintaining competitiveness").\n3. Modal necessity ("must continuously upskill").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_09',
    themeCategory: 'Media & Journalism',
    subTopic: 'Fake News and Information Reliability',
    targetBand: 'B2',
    vietnameseParagraph: 'Sự lan truyền của tin giả trên các nền tảng truyền thông số đang làm suy giảm niềm tin của công chúng vào báo chí chính thống. Bất kỳ ai cũng có thể xuất bản thông tin chưa qua kiểm chứng chỉ trong vài giây. Người đọc cần trang bị kỹ năng phân tích phản biện để nhận diện sự thật.',
    targetCollocationsJson: JSON.stringify([
      { term: 'spread of fake news', meaning: 'lan truyền tin giả' },
      { term: 'public trust', meaning: 'niềm tin công chúng' },
      { term: 'unverified information', meaning: 'thông tin chưa kiểm chứng' },
      { term: 'critical analysis skills', meaning: 'kỹ năng phân tích phản biện' }
    ]),
    modelTranslation: 'The proliferation of fake news on digital media platforms is eroding public trust in mainstream journalism. Anyone can publish unverified information within seconds. Readers urgently need to equip themselves with critical analysis skills to discern the truth.',
    grammarBreakdown: '1. Nominalization subject ("proliferation of fake news").\n2. Time prepositional phrase ("within seconds").\n3. Reflexive verb requirement ("equip themselves with").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_10',
    themeCategory: 'Gender Equality',
    subTopic: 'Promoting Gender Equality in Leadership',
    targetBand: 'B2',
    vietnameseParagraph: 'Thúc đẩy bình đẳng giới trong các vị trí lãnh đạo doanh nghiệp là tiêu chuẩn quan trọng của quản trị hiện đại. Việc trao quyền cho nữ giới giúp đa dạng hóa góc nhìn quản lý và đưa ra quyết định sáng suốt hơn. Nhiều quốc gia đã áp dụng chính sách tỷ lệ nữ giới tối thiểu trong hội đồng quản trị.',
    targetCollocationsJson: JSON.stringify([
      { term: 'gender equality', meaning: 'bình đẳng giới' },
      { term: 'leadership positions', meaning: 'vị trí lãnh đạo' },
      { term: 'empower women', meaning: 'trao quyền cho nữ giới' },
      { term: 'board of directors', meaning: 'hội đồng quản trị' }
    ]),
    modelTranslation: 'Promoting gender equality in corporate leadership positions constitutes a vital benchmark of modern governance. Empowering women helps diversify management perspectives and produce wiser decisions. Numerous nations have instituted quota policies for female representation on boards of directors.',
    grammarBreakdown: '1. Formal verb connector ("constitutes a vital benchmark").\n2. Parallel infinitive complements ("diversify... and produce").\n3. Present perfect institutional action ("have instituted quota policies").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_11',
    themeCategory: 'Heritage Conservation',
    subTopic: 'Preserving Historic Buildings in Modern Cities',
    targetBand: 'B2',
    vietnameseParagraph: 'Việc bảo tồn các di tích lịch sử trong lòng đô thị hiện đại thường gặp phải xung đột với lợi ích kinh tế từ bất động sản. Nhiều công trình cổ bị phá dỡ để nhường chỗ cho các cao ốc sang trọng. Việc tìm kiếm sự hài hòa giữa di sản và phát triển là nhiệm vụ cấp thiết.',
    targetCollocationsJson: JSON.stringify([
      { term: 'historic landmarks', meaning: 'di tích lịch sử' },
      { term: 'conflict of interest', meaning: 'xung đột lợi ích' },
      { term: 'real estate development', meaning: 'phát triển bất động sản' },
      { term: 'striking a balance', meaning: 'tìm kiếm sự hài hòa' }
    ]),
    modelTranslation: 'Preserving historic landmarks within modern urban spaces frequently encounters conflict with real estate economic interests. Many ancient structures are demolished to make way for luxury high-rises. Striking a balance between heritage conservation and urban development represents an urgent imperative.',
    grammarBreakdown: '1. Transitive gerund subject ("Preserving historic landmarks... encounters").\n2. Passive voice of displacement ("are demolished to make way for").\n3. Abstract gerund predicate ("Striking a balance... represents").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_12',
    themeCategory: 'Ocean & Marine Life',
    subTopic: 'Combating Ocean Plastic Pollution',
    targetBand: 'B2',
    vietnameseParagraph: 'Ô nhiễm rác thải nhựa đại dương đang đe dọa nghiêm trọng sự sống của vô số loài sinh vật biển. Rác nhựa không thể phân hủy phân rã thành vi nhựa và đi vào chuỗi thức ăn của con người. Các điều ước quốc tế về bảo vệ đại dương cần được thực thi nghiêm túc hơn.',
    targetCollocationsJson: JSON.stringify([
      { term: 'ocean plastic pollution', meaning: 'ô nhiễm rác thải nhựa đại dương' },
      { term: 'marine ecosystem', meaning: 'sinh vật biển' },
      { term: 'human food chain', meaning: 'chuỗi thức ăn con người' },
      { term: 'international treaties', meaning: 'điều ước quốc tế' }
    ]),
    modelTranslation: 'Ocean plastic pollution severely threatens the survival of countless marine species. Non-biodegradable plastic debris breaks down into microplastics, ultimately entering the human food chain. International treaties on ocean protection must be enforced far more rigorously.',
    grammarBreakdown: '1. Adverbial emphasis ("severely threatens").\n2. Participial clause of result ("ultimately entering the human food chain").\n3. Passive modal comparison ("must be enforced far more rigorously").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_13',
    themeCategory: 'Youth Entrepreneurship',
    subTopic: 'The Rise of Tech Startups among Youth',
    targetBand: 'B2',
    vietnameseParagraph: 'Làn sóng khởi nghiệp công nghệ trong giới trẻ đang tạo ra động lực mới cho nền kinh tế quốc gia. Nhờ sự hỗ trợ từ các quỹ đầu tư mạo hiểm và hệ sinh thái khởi nghiệp, nhiều ý tưởng táo bạo đã biến thành doanh nghiệp triệu đô. Tuy nhiên, rủi ro thất bại trong 3 năm đầu vẫn ở mức rất cao.',
    targetCollocationsJson: JSON.stringify([
      { term: 'tech startup wave', meaning: 'làn sóng khởi nghiệp công nghệ' },
      { term: 'venture capital funds', meaning: 'quỹ đầu tư mạo hiểm' },
      { term: 'bold ideas', meaning: 'ý tưởng táo bạo' },
      { term: 'risk of failure', meaning: 'rủi ro thất bại' }
    ]),
    modelTranslation: 'The wave of youth tech startups is generating fresh momentum for the national economy. Supported by venture capital funds and incubation ecosystems, many bold concepts have evolved into multi-million dollar enterprises. Nonetheless, the failure rate within the first three years remains formidable.',
    grammarBreakdown: '1. Past participle introductory phrase ("Supported by venture capital funds...").\n2. Present perfect result ("have evolved into").\n3. Formal contrast adverb ("Nonetheless").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_14',
    themeCategory: 'Gaming & E-sports',
    subTopic: 'E-sports as a Professional Career Choice',
    targetBand: 'B2',
    vietnameseParagraph: 'Thể thao điện tử không còn đơn thuần là trò chơi giải trí mà đã phát triển thành một ngành công nghiệp trị giá hàng tỷ đô-la. Các vận động viên e-sports chuyên nghiệp phải trải qua quá trình huấn luyện khắc nghiệt về phản xạ và chiến thuật. Mặc dù vậy, tuổi thọ nghề nghiệp của họ thường khá ngắn.',
    targetCollocationsJson: JSON.stringify([
      { term: 'professional e-sports', meaning: 'thể thao điện tử chuyên nghiệp' },
      { term: 'billion-dollar industry', meaning: 'ngành công nghiệp tỷ đô' },
      { term: 'rigorous training', meaning: 'huấn luyện khắc nghiệt' },
      { term: 'career span', meaning: 'tuổi thọ nghề nghiệp' }
    ]),
    modelTranslation: 'E-sports is no longer merely recreational entertainment; it has expanded into a multi-billion-dollar global industry. Professional e-sports athletes undergo rigorous training regimes regarding reflexes and strategic planning. Despite this financial allure, their average career span remains relatively short.',
    grammarBreakdown: '1. Semicolon compound structure ("no longer merely ...; it has expanded").\n2. Active verb choice ("undergo rigorous training regimes").\n3. Prepositional phrase of contrast ("Despite this financial allure").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_15',
    themeCategory: 'Healthcare Systems',
    subTopic: 'Challenges in Public Healthcare Systems',
    targetBand: 'B2',
    vietnameseParagraph: 'Hệ thống y tế công cộng ở nhiều quốc gia đang đối mặt với nguy cơ quá tải do dân số già hóa nhanh chóng. Chi phí khám chữa bệnh gia tăng đang trở thành gánh nặng lớn cho ngân sách nhà nước. Việc ứng dụng y tế số và khám bệnh từ xa được kỳ vọng sẽ làm giảm áp lực cho các bệnh viện tuyến trên.',
    targetCollocationsJson: JSON.stringify([
      { term: 'public healthcare system', meaning: 'hệ thống y tế công cộng' },
      { term: 'aging population', meaning: 'dân số già hóa' },
      { term: 'budgetary burden', meaning: 'gánh nặng ngân sách' },
      { term: 'telemedicine adoption', meaning: 'khám bệnh từ xa' }
    ]),
    modelTranslation: 'Public healthcare systems in numerous countries face overcrowding risks owing to a rapidly aging population. Escalating medical treatment costs are placing immense burdens on national budgets. Telemedicine adoption and digital health solutions are expected to alleviate pressure on central hospitals.',
    grammarBreakdown: '1. Prepositional cause ("owing to a rapidly aging population").\n2. Continuous metaphor ("placing immense burdens on").\n3. Passive expectation with infinitive ("are expected to alleviate").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_16',
    themeCategory: 'Modern Architecture',
    subTopic: 'Green Building Design in Urban Landscapes',
    targetBand: 'B2',
    vietnameseParagraph: 'Xu hướng kiến trúc xanh đòi hỏi các kiến trúc sử dụng vật liệu thân thiện với môi trường và tối ưu hóa ánh sáng tự nhiên. Việc tích hợp cây xanh vào mặt đứng tòa nhà giúp giảm nhiệt độ đô thị và lọc bụi mịn. Đây không chỉ là xu hướng thẩm mỹ mà còn là giải pháp tiết kiệm năng lượng.',
    targetCollocationsJson: JSON.stringify([
      { term: 'green building design', meaning: 'kiến trúc xanh' },
      { term: 'eco-friendly materials', meaning: 'vật liệu thân thiện môi trường' },
      { term: 'optimize natural light', meaning: 'tối ưu hóa ánh sáng tự nhiên' },
      { term: 'energy-saving solution', meaning: 'giải pháp tiết kiệm năng lượng' }
    ]),
    modelTranslation: 'The green architecture trend mandates architects to utilize eco-friendly materials and optimize natural lighting. Integrating vegetation into building facades helps lower urban temperatures and filter fine dust. This represents not merely an aesthetic choice, but a vital energy-saving solution.',
    grammarBreakdown: '1. Mandate + object + infinitive ("mandates architects to utilize").\n2. Parallel infinitive verbs ("lower ... and filter").\n3. Correlative inversion phrase ("not merely ... but a vital").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_17',
    themeCategory: 'Consumerism & Waste',
    subTopic: 'Overcoming Fast Fashion Consumerism',
    targetBand: 'B2',
    vietnameseParagraph: 'Thời trang nhanh khuyến khích người tiêu dùng mua sắm liên tục quần áo giá rẻ và thải bỏ chúng chỉ sau vài lần mặc. Hành vi này gây ra ô nhiễm nguồn nước nghiêm trọng do hóa chất nhuộm vải. Người tiêu dùng cần chuyển sang xu hướng thời trang bền vững và tái sử dụng.',
    targetCollocationsJson: JSON.stringify([
      { term: 'fast fashion', meaning: 'thời trang nhanh' },
      { term: 'cheap clothing', meaning: 'quần áo giá rẻ' },
      { term: 'water pollution', meaning: 'ô nhiễm nguồn nước' },
      { term: 'sustainable fashion', meaning: 'thời trang bền vững' }
    ]),
    modelTranslation: 'Fast fashion encourages consumers to constantly purchase cheap clothing and discard items after just a few wears. This practice causes severe water pollution due to toxic textile dyes. Consumers ought to shift toward sustainable fashion practices and garment reuse.',
    grammarBreakdown: '1. Encourage + object + infinitive ("encourages consumers to constantly purchase").\n2. Cause + noun + preposition ("causes severe water pollution due to").\n3. Modal obligation phrase ("ought to shift toward").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_18',
    themeCategory: 'Space Exploration',
    subTopic: 'Commercial Space Exploration and Mining',
    targetBand: 'B2',
    vietnameseParagraph: 'Ngành khai thác vũ trụ thương mại đang thu hút nguồn vốn tư nhân khổng lồ từ các tập đoàn công nghệ lớn. Việc khai thác khoáng sản trên tiểu hành tinh được kỳ vọng sẽ giải quyết tình trạng khan hiếm tài nguyên trên Trái Đất. Tuy nhiên, luật pháp quốc tế chưa có quy định rõ ràng về quyền sở hữu không gian.',
    targetCollocationsJson: JSON.stringify([
      { term: 'commercial space exploration', meaning: 'khai thác vũ trụ thương mại' },
      { term: 'asteroid mining', meaning: 'khai thác tiểu hành tinh' },
      { term: 'resource scarcity', meaning: 'khan hiếm tài nguyên' },
      { term: 'space ownership rights', meaning: 'quyền sở hữu không gian' }
    ]),
    modelTranslation: 'The commercial space exploration industry is attracting immense private capital from major tech conglomerates. Mining minerals on asteroids is anticipated to resolve Earth’s resource scarcity. However, international law lacks explicit regulations regarding space ownership rights.',
    grammarBreakdown: '1. Active progressive ("is attracting immense private capital").\n2. Passive anticipation ("is anticipated to resolve").\n3. Prepositional complement ("regulations regarding space ownership rights").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_19',
    themeCategory: 'Food Security',
    subTopic: 'Vertical Farming and Agricultural Innovation',
    targetBand: 'B2',
    vietnameseParagraph: 'Mô hình nông nghiệp thẳng đứng trong nhà đang được coi là giải pháp tiên phong để đảm bảo an ninh thực phẩm đô thị. Phương pháp này tiết kiệm đến 95% lượng nước so với canh tác truyền thống và không phụ thuộc vào thời tiết. Đây là chìa khóa để cung cấp thực phẩm sạch cho các siêu đô thị.',
    targetCollocationsJson: JSON.stringify([
      { term: 'vertical farming', meaning: 'nông nghiệp thẳng đứng' },
      { term: 'urban food security', meaning: 'an ninh thực phẩm đô thị' },
      { term: 'traditional agriculture', meaning: 'canh tác truyền thống' },
      { term: 'clean food supply', meaning: 'cung cấp thực phẩm sạch' }
    ]),
    modelTranslation: 'Indoor vertical farming is increasingly viewed as a pioneering solution to ensure urban food security. This method conserves up to 95% of water compared to traditional cultivation and operates independently of weather conditions. It serves as a key to supplying clean produce to megacities.',
    grammarBreakdown: '1. Passive perception clause ("is increasingly viewed as").\n2. Preposition of comparison ("compared to traditional cultivation").\n3. Prepositional gerund complement ("key to supplying clean produce").',
    createdAt: nowIso
  },
  {
    id: 'para_b2_20',
    themeCategory: 'Artificial Intelligence & Art',
    subTopic: 'AI Generative Art and Copyright Debates',
    targetBand: 'B2',
    vietnameseParagraph: 'Sự ra đời của các công cụ tạo ảnh bằng AI đang gây ra những tranh cãi nảy lửa trong cộng đồng nghệ sĩ chuyên nghiệp. AI có thể tạo ra bức tranh phức tạp chỉ từ vài dòng mô tả bằng văn bản. Việc này dấy lên nghi vấn về bản quyền và định nghĩa thực sự về sự sáng tạo nghệ thuật.',
    targetCollocationsJson: JSON.stringify([
      { term: 'AI generative art', meaning: 'nghệ thuật tạo bởi AI' },
      { term: 'fierce debate', meaning: 'tranh cãi nảy lửa' },
      { term: 'copyright infringement', meaning: 'vi phạm bản quyền' },
      { term: 'artistic creativity', meaning: 'sáng tạo nghệ thuật' }
    ]),
    modelTranslation: 'The advent of AI image generation tools is sparking fierce debates within the professional artistic community. AI can produce complex paintings merely from text prompts. This raises fundamental questions regarding copyright ownership and the true definition of artistic creativity.',
    grammarBreakdown: '1. Noun phrase subject ("The advent of AI image generation tools").\n2. Adverbial modifier ("merely from text prompts").\n3. Transitive verb choice ("raises fundamental questions regarding").',
    createdAt: nowIso
  },

  // ==========================================
  // LEVEL C1 (20 Exercises)
  // ==========================================
  {
    id: 'para_c1_01',
    themeCategory: 'Education & Emerging Technology',
    subTopic: 'The Impact of Artificial Intelligence on Higher Education',
    targetBand: 'C1',
    vietnameseParagraph: 'Việc ứng dụng trí tuệ nhân tạo trong giáo dục đại học đang mang lại nhiều thay đổi sâu sắc. Nhờ có các công cụ học tập thông minh, sinh viên có thể tiếp cận nguồn tri thức cá nhân hóa theo tốc độ riêng. Tuy nhiên, nhiều chuyên gia lo ngại rằng sự phụ thuộc quá mức vào công nghệ có thể làm suy giảm khả năng tư duy phản biện của người học.',
    targetCollocationsJson: JSON.stringify([
      { term: 'profound transformations', meaning: 'những thay đổi sâu sắc' },
      { term: 'personalized learning experiences', meaning: 'trải nghiệm học tập cá nhân hóa' },
      { term: 'over-reliance on technology', meaning: 'sự phụ thuộc quá mức vào công nghệ' },
      { term: 'critical thinking skills', meaning: 'kỹ năng tư duy phản biện' }
    ]),
    modelTranslation: 'The adoption of artificial intelligence in higher education is bringing about profound transformations. Thanks to intelligent learning tools, students can access personalized learning experiences tailored to their own pace. However, many experts express concern that an over-reliance on technology may impair learners’ critical thinking skills.',
    grammarBreakdown: '1. Nominalization ("adoption of artificial intelligence") creates formal academic style.\n2. Reduced participle phrase ("tailored to their own pace") compactly modifies personalized learning experiences.\n3. Modal auxiliary ("may impair") expresses nuanced academic probability.',
    createdAt: nowIso
  },
  {
    id: 'para_c1_02',
    themeCategory: 'Economics & Financial Systems',
    subTopic: 'Central Bank Digital Currencies and Financial Stability',
    targetBand: 'C1',
    vietnameseParagraph: 'Sự trỗi dậy của tiền kỹ thuật số do ngân hàng trung ương phát hành đang đặt ra những bài toán hóc húa về quản trị tiền tệ quốc gia. Mô hình này hứa hẹn cắt giảm chi phí giao dịch liên quốc gia và tăng cường tính minh bạch tài chính. Ngược lại, các ngân hàng thương mại đứng trước rủi ro bị rút tiền hàng loạt trong thời kỳ khủng hoảng.',
    targetCollocationsJson: JSON.stringify([
      { term: 'Central Bank Digital Currency (CBDC)', meaning: 'tiền kỹ thuật số ngân hàng trung ương' },
      { term: 'monetary governance', meaning: 'quản trị tiền tệ' },
      { term: 'cross-border transactions', meaning: 'giao dịch liên quốc gia' },
      { term: 'bank run risk', meaning: 'rủi ro rút tiền hàng loạt' }
    ]),
    modelTranslation: 'The ascendancy of central bank digital currencies poses intricate dilemmas regarding sovereign monetary governance. While promising to drastically curtail cross-border transaction costs and enhance financial transparency, this paradigm exposes commercial banks to heightened risks of liquidity runs during systemic crises.',
    grammarBreakdown: '1. Advanced nominalization ("ascendancy of central bank digital currencies").\n2. Reduced participle clause of contrast ("While promising to drastically curtail...").\n3. Prepositional complement phrase ("exposes commercial banks to heightened risks").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_03',
    themeCategory: 'Law & Surveillance Technology',
    subTopic: 'Facial Recognition and Civil Liberties',
    targetBand: 'C1',
    vietnameseParagraph: 'Việc triển khai rộng rãi công nghệ nhận diện khuôn mặt tại các nơi công cộng đang làm gia tăng tranh cãi giữa an ninh quốc gia và quyền riêng tư cá nhân. Mặc dù giúp lực lượng hành pháp phát hiện tội phạm nhanh chóng, sự giám sát liên tục này nguy cơ biến xã hội thành một môi trường bị kiểm soát nghiêm ngặt. Các nhà lập pháp cần sớm ban hành khung pháp lý nghiêm ngặt.',
    targetCollocationsJson: JSON.stringify([
      { term: 'facial recognition technology', meaning: 'công nghệ nhận diện khuôn mặt' },
      { term: 'civil liberties', meaning: 'quyền riêng tư cá nhân' },
      { term: 'law enforcement', meaning: 'lực lượng hành pháp' },
      { term: 'regulatory framework', meaning: 'khung pháp lý' }
    ]),
    modelTranslation: 'The pervasive deployment of facial recognition technology in public spaces has escalated the friction between national security imperatives and individual civil liberties. Although enabling law enforcement to apprehend suspects efficiently, perpetual surveillance risks transforming society into a panoptic regime. Lawmakers must expeditiously enact stringent regulatory frameworks.',
    grammarBreakdown: '1. Subject noun phrase with Latinate vocabulary ("pervasive deployment of facial recognition").\n2. Reduced participial clause ("Although enabling law enforcement to...").\n3. Advanced adverbial modifier ("expeditiously enact stringent regulatory frameworks").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_04',
    themeCategory: 'Genetic Engineering & Ethics',
    subTopic: 'CRISPR Gene Editing and Human Germline Modification',
    targetBand: 'C1',
    vietnameseParagraph: 'Đột phá trong công nghệ chỉnh sửa gen CRISPR mở ra khả năng loại bỏ tận gốc các bệnh di truyền nan y ở con người. Tuy nhiên, việc can thiệp vào mã gen của phôi thai người dấy lên lo ngại sâu sắc về mặt đạo đức và nguy cơ tạo ra sự bất bình đẳng sinh học. Ranh giới giữa chữa bệnh và cải tạo con người trở nên vô cùng mong manh.',
    targetCollocationsJson: JSON.stringify([
      { term: 'CRISPR gene editing', meaning: 'chỉnh sửa gen CRISPR' },
      { term: 'hereditary diseases', meaning: 'bệnh di truyền' },
      { term: 'germline modification', meaning: 'can thiệp mã gen phôi thai' },
      { term: 'biological inequality', meaning: 'bất bình đẳng sinh học' }
    ]),
    modelTranslation: 'Breakthroughs in CRISPR gene-editing technology offer the prospect of eradicating debilitating hereditary diseases at their genetic root. Nevertheless, modifying the human germline raises profound ethical dilemmas concerning the risk of engendering biological inequality. The boundary demarcating therapeutic intervention from enhancement remains perilously thin.',
    grammarBreakdown: '1. Abstract noun phrase subject ("Breakthroughs in CRISPR gene-editing technology").\n2. Formal participle clause ("concerning the risk of engendering").\n3. Complex subject clause ("The boundary demarcating therapeutic intervention...").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_05',
    themeCategory: 'Corporate Governance & Ecology',
    subTopic: 'Greenwashing versus Genuine Corporate Sustainability',
    targetBand: 'C1',
    vietnameseParagraph: 'Hiện tượng "tẩy xanh" thương hiệu đang trở thành thủ đoạn phổ biến của nhiều tập đoàn nhằm đa số hóa lợi nhuận dưới vỏ bọc bảo vệ môi trường. Các chiến dịch truyền thông khéo léo giúp họ tạo dựng hình ảnh thân thiện với tự nhiên trong khi hoạt động cốt lõi vẫn xả thải độc hại. Giới chức trách cần áp dụng các chế tài phạt nặng đối với hành vi gian lận này.',
    targetCollocationsJson: JSON.stringify([
      { term: 'corporate greenwashing', meaning: 'tẩy xanh thương hiệu' },
      { term: 'environmental mask', meaning: 'vỏ bọc bảo vệ môi trường' },
      { term: 'toxic emissions', meaning: 'xả thải độc hại' },
      { term: 'stringent sanctions', meaning: 'chế tài phạt nặng' }
    ]),
    modelTranslation: 'Corporate greenwashing has increasingly emerged as a manipulative tactic employed by conglomerates to maximize profits under an environmental guise. Slick marketing campaigns fabricate an eco-friendly facade while core operations continue to discharge toxic emissions. Regulators ought to impose stringent sanctions on such deceptive practices.',
    grammarBreakdown: '1. Past participle relative reduction ("tactic employed by conglomerates").\n2. Parallel clause structure ("fabricate an eco-friendly facade while core operations continue").\n3. Formal modal construction ("ought to impose stringent sanctions").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_06',
    themeCategory: 'Biodiversity & Conservation',
    subTopic: 'Deforestation and Ecosystem Collapse in the Amazon',
    targetBand: 'C1',
    vietnameseParagraph: 'Tốc độ tàn phá rừng rậm Amazon không kiểm soát đang đẩy hệ sinh thái trái đất đến ngưỡng sụp đổ không thể đảo ngược. Việc đốn hạ cây rừng phục vụ chăn nuôi gia súc làm mất đi rừng hấp thụ carbon khổng lồ của hành tinh. Hậu quả là chu kỳ thời tiết toàn cầu bị đảo lộn nghiêm trọng.',
    targetCollocationsJson: JSON.stringify([
      { term: 'uncontrolled deforestation', meaning: 'tàn phá rừng không kiểm soát' },
      { term: 'irreversible collapse', meaning: 'sụp đổ không thể đảo ngược' },
      { term: 'carbon sink', meaning: 'rừng hấp thụ carbon' },
      { term: 'disrupt weather cycles', meaning: 'đảo lộn chu kỳ thời tiết' }
    ]),
    modelTranslation: 'Unchecked deforestation in the Amazon rainforest is propelling global ecosystems toward an irreversible tipping point. Clear-cutting forests to accommodate cattle ranching destroys the planet’s vital carbon sink, severely disrupting global climate patterns. International intervention is imperative to forestall ecological catastrophe.',
    grammarBreakdown: '1. Transitive continuous structure ("is propelling global ecosystems toward").\n2. Infinitive purpose phrase ("to accommodate cattle ranching").\n3. Participle clause of result ("severely disrupting global climate patterns").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_07',
    themeCategory: 'Universal Basic Income',
    subTopic: 'Universal Basic Income as a Technological Safety Net',
    targetBand: 'C1',
    vietnameseParagraph: 'Thu nhập cơ bản toàn dân (UBI) đang được thảo luận sôi nổi như một tấm lưới an toàn kinh tế tối ưu trong kỷ nguyên tự động hóa. Việc cấp phát khoản tiền cố định không điều kiện cho mọi công dân giúp giảm thiểu nghèo đói và gia tăng quyền tự chủ cá nhân. Dù vậy, gánh nặng tài chính lên ngân sách quốc gia vẫn là rào cản tranh cãi lớn nhất.',
    targetCollocationsJson: JSON.stringify([
      { term: 'Universal Basic Income (UBI)', meaning: 'thu nhập cơ bản toàn dân' },
      { term: 'economic safety net', meaning: 'tấm lưới an toàn kinh tế' },
      { term: 'unconditional cash transfer', meaning: 'cấp phát tiền không điều kiện' },
      { term: 'fiscal burden', meaning: 'gánh nặng tài chính' }
    ]),
    modelTranslation: 'Universal Basic Income (UBI) is garnering momentum as an indispensable economic safety net amid widespread technological disemployment. Unconditional cash transfers to all citizens promise to alleviate poverty and foster personal autonomy. Nevertheless, the colossal fiscal burden imposed on state treasuries remains the paramount bone of contention.',
    grammarBreakdown: '1. Passive idiom ("is garnering momentum as").\n2. Abstract infinitive complements ("promise to alleviate... and foster").\n3. Idiomatic noun phrase ("paramount bone of contention").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_08',
    themeCategory: 'Academic Freedom',
    subTopic: 'Academic Freedom and Intellectual Autonomy',
    targetBand: 'C1',
    vietnameseParagraph: 'Tự do học thuật là điều kiện tiên quyết duy trì tính độc lập tri thức của các trường đại học hàng đầu. Khi nghiên cứu khoa học chịu sự can thiệp từ áp lực chính trị hoặc tài trợ doanh nghiệp, tính trung thực của tri thức sẽ bị xâm hại. Bảo vệ quyền tự do phản biện của giới học giả là cốt lõi của xã hội dân chủ.',
    targetCollocationsJson: JSON.stringify([
      { term: 'academic freedom', meaning: 'tự do học thuật' },
      { term: 'intellectual autonomy', meaning: 'tính độc lập tri thức' },
      { term: 'political interference', meaning: 'can thiệp chính trị' },
      { term: 'scholarly critique', meaning: 'tự do phản biện của giới học giả' }
    ]),
    modelTranslation: 'Academic freedom serves as an indispensable prerequisite for preserving the intellectual autonomy of higher education institutions. When scientific research succumbs to political interference or commercial sponsorship constraints, objective truth is compromised. Safeguarding scholars’ freedom of dissent constitutes the bedrock of any democratic society.',
    grammarBreakdown: '1. Formal predicate ("serves as an indispensable prerequisite").\n2. Temporal condition clause ("When scientific research succumbs to...").\n3. Gerund subject ("Safeguarding scholars’ freedom... constitutes the bedrock").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_09',
    themeCategory: 'Microplastics & Ecosystems',
    subTopic: 'Bioaccumulation of Microplastics in Marine Food Webs',
    targetBand: 'C1',
    vietnameseParagraph: 'Sự tích tụ sinh học của vi nhựa trong hệ sinh thái biển đang thâm nhập sâu vào chuỗi thức ăn con người với quy mô chưa từng có. Những hạt nhựa nhỏ hơn sợi tóc hấp thụ các chất ô nhiễm hóa học độc hại và tích tụ trong mô của các loài hải sản. Tác động lâu dài của chúng đối với sức khỏe con người hiện vẫn chưa được làm sáng tỏ.',
    targetCollocationsJson: JSON.stringify([
      { term: 'bioaccumulation of microplastics', meaning: 'tích tụ sinh học vi nhựa' },
      { term: 'marine food web', meaning: 'hệ sinh thái / chuỗi thức ăn biển' },
      { term: 'toxic chemical pollutants', meaning: 'chất ô nhiễm hóa học độc hại' },
      { term: 'unprecedented scale', meaning: 'quy mô chưa từng có' }
    ]),
    modelTranslation: 'The bioaccumulation of microplastics within marine food webs is penetrating the human food chain on an unprecedented scale. These microscopic synthetic particles absorb toxic chemical pollutants and aggregate within the tissues of marine organisms. The long-term health ramifications for human consumers remain largely unmapped.',
    grammarBreakdown: '1. Present continuous trend ("is penetrating ... on an unprecedented scale").\n2. Active compound verbs ("absorb ... and aggregate").\n3. Formal predicate adjective ("remain largely unmapped").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_10',
    themeCategory: 'Brain-Computer Interfaces',
    subTopic: 'Neuralink and Brain-Computer Interface Ethics',
    targetBand: 'C1',
    vietnameseParagraph: 'Công nghệ giao diện não - máy tính (BCI) đang hứa hẹn khôi phục vận động cho những bệnh nhân bị liệt toàn thân. Việc cấy ghép chip điện tử trực tiếp vào vỏ não mở ra khả năng truyền tín hiệu thần kinh trực tiếp đến các thiết bị bên ngoài. Tuy nhiên, nguy cơ bị xâm nhập dữ liệu suy nghĩ dấy lên những lo ngại an ninh sinh học chưa từng có.',
    targetCollocationsJson: JSON.stringify([
      { term: 'Brain-Computer Interface (BCI)', meaning: 'giao diện não - máy tính' },
      { term: 'restore mobility', meaning: 'khôi phục vận động' },
      { term: 'neural signals', meaning: 'tín hiệu thần kinh' },
      { term: 'biosecurity concerns', meaning: 'lo ngại an ninh sinh học' }
    ]),
    modelTranslation: 'Brain-Computer Interface (BCI) technology promises to restore mobility to patients afflicted with severe paralysis. Implanting micro-chips directly into the cerebral cortex allows neural signals to control external devices seamlessly. Nevertheless, the vulnerability to neural data hacking introduces unprecedented biosecurity concerns.',
    grammarBreakdown: '1. Past participle adjective clause ("afflicted with severe paralysis").\n2. Gerund subject ("Implanting micro-chips... allows").\n3. Abstract noun subject ("vulnerability to neural data hacking introduces").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_11',
    themeCategory: 'Sustainable Agriculture',
    subTopic: 'Regenerative Farming Techniques for Soil Health',
    targetBand: 'C1',
    vietnameseParagraph: 'Nông nghiệp tái sinh đang được coi là mô hình đột phá để khôi phục chất lượng đất trồng bị suy thoái do hóa chất nông nghiệp. Bằng cách giảm xới đất và luân canh cây trồng liên tục, phương pháp này làm tăng hàm lượng hữu cơ và khả năng giữ nước của đất. Đây là yếu tố sống còn đảm bảo an ninh lương thực quốc gia.',
    targetCollocationsJson: JSON.stringify([
      { term: 'regenerative farming', meaning: 'nông nghiệp tái sinh' },
      { term: 'soil degradation', meaning: 'suy thoái đất trồng' },
      { term: 'crop rotation', meaning: 'luân canh cây trồng' },
      { term: 'national food security', meaning: 'an ninh lương thực quốc gia' }
    ]),
    modelTranslation: 'Regenerative agriculture is increasingly lauded as a breakthrough paradigm for restoring soil depleted by industrial agrochemicals. By minimizing tillage and implementing continuous crop rotation, this methodology enhances soil organic matter and water retention capacity. Such practices are vital for securing national food resiliency.',
    grammarBreakdown: '1. Passive perception structure ("is increasingly lauded as").\n2. Reduced participle modifying noun ("soil depleted by industrial agrochemicals").\n3. Prepositional gerund instrument ("By minimizing tillage and implementing").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_12',
    themeCategory: 'Cultural Imperialism',
    subTopic: 'Media Globalization and Cultural Homogenization',
    targetBand: 'C1',
    vietnameseParagraph: 'Sự thống trị của các tập đoàn truyền thông phương Tây đang dẫn đến nguy cơ đồng nhất hóa văn hóa trên quy mô toàn cầu. Các giá trị tiêu dùng và lối sống phương Tây dần lấn ạt những truyền thống bản địa độc đáo của các dân tộc nhỏ. Việc bảo tồn đa dạng văn hóa đòi hỏi những chính sách hỗ trợ điện ảnh và nghệ thuật nội địa mạnh mẽ.',
    targetCollocationsJson: JSON.stringify([
      { term: 'media imperialism', meaning: 'thống trị truyền thông' },
      { term: 'cultural homogenization', meaning: 'đồng nhất hóa văn hóa' },
      { term: 'indigenous traditions', meaning: 'truyền thống bản địa' },
      { term: 'cultural diversity', meaning: 'đa dạng văn hóa' }
    ]),
    modelTranslation: 'The dominance of Western media conglomerates raises concerns over global cultural homogenization. Western consumerist values and lifestyles threaten to eclipse unique indigenous traditions belonging to minority ethnicities. Safeguarding cultural diversity demands robust policy support for domestic arts and cinema.',
    grammarBreakdown: '1. Prepositional phrase object ("raises concerns over global cultural homogenization").\n2. Infinitive result clause ("threaten to eclipse unique indigenous traditions").\n3. Transitive gerund subject ("Safeguarding cultural diversity demands").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_13',
    themeCategory: 'Autonomous Vehicles & Ethics',
    subTopic: 'Ethical Dilemmas in Autonomous Vehicle Programming',
    targetBand: 'C1',
    vietnameseParagraph: 'Việc lập trình các thuật toán tự quyết cho xe tự lái đang đặt ra bài toán đạo đức "xe đâm" đầy hóc búa. Trong tình huống va chạm không thể tránh khỏi, máy tính phải đưa ra quyết định hi sinh ai để tối thiểu hóa thiệt hại về người. Thiếu các đồng thuận đạo đức chuẩn mực sẽ cản trở việc đưa xe tự lái vào đời sống.',
    targetCollocationsJson: JSON.stringify([
      { term: 'autonomous vehicles', meaning: 'xe tự lái' },
      { term: 'ethical dilemma', meaning: 'bài toán đạo đức' },
      { term: 'trolley problem algorithm', meaning: 'thuật toán xe đâm' },
      { term: 'minimize human casualties', meaning: 'tối thiểu hóa thiệt hại người' }
    ]),
    modelTranslation: 'Programming decision-making algorithms for autonomous vehicles resurrects the classical trolley problem in modern engineering. In an unavoidable collision scenario, the AI must determine whom to sacrifice to minimize overall human casualties. The absence of ethical consensus severely impedes the commercial rollout of self-driving cars.',
    grammarBreakdown: '1. Metaphorical active verb ("resurrects the classical trolley problem").\n2. Indirect question infinitive ("determine whom to sacrifice").\n3. Abstract cause subject ("The absence of ethical consensus severely impedes").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_14',
    themeCategory: 'Urban Traffic & Smart Mobility',
    subTopic: 'Congestion Pricing in Megacities',
    targetBand: 'C1',
    vietnameseParagraph: 'Áp dụng phí kẹt xe tại trung tâm các siêu đô thị đã chứng minh hiệu quả vượt trội trong việc triệt tiêu ùn tắc giờ cao điểm. Việc đánh thuế cao vào phương tiện cá nhân đi vào nội đô buộc người dân chuyển sang tàu điện ngầm và xe buýt nhanh. Nguồn thu này được tái đầu tư hoàn toàn vào nâng cấp hạ tầng giao thông công cộng.',
    targetCollocationsJson: JSON.stringify([
      { term: 'congestion pricing', meaning: 'phí kẹt xe' },
      { term: 'peak-hour traffic', meaning: 'ùn tắc giờ cao điểm' },
      { term: 'private vehicle tax', meaning: 'đánh thuế phương tiện cá nhân' },
      { term: 'public transit infrastructure', meaning: 'hạ tầng giao thông công cộng' }
    ]),
    modelTranslation: 'Implementing congestion pricing in megacity centers has demonstrated remarkable efficacy in curbing peak-hour traffic jams. Imposing steep fees on private vehicles entering downtown areas compels commuters to embrace subways and rapid transit. Revenues generated are reinvested into upgrading public transit infrastructure.',
    grammarBreakdown: '1. Present perfect result ("has demonstrated remarkable efficacy in").\n2. Active gerund clause ("Imposing steep fees ... compels commuters to").\n3. Reduced passive clause ("Revenues generated are reinvested into").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_15',
    themeCategory: 'Higher Education Tuition',
    subTopic: 'Student Debt Crisis and University Tuition Inflation',
    targetBand: 'C1',
    vietnameseParagraph: 'Trận khủng hoảng nợ sinh viên đang trở thành gánh nặng kinh tế trầm trọng làm suy giảm khả năng mua nhà của giới trẻ sau khi tốt nghiệp. Học phí đại học gia tăng với tốc độ vượt xa mức lạm phát trung bình đã biến tấm bằng cử nhân thành một món nợ đầu tư rủi ro. Chính phủ cần cải cách cơ chế tài chính giáo dục đại học.',
    targetCollocationsJson: JSON.stringify([
      { term: 'student debt crisis', meaning: 'khủng hoảng nợ sinh viên' },
      { term: 'tuition inflation', meaning: 'gia tăng học phí' },
      { term: 'financial burden', meaning: 'gánh nặng kinh tế' },
      { term: 'higher education financing', meaning: 'tài chính giáo dục đại học' }
    ]),
    modelTranslation: 'The student debt crisis has escalated into a severe economic impediment, severely undermining young graduates’ home-buying capability. University tuition fees rising at rates outstripping general inflation have rendered higher education a high-risk financial investment. Overhauling higher education financing mechanisms has become an urgent imperative.',
    grammarBreakdown: '1. Complex participle clause ("severely undermining young graduates’ home-buying capability").\n2. Make/render + object + complement ("have rendered higher education a high-risk financial investment").\n3. Transitive gerund subject ("Overhauling higher education financing...").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_16',
    themeCategory: 'Intellectual Property',
    subTopic: 'Patent Rights versus Open-Source Innovation',
    targetBand: 'C1',
    vietnameseParagraph: 'Xung đột giữa độc quyền bằng sáng chế và phong trào đổi mới sáng tạo mở đang định hình lại tương lai của ngành công nghệ phần mềm. Việc bảo hộ bằng sáng chế quá mức có nguy cơ bóp nghẹt sự phát triển của các doanh nghiệp khởi nghiệp nhỏ. Ngược lại, mô hình mã nguồn mở khuyến khích sự hợp tác và chia sẻ tri thức toàn cầu.',
    targetCollocationsJson: JSON.stringify([
      { term: 'patent monopoly', meaning: 'độc quyền bằng sáng chế' },
      { term: 'open-source innovation', meaning: 'đổi mới sáng tạo mở' },
      { term: 'stifle startup growth', meaning: 'bóp nghẹt khởi nghiệp' },
      { term: 'knowledge sharing', meaning: 'chia sẻ tri thức' }
    ]),
    modelTranslation: 'The tension between patent monopolies and open-source innovation is reshaping the trajectory of the software technology sector. Excessive patent protection risks stifling the growth of small startups. Conversely, open-source models foster global collaboration and transparent knowledge sharing.',
    grammarBreakdown: '1. Subject noun phrase ("The tension between patent monopolies and...").\n2. Risk + gerund ("risks stifling the growth").\n3. Transition adverb of contrast ("Conversely").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_17',
    themeCategory: 'Surveillance Capitalism',
    subTopic: 'Surveillance Capitalism and Data Harvesting',
    targetBand: 'C1',
    vietnameseParagraph: 'Chủ nghĩa tư bản giám sát đang biến dữ liệu hành vi cá nhân thành thứ hàng hóa thương mại sinh lời cao nhất cho các gã khổng lồ công nghệ. Việc thu thập dữ liệu ngầm cho phép họ thao túng tâm lý và định hình hành vi mua sắm của người dùng. Sự thiếu hụt quyền soát dữ liệu cá nhân là thách thức dân chủ lớn.',
    targetCollocationsJson: JSON.stringify([
      { term: 'surveillance capitalism', meaning: 'chủ nghĩa tư bản giám sát' },
      { term: 'behavioral data harvesting', meaning: 'thu thập dữ liệu hành vi' },
      { term: 'psychological manipulation', meaning: 'thao túng tâm lý' },
      { term: 'personal data sovereignty', meaning: 'quyền kiểm soát dữ liệu cá nhân' }
    ]),
    modelTranslation: 'Surveillance capitalism commodifies personal behavioral data into the most lucrative trade asset for technology monoliths. Covert data harvesting empowers algorithms to psychologically manipulate users and dictate consumer choices. The erosion of personal data sovereignty represents a profound democratic threat.',
    grammarBreakdown: '1. Transitive active verb ("commodifies personal behavioral data into").\n2. Active causative ("empowers algorithms to psychologically manipulate").\n3. Abstract gerund subject ("The erosion of personal data sovereignty represents").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_18',
    themeCategory: 'Geopolitics & Alliances',
    subTopic: 'Multilateral Diplomacy in a Fragmentation Era',
    targetBand: 'C1',
    vietnameseParagraph: 'Ngoại giao đa phương đang rơi vào bế tắc do sự gia tăng của căng thẳng địa chính trị và làn sóng chủ nghĩa bảo hộ thương mại. Các định chế quốc tế từng giữ vai trò duy trì hòa bình dần bị suy yếu trước những tranh chấp song phương. Xây dựng lại niềm tin chiến lược giữa các cường quốc là điều kiện tiên quyết.',
    targetCollocationsJson: JSON.stringify([
      { term: 'multilateral diplomacy', meaning: 'ngoại giao đa phương' },
      { term: 'trade protectionism', meaning: 'chủ nghĩa bảo hộ thương mại' },
      { term: 'geopolitical friction', meaning: 'căng thẳng địa chính trị' },
      { term: 'strategic trust', meaning: 'niềm tin chiến lược' }
    ]),
    modelTranslation: 'Multilateral diplomacy faces unprecedented gridlock driven by escalating geopolitical friction and rising trade protectionism. International institutions historically tasked with maintaining peace find themselves weakened by bilateral disputes. Rebuilding strategic trust among global superpowers constitutes a non-negotiable prerequisite.',
    grammarBreakdown: '1. Passive participle modifier ("driven by escalating geopolitical friction").\n2. Reduced relative modifier ("institutions historically tasked with").\n3. Gerund predicate ("Rebuilding strategic trust ... constitutes a non-negotiable prerequisite").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_19',
    themeCategory: 'Space Debris & Orbit Pollution',
    subTopic: 'Space Debris Management in Low Earth Orbit',
    targetBand: 'C1',
    vietnameseParagraph: 'Mật độ rác thải vũ trụ tại quỹ đạo thấp của Trái Đất đang tiệm cận mức báo động có thể gây ra hiệu ứng dây chuyền Kessler. Các vụ va chạm giữa mảnh vỡ vệ tinh cũ có thể tạo ra hàng triệu mảnh kim loại nhỏ phá hủy các hệ thống viễn thông quan trọng. Việc dọn dẹp không gian đòi hỏi công nghệ gắp rác tiên tiến.',
    targetCollocationsJson: JSON.stringify([
      { term: 'space debris', meaning: 'rác thải vũ trụ' },
      { term: 'Low Earth Orbit (LEO)', meaning: 'quỹ đạo thấp Trái Đất' },
      { term: 'Kessler syndrome', meaning: 'hiệu ứng dây chuyền Kessler' },
      { term: 'satellite communication', meaning: 'viễn thông vệ tinh' }
    ]),
    modelTranslation: 'The density of space debris in Low Earth Orbit is approaching a critical threshold capable of triggering the catastrophic Kessler syndrome. Collisions among defunct satellite fragments generate millions of high-velocity shrapnels threatening vital telecommunication infrastructure. Active space debris removal demands cutting-edge robotic technology.',
    grammarBreakdown: '1. Adjective clause modifier ("capable of triggering the catastrophic...").\n2. Participle result modifier ("generate millions ... threatening vital telecommunication").\n3. Active gerund requirement ("Active space debris removal demands").',
    createdAt: nowIso
  },
  {
    id: 'para_c1_20',
    themeCategory: 'Deep Sea Mining',
    subTopic: 'Ecological Risks of Deep Sea Mining',
    targetBand: 'C1',
    vietnameseParagraph: 'Khai thác khoáng sản dưới đáy biển sâu đang được thúc đẩy để đáp ứng nhu cầu kim loại sản xuất pin xe điện. Tuy nhiên, hoạt động này nguy cơ tàn phá vĩnh viễn các hệ sinh thái vực thẳm hoàn toàn chưa được khám phá. Các nhà khoa học kêu gọi tạm dừng khai thác cho đến khi đánh giá đầy đủ tác động môi trường.',
    targetCollocationsJson: JSON.stringify([
      { term: 'deep sea mining', meaning: 'khai thác khoáng sản đáy biển sâu' },
      { term: 'abyssal ecosystems', meaning: 'hệ sinh thái vực thẳm' },
      { term: 'ev-battery metals', meaning: 'kim loại sản xuất pin xe điện' },
      { term: 'moratorium call', meaning: 'kêu gọi tạm dừng khai thác' }
    ]),
    modelTranslation: 'Deep-sea mining is being aggressively pursued to meet soaring demand for metals vital to electric vehicle batteries. Nonetheless, scraping the abyssal seafloor threatens to irrevocably destroy pristine marine ecosystems that remain largely unexplored. Marine scientists advocate a global moratorium until environmental impacts are comprehensively evaluated.',
    grammarBreakdown: '1. Passive progressive purpose ("is being aggressively pursued to meet").\n2. Infinitive result clause ("threatens to irrevocably destroy").\n3. Subordinate temporal clause ("until environmental impacts are comprehensively evaluated").',
    createdAt: nowIso
  },

  // ==========================================
  // LEVEL C2 (20 Exercises)
  // ==========================================
  {
    id: 'para_c2_01',
    themeCategory: 'Artificial Intelligence, Ethics & Society',
    subTopic: 'Automation, Ethics, and the Future of Human Labour',
    targetBand: 'C2',
    vietnameseParagraph: 'Sự bùng nổ của trí tuệ nhân tạo và tự động hóa toàn diện đang đặt ra những thách thức triết học sâu sắc về bản chất của lao động con người. Không chỉ đe dọa các ngành nghề truyền thống, làn sóng công nghệ này còn buộc các nhà lập pháp phải tái định hình lại chính sách an sinh xã hội. Liệu nhân loại có thể làm chủ công nghệ hay sẽ trở thành nạn nhân của chính sự sáng tạo của mình vẫn là câu hỏi ngỏ.',
    targetCollocationsJson: JSON.stringify([
      { term: 'unprecedented surge', meaning: 'sự bùng nổ chưa từng có' },
      { term: 'profound philosophical dilemmas', meaning: 'thách thức triết học sâu sắc' },
      { term: 'reshape social welfare paradigms', meaning: 'tái định hình chính sách an sinh xã hội' },
      { term: 'remain an open question', meaning: 'vẫn là câu hỏi ngỏ' }
    ]),
    modelTranslation: 'The unprecedented surge in artificial intelligence and ubiquitous automation poses profound philosophical dilemmas regarding the fundamental nature of human labour. Far from merely disrupting conventional occupations, this technological imperative compels policymakers to fundamentally reshape social welfare paradigms. Whether humanity can harness these innovations or succumb to its own creations remains an open question.',
    grammarBreakdown: '1. Advanced participle clauses ("Far from merely disrupting...").\n2. Formal academic nominal structure ("technological imperative compels policymakers").\n3. Noun clause subject ("Whether humanity can harness... remains an open question").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_02',
    themeCategory: 'Artificial General Intelligence (AGI)',
    subTopic: 'Existential Risks of Artificial General Intelligence',
    targetBand: 'C2',
    vietnameseParagraph: 'Sự xuất hiện khả dĩ của Trí tuệ Nhân tạo Tổng hợp (AGI) vượt trội hơn trí tuệ loài người đang khơi dậy nỗi lo ngại hiện sinh về nguy cơ mất kiểm soát vận mệnh văn minh. Một khi hệ thống thần kinh nhân tạo đạt đến điểm bùng nổ tự cải tiến, mọi cơ chế căn chỉnh mục tiêu của con người có nguy cơ trở nên vô hiệu. Việc nghiên cứu an toàn AGI phải được đặt ở mức ưu tiên quốc gia tối cao.',
    targetCollocationsJson: JSON.stringify([
      { term: 'Artificial General Intelligence (AGI)', meaning: 'trí tuệ nhân tạo tổng hợp' },
      { term: 'existential risk', meaning: 'nguy cơ hiện sinh' },
      { term: 'self-improvement explosion', meaning: 'bùng nổ tự cải tiến' },
      { term: 'alignment problem', meaning: 'căn chỉnh mục tiêu AI' }
    ]),
    modelTranslation: 'The prospective advent of Artificial General Intelligence (AGI) surpassing human cognitive capacity evokes profound existential anxiety regarding the forfeiture of species control over civilization. Once autonomous synthetic neural systems cross the threshold of recursive self-improvement, human goal-alignment mechanisms risk rendered utterly obsolete. Prioritizing AGI safety research constitutes an imperative of paramount national urgency.',
    grammarBreakdown: '1. Complex nominal subject ("The prospective advent of Artificial General Intelligence...").\n2. Temporal clause with passive past participle ("Once autonomous synthetic neural systems cross...").\n3. Transitive gerund predicate ("Prioritizing AGI safety research constitutes an imperative").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_03',
    themeCategory: 'Quantum Computing Paradigms',
    subTopic: 'Quantum Advantage and Cryptographic Vulnerability',
    targetBand: 'C2',
    vietnameseParagraph: 'Việc đạt được lợi thế máy tính lượng tử đe dọa làm vô hiệu hóa các thuật toán mã hóa hiện đại đang bảo vệ hạ tầng tài chính và bí mật quốc gia. Khả năng tính toán siêu việt của máy tính lượng tử cho phép bẻ khóa các hệ thống bảo mật bất khả xâm phạm hiện nay chỉ trong tích tắc. Cuộc đua phát triển mã hóa hậu lượng tử đã trở thành mặt trận an ninh mạng sống còn.',
    targetCollocationsJson: JSON.stringify([
      { term: 'quantum advantage', meaning: 'lợi thế máy tính lượng tử' },
      { term: 'cryptographic vulnerability', meaning: 'lỗ hổng mã hóa' },
      { term: 'post-quantum cryptography', meaning: 'mã hóa hậu lượng tử' },
      { term: 'vital cybersecurity frontier', meaning: 'mặt trận an ninh mạng sống còn' }
    ]),
    modelTranslation: 'Attaining quantum supreme computational capacity threatens to render existing cryptographic algorithms safeguarding global financial networks obsolete. The exponential processing power inherent in quantum superposition permits deciphering hitherto impenetrable security protocols instantaneously. The race to engineer post-quantum cryptography has thus emerged as a critical cybersecurity imperative.',
    grammarBreakdown: '1. Make/render + object + adjective ("threatens to render existing algorithms obsolete").\n2. Post-modifying adjective phrase ("inherent in quantum superposition").\n3. Inversion adverbial ("hitherto impenetrable security protocols").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_04',
    themeCategory: 'Transhumanism & Bioethics',
    subTopic: 'Transhumanism, Neuro-enhancement, and Human Identity',
    targetBand: 'C2',
    vietnameseParagraph: 'Triết lý siêu nhân bản (Transhumanism) đề xướng việc sử dụng công nghệ kỹ thuật sinh học để vĩnh viễn xóa bỏ các giới hạn thể chất và nhận thức tự nhiên của con người. Mặc dù hứa hẹn kéo dài tuổi thọ và nâng cao trí tuệ, xu hướng này nguy cơ tạo ra sự phân hóa giai cấp sinh học không thể san lấp giữa người nâng cấp và người tự nhiên. Khái niệm về tính nhân bản gốc bị thách thức nghiêm trọng.',
    targetCollocationsJson: JSON.stringify([
      { term: 'transhumanist movement', meaning: 'triết lý siêu nhân bản' },
      { term: 'neuro-enhancement', meaning: 'nâng cao nhận thức' },
      { term: 'biological class divide', meaning: 'phân hóa giai cấp sinh học' },
      { term: 'essence of human identity', meaning: 'tính nhân bản gốc' }
    ]),
    modelTranslation: 'The transhumanist movement advocates deploying bio-engineering technologies to permanently transcend innate human physical and cognitive constraints. While offering visions of radical longevity and cognitive enhancement, this trajectory threatens to engraft an unbridgeable biological caste divide between enhanced and unenhanced humans. Consequently, the very essence of human identity stands profoundly challenged.',
    grammarBreakdown: '1. Advanced active transitive ("advocates deploying bio-engineering technologies").\n2. Participial concessive clause ("While offering visions of radical longevity...").\n3. Emphatic noun phrase ("the very essence of human identity").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_05',
    themeCategory: 'De-globalization & Geopolitics',
    subTopic: 'Geopolitical Fragmentation and the Multipolar World Order',
    targetBand: 'C2',
    vietnameseParagraph: 'Sự trỗi dậy của xu hướng phi toàn cầu hóa và tái cấu trúc địa kinh tế đang thúc đẩy sự đứt gãy của trật tự thế giới đơn cực. Sự thành lập các khối kinh tế độc lập và phân rã chuỗi cung ứng chiến lược thể hiện sự gia tăng rạn nứt lòng tin giữa các siêu cường. Một thế giới đa cực đầy biến động đòi hỏi tư duy ngoại giao vô cùng linh hoạt.',
    targetCollocationsJson: JSON.stringify([
      { term: 'geoeconomic restructuring', meaning: 'tái cấu trúc địa kinh tế' },
      { term: 'unipolar world order', meaning: 'trật tự thế giới đơn cực' },
      { term: 'multipolar world order', meaning: 'trật tự thế giới đa cực' },
      { term: 'strategic decoupling', meaning: 'phân rã chuỗi cung ứng chiến lược' }
    ]),
    modelTranslation: 'The acceleration of de-globalization alongside geoeconomic restructuring is catalyzing the fragmentation of the unipolar global order. The formation of rival economic blocs and strategic supply chain decoupling underscore deep-seated geopolitical distrust among superpowers. Navigating an increasingly volatile multipolar architecture demands nuanced diplomatic dexterity.',
    grammarBreakdown: '1. Parallel nominal subject ("acceleration of de-globalization alongside geoeconomic restructuring").\n2. Subject-verb agreement with plural subjects ("formation ... and decoupling underscore").\n3. Advanced gerund subject ("Navigating an increasingly volatile multipolar architecture demands").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_06',
    themeCategory: 'Algorithmic Bias & Democracy',
    subTopic: 'Algorithmic Governance and Democratic Legitimacy',
    targetBand: 'C2',
    vietnameseParagraph: 'Việc phó mặc quy trình ra quyết định hành chính công cho các thuật toán học máy đang đe dọa sự minh bạch của nền quản trị dân chủ. Các mô hình thuật toán "hộp đen" thường xuyên phản ánh và làm trầm trọng thêm những định kiến lịch sử đối với nhóm yếu thế mà không chịu trách nhiệm giải trình. Tính chính danh của các quyết định nhà nước bị xói mòn nghiêm trọng.',
    targetCollocationsJson: JSON.stringify([
      { term: 'algorithmic governance', meaning: 'quản trị thuật toán' },
      { term: 'black-box algorithms', meaning: 'thuật toán hộp đen' },
      { term: 'democratic legitimacy', meaning: 'tính chính danh dân chủ' },
      { term: 'perpetuate historical bias', meaning: 'làm trầm trọng định kiến lịch sử' }
    ]),
    modelTranslation: 'Delegating public administrative decision-making to machine learning algorithms threatens the fundamental transparency underpinning democratic governance. Black-box algorithmic models routinely perpetuate and amplify historical biases against marginalized demographics without public accountability. Consequently, the democratic legitimacy of state decisions undergoes severe erosion.',
    grammarBreakdown: '1. Complex gerund subject ("Delegating public administrative decision-making to...").\n2. Post-modifying participle ("underpinning democratic governance").\n3. Formal passive state ("undergoes severe erosion").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_07',
    themeCategory: 'Deepfakes & Epistemology',
    subTopic: 'Deepfake Technology and the Epistemic Crisis of Truth',
    targetBand: 'C2',
    vietnameseParagraph: 'Sự hoàn thiện của công nghệ deepfake tinh vi đang đẩy xã hội loài người vào một cuộc khủng hoảng nhận thức luận nguy hiểm, nơi bằng chứng hình ảnh và âm thanh không còn đáng tin tin cậy. Việc giả mạo video chính trị gia có khả năng châm ngòi nổ cho các xung đột vũ trang hoặc thao túng bầu cử. Xã hội đứng trước nguy cơ đánh mất tiêu chuẩn chung về sự thật.',
    targetCollocationsJson: JSON.stringify([
      { term: 'deepfake technology', meaning: 'công nghệ deepfake' },
      { term: 'epistemic crisis of truth', meaning: 'khủng hoảng nhận thức luận về sự thật' },
      { term: 'audiovisual evidence', meaning: 'bằng chứng hình ảnh âm thanh' },
      { term: 'shared reality consensus', meaning: 'tiêu chuẩn chung về sự thật' }
    ]),
    modelTranslation: 'The sophistication of generative deepfake technology is plunging human society into an acute epistemic crisis wherein audiovisual evidence ceases to serve as an infallible proxy for truth. Synthesizing hyper-realistic political fabrications possesses the potential to spark armed conflicts or subvert democratic elections. Society faces the imminent dissolution of a shared consensus on objective reality.',
    grammarBreakdown: '1. Relative adverbial of condition ("wherein audiovisual evidence ceases to...").\n2. Formal vocabulary choice ("infallible proxy for truth").\n3. Abstract noun phrase ("imminent dissolution of a shared consensus").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_08',
    themeCategory: 'Sovereign Debt & Monetary Policy',
    subTopic: 'Sovereign Debt Volatility in Developing Economies',
    targetBand: 'C2',
    vietnameseParagraph: 'Khủng hoảng nợ chủ quyền tại các quốc gia đang phát triển đang đe dọa châm ngòi cho một làn sóng suy thoái kinh tế dây chuyền trên toàn cầu. Việc lãi suất toàn cầu tăng cao khiến chi phí đảo nợ trở nên quá sức đối với các ngân sách đang kiệt quệ. Sự can thiệp của các quỹ tiền tệ quốc tế cần đi kèm những điều kiện cải cách thực chất.',
    targetCollocationsJson: JSON.stringify([
      { term: 'sovereign debt crisis', meaning: 'khủng hoảng nợ chủ quyền' },
      { term: 'cascade economic recession', meaning: 'suy thoái kinh tế dây chuyền' },
      { term: 'debt servicing costs', meaning: 'chi phí đảo nợ' },
      { term: 'structural reform conditions', meaning: 'điều kiện cải cách thực chất' }
    ]),
    modelTranslation: 'Escalating sovereign debt distress in developing nations threatens to catalyze a cascading global economic recession. Surging global interest rates have rendered debt servicing costs unsustainable for fragile national treasuries. Intervention by international financial institutions must incorporate genuine structural reform imperatives rather than austerity measures alone.',
    grammarBreakdown: '1. Advanced participle adjective ("Surging global interest rates").\n2. Render + object + adjective ("rendered debt servicing costs unsustainable").\n3. Prepositional contrast ("incorporate genuine structural reform imperatives rather than").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_09',
    themeCategory: 'Space Commercialization',
    subTopic: 'Space Commercialization and Astropolitical Property Rights',
    targetBand: 'C2',
    vietnameseParagraph: 'Việc thương mại hóa không gian ngoại tầng đang mở ra cuộc đua địa chính trị mới về quyền khai thác tài nguyên trên mặt trăng và các tiểu hành tinh. Sự thiếu hụt cơ chế pháp lý ràng buộc trong Hiệp ước Không gian năm 1967 khiến nguy cơ xung đột vũ trang ngoài Trái Đất tăng cao. Xây dựng luật không gian mới là yêu cầu cấp thiết.',
    targetCollocationsJson: JSON.stringify([
      { term: 'commercialization of outer space', meaning: 'thương mại hóa không gian ngoại tầng' },
      { term: 'astropolitical race', meaning: 'cuộc đua địa chính trị không gian' },
      { term: 'extraterrestrial property rights', meaning: 'quyền tài sản ngoài trái đất' },
      { term: 'Outer Space Treaty', meaning: 'Hiệp ước Không gian' }
    ]),
    modelTranslation: 'The rampant commercialization of outer space is igniting a novel astropolitical race regarding extraterrestrial resource exploitation rights. Ambiguities embedded within the 1967 Outer Space Treaty fail to address private property claims, thereby heightening off-world conflict risks. Codifying a binding international space legal framework has become paramount.',
    grammarBreakdown: '1. Progressive active voice ("is igniting a novel astropolitical race").\n2. Past participle post-modifier ("Ambiguities embedded within the 1967...").\n3. Cause-and-effect adverbial ("thereby heightening off-world conflict risks").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_10',
    themeCategory: 'Neuroscience & Free Will',
    subTopic: 'Neuroscientific Determinism and the Illusion of Free Will',
    targetBand: 'C2',
    vietnameseParagraph: 'Những khám phá mới trong khoa học thần kinh về cơ chế kích hoạt não bộ trước khi con người đưa ra quyết định tự ý đang lung lay nền tảng của khái niệm ý chí tự do. Nếu mọi lựa chọn cá nhân chỉ là kết quả của các phản ứng hóa sinh đã được định trước, hệ thống lý luận về trách nhiệm pháp lý và đạo đức sẽ phải viết lại hoàn toàn.',
    targetCollocationsJson: JSON.stringify([
      { term: 'neuroscientific determinism', meaning: 'quyết định luận khoa học thần kinh' },
      { term: 'illusion of free will', meaning: 'ảo tưởng về ý chí tự do' },
      { term: 'biochemical reactions', meaning: 'phản ứng hóa sinh' },
      { term: 'moral responsibility paradigm', meaning: 'hệ thống lý luận trách nhiệm đạo đức' }
    ]),
    modelTranslation: 'Recent neuroscientific revelations demonstrating that neural readiness potentials precede conscious decision-making are unsettling the philosophical foundations of free will. Should human choices be conclusively proven as deterministic outcomes of subconscious biochemical reactions, the entire jurisprudence of moral and legal accountability would necessitate fundamental overhaul.',
    grammarBreakdown: '1. Participle clause within noun subject ("revelations demonstrating that neural readiness potentials precede...").\n2. Inverted conditional clause ("Should human choices be conclusively proven as...").\n3. Advanced legal vocabulary ("jurisprudence of moral and legal accountability").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_11',
    themeCategory: 'Climate Migration',
    subTopic: 'Climate Refugees and International Law Status',
    targetBand: 'C2',
    vietnameseParagraph: 'Hiện tượng di cư do biến đổi khí hậu đang tạo ra hàng chục triệu người tị nạn môi trường mà không được công nhận bởi Công ước Geneva năm 1951. Nước biển dâng và sa mạc hóa đang biến nhiều vùng đất thành nơi không thể sinh sống, buộc người dân phải bỏ quê hương. Việc thiếu định nghĩa pháp lý quốc tế khiến họ không được bảo hộ.',
    targetCollocationsJson: JSON.stringify([
      { term: 'climate refugees', meaning: 'người tị nạn môi trường' },
      { term: '1951 Geneva Convention', meaning: 'Công ước Geneva năm 1951' },
      { term: 'uninhabitable lands', meaning: 'vùng đất không thể sinh sống' },
      { term: 'international legal recognition', meaning: 'công nhận pháp lý quốc tế' }
    ]),
    modelTranslation: 'Climate-induced displacement is generating tens of millions of environmental refugees who currently lack formal recognition under the 1951 Geneva Convention. Rising sea levels and severe desertification are rendering vast territories uninhabitable, compelling involuntary human migration. Codifying legal protections for climate-displaced populations remains a pressing humanitarian imperative.',
    grammarBreakdown: '1. Compound adjective modifier ("Climate-induced displacement").\n2. Make/render + object + adjective ("rendering vast territories uninhabitable").\n3. Active participle clause ("compelling involuntary human migration").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_12',
    themeCategory: 'Epigenetics & Health',
    subTopic: 'Epigenetics and Environmental Transgenerational Inheritance',
    targetBand: 'C2',
    vietnameseParagraph: 'Các nghiên cứu về di truyền học biểu truyền (Epigenetics) chứng minh rằng ô nhiễm môi trường và căng thẳng tâm lý có thể làm thay đổi sự biểu hiện gen mà không làm đổi cấu trúc DNA. Những thay đổi này có khả năng di truyền sang các thế hệ sau, mở ra cái nhìn mới về trách nhiệm của thế hệ hiện tại đối với con cháu.',
    targetCollocationsJson: JSON.stringify([
      { term: 'epigenetics research', meaning: 'di truyền học biểu truyền' },
      { term: 'transgenerational inheritance', meaning: 'di truyền qua các thế hệ' },
      { term: 'gene expression alteration', meaning: 'thay đổi biểu hiện gen' },
      { term: 'intergenerational responsibility', meaning: 'trách nhiệm giữa các thế hệ' }
    ]),
    modelTranslation: 'Emerging epigenetic research demonstrates that environmental toxins and chronic psychological stress can alter gene expression without altering underlying DNA sequences. Crucially, these molecular modifications can be inherited across generations, fundamentally reframing intergenerational health responsibility. Our lifestyle choices reverberate across biological posterity.',
    grammarBreakdown: '1. Complex noun clause object ("demonstrates that environmental toxins ... can alter").\n2. Adverbial emphasis ("Crucially, these molecular modifications can be inherited").\n3. Metaphorical conclusion ("reverberate across biological posterity").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_13',
    themeCategory: 'Post-Truth Politics',
    subTopic: 'Post-Truth Politics and Information Warfare',
    targetBand: 'C2',
    vietnameseParagraph: 'Kỷ nguyên chính trị hậu sự thật được đặc trưng bởi việc cảm xúc và niềm tin cá nhân lấn ạt các sự thật khách quan trong việc định hình dư luận. Các chiến dịch thao túng thông tin tinh vi利用 thuật toán mạng xã hội để đào sâu chia rẽ xã hội và phá hoại thể chế dân chủ. Việc phục hồi sự tôn trọng thực chứng là cuộc chiến sống còn.',
    targetCollocationsJson: JSON.stringify([
      { term: 'post-truth politics', meaning: 'chính trị hậu sự thật' },
      { term: 'information warfare', meaning: 'thao túng thông tin' },
      { term: 'objective facts', meaning: 'sự thật khách quan' },
      { term: 'empirical truth respect', meaning: 'tôn trọng thực chứng' }
    ]),
    modelTranslation: 'The post-truth political era is characterized by the primacy of emotional appeals and personal beliefs over objective facts in shaping public consensus. Sophisticated dis-information campaigns weaponize social media algorithms to exacerbate societal polarization and undermine democratic institutions. Re-establishing reverence for empirical evidence represents a vital cultural battleground.',
    grammarBreakdown: '1. Passive description structure ("is characterized by the primacy of...").\n2. Metaphorical verb choice ("weaponize social media algorithms").\n3. Formal gerund predicate ("Re-establishing reverence for ... represents a vital").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_14',
    themeCategory: 'Carbon Neutrality & Geoengineering',
    subTopic: 'Solar Geoengineering Risks and Global Climate Governance',
    targetBand: 'C2',
    vietnameseParagraph: 'Các dự án can thiệp địa kỹ thuật mặt trời nhằm làm mát trái đất bằng cách phun sol khí vào tầng bình lưu đang gây ra những tranh cãi địa chính trị gay gắt. Mặc dù có thể làm giảm nhiệt độ toàn cầu nhanh chóng, công nghệ này nguy cơ gây ra tác dụng phụ thảm họa cho lượng mưa toàn cầu. Việc đơn phương triển khai địa kỹ thuật có thể châm ngòi chiến tranh.',
    targetCollocationsJson: JSON.stringify([
      { term: 'solar geoengineering', meaning: 'địa kỹ thuật mặt trời' },
      { term: 'stratospheric aerosol injection', meaning: 'phun sol khí tầng bình lưu' },
      { term: 'unintended side effects', meaning: 'tác dụng phụ không mong muốn' },
      { term: 'unilateral deployment', meaning: 'đơn phương triển khai' }
    ]),
    modelTranslation: 'Solar geoengineering proposals seeking to cool the planet via stratospheric aerosol injection trigger fierce geopolitical disputes. While potentially mitigating global warming rapidly, this technology poses terrifying unintended risks of disrupting monsoon systems and agricultural yields. Unilateral geoengineering deployment could provoke existential international conflicts.',
    grammarBreakdown: '1. Participle modifier ("proposals seeking to cool the planet via").\n2. Concessive participial clause ("While potentially mitigating global warming...").\n3. Modal probability ("could provoke existential international conflicts").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_15',
    themeCategory: 'Technocracy vs Democracy',
    subTopic: 'Technocratic Expertise versus Populist Democracy',
    targetBand: 'C2',
    vietnameseParagraph: 'Sự xung đột giữa giới chuyên gia kỹ trị và làn sóng dân túy đang làm rung chuyển tính chính danh của các chính phủ phương Tây. Trong khi các quyết định chính sách ngày càng phức tạp đòi hỏi tri thức chuyên sâu, cử tri lại cảm thấy bị gạt ra ngoài lề bởi những quyết định của tầng lớp tinh hoa. Cân bằng giữa tri thức chuyên môn và ý chí nhân dân là bài toán chưa có lời giải.',
    targetCollocationsJson: JSON.stringify([
      { term: 'technocratic expertise', meaning: 'tri thức chuyên môn kỹ trị' },
      { term: 'populist surge', meaning: 'làn sóng dân túy' },
      { term: 'elitist decision-making', meaning: 'quyết định của tầng lớp tinh hoa' },
      { term: 'democratic legitimacy', meaning: 'tính chính danh dân chủ' }
    ]),
    modelTranslation: 'The tension between technocratic expertise and populist surges is shaking the foundational legitimacy of Western governance. As policy decisions grow increasingly intricate demanding specialized knowledge, voters feel disenfranchised by perceived elitist technocracy. Harmonizing expert guidance with popular democratic will remains an unresolved systemic challenge.',
    grammarBreakdown: '1. Present continuous metaphor ("is shaking the foundational legitimacy").\n2. Subordinate clause of reason ("As policy decisions grow increasingly intricate...").\n3. Passive feeling clause ("voters feel disenfranchised by").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_16',
    themeCategory: 'Circular Economy',
    subTopic: 'Transitioning to a Zero-Waste Circular Economy',
    targetBand: 'C2',
    vietnameseParagraph: 'Mô hình kinh tế tuần hoàn đặt mục tiêu xóa bỏ hoàn toàn rác thải bằng cách thiết kế các sản phẩm có khả năng tái sử dụng và tái chế vô tận. Khác với mô hình kinh tế tuyến tính truyền thống "khai thác - sản xuất - thải bỏ", kinh tế tuần hoàn biến rác thải của ngành này thành nguyên liệu đầu vào của ngành khác. Đây là mô hình duy nhất đảm bảo sự tồn tại của nền văn minh.',
    targetCollocationsJson: JSON.stringify([
      { term: 'circular economy model', meaning: 'mô hình kinh tế tuần hoàn' },
      { term: 'linear economy model', meaning: 'mô hình kinh tế tuyến tính' },
      { term: 'zero-waste design', meaning: 'thiết kế không rác thải' },
      { term: 'industrial symbiosis', meaning: 'cộng sinh công nghiệp' }
    ]),
    modelTranslation: 'The circular economy paradigm aspires to eliminate waste entirely by engineering products designed for perpetual reuse and regeneration. Distinct from the traditional linear "take-make-dispose" economic model, circularity converts industrial waste streams into secondary raw material inputs. This framework represents the sole viable pathway toward sustainable civilization.',
    grammarBreakdown: '1. Transitive active verb ("aspires to eliminate waste entirely by").\n2. Prepositional contrast phrase ("Distinct from the traditional linear...").\n3. Active metaphor ("converts industrial waste streams into").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_17',
    themeCategory: 'Synthetic Biology & Security',
    subTopic: 'Synthetic Biology and Dual-Use Biosecurity Threats',
    targetBand: 'C2',
    vietnameseParagraph: 'Sự phát triển bùng nổ của sinh học tổng hợp cho phép tổng hợp nhân tạo các tác nhân sinh học nguy hiểm từ mã di truyền số hóa. Khả năng "tự làm" tác nhân sinh học tại các phòng thí nghiệm thô sơ đe dọa làm vô hiệu hóa các quy chế kiểm soát vũ khí sinh học truyền thống. Sự giám sát cộng đồng nghiên cứu toàn cầu là điều bắt buộc.',
    targetCollocationsJson: JSON.stringify([
      { term: 'synthetic biology', meaning: 'sinh học tổng hợp' },
      { term: 'dual-use biosecurity threat', meaning: 'đe dọa an ninh sinh học sử dụng kép' },
      { term: 'digital genetic code', meaning: 'mã di truyền số hóa' },
      { term: 'biological weapons control', meaning: 'kiểm soát vũ khí sinh học' }
    ]),
    modelTranslation: 'The rapid democratization of synthetic biology permits the artificial synthesis of lethal pathogens directly from digital genetic sequences. This "do-it-yourself" biotechnology capability risks rendering conventional biological weapons non-proliferation regimes obsolete. Establishing international oversight over gene-synthesis foundries has become an urgent biosecurity imperative.',
    grammarBreakdown: '1. Subject noun phrase ("The rapid democratization of synthetic biology").\n2. Make/render + object + adjective ("risks rendering conventional ... regimes obsolete").\n3. Transitive gerund subject ("Establishing international oversight... has become").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_18',
    themeCategory: 'Neurodiversity & Workplace',
    subTopic: 'Neurodiversity Inclusion in Modern Organizations',
    targetBand: 'C2',
    vietnameseParagraph: 'Nhận thức về sự đa dạng thần kinh (Neurodiversity) đang thúc đẩy các tập đoàn công nghệ tuyển dụng và tạo điều kiện cho nhân sự có hội chứng tự kỷ hoặc tăng động. Những cá nhân này sở hữu khả năng phân tích mô hình và tập trung chuyên sâu vượt trội hơn hẳn người bình thường. Xóa bỏ định kiến giúp giải phóng tiềm năng sáng tạo bị bỏ quên.',
    targetCollocationsJson: JSON.stringify([
      { term: 'neurodiversity inclusion', meaning: 'hòa nhập đa dạng thần kinh' },
      { term: 'pattern recognition capability', meaning: 'khả năng phân tích mô hình' },
      { term: 'autism spectrum personnel', meaning: 'nhân sự có hội chứng tự kỷ' },
      { term: 'unrealized creative potential', meaning: 'tiềm năng sáng tạo bị bỏ quên' }
    ]),
    modelTranslation: 'Embracing neurodiversity is prompting leading tech conglomerates to actively recruit and accommodate individuals on the autism spectrum. These neurodivergent personnel frequently possess extraordinary pattern-recognition capabilities and hyper-focus unmatched by neurotypical peers. Dismantling corporate stigma unlocks hitherto untapped creative potential.',
    grammarBreakdown: '1. Transitive gerund subject ("Embracing neurodiversity is prompting...").\n2. Post-modifying past participle ("hyper-focus unmatched by neurotypical peers").\n3. Metaphorical action verb ("Dismantling corporate stigma unlocks").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_19',
    themeCategory: 'Philosophical Determinism',
    subTopic: 'Technological Determinism versus Human Agency',
    targetBand: 'C2',
    vietnameseParagraph: 'Học thuyết quyết định luận công nghệ cho rằng sự phát triển của công nghệ tự định hình cấu trúc xã hội và văn hóa loài người một cách tất yếu. Ngược lại, những người ủng hộ quyền chủ thể con người khẳng định rằng xã hội hoàn toàn có khả năng định hướng và làm chủ sự phát triển kỹ thuật. Cuộc tranh luận này có ý nghĩa sinh tử đối với tương lai loài người.',
    targetCollocationsJson: JSON.stringify([
      { term: 'technological determinism', meaning: 'quyết định luận công nghệ' },
      { term: 'human agency', meaning: 'quyền chủ thể con người' },
      { term: 'social structure shaping', meaning: 'định hình cấu trúc xã hội' },
      { term: 'steer technological progress', meaning: 'định hướng phát triển kỹ thuật' }
    ]),
    modelTranslation: 'Technological determinism posits that autonomous technological evolution inexorably dictates the trajectory of human social and cultural structures. Conversely, proponents of human agency assert that society retains the capacity to consciously steer technological progress toward humanistic ends. Resolving this dialectic carries vital implications for human destiny.',
    grammarBreakdown: '1. Academic reporting verb ("posits that autonomous technological evolution inexorably dictates").\n2. Formal contrast adverb ("Conversely, proponents of human agency assert").\n3. Gerund subject ("Resolving this dialectic carries vital implications").',
    createdAt: nowIso
  },
  {
    id: 'para_c2_20',
    themeCategory: 'Quantum Cryptography & Sovereignty',
    subTopic: 'Quantum Internet Infrastructure and Digital Sovereignty',
    targetBand: 'C2',
    vietnameseParagraph: 'Việc xây dựng hạ tầng Internet Lượng tử dựa trên hiện tượng rối lượng tử hứa hẹn khả năng bảo mật thông tin tuyệt đối không thể bị nghe lén. Quốc gia nào làm chủ mạng truyền thông lượng tử đầu tiên sẽ nắm giữ lợi thế chiến lược độc tôn trong an ninh thông tin toàn cầu. Đây là đấu trường công nghệ quan trọng nhất của thế kỷ 21.',
    targetCollocationsJson: JSON.stringify([
      { term: 'Quantum Internet infrastructure', meaning: 'hạ tầng Internet lượng tử' },
      { term: 'quantum entanglement', meaning: 'rối lượng tử' },
      { term: 'unhackable communication', meaning: 'bảo mật không thể bẻ khóa' },
      { term: 'digital sovereignty', meaning: 'chủ quyền số' }
    ]),
    modelTranslation: 'Constructing Quantum Internet infrastructure utilizing quantum entanglement principles promises unhackable information security immune to interception. The sovereign nation first achieving quantum network dominance will secure an unmatched strategic vantage point in global digital intelligence. This arena represents the ultimate technological battleground of the 21st century.',
    grammarBreakdown: '1. Participle clause in subject ("Constructing Quantum Internet infrastructure utilizing...").\n2. Relative reduced clause ("first achieving quantum network dominance").\n3. Formal superlative predicate ("represents the ultimate technological battleground").',
    createdAt: nowIso
  }
]
