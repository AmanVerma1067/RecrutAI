import { NextRequest, NextResponse } from "next/server";
import { listDashboardReportItems } from "../../../../lib/interview-memory-store";
import { getUserIdFromRequest } from "../../../../lib/auth";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const userId = getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ items: listDashboardReportItems(userId) });
}
