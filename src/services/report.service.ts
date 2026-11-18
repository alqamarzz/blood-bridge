import prisma from "@/lib/prisma";
import { CreateReportInput } from "@/validations/report";

/**
 * File a report against a user or a blood request
 */
export async function createReport(reporterId: string, input: CreateReportInput) {
  const report = await prisma.report.create({
    data: {
      reporterId,
      reportedUserId: input.reportedUserId ?? null,
      requestId: input.requestId ?? null,
      reason: input.reason,
      description: input.description,
      status: "PENDING",
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: reporterId,
      action: "REPORT_CREATED",
      entityId: report.id,
      details: {
        reason: input.reason,
        reportedUserId: input.reportedUserId,
        requestId: input.requestId,
      },
    },
  });

  return report;
}

/**
 * Get reports list with filtering (for admins)
 */
export async function getReports(params: {
  status?: string;
  reason?: string;
  page?: number;
  limit?: number;
}) {
  const { status, reason, page = 1, limit = 20 } = params;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (reason) where.reason = reason;

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, name: true, phone: true },
        },
        reportedUser: {
          select: { id: true, name: true, phone: true, suspended: true },
        },
        request: {
          select: {
            id: true,
            bloodGroup: true,
            hospitalName: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.report.count({ where }),
  ]);

  return {
    reports,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Admin resolves or dismisses a report
 */
export async function updateReportStatus(params: {
  reportId: string;
  adminUserId: string;
  status: "RESOLVED" | "DISMISSED" | "UNDER_REVIEW";
  adminNotes?: string;
}) {
  const { reportId, adminUserId, status, adminNotes } = params;

  const updated = await prisma.report.update({
    where: { id: reportId },
    data: {
      status,
      adminNotes: adminNotes ?? undefined,
      resolvedAt: status === "RESOLVED" || status === "DISMISSED" ? new Date() : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: adminUserId,
      action: "REPORT_RESOLVED",
      entityId: reportId,
      details: { status, adminNotes },
    },
  });

  return updated;
}
