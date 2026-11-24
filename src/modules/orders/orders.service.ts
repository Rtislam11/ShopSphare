
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import {
  Order,
  OrderStatus,
  PaymentStatus,
} from './entities/order.entity';

import { OrderItem } from './entities/order-item.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';

import {
  Product,
  ProductStatus,
} from '../products/entities/product.entity';

import {
  Coupon,
  CouponDiscountType,
} from '../coupons/entities/coupon.entity';

import { CouponUsage } from '../coupons/entities/coupon-usage.entity';

import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,

    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async checkout(userId: string, dto: CheckoutDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const cart = await queryRunner.manager.findOne(Cart, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!cart) {
        throw new BadRequestException('Your cart is empty');
      }

      const cartItems = await queryRunner.manager.find(CartItem, {
        where: { cartId: cart.cartId },
      });

      if (cartItems.length === 0) {
        throw new BadRequestException('Your cart is empty');
      }

      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      for (const cartItem of cartItems) {
        const product = await queryRunner.manager
          .createQueryBuilder(Product, 'product')
          .leftJoinAndSelect('product.seller', 'seller')
          .setLock('pessimistic_write', undefined, ['product'])
          .where('product.productId = :productId', {
            productId: cartItem.productId,
          })
          .getOne();

        if (!product || product.status !== ProductStatus.ACTIVE) {
          throw new BadRequestException(
            `Product ${cartItem.productId} is no longer available`,
          );
        }

        if (product.stockQuantity < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${product.name}`,
          );
        }

        const unitPrice = Number(product.price);
        const subtotal = unitPrice * cartItem.quantity;

        totalAmount += subtotal;

        product.stockQuantity -= cartItem.quantity;

        await queryRunner.manager.save(Product, product);

        const orderItem = queryRunner.manager.create(OrderItem, {
          productId: product.productId,
          sellerId: product.seller.sellerId,
          quantity: cartItem.quantity,
          unitPrice,
          subtotal,
        });

        orderItems.push(orderItem);
      }

      totalAmount = Number(totalAmount.toFixed(2));

      // Coupon processing
      let discountAmount = 0;
      let couponCode: string | null = null;
      let selectedCoupon: Coupon | null = null;

      if (dto.couponCode) {
        const normalizedCode = dto.couponCode.trim().toUpperCase();

        selectedCoupon = await queryRunner.manager
          .createQueryBuilder(Coupon, 'coupon')
          .setLock('pessimistic_write')
          .where('coupon.code = :code', {
            code: normalizedCode,
          })
          .getOne();

        if (!selectedCoupon) {
          throw new BadRequestException('Invalid coupon code');
        }

        const now = new Date();

        if (!selectedCoupon.isActive) {
          throw new BadRequestException('Coupon is inactive');
        }

        if (
          now < new Date(selectedCoupon.startsAt) ||
          now > new Date(selectedCoupon.expiresAt)
        ) {
          throw new BadRequestException(
            'Coupon is outside its validity period',
          );
        }

        if (
          selectedCoupon.usageLimit !== null &&
          selectedCoupon.usageCount >= selectedCoupon.usageLimit
        ) {
          throw new BadRequestException(
            'Coupon usage limit reached',
          );
        }

        if (
          totalAmount <
          Number(selectedCoupon.minimumOrderAmount)
        ) {
          throw new BadRequestException(
            'Minimum order amount not reached',
          );
        }

        const userUsageCount = await queryRunner.manager.count(
          CouponUsage,
          {
            where: {
              couponId: selectedCoupon.couponId,
              userId,
            },
          },
        );

        if (userUsageCount >= selectedCoupon.perUserLimit) {
          throw new ConflictException(
            'You have reached the usage limit for this coupon',
          );
        }

        if (
          selectedCoupon.discountType ===
          CouponDiscountType.PERCENTAGE
        ) {
          discountAmount =
            (totalAmount *
              Number(selectedCoupon.discountValue)) /
            100;

          if (selectedCoupon.maximumDiscount !== null) {
            discountAmount = Math.min(
              discountAmount,
              Number(selectedCoupon.maximumDiscount),
            );
          }
        } else {
          discountAmount = Number(selectedCoupon.discountValue);
        }

        discountAmount = Math.min(
          discountAmount,
          totalAmount,
        );

        discountAmount = Number(discountAmount.toFixed(2));
        couponCode = selectedCoupon.code;
      }

      const finalAmount = Number(
        (totalAmount - discountAmount).toFixed(2),
      );

      const order = queryRunner.manager.create(Order, {
        userId,
        totalAmount: finalAmount,
        couponCode,
        discountAmount,
        shippingAddress: dto.shippingAddress,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.UNPAID,
      });

      const savedOrder = await queryRunner.manager.save(
        Order,
        order,
      );

      for (const item of orderItems) {
        item.orderId = savedOrder.orderId;
      }

      await queryRunner.manager.save(OrderItem, orderItems);

      // Record coupon usage within the same transaction
      if (selectedCoupon) {
        const couponUsage = queryRunner.manager.create(
          CouponUsage,
          {
            couponId: selectedCoupon.couponId,
            userId,
            orderId: savedOrder.orderId,
          },
        );

        await queryRunner.manager.save(
          CouponUsage,
          couponUsage,
        );

        selectedCoupon.usageCount += 1;

        await queryRunner.manager.save(
          Coupon,
          selectedCoupon,
        );
      }

      await queryRunner.manager.delete(CartItem, {
        cartId: cart.cartId,
      });

      await queryRunner.commitTransaction();

      return this.orderRepository.findOne({
        where: { orderId: savedOrder.orderId },
        relations: {
          items: {
            product: true,
            seller: true,
          },
        },
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getCustomerOrders(userId: string) {
    return this.orderRepository.find({
      where: { userId },
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await this.orderRepository.findOne({
      where: { orderId },
      relations: {
        items: {
          product: true,
          seller: true,
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException(
        'You cannot access this order',
      );
    }

    return order;
  }


async updateOrderStatus(
  orderId: string,
  dto: UpdateOrderStatusDto,
) {
  const queryRunner = this.dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const order = await queryRunner.manager.findOne(Order, {
      where: { orderId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'A delivered or cancelled order cannot be updated',
      );
    }

    order.status = dto.status;

    const savedOrder = await queryRunner.manager.save(
      Order,
      order,
    );

    await queryRunner.commitTransaction();

    return savedOrder;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}


  async getSellerOrders(sellerId: string) {
    return this.orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.items', 'item')
      .innerJoinAndSelect('item.product', 'product')
      .where('item.sellerId = :sellerId', { sellerId })
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }


  async simulatePayment(userId: string, orderId: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const order = await queryRunner.manager.findOne(Order, {
        where: { orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      if (order.userId !== userId) {
        throw new ForbiddenException(
          'You cannot pay for this order',
        );
      }

      if (order.status === OrderStatus.CANCELLED) {
        throw new BadRequestException(
          'Payment is not allowed for a cancelled order',
        );
      }

      if (order.paymentStatus === PaymentStatus.PAID) {
        throw new BadRequestException(
          'This order is already paid',
        );
      }

      order.paymentStatus = PaymentStatus.PAID;
      order.status = OrderStatus.CONFIRMED;

      const savedOrder = await queryRunner.manager.save(
        Order,
        order,
      );

      await queryRunner.commitTransaction();

      return {
        message: 'Payment simulated successfully',
        orderId: savedOrder.orderId,
        paymentStatus: savedOrder.paymentStatus,
        orderStatus: savedOrder.status,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

}
