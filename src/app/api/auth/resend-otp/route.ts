import { NextRequest, NextResponse } from "next/server";
import { otpRequestSchema } from "@/validations/auth";
import { generateOtp } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = otpRequestSchema.parse(body);

    const otp = await generateOtp(phone);

    return NextResponse.json({
      success: true,
      message: "New OTP sent successfully.",
      devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to resend OTP",
      },
      { status: 400 }
    );
  }
}
