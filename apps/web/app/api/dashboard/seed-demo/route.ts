import { NextRequest, NextResponse } from "next/server";
import { seedCompletedInterviewSession } from "../../../../lib/interview-memory-store";
import { getUserIdFromRequest } from "../../../../lib/auth";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = seedCompletedInterviewSession(userId);
  return NextResponse.json({ success: true, interviewId: id });
}
