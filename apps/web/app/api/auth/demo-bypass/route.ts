import { NextRequest, NextResponse } from "next/server";
import { registerUser, loginUser, createSessionToken, getSessionCookieName } from "../../../../lib/auth";
import { seedCompletedInterviewSession } from "../../../../lib/interview-memory-store";

export async function POST(request: NextRequest): Promise<NextResponse> {
  let user = null;
  const email = "guest@recruitai.com";
  const password = "guestpassword123";
  const name = "Guest Recruiter";

  try {
    user = await loginUser(email, password);
    if (!user) {
      user = await registerUser(name, email, password);
    }
  } catch (err) {
    // If user already exists but login failed or registration threw, try to fetch/login again
    try {
      user = await loginUser(email, password);
    } catch {
      // Ignored
    }
  }

  if (!user) {
    return NextResponse.json({ error: "Failed to authenticate guest session" }, { status: 500 });
  }

  // Seed completed mock interview session
  const interviewId = seedCompletedInterviewSession(user.id);

  // Set the session cookie
  const token = createSessionToken(user.id);
  const response = NextResponse.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email },
    interviewId
  });

  response.cookies.set(getSessionCookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });

  return response;
}
