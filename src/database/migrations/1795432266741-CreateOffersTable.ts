
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOffersTable1795432266741
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "offer_status_enum" AS ENUM (
        'ACTIVE',
        'INACTIVE',
        'EXPIRED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "offers" (
        "offer_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "seller_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "title" varchar(200) NOT NULL,
        "description" text,
        "discount_percentage" decimal(5,2) NOT NULL,
        "start_date" TIMESTAMP NOT NULL,
        "end_date" TIMESTAMP NOT NULL,
        "stock_quantity" integer NOT NULL DEFAULT 0,
        "status" "offer_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_offers"
          PRIMARY KEY ("offer_id"),

        CONSTRAINT "FK_offers_seller"
          FOREIGN KEY ("seller_id")
          REFERENCES "sellers"("seller_id")
          ON DELETE RESTRICT,

        CONSTRAINT "FK_offers_product"
          FOREIGN KEY ("product_id")
          REFERENCES "products"("product_id")
          ON DELETE RESTRICT,

        CONSTRAINT "CHK_offer_discount"
          CHECK ("discount_percentage" > 0 AND "discount_percentage" <= 100),

        CONSTRAINT "CHK_offer_dates"
          CHECK ("end_date" > "start_date"),

        CONSTRAINT "CHK_offer_stock"
          CHECK ("stock_quantity" >= 0)
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_offers_title"
      ON "offers" ("title")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_offers_title"`);
    await queryRunner.query(`DROP TABLE "offers"`);
    await queryRunner.query(`DROP TYPE "offer_status_enum"`);
  }
}
