
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { SupportTicket, SupportTicketStatus } from './entities/support-ticket.entity';
import { SupportMessage } from './entities/support-message.entity';

import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import { SendSupportMessageDto } from './dto/send-support-message.dto';
import { UpdateSupportTicketStatusDto } from './dto/update-support-ticket-status.dto';
import { AssignSupportTicketDto } from './dto/assign-support-ticket.dto';

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepository: Repository<SupportTicket>,

    @InjectRepository(SupportMessage)
    private readonly messageRepository: Repository<SupportMessage>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly dataSource: DataSource,
  ) {}

  async createTicket(userId: string, dto: CreateSupportTicketDto) {
    return this.dataSource.transaction(async (manager) => {
      const ticket = manager.create(SupportTicket, {
        userId,
        subject: dto.subject,
        category: dto.category,
        priority: dto.priority,
        status: SupportTicketStatus.OPEN,
      });

      const savedTicket = await manager.save(ticket);

      const message = manager.create(SupportMessage, {
        ticketId: savedTicket.ticketId,
        senderId: userId,
        message: dto.message,
      });

      await manager.save(message);

      return {
        message: 'Support ticket created successfully',
        ticket: savedTicket,
        firstMessage: message,
      };
    });
  }

  async getMyTickets(userId: string) {
    return this.ticketRepository.find({
      where: { userId },
      relations: ['assignedTo'],
      order: { createdAt: 'DESC' },
    });
  }


  async getAllTickets() {
    return this.ticketRepository.find({
      relations: ['user', 'assignedTo'],
      order: { createdAt: 'DESC' },
    });
  }


  async getTicketById(
    ticketId: string,
    userId: string,
    isAdmin = false,
  ) {
    const ticket = await this.ticketRepository.findOne({
      where: { ticketId },
      relations: ['user', 'assignedTo'],
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    if (
      !isAdmin &&
      ticket.userId !== userId &&
      ticket.assignedToId !== userId
    ) {
      throw new ForbiddenException(
        'You cannot access this support ticket',
      );
    }

    return ticket;
  }


  async sendMessage(
    ticketId: string,
    userId: string,
    dto: SendSupportMessageDto,
    isAdmin = false,
  ) {
    const ticket = await this.getTicketById(ticketId, userId, isAdmin);

    if (
      ticket.status === SupportTicketStatus.CLOSED ||
      ticket.status === SupportTicketStatus.RESOLVED
    ) {
      throw new BadRequestException(
        'This ticket is closed or resolved',
      );
    }

    const message = this.messageRepository.create({
      ticketId,
      senderId: userId,
      message: dto.message,
      attachmentUrl: dto.attachmentUrl ?? null,
    });

    const savedMessage = await this.messageRepository.save(message);

    if (ticket.status === SupportTicketStatus.WAITING_FOR_CUSTOMER) {
      ticket.status = SupportTicketStatus.IN_PROGRESS;
      await this.ticketRepository.save(ticket);
    }

    return savedMessage;
  }

  async getTicketMessages(
    ticketId: string,
    userId: string,
    isAdmin = false,
  ) {
    await this.getTicketById(ticketId, userId, isAdmin);

    return this.messageRepository.find({
      where: { ticketId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async assignTicket(
    ticketId: string,
    dto: AssignSupportTicketDto,
  ) {
    const ticket = await this.ticketRepository.findOne({
      where: { ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    const agent = await this.userRepository.findOne({
      where: { userId: dto.assignedToId },
    });

    if (!agent) {
      throw new NotFoundException('Support agent not found');
    }

    ticket.assignedToId = dto.assignedToId;

    if (ticket.status === SupportTicketStatus.OPEN) {
      ticket.status = SupportTicketStatus.IN_PROGRESS;
    }

    return this.ticketRepository.save(ticket);
  }

  async updateTicketStatus(
    ticketId: string,
    dto: UpdateSupportTicketStatusDto,
  ) {
    const ticket = await this.ticketRepository.findOne({
      where: { ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }

    ticket.status = dto.status;

    return this.ticketRepository.save(ticket);
  }
}
