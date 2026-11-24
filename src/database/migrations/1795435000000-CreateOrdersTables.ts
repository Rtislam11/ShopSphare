import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOrdersTables1795435000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "order_status_enum" AS ENUM (
        'PENDING',
        'CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "payment_status_enum" AS ENUM (
        'UNPAID',
        'PAID',
        'FAILED',
        'REFUNDED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "order_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "total_amount" numeric(12,2) NOT NULL,
        "status" "order_status_enum" NOT NULL DEFAULT 'PENDING',
        "payment_status" "payment_status_enum" NOT NULL DEFAULT 'UNPAID',
        "shipping_address" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders" PRIMARY KEY ("order_id"),
        CONSTRAINT "FK_orders_user"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("user_id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "order_item_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "seller_id" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "unit_price" numeric(12,2) NOT NULL,
        "subtotal" numeric(12,2) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_order_items" PRIMARY KEY ("order_item_id"),
        CONSTRAINT "CHK_order_items_quantity"
          CHECK ("quantity" > 0),
        CONSTRAINT "FK_order_items_order"
          FOREIGN KEY ("order_id")
          REFERENCES "orders"("order_id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_order_items_product"
          FOREIGN KEY ("product_id")
          REFERENCES "products"("product_id")
          ON DELETE RESTRICT,
        CONSTRAINT "FK_order_items_seller"
          FOREIGN KEY ("seller_id")
          REFERENCES "sellers"("seller_id")
          ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_orders_user_created"
      ON "orders" ("user_id", "created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_order_items_seller"
      ON "order_items" ("seller_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_order_items_seller"
    `);

    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_orders_user_created"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "order_items"
    `);

    await queryRunner.query(`
      DROP TABLE IF EXISTS "orders"
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "payment_status_enum"
    `);

    await queryRunner.query(`
      DROP TYPE IF EXISTS "order_status_enum"
    `);
  }
}