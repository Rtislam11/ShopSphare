
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCouponsTable1795440000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "coupons_discount_type_enum" AS ENUM (
        'PERCENTAGE',
        'FIXED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "coupons" (
        "coupon_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "code" varchar(50) NOT NULL,
        "description" text,
        "discount_type" "coupons_discount_type_enum" NOT NULL,
        "discount_value" decimal(10,2) NOT NULL,
        "minimum_order_amount" decimal(12,2) NOT NULL DEFAULT 0,
        "maximum_discount" decimal(12,2),
        "usage_limit" integer,
        "usage_count" integer NOT NULL DEFAULT 0,
        "per_user_limit" integer NOT NULL DEFAULT 1,
        "starts_at" TIMESTAMP NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_coupons" PRIMARY KEY ("coupon_id"),
        CONSTRAINT "UQ_coupons_code" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_coupons_code"
      ON "coupons" ("code")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_coupons_code"`);
    await queryRunner.query(`DROP TABLE "coupons"`);
    await queryRunner.query(
      `DROP TYPE "coupons_discount_type_enum"`,
    );
  }
}
