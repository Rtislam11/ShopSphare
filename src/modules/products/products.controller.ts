
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Req,
} from '@nestjs/common';

import { Request } from 'express';
import { UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SearchProductDto } from './dto/search-product.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '@/common/decorators/public.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
  ) {}
  @UseInterceptors(TransformInterceptor)
  @Get()
  @Public()
  getAllProducts() {
    return this.productsService.getAllProducts();
  }

  @Get('search')
  @Public()
  searchProducts(@Query() dto: SearchProductDto) {
    return this.productsService.searchProducts(dto);
  }

  @Get(':id')
  @Public()
  getProductById(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.productsService.getProductById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createProduct(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateProductDto,
  ) {
    return this.productsService.createProduct(
      req.user.userId,
      dto,
    );
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(
      id,
      req.user.userId,
      dto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productsService.deleteProduct(
      id,
      req.user.userId,
    );
  }
}
