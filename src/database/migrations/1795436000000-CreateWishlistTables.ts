
import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableUnique,
} from 'typeorm';

export class CreateWishlistTables1795436000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wishlists',
        columns: [
          {
            name: 'wishlist_id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      'wishlists',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['user_id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'wishlist_items',
        columns: [
          {
            name: 'wishlist_item_id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          {
            name: 'wishlist_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'product_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'added_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        uniques: [
          new TableUnique({
            name: 'UQ_wishlist_product',
            columnNames: ['wishlist_id', 'product_id'],
          }),
        ],
      }),
    );

    await queryRunner.createForeignKeys('wishlist_items', [
      new TableForeignKey({
        columnNames: ['wishlist_id'],
        referencedTableName: 'wishlists',
        referencedColumnNames: ['wishlist_id'],
        onDelete: 'CASCADE',
      }),
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['product_id'],
        onDelete: 'CASCADE',
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('wishlist_items');
    await queryRunner.dropTable('wishlists');
  }
}
