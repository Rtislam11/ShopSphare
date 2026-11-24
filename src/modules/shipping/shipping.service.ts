
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';

import { Shipment, ShipmentStatus } from './entities/shipment.entity';
import {
  Order,
  OrderStatus,
  PaymentStatus,
} from '../orders/entities/order.entity';

import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepository: Repository<Shipment>,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  private generateTrackingNumber(): string {
    return `SS-${randomBytes(8).toString('hex').toUpperCase()}`;
  }


  async createShipment(
    userId: string,
    dto: CreateShipmentDto,
  ) {
    const order = await this.orderRepository.findOne({
      where: {
        orderId: dto.orderId,
        user: { userId },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new BadRequestException(
        'Shipment can only be created for paid orders',
      );
    }

    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.DELIVERED
    ) {
      throw new BadRequestException(
        'Shipment cannot be created for this order status',
      );
    }

    const existingShipment = await this.shipmentRepository.findOne({
      where: { orderId: dto.orderId },
    });

    if (existingShipment) {
      throw new ConflictException(
        'A shipment already exists for this order',
      );
    }

    const shipment = this.shipmentRepository.create({
      orderId: order.orderId,
      order,
      trackingNumber: this.generateTrackingNumber(),
      shippingProvider: dto.shippingProvider,
      shippingAddress: dto.shippingAddress,
      status: ShipmentStatus.PENDING,
      estimatedDeliveryDate: dto.estimatedDeliveryDate
        ? new Date(dto.estimatedDeliveryDate)
        : null,
      deliveredAt: null,
    });

    const savedShipment =
      await this.shipmentRepository.save(shipment);

    return {
      message: 'Shipment created successfully',
      shipment: savedShipment,
    };
  }


  async getShipmentById(shipmentId: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: { shipmentId },
      relations: { order: true },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return shipment;
  }

  async getShipmentByOrder(
    userId: string,
    orderId: string,
  ) {
    const shipment = await this.shipmentRepository.findOne({
      where: {
        orderId,
        order: { user: { userId } },
      },
      relations: { order: true },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return shipment;
  }


  async updateShipmentStatus(
    shipmentId: string,
    dto: UpdateShipmentStatusDto,
  ) {
    const shipment = await this.shipmentRepository.findOne({
      where: { shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    if (
      shipment.status === ShipmentStatus.DELIVERED ||
      shipment.status === ShipmentStatus.RETURNED
    ) {
      throw new BadRequestException(
        'A delivered or returned shipment cannot be updated',
      );
    }

    if (
      shipment.status === ShipmentStatus.FAILED &&
      dto.status !== ShipmentStatus.RETURNED
    ) {
      throw new BadRequestException(
        'A failed shipment can only be marked as returned',
      );
    }

    if (
      dto.status === ShipmentStatus.DELIVERED &&
      shipment.status !== ShipmentStatus.OUT_FOR_DELIVERY
    ) {
      throw new BadRequestException(
        'Shipment must be out for delivery before it can be delivered',
      );
    }

    shipment.status = dto.status;

    if (dto.status === ShipmentStatus.DELIVERED) {
      shipment.deliveredAt = new Date();
    }

    return this.shipmentRepository.save(shipment);
  }

  async getUserShipments(userId: string) {
    return this.shipmentRepository.find({
      where: {
        order: { user: { userId } },
      },
      relations: { order: true },
      order: { createdAt: 'DESC' },
    });
  }

  async trackShipment(trackingNumber: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: { trackingNumber },
      relations: { order: true },
    });

    if (!shipment) {
      throw new NotFoundException(
        'Shipment tracking number not found',
      );
    }

    return {
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      shippingProvider: shipment.shippingProvider,
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      deliveredAt: shipment.deliveredAt,
      createdAt: shipment.createdAt,
    };
  }
}
