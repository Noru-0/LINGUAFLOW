export interface SubtopicDefinition {
  id: string
  parentId: string
  nameEn: string
  nameVi: string
  description: string
  keywords: string[]
  icon?: string
}

export interface MajorTopicDefinition {
  id: string
  nameEn: string
  nameVi: string
  description: string
  icon: string
  color: string
  subtopics: SubtopicDefinition[]
}

export const INITIAL_TOPICS: MajorTopicDefinition[] = [
  {
    id: 'env',
    nameEn: 'Environment & Nature',
    nameVi: 'Môi trường & Thiên nhiên',
    description: 'Chủ đề sinh thái học, biến đổi khí hậu, năng lượng tái tạo và bảo tồn thiên nhiên.',
    icon: 'Leaf',
    color: '#10B981',
    subtopics: [
      {
        id: 'env.climate',
        parentId: 'env',
        nameEn: 'Climate Change & Global Warming',
        nameVi: 'Biến đổi khí hậu & Nóng lên toàn cầu',
        description: 'Khí nhà kính, nhiệt độ trái đất tăng, băng tan và biến đổi thời tiết cực đoan.',
        keywords: ['emission', 'emissions', 'greenhouse', 'warming', 'carbon', 'drought', 'temperatures', 'methane', 'atmosphere', 'ozone'],
      },
      {
        id: 'env.wildlife',
        parentId: 'env',
        nameEn: 'Biodiversity & Wildlife Conservation',
        nameVi: 'Đa dạng sinh học & Bảo tồn hoang dã',
        description: 'Các loài có nguy cơ tuyệt chủng, hệ sinh thái rừng nhiệt đới, chuỗi thức ăn và bảo tồn.',
        keywords: ['biodiversity', 'wildlife', 'extinction', 'endangered', 'habitat', 'fauna', 'flora', 'poaching', 'ecosystem', 'species'],
      },
      {
        id: 'env.energy',
        parentId: 'env',
        nameEn: 'Renewable Energy & Natural Resources',
        nameVi: 'Năng lượng tái tạo & Tài nguyên tự nhiên',
        description: 'Năng lượng mặt trời, điện gió, thủy điện, nhiên liệu hóa thạch và sử dụng bền vững.',
        keywords: ['renewable', 'solar', 'wind', 'fossil', 'fuels', 'hydroelectric', 'turbine', 'depletion', 'sustainability', 'geothermal'],
      },
      {
        id: 'env.pollution',
        parentId: 'env',
        nameEn: 'Pollution, Waste & Recycling',
        nameVi: 'Ô nhiễm & Tái chế rác thải',
        description: 'Ô nhiễm không khí, vi nhựa đại dương, rác thải công nghiệp và kinh tế tuần hoàn.',
        keywords: ['pollution', 'waste', 'recycle', 'recycling', 'landfill', 'contaminate', 'plastic', 'toxic', 'sewage', 'smog'],
      },
      {
        id: 'env.disaster',
        parentId: 'env',
        nameEn: 'Natural Disasters & Meteorology',
        nameVi: 'Thiên tai & Địa lý khí tượng',
        description: 'Bão lũ, động đất, sóng thần, núi lửa phun trào và dự báo khí tượng.',
        keywords: ['tsunami', 'earthquake', 'flood', 'hurricane', 'typhoon', 'volcano', 'avalanche', 'catastrophe', 'landslide', 'eruption'],
      },
    ],
  },
  {
    id: 'tech',
    nameEn: 'Science & Technology',
    nameVi: 'Khoa học & Công nghệ',
    description: 'Trí tuệ nhân tạo, an ninh mạng, khoa học máy tính, khám phá vũ trụ và công nghệ sinh học.',
    icon: 'Cpu',
    color: '#3B82F6',
    subtopics: [
      {
        id: 'tech.ai',
        parentId: 'tech',
        nameEn: 'Artificial Intelligence & Automation',
        nameVi: 'Trí tuệ nhân tạo & Tự động hóa',
        description: 'Học máy, mạng nơ-ron, robot công nghiệp và xử lý ngôn ngữ tự nhiên.',
        keywords: ['algorithm', 'neural', 'automation', 'robotics', 'intelligence', 'autonomous', 'computation', 'deep learning', 'chatgpt', 'agent'],
      },
      {
        id: 'tech.cyber',
        parentId: 'tech',
        nameEn: 'Cybersecurity & Cloud Systems',
        nameVi: 'An ninh mạng & Hệ thống đám mây',
        description: 'Mã hóa dữ liệu, tường lửa, tấn công mạng, điện toán đám mây và quyền riêng tư số.',
        keywords: ['cybersecurity', 'encryption', 'firewall', 'malware', 'cloud', 'server', 'hacker', 'vulnerability', 'phishing', 'privacy'],
      },
      {
        id: 'tech.space',
        parentId: 'tech',
        nameEn: 'Space Exploration & Astronomy',
        nameVi: 'Khám phá vũ trụ & Thiên văn học',
        description: 'Phi thuyền, kính thiên văn, các hành tinh, thiên thạch và sự sống ngoài trái đất.',
        keywords: ['astronomy', 'celestial', 'galaxy', 'satellite', 'telescope', 'astronaut', 'orbit', 'mars', 'cosmos', 'gravity'],
      },
      {
        id: 'tech.bio',
        parentId: 'tech',
        nameEn: 'Biotechnology & Genetics',
        nameVi: 'Công nghệ sinh học & Di truyền',
        description: 'Chỉnh sửa gen CRISPR, biến đổi gen sinh vật, tế bào gốc và nhân bản sinh học.',
        keywords: ['genetics', 'dna', 'biotechnology', 'genome', 'clone', 'mutation', 'crispr', 'chromosome', 'organism', 'cellular'],
      },
      {
        id: 'tech.digital',
        parentId: 'tech',
        nameEn: 'Digital Devices & Telecommunications',
        nameVi: 'Thiết bị số & Viễn thông',
        description: 'Mạng 5G, internet vạn vật (IoT), thiết bị đeo thông minh và phần cứng.',
        keywords: ['telecommunications', 'hardware', 'sensor', 'broadband', 'wearable', 'wireless', 'microchip', 'semiconductor', 'gadget'],
      },
    ],
  },
  {
    id: 'biz',
    nameEn: 'Business, Work & Economy',
    nameVi: 'Kinh doanh, Sự nghiệp & Kinh tế',
    description: 'Thương mại, thị trường tài chính, tuyển dụng, tiếp thị và quản trị doanh nghiệp.',
    icon: 'Briefcase',
    color: '#F59E0B',
    subtopics: [
      {
        id: 'biz.career',
        parentId: 'biz',
        nameEn: 'Employment, Careers & Workplace',
        nameVi: 'Việc làm, Tuyển dụng & Nơi làm việc',
        description: 'Thăng tiến, phỏng vấn xin việc, đàm phán lương bổng, văn hóa công sở.',
        keywords: ['employment', 'recruitment', 'workplace', 'salary', 'resume', 'colleague', 'promotion', 'severance', 'freelance', 'pension'],
      },
      {
        id: 'biz.finance',
        parentId: 'biz',
        nameEn: 'Corporate Finance & Banking',
        nameVi: 'Tài chính doanh nghiệp & Ngân hàng',
        description: 'Thị trường chứng khoán, dòng tiền, thanh khoản, cổ tức và phá sản.',
        keywords: ['liquidity', 'dividend', 'revenue', 'bankruptcy', 'stock', 'shareholder', 'portfolio', 'asset', 'liability', 'inflation'],
      },
      {
        id: 'biz.marketing',
        parentId: 'biz',
        nameEn: 'Marketing, Advertising & Branding',
        nameVi: 'Tiếp thị, Quảng cáo & Thương hiệu',
        description: 'Hành vi người tiêu dùng, định vị thương hiệu, chiến dịch truyền thông và kênh phân phối.',
        keywords: ['marketing', 'advertising', 'branding', 'campaign', 'consumer', 'niche', 'demographic', 'endorsement', 'penetration'],
      },
      {
        id: 'biz.trade',
        parentId: 'biz',
        nameEn: 'International Trade & Macroeconomics',
        nameVi: 'Thương mại quốc tế & Kinh tế vĩ mô',
        description: 'Xuất nhập khẩu, thuế quan, chuỗi cung ứng toàn cầu và GDP.',
        keywords: ['tariff', 'export', 'import', 'macroeconomics', 'gdp', 'supply chain', 'quota', 'embargo', 'commerce', 'deficit'],
      },
      {
        id: 'biz.leadership',
        parentId: 'biz',
        nameEn: 'Management & Corporate Governance',
        nameVi: 'Quản trị doanh nghiệp & Đàm phán',
        description: 'Kỹ năng lãnh đạo, quản lý rủi ro, đàm phán hợp đồng và cơ cấu tổ chức.',
        keywords: ['leadership', 'governance', 'negotiation', 'stakeholder', 'consensus', 'merger', 'acquisition', 'strategy', 'oversight'],
      },
    ],
  },
  {
    id: 'edu',
    nameEn: 'Education & Academia',
    nameVi: 'Giáo dục & Học thuật',
    description: 'Hệ thống trường học, đời sống đại học, phương pháp giảng dạy, thi cử và viết học thuật.',
    icon: 'GraduationCap',
    color: '#8B5CF6',
    subtopics: [
      {
        id: 'edu.university',
        parentId: 'edu',
        nameEn: 'Higher Education & Campus Life',
        nameVi: 'Đại học & Đời sống sinh viên',
        description: 'Học phí, học bổng, ký túc xá, giáo sư và chương trình đào tạo sau đại học.',
        keywords: ['university', 'tuition', 'scholarship', 'dormitory', 'campus', 'undergraduate', 'postgraduate', 'alumni', 'faculty'],
      },
      {
        id: 'edu.pedagogy',
        parentId: 'edu',
        nameEn: 'Teaching Methods & E-Learning',
        nameVi: 'Phương pháp sư phạm & Học trực tuyến',
        description: 'Phương pháp giảng dạy tích cực, giáo án điện tử, đào tạo từ xa và sư phạm.',
        keywords: ['pedagogy', 'pedagogical', 'curriculum', 'instruction', 'elearning', 'distance learning', 'syllabus', 'tutor'],
      },
      {
        id: 'edu.exams',
        parentId: 'edu',
        nameEn: 'Assessments, Grading & Credentials',
        nameVi: 'Thi cử, Đánh giá & Bằng cấp',
        description: 'Kỳ thi chuẩn hóa, thang điểm đánh giá, chứng chỉ và kiểm định chất lượng.',
        keywords: ['assessment', 'credential', 'qualification', 'standardized', 'plagiarism', 'benchmark', 'diploma', 'transcript'],
      },
      {
        id: 'edu.research',
        parentId: 'edu',
        nameEn: 'Academic Writing & Scientific Research',
        nameVi: 'Nghiên cứu khoa học & Viết học thuật',
        description: 'Luận văn tốt nghiệp, bình duyệt đồng cấp, trích dẫn tài liệu và phương pháp luận.',
        keywords: ['dissertation', 'thesis', 'peer review', 'citation', 'methodology', 'abstract', 'empirical', 'hypothesis', 'discourse'],
      },
    ],
  },
  {
    id: 'health',
    nameEn: 'Health, Medicine & Wellness',
    nameVi: 'Sức khỏe & Y tế',
    description: 'Dinh dưỡng, thể lực, sức khỏe tâm thần, dịch bệnh học và chăm sóc y tế.',
    icon: 'HeartPulse',
    color: '#EF4444',
    subtopics: [
      {
        id: 'health.diet',
        parentId: 'health',
        nameEn: 'Nutrition, Diet & Physical Fitness',
        nameVi: 'Dinh dưỡng & Thể lực',
        description: 'Chế độ ăn cân đối, vitamin, thể dục thể thao, béo phì và lối sống ít vận động.',
        keywords: ['nutrition', 'sedentary', 'metabolism', 'obesity', 'calorie', 'aerobic', 'carbohydrate', 'fitness', 'supplement'],
      },
      {
        id: 'health.mental',
        parentId: 'health',
        nameEn: 'Mental Health & Psychology',
        nameVi: 'Sức khỏe tâm thần & Tâm lý học',
        description: 'Stress, kiệt sức (burnout), lo âu, trầm cảm, khả năng phục hồi tinh thần.',
        keywords: ['psychology', 'resilience', 'burnout', 'anxiety', 'depression', 'cognitive', 'therapy', 'trauma', 'mindfulness'],
      },
      {
        id: 'health.disease',
        parentId: 'health',
        nameEn: 'Diseases, Pandemics & Pathology',
        nameVi: 'Bệnh học & Dịch bệnh',
        description: 'Bệnh truyền nhiễm, vi rút, vắc xin, dịch bệnh lây lan và miễn dịch cộng đồng.',
        keywords: ['epidemic', 'pandemic', 'pathogen', 'virus', 'infection', 'vaccine', 'immunity', 'chronic', 'symptom', 'diagnosis'],
      },
      {
        id: 'health.care',
        parentId: 'health',
        nameEn: 'Healthcare Systems & Pharmacology',
        nameVi: 'Hệ thống y tế & Dược phẩm',
        description: 'Bệnh viện, bảo hiểm y tế, kê đơn thuốc, bác sĩ phẫu thuật và chăm sóc giảm nhẹ.',
        keywords: ['pharmaceutical', 'prescription', 'surgery', 'hospitalization', 'palliative', 'medication', 'physician', 'dosage'],
      },
    ],
  },
  {
    id: 'soc',
    nameEn: 'Society, Culture & Law',
    nameVi: 'Xã hội, Văn hóa & Pháp luật',
    description: 'Bình đẳng xã hội, di sản văn hóa, nghệ thuật, luật pháp và tư pháp.',
    icon: 'Landmark',
    color: '#6366F1',
    subtopics: [
      {
        id: 'soc.equality',
        parentId: 'soc',
        nameEn: 'Social Equality & Demographics',
        nameVi: 'Bình đẳng xã hội & Dân số học',
        description: 'Bất bình đẳng thu nhập, cơ hội bình đẳng, phân biệt đối xử và già hóa dân số.',
        keywords: ['equality', 'marginalized', 'discrimination', 'demographics', 'aging population', 'inclusion', 'diversity', 'socioeconomic'],
      },
      {
        id: 'soc.arts',
        parentId: 'soc',
        nameEn: 'Arts, Literature & Music',
        nameVi: 'Nghệ thuật, Văn học & Âm nhạc',
        description: 'Hội họa, phong trào nghệ thuật, văn học kinh điển và biểu diễn nghệ thuật.',
        keywords: ['masterpiece', 'aesthetic', 'literature', 'avant-garde', 'sculpture', 'genre', 'symphony', 'renaissance', 'curator'],
      },
      {
        id: 'soc.heritage',
        parentId: 'soc',
        nameEn: 'History, Traditions & Cultural Heritage',
        nameVi: 'Lịch sử & Di sản văn hóa',
        description: 'Tập quán truyền thống, di tích lịch sử, khảo cổ học và bảo tồn văn hóa.',
        keywords: ['heritage', 'tradition', 'folklore', 'indigenous', 'archaeological', 'ancestor', 'monument', 'relic', 'preservation'],
      },
      {
        id: 'soc.law',
        parentId: 'soc',
        nameEn: 'Crime, Justice & Legal System',
        nameVi: 'Tội phạm & Hệ thống tư pháp',
        description: 'Tòa án, thẩm phán, hình phạt tù, tội phạm vị thành niên và pháp chế.',
        keywords: ['legislation', 'jurisprudence', 'delinquency', 'offender', 'verdict', 'prosecution', 'conviction', 'rehabilitation'],
      },
    ],
  },
  {
    id: 'urban',
    nameEn: 'Urbanization & Infrastructure',
    nameVi: 'Đô thị hóa & Cơ sở hạ tầng',
    description: 'Quy hoạch đô thị, giao thông công cộng, nhà ở và thành phố thông minh.',
    icon: 'Building2',
    color: '#06B6D4',
    subtopics: [
      {
        id: 'urban.planning',
        parentId: 'urban',
        nameEn: 'Urban Planning & Smart Cities',
        nameVi: 'Quy hoạch đô thị & Thành phố thông minh',
        description: 'Mật độ dân số đô thị, chỉnh trang đô thị (gentrification), không gian xanh.',
        keywords: ['urbanization', 'gentrification', 'smart city', 'density', 'zoning', 'infrastructure', 'sprawl', 'metropolis'],
      },
      {
        id: 'urban.transit',
        parentId: 'urban',
        nameEn: 'Public Transit & Commuting',
        nameVi: 'Giao thông công cộng & Đi lại',
        description: 'Tàu điện ngầm, tắc nghẽn giao thông, phí ùn tắc và hạ tầng cầu đường.',
        keywords: ['transit', 'commute', 'congestion', 'subway', 'metro', 'highway', 'pedestrian', 'carpool', 'gridlock'],
      },
      {
        id: 'urban.housing',
        parentId: 'urban',
        nameEn: 'Housing & Architecture',
        nameVi: 'Nhà ở & Kiến trúc',
        description: 'Bất động sản, giá nhà ở, căn hộ chung cư cao tầng và kiến trúc bền vững.',
        keywords: ['housing', 'skyscraper', 'real estate', 'mortgage', 'architecture', 'affordable housing', 'tenant', 'landlord'],
      },
    ],
  },
  {
    id: 'travel',
    nameEn: 'Travel, Tourism & Hospitality',
    nameVi: 'Du lịch & Dịch vụ khách sạn',
    description: 'Du lịch sinh thái, hàng không, lưu trú và trải nghiệm văn hóa.',
    icon: 'Compass',
    color: '#14B8A6',
    subtopics: [
      {
        id: 'travel.eco',
        parentId: 'travel',
        nameEn: 'Sightseeing & Sustainable Tourism',
        nameVi: 'Tham quan & Du lịch bền vững',
        description: 'Du lịch sinh thái, tour khám phá, di sản thiên nhiên và du lịch có trách nhiệm.',
        keywords: ['tourism', 'ecotourism', 'sightseeing', 'itinerary', 'destination', 'backpacking', 'excursion', 'souvenir'],
      },
      {
        id: 'travel.aviation',
        parentId: 'travel',
        nameEn: 'Aviation & Accommodations',
        nameVi: 'Hàng không & Lưu trú',
        description: 'Chuyến bay, quá cảnh, khách sạn, dịch vụ nghỉ dưỡng và tiếp viên.',
        keywords: ['aviation', 'layover', 'boarding', 'hospitality', 'resort', 'amenity', 'luggage', 'concierge', 'lodging'],
      },
      {
        id: 'travel.customs',
        parentId: 'travel',
        nameEn: 'Cultural Etiquette & Expatriate Life',
        nameVi: 'Giao lưu văn hóa & Định cư',
        description: 'Sốc văn hóa, phép xã giao, visa định cư và trải nghiệm cuộc sống ở nước ngoài.',
        keywords: ['etiquette', 'culture shock', 'expatriate', 'visa', 'immersion', 'customs', 'assimilation', 'nomad'],
      },
    ],
  },
  {
    id: 'life',
    nameEn: 'Daily Life, Family & Relationships',
    nameVi: 'Đời sống, Gia đình & Mối quan hệ',
    description: 'Nuôi dạy con cái, ẩm thực, tài chính cá nhân, sở thích và lối sống thường nhật.',
    icon: 'Smile',
    color: '#EC4899',
    subtopics: [
      {
        id: 'life.family',
        parentId: 'life',
        nameEn: 'Family Dynamics & Parenting',
        nameVi: 'Quan hệ gia đình & Nuôi dạy con',
        description: 'Tình cảm ruột thịt, nuôi dạy con cái, khoảng cách thế hệ và tình bạn.',
        keywords: ['upbringing', 'parenting', 'sibling', 'generation gap', 'kinship', 'bonding', 'adolescent', 'matrimony'],
      },
      {
        id: 'life.food',
        parentId: 'life',
        nameEn: 'Culinary Arts & Dining',
        nameVi: 'Ẩm thực & Nấu ăn',
        description: 'Món ăn truyền thống, nguyên liệu nấu nướng, nhà hàng cao cấp và ẩm thực đường phố.',
        keywords: ['cuisine', 'culinary', 'gourmet', 'ingredient', 'recipe', 'beverage', 'delicacy', 'flavor', 'appetite'],
      },
      {
        id: 'life.finance',
        parentId: 'life',
        nameEn: 'Personal Finance & Budgeting',
        nameVi: 'Tài chính cá nhân & Tiết kiệm',
        description: 'Chi tiêu gia đình, tiền tiết kiệm, đầu tư cá nhân và thói quen tiết kiệm.',
        keywords: ['budgeting', 'frugal', 'savings', 'expenses', 'allowance', 'thrift', 'installment', 'debt', 'living costs'],
      },
      {
        id: 'life.leisure',
        parentId: 'life',
        nameEn: 'Hobbies, Sports & Leisure',
        nameVi: 'Sở thích & Thể thao giải trí',
        description: 'Thời gian rảnh rỗi, thể thao ngoài trời, nhiếp ảnh, âm nhạc và giải trí.',
        keywords: ['leisure', 'recreation', 'hobby', 'pastime', 'amateur', 'tournament', 'craft', 'gardening', 'athletics'],
      },
    ],
  },
  {
    id: 'gov',
    nameEn: 'Global Politics & Humanitarian Affairs',
    nameVi: 'Chính trị toàn cầu & Nhân đạo',
    description: 'Ngoại giao, hiệp ước quốc tế, viện trợ nhân đạo và xung đột địa chính trị.',
    icon: 'Globe',
    color: '#64748B',
    subtopics: [
      {
        id: 'gov.diplomacy',
        parentId: 'gov',
        nameEn: 'Diplomacy & International Treaties',
        nameVi: 'Ngoại giao & Hiệp ước quốc tế',
        description: 'Đàm phán ngoại giao, đại sứ, hiệp định song phương và liên minh đa phương.',
        keywords: ['diplomacy', 'ambassador', 'treaty', 'bilateral', 'multilateral', 'alliance', 'summit', 'sovereignty', 'sanction'],
      },
      {
        id: 'gov.aid',
        parentId: 'gov',
        nameEn: 'Humanitarian Aid & Poverty Alleviation',
        nameVi: 'Viện trợ nhân đạo & Giảm nghèo',
        description: 'Cứu trợ thiên tai, người tị nạn, tổ chức phi chính phủ và xóa đói giảm nghèo.',
        keywords: ['humanitarian', 'refugee', 'aid', 'asylum', 'impoverished', 'famine', 'relief', 'philanthropy', 'ngo'],
      },
      {
        id: 'gov.globalization',
        parentId: 'gov',
        nameEn: 'Globalization & Geopolitics',
        nameVi: 'Toàn cầu hóa & Địa chính trị',
        description: 'Hội nhập kinh tế toàn cầu, căng thẳng biên giới và trật tự thế giới.',
        keywords: ['globalization', 'geopolitical', 'hegemony', 'superpower', 'borders', 'tensions', 'interdependence'],
      },
    ],
  },
]

/**
 * Fast Tier-1 heuristic keyword lookup for instant classification without API calls.
 */
export function fastLookupTopicByKeywords(
  term: string,
  definition?: string,
  exampleSentence?: string
): { majorTopicId: string; subtopicId: string } | null {
  const cleanTerm = term.trim().toLowerCase()
  const textToScan = `${cleanTerm} ${(definition || '').toLowerCase()} ${(exampleSentence || '').toLowerCase()}`

  let bestMatch: { majorTopicId: string; subtopicId: string; score: number } | null = null

  for (const major of INITIAL_TOPICS) {
    for (const sub of major.subtopics) {
      let score = 0
      for (const kw of sub.keywords) {
        const kwLower = kw.toLowerCase()
        if (cleanTerm === kwLower) {
          score += 15 // Exact match
        } else if (new RegExp(`\\b${kwLower}\\b`, 'i').test(cleanTerm)) {
          score += 10 // Whole word in term
        } else if (new RegExp(`\\b${kwLower}\\b`, 'i').test(textToScan)) {
          score += 3 // Whole word in context
        } else if (cleanTerm.includes(kwLower) && kwLower.length >= 5 && Math.abs(cleanTerm.length - kwLower.length) <= 2) {
          score += 4 // Close lemma / inflection
        }
      }
      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { majorTopicId: major.id, subtopicId: sub.id, score }
      }
    }
  }

  if (bestMatch && bestMatch.score >= 3) {
    return { majorTopicId: bestMatch.majorTopicId, subtopicId: bestMatch.subtopicId }
  }

  return null
}
