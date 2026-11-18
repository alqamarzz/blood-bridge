import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAdminUsers } from "@/services/admin.service";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Access denied. Admin role required." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const role = searchParams.get("role") || undefined;
  const suspendedParam = searchParams.get("suspended");
  const suspended = suspendedParam !== null ? suspendedParam === "true" : undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    const result = await getAdminUsers({ search, role, suspended, page, limit });
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}
