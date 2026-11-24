
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


import {
  Notification,
  NotificationType,
} from './entities/notification.entity';

import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}


  async createNotification(dto: CreateNotificationDto) {
    const notification = this.notificationRepository.create({
      userId: dto.userId,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      isRead: false,
    });

    return this.notificationRepository.save(notification);
  }


  async getNotifications(userId: string) {
    return this.notificationRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }


  async getUnreadNotifications(userId: string) {
    return this.notificationRepository.find({
      where: {
        userId,
        isRead: false,
      },
      order: { createdAt: 'DESC' },
    });
  }


  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: {
        notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;

    return this.notificationRepository.save(notification);
  }


  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      {
        userId,
        isRead: false,
      },
      {
        isRead: true,
      },
    );

    return {
      message: 'All notifications marked as read',
    };
  }

  async deleteNotification(
    userId: string,
    notificationId: string,
  ) {
    const notification = await this.notificationRepository.findOne({
      where: {
        notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepository.remove(notification);

    return {
      message: 'Notification deleted successfully',
    };
  }

  async clearNotifications(userId: string) {
    await this.notificationRepository.delete({ userId });

    return {
      message: 'All notifications cleared successfully',
    };
  }
}
