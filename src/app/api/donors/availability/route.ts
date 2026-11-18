import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { donorAvailabilitySchema } from "@/validations/donor";
import { setDonorAvailability } from "@/services/donor.service";

export async function PATCH(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { isAvailable } = donorAvailabilitySchema.parse(body);

    const updated = await setDonorAvailability(session.user.id, isAvailable);

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Donor availability updated to ${isAvailable ? "available" : "unavailable"}`,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to update availability",
      },
      { status: 400 }
    );
  }
}
