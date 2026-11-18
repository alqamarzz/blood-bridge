import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateRequestSchema } from "@/validations/request";
import { getBloodRequestById, updateBloodRequest } from "@/services/request.service";
import { MOCK_BLOOD_REQUESTS, withDbTimeout } from "@/lib/mock-data";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const fallbackItem = MOCK_BLOOD_REQUESTS.find((r) => r.id === id) || MOCK_BLOOD_REQUESTS[0];

    const request = await withDbTimeout(
      getBloodRequestById(id),
      fallbackItem as never,
      500
    );

    if (!request) {
      return NextResponse.json(
        { success: false, error: "Blood request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: request,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch blood request",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const validated = updateRequestSchema.parse(body);

    const updated = await updateBloodRequest(id, session.user.id, validated);

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Blood request updated successfully",
    });
  } catch (err: unknown) {
    const error = err as { message?: string; errors?: unknown };
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update blood request",
        details: error.errors,
      },
      { status: 400 }
    );
  }
}
