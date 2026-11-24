
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailsService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(
    to: string,
    subject: string,
    text: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to,
        subject,
        text,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

async sendTestEmail(to: string): Promise<void> {
  await this.sendEmail(
    to,
    'ShopSphere Email Test',
    'Congratulations! Your ShopSphere email service is working.',
  );
}

}
