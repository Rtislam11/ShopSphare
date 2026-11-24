
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReturnsTables1795439500000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "returns_status_enum" AS ENUM (
        'REQUESTED',
        'APPROVED',
        'REJECTED',
        'PICKUP_SCHEDULED',
        'RECEIVED',
        'REFUNDED',
        'CANCELLED'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "returns_refund_status_enum" AS ENUM (
        'NOT_APPLICABLE',
        'PENDING',
        'COMPLETED',
        'FAILED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "returns" (
        "return_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "order_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "status" "returns_status_enum" NOT NULL DEFAULT 'REQUESTED',
        "refund_status" "returns_refund_status_enum" NOT NULL DEFAULT 'NOT_APPLICABLE',
        "reason" text NOT NULL,
        "admin_note" text,
        "refund_amount" decimal(12,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_returns" PRIMARY KEY ("return_id"),
        CONSTRAINT "UQ_returns_order_user" UNIQUE ("order_id", "user_id"),
        CONSTRAINT "FK_returns_order" FOREIGN KEY ("order_id")
          REFERENCES "orders"("order_id") ON DELETE CASCADE,
        CONSTRAINT "FK_returns_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("user_id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_returns_user_created"
      ON "returns" ("user_id", "created_at")
    `);

    await queryRunner.query(`
      CREATE TABLE "return_items" (
        "return_item_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "return_id" uuid NOT NULL,
        "order_item_id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "quantity" integer NOT NULL,
        "refund_amount" decimal(12,2) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_return_items" PRIMARY KEY ("return_item_id"),
        CONSTRAINT "FK_return_items_return" FOREIGN KEY ("return_id")
          REFERENCES "returns"("return_id") ON DELETE CASCADE,
        CONSTRAINT "FK_return_items_order_item" FOREIGN KEY ("order_item_id")
          REFERENCES "order_items"("order_item_id") ON DELETE RESTRICT,
        CONSTRAINT "FK_return_items_product" FOREIGN KEY ("product_id")
          REFERENCES "products"("product_id") ON DELETE RESTRICT
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "return_items"`);
    await queryRunner.query(`DROP INDEX "IDX_returns_user_created"`);
    await queryRunner.query(`DROP TABLE "returns"`);
    await queryRunner.query(`DROP TYPE "returns_refund_status_enum"`);
    await queryRunner.query(`DROP TYPE "returns_status_enum"`);
  }
}
