# 🎓 LinguaFlow: Lightweight English Learning Platform

> **Ultra-lightweight, self-hosted, and distraction-free English learning web platform designed for small academic study cohorts.**

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-SQLite-green?logo=sqlite)](https://orm.drizzle.team/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 🌟 Overview

LinguaFlow addresses two core language pillars:
1. **Active Vocabulary Retention**: Via a mathematically scheduled **SuperMemo SM-2 Spaced Repetition System (SRS)**.
2. **Applied Grammatical Synthesis**: Through bidirectional **Vietnamese-to-English translation drills** with immediate comparative diff feedback.

LinguaFlow eliminates social bloat, paywalls, and distracting gamification, delivering an open, fast, and cost-effective learning environment with **zero operating cost ($0/month)**.

---

## ✨ Key Features

- **⚡ SuperMemo SM-2 Flashcard Engine**: Automatically schedules daily review queues based on user rating quality (`Again`, `Hard`, `Good`, `Easy`), dynamically computing Ease Factors ($EF' \ge 1.3$), repetitions, and due dates.
- **✍️ Grammar Translation Console**: Vietnamese prompts evaluated using string normalization (whitespace collapse, punctuation stripping, lowercasing), canonical answer arrays, and character/word diff feedback.
- **📊 Retention & Memory Analytics**: Live dashboard featuring active study streaks, card memory stability classification (*Learning*, *Young*, *Mature*), and past translation error logs.
- **📚 Deck & Card Management**: Organize vocabulary into custom decks with support for phonetics, parts of speech, example sentences, collocations, and bulk CSV/JSON imports.
- **⌨️ Keyboard-First Ergonomics**: Designed for high-speed review loops without touching the mouse (`Space` = flip card, `1-4` = grade recall, `Enter` = submit translation).

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Lucide Icons
- **Backend & API**: Next.js Server Components & Route Handlers
- **Database & ORM**: SQLite (`better-sqlite3`) + Drizzle ORM (Zero-config local database with auto-seeding)
- **Algorithms**: SuperMemo SM-2, Deterministic Regex Normalizer, `diff` word comparator
- **Authentication**: `bcryptjs` password hashing + JWT session HTTP-only cookies

---

## 🚀 Quick Start & How to Run

### Prerequisites
- **Node.js**: `v20.x` or later
- **npm** or **pnpm**

### Step-by-Step Instructions

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Noru-0/LINGUAFLOW.git
   cd LINGUAFLOW
   ```

2. **Navigate to the Web App Directory**
   ```bash
   cd prototype-interface
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```

5. **Open LinguaFlow in Your Browser**
   Navigate to [http://localhost:3000](http://localhost:3000).

> 💡 **Automatic Database Seeding**: On first run, LinguaFlow will automatically initialize the local SQLite database (`linguaflow.db`) and seed demo vocabulary decks (Academic Word List) and translation drills.

---

## 🔑 Demo Account Credentials

| Attribute | Value |
| :--- | :--- |
| **Email** | `alex@linguaflow.internal` |
| **Password** | `password123` |

---

## 📦 Building for Production

To build and run the optimized production bundle:

```bash
cd prototype-interface

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## 📁 Repository Structure

```
LINGUAFLOW/
├── documents/                                  # Academic & Architecture Docs
│   ├── 01_Prototype.md                         # High-fidelity prototype spec
│   ├── 02_Project_Vision_and_Scope.md          # Vision & project scope
│   ├── 03_Software_Requirements.md             # SRS specification & SM-2 math
│   ├── 04_Software_Architecture.md             # Layered modular monolith architecture
│   └── 05_Infrastructure_and_Content_Selection.md # Infrastructure & corpus report
└── prototype-interface/                        # Next.js Web Application
    ├── app/                                    # App Router pages & API routes
    │   ├── api/                                # REST API endpoints
    │   │   ├── analytics/                      # Retention curves & history
    │   │   ├── auth/                           # Login, register, session endpoints
    │   │   ├── decks/                          # Deck & card CRUD / CSV import
    │   │   ├── srs/                            # SM-2 review queue & grading
    │   │   └── translate/                      # Grammar drills & evaluation
    │   ├── globals.css                         # Core CSS design system
    │   └── page.tsx                            # Full-stack SPA dashboard
    ├── lib/                                    # Core business logic modules
    │   ├── auth/                               # Password & JWT cookie sessions
    │   ├── db/                                 # Drizzle schema, SQLite client, seed data
    │   ├── srs/                                # SuperMemo SM-2 algorithm
    │   └── translation/                        # Text normalizer & word diff evaluator
    └── package.json
```

---

## 📄 Documentation Links

- [Project Vision & Scope](documents/02_Project_Vision_and_Scope.md)
- [Software Requirements Specification (SRS)](documents/03_Software_Requirements.md)
- [Software Architecture Document (SAD)](documents/04_Software_Architecture.md)
- [Infrastructure & Content Selection Report](documents/05_Infrastructure_and_Content_Selection.md)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
