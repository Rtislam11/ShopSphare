import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Product } from '../products/entities/product.entity';

import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,

    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  
  private async getOrCreateCart(userId: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId },
    });

    if (!cart) {
      cart = this.cartRepository.create({ userId });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }


  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    return this.cartRepository.findOne({
      where: { cartId: cart.cartId },
      relations: {
        items: {
          product: true,
        },
      },
    });
  }

  
  async addItem(userId: string, dto: AddCartItemDto) {
    const product = await this.productRepository.findOne({
      where: {
        productId: dto.productId,
        status: 'ACTIVE' as any,
      },
    });

    if (!product) {
      throw new NotFoundException('Active product not found');
    }

    if (dto.quantity > product.stockQuantity) {
      throw new BadRequestException('Requested quantity exceeds available stock');
    }

    const cart = await this.getOrCreateCart(userId);

    let cartItem = await this.cartItemRepository.findOne({
      where: {
        cartId: cart.cartId,
        productId: product.productId,
      },
    });

    if (cartItem) {
      const newQuantity = cartItem.quantity + dto.quantity;

      if (newQuantity > product.stockQuantity) {
        throw new BadRequestException('Requested quantity exceeds available stock');
      }

      cartItem.quantity = newQuantity;
    } else {
      cartItem = this.cartItemRepository.create({
        cartId: cart.cartId,
        productId: product.productId,
        quantity: dto.quantity,
      });
    }

    return this.cartItemRepository.save(cartItem);
  }

  
  async updateItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
  ) {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.cartItemRepository.findOne({
      where: {
        cartItemId: itemId,
        cartId: cart.cartId,
      },
      relations: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity > cartItem.product.stockQuantity) {
      throw new BadRequestException('Requested quantity exceeds available stock');
    }

    cartItem.quantity = dto.quantity;

    return this.cartItemRepository.save(cartItem);
  }


  async removeItem(userId: string, itemId: string) {
    const cart = await this.getOrCreateCart(userId);

    const cartItem = await this.cartItemRepository.findOne({
      where: {
        cartItemId: itemId,
        cartId: cart.cartId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.cartItemRepository.remove(cartItem);

    return {
      message: 'Cart item removed successfully',
    };
  }

  
  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    await this.cartItemRepository.delete({
      cartId: cart.cartId,
    });

    return {
      message: 'Cart cleared successfully',
    };
  }
}