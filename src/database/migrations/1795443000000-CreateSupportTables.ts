
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSupportTables1795443000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "support_tickets_category_enum"
      AS ENUM (
        'ORDER',
        'PAYMENT',
        'SHIPPING',
        'PRODUCT',
        'ACCOUNT',
        'OTHER'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "support_tickets_priority_enum"
      AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT')
    `);

    await queryRunner.query(`
      CREATE TYPE "support_tickets_status_enum"
      AS ENUM (
        'OPEN',
        'IN_PROGRESS',
        'WAITING_FOR_CUSTOMER',
        'RESOLVED',
        'CLOSED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "support_tickets" (
        "ticket_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "assigned_to_id" uuid,
        "subject" varchar(200) NOT NULL,
        "category" "support_tickets_category_enum"
          NOT NULL DEFAULT 'OTHER',
        "priority" "support_tickets_priority_enum"
          NOT NULL DEFAULT 'NORMAL',
        "status" "support_tickets_status_enum"
          NOT NULL DEFAULT 'OPEN',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_support_tickets"
          PRIMARY KEY ("ticket_id"),
        CONSTRAINT "FK_support_tickets_user"
          FOREIGN KEY ("user_id")
          REFERENCES "users"("user_id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_support_tickets_assigned_user"
          FOREIGN KEY ("assigned_to_id")
          REFERENCES "users"("user_id")
          ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_support_tickets_user_created"
      ON "support_tickets" ("user_id", "created_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_support_tickets_status_priority"
      ON "support_tickets" ("status", "priority")
    `);

    await queryRunner.query(`
      CREATE TABLE "support_messages" (
        "message_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "ticket_id" uuid NOT NULL,
        "sender_id" uuid NOT NULL,
        "message" text NOT NULL,
        "attachment_url" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_support_messages"
          PRIMARY KEY ("message_id"),
        CONSTRAINT "FK_support_messages_ticket"
          FOREIGN KEY ("ticket_id")
          REFERENCES "support_tickets"("ticket_id")
          ON DELETE CASCADE,
        CONSTRAINT "FK_support_messages_sender"
          FOREIGN KEY ("sender_id")
          REFERENCES "users"("user_id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_support_messages_ticket_created"
      ON "support_messages" ("ticket_id", "created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "support_messages"`);
    await queryRunner.query(`DROP TABLE "support_tickets"`);

    await queryRunner.query(`
      DROP TYPE "support_tickets_status_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "support_tickets_priority_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "support_tickets_category_enum"
    `);
  }
}
