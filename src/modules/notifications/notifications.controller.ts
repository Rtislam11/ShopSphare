
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Request } from 'express';

import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}


  @Get()
  getNotifications(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.getNotifications(
      req.user.userId,
    );
  }

  @Get('unread')
  getUnreadNotifications(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.getUnreadNotifications(
      req.user.userId,
    );
  }


  @Patch('read-all')
  markAllAsRead(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.markAllAsRead(
      req.user.userId,
    );
  }

  @Patch(':id/read')
  markAsRead(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) notificationId: string,
  ) {
    return this.notificationsService.markAsRead(
      req.user.userId,
      notificationId,
    );
  }

  @Delete(':id')
  deleteNotification(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) notificationId: string,
  ) {
    return this.notificationsService.deleteNotification(
      req.user.userId,
      notificationId,
    );
  }

  @Delete()
  clearNotifications(@Req() req: AuthenticatedRequest) {
    return this.notificationsService.clearNotifications(
      req.user.userId,
    );
  }
}
