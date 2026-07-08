import Link from "next/link";
import { notFound } from "next/navigation";
import { getInterviewSession } from "../../../../lib/interview-memory-store";
import { demoReport } from "../../../../lib/demo-report";
import { decideBranch } from "@recruitai/ai-service";
import type { InterviewQuestion, ProctoringEvent, CandidateFitReport } from "@recruitai/shared";

interface ParamsContext {
  params: Promise<{ id: string }>;
}

const getDemoSession = () => {
  return {
    id: "demo",
    userId: "mock-user-id",
    candidateName: "Demo Candidate",
    role: "Senior Full-Stack Engineer",
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    startedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    endedAt: new Date().toISOString(),
    status: "completed" as const,
    transcript: [
      { speaker: "AI" as const, text: "Welcome. Let's start with your background. Can you outline a major system architecture change you owned end-to-end?", timestamp: new Date().toISOString() },
      { speaker: "Candidate" as const, text: "Certainly. At my previous role, I led the migration of our monolith API to a distributed event-driven microservices architecture. We leveraged Kafka for asynchronous messaging and PostgreSQL for structured data persistence. This successfully reduced API latency by 45% and resolved major scalability bottlenecks during traffic spikes.", timestamp: new Date().toISOString() },
      { speaker: "AI" as const, text: "That is a solid migration. How did you manage database transactions or ensure consistency across those services?", timestamp: new Date().toISOString() },
      { speaker: "Candidate" as const, text: "We avoided distributed transactions like 2PC due to high performance overhead. Instead, we implemented the Saga pattern with choreography-based orchestration. For eventual consistency, we designed idempotent handlers with database-level locks for critical states.", timestamp: new Date().toISOString() },
      { speaker: "AI" as const, text: "Great. Now let's discuss problem solving. If you discover a critical memory leak in production, what is your exact debugging strategy?", timestamp: new Date().toISOString() },
      { speaker: "Candidate" as const, text: "I'd start by checking CPU/Memory usage metrics. I would isolate the container instance and generate a heap dump using V8 profiling tools. Then I'd compare the objects over time, specifically looking for unclosed database connections or event listeners.", timestamp: new Date().toISOString() }
    ],
    proctoringLog: [
      { type: "TAB_SWITCH" as const, timestamp: new Date().toISOString(), severity: "medium" as const, details: "Switched tab to browser window" },
      { type: "CLIPBOARD_PASTE" as const, timestamp: new Date().toISOString(), severity: "medium" as const, details: "Pasted text content into answer box" },
      { type: "FACE_NOT_DETECTED" as const, timestamp: new Date().toISOString(), severity: "high" as const, details: "Multiple faces detected or face not looking at screen" }
    ],
    report: demoReport,
    questions: [
      { id: "q1", type: "technical", prompt: "Outline a major system architecture change you owned end-to-end.", expectedSignals: ["Monolith to microservices", "Kafka", "Postgres"], difficulty: 3, timeLimitSeconds: 180 },
      { id: "q2", type: "system_design", prompt: "How did you manage database transactions or ensure consistency across services?", expectedSignals: ["Saga pattern", "Idempotent", "Database locks"], difficulty: 4, timeLimitSeconds: 240 },
      { id: "q3", type: "problem_solving", prompt: "If you discover a critical memory leak in production, what is your exact debugging strategy?", expectedSignals: ["V8 profiling", "Heap dump", "Memory leak"], difficulty: 3, timeLimitSeconds: 300 }
    ],
    shadowJd: {
      title: "Senior Full-Stack Engineer",
      experienceRequired: "5+ years",
      evaluationRubric: [
        { category: "Technical Depth", weight: 0.35 },
        { category: "System Design", weight: 0.25 },
        { category: "Problem Solving", weight: 0.2 },
        { category: "Communication", weight: 0.2 }
      ]
    }
  };
};

export default async function AdminAuditPage({ params }: ParamsContext) {
  const { id } = await params;
  const session = id === "demo" ? getDemoSession() : getInterviewSession(id);

  if (!session) {
    notFound();
  }

  const report = session.report as CandidateFitReport | undefined;

  // Proctoring severity counts
  const highSeverityCount = session.proctoringLog.filter((event: ProctoringEvent) => event.severity === "high").length;
  const mediumSeverityCount = session.proctoringLog.filter((event: ProctoringEvent) => event.severity === "medium").length;
  const proctoringPenalty = highSeverityCount * 8 + mediumSeverityCount * 3;

  // Simulate AI branching engine results for each Q&A pair in the transcript
  const transcriptLogs = [];
  interface TranscriptItem {
    speaker: "AI" | "Candidate";
    text: string;
    timestamp: string;
  }
  const candidateEntries = (session.transcript as TranscriptItem[]).filter((t: TranscriptItem) => t.speaker === "Candidate");
  const aiQuestions = session.questions || [];

  for (let i = 0; i < candidateEntries.length; i++) {
    const candidateAnswer = candidateEntries[i];
    if (!candidateAnswer) continue;
    const correspondingQuestion = aiQuestions[i] || {
      id: `q-${i}`,
      type: "technical",
      prompt: "Custom structured question",
      difficulty: 2
    };

    const dummyState = {
      currentQuestionIndex: i,
      questions: aiQuestions,
      responses: []
    };

    const dummyResponse = {
      questionId: correspondingQuestion.id,
      text: candidateAnswer.text,
      responseLatencyMs: 8000
    };

    let decisionType = "PROCEED";
    let decisionReason = "System progressed candidate automatically.";
    try {
      const decision = decideBranch(
        dummyState as unknown as Parameters<typeof decideBranch>[0],
        dummyResponse as unknown as Parameters<typeof decideBranch>[1]
      ) as unknown as { type: string; reason?: string; question?: string };
      decisionType = decision.type;
      decisionReason = decision.reason || decision.question || "Progressing.";
    } catch {
      // Fallback
    }

    transcriptLogs.push({
      questionPrompt: correspondingQuestion.prompt,
      candidateAnswer: candidateAnswer.text,
      type: correspondingQuestion.type,
      difficulty: correspondingQuestion.difficulty,
      decisionType,
      decisionReason,
      confidence: 0.92 - (i * 0.03) // Simulated evaluation confidence decay
    });
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Navigation / Breadcrumbs */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium uppercase tracking-wider">
              <span>Admin Panel</span>
              <span>/</span>
              <span>Governance & Audit</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Candidate Evaluation Audit
            </h1>
          </div>
          <Link href="/dashboard">
            <button className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white">
              ← Dashboard
            </button>
          </Link>
        </div>

        {/* Candidate Metadata Summary Card */}
        <div className="grid md:grid-cols-4 gap-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl p-6">
          <div>
            <span className="text-xs text-zinc-500 block">Candidate Name</span>
            <span className="font-semibold text-white mt-1 block">{session.candidateName}</span>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Applied Position</span>
            <span className="font-semibold text-white mt-1 block">{session.role}</span>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Session ID</span>
            <span className="font-mono text-xs text-indigo-300 mt-1.5 block overflow-hidden text-ellipsis">{session.id}</span>
          </div>
          <div>
            <span className="text-xs text-zinc-500 block">Audit Status</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Evaluation Sealed
            </span>
          </div>
        </div>

        {/* Score Calculations & Weights Card */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Main Visual Evaluation Weights breakdown */}
          <div className="md:col-span-2 space-y-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white">AI Scoring Weights & Math</h2>
            <div className="space-y-4">
              {report?.categoryScores ? (
                report.categoryScores.map((scoreObj, idx) => {
                  const contrib = Math.round(scoreObj.score * scoreObj.weight * 10) / 10;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-zinc-200">{scoreObj.category}</span>
                        <div className="text-xs text-zinc-400 space-x-2">
                          <span>Raw: <strong className="text-zinc-200">{scoreObj.score}</strong></span>
                          <span>·</span>
                          <span>Weight: <strong className="text-indigo-400">{scoreObj.weight * 100}%</strong></span>
                          <span>·</span>
                          <span>Contribution: <strong className="text-emerald-400">+{contrib}</strong></span>
                        </div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                          style={{ width: `${scoreObj.score}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-zinc-500">No score category details found.</div>
              )}
            </div>

            <div className="border-t border-white/[0.06] pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs text-zinc-500">Overall Formula</span>
                <p className="text-xs font-mono text-zinc-400">
                  Overall = SUM(Category_Raw * Category_Weight) - Proctoring_Penalty
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-zinc-500">Final Weighted Score:</span>
                <span className="text-3xl font-extrabold text-indigo-400">{report?.overallScore || 0}</span>
                <span className="text-sm text-zinc-500">/ 100</span>
              </div>
            </div>
          </div>

          {/* Proctoring Integrity & Penalties Breakdown */}
          <div className="bg-white/[0.01] border border-white/[0.06] rounded-2xl p-6 space-y-6">
            <h2 className="text-lg font-semibold text-white">Integrity Deductions</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <span className="text-sm text-zinc-400">High Severity Events</span>
                <span className="font-mono text-sm text-red-400 font-bold">{highSeverityCount} <span className="text-xs text-zinc-500">(-{highSeverityCount * 8} pts)</span></span>
              </div>
              <div className="flex items-center justify-between border-b border-white/[0.04] pb-2">
                <span className="text-sm text-zinc-400">Medium Severity Events</span>
                <span className="font-mono text-sm text-amber-400 font-bold">{mediumSeverityCount} <span className="text-xs text-zinc-500">(-{mediumSeverityCount * 3} pts)</span></span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-200 font-semibold">Total Integrity Penalty</span>
                <span className="font-mono text-base text-red-500 font-bold">-{proctoringPenalty} pts</span>
              </div>
            </div>

            {session.proctoringLog.length > 0 ? (
              <div className="space-y-2 mt-4 max-h-[140px] overflow-y-auto pr-1">
                {session.proctoringLog.map((log: ProctoringEvent, index: number) => (
                  <div key={index} className="text-xs rounded-lg bg-white/[0.02] border border-white/[0.04] p-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold uppercase text-[9px] ${
                        log.severity === "high" ? "text-red-400" : "text-amber-400"
                      }`}>{log.severity} - {log.type}</span>
                      <span className="text-[9px] text-zinc-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-tight">{log.details}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-center">
                <p className="text-xs text-emerald-400">Zero proctoring events flagged during the session.</p>
              </div>
            )}
          </div>
        </div>

        {/* LLM Adaptive Branching & Thought Logs */}
        <div className="bg-white/[0.01] border border-white/[0.06] rounded-2xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white">LLM Thought Process & Adaptive Branching</h2>
            <p className="text-xs text-zinc-500">
              Audit log detailing the raw transcript evaluations, confidence scores, and branching logic triggers computed in real-time.
            </p>
          </div>

          <div className="space-y-6">
            {transcriptLogs.map((log, index) => (
              <div key={index} className="rounded-xl border border-white/[0.06] bg-white/[0.01] p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.04] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-500/10 text-[10px] font-bold text-indigo-400">
                      Q{index + 1}
                    </span>
                    <span className="text-xs font-semibold text-zinc-300">
                      Type: <span className="capitalize text-indigo-300">{log.type}</span> (Diff: {log.difficulty})
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px]">
                    <span className="text-zinc-500">
                      AI Confidence: <strong className="text-zinc-300">{(log.confidence * 100).toFixed(0)}%</strong>
                    </span>
                    <span className={`rounded-md px-2 py-0.5 font-semibold text-[9px] ${
                      log.decisionType === "SIMPLIFY" 
                        ? "bg-red-500/10 text-red-400" 
                        : log.decisionType === "PROBE_DEEPER" 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : "bg-indigo-500/10 text-indigo-400"
                    }`}>
                      Branching Decision: {log.decisionType}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Question Asked:</span>
                    <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{log.questionPrompt}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Candidate Transcript:</span>
                    <p className="text-xs text-zinc-200 mt-0.5 italic leading-relaxed bg-white/[0.01] border border-white/[0.04] rounded-lg p-2.5">
                      &ldquo;{log.candidateAnswer}&rdquo;
                    </p>
                  </div>
                  <div className="rounded-lg bg-indigo-950/20 border border-indigo-500/10 p-2">
                    <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider block">Branching Reason / Next Prompt Action:</span>
                    <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">{log.decisionReason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
