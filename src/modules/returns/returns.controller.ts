
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

import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { UpdateReturnStatusDto } from './dto/update-return-status.dto';
import { ProcessRefundDto } from './dto/process-refund.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    roles?: string[];
  };
}

@Controller('returns')
@UseGuards(JwtAuthGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}


  @Post()
  createReturn(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateReturnDto,
  ) {
    return this.returnsService.createReturn(req.user.userId, dto);
  }

  @Get()
  getMyReturns(@Req() req: AuthenticatedRequest) {
    return this.returnsService.getMyReturns(req.user.userId);
  }


  @Get(':id')
  getReturnById(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.returnsService.getReturnById(req.user.userId, id);
  }


  @Patch(':id/cancel')
  cancelReturn(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.returnsService.cancelReturn(req.user.userId, id);
  }


  @Patch(':id/status')
  @UseGuards(AdminGuard)
  updateReturnStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReturnStatusDto,
  ) {
    return this.returnsService.updateReturnStatus(id, dto);
  }


  @Post(':id/refund')
  @UseGuards(AdminGuard)
  processRefund(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ProcessRefundDto,
  ) {
    return this.returnsService.processRefund(id, dto);
  }
}
