# Đặc Tả Phân Tầng Chủ Đề & Tiêu Chí Phân Loại Từ Vựng (Topic Taxonomy Specification)

Tài liệu này định nghĩa chi tiết cấu trúc phân tầng gồm **10 Chủ đề chính (Main Topics)** và **41 Chủ đề nhánh (Subtopics)** dành cho hệ thống phân loại từ vựng học thuật (IELTS/CEFR). Mỗi subtopic đi kèm mô tả ngữ nghĩa, tiêu chí bao gồm (Inclusion Criteria), tiêu chí loại trừ (Exclusion Criteria) và bảng nhận diện các cặp chủ đề dễ nhầm lẫn để làm chuẩn đầu vào (Ground Truth) cho cả AI Prompting và kiểm thử dữ liệu.

---

## 1. Danh Mục 10 Main Topics & Toàn Bộ Subtopics

| STT | Mã Main Topic | Tên Main Topic (EN / VI) | Danh Sách Subtopics (`id` - Tên) |
| :--- | :--- | :--- | :--- |
| **1** | `env` | **Environment & Nature**<br>*(Môi trường & Thiên nhiên)* | `env.climate` (Climate Change & Emissions)<br>`env.wildlife` (Biodiversity & Wildlife Conservation)<br>`env.pollution` (Pollution, Waste & Recycling)<br>`env.energy` (Renewable Energy & Natural Resources)<br>`env.disaster` (Natural Disasters & Geography) |
| **2** | `tech` | **Science & Technology**<br>*(Khoa học & Công nghệ)* | `tech.ai` (Artificial Intelligence & Automation)<br>`tech.cyber` (Cybersecurity & Information Systems)<br>`tech.space` (Space Exploration & Astronomy)<br>`tech.bio` (Biotechnology & Genetics)<br>`tech.digital` (Digital Transformation & Consumer Devices) |
| **3** | `biz` | **Business, Work & Economy**<br>*(Kinh doanh, Việc làm & Kinh tế)* | `biz.career` (Employment, Recruitment & Workplace)<br>`biz.finance` (Corporate Finance, Investment & Banking)<br>`biz.marketing` (Marketing, Branding & Consumers)<br>`biz.trade` (International Trade & Macroeconomics)<br>`biz.leadership` (Corporate Leadership & Operations) |
| **4** | `edu` | **Education & Academia**<br>*(Giáo dục & Học thuật)* | `edu.university` (Higher Education & Campus Life)<br>`edu.pedagogy` (Teaching Methodologies & E-Learning)<br>`edu.exams` (Assessments, Grading & Credentials)<br>`edu.research` (Academic Writing & Scientific Research)<br>`edu.discourse` (Academic Discourse & Linking) |
| **5** | `health` | **Health, Medicine & Wellness**<br>*(Sức khỏe, Y học & Đời sống lành mạnh)* | `health.diet` (Nutrition, Diet & Physical Fitness)<br>`health.mental` (Mental Health & Psychology)<br>`health.disease` (Diseases, Pandemics & Pathology)<br>`health.care` (Healthcare Systems & Pharmacology) |
| **6** | `soc` | **Society, Culture & Law**<br>*(Xã hội, Văn hóa & Pháp luật)* | `soc.equality` (Diversity, Gender & Social Mobility)<br>`soc.arts` (Visual Arts, Literature & Music)<br>`soc.heritage` (History, Traditions & Customs)<br>`soc.law` (Crime, Law Enforcement & Justice) |
| **7** | `urban` | **Urbanization & Infrastructure**<br>*(Đô thị hóa & Cơ sở hạ tầng)* | `urban.planning` (Smart Cities & Urban Density)<br>`urban.transit` (Public Transportation & Infrastructure)<br>`urban.housing` (Real Estate, Architecture & Interior) |
| **8** | `travel` | **Travel & Hospitality**<br>*(Du lịch & Dịch vụ lưu trú)* | `travel.eco` (Sightseeing & Sustainable Tourism)<br>`travel.aviation` (Aviation, Hotels & Accommodations)<br>`travel.customs` (Cultural Etiquette & Expatriate Life) |
| **9** | `life` | **Daily Life & Personal Finance**<br>*(Đời sống cá nhân & Tài chính hộ gia đình)* | `life.family` (Family Dynamics, Parenting & Friendship)<br>`life.food` (Culinary Arts, Cooking & Dining)<br>`life.finance` (Personal Budgeting, Saving & Taxes)<br>`life.leisure` (Hobbies, Entertainment & Sports) |
| **10** | `gov` | **Global Politics & Humanitarian**<br>*(Chính trị toàn cầu & Nhân đạo)* | `gov.diplomacy` (Diplomacy, Treaties & Alliances)<br>`gov.aid` (Humanitarian Aid & Poverty Alleviation)<br>`gov.globalization` (Global Supply Chain & Geopolitics) |
| **11 (Non-topical)** | `gen` | **General Vocabulary**<br>*(Từ vựng tổng quát / Phi chủ đề)* | `gen.function` (Function Words)<br>`gen.linking` (Linking & Discourse)<br>`gen.auxiliary` (Auxiliary & Linking Verbs)<br>`gen.general` (General-purpose Vocabulary) |

---

## 2. Chi Tiết Mô Tả & Tiêu Chí Phân Loại (Inclusion & Exclusion Criteria)

### 2.1 Main Topic 1: Environment & Nature (`env`)

| Subtopic (`id`) | Description (Mô tả) | Inclusion Criteria (Tiêu chí bao gồm) | Exclusion Criteria (Tiêu chí loại trừ) |
| :--- | :--- | :--- | :--- |
| **`env.climate`**<br>Climate Change & Emissions | Từ vựng về sự biến đổi khí hậu dài hạn, hiệu ứng nhà kính, khí thải carbon và các chính sách ứng phó khí hậu toàn cầu. | Global warming, greenhouse gases, carbon footprint, emissions, climate policy, ozone depletion, temperature anomalies. | Renewable energy technologies (`env.energy`), localized trash/plastic pollution (`env.pollution`), sudden weather events (`env.disaster`). |
| **`env.wildlife`**<br>Biodiversity & Wildlife Conservation | Từ vựng liên quan đến hệ sinh thái, bảo tồn động thực vật hoang dã, các loài có nguy cơ tuyệt chủng và nạn phá rừng. | Wildlife, ecosystems, endangered species, habitat loss, poaching, deforestation, marine conservation, flora and fauna. | General air/water pollution (`env.pollution`), genetic modification in labs (`tech.bio`), domestic pets (`life.family`). |
| **`env.pollution`**<br>Pollution, Waste & Recycling | Từ vựng về ô nhiễm môi trường cục bộ (không khí, nguồn nước, đất), quản lý rác thải và quy trình tái chế. | Air/water/soil pollution, toxic waste, landfills, microplastics, recycling, sewage, smog, industrial runoff. | Greenhouse gas climate warming (`env.climate`), clean energy generation (`env.energy`). |
| **`env.energy`**<br>Renewable Energy & Natural Resources | Từ vựng về các nguồn năng lượng tái tạo, công nghệ năng lượng sạch, nhiên liệu hóa thạch và khai thác tài nguyên thiên nhiên. | Solar, wind, hydroelectricity, fossil fuels, coal, natural gas, energy grid, sustainability, resource depletion. | Climate change treaties/policy (`env.climate`), vehicle traffic congestion (`urban.transit`). |
| **`env.disaster`**<br>Natural Disasters & Geography | Từ vựng mô tả các hiện tượng thời tiết cực đoan, thảm họa tự nhiên và đặc điểm địa hình, địa lý tự nhiên. | Earthquakes, tsunamis, droughts, floods, hurricanes, volcanic eruptions, topography, arid regions, river basins. | Man-made industrial accidents (`env.pollution`), humanitarian refugee relief operations (`gov.aid`). |

---

### 2.2 Main Topic 2: Science & Technology (`tech`)

| Subtopic (`id`) | Description (Mô tả) | Inclusion Criteria (Tiêu chí bao gồm) | Exclusion Criteria (Tiêu chí loại trừ) |
| :--- | :--- | :--- | :--- |
| **`tech.ai`**<br>Artificial Intelligence & Automation | Từ vựng về trí tuệ nhân tạo, học máy, robot tự động hóa và tác động của thuật toán thông minh. | Machine learning, neural networks, algorithms, robotics, automation, generative AI, natural language processing. | Network hacking/data privacy (`tech.cyber`), everyday smartphones/social media (`tech.digital`). |
| **`tech.cyber`**<br>Cybersecurity & Information Systems | Từ vựng về bảo mật mạng, mã hóa dữ liệu, quyền riêng tư số, hạ tầng đám mây và tội phạm công nghệ cao. | Encryption, data breaches, malware, firewalls, cloud computing, digital privacy, phishing, authentication. | Physical street crime and court trials (`soc.law`), AI model training (`tech.ai`). |
| **`tech.space`**<br>Space Exploration & Astronomy | Từ vựng về thám hiểm vũ trụ, thiên văn học, tàu vũ trụ, vệ tinh và các thiên thể ngoài Trái Đất. | Celestial bodies, orbits, satellites, space missions, galaxies, astronauts, astrophysics, telescopes. | Earth's atmosphere and climate (`env.climate`), aviation and commercial airlines (`travel.aviation`). |
| **`tech.bio`**<br>Biotechnology & Genetics | Từ vựng về công nghệ sinh học, biến đổi gen, nghiên cứu tế bào gốc và ứng dụng sinh học trong khoa học. | DNA, genetic engineering, cloning, stem cells, GMOs, bioinformatics, CRISPR, molecular biology. | Clinical patient treatment and hospitals (`health.care`), infectious disease outbreaks (`health.disease`). |
| **`tech.digital`**<br>Digital Transformation & Consumer Devices | Từ vựng về thiết bị điện tử tiêu dùng, chuyển đổi số, internet vạn vật (IoT) và ứng dụng công nghệ đời sống. | Smartphones, wearable devices, IoT, broadband, user interface, digital literacy, e-commerce platforms. | Deep AI algorithms (`tech.ai`), online marketing campaigns (`biz.marketing`). |

---

### 2.3 Main Topic 3: Business, Work & Economy (`biz`)

| Subtopic (`id`) | Description (Mô tả) | Inclusion Criteria (Tiêu chí bao gồm) | Exclusion Criteria (Tiêu chí loại trừ) |
| :--- | :--- | :--- | :--- |
| **`biz.career`**<br>Employment, Recruitment & Workplace | Từ vựng về thị trường lao động, tuyển dụng, phúc lợi nhân viên, văn hóa công sở và phát triển sự nghiệp. | Recruitment, resume, severance pay, work-life balance, promotion, remote work, unemployment, human resources. | Corporate stock valuation (`biz.finance`), executive board strategy (`biz.leadership`). |
| **`biz.finance`**<br>Corporate Finance, Investment & Banking | Từ vựng về tài chính doanh nghiệp, thị trường chứng khoán, ngân hàng, đầu tư và kế toán thương mại. | Liquidity, equity, dividends, venture capital, interest rates, mergers, bankruptcy, auditing, inflation. | Personal household budgeting and home mortgages (`life.finance`), international tariffs (`biz.trade`). |
| **`biz.marketing`**<br>Marketing, Branding & Consumers | Từ vựng về tiếp thị, quảng cáo, định vị thương hiệu, nghiên cứu thị trường và hành vi người tiêu dùng. | Brand loyalty, market penetration, target audience, advertising campaigns, consumer behavior, endorsements. | Macro-level import/export trade (`biz.trade`), internal HR management (`biz.career`). |
| **`biz.trade`**<br>International Trade & Macroeconomics | Từ vựng về kinh tế vĩ mô, thương mại quốc tế, xuất nhập khẩu, thuế quan và tăng trưởng GDP. | Tariffs, exports, imports, GDP, recession, fiscal policy, protectionism, trade deficit, currency exchange. | Geopolitical military alliances (`gov.diplomacy`), logistics shipping delays (`gov.globalization`). |
| **`biz.leadership`**<br>Corporate Leadership & Operations | Từ vựng về quản trị doanh nghiệp, điều hành chuỗi vận hành, đàm phán thương mại và ra quyết định chiến lược. | Stakeholders, consensus, delegation, corporate governance, restructuring, KPIs, negotiation, entrepreneurship. | Entry-level job hunting (`biz.career`), consumer ad slogans (`biz.marketing`). |

---

### 2.4 Main Topic 4: Education & Academia (`edu`)

| Subtopic (`id`) | Description (Mô tả) | Inclusion Criteria (Tiêu chí bao gồm) | Exclusion Criteria (Tiêu chí loại trừ) |
| :--- | :--- | :--- | :--- |
| **`edu.university`**<br>Higher Education & Campus Life | Từ vựng về giáo dục đại học, học phí, học bổng, đời sống sinh viên và cấu trúc các khoa/viện. | Tuition fees, scholarships, undergraduates, campus, faculty, lectures, dormitories, student loans. | Teaching methods and lesson plans (`edu.pedagogy`), laboratory data analysis (`edu.research`). |
| **`edu.pedagogy`**<br>Teaching Methodologies & E-Learning | Từ vựng về phương pháp sư phạm, thiết kế chương trình giảng dạy, giáo dục trực tuyến và tâm lý học đường. | Curriculum, pedagogical, vocational training, e-learning, interactive learning, literacy, rote memorization. | Standardized test grading (`edu.exams`), university campus facilities (`edu.university`). |
| **`edu.exams`**<br>Assessments, Grading & Credentials | Từ vựng về thi cử, đánh giá năng lực, bằng cấp, chứng chỉ và kỷ luật học đường. | Plagiarism, GPA, diplomas, standardized tests, evaluations, accreditation, transcripts, scholarships merit. | Writing a scientific thesis (`edu.research`), job interview assessments (`biz.career`). |
| **`edu.research`**<br>Academic Writing & Scientific Research | Từ vựng về phương pháp nghiên cứu khoa học, viết luận văn, trích dẫn học thuật và bình duyệt. | Dissertation, peer review, hypothesis, methodology, empirical data, citations, bibliography, qualitative/quantitative. | General essay transition words (`edu.discourse`), lab biotech equipment (`tech.bio`). |
| **`edu.discourse`**<br>Academic Discourse & Linking | Từ vựng chức năng, từ nối học thuật và các động từ/tính từ trừu tượng dùng để lập luận trong văn viết học thuật. | Consequently, notwithstanding, paradigm, substantiate, correlate, predominant, nuance, multifaceted. | Domain-specific nouns (e.g., `emissions`, `tariffs`, `algorithms`). |

---

### 2.5 Main Topic 5: Health, Medicine & Wellness (`health`)

| Subtopic (`id`) | Description (Mô tả) | Inclusion Criteria (Tiêu chí bao gồm) | Exclusion Criteria (Tiêu chí loại trừ) |
| :--- | :--- | :--- | :--- |
| **`health.diet`**<br>Nutrition, Diet & Physical Fitness | Từ vựng về dinh dưỡng, chế độ ăn uống lành mạnh, thể chất, béo phì và lối sống vận động. | Sedentary lifestyle, malnutrition, obesity, metabolism, nutrients, cardio, hydration, dietary supplements. | Cooking recipes and restaurant dining (`life.food`), competitive professional sports (`life.leisure`). |
| **`health.mental`**<br>Mental Health & Psychology | Từ vựng về sức khỏe tinh thần, tâm lý học, căng thẳng, rối loạn cảm xúc và trị liệu tâm lý. | Burnout, resilience, anxiety, depression, cognitive therapy, trauma, mindfulness, psychological well-being. | Neurological physical diseases (`health.disease`), general workplace HR policies (`biz.career`). |
| **`health.disease`**<br>Diseases, Pandemics & Pathology | Từ vựng về bệnh lý, dịch bệnh truyền nhiễm, triệu chứng lâm sàng, miễn dịch và chẩn đoán y khoa. | Epidemiology, contagious, chronic illness, immunity, symptoms, diagnosis, pathogens, vaccination. | Hospital insurance and funding (`health.care`), genetic engineering in labs (`tech.bio`). |
| **`health.care`**<br>Healthcare Systems & Pharmacology | Từ vựng về hệ thống y tế, bệnh viện, dược phẩm, điều trị y khoa và chính sách chăm sóc sức khỏe cộng đồng. | Prescriptions, pharmaceuticals, surgery, clinical trials, public healthcare, palliative care, medical malpractice. | Healthy eating habits (`health.diet`), emotional stress management (`health.mental`). |

---

### 2.6 Main Topic 6: Society, Culture & Law (`soc`)

| Subtopic (`id`) | Description (Mô tả) | Inclusion Criteria (Tiêu chí bao gồm) | Exclusion Criteria (Tiêu chí loại trừ) |
| :--- | :--- | :--- | :--- |
| **`soc.equality`**<br>Diversity, Gender & Social Mobility | Từ vựng về bình đẳng xã hội, đa dạng văn hóa, phân tầng giai cấp, nhân quyền và phúc lợi cộng đồng. | Marginalized, social mobility, gender gap, discrimination, inclusion, demographics, civil rights, inequality. | International refugee crisis and foreign aid (`gov.aid`), courtroom criminal sentencing (`soc.law`). |
| **`soc.arts`**<br>Visual Arts, Literature & Music | Từ vựng về nghệ thuật thị giác, văn học, âm nhạc, điện ảnh, thẩm mỹ và phê bình nghệ thuật. | Avant-garde, aesthetics, choreography, anthology, masterpiece, censorship in art, sculptures, acoustics. | Historical monuments and ancient rituals (`soc.heritage`), casual weekend hobbies (`life.leisure`). |
| **`soc.heritage`**<br>History, Traditions & Customs | Từ vựng về lịch sử, di sản văn hóa, phong tục tập quán truyền thống, khảo cổ học và bản sắc dân tộc. | Folklore, heritage, rituals, archaeology, indigenous, assimilation, cultural preservation, ancestry. | Tourist souvenirs and hotel stays (`travel.customs`), contemporary painting exhibitions (`soc.arts`). |
| **`soc.law`**<br>Crime, Law Enforcement & Justice | Từ vựng về tội phạm học, hệ thống tư pháp, thực thi pháp luật, tòa án và cải tạo phạm nhân. | Delinquency, jurisprudence, litigation, verdict, incarceration, rehabilitation, felony, legislation. | Cyber hacking attacks (`tech.cyber`), international diplomatic treaties (`gov.diplomacy`). |

---

### 2.7 Main Topic 7: Urbanization & Infrastructure (`urban`)

| Subtopic (`id`) | Description (Mô tả) | Inclusion Criteria (Tiêu chí bao gồm) | Exclusion Criteria (Tiêu chí loại trừ) |
| :--- | :--- | :--- | :--- |
| **`urban.planning`**<br>Smart Cities & Urban Density | Từ vựng về quy hoạch đô thị, đô thị hóa, mật độ dân số thành thị, không gian xanh và cải tạo khu dân cư. | Gentrification, urban sprawl, zoning laws, metropolitan, overpopulation, public amenities, green belts. | Inside home interior decoration (`urban.housing`), rural wildlife habitats (`env.wildlife`). |
| **`urban.transit`**<br>Public Transportation & Infrastructure | Từ vựng về giao thông công cộng, cơ sở hạ tầng đường bộ, ùn tắc giao thông và quy hoạch vận tải đô thị. | Congestion charge, commuters, mass transit, pedestrians, gridlock, viaducts, railway networks. | International commercial flights (`travel.aviation`), electric battery chemistry (`env.energy`). |
| **`urban.housing`**<br>Real Estate, Architecture & Interior | Từ vựng về bất động sản, kiến trúc công trình, xây dựng nhà ở và thiết kế không gian nội thất. | Skyscrapers, residential, architecture, renovation, tenants, landlords, prefabricated, sustainable buildings. | Personal mortgage interest calculations (`life.finance`), city-wide zoning policy (`urban.planning`). |

---

### 2.8 Main Topic 8: Travel & Hospitality (`travel`)

| Subtopic (`id`) | Description (Mô tả) | Inclusion Criteria (Tiêu chí bao gồm) | Exclusion Criteria (Tiêu chí loại trừ) |
| :--- | :--- | :--- | :--- |
| **`travel.eco`**<br>Sightseeing & Sustainable Tourism | Từ vựng về du lịch sinh thái, tham quan danh lam thắng cảnh, tác động của du lịch đại chúng và trải nghiệm khám phá. | Itinerary, eco-lodge, mass tourism, landmarks, excursions, conservation tourism, off the beaten track. | Airline baggage rules and hotel check-in (`travel.aviation`), wildlife biology (`env.wildlife`). |
| **`travel.aviation`**<br>Aviation, Hotels & Accommodations | Từ vựng về hàng không thương mại, thủ tục sân bay, khách sạn, khu nghỉ dưỡng và dịch vụ lưu trú. | Layover, hospitality, boarding pass, concierge, all-inclusive, customs clearance, turbulence, reservations. | Daily city bus/metro commuting (`urban.transit`), space rockets (`tech.space`). |
| **`travel.customs`**<br>Cultural Etiquette & Expatriate Life | Từ vựng về giao tiếp liên văn hóa khi du lịch, sốc văn hóa, nghi thức ứng xử quốc tế và cuộc sống xa xứ. | Culture shock, etiquette, expatriate, language barrier, cosmopolitan, hospitality customs, souvenir. | Deep historical archaeology (`soc.heritage`), immigration asylum laws (`gov.aid`). |

---

### 2.9 Main Topic 9: Daily Life & Personal Finance (`life`)

| Subtopic (`id`) | Description (Mô tả) | Inclusion Criteria (Tiêu chí bao gồm) | Exclusion Criteria (Tiêu chí loại trừ) |
| :--- | :--- | :--- | :--- |
| **`life.family`**<br>Family Dynamics, Parenting & Friendship | Từ vựng về mối quan hệ gia đình, nuôi dạy con cái, hôn nhân, tình bạn và các giai đoạn cuộc đời. | Upbringing, adolescence, kinship, camaraderie, nuclear family, generational gap, guardianship. | Workplace team management (`biz.leadership`), societal gender inequality (`soc.equality`). |
| **`life.food`**<br>Culinary Arts, Cooking & Dining | Từ vựng về ẩm thực, kỹ thuật nấu nướng, nguyên liệu món ăn, hương vị và văn hóa ăn uống thường nhật. | Gourmet, cuisine, ingredients, culinary, seasoning, appetite, hospitality dining, perishables. | Clinical nutrition macros and obesity (`health.diet`), agricultural crop yields (`env.energy`). |
| **`life.finance`**<br>Personal Budgeting, Saving & Taxes | Từ vựng về quản lý tài chính cá nhân, tiết kiệm, chi tiêu hộ gia đình, vay thế chấp và thuế thu nhập cá nhân. | Frugality, mortgage, disposable income, installments, pension, expenditure, personal debt, tax return. | Corporate mergers and stock IPOs (`biz.finance`), national GDP growth (`biz.trade`). |
| **`life.leisure`**<br>Hobbies, Entertainment & Sports | Từ vựng về sở thích cá nhân, giải trí đại chúng, thể thao phong trào và hoạt động thư giãn cuối tuần. | Amateur, pastimes, recreation, spectator, binge-watching, sportsmanship, DIY, board games. | Fine art criticism (`soc.arts`), medical physical therapy (`health.care`). |

---

### 2.10 Main Topic 10: Global Politics & Humanitarian (`gov`)

| Subtopic (`id`) | Description (Mô tả) | Inclusion Criteria (Tiêu chí bao gồm) | Exclusion Criteria (Tiêu chí loại trừ) |
| :--- | :--- | :--- | :--- |
| **`gov.diplomacy`**<br>Diplomacy, Treaties & Alliances | Từ vựng về ngoại giao quốc tế, hiệp ước, liên minh chính trị, chủ quyền quốc gia và đàm phán đa phương. | Sanctions, bilateral, treaty, sovereignty, ambassador, geopolitical, summit, diplomatic immunity. | Commercial import/export tariffs (`biz.trade`), domestic criminal courts (`soc.law`). |
| **`gov.aid`**<br>Humanitarian Aid & Poverty Alleviation | Từ vựng về cứu trợ nhân đạo, khủng hoảng tị nạn, xóa đói giảm nghèo và các tổ chức phi chính phủ (NGOs). | Refugees, asylum, humanitarian aid, famine, philanthropy, NGOs, poverty alleviation, relief funds. | Domestic gender/racial diversity (`soc.equality`), natural disaster meteorology (`env.disaster`). |
| **`gov.globalization`**<br>Global Supply Chain & Geopolitics | Từ vựng về toàn cầu hóa, chuỗi cung ứng xuyên quốc gia, hội nhập quốc tế và tác động xuyên biên giới. | Outsourcing, cross-border, supply chain, multinational, cultural homogenization, interdependence. | Local retail marketing (`biz.marketing`), city commuter trains (`urban.transit`). |

---

### 2.11 Nhánh Phi Chủ Đề: General Vocabulary (`gen`, `topic_type: "general"`)

Nhánh này tách biệt khỏi 10 chủ đề IELTS (`topic_type: "topical"`) để xử lý các sense mang chức năng ngữ pháp hoặc ngữ nghĩa tổng quát đa lĩnh vực, tránh hiện tượng *forced classification*. **Nguyên tắc cốt lõi:** phân loại theo **ngữ nghĩa từng sense**, không suy ra máy móc từ POS (`preposition`, `conjunction`, `verb`, `noun` đều có thể là topical hoặc general tùy nghĩa).

| Subtopic (`id`) | Description (Mô tả) | Inclusion Criteria (Tiêu chí bao gồm) | Exclusion Criteria (Tiêu chí loại trừ) |
| :--- | :--- | :--- | :--- |
| **`gen.function`**<br>Function Words | Từ chức năng ngữ pháp biểu thị quan hệ không gian, thời gian, sở hữu hoặc cấu trúc câu. | Prepositions, pronouns, determiners, quantifiers mang nghĩa cấu trúc thuần túy (*about, above, under, through, during, between*). | Giới từ/cụm từ gắn với nghĩa chuyên biệt trong một sense cụ thể; từ nối câu (`gen.linking`). |
| **`gen.linking`**<br>Linking & Discourse | Liên từ, trạng từ chuyển tiếp và dấu hiệu diễn ngôn kết nối mệnh đề/ý tưởng nói chung. | *Although, however, therefore, moreover, nevertheless, whereas, unless, because*. | Động từ nối/copular verbs (`gen.auxiliary`); thuật ngữ lập luận học thuật chuyên sâu (`edu.discourse`). |
| **`gen.auxiliary`**<br>Auxiliary & Linking Verbs | Trợ động từ, động từ khuyết thiếu và động từ nối (*copular/linking verbs*) biểu thị trạng thái hoặc tình thái. | *Be, become, seem, remain, appear, might, should, must* (ở sense trạng thái/trợ động từ). | Động từ hành động mang nghĩa chuyên ngành hoặc liên kết mệnh đề (`gen.linking`). |
| **`gen.general`**<br>General-purpose Vocabulary | Danh từ, động từ, tính từ, trạng từ mang nghĩa tổng quát dùng chung cho mọi chủ đề. | *Thing, aspect, various, certain, significant, approximately, improve, increase, important, similar*. | Thuật ngữ gắn với ngữ cảnh IELTS cụ thể (vd. *biodiversity* → `env.wildlife`, *unemployment* → `biz.career`). |

---

## 3. Các Cặp Topic Dễ Nhầm Lẫn (Confusable Topic Pairs Matrix)

Bảng dưới đây xác định ranh giới phân tách (Disambiguation Rules) giữa các cặp chủ đề có độ giao thoa ngữ nghĩa cao, giúp tránh gán nhầm nhãn khi phân loại từ vựng.

| Cặp Topic Dễ Nhầm Lẫn | Điểm Giao Thoa (Overlap) | Quy Tắc Phân Tách (Disambiguation Rule) | Ví Dụ Minh Họa |
| :--- | :--- | :--- | :--- |
| **`env.climate`** vs **`env.energy`** | Đều nói về giải pháp giảm phát thải carbon và bảo vệ Trái Đất. | • **`env.climate`**: Tập trung vào *hiện tượng khí hậu*, khí nhà kính và chính sách khí hậu.<br>• **`env.energy`**: Tập trung vào *công nghệ tạo ra năng lượng* và nguồn nhiên liệu. | • *greenhouse gas, carbon tax* $\rightarrow$ `env.climate`<br>• *solar panel, wind turbine* $\rightarrow$ `env.energy` |
| **`env.wildlife`** vs **`env.pollution`** | Đều liên quan đến tác hại của con người lên tự nhiên. | • **`env.wildlife`**: Tập trung vào *sinh vật sống*, đa dạng sinh học và môi trường sống.<br>• **`env.pollution`**: Tập trung vào *chất gây ô nhiễm*, rác thải và xử lý chất thải. | • *poaching, endangered species* $\rightarrow$ `env.wildlife`<br>• *microplastics, toxic runoff* $\rightarrow$ `env.pollution` |
| **`biz.finance`** vs **`life.finance`** | Đều sử dụng các thuật ngữ về tiền tệ, lãi suất, nợ và đầu tư. | • **`biz.finance`**: Quy mô *doanh nghiệp, ngân hàng, thị trường vốn*.<br>• **`life.finance`**: Quy mô *cá nhân, hộ gia đình*. | • *liquidity, equity, dividend* $\rightarrow$ `biz.finance`<br>• *mortgage, frugality, allowance* $\rightarrow$ `life.finance` |
| **`biz.trade`** vs **`gov.diplomacy`** | Đều liên quan đến quan hệ giữa các quốc gia và hiệp định song phương. | • **`biz.trade`**: Tập trung vào *dòng chảy hàng hóa, thuế quan và kinh tế vĩ mô*.<br>• **`gov.diplomacy`**: Tập trung vào *quan hệ chính trị, chủ quyền, an ninh và ngoại giao*. | • *tariff, trade deficit, export* $\rightarrow$ `biz.trade`<br>• *treaty, ambassador, sovereignty* $\rightarrow$ `gov.diplomacy` |
| **`health.diet`** vs **`life.food`** | Đều nhắc đến thực phẩm, bữa ăn và đồ uống. | • **`health.diet`**: Góc độ *y học, dinh dưỡng, calo, trao đổi chất*.<br>• **`life.food`**: Góc độ *ẩm thực, nấu nướng, hương vị, trải nghiệm ăn uống*. | • *metabolism, obesity, nutrients* $\rightarrow$ `health.diet`<br>• *gourmet, seasoning, cuisine* $\rightarrow$ `life.food` |
| **`tech.ai`** vs **`tech.digital`** | Đều thuộc lĩnh vực công nghệ thông tin hiện đại. | • **`tech.ai`**: Thuật toán tự học, tự động hóa thông minh, robot.<br>• **`tech.digital`**: Thiết bị phần cứng tiêu dùng, hạ tầng số thông thường. | • *neural network, algorithm* $\rightarrow$ `tech.ai`<br>• *wearable device, broadband* $\rightarrow$ `tech.digital` |
| **`tech.cyber`** vs **`soc.law`** | Đều đề cập đến hành vi vi phạm pháp luật và trừng phạt. | • **`tech.cyber`**: Tấn công trên *không gian mạng*, bảo mật dữ liệu.<br>• **`soc.law`**: Tội phạm truyền thống, quy trình *tòa án, cảnh sát, nhà tù*. | • *malware, encryption, phishing* $\rightarrow$ `tech.cyber`<br>• *verdict, litigation, felony* $\rightarrow$ `soc.law` |
| **`edu.university`** vs **`edu.research`** | Đều diễn ra trong môi trường học thuật bậc cao. | • **`edu.university`**: *Đời sống sinh viên, học phí, tổ chức đào tạo*.<br>• **`edu.research`**: *Quy trình nghiên cứu khoa học, viết luận văn, dữ liệu*. | • *tuition fee, campus, undergraduate* $\rightarrow$ `edu.university`<br>• *hypothesis, peer review, empirical* $\rightarrow$ `edu.research` |
| **`urban.planning`** vs **`urban.housing`** | Đều nói về kiến thiết không gian sống ở thành phố. | • **`urban.planning`**: Quy mô *toàn đô thị*, mật độ dân số, quy hoạch vùng.<br>• **`urban.housing`**: Quy mô *tòa nhà, bất động sản, kiến trúc nhà ở*. | • *gentrification, urban sprawl* $\rightarrow$ `urban.planning`<br>• *skyscraper, tenant, renovation* $\rightarrow$ `urban.housing` |
| **`soc.heritage`** vs **`travel.customs`** | Đều nói về phong tục, văn hóa của các vùng miền/quốc gia. | • **`soc.heritage`**: Chiều sâu *lịch sử, bảo tồn di sản, khảo cổ*.<br>• **`travel.customs`**: Trải nghiệm *giao tiếp thực tế của du khách/người nước ngoài*. | • *archaeology, folklore, ancestry* $\rightarrow$ `soc.heritage`<br>• *culture shock, etiquette, expat* $\rightarrow$ `travel.customs` |
```

```json:Cây Phân Tầng Chủ Đề Chuẩn:taxonomy/taxonomy.json
{
  "version": "1.0.0",
  "standard": "CEFR / IELTS Academic Lexical Taxonomy",
  "total_main_topics": 10,
  "total_subtopics": 41,
  "taxonomy": [
    {
      "id": "env",
      "name_en": "Environment & Nature",
      "name_vi": "Môi trường & Thiên nhiên",
      "icon": "Leaf",
      "color": "#10B981",
      "subtopics": [
        { "id": "env.climate", "name_en": "Climate Change & Emissions", "name_vi": "Biến đổi khí hậu & Khí thải" },
        { "id": "env.wildlife", "name_en": "Biodiversity & Wildlife Conservation", "name_vi": "Đa dạng sinh học & Bảo tồn hoang dã" },
        { "id": "env.pollution", "name_en": "Pollution, Waste & Recycling", "name_vi": "Ô nhiễm, Rác thải & Tái chế" },
        { "id": "env.energy", "name_en": "Renewable Energy & Natural Resources", "name_vi": "Năng lượng tái tạo & Tài nguyên thiên nhiên" },
        { "id": "env.disaster", "name_en": "Natural Disasters & Geography", "name_vi": "Thiên tai & Địa lý tự nhiên" }
      ]
    },
    {
      "id": "tech",
      "name_en": "Science & Technology",
      "name_vi": "Khoa học & Công nghệ",
      "icon": "Cpu",
      "color": "#3B82F6",
      "subtopics": [
        { "id": "tech.ai", "name_en": "Artificial Intelligence & Automation", "name_vi": "Trí tuệ nhân tạo & Tự động hóa" },
        { "id": "tech.cyber", "name_en": "Cybersecurity & Information Systems", "name_vi": "An ninh mạng & Hệ thống thông tin" },
        { "id": "tech.space", "name_en": "Space Exploration & Astronomy", "name_vi": "Thám hiểm vũ trụ & Thiên văn học" },
        { "id": "tech.bio", "name_en": "Biotechnology & Genetics", "name_vi": "Công nghệ sinh học & Di truyền học" },
        { "id": "tech.digital", "name_en": "Digital Transformation & Consumer Devices", "name_vi": "Chuyển đổi số & Thiết bị tiêu dùng" }
      ]
    },
    {
      "id": "biz",
      "name_en": "Business, Work & Economy",
      "name_vi": "Kinh doanh, Việc làm & Kinh tế",
      "icon": "Briefcase",
      "color": "#F59E0B",
      "subtopics": [
        { "id": "biz.career", "name_en": "Employment, Recruitment & Workplace", "name_vi": "Việc làm, Tuyển dụng & Môi trường công sở" },
        { "id": "biz.finance", "name_en": "Corporate Finance, Investment & Banking", "name_vi": "Tài chính doanh nghiệp, Đầu tư & Ngân hàng" },
        { "id": "biz.marketing", "name_en": "Marketing, Branding & Consumers", "name_vi": "Tiếp thị, Thương hiệu & Người tiêu dùng" },
        { "id": "biz.trade", "name_en": "International Trade & Macroeconomics", "name_vi": "Thương mại quốc tế & Kinh tế vĩ mô" },
        { "id": "biz.leadership", "name_en": "Corporate Leadership & Operations", "name_vi": "Lãnh đạo doanh nghiệp & Vận hành" }
      ]
    },
    {
      "id": "edu",
      "name_en": "Education & Academia",
      "name_vi": "Giáo dục & Học thuật",
      "icon": "GraduationCap",
      "color": "#8B5CF6",
      "subtopics": [
        { "id": "edu.university", "name_en": "Higher Education & Campus Life", "name_vi": "Giáo dục đại học & Đời sống sinh viên" },
        { "id": "edu.pedagogy", "name_en": "Teaching Methodologies & E-Learning", "name_vi": "Phương pháp giảng dạy & Học trực tuyến" },
        { "id": "edu.exams", "name_en": "Assessments, Grading & Credentials", "name_vi": "Thi cử, Đánh giá & Bằng cấp" },
        { "id": "edu.research", "name_en": "Academic Writing & Scientific Research", "name_vi": "Viết học thuật & Nghiên cứu khoa học" },
        { "id": "edu.discourse", "name_en": "Academic Discourse & Linking", "name_vi": "Ngôn ngữ lập luận & Từ nối học thuật" }
      ]
    },
    {
      "id": "health",
      "name_en": "Health, Medicine & Wellness",
      "name_vi": "Sức khỏe, Y học & Đời sống lành mạnh",
      "icon": "HeartPulse",
      "color": "#EF4444",
      "subtopics": [
        { "id": "health.diet", "name_en": "Nutrition, Diet & Physical Fitness", "name_vi": "Dinh dưỡng, Chế độ ăn & Thể chất" },
        { "id": "health.mental", "name_en": "Mental Health & Psychology", "name_vi": "Sức khỏe tinh thần & Tâm lý học" },
        { "id": "health.disease", "name_en": "Diseases, Pandemics & Pathology", "name_vi": "Bệnh lý, Dịch bệnh & Miễn dịch" },
        { "id": "health.care", "name_en": "Healthcare Systems & Pharmacology", "name_vi": "Hệ thống y tế & Dược phẩm" }
      ]
    },
    {
      "id": "soc",
      "name_en": "Society, Culture & Law",
      "name_vi": "Xã hội, Văn hóa & Pháp luật",
      "icon": "Scale",
      "color": "#EC4899",
      "subtopics": [
        { "id": "soc.equality", "name_en": "Diversity, Gender & Social Mobility", "name_vi": "Đa dạng, Bình đẳng giới & Dịch chuyển xã hội" },
        { "id": "soc.arts", "name_en": "Visual Arts, Literature & Music", "name_vi": "Nghệ thuật thị giác, Văn học & Âm nhạc" },
        { "id": "soc.heritage", "name_en": "History, Traditions & Customs", "name_vi": "Lịch sử, Truyền thống & Phong tục" },
        { "id": "soc.law", "name_en": "Crime, Law Enforcement & Justice", "name_vi": "Tội phạm, Thực thi pháp luật & Tư pháp" }
      ]
    },
    {
      "id": "urban",
      "name_en": "Urbanization & Infrastructure",
      "name_vi": "Đô thị hóa & Cơ sở hạ tầng",
      "icon": "Building2",
      "color": "#6366F1",
      "subtopics": [
        { "id": "urban.planning", "name_en": "Smart Cities & Urban Density", "name_vi": "Đô thị thông minh & Mật độ đô thị" },
        { "id": "urban.transit", "name_en": "Public Transportation & Infrastructure", "name_vi": "Giao thông công cộng & Hạ tầng" },
        { "id": "urban.housing", "name_en": "Real Estate, Architecture & Interior", "name_vi": "Bất động sản, Kiến trúc & Nội thất" }
      ]
    },
    {
      "id": "travel",
      "name_en": "Travel & Hospitality",
      "name_vi": "Du lịch & Dịch vụ lưu trú",
      "icon": "Plane",
      "color": "#06B6D4",
      "subtopics": [
        { "id": "travel.eco", "name_en": "Sightseeing & Sustainable Tourism", "name_vi": "Tham quan & Du lịch bền vững" },
        { "id": "travel.aviation", "name_en": "Aviation, Hotels & Accommodations", "name_vi": "Hàng không, Khách sạn & Lưu trú" },
        { "id": "travel.customs", "name_en": "Cultural Etiquette & Expatriate Life", "name_vi": "Nghi thức văn hóa & Cuộc sống xa xứ" }
      ]
    },
    {
      "id": "life",
      "name_en": "Daily Life & Personal Finance",
      "name_vi": "Đời sống cá nhân & Tài chính hộ gia đình",
      "icon": "Home",
      "color": "#84CC16",
      "subtopics": [
        { "id": "life.family", "name_en": "Family Dynamics, Parenting & Friendship", "name_vi": "Gia đình, Nuôi dạy con & Tình bạn" },
        { "id": "life.food", "name_en": "Culinary Arts, Cooking & Dining", "name_vi": "Ẩm thực, Nấu nướng & Ăn uống" },
        { "id": "life.finance", "name_en": "Personal Budgeting, Saving & Taxes", "name_vi": "Ngân sách cá nhân, Tiết kiệm & Thuế" },
        { "id": "life.leisure", "name_en": "Hobbies, Entertainment & Sports", "name_vi": "Sở thích, Giải trí & Thể thao" }
      ]
    },
    {
      "id": "gov",
      "name_en": "Global Politics & Humanitarian",
      "name_vi": "Chính trị toàn cầu & Nhân đạo",
      "icon": "Globe",
      "color": "#64748B",
      "subtopics": [
        { "id": "gov.diplomacy", "name_en": "Diplomacy, Treaties & Alliances", "name_vi": "Ngoại giao, Hiệp ước & Liên minh" },
        { "id": "gov.aid", "name_en": "Humanitarian Aid & Poverty Alleviation", "name_vi": "Cứu trợ nhân đạo & Xóa đói giảm nghèo" },
        { "id": "gov.globalization", "name_en": "Global Supply Chain & Geopolitics", "name_vi": "Chuỗi cung ứng toàn cầu & Địa chính trị" }
      ]
    }
  ]
}