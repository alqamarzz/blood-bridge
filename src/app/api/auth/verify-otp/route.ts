import { NextRequest, NextResponse } from "next/server";
import { otpSchema } from "@/validations/auth";
import { verifyOtp } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, otp } = otpSchema.parse(body);

    await verifyOtp(phone, otp);

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully.",
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      {
        success: false,
        error: err.message || "OTP verification failed",
      },
      { status: 400 }
    );
  }
}
