import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateRequestStatusSchema } from "@/validations/request";
import { updateRequestStatus } from "@/services/request.service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { status } = updateRequestStatusSchema.parse(body);

    const updated = await updateRequestStatus(id, session.user.id, status);

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Request status updated to ${status}`,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update request status",
      },
      { status: 400 }
    );
  }
}
