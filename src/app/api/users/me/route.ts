import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserById } from "@/services/auth.service";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const user = await getUserById(session.user.id);

  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: user,
  });
}
