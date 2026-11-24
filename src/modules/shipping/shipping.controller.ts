
import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Req,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { Request } from 'express';

import { ShippingService } from './shipping.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    roles?: string[];
  };
}

@Controller('shipping')
@UseGuards(JwtAuthGuard)
export class ShippingController {
  constructor(
    private readonly shippingService: ShippingService,
  ) {}

  @Post()
  createShipment(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateShipmentDto,
  ) {
    return this.shippingService.createShipment(
      req.user.userId,
      dto,
    );
  }

  @Get(':id')
  getShipmentById(
    @Param('id', ParseUUIDPipe) shipmentId: string,
  ) {
    return this.shippingService.getShipmentById(shipmentId);
  }

  @Get('orders/:orderId')
  getShipmentByOrder(
    @Req() req: AuthenticatedRequest,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ) {
    return this.shippingService.getShipmentByOrder(
      req.user.userId,
      orderId,
    );
  }


  @Patch(':id/status')
  @UseGuards(AdminGuard)
  updateShipmentStatus(
    @Param('id', ParseUUIDPipe) shipmentId: string,
    @Body() dto: UpdateShipmentStatusDto,
  ) {
    return this.shippingService.updateShipmentStatus(
      shipmentId,
      dto,
    );
  }


  @Get()
  getUserShipments(@Req() req: AuthenticatedRequest) {
    return this.shippingService.getUserShipments(
      req.user.userId,
    );
  }


  @Get('tracking/:trackingNumber')
  trackShipment(
    @Param('trackingNumber') trackingNumber: string,
  ) {
    return this.shippingService.trackShipment(trackingNumber);
  }
}
