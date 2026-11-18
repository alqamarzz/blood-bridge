import prisma from "@/lib/prisma";
import { CreateRequestInput, UpdateRequestInput } from "@/validations/request";

/**
 * Create a new blood request.
 */
export async function createBloodRequest(requesterId: string, input: CreateRequestInput) {
  const request = await prisma.bloodRequest.create({
    data: {
      requesterId,
      bloodGroup: input.bloodGroup,
      unitsRequired: input.unitsRequired,
      hospitalName: input.hospitalName,
      hospitalAddress: input.hospitalAddress,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      city: input.city,
      requiredBy: new Date(input.requiredBy),
      urgency: input.urgency,
      additionalInformation: input.additionalInformation ?? null,
      contactPhone: input.contactPhone || null,
      status: "OPEN",
    },
    include: {
      requester: {
        select: { id: true, name: true },
      },
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      userId: requesterId,
      action: "REQUEST_CREATED",
      entityId: request.id,
      details: {
        bloodGroup: input.bloodGroup,
        unitsRequired: input.unitsRequired,
        hospitalName: input.hospitalName,
      },
    },
  });

  return request;
}

/**
 * Get all blood requests with optional filters.
 */
export async function getBloodRequests(params: {
  status?: string;
  bloodGroup?: string;
  city?: string;
  page?: number;
  limit?: number;
}) {
  const { status, bloodGroup, city, page = 1, limit = 10 } = params;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (bloodGroup) where.bloodGroup = bloodGroup;
  if (city) where.city = city;

  const [requests, total] = await Promise.all([
    prisma.bloodRequest.findMany({
      where,
      include: {
        requester: {
          select: { id: true, name: true },
        },
        _count: {
          select: { donorResponses: true },
        },
      },
      orderBy: [
        { urgency: "desc" },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.bloodRequest.count({ where }),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get blood requests for a specific requester.
 */
export async function getRequesterRequests(requesterId: string) {
  return prisma.bloodRequest.findMany({
    where: { requesterId },
    include: {
      requester: {
        select: { id: true, name: true },
      },
      _count: {
        select: { donorResponses: true },
      },
      donorResponses: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a single blood request with full details.
 */
export async function getBloodRequestById(requestId: string) {
  return prisma.bloodRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: {
        select: { id: true, name: true, phone: true },
      },
      donorResponses: {
        include: {
          donor: {
            select: {
              id: true,
              name: true,
              donorProfile: {
                select: {
                  bloodGroup: true,
                  city: true,
                  area: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { donorResponses: true },
      },
    },
  });
}

/**
 * Update a blood request.
 */
export async function updateBloodRequest(
  requestId: string,
  requesterId: string,
  input: UpdateRequestInput
) {
  // Verify ownership
  const existing = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
    select: { requesterId: true, status: true },
  });

  if (!existing) throw new Error("Request not found");
  if (existing.requesterId !== requesterId) throw new Error("Not authorized");
  if (existing.status === "FULFILLED" || existing.status === "CANCELLED") {
    throw new Error("Cannot update a fulfilled or cancelled request");
  }

  return prisma.bloodRequest.update({
    where: { id: requestId },
    data: {
      ...input,
      requiredBy: input.requiredBy ? new Date(input.requiredBy) : undefined,
    },
  });
}

/**
 * Update a blood request status.
 */
export async function updateRequestStatus(
  requestId: string,
  requesterId: string,
  status: string
) {
  // Verify ownership
  const existing = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
    select: { requesterId: true, status: true },
  });

  if (!existing) throw new Error("Request not found");
  if (existing.requesterId !== requesterId) throw new Error("Not authorized");

  const request = await prisma.bloodRequest.update({
    where: { id: requestId },
    data: { status: status as never },
  });

  await prisma.auditLog.create({
    data: {
      userId: requesterId,
      action: status === "CANCELLED" ? "REQUEST_CANCELLED" : "REQUEST_UPDATED",
      entityId: requestId,
      details: { status },
    },
  });

  return request;
}

/**
 * Expire overdue requests.
 * This should be run periodically (e.g., via cron).
 */
export async function expireOverdueRequests() {
  const result = await prisma.bloodRequest.updateMany({
    where: {
      status: { in: ["OPEN", "PARTIALLY_FILLED"] },
      requiredBy: { lt: new Date() },
    },
    data: { status: "EXPIRED" },
  });

  return result.count;
}
