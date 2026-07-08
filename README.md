# RecruitAI: Enterprise AI Decision Architecture & Technical Screening Platform

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.0_App_Router-black?logo=next.js&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.6" />
  <img src="https://img.shields.io/badge/Gemini_AI-2.5_Flash-4285F4?logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Turborepo-Monorepo-EF4444?logo=turborepo&logoColor=white" alt="Turborepo" />
  <img src="https://img.shields.io/badge/pnpm_Workspaces-9.12-F69220?logo=pnpm&logoColor=white" alt="pnpm" />
  <img src="https://img.shields.io/badge/Security-Lax_HTTPOnly_Session-red" alt="Security" />
</p>

RecruitAI is an enterprise-ready, AI-native screening engine designed to automate, audit, and evaluate technical interviews with contextual precision. Built on an adaptive LLM branching framework, it transforms unstructured candidate performance vectors into auditable decision intelligence.

---

## 🎯 AI Product Architecture & Governance

* **Clarity in Automation:** RecruitAI explicitly maps candidate evaluation parameters against structured organizational rubrics, moving past generic scoring to explain exactly *why* an evaluation verdict was reached.
* **Deterministic Guardrails:** Integrates rigorous timeout race conditions, exponential backoff circuits, and local semantic regex fallbacks to guarantee 100% platform uptime and prevent model execution freezes.
* **Algorithmic Adaptivity:** Features a dynamic prompt-chaining state machine that evaluates candidate responses in real-time across five semantic dimensions to programmatically steer interview progression (`PROBE_DEEPER`, `SIMPLIFY`, `PIVOT_TOPIC`).

---

## 🧭 Monorepo Structure & System Topography

Managed via Turborepo and pnpm workspaces for deterministic build caching and isolated domain separation:

```
RecruitAI Monorepo
├── apps/
│   └── web/                   # Next.js 15 App Router Frontend & API Layer
├── packages/
│   ├── ai-service/            # Prompt-chaining frameworks & Gemini API pipes
│   ├── proctoring-service/    # Client-side telemetry & integrity capture
│   ├── shared/                # Centralized TypeScript contracts & schemas
│   └── ts-config/             # Base configurations for TypeScript 5.6
```

* **`apps/web`**: Next.js 15 (App Router, React 19) core application layer, secure tokenized authentication, and interactive Monaco coding sandboxes.
* **`packages/ai-service`**: Prompt-chaining frameworks, deterministic fallback evaluation layers, and Gemini API integration pipes.
* **`packages/proctoring-service`**: Client-side telemetry capture (DOM focus tracking, audio anomaly detection, and semantic copy-paste pattern flagging).
* **`packages/shared`**: Centralized TypeScript contracts, type validation schemas, and common structural constants.

---

## 🛠️ Complete Tech Stack

| Layer | Technology |
|:---|:---|
| **Framework** | Next.js 15 (App Router, Server Components) |
| **Intelligence Layer** | Google Gemini AI API (`gemini-2.5-flash`) |
| **State & Validation** | Zod Payload Validation, Type-safe Monorepo Contracts |
| **UI & Data Viz** | Tailwind CSS, Framer Motion, Recharts Analytics Timelines |
| **Workspace Engine** | Monaco Code Workspace Editor |
| **Build Orchestration** | Turborepo, pnpm Workspaces |
| **Language** | TypeScript 5.6 (Strict Mode) |

---

## ⚡ Non-Blocking Gemini API Middleware

> [!WARNING]
> **API LIMITATIONS & NETWORK DEPENDENCIES**
> Google Gemini API is subject to rate-limiting quotas, network timeouts, and geographic availability blocks.
> To prevent application thread freezes, all Gemini interactions are wrapped by a strict timeout-retry middleware with localized regex fallbacks.

### ⚙️ Timeouts & Retries Policy
- **Maximum API Wait Time**: `6000ms`
- **Max Retry Count**: `2`
- **Backoff Algorithm**: Exponential Delay (`1000ms`, then `2000ms`)
- **Graceful Fallbacks**: If the Gemini API fails, the system immediately degrades to offline regex-based or pre-curated template processors, guaranteeing that no user action is hung.

### 🧠 Non-Blocking Fallback Matrix
- **Resume Parser**: Falls back to `apps/web/lib/fallback-resume-parser.ts` using structured regex match patterns.
- **Interviewer (Script Generation)**: Falls back to pre-defined structured interview scripts in `packages/ai-service/src/agents/interviewer.ts` matching common roles.
- **Coding Challenge**: Falls back to the pre-curated challenge bank in `packages/web/lib/challenges.ts`.

---

## 🛡️ Anti-Cheat Proctoring Engine

RecruitAI tracks interview integrity across multiple client-side sensors, compiling telemetry reports for recruiters:

1. **Tab Focus Surveillance**: Tracks page visibility (`visibilitychange`) and focus loss (`blur`) during coding or voice sessions.
2. **Face Presence Trackers**: Utilizes the webcam sensor to evaluate if the candidate is looking away or if multiple individuals are present.
3. **Clipboard Paste Blocks**: Detects copy-paste interactions inside the Monaco code editor.
4. **Calculated Deductions**:
   - **High Severity Anomaly**: `-8 points` per event.
   - **Medium Severity Anomaly**: `-3 points` per event.
   - **Formula**: `Overall_Score = Base_Score - Integrity_Penalties`

---

## 📊 Recruiter Governance & Audit Dashboard

To ensure compliance and validation of AI-generated decisions, RecruitAI exposes the underlying scoring mechanics and model parameters at `/admin/reports/[id]`.

### ⚖️ Score Matrix Breakdowns
- **Technical Depth**: Scored via primary skill keyword density and production term hits.
- **System Design**: Scored via distributed systems vocabulary (scalability, failover, replica, etc.).
- **Problem Solving**: Evaluated on structured decomp methodology and syntax validation metrics.
- **Communication**: Measures speech fluidity, STAR framework structure, and answer verbosity.

### 🔄 LLM Thought Process & Adaptive Branching Log
The dashboard displays the exact logic decisions taken by the interviewer agent:
- **`PROBE_DEEPER`**: Triggered when vocabulary is thin or latency is high.
- **`SIMPLIFY`**: Triggered when user struggles with standard terminology.
- **`PIVOT_TOPIC`**: Triggered upon completion of a rubric requirement.
- **`PROCEED`**: Standard progression.

---

## 🔑 State Management & Security Spec

- **User Authentication**: Account storage in `.data/users.json` hashed using `scryptSync`. Tokens are kept in-memory with a 14-day TTL.
- **In-Memory Store**: Active sessions, transcript logs, and proctoring telemetry are stored in a global memory map (`interview-memory-store.ts`) mapped by session ID.
- **Demo Mode Bypass**: Access the login page and click "Demo / Guest Mode" to seed a completed mock session into the memory store, enabling immediate recruiter dashboard validation.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- pnpm >= 9.x

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/RecrutAI.git
cd RecrutAI

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Run development server
pnpm dev

# Build for production (all workspaces)
pnpm build
```

---

<p align="center">
  <sub>Built with ❤️ using Next.js 15, Gemini AI, and Turborepo</sub>
</p>
