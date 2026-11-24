
import {
  Module,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';

import { AdminModule } from './modules/admin/admin.module';
import { PostgresDatabaseProviderModule } from '@/providers/database/postgres/provider.module';
import { RedisCacheModule } from '@/providers/cache/redis/redis-cache.module';
import { SellersModule } from './modules/sellers/sellers.module';

import { AppController } from '@/src/app.controller';
import { AppService } from '@/src/app.service';
import { AuditModule } from './modules/audit/audit.module';
import global_config from '@/config/global_config';
import { MailsModule } from './mails/mails.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { OffersModule } from './modules/offers/offers.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ComparisonModule } from './modules/comparison/comparison.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ShippingModule } from './modules/shipping/shipping.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { SupportModule } from './modules/support/support.module';
import { ProductQaModule } from './modules/product-qa/product-qa.module';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [global_config],
    }),

    PostgresDatabaseProviderModule,
    RedisCacheModule,
    AuthModule,
    UsersModule,
    SellersModule,
    AdminModule,
    CategoriesModule,
    ProductsModule,
    OffersModule,
    CartModule,
    OrdersModule,
    ComparisonModule,
    WishlistModule,
    ReviewsModule,
    NotificationsModule,
    ShippingModule,
    ReturnsModule,
    CouponsModule,
    SupportModule,
    ProductQaModule,
    MailsModule,
    AuditModule,
    BullModule.forRoot({
      url: process.env.REDIS_URL,
    }),
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
