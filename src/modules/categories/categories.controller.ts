
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

import { Public } from '@/common/decorators/public.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  @Public()
  getAllCategories() {
    return this.categoriesService.getAllCategories();
  }

  @Get(':id')
  @Public()
  getCategoryById(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.categoriesService.getCategoryById(id);
  }


  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  createCategory(
    @Body() dto: CreateCategoryDto,
  ) {
    return this.categoriesService.createCategory(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  updateCategory(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoriesService.updateCategory(id, dto);
  }
}
