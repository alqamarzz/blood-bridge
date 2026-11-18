import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/validations/auth";
import { registerUser, generateOtp } from "@/services/auth.service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    const user = await registerUser(validatedData);

    // Generate initial OTP for verification
    const otp = await generateOtp(user.phone);

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
          otpSent: true,
          // In development mode, provide OTP in response for easy testing
          devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
        },
        message: "Registration successful. Please verify your phone number.",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as { message?: string; errors?: unknown };
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to register user",
        details: err.errors,
      },
      { status: 400 }
    );
  }
}
