import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createRequestSchema } from "@/validations/request";
import { createBloodRequest, getBloodRequests } from "@/services/request.service";
import { MOCK_BLOOD_REQUESTS, withDbTimeout } from "@/lib/mock-data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || undefined;
  const bloodGroup = searchParams.get("bloodGroup") || undefined;
  const city = searchParams.get("city") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  let filtered = MOCK_BLOOD_REQUESTS;
  if (bloodGroup) filtered = filtered.filter((r) => r.bloodGroup === bloodGroup);
  if (city) filtered = filtered.filter((r) => r.city.toLowerCase() === city.toLowerCase());

  const fallback = {
    requests: filtered,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: 1,
    },
  };

  try {
    const result = await withDbTimeout(
      getBloodRequests({
        status,
        bloodGroup,
        city,
        page,
        limit,
      }),
      fallback as never,
      500
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch blood requests",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const validated = createRequestSchema.parse(body);

    const request = await createBloodRequest(session.user.id, validated);

    return NextResponse.json(
      {
        success: true,
        data: request,
        message: "Blood request created successfully.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err as { message?: string; errors?: unknown };
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create blood request",
        details: error.errors,
      },
      { status: 400 }
    );
  }
}
