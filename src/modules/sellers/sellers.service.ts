import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Seller, SellerStatus } from './entities/seller.entity';
import { ApplySellerDto } from './dto/apply-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';

@Injectable()
export class SellersService {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,
  ) {}

  // 1. Apply for seller account
  async apply(userId: string, dto: ApplySellerDto) {
    const existingSeller = await this.sellerRepository.findOne({
      where: { userId },
    });

    if (existingSeller) {
      throw new ConflictException(
        'You have already submitted a seller application',
      );
    }

    const seller = this.sellerRepository.create({
      userId,
      businessName: dto.businessName.trim(),
      businessDescription: dto.businessDescription?.trim() ?? null,
      businessEmail: dto.businessEmail.trim().toLowerCase(),
      businessPhone: dto.businessPhone.trim(),
      businessAddress: dto.businessAddress.trim(),
      status: SellerStatus.PENDING,
      reliabilityScore: 0,
    });

    const savedSeller = await this.sellerRepository.save(seller);

    return {
      message: 'Seller application submitted successfully',
      seller: {
        sellerId: savedSeller.sellerId,
        businessName: savedSeller.businessName,
        status: savedSeller.status,
      },
    };
  }

  // 2. Get seller profile
  async getProfile(userId: string) {
    const seller = await this.sellerRepository.findOne({
      where: { userId },
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }

    return seller;
  }

  // 3. Update seller profile
  async updateProfile(userId: string, dto: UpdateSellerDto) {
    const seller = await this.sellerRepository.findOne({
      where: { userId },
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }

    if (seller.status === SellerStatus.REJECTED) {
      throw new ForbiddenException(
        'Rejected seller profiles cannot be updated',
      );
    }

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'At least one field is required',
      );
    }

    if (dto.businessName !== undefined) {
      seller.businessName = dto.businessName.trim();
    }

    if (dto.businessDescription !== undefined) {
      seller.businessDescription = dto.businessDescription.trim();
    }

    if (dto.businessEmail !== undefined) {
      seller.businessEmail = dto.businessEmail.trim().toLowerCase();
    }

    if (dto.businessPhone !== undefined) {
      seller.businessPhone = dto.businessPhone.trim();
    }

    if (dto.businessAddress !== undefined) {
      seller.businessAddress = dto.businessAddress.trim();
    }

    const updatedSeller = await this.sellerRepository.save(seller);

    return {
      message: 'Seller profile updated successfully',
      seller: updatedSeller,
    };
  }

  // 4. View seller details
  async getSellerById(sellerId: string) {
    const seller = await this.sellerRepository.findOne({
      where: {
        sellerId,
        status: SellerStatus.APPROVED,
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return {
      sellerId: seller.sellerId,
      businessName: seller.businessName,
      businessDescription: seller.businessDescription,
      reliabilityScore: seller.reliabilityScore,
      status: seller.status,
    };
  }

  // 5. Get seller reliability
  async getReliability(sellerId: string) {
    const seller = await this.sellerRepository.findOne({
      where: {
        sellerId,
        status: SellerStatus.APPROVED,
      },
    });

    if (!seller) {
      throw new NotFoundException('Approved seller not found');
    }

    return {
      sellerId: seller.sellerId,
      businessName: seller.businessName,
      reliabilityScore: seller.reliabilityScore,
    };
  }
}