import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createForUser(userId: number, title: string, message: string) {
    return this.prisma.notification.create({
      data: { user_id: userId, title, message },
    });
  }

  async findForUser(userId: number) {
    const notifications = await this.prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 50,
    });
    const unreadCount = notifications.filter((n) => !n.is_read).length;
    return { success: true, data: notifications, unreadCount };
  }

  async markRead(notificationId: number, userId: number) {
    const existing = await this.prisma.notification.findFirst({
      where: { notification_id: notificationId, user_id: userId },
    });
    if (!existing) throw new NotFoundException('Notification not found');
    const updated = await this.prisma.notification.update({
      where: { notification_id: notificationId },
      data: { is_read: true },
    });
    return { success: true, data: updated };
  }

  async markAllRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
    return { success: true };
  }
}
