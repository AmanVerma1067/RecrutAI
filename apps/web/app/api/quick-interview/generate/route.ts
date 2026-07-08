import { geminiModel } from "../../../../lib/gemini";
import { runWithRetryAndTimeout } from "@recruitai/ai-service";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  topic: z.string().min(1).max(100),
});

const getFallbackQuickQuestions = (topic: string) => {
  return [
    { id: 1, question: `What is the primary purpose of ${topic}?`, expectedAnswer: `To solve key problems in its domain.`, difficulty: "easy", subtopic: "Introduction" },
    { id: 2, question: `What are the core concepts of ${topic}?`, expectedAnswer: `Foundational pillars and structures.`, difficulty: "easy", subtopic: "Core Concepts" },
    { id: 3, question: `Can you explain the lifecycle/data flow in ${topic}?`, expectedAnswer: `How data/state moves through the system.`, difficulty: "easy", subtopic: "Data Flow" },
    { id: 4, question: `What is a common mistake beginners make in ${topic}?`, expectedAnswer: `Improper resource management or syntax errors.`, difficulty: "easy", subtopic: "Best Practices" },
    { id: 5, question: `How does ${topic} handle concurrency or state?`, expectedAnswer: `Through built-in mechanisms or third-party libraries.`, difficulty: "medium", subtopic: "Concurrency" },
    { id: 6, question: `Explain a real-world use case where you applied ${topic}.`, expectedAnswer: `Building scalable applications or optimizing workloads.`, difficulty: "medium", subtopic: "Practical Application" },
    { id: 7, question: `What are the trade-offs of using ${topic} over alternatives?`, expectedAnswer: `Performance, complexity, and ecosystem matureness.`, difficulty: "medium", subtopic: "Trade-offs" },
    { id: 8, question: `How would you optimize performance in ${topic}?`, expectedAnswer: `Profiling, caching, and database/resource indexing.`, difficulty: "hard", subtopic: "Optimization" },
    { id: 9, question: `Describe how you would debug a memory leak or crash in ${topic}.`, expectedAnswer: `Heap dumps, logs, and isolating components.`, difficulty: "hard", subtopic: "Debugging" },
    { id: 10, question: `How do you see ${topic} evolving in the next 5 years?`, expectedAnswer: `Greater integration, performance enhancements, and standardizations.`, difficulty: "hard", subtopic: "Future Trends" }
  ];
};

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { topic } = parsed.data;

    const prompt = `You are a technical interviewer. Generate exactly 10 basic fundamental one-liner questions about "${topic}".

Rules:
- Questions should test core fundamentals and concepts
- Start from very basic and gradually increase difficulty slightly
- Each question should be answerable in 1-3 sentences
- Questions should be clear, concise, and unambiguous
- Cover different aspects/subtopics of "${topic}"
- Do NOT include multiple-choice options — these are open-ended short answer questions

Return ONLY a valid JSON array of objects with this exact structure (no markdown, no code fences, no extra text):
[
  {
    "id": 1,
    "question": "What is ...?",
    "expectedAnswer": "A concise ideal answer for scoring reference",
    "difficulty": "easy|medium|hard",
    "subtopic": "specific subtopic being tested"
  }
]

Generate exactly 10 questions. Questions 1-4 should be "easy", 5-7 should be "medium", 8-10 should be "hard".`;

    interface QuickQuestion {
      id: number;
      question: string;
      expectedAnswer: string;
      difficulty: string;
      subtopic: string;
    }

    const questions = await runWithRetryAndTimeout<QuickQuestion[]>(
      "generateQuickQuestions",
      async () => {
        const result = await geminiModel.generateContent(prompt);
        return result.response.text();
      },
      () => {
        console.log(`[Gemini API] Falling back to pre-cached questions for topic: ${topic}`);
        return getFallbackQuickQuestions(topic);
      },
      6000,
      2
    );

    // Validate structure
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate valid questions" },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions, topic });
  } catch (error) {
    console.error("Question generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate questions. Please try again." },
      { status: 500 }
    );
  }
}
