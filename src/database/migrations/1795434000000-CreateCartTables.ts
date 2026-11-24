import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCartTables1795434000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "carts" (
        "cart_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_carts" PRIMARY KEY ("cart_id"),
        CONSTRAINT "UQ_carts_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_carts_user"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("user_id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "cart_items" (
        "cart_item_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "cart_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "quantity" integer NOT NULL DEFAULT 1,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cart_items" PRIMARY KEY ("cart_item_id"),
        CONSTRAINT "CHK_cart_items_quantity"
          CHECK ("quantity" > 0),
        CONSTRAINT "FK_cart_items_cart"
          FOREIGN KEY ("cart_id")
          REFERENCES "carts"("cart_id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_cart_items_product"
          FOREIGN KEY ("product_id")
          REFERENCES "products"("product_id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_cart_items_cart_product"
      ON "cart_items" ("cart_id", "product_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_cart_items_cart_product"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "cart_items"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "carts"
    `);
  }
}