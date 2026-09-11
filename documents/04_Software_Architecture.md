# LINGUAFLOW: Lightweight English Learning Platform

## Software Architecture Document (SAD)

_Version 1.0 - Architectural Baseline & Technical Decisions_[cite: 4]  
_Date: 09/09/2026 | Author: Lead Software Architect_[cite: 4]

---

## 1. System Architecture Overview

### 1.1 Architectural Pattern: Layered Modular Monolith

LinguaFlow implements a **Layered Modular Monolith** inside a unified full-stack codebase[cite: 4]. This eliminates microservice networking overhead while maintaining strict domain separation[cite: 4].

````text
+---------------------------------------------------------------------------------+
|                           PRESENTATION LAYER (Next.js / React)                  |
|  [Auth Module]   [Dashboard Component]   [SRS Card Viewer]   [Translation Panel]|
+---------------------------------------+-----------------------------------------+
                                        | JSON / REST / Server Actions
                                        v
+---------------------------------------------------------------------------------+
|                             APPLICATION / SERVICE LAYER                         |
|  +--------------------+  +----------------------+  +-------------------------+  |
|  |   Auth Service     |  |   SRS Engine         |  | Translation Evaluator   |  |
|  | (Bcrypt / JWT /    |  | (SuperMemo SM-2 Math |  | (String Normalizer,     |  |
|  |  Session Cookies)  |  |  Queue Scheduler)    |  |  Diff Generator)        |  |
|  +--------------------+  +----------------------+  +-------------------------+  |
+---------------------------------------+-----------------------------------------+
                                        | ORM Queries (Prisma / Drizzle)
                                        v
+---------------------------------------------------------------------------------+
|                              DATA ACCESS LAYER                                  |
|  [Users Repository]     [Cards Repository]     [SRS State & Log Repository]     |
+---------------------------------------+-----------------------------------------+
                                        | SQL Connection
                                        v
                     [ PostgreSQL (Supabase) / SQLite 3 Database ]
```[cite: 4]

### 1.2 Architectural Tactics
- **Client-Side Optimistic UI**: Card flip and queue transitions execute immediately in `< 50ms` while SM-2 interval persistence runs asynchronously[cite: 4].
- **Deterministic Evaluation Pipeline**: Text submissions pass through regex normalization before comparison against canonical JSONB arrays, executing in `< 300ms`[cite: 4].
- **Local Storage Synchronization**: Unsent ratings and review positions are mirrored to `localStorage` to guard against network dropouts[cite: 4].

---

## 2. Subsystem Modules

### 2.1 Domain Modules
1. **Authentication Module**: Manages sessions, passwords, and user context[cite: 4].
2. **Flashcard Deck Module**: CRUD operations for decks and cards; CSV/JSON import parsers[cite: 4].
3. **SRS Engine**: Encapsulates SuperMemo SM-2 calculation and queue assembly[cite: 4].
4. **Translation Evaluator**: Handles text normalization, canonical checking, and character/word diffing[cite: 4].
5. **Analytics Logger**: Records review logs, translation submissions, and calculates streaks[cite: 4].

### 2.2 Sequence Diagram: SRS Review Progression
```text
Learner UI                   Next.js API                 SRS Service            Database
    |                            |                            |                    |
    |--- 1. Grade Card (1-4) --->|                            |                    |
    |    (Optimistic UI flip)    |--- 2. Calculate Interval ->|                    |
    |                            |    (SM-2 Algorithm)        |                    |
    |                            |<-- 3. Return (Rep, EF, Int)|                    |
    |                            |----------------- 4. Update Due Date ----------->|
    |<-- 5. Ack Sync Success ----|                                                 |
```[cite: 4]

---

## 3. Technology Stack Decisions
| Layer | Chosen Technology | Rationale & Trade-off |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14+ (App Router) / React[cite: 4] | Unified TypeScript types, Server Actions, edge-ready rendering[cite: 4]. |
| **Styling** | Tailwind CSS[cite: 4] | Zero CSS bloat, utility-first design, fast 3D transforms[cite: 1, 4]. |
| **Language Runtime** | Node.js LTS (TypeScript)[cite: 4] | Full type safety across frontend, backend, and ORM[cite: 4]. |
| **Database** | PostgreSQL 15+ (via Supabase)[cite: 4, 5] | Relational joins, native JSONB storage, built-in Auth & RLS[cite: 5]. |
| **ORM** | Drizzle ORM / Prisma[cite: 4] | Type-safe migrations and automated query construction[cite: 4]. |
| **Audio Engine** | Web Speech API (`window.speechSynthesis`)[cite: 4, 5] | Browser native, zero latency, zero cloud TTS costs[cite: 4, 5]. |
| **Hosting** | Vercel (Hobby Tier)[cite: 5] | Automated continuous deployment, global CDN, zero hosting bill[cite: 5]. |

---

## 4. Architectural Trade-offs & Decisions
| Decision Area | Alternative | Chosen Solution | Justification |
| :--- | :--- | :--- | :--- |
| **Architecture** | Microservices | Modular Monolith | Avoids microservice orchestration overhead and network hops[cite: 4]. |
| **Hosting** | Dedicated VPS | Free-Tier Cloud (Vercel + Supabase) | Eliminates infrastructure costs for small cohort[cite: 4, 5]. |
| **Translation Engine** | Mandatory LLM API | Deterministic Regex Normalizer | Guarantees zero cost and `< 300ms` latency[cite: 4]. |
| **Audio** | Cloud TTS (Polly/Google) | HTML5 Web Speech API | Zero API bandwidth fees and zero key management[cite: 4, 5]. |

---

## 5. Architectural Risks & Mitigations
| Risk | Potential Impact | Architectural Mitigation |
| :--- | :--- | :--- |
| **Free-Tier Cold Starts** | Server spin-up delays[cite: 4]. | Use edge serverless functions or lightweight cron ping[cite: 4, 5]. |
| **Translation Variation Mismatch** | Valid translations marked wrong[cite: 4]. | Support JSONB array of canonical synonyms; optional LLM fallback[cite: 4, 5]. |
| **Network Drop mid-session** | Card grading lost[cite: 4]. | Optimistically persist queue in `localStorage`; background retry on reconnect[cite: 4]. |
| **Database Lock Contention** | Write locks on SQLite[cite: 4]. | Use PostgreSQL connection pooling (Supabase Supavisor)[cite: 4, 5]. |
````
