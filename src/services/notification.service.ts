import prisma from "@/lib/prisma";
import { sendWhatsAppNotification } from "./whatsapp.service";
import { formatBloodGroup } from "@/lib/utils";
import { APP_URL } from "@/lib/constants";

/**
 * Create an in-app notification.
 */
export async function createNotification(params: {
  userId: string;
  type: string;
  title: string;
  message: string;
  requestId?: string;
  donorResponseId?: string;
  channel?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type as never,
      title: params.title,
      message: params.message,
      requestId: params.requestId ?? null,
      donorResponseId: params.donorResponseId ?? null,
      channel: (params.channel as never) ?? "IN_APP",
      deliveryStatus: "SENT",
      sentAt: new Date(),
      metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
    },
  });
}

/**
 * Notify requester when a donor volunteers.
 */
export async function notifyRequesterOfDonorVolunteer(params: {
  requesterId: string;
  requesterName: string;
  requesterPhone: string;
  donorName: string;
  bloodGroup: string;
  hospitalName: string;
  requestId: string;
  donorResponseId: string;
  whatsappOptIn: boolean;
}) {
  const {
    requesterId,
    requesterName,
    requesterPhone,
    donorName,
    bloodGroup,
    hospitalName,
    requestId,
    donorResponseId,
    whatsappOptIn,
  } = params;

  const reviewLink = `${APP_URL}/dashboard/requests/${requestId}`;

  // Create in-app notification
  await createNotification({
    userId: requesterId,
    type: "DONOR_VOLUNTEERED",
    title: "Someone wants to donate!",
    message: `${donorName} is willing to donate ${formatBloodGroup(bloodGroup)} blood for your request at ${hospitalName}.`,
    requestId,
    donorResponseId,
  });

  // Send WhatsApp notification if opted in
  if (whatsappOptIn) {
    await sendWhatsAppNotification({
      to: requesterPhone,
      template: "donor_volunteer",
      variables: {
        name: requesterName,
        blood_group: formatBloodGroup(bloodGroup),
        hospital_name: hospitalName,
        donor_name: donorName,
        secure_link: reviewLink,
      },
      userId: requesterId,
      requestId,
      donorResponseId,
    });
  }
}

/**
 * Notify donor when their response is accepted.
 */
export async function notifyDonorAccepted(params: {
  donorId: string;
  donorPhone: string;
  requestId: string;
  donorResponseId: string;
  whatsappOptIn: boolean;
}) {
  const { donorId, donorPhone, requestId, donorResponseId, whatsappOptIn } = params;

  const detailsLink = `${APP_URL}/dashboard/donor`;

  // Create in-app notification
  await createNotification({
    userId: donorId,
    type: "DONOR_ACCEPTED",
    title: "Your donation offer was accepted!",
    message:
      "Great news! Your offer to donate blood has been accepted. Please coordinate with the hospital.",
    requestId,
    donorResponseId,
  });

  // WhatsApp
  if (whatsappOptIn) {
    await sendWhatsAppNotification({
      to: donorPhone,
      template: "donor_accepted",
      variables: {
        secure_link: detailsLink,
      },
      userId: donorId,
      requestId,
      donorResponseId,
    });
  }
}

/**
 * Notify donor when their response is ignored.
 */
export async function notifyDonorIgnored(params: {
  donorId: string;
  requestId: string;
  donorResponseId: string;
}) {
  await createNotification({
    userId: params.donorId,
    type: "DONOR_IGNORED",
    title: "Donation response update",
    message:
      "The requester has reviewed other donors for this request. Thank you for your willingness to help!",
    requestId: params.requestId,
    donorResponseId: params.donorResponseId,
  });
}

/**
 * Get notifications for a user.
 */
export async function getUserNotifications(
  userId: string,
  options: { page?: number; limit?: number; unreadOnly?: boolean } = {}
) {
  const { page = 1, limit = 20, unreadOnly = false } = options;

  const where: Record<string, unknown> = { userId };
  if (unreadOnly) where.readAt = null;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Get unread notification count.
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, readAt: null },
  });
}

/**
 * Mark a notification as read.
 */
export async function markNotificationRead(
  notificationId: string,
  userId: string
) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { readAt: new Date() },
  });
}

/**
 * Mark all notifications as read.
 */
export async function markAllRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
