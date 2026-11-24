
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Request } from 'express';

import { ProductQaService } from './product-qa.service';

import { CreateProductQuestionDto } from './dto/create-product-question.dto';
import { CreateProductAnswerDto } from './dto/create-product-answer.dto';
import { ModerateProductQuestionDto } from './dto/moderate-product-question.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    roles: string[];
  };
}

@Controller('product-qa')
export class ProductQaController {
  constructor(
    private readonly productQaService: ProductQaService,
  ) {}

  @Post(':productId/questions')
  @UseGuards(JwtAuthGuard)
  createQuestion(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateProductQuestionDto,
  ) {
    return this.productQaService.createQuestion(
      productId,
      req.user.userId,
      dto,
    );
  }

  @Get(':productId/questions')
  getProductQuestions(
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.productQaService.getProductQuestions(productId);
  }

  @Get('questions/:id')
  getQuestionById(
    @Param('id', ParseUUIDPipe) questionId: string,
  ) {
    return this.productQaService.getQuestionById(questionId);
  }

  @Post('questions/:id/answers')
  @UseGuards(JwtAuthGuard)
  createAnswer(
    @Param('id', ParseUUIDPipe) questionId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateProductAnswerDto,
  ) {
    return this.productQaService.createAnswer(
      questionId,
      req.user.userId,
      dto,
    );
  }

  @Put('answers/:id')
  @UseGuards(JwtAuthGuard)
  updateAnswer(
    @Param('id', ParseUUIDPipe) answerId: string,
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateProductAnswerDto,
  ) {
    return this.productQaService.updateAnswer(
      answerId,
      req.user.userId,
      dto,
    );
  }

  @Delete('questions/:id')
  @UseGuards(JwtAuthGuard)
  deleteQuestion(
    @Param('id', ParseUUIDPipe) questionId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productQaService.deleteQuestion(
      questionId,
      req.user.userId,
    );
  }


  @Delete('answers/:id')
  @UseGuards(JwtAuthGuard)
  deleteAnswer(
    @Param('id', ParseUUIDPipe) answerId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productQaService.deleteAnswer(
      answerId,
      req.user.userId,
    );
  }

  @Patch('questions/:id/moderate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  moderateQuestion(
    @Param('id', ParseUUIDPipe) questionId: string,
    @Body() dto: ModerateProductQuestionDto,
  ) {
    return this.productQaService.moderateQuestion(
      questionId,
      dto,
    );
  }

  @Post('answers/:id/helpful')
  @UseGuards(JwtAuthGuard)
  markAnswerHelpful(
    @Param('id', ParseUUIDPipe) answerId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.productQaService.markAnswerHelpful(
      answerId,
      req.user.userId,
    );
  }
}
