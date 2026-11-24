
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Request } from 'express';

import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}


  @Post()
  @UseGuards(JwtAuthGuard)
  createReview(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(
      req.user.userId,
      dto,
    );
  }


  @Get('product/:productId')
  getProductReviews(
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.reviewsService.getProductReviews(productId);
  }


  @Get(':id')
  getReviewById(
    @Param('id', ParseUUIDPipe) reviewId: string,
  ) {
    return this.reviewsService.getReviewById(reviewId);
  }


  @Put(':id')
  @UseGuards(JwtAuthGuard)
  updateReview(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) reviewId: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.updateReview(
      req.user.userId,
      reviewId,
      dto,
    );
  }


  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  deleteReview(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) reviewId: string,
  ) {
    return this.reviewsService.deleteReview(
      req.user.userId,
      reviewId,
    );
  }
}
