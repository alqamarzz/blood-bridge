import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createReportSchema } from "@/validations/report";
import { createReport, getReports } from "@/services/report.service";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Access denied. Admin required." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const reason = searchParams.get("reason") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    const result = await getReports({ status, reason, page, limit });
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please log in to file a report." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const validated = createReportSchema.parse(body);

    const report = await createReport(session.user.id, validated);

    return NextResponse.json(
      {
        success: true,
        data: report,
        message: "Report submitted. Our moderation team will investigate.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err as { message?: string; errors?: unknown };
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to submit report",
        details: error.errors,
      },
      { status: 400 }
    );
  }
}
