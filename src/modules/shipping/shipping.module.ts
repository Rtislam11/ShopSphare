
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Shipment } from './entities/shipment.entity';
import { Order } from '../orders/entities/order.entity';

import { ShippingController } from './shipping.controller';
import { ShippingService } from './shipping.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Shipment,
      Order,
    ]),
  ],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
