
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Offer } from './entities/offer.entity';
import { Seller } from '../sellers/entities/seller.entity';
import { Product } from '../products/entities/product.entity';

import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      Seller,
      Product,
    ]),
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
