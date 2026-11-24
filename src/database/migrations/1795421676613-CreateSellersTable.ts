
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSellersTable1795421676613
  implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "seller_status_enum"
      AS ENUM ('PENDING', 'APPROVED', 'REJECTED')
    `);

    await queryRunner.query(`
      CREATE TABLE "sellers" (
        "seller_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "business_name" varchar(150) NOT NULL,
        "business_description" text,
        "business_email" varchar(150) NOT NULL,
        "business_phone" varchar(20) NOT NULL,
        "business_address" text NOT NULL,
        "status" "seller_status_enum" NOT NULL DEFAULT 'PENDING',
        "reliability_score" decimal(5,2) NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_sellers"
          PRIMARY KEY ("seller_id"),

        CONSTRAINT "UQ_sellers_user_id"
          UNIQUE ("user_id"),

        CONSTRAINT "FK_sellers_user"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("user_id")
          ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "sellers"`);
    await queryRunner.query(`DROP TYPE "seller_status_enum"`);
  }
}
