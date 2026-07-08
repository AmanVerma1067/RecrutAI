import type { DifficultyLevel, CodingChallenge, ChallengeCategory, CodingLanguage } from "@recruitai/shared";
import { buildCodingChallengePrompt, getChallengeForSkill, runWithRetryAndTimeout } from "@recruitai/ai-service";
import { geminiModel } from "../../../../lib/gemini";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  topic: z.string().min(1).max(60),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium")
});

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

    const { topic, difficulty } = parsed.data;

    // Build the prompt for Gemini
    const prompt = buildCodingChallengePrompt(topic, difficulty as DifficultyLevel);

    interface RawChallengeData {
      id?: string;
      prompt?: string;
      description?: string;
      category?: ChallengeCategory;
      language?: CodingLanguage;
      starterCode?: string;
      testCases?: Array<{ input?: string; expectedOutput?: string; explanation?: string }>;
      timeLimit?: number;
      subtopic?: string;
      aiObservation?: boolean;
      evaluationCriteria?: { correctness?: number; efficiency?: number; codeQuality?: number };
    }

    // Call Gemini to generate the challenge
    let challengeData: RawChallengeData;
    try {
      challengeData = await runWithRetryAndTimeout<RawChallengeData>(
        "generateCodingChallengeAPI",
        async () => {
          const result = await geminiModel.generateContent(prompt);
          return result.response.text();
        },
        () => {
          console.log(`[Gemini API] Falling back to static challenge for topic: ${topic}`);
          return getChallengeForSkill(topic, difficulty as DifficultyLevel);
        },
        6000,
        2
      );
    } catch (err) {
      console.error("Failed to run Gemini or fallback:", err);
      challengeData = getChallengeForSkill(topic, difficulty as DifficultyLevel);
    }

    // Validate and construct the challenge object
    const challenge: CodingChallenge = {
      id: challengeData.id || `challenge-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      prompt: challengeData.prompt || "Coding Challenge",
      description: challengeData.description || "Solve this problem",
      category: challengeData.category || "algorithm",
      difficulty: difficulty as DifficultyLevel,
      language: challengeData.language || "typescript",
      starterCode: challengeData.starterCode || "export function solve(input: any): any {\n  return null;\n}",
      testCases: (challengeData.testCases || []).map((tc) => {
        const obj: { input: string; expectedOutput: string; explanation?: string } = {
          input: tc.input || "",
          expectedOutput: tc.expectedOutput || ""
        };
        if (tc.explanation !== undefined) {
          obj.explanation = tc.explanation;
        }
        return obj;
      }),
      timeLimit: challengeData.timeLimit || 900,
      subtopic: challengeData.subtopic || topic,
      aiObservation: challengeData.aiObservation ?? true,
      evaluationCriteria: {
        correctness: challengeData.evaluationCriteria?.correctness ?? 0.6,
        efficiency: challengeData.evaluationCriteria?.efficiency ?? 0.25,
        codeQuality: challengeData.evaluationCriteria?.codeQuality ?? 0.15
      }
    };

    return NextResponse.json({
      success: true,
      challenge,
      topic,
      difficulty
    });
  } catch (error) {
    console.error("Coding challenge generation error:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate coding challenge",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
