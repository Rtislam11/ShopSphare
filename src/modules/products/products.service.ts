
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';

import { Product, ProductStatus } from './entities/product.entity';
import { Seller, SellerStatus } from '../sellers/entities/seller.entity';
import { Category } from '../categories/entities/category.entity';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Seller)
    private readonly sellerRepository: Repository<Seller>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  
  async getAllProducts() {
    return this.productRepository.find({
      where: { status: ProductStatus.ACTIVE },
      relations: ['seller', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  
  async getProductById(productId: string) {
    const product = await this.productRepository.findOne({
      where: {
        productId,
        status: ProductStatus.ACTIVE,
      },
      relations: ['seller', 'category'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  
  async createProduct(userId: string, dto: CreateProductDto) {
    const seller = await this.sellerRepository.findOne({
      where: { userId },
    });

    if (!seller) {
      throw new ForbiddenException('You must have a seller profile');
    }

    if (seller.status !== SellerStatus.APPROVED) {
      throw new ForbiddenException('Your seller account is not approved');
    }

    const category = await this.categoryRepository.findOne({
      where: {
        categoryId: dto.categoryId,
        isActive: true,
      },
    });

    if (!category) {
      throw new BadRequestException('Invalid or inactive category');
    }

    const product = this.productRepository.create({
      sellerId: seller.sellerId,
      categoryId: category.categoryId,
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price.toFixed(2),
      stockQuantity: dto.stockQuantity ?? 0,
      imageUrl: dto.imageUrl ?? null,
      status: ProductStatus.ACTIVE,
    });

    return this.productRepository.save(product);
  }

  async updateProduct(
    productId: string,
    userId: string,
    dto: UpdateProductDto,
  ) {
    const product = await this.productRepository.findOne({
      where: { productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const seller = await this.sellerRepository.findOne({
      where: { userId },
    });

    if (!seller || product.sellerId !== seller.sellerId) {
      throw new ForbiddenException('You cannot update this product');
    }

    if (product.status === ProductStatus.DELETED) {
      throw new BadRequestException('Deleted products cannot be updated');
    }

    if (dto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: {
          categoryId: dto.categoryId,
          isActive: true,
        },
      });

      if (!category) {
        throw new BadRequestException('Invalid or inactive category');
      }

      product.categoryId = category.categoryId;
    }

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.price !== undefined) product.price = dto.price.toFixed(2);
    if (dto.stockQuantity !== undefined) {
      product.stockQuantity = dto.stockQuantity;
    }
    if (dto.imageUrl !== undefined) product.imageUrl = dto.imageUrl;
    if (dto.status !== undefined) product.status = dto.status;

    return this.productRepository.save(product);
  }

  
  async deleteProduct(productId: string, userId: string) {
    const product = await this.productRepository.findOne({
      where: { productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const seller = await this.sellerRepository.findOne({
      where: { userId },
    });

    if (!seller || product.sellerId !== seller.sellerId) {
      throw new ForbiddenException('You cannot delete this product');
    }

    product.status = ProductStatus.INACTIVE;

    await this.productRepository.save(product);

    return {
      message: 'Product deactivated successfully',
      productId: product.productId,
    };
  }

  
  async searchProducts(dto: SearchProductDto) {
    if (
      dto.minPrice !== undefined &&
      dto.maxPrice !== undefined &&
      dto.minPrice > dto.maxPrice
    ) {
      throw new BadRequestException(
        'Minimum price cannot be greater than maximum price',
      );
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.seller', 'seller')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.status = :status', {
        status: ProductStatus.ACTIVE,
      });

    if (dto.name) {
      queryBuilder.andWhere('product.name ILIKE :name', {
        name: `%${dto.name}%`,
      });
    }

    if (dto.categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', {
        categoryId: dto.categoryId,
      });
    }

    if (dto.minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', {
        minPrice: dto.minPrice,
      });
    }

    if (dto.maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', {
        maxPrice: dto.maxPrice,
      });
    }

    const [products, total] = await queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
