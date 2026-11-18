import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { id: requestId } = await params;

  // Verify ownership of the request
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
    select: { requesterId: true },
  });

  if (!request) {
    return NextResponse.json(
      { success: false, error: "Request not found" },
      { status: 404 }
    );
  }

  if (request.requesterId !== session.user.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized to view responses for this request" },
      { status: 403 }
    );
  }

  const responses = await prisma.donorResponse.findMany({
    where: { requestId },
    include: {
      donor: {
        select: {
          id: true,
          name: true,
          phone: true,
          donorProfile: {
            select: {
              bloodGroup: true,
              city: true,
              area: true,
              lastDonationDate: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: responses,
  });
}
