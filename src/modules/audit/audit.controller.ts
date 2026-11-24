
import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../admin/guards/admin.guard';

@Controller('audit')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  getAllAuditLogs() {
    return this.auditService.findAll();
  }

  @Get('user/:userId')
  getUserAuditLogs(@Param('userId') userId: string) {
    return this.auditService.findByUser(userId);
  }
}
