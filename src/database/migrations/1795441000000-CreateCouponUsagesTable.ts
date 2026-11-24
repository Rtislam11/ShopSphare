
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCouponUsagesTable1795441000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "coupon_usages" (
        "usage_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "coupon_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "order_id" uuid NOT NULL,
        "used_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_coupon_usages" PRIMARY KEY ("usage_id"),
        CONSTRAINT "UQ_coupon_usages_order" UNIQUE ("order_id"),
        CONSTRAINT "FK_coupon_usages_coupon" FOREIGN KEY ("coupon_id")
          REFERENCES "coupons"("coupon_id") ON DELETE RESTRICT,
        CONSTRAINT "FK_coupon_usages_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("user_id") ON DELETE RESTRICT,
        CONSTRAINT "FK_coupon_usages_order" FOREIGN KEY ("order_id")
          REFERENCES "orders"("order_id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_coupon_usages_coupon_user"
      ON "coupon_usages" ("coupon_id", "user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_coupon_usages_coupon_user"`);
    await queryRunner.query(`DROP TABLE "coupon_usages"`);
  }
}
