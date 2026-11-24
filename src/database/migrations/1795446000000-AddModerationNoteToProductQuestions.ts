
import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
} from 'typeorm';

export class AddModerationNoteToProductQuestions1795446000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'product_questions',
      new TableColumn({
        name: 'moderation_note',
        type: 'varchar',
        length: '500',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn(
      'product_questions',
      'moderation_note',
    );
  }
}
