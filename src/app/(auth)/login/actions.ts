"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";

export async function loginWithCredentials(identifier: string, password: string) {
  try {
    const isEmail = identifier.includes("@");
    const isAdmin = identifier.toLowerCase().includes("admin");
    const redirectTo = isAdmin ? "/admin" : "/dashboard/requests";

    await signIn("credentials", {
      identifier: identifier.trim(),
      password: password.trim(),
      redirectTo,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email/phone number or password." };
        default:
          return { error: "Authentication failed. Please check your credentials." };
      }
    }
    // Re-throw redirect errors so Next.js can navigate to the destination
    throw error;
  }
}
