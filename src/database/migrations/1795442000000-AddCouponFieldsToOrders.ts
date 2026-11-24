
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCouponFieldsToOrders1795442000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN "coupon_code" varchar(50),
      ADD COLUMN "discount_amount" decimal(12,2) NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "orders"
      DROP COLUMN "coupon_code",
      DROP COLUMN "discount_amount"
    `);
  }
}
