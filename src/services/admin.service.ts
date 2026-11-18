import prisma from "@/lib/prisma";

/**
 * Get aggregated platform statistics for Admin dashboard
 */
export async function getAdminDashboardStats() {
  const [
    totalUsers,
    totalDonors,
    activeRequests,
    fulfilledRequests,
    cancelledRequests,
    pendingReports,
    recentResponses,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.donorProfile.count(),
    prisma.bloodRequest.count({
      where: { status: { in: ["OPEN", "PARTIALLY_FILLED"] } },
    }),
    prisma.bloodRequest.count({
      where: { status: "FULFILLED" },
    }),
    prisma.bloodRequest.count({
      where: { status: "CANCELLED" },
    }),
    prisma.report.count({
      where: { status: "PENDING" },
    }),
    prisma.donorResponse.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // last 7 days
        },
      },
    }),
  ]);

  return {
    totalUsers,
    totalDonors,
    activeRequests,
    fulfilledRequests,
    cancelledRequests,
    pendingReports,
    recentResponses,
  };
}

/**
 * Admin list all users with pagination & search
 */
export async function getAdminUsers(params: {
  search?: string;
  role?: string;
  suspended?: boolean;
  page?: number;
  limit?: number;
}) {
  const { search, role, suspended, page = 1, limit = 20 } = params;

  const where: Record<string, unknown> = {};
  if (role) where.role = role;
  if (suspended !== undefined) where.suspended = suspended;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        donorProfile: {
          select: {
            bloodGroup: true,
            city: true,
            isAvailable: true,
          },
        },
        _count: {
          select: {
            bloodRequests: true,
            donorResponses: true,
            reportsReceived: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Suspend or reactivate user account
 */
export async function setAccountSuspension(params: {
  targetUserId: string;
  adminUserId: string;
  suspended: boolean;
  reason?: string;
}) {
  const { targetUserId, adminUserId, suspended, reason } = params;

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: {
      suspended,
      suspendedAt: suspended ? new Date() : null,
      suspendReason: suspended ? reason ?? "Violated platform policies" : null,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminUserId,
      action: suspended ? "USER_SUSPENDED" : "USER_REACTIVATED",
      entityId: targetUserId,
      details: { reason },
    },
  });

  return updated;
}

/**
 * Moderate a blood request (e.g. cancel suspicious request)
 */
export async function moderateRequest(params: {
  requestId: string;
  adminUserId: string;
  status: "OPEN" | "CANCELLED";
  reason?: string;
}) {
  const { requestId, adminUserId, status, reason } = params;

  const updated = await prisma.bloodRequest.update({
    where: { id: requestId },
    data: { status },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminUserId,
      action: "ADMIN_ACTION",
      entityId: requestId,
      details: {
        action: `Set request status to ${status}`,
        reason,
      },
    },
  });

  return updated;
}

/**
 * View recent notification delivery logs for monitoring
 */
export async function getNotificationDeliveryLogs(params: {
  channel?: string;
  status?: string;
  limit?: number;
}) {
  const { channel, status, limit = 50 } = params;

  const where: Record<string, unknown> = {};
  if (channel) where.channel = channel;
  if (status) where.deliveryStatus = status;

  return prisma.notification.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
