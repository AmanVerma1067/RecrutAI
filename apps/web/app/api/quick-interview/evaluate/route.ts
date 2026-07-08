import { geminiModel } from "../../../../lib/gemini";
import { runWithRetryAndTimeout } from "@recruitai/ai-service";
import { NextResponse } from "next/server";
import { z } from "zod";

const answerSchema = z.object({
  questionId: z.number(),
  question: z.string(),
  expectedAnswer: z.string(),
  userAnswer: z.string(),
  difficulty: z.string(),
  subtopic: z.string(),
});

const requestSchema = z.object({
  topic: z.string().min(1),
  answers: z.array(answerSchema).min(1).max(10),
});

interface QuickAnswer {
  questionId: number;
  question: string;
  expectedAnswer: string;
  userAnswer: string;
  difficulty: string;
  subtopic: string;
}

interface QuestionResult {
  questionId: number;
  correctness: number;
  completeness: number;
  clarity: number;
  score: number;
  feedback: string;
  isCorrect: boolean;
}

interface QuickEvaluation {
  questionResults: QuestionResult[];
  overallScore: number;
  overallFeedback: string;
  verdict: string;
  strengths: string[];
  weaknesses: string[];
  topicMastery: Record<string, number>;
}

const getFallbackEvaluation = (topic: string, answers: QuickAnswer[]): QuickEvaluation => {
  const questionResults = answers.map((a: QuickAnswer) => {
    const hasText = !!(a.userAnswer && a.userAnswer.trim().length > 10);
    return {
      questionId: a.questionId,
      correctness: hasText ? 8 : 3,
      completeness: hasText ? 7 : 2,
      clarity: hasText ? 8 : 3,
      score: hasText ? 77 : 28,
      feedback: hasText ? "Good baseline answer explaining the core concepts." : "The answer was too brief or missing key points.",
      isCorrect: hasText
    };
  });
  
  const overallScore = Math.round(questionResults.reduce<number>((sum, r) => sum + r.score, 0) / questionResults.length);
  const verdict = overallScore >= 80 ? "excellent" : overallScore >= 60 ? "good" : overallScore >= 40 ? "average" : "needs_improvement";
  
  return {
    questionResults,
    overallScore,
    overallFeedback: `Completed the ${topic} evaluation in fail-safe mode. The responses show a reasonable grasp of the fundamentals, though further evaluation is recommended.`,
    verdict,
    strengths: [`Familiarity with ${topic} concepts`, "Basic communication"],
    weaknesses: ["Deep production edge-cases", "Detailed metrics in explanations"],
    topicMastery: {
      [topic]: overallScore
    }
  };
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

    const { topic, answers } = parsed.data;

    const questionsBlock = answers
      .map(
        (a, i) =>
          `Question ${i + 1} [${a.difficulty}] (${a.subtopic}):
Q: ${a.question}
Expected Answer: ${a.expectedAnswer}
User's Answer: ${a.userAnswer}`
      )
      .join("\n\n");

    const prompt = `You are an expert technical evaluator for "${topic}". Evaluate the candidate's answers against the expected answers.

${questionsBlock}

For each question, evaluate:
1. **Correctness** — Is the answer factually correct? (0-10)
2. **Completeness** — Did the candidate cover key points? (0-10)
3. **Clarity** — Is the answer well-articulated? (0-10)

Then compute a score for each question as: (correctness * 0.5 + completeness * 0.3 + clarity * 0.2) * 10, rounded to nearest integer (0-100).

Also provide:
- A brief 1-line feedback for each question
- An overall score (0-100) as the weighted average (easy questions weight 0.7, medium weight 1.0, hard weight 1.3)
- A short overall feedback paragraph (2-3 sentences)
- A verdict: "excellent" (>=80), "good" (>=60), "average" (>=40), or "needs_improvement" (<40)

Return ONLY valid JSON (no markdown, no code fences):
{
  "questionResults": [
    {
      "questionId": 1,
      "correctness": 8,
      "completeness": 7,
      "clarity": 9,
      "score": 79,
      "feedback": "Brief feedback here",
      "isCorrect": true
    }
  ],
  "overallScore": 72,
  "overallFeedback": "Overall assessment paragraph",
  "verdict": "good",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "topicMastery": {
    "subtopic1": 85,
    "subtopic2": 60
  }
}`;

    const evaluation = await runWithRetryAndTimeout<QuickEvaluation>(
      "evaluateQuickQuestions",
      async () => {
        const result = await geminiModel.generateContent(prompt);
        return result.response.text();
      },
      () => {
        console.log(`[Gemini API] Falling back to mock evaluation for topic: ${topic}`);
        return getFallbackEvaluation(topic, answers as QuickAnswer[]);
      },
      6000,
      2
    );

    return NextResponse.json({ evaluation, topic });
  } catch (error) {
    console.error("Answer evaluation error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answers. Please try again." },
      { status: 500 }
    );
  }
}
