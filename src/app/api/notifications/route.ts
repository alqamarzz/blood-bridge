import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserNotifications,
  getUnreadCount,
  markAllRead,
} from "@/services/notification.service";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const unreadOnly = searchParams.get("unread") === "true";

  try {
    const [result, unreadCount] = await Promise.all([
      getUserNotifications(session.user.id, { page, limit, unreadOnly }),
      getUnreadCount(session.user.id),
    ]);

    return NextResponse.json({
      success: true,
      ...result,
      unreadCount,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch notifications",
      },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await markAllRead(session.user.id);
    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to mark notifications read",
      },
      { status: 500 }
    );
  }
}
