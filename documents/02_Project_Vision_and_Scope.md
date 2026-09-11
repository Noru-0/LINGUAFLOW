# LINGUAFLOW: Lightweight English Learning Platform

## Project Vision and Scope

_Version 1.0 - Academic / Small-Group Deployment_[cite: 2]  
_Date: 09/09/2026 | Author: Core Developer_[cite: 2]

---

## 1. Project Vision

### 1.1 Project Vision

LinguaFlow is an ultra-lightweight, self-hosted, and distraction-free English learning web platform engineered for a small cohort of motivated learners (study group / private lab)[cite: 2]. It addresses two core language pillars[cite: 2]:

1. **Active Vocabulary Retention**: Via a mathematically scheduled Spaced Repetition System (SuperMemo SM-2)[cite: 2].
2. **Applied Grammatical Synthesis**: Through bidirectional translation drills (Vietnamese to English)[cite: 2].

LinguaFlow eliminates social bloat, paywalls, and distracting gamification, delivering an open, robust, and cost-effective learning environment[cite: 2].

### 1.2 Project Objectives

- **Long-term Retention**: Automate daily reviews with SuperMemo SM-2[cite: 2].
- **Grammar Reinforcement**: Provide context-rich Vietnamese-to-English translation with immediate diff feedback and grammar notes[cite: 2].
- **Minimalist & Distraction-Free**: Deliver a fast UI without ads or gamified bloat[cite: 2].
- **Near-Zero Operating Cost**: Architect for free-tier cloud infrastructure or low-cost self-hosting (Docker/VPS)[cite: 2].
- **Actionable Analytics**: Display retention curves, daily retention rates, and grammar accuracy trends[cite: 2].

---

## 2. Project Scope

### 2.1 Functional Scope

- **Vocabulary & SRS Flashcard Engine**: Custom decks with term, phonetic, part of speech, Vietnamese definitions, and examples[cite: 2]. Review intervals (`1, 6, I * EF` days) dynamically adapt based on user rating (`Again`, `Hard`, `Good`, `Easy`)[cite: 2].
- **Vietnamese-to-English Translation Module**: Target specific grammar rules (conditionals, inversions, tenses)[cite: 2]. Normalizes text (lowercase, whitespace collapse, punctuation stripping) and matches against canonical arrays[cite: 2].
- **Automated Grammar Feedback**: Comparative diffs highlighting errors and rendering pedagogical explanations[cite: 2].
- **User & Progress Management**: Lightweight session authentication, overdue card tracking, and daily streak calculation[cite: 2].
- **Deck & Exercise Administration**: Batch importing via structured JSON/CSV files[cite: 2].

### 2.2 Non-Functional Scope

- **Performance**: Sub-200ms page load and flashcard flip transitions[cite: 2]. Rule-based translation checks complete in `< 500ms`[cite: 2].
- **Usability**: Keyboard-first navigation (Space = flip, 1-4 = rating, Enter = submit)[cite: 2].
- **Reliability**: 99.5% uptime during daily review windows[cite: 2]; automated database backups[cite: 2].
- **Security**: Passwords hashed with bcrypt or Argon2[cite: 2]; session cookies with protection against XSS and SQL injection[cite: 2].
- **Compatibility**: Responsive on all modern browsers (Chrome, Firefox, Safari, Edge)[cite: 2].
- **Maintainability**: Clean Architecture / REST principles; containerized via Docker[cite: 2].

### 2.3 In-Scope & Out-of-Scope

- **In-Scope**: Core SRS management, SM-2 engine, VN-to-EN translation drills, regex/normalization matcher, personal analytics, and CSV/JSON imports[cite: 2].
- **Out-of-Scope (MVP)**: Payment gateways, multi-tenant billing, peer-to-peer chat, global leaderboards, speech-to-text pronunciation assessment, native iOS/Android apps[cite: 2].

### 2.4 Constraints

- **Resource Constraints**: Solo or small-team engineering[cite: 2].
- **Budget Constraints**: Zero ongoing SaaS subscription costs; 100% open-source tools[cite: 2].
- **Deployment Constraints**: Packaged as Docker container or serverless deployment on Supabase, Render, or Cloudflare[cite: 2].

---

## 3. Positioning

- **Opportunity**: Commercial apps (Duolingo, Quizlet) suffer from gamified bloat and rigid multiple-choice formats[cite: 2]. SRS tools like Anki have steep learning curves and lack native Vietnamese-to-English translation mechanics[cite: 2].
- **Product Positioning Statement**: For serious English learners in a private study cohort who require rigorous vocabulary retention and active grammar practice, LinguaFlow is a self-hosted, lightweight web application that delivers automated spaced repetition and contextual translation drills[cite: 2]. Unlike commercial apps or complex tools like Anki, LinguaFlow provides a streamlined, zero-cost web environment focused exclusively on high-yield language acquisition[cite: 2].

---

## 4. Stakeholder and User Description

### 4.1 Market Demographics

Closed cohort of 3 to 10 academic students, researchers, or test takers (IELTS/TOEFL/Academic Writing)[cite: 2].

### 4.2 Stakeholder Summary

| Stakeholder                   | Role                          | Primary Responsibility                                                    |
| :---------------------------- | :---------------------------- | :------------------------------------------------------------------------ |
| **Project Lead / Developer**  | System Architect & Maintainer | Builds system, designs schemas, maintains server and backups[cite: 2].    |
| **Study Group Admin**         | Content Curator               | Inputs high-yield vocabulary, curates prompts, verifies answers[cite: 2]. |
| **Learners / Cohort Members** | End Users                     | Conducts daily reviews, completes drills, checks grammar notes[cite: 2].  |

### 4.3 User Profiles

| User Role              | Characteristics                           | Key Responsibilities                                       | Core Benefits                                                      |
| :--------------------- | :---------------------------------------- | :--------------------------------------------------------- | :----------------------------------------------------------------- |
| **Registered Learner** | Intermediate English foundation[cite: 2]. | Daily reviews; submits translations; logs errors[cite: 2]. | Distraction-free, automated scheduling, rapid correction[cite: 2]. |
| **System Admin**       | Technical maintainer[cite: 2].            | Deploys updates; manages DB; maintains auth[cite: 2].      | Zero hosting fees, simple deployment, low maintenance[cite: 2].    |

---

## 5. Product Features

1. **Authentication & Profiles**: Secure login/logout protecting personal card schedules[cite: 2].
2. **Deck & Card Management**: CRUD operations with terms, phonetics, POS, definitions, and collocations[cite: 2].
3. **SM-2 Spaced Repetition Engine**: Computes Repetitions, Ease Factor, and Intervals[cite: 2].
4. **Sentence Translation Console**: Vietnamese prompts mapped to canonical English answers via regex normalization[cite: 2].
5. **Interactive Grammatical Explanations**: Contextual feedback and syntax rule breakdown[cite: 2].
6. **Personal Analytics Dashboard**: Cards due today, retention curves, monthly completion heatmap[cite: 2].
7. **Bulk Data Import/Export**: One-click CSV/JSON ingestion[cite: 2].

---

## 6. Precedence and Priority

- **P0 (Must-Have - MVP Critical)**: User auth, SM-2 flashcard review flow, deck management, translation console with text normalization, core relational database schema[cite: 2].
- **P1 (Should-Have - High Value)**: Single-key shortcuts, bulk CSV import, translation mistake log[cite: 2].
- **P2 (Could-Have - Nice to Have)**: Optional LLM API fallback for complex explanations, browser Web Speech API pronunciation[cite: 2].
- **P3 (Won't-Have - Out of Scope)**: Native mobile apps, gamified currency/badges, social feeds, payment systems[cite: 2].

---

## 7. Assumptions & Dependencies

- **Assumptions**: Users have self-discipline for daily reviews; cohort size `<= 20` users[cite: 2].
- **Dependencies**: Cloud compute uptime (Render/Vercel) and database availability (Supabase/SQLite)[cite: 2].

---

## 8. Cost and Pricing Model

- **Development**: $0 (Internal authoring)[cite: 2].
- **Infrastructure & Hosting**: $0 - $5/month (Deployable on free tiers of Vercel/Supabase/Render)[cite: 2].
- **Third-Party APIs**: $0 - $2/month (Optional OpenAI/DeepSeek/Gemini tokens)[cite: 2].
- **Pricing Strategy**: Non-commercial freeware for study cohort[cite: 2].
