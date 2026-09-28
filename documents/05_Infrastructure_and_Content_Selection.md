# LINGUAFLOW: Lightweight English Learning Platform

## Infrastructure & Learning Content Selection Report

_Version 1.0 - Technical Decision Record & Resource Blueprint_[cite: 5]  
_Date: 09/09/2026 | Author: Technical Lead_[cite: 5]

---

## 1. Selection Principles

1. **Zero Operational Cost ($0/month)**: Operates 100% within free-tier cloud allocations[cite: 5].
2. **Zero Maintenance Overhead**: No self-managed Linux servers or manual database clustering[cite: 5].
3. **High Pedagogical Yield**: Sourced from validated academic corpuses (Academic Word List, Tatoeba)[cite: 5].
4. **Deterministic Low Latency**: Static edge delivery and client-side processing for sub-200ms interactions[cite: 5].

---

## 2. Database Evaluation & Selection

### 2.1 Comparison Matrix

| Candidate                 | Free Tier Specs                                      | Pros                                                    | Cons                                                         | Verdict                     |
| :------------------------ | :--------------------------------------------------- | :------------------------------------------------------ | :----------------------------------------------------------- | :-------------------------- |
| **Supabase (PostgreSQL)** | 500 MB DB, 50,000 MAU, built-in Auth & RLS[cite: 5]. | Native JSONB, built-in auth, web table editor[cite: 5]. | Inactivity pause after 7 days (mitigated via cron)[cite: 5]. | **SELECTED**[cite: 5]       |
| **Turso (LibSQL)**        | 9 GB DB, 500 DBs, edge replication[cite: 5].         | Microsecond cold starts, fast reads[cite: 5].           | No built-in Auth; requires NextAuth setup[cite: 5].          | Backup Alternative[cite: 5] |
| **PlanetScale**           | No free tier[cite: 5].                               | High scalability[cite: 5].                              | Violates $0 cost constraint[cite: 5].                        | Rejected[cite: 5]           |
| **Local SQLite**          | Host disk limit[cite: 5].                            | Zero external network calls[cite: 5].                   | Volume storage complicates serverless deploys[cite: 5].      | Local Dev Only[cite: 5]     |

### 2.2 Storage & Capacity Projections

- **Sizing**: 1 user state record $\approx 120\text{ bytes}$[cite: 5].
- 15 active users reviewing 3,000 cards generate $\approx 54\text{ MB}$ over 2 years ($\approx 10.8\%$ of Supabase's 500MB free tier)[cite: 5].
- **Anti-Pause Automation**: A GitHub Action runs every 5 days executing `SELECT 1;` against Supabase to keep the project active[cite: 5].

---

## 3. Learning Content & Corpus Sourcing

### 3.1 Vocabulary Strategy (SRS Flashcards)

- **The Academic Word List (AWL)**: 570 headwords across 10 sublists parsed from open academic CSVs[cite: 5].
- **Oxford 3000 / 5000**: Core CEFR B1-C1 graded lexicon[cite: 5].
- **Curated Anki TSV Ingestion**: Exported public decks (e.g., '4000 Essential English Words') converted via Python ingestion script[cite: 5].

### 3.2 Grammar Translation Corpus

| Source                              | Description                                                                                                | Focus Area                                                                     |
| :---------------------------------- | :--------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| **Tatoeba Project** (`tatoeba.org`) | Over 20,000 open-licensed English-Vietnamese paired sentences[cite: 5].                                    | Conversational collocations and authentic sentence structures[cite: 5].        |
| **Classical Pedagogical Drills**    | Curated from established grammar syllabi (e.g., Murphy's _English Grammar in Use_)[cite: 5].               | Syntactic isolation: Conditionals, Inversions, Causatives, Gerunds[cite: 5].   |
| **Targeted Batch Synthesis**        | One-time LLM batch script generating 300 topic sentences with alternative answers in JSON format[cite: 5]. | Common Vietnamese learner pitfalls (prepositions, tense consistency)[cite: 5]. |

### 3.3 Dictionary & Pronunciation Engine

- **Free Dictionary API** (`api.dictionaryapi.dev`): Open REST API used at build/import time for IPA phonetics and English definitions.
- **Web Speech Synthesis API**: Browser-native `window.speechSynthesis` provides audio pronunciation at zero latency and $0 cost.

### 3.4 External Practice Resources (Tài liệu luyện tập bổ trợ)

- **Luyện đề IELTS / Tiếng Anh**: [youpass.vn](https://youpass.vn/) | [ieltsmate.vn](https://www.ieltsmate.vn/)
- **Luyện nghe chép chính tả**: [dailydictation.com](https://dailydictation.com/)

---

## 4. Deployment Pipeline & Architecture

````text
+-------------------------+         git push          +----------------------------+
|   Developer Workstation | ------------------------> | GitHub Repository (main)   |
+-------------------------+                           +--------------+-------------+
                                                                     |
                                          Automated Webhook Trigger  v
                                                      +----------------------------+
                                                      | Vercel CI/CD Build Engine  |
                                                      | - Runs TypeScript checking |
                                                      | - Bundles Next.js artifacts|
                                                      +--------------+-------------+
                                                                     |
                                              Zero-Downtime Deploy   v
                                                      +----------------------------+
                                                      | Global Edge CDN Deployment |
                                                      | (Connected to Supabase DB) |
                                                      +----------------------------+
```[cite: 5]

---

## 5. Operational Cost Model ($0 Budget)
| Operational Component | Provider / Solution | Free Tier Allocation | Monthly Cost |
| :--- | :--- | :--- | :--- |
| **Web Compute & Edge CDN** | Vercel Hobby | 100 GB Bandwidth, Serverless Actions[cite: 5] | **$0.00**[cite: 5] |
| **Relational Database** | Supabase Free | 500 MB PostgreSQL storage, backups[cite: 5] | **$0.00**[cite: 5] |
| **Authentication** | Supabase Auth | Up to 50,000 monthly active users[cite: 5] | **$0.00**[cite: 5] |
| **Audio Pronunciation** | Web Speech API | Client-side native browser execution[cite: 5] | **$0.00**[cite: 5] |
| **Linguistic Corpuses** | AWL & Tatoeba | Public domain / Creative Commons[cite: 5] | **$0.00**[cite: 5] |
| **TOTAL RECURRING EXPENSE** | | | **$0.00 USD**[cite: 5] |

---

## 6. Implementation Milestones
- **Phase 1 (Database Provisioning)**: Set up Supabase project; run SQL migrations for `users`, `cards`, `card_srs_state`, and `translation_prompts`[cite: 5].
- **Phase 2 (Content Ingestion)**: Run Python script to seed AWL words and 300 curated Tatoeba sentence pairs into Supabase[cite: 5].
- **Phase 3 (Full-Stack Deployment)**: Connect Next.js repository on GitHub to Vercel with configured Supabase environment variables[cite: 5].
````
