# LINGUAFLOW: Lightweight English Learning Platform

## Prototype Specification

_Version 1.0 - Interactive High-Fidelity Design Document_[cite: 1]  
_Date: 09/09/2026 | Author: Core Developer_[cite: 1]

---

## 1. Introduction

### 1.1 Purpose

The prototype specification for the LinguaFlow web application serves as the definitive visual and interaction reference before frontend implementation[cite: 1]. It aims to[cite: 1]:

- **Validate Layout & Micro-Interactions**: Confirm flashcard flipping triggers, rating scales, translation textareas, and error diff viewers[cite: 1].
- **Standardize Keyboard-First Navigation**: Ensure complete review queues run via single-key shortcuts without mouse interaction[cite: 1].
- **Guide Frontend Implementation**: Provide wireframes, state transition requirements, and validation logic[cite: 1].
- **Facilitate Usability Testing**: Enable cohort testing with simulated local storage state prior to database integration[cite: 1].

### 1.2 Target Audience

| Target Group                  | Usage Purpose                                                                                       |
| :---------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Core Full-Stack Developer** | Translates layouts and interactions into Next.js/React components and Tailwind CSS styles[cite: 1]. |
| **Study Group Admin / Lead**  | Verifies translation input prompts, error feedback highlights, and card workflows[cite: 1].         |
| **Learners / Cohort Testers** | Tests interactive click-through flows to validate cognitive load and responsiveness[cite: 1].       |

---

## 2. Prototype Overview

### 2.1 Prototype Type

High-Fidelity Interactive Web Mockup (Single Page Application architecture)[cite: 1]. Replicates typography, responsive flex layouts, and state feedback (flip animations, rating hover states, string diff rendering)[cite: 1].

### 2.2 Scope and Objectives

| Category                | Scope & Objective Details                                                                                                           |
| :---------------------- | :---------------------------------------------------------------------------------------------------------------------------------- |
| **User Interfaces**     | Login/Register, Dashboard Overview, SRS Flashcard Reviewer, Translation Console, Deck/Card Management, History/Analytics[cite: 1].  |
| **Interactions**        | Two-sided card flipping, keyboard shortcuts (Space / 1-4 / Enter), text normalization checks, modal dialogs, error toasts[cite: 1]. |
| **Backend Integration** | Decoupled prototype relying on mock local storage state and deterministic string comparators[cite: 1].                              |
| **Scope Coverage**      | Covers 100% of P0 (Must-Have) and P1 (Should-Have) user stories[cite: 1].                                                           |
| **Primary Objective**   | Validate ergonomics, verify zero-friction daily study loops, and eliminate UI ambiguities[cite: 1].                                 |

### 2.3 Assumptions

- **Design Fidelity**: High-fidelity interactive mockup simulating SPA transitions[cite: 1].
- **Input Interaction**: Full support for physical keyboard navigation and pointer clicks/taps[cite: 1].
- **Data Layer**: Mock JSON data simulating user state, card scheduling attributes, and translation prompts[cite: 1].
- **User Persona**: Intermediate English learners using desktop keyboards or mobile virtual keyboards[cite: 1].
- **Supported Browsers**: Google Chrome, Mozilla Firefox, Microsoft Edge, Apple Safari (Webkit)[cite: 1].

---

## 3. Prototyping Tools

| Tool                                | Purpose & Utility                                                                                   |
| :---------------------------------- | :-------------------------------------------------------------------------------------------------- |
| **Figma**                           | UI/UX component design, responsive wireframing, color tokens, and interactive prototyping[cite: 1]. |
| **Git / GitHub Repository**         | Version-controlled prototype assets, issue tracking, and markdown documentation[cite: 1].           |
| **Tailwind Play / Next.js Sandbox** | Rapid prototyping of keyboard event listeners and CSS card-flip 3D transformations[cite: 1].        |

---

## 4. Navigation Structure

````text
LinguaFlow Root (SPA)
├── Public / Auth Boundary
│   ├── Login Screen (SCR-01)
│   ├── Registration Screen (SCR-02)
│   └── Password Reset Modal (SCR-03)
└── Authenticated App Shell (Navbar: Dashboard | Decks | Translate | History | Profile)
    ├── Dashboard (SCR-04)
    │   ├── Quick Start SRS Review Queue
    │   └── Quick Start Grammar Workout
    ├── Spaced Repetition Review Engine (SCR-05)
    │   ├── Front Card View (Vietnamese prompt / Phonetic hint)
    │   └── Back Card View (Revealed English term + Collocations + SM-2 Rating Buttons)
    ├── Grammar Translation Console (SCR-06)
    │   ├── Translation Input Panel (Vietnamese prompt sentence)
    │   └── Evaluation Feedback Panel (Diff view, syntactic notes, error markers)
    ├── Deck & Card Management (SCR-07)
    │   ├── Deck List & Import Modal (CSV/JSON)
    │   └── Card Editor (Create / Edit Card Form)
    └── Analytics & Submission History (SCR-08)
        ├── Retention Heatmap & Interval Distribution Chart
        └── Past Translation Log Table
```[cite: 1]

---

## 5. Screen Inventory
| Screen ID | Screen Name | Description & Purpose | Status |
| :--- | :--- | :--- | :--- |
| **SCR-01** | Sign In Screen | User authentication via email and secure password[cite: 1]. | Completed[cite: 1] |
| **SCR-02** | Sign Up Screen | New member account creation with invite code verification[cite: 1]. | Completed[cite: 1] |
| **SCR-03** | Forgot Password Modal | Password reset request via email token[cite: 1]. | Completed[cite: 1] |
| **SCR-04** | Main Dashboard | Summary hub showing cards due today, streak, and quick action launchpads[cite: 1]. | Completed[cite: 1] |
| **SCR-05** | SRS Review Session | Interactive 3D flashcard interface with SuperMemo SM-2 rating triggers[cite: 1]. | Completed[cite: 1] |
| **SCR-06** | Grammar Translation | Bilingual sentence translation workstation with diff viewer and error notes[cite: 1]. | Completed[cite: 1] |
| **SCR-07** | Deck & Card Manager | Vocabulary catalog, card creation/edit modal, and batch CSV uploader[cite: 1]. | Completed[cite: 1] |
| **SCR-08** | Analytics & History | Learning retention metrics, memory curves, and detailed translation attempt logs[cite: 1]. | Completed[cite: 1] |

---

## 6. Screen Details
| Screen ID | Screen Name | UI Components & Layout Elements | Available User Actions |
| :--- | :--- | :--- | :--- |
| **SCR-01** | Sign In | Email field, password field, 'Remember Me' checkbox, 'Sign In' primary button, 'Forgot Password?' link[cite: 1]. | Fill inputs, submit credentials, trigger reset link modal[cite: 1]. |
| **SCR-02** | Sign Up | Full name field, email field, password field, confirmation field, 'Create Account' button[cite: 1]. | Submit registration, navigate back to Sign In[cite: 1]. |
| **SCR-03** | Forgot Password | Modal overlay, email input, 'Send Recovery Link' button, close icon[cite: 1]. | Submit email for recovery link, dismiss modal[cite: 1]. |
| **SCR-04** | Dashboard | Hero banner, metric widgets (Due Today, Mastery Rate, Streak), Action buttons ('Start Review', 'Practice Grammar'), Activity Heatmap[cite: 1]. | Click 'Start Review' to begin SRS, click 'Practice Grammar', view deck stats[cite: 1]. |
| **SCR-05** | SRS Review | Progress bar (Card X of N), 3D flip card container, 'Show Answer' button, 4-tier rating bar ('Again [1]', 'Hard [2]', 'Good [3]', 'Easy [4]')[cite: 1]. | Hit Space or click to reveal answer; press keys 1-4 or click buttons to record recall score[cite: 1]. |
| **SCR-06** | Grammar Translation | Vietnamese prompt card, grammar rule tag (e.g., 'Inversion'), multi-line textarea, 'Submit Translation' button, comparative diff panel, grammar explanation box[cite: 1]. | Type English translation, hit Enter/Submit, inspect character/word diffs, click 'Next Sentence'[cite: 1]. |
| **SCR-07** | Deck Manager | Deck selector dropdown, searchable card table, 'Add Card' button, CSV/JSON file upload dropzone, inline edit/delete icons[cite: 1]. | Search cards by keyword, open edit modal, delete card, bulk import cards via CSV[cite: 1]. |
| **SCR-08** | Analytics | Retention rate line graph, memory stability distribution bar chart, past translation table with filter by correctness[cite: 1]. | Filter attempts by date/tag, expand detailed grammar explanations for past mistakes[cite: 1]. |

---

## 7. User Flows

### Flow 1: Authentication & Daily Dashboard Initialization
```text
+-----------------------------------------------------------------------------------+
|                                   LINGUAFLOW                                      |
|                                                                                   |
|                              Sign In to LinguaFlow                                |
|               Enter your credentials to access your personalized deck             |
|                                                                                   |
|   Email Address                                                                   |
|   [ learner@linguaflow.internal                                ]                  |
|                                                                                   |
|   Password                                                                        |
|   [ **************************                                 ]                  |
|                                                                                   |
|   [X] Remember session                         [ Forgot Password? ]               |
|                                                                                   |
|   +---------------------------------------------------------------------------+   |
|   |                           [ Sign In Button ]                              |   |
|   +---------------------------------------------------------------------------+   |
+-----------------------------------------------------------------------------------+
```[cite: 1]
- **Step 1 (Input)**: User provides email and password[cite: 1].
- **Step 2 (Validation)**: If invalid, renders inline toast: `"Invalid email or password. Please try again."`[cite: 1]
- **Step 3 (Landing)**: Upon success, redirects to Dashboard (`SCR-04`) displaying due metrics (e.g., "24 Vocabulary Cards Due Today")[cite: 1].

### Flow 2: Daily Spaced Repetition (SRS) Vocabulary Review Cycle
```text
+-----------------------------------------------------------------------------------+
| [Dashboard]  [Decks]  [Translate]  [Analytics]                     [User Profile] |
+-----------------------------------------------------------------------------------+
| Progress: [====================--------------------] 12 / 24 Cards               |
|                                                                                   |
| +-------------------------------------------------------------------------------+ |
| |                                                                               | |
| |  Prompt (Vietnamese):                                                         | |
| |  "Đạt được, hoàn thành một mục tiêu khó khăn"                                 | |
| |                                                                               | |
| |  Phonetic Hint: /əˈkʌm.plɪʃ/  •  Part of Speech: Verb                         | |
| |                                                                               | |
| |                 +-------------------------------------------+                 | |
| |                 |     [ Show Answer ] (Press Space)         |                 | |
| |                 +-------------------------------------------+                 | |
| +-------------------------------------------------------------------------------+ |
|                                                                                   |
|  --- After User Flips Card (Space pressed) ---                                    |
| +-------------------------------------------------------------------------------+ |
| |  Target English Word: ACCOMPLISH                                              | |
| |  Example: "She accomplished such a monumental research goal within 6 months." | |
| |  Collocations: accomplish a task, accomplish a mission                        | |
| |                                                                               | |
| |  Select Retention Quality:                                                    | |
| |  [ Again (<10m) ]     [ Hard (1d) ]     [ Good (4d) ]     [ Easy (9d) ]       | |
| |     Key: '1'             Key: '2'          Key: '3'          Key: '4'         | |
| +-------------------------------------------------------------------------------+ |
+-----------------------------------------------------------------------------------+
```[cite: 1]
- **Step 1 (Prompt)**: Front face renders Vietnamese definition, POS, and phonetic cues[cite: 1].
- **Step 2 (Recall)**: Learner attempts mental recall and presses `[Space]` or clicks 'Show Answer'[cite: 1].
- **Step 3 (Flip)**: Card executes a 3D flip animation displaying English word, collocations, and example sentence[cite: 1].
- **Step 4 (Rating)**: User presses `1` (Again), `2` (Hard), `3` (Good), or `4` (Easy)[cite: 1]. SM-2 engine calculates new interval and ease factor; next card loads in `< 50ms`[cite: 1].

### Flow 3: Vietnamese-to-English Grammar Translation Exercise
```text
+-----------------------------------------------------------------------------------+
| [Dashboard]  [Decks]  [Translate]  [Analytics]                     [User Profile] |
+-----------------------------------------------------------------------------------+
| Topic: Advanced Conditionals & Inversions                       Exercise 3 / 10   |
|                                                                                   |
| Vietnamese Prompt:                                                                |
| "Ngay khi anh ấy vừa bước vào phòng, đèn phụt tắt."                              |
|                                                                                   |
| Your English Translation:                                                         |
| +-------------------------------------------------------------------------------+ |
| | No sooner had he entered the room than the lights went out.                   | |
| +-------------------------------------------------------------------------------+ |
|                                                                                   |
|                              [ Submit Translation ]                               |
|                                                                                   |
| --- System Evaluation Result ---                                                  |
| Status: [ CORRECT / ACCEPTED ]                                                    |
| Canonical Match: "No sooner had he entered the room than the lights went out."   |
| Alternative:     "Hardly had he entered the room when the lights went out."     |
|                                                                                   |
| Grammatical Notes:                                                                |
| - Inversion structure: 'No sooner + had + S + V3/ed + than + S + V2/ed'.          |
| - Be careful not to confuse 'No sooner...than' with 'Hardly...when'.              |
|                                                                                   |
|                        [ Continue to Next Prompt (Enter) ]                        |
+-----------------------------------------------------------------------------------+
```[cite: 1]
- **Step 1 (Display)**: Renders Vietnamese sentence with grammar category tag[cite: 1].
- **Step 2 (Input & Normalization)**: User inputs sentence and submits[cite: 1]. Whitespace is normalized, punctuation stripped, and text lowercased[cite: 1].
- **Step 3 (Diff Feedback)**: Comparative diff displays correct terms (green) and discrepancies (red) alongside pedagogical grammar explanations[cite: 1].

### Flow 4: Flashcard Management & Custom Deck Creation
```text
+-----------------------------------------------------------------------------------+
| [Dashboard]  [Decks]  [Translate]  [Analytics]                     [User Profile] |
+-----------------------------------------------------------------------------------+
| Deck Management > Academic Vocabulary Deck                       [ + Add Card ]   |
|                                                                  [ Bulk Import ]  |
| Filter: [ Search word... ]   Sort: [ Due Date ▼ ]                                 |
|                                                                                   |
| Term           Phonetic       Vietnamese Meaning       Due Date     Actions       |
| --------------------------------------------------------------------------------- |
| Ambiguous      /æmˈbɪɡ.ju.əs/ Mơ hồ, không rõ ràng     Today        [Edit] [Del]  |
| Coherent       /kəʊˈhɪə.rənt/ Chặt chẽ, mạch lạc       In 3 days    [Edit] [Del]  |
| Empirical      /ɪmˈpɪr.ɪ.kəl/ Thực nghiệm              In 5 days    [Edit] [Del]  |
|                                                                                   |
| --- Modal: Add New Flashcard ---                                                  |
| Target Term:        [ Pragmatic                        ]                          |
| Phonetic:           [ /præɡˈmæt.ɪk/                    ]                          |
| Vietnamese Meaning: [ Thực tế, mang tính thực tiễn     ]                          |
| Example Sentence:   [ We need to adopt a pragmatic approach to the problem.     ] |
|                                                                                   |
|                                [ Cancel ]   [ Save Card ]                         |
+-----------------------------------------------------------------------------------+
```[cite: 1]
- **Step 1 (Inventory)**: User inspects vocabulary cards and due dates[cite: 1].
- **Step 2 (Modal Trigger)**: Clicks `+ Add Card` or `Bulk Import`[cite: 1].
- **Step 3 (Form Submission)**: Submits word metadata[cite: 1].
- **Step 4 (State Update)**: New card is persisted with initial parameters (`repetitions = 0`, `interval = 0`, `EF = 2.5`) and immediately placed in the review queue[cite: 1].

### Flow 5: Reviewing Performance Analytics & Error History
```text
+-----------------------------------------------------------------------------------+
| [Dashboard]  [Decks]  [Translate]  [Analytics]                     [User Profile] |
+-----------------------------------------------------------------------------------+
| Personal Analytics & Memory Retention                                             |
|                                                                                   |
| [ Total Cards: 240 ]     [ 30-Day Retention: 88.5% ]     [ Streak: 14 Days ]      |
|                                                                                   |
| Recent Translation Error Log:                                                     |
| Date        Prompt (VN)               Your Submission              Status         |
| --------------------------------------------------------------------------------- |
| 08/09/2026  Nếu tôi biết trước...    If I knew beforehand...      Incorrect      |
|             Error: Third conditional requires 'had known' [View Analysis]         |
| --------------------------------------------------------------------------------- |
| 07/09/2026  Cô ấy quen với việc...   She is used to wake up early Incorrect      |
|             Error: 'used to' preposition requires gerund 'waking' [View Analysis] |
+-----------------------------------------------------------------------------------+
```[cite: 1]
- **Step 1**: User navigates to 'Analytics' tab[cite: 1].
- **Step 2**: Visualizes memory retention rate, streak, and recent syntax mistakes[cite: 1].
- **Step 3**: Clicks `[View Analysis]` to review syntax rules and retry the prompt[cite: 1].

---

## 8. Limitations
| Limitation Item | Technical / Practical Reason |
| :--- | :--- |
| **Decoupled Frontend / Mock State** | Uses browser local storage and mock state for fast UX verification without live DB coupling[cite: 1]. |
| **Rule-Based Translation Matcher** | Uses string normalization and canonical answer arrays instead of dynamic LLM parsing[cite: 1]. |
| **Restricted Multi-Tenant Isolation** | Single-cohort focus without SaaS billing or organization switching[cite: 1]. |
| **Synthetic Audio Generation** | Uses HTML5 Web Speech API instead of custom high-fidelity cloud TTS[cite: 1]. |
````
