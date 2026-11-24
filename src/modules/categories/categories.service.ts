
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';

import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // 1. Get all active categories
  async getAllCategories() {
    return this.categoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  // 2. Get category details
  async getCategoryById(categoryId: string) {
    const category = await this.categoryRepository.findOne({
      where: {
        categoryId,
        isActive: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  // 3. Create category
  async createCategory(dto: CreateCategoryDto) {
    const name = dto.name.trim();

    const existingCategory = await this.categoryRepository.findOne({
      where: {
        name: ILike(name),
      },
    });

    if (existingCategory) {
      throw new ConflictException(
        'Category name already exists',
      );
    }

    const category = this.categoryRepository.create({
      name,
      description: dto.description?.trim() ?? null,
      imageUrl: dto.imageUrl ?? null,
      isActive: true,
    });

    const savedCategory = await this.categoryRepository.save(category);

    return {
      message: 'Category created successfully',
      category: savedCategory,
    };
  }

  // 4. Update category
  async updateCategory(
    categoryId: string,
    dto: UpdateCategoryDto,
  ) {
    const category = await this.categoryRepository.findOne({
      where: { categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'At least one field is required',
      );
    }

    if (dto.name !== undefined) {
      const name = dto.name.trim();

      const existingCategory = await this.categoryRepository.findOne({
        where: {
          name: ILike(name),
          categoryId: Not(categoryId),
        },
      });

      if (existingCategory) {
        throw new ConflictException(
          'Category name already exists',
        );
      }

      category.name = name;
    }

    if (dto.description !== undefined) {
      category.description = dto.description.trim();
    }

    if (dto.imageUrl !== undefined) {
      category.imageUrl = dto.imageUrl;
    }

    if (dto.isActive !== undefined) {
      category.isActive = dto.isActive;
    }

    const updatedCategory = await this.categoryRepository.save(category);

    return {
      message: 'Category updated successfully',
      category: updatedCategory,
    };
  }
}
