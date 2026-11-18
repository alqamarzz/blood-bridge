import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBloodRequests } from "@/services/request.service";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Access denied. Admin role required." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const bloodGroup = searchParams.get("bloodGroup") || undefined;
  const city = searchParams.get("city") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    const result = await getBloodRequests({ status, bloodGroup, city, page, limit });
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
