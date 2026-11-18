import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateReportStatus } from "@/services/report.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Access denied. Admin role required." },
      { status: 403 }
    );
  }

  const { id: reportId } = await params;

  try {
    const body = await req.json();
    const { status, adminNotes } = body;

    if (!["RESOLVED", "DISMISSED", "UNDER_REVIEW"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" },
        { status: 400 }
      );
    }

    const updated = await updateReportStatus({
      reportId,
      adminUserId: session.user.id,
      status,
      adminNotes,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Report status updated to ${status}.`,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update report" },
      { status: 500 }
    );
  }
}
