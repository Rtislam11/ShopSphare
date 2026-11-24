
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Return, ReturnStatus, RefundStatus } from './entities/return.entity';
import { ReturnItem } from './entities/return-item.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';

import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(Return)
    private readonly returnRepository: Repository<Return>,

    @InjectRepository(ReturnItem)
    private readonly returnItemRepository: Repository<ReturnItem>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}

  async createReturn(userId: string, dto: CreateReturnDto) {
    const order = await this.orderRepository.findOne({
      where: { orderId: dto.orderId, user: { userId } },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus !== 'PAID') {
      throw new BadRequestException(
        'Only paid orders can be returned',
      );
    }

    if (['CANCELLED', 'DELIVERED'].includes(order.status)) {
      if (order.status === 'CANCELLED') {
        throw new BadRequestException(
          'Cancelled orders cannot be returned',
        );
      }
    }

    const existingReturn = await this.returnRepository.findOne({
      where: {
        orderId: dto.orderId,
        userId,
      },
    });

    if (
      existingReturn &&
      ![
        ReturnStatus.CANCELLED,
        ReturnStatus.REJECTED,
      ].includes(existingReturn.status)
    ) {
      throw new ConflictException(
        'An active return request already exists for this order',
      );
    }

    const returnItems: Partial<ReturnItem>[] = [];
    let totalRefund = 0;

    for (const requestedItem of dto.items) {
      const orderItem = await this.orderItemRepository.findOne({
        where: {
          orderItemId: requestedItem.orderItemId,
          order: { orderId: dto.orderId },
        },
        relations: ['order', 'product'],
      });

      if (!orderItem) {
        throw new BadRequestException(
          `Order item ${requestedItem.orderItemId} does not belong to this order`,
        );
      }

      if (requestedItem.quantity > orderItem.quantity) {
        throw new BadRequestException(
          'Return quantity cannot exceed purchased quantity',
        );
      }

      const refundAmount =
        Number(orderItem.unitPrice) * requestedItem.quantity;

      totalRefund += refundAmount;

      returnItems.push({
        orderItemId: orderItem.orderItemId,
        productId: orderItem.productId,
        quantity: requestedItem.quantity,
        refundAmount,
      });
    }

    const returnRequest = this.returnRepository.create({
      orderId: order.orderId,
      userId,
      reason: dto.reason,
      status: ReturnStatus.REQUESTED,
      refundStatus: RefundStatus.PENDING,
      refundAmount: totalRefund,
    });

    const savedReturn = await this.returnRepository.save(returnRequest);

    const items = returnItems.map((item) =>
      this.returnItemRepository.create({
        ...item,
        returnId: savedReturn.returnId,
      }),
    );

    await this.returnItemRepository.save(items);

    return this.getReturnById(userId, savedReturn.returnId);
  }

  async getMyReturns(userId: string) {
    return this.returnRepository.find({
      where: { userId },
      relations: ['items', 'items.product', 'order'],
      order: { createdAt: 'DESC' },
    });
  }

  async getReturnById(userId: string, returnId: string) {
    const returnRequest = await this.returnRepository.findOne({
      where: { returnId },
      relations: ['items', 'items.product', 'order', 'user'],
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    if (returnRequest.userId !== userId) {
      throw new ForbiddenException(
        'You cannot access this return request',
      );
    }

    return returnRequest;
  }

  async cancelReturn(userId: string, returnId: string) {
    const returnRequest = await this.returnRepository.findOne({
      where: { returnId, userId },
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    if (returnRequest.status !== ReturnStatus.REQUESTED) {
      throw new BadRequestException(
        'Only requested returns can be cancelled',
      );
    }

    returnRequest.status = ReturnStatus.CANCELLED;
    returnRequest.refundStatus = RefundStatus.NOT_APPLICABLE;

    return this.returnRepository.save(returnRequest);
  }

  async updateReturnStatus(
    returnId: string,
    dto: UpdateReturnStatusDto,
  ) {
    const returnRequest = await this.returnRepository.findOne({
      where: { returnId },
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    if (
      [
        ReturnStatus.CANCELLED,
        ReturnStatus.REJECTED,
        ReturnStatus.REFUNDED,
      ].includes(returnRequest.status)
    ) {
      throw new BadRequestException(
        'This return request is already closed',
      );
    }

    if (
      dto.status === ReturnStatus.REFUNDED ||
      dto.status === ReturnStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Use the refund or cancel endpoint for this action',
      );
    }

    returnRequest.status = dto.status;

    if (dto.adminNote !== undefined) {
      returnRequest.adminNote = dto.adminNote;
    }

    return this.returnRepository.save(returnRequest);
  }

  async processRefund(
    returnId: string,
    dto: ProcessRefundDto,
  ) {
    const returnRequest = await this.returnRepository.findOne({
      where: { returnId },
    });

    if (!returnRequest) {
      throw new NotFoundException('Return request not found');
    }

    if (returnRequest.status !== ReturnStatus.RECEIVED) {
      throw new BadRequestException(
        'The returned products must be received before refunding',
      );
    }

    if (returnRequest.refundStatus === RefundStatus.COMPLETED) {
      throw new ConflictException(
        'This return has already been refunded',
      );
    }

    if (Number(dto.refundAmount) > Number(returnRequest.refundAmount)) {
      throw new BadRequestException(
        'Refund amount cannot exceed the calculated return amount',
      );
    }

    
    returnRequest.refundAmount = Number(dto.refundAmount);
    returnRequest.refundStatus = RefundStatus.COMPLETED;
    returnRequest.status = ReturnStatus.REFUNDED;

    if (dto.note) {
      returnRequest.adminNote = dto.note;
    }

    return this.returnRepository.save(returnRequest);
  }
}
