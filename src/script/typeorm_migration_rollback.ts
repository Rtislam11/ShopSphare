
import { dataSourceOptions } from '@/config/database.config';
import { DataSource } from 'typeorm';

const migrateRollback = async (): Promise<void> => {
  const dataSource = new DataSource(dataSourceOptions);

  try {
    console.log('Starting migration rollback...');

    await dataSource.initialize();
    console.log('Database connected successfully.');

    await dataSource.undoLastMigration();

    console.log('Last migration rolled back successfully.');
  } catch (error) {
    console.error('Migration rollback failed:', error);
    process.exitCode = 1;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
};

migrateRollback();
