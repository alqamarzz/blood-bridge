import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setAccountSuspension } from "@/services/admin.service";

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

  const { id: targetUserId } = await params;

  try {
    const body = await req.json();
    const { suspended, reason } = body;

    if (typeof suspended !== "boolean") {
      return NextResponse.json(
        { success: false, error: "Field 'suspended' (boolean) is required" },
        { status: 400 }
      );
    }

    const updated = await setAccountSuspension({
      targetUserId,
      adminUserId: session.user.id,
      suspended,
      reason,
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `User account has been ${suspended ? "suspended" : "reactivated"}.`,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update user status" },
      { status: 500 }
    );
  }
}
