
import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Request } from 'express';

import { SupportService } from './support.service';

import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { SendSupportMessageDto } from './dto/send-support-message.dto';
import { UpdateSupportTicketStatusDto } from './dto/update-support-ticket-status.dto';
import { AssignSupportTicketDto } from './dto/assign-support-ticket.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    roles: string[];
  };
}

@Controller('support')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Post('tickets')
  createTicket(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateSupportTicketDto,
  ) {
    return this.supportService.createTicket(req.user.userId, dto);
  }

  @Get('tickets')
  getMyTickets(@Req() req: AuthenticatedRequest) {
    return this.supportService.getMyTickets(req.user.userId);
  }

  @Get('admin/tickets')
  @UseGuards(AdminGuard)
  getAllTickets() {
    return this.supportService.getAllTickets();
  }


  @Get('tickets/:id')
  getTicketById(
    @Param('id', ParseUUIDPipe) ticketId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const isAdmin = req.user.roles.some((role) =>
      ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(role),
    );

    return this.supportService.getTicketById(
      ticketId,
      req.user.userId,
      isAdmin,
    );
  }


  @Post('tickets/:id/messages')
  sendMessage(
    @Param('id', ParseUUIDPipe) ticketId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: SendSupportMessageDto,
  ) {
    const isAdmin = req.user.roles.some((role) =>
      ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(role),
    );

    return this.supportService.sendMessage(
      ticketId,
      req.user.userId,
      dto,
      isAdmin,
    );
  }

  @Get('tickets/:id/messages')
  getTicketMessages(
    @Param('id', ParseUUIDPipe) ticketId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const isAdmin = req.user.roles.some((role) =>
      ['ROLE_ADMIN', 'ROLE_SUPER_ADMIN'].includes(role),
    );

    return this.supportService.getTicketMessages(
      ticketId,
      req.user.userId,
      isAdmin,
    );
  }

  @Patch('tickets/:id/assign')
  @UseGuards(AdminGuard)
  assignTicket(
    @Param('id', ParseUUIDPipe) ticketId: string,
    @Body() dto: AssignSupportTicketDto,
  ) {
    return this.supportService.assignTicket(ticketId, dto);
  }


  @Patch('tickets/:id/status')
  @UseGuards(AdminGuard)
  updateTicketStatus(
    @Param('id', ParseUUIDPipe) ticketId: string,
    @Body() dto: UpdateSupportTicketStatusDto,
  ) {
    return this.supportService.updateTicketStatus(ticketId, dto);
  }
}
