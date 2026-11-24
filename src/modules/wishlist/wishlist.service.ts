
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Product, ProductStatus } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { AddWishlistItemDto } from './dto/add-wishlist-item.dto';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,

    @InjectRepository(WishlistItem)
    private readonly wishlistItemRepository: Repository<WishlistItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // Find existing wishlist or create a new one
  private async getOrCreateWishlist(userId: string) {
    let wishlist = await this.wishlistRepository.findOne({
      where: {
        user: { userId },
      },
    });

    if (!wishlist) {
      wishlist = this.wishlistRepository.create({
        user: { userId } as User,
      });

      wishlist = await this.wishlistRepository.save(wishlist);
    }

    return wishlist;
  }

  // GET /wishlist
  async getWishlist(userId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    return this.wishlistRepository.findOne({
      where: {
        wishlistId: wishlist.wishlistId,
      },
      relations: {
        items: {
          product: true,
        },
      },
    });
  }

  // POST /wishlist/items
  async addItem(userId: string, dto: AddWishlistItemDto) {
    const product = await this.productRepository.findOne({
      where: {
        productId: dto.productId,
        status: ProductStatus.ACTIVE,
      },
    });

    if (!product) {
      throw new NotFoundException('Active product not found');
    }

    const wishlist = await this.getOrCreateWishlist(userId);

    const existingItem = await this.wishlistItemRepository.findOne({
      where: {
        wishlist: {
          wishlistId: wishlist.wishlistId,
        },
        productId: dto.productId,
      },
    });

    if (existingItem) {
      throw new ConflictException(
        'Product is already in your wishlist',
      );
    }

    const item = this.wishlistItemRepository.create({
      wishlist,
      product,
      productId: product.productId,
    });

    const savedItem = await this.wishlistItemRepository.save(item);

    return {
      message: 'Product added to wishlist successfully',
      item: savedItem,
    };
  }

  // DELETE /wishlist/items/:id
  async removeItem(userId: string, itemId: string) {
    const item = await this.wishlistItemRepository.findOne({
      where: {
        wishlistItemId: itemId,
        wishlist: {
          user: { userId },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(
        'Wishlist item not found',
      );
    }

    await this.wishlistItemRepository.remove(item);

    return {
      message: 'Product removed from wishlist successfully',
    };
  }

  // DELETE /wishlist
  async clearWishlist(userId: string) {
    const wishlist = await this.wishlistRepository.findOne({
      where: {
        user: { userId },
      },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    await this.wishlistItemRepository.delete({
      wishlist: {
        wishlistId: wishlist.wishlistId,
      },
    });

    return {
      message: 'Wishlist cleared successfully',
    };
  }
}
