<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Gemini_AI-Integrated-4285F4?logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Turborepo-Monorepo-EF4444?logo=turborepo&logoColor=white" alt="Turborepo" />
  <img src="https://img.shields.io/badge/pnpm-9.12-F69220?logo=pnpm&logoColor=white" alt="pnpm" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

<h1 align="center">🤖 RecruitAI</h1>

<p align="center">
  <strong>An AI-powered technical interview platform that thinks, listens, and evaluates.</strong><br/>
  Upload a resume — the AI conducts adaptive voice interviews, generates coding challenges, monitors integrity in real-time, and delivers detailed candidate-fit reports.
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Repository Structure](#-repository-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [API Reference](#-api-reference)
- [Internal Packages](#-internal-packages)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧭 Overview

**RecruitAI** is a full-stack, AI-native interview platform built as a Turborepo monorepo. It replaces generic, one-size-fits-all screening with a deeply personalized experience — every question, challenge, and evaluation is generated dynamically from the candidate's resume using Google's Gemini AI.

The platform supports three interview modes:

| Mode | Description |
|---|---|
| **Quick Interview** | Pick a topic, answer 10 AI-generated fundamental questions, get instant scoring. |
| **Full Interview** | Upload a resume → AI parses it, generates a shadow job description, conducts a 10-question adaptive voice interview, and produces a comprehensive report. |
| **Coding Interview** | Dynamic coding challenges generated per the candidate's skill set, with a Monaco-powered in-browser editor and test-case execution. |

---

## ✨ Key Features

### 🎙️ Adaptive AI Interviewer
- **Dynamic question generation** via Gemini AI — questions are tailored to the candidate's specific skills, projects, and experience.
- **Adaptive branching logic** — follow-up questions change in real-time based on answer quality (simplify, probe deeper, pivot topic, or proceed).
- **10-question structured progression** from icebreaker → technical → system design → behavioral → closing.

### 📄 Resume Intelligence
- **Gemini-powered resume parsing** — extracts candidate name, contact, skills (primary/secondary), experience, projects, education, and seniority level from raw PDF text.
- **Regex fallback** — if the API is unavailable, a comprehensive regex parser ensures graceful degradation.
- **Shadow Job Description** — the AI auto-generates a hidden JD (title, responsibilities, evaluation rubric) from the resume to drive all downstream question generation.

### 💻 Coding Challenge Engine
- **Dynamic challenge generation** using Gemini — produces fresh, original DSA problems tailored to the candidate's skill set and difficulty level.
- **Pre-curated challenge bank** — 7+ static challenges across strings, arrays, algorithms, SQL, React, Python, and system design as fallback.
- **Monaco Editor integration** — full-featured code editor with syntax highlighting, and a split-pane layout for problem description and code.
- **Test case execution** — challenges come with predefined inputs, expected outputs, and explanations.

### 🛡️ Anti-Cheat Proctoring
- **Tab switch detection** — monitors `visibilitychange` events during active interviews.
- **Gaze tracking** — detects when no face is visible or the candidate is looking away from the screen.
- **Shadow assistance detection** — anomaly detector flags suspiciously low-latency, overly polished responses that may indicate external AI assistance.
- **Severity-graded events** — each violation is tagged `low`, `medium`, or `high` and factored into the final integrity score.

### 📊 AI-Powered Reports
- **Weighted scoring** across Technical Depth, System Design, Problem Solving, and Communication.
- **Sentiment analysis** with an emotional arc — tracks confidence levels per question (`positive`, `neutral`, `anxious`, `confused`).
- **Integrity scoring** — proctoring events apply a graduated penalty to the overall score.
- **Verdict system** — `Strong Hire` → `Hire` → `Lean Hire` → `Lean No Hire` → `No Hire`.
- **Recommended resources** — personalized learning resources based on weak areas (NeetCode, ByteByteGo, CTCI, etc.).
- **Full transcript** and proctoring log included in every report.

### 🔐 Authentication
- File-based user store with `scrypt` password hashing and timing-safe comparison.
- Session tokens stored in-memory with a 14-day TTL.
- Cookie-based authentication with middleware-protected routes.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        RecruitAI Monorepo                        │
├─────────────────────┬────────────────────────────────────────────┤
│                     │                                            │
│   apps/web          │    Next.js 15 Application (App Router)     │
│   (Frontend + API)  │    ├─ Landing Page                        │
│                     │    ├─ Dashboard Layout + Sidebar           │
│                     │    ├─ Quick Interview (topic-based)        │
│                     │    ├─ Full Interview (resume-driven)       │
│                     │    ├─ Coding Interview (Monaco editor)     │
│                     │    ├─ Report Viewer (charts + transcript)  │
│                     │    ├─ Upload Workflow (PDF → parse → JD)   │
│                     │    ├─ Auth (Login / Register)              │
│                     │    └─ 17 API Routes                        │
│                     │                                            │
├─────────────────────┼────────────────────────────────────────────┤
│                     │                                            │
│   packages/         │    Internal Libraries                      │
│                     │                                            │
│   ├─ shared         │    Type definitions & constants            │
│   │                 │    (Resume, Interview, Report, Proctoring) │
│   │                 │                                            │
│   ├─ ai-service     │    AI Agents (Gemini-powered)              │
│   │                 │    ├─ Resume Parser                        │
│   │                 │    ├─ Interviewer (question builder)       │
│   │                 │    ├─ JD Generator                         │
│   │                 │    ├─ Coding Challenge Generator           │
│   │                 │    └─ Report Generator                     │
│   │                 │                                            │
│   └─ proctoring     │    Integrity Monitoring                    │
│     -service        │    ├─ Gaze Tracker                         │
│                     │    ├─ Tab Monitor                          │
│                     │    └─ Anomaly Detector                     │
│                     │                                            │
└─────────────────────┴────────────────────────────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Google Gemini AI  │
                    │  (gemini-2.5-flash) │
                    └───────────────────┘
```

---

## 📂 Repository Structure

```
RecrutAI/
├── apps/
│   └── web/                          # Next.js 15 frontend + API
│       ├── app/
│       │   ├── page.tsx              # Landing page (hero + features)
│       │   ├── layout.tsx            # Root layout (Inter font, dark theme)
│       │   ├── globals.css           # Global styles + animations
│       │   ├── login/                # Auth pages
│       │   ├── (dashboard)/          # Authenticated layout group
│       │   │   ├── layout.tsx        # Sidebar + top bar
│       │   │   ├── dashboard/        # Session history listing
│       │   │   ├── quick-interview/  # Topic-based rapid interview
│       │   │   ├── coding-interview/ # Code challenge mode
│       │   │   ├── upload/           # Resume upload workflow
│       │   │   ├── interview/[id]/   # Live interview session
│       │   │   └── report/[id]/      # Report viewer
│       │   └── api/                  # 17 API route handlers
│       │       ├── auth/             # login, register, logout, me
│       │       ├── parse-resume/     # PDF text → ParsedResume
│       │       ├── generate-jd/      # Resume → ShadowJobDescription
│       │       ├── start-interview/  # Create interview session
│       │       ├── interview/[id]/   # Get session / complete
│       │       ├── quick-interview/  # generate / evaluate
│       │       ├── coding-interview/ # challenge generation
│       │       ├── challenges/       # generate / execute
│       │       ├── report/[id]/      # Get report status
│       │       └── dashboard/        # List all reports
│       ├── components/
│       │   ├── ui/                   # Button, Card, Pill
│       │   ├── interview/            # InterviewRoom, CodingSandbox
│       │   ├── upload/               # UploadWorkflow
│       │   ├── report/               # ScoreOverview, Transcript, Sentiment
│       │   └── proctoring/           # ProctoringOverlay
│       ├── lib/
│       │   ├── auth.ts               # User store, sessions, hashing
│       │   ├── gemini.ts             # Gemini client singleton
│       │   ├── interview-memory-store.ts  # In-memory session store
│       │   └── rate-limit.ts         # Sliding-window rate limiter
│       ├── hooks/
│       │   └── use-interview-timer.ts
│       ├── middleware.ts             # Route protection
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       └── package.json
│
├── packages/
│   ├── shared/                       # @recruitai/shared
│   │   └── src/
│   │       ├── types/                # TypeScript interfaces
│   │       │   ├── resume.ts         # ParsedResume, Candidate, Skill
│   │       │   ├── interview.ts      # InterviewQuestion, InterviewState
│   │       │   ├── coding-challenge.ts  # CodingChallenge, TestCase
│   │       │   ├── job-persona.ts    # ShadowJobDescription
│   │       │   ├── report.ts         # CandidateFitReport, Verdict
│   │       │   └── proctoring.ts     # ProctoringEvent
│   │       └── constants/
│   │           └── theme.ts          # Color tokens
│   │
│   ├── ai-service/                   # @recruitai/ai-service
│   │   └── src/
│   │       ├── agents/
│   │       │   ├── resume-parser.ts         # Gemini + regex resume parsing
│   │       │   ├── interviewer.ts           # Dynamic question generation
│   │       │   ├── jd-generator.ts          # Shadow JD from resume
│   │       │   ├── coding-challenge-generator.ts  # Dynamic challenges
│   │       │   └── report-generator.ts      # Candidate fit report
│   │       ├── prompts/
│   │       │   └── templates.ts             # Prompt templates
│   │       └── utils/
│   │           └── scoring.ts               # Score normalization
│   │
│   └── proctoring-service/           # @recruitai/proctoring-service
│       └── src/
│           ├── gaze-tracker.ts       # Face & gaze detection
│           ├── tab-monitor.ts        # Tab switch events
│           └── anomaly-detector.ts   # Shadow assistance detection
│
├── turbo.json                        # Turborepo pipeline config
├── tsconfig.base.json                # Shared strict TS config
├── pnpm-workspace.yaml               # Workspace definition
├── package.json                       # Root scripts
└── .env.example                       # Environment template
```

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, React 19, Server Components) |
| **Language** | [TypeScript 5.6](https://www.typescriptlang.org/) (strict mode) |
| **AI Engine** | [Google Gemini AI](https://ai.google.dev/) (`gemini-2.5-flash` via `@google/generative-ai`) |
| **Monorepo** | [Turborepo](https://turbo.build/) + [pnpm Workspaces](https://pnpm.io/workspaces) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) with custom dark theme tokens |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Code Editor** | [Monaco Editor](https://microsoft.github.io/monaco-editor/) (`@monaco-editor/react`) |
| **Charts** | [Recharts](https://recharts.org/) |
| **PDF Parsing** | [pdf-parse](https://www.npmjs.com/package/pdf-parse) + [react-pdf](https://react-pdf.org/) |
| **Validation** | [Zod](https://zod.dev/) |
| **Auth** | Custom file-based store + scrypt hashing + cookie sessions |
| **Fonts** | [Inter](https://fonts.google.com/specimen/Inter) (via `next/font`) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.17
- **pnpm** ≥ 9.12 (`corepack enable` to activate)
- **Google Gemini API Key** — get one from [Google AI Studio](https://aistudio.google.com/apikey)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AmanVerma1067/RecrutAI.git
cd RecrutAI

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# 4. Start the development server
pnpm dev
```

The app will be available at **http://localhost:3000**.

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root with the following variables:

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Public-facing URL of the application |
| `GEMINI_API_KEY` | **Yes** | — | Google Gemini API key for AI features |
| `AI_PROVIDER` | No | `gemini` | AI provider selection |
| `GEMINI_MODEL` | No | `gemini-2.0-flash` | Default Gemini model |
| `GEMINI_INTERVIEW_MODEL` | No | `gemini-2.0-flash` | Model for interview question generation |
| `GEMINI_REPORT_MODEL` | No | `gemini-2.0-flash` | Model for report generation |
| `OPENAI_API_KEY` | No | — | Optional OpenAI fallback key |
| `OPENAI_MODEL` | No | `gpt-4o-mini` | OpenAI model for fallback |
| `VOICE_PROVIDER` | No | `browser` | Voice provider (`browser` or `openai`) |
| `OPENAI_WHISPER_MODEL` | No | `whisper-1` | Speech-to-text model |
| `OPENAI_TTS_MODEL` | No | `gpt-4o-mini-tts` | Text-to-speech model |
| `ELEVENLABS_API_KEY` | No | — | ElevenLabs voice synthesis key |

> **Note:** The platform gracefully degrades when optional keys are missing. Without `GEMINI_API_KEY`, the AI service will fall back to static/regex-based logic for resume parsing, question generation, and coding challenges.

---

## 📜 Available Scripts

All scripts are run from the **project root** using Turborepo:

| Command | Description |
|---|---|
| `pnpm dev` | Start all workspaces in development mode (parallel) |
| `pnpm build` | Build all packages and the Next.js app for production |
| `pnpm lint` | Run linters across all workspaces |
| `pnpm typecheck` | Run TypeScript type checking across all workspaces |
| `pnpm format` | Run formatters across all workspaces |

### Per-workspace scripts (run from the workspace directory):

```bash
# Web app
cd apps/web
pnpm dev          # Start Next.js dev server
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check

# Packages (ai-service, shared, proctoring-service)
cd packages/ai-service
pnpm build        # Compile TypeScript
pnpm typecheck    # Type check only
```

---

## 🌐 API Reference

All API routes are located under `apps/web/app/api/`. Every route is a Next.js Route Handler.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive session cookie |
| `POST` | `/api/auth/logout` | Destroy session |
| `GET` | `/api/auth/me` | Get current authenticated user |

### Interview Pipeline

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/parse-resume` | Parse PDF text into structured `ParsedResume` |
| `POST` | `/api/generate-jd` | Generate a shadow job description from resume |
| `POST` | `/api/start-interview` | Create an interview session (returns session ID + questions) |
| `GET` | `/api/interview/[id]` | Retrieve interview session details |
| `POST` | `/api/interview/[id]/complete` | Submit transcript + proctoring log, generate report |

### Quick Interview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/quick-interview/generate` | Generate 10 topic-based questions |
| `POST` | `/api/quick-interview/evaluate` | Score candidate answers |

### Coding Challenges

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/challenges/generate` | Generate coding challenges for a skill |
| `POST` | `/api/challenges/execute` | Execute code against test cases |
| `POST` | `/api/coding-interview/challenge` | Get a coding interview challenge |

### Reports & Dashboard

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/report/[id]` | Get report status and data |
| `GET` | `/api/dashboard/reports` | List all interview reports for current user |

---

## 📦 Internal Packages

### `@recruitai/shared`

Shared TypeScript type definitions and constants used across all workspaces.

**Key Types:**
- `ParsedResume` — candidate profile, skills, experience, projects, education
- `InterviewQuestion` — question type, prompt, difficulty, expected signals
- `InterviewState` — current question index, responses, branching state
- `CodingChallenge` — prompt, starter code, test cases, evaluation criteria
- `ShadowJobDescription` — auto-generated JD with evaluation rubric
- `CandidateFitReport` — scores, verdict, sentiment analysis, recommendations
- `ProctoringEvent` — timestamp, type, severity, details

### `@recruitai/ai-service`

Core AI logic with 5 specialized agents:

| Agent | Responsibility |
|---|---|
| **Resume Parser** | Gemini-powered resume extraction with regex fallback |
| **Interviewer** | Builds 10-question adaptive interview scripts |
| **JD Generator** | Creates shadow job descriptions from parsed resumes |
| **Coding Challenge Generator** | Dynamic DSA challenges + static challenge bank |
| **Report Generator** | Weighted scoring, sentiment analysis, verdict derivation |

All agents use a **hybrid approach**: Gemini AI is the primary engine, with comprehensive static/regex fallbacks for resilience when the API is unavailable.

### `@recruitai/proctoring-service`

Real-time integrity monitoring with three detectors:

| Detector | What It Catches |
|---|---|
| **Gaze Tracker** | Face not detected, gaze looking away from screen |
| **Tab Monitor** | Browser tab switches during active interview |
| **Anomaly Detector** | Suspiciously polished responses with low latency (AI assistance) |

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Import the repository** on [Vercel](https://vercel.com/new).
2. **Framework Preset** — Vercel auto-detects Next.js. Ensure the root directory is set to the project root (not `apps/web`).
3. **Build Settings:**
   - Build Command: `pnpm build` (Vercel + Turborepo handles this automatically)
   - Output Directory: `apps/web/.next`
4. **Environment Variables** — Add all required variables in Vercel's project settings (at minimum `GEMINI_API_KEY`).
5. **Deploy** — push to your connected Git branch.

> **Important:** Vercel will detect Turborepo automatically and only rebuild affected packages on each push.

### Docker

```dockerfile
# Build stage
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json tsconfig.base.json ./
COPY apps/ ./apps/
COPY packages/ ./packages/

RUN pnpm install --frozen-lockfile
RUN pnpm build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
```

```bash
# Build and run
docker build -t recruitai .
docker run -p 3000:3000 --env-file .env.local recruitai
```

> **Note:** For Docker standalone output, add `output: "standalone"` to `next.config.ts`.

### Self-Hosted (PM2 / systemd)

```bash
# Build the production bundle
pnpm build

# Start with Node directly
cd apps/web
NODE_ENV=production node .next/standalone/server.js

# Or with PM2
pm2 start .next/standalone/server.js --name recruitai
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create a feature branch:** `git checkout -b feature/my-feature`
3. **Make your changes** and ensure `pnpm typecheck` and `pnpm lint` pass
4. **Commit:** `git commit -m "feat: add my feature"`
5. **Push:** `git push origin feature/my-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow the existing strict TypeScript configuration (`tsconfig.base.json`)
- Use bracket notation for `process.env` access (e.g., `process.env["MY_VAR"]`)
- All AI-powered features must include a static/regex fallback
- New shared types go in `packages/shared/src/types/`
- New AI agents go in `packages/ai-service/src/agents/`

---

## 📄 License

This project is licensed under the **MIT License**.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/AmanVerma1067">Aman Verma</a>
</p>
