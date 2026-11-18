import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminDashboardStats } from "@/services/admin.service";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Access denied. Admin role required." },
      { status: 403 }
    );
  }

  try {
    const stats = await getAdminDashboardStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
