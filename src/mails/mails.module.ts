
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { MailsService } from './mails.service';
import { MailsController } from './mails.controller';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        transport: {
          host: process.env.MAILER_HOST,
          port: Number(process.env.MAILER_PORT) || 587,
          secure: Number(process.env.MAILER_PORT) === 465,
          auth: {
            user: process.env.MAILER_USER,
            pass: process.env.MAILER_PASSWORD,
          },
        },
        defaults: {
          from: process.env.MAILER_FROM,
        },
      }),
    }),
  ],
  controllers: [MailsController],
  providers: [MailsService],
  exports: [MailsService],
})
export class MailsModule {}
