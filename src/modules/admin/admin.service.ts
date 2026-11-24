
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Seller,
  SellerStatus,
} from '../sellers/entities/seller.entity';

import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateSellerApprovalDto } from './dto/update-seller-approval.dto';
import { UpdateProductModerationDto } from './dto/update-product-moderation.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

 
  async getAllUsers() {
    return this.userRepository.find({
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

async updateUserStatus(
  userId: string,
  dto: UpdateUserStatusDto,
  adminUserId: string,
) {
  if (
    userId === adminUserId &&
    dto.status === 'INACTIVE'
  ) {
    throw new BadRequestException(
      'You cannot deactivate your own admin account',
    );
  }

  const user = await this.userRepository.findOne({
    where: { userId },
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  user.status = dto.status;

  return this.userRepository.save(user);
}

 
  async getPendingSellers() {
    return this.sellerRepository.find({
      where: {
        status: SellerStatus.PENDING,
      },
      select: [
        'sellerId',
        'userId',
        'businessName',
        'businessEmail',
        'businessPhone',
        'businessAddress',
        'status',
        'createdAt',
      ],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async updateSellerApproval(
    sellerId: string,
    dto: UpdateSellerApprovalDto,
  ) {
    const seller = await this.sellerRepository.findOne({
      where: { sellerId },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    if (seller.status !== SellerStatus.PENDING) {
      throw new BadRequestException(
        'Only pending applications can be approved or rejected',
      );
    }

    seller.status = dto.status;

    return this.sellerRepository.save(seller);
  }

  
  async approveSeller(sellerId: string) {
    const seller = await this.sellerRepository.findOne({
      where: { sellerId },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    if (seller.status !== SellerStatus.PENDING) {
      throw new BadRequestException(
        'Only pending applications can be approved',
      );
    }

    seller.status = SellerStatus.APPROVED;

    const updatedSeller = await this.sellerRepository.save(seller);

    return {
      message: 'Seller approved successfully',
      seller: {
        sellerId: updatedSeller.sellerId,
        businessName: updatedSeller.businessName,
        status: updatedSeller.status,
      },
    };
  }

  
  async rejectSeller(sellerId: string) {
    const seller = await this.sellerRepository.findOne({
      where: { sellerId },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    if (seller.status !== SellerStatus.PENDING) {
      throw new BadRequestException(
        'Only pending applications can be rejected',
      );
    }

    seller.status = SellerStatus.REJECTED;

    const updatedSeller = await this.sellerRepository.save(seller);

    return {
      message: 'Seller application rejected',
      seller: {
        sellerId: updatedSeller.sellerId,
        businessName: updatedSeller.businessName,
        status: updatedSeller.status,
      },
    };
  }


  async getAllProducts() {
    return this.productRepository.find({
      relations: {
        seller: true,
        category: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  
  async updateProductModeration(
    productId: string,
    dto: UpdateProductModerationDto,
  ) {
    const product = await this.productRepository.findOne({
      where: { productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    product.status = dto.status;

    return this.productRepository.save(product);
  }
}
