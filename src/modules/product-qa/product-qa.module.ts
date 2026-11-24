
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductQuestion } from './entities/product-question.entity';
import { ProductAnswer } from './entities/product-answer.entity';
import { ProductAnswerVote } from './entities/product-answer-vote.entity';

import { Product } from '../products/entities/product.entity';

import { ProductQaService } from './product-qa.service';
import { ProductQaController } from './product-qa.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductQuestion,
      ProductAnswer,
      ProductAnswerVote,
      Product,
    ]),
  ],
  controllers: [ProductQaController],
  providers: [ProductQaService],
  exports: [ProductQaService],
})
export class ProductQaModule {}
