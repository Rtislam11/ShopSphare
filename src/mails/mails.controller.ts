
import {
  Controller,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import { IsEmail } from 'class-validator';
import { MailsService } from './mails.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';

class SendTestEmailDto {
  @IsEmail()
  to!: string;
}

@Controller('mails')
@UseGuards(JwtAuthGuard)
export class MailsController {
  constructor(private readonly mailsService: MailsService) {}

  @Post('test')
  async sendTestEmail(@Body() dto: SendTestEmailDto) {
    await this.mailsService.sendTestEmail(dto.to);

    return {
      message: 'Test email sent successfully',
    };
  }
}
