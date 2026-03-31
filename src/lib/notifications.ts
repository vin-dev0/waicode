import { prisma } from "@/lib/prisma";

export async function createNotification(userId: string, actorId: string, type: string, targetId?: string) {
  if (userId === actorId) return; // Don't notify for self-actions

  return await prisma.notification.create({
    data: {
      userId,
      actorId,
      type,
      targetId,
    },
  });
}