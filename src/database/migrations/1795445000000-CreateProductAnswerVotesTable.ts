
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateProductAnswerVotesTable1795445000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_answer_votes',
        columns: [
          {
            name: 'vote_id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'answer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        uniques: [
          {
            name: 'UQ_product_answer_votes_answer_user',
            columnNames: ['answer_id', 'user_id'],
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'product_answer_votes',
      new TableForeignKey({
        name: 'FK_product_answer_votes_answer',
        columnNames: ['answer_id'],
        referencedTableName: 'product_answers',
        referencedColumnNames: ['answer_id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'product_answer_votes',
      new TableForeignKey({
        name: 'FK_product_answer_votes_user',
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['user_id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'product_answer_votes',
      new TableIndex({
        name: 'IDX_product_answer_votes_answer',
        columnNames: ['answer_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('product_answer_votes');
  }
}
