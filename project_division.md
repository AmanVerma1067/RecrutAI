# RecruitAI: Project Work Distribution

This document outlines the structured division of work for the RecruitAI project among three team members. The distribution ensures an equal workload, playing to specific domains of software engineering: **Frontend/UX**, **AI/Machine Learning**, and **Backend/Infrastructure**. 

Each member's responsibilities include the existing modules they have developed and the future features they will target.

---

## 🧑‍💻 Member 1: Frontend & Candidate Experience Lead
**Domain focus:** UI/UX Design, React/Next.js Architecture, Interactive Components, and Client-side State.

### 📌 Existing Work
*   **Next.js 15 Application Core:** Setup of the `apps/web` containing the App Router, layouts, and global styling (Tailwind CSS, Framer Motion).
*   **Interview Interfaces:** Developed the Quick Interview and Full Interview UIs with adaptive logic.
*   **Coding Workspace:** Integration of the Monaco Editor (`@monaco-editor/react`), split-pane challenge layouts, and test-case visualizers.
*   **Resume Upload Workflow:** Built the drag-and-drop PDF upload UI, handling parsing states and error boundaries.
*   **Dashboard & Reports:** Implemented aesthetic report rendering, displaying complex data like sentiment arcs, scoring charts (using Recharts), and interview transcripts.

### 🚀 Future Work
*   **Real-time Collaboration:** Implement WebSocket-based live candidate pairing for system design whiteboard interviews.
*   **Mobile App Expansion:** Develop a React Native application to allow candidates to take non-coding (voice) interviews on their phones.
*   **Accessibility (a11y) & Internationalization (i18n):** Ensure the platform is fully accessible via screen readers and structure the app for multi-language interview support.
*   **Advanced Animations:** Create more immersive pre-interview loading screens and interactive real-time visualizers for the AI speaking states.

---

## 🤖 Member 2: AI Engineering & NLP Lead
**Domain focus:** LLM Integration, Prompt Engineering, Prompt-chaining, NLP, and Core Interview Logic.

### 📌 Existing Work
*   **AI Service Package (`packages/ai-service`):** Built the core AI agents integrated with Google Gemini (`gemini-2.5-flash`).
*   **Adaptive Interviewer Engine:** Developed the dynamic question generation and branching logic based on real-time candidate answers.
*   **Resume Intelligence:** Implemented the PDF-to-JSON parsing agent to extract skills/experience, alongside regex-based fallbacks.
*   **Shadow JD & Coding Generator:** Handled the prompt engineering required to generate context-aware shadow job descriptions and customized algorithmic coding challenges.
*   **Evaluation & Sentiment Analysis:** Created the report generator that weighs candidate answers, tracks emotional arcs, and assigns a final integrity/verdict score.

### 🚀 Future Work
*   **RAG (Retrieval-Augmented Generation):** Integrate a Vector Database (like Pinecone/Weaviate) to give the AI context over a company's past codebase or specific internal documentation for hyper-personalized technical questions.
*   **Custom LLM Fine-Tuning:** Fine-tune open-source models (e.g., Llama 3) for the specialized task of candidate evaluation to reduce API dependency and costs.
*   **Advanced Voice/Speech Mode:** Integrate ultra-low latency conversational AI (e.g., utilizing OpenAI's Realtime API or specialized WebRTC wrappers) for natural voice interruption and pacing.
*   **Bias Mitigation Pipeline:** Develop a system to analyze AI evaluations for potential demographic or educational biases.

---

## ⚙️ Member 3: Backend, Infrastructure & Integrity Lead
**Domain focus:** API Development, System Architecture, Monorepo Management, and Security.

### 📌 Existing Work
*   **Monorepo Architecture:** Set up Turborepo (`turbo.json`) and pnpm workspaces to efficiently share code (`packages/shared`).
*   **Proctoring Service (`packages/proctoring-service`):** Developed browser-based integrity monitoring, including gaze tracking, tab-switching detection, and shadow assistance/anomaly detection.
*   **Next.js API Routes:** Built the 17 core REST APIs serving the Next.js frontend (auth, challenge execution, generating reports).
*   **Authentication & State:** Developed the file-based user store, `scrypt` password hashing, sliding-window rate limiters, and secure cookie session management.
*   **DevOps & Deployment:** Ensured the app is Dockerized and handles Next.js standalone builds for production deployments.

### 🚀 Future Work
*   **Database Migration:** Fully migrate the file-based/in-memory data stores to a robust relational database (PostgreSQL via Prisma or Drizzle ORM) for scalable user and session management.
*   **Remote Code Execution (RCE) Engine:** Build a secure, isolated Docker/firecracker microVM infrastructure for safely executing user-submitted code in multiple languages (Python, C++, Java, Go) instead of relying on basic API eval.
*   **Webhooks & ATS Integrations:** Build OAuth/Webhook pipelines to integrate RecruitAI directly with popular ATS platforms (Greenhouse, Lever, Workday).
*   **Advanced Cloud Infrastructure:** Implement robust caching layers using Redis for rate-limiting, queuing large report generation jobs asynchronously, and deploying on AWS/GCP with Auto-scaling.
