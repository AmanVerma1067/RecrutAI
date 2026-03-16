# RecruitAI 🤖: Autonomous AI-Driven Recruitment & Interview System

> **Note:** This repository is currently in its **Mid-Term Project Phase**. It contains the core functional architecture for an end-to-end AI interviewing platform. Future iterations will expand upon these foundations with advanced production features.

---

## 📖 Executive Summary
RecruitAI is a full-stack, AI-driven platform designed to automate the technical interview process. By bridging the gap between resume screening and live technical evaluations, the system acts as an autonomous technical recruiter and proxy interviewer. It parses resumes, generates highly contextual questions based on the candidate's specific background and the target Job Description (JD), conducts a live proctored interview, and synthesizes a comprehensive evaluation report.

This repository is structured as a **Turborepo Monorepo**, ensuring modularity, strict typing, and separation of concerns between the user interface, AI logic, and proctoring engines.

---

## 🏗️ Core Architecture & Monorepo Structure

The codebase is divided into independent, highly cohesive and decoupled packages:

### 1. `apps/web` (The Interactive Client & API Gateway)
A Next.js 15 (App Router) application serving both the candidate and recruiter experiences.
*   **Candidate Experience:** Features a "Live Interview Room" with a real-time chat interface and an integrated Monaco-based Code Editor (`coding-pad` and `coding-sandbox`).
*   **Recruiter Dashboard:** Allows for uploading resumes, starting "Quick Interviews", creating specific Job Descriptions, and viewing post-interview analytics.
*   **API Layer:** Handles webhook integrations, RESTful entry points for the AI services, mock-bypassed authentication, and basic rate limiting.

### 2. `packages/ai-service` (The Intelligence Core)
The "brain" of RecruitAI, powered by Google Gemini. This package houses self-contained AI Agents that handle specific recruitment tasks:
*   **Resume Parser (`resume-parser.ts`):** Extracts detailed skills, historical projects, and work experience from uploaded PDF resumes.
*   **JD Generator (`jd-generator.ts`):** Autonomously drafts comprehensive job descriptions to benchmark candidates against.
*   **Interviewer Persona (`interviewer.ts`):** Dynamically constructs an adaptive interview script. It progresses from basic to expert questions, specifically tailored to the candidate's reported skill set to prevent generic questioning.
*   **Coding Challenge Generator (`coding-challenge-generator.ts`):** Generates algorithmic or system-design coding problems matched to the candidate's proficiency.
*   **Report Generator (`report-generator.ts`):** Synthesizes the interview transcript into a final analytical score, noting strengths, weaknesses, and a hire/no-hire recommendation.

### 3. `packages/proctoring-service` (The Integrity Engine)
A dedicated, edge-ready library for ensuring trust and safety during remote evaluations.
*   **Gaze Tracker (`gaze-tracker.ts`):** Analyzes simple visual heuristics (e.g., face detection, looking away from the screen) to detect potential cheating.
*   **Tab Monitor (`tab-monitor.ts`):** Listens for browser visibility events, flagging when a candidate leaves the active interview window.
*   **Anomaly Detector (`anomaly-detector.ts`):** Aggregates minor infractions into high/low severity events that affect the final trust score.

### 4. `packages/shared` (The Type & Constant Repository)
Strict TypeScript definitions bridging the Next.js frontend with backend services.
*   Centralizes types for `Interview`, `CodingChallenge`, `ParsedResume`, `ProctoringEvent`, and `Report` ensuring end-to-end type safety.

---

## ✨ Key Functionalities (Current State)

### 1. Smart Automated Screening (Resume to Interview Workflow)
Recruiters upload candidate resumes directly to the platform. The `Resume Parser` reads the PDF, vectorizes the candidate's skills, and matches them against a target Job Description.

### 2. Adaptive AI Interviewing
Instead of static question banks, the AI generates questions dynamically. If a candidate lists "React" and "Node.js," the engine formulates contextual questions testing the exact intersection of those two technologies, scaling difficulty based on real-time responses.

### 3. Integrated Coding Environment
The `Coding Interview` module features a dual-pane setup:
*   **Left Pane:** AI Chat & Question renderer.
*   **Right Pane:** A live Monaco Editor where candidates write code.

### 4. Continuous Live Proctoring
An invisible layer (`proctoring-overlay.tsx`) runs during the interview. It transparently logs events (like tab switching or looking away) and timestamps them against the interview transcript.

### 5. Definitive Reporting & Analytics
Post-interview, recruiters gain access to a rich dashboard (`report/[id]`) featuring:
*   **Score Overview:** Categorized scoring (Technical, Communication, Problem Solving).
*   **Sentiment Timeline:** A chart tracking the candidate's confidence and sentiment throughout the interview.
*   **Full Transcript Panel:** A searchable log of the entire conversation intertwined with proctoring flags.

---

## 🛠️ Technology Stack Breakdown

*   **Framework:** Next.js 15 (React 19) w/ App Router for Server Components and API Routes.
*   **Monorepo Tooling:** Turborepo & pnpm for high-speed, parallel local builds and shared package resolution.
*   **Language:** Strict TypeScript.
*   **AI Model:** Google Gemini API (`@google/generative-ai`) for complex generative tasks.
*   **Styling & UI:** Tailwind CSS, Framer Motion (for fluid transitions), Recharts (for data visualization in reports).
*   **Utilities:** `pdf-parse` & `react-pdf` for document handling, `zod` for API schema validation.

---

## 🚀 Setup & Local Development

1. **Prerequisites:** Ensure you have Node.js 20+ and `pnpm` (`npm install -g pnpm`) installed.
2. **Install Dependencies:**
   ```bash
   pnpm install
   ```
3. **Configuration:**
   ```bash
   cp .env.example apps/web/.env.local
   # Ensure GEMINI_API_KEY is populated in .env.local
   ```
4. **Run the Application:**
   ```bash
   pnpm dev
   ```
   *The system is currently configured in "Test Mode" with authentication bypassed to aid in reviewer testing. The app is accessible at `http://localhost:3000`.*

---

## 🌍 Production Deployment

RecruitAI is built as a Turborepo Monorepo and is fully compatible with modern serverless and containerized deployment platforms.

### Option 1: Vercel (Recommended)
Vercel provides zero-config deployments for Next.js applications within a Turborepo.
1. Push your repository to GitHub/GitLab.
2. Import the project into Vercel.
3. Vercel will automatically detect the Turborepo and Next.js configuration.
4. Set the `GEMINI_API_KEY` environment variable in the Vercel dashboard.
5. Deploy.

### Option 2: Docker
For containerized environments (AWS ECS, Google Cloud Run, DigitalOcean), a multi-stage Dockerfile can be used to build and serve the application.
1. Ensure you have Docker installed.
2. Build the image from the workspace root:
   ```bash
   docker build -t recruitai-web -f apps/web/Dockerfile .
   ```
3. Run the container, passing in the required API keys:
   ```bash
   docker run -p 3000:3000 -e GEMINI_API_KEY=your_key_here recruitai-web
   ```

*(Note: If using Docker, ensure you create a standard Next.js `Dockerfile` in `apps/web/Dockerfile` that builds the `@recruitai/web` workspace block).*

---

## 🔮 Future Enhancements (Post Mid-Term Roadmap)

As the project scales beyond the mid-term requirements, the following features are planned:
1. **Live Code Execution & Sandboxing:** Transitioning the Monaco editor from a static text capture to an active Dockerized remote execution environment (e.g., via Judge0 or severe isolated containers) to run and validate candidate code on the fly.
2. **Voice & Video Generative Avatars:** Integrating ElevenLabs (Voice) and HeyGen/WebRTC to create a human-like avatar that listens and literally speaks to the candidate in real-time, removing the text-only chat constraint.
3. **Advanced Biometric Proctoring:** Enhancing the gaze tracker with WebRTC and OpenCV-based pose estimation to detect phones, secondary monitors, or multiple voices in the room via audio analysis.
4. **ATS Platform Integrations:** Webhooks to automatically push final candidate reports to systems like Greenhouse, Workable, or Lever.
5. **Real Database Integration:** Migrating from in-memory/JSON stores to a robust PostgreSQL database using Prisma ORM.

---

*Built with precision for scalable, unbiased hiring.*
