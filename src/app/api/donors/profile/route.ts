import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { donorProfileSchema } from "@/validations/donor";
import { upsertDonorProfile, getDonorProfile } from "@/services/donor.service";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const profile = await getDonorProfile(session.user.id);

  return NextResponse.json({
    success: true,
    data: profile,
  });
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
    const validated = donorProfileSchema.parse(body);

    const profile = await upsertDonorProfile(session.user.id, validated);

    return NextResponse.json(
      {
        success: true,
        data: profile,
        message: "Donor profile saved successfully.",
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err as { message?: string; errors?: unknown };
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to save donor profile",
        details: error.errors,
      },
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}
