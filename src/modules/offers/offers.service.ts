
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Offer, OfferStatus } from './entities/offer.entity';
import { Seller, SellerStatus } from '../sellers/entities/seller.entity';
import { Product, ProductStatus } from '../products/entities/product.entity';

import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { UpdateStockDto } from './dto/update-stock.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private readonly offerRepository: Repository<Offer>,

    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}


  async getAllOffers() {
    return this.offerRepository.find({
      where: { status: OfferStatus.ACTIVE },
      relations: ['seller', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  
  async getOfferById(offerId: string) {
    const offer = await this.offerRepository.findOne({
      where: {
        offerId,
        status: OfferStatus.ACTIVE,
      },
      relations: ['seller', 'product'],
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return offer;
  }


  async createOffer(userId: string, dto: CreateOfferDto) {
    const seller = await this.sellerRepository.findOne({
      where: { userId },
    });

    if (!seller || seller.status !== SellerStatus.APPROVED) {
      throw new ForbiddenException(
        'Only approved sellers can create offers',
      );
    }

    const product = await this.productRepository.findOne({
      where: {
        productId: dto.productId,
        sellerId: seller.sellerId,
        status: ProductStatus.ACTIVE,
      },
    });

    if (!product) {
      throw new NotFoundException(
        'Active product not found or you do not own this product',
      );
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException(
        'Offer end date must be after start date',
      );
    }

    const offer = this.offerRepository.create({
      sellerId: seller.sellerId,
      productId: product.productId,
      title: dto.title,
      description: dto.description ?? null,
      discountPercentage: dto.discountPercentage.toFixed(2),
      startDate,
      endDate,
      stockQuantity: dto.stockQuantity ?? 0,
      status: OfferStatus.ACTIVE,
    });

    return this.offerRepository.save(offer);
  }

  
  async updateOffer(
    offerId: string,
    userId: string,
    dto: UpdateOfferDto,
  ) {
    const offer = await this.offerRepository.findOne({
      where: { offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const seller = await this.sellerRepository.findOne({
      where: { userId },
    });

    if (!seller || offer.sellerId !== seller.sellerId) {
      throw new ForbiddenException(
        'You cannot update this offer',
      );
    }

    if (offer.status === OfferStatus.EXPIRED) {
      throw new BadRequestException(
        'Expired offers cannot be updated',
      );
    }

    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : offer.startDate;

    const endDate = dto.endDate
      ? new Date(dto.endDate)
      : offer.endDate;

    if (endDate <= startDate) {
      throw new BadRequestException(
        'Offer end date must be after start date',
      );
    }

    if (dto.title !== undefined) offer.title = dto.title;
    if (dto.description !== undefined) {
      offer.description = dto.description;
    }
    if (dto.discountPercentage !== undefined) {
      offer.discountPercentage =
        dto.discountPercentage.toFixed(2);
    }
    if (dto.startDate !== undefined) {
      offer.startDate = startDate;
    }
    if (dto.endDate !== undefined) {
      offer.endDate = endDate;
    }
    if (dto.stockQuantity !== undefined) {
      offer.stockQuantity = dto.stockQuantity;
    }
    if (dto.status !== undefined) {
      offer.status = dto.status;
    }

    return this.offerRepository.save(offer);
  }

  
  async deleteOffer(offerId: string, userId: string) {
    const offer = await this.offerRepository.findOne({
      where: { offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const seller = await this.sellerRepository.findOne({
      where: { userId },
    });

    if (!seller || offer.sellerId !== seller.sellerId) {
      throw new ForbiddenException(
        'You cannot deactivate this offer',
      );
    }

    offer.status = OfferStatus.INACTIVE;

    await this.offerRepository.save(offer);

    return {
      message: 'Offer deactivated successfully',
      offerId: offer.offerId,
    };
  }


  async updateStock(
    offerId: string,
    userId: string,
    dto: UpdateStockDto,
  ) {
    const offer = await this.offerRepository.findOne({
      where: { offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const seller = await this.sellerRepository.findOne({
      where: { userId },
    });

    if (!seller || offer.sellerId !== seller.sellerId) {
      throw new ForbiddenException(
        'You cannot update this offer stock',
      );
    }

    if (offer.status !== OfferStatus.ACTIVE) {
      throw new BadRequestException(
        'Stock can only be updated for active offers',
      );
    }

    offer.stockQuantity = dto.stockQuantity;

    const updatedOffer = await this.offerRepository.save(offer);

    return {
      message: 'Offer stock updated successfully',
      offerId: updatedOffer.offerId,
      stockQuantity: updatedOffer.stockQuantity,
    };
  }
}
