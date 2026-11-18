import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { donorResponseSchema } from "@/validations/request";
import { volunteerForRequest } from "@/services/response.service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }

  const { id: requestId } = await params;

  try {
    let message: string | undefined;
    try {
      const body = await req.json();
      const validated = donorResponseSchema.parse(body);
      message = validated.message;
    } catch {
      // Body is optional
    }

    const response = await volunteerForRequest({
      requestId,
      donorUserId: session.user.id,
      message,
    });

    return NextResponse.json(
      {
        success: true,
        data: response,
        message: "Thank you! You have successfully volunteered to donate.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to submit donation offer",
      },
      { status: 400 }
    );
  }
}
