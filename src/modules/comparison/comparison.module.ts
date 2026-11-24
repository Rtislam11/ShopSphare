
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Offer } from '../offers/entities/offer.entity';

import { ComparisonController } from './comparison.controller';
import { ComparisonService } from './comparison.service';

@Module({
  imports: [TypeOrmModule.forFeature([Offer])],
  controllers: [ComparisonController],
  providers: [ComparisonService],
  exports: [ComparisonService],
})
export class ComparisonModule {}
