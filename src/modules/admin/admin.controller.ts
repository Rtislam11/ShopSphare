import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    roles?: string[];
  };
}
import { AdminService } from './admin.service';

import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { UpdateSellerApprovalDto } from './dto/update-seller-approval.dto';
import { UpdateProductModerationDto } from './dto/update-product-moderation.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}


  @Get('users')
  getAllUsers() {
    return this.adminService.getAllUsers();
  }

@Patch('users/:id/status')
updateUserStatus(
  @Param('id') userId: string,
  @Body() dto: UpdateUserStatusDto,
  @Req() req: AuthenticatedRequest,
) {
  return this.adminService.updateUserStatus(
    userId,
    dto,
    req.user.userId,
  );
}


  @Get('sellers/pending')
  getPendingSellers() {
    return this.adminService.getPendingSellers();
  }


  @Patch('sellers/:id/approval')
  updateSellerApproval(
    @Param('id') sellerId: string,
    @Body() dto: UpdateSellerApprovalDto,
  ) {
    return this.adminService.updateSellerApproval(sellerId, dto);
  }

  @Get('products')
  getAllProducts() {
    return this.adminService.getAllProducts();
  }

  @Patch('products/:id/moderation')
  updateProductModeration(
    @Param('id') productId: string,
    @Body() dto: UpdateProductModerationDto,
  ) {
    return this.adminService.updateProductModeration(productId, dto);
  }
}