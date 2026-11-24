
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductsTable1795430298609
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "product_status_enum" AS ENUM (
        'ACTIVE',
        'INACTIVE',
        'DELETED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "products" (
        "product_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "seller_id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "name" varchar(200) NOT NULL,
        "description" text,
        "price" decimal(12,2) NOT NULL,
        "stock_quantity" integer NOT NULL DEFAULT 0,
        "image_url" varchar(500),
        "status" "product_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("product_id"),
        CONSTRAINT "FK_products_seller"
          FOREIGN KEY ("seller_id")
          REFERENCES "sellers"("seller_id")
          ON DELETE RESTRICT,
        CONSTRAINT "FK_products_category"
          FOREIGN KEY ("category_id")
          REFERENCES "categories"("category_id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_products_name" ON "products" ("name")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_products_name"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TYPE "product_status_enum"`);
  }
}
