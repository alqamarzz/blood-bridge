import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { findNearbyDonors } from "@/services/matching.service";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const bloodGroup = searchParams.get("bloodGroup");
  const requestId = searchParams.get("requestId");
  const city = searchParams.get("city") || "Kolkata";
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const radiusStr = searchParams.get("radius");

  if (!bloodGroup || !requestId) {
    return NextResponse.json(
      { success: false, error: "bloodGroup and requestId are required" },
      { status: 400 }
    );
  }

  try {
    const donors = await findNearbyDonors({
      bloodGroup,
      requestId,
      city,
      latitude: latStr ? parseFloat(latStr) : null,
      longitude: lngStr ? parseFloat(lngStr) : null,
      radiusKm: radiusStr ? parseInt(radiusStr, 10) : undefined,
    });

    return NextResponse.json({
      success: true,
      data: donors,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to search nearby donors",
      },
      { status: 500 }
    );
  }
}
