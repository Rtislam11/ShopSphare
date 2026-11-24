
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductQaTables1795444000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "product_questions_status_enum"
      AS ENUM ('PENDING', 'APPROVED', 'REJECTED')
    `);

    await queryRunner.query(`
      CREATE TABLE "product_questions" (
        "question_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "product_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "question" text NOT NULL,
        "status" "product_questions_status_enum"
          NOT NULL DEFAULT 'APPROVED',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_product_questions"
          PRIMARY KEY ("question_id"),

        CONSTRAINT "FK_product_questions_product"
          FOREIGN KEY ("product_id")
          REFERENCES "products"("product_id")
          ON DELETE CASCADE,

        CONSTRAINT "FK_product_questions_user"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("user_id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_product_questions_product_status_created"
      ON "product_questions" ("product_id", "status", "created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_product_questions_user_created"
      ON "product_questions" ("user_id", "created_at")
    `);

    await queryRunner.query(`
      CREATE TABLE "product_answers" (
        "answer_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "question_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "answer" text NOT NULL,
        "helpful_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),

        CONSTRAINT "PK_product_answers"
          PRIMARY KEY ("answer_id"),

        CONSTRAINT "FK_product_answers_question"
          FOREIGN KEY ("question_id")
          REFERENCES "product_questions"("question_id")
          ON DELETE CASCADE,

        CONSTRAINT "FK_product_answers_user"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("user_id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_product_answers_question_created"
      ON "product_answers" ("question_id", "created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "product_answers"`);
    await queryRunner.query(`DROP TABLE "product_questions"`);

    await queryRunner.query(`
      DROP TYPE "product_questions_status_enum"
    `);
  }
}
