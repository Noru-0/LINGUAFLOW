# 🎓 LinguaFlow: Lightweight English Learning Platform

> **Ultra-lightweight, self-hosted, and distraction-free English learning web platform designed for small academic study cohorts.**

[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-emerald?logo=supabase)](https://supabase.com/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-PostgreSQL_%2F_SQLite-green)](https://orm.drizzle.team/)
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
- **🗂️ Automated Topic Taxonomy & Resilient Clustering Engine (v1.4.2)**: Automatic categorization of vocabulary cards into 10 Major & 50+ Common Subtopics with hierarchical taxonomy, seamless Light / Dark / Pink theme harmonization, direct transition to full Review view with topic filtering, custom styled horizontal scrollbars for Decks & Themes, dual database resilience with Supabase auto-provisioning & SQLite fallback, and high-speed batch classification.
- **🔗 Collocation Matcher & Auto-Enrichment (v1.3.0)**: Dual-column matching game, 500+ Cambridge collocations library, and AI spreadsheet auto-enrichment generating 3-4 diverse example sentences across Academic, Business, and Daily contexts.
- **✍️ Grammar Translation Console & Persistent Drills**: Vietnamese prompts evaluated via normalization, canonical answers, and character/word diff feedback; featuring persistent cross-session progress tracking, auto-advancing to uncompleted drills, and celebration review screens.
- **📊 Retention & Memory Analytics**: Live dashboard featuring active study streaks, card memory stability classification (*Learning*, *Young*, *Mature*), and past translation error logs.
- **📚 Deck & Card Management**: Organize vocabulary into custom decks with support for phonetics, parts of speech, example sentences, collocations, bulk CSV/JSON imports, and responsive multiline wrapping.
- **⌨️ Keyboard-First Ergonomics**: Designed for high-speed review loops without touching the mouse (`Space` = flip card, `1-4` = grade recall, `Enter` = submit translation, and hyphen-skipping fill-in-the-blank drills).

---

## ⚡ Supabase Database Setup Guide

LinguaFlow natively integrates with **Supabase (PostgreSQL)** for production cloud deployments.

### 1. Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account & new project.
2. Under **Project Settings > Database**, copy your PostgreSQL Connection String URI (Transaction Pooler).

### 2. Run Database Schema Migration
Copy the SQL script in [`prototype-interface/lib/db/supabase_schema.sql`](file:///d:/5/EN_web/prototype-interface/lib/db/supabase_schema.sql) and paste it into your **Supabase SQL Editor**, then click **Run**. This will create the required tables (`users`, `decks`, `cards`, `card_srs_states`, `review_logs`, `translation_prompts`, `translation_logs`, `user_streaks`) and RLS policies.

### 3. Set Environment Variables
Create a `.env.local` file in `prototype-interface/`:

```env
# Supabase Database URI
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres

# Supabase API Credentials
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

JWT_SECRET=linguaflow-secret-jwt-key-study-group-2026
```

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

> 💡 **Local Development Fallback**: If `DATABASE_URL` is omitted, LinguaFlow automatically falls back to an embedded local SQLite database (`linguaflow.db`) with zero manual setup required.

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

## 📄 Documentation Links

- [Project Vision & Scope](documents/02_Project_Vision_and_Scope.md)
- [Software Requirements Specification (SRS)](documents/03_Software_Requirements.md)
- [Software Architecture Document (SAD)](documents/04_Software_Architecture.md)
- [Infrastructure & Content Selection Report](documents/05_Infrastructure_and_Content_Selection.md)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
