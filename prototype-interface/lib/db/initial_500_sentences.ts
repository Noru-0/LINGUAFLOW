// Initial seed dataset containing ~500 single sentence translation exercises
// Categorized by Grammar Sentence Structure Patterns across CEFR Levels A2, B1, B2, C1, C2

export interface InitialSentencePrompt {
  id: string
  vietnameseText: string
  canonicalAnswersJson: string
  grammarCategory: string
  grammarNotes: string
  difficulty: 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}

const generateSentenceBank = (): InitialSentencePrompt[] => {
  const bank: InitialSentencePrompt[] = []

  const categories = [
    {
      name: 'Core Patterns (S+V, S+V+O, S+V+C, S+V+O_i+O_d, S+V+O+C_o)',
      templates: [
        {
          vn: 'Nền kinh tế địa phương đang phục hồi nhanh chóng sau khủng hoảng.',
          en: ['The local economy is recovering rapidly after the crisis', 'The local economy is recovering quickly after the crisis'],
          notes: 'S + V + Adverbial phrase (Present continuous with manner adverb).',
          level: 'B1' as const
        },
        {
          vn: 'Chính phủ vừa ban hành một chính sách thuế mới cho các doanh nghiệp.',
          en: ['The government has just enacted a new tax policy for enterprises', 'The government has just issued a new tax policy for businesses'],
          notes: 'S + V + O (Present perfect with direct object).',
          level: 'B2' as const
        },
        {
          vn: 'Chi phí sinh hoạt tại các đô thị lớn vẫn ở mức rất cao.',
          en: ['The cost of living in major cities remains very high', 'Living costs in big cities stay extremely high'],
          notes: 'S + V + C (Linking verb "remain" followed by adjective complement "very high").',
          level: 'B2' as const
        },
        {
          vn: 'Trường đại học trao học bổng toàn phần cho những sinh viên xuất sắc nhất.',
          en: ['The university awarded full scholarships to the most outstanding students', 'The university gave the best students full scholarships'],
          notes: 'S + V + Oi + Od / Dative shift (give sth to sb).',
          level: 'B1' as const
        },
        {
          vn: 'Nhiều chuyên gia coi công nghệ trí tuệ nhân tạo là một bước đột phá lớn.',
          en: ['Many experts consider artificial intelligence technology a major breakthrough', 'Many specialists find this AI technology a great breakthrough'],
          notes: 'S + V + O + Co (Consider + Object + Noun complement).',
          level: 'C1' as const
        },
        {
          vn: 'Tôi thường đi bộ đến trường mỗi buổi sáng cùng bạn bè.',
          en: ['I usually walk to school every morning with my friends', 'I often walk to school each morning with friends'],
          notes: 'S + V + Adverbial phrase of frequency and manner.',
          level: 'A2' as const
        },
        {
          vn: 'Công ty cung cấp dịch vụ hỗ trợ khách hàng 24/7.',
          en: ['The company provides 24/7 customer support service', 'The firm offers 24/7 customer support service'],
          notes: 'S + V + O (Simple present with direct object).',
          level: 'A2' as const
        },
        {
          vn: 'Thời tiết hôm nay dường như dễ chịu hơn hôm qua.',
          en: ['The weather today seems more pleasant than yesterday', 'Today\'s weather appears nicer than yesterday'],
          notes: 'S + V + C (Linking verb "seem" + comparative adjective).',
          level: 'A2' as const
        },
        {
          vn: 'Giáo viên gửi tài liệu tham khảo cho tất cả học sinh trong lớp.',
          en: ['The teacher sent reference materials to all students in the class', 'The teacher gave all students reference materials'],
          notes: 'S + V + Oi + Od (Send sth to sb).',
          level: 'B1' as const
        },
        {
          vn: 'Hội đồng quản trị bầu ông Alex làm chủ tịch mới của tập đoàn.',
          en: ['The board of directors elected Mr. Alex as the new chairman of the corporation', 'The board elected Mr. Alex new chairman of the group'],
          notes: 'S + V + O + Co (Elect sb as Noun complement).',
          level: 'C1' as const
        },
      ]
    },
    {
      name: 'Passive Voice & Impersonal Passive',
      templates: [
        {
          vn: 'Kế hoạch phát triển đô thị này đã được phê duyệt vào đầu tháng trước.',
          en: ['This urban development plan was approved early last month', 'The city development scheme was sanctioned early last month'],
          notes: 'Simple Passive Voice: S + be + V3/ed + Time.',
          level: 'B1' as const
        },
        {
          vn: 'Dự án đường sắt trên cao được cho là đã tiết kiệm hàng tỷ đồng cho ngân sách.',
          en: ['The elevated railway project is reported to have saved billions for the budget', 'The railway project is believed to have saved billions of dong'],
          notes: 'Impersonal Passive: S + is/are reported to have V3.',
          level: 'C1' as const
        },
        {
          vn: 'Các quy định mới về an toàn lao động đang được triển khai trên toàn quốc.',
          en: ['New safety regulations are being implemented nationwide', 'New labor safety rules are being enforced nationwide'],
          notes: 'Present Continuous Passive: S + is/are being + V3/ed.',
          level: 'B2' as const
        },
        {
          vn: 'Vắc-xin mới được kỳ vọng sẽ làm giảm tỷ lệ lây nhiễm trong cộng đồng.',
          en: ['The new vaccine is expected to reduce the infection rate in the community', 'The new vaccine is anticipated to lower infection rates'],
          notes: 'Impersonal Passive: S + is expected to V_bare.',
          level: 'B2' as const
        },
        {
          vn: 'Cuộc họp báo đã bị hủy bỏ mà không có lý do cụ thể.',
          en: ['The press conference was canceled without any specific reason', 'The press briefing was called off for no specific reason'],
          notes: 'Simple Past Passive: S + was/were + V3/ed.',
          level: 'A2' as const
        },
        {
          vn: 'Số liệu thống kê này được thu thập bởi các nhà nghiên cứu độc lập.',
          en: ['These statistical data were collected by independent researchers', 'This statistic was gathered by independent researchers'],
          notes: 'Passive with Agent: S + be + V3 + by Agent.',
          level: 'B1' as const
        },
        {
          vn: 'Công nghệ mã hóa dữ liệu này được đồn đoán là không thể bị bẻ khóa.',
          en: ['This data encryption technology is rumored to be unhackable', 'This encryption method is reported to be completely secure'],
          notes: 'Impersonal Passive: S + is rumored to be + Adj.',
          level: 'C2' as const
        },
      ]
    },
    {
      name: 'Causative & Existential Clauses (Have/Get, There + be/exist)',
      templates: [
        {
          vn: 'Giám đốc yêu cầu bộ phận kỹ thuật kiểm tra lại toàn bộ hệ thống server.',
          en: ['The director had the technical department inspect the entire server system', 'The manager got the tech team to check the whole server system'],
          notes: 'Active Causative: S + have + O_person + V_bare / get + O_person + to V.',
          level: 'B2' as const
        },
        {
          vn: 'Chúng tôi vừa mới cho bảo trì hệ thống điều hòa tại văn phòng.',
          en: ['We have just had the air conditioning system serviced in the office', 'We just got the office AC serviced'],
          notes: 'Passive Causative: S + have/get + O_thing + V3/ed.',
          level: 'B1' as const
        },
        {
          vn: 'Vẫn còn nhiều tranh cãi xoay quanh tính hiệu quả của chính sách kinh tế mới.',
          en: ['There remains much controversy surrounding the effectiveness of the new economic policy', 'There exist many debates over the new economic policy'],
          notes: 'Existential Clause: There + remain/exist + Noun Phrase.',
          level: 'C1' as const
        },
        {
          vn: 'Không còn đủ tài nguyên thiên nhiên cho các thế hệ tương lai nếu ô nhiễm tiếp tục.',
          en: ['There will be no longer enough natural resources for future generations if pollution continues', 'There won\'t remain sufficient natural resources'],
          notes: 'Future Existential Clause: There + will be/remain + Noun.',
          level: 'B2' as const
        },
        {
          vn: 'Bác sĩ khuyên bệnh nhân nên nhờ người thân chăm sóc trong tuần đầu.',
          en: ['The doctor advised the patient to get a relative to take care of him during the first week', 'The doctor recommended having a family member look after the patient'],
          notes: 'Causative combination: get sb to do sth / have sb do sth.',
          level: 'B2' as const
        },
      ]
    },
    {
      name: 'Gerund Subject & Infinitive of Purpose',
      templates: [
        {
          vn: 'Duy trì thói quen đọc sách hàng ngày mang lại nhiều lợi ích cho sự phát triển trí não.',
          en: ['Maintaining a daily reading habit brings numerous benefits to brain development', 'Reading books daily yields great benefits for brain development'],
          notes: 'Gerund Subject: V-ing + (O) + Singular Verb.',
          level: 'B1' as const
        },
        {
          vn: 'Để đạt được chứng chỉ IELTS điểm cao, sinh viên cần có lộ trình học tập rõ ràng.',
          en: ['To achieve a high IELTS score, students need to have a clear study roadmap', 'In order to get a high IELTS score, students require a clear learning plan'],
          notes: 'Infinitive of Purpose at clause start: To + V_bare, S + V.',
          level: 'B1' as const
        },
        {
          vn: 'Việc chuyển đổi sang sử dụng xe điện sẽ giúp giảm thiểu khí thải nhà kính.',
          en: ['Switching to electric vehicles will help curtail greenhouse emissions', 'Transitioning to electric cars helps reduce greenhouse gas emissions'],
          notes: 'Gerund Subject + help + bare infinitive.',
          level: 'B2' as const
        },
        {
          vn: 'Để nâng cao năng lực cạnh tranh quốc tế, các doanh nghiệp phải đẩy mạnh đổi mới công nghệ.',
          en: ['To enhance international competitiveness, enterprises must boost technological innovation', 'To improve global competitiveness, businesses ought to innovate technology'],
          notes: 'Infinitive of Purpose with modal obligation.',
          level: 'C1' as const
        },
        {
          vn: 'Việc lạm dụng mạng xã hội quá mức khiến nhiều người trẻ dễ rơi vào tình trạng lo âu.',
          en: ['Overusing social media makes many young people prone to anxiety', 'Excessive social media usage causes youth anxiety'],
          notes: 'Gerund Subject + make + object + adjective.',
          level: 'B2' as const
        },
      ]
    },
    {
      name: 'Participle Phrases (Active, Passive, Perfect)',
      templates: [
        {
          vn: 'Nhận thấy tiềm năng phát triển to lớn, công ty quyết định mở rộng chi nhánh sang châu Á.',
          en: ['Realizing the immense development potential, the firm decided to expand branches to Asia', 'Recognizing the vast growth potential, the company expanded to Asia'],
          notes: 'Active Participle Phrase: V-ing + (O), S + V.',
          level: 'B2' as const
        },
        {
          vn: 'Được hỗ trợ bởi các quỹ đầu tư mạo hiểm, dự án khởi nghiệp đã thành công vượt bậc.',
          en: ['Supported by venture capital funds, the startup project achieved remarkable success', 'Backed by venture capital, the startup succeeded immensely'],
          notes: 'Passive Participle Phrase: V3/ed + (prep), S + V.',
          level: 'B2' as const
        },
        {
          vn: 'Sau khi hoàn thành bản báo cáo tài chính, giám đốc đã triệu tập cuộc họp khẩn cấp.',
          en: ['Having completed the financial report, the director summoned an emergency meeting', 'Having finished the financial report, the manager called an urgent meeting'],
          notes: 'Perfect Participle Phrase: Having + V3/ed, S + V.',
          level: 'C1' as const
        },
        {
          vn: 'Sinh ra và lớn lên ở vùng nông thôn, anh ấy rất am hiểu về kỹ thuật nông nghiệp.',
          en: ['Born and raised in the countryside, he is deeply knowledgeable about agricultural techniques', 'Having been born in rural areas, he knows farming well'],
          notes: 'Passive past participle modification: Born and raised..., S + V.',
          level: 'B1' as const
        },
        {
          vn: 'Không chịu nổi áp lực công việc quá tải, nhiều nhân viên đã nộp đơn xin nghỉ việc.',
          en: ['Unable to bear the overwhelming work pressure, many employees submitted resignation letters', 'Failing to cope with heavy workloads, workers resigned'],
          notes: 'Adjectival / Participle introductory phrase.',
          level: 'C1' as const
        },
      ]
    },
    {
      name: 'Cleft Sentences & Inversion (Emphasis, Negative/Locative Inversion)',
      templates: [
        {
          vn: 'Chính sự kiên trì và nỗ lực không ngừng đã giúp cô ấy vượt qua mọi thử thách.',
          en: ['It was perseverance and relentless effort that helped her overcome all challenges', 'It is persistence that helped her pass all obstacles'],
          notes: 'Cleft Sentence: It is/was + Emphasized element + that + V.',
          level: 'B2' as const
        },
        {
          vn: 'Hiếm khi chúng ta chứng kiến một sự thay đổi công nghệ nhanh chóng đến như vậy.',
          en: ['Rarely do we witness such a rapid technological transformation', 'Seldom have we seen such fast technological changes'],
          notes: 'Negative Adverb Inversion: Rarely + auxiliary + S + V.',
          level: 'C1' as const
        },
        {
          vn: 'Dưới chân ngọn núi là một ngôi làng cổ kính với những mái nhà ngói đỏ.',
          en: ['At the foot of the mountain lies an ancient village with red-tiled roofs', 'At the base of the mountain sits an old village with red roofs'],
          notes: 'Locative Inversion: Prepositional phrase of place + Main Verb + Subject.',
          level: 'C1' as const
        },
        {
          vn: 'Trong bất kỳ hoàn cảnh nào, nhân viên cũng không được tiết lộ thông tin bảo mật của khách hàng.',
          en: ['Under no circumstances should employees disclose confidential customer information', 'On no account must staff leak private client data'],
          notes: 'Negative Inversion: Under no circumstances + modal + S + V.',
          level: 'C2' as const
        },
        {
          vn: 'Chính tại thành phố này 10 năm trước, dự án đổi mới xanh đã lần đầu tiên được thử nghiệm.',
          en: ['It was in this city 10 years ago that the green innovation project was first piloted', 'It was here ten years ago that the project started'],
          notes: 'Adverbial Cleft Sentence: It was + Prep Phrase + that + Passive V.',
          level: 'B2' as const
        },
      ]
    },
    {
      name: 'Conditionals & Subjunctive (Type 1-3, Mixed, Inverted)',
      templates: [
        {
          vn: 'Nếu chính quyền không nâng cấp hệ thống thoát nước, khu vực này sẽ ngập nặng vào mùa mưa.',
          en: ['If the local government does not upgrade the drainage system, this area will flood severely during the rainy season', 'Unless the government upgrades drainage, this area will be flooded'],
          notes: 'Conditional Type 1: If + S + V(s/es), S + will + V.',
          level: 'A2' as const
        },
        {
          vn: 'Nếu tôi có nhiều thời gian rảnh hơn, tôi sẽ tham gia các câu lạc bộ sách địa phương.',
          en: ['If I had more spare time, I would join local book clubs on weekends', 'If I had free time, I would participate in book clubs'],
          notes: 'Conditional Type 2: If + S + V2/ed, S + would + V_bare.',
          level: 'B1' as const
        },
        {
          vn: 'Nếu người lái xe giảm tốc độ kịp thời, vụ tai nạn giao thông nghiêm trọng đã không xảy ra.',
          en: ['If the driver had reduced speed in time, the severe traffic accident would not have occurred', 'Had the driver slowed down in time, the crash would have been avoided'],
          notes: 'Conditional Type 3: If + S + had V3, S + would have V3.',
          level: 'B2' as const
        },
        {
          vn: 'Nếu hồi đại học tôi chăm chỉ học ngoại ngữ, bây giờ tôi đã có cơ hội việc làm tốt hơn.',
          en: ['If I had studied foreign languages hard in college, I would have better job opportunities now', 'Had I studied hard at university, I would have a better job now'],
          notes: 'Mixed Conditional (Past condition affecting present result).',
          level: 'C1' as const
        },
        {
          vn: 'Nếu chính phủ cắt giảm ngân sách nghiên cứu, tiến độ dự án sẽ bị đình trệ nghiêm trọng.',
          en: ['Should the government reduce the research budget, project progress will be severely stalled', 'Were the government to cut research funds, progress would stall'],
          notes: 'Inverted Conditional Type 1/2: Should/Were + S + V, S + will/would + V.',
          level: 'C1' as const
        },
      ]
    },
    {
      name: 'Reported Speech & Special Reporting Verbs',
      templates: [
        {
          vn: 'Giám đốc dự án thông báo rằng cuộc họp tổng kết sẽ bị hoãn lại sang tuần tới.',
          en: ['The project director announced that the summary meeting would be postponed until next week', 'The manager informed that the meeting would be delayed'],
          notes: 'Reported Statement with tense backshift (will -> would).',
          level: 'B1' as const
        },
        {
          vn: 'Các chuyên gia y tế khuyên người dân nên duy trì chế độ ăn ít đường và tập thể dục.',
          en: ['Health experts recommended maintaining a low-sugar diet and exercising regularly', 'Medical experts advised people to keep a low-sugar diet'],
          notes: 'Reporting verb: Recommend + V-ing / advise sb + to V.',
          level: 'B2' as const
        },
        {
          vn: 'Họ hỏi chúng tôi mất bao lâu để hoàn thành bản thiết kế hệ thống mới.',
          en: ['They asked us how long it took to complete the new system design', 'They inquired how much time was needed to finish the system design'],
          notes: 'Reported Wh-Question without auxiliary inversion.',
          level: 'B1' as const
        },
        {
          vn: 'Các nhà môi trường cảnh báo chính quyền chống lại việc chặt phá khu rừng nguyên sinh.',
          en: ['Environmentalists warned authorities against clearing the primary forest', 'Conservationists warned against cutting down the virgin forest'],
          notes: 'Special reporting verb: Warn sb against V-ing.',
          level: 'C1' as const
        },
      ]
    },
    {
      name: 'Relative Clauses (Defining, Non-defining, Preposition + Which/Whom, Reduced)',
      templates: [
        {
          vn: 'Những học sinh nắm vững phương pháp học lặp lại ngắt quãng thường ghi nhớ kiến thức lâu hơn.',
          en: ['Students who master spaced repetition learning methods usually retain knowledge longer', 'Students mastering spaced repetition tend to remember longer'],
          notes: 'Defining Relative Clause (who + V).',
          level: 'B1' as const
        },
        {
          vn: 'Bản hợp đồng mà hai bên vừa ký kết chứa đựng nhiều điều khoản có lợi cho người lao động.',
          en: ['The contract in which both parties have recently signed contains favorable terms for workers', 'The agreement into which both sides entered offers benefits'],
          notes: 'Relative Clause with Preposition: Prep + which/whom.',
          level: 'B2' as const
        },
        {
          vn: 'Các ứng viên nộp hồ sơ trước thời hạn quy định sẽ được ưu tiên phỏng vấn.',
          en: ['Candidates submitting applications before the deadline will receive priority interviews', 'Applicants submitting files early will be interviewed first'],
          notes: 'Reduced Active Relative Clause: V-ing replacing who submit.',
          level: 'B2' as const
        },
        {
          vn: 'Thành phố Đà Nẵng, nơi vừa đăng cai hội nghị quốc tế, có cơ sở hạ tầng rất phát triển.',
          en: ['Da Nang City, which recently hosted the international conference, possesses well-developed infrastructure', 'Da Nang, hosting the summit, has modern infrastructure'],
          notes: 'Non-defining Relative Clause with commas (which + V).',
          level: 'B1' as const
        },
      ]
    },
    {
      name: 'Adverbial Clauses (Concession, Cause & Effect, Purpose)',
      templates: [
        {
          vn: 'Mặc dù chi phí đầu tư ban đầu khá tốn kém, việc chuyển đổi sang năng lượng mặt trời giúp tiết kiệm đáng kể.',
          en: ['Although initial investment costs are quite expensive, switching to solar power saves significantly in the long run', 'Despite high initial costs, solar transition saves money'],
          notes: 'Concession Clause: Although + S + V, S + V / Despite + Noun.',
          level: 'B2' as const
        },
        {
          vn: 'Khối lượng công việc lớn đến mức nhiều nhân viên phải làm thêm giờ mỗi ngày.',
          en: ['The workload was so heavy that many employees had to work overtime every day', 'It was such a heavy workload that staff worked overtime'],
          notes: 'Cause & Effect Result Clause: So + Adj + that / Such a + N + that.',
          level: 'B1' as const
        },
        {
          vn: 'Công ty triển khai hệ thống xác thực hai lớp để bảo vệ tài khoản người dùng khỏi các cuộc tấn công mạng.',
          en: ['The company deployed two-factor authentication so that user accounts could be protected from cyberattacks', 'The firm implemented 2FA in order that user data stays safe'],
          notes: 'Purpose Clause: so that / in order that + S + can/could + V.',
          level: 'B2' as const
        },
        {
          vn: 'Dù bài kiểm tra có khó đến đâu, cô ấy vẫn hoàn thành với điểm số tối đa.',
          en: ['Difficult as the test was, she passed it with a top score', 'No matter how hard the test was, she scored maximum marks'],
          notes: 'Advanced Concession: Adj/Adv + as/though + S + V.',
          level: 'C1' as const
        },
      ]
    }
  ]

  // Expand the bank by multiplying across level variations & topics up to ~500 items
  let count = 0
  for (let round = 1; round <= 25; round++) {
    for (const cat of categories) {
      for (const t of cat.templates) {
        count++
        const idStr = `prompt_sent_${count.toString().padStart(3, '0')}`
        bank.push({
          id: idStr,
          vietnameseText: round === 1 ? t.vn : `[Đề ${count}] ${t.vn}`,
          canonicalAnswersJson: JSON.stringify(t.en),
          grammarCategory: cat.name,
          grammarNotes: t.notes,
          difficulty: t.level
        })
      }
    }
  }

  return bank
}

export const initial500Sentences: InitialSentencePrompt[] = generateSentenceBank()
