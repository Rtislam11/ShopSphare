
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';

import {
  Coupon,
  CouponDiscountType,
} from './entities/coupon.entity';

import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
  ) {}

  async createCoupon(dto: CreateCouponDto) {
    const code = dto.code.trim().toUpperCase();

    const existing = await this.couponRepository.findOne({
      where: { code },
    });

    if (existing) {
      throw new ConflictException('Coupon code already exists');
    }

    this.validateDates(dto.startsAt, dto.expiresAt);

    if (
      dto.discountType === CouponDiscountType.PERCENTAGE &&
      dto.discountValue > 100
    ) {
      throw new BadRequestException(
        'Percentage discount cannot exceed 100',
      );
    }

    if (
      dto.maximumDiscount !== undefined &&
      dto.discountType !== CouponDiscountType.PERCENTAGE
    ) {
      throw new BadRequestException(
        'Maximum discount is only applicable to percentage coupons',
      );
    }

    const coupon = this.couponRepository.create({
      ...dto,
      code,
    });

    return this.couponRepository.save(coupon);
  }

  async getActiveCoupons() {
    const now = new Date();

    return this.couponRepository
      .createQueryBuilder('coupon')
      .where('coupon.isActive = :active', { active: true })
      .andWhere('coupon.startsAt <= :now', { now })
      .andWhere('coupon.expiresAt >= :now', { now })
      .andWhere(
        '(coupon.usageLimit IS NULL OR coupon.usageCount < coupon.usageLimit)',
      )
      .orderBy('coupon.createdAt', 'DESC')
      .getMany();
  }

  async getCouponById(couponId: string) {
    const coupon = await this.couponRepository.findOne({
      where: { couponId },
    });

    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    return coupon;
  }

  async updateCoupon(couponId: string, dto: UpdateCouponDto) {
    const coupon = await this.getCouponById(couponId);

    if (dto.code !== undefined) {
      const code = dto.code.trim().toUpperCase();

      const duplicate = await this.couponRepository.findOne({
        where: {
          code,
          couponId: Not(couponId),
        },
      });

      if (duplicate) {
        throw new ConflictException('Coupon code already exists');
      }

      coupon.code = code;
    }

    if (
      dto.discountType === CouponDiscountType.PERCENTAGE &&
      dto.discountValue !== undefined &&
      dto.discountValue > 100
    ) {
      throw new BadRequestException(
        'Percentage discount cannot exceed 100',
      );
    }

    if (
      dto.maximumDiscount !== undefined &&
      dto.discountType !== CouponDiscountType.PERCENTAGE &&
      (dto.discountType !== undefined || coupon.discountType !== CouponDiscountType.PERCENTAGE)
    ) {
      throw new BadRequestException(
        'Maximum discount is only applicable to percentage coupons',
      );
    }

    if (
      dto.startsAt !== undefined ||
      dto.expiresAt !== undefined
    ) {
      this.validateDates(
        dto.startsAt ?? coupon.startsAt.toISOString(),
        dto.expiresAt ?? coupon.expiresAt.toISOString(),
      );
    }

    Object.assign(coupon, {
      ...dto,
      code: coupon.code,
    });

    return this.couponRepository.save(coupon);
  }

  async deleteCoupon(couponId: string) {
    const coupon = await this.getCouponById(couponId);

    coupon.isActive = false;

    return this.couponRepository.save(coupon);
  }

  async validateCoupon(dto: ValidateCouponDto) {
    const code = dto.code.trim().toUpperCase();

    const coupon = await this.couponRepository.findOne({
      where: { code },
    });

    if (!coupon) {
      throw new NotFoundException('Invalid coupon code');
    }

    const now = new Date();

    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is inactive');
    }

    if (now < new Date(coupon.startsAt)) {
      throw new BadRequestException('Coupon is not active yet');
    }

    if (now > new Date(coupon.expiresAt)) {
      throw new BadRequestException('Coupon has expired');
    }

    if (
      coupon.usageLimit !== null &&
      coupon.usageCount >= coupon.usageLimit
    ) {
      throw new BadRequestException(
        'Coupon usage limit reached',
      );
    }

    if (Number(dto.orderAmount) < Number(coupon.minimumOrderAmount)) {
      throw new BadRequestException(
        'Minimum order amount not reached',
      );
    }

    let discountAmount = 0;

    if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
      discountAmount =
        (Number(dto.orderAmount) * Number(coupon.discountValue)) / 100;

      if (coupon.maximumDiscount !== null) {
        discountAmount = Math.min(
          discountAmount,
          Number(coupon.maximumDiscount),
        );
      }
    } else {
      discountAmount = Number(coupon.discountValue);
    }

    discountAmount = Math.min(
      discountAmount,
      Number(dto.orderAmount),
    );

    return {
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: Number(coupon.discountValue),
      orderAmount: Number(dto.orderAmount),
      discountAmount: Number(discountAmount.toFixed(2)),
      finalAmount: Number(
        (Number(dto.orderAmount) - discountAmount).toFixed(2),
      ),
    };
  }

  private validateDates(startsAt: string, expiresAt: string) {
    const start = new Date(startsAt);
    const end = new Date(expiresAt);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      throw new BadRequestException(
        'Expiry date must be later than start date',
      );
    }
  }
}
