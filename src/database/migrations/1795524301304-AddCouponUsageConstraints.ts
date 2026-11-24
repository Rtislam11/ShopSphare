
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCouponUsageConstraints1795524301304
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE coupons
      ADD CONSTRAINT chk_coupon_usage_count_non_negative
      CHECK (usage_count >= 0)
    `);

    await queryRunner.query(`
      ALTER TABLE coupons
      ADD CONSTRAINT chk_coupon_per_user_limit_positive
      CHECK (per_user_limit >= 1)
    `);

    await queryRunner.query(`
      ALTER TABLE coupons
      ADD CONSTRAINT chk_coupon_usage_limit_non_negative
      CHECK (usage_limit IS NULL OR usage_limit >= 0)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE coupons
      DROP CONSTRAINT chk_coupon_usage_limit_non_negative
    `);

    await queryRunner.query(`
      ALTER TABLE coupons
      DROP CONSTRAINT chk_coupon_per_user_limit_positive
    `);

    await queryRunner.query(`
      ALTER TABLE coupons
      DROP CONSTRAINT chk_coupon_usage_count_non_negative
    `);
  }
}
