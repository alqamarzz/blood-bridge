import prisma from "@/lib/prisma";
import {
  notifyRequesterOfDonorVolunteer,
  notifyDonorAccepted,
  notifyDonorIgnored,
} from "./notification.service";

/**
 * Donor volunteers for a blood request ("I'm willing to donate").
 * Runs in a transaction to prevent race conditions and duplicate responses.
 */
export async function volunteerForRequest(params: {
  requestId: string;
  donorUserId: string;
  message?: string;
}) {
  const { requestId, donorUserId, message } = params;

  return prisma.$transaction(async (tx) => {
    // 1. Fetch request and verify active status
    const request = await tx.bloodRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!request) {
      throw new Error("Blood request not found");
    }

    if (request.status !== "OPEN" && request.status !== "PARTIALLY_FILLED") {
      throw new Error(`Cannot volunteer: request is currently ${request.status.toLowerCase()}`);
    }

    if (new Date(request.requiredBy) < new Date()) {
      throw new Error("This blood request has expired");
    }

    if (request.requesterId === donorUserId) {
      throw new Error("You cannot volunteer for your own blood request");
    }

    // 2. Fetch donor profile & verify availability
    const donorUser = await tx.user.findUnique({
      where: { id: donorUserId },
      include: {
        donorProfile: true,
      },
    });

    if (!donorUser || !donorUser.donorProfile) {
      throw new Error("Please complete your donor profile before volunteering");
    }

    if (donorUser.suspended) {
      throw new Error("Your account is currently suspended. Please contact support.");
    }

    if (!donorUser.donorProfile.isAvailable) {
      throw new Error("Your donor status is currently marked as unavailable. Turn it on in your dashboard.");
    }

    // 3. Check duplicate response
    const existingResponse = await tx.donorResponse.findUnique({
      where: {
        requestId_donorId: {
          requestId,
          donorId: donorUserId,
        },
      },
    });

    if (existingResponse) {
      if (existingResponse.status === "WITHDRAWN") {
        // Re-activate previously withdrawn response
        const updated = await tx.donorResponse.update({
          where: { id: existingResponse.id },
          data: {
            status: "INTERESTED",
            statusMessage: message ?? null,
            updatedAt: new Date(),
          },
        });

        // Trigger notifications
        await notifyRequesterOfDonorVolunteer({
          requesterId: request.requester.id,
          requesterName: request.requester.name,
          requesterPhone: request.requester.phone,
          donorName: donorUser.name,
          bloodGroup: donorUser.donorProfile.bloodGroup,
          hospitalName: request.hospitalName,
          requestId: request.id,
          donorResponseId: updated.id,
          whatsappOptIn: true,
        });

        return updated;
      }
      throw new Error("You have already volunteered for this request");
    }

    // 4. Create DonorResponse
    const response = await tx.donorResponse.create({
      data: {
        requestId,
        donorId: donorUserId,
        status: "INTERESTED",
        statusMessage: message ?? null,
      },
    });

    // 5. Audit log
    await tx.auditLog.create({
      data: {
        userId: donorUserId,
        action: "DONOR_VOLUNTEERED",
        entityId: response.id,
        details: { requestId },
      },
    });

    // 6. Notify requester (In-app + WhatsApp if opted in)
    await notifyRequesterOfDonorVolunteer({
      requesterId: request.requester.id,
      requesterName: request.requester.name,
      requesterPhone: request.requester.phone,
      donorName: donorUser.name,
      bloodGroup: donorUser.donorProfile.bloodGroup,
      hospitalName: request.hospitalName,
      requestId: request.id,
      donorResponseId: response.id,
      whatsappOptIn: true,
    });

    return response;
  });
}

/**
 * Requester accepts a donor response.
 * Increments fulfilled units and adjusts request status if all units filled.
 */
export async function acceptDonorResponse(params: {
  responseId: string;
  requesterUserId: string;
}) {
  const { responseId, requesterUserId } = params;

  return prisma.$transaction(async (tx) => {
    const response = await tx.donorResponse.findUnique({
      where: { id: responseId },
      include: {
        request: true,
        donor: {
          include: {
            donorProfile: true,
          },
        },
      },
    });

    if (!response) {
      throw new Error("Donor response not found");
    }

    // 1. Verify requester owns the blood request
    if (response.request.requesterId !== requesterUserId) {
      throw new Error("Unauthorized: Only the requester can accept donors");
    }

    // 2. Verify response is still INTERESTED
    if (response.status !== "INTERESTED") {
      throw new Error(`Cannot accept: response is currently ${response.status}`);
    }

    // 3. Update response to ACCEPTED
    const updatedResponse = await tx.donorResponse.update({
      where: { id: responseId },
      data: {
        status: "ACCEPTED",
        updatedAt: new Date(),
      },
    });

    // 4. Update request fulfilled count & status
    const newFulfilled = response.request.unitsFulfilled + 1;
    const newStatus =
      newFulfilled >= response.request.unitsRequired
        ? "FULFILLED"
        : "PARTIALLY_FILLED";

    await tx.bloodRequest.update({
      where: { id: response.request.id },
      data: {
        unitsFulfilled: newFulfilled,
        status: newStatus,
      },
    });

    // 5. Create donation record placeholder
    await tx.donationRecord.create({
      data: {
        donorId: response.donorId,
        requestId: response.request.id,
        verificationStatus: "PENDING",
      },
    });

    // 6. Audit log
    await tx.auditLog.create({
      data: {
        userId: requesterUserId,
        action: "DONOR_ACCEPTED",
        entityId: response.id,
        details: { requestId: response.request.id, donorId: response.donorId },
      },
    });

    // 7. Notify donor
    await notifyDonorAccepted({
      donorId: response.donor.id,
      donorPhone: response.donor.phone,
      requestId: response.request.id,
      donorResponseId: response.id,
      whatsappOptIn: response.donor.donorProfile?.whatsappOptIn ?? false,
    });

    return updatedResponse;
  });
}

/**
 * Requester ignores a donor response.
 */
export async function ignoreDonorResponse(params: {
  responseId: string;
  requesterUserId: string;
}) {
  const { responseId, requesterUserId } = params;

  return prisma.$transaction(async (tx) => {
    const response = await tx.donorResponse.findUnique({
      where: { id: responseId },
      include: {
        request: true,
      },
    });

    if (!response) {
      throw new Error("Donor response not found");
    }

    // Verify requester ownership
    if (response.request.requesterId !== requesterUserId) {
      throw new Error("Unauthorized: Only the requester can ignore donors");
    }

    if (response.status !== "INTERESTED") {
      throw new Error(`Cannot ignore: response is ${response.status}`);
    }

    const updated = await tx.donorResponse.update({
      where: { id: responseId },
      data: {
        status: "IGNORED",
        updatedAt: new Date(),
      },
    });

    await tx.auditLog.create({
      data: {
        userId: requesterUserId,
        action: "DONOR_IGNORED",
        entityId: response.id,
        details: { requestId: response.request.id, donorId: response.donorId },
      },
    });

    // Send polite notification to donor
    await notifyDonorIgnored({
      donorId: response.donorId,
      requestId: response.request.id,
      donorResponseId: response.id,
    });

    return updated;
  });
}

/**
 * Donor withdraws their response.
 */
export async function withdrawDonorResponse(params: {
  responseId: string;
  donorUserId: string;
}) {
  const { responseId, donorUserId } = params;

  return prisma.$transaction(async (tx) => {
    const response = await tx.donorResponse.findUnique({
      where: { id: responseId },
      include: {
        request: true,
      },
    });

    if (!response) {
      throw new Error("Response not found");
    }

    if (response.donorId !== donorUserId) {
      throw new Error("Unauthorized: You can only withdraw your own response");
    }

    if (response.status === "COMPLETED") {
      throw new Error("Cannot withdraw a completed donation");
    }

    const wasAccepted = response.status === "ACCEPTED";

    const updated = await tx.donorResponse.update({
      where: { id: responseId },
      data: {
        status: "WITHDRAWN",
        updatedAt: new Date(),
      },
    });

    // If it was accepted, decrement unitsFulfilled
    if (wasAccepted) {
      const newFulfilled = Math.max(0, response.request.unitsFulfilled - 1);
      const newStatus = newFulfilled === 0 ? "OPEN" : "PARTIALLY_FILLED";

      await tx.bloodRequest.update({
        where: { id: response.request.id },
        data: {
          unitsFulfilled: newFulfilled,
          status: newStatus,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: donorUserId,
        action: "DONOR_WITHDRAWN",
        entityId: response.id,
      },
    });

    return updated;
  });
}

/**
 * Fetch responses volunteered by a donor
 */
export async function getDonorResponsesForDonor(donorUserId: string) {
  return prisma.donorResponse.findMany({
    where: { donorId: donorUserId },
    include: {
      request: {
        include: {
          requester: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
