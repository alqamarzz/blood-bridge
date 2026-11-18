import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateResponseStatusSchema } from "@/validations/request";
import {
  acceptDonorResponse,
  ignoreDonorResponse,
  withdrawDonorResponse,
} from "@/services/response.service";

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

  const { id: responseId } = await params;

  try {
    const body = await req.json();

    if (body.action === "WITHDRAW") {
      const updated = await withdrawDonorResponse({
        responseId,
        donorUserId: session.user.id,
      });

      return NextResponse.json({
        success: true,
        data: updated,
        message: "You have withdrawn your offer to donate.",
      });
    }

    const { status } = updateResponseStatusSchema.parse(body);

    let updated;
    if (status === "ACCEPTED") {
      updated = await acceptDonorResponse({
        responseId,
        requesterUserId: session.user.id,
      });
    } else if (status === "IGNORED") {
      updated = await ignoreDonorResponse({
        responseId,
        requesterUserId: session.user.id,
      });
    }

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Donor offer marked as ${status.toLowerCase()}.`,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update response",
      },
      { status: 400 }
    );
  }
}
