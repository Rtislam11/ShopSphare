
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Review } from './entities/review.entity';
import { Product, ProductStatus } from '../products/entities/product.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { PaymentStatus } from '../orders/entities/order.entity';

import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
  ) {}


  private async verifyPurchase(
    userId: string,
    productId: string,
  ) {
    const purchase = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoin('orderItem.order', 'order')
      .innerJoin('order.user', 'user')
      .innerJoin('orderItem.product', 'product')
      .where('product.productId = :productId', { productId })
      .andWhere('user.userId = :userId', { userId })
      .andWhere('order.paymentStatus = :paymentStatus', {
        paymentStatus: PaymentStatus.PAID,
      })
      .getOne();

    if (!purchase) {
      throw new ForbiddenException(
        'You must purchase and pay for this product before reviewing it',
      );
    }
  }


  async createReview(
    userId: string,
    dto: CreateReviewDto,
  ) {
    const product = await this.productRepository.findOne({
      where: {
        productId: dto.productId,
        status: ProductStatus.ACTIVE,
      },
    });

    if (!product) {
      throw new NotFoundException('Active product not found');
    }

    await this.verifyPurchase(userId, dto.productId);

    const existingReview = await this.reviewRepository.findOne({
      where: {
        userId,
        productId: dto.productId,
      },
    });

    if (existingReview) {
      throw new ConflictException(
        'You have already reviewed this product',
      );
    }

    const review = this.reviewRepository.create({
      userId,
      productId: dto.productId,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });

    return this.reviewRepository.save(review);
  }

  // GET /reviews/product/:productId
  async getProductReviews(productId: string) {
    const product = await this.productRepository.findOne({
      where: { productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.reviewRepository.find({
      where: { productId },
      relations: { user: true },
      select: {
        reviewId: true,
        userId: true,
        productId: true,
        rating: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        user: {
          userId: true,
          name: true,
        },
      },
      order: { createdAt: 'DESC' },
    });
  }

  
  async getReviewById(reviewId: string) {
    const review = await this.reviewRepository.findOne({
      where: { reviewId },
      relations: { user: true },
      select: {
        reviewId: true,
        userId: true,
        productId: true,
        rating: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
        user: {
          userId: true,
          name: true,
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }


  async updateReview(
    userId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ) {
    if (dto.rating === undefined && dto.comment === undefined) {
      throw new BadRequestException(
        'Provide a rating or comment to update',
      );
    }

    const review = await this.reviewRepository.findOne({
      where: { reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException(
        'You can only update your own reviews',
      );
    }

    if (dto.rating !== undefined) {
      review.rating = dto.rating;
    }

    if (dto.comment !== undefined) {
      review.comment = dto.comment;
    }

    return this.reviewRepository.save(review);
  }

  
  async deleteReview(
    userId: string,
    reviewId: string,
  ) {
    const review = await this.reviewRepository.findOne({
      where: { reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException(
        'You can only delete your own reviews',
      );
    }

    await this.reviewRepository.remove(review);

    return {
      message: 'Review deleted successfully',
    };
  }
}
