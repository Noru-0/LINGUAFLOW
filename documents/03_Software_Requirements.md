# LINGUAFLOW: Lightweight English Learning Platform

## Software Requirements Specification (SRS)

_Version 1.0 - Academic / Small-Group Deployment_[cite: 3]  
_Date: 09/09/2026 | Author: Core Developer_[cite: 3]

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) establishes an unambiguous baseline for engineering implementation, validation test design, and continuous iteration of LinguaFlow[cite: 3].

### 1.2 Scope

- **Core SRS Engine**: Calculates daily queues and adapts intervals dynamically using the SuperMemo SM-2 algorithm[cite: 3].
- **Translation Practice Console**: Evaluates Vietnamese-to-English submissions using string normalization and canonical answer arrays[cite: 3].
- **Study Cohort Management**: User accounts, CSV/JSON deck import, and memory analytics[cite: 3].
- **Out of Scope**: Payment gateways, public multi-tenant signup, speech-to-text, native mobile apps[cite: 3].

### 1.3 Definitions & Abbreviations

- **SRS**: Spaced Repetition System[cite: 3].
- **SM-2**: SuperMemo 2 algorithm[cite: 3].
- **EF**: Ease Factor (default 2.5)[cite: 3].
- **RBAC**: Role-Based Access Control (Learner, Admin)[cite: 3].

---

## 2. Overall Description

### 2.1 Product Perspective & System Context

Decoupled Client-Server web architecture[cite: 3].

````text
+------------------------+            +-------------------------------------------+
|   Learner / Student    | <---UI---> |                                           |
+------------------------+            |                                           |
                                      |                 LINGUAFLOW                |
+------------------------+            |               WEB APPLICATION             |
|   Study Cohort Admin   | <---UI---> |                                           |
+------------------------+            |  - SRS Engine (SuperMemo SM-2)            |
                                      |  - Grammar Evaluation & Normalizer        |
+------------------------+            |  - Deck Management & Analytics Engine     |
|   CSV / JSON Decks     | ---Data--> |                                           |
+------------------------+            +---------------------+---------------------+
                                                            | Storage
+------------------------+                                  v
| (Optional) LLM API     | <-------------API------------ [ Database: SQLite / ]
| (DeepSeek/OpenAI)      |                               [ PostgreSQL        ]
+------------------------+
```[cite: 3]

### 2.2 Operating Environment
- **Client**: Modern browsers (Chrome >= 95, Firefox >= 90, Safari >= 13, Edge) on Desktop/Mobile[cite: 3].
- **Backend Runtime**: Node.js (>= 18 LTS) with Next.js / Express OR Python 3.11+ (FastAPI)[cite: 3].
- **Database**: PostgreSQL 15+ (Supabase Free Tier) or SQLite 3 (WAL mode enabled)[cite: 3].

### 2.3 Implementation Constraints
- 100% open-source software (MIT/Apache 2.0)[cite: 3].
- Must run within free-tier hardware limits (512MB RAM, shared vCPU)[cite: 3].
- No mandatory background message brokers (Redis/RabbitMQ) for MVP[cite: 3].

---

## 3. Functional Requirements

### 3.1 List of Main Functions
| Core Area | Functional Overview |
| :--- | :--- |
| **Authentication & Profile** | Secure registration, login session tokens, and profile management[cite: 3]. |
| **Deck Administration** | CRUD management of cards, bulk CSV importing, and deck categorization[cite: 3]. |
| **SRS Review Engine** | Daily due queue filtering and SuperMemo SM-2 interval calculations[cite: 3]. |
| **Grammar Translation** | Prompt display, text normalization, canonical validation, diff feedback[cite: 3]. |
| **Analytics & Logging** | Daily streaks, retention success rate, and historical mistake tracking[cite: 3]. |

### 3.2 Detailed Function Specifications

#### FR-01: User Authentication & Session Management
- **Workflow**: Submits credentials -> Backend hashes/validates using Argon2id or bcrypt -> Session established -> Redirect to Dashboard[cite: 3].
- **Exceptions**: Invalid credentials display alert toast; expired sessions redirect to login[cite: 3].

#### FR-02: Flashcard Management & Bulk Import
- **Workflow**: User accesses Deck Manager -> Clicks Add Card / Bulk Import -> Submits payload -> System validates required fields and writes to DB[cite: 3].
- **Validation**: Rejects rows missing target term or Vietnamese definition[cite: 3].

#### FR-03: Spaced Repetition (SM-2) Scheduling Engine
- **Filter**: Fetches cards where `due_date <= CURRENT_DATE`[cite: 3].
- **Rating Quality ($q$)**: Mapped from UI options 1-4 to SM-2 quality 0-5[cite: 1, 3]:
  - `Again [1]` $\rightarrow q = 1$
  - `Hard [2]` $\rightarrow q = 3$
  - `Good [3]` $\rightarrow q = 4$
  - `Easy [4]` $\rightarrow q = 5$
- **Mathematical Formula**[cite: 3]:
  $$EF' = EF + \left(0.1 - (5 - q) \times (0.08 + (5 - q) \times 0.02)\right)$$
  $$\text{Minimum } EF' = 1.3$$
  - If $q \ge 3$:
    - $\text{Repetition } 0: I = 1 \text{ day}$
    - $\text{Repetition } 1: I = 6 \text{ days}$
    - $\text{Repetition } n > 1: I_n = I_{n-1} \times EF'$
    - $\text{Repetitions} = \text{Repetitions} + 1$
  - If $q < 3$:
    - $\text{Repetitions} = 0$
    - $I = 1 \text{ day}$
    - $EF' = EF$
- **Acceptance Criteria**: Sets `due_date = CURRENT_TIMESTAMP + Interval (days)` in UTC[cite: 3].

#### FR-04: Grammar Translation & Text Normalization
- **Workflow**: User inputs English text -> Normalization pipeline -> Compares against acceptable reference strings -> Returns diff and notes[cite: 3].
- **Normalization Rules**:
  1. Trim leading and trailing whitespace[cite: 3].
  2. Collapse multiple internal whitespaces into single spaces[cite: 3].
  3. Strip punctuation marks (`. , ! ? ; : " ' -`)[cite: 3].
  4. Lowercase conversion[cite: 3].
- **Evaluation**: Match is `CORRECT` if normalized input matches any normalized canonical answer; otherwise `INCORRECT`[cite: 1, 3].

#### FR-05: Progress Dashboard & Error Logging
- Calculates: Active streak (consecutive study days), 30-day retention percentage, cards due today[cite: 3].
- Logs failed translation attempts with user submission, expected answer, and grammar note[cite: 3].

---

## 4. Non-Functional Requirements
| Quality Attribute | Requirement Specification |
| :--- | :--- |
| **Performance** | Flashcard flip animation `< 150ms`; translation evaluation `< 300ms`; bundle size `< 1.5MB`[cite: 3]. |
| **Security** | Passwords hashed using bcrypt (salt rounds >= 12) or Argon2id; HTTPS mandatory; SQL parameterized[cite: 3]. |
| **Scalability** | Concurrently supports 20 active users on free-tier specs without memory exhaustion[cite: 3]. |
| **Usability** | Keyboard review controls (Space = flip, 1-4 = rating, Enter = submit); mobile responsive down to 360px[cite: 3]. |
| **Reliability** | Automated database backups; zero unhandled promise rejections[cite: 3]. |
| **Maintainability** | Clean modular architecture; environment configuration managed via `.env`[cite: 3]. |

---

## 5. System Constraints & Interfaces
- **Server Limits**: 1 vCPU, 512 MB RAM, 1 GB Persistent Disk[cite: 3].
- **Pronunciation Interface**: HTML5 Web Speech Synthesis API (`window.speechSynthesis`)[cite: 3].
- **Database Interface**: Type-safe ORM (Drizzle / Prisma) connecting over TLS[cite: 3].
- **Cookie Security**: Flags `HttpOnly`, `Secure`, and `SameSite=Lax`[cite: 3].

---

## 6. Error Handling
| Error Condition | System Mitigation |
| :--- | :--- |
| **Invalid Credentials** | Inline warning: `"Invalid email or password. Please try again."` Rate limit attempts[cite: 3]. |
| **Malformed CSV Import** | Rollback transaction; display error dialog with exact row and column failure[cite: 3]. |
| **Empty Input** | Submit button disabled until textarea contains non-whitespace characters[cite: 3]. |
| **Network Drop** | Cache review state in `localStorage`; sync automatically on reconnect[cite: 3]. |
````
