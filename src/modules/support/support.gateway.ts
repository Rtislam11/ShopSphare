
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import {
  Logger,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Server, Socket } from 'socket.io';

import { SupportService } from './support.service';
import { SendSupportMessageDto } from './dto/send-support-message.dto';

interface AuthenticatedSocket extends Socket {
  data: {
    user?: {
      userId: string;
      roles: string[];
    };
  };
}

@WebSocketGateway({
  namespace: '/support-chat',
  cors: {
    origin: '*',
  },
})
export class SupportGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SupportGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly supportService: SupportService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const authToken = client.handshake.auth?.token;

      const authorization = client.handshake.headers.authorization;

      const token =
        authToken ||
        (authorization?.startsWith('Bearer ')
          ? authorization.substring(7)
          : null);

      if (!token) {
        client.disconnect(true);
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      if (!payload.sub) {
        client.disconnect(true);
        return;
      }

      client.data.user = {
        userId: payload.sub,
        roles: Array.isArray(payload.roles) ? payload.roles : [],
      };

      this.logger.log(`User connected: ${payload.sub}`);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(
      `User disconnected: ${client.data.user?.userId ?? 'unknown'}`,
    );
  }

  // Join a support ticket chat room
  @SubscribeMessage('join_ticket')
  async joinTicket(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { ticketId: string },
  ) {
    try {
      const user = client.data.user;

      if (!user || !data?.ticketId) {
        return { success: false, message: 'Invalid request' };
      }

      const isAdmin = user.roles.some((role) =>
        ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(role),
      );

      await this.supportService.getTicketById(
        data.ticketId,
        user.userId,
        isAdmin,
      );

      const room = `ticket_${data.ticketId}`;

      await client.join(room);

      return {
        success: true,
        message: 'Joined support chat',
        ticketId: data.ticketId,
      };
    } catch {
      return {
        success: false,
        message: 'You cannot access this ticket',
      };
    }
  }

  // Send a message in real time
  @SubscribeMessage('send_message')
  async sendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: {
      ticketId: string;
      message: string;
      attachmentUrl?: string;
    },
  ) {
    try {
      const user = client.data.user;

      if (!user || !data?.ticketId) {
        return { success: false, message: 'Invalid request' };
      }

      const isAdmin = user.roles.some((role) =>
        ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(role),
      );

      const dto: SendSupportMessageDto = {
        message: data.message,
        attachmentUrl: data.attachmentUrl,
      };

      const savedMessage = await this.supportService.sendMessage(
        data.ticketId,
        user.userId,
        dto,
        isAdmin,
      );

      this.server
        .to(`ticket_${data.ticketId}`)
        .emit('new_message', savedMessage);

      return {
        success: true,
        message: 'Message sent',
        data: savedMessage,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Unable to send message',
      };
    }
  }
}
